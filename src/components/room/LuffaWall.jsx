import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { toCreasedNormals } from 'three-stdlib'
import {
  ROOM, WALL_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, CABINET_T,
  COLUMN_X, COLUMN_W, COLUMN_D,
  SEATING_ZONES, CEILING_SEATING_FORM_SKIP_RADIUS,
  LOOFAH_WALL_HEIGHT, LOOFAH_WALL_WIDTH, LOOFAH_WALL_Y_BASE,
  LOOFAH_WALL_Z_START, LOOFAH_WALL_Z_END,
  LOOFAH_BACKLIGHT_COLOR, LOOFAH_BACKLIGHT_INTENSITY,
  LOOFAH_FIBRE_EMISSIVE_INTENSITY,
  LOOFAH_BAMBOO_GRID_SPACING, LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_COLOR,
  LOOFAH_CLUSTER_SEED, LOOFAH_CLUSTER_COUNT_CORNER,
  LOOFAH_CORNER_HEIGHT, LOOFAH_CORNER_BASE_SIZE, LOOFAH_CORNER_TOP_SIZE,
  LOOFAH_CORNER_BACKLIGHT_INTENSITY, LOOFAH_CORNER_INTERNAL_LIGHT_RADIUS,
  LOOFAH_SCULPTURE_COUNT, LOOFAH_SCULPTURE_HEIGHT_MIN, LOOFAH_SCULPTURE_HEIGHT_MAX,
  LOOFAH_SCULPTURE_BASE_MIN, LOOFAH_SCULPTURE_BASE_MAX,
  LOOFAH_SCULPTURE_PIECES_MIN, LOOFAH_SCULPTURE_PIECES_MAX,
  LOOFAH_SCULPTURE_MIN_SPACING, LOOFAH_SCULPTURE_GLOW_INTENSITY, LOOFAH_SCULPTURE_GLOW_RADIUS,
  LOOFAH_SIZE_X_RANGE, LOOFAH_SIZE_Y_RANGE, LOOFAH_SIZE_Z_RANGE,
  LOOFAH_NORMAL_SCALE, LOOFAH_COLOR_JITTER_RANGE,
} from '../../geometry/dimensions.js'
import { getLoofahCornerCenter } from '../../geometry/loofahCorners.js'
import { makeRng } from '../../utils/parkMillerRng.js'

// Loofah wall — three visual prototypes mounted flush against
// `front-wall` inside the `forest` zone. Hidden warm backlight does
// all the visible work; loofah pieces are non-emissive per canonical
// doc 3 line 17 ("Light source MUST NEVER be visible to visitor").
//
//   variant1  evenly-distributed dense loofah field on a bamboo grid
//   variant2  irregular dense clusters with bright pockets between them
//   variant3  variant1 wall plus a freestanding sculptural corner
//             column at the corner selected by `?corner=`
//
// Slice 14 changes:
//   - Pieces are rounded boxes (drei-style extruded shape with bevel)
//     with per-piece scale drawn from LOOFAH_SIZE_*_RANGE.
//   - A procedural fibrous noise normal map is bound on every piece so
//     the surface reads as cellular at close range.
//   - Per-piece color jitter (R/G ±5%, B ±3% to keep warm tone).
//   - Sizes and colors are deterministic per piece index via dedicated
//     RNG streams (LOOFAH_CLUSTER_SEED + 10 for size, + 20 for color).

const SURFACE_NUDGE = 0.008
const FRONT_WALL_SURFACE_X = ROOM.W - WALL_T              // 8.71
const WALL_BACKLIGHT_X = FRONT_WALL_SURFACE_X - SURFACE_NUDGE   // 8.702
const WALL_BAMBOO_X = WALL_BACKLIGHT_X - 0.01             // 8.692
// Per-piece centre X is computed as WALL_BAMBOO_X - sx/2 so the back
// face of every piece sits flush with the bamboo plane and the piece
// protrudes toward the viewer by its full depth `sx`.

const LOOFAH_BASE_COLOR_RGB = { r: 0xd8 / 255, g: 0xc8 / 255, b: 0xa0 / 255 }
const LOOFAH_B_JITTER = 0.03

const LOOFAH_MATERIAL = {
  roughness: 0.95,
  metalness: 0,
}

const BAMBOO_MATERIAL = {
  color: LOOFAH_BAMBOO_COLOR,
  emissive: LOOFAH_BAMBOO_COLOR,
  emissiveIntensity: 0.06,
  roughness: 0.85,
  metalness: 0,
}

const BACKLIGHT_MATERIAL = {
  color: LOOFAH_BACKLIGHT_COLOR,
  emissive: LOOFAH_BACKLIGHT_COLOR,
  emissiveIntensity: LOOFAH_BACKLIGHT_INTENSITY,
  roughness: 1.0,
  metalness: 0,
}

const CORNER_BACKLIGHT_MATERIAL = {
  color: LOOFAH_BACKLIGHT_COLOR,
  emissive: LOOFAH_BACKLIGHT_COLOR,
  emissiveIntensity: LOOFAH_CORNER_BACKLIGHT_INTENSITY,
  roughness: 1.0,
  metalness: 0,
}

// --- Shared rounded-box geometry (unit cube, centred on origin) ---
// Replicates drei's RoundedBoxGeometry build pattern so we get one
// allocation reused via per-mesh scale across every loofah piece.
const ROUNDED_EPS = 0.00001
function createRoundedShape(width, height, radius0) {
  const shape = new THREE.Shape()
  const radius = radius0 - ROUNDED_EPS
  shape.absarc(ROUNDED_EPS, ROUNDED_EPS, ROUNDED_EPS, -Math.PI / 2, -Math.PI, true)
  shape.absarc(ROUNDED_EPS, height - radius * 2, ROUNDED_EPS, Math.PI, Math.PI / 2, true)
  shape.absarc(width - radius * 2, height - radius * 2, ROUNDED_EPS, Math.PI / 2, 0, true)
  shape.absarc(width - radius * 2, ROUNDED_EPS, ROUNDED_EPS, 0, -Math.PI / 2, true)
  return shape
}
function makeRoundedBoxGeometry(radius = 0.15, smoothness = 4, bevelSegments = 4) {
  const shape = createRoundedShape(1, 1, radius)
  const params = {
    depth: 1 - radius * 2,
    bevelEnabled: true,
    bevelSegments: bevelSegments * 2,
    steps: 1,
    bevelSize: radius - ROUNDED_EPS,
    bevelThickness: radius,
    curveSegments: smoothness,
  }
  const geo = new THREE.ExtrudeGeometry(shape, params)
  geo.center()
  toCreasedNormals(geo, 0.4)
  return geo
}

// --- Procedural fibrous-loofah normal map ---
// 512×512 multi-octave value-noise heightfield, gradient → normal. Noise
// is compressed vertically so the derived ridges run roughly along Y,
// matching the cellular-fibre direction of cut loofah pieces.
function makeLoofahNormalMap() {
  const size = 512
  const baseSize = 64
  const rng = makeRng(LOOFAH_CLUSTER_SEED + 30)
  const base = new Float32Array(baseSize * baseSize)
  for (let i = 0; i < base.length; i++) base[i] = rng()

  function sampleBase(x, y) {
    const ix = ((x % baseSize) + baseSize) % baseSize | 0
    const iy = ((y % baseSize) + baseSize) % baseSize | 0
    return base[iy * baseSize + ix]
  }
  function smoothNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y)
    const fx = x - ix, fy = y - iy
    const sx = fx * fx * (3 - 2 * fx)
    const sy = fy * fy * (3 - 2 * fy)
    const a = sampleBase(ix, iy)
    const b = sampleBase(ix + 1, iy)
    const c = sampleBase(ix, iy + 1)
    const d = sampleBase(ix + 1, iy + 1)
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
  }
  // yScale < 1 compresses noise vertically so each ridge is longer
  // along Y than across — fibres run vertically.
  function heightAt(u, v) {
    const yScale = 0.3
    let h = 0, amp = 1, freq = 12, total = 0
    for (let o = 0; o < 4; o++) {
      h += smoothNoise(u * freq, v * freq * yScale) * amp
      total += amp
      amp *= 0.5
      freq *= 2
    }
    return h / total
  }

  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] = heightAt(x / size, y / size)
    }
  }

  const data = new Uint8Array(size * size * 4)
  const strength = 4.0
  for (let y = 0; y < size; y++) {
    const yU = (y + 1) % size
    const yD = (y - 1 + size) % size
    for (let x = 0; x < size; x++) {
      const xR = (x + 1) % size
      const xL = (x - 1 + size) % size
      const hL = height[y * size + xL]
      const hR = height[y * size + xR]
      const hD = height[yD * size + x]
      const hU = height[yU * size + x]
      const dx = (hR - hL) * 0.5
      const dy = (hU - hD) * 0.5
      let nx = -dx * strength
      let ny = -dy * strength
      let nz = 1
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
      nx /= len; ny /= len; nz /= len
      const i = (y * size + x) * 4
      data[i]     = Math.round((nx * 0.5 + 0.5) * 255)
      data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255)
      data[i + 2] = Math.round((nz * 0.5 + 0.5) * 255)
      data[i + 3] = 255
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = true
  tex.needsUpdate = true
  return tex
}

// --- Per-piece variation samplers (deterministic via stream offset) ---
function sampleSize(rng) {
  return {
    sx: LOOFAH_SIZE_X_RANGE[0] + rng() * (LOOFAH_SIZE_X_RANGE[1] - LOOFAH_SIZE_X_RANGE[0]),
    sy: LOOFAH_SIZE_Y_RANGE[0] + rng() * (LOOFAH_SIZE_Y_RANGE[1] - LOOFAH_SIZE_Y_RANGE[0]),
    sz: LOOFAH_SIZE_Z_RANGE[0] + rng() * (LOOFAH_SIZE_Z_RANGE[1] - LOOFAH_SIZE_Z_RANGE[0]),
  }
}
function sampleColor(rng) {
  const r = LOOFAH_BASE_COLOR_RGB.r * (1 + (rng() - 0.5) * 2 * LOOFAH_COLOR_JITTER_RANGE)
  const g = LOOFAH_BASE_COLOR_RGB.g * (1 + (rng() - 0.5) * 2 * LOOFAH_COLOR_JITTER_RANGE)
  const b = LOOFAH_BASE_COLOR_RGB.b * (1 + (rng() - 0.5) * 2 * LOOFAH_B_JITTER)
  return new THREE.Color(r, g, b)
}

// --- Backlight plane behind the wall variants ---
function BacklightPlane() {
  const yCenter = LOOFAH_WALL_Y_BASE + LOOFAH_WALL_HEIGHT / 2
  const zCenter = (LOOFAH_WALL_Z_START + LOOFAH_WALL_Z_END) / 2
  return (
    <mesh
      position={[WALL_BACKLIGHT_X, yCenter, zCenter]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <planeGeometry args={[LOOFAH_WALL_WIDTH, LOOFAH_WALL_HEIGHT]} />
      <meshStandardMaterial {...BACKLIGHT_MATERIAL} />
    </mesh>
  )
}

// --- Bamboo armature grid for the wall variants ---
function BambooWallGrid() {
  const yStart = LOOFAH_WALL_Y_BASE
  const yEnd = LOOFAH_WALL_Y_BASE + LOOFAH_WALL_HEIGHT
  const yCenter = (yStart + yEnd) / 2
  const zStart = LOOFAH_WALL_Z_START
  const zEnd = LOOFAH_WALL_Z_END
  const zCenter = (zStart + zEnd) / 2

  const verticalCount = Math.floor((zEnd - zStart) / LOOFAH_BAMBOO_GRID_SPACING) + 1
  const vStep = (zEnd - zStart) / (verticalCount - 1)
  const horizontalCount = Math.floor((yEnd - yStart) / LOOFAH_BAMBOO_GRID_SPACING) + 1
  const hStep = (yEnd - yStart) / (horizontalCount - 1)

  return (
    <group>
      {Array.from({ length: verticalCount }).map((_, i) => (
        <mesh key={`v${i}`} position={[WALL_BAMBOO_X, yCenter, zStart + i * vStep]}>
          <cylinderGeometry
            args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, LOOFAH_WALL_HEIGHT, 8]}
          />
          <meshStandardMaterial {...BAMBOO_MATERIAL} />
        </mesh>
      ))}
      {Array.from({ length: horizontalCount }).map((_, i) => (
        <mesh
          key={`h${i}`}
          position={[WALL_BAMBOO_X, yStart + i * hStep, zCenter]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, LOOFAH_WALL_WIDTH, 8]}
          />
          <meshStandardMaterial {...BAMBOO_MATERIAL} />
        </mesh>
      ))}
    </group>
  )
}

// --- Loofah field generation ---
// Variant 1: evenly-spaced grid of pieces with small position jitter.
function generateDenseField() {
  const posRng = makeRng(LOOFAH_CLUSTER_SEED + 1)
  const sizeRng = makeRng(LOOFAH_CLUSTER_SEED + 10)
  const colorRng = makeRng(LOOFAH_CLUSTER_SEED + 20)
  const pieces = []
  const spacing = 0.25
  const yCount = Math.max(1, Math.floor(LOOFAH_WALL_HEIGHT / spacing))
  const zCount = Math.max(1, Math.floor(LOOFAH_WALL_WIDTH / spacing))
  const yStep = LOOFAH_WALL_HEIGHT / yCount
  const zStep = LOOFAH_WALL_WIDTH / zCount
  for (let i = 0; i < yCount; i++) {
    for (let j = 0; j < zCount; j++) {
      const y = LOOFAH_WALL_Y_BASE + (i + 0.5) * yStep + (posRng() - 0.5) * 0.06
      const z = LOOFAH_WALL_Z_START + (j + 0.5) * zStep + (posRng() - 0.5) * 0.06
      const rotY = posRng() * Math.PI * 2
      const rotZ = (posRng() - 0.5) * 0.3
      const { sx, sy, sz } = sampleSize(sizeRng)
      const color = sampleColor(colorRng)
      const x = WALL_BAMBOO_X - sx / 2
      pieces.push({ x, y, z, sx, sy, sz, rotY, rotZ, color })
    }
  }
  return pieces
}

// --- Freestanding sculpture placement (variant 2) ---
function inSculptureExclusion(x, z) {
  if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && z >= 0 && z <= CABINET_T) return true
  if (x >= ENTRY_GAP_WIDTH && x <= ENTRY_GAP_WIDTH + CABINET_T && z >= 0 && z <= PATHWAY_PARTITION_Z) return true
  if (x >= COLUMN_X - COLUMN_W / 2 && x <= COLUMN_X + COLUMN_W / 2 && z >= 0 && z <= COLUMN_D) return true
  for (const zone of SEATING_ZONES) {
    const dx = x - zone.x, dz = z - zone.z
    if (dx * dx + dz * dz < CEILING_SEATING_FORM_SKIP_RADIUS * CEILING_SEATING_FORM_SKIP_RADIUS) return true
  }
  return false
}

function generateSculpturePlacements() {
  const rng = makeRng(LOOFAH_CLUSTER_SEED + 50)
  const forestXMin = ENTRY_GAP_WIDTH + CABINET_T + 0.5
  const forestXMax = ROOM.W - WALL_T - 0.5
  const forestZMin = CABINET_T + 0.5
  const forestZMax = PATHWAY_PARTITION_Z - CABINET_T - 0.5
  const sculptures = []
  let attempts = 0
  while (sculptures.length < LOOFAH_SCULPTURE_COUNT && attempts < 400) {
    attempts++
    const x = forestXMin + rng() * (forestXMax - forestXMin)
    const z = forestZMin + rng() * (forestZMax - forestZMin)
    if (inSculptureExclusion(x, z)) continue
    let tooClose = false
    for (const s of sculptures) {
      const dx = s.x - x, dz = s.z - z
      if (dx * dx + dz * dz < LOOFAH_SCULPTURE_MIN_SPACING * LOOFAH_SCULPTURE_MIN_SPACING) {
        tooClose = true; break
      }
    }
    if (tooClose) continue
    const height = LOOFAH_SCULPTURE_HEIGHT_MIN + rng() * (LOOFAH_SCULPTURE_HEIGHT_MAX - LOOFAH_SCULPTURE_HEIGHT_MIN)
    const baseSize = LOOFAH_SCULPTURE_BASE_MIN + rng() * (LOOFAH_SCULPTURE_BASE_MAX - LOOFAH_SCULPTURE_BASE_MIN)
    const pieceCount = LOOFAH_SCULPTURE_PIECES_MIN +
      Math.floor(rng() * (LOOFAH_SCULPTURE_PIECES_MAX - LOOFAH_SCULPTURE_PIECES_MIN + 1))
    const rotY = rng() * Math.PI * 2
    sculptures.push({ x, z, height, baseSize, pieceCount, rotY })
  }
  return sculptures
}

function generateSculpturePieces(sculpture) {
  const posRng = makeRng(LOOFAH_CLUSTER_SEED + Math.round(sculpture.x * 100))
  const sizeRng = makeRng(LOOFAH_CLUSTER_SEED + Math.round(sculpture.z * 100) + 10)
  const colorRng = makeRng(LOOFAH_CLUSTER_SEED + Math.round(sculpture.x * 100) + 20)
  const pieces = []
  const halfBase = sculpture.baseSize / 2
  const topSize = sculpture.baseSize * 0.6
  const halfTop = topSize / 2
  for (let i = 0; i < sculpture.pieceCount; i++) {
    const t = (i + 0.5) / sculpture.pieceCount
    const y = t * sculpture.height + (posRng() - 0.5) * 0.1
    const sizeHere = halfBase * (1 - t) + halfTop * t
    const ringRadius = Math.max(0.06, sizeHere + (posRng() - 0.5) * 0.03)
    const angle = posRng() * Math.PI * 2
    const dist = ringRadius + (posRng() - 0.5) * 0.02
    const lx = Math.cos(angle) * dist
    const lz = Math.sin(angle) * dist
    const { sx, sy, sz } = sampleSize(sizeRng)
    const color = sampleColor(colorRng)
    pieces.push({
      x: lx, y, z: lz,
      sx: sx * 0.8, sy: sy * 0.8, sz: sz * 0.8,
      rotY: angle + Math.PI / 2,
      rotZ: (posRng() - 0.5) * 0.3,
      color,
    })
  }
  return pieces
}

function SculptureCage({ height, baseSize }) {
  const halfBase = baseSize / 2
  const topSize = baseSize * 0.6
  const halfTop = topSize / 2
  const verticals = [
    { xb: +halfBase, zb: +halfBase, xt: +halfTop, zt: +halfTop },
    { xb: +halfBase, zb: -halfBase, xt: +halfTop, zt: -halfTop },
    { xb: -halfBase, zb: +halfBase, xt: -halfTop, zt: +halfTop },
    { xb: -halfBase, zb: -halfBase, xt: -halfTop, zt: -halfTop },
  ]
  const ringCount = Math.max(2, Math.round(height / 0.6))
  return (
    <group>
      {verticals.map((v, i) => {
        const dx = v.xt - v.xb, dz = v.zt - v.zb, dy = height
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
        return (
          <mesh
            key={i}
            position={[(v.xb + v.xt) / 2, height / 2, (v.zb + v.zt) / 2]}
            rotation={[Math.atan2(dz, dy), 0, Math.atan2(-dx, dy)]}
          >
            <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, length, 6]} />
            <meshStandardMaterial {...BAMBOO_MATERIAL} />
          </mesh>
        )
      })}
      {Array.from({ length: ringCount }).map((_, i) => {
        const t = (i + 1) / (ringCount + 1)
        const y = t * height
        const size = halfBase * (1 - t) + halfTop * t
        const sideLen = size * 2
        return (
          <group key={`r${i}`} position={[0, y, 0]}>
            <mesh position={[0, 0, +size]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 6]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
            <mesh position={[0, 0, -size]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 6]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
            <mesh position={[+size, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 6]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
            <mesh position={[-size, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 6]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Sculpture({ sculpture, boxGeo, normalMap, normalScale }) {
  const pieces = useMemo(() => generateSculpturePieces(sculpture), [sculpture])
  return (
    <group position={[sculpture.x, 0, sculpture.z]} rotation={[0, sculpture.rotY, 0]}>
      <mesh position={[0, sculpture.height / 2, 0]}>
        <cylinderGeometry args={[LOOFAH_SCULPTURE_GLOW_RADIUS, LOOFAH_SCULPTURE_GLOW_RADIUS, sculpture.height, 8]} />
        <meshStandardMaterial
          color={LOOFAH_BACKLIGHT_COLOR}
          emissive={LOOFAH_BACKLIGHT_COLOR}
          emissiveIntensity={LOOFAH_SCULPTURE_GLOW_INTENSITY}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <SculptureCage height={sculpture.height} baseSize={sculpture.baseSize} />
      {pieces.map((piece, i) => (
        <LoofahPiece
          key={i}
          piece={piece}
          geometry={boxGeo}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      ))}
    </group>
  )
}

function LoofahSculptures({ boxGeo, normalMap, normalScale }) {
  const sculptures = useMemo(() => generateSculpturePlacements(), [])
  return (
    <group>
      {sculptures.map((s, i) => (
        <Sculpture
          key={i}
          sculpture={s}
          boxGeo={boxGeo}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      ))}
    </group>
  )
}

function LoofahPiece({ piece, geometry, normalMap, normalScale }) {
  return (
    <mesh
      geometry={geometry}
      position={[piece.x, piece.y, piece.z]}
      rotation={[0, piece.rotY, piece.rotZ]}
      scale={[piece.sx, piece.sy, piece.sz]}
    >
      <meshStandardMaterial
        {...LOOFAH_MATERIAL}
        color={piece.color}
        normalMap={normalMap}
        normalScale={normalScale}
        emissiveIntensity={LOOFAH_FIBRE_EMISSIVE_INTENSITY}
      />
    </mesh>
  )
}

function WallElement({ variant, boxGeo, normalMap, normalScale }) {
  const pieces = useMemo(() => {
    if (variant === 'variant2') return generateClusterField()
    return generateDenseField()
  }, [variant])

  return (
    <group>
      <BacklightPlane />
      <BambooWallGrid />
      {pieces.map((piece, i) => (
        <LoofahPiece
          key={i}
          piece={piece}
          geometry={boxGeo}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      ))}
    </group>
  )
}

// --- Corner column (variant 3) ---
// Vertical sculptural mass at one of the four forest corners. Bamboo
// cage of 4 tilted vertical sticks (tapering base 0.4 → top 0.25) with
// 4 horizontal bracer rings. Internal emissive cylinder sits inside
// the cage; loofah cluster rings stack along the Y axis with
// Park-Miller jitter to make the cross-section irregular ("grown",
// not "placed").

function CornerInternalLight() {
  return (
    <mesh position={[0, LOOFAH_CORNER_HEIGHT / 2, 0]}>
      <cylinderGeometry
        args={[
          LOOFAH_CORNER_INTERNAL_LIGHT_RADIUS,
          LOOFAH_CORNER_INTERNAL_LIGHT_RADIUS,
          LOOFAH_CORNER_HEIGHT,
          12,
        ]}
      />
      <meshStandardMaterial {...CORNER_BACKLIGHT_MATERIAL} />
    </mesh>
  )
}

function CornerBambooCage() {
  const halfBase = LOOFAH_CORNER_BASE_SIZE / 2
  const halfTop = LOOFAH_CORNER_TOP_SIZE / 2

  const verticals = [
    { xb: +halfBase, zb: +halfBase, xt: +halfTop, zt: +halfTop },
    { xb: +halfBase, zb: -halfBase, xt: +halfTop, zt: -halfTop },
    { xb: -halfBase, zb: +halfBase, xt: -halfTop, zt: +halfTop },
    { xb: -halfBase, zb: -halfBase, xt: -halfTop, zt: -halfTop },
  ]

  const ringHeights = [0.3, 1.1, 2.0, 3.0]

  return (
    <group>
      {verticals.map((v, i) => {
        const dx = v.xt - v.xb
        const dz = v.zt - v.zb
        const dy = LOOFAH_CORNER_HEIGHT
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const tiltZ = Math.atan2(-dx, dy)
        const tiltX = Math.atan2(dz, dy)
        const midX = (v.xb + v.xt) / 2
        const midZ = (v.zb + v.zt) / 2
        return (
          <mesh
            key={`cv${i}`}
            position={[midX, LOOFAH_CORNER_HEIGHT / 2, midZ]}
            rotation={[tiltX, 0, tiltZ]}
          >
            <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, length, 8]} />
            <meshStandardMaterial {...BAMBOO_MATERIAL} />
          </mesh>
        )
      })}
      {ringHeights.map((y, i) => {
        const t = y / LOOFAH_CORNER_HEIGHT
        const size = halfBase * (1 - t) + halfTop * t
        const sideLen = size * 2
        return (
          <group key={`cr${i}`} position={[0, y, 0]}>
            <mesh position={[0, 0, +size]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 8]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
            <mesh position={[0, 0, -size]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 8]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
            <mesh position={[+size, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 8]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
            <mesh position={[-size, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[LOOFAH_BAMBOO_RADIUS, LOOFAH_BAMBOO_RADIUS, sideLen, 8]} />
              <meshStandardMaterial {...BAMBOO_MATERIAL} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function generateCornerPieces() {
  const posRng = makeRng(LOOFAH_CLUSTER_SEED)
  const sizeRng = makeRng(LOOFAH_CLUSTER_SEED + 10)
  const colorRng = makeRng(LOOFAH_CLUSTER_SEED + 20)
  const pieces = []
  const halfBase = LOOFAH_CORNER_BASE_SIZE / 2
  const halfTop = LOOFAH_CORNER_TOP_SIZE / 2
  for (let i = 0; i < LOOFAH_CLUSTER_COUNT_CORNER; i++) {
    const t = (i + 0.5) / LOOFAH_CLUSTER_COUNT_CORNER
    const yJitter = (posRng() - 0.5) * 0.15
    const cy = t * LOOFAH_CORNER_HEIGHT + yJitter
    const sizeHere = halfBase * (1 - t) + halfTop * t
    const ringRadius = Math.max(0.1, sizeHere + (posRng() - 0.5) * 0.05)
    const pieceCount = 3 + Math.floor(posRng() * 3)
    const angleStart = posRng() * Math.PI * 2
    for (let j = 0; j < pieceCount; j++) {
      const angle = angleStart + (j / pieceCount) * Math.PI * 2 + (posRng() - 0.5) * 0.3
      const dist = ringRadius + (posRng() - 0.5) * 0.04
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist
      const y = cy + (posRng() - 0.5) * 0.05
      const { sx, sy, sz } = sampleSize(sizeRng)
      const color = sampleColor(colorRng)
      pieces.push({
        x, y, z, sx, sy, sz,
        rotY: angle + Math.PI / 2,
        rotZ: (posRng() - 0.5) * 0.3,
        color,
      })
    }
  }
  return pieces
}

function CornerColumn({ corner, boxGeo, normalMap, normalScale }) {
  const [cx, cz] = getLoofahCornerCenter(corner)
  const pieces = useMemo(() => generateCornerPieces(), [])

  return (
    <group position={[cx, 0, cz]}>
      <CornerInternalLight />
      <CornerBambooCage />
      {pieces.map((piece, i) => (
        <LoofahPiece
          key={i}
          piece={piece}
          geometry={boxGeo}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      ))}
    </group>
  )
}

// --- Main component ---
export default function LuffaWall({ variant = 'variant1', corner = 'back-left' }) {
  const boxGeo = useMemo(() => makeRoundedBoxGeometry(0.15, 4, 4), [])
  const normalMap = useMemo(() => makeLoofahNormalMap(), [])
  const normalScale = useMemo(
    () => new THREE.Vector2(LOOFAH_NORMAL_SCALE, LOOFAH_NORMAL_SCALE),
    [],
  )

  useEffect(() => () => {
    boxGeo.dispose()
    normalMap.dispose()
  }, [boxGeo, normalMap])

  return (
    <group>
      {variant === 'variant1' && (
        <WallElement
          variant={variant}
          boxGeo={boxGeo}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      )}
      {variant === 'variant2' && (
        <LoofahSculptures
          boxGeo={boxGeo}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      )}
      {variant === 'variant3' && (
        <>
          {['back-left', 'back-right'].map((c) => (
            <CornerColumn
              key={c}
              corner={c}
              boxGeo={boxGeo}
              normalMap={normalMap}
              normalScale={normalScale}
            />
          ))}
        </>
      )}
    </group>
  )
}
