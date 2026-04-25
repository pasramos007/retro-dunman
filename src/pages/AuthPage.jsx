import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🕹️</div>
        <h1 className="text-3xl font-bold text-zinc-100">Retro Dunman</h1>
        <p className="text-zinc-400 mt-2">Your retro gaming library</p>
      </div>

      {sent ? (
        <div className="text-center max-w-sm">
          <p className="text-zinc-100 text-lg font-semibold">Check your email!</p>
          <p className="text-zinc-400 mt-2 text-sm">
            We sent a magic link to <span className="text-violet-400">{email}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>
      )}
    </div>
  )
}
