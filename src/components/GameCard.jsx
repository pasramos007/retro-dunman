import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'

export default function GameCard({ game }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/games/${game.id}/edit`)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-600 active:scale-95 transition-all"
    >
      <div className="w-full aspect-[3/4] bg-zinc-800 flex items-center justify-center">
        {game.cover_url ? (
          <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🎮</span>
        )}
      </div>
      <div className="px-2 py-1.5 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-zinc-100 text-xs font-medium leading-tight truncate">{game.title}</p>
          {game.platform && <p className="text-zinc-500 text-xs truncate mt-0.5">{game.platform}</p>}
        </div>
        <Pencil size={11} className="text-zinc-600 shrink-0 mt-0.5" />
      </div>
    </div>
  )
}
