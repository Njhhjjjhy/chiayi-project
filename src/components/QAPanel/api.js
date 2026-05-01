const PASSPHRASE_KEY = 'qa.passphrase'

export function getStoredPassphrase() {
  try {
    return localStorage.getItem(PASSPHRASE_KEY) || ''
  } catch {
    return ''
  }
}

export function storePassphrase(value) {
  try {
    localStorage.setItem(PASSPHRASE_KEY, value)
  } catch {
    // Ignore storage failures (private mode etc.) — caller can retry.
  }
}

export function clearPassphrase() {
  try {
    localStorage.removeItem(PASSPHRASE_KEY)
  } catch {
    // Ignore.
  }
}

function authHeaders(passphrase) {
  return {
    'Content-Type': 'application/json',
    'x-qa-passphrase': passphrase,
  }
}

export async function fetchNotes(passphrase) {
  const res = await fetch('/api/notes', {
    headers: { 'x-qa-passphrase': passphrase },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to load notes')
  return res.json()
}

export async function createNote(passphrase, payload) {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: authHeaders(passphrase),
    body: JSON.stringify(payload),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to create note')
  return res.json()
}

export async function updateNoteStatus(passphrase, id, done) {
  const res = await fetch('/api/notes', {
    method: 'PATCH',
    headers: authHeaders(passphrase),
    body: JSON.stringify({ id, done }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to update note')
  return res.json()
}

export async function deleteNote(passphrase, id) {
  const res = await fetch('/api/notes', {
    method: 'DELETE',
    headers: authHeaders(passphrase),
    body: JSON.stringify({ id }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to delete note')
  return res.json()
}

export async function uploadScreenshot(passphrase, file) {
  const dataUrl = await fileToDataUrl(file)
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: authHeaders(passphrase),
    body: JSON.stringify({ dataUrl, filename: file.name || 'screenshot.png' }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to upload screenshot')
  const { url } = await res.json()
  return url
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function relativeTime(iso) {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
