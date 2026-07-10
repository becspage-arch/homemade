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
 */

import { STITCHES } from './dictionary'
import { createStrand, BASE_ROW_YR, type BuiltContinuous } from './yarnPath'

/** Which fabric face (+1/−1) a stitch is pulled to. Stockinette: always +1.
 *  Garter: flips per course. 1×1 rib: per column, constant up the column. */
export type KnitFace = 'stockinette' | 'garter' | 'rib'

export function buildKnit(
  courses: number,
  W: number,
  yarnRadiusMm: number,
  face: KnitFace,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const swk = yr * STITCHES.k.gaugeYr
  const courseH = yr * BASE_ROW_YR * STITCHES.k.heightFactor
  const S = createStrand()
  const { nodes, push, links } = S

  // The pull side for stitch (course j, column c) in the fabric frame.
  //  - stockinette: every loop to the same face (+1);
  //  - garter: the whole course flips each row (+1, −1, +1 …);
  //  - rib: each column holds its face for the whole height (even +1, odd −1),
  //    independent of the course — that constancy IS the vertical rib.
  const faceSign = (j: number, c: number): number =>
    face === 'rib' ? (c % 2 === 0 ? 1 : -1) : face === 'garter' ? (j % 2 === 0 ? 1 : -1) : 1

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
    for (let o = 0; o < W; o++) {
      const c = s > 0 ? o : W - 1 - o
      const x = c * swk
      const hb = headBelow[c]!
      const fz = faceSign(j, c) // pull side of THIS stitch (per-column for rib)
      // Sinker in: low and a full layer behind, tucked under the old head.
      push(x - s * 0.34 * swk, by - 0.3 * courseH, -zBack * fz)
      // The yarn comes forward UNDER the old head's bottom edge (this is where
      // the strand really crosses from the purl side to the face side — without
      // this routing node the sinker→leg kink pulls the crossing back through
      // the head before collision can hold it; the audit measured exactly that).
      push(x - s * 0.26 * swk, by - 0.16 * courseH, yr * 0.2 * fz)
      // Leg 1 crosses the old head's mouth IN FRONT of it (the interlock).
      const L1 = push(x - s * 0.26 * swk, by, zFace * fz)
      links.push({ j, c, role: 'through', hook: L1, below: hb, zSign: fz })
      // Leg 1 spreads up the V…
      push(x - s * 0.42 * swk, ty - 0.3 * courseH, zLegTop * fz)
      // …and eases over into the head, falling toward the back.
      push(x - s * 0.34 * swk, ty - 0.08 * courseH, -zShoulder * fz)
      const apex = push(x, ty, -zBack * fz) // the head — next course draws through it
      push(x + s * 0.34 * swk, ty - 0.08 * courseH, -zShoulder * fz)
      // Leg 2 back down through the same mouth.
      push(x + s * 0.42 * swk, ty - 0.3 * courseH, zLegTop * fz)
      const L2 = push(x + s * 0.26 * swk, by, zFace * fz)
      links.push({ j, c, role: 'through', hook: L2, below: hb, zSign: fz })
      // …and back under the old head's edge to the sinker, mirroring the way in.
      push(x + s * 0.26 * swk, by - 0.16 * courseH, yr * 0.2 * fz)
      // Sinker out toward the next stitch.
      push(x + s * 0.34 * swk, by - 0.3 * courseH, -zBack * fz)
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
