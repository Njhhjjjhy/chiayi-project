import { cameraPresets } from '../variants/config'
import { useVariant } from '../hooks/useVariant.js'
import Glass, { EASE_OUT } from './Glass'

export default function ScenePicker({ onSelect }) {
  const { walkMode, setWalkMode, activeSceneKey, setActiveSceneKey } = useVariant()

  return (
    <Glass className="fixed top-4 left-1/2 -translate-x-1/2 z-10 select-none rounded-full flex items-center gap-1 p-1">
      {Object.entries(cameraPresets).map(([key, preset]) => {
        const active = activeSceneKey === key
        return (
          <button
            key={key}
            onClick={() => {
              if (walkMode) setWalkMode(false)
              setActiveSceneKey(key)
              onSelect && onSelect({ ...preset })
            }}
            style={{
              transitionDuration: '280ms',
              transitionTimingFunction: EASE_OUT,
            }}
            className={`min-h-[44px] px-4 rounded-full text-[15px] whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {preset.label}
          </button>
        )
      })}
    </Glass>
  )
}
