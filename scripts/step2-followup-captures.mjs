#!/usr/bin/env node
// Step 2 follow-up design review captures. Four PNGs, all in
// experience mode. Saves to baselines/ with the standard naming.

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
  {
    label: 'step2-grove-eye-level-twilight',
    url: 'http://localhost:5173/fireflies/fireflies-grove?mode=experience&timeline=0.6&campos=5.0,1.6,3.5&camtarget=5.0,1.5,0.5',
    note: 'grove forest at eye-level (campos 5.0,1.6,3.5; target 5.0,1.5,0.5)',
  },
  {
    label: 'step2-lantern-eye-level-twilight',
    url: 'http://localhost:5173/fireflies/fireflies-lanterns?mode=experience&timeline=0.6&campos=4.0,1.6,3.5&camtarget=8.5,1.5,3.5',
    note: 'lantern pillars between camera and loofah wall (campos 4.0,1.6,3.5; target 8.5,1.5,3.5)',
  },
  {
    label: 'step2-nesting-hybrid-between-twilight',
    url: 'http://localhost:5173/fireflies/fireflies-nesting?mode=experience&timeline=0.6&view=nesting-between',
    note: 'nesting hybrid bolster LEDs between the two bolster clusters at twilight',
  },
  {
    label: 'step2-nesting-hybrid-topdown-bluehour',
    url: 'http://localhost:5173/fireflies/fireflies-nesting?mode=experience&timeline=0.78&view=nesting-overhead',
    note: 'nesting hybrid topdown at blue hour to reveal any ceiling-truncation clustering',
  },
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
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[grove]') || text.includes('[lantern]') ||
        text.includes('[nesting-hybrid]') || text.includes('[camera]')) {
      console.log(`  [page console] ${text}`)
    }
  })

  for (const s of shots) {
    console.log('-> ' + s.url)
    await page.goto(s.url, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForSelector('canvas', { timeout: 15000 })
    await new Promise((r) => setTimeout(r, 3000))
    const outPath = join(outDir, `${ts}-${s.label}.png`)
    await page.screenshot({ path: outPath })
    console.log(`   wrote ${outPath}`)
    console.log(`   purpose: ${s.note}`)
  }
} finally {
  await browser.close()
}
