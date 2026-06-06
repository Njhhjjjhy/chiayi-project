import { ROOM, PATHWAY_PARTITION_Z } from '../geometry/dimensions.js'

// Camera presets for /fireflies. Six standard architectural views.
// Convention: the preset name is the wall the camera is LOOKING AT.
//
// Two prior Option A passes:
//   1) Spec section 1.11 positions were copy-pasted from v1 with v1
//      numeric values; targets were rewritten to match labels.
//   2) Several positions then landed BEHIND a partition. Cameras moved
//      so each preset actually shows the wall its label promises —
//      front/entrance shots inside the forest, the window shot in the
//      pathway-horizontal-leg, and 'standing' looking down the pathway
//      from the entry rather than at the partition wall in front of it.

export const cameraPresets = {
  ceiling: {
    label: 'Ceiling',
    position: [ROOM.W / 2, 10, ROOM.D / 2],
    target:   [ROOM.W / 2,  0, ROOM.D / 2],
    fov: 65,
  },
  back: {
    label: 'Back-wall',
    position: [ROOM.W - 0.4, 1.6, ROOM.D / 2],
    target:   [0,            1.6, ROOM.D / 2],
  },
  front: {
    // Camera nudged past the pathway-partition-vertical cabinet (forest
    // face X = 2.0) so the view isn't blocked by the cabinet the visitor
    // first sees.
    label: 'Front-wall',
    position: [2.1,    1.6, ROOM.D / 2],
    target:   [ROOM.W, 1.6, ROOM.D / 2],
  },
  window: {
    // Camera placed in the forest at X = 7.5, lined up with the open
    // forest-entry-gap (X > 6.43) so the line of sight to the curtain
    // isn't blocked by the pathway-partition-horizontal. Closer-in
    // positions in the pathway-horizontal-leg fill the frame entirely
    // with curtain since the camera ends up point-blank against it.
    label: 'Window-wall',
    position: [7.5, 1.6, 5.0],
    target:   [7.5, 1.6, ROOM.D],
  },
  entrance: {
    // Camera placed in the forest, looking back toward the entrance-wall
    // partitions. Avoids landing in the strip between the curtain and
    // the pathway-partition-horizontal where the partition occludes Z=0.
    label: 'Entrance-wall',
    position: [ROOM.W / 2, 1.6, 6.0],
    target:   [ROOM.W / 2, 1.6, 0],
  },
  standing: {
    // Visitor's eye-level POV right after stepping through the entry gap,
    // looking down the pathway-vertical-leg toward its turn. Avoids
    // facing the pathway-partition-vertical directly.
    label: 'Standing',
    position: [0.75, 1.6, 0.4],
    target:   [0.75, 1.6, PATHWAY_PARTITION_Z],
  },
  experience: {
    // Default view when experience mode is entered: a visitor standing
    // inside the forest at eye level, facing the sun side (front-wall /
    // loofah wall) with the seating and ceiling discs in frame. The
    // sunset plays out in front of them.
    label: 'Experience view',
    position: [3.0, 1.5, 5.6],
    target:   [8.7, 1.15, 3.6],
  },

  'flock-looking-up': {
    label: 'Flock looking up',
    position: [5.0, 0.5, 3.5],
    target:   [5.0, 3.5, 3.5],
  },
  'flock-side': {
    label: 'Flock side',
    position: [2.5, 1.6, 3.5],
    target:   [8.0, 2.6, 3.5],
  },
  'nesting-between': {
    label: 'Nesting between',
    position: [4.0, 0.4, 2.5],
    target:   [4.0, 3.5, 2.5],
  },
  'nesting-overhead': {
    label: 'Nesting overhead',
    position: [5.5, 4.0, 3.5],
    target:   [5.5, 0.0, 3.5],
  },

  // --- Diagnostic presets (capture-only origin, now dropdown-visible) ---
  // Each was previously an inline viewKey override in FirefliesPage.jsx.
  // Migrated here so the dropdown surfaces them under a "Diagnostic"
  // subheading. `corner-compare` retains a dynamic target override in
  // FirefliesPage so the target follows the active `?corner=` value;
  // the position is fixed here.
  'corner-compare': {
    label: 'Corner compare',
    position: [4.4, 1.6, 4.4],
    target:   [4.4, 1.6, 4.4],
    group: 'diagnostic',
  },
  'close-range-seating': {
    label: 'Close-range seating',
    position: [3.5, 1.0, 2.6],
    target:   [4.2, 0.45, 1.4],
    group: 'diagnostic',
  },
  'seating-spotlight-pool': {
    label: 'Seating spotlight pool',
    position: [5.5, 2.6, 1.6],
    target:   [5.5, 0.0, 4.0],
    group: 'diagnostic',
  },
  'looking-up-from-seating': {
    label: 'Looking up from seating',
    position: [5.5, 1.05, 4.0],
    target:   [5.5, 4.2, 4.0],
    group: 'diagnostic',
  },
  'ceiling-led-density': {
    label: 'Ceiling LED density',
    position: [4.4, 6.0, 4.4],
    target:   [4.4, 0.0, 4.4],
    group: 'diagnostic',
  },
  'loofah-close-range': {
    label: 'Loofah close range',
    position: [7.14, 1.2, 3.64],
    target:   [8.7, 1.2, 3.64],
    group: 'diagnostic',
  },
  'loofah-overview': {
    label: 'Loofah overview',
    position: [3.5, 1.8, 4.5],
    target:   [7.0, 1.2, 2.0],
    group: 'diagnostic',
  },
  'partition-close-range': {
    label: 'Partition close range',
    position: [3.965, 1.76, 1.7],
    target:   [3.965, 1.76, 0.5],
    group: 'diagnostic',
  },
  'partition-corner': {
    label: 'Partition corner',
    position: [3.6, 1.4, 2.4],
    target:   [2.0, 1.4, 0.5],
    group: 'diagnostic',
  },
  'walldots-closerange': {
    label: 'Wall dots close range',
    position: [1.32, 2.5, 4.39],
    target:   [0.12, 2.5, 4.39],
    group: 'diagnostic',
  },
}
