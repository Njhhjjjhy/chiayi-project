#!/usr/bin/env node
// One-off baseline screenshot: top-down view of the /3d preview.
// Saves to baselines/<timestamp>-topdown.png at the repo root.
//
// Assumes the dev server is already running on http://localhost:5173.
// Usage: node scripts/baseline-screenshot.mjs [label]

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const label = process.argv[2] || 'topdown'
const useConstruction = process.argv.includes('--construction')
const presetIdx = process.argv.indexOf('--preset')
const presetLabel = presetIdx >= 0 ? process.argv[presetIdx + 1] : 'Ceiling'
const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })
const outPath = join(outDir, `${ts}-${label}.png`)

const URL = 'http://localhost:5173/3d'

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

  // Wait for the canvas to mount + scene to settle.
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 2000))

  // Optionally switch to construction view mode first.
  if (useConstruction) {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const target = buttons.find((b) => b.textContent.trim() === 'Construction')
      if (!target) throw new Error('Construction view mode button not found')
      target.click()
    })
    await new Promise((r) => setTimeout(r, 800))
  }

  // Click the requested camera preset.
  await page.evaluate((label) => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const target = buttons.find((b) => b.textContent.trim() === label)
    if (!target) throw new Error(`'${label}' preset button not found`)
    target.click()
  }, presetLabel)

  // Hide the UI overlays (press H).
  await page.keyboard.press('h')

  // Let the camera transition + render settle.
  await new Promise((r) => setTimeout(r, 1500))

  const dataUrl = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    return canvas ? canvas.toDataURL('image/png') : null
  })
  if (!dataUrl) throw new Error('canvas not found for toDataURL')
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  await fs.writeFile(outPath, Buffer.from(base64, 'base64'))
  console.log(`wrote ${outPath}`)
} finally {
  await browser.close()
}
