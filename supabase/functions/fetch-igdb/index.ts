const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getTwitchToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  const json = await res.json()
  return json.access_token
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { name, platform, type } = await req.json()

    const clientId = Deno.env.get('IGDB_CLIENT_ID')!
    const clientSecret = Deno.env.get('IGDB_CLIENT_SECRET')!
    const token = await getTwitchToken(clientId, clientSecret)

    const igdbHeaders = {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    }

    const json = { headers: { ...cors, 'Content-Type': 'application/json' } }

    if (type === 'console') {
      const body = `search "${name}"; fields name,summary,first_release_date,platform_logo.image_id; limit 1;`
      const res = await fetch('https://api.igdb.com/v4/platforms', { method: 'POST', headers: igdbHeaders, body })
      const data = await res.json()

      if (!data?.length) return new Response(JSON.stringify({ found: false }), json)

      const item = data[0]
      const coverUrl = item.platform_logo?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_logo_med/${item.platform_logo.image_id}.png`
        : null

      return new Response(JSON.stringify({
        found: true,
        igdb_id: item.id,
        name: item.name,
        summary: item.summary ?? null,
        cover_url: coverUrl,
        year: item.first_release_date ? new Date(item.first_release_date * 1000).getFullYear() : null,
      }), json)
    } else {
      const body = `search "${name}"; fields name,summary,first_release_date,cover.image_id,genres.name,platforms.name; limit 5;`
      const res = await fetch('https://api.igdb.com/v4/games', { method: 'POST', headers: igdbHeaders, body })
      const data = await res.json()

      if (!data?.length) return new Response(JSON.stringify({ found: false }), json)

      // Prefer match where platform name overlaps
      const platformLower = (platform ?? '').toLowerCase()
      const item = data.find((g: any) =>
        g.platforms?.some((p: any) => p.name?.toLowerCase().includes(platformLower))
      ) ?? data[0]

      const coverUrl = item.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.image_id}.jpg`
        : null

      return new Response(JSON.stringify({
        found: true,
        igdb_id: item.id,
        name: item.name,
        summary: item.summary ?? null,
        cover_url: coverUrl,
        year: item.first_release_date ? new Date(item.first_release_date * 1000).getFullYear() : null,
        genres: item.genres?.map((g: any) => g.name) ?? [],
        platforms: item.platforms?.map((p: any) => p.name) ?? [],
      }), json)
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
