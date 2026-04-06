import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Exhibition color palette from the Alishan forest environment
export const EXHIBITION_COLORS = {
  alishanForestNight: new THREE.Color('#0a0f08'),
  nightSkyDeep: new THREE.Color('#0a0a1a'),
  mountainForeground: new THREE.Color('#0d1a0a'),
  mountainMid1: new THREE.Color('#1a2e14'),
  mountainMid2: new THREE.Color('#2d4423'),
  mountainMid3: new THREE.Color('#4a6b3a'),
  mountainDistant: new THREE.Color('#7a9a6a'),
  sunsetGold: new THREE.Color('#f5c842'),
  sunsetOrange: new THREE.Color('#e87d3e'),
  sunsetMagenta: new THREE.Color('#c44b6c'),
  blueHourPurple: new THREE.Color('#5a3b8a'),
  blueHourDeep: new THREE.Color('#1a1a2e'),
  fireflyGlow: new THREE.Color('#e6c84a'),
  fireflyGlowGreen: new THREE.Color('#b8c84a'),
  mossDeep: new THREE.Color('#1a2a12'),
  earthWarm: new THREE.Color('#3a2a1a'),
  barkDark: new THREE.Color('#1a1210'),
  woodPath: new THREE.Color('#2a1f15'),
  pathLightDim: new THREE.Color('#4a3520'),
  moonlightWash: new THREE.Color('#2a2a40'),
}

function configureMaps(maps, repeat) {
  Object.values(maps).forEach((tex) => {
    if (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(repeat[0], repeat[1])
    }
  })
  if (maps.map) maps.map.colorSpace = THREE.SRGBColorSpace
}

// Load PBR texture with all available maps
// hasAO: set false for textures that don't include AmbientOcclusion (e.g. WoodFloor008)
export function usePBRTexture(textureId, { repeat = [1, 1], colorTint = null, displacementScale = 0, hasAO = true } = {}) {
  const basePath = `/textures/${textureId}/${textureId}_2K-JPG`

  const mapPaths = {
    map: `${basePath}_Color.jpg`,
    normalMap: `${basePath}_NormalGL.jpg`,
    roughnessMap: `${basePath}_Roughness.jpg`,
    displacementMap: `${basePath}_Displacement.jpg`,
  }
  if (hasAO) {
    mapPaths.aoMap = `${basePath}_AmbientOcclusion.jpg`
  }

  const maps = useTexture(mapPaths)

  useMemo(() => {
    configureMaps(maps, repeat)
  }, [maps, repeat])

  return {
    map: maps.map,
    normalMap: maps.normalMap,
    roughnessMap: maps.roughnessMap,
    displacementMap: maps.displacementMap,
    displacementScale,
    ...(maps.aoMap ? { aoMap: maps.aoMap } : {}),
    roughness: 1,
    metalness: 0,
    ...(colorTint ? { color: new THREE.Color(colorTint) } : {}),
  }
}

// Surface-specific hooks

export function useForestFloorTexture() {
  return usePBRTexture('Ground052', {
    repeat: [4, 4],
    colorTint: '#404030',
    displacementScale: 0.08,
  })
}

export function useWoodPathTexture() {
  return usePBRTexture('WoodFloor008', {
    repeat: [2, 8],
    displacementScale: 0.01,
    hasAO: false,
  })
}

export function useCeilingPanelTexture() {
  return usePBRTexture('Fabric030', {
    repeat: [10, 10],
    colorTint: '#1a1a1a',
    displacementScale: 0.005,
  })
}

export function useMountainPanelTexture() {
  return usePBRTexture('Plywood001', {
    repeat: [2, 1],
  })
}

export function useSideWallTexture() {
  return usePBRTexture('Concrete015', {
    repeat: [3, 2],
    colorTint: '#0a0a0a',
    displacementScale: 0.01,
    hasAO: false,
  })
}

export function useMossWallTexture() {
  return usePBRTexture('Moss002', {
    repeat: [6, 3],
    colorTint: '#151a12',
    displacementScale: 0.15,
  })
}

export function useEntranceTunnelTexture() {
  return usePBRTexture('Bark007', {
    repeat: [2, 4],
    displacementScale: 0.1,
  })
}

export function useEarthFloorTexture() {
  return usePBRTexture('Ground026', {
    repeat: [3, 3],
    colorTint: '#1a1510',
    displacementScale: 0.03,
  })
}
