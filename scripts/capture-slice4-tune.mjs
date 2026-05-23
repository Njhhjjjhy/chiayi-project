// Slice 4 tuning-pass captures. One variant per invocation. Pass the
// variant id (A / B / C) as the first CLI arg.
//
//   node scripts/capture-slice4-tune.mjs A     // strip
//   node scripts/capture-slice4-tune.mjs B     // rope
//   node scripts/capture-slice4-tune.mjs C     // pools
//
// Variant C's topdown shot appends `?grid=off` so the verification
// gridHelper doesn't overpaint the floor pools.
//
// Output filenames: <timestamp>-slice4-tune1-variant-<A|B|C>-<preset>.png

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const variantArg = process.argv[2]
const WAYFIND_FOR = { A: 'strip', B: 'rope', C: 'pools' }
const wayfind = WAYFIND_FOR[variantArg]
if (!wayfind) {
  console.error('usage: node scripts/capture-slice4-tune.mjs <A|B|C>')
  process.exit(1)
}

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

const VIEWS = [
  { view: 'standing', label: 'standing' },
  { view: 'entrance', label: 'entrance-wall' },
  { view: 'back', label: 'back-wall' },
  { view: 'ceiling', label: 'topdown' },
  { view: 'standing', label: 'diagnostic-pathway' },
]

// Variant C only: suppress gridHelper in the topdown shot via ?grid=off
function gridOffFor(label) {
  return variantArg === 'C' && label === 'topdown'
}

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--ignore-gpu-blocklist', '--enable-webgl',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ],
})

async function capture(view, label) {
  const page = await browser.newPage()
  page.on('pageerror', (err) =>
    console.error(`  [page error ${variantArg}/${label}]`, err.message),
  )
  const gridParam = gridOffFor(label) ? '&grid=off' : ''
  const url = `http://localhost:5173/fireflies?view=${view}&wayfind=${wayfind}${gridParam}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(
    outDir,
    `${ts}-slice4-tune1-variant-${variantArg}-${label}.png`,
  )
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  for (const v of VIEWS) {
    await capture(v.view, v.label)
  }
} finally {
  await browser.close()
}
