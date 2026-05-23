// Slice 16 verification — visible spotlight cones + floor pools.
// 4 standard presets at default timeline + 3 timeline-sweep captures
// at t = 0.3 / 0.5 / 0.8 across 2 spot-revealing presets = 10 PNGs.
//
// Standard (verification mode, ambient 2.4, default timeline t = 0):
//   standing, entrance-wall, back-wall, topdown (?grid=off)
//
// Timeline-sweep presets (verification mode, dispatched setTimelineTime
// event sets the requested time and pauses the timeline):
//   topdown                  — all 3 zones in one frame
//   seating-spotlight-pool   — oblique on zone 2 with floor + ceiling
//                              visible so cone + pool both read
//
// Output:
//   baselines/<timestamp>-slice16-after-<context>-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const STANDARD_PRESETS = [
  { view: 'standing', label: 'standing',      gridOff: false },
  { view: 'entrance', label: 'entrance-wall', gridOff: false },
  { view: 'back',     label: 'back-wall',     gridOff: false },
  { view: 'ceiling',  label: 'topdown',       gridOff: true  },
]

const SWEEP_PRESETS = [
  { view: 'ceiling',                 label: 'topdown',                gridOff: true  },
  { view: 'seating-spotlight-pool',  label: 'seating-spotlight-pool', gridOff: false },
]

const SWEEP_TIMES = [0.3, 0.5, 0.8]

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--ignore-gpu-blocklist', '--enable-webgl',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ],
})

async function loadPage({ view, gridOff }) {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error(`  [page error ${view}]`, err.message))
  const params = new URLSearchParams({ view })
  if (gridOff) params.set('grid', 'off')
  const url = `http://localhost:5173/fireflies?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 3000))
  return page
}

async function captureStandard(preset) {
  const { label } = preset
  const page = await loadPage(preset)
  await new Promise((r) => setTimeout(r, 2000))
  const outPath = join(outDir, `${ts}-slice16-after-default-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

async function captureSweep(preset, time) {
  const { label } = preset
  const page = await loadPage(preset)
  await page.evaluate((t) => {
    window.dispatchEvent(new CustomEvent('setTimelineTime', { detail: { time: t } }))
  }, time)
  // give React + r3f a beat to re-render the spot intensity + opacity
  await new Promise((r) => setTimeout(r, 2000))
  const tStr = time.toFixed(2).replace('.', '')
  const outPath = join(outDir, `${ts}-slice16-after-t${tStr}-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const preset of STANDARD_PRESETS) {
    await captureStandard(preset)
  }
  for (const time of SWEEP_TIMES) {
    for (const preset of SWEEP_PRESETS) {
      await captureSweep(preset, time)
    }
  }
} finally {
  await browser.close()
}
