import { Link, useSearchParams } from 'react-router-dom'
import Glass, { EASE_OUT } from '../Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

export default function LightingPicker() {
  const [searchParams] = useSearchParams()
  const isExperience = searchParams.get('mode') === 'experience'

  const urlForMode = () => {
    const params = new URLSearchParams(searchParams)
    if (isExperience) params.delete('mode')
    else params.set('mode', 'experience')
    return `?${params.toString()}`
  }

  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      <Link
        to={urlForMode()}
        style={TRANSITION}
        className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
          isExperience
            ? 'bg-white/20 text-white'
            : 'text-white/85 hover:text-white hover:bg-white/10'
        }`}
      >
        Experience mode
      </Link>
    </Glass>
  )
}
