import { useVariant } from '../hooks/useVariant.jsx'
import { variantCategories } from '../variants/config.js'

function captureScreenshot() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return

  // Force a render at high res
  const link = document.createElement('a')
  link.download = `firefly-construction-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function generateSpecSheet(selections) {
  const lines = [
    'FIREFLY IMMERSIVE EXPERIENCE — SPEC SHEET',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'ACTIVE CONFIGURATION',
    '='.repeat(40),
  ]

  for (const [key, cat] of Object.entries(variantCategories)) {
    const activeId = selections[key]
    const activeVariant = cat.variants.find((v) => v.id === activeId)
    lines.push(`${cat.label}: ${activeVariant ? activeVariant.label : 'None'}`)
  }

  lines.push('')
  lines.push('PHYSICAL SPECIFICATIONS')
  lines.push('='.repeat(40))
  lines.push('Room: 10m x 10m x 3.5m')
  lines.push('Mountain wall: full 10m width, MDF/plywood 12-18mm')
  lines.push('Backlighting: RGB LED strip with diffusion channel')
  lines.push('Ceiling panels: 120x120cm modular')
  lines.push('Floor: dark wood or composite')
  lines.push('Side walls: matte black fabric or paint')
  lines.push('')
  lines.push('FIREFLY SYSTEM')
  lines.push('='.repeat(40))
  lines.push('LEDs: warm micro-LED 2700K')
  lines.push('Controller: Arduino')
  lines.push('Modules: 16-18 fireflies per module')
  lines.push('Hanging material: ramie fiber, paper mulberry')

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const link = document.createElement('a')
  link.download = `firefly-spec-${Date.now()}.txt`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function ConstructionToolbar() {
  const { viewMode, selections } = useVariant()

  if (viewMode !== 'construction') return null

  return (
    <div className="fixed top-4 right-4 z-10 select-none">
      <div className="bg-white/95 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
          Construction tools
        </div>
        <div className="p-2 flex flex-col gap-1.5">
          <button
            onClick={captureScreenshot}
            className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors text-left"
          >
            Screenshot (PNG)
          </button>
          <button
            onClick={() => generateSpecSheet(selections)}
            className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors text-left"
          >
            Export spec sheet
          </button>
        </div>
      </div>
    </div>
  )
}
