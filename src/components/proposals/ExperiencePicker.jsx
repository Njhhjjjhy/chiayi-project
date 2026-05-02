import { useNavigate, useParams } from 'react-router-dom'
import { experiences } from '../../proposals/experiences.js'
import Glass, { EASE_OUT } from '../Glass'

export default function ExperiencePicker() {
  const navigate = useNavigate()
  const { variantId } = useParams()

  return (
    <Glass className="fixed top-4 left-1/2 -translate-x-1/2 z-10 select-none rounded-full flex items-center gap-1 p-1">
      {experiences.map((exp) => {
        const active = variantId === exp.id
        return (
          <button
            key={exp.id}
            onClick={() => navigate(`/proposals/${exp.id}`)}
            title={exp.summary}
            style={{
              transitionDuration: '280ms',
              transitionTimingFunction: EASE_OUT,
            }}
            className={`min-h-[44px] px-4 rounded-full text-[15px] whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {exp.label}
          </button>
        )
      })}
    </Glass>
  )
}
