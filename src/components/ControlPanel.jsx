import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cameraPresets } from '../variants/config.js'
import { proposalVariantList } from '../variants/proposals.js'
import { fireflyVariantList } from '../variants/fireflies.js'
import { useProposal } from '../hooks/useProposal.js'
import Glass, { EASE_OUT, ChevronDown } from './Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const DEFAULT_VIEW = 'standing'

const FIREFLY_ITEMS = [
  { id: 'off', label: 'Static LEDs' },
  ...fireflyVariantList.map((v) => ({ id: v.id, label: v.label })),
]

const WAYFIND_OPTIONS = [
  { id: 'strip', label: 'Strip' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'pools', label: 'Pools' },
]

const CEILING_OPTIONS = [
  { id: 'flat', label: 'Flat' },
  { id: 'oblong', label: 'Oblong' },
  { id: 'mixed', label: 'Mixed' },
]

const LOOFAH_OPTIONS = [
  { id: 'variant1', label: 'Flat panel' },
  { id: 'variant2', label: 'Clusters' },
  { id: 'variant3', label: 'Corners' },
]

const SEATING_OPTIONS = [
  { id: 'stools', label: 'Stools' },
  { id: 'benches', label: 'Benches' },
  { id: 'pillows', label: 'Pillows' },
]


function Label({ children }) {
  return (
    <span className="text-[11px] tracking-[0.08em] uppercase text-white/40 shrink-0">
      {children}
    </span>
  )
}

function Pills({ options, current, urlFor }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const active = current === opt.id
        return (
          <Link
            key={opt.id}
            to={urlFor(opt.id)}
            style={TRANSITION}
            className={`min-h-[30px] px-2.5 flex items-center rounded-full text-[12px] whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/8'
            }`}
          >
            {opt.label}
          </Link>
        )
      })}
    </div>
  )
}

function Dropdown({ options, current, urlFor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const currentLabel = options.find((o) => o.id === current)?.label ?? '—'

  useEffect(() => {
    if (!open) return
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        style={TRANSITION}
        className="w-full flex items-center justify-between min-h-[34px] px-3 rounded-lg text-[13px] text-white bg-white/8 hover:bg-white/12 cursor-pointer transition-colors"
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          size={9}
          className={`ml-2 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 rounded-2xl border border-white/15 py-1.5 min-w-full max-h-52 overflow-y-auto"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {options.map((opt) => (
            <Link
              key={opt.id}
              to={urlFor(opt.id)}
              onClick={() => setOpen(false)}
              style={TRANSITION}
              className={`block px-3.5 py-2 text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                current === opt.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ControlPanel({ brightness, onBrightnessChange, spotlights, onSpotlightsChange }) {
  const [searchParams] = useSearchParams()
  const { proposalId, defaultFirefly } = useProposal()

  const isExperience = searchParams.get('mode') === 'experience'
  const urlFirefly = searchParams.get('firefly')
  const currentFirefly = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')
  const currentView = searchParams.get('view') ?? DEFAULT_VIEW
  const currentWayfind = searchParams.get('wayfind') ?? 'strip'
  const currentCeiling = searchParams.get('ceiling') ?? 'oblong'
  const currentLoofah = searchParams.get('loofah') ?? 'variant1'
  const currentSeating = searchParams.get('seating') ?? 'stools'

  const urlForSet = (key, value) => {
    const params = new URLSearchParams(searchParams)
    params.set(key, value)
    const qs = params.toString()
    return qs ? `?${qs}` : '.'
  }

  const urlForDefault = (key, value, defaultValue) => {
    const params = new URLSearchParams(searchParams)
    if (value === defaultValue) params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    return qs ? `?${qs}` : '.'
  }

  const urlForToggle = (key, onValue) => {
    const params = new URLSearchParams(searchParams)
    if (params.get(key) === onValue) params.delete(key)
    else params.set(key, onValue)
    return `?${params.toString()}`
  }

  const proposalUrlFor = (id) => {
    const params = new URLSearchParams(searchParams)
    const qs = params.toString()
    return `/fireflies/${id}${qs ? `?${qs}` : ''}`
  }

  const proposalOptions = proposalVariantList.map((v) => ({ id: v.id, label: v.label }))
  const cameraOptions = Object.entries(cameraPresets).map(([key, p]) => ({ id: key, label: p.label }))

  return (
    <>
      {/* Top-left: navigation dropdowns */}
      <div className="fixed top-3 left-3 z-10 select-none">
        <Glass className="rounded-2xl p-4 space-y-2 w-56">
          <Dropdown options={proposalOptions} current={proposalId} urlFor={proposalUrlFor} />
          <Dropdown options={cameraOptions} current={currentView} urlFor={(id) => urlForSet('view', id)} />
        </Glass>
      </div>

      {/* Right: settings */}
      <div className="fixed top-3 right-3 z-10 select-none">
        <Glass className="rounded-2xl p-4 w-[420px] space-y-4">
          {/* Experience mode */}
          <Link
            to={urlForToggle('mode', 'experience')}
            style={TRANSITION}
            className="flex items-center justify-between min-h-[32px] px-2.5 rounded-lg text-[13px] cursor-pointer transition-colors hover:bg-white/8"
          >
            <span className={isExperience ? 'text-white' : 'text-white/50'}>
              Experience mode
            </span>
            <div
              className={`w-7 h-4 rounded-full transition-colors duration-200 ${
                isExperience ? 'bg-white/40' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform duration-200 ${
                  isExperience ? 'translate-x-[13px]' : 'translate-x-0.5'
                }`}
              />
            </div>
          </Link>

          <div className="border-t border-white/10" />

          {/* Fireflies — full width */}
          <div className="space-y-1.5">
            <Label>Fireflies</Label>
            <Pills
              options={FIREFLY_ITEMS}
              current={currentFirefly}
              urlFor={(id) => urlForSet('firefly', id)}
            />
          </div>

          {/* 2×2 grid for short option groups */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div className="space-y-1.5">
              <Label>Wayfinding</Label>
              <Pills
                options={WAYFIND_OPTIONS}
                current={currentWayfind}
                urlFor={(id) => urlForDefault('wayfind', id, 'strip')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ceiling</Label>
              <Pills
                options={CEILING_OPTIONS}
                current={currentCeiling}
                urlFor={(id) => urlForDefault('ceiling', id, 'oblong')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Loofah</Label>
              <Pills
                options={LOOFAH_OPTIONS}
                current={currentLoofah}
                urlFor={(id) => urlForDefault('loofah', id, 'variant1')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Seating</Label>
              <Pills
                options={SEATING_OPTIONS}
                current={currentSeating}
                urlFor={(id) => urlForDefault('seating', id, 'stools')}
              />
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Brightness */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Brightness</Label>
              <span className="text-[11px] tabular-nums text-white/40">
                {brightness.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.01}
              value={brightness}
              onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          {/* Spotlights */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Spotlights</Label>
              <span className="text-[11px] tabular-nums text-white/40">
                {spotlights.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.01}
              value={spotlights}
              onChange={(e) => onSpotlightsChange(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
          </div>
        </Glass>
      </div>
    </>
  )
}
