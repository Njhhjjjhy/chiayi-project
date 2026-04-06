import { useState } from 'react'

// --- Tourism copy ---

const TOURISM_COPY = {
  short: {
    en: 'An immersive firefly art exhibition in Alishan, Taiwan. Interactive LED ceiling, forest atmosphere, and ecological storytelling.',
    zh: '阿里山沉浸式螢火蟲藝術展覽。互動式LED天花板、森林氛圍與生態敘事。',
  },
  medium: {
    en: 'Step into a mountain room at dusk and watch it dissolve into darkness. Hundreds of firefly LEDs emerge above you, responding to your movement through infrared flashlights. An art + science + tech exhibition at Nanghia, Laiji Village, Alishan — where ecology becomes experience.',
    zh: '走進一間黃昏時分的山中房間，看著它逐漸沉入黑暗。數百顆螢火蟲LED在你上方出現，透過紅外線手電筒回應你的動作。這是位於阿里山來吉部落南嘉的一場藝術+科學+科技展覽——讓生態成為體驗。',
  },
  full: {
    en: 'Firefly Immersive Exhibition at Nanghia, Alishan. Enter a darkened room where the ceiling is alive with hundreds of LED fireflies. Each module responds to your infrared flashlight — point it upward and watch a cascade of light ripple across the ceiling. The floor feels like a forest, the walls breathe with living moss or glowing silhouettes, and ambient forest sound surrounds you. Based on real Alishan firefly ecology (42 species, April–June season), the exhibition uses technology to reconnect visitors with nature. Located in Laiji Village, a growing B&B destination near 德恩亞納 and the Alishan Forest Railway. A Nanghia social enterprise project — all profits support the local Tsou indigenous community.',
    zh: '南嘉螢火蟲沉浸式展覽，阿里山。走進一間黑暗的房間，天花板上數百顆LED螢火蟲閃爍著生命。每個模組都會回應你的紅外線手電筒——向上照射，觀看光的漣漪在天花板上擴散。腳下感覺像森林地面，牆壁呼吸著苔蘚或發光的剪影，森林環境音環繞著你。展覽以阿里山真實的螢火蟲生態為基礎（42個物種，4月至6月為旺季），運用科技讓遊客重新與自然連結。位於來吉部落，鄰近德恩亞納與阿里山森林鐵路，是新興的民宿聚落。南嘉社會企業計畫——所有利潤回饋當地鄒族社區。',
  },
}

const PLATFORMS = [
  'Alishan National Scenic Area tourism website',
  'Local tourism bureau listings',
  'KKday',
  'Klook',
  'Trip.com',
  'Google Maps / Google Business listing',
]

// --- Cost tracking ---

const COST_CATEGORIES = [
  { category: 'Ceiling modules (materials + fabrication)', notes: '' },
  { category: 'LEDs (quantity × unit cost)', notes: '' },
  { category: 'Infrared sensors (quantity × unit cost)', notes: '' },
  { category: 'Infrared flashlights (quantity × unit cost)', notes: '' },
  { category: 'Wall treatment (per selected option)', notes: 'See phase 2 for cost ranges per option' },
  { category: 'Floor treatment (grass, stones, natural materials)', notes: '' },
  { category: 'Sound system (speakers, amplifier, audio source)', notes: 'Min. 4 speakers + 30 min loop' },
  { category: 'Entrance design (statement wall, signage)', notes: '240 × 352 cm' },
  { category: 'Curtains or dividers (sectioning from retail area)', notes: '' },
  { category: 'Projector (if wall option 5 is chosen)', notes: 'Short-throw projector' },
  { category: 'Merchandise setup (display, initial inventory)', notes: '' },
  { category: 'Labor (installation, on-site assembly)', notes: '' },
]

// --- Style tokens ---

const mono = { fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',  }
const serif = { fontFamily: 'var(--font-serif)' }
const rule = { borderTop: '1px solid var(--color-rule)' }

function CopyBlock({ label, text, charLimit }) {
  const len = text.length
  const over = len > charLimit
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>{label}</span>
        <span style={{ ...mono, fontSize: '13px', color: over ? 'var(--color-red)' : 'var(--color-dim)' }}>
          {len}/{charLimit}
        </span>
      </div>
      <p
        className="py-3 pl-4 pr-3 leading-relaxed text-sm"
        style={{
          ...serif,
          color: 'var(--color-muted)',
          background: 'rgba(240,235,228,0.03)',
          borderLeft: '1px solid var(--color-rule)',
        }}
      >
        {text}
      </p>
    </div>
  )
}

export default function MarketingPage() {
  const [costs, setCosts] = useState(
    COST_CATEGORIES.map(() => '')
  )

  const total = costs.reduce((sum, c) => {
    const num = parseInt(c.replace(/[^\d]/g, ''), 10)
    return sum + (isNaN(num) ? 0 : num)
  }, 0)

  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-16">
        <p style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }} className="mb-3">
          Phase 4
        </p>
        <h1
          className="mb-4"
          style={{
            ...serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 300,
            color: 'var(--color-text)',
          }}
        >
          Marketing and promotion
        </h1>
        <p
          className="max-w-xl leading-relaxed"
          style={{ ...serif, color: 'var(--color-muted)', fontSize: '1rem' }}
        >
          Two narratives, tourism platform copy, SEO strategy, and cost tracking.
        </p>
      </div>

      {/* Two narratives */}
      <section className="mb-20" style={rule}>
        <div className="pt-10">
          <h2
            className="mb-8"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
          >
            Two narratives
          </h2>

          {/* Desktop: side by side with vertical rule */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0">
            {/* Promotional */}
            <div className="pb-10 md:pr-10">
              <h3
                className="mb-1"
                style={{ ...serif, fontSize: '1.15rem', fontWeight: 400, color: 'var(--color-text)' }}
              >
                Promotional narrative
              </h3>
              <p className="mb-5" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                Outward-facing — marketing, social media, press
              </p>
              <p className="mb-4 leading-relaxed text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                A world-class immersive art exhibition in the mountains of Alishan, where technology
                meets indigenous culture and ecological awareness. A collaboration between Nanghia
                and its creative team, bringing art + science + tech to one of Taiwan's most
                biodiverse firefly habitats.
              </p>
              <p className="mb-6 leading-relaxed text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                Not a light show — an art exhibition that uses living light to explore
                the connection between humans and nature.
              </p>
              <div style={rule} className="pt-5">
                <p className="mb-3" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                  Emphasize
                </p>
                <ul className="space-y-1.5">
                  {[
                    'The unique mountain location',
                    'The teamLab-inspired immersive experience',
                    'The Tsou community connection through Nanghia',
                    'The ecological message',
                  ].map((e, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                      <span style={{ color: 'var(--color-dim)' }}>·</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vertical divider (desktop only) */}
            <div className="hidden md:block" style={{ background: 'var(--color-rule)' }} />

            {/* Mobile divider */}
            <div className="block md:hidden mb-10" style={rule} />

            {/* Exhibition */}
            <div className="pb-10 md:pl-10">
              <h3
                className="mb-1"
                style={{ ...serif, fontSize: '1.15rem', fontWeight: 400, color: 'var(--color-text)' }}
              >
                Exhibition narrative
              </h3>
              <p className="mb-5" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                Inward-facing — the story visitors experience inside
              </p>
              <p className="mb-4 leading-relaxed text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                Fireflies as a bridge between humans and nature. Bioluminescence works through
                the same mechanism as electrical signals in human brain synapses — both are living
                systems communicating through light and chemistry.
              </p>
              <p className="mb-6 leading-relaxed text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                A Buddhist philosophical idea: everything you see is an extension of yourself,
                and you are part of everything. The fireflies are not separate from you.
                They are a reflection of you.
              </p>
              <div style={rule} className="pt-5">
                <p className="mb-3" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                  Appears on
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Entrance statement wall',
                    'Audio guides',
                    'Printed materials',
                  ].map((e, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                      <span style={{ color: 'var(--color-dim)' }}>·</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO and geo targeting */}
      <section className="mb-20" style={rule}>
        <div className="pt-10">
          <h2
            className="mb-8"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
          >
            SEO and geo targeting
          </h2>

          <div className="mb-8">
            <p className="mb-3" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
              Target keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Alishan exhibition', 'immersive art Taiwan', 'firefly experience Alishan',
                '阿里山展覽', '螢火蟲體驗', 'Alishan art installation',
                '阿里山螢火蟲', 'immersive exhibition Taiwan',
              ].map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1"
                  lang={/[\u4e00-\u9fff]/.test(kw) ? 'zh-Hant' : undefined}
                  style={{
                    ...mono,
                    fontSize: '13px',
                    color: 'var(--color-muted)',
                    border: '1px solid var(--color-rule)',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8" style={rule}>
            <div className="pt-6">
              <p className="mb-3" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                Geo references to include
              </p>
              <ul className="space-y-1.5">
                {[
                  '德恩亞納 village ("little Switzerland")',
                  'Alishan National Scenic Area',
                  'Alishan forest railway',
                  'Laiji Village / 來吉部落',
                ].map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                    <span style={{ color: 'var(--color-dim)' }}>·</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={rule}>
            <div className="pt-6">
              <p className="mb-3" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                Tourist framing
              </p>
              <p className="leading-relaxed text-sm" style={{ ...serif, color: 'var(--color-muted)' }}>
                Most visitors are already traveling to the Alishan area. This exhibition is an easy
                add-on to an existing trip. The village has a B&B scene that is growing rapidly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tourism platform copy */}
      <section className="mb-20" style={rule}>
        <div className="pt-10">
          <h2
            className="mb-2"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
          >
            Tourism platform copy
          </h2>
          <p className="mb-8 text-sm" style={{ ...serif, color: 'var(--color-dim)' }}>
            Pre-written copy for: {PLATFORMS.join(', ')}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0">
            {/* English */}
            <div className="pb-8 md:pr-10">
              <p className="mb-5" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                English
              </p>
              <CopyBlock label="Short" text={TOURISM_COPY.short.en} charLimit={150} />
              <CopyBlock label="Medium" text={TOURISM_COPY.medium.en} charLimit={300} />
              <CopyBlock label="Full" text={TOURISM_COPY.full.en} charLimit={600} />
            </div>

            {/* Vertical divider (desktop only) */}
            <div className="hidden md:block" style={{ background: 'var(--color-rule)' }} />

            {/* Mobile divider */}
            <div className="block md:hidden mb-8" style={rule} />

            {/* Chinese */}
            <div className="pb-8 md:pl-10" lang="zh-Hant">
              <p className="mb-5" style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}>
                中文
              </p>
              <CopyBlock label="簡短" text={TOURISM_COPY.short.zh} charLimit={150} />
              <CopyBlock label="中等" text={TOURISM_COPY.medium.zh} charLimit={300} />
              <CopyBlock label="完整" text={TOURISM_COPY.full.zh} charLimit={600} />
            </div>
          </div>
        </div>
      </section>

      {/* Cost tracking */}
      <section style={rule}>
        <div className="pt-10">
          <h2
            className="mb-2"
            style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
          >
            Cost tracking
          </h2>
          <p className="mb-8 text-sm" style={{ ...serif, color: 'var(--color-dim)' }}>
            Enter estimated costs in TWD. The total updates automatically.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-rule)' }}>
                  <th
                    className="text-left py-3 pr-4 font-normal"
                    style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
                  >
                    Category
                  </th>
                  <th
                    className="text-left py-3 pr-4 font-normal hidden sm:table-cell"
                    style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
                  >
                    Notes
                  </th>
                  <th
                    className="text-right py-3 font-normal w-40"
                    style={{ ...mono, fontSize: '13px', color: 'var(--color-dim)' }}
                  >
                    Est. cost (TWD)
                  </th>
                </tr>
              </thead>
              <tbody>
                {COST_CATEGORIES.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-rule)' }}>
                    <td className="py-2.5 pr-4" style={{ ...serif, color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                      {row.category}
                    </td>
                    <td
                      className="py-2.5 pr-4 hidden sm:table-cell"
                      style={{ ...serif, color: 'var(--color-dim)', fontSize: '0.875rem' }}
                    >
                      {row.notes}
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        value={costs[i]}
                        onChange={(e) => {
                          const next = [...costs]
                          next[i] = e.target.value
                          setCosts(next)
                        }}
                        placeholder="—"
                        aria-label={`Cost for ${row.category}`}
                        className="w-full text-right bg-transparent outline-none py-1 px-1 focus-visible:ring-1"
                        style={{
                          ...mono,
                          fontSize: '12px',
                          color: 'var(--color-text)',
                          borderBottom: '1px solid var(--color-rule)',
                          letterSpacing: '0.05em',
                          textTransform: 'none',
                        }}
                      />
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--color-muted)' }}>
                  <td className="py-3 pr-4" style={{ ...serif, color: 'var(--color-text)', fontWeight: 400 }}>
                    Total
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell" />
                  <td
                    className="py-3 text-right"
                    style={{ ...mono, fontSize: '12px', color: 'var(--color-text)', letterSpacing: '0.05em', textTransform: 'none' }}
                  >
                    {total > 0 ? `${total.toLocaleString()} TWD` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
