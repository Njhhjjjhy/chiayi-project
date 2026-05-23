import { Link, useSearchParams } from 'react-router-dom'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row for the Wayfinding tab. Selects the
// pathway-edge-lighting prototype via the ?wayfind= URL param. Slice 4
// stage: the three prototypes are A/B/C visual options for the
// designer to compare before picking one in a follow-up slice.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const OPTIONS = [
  { id: 'strip', label: 'Strip' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'pools', label: 'Pools' },
]

const DEFAULT = 'strip'

export default function WayfindPicker() {
  const [searchParams] = useSearchParams()
  const current = searchParams.get('wayfind') ?? DEFAULT

  const urlFor = (id) => {
    const params = new URLSearchParams(searchParams)
    if (id === DEFAULT) params.delete('wayfind')
    else params.set('wayfind', id)
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
