/**
 * Quick re-validation: every PUBLISHED garden tutorial JSON file still
 * passes `validateInput` after the garden cleanup A changes.
 *
 * Reads packages/db/scripts/phase-1-content/garden/*.json and runs the
 * in-memory validator. The Species lookup in upload-tutorial.ts isn't
 * exercised here (no DB), but `validateInput` does cover the new
 * plantSlug rules.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

import { validateInput, type TutorialUploadInput } from './upload-tutorial-types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, 'phase-1-content', 'garden')

const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
let failed = 0

for (const f of files) {
  const path = resolve(dir, f)
  const raw = readFileSync(path, 'utf-8')
  const input = JSON.parse(raw) as TutorialUploadInput
  try {
    validateInput(input)
    console.log(`✓ ${f.padEnd(40)} -> PASS`)
  } catch (err) {
    failed += 1
    console.log(`✗ ${f.padEnd(40)} -> REJECT :: ${(err as Error).message}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} file(s) failed.`)
  process.exit(1)
}
console.log('\nAll PUBLISHED garden tutorials still pass validation.')
