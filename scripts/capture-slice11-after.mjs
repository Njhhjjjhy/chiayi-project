// Slice 11 verification — foam-mat floor baseline (capture-only).
//
// No code or doc changes — slice 3 already migrated the floor to foam
// mat and both canonical docs were already updated. This is a fresh
// baseline of the current state.
//
// 5 captures: 4 standard verification-mode + 1 experience-mode
// diagnostic confirming the matte floor doesn't compromise the firefly
// canopy at seated POV.
//
// Output: baselines/<timestamp>-slice11-after-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const PRESETS = [
  { view: 'standing', label: 'standing', gridOff: false, experience: false, firefly: null, skipToFireflies: false, settleMs: 5000 },
  { view: 'entrance', label: 'entrance-wall', gridOff: false, experience: false, firefly: null, skipToFireflies: false, settleMs: 5000 },
  { view: 'back',     label: 'back-wall',     gridOff: false, experience: false, firefly: null, skipToFireflies: false, settleMs: 5000 },
  { view: 'ceiling',  label: 'topdown',       gridOff: true,  experience: false, firefly: null, skipToFireflies: false, settleMs: 5000 },
  {
    view: 'looking-up-from-seating',
    label: 'looking-up-from-seating',
    gridOff: false,
    experience: true,
    firefly: 'awakening',
    skipToFireflies: true,
    settleMs: 18000,
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

async function capture(preset) {
  const { view, label, gridOff, experience, firefly, skipToFireflies, settleMs } = preset
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${label}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  if (experience) params.set('mode', 'experience')
  if (firefly) params.set('firefly', firefly)
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  if (skipToFireflies) {
    await page.evaluate(() => window.dispatchEvent(new Event('skipToFireflies')))
  }
  await new Promise((r) => setTimeout(r, settleMs))
  const outPath = join(outDir, `${ts}-slice11-after-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const p of PRESETS) await capture(p)
} finally {
  await browser.close()
}
