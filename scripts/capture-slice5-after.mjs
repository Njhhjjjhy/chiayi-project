// Slice 5 verification: capture each loofah variant under five
// standard presets plus, for variant 3, four corner-comparison shots
// from a fixed camera angle.
//
//   variant 1 (flat panel):       5 shots
//   variant 2 (clusters):         5 shots
//   variant 3 (wall + corner):    5 shots at corner=back-left
//                                 + 4 corner-only shots (back-left,
//                                   back-right, front-left, front-right)
//                                   at view=corner-compare
//
// Total 19 screenshots. Output:
//   baselines/<timestamp>-slice5-after-variant-<1|2|3>-<preset>.png
//   baselines/<timestamp>-slice5-after-variant-3-corner-<position>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const STANDARD_VIEWS = [
  { view: 'standing', label: 'standing',      gridOff: false },
  { view: 'entrance', label: 'entrance-wall', gridOff: false },
  { view: 'back',     label: 'back-wall',     gridOff: false },
  { view: 'ceiling',  label: 'topdown',       gridOff: true  },
  { view: 'front',    label: 'front',         gridOff: false },
]

const CORNERS = ['back-left', 'back-right', 'front-left', 'front-right']

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--ignore-gpu-blocklist', '--enable-webgl',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ],
})

async function snap(url, outPath) {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error]`, err.message))
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

async function captureStandard(variantUrl, variantLabel) {
  for (const v of STANDARD_VIEWS) {
    const params = new URLSearchParams()
    params.set('view', v.view)
    params.set('loofah', variantUrl)
    if (variantUrl === 'variant3') params.set('corner', 'back-left')
    if (v.gridOff) params.set('grid', 'off')
    const url = `http://localhost:5173/fireflies?${params.toString()}`
    const outPath = join(outDir, `${ts}-slice5-after-variant-${variantLabel}-${v.label}.png`)
    await snap(url, outPath)
  }
}

async function captureCornerCompare() {
  for (const corner of CORNERS) {
    const params = new URLSearchParams()
    params.set('view', 'corner-compare')
    params.set('loofah', 'variant3')
    params.set('corner', corner)
    const url = `http://localhost:5173/fireflies?${params.toString()}`
    const outPath = join(outDir, `${ts}-slice5-after-variant-3-corner-${corner}.png`)
    await snap(url, outPath)
  }
}

try {
  await captureStandard('variant1', '1')
  await captureStandard('variant2', '2')
  await captureStandard('variant3', '3')
  await captureCornerCompare()
} finally {
  await browser.close()
}
