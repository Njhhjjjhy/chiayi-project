import { useRef } from 'react'
import { OrbitControls, Grid } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.jsx'
import Room from './Room'
import MountainWall from './MountainWall'

export default function Scene({ roomWidth = 10, roomDepth = 10, roomHeight = 3.5, showGrid = true, mountainOverrides = {} }) {
  const controlsRef = useRef()
  const { viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'

  const maxOrbitRadius = Math.min(roomWidth, roomDepth) / 2 - 0.5

  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.6, -2]}
        maxDistance={maxOrbitRadius}
        minDistance={0.5}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
        enablePan={true}
        panSpeed={0.5}
        rotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={isConstruction ? 0.8 : 1.0} />
      {!isConstruction && (
        <>
          <pointLight position={[0, roomHeight - 0.5, 0]} intensity={1.5} />
          <pointLight position={[0, 2, -3]} intensity={1.0} />
        </>
      )}

      {/* Grid helper */}
      {(isConstruction || showGrid) && (
        <Grid
          position={[0, 0.001, 0]}
          args={[roomWidth, roomDepth]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#333"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#555"
          fadeDistance={25}
          infiniteGrid={false}
        />
      )}

      {/* Room shell */}
      <Room width={roomWidth} depth={roomDepth} height={roomHeight} />

      {/* Mountain wall */}
      <MountainWall overrides={mountainOverrides} />
    </>
  )
}
