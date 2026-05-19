/**
 * fix-em-dashes — deterministic em-dash sweep across PUBLISHED tutorials
 * that violate rule 1 of the 2026-05-19 voice patterns.
 *
 * Strategy:
 *   1. Read the most recent voice audit JSON to get the list of slugs that
 *      violate rule 1.
 *   2. For each PUBLISHED tutorial in that list:
 *      - Walk the body JSON, transform every string field with the
 *        deterministic dash-replacement rules below.
 *      - Transform excerpt and sourceNotes (also paragraph-scoped in
 *        voice-check). Leave title and subtitle alone — title is the only
 *        explicit dash exception in the rule.
 *      - Re-run voice-check on the transformed body; confirm rule 1 clears.
 *      - Snapshot the pre-rewrite body into `revisedFrom` only if that
 *        column is null (preserve any earlier audit-cycle snapshot).
 *      - Write the result back. Keep status PUBLISHED.
 *   3. Print a summary: touched, still-failing, per-category.
 *
 * Replacement rules (applied in order):
 *   - `(\d+)\s*[—–]\s*(\d+)` → `$1 to $2`   (number ranges)
 *   - `\s*[—–]\s*`         → `, `         (spaced or unspaced dash → comma)
 *   - Stylistic cleanup:    drop the trailing comma in `", or, "` /
 *                          `", and, "` / `", but, "` constructions; collapse
 *                          double commas and double spaces; tidy ", ."
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/fix-em-dashes.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fix-em-dashes.ts --dry-run
 *   pnpm --filter @homemade/db exec tsx scripts/fix-em-dashes.ts --limit 10
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

interface CliFlags {
  dryRun: boolean
  limit: number | null
  category: string | null
  allPublished: boolean
}

function parseArgs(argv: string[]): CliFlags {
  let dryRun = false
  let limit: number | null = null
  let category: string | null = null
  let allPublished = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry-run') dryRun = true
    else if (arg === '--all-published') allPublished = true
    else if (arg === '--limit') {
      const n = parseInt(argv[i + 1] ?? '', 10)
      if (Number.isFinite(n) && n > 0) limit = n
      i++
    } else if (arg === '--category') {
      category = argv[i + 1] ?? null
      i++
    }
  }
  return { dryRun, limit, category, allPublished }
}

/**
 * Promote em-dash → "." when the right side of the dash clearly opens a new
 * clause: a coordinating conjunction with comma ("— or, in the traditional
 * method") or an independent-clause subject ("— the sides should look dry").
 * Otherwise fall back to ", ".
 *
 * Paired em-dashes within the same sentence (parenthetical interjections like
 * "salt — the kind you grind — is best") are detected and demoted to ", " on
 * both sides so the meaning survives.
 */
function fixEmDashes(text: string): string {
  if (typeof text !== 'string') return text
  if (!text.includes('—') && !text.includes('–')) return text
  let out = text

  // 1. Number ranges: 20–25 → "20 to 25"
  out = out.replace(/(\d+(?:\.\d+)?)\s*[—–]\s*(\d+(?:\.\d+)?)/g, '$1 to $2')

  // 2. Demote paired em-dashes within a sentence (parenthetical) to commas.
  //    Limit the inner span so this doesn't span sentence boundaries.
  out = out.replace(/\s*[—–]\s+([^.!?—–]{1,80}?)\s+[—–]\s*/g, ', $1, ')

  // 3. Promote em-dash → ". <Capitalised>" when the right side begins with:
  //    (a) a coordinating conjunction followed by a comma, or
  //    (b) a clear new-clause subject or temporal/conditional adverb.
  out = out.replace(
    /\s*[—–]\s+(or|and|but|so|yet|however|because|since)\s*,/gi,
    (_m, conj) => '. ' + conj.charAt(0).toUpperCase() + conj.slice(1).toLowerCase() + ',',
  )
  out = out.replace(
    /\s*[—–]\s+(it|you|they|she|he|we|i|now|then|next|finally|first|second|when|where|after|before|once|while)\b/gi,
    (_m, word) => {
      const cap = word.toLowerCase() === 'i' ? 'I' : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      return '. ' + cap
    },
  )

  // 4. Default: any remaining dash with optional surrounding whitespace → ", "
  out = out.replace(/\s*[—–]\s*/g, ', ')

  // 5. Cleanup
  out = out.replace(/,{2,}/g, ',')
  out = out.replace(/,\s*,/g, ',')
  out = out.replace(/\s{2,}/g, ' ')
  out = out.replace(/\s+,/g, ',')
  out = out.replace(/,\s*([.!?;:])/g, '$1')
  out = out.replace(/\.\s*\./g, '.')
  // Capitalise the first letter after ". " if it ended up lowercase (rare).
  out = out.replace(/\.\s+([a-z])/g, (_m, ch) => '. ' + ch.toUpperCase())
  return out
}

function transformJson(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') return fixEmDashes(value)
  if (Array.isArray(value)) return value.map((v) => transformJson(v))
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = transformJson(v)
    }
    return out
  }
  return value
}

function jsonContainsDash(value: unknown): boolean {
  if (typeof value === 'string') return value.includes('—') || value.includes('–')
  if (Array.isArray(value)) return value.some(jsonContainsDash)
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (jsonContainsDash(v)) return true
    }
  }
  return false
}

function resolveRepoPath(rel: string): string {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, rel)
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return resolve(process.cwd(), rel)
}

interface AuditTutorial {
  slug: string
  verdict: 'PASS' | 'VIOLATES'
  violations: number[]
}

interface AuditJson {
  tutorials: AuditTutorial[]
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))

  const { prisma, TutorialStatus } = await import('../src/index.js')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: TutorialStatus.PUBLISHED }

  if (!flags.allPublished) {
    const auditPath = resolveRepoPath('docs/voice-audit-2026-05-19.json')
    if (!existsSync(auditPath)) {
      console.error(`fix-em-dashes: audit JSON not found at ${auditPath}. Re-run audit-voice-patterns.ts first, or pass --all-published.`)
      process.exit(2)
    }
    const audit = JSON.parse(readFileSync(auditPath, 'utf8')) as AuditJson
    const r1Slugs = new Set(
      audit.tutorials
        .filter((t) => t.verdict === 'VIOLATES' && t.violations.includes(1))
        .map((t) => t.slug),
    )
    console.log(`fix-em-dashes: ${r1Slugs.size} rule-1 violators in the audit`)
    where.slug = { in: [...r1Slugs] }
  } else {
    console.log('fix-em-dashes: scanning ALL PUBLISHED tutorials (--all-published)')
  }
  if (flags.category) {
    const cat = await prisma.category.findUnique({ where: { slug: flags.category }, select: { id: true } })
    if (!cat) {
      console.error(`fix-em-dashes: no category with slug "${flags.category}"`)
      process.exit(2)
    }
    where.categoryId = cat.id
  }

  const tutorials = await prisma.tutorial.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      sourceNotes: true,
      body: true,
      revisedFrom: true,
      category: { select: { slug: true } },
    },
    orderBy: { updatedAt: 'asc' },
    ...(flags.limit !== null ? { take: flags.limit } : {}),
  })

  console.log(`fix-em-dashes: processing ${tutorials.length} tutorials${flags.dryRun ? ' (dry-run)' : ''}`)

  let touched = 0
  let unchanged = 0
  let stillFailing = 0
  const perCategory = new Map<string, { touched: number; failed: number }>()
  const failures: Array<{ slug: string; emDashesRemaining: number; firstSnippet: string }> = []
  let scanned = 0

  for (const t of tutorials) {
    scanned++
    if (scanned % 100 === 0) console.log(`  ...${scanned}/${tutorials.length}`)

    const transformedBody = transformJson(t.body)
    const transformedExcerpt = typeof t.excerpt === 'string' ? fixEmDashes(t.excerpt) : t.excerpt
    const transformedSourceNotes = typeof t.sourceNotes === 'string' ? fixEmDashes(t.sourceNotes) : t.sourceNotes

    const bodyChanged = JSON.stringify(transformedBody) !== JSON.stringify(t.body)
    const excerptChanged = transformedExcerpt !== t.excerpt
    const sourceNotesChanged = transformedSourceNotes !== t.sourceNotes
    const anyChanged = bodyChanged || excerptChanged || sourceNotesChanged

    if (!anyChanged) {
      unchanged++
      continue
    }

    // Verify rule 1 clears on the transformed body + metadata.
    const report = runVoiceCheck({
      excerpt: transformedExcerpt,
      sourceNotes: transformedSourceNotes,
      body: transformedBody,
    })
    const remainingDashFindings = report.errors.filter((e) => e.kind === 'em-dash-paragraph')
    if (remainingDashFindings.length > 0 || jsonContainsDash(transformedBody)) {
      stillFailing++
      const slot = perCategory.get(t.category.slug) ?? { touched: 0, failed: 0 }
      slot.failed++
      perCategory.set(t.category.slug, slot)
      failures.push({
        slug: t.slug,
        emDashesRemaining: remainingDashFindings.length,
        firstSnippet: (remainingDashFindings[0]?.snippet ?? '').slice(0, 120),
      })
      continue
    }

    if (!flags.dryRun) {
      const data: Record<string, unknown> = {
        body: transformedBody as object,
        excerpt: transformedExcerpt,
        sourceNotes: transformedSourceNotes,
      }
      if (t.revisedFrom === null) {
        data.revisedFrom = t.body as object
      }
      await prisma.tutorial.update({ where: { id: t.id }, data })
    }

    touched++
    const slot = perCategory.get(t.category.slug) ?? { touched: 0, failed: 0 }
    slot.touched++
    perCategory.set(t.category.slug, slot)
  }

  console.log('')
  console.log(`fix-em-dashes: ${touched} touched, ${unchanged} unchanged, ${stillFailing} still failing`)
  console.log('per-category:')
  for (const [cat, slot] of [...perCategory.entries()].sort()) {
    console.log(`  ${cat.padEnd(22)} touched=${slot.touched}  failed=${slot.failed}`)
  }
  if (failures.length > 0) {
    console.log('')
    console.log('FAILURES (first 20):')
    for (const f of failures.slice(0, 20)) {
      console.log(`  ${f.slug}  remaining=${f.emDashesRemaining}  ${f.firstSnippet}`)
    }
  }

  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(`fix-em-dashes: ${err instanceof Error ? err.stack ?? err.message : err}`)
  process.exit(1)
})
