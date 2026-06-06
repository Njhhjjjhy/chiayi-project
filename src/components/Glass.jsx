import { createElement, forwardRef } from 'react'

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "PingFang TC", "Noto Sans TC", sans-serif'

export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'

// The glass material itself lives in src/styles/index.css
// (.glass-surface) so the OS-level reduced-transparency / increased-
// contrast fallbacks can apply — inline styles can't respond to those.
const Glass = forwardRef(function Glass(
  { as = 'div', className = '', style, children, ...rest },
  ref,
) {
  return createElement(
    as,
    {
      ref,
      style: {
        fontFamily: FONT_STACK,
        letterSpacing: '-0.01em',
        ...style,
      },
      className: `glass-surface text-[#f5f5f7] ${className}`,
      ...rest,
    },
    children,
  )
})

export default Glass

export function ChevronUp({ size = 12, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 8L6 4L10 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronDown({ size = 12, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 4L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlayGlyph({ size = 12, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 1.5L11 6L3 10.5V1.5Z" />
    </svg>
  )
}

export function PauseGlyph({ size = 12, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="1.5" width="2.5" height="9" rx="0.5" />
      <rect x="7" y="1.5" width="2.5" height="9" rx="0.5" />
    </svg>
  )
}

export function CloseGlyph({ size = 12, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
