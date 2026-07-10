/**
 * Continuous-yarn fabric — the REAL model, genuinely STITCHED (not drawn).
 *
 * One unbroken strand traces the whole swatch exactly the way a hook lays it. The
 * yarn comes from the previous stitch's head (at the top of the row), reaches DOWN
 * and hooks UNDER the head-loop of the stitch below (the insertion), then is pulled
 * back UP, throwing its own head-loop at the top — the loop the NEXT row will hook
 * under in turn. Row after row, turning at each end.
 *
 * The interlock is NOT a spring tying a node to the head below, and the shape is NOT
 * a pinned drawing. The new stitch's descending leg is initialised on the OPPOSITE
 * z-side of the below crown (it dives behind a crown that rides proud in front), so
 * the two are topologically linked; SELF-COLLISION during relaxation (yarn cannot
 * pass through yarn) is what keeps them linked and opens every loop to a yarn-width.
 * The post HEIGHT relaxes out of the yarn fed per stitch: a dc feeds a longer leg
 * between the same two anchors than an sc, so it stands as a taller post.
 *
 * Only the foundation chain is pinned (the anchor edge); every worked stitch is free
 * and finds its shape under the constraints. See STITCH_ENGINE.md §2, §4, §9 and the
 * HARD RULE "no faking the stitch formation".
 */

import { type RNode, type DistConstraint, type YarnModel } from './relax'
import { STITCHES, type StitchId } from './dictionary'

/**
 * One genuine interlock, recorded at build time so it can be VERIFIED in data
 * after relaxation (the audit checks the link actually held — renders lie).
 * `hook` = the node that passes under/through/around; `below` = the node of the
 * loop/crown/stem it is linked to. Roles: 'hook' dives under a crown; 'ring'
 * encircles a post stem; 'cross' passes through a chain loop's opening.
 */
export interface StitchLink {
  j: number
  c: number
  /** 'hook' dives under a crown; 'ring' encircles a post stem; 'cross' passes
   *  through a chain loop's opening; 'through' = a knit leg passing the old
   *  head's mouth on the fabric's face side. */
  role: 'hook' | 'ring' | 'cross' | 'through'
  hook: number
  below: number
  /** 'through' only: which z-side of `below` the hook must settle on (±1). */
  zSign?: number
}

export interface BuiltContinuous {
  model: YarnModel
  /** The single ordered strand (node indices) to render as one yarn. */
  strandPath: number[]
  /** Every interlock the build claims — the audit verifies these after relax. */
  links: StitchLink[]
  yarnRadiusMm: number
  widthMm: number
  heightMm: number
  /**
   * How many nodes at the START of the strand are the legitimate pinned anchor
   * (foundation chain / slip knot / magic ring / cast-on). The audit rejects any
   * pin beyond these — pinned worked geometry is drawing, not stitching.
   */
  anchorPins: number
  /**
   * The fabric frame the audit should measure link offsets in. 'polar' (work in
   * the round): along-the-row = tangential, row-height = radial. Absent = flat.
   */
  frame?: 'polar'
}

export interface BuildOpts {
  /** Per-stitch override (row j, column c) → stitch id. For patterns like
   *  basketweave / mixed-stitch motifs. Falls back to rowTypes[j] when absent. */
  stitchAt?: (j: number, c: number) => StitchId
  /**
   * Work every row from the SAME face instead of turning (fz stays +1 for all
   * rows). This is real crochet — blo/flo ribbing is usually worked in the round
   * exactly this way — and it is how stitch dictionaries showcase the ridge: with
   * no turn, every row's unworked loop piles onto the FRONT face, so the ridge
   * shows on every row (turned flat fabric only shows it every other row, half the
   * ridges landing on the hidden back). Only meaningful for the loop-only stitches;
   * plain stitches look the same turned or not. The yarn still snakes serpentine
   * for one continuous strand; only the worked FACE is held constant.
   */
  noTurn?: boolean
  /**
   * Column-spacing override (gauge) in yarn radii. Normally gauge comes from the
   * row's stitch in the dictionary (STITCHES[id].gaugeYr); this lets a specific
   * SWATCH pack tighter/looser without touching that shared per-stitch gauge —
   * e.g. post ribbing wants its alternating fp/bp columns closer than a plain
   * all-fpdc swatch, so postrib overrides it while locked fpdc/bpdc keep theirs.
   */
  gaugeYr?: number
}

/** SCRATCH DIAGNOSTIC ONLY (not audited, not rendered): the blo/flo ridge node
 *  index per (j,c), so a debug script can check post-relax whether the ridge
 *  boost actually survives relaxation. Cleared at the start of every build. */
export const ridgeDebugNodes: { j: number; c: number; node: number; hookNode: number }[] = []

/**
 * The running strand under construction — one continuous yarn. push() appends a
 * node and auto-bonds it to the previous one (distance keeps the yarn's length,
 * bend resists kinking). NOTHING is ever joined by any other means: links between
 * rows/rounds are physical (collision), never a spring. Shared by every builder
 * (flat rows, shaped rows, rounds, knit) so the "one strand, genuinely stitched"
 * invariants live in exactly one place.
 */
export interface StrandCtx {
  nodes: RNode[]
  dist: DistConstraint[]
  bend: DistConstraint[]
  strandPath: number[]
  links: StitchLink[]
  push: (x: number, y: number, z: number, w?: number) => number
}

export function createStrand(): StrandCtx {
  const nodes: RNode[] = []
  const dist: DistConstraint[] = []
  const bend: DistConstraint[] = []
  const strandPath: number[] = []
  const links: StitchLink[] = []
  const dst = (i: number, j: number): number =>
    Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y, nodes[i]!.z - nodes[j]!.z)
  let prev = -1
  const push = (x: number, y: number, zz: number, w = 1): number => {
    nodes.push({ x, y, z: zz, w })
    const idx = nodes.length - 1
    if (prev >= 0) {
      dist.push({ a: prev, b: idx, rest: dst(prev, idx), k: 1 })
      if (strandPath.length >= 2) {
        const pp = strandPath[strandPath.length - 2]!
        // Firm bending = real yarn stiffness. A worked post is a semi-rigid column;
        // without this the long dc post coils into the gap instead of standing tall.
        bend.push({ a: pp, b: idx, rest: dst(pp, idx), k: 0.7 })
      }
    }
    strandPath.push(idx)
    prev = idx
    return idx
  }
  return { nodes, dist, bend, strandPath, links, push }
}

/** The shared per-stitch construction scales — all in yarn radii off `yr`. */
export interface StitchDims {
  z: number // base relief (gentle — turned fabric is fairly flat, not corrugated)
  zh: number // crown relief (the head rides proud on its worked face)
  cw: number // crown half-width — a slim head-line, not a fat rope
  pw: number // post half-width (down-leg + up-leg straddle this → one solid post)
  dh: number // how far the hook dives above/below the crown it links
}

export const stitchDims = (yr: number): StitchDims => ({
  z: yr * 0.3,
  zh: yr * 0.5,
  cw: yr * 0.4,
  pw: yr * 0.35,
  dh: yr * 0.55,
})

/** Row pitch per unit heightFactor (sc short, dc tall), in yarn radii. */
export const BASE_ROW_YR = 1.55

/**
 * One PLAIN stitch excursion (sc family / hdc / dc / tr / dtr / blo / flo) —
 * down-leg → hook UNDER the crown below → up-leg → throw this stitch's crown.
 * Extracted so every builder (flat rows, shaped rows, working in the round) emits
 * the exact same genuinely-stitched geometry. Two generalisations over the
 * original inline code, both no-ops for a plain grid stitch:
 *
 *  - `xCrown` vs `xHook`: where this stitch's crown lands on ITS row's lattice
 *    vs where its hook reaches (the consumed below-crown). Equal for a plain
 *    stitch. An INCREASE works two stitches into one below-crown (two crowns,
 *    same xHook — the legs genuinely fan from the shared base); shaping also
 *    lets a stitch's crown sit on its own row's spacing while hooking whatever
 *    is below.
 *  - `place`: an optional fabric-frame transform (lx = along the row, ly = row
 *    height) → world xy, with z (the relief axis) passed through untouched.
 *    Identity for flat swatches; polar for working in the round, where lx is
 *    arc length and ly is radius.
 */
export interface PlainStitchSpec {
  j: number
  c: number
  id: StitchId
  /** Work-direction sign along the row. */
  s: number
  /** Worked-face sign (+1 / −1) — flips when the work is TURNED each row. */
  fz: number
  /** Row bottom / top in the fabric frame (ly). */
  by: number
  ty: number
  xCrown: number
  xHook?: number
  /** Below crown node indices (back == front for a plain head). */
  bcBack: number
  bcFront: number
  /** Fabric-frame ly of the hooked below crown. Defaults to its node's world y — correct in the flat frame. */
  cyBelow?: number
  place?: (lx: number, ly: number) => { x: number; y: number }
}

export function emitPlainStitch(
  S: StrandCtx,
  d: StitchDims,
  spec: PlainStitchSpec,
): { crownBack: number; crownFront: number; postMid: number } {
  const { z, zh, cw, pw, dh } = d
  const { j, c, id, s, fz, by, ty } = spec
  const xC = spec.xCrown
  const xH = spec.xHook ?? xC
  const P = spec.place
  const push = P
    ? (lx: number, ly: number, zz: number, w = 1): number => {
        const p = P(lx, ly)
        return S.push(p.x, p.y, zz, w)
      }
    : S.push
  // Per-stitch variants: hdc's third loop; blo/flo loop choice.
  const thirdLoop = id === 'hdc'
  const loopMode = id === 'scblo' ? 'blo' : id === 'scflo' ? 'flo' : 'both'
  const px = ty - by // post span (tall for dc, short for sc)
  const bc = (loopMode === 'flo' ? spec.bcFront : spec.bcBack)! // the loop this stitch hooks under
  const cy = spec.cyBelow ?? S.nodes[bc]!.y // where that loop sits (the row joins there)
  const hookZ = (S.nodes[bc]!.z >= 0 ? -1 : 1) * z * 1.6 // dive to the FAR side of that crown
  // The legs run from the insertion (xH) at the bottom to this stitch's own crown
  // (xC) at the top. f = height fraction: 1 at the top of the leg, → 0 at the hook.
  const xa = (f: number): number => xH + (xC - xH) * f

  // hdc third loop: the start-of-stitch yarn-over, laid horizontally across the
  // head line before the hook dives. Consecutive ones form the signature ridge.
  if (thirdLoop) push(xC + s * cw * 1.1, ty - dh * 0.9, z * 1.7 * fz)
  // Down-leg: descend the worked face from the previous head toward the insertion.
  push(xa(1) + s * pw, by + px * 0.8, z * fz)
  push(xa(0.65) + s * pw, by + px * 0.52, z * fz)
  push(xa(0.33) + s * pw, by + px * 0.26, z * 1.1 * fz)
  push(xH + s * pw * 0.4, cy + dh * 0.5, z * 0.6 * fz) // approach the below crown
  // Hook UNDER the crown below — tuck to the far z-side of it. Collision (neither
  // can pass through the other) holds the link — no spring.
  const hookIdx = push(xH, cy - dh, hookZ)
  S.links.push({ j, c, role: 'hook', hook: hookIdx, below: bc })
  push(xH - s * pw * 0.4, cy + dh * 0.5, z * 0.6 * fz) // emerge
  // Up-leg: pulled back UP just beside the down-leg → the two strands of the post.
  push(xa(0.33) - s * pw, by + px * 0.26, z * 1.1 * fz)
  const postMid = push(xa(0.65) - s * pw, by + px * 0.52, z * fz)
  push(xa(1) - s * pw, by + px * 0.8, z * fz)

  // Throw this stitch's crown. A plain stitch leaves a single apex (back == front);
  // blo/flo split it into a proud (unworked, floats as the ridge) loop + a tucked
  // (worked next row) loop. The split must be baked in HERE, at creation, with the
  // real spread the construction needs — a later retroactive z-nudge on an
  // already-placed node stretches its distance constraints against their recorded
  // rest length, so relaxation mostly undoes it (measured: ~0.25yr net gap).
  push(xC - s * cw, ty - dh * 0.3, zh * fz)
  let crownBack: number
  let crownFront: number
  if (loopMode === 'both') {
    const crown = push(xC, ty, zh * 1.15 * fz)
    crownBack = crown
    crownFront = crown
  } else {
    // Relaxation crushes ~25% of whatever initial split we give (measured: 1.55zh
    // spread settled to 0.594yr, i.e. lost ~0.18yr of a 0.775yr initial gap) — widen
    // further, targeting a SETTLED gap around half a yarn diameter (~1.0yr of 2yr).
    const backFloats = loopMode === 'flo'
    const backNode = push(xC - s * cw * 0.18, ty, zh * (backFloats ? 2.2 : 0.25) * fz)
    const frontNode = push(xC + s * cw * 0.18, ty, zh * (backFloats ? 0.25 : 2.2) * fz)
    crownBack = backNode
    crownFront = frontNode
    ridgeDebugNodes.push({
      j,
      c,
      node: backFloats ? backNode : frontNode,
      hookNode: backFloats ? frontNode : backNode,
    })
  }
  push(xC + s * cw, ty - dh * 0.3, zh * fz)
  return { crownBack, crownFront, postMid }
}

export function buildContinuous(
  rowTypes: StitchId[],
  stitchesPerRow: number,
  yarnRadiusMm: number,
  opts: BuildOpts = {},
): BuiltContinuous {
  const yr = yarnRadiusMm
  const W = stitchesPerRow
  // Column spacing is gauge: a short stitch (sc) packs dense with almost no holes;
  // a tall stitch (dc/tr) is more open. Per-stitch, calibrated against the real
  // reference photos — lives in the dictionary (single source of truth).
  const st0 = rowTypes[0] ?? 'sc'
  const sw = yr * (opts.gaugeYr ?? STITCHES[st0].gaugeYr)
  const dims = stitchDims(yr)
  const { z, zh, cw, pw, dh } = dims
  const baseRow = yr * BASE_ROW_YR // row pitch per unit heightFactor (sc short, dc tall)

  const rowH = rowTypes.map((t) => baseRow * STITCHES[t].heightFactor)
  const yTop: number[] = []
  let acc = 0
  for (let j = 0; j < rowTypes.length; j++) {
    acc += rowH[j]!
    yTop.push(acc)
  }

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, dist, bend, strandPath, links, push } = S

  // Per column, the BACK loop and FRONT loop of the stitch below (the head's two
  // loops). A normal stitch hooks the back loop; back-loop-only / front-loop-only
  // pick one and leave the other floating as a ridge. For a plain head the two
  // point at the same node, so plain stitches behave exactly as before.
  const belowBack: number[] = new Array(W).fill(-1)
  const belowFront: number[] = new Array(W).fill(-1)

  // A real CHAIN on its own (no worked rows). Each chain stitch is a PULL-THROUGH:
  // the hook reaches through the loop on the hook, grabs the working yarn behind
  // the work, and drags a folded bight of it through — the fold becomes the new
  // loop, and the old loop closes around the new loop's two strands. Traced
  // genuinely as that topology:
  //   - every loop lies flat-ish in the fabric plane, elongated along the chain;
  //   - BOTH strands of loop n pass through the opening of loop n−1 (initialised
  //     actually inside it — one crossing back→front, one front→back);
  //   - the stitch-to-stitch connector runs across the BACK (the "back bump",
  //     one per stitch on the wrong side).
  // Nothing is positioned to look like a chain. The nested-V plait face must
  // EMERGE in relaxation: collision splays each loop's legs and snugs each head
  // around the next stitch's legs (it can't slip off — that would need yarn to
  // pass through yarn). Only the slip knot (loop 0) is pinned, as the anchor.
  if (rowTypes.length === 0) {
    // Sizing = the yarn FED per chain (a crocheter pulls each loop snug, so a
    // chain is tight: the hole barely fits the next stitch's two strands).
    // Loop sizing is a real BUDGET, not a look: at chain collision distance d the
    // loop must have ~2d + 2πd of perimeter to genuinely contain the two strands
    // pulled through it — feed it less and collision EXPELS one strand from the
    // hole (measured: the exit strand ended up outside the loop's own leg). Chain
    // collision runs soft (yarn squashes hard in a drawn-tight chain), so the
    // budget stays close to real chain proportions.
    const p = yr * 2.2 // pitch: one threading point to the next (~1.1 yarn diameters)
    const hw = yr * 1.0 // loop half-width — the chain face is ~2 yarn-widths across
    const r = yr * 0.7 // head-fold reach beyond the next stitch's threading point
    const zf = yr * 0.45 // the loop body rides just in front of the plane
    const zfold = -yr * 0.5 // the head fold tucks BEHIND: its clearance from the legs it wraps is in DEPTH, so from the front you see only legs (the reference face never shows a fold)
    const zb = yr * 1.4 // the back-bump connector runs at the VERY back — a full layer below the folds, or the centre-back overcrowds and collision ejects the crossings sideways
    const yin = yr * 0.3 // where the two pulled-through strands sit in the hole

    // The loop body: a snug TEARDROP — pinched at its base (where it emerged
    // through the previous loop), widest just before the fold (where it wraps the
    // NEXT stitch's two strands). A chain is drawn tight: the hole is filled by
    // what it wraps, leaving only the two converging legs visible — the V. The
    // body starts on the front layer and eases back toward its fold, so each loop
    // shingles under the next.
    const loopBody = (t: number, free = 1): number => {
      // Straight-sided taper, widest right at the fold end — the legs draw the
      // V's line from apex to edge (a mid-body bulge reads as edge-parallel
      // strands, not a V). Returns the fold-apex node (the next stitch links it).
      push(t + p * 0.2, hw * 0.35, zf, free)
      push(t + p * 0.55, hw * 0.6, zf, free)
      push(t + p * 0.9, hw * 0.85, zf * 0.6, free)
      push(t + p + r * 0.7, hw * 0.9, zfold * 0.8, free)
      const apex = push(t + p + r, 0, zfold, free) // the fold — the head, hugging the strands it wraps
      push(t + p + r * 0.7, -hw * 0.9, zfold * 0.8, free)
      push(t + p * 0.9, -hw * 0.85, zf * 0.6, free)
      push(t + p * 0.55, -hw * 0.6, zf, free)
      push(t + p * 0.2, -hw * 0.35, zf, free)
      return apex
    }

    // Slip knot (loop 0): the pinned anchor — small and tucked, like a real one.
    push(-p * 0.2, hw * 0.3, zf * 0.5, 0)
    let prevApex = loopBody(0, 0)
    push(p * 0.05, -hw * 0.15, -zb * 0.4, 0) // dive behind toward the first bump

    for (let n = 1; n < W; n++) {
      const t = n * p
      // Back bump: the connector runs across the BACK of the previous loop.
      push(t - p * 0.65, 0, -zb)
      push(t - p * 0.3, 0, -zb)
      // Pull-through strand 1: up through the previous loop's opening, back→front.
      push(t, yin, -zb * 0.5)
      const crossUp = push(t, yin, zf * 0.1) // inside the hole
      // The new loop, lying flat on the front face.
      const apex = loopBody(t)
      // Pull-through strand 2: back down through the same opening, front→back.
      const crossDn = push(t, -yin, zf * 0.1)
      push(t, -yin, -zb * 0.5)
      links.push({ j: 0, c: n, role: 'cross', hook: crossUp, below: prevApex })
      links.push({ j: 0, c: n, role: 'cross', hook: crossDn, below: prevApex })
      prevApex = apex
    }
    // The working loop's tail (the end that would still be on the hook).
    push((W - 1) * p + p * 0.1, -hw * 0.1, -zb)

    const strand0 = new Array(nodes.length).fill(0)
    const along0 = nodes.map((_, k) => k)
    return {
      model: { nodes, dist, bend, strand: strand0, along: along0 },
      strandPath,
      links,
      yarnRadiusMm: yr,
      widthMm: W * p + r * 2,
      heightMm: (hw + yr) * 2,
      anchorPins: 11, // the slip knot (loop 0 + its dive node)
    }
  }

  // Foundation chain (row -1): a row of proud crowns, pinned (the cast-on edge the
  // first worked row hooks into). One continuous strand, left to right.
  for (let c = 0; c < W; c++) {
    push(c * sw - cw, -dh * 0.4, zh, 0)
    const crown = push(c * sw, 0, zh * 1.15, 0)
    push(c * sw + cw, -dh * 0.4, zh, 0)
    belowBack[c] = crown
    belowFront[c] = crown
  }

  // Worked rows. Each stitch: down-leg → hook UNDER the below crown → up-leg → throw
  // this stitch's crown. The work is TURNED at each row end: in the fabric's fixed
  // frame that means the hook alternates direction and the yarn continues straight
  // from where the last row ended — never floating back. The foundation is built
  // left→right (ends on the RIGHT), so the first worked row starts on the right
  // (dir = −1) and turns into it like every other row; otherwise the yarn floats
  // across from the foundation's right end to a left-hand start.
  // Post mid of the stitch below at each column — the stem a front/back-post stitch
  // rings around. Seeded to the foundation crown (row 0 has no real post below).
  const postBelow: number[] = belowBack.slice()

  for (let j = 0; j < rowTypes.length; j++) {
    const ty = yTop[j]!
    const by = j === 0 ? 0 : yTop[j - 1]!
    const dir = j % 2 === 0 ? -1 : 1
    // TURN the work: alternate rows are worked from the opposite face (right side /
    // wrong side). `fz` carries the stitch's +z/−z handedness. The hook always dives
    // to the OPPOSITE z-side of whichever loop it links, so the interlock is real on
    // either face.
    const fz = opts.noTurn ? 1 : j % 2 === 0 ? 1 : -1
    const crownThisBack: number[] = new Array(W).fill(-1)
    const crownThisFront: number[] = new Array(W).fill(-1)
    const postThis: number[] = new Array(W).fill(-1)

    for (let o = 0; o < W; o++) {
      const c = dir > 0 ? o : W - 1 - o
      const s = dir
      const x = c * sw
      const id = opts.stitchAt ? opts.stitchAt(j, c) : rowTypes[j]!
      // The turning chain up into the first row: a crocheter chains up before the
      // first stitch, leaving real slack between the foundation's end and the
      // first worked stitch. Without it the corner stitch strangles — its hook
      // gets dragged out of its dive by tension from the pinned foundation
      // (found by the audit on sl st, the shortest stitch).
      if (j === 0 && o === 0) {
        push(x - s * cw * 0.8, by + (ty - by) * 0.75, zh * 0.9 * fz)
        push(x - s * cw * 0.1, by + (ty - by) * 0.95, zh * 0.4 * fz)
      }
      // Per-stitch variants: front/back post here; hdc third loop + blo/flo live
      // in the shared plain-stitch emitter.
      const postMode = id === 'fpdc' ? 'fp' : id === 'bpdc' ? 'bp' : 'none'
      const px = ty - by // post span (tall for dc, short for sc)

      if (id === 'bobble') {
        // BOBBLE: several partial stitches worked into ONE base loop and gathered to
        // one top — a raised bump. The base genuinely hooks the crown below; the N
        // loops all rise from it, bulge forward, and meet at the gathered top (the
        // head the next row works). Continuous strand throughout; the bump pops +z.
        const bc = belowBack[c]!
        const cy = nodes[bc]!.y
        const hookZ = (nodes[bc]!.z >= 0 ? -1 : 1) * z * 1.6
        const bz = z * 5.0 // bulge boldly off the surface so it reads as a distinct berry
        const midY = cy + (ty - cy) * 0.55
        push(x + s * pw, by + px * 0.45, z * fz) // down from the previous head toward the base
        const bobbleHook = push(x, cy - dh, hookZ) // hook UNDER the crown below — the shared base
        links.push({ j, c, role: 'hook', hook: bobbleHook, below: bc })
        // SLACK OUT of the dive. The bulge (bz = +1.5yr, unsigned) used to start on the
        // very next node, so the dist+bend bonds dragged the base hook forward onto the
        // crown's own z-side (audit: j1c0 hook +0.21 vs its crown +0.42 — a same-side
        // fail). Hold the far z-side for a beat, then climb toward the ball — the extra
        // yarn absorbs the bulge's forward pull instead of transmitting it to the hook.
        push(x + s * pw * 0.5, cy - dh * 0.2, hookZ * 0.85) // still tucked to the far side, lifting off the crown
        push(x, cy + (midY - cy) * 0.35, z * 0.8) // ease up and forward into the ball
        const N = 5
        for (let k = 0; k < N; k++) {
          const ox = ((k + 0.5) / N - 0.5) * cw * 1.5 // narrow fan → a round ball, not a spread
          push(x + ox * 0.7, cy + dh * 0.8, bz * 0.45) // low on the ball, just forward
          push(x + ox, midY, bz) // the widest, most-forward bulge (the berry)
          push(x + ox * 0.55, ty - dh * 0.9, bz * 0.5) // high on the ball, heading to the gather
        }
        // SLACK INTO the gather. Come off the forward ball and settle back onto the
        // worked (WS) face BEFORE throwing the crown, so the gathered head holds its
        // face for the next row to dive under (audit: the old weak z*0.95 head, jammed
        // against the last bulge node, was dragged -0.28 -> +0.09, same side as the sc
        // above). Gather into a PROPER proud crown (zh*1.15, like any stitch) — the next
        // row then hooks it exactly as it hooks a plain head.
        push(x, ty - dh * 0.9, z * 0.9) // drop off the ball, still forward
        push(x - s * cw * 0.2, ty - dh * 0.45, z * 0.3 * fz) // ease back toward the worked face
        push(x - s * cw, ty - dh * 0.3, zh * fz)
        const crown = push(x, ty, zh * 1.15 * fz)
        push(x + s * cw, ty - dh * 0.3, zh * fz)
        crownThisBack[c] = crown
        crownThisFront[c] = crown
        postThis[c] = crown
        continue
      }

      if (postMode !== 'none') {
        // FRONT/BACK POST: instead of hooking the head, the yarn RINGS around the
        // stem of the post below (front post pops the new post PROUD on the front,
        // back post sinks it to the back). The ring threads the post and is held on
        // it by collision — a genuine wrap, not a spring. This is what builds the
        // raised/recessed columns of post-stitch ribbing + basketweave.
        const pa = postBelow[c]!
        const ay = nodes[pa]!.y
        const az = nodes[pa]!.z
        const front = postMode === 'fp' ? 1 : -1
        // Only the post BODY pops (fp proud forward, bp mildly recessed but still
        // visible); the HEAD stays at the fabric plane so the stitch-to-stitch travel
        // runs flat along the row — otherwise adjacent fp/bp heads jump z and tangle.
        const ppz = postMode === 'fp' ? z * 3.0 : -z * 2.2 // fp ribs pop forward, bp valleys sink back — the contrast IS the rib
        // A FULL two-strand post (like a dc), wrapped around the stem below and popped
        // boldly forward (fp) or back (bp). Heads stay at the PLANE so the row's travel
        // runs flat and alternating fp/bp columns don't tangle; the body pop alone
        // makes the raised ribs + recessed valleys.
        push(x + s * pw, by + px * 0.85, zh * 0.35 * fz) // leave the previous head near the plane
        push(x + s * pw, by + px * 0.52, ppz) // down-leg, popped
        push(x + s * pw, by + px * 0.22, ppz)
        // ring around the below post stem (encircle it → linked, collision-held)
        push(x + cw * 1.15, ay, az)
        const ringFar = push(x, ay - dh * 0.2, az - front * cw * 1.5) // around the far z-side of the stem
        links.push({ j, c, role: 'ring', hook: ringFar, below: pa })
        push(x - cw * 1.15, ay, az)
        push(x - s * pw, by + px * 0.22, ppz) // up-leg, popped
        const postMid = push(x - s * pw, by + px * 0.52, ppz)
        push(x - s * pw, by + px * 0.85, zh * 0.35 * fz)
        postThis[c] = postMid
        // Head at the PLANE (flat) — keeps the row connected and lets fp/bp alternate.
        push(x - s * cw, ty - dh * 0.3, zh * fz)
        const crown = push(x, ty, zh * 1.15 * fz)
        push(x + s * cw, ty - dh * 0.3, zh * fz)
        crownThisBack[c] = crown
        crownThisFront[c] = crown
        continue
      }

      // Plain stitch family (sc/hdc/dc/tr/dtr/slst/blo/flo) — the shared emitter.
      const r = emitPlainStitch(S, dims, {
        j,
        c,
        id,
        s,
        fz,
        by,
        ty,
        xCrown: x,
        bcBack: belowBack[c]!,
        bcFront: belowFront[c]!,
      })
      crownThisBack[c] = r.crownBack
      crownThisFront[c] = r.crownFront
      postThis[c] = r.postMid
    }

    for (let c = 0; c < W; c++) {
      belowBack[c] = crownThisBack[c]!
      belowFront[c] = crownThisFront[c]!
      postBelow[c] = postThis[c]!
    }
  }

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  return {
    model: { nodes, dist, bend, strand, along },
    strandPath,
    links,
    yarnRadiusMm: yr,
    widthMm: W * sw,
    heightMm: acc,
    anchorPins: 3 * W, // the foundation chain (3 nodes per column)
  }
}
