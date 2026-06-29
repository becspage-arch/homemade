/**
 * Pure shape geometry for the motif-element library — the small set of clean
 * parametric curves every motif is built from (petals, leaves, mushroom caps,
 * stems) plus the affine transform that PLACES a motif (authored in tidy local
 * coordinates around the origin) into the design canvas at a centre / scale /
 * rotation.
 *
 * Everything here is deterministic and dependency-free. Motifs author shapes in
 * a local box roughly [-1, 1] with "up" = -y, then `place*` maps them onto the
 * canvas. The output is ordinary point lists that become StitchedElement
 * geometry — so a beautiful shape is beautiful by construction, never traced or
 * inferred from a raster.
 */

export type Pt = [number, number]

const TAU = Math.PI * 2

/** Sample a cubic Bézier p0→p3 (controls c1,c2) into `steps`+1 points. */
export function cubic(p0: Pt, c1: Pt, c2: Pt, p3: Pt, steps = 18): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    const a = mt * mt * mt
    const b = 3 * mt * mt * t
    const c = 3 * mt * t * t
    const d = t * t * t
    out.push([
      a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
      a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
    ])
  }
  return out
}

/** Sample a quadratic Bézier p0→p2 (control c) into `steps`+1 points. */
export function quad(p0: Pt, c: Pt, p2: Pt, steps = 14): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    out.push([
      mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p2[0],
      mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p2[1],
    ])
  }
  return out
}

/** A closed ellipse polygon. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, rotDeg = 0, steps = 40): Pt[] {
  const a = (rotDeg * Math.PI) / 180
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const out: Pt[] = []
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * TAU
    const ex = Math.cos(th) * rx
    const ey = Math.sin(th) * ry
    out.push([cx + ex * ca - ey * sa, cy + ex * sa + ey * ca])
  }
  return out
}

function unitNormal(from: Pt, to: Pt): { u: Pt; n: Pt; len: number } {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1e-6
  const u: Pt = [dx / len, dy / len]
  const n: Pt = [-u[1], u[0]]
  return { u, n, len }
}

/**
 * A teardrop petal: a POINT at `base`, swelling to a round end at `tip`. `width`
 * is the half-width at the fat end; `bulge` (0..1) pushes the widest point toward
 * the tip. The classic shaded-petal shape (fades base→tip when long-and-short).
 */
export function petal(base: Pt, tip: Pt, width: number, bulge = 0.62): Pt[] {
  const { u, n, len } = unitNormal(base, tip)
  const along = (t: number): Pt => [base[0] + u[0] * len * t, base[1] + u[1] * len * t]
  const off = (p: Pt, w: number): Pt => [p[0] + n[0] * w, p[1] + n[1] * w]
  const c1 = off(along(0.18), width * bulge)
  const c2 = off(along(0.82), width)
  const right = cubic(base, c1, c2, tip, 16)
  const c3 = off(along(0.82), -width)
  const c4 = off(along(0.18), -width * bulge)
  const left = cubic(tip, c3, c4, base, 16)
  return [...right.slice(0, -1), ...left.slice(0, -1)]
}

/** An almond leaf: POINTED at both `base` and `tip`, widest in the middle. */
export function leaf(base: Pt, tip: Pt, width: number, belly = 0.5): Pt[] {
  const { n, len } = unitNormal(base, tip)
  const mid: Pt = [base[0] + (tip[0] - base[0]) * belly, base[1] + (tip[1] - base[1]) * belly]
  const cU: Pt = [mid[0] + n[0] * width, mid[1] + n[1] * width]
  const cD: Pt = [mid[0] - n[0] * width, mid[1] - n[1] * width]
  const up = quad(base, cU, tip, 14)
  const dn = quad(tip, cD, base, 14)
  void len
  return [...up.slice(0, -1), ...dn.slice(0, -1)]
}

/**
 * A mushroom cap: a smooth dome over a gently concave underside. `cx,cy` is the
 * centre of the cap's base line; the dome rises by `ry` (−y) and spans ±`rx`.
 */
export function cap(cx: number, cy: number, rx: number, ry: number, steps = 28): Pt[] {
  const top: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const th = Math.PI + (i / steps) * Math.PI // π→2π : left base, over the top, right base
    top.push([cx + Math.cos(th) * rx, cy + Math.sin(th) * ry])
  }
  // Underside: a shallow downward bow from right base back to left base.
  const under = quad([cx + rx, cy], [cx, cy + ry * 0.26], [cx - rx, cy], 12)
  return [...top.slice(0, -1), ...under.slice(0, -1)]
}

/**
 * A tapered stem/trunk column from `top` centre to `bottom` centre, half-width
 * `wTop` at the top and `wBottom` at the foot (slightly flared), with a softly
 * rounded foot.
 */
export function column(top: Pt, bottom: Pt, wTop: number, wBottom: number): Pt[] {
  const { n, u } = unitNormal(top, bottom)
  const offL = (p: Pt, w: number): Pt => [p[0] + n[0] * w, p[1] + n[1] * w]
  const offR = (p: Pt, w: number): Pt => [p[0] - n[0] * w, p[1] - n[1] * w]
  const footL = offL(bottom, wBottom)
  const footR = offR(bottom, wBottom)
  const footMid: Pt = [bottom[0] + u[0] * wBottom * 0.7, bottom[1] + u[1] * wBottom * 0.7]
  return [
    offL(top, wTop),
    ...cubic(offL(top, wTop), offL([(top[0] + bottom[0]) / 2, (top[1] + bottom[1]) / 2], wTop * 1.05), footL, footL, 8),
    ...quad(footL, footMid, footR, 8),
    offR(bottom, wBottom),
    ...cubic(footR, offR([(top[0] + bottom[0]) / 2, (top[1] + bottom[1]) / 2], wTop * 1.05), offR(top, wTop), offR(top, wTop), 8),
  ]
}

/** Points along a quadratic arc — handy for stems/vines worked as a line. */
export function arc(p0: Pt, c: Pt, p1: Pt, steps = 16): Pt[] {
  return quad(p0, c, p1, steps)
}

/** Evenly spaced angles (radians) round a circle, starting at `startDeg`. */
export function ring(centre: Pt, radius: number, count: number, startDeg = -90): Pt[] {
  const out: Pt[] = []
  const s = (startDeg * Math.PI) / 180
  for (let i = 0; i < count; i++) {
    const a = s + (i / count) * TAU
    out.push([centre[0] + Math.cos(a) * radius, centre[1] + Math.sin(a) * radius])
  }
  return out
}

// ── Placement transform: local motif coords → canvas ────────────────────────

export interface Placement {
  /** Where the motif's local origin lands on the canvas. */
  centre: Pt
  /** Uniform scale from local units to canvas units. */
  scale: number
  /** Clockwise rotation in degrees (y-down canvas). */
  rotDeg?: number
  /** Mirror horizontally (in local space) before placing. */
  mirror?: boolean
}

/** Transform a single local point onto the canvas. */
export function placePt(p: Pt, pl: Placement): Pt {
  const a = ((pl.rotDeg ?? 0) * Math.PI) / 180
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const mx = (pl.mirror ? -p[0] : p[0]) * pl.scale
  const my = p[1] * pl.scale
  return [pl.centre[0] + mx * ca - my * sa, pl.centre[1] + mx * sa + my * ca]
}

/** Transform a local polyline/polygon onto the canvas. */
export function placePts(pts: Pt[], pl: Placement): Pt[] {
  return pts.map((p) => placePt(p, pl))
}
