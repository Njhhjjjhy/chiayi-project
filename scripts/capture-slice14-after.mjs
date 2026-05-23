// Slice 14 verification — loofah geometry and texture.
// 4 standard + 1 close-range presets × 3 loofah variants + 1 overview = 16 PNGs.
//
// Presets (verification mode, ambient 2.4):
//   standing, entrance-wall, back-wall, topdown (?grid=off), loofah-close-range
// For variant3 we additionally capture loofah-overview so the wall + back-left
// corner column read together in one frame.
//
// Output:
//   baselines/<timestamp>-slice14-after-<variant>-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VARIANTS = ['variant1', 'variant2', 'variant3']

const STANDARD_PRESETS = [
  { view: 'standing',            label: 'standing',            gridOff: false },
  { view: 'entrance',            label: 'entrance-wall',       gridOff: false },
  { view: 'back',                label: 'back-wall',           gridOff: false },
  { view: 'ceiling',             label: 'topdown',             gridOff: true  },
  { view: 'loofah-close-range',  label: 'loofah-close-range',  gridOff: false },
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

async function capture({ variant, preset }) {
  const { view, label, gridOff } = preset
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${variant}/${label}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  params.set('loofah', variant)
  if (variant === 'variant3') params.set('corner', 'back-left')
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-slice14-after-${variant}-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const variant of VARIANTS) {
    for (const preset of STANDARD_PRESETS) {
      await capture({ variant, preset })
    }
  }
  // Extra overview for variant3 — wall + corner column in one frame.
  await capture({
    variant: 'variant3',
    preset: { view: 'loofah-overview', label: 'loofah-overview', gridOff: false },
  })
} finally {
  await browser.close()
}
