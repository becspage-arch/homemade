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
import { measureVividness, vividnessVerdict, MIN_INK, MIN_CHROMA } from './vividness'
import { runIsComplete } from './run-status'
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

// ─── the pale guard ────────────────────────────────────────────────────────

/**
 * Calibration references from the live catalogue. Keyed by pattern id, which is
 * how the September 2026 dedupe scan named its cached thumbnails. Run with
 * --thumbs <dir> (or XS_THUMB_CACHE) to check the real files; without the cache
 * these cases skip rather than fail, so the suite still runs anywhere.
 */
const PALE_REFS: [string, string][] = [
  ['cmtoul9q6000301adiawycq6a', 'proof-batch cupcake, cream on cream (culled)'],
  ['cmqzrgvgw001ge8v4ka2r3tiz', 'cute-lamb-meadow, pale pastel'],
]
const VIVID_REFS: [string, string][] = [
  ['cmtoure6d000a01adki8tan44', 'proof cottage, 9 colours, a gem'],
  ['cmql3uurg000br0v4k7ss5chv', 'delft-hare, 12 colours two-tone'],
  ['cmqmnonfw0005b4v445y73u4r', 'blackwork-snowflake, 4 colours'],
  ['cmqmnosdq0006b4v4g8a06m6d', 'blackwork-pomegranate, 4 colours'],
  ['cmr6l4gaq000hakv4qwudtrvs', 'big-coral-reef, 120 colours'],
  ['cmtoumqq7000701ad100zgamv', 'proof haunted house, 87 colours, Flux Pro'],
  ['cmtouk9zw000401adwqpj7ozr', 'proof apothecary, 33 colours'],
]

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
