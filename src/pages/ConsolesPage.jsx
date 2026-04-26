import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getConsolesWithGameCount } from '../lib/api'
import ConsoleCard from '../components/ConsoleCard'

export default function ConsolesPage() {
  const [consoles, setConsoles] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getConsolesWithGameCount()
      .then(setConsoles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <div className="p-4 text-red-400 text-center text-sm">{error}</div>

  const filtered = consoles.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-zinc-100 mb-3">Consoles</h2>
      <SearchBar value={query} onChange={setQuery} placeholder="Filter consoles…" />
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          {consoles.length === 0 ? 'No consoles yet. Tap + to add one.' : 'No consoles match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-3">
          {filtered.map(c => (
            <ConsoleCard key={c.id} console={c} onClick={() => navigate(`/consoles/${c.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
