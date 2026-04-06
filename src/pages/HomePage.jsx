import { Link } from 'react-router-dom'

const PHASES = [
  { num: 1, title: 'Space and architecture', to: '/space', status: 'active' },
  { num: 2, title: 'The big wall', to: '/wall', status: 'active' },
  { num: 3, title: 'Visitor journey', to: '/experience', status: 'active' },
  { num: 4, title: 'Marketing and promotion', to: '/marketing', status: 'upcoming' },
  { num: 5, title: 'Floor and sound', to: '/floor', status: 'upcoming' },
  { num: 6, title: 'Merchandise', to: '/merchandise', status: 'upcoming' },
]

const mono = { fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }
const serif = { fontFamily: 'var(--font-serif)' }
const rule = { borderTop: '1px solid var(--color-rule)' }

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 md:pt-40 pb-20">
        <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-8">
          Alishan, Chiayi County, Taiwan
        </p>
        <h1 className="mb-6">
          <span
            className="block leading-none mb-2"
            style={{ ...serif, fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: 300, color: 'var(--color-red)', letterSpacing: '-0.03em' }}
          >
            Fireflies
          </span>
          <span
            className="block"
            style={{ ...serif, fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-muted)' }}
          >
            Immersive exhibition
          </span>
        </h1>
      </section>

      {/* Core theme */}
      <section className="py-16" style={rule}>
        <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-8">
          <span style={{ color: 'var(--color-blue)' }}>—</span> Core theme
        </p>
        <div className="max-w-3xl">
          <p style={{ ...serif, fontSize: '1.25rem', fontWeight: 300, color: 'var(--color-text)', lineHeight: 1.7 }} className="mb-5">
            Fireflies represent the delicate balance between humans and nature. Their bioluminescence
            works through the same fundamental mechanism as electrical signals in human brain synapses —
            both are living systems communicating through light and chemistry.
          </p>
          <p style={{ ...serif, fontSize: '1.25rem', fontWeight: 300, color: 'var(--color-text)', lineHeight: 1.7 }} className="mb-5">
            This scientific parallel connects to a Buddhist philosophical idea: everything you see
            is an extension of yourself, and you are part of everything. The fireflies are not
            separate from you. They are a reflection of you.
          </p>
          <p style={{ ...serif, fontSize: '1.1rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-muted)', lineHeight: 1.7 }}>
            The goal is positive reinforcement: visitors leave seeing nature differently, feeling
            connected to it, wanting to protect it because it is part of them. Not guilt, not doom.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="py-16" style={rule}>
        <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-8">
          <span style={{ color: 'var(--color-blue)' }}>—</span> Project phases
        </p>

        <div>
          {PHASES.map((phase) => (
            <Link
              key={phase.num}
              to={phase.to}
              className="group block py-5 transition-opacity hover:opacity-100"
              style={{ borderBottom: '1px solid var(--color-rule)', opacity: phase.status === 'active' ? 1 : 0.5 }}
            >
              <div className="flex items-baseline gap-6">
                <span style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)', minWidth: '2rem' }}>
                  {String(phase.num).padStart(2, '0')}
                </span>
                <span
                  className="group-hover:translate-x-1 transition-transform"
                  style={{ ...serif, fontSize: '1.5rem', fontWeight: 300, color: 'var(--color-text)' }}
                >
                  {phase.title}
                </span>
                {phase.status === 'active' && (
                  <span style={{ ...mono, fontSize: '9px', color: 'var(--color-amber)', marginLeft: 'auto' }}>
                    Active
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Collaborators */}
      <section className="py-16" style={rule}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-6">
              <span style={{ color: 'var(--color-blue)' }}>—</span> Collaborators
            </p>
            <div className="space-y-4">
              <div>
                <p style={{ ...serif, fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-text)' }}>Riaan Burger</p>
                <p style={{ ...serif, fontSize: '1rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-muted)' }}>Tech and immersive design</p>
              </div>
              <div>
                <p style={{ ...serif, fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-text)' }}>Corbett Wall</p>
                <p style={{ ...serif, fontSize: '1rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-muted)' }}>Organizer, Nanghia founder</p>
              </div>
            </div>
          </div>
          <div>
            <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-6">
              <span style={{ color: 'var(--color-blue)' }}>—</span> Venue
            </p>
            <p style={{ ...serif, fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-text)' }}>Nanghia</p>
            <p style={{ ...serif, fontSize: '1rem', fontWeight: 300, color: 'var(--color-muted)', lineHeight: 1.7 }} className="mt-1">
              A community gathering place with an immersive gallery, cultural park, and bistro.
              Laiji Village, Alishan Township, Taiwan.
            </p>
            <a
              href="https://nanghia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 hover:opacity-80 transition-opacity underline underline-offset-4"
              style={{ ...mono, fontSize: '13px', letterSpacing: '0.05em', color: 'var(--color-dim)', textDecorationColor: 'var(--color-rule)' }}
            >
              nanghia.com
            </a>
          </div>
        </div>
      </section>

      {/* 3D preview */}
      <Link
        to="/3d"
        className="group block py-20 transition-opacity hover:opacity-100"
        style={{ ...rule, opacity: 0.6 }}
      >
        <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-4">
          Interactive 3D preview
        </p>
        <span
          className="group-hover:translate-x-2 transition-transform inline-block"
          style={{ ...serif, fontSize: '2rem', fontWeight: 300, color: 'var(--color-text)' }}
        >
          Enter the room →
        </span>
      </Link>
    </div>
  )
}
