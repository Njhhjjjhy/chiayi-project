import BackWallFrame from '../BackWallFrame.jsx'

// Null variant — the calibration anchor. Bare landscape panel grid on
// the back wall, matte off-white face, no further treatment, no
// big-wall fireflies. Ceiling + side-wall fireflies continue to render
// via the existing FireflySystem elsewhere in the scene.

// Matte off-white. Shade is a placeholder; confirm at gate 1.
const NULL_PANEL_COLOR = '#d8d4cc'

export default function Null() {
  return (
    <BackWallFrame
      renderPanel={({ width, height }) => (
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            color={NULL_PANEL_COLOR}
            roughness={0.85}
            metalness={0}
          />
        </mesh>
      )}
    />
  )
}
