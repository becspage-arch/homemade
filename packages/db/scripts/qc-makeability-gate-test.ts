/**
 * End-to-end test for the makeability publish gate (Phase 4).
 *
 *   tsx scripts/qc-makeability-gate-test.ts
 *
 * Constructs two ephemeral DRAFT cross-stitch PATTERN rows — one chart-less,
 * one with a real linked chart — runs the shared gated publish path
 * (gatedPublishDrafts, the autopilot batch-flip gate), and asserts:
 *   - the chart-less pattern is BLOCKED and stays DRAFT;
 *   - the charted pattern PUBLISHES.
 * Cleans up its own fixtures afterwards. Touches no real content row.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

const CHARTLESS = '_test-makeability-chartless-xstitch'
const CLEAN = '_test-makeability-clean-xstitch'

function bodyWithMaterials(extra = '') {
  return {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: `A small counted cross-stitch motif worked on 28-count linen.${extra} Work each area from the bottom of the chart upward, completing each row before moving to the next one.` }] },
      { type: 'suppliesCard', attrs: { items: [
        { label: 'Fabric', value: '28-count linen, 25 x 25 cm' },
        { label: 'Thread', value: 'DMC 310 black, DMC 920 rust' },
        { label: 'Needle', value: 'Size 26 tapestry needle' },
        { label: 'Hoop', value: '15 cm embroidery hoop' },
      ] } },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Working order' }] },
      { type: 'orderedList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mark the centre of the fabric and mount it in the hoop.' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Stitch the main fill in DMC 920, then outline in DMC 310.' }] }] },
      ] },
    ],
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const { gatedPublishDrafts } = await import('./qc-gated-publish.js')

  // Borrow categoryId / subCategoryId / authorId from a real cross-stitch row.
  const seed = await prisma.tutorial.findFirst({
    where: { category: { slug: 'cross-stitch' }, type: 'PATTERN' },
    select: { categoryId: true, subCategoryId: true, authorId: true },
  })
  if (!seed) { console.error('no cross-stitch PATTERN row to borrow ids from'); process.exit(1) }

  // Clean up any leftover fixtures from a prior run.
  await prisma.pattern.deleteMany({ where: { slug: { in: [CLEAN + '-pattern'] } } })
  await prisma.tutorial.deleteMany({ where: { slug: { in: [CHARTLESS, CLEAN] } } })

  // Fixture A — chart-less cross-stitch PATTERN (no chart anywhere).
  const a = await prisma.tutorial.create({
    data: {
      slug: CHARTLESS, title: 'TEST chart-less cross-stitch', type: 'PATTERN',
      status: 'DRAFT', body: bodyWithMaterials(), sourceNotes: 'Designed by the Test House.',
      categoryId: seed.categoryId, subCategoryId: seed.subCategoryId, authorId: seed.authorId,
    },
    select: { id: true },
  })

  // Fixture B — cross-stitch PATTERN with a real linked chart + designer.
  const pattern = await prisma.pattern.create({
    data: {
      slug: CLEAN + '-pattern', type: 'CROSS_STITCH', name: 'TEST charted motif',
      data: { cells: [{ x: 0, y: 0, symbol: 'A' }, { x: 1, y: 0, symbol: 'B' }], symbols: ['A', 'B'] },
      widthCells: 20, heightCells: 20, colourCount: 2, totalStitches: 120,
    },
    select: { id: true },
  })
  const b = await prisma.tutorial.create({
    data: {
      slug: CLEAN, title: 'TEST charted cross-stitch', type: 'PATTERN',
      status: 'DRAFT', body: bodyWithMaterials(), sourceNotes: 'Designed by the Test House.',
      categoryId: seed.categoryId, subCategoryId: seed.subCategoryId, authorId: seed.authorId,
      patternId: pattern.id,
    },
    select: { id: true },
  })

  // Run the shared gated publish path over just these two fixtures.
  const res = await gatedPublishDrafts(prisma, { slug: { in: [CHARTLESS, CLEAN] } }, { source: 'gate-test' })

  const aAfter = await prisma.tutorial.findUnique({ where: { id: a.id }, select: { status: true, qcBlockReason: true } })
  const bAfter = await prisma.tutorial.findUnique({ where: { id: b.id }, select: { status: true } })

  const aReason = (aAfter?.qcBlockReason as { reasons?: string[] } | null)?.reasons ?? []
  console.log(`\ngatedPublishDrafts: candidates=${res.candidates} published=${res.published} blocked=${res.blocked}`)
  console.log(`A (chart-less): status=${aAfter?.status}  reasons=${JSON.stringify(aReason)}`)
  console.log(`B (charted):    status=${bAfter?.status}`)

  const aOk = aAfter?.status === 'DRAFT' && aReason.some((r) => /chart/i.test(r))
  const bOk = bAfter?.status === 'PUBLISHED'

  // Cleanup fixtures.
  await prisma.tutorial.deleteMany({ where: { slug: { in: [CHARTLESS, CLEAN] } } })
  await prisma.pattern.deleteMany({ where: { id: pattern.id } })

  console.log(`\nASSERT chart-less BLOCKED + DRAFT: ${aOk ? 'PASS' : 'FAIL'}`)
  console.log(`ASSERT charted PUBLISHES:         ${bOk ? 'PASS' : 'FAIL'}`)
  await prisma.$disconnect()
  if (!aOk || !bOk) process.exit(1)
  console.log('\nALL GATE TESTS PASSED')
}
main().catch((e) => { console.error(e); process.exit(1) })
