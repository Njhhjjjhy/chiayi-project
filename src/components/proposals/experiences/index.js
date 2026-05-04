// Lookup map from experience id → component. Components mount inside
// the Canvas alongside <Scene /> and apply their own treatment via the
// shared timeline / variant context.
//
// Experience ids without an entry here render the bare scene only and
// the placeholder banner is shown.

import LastLight from './LastLight.jsx'
import Underwater from './Underwater.jsx'
import Void from './Void.jsx'

export const experienceComponents = {
  'last-light': LastLight,
  'underwater': Underwater,
  'void': Void,
}
