import { supabase } from './supabase'

export async function identifyItem(imageBase64, mimeType) {
  const { data, error } = await supabase.functions.invoke('identify-item', {
    body: { imageBase64, mimeType },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

export async function fetchIGDBData(name, platform, type) {
  const { data, error } = await supabase.functions.invoke('fetch-igdb', {
    body: { name, platform, type },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

export async function getConsoles() {
  const { data, error } = await supabase
    .from('consoles')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getConsolesWithGameCount() {
  const { data, error } = await supabase
    .from('consoles')
    .select('*, games(count)')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getConsole(id) {
  const { data, error } = await supabase
    .from('consoles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getGames(consoleId = null) {
  let query = supabase
    .from('games')
    .select('*, consoles(name, cover_url)')
    .order('title')
  if (consoleId) query = query.eq('console_id', consoleId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function saveConsole({ name, brand, platform, year, igdb_id, cover_url }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('consoles')
    .insert({ name, brand, platform, year, igdb_id, cover_url, user_id: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function saveGame({ title, platform, genre, year, igdb_id, cover_url, console_id }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('games')
    .insert({ title, platform, genre, year, igdb_id, cover_url, console_id: console_id || null, user_id: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteConsole(id) {
  const { error } = await supabase.from('consoles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteGame(id) {
  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
