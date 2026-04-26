import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getGames } from '../lib/api'
import GameCard from '../components/GameCard'

export default function AllGamesPage() {
  const [games, setGames] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <div className="p-4 text-red-400 text-center text-sm">{error}</div>

  const filtered = games.filter(g => g.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-zinc-100 mb-3">
        All Games <span className="text-zinc-500 font-normal text-base">({games.length})</span>
      </h2>
      <SearchBar value={query} onChange={setQuery} placeholder="Filter games…" />
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          {games.length === 0 ? 'No games yet. Tap + to add one.' : 'No games match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {filtered.map(g => <GameCard key={g.id} game={g} />)}
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
