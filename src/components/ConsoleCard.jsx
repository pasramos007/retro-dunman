export default function ConsoleCard({ console: item, onClick }) {
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
      <div className="p-2.5">
        <p className="text-zinc-100 font-semibold text-sm leading-tight truncate">{item.name}</p>
        <p className="text-zinc-500 text-xs mt-0.5">
          {gameCount} game{gameCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
