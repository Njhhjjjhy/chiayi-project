import { Link, useSearchParams } from 'react-router-dom'
import { cameraPresets } from '../../variants/config.js'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row. Same visual as v1's ScenePicker, using
// v2's cameraPresets.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const DEFAULT_VIEW = 'standing'

export default function V2ScenePicker() {
  const [searchParams] = useSearchParams()
  const currentView = searchParams.get('view') ?? DEFAULT_VIEW

  const urlFor = (viewKey) => {
    const params = new URLSearchParams(searchParams)
    params.set('view', viewKey)
    return `?${params.toString()}`
  }

  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      {Object.entries(cameraPresets).map(([key, preset]) => {
        const active = currentView === key
        return (
          <Link
            key={key}
            to={urlFor(key)}
            style={TRANSITION}
            className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/20 text-white'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            {preset.label}
          </Link>
        )
      })}
    </Glass>
  )
}
