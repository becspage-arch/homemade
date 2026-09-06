/**
 * Program → relaxed geometry → Blender scene — the PURE core shared by the
 * program render pipeline (scripts/loom-pattern.ts) and the render-on-publish
 * path. No Node process spawning lives here (that's the script's job); this is
 * just: compile the program, relax it with the right profile, run the numeric
 * audit gate, and shape the deterministic Blender scene JSON + a geometry hash.
 *
 * Everything downstream (the Blender base render, the fidelity-gated photoreal
 * finish, persisting the hero) composes these pure pieces, so a stored pattern
 * can render its OWN exact hero.
 */

import { compileProgram, programYarnRadiusMm, type CrochetProgram, type Staging } from './program'
import { relax, STUFF_PRESSURE, STUFF_PRIOR } from './relax'
import { auditProblems } from './auditChecks'
import { STITCHES, type StitchId } from './dictionary'
import { pliedFilaments, smooth, type V3 } from '../yarnLoop'
import type { BuiltContinuous } from './yarnPath'

const DEFAULT_COLOUR = '#c98a5e' // warm terracotta stand-in (pale wool washes white — STITCH_ENGINE §11)

/** Relax a compiled program in place, choosing the profile from its fabric frame
 *  — identical to scripts/loom-program.ts + engine/buildSwatch, kept in sync. */
export function relaxProgram(built: BuiltContinuous, yr: number): void {
  const surface = built.frame === 'surface'
  const polar = built.frame === 'polar'
  relax(built.model, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06,
    layoutMode: surface ? 'surface' : polar ? 'radial' : 'y',
    ...(surface ? { floorZ: 0, stuffing: STUFF_PRESSURE, stuffPrior: STUFF_PRIOR } : polar ? { floorZ: -yr * 1.3 } : {}),
    iterations: surface ? 560 : polar ? 360 : 320,
  })
}

export interface CompiledProgram {
  built: BuiltContinuous
  /** The yarn radius (mm) it was built at — the resolved yarn weight. */
  yr: number
  /** Empty = the geometry is genuinely stitched. Non-empty = the audit gate
   *  found broken interlocks; do NOT render (fix the program/construction). */
  problems: string[]
}

/** The SETTLED fabric footprint in mm — measured from the RELAXED geometry, not
 *  the pre-relax nominal formula (`built.widthMm`/`heightMm`, stitch-count ×
 *  gauge before relaxation runs). Excludes the pinned foundation/anchor
 *  (`built.anchorPins` leading nodes — the cast-on edge, slip knot, magic ring,
 *  etc.) so a foundation that sits slightly wider/narrower than the worked
 *  fabric doesn't skew the reading. This is the number a declared
 *  `finishedSizeMm` is honest against — the hero IS the pattern, so its size
 *  claim must be the settled size, not the aspirational one. */
export function settledSizeMm(built: BuiltContinuous): { width: number; height: number } {
  const nodes = built.model.nodes.slice(built.anchorPins)
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const n of nodes) {
    if (n.x < minx) minx = n.x
    if (n.x > maxx) maxx = n.x
    if (n.y < miny) miny = n.y
    if (n.y > maxy) maxy = n.y
  }
  return { width: maxx - minx, height: maxy - miny }
}

/** How far a settled dimension may drift from its declared `finishedSizeMm`
 *  before the SIZE CONSISTENCY check treats it as a problem (STITCH_ENGINE.md
 *  §8e-3). A declared size is a customer-facing claim ("a 10×10cm coaster") —
 *  the hero must actually settle to roughly that, on BOTH axes independently
 *  (so a too-few-rows fabric that reads as a rectangle, not the declared
 *  square, is caught even when one axis alone happens to match). */
const SIZE_TOLERANCE = 0.12

/** Compile → relax → audit a program. `yrOverride` wins over the program's yarn
 *  weight (for rendering the same program at fine / worsted / bulky).
 *
 *  SIZE CONSISTENCY (§8e-3): when the program declares `finishedSizeMm`, the
 *  settled fabric (measured from the relaxed geometry, excluding the pinned
 *  foundation) must be within ±12% of it on EACH axis, or the audit fails —
 *  the declared size, the written gauge line and the render must all describe
 *  the same object; a rectangle rendering under a "square" claim is exactly
 *  the failure this catches. Render-only concern: no relax/dictionary/geometry
 *  change, so this cannot move a geometryHash. */
export function compileRelaxAudit(p: CrochetProgram, yrOverride?: number): CompiledProgram {
  const yr = programYarnRadiusMm(p, yrOverride)
  const built = compileProgram(p, yr)
  relaxProgram(built, yr)
  const problems = auditProblems({ built, recipe: undefined as never }, p.name, 0, yr)
  if (p.finishedSizeMm) {
    const settled = settledSizeMm(built)
    const { width: declW, height: declH } = p.finishedSizeMm
    const offW = Math.abs(settled.width - declW) / declW
    const offH = Math.abs(settled.height - declH) / declH
    if (offW > SIZE_TOLERANCE || offH > SIZE_TOLERANCE) {
      problems.push(
        `${p.name}: SIZE CONSISTENCY — declared ${declW}×${declH}mm but settled ` +
        `${settled.width.toFixed(0)}×${settled.height.toFixed(0)}mm ` +
        `(${(offW * 100).toFixed(0)}%/${(offH * 100).toFixed(0)}% off, tolerance ±${SIZE_TOLERANCE * 100}%)`,
      )
    }
  }
  return { built, yr, problems }
}

/** Does any cell of the program use a tall / post stitch? Drives the hero camera
 *  tilt (a flat top-down shot hides post relief). */
function maxHeightFactor(p: CrochetProgram): number {
  const ids: StitchId[] = []
  if (p.form === 'grid') for (const r of p.grid ?? []) ids.push(...r.stitches)
  else if (p.stitch) ids.push(p.stitch)
  return ids.reduce((m, id) => Math.max(m, STITCHES[id]?.heightFactor ?? 1), 1)
}

/** The hero camera tilt (deg) for a program's fabric. Flat plain fabric shoots
 *  top-down; tall posts / post-texture / spheres tilt to show relief. */
export function programTiltDeg(p: CrochetProgram): number {
  if (p.form === 'sphere') return 24
  if (p.form === 'disc') return 0
  const hf = maxHeightFactor(p)
  const post = p.form === 'grid' && (p.grid ?? []).some((r) => r.stitches.some((s) => s === 'fpdc' || s === 'bpdc'))
  if (post) return 34
  if (hf >= 3) return 16 // dc / tr posts
  return 0
}

export interface BlenderScene {
  fabric: { widthMm: number; heightMm: number; hex: string }
  strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[]
  view: {
    bgHex: string
    marginFactor: number
    tiltDeg: number
    resY: number
    openFabric?: boolean
    drapeAmp?: number
    minFieldMm?: number
  }
}

/** Default `minFieldMm` (STITCH_ENGINE §8e-2 Part C) for a finished-object
 *  staging when the program doesn't declare its own. `swatch` (the stitch-proof
 *  macro crop) never gets a floor — that staging exists precisely to show the
 *  fabric close up. */
const DEFAULT_MIN_FIELD_MM = 160

/** Smoothing subdivisions per control segment — MUST match the smooth() call. */
const PER_SEG = 4

/**
 * Resolve a per-ROW yarn colour for a program that expresses colourwork, or null
 * for a single-colour piece (the prior behaviour). Grid patterns carry the stripe
 * key on each GridRow; shaped-flat patterns carry it in `rowColours`. A row with
 * no key (or an unpalette'd key) falls back to the base colour.
 */
function rowColourResolver(p: CrochetProgram): ((row: number) => string) | null {
  const base = p.colourHex ?? DEFAULT_COLOUR
  const pal = p.palette
  if (p.form === 'grid' && p.grid && pal && p.grid.some((r) => r.colourKey)) {
    return (row) => {
      const key = p.grid![row]?.colourKey
      return (key ? pal[key] : undefined) ?? base
    }
  }
  if (p.form === 'flat' && p.rowColours && pal && p.rowColours.some(Boolean)) {
    return (row) => {
      const key = p.rowColours![row]
      return (key ? pal[key] : undefined) ?? base
    }
  }
  return null
}

/**
 * Resolve a per-(row, column) CELL colour for a tapestry / intarsia grid, or null.
 * Each `GridRow.cellColours[c]` is a palette key; a missing cell key falls back to
 * the row's `colourKey`, then the base colour. Drives the multi-colour render when
 * the builder supplies a per-node column map (`nodeCol`).
 */
function cellColourResolver(p: CrochetProgram): ((row: number, col: number) => string) | null {
  const base = p.colourHex ?? DEFAULT_COLOUR
  const pal = p.palette
  if (p.form !== 'grid' || !p.grid || !pal || !p.grid.some((r) => r.cellColours)) return null
  return (row, col) => {
    const gr = p.grid![row]
    const key = gr?.cellColours?.[col] ?? gr?.colourKey
    return (key ? pal[key] : undefined) ?? base
  }
}

/**
 * Split one continuous plied yarn into per-colour STROKES. The strand is smoothed
 * + plied ONCE (so the twist runs unbroken across the whole piece), then each
 * ply polyline is cut into maximal same-colour runs — one Blender curve per
 * colour, exactly the multi-material path build_yarn already groups by hex. A
 * 2-sample overlap at every colour boundary means the fat tubes meet with no gap
 * (a real colour change happens at the selvedge, where these boundaries land).
 */
function colourStrokes(
  center: V3[],
  filaments: number[][][],
  radiusMm: number,
  colourAt: (centerIdx: number) => string,
): { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[] {
  const N = center.length
  const centreHex: string[] = new Array(N)
  for (let k = 0; k < N; k++) centreHex[k] = colourAt(k)

  // Runs over the shared index space, first-appearance order preserved.
  const runs: { hex: string; a: number; b: number }[] = []
  let a = 0
  for (let k = 1; k <= N; k++) {
    if (k === N || centreHex[k] !== centreHex[a]) {
      runs.push({ hex: centreHex[a]!, a, b: k - 1 })
      a = k
    }
  }

  const byHex = new Map<string, number[][][]>()
  const order: string[] = []
  for (const run of runs) {
    const lo = Math.max(0, run.a - 2)
    const hi = Math.min(N - 1, run.b + 2)
    if (!byHex.has(run.hex)) { byHex.set(run.hex, []); order.push(run.hex) }
    const bucket = byHex.get(run.hex)!
    for (const ply of filaments) bucket.push(ply.slice(lo, hi + 1))
  }
  return order.map((hex) => ({ hex, sheen: 0.85, radiusMm, filaments: byHex.get(hex)! }))
}

/** `Staging` (the finished-object hero presentation, Part C) now lives on
 *  `./program` — a real stored `CrochetProgram` needs to carry its own staging
 *  choice, and `program.ts` cannot import it back from here without a cycle.
 *  Re-exported so existing `import { type Staging } from './programScene'`
 *  call sites are unchanged. */
export type { Staging }

/** Curl a flat strip's control points into a closed RING for the headband hero —
 *  a short ribbed CYLINDER standing on the table (a headband seamed end to end).
 *  The strip's LONG axis (its longer built extent) wraps into a circle of
 *  circumference = that length (so the vertical ribs run round the band); the short
 *  axis becomes the band's HEIGHT, standing up the z-axis; the stitch relief (local
 *  z) rides the outward radial normal. No stitch moves relative to its neighbours —
 *  the whole fabric is bent, exactly as a real headband strip is joined into a loop.
 *  Framing is off the X–Y footprint (the ring diameter), so it frames cleanly and a
 *  3/4 tilt reads it as a headband standing up. */
function loopStrip(ctrl: V3[], yr: number): V3[] {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const p of ctrl) {
    if (p.x < minx) minx = p.x; if (p.x > maxx) maxx = p.x
    if (p.y < miny) miny = p.y; if (p.y > maxy) maxy = p.y
  }
  const w = maxx - minx
  const h = maxy - miny
  // Wrap the LONGER extent so the ribs run around the ring (a real headband
  // stretches around the head along its length).
  const wrapX = w >= h
  const L = wrapX ? w : h // circumference
  const bandLo = wrapX ? miny : minx // band-height axis origin
  const Rmid = L / (2 * Math.PI) // centre-line radius
  return ctrl.map((p) => {
    const along = wrapX ? p.x - minx : p.y - miny // 0..L around the ring
    const up = (wrapX ? p.y : p.x) - bandLo // 0..band, the standing height
    const a = (along / L) * Math.PI * 2
    const rad = Rmid + p.z // stitch relief pushes outward along the radial normal
    // Ring axis = Z: circumference in X–Y (the footprint the camera frames off),
    // band height standing up Z. A short ribbed cylinder standing on the table.
    return { x: rad * Math.cos(a), y: rad * Math.sin(a), z: up + yr }
  })
}

/**
 * Bend a flat strip's control points into a gentle in-plane S-CURVE for the
 * `flatband` product-photo hero — a headband laid on the table, not worn or
 * stood up (contrast `loopStrip`, which stands it on end as a worn ring). The
 * strip's LONG axis is re-parametrised along a soft sine wave in X–Y instead
 * of a straight line; the short axis (the row count — the same axis `loopStrip`
 * stands up as band height) is carried as an offset along the curve's own
 * local NORMAL, exactly as a ribbon's width rides perpendicular to whichever
 * way it bends — so the post ribs (each a fixed column, running the full row
 * count) still read as straight bars crossing the curve, not smeared along it.
 * No stitch moves relative to its neighbours and arc length along the curve
 * equals the strip's own built length (a sine's own arc length isn't linear in
 * its parameter, but the wobble this proof needs is gentle enough — under 3%
 * of the strip's length — that the along-strip param drifting slightly is well
 * inside the same tolerance `loopStrip`'s circle already accepts). Out-of-plane
 * relief (`p.z`, the stitch texture) is untouched — this bends the fabric
 * PLANE, not its face, exactly as a real ribbon curves lying flat. */
function flatbandStrip(ctrl: V3[]): V3[] {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const p of ctrl) {
    if (p.x < minx) minx = p.x; if (p.x > maxx) maxx = p.x
    if (p.y < miny) miny = p.y; if (p.y > maxy) maxy = p.y
  }
  const w = maxx - minx
  const h = maxy - miny
  const wrapX = w >= h // the strip's LONG axis is the one that bends
  const L = wrapX ? w : h
  const W = wrapX ? h : w // the short axis (row count / band width)
  const bandLo = wrapX ? miny : minx
  // A soft "S": amplitude + wavelength both scaled to the strip's own length,
  // so this stays proportionate whatever the stitch counts settle to.
  const AMP = L * 0.09
  const K = (Math.PI * 1.5) / L // one and a half lobes = an S with a slight extra curl
  return ctrl.map((p) => {
    const along = wrapX ? p.x - minx : p.y - miny // 0..L down the strip
    const up = (wrapX ? p.y : p.x) - bandLo - W / 2 // -W/2..W/2, centred across the strip
    const theta = along * K
    const curveY = AMP * Math.sin(theta)
    const slope = AMP * K * Math.cos(theta) // d(curveY)/d(along) — the local tangent
    const tanLen = Math.hypot(1, slope)
    const nx = -slope / tanLen // the curve's local normal (unit, perpendicular to its tangent)
    const ny = 1 / tanLen
    const x = along + nx * up
    const y = curveY + ny * up
    return { x, y, z: p.z }
  })
}

/**
 * Build the deterministic Blender scene for a relaxed program — the exact
 * pattern as one continuous plied yarn. Multi-colour when the program expresses
 * colourwork (per-row stripe keys): the single strand is split into per-colour
 * curves so distinct yarn colours show in one piece. `twist` gives the
 * plied-wool fibre. `staging` presents the finished object (Part C).
 */
export function programScene(p: CrochetProgram, built: BuiltContinuous, yr: number, twist = 0.08, staging: Staging = 'swatch'): BlenderScene {
  const hex = p.colourHex ?? DEFAULT_COLOUR
  const nodes = built.model.nodes
  let ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  if (staging === 'loop') ctrl = loopStrip(ctrl, yr)
  if (staging === 'flatband') ctrl = flatbandStrip(ctrl)
  const center = smooth(ctrl, PER_SEG)
  // Target OUTER yarn radius. MUST match the single-stitch swatch call sites
  // (scripts/loom-stitch.ts, loom-continuous.ts) which the crisp-plied-yarn pass
  // (STITCH_ENGINE §11) moved 0.62 → 0.85. This value predated that pass and was
  // missed, so the SAME grid geometry that reads dense in a swatch rendered 27%
  // thinner here — opening the fabric into mesh, worst on the tall dc/tr bands
  // (measured: tr areal front-face coverage 87% at 0.62yr vs 99.7% at 0.85yr).
  // Render-only: geometry / geometryHash / the audit are untouched.
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.85, 3, twist)

  const cellResolver = cellColourResolver(p)
  const resolver = rowColourResolver(p)
  const nodeRow = built.nodeRow
  const nodeCol = built.nodeCol
  let strokes: BlenderScene['strokes']
  if (cellResolver && nodeRow && nodeCol) {
    // TAPESTRY: map a smoothed-centre index → its control point → its strand node →
    // (row, column) cell → colour. The one continuous strand is cut into per-colour
    // runs (colourStrokes), so the colour changes WITHIN a row exactly where the
    // motif does. Anchor nodes (-1) take the first worked row's cell colour.
    const colourAt = (centerIdx: number): string => {
      const ci = Math.min(Math.floor(centerIdx / PER_SEG), ctrl.length - 1)
      const node = built.strandPath[ci]!
      const row = nodeRow[node] ?? -1
      const col = nodeCol[node] ?? -1
      return cellResolver(row < 0 ? 0 : row, col < 0 ? 0 : col)
    }
    strokes = colourStrokes(center, filaments, radiusMm, colourAt)
  } else if (resolver && nodeRow) {
    // Map a smoothed-centre index → its control point → its strand node → row →
    // colour. Anchor rows (-1, the foundation) take the first worked row's colour
    // so the cast-on edge matches the bottom stripe.
    const colourAt = (centerIdx: number): string => {
      const ci = Math.min(Math.floor(centerIdx / PER_SEG), ctrl.length - 1)
      const row = nodeRow[built.strandPath[ci]!] ?? -1
      return resolver(row < 0 ? 0 : row)
    }
    strokes = colourStrokes(center, filaments, radiusMm, colourAt)
  } else {
    strokes = [{ hex, sheen: 0.85, radiusMm, filaments }]
  }
  // A clean, soft off-white ground — the finished-object HERO bar (real yarn
  // colour on a clean white background). Warm near-white, not clinical pure white,
  // so it reads as a styled product shot and doesn't blow out under AgX.
  const base = { bgHex: '#efece6', resY: 1200 } as const
  let view: BlenderScene['view']
  if (staging === 'flatlay') {
    // The WHOLE piece pulled back on a clean surface, gently tilted + softly
    // draped, so it reads as a finished dishcloth / panel laid out — not a macro
    // crop of the fabric.
    view = { ...base, marginFactor: 0.4, tiltDeg: 15, drapeAmp: 0.06, resY: 1100 }
  } else if (staging === 'loop') {
    // A standing ring (headband seamed into a loop), the 3-D object dropped onto
    // the clean ground (no flat backing plane), framed with room.
    // LOWERED CAMERA (§8e-3): at the original tiltDeg 38 the camera looked down
    // INTO the ring's open top, so the far inner wall showed through past the
    // near rim — reading as a cuff/basket you can see into, not a headband. The
    // Blender camera's height falls as cos(tiltDeg) at a roughly fixed distance
    // (loom_render_crochet.py), so raising tiltDeg is a genuinely LOWER, more
    // grazing camera — nearer the ring's own eye level, so the near wall's ribs
    // occlude the far wall instead of the shot looking down past them. Swept
    // 65/74/82: 65 still showed the far wall through the top; 82 hid it but
    // cropped so tight the loop/hole stopped reading at all (a solid drum); 74
    // (kept) hides the interior with the rim edge still legible as an open
    // loop. This is the render/staging-only fix (the other option tried in
    // reasoning — folding the strip flat into a "flatband" — risks repeating
    // the two logged failed flat/radial loop mappings, §9, given this proof's
    // band height sits close to its own loop diameter, so the safer
    // proven-geometry lever was kept and only the camera moved).
    view = { ...base, marginFactor: 0.4, tiltDeg: 74, openFabric: true }
  } else if (staging === 'flatband') {
    // The headband laid on the ground as a PRODUCT PHOTO — not worn/standing
    // (contrast `loop`). `flatbandStrip` already bent the strip into a gentle
    // in-plane S, so the camera just needs the ordinary flatlay-style 3/4-from-
    // above look, with extra margin because the S widens the footprint less
    // than a straight strip's own length would otherwise demand.
    // openFabric (like `loop`): the yarn-coloured BACKING plane is a RECTANGLE
    // sized off the content bounding box (loom_render_crochet.py) — right for a
    // flatlay panel that fills its own rectangle, wrong for an S-curved strip,
    // which doesn't: the first render showed the backing slab plainly through
    // the curve's concave side. Dropping it (as `loop` does for the same
    // non-rectangular-footprint reason) leaves the plain ground showing there
    // instead, which is what a real photo of a curved strip on a table shows.
    view = { ...base, marginFactor: 0.35, tiltDeg: 22, drapeAmp: 0.04, resY: 1100, openFabric: true }
  } else {
    // `swatch` — the tight stitch-proof macro crop (the prior behaviour).
    // No `minFieldMm` floor here: swatch staging exists to show the fabric
    // close up, not at product scale.
    view = { ...base, marginFactor: 0.12, tiltDeg: programTiltDeg(p) }
  }
  if (staging !== 'swatch') {
    view.minFieldMm = p.minFieldMm ?? DEFAULT_MIN_FIELD_MM
  }
  return {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes,
    view,
  }
}

/**
 * A cheap, stable hash of the SETTLED geometry (node positions, quantised to
 * 0.01 mm) — the render cache key. If a re-publish compiles + relaxes to the
 * same hash, the persisted hero is still exact and re-rendering can be skipped.
 * Deterministic (relaxation is Gauss-Seidel with no randomness), so the same
 * program at the same weight always hashes the same.
 */
export function geometryHash(built: BuiltContinuous): string {
  let h = 2166136261 >>> 0 // FNV-1a
  const mix = (v: number): void => {
    const q = Math.round(v * 100) | 0
    h ^= q & 0xff
    h = Math.imul(h, 16777619) >>> 0
    h ^= (q >>> 8) & 0xff
    h = Math.imul(h, 16777619) >>> 0
    h ^= (q >>> 16) & 0xff
    h = Math.imul(h, 16777619) >>> 0
  }
  for (const n of built.model.nodes) {
    mix(n.x)
    mix(n.y)
    mix(n.z)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
