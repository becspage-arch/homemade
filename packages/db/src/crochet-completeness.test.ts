/**
 * The crochet completeness gate, tested against a row that passes and a row
 * that fails.
 *
 * The gate is the last thing between a generated candidate and the live
 * catalogue, so both directions matter equally: a rule that never fires lets
 * skeleton patterns ship, and a rule that fires on a good row stops the
 * autopilot dead. The passing fixture is the shape the bulk publisher actually
 * writes (the loom's own written rounds, a chart, real materials); the failing
 * one is the same row with each rule broken once.
 *
 *   cd packages/db && npx tsx src/crochet-completeness.test.ts
 */

import assert from 'node:assert/strict'
import { abbreviationsIn, checkCrochetPatternCompleteness, type CrochetCompletenessInput } from './crochet-completeness'

// ── A row the bulk publisher would write ─────────────────────────────────────

/** The loom's own written rounds for an 18 x 20 plain coaster. */
function coasterRows(): { section: string; rowNumber: number; rowLabel: string; instruction: string; stitchCount: number }[] {
  const rows = [
    { section: 'Body', rowNumber: 1, rowLabel: 'Foundation', instruction: 'Foundation: ch 19. (18 sts)', stitchCount: 18 },
  ]
  for (let i = 1; i <= 20; i++) {
    rows.push({
      section: 'Body',
      rowNumber: i + 1,
      rowLabel: `Row ${i}`,
      instruction: `Row ${i}: ch 1, turn, dc in next 18 sts. (18 sts)`,
      stitchCount: 18,
    })
  }
  rows.push({
    section: 'Body',
    rowNumber: 22,
    rowLabel: 'Fasten off and weave in the end.',
    instruction: 'Fasten off and weave in the end.',
    stitchCount: 0,
  })
  return rows
}

const GOOD: CrochetCompletenessInput = {
  name: 'Sage solid coaster',
  description:
    'A plain one-colour coaster worked flat in rows of double crochet. Worked in one shade, sage. It comes out about 10.0 by 10.0 cm.',
  designerId: 'designer_house',
  difficulty: 'BEGINNER',
  estimatedHours: 1,
  terminologyConvention: 'uk',
  primaryYarnWeightId: 'yarn_aran',
  primaryHookId: 'hook_5mm',
  gaugeText: '18 sts x 20 rows = 10 cm (UK terms) in worsted',
  finishedSizeText: 'About 10.0 by 10.0 cm.',
  rowsStructured: coasterRows(),
  chartData: { title: 'Sage solid coaster', layout: 'flat', craft: 'crochet', rows: [] },
  notions: ['Tapestry needle for weaving in the ends', 'Stitch markers'],
  abbreviationsUsed: ['ch', 'dc'],
  craftStitchSlugs: ['crochet-chain', 'crochet-double-uk'],
  pieceCount: 1,
  subCategorySlug: 'coaster',
}

// ── A multi-piece row (an amigurumi), which is written-only by design ────────

const GOOD_AMIGURUMI: CrochetCompletenessInput = {
  ...GOOD,
  name: 'Little rust bear',
  description:
    'A sitting bear worked in pieces and sewn together. Worked in 2 shades, rust and oatmeal. The finished toy stands about 7.1 cm tall.',
  difficulty: 'INTERMEDIATE',
  estimatedHours: 3,
  finishedSizeText: 'About 4.4 by 7.1 cm.',
  chartData: null,
  pieceCount: 2,
  subCategorySlug: 'amigurumi',
  safetyNotes:
    'Safety eyes are a choking hazard. For a child under three, embroider the eyes and nose in yarn instead and make sure every seam is closed.',
  notions: ['Toy stuffing', 'Tapestry needle', 'Stitch marker', 'Safety eyes, 6 mm'],
  abbreviationsUsed: ['dc', 'dc2tog'],
  craftStitchSlugs: ['crochet-double-uk', 'crochet-magic-ring'],
  pieces: [
    { name: 'Body', sectionLabel: 'Body', makeQuantity: 1, rounds: [6, 12, 18, 18, 12, 6], stitchCountTotal: 72 },
    { name: 'Ears', sectionLabel: 'Ears', makeQuantity: 2, rounds: [6, 12, 12, 6], stitchCountTotal: 36 },
  ],
  buildOrder: ['Body', 'Ears', 'Assembly'],
  rowsStructured: [
    { section: 'Body', rowNumber: 1, rowLabel: 'Round 1', instruction: 'Round 1: 6 dc into a magic ring. (6 sts)' },
    { section: 'Body', rowNumber: 2, rowLabel: 'Round 2', instruction: 'Round 2: 2 dc in each st around. (12 sts)' },
    { section: 'Ears', rowNumber: 1, rowLabel: 'Round 1', instruction: 'Round 1: 6 dc into a magic ring. (6 sts)' },
    { section: 'Ears', rowNumber: 2, rowLabel: 'Round 2', instruction: 'Round 2: 2 dc in each st around. (12 sts)' },
    { section: 'Assembly', rowNumber: 1, rowLabel: 'Step 1', instruction: 'Sew the ears to the body, stuffing firmly as you close each piece.' },
  ],
}

// ── Tests ───────────────────────────────────────────────────────────────────

function main(): void {
  // A complete single-piece row passes.
  const good = checkCrochetPatternCompleteness(GOOD)
  assert.equal(good.blocked, false, `a complete coaster should pass, got: ${good.reasons.join(' | ')}`)

  // A complete multi-piece row passes without a chart, because a composition is
  // written-only by design and carries the stricter per-piece rules instead.
  const goodAmi = checkCrochetPatternCompleteness(GOOD_AMIGURUMI)
  assert.equal(goodAmi.blocked, false, `a complete amigurumi should pass, got: ${goodAmi.reasons.join(' | ')}`)

  // A row with an uncounted round is blocked.
  const uncounted = checkCrochetPatternCompleteness({
    ...GOOD,
    rowsStructured: [
      ...coasterRows().slice(0, 5),
      { section: 'Body', rowNumber: 6, rowLabel: 'Row 5', instruction: 'Row 5: ch 1, turn, dc in next 18 sts.' },
    ],
  })
  assert.equal(uncounted.blocked, true)
  assert.ok(uncounted.rules.includes('row-stitch-counts'), uncounted.rules.join(','))

  // An open-ended repeat is blocked; "in each st around" is not.
  const openEnded = checkCrochetPatternCompleteness({
    ...GOOD,
    rowsStructured: [
      { section: 'Body', rowNumber: 1, rowLabel: 'Row 1', instruction: 'Row 1: ch 1, turn, dc in each st to end. (18 sts)' },
    ],
  })
  assert.ok(openEnded.rules.includes('repeats-enumerated'))
  const around = checkCrochetPatternCompleteness({
    ...GOOD_AMIGURUMI,
    rowsStructured: [
      ...(GOOD_AMIGURUMI.rowsStructured as unknown[]),
      { section: 'Body', rowNumber: 3, rowLabel: 'Round 3', instruction: 'Round 3: dc in each st around. (12 sts)' },
    ],
  })
  assert.ok(!around.rules.includes('repeats-enumerated'), 'worked in the round is not an open-ended repeat')

  // A single-piece row with no chart is blocked.
  const noChart = checkCrochetPatternCompleteness({ ...GOOD, chartData: null })
  assert.ok(noChart.rules.includes('chart'))

  // Missing materials are blocked, one rule each.
  const bare = checkCrochetPatternCompleteness({
    ...GOOD,
    primaryYarnWeightId: null,
    primaryHookId: null,
    gaugeText: null,
    finishedSizeText: null,
    notions: [],
  })
  for (const rule of ['yarn-weight', 'hook', 'gauge', 'finished-size', 'notions']) {
    assert.ok(bare.rules.includes(rule), `expected ${rule} in ${bare.rules.join(',')}`)
  }

  // A finished size stated in inches is blocked: centimetres are canonical.
  const inches = checkCrochetPatternCompleteness({ ...GOOD, finishedSizeText: 'About 4 by 4 inches.' })
  assert.ok(inches.rules.includes('finished-size-units'))

  // An abbreviation the instructions use but the key does not explain is blocked.
  const missingKey = checkCrochetPatternCompleteness({ ...GOOD, abbreviationsUsed: ['ch'] })
  assert.ok(missingKey.rules.includes('abbreviations'))

  // A toy with no safety notes is blocked.
  const unsafeToy = checkCrochetPatternCompleteness({ ...GOOD_AMIGURUMI, safetyNotes: null })
  assert.ok(unsafeToy.rules.includes('safety-notes'))

  // A multi-piece row whose build order misses a piece is blocked.
  const shortOrder = checkCrochetPatternCompleteness({ ...GOOD_AMIGURUMI, buildOrder: ['Body', 'Assembly'] })
  assert.ok(shortOrder.rules.includes('build-order-coverage'))

  // Voice: a long dash and a banned phrase both block.
  const dash = checkCrochetPatternCompleteness({ ...GOOD, name: 'Sage coaster — a simple square' })
  assert.ok(dash.rules.includes('voice-dash'))
  const banned = checkCrochetPatternCompleteness({
    ...GOOD,
    description: 'A plain one-colour coaster worked flat in rows of double crochet. Honestly the best first project there is.',
  })
  assert.equal(banned.blocked, true)

  // A placeholder or a broken value never reaches the catalogue.
  const broken = checkCrochetPatternCompleteness({
    ...GOOD,
    rowsStructured: [
      { section: 'Body', rowNumber: 1, rowLabel: 'Row 1', instruction: 'Row 1: ch 1, turn, dc in next undefined sts. (18 sts)' },
    ],
  })
  assert.ok(broken.rules.includes('placeholder'))

  // The abbreviation reader does not read dc2tog as a bare dc.
  assert.deepEqual(abbreviationsIn('Round 8: [dc2tog] 6 times. (6 sts)'), ['dc2tog'])
  assert.deepEqual(abbreviationsIn('Foundation: ch 19. (18 sts)'), ['ch'])

  console.log('crochet-completeness: all assertions passed')
}

main()
