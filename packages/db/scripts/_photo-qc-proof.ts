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
const ULTRA = 'https://fal.run/fal-ai/flux-pro/v1.1-ultra'

const STYLE =
  'Editorial slow-living food photography, natural soft window light, shallow depth of field, ' +
  'styled on rustic ceramic and linen, warm appetising tones, photorealistic, high detail. ' +
  'No text, no words, no watermark, no logo, no brand packaging.'

const C = 'https://homemade.education/cdn-cgi/image/width=700,format=auto/https://media.homemade.education'

const DISHES = [
  { slug: 'trofie-al-pesto', title: 'Trofie al Pesto',
    before: `${C}/tutorials/hero-fill/997d7238-be5f-46ef-8037-bc31fe1ecf5f.jpg`,
    subject: 'a bowl of trofie pasta, short hand-rolled twisted Ligurian pasta, coated in vivid fresh green basil pesto with pine nuts and grated parmesan' },
  { slug: 'mulligatawny-soup', title: 'Mulligatawny Soup',
    before: `${C}/tutorials/hero-fill/c5358b10-9fb4-4484-be08-4da49106ffbe.jpg`,
    subject: 'a bowl of mulligatawny soup, a golden spiced Anglo-Indian curried lentil and chicken soup, garnished with coriander and a swirl of cream, rice on the side' },
  { slug: 'gougeres-gruyere', title: 'Gruyere gougeres',
    before: `${C}/tutorials/hero-fill/b19fcf50-b995-4cfa-86d1-c92c7af72e28.jpg`,
    subject: 'a plate of golden gougères, light airy French gruyère cheese choux pastry puffs, freshly baked' },
  { slug: 'pane-di-altamura', title: 'Pane di Altamura',
    before: `${C}/tutorials/relevance-regen/e0f5155c-1da2-4c7c-9fbc-f6718516cafd.jpg`,
    subject: 'a rustic round loaf of Pane di Altamura, traditional Italian durum-wheat semolina bread with a thick deeply golden crust and pale yellow crumb, one slice cut' },
  { slug: 'salmon-fishcakes', title: 'Salmon Fishcakes',
    before: `${C}/tutorials/hero-fill/de663329-bda7-444f-8aea-077f99a9bfd6.jpg`,
    subject: 'golden pan-fried salmon fishcakes with a crisp breadcrumb crust, served with a lemon wedge and fresh dill' },
  { slug: 'caneles-de-bordeaux', title: 'Canelés de Bordeaux',
    before: `${C}/tutorials/relevance-regen/fc294d4d-b9df-4fa1-b245-ef590abc8407.jpg`,
    subject: 'several canelés de Bordeaux, small fluted French cakes with a dark caramelised mahogany-brown crust and soft custard interior, one cut open' },
  { slug: 'new-york-cheesecake', title: 'New York cheesecake',
    before: `${C}/tutorials/hero-fill/f1e0ad8e-fb5c-49bb-b17b-ab8233afac96.jpg`,
    subject: 'a slice of classic New York baked cheesecake with a smooth sour-cream top and a golden graham-cracker base, plain, on a white plate' },
  { slug: 'kuku-sibzamini', title: 'Kuku sibzamini',
    before: `${C}/tutorials/hero-fill/76151fad-f902-4c83-acbb-0277ba4db276.jpg`,
    subject: 'kuku sibzamini, Persian potato and egg patties, golden shallow-fried discs garnished with fresh herbs, on a plate' },
  { slug: 'peking-duck', title: 'Peking Duck',
    before: `${C}/tutorials/hero-fill/70def400-78a8-4a02-b4fa-f3d0f3b31ed7.jpg`,
    subject: 'Peking duck, glossy lacquered roast duck with crisp mahogany skin, sliced and arranged with thin pancakes, spring onion strips and hoisin sauce' },
  { slug: 'barley-sugar', title: 'Barley sugar',
    before: `${C}/tutorials/relevance-regen/39e75019-62a3-4945-aa76-1282a665b340.jpg`,
    subject: 'traditional barley sugar sweets, twisted translucent amber-gold hard candy sticks, a few scattered on parchment' },
]

async function genUltra(prompt: string): Promise<string> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY missing')
  const res = await fetch(ULTRA, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '3:2',
      num_images: 1,
      output_format: 'jpeg',
      safety_tolerance: '2',
      enable_safety_checker: true,
    }),
  })
  if (!res.ok) throw new Error(`Ultra HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = (await res.json()) as any
  const url = data?.images?.[0]?.url
  if (!url) throw new Error('Ultra returned no image')
  return url
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const results: any[] = []
  for (const d of DISHES) {
    const prompt = `${d.subject}. ${STYLE}`
    try {
      const afterUrl = await genUltra(prompt)
      const bytes = Buffer.from(await (await fetch(afterUrl)).arrayBuffer())
      const file = `AFTER_${d.slug}.jpg`
      writeFileSync(resolve(OUT, file), bytes)
      results.push({ slug: d.slug, title: d.title, before: d.before, afterUrl, afterFile: file })
      console.log(`OK  ${d.title}`)
    } catch (e: any) {
      results.push({ slug: d.slug, title: d.title, before: d.before, error: String(e?.message || e) })
      console.log(`ERR ${d.title}: ${e?.message || e}`)
    }
  }
  writeFileSync(resolve(OUT, 'proof-results.json'), JSON.stringify(results, null, 2))
  console.log(`\nWrote ${results.length} results -> ${resolve(OUT, 'proof-results.json')}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
