/**
 * The COMPOSITION layer — build 2 Part B of the crochet pattern engine.
 *
 * A real amigurumi is several crocheted pieces made separately and joined: a ball
 * body, a smaller ball head, little ball/tube limbs. Each piece is genuinely
 * stitched by the LOCKED round/sphere builders (buildSphere) — this layer does
 * NOT touch that geometry. It only:
 *   1. builds + relaxes + AUDITS each part on its own (every part is real
 *      topology; a broken part fails the gate exactly like a single stitch does);
 *   2. places each relaxed part into ONE composed 3D world by a simple
 *      declarative layout (rest on the ground / stack on another part), and
 *   3. hands the composed strokes to the render as ONE staged finished object.
 *
 * Assembling already-real pieces is honest (it mirrors how amigurumi are made) —
 * no faking, no new interlock topology, no rework of the locked round builders.
 */

import { buildSphere } from './shaping'
import { relaxProgram, geometryHash } from './programScene'
import { auditProblems } from './auditChecks'
import { pliedFilaments, smooth, type V3 } from '../yarnLoop'
import { YARN_WEIGHT_RADIUS_MM, type YarnWeight } from './program'
import type { StitchId } from './dictionary'
import type { BuiltContinuous } from './yarnPath'

/** Where a part sits in the composed object. Parts are laid out in list order, so
 *  a part may only reference an EARLIER part.
 *
 *  - `ground` rests it on the table (its lowest point at z = 0), optionally offset.
 *  - `{ on: name, overlap }` STACKS it centred on top of a named part, overlapping
 *    by `overlap` mm (amigurumi body/head nestle into each other).
 *  - `{ on: name, dir }` ATTACHES it as a protruding limb: the part is rotated so
 *    its long (pole-to-pole) axis points along `dir`, then seated onto the parent's
 *    surface in that direction so it STANDS PROUD as a 3-D form (ears, arms, legs,
 *    a muzzle). Only its base pole sinks into the parent (`seat` mm); the rest of
 *    the piece stands off the body. This is how a real amigurumi limb is sewn on —
 *    at an angle, standing out — not a ball half-buried on the crown. */
export type PartPlacement =
  | { on: 'ground'; offset?: { x?: number; y?: number } }
  | { on: string; overlap?: number; offset?: { x?: number; y?: number; z?: number } }
  | {
      on: string
      /** WHERE on the parent the piece is sewn: the direction from the parent's
       *  centre to the join. Also the direction the limb points unless `aim`
       *  says otherwise (need not be unit). */
      dir: { x: number; y: number; z: number }
      /** WHICH WAY the piece points, if that differs from where it is sewn on.
       *  A real sewn-on arm joins high at the shoulder and hangs down-forward;
       *  a leg joins low at the front and lies forward along the table. Without
       *  it the two are the same direction (the original behaviour). */
      aim?: { x: number; y: number; z: number }
      /** How far the base pole sinks into the parent surface (mm, default 4). A
       *  small seat = a clean join; the rest of the limb stands proud. */
      seat?: number
      /** Seat the MAGIC-RING pole into the parent instead of the fasten-off
       *  pole, so the ring spiral is hidden in the join and the smooth end of
       *  the piece faces the camera. A round ear/muzzle whose ring swirl faces
       *  out reads as a flat disc, not a 3-D form. */
      poleIn?: boolean
      /** How the parent's surface distance along `dir` is measured.
       *  'box' (default) = the historical half-extent sum (over-estimates on a
       *  diagonal, so seats had to be tuned per part); 'ellipsoid' = the exact
       *  ray/ellipsoid radius, so `seat` is real millimetres in any direction. */
      surfaceFit?: 'box' | 'ellipsoid'
      /** Final nudge in world mm after seating (e.g. drop a leg onto the table). */
      offset?: { x?: number; y?: number; z?: number }
    }

export interface AmigurumiPart {
  name: string
  /** The working stitch (a locked stitch — sc for amigurumi). */
  stitch: StitchId
  /** Sphere pattern counts (a closed stuffed ball): 6,12,18…widest…12,6. */
  rounds: number[]
  /** This part's yarn colour (hex). */
  colourHex: string
  /** Where it goes in the composed object. */
  place: PartPlacement
  /** Uniform scale on the built geometry (default 1). Sizing normally comes from
   *  the round counts; scale is a fine trim only. */
  scale?: number
}

/**
 * A NON-YARN notion: the plastic/haberdashery parts a real amigurumi pattern
 * lists alongside its yarn — safety eyes, a plastic nose, a bell. They are not
 * stitches and are not pretending to be: they are rendered as what they are,
 * moulded primitives with their own glossy material, seated on a crocheted
 * part's surface exactly the way a limb is. (Modelling them as yarn would be
 * the faking the engine forbids; leaving them out leaves a bear with no face.)
 */
export interface CompositionProp {
  name: string
  /** The crocheted part it is fixed to (must be listed before the props run). */
  on: string
  /** Direction from that part's centre to where it sits on the surface. */
  dir: { x: number; y: number; z: number }
  /** Radius of the moulded part (mm). */
  radiusMm: number
  /** How far it sinks below the surface (mm, default 45% of the radius — a
   *  safety eye's shank goes through the fabric, the dome stands proud). */
  seat?: number
  /** Squash along `dir` (1 = a full sphere, <1 = a domed/oblate nose). */
  flatten?: number
  /** Widen across `dir` (1 = round; >1 = a wide nose). */
  widen?: number
  colourHex: string
  /** 0 = matte moulded plastic, 1 = wet-look glossy (default 0.85). */
  gloss?: number
  /** Exact-ellipsoid surface fit for the parent (default true — props are new,
   *  so there is no historical placement to preserve). */
  surfaceFit?: 'box' | 'ellipsoid'
}

export interface CompositionProgram {
  name: string
  parts: AmigurumiPart[]
  /** Non-yarn notions (safety eyes, a nose). Optional: a composition without
   *  them renders exactly as before, down to the scene JSON. */
  props?: CompositionProp[]
  /** Render yarn weight → yr. Compositions render at their program weight (the
   *  layout is computed from each part's built size, so it stays consistent). */
  yarnWeight?: YarnWeight
  /** Camera tilt (deg) OFF STRAIGHT DOWN. 0 = plan view looking at the crown of
   *  the piece; 90 = eye level with the table. A toy is photographed from just
   *  above eye level, so a figure wants ~70, not the ~20 a flat piece wants. */
  tiltDeg?: number
  /** Camera yaw (deg) around the object — 0 = square on the front, ~30 = the
   *  three-quarter view a product photo of a toy is shot from. */
  yawDeg?: number
  /** Aim the camera this far up the object (0..1 of its height; default 0 = the
   *  table). A tall figure shot from a low tilt needs the frame centred on the
   *  body, not on the ground under it. */
  aimHeightFrac?: number
  /** Multiply the framing distance (1 = the computed fit). */
  distScale?: number
  /** Widen the ground plane (default 5): a near-horizontal camera sees much
   *  further across the table than a top-down one. */
  groundScale?: number
  /** 'product' swaps the flat-fabric raking key (which BACK-lights a figure
   *  shot from near eye level) for a high three-quarter key + fill that follows
   *  the camera. Leave unset for the top-down fabric rig. */
  lightRig?: 'product'
  /** Ground colour (default the off-white the finished-object bar uses). */
  bgHex?: string
  /** Key+fill energy scale (renderer default 0.65 — eased for pale wool). */
  light?: number
  /** AgX exposure (renderer default 0.2). */
  exposure?: number
  /** Frame margin override (default 0.45). */
  marginFactor?: number
  /** Minimum camera field of view (mm, across the frame's SHORTER side) — the
   *  same product-photo scale floor as `CrochetProgram.minFieldMm`
   *  (STITCH_ENGINE §8e-2 Part C): a small finished piece (e.g. the 58mm ball)
   *  is framed as if in at least this field, with white ground round it,
   *  instead of filling the frame the way a larger composition (e.g. the
   *  101mm bear) does. A composition always stages itself as a finished
   *  object (there is no `swatch` composition), so this floor is always
   *  applied. Defaults to 160 (mm) in the scene builder when unset; a
   *  composition whose own margined frame already exceeds the floor is
   *  unaffected — this only ever pulls the camera BACK, never in. */
  minFieldMm?: number
  // Catalogue / pattern metadata (optional).
  gaugeText?: string
  finishedSizeMm?: { width: number; height: number }
  hookMm?: number
  notes?: string
}

/** Resolve the render yarn radius (mm) for a composition. */
export function compositionYarnRadiusMm(p: CompositionProgram, override?: number): number {
  if (override != null) return override
  return YARN_WEIGHT_RADIUS_MM[p.yarnWeight ?? 'worsted']
}

interface PlacedPart {
  part: AmigurumiPart
  /** The relaxed, TRANSFORMED strand centre-line control points (world mm). */
  ctrl: V3[]
  /** World bounding box after placement (for stacking + framing). */
  bounds: { minx: number; maxx: number; miny: number; maxy: number; minz: number; maxz: number }
  /** The part's own built+relaxed geometry and the rigid transform that put it
   *  here — the contact pass deforms the NODES and re-derives ctrl, so the
   *  audit gate runs on the geometry that is actually rendered. */
  built?: BuiltContinuous
  xform?: { R: number[][]; T: V3; scale: number; c: V3 }
}

/** A prop resolved into world millimetres: a centre plus three semi-axis
 *  vectors (the ellipsoid { c + a·u + b·v + c·w : |u|²+|v|²+|w|² ≤ 1 }). The
 *  renderer needs no rotation convention of its own — the axes carry it. */
export interface PlacedProp {
  name: string
  centre: V3
  axes: [V3, V3, V3]
  hex: string
  gloss: number
}

export interface CompiledComposition {
  placed: PlacedPart[]
  props: PlacedProp[]
  yr: number
  /** Empty = every part is genuinely stitched. Non-empty = a part failed the
   *  audit gate (prefixed with the part name); do NOT render. */
  problems: string[]
  geometryHash: string
}

/** Rotation (as a 3×3, row-major) mapping the +z axis onto unit vector `u` —
 *  Rodrigues' formula. Used to aim a limb's long (pole-to-pole) axis along its
 *  outward attach direction so it stands proud instead of lying on the body. */
function rotZTo(u: V3): number[][] {
  const c = u.z // (0,0,1)·u
  if (c > 0.999999) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  if (c < -0.999999) return [[1, 0, 0], [0, -1, 0], [0, 0, -1]] // 180° about x
  // axis v = (0,0,1) × u = (-u.y, u.x, 0); K = [v]×; R = I + K + K²/(1+c).
  const vx = -u.y, vy = u.x // vz = 0
  const s2 = 1 / (1 + c)
  // K
  const k = [[0, 0, vy], [0, 0, -vx], [-vy, vx, 0]]
  // K²  (with vz = 0)
  const kk = [
    [-vy * vy, vx * vy, 0],
    [vx * vy, -vx * vx, 0],
    [0, 0, -(vx * vx + vy * vy)],
  ]
  const R: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) R[i]![j] = (i === j ? 1 : 0) + k[i]![j]! + kk[i]![j]! * s2
  return R
}

/** Normalise a (possibly un-normalised) direction. */
function unit(d: { x: number; y: number; z: number }): V3 {
  const l = Math.hypot(d.x, d.y, d.z) || 1
  return { x: d.x / l, y: d.y / l, z: d.z / l }
}

function applyRot(R: number[][], v: V3): V3 {
  return {
    x: R[0]![0]! * v.x + R[0]![1]! * v.y + R[0]![2]! * v.z,
    y: R[1]![0]! * v.x + R[1]![1]! * v.y + R[1]![2]! * v.z,
    z: R[2]![0]! * v.x + R[2]![1]! * v.y + R[2]![2]! * v.z,
  }
}

/** How far the parent's surface is from its centre along unit `u`.
 *  'box' is the historical half-extent sum (kept so every existing composition
 *  places byte-identically); 'ellipsoid' is the exact ray/ellipsoid radius. */
function surfaceRadius(b: PlacedPart['bounds'], u: V3, fit: 'box' | 'ellipsoid'): number {
  const ax = (b.maxx - b.minx) / 2
  const ay = (b.maxy - b.miny) / 2
  const az = (b.maxz - b.minz) / 2
  if (fit === 'box') return Math.abs(u.x) * ax + Math.abs(u.y) * ay + Math.abs(u.z) * az
  const q = (u.x / Math.max(ax, 1e-6)) ** 2 + (u.y / Math.max(ay, 1e-6)) ** 2 + (u.z / Math.max(az, 1e-6)) ** 2
  return 1 / Math.sqrt(Math.max(q, 1e-12))
}

function bbox(pts: V3[]): PlacedPart['bounds'] {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const p of pts) {
    if (p.x < minx) minx = p.x
    if (p.x > maxx) maxx = p.x
    if (p.y < miny) miny = p.y
    if (p.y > maxy) maxy = p.y
    if (p.z < minz) minz = p.z
    if (p.z > maxz) maxz = p.z
  }
  return { minx, maxx, miny, maxy, minz, maxz }
}


/** A part's settled SHELL as a surface of revolution: its pole-to-pole axis
 *  (the strand starts on the magic ring at one pole and fastens off at the
 *  other, so the first and last control points name it whatever rigid transform
 *  the placement applied), binned along that axis, widest radius per bin,
 *  smoothed. Used only by the contact pass. */
interface Shell {
  c: V3
  axis: V3
  t0: number
  step: number
  R: number[]
}

function buildShell(cloud: V3[], bins = 16): Shell {
  let cx = 0, cy = 0, cz = 0
  for (const p of cloud) { cx += p.x; cy += p.y; cz += p.z }
  const c: V3 = { x: cx / cloud.length, y: cy / cloud.length, z: cz / cloud.length }
  const p0 = cloud[0]!
  const p1 = cloud[cloud.length - 1]!
  const ax = p1.x - p0.x, ay = p1.y - p0.y, az = p1.z - p0.z
  const al = Math.hypot(ax, ay, az) || 1
  const axis: V3 = { x: ax / al, y: ay / al, z: az / al }
  let lo = Infinity, hi = -Infinity
  for (const p of cloud) {
    const t = (p.x - c.x) * axis.x + (p.y - c.y) * axis.y + (p.z - c.z) * axis.z
    if (t < lo) lo = t
    if (t > hi) hi = t
  }
  const step = (hi - lo) / bins || 1
  const R = new Array<number>(bins + 1).fill(0)
  for (const p of cloud) {
    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z
    const t = dx * axis.x + dy * axis.y + dz * axis.z
    const rho = Math.sqrt(Math.max(dx * dx + dy * dy + dz * dz - t * t, 0))
    const k = Math.max(0, Math.min(bins, Math.round((t - lo) / step)))
    if (rho > R[k]!) R[k] = rho
  }
  // One smoothing pass: the per-bin maximum picks up the yarn's own relief, and
  // a jagged shell would make a jagged contact displacement — which is exactly
  // what an interlock cannot survive.
  const Rs = R.slice()
  for (let k = 1; k < R.length - 1; k++) Rs[k] = (R[k - 1]! + 2 * R[k]! + R[k + 1]!) / 4
  return { c, axis, t0: lo, step, R: Rs }
}

/** Signed depth of a world point inside a shell (> 0 = inside, mm) and the
 *  shell's outward unit normal there. */
function shellProbe(sh: Shell, p: V3): { depth: number; n: V3 } | null {
  const dx = p.x - sh.c.x, dy = p.y - sh.c.y, dz = p.z - sh.c.z
  const t = dx * sh.axis.x + dy * sh.axis.y + dz * sh.axis.z
  const wx = dx - t * sh.axis.x, wy = dy - t * sh.axis.y, wz = dz - t * sh.axis.z
  const rho = Math.hypot(wx, wy, wz)
  if (rho < 1e-6) return null
  const f = (t - sh.t0) / sh.step
  if (f < 0 || f > sh.R.length - 1) return null // past a pole — no contact here
  const i = Math.max(0, Math.min(sh.R.length - 2, Math.floor(f)))
  const u = f - i
  const R = sh.R[i]! * (1 - u) + sh.R[i + 1]! * u
  const dRdt = (sh.R[i + 1]! - sh.R[i]!) / sh.step
  // The shell is rho = R(t); the outward normal of that surface is the radial
  // direction minus the profile's own slope along the axis.
  let nx = wx / rho - dRdt * sh.axis.x
  let ny = wy / rho - dRdt * sh.axis.y
  let nz = wz / rho - dRdt * sh.axis.z
  const nl = Math.hypot(nx, ny, nz) || 1
  nx /= nl; ny /= nl; nz /= nl
  return { depth: R - rho, n: { x: nx, y: ny, z: nz } }
}

/**
 * CONTACT FLATTENING (§8f-9). Two stuffed pieces sewn together do not pass
 * through each other and they do not meet at a hard line: each presses into the
 * other and the join settles as a shared flattened lens — the body dimples into
 * a soft socket round the limb, the limb's own fabric flattens where it enters.
 * Rigidly placed shells just intersect, and the render shows the sharp circle
 * where one surface crosses the other.
 *
 * The pass is mutual and BOTH sides yield: every control point of either piece
 * within `band` of the other's settled surface is drawn onto that surface, with
 * a taper to zero at the band edge so nothing creases. Fabric that is deeper in
 * than the band is left alone — that is the SEAM, the part of the piece that has
 * been sewn inside its neighbour and is not visible; `seat` says how much of it
 * there is. What the pass changes is only the fabric you can see.
 *
 * The displacement is applied to each part's own relaxed NODES, so the audit
 * that gates the composition is re-run on the geometry that is actually
 * rendered — a contact that broke an interlock would fail the gate like
 * anything else.
 */
const CONTACT_BAND_D = 1.2
const CONTACT_YIELD = 0.6

/**
 * Build → relax → AUDIT → place every part into one composed world. Each part is
 * a real crocheted ball from the locked builder; placement is a pure rigid
 * transform of its settled geometry.
 */
export function compileComposition(p: CompositionProgram, yrOverride?: number): CompiledComposition {
  const yr = compositionYarnRadiusMm(p, yrOverride)
  const placed: PlacedPart[] = []
  const problems: string[] = []
  const byName = new Map<string, PlacedPart>()
  const allNodes: V3[] = []

  for (const part of p.parts) {
    // 1. Build + relax the real ball (locked geometry, untouched).
    const built: BuiltContinuous = buildSphere(part.stitch, 0, yr, part.rounds)
    relaxProgram(built, yr)
    // 2. Per-part audit gate — the part must be genuinely stitched.
    const partProblems = auditProblems({ built, recipe: undefined as never }, part.name, 0, yr)
    for (const pr of partProblems) problems.push(`${part.name}: ${pr}`)

    // 3. Local geometry + its centre (the ball's own centroid = bbox centre).
    const nodes = built.model.nodes
    const local: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
    const lb = bbox(local)
    const cx = (lb.minx + lb.maxx) / 2
    const cy = (lb.miny + lb.maxy) / 2
    const cz = (lb.minz + lb.maxz) / 2
    const scale = part.scale ?? 1
    const halfH = ((lb.maxz - lb.minz) / 2) * scale
    const c: V3 = { x: cx, y: cy, z: cz }

    // 4. Placement → a rigid transform  world = T + scale · R · (local − centre).
    //    R is identity for ground/overlap; a real rotation for a protruding limb.
    let R: number[][] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    let T: V3 = { x: 0, y: 0, z: 0 }
    // PartPlacement's three shapes share a non-literal `on`, so TypeScript can't
    // narrow the union from `on === 'ground'`. One widened view of the same
    // object reads every shape's fields; the branch conditions below are the
    // real discriminant. Type-level only — no runtime behaviour changes.
    const place = part.place as {
      on: string
      overlap?: number
      offset?: { x?: number; y?: number; z?: number }
      dir?: { x: number; y: number; z: number }
      aim?: { x: number; y: number; z: number }
      seat?: number
      poleIn?: boolean
      surfaceFit?: 'box' | 'ellipsoid'
    }
    if (place.on === 'ground') {
      T = { x: place.offset?.x ?? 0, y: place.offset?.y ?? 0, z: halfH } // lowest point at z = 0
    } else if (place.dir) {
      // Protruding limb: aim the part's long axis along the attach direction (or
      // along `aim`, when where it JOINS and where it POINTS differ), seat one
      // pole just into the parent surface, and let the rest stand proud. Both
      // poles carry a worked-ring hole; the MAGIC-RING one is the visible
      // spiral, so `poleIn` buries it in the join rather than presenting it to
      // the camera as a swirl disc.
      const base = byName.get(place.on)
      if (!base) throw new Error(`${p.name}: limb '${part.name}' attaches to unknown/later part '${place.on}'`)
      const u = unit(place.dir)
      // The piece's own axis. `aim` decouples WHICH WAY it points from WHERE it
      // is sewn (an arm joins at the shoulder but hangs down-forward); without
      // it the two are the same, which is the original single-`dir` behaviour.
      const a = place.aim ? unit(place.aim) : u
      // `poleIn` seats the MAGIC-RING pole (local +z) instead of the fasten-off
      // pole, so the ring spiral is buried in the join. The piece's +z then has
      // to point BACK along the aim.
      const poleIn = place.poleIn === true
      const w: V3 = poleIn ? { x: -a.x, y: -a.y, z: -a.z } : a
      R = rotZTo(w)
      const pc: V3 = {
        x: (base.bounds.minx + base.bounds.maxx) / 2,
        y: (base.bounds.miny + base.bounds.maxy) / 2,
        z: (base.bounds.minz + base.bounds.maxz) / 2,
      }
      const parentR = surfaceRadius(base.bounds, u, place.surfaceFit ?? 'box')
      const seat = place.seat ?? 4
      // The join point on the parent's surface, sunk `seat` mm in.
      const jx = pc.x + u.x * (parentR - seat)
      const jy = pc.y + u.y * (parentR - seat)
      const jz = pc.z + u.z * (parentR - seat)
      // The seated pole sits at local z = hBase (the fasten-off pole's min-z, or
      // the ring pole's max-z), which the rotation maps to hBase·w in the world.
      // Solve T so that pole lands exactly on the join point. With the defaults
      // (w = u, hBase = min-z) this is the original  pc + u·(parentR − seat − base).
      const hBase = scale * ((poleIn ? lb.maxz : lb.minz) - cz)
      T = { x: jx - hBase * w.x, y: jy - hBase * w.y, z: jz - hBase * w.z }
      if (place.offset) {
        T = { x: T.x + (place.offset.x ?? 0), y: T.y + (place.offset.y ?? 0), z: T.z + (place.offset.z ?? 0) }
      }
    } else {
      const base = byName.get(place.on)
      if (!base) throw new Error(`${p.name}: part '${part.name}' stacks on unknown/later part '${place.on}'`)
      const overlap = place.overlap ?? 0
      T = {
        x: (base.bounds.minx + base.bounds.maxx) / 2 + (place.offset?.x ?? 0),
        y: (base.bounds.miny + base.bounds.maxy) / 2 + (place.offset?.y ?? 0),
        // Its bottom sits at (base top − overlap), plus optional z nudge.
        z: base.bounds.maxz - overlap + halfH + (place.offset?.z ?? 0),
      }
    }

    // 5. Apply the transform to the settled centre-line into the composed world.
    const ctrl = local.map((v) => {
      const r = applyRot(R, { x: scale * (v.x - c.x), y: scale * (v.y - c.y), z: scale * (v.z - c.z) })
      return { x: T.x + r.x, y: T.y + r.y, z: T.z + r.z }
    })
    const worldBounds = bbox(ctrl)
    const pp: PlacedPart = { part, ctrl, bounds: worldBounds, built, xform: { R, T, scale, c } }
    placed.push(pp)
    byName.set(part.name, pp)
    allNodes.push(...ctrl)
  }

  // ---- CONTACT FLATTENING (see above). Mutual, both sides yield, and the
  //      result is re-audited because it moves real stitches.
  const band = CONTACT_BAND_D * yr * 1.7
  const pairs: [PlacedPart, PlacedPart][] = []
  for (const pp of placed) {
    const on = (pp.part.place as { on: string }).on
    if (on === 'ground') continue
    const parent = byName.get(on)
    if (parent && parent !== pp) pairs.push([pp, parent])
  }
  if (pairs.length) {
    const shell = new Map<PlacedPart, Shell>()
    for (const pp of placed) shell.set(pp, buildShell(pp.ctrl))
    const move = new Map<PlacedPart, V3[]>()
    for (const pp of placed) move.set(pp, pp.ctrl.map(() => ({ x: 0, y: 0, z: 0 })))
    const press = (a: PlacedPart, b: PlacedPart): void => {
      const sh = shell.get(b)!
      const dm = move.get(a)!
      for (let i = 0; i < a.ctrl.length; i++) {
        const pr = shellProbe(sh, a.ctrl[i]!)
        if (!pr) continue
        const h = pr.depth
        if (Math.abs(h) >= band) continue
        const w = CONTACT_YIELD * (1 - Math.abs(h) / band)
        const d = h * w
        dm[i]!.x += pr.n.x * d
        dm[i]!.y += pr.n.y * d
        dm[i]!.z += pr.n.z * d
      }
    }
    for (const [child, parent] of pairs) {
      press(child, parent)
      press(parent, child)
    }
    // Push each world displacement back onto the part's own nodes (the inverse
    // of  world = T + scale·R·(local − centre)  is  local += Rᵀ·Δ / scale), then
    // re-derive the control points and re-audit.
    problems.length = 0
    for (const pp of placed) {
      const dm = move.get(pp)!
      const { R, T, scale, c } = pp.xform!
      const nodes = pp.built!.model.nodes
      const path = pp.built!.strandPath
      let touched = false
      for (let i = 0; i < path.length; i++) {
        const d = dm[i]!
        if (d.x === 0 && d.y === 0 && d.z === 0) continue
        touched = true
        const n = nodes[path[i]!]!
        n.x += (R[0]![0]! * d.x + R[1]![0]! * d.y + R[2]![0]! * d.z) / scale
        n.y += (R[0]![1]! * d.x + R[1]![1]! * d.y + R[2]![1]! * d.z) / scale
        n.z += (R[0]![2]! * d.x + R[1]![2]! * d.y + R[2]![2]! * d.z) / scale
      }
      if (touched) {
        pp.ctrl = path.map((ni) => {
          const v = nodes[ni]!
          const r = applyRot(R, { x: scale * (v.x - c.x), y: scale * (v.y - c.y), z: scale * (v.z - c.z) })
          return { x: T.x + r.x, y: T.y + r.y, z: T.z + r.z }
        })
        pp.bounds = bbox(pp.ctrl)
      }
      for (const pr of auditProblems({ built: pp.built!, recipe: undefined as never }, pp.part.name, 0, yr))
        problems.push(`${pp.part.name}: ${pr}`)
    }
    allNodes.length = 0
    for (const pp of placed) allNodes.push(...pp.ctrl)
  }

  // The non-yarn notions, seated on the finished pieces. They carry NO yarn and
  // no stitches, so they are outside the geometry hash and outside the audit —
  // the hash still describes exactly the crocheted geometry.
  const props: PlacedProp[] = (p.props ?? []).map((pr) => {
    const base = byName.get(pr.on)
    if (!base) throw new Error(`${p.name}: prop '${pr.name}' sits on unknown/later part '${pr.on}'`)
    const u = unit(pr.dir)
    const pc: V3 = {
      x: (base.bounds.minx + base.bounds.maxx) / 2,
      y: (base.bounds.miny + base.bounds.maxy) / 2,
      z: (base.bounds.minz + base.bounds.maxz) / 2,
    }
    const parentR = surfaceRadius(base.bounds, u, pr.surfaceFit ?? 'ellipsoid')
    const seat = pr.seat ?? pr.radiusMm * 0.45
    const centre: V3 = {
      x: pc.x + u.x * (parentR - seat),
      y: pc.y + u.y * (parentR - seat),
      z: pc.z + u.z * (parentR - seat),
    }
    // Semi-axes: `u` (squashed by `flatten`) plus the two directions across it.
    const Rp = rotZTo(u)
    const across1 = applyRot(Rp, { x: 1, y: 0, z: 0 })
    const across2 = applyRot(Rp, { x: 0, y: 1, z: 0 })
    const rw = pr.radiusMm * (pr.widen ?? 1)
    const rf = pr.radiusMm * (pr.flatten ?? 1)
    return {
      name: pr.name,
      centre,
      axes: [
        { x: across1.x * rw, y: across1.y * rw, z: across1.z * rw },
        { x: across2.x * rw, y: across2.y * rw, z: across2.z * rw },
        { x: u.x * rf, y: u.y * rf, z: u.z * rf },
      ] as [V3, V3, V3],
      hex: pr.colourHex,
      gloss: pr.gloss ?? 0.85,
    }
  })

  const ghash = geometryHash({ model: { nodes: allNodes as never } } as never)
  return { placed, props, yr, problems, geometryHash: ghash }
}

export interface BlenderScene {
  fabric: { widthMm: number; heightMm: number; hex: string }
  strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[]
  /** Non-yarn moulded notions (safety eyes, a nose). Absent for every scene
   *  that has none, so those scenes are byte-identical to before. */
  props?: { centre: number[]; axes: number[][]; hex: string; gloss: number }[]
  view: {
    bgHex: string
    marginFactor: number
    tiltDeg: number
    resY: number
    openFabric?: boolean
    light?: number
    exposure?: number
    yawDeg?: number
    aimHeightFrac?: number
    distScale?: number
    groundScale?: number
    lightRig?: 'product'
    minFieldMm?: number
  }
}

/** Default `minFieldMm` (STITCH_ENGINE §8e-2 Part C) for a composition — the
 *  same product-photo scale floor `programScene` applies to `flatlay` /
 *  `loop` / `flatband`. A composition is always a finished-object hero, so
 *  this is always applied unless the program overrides it. */
const DEFAULT_MIN_FIELD_MM = 160

/**
 * The staged Blender scene for a composed amigurumi — every part as its own
 * plied-yarn curve in its own colour, one continuous ball each, assembled into
 * one 3D object. Rendered with the backing plane dropped (a 3D object sits on the
 * table, it is not flat fabric) and a 3/4 camera tilt so the stack reads as the
 * finished toy a customer recognises.
 */
export function compositionScene(p: CompositionProgram, compiled: CompiledComposition, twist = 0.08): BlenderScene {
  const yr = compiled.yr
  const strokes: BlenderScene['strokes'] = compiled.placed.map((pp) => {
    const center = smooth(pp.ctrl, 4)
    const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, twist)
    return { hex: pp.part.colourHex, sheen: 0.85, radiusMm, filaments }
  })
  // Full composed extent (for the fabric hint; the script frames from the strokes).
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const pp of compiled.placed) {
    minx = Math.min(minx, pp.bounds.minx); maxx = Math.max(maxx, pp.bounds.maxx)
    miny = Math.min(miny, pp.bounds.miny); maxy = Math.max(maxy, pp.bounds.maxy)
  }
  const scene: BlenderScene = {
    fabric: { widthMm: maxx - minx + 30, heightMm: maxy - miny + 30, hex: p.parts[0]?.colourHex ?? '#c98a5e' },
    strokes,
    // A generous margin frames the FULL stacked silhouette (the tilted camera
    // frames off the horizontal footprint, so a tall body+head stack needs room
    // at the top). openFabric drops the flat backing plane — this is a 3D object.
    view: {
      bgHex: p.bgHex ?? '#efece6',
      marginFactor: p.marginFactor ?? 0.45,
      tiltDeg: p.tiltDeg ?? 22,
      resY: 1200,
      openFabric: true,
    },
  }
  // Only written when the composition actually has them, so every existing
  // composition's scene JSON — and its render — is unchanged.
  if (p.yawDeg != null) scene.view.yawDeg = p.yawDeg
  if (p.aimHeightFrac != null) scene.view.aimHeightFrac = p.aimHeightFrac
  if (p.distScale != null) scene.view.distScale = p.distScale
  if (p.groundScale != null) scene.view.groundScale = p.groundScale
  if (p.lightRig != null) scene.view.lightRig = p.lightRig
  if (p.light != null) scene.view.light = p.light
  if (p.exposure != null) scene.view.exposure = p.exposure
  scene.view.minFieldMm = p.minFieldMm ?? DEFAULT_MIN_FIELD_MM
  if (compiled.props.length) {
    scene.props = compiled.props.map((pr) => ({
      centre: [pr.centre.x, pr.centre.y, pr.centre.z],
      axes: pr.axes.map((a) => [a.x, a.y, a.z]),
      hex: pr.hex,
      gloss: pr.gloss,
    }))
  }
  return scene
}
