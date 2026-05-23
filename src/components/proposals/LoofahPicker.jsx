import { Link, useSearchParams } from 'react-router-dom'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row for the Loofah tab. Selects which of the
// three slice-5 wall prototypes is rendered via `?loofah=`.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const OPTIONS = [
  { id: 'variant1', label: 'Flat panel' },
  { id: 'variant2', label: 'Clusters' },
  { id: 'variant3', label: 'Wall + corner' },
]

const DEFAULT = 'variant1'

export default function LoofahPicker() {
  const [searchParams] = useSearchParams()
  const current = searchParams.get('loofah') ?? DEFAULT

  const urlFor = (id) => {
    const params = new URLSearchParams(searchParams)
    if (id === DEFAULT) params.delete('loofah')
    else params.set('loofah', id)
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
