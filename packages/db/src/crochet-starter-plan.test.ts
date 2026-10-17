/**
 * The starter-row plan: every added stitch count agrees with the June row's
 * own structured count, the fixed rows clear the completeness gate except
 * where the plan says they cannot, and a row whose text has changed is
 * refused rather than overwritten.
 *
 *   cd packages/db && npx tsx src/crochet-starter-plan.test.ts
 */

import assert from 'node:assert/strict'
import { applyRowFixes, estimateHoursFromStitches, planFix, STARTER_PLANS, type StarterRow } from './crochet-starter-plan'

/** A June-shaped row rebuilt from the plan's own `from` text and the counts. */
function juneRows(slug: string): StarterRow[] {
  const plan = STARTER_PLANS.find((p) => p.slug === slug)!
  return plan.fix.instructions.map((e, i) => {
    const row: StarterRow = {
      section: 'Pattern',
      rowLabel: e.rowLabel,
      rowNumber: i + 1,
      instruction: e.from,
      stitchCount: e.count,
      isRoundNotRow: !e.rowLabel.startsWith('Row'),
    }
    const note = plan.fix.helpNotes?.find((h) => h.rowLabel === e.rowLabel)
    if (note) row.helpNote = note.from
    if (plan.fix.dropRoundPhotos) row.referencePhotoMediaId = `photo-${i}`
    return row
  })
}

function juneInput(slug: string) {
  const plan = STARTER_PLANS.find((p) => p.slug === slug)!
  const motif = slug.includes('motif') || slug.startsWith('granny')
  return {
    name: 'A starter pattern',
    description: 'A starter pattern description that is long enough to tell a maker what it is.',
    difficulty: 'BEGINNER',
    terminologyConvention: 'uk',
    primaryYarnWeightId: 'yarn',
    primaryHookId: 'hook',
    gaugeText: plan.fix.gaugeText?.from ?? (slug.includes('hexagon') ? 'Rounds 1 and 2 make a hexagon about 9 cm point to point.' : '16 double crochet to 10 cm in 4-ply cotton on a 3 mm hook.'),
    finishedSizeText: 'About 10 cm, blocked.',
    estimatedHours: null,
    rowsStructured: juneRows(slug),
    chartData: { rows: [] },
    notions: [],
    abbreviationsUsed: ['ch', 'dc', 'tr', 'sl st'],
    craftStitchSlugs: ['crochet-chain'],
    pieceCount: 1,
    subCategorySlug: motif ? 'motif-granny-square' : 'edging',
    designerId: null,
  }
}

function main(): void {
  assert.equal(STARTER_PLANS.length, 6)

  // The time rule matches the bulk publisher's estimateHours.
  assert.equal(estimateHoursFromStitches(0), 1)
  assert.equal(estimateHoursFromStitches(400), 1)
  assert.equal(estimateHoursFromStitches(401), 2)

  for (const plan of STARTER_PLANS) {
    const out = planFix(juneInput(plan.slug), plan, 'house')
    assert.deepEqual(out.refusals, [], `${plan.slug} refused: ${out.refusals.join('; ')}`)
    assert.ok(out.fields)
    // Only the rules the plan names as unfixable still fail.
    assert.deepEqual(
      out.stillFailingRules.sort(),
      plan.fix.unfixable.map((u) => u.rule).sort(),
      `${plan.slug} still fails: ${out.stillFailing.join(' ')}`,
    )
    const rows = out.fields!.rowsStructured
    assert.equal(rows[rows.length - 1]?.instruction, plan.fix.finishingLine)
    assert.ok(rows.every((r) => !('referencePhotoMediaId' in r)) || !plan.fix.dropRoundPhotos)
    assert.ok(rows.every((r) => !/[—–]/.test(String(r.helpNote ?? '')) && !/[—–]/.test(String(r.instruction ?? ''))))
    // Every edit ends in exactly the count it claims.
    for (const e of plan.fix.instructions) assert.ok(e.to.endsWith(`(${e.count} sts)`), `${plan.slug} ${e.rowLabel}`)
  }

  // A count that disagrees with the stored stitchCount is refused.
  const picot = STARTER_PLANS.find((p) => p.slug === 'crochet-picot-edging')!
  const wrong = juneRows(picot.slug).map((r) => (r.rowLabel === 'Row 2' ? { ...r, stitchCount: 19 } : r))
  assert.ok(applyRowFixes(wrong, picot.fix).refusals.some((r) => r.includes('disagrees')))

  // A row whose text has changed since June is refused, and left untouched.
  const changed = juneRows(picot.slug).map((r) => (r.rowLabel === 'Row 2' ? { ...r, instruction: 'Something else.' } : r))
  const res = applyRowFixes(changed, picot.fix)
  assert.ok(res.refusals.some((r) => r.includes('no longer reads')))
  assert.equal(res.rows, changed)

  console.log('crochet-starter-plan: all assertions passed')
}

main()
