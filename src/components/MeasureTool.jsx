import { useMeasure } from '../hooks/useMeasure.js'
import DimensionLine from './DimensionLine.jsx'

// Invisible click plane that fills the room for raycasting
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

  return (
    <group>
      {/* Floor plane */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.76, -5]} onClick={handleClick} visible={false}>
        <planeGeometry args={[10, 3.52]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-5, 1.76, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[10, 3.52]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[5, 1.76, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[10, 3.52]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Front wall */}
      <mesh
        position={[0, 1.76, 5]}
        rotation={[0, Math.PI, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[10, 3.52]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ceiling */}
      <mesh
        position={[0, 3.52, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[10, 10]} />
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
