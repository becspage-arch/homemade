/**
 * Duplicate-guard test suite — the five rules the cross-stitch autopilot now
 * depends on to stay self-running without refilling the catalogue with
 * duplicates.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/dedupe.test.ts
 *
 * The image test synthesises its own pair by default so it is self-contained.
 * Point it at the September 2026 scan's thumbnail cache to run it against two
 * real catalogue renders instead:
 *   … dedupe.test.ts --thumbs <dir-with-*.png>
 */

import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { subjectKey, subjectTokens, subjectJaccard, findSubjectKeyMatch, SUBJECT_JACCARD_MATCH } from './subject-key'
import { imageHash, sha256Hex, nearDuplicateVerdict, type PatternFingerprint, type ChartFingerprint } from './similarity'
import { shelfDeficits, allocateShelves, shelfSlots, allShelvesAtTarget } from './shelf-plan'
import { measureVividness, vividnessVerdict, MIN_INK, MIN_CHROMA, PALE_REFS, VIVID_REFS } from './vividness'
import { findDuplicate, type CatalogueEntry, type CandidateFingerprints } from './duplicate-match'
import { applyWarmFurGuard, WARM_FUR_SAT, type WarmFurBrief } from './brief-rules'
import { runIsComplete, summaryLine } from './run-status'
import {
  propReject,
  lightPropReject,
  matchExampleByHead,
  lanesForSubject,
  headNouns,
  briefsCollide,
  postFilterBriefs,
  countRejects,
  BATCH_JACCARD_COLLISION,
  SMALL_LANE_WORD_LIMIT,
} from './brief-filter'
import { capShelfBriefs, shelfQuotaCounts, SHELF_SHARE } from './shelf-plan'
import { CROSS_STITCH_THEMES, LANES_ALL, LANES_LARGE_UP, LANES_MEDIUM_UP, smallestLane } from './subject-pool'
import type { ShelfTarget } from '../categories'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}
async function recordAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

// ─── subjectKey normalisation ──────────────────────────────────────────────

record('subjectKey: lowercases, strips punctuation and collapses whitespace', () => {
  assert.equal(subjectKey('  A Sleeping   RED Fox, curled up! '), 'sleeping red fox curled')
})

record('subjectKey: drops the leading article', () => {
  assert.equal(subjectKey('a highland cow'), subjectKey('the highland cow'))
})

record('subjectKey: drops craft and style words, keeps the subject', () => {
  assert.equal(subjectKey('a cross-stitch illustration of a barn owl'), 'barn owl')
  assert.equal(subjectKey('a beautiful modern barn owl design'), 'barn owl')
})

record('subjectKey: folds plurals so gardens and garden are one idea', () => {
  assert.equal(subjectKey('japanese gardens'), subjectKey('a japanese garden'))
})

record('subjectKey: keeps a double-s word intact (grass is not gras)', () => {
  assert.ok(subjectTokens('a hare in long grass').includes('grass'))
})

record('subjectKey: -es stems only where the stem needs it', () => {
  // roses is rose+s, not ros+es — the naive -ses rule got this wrong and put
  // "climbing ros" in a live pattern's subject key.
  assert.ok(subjectTokens('a cottage with climbing roses').includes('rose'))
  assert.ok(subjectTokens('a shelf of glasses').includes('glass'))
  assert.ok(subjectTokens('a row of boxes').includes('box'))
  assert.ok(subjectTokens('a pile of dishes').includes('dish'))
  assert.ok(subjectTokens('two houses on a hill').includes('house'))
})

record('subjectKey: possessives carry no extra meaning', () => {
  assert.equal(subjectKey("a witch's apothecary shelf"), 'witch apothecary shelf')
})

record('subjectKey: the real duplicate cluster collapses to one key', () => {
  const variants = ['big japanese garden', 'a big japanese garden', 'The Big Japanese Gardens']
  const keys = new Set(variants.map(subjectKey))
  assert.equal(keys.size, 1, `expected one key, got ${[...keys].join(' | ')}`)
})

record('subjectKey: a subject of pure stopwords normalises to empty', () => {
  assert.equal(subjectKey('a the of in'), '')
})

// ─── the token-Jaccard rule ────────────────────────────────────────────────

record('jaccard: identical subjects overlap fully', () => {
  assert.equal(subjectJaccard('a red fox in autumn leaves', 'the red fox in autumn leaves'), 1)
})

record('jaccard: a re-wording of the same idea is at or over the threshold', () => {
  const j = subjectJaccard('a big japanese garden', 'a japanese garden scene')
  assert.ok(j >= SUBJECT_JACCARD_MATCH, `expected ≥ ${SUBJECT_JACCARD_MATCH}, got ${j.toFixed(2)}`)
})

record('jaccard: two different woodland pieces stay under the threshold', () => {
  const j = subjectJaccard(
    'a sleeping red fox curled in autumn leaves',
    'a red squirrel among autumn leaves and toadstools',
  )
  assert.ok(j < SUBJECT_JACCARD_MATCH, `expected < ${SUBJECT_JACCARD_MATCH}, got ${j.toFixed(2)}`)
})

record('jaccard: word order does not matter', () => {
  assert.equal(subjectJaccard('a fox with a lantern', 'a lantern with a fox'), 1)
})

record('findSubjectKeyMatch: exact hit is reported with overlap 1', () => {
  const hit = findSubjectKeyMatch(subjectKey('a barn owl'), [subjectKey('the barn owl'), subjectKey('a red fox')])
  assert.ok(hit, 'expected a match')
  assert.equal(hit.overlap, 1)
})

record('findSubjectKeyMatch: a genuinely new subject matches nothing', () => {
  const existing = ['red fox autumn leaf', 'barn owl', 'highland cow flower crown']
  assert.equal(findSubjectKeyMatch(subjectKey('a hot-air balloon over patchwork fields'), existing), null)
})

record('findSubjectKeyMatch: an empty key never matches', () => {
  assert.equal(findSubjectKeyMatch('', ['barn owl']), null)
})

// ─── nearDuplicateVerdict on real renders ─────────────────────────────────

/** A flat chart fingerprint that never fires on its own — isolates the image rules. */
function neutralChart(seed: number): ChartFingerprint {
  const bytes = Buffer.alloc(24 * 24 * 3)
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 7 + seed * 91) % 256
  return { grid: bytes.toString('hex'), palette: [`DMC-${seed}`] }
}

async function fingerprintOf(png: Buffer, chart: ChartFingerprint): Promise<PatternFingerprint> {
  const h = await imageHash(png)
  return { sha256: sha256Hex(png), dhash64: h.dhash64, dhash256: h.dhash256, chart }
}

/** Two real cached thumbnails, when the scan's cache is available. */
function cachedThumbs(): [Buffer, Buffer] | null {
  const i = process.argv.indexOf('--thumbs')
  const dir = i >= 0 ? process.argv[i + 1] : process.env.XS_THUMB_CACHE
  if (!dir || !existsSync(dir)) return null
  const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
  if (files.length < 2) return null
  return [readFileSync(resolve(dir, files[0]!)), readFileSync(resolve(dir, files[files.length - 1]!))]
}

/** A stand-in beauty render — deterministic, and nothing like the other one. */
async function syntheticRender(kind: 'a' | 'b'): Promise<Buffer> {
  const size = 240
  const raw = Buffer.alloc(size * size * 3)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 3
      if (kind === 'a') {
        // a soft diagonal wash with a dark blob off-centre
        const blob = Math.hypot(x - 90, y - 140) < 45 ? 90 : 0
        raw[o] = Math.max(0, 240 - blob - ((x + y) >> 2))
        raw[o + 1] = Math.max(0, 220 - blob - (y >> 2))
        raw[o + 2] = Math.max(0, 200 - blob - (x >> 2))
      } else {
        // horizontal bands — a completely different composition
        const band = Math.floor(y / 30) % 2 === 0 ? 60 : 210
        raw[o] = band
        raw[o + 1] = Math.min(255, band + (x >> 3))
        raw[o + 2] = 255 - band
      }
    }
  }
  return sharp(raw, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

const thumbs = cachedThumbs()

/** The image rules — async, so they run from `main()` at the bottom. */
async function imageTests(): Promise<void> {
  await recordAsync('nearDuplicateVerdict: a re-rendered thumbnail is a duplicate', async () => {
    const original = thumbs ? thumbs[0] : await syntheticRender('a')
    // The same design re-rendered: rescaled and re-saturated, exactly the drift
    // the pipeline produces when a chart is converted again at a different
    // resolution.
    const meta = await sharp(original).metadata()
    const rerendered = await sharp(original)
      .resize(Math.max(32, Math.round((meta.width ?? 400) * 0.82)))
      .modulate({ saturation: 1.08 })
      .png()
      .toBuffer()
    const a = await fingerprintOf(original, neutralChart(1))
    const b = await fingerprintOf(rerendered, neutralChart(2))
    const v = nearDuplicateVerdict(a, b)
    assert.ok(v.duplicate, `expected duplicate, got: ${v.reason}`)
  })

  await recordAsync('nearDuplicateVerdict: two different designs are distinct', async () => {
    const [one, two] = thumbs ?? [await syntheticRender('a'), await syntheticRender('b')]
    const a = await fingerprintOf(one, neutralChart(3))
    const b = await fingerprintOf(two, neutralChart(4))
    const v = nearDuplicateVerdict(a, b)
    assert.ok(!v.duplicate, `expected distinct, got: ${v.reason}`)
  })

  await recordAsync('nearDuplicateVerdict: identical bytes short-circuit on sha256', async () => {
    const png = thumbs ? thumbs[0] : await syntheticRender('a')
    const a = await fingerprintOf(png, neutralChart(5))
    const v = nearDuplicateVerdict(a, { ...a, chart: neutralChart(6) })
    assert.ok(v.duplicate)
    assert.match(v.reason, /sha256/)
  })
}

// ─── the guard's comparison set: a cull means the idea is spent ────────────

/** A candidate whose picture matches nothing — isolates the SUBJECT rule. */
function candidate(key: string): CandidateFingerprints {
  const flat = Buffer.alloc(24 * 24 * 3, 7).toString('hex')
  return {
    sha256: 'a'.repeat(64),
    dhash64: '0'.repeat(16),
    dhash256: '0'.repeat(64),
    chart: { grid: flat, palette: ['DMC-1'] },
    subjectKey: key,
  }
}

/** A culled row: subject key only, no image (visibility PRIVATE + qcBlockReason). */
function culledEntry(key: string, name: string): CatalogueEntry {
  return { id: `id-${key}`, slug: `slug-${key}`, name, subjectKey: key, image: null }
}

record('guard: a culled subject is still a duplicate — the idea is spent', () => {
  // The real case: a washed-out cupcake was culled, which released its subject
  // and the very next batch commissioned it again.
  const catalogue = [culledEntry(subjectKey('a cheerful cupcake with sprinkles'), 'Cheerful cupcake with sprinkles')]
  const hit = findDuplicate(candidate(subjectKey('a cheerful cupcake with sprinkles')), catalogue)
  assert.ok(hit, 'expected the culled subject to block the candidate')
  assert.match(hit.reason, /same subject/)
})

record('guard: a re-wording of a culled subject is caught too', () => {
  const catalogue = [culledEntry(subjectKey('a big japanese garden'), 'Big japanese garden')]
  assert.ok(findDuplicate(candidate(subjectKey('a japanese garden scene')), catalogue))
})

record('guard: a genuinely new subject still passes a culled catalogue', () => {
  const catalogue = [culledEntry(subjectKey('a cheerful cupcake with sprinkles'), 'Cheerful cupcake with sprinkles')]
  assert.equal(findDuplicate(candidate(subjectKey('a hot-air balloon over patchwork fields')), catalogue), null)
})

record('guard: a culled row never fires the IMAGE rules (image is null)', () => {
  // Identical fingerprints on both sides; only the subject differs. A culled row
  // carries no image, so the picture comparison must not fire on it.
  const cand = candidate(subjectKey('a barn owl on a fencepost'))
  const catalogue = [culledEntry(subjectKey('a red fox in autumn leaves'), 'Red fox in autumn leaves')]
  assert.equal(findDuplicate(cand, catalogue), null)
})

// ─── warm fur in the small lanes ───────────────────────────────────────────

function brief(subject: string, lane: string, sat?: number): WarmFurBrief {
  return { subject, lane, ...(sat != null ? { sat } : {}) }
}

record('warm fur: a mini fox is pulled back so it does not cook to pink', () => {
  assert.equal(applyWarmFurGuard(brief('a red fox in falling snow', 'mini')).sat, WARM_FUR_SAT)
})

record('warm fur: applies in the small lane too', () => {
  assert.equal(applyWarmFurGuard(brief('a red squirrel among acorns', 'small')).sat, WARM_FUR_SAT)
})

record('warm fur: a large fox keeps full saturation — it has the colour budget', () => {
  assert.equal(applyWarmFurGuard(brief('a red fox in falling snow', 'large')).sat, undefined)
})

record('warm fur: leaves other animals alone', () => {
  assert.equal(applyWarmFurGuard(brief('a black cat on a windowsill', 'mini')).sat, undefined)
})

record('warm fur: never overrides a saturation the brief chose itself', () => {
  assert.equal(applyWarmFurGuard(brief('a red fox in falling snow', 'mini', 1.05)).sat, 1.05)
})

record('warm fur: promotion out of the small lanes releases the guard sat', () => {
  const dulled = applyWarmFurGuard(brief('a red fox in falling snow', 'mini'))
  const promoted = applyWarmFurGuard({ ...dulled, lane: 'large' })
  assert.equal(promoted.sat, undefined)
})

// ─── the pale guard ────────────────────────────────────────────────────────

/**
 * The calibration references live beside the thresholds they justify, in
 * vividness.ts. Run with --thumbs <dir> (or XS_THUMB_CACHE) to check the real
 * cached files; without the cache these cases skip rather than fail, so the
 * suite still runs anywhere.
 *
 * NOTE: the cache is the PRE-bare-fabric catalogue. Five of these nine rows have
 * since had their white background cleared, which is exactly what
 * `scripts/xs-vividness-recheck.ts` re-measures against the live thumbnails.
 */

function thumbDir(): string | null {
  const i = process.argv.indexOf('--thumbs')
  const dir = i >= 0 ? process.argv[i + 1] : process.env.XS_THUMB_CACHE
  return dir && existsSync(dir) ? dir : null
}

async function vividnessTests(): Promise<void> {
  const dir = thumbDir()

  // Synthetic cases always run: they pin the rule itself, independent of any cache.
  await recordAsync('vividness: a cream-on-cream wash is too pale', async () => {
    const png = await sharp({
      create: { width: 120, height: 120, channels: 3, background: { r: 252, g: 250, b: 246 } },
    })
      .composite([
        {
          input: await sharp({ create: { width: 70, height: 70, channels: 3, background: { r: 246, g: 234, b: 226 } } })
            .png()
            .toBuffer(),
          top: 25,
          left: 25,
        },
      ])
      .png()
      .toBuffer()
    const v = await measureVividness(png)
    assert.ok(vividnessVerdict(v).tooPale, `expected pale, got ${JSON.stringify(v)}`)
  })

  await recordAsync('vividness: two-tone dark-on-white passes on tone alone', async () => {
    // Blackwork in miniature: no chroma whatever, plenty of ink.
    const png = await sharp({
      create: { width: 120, height: 120, channels: 3, background: { r: 252, g: 250, b: 246 } },
    })
      .composite([
        {
          input: await sharp({ create: { width: 60, height: 60, channels: 3, background: { r: 20, g: 22, b: 30 } } })
            .png()
            .toBuffer(),
          top: 30,
          left: 30,
        },
      ])
      .png()
      .toBuffer()
    const v = await measureVividness(png)
    assert.ok(v.chroma < MIN_CHROMA, `expected low chroma, got ${v.chroma.toFixed(3)}`)
    assert.ok(!vividnessVerdict(v).tooPale, `expected pass on tone, got ${JSON.stringify(v)}`)
  })

  if (!dir) {
    results.push({ name: 'vividness: live catalogue references (skipped, no --thumbs cache)', passed: true })
    return
  }

  for (const [id, label] of PALE_REFS) {
    const file = resolve(dir, `${id}.png`)
    if (!existsSync(file)) continue
    await recordAsync(`vividness: PALE — ${label}`, async () => {
      const v = await measureVividness(readFileSync(file))
      assert.ok(
        vividnessVerdict(v).tooPale,
        `expected pale: ink ${v.ink.toFixed(3)} (floor ${MIN_INK}), chroma ${v.chroma.toFixed(3)} (floor ${MIN_CHROMA})`,
      )
    })
  }
  for (const [id, label] of VIVID_REFS) {
    const file = resolve(dir, `${id}.png`)
    if (!existsSync(file)) continue
    await recordAsync(`vividness: VIVID — ${label}`, async () => {
      const v = await measureVividness(readFileSync(file))
      assert.ok(
        !vividnessVerdict(v).tooPale,
        `expected vivid: ink ${v.ink.toFixed(3)} (floor ${MIN_INK}), chroma ${v.chroma.toFixed(3)} (floor ${MIN_CHROMA})`,
      )
    })
  }
}

// ─── shelf-deficit weighting ───────────────────────────────────────────────

const SHELVES: ShelfTarget[] = [
  { slug: 'animals', name: 'Animals', target: 240 },
  { slug: 'seasonal', name: 'Seasonal', target: 90 },
  { slug: 'nursery', name: 'Nursery & baby', target: 30 },
  { slug: 'whimsical', name: 'Whimsical', target: 160 },
  { slug: 'landscapes', name: 'Landscapes', target: 172, hold: true },
]

record('shelfDeficits: hold shelves never appear, however short they are', () => {
  const d = shelfDeficits(SHELVES, { animals: 197, seasonal: 17, nursery: 0, whimsical: 159, landscapes: 0 })
  assert.equal(d.find((x) => x.slug === 'landscapes'), undefined)
})

record('shelfDeficits: a shelf at or over target drops out', () => {
  const d = shelfDeficits(SHELVES, { animals: 240, seasonal: 17, nursery: 30, whimsical: 159 })
  assert.deepEqual(d.map((x) => x.slug), ['seasonal', 'whimsical'])
})

record('shelfDeficits: biggest gap first', () => {
  const d = shelfDeficits(SHELVES, { animals: 197, seasonal: 17, nursery: 0, whimsical: 159 })
  assert.deepEqual(d.map((x) => x.slug), ['seasonal', 'animals', 'nursery', 'whimsical'])
  assert.deepEqual(d.map((x) => x.deficit), [73, 43, 30, 1])
})

record('allocateShelves: hands out exactly the briefs asked for', () => {
  const d = shelfDeficits(SHELVES, { animals: 197, seasonal: 17, nursery: 0, whimsical: 159 })
  for (const n of [1, 4, 8, 10, 20]) {
    const total = allocateShelves(d, n).reduce((sum, a) => sum + a.briefs, 0)
    assert.equal(total, n, `batch of ${n} allocated ${total}`)
  }
})

record('allocateShelves: the biggest gap gets the most briefs', () => {
  const d = shelfDeficits(SHELVES, { animals: 197, seasonal: 17, nursery: 0, whimsical: 159 })
  const alloc = allocateShelves(d, 10)
  assert.equal(alloc[0]!.slug, 'seasonal')
  const seasonal = alloc.find((a) => a.slug === 'seasonal')!.briefs
  const whimsical = alloc.find((a) => a.slug === 'whimsical')?.briefs ?? 0
  assert.ok(seasonal > whimsical, `seasonal ${seasonal} should beat whimsical ${whimsical}`)
})

record('allocateShelves: a shelf one pattern short does not soak up the batch', () => {
  const d = shelfDeficits(SHELVES, { animals: 197, seasonal: 17, nursery: 0, whimsical: 159 })
  const alloc = allocateShelves(d, 10)
  assert.ok((alloc.find((a) => a.slug === 'whimsical')?.briefs ?? 0) <= 1)
})

record('allocateShelves: nothing wanting means nothing planned', () => {
  const d = shelfDeficits(SHELVES, { animals: 240, seasonal: 90, nursery: 30, whimsical: 160 })
  assert.deepEqual(allocateShelves(d, 10), [])
})

record('shelfSlots: one slug per brief', () => {
  const d = shelfDeficits(SHELVES, { animals: 197, seasonal: 17, nursery: 0, whimsical: 159 })
  assert.equal(shelfSlots(allocateShelves(d, 10)).length, 10)
})

record('allShelvesAtTarget: true only when every non-hold shelf is done', () => {
  assert.equal(allShelvesAtTarget(SHELVES, { animals: 240, seasonal: 90, nursery: 30, whimsical: 160 }), true)
  assert.equal(allShelvesAtTarget(SHELVES, { animals: 240, seasonal: 90, nursery: 29, whimsical: 160 }), false)
  // A hold shelf below its target must NOT keep the autopilot running.
  assert.equal(allShelvesAtTarget(SHELVES, { animals: 240, seasonal: 90, nursery: 30, whimsical: 160, landscapes: 0 }), true)
})

// ─── the run-complete predicate ────────────────────────────────────────────

const counters = (o: Partial<Parameters<typeof runIsComplete>[0]>) => ({
  requested: 10, published: 0, culled: 0, duplicates: 0, errors: 0, skipped: 0, ...o,
})

record('runIsComplete: a fresh run is not complete', () => {
  assert.equal(runIsComplete(counters({})), false)
})

record('runIsComplete: every terminal outcome counts toward the total', () => {
  assert.equal(runIsComplete(counters({ published: 3, culled: 3, duplicates: 2, errors: 1, skipped: 1 })), true)
})

record('runIsComplete: one idea still in flight keeps it open', () => {
  assert.equal(runIsComplete(counters({ published: 3, culled: 3, duplicates: 2, errors: 1 })), false)
})

record('runIsComplete: an over-count still finishes rather than hanging', () => {
  assert.equal(runIsComplete(counters({ published: 11 })), true)
})

record('runIsComplete: a skipped-everything run is complete', () => {
  assert.equal(runIsComplete(counters({ skipped: 10 })), true)
})

record('runIsComplete: a zero-idea run (spend cap) is complete on sight', () => {
  assert.equal(runIsComplete(counters({ requested: 0 })), true)
})

// ─── the brief post-filter: props ──────────────────────────────────────────
//
// Calibrated on batch 5 (September 2026), the run that made this filter
// necessary: ten model-authored briefs, two gems, and five of the eight kills
// were the same failure — a small prop hung off the subject that Flux rendered
// as a smudge. Every "must reject" subject below is verbatim from that batch.

const pb = (subject: string, lane = 'medium', shelf = 'animals') => ({
  subject,
  lane,
  shelf,
  subjectKey: subjectKey(subject),
})

record('propReject: a clean single-subject brief passes', () => {
  assert.equal(propReject(pb('a crooked candy shop front, striped awning, boiled-sweet palette', 'dense')), null)
  assert.equal(propReject(pb('a great horned owl in flight across a full moon')), null)
  assert.equal(propReject(pb('a fox in a mustard-yellow raincoat')), null)
})

record('propReject: diminutives are binary rejects', () => {
  for (const s of ['a hermit crab in a tiny shell', 'a little mouse in a teacup', 'a miniature lighthouse']) {
    assert.notEqual(propReject(pb(s)), null, s)
  }
})

record('propReject: the batch-5 prop clauses all reject', () => {
  const props = [
    'a scarlet hermit crab wearing a sailor\'s spyglass shell',
    'a tall flaming tiki mug topped with pineapple wedge',
    'a golden sun ringed by a swirl of orbiting stars',
    'a single tall gladiolus spire in coral and gold',
    'a barn owl perched on a mossy fencepost',
    'a dragonfly resting near the top of a spike of blooms',
    'a badger holding a lantern',
    'a squirrel carrying a bundle of acorns',
    'a toadstool dotted with cream spots',
    'a black cat beside a candlestick',
    'a robin peeking from a hedgerow',
    'a stag with a crown of antlers',
  ]
  for (const s of props) assert.notEqual(propReject(pb(s)), null, s)
})

record('propReject: "inside a" is allowed only where there are cells for two shapes', () => {
  const s = 'a baby fox cub curled asleep inside a hot air balloon basket'
  assert.equal(propReject(pb(s, 'large')), null)
  assert.equal(propReject(pb(s, 'dense')), null)
  assert.notEqual(propReject(pb(s, 'medium')), null)
})

record('propReject: the mini/small lanes take ONE noun phrase and nothing else', () => {
  // Over the word limit.
  const long = 'a scarlet hermit crab peeking from a striped conch shell on golden sand'
  assert.ok(long.split(/\s+/).length > SMALL_LANE_WORD_LIMIT)
  assert.notEqual(propReject(pb(long, 'mini')), null)
  // Under the limit but two phrases.
  assert.notEqual(propReject(pb('a red squirrel and a pinecone', 'small')), null)
  assert.notEqual(propReject(pb('a bee beside a foxglove', 'small')), null)
  // Clean, short, one phrase.
  assert.equal(propReject(pb('a plump bluebird on emerald green', 'mini')), null)
  // The same two-phrase subject is fine in a lane with the cells for it.
  assert.equal(propReject(pb('a red squirrel and a pinecone', 'large')), null)
})

// ─── the brief post-filter: within-batch collisions ────────────────────────

record('headNouns: reads the head of the leading noun phrase', () => {
  assert.deepEqual(headNouns('a single tall gladiolus spire in coral and gold with dragonflies'), ['gladiolus', 'spire'])
  assert.deepEqual(headNouns('a tall spike of magenta gladiolus blooms with a single dragonfly'), ['gladiolus', 'bloom'])
  assert.deepEqual(headNouns('a scarlet hermit crab wearing a spyglass shell'), ['hermit', 'crab'])
  assert.deepEqual(headNouns('a hermit crab marching along a bright coral seabed'), ['hermit', 'crab'])
  assert.deepEqual(headNouns('a tall frosted pina colada in a pineapple shell'), ['pina', 'colada'])
  assert.deepEqual(headNouns('a tall flaming tiki mug topped with pineapple wedge'), ['tiki', 'mug'])
  // A hyphenated "-ed" opener must not truncate the phrase to nothing.
  assert.deepEqual(headNouns('a round-cheeked baby fox cub curled asleep'), ['fox', 'cub'])
})

record('briefsCollide: the two batch-5 gladiolus briefs collide', () => {
  const a = pb('a single tall gladiolus spire in coral and gold with dragonflies resting along its blooms', 'medium', 'floral')
  const b = pb('a tall spike of magenta gladiolus blooms with a single dragonfly resting near the top', 'medium', 'floral')
  assert.notEqual(briefsCollide(b, a), null)
  // …and on token overlap alone, which is what the 0.6 catalogue threshold missed.
  assert.ok(subjectJaccard(a.subject, b.subject) >= BATCH_JACCARD_COLLISION)
  assert.ok(subjectJaccard(a.subject, b.subject) < SUBJECT_JACCARD_MATCH)
})

record('briefsCollide: the two batch-5 hermit crabs collide on the head noun', () => {
  const a = pb("a scarlet hermit crab wearing a tiny sailor's spyglass shell, peeking from a striped conch on golden sand", 'mini', 'animals')
  const b = pb('a hermit crab wearing a tiny snail-shell castle turret on its back, marching along a bright coral seabed', 'large', 'animals')
  // Token overlap alone would NOT catch these — the head noun is what does.
  assert.ok(subjectJaccard(a.subject, b.subject) < BATCH_JACCARD_COLLISION)
  assert.notEqual(briefsCollide(b, a), null)
})

record('briefsCollide: the two batch-5 cocktails do NOT collide', () => {
  // Deliberately: "tiki mug" and "pina colada" are different drinks, and there
  // is no shelf-level synonym list. Two cocktails in a batch is a range, not a
  // repeat.
  const a = pb('a tall flaming tiki mug topped with pineapple wedge and paper umbrella, set on a bar of glowing hibiscus petals', 'small', 'cocktails')
  const b = pb('a tall frosted pina colada in a pineapple shell with a paper umbrella and striped straw', 'small', 'cocktails')
  assert.equal(briefsCollide(b, a), null)
})

record('briefsCollide: different shelves never collide', () => {
  const a = pb('a hermit crab on golden sand', 'medium', 'animals')
  const b = pb('a hermit crab on golden sand', 'medium', 'coastal')
  assert.equal(briefsCollide(b, a), null)
})

record('postFilterBriefs: props first, then collisions, later brief dropped', () => {
  const batch = [
    pb('a great horned owl in flight across a full moon', 'medium', 'celestial'),
    pb('a barn owl in flight across a harvest moon', 'medium', 'celestial'),
    pb('a badger holding a lantern', 'medium', 'animals'),
  ]
  const { kept, rejects } = postFilterBriefs(batch)
  assert.equal(kept.length, 1)
  assert.equal(kept[0]!.subject, batch[0]!.subject) // the EARLIER of the pair survives
  assert.deepEqual(countRejects(rejects), { props: 1, collisions: 1 })
})

record('postFilterBriefs: a prior chunk is checked against but never re-filtered', () => {
  const prior = [pb('a badger holding a lantern', 'medium', 'animals')] // would fail the prop filter
  const { kept, rejects } = postFilterBriefs([pb('a badger in a woodland hollow', 'medium', 'animals')], prior)
  assert.equal(kept.length, 0)
  assert.equal(rejects[0]!.kind, 'collision')
})

record('postFilterBriefs: props:false leaves the curated pool register alone', () => {
  // The sampler's fallback examples are written in exactly the register the prop
  // filter rejects; filtering them out would turn a slow model call into an
  // empty batch.
  const pool = [pb('a fox in a mustard raincoat holding a lantern and a treasure map', 'large', 'animals')]
  assert.equal(postFilterBriefs(pool, [], { props: false }).kept.length, 1)
  assert.equal(postFilterBriefs(pool).kept.length, 0)
})

record('summaryLine: names the post-filter\'s work when it did any', () => {
  const base = { craft: 'cross-stitch', requested: 10, published: 2, culled: 8, duplicates: 0, skipped: 0, errors: 0, repaired: 4, generations: 36 }
  assert.ok(!summaryLine(base).includes('rejected for props'))
  const line = summaryLine({ ...base, propRejects: 8, collisionRejects: 2 })
  assert.ok(line.includes('8 briefs rejected for props'), line)
  assert.ok(line.includes('2 rejected as within-batch repeats'), line)
})

// ─── constrained mode: the head-noun match against the pool ────────────────

record('headNouns: a noun that merely ends in -ing/-ed is not a verb', () => {
  // Every one of these lost its subject before the exception list existed.
  assert.deepEqual(headNouns('a duckling on a green bank'), ['duckling'])
  assert.deepEqual(headNouns('a stocking hung on a mantel'), ['stocking'])
  assert.deepEqual(headNouns('a fluffy spring lamb with a flower crown'), ['spring', 'lamb'])
})

record('headNouns: a real verb still ends the phrase at the first content word', () => {
  assert.deepEqual(headNouns('a corgi napping in a teacup of daisies'), ['corgi'])
  assert.deepEqual(headNouns('a whale carrying a whole starlit galaxy on its back'), ['whale'])
  assert.deepEqual(headNouns('a badger holding a lantern'), ['badger'])
})

record('headNouns: "between" ends the phrase (the batch-6 miss)', () => {
  // Before the fix this read as ["moon", "split"] — the phrase ran straight past
  // "between" and stopped at the next participle instead.
  assert.deepEqual(headNouns('a crescent moon split between blazing sun face and starry night face'), ['crescent', 'moon'])
})

record('matchExampleByHead: a re-dressed pool subject still matches', () => {
  const examples = ['a red squirrel among autumn leaves and toadstools', 'a badger at dusk', 'a hare under a full moon']
  // Setting, season, time of day and palette all changed; the subject did not.
  assert.equal(matchExampleByHead('a red squirrel on a frosty branch at dawn', examples), examples[0])
  assert.equal(matchExampleByHead('a badger in bluebells under a summer sky', examples), examples[1])
  assert.equal(matchExampleByHead('a hare in a golden barley field', examples), examples[2])
})

record('matchExampleByHead: an invented subject matches nothing', () => {
  const examples = ['a red squirrel among autumn leaves and toadstools', 'a badger at dusk']
  assert.equal(matchExampleByHead('a scarlet hermit crab on a sunlit rock', examples), null)
  assert.equal(matchExampleByHead('a great horned owl across a full moon', examples), null)
})

record('matchExampleByHead: every pool example matches its own theme', () => {
  // The pool is constrained mode's entire vocabulary: an example that cannot
  // match itself is a subject the planner could never legally choose.
  for (const t of CROSS_STITCH_THEMES) {
    for (const ex of t.examples) {
      assert.equal(matchExampleByHead(ex, t.examples) !== null, true, `${t.id}: "${ex}"`)
    }
  }
})

record('postFilterBriefs: constrained mode rejects off-pool briefs, keeps dressed ones', () => {
  const examplesByTheme = { woodland: ['a badger at dusk', 'a hare under a full moon'] }
  const dressed = pb('a badger in bluebells at first light', 'medium', 'animals')
  const invented = pb('a scarlet hermit crab on a sunlit rock', 'medium', 'animals')
  const batch = [{ ...dressed, themeId: 'woodland' }, { ...invented, themeId: 'woodland' }]
  const { kept, rejects } = postFilterBriefs(batch, [], { props: 'light', examplesByTheme })
  assert.equal(kept.length, 1)
  assert.equal(kept[0]!.subject, dressed.subject)
  assert.equal(rejects[0]!.kind, 'off-pool')
  // Off-pool folds into the propRejects counter the run records.
  assert.deepEqual(countRejects(rejects), { props: 1, collisions: 0 })
})

record('lightPropReject: only what the model ADDED to the pool subject', () => {
  const example = 'a fox in a tiny raincoat with a paper boat'
  // The pool subject's own props are the subject — not an addition.
  assert.equal(lightPropReject('a fox in a tiny raincoat with a paper boat at dusk', example), null)
  // Without a baseline the light filter still fires on both patterns.
  assert.notEqual(lightPropReject('a fox in a tiny raincoat'), null)
  // A prop the example does not have IS an addition.
  assert.notEqual(lightPropReject('a badger at dusk with a lantern', 'a badger at dusk'), null)
})

record('propReject: light mode drops the strict word limit', () => {
  const long = pb('a red squirrel among autumn leaves and toadstools in low winter sun', 'mini')
  assert.notEqual(propReject(long, 'strict'), null)
  assert.equal(propReject(long, 'light'), null)
  assert.equal(propReject(long, 'off'), null)
})

// ─── the per-shelf cap ─────────────────────────────────────────────────────

const alloc = (rows: [string, number, number][]) =>
  rows.map(([slug, briefs, deficit]) => ({ slug, name: slug, briefs, deficit }))

record('capShelfBriefs: no shelf takes more than its share when there is room', () => {
  // Six shelves in play, so every over-cap slot has somewhere under the cap to go.
  const out = capShelfBriefs(
    alloc([['celestial', 4, 90], ['nursery', 3, 60], ['cocktails', 1, 40], ['food', 1, 20], ['halloween', 1, 15], ['hobbies', 0, 10]]),
    10,
  )
  assert.equal(Math.max(...out.map((a) => a.briefs)), 10 / SHELF_SHARE)
  assert.equal(out.reduce((n, a) => n + a.briefs, 0), 10) // nothing lost
})

record('capShelfBriefs: never three celestial in one batch of ten', () => {
  const out = capShelfBriefs(alloc([['celestial', 5, 200], ['nursery', 3, 60], ['cocktails', 2, 40]]), 10)
  assert.equal(out.find((a) => a.slug === 'celestial')!.briefs, 2)
})

record('capShelfBriefs: celestial gives up its overflow even with nowhere to put it', () => {
  // Only two shelves in play. The soft shelf takes the overflow back (that is the
  // "unless its deficit demands more" case); the hard-capped one never does.
  const out = capShelfBriefs(alloc([['celestial', 8, 300], ['nursery', 2, 50]]), 10)
  assert.equal(out.find((a) => a.slug === 'celestial')!.briefs, 2)
  assert.equal(out.find((a) => a.slug === 'nursery')!.briefs, 8)
  assert.equal(out.reduce((n, a) => n + a.briefs, 0), 10)
})

record('capShelfBriefs: overflow spreads evenly, never back onto one shelf', () => {
  // Three shelves, all at or over the cap: the four surplus slots go round the
  // soft shelves one at a time rather than making a four-brief shelf again.
  const out = capShelfBriefs(alloc([['celestial', 6, 300], ['nursery', 2, 50], ['cocktails', 2, 40]]), 10)
  assert.equal(out.find((a) => a.slug === 'celestial')!.briefs, 2)
  assert.deepEqual(
    out.filter((a) => a.slug !== 'celestial').map((a) => a.briefs).sort(),
    [4, 4],
  )
})

record('capShelfBriefs: a batch of only hard-capped shelves runs short rather than repeating', () => {
  const out = capShelfBriefs(alloc([['celestial', 10, 300]]), 10)
  assert.equal(out.find((a) => a.slug === 'celestial')!.briefs, 2)
  assert.equal(out.reduce((n, a) => n + a.briefs, 0), 2)
})

record('capShelfBriefs: an allocation already within the cap is untouched', () => {
  const input = alloc([['nursery', 2, 60], ['cocktails', 2, 40], ['food', 2, 20], ['halloween', 2, 15], ['hobbies', 2, 10]])
  const out = capShelfBriefs(input, 10)
  assert.deepEqual(out.map((a) => [a.slug, a.briefs]).sort(), input.map((a) => [a.slug, a.briefs]).sort())
})

record('shelfQuota: a shelf cannot exceed its slots in one batch (the batch-6 celestial)', () => {
  // Batch 6 was allocated ONE celestial slot and the planner returned three,
  // because nothing stopped it picking the same theme repeatedly.
  const quota = shelfQuotaCounts(['celestial', 'animals', 'nursery'])
  assert.deepEqual(quota, { celestial: 1, animals: 1, nursery: 1 })
  const batch = [
    pb('a great horned owl across a full moon', 'medium', 'celestial'),
    pb('a comet over a desert mesa', 'medium', 'celestial'),
    pb('a badger at dusk', 'medium', 'animals'),
  ]
  const { kept, rejects } = postFilterBriefs(batch, [], { props: 'off', shelfQuota: quota })
  assert.equal(kept.length, 2)
  assert.equal(kept.filter((b) => b.shelf === 'celestial').length, 1)
  assert.equal(rejects[0]!.kind, 'over-quota')
  // Over-quota folds into the collision counter the run records.
  assert.deepEqual(countRejects(rejects), { props: 0, collisions: 1 })
})

record('shelfQuota: briefs kept by an earlier chunk count toward the quota', () => {
  const quota = shelfQuotaCounts(['celestial', 'celestial', 'animals'])
  const prior = [pb('a comet over a desert mesa', 'medium', 'celestial')]
  const batch = [
    pb('a sun with a lion mane of rays', 'medium', 'celestial'),
    pb('an aurora over a snowy pine ridge', 'medium', 'celestial'),
  ]
  const { kept, rejects } = postFilterBriefs(batch, prior, { props: 'off', shelfQuota: quota })
  assert.equal(kept.length, 1)
  assert.equal(rejects[0]!.kind, 'over-quota')
})

// ─── subject-to-lane tags ──────────────────────────────────────────────────

const laneTagsFor = (id: string) => {
  const t = CROSS_STITCH_THEMES.find((x) => x.id === id)!
  return { examples: t.examples, lanes: t.lanes ?? LANES_ALL, ...(t.laneOverrides ? { overrides: t.laneOverrides } : {}) }
}

record('lanesForSubject: a theme default applies to all its subjects', () => {
  const scenes = laneTagsFor('cosy-scenes')
  assert.deepEqual(lanesForSubject('a corner flower shop with buckets of blooms', scenes), LANES_LARGE_UP)
  assert.deepEqual(lanesForSubject('a victorian greenhouse in high summer', scenes), LANES_LARGE_UP)
})

record('lanesForSubject: a per-subject override beats the theme default', () => {
  // cute-animals is mini-and-up, but the one that is really a scene is not.
  const animals = laneTagsFor('cute-animals')
  assert.deepEqual(lanesForSubject('a corgi napping in a teacup of daisies', animals), LANES_ALL)
  assert.deepEqual(
    lanesForSubject('a cat curled asleep on a pile of vintage books with a candle', animals),
    LANES_MEDIUM_UP,
  )
})

record('lanesForSubject: an override survives a re-dressing', () => {
  // The override is keyed on the example, and the brief is matched to it by head
  // noun — so changing the setting must not lose the rule.
  const witchy = laneTagsFor('witchy-gothic')
  assert.deepEqual(lanesForSubject("a witch's apothecary shelf of potion bottles at dawn", witchy), LANES_LARGE_UP)
})

record('lanesForSubject: an unknown theme carries no rule', () => {
  assert.equal(lanesForSubject('a badger at dusk', undefined), null)
})

record('postFilterBriefs: the two batch-7 lane mismatches are rejected', () => {
  const laneTags = { 'cosy-scenes': laneTagsFor('cosy-scenes'), cocktails: laneTagsFor('cocktails') }
  // Batch 7 put a shopfront in mini at 9 colours ("shapes read as mush not shop")
  // and a margarita in mini at 10 ("glass shape malformed").
  const shop = { ...pb('a corner flower shop with buckets of blooms', 'mini', 'scenes'), themeId: 'cosy-scenes' }
  const drink = { ...pb('a margarita with lime', 'mini', 'cocktails'), themeId: 'cocktails' }
  const ok = { ...pb('a margarita with lime in low sun', 'small', 'cocktails'), themeId: 'cocktails' }
  const { kept, rejects } = postFilterBriefs([shop, drink, ok], [], { props: 'off', laneTags })
  assert.equal(kept.length, 1)
  assert.equal(kept[0]!.lane, 'small')
  assert.equal(rejects.length, 2)
  assert.ok(rejects.every((r) => r.kind === 'wrong-lane'), JSON.stringify(rejects.map((r) => r.kind)))
  // Wrong-lane folds into the propRejects counter the run records.
  assert.deepEqual(countRejects(rejects), { props: 2, collisions: 0 })
})

record('smallestLane: promotion targets the smallest lane that holds the subject', () => {
  assert.equal(smallestLane(LANES_LARGE_UP), 'large')
  assert.equal(smallestLane(LANES_MEDIUM_UP), 'medium')
  assert.equal(smallestLane(LANES_ALL), 'mini')
  assert.equal(smallestLane([]), null)
})

record('every pool subject has at least one lane it can be built in', () => {
  // A subject with no allowed lane could never be planned at all.
  for (const t of CROSS_STITCH_THEMES) {
    for (const ex of t.examples) {
      const lanes = lanesForSubject(ex, laneTagsFor(t.id))
      assert.ok(lanes && lanes.length > 0, `${t.id}: "${ex}"`)
    }
  }
})

record('a lane override is only ever a FLOOR, never a ceiling', () => {
  // Promotion (mini → large) must always be safe, so every tag set must run to
  // the top of the range. A tag like ['mini','small'] would make the dense
  // showpiece promotion illegal and silently break the range rule.
  for (const t of CROSS_STITCH_THEMES) {
    for (const lanes of [t.lanes ?? LANES_ALL, ...Object.values(t.laneOverrides ?? {})]) {
      assert.ok(lanes.includes('dense'), `${t.id}: ${lanes.join('/')}`)
    }
  }
})

record('summaryLine: counts how many briefs were re-dressed', () => {
  const base = { craft: 'cross-stitch', requested: 10, published: 2, culled: 8, duplicates: 0, skipped: 0, errors: 0, repaired: 3, generations: 34 }
  // Batch 7's shape: constrained, and nine of ten copied out verbatim.
  assert.ok(summaryLine({ ...base, plannerMode: 'constrained', dressedBriefs: 1 }).includes('1 of 10 re-dressed'))
  // The free planner has no pool subject to dress, so the clause stays off.
  assert.ok(!summaryLine({ ...base, plannerMode: 'free', dressedBriefs: 1 }).includes('re-dressed'))
})

record('summaryLine: names which planner wrote the batch', () => {
  const base = { craft: 'cross-stitch', requested: 10, published: 3, culled: 7, duplicates: 0, skipped: 0, errors: 0, repaired: 2, generations: 30 }
  assert.ok(summaryLine({ ...base, plannerMode: 'constrained' }).includes('constrained planner'))
  assert.ok(!summaryLine(base).includes('planner'))
})

// ─── Report ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await imageTests()
  await vividnessTests()
  const failed = results.filter((r) => !r.passed)
  for (const r of results) {
    console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
    if (!r.passed && r.detail) console.log(`     ${r.detail}`)
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed${thumbs ? ' (image rules run against cached catalogue thumbnails)' : ''}`)
  if (failed.length > 0) process.exit(1)
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
