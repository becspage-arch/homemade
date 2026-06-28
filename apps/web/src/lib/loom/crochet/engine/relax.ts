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
}

function projectDistance(nodes: RNode[], c: DistConstraint): void {
  const a = nodes[c.a]!
  const b = nodes[c.b]!
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  const d = Math.hypot(dx, dy, dz) || 1e-9
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
  const { nodes, dist, bend, strand } = model
  const grid = new Grid(cfg.collMinDist)
  const minD2 = cfg.collMinDist * cfg.collMinDist

  // Bonded pairs (anything joined by a constraint) never collide — connected yarn
  // touches. A node also never collides with another node on the SAME stitch
  // (its own shape is set by its constraints). What's LEFT is genuinely separate
  // yarn, which collision keeps a diameter apart — and that is what threads a post
  // through the loops of the stitch below (the link pulls it to the loop centre,
  // collision stops it passing through the loop's sides).
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
        // Skip near-neighbours on the same strand (the yarn IS that close there).
        if (strand[i] === strand[j] && Math.abs(along[i]! - along[j]!) <= cfg.collAdjacency) continue
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

    // 4. Soft pull toward the fabric plane (keeps a flat swatch flat, leaves relief).
    if (cfg.planeK > 0) {
      for (const n of nodes) {
        if (n.w === 0) continue
        n.z += (cfg.planeZ - n.z) * cfg.planeK
      }
    }
  }
}
