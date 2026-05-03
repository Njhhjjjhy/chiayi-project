import { useMeasure } from '../hooks/useMeasure.js'
import DimensionLine from './DimensionLine.jsx'
import { ROOM, HW, HD } from '../geometry/dimensions.js'

// Invisible click plane that fills the room for raycasting. All planes
// derive from canonical room constants so the tool follows ROOM.
function ClickPlane({ onPoint }) {
  const handleClick = (e) => {
    e.stopPropagation()
    const point = e.point
    onPoint([
      Math.round(point.x * 100) / 100,
      Math.round(point.y * 100) / 100,
      Math.round(point.z * 100) / 100,
    ])
  }

  const halfH = ROOM.H / 2

  return (
    <group>
      {/* Floor plane (slightly larger than footprint for edge clicks) */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[ROOM.W + 1, ROOM.D + 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Front-wall (z = -HD) */}
      <mesh position={[0, halfH, -HD]} onClick={handleClick} visible={false}>
        <planeGeometry args={[ROOM.W, ROOM.H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Back-wall (z = +HD) */}
      <mesh
        position={[0, halfH, HD]}
        rotation={[0, Math.PI, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[ROOM.W, ROOM.H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Entrance-wall (x = -HW) */}
      <mesh
        position={[-HW, halfH, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[ROOM.D, ROOM.H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Window-wall (x = +HW) */}
      <mesh
        position={[HW, halfH, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[ROOM.D, ROOM.H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ceiling (y = ROOM.H) */}
      <mesh
        position={[0, ROOM.H, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[ROOM.W, ROOM.D]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

// Marker sphere at a clicked point
function PointMarker({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#ff4444" />
    </mesh>
  )
}

export default function MeasureTool() {
  const { measureMode, pendingPoint, measurements, addPoint } = useMeasure()

  if (!measureMode && measurements.length === 0) return null

  return (
    <group>
      {/* Invisible click surfaces (only active in measure mode) */}
      {measureMode && <ClickPlane onPoint={addPoint} />}

      {/* Pending first point marker */}
      {pendingPoint && <PointMarker position={pendingPoint} />}

      {/* Saved measurements */}
      {measurements.map((m) => (
        <DimensionLine
          key={m.id}
          start={m.start}
          end={m.end}
          label={`${m.distance.toFixed(2)}m`}
          color="#ff4444"
        />
      ))}
    </group>
  )
}
