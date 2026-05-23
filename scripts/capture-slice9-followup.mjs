// Slice 9 followup verification — fireflies wake on each variant's
// actual LED positions.
//
// 6 captures total. 3 variants × 2 presets:
//   looking-up-from-seating  experience mode, firefly=awakening,
//                            timeline skipped to darkness phase, waited
//                            ~18 s so the awakening buildup has filled.
//   topdown                  verification mode, ?grid=off, no firefly
//                            — sanity check against slice 9 step 3.
//
// Output: baselines/<timestamp>-slice9-followup-after-<variant>-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VARIANTS = ['flat', 'oblong', 'mixed']

const PRESETS = [
  {
    view: 'looking-up-from-seating',
    label: 'looking-up-from-seating',
    gridOff: false,
    experience: true,
    firefly: 'awakening',
    skipToFireflies: true,
    settleMs: 18000,
  },
  {
    view: 'ceiling',
    label: 'topdown',
    gridOff: true,
    experience: false,
    firefly: null,
    skipToFireflies: false,
    settleMs: 5000,
  },
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
  const { view, label, gridOff, experience, firefly, skipToFireflies, settleMs } = preset
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${variant}/${label}]`, err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error(`  [console error ${variant}/${label}]`, msg.text())
  })
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  if (experience) params.set('mode', 'experience')
  if (firefly) params.set('firefly', firefly)
  params.set('ceiling', variant)
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  if (skipToFireflies) {
    await page.evaluate(() => window.dispatchEvent(new Event('skipToFireflies')))
  }
  await new Promise((r) => setTimeout(r, settleMs))
  const outPath = join(outDir, `${ts}-slice9-followup-after-${variant}-${label}.png`)
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
