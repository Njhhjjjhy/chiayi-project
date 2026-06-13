// Hand-gesture toggle row. Lives inside the top-left navigation panel as
// the first item, styled to match the dropdown rows beside it. Turns the
// webcam hand control on and off (local-only — needs the gesture helper).

const HAND_ICON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10m0 0V4.2a1.5 1.5 0 0 1 3 0V10m0 0V5.5a1.5 1.5 0 0 1 3 0V13m0-3.2a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.7a6 6 0 0 1-5-2.7l-2.4-3.6a1.6 1.6 0 0 1 2.6-1.8L8 13" />
  </svg>
)

export default function GestureButton({ on, status, onToggle }) {
  const label = status === 'error'
    ? 'Hand control — unavailable'
    : status === 'starting'
      ? 'Hand control — starting…'
      : on
        ? 'Hand control on'
        : 'Hand control'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      title={status === 'error'
        ? 'Camera unavailable — allow camera access, then try again'
        : 'Look around the room with your hand'}
      className={`w-full flex items-center gap-2 min-h-[34px] px-3 rounded-lg text-[13px] cursor-pointer transition-colors ${
        on ? 'bg-white/20 text-white' : 'bg-white/8 text-white hover:bg-white/12'
      }`}
    >
      <span className={status === 'error' ? 'text-red-300' : on ? 'text-emerald-300' : 'text-white/70'}>
        {HAND_ICON}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}
