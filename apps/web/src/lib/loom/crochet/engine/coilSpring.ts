/**
 * THE CURLS SPRING OPEN (curl-relax-1107): how a packed cap of coiled curls
 * (loopStitch.ts `emitCoil`, HairPatch.coil) or a curly fleece settles
 * without one curl threaded through its neighbour.
 *
 * The coils are WOUND at their full size, side by side, so where they are
 * packed closer than their own width they are emitted through each other:
 * measured on the cow's cap (a coil on every round, every third stitch), 19
 * of 70 pairs were already linked before the relax began, and no relax can
 * unlink two closed curves without passing one strand through another (the
 * linking number is a topological invariant; the collision that keeps yarn
 * apart is exactly what holds the link). Easing the coils apart afterwards
 * (hairPatch.ts `easeCoilsApart`) moves them, but never unthreads them.
 *
 * A maker does not get linked curls: each loop is twisted on the finger and
 * let go one at a time, and it springs open against the curls already
 * there. This does the same thing in the relax. Every coil starts as a
 * small SEED of itself: its body scaled about its own root (the two passes
 * through the work), small enough that no seed reaches its neighbour's, so
 * nothing starts linked. The yarn's own rest lengths (and the bending
 * distances, which remember the coil's set) are scaled the same way. Then,
 * stage by stage, the rest lengths grow back to the wound length while
 * collision acts, the fabric held still: each coil opens against its
 * neighbours and squashes where it meets them, the way packed curls do. The
 * linking number never changes along the way (the growth per iteration is a
 * fraction of the clearance), so a cap packed edge to edge comes out with
 * every pair unlinked. The rest lengths are restored exactly: the yarn is
 * the same length it was wound at, nothing is drawn.
 */

import { relax, type RelaxConfig, type YarnModel } from './relax'
import { closestApproach, linkingNumber } from './loopStitch'

type V = { x: number; y: number; z: number }

/** Relax iterations between two holds of the coils' set. */
const HOLD_EVERY = 5
/** The settle hold's longest step per iteration, in collision distances. */
const HOLD_MAX_STEP = 0.05

function centroidOf(ps: V[]): V {
  const c = { x: 0, y: 0, z: 0 }
  for (const p of ps) { c.x += p.x / ps.length; c.y += p.y / ps.length; c.z += p.z / ps.length }
  return c
}

export interface CoilSpringOptions {
  /** Centre-to-centre distance two yarns are kept apart by while they grow. */
  collMinDist: number
  /** The smallest a seed may be (a fraction of its wound size; default 0.12). */
  minSeed?: number
  /** Growth stages from the seed to the full size (default 14). */
  stages?: number
  /** Relax iterations per stage (default 30). */
  iterationsPerStage?: number
  /** Extra relax settings for the loose yarn while it grows (the head's
   *  one-sided surface is the model's own `zBand`; gravity, if any). */
  gravity?: RelaxConfig['gravity']
  /** A closed stuffed piece (a fleece worked into its rounds): while they
   *  grow, each coil's yarn stays at least as far from this centre as its
   *  root (minus half a strand), so no coil opens into the piece through the
   *  gaps between its stitches. Absent = the model's own bounds (`zBand`). */
  outsideOf?: V
  /** How hard each coil keeps its own wound SET while it grows (0 to 1, a
   *  pull per hold step toward its wound shape at the stage's scale, centred
   *  where the coil now is; default 0.15). The yarn's bending distances only
   *  remember the set locally, so a big coil (a rosette) grown from a seed
   *  without this comes back crumpled to two fifths of its size (measured:
   *  0.17 of the head's width wound, 0.069 sprung), and gravity folds it. The
   *  hold moves the coil as a whole, so collision still decides where it
   *  sits against its neighbours; 0 = off. */
  holdShape?: number
  /** Called after each growth stage (diagnostics; stage 0 = the seeds). */
  onStage?: (stage: number) => void
}

export interface CoilSpringReport {
  /** Each coil's seed scale (1 = it had room to start at full size). */
  seeds: number[]
  /** Each coil's wound set about its own centroid (for `holdCoilSets`). */
  sets: V[][]
}

/** Pull each coil toward its wound set at `scale` (1 = full size), placed on
 *  its own centroid now, by `k` (a translation only, so collision still
 *  decides where it sits). The settle after the spring keeps doing this, so
 *  the packed curls press into each other and stay round instead of
 *  crumpling to worms (curl-relax-1107, round 2: the r5 render). */
export function holdCoilSets(model: YarnModel, bodies: number[][], sets: V[][], k: number, scale: (b: number) => number = () => 1, ends = 0, maxStep = Infinity): void {
  const nodes = model.nodes
  bodies.forEach((b, bi) => {
    const c = centroidOf(b.map((i) => nodes[i]!))
    const s = scale(bi)
    b.forEach((i, j) => {
      const p = nodes[i]!
      const q = sets[bi]![j]!
      // Free near the stitch (`ends` nodes each side): the hold must not
      // drag the loop's legs, and the stitch with them, off the work.
      const kk = ends > 0 ? k * Math.min(1, Math.min(j, b.length - 1 - j) / ends) : k
      let dx = (c.x + q.x * s - p.x) * kk
      let dy = (c.y + q.y * s - p.y) * kk
      let dz = (c.z + q.z * s - p.z) * kk
      // No step longer than `maxStep`: a hold that jumps a strand further
      // than the collision can see in one iteration could carry it through
      // a neighbour (measured on a packed cap: 1 pair linked unclamped).
      const len = Math.hypot(dx, dy, dz)
      if (len > maxStep) { const f = maxStep / len; dx *= f; dy *= f; dz *= f }
      p.x += dx
      p.y += dy
      p.z += dz
    })
  })
}

/** Relax `model` with the coils' sets held on every iteration (by `k`, kept
 *  small so no hold step carries a strand through its neighbour), the
 *  `ends` nodes at each end of a coil left free (its legs, into the work). */
export function relaxHoldingSets(model: YarnModel, bodies: number[][], sets: V[][], k: number, cfg: RelaxConfig, ends = 6): void {
  if (k <= 0) { relax(model, cfg); return }
  relax(model, { ...cfg, eachIteration: () => holdCoilSets(model, bodies, sets, k, () => 1, ends, cfg.collMinDist * HOLD_MAX_STEP) })
}

/**
 * Spring every loose run (one coil or loop body each, in build order) open
 * from a seed. `bodies` are node indices into `model.nodes`; the strand node
 * before and after each run (its passes through the work) are its root.
 */
export function springCoils(model: YarnModel, bodies: number[][], opts: CoilSpringOptions): CoilSpringReport {
  const nodes = model.nodes
  const n = nodes.length
  const owner = new Int32Array(n).fill(-1)
  bodies.forEach((b, k) => { for (const i of b) owner[i] = k })
  // Each body's root: the midpoint of the passes either side of it.
  const root: V[] = bodies.map((b) => {
    const a = nodes[Math.max(0, b[0]! - 1)]!
    const z = nodes[Math.min(n - 1, b[b.length - 1]! + 1)]!
    return { x: (a.x + z.x) / 2, y: (a.y + z.y) / 2, z: (a.z + z.z) / 2 }
  })
  // Each body's reach from its root (the radius of the ball that holds it).
  const reach = bodies.map((b, k) => {
    let r = 0
    for (const i of b) r = Math.max(r, Math.hypot(nodes[i]!.x - root[k]!.x, nodes[i]!.y - root[k]!.y, nodes[i]!.z - root[k]!.z))
    return r
  })
  // The seed: the largest scale at which this body's ball stays clear of
  // every other body's ball (both at their seeds), so no two seeds overlap
  // and none can start linked. Solved pairwise and conservatively: each
  // body may take at most half the gap to any neighbour.
  const minSeed = opts.minSeed ?? 0.12
  const seeds = bodies.map((_, k) => {
    let s = 1
    for (let j = 0; j < bodies.length; j++) {
      if (j === k) continue
      const d = Math.hypot(root[k]!.x - root[j]!.x, root[k]!.y - root[j]!.y, root[k]!.z - root[j]!.z)
      if (d > reach[k]! + reach[j]! + opts.collMinDist) continue
      const room = Math.max(0, d - opts.collMinDist) / 2
      s = Math.min(s, room / Math.max(reach[k]!, 1e-9))
    }
    return Math.max(minSeed, Math.min(1, s))
  })
  // The wound set of each body, about its own centroid (the hold's target).
  const set = bodies.map((b) => {
    const c = centroidOf(b.map((i) => nodes[i]!))
    return b.map((i) => ({ x: nodes[i]!.x - c.x, y: nodes[i]!.y - c.y, z: nodes[i]!.z - c.z }))
  })
  if (seeds.every((s) => s >= 1)) return { seeds, sets: set }

  // The constraints the growth scales: any that touches a body's node (its
  // own segments, its bending distances, the joins to its passes).
  const scaled = (cs: YarnModel['dist']): Array<{ c: YarnModel['dist'][number]; rest: number; k: number }> =>
    cs.filter((c) => owner[c.a]! >= 0 || owner[c.b]! >= 0).map((c) => ({ c, rest: c.rest, k: Math.max(owner[c.a]!, owner[c.b]!) }))
  const grow = [...scaled(model.dist), ...scaled(model.bend)]
  const setScale = (sOf: (k: number) => number): void => { for (const g of grow) g.c.rest = g.rest * sOf(g.k) }

  // Seed: each body scaled about its root.
  bodies.forEach((b, k) => {
    const s = seeds[k]!
    if (s >= 1) return
    const R = root[k]!
    for (const i of b) {
      const p = nodes[i]!
      p.x = R.x + (p.x - R.x) * s
      p.y = R.y + (p.y - R.y) * s
      p.z = R.z + (p.z - R.z) * s
    }
  })
  // Check the seeds: any two that still link or press into each other (a
  // seed held at `minSeed` on a root crowded by its neighbours) are shrunk
  // again, by half, until they do not (or are an eighth of a percent of
  // their size: then their roots themselves are that close).
  for (let pass = 0; pass < 8; pass++) {
    const bad = new Set<number>()
    for (let a = 0; a < bodies.length; a++) {
      for (let b = a + 1; b < bodies.length; b++) {
        const d = Math.hypot(root[a]!.x - root[b]!.x, root[a]!.y - root[b]!.y, root[a]!.z - root[b]!.z)
        if (d > (reach[a]! * seeds[a]! + reach[b]! * seeds[b]!) + opts.collMinDist) continue
        const A = bodies[a]!.map((i) => nodes[i]!)
        const B = bodies[b]!.map((i) => nodes[i]!)
        // Linked, or already pressed into each other (the collision would
        // burst them apart in one step and could thread one through).
        if (Math.abs(linkingNumber(A, B)) > 0.5 || closestApproach(A, B) < opts.collMinDist * 0.8) { bad.add(a); bad.add(b) }
      }
    }
    if (!bad.size) break
    for (const k of bad) {
      const R = root[k]!
      for (const i of bodies[k]!) {
        const p = nodes[i]!
        p.x = R.x + (p.x - R.x) * 0.5
        p.y = R.y + (p.y - R.y) * 0.5
        p.z = R.z + (p.z - R.z) * 0.5
      }
      seeds[k] = seeds[k]! * 0.5
    }
  }
  // Hold the fabric still while the curls open on it.
  const w0 = nodes.map((p) => p.w)
  const band0 = model.radialBand
  const centre0 = model.radialCenter
  const C = opts.outsideOf
  if (C) {
    const band: NonNullable<YarnModel['radialBand']> = nodes.map((_, i) => band0?.[i] ?? null)
    bodies.forEach((b, k) => {
      const lo = Math.hypot(root[k]!.x - C.x, root[k]!.y - C.y, root[k]!.z - C.z) - opts.collMinDist * 0.4
      for (const i of b) band[i] = { lo }
    })
    model.radialBand = band
    model.radialCenter = C
  }
  for (let i = 0; i < n; i++) if (owner[i]! < 0) nodes[i]!.w = 0
  // Each coil its own yarn while it grows, and no self-collision within it:
  // a seed is its own wound shape scaled down (its bending distances hold
  // that shape), and a seed's far turns sit closer than a strand apart, so
  // its own collision would burst it open in one step and carry a turn
  // through its neighbour (measured: 1 pair in 120 threaded on the first
  // stage). Between coils, and coil against fabric, collision acts in full.
  const strand0 = model.strand
  const tmp = strand0.slice()
  const base = Math.max(0, ...strand0) + 1
  bodies.forEach((b, k) => { for (const i of b) tmp[i] = base + k })
  model.strand = tmp
  const stages = opts.stages ?? 16
  // The hold: each body pulled toward its wound set at scale s, placed on
  // its own centroid now (a translation only, so it never drags a coil into
  // a neighbour; collision acts on every iteration between holds).
  const hold = opts.holdShape ?? 0.15
  const holdSets = (sOf: (k: number) => number, k0: number): void => holdCoilSets(model, bodies, set, k0, sOf)
  opts.onStage?.(0)
  try {
    for (let st = 1; st <= stages; st++) {
      const t = st / stages
      // Geometric growth: the same ratio every stage, so a small seed is
      // not asked to double in its first stage (measured: a linear schedule
      // threaded one pair in 120 on its first stage).
      const sOf = (k: number): number => Math.pow(seeds[k]!, 1 - t)
      setScale(sOf)
      const iters = opts.iterationsPerStage ?? 30
      const chunk = hold > 0 ? HOLD_EVERY : iters
      for (let done = 0; done < iters; done += chunk) {
        if (hold > 0) holdSets(sOf, hold)
        relax(model, {
          collMinDist: opts.collMinDist,
          collK: 0.28,
          collAdjacency: 1e9,
          planeZ: 0,
          planeK: 0,
          layoutK: 0,
          ...(opts.gravity ? { gravity: opts.gravity } : {}),
          iterations: Math.min(chunk, iters - done),
        })
      }
      opts.onStage?.(st)
    }
  } finally {
    setScale(() => 1)
    model.strand = strand0
    if (C) {
      model.radialBand = band0
      model.radialCenter = centre0
      if (!band0) delete model.radialBand
      if (!centre0) delete model.radialCenter
    }
    for (let i = 0; i < n; i++) nodes[i]!.w = w0[i]!
  }
  return { seeds, sets: set }
}
