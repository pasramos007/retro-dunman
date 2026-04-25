import { useEffect, useState } from 'react'
import { getGames } from '../lib/api'
import GameCard from '../components/GameCard'

export default function AllGamesPage() {
  const [games, setGames] = useState([])
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-zinc-100 mb-4">All Games</h2>
      {games.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">No games yet. Tap + to add one.</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {games.map(g => <GameCard key={g.id} game={g} />)}
        </div>
      )}
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
