import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ImagePlus, ArrowLeft, RotateCcw } from 'lucide-react'
import { identifyItem, fetchIGDBData, saveConsole, saveGame, getConsoles } from '../lib/api'

const STEP = { IDLE: 'idle', PREVIEW: 'preview', IDENTIFYING: 'identifying', EDITING: 'editing', SAVING: 'saving' }

async function resizeImage(file, maxDim = 1024) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg', preview: dataUrl })
    }
    img.src = url
  })
}

export default function AddPage() {
  const navigate = useNavigate()
  const cameraRef = useRef()
  const galleryRef = useRef()

  const [step, setStep] = useState(STEP.IDLE)
  const [preview, setPreview] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [igdbData, setIgdbData] = useState(null)
  const [form, setForm] = useState({ type: 'game', name: '', platform: '', brand: '', year: '', genre: '', console_id: '' })
  const [consoles, setConsoles] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getConsoles().then(setConsoles).catch(() => {})
  }, [])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await resizeImage(file)
    setPreview(result.preview)
    setImageData({ base64: result.base64, mimeType: result.mimeType })
    setStep(STEP.PREVIEW)
    e.target.value = ''
  }

  async function handleIdentify() {
    setStep(STEP.IDENTIFYING)
    setError(null)
    try {
      const id = await identifyItem(imageData.base64, imageData.mimeType)

      let igdb = null
      try { igdb = await fetchIGDBData(id.name, id.platform, id.type) } catch {}
      setIgdbData(igdb)

      const platform = id.platform || ''
      const matchedConsole = id.type === 'game'
        ? consoles.find(c => {
            const p = platform.toLowerCase()
            return c.name?.toLowerCase().includes(p) || c.platform?.toLowerCase().includes(p)
          })
        : null

      setForm({
        type: id.type || 'game',
        name: igdb?.name || id.name || '',
        platform,
        brand: id.brand || '',
        year: String(igdb?.year || id.year || ''),
        genre: igdb?.genres?.[0] || '',
        console_id: matchedConsole?.id || '',
      })
      setStep(STEP.EDITING)
    } catch (e) {
      setError(e.message)
      setStep(STEP.PREVIEW)
    }
  }

  async function handleSave() {
    setStep(STEP.SAVING)
    setError(null)
    try {
      const year = parseInt(form.year) || null
      if (form.type === 'console') {
        await saveConsole({ name: form.name, brand: form.brand, platform: form.platform, year, igdb_id: igdbData?.igdb_id || null, cover_url: igdbData?.cover_url || null })
        navigate('/')
      } else {
        await saveGame({ title: form.name, platform: form.platform, genre: form.genre, year, igdb_id: igdbData?.igdb_id || null, cover_url: igdbData?.cover_url || null, console_id: form.console_id || null })
        navigate(form.console_id ? `/consoles/${form.console_id}` : '/games')
      }
    } catch (e) {
      setError(e.message)
      setStep(STEP.EDITING)
    }
  }

  function field(key) {
    return { value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  function reset() {
    setStep(STEP.IDLE)
    setPreview(null)
    setImageData(null)
    setIgdbData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-zinc-100 font-semibold text-lg">Add Item</h2>
      </div>

      <div className="p-4">
        {step === STEP.IDLE && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-zinc-500 text-sm mb-2">Take a photo of a game or console</p>
            <button
              onClick={() => cameraRef.current.click()}
              className="flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl w-full transition-colors"
            >
              <Camera size={20} /> Take Photo
            </button>
            <button
              onClick={() => galleryRef.current.click()}
              className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-6 py-3 rounded-xl w-full transition-colors"
            >
              <ImagePlus size={20} /> Choose from Library
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        )}

        {step === STEP.PREVIEW && (
          <div className="flex flex-col gap-4">
            <img src={preview} alt="Preview" className="w-full rounded-xl object-contain max-h-72 bg-zinc-900" />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleIdentify}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Identify Item
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 py-2 transition-colors"
            >
              <RotateCcw size={16} /> Take Another Photo
            </button>
          </div>
        )}

        {(step === STEP.IDENTIFYING || step === STEP.SAVING) && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">
              {step === STEP.IDENTIFYING ? 'Identifying item…' : 'Saving…'}
            </p>
          </div>
        )}

        {step === STEP.EDITING && (
          <div className="flex flex-col gap-4">
            {igdbData?.cover_url && (
              <img
                src={igdbData.cover_url}
                alt="Cover"
                className="w-28 aspect-[3/4] object-cover rounded-xl mx-auto shadow-xl shadow-black/50"
              />
            )}

            <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
              {['console', 'game'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                    form.type === t ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Field label="Name" {...field('name')} />
            <Field label="Platform" {...field('platform')} />
            {form.type === 'console' && <Field label="Brand" {...field('brand')} />}
            {form.type === 'game' && <Field label="Genre" {...field('genre')} />}
            <Field label="Year" type="number" {...field('year')} />

            {form.type === 'game' && consoles.length > 0 && (
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
              disabled={!form.name.trim()}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl mt-2 transition-colors"
            >
              Save to Library
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-400 text-sm">{label}</label>
      <input
        {...props}
        className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  )
}
