import { useState, useCallback } from 'react'
import { MeasureContext } from './useMeasure.js'

let measureId = 0

export function MeasureProvider({ children }) {
  const [measureMode, setMeasureMode] = useState(false)
  const [pendingPoint, setPendingPoint] = useState(null) // first click point
  const [measurements, setMeasurements] = useState([])

  const startMeasure = useCallback(() => {
    setMeasureMode(true)
    setPendingPoint(null)
  }, [])

  const stopMeasure = useCallback(() => {
    setMeasureMode(false)
    setPendingPoint(null)
  }, [])

  const toggleMeasure = useCallback(() => {
    setMeasureMode((prev) => {
      if (prev) setPendingPoint(null)
      return !prev
    })
  }, [])

  const addPoint = useCallback((point) => {
    setPendingPoint((prev) => {
      if (!prev) {
        return point
      }
      const dist = Math.sqrt(
        (point[0] - prev[0]) ** 2 +
        (point[1] - prev[1]) ** 2 +
        (point[2] - prev[2]) ** 2
      )
      setMeasurements((ms) => [
        ...ms,
        { id: ++measureId, start: prev, end: point, distance: dist },
      ])
      return null
    })
  }, [])

  const removeMeasurement = useCallback((id) => {
    setMeasurements((ms) => ms.filter((m) => m.id !== id))
  }, [])

  const clearMeasurements = useCallback(() => {
    setMeasurements([])
    setPendingPoint(null)
  }, [])

  return (
    <MeasureContext.Provider
      value={{
        measureMode,
        pendingPoint,
        measurements,
        startMeasure,
        stopMeasure,
        toggleMeasure,
        addPoint,
        removeMeasurement,
        clearMeasurements,
      }}
    >
      {children}
    </MeasureContext.Provider>
  )
}
