import { useState } from 'react'
import { cameraPresets } from '../variants/config'
import { useVariant } from '../hooks/useVariant.js'

// Central scene picker — top-center chip bar. One source of truth
// for jumping the camera to a named view. If the user is currently
// in walk mode, clicking a chip exits walk mode so OrbitControls
// can take over and animate the camera to the preset.

export default function ScenePicker({ onSelect }) {
  const [activeKey, setActiveKey] = useState(null)
  const { walkMode, setWalkMode } = useVariant()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 select-none">
      <div className="bg-white border border-gray-200 rounded-full shadow-lg flex items-center gap-1 px-1.5 py-1.5">
        {Object.entries(cameraPresets).map(([key, preset]) => {
          const active = activeKey === key
          return (
            <button
              key={key}
              onClick={() => {
                if (walkMode) setWalkMode(false)
                setActiveKey(key)
                onSelect && onSelect({ ...preset })
              }}
              className={`text-sm px-3 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
