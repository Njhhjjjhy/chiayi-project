// Gesture interaction brain, ported faithfully from the Python helper
// (3d-image/server.py GestureProcessor) so the in-browser engine feels
// identical to the proven server one. The PINCH is the clutch: an open
// hand only hovers a pointer; you must pinch to grab. Output shape matches
// what GestureControls consumes — { state, hands:[{cursor, pinching}],
// guide, swipe } — so the camera mapping is unchanged.
//
// Only the camera-relevant outputs are produced (the demo's draggable
// "card" transform from the original is not needed here and is omitted).

// --- Landmark indices (MediaPipe Hand Landmarker, 21 points) ---
const WRIST = 0
const THUMB_TIP = 4
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_TIP = 8
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_TIP = 12
const RING_MCP = 13, RING_PIP = 14, RING_TIP = 16
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_TIP = 20
const PALM_POINTS = [WRIST, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP]

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

// One Euro filter: heavy smoothing when slow (kills jitter), light when
// fast (kills lag). The standard for noisy interactive pointer signals.
class OneEuro {
  constructor(minCutoff = 1.0, beta = 0.0, dcutoff = 1.0) {
    this.minCutoff = minCutoff
    this.beta = beta
    this.dcutoff = dcutoff
    this.xPrev = null
    this.dxPrev = 0
    this.tPrev = null
  }
  static alpha(cutoff, dt) {
    const tau = 1 / (2 * Math.PI * cutoff)
    return 1 / (1 + tau / dt)
  }
  call(x, t) {
    if (this.tPrev === null) { this.tPrev = t; this.xPrev = x; return x }
    const dt = Math.max(t - this.tPrev, 1e-3)
    const dx = (x - this.xPrev) / dt
    const aD = OneEuro.alpha(this.dcutoff, dt)
    const dxHat = aD * dx + (1 - aD) * this.dxPrev
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat)
    const a = OneEuro.alpha(cutoff, dt)
    const xHat = a * x + (1 - a) * this.xPrev
    this.xPrev = xHat; this.dxPrev = dxHat; this.tPrev = t
    return xHat
  }
}

export class GestureProcessor {
  // clutch (hysteresis so a held pinch can't flicker)
  static PINCH_CLOSE = 0.18
  static PINCH_OPEN = 0.30
  // swipe (open-palm flick)
  static SWIPE_SPEED = 1.2
  static SWIPE_COOLDOWN = 0.6
  static SWIPE_REARM = 0.4

  constructor() {
    this.mode = 'idle'
    this.pinchState = {}   // label -> latched pinch
    this.filt = {}         // label -> [OneEuroX, OneEuroY]
    this.tLabels = null    // the two hands locked into a transform
    // swipe state
    this.prevPalm = null
    this.prevT = null
    this.lastSwipe = 0
    this.swipeArmed = true
  }

  cursor(label, x, y, now) {
    let f = this.filt[label]
    if (!f) {
      f = [new OneEuro(1.2, 0.6), new OneEuro(1.2, 0.6)]
      this.filt[label] = f
    }
    return [f[0].call(x, now), f[1].call(y, now)]
  }

  // rawHands: [{ label, lm: [[x,y] * 21] }] in TRUE (unmirrored) coords.
  process(rawHands, now) {
    const C = GestureProcessor
    const hands = []
    for (const h of rawHands) {
      const label = h.label
      const lm = h.lm.map(([x, y]) => [1 - x, y])   // mirror to selfie space
      const wrist = lm[WRIST]
      const span = dist(wrist, lm[MIDDLE_MCP]) || 1e-6
      const pinchD = dist(lm[THUMB_TIP], lm[INDEX_TIP]) / span
      const prev = this.pinchState[label] || false
      const pinching = pinchD < C.PINCH_CLOSE ? true : (pinchD > C.PINCH_OPEN ? false : prev)
      this.pinchState[label] = pinching
      const [cx, cy] = this.cursor(label, lm[INDEX_TIP][0], lm[INDEX_TIP][1], now)

      const ext = (tip, pip) => dist(lm[tip], wrist) > dist(lm[pip], wrist)
      const nUp = [
        ext(INDEX_TIP, INDEX_PIP), ext(MIDDLE_TIP, MIDDLE_PIP),
        ext(RING_TIP, RING_PIP), ext(PINKY_TIP, PINKY_PIP),
      ].filter(Boolean).length
      const palm = [
        PALM_POINTS.reduce((s, i) => s + lm[i][0], 0) / PALM_POINTS.length,
        PALM_POINTS.reduce((s, i) => s + lm[i][1], 0) / PALM_POINTS.length,
      ]
      const mid = [
        (lm[THUMB_TIP][0] + lm[INDEX_TIP][0]) / 2,
        (lm[THUMB_TIP][1] + lm[INDEX_TIP][1]) / 2,
      ]
      hands.push({ label, pinching, cursor: [cx, cy], nUp, palm, mid })
    }

    // drop latched pinch for hands no longer in frame
    const present = new Set(hands.map((h) => h.label))
    for (const k of Object.keys(this.pinchState)) {
      if (!present.has(k)) this.pinchState[k] = false
    }

    const pinchHands = hands.filter((h) => h.pinching)
    let newMode
    if (!hands.length) newMode = 'idle'
    else if (pinchHands.length >= 2) newMode = 'transform'
    else if (pinchHands.length === 1) newMode = 'move'
    else newMode = 'hover'

    let swipe = null
    let guide = null

    if (newMode !== this.mode) {
      if (newMode === 'transform') this.tLabels = [pinchHands[0].label, pinchHands[1].label]
      this.mode = newMode
    }

    if (this.mode === 'transform') {
      const a = hands.find((x) => x.label === this.tLabels[0])
      const b = hands.find((x) => x.label === this.tLabels[1])
      if (a && b) {
        guide = { x1: a.mid[0], y1: a.mid[1], x2: b.mid[0], y2: b.mid[1] }
      }
    } else if (this.mode === 'hover') {
      const h = hands[0]
      if (this.prevPalm !== null && this.prevT !== null) {
        const dt = Math.max(now - this.prevT, 1e-3)
        const vx = (h.palm[0] - this.prevPalm[0]) / dt
        const vy = (h.palm[1] - this.prevPalm[1]) / dt
        if (Math.abs(vx) < C.SWIPE_SPEED * C.SWIPE_REARM) this.swipeArmed = true
        if (this.swipeArmed && h.nUp >= 3 && Math.abs(vx) > C.SWIPE_SPEED
            && Math.abs(vx) > Math.abs(vy) && (now - this.lastSwipe) > C.SWIPE_COOLDOWN) {
          swipe = vx > 0 ? 'right' : 'left'
          this.lastSwipe = now
          this.swipeArmed = false
        }
      }
      this.prevPalm = h.palm
      this.prevT = now
    }

    if (this.mode !== 'hover') { this.prevPalm = null; this.prevT = null }

    return {
      state: this.mode,
      hands: hands.map((h) => ({
        label: h.label,
        pinching: h.pinching,
        cursor: { x: h.cursor[0], y: h.cursor[1] },
      })),
      swipe,
      guide,
    }
  }

  idle() {
    this.mode = 'idle'
    this.prevPalm = null
    this.prevT = null
    this.pinchState = {}
    return { state: 'idle', hands: [], swipe: null, guide: null }
  }
}
