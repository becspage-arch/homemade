/**
 * CROCHET GO-LIVE CHECK — read-only.
 *
 * Runs every go-live gate code can decide against the live database and the
 * search index, and lists the ones a person has to do (the Step E vision sweep,
 * the premium config, Rebecca's sign-off). The rules live in
 * `src/crochet-golive.ts`; this only gathers the data.
 *
 * It WRITES NOTHING to the database and never touches visibility. With
 * `--sweep-list <file>` it writes a CSV (slug, name, shelf, image) of every
 * public pattern to a local file, which is the list the Step E sweep works
 * through. With `--json <file>` it writes the report.
 *
 * `--vision-signed-off` and `--premium-checked` mark those two manual gates
 * done once they are, so the report can come back ready.
 *
 * `--overlay <file>` answers "what would this change flip?" without making it:
 * a JSON map of slug to { visibility?: 'PRIVATE', set?: { field: value } } is
 * laid over the live rows in memory before the gates run (a PRIVATE row drops
 * out of the public set). `crochet-starter-fix.ts --overlay-out` writes one.
 * The database is still only read.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/crochet-golive-check.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/crochet-golive-check.ts --sweep-list /tmp/crochet-sweep.csv
 *
 * Exit code 0 when every gate passes (only the switch is left), 1 otherwise.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 8; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) {
      loadEnv({ path: c, override: true, quiet: true })
      break
    }
    const p = dirname(dir)
    if (p === dir) break
    dir = p
  }
}

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] ?? null : null
}

/** The public pattern page the sitemap would list; the gate passes once it exists. */
const PATTERN_PAGE = resolve(__dirname, '../../../apps/web/src/app/(public)/crochet/patterns/[slug]/page.tsx')

function csv(v: string | null | undefined): string {
  const s = v ?? ''
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main(): Promise<void> {
  const { prisma, crochetHeroMedia } = await import('../src/index.js')
  const { evaluateCrochetGoLive } = await import('../src/crochet-golive.js')

  const category = await prisma.category.findUnique({
    where: { slug: 'crochet' },
    select: { id: true, description: true, isPublicVisible: true },
  })
  if (!category) throw new Error('no crochet category')

  const media = { select: { cloudflareId: true, r2Key: true } } as const
  const raw = await prisma.crochetPattern.findMany({
    where: { ownerUserId: null, visibility: 'PUBLIC', publishedAt: { not: null } },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      difficulty: true,
      terminologyConvention: true,
      primaryYarnWeightId: true,
      primaryHookId: true,
      gaugeText: true,
      finishedSizeText: true,
      estimatedHours: true,
      rowsStructured: true,
      chartData: true,
      notions: true,
      safetyNotes: true,
      abbreviationsUsed: true,
      specialStitchesUsed: true,
      craftStitchSlugs: true,
      pieces: true,
      buildOrder: true,
      pieceCount: true,
      designerId: true,
      subCategory: { select: { slug: true } },
      loomHero: media,
      hero: media,
      thumbnail: media,
    },
    orderBy: { slug: 'asc' },
  })

  const assignments = await prisma.collectionTagAssignment.findMany({
    where: { contentType: 'CROCHET_PATTERN', contentId: { in: raw.map((r) => r.id) } },
    select: { contentId: true, tag: { select: { axis: true } } },
  })
  const tagCount = new Map<string, number>()
  const styleCount = new Map<string, number>()
  for (const a of assignments) {
    tagCount.set(a.contentId, (tagCount.get(a.contentId) ?? 0) + 1)
    if (a.tag.axis === 'STYLE') styleCount.set(a.contentId, (styleCount.get(a.contentId) ?? 0) + 1)
  }

  const rows = raw.map((r) => {
    const { subCategory, loomHero, hero, thumbnail, difficulty, ...rest } = r
    return {
      ...rest,
      difficulty: difficulty ?? null,
      subCategorySlug: subCategory?.slug ?? null,
      hasImage: crochetHeroMedia({ loomHero, hero, thumbnail }) !== null,
      image: crochetHeroMedia({ loomHero, hero, thumbnail }),
      tagCount: tagCount.get(r.id) ?? 0,
      styleTagCount: styleCount.get(r.id) ?? 0,
    }
  })

  const overlayFile = arg('--overlay')
  if (overlayFile) {
    const overlay = JSON.parse(readFileSync(overlayFile, 'utf8')) as Record<string, { visibility?: string; set?: Record<string, unknown> }>
    let dropped = 0
    let changed = 0
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i]
      const entry = row?.slug ? overlay[row.slug] : undefined
      if (!row || !entry) continue
      if (entry.visibility === 'PRIVATE') {
        rows.splice(i, 1)
        dropped++
      } else if (entry.set) {
        rows[i] = { ...row, ...entry.set } as typeof row
        changed++
      }
    }
    console.log(`SIMULATED with overlay ${overlayFile}: ${dropped} row(s) taken out of the public set, ${changed} changed in memory. Nothing is written.`)
  }

  const shelves = await prisma.subCategory.findMany({
    where: { categoryId: category.id },
    select: { slug: true, name: true, description: true },
    orderBy: { slug: 'asc' },
  })

  // Search: what the live index holds (read-only export of the crochet collection).
  let searchIndexCount: number | null = null
  let searchDocsWithImage: number | null = null
  try {
    const { getAdminClient, CROCHET_PATTERNS_COLLECTION } = await import('@homemade/search')
    const client = getAdminClient()
    if (client) {
      const jsonl = await client.collections(CROCHET_PATTERNS_COLLECTION).documents().export()
      const docs = String(jsonl)
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => JSON.parse(l) as { heroR2Key?: string | null; heroCloudflareId?: string | null })
      searchIndexCount = docs.length
      searchDocsWithImage = docs.filter((d) => d.heroR2Key || d.heroCloudflareId).length
    }
  } catch (err) {
    console.warn(`[crochet-golive] search index not readable: ${err instanceof Error ? err.message : String(err)}`)
  }

  const report = evaluateCrochetGoLive({
    rows,
    category: { description: category.description },
    shelves,
    searchIndexCount,
    searchDocsWithImage,
    patternPageRoute: existsSync(PATTERN_PAGE),
    visionSweepSignedOff: process.argv.includes('--vision-signed-off'),
    premiumChecked: process.argv.includes('--premium-checked'),
  })

  const mark = { pass: 'PASS  ', fail: 'FAIL  ', manual: 'TO DO ' } as const
  console.log(`Crochet go-live check (read-only). Category visible now: ${category.isPublicVisible ? 'yes' : 'no'}`)
  for (const g of report.gates) {
    console.log(`${mark[g.status]} ${g.name}: ${g.summary}`)
    for (const item of g.items.slice(0, 40)) console.log(`         - ${item}`)
    if (g.items.length > 40) console.log(`         ... and ${g.items.length - 40} more`)
  }
  console.log(report.ready ? '\nREADY: every gate passes. The switch is Rebecca\'s.' : '\nNOT READY.')

  const sweep = arg('--sweep-list')
  if (sweep) {
    const lines = ['slug,name,shelf,image']
    for (const r of rows) lines.push([r.slug, r.name, r.subCategorySlug, r.image?.r2Key ?? r.image?.cloudflareId ?? ''].map(csv).join(','))
    writeFileSync(sweep, lines.join('\n') + '\n')
    console.log(`Sweep list (${rows.length}) -> ${sweep}`)
  }
  const json = arg('--json')
  if (json) {
    writeFileSync(json, JSON.stringify({ at: new Date().toISOString(), ...report }, null, 2))
    console.log(`Report -> ${json}`)
  }

  await prisma.$disconnect()
  process.exitCode = report.ready ? 0 : 1
}

main().catch((err) => {
  console.error('[crochet-golive] failed', err)
  process.exit(2)
})
