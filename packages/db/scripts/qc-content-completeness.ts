/**
 * Site-wide content-completeness audit + un-publish.
 *
 * Walks every PUBLISHED Tutorial across all categories and runs the
 * per-category completeness gate (packages/db/scripts/qc-completeness-rules/).
 * The same gate is wired into the publish path (`uploadTutorial`) so broken
 * content can't ship again; this script is the offline audit + the one-shot
 * un-publish of content that was already shipped broken.
 *
 * Usage:
 *   # audit only — writes the report, changes nothing
 *   pnpm --filter @homemade/db exec tsx scripts/qc-content-completeness.ts
 *
 *   # audit one category
 *   pnpm --filter @homemade/db exec tsx scripts/qc-content-completeness.ts --category crochet
 *
 *   # un-publish every confirmed-broken PUBLISHED row (status -> DRAFT,
 *   # qcBlockReason set, publishedAt preserved, slug unchanged, NOT deleted)
 *   pnpm --filter @homemade/db exec tsx scripts/qc-content-completeness.ts --unpublish
 *
 * Flags:
 *   --category <slug>   limit to one category
 *   --unpublish         flip confirmed-broken PUBLISHED rows to DRAFT
 *   --limit <n>         cap rows scanned (debug)
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

import { checkCompleteness, buildQcBlockReason } from './qc-completeness-rules/index.js'

interface CliFlags { category: string | null; unpublish: boolean; limit: number | null }
function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = { category: null, unpublish: false, limit: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--category') flags.category = argv[++i] ?? null
    else if (a === '--unpublish') flags.unpublish = true
    else if (a === '--limit') flags.limit = Number(argv[++i] ?? '')
  }
  return flags
}

interface BrokenItem {
  slug: string
  category: string
  subCategory: string | null
  type: string
  reasons: string[]
  rules: string[]
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))
  const { prisma } = await import('../src/index.js')

  const where: Record<string, unknown> = { status: 'PUBLISHED' }
  if (flags.category) {
    const cat = await prisma.category.findUnique({ where: { slug: flags.category }, select: { id: true } })
    if (!cat) { console.error(`Category "${flags.category}" not found`); process.exit(1) }
    where.categoryId = cat.id
  }

  const select = {
    id: true, slug: true, type: true, body: true,
    servings: true, yieldDescription: true, totalMinutes: true,
    timeMinutes: true, prepMinutes: true, cookMinutes: true,
    chartDefinition: true, publishedAt: true,
    category: { select: { slug: true } },
    subCategory: { select: { slug: true } },
  } as const

  const perCat: Record<string, { published: number; broken: number }> = {}
  const brokenSamples: Record<string, BrokenItem[]> = {}
  const passingSamples: Record<string, string[]> = {}
  const broken: BrokenItem[] = []
  // Rows to un-publish, paired with the reason payload.
  const toUnpublish: { id: string; reason: Record<string, unknown> }[] = []

  let cursor: string | undefined
  let scanned = 0
  const checkedAt = new Date().toISOString()
  const pageSize = 300

  for (;;) {
    const rows = await prisma.tutorial.findMany({
      where,
      select,
      orderBy: { id: 'asc' },
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })
    if (rows.length === 0) break
    cursor = rows[rows.length - 1]!.id

    for (const r of rows) {
      const catSlug = r.category.slug
      perCat[catSlug] ??= { published: 0, broken: 0 }
      perCat[catSlug]!.published++

      const result = checkCompleteness({
        slug: r.slug,
        categorySlug: catSlug,
        subCategorySlug: r.subCategory?.slug ?? null,
        type: r.type,
        body: r.body,
        servings: r.servings,
        yieldDescription: r.yieldDescription,
        totalMinutes: r.totalMinutes,
        timeMinutes: r.timeMinutes,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        hasChart: r.chartDefinition != null,
      })

      if (result.ok) {
        if ((passingSamples[catSlug]?.length ?? 0) < 5) {
          (passingSamples[catSlug] ??= []).push(r.slug)
        }
      } else {
        perCat[catSlug]!.broken++
        const item: BrokenItem = {
          slug: r.slug, category: catSlug, subCategory: r.subCategory?.slug ?? null,
          type: r.type, reasons: result.reasons, rules: result.rules,
        }
        broken.push(item)
        if ((brokenSamples[catSlug]?.length ?? 0) < 5) {
          (brokenSamples[catSlug] ??= []).push(item)
        }
        if (flags.unpublish) {
          toUnpublish.push({
            id: r.id,
            reason: buildQcBlockReason(result, {
              blockedFromStatus: 'PUBLISHED', checkedAt,
              source: 'qc-content-completeness --unpublish',
            }),
          })
        }
      }
      scanned++
      if (flags.limit && scanned >= flags.limit) break
    }
    if (flags.limit && scanned >= flags.limit) break
    if (rows.length < pageSize) break
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const dateStamp = checkedAt.slice(0, 10)
  const reportPath = resolve(__dirname, '..', 'docs', `content-completeness-report-${dateStamp}.json`)
  const perCategoryOut: Record<string, { published: number; broken: number; percent: number }> = {}
  for (const [slug, v] of Object.entries(perCat)) {
    perCategoryOut[slug] = {
      published: v.published, broken: v.broken,
      percent: v.published > 0 ? Math.round((v.broken / v.published) * 1000) / 10 : 0,
    }
  }
  writeFileSync(reportPath, JSON.stringify({
    generatedAt: checkedAt,
    totalPublished: scanned,
    totalBroken: broken.length,
    perCategory: perCategoryOut,
    brokenSamples,
    passingSamples,
    items: broken,
  }, null, 2))

  // ── Console summary ─────────────────────────────────────────────────────────
  console.log('\n=== CONTENT COMPLETENESS AUDIT ===')
  console.log(`scanned ${scanned} PUBLISHED tutorials; ${broken.length} broken\n`)
  console.log('category               | published | broken | %broken')
  console.log('-----------------------|-----------|--------|--------')
  const sorted = Object.entries(perCategoryOut).sort((a, b) => b[1].broken - a[1].broken)
  for (const [slug, v] of sorted) {
    console.log(`${slug.padEnd(22)} | ${String(v.published).padStart(9)} | ${String(v.broken).padStart(6)} | ${String(v.percent).padStart(6)}%`)
  }
  console.log(`\nreport -> ${reportPath}`)

  // ── Samples ───────────────────────────────────────────────────────────────
  for (const [slug, v] of sorted) {
    if (v.broken === 0) continue
    console.log(`\n--- ${slug}: 5 broken samples ---`)
    for (const it of (brokenSamples[slug] ?? [])) {
      console.log(`  ${it.slug} [${it.type}] :: ${it.reasons.join('; ')}`)
    }
    console.log(`--- ${slug}: 5 passing samples ---`)
    for (const s of (passingSamples[slug] ?? [])) console.log(`  ${s}`)
  }

  // ── Un-publish ──────────────────────────────────────────────────────────────
  if (flags.unpublish && toUnpublish.length > 0) {
    console.log(`\n=== UN-PUBLISHING ${toUnpublish.length} broken rows (status -> DRAFT) ===`)
    let done = 0
    // Sequential in small chunks to stay friendly to the pooled connection.
    const chunk = 25
    for (let i = 0; i < toUnpublish.length; i += chunk) {
      const slice = toUnpublish.slice(i, i + chunk)
      await Promise.all(slice.map((u) =>
        prisma.tutorial.update({
          where: { id: u.id },
          // publishedAt deliberately untouched -> preserves the audit trail.
          // slug untouched -> URL is stable for the rebuild + re-publish.
          data: { status: 'DRAFT', qcBlockReason: u.reason as object },
        }),
      ))
      done += slice.length
      if (done % 200 === 0 || done === toUnpublish.length) console.log(`  ${done}/${toUnpublish.length}`)
    }
    console.log(`un-published ${done} rows`)
  } else if (flags.unpublish) {
    console.log('\n=== --unpublish: nothing to do (0 broken) ===')
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
