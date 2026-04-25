import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConsolesWithGameCount } from '../lib/api'
import ConsoleCard from '../components/ConsoleCard'

export default function ConsolesPage() {
  const [consoles, setConsoles] = useState([])
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
  if (error) return <ErrorMsg message={error} />

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-zinc-100 mb-4">Consoles</h2>
      {consoles.length === 0 ? (
        <EmptyState message="No consoles yet. Tap + to add one." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {consoles.map(c => (
            <ConsoleCard key={c.id} console={c} onClick={() => navigate(`/consoles/${c.id}`)} />
          ))}
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

function ErrorMsg({ message }) {
  return <div className="p-4 text-red-400 text-center text-sm">{message}</div>
}

function EmptyState({ message }) {
  return <div className="text-center py-20 text-zinc-500 text-sm">{message}</div>
}
