#!/usr/bin/env node
// One Style A image on Flux 1.1 Pro standard (the tier below Pro Ultra)
// for a side-by-side cost-vs-quality check.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, 'output/style-a-botanical-pro-standard')
mkdirSync(OUT, { recursive: true })

const creds = readFileSync(
  'C:/Users/Rebecca/Projects/code/homemade/.env.credentials',
  'utf8',
)
const FAL_KEY = creds.match(/^FAL_KEY=(.+)$/m)[1].trim()

const PREFIX =
  'Modern botanical illustration in the style of vintage gardening manuals, clean ink linework with delicate watercolour fills, warm muted palette of sage green, linen cream, soft terracotta, and walnut brown, generous white margins on a soft cream background, restrained detail, hand-drawn quality, no photographic realism, no commercial slickness, calm composition, soft natural light implied'

const SUBJECTS = [
  {
    slug: '04-rosemary-sprig',
    description:
      'a single sprig of rosemary, leaves and stem detailed, against a plain warm cream background, slight shadow underneath, in the style of a vintage gardening book botanical plate',
  },
  {
    slug: '01-sourdough-loaf',
    description:
      'a round country-style sourdough loaf, golden-brown crust scored with a wheat pattern across the top, sitting on a wire cooling rack, a linen tea towel underneath, soft window light from the left',
  },
]

for (const s of SUBJECTS) {
  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `${PREFIX}, ${s.description}`,
      image_size: 'landscape_16_9',
      num_images: 1,
      enable_safety_checker: false,
    }),
  })
  console.log(s.slug, res.status)
  const json = await res.json()
  if (!json.images?.[0]?.url) {
    console.log('  fail:', JSON.stringify(json).slice(0, 200))
    continue
  }
  const buf = Buffer.from(await (await fetch(json.images[0].url)).arrayBuffer())
  writeFileSync(resolve(OUT, `${s.slug}.png`), buf)
  console.log(`  saved ${(buf.length / 1024).toFixed(0)} KB, seed ${json.seed}`)
}
