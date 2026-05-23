import { Link, useSearchParams } from 'react-router-dom'
import { fireflyVariantList } from '../../variants/fireflies.js'
import { useProposal } from '../../hooks/useProposal.js'
import Glass, { EASE_OUT } from '../Glass'

// Top-center Glass pill row. Same visual as v1's FireflyPicker, using
// v2's firefly variants and prefixed with a 'Static LEDs' off-state.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const items = [
  { id: 'off', label: 'Static LEDs' },
  ...fireflyVariantList.map((v) => ({ id: v.id, label: v.label })),
]

export default function FireflyPicker() {
  const [searchParams] = useSearchParams()
  const { defaultFirefly } = useProposal()
  const urlFirefly = searchParams.get('firefly')
  const currentFirefly = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')

  const urlFor = (fireflyId) => {
    const params = new URLSearchParams(searchParams)
    params.set('firefly', fireflyId)
    return `?${params.toString()}`
  }

  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      {items.map(({ id, label }) => {
        const active = currentFirefly === id
        return (
          <Link
            key={id}
            to={urlFor(id)}
            style={TRANSITION}
            className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/20 text-white'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </Glass>
  )
}
