/**
 * fix-voice-cleanup — deterministic clean-up pass for the smaller voice-rule
 * violations left over after `fix-em-dashes.ts`:
 *
 *   Rule 3 (false specificness, JARGON_WATCHLIST subset):
 *     - "nitrile gloves" → "protective gloves"
 *     - "nitrile"        → "protective" (when adjacent to glove-like words)
 *     - "dacron"         → "upholstery"
 *     - "pullet"         → "young hen"   (whole-word, case-preserved)
 *
 *   Rule 4 (word precision per category):
 *     - In natural-home / herbal-medicine bodies:
 *       "cooking" → "making", "cooked" → "made", "cooks" → "makes"
 *     - In mindset bodies:
 *       "exercising" → "practising", "exercises" → "practises"
 *       "performing" → "doing",      "performs"  → "does"
 *
 *   Rule 6 (sensible time units, durations over 48 h expressed as raw hours):
 *     - "72 hours" → "3 days"
 *     - "168 hours" → "1 week"
 *     - generic "<N> hours" with N > 48 → derived day/week phrase
 *
 * Snapshot of pre-rewrite body is captured in `revisedFrom` only if that
 * column is null — preserves any earlier audit-cycle snapshot.
 *
 * Brand-trademark swaps are NOT done here. The current BANNED_BRANDS list
 * has too many verb-form false positives (Target, Anchor, Pam, Bird's,
 * Flake) — that needs to be scrubbed before a brand sweep is safe.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/fix-voice-cleanup.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fix-voice-cleanup.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

interface CliFlags {
  dryRun: boolean
}

function parseArgs(argv: string[]): CliFlags {
  let dryRun = false
  for (const arg of argv) if (arg === '--dry-run') dryRun = true
  return { dryRun }
}

// ─── Replacement rules ─────────────────────────────────────────────────────

function preserveCase(orig: string, replacement: string): string {
  if (!orig) return replacement
  if (orig === orig.toUpperCase()) return replacement.toUpperCase()
  if (orig[0] === orig[0]?.toUpperCase()) {
    return replacement[0]?.toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function wholeWordReplace(text: string, from: string, to: string): string {
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${from})(?=$|[^\\p{L}\\p{N}])`, 'giu')
  return text.replace(re, (_m, pre: string, match: string) => pre + preserveCase(match, to))
}

function rawHoursToDuration(hours: number): string {
  if (hours <= 48) return `${hours} hours`
  if (hours < 168) {
    const days = Math.round(hours / 24)
    return `${days} day${days === 1 ? '' : 's'}`
  }
  if (hours < 168 * 4) {
    const weeks = Math.floor(hours / 168)
    const remainingDays = Math.round((hours - weeks * 168) / 24)
    if (remainingDays === 0) return `${weeks} week${weeks === 1 ? '' : 's'}`
    return `${weeks} week${weeks === 1 ? '' : 's'}, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`
  }
  const weeks = Math.round(hours / 168)
  return `${weeks} weeks`
}

function applyRule3(text: string): string {
  if (typeof text !== 'string') return text
  let out = text
  // Phrase swaps first so "nitrile gloves" doesn't become "protective gloves gloves".
  out = out.replace(/\bnitrile\s+gloves?\b/gi, (m) => preserveCase(m, m.toLowerCase().endsWith('s') ? 'protective gloves' : 'protective glove'))
  out = wholeWordReplace(out, 'nitrile', 'protective')
  out = wholeWordReplace(out, 'dacron', 'upholstery')
  out = wholeWordReplace(out, 'pullet', 'young hen')
  out = wholeWordReplace(out, 'pullets', 'young hens')
  return out
}

function applyRule4(text: string, categorySlug: string): string {
  if (typeof text !== 'string') return text
  let out = text
  // Only swap unambiguous verb forms. "cooks" / "exercises" / "exercise" all
  // overlap with nouns ("two cooks", "an exercise") and a deterministic swap
  // on those produces broken prose.
  //
  // "performing" / "performed" / "performs" are deliberately NOT swapped:
  // mindset writing legitimately uses "performing outrage" / "performing
  // wealth" to describe performative behaviour — exactly the concept the
  // category is critiquing. A blanket performing → doing swap destroys the
  // contrast. Those hits stay as warnings for a future LLM pass.
  if (categorySlug === 'natural-home' || categorySlug === 'herbal-medicine') {
    out = wholeWordReplace(out, 'cooking', 'making')
    out = wholeWordReplace(out, 'cooked', 'made')
  }
  if (categorySlug === 'mindset') {
    out = wholeWordReplace(out, 'exercising', 'practising')
  }
  return out
}

function applyRule6(text: string): string {
  if (typeof text !== 'string') return text
  return text.replace(/\b(\d+)\s*(hours?|hrs?)\b/gi, (match, numStr) => {
    const hours = parseInt(numStr, 10)
    if (!Number.isFinite(hours) || hours <= 48) return match
    return rawHoursToDuration(hours)
  })
}

function transformJsonRules3and6(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    let v = applyRule3(value)
    v = applyRule6(v)
    return v
  }
  if (Array.isArray(value)) return value.map((v) => transformJsonRules3and6(v))
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = transformJsonRules3and6(v)
    }
    return out
  }
  return value
}

function transformJsonRule4(value: unknown, categorySlug: string): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') return applyRule4(value, categorySlug)
  if (Array.isArray(value)) return value.map((v) => transformJsonRule4(v, categorySlug))
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = transformJsonRule4(v, categorySlug)
    }
    return out
  }
  return value
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))
  const { prisma, TutorialStatus } = await import('../src/index.js')

  const tutorials = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED },
    select: {
      id: true,
      slug: true,
      excerpt: true,
      sourceNotes: true,
      body: true,
      revisedFrom: true,
      category: { select: { slug: true } },
    },
    orderBy: { updatedAt: 'asc' },
  })

  console.log(`fix-voice-cleanup: scanning ${tutorials.length} PUBLISHED${flags.dryRun ? ' (dry-run)' : ''}`)

  const counts: Record<string, number> = { rule3: 0, rule4: 0, rule6: 0, total: 0 }
  const perCategory = new Map<string, number>()
  const examples: Array<{ slug: string; from: string; to: string }> = []
  let scanned = 0

  for (const t of tutorials) {
    scanned++
    if (scanned % 500 === 0) console.log(`  ...${scanned}/${tutorials.length}`)

    const cat = t.category.slug

    const bodyAfterR3R6 = transformJsonRules3and6(t.body)
    const bodyAfterR4 = transformJsonRule4(bodyAfterR3R6, cat)
    const transformedBody = bodyAfterR4

    const excerptR3R6 = typeof t.excerpt === 'string' ? applyRule6(applyRule3(t.excerpt)) : t.excerpt
    const transformedExcerpt = typeof excerptR3R6 === 'string' ? applyRule4(excerptR3R6, cat) : excerptR3R6

    const sourceR3R6 = typeof t.sourceNotes === 'string' ? applyRule6(applyRule3(t.sourceNotes)) : t.sourceNotes
    const transformedSourceNotes = typeof sourceR3R6 === 'string' ? applyRule4(sourceR3R6, cat) : sourceR3R6

    const bodyJsonBefore = JSON.stringify(t.body)
    const bodyJsonAfter = JSON.stringify(transformedBody)

    const bodyChanged = bodyJsonBefore !== bodyJsonAfter
    const excerptChanged = transformedExcerpt !== t.excerpt
    const sourceNotesChanged = transformedSourceNotes !== t.sourceNotes
    if (!bodyChanged && !excerptChanged && !sourceNotesChanged) continue

    counts.total++
    perCategory.set(cat, (perCategory.get(cat) ?? 0) + 1)

    // Classify which rule fired by re-applying each individually to see which
    // produced a diff. Cheap; only runs on touched rows.
    if (JSON.stringify(transformJsonRules3and6(t.body)) !== bodyJsonBefore) counts.rule3++
    if (JSON.stringify(transformJsonRule4(t.body, cat)) !== bodyJsonBefore) counts.rule4++
    {
      // Quick rule 6 detector: look for "<N> hours" with N > 48 in original
      const allText = bodyJsonBefore
      const rawHoursRe = /(\d+)\s*(hours?|hrs?)/gi
      let m: RegExpExecArray | null
      while ((m = rawHoursRe.exec(allText)) !== null) {
        const n = parseInt(m[1], 10)
        if (n > 48) {
          counts.rule6++
          break
        }
      }
    }

    if (examples.length < 8) {
      // Find a first-diff string for the example log.
      const before = JSON.parse(bodyJsonBefore)
      const after = JSON.parse(bodyJsonAfter)
      const sample = findFirstDiff(before, after)
      if (sample) examples.push({ slug: t.slug, from: sample.before, to: sample.after })
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
  }

  console.log('')
  console.log(`fix-voice-cleanup: ${counts.total} touched`)
  console.log(`  rule 3 (jargon swaps) : ${counts.rule3}`)
  console.log(`  rule 4 (word precision): ${counts.rule4}`)
  console.log(`  rule 6 (raw hours)    : ${counts.rule6}`)
  console.log('per-category:')
  for (const [cat, n] of [...perCategory.entries()].sort()) console.log(`  ${cat.padEnd(22)} ${n}`)
  if (examples.length > 0) {
    console.log('')
    console.log('sample diffs:')
    for (const e of examples) {
      console.log(`  ${e.slug}`)
      console.log(`    - ${e.from.slice(0, 160)}`)
      console.log(`    + ${e.to.slice(0, 160)}`)
    }
  }

  await prisma.$disconnect()
}

function findFirstDiff(before: unknown, after: unknown): { before: string; after: string } | null {
  if (typeof before === 'string' && typeof after === 'string') {
    if (before !== after && (before.length > 0 || after.length > 0)) {
      return { before, after }
    }
    return null
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    for (let i = 0; i < Math.max(before.length, after.length); i++) {
      const d = findFirstDiff(before[i], after[i])
      if (d) return d
    }
    return null
  }
  if (before && after && typeof before === 'object' && typeof after === 'object') {
    const bk = Object.keys(before as Record<string, unknown>)
    for (const k of bk) {
      const d = findFirstDiff((before as Record<string, unknown>)[k], (after as Record<string, unknown>)[k])
      if (d) return d
    }
  }
  return null
}

main().catch(async (err) => {
  console.error(`fix-voice-cleanup: ${err instanceof Error ? err.stack ?? err.message : err}`)
  process.exit(1)
})
