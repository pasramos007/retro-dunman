import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import ConsolesPage from './pages/ConsolesPage'
import AllGamesPage from './pages/AllGamesPage'
import ConsoleGamesPage from './pages/ConsoleGamesPage'
import AddPage from './pages/AddPage'
import EditPage from './pages/EditPage'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <AuthPage />} />
        <Route element={session ? <Layout /> : <Navigate to="/auth" />}>
          <Route path="/" element={<ConsolesPage />} />
          <Route path="/games" element={<AllGamesPage />} />
          <Route path="/consoles/:id" element={<ConsoleGamesPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/consoles/:id/edit" element={<EditPage type="console" />} />
          <Route path="/games/:id/edit" element={<EditPage type="game" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
