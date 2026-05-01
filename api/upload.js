import { put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'

function authed(req) {
  const sent = req.headers['x-qa-passphrase']
  const expected = process.env.QA_PASSPHRASE
  return Boolean(expected) && sent === expected
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
}

export default async function handler(req, res) {
  if (!authed(req)) {
    return res.status(401).json({ error: 'Invalid passphrase' })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  try {
    const { dataUrl, filename } = req.body || {}
    if (!dataUrl || !filename) {
      return res.status(400).json({ error: 'dataUrl + filename required' })
    }
    const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/)
    if (!match) return res.status(400).json({ error: 'invalid dataUrl' })
    const contentType = match[1]
    const buffer = Buffer.from(match[2], 'base64')
    const ext = String(filename).split('.').pop()?.toLowerCase() || 'png'
    const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : 'png'
    const blob = await put(`qa/screenshots/${randomUUID()}.${safeExt}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    })
    return res.status(200).json({ url: blob.url })
  } catch (err) {
    console.error('[api/upload] error:', err)
    return res.status(500).json({ error: 'server error' })
  }
}
