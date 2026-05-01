import { put, list, del } from '@vercel/blob'
import { randomUUID } from 'node:crypto'

const INDEX_PATH = 'qa/notes-index.json'

async function getIndex() {
  const { blobs } = await list({ prefix: INDEX_PATH, limit: 1 })
  if (!blobs.length) return []
  const res = await fetch(blobs[0].url, { cache: 'no-store' })
  if (!res.ok) return []
  try {
    return await res.json()
  } catch {
    return []
  }
}

async function saveIndex(notes) {
  await put(INDEX_PATH, JSON.stringify(notes), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

function authed(req) {
  const sent = req.headers['x-qa-passphrase']
  const expected = process.env.QA_PASSPHRASE
  return Boolean(expected) && sent === expected
}

export default async function handler(req, res) {
  if (!authed(req)) {
    return res.status(401).json({ error: 'Invalid passphrase' })
  }

  try {
    if (req.method === 'GET') {
      const notes = await getIndex()
      return res.status(200).json(notes)
    }

    if (req.method === 'POST') {
      const { category, location, text, screenshotUrl } = req.body || {}
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'text required' })
      }
      const notes = await getIndex()
      const note = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        category: category || null,
        location: location || null,
        text: String(text).trim(),
        screenshotUrl: screenshotUrl || null,
        done: false,
      }
      notes.unshift(note)
      await saveIndex(notes)
      return res.status(201).json(note)
    }

    if (req.method === 'PATCH') {
      const { id, done } = req.body || {}
      if (!id) return res.status(400).json({ error: 'id required' })
      const notes = await getIndex()
      const idx = notes.findIndex((n) => n.id === id)
      if (idx === -1) return res.status(404).json({ error: 'not found' })
      notes[idx].done = Boolean(done)
      await saveIndex(notes)
      return res.status(200).json(notes[idx])
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'id required' })
      const notes = await getIndex()
      const target = notes.find((n) => n.id === id)
      const remaining = notes.filter((n) => n.id !== id)
      if (target?.screenshotUrl) {
        try {
          await del(target.screenshotUrl)
        } catch {
          // Screenshot already gone — fine.
        }
      }
      await saveIndex(remaining)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end()
  } catch (err) {
    console.error('[api/notes] error:', err)
    return res.status(500).json({ error: 'server error' })
  }
}
