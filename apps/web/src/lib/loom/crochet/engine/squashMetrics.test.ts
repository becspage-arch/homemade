/**
 * SOFT-SQUASH METRICS, tested (squashMetrics.ts; design note
 * `crochet-bar/jobs/soft-squash.md` in the shared folder).
 *
 * Part 1 (fast) checks the measures themselves on synthetic balls: a gap
 * reads as a gap, a rigid crossing reads as penetration with a thin contact
 * ring, a pressed lens reads as a filled contact patch, a flattened bottom
 * reads flatter than a round one, and measuring never writes to its input.
 *
 * Part 2 (slow: ~6 min, a full compile each) measures the settled presets
 * the squash pass is for — cow, bunny and bear at M, doll M — and holds them
 * to the rails:
 *   - the audits are clean and the geometry hash is the recorded one before
 *     AND after measuring (the harness is read-only);
 *   - while a preset's hash is the baseline's, its metrics equal the recorded
 *     baseline (`squashBaseline.generated.ts`) exactly;
 *   - the HOLD rails pass against that baseline always (nothing sinks through
 *     the table, no join digs deeper, no yarn clips deeper);
 *   - the TARGET rails (contact fill, contact growth, flat bottoms, unjoined
 *     pieces pressing instead of passing through) are printed, and enforced
 *     with SQUASH_TARGETS=1 — the switch the squash pass turns on.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/squashMetrics.test.ts
 *
 * SQUASH_PRESETS=cow,bear limits part 2 (SQUASH_PRESETS=none skips it).
 * SQUASH_PRINT=1 rewrites `squashBaseline.generated.ts` from a fresh compile
 * (only after a geometry change has been judged and signed off).
 */

import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { test } from 'node:test'
import type { V3 } from '../yarnLoop'
import { compileComposition, type CompiledComposition } from './composition'
import { geometryHash } from './programScene'
import { allPresetChoices, buildAmigurumiProgram, type AmigurumiChoices } from './amigurumiPresets'
import { PRESET_GEOMETRY_HASH_GENERATED } from './amigurumiSizes.generated'
import { DOLL_GEOMETRY_HASH, dollPresetChoices } from './doll'
import {
  checkSquashRails,
  measureSquash,
  squashInputFromCompiled,
  type SquashInput,
  type SquashMetrics,
  type SquashPartInput,
} from './squashMetrics'
import { SQUASH_BASELINE } from './squashBaseline.generated'

// ─── Part 1: synthetic shapes. ───

const YR = 1.3

/** A ball as one strand: a spiral from the south pole (first point) to the
 *  north pole (last point), the way a piece is worked ring to fasten-off. */
function ball(c: V3, R: number, squash?: (p: V3) => V3): V3[] {
  const turns = Math.round((Math.PI * R) / (2.2 * YR))
  const out: V3[] = []
  const n = Math.round(turns * 2 * Math.PI * R / (0.6 * YR))
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const th = Math.PI * t
    const ph = 2 * Math.PI * turns * t
    const p = { x: c.x + R * Math.sin(th) * Math.cos(ph), y: c.y + R * Math.sin(th) * Math.sin(ph), z: c.z - R * Math.cos(th) }
    out.push(squash ? squash(p) : p)
  }
  return out
}

function part(name: string, on: string, ctrl: V3[]): SquashPartInput {
  return { name, on, kind: 'stuffed', ctrl, yarnMm: YR }
}

function two(a: V3[], b: V3[]): SquashInput {
  return { name: 'synthetic', yr: YR, parts: [part('body', 'ground', a), part('head', 'body', b)] }
}

test('a gap reads as a gap, with no contact and no penetration', () => {
  const m = measureSquash(two(ball({ x: 0, y: 0, z: 20 }, 20), ball({ x: 0, y: 0, z: 20 + 20 + 15 + 5 }, 15)))
  const p = m.pairs[0]!
  assert.ok(p.joined)
  assert.ok(p.gapMm != null && Math.abs(p.gapMm - (5 - 2 * YR)) < 0.6, `gap ${p.gapMm}`)
  assert.equal(p.penetrationMm, 0)
  assert.equal(p.contactPatchMm2, 0)
})

test('a rigid crossing reads as penetration and a thin contact ring', () => {
  // The head sunk 8 mm into the body: shells crossing, nothing yields.
  const m = measureSquash(two(ball({ x: 0, y: 0, z: 20 }, 20), ball({ x: 0, y: 0, z: 20 + 20 + 15 - 8 }, 15)))
  const p = m.pairs[0]!
  assert.ok(p.penetrationMm > 6, `penetration ${p.penetrationMm}`)
  assert.ok(p.gapMm != null && p.gapMm < 0, 'the yarns clip at the crossing line')
  assert.ok(p.contactPatchMm2 > 0)
  assert.ok(p.contactFill < 0.6, `a crossing is a ring, not a lens: fill ${p.contactFill}`)
})

test('a pressed lens reads as a filled contact patch, with no penetration', () => {
  // The same two balls, but each flattened onto a shared plane (z = zc) and
  // held one yarn apart there: what a soft head on a soft body does.
  const zc = 38
  const body = ball({ x: 0, y: 0, z: 20 }, 20, (p) => (p.z > zc - YR ? { ...p, z: zc - YR } : p))
  const head = ball({ x: 0, y: 0, z: zc + 15 - 4 }, 15, (p) => (p.z < zc + YR ? { ...p, z: zc + YR } : p))
  const crossing = measureSquash(two(ball({ x: 0, y: 0, z: 20 }, 20), ball({ x: 0, y: 0, z: 20 + 20 + 15 - 8 }, 15))).pairs[0]!
  const p = measureSquash(two(body, head)).pairs[0]!
  assert.ok(p.penetrationMm < YR, `penetration ${p.penetrationMm}`)
  assert.ok(p.contactFill > 0.75, `fill ${p.contactFill}`)
  assert.ok(p.contactPatchMm2 > 1.5 * crossing.contactPatchMm2, `patch ${p.contactPatchMm2} vs crossing ${crossing.contactPatchMm2}`)
  // And it passes the target rails the crossing fails.
  const base = measureSquash(two(ball({ x: 0, y: 0, z: 20 }, 20), ball({ x: 0, y: 0, z: 20 + 20 + 15 - 8 }, 15)))
  const after = measureSquash(two(body, head))
  assert.ok(checkSquashRails(base, base).target.some((t) => t.includes('contactFill')))
  const r = checkSquashRails(after, base)
  assert.deepEqual(r.hold, [])
  assert.ok(!r.target.some((t) => t.includes('head>body')), r.target.join(' | '))
})

test('a flattened bottom reads flatter than a round one', () => {
  const round = measureSquash({ name: 'r', yr: YR, parts: [part('body', 'ground', ball({ x: 0, y: 0, z: 20 }, 20))] })
  // Sunk 4 mm and clamped to the table: a soft bottom sat on the cloth.
  const flat = measureSquash({ name: 'f', yr: YR, parts: [part('body', 'ground', ball({ x: 0, y: 0, z: 16 }, 20, (p) => (p.z < 0 ? { ...p, z: 0 } : p)))] })
  const r = round.ground[0]!.flatBottomRatio
  const f = flat.ground[0]!.flatBottomRatio
  assert.ok(f > r + 0.2 && f >= 0.45, `flat ${f} vs round ${r}`)
  assert.ok(checkSquashRails(round).target.some((t) => t.includes('flat-bottom')))
  assert.ok(!checkSquashRails(flat).target.some((t) => t.includes('flat-bottom')))
})

test('the hold rails catch a digging join and a sunk table', () => {
  const base = measureSquash(two(ball({ x: 0, y: 0, z: 20 }, 20), ball({ x: 0, y: 0, z: 47 }, 15)))
  const deeper = measureSquash(two(ball({ x: 0, y: 0, z: 18 }, 20), ball({ x: 0, y: 0, z: 40 }, 15)))
  const r = checkSquashRails(deeper, base)
  assert.ok(r.hold.some((h) => h.includes('penetration')), r.hold.join(' | '))
  assert.ok(r.hold.some((h) => h.includes('through the table')), r.hold.join(' | '))
})

test('measuring never writes to its input', () => {
  const input = two(ball({ x: 0, y: 0, z: 20 }, 20), ball({ x: 0, y: 0, z: 47 }, 15))
  const copy = JSON.parse(JSON.stringify(input)) as SquashInput
  measureSquash(input)
  assert.deepEqual(input, copy)
})

// ─── Part 2: the settled presets. ───

type PresetKey = 'cow' | 'bunny' | 'bear' | 'doll'
const ALL: PresetKey[] = ['cow', 'bunny', 'bear', 'doll']
const wanted = (process.env.SQUASH_PRESETS ?? 'all').toLowerCase()
const PRESETS: PresetKey[] = wanted === 'all' ? ALL : wanted === 'none' ? [] : ALL.filter((k) => wanted.split(',').includes(k))
const PRINT = process.env.SQUASH_PRINT === '1'
const TARGETS = process.env.SQUASH_TARGETS === '1'

function choicesFor(k: PresetKey): AmigurumiChoices {
  if (k === 'doll') return dollPresetChoices().find((c) => c.size === 'M')! as AmigurumiChoices
  return allPresetChoices().find((c) => c.base === k && c.size === 'M')!
}

/** The hash exactly as `compileComposition` computes it, recomputed from the
 *  compiled pieces (yarn parts, then hair). */
function rehash(c: CompiledComposition): string {
  const nodes = [...c.placed.flatMap((p) => p.ctrl), ...c.hair.flatMap((h) => h.ctrl)]
  return geometryHash({ model: { nodes } } as never)
}

const fresh: Record<string, { hash: string; metrics: SquashMetrics }> = {}

for (const k of PRESETS) {
  test(`${k} M: measured read-only, audits clean, hold rails pass`, () => {
    const compiled = compileComposition(buildAmigurumiProgram(choicesFor(k)))
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))
    const key = `${k}-M`
    const tableHash = k === 'doll' ? DOLL_GEOMETRY_HASH[key] : PRESET_GEOMETRY_HASH_GENERATED[key]
    const hash = compiled.geometryHash.slice(0, 8)
    assert.equal(rehash(compiled), compiled.geometryHash, 'the hash recomputes from the compiled pieces')
    if (!PRINT) assert.equal(hash, tableHash, `${key} hash moved from the size table`)

    const m = measureSquash(squashInputFromCompiled(key, compiled))
    // Read-only: the compiled geometry hashes exactly as before measuring.
    assert.equal(rehash(compiled), compiled.geometryHash, 'measuring moved the geometry')
    fresh[key] = { hash, metrics: m }

    const base = SQUASH_BASELINE[key]
    const rails = checkSquashRails(m, base?.metrics)
    for (const p of m.pairs.filter((p) => p.joined && /^(stuffed|tube)\/(stuffed|tube)$/.test(p.kinds)))
      console.log(`      ${key} ${(p.child + '>' + p.parent).padEnd(22)} gap ${p.gapMm} pen ${p.penetrationMm} patch ${p.contactPatchMm2} fill ${p.contactFill} dent ${p.parentDentMm}`)
    for (const g of m.ground) console.log(`      ${key} ground ${g.part.padEnd(14)} patch ${g.patchMm2} flat ${g.flatBottomRatio}`)
    console.log(`      ${key} targets failing: ${rails.target.length}`)
    if (PRINT) return
    assert.ok(base, `${key} has no recorded squash baseline — run with SQUASH_PRINT=1`)
    if (hash === base.hash) assert.deepEqual(m, base.metrics, `${key}: same geometry, different metrics — the measures changed`)
    assert.deepEqual(rails.hold, [], rails.hold.join(' | '))
    if (TARGETS) assert.deepEqual(rails.target, [], rails.target.join(' | '))
  })
}

if (PRINT) {
  test('write squashBaseline.generated.ts', () => {
    const merged = { ...SQUASH_BASELINE, ...fresh }
    const body =
      `/**\n * GENERATED by \`squashMetrics.test.ts\` with SQUASH_PRINT=1 — do not hand-edit.\n *\n` +
      ` * The soft-squash baseline: contact and ground metrics of the settled presets\n` +
      ` * before any squash pass (squashMetrics.ts). The test holds a preset to these\n` +
      ` * numbers exactly while its geometry hash is the one recorded here, and holds\n` +
      ` * a squashed preset to the rails against them.\n */\n\n` +
      `import type { SquashMetrics } from './squashMetrics'\n\n` +
      `export const SQUASH_BASELINE: Record<string, { hash: string; metrics: SquashMetrics }> = ${JSON.stringify(merged, null, 2)}\n`
    writeFileSync(new URL('./squashBaseline.generated.ts', import.meta.url), body)
  })
}
