import { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'
import { useForestFloorTexture, useWoodPathTexture, EXHIBITION_COLORS } from '../useExhibitionTextures.js'

const ROOM = { w: 10, d: 10 }

// PBR forest floor with wooden walkway paths
function ForestFloorTextured() {
  const floorMat = useForestFloorTexture()
  const woodMat = useWoodPathTexture()

  return (
    <group>
      {/* Forest floor ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.d, 64, 64]} />
        <meshStandardMaterial
          {...floorMat}
          roughness={0.92}
          envMapIntensity={0.05}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Wooden walkway paths — two parallel paths */}
      {[-1.5, 1.5].map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.025, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.8, 8, 1, 32]} />
          <meshStandardMaterial
            {...woodMat}
            roughness={0.55}
            envMapIntensity={0.15}
            side={THREE.FrontSide}
          />
        </mesh>
      ))}

      {/* Dim path edge lighting strips */}
      {[-1.5, 1.5].map((x) =>
        [-0.4, 0.4].map((offset) => (
          <mesh
            key={`${x}-${offset}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x + offset, 0.026, 0]}
          >
            <planeGeometry args={[0.03, 8]} />
            <meshStandardMaterial
              color={EXHIBITION_COLORS.pathLightDim}
              emissive={EXHIBITION_COLORS.pathLightDim}
              emissiveIntensity={0.1}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

// Wrapper with suspense fallback to dark matte while textures load
function ForestFloorPBR({ isConstruction }) {
  if (isConstruction) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM.w, ROOM.d]} />
          <meshStandardMaterial color="#444" wireframe />
        </mesh>
        {/* Show walkway positions in wireframe */}
        {[-1.5, 1.5].map((x) => (
          <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, 0]}>
            <planeGeometry args={[0.8, 8]} />
            <meshStandardMaterial color="#665533" wireframe />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <Suspense
      fallback={
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM.w, ROOM.d]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      }
    >
      <ForestFloorTextured />
    </Suspense>
  )
}

function SimpleDarkMatte({ isConstruction }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[ROOM.w, ROOM.d]} />
      <meshStandardMaterial
        color={isConstruction ? '#444' : '#0a0a0a'}
        wireframe={isConstruction}
      />
    </mesh>
  )
}

const FLOOR_COMPONENTS = {
  forestFloorPBR: ForestFloorPBR,
  simpleMatte: SimpleDarkMatte,
}

export default function Floor() {
  const { selections, viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.floor || 'forestFloorPBR'
  const Component = FLOOR_COMPONENTS[variantId] || ForestFloorPBR

  return <Component isConstruction={isConstruction} />
}
