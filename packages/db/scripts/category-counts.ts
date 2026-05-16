/**
 * category-counts — print a markdown grid of per-category published + draft
 * counts plus a per-type (RECIPE / TECHNIQUE / PRACTICE / READING) roll-up.
 * Worker sessions paste the output into BUILD_PROGRESS.md as a snapshot of
 * the Multi-category fill plan.
 *
 *   pnpm --filter db run counts
 *
 * Runs against whichever database `DATABASE_URL` points at (production by
 * default in the deployed envs).
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma, TutorialStatus, TutorialType } from '../src'

interface CategoryRow {
  name: string
  slug: string
  published: number
  draft: number
  target: number | null
  isPublicVisible: boolean
}

interface TypeRow {
  type: string
  published: number
  draft: number
}

function fmt(n: number): string {
  return n.toLocaleString('en-GB')
}

function markdownTable(rows: CategoryRow[]): string {
  const header = '| Category | Slug | Published | Draft | Target | Fill % | Public |'
  const divider = '|---|---|---:|---:|---:|---:|:---:|'
  const body = rows
    .map((r) => {
      const fill =
        r.target != null && r.target > 0
          ? `${Math.min(100, Math.round((r.published / r.target) * 100))}%`
          : '—'
      const target = r.target != null ? fmt(r.target) : '—'
      const visible = r.isPublicVisible ? '✓' : '—'
      return `| ${r.name} | \`${r.slug}\` | ${fmt(r.published)} | ${fmt(r.draft)} | ${target} | ${fill} | ${visible} |`
    })
    .join('\n')
  const totals = rows.reduce(
    (acc, r) => ({
      pub: acc.pub + r.published,
      drf: acc.drf + r.draft,
      tgt: acc.tgt + (r.target ?? 0),
    }),
    { pub: 0, drf: 0, tgt: 0 },
  )
  const totalFill =
    totals.tgt > 0
      ? `${Math.min(100, Math.round((totals.pub / totals.tgt) * 100))}%`
      : '—'
  const footer = `| **All categories** |  | **${fmt(totals.pub)}** | **${fmt(totals.drf)}** | **${fmt(totals.tgt)}** | **${totalFill}** |  |`
  return [header, divider, body, footer].join('\n')
}

function typeTable(rows: TypeRow[]): string {
  const header = '| Type | Published | Draft | Total |'
  const divider = '|---|---:|---:|---:|'
  const body = rows
    .map(
      (r) => `| ${r.type} | ${fmt(r.published)} | ${fmt(r.draft)} | ${fmt(r.published + r.draft)} |`,
    )
    .join('\n')
  return [header, divider, body].join('\n')
}

async function main(): Promise<void> {
  const [categories, pubByCategory, drfByCategory, pubByType, drfByType] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        targetTutorialCount: true,
        isPublicVisible: true,
      },
    }),
    prisma.tutorial.groupBy({
      by: ['categoryId'],
      where: { status: TutorialStatus.PUBLISHED },
      _count: { _all: true },
    }),
    prisma.tutorial.groupBy({
      by: ['categoryId'],
      where: { status: TutorialStatus.DRAFT },
      _count: { _all: true },
    }),
    prisma.tutorial.groupBy({
      by: ['type'],
      where: { status: TutorialStatus.PUBLISHED },
      _count: { _all: true },
    }),
    prisma.tutorial.groupBy({
      by: ['type'],
      where: { status: TutorialStatus.DRAFT },
      _count: { _all: true },
    }),
  ])

  const pubMap = new Map(pubByCategory.map((r) => [r.categoryId, r._count._all]))
  const drfMap = new Map(drfByCategory.map((r) => [r.categoryId, r._count._all]))
  const catRows: CategoryRow[] = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    published: pubMap.get(c.id) ?? 0,
    draft: drfMap.get(c.id) ?? 0,
    target: c.targetTutorialCount,
    isPublicVisible: c.isPublicVisible,
  }))

  const pubTypeMap = new Map(pubByType.map((r) => [r.type, r._count._all]))
  const drfTypeMap = new Map(drfByType.map((r) => [r.type, r._count._all]))
  const typeRows: TypeRow[] = Object.values(TutorialType).map((t) => ({
    type: t,
    published: pubTypeMap.get(t) ?? 0,
    draft: drfTypeMap.get(t) ?? 0,
  }))

  const generatedAt = new Date().toISOString()

  process.stdout.write(`# Category counts\n\n_Snapshot ${generatedAt}_\n\n`)
  process.stdout.write('## Per category\n\n')
  process.stdout.write(markdownTable(catRows))
  process.stdout.write('\n\n## Per type\n\n')
  process.stdout.write(typeTable(typeRows))
  process.stdout.write('\n')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
