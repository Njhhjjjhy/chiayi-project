// Before-baselines for slice 5 (loofah wall variants). Captures the
// four standard presets plus the `front` preset (which directly views
// the front-wall where the loofah lives).
//
// Output: baselines/<timestamp>-slice5-before-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VIEWS = [
  { view: 'standing', label: 'standing' },
  { view: 'entrance', label: 'entrance-wall' },
  { view: 'back',     label: 'back-wall' },
  { view: 'ceiling',  label: 'topdown' },
  { view: 'front',    label: 'front-wall' },
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

async function capture({ view, label }) {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${label}]`, err.message))
  const url = `http://localhost:5173/fireflies?view=${view}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-slice5-before-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const v of VIEWS) await capture(v)
} finally {
  await browser.close()
}
