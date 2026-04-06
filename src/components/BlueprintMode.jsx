import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Orthographic blueprint views for architectural drawings.
// Switches the camera to orthographic and positions it for each view type.

const VIEWS = {
  plan: {
    label: 'Plan View',
    description: 'Top-down layout',
    position: [0, 15, 0],
    lookAt: [0, 0, 0],
    up: [0, 0, -1],
    frustumSize: 14,
  },
  frontElevation: {
    label: 'Front Elevation',
    description: 'Mountain wall face',
    position: [0, 1.75, 10],
    lookAt: [0, 1.75, -5],
    up: [0, 1, 0],
    frustumSize: 12,
  },
  sideSection: {
    label: 'Side Section',
    description: 'Room depth and layers',
    position: [-12, 1.75, 0],
    lookAt: [0, 1.75, 0],
    up: [0, 1, 0],
    frustumSize: 12,
  },
  mountainDetail: {
    label: 'Mountain Detail',
    description: 'Layer spacing close-up',
    position: [0, 2, -2],
    lookAt: [0, 2, -5],
    up: [0, 1, 0],
    frustumSize: 5,
  },
}

export const BLUEPRINT_VIEW_LIST = Object.entries(VIEWS).map(([id, v]) => ({ id, ...v }))

export function BlueprintCamera({ viewId }) {
  const { camera, size } = useThree()

  useEffect(() => {
    const view = VIEWS[viewId]
    if (!view || !(camera instanceof THREE.OrthographicCamera)) return

    const aspect = size.width / size.height
    const half = view.frustumSize / 2

    camera.left = -half * aspect
    camera.right = half * aspect
    camera.top = half
    camera.bottom = -half
    camera.near = 0.1
    camera.far = 50

    camera.position.set(...view.position)
    camera.lookAt(...view.lookAt)
    if (view.up) camera.up.set(...view.up)
    camera.updateProjectionMatrix()
  }, [viewId, camera, size])

  return null
}

// Title block overlay shown during blueprint views
export function BlueprintTitleBlock({ viewId }) {
  const view = VIEWS[viewId]
  if (!view) return null

  const date = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed bottom-4 left-4 z-10 select-none pointer-events-none">
      <div className="bg-white border-2 border-gray-800 px-4 py-2.5" style={{ minWidth: '240px' }}>
        <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">
          Firefly Immersive Experience
        </div>
        <div className="text-sm font-medium text-gray-800 mb-0.5">
          {view.label}
        </div>
        <div className="text-[9px] text-gray-400">
          {view.description}
        </div>
        <div className="flex justify-between mt-1.5 pt-1.5 border-t border-gray-300 text-[8px] text-gray-400">
          <span>Alishan, Chiayi County</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}
