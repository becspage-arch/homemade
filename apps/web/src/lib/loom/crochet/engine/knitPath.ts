/**
 * KNIT path builder — a new craft on the SAME engine (relaxer, audit, pipeline,
 * dictionary), per the loom-stitch skill: extend, don't fork.
 *
 * Weft knitting: every stitch is a loop drawn THROUGH the loop below. In the
 * fabric frame each loop has two LEGS (the V you see on the knit face), a HEAD
 * arc at the top (which the next course's loop is drawn through), and SINKER
 * arcs connecting neighbouring loops along the bottom of the course.
 *
 * The genuine topology, initialised threaded and HELD by self-collision:
 *  - both legs of the new loop pass the old head's mouth on the fabric's FACE
 *    side (in front of it) — recorded as 'through' links the audit verifies;
 *  - the head is laid toward the BACK (the next course's legs will cross in
 *    front of it — that's what hides heads on the knit face);
 *  - the sinker runs low and behind, tucked under the old head (heads + sinkers
 *    are exactly what you see as ridges on the purl side).
 * Nothing is pinned but the cast-on; no springs; the V columns of stockinette
 * and the ridges of garter must EMERGE in relaxation.
 *
 * Flat knitting is worked turned. STOCKINETTE (knit a course, turn, purl back)
 * pulls every loop to the same fabric face — in the fabric frame the worked
 * face never flips. GARTER (knit every course) alternates the pull side — the
 * face flips each course (`flip`), and the purl ridges appear on both faces.
 *
 * 1×1 RIB (`rib`) is the third pull-side pattern: a PURL is a knit loop pulled to
 * the OTHER face, and in rib you knit one column, purl the next, all the way up —
 * on the turned (WS) course you purl the knit columns and knit the purl columns to
 * keep each column's face constant. Working that through the fabric frame, each
 * column holds ONE face for its whole height (even columns +z, odd −z) — the pull
 * side is per-COLUMN, constant across courses, NOT per-course like garter. A purl
 * column is just a knit column seen from behind; the vertical rib is the two face
 * families side by side, and the sinker between a knit and a purl column genuinely
 * crosses front↔back (the purl-bump mechanic + the accordion). See STITCH_ENGINE §8d.
 *
 * KNIT DEPTH (2026-07-11): a per-(course,column) STITCH OP function lets a course
 * mix plain knits with the shaping stitches on the SAME thickness budget:
 *  - 'yo' (yarn-over) — the strand simply passes OVER the needle with NO loop
 *    below it: a bare arc up to a head, its legs held HIGH so the fabric under it
 *    stays open. That open gap IS the eyelet; a yo records no 'through' link of its
 *    own (it genuinely interlocks with nothing below — the next course draws
 *    through its head from above). See §8d-yo.
 *  - 'k2tog' / 'ssk' — one new loop drawn through TWO heads below together (two
 *    'through' links, both audited). k2tog gathers the head under it + its LEFT
 *    neighbour and leans the merged head RIGHT; ssk gathers under + RIGHT and leans
 *    LEFT — the opposite lean is the pair's identity. The analogue of crochet's
 *    emitDecrease, with knit through-links.
 * A yo (makes 1, consumes 0) paired with a k2tog/ssk (makes 1, consumes 2) is
 * width-neutral, so an eyelet course stays W wide with no variable-width machinery.
 * Absent ops → every stitch is a plain 'k' and the geometry is bit-identical to the
 * locked stockinette/rib/garter (verified by re-audit).
 */

import { STITCHES } from './dictionary'
import { createStrand, BASE_ROW_YR, type BuiltContinuous } from './yarnPath'

/** Which fabric face (+1/−1) a stitch is pulled to. Stockinette: always +1.
 *  Garter: flips per course. 1×1 rib: per column, constant up the column.
 *  Seed (moss): CHECKERBOARD — alternates every stitch AND every course, so every
 *  stitch sits between four opposite-face neighbours (the pebbled texture). */
export type KnitFace = 'stockinette' | 'garter' | 'rib' | 'seed'

/** A per-stitch operation on a knit course.
 *  'k'     = plain knit — one loop through the ONE head below (default everywhere).
 *  'yo'    = yarn-over — a bare loop over the needle, no head below (the eyelet).
 *  'k2tog' = right-leaning single decrease — through the head below + its LEFT neighbour.
 *  'ssk'   = left-leaning single decrease — through the head below + its RIGHT neighbour. */
export type KnitStitchOp = 'k' | 'yo' | 'k2tog' | 'ssk'

export function buildKnit(
  courses: number,
  W: number,
  yarnRadiusMm: number,
  face: KnitFace,
  /** Column spacing scale (default 1). <1 packs stitches horizontally. */
  gaugeScale = 1,
  /** Course-height scale (default 1). <1 packs courses vertically — garter's ridge
   *  rows pack tight in real fabric, so it uses <1 to close its see-through gaps.
   *  Stockinette + rib leave both at 1, so their geometry is bit-identical. */
  courseScale = 1,
  /** Optional per-(course,column) op (yo / k2tog / ssk). Absent → every stitch a
   *  plain 'k' (existing stockinette/garter/rib geometry, untouched). `W` is passed
   *  so a recipe pattern can place edge/interior columns. Only meaningful on
   *  stockinette (the shaping stitches carry no garter corrugation / rib face). */
  ops?: (j: number, c: number, W: number) => KnitStitchOp,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const swk = yr * STITCHES.k.gaugeYr * gaugeScale
  const courseH = yr * BASE_ROW_YR * STITCHES.k.heightFactor * courseScale
  const S = createStrand()
  const { nodes, push, links } = S

  // The pull side for stitch (course j, column c) in the fabric frame.
  //  - stockinette: every loop to the same face (+1);
  //  - garter: the whole course flips each row (+1, −1, +1 …);
  //  - rib: each column holds its face for the whole height (even +1, odd −1),
  //    independent of the course — that constancy IS the vertical rib;
  //  - seed: the CHECKERBOARD (+1 where j+c is even) — k1 p1 across the course
  //    AND knits over purls up the columns (moss texture in every direction).
  const faceSign = (j: number, c: number): number =>
    face === 'seed'
      ? ((j + c) % 2 === 0 ? 1 : -1)
      : face === 'rib'
        ? (c % 2 === 0 ? 1 : -1)
        : face === 'garter'
          ? (j % 2 === 0 ? 1 : -1)
          : 1

  // Real stockinette is about two yarn-diameters THICK: legs on the face,
  // heads + sinkers a full layer behind. The initial relief must provide that
  // whole budget — seeded thinner (±0.6yr), every course's legs squeezed the
  // course below's leg-tops backward and the cascade collapsed each course's
  // crossings onto its own head plane (audit: dz → 0 everywhere). Collision
  // then squashes this toward natural fabric thickness while PRESERVING the
  // face/back order, because nothing starts within a collision diameter of
  // flipping.
  const zFace = yr * 1.1 // leg crossings (the V face)
  const zLegTop = yr * 0.9
  const zBack = yr * 1.0 // head apexes + sinkers (the purl side)
  const zShoulder = yr * 0.5

  // One PLAIN knit stitch — the strand's excursion for a loop drawn through the
  // single head `hb` below it. Extracted verbatim from the original inner block so
  // the default (ops-free) course is bit-identical to the locked stockinette/rib/
  // garter geometry; the shaping ops below share the same z budget + routing.
  const emitPlainKnit = (
    j: number, c: number, x: number, hb: number, fz: number, bz: number, s: number, by: number, ty: number,
  ): number => {
    // Sinker in: low and a full layer behind, tucked under the old head.
    push(x - s * 0.34 * swk, by - 0.3 * courseH, -zBack * fz + bz)
    // The yarn comes forward UNDER the old head's bottom edge (this is where the
    // strand really crosses from the purl side to the face side — without this
    // routing node the sinker→leg kink pulls the crossing back through the head
    // before collision can hold it; the audit measured exactly that).
    push(x - s * 0.26 * swk, by - 0.16 * courseH, yr * 0.2 * fz + bz)
    // Leg 1 crosses the old head's mouth IN FRONT of it (the interlock).
    const L1 = push(x - s * 0.26 * swk, by, zFace * fz + bz)
    links.push({ j, c, role: 'through', hook: L1, below: hb, zSign: fz })
    // Leg 1 spreads up the V…
    push(x - s * 0.42 * swk, ty - 0.3 * courseH, zLegTop * fz + bz)
    // …and eases over into the head, falling toward the back.
    push(x - s * 0.34 * swk, ty - 0.08 * courseH, -zShoulder * fz + bz)
    const apex = push(x, ty, -zBack * fz + bz) // the head — next course draws through it
    push(x + s * 0.34 * swk, ty - 0.08 * courseH, -zShoulder * fz + bz)
    // Leg 2 back down through the same mouth.
    push(x + s * 0.42 * swk, ty - 0.3 * courseH, zLegTop * fz + bz)
    const L2 = push(x + s * 0.26 * swk, by, zFace * fz + bz)
    links.push({ j, c, role: 'through', hook: L2, below: hb, zSign: fz })
    // …and back under the old head's edge to the sinker, mirroring the way in.
    push(x + s * 0.26 * swk, by - 0.16 * courseH, yr * 0.2 * fz + bz)
    // Sinker out toward the next stitch.
    push(x + s * 0.34 * swk, by - 0.3 * courseH, -zBack * fz + bz)
    return apex
  }

  // A YARN-OVER: the strand passes OVER the needle with nothing below it — a real
  // OPEN LOOP, not a bare arc. The arc version gave up its space: the fabric packs
  // to uniform density under collision (x is free) and the "hole" closed completely
  // (probe: 0.69yr open gap, same as plain). So the yo is FED a wide loop — its two
  // sides spread ±`yoW` so its interior is wider than a collision diameter and stays
  // open (the crochet chain-space mechanism: a loop fed enough yarn holds a mouth
  // that collision can't pinch shut, and the next course drawing through its apex
  // keeps it from collapsing). The mouth faces +z (the viewer) and its bottom is
  // open toward the course below — that open span IS the eyelet. No 'through' link:
  // a yo genuinely interlocks with nothing below. fz = +1 for the stockinette face.
  const yoW = 0.62 * swk // half-width of the open loop (interior ≈ 2·yoW ≈ 3.2yr > collision 2.5yr)
  const emitYo = (x: number, fz: number, s: number, by: number, ty: number): number => {
    push(x - s * 0.30 * swk, by - 0.10 * courseH, -zShoulder * fz) // leave the previous stitch, low + behind
    push(x - yoW, by + 0.18 * courseH, zFace * fz) // LEFT side of the mouth, forward at the interlock plane
    push(x - yoW * 0.7, ty - 0.28 * courseH, zLegTop * fz) // up the left of the ring
    const apex = push(x, ty, -zBack * fz) // the yo head (back) — the next course draws through it
    push(x + yoW * 0.7, ty - 0.28 * courseH, zLegTop * fz) // down the right of the ring
    push(x + yoW, by + 0.18 * courseH, zFace * fz) // RIGHT side of the mouth
    push(x + s * 0.30 * swk, by - 0.10 * courseH, -zShoulder * fz) // toward the next stitch
    return apex
  }

  // A SINGLE DECREASE — one new loop drawn through TWO heads below together. The
  // two legs pass in front of the two gathered heads (two audited 'through'
  // links); the merged head lands on the stitch's OWN column `xCol`, while the
  // gathered pair's midpoint sits off to one side — so the lean EMERGES from the
  // geometry: k2tog gathers the head below + its LEFT neighbour, midpoint to the
  // left of the on-column head → the merged stitch leans RIGHT; ssk gathers below
  // + RIGHT, midpoint to the right → leans LEFT. (The mirror is the pair's whole
  // identity.) Keeping the head on the lattice also lets the course ABOVE sit
  // cleanly — a head parked off-column dragged the next course's legs sideways
  // (audit: 2.1yr slips on the plain course over each decrease). Legs sit at their
  // gathered head's x so the interlock offset starts ~0.
  const emitDec = (
    j: number, c: number, xCol: number, hbL: number, hbR: number, fz: number, s: number, by: number, ty: number,
  ): number => {
    const apexX = xCol // the merged head rides its own column; the lean is the off-centre gather
    // Enter from the work-direction side; L1 hooks the entering head, L2 the
    // exiting one (so BOTH gathered heads are genuinely passed through).
    const hbIn = s > 0 ? hbL : hbR
    const hbOut = s > 0 ? hbR : hbL
    const xin = nodes[hbIn]!.x
    const xout = nodes[hbOut]!.x
    push(xin - s * 0.20 * swk, by - 0.30 * courseH, -zBack * fz) // sinker in
    push(xin - s * 0.08 * swk, by - 0.16 * courseH, yr * 0.2 * fz) // under the entering head's edge
    const L1 = push(xin, by, zFace * fz) // leg 1 in front of the entering head's mouth
    links.push({ j, c, role: 'through', hook: L1, below: hbIn, zSign: fz })
    push(xin + (apexX - xin) * 0.5, ty - 0.34 * courseH, zLegTop * fz) // rise toward the leaning head
    push(apexX - 0.30 * swk, ty - 0.06 * courseH, -zShoulder * fz)
    const apex = push(apexX, ty, -zBack * fz) // the merged head — leans off the pair
    push(apexX + 0.30 * swk, ty - 0.06 * courseH, -zShoulder * fz)
    push(xout + (apexX - xout) * 0.5, ty - 0.34 * courseH, zLegTop * fz) // down toward leg 2
    const L2 = push(xout, by, zFace * fz) // leg 2 in front of the exiting head's mouth
    links.push({ j, c, role: 'through', hook: L2, below: hbOut, zSign: fz })
    push(xout + s * 0.08 * swk, by - 0.16 * courseH, yr * 0.2 * fz) // under the exiting head's edge
    push(xout + s * 0.20 * swk, by - 0.30 * courseH, -zBack * fz) // sinker out
    return apex
  }

  // Cast-on: a pinned course of head arcs (the anchor edge the first course is
  // drawn through), laid a full layer BACK from the column's own face — like every
  // settled head. For rib the odd (purl) columns face −z, so their cast-on head
  // sits at +zBack (its bump on the +z front) and the first purl leg passes in
  // front of it on the −z side. For stockinette/garter every course-0 face is +1,
  // so this is exactly the old −zBack cast-on (no change to those).
  const headBelow: number[] = []
  for (let c = 0; c < W; c++) {
    const x = c * swk
    const cf = faceSign(0, c)
    push(x - 0.4 * swk, -0.3 * courseH, -zShoulder * cf, 0)
    const apex = push(x, 0, -zBack * cf, 0)
    push(x + 0.4 * swk, -0.3 * courseH, -zShoulder * cf, 0)
    headBelow.push(apex)
  }

  for (let j = 0; j < courses; j++) {
    const by = j * courseH
    const ty = (j + 1) * courseH
    const s = j % 2 === 0 ? -1 : 1 // cast-on ends right → first course starts right
    const headThis: number[] = new Array(W).fill(-1)

    // Resolve this course's ops (if any) and VERIFY the pattern is width-neutral:
    // every head below must be consumed exactly once (an orphaned head = a dropped
    // stitch; a doubly-consumed head = a miscounted pattern). This is the knit
    // analogue of the shaped builder's consume-exactly-the-row-below guard.
    const opOf = (c: number): KnitStitchOp => (ops ? ops(j, c, W) : 'k')
    if (ops) {
      const consumed = new Array(W).fill(0)
      for (let c = 0; c < W; c++) {
        const op = opOf(c)
        if (op === 'k') consumed[c]++
        else if (op === 'yo') void 0 // consumes nothing (the eyelet)
        else if (op === 'k2tog') { consumed[c - 1]++; consumed[c]++ } // under + LEFT
        else if (op === 'ssk') { consumed[c]++; consumed[c + 1]++ } // under + RIGHT
      }
      const bad = consumed.findIndex((n) => n !== 1)
      if (bad >= 0)
        throw new Error(`knit course ${j}: head below column ${bad} consumed ${consumed[bad]}× (pattern must consume each head exactly once — width-neutral)`)
    }

    for (let o = 0; o < W; o++) {
      const c = s > 0 ? o : W - 1 - o
      const x = c * swk
      const hb = headBelow[c]!
      const fz = faceSign(j, c) // pull side of THIS stitch (per-column for rib)
      // GARTER corrugation: each course's WHOLE loop shifts toward its pull face.
      // With mirrored absolute z alone, course j+1's legs initialise on the same
      // side as course j's head with ~0.1yr clearance and the interlock loses its
      // side (audit: the first course slid sideways). The corrugation is real —
      // garter fabric is ~2× stockinette's thickness, alternating ridge rows — and
      // it restores a full collision diameter between each leg crossing and the head
      // it passes. Only garter needs it; stockinette (fz constant) AND rib
      // (per-column, its own audit passed without it) keep bz = 0, so both stay
      // bit-identical. faceSign is uniform per garter course, so per-stitch = their
      // old per-course value.
      // SEED shares the corrugation, per-stitch: a seed stitch's head-below has
      // the OPPOSITE face (checkerboard up the column, same relation as garter's
      // per-course flip), so without the shift its legs initialise ~0.1yr from
      // the head they pass and the interlock loses its side — the exact garter
      // failure. Physically real too: seed fabric is thick pebbled bumps, each
      // stitch popping to its own face. Gate stays off stockinette + rib.
      const bz = face === 'garter' || face === 'seed' ? yr * 0.7 * fz : 0
      const op = opOf(c)
      let apex: number
      if (op === 'yo') apex = emitYo(x, fz, s, by, ty)
      else if (op === 'k2tog') apex = emitDec(j, c, x, headBelow[c - 1]!, headBelow[c]!, fz, s, by, ty)
      else if (op === 'ssk') apex = emitDec(j, c, x, headBelow[c]!, headBelow[c + 1]!, fz, s, by, ty)
      else apex = emitPlainKnit(j, c, x, hb, fz, bz, s, by, ty)
      headThis[c] = apex
    }
    for (let c = 0; c < W; c++) headBelow[c] = headThis[c]!
  }

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand, along },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: W * swk,
    heightMm: courses * courseH,
    anchorPins: 3 * W,
  }
}
