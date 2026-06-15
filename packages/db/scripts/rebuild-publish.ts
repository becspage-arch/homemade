/**
 * Rebuild step 3 — gated re-publish of a repaired body.
 *
 * Reads the edited body from docs/rebuild-work/<slug>.json (written by
 * rebuild-dump.ts and corrected by the rebuild session), swaps it onto the
 * DRAFT row, runs the per-category completeness gate, and:
 *   - PASS  -> body saved, status PUBLISHED, publishedAt preserved (or stamped
 *             if never published), qcBlockReason cleared. A TutorialVersion
 *             snapshot is written for history.
 *   - FAIL  -> body saved (the edit is kept), row stays DRAFT, qcBlockReason
 *             refreshed with the remaining reasons. Nothing is published.
 *
 * The gate is STRUCTURAL + the truncation correctness check; it cannot verify
 * stitch-count maths, so the rebuild session is responsible for correctness.
 * Voice rules (no em/en dashes, banned phrases, register) are the session's
 * responsibility too — run scripts/voice-check.ts on a built upload-input if
 * you want the deterministic voice gate as well.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/rebuild-publish.ts --slug <slug>
 *   pnpm --filter @homemade/db exec tsx scripts/rebuild-publish.ts --slug <slug> --dry-run
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

import { Prisma } from '@prisma/client'
import { buildQcBlockReason, checkCompleteness } from './qc-completeness-rules/index.js'

const WORK_DIR = resolve(__dirname, '..', 'docs', 'rebuild-work')

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const si = argv.indexOf('--slug')
  const slug = si >= 0 ? argv[si + 1] : null
  if (!slug) { console.error('Usage: rebuild-publish.ts --slug <slug> [--dry-run]'); process.exit(1) }

  const file = resolve(WORK_DIR, `${slug}.json`)
  if (!existsSync(file)) { console.error(`no edited body at ${file} — run rebuild-dump.ts --slug ${slug} first`); process.exit(1) }

  let body: unknown
  try { body = JSON.parse(readFileSync(file, 'utf8')) } catch (e) { console.error(`body file is not valid JSON: ${(e as Error).message}`); process.exit(2) }
  const doc = body as { type?: string; content?: unknown[] }
  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) { console.error('body must be a TipTap doc { type:"doc", content:[...] }'); process.exit(2) }

  const { prisma } = await import('../src/index.js')
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  const t = await prisma.tutorial.findUnique({
    where: { slug },
    select: {
      id: true, type: true, title: true, subtitle: true, excerpt: true, status: true, publishedAt: true,
      servings: true, yieldDescription: true, totalMinutes: true, timeMinutes: true,
      prepMinutes: true, cookMinutes: true, chartDefinition: true,
      category: { select: { slug: true } }, subCategory: { select: { slug: true } },
    },
  })
  if (!t) { console.error(`not found: ${slug}`); process.exit(1) }

  const result = checkCompleteness({
    slug, categorySlug: t.category.slug, subCategorySlug: t.subCategory?.slug ?? null,
    type: t.type, body,
    servings: t.servings, yieldDescription: t.yieldDescription, totalMinutes: t.totalMinutes,
    timeMinutes: t.timeMinutes, prepMinutes: t.prepMinutes, cookMinutes: t.cookMinutes,
    hasChart: t.chartDefinition != null,
  })

  console.log(`${slug}: completeness ${result.ok ? 'PASS' : 'FAIL'}`)
  if (!result.ok) for (const r of result.reasons) console.log(`  - ${r}`)
  if (dryRun) { console.log('[dry-run] no write'); await prisma.$disconnect(); return }

  if (result.ok) {
    if (author) {
      await prisma.tutorialVersion.create({
        data: {
          tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt,
          body: body as Prisma.InputJsonValue, status: 'PUBLISHED', authorId: author.id,
          changeNote: 'rebuild-publish: repaired body + re-published',
        },
      })
    }
    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body: body as Prisma.InputJsonValue, status: 'PUBLISHED', publishedAt: t.publishedAt ?? new Date(), qcBlockReason: Prisma.DbNull },
    })
    console.log(`  -> PUBLISHED`)
  } else {
    await prisma.tutorial.update({
      where: { id: t.id },
      data: {
        body: body as Prisma.InputJsonValue,
        qcBlockReason: buildQcBlockReason(result, { blockedFromStatus: 'PUBLISHED', checkedAt: new Date().toISOString(), source: 'rebuild-publish' }) as Prisma.InputJsonValue,
      },
    })
    console.log(`  -> kept DRAFT (body saved); fix the reasons above and re-run`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
