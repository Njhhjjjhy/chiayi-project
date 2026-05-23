// Slice 4 verification: capture each wayfinding variant (strip, rope,
// pools) under five viewing conditions — the four standard presets
// plus one pathway-favouring diagnostic that shows the L corner.
//
// Output:
//   baselines/<timestamp>-slice4-after-variant-<A|B|C>-<preset>.png
//   baselines/<timestamp>-slice4-after-variant-<A|B|C>-diagnostic-pathway.png
//
// Variant ID mapping:
//   A = strip, B = rope, C = pools (matches slice 4 prompt's labels).

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VARIANTS = [
  { id: 'A', wayfind: 'strip' },
  { id: 'B', wayfind: 'rope' },
  { id: 'C', wayfind: 'pools' },
]

// Four standard presets + one pathway-favouring diagnostic. For the
// diagnostic we use the 'standing' preset (visitor-eye POV down the
// vertical pathway leg) — it gives a clear view along the pathway with
// the L corner visible in the distance, without requiring temporary
// FirefliesPage edits.
const VIEWS = [
  { view: 'standing', label: 'standing' },
  { view: 'entrance', label: 'entrance-wall' },
  { view: 'back', label: 'back-wall' },
  { view: 'ceiling', label: 'topdown' },
  { view: 'standing', label: 'diagnostic-pathway' },
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

async function capture(variantId, wayfind, view, label) {
  const page = await browser.newPage()
  page.on('pageerror', (err) =>
    console.error(`  [page error ${variantId}/${label}]`, err.message),
  )
  const url = `http://localhost:5173/fireflies?view=${view}&wayfind=${wayfind}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(
    outDir,
    `${ts}-slice4-after-variant-${variantId}-${label}.png`,
  )
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const v of VARIANTS) {
    for (const view of VIEWS) {
      await capture(v.id, v.wayfind, view.view, view.label)
    }
  }
} finally {
  await browser.close()
}
