// Slice 9 verification — ceiling form vocabulary comparison.
// Three variants ('flat' | 'oblong' | 'mixed') × 6 presets = 18 PNGs.
//
// Presets per variant:
//   4 standard (verification mode, ambient 2.4):
//     standing, entrance-wall, back-wall, topdown (?grid=off)
//   2 diagnostics (experience mode, ambient 0.01):
//     looking-up-from-seating, ceiling-led-density
//
// Output:
//   baselines/<timestamp>-slice9-after-<variant>-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VARIANTS = ['flat', 'oblong', 'mixed']

const PRESETS = [
  { view: 'standing',                 label: 'standing',                 gridOff: false, experience: false },
  { view: 'entrance',                 label: 'entrance-wall',            gridOff: false, experience: false },
  { view: 'back',                     label: 'back-wall',                gridOff: false, experience: false },
  { view: 'ceiling',                  label: 'topdown',                  gridOff: true,  experience: false },
  { view: 'looking-up-from-seating',  label: 'looking-up-from-seating',  gridOff: false, experience: true  },
  { view: 'ceiling-led-density',      label: 'ceiling-led-density',      gridOff: true,  experience: true  },
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
  const { view, label, gridOff, experience } = preset
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${variant}/${label}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  if (experience) params.set('mode', 'experience')
  params.set('ceiling', variant)
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-slice9-after-${variant}-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const variant of VARIANTS) {
    for (const preset of PRESETS) {
      await capture({ variant, preset })
    }
  }
} finally {
  await browser.close()
}
