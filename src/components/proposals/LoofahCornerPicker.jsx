import { Link, useSearchParams } from 'react-router-dom'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row for the Loofah corner sub-picker. Visible
// only when `?loofah=variant3` is active. Selects which of the four
// forest corners hosts the sculptural column via `?corner=`.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const OPTIONS = [
  { id: 'back-left',   label: 'Back-left' },
  { id: 'back-right',  label: 'Back-right' },
  { id: 'front-left',  label: 'Front-left' },
  { id: 'front-right', label: 'Front-right' },
]

const DEFAULT = 'back-left'

export default function LoofahCornerPicker() {
  const [searchParams] = useSearchParams()
  const current = searchParams.get('corner') ?? DEFAULT

  const urlFor = (id) => {
    const params = new URLSearchParams(searchParams)
    if (id === DEFAULT) params.delete('corner')
    else params.set('corner', id)
    const qs = params.toString()
    return qs ? `?${qs}` : '.'
  }

  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      {OPTIONS.map((opt) => {
        const active = current === opt.id
        return (
          <Link
            key={opt.id}
            to={urlFor(opt.id)}
            style={TRANSITION}
            className={`min-h-11 px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/20 text-white'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            {opt.label}
          </Link>
        )
      })}
    </Glass>
  )
}
