// Verify gridHelper default off + ?grid=on opt-in + diagnostic dropdown
// subheading rendering.
import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900 })

async function gridCount(url) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1000))
  return page.evaluate(() => {
    const scene = window.__scene
    if (!scene) return 'NO_SCENE'
    let count = 0
    scene.traverse((o) => {
      if (o.type === 'GridHelper') count++
    })
    return count
  })
}

const offDefault = await gridCount(`${BASE}/fireflies`)
const explicitOn = await gridCount(`${BASE}/fireflies?grid=on`)

console.log('--- gridHelper presence (count of GridHelper objects in scene) ---')
console.log('default (no query):', offDefault)
console.log('?grid=on:          ', explicitOn)

// Diagnostic dropdown subheading text + items
await page.goto(`${BASE}/fireflies`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))
// Click the camera dropdown (second dropdown in top-left)
const dropdownInfo = await page.evaluate(() => {
  const dropdowns = document.querySelectorAll('.fixed.top-3.left-3 button')
  if (dropdowns.length < 2) return { error: 'fewer than 2 dropdowns found' }
  dropdowns[1].click()
  return { clicked: true }
})
await new Promise((r) => setTimeout(r, 400))
const visibleItems = await page.evaluate(() => {
  // Find the open dropdown menu (it is the absolute-positioned div appearing
  // right after the dropdown trigger).
  const menus = document.querySelectorAll('.absolute.top-full')
  for (const m of menus) {
    if (m.offsetParent !== null) {
      const items = Array.from(m.querySelectorAll('a')).map((a) => a.textContent.trim())
      const subheadings = Array.from(m.querySelectorAll('div'))
        .filter((d) => /Diagnostic/i.test(d.textContent))
        .map((d) => d.textContent.trim())
      return { items, subheadings }
    }
  }
  return { items: [], subheadings: [] }
})
console.log('\n--- camera dropdown ---')
console.log('subheadings found:', dropdownInfo.error ?? visibleItems.subheadings)
console.log('total items:', visibleItems.items.length)
console.log('items:', visibleItems.items)

await browser.close()
