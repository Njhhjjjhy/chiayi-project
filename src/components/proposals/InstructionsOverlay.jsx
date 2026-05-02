import { useParams } from 'react-router-dom'

// Per-experience instruction hint shown bottom-center, above the timeline
// scrubber. Add an entry here when an experience needs the visitor to
// know about a key press / click trigger.

const INSTRUCTIONS = {
  'strobe': 'Press SPACE to strobe',
  'recalibration': 'Press SPACE to wipe your dark adaption',
  'dark-corridor': 'Move the camera — the flashlight follows where you look',
}

export default function InstructionsOverlay() {
  const { variantId } = useParams()
  const text = INSTRUCTIONS[variantId]
  if (!text) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-black/60 border border-white/10 backdrop-blur-sm rounded text-[11px] tracking-wide text-white/70 pointer-events-none">
      {text}
    </div>
  )
}
