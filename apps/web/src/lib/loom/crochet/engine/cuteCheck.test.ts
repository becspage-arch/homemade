/**
 * THE CUTE CHECK, tested (cute-engine plan step 3, 26 Oct 2026).
 *  - the measurer on known simple shapes gives known numbers: Lab colours, a
 *    square's corners and straight sides against a circle's, a cone's taper
 *    and a quarter-circle tube's sagitta / bend / rise, an even ear rim
 *    against an off-centre one, a synthetic toy's eye spacing, size, tilt
 *    and asymmetry count;
 *  - the check: our cow-fable-1025 r1 photo numbers fail exactly the 23 rules
 *    step 1 pinned, the plain lines read as promised, the gate blocks hard and
 *    firm geometry failures only, and the report never throws;
 *  - the wiring: a small real compile carries a report, the gate turns its
 *    failures into problems, and the geometry hash is the same either way.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/cuteCheck.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { V3 } from '../yarnLoop'
import { compileComposition, type CompiledComposition, type CompositionProgram, type PlacedPart } from './composition'
import {
  FrontRaster,
  centreLineShape,
  earRimRatio,
  fitCentreLine,
  frontFrame,
  hexToLab,
  inferToyFamily,
  measureCute,
  outlineSoftness,
  type CuteMeasurement,
} from './cuteMeasure'
import { cuteCheck, cuteReportFor } from './cuteCheck'
import { CUTE_RULES, OURS_COW_1025R1, type CuteQuantity } from './cuteRules'
import { sphereRounds } from './sphereProfile'
import { tubeRounds } from './roundProfiles'

const near = (a: number, b: number, tol: number, what: string): void =>
  assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`)

test('hex to CIE Lab (D65)', () => {
  const w = hexToLab('#ffffff')
  near(w[0], 100, 0.01, 'white L'); near(w[1], 0, 0.01, 'white a'); near(w[2], 0, 0.01, 'white b')
  near(hexToLab('#000000')[0], 0, 0.01, 'black L')
  near(hexToLab('#808080')[0], 53.59, 0.02, 'mid grey L')
  const red = hexToLab('#ff0000')
  near(red[0], 53.24, 0.05, 'red L'); near(red[1], 80.09, 0.1, 'red a'); near(red[2], 67.2, 0.1, 'red b')
})

test('the front frame follows the camera yaw', () => {
  const f0 = frontFrame({})
  near(f0.u.x, 1, 1e-9, 'u.x'); near(f0.f.y, 1, 1e-9, 'f.y')
  const f9 = frontFrame({ yawDeg: 90 })
  near(f9.f.x, 1, 1e-9, 'yaw 90 front is +x')
})

/** A filled shape drawn into a raster, its outline traced. */
function outlineOf(inside: (u: number, z: number) => boolean, size: number): [number, number][] {
  const R = new FrontRaster(-size, -size, 1, size, size)
  for (let z = -size; z <= size; z += 0.5) for (let u = -size; u <= size; u += 0.5) if (inside(u, z)) R.disc(u, z, 0.6, 0)
  R.fillHoles()
  return R.outline()
}

test('silhouette: a square has 4 sharp corners and straight sides, a circle has none', () => {
  // At the photos' scale: a head 310 cells across, this square a third of it.
  const sq = outlineSoftness(outlineOf((u, z) => Math.abs(u) <= 50 && Math.abs(z) <= 50, 70), 310, () => true)
  assert.equal(sq.sharpCorners, 4)
  near(sq.straightRunToW, 100 / 310, 0.03, 'square side / W')
  const ci = outlineSoftness(outlineOf((u, z) => u * u + z * z <= 50 * 50, 70), 310, () => true)
  assert.equal(ci.sharpCorners, 0)
  assert.ok(ci.straightRunToW < 0.25, `circle straight run ${ci.straightRunToW}`)
  // Only the rows asked for count: the square's top two corners alone.
  const top = outlineSoftness(outlineOf((u, z) => Math.abs(u) <= 50 && Math.abs(z) <= 50, 70), 310, (j) => j > 70)
  assert.equal(top.sharpCorners, 2)
})

/** A tube worked in rounds round a centre-line path: one strand point per
 *  stitch, each round a ring of `n` stitches of radius r(t) square to the path. */
function tubeStrand(path: (t: number) => V3, radius: (t: number) => number, rounds: number[]): V3[] {
  const out: V3[] = []
  const R = rounds.length
  rounds.forEach((n, k) => {
    for (let i = 0; i < n; i++) {
      const t = (k + i / n) / R
      const c = path(t)
      const a = path(Math.max(0, t - 0.01)), b = path(Math.min(1, t + 0.01))
      const tx = b.x - a.x, tz = b.z - a.z
      const tl = Math.hypot(tx, tz) || 1
      // The ring spans the path's in-plane normal and y.
      const nx = -tz / tl, nz = tx / tl
      const th = (i / n) * 2 * Math.PI
      const r = radius(t)
      out.push({ x: c.x + nx * r * Math.cos(th), y: r * Math.sin(th), z: c.z + nz * r * Math.cos(th) })
    }
  })
  return out
}

const level: (p: V3) => { u: number; z: number; w: number } = (p) => ({ u: p.x, z: p.z, w: p.y })

test('centre line: a straight cone is straight, level, and tapers as built', () => {
  const rounds = new Array(16).fill(24)
  const ctrl = tubeStrand((t) => ({ x: 60 * t, y: 0, z: 0 }), (t) => 10 - 5 * t, rounds)
  const cl = fitCentreLine(ctrl, rounds, { x: -20, y: 0, z: 0 })!
  assert.ok(cl.pts[0]!.x < cl.pts[cl.pts.length - 1]!.x, 'base is the end nearest the parent')
  const sh = centreLineShape(cl, level, 0)
  near(sh.sagitta, 0, 0.01, 'sagitta'); near(sh.bendDeg, 0, 1, 'bend'); near(sh.elevationDeg, 0, 1, 'elevation')
  // Thickness as seen = 2 r: r(0.85) / r(0.15) of the worked radius, give or
  // take the window's partial round.
  // Rule-calib 1027: read at the ends (5% / 95%), as the photo read the bar's horn.
  near(sh.taper, (10 - 5 * 0.95) / (10 - 5 * 0.05), 0.06, 'taper')
})

test('centre line: a quarter-circle tube has its known sagitta, bend and rise', () => {
  const rounds = new Array(40).fill(18)
  const R = 50
  const path = (t: number): V3 => { const f = t * Math.PI / 2; return { x: R * Math.sin(f), y: 0, z: R * (1 - Math.cos(f)) } }
  const ctrl = tubeStrand(path, () => 4, rounds)
  const cl = fitCentreLine(ctrl, rounds, { x: -10, y: 0, z: 0 })!
  const sh = centreLineShape(cl, level, 0)
  near(sh.sagitta, (1 - Math.cos(Math.PI / 4)) / (2 * Math.sin(Math.PI / 4)), 0.02, 'sagitta / chord') // 0.207
  near(sh.bendDeg, 45, 4, 'bend (base half to tip half)')
  near(sh.elevationDeg, 45, 2, 'chord rise')
  near(sh.arcMm, R * Math.PI / 2 + 4, 4, 'arc length to the tip surface')
  near(sh.taper, 1, 0.05, 'a parallel tube does not taper')
})

/** An ear seen from the front: a rim ring (front face, w = 0) round an
 *  opening whose floor is recessed (w = -depth), the opening off centre by dx. */
function earCloud(outer: number, inner: number, dx: number, depth: number): { u: number; z: number; w: number }[] {
  const pts: { u: number; z: number; w: number }[] = []
  // Rows of yarn (a raster scan), one strand each so the splats join.
  for (let z = -outer; z <= outer; z += 0.5) {
    for (let u = -outer; u <= outer; u += 0.5) {
      if (u * u + z * z > outer * outer) continue
      const inHole = (u - dx) ** 2 + z * z < inner * inner
      pts.push({ u, z, w: inHole ? -depth : 0 })
    }
  }
  return pts
}

test('ear rim: an even cup reads ~1, an off-centre fold reads 2-4', () => {
  const even = earRimRatio(earCloud(20, 10, 0, 8), 0.5, 0.5)!
  assert.ok(even && even.ratio < 1.3, `even rim ${even?.ratio}`)
  const folded = earRimRatio(earCloud(20, 10, 5, 8), 0.5, 0.5)!
  assert.ok(folded.ratio >= 1.8 && folded.ratio <= 4, `off-centre rim ${folded.ratio}`)
  // A flat ear (no recess) shows no opening.
  assert.equal(earRimRatio(earCloud(20, 10, 0, 0), 0.5, 0.5), null)
})

/** A ball of strand points (latitude rings), centre c, radius r. */
function ball(c: V3, r: number, rings = 24, per = 36): V3[] {
  const out: V3[] = []
  for (let k = 1; k < rings; k++) {
    const ph = (k / rings) * Math.PI
    for (let i = 0; i < per; i++) {
      const th = (i / per) * 2 * Math.PI
      out.push({ x: c.x + r * Math.sin(ph) * Math.cos(th), y: c.y + r * Math.sin(ph) * Math.sin(th), z: c.z + r * Math.cos(ph) })
    }
  }
  return out
}

function placed(name: string, ctrl: V3[], on = 'ground', rounds = [6, 12, 18, 12, 6], hex = '#885a4a'): PlacedPart {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const p of ctrl) { minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y); minz = Math.min(minz, p.z); maxz = Math.max(maxz, p.z) }
  return { part: { name, stitch: 'sc', rounds, colourHex: hex, place: { on } as never }, ctrl, bounds: { minx, maxx, miny, maxy, minz, maxz } }
}

function eyeProp(name: string, c: V3, r: number): CompiledComposition['props'][number] {
  return { name, centre: c, axes: [{ x: r, y: 0, z: 0 }, { x: 0, y: 0, z: r }, { x: 0, y: r, z: 0 }], hex: '#080706', gloss: 0.85 }
}

function synthToy(opts: { eyeDx?: number; eyeTiltZ?: number; earShift?: number } = {}): { p: CompositionProgram; c: CompiledComposition } {
  const yr = 0.5
  const head = placed('head', ball({ x: 0, y: 0, z: 150 }, 50))
  const body = placed('body', ball({ x: 0, y: 0, z: 50 }, 50))
  const earL = placed('ear-l', ball({ x: -62, y: 0, z: 165 }, 14), 'head')
  const earR = placed('ear-r', ball({ x: 62 + (opts.earShift ?? 0), y: 0, z: 165 }, 14), 'head')
  const dx = opts.eyeDx ?? 30
  const tz = opts.eyeTiltZ ?? 0
  const props = [eyeProp('eye-l', { x: -dx, y: 48, z: 145 - tz }, 6), eyeProp('eye-r', { x: dx, y: 48, z: 145 + tz }, 6)]
  const parts = [body, head, earL, earR]
  return {
    p: { name: 'synth', parts: parts.map((x) => x.part), cute: { family: 'biped-animal' } },
    c: { placed: parts, props, embroidery: [], hair: [], yr, problems: [], geometryHash: 'x' },
  }
}

test('measurer on a synthetic toy: eye spacing, size, height, tilt, head share, asymmetry', () => {
  const { p, c } = synthToy()
  const m = measureCute(p, c)
  assert.equal(m.family, 'biped-animal')
  const W = 100 + 2 * 0.5
  near(m.W, W, 0.2, 'head width = ball diameter + a yarn')
  near(m.values.eyeSpacing!, 60 / W, 0.005, 'eye spacing')
  near(m.values.eyeSize!, 12 / W, 0.005, 'eye size')
  const top = 150 + 50 * Math.cos(Math.PI / 24) + 0.5
  near(m.values.eyeHeightFromChin!, (145 - (top - m.H)) / m.H, 0.005, 'eye height above the chin')
  near(m.values.headHeightShare!, m.H / m.T, 1e-3, 'head share')
  near(m.values.headTiltDeg!, 0, 1e-6, 'level eyes')
  assert.equal(m.values.asymmetryCues, 0, 'a mirrored toy has no asymmetry')
  assert.equal(m.source.eyeSpacing, 'geometry')
  assert.equal(m.source.eyeFaceDeltaL, 'proxy')
  const t = measureCute(synthToy({ eyeTiltZ: 3 }).p, synthToy({ eyeTiltZ: 3 }).c)
  near(t.values.headTiltDeg!, (Math.atan2(6, 60) * 180) / Math.PI, 0.01, 'tilted eye line')
  assert.equal(t.values.asymmetryCues, 1, 'a 5.7 deg head tilt is one cue')
  const s = synthToy({ earShift: 15 })
  assert.equal(measureCute(s.p, s.c).values.asymmetryCues, 1, 'one ear set further out is one cue')
})

test('family from the pieces', () => {
  const fam = (names: string[]): string | null => inferToyFamily({ name: 'x', parts: names.map((n) => ({ name: n, stitch: 'sc', rounds: [6], colourHex: '#fff', place: { on: 'ground' } })) }).family
  assert.equal(fam(['body', 'head', 'horn-l', 'horn-r']), 'quadruped-seated')
  assert.equal(fam(['body', 'head', 'front-leg-l', 'back-leg-l']), 'quadruped-seated')
  assert.equal(fam(['body', 'head', 'arm-l', 'arm-r']), 'biped-animal')
  assert.equal(fam(['leg-l', 'body', 'head', 'hair-cap']), 'doll')
  assert.equal(fam(['body']), null)
  // A doll stands on her legs: the body is stacked on one.
  const bare = inferToyFamily({ name: 'x', parts: [
    { name: 'leg-l', stitch: 'sc', rounds: [6], colourHex: '#fff', place: { on: 'ground' } },
    { name: 'body', stitch: 'sc', rounds: [6], colourHex: '#fff', place: { on: 'leg-l', overlap: 0 } },
    { name: 'head', stitch: 'sc', rounds: [6], colourHex: '#fff', place: { on: 'body', overlap: 0 } },
    { name: 'arm-l', stitch: 'sc', rounds: [6], colourHex: '#fff', place: { on: 'body', dir: { x: -1, y: 0, z: 0 } } },
  ] })
  assert.equal(bare.family, 'doll')
  assert.equal(fam(['body', 'head']), null)
})

/** Our r1 cow's photo numbers as a measurement (the colour rules without a
 *  hex range as proxies; the muzzle's warmth and lightness are photo reads
 *  here, so they are checked against the photo ranges). */
function r1Measurement(): CuteMeasurement {
  const source: CuteMeasurement['source'] = {}
  for (const q of Object.keys(OURS_COW_1025R1.values) as CuteQuantity[]) {
    source[q] = ['eyeFaceDeltaL', 'muzzleFaceDeltaL', 'blushDeltaA'].includes(q) ? 'proxy' : 'geometry'
  }
  return { family: 'quadruped-seated', familyFrom: 'program', features: OURS_COW_1025R1.features, featuresDeclared: [], values: { ...OURS_COW_1025R1.values }, source, absent: {}, W: 1, H: 1, T: 1, notes: [] }
}

test('the check: the r1 photo numbers fail the 23 rules step 1 pinned (and 5 of rule-calib 1027\'s), in plain words', () => {
  const rep = cuteCheck(r1Measurement())
  const fails = rep.results.filter((r) => !r.pass).map((r) => r.n).sort((a, b) => a - b)
  // 38 (tip 0.18 H under the crown), 40 (a one-yarn rim), 41 (a white muzzle); 39 passes (base 0.126 W).
  assert.deepEqual(fails, [2, 3, 5, 7, 8, 9, 13, 14, 15, 18, 19, 20, 21, 24, 25, 26, 27, 28, 31, 33, 34, 36, 37, 38, 40, 41, 42, 43])
  const eyes = rep.results.find((r) => r.id === 'eyes-wide-apart')!
  assert.equal(eyes.line, 'eyes too close: 0.47 of the head width, want 0.55-0.70')
  assert.equal(eyes.strictness, 'hard')
  // Hard first in the failure list.
  assert.match(rep.failures[0]!, /\(rule \d+, hard/)
  assert.equal(rep.blocking.length, 0, 'no gate, nothing blocks')
  assert.match(rep.summary, /^quadruped-seated: 10 \/ 38 pass; hard fails 5, 13, 21, 24/)
  // Every rule ranged for the family is reported: measured, not measured, or
  // for another feature type (engine-rules 1107: the cow has no fleece, one
  // eye or prick ears).
  const ranged = CUTE_RULES.filter((r) => r.ranges['quadruped-seated']).length
  assert.equal(rep.results.length + rep.notMeasured.length + rep.notApplicable.length, ranged)
  assert.ok(rep.notApplicable.some((x) => x.id === 'pointed-ears-on-top' && /upright-pointed/.test(x.why)))
})

test('the gate blocks hard and firm geometry failures; soft and colour proxies only warn', () => {
  const rep = cuteCheck(r1Measurement(), true)
  const blockedRules = rep.blocking.map((l) => Number(/rule (\d+)/.exec(l)![1])).sort((a, b) => a - b)
  for (const n of blockedRules) {
    const r = rep.results.find((x) => x.n === n)!
    assert.notEqual(r.strictness, 'soft', `rule ${n} is soft`)
    assert.notEqual(r.source, 'proxy', `rule ${n} is a colour proxy`)
  }
  // 9, 14, 15, 31, 41 (soft) and nothing else of the 28 are left out.
  assert.deepEqual(blockedRules, [2, 3, 5, 7, 8, 13, 18, 19, 20, 21, 24, 25, 26, 27, 28, 33, 34, 36, 37, 38, 40, 42, 43])
  assert.ok(rep.blocking.every((l) => l.startsWith('cute: ')))
})

test('the report never throws', () => {
  const rep = cuteReportFor({ name: 'x', parts: [{ name: 'head', stitch: 'sc', rounds: [6], colourHex: '#fff', place: { on: 'ground' } }], cute: { family: 'doll', gate: true } }, { placed: [{ part: { name: 'head' } }] } as unknown as CompiledComposition)
  assert.ok(rep.error, 'an error is reported')
  assert.equal(rep.blocking.length, 1, 'and blocks only with the gate on')
  const off = cuteReportFor({ name: 'x', parts: [] }, { placed: [] } as unknown as CompiledComposition)
  assert.equal(off.family, null)
  assert.equal(off.blocking.length, 0)
})

test('wiring: every compile carries the report; the gate adds problems; the hash never moves', () => {
  const program = (gate: boolean): CompositionProgram => ({
    name: 'cute-wiring',
    yarnWeight: 'worsted',
    parts: [
      { name: 'body', stitch: 'sc', rounds: sphereRounds(18, 1), colourHex: '#885a4a', place: { on: 'ground' } },
      { name: 'head', stitch: 'sc', rounds: sphereRounds(12, 1), colourHex: '#885a4a', place: { on: 'body', overlap: 3 } },
      { name: 'arm-l', stitch: 'sc', rounds: tubeRounds(12, 2), colourHex: '#885a4a', place: { on: 'body', dir: { x: -1, y: 0.3, z: 0 }, seat: 2, poleIn: true, surfaceFit: 'ellipsoid' } },
      { name: 'arm-r', stitch: 'sc', rounds: tubeRounds(12, 2), colourHex: '#885a4a', place: { on: 'body', dir: { x: 1, y: 0.3, z: 0 }, seat: 2, poleIn: true, surfaceFit: 'ellipsoid' } },
    ],
    props: [-1, 1].map((s) => ({ name: s < 0 ? 'eye-l' : 'eye-r', on: 'head', dir: { x: s * 0.25, y: 1, z: 0.1 }, radiusMm: 3, colourHex: '#080706' })),
    ...(gate ? { cute: { gate: true } } : {}),
  })
  const off = compileComposition(program(false))
  assert.deepEqual(off.problems, [], 'report only: no problems')
  assert.ok(off.cute && off.cute.family === 'biped-animal', 'the report is attached')
  assert.ok(off.cute.results.length > 5)
  const on = compileComposition(program(true))
  assert.equal(on.geometryHash, off.geometryHash, 'the gate moves no geometry')
  assert.ok(on.problems.length > 0 && on.problems.every((x) => x.startsWith('cute: ')), on.problems.join(' | '))
  assert.deepEqual(on.problems, on.cute!.blocking)
  // The eyes are close on this blob (0.25 out): the hard rule says so.
  assert.ok(on.problems.some((x) => x.includes('eyes too close')), on.problems.join(' | '))
})

// ── engine-rules 1107: the face, eyes by count, fleece, limbs, the blob ──

/** An eye set on the head ball (centre z 150, r 50) at bearing `deg` off the
 *  lens, its outward axis along the surface normal. */
function eyeAt(name: string, deg: number, side: -1 | 1, r = 6): CompiledComposition['props'][number] {
  const t = (deg * Math.PI) / 180
  const n = { x: side * Math.sin(t), y: Math.cos(t), z: 0 }
  const a: V3 = { x: n.y * r, y: -n.x * r, z: 0 }
  return { name, centre: { x: 48 * n.x, y: 48 * n.y, z: 145 }, axes: [a, { x: 0, y: 0, z: r }, { x: n.x * r, y: n.y * r, z: 0 }], hex: '#080706', gloss: 0.85 }
}

test('engine-rules 1107: eyes face the lens; one, two or many eyes', () => {
  const { p, c } = synthToy()
  const at = (deg: number): number => measureCute(p, { ...c, props: [eyeAt('eye-l', deg, -1), eyeAt('eye-r', deg, 1)] }).values.eyeAxisDeg!
  near(at(30), 30, 0.5, 'eyes 30 deg round the head')
  near(at(55), 55, 0.5, 'eyes 55 deg round the head')
  const side = cuteCheck(measureCute(p, { ...c, props: [eyeAt('eye-l', 55, -1), eyeAt('eye-r', 55, 1)] }))
  assert.ok(side.failures.some((l) => /eyes round the sides of the head/.test(l)), side.failures.join(' | '))
  // One eye: no spacing, the one-eye rule instead.
  const one = measureCute(p, { ...c, props: [{ ...eyeAt('eye-c', 0, 1, 9), centre: { x: 1, y: 48, z: 150 } }] })
  assert.equal(one.features.eyeCount, 1)
  assert.equal(one.values.eyeSpacing, undefined)
  near(one.values.eyeOffCentre!, 1 / one.W, 1e-3, 'one eye just off centre')
  const oneRep = cuteCheck(one)
  assert.ok(oneRep.results.some((x) => x.id === 'one-eye-centred' && x.pass && x.provisional))
  assert.ok(oneRep.notApplicable.some((x) => x.id === 'eyes-wide-apart'))
  // Many eyes: the spread across the face.
  const many = measureCute(p, { ...c, props: [-30, -10, 10, 30].map((d, i) => eyeAt(`eye-${i + 1}`, Math.abs(d), d < 0 ? -1 : 1, 4)) })
  assert.equal(many.features.eyeCount, 4)
  near(many.values.eyeSpread!, (2 * 48 * Math.sin(Math.PI / 6)) / many.W, 0.005, 'outer eyes apart')
})

test('engine-rules 1107: W is the face fabric, not the fleece; the fleece is read for loop size and packing', () => {
  const { p, c } = synthToy()
  const head = c.placed.find((x) => x.part.name === 'head')!
  // Loop-stitch loops standing 12 mm off the head's sides: loose yarn runs.
  const ctrl: V3[] = []
  const loose: boolean[] = []
  head.ctrl.forEach((v, i) => {
    ctrl.push(v); loose.push(false)
    if (i % 12 === 0 && Math.abs(v.x) > 30) {
      const l = Math.hypot(v.x, v.y, v.z - 150) || 1
      for (let k = 1; k <= 5; k++) { const f = 1 + (k <= 3 ? k : 6 - k) * 0.06; ctrl.push({ x: v.x * f, y: v.y * f + k * 0.4, z: 150 + (v.z - 150) * f }); loose.push(true) }
      void l
    }
  })
  const fleecy: PlacedPart = { ...placed('head', ctrl), part: { ...head.part, fleece: { rounds: [1, 2, 3], loop: {} } }, built: { strandPath: ctrl.map((_, i) => i), model: { loose } } as never }
  const placedAll = c.placed.map((x) => (x === head ? fleecy : x))
  const m = measureCute({ ...p, parts: placedAll.map((x) => x.part) }, { ...c, placed: placedAll })
  near(m.W, 101, 0.3, 'W off the head fabric, the loops left out')
  assert.ok(m.notes.some((n) => /W read off the head's fabric/.test(n)))
  assert.ok(m.features.coat?.includes('fleece'))
  assert.ok(m.values.fleeceLoopSize! > 0 && m.values.fleeceLoopSize! < 0.2, `loop size ${m.values.fleeceLoopSize}`)
  assert.ok(m.values.fleecePacking! > 0, 'packing read')
  // The eyes are still 60 mm apart over a 101 mm face, not a 125 mm fleece.
  near(m.values.eyeSpacing!, 60 / 101, 0.005, 'eye spacing over the face')
})

test('engine-rules 1107: front legs that reach the table vs short balls; a face on a body is a blob', () => {
  const yr = 0.5
  const head = placed('head', ball({ x: 0, y: 0, z: 150 }, 50))
  const body = placed('body', ball({ x: 0, y: -20, z: 50 }, 50))
  const rounds = new Array(14).fill(18)
  const legPath = (x: number, z0: number) => (t: number): V3 => ({ x, y: 45, z: z0 - z0 * t + 12 })
  const long = (x: number, n: string): PlacedPart => placed(n, tubeStrand(legPath(x, 92), () => 12, rounds), 'body', rounds)
  const stub = (x: number, n: string): PlacedPart => placed(n, tubeStrand(legPath(x, 20), () => 14, rounds), 'body', rounds)
  const run = (legs: PlacedPart[]): CuteMeasurement => {
    const parts = [body, head, ...legs, placed('back-leg-l', ball({ x: -60, y: 0, z: 20 }, 20)), placed('back-leg-r', ball({ x: 60, y: 0, z: 20 }, 20))]
    return measureCute({ name: 's', parts: parts.map((x) => x.part), cute: { family: 'quadruped-seated' } }, { placed: parts, props: [eyeAt('eye-l', 30, -1), eyeAt('eye-r', 30, 1)], embroidery: [], hair: [], yr, problems: [], geometryHash: 'x' })
  }
  const tall = run([long(-22, 'front-leg-l'), long(22, 'front-leg-r')])
  const balls = run([stub(-22, 'front-leg-l'), stub(22, 'front-leg-r')])
  assert.ok(tall.values.limbReach! > 0.85, `tall reach ${tall.values.limbReach}`)
  assert.ok(tall.values.limbAspect! > 3, `tall aspect ${tall.values.limbAspect}`)
  assert.ok(balls.values.limbReach! < 0.5, `ball reach ${balls.values.limbReach}`)
  assert.ok(balls.values.limbAspect! < 1.6, `ball aspect ${balls.values.limbAspect}`)
  const rep = cuteCheck(balls)
  for (const id of ['limbs-long', 'limbs-not-balls', 'legs-reach-the-table']) assert.ok(rep.results.some((x) => x.id === id && !x.pass), id)
  // A ball with a face and no head: the blob family, its body the face.
  const blob = placed('body', ball({ x: 0, y: 0, z: 50 }, 50))
  const bp: CompositionProgram = { name: 'b', parts: [blob.part], props: [{ name: 'eye-l', on: 'body', dir: { x: -0.3, y: 1, z: 0 }, radiusMm: 4, colourHex: '#000' }, { name: 'eye-r', on: 'body', dir: { x: 0.3, y: 1, z: 0 }, radiusMm: 4, colourHex: '#000' }] }
  assert.equal(inferToyFamily(bp).family, 'blob')
  const bm = measureCute(bp, { placed: [blob], props: [{ ...eyeAt('eye-l', 30, -1), centre: { x: -24, y: 42, z: 55 } }, { ...eyeAt('eye-r', 30, 1), centre: { x: 24, y: 42, z: 55 } }], embroidery: [], hair: [], yr, problems: [], geometryHash: 'x' })
  near(bm.W, 101, 0.3, 'the blob is its own face')
  const br = cuteCheck(bm, true)
  assert.ok(br.results.length > 4 && br.results.every((x) => x.provisional), 'every blob range is provisional')
  assert.deepEqual(br.blocking, [], 'a provisional range never blocks')
})
