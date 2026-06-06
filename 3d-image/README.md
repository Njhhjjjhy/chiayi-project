# 🖐️ 360° Panorama Tour + Hand-Gesture Control

A WebGL2 **360° panorama viewer** you can drive with **webcam hand gestures** — look
around, zoom, and jump between spots, no mouse. The page captures the camera, streams
frames over a WebSocket to a local **Python** server running **MediaPipe Hand
Landmarker**, which detects the hand and returns a small gesture state; the page maps
that onto the viewer's camera. Mouse / touch / keyboard still work exactly as before —
gestures are an opt-in layer.

Everything runs from **one server** (FastAPI) on `:8000`: the page, the panorama
assets, and the gesture WebSocket.

```
browser (index.html)                         python server (server.py, :8000)
  webcam ─► 320×240 canvas ─JPEG──ws──►        cv2.imdecode ─► MediaPipe Hand Landmarker
  drive yaw / fov / spot  ◄──json (ws)──        pinch-clutch state machine → {state, hands, swipe…}
  GET / and /assets/* ◄─────http────────        serves index.html + panorama images
```

All gesture detection happens in Python; the page just renders.

## Run

```bash
uv run python server.py          # or double-click start.command
```

First launch downloads the `hand_landmarker.task` model (~7 MB) automatically. Open
**http://localhost:8000**, then click the **🖐 button** in the top toolbar and allow
camera access.

- **Python 3.12** is used (uv installs it automatically — MediaPipe has no 3.13 wheel).
- macOS asks for camera permission in the **browser**; if it never prompts, enable it
  under *System Settings → Privacy & Security → Camera*. `localhost` is required (it's
  a secure context for the camera) — the single server already serves on `localhost`.

## Gestures

**The pinch is the clutch** — nothing moves until you pinch. An open hand only moves a
pointer reticle, which avoids the "everything triggers by accident" (Midas-touch)
problem. Mapping follows spatial-UI conventions (Apple Vision Pro, Meta Quest, Ultraleap).

| Gesture | Panorama action |
|---|---|
| Move an **open hand** | Pointer reticle only — no effect (hover) |
| **Pinch** (thumb+index) **+ drag** | Look around — grab-the-world yaw / pitch |
| **Two hands** pinched, spread / together | Zoom in / out (field of view) |
| Open-palm fast horizontal **flick** | Jump to previous / next spot |

(Up/down look applies only when the viewer's **Tilt** toggle is on, same as the mouse.)

## Why this detector (2026 survey)

| Option | Verdict |
|---|---|
| **MediaPipe Hand Landmarker** ✅ | 21 landmarks → continuous geometry; 30–60 FPS on Apple-Silicon CPU; Apache-2.0; one `uv add`. |
| YOLO / HaGRID | Per-frame class label only (no continuous signal); Ultralytics is AGPL-3.0. |
| HaMeR / WiLoR (3D mesh transformers) | GPU-only, sub-realtime on a laptop, overkill. |
| OpenPose | Legacy, GPU-hungry, costly commercial license. |

## Files

- `index.html` — the panorama viewer **with** the gesture bridge built in (no build step)
- `server.py` — FastAPI: serves the page + `/assets`, runs MediaPipe, the gesture state machine
- `assets/` — panorama images + `manifest.json`
- `start.command` — double-click launcher (runs the server, opens the browser)
- `pyproject.toml` — pinned deps for `uv`
- `HANDOVER.md` — full engineering write-up of the gesture system (protocol, math, tuning)

## Tuning

Gesture thresholds live at the top of `GestureProcessor` in [server.py](server.py):
the pinch clutch `PINCH_CLOSE`/`PINCH_OPEN`, `SWIPE_SPEED`/`SWIPE_COOLDOWN`, etc.
(see [HANDOVER.md](HANDOVER.md) §10). The panorama pan/zoom **gains** live in the
gesture bridge (section 10) of [index.html](index.html) — `CFG.dragSpeed * cam.fov *
1.7` for look speed, and the fov ratio for zoom. Raise/lower to taste.
