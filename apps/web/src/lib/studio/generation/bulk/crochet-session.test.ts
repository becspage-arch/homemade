/**
 * THE SESSION CONTRACT, tested.
 *
 * Everything a Claude session hands the crochet autopilot arrives as a file it
 * typed by hand: briefs, design recipes, verdicts. There is no compiler between
 * the session and the pipeline, so this schema IS the compiler, and a hole in it
 * is a half-published row or a Fargate task spent on a design that could never
 * build. These tests pin the refusals that matter.
 *
 * Run it the way the other bulk tests run:
 *   cd apps/web && npx tsx --conditions=react-server \
 *     src/lib/studio/generation/bulk/crochet-session.test.ts
 */

import assert from 'node:assert/strict'
import {
  SessionBriefSchema,
  CrochetDesignSchema,
  SessionVerdictSchema,
  RunManifestSchema,
  parseBriefs,
  parseDesigns,
  parseVerdicts,
  parseManifest,
  emptyManifest,
  upsertCandidate,
  findCandidate,
  manifestCounters,
  backlogConsumed,
  toCrochetBrief,
  MAX_DESIGN_ATTEMPTS,
  type ManifestCandidate,
} from './crochet-session'
import { findSubjectKeyMatch } from './subject-key'
import { estimateCrochetCost, fargateRenderUsd, ASSUMED_PASS_RATE } from './crochet-cost'

const results: { name: string; passed: boolean; detail?: string }[] = []

function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

/** A brief that is fine, as the base for the ones that are not. */
const GOOD_BRIEF = {
  slug: 'crochet-sage-ridge-cloth',
  name: 'Sage ridge cloth',
  subject: 'A square kitchen cloth in soft sage worked in bands of ridged loop stitches',
  shelf: 'dishcloth',
  treatment: 'grid-texture' as const,
  look: 'soft-modern',
  territory: 'botanical-floral',
  palette: 'wildflower-meadow',
  size: 'medium' as const,
  difficulty: 'beginner' as const,
}

const GOOD_DESIGN = {
  treatment: 'grid-texture' as const,
  cols: 34,
  bands: [
    { rows: 4, stitch: 'sc' as const, colourKey: 'sage' },
    { rows: 3, stitch: 'hdc' as const, colourKey: 'sage' },
    { rows: 4, stitch: 'scblo' as const, colourKey: 'cream' },
  ],
  palette: { sage: '#8aa06a', cream: '#fbf6ea' },
  baseColourKey: 'sage',
}

const GOOD_RUBRIC = {
  isTheThingAsked: true,
  fabricRealAndWhole: true,
  coloursAreThePatterns: true,
  stagedAsAFinishedObject: true,
  nothingElseInFrame: true,
  limbsPlacedLikeARealToy: null,
  notANearDuplicate: true,
}

// ── Briefs ──────────────────────────────────────────────────────────────────

check('a well-formed brief parses', () => {
  const r = SessionBriefSchema.safeParse(GOOD_BRIEF)
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('a brief with a typo in a field name is refused, not silently dropped', () => {
  const r = SessionBriefSchema.safeParse({ ...GOOD_BRIEF, treatmnet: 'disc' })
  assert.equal(r.success, false)
})

check('a one-word concept is refused — the subject key would be meaningless', () => {
  const r = SessionBriefSchema.safeParse({ ...GOOD_BRIEF, subject: 'a cloth' })
  assert.equal(r.success, false)
})

check('an invented treatment is refused', () => {
  const r = SessionBriefSchema.safeParse({ ...GOOD_BRIEF, treatment: 'grid-cables' })
  assert.equal(r.success, false)
})

check('a slug with capitals or spaces is refused', () => {
  assert.equal(SessionBriefSchema.safeParse({ ...GOOD_BRIEF, slug: 'Sage Ridge Cloth' }).success, false)
})

check('parseBriefs names the field and the row that is wrong', () => {
  const r = parseBriefs([GOOD_BRIEF, { ...GOOD_BRIEF, slug: 'x' }])
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.ok(r.errors.some((e) => e.includes('1.slug')), r.errors.join(' | '))
})

check('toCrochetBrief derives the subject key rather than trusting one', () => {
  const full = toCrochetBrief(GOOD_BRIEF, 'Dishcloths & Cloths')
  assert.ok(full.subjectKey.length > 0)
  assert.equal(full.source, 'session')
  assert.equal(full.plannerMode, 'session')
  assert.equal(full.shelfName, 'Dishcloths & Cloths')
  assert.equal(full.brief.itemType, GOOD_BRIEF.shelf)
})

check('two phrasings of the same idea land close enough for the duplicate guard', () => {
  const a = toCrochetBrief(GOOD_BRIEF, 'x').subjectKey
  const b = toCrochetBrief(
    { ...GOOD_BRIEF, slug: 'crochet-other', subject: 'A soft sage square kitchen cloth in ridged loop stitch bands' },
    'x',
  ).subjectKey
  // Not string-equal — the key keeps word order — but the guard matches on
  // token overlap, and it is the guard's verdict that has to hold.
  assert.notEqual(a, b)
  assert.equal(findSubjectKeyMatch(a, new Set([b]))?.key, b, `${a} vs ${b}`)
})

// ── Designs ─────────────────────────────────────────────────────────────────

check('a well-formed design parses', () => {
  const r = CrochetDesignSchema.safeParse(GOOD_DESIGN)
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('a band colour that is not in the palette is refused', () => {
  const r = CrochetDesignSchema.safeParse({
    ...GOOD_DESIGN,
    bands: [...GOOD_DESIGN.bands.slice(0, 2), { rows: 4, stitch: 'sc', colourKey: 'coral' }],
  })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.message.includes('coral')))
})

check('a baseColourKey that is not in the palette is refused', () => {
  const r = CrochetDesignSchema.safeParse({ ...GOOD_DESIGN, baseColourKey: 'teal' })
  assert.equal(r.success, false)
})

check('a three-digit hex is refused', () => {
  const r = CrochetDesignSchema.safeParse({ ...GOOD_DESIGN, palette: { sage: '#8a6', cream: '#fbf6ea' } })
  assert.equal(r.success, false)
})

check('a textured piece that never changes stitch is refused', () => {
  const r = CrochetDesignSchema.safeParse({
    ...GOOD_DESIGN,
    bands: [
      { rows: 4, stitch: 'sc', colourKey: 'sage' },
      { rows: 4, stitch: 'sc', colourKey: 'cream' },
    ],
  })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.message.includes('change stitch')))
})

check('a striped piece that never changes colour is refused', () => {
  const r = CrochetDesignSchema.safeParse({
    treatment: 'grid-stripe',
    cols: 34,
    bands: [
      { rows: 2, stitch: 'sc', colourKey: 'sage' },
      { rows: 2, stitch: 'sc', colourKey: 'sage' },
    ],
    palette: { sage: '#8aa06a' },
    baseColourKey: 'sage',
  })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.message.includes('change colour')))
})

check('a banded piece with one band is refused', () => {
  const r = CrochetDesignSchema.safeParse({
    ...GOOD_DESIGN,
    bands: [{ rows: 4, stitch: 'sc', colourKey: 'sage' }],
  })
  assert.equal(r.success, false)
})

check('a flat piece with no rows is refused, naming rows', () => {
  const r = CrochetDesignSchema.safeParse({
    treatment: 'grid-plain',
    cols: 18,
    palette: { sage: '#8aa06a' },
    baseColourKey: 'sage',
  })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.path.includes('rows')))
})

check('a design with no yarn colours at all is refused', () => {
  const r = CrochetDesignSchema.safeParse({ treatment: 'disc', rounds: 8 })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.message.includes('no yarn colours')))
})

check('a sphere needs both its equator and its plateau', () => {
  assert.equal(
    CrochetDesignSchema.safeParse({ treatment: 'sphere', ballEquator: 24, palette: { m: '#c25a3c' }, baseColourKey: 'm' })
      .success,
    false,
  )
  assert.equal(
    CrochetDesignSchema.safeParse({
      treatment: 'sphere',
      ballEquator: 24,
      ballPlateau: 5,
      palette: { m: '#c25a3c' },
      baseColourKey: 'm',
    }).success,
    true,
  )
})

check('an amigurumi design with no creature is refused', () => {
  const r = CrochetDesignSchema.safeParse({ treatment: 'amigurumi' })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.message.includes('no creature')))
})

check('an amigurumi base the loom does not build is refused', () => {
  const r = CrochetDesignSchema.safeParse({
    treatment: 'amigurumi',
    amigurumi: { base: 'dragon', size: 'M', mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true },
  })
  assert.equal(r.success, false)
})

check('a tapestry panel needs to say what the picture shows', () => {
  assert.equal(CrochetDesignSchema.safeParse({ treatment: 'grid-tapestry' }).success, false)
  assert.equal(
    CrochetDesignSchema.safeParse({ treatment: 'grid-tapestry', picture: 'a cottage under a hill' }).success,
    true,
  )
})

check('a design may name its yarn fibre', () => {
  const r = CrochetDesignSchema.safeParse({ ...GOOD_DESIGN, yarnFibre: 'chenille' })
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('a design with no yarnFibre still parses (defaults to cotton downstream)', () => {
  const r = CrochetDesignSchema.safeParse(GOOD_DESIGN)
  assert.equal(r.success, true)
  if (!r.success) return
  assert.equal(r.data.yarnFibre, undefined)
})

check('an invented fibre is refused', () => {
  const r = CrochetDesignSchema.safeParse({ ...GOOD_DESIGN, yarnFibre: 'acrylic' })
  assert.equal(r.success, false)
})

check('an amigurumi creature may name its own yarn fibre', () => {
  const r = CrochetDesignSchema.safeParse({
    treatment: 'amigurumi',
    amigurumi: { base: 'bear', size: 'M', mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true, yarnFibre: 'velvet' },
  })
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('an amigurumi creature with an invented fibre is refused', () => {
  const r = CrochetDesignSchema.safeParse({
    treatment: 'amigurumi',
    amigurumi: { base: 'bear', size: 'M', mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true, yarnFibre: 'nylon' },
  })
  assert.equal(r.success, false)
})

check('parseDesigns keys errors by the slug they came from', () => {
  const r = parseDesigns({ 'crochet-a': GOOD_DESIGN, 'crochet-b': { treatment: 'disc' } })
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.ok(r.errors.some((e) => e.includes('crochet-b')), r.errors.join(' | '))
})

// ── Verdicts ────────────────────────────────────────────────────────────────

check('a PASS with every box true parses', () => {
  const r = SessionVerdictSchema.safeParse({ verdict: 'PASS', reasons: ['clean bands, true square'], rubric: GOOD_RUBRIC })
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('a PASS with a false rubric box is refused, and says which', () => {
  const r = SessionVerdictSchema.safeParse({
    verdict: 'PASS',
    reasons: ['lovely'],
    rubric: { ...GOOD_RUBRIC, fabricRealAndWhole: false },
  })
  assert.equal(r.success, false)
  if (r.success) return
  assert.ok(r.error.issues.some((i) => i.message.includes('fabricRealAndWhole')))
})

check('a KILL with no failed box is refused — a kill has to miss something', () => {
  const r = SessionVerdictSchema.safeParse({ verdict: 'KILL', reasons: ['do not like it'], rubric: GOOD_RUBRIC })
  assert.equal(r.success, false)
})

check('a KILL with no reasons is refused', () => {
  const r = SessionVerdictSchema.safeParse({
    verdict: 'KILL',
    reasons: [],
    rubric: { ...GOOD_RUBRIC, nothingElseInFrame: false },
  })
  assert.equal(r.success, false)
})

check('a KILL that fails a box and says why parses', () => {
  const r = SessionVerdictSchema.safeParse({
    verdict: 'KILL',
    reasons: ['a hand is holding the cloth'],
    rubric: { ...GOOD_RUBRIC, nothingElseInFrame: false },
  })
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('the limbs box may be null on a piece that is not a figure', () => {
  const r = SessionVerdictSchema.safeParse({
    verdict: 'PASS',
    reasons: ['true square, crisp bands'],
    rubric: { ...GOOD_RUBRIC, limbsPlacedLikeARealToy: null },
  })
  assert.equal(r.success, true)
})

check('a rubric missing a box is refused rather than defaulted to true', () => {
  const { nothingElseInFrame: _dropped, ...short } = GOOD_RUBRIC
  const r = SessionVerdictSchema.safeParse({ verdict: 'PASS', reasons: ['ok'], rubric: short })
  assert.equal(r.success, false)
})

check('a verdict word that is not PASS or KILL is refused', () => {
  assert.equal(
    SessionVerdictSchema.safeParse({ verdict: 'keep', reasons: ['x'], rubric: GOOD_RUBRIC }).success,
    false,
  )
})

check('parseVerdicts names the slug whose verdict is wrong', () => {
  const r = parseVerdicts({
    'crochet-a': { verdict: 'PASS', reasons: ['fine'], rubric: GOOD_RUBRIC },
    'crochet-b': { verdict: 'PASS', reasons: ['fine'], rubric: { ...GOOD_RUBRIC, isTheThingAsked: false } },
  })
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.ok(r.errors.some((e) => e.includes('crochet-b')), r.errors.join(' | '))
})

// ── The manifest ────────────────────────────────────────────────────────────

const CANDIDATE: ManifestCandidate = {
  slug: 'crochet-sage-ridge-cloth',
  name: 'Sage ridge cloth',
  shelf: 'dishcloth',
  treatment: 'grid-texture',
  subjectKey: 'sage ridge cloth',
  stage: 'expanded',
  expandAttempts: 1,
  problems: [],
}

check('an empty manifest parses against its own schema', () => {
  const m = emptyManifest('routine-2026-09-06', 8)
  const r = RunManifestSchema.safeParse(m)
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('upsertCandidate replaces rather than appends — a stage is re-runnable', () => {
  let m = emptyManifest('run', 2)
  m = upsertCandidate(m, CANDIDATE)
  m = upsertCandidate(m, { ...CANDIDATE, stage: 'rendered', expandAttempts: 2 })
  assert.equal(m.candidates.length, 1)
  assert.equal(findCandidate(m, CANDIDATE.slug)?.stage, 'rendered')
  assert.equal(findCandidate(m, CANDIDATE.slug)?.expandAttempts, 2)
})

check('upsertCandidate keeps other candidates', () => {
  let m = emptyManifest('run', 2)
  m = upsertCandidate(m, CANDIDATE)
  m = upsertCandidate(m, { ...CANDIDATE, slug: 'crochet-other' })
  m = upsertCandidate(m, { ...CANDIDATE, stage: 'published' })
  assert.equal(m.candidates.length, 2)
  assert.ok(findCandidate(m, 'crochet-other'))
})

check('manifestCounters reads the stages back', () => {
  let m = emptyManifest('run', 3)
  m = upsertCandidate(m, { ...CANDIDATE, slug: 'a', stage: 'published' })
  m = upsertCandidate(m, { ...CANDIDATE, slug: 'b', stage: 'culled' })
  m = upsertCandidate(m, {
    ...CANDIDATE,
    slug: 'c',
    stage: 'rendered',
    render: { heroPath: '/tmp/c.png', geometryHash: 'h', fidelityScore: 0.9, yr: 2.1, at: 'now', estimatedUsd: 0.08 },
  })
  const counters = manifestCounters(m)
  assert.equal(counters.requested, 3)
  assert.equal(counters.published, 1)
  assert.equal(counters.culled, 1)
  assert.equal(counters.renders, 1)
})

check('a manifest round-trips through JSON', () => {
  let m = emptyManifest('run', 1)
  m = upsertCandidate(m, {
    ...CANDIDATE,
    stage: 'published',
    kind: 'piece',
    fingerprint: 'abc',
    settledMm: { width: 201, height: 198 },
    totalStitches: 1088,
    candidatePath: '/tmp/a.json',
    render: { heroPath: '/tmp/a.png', geometryHash: 'h', fidelityScore: null, yr: 2.1, at: 'now', estimatedUsd: 0.08 },
    verdict: { verdict: 'PASS', reasons: ['clean'], rubric: GOOD_RUBRIC },
    published: { patternId: 'p1', publicUrl: 'https://x/y.png', visibility: 'PRIVATE', at: 'now' },
  })
  const back = parseManifest(JSON.parse(JSON.stringify(m)))
  assert.equal(back.ok, true, back.ok ? '' : back.errors.join(' | '))
})

check('a manifest with an unknown stage word is refused', () => {
  const m = emptyManifest('run', 1)
  const bad = { ...m, candidates: [{ ...CANDIDATE, stage: 'nearly' }] }
  assert.equal(parseManifest(bad).ok, false)
})

check('a manifest missing its version is refused', () => {
  const { version: _v, ...rest } = emptyManifest('run', 1)
  assert.equal(parseManifest(rest).ok, false)
})

check('the revision budget is two revisions then a cull', () => {
  assert.equal(MAX_DESIGN_ATTEMPTS, 3)
})

// ── The idea backlog's trail through the manifest ───────────────────────────

check('a brief may name the backlog entry it came from', () => {
  const r = SessionBriefSchema.safeParse({ ...GOOD_BRIEF, backlogId: 'dishcloth-04' })
  assert.equal(r.success, true, r.success ? '' : JSON.stringify(r.error.issues))
})

check('a brief with no backlogId still parses — invention is allowed when the queue is dry', () => {
  assert.equal(SessionBriefSchema.safeParse(GOOD_BRIEF).success, true)
})

check('a malformed backlog id is refused', () => {
  assert.equal(SessionBriefSchema.safeParse({ ...GOOD_BRIEF, backlogId: 'Dishcloth 04' }).success, false)
})

check('the manifest records what the batch was offered and what it took', () => {
  let m = emptyManifest('run', 3)
  m = { ...m, backlogOffered: ['coaster-01', 'coaster-02', 'dishcloth-04'] }
  m = upsertCandidate(m, { ...CANDIDATE, slug: 'a', backlogId: 'coaster-01', stage: 'published' })
  m = upsertCandidate(m, { ...CANDIDATE, slug: 'b', backlogId: 'coaster-02', stage: 'culled' })
  m = upsertCandidate(m, { ...CANDIDATE, slug: 'c', stage: 'published' })
  assert.deepEqual(m.backlogOffered, ['coaster-01', 'coaster-02', 'dishcloth-04'])
  // A culled candidate did not consume its entry — the queue keeps it.
  assert.deepEqual(backlogConsumed(m), ['coaster-01'])
  const counters = manifestCounters(m)
  assert.equal(counters.fromBacklog, 2)
  assert.equal(counters.invented, 1)
})

check('a manifest written before the backlog existed still parses', () => {
  const { backlogOffered: _dropped, ...old } = emptyManifest('run', 1)
  const back = parseManifest(old)
  assert.equal(back.ok, true, back.ok ? '' : back.errors.join(' | '))
  if (!back.ok) return
  assert.deepEqual(back.value.backlogOffered, [])
})

// ── The cost model ──────────────────────────────────────────────────────────

check('one Fargate render costs about three cents', () => {
  const usd = fargateRenderUsd()
  assert.ok(usd > 0.02 && usd < 0.05, `got ${usd}`)
})

check('the estimate scales linearly in published patterns', () => {
  const one = estimateCrochetCost(1)
  const hundred = estimateCrochetCost(100)
  assert.ok(Math.abs(hundred.totalUsd - one.totalUsd * 100) < 0.01)
  assert.ok(Math.abs(hundred.perPatternUsd - one.perPatternUsd) < 0.0001)
})

check('a lower pass rate costs more per published pattern', () => {
  const generous = estimateCrochetCost(100, { passRate: 1 })
  const harsh = estimateCrochetCost(100, { passRate: 0.25 })
  assert.ok(harsh.totalUsd > generous.totalUsd * 3)
})

check('the estimate states every line with where its rate came from', () => {
  const e = estimateCrochetCost(10)
  assert.ok(e.lines.length >= 5)
  for (const line of e.lines) assert.ok(line.source.length > 10, `${line.label} has no source`)
})

check('the assumed pass rate is stated, not hidden inside the arithmetic', () => {
  assert.ok(ASSUMED_PASS_RATE > 0 && ASSUMED_PASS_RATE <= 1)
  const e = estimateCrochetCost(10)
  assert.ok(Math.abs(e.candidates - 10 / ASSUMED_PASS_RATE) < 0.001)
})

// ── Report ──────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
