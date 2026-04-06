const DESIGN_REQUIREMENTS = [
  'The retail area should feel like an extension of the exhibition, not a generic gift shop.',
  'Dim warm lighting (warmer and brighter than the exhibition, but not harsh fluorescent).',
  'Natural materials for display fixtures: wood, bamboo, stone where possible.',
  'Exhibition imagery and theme on the walls to maintain continuity.',
  'Clear branding connecting the merchandise to the exhibition experience.',
]

const PRODUCT_CATEGORIES = [
  {
    name: 'T-shirts and apparel',
    desc: 'Firefly motif designs on quality basics.',
    designNote: 'Bioluminescent points of light in darkness, mountain silhouette imagery.',
  },
  {
    name: 'Art prints',
    desc: 'Exhibition imagery, concept art, Alishan landscape photography.',
    designNote: 'Exhibition visual identity and color palette.',
  },
  {
    name: 'Postcards',
    desc: 'Smaller format prints for affordable keepsakes.',
    designNote: 'Key visuals from the exhibition experience.',
  },
  {
    name: 'Tote bags',
    desc: 'Practical everyday item with exhibition branding.',
    designNote: 'Minimal firefly motif on dark canvas.',
  },
  {
    name: 'Stickers',
    desc: 'Small, collectible, shareable.',
    designNote: 'Firefly icons, mountain silhouettes, "you are what you see" text.',
  },
  {
    name: 'Locally made items',
    desc: 'Handmade crafts and textiles from the Tsou community.',
    designNote: 'Connects to Nanghia\'s social enterprise mission. Authentic indigenous craftsmanship.',
  },
]

const DESIGN_DIRECTION = [
  'The firefly motif (bioluminescent points of light in darkness)',
  'Alishan mountain silhouette imagery',
  'The Nanghia visual identity (red, blue, black from the Tsou-inspired logo) and firefly amber',
  'The "you are what you see" concept phrase where appropriate',
]

const COLOR_PALETTE = [
  { name: 'Deep black', hex: '#0a0a0a', usage: 'Base / background' },
  { name: 'Nanghia red', hex: '#BD2B2C', usage: 'Primary accent' },
  { name: 'Nanghia blue', hex: '#266CA2', usage: 'Secondary accent' },
  { name: 'Firefly amber', hex: '#f5a623', usage: 'Firefly glow' },
  { name: 'Warm white', hex: '#fff8f0', usage: 'Text on dark' },
]

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

export default function MerchandisePage() {
  return (
    <div className="py-12">
      {/* Phase label */}
      <p
        className="mb-4"
        style={{
          ...mono,
          fontSize: '13px',
          color: 'var(--color-dim)',
        }}
      >
        Phase 6
      </p>

      {/* Title */}
      <h1
        className="mb-6"
        style={{
          ...serif,
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 300,
          color: 'var(--color-text)',
          lineHeight: 1.2,
        }}
      >
        Merchandise
      </h1>

      {/* Intro */}
      <p
        className="max-w-xl mb-12"
        style={{
          ...serif,
          fontWeight: 300,
          color: 'var(--color-muted)',
          lineHeight: 1.7,
        }}
      >
        The retail space is where visitors exit after the exhibition. The transition from
        dark immersion to bright retail creates a deliberate moment of re-entry.
      </p>

      {/* Physical space */}
      <section className="mb-16" style={rule}>
        <h2
          className="pt-8 mb-1"
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
        >
          Physical retail space
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
          <div>
            <img
              src="/references/exhibition-details_exhibition-space.webp"
              alt="Venue interior showing the retail zone labeled on the left side of the building, separate from the exhibition area"
              className="w-full"
              style={{ border: '1px solid var(--color-rule)' }}
            />
            <p
              className="mt-2"
              style={{
                ...mono,
                fontSize: '13px',
                color: 'var(--color-dim)',
              }}
            >
              Retail zone (left portion of the building)
            </p>
          </div>

          <div>
            <h3
              className="mb-5"
              style={{
                ...mono,
                fontSize: '13px',
                color: 'var(--color-dim)',
              }}
            >
              Design requirements
            </h3>
            <ul className="space-y-3">
              {DESIGN_REQUIREMENTS.map((req, i) => (
                <li
                  key={i}
                  className="flex gap-3"
                  style={{
                    ...serif,
                    fontWeight: 300,
                    color: 'var(--color-muted)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                  }}
                >
                  <span style={{ color: 'var(--color-dim)', flexShrink: 0 }}>·</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Product categories */}
      <section className="mb-16" style={rule}>
        <h2
          className="pt-8 mb-8"
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
        >
          Product categories
        </h2>

        <div>
          {PRODUCT_CATEGORIES.map((cat, i) => (
            <div
              key={cat.name}
              className="py-5"
              style={i > 0 ? rule : undefined}
            >
              <h4
                className="mb-1"
                style={{
                  ...serif,
                  fontWeight: 400,
                  color: 'var(--color-text)',
                  fontSize: '1.05rem',
                }}
              >
                {cat.name}
              </h4>
              <p
                className="mb-1"
                style={{
                  ...serif,
                  fontWeight: 300,
                  color: 'var(--color-muted)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {cat.desc}
              </p>
              <p
                style={{
                  ...serif,
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'var(--color-dim)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                }}
              >
                {cat.designNote}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Design direction */}
      <section className="mb-16" style={rule}>
        <h2
          className="pt-8 mb-8"
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
        >
          Design direction
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Visual elements */}
          <div>
            <h3
              className="mb-5"
              style={{
                ...mono,
                fontSize: '13px',
                color: 'var(--color-dim)',
              }}
            >
              Visual elements
            </h3>
            <ul className="space-y-3">
              {DESIGN_DIRECTION.map((d, i) => (
                <li
                  key={i}
                  className="flex gap-3"
                  style={{
                    ...serif,
                    fontWeight: 300,
                    color: 'var(--color-muted)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                  }}
                >
                  <span style={{ color: 'var(--color-dim)', flexShrink: 0 }}>·</span>
                  {d}
                </li>
              ))}
            </ul>
            <p
              className="mt-5 pt-5"
              style={{
                ...rule,
                ...serif,
                fontWeight: 300,
                color: 'var(--color-dim)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}
            >
              All merchandise designs must use sentence case for any text.
            </p>
          </div>

          {/* Color palette */}
          <div>
            <h3
              className="mb-5"
              style={{
                ...mono,
                fontSize: '13px',
                color: 'var(--color-dim)',
              }}
            >
              Color palette
            </h3>
            <div className="flex flex-wrap gap-6">
              {COLOR_PALETTE.map((c) => (
                <div key={c.hex} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12"
                    style={{
                      backgroundColor: c.hex,
                      border: '1px solid var(--color-rule)',
                    }}
                  />
                  <span
                    style={{
                      ...mono,
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {c.hex}
                  </span>
                  <span
                    style={{
                      ...serif,
                      fontWeight: 300,
                      color: 'var(--color-dim)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Website integration */}
      <section style={rule}>
        <h2
          className="pt-8 mb-6"
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
        >
          Website integration
        </h2>
        <p
          className="mb-3 max-w-xl"
          style={{
            ...serif,
            fontWeight: 300,
            color: 'var(--color-muted)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
          }}
        >
          This page will display product images with prices and link to the print-on-demand
          platform for purchases once merchandise designs are finalized.
        </p>
        <p
          className="max-w-xl"
          style={{
            ...serif,
            fontWeight: 300,
            color: 'var(--color-dim)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
          }}
        >
          Accessible from the main navigation. Includes the exhibition branding and theme throughout.
        </p>
      </section>
    </div>
  )
}
