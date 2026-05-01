// Material specs for Room sub-components. One source of truth so the
// look stays consistent across Walls, Doors, Windows, HVAC, Wainscot.
//
// In construction mode, every material is rendered as a light grey
// matte fill. Each mesh that uses these materials should also drop in
// an <ArchEdges /> child so the actual box/plane edges read clearly
// (no triangulation diagonals from wireframe).

const CONSTRUCTION_FILL = { color: '#eeeeee', roughness: 0.9, metalness: 0 }

// Existing concrete walls, painted matte black. Very rough, dead-flat
// finish — paint settles into the rough concrete substrate so the
// surface barely picks up reflections.
export function wallMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#0f0f0f', roughness: 0.95, metalness: 0 }
}

export function blackoutMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#1a1a1a', roughness: 0.4, metalness: 0.1 }
}

export function curtainMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#2a1520', roughness: 0.95, metalness: 0 }
}

export function wainscotMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#241509', roughness: 0.85, metalness: 0.04 }
}

export function plankFaceMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#4a3220', roughness: 0.7, metalness: 0.04 }
}

export function steelDoorMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#c8c8c8', roughness: 0.4, metalness: 0.7 }
}

export function ductMetalMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#2a2a2a', roughness: 0.5, metalness: 0.6 }
}

export function acUnitMaterial(isConstruction) {
  return isConstruction
    ? CONSTRUCTION_FILL
    : { color: '#f0f0f0', roughness: 0.7, metalness: 0.05 }
}

export const SPRINKLER_RED = { color: '#c1272d', roughness: 0.6, metalness: 0.1 }
