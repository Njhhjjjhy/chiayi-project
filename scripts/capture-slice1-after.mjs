// Capture top-down (?view=ceiling) and standing (?view=standing) screenshots
// of /fireflies, saving to baselines/<timestamp>-slice1-after-<label>.png.
//
// Uses page.screenshot() rather than canvas.toDataURL() because the
// R3F Canvas does not preserveDrawingBuffer.

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { join } from 'path'

const ROOT = '/Users/riaan/Documents/Design Files/Code Projects/chiayi-project'
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')

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
  page.on('pageerror', (err) => console.error(`  [page error in ${label}]`, err.message))
  const url = `http://localhost:5173/fireflies?view=${view}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  // Settle: post-fx, camera, autotune (swiftshader is slow).
  await new Promise((r) => setTimeout(r, 5000))
  const outPath = join(outDir, `${ts}-slice1-after-${label}.png`)
  await page.screenshot({ path: outPath, type: 'png', fullPage: false })
  console.log(`wrote ${outPath}`)
  await page.close()
}

try {
  await capture('ceiling', 'topdown')
  await capture('standing', 'standing')
} finally {
  await browser.close()
}
