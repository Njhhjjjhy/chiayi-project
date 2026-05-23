import * as THREE from 'three'

// Dark navy fabric plane hanging on a track. Used for all three
// blackout curtains (window, entrance, exit) — the constants for each
// curtain's position and size live in dimensions.js.
//
// orientation:
//   'window-wall'    plane in its default orientation (front face +Z).
//                    Used for the curtain hanging in front of the
//                    window-wall (visitor stands at lower Z).
//   'entrance-wall'  plane rotated 180° around Y (front face -Z). Used
//                    for the curtains hanging in front of the entrance-
//                    wall openings (visitor stands at higher Z).
//
// DoubleSide means both faces render regardless of orientation; the
// rotation is preserved to document the design intent and so any future
// single-sided material swap keeps the correct facing.

const MATERIAL_COLOR = '#0a0f1c'

export default function TheatricalCurtain({
  width,
  height,
  centerX,
  centerY,
  centerZ,
  orientation = 'window-wall',
}) {
  const rotationY = orientation === 'entrance-wall' ? Math.PI : 0
  return (
    <mesh position={[centerX, centerY, centerZ]} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[width, height]} />
      {/* ambient-visible: dark navy fabric, lifted off pure black so AgX
          can show fold detail rather than a flat shadow shape. */}
      <meshStandardMaterial
        color={MATERIAL_COLOR}
        emissive={MATERIAL_COLOR}
        emissiveIntensity={0.06}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
