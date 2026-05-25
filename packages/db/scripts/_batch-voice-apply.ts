/**
 * Apply rewritten voice-retrofit JSON files to the live DB.
 * Usage: tsx scripts/_batch-voice-apply.ts <batch-id>
 * Example: tsx scripts/_batch-voice-apply.ts 2026-05-25-batch1
 *
 * For each <slug>.json in docs/voice-retrofit-<batch-id>/ (not _slugs.json):
 *   1. Load the rewritten JSON.
 *   2. Voice-check — fail if errors.
 *   3. Snapshot current body to Tutorial.revisedFrom if not already set.
 *   4. Update body, subtitle, excerpt, sourceNotes.
 * Idempotent: re-running after a partial run skips already-applied rows.
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

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: tsx scripts/_batch-voice-apply.ts <batch-id>')
  process.exit(1)
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)

  if (!existsSync(batchDir)) {
    console.error(`Batch directory not found: ${batchDir}`)
    process.exit(1)
  }

  const files = readdirSync(batchDir).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  )

  console.log(`Applying ${files.length} files for batch ${batchId}`)

  let ok = 0
  let fail = 0
  const failures: { slug: string; reason: string }[] = []

  for (const file of files) {
    const fullPath = resolve(batchDir, file)
    const raw = readFileSync(fullPath, 'utf8')
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

    // Voice-check the new state.
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

    // Pull the current Tutorial.
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
      // Voice-retrofit tracking. Dedicated field so the routine's filter
      // (voiceRetrofittedAt IS NULL) stays isolated from other pipelines
      // that touch `revisedFrom`. Always set when this apply path runs.
      voiceRetrofittedAt: new Date(),
    }
    // Snapshot the pre-rewrite body if revisedFrom not already set.
    // `revisedFrom` is shared with other pipelines (image-relevance,
    // mindset audit), so only write when null. Never overwrite an
    // existing snapshot from another pipeline.
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
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
