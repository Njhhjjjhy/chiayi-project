import { useCallback } from 'react'

export default function LandingPage({ onScrollToExperience }) {
  return (
    <div className="relative z-30 bg-black">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white/25 text-xs uppercase tracking-[0.3em] mb-4">
          Alishan, Chiayi County, Taiwan
        </p>
        <h1 className="text-white/90 text-3xl md:text-5xl font-light tracking-wide mb-6 max-w-2xl leading-tight">
          Firefly immersive experience
        </h1>
        <p className="text-white/35 text-sm md:text-base max-w-md leading-relaxed mb-10">
          An ecological light installation where visitors enter a mountain room
          at sunset and witness the emergence of fireflies from total darkness.
        </p>
        <button
          onClick={onScrollToExperience}
          className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer border border-white/15 px-6 py-2.5 rounded hover:border-white/30"
        >
          Enter the room
        </button>
        <div className="absolute bottom-8 text-white/15 text-xs animate-pulse">
          Scroll down
        </div>
      </section>

      {/* About */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-xl">
          <h2 className="text-white/60 text-xl font-light mb-6">The experience</h2>
          <p className="text-white/30 text-sm leading-relaxed mb-4">
            Visitors enter a 10-meter room and witness a compressed sunset — golden
            light fading through twilight and blue hour into total darkness. In the
            stillness, fireflies emerge. Hundreds of warm points of light appear
            above, around, and through the space.
          </p>
          <p className="text-white/30 text-sm leading-relaxed mb-4">
            The narrative theme is "you are what you see" — fireflies as a reflection
            of the visitor. Bioluminescence mirroring human neural electricity. The
            boundary between observer and environment dissolves in the dark.
          </p>
          <p className="text-white/30 text-sm leading-relaxed">
            The installation draws on the ecology of Taiwan's Alishan mountain range,
            where firefly populations thrive in protected forests. It invites visitors
            to feel a deeper connection to the natural world through stillness and wonder.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-xl">
          <h2 className="text-white/60 text-xl font-light mb-8">Four phases</h2>
          <div className="space-y-6">
            {[
              { name: 'Golden hour', desc: 'Warm amber light washes across layered mountain silhouettes. The room glows.', color: '#d4a050' },
              { name: 'Twilight', desc: 'Deepening corals and purples. The mountain ridgeline becomes a silhouette against fading sky.', color: '#c06080' },
              { name: 'Blue hour', desc: 'Deep indigo. The last traces of light dissolve. The room grows quiet.', color: '#2d1b69' },
              { name: 'Darkness', desc: 'Near-black. Stillness. Then — hundreds of fireflies emerge from the darkness.', color: '#ffaa3c' },
            ].map((phase) => (
              <div key={phase.name} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: phase.color }} />
                <div>
                  <h3 className="text-white/50 text-sm font-medium mb-1">{phase.name}</h3>
                  <p className="text-white/25 text-xs leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 px-6 text-center">
        <p className="text-white/20 text-xs uppercase tracking-[0.2em] mb-2">Location</p>
        <p className="text-white/40 text-sm">
          Community and Cultural Center, Alishan, Chiayi County, Taiwan
        </p>
        <p className="text-white/20 text-xs mt-2">
          Exhibition dates and visitor information to be announced
        </p>
      </section>

      {/* CTA before experience */}
      <section className="py-16 px-6 text-center border-t border-white/5">
        <p className="text-white/30 text-sm mb-4">
          Preview the installation below
        </p>
        <button
          onClick={onScrollToExperience}
          className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer border border-white/15 px-6 py-2.5 rounded hover:border-white/30"
        >
          Enter the 3D experience
        </button>
      </section>
    </div>
  )
}
