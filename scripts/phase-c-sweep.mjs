#!/usr/bin/env node
// Phase C visual sweep: capture arches / flock / nesting variants in
// their most representative viewpoint, plus a ceiling top-down for
// each, so the designer can scan and react.
//
// Assumes dev server running on http://localhost:5173.

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

const shots = [
  { proposal: 'fireflies-arches',  view: 'arches-walk-through', label: 'arches-walk-through' },
  { proposal: 'fireflies-arches',  view: 'arches-topdown',      label: 'arches-topdown' },
  { proposal: 'fireflies-flock',   view: 'flock-looking-up',    label: 'flock-looking-up' },
  { proposal: 'fireflies-flock',   view: 'flock-side',          label: 'flock-side' },
  { proposal: 'fireflies-nesting', view: 'nesting-between',     label: 'nesting-between' },
  { proposal: 'fireflies-nesting', view: 'nesting-overhead',    label: 'nesting-overhead' },
]

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

  for (const s of shots) {
    const url = `http://localhost:5173/fireflies/${s.proposal}?view=${s.view}`
    console.log('-> ' + url)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForSelector('canvas', { timeout: 15000 })
    await new Promise((r) => setTimeout(r, 2500))
    const outPath = join(outDir, `${ts}-phase-c-${s.label}.png`)
    await page.screenshot({ path: outPath })
    console.log('   wrote ' + outPath)
  }
} finally {
  await browser.close()
}
