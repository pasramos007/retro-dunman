import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ImagePlus, ArrowLeft, RotateCcw, ChevronDown, X } from 'lucide-react'
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

function makeItem(identified, igdb, consoles) {
  const platform = identified.platform || ''
  const matchedConsole = identified.type === 'game'
    ? consoles.find(c => {
        const p = platform.toLowerCase()
        return c.name?.toLowerCase().includes(p) || c.platform?.toLowerCase().includes(p)
      })
    : null
  return {
    type: identified.type || 'game',
    name: igdb?.name || identified.name || '',
    platform,
    brand: identified.brand || '',
    year: String(igdb?.year || identified.year || ''),
    genre: igdb?.genres?.[0] || '',
    console_id: matchedConsole?.id || '',
    cover_url: igdb?.cover_url || '',
    igdb_id: igdb?.igdb_id || null,
  }
}

export default function AddPage() {
  const navigate = useNavigate()
  const cameraRef = useRef()
  const galleryRef = useRef()

  const [step, setStep] = useState(STEP.IDLE)
  const [preview, setPreview] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [items, setItems] = useState([])
  const [expandedIdx, setExpandedIdx] = useState(0)
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
      const raw = await identifyItem(imageData.base64, imageData.mimeType)
      const identified = Array.isArray(raw) ? raw : [raw]

      if (identified.length === 0) {
        setError('Could not identify any items. Try a clearer or closer shot.')
        setStep(STEP.PREVIEW)
        return
      }

      // Fetch IGDB data for all items in parallel
      const igdbResults = await Promise.all(
        identified.map(id =>
          fetchIGDBData(id.name, id.platform, id.type).catch(() => null)
        )
      )

      setItems(identified.map((id, i) => makeItem(id, igdbResults[i], consoles)))
      setExpandedIdx(0)
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
      await Promise.all(items.map(item => {
        const year = parseInt(item.year) || null
        if (item.type === 'console') {
          return saveConsole({ name: item.name, brand: item.brand, platform: item.platform, year, igdb_id: item.igdb_id, cover_url: item.cover_url || null })
        } else {
          return saveGame({ title: item.name, platform: item.platform, genre: item.genre, year, igdb_id: item.igdb_id, cover_url: item.cover_url || null, console_id: item.console_id || null })
        }
      }))

      // Navigate: if all games share one console go there, otherwise go to games
      const consoleIds = [...new Set(items.filter(i => i.type === 'game' && i.console_id).map(i => i.console_id))]
      if (consoleIds.length === 1 && items.every(i => i.type === 'game')) {
        navigate(`/consoles/${consoleIds[0]}`)
      } else if (items.every(i => i.type === 'console')) {
        navigate('/')
      } else {
        navigate('/games')
      }
    } catch (e) {
      setError(e.message)
      setStep(STEP.EDITING)
    }
  }

  function updateItem(idx, updates) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item))
  }

  function removeItem(idx) {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (expandedIdx >= next.length) setExpandedIdx(Math.max(0, next.length - 1))
      return next
    })
  }

  function reset() {
    setStep(STEP.IDLE)
    setPreview(null)
    setImageData(null)
    setItems([])
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
            <p className="text-zinc-500 text-sm mb-2">Take a photo of one or more games / consoles</p>
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
              Identify Items
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
              {step === STEP.IDENTIFYING ? 'Identifying items…' : `Saving ${items.length} item${items.length !== 1 ? 's' : ''}…`}
            </p>
          </div>
        )}

        {step === STEP.EDITING && (
          <div className="flex flex-col gap-3">
            <p className="text-zinc-400 text-sm">
              {items.length} item{items.length !== 1 ? 's' : ''} identified — review before saving
            </p>

            {items.map((item, idx) => (
              <ItemCard
                key={idx}
                item={item}
                expanded={expandedIdx === idx}
                onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                onChange={updates => updateItem(idx, updates)}
                onRemove={() => removeItem(idx)}
                consoles={consoles}
              />
            ))}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleSave}
              disabled={items.length === 0 || items.some(i => !i.name.trim())}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl mt-1 transition-colors"
            >
              Save {items.length} item{items.length !== 1 ? 's' : ''} to Library
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ItemCard({ item, expanded, onToggle, onChange, onRemove, consoles }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-12 bg-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
          {item.cover_url
            ? <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover" />
            : <span className="text-lg">{item.type === 'console' ? '🕹️' : '🎮'}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 font-medium text-sm truncate">{item.name || 'Unknown'}</p>
          <p className="text-zinc-500 text-xs truncate">{item.platform}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.type === 'console' ? 'bg-violet-900/60 text-violet-300' : 'bg-zinc-700 text-zinc-300'}`}>
          {item.type}
        </span>
        <button onClick={onToggle} className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors">
          <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={onRemove} className="text-zinc-600 hover:text-red-400 p-1 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-zinc-800 flex flex-col gap-3">
          {item.cover_url && (
            <img src={item.cover_url} alt="Cover" className="w-20 aspect-[3/4] object-cover rounded-lg mx-auto shadow-lg shadow-black/50" />
          )}

          <InlineField label="Artwork URL" value={item.cover_url} onChange={v => onChange({ cover_url: v })} placeholder="https://…" />

          <div className="flex bg-zinc-800 rounded-xl p-1">
            {['console', 'game'].map(t => (
              <button
                key={t}
                onClick={() => onChange({ type: t })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${item.type === t ? 'bg-violet-600 text-white' : 'text-zinc-400'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <InlineField label="Name" value={item.name} onChange={v => onChange({ name: v })} />
          <InlineField label="Platform" value={item.platform} onChange={v => onChange({ platform: v })} />
          {item.type === 'console' && <InlineField label="Brand" value={item.brand} onChange={v => onChange({ brand: v })} />}
          {item.type === 'game' && <InlineField label="Genre" value={item.genre} onChange={v => onChange({ genre: v })} />}
          <InlineField label="Year" value={item.year} type="number" onChange={v => onChange({ year: v })} />

          {item.type === 'game' && consoles.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-xs">Console</label>
              <select
                value={item.console_id}
                onChange={e => onChange({ console_id: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">None</option>
                {consoles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InlineField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-zinc-500 text-xs">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  )
}
