#!/usr/bin/env node
// Slice 19 step 3 verification capture: ceiling view, mixed variant,
// after the fov=65 lock.

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })
const outPath = join(outDir, `${ts}-slice19-step3-ceiling-after.png`)

const URL = 'http://localhost:5173/fireflies?view=ceiling&ceiling=mixed'

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080 },
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--ignore-gpu-blocklist', '--enable-webgl',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ],
})

try {
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 2500))
  await page.screenshot({ path: outPath })
  console.log(outPath)
} finally {
  await browser.close()
}
