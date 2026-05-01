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

// Button style classes per HIG hierarchy:
// Filled = primary action (highest emphasis)
// Tinted = secondary action (medium emphasis)
// Plain  = tertiary action (low emphasis), still has 44pt hit target
const BTN_FILLED =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none'
const BTN_TINTED =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none'
const BTN_PLAIN =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none'
const BTN_PLAIN_DESTRUCTIVE =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none'

const FIELD =
  'w-full rounded-lg border border-gray-300 bg-white px-4 min-h-[44px] py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400'

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-32 right-4 z-40 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gray-900 px-5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label="Open QA notes"
      >
        Notes
        {openCount > 0 && (
          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-gray-900">
            {openCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close panel backdrop"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside
            className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            style={{ borderLeft: '1px solid rgb(229, 231, 235)' }}
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
                  <p className="mt-4 text-sm text-red-700">{error}</p>
                )}
                {loading && notes.length === 0 ? (
                  <p className="mt-6 text-sm text-gray-700">Loading…</p>
                ) : visibleNotes.length === 0 ? (
                  <p className="mt-6 text-sm text-gray-700">
                    {filter === 'open' && 'No open notes.'}
                    {filter === 'done' && 'No notes marked done yet.'}
                    {filter === 'all' && 'No notes yet.'}
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {visibleNotes.map((note) => (
                      <NoteCard
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
                    className={BTN_PLAIN}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

function PanelHeader({ onClose, onSignOut }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 px-2">Notes</h2>
      <div className="flex items-center gap-1">
        {onSignOut && (
          <button type="button" onClick={onSignOut} className={BTN_PLAIN}>
            Lock
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className={BTN_PLAIN}
          aria-label="Close notes panel"
        >
          Close
        </button>
      </div>
    </header>
  )
}

function PassphraseGate({ onUnlock, loading, error }) {
  const [value, setValue] = useState('')
  return (
    <form
      className="px-6 pt-8"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        onUnlock(value.trim())
      }}
    >
      <p className="text-sm text-gray-700">
        Enter the shared passphrase to view and add notes.
      </p>
      <input
        type="password"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Passphrase"
        className={`mt-4 ${FIELD}`}
        aria-label="Passphrase"
      />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className={`mt-4 ${BTN_FILLED}`}
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
        <legend className="text-sm font-medium text-gray-900 mb-2">
          Category
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={active}
                className={`inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${
                  active
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="block mt-4">
        <span className="text-sm font-medium text-gray-900">Where in the room?</span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`mt-2 ${FIELD}`}
        >
          <option value="">Optional — leave blank if general</option>
          {ROOM_LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block mt-4">
        <span className="text-sm font-medium text-gray-900">Note</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the note?"
          rows={3}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-600 resize-y focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={BTN_TINTED}
        >
          {screenshot ? 'Replace screenshot' : 'Attach screenshot'}
        </button>
        <span className="text-sm text-gray-700">or paste from clipboard</span>
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
            className="max-h-32 rounded-lg border border-gray-300"
          />
          <div className="flex flex-col items-start gap-2">
            {screenshot.uploading && (
              <span className="text-sm text-gray-700">Uploading…</span>
            )}
            <button
              type="button"
              onClick={() => {
                if (screenshot.previewUrl)
                  URL.revokeObjectURL(screenshot.previewUrl)
                setScreenshot(null)
              }}
              className={BTN_PLAIN}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-sm text-red-700">{uploadError}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
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
      className="mt-8 flex gap-1 border-b border-gray-200"
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
            className={`-mb-px inline-flex min-h-[44px] items-center px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${
              active
                ? 'text-gray-900 border-b-2 border-gray-900 font-semibold'
                : 'text-gray-700 hover:text-gray-900 border-b-2 border-transparent font-medium'
            }`}
          >
            {f.label}
            <span className="ml-2 text-gray-700 font-normal">
              {counts[f.value]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function NoteCard({ note, onToggle, onDelete }) {
  const cat = CATEGORIES.find((c) => c.value === note.category)
  const loc = ROOM_LOCATIONS.find((l) => l.value === note.location)
  return (
    <li
      className={`rounded-lg p-4 border ${
        note.done ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {cat && (
          <span className="inline-flex h-6 items-center rounded-full border border-gray-300 px-2 text-gray-800 font-medium">
            {cat.label}
          </span>
        )}
        {loc && (
          <span className="text-gray-700 font-medium">{loc.label}</span>
        )}
        <span
          className="ml-auto text-gray-700"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {relativeTime(note.createdAt)}
        </span>
      </div>
      <p
        className={`mt-3 text-sm whitespace-pre-wrap ${
          note.done ? 'text-gray-700 line-through' : 'text-gray-900'
        }`}
      >
        {note.text}
      </p>
      {note.screenshotUrl && (
        <a
          href={note.screenshotUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none rounded-lg"
        >
          <img
            src={note.screenshotUrl}
            alt=""
            className="max-h-40 rounded-lg border border-gray-300"
          />
        </a>
      )}
      <div className="mt-3 flex items-center gap-1">
        <button type="button" onClick={onToggle} className={BTN_PLAIN}>
          {note.done ? 'Reopen' : 'Mark done'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={BTN_PLAIN_DESTRUCTIVE}
        >
          Delete
        </button>
      </div>
    </li>
  )
}
