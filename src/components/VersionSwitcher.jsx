import { Link } from 'react-router-dom'
import Glass, { EASE_OUT } from './Glass'

// Tiny v1 / v2 toggle. Sits top-right, just left of the global Notes pill.
// Matches the v1 Glass aesthetic — dark blurred pill row with white text,
// readable on either page's background.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const VERSIONS = [
  { id: 'v1', label: 'v1', to: '/fireflies' },
  { id: 'v2', label: 'v2', to: '/fireflies-v2' },
]

export default function VersionSwitcher({ current }) {
  return (
    <div className="fixed top-4 right-28 z-30 select-none">
      <Glass className="rounded-full flex items-center gap-1 p-1">
        {VERSIONS.map((v) => {
          const active = current === v.id
          return (
            <Link
              key={v.id}
              to={v.to}
              style={TRANSITION}
              className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              {v.label}
            </Link>
          )
        })}
      </Glass>
    </div>
  )
}
