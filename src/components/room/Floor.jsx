import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  ROOM,
  FLOOR_TILE_SIZE, FLOOR_COLOR, FLOOR_EMISSIVE_INTENSITY, FLOOR_SEAM_DARKEN,
} from '../../geometry/dimensions.js'

// Foam-mat floor: dark interlocking tiles, matte, textured, no
// reflectivity. The tile pattern is procedural — a small DataTexture
// holds one tile face plus a 1-px dark border. RepeatWrapping at the
// room/tile ratio (~14.7 × 14.6 repeats across 8.83 × 8.78 m) tiles it
// across the floor; the seam between two repeats reads at ~1.5 % of
// tile width (within the 1–2 % spec).
//
// The same texture is bound to both map and emissiveMap so the seam
// darkens consistently in lit verification mode and in emissive-only
// experience mode at ambient 0.01.

const TILE_PX = 128
const SEAM_PX = 2

function parseHex(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function makeTileTexture() {
  const [fr, fg, fb] = parseHex(FLOOR_COLOR)
  const sr = Math.round(fr * FLOOR_SEAM_DARKEN)
  const sg = Math.round(fg * FLOOR_SEAM_DARKEN)
  const sb = Math.round(fb * FLOOR_SEAM_DARKEN)

  const data = new Uint8Array(TILE_PX * TILE_PX * 4)
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const onSeam =
        x < SEAM_PX || x >= TILE_PX - SEAM_PX ||
        y < SEAM_PX || y >= TILE_PX - SEAM_PX
      const i = (y * TILE_PX + x) * 4
      data[i]     = onSeam ? sr : fr
      data[i + 1] = onSeam ? sg : fg
      data[i + 2] = onSeam ? sb : fb
      data[i + 3] = 255
    }
  }

  const tex = new THREE.DataTexture(data, TILE_PX, TILE_PX, THREE.RGBAFormat)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(ROOM.W / FLOOR_TILE_SIZE, ROOM.D / FLOOR_TILE_SIZE)
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = true
  tex.needsUpdate = true
  return tex
}

export default function Floor() {
  const tileTexture = useMemo(() => makeTileTexture(), [])
  useEffect(() => () => tileTexture.dispose(), [tileTexture])

  return (
    <mesh
      position={[ROOM.W / 2, 0, ROOM.D / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[ROOM.W, ROOM.D]} />
      <meshStandardMaterial
        color="#ffffff"
        map={tileTexture}
        emissive="#ffffff"
        emissiveMap={tileTexture}
        emissiveIntensity={FLOOR_EMISSIVE_INTENSITY}
        roughness={1.0}
        metalness={0}
      />
    </mesh>
  )
}
