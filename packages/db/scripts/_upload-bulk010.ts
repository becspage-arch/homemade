/**
 * Batch upload for fibre-arts-bulk-010 briefs.
 * Calls upload-tutorial.ts sequentially for each file with --status PUBLISHED.
 */

import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BRIEFS_DIR = resolve(__dirname, '../../../docs/fibre-arts-bulk-010-briefs')

const FILES = [
  'plain-weave-floor-loom-sampler.json',
  'tapestry-hatching-and-blending.json',
  'woven-cushion-cover-rigid-heddle.json',
  'backstrap-loom-supplementary-weft-pickup.json',
  'weft-ikat-resist-dyeing-basics.json',
  'woven-curtain-panel-rigid-heddle.json',
  'four-shaft-turned-twill.json',
  'dyeing-with-birch-leaves.json',
  'dyeing-with-yarrow.json',
  'dyeing-with-purple-loosestrife.json',
  'dyeing-with-apple-bark.json',
  'batik-on-wool-with-soy-wax.json',
  'macrame-fruit-bowl.json',
  'macrame-garland.json',
  'macrame-dog-collar.json',
  'macrame-christmas-ornament-set.json',
  'hooked-rug-monogram.json',
  'knotted-pile-rug-turkish-knot.json',
]

let ok = 0
let failed = 0
const failures: string[] = []

for (const file of FILES) {
  const absPath = resolve(BRIEFS_DIR, file)
  process.stdout.write(`Uploading ${file}... `)
  try {
    execSync(
      `pnpm exec tsx scripts/upload-tutorial.ts "${absPath}" --status PUBLISHED`,
      { cwd: resolve(__dirname, '..'), stdio: 'pipe' }
    )
    console.log('OK')
    ok++
  } catch (err: any) {
    console.log('FAILED')
    console.error(err.stderr?.toString() ?? err.message)
    failed++
    failures.push(file)
  }
}

console.log(`\n--- Upload Summary ---`)
console.log(`Uploaded: ${ok}/${FILES.length}`)
if (failures.length > 0) {
  console.log(`Failed:`)
  for (const f of failures) console.log(`  ${f}`)
  process.exit(1)
}
