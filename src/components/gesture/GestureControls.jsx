import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { GestureProcessor } from './gestureProcessor.js'

// Hand-gesture camera control for the firefly room.
//
// Two interchangeable engines produce the same per-frame gesture state,
// which is mapped onto the room's OrbitControls identically:
//   one-hand pinch + drag  → look around (orbit theta / phi)
//   two-hand pinch spread  → zoom (orbit distance)
//   open-hand flick        → fly to the previous / next saved viewpoint
//
//   'browser' (default): MediaPipe Hand Landmarker runs entirely in the
//     browser (WASM/WebGPU). No helper app, works deployed, no network
//     round-trip — the lower-latency, self-contained path.
//   'server': streams frames to the local Python helper (server.py on
//     :8000) over a WebSocket. Kept as a fallback for comparison.
//
// This component lives inside the <Canvas> so it can reach the live
// camera through useThree; it renders nothing.

const WS_URL = 'ws://127.0.0.1:8000/ws'
// In-browser model + runtime, loaded from CDN on first use (then cached).
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'

// Radians of orbit rotation per full-frame hand sweep. Tunable to taste.
// Lower = calmer (more hand travel for the same turn).
const ROT_SPEED = 1.8
// Keep the up/down look just shy of straight up / straight down.
const PHI_EPS = 0.05
// Set true if up/down ends up feeling inverted for the designer.
const INVERT_PITCH = false
// How quickly the view eases toward where the hand points, per render
// frame (0..1). Lower = smoother but laggier; higher = snappier. Runs at
// 60fps independently of how fast gestures arrive, so motion stays fluid.
const EASE = 0.18

export default function GestureControls({
  enabled, controlsRef, reticleRef, onStatus,
  jumpViews = [], jumpStartIndex = 0, engine = 'browser', apiRef,
}) {
  const { camera } = useThree()
  // Mutable per-session state, kept off React's render path.
  const g = useRef({
    ws: null, video: null, send: null, sctx: null, awaiting: false,
    landmarker: null, proc: null, raf: 0, lastVideoTime: -1,
    lastCursor: null, prevState: 'idle', r0: 0, D0: 0,
    // Driving state: `target` holds the desired orbit centre / angles /
    // distance; a render loop eases toward it. `active` = a hand is
    // grabbing (look/zoom); `flying` = animating to a saved viewpoint.
    active: false, flying: false, target: null, jumpIndex: jumpStartIndex,
  }).current

  // Build a target from a saved viewpoint ({position, target} arrays).
  function aimAtView(view) {
    const center = new THREE.Vector3(view.target[0], view.target[1], view.target[2])
    const pos = new THREE.Vector3(view.position[0], view.position[1], view.position[2])
    const sph = new THREE.Spherical().setFromVector3(pos.clone().sub(center))
    g.target = { center, theta: sph.theta, phi: sph.phi, radius: sph.radius }
  }

  // Fly to a scene by index. Shared by the on-screen scene buttons and
  // the open-hand flick so they always step through one list from one
  // current position; the render loop below does the actual gliding.
  function jumpTo(index) {
    if (!jumpViews.length) return
    const n = jumpViews.length
    g.jumpIndex = ((index % n) + n) % n
    aimAtView(jumpViews[g.jumpIndex])
    g.flying = true
    g.active = false
    g.lastCursor = null
  }

  // Publish the fly-to handle so the scene buttons (rendered outside the
  // canvas) can drive the camera even when the hand control is off.
  useEffect(() => {
    if (!apiRef) return undefined
    apiRef.current = { jumpTo }
    return () => { if (apiRef) apiRef.current = null }
  })

  // Smoothly ease the live camera toward the current target each render
  // frame — for both hand-driven look/zoom and fly-to-viewpoint jumps.
  // Idle (no grab, not flying) leaves the mouse / OrbitControls in charge.
  useFrame(() => {
    const controls = controlsRef && controlsRef.current
    if ((!g.active && !g.flying) || !g.target || !controls) return
    controls.target.lerp(g.target.center, EASE)
    const offset = camera.position.clone().sub(controls.target)
    const sph = new THREE.Spherical().setFromVector3(offset)
    sph.theta += (g.target.theta - sph.theta) * EASE
    sph.phi += (g.target.phi - sph.phi) * EASE
    sph.radius += (g.target.radius - sph.radius) * EASE
    sph.phi = Math.min(Math.PI - PHI_EPS, Math.max(PHI_EPS, sph.phi))
    sph.radius = Math.min(controls.maxDistance, Math.max(controls.minDistance, sph.radius))
    offset.setFromSpherical(sph)
    camera.position.copy(controls.target).add(offset)
    controls.update()
    if (g.flying) {
      const dest = g.target.center.clone().add(
        new THREE.Vector3().setFromSpherical(
          new THREE.Spherical(g.target.radius, g.target.phi, g.target.theta),
        ),
      )
      if (dest.distanceTo(camera.position) < 0.04 && controls.target.distanceTo(g.target.center) < 0.04) {
        g.flying = false
      }
    }
  })

  useEffect(() => {
    if (!enabled) return
    let stopped = false
    const setStatus = (s) => onStatus && onStatus(s)
    const reticleEl = reticleRef && reticleRef.current
    setStatus('starting')

    // ---- shared camera mapping (engine-independent) ----

    function moveReticle(h, state) {
      if (!reticleEl) return
      if (h) {
        reticleEl.style.display = 'block'
        reticleEl.style.left = (h.cursor.x * window.innerWidth) + 'px'
        reticleEl.style.top = (h.cursor.y * window.innerHeight) + 'px'
        const active = state === 'move' || state === 'transform'
        reticleEl.style.background = active ? 'rgba(0,255,120,0.35)' : 'transparent'
        reticleEl.style.transform = active ? 'scale(1.15)' : 'scale(1)'
      } else {
        reticleEl.style.background = 'transparent'
        reticleEl.style.transform = 'scale(1)'
      }
    }

    // Each gesture frame only updates the desired target; the render loop
    // (useFrame above) eases the camera toward it, so motion stays smooth
    // regardless of how fast detections arrive.
    function handle(d) {
      const h = d.hands && d.hands[0]
      moveReticle(h, d.state)

      const controls = controlsRef && controlsRef.current
      if (!controls) { g.prevState = d.state; return }

      // JUMP — open-hand flick hops to the previous / next scene and the
      // render loop flies there. Swipes are edge-gated, so one flick =
      // one hop. Shares jumpTo with the on-screen scene buttons.
      if (d.swipe && jumpViews.length) {
        jumpTo(g.jumpIndex + (d.swipe === 'right' ? 1 : -1))
        g.prevState = d.state
        return
      }

      const driving = (d.state === 'move' && h) || (d.state === 'transform' && d.guide)
      if (!driving) {
        g.active = false
        g.lastCursor = null
        g.prevState = d.state
        return
      }

      // Seed the target from the live camera the moment a grab begins, so
      // it picks up exactly where the view currently is (mouse, presets).
      if (!g.active || !g.target) {
        const offset = camera.position.clone().sub(controls.target)
        const sph = new THREE.Spherical().setFromVector3(offset)
        g.target = { center: controls.target.clone(), theta: sph.theta, phi: sph.phi, radius: sph.radius }
        g.active = true
        g.flying = false
      }

      // LOOK — one-hand pinch-drag, grab-the-world feel.
      if (d.state === 'move' && h) {
        if (g.prevState === 'move' && g.lastCursor) {
          const dx = h.cursor.x - g.lastCursor.x
          const dy = h.cursor.y - g.lastCursor.y
          g.target.theta -= dx * ROT_SPEED
          const pitch = (INVERT_PITCH ? -dy : dy) * ROT_SPEED
          g.target.phi = Math.min(Math.PI - PHI_EPS, Math.max(PHI_EPS, g.target.phi + pitch))
        }
        g.lastCursor = { x: h.cursor.x, y: h.cursor.y }
      } else {
        g.lastCursor = null
      }

      // ZOOM — two-hand pinch, spread = zoom in. Distance ratio drives the
      // orbit radius; latch the anchor on the frame the grab begins.
      if (d.state === 'transform' && d.guide) {
        const D = Math.hypot(d.guide.x2 - d.guide.x1, d.guide.y2 - d.guide.y1)
        if (g.prevState !== 'transform') { g.r0 = g.target.radius; g.D0 = D || 1e-3 }
        g.target.radius = g.r0 * (g.D0 / Math.max(D, 1e-3))
      }

      g.prevState = d.state
    }

    // ---- webcam (shared by both engines) ----

    async function openCamera() {
      if (!g.video) {
        g.video = document.createElement('video')
        g.video.playsInline = true
        g.video.muted = true
        // Parked off-screen (not display:none, so frames keep flowing).
        g.video.style.cssText = 'position:fixed;left:-10000px;top:0;width:160px;height:120px'
        document.body.appendChild(g.video)
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
      })
      if (stopped) { stream.getTracks().forEach((t) => t.stop()); return false }
      g.video.srcObject = stream
      await g.video.play()
      return true
    }

    // ---- engine: in-browser MediaPipe ----

    async function startBrowser() {
      try {
        if (!(await openCamera())) return
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)
        if (stopped) return
        const opts = {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: 'VIDEO', numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }
        // Prefer the GPU delegate (WebGPU/WebGL); fall back to CPU.
        try {
          g.landmarker = await HandLandmarker.createFromOptions(fileset, {
            ...opts, baseOptions: { ...opts.baseOptions, delegate: 'GPU' },
          })
        } catch {
          g.landmarker = await HandLandmarker.createFromOptions(fileset, {
            ...opts, baseOptions: { ...opts.baseOptions, delegate: 'CPU' },
          })
        }
        if (stopped) return
        g.proc = new GestureProcessor()
        setStatus('on')
        detectLoop()
      } catch (e) {
        setStatus('error')
        console.warn('[gesture] in-browser start failed', e)
      }
    }

    function detectLoop() {
      if (stopped || !g.landmarker) return
      const v = g.video
      if (v && v.readyState >= 2 && v.currentTime !== g.lastVideoTime) {
        g.lastVideoTime = v.currentTime
        let res = null
        try { res = g.landmarker.detectForVideo(v, performance.now()) } catch { /* skip frame */ }
        const now = performance.now() / 1000
        const raw = []
        if (res && res.landmarks) {
          for (let i = 0; i < res.landmarks.length; i++) {
            const lm = res.landmarks[i].map((p) => [p.x, p.y])
            const label = (res.handedness && res.handedness[i] && res.handedness[i][0]
              && res.handedness[i][0].categoryName) || (i === 0 ? 'Right' : 'Left')
            raw.push({ label, lm })
          }
        }
        handle(raw.length ? g.proc.process(raw, now) : g.proc.idle())
      }
      g.raf = requestAnimationFrame(detectLoop)
    }

    // ---- engine: Python helper over WebSocket ----

    async function startServer() {
      try {
        if (!(await openCamera())) return
        if (!g.send) {
          g.send = document.createElement('canvas')
          g.send.width = 320
          g.send.height = 240
          g.sctx = g.send.getContext('2d')
        }
        connect()
      } catch (e) {
        setStatus('error')
        console.warn('[gesture] camera access failed', e)
      }
    }

    function connect() {
      const ws = new WebSocket(WS_URL)
      g.ws = ws
      ws.onopen = () => { setStatus('on'); pump() }
      ws.onclose = () => { if (!stopped && enabled) setTimeout(() => { if (!stopped) connect() }, 1000) }
      ws.onerror = () => setStatus('error')
      ws.onmessage = (ev) => {
        try { handle(JSON.parse(ev.data)) } catch { /* ignore malformed */ }
        g.awaiting = false
        pump()
      }
    }

    // Request/response gating: one frame in flight at a time.
    function pump() {
      if (stopped || g.awaiting || !g.ws || g.ws.readyState !== 1) return
      if (g.video.readyState < 2) { setTimeout(pump, 30); return }
      g.sctx.drawImage(g.video, 0, 0, 320, 240)
      g.awaiting = true
      g.ws.send(g.send.toDataURL('image/jpeg', 0.6))
    }

    if (engine === 'server') startServer()
    else startBrowser()

    return () => {
      stopped = true
      setStatus('off')
      if (g.raf) { cancelAnimationFrame(g.raf); g.raf = 0 }
      if (g.landmarker) { try { g.landmarker.close() } catch { /* noop */ } g.landmarker = null }
      g.proc = null
      if (g.ws) { try { g.ws.close() } catch { /* noop */ } g.ws = null }
      if (g.video && g.video.srcObject) {
        g.video.srcObject.getTracks().forEach((t) => t.stop())
        g.video.srcObject = null
      }
      g.awaiting = false
      g.lastVideoTime = -1
      g.lastCursor = null
      g.prevState = 'idle'
      g.active = false
      g.flying = false
      g.target = null
      if (reticleEl) reticleEl.style.display = 'none'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, engine])

  return null
}
