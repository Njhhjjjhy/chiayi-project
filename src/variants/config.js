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
  },
  back: {
    label: 'Back-wall',
    position: [ROOM.W - 0.4, 1.6, ROOM.D / 2],
    target:   [0,            1.6, ROOM.D / 2],
  },
  front: {
    // Camera nudged past the pathway-partition-vertical (X = 1.5) so
    // the view isn't blocked by the partition the visitor first sees.
    label: 'Front-wall',
    position: [1.7,    1.6, ROOM.D / 2],
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
}
