import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { MonitorSmartphone, Gamepad2, Plus } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-2 shrink-0">
        <span className="text-xl">🕹️</span>
        <h1 className="text-zinc-100 font-bold text-lg tracking-tight">Retro Dunman</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex items-center justify-around h-16">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`
          }
        >
          <MonitorSmartphone size={22} />
          <span>Consoles</span>
        </NavLink>

        <button
          onClick={() => navigate('/add')}
          className="bg-violet-600 hover:bg-violet-700 active:scale-95 rounded-full p-3.5 -mt-6 shadow-lg shadow-violet-900/40 transition-all"
        >
          <Plus size={24} className="text-white" />
        </button>

        <NavLink
          to="/games"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`
          }
        >
          <Gamepad2 size={22} />
          <span>Games</span>
        </NavLink>
      </nav>
    </div>
  )
}
