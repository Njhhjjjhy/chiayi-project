import { useState } from 'react'
import { useVariant } from '../hooks/useVariant.jsx'
import { variantCategories } from '../variants/config.js'
import { wallVariants } from '../variants/wall.js'
import { BLUEPRINT_VIEW_LIST } from './BlueprintMode.jsx'

function captureScreenshot(name) {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null

  const link = document.createElement('a')
  link.download = name || `firefly-construction-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  return canvas.toDataURL('image/png')
}

function generateMaterialSchedule(selections) {
  const wallId = selections.wall || 'layeredMountain'
  const wall = wallVariants[wallId] || wallVariants.layeredMountain

  return [
    'MATERIAL SCHEDULE',
    '='.repeat(50),
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'THE BIG WALL',
    `  Treatment: ${wall.label}`,
    `  Width: 10m (full room width)`,
    `  Height: 3.52m (usable height after beams)`,
    `  Complexity: ${wall.complexity}`,
    `  Cost range: ${wall.cost}`,
    '',
    'CEILING',
    `  Panels: 120 x 120cm modular`,
    `  Grid: ${Math.floor(10 / 1.2)} x ${Math.floor(10 / 1.2)} panels`,
    `  Material: lightweight composite or fabric-wrapped frame`,
    `  LEDs: 18 per module (greenish tone)`,
    `  IR sensors: 1 per module`,
    '',
    'FLOOR',
    `  Material: artificial turf / dried grass mats`,
    `  Finish: matte, non-reflective, forest feel`,
    `  Area: 10 x 10m = 100m²`,
    '',
    'SIDE WALLS',
    `  Material: matte black fabric or paint`,
    `  Height: 3.52m`,
    `  Total surface: 2 x (10 x 3.52) = 70.4m²`,
    '',
    'SEATING',
    `  Bench material: wood or metal frame`,
    `  Bench height: 0.45m`,
    `  Bench depth: 0.4m`,
    `  Rows: 2`,
    `  Seating capacity: ~20-25`,
  ].join('\n')
}

function generateComponentList(selections) {
  const wallId = selections.wall || 'layeredMountain'
  const wall = wallVariants[wallId] || wallVariants.layeredMountain

  return [
    'COMPONENT LIST',
    '='.repeat(50),
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'STRUCTURAL',
    `  Big wall: ${wall.label} (10m x 3.52m)`,
    `  Ceiling grid frame: 8 x 8 T-bar grid`,
    `  Ceiling panels: ${Math.floor(10 / 1.2) * Math.floor(10 / 1.2)} panels (120x120cm)`,
    `  Curtains/dividers: sectioning from retail area`,
    '',
    'LIGHTING',
    `  Ceiling LED modules: 18 LEDs per module`,
    `  IR sensors: 1 per module`,
    `  LED controller: Arduino-based`,
    `  IR flashlights: 30 units (one per visitor)`,
    '',
    'FIREFLY SYSTEM',
    `  Micro-LEDs: greenish tone, 2700K`,
    `  Controller: Arduino with PWM`,
    `  Algorithm: 3 states (idle, motion, flashlight)`,
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
    `  Floor: modular mat system + scattered natural elements`,
    `  Paint: matte black (walls)`,
    `  Fabric: matte black, fire-rated (curtains)`,
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
  lines.push('  Width: 10m')
  lines.push('  Depth: 10m')
  lines.push('  Height: 3.52m')
  lines.push('  Floor area: 100m²')
  lines.push('  Volume: 350m³')
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
  folder.file('material-schedule.txt', generateMaterialSchedule(selections))
  folder.file('component-list.txt', generateComponentList(selections))
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
