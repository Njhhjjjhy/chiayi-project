import { useVariant } from '../../hooks/useVariant.jsx'
import { useTimeline } from '../../hooks/useTimeline.jsx'
import Blinking from './Blinking.jsx'
import Motion from './Motion.jsx'
import Interaction from './Interaction.jsx'
import TheWave from './TheWave.jsx'

const VARIANT_COMPONENTS = {
  blinking: Blinking,
  motion: Motion,
  interaction: Interaction,
  theWave: TheWave,
}

export default function FireflySystem() {
  const { selections, isExperience } = useVariant()
  const { time } = useTimeline()

  if (!isExperience) return null

  const darknessProgress = Math.max(0, (time - 0.75) / 0.05)
  const masterOpacity = Math.min(1, darknessProgress)

  if (masterOpacity <= 0) return null

  const variantId = selections.fireflies || 'blinking'
  const VariantComponent = VARIANT_COMPONENTS[variantId] || Blinking

  return <VariantComponent masterOpacity={masterOpacity} />
}
