export default function GameCard({ game }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 active:scale-95 transition-all">
      <div className="w-full aspect-[3/4] bg-zinc-800 flex items-center justify-center">
        {game.cover_url ? (
          <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🎮</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-zinc-100 text-xs font-medium leading-tight truncate">{game.title}</p>
        {game.platform && <p className="text-zinc-500 text-xs truncate mt-0.5">{game.platform}</p>}
      </div>
    </div>
  )
}
