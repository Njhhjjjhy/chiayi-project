const WALL_OPTIONS = [
  {
    num: 1,
    name: 'Living moss wall',
    description: 'A wall-sized surface covered in living moss or lichen, woven into wire mesh and mounted directly on the wall.',
    inspiration: 'Olafur Eliasson\'s "Moss wall" (1994), exhibited at Taipei Fine Arts Museum 2025. Uses local Alishan mountain moss instead of reindeer moss.',
    themeConnection: 'The wall is alive, just like the fireflies. Ecology made tangible. Visitors smell the forest.',
    materials: [
      'Local Alishan mountain moss or lichen',
      'Galvanized wire mesh',
      'Wood frame',
      'Misting system for hydration',
    ],
    sensory: 'Visual texture of living organic surface, earthy forest scent, subtle color shifts as moss hydration changes.',
    inDarkness: 'Moss texture catches and scatters the green firefly light, creating soft organic shadows across the wall surface.',
    complexity: 'medium',
    cost: 'medium',
    costNote: '50-150k TWD',
    accent: '#4ade80',
  },
  {
    num: 2,
    name: 'Layered mountain silhouette',
    description: 'Multiple layers of thin wood or foam-core panels cut into mountain ridge profiles, spaced 5-15 cm apart, with LED rope lights behind each layer.',
    inspiration: 'The existing mountain concept, refined. Layers create depth through parallax.',
    themeConnection: 'Alishan\'s mountain landscape is the fireflies\' home. The wall is their habitat made visible.',
    materials: [
      '4-6 layers of 6 mm plywood or foam-core',
      'LED rope lights (warm amber to deep green gradient)',
      'Spacer brackets',
      'Black paint for edges',
    ],
    sensory: 'Visual depth through layered silhouettes, warm-to-cool color gradient from back to front.',
    inDarkness: 'Backlit silhouettes glow softly, providing a warm horizon line below the firefly ceiling. Colors shift from deep green (foreground) to warm amber/orange (background, simulating sunset).',
    complexity: 'low',
    cost: 'low',
    costNote: 'Under 50k TWD',
    accent: '#fb923c',
  },
  {
    num: 3,
    name: 'Reflective fracture wall',
    description: 'Triangular and angular mirror fragments mounted across the wall surface, creating kaleidoscopic reflections.',
    inspiration: 'Olafur Eliasson\'s "When love is not enough wall" (2007). Stainless steel mirrors with crystalline triangular forms.',
    themeConnection: 'Directly reinforces "you are what you see." Visitors see themselves fragmented among reflected firefly lights. Buddhism\'s "everything is an extension of yourself" made literal — your reflection merges with the fireflies.',
    materials: [
      'Mirror acrylic panels (safer than glass)',
      'Triangular mounting brackets',
      'Plywood backing',
      'Black adhesive for edges',
    ],
    sensory: 'Multiplied reflections of every light source in the room, including visitors\' own silhouettes.',
    inDarkness: 'Even a few active firefly LEDs produce dozens of reflected points of light across the wall. Visitor movement causes the reflections to shift constantly.',
    complexity: 'medium',
    cost: 'medium',
    costNote: '50-150k TWD',
    accent: '#a78bfa',
  },
  {
    num: 4,
    name: 'Fiber veil wall',
    description: 'A deep-pile wall surface (10-15 cm thick) made from local natural fibers with embedded micro-LEDs at varying depths.',
    inspiration: 'Fireflies emerging from undergrowth. The wall is the forest floor turned vertical.',
    themeConnection: 'Fireflies emerging from undergrowth. The wall is the forest floor turned vertical.',
    materials: [
      'Paper mulberry bark',
      'Raw ramie fiber',
      'Dried pampas grass (or combination)',
      'Wire mesh backing',
      'Warm-white micro-LEDs embedded at 3-15 cm depth',
    ],
    sensory: 'Glow from within a textured organic surface. Tactile — visitors can lean close and see individual lights sharper or softer depending on depth. Faint natural scent from fibers.',
    inDarkness: 'The wall appears to breathe with scattered points of soft light emerging through layers of fiber. An intimate, close-looking counterpart to the ceiling\'s overhead display.',
    complexity: 'high',
    cost: 'medium to high',
    costNote: '100-200k+ TWD',
    accent: '#f59e0b',
  },
  {
    num: 5,
    name: 'Projection-reactive surface',
    description: 'A matte white or light fabric surface used as a projection canvas, connected to the same infrared detection system as the ceiling modules.',
    inspiration: 'Interactive projection art. Visitors become part of the artwork through their shadow silhouettes.',
    themeConnection: 'Visitors become part of the artwork. Their shadow silhouettes appear on the wall surrounded by projected firefly particles. When a visitor moves, the projected fireflies scatter and regroup around them.',
    materials: [
      'White projection fabric or painted matte surface',
      'Short-throw projector',
      'Custom projection software',
      'Connection to IR sensor network',
    ],
    sensory: 'Interactive projections that respond to visitor movement in real time.',
    inDarkness: 'The projected fireflies provide their own light on the wall surface. Visitor silhouettes create dynamic negative spaces within the projection.',
    complexity: 'high',
    cost: 'high',
    costNote: '150k+ TWD',
    accent: '#38bdf8',
  },
]

const COMPLEXITY_COLORS = {
  low: '#4ade80',
  medium: '#f5a623',
  high: '#BD2B2C',
}

const COST_COLORS = {
  low: '#4ade80',
  medium: '#f5a623',
  'medium to high': '#fb923c',
  high: '#BD2B2C',
}

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  letterSpacing: '0.1em',
}

const serif = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 300,
}

const rule = {
  borderTop: '1px solid var(--color-rule)',
}

function WallOptionCard({ option }) {
  return (
    <div style={rule} className="pt-8 pb-10">
      {/* Option number + name */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-[6px] h-[6px] shrink-0"
            style={{ backgroundColor: option.accent, borderRadius: '50%' }}
          />
          <span style={{ ...mono, color: 'var(--color-muted)' }}>
            {String(option.num).padStart(2, '0')}
          </span>
        </span>
        <h3 style={{ ...serif, fontSize: '1.5rem', color: 'var(--color-text)' }}>
          {option.name}
        </h3>
      </div>

      {/* Description */}
      <p
        style={{ ...serif, fontWeight: 400, color: 'var(--color-muted)' }}
        className="text-base leading-relaxed mb-3 max-w-2xl"
      >
        {option.description}
      </p>

      {/* Inspiration */}
      {option.inspiration && (
        <p
          style={{ ...serif, fontWeight: 300, fontStyle: 'italic', color: 'var(--color-dim)' }}
          className="text-sm leading-relaxed mb-6 max-w-2xl"
        >
          {option.inspiration}
        </p>
      )}

      {/* Content sections in two columns on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 mb-6">
        {/* Theme connection */}
        <div>
          <h4 style={{ ...mono, color: 'var(--color-dim)' }} className="mb-1.5">
            Theme connection
          </h4>
          <p style={{ ...serif, fontWeight: 400, color: 'var(--color-muted)' }} className="text-sm leading-relaxed">
            {option.themeConnection}
          </p>
        </div>

        {/* Materials */}
        <div>
          <h4 style={{ ...mono, color: 'var(--color-dim)' }} className="mb-1.5">
            Materials
          </h4>
          <ul className="space-y-0.5">
            {option.materials.map((m, i) => (
              <li
                key={i}
                style={{ ...serif, fontWeight: 400, color: 'var(--color-muted)' }}
                className="text-sm flex gap-2"
              >
                <span style={{ color: 'var(--color-dim)' }} className="shrink-0">·</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Sensory experience */}
        <div>
          <h4 style={{ ...mono, color: 'var(--color-dim)' }} className="mb-1.5">
            Sensory experience
          </h4>
          <p style={{ ...serif, fontWeight: 400, color: 'var(--color-muted)' }} className="text-sm leading-relaxed">
            {option.sensory}
          </p>
        </div>

        {/* Behavior in darkness */}
        <div>
          <h4 style={{ ...mono, color: 'var(--color-dim)' }} className="mb-1.5">
            Behavior in darkness
          </h4>
          <p style={{ ...serif, fontWeight: 400, color: 'var(--color-muted)' }} className="text-sm leading-relaxed">
            {option.inDarkness}
          </p>
        </div>
      </div>

      {/* Complexity + Cost badges */}
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-[5px] h-[5px]"
            style={{ backgroundColor: COMPLEXITY_COLORS[option.complexity], borderRadius: '50%' }}
          />
          <span style={{ ...mono, color: 'var(--color-muted)' }}>
            {option.complexity} complexity
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-[5px] h-[5px]"
            style={{ backgroundColor: COST_COLORS[option.cost], borderRadius: '50%' }}
          />
          <span style={{ ...mono, color: 'var(--color-muted)' }}>
            {option.costNote}
          </span>
        </span>
      </div>
    </div>
  )
}

export default function WallPage() {
  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-16">
        <p style={{ ...mono, color: 'var(--color-dim)' }} className="mb-3">
          Phase 2
        </p>
        <h1
          style={{
            ...serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            color: 'var(--color-text)',
          }}
          className="mb-3"
        >
          The big wall
        </h1>
        <p
          style={{ ...serif, fontWeight: 400, color: 'var(--color-muted)' }}
          className="text-base max-w-xl leading-relaxed"
        >
          5 treatment options below. Each works with the firefly ceiling system
          and reinforces the core theme: "you are what you see."
        </p>
      </div>

      {/* Wall location reference */}
      <section className="mb-16">
        <img
          src="/references/firefly-room-dimensions_big-wall.webp"
          alt="Floor plan with the big wall highlighted in magenta across the top of the exhibition area"
          className="max-w-lg w-full"
          style={{ border: '1px solid var(--color-rule)' }}
        />
        <p style={{ ...mono, color: 'var(--color-dim)' }} className="mt-2">
          The big wall position (magenta highlight) on the architectural floor plan
        </p>
      </section>

      {/* Quick comparison table */}
      <section className="mb-16 overflow-x-auto">
        <h2
          style={{ ...serif, fontSize: '1.25rem', color: 'var(--color-text)' }}
          className="mb-5"
        >
          Quick comparison
        </h2>
        <table className="w-full min-w-[600px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-rule)' }}>
              <th style={{ ...mono, color: 'var(--color-dim)', fontWeight: 'normal', textAlign: 'left' }} className="py-2 pr-4">#</th>
              <th style={{ ...mono, color: 'var(--color-dim)', fontWeight: 'normal', textAlign: 'left' }} className="py-2 pr-4">Option</th>
              <th style={{ ...mono, color: 'var(--color-dim)', fontWeight: 'normal', textAlign: 'left' }} className="py-2 pr-4">Complexity</th>
              <th style={{ ...mono, color: 'var(--color-dim)', fontWeight: 'normal', textAlign: 'left' }} className="py-2 pr-4">Cost</th>
              <th style={{ ...mono, color: 'var(--color-dim)', fontWeight: 'normal', textAlign: 'left' }} className="py-2">Key feature</th>
            </tr>
          </thead>
          <tbody>
            {WALL_OPTIONS.map((opt) => (
              <tr key={opt.num} style={{ borderBottom: '1px solid var(--color-rule)' }}>
                <td className="py-2.5 pr-4">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-[5px] h-[5px]"
                      style={{ backgroundColor: opt.accent, borderRadius: '50%' }}
                    />
                    <span style={{ ...mono, color: 'var(--color-muted)' }}>
                      {String(opt.num).padStart(2, '0')}
                    </span>
                  </span>
                </td>
                <td className="py-2.5 pr-4" style={{ ...serif, fontWeight: 400, color: 'var(--color-text)' }}>
                  {opt.name}
                </td>
                <td className="py-2.5 pr-4">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-[5px] h-[5px]"
                      style={{ backgroundColor: COMPLEXITY_COLORS[opt.complexity], borderRadius: '50%' }}
                    />
                    <span style={{ ...mono, color: 'var(--color-muted)' }}>
                      {opt.complexity}
                    </span>
                  </span>
                </td>
                <td className="py-2.5 pr-4" style={{ ...mono, color: 'var(--color-muted)' }}>
                  {opt.costNote}
                </td>
                <td className="py-2.5" style={{ ...serif, fontWeight: 400, color: 'var(--color-dim)' }}>{
                  opt.num === 1 ? 'Living, scented surface' :
                  opt.num === 2 ? 'Layered parallax depth' :
                  opt.num === 3 ? 'Kaleidoscopic self-reflection' :
                  opt.num === 4 ? 'Fiber texture with embedded LEDs' :
                  'Real-time visitor interaction'
                }</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Full option details */}
      <section>
        <h2
          style={{ ...serif, fontSize: '1.25rem', color: 'var(--color-text)' }}
          className="mb-2"
        >
          Detailed options
        </h2>
        {WALL_OPTIONS.map((opt) => (
          <WallOptionCard key={opt.num} option={opt} />
        ))}
      </section>

      {/* External references */}
      <section className="mt-16 pt-8" style={rule}>
        <h2 style={{ ...mono, color: 'var(--color-dim)' }} className="mb-5">
          Reference links
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Eliasson — Moss wall (1994)', url: 'https://olafureliasson.net/artwork/moss-wall-1994/', note: 'Wall option 1 inspiration' },
            { label: 'Eliasson — Walk through wall (2005)', url: 'https://olafureliasson.net/artwork/walk-through-wall-2005/', note: 'Moire and optical effects reference' },
            { label: 'Eliasson — When love is not enough wall (2007)', url: 'https://olafureliasson.net/artwork/when-love-is-not-enough-wall-2007/', note: 'Wall option 3 inspiration' },
            { label: 'Eliasson — gallery overview', url: 'https://www.tanyabonakdargallery.com/artists/27-olafur-eliasson/', note: 'Exhibition quality benchmark' },
          ].map((ref) => (
            <a
              key={ref.url}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <span
                style={{ ...mono, color: 'var(--color-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                className="group-hover:opacity-80 transition-opacity"
              >
                {ref.label}
              </span>
              <span
                style={{ ...serif, fontWeight: 400, color: 'var(--color-dim)' }}
                className="text-sm ml-3"
              >
                {ref.note}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
