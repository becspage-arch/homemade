/**
 * Voice-check every file in the batch directory and report violators.
 * Prints a per-file summary so the rewrite step knows which slugs need work.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-28-batch5'

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const dirPath = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(dirPath).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  let clean = 0
  const violators: { slug: string; errors: { kind: string; message: string; path: string }[] }[] = []

  for (const f of files) {
    const data = JSON.parse(readFileSync(resolve(dirPath, f), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      clean++
    } else {
      violators.push({ slug: data.slug, errors: report.errors })
    }
  }

  console.log(`[total]    ${files.length}`)
  console.log(`[clean]    ${clean}`)
  console.log(`[violator] ${violators.length}`)
  console.log()
  for (const v of violators) {
    console.log(`---- ${v.slug} (${v.errors.length} errors)`)
    for (const e of v.errors) {
      console.log(`  ${e.kind}: ${e.message}`)
      console.log(`    @ ${e.path}`)
    }
  }
}

main()
