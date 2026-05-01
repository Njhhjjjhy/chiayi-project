// Dev-only Vite plugin that simulates the QA panel's `/api/notes` and
// `/api/upload` endpoints locally. In production these are served by the
// Vercel functions in `api/` (which use Vercel Blob). Locally we just write
// to a JSON file and to `public/qa-dev-screenshots/` so the user can run
// `pnpm dev` without any Vercel setup.

import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const NOTES_FILE = path.resolve('.qa-dev-notes.json')
const SCREENSHOTS_DIR = path.resolve('public/qa-dev-screenshots')
const DEFAULT_PASSPHRASE = 'fireflies'

async function readNotes() {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeNotes(notes) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function authed(req) {
  const sent = req.headers['x-qa-passphrase']
  const expected = process.env.QA_PASSPHRASE || DEFAULT_PASSPHRASE
  return sent === expected
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default function qaDevPlugin() {
  return {
    name: 'qa-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/notes', async (req, res) => {
        if (!authed(req)) return send(res, 401, { error: 'Invalid passphrase' })
        try {
          if (req.method === 'GET') {
            const notes = await readNotes()
            return send(res, 200, notes)
          }
          if (req.method === 'POST') {
            const body = await readBody(req)
            const { category, location, text, screenshotUrl } = body
            if (!text || !String(text).trim()) {
              return send(res, 400, { error: 'text required' })
            }
            const notes = await readNotes()
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
            await writeNotes(notes)
            return send(res, 201, note)
          }
          if (req.method === 'PATCH') {
            const { id, done } = await readBody(req)
            if (!id) return send(res, 400, { error: 'id required' })
            const notes = await readNotes()
            const idx = notes.findIndex((n) => n.id === id)
            if (idx === -1) return send(res, 404, { error: 'not found' })
            notes[idx].done = Boolean(done)
            await writeNotes(notes)
            return send(res, 200, notes[idx])
          }
          if (req.method === 'DELETE') {
            const { id } = await readBody(req)
            if (!id) return send(res, 400, { error: 'id required' })
            const notes = await readNotes()
            const target = notes.find((n) => n.id === id)
            const remaining = notes.filter((n) => n.id !== id)
            if (target?.screenshotUrl?.startsWith('/qa-dev-screenshots/')) {
              const filename = target.screenshotUrl.split('/').pop()
              try {
                await fs.unlink(path.join(SCREENSHOTS_DIR, filename))
              } catch {
                // Already removed.
              }
            }
            await writeNotes(remaining)
            return send(res, 200, { ok: true })
          }
          send(res, 405, { error: 'method not allowed' })
        } catch (err) {
          console.error('[qa-dev] /api/notes error:', err)
          send(res, 500, { error: 'server error' })
        }
      })

      server.middlewares.use('/api/upload', async (req, res) => {
        if (!authed(req)) return send(res, 401, { error: 'Invalid passphrase' })
        if (req.method !== 'POST') return send(res, 405, { error: 'method not allowed' })
        try {
          const { dataUrl, filename } = await readBody(req)
          if (!dataUrl || !filename) {
            return send(res, 400, { error: 'dataUrl + filename required' })
          }
          const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/)
          if (!match) return send(res, 400, { error: 'invalid dataUrl' })
          const buffer = Buffer.from(match[2], 'base64')
          const ext = String(filename).split('.').pop()?.toLowerCase()
          const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : 'png'
          await fs.mkdir(SCREENSHOTS_DIR, { recursive: true })
          const id = randomUUID()
          const localFile = path.join(SCREENSHOTS_DIR, `${id}.${safeExt}`)
          await fs.writeFile(localFile, buffer)
          send(res, 200, { url: `/qa-dev-screenshots/${id}.${safeExt}` })
        } catch (err) {
          console.error('[qa-dev] /api/upload error:', err)
          send(res, 500, { error: 'server error' })
        }
      })
    },
  }
}
