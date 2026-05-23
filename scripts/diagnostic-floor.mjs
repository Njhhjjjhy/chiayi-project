// Diagnostic capture: floor-focused, gridHelper off, ambient lighting on.
// Reusable for any floor-level change.
//
// CANONICAL CAMERA (apply as temporary edits inside FirefliesPage.jsx
// for the duration of a diagnostic run, then revert via git checkout):
//   Canvas camera.position : [4.4, 2.5, 6.0]
//   OrbitControls target   : [4.4, 0, 4.4]
//   gridHelper             : disabled
//
// This is ~40° from vertical — well clear of the degenerate straight-
// down case. DO NOT use a straight-down camera (position directly
// above the target with matching X and Z): the look direction becomes
// parallel to the world up vector, lookAt produces a degenerate basis,
// and any orthogonal floor pattern renders as a 45°-rotated diamond
// pattern that is a CAMERA ARTEFACT, not a real texture problem. The
// v2 capture during slice 3 hit exactly this trap.
//
// Pass a label as the first CLI arg to tag the output filename, e.g.
//   node scripts/diagnostic-floor.mjs slice3-after-diagnostic-floor-v3
// Defaults to "diagnostic-floor".
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const label = process.argv[2] ?? 'diagnostic-floor'
const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--ignore-gpu-blocklist', '--enable-webgl',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ],
})

try {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  // No ?view — let it use the default (standing) which doesn't matter
  // because FirefliesPage.jsx is hardcoded to the diagnostic camera.
  const url = `http://localhost:5173/fireflies`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
} finally {
  await browser.close()
}
