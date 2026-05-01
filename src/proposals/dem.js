// DEM fetch scaffold for the Alishan western-escarpment ridge profile
// used by the "layered mountain silhouette" variant (phase 2).
// Chunk 1c ships the fetch scaffold only — silhouette geometry is not
// built yet. The returned `source` field tells the eventual caller
// whether the crops came from a real DEM or the procedural fallback,
// so the viewport can surface a visible warning (no silent substitute).

// Bounding box for the western-escarpment viewpoint: a high Alishan
// ridge looking west over descending foothills toward the Chiayi
// plain. Coordinates are approximate; refine when the DEM source is
// validated in phase 2.
const BBOX = { latS: 23.42, latN: 23.52, lonW: 120.68, lonE: 120.78 }

// OpenTopography public API. Free SRTM GL3 data available by default.
const OPENTOPOGRAPHY_ENDPOINT = 'https://portal.opentopography.org/API/globaldem'

// Taiwan National Land Surveying and Mapping Center (NLSC) — endpoint
// to be confirmed with an access token in phase 2. Scaffolded as a
// deliberate second-choice.
const NLSC_ENDPOINT_PLACEHOLDER = 'https://api.nlsc.gov.tw/dem'

/**
 * Fetch the Alishan western-escarpment DEM and return three depth
 * crops (near, mid, far) for the silhouette variant's front, middle,
 * and back layers.
 *
 * Attempts OpenTopography first, then Taiwan NLSC, then returns a
 * procedural fallback. On fallback a loud console warning is logged;
 * the consumer is expected to check `source === 'fallback'` and show a
 * visible viewport banner accordingly.
 *
 * @returns {Promise<{
 *   near: Array<[number, number]>,
 *   mid: Array<[number, number]>,
 *   far: Array<[number, number]>,
 *   source: 'opentopography'|'nlsc'|'fallback',
 * }>}
 */
export async function fetchAlishanDEM() {
  try {
    const data = await fetchFromOpenTopography()
    return { ...extractCrops(data), source: 'opentopography' }
  } catch (e) {
    console.warn('[proposals/dem] OpenTopography fetch failed:', e?.message || e)
  }

  try {
    const data = await fetchFromNLSC()
    return { ...extractCrops(data), source: 'nlsc' }
  } catch (e) {
    console.warn('[proposals/dem] Taiwan NLSC fetch failed:', e?.message || e)
  }

  console.warn('[proposals/dem] Both DEM sources failed — using PROCEDURAL FALLBACK. Silhouette variant should surface a visible viewport warning.')
  return { ...proceduralFallback(), source: 'fallback' }
}

async function fetchFromOpenTopography() {
  const params = new URLSearchParams({
    demtype: 'SRTMGL3',
    south: String(BBOX.latS),
    north: String(BBOX.latN),
    west: String(BBOX.lonW),
    east: String(BBOX.lonE),
    outputFormat: 'AAIGrid',
  })
  const res = await fetch(`${OPENTOPOGRAPHY_ENDPOINT}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return parseAAIGrid(text)
}

async function fetchFromNLSC() {
  // Real endpoint + auth wiring comes in phase 2. For scaffold, fail
  // immediately so the fallback chain progresses predictably.
  void NLSC_ENDPOINT_PLACEHOLDER
  throw new Error('NLSC endpoint not configured in scaffold')
}

// ESRI ArcInfo ASCII Grid parser. Minimal scaffold — returns the raw
// elevation grid for extractCrops to sample. Real parser hardens in
// phase 2 (NODATA handling, header validation, bounds).
function parseAAIGrid(text) {
  const lines = text.trim().split(/\r?\n/)
  const header = {}
  let bodyStart = 0
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/)
    if (parts.length === 2 && isNaN(parseFloat(parts[0]))) {
      header[parts[0].toLowerCase()] = parseFloat(parts[1])
    } else {
      bodyStart = i
      break
    }
  }
  const cols = header.ncols
  const rows = header.nrows
  if (!cols || !rows) throw new Error('Invalid AAIGrid header')

  const values = new Float32Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    const row = lines[bodyStart + r].trim().split(/\s+/)
    for (let c = 0; c < cols; c++) {
      values[r * cols + c] = parseFloat(row[c])
    }
  }
  return { cols, rows, values }
}

// Extract three horizon profiles (near / mid / far) from the 2D DEM
// by sampling three rows ~20 %, 50 %, 80 % through the grid. Each
// profile is normalised to (x, y) where x ∈ [0, 1] across the width
// and y is the elevation scaled into [0, 1] relative to the row's
// own min/max.
function extractCrops(data) {
  const { cols, rows, values } = data
  const pickRow = (frac) => Math.max(0, Math.min(rows - 1, Math.round(frac * rows)))
  const rowToProfile = (r) => {
    let min = Infinity, max = -Infinity
    for (let c = 0; c < cols; c++) {
      const v = values[r * cols + c]
      if (v < min) min = v
      if (v > max) max = v
    }
    const range = max - min || 1
    const profile = new Array(cols)
    for (let c = 0; c < cols; c++) {
      const v = values[r * cols + c]
      profile[c] = [c / (cols - 1), (v - min) / range]
    }
    return profile
  }
  return {
    near: rowToProfile(pickRow(0.2)),
    mid: rowToProfile(pickRow(0.5)),
    far: rowToProfile(pickRow(0.8)),
  }
}

// Procedural fallback: three layered pseudo-ridge profiles from
// summed sinusoids. Used only when both DEM sources fail. Marked via
// the `source: 'fallback'` flag so the silhouette variant can surface
// a viewport warning.
function proceduralFallback() {
  return {
    near: makeProceduralRidge({ points: 200, amplitude: 0.25, frequency: 1.3, octaves: 3, seed: 1.1 }),
    mid: makeProceduralRidge({ points: 200, amplitude: 0.40, frequency: 0.7, octaves: 4, seed: 2.2 }),
    far: makeProceduralRidge({ points: 200, amplitude: 0.60, frequency: 0.4, octaves: 5, seed: 3.3 }),
  }
}

function makeProceduralRidge({ points, amplitude, frequency, octaves, seed }) {
  const ridge = new Array(points)
  for (let i = 0; i < points; i++) {
    const x = i / (points - 1)
    let y = 0
    for (let o = 0; o < octaves; o++) {
      const f = frequency * Math.pow(2, o)
      const a = amplitude * Math.pow(0.5, o)
      y += Math.sin(x * Math.PI * 2 * f + seed * (o + 1)) * a
    }
    // Bias low so silhouettes read as ridges against the sky.
    ridge[i] = [x, 0.3 + y]
  }
  return ridge
}
