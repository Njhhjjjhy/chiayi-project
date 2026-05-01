import { useState } from 'react'
import { ProposalsContext } from './useProposals.js'
import {
  DEFAULT_PROPOSAL_VARIANT_ID,
  DEFAULT_FIREFLY_COUNT,
  DEFAULT_HAZE_LEVEL,
  DEFAULT_SHOW_CURTAIN,
  DEFAULT_SHOW_PATHWAY,
  DEFAULT_SHOW_PATHWAY_LEFT,
} from '../proposals/defaults.js'

// Central state for the proposals review page: currently selected
// variant, optional A/B pair, global firefly density override, global
// haze override, and the two architectural-overlay toggles (blackout
// curtain, entry pathway). Playback state (playing flag + scrubber
// position) lives in TimelineProvider; the proposals page reads from
// it directly rather than duplicating state here.

export function ProposalsProvider({ children }) {
  const [currentVariantId, setCurrentVariantId] = useState(DEFAULT_PROPOSAL_VARIANT_ID)
  const [abPair, setAbPair] = useState([null, null])
  const [fireflyCount, setFireflyCount] = useState(DEFAULT_FIREFLY_COUNT)
  const [hazeOverride, setHazeOverride] = useState(DEFAULT_HAZE_LEVEL)
  const [showCurtain, setShowCurtain] = useState(DEFAULT_SHOW_CURTAIN)
  const [showPathway, setShowPathway] = useState(DEFAULT_SHOW_PATHWAY)
  const [showPathwayLeft, setShowPathwayLeft] = useState(DEFAULT_SHOW_PATHWAY_LEFT)

  return (
    <ProposalsContext.Provider
      value={{
        currentVariantId, setCurrentVariantId,
        abPair, setAbPair,
        fireflyCount, setFireflyCount,
        hazeOverride, setHazeOverride,
        showCurtain, setShowCurtain,
        showPathway, setShowPathway,
        showPathwayLeft, setShowPathwayLeft,
      }}
    >
      {children}
    </ProposalsContext.Provider>
  )
}
