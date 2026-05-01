// Material specs for Room sub-components. One source of truth so the
// look stays consistent across Walls, Doors, Windows, HVAC, Wainscot.

// Existing concrete walls, painted matte black. Very rough, dead-flat
// finish — paint settles into the rough concrete substrate so the
// surface barely picks up reflections.
export function wallMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#666' }
    : { color: '#0f0f0f', roughness: 0.95, metalness: 0 }
}

export function blackoutMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#222' }
    : { color: '#1a1a1a', roughness: 0.4, metalness: 0.1 }
}

export function curtainMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#600' }
    : { color: '#2a1520', roughness: 0.95, metalness: 0 }
}

export function wainscotMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#5d4037' }
    : { color: '#241509', roughness: 0.85, metalness: 0.04 }
}

export function plankFaceMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#7a5a40' }
    : { color: '#4a3220', roughness: 0.7, metalness: 0.04 }
}

export function steelDoorMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#aaa' }
    : { color: '#c8c8c8', roughness: 0.4, metalness: 0.7 }
}

export function ductMetalMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#444' }
    : { color: '#2a2a2a', roughness: 0.5, metalness: 0.6 }
}

export function acUnitMaterial(isConstruction) {
  return isConstruction
    ? { wireframe: true, color: '#ddd' }
    : { color: '#f0f0f0', roughness: 0.7, metalness: 0.05 }
}

export const SPRINKLER_RED = { color: '#c1272d', roughness: 0.6, metalness: 0.1 }
