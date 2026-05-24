// Slice 19 step 2 smoke checks. Verifies:
//   1. ?timeline=0.5 read on init
//   2. console.warn fires on unknown view
//   3. console.warn does NOT fire on a valid diagnostic preset
//   4. window.__scene and window.THREE exposed in dev
import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
const browser = await puppeteer.launch({ headless: 'new' })

async function run(url) {
  const page = await browser.newPage()
  const warns = []
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'warning' || m.type() === 'warn') warns.push(m.text())
    if (m.type() === 'error') errors.push(m.text())
    if (m.text().includes('[camera]')) warns.push(`(any-type) ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 1200))
  const probe = await page.evaluate(() => ({
    hasScene: typeof window.__scene === 'object' && window.__scene !== null,
    hasTHREE: typeof window.THREE === 'object' && window.THREE !== null,
  }))
  await page.close()
  return { warns, errors, probe }
}

const valid = await run(`${BASE}/fireflies?view=standing&timeline=0.5`)
console.log('--- valid view=standing, timeline=0.5 ---')
console.log('window.__scene exposed:', valid.probe.hasScene)
console.log('window.THREE exposed: ', valid.probe.hasTHREE)
console.log('camera warns:', valid.warns.filter((w) => w.includes('[camera]')))

const diag = await run(`${BASE}/fireflies?view=loofah-close-range`)
console.log('--- valid diagnostic view=loofah-close-range ---')
console.log('camera warns:', diag.warns.filter((w) => w.includes('[camera]')))

const bad = await run(`${BASE}/fireflies?view=does-not-exist`)
console.log('--- invalid view=does-not-exist ---')
console.log('camera warns:', bad.warns.filter((w) => w.includes('[camera]')))

await browser.close()
