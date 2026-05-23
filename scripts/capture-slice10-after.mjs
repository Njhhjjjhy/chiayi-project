// Slice 10 verification — entrance and exit curtains.
// Four standard presets in verification mode.
//
// Output: baselines/<timestamp>-slice10-after-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VIEWS = [
  { view: 'standing', label: 'standing', gridOff: false },
  { view: 'entrance', label: 'entrance-wall', gridOff: false },
  { view: 'back',     label: 'back-wall',     gridOff: false },
  { view: 'ceiling',  label: 'topdown',       gridOff: true  },
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

async function capture({ view, label, gridOff }) {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${label}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-slice10-after-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const v of VIEWS) await capture(v)
} finally {
  await browser.close()
}
