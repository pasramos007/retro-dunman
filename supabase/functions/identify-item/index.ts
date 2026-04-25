import Anthropic from 'npm:@anthropic-ai/sdk'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { imageBase64, mimeType } = await req.json()

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `Identify ALL physical retro gaming items visible in this photo. Return ONLY a JSON array where each element represents one item with these fields:
- type: "console" or "game"
- name: exact product name (e.g. "Game Boy", "Tetris")
- platform: gaming platform (e.g. "Game Boy", "NES", "PlayStation")
- brand: manufacturer (e.g. "Nintendo", "Sega", "Sony")
- year: release year as integer or null
- confidence: "high", "medium", or "low"
- notes: condition, variant, or region notes (string or null)

If only one item is visible, return a single-element array.
No markdown fences, no explanation — just the raw JSON array.`,
            },
          ],
        },
      ],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
    const result = JSON.parse(text)

    return new Response(JSON.stringify(Array.isArray(result) ? result : [result]), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
