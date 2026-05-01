import { useState } from 'react'
import { Html } from '@react-three/drei'
import DimensionLine from './DimensionLine.jsx'
import { HW, HD, D1_X, WALL_T } from '../geometry/dimensions.js'

// Partition system constants — must stay in sync with src/components/room/EntryPathway.jsx
const CORRIDOR_WIDTH      = 1.35
const PARTITION_HEIGHT    = 3.4
const PARTITION_THICKNESS = WALL_T // 0.12 m
const SEG2_FACE           = 2.5    // window-wall corridor partition (plenum-cleared)
const OPENING_HALF        = CORRIDOR_WIDTH / 2
const PARTITION_COLOR     = '#0a8c5b' // green — distinct from room blue / human orange

function MaterialNote({ position, children }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: '#f5f0e8',
        color: '#665533',
        padding: '2px 5px',
        borderRadius: '2px',
        fontSize: '8px',
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
        border: '1px solid #ddd0bb',
      }}>
        {children}
      </div>
    </Html>
  )
}

function InfoLabel({ position, children }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: '#fff',
        color: '#333',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '10px',
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
        border: '1px solid #ccc',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}>
        {children}
      </div>
    </Html>
  )
}

// Toggle buttons overlay for dimension categories
function DimensionToggles({ categories, activeCategories, onToggle }) {
  return (
    <div className="fixed bottom-16 right-4 z-10 select-none">
      <div className="bg-white/95 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider text-gray-400 border-b border-gray-200">
          Dimensions
        </div>
        <div className="p-1.5 flex flex-col gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onToggle(cat.id)}
              className={`text-[10px] px-2 py-1 rounded cursor-pointer transition-colors text-left ${
                activeCategories.includes(cat.id)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const DIM_CATEGORIES = [
  { id: 'room', label: 'Room' },
  { id: 'partitions', label: 'Partitions' },
  { id: 'human', label: 'Human reference' },
  { id: 'materials', label: 'Materials' },
]

export default function DimensionLabels({ roomWidth, roomDepth, roomHeight }) {
  const [activeCategories, setActiveCategories] = useState(['room', 'partitions', 'materials'])

  const halfW = roomWidth / 2
  const halfD = roomDepth / 2

  const toggleCategory = (id) => {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const has = (id) => activeCategories.includes(id)

  return (
    <group>
      {/* === ROOM DIMENSIONS === */}
      {has('room') && (
        <>
          {/* Width — along front wall */}
          <DimensionLine
            start={[-halfW, 0, halfD]}
            end={[halfW, 0, halfD]}
            label={`${roomWidth}m`}
            offset={0.4}
            offsetDirection={[0, 0, 1]}
          />
          {/* Depth — along left wall */}
          <DimensionLine
            start={[-halfW, 0, halfD]}
            end={[-halfW, 0, -halfD]}
            label={`${roomDepth}m`}
            offset={0.4}
            offsetDirection={[-1, 0, 0]}
          />
          {/* Height — left wall corner */}
          <DimensionLine
            start={[-halfW, 0, -halfD]}
            end={[-halfW, roomHeight, -halfD]}
            label={`${roomHeight}m`}
            offset={0.4}
            offsetDirection={[-1, 0, 0]}
          />
          {/* Room summary */}
          <InfoLabel position={[0, roomHeight + 0.4, 0]}>
            Room: {roomWidth} x {roomDepth} x {roomHeight}m
          </InfoLabel>
          {/* 1m scale bar */}
          <DimensionLine
            start={[halfW - 1, 0.02, halfD - 0.3]}
            end={[halfW, 0.02, halfD - 0.3]}
            label="1m"
          />
        </>
      )}

      {/* === PARTITIONS === */}
      {has('partitions') && (
        <>
          {/* Segment 1 corridor width — between front wall and seg-1 partition */}
          <DimensionLine
            start={[-2, 0.02, -HD]}
            end={[-2, 0.02, -HD + CORRIDOR_WIDTH]}
            label={`${CORRIDOR_WIDTH}m`}
            offset={0.3}
            offsetDirection={[-1, 0, 0]}
            color={PARTITION_COLOR}
          />
          {/* Segment 2 corridor width — between window wall and seg-2 partition (plenum-cleared) */}
          <DimensionLine
            start={[SEG2_FACE, 0.02, 0]}
            end={[HW, 0.02, 0]}
            label={`${(HW - SEG2_FACE).toFixed(2)}m`}
            offset={0.3}
            offsetDirection={[0, 0, 1]}
            color={PARTITION_COLOR}
          />
          {/* Segment 3 corridor width — between back wall and seg-3 partition */}
          <DimensionLine
            start={[2, 0.02, HD - CORRIDOR_WIDTH]}
            end={[2, 0.02, HD]}
            label={`${CORRIDOR_WIDTH}m`}
            offset={0.3}
            offsetDirection={[1, 0, 0]}
            color={PARTITION_COLOR}
          />
          {/* D1 corridor opening — visitors exit corridor through this gap into the forest */}
          <DimensionLine
            start={[D1_X - OPENING_HALF, 0.02, HD - CORRIDOR_WIDTH]}
            end={[D1_X + OPENING_HALF, 0.02, HD - CORRIDOR_WIDTH]}
            label={`opening ${CORRIDOR_WIDTH}m`}
            offset={0.3}
            offsetDirection={[0, 0, -1]}
            color={PARTITION_COLOR}
            fontSize="8px"
          />
          {/* Partition height — measured at the segment 1 partition near front-wall corner */}
          <DimensionLine
            start={[-HW + 0.5, 0, -HD + CORRIDOR_WIDTH]}
            end={[-HW + 0.5, PARTITION_HEIGHT, -HD + CORRIDOR_WIDTH]}
            label={`${PARTITION_HEIGHT}m`}
            offset={0.3}
            offsetDirection={[-1, 0, 0]}
            color={PARTITION_COLOR}
          />
          {/* Partition thickness — across segment 1's body */}
          <DimensionLine
            start={[3, 0.02, -HD + CORRIDOR_WIDTH]}
            end={[3, 0.02, -HD + CORRIDOR_WIDTH + PARTITION_THICKNESS]}
            label={`${(PARTITION_THICKNESS * 100).toFixed(0)}cm`}
            offset={0.4}
            offsetDirection={[0, 0, 1]}
            color={PARTITION_COLOR}
            fontSize="8px"
          />
          {/* Segment 4 stub length — perpendicular finish past D1 into the forest */}
          <DimensionLine
            start={[D1_X - OPENING_HALF, 0.02, HD - CORRIDOR_WIDTH]}
            end={[D1_X - OPENING_HALF, 0.02, HD - CORRIDOR_WIDTH - CORRIDOR_WIDTH]}
            label={`stub ${CORRIDOR_WIDTH}m`}
            offset={0.3}
            offsetDirection={[-1, 0, 0]}
            color={PARTITION_COLOR}
            fontSize="8px"
          />
        </>
      )}

      {/* === HUMAN REFERENCE HEIGHTS === */}
      {has('human') && (
        <>
          {/* Standing eye height */}
          <DimensionLine
            start={[halfW - 0.8, 0, halfD - 0.5]}
            end={[halfW - 0.8, 1.7, halfD - 0.5]}
            label="Standing: 1.7m"
            offset={0.25}
            offsetDirection={[1, 0, 0]}
            color="#cc6600"
          />
          {/* Ceiling clearance from standing */}
          <DimensionLine
            start={[halfW - 0.8, 1.7, halfD - 0.5]}
            end={[halfW - 0.8, roomHeight, halfD - 0.5]}
            label={`Clearance: ${(roomHeight - 1.7).toFixed(1)}m`}
            offset={0.5}
            offsetDirection={[1, 0, 0]}
            color="#cc6600"
            fontSize="8px"
          />
        </>
      )}

      {/* === MATERIALS === */}
      {has('materials') && (
        <>
          <MaterialNote position={[-halfW + 0.5, roomHeight * 0.5, 0]}>
            Entrance-wall: visitor entrance + long open span to bistro; infill TBD (covering strategy pending)
          </MaterialNote>
          <MaterialNote position={[halfW - 0.5, roomHeight * 0.5, 0]}>
            Window-wall: multi-pane glass partition + small window + silver door + HVAC plenum (covering TBD)
          </MaterialNote>
          <MaterialNote position={[0, 0.15, 0]}>
            Floor: existing grey marble porcelain; covering TBD
          </MaterialNote>
          <MaterialNote position={[0, roomHeight - 0.2, 0]}>
            Ceiling: existing structural — white plaster + cross-beams + cage pendants; covering TBD
          </MaterialNote>
        </>
      )}

      {/* Category toggles (HTML overlay) */}
      <Html fullscreen>
        <DimensionToggles
          categories={DIM_CATEGORIES}
          activeCategories={activeCategories}
          onToggle={toggleCategory}
        />
      </Html>
    </group>
  )
}
