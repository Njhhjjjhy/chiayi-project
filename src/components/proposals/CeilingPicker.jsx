import { Link, useSearchParams } from 'react-router-dom'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row for the Ceiling tab. Selects which of the
// three slice-9 form vocabularies is rendered via `?ceiling=`.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const OPTIONS = [
  { id: 'flat', label: 'Flat' },
  { id: 'oblong', label: 'Oblong' },
  { id: 'mixed', label: 'Mixed' },
]

const DEFAULT = 'oblong'

export default function CeilingPicker() {
  const [searchParams] = useSearchParams()
  const current = searchParams.get('ceiling') ?? DEFAULT

  const urlFor = (id) => {
    const params = new URLSearchParams(searchParams)
    if (id === DEFAULT) params.delete('ceiling')
    else params.set('ceiling', id)
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
