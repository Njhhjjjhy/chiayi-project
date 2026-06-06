import * as THREE from 'three'
import {
  SEATING_FRAME_SIZE, SEATING_FRAME_H, SEATING_FRAME_LEG_T,
  SEATING_FRAME_SLAT_COUNT, SEATING_FRAME_SLAT_T, SEATING_FRAME_RAIL_Y,
  SEATING_FRAME_COLOR, SEATING_FRAME_ROUGHNESS,
} from '../../geometry/dimensions.js'
import { buildSeating } from '../../geometry/seatingPlacement.js'

// Seating variant 'frame-stools' (concept image 12) — open-frame light
// timber stools: four corner legs, low side rails, slatted top. The
// open sides read lighter than the solid cubes.
//
// Each stool is 11 boxes; 30 stools would be 330 separate meshes as
// plain JSX. Instead every part type renders as one InstancedMesh —
// legs (120), rails (120), slats (90) — three draw calls total.

const FRAME_MAT = new THREE.MeshStandardMaterial({
  color: SEATING_FRAME_COLOR,
  roughness: SEATING_FRAME_ROUGHNESS,
  metalness: 0,
})

const S = SEATING_FRAME_SIZE
const H = SEATING_FRAME_H
const LEG = SEATING_FRAME_LEG_T
const SLAT = SEATING_FRAME_SLAT_T

const LEG_H = H - SLAT
const LEG_OFF = S / 2 - LEG / 2
const RAIL_LEN = S - LEG * 2
const RAIL_T = LEG * 0.7
const SLAT_W = (S / SEATING_FRAME_SLAT_COUNT) * 0.72
const SLAT_STRIDE = S / SEATING_FRAME_SLAT_COUNT

const LEG_GEO = new THREE.BoxGeometry(LEG, LEG_H, LEG)
const RAIL_GEO = new THREE.BoxGeometry(RAIL_LEN, RAIL_T, RAIL_T)
const SLAT_GEO = new THREE.BoxGeometry(S, SLAT, SLAT_W)

// Per-stool local placements: [xOff, y, zOff, extraRotY]
const LEG_PARTS = [
  [-LEG_OFF, LEG_H / 2, -LEG_OFF, 0],
  [LEG_OFF, LEG_H / 2, -LEG_OFF, 0],
  [-LEG_OFF, LEG_H / 2, LEG_OFF, 0],
  [LEG_OFF, LEG_H / 2, LEG_OFF, 0],
]
// Rails along X on the two Z sides, then the same geometry turned 90°
// for the two X sides.
const RAIL_PARTS = [
  [0, SEATING_FRAME_RAIL_Y, -LEG_OFF, 0],
  [0, SEATING_FRAME_RAIL_Y, LEG_OFF, 0],
  [-LEG_OFF, SEATING_FRAME_RAIL_Y, 0, Math.PI / 2],
  [LEG_OFF, SEATING_FRAME_RAIL_Y, 0, Math.PI / 2],
]
const SLAT_PARTS = []
for (let i = 0; i < SEATING_FRAME_SLAT_COUNT; i++) {
  SLAT_PARTS.push([0, H - SLAT / 2, -S / 2 + SLAT_STRIDE * (i + 0.5), 0])
}

function buildPartMesh(geo, parts, seats) {
  const mesh = new THREE.InstancedMesh(geo, FRAME_MAT, parts.length * seats.length)
  const dummy = new THREE.Object3D()
  let k = 0
  for (const seat of seats) {
    const cosA = Math.cos(seat.rotY)
    const sinA = Math.sin(seat.rotY)
    for (const [ox, y, oz, extraRot] of parts) {
      // rotate the local offset by the stool's rotY, then translate
      dummy.position.set(
        seat.x + ox * cosA + oz * sinA,
        y,
        seat.z - ox * sinA + oz * cosA,
      )
      dummy.rotation.set(0, seat.rotY + extraRot, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(k++, dummy.matrix)
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

function buildAll() {
  const { seats } = buildSeating('frame-stools')
  return {
    legs: buildPartMesh(LEG_GEO, LEG_PARTS, seats),
    rails: buildPartMesh(RAIL_GEO, RAIL_PARTS, seats),
    slats: buildPartMesh(SLAT_GEO, SLAT_PARTS, seats),
  }
}

const MESHES = buildAll()

export default function SeatingFrameStools() {
  return (
    <group>
      <primitive object={MESHES.legs} />
      <primitive object={MESHES.rails} />
      <primitive object={MESHES.slats} />
    </group>
  )
}
