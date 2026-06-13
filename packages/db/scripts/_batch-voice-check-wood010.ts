import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = resolve(__dirname, '../../../docs/wood-natural-craft-bulk-010-briefs')

const ALREADY_UPLOADED = new Set([
  'willow-fruit-bowl',
  'willow-garden-trug',
  'stop-cut-technique',
  'oval-willow-shopping-basket',
])

const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json')).sort()

let errorTotal = 0
let warningTotal = 0
const results: Array<{ file: string; slug: string; errors: number; warnings: number; details: any[] }> = []

for (const file of files) {
  const fullPath = resolve(BRIEFS_DIR, file)
  const json = JSON.parse(readFileSync(fullPath, 'utf-8'))
  const slug = json.slug as string

  if (ALREADY_UPLOADED.has(slug)) {
    console.log(`SKIP (already uploaded): ${file}`)
    continue
  }

  try {
    const out = execSync(
      `npx tsx "${resolve(__dirname, 'voice-check.ts')}" "${fullPath}" --json`,
      { cwd: resolve(__dirname, '..'), encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    const result = JSON.parse(out)
    const errs = result.errors?.length ?? 0
    const warns = result.warnings?.length ?? 0
    errorTotal += errs
    warningTotal += warns
    results.push({ file, slug, errors: errs, warnings: warns, details: result.errors ?? [] })
    if (errs > 0) {
      console.log(`ERROR (${errs}e ${warns}w): ${file}`)
      for (const e of result.errors) {
        console.log(`  - [${e.kind}] ${e.message} @ ${e.path}`)
      }
    } else {
      console.log(`OK (${warns}w): ${file}`)
    }
  } catch (err: any) {
    const out = err.stdout?.toString() ?? ''
    const errOut = err.stderr?.toString() ?? ''
    // voice-check exits non-zero on errors, try to parse output
    try {
      const result = JSON.parse(out)
      const errs = result.errors?.length ?? 0
      const warns = result.warnings?.length ?? 0
      errorTotal += errs
      warningTotal += warns
      results.push({ file, slug, errors: errs, warnings: warns, details: result.errors ?? [] })
      if (errs > 0) {
        console.log(`ERROR (${errs}e ${warns}w): ${file}`)
        for (const e of result.errors) {
          console.log(`  - [${e.kind}] ${e.message} @ ${e.path}`)
        }
      } else {
        console.log(`OK (${warns}w): ${file}`)
      }
    } catch {
      console.log(`PARSE_FAIL: ${file}: ${errOut.slice(0, 100)}`)
      results.push({ file, slug, errors: 1, warnings: 0, details: [{ kind: 'parse-fail', message: errOut.slice(0, 100), path: '' }] })
      errorTotal += 1
    }
  }
}

console.log(`\nSUMMARY: ${errorTotal} total errors, ${warningTotal} total warnings across ${results.length} files`)
const failing = results.filter(r => r.errors > 0)
console.log(`FILES_WITH_ERRORS: ${failing.length}`)
for (const f of failing) {
  console.log(`  ${f.file}: ${f.errors} errors`)
}
