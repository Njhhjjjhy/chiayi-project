// Slice 19 step 2 area F — capture actual ceiling form counts per variant
// by visiting each `?ceiling=` URL and reading the [ceiling] console log
// emitted from buildCeiling(). Temporary diagnostic; removed after the
// next ceiling-count designer lock.
import puppeteer from 'puppeteer'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const VARIANTS = ['flat', 'oblong', 'mixed']

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()

const captured = []
page.on('console', (msg) => {
  const text = msg.text()
  if (text.startsWith('[ceiling]')) captured.push(text)
})
page.on('pageerror', (err) => console.error('pageerror:', err.message))

for (const variant of VARIANTS) {
  const url = `${BASE}/fireflies?ceiling=${variant}&view=ceiling`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 800))
}

await browser.close()

if (captured.length === 0) {
  console.error('NO [ceiling] LOGS CAPTURED — check that dev server is running and the log line is in buildCeiling.')
  process.exit(1)
}

console.log('\n=== Ceiling form counts ===')
for (const line of captured) console.log(line)
