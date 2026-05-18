import { Link, useSearchParams } from 'react-router-dom'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row for the Lighting tab. v2 doesn't have a
// per-proposal lighting picker yet, so this row toggles the curtain
// and the experience-mode preview (the two lighting-adjacent runtime
// toggles v2 currently supports).

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

export default function V2LightingPicker() {
  const [searchParams] = useSearchParams()
  const curtainOff = searchParams.get('curtain') === 'off'
  const isExperience = searchParams.get('mode') === 'experience'

  const urlForCurtain = () => {
    const params = new URLSearchParams(searchParams)
    if (curtainOff) params.delete('curtain')
    else params.set('curtain', 'off')
    return `?${params.toString()}`
  }

  const urlForMode = () => {
    const params = new URLSearchParams(searchParams)
    if (isExperience) params.delete('mode')
    else params.set('mode', 'experience')
    return `?${params.toString()}`
  }

  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      <Link
        to={urlForCurtain()}
        style={TRANSITION}
        className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
          curtainOff
            ? 'bg-white/15 text-white'
            : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
        }`}
      >
        Curtain {curtainOff ? 'off' : 'on'}
      </Link>
      <Link
        to={urlForMode()}
        style={TRANSITION}
        className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
          isExperience
            ? 'bg-white/15 text-white'
            : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
        }`}
      >
        Experience mode
      </Link>
    </Glass>
  )
}
