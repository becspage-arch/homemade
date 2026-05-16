/**
 * Cross-category content audit — phase_8_content_integration_001.
 *
 * Re-runs voice-check + the new deterministic rules over every PUBLISHED
 * tutorial. REPORT-ONLY — does not modify any rows. Writes a markdown
 * summary to `docs/content-audit-<date>.md`.
 *
 * The autopilot's next audit-and-fix session reads the report and applies
 * targeted corrections. Splitting detection from mutation keeps this run
 * cheap to repeat and easy to diff.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/content-audit.ts
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { prisma, TutorialStatus } from '../src'
import { runVoiceCheck } from './voice-check-lib.js'

interface PerTutorialFinding {
  slug: string
  category: string
  type: string
  errors: { kind: string; message: string }[]
  warnings: { kind: string; message: string }[]
  hasHero: boolean
  hasFreezeNotes: boolean
  glossaryRegisteredCount: number
}

async function main(): Promise<void> {
  const rows = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED },
    select: {
      slug: true,
      title: true,
      type: true,
      categoryId: true,
      category: { select: { slug: true } },
      servings: true,
      yieldDescription: true,
      temperatureCelsius: true,
      freezable: true,
      freezeNotes: true,
      heroMediaId: true,
      body: true,
    },
    orderBy: { slug: 'asc' },
  })

  console.log(`Auditing ${rows.length} PUBLISHED tutorials.`)

  // Cache the global GlossaryTerm slug set so we can flag inline references
  // that don't resolve.
  const glossaryRows = await prisma.glossaryTerm.findMany({ select: { slug: true } })
  const globalGlossarySlugs = new Set(glossaryRows.map((g) => g.slug))

  function collectInlineGlossarySlugs(body: unknown): Set<string> {
    const slugs = new Set<string>()
    function walk(n: unknown): void {
      if (!n || typeof n !== 'object') return
      const node = n as { marks?: { type?: string; attrs?: Record<string, unknown> }[]; content?: unknown[] }
      if (Array.isArray(node.marks)) {
        for (const m of node.marks) {
          if (m.type === 'glossaryTooltip' && m.attrs) {
            const slug = typeof m.attrs.termSlug === 'string' ? m.attrs.termSlug : null
            if (slug) slugs.add(slug)
          }
        }
      }
      if (Array.isArray(node.content)) for (const c of node.content) walk(c)
    }
    walk(body)
    return slugs
  }

  let unresolvedGlossaryRefs = 0

  const findings: PerTutorialFinding[] = []
  let totalErrors = 0
  let totalWarnings = 0
  let missingHero = 0
  let freezableNoNotes = 0
  const errorCounts: Record<string, number> = {}
  const warningCounts: Record<string, number> = {}

  for (const row of rows) {
    // Shape the upload-input-like object for runVoiceCheck.
    const input: Record<string, unknown> = {
      type: row.type,
      body: row.body,
      recipe: {
        servings: row.servings,
        yieldDescription: row.yieldDescription,
        temperatureCelsius: row.temperatureCelsius,
      },
      // GlossaryTerm has no back-relation to Tutorial — the body's
      // glossaryTooltip marks are the source of truth. Pass an empty
      // glossaryTerms array so the rule's "registered but not used"
      // branch no-ops; "used but not registered" is verified separately
      // against the global GlossaryTerm table.
      glossaryTerms: [],
    }
    const report = runVoiceCheck(input)

    const flat = {
      slug: row.slug,
      category: row.category?.slug ?? '(none)',
      type: row.type,
      errors: report.errors.map((e) => ({ kind: e.kind, message: e.message })),
      warnings: report.warnings.map((w) => ({ kind: w.kind, message: w.message })),
      hasHero: row.heroMediaId !== null,
      hasFreezeNotes: typeof row.freezeNotes === 'string' && row.freezeNotes.trim().length > 0,
      glossaryRegisteredCount: 0,
    }
    // Global glossary-coverage check.
    const inlineGlossarySlugs = collectInlineGlossarySlugs(row.body)
    for (const slug of inlineGlossarySlugs) {
      if (!globalGlossarySlugs.has(slug)) {
        flat.errors.push({
          kind: 'glossary-coverage',
          message: `body references glossary term "${slug}" but no GlossaryTerm row exists with that slug`,
        })
        unresolvedGlossaryRefs++
      }
    }

    findings.push(flat)

    totalErrors += flat.errors.length
    totalWarnings += flat.warnings.length
    if (!flat.hasHero) missingHero++
    if (row.freezable && !flat.hasFreezeNotes) freezableNoNotes++

    for (const e of flat.errors) errorCounts[e.kind] = (errorCounts[e.kind] ?? 0) + 1
    for (const w of flat.warnings) warningCounts[w.kind] = (warningCounts[w.kind] ?? 0) + 1
  }

  // Write the report.
  const today = new Date().toISOString().slice(0, 10)
  const file = resolve('../../docs', `content-audit-${today}.md`)
  const lines: string[] = []
  lines.push(`# Content audit — ${today}`)
  lines.push('')
  lines.push(`Generated by \`packages/db/scripts/content-audit.ts\`. REPORT-ONLY — no rows were modified.`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- PUBLISHED tutorials audited: ${rows.length}`)
  lines.push(`- Voice-check / structural errors: ${totalErrors}`)
  lines.push(`- Warnings: ${totalWarnings}`)
  lines.push(`- Tutorials with no hero Media: ${missingHero}`)
  lines.push(`- Tutorials marked freezable but missing freezeNotes: ${freezableNoNotes}`)
  lines.push(`- Inline glossaryTooltip refs that don't resolve: ${unresolvedGlossaryRefs}`)
  lines.push('')
  lines.push('## Error counts by kind')
  lines.push('')
  for (const kind of Object.keys(errorCounts).sort()) {
    lines.push(`- \`${kind}\`: ${errorCounts[kind]}`)
  }
  lines.push('')
  lines.push('## Warning counts by kind')
  lines.push('')
  for (const kind of Object.keys(warningCounts).sort()) {
    lines.push(`- \`${kind}\`: ${warningCounts[kind]}`)
  }

  // Per-tutorial errors, capped at ~150 to keep the report digestible.
  const withErrors = findings.filter((f) => f.errors.length > 0).slice(0, 150)
  if (withErrors.length > 0) {
    lines.push('')
    lines.push('## Per-tutorial errors (first 150)')
    lines.push('')
    for (const f of withErrors) {
      lines.push(`### \`${f.slug}\` (${f.category} / ${f.type})`)
      for (const e of f.errors) {
        lines.push(`- **${e.kind}** — ${e.message}`)
      }
      lines.push('')
    }
  }

  lines.push('')
  lines.push('## Follow-ups for the audit-and-fix session')
  lines.push('')
  lines.push('- For each `glossary-coverage` error: either register the missing term or inline-wrap the unused term.')
  lines.push('- For each `servings-yield` error: pick exactly one of `servings` or `yieldDescription` per the rule in the v5 authoring appendix.')
  lines.push('- For each `temperature-canonical` warning: confirm `recipe.temperatureCelsius` is conventional, not fan.')
  lines.push('- For the freezable-without-notes count: either set `freezable: false` or write a one-line `freezeNotes`.')
  lines.push('- For the missing-hero count: run the image-sourcing orchestrator across the slug list (pre-launch bulk fill).')

  writeFileSync(file, lines.join('\n') + '\n', 'utf8')
  console.log(`\nReport written: ${file}`)
  console.log(`  errors: ${totalErrors}, warnings: ${totalWarnings}, missing-hero: ${missingHero}, freezable-no-notes: ${freezableNoNotes}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
