/**
 * HAIR — the loop-stitch FRINGE PATCH sewn onto an amigurumi head (§8j).
 *
 * How a maker builds it (and so how it is built here): a small separate circle,
 * worked in rounds from a magic ring exactly like the top of a head, with the
 * loop-stitch rounds worked with the INSIDE of the circle facing you, so every
 * loop stands out on the outside. The circle is then sewn to the crown of the
 * head, its worked face against the head, and the loops fall over the forehead
 * and round the face — the Highland cow's curly fringe.
 *
 * Built with the round builder (`buildRounds`, the same magic ring and +6
 * spiral the flat circle uses) with the loop stitch in its later rounds;
 * relaxed and AUDITED on its own like every crocheted part, with gravity on the
 * loose loops (pointing wherever world-down is for that spot on the head) and
 * the head itself as a one-sided surface the loops cannot pass into. It is then
 * conformed onto the settled head the way a sewn-on patch takes the shape of
 * what it is sewn to: each point keeps its distance from the patch centre along
 * the surface and its height off the head.
 */

import { buildRounds, roundStitchAngle } from './shaping'
import { relax } from './relax'
import { auditProblems } from './auditChecks'
import type { BuiltContinuous } from './yarnPath'
import { STITCHES, type CoilShape, type LoopShape, type StitchId } from './dictionary'
import { coilProblems } from './loopStitch'
import type { V3 } from '../yarnLoop'

export const HAIR_STYLE_IDS = ['none', 'fringe', 'curly-fringe'] as const
export type HairStyle = (typeof HAIR_STYLE_IDS)[number]

export const HAIR_STYLES: Array<{ id: HairStyle; label: string; blurb: string }> = [
  { id: 'none', label: 'None', blurb: 'No hair.' },
  { id: 'fringe', label: 'Loop fringe', blurb: 'A sewn-on circle of loop stitch on the crown: soft open loops over the forehead.' },
  { id: 'curly-fringe', label: 'Curly fringe', blurb: 'The same circle with every loop twisted before the stitch is closed, so it springs into a curl: the Highland cow fringe.' },
]

export interface HairPatch {
  name: string
  /** The part it is sewn to (listed before the hair is placed). */
  on: string
  /** Direction from the host's centre to the patch centre (world, need not be unit). */
  dir: { x: number; y: number; z: number }
  /** The loop stitch worked in the loop rounds. */
  stitch: Extract<StitchId, 'loopst' | 'loopcurl'>
  /** Stitches per round, from the magic ring: 6, 12, 18 … (+6 each round). */
  rounds: number[]
  /** Rounds from this index on are loop-stitch rounds (0-based; 0 = loop
   *  stitches straight into the magic ring, clamped round the ring strand). */
  firstLoopRound: number
  /** Instead of "every round from `firstLoopRound`": exactly these rounds
   *  (0-based) are loop-stitch rounds, the others plain dc — loops on every
   *  OTHER round is how a maker keeps a long-looped fringe from matting, and
   *  it is what lets each ring lie open on the one below. */
  loopRounds?: number[]
  /** Overrides of the dictionary loop shape for this patch. */
  loop?: Partial<LoopShape>
  /** Further overrides per round (0-based): the Highland cow's tuft is
   *  STACKED — the loops nearest the ring are worked over two fingers and
   *  stand tallest, the edge loops over one, so the tuft mounds up in the
   *  middle instead of lying as one flat layer. */
  loopByRound?: (k: number) => Partial<LoopShape> | undefined
  /** A plain dc every Nth stitch of a loop round (3 = loops in two of every
   *  three stitches): the bar cow's rings are not wall to wall, and the gap
   *  lets each ring fall its own way. Absent / 0 = a loop in every stitch. */
  plainEvery?: number
  /** The inverse: a loop in only every Nth stitch of a loop round, plain dc
   *  in the rest (cow-fable-1024: the bar's rings stand apart with the head
   *  showing between; `plainEvery` 4 is still loops in three of four).
   *  Absent / 0 = every stitch a loop (save `plainEvery`). */
  loopEvery?: number
  /** `loopEvery` per round (0-based), over `loopEvery` where it answers
   *  (cow-fable-1024g: the patch's EDGE round carries a loop in every third
   *  stitch so the sewn edge is covered with rings and no plain brim shows
   *  under the heap, the inner rounds keep their spacing). Absent, or
   *  undefined for a round, = `loopEvery` as before. */
  loopEveryByRound?: (k: number) => number | undefined
  /** Every Nth loop (counted along the round) is a twisted loop — worked as
   *  `loopcurl` with `curlLoop` — so a few tighter curls sit among the open
   *  rings. Absent / 0 = every loop the patch's `stitch`. */
  curlEvery?: number
  /** The twisted loop's shape overrides (merged over `loop`/`loopByRound`). */
  curlLoop?: Partial<LoopShape>
  /** Gravity on the loose loops per relax iteration, in yarn radii (default
   *  HAIR_GRAVITY). A big chenille ring is springy and holds itself open, so
   *  a long-looped tuft wants less than the small-looped default. */
  gravity?: number
  /** The loose loops' rendered strand radius, in yarn radii (default 0.62,
   *  the plied bundle every stitch is drawn at). A loop of chenille that is
   *  not pulled tight into a stitch plumps up to its full pile, so the cow's
   *  curls are drawn fatter than the fabric they stand on. */
  strandYr?: number
  /** FACE THE LENS (cow-fable-1024e): a WORLD direction every loop's plane is
   *  turned to face (its normal, ±`faceJitterDeg` of tilt, default 15), in
   *  place of the `droopDeg` lean and the yaw spread. A chenille ring worked
   *  on a flat circle and sewn to the crown holds its plane, and the bar
   *  cow's rings show their holes to the camera as round open spirals; the
   *  leaned loops read as arches and worms seen side-on. Absent = unchanged. */
  faceDir?: { x: number; y: number; z: number }
  faceJitterDeg?: number
  /** Only these loop rounds (0-based) face `faceDir`; the others lean by
   *  `droopDeg` as an unfaced patch does (cow-fable-1024g: the EDGE round's
   *  rings lean out over the sewn rim and cover it, where faced they stood
   *  up off it and left the rim bare). Absent = every loop round faces. */
  faceRounds?: number[]
  /** COILED CURLS (cow-build-1025; loopStitch.ts `emitCoil`): every loop of
   *  the patch twisted until it springs back into its own tight corkscrew
   *  (LoopShape.coil), instead of an open loop. The coil's turns lie in the
   *  plane the loop would have had (`droopDeg`, or `faceDir` on the faced
   *  rounds), so a faced coil shows the lens a little curled ring. Checked
   *  at build: no two coils linked or touching (`coilProblems`), after the
   *  coils that sit too close are eased apart the way a maker fluffs them
   *  (`easeCoilsApart`). Absent = open loops, every hash unchanged. */
  coil?: CoilShape
  /** Per-round overrides of `coil` (0-based; merged over it). */
  coilByRound?: (k: number) => Partial<CoilShape> | undefined
  /** The coils' clearance, centre-line to centre-line between two curls, in
   *  yarn radii (default two drawn strand radii, 2 x `strandYr`). */
  coilClearYr?: number
  colourHex: string
}

export interface PlacedHair {
  name: string
  hex: string
  /** Rendered strand radius in yarn radii (see HairPatch.strandYr). */
  strandYr?: number
  /** The relaxed, conformed strand centre-line (world mm). */
  ctrl: V3[]
  built: BuiltContinuous
}

/** Is round k (0-based) of the patch a loop-stitch round? */
export function isLoopRound(h: HairPatch, k: number): boolean {
  return h.loopRounds ? h.loopRounds.includes(k) : k >= h.firstLoopRound
}

/** The loop-every rule for round k: the per-round one where it answers, else the patch's. */
export function loopEveryAt(h: HairPatch, k: number): number | undefined {
  return h.loopEveryByRound?.(k) ?? h.loopEvery
}

/** The stitch worked at stitch c (0-based) of round k: the plain dc every
 *  `plainEvery`th stitch, the twisted loop every `curlEvery`th loop, else the
 *  patch's loop stitch — the one rule the build and the words both read. */
export function stitchAtOf(h: HairPatch, k: number, c: number): StitchId {
  if (!isLoopRound(h, k)) return 'sc'
  if (h.plainEvery && (c + 1) % h.plainEvery === 0) return 'sc'
  const every = loopEveryAt(h, k)
  if (every && (c + 1) % every !== 0) return 'sc'
  if (h.curlEvery) {
    // Count the loops (not the plain stitches) along the round.
    const loopsBefore = every ? Math.floor((c + 1) / every) - 1 : h.plainEvery ? c - Math.floor(c / h.plainEvery) : c
    if ((loopsBefore + 1) % h.curlEvery === 0) return 'loopcurl'
  }
  return h.stitch
}

/** Gravity on the loose loops, per relax iteration, in yarn radii. */
export const HAIR_GRAVITY = 0.0025

const unit = (d: { x: number; y: number; z: number }): V3 => {
  const l = Math.hypot(d.x, d.y, d.z) || 1
  return { x: d.x / l, y: d.y / l, z: d.z / l }
}
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z

/** The patch's frame on the host: u = outward at the patch centre, w = −u
 *  (the patch's worked face, +z locally, lies against the head), e1/e2 across. */
function patchFrame(dir: { x: number; y: number; z: number }): { u: V3; e1: V3; e2: V3; w: V3 } {
  const u = unit(dir)
  const w = { x: -u.x, y: -u.y, z: -u.z }
  let e1 = cross({ x: 0, y: 0, z: 1 }, u)
  if (Math.hypot(e1.x, e1.y, e1.z) < 1e-6) e1 = { x: 1, y: 0, z: 0 }
  e1 = unit(e1)
  const e2 = cross(w, e1) // right-handed (e1, e2, w): the local build frame
  return { u, e1, e2, w }
}

/** Build + relax one patch in its own frame (worked face +z, loops −z). */
export function buildHairPatch(h: HairPatch, yr: number): BuiltContinuous {
  // `loopEvery` alone is a per-stitch rule too (cow-fable-1024c r2: with no
  // twisted curls the build quietly put a loop in EVERY stitch of the loop
  // rounds, 96 rings for the 22 the words promised).
  const perStitch = !!(h.plainEvery || h.loopEvery || h.loopEveryByRound || h.curlEvery)
  const { e1, e2, w } = patchFrame(h.dir)
  // The faced direction in the patch frame, then per stitch in that stitch's
  // own fabric frame: the round builder lays stitch i of a round at
  // `roundStitchAngle` and maps its fabric x (along the row) to the tangent
  // and y to the radius there.
  const fp = h.faceDir ? { x: dot(h.faceDir, e1), y: dot(h.faceDir, e2), z: dot(h.faceDir, w) } : undefined
  const facePlaneAt = (k: number, c: number): Partial<LoopShape> | undefined => {
    if (!fp || (h.faceRounds && !h.faceRounds.includes(k))) return undefined
    const th = roundStitchAngle(h.rounds[k]!, c)
    const facePlane = { x: -fp.x * Math.sin(th) + fp.y * Math.cos(th), y: fp.x * Math.cos(th) + fp.y * Math.sin(th), z: fp.z }
    return { facePlane, ...(h.faceJitterDeg != null ? { faceJitterDeg: h.faceJitterDeg } : {}) }
  }
  const curlAt = (k: number, c: number): Partial<LoopShape> | undefined =>
    h.curlEvery && h.curlLoop && stitchAtOf(h, k, c) === 'loopcurl' ? h.curlLoop : undefined
  // The coiled curl (cow-build-1025), per round.
  const coilAt = (k: number): Partial<LoopShape> | undefined => (h.coil ? { coil: { ...h.coil, ...h.coilByRound?.(k) } } : undefined)
  const built = buildRounds('sc', h.rounds, yr, undefined, {
    roundStitch: (k) => (isLoopRound(h, k) ? h.stitch : 'sc'),
    loop: h.loop,
    loopByRound: h.loopByRound,
    ...(perStitch ? { stitchAt: (k: number, c: number) => stitchAtOf(h, k, c) } : {}),
    ...(h.coil
      ? { loopByStitch: (k: number, c: number) => ({ ...curlAt(k, c), ...facePlaneAt(k, c), ...coilAt(k) }) }
      : fp
        ? { loopByStitch: (k: number, c: number) => ({ ...curlAt(k, c), ...facePlaneAt(k, c) }) }
        : h.curlEvery && h.curlLoop
          ? { loopByStitch: (k: number, c: number) => curlAt(k, c) }
          : {}),
  })
  const g = yr * (h.gravity ?? HAIR_GRAVITY)
  // World down in the patch frame: toward the head (+z) on a crown patch, and
  // down the face along it — so the front loops fall over the forehead.
  const down: V3 = { x: 0, y: 0, z: -1 }
  const gravity = { x: dot(down, e1) * g, y: dot(down, e2) * g, z: dot(down, w) * g }
  // The HEAD as a one-sided surface for the loose loops: the patch's worked
  // face is sewn against it, so no loop may pass beyond that face.
  const m = built.model
  let face = -Infinity
  m.nodes.forEach((n, i) => {
    if (!m.loose?.[i] && n.z > face) face = n.z
  })
  m.zBand = m.nodes.map((n, i) => (m.loose?.[i] ? { hi: face } : m.zBand?.[i] ?? null))
  // Coils (cow-build-1025): fluffed apart as worked, before they settle, so
  // none starts inside another (the relax's collision then keeps them apart
  // and unlinked), and again after.
  if (h.coil) easeCoilsApart(built, coilClearMm(h, yr), face, 120)
  relax(m, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06,
    layoutMode: 'radial',
    gravity,
    iterations: 420,
  })
  if (h.coil) easeCoilsApart(built, coilClearMm(h, yr), face)
  return built
}

/** The coils' clearance in mm (HairPatch.coilClearYr). */
export function coilClearMm(h: HairPatch, yr: number): number {
  return yr * (h.coilClearYr ?? 2 * (h.strandYr ?? 0.62))
}

/** Each loop's loose body as its own polyline, in build order: the loose
 *  nodes come in one unbroken run per loop (loopStitch.ts `emitLoop`). */
export function loopBodies(built: BuiltContinuous): number[][] {
  const m = built.model
  const runs: number[][] = []
  let cur: number[] = []
  for (let i = 0; i < m.nodes.length; i++) {
    if (m.loose?.[i]) cur.push(i)
    else if (cur.length) {
      runs.push(cur)
      cur = []
    }
  }
  if (cur.length) runs.push(cur)
  return runs
}

/**
 * EASE THE COILS APART (cow-build-1025): where two settled coils come nearer
 * than the clearance, each is moved a little away from the other — the
 * whole coil, weighted from nothing at its root (sewn in) to all of it at
 * its tip, the way a maker fluffs two curls off each other with a finger.
 * Small steps (a fifth of the shortfall, at most a quarter of a yarn radius,
 * a round), so no strand is ever carried through another; the coil audit
 * (`coilProblems`) then measures what is left. Nothing past the sewn face.
 */
export function easeCoilsApart(built: BuiltContinuous, clearMm: number, faceZ: number, rounds = 60): void {
  const m = built.model
  const bodies = loopBodies(built)
  const step = built.yarnRadiusMm * 0.25
  const weight = bodies.map((b) => b.map((_, i) => {
    const t = (i + 1) / (b.length + 1)
    const u = 1 - Math.abs(2 * t - 1)
    return Math.min(1, u * 2.5)
  }))
  for (let r = 0; r < rounds; r++) {
    let moved = false
    for (let a = 0; a < bodies.length; a++) {
      for (let b = a + 1; b < bodies.length; b++) {
        let best = Infinity
        let pa = -1
        let pb = -1
        for (const i of bodies[a]!) for (const k of bodies[b]!) {
          const p = m.nodes[i]!
          const q = m.nodes[k]!
          const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2
          if (d < best) {
            best = d
            pa = i
            pb = k
          }
        }
        const d = Math.sqrt(best)
        // Eased to a touch past the clearance (3%), so the small steps
        // settle clear of it instead of creeping up to it.
        if (d >= clearMm * 1.03) continue
        const p = m.nodes[pa]!
        const q = m.nodes[pb]!
        const dx = (p.x - q.x) / (d || 1)
        const dy = (p.y - q.y) / (d || 1)
        const dz = (p.z - q.z) / (d || 1)
        const s = Math.min(step, (clearMm * 1.03 - d) * 0.25 + 1e-3)
        bodies[a]!.forEach((i, t) => {
          const n = m.nodes[i]!
          const w = weight[a]![t]! * s
          n.x += dx * w
          n.y += dy * w
          n.z = Math.min(faceZ, n.z + dz * w)
        })
        bodies[b]!.forEach((i, t) => {
          const n = m.nodes[i]!
          const w = weight[b]![t]! * s
          n.x -= dx * w
          n.y -= dy * w
          n.z = Math.min(faceZ, n.z - dz * w)
        })
        moved = true
      }
    }
    if (!moved) break
  }
}

/** The audit gate for a patch (in its own flat polar frame, before conforming). */
export function hairPatchProblems(h: HairPatch, built: BuiltContinuous, yr: number): string[] {
  const probs = auditProblems({ built, recipe: undefined as never }, h.name, 0, yr)
  // The coils' own check (cow-build-1025): no two linked, none touching.
  if (h.coil) {
    const curls = loopBodies(built).map((b) => b.map((i) => built.model.nodes[i]!))
    probs.push(...coilProblems(curls, coilClearMm(h, yr) * 0.999))
  }
  return probs.map((p) => `${h.name}: ${p}`)
}

/** The host bits the conforming needs: its settled bounds (an ellipsoid fit). */
export interface HairHost {
  bounds: { minx: number; maxx: number; miny: number; maxy: number; minz: number; maxz: number }
}

function ellipsoidRadius(b: HairHost['bounds'], u: V3): number {
  const ax = (b.maxx - b.minx) / 2
  const ay = (b.maxy - b.miny) / 2
  const az = (b.maxz - b.minz) / 2
  const q = (u.x / ax) ** 2 + (u.y / ay) ** 2 + (u.z / az) ** 2
  return 1 / Math.sqrt(Math.max(q, 1e-12))
}

/**
 * Conform a relaxed patch onto its host: every node keeps its distance from
 * the patch centre ALONG the head surface and its height off the worked face.
 */
export function conformHairPatch(h: HairPatch, built: BuiltContinuous, host: HairHost, yr: number): V3[] {
  const { u, e1, e2 } = patchFrame(h.dir)
  const b = host.bounds
  const C: V3 = { x: (b.minx + b.maxx) / 2, y: (b.miny + b.maxy) / 2, z: (b.minz + b.maxz) / 2 }
  const R0 = ellipsoidRadius(b, u)
  const m = built.model
  let face = -Infinity
  m.nodes.forEach((n, i) => {
    if (!m.loose?.[i] && n.z > face) face = n.z
  })
  // The worked face's centre-line rests one yarn diameter off the head's.
  const clear = yr * 1.6
  return built.strandPath.map((ni) => {
    const n = m.nodes[ni]!
    const rho = Math.hypot(n.x, n.y)
    const th = rho / R0
    const t = rho > 1e-9 ? unit({ x: e1.x * n.x + e2.x * n.y, y: e1.y * n.x + e2.y * n.y, z: e1.z * n.x + e2.z * n.y }) : e1
    const d = unit({
      x: u.x * Math.cos(th) + t.x * Math.sin(th),
      y: u.y * Math.cos(th) + t.y * Math.sin(th),
      z: u.z * Math.cos(th) + t.z * Math.sin(th),
    })
    const r = ellipsoidRadius(b, d) + clear + (face - n.z)
    return { x: C.x + d.x * r, y: C.y + d.y * r, z: C.z + d.z * r }
  })
}

/** Build, audit and place every hair patch. */
export function placeHair(
  patches: HairPatch[],
  hosts: Map<string, HairHost>,
  yr: number,
): { placed: PlacedHair[]; problems: string[] } {
  const placed: PlacedHair[] = []
  const problems: string[] = []
  for (const h of patches) {
    const host = hosts.get(h.on)
    if (!host) throw new Error(`hair '${h.name}' is sewn to unknown part '${h.on}'`)
    const built = buildHairPatch(h, yr)
    problems.push(...hairPatchProblems(h, built, yr))
    placed.push({ name: h.name, hex: h.colourHex, ...(h.strandYr ? { strandYr: h.strandYr } : {}), ctrl: conformHairPatch(h, built, host, yr), built })
  }
  return { placed, problems }
}

/** How far the curly loop is twisted, in a maker's words (from the same
 *  half-turn count the geometry is built with). */
function twistWords(h: HairPatch): string {
  const ht = h.loop?.twist ?? STITCHES[h.stitch].loop?.twist ?? 0
  if (ht <= 1) return 'give the loop half a twist on your finger'
  const turns = ht / 2
  return `twist the loop ${turns === 1 ? 'once' : `${turns} times`} on your finger`
}

/** UK-terms written instructions for the patch, from the same counts. */
export function writeHairInstructions(h: HairPatch, hostLabel = 'head', yarnRadiusMm?: number): string[] {
  const lines: string[] = []
  const twisted = h.stitch === 'loopcurl'
  // The coiled curl (cow-build-1025), from the same coil the geometry winds:
  // each leg of the loop is the coil's length, so the loop is pulled out that
  // long round a strip of card, twisted, and let spring back on itself.
  const coiled = (): string => {
    const cl = h.coil!
    const legMm = cl.turns * Math.hypot(2 * Math.PI * cl.radiusYr, cl.pitchYr) * (yarnRadiusMm ?? 0)
    const cm = Math.max(1, Math.round(legMm / 5) / 2)
    const turns = cl.turns >= 1.9 ? 'two turns' : cl.turns >= 1.6 ? 'nearly two turns' : cl.turns >= 1.4 ? 'a turn and a half' : 'about a turn'
    return (
      'Every loop in this circle is a COILED CURL: ' +
      (yarnRadiusMm ? `wrap the yarn round a strip of card ${cm} cm wide instead of your finger, so each loop is about ${cm} cm long, ` : 'make each loop long, ') +
      'and before you finish the stitch twist the loop round and round between finger and thumb until it kinks, then let it go: ' +
      `it springs back on itself into a tight corkscrew of ${turns}. Finish the stitch and settle each curl on its own, not hooked through its neighbour. `
    )
  }
  lines.push(
    `${h.name.charAt(0).toUpperCase() + h.name.slice(1)} (a separate circle, sewn on). ` +
      'Loop stitch (lp st): insert hook in next st, wrap the yarn from front to back round your forefinger held behind the work, ' +
      'catch the yarn behind your finger and pull it through the st (2 loops on hook), yrh and pull through both loops, then slip your finger out. ' +
      (twisted ? `For a curly loop, ${twistWords(h)} before you finish the stitch. ` : '') +
      (h.coil ? coiled() : '') +
      'The loop forms on the side facing away from you. Work every round with the same side facing you: ' +
      `that side is sewn against the ${hostLabel}, and the loops stand out on the other.`,
  )
  // The finger the loops are worked over, from the same loop length the
  // geometry is built with: a loop over two fingers is about half as long
  // again as one over one (the stacked tuft's crown loops).
  const baseLen = h.loop?.lengthYr ?? STITCHES[h.stitch].loop?.lengthYr ?? 3
  const fingers = (k: number): string => {
    // A coil's loop is measured on the card (above), not on fingers.
    if (h.coil) return ''
    const len = h.loopByRound?.(k)?.lengthYr ?? baseLen
    const base = baseLen >= 4.5 ? 2 : 1
    const n = len >= baseLen * 1.25 ? base + 1 : len <= baseLen * 0.95 && h.loopByRound?.(k) ? Math.max(1, base - 1) : base
    const word = ['one finger', 'two fingers', 'three fingers'][n - 1]!
    if (n === base && (k > 0 || base === 1)) return ''
    return n > base ? ` (wrap the yarn round ${word} for these taller loops)` : n < base ? ` (wrap the yarn round ${word} only, for shorter loops)` : ` (wrap the yarn round ${word})`
  }
  // Loops in two of every three stitches, a twist on every Nth loop: said
  // once, from the same rule the geometry is built with.
  const ordinal = (n: number): string => ({ 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth' }[n] ?? `${n}th`)
  if (h.plainEvery || h.loopEvery || h.loopEveryByRound || h.curlEvery) {
    let rule = 'In the loop-stitch rounds below'
    if (h.loopEvery) {
      rule += `, work a lp st in every ${ordinal(h.loopEvery)} stitch only and a plain dc in the rest (so one of every ${['', '', 'two', 'three', 'four', 'five', 'six'][h.loopEvery] ?? h.loopEvery} stitches carries a loop)`
    }
    if (h.loopEveryByRound) {
      // The rounds whose rule differs from the patch's, said by round number.
      const special = h.rounds.map((_, k) => k).filter((k) => isLoopRound(h, k) && h.loopEveryByRound!(k) != null && h.loopEveryByRound!(k) !== h.loopEvery)
      for (const k of special) rule += `${h.loopEvery ? ', except' : ','} in round ${k + 1} a lp st in every ${ordinal(h.loopEveryByRound!(k)!)} stitch`
    }
    if (h.plainEvery) {
      const n = h.plainEvery
      const share = n === 2 ? 'every other stitch carries a loop' : `${['', '', '', 'two', 'three', 'four', 'five', 'six', 'seven'][n] ?? n - 1} of every ${['', '', '', 'three', 'four', 'five', 'six', 'seven', 'eight'][n] ?? n} stitches carry a loop`
      rule += `, work a plain dc in place of every ${ordinal(n)} lp st (so ${share})`
    }
    if (h.curlEvery) {
      const ht = h.curlLoop?.twist ?? STITCHES.loopcurl.loop?.twist ?? 0
      const tw = ht <= 1 ? 'half a twist' : ht === 2 ? 'one full twist' : `${ht / 2} twists`
      rule += `${h.plainEvery || h.loopEvery ? ', and' : ','} give every ${ordinal(h.curlEvery)} loop ${tw} on your finger before you close the stitch, for a tighter curl among the open ones`
    }
    lines.push(rule + '.')
  }
  h.rounds.forEach((count, k) => {
    const lp = isLoopRound(h, k)
    if (k === 0) {
      lines.push(`Round 1: ${count} ${lp ? 'lp st' : 'dc'} into a magic ring${lp ? fingers(k) : ''}. (${count})`)
      return
    }
    const per = h.rounds[k - 1]! / 6
    const body = per === 1 ? (lp ? '2 lp st in each st' : '2 dc in each st') : lp ? `*${per - 1} lp st, 2 lp st in next st* 6 times` : `*${per - 1} dc, 2 dc in next st* 6 times`
    lines.push(
      `Round ${k + 1}: ${body}${lp ? fingers(k) : ''}. (${count})`,
    )
  })
  lines.push(
    `Fasten off, leaving a long tail. Sew the circle to the top of the ${hostLabel}, loops outward, with its front edge about one round above the eyes, ` +
      (h.coil
        ? 'then settle the curls with your fingers so each sits on its own, side by side, none hooked through another.'
        : 'then fluff the loops forward with your fingers so they fall over the forehead.'),
  )
  return lines
}

/**
 * The preset patch for a style: a three-round circle (6, 12, 18) with loop
 * stitch in rounds 2 and 3, sewn to the crown just above the face. `dir` is
 * where on the head (from its centre) the circle's centre goes.
 */
export function hairPatchesFor(
  style: HairStyle | undefined,
  on: string,
  colourHex: string,
  dir: { x: number; y: number; z: number },
): HairPatch[] {
  if (!style || style === 'none') return []
  const curly = style === 'curly-fringe'
  return [
    {
      name: 'fringe',
      on,
      dir,
      stitch: 'loopst',
      rounds: [6, 12, 18],
      // Curly: loops from the ring out, so the centre of the tuft is as full
      // as its edge. Plain: a dc round first, then loops.
      firstLoopRound: curly ? 0 : 1,
      // Curly: short loops worked over one finger close to the work, about as
      // wide as they are long, so each stands up off the head as a round curl
      // (a springy chenille loop holds itself open — the bar cow's fringe).
      // Plain: longer loops that fall forward over the forehead.
      loop: curly
        ? { lengthYr: 3.2, halfWidthYr: 1.25, droopDeg: 0, vary: 0.25 }
        : { lengthYr: 5, halfWidthYr: 1.4, droopDeg: -10, vary: 0.2 },
      colourHex,
    },
  ]
}
