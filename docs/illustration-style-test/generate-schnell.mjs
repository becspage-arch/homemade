#!/usr/bin/env node
// Quick Schnell-tier comparison for Style A. Same six subjects, same
// Style A prefix, but generated with fal-ai/flux/schnell instead of
// fal-ai/flux-pro/v1.1-ultra. Costs roughly £0.01 for the six images.
//
// Output: docs/illustration-style-test/output/style-a-botanical-schnell/

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, 'output/style-a-botanical-schnell')
const LOG = resolve(__dirname, 'generation-log-schnell.md')

const creds = readFileSync(
  'C:/Users/Rebecca/Projects/code/homemade/.env.credentials',
  'utf8',
)
const m = creds.match(/^FAL_KEY=(.+)$/m)
if (!m) {
  console.error('FAL_KEY not found')
  process.exit(1)
}
const FAL_KEY = m[1].trim()

const STYLE_A_PREFIX =
  'Modern botanical illustration in the style of vintage gardening manuals, clean ink linework with delicate watercolour fills, warm muted palette of sage green, linen cream, soft terracotta, and walnut brown, generous white margins on a soft cream background, restrained detail, hand-drawn quality, no photographic realism, no commercial slickness, calm composition, soft natural light implied'

const SUBJECTS = [
  {
    slug: '01-sourdough-loaf',
    description:
      'a round country-style sourdough loaf, golden-brown crust scored with a wheat pattern across the top, sitting on a wire cooling rack, a linen tea towel underneath, soft window light from the left',
  },
  {
    slug: '02-folding-dough',
    description:
      'a pair of hands folding bread dough on a wooden board, dough mid-stretch, flour dusted across the surface, sleeves rolled to the forearms, side-on view, the action caught mid-motion',
  },
  {
    slug: '03-preserving-supplies',
    description:
      'a still life of preserving equipment laid out on a kitchen table: a Kilner jar, a brass kitchen scale with two weights, a glass funnel, a square of muslin folded loosely, a wooden spoon, a small saucer, overhead three-quarter angle',
  },
  {
    slug: '04-rosemary-sprig',
    description:
      'a single sprig of rosemary, leaves and stem detailed, against a plain warm cream background, slight shadow underneath, in the style of a vintage gardening book botanical plate',
  },
  {
    slug: '05-fermentation-diagram',
    description:
      'a labelled cross-section diagram of a jar of fermenting sauerkraut at three different stages of fermentation, shown as three jars side by side, each jar showing the cabbage, the brine line, and the bubble activity, labels in a serif typeface point to the brine line, the bubble layer, and the weighted plate',
  },
  {
    slug: '06-morning-kitchen',
    description:
      'a kitchen counter at morning light, a wooden chopping board with a folded linen cloth on it, a copper pan to one side, a sheet of parchment paper with a dusting of flour, a clear glass of water, the window in the background implied rather than rendered, the light is what matters',
  },
]

const ENDPOINT = 'https://fal.run/fal-ai/flux/schnell'

mkdirSync(OUT, { recursive: true })

const logLines = [
  '# Schnell tier — comparison run\n',
  `Run start: ${new Date().toISOString()}.`,
  'Tool: fal.ai Flux Schnell (the cheap-and-fast Flux variant).',
  'Style: Style A (Modern botanical) — same prefix as the Pro Ultra run.',
  'Purpose: see whether Schnell holds Style A well enough to use for the',
  'cheaper inline-illustrations tier in bulk authoring.\n',
]

let okCount = 0
let failCount = 0

for (const subject of SUBJECTS) {
  const prompt = `${STYLE_A_PREFIX}, ${subject.description}`
  const start = Date.now()
  process.stdout.write(`  ${subject.slug}: `)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9',
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: false,
      }),
    })
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    if (!res.ok) {
      const err = await res.text()
      console.log(`FAIL HTTP ${res.status}: ${err.slice(0, 200)}`)
      logLines.push(`- **${subject.slug}** — FAIL HTTP ${res.status}: ${err.slice(0, 200)}`)
      failCount++
      continue
    }
    const json = await res.json()
    const url = json.images?.[0]?.url
    if (!url) {
      console.log(`FAIL: no URL in response. ${JSON.stringify(json).slice(0, 200)}`)
      failCount++
      continue
    }
    const seed = json.seed
    const imgRes = await fetch(url)
    const buf = Buffer.from(await imgRes.arrayBuffer())
    const path = resolve(OUT, `${subject.slug}.png`)
    writeFileSync(path, buf)
    console.log(`OK in ${elapsed}s, seed ${seed}, ${(buf.length / 1024).toFixed(0)} KB`)
    logLines.push(
      `- **${subject.slug}** — OK. Elapsed ${elapsed}s. Seed \`${seed}\`. ${(buf.length / 1024).toFixed(0)} KB. Saved to \`output/style-a-botanical-schnell/${subject.slug}.png\`.`,
    )
    okCount++
  } catch (e) {
    console.log(`EXCEPTION: ${e.message}`)
    logLines.push(`- **${subject.slug}** — EXCEPTION: ${e.message}`)
    failCount++
  }
}

logLines.push(
  `\nRun end: ${new Date().toISOString()}. OK: ${okCount}. Failed: ${failCount}.\n`,
)
writeFileSync(LOG, logLines.join('\n') + '\n')

console.log(`\nDone. ${okCount}/6 succeeded. Log: generation-log-schnell.md`)
