# Phase 3: visitor experience and narrative

Priority: high.

## Experience flow - 15 to 20 minutes, entrance to exit

Create a page or section that maps this journey. Each step should be visually distinct.

### Step 1 - entrance statement wall (2-3 minutes)

A wall at the entrance that introduces the story, concept, and theme. This is the first thing visitors see before entering the dark space.

Content on the wall:
- Exhibition title.
- A brief paragraph explaining what visitors are about to experience.
- The core theme in simple language: fireflies as a bridge between humans and nature, light as communication, "you are what you see."
- Visual elements that set the tone (photographs of Alishan at dusk, firefly macro photography, or abstract representations).

The entrance is 240 cm wide x 352 cm tall. Design for this exact size.

### Step 2 - sound transition (1-2 minutes)

As visitors move from the lit entrance into the dark exhibition space, ambient sound introduces the concept.

Sound layers:
- Forest ambience: cicadas, rustling leaves, distant water, wind through bamboo.
- A subtle musical layer that evokes nightfall - slow, minimal, not melodic enough to become the focus.
- The sound should feel like dusk arriving. Volume increases gradually as visitors move deeper into the dark space.

Sound is the bridge between the bright entrance and the dark interior. It tells visitors "you are entering a different world."

### Step 3 - firefly discovery (10-12 minutes)

Visitors receive infrared flashlights at the entrance. Inside the dark space, they discover fireflies by pointing their flashlights at ceiling modules. The flashlights trigger the infrared detectors, causing nearby firefly LEDs to respond.

This creates personal agency. Each visitor is actively discovering and interacting, not passively watching.

The floor underfoot feels like a forest floor (see phase 5). The big wall (see phase 2) provides peripheral visual context. The ceiling is the primary interactive surface.

Max capacity: 30 adults in the space simultaneously.

### Step 4 - exit through retail (2-3 minutes)

Visitors exit into the merchandise area (see phase 6). The transition from dark immersion to bright retail creates a moment of re-entry. The retail space is thematically connected but clearly separate.

## Firefly algorithm - 3 states, 2 variants each

The LED system has 3 behavioral states. Write the logic as pseudo-code that an Arduino developer can implement.

### State 1 - idle (no visitors detected)

Fireflies blink on their own in a naturalistic pattern. Not all LEDs are ever on simultaneously.

**Variant A - random scatter:**
```
for each LED in module:
  brightness = 0
  target_brightness = random(30, 255)
  fade_duration = random(1000, 4000) ms
  pause_after = random(2000, 8000) ms

at any moment, 10-30% of all LEDs across the ceiling are active
each LED independently fades in, holds briefly, fades out, then pauses
no coordination between modules
```

**Variant B - drift wave:**
```
wave_origin = (x: random, y: random)  // picks a new origin every 30-60 seconds
wave_speed = 0.5 modules per second
wave_width = 3 modules

as wave passes through a module:
  activate 30-50% of that module's LEDs
  fade in over 1500 ms, hold 1000 ms, fade out over 2000 ms

result: a slow wave of activation drifts across the ceiling
looks like wind moving through a field of fireflies
```

### State 2 - motion (visitor walking detected by IR sensor)

The module's infrared detector senses a body moving below.

**Variant A - ripple:**
```
on motion_detected(module_id):
  increase module brightness by 40%
  increase blink rate by 2x for 3-5 seconds
  trigger adjacent modules at 50% intensity with 500 ms delay
  after 5 seconds, return to idle state

result: a ripple of increased activity follows the visitor
```

**Variant B - startle:**
```
on motion_detected(module_id):
  immediately turn off all LEDs in module (0 ms)
  wait 2000 ms (total darkness above the visitor)
  reactivate LEDs one by one at 300 ms intervals
  each LED fades in slowly over 1500 ms

result: fireflies go dark when startled, then cautiously return
mimics real firefly behavior when disturbed
```

### State 3 - flashlight interaction (IR flashlight pointed at detector)

A visitor deliberately aims their infrared flashlight at a module.

**Variant A - discovery reward:**
```
on flashlight_detected(module_id):
  activate all 18 LEDs in rapid cascade:
    LED 1 on at 0 ms
    LED 2 on at 80 ms
    LED 3 on at 160 ms
    ...continue through LED 18
  hold all 18 at full brightness for 3000 ms
  fade all out together over 2000 ms
  return to idle

result: a burst of light rewards the visitor's discovery
```

**Variant B - chain reaction:**
```
on flashlight_detected(module_id):
  activate all 18 LEDs over 500 ms
  after 500 ms, trigger each adjacent module (up/down/left/right):
    activate 12 of 18 LEDs over 800 ms
  after 1000 ms, trigger next ring of modules:
    activate 6 of 18 LEDs over 1200 ms
  spreading stops after 2-3 rings
  all activated modules fade back to idle over 3000 ms

result: a chain reaction spreads outward from the flashlight point
creates a sense of interconnection across the ceiling
```

## Local Alishan firefly context

Include a section on the page with this factual information:

- Alishan hosts approximately 42 firefly species, roughly two-thirds of all species found in Taiwan.
- Peak firefly season: April through June.
- Laiji Village and the broader Alishan region are among Taiwan's premier bioluminescent habitats.
- Common local species include Luciola cerata and Aquatica ficta.
- Real firefly flash patterns vary by species: some flash in slow single pulses (2-4 second intervals), others in rapid double or triple bursts. The LED algorithm should reference these real patterns where possible.
