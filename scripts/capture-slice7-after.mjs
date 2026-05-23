// Slice 7 verification: sculptural ceiling + 1,760 LED redistribution.
// Four standard presets plus two diagnostics.
//
// Output:
//   baselines/<timestamp>-slice7-after-<preset>.png
//
// Diagnostics:
//   looking-up-from-seating — seated head height in zone 2 looking up,
//                              captured in verification mode so the form
//                              silhouettes read overhead.
//   ceiling-led-density     — high-altitude topdown in experience mode
//                              so the 1,760 LED population reads against
//                              dark, testing distribution + bloom.

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VIEWS = [
  { view: 'standing',                 label: 'standing',                 gridOff: false, experience: false },
  { view: 'entrance',                 label: 'entrance-wall',            gridOff: false, experience: false },
  { view: 'back',                     label: 'back-wall',                gridOff: false, experience: false },
  { view: 'ceiling',                  label: 'topdown',                  gridOff: true,  experience: false },
  { view: 'looking-up-from-seating',  label: 'looking-up-from-seating',  gridOff: false, experience: false },
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

async function capture({ view, label, gridOff, experience }) {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${label}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  if (experience) params.set('mode', 'experience')
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-slice7-after-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const v of VIEWS) await capture(v)
} finally {
  await browser.close()
}
