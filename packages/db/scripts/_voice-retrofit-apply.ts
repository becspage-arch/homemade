/**
 * Apply rewritten voice-retrofit JSON files to the live DB.
 * Mirrors _pilot-voice-apply.ts but parameterised by batch id.
 *
 * For each file in docs/voice-retrofit-<batch-id>/:
 *   1. Load the rewritten JSON.
 *   2. Voice-check pass: fail the apply on errors.
 *   3. Look up the Tutorial by slug.
 *   4. Snapshot the current body into Tutorial.revisedFrom (if null).
 *   5. Update body + subtitle + excerpt + sourceNotes from the JSON.
 *
 * Idempotent on re-runs: snapshot only happens the first time, body always
 * picks up the latest JSON state.
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
import { prisma } from '../src'

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('usage: tsx _voice-retrofit-apply.ts <batch-id>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) {
    console.error(`batch dir not found: ${batchDir}`)
    process.exit(1)
  }
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  let ok = 0
  let fail = 0
  const failures: { slug: string; reason: string }[] = []

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    let data: any
    try {
      data = JSON.parse(raw)
    } catch (e) {
      console.error(`[FAIL] ${file} — JSON parse error: ${(e as Error).message}`)
      fail++
      failures.push({ slug: file, reason: 'json parse' })
      continue
    }
    const slug = data.slug as string
    if (!slug) {
      console.error(`[FAIL] ${file} — missing slug`)
      fail++
      failures.push({ slug: file, reason: 'missing slug' })
      continue
    }

    const report = runVoiceCheck(data)
    if (report.errors.length > 0) {
      console.error(`[FAIL] ${slug} — voice-check errors:`)
      for (const err of report.errors) {
        console.error(`    ${err.kind}: ${err.message} at ${err.path}`)
      }
      fail++
      failures.push({ slug, reason: `${report.errors.length} voice-check errors` })
      continue
    }

    const current: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, body: true, revisedFrom: true },
    })
    if (!current) {
      console.error(`[FAIL] ${slug} — tutorial not found`)
      fail++
      failures.push({ slug, reason: 'tutorial not found' })
      continue
    }

    const updateData: any = {
      body: data.body,
      subtitle: data.subtitle,
      excerpt: data.excerpt,
      sourceNotes: data.sourceNotes,
    }
    if (current.revisedFrom == null) {
      updateData.revisedFrom = current.body
    }

    await prisma.tutorial.update({
      where: { slug },
      data: updateData,
    })

    console.log(`[OK]   ${slug}`)
    ok++
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f.slug}: ${f.reason}`)
  }

  await prisma.$disconnect()
  if (fail > 0) process.exit(2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
