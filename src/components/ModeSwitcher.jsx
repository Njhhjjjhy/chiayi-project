import Glass, { EASE_OUT } from './Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const MODES = [
  { id: 'views', label: 'Views' },
  { id: 'lighting', label: 'Lighting experience' },
  { id: 'fireflies', label: 'Fireflies' },
]

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      {MODES.map((m) => {
        const active = mode === m.id
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={TRANSITION}
            className={`min-h-[44px] px-4 rounded-full text-sm tracking-[0.08em] whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {m.label}
          </button>
        )
      })}
    </Glass>
  )
}
