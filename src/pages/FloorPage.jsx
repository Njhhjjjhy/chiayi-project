const BASE_LAYER_OPTIONS = [
  {
    name: 'Artificial turf',
    desc: 'Short pile, dark green. Consistent surface, easy to source.',
  },
  {
    name: 'Dried grass mats',
    desc: 'Layered for texture variation. More natural feel but less uniform.',
  },
  {
    name: 'Combination',
    desc: 'Turf as base with dried grass mats in patches. Best of both — consistent footing with areas of natural texture.',
  },
]

const SCATTERED_ELEMENTS = [
  { name: 'Smooth river stones', spec: 'Fist-sized or smaller, no sharp edges.' },
  { name: 'Driftwood and fallen branches', spec: 'Small pieces, sanded smooth.' },
  { name: 'Dried leaves', spec: 'Scattered in patches for visual and tactile variety.' },
  { name: 'Moss patches', spec: 'Real or artificial, placed in clusters.' },
]

const SAFETY_REQUIREMENTS = [
  'No tripping hazards: all floor elements must be flush or gently ramped, nothing protruding more than 3 cm above the base surface.',
  'Nothing sharp: all stones must be smooth, all wood must be sanded.',
  'Subtle ground-level edge lighting along the walls for safety navigation. Dim enough not to break the dark immersion (warm amber, under 5 lux), bright enough to prevent falls.',
  'Clear pathways from entrance to exit must be maintained even with scattered elements.',
]

const MODULARITY_REQUIREMENTS = [
  'Assembled and disassembled without permanent modifications to the building floor.',
  'Transportable in sections.',
  'Storable when not in use.',
  'Consider a modular mat system (interlocking tiles or rolled sections) as the base, with scattered elements placed on top during installation.',
]

const SOUND_SPECS = [
  'At least 4 speakers positioned in the corners or along the walls for spatial distribution.',
  'A looping audio track of at least 30 minutes before repeating (so visitors who stay the full 15-20 minutes do not hear a loop point).',
  'Volume level: audible but not dominant. Visitors should be able to speak to each other in quiet voices.',
]

const SOUND_LAYERS = [
  { layer: 'Forest ambience', desc: 'Cicadas, rustling leaves, distant water, wind through bamboo.' },
  { layer: 'Musical layer', desc: 'Slow, minimal, evokes nightfall. Not melodic enough to become the focus.' },
  { layer: 'Spatial progression', desc: 'Volume increases gradually as visitors move deeper into the dark space.' },
]

const mono = { fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',  }
const serif = { fontFamily: 'var(--font-serif)' }
const rule = { borderTop: '1px solid var(--color-rule)' }

export default function FloorPage() {
  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-16">
        <p
          className="mb-4"
          style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
        >
          Phase 5
        </p>
        <h1
          className="mb-5"
          style={{
            ...serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 300,
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          Floor and sound
        </h1>
        <p
          className="max-w-xl leading-relaxed"
          style={{ ...serif, fontWeight: 300, color: 'var(--color-muted)' }}
        >
          The floor must feel like walking through a forest at night. Combined with the firefly
          ceiling, wall treatment, and ambient sound, every surface contributes
          to a single continuous immersion.
        </p>
      </div>

      {/* Floor design */}
      <section className="mb-20">
        <h2
          className="mb-10"
          style={{
            ...serif,
            fontSize: '1.35rem',
            fontWeight: 300,
            color: 'var(--color-text)',
          }}
        >
          Floor design
        </h2>

        {/* Base layer */}
        <div className="mb-12" style={rule}>
          <p
            className="pt-4 mb-3"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}
          >
            Base layer
          </p>
          <p
            className="mb-6 max-w-2xl leading-relaxed"
            style={{ ...serif, fontWeight: 300, fontSize: '0.95rem', color: 'var(--color-muted)' }}
          >
            A soft, uneven surface covering the entire exhibition area (~10 × 10 m). The surface
            must feel different from a normal floor the moment visitors step on it. The unevenness
            should be subtle enough to walk safely, but noticeable enough to register as "not indoors."
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {BASE_LAYER_OPTIONS.map((opt, i) => (
              <div
                key={opt.name}
                className="py-4"
                style={i > 0 ? { borderLeft: '1px solid var(--color-rule)' } : {}}
              >
                <div className={i > 0 ? 'pl-6' : ''}>
                  <p
                    className="mb-1"
                    style={{ ...serif, fontWeight: 400, color: 'var(--color-text)' }}
                  >
                    {opt.name}
                  </p>
                  <p
                    className="leading-relaxed"
                    style={{ ...serif, fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-muted)' }}
                  >
                    {opt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scattered elements */}
        <div className="mb-12" style={rule}>
          <p
            className="pt-4 mb-3"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}
          >
            Scattered elements
          </p>
          <p
            className="mb-6 max-w-2xl leading-relaxed"
            style={{ ...serif, fontWeight: 300, fontSize: '0.95rem', color: 'var(--color-muted)' }}
          >
            Placed across the floor to reinforce the forest feeling.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
            {SCATTERED_ELEMENTS.map((el) => (
              <div key={el.name}>
                <p style={{ ...serif, fontWeight: 400, color: 'var(--color-text)' }}>
                  {el.name}
                </p>
                <p
                  className="leading-relaxed"
                  style={{ ...serif, fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-muted)' }}
                >
                  {el.spec}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety */}
        <div className="mb-12" style={rule}>
          <p
            className="pt-4 mb-3"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}
          >
            Safety requirements
          </p>
          <p
            className="mb-6 max-w-2xl leading-relaxed"
            style={{ ...serif, fontWeight: 300, fontSize: '0.95rem', color: 'var(--color-muted)' }}
          >
            The room is dark. Visitors are looking up at the ceiling, not at their feet.
          </p>
          <ul className="space-y-3">
            {SAFETY_REQUIREMENTS.map((req, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span
                  className="shrink-0 mt-2 inline-block"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-amber)',
                  }}
                />
                <span style={{ ...serif, fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modularity */}
        <div style={rule}>
          <p
            className="pt-4 mb-3"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}
          >
            Modularity
          </p>
          <p
            className="mb-6 max-w-2xl leading-relaxed"
            style={{ ...serif, fontWeight: 300, fontSize: '0.95rem', color: 'var(--color-muted)' }}
          >
            The space is in a government-leased venue. The entire floor treatment must be:
          </p>
          <ul className="space-y-3">
            {MODULARITY_REQUIREMENTS.map((req, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span
                  className="shrink-0"
                  style={{ color: 'var(--color-dim)' }}
                >
                  ·
                </span>
                <span style={{ ...serif, fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sound environment */}
      <section>
        <h2
          className="mb-10"
          style={{
            ...serif,
            fontSize: '1.35rem',
            fontWeight: 300,
            color: 'var(--color-text)',
          }}
        >
          Sound environment
        </h2>

        {/* Sound layers */}
        <div className="mb-12" style={rule}>
          <p
            className="pt-4 mb-3"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}
          >
            Sound layers
          </p>
          <p
            className="mb-6 max-w-2xl leading-relaxed"
            style={{ ...serif, fontWeight: 300, fontSize: '0.95rem', color: 'var(--color-muted)' }}
          >
            Ambient sound fills the entire space continuously during operating hours.
            Sound is the bridge between the bright entrance and the dark interior.
          </p>
          <div className="space-y-4">
            {SOUND_LAYERS.map((sl) => (
              <div key={sl.layer}>
                <p style={{ ...serif, fontWeight: 400, color: 'var(--color-text)' }}>
                  {sl.layer}
                </p>
                <p
                  className="leading-relaxed"
                  style={{ ...serif, fontWeight: 300, fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--color-muted)' }}
                >
                  {sl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sound system specs */}
        <div style={rule}>
          <p
            className="pt-4 mb-3"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-muted)' }}
          >
            Sound system specifications
          </p>
          <ul className="space-y-3">
            {SOUND_SPECS.map((spec, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span
                  className="shrink-0"
                  style={{ color: 'var(--color-dim)' }}
                >
                  ·
                </span>
                <span style={{ ...serif, fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                  {spec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
