/**
 * _upload-blanket-batch.ts
 * Uploads all JSON briefs in docs/knitting-bulk-003-blanket-briefs/ as PUBLISHED.
 * Runs sequentially; prints pass/fail per file with 3-retry cap per file.
 *
 * Run: pnpm --filter @homemade/db exec tsx scripts/_upload-blanket-batch.ts
 */

import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO = resolve(process.cwd(), '..', '..')
const DIR = join(REPO, 'docs', 'knitting-bulk-003-blanket-briefs')
const SCRIPT = join(process.cwd(), 'scripts', 'upload-tutorial.ts')

const files = readdirSync(DIR)
  .filter(f => f.endsWith('.json'))
  .sort()

let passed = 0
let failed = 0
const failures: string[] = []

for (const file of files) {
  const abs = join(DIR, file)
  let ok = false
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      execSync(
        `pnpm exec tsx "${SCRIPT}" "${abs}" --status PUBLISHED`,
        { stdio: 'pipe', env: { ...process.env } },
      )
      ok = true
      break
    } catch (e: unknown) {
      const msg = e instanceof Error ? (e as NodeJS.ErrnoException & { stderr?: Buffer; stdout?: Buffer }).stderr?.toString() ?? e.message : String(e)
      if (attempt === 3) {
        console.error(`  FAIL [${file}] after 3 attempts: ${msg.slice(0, 300)}`)
      } else {
        console.log(`  retry ${attempt}/3 for ${file}`)
      }
    }
  }
  if (ok) {
    passed++
    console.log(`  OK   ${file}`)
  } else {
    failed++
    failures.push(file)
  }
}

console.log(`\nResults: ${passed} uploaded, ${failed} failed`)
if (failures.length) {
  console.log('Failed files:')
  failures.forEach(f => console.log(`  ${f}`))
  process.exit(1)
}
