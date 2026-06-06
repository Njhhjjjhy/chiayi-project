# Hand-Gesture Control — Engineering Handover

**Goal:** drive a web app with webcam hand gestures (move a pointer, zoom, rotate,
swipe, click) — i.e. replace the mouse with your hand.

**Status:** working demo in this repo (`server.py` + `index.html`), verified on
macOS Apple Silicon. This document explains *how it works in full detail* so you
can rebuild it and/or integrate it into our existing web app.

Read top-to-bottom once; after that use it as a reference. Sections:

1. [TL;DR / mental model](#1-tldr--mental-model)
2. [Architecture & data flow](#2-architecture--data-flow)
3. [The AI model (MediaPipe Hand Landmarker)](#3-the-ai-model-mediapipe-hand-landmarker)
4. [Why this stack (2026 survey)](#4-why-this-stack-2026-survey)
5. [Setup from scratch](#5-setup-from-scratch)
6. [The WebSocket protocol (the contract)](#6-the-websocket-protocol-the-contract)
7. [Server internals, step by step](#7-server-internals-step-by-step)
8. [The gesture math, in full](#8-the-gesture-math-in-full)
9. [Client internals, step by step](#9-client-internals-step-by-step)
10. [Tuning guide (every knob)](#10-tuning-guide-every-knob)
11. [Integrating into our existing web app](#11-integrating-into-our-existing-web-app)
12. [Performance & real-time](#12-performance--real-time)
13. [Gotchas & troubleshooting](#13-gotchas--troubleshooting)
14. [Production considerations](#14-production-considerations)
15. [Extension ideas](#15-extension-ideas)
16. [File manifest & glossary](#16-file-manifest--glossary)

---

## 1. TL;DR / mental model

- The **browser** captures the webcam, shrinks each frame to **320×240**, JPEG-encodes
  it, and sends it over **one WebSocket** to a **local Python server**.
- The **Python server** runs **Google MediaPipe Hand Landmarker**, an on-device
  neural net that outputs **21 hand keypoints** per frame.
- The server then does **plain geometry** on those 21 points to derive mouse-like
  **controls** (cursor / zoom / rotation / swipe / click) and sends back a small
  **JSON** message. The browser just renders/acts on it.

> The single most important idea: **the AI only gives you 21 points. Every gesture
> is ordinary math on those points** — not a second model. Once you understand the
> landmark layout and a few formulas, you can invent any gesture you want.

```
┌────────────── BROWSER (index.html) ──────────────┐        ┌────────── PYTHON (server.py) ──────────┐
│  getUserMedia → <video>                           │        │                                        │
│        │ draw onto hidden 320×240 <canvas>        │        │  base64 → bytes → cv2.imdecode (BGR)   │
│        │ toDataURL('image/jpeg', 0.6)             │ frame  │        → cvtColor → RGB numpy          │
│        ▼                                          │ ─────► │        → mp.Image                      │
│   ws.send(dataURL)   (one frame in flight)        │  (ws)  │        → HandLandmarker.detect_for_video│
│                                                   │        │        → 21 landmarks                  │
│   onmessage(json) → render stage + skeleton       │ ◄───── │  GestureProcessor: geometry → controls │
│        ▲ then send the next frame                 │  json  │        → send_json({...})              │
└───────────────────────────────────────────────────┘        └────────────────────────────────────────┘
```

---

## 2. Architecture & data flow

**One process, one port, one socket.** The Python server (FastAPI + uvicorn) both
serves `index.html` (HTTP `GET /`) and hosts the WebSocket (`/ws`). Same origin →
no CORS, no second server.

**Why frames go to Python (not detected in-browser):** the requirement is that a
**Python server does the detection**. MediaPipe also ships a JavaScript build
(`@mediapipe/tasks-vision`) that runs entirely in the browser — see
[§14](#14-production-considerations) for when to switch to that. The architecture
below is the "Python does the work" design.

**The control loop (per frame):**

1. Browser draws the current video frame onto a small canvas (downscale = bandwidth + speed).
2. Browser JPEG-encodes it (`quality 0.6`) and `ws.send()`s it — **but only if no
   frame is already in flight** (request/response gating, see [§12](#12-performance--real-time)).
3. Server decodes → RGB numpy array → MediaPipe → 21 landmarks.
4. Server derives controls (smoothing + thresholds) → JSON.
5. Browser receives JSON, updates the UI, and **then sends the next frame**.

This gating makes the system self-pace to the round-trip time, so it never builds
a backlog of stale frames.

---

## 3. The AI model (MediaPipe Hand Landmarker)

**What:** Google MediaPipe **Hand Landmarker** (Tasks API). On-device, CPU,
real-time, Apache-2.0. We use the **float16** bundle `hand_landmarker.task`.

**Size:** the bundle is **7.5 MB** — a zip of two small TFLite CNNs:

| File inside the bundle | Size | Job |
|---|---|---|
| `hand_detector.tflite` | 2.3 MB | Find the palm (bounding box) in the frame |
| `hand_landmarks_detector.tflite` | 5.2 MB | Regress 21 keypoints inside that box |

Both are MobileNet-style nets (a few million params each). Runtime RAM ≈ tens of MB.
That's why it does 30–60 FPS on a laptop CPU with **no GPU**.

**How it runs (two stages + tracking):**
- The **palm detector** locates the hand.
- The **landmark detector** predicts 21 points within that region.
- In `RunningMode.VIDEO`, MediaPipe **tracks** the hand between frames and **skips
  the palm detector** on most frames — the key latency saver.

**Output per frame:** a list of detected hands; for each hand, **21 landmarks**,
each with `x, y` in **normalized image coordinates `[0,1]`** (origin top-left,
y grows downward) plus a relative `z` (depth; we don't use it).

**The 21 landmark indices** (memorize this — all gesture math references it):

```
                  8   12  16          20
                  ●   ●   ●           ●     ← finger TIPs
                  │   │   │          ╱
                  7   11  15        19
                  │   │   │        ╱
                  6   10  14      18
                  │   │   │      ╱        4 ● ← thumb TIP
                  5   9   13    17       ╱
                   ╲  │   │    ╱       3 ●
                    ╲ │   │   ╱       ╱
   MCP knuckles →    ●●  ●  ●       2 ●
                      5 9 13 17    ╱
                       ╲  │  │    1 ●
                        ╲ │  │   ╱
                         ╲│  │  ╱
                          ●────●          0 ● ← WRIST
```

| Index | Point | Index | Point |
|---|---|---|---|
| 0 | Wrist | 11,12 | Middle DIP, **TIP** |
| 1,2,3,**4** | Thumb CMC, MCP, IP, **TIP** | 13 | Ring MCP |
| 5 | Index MCP (knuckle) | 14,15,16 | Ring PIP, DIP, **TIP** |
| 6,7,8 | Index PIP, DIP, **TIP** | 17 | Pinky MCP |
| 9 | Middle MCP | 18,19,20 | Pinky PIP, DIP, **TIP** |
| 10 | Middle PIP | | |

The five we use most: **0** (wrist), **4** (thumb tip), **8** (index tip),
**9** (middle knuckle), and the MCP set **{0,5,9,13,17}** for the palm centroid.

> **Optional sibling model:** MediaPipe also has a **Gesture Recognizer** task
> (same 21 landmarks **+** a classifier head that names 8 static poses:
> Open_Palm, Closed_Fist, Pointing_Up, Thumb_Up, Thumb_Down, Victory, ILoveYou,
> None). Swap `gesture_recognizer.task` if you want named static poses as discrete
> commands. It does **not** give swipe/zoom/rotate — those are temporal and you
> derive them yourself either way.

---

## 4. Why this stack (2026 survey)

We surveyed the realistic local options before building. Summary:

| Option | Output | Local / realtime CPU | License | Verdict |
|---|---|---|---|---|
| **MediaPipe Hand Landmarker** ✅ | 21 continuous landmarks | Yes / 30–60 FPS | Apache-2.0 | **Chosen.** Continuous geometry → all controls; tiny; one `uv add`. |
| YOLO / HaGRID gesture detectors | Box + **class label per frame** | Yes (nano) | **AGPL-3.0** | Only discrete labels, no continuous swipe/zoom/rotate; viral license. |
| HaMeR / WiLoR (3D mesh transformers) | Full 3D hand mesh | **GPU only**, sub-realtime on laptop | mixed (WiLoR non-commercial) | Massive overkill. |
| OpenPose | 2D keypoints | GPU-hungry | costly commercial | Legacy; superseded. |

**Key reasoning:** continuous controls (swipe/zoom/rotate/cursor) need *per-frame
geometry*, which **only landmark models** give. Classifier models (YOLO/HaGRID)
hand you a label, not a position, so you'd bolt on tracking + temporal logic to
recover what landmarks give for free. Mesh transformers solve a far harder problem
than we have and need a GPU.

---

## 5. Setup from scratch

**Prereqs:** a webcam, and [`uv`](https://docs.astral.sh/uv/) (our standard Python
package manager). **Python 3.12** — MediaPipe has **no 3.13 wheel** as of 2026; uv
will fetch 3.12 automatically because we pin it.

```bash
# 1. project + pinned interpreter
uv init gesture-test            # or use the existing repo
cd gesture-test
echo "3.12" > .python-version   # MediaPipe: no 3.13 wheel yet

# 2. dependencies (native arm64 wheels on Apple Silicon — use plain `mediapipe`,
#    NOT the dead `mediapipe-silicon`)
uv add mediapipe opencv-python numpy fastapi "uvicorn[standard]"

# 3. run — first launch auto-downloads hand_landmarker.task (~7.5 MB)
uv run python server.py
# → open http://127.0.0.1:8000, click "Start camera", allow camera access
```

`pyproject.toml` pins `requires-python = ">=3.10,<3.13"` so the `<3.13` cap is
enforced even if `.python-version` is missing.

The model is fetched on first run from:
```
https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
```

---

## 6. The WebSocket protocol (the contract)

This is the integration boundary. If you keep this contract, you can rewrite either
side independently.

**Client → server:** a single **text** message per frame: a data-URL string
`"data:image/jpeg;base64,...."` of a small JPEG. (Binary `Blob` works too and is
~33% smaller; we use the data-URL because it's trivial to debug.)

**Server → client:** one **JSON** message per received frame. The server owns the
interaction **state machine** and the **card transform**; the client just renders
what it's told (this is what enforces the pinch-clutch / Midas-touch fix — the
client never applies a transform on its own).

```jsonc
{
  "state": "hover",                 // "idle" | "hover" | "move" | "transform"
  "hands": [                        // 0..2 hands, for drawing skeletons + pointers
    {
      "label": "Right",             // MediaPipe handedness (key for per-hand state)
      "landmarks": [[0.5,0.9], ...21...], // selfie-mirrored, 0..1
      "pinching": false,            // latched pinch (hysteresis) for THIS hand
      "cursor": { "x": 0.42, "y": 0.31 } // index fingertip, One Euro-filtered
    }
  ],
  "card":  { "index": 0, "x": 0.5, "y": 0.5, "scale": 1.0, "angle": 0.0 },
                                    // the manipulated object's transform (server-owned)
  "grabbed": false,                 // card is being moved/transformed right now
  "hover":   false,                 // pointer is over the card (cosmetic highlight)
  "click":   false,                 // discrete: a quick pinch-tap fired this frame
  "swipe":   null,                  // discrete: "left" | "right" | null
  "guide":   null,                  // {x1,y1,x2,y2} rubber-band line for two-hand transform
  "n_cards": 5,
  "fps": 32.1
}
```

**Semantics that matter for consumers:**
- `state` is the source of truth: `hover` = pointer only (no manipulation); `move` =
  one hand grabbing/dragging; `transform` = two hands scaling/rotating.
- `card.{x,y,scale,angle}` is **already the final transform** — render it directly.
  Don't derive it from the cursor yourself (that was the old, buggy behavior).
- `click` and `swipe` are **edge events** — fire an action once when truthy.
- Each hand's `pinching` is a **latched level** (hysteresis: closes <0.18, opens
  >0.30 of hand-span) so a held pinch can't flicker.
- All coordinates are **selfie-mirrored** already (server did `x → 1-x`). Don't
  mirror again; map straight to canvas pixels.

---

## 7. Server internals, step by step

Full source: [server.py](server.py). Walkthrough:

**(a) App wiring.** FastAPI serves the page and the socket; a `lifespan` handler
downloads the model on startup.
```python
@asynccontextmanager
async def lifespan(app): ensure_model(); yield
app = FastAPI(lifespan=lifespan)

@app.get("/")
def index(): return HTMLResponse(INDEX_HTML.read_text("utf-8"))
```

**(b) Decode a frame** (base64 data-URL → RGB numpy). OpenCV decodes **BGR**, so
convert to **RGB** before MediaPipe:
```python
def _decode(data: str):
    if "," in data: data = data.split(",", 1)[1]      # strip "data:image/jpeg;base64,"
    buf = np.frombuffer(base64.b64decode(data), np.uint8)
    bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    return None if bgr is None else cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
```

**(c) Create the landmarker** — one **per WebSocket connection** (VIDEO mode keeps
per-stream tracking state, so don't share it across users):
```python
options = vision.HandLandmarkerOptions(
    base_options=mp_python.BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=vision.RunningMode.VIDEO,   # synchronous + inter-frame tracking
    num_hands=2,                             # two-hand pinch = zoom, twist = rotate
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)
landmarker = vision.HandLandmarker.create_from_options(options)
```

**(d) The socket loop.** Note two things: timestamps must be **monotonically
increasing** for VIDEO mode, and MediaPipe's `detect_for_video` is **blocking CPU**,
so we push it (and the JPEG decode) onto a thread with `asyncio.to_thread` to keep
the event loop responsive.
```python
ts_ms = 0
while True:
    frame = await socket.receive_text()
    rgb   = await asyncio.to_thread(_decode, frame)
    ts_ms = max(ts_ms + 1, int(time.monotonic() * 1000))     # strictly increasing
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = await asyncio.to_thread(landmarker.detect_for_video, mp_img, ts_ms)
    if result.hand_landmarks:
        hands = []                                  # up to 2 hands, with handedness
        for i, hlm in enumerate(result.hand_landmarks):
            label = result.handedness[i][0].category_name   # "Left"/"Right"
            hands.append({"label": label, "lm": [(p.x, p.y) for p in hlm]})
        out = proc.process(hands, time.monotonic())
    else:
        out = proc.idle()
    await socket.send_json(out)
```

`GestureProcessor` (next section) holds all per-connection state: the interaction
mode, the per-hand latched pinch, the card transform, and the grab/transform anchors.

---

## 8. The gesture model: a pinch-clutch state machine

This is the heart of it, in `GestureProcessor.process()` in [server.py](server.py).
The design follows spatial-UI best practice (Vision Pro / Quest / Ultraleap / HoloLens):

> **Separate targeting from actuation.** An open hand only *hovers* a pointer — it
> has **zero side effects**. The **pinch is the clutch**: it is the only thing that
> ever grabs/moves/zooms/rotates. This is the fix for the Midas-touch problem (the
> old design glued the card to the fingertip and rotated it constantly).

### 8.0 Foundations used everywhere
- **Selfie mirror:** `lm = [(1-x, y) for x,y in raw]` so on-screen motion matches you.
- **Size normalization:** `span = dist(lm[0], lm[9])` (wrist→middle-knuckle); divide
  every distance by it so thresholds hold at any hand-to-camera distance.
- **No z-axis:** single-camera depth is too noisy — everything is 2D geometry.
- **One Euro filter** on each hand's pointer (responsive + jitter-free). See `OneEuro`.

### 8.1 The clutch: pinch with hysteresis (per hand)
```python
pinch_d = dist(lm[4], lm[8]) / span
pinching = True  if pinch_d < PINCH_CLOSE (0.18)      # engage
           False if pinch_d > PINCH_OPEN  (0.30)      # release
           else previous                              # in-between: hold (hysteresis)
```
The **two different thresholds** (close < 0.18, open > 0.30) stop a held pinch from
flickering at the boundary — the single most important detail. State is kept per hand,
keyed by MediaPipe **handedness** ("Left"/"Right").

### 8.2 The state machine (chosen each frame)
```
hands present?  no → IDLE
both hands pinched → TRANSFORM   (zoom + rotate)
one hand pinched   → MOVE        (drag the card)
none pinched       → HOVER       (pointer only; swipe armed)
```
On every **mode change** we *latch* the anchors needed by the new mode (below). Click
is detected on the MOVE→HOVER transition; swipe only fires from HOVER.

### 8.3 HOVER — pointer + swipe (no manipulation)
```python
cursor = (oneEuroX(lm[8].x, now), oneEuroY(lm[8].y, now))   # per hand
# swipe: palm-centroid horizontal velocity, open hand, with velocity hysteresis
palm = centroid(lm[i] for i in (0,5,9,13,17)); vx = (palm.x - prev.x)/dt
if speed < SWIPE_SPEED*SWIPE_REARM: armed = True            # must slow down to re-arm
if armed and n_up>=3 and abs(vx)>SWIPE_SPEED and abs(vx)>abs(vy) and cooled_down:
    swipe = "right" if vx>0 else "left"; card.index += ±1; reset card transform
```
The card is **never** touched in HOVER — that is the whole point.

### 8.4 MOVE — pinch-drag with grab-offset anchoring
On pinch-down we latch `grab_offset = card_center − cursor`, then:
```python
card_center = cursor + grab_offset      # NOT card_center = cursor (that was the bug)
```
Anchoring means the card is picked up *where it sits* instead of teleporting to the
fingertip. A `MOVE_DEADZONE` (2% of frame) must be exceeded before it starts following,
so the small cursor drift as the fingers close doesn't nudge it.

**Click** = a MOVE that releases within `TAP_MAX` (0.35 s) having moved < `TAP_MOVE`
(4%) — i.e. a quick pinch-tap, not a drag. A 0.3 s cooldown blocks double-fires.

### 8.5 TRANSFORM — two-hand zoom + rotate (multitouch-in-air)
On entering (both hands pinched) latch `D0` (distance between the two pinch midpoints),
`scale0`, `theta0` (angle of the line between them) and `ang0`. While held:
```python
mid_i = (lm[4]+lm[8])/2 for each hand
D     = dist(mid_L, mid_R);   ang = degrees(atan2(midR.y-midL.y, midR.x-midL.x))
card.scale = clamp(scale0 * (D / D0), 0.4, 4.0)             # spread = zoom
card.angle = ang0 + unwrap(ang − theta0)                    # twist = rotate
card.center = midpoint(mid_L, mid_R) + mid_offset           # both hands also pan it
```
`unwrap(d) = ((d+180) % 360) − 180` prevents the ±180° seam from spinning the card.
This is exactly the phone pinch-zoom/rotate everyone already knows — chosen because
two well-separated pinch points are *more* stable on RGB than one-hand depth tricks.

### 8.6 Why two hands for zoom/rotate (and the one-hand option)
A single RGB webcam has no reliable depth, so one-hand zoom/rotate needs an arbitrary
overloaded gesture; two-hand pinch-distance/twist is unambiguous and universally known,
so we made it the zoom/rotate path. If you need one-handed zoom/rotate (e.g. the second
hand is often out of frame), the survey's fallback is: while a single pinch is held,
**vertical** drag = zoom and **wrist-roll** = rotate — latch a mode ~150 ms after
pinch-down. See §15.

> **Invent your own gesture:** pick landmarks → distance/angle/velocity → normalize by
> `span` → smooth → threshold, and gate it behind a state so it can't fire by accident.

---

## 9. Client internals, step by step

Full source: [index.html](index.html) (one file, inline CSS/JS, no build step).

**(a) Start camera** (needs a user gesture → behind a button; needs a *secure
context* → `localhost`/`127.0.0.1` or HTTPS). The `<video>` is **hidden** (parked
off-screen, not `display:none` so browsers keep producing frames) — we never show
the webcam feed:
```js
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 640, height: 480, facingMode: "user" }, audio: false });
video.srcObject = stream; await video.play();   // #video is off-screen in CSS
```

**(b) Capture + gating.** A small off-screen canvas downscales each frame; we send
the next frame **only after the previous result arrives** (`awaiting` flag):
```js
function pump() {
  if (!streaming || awaiting || ws.readyState !== 1) return;
  sendCtx.drawImage(video, 0, 0, 320, 240);
  awaiting = true;
  ws.send(send.toDataURL("image/jpeg", 0.6));
}
ws.onopen    = () => pump();
ws.onmessage = e => { handle(JSON.parse(e.data)); awaiting = false; pump(); };
```

**(c) Render — a dumb renderer of server state.** There is **no camera preview** and
the client computes **no** transforms. A single `requestAnimationFrame` loop draws,
into the stage `<canvas>`:
1. the **card** straight from `state.card.{x,y,scale,angle,index}` (server-owned),
   with a hover/grab outline driven by `state.hover` / `state.grabbed`;
2. the two-hand **rubber-band guide** from `state.guide` when transforming;
3. each hand's **virtual hand** skeleton (toggleable) + a **pointer** ring per hand —
   hollow when open, filled red when `pinching`.

`handle()` only copies `state`, updates readouts, and fires the discrete `click`/
`swipe` flashes. Because the client never derives the card transform from the cursor,
the pinch-clutch is enforced structurally. Card geometry constants (`CARD_HW/HH`) must
match the server's so hover hit-testing and rendering agree. Coordinates arrive
**already selfie-mirrored**, so map straight to canvas pixels — no client mirroring.

---

## 10. Tuning guide (every knob)

All server knobs are constants at the top of `GestureProcessor` in [server.py](server.py):

| Knob | Default | Effect |
|---|---|---|
| `PINCH_CLOSE` | `0.18` | Pinch ENGAGES below this (normalized thumb-index). Lower = must pinch tighter to grab. |
| `PINCH_OPEN` | `0.30` | Pinch RELEASES above this. The gap to `PINCH_CLOSE` is the hysteresis that stops flicker. |
| `ZOOM_MIN/MAX` | `0.4 / 4.0` | Clamp on the card scale. |
| `TAP_MAX` | `0.35` s | A pinch must release within this to count as a click (vs a drag). |
| `TAP_MOVE` | `0.04` | …and have moved less than this fraction of the frame. |
| `CLICK_COOLDOWN` | `0.3` s | Min gap between clicks. |
| `MOVE_DEADZONE` | `0.02` | Hand must move this far after grab before the card starts following. |
| `SWIPE_SPEED` | `1.2` | Higher = need a faster flick to swipe. |
| `SWIPE_COOLDOWN` | `0.6` s | Min gap between swipes. |
| `SWIPE_REARM` | `0.4` | Must slow below this × `SWIPE_SPEED` before another swipe can fire. |
| `CARD_HW/HH` | `0.133 / 0.142` | Card half-size (normalized). **Must match index.html.** |
| One Euro `min_cutoff` / `beta` (cursor `1.2`/`0.6`) | — | Higher cutoff = snappier; higher beta = less lag on fast moves. |
| `num_hands` | `2` | Hands tracked. `2` enables two-hand zoom/rotate. |
| `min_*_confidence` | `0.5` | Raise to reject marginal detections. |

Client knobs in [index.html](index.html): send resolution (`320×240`) and JPEG
quality (`0.6`) trade bandwidth/CPU vs. detection accuracy.

---

## 11. Integrating into our existing web app

You don't need our demo UI — you need the **events**. Two clean integration paths:

### Path A — keep the Python server, drop in a tiny client controller
Run `server.py` as a sidecar (localhost or an internal host) and add this
framework-agnostic controller to the app. It exposes the gesture stream as
callbacks; wire those to whatever the app does (pan a map, scrub a timeline, flip
slides, move a real cursor, etc.).

```js
class GestureController {
  constructor(url = `ws://${location.host}/ws`) { this.url = url; this.cbs = {}; }
  on(event, fn) { (this.cbs[event] ??= []).push(fn); return this; }
  _emit(ev, d) { (this.cbs[ev] || []).forEach(fn => fn(d)); }

  async start(videoEl) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    videoEl.srcObject = stream; await videoEl.play();
    const c = document.createElement("canvas"); c.width = 320; c.height = 240;
    const cx = c.getContext("2d");
    const ws = new WebSocket(this.url); let busy = false;
    const pump = () => {
      if (busy || ws.readyState !== 1 || videoEl.readyState < 2) return;
      cx.drawImage(videoEl, 0, 0, 320, 240); busy = true;
      ws.send(c.toDataURL("image/jpeg", 0.6));
    };
    ws.onopen = pump;
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data); busy = false;
      // the server already owns the state machine + transform — just relay it
      this._emit("state", d);                              // full frame (state, card, hands…)
      const p = d.hands[0] ? d.hands[0].cursor : null;
      if (p) this._emit("pointer", p);                     // {x,y} 0..1, every frame
      if (d.grabbed) this._emit("transform", d.card);      // {x,y,scale,angle} while held
      if (d.click) this._emit("click", p);                 // edge event
      if (d.swipe) this._emit("swipe", d.swipe);           // "left"|"right"
      pump();
    };
  }
}

// --- usage in the app ---
const g = new GestureController();
g.on("pointer",  ({x,y}) => app.moveCursor(x * innerWidth, y * innerHeight))   // hover only
 .on("transform", c => app.setTransform(c.x, c.y, c.scale, c.angle))           // while grabbed
 .on("swipe",     dir => dir === "right" ? app.next() : app.prev())
 .on("click",     () => app.click());
await g.start(document.querySelector("#cam"));
```

**Mapping advice:**
- Continuous controls (`move/zoom/rotate`) → drive **state**, not deltas; they're
  already smoothed and absolute. For "relative" UX (e.g. only pan while pinched),
  gate on `clicking`/`gesture` and integrate `move` deltas yourself.
- Discrete events (`click/swipe`) → trigger an action **once**; they're edge-gated
  server-side already.
- Add a **dead-zone / hysteresis** in the app for any binary toggle to avoid flicker
  near a threshold.

### Path B — no Python server (browser-only MediaPipe)
If "Python does the detection" is **not** a hard requirement, run MediaPipe in the
browser with `@mediapipe/tasks-vision` and delete the server entirely. You'd port
`GestureProcessor` (≈120 lines) to JS — the math is identical. Pros: zero backend,
no network round-trip, lower latency. Cons: ships the model to every client, logic
lives client-side. See [§14](#14-production-considerations).

### Where to mount the server
- **Same app, same origin:** serve the app's page from FastAPI too (no CORS), or
- **Sidecar service:** run `server.py` on its own port/host; point `GestureController`
  at `ws://that-host/ws`. If the page is HTTPS, the socket must be **`wss://`**
  (TLS) and the camera page must be HTTPS (secure-context rule).

---

## 12. Performance & real-time

Four levers (all already applied in the demo):
1. **Downscale before sending** — 320×240 is plenty for hand landmarks.
2. **JPEG quality ~0.5–0.7** — small frames, negligible accuracy loss.
3. **Drop stale frames** — request/response gating (one frame in flight). Never
   queue frames; a backlog = growing latency.
4. **Send back only data, never the image** — the JSON is < 1 KB.

Plus: **VIDEO mode** skips palm detection between frames; `asyncio.to_thread` keeps
the event loop free; per-connection landmarker avoids cross-stream contention.
Measured: ~30–60 FPS server-side on Apple-Silicon CPU; localhost round-trip ~tens of ms.

---

## 13. Gotchas & troubleshooting

| Symptom | Cause / fix |
|---|---|
| `mediapipe` won't install | Python 3.13 has no wheel → pin **3.12** (`.python-version`, `requires-python < 3.13`). |
| Used `mediapipe-silicon` | Abandoned (last 2023). Use plain **`mediapipe`** — it has native arm64 wheels. |
| Camera never prompts | `getUserMedia` needs a **secure context**: use `localhost`/`127.0.0.1` or HTTPS. Over a LAN IP it's blocked. On macOS also check *System Settings → Privacy & Security → Camera*. |
| Colors look wrong to the model / poor detection | OpenCV decodes **BGR**; you must `cvtColor(..., COLOR_BGR2RGB)` before `mp.Image`. |
| Motion feels reversed | Selfie mirror: server does `x → 1-x`. Mirror **once**. Don't also mirror on the client landmarks. |
| `detect_for_video` throws on timestamp | VIDEO mode needs **strictly increasing** ms timestamps per stream. |
| Laggy / growing delay | You're queuing frames. Enforce one-in-flight gating. |
| Jittery controls | Lower the EMA `alpha`s; raise `min_*_confidence`. |
| Swipe fires twice | Increase `SWIPE_COOLDOWN`; raise `SWIPE_SPEED`. |
| Multiple users on one server | Each connection already gets its **own** landmarker + state; just don't share a single landmarker globally. |

---

## 14. Production considerations

- **Scaling (server path):** MediaPipe is CPU-bound; one core does ~1 stream
  real-time. For many concurrent users, either move detection **into the browser**
  (Path B) or run a pool of workers and cap streams/instance. Don't fan all users
  through one process.
- **Browser-only is often the right production answer.** `@mediapipe/tasks-vision`
  (WASM/WebGL) runs the same model client-side, eliminating the backend and the
  network hop. Choose the server path only when detection genuinely must be
  centralized (e.g. logic/IP you can't ship, or non-browser clients).
- **Security/privacy:** raw video frames cross the wire in the server path — keep it
  on localhost or TLS (`wss://`) on a trusted host; never log frames. The browser
  path keeps video on-device.
- **Licensing:** MediaPipe is **Apache-2.0** (commercial-friendly). Avoid AGPL
  alternatives (Ultralytics YOLO) unless you accept copyleft.
- **Robustness:** add reconnect/backoff on the socket (the demo retries every 1 s),
  a "no hand for N seconds → idle" state, and per-control dead-zones in app code.

---

## 15. Extension ideas

- **Real OS mouse control:** map `cursor/click` to `pynput` on the server to move
  the actual system cursor (kiosk/accessibility).
- **Named static poses:** swap in the **Gesture Recognizer** task for 👍 ✊ ✌️ as
  discrete commands alongside the continuous controls.
- **Two hands:** `num_hands=2`; classic two-hand pinch-distance = zoom, two-hand
  rotation = rotate (often steadier than one-hand).
- **One-Euro filter** instead of EMA for lower latency at the same smoothness.
- **Custom gestures:** any landmark distance/angle/velocity, normalized by `span`,
  smoothed, thresholded (see the recipe at the end of [§8](#8-the-gesture-math-in-full)).

---

## 16. File manifest & glossary

| File | Purpose |
|---|---|
| [server.py](server.py) | FastAPI app: serves the page, hosts `/ws`, runs MediaPipe, `GestureProcessor` (all gesture math). |
| [index.html](index.html) | Camera capture, WebSocket client + gating, skeleton overlay, demo stage. No build step. |
| [pyproject.toml](pyproject.toml) | Dependencies; pins `requires-python < 3.13`. |
| [.python-version](.python-version) | Pins interpreter to 3.12 for uv. |
| `hand_landmarker.task` | The 7.5 MB model bundle (auto-downloaded on first run; git-ignored). |
| [README.md](README.md) | Quick start. |

**Glossary**
- **Landmark** — one of the 21 predicted hand keypoints (`x,y` in `[0,1]`).
- **MCP / PIP / DIP / TIP** — finger joints from knuckle to fingertip.
- **`span`** — reference hand size = `dist(wrist, middle-MCP)`; normalizes distances.
- **EMA** — exponential moving average smoothing.
- **Gating** — sending the next frame only after the previous result returns.
- **Selfie mirror** — flipping x so on-screen motion matches the user.
- **VIDEO mode** — MediaPipe running mode with inter-frame tracking (vs IMAGE / LIVE_STREAM).
- **Edge vs level** — `click`/`swipe` fire once (edge); `clicking`/`zoom` describe the current state (level).

---

*Built & verified June 2026. Questions: start at [§8](#8-the-gesture-math-in-full)
(the math) and the protocol contract in [§6](#6-the-websocket-protocol-the-contract).*
