import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cameraPresets } from '../variants/config.js'
import { proposalVariantList } from '../variants/proposals.js'
import { fireflyVariantList } from '../variants/fireflies.js'
import { useProposal } from '../hooks/useProposal.js'
import Glass, { EASE_OUT, ChevronDown, CloseGlyph } from './Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

const DEFAULT_VIEW = 'standing'

const FIREFLY_ITEMS = [
  { id: 'off', label: 'Static LEDs' },
  ...fireflyVariantList.map((v) => ({ id: v.id, label: v.label })),
]

const CEILING_OPTIONS = [
  { id: 'discs', label: 'Discs' },
  { id: 'oblong', label: 'Oblong' },
  { id: 'mixed', label: 'Mixed' },
]

const LOOFAH_OPTIONS = [
  { id: 'grid', label: 'Grid' },
  { id: 'fibrous', label: 'Fibrous' },
  { id: 'clusters', label: 'Clusters' },
  { id: 'corners', label: 'Corners' },
]

const SEATING_OPTIONS = [
  { id: 'cubes', label: 'Cubes' },
  { id: 'frame-stools', label: 'Frame stools' },
  { id: 'benches', label: 'Benches' },
]

const BEAM_OPTIONS = [
  { id: 'all', label: 'All seats' },
  { id: 'clusters', label: 'Clusters' },
  { id: 'off', label: 'Off' },
]

const PATHWAY_OPTIONS = [
  { id: 'dark', label: 'Dark' },
  { id: 'timber', label: 'Timber' },
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
            className={`pill-dense min-h-[30px] px-2.5 flex items-center rounded-full text-[12px] whitespace-nowrap cursor-pointer transition-colors ${
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

  const standard = options.filter((o) => o.group !== 'diagnostic')
  const diagnostic = options.filter((o) => o.group === 'diagnostic')

  function Item({ opt }) {
    return (
      <Link
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
    )
  }

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
          className="glass-surface absolute top-full left-0 mt-1.5 z-50 rounded-2xl py-1.5 min-w-full max-h-52 overflow-y-auto"
          style={{ '--glass-tint': 'rgba(8, 8, 10, 0.85)' }}
        >
          {standard.map((opt) => (
            <Item key={opt.id} opt={opt} />
          ))}
          {diagnostic.length > 0 && (
            <>
              <div className="mt-1 mb-0.5 mx-2 pt-1.5 border-t border-white/10 text-[10px] tracking-[0.08em] uppercase text-white/30 select-none px-1.5">
                Diagnostic
              </div>
              {diagnostic.map((opt) => (
                <Item key={opt.id} opt={opt} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function ControlPanel({ brightness, onBrightnessChange, spotlights, onSpotlightsChange }) {
  const [searchParams] = useSearchParams()
  const { proposalId, defaultFirefly } = useProposal()

  // Settings presentation below desktop width: opened via the toggle,
  // shown in a native dialog (slide-over pane on tablet, bottom sheet
  // on phone — see .settings-dialog in src/styles/index.css).
  const [settingsOpen, setSettingsOpen] = useState(false)
  const dialogRef = useRef(null)
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (settingsOpen && !dlg.open) dlg.showModal()
    if (!settingsOpen && dlg.open) dlg.close()
  }, [settingsOpen])

  const isExperience = searchParams.get('mode') === 'experience'
  const urlFirefly = searchParams.get('firefly')
  const currentFirefly = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')
  const currentView = searchParams.get('view') ?? DEFAULT_VIEW
  // Retired 'flat' (and any unknown value) highlights Discs, matching
  // what the room actually renders.
  const rawCeiling = searchParams.get('ceiling')
  const currentCeiling = ['discs', 'oblong', 'mixed'].includes(rawCeiling)
    ? rawCeiling
    : 'discs'
  // Legacy variant1/2/3 ids highlight the look they map onto.
  const rawLoofah = searchParams.get('loofah')
  const legacyLoofah = { variant1: 'fibrous', variant2: 'clusters', variant3: 'corners' }[rawLoofah]
  const currentLoofah = legacyLoofah
    ?? (['grid', 'fibrous', 'clusters', 'corners'].includes(rawLoofah) ? rawLoofah : 'fibrous')
  // Mirror the page fallback: retired values ('stools', 'pillows')
  // highlight Cubes since that is what the room actually renders.
  const rawSeating = searchParams.get('seating')
  const currentSeating = ['cubes', 'frame-stools', 'benches'].includes(rawSeating)
    ? rawSeating
    : 'cubes'
  const rawBeams = searchParams.get('beams')
  const currentBeams = ['all', 'clusters', 'off'].includes(rawBeams) ? rawBeams : 'clusters'
  const rawPathway = searchParams.get('pathway')
  const currentPathway = ['dark', 'timber'].includes(rawPathway) ? rawPathway : 'dark'

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
  const cameraOptions = Object.entries(cameraPresets).map(([key, p]) => ({
    id: key,
    label: p.label,
    group: p.group,
  }))

  // Experience mode: the UI recedes. No pickers, no sliders — just a
  // quiet way out. The timeline stays (rendered separately) so the
  // arc can still be scrubbed while inside the experience.
  if (isExperience) {
    return (
      <div className="fixed top-3 right-3 z-10 select-none">
        <Glass className="rounded-2xl p-1.5">
          <Link
            to={urlForToggle('mode', 'experience')}
            style={TRANSITION}
            className="flex items-center min-h-[36px] px-3.5 rounded-xl text-[13px] text-white/50 hover:text-white hover:bg-white/8 cursor-pointer transition-colors"
          >
            Exit experience mode
          </Link>
        </Glass>
      </div>
    )
  }

  // The settings content is shared by three presentations (docs/base
  // size classes): a pinned inspector pane on desktop, a slide-over
  // pane on tablet, a bottom sheet on phone.
  const settingsContent = (
    <>
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
              <Label>Ceiling</Label>
              <Pills
                options={CEILING_OPTIONS}
                current={currentCeiling}
                urlFor={(id) => urlForDefault('ceiling', id, 'discs')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Loofah</Label>
              <Pills
                options={LOOFAH_OPTIONS}
                current={currentLoofah}
                urlFor={(id) => urlForDefault('loofah', id, 'fibrous')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Seating</Label>
              <Pills
                options={SEATING_OPTIONS}
                current={currentSeating}
                urlFor={(id) => urlForDefault('seating', id, 'cubes')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Seat beams</Label>
              <Pills
                options={BEAM_OPTIONS}
                current={currentBeams}
                urlFor={(id) => urlForDefault('beams', id, 'clusters')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Pathway</Label>
              <Pills
                options={PATHWAY_OPTIONS}
                current={currentPathway}
                urlFor={(id) => urlForDefault('pathway', id, 'dark')}
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
    </>
  )

  return (
    <>
      {/* Top-left: navigation dropdowns (slimmer on phones so the
          Notes / Settings pills never crowd them) */}
      <div className="fixed top-3 left-3 z-10 select-none">
        <Glass className="rounded-2xl p-3 md:p-4 space-y-2 w-44 md:w-56">
          <Dropdown options={proposalOptions} current={proposalId} urlFor={proposalUrlFor} />
          <Dropdown options={cameraOptions} current={currentView} urlFor={(id) => urlForSet('view', id)} />
        </Glass>
      </div>

      {/* Desktop (1280+): pinned inspector pane — a glass pane floating
          over the room. It owns the right-hand strip; the player bar
          ends before this strip begins, so the two never overlap. */}
      <aside
        aria-label="Settings"
        className="hidden xl:block fixed top-3 right-3 bottom-3 w-[420px] z-10 select-none"
      >
        <Glass className="h-full rounded-2xl overflow-hidden p-4 space-y-4">
          {settingsContent}
        </Glass>
      </aside>

      {/* Tablet and phone: the inspector collapses first (docs/base
          adaptive-layout collapse order) behind a Settings toggle. */}
      <div className="xl:hidden fixed top-3 right-3 z-10 select-none">
        <Glass
          as="button"
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          style={TRANSITION}
          className="rounded-2xl min-h-[44px] px-4 text-[13px] text-white/85 hover:text-white hover:bg-white/8 cursor-pointer transition-colors"
        >
          Settings
        </Glass>
      </div>

      {/* Slide-over pane (tablet) / bottom sheet (phone). Native dialog:
          focus trapping, Esc-to-close, and inert background for free. */}
      <dialog
        ref={dialogRef}
        aria-label="Settings"
        className="settings-dialog select-none"
        onClose={() => setSettingsOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setSettingsOpen(false)
        }}
      >
        <Glass className="rounded-t-2xl md:rounded-2xl md:h-full overflow-hidden p-3 space-y-2.5 md:p-4 md:space-y-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {/* Grabber (phone) + visible close */}
          <div className="relative flex items-center justify-end min-h-[28px]">
            <div
              aria-hidden="true"
              className="md:hidden absolute left-1/2 -translate-x-1/2 top-1 h-1 w-9 rounded-full bg-white/30"
            />
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              style={TRANSITION}
              className="flex items-center gap-2 min-h-[28px] px-2.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/8 cursor-pointer transition-colors"
            >
              <CloseGlyph size={10} />
              Close
            </button>
          </div>
          {settingsContent}
        </Glass>
      </dialog>
    </>
  )
}
