import { useState } from 'react'

// --- Style objects ---

const mono = {
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.1em',
}

const serif = {
  fontFamily: 'var(--font-serif)',
}

const rule = {
  borderTop: '1px solid var(--color-rule)',
}

// --- Data ---

const DIMENSIONS = [
  { label: 'Total ceiling height', value: '4.2 m' },
  { label: 'Usable height after beams', value: '3.52 m' },
  { label: 'Pillar to opposite wall', value: '5.82 m' },
  { label: 'Entrance width', value: '240 cm' },
  { label: 'Entrance height', value: '352 cm' },
  { label: 'Approximate floor area', value: '~10 m × 10 m' },
  { label: 'Max comfortable capacity', value: '30 adults' },
]

const LANDMARKS = [
  {
    name: 'Entrance',
    position: 'Left side of the exhibition zone, opening from the retail area.',
    image: '/references/firefly-room-dimensions_entrance.webp',
    alt: 'Floor plan with entrance highlighted in green on the left side of the exhibition area',
    color: '#22c55e',
  },
  {
    name: 'Big wall',
    position: 'Runs horizontally along the top/north side, spanning the full width.',
    image: '/references/firefly-room-dimensions_big-wall.webp',
    alt: 'Floor plan with the big wall highlighted in magenta across the top of the exhibition area',
    color: '#c026d3',
  },
  {
    name: 'Back windows',
    position: 'Far right/east wall. Must be blacked out completely for darkness.',
    image: '/references/firefly-room-dimensions_back-windows.webp',
    alt: 'Floor plan with back windows highlighted in blue on the right wall of the exhibition area',
    color: '#3b82f6',
  },
  {
    name: 'Vent',
    position: 'On the back wall, must be covered or concealed.',
    image: null,
    alt: null,
    color: '#f59e0b',
  },
  {
    name: 'Total exhibition area',
    position: 'The rectangular section occupying the right portion of the building.',
    image: '/references/firefly-room-dimensions_total-exhibition-area.webp',
    alt: 'Floor plan with total exhibition area outlined in red',
    color: '#ef4444',
  },
]

const CONSTRAINTS = [
  'Track lights are already mounted on the ceiling. They cannot be removed. The dropped ceiling module system must sit below them or accommodate them.',
  'The room has structural columns and exposed beams that divide the ceiling into zones.',
  'The space is in a government-leased venue, so all installations must be modular and removable.',
]

// --- Ceiling module calculations ---

function calcOptionA(roomW = 10, roomH = 10) {
  const squaresPerRow = Math.floor(roomW / 0.6)
  const squaresPerCol = Math.floor(roomH / 0.6)
  const totalSquares = squaresPerRow * squaresPerCol

  const modulesPerRow = Math.floor(squaresPerRow / 2)
  const modulesPerCol = Math.floor(squaresPerCol / 2)
  const totalModules = modulesPerRow * modulesPerCol

  const blockedModules = Math.ceil(totalModules * 0.15)
  const usableModules = totalModules - blockedModules

  return {
    squaresPerRow,
    squaresPerCol,
    totalSquares,
    modulesPerRow,
    modulesPerCol,
    totalModules,
    blockedModules,
    usableModules,
    totalLEDs: usableModules * 18,
    totalSensors: usableModules,
    gridUnit: '60 cm × 60 cm',
    moduleSize: '120 cm × 120 cm (2×2 squares)',
  }
}

function calcOptionB(roomW = 10, roomH = 10) {
  const modulesPerRow = Math.floor(roomW / 1.2)
  const modulesPerCol = Math.floor(roomH / 1.2)
  const totalModules = modulesPerRow * modulesPerCol

  const blockedModules = Math.ceil(totalModules * 0.15)
  const usableModules = totalModules - blockedModules

  return {
    modulesPerRow,
    modulesPerCol,
    totalModules,
    blockedModules,
    usableModules,
    totalLEDs: usableModules * 18,
    totalSensors: usableModules,
    gridUnit: '120 cm × 120 cm',
    moduleSize: '120 cm × 120 cm (single panel)',
  }
}

const optA = calcOptionA()
const optB = calcOptionB()

// --- Grid visualization component ---

function CeilingGrid({ modulesPerRow, modulesPerCol, blockedModules, label }) {
  const cells = []
  let blockedCount = 0

  const isBlocked = (r, c) => {
    if (r === Math.floor(modulesPerCol / 3) && c > 0 && c < modulesPerRow - 1) return true
    if (r === Math.floor(modulesPerCol * 2 / 3) && c > 0 && c < modulesPerRow - 1) return true
    if (c === Math.floor(modulesPerRow / 3) && r > 1 && r < modulesPerCol - 1) return true
    return false
  }

  for (let r = 0; r < modulesPerCol; r++) {
    for (let c = 0; c < modulesPerRow; c++) {
      const blocked = isBlocked(r, c) && blockedCount < blockedModules
      if (blocked) blockedCount++
      cells.push(
        <div
          key={`${r}-${c}`}
          className={`border aspect-square flex items-center justify-center text-[8px] ${
            blocked
              ? 'bg-red-500/15 border-red-500/30 text-red-400/40'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/40'
          }`}
          title={blocked ? 'Blocked by beam or track light' : `Module (${r},${c})`}
        >
          {blocked ? '✕' : '·'}
        </div>
      )
    }
  }

  return (
    <div>
      <p className="mb-2" style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}>{label}</p>
      <div
        className="grid gap-px max-w-md"
        style={{ gridTemplateColumns: `repeat(${modulesPerRow}, 1fr)` }}
      >
        {cells}
      </div>
      <div className="flex gap-4 mt-2" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-500/20 border border-emerald-500/30 inline-block" /> Active module
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500/15 border border-red-500/30 inline-block" /> Blocked (beam/light)
        </span>
      </div>
    </div>
  )
}

// --- Stat display ---

function StatRow({ label, value, highlight }) {
  return (
    <div
      className="flex justify-between py-2"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <span style={{ ...serif, fontSize: '1rem', fontWeight: 300, color: 'var(--color-muted)' }}>
        {label}
      </span>
      <span
        style={{
          ...mono,
          fontSize: '13px',
          color: highlight ? 'var(--color-text)' : 'var(--color-muted)',
          alignSelf: 'center',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// --- Section label ---

function SectionLabel({ children }) {
  return (
    <h2
      className="pt-8 pb-4"
      style={{
        ...mono,
        ...rule,
        fontSize: '13px',
        color: 'var(--color-muted)',
      }}
    >
      {children}
    </h2>
  )
}

// --- Page ---

export default function SpacePage() {
  const [activeLandmark, setActiveLandmark] = useState(null)

  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-16">
        <p
          className="mb-3"
          style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
        >
          Phase 1
        </p>
        <h1
          className="mb-4"
          style={{
            ...serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 300,
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          Space and architecture
        </h1>
        <p
          className="max-w-xl"
          style={{
            ...serif,
            fontSize: '1.125rem',
            fontWeight: 300,
            color: 'var(--color-muted)',
            lineHeight: 1.7,
          }}
        >
          The exhibition occupies the right portion of the visitor service center (遊客服務中心).
          The left section is retail/merchandise.
        </p>
      </div>

      {/* Room dimensions */}
      <section className="mb-16">
        <SectionLabel>Room dimensions</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
          <div>
            {DIMENSIONS.map((d) => (
              <StatRow key={d.label} label={d.label} value={d.value} />
            ))}
          </div>
          <div>
            <img
              src="/references/firefly-room-dimensions.png"
              alt="Architectural floor plan of the visitor service center with room dimensions"
              className="w-full"
            />
            <p
              className="mt-3"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
            >
              Full architectural floor plan with dimensions
            </p>
          </div>
        </div>
      </section>

      {/* Room layout / landmarks */}
      <section className="mb-16">
        <SectionLabel>Room layout</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
          <div className="space-y-0">
            {LANDMARKS.map((lm) => (
              <button
                key={lm.name}
                onClick={() => setActiveLandmark(activeLandmark === lm.name ? null : lm.name)}
                aria-pressed={activeLandmark === lm.name}
                className="w-full text-left py-3 cursor-pointer block"
                style={{
                  borderBottom: '1px solid var(--color-rule)',
                  opacity: activeLandmark === lm.name ? 1 : 0.7,
                  transition: 'opacity 0.2s ease',
                  background: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={(e) => {
                  if (activeLandmark !== lm.name) e.currentTarget.style.opacity = '0.7'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-1.5 h-1.5 shrink-0"
                    style={{ backgroundColor: lm.color }}
                  />
                  <span style={{ ...serif, fontSize: '1rem', fontWeight: 400, color: 'var(--color-text)' }}>
                    {lm.name}
                  </span>
                </div>
                <p
                  className="pl-4"
                  style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
                >
                  {lm.position}
                </p>
              </button>
            ))}
          </div>
          <div>
            {activeLandmark && LANDMARKS.find((l) => l.name === activeLandmark)?.image ? (
              <img
                src={LANDMARKS.find((l) => l.name === activeLandmark).image}
                alt={LANDMARKS.find((l) => l.name === activeLandmark).alt}
                className="w-full"
              />
            ) : (
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{ border: '1px solid var(--color-rule)' }}
              >
                <p style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}>
                  Select a landmark to view its location
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Venue photos */}
      <section className="mb-16">
        <SectionLabel>Venue photos</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <img
              src="/references/exhibition-details_exhibition-space.webp"
              alt="Interior of the venue showing the exhibition zone outlined in pink and the retail zone labeled on the left"
              className="w-full"
            />
            <p
              className="mt-2"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
            >
              Exhibition zone (pink outline) and retail area (left)
            </p>
          </div>
          <div>
            <img
              src="/references/exhibition-details_exhibition-sections.webp"
              alt="Interior photo with labeled sections: entrance door on left, back wall in center, vent to cover, back windows on right"
              className="w-full"
            />
            <p
              className="mt-2"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
            >
              Sections: entrance, back wall, vent, back windows
            </p>
          </div>
          <div>
            <img
              src="/references/exhibition-details_exhibition-other-view.webp"
              alt="Full room view showing structural columns, ceiling track lights, dark wainscoting, and windows with greenery outside"
              className="w-full"
            />
            <p
              className="mt-2"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
            >
              Columns, track lighting, and wainscoting detail
            </p>
          </div>
          <div>
            <img
              src="/references/exhibition-details_exhibition-curtains.webp"
              alt="Deep red curtains used to partition the exhibition area from the rest of the building"
              className="w-full"
            />
            <p
              className="mt-2"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
            >
              Curtains for sectioning the exhibition area
            </p>
          </div>
        </div>
      </section>

      {/* Existing constraints */}
      <section className="mb-16">
        <SectionLabel>Existing constraints</SectionLabel>
        <ul className="mt-6 space-y-4">
          {CONSTRAINTS.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="shrink-0 mt-0.5"
                style={{ ...mono, fontSize: '13px', color: 'var(--color-amber)' }}
              >
                !
              </span>
              <span style={{ ...serif, fontSize: '1rem', fontWeight: 300, color: 'var(--color-muted)', lineHeight: 1.7 }}>
                {c}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ceiling module system */}
      <section className="mb-16">
        <SectionLabel>Ceiling module system</SectionLabel>
        <p
          className="mt-6 mb-10 max-w-xl"
          style={{
            ...serif,
            fontSize: '1rem',
            fontWeight: 300,
            color: 'var(--color-muted)',
            lineHeight: 1.7,
          }}
        >
          Two options for the dropped ceiling grid. Each module contains 18 greenish-tone LEDs
          and 1 infrared motion detector. LEDs operate in sequences driven by an algorithm —
          at any moment some are on, some are off. Compare both options below.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Option A */}
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>A</span>
              <h3 style={{ ...serif, fontSize: '1.25rem', fontWeight: 300, color: 'var(--color-text)' }}>
                Small squares
              </h3>
            </div>
            <p
              className="mb-6"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)', lineHeight: 1.7 }}
            >
              Grid unit: 60 cm × 60 cm. One module = 4 squares arranged 2×2 = 120 cm × 120 cm total.
            </p>

            <div>
              <StatRow label="Grid unit" value={optA.gridUnit} />
              <StatRow label="Module size" value={optA.moduleSize} />
              <StatRow label="Grid layout" value={`${optA.squaresPerRow} × ${optA.squaresPerCol} squares`} />
              <StatRow label="Total module slots" value={optA.totalModules} />
              <StatRow label="Blocked by beams/lights (~15%)" value={optA.blockedModules} />
              <StatRow label="Usable modules" value={optA.usableModules} highlight />
              <StatRow label="Total LEDs" value={optA.totalLEDs.toLocaleString()} highlight />
              <StatRow label="Total IR sensors" value={optA.totalSensors} highlight />
            </div>

            <div className="mt-8">
              <CeilingGrid
                modulesPerRow={optA.modulesPerRow}
                modulesPerCol={optA.modulesPerCol}
                blockedModules={optA.blockedModules}
                label="Module layout (each cell = one 2×2 module)"
              />
            </div>
          </div>

          {/* Option B */}
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>B</span>
              <h3 style={{ ...serif, fontSize: '1.25rem', fontWeight: 300, color: 'var(--color-text)' }}>
                Large panels
              </h3>
            </div>
            <p
              className="mb-6"
              style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)', lineHeight: 1.7 }}
            >
              Grid unit: 120 cm × 120 cm. Single panel per module.
            </p>

            <div>
              <StatRow label="Grid unit" value={optB.gridUnit} />
              <StatRow label="Module size" value={optB.moduleSize} />
              <StatRow label="Grid layout" value={`${optB.modulesPerRow} × ${optB.modulesPerCol} panels`} />
              <StatRow label="Total module slots" value={optB.totalModules} />
              <StatRow label="Blocked by beams/lights (~15%)" value={optB.blockedModules} />
              <StatRow label="Usable modules" value={optB.usableModules} highlight />
              <StatRow label="Total LEDs" value={optB.totalLEDs.toLocaleString()} highlight />
              <StatRow label="Total IR sensors" value={optB.totalSensors} highlight />
            </div>

            <div className="mt-8">
              <CeilingGrid
                modulesPerRow={optB.modulesPerRow}
                modulesPerCol={optB.modulesPerCol}
                blockedModules={optB.blockedModules}
                label="Module layout (each cell = one panel)"
              />
            </div>
          </div>
        </div>

        {/* Ceiling design reference */}
        <div className="mt-12">
          <img
            src="/references/exhibition-details_ceiling-designs.webp"
            alt="Reference ceiling with triangular acoustic panels forming a mountain topology pattern, annotated with instruction to use this design"
            className="max-w-lg w-full"
          />
          <p
            className="mt-2"
            style={{ ...serif, fontSize: '0.875rem', fontWeight: 300, color: 'var(--color-dim)' }}
          >
            Reference: triangular ceiling panels resembling mountain topology
          </p>
        </div>
      </section>
    </div>
  )
}
