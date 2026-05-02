import { useParams } from 'react-router-dom'
import { experiencesById, DEFAULT_EXPERIENCE_ID } from '../../proposals/experiences.js'

// Small banner shown above the picker when the active experience is still
// a placeholder. The bare room renders underneath so the reviewer always
// has something to look at.

export default function PlaceholderBanner() {
  const { variantId } = useParams()
  const exp = experiencesById[variantId] || experiencesById[DEFAULT_EXPERIENCE_ID]
  if (!exp || exp.status === 'built') return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-black/60 border border-amber-300/30 backdrop-blur-sm rounded text-[10px] uppercase tracking-widest text-amber-200/80 pointer-events-none">
      {exp.label} — not yet built · bare room shown
    </div>
  )
}
