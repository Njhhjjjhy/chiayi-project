import { Html } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.jsx'
import { mountainWallVariants } from '../variants/mountainWall.js'

function Label({ position, children, color = '#333', bg = '#fff' }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: bg,
        color: color,
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '10px',
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
        border: '1px solid #ccc',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}>
        {children}
      </div>
    </Html>
  )
}

function DimLine({ position, children }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: '#1a6bff',
        color: '#fff',
        padding: '1px 5px',
        borderRadius: '2px',
        fontSize: '9px',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {children}
      </div>
    </Html>
  )
}

function MaterialNote({ position, children }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: '#f5f0e8',
        color: '#665533',
        padding: '2px 5px',
        borderRadius: '2px',
        fontSize: '8px',
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
        border: '1px solid #ddd0bb',
      }}>
        {children}
      </div>
    </Html>
  )
}

export default function DimensionLabels({ roomWidth, roomDepth, roomHeight, mountainOverrides }) {
  const { selections } = useVariant()
  const halfW = roomWidth / 2
  const halfD = roomDepth / 2

  const mwId = selections.mountainWall || 'softRolling'
  const mw = mountainWallVariants[mwId] || mountainWallVariants.softRolling
  const spacing = mountainOverrides.spacing || mw.spacing
  const layers = mw.layers
  const totalDepth = (layers - 1) * spacing

  return (
    <group>
      {/* Room dimensions */}
      <DimLine position={[0, 0.05, halfD + 0.3]}>{roomWidth}m</DimLine>
      <DimLine position={[-halfW - 0.3, 0.05, 0]}>{roomDepth}m</DimLine>
      <DimLine position={[-halfW - 0.3, roomHeight / 2, -halfD]}>{roomHeight}m</DimLine>

      {/* Room dimension labels */}
      <Label position={[0, roomHeight + 0.3, 0]}>
        Room: {roomWidth} x {roomDepth} x {roomHeight}m
      </Label>

      {/* Mountain wall info */}
      <Label position={[0, roomHeight + 0.3, -halfD]}>
        Mountain wall: {roomWidth}m wide, {layers} layers, {spacing.toFixed(2)}m spacing, {totalDepth.toFixed(2)}m total depth
      </Label>

      {/* Scale bar on floor */}
      <DimLine position={[halfW - 0.5, 0.05, halfD - 0.3]}>1m scale</DimLine>

      {/* Ceiling info */}
      {selections.ceiling === 'flatPanel' && (
        <Label position={[0, roomHeight - 0.1, 0]}>
          Ceiling: 120x120cm panels ({Math.floor(roomWidth / 1.2)} x {Math.floor(roomDepth / 1.2)} grid)
        </Label>
      )}

      {/* Material annotations */}
      <MaterialNote position={[0, roomHeight * 0.6, -halfD + 0.3]}>
        MDF or plywood, 12-18mm, painted
      </MaterialNote>
      <MaterialNote position={[0, roomHeight * 0.8, -halfD + totalDepth + 0.3]}>
        RGB LED strip, diffusion channel
      </MaterialNote>
      <MaterialNote position={[-halfW + 0.5, roomHeight * 0.5, 0]}>
        Side wall: matte black fabric or paint
      </MaterialNote>
      <MaterialNote position={[halfW - 0.5, roomHeight * 0.5, 0]}>
        Side wall: matte black fabric or paint
      </MaterialNote>
      <MaterialNote position={[0, 0.15, 0]}>
        Floor: dark wood or composite
      </MaterialNote>
      <MaterialNote position={[0, roomHeight - 0.2, 0]}>
        Ceiling: 120x120cm modular panels
      </MaterialNote>

      {/* Firefly module annotations */}
      {selections.fireflies === 'canopyGrid' && (
        <MaterialNote position={[0, roomHeight - 0.5, 0]}>
          Hanging elements: ramie fiber, paper mulberry — warm micro-LED 2700K, Arduino-controlled
        </MaterialNote>
      )}
      {selections.fireflies === 'theVeil' && (
        <MaterialNote position={[0, roomHeight * 0.5, halfD - 0.3]}>
          Fiber veil wall: ramie fiber with embedded micro-LEDs at 3-5 depth levels
        </MaterialNote>
      )}
    </group>
  )
}
