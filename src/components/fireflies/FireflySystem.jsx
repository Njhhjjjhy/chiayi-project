import { useVariant } from '../../hooks/useVariant.jsx'
import { useTimeline } from '../../hooks/useTimeline.jsx'
import ScatteredDrift from './ScatteredDrift.jsx'
import WaveSync from './WaveSync.jsx'
import StillnessResponse from './StillnessResponse.jsx'
import ListeningDark from './ListeningDark.jsx'
import FlashLanguage from './FlashLanguage.jsx'
import TheWave from './TheWave.jsx'
import CanopyGrid from './CanopyGrid.jsx'
import TheVeil from './TheVeil.jsx'
import TheReflection from './TheReflection.jsx'
import SodiumMist from './SodiumMist.jsx'
import PrismaticDust from './PrismaticDust.jsx'

const VARIANT_COMPONENTS = {
  // New ceiling-module-based variants with real behavior
  scatteredDrift: ScatteredDrift,
  waveSync: WaveSync,
  stillnessResponse: StillnessResponse,
  // Legacy surface-based variants
  listeningDark: ListeningDark,
  flashLanguage: FlashLanguage,
  theWave: TheWave,
  canopyGrid: CanopyGrid,
  theVeil: TheVeil,
  theReflection: TheReflection,
  sodiumMist: SodiumMist,
  prismaticDust: PrismaticDust,
}

export default function FireflySystem() {
  const { selections, isExperience } = useVariant()
  const { time } = useTimeline()

  if (!isExperience) return null

  // Fireflies active during darkness phase (0.75 - 1.0)
  const darknessProgress = Math.max(0, (time - 0.75) / 0.05)
  const masterOpacity = Math.min(1, darknessProgress)

  if (masterOpacity <= 0) return null

  const variantId = selections.fireflies || 'scatteredDrift'
  const VariantComponent = VARIANT_COMPONENTS[variantId]
  if (!VariantComponent) return null

  return <VariantComponent masterOpacity={masterOpacity} />
}
