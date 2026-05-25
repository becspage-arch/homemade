/**
 * Pick the actual stuck (persistent-fail) titles and call Flux Schnell
 * directly, capturing the full HTTP response body so we can see the
 * exact error message.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

const API = 'https://fal.run/fal-ai/flux/schnell'

const STUCK_TITLES = [
  'Write the email asking for the raise',
  'Write the price you want next to the price you charge',
  'You at the head of the table',
  'Your grandchildren\'s choices made possible by you',
  'Your ideal client walking through the door',
  'Your own account, your own decisions',
  'Zuppa di pesce italiana',
  'Woven coaster set, plain weave',
  'Write what I believe (200 words)',
  'Write tomorrow\'s three priorities, close the notebook',
]

async function tryFlux(title: string): Promise<{ status: number; body: string; ok: boolean }> {
  const key = process.env.FAL_KEY
  if (!key) return { status: 0, body: 'FAL_KEY unset', ok: false }
  const isMindset = title.toLowerCase().includes('write') || title.toLowerCase().includes('visualisation') || title.toLowerCase().includes('account') || title.toLowerCase().includes('client') || title.toLowerCase().includes('grandchildren') || title.toLowerCase().includes('table') || title.toLowerCase().includes('email')
  const prompt = isMindset
    ? `Quiet contemplative still life. ${title} concept. Cream and sage palette. Single candle, open notebook, or hands in soft light as appropriate. No faces. Magazine-quality editorial photography. Natural soft light, linen textures, slow-living atmosphere.`
    : `Editorial slow-living food photography. ${title}. Warm natural light. Cream and sage palette. Linen and parchment textures. Composed on a wooden surface. No people. Shot from above or three-quarter angle as appropriate. Magazine-quality.`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: ctrl.signal,
    })
    const body = await res.text()
    return { status: res.status, body: body.slice(0, 600), ok: res.ok }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { status: 0, body: `fetch-throw: ${msg}`, ok: false }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  for (const title of STUCK_TITLES) {
    const r = await tryFlux(title)
    console.log(`title: "${title}"`)
    console.log(`  http: ${r.status} ok=${r.ok}`)
    console.log(`  body: ${r.body}`)
    console.log('')
  }
}

main()
