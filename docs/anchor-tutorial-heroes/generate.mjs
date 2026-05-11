#!/usr/bin/env node
// Generate the hero illustrations for the two anchor tutorials defined in
// docs/anchor-tutorial-briefs.md. Style A, Pro Ultra, 16:9. Saves PNGs
// to this folder. Roughly £0.10 total.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
mkdirSync(OUT, { recursive: true })

const FAL_KEY = readFileSync(
  'C:/Users/Rebecca/Projects/code/homemade/.env.credentials',
  'utf8',
).match(/^FAL_KEY=(.+)$/m)[1].trim()

const STYLE_A_LOCKED =
  'Modern botanical illustration in the style of vintage gardening manuals, clean ink linework with delicate watercolour fills, warm muted palette of sage green, linen cream, soft terracotta, and walnut brown, generous white margins on a soft cream background, restrained detail, hand-drawn quality, no photographic realism, no commercial slickness, calm composition, soft natural light implied, no text, no letters, no writing, no labels on the food itself'

const HEROES = [
  {
    slug: 'bechamel-hero',
    description:
      'a still life of a small saucepan on a warm cream cloth, a wooden spoon laid across the rim, a milk jug just behind, a halved nutmeg and a small brass grater in the front corner, soft directional window light from the left, the sauce in the pan ivory not yellow',
  },
  {
    slug: 'strawberry-jam-hero',
    description:
      'a linen tea towel laid across a kitchen table in afternoon light, three jars of finished strawberry jam, deep ruby colour, slightly opaque with whole strawberry halves visible inside, a sprig of strawberry leaves to the side, a wooden spoon streaked with jam laid across one jar rim, a small lemon half, cream and sage palette with the jam red as the warm accent',
  },
]

for (const h of HEROES) {
  process.stdout.write(`  ${h.slug}: `)
  const start = Date.now()
  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `${STYLE_A_LOCKED}, ${h.description}`,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_images: 1,
      enable_safety_checker: false,
    }),
  })
  if (!res.ok) {
    console.log(`FAIL ${res.status}: ${(await res.text()).slice(0, 200)}`)
    continue
  }
  const json = await res.json()
  const url = json.images?.[0]?.url
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  writeFileSync(resolve(OUT, `${h.slug}.png`), buf)
  console.log(
    `OK in ${((Date.now() - start) / 1000).toFixed(1)}s, seed ${json.seed}, ${(buf.length / 1024).toFixed(0)} KB`,
  )
}
