import { useEffect, useRef, useState } from 'react'
import {
  clearPassphrase,
  createNote,
  deleteNote,
  fetchNotes,
  getStoredPassphrase,
  relativeTime,
  storePassphrase,
  updateNoteStatus,
  uploadScreenshot,
} from './api'
import { CATEGORIES, ROOM_LOCATIONS } from './locations'
import Glass, { EASE_OUT, CloseGlyph } from '../Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

// Quiet button: text + thin border. Default for secondary actions.
const BTN_BORDER =
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-[15px] text-white/85 border border-white/20 hover:text-white hover:border-white/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

// Plain text button: lowest emphasis. Still 44px hit area.
const BTN_PLAIN =
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-[15px] text-white/85 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer'

// Single primary CTA per screen — solid white.
const BTN_FILLED =
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-[15px] font-medium bg-white text-black hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

const BTN_DESTRUCTIVE =
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-[15px] text-white/65 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer'

const FIELD =
  'w-full rounded-xl bg-white/[0.06] border border-white/15 px-4 py-3 text-[15px] text-white placeholder:text-white/55 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors'

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
]

export default function QAPanel() {
  const [open, setOpen] = useState(false)
  const [passphrase, setPassphrase] = useState(() => getStoredPassphrase())
  const [unlocked, setUnlocked] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('open')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (!passphrase || unlocked) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
      fetchNotes(passphrase)
        .then((list) => {
          if (cancelled) return
          setNotes(list)
          setUnlocked(true)
          setError('')
        })
        .catch((err) => {
          if (cancelled) return
          if (err.message === 'UNAUTHORIZED') {
            clearPassphrase()
            setPassphrase('')
            setUnlocked(false)
          } else {
            setError(err.message || 'Failed to load')
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })
    return () => {
      cancelled = true
    }
  }, [open, passphrase, unlocked])

  async function refresh(currentPassphrase = passphrase) {
    setLoading(true)
    try {
      const list = await fetchNotes(currentPassphrase)
      setNotes(list)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function handleUnlock(value) {
    setLoading(true)
    setError('')
    try {
      const list = await fetchNotes(value)
      storePassphrase(value)
      setPassphrase(value)
      setNotes(list)
      setUnlocked(true)
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        setError('Wrong passphrase.')
      } else {
        setError(err.message || 'Failed to load')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(payload) {
    const note = await createNote(passphrase, payload)
    setNotes((prev) => [note, ...prev])
  }

  async function handleToggleDone(note) {
    const updated = await updateNoteStatus(passphrase, note.id, !note.done)
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)))
  }

  async function handleDelete(note) {
    await deleteNote(passphrase, note.id)
    setNotes((prev) => prev.filter((n) => n.id !== note.id))
  }

  const visibleNotes = notes.filter((n) => {
    if (filter === 'open') return !n.done
    if (filter === 'done') return n.done
    return true
  })
  const openCount = notes.filter((n) => !n.done).length

  return (
    <>
      {/* Floating trigger — quiet glass pill so it sits beside other tools */}
      <Glass
        as="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open notes"
        style={TRANSITION}
        className="fixed top-4 right-4 z-40 inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 cursor-pointer hover:bg-black/55 transition-colors"
      >
        <span className="text-[15px]">Notes</span>
        {openCount > 0 && (
          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-[12px] font-medium text-black">
            {openCount}
          </span>
        )}
      </Glass>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close panel backdrop"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 cursor-default"
          />
          <Glass
            as="aside"
            className="relative h-full w-full max-w-md overflow-y-auto rounded-l-2xl border-r-0"
          >
            <PanelHeader
              onClose={() => setOpen(false)}
              onSignOut={
                unlocked
                  ? () => {
                      clearPassphrase()
                      setPassphrase('')
                      setUnlocked(false)
                      setNotes([])
                    }
                  : null
              }
            />

            {!unlocked ? (
              <PassphraseGate
                onUnlock={handleUnlock}
                loading={loading}
                error={error}
              />
            ) : (
              <div className="px-6 pb-12">
                <NewNoteForm passphrase={passphrase} onCreate={handleCreate} />
                <FilterTabs
                  value={filter}
                  onChange={setFilter}
                  counts={{
                    open: notes.filter((n) => !n.done).length,
                    done: notes.filter((n) => n.done).length,
                    all: notes.length,
                  }}
                />
                {error && (
                  <p className="mt-4 text-[13px] text-white">{error}</p>
                )}
                {loading && notes.length === 0 ? (
                  <p className="mt-6 text-[15px] text-white/65">Loading…</p>
                ) : visibleNotes.length === 0 ? (
                  <p className="mt-6 text-[15px] text-white/65">
                    {filter === 'open' && 'No open notes.'}
                    {filter === 'done' && 'No notes marked done yet.'}
                    {filter === 'all' && 'No notes yet.'}
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-white/10">
                    {visibleNotes.map((note) => (
                      <NoteRow
                        key={note.id}
                        note={note}
                        onToggle={() => handleToggleDone(note)}
                        onDelete={() => handleDelete(note)}
                      />
                    ))}
                  </ul>
                )}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => refresh()}
                    style={TRANSITION}
                    className={BTN_PLAIN}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </Glass>
        </div>
      )}
    </>
  )
}

function PanelHeader({ onClose, onSignOut }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
      <h2 className="text-[12px] uppercase tracking-[0.08em] text-white/55 px-2">
        Notes
      </h2>
      <div className="flex items-center gap-1">
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            style={TRANSITION}
            className={BTN_PLAIN}
          >
            Lock
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notes panel"
          style={TRANSITION}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white/75 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
        >
          <CloseGlyph size={12} />
        </button>
      </div>
    </header>
  )
}

function PassphraseGate({ onUnlock, loading, error }) {
  const [value, setValue] = useState('')
  return (
    <form
      className="px-6 pt-10"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        onUnlock(value.trim())
      }}
    >
      <p className="text-[15px] text-white/80 leading-relaxed">
        Enter the shared passphrase to view and add notes.
      </p>
      <input
        type="password"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Passphrase"
        className={`mt-5 ${FIELD}`}
        aria-label="Passphrase"
      />
      {error && <p className="mt-3 text-[13px] text-white">{error}</p>}
      <button
        type="submit"
        disabled={loading || !value.trim()}
        style={TRANSITION}
        className={`mt-5 ${BTN_FILLED}`}
      >
        {loading ? 'Checking…' : 'Unlock'}
      </button>
    </form>
  )
}

function NewNoteForm({ passphrase, onCreate }) {
  const [category, setCategory] = useState('bug')
  const [location, setLocation] = useState('')
  const [text, setText] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    function onPaste(e) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type?.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleFile(file)
          }
          break
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passphrase])

  async function handleFile(file) {
    setUploadError('')
    const previewUrl = URL.createObjectURL(file)
    setScreenshot({ uploading: true, previewUrl })
    try {
      const url = await uploadScreenshot(passphrase, file)
      setScreenshot({ url, previewUrl })
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
      setScreenshot(null)
      URL.revokeObjectURL(previewUrl)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await onCreate({
        category,
        location: location || null,
        text: text.trim(),
        screenshotUrl: screenshot?.url || null,
      })
      if (screenshot?.previewUrl) URL.revokeObjectURL(screenshot.previewUrl)
      setText('')
      setLocation('')
      setScreenshot(null)
      setCategory('bug')
    } catch {
      setUploadError('Could not save note')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    text.trim().length > 0 && !submitting && !screenshot?.uploading

  return (
    <form className="pt-6" onSubmit={handleSubmit}>
      <fieldset>
        <legend className="text-[12px] uppercase tracking-[0.08em] text-white/55 mb-2">
          Category
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = category === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={active}
                style={TRANSITION}
                className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-[13px] cursor-pointer transition-colors ${
                  active
                    ? 'bg-white/15 text-white border border-white/30'
                    : 'border border-white/15 text-white/75 hover:text-white hover:border-white/30'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="block mt-5">
        <span className="block text-[12px] uppercase tracking-[0.08em] text-white/55 mb-2">
          Where in the room?
        </span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={FIELD}
          style={{ colorScheme: 'dark' }}
        >
          <option value="">Optional — leave blank if general</option>
          {ROOM_LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block mt-5">
        <span className="block text-[12px] uppercase tracking-[0.08em] text-white/55 mb-2">
          Note
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the note?"
          rows={3}
          className={`${FIELD} resize-y`}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={TRANSITION}
          className={BTN_BORDER}
        >
          {screenshot ? 'Replace screenshot' : 'Attach screenshot'}
        </button>
        <span className="text-[13px] text-white/55">or paste from clipboard</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {screenshot && (
        <div className="mt-3 flex items-start gap-3">
          <img
            src={screenshot.previewUrl || screenshot.url}
            alt=""
            className="max-h-32 rounded-xl border border-white/15"
          />
          <div className="flex flex-col items-start gap-2">
            {screenshot.uploading && (
              <span className="text-[13px] text-white/65">Uploading…</span>
            )}
            <button
              type="button"
              onClick={() => {
                if (screenshot.previewUrl)
                  URL.revokeObjectURL(screenshot.previewUrl)
                setScreenshot(null)
              }}
              style={TRANSITION}
              className={BTN_PLAIN}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-[13px] text-white">{uploadError}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={TRANSITION}
        className={`mt-6 ${BTN_FILLED}`}
      >
        {submitting ? 'Saving…' : 'Add note'}
      </button>
    </form>
  )
}

function FilterTabs({ value, onChange, counts }) {
  return (
    <div
      className="mt-8 flex gap-0.5 rounded-full p-0.5 border border-white/10"
      role="tablist"
      aria-label="Note filter"
    >
      {FILTERS.map((f) => {
        const active = value === f.value
        return (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.value)}
            style={TRANSITION}
            className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[40px] rounded-full text-[13px] cursor-pointer transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/65 hover:text-white'
            }`}
          >
            {f.label}
            <span className={`text-[12px] ${active ? 'text-white/70' : 'text-white/45'}`}>
              {counts[f.value]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function NoteRow({ note, onToggle, onDelete }) {
  const cat = CATEGORIES.find((c) => c.value === note.category)
  const loc = ROOM_LOCATIONS.find((l) => l.value === note.location)
  return (
    <li className={`py-4 ${note.done ? 'opacity-55' : ''}`}>
      <div className="flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.08em]">
        {cat && <span className="text-white/85">{cat.label}</span>}
        {loc && <span className="text-white/55">{loc.label}</span>}
        <span className="ml-auto text-white/55 normal-case tracking-normal">
          {relativeTime(note.createdAt)}
        </span>
      </div>
      <p
        className={`mt-2 text-[15px] leading-relaxed whitespace-pre-wrap ${
          note.done ? 'text-white/70 line-through' : 'text-white/95'
        }`}
      >
        {note.text}
      </p>
      {note.screenshotUrl && (
        <a
          href={note.screenshotUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-xl focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
        >
          <img
            src={note.screenshotUrl}
            alt=""
            className="max-h-40 rounded-xl border border-white/15"
          />
        </a>
      )}
      <div className="mt-3 flex items-center gap-1">
        <button type="button" onClick={onToggle} style={TRANSITION} className={BTN_PLAIN}>
          {note.done ? 'Reopen' : 'Mark done'}
        </button>
        <button type="button" onClick={onDelete} style={TRANSITION} className={BTN_DESTRUCTIVE}>
          Delete
        </button>
      </div>
    </li>
  )
}
