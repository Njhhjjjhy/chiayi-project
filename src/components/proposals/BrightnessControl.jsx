import Glass from '../Glass'

// Review-only ambient brightness boost. The experience proposals are
// designed to be dark; this slider adds an extra ambient light on top so
// the reviewer can actually see what the room looks like. Default at
// 0.4 — visibly brighter than the proposal's true look but not so bright
// it washes out the sunset palette / firefly glow.

export default function BrightnessControl({ value, onChange }) {
  return (
    <Glass className="select-none rounded-2xl px-4 py-3 w-56">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm tracking-wider text-white/85">Review brightness</span>
        <span className="text-sm tabular-nums text-white">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1.5}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white cursor-pointer"
      />
      <div className="text-sm text-white/75 mt-2">0 = true experience · drag to brighten</div>
    </Glass>
  )
}
