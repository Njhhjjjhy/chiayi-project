import { useVariant } from '../../hooks/useVariant.jsx'
import { useTimeline } from '../../hooks/useTimeline.jsx'
import ListeningDark from './ListeningDark.jsx'
import FlashLanguage from './FlashLanguage.jsx'
import TheWave from './TheWave.jsx'
import CanopyGrid from './CanopyGrid.jsx'
import TheVeil from './TheVeil.jsx'
import TheReflection from './TheReflection.jsx'

const VARIANT_COMPONENTS = {
  listeningDark: ListeningDark,
  flashLanguage: FlashLanguage,
  theWave: TheWave,
  canopyGrid: CanopyGrid,
  theVeil: TheVeil,
  theReflection: TheReflection,
}

export default function FireflySystem() {
  const { selections, viewMode } = useVariant()
  const { time } = useTimeline()

  if (viewMode === 'construction') return null

  // Fireflies only active during darkness phase (0.75 - 1.0)
  // Fade in from 0.75 to 0.80
  const darknessProgress = Math.max(0, (time - 0.75) / 0.05)
  const masterOpacity = Math.min(1, darknessProgress)

  if (masterOpacity <= 0) return null

  const variantId = selections.fireflies
  if (!variantId) return null

  const VariantComponent = VARIANT_COMPONENTS[variantId]
  if (!VariantComponent) return null

  return <VariantComponent masterOpacity={masterOpacity} />
}
