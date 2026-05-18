import { Link } from 'react-router-dom'
import Glass, { EASE_OUT } from './Glass'

// Tiny v1 / v2 toggle. Sits top-right, just left of the global Notes pill.
// Two visual variants so it reads on both v1 (dark background) and v2
// (white verification background).

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const VERSIONS = [
  { id: 'v1', label: 'v1', to: '/fireflies' },
  { id: 'v2', label: 'v2', to: '/fireflies-v2' },
]

export default function VersionSwitcher({ current, variant = 'dark' }) {
  if (variant === 'light') {
    return (
      <div className="fixed top-4 right-28 z-30 flex gap-1">
        {VERSIONS.map((v) => {
          const active = current === v.id
          return (
            <Link
              key={v.id}
              to={v.to}
              className={`text-[11px] font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                active
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
              }`}
            >
              {v.label}
            </Link>
          )
        })}
      </div>
    )
  }

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
              className={`min-h-[36px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
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
