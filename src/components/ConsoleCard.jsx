import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'

export default function ConsoleCard({ console: item, onClick }) {
  const navigate = useNavigate()
  const gameCount = item.games?.[0]?.count ?? 0

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-600 active:scale-95 transition-all"
    >
      <div className="w-full aspect-[4/3] bg-zinc-800 flex items-center justify-center p-4">
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-4xl">🕹️</span>
        )}
      </div>
      <div className="px-2.5 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-zinc-100 font-semibold text-sm leading-tight truncate">{item.name}</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {gameCount} game{gameCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/consoles/${item.id}/edit`) }}
          className="text-zinc-600 hover:text-zinc-300 p-1 -mr-0.5 shrink-0 transition-colors"
        >
          <Pencil size={13} />
        </button>
      </div>
    </div>
  )
}
