import { useVariant } from '../hooks/useVariant.js'
import { fireflyVariantList } from '../variants/fireflies.js'
import Glass, { EASE_OUT } from './Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

export default function FireflyPicker() {
  const { selections, selectVariant } = useVariant()
  const activeId = selections.fireflies

  return (
    <Glass className="select-none rounded-full flex items-center gap-1 p-1">
      {fireflyVariantList.map((v) => {
        const active = activeId === v.id
        return (
          <button
            key={v.id}
            onClick={() => selectVariant('fireflies', active ? null : v.id)}
            title={v.description}
            style={TRANSITION}
            className={`min-h-[44px] px-4 rounded-full text-[15px] whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {v.label}
          </button>
        )
      })}
    </Glass>
  )
}
