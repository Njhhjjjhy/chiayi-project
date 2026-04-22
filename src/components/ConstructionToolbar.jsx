import { useState } from 'react'
import { useVariant } from '../hooks/useVariant.js'
import { variantCategories } from '../variants/config.js'
import {
  ROOM, HW,
  ENT_W, ENT_H,
  D1_W, D1_H, D1_END_X,
  D2_W, D2_H, D2_END_X,
  SMALL_WIN_W, SMALL_WIN_H,
  STEEL_DOOR_W, STEEL_DOOR_H,
  MAIN_WIN_W, MAIN_WIN_TOP,
  DROPPED_CEILING_Y,
} from '../geometry/dimensions.js'

const cm = (m) => Math.round(m * 100)
const area = () => (ROOM.W * ROOM.D).toFixed(1)
const volume = () => (ROOM.W * ROOM.D * ROOM.H).toFixed(0)
const sideArea = () => (2 * ROOM.D * ROOM.H).toFixed(1)

function captureScreenshot(name) {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null

  const link = document.createElement('a')
  link.download = name || `firefly-construction-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  return canvas.toDataURL('image/png')
}

function generateMaterialSchedule() {
  return [
    'MATERIAL SCHEDULE',
    '='.repeat(50),
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'FRONT WALL (the big wall — feature-wall position)',
    `  Treatment: TBD (cleared — new ideas pending)`,
    `  Width: ${ROOM.W}m (full front-wall width)`,
    `  Height: ${ROOM.H}m`,
    '',
    'CEILING',
    `  Existing: structural — white plaster, cross-beams, cage pendant lights`,
    `  Covering: mountain topology (sculptural sub-ceiling at y=${DROPPED_CEILING_Y}m)`,
    '',
    'FLOOR',
    `  Existing: grey marble porcelain, ~80cm tiles, heavy white veining`,
    `  Covering: TBD (pending covering strategy)`,
    `  Area: ${ROOM.W} x ${ROOM.D}m = ${area()}m²`,
    '',
    'SIDE WALLS (entrance-wall + window-wall)',
    `  Height: ${ROOM.H}m`,
    `  Total surface: 2 x (${ROOM.D} x ${ROOM.H}) = ${sideArea()}m²`,
    `  Entrance-wall (${ROOM.D}m): visitor entrance 45cm from front-wall corner, ${cm(ENT_W)}×${cm(ENT_H)} full-height opening;`,
    `    long open span to adjacent bistro past the entrance — modelled as continuous wall.`,
    `    Infill / column treatment TBD (pending covering strategy).`,
    `  Window-wall (${ROOM.D}m): multi-pane interior glass partition (${cm(MAIN_WIN_W)}×${cm(MAIN_WIN_TOP)}) + small window in`,
    `    stepped notch (${cm(SMALL_WIN_W)}×${cm(SMALL_WIN_H)}) + silver service door (${cm(STEEL_DOOR_W)}×${cm(STEEL_DOOR_H)}) + HVAC plenum.`,
    `    Covering TBD (pending covering strategy).`,
    '',
    'BACK WALL (piano wall)',
    `  Width: ${ROOM.W}m`,
    `  Height: ${ROOM.H}m`,
    `  Openings: D1 (${cm(D1_W)}×${cm(D1_H)}) at ${cm(HW - D1_END_X)}cm from window-wall corner; D2 (${cm(D2_W)}×${cm(D2_H)}) at ${cm(HW - D2_END_X)}cm`,
    `  Existing: 2 A/C heads high on wall + red sprinkler pipe along the top`,
    `  Covering: TBD (pending covering strategy)`,
    '',
    'SEATING',
    `  Bench material: wood or metal frame`,
    `  Bench height: 0.45m`,
    `  Bench depth: 0.4m`,
    `  Rows: 2`,
    `  Seating capacity: ~20-25`,
  ].join('\n')
}

function generateComponentList() {
  return [
    'COMPONENT LIST',
    '='.repeat(50),
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'STRUCTURAL',
    `  Big wall: TBD (${ROOM.W}m x ${ROOM.H}m — new treatment pending)`,
    `  Ceiling: mountain topology sculptural covering (at y=${DROPPED_CEILING_Y}m)`,
    `  Curtains/dividers: sectioning from retail area`,
    '',
    'FIREFLY SYSTEM',
    `  Micro-LEDs: GREEN, 2700K equivalent`,
    `  Controller: Arduino with PWM`,
    `  Behaviour: TBD (cleared — new ideas pending)`,
    '',
    'SOUND',
    `  Speakers: 4 minimum (corner placement)`,
    `  Audio loop: 30+ minutes`,
    `  Amplifier: 1 unit`,
    '',
    'ELECTRICAL',
    `  Main power: 240V, 20A circuit minimum`,
    `  Control signal: DMX-512 or I2C`,
    '',
    'MISC',
    `  Benches: 2 rows, 4 bench segments`,
    `  Floor covering + wall covering: TBD (pending covering strategy)`,
  ].join('\n')
}

function generateSpecSummary(selections) {
  const lines = [
    'FIREFLY IMMERSIVE EXPERIENCE — SPEC SUMMARY',
    '='.repeat(50),
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'ACTIVE CONFIGURATION',
    '-'.repeat(30),
  ]

  for (const [key, cat] of Object.entries(variantCategories)) {
    const activeId = selections[key]
    const activeVariant = cat.variants.find((v) => v.id === activeId)
    lines.push(`  ${cat.label}: ${activeVariant ? activeVariant.label : 'None'}`)
  }

  lines.push('')
  lines.push('ROOM DIMENSIONS')
  lines.push('-'.repeat(30))
  lines.push(`  Width: ${ROOM.W}m (front-wall to back-wall)`)
  lines.push(`  Depth: ${ROOM.D}m (window-wall to entrance-wall)`)
  lines.push(`  Height: ${ROOM.H}m`)
  lines.push(`  Floor area: ${area()}m²`)
  lines.push(`  Volume: ${volume()}m³`)
  lines.push('')
  lines.push('LOCATION')
  lines.push('-'.repeat(30))
  lines.push('  Community and Cultural Center')
  lines.push('  Alishan, Chiayi County, Taiwan')

  return lines.join('\n')
}

async function downloadBlueprintPackage(selections) {
  // Dynamic import JSZip
  let JSZip
  try {
    JSZip = (await import('jszip')).default
  } catch {
    alert('JSZip not installed. Run: npm install jszip')
    return
  }

  const zip = new JSZip()
  const date = new Date().toISOString().split('T')[0]
  const folder = zip.folder(`firefly-blueprint-${date}`)

  // Capture current view as construction screenshot
  const canvas = document.querySelector('canvas')
  if (canvas) {
    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]
    folder.file('construction-view.png', base64, { base64: true })
  }

  // Generate text documents
  folder.file('material-schedule.txt', generateMaterialSchedule())
  folder.file('component-list.txt', generateComponentList())
  folder.file('spec-summary.txt', generateSpecSummary(selections))

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.download = `firefly-blueprint-${date}.zip`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function ConstructionToolbar() {
  const { isConstruction, selections } = useVariant()
  const [exporting, setExporting] = useState(false)

  if (!isConstruction) return null

  const handleExport = async () => {
    setExporting(true)
    try {
      await downloadBlueprintPackage(selections)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-10 select-none">
      <div className="bg-white/95 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
          Construction tools
        </div>
        <div className="p-2 flex flex-col gap-1.5">
          <button
            onClick={() => captureScreenshot()}
            className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors text-left"
          >
            Screenshot (PNG)
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors text-left disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Download blueprint package'}
          </button>
        </div>
      </div>
    </div>
  )
}
