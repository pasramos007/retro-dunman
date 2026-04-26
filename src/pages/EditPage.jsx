import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getConsole, getGame, getConsoles, updateConsole, updateGame, deleteConsole, deleteGame } from '../lib/api'

export default function EditPage({ type }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', platform: '', brand: '', year: '', genre: '', cover_url: '', console_id: '' })
  const [consoles, setConsoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetches = type === 'console'
      ? [getConsole(id)]
      : [getGame(id), getConsoles()]

    Promise.all(fetches)
      .then(([item, cons]) => {
        if (type === 'console') {
          setForm({ name: item.name, platform: item.platform ?? '', brand: item.brand ?? '', year: String(item.year ?? ''), genre: '', cover_url: item.cover_url ?? '', console_id: '' })
        } else {
          setForm({ name: item.title, platform: item.platform ?? '', brand: '', year: String(item.year ?? ''), genre: item.genre ?? '', cover_url: item.cover_url ?? '', console_id: item.console_id ?? '' })
          if (cons) setConsoles(cons)
        }
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id, type])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const year = parseInt(form.year) || null
      if (type === 'console') {
        await updateConsole(id, { name: form.name, brand: form.brand, platform: form.platform, year, cover_url: form.cover_url || null })
        navigate(`/consoles/${id}`)
      } else {
        await updateGame(id, { title: form.name, platform: form.platform, genre: form.genre, year, cover_url: form.cover_url || null, console_id: form.console_id || null })
        navigate(form.console_id ? `/consoles/${form.console_id}` : '/games')
      }
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      if (type === 'console') {
        await deleteConsole(id)
        navigate('/')
      } else {
        await deleteGame(id)
        navigate(-1)
      }
    } catch (e) {
      setError(e.message)
      setSaving(false)
      setConfirmDelete(false)
    }
  }

  function field(key) {
    return { value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-zinc-100 font-semibold text-lg flex-1">
          Edit {type === 'console' ? 'Console' : 'Game'}
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {form.cover_url && (
          <img
            src={form.cover_url}
            alt="Cover"
            className={`mx-auto rounded-xl shadow-xl shadow-black/50 object-cover ${type === 'console' ? 'h-32 max-w-full object-contain' : 'w-28 aspect-[3/4]'}`}
          />
        )}

        <Field label="Artwork URL" {...field('cover_url')} placeholder="https://…" />
        <Field label={type === 'console' ? 'Name' : 'Title'} {...field('name')} />
        <Field label="Platform" {...field('platform')} />
        {type === 'console' && <Field label="Brand" {...field('brand')} />}
        {type === 'game' && <Field label="Genre" {...field('genre')} />}
        <Field label="Year" type="number" {...field('year')} />

        {type === 'game' && consoles.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-sm">Console</label>
            <select
              value={form.console_id}
              onChange={e => setForm(f => ({ ...f, console_id: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">None</option>
              {consoles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        <div className="border-t border-zinc-800 pt-4">
          {confirmDelete ? (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-3 transition-colors"
            >
              <Trash2 size={16} />
              Delete {type === 'console' ? 'Console' : 'Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-400 text-sm">{label}</label>
      <input
        {...props}
        placeholder={placeholder}
        className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  )
}
