import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

const OUT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-sample'
const STYLE =
  'Editorial slow-living food photography, natural soft window light, shallow depth of field, ' +
  'styled on rustic ceramic and linen, warm appetising tones, photorealistic, high detail. ' +
  'No text, no words, no watermark, no logo, no brand packaging.'

const DISHES = [
  { slug: 'trofie-al-pesto', subject: 'a bowl of trofie pasta, short hand-rolled twisted Ligurian pasta, coated in vivid fresh green basil pesto with pine nuts and grated parmesan' },
  { slug: 'caneles-de-bordeaux', subject: 'several canelés de Bordeaux, small fluted French cakes with a dark caramelised mahogany-brown crust and soft custard interior, one cut open' },
  { slug: 'peking-duck', subject: 'Peking duck, glossy lacquered roast duck with crisp mahogany skin, sliced and arranged with thin pancakes, spring onion strips and hoisin sauce' },
]

async function call(endpoint: string, body: any): Promise<string> {
  const key = process.env.FAL_KEY
  const res = await fetch(`https://fal.run/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = (await res.json()) as any
  const url = data?.images?.[0]?.url
  if (!url) throw new Error(`${endpoint} no image`)
  return url
}

const TIERS: Record<string, (p: string) => Promise<string>> = {
  schnell: (p) => call('fal-ai/flux/schnell', { prompt: p, image_size: { width: 1200, height: 800 }, num_inference_steps: 4, num_images: 1, enable_safety_checker: true }),
  pro: (p) => call('fal-ai/flux-pro/v1.1', { prompt: p, image_size: { width: 1200, height: 800 }, num_images: 1, safety_tolerance: '2', output_format: 'jpeg', enable_safety_checker: true }),
  ultra: (p) => call('fal-ai/flux-pro/v1.1-ultra', { prompt: p, aspect_ratio: '3:2', num_images: 1, safety_tolerance: '2', output_format: 'jpeg', enable_safety_checker: true }),
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  for (const d of DISHES) {
    const prompt = `${d.subject}. ${STYLE}`
    for (const tier of Object.keys(TIERS)) {
      try {
        const url = await TIERS[tier](prompt)
        const bytes = Buffer.from(await (await fetch(url)).arrayBuffer())
        writeFileSync(resolve(OUT, `TIER_${tier}_${d.slug}.jpg`), bytes)
        console.log(`OK  ${tier.padEnd(8)} ${d.slug}`)
      } catch (e: any) {
        console.log(`ERR ${tier.padEnd(8)} ${d.slug}: ${e?.message || e}`)
      }
    }
  }
  console.log('done')
}
main().catch((e) => { console.error(e); process.exit(1) })
