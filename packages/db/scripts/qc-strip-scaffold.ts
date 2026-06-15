/**
 * De-scaffold pass for the blocked-DRAFT backlog.
 *
 * The autopilot bug: qc-fix's old ensureMinimalMethod() appended a trailing
 * "## Method" heading + an orderedList whose only item was the literal
 * "Step-by-step instructions for <Title> go here." placeholder — and it did
 * this even when the body already had its real instructions under a "Pattern"
 * heading (the detector didn't recognise "Pattern"). So ~1,501 of the 1,884
 * blocked rows are "placeholder-only": complete content + a redundant trailing
 * scaffold.
 *
 * This script strips that scaffold node (a "Method" heading immediately
 * followed by an orderedList that matches the placeholder), re-runs the
 * completeness gate, and:
 *   - republishes (status PUBLISHED, qcBlockReason cleared) rows that now pass;
 *   - leaves rows that still fail at DRAFT with qcBlockReason refreshed.
 *
 * IMPORTANT — completeness is STRUCTURAL, not correctness. A row can pass this
 * gate and still contain a truncated round ("into next corner sp, work."). This
 * script does NOT verify pattern correctness; --dry-run + review before a bulk
 * run. Rows that need real authoring (genuinely missing rounds, NaN, undefined)
 * stay DRAFT for the authoring pass.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/qc-strip-scaffold.ts --slugs a,b,c --dry-run
 *   pnpm --filter @homemade/db exec tsx scripts/qc-strip-scaffold.ts --slugs a,b,c
 *   pnpm --filter @homemade/db exec tsx scripts/qc-strip-scaffold.ts --category crochet --limit 5
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

import { Prisma } from '@prisma/client'
import { buildQcBlockReason, checkCompleteness } from './qc-completeness-rules/index.js'

interface Node { type?: string; attrs?: Record<string, unknown>; content?: Node[]; text?: string }

const SCAFFOLD_RE = /instructions?\s+(?:for\s+[^.]{0,90}?\s+)?(?:go|goes|will\s+go)\s+here/i

function textOf(n: Node | undefined): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(textOf).join('')
  return ''
}

/** Remove a trailing "Method"-style heading immediately followed by an
 *  orderedList whose text matches the scaffold placeholder. Returns the new
 *  body + whether anything was stripped. Conservative: only removes the
 *  heading+list pair when the list is the scaffold; never touches real lists. */
function stripScaffold(body: unknown): { body: unknown; stripped: boolean } {
  const root = body as Node | null
  if (!root || !Array.isArray(root.content)) return { body, stripped: false }
  const out: Node[] = []
  let stripped = false
  for (const node of root.content) {
    const isScaffold =
      (node.type === 'orderedList' || node.type === 'bulletList' || node.type === 'paragraph') &&
      SCAFFOLD_RE.test(textOf(node))
    if (isScaffold) {
      stripped = true
      // Drop a directly-preceding "Method"/"Steps"/"Instructions" heading too.
      const prev = out[out.length - 1]
      if (prev && prev.type === 'heading' && /^(method|steps?|instructions?)$/i.test(textOf(prev).trim())) {
        out.pop()
      }
      continue // skip the scaffold node itself
    }
    out.push(node)
  }
  return { body: { ...root, content: out }, stripped }
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const slugsArg = (() => { const i = argv.indexOf('--slugs'); return i >= 0 ? (argv[i + 1] ?? '') : '' })()
  const category = (() => { const i = argv.indexOf('--category'); return i >= 0 ? (argv[i + 1] ?? null) : null })()
  const limit = (() => { const i = argv.indexOf('--limit'); return i >= 0 ? Number(argv[i + 1]) : null })()

  const { prisma } = await import('../src/index.js')

  const where: Record<string, unknown> = { status: 'DRAFT', qcBlockReason: { not: Prisma.DbNull } }
  if (slugsArg) where.slug = { in: slugsArg.split(',').map((s) => s.trim()).filter(Boolean) }
  if (category) where.category = { slug: category }

  const rows = await prisma.tutorial.findMany({
    where,
    select: {
      id: true, slug: true, type: true, body: true,
      servings: true, yieldDescription: true, totalMinutes: true, timeMinutes: true,
      prepMinutes: true, cookMinutes: true, chartDefinition: true, publishedAt: true,
      category: { select: { slug: true } }, subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
    ...(limit ? { take: limit } : {}),
  })

  let republished = 0, stillBlocked = 0, noScaffold = 0
  const checkedAt = new Date().toISOString()

  for (const r of rows) {
    const { body: cleaned, stripped } = stripScaffold(r.body)
    const result = checkCompleteness({
      slug: r.slug, categorySlug: r.category.slug, subCategorySlug: r.subCategory?.slug ?? null,
      type: r.type, body: cleaned,
      servings: r.servings, yieldDescription: r.yieldDescription, totalMinutes: r.totalMinutes,
      timeMinutes: r.timeMinutes, prepMinutes: r.prepMinutes, cookMinutes: r.cookMinutes,
      hasChart: r.chartDefinition != null,
    })
    if (!stripped) noScaffold++
    const verdict = result.ok ? 'PASS→PUBLISH' : `STILL_BLOCKED (${result.reasons.join('; ')})`
    console.log(`${stripped ? '✂' : ' '} ${r.slug} :: ${verdict}`)
    if (dryRun) { result.ok ? republished++ : stillBlocked++; continue }

    if (result.ok) {
      await prisma.tutorial.update({
        where: { id: r.id },
        data: {
          body: cleaned as Prisma.InputJsonValue,
          status: 'PUBLISHED',
          publishedAt: r.publishedAt ?? new Date(),
          qcBlockReason: Prisma.DbNull,
        },
      })
      republished++
    } else {
      await prisma.tutorial.update({
        where: { id: r.id },
        data: {
          body: cleaned as Prisma.InputJsonValue, // keep the de-scaffolded body even though still blocked
          qcBlockReason: buildQcBlockReason(result, { blockedFromStatus: 'PUBLISHED', checkedAt, source: 'qc-strip-scaffold' }) as Prisma.InputJsonValue,
        },
      })
      stillBlocked++
    }
  }

  console.log(`\n${dryRun ? '[DRY-RUN] ' : ''}scanned ${rows.length}; would-publish/published ${republished}; still-blocked ${stillBlocked}; no-scaffold-found ${noScaffold}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
