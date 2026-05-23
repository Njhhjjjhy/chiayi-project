import * as THREE from 'three'
import {
  ROOM, WALL_T,
  WW_DOOR1_X, WW_DOOR1_W, WW_DOOR1_H,
  WW_DOOR2_X, WW_DOOR2_W, WW_DOOR2_H,
  WW_WIN1_X, WW_WIN1_W, WW_WIN1_H, WW_WIN1_SILL,
  WW_WIN2_X, WW_WIN2_W, WW_WIN2_H, WW_WIN2_SILL,
} from '../../geometry/dimensions.js'

// Two doors and two windows on the window-wall (Z = ROOM.D face).
// All four are rendered as flat fill planes slightly lighter than the
// surrounding wall — placeholders for the real fixtures until building-
// visit measurements land.
//
// In operation these are covered by the theatrical curtain, but we
// render them anyway so they exist as underlying geometry; if the
// curtain is removed for any view, the openings still read.
//
// Each plane sits 1 cm in front of the window-wall's room-facing
// surface (room-facing surface at Z = ROOM.D - WALL_T = 8.66; fixtures
// at Z = 8.65, just behind the curtain at Z = 8.62).
//
// ESTIMATE — confirm all X positions, widths, heights, and sills from
// building visit.

const WW_OFFSET = 0.01 // metres in front of window-wall surface
const WW_Z = ROOM.D - WALL_T - WW_OFFSET

const FIXTURE_MATERIAL = {
  color: '#1a2030',
  emissive: '#1a2030',
  emissiveIntensity: 0.05,
  roughness: 0.95,
  metalness: 0,
}

export default function Windows() {
  return (
    <group>
      {/* window-wall door 1 — ESTIMATE — confirm from building visit */}
      <mesh position={[WW_DOOR1_X, WW_DOOR1_H / 2, WW_Z]}>
        <planeGeometry args={[WW_DOOR1_W, WW_DOOR1_H]} />
        <meshStandardMaterial {...FIXTURE_MATERIAL} side={THREE.DoubleSide} />
      </mesh>

      {/* window-wall door 2 — ESTIMATE — confirm from building visit */}
      <mesh position={[WW_DOOR2_X, WW_DOOR2_H / 2, WW_Z]}>
        <planeGeometry args={[WW_DOOR2_W, WW_DOOR2_H]} />
        <meshStandardMaterial {...FIXTURE_MATERIAL} side={THREE.DoubleSide} />
      </mesh>

      {/* window-wall window 1 — ESTIMATE — confirm from building visit */}
      <mesh position={[WW_WIN1_X, WW_WIN1_SILL + WW_WIN1_H / 2, WW_Z]}>
        <planeGeometry args={[WW_WIN1_W, WW_WIN1_H]} />
        <meshStandardMaterial {...FIXTURE_MATERIAL} side={THREE.DoubleSide} />
      </mesh>

      {/* window-wall window 2 — ESTIMATE — confirm from building visit */}
      <mesh position={[WW_WIN2_X, WW_WIN2_SILL + WW_WIN2_H / 2, WW_Z]}>
        <planeGeometry args={[WW_WIN2_W, WW_WIN2_H]} />
        <meshStandardMaterial {...FIXTURE_MATERIAL} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
