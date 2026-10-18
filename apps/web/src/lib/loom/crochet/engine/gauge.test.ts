/**
 * The fine-gauge knob (gauge.ts), put through the loom's own gates.
 *
 *  1. The helpers are the identity at gauge 1 (the geometry-hash guards in
 *     amigurumi-presets.test.ts then prove the presets are untouched) and
 *     write valid counts at other gauges.
 *  2. The bear, bunny and cow at gauges 1.3 and 1.6 (M) build, relax and
 *     audit clean, and settle within 5% of their gauge-1 size.
 *  3. The written pattern carries the new counts, round by round, and the
 *     finer yarn and hook.
 *
 * Slow (six full compositions at up to 2.6x the stitches):
 *
 *   cd apps/web && npx tsx src/lib/loom/crochet/engine/gauge.test.ts
 *
 * GAUGES=1.3 or BASES=cow narrows a run (GAUGES=1.4 also passes: the proof gauge).
 * SIZES=S,L runs the whole toy at other sizes (default M), EAR_SIZES= skips the
 * ear-piece checks; designerAudit.ts GAUGE_AUDITED lists what has passed.
 */

import assert from 'node:assert/strict'
import { auditPart, buildPart, compileComposition } from './composition'
import { buildAmigurumiProgram, type AmigurumiBase, type AmigurumiChoices, type AmigurumiSize } from './amigurumiPresets'
import { PRESET_SETTLED_SIZE_MM_GENERATED } from './amigurumiSizes.generated'
import { compositionPieces, writePieceInstructions, writeCompositionInstructions } from './compositionPattern'
import { ballRounds, cordRounds, tubeRounds } from './roundProfiles'
import { sphereRounds } from './sphereProfile'
import {
  gBall, gCone, gCord, gDisc, gEar, gEven, gSphereRounds, gTube, gaugeHairPatch, gaugeYarn, gaugeYarnRadiusMm, hookForYarnRadiusMm,
  nearestYarnWeight,
} from './gauge'
import { buildEar } from './earPiece'
import { COW_CUP_EAR } from './cowPreset'
import { BUNNY_LOP_EAR } from './amigurumiPresets'
import { hairPatchesFor } from './hairPatch'

const SIZE_TOLERANCE = 0.05

const failures: string[] = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`  ok  ${name}`)
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`)
    console.log(`FAIL  ${name}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** Every round count: integer, >= 4, and no round more than doubles or
 *  less than halves the one before (what a stitch can do). */
function assertWritable(rounds: number[], label: string): void {
  rounds.forEach((n, k) => {
    assert.ok(Number.isInteger(n) && n >= 4, `${label} round ${k + 1}: ${n}`)
    if (k > 0) {
      const p = rounds[k - 1]!
      assert.ok(n <= 2 * p && 2 * n >= p, `${label} round ${k + 1}: ${p} -> ${n}`)
    }
  })
}

console.log('The helpers are the identity at gauge 1')
check('identity', () => {
  for (const [e, x] of [[12, 1], [24, 5], [39, 1], [60, 1], [42, 2]] as const) assert.deepEqual(gSphereRounds(e, x, 1), sphereRounds(e, x))
  for (const [e, x] of [[12, 1], [18, 4], [30, 3]] as const) assert.deepEqual(gBall(e, x, 1), ballRounds(e, x))
  for (const [e, x] of [[12, 0], [12, 10], [18, 6]] as const) assert.deepEqual(gTube(e, x, 1), tubeRounds(e, x))
  assert.deepEqual(gCord(5, 1), cordRounds(5))
  assert.deepEqual(gDisc([6, 12, 18, 24], 1), [6, 12, 18, 24])
  assert.deepEqual(gCone(4, 8, 0, 4, 1), [4, 5, 6, 7, 8, 4])
  assert.deepEqual(gCone(4, 11, 0, 6, 1), [4, 5, 6, 7, 8, 9, 10, 11, 6])
  const hair = hairPatchesFor('curly-fringe', 'head', '#000000', { x: 0, y: 0, z: 1 })[0]!
  assert.equal(gaugeHairPatch(hair, 1), hair)
  assert.deepEqual(gaugeYarn({ yarnWeight: 'fine', hookMm: 2.5 }, 1), { yarnRadiusMm: 1.3, yarnWeight: 'fine', hookMm: 2.5 })
  for (const o of [...Object.values(COW_CUP_EAR), ...Object.values(BUNNY_LOP_EAR)]) assert.equal(gEar(o, 1), o)
  assert.equal(gaugeYarnRadiusMm('bulky', 1), 3.0)
})

console.log('\nAt other gauges the counts are writable and scale with g')
check('scaled counts', () => {
  for (const g of [1.3, 1.4, 1.6, 2]) {
    const sph = gSphereRounds(39, 1, g)
    assertWritable(sph, `sphere 39 @${g}`)
    assert.ok(Math.abs(sph.length - Math.round(sphereRounds(39, 1).length * g)) <= 1, `sphere rounds @${g}: ${sph.length}`)
    assert.ok(Math.abs(Math.max(...sph) - 39 * g) <= 3, `sphere equator @${g}`)
    for (const r of [gBall(18, 3, g), gTube(12, 10, g), gCord(4, g), gCone(4, 11, 0, 6, g)]) assertWritable(r, `@${g} ${r.join(',')}`)
    const tube = gTube(12, 10, g)
    assert.equal(Math.max(...tube) % 2, 0, 'a tube narrows in twos, so its equator is even')
    assert.equal(gEven(12, g) % 2, 0)
    assert.ok(Math.abs(tube.length - Math.round(tubeRounds(12, 10).length * g)) <= 1, `tube length @${g}`)
    const disc = gDisc([6, 12, 18, 24], g)
    disc.forEach((n, k) => assert.equal(n, 6 * (k + 1), 'a flat disc climbs in sixes'))
    const y = gaugeYarn({ yarnWeight: 'fine', hookMm: 2.5 }, g)
    assert.ok(Math.abs(y.yarnRadiusMm - 1.3 / g) < 1e-9)
    assert.ok(y.hookMm < 2.5, `a finer yarn on a smaller hook: ${y.hookMm}`)
    assert.ok(y.gaugeText && y.gaugeText.includes(`${y.hookMm} mm hook`))
  }
  assert.equal(nearestYarnWeight(2.14), 'worsted')
  assert.equal(nearestYarnWeight(0.93), 'lace')
  assert.equal(hookForYarnRadiusMm(1.3), 2.5)
  assert.equal(hookForYarnRadiusMm(2.1), 4)
  assert.equal(hookForYarnRadiusMm(3.0), 6)
})

const GAUGES = (process.env.GAUGES ?? '1.3,1.6').split(',').map(Number)
const BASES = (process.env.BASES ?? 'bear,bunny,cow').split(',') as AmigurumiBase[]
/** SIZES=S,L runs the whole-toy audit at other sizes (default M; the designer's
 *  GAUGE_AUDITED table lists the size x gauge pairs that have passed). */
const TOY_SIZES = (process.env.SIZES ?? 'M').split(',') as AmigurumiSize[]
const EAR_SIZES = (process.env.EAR_SIZES ?? 'S,M,L').split(',').filter(Boolean) as AmigurumiSize[]

// The opt-in ear pieces (earPiece.ts; cuppedEars on the cow and bunny) at every
// size, in the finer yarn: built, relaxed and audited as the composition does.
console.log('\nThe lop ears (closed, and the cupped-ear pieces) at fine gauge audit clean')
for (const gauge of GAUGES) {
  for (const size of EAR_SIZES) {
    check(`bunny closed lop ${size} @ gauge ${gauge}`, () => {
      const program = buildAmigurumiProgram({
        base: 'bunny', size, mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true, gauge,
      })
      const ear = program.parts.find((x) => x.name === 'ear-l')!
      const yr = compileYr(program)
      const problems = auditPart(buildPart(ear, yr).built, ear, yr)
      assert.deepEqual(problems.slice(0, 3), [], `${Math.max(...ear.rounds)} x ${ear.rounds.length}: ${problems.length} problems`)
    })
    for (const [kind, o, weight] of [['cow cup', COW_CUP_EAR[size], 'bulky'], ['bunny open lop', { ...BUNNY_LOP_EAR[size], liningHex: '#e8b4b0' }, 'fine']] as const) {
      check(`${kind} ${size} @ gauge ${gauge}`, () => {
        const go = gEar(o, gauge)
        const { problems } = buildEar(go, gaugeYarnRadiusMm(weight, gauge))
        assert.deepEqual(problems.slice(0, 3), [], `${go.width} st: ${problems.length} problems`)
      })
    }
  }
}

console.log('\nThe toys at fine gauge build clean, keep their size, and the words carry the new counts')
for (const base of BASES) {
  for (const size of TOY_SIZES) for (const gauge of GAUGES) {
    const label = `${base}/${size} @ gauge ${gauge}`
    check(label, () => {
      const choices: AmigurumiChoices = {
        base, size, mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true, gauge,
      }
      const one = buildAmigurumiProgram({ ...choices, gauge: undefined })
      const program = buildAmigurumiProgram(choices)
      const t = Date.now()
      const compiled = compileComposition(program)
      assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))
      let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
      for (const p of compiled.placed) {
        minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
        minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
      }
      const recorded = PRESET_SETTLED_SIZE_MM_GENERATED[`${base}-${size}`]!
      const w = maxx - minx, h = maxz - minz
      for (const [what, got, want] of [['width', w, recorded.width], ['height', h, recorded.height]] as const) {
        const d = Math.abs(got - want) / want
        assert.ok(d <= SIZE_TOLERANCE, `${what} ${got.toFixed(1)} mm is ${(d * 100).toFixed(1)}% off gauge 1's ${want} mm`)
      }
      // It still SITS on the table (the cow's legs carry a measured lift per gauge).
      assert.ok(Math.abs(minz) <= 0.5, `minz ${minz.toFixed(2)} mm: not sitting on the table`)
      // The finer yarn: exactly g x finer for the geometry, and named and
      // hooked for the maker.
      const yr1 = compileYr(one)
      assert.ok(Math.abs(compiled.yr - yr1 / gauge) < 1e-9, `yarn radius ${compiled.yr}`)
      assert.ok((program.hookMm ?? 0) < (one.hookMm ?? 0), `hook ${program.hookMm} not finer than ${one.hookMm}`)
      assert.ok(program.gaugeText?.includes(`${program.hookMm} mm hook`), 'the gauge line names the hook')
      // More, smaller stitches: ~g^2 the total.
      const sts = (p: typeof program): number => p.parts.reduce((a, x) => a + x.rounds.reduce((u, v) => u + v, 0), 0)
      const ratio = sts(program) / sts(one)
      assert.ok(ratio > gauge * gauge * 0.8 && ratio < gauge * gauge * 1.25, `stitch ratio ${ratio.toFixed(2)} vs g^2 ${(gauge * gauge).toFixed(2)}`)
      // THE WORDS: every piece's rounds, as written, are its new counts.
      for (const piece of compositionPieces(program)) {
        const lines = writePieceInstructions(piece)
        const counts = lines.map((l) => /^Round\s+\d+.*\((\d+) sts?\)\s*$/.exec(l)?.[1]).filter((c): c is string => c != null).map(Number)
        if (!counts.length) continue
        assert.deepEqual(counts, piece.rounds, `${piece.label}: the words count ${counts.join(',')}, the piece is ${piece.rounds.join(',')}`)
      }
      const words = writeCompositionInstructions(program).join('\n')
      const head = program.parts.find((x) => x.name === 'head')!
      assert.ok(new RegExp(`\\(${Math.max(...head.rounds)}( sts)?\\)`).test(words), 'the head equator is in the words')
      for (const hp of program.hair ?? []) {
        const widest = hp.rounds[hp.rounds.length - 1]!
        assert.ok(new RegExp(`\\(${widest}( sts)?\\)`).test(words), `the ${hp.name}'s last round (${widest}) is in the words`)
      }
      console.log(
        `      ${program.yarnWeight} ${compiled.yr.toFixed(2)} mm yarn, ${program.hookMm} mm hook; ${sts(program)} sts (x${ratio.toFixed(2)}); ` +
        `${w.toFixed(0)} x ${h.toFixed(0)} mm (gauge 1 ${recorded.width} x ${recorded.height}); minz ${minz.toFixed(2)}; ${((Date.now() - t) / 1000).toFixed(0)} s`,
      )
    })
  }
}

function compileYr(p: ReturnType<typeof buildAmigurumiProgram>): number {
  return p.yarnRadiusMm ?? ({ fine: 1.3, worsted: 2.1, bulky: 3.0 } as Record<string, number>)[p.yarnWeight ?? 'worsted']!
}

if (failures.length) {
  console.error(`\n${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nThe fine-gauge knob holds.')
