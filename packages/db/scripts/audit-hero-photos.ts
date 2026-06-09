/**
 * Part 1 — Hero photo audit
 * Queries all Pattern + CrochetPattern rows with heroMediaId set, joins
 * the linked Media row, classifies each hero, and writes the results to
 * docs/hero-photo-audit-2026-06-09.md.
 *
 * Run with:
 *   pnpm --filter @homemade/db tsx scripts/audit-hero-photos.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

import { prisma } from '../src'

type Classification = 'CLEAN' | 'WATERMARKED' | 'SUSPECTED_WATERMARK' | 'MISSING' | 'OTHER_ISSUE'

interface AuditRow {
  id: string
  name: string
  patternType: string
  heroMediaId: string | null
  thumbnailMediaId: string | null
  heroGenerationStatus: string
  classification: Classification
  flags: string[]
  mediaUrl: string | null
  mediaSource: string | null
  mediaVerificationStatus: string | null
  mediaWidth: number | null
  mediaHeight: number | null
}

function classifyRow(row: {
  heroMediaId: string | null
  thumbnailMediaId: string | null
  heroGenerationStatus: string
  mediaSource: string | null
  mediaVerificationStatus: string | null
}): { classification: Classification; flags: string[] } {
  const flags: string[] = []

  if (!row.heroMediaId) {
    if (!row.thumbnailMediaId) {
      return { classification: 'MISSING', flags: ['no heroMediaId and no thumbnailMediaId'] }
    }
    return { classification: 'MISSING', flags: ['no heroMediaId (thumbnail exists)'] }
  }

  if (row.mediaVerificationStatus === 'REJECTED') {
    flags.push('verificationStatus=REJECTED')
    return { classification: 'OTHER_ISSUE', flags }
  }

  if (row.mediaSource === 'pixabay') {
    flags.push('source=pixabay (attribution required)')
    return { classification: 'SUSPECTED_WATERMARK', flags }
  }

  if (row.heroGenerationStatus === 'FAILED_VERIFICATION') {
    flags.push('heroGenerationStatus=FAILED_VERIFICATION')
  }

  if (row.heroGenerationStatus === 'SYNTHETIC_FALLBACK') {
    flags.push('heroGenerationStatus=SYNTHETIC_FALLBACK')
  }

  if (flags.length > 0) {
    return { classification: 'OTHER_ISSUE', flags }
  }

  return { classification: 'CLEAN', flags: [] }
}

async function main() {
  console.log('Querying Pattern rows...')
  const patterns = await prisma.pattern.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      heroMediaId: true,
      thumbnailMediaId: true,
      heroGenerationStatus: true,
      hero: {
        select: {
          id: true,
          source: true,
          verificationStatus: true,
          width: true,
          height: true,
          r2Key: true,
          cloudflareId: true,
        },
      },
    },
  })

  console.log('Querying CrochetPattern rows...')
  const crochetPatterns = await prisma.crochetPattern.findMany({
    select: {
      id: true,
      name: true,
      heroMediaId: true,
      thumbnailMediaId: true,
      heroGenerationStatus: true,
      hero: {
        select: {
          id: true,
          source: true,
          verificationStatus: true,
          width: true,
          height: true,
          r2Key: true,
          cloudflareId: true,
        },
      },
    },
  })

  const results: AuditRow[] = []

  for (const p of patterns) {
    const { classification, flags } = classifyRow({
      heroMediaId: p.heroMediaId,
      thumbnailMediaId: p.thumbnailMediaId,
      heroGenerationStatus: p.heroGenerationStatus,
      mediaSource: p.hero?.source ?? null,
      mediaVerificationStatus: p.hero?.verificationStatus ?? null,
    })
    results.push({
      id: p.id,
      name: p.name,
      patternType: `Pattern/${p.type}`,
      heroMediaId: p.heroMediaId,
      thumbnailMediaId: p.thumbnailMediaId,
      heroGenerationStatus: p.heroGenerationStatus,
      classification,
      flags,
      mediaUrl: p.hero ? (p.hero.cloudflareId ? `cf:${p.hero.cloudflareId}` : p.hero.r2Key ? `r2:${p.hero.r2Key}` : null) : null,
      mediaSource: p.hero?.source ?? null,
      mediaVerificationStatus: p.hero?.verificationStatus ?? null,
      mediaWidth: p.hero?.width ?? null,
      mediaHeight: p.hero?.height ?? null,
    })
  }

  for (const cp of crochetPatterns) {
    const { classification, flags } = classifyRow({
      heroMediaId: cp.heroMediaId,
      thumbnailMediaId: cp.thumbnailMediaId,
      heroGenerationStatus: cp.heroGenerationStatus,
      mediaSource: cp.hero?.source ?? null,
      mediaVerificationStatus: cp.hero?.verificationStatus ?? null,
    })
    results.push({
      id: cp.id,
      name: cp.name,
      patternType: 'CrochetPattern',
      heroMediaId: cp.heroMediaId,
      thumbnailMediaId: cp.thumbnailMediaId,
      heroGenerationStatus: cp.heroGenerationStatus,
      classification,
      flags,
      mediaUrl: cp.hero ? (cp.hero.cloudflareId ? `cf:${cp.hero.cloudflareId}` : cp.hero.r2Key ? `r2:${cp.hero.r2Key}` : null) : null,
      mediaSource: cp.hero?.source ?? null,
      mediaVerificationStatus: cp.hero?.verificationStatus ?? null,
      mediaWidth: cp.hero?.width ?? null,
      mediaHeight: cp.hero?.height ?? null,
    })
  }

  // Tally
  const tally: Record<Classification, number> = {
    CLEAN: 0,
    WATERMARKED: 0,
    SUSPECTED_WATERMARK: 0,
    MISSING: 0,
    OTHER_ISSUE: 0,
  }
  for (const r of results) tally[r.classification]++

  // Build markdown output
  const lines: string[] = []
  lines.push('# Hero Photo Audit - 2026-06-09')
  lines.push('')
  lines.push('Read-only audit. No Media or Pattern rows were modified.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`| Classification | Count |`)
  lines.push(`|----------------|-------|`)
  lines.push(`| CLEAN | ${tally.CLEAN} |`)
  lines.push(`| WATERMARKED | ${tally.WATERMARKED} |`)
  lines.push(`| SUSPECTED_WATERMARK | ${tally.SUSPECTED_WATERMARK} |`)
  lines.push(`| MISSING | ${tally.MISSING} |`)
  lines.push(`| OTHER_ISSUE | ${tally.OTHER_ISSUE} |`)
  lines.push(`| **Total patterns** | **${results.length}** |`)
  lines.push('')
  lines.push(`Patterns queried: ${patterns.length} Pattern rows + ${crochetPatterns.length} CrochetPattern rows = ${results.length} total.`)
  lines.push(`Patterns with non-null heroMediaId: ${results.filter(r => r.heroMediaId).length}`)
  lines.push(`Patterns with null heroMediaId AND null thumbnailMediaId (fully MISSING): ${results.filter(r => !r.heroMediaId && !r.thumbnailMediaId).length}`)
  lines.push('')

  if (tally.WATERMARKED > 0) {
    lines.push('## WATERMARKED')
    lines.push('')
    for (const r of results.filter(c => c.classification === 'WATERMARKED')) {
      lines.push(`- **${r.name}** (${r.patternType}, id: ${r.id})`)
      for (const f of r.flags) lines.push(`  - ${f}`)
    }
    lines.push('')
  }

  if (tally.SUSPECTED_WATERMARK > 0) {
    lines.push('## SUSPECTED_WATERMARK (Pixabay source - attribution required)')
    lines.push('')
    for (const r of results.filter(c => c.classification === 'SUSPECTED_WATERMARK')) {
      lines.push(`- **${r.name}** (${r.patternType}, id: ${r.id})`)
      for (const f of r.flags) lines.push(`  - ${f}`)
    }
    lines.push('')
  }

  if (tally.OTHER_ISSUE > 0) {
    lines.push('## OTHER_ISSUE')
    lines.push('')
    for (const r of results.filter(c => c.classification === 'OTHER_ISSUE')) {
      lines.push(`- **${r.name}** (${r.patternType}, id: ${r.id})`)
      for (const f of r.flags) lines.push(`  - ${f}`)
      lines.push(`  - source: ${r.mediaSource ?? 'null'}, verificationStatus: ${r.mediaVerificationStatus ?? 'null'}`)
    }
    lines.push('')
  }

  if (tally.MISSING > 0) {
    lines.push('## MISSING (no heroMediaId)')
    lines.push('')
    lines.push('These patterns have no hero photo. Thumbnail may or may not be set.')
    lines.push('')
    lines.push('| Name | Type | heroGenerationStatus | thumbnailMediaId |')
    lines.push('|------|------|----------------------|-----------------|')
    for (const r of results.filter(c => c.classification === 'MISSING')) {
      lines.push(`| ${r.name} | ${r.patternType} | ${r.heroGenerationStatus} | ${r.thumbnailMediaId ?? 'null'} |`)
    }
    lines.push('')
  }

  lines.push('## Full table (CLEAN rows)')
  lines.push('')
  lines.push('| Name | Type | heroGenerationStatus | source | verificationStatus |')
  lines.push('|------|------|----------------------|--------|--------------------|')
  for (const r of results.filter(c => c.classification === 'CLEAN')) {
    lines.push(`| ${r.name} | ${r.patternType} | ${r.heroGenerationStatus} | ${r.mediaSource ?? 'null'} | ${r.mediaVerificationStatus ?? 'null'} |`)
  }
  lines.push('')

  const md = lines.join('\n')

  // Find repo root to write to docs/
  let repoRoot = __dirname
  for (let depth = 0; depth < 8; depth++) {
    if (existsSync(resolve(repoRoot, 'BUILD_PROGRESS.md'))) break
    const p = dirname(repoRoot); if (p === repoRoot) break; repoRoot = p
  }
  const outPath = resolve(repoRoot, 'docs', 'hero-photo-audit-2026-06-09.md')
  writeFileSync(outPath, md, 'utf8')

  console.log('\nAudit written to:', outPath)
  console.log('\nSummary:')
  console.log(`  CLEAN:              ${tally.CLEAN}`)
  console.log(`  WATERMARKED:        ${tally.WATERMARKED}`)
  console.log(`  SUSPECTED_WATERMARK:${tally.SUSPECTED_WATERMARK}`)
  console.log(`  MISSING:            ${tally.MISSING}`)
  console.log(`  OTHER_ISSUE:        ${tally.OTHER_ISSUE}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
