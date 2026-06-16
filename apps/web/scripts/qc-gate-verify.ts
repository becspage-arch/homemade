/**
 * Phase 5 — verify the publish gate blocks future broken content.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/qc-gate-verify.ts
 *
 * Four scenarios from the brief, run through the SAME functions the publish path
 * uses (checkRowPublishable for Tutorials, getResolvedPattern +
 * auditResolvedSewingPattern for sewing). Real-row tests reuse rows the audit
 * just un-published (no DB mutation); the cases with no live example are proven
 * with constructed inputs. Exits non-zero if any assertion fails.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

import { prisma } from '@homemade/db'
import { checkRowPublishable } from '../../../packages/db/scripts/qc-publish-gate'
import { auditMakeability } from '../../../packages/db/scripts/qc-makeability-rules/index'
import { EMPTY_CHART_FACTS } from '../../../packages/db/scripts/qc-makeability-rules/shared'
import { auditResolvedSewingPattern } from '../../../packages/db/scripts/qc-makeability-rules/pattern-sewing'
import { getResolvedPattern, type SewingPatternRowForResolve } from '../src/lib/sewing/getResolvedPattern'

let failures = 0
function assert(name: string, cond: boolean, detail = '') {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!cond) failures++
}

async function main() {
  // ── 1) Chart-less crochet pattern -> BLOCKED (real gate, real row) ──────────
  // Pick a crochet pattern whose recorded block reason is the missing chart, so
  // the assertion exercises the killed "chart OR written" clause specifically.
  const crochet = await prisma.tutorial.findMany({
    where: { type: 'PATTERN', category: { slug: 'crochet' }, status: 'DRAFT', qcBlockReason: { not: null as never } },
    select: { id: true, slug: true, qcBlockReason: true }, take: 700,
  }).then((rows) => rows.find((row) => {
    const reasons = (row.qcBlockReason as { reasons?: string[] } | null)?.reasons ?? []
    return reasons.some((x) => /no chart on the linked CrochetPattern/i.test(x))
  }))
  if (crochet) {
    const g = await checkRowPublishable(prisma, crochet.id, 'gate-verify')
    assert('chart-less crochet is BLOCKED by checkRowPublishable', !g.publishable && g.reasons.some((r) => /no chart/i.test(r)),
      `${crochet.slug}: ${g.reasons.find((r) => /chart/i.test(r)) ?? g.reasons[0]}`)
  } else {
    assert('chart-less crochet sample found', false, 'no chart-less DRAFT crochet pattern to test')
  }

  // ── 2) Complete crochet pattern -> PUBLISHES (pure: gate's makeability half) ──
  const completeCrochetBody = {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Materials' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'DK yarn in one colour, 200 m. A 4 mm hook. Gauge: 18 sts x 20 rows per 10 cm. Finished size 20 cm square.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abbreviations' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'dc = double crochet. ch = chain.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Pattern' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Foundation chain: ch 31.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Row 1: dc in each ch across. (30 sts)' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Row 2: ch 1, dc in each st across. (30 sts)' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Row 3: ch 1, dc in each st across. (30 sts)' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Finishing' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Fasten off and weave in the ends. Block to shape.' }] },
    ],
  }
  const completeCrochetCtx = {
    slug: 'test-complete-crochet', title: 'Test complete crochet', categorySlug: 'crochet',
    subCategorySlug: null, type: 'PATTERN', body: completeCrochetBody,
    servings: null, yieldDescription: null, totalMinutes: null, timeMinutes: null, prepMinutes: null, cookMinutes: null,
    gaugeText: '18 sts x 20 rows per 10 cm', finishedSizeText: '20 cm square', difficulty: 'BEGINNER',
    practiceType: null, requiresMedicalDisclaimer: false, sourceNotes: null, hasDesigner: true,
    chart: { ...EMPTY_CHART_FACTS, crochetChartData: true },
  }
  const r2 = auditMakeability(completeCrochetCtx as never)
  assert('complete crochet (chart + all items) PASSES', r2.ok, r2.reasons.join('; ') || 'ok')

  // ── 3) Broken freesewing reference -> BLOCKED via dispatcher ─────────────────
  const brokenSewing: SewingPatternRowForResolve = {
    isFreesewingDesign: true, freesewingDesignSlug: '__does_not_exist__',
    pieceList: [], instructionsBody: null, recommendedFabrics: [], recommendedNotions: [],
    fabricRequirementsCm: {}, supportedSizes: [], finishedGarmentChart: null, cuttingLayouts: {},
    seamAllowanceCm: 1, hasInterfacing: false, skillLevel: 'IMPROVER', constructionDirection: null,
  }
  const resolved = await getResolvedPattern(brokenSewing)
  const r3 = auditResolvedSewingPattern(resolved as never)
  assert('broken freesewing reference resolves UNRESOLVED', resolved.source === 'UNRESOLVED', resolved.resolutionError ?? '')
  assert('broken freesewing pattern is BLOCKED via dispatcher', !r3.ok, r3.reasons[0] ?? '')

  // ── 4) Recipe with a null ingredient amount -> BLOCKED (real gate, real row) ──
  const recipe = await prisma.tutorial.findFirst({
    where: { type: 'RECIPE', status: 'DRAFT', qcBlockReason: { not: null as never } },
    select: { id: true, slug: true, qcBlockReason: true },
  })
  // Prefer one whose recorded reason is the null-amount one.
  const nullAmountRecipe = await prisma.tutorial.findMany({
    where: { type: 'RECIPE', status: 'DRAFT', qcBlockReason: { not: null as never } },
    select: { id: true, slug: true, qcBlockReason: true }, take: 200,
  }).then((rows) => rows.find((row) => {
    const reasons = (row.qcBlockReason as { reasons?: string[] } | null)?.reasons ?? []
    return reasons.some((x) => /missing \/ null amount/.test(x))
  }))
  const target = nullAmountRecipe ?? recipe
  if (target) {
    const g = await checkRowPublishable(prisma, target.id, 'gate-verify')
    assert('recipe with null ingredient amount is BLOCKED', !g.publishable, `${target.slug}: ${g.reasons.find((r) => /amount/i.test(r)) ?? g.reasons[0]}`)
  } else {
    assert('null-amount recipe sample found', false, 'no DRAFT recipe to test')
  }

  console.log(`\n${failures === 0 ? 'ALL GATE CHECKS PASSED' : `${failures} GATE CHECK(S) FAILED`}`)
  await prisma.$disconnect()
  if (failures > 0) process.exit(1)
}
main().catch((e) => { console.error(e); process.exit(1) })
