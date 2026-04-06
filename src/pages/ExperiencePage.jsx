const STEPS = [
  {
    num: 1,
    title: 'Entrance statement wall',
    duration: '2-3 minutes',
    description: 'A wall at the entrance that introduces the story, concept, and theme. This is the first thing visitors see before entering the dark space.',
    details: [
      'Exhibition title',
      'A brief paragraph explaining what visitors are about to experience',
      'The core theme in simple language: fireflies as a bridge between humans and nature, light as communication, "you are what you see"',
      'Visual elements that set the tone (photographs of Alishan at dusk, firefly macro photography, or abstract representations)',
    ],
    note: 'The entrance is 240 cm wide × 352 cm tall. Design for this exact size.',
    color: '#f59e0b',
  },
  {
    num: 2,
    title: 'Sound transition',
    duration: '1-2 minutes',
    description: 'As visitors move from the lit entrance into the dark exhibition space, ambient sound introduces the concept.',
    details: [
      'Forest ambience: cicadas, rustling leaves, distant water, wind through bamboo',
      'A subtle musical layer that evokes nightfall — slow, minimal, not melodic enough to become the focus',
      'Volume increases gradually as visitors move deeper into the dark space',
    ],
    note: 'Sound is the bridge between the bright entrance and the dark interior. It tells visitors "you are entering a different world."',
    color: '#8b5cf6',
  },
  {
    num: 3,
    title: 'Firefly discovery',
    duration: '10-12 minutes',
    description: 'Visitors receive infrared flashlights at the entrance. Inside the dark space, they discover fireflies by pointing their flashlights at ceiling modules.',
    details: [
      'Infrared flashlights trigger the infrared detectors, causing nearby firefly LEDs to respond',
      'Personal agency — each visitor is actively discovering and interacting, not passively watching',
      'The floor underfoot feels like a forest floor (see phase 5)',
      'The big wall (see phase 2) provides peripheral visual context',
      'The ceiling is the primary interactive surface',
    ],
    note: 'Max capacity: 30 adults in the space simultaneously.',
    color: '#22c55e',
  },
  {
    num: 4,
    title: 'Exit through retail',
    duration: '2-3 minutes',
    description: 'Visitors exit into the merchandise area (see phase 6). The transition from dark immersion to bright retail creates a moment of re-entry.',
    details: [
      'The retail space is thematically connected but clearly separate',
      'Transition from dark immersion to bright retail is deliberate',
    ],
    note: null,
    color: '#ec4899',
  },
]

const ALGORITHM_STATES = [
  {
    num: 1,
    title: 'Idle',
    trigger: 'No visitors detected',
    description: 'Fireflies blink on their own in a naturalistic pattern. Not all LEDs are ever on simultaneously.',
    variants: [
      {
        name: 'Random scatter',
        label: 'A',
        code: `for each LED in module:
  brightness = 0
  target_brightness = random(30, 255)
  fade_duration = random(1000, 4000) ms
  pause_after = random(2000, 8000) ms

at any moment, 10-30% of all LEDs across
the ceiling are active

each LED independently fades in, holds
briefly, fades out, then pauses

no coordination between modules`,
        result: 'Individual LEDs blink independently with random timing, creating a naturalistic scatter.',
      },
      {
        name: 'Drift wave',
        label: 'B',
        code: `wave_origin = (x: random, y: random)
  // picks a new origin every 30-60 seconds
wave_speed = 0.5 modules per second
wave_width = 3 modules

as wave passes through a module:
  activate 30-50% of that module's LEDs
  fade in over 1500 ms
  hold 1000 ms
  fade out over 2000 ms`,
        result: 'A slow wave of activation drifts across the ceiling. Looks like wind moving through a field of fireflies.',
      },
    ],
  },
  {
    num: 2,
    title: 'Motion',
    trigger: 'Visitor walking detected by IR sensor',
    description: 'The module\'s infrared detector senses a body moving below.',
    variants: [
      {
        name: 'Ripple',
        label: 'A',
        code: `on motion_detected(module_id):
  increase module brightness by 40%
  increase blink rate by 2x for 3-5 seconds
  trigger adjacent modules at 50% intensity
    with 500 ms delay
  after 5 seconds, return to idle state`,
        result: 'A ripple of increased activity follows the visitor.',
      },
      {
        name: 'Startle',
        label: 'B',
        code: `on motion_detected(module_id):
  immediately turn off all LEDs in module (0 ms)
  wait 2000 ms (total darkness above the visitor)
  reactivate LEDs one by one at 300 ms intervals
  each LED fades in slowly over 1500 ms`,
        result: 'Fireflies go dark when startled, then cautiously return. Mimics real firefly behavior when disturbed.',
      },
    ],
  },
  {
    num: 3,
    title: 'Flashlight interaction',
    trigger: 'IR flashlight pointed at detector',
    description: 'A visitor deliberately aims their infrared flashlight at a module.',
    variants: [
      {
        name: 'Discovery reward',
        label: 'A',
        code: `on flashlight_detected(module_id):
  activate all 18 LEDs in rapid cascade:
    LED 1 on at 0 ms
    LED 2 on at 80 ms
    LED 3 on at 160 ms
    ...continue through LED 18
  hold all 18 at full brightness for 3000 ms
  fade all out together over 2000 ms
  return to idle`,
        result: 'A burst of light rewards the visitor\'s discovery.',
      },
      {
        name: 'Chain reaction',
        label: 'B',
        code: `on flashlight_detected(module_id):
  activate all 18 LEDs over 500 ms
  after 500 ms, trigger each adjacent module
    (up/down/left/right):
    activate 12 of 18 LEDs over 800 ms
  after 1000 ms, trigger next ring of modules:
    activate 6 of 18 LEDs over 1200 ms
  spreading stops after 2-3 rings
  all activated modules fade back to idle
    over 3000 ms`,
        result: 'A chain reaction spreads outward from the flashlight point. Creates a sense of interconnection across the ceiling.',
      },
    ],
  },
]

const FIREFLY_FACTS = [
  'Alishan hosts approximately 42 firefly species, roughly two-thirds of all species found in Taiwan.',
  'Peak firefly season: April through June.',
  'Laiji Village and the broader Alishan region are among Taiwan\'s premier bioluminescent habitats.',
  'Common local species include Luciola cerata and Aquatica ficta.',
  'Real firefly flash patterns vary by species: some flash in slow single pulses (2-4 second intervals), others in rapid double or triple bursts.',
]

const mono = { fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',  }
const serif = { fontFamily: 'var(--font-serif)' }
const rule = { borderTop: '1px solid var(--color-rule)' }

function CodeBlock({ code }) {
  return (
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--color-muted)',
        background: 'rgba(240,235,228,0.03)',
        lineHeight: 1.7,
      }}
      className="p-4 overflow-x-auto"
    >
      {code}
    </pre>
  )
}

function StepNumber({ num }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: '13px',
        color: 'var(--color-dim)',
      }}
    >
      {String(num).padStart(2, '0')}
    </span>
  )
}

function VariantLabel({ label }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: '13px',
        color: 'var(--color-muted)',
        border: '1px solid var(--color-rule)',
        padding: '2px 8px',
        lineHeight: 1,
      }}
      className="inline-flex items-center"
    >
      {label}
    </span>
  )
}

export default function ExperiencePage() {
  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-16">
        <p
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
          className="mb-4"
        >
          Phase 3
        </p>
        <h1
          style={{
            ...serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 300,
            color: 'var(--color-text)',
          }}
          className="mb-4"
        >
          Visitor journey
        </h1>
        <p
          style={{
            ...serif,
            color: 'var(--color-muted)',
            fontWeight: 300,
          }}
          className="text-base max-w-xl leading-relaxed"
        >
          A 15-20 minute journey from entrance to exit. Each step builds
          on the last, taking visitors from daylight into immersive darkness.
        </p>
      </div>

      {/* Experience flow */}
      <section className="mb-24">
        <p
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
          className="mb-8"
        >
          Experience flow
        </p>

        <div>
          {STEPS.map((step, index) => (
            <div
              key={step.num}
              style={index > 0 ? rule : {}}
              className={index > 0 ? 'pt-8 mt-8' : ''}
            >
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <StepNumber num={step.num} />
                  <h3
                    style={{
                      ...serif,
                      fontWeight: 400,
                      color: 'var(--color-text)',
                    }}
                    className="text-lg"
                  >
                    {step.title}
                  </h3>
                </div>
                <span
                  style={{
                    ...mono,
                    fontSize: '13px',
                    color: 'var(--color-dim)',
                  }}
                  className="shrink-0 ml-4"
                >
                  {step.duration}
                </span>
              </div>

              <p
                style={{
                  ...serif,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                }}
                className="text-base leading-relaxed mb-4 ml-0 md:ml-12"
              >
                {step.description}
              </p>

              <ul className="space-y-1.5 mb-4 ml-0 md:ml-12">
                {step.details.map((d, i) => (
                  <li
                    key={i}
                    style={{
                      ...serif,
                      color: 'var(--color-dim)',
                      fontWeight: 300,
                    }}
                    className="text-sm flex gap-2 leading-relaxed"
                  >
                    <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-rule)' }}>·</span>
                    {d}
                  </li>
                ))}
              </ul>

              {step.note && (
                <p
                  style={{
                    ...mono,
                    fontSize: '13px',
                    color: 'var(--color-amber)',
                    ...rule,
                  }}
                  className="leading-relaxed mt-4 pt-4 ml-0 md:ml-12"
                >
                  {step.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Firefly algorithm */}
      <section className="mb-24" style={rule}>
        <div className="pt-8">
          <p
            style={{
              ...mono,
              fontSize: '13px',
              color: 'var(--color-dim)',
            }}
            className="mb-2"
          >
            Firefly algorithm
          </p>
          <p
            style={{
              ...serif,
              color: 'var(--color-dim)',
              fontWeight: 300,
            }}
            className="text-sm mb-12 max-w-xl"
          >
            The LED system has 3 behavioral states, each with 2 variants.
            Pseudo-code is written for Arduino implementation.
          </p>

          <div>
            {ALGORITHM_STATES.map((state, index) => (
              <div
                key={state.num}
                style={index > 0 ? rule : {}}
                className={index > 0 ? 'pt-10 mt-10' : ''}
              >
                {/* State header */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-4 mb-2">
                    <StepNumber num={state.num} />
                    <h3
                      style={{
                        ...serif,
                        fontWeight: 400,
                        color: 'var(--color-text)',
                      }}
                      className="text-lg"
                    >
                      {state.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      ...mono,
                      fontSize: '13px',
                      color: 'var(--color-dim)',
                    }}
                    className="mb-2 ml-0 md:ml-12"
                  >
                    Trigger: {state.trigger}
                  </p>
                  <p
                    style={{
                      ...serif,
                      color: 'var(--color-muted)',
                      fontWeight: 300,
                    }}
                    className="text-sm ml-0 md:ml-12"
                  >
                    {state.description}
                  </p>
                </div>

                {/* Variants side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-0 md:ml-12">
                  {state.variants.map((v) => (
                    <div key={v.label}>
                      <div className="flex items-center gap-3 mb-4">
                        <VariantLabel label={v.label} />
                        <h4
                          style={{
                            ...serif,
                            fontWeight: 400,
                            color: 'var(--color-muted)',
                          }}
                          className="text-base"
                        >
                          {v.name}
                        </h4>
                      </div>
                      <CodeBlock code={v.code} />
                      <p
                        style={{
                          ...serif,
                          fontStyle: 'italic',
                          fontWeight: 300,
                          color: 'var(--color-dim)',
                        }}
                        className="text-sm mt-3 leading-relaxed"
                      >
                        {v.result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Alishan firefly context */}
      <section>
        <p
          style={{
            ...mono,
            fontSize: '13px',
            color: 'var(--color-dim)',
          }}
          className="mb-2"
        >
          Local Alishan firefly context
        </p>
        <p
          style={{
            ...serif,
            color: 'var(--color-dim)',
            fontWeight: 300,
          }}
          className="text-sm mb-8"
        >
          The LED algorithm should reference these real patterns where possible.
        </p>

        <div>
          {FIREFLY_FACTS.map((fact, i) => (
            <span key={i}>
              {i > 0 && (
                <span
                  style={{
                    color: 'var(--color-rule)',
                    margin: '0 0.5em',
                  }}
                >
                  /
                </span>
              )}
              <span
                style={{
                  ...serif,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--color-muted)',
                }}
                className="text-base leading-loose"
              >
                {fact}
              </span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
