/**
 * THE TEXT-RISK LANE RULE — tested against the briefs that were actually
 * dispatched at 08:00 on 6 September 2026 (run `cmtpivb0u009q01adxy7o2wxy`,
 * read back from the `bulk/cross-stitch.idea` events), which culled all ten.
 *
 * Two of those ten died on lettering:
 *   · "a train of alphabet blocks" (small)  — *contains garbled text letters on blocks*
 *   · "a haberdashery window of ribbon reels" (large) — *readable-attempt lettering
 *     sign above door is garbled text*
 *
 * Both are terminal kills (`killIsUnrerollable` treats text as unrerollable), so
 * each burned its whole attempt budget for nothing. The rule these tests pin is
 * mechanical: a text-risk subject runs in the `dense` lane — where the candy shop
 * and the haunted house both shipped — or it does not run.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/text-risk.test.ts
 *
 * Pure modules only (subject-pool + brief-filter): the planner imports
 * `server-only`, so the promotion/refill path is exercised through the pure
 * helpers those two files expose.
 */

import assert from 'node:assert/strict'
import {
  isTextRiskSubject,
  textRiskExamples,
  TEXT_RISK_LANES,
  TEXT_RISK_NOUNS,
  CROSS_STITCH_THEMES,
} from './subject-pool'
import { lanesForSubject, postFilterBriefs, capTextRiskBriefs, type ThemeLaneTags } from './brief-filter'

interface PassFail {
  name: string
  passed: boolean
  detail?: string
}
const results: PassFail[] = []
function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * The ten briefs the 08:00 dispatcher actually sent, verbatim — subject, theme,
 * shelf and the lane each was built in.
 */
const BRIEFS_0800 = [
  { slug: 'nursery-a-train-of-alphabet-blocks-54en', themeId: 'nursery', shelf: 'nursery', lane: 'small', subject: 'a train of alphabet blocks', textRisk: true },
  { slug: 'cosy-scenes-a-haberdashery-window-of-ribbon-reel-0ldc', themeId: 'cosy-scenes', shelf: 'scenes', lane: 'large', subject: 'a haberdashery window of ribbon reels', textRisk: true },
  { slug: 'easter-spring-a-jar-of-primroses-on-a-windowsill-8ta5', themeId: 'easter-spring', shelf: 'seasonal', lane: 'mini', subject: 'a jar of primroses on a windowsill', textRisk: true },
  { slug: 'halloween-a-pumpkin-patch-at-golden-hour-8ee6', themeId: 'halloween', shelf: 'halloween', lane: 'medium', subject: 'a pumpkin patch at golden hour', textRisk: false },
  { slug: 'cocktails-a-bloody-mary-with-a-celery-stick-on-a-3vrd', themeId: 'cocktails', shelf: 'cocktails', lane: 'small', subject: 'a bloody mary with a celery stick on a sunlit brunch table', textRisk: false },
  { slug: 'witchy-gothic-a-familiar-toad-on-a-scarlet-toads-kws5', themeId: 'witchy-gothic', shelf: 'witchy-gothic', lane: 'small', subject: 'a familiar toad on a scarlet toadstool under a bright full moon', textRisk: false },
  { slug: 'woodland-a-stoat-in-winter-coat-on-frost-white-s-f9r7', themeId: 'woodland', shelf: 'animals', lane: 'dense', subject: 'a stoat in winter coat on frost-white snow at dawn', textRisk: false },
  { slug: 'florals-sweet-peas-tumbling-over-a-trellis-under-droq', themeId: 'florals', shelf: 'floral', lane: 'medium', subject: 'sweet peas tumbling over a trellis under bright morning light', textRisk: false },
  { slug: 'celestial-a-lighthouse-beam-sweeping-under-a-ful-95la', themeId: 'celestial', shelf: 'celestial', lane: 'large', subject: 'a lighthouse beam sweeping under a full starfield on a clear summer night', textRisk: false },
  { slug: 'food-drink-a-bowl-of-ramen-steaming-on-a-cheerfu-cwb6', themeId: 'food-drink', shelf: 'food', lane: 'small', subject: 'a bowl of ramen steaming on a cheerful red table at midday', textRisk: false },
]

// ─── the predicate ─────────────────────────────────────────────────────────

record('text risk: the 08:00 batch is tagged exactly as it failed', () => {
  for (const b of BRIEFS_0800) {
    assert.equal(
      isTextRiskSubject(b.subject),
      b.textRisk,
      `${b.subject} — expected textRisk ${b.textRisk}, got ${isTextRiskSubject(b.subject)}`,
    )
  }
})

record('text risk: the two lettering kills are caught', () => {
  assert.ok(isTextRiskSubject('a train of alphabet blocks'))
  assert.ok(isTextRiskSubject('a haberdashery window of ribbon reels'))
})

record('text risk: nouns match on word boundaries, not substrings', () => {
  // The false positives a substring test would hand the planner.
  assert.ok(!isTextRiskSubject('a kitsune among scarlet maple'), 'maple is not a map')
  assert.ok(!isTextRiskSubject('a door left ajar in a garden wall'), 'ajar is not a jar')
  assert.ok(!isTextRiskSubject('a sheep in a cardigan'), 'cardigan is not a card')
  assert.ok(!isTextRiskSubject('a blockade of ships'), 'blockade is not a block')
  // …and the plurals that must match.
  assert.ok(isTextRiskSubject('a shelf of jars'))
  assert.ok(isTextRiskSubject('a pile of vintage books'))
})

record('text risk: the nouns with live counter-evidence stay out', () => {
  // Both shipped as gems from the LARGE lane on 5–6 September 2026, so tagging
  // them would cost the catalogue subjects that demonstrably work.
  assert.ok(!isTextRiskSubject('a seaside ice-cream kiosk in high sun'))
  assert.ok(!isTextRiskSubject("a witch's apothecary shelf of potion bottles"))
})

record('text risk: the pool tags a small, known set', () => {
  const tagged = textRiskExamples()
  // Every tagged example really does carry one of the nouns.
  for (const ex of tagged) assert.ok(isTextRiskSubject(ex), ex)
  assert.ok(tagged.includes('a train of alphabet blocks'))
  assert.ok(tagged.includes('a haberdashery window of ribbon reels'))
  assert.ok(tagged.includes('a corner flower shop with buckets of blooms'))
  // A ceiling, not a cull: the rule must not swallow the pool.
  const total = CROSS_STITCH_THEMES.reduce((n, t) => n + t.examples.length, 0)
  assert.ok(tagged.length < total * 0.1, `${tagged.length} of ${total} subjects tagged — too many`)
})

record('text risk: the noun list is lower-case and de-duplicated', () => {
  assert.deepEqual([...new Set(TEXT_RISK_NOUNS)], [...TEXT_RISK_NOUNS])
  for (const n of TEXT_RISK_NOUNS) assert.equal(n, n.toLowerCase(), n)
})

// ─── the lane rule ─────────────────────────────────────────────────────────

record('lanesForSubject: a text-risk subject has one lane, whatever its theme', () => {
  assert.deepEqual(lanesForSubject('a train of alphabet blocks', undefined), TEXT_RISK_LANES)
  const tags: ThemeLaneTags = {
    examples: ['a train of alphabet blocks'],
    lanes: ['mini', 'small', 'medium', 'large', 'dense'],
    overrides: { 'a train of alphabet blocks': ['small', 'medium', 'large', 'dense'] },
  }
  // The subject's own lane override does NOT rescue it — the rule is above it.
  assert.deepEqual(lanesForSubject('a train of alphabet blocks', tags), TEXT_RISK_LANES)
})

record('lanesForSubject: an ordinary subject still follows its theme', () => {
  const tags: ThemeLaneTags = { examples: ['a hare under a full moon'], lanes: ['medium', 'large', 'dense'] }
  assert.deepEqual(lanesForSubject('a hare under a full moon', tags), ['medium', 'large', 'dense'])
  assert.equal(lanesForSubject('a hare under a full moon', undefined), null)
})

const LANE_TAGS: Record<string, ThemeLaneTags> = {
  nursery: { examples: ['a train of alphabet blocks'], lanes: ['mini', 'small', 'medium', 'large', 'dense'] },
  'cosy-scenes': { examples: ['a haberdashery window of ribbon reels'], lanes: ['large', 'dense'] },
  woodland: { examples: ['a hare under a full moon'], lanes: ['mini', 'small', 'medium', 'large', 'dense'] },
}

function brief(over: Partial<(typeof BRIEFS_0800)[number]> & { subject: string; lane: string }): {
  subject: string
  subjectKey: string
  shelf: string
  lane: string
  themeId: string
} {
  return {
    subject: over.subject,
    subjectKey: over.subject.toLowerCase(),
    shelf: over.shelf ?? 'nursery',
    lane: over.lane,
    themeId: over.themeId ?? 'nursery',
  }
}

record('postFilterBriefs: the alphabet blocks are refused in the small lane', () => {
  const b = brief({ subject: 'a train of alphabet blocks', lane: 'small', themeId: 'nursery', shelf: 'nursery' })
  const { kept, rejects } = postFilterBriefs([b], [], { props: 'off', laneTags: LANE_TAGS })
  assert.equal(kept.length, 0)
  assert.equal(rejects[0]?.kind, 'wrong-lane')
  assert.match(rejects[0]!.reason, /invites lettering/)
})

record('postFilterBriefs: the haberdashery window is refused in the large lane', () => {
  const b = brief({ subject: 'a haberdashery window of ribbon reels', lane: 'large', themeId: 'cosy-scenes', shelf: 'scenes' })
  const { kept } = postFilterBriefs([b], [], { props: 'off', laneTags: LANE_TAGS })
  assert.equal(kept.length, 0)
})

record('postFilterBriefs: the same subject is allowed in the dense lane', () => {
  const b = brief({ subject: 'a haberdashery window of ribbon reels', lane: 'dense', themeId: 'cosy-scenes', shelf: 'scenes' })
  const { kept } = postFilterBriefs([b], [], { props: 'off', laneTags: LANE_TAGS })
  assert.equal(kept.length, 1)
})

record('postFilterBriefs: an ordinary subject is untouched by the rule', () => {
  const b = brief({ subject: 'a hare under a full moon', lane: 'mini', themeId: 'woodland', shelf: 'animals' })
  const { kept } = postFilterBriefs([b], [], { props: 'off', laneTags: LANE_TAGS })
  assert.equal(kept.length, 1)
})

// ─── the one-per-batch cap ─────────────────────────────────────────────────

record('capTextRiskBriefs: one survives a full batch, the rest are dropped', () => {
  const batch = BRIEFS_0800.map((b) => ({ subject: b.subject, slug: b.slug }))
  const { kept, dropped } = capTextRiskBriefs(batch, { wantDense: true })
  assert.equal(kept.length, batch.length - 2, 'two of the three text-risk briefs go')
  assert.equal(dropped.length, 2)
  // Order-stable: the FIRST text-risk brief is the one that stays.
  assert.equal(kept.filter((b) => isTextRiskSubject(b.subject))[0]!.subject, 'a train of alphabet blocks')
  assert.deepEqual(dropped.map((b) => b.subject), [
    'a haberdashery window of ribbon reels',
    'a jar of primroses on a windowsill',
  ])
})

record('capTextRiskBriefs: a batch with no dense slot keeps none of them', () => {
  const batch = BRIEFS_0800.map((b) => ({ subject: b.subject }))
  const { kept, dropped } = capTextRiskBriefs(batch, { wantDense: false })
  assert.equal(dropped.length, 3)
  assert.ok(!kept.some((b) => isTextRiskSubject(b.subject)))
})

record('capTextRiskBriefs: a batch without one is returned unchanged', () => {
  const batch = BRIEFS_0800.filter((b) => !b.textRisk).map((b) => ({ subject: b.subject }))
  const { kept, dropped } = capTextRiskBriefs(batch, { wantDense: true })
  assert.equal(kept.length, batch.length)
  assert.equal(dropped.length, 0)
})

record('capTextRiskBriefs: re-running it never changes what it kept', () => {
  const batch = BRIEFS_0800.map((b) => ({ subject: b.subject }))
  const once = capTextRiskBriefs(batch, { wantDense: true }).kept
  const twice = capTextRiskBriefs(once, { wantDense: true }).kept
  assert.deepEqual(twice, once)
})

// ─── the refill ────────────────────────────────────────────────────────────

record('the pool can always refill a dropped text-risk brief', () => {
  // The planner's sampler draws from the theme examples with the text-risk ones
  // filtered out — every plannable theme must still have subjects left.
  for (const theme of CROSS_STITCH_THEMES) {
    const usable = theme.examples.filter((e) => !isTextRiskSubject(e))
    assert.ok(usable.length >= 4, `${theme.id} has only ${usable.length} non-text-risk subjects`)
  }
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
