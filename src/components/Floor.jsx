import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.js'
import { DEFAULT_VARIANTS } from '../variants/defaults.js'
import { ROOM } from '../geometry/dimensions.js'

const MARBLE_TILE = 0.80     // approx tile size observed in cam 1/2/3 frames

// Procedurally draw a grey-marble tile texture into a canvas, including wavy
// white veining + dark tile grout lines. One canvas covers a TILE_REPEAT×TILE_REPEAT
// block of tiles; Three.js then repeat-wraps it across the room floor.
const TILES_PER_CANVAS = 4   // 4x4 = 16 tiles per canvas before it repeats
function buildMarbleTexture() {
  const canvas = document.createElement('canvas')
  const size = 1024
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const tilePx = size / TILES_PER_CANVAS

  // Base — light-mid grey (matches photographed porcelain tile)
  ctx.fillStyle = '#a8acb0'
  ctx.fillRect(0, 0, size, size)

  // Broad white wavy veins (a handful of long curves)
  for (let i = 0; i < 18; i++) {
    ctx.strokeStyle = `rgba(245, 247, 250, ${0.55 + Math.random() * 0.40})`
    ctx.lineWidth = 2 + Math.random() * 4
    ctx.beginPath()
    const startY = Math.random() * size
    const freq = 0.006 + Math.random() * 0.008
    const amp = 40 + Math.random() * 80
    const phase = Math.random() * Math.PI * 2
    ctx.moveTo(0, startY)
    for (let x = 0; x <= size; x += 10) {
      const y = startY + Math.sin(x * freq + phase) * amp + (Math.random() - 0.5) * 8
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Shorter wispy highlights (denser, higher frequency)
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(210, 214, 220, ${0.18 + Math.random() * 0.22})`
    ctx.lineWidth = 1 + Math.random() * 1.5
    ctx.beginPath()
    const startX = Math.random() * size
    const startY = Math.random() * size
    const len = 60 + Math.random() * 180
    const angle = Math.random() * Math.PI * 2
    const endX = startX + Math.cos(angle) * len
    const endY = startY + Math.sin(angle) * len
    ctx.moveTo(startX, startY)
    ctx.quadraticCurveTo(
      (startX + endX) / 2 + (Math.random() - 0.5) * 40,
      (startY + endY) / 2 + (Math.random() - 0.5) * 40,
      endX,
      endY
    )
    ctx.stroke()
  }

  // Micro-noise grain
  const img = ctx.getImageData(0, 0, size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n))
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n))
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n))
  }
  ctx.putImageData(img, 0, 0)

  // Tile grout lines — darker narrow grid
  ctx.strokeStyle = '#4a4e54'
  ctx.lineWidth = 3
  for (let i = 0; i <= TILES_PER_CANVAS; i++) {
    ctx.beginPath()
    ctx.moveTo(i * tilePx, 0)
    ctx.lineTo(i * tilePx, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * tilePx)
    ctx.lineTo(size, i * tilePx)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

// Grey-marble porcelain tile (existing venue floor). Large ~80 cm tiles with
// heavy wavy white veining, subtle gloss. Matches cam 1/2/3 frame references
// and research-trip-20260418-1.webp.
function GreyMarbleFloor({ isConstruction }) {
  const marbleTex = useMemo(() => {
    const tex = buildMarbleTexture()
    const tileCoverage = MARBLE_TILE * TILES_PER_CANVAS   // 3.2 m per canvas repeat
    tex.repeat.set(ROOM.W / tileCoverage, ROOM.D / tileCoverage)
    return tex
  }, [])

  if (isConstruction) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.W, ROOM.D]} />
        <meshStandardMaterial wireframe color="#888" />
      </mesh>
    )
  }

  // Porcelain is non-metal — metalness > 0 with no environment map renders
  // very dark in low light. Pure matte (metalness=0, high roughness) keeps
  // the tile visible regardless of view mode.
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM.W, ROOM.D]} />
      <meshStandardMaterial
        map={marbleTex}
        color="#ffffff"
        roughness={0.75}
        metalness={0}
      />
    </mesh>
  )
}

const FLOOR_COMPONENTS = {
  greyMarble: GreyMarbleFloor,
}

export default function Floor() {
  const { selections, viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.floor || DEFAULT_VARIANTS.floor
  const Component = FLOOR_COMPONENTS[variantId] || FLOOR_COMPONENTS[DEFAULT_VARIANTS.floor]

  return <Component isConstruction={isConstruction} />
}
