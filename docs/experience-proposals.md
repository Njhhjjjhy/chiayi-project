# Five experience proposals — firefly room

## Read this first

This document holds five distinct experience-design proposals. Each is a complete experience from corridor entry to forest exit, anchored in a specific reference principle, with a flashlight-LED interaction.

Every value that has not been explicitly agreed by Riaan is marked `[FLAG: ...]`. These are not defaults. They are the questions that must be answered before any of these proposals becomes buildable.

What is locked (from the project's own decisions, not from this document):
- Room: 10x10m, usable ceiling ~3.52m, pillar-to-opposite-wall ~5.82m, entrance 240x352cm, 30-adult max capacity.
- Wall names: front wall, back wall, entrance wall, window wall.
- Architectural elements: D1 + D2 (back-wall doors), HVAC plenum (window-wall corner), windows (window wall), visitor entrance curtain (entrance wall).
- Spatial regions: corridor (lit, three segments along front + window + back walls) and forest (dark inner space).
- Experience runtime envelope: 15 to 20 minutes.
- Existing hardware base: Arduino-controlled addressable warm LEDs, infrared LEDs, sound sensors.
- Existing codebase elements: four-phase sunset shader, three behavioural states (Scattered Souls, The Wave, The Listening Dark), firefly point lights across ceiling modules.

What is not locked and is referenced as flagged across all five proposals:
- Flashlight count, distribution, return system. [FLAG: one shared, one per visitor, group of N, tethered, free, charging dock, none of these]
- Flashlight form factor and hardware. [FLAG: mechanical button vs continuous on, output spec, IR or no IR, additional sensors, weight, material]
- Per-LED IR sensing vs centralised IR sensing. [FLAG: which is the actual hardware capability]
- Wall treatment in the forest. [FLAG: still one of five open options — moss wall, layered mountain silhouette, reflective fracture wall, fiber veil wall, projection-reactive surface]
- Fact card count, distribution, geometry, content. [FLAG: per ongoing decisions in plan-and-phases]
- Exit route. The exit is via D1 or D2; "exit corridor" is not a real architectural feature in this room. [FLAG: which door, what visitor sees on the way out]
- All durations, lumens, colour temperatures, milliseconds, intensities. Marked individually below.

A note on shared references. Two of the proposals (1 and 5) draw on the same reference work, the fog-corridor reference, because that single work contains both a restricted-vision aspect and a compressed-day aspect. Riaan should decide whether the comparison set keeps both or whether one is reassigned to a different reference. [FLAG: keep both, drop one, reassign]

A note on the flashlight concept. The flashlight is the instrument by which the visitor becomes a co-producer of the work. That framing is locked. What the flashlight physically is, how many there are, and what it does mechanically — none of those are decided.

---

## Proposal 1 — the dark-corridor proposal

**Reference.** A fog-filled corridor where vision is restricted to about 1.5 metres so the visitor must navigate by other senses.

**Thesis.** The room is built for the eye that does not work. Visitors arrive expecting to see fireflies. They are given almost no light to do so. The flashlight makes a small bubble of legibility; everything outside the bubble must be sensed by other means.

**Mechanical concern to resolve.** As written, the flashlight is required to find fireflies but also scatters fireflies away from its beam. This means the visitor only sees fireflies in the dark zones around the beam — they must point the light somewhere they don't care about in order to see fireflies somewhere they're not looking. This is poetic but interaction-incoherent. [FLAG: keep the scatter mechanic and accept the paradox as the point, OR change to a different LED response (e.g. LEDs flock toward beam, LEDs ignore beam and only respond to absence of light, etc.)]

**Phases.**

*Phase 1 — entry.* [FLAG: duration]. Visitor pushes through the entrance curtain. The flashlight is given. [FLAG: by host vs self-service vs wall-mounted dispenser]

*Phase 2 — corridor.* [FLAG: duration. Note: same physical corridor across all proposals — duration must be consistent unless dwell time is the variable]. The corridor begins at outdoor brightness. Each segment of the spiral steps down in brightness. [FLAG: how many brightness steps, what target lux at each segment]. By the partition entry, the corridor is dark enough that the flashlight is required to read the fact cards. [FLAG: card content, card lighting choice — self-illuminated vs flashlight-revealed]

[FLAG: haze yes/no in corridor. If yes: type, density, generation method, ventilation impact, fire-code implications]

*Phase 3 — forest entry.* [FLAG: duration]. The visitor steps through the partition opening into the forest. The forest is darker than the corridor's last stretch.

*Phase 4 — forest.* [FLAG: duration]. The fireflies are present but invisible until the flashlight reveals them. When the visitor's flashlight beam hits a region, the LEDs there respond — [FLAG: see mechanical concern above; choose response model first].

[FLAG: timing and trigger of any auto-event — e.g. The Listening Dark behaviour taking over after some idle period, or never, or only once per visitor]

*Phase 5 — exit.* [FLAG: duration]. The visitor walks toward the exit (D1 or D2 — [FLAG: which]). The flashlight is returned. [FLAG: where, how, charging needs]

**Flashlight mechanic spec.**
- Output: warm amber. [FLAG: target lumens, target colour temperature]
- Active emitter: [FLAG: IR yes/no, IR wavelength, modulation scheme, or simpler — a photodetector on each LED reads the visible flashlight directly]
- LED behaviour: [FLAG: contingent on response model resolution above]
- Failure mode: [FLAG: what does the room do when no flashlight is active]

**What this proposal trades.** It is the most demanding for the visitor. Quiet visitors who walk slowly and accept the rules will have a profound experience. Visitors who want a "show" may feel cheated.

---

## Proposal 2 — the strobe proposal

**Reference.** A pitch-black room with a water fountain and a strobe that flashes for nanoseconds, freezing impossible water shapes that exist for moments shorter than the eye can see — making visible what is normally invisible.

**Thesis.** Between the visitor's flashlight clicks, there is no visible room. Each click is a single frame of a film the visitor edits in real time. The fireflies move continuously in absolute darkness; the visitor only ever sees frozen instants.

**Phases.**

*Phase 1 — entry.* [FLAG: duration]. Visitor enters the corridor. The flashlight is given. [FLAG: how to communicate the click rule to the visitor — staff briefing, signage, by example]

*Phase 2 — corridor.* [FLAG: duration]. The corridor functions as the click-calibration zone. Visitors learn the click is the unit of attention. [FLAG: corridor lighting — does the click do anything in the corridor, or does it only activate inside the forest]

[FLAG: fact card content and whether they are click-related prompts vs firefly facts vs vision facts]

*Phase 3 — forest entry.* [FLAG: duration]. The visitor passes through the partition. The forest is in absolute darkness. [FLAG: actually absolute, or a base layer too low to perceive without dark adaption]

*Phase 4 — forest.* [FLAG: duration]. The fireflies run their full choreography in absolute dark. Click the flashlight: the entire LED system performs a synchronous flash. [FLAG: flash duration in ms, target intensity, exact LED scope — all 100, ceiling only, region around visitor]

[FLAG: idle auto-flash yes/no, interval, intensity if yes]

[FLAG: group-sync mechanic yes/no. If yes: detection window in ms, enhanced flash spec. Note: detecting "≥2 different visitors clicking" vs "≥2 clicks" requires per-flashlight identity in the IR signal — flagged as a hardware decision]

*Phase 5 — exit.* [FLAG: duration]. [FLAG: final reveal flash yes/no, duration, intensity if yes]

**Flashlight mechanic spec.**
- Single button click. [FLAG: tactile feel — soft, hard, audible, silent]
- IR transmitter sends "click" event to room controller. [FLAG: per-flashlight ID yes/no]
- Room controller fires a synchronous global flash. [FLAG: all LEDs vs subset, duration in ms, intensity, colour state at moment of flash]
- Latency target. [FLAG: button-to-flash latency budget]
- Group bonus parameters. [FLAG: see above]
- Auto-flash parameters. [FLAG: see above]

**What this proposal trades.** It is the most photogenic and the most teamLab-comparable. It trades subtlety for impact. The risk that visitors over-click and the experience becomes a strobe show is real and depends entirely on the flash duration and visitor recovery time — [FLAG: needs simulation or real-room testing before the values are settled].

---

## Proposal 3 — the recalibration proposal

**Reference.** A room bathed in monofrequency yellow light. The longer visitors stay, the more they begin to perceive subtle distinctions — the work is the eye learning to see again.

**Thesis.** Dark adaption — the physiological process by which the human retina becomes more sensitive over time in low light — is the actual subject of the room. Most people have never experienced it deliberately. The flashlight is the temptation that teaches the discipline of stillness.

**Biological note.** I previously asserted specific numbers ("100,000 times more sensitive," "20 to 30 minutes," "10 seconds of seeing per second of light," "pupils dilated 3x"). These were partly real and partly invented. None should appear in this document or on fact cards until verified against actual visual physiology references. [FLAG: literature search and source citations needed for any biological claim made to visitors]

**Phases.**

*Phase 1 — entry.* [FLAG: duration]. The visitor passes through the entrance curtain into the corridor. They are told the room rewards stillness. [FLAG: exact wording of instruction to visitor]. The flashlight is given.

*Phase 2 — corridor as adaption ramp.* [FLAG: duration. Note: dark adaption is a measurable physiological process — the corridor walk-time should be calibrated to a real adaption curve, not picked arbitrarily]. The corridor walks the visitor through a tuned dimming curve calibrated to rod cell adaption. [FLAG: target lux at each corridor segment, total dimming range, segmentation]

[FLAG: fact card content. Note: in this proposal the cards were originally about vision physiology, but those claims need verification per biological note above]

*Phase 3 — forest entry.* [FLAG: duration]. The visitor steps through the partition. The forest is dark with a faint base layer of LED light too low to be perceived by an unadapted eye but visible to a partially-adapted one. [FLAG: target intensity of base layer, target time-to-perceive for an average visitor]

*Phase 4 — forest.* [FLAG: duration]. The eye continues to adapt; more LEDs become perceptible over time. [FLAG: how the LED choreography is structured to reward adaption — same field at constant intensity, or a slow brightening, or a layered reveal at successive sensitivity thresholds]

The flashlight is here as a temptation. Pressing the button blanks the visitor's adaption. [FLAG: pulse duration and intensity, with the explicit goal of being bright enough to genuinely reset adaption. This is a real physiological threshold and should be specified from a vision-science source, not picked by intuition]

There is no auto-reveal, no group mechanic, no climactic event.

*Phase 5 — exit.* [FLAG: duration]. A short transition zone brings ambient light back up gradually so the visitor's eyes are not shocked back to building light. [FLAG: ramp time and curve]

**Flashlight mechanic spec.**
- Mechanical button, single press.
- Output: amber pulse. [FLAG: duration, intensity, colour temperature, calibrated to genuinely reset rod adaption]
- No IR component; the flashlight does not communicate with the LEDs.
- The mechanic is purely physiological.
- [FLAG: optional features such as a press counter — keep, drop, or defer]

**What this proposal trades.** It is the slowest, the most patient, and the most likely to lose visitors who do not know how to be still. It is also the cheapest to build — most of the engineering is in the corridor's dimming curve and the forest LED base layer. The risk is that visitors leave thinking nothing happened.

---

## Proposal 4 — the mirrored-self proposal

**Reference.** A striped mirror and transparent glass arranged so the visitor sees their own reflection interleaved with the world behind. The broader principle: the work is the visitor's awareness of their own perceiving.

**Thesis.** The visitor must see themselves inside the firefly system, not outside looking at it. The room collapses the distance between insect, retina, and observer.

**Hardware concern to resolve before this proposal is buildable.** This proposal as written invents a complete additional hardware program: photoplethysmography pulse-reading in the flashlight grip, low-energy radio transmission to the room controller, mirrored partition surfaces. None of that is in the project's hardware base. [FLAG: is this hardware program in scope at all, and at what budget. If no, this proposal collapses to its non-pulse mechanic and needs a different driver. If yes, a separate hardware spec is required]

**Reflection concern.** A continuous mirror band at chest height in a dark forest will reflect every firefly LED, doubling the light count and potentially breaking the darkness requirement. [FLAG: simulation or test required, OR mirror coverage / placement reduced from "continuous around perimeter"]

**Phases.**

*Phase 1 — entry.* [FLAG: duration]. The visitor passes through the entrance curtain. The flashlight is given. [FLAG: visitor instruction wording, what the visitor is told vs not told about the pulse mechanic]

*Phase 2 — corridor as reflective spiral.* [FLAG: duration]. The corridor's interior partition wall is treated with alternating vertical bands of mirrored film and transparent dark surface. [FLAG: stripe width, ratio of mirror to transparent, mounting, fabrication method, cost]

[FLAG: fact card placement strategy in relation to mirror stripes — between, on, ignored]

*Phase 3 — forest entry.* [FLAG: duration]. [FLAG: chest-height mirror band — confirm yes/no after reflection concern resolved; if yes, exact height as fixed dimension not "chest"]

*Phase 4 — forest.* [FLAG: duration]. Fireflies run an ambient choreography. When the visitor turns on the flashlight and points it across the room, the LEDs in a region around the beam pulse in sync with the visitor's heart rate (read from the flashlight grip). [FLAG: cone angle, pulse-to-LED smoothing parameters, what happens when pulse cannot be read]

[FLAG: the "captured in time" mechanic — flashlight stops responding for some interval and the LEDs continue at the last-read rate. This was originally described as artistic; mechanically it is just a stale cached value. Decide: keep as gimmick, redesign, drop]

*Phase 5 — exit.* [FLAG: duration]. The visitor walks out. [FLAG: clean mirror panel by exit door yes/no — and if yes, which door (D1 or D2)]

**Flashlight mechanic spec.**
- Conductive grip pad reads pulse via PPG. [FLAG: hardware spec, sensor type, power, cost, reliability per visitor (skin contact is unreliable)]
- Pulse data transmission. [FLAG: BLE, 433MHz, wired, none of these]
- LEDs in cone around flashlight beam pulse at received rate, with smoothing. [FLAG: smoothing constant]
- Flashlight beam itself. [FLAG: lumens, colour temperature]
- Failure mode default. [FLAG: when pulse cannot be read, what happens]

**What this proposal trades.** It is the most technically ambitious. It is also the most personal — the experience changes per visitor in a way the others do not. The hardware concern is the gating decision.

---

## Proposal 5 — the compressed-day proposal

**Reference.** Same source as proposal 1. In addition to being a fog tunnel, the fog-corridor reference condenses an entire day's light into a single corridor walk — bright daylight, golden sunrise, chilly blues, deep twilight. This proposal builds on that compressed-day aspect.

**Thesis.** The visitor walks through a 24-hour cycle in 15 to 20 minutes. The corridor is the day. The forest is the night. The flashlight is the moon.

**Phases.**

*Phase 1 — entry.* [FLAG: duration]. The visitor passes through the entrance curtain. The flashlight is given. [FLAG: visitor instruction wording]

*Phase 2 — corridor as compressed day.* [FLAG: duration. Note: must be consistent with proposals 1 and 3 corridor durations — same physical corridor]. The corridor walls and ceiling run a slow synchronised colour wash across the four-phase sunset palette already implemented in the codebase. [FLAG: how the existing screen-based shader is translated to physical corridor lighting — projection, RGB LED panels, RGB LED strips, painted gradient with white-balance light, none of these]

[FLAG: fact card content following the time-of-day arc — actual sentences to be written]

*Phase 3 — forest entry.* [FLAG: duration]. The visitor steps through into total dark.

*Phase 4a — moonrise.* [FLAG: duration window]. When the visitor turns on the flashlight and points it at the ceiling, a slow ripple of LEDs wakes outward from the beam. [FLAG: wake-front propagation speed, LED intensity ramp, beam-tracking method]

**Hardware concern.** Knowing where the moon points requires position tracking of the flashlight in 3D space relative to the ceiling. [FLAG: this is a non-trivial sensor problem — multiple ceiling IR receivers triangulating, computer vision, or inertial measurement on the flashlight. None is currently in the hardware base. Decide: scope this work in, or simplify the mechanic to "any flashlight on" triggers a global wave]

*Phase 4b — full night.* [FLAG: duration]. Once the forest is awakened, it runs the existing behavioural states (Scattered Souls, Wave) autonomously. The flashlight modulates local intensity. [FLAG: modulation parameters]

[FLAG: multi-flashlight harmonisation — same hardware question as above. If position tracking is in: this works. If not: the multi-moon idea collapses to "more flashlights, more global brightness"]

*Phase 4c — dawn.* [FLAG: duration]. The room slowly fades. [FLAG: trigger — time-based, presence-sensor-based at exit zone, manual operator]

*Phase 5 — exit.* [FLAG: duration]. Ambient light returns gradually. [FLAG: where this happens — at the actual back-wall door (D1 or D2), or in a transition zone before the door, and what physical space that transition zone occupies inside the forest]

**Flashlight mechanic spec.**
- Output: warm amber. [FLAG: lumens, colour temperature — note this proposal probably wants more output than proposals 1, 3, 4]
- Active emitter. [FLAG: contingent on position-tracking decision above]
- LED behaviour. [FLAG: wake-front propagation speed, persistence after beam moves away, multi-flashlight aggregation]
- Capacity. [FLAG: how many simultaneous flashlights the room must handle. Note: 30-adult capacity is locked but flashlight count is not]
- Dawn sequence trigger. [FLAG: see above]

**What this proposal trades.** It is the most narratively legible — the day-night cycle is universally readable. It is also the most cinematic, which is its strength and its risk: it leans toward spectacle, which is the further from the reference principle than the others. It uses the four-phase shader from the codebase, which is one tested system; it claims to use the behavioural modes and the wave, which are partially built per the handoffs and not as solid as I previously asserted.

---

## What is the same vs different across proposals

The five proposals share:
- The room's locked architecture.
- The corridor → forest → exit structure.
- The flashlight as the visitor's instrument.
- A 15 to 20 minute total runtime.

The five proposals differ in:
- Which reference principle is dominant.
- What the flashlight does mechanically.
- How active or passive the visitor's role is.
- How the corridor is lit and what its dimming/colour curve is.
- What the forest looks like at rest (absolute dark vs near-dark vs faint base layer).
- Whether there are auto-events vs purely visitor-driven events.
- Whether multiple visitors interact via the system or experience the room in parallel.

(I had a comparison matrix here previously with subjective ratings — "build complexity: low/medium/high," "risk: too demanding / too photogenic / too slow." Those were guesses. Removed. Real comparison should come after the flagged values are settled.)

## What this document is, and what it is not

This document is a comparison set of five experience theses, each rooted in a different (or in two cases, a differently-emphasised) reference work. It is not buildable as written. The flags identify what must be answered before any of the five proposals becomes a phase file with measurements, hardware, and acceptance criteria.

The next step is Riaan's: pick a proposal direction (or a hybrid), then walk through the flags one section at a time to settle real values.
