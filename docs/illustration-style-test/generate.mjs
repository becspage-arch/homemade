#!/usr/bin/env node
// Generate the 24-image illustration style test grid via fal.ai Flux 1.1 Pro Ultra.
//
// 4 candidate styles (A botanical, B pencil+wash, C flat, D etching)
//   × 6 subjects (loaf, dough, supplies, rosemary, diagram, scene)
//   = 24 images
//
// Saves PNGs to docs/illustration-style-test/output/<style>/<subject>.png.
// Logs every cell to generation-log.md as it runs.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Script lives in docs/illustration-style-test/. Output and log are siblings.
const OUT = resolve(__dirname, 'output')
const LOG = resolve(__dirname, 'generation-log.md')

// --- Read fal.ai key from gitignored credentials file -----------------------

const credsPath = 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials'
const creds = readFileSync(credsPath, 'utf8')
const m = creds.match(/^FAL_KEY=(.+)$/m)
if (!m) {
  console.error('FAL_KEY not found in', credsPath)
  process.exit(1)
}
const FAL_KEY = m[1].trim()

// --- The four candidate style prefixes (verbatim from styles.md) -----------

const STYLES = [
  {
    id: 'A',
    folder: 'style-a-botanical',
    label: 'Modern botanical',
    prefix:
      'Modern botanical illustration in the style of vintage gardening manuals, clean ink linework with delicate watercolour fills, warm muted palette of sage green, linen cream, soft terracotta, and walnut brown, generous white margins on a soft cream background, restrained detail, hand-drawn quality, no photographic realism, no commercial slickness, calm composition, soft natural light implied',
  },
  {
    id: 'B',
    folder: 'style-b-pencil-wash',
    label: 'Editorial pencil + wash',
    prefix:
      'Editorial illustration in soft pencil outline with light watercolour wash, palette of sage green, linen cream, warm taupe, honey, and a single accent of terracotta or dusty blush, hand-lettered details where labels appear, the quality of a mid-twentieth-century domestic manual brought up to date, restrained and unhurried composition, visible paper texture, no photographic realism, no flat vector',
  },
  {
    id: 'C',
    folder: 'style-c-flat',
    label: 'Flat editorial',
    prefix:
      'Flat editorial illustration with bold simplified shapes, limited palette of sage green, linen cream, warm taupe, and a single warm accent of terracotta, no outlines or very fine outlines, matte paper texture, contemporary feel without being corporate, no gradients, no photographic detail, no shiny vector look, calm and warm composition',
  },
  {
    id: 'D',
    folder: 'style-d-etching',
    label: 'Etching / engraving',
    prefix:
      'Fine etching and engraving style illustration with detailed cross-hatching, monochrome warm walnut brown ink on cream paper, with a single accent of sage green, the quality of a 19th-century botanical herbal or technical manual, restrained classical composition, shading via hatching only, no gradient shading, no photographic realism, no flat vector look',
  },
]

// --- The six test subjects (verbatim from subjects.md) ---------------------

const SUBJECTS = [
  {
    slug: '01-sourdough-loaf',
    label: 'Finished food item — sourdough loaf',
    description:
      'a round country-style sourdough loaf, golden-brown crust scored with a wheat pattern across the top, sitting on a wire cooling rack, a linen tea towel underneath, soft window light from the left',
  },
  {
    slug: '02-folding-dough',
    label: 'Technique mid-action — folding bread dough',
    description:
      'a pair of hands folding bread dough on a wooden board, dough mid-stretch, flour dusted across the surface, sleeves rolled to the forearms, side-on view, the action caught mid-motion',
  },
  {
    slug: '03-preserving-supplies',
    label: 'Still life — preserving supplies',
    description:
      'a still life of preserving equipment laid out on a kitchen table: a Kilner jar, a brass kitchen scale with two weights, a glass funnel, a square of muslin folded loosely, a wooden spoon, a small saucer, overhead three-quarter angle',
  },
  {
    slug: '04-rosemary-sprig',
    label: 'Botanical ingredient — rosemary sprig',
    description:
      'a single sprig of rosemary, leaves and stem detailed, against a plain warm cream background, slight shadow underneath, in the style of a vintage gardening book botanical plate',
  },
  {
    slug: '05-fermentation-diagram',
    label: 'Diagram — fermentation stages',
    description:
      'a labelled cross-section diagram of a jar of fermenting sauerkraut at three different stages of fermentation, shown as three jars side by side, each jar showing the cabbage, the brine line, and the bubble activity, labels in a serif typeface point to the brine line, the bubble layer, and the weighted plate',
  },
  {
    slug: '06-morning-kitchen',
    label: 'Scene — kitchen counter at morning light',
    description:
      'a kitchen counter at morning light, a wooden chopping board with a folded linen cloth on it, a copper pan to one side, a sheet of parchment paper with a dusting of flour, a clear glass of water, the window in the background implied rather than rendered, the light is what matters',
  },
]

// --- Generation helpers ----------------------------------------------------

const ENDPOINT = 'https://fal.run/fal-ai/flux-pro/v1.1-ultra'

async function generateOne(style, subject) {
  const prompt = `${style.prefix}, ${subject.description}`
  const start = Date.now()
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_images: 1,
      enable_safety_checker: false,
    }),
  })
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  if (!res.ok) {
    const errText = await res.text()
    return { ok: false, elapsed, status: res.status, error: errText.slice(0, 300) }
  }
  const json = await res.json()
  const url = json.images?.[0]?.url
  if (!url) return { ok: false, elapsed, status: res.status, error: 'no image URL in response' }
  const seed = json.seed
  // Download the image
  const imgRes = await fetch(url)
  if (!imgRes.ok) {
    return { ok: false, elapsed, status: imgRes.status, error: `download failed: ${imgRes.statusText}` }
  }
  const buf = Buffer.from(await imgRes.arrayBuffer())
  const dir = resolve(OUT, style.folder)
  mkdirSync(dir, { recursive: true })
  const path = resolve(dir, `${subject.slug}.png`)
  writeFileSync(path, buf)
  return { ok: true, elapsed, seed, url, bytes: buf.length, path }
}

// --- Run all 24 cells, four styles in parallel per subject ------------------

const logLines = []
logLines.push('# Generation log\n')
logLines.push(
  `Run start: ${new Date().toISOString()}. Tool: fal.ai (Flux 1.1 Pro Ultra). Aspect: 16:9. Output: PNG.\n`,
)
logLines.push(
  'Each cell = one style × one subject. Prompt = style prefix + ", " + subject description.\n',
)

let cellCount = 0
let okCount = 0
let failCount = 0

for (const subject of SUBJECTS) {
  console.log(`\n--- Subject ${subject.slug} (${subject.label}) ---`)
  logLines.push(`\n## ${subject.slug} — ${subject.label}\n`)
  logLines.push('```')
  logLines.push(`Subject description: ${subject.description}`)
  logLines.push('```\n')

  // Run all four styles in parallel for this subject
  const results = await Promise.all(
    STYLES.map((style) => generateOne(style, subject).then((r) => ({ style, r }))),
  )

  for (const { style, r } of results) {
    cellCount++
    if (r.ok) {
      okCount++
      console.log(`  ${style.id} (${style.label}): OK in ${r.elapsed}s, seed ${r.seed}`)
      logLines.push(
        `- **Style ${style.id} (${style.label})** — OK. Elapsed ${r.elapsed}s. Seed \`${r.seed}\`. Saved to \`output/${style.folder}/${subject.slug}.png\` (${(r.bytes / 1024).toFixed(0)} KB).`,
      )
    } else {
      failCount++
      console.log(`  ${style.id} (${style.label}): FAIL ${r.status}: ${r.error}`)
      logLines.push(
        `- **Style ${style.id} (${style.label})** — FAIL. HTTP ${r.status}. ${r.error}`,
      )
    }
  }
}

logLines.push(
  `\n---\n\nRun end: ${new Date().toISOString()}. Cells: ${cellCount}. OK: ${okCount}. Failed: ${failCount}.\n`,
)

writeFileSync(LOG, logLines.join('\n') + '\n')
console.log(
  `\nDone. ${okCount}/${cellCount} succeeded. Log: docs/illustration-style-test/generation-log.md`,
)
if (failCount > 0) process.exit(1)
