import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/space', label: 'The room' },
  { to: '/wall', label: 'The big wall' },
  { to: '/experience', label: 'Visitor journey' },
  { to: '/marketing', label: 'Marketing' },
  { to: '/floor', label: 'Floor and sound' },
  { to: '/merchandise', label: 'Merchandise' },
  { to: '/3d', label: '3D preview' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  if (location.pathname === '/3d') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2"
        style={{ background: 'var(--color-rule)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
      >
        Skip to content
      </a>

      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ borderBottom: '1px solid var(--color-rule)', background: 'var(--color-bg)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <NavLink
              to="/"
              className="shrink-0 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em', color: 'var(--color-muted)' }}
            >
              <span style={{ color: 'var(--color-amber)', fontSize: '6px', lineHeight: 1 }}>●</span>
              Fireflies
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-35 hover:opacity-70'}`
                  }
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em', color: 'var(--color-text)' }}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="lg:hidden cursor-pointer p-2 opacity-40 hover:opacity-70"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-text)' }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div id="mobile-nav" className="lg:hidden px-4 py-3 space-y-1" style={{ borderTop: '1px solid var(--color-rule)' }}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-3 transition-opacity ${isActive ? 'opacity-100' : 'opacity-35 hover:opacity-70'}`
                }
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em', color: 'var(--color-text)' }}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-16" style={{ borderTop: '1px solid var(--color-rule)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.1em', color: 'var(--color-dim)' }}>
            Fireflies immersive exhibition
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-muted)' }}>
            Nanghia, Laiji Village, Alishan, Taiwan
          </span>
        </div>
        <div className="flex items-center gap-6 mt-4">
          {[
            { href: 'https://nanghia.com', label: 'nanghia.com' },
            { href: 'https://www.riaanburger.com/', label: 'riaanburger.com' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity underline underline-offset-4"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em', color: 'var(--color-dim)', textDecorationColor: 'var(--color-rule)' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
