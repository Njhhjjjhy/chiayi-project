// Slice 17 verification — wall glow dots on 8 surfaces.
// 4 standard presets + 4 slice-17-specific views = 8 PNGs.
//
// Standard (verification mode, ambient 2.4, default timeline t = 0):
//   standing, entrance-wall, back-wall, topdown (?grid=off)
//
// Slice 17 specific:
//   back-wall-band       — back preset, full back-wall dot band
//   front-wall-exclude   — front preset, front-wall minus loofah region
//   topdown-dots         — ceiling preset with grid off, dots on all surfaces
//   walldots-closerange  — 1.2 m from back-wall, mid-band height
//
// Output:
//   baselines/<timestamp>-slice17-after-<label>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const PRESETS = [
  // Standard 4
  { view: 'standing', label: 'standing',      gridOff: false },
  { view: 'entrance', label: 'entrance-wall', gridOff: false },
  { view: 'back',     label: 'back-wall',     gridOff: false },
  { view: 'ceiling',  label: 'topdown',       gridOff: true  },
  // Slice 17 specific
  { view: 'back',                label: 'back-wall-band',      gridOff: false },
  { view: 'front',              label: 'front-wall-exclude',   gridOff: false },
  { view: 'ceiling',            label: 'topdown-dots',         gridOff: true  },
  { view: 'walldots-closerange', label: 'walldots-closerange', gridOff: false },
]

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--ignore-gpu-blocklist', '--enable-webgl',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ],
})

async function capture(preset) {
  const { view, label, gridOff } = preset
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${label}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 4000))
  const outPath = join(outDir, `${ts}-slice17-after-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const preset of PRESETS) {
    await capture(preset)
  }
} finally {
  await browser.close()
}
