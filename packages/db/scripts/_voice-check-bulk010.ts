/**
 * Batch voice-check for fibre-arts-bulk-010 briefs.
 * Runs voice-check-lib on all 40 JSON files and reports failures.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVoiceCheck, exitCodeFor } from './voice-check-lib.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Navigate from packages/db/scripts/ up to repo root, then into docs/
const BRIEFS_DIR = resolve(__dirname, '../../../docs/fibre-arts-bulk-010-briefs')

const FILES = [
  'wet-felted-wine-bottle-cover.json',
  'wet-felted-doorstop.json',
  'wet-felted-glasses-case.json',
  'wet-felted-laptop-sleeve.json',
  'needle-felted-wolf.json',
  'needle-felted-horse.json',
  'needle-felted-wren.json',
  'needle-felted-kingfisher.json',
  'wet-felted-shopping-bag.json',
  'making-pre-felt-sheets.json',
  'wet-felted-nuno-cowl.json',
  'needle-felted-landscape-picture.json',
  'spinning-herdwick-fleece.json',
  'spinning-icelandic-dual-coat-fibre.json',
  'spinning-for-weaving-warp.json',
  'plying-from-centre-pull-ball.json',
  'spinning-fine-weight-for-lace.json',
  'spinning-cheviot-wool.json',
  'making-a-spindle-cop.json',
  'fibre-blending-for-colour-effect.json',
  'plain-weave-floor-loom-sampler.json',
  'tapestry-hatching-and-blending.json',
  'woven-rya-knot-wall-hanging.json',
  'woven-cushion-cover-rigid-heddle.json',
  'backstrap-loom-supplementary-weft-pickup.json',
  'weft-ikat-resist-dyeing-basics.json',
  'woven-curtain-panel-rigid-heddle.json',
  'four-shaft-turned-twill.json',
  'dyeing-with-birch-leaves.json',
  'dyeing-with-yarrow.json',
  'dyeing-with-purple-loosestrife.json',
  'dyeing-with-apple-bark.json',
  'natural-dye-journal-and-record-keeping.json',
  'batik-on-wool-with-soy-wax.json',
  'macrame-fruit-bowl.json',
  'macrame-garland.json',
  'macrame-dog-collar.json',
  'macrame-christmas-ornament-set.json',
  'hooked-rug-monogram.json',
  'knotted-pile-rug-turkish-knot.json',
]

let totalErrors = 0
let totalWarnings = 0
const failures: string[] = []

for (const file of FILES) {
  const fullPath = resolve(BRIEFS_DIR, file)
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(fullPath, 'utf-8'))
  } catch (e) {
    console.error(`PARSE ERROR: ${file}`)
    failures.push(file)
    continue
  }

  const report = runVoiceCheck(raw)
  const code = exitCodeFor(report)
  totalErrors += report.errors.length
  totalWarnings += report.warnings.length

  if (code === 2) {
    console.error(`ERROR  [${file}]`)
    for (const f of report.errors) {
      console.error(`  ✗ ${f.kind}: ${f.message} at ${f.path}`)
    }
    failures.push(file)
  } else if (code === 1) {
    console.warn(`WARN   [${file}]`)
    for (const f of report.warnings) {
      console.warn(`  ⚠ ${f.kind}: ${f.message} at ${f.path}`)
    }
  } else {
    console.log(`OK     [${file}]`)
  }
}

console.log(`\n--- Summary ---`)
console.log(`Files: ${FILES.length}`)
console.log(`Total errors: ${totalErrors}`)
console.log(`Total warnings: ${totalWarnings}`)
console.log(`Files with errors: ${failures.length}`)
if (failures.length > 0) {
  console.log(`Failed files:`)
  for (const f of failures) console.log(`  ${f}`)
  process.exit(2)
}
