#!/usr/bin/env node
// Gate-screenshot capture for the proposals review tool.
//
// Usage: node scripts/capture-phase.mjs <phaseNumber>
//
// Starts a local dev server, launches headless Chromium via Puppeteer,
// enumerates the built proposal variants and camera presets from the
// live registry (exposed on window.__proposalVariants and
// window.__proposalPresets when ?capture=1 is set), then iterates
// variants × presets × [blue hour, darkness] and writes PNGs to
// public/proposals/screenshots/phase-N/{variantId}-{preset}-{timeLabel}.png.
//
// The ?capture=1 URL flag hides every UI overlay so screenshots show the
// scene only. window.__captureReady flips true ~1.5 s of R3F clock time
// after mount, giving the firefly fade-in time to settle into a
// representative pattern before the frame is grabbed.

import puppeteer from 'puppeteer'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const phase = parseInt(process.argv[2], 10)
if (!Number.isFinite(phase) || phase < 1) {
  console.error('Usage: node scripts/capture-phase.mjs <phaseNumber>')
  process.exit(1)
}

// Blue-hour = 0.60 (middle of PALETTE's 0.5–0.75 blue phase; panels
// read as lit but fireflies are still below the 0.75 threshold, so
// this shot shows treatment-only).
// Darkness = 0.92 (deep in the darkness palette; panels go dark and
// fireflies render at full masterOpacity).
const TIMES = [
  { label: 'blue', value: 0.60 },
  { label: 'darkness', value: 0.92 },
]

const PORT = 5173
const BASE_URL = `http://localhost:${PORT}`
const VIEWPORT = { width: 1920, height: 1080 }
const READY_TIMEOUT = 30000

function log(...args) {
  console.log('[capture]', ...args)
}

// --- Dev server lifecycle ---

async function startDevServer() {
  log('starting vite…')
  const proc = spawn(
    'pnpm',
    ['exec', 'vite', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  )

  let ready = false
  await new Promise((resolvePromise, rejectPromise) => {
    const timeout = setTimeout(
      () => rejectPromise(new Error(`vite did not start within 90s`)),
      90000,
    )
    const onChunk = (chunk) => {
      const s = chunk.toString()
      process.stdout.write(`  [vite] ${s}`)
      if (!ready && (s.includes('Local:') || s.includes('ready in'))) {
        ready = true
        clearTimeout(timeout)
        resolvePromise()
      }
    }
    proc.stdout.on('data', onChunk)
    proc.stderr.on('data', (chunk) => process.stderr.write(`  [vite] ${chunk}`))
    proc.on('error', rejectPromise)
    proc.on('exit', (code) => {
      if (!ready) {
        clearTimeout(timeout)
        rejectPromise(new Error(`vite exited with code ${code}`))
      }
    })
  })
  // Small grace period past "ready in ..."
  await new Promise((r) => setTimeout(r, 500))
  return proc
}

function stopDevServer(proc) {
  if (!proc || proc.killed) return
  proc.kill('SIGTERM')
  return new Promise((r) => {
    const t = setTimeout(() => {
      if (!proc.killed) proc.kill('SIGKILL')
      r()
    }, 1500)
    proc.on('exit', () => {
      clearTimeout(t)
      r()
    })
  })
}

// --- Capture ---

async function run() {
  const devServer = await startDevServer()

  try {
    log('launching puppeteer…')
    // Software WebGL via ANGLE+SwiftShader so headless rendering works
    // without depending on the host GPU compositor. Slower than real
    // GPU rendering, but deterministic and avoids the blank-canvas
    // failure mode on headless macOS.
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: VIEWPORT,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-gpu-blocklist',
        '--enable-webgl',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
      ],
    })
    const page = await browser.newPage()

    page.on('pageerror', (err) => console.error('  [page error]', err.message))
    page.on('console', (msg) => {
      const type = msg.type()
      console.log(`  [page ${type}]`, msg.text())
    })
    page.on('response', (res) => {
      const status = res.status()
      if (status >= 400) console.log(`  [page ${status}]`, res.url())
    })
    page.on('requestfailed', (req) => {
      console.log(`  [page failed]`, req.url(), req.failure()?.errorText)
    })

    // First navigation: enumerate the registry from the live app.
    log('enumerating registry…')
    await page.goto(
      `${BASE_URL}/proposals/null?capture=1&preset=midRoomStanding&time=0.60`,
      { waitUntil: 'networkidle0' },
    )
    await page.waitForFunction(
      () => window.__captureReady === true,
      { timeout: READY_TIMEOUT },
    )
    const variants = await page.evaluate(() => window.__proposalVariants || [])
    const presets = await page.evaluate(() => window.__proposalPresets || [])
    const built = variants.filter((v) => v.built)
    log(`variants total=${variants.length} built=${built.length} (${built.map((v) => v.id).join(', ')})`)
    log(`presets=${presets.join(', ')}`)

    if (built.length === 0) throw new Error('no built variants exposed on window.__proposalVariants')
    if (presets.length === 0) throw new Error('no presets exposed on window.__proposalPresets')

    const outDir = join(ROOT, `public/proposals/screenshots/phase-${phase}`)
    await fs.mkdir(outDir, { recursive: true })

    const total = built.length * presets.length * TIMES.length
    let captured = 0
    for (const v of built) {
      for (const preset of presets) {
        for (const t of TIMES) {
          const url = `${BASE_URL}/proposals/${v.id}?capture=1&preset=${preset}&time=${t.value}`
          await page.goto(url, { waitUntil: 'networkidle0' })
          await page.waitForFunction(
            () => window.__captureReady === true,
            { timeout: READY_TIMEOUT, polling: 100 },
          )
          // Diagnostic: count non-black pixels in the canvas. A zero
          // count means WebGL isn't rendering into the captured buffer
          // even though the page loaded and __captureReady fired.
          const stats = await page.evaluate(() => {
            const canvas = document.querySelector('canvas')
            if (!canvas) return { found: false }
            const gl =
              canvas.getContext('webgl2', { preserveDrawingBuffer: true }) ||
              canvas.getContext('webgl', { preserveDrawingBuffer: true })
            if (!gl) return { found: true, hasGL: false }
            const w = canvas.width, h = canvas.height
            const sx = Math.floor(w / 4), sy = Math.floor(h / 4)
            const sw = Math.floor(w / 2), sh = Math.floor(h / 2)
            const pixels = new Uint8Array(sw * sh * 4)
            gl.readPixels(sx, sy, sw, sh, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
            let nonBlack = 0
            let maxR = 0, maxG = 0, maxB = 0
            for (let i = 0; i < pixels.length; i += 4) {
              const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
              if (r > 2 || g > 2 || b > 2) nonBlack++
              if (r > maxR) maxR = r
              if (g > maxG) maxG = g
              if (b > maxB) maxB = b
            }
            return {
              found: true, hasGL: true, width: w, height: h,
              sampled: sw * sh, nonBlack, maxR, maxG, maxB,
            }
          })

          const filename = `${v.id}-${preset}-${t.label}.png`
          const filepath = join(outDir, filename)

          // Capture directly from the WebGL canvas. This goes through
          // the canvas API's preserved drawing buffer, which is a
          // different path from page.screenshot (and works when the
          // compositor path doesn't).
          const dataUrl = await page.evaluate(() => {
            const canvas = document.querySelector('canvas')
            if (!canvas) return null
            return canvas.toDataURL('image/png')
          })
          if (!dataUrl) throw new Error('canvas not found for toDataURL')
          const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
          await fs.writeFile(filepath, Buffer.from(base64, 'base64'))

          captured++
          const diag = await page.evaluate(() => window.__captureDiag || null)
          log(`${captured}/${total} ${filename}  canvas=${stats.width}x${stats.height} nonBlack=${stats.nonBlack}/${stats.sampled} max=rgb(${stats.maxR},${stats.maxG},${stats.maxB}) diag=${JSON.stringify(diag)}`)
        }
      }
    }

    await browser.close()
    log(`wrote ${captured} files to public/proposals/screenshots/phase-${phase}/`)
  } finally {
    log('stopping dev server…')
    await stopDevServer(devServer)
  }
}

try {
  await run()
} catch (err) {
  console.error('[capture] failed:', err.message || err)
  process.exit(1)
}
