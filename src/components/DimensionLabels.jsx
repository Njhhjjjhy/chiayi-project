import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.js'
import DimensionLine from './DimensionLine.jsx'

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
  { id: 'seating', label: 'Seating' },
  { id: 'human', label: 'Human reference' },
  { id: 'materials', label: 'Materials' },
]

export default function DimensionLabels({ roomWidth, roomDepth, roomHeight }) {
  const { showSeating } = useVariant()
  const [activeCategories, setActiveCategories] = useState(['room', 'materials'])

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

      {/* === SEATING === */}
      {has('seating') && showSeating && (
        <>
          {/* Bench height */}
          <DimensionLine
            start={[2, 0, 2.0]}
            end={[2, 0.45, 2.0]}
            label="0.45m"
            offset={0.3}
            offsetDirection={[1, 0, 0]}
            color="#8844aa"
          />
          {/* Row 1 position */}
          <DimensionLine
            start={[0, 0.02, 0]}
            end={[0, 0.02, 2.0]}
            label="Row 1: 2.0m"
            offset={0.5}
            offsetDirection={[1, 0, 0]}
            color="#8844aa"
            fontSize="8px"
          />
          {/* Row 2 position */}
          <DimensionLine
            start={[0, 0.02, 0]}
            end={[0, 0.02, 3.5]}
            label="Row 2: 3.5m"
            offset={0.8}
            offsetDirection={[1, 0, 0]}
            color="#8844aa"
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
          {/* Seated eye height */}
          <DimensionLine
            start={[halfW - 0.8, 0, halfD - 1.2]}
            end={[halfW - 0.8, 1.1, halfD - 1.2]}
            label="Seated eye: 1.1m"
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
