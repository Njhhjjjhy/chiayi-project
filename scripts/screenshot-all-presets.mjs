#!/usr/bin/env node
// Capture one screenshot per camera preset in construction view.
// Saves to baselines/<timestamp>-preset-<key>.png.
// Assumes the dev server is already running on http://localhost:5173.

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const PRESETS = [
  { key: 'ceiling',  label: 'Ceiling' },
  { key: 'front',    label: 'Front wall' },
  { key: 'back',     label: 'Back wall' },
  { key: 'window',   label: 'Window wall' },
  { key: 'entrance', label: 'Entrance wall' },
  { key: 'standing', label: 'Standing' },
]

const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
const outDir = join(ROOT, 'baselines')
await fs.mkdir(outDir, { recursive: true })

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
  await page.goto('http://localhost:5173/3d', { waitUntil: 'networkidle0', timeout: 30000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 2000))

  // Switch to Construction view mode once.
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const target = buttons.find((b) => b.textContent.trim() === 'Construction')
    if (!target) throw new Error('Construction view mode button not found')
    target.click()
  })
  await new Promise((r) => setTimeout(r, 800))

  // Hide UI overlays.
  await page.keyboard.press('h')
  await new Promise((r) => setTimeout(r, 300))

  for (const { key, label } of PRESETS) {
    // Show UI temporarily so we can click the preset button.
    await page.keyboard.press('h')
    await new Promise((r) => setTimeout(r, 300))

    await page.evaluate((label) => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const target = buttons.find((b) => b.textContent.trim() === label)
      if (!target) throw new Error(`'${label}' preset button not found`)
      target.click()
    }, label)
    await new Promise((r) => setTimeout(r, 600))

    // Hide UI again for the screenshot.
    await page.keyboard.press('h')
    await new Promise((r) => setTimeout(r, 1200))

    const filename = `${ts}-preset-${key}.png`
    const filepath = join(outDir, filename)
    const dataUrl = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      return canvas ? canvas.toDataURL('image/png') : null
    })
    if (!dataUrl) throw new Error('canvas not found for toDataURL')
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    await fs.writeFile(filepath, Buffer.from(base64, 'base64'))
    console.log(`wrote ${filepath}`)
  }
} finally {
  await browser.close()
}
