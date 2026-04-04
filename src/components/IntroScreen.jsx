import { useState, useEffect } from 'react'

export default function IntroScreen({ onEnter }) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  function handleEnter() {
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      onEnter()
    }, 1200)
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter()
      }
    }
    if (visible) {
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center max-w-lg px-8">
        <h1 className="text-white/90 text-2xl font-light tracking-wide mb-3">
          Firefly immersive experience
        </h1>
        <p className="text-white/40 text-sm mb-1">
          Alishan, Chiayi County, Taiwan
        </p>
        <p className="text-white/25 text-xs mb-10 leading-relaxed max-w-sm mx-auto">
          An ecological light installation where visitors witness a mountain sunset
          dissolve into darkness, and fireflies emerge from the stillness.
        </p>
        <button
          onClick={handleEnter}
          className="text-white/40 text-xs uppercase tracking-widest hover:text-white/70 transition-colors cursor-pointer border border-white/15 px-6 py-2.5 rounded hover:border-white/30"
        >
          Enter experience
        </button>
        <p className="text-white/15 text-[10px] mt-6">
          Press Enter or Space to begin
        </p>
      </div>
    </div>
  )
}
