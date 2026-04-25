import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getConsole, getGames } from '../lib/api'
import GameCard from '../components/GameCard'

export default function ConsoleGamesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [console_, setConsole] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getConsole(id), getGames(id)])
      .then(([c, g]) => { setConsole(c); setGames(g) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        {console_?.cover_url ? (
          <div className="w-full h-48 bg-zinc-800 flex items-center justify-center p-6">
            <img src={console_.cover_url} alt={console_.name} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
            <span className="text-6xl">🕹️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-sm p-2 rounded-full"
        >
          <ArrowLeft size={20} className="text-zinc-100" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-zinc-100">{console_?.name}</h2>
          <p className="text-zinc-400 text-sm">
            {[console_?.brand, console_?.year].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-zinc-300 font-semibold mb-3">
          Games <span className="text-zinc-500 font-normal">({games.length})</span>
        </h3>
        {games.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No games for this console yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {games.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </div>
    </div>
  )
}
