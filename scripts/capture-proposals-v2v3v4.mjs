import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

const VARIANTS = [
  'fireflies-suspended-sky',
  'fireflies-within-reach',
  'fireflies-arches',
  'fireflies-flock',
  'fireflies-nesting',
]

const PRESETS = [
  { label: 'standing',      params: '?view=standing',              settle: 5000 },
  { label: 'entrance-wall', params: '?view=entrance',              settle: 5000 },
  { label: 'back-wall',     params: '?view=back',                  settle: 5000 },
  { label: 'topdown',       params: '?view=ceiling&grid=off',      settle: 5000 },
]

const VARIANT_PRESETS = {
  'fireflies-arches': [
    { label: 'arches-walk-through', params: '?view=arches-walk-through&mode=experience', settle: 8000 },
    { label: 'arches-topdown',      params: '?view=arches-topdown&mode=experience',      settle: 8000 },
  ],
  'fireflies-flock': [
    { label: 'flock-looking-up', params: '?view=flock-looking-up&mode=experience', settle: 8000 },
    { label: 'flock-side',       params: '?view=flock-side&mode=experience',       settle: 8000 },
  ],
  'fireflies-nesting': [
    { label: 'nesting-between',  params: '?view=nesting-between&mode=experience',  settle: 8000 },
    { label: 'nesting-overhead', params: '?view=nesting-overhead&mode=experience', settle: 8000 },
  ],
}

async function capture(browser, { variant, preset }) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  const url = `http://localhost:5173/fireflies/${variant}${preset.params}`
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, preset.settle))
  const out = join(ROOT, 'baselines', `${ts}-proposals-v2v3v4-${variant}-${preset.label}.png`)
  await page.screenshot({ path: out, fullPage: false })
  await page.close()
  console.log(`  done ${variant} / ${preset.label}`)
}

;(async () => {
  await fs.mkdir(join(ROOT, 'baselines'), { recursive: true })
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader'],
  })
  try {
    for (const variant of VARIANTS) {
      for (const preset of PRESETS) {
        await capture(browser, { variant, preset })
      }
      const extras = VARIANT_PRESETS[variant]
      if (extras) {
        for (const preset of extras) {
          await capture(browser, { variant, preset })
        }
      }
    }
  } finally {
    await browser.close()
  }
  console.log(`\nDone. Baselines at baselines/${ts}-proposals-v2v3v4-*.png`)
})()
