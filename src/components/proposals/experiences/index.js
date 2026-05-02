// Lookup map from experience id → component. Components mount inside
// the Canvas alongside <Scene /> and apply their own treatment via the
// shared timeline / variant context.
//
// Experience ids without an entry here render the bare scene only and
// the placeholder banner is shown.

import CompressedDay from './CompressedDay.jsx'
import Strobe from './Strobe.jsx'
import Recalibration from './Recalibration.jsx'
import MirroredSelf from './MirroredSelf.jsx'
import DarkCorridor from './DarkCorridor.jsx'

export const experienceComponents = {
  'compressed-day': CompressedDay,
  'strobe': Strobe,
  'recalibration': Recalibration,
  'mirrored-self': MirroredSelf,
  'dark-corridor': DarkCorridor,
}
