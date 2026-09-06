/**
 * Position-based yarn relaxation — the crux of the stitch engine.
 *
 * The geometry of a stitch is NOT drawn; it is RELAXED out of the topology. We
 * start the yarn already threaded with the correct connectivity (each stitch's
 * legs straddling the head of the stitch below) but loose, then iteratively
 * satisfy a set of constraints until it settles into its natural shape:
 *
 *   - DISTANCE constraints along the yarn  -> the yarn keeps its length.
 *   - BENDING constraints (i to i+2)       -> the yarn resists kinking (stays a
 *                                             smooth curve, like real yarn).
 *   - SELF-COLLISION at one yarn diameter  -> two yarns can touch but never pass
 *                                             through each other. THIS is the key:
 *                                             it forces every loop open to at least
 *                                             a yarn-width, which is what turns a
 *                                             flat tangle into recognisable stitches,
 *                                             and it preserves the linking (loops
 *                                             that start linked stay linked).
 *   - a soft PLANE pull                     -> keeps a flat swatch flat-ish while
 *                                             leaving the over/under relief intact.
 *
 * Pure Gauss-Seidel constraint projection (no velocities) — stable and simple for
 * a quasi-static relax. Generic over nodes + constraints so the same relaxer will
 * serve every stitch type, 2D and 3D; only the topology that feeds it changes.
 */

/**
 * THE STUFFING (§8f-9), as shipped. One number: how far, per iteration, every
 * free node of a closed part advances along its current outward surface normal,
 * in collision diameters. Every call site that relaxes a closed round part
 * imports these two so they cannot drift apart.
 */
export const STUFF_PRESSURE = 0.0007
/** How much of the worked-profile layout hold survives while stuffed. */
export const STUFF_PRIOR = 0.25

export interface RNode {
  x: number
  y: number
  z: number
  /** Inverse mass. 0 = pinned (e.g. the foundation chain). */
  w: number
}

export interface DistConstraint {
  a: number
  b: number
  rest: number
  /** Stiffness 0..1. */
  k: number
}

export interface RelaxConfig {
  /** Centre-to-centre distance two yarns are pushed apart to (≈ yarn diameter). */
  collMinDist: number
  /** Collision stiffness 0..1. */
  collK: number
  /** Skip collision between nodes within this many steps along the SAME yarn. */
  collAdjacency: number
  /** Pull z toward this target with `planeK` (soft, keeps relief). */
  planeZ: number
  planeK: number
  /**
   * "Laid flat / blocked" pull: each free node's y is drawn toward its worked row
   * line (its initial y) with this stiffness. Represents blocking the finished
   * swatch to its worked dimensions — it keeps rows at the spacing the yarn was
   * worked to (so a tall stitch's fed length stands as a tall post instead of
   * coiling shut), WITHOUT touching the loop/twist/interlock, which still relax
   * freely in x and z. 0 = off.
   */
  layoutK: number
  /**
   * Which worked-line the layout pull holds. 'y' (default) = flat rows: pull each
   * node's y toward its initial row line. 'radial' = work in the round: pull each
   * node's RADIUS (in the fabric plane) toward its initial radius — the exact
   * analog for rounds, leaving the angular position and z (loop/interlock relief)
   * free to relax. Represents the same physical thing: the fabric blocked to the
   * dimensions it was worked to.
   */
  layoutMode?: 'y' | 'radial' | 'surface'
  /**
   * INTERNAL PRESSURE — the stuffing (§8f-9). A closed crocheted part is not a
   * shell laid on a frame: it is a fabric BAG with filling pushed into it. The
   * filling presses outward on every square millimetre of the inside, the yarn
   * pulls back, and the settled shape is wherever those two balance — which is
   * why a real amigurumi has no hard edge anywhere: flat tops dome, cap/wall
   * corners round off, and the walls stand a few percent proud of the radius
   * their stitch count alone implies.
   *
   * Modelled the way the rest of the relaxer models everything else — as a
   * positional term, not a force: every free node of the part advances this far
   * per iteration along the CURRENT outward surface normal (in collision
   * diameters, so it scales with the yarn). Nothing caps it except the fabric:
   * the yarn's own distance constraints (the posts carry the meridian, the
   * spiral carries the hoop), self-collision, the pinned magic ring gathering
   * the pole, and the table under the piece. Equilibrium is where the fabric's
   * stretch balances the push — a real membrane balance, one parameter.
   *
   * 0 / absent = no stuffing (every existing build is bit-identical).
   */
  stuffing?: number
  /**
   * How much of the worked-shape layout hold survives while a part is stuffed
   * (default 0.25). Unstuffed, that hold IS the shape: it pins every node to
   * the analytic/intrinsic profile the counts were laid on, and the fabric has
   * no say. Stuffed, the profile is only where the piece STARTED — a soft prior
   * that stops rounds wandering along the meridian while pressure and yarn
   * decide the settled surface between them.
   */
  stuffPrior?: number
  /**
   * A hard TABLE under the work: free nodes are clamped to z >= floorZ. One-sided
   * contact, exactly like the surface a swatch is photographed on — it stops loops
   * rolling under the work without pressing the relief out of the front. Omit for
   * no floor.
   */
  floorZ?: number
  iterations: number
}

export interface YarnModel {
  nodes: RNode[]
  dist: DistConstraint[]
  bend: DistConstraint[]
  /** For each node, the index of the yarn polyline it belongs to (for adjacency). */
  strand: number[]
  /** Position of each node along its strand (for adjacency exclusion). */
  along: number[]
  /**
   * Per-node unit MERIDIAN tangent in the (cylindrical-radius, global-z) half
   * plane, for curved surfaces (layoutMode 'surface' + the audit's surface
   * frame). tr = component along r_cyl, tz = along global z. Points away from
   * the start pole. Built from each node's initial position on the surface.
   */
  meridian?: { tr: number; tz: number }[]
  /**
   * Per-node ROUND index (which worked round put the node down; -1 for the
   * anchor ring and anything that belongs to no round). The STUFFING term needs
   * it: internal pressure acts along the CURRENT surface normal, and the
   * cheapest exact way to know the current surface of a piece worked in rounds
   * is to re-read its own meridian profile — the mean radius and height of each
   * round — every few iterations. Absent = no stuffing.
   */
  round?: number[]
  /**
   * Per-node one-sided z BOUNDS (null/undefined = unbounded) — the CROWN
   * CANOPY for no-turn round fabric. Physically: the taut crown chain-line
   * lies ON TOP of the crowded legs and hooks of a real disc and hides them;
   * in the model the crowns are individual slack arcs, so without this the
   * inner-round crowd erupts UP between the Vs (measured 91% collision-
   * saturated) AND the crowns get dragged DOWN into the crowd by the very
   * hooks that link them (probed: an exempt crown sank to +0.02yr). The
   * builder gives non-crown nodes a ceiling ({hi}) and crown nodes a floor
   * ({lo}) — one-sided each, like the table; topology and interlocks
   * unchanged, collision still does the holding.
   */
  zBand?: ({ lo?: number; hi?: number } | null)[]
  /**
   * Per-node one-sided RADIAL bounds — the CROWN CANOPY generalised to a CLOSED
   * CURVED SURFACE (the sphere). On the flat disc the canopy is a z-clamp because
   * the disc's surface normal is global +z everywhere; on a sphere the normal is
   * the radial-from-centre direction, so the same "crowns proud, crowded legs
   * tucked under" is a clamp on each node's DISTANCE FROM CENTRE. Bounds are
   * absolute distances from `radialCenter`; non-crown nodes get a ceiling ({hi}),
   * crown nodes a floor ({lo}) — one-sided each, exactly like zBand, moving the
   * node radially in/out about the centre. Topology + interlocks unchanged.
   */
  radialBand?: ({ lo?: number; hi?: number } | null)[]
  /** Centre point for radialBand distances (the sphere centre). */
  radialCenter?: { x: number; y: number; z: number }
}

function projectDistance(nodes: RNode[], c: DistConstraint): void {
  const a = nodes[c.a]!
  const b = nodes[c.b]!
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  const d = Math.hypot(dx, dy, dz)
  if (d < 1e-5) return // coincident — direction undefined, skip (prevents blow-up)
  const wsum = a.w + b.w
  if (wsum === 0) return
  const diff = ((d - c.rest) / d) * c.k
  const ax = dx * diff * (a.w / wsum)
  const ay = dy * diff * (a.w / wsum)
  const az = dz * diff * (a.w / wsum)
  const bx = dx * diff * (b.w / wsum)
  const by = dy * diff * (b.w / wsum)
  const bz = dz * diff * (b.w / wsum)
  a.x += ax
  a.y += ay
  a.z += az
  b.x -= bx
  b.y -= by
  b.z -= bz
}

/** A uniform grid spatial hash to make collision near-linear instead of O(n^2). */
class Grid {
  cell: number
  map = new Map<number, number[]>()
  constructor(cell: number) {
    this.cell = cell
  }
  key(x: number, y: number, z: number): number {
    const cx = Math.floor(x / this.cell)
    const cy = Math.floor(y / this.cell)
    const cz = Math.floor(z / this.cell)
    return (cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791)
  }
  build(nodes: RNode[]): void {
    this.map.clear()
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!
      const k = this.key(n.x, n.y, n.z)
      let arr = this.map.get(k)
      if (!arr) {
        arr = []
        this.map.set(k, arr)
      }
      arr.push(i)
    }
  }
  near(n: RNode): number[] {
    const out: number[] = []
    const cx = Math.floor(n.x / this.cell)
    const cy = Math.floor(n.y / this.cell)
    const cz = Math.floor(n.z / this.cell)
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const k =
            ((cx + dx) * 73856093) ^ ((cy + dy) * 19349663) ^ ((cz + dz) * 83492791)
          const arr = this.map.get(k)
          if (arr) out.push(...arr)
        }
    return out
  }
}

export function relax(model: YarnModel, cfg: RelaxConfig): void {
  const { nodes, dist, bend, strand, along } = model
  const grid = new Grid(cfg.collMinDist)
  const minD2 = cfg.collMinDist * cfg.collMinDist
  // Capture each node's worked line for the "laid flat / blocked" pull: its row
  // (initial y) for flat work, its round (initial radius) for work in the round.
  const radial = cfg.layoutMode === 'radial'
  const surface = cfg.layoutMode === 'surface' && !!model.meridian
  const y0 = cfg.layoutK > 0 && !radial && !surface ? nodes.map((n) => n.y) : null
  const r0 = cfg.layoutK > 0 && radial ? nodes.map((n) => Math.hypot(n.x, n.y)) : null
  // …and, in the round, each node's worked NORMAL offset (z on a disc). See 5b.
  const z0 = cfg.layoutK > 0 && radial ? nodes.map((n) => n.z) : null
  // Curved surfaces: capture each node's worked latitude (r_cyl + global z) —
  // the pull acts only along the local MERIDIAN tangent (the row-height
  // direction), leaving the angular direction and the surface NORMAL (the
  // loop/interlock relief) free. Physically: the piece is stuffed/blocked to
  // the shape it was worked to.
  const s0 =
    cfg.layoutK > 0 && surface
      ? nodes.map((n) => ({ r: Math.hypot(n.x, n.y), z: n.z }))
      : null

  // Bonded pairs (anything joined by a constraint) never collide — connected yarn
  // touches. A node also never collides with another node on the SAME stitch
  // (its own shape is set by its constraints). What's LEFT is genuinely separate
  // yarn, which collision keeps a diameter apart — and that is what threads a post
  // through the loops of the stitch below (the link pulls it to the loop centre,
  // collision stops it passing through the loop's sides).
  // THE STUFFING (§8f-9). Pressure acts along the CURRENT outward surface
  // normal, so the surface has to be re-read as the piece inflates — a piece
  // worked in rounds carries its own meridian sampling, so the profile is just
  // the mean radius and height of each round, refreshed every few iterations.
  const stuffing = surface && (cfg.stuffing ?? 0) > 0 && !!model.round ? cfg.stuffing! : 0
  const roundOf = stuffing > 0 ? model.round! : null
  const nRounds = roundOf ? Math.max(...roundOf) + 1 : 0
  // Per-round outward normal in the (r_cyl, z) half plane, refreshed below.
  const rn = new Float64Array(Math.max(nRounds, 1))
  const zn = new Float64Array(Math.max(nRounds, 1))
  // The advance is a STRAIN, not a distance: a membrane under pressure p
  // stretches by pR/2Et, so the displacement scales with the piece's own
  // radius. Measured, a fixed distance makes a small part far bulgier than a
  // big one at the same stuffing (a 12-round ear +18% against a 30-round body
  // +9%), which is not what stuffing does. Scaled by the widest round, one
  // `stuffing` number means the same firmness on every part.
  let step = 0
  const refreshNormals = (): void => {
    const sr = new Float64Array(nRounds)
    const sz = new Float64Array(nRounds)
    const cnt = new Float64Array(nRounds)
    for (let i = 0; i < nodes.length; i++) {
      const k = roundOf![i]!
      if (k < 0) continue
      const n = nodes[i]!
      sr[k]! += Math.hypot(n.x, n.y)
      sz[k]! += n.z
      cnt[k]! += 1
    }
    let rMax = 0
    for (let k = 0; k < nRounds; k++) {
      if (cnt[k]! === 0) continue
      sr[k]! /= cnt[k]!
      sz[k]! /= cnt[k]!
      if (sr[k]! > rMax) rMax = sr[k]!
    }
    step = stuffing * rMax
    for (let k = 0; k < nRounds; k++) {
      // Central difference of the profile where there is one either side; the
      // poles take the one-sided difference (the ring end and the fasten-off).
      let a = k - 1
      let b = k + 1
      while (a >= 0 && cnt[a]! === 0) a--
      while (b < nRounds && cnt[b]! === 0) b++
      const lo = a >= 0 ? a : k
      const hi = b < nRounds ? b : k
      if (lo === hi) { rn[k] = 0; zn[k] = 1; continue }
      const tr = sr[hi]! - sr[lo]!
      const tz = sz[hi]! - sz[lo]!
      const L = Math.hypot(tr, tz) || 1
      // Outward normal = the meridian tangent rotated +90° (same convention as
      // the intrinsic profile: the meridian runs away from the start pole, so
      // (-tz, tr) points out of the piece).
      rn[k] = -tz / L
      zn[k] = tr / L
    }
  }
  if (stuffing > 0) refreshNormals()

  const N = nodes.length
  const bonded = new Set<number>()
  const key = (a: number, b: number): number => (a < b ? a * N + b : b * N + a)
  for (const c of dist) bonded.add(key(c.a, c.b))
  for (const c of bend) bonded.add(key(c.a, c.b))

  for (let it = 0; it < cfg.iterations; it++) {
    // 1. Yarn length.
    for (const c of dist) projectDistance(nodes, c)
    // 2. Bending (softer).
    for (const c of bend) projectDistance(nodes, c)

    // 3. Self-collision (push apart to one yarn diameter).
    grid.build(nodes)
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!
      for (const j of grid.near(a)) {
        if (j <= i) continue
        // Skip near-neighbours along the yarn (it IS that close there) and any
        // pair joined by a constraint (connected yarn touches). Everything else is
        // separate yarn that must stay a diameter apart — that's the weave.
        if (strand[i] === strand[j] && Math.abs(along[i]! - along[j]!) <= cfg.collAdjacency) continue
        if (bonded.has(key(i, j))) continue
        const b = nodes[j]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dz = b.z - a.z
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 >= minD2 || d2 < 1e-12) continue
        const d = Math.sqrt(d2)
        const wsum = a.w + b.w
        if (wsum === 0) continue
        const corr = ((cfg.collMinDist - d) / d) * cfg.collK
        const ux = dx * corr
        const uy = dy * corr
        const uz = dz * corr
        a.x -= ux * (a.w / wsum)
        a.y -= uy * (a.w / wsum)
        a.z -= uz * (a.w / wsum)
        b.x += ux * (b.w / wsum)
        b.y += uy * (b.w / wsum)
        b.z += uz * (b.w / wsum)
      }
    }

    // 3b. THE STUFFING: internal pressure, outward along the current surface
    // normal, on every free node of the closed part. Nothing here caps it — the
    // yarn's own constraints above, the pinned magic ring at the pole and the
    // table below are what it settles against.
    if (stuffing > 0) {
      if (it % 20 === 0 && it > 0) refreshNormals()
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        if (n.w === 0) continue
        const k = roundOf![i]!
        if (k < 0) continue
        const r = Math.hypot(n.x, n.y)
        if (r > 1e-6) {
          const f = 1 + (step * rn[k]!) / r
          n.x *= f
          n.y *= f
        }
        n.z += step * zn[k]!
      }
    }

    // 4. Soft pull toward the fabric plane (keeps a flat swatch flat, leaves relief).
    if (cfg.planeK > 0) {
      for (const n of nodes) {
        if (n.w === 0) continue
        n.z += (cfg.planeZ - n.z) * cfg.planeK
      }
    }

    // 4b. The table: one-sided contact, nothing sinks below the surface.
    if (cfg.floorZ !== undefined) {
      for (const n of nodes) {
        if (n.w === 0) continue
        if (n.z < cfg.floorZ) n.z = cfg.floorZ
      }
    }

    // 4c. The crown canopy (per-node one-sided bounds — see YarnModel.zBand).
    if (model.zBand) {
      for (let i = 0; i < nodes.length; i++) {
        const b = model.zBand[i]
        if (b == null) continue
        const n = nodes[i]!
        if (n.w === 0) continue
        if (b.hi !== undefined && n.z > b.hi) n.z = b.hi
        if (b.lo !== undefined && n.z < b.lo) n.z = b.lo
      }
    }

    // 4d. The crown canopy on a CLOSED CURVED SURFACE (the sphere): the same
    // one-sided clamp as 4c but along the radial-from-centre direction, so it
    // works where the surface normal is not global z (see YarnModel.radialBand).
    if (model.radialBand && model.radialCenter) {
      const C = model.radialCenter
      for (let i = 0; i < nodes.length; i++) {
        const b = model.radialBand[i]
        if (b == null) continue
        const n = nodes[i]!
        if (n.w === 0) continue
        const dx = n.x - C.x
        const dy = n.y - C.y
        const dz = n.z - C.z
        const d = Math.hypot(dx, dy, dz)
        if (d < 1e-6) continue
        let target = d
        if (b.hi !== undefined && d > b.hi) target = b.hi
        if (b.lo !== undefined && d < b.lo) target = b.lo
        if (target !== d) {
          const f = target / d
          n.x = C.x + dx * f
          n.y = C.y + dy * f
          n.z = C.z + dz * f
        }
      }
    }

    // 5. "Laid flat / blocked": hold each row at its worked y (keeps posts extended).
    if (y0) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        if (n.w === 0) continue
        n.y += (y0[i]! - n.y) * cfg.layoutK
      }
    }
    // 5b. The same pull for work in the round: hold each round at its worked
    // RADIUS, leaving the angular position free — PLUS the same whisper-soft
    // pull on the normal (here, z) that the curved-surface mode has always
    // carried (5c). The disc had only the radius held, so its normal direction
    // was completely free: the built relief meant nothing and the crowd alone
    // decided how far out of the fabric each part of a stitch finished. Measured
    // (§8f-5), a crown BUILT 0.08 rendered diameters proud settled 0.85 proud —
    // and it settled there whatever it was built at, at every canopy, floor,
    // leg-relief and head-profile value tried — so every round-work stitch stood
    // off the surface as a knot. This is the blocked/pressed term a real
    // crocheted circle gets when it is laid out and photographed. It pulls
    // toward each node's OWN worked offset, never a common plane (§9: a
    // symmetric plane pull crushes the front/back layering), so the interlock
    // relief survives and collision still wins locally.
    if (r0) {
      const kN = cfg.layoutK * 0.4
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        if (n.w === 0) continue
        const r = Math.hypot(n.x, n.y)
        if (r < 1e-6) continue
        const f = 1 + ((r0[i]! - r) / r) * cfg.layoutK
        n.x *= f
        n.y *= f
        n.z += (z0![i]! - n.z) * kN
      }
    }
    // 5c. Curved surfaces: full-strength pull along the local meridian tangent
    // (hold each round at its worked latitude) + a WHISPER-soft pull on the
    // NORMAL component toward each node's worked offset. The soft normal term
    // is the stuffing/hoop-tension analog: without it the free normal direction
    // carries not just stitch relief but a BULK drift mode, and a sphere's pole
    // cap balloons off the surface (measured: crowns drifted +0.58 → +1.98yr
    // off-surface, hooks expelled over the ring). Because it pulls toward each
    // node's OWN worked offset (not a common surface), relative interlock
    // relief is preserved — and it stays soft enough for collision to win
    // locally.
    if (s0) {
      const mer = model.meridian!
      // Stuffed, the worked profile is only a SOFT PRIOR (cfg.stuffPrior): it
      // stops rounds wandering along the meridian, and the pressure and the
      // yarn decide the surface between them. Unstuffed it is the full hold it
      // has always been, and every existing build is bit-identical.
      const kL = stuffing > 0 ? cfg.layoutK * (cfg.stuffPrior ?? 0.25) : cfg.layoutK
      const kN = kL * 0.4
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        if (n.w === 0) continue
        const t = mer[i]!
        const r = Math.hypot(n.x, n.y)
        const dr = s0[i]!.r - r
        const dz = s0[i]!.z - n.z
        const a = dr * t.tr + dz * t.tz // meridian shortfall
        const b = dr * -t.tz + dz * t.tr // normal shortfall
        const mr = a * t.tr * kL + b * -t.tz * kN
        const mz = a * t.tz * kL + b * t.tr * kN
        if (r > 1e-6) {
          const f = 1 + mr / r
          n.x *= f
          n.y *= f
        }
        n.z += mz
      }
    }

  }
}
