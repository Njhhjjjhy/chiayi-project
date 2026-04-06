import { useMemo } from 'react'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'

// Proper architectural dimension line: thin line between two 3D points,
// perpendicular end-ticks, and a centered measurement label.

const TICK_SIZE = 0.12

export default function DimensionLine({
  start,
  end,
  label,
  color = '#1a6bff',
  offset = 0,
  offsetDirection,
  tickSize = TICK_SIZE,
  fontSize = '9px',
}) {
  const { points, ticks, midpoint, distance } = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const dist = s.distanceTo(e)

    // Direction from start to end
    const dir = new THREE.Vector3().subVectors(e, s).normalize()

    // Perpendicular direction for offset and ticks
    let perp
    if (offsetDirection) {
      perp = new THREE.Vector3(...offsetDirection).normalize()
    } else {
      // Default: perpendicular in the plane most aligned with the line
      const up = new THREE.Vector3(0, 1, 0)
      perp = new THREE.Vector3().crossVectors(dir, up).normalize()
      if (perp.lengthSq() < 0.01) {
        perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize()
      }
    }

    // Offset start/end by the offset distance
    const oS = s.clone().addScaledVector(perp, offset)
    const oE = e.clone().addScaledVector(perp, offset)
    const mid = new THREE.Vector3().addVectors(oS, oE).multiplyScalar(0.5)

    // Tick marks (perpendicular to the dim line)
    const tickDir = perp.clone().multiplyScalar(tickSize)
    const tick1 = [
      oS.clone().add(tickDir).toArray(),
      oS.clone().sub(tickDir).toArray(),
    ]
    const tick2 = [
      oE.clone().add(tickDir).toArray(),
      oE.clone().sub(tickDir).toArray(),
    ]

    // Extension lines from original points to offset line
    const ext1 = offset !== 0 ? [s.toArray(), oS.toArray()] : null
    const ext2 = offset !== 0 ? [e.toArray(), oE.toArray()] : null

    return {
      points: [oS.toArray(), oE.toArray()],
      ticks: { tick1, tick2, ext1, ext2 },
      midpoint: mid.toArray(),
      distance: dist,
    }
  }, [start, end, offset, offsetDirection, tickSize])

  const displayLabel = label ?? `${distance.toFixed(2)}m`

  return (
    <group>
      {/* Main dimension line */}
      <Line points={points} color={color} lineWidth={1.5} />

      {/* End ticks */}
      <Line points={ticks.tick1} color={color} lineWidth={1.5} />
      <Line points={ticks.tick2} color={color} lineWidth={1.5} />

      {/* Extension lines (when offset) */}
      {ticks.ext1 && <Line points={ticks.ext1} color={color} lineWidth={0.5} dashed dashSize={0.05} gapSize={0.05} />}
      {ticks.ext2 && <Line points={ticks.ext2} color={color} lineWidth={0.5} dashed dashSize={0.05} gapSize={0.05} />}

      {/* Label */}
      <Html position={midpoint} center style={{ pointerEvents: 'none' }}>
        <div style={{
          background: color,
          color: '#fff',
          padding: '1px 5px',
          borderRadius: '2px',
          fontSize,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          {displayLabel}
        </div>
      </Html>
    </group>
  )
}
