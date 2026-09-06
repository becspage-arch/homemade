/**
 * Stitch dictionary — each stitch defined ONCE by its parameters, not its picture.
 * THE single source of truth: topology params (STITCHES), and the full per-swatch
 * recipe (SWATCH_RECIPES: gauge, rows, view, audit size, reference photo, lock
 * status). The render driver, the audit, and the one-command pipeline all consume
 * this table, so they can never drift apart — and adding a stitch is one entry
 * here + its yarn-path excursion, nothing else.
 *
 * For the crochet basics the defining topology difference is HEIGHT — how many
 * times the yarn is wrapped / how tall the post is. `heightFactor` scales a
 * stitch's loop height off the base (sc) row height; the relaxer resolves the
 * actual shape from there. `gaugeYr` is column spacing in yarn radii — set per
 * stitch from its REAL reference photo (audit 2026-07-02/03): sc/hdc pack dense,
 * dc's posts lean together, treble opens into channels.
 */

import type { KnitStitchOp } from './knitPath'

export type StitchId =
  | 'ch' | 'slst' | 'sc' | 'hdc' | 'dc' | 'tr' | 'dtr'
  | 'scblo' | 'scflo' | 'fpdc' | 'bpdc' | 'bobble' | 'picot'
  | 'k'

/**
 * One shaping instruction, in crochet-pattern terms, applied to the row's stitch:
 *   'st'    = one plain stitch into the next below-crown   (consumes 1, makes 1)
 *   'inc'   = TWO full stitches into the next below-crown  (consumes 1, makes 2)
 *   'dec'   = st2tog: one stitch over the next TWO below-crowns (consumes 2, makes 1)
 *   'shell' = SHELL_N stitches into ONE below-crown, fanned (consumes 1, makes SHELL_N)
 *   'skip'  = pass a below-crown without working it (consumes 1, makes 0) — what
 *             balances a shell's extra width so the fabric stays constant-width.
 *   'cross' = crossed pair (crossed dc): skip one, work into the NEXT, then work
 *             into the skipped one — two stitches whose legs genuinely cross in
 *             an X (consumes 2, makes 2). The second-worked stitch crosses in
 *             FRONT of the first (the classic look).
 * A row is a ShapeOp[] in WORK order; its consumption must exactly match the row
 * below (the builder throws otherwise — a mis-counted pattern is a bug, not fabric).
 */
export type ShapeOp = 'st' | 'inc' | 'dec' | 'shell' | 'skip' | 'cross'

/** Stitches worked into one base for a shell (a classic 5-dc shell). */
export const SHELL_N = 5

export interface StitchDef {
  id: StitchId
  /** Post height as a multiple of the base (sc) row height. */
  heightFactor: number
  /** Column spacing (gauge) in yarn radii — calibrated against the reference photo. */
  gaugeYr: number
  /** How many top loops the stitch leaves (its "head"). Always 2 for these. */
  topLoops: number
  /**
   * THE FABRIC CELL (§8f — the close-range look pass). The four fields below are
   * this stitch's cell measured against its REAL published gauge, in yarn radii,
   * instead of the legacy shared lattice. All are optional and every absent one
   * falls back to exactly the value the library used before, so a stitch without
   * them is bit-identical.
   *
   * Row pitch, in yarn radii. Absent → `BASE_ROW_YR · heightFactor`, the legacy
   * shared lattice. Set it from the stitch's published rows-per-10 cm.
   */
  rowYr?: number
  /**
   * Post half-width (the down-leg / up-leg straddle), in yarn radii. Absent →
   * the shared `stitchDims` value. Below about half a rendered yarn diameter the
   * two strands of the post overlap into ONE plump tube and the stitch reads as a
   * bean rather than a post — the measured cause of the close-range "fat coil".
   */
  postHalfYr?: number
  /** Crown entry/exit half-width, in yarn radii. Absent → the shared value. */
  crownHalfYr?: number
  /**
   * Head-loop half-span, in yarn radii. Absent / 0 → the legacy three-node crown
   * BUMP. Set > 0 and the stitch throws a genuine two-strand head LOOP instead:
   * the strand runs back along the row top, turns at the loop's tail and comes
   * forward again past this stitch's column, so the head has a real perimeter, a
   * real hole under it, and TWO visible strands (the paired-loop top of a real
   * stitch) rather than one continuous proud cord along the row.
   */
  headLoopYr?: number
  /**
   * Scales this stitch's RELIEF budget (`z` and `zh` in stitchDims) — how far
   * out of the fabric plane the construction is allowed to work. Absent → 1, the
   * shared value. Fabric thickness is a real budget (§8d): a re-cut stitch whose
   * legs lie flat and whose head lies flat has to get its two-diameter thickness
   * from somewhere, and this is the dial.
   */
  reliefScale?: number
  /**
   * How many YARN-OVERS the stitch is made with (§8f-3) — dc 1, tr 2, dtr 3.
   * Each one ends up as a closed COLLAR of yarn round the post, evenly spaced up
   * its length: the bands a crocheter counts to name the stitch, and where the
   * missing third of a tall stitch's yarn was hiding. Absent / 0 → the bare
   * two-leg post, so a stitch made with no yarn-over is bit-identical.
   */
  yarnOvers?: number
  /**
   * The collar's half-depth in yarn radii (absent → 1). With the post's own
   * half-width it sets how much yarn one collar spends — the dial that lands a
   * tall stitch's yarn-per-stitch on its real published figure.
   */
  yarnOverYr?: number
}

export const STITCHES: Record<StitchId, StitchDef> = {
  ch: { id: 'ch', heightFactor: 0.5, gaugeYr: 2.2, topLoops: 2 }, // chain gauge = its pull-through pitch (yarnPath ch branch)
  // sl st — the shortest worked stitch. Real slip-stitch fabric runs ~15 sts and a
  // very short ~28 rows / 10 cm: a row is barely taller than the yarn.
  slst: {
    id: 'slst', heightFactor: 0.8, gaugeYr: 2.55, topLoops: 2,
    rowYr: 1.55, postHalfYr: 0.99, crownHalfYr: 0.5, headLoopYr: 1.55, reliefScale: 1.3,
  },
  // sc — the workhorse, re-cut to its REAL cell 2026-09-05 (§8f close-range pass).
  // Measured against published worsted-cotton figures the old cell was ~0.66× real
  // size relative to the yarn we draw, which left the two strands of every post
  // 0.39 of a yarn diameter apart: they merged into one lobe, the crown bumps
  // merged into a proud cord, and there was nowhere for a pinprick hole to be.
  // 14–16 sts / 10 cm → 1.6 rendered diameters of pitch; 16–18 rows / 10 cm → 1.4.
  sc: {
    id: 'sc', heightFactor: 1.0, gaugeYr: 2.7, topLoops: 2,
    rowYr: 2.4, postHalfYr: 1.05, crownHalfYr: 0.55, headLoopYr: 2.0, reliefScale: 1.3,
  },
  // hdc (UK htr) — ~12-14 sts and ~10-12 rows / 10 cm in worsted: 1.85 rendered
  // diameters of pitch, 2.2 of row. The row figure is its OWN published gauge, not
  // sc's row pitch times a heightFactor — the real ratio is not the one the
  // heightFactor carries.
  hdc: {
    id: 'hdc', heightFactor: 1.45, gaugeYr: 3.15, topLoops: 2,
    rowYr: 3.74, postHalfYr: 1.22, crownHalfYr: 0.6, headLoopYr: 2.33, reliefScale: 1.3,
  },
  // dc (UK tr) — ~11-13 sts and ~6-7 rows / 10 cm: pitch 2.0 d, row 3.7 d. Posts
  // lean on each other into slits, not gaps.
  dc: {
    id: 'dc', heightFactor: 3.2, gaugeYr: 3.4, topLoops: 2,
    rowYr: 6.29, postHalfYr: 1.32, crownHalfYr: 0.65, headLoopYr: 2.52, reliefScale: 1.3,
    yarnOvers: 1, yarnOverYr: 1.0,
  },
  // tr — ~10-11 sts and ~4.5-5 rows / 10 cm: pitch 2.3 d, row 5.0 d. Taller means
  // airier: open channels between the posts.
  tr: {
    id: 'tr', heightFactor: 4.2, gaugeYr: 3.91, topLoops: 2,
    rowYr: 8.5, postHalfYr: 1.52, crownHalfYr: 0.7, headLoopYr: 2.9, reliefScale: 1.3,
    yarnOvers: 2, yarnOverYr: 1.0,
  },
  // dtr — taller again: pitch 2.5 d, row 6.5 d.
  dtr: {
    id: 'dtr', heightFactor: 5.4, gaugeYr: 4.25, topLoops: 2,
    rowYr: 11.05, postHalfYr: 1.65, crownHalfYr: 0.75, headLoopYr: 3.15, reliefScale: 1.3,
    yarnOvers: 3, yarnOverYr: 1.0,
  },
  // sc worked into back-loop-only / front-loop-only: same height as sc; the loop
  // left unworked floats as a horizontal ridge (handled in yarnPath by loopMode).
  scblo: {
    id: 'scblo', heightFactor: 1.0, gaugeYr: 2.7, topLoops: 2,
    rowYr: 2.4, postHalfYr: 1.05, crownHalfYr: 0.55, headLoopYr: 2.0, reliefScale: 1.3,
  },
  scflo: {
    id: 'scflo', heightFactor: 1.0, gaugeYr: 2.7, topLoops: 2,
    rowYr: 2.4, postHalfYr: 1.05, crownHalfYr: 0.55, headLoopYr: 2.0, reliefScale: 1.3,
  },
  // front/back post dc: dc-height, but worked AROUND the post below (yarnPath rings
  // the stem). fp pops proud, bp recedes — the basis of post ribbing + basketweave.
  fpdc: {
    id: 'fpdc', heightFactor: 3.0, gaugeYr: 2.9, topLoops: 2,
    // §8f-7: headLoopYr is the same fraction of the stitch's own pitch dc carries
    // (2.52 of 3.4), so the head spans the stitch and the post's two legs have
    // the two ends of a real loop to splay to instead of a three-node bump.
    rowYr: 6.29, postHalfYr: 1.13, crownHalfYr: 0.65, headLoopYr: 2.15, reliefScale: 1.3,
  }, // post ribbing packs tighter than plain dc — the ribs touch into solid fabric
  bpdc: {
    id: 'bpdc', heightFactor: 3.0, gaugeYr: 2.9, topLoops: 2,
    rowYr: 6.29, postHalfYr: 1.13, crownHalfYr: 0.65, headLoopYr: 2.15, reliefScale: 1.3,
  },
  // bobble: several partial dc in one stitch gathered to one top → a raised bump.
  // Usually dotted on an sc background, so it borrows the row's height and just
  // bulges forward; this factor only applies to an all-bobble row.
  bobble: {
    id: 'bobble', heightFactor: 1.4, gaugeYr: 3.45, topLoops: 2,
    rowYr: 3.36, postHalfYr: 1.34, crownHalfYr: 0.65, reliefScale: 1.3,
  },
  // picot: an sc whose head carries a small closed chain loop (ch 3, sl st back
  // into the sc's own head) — a decorative nub, classically on an edge row.
  // Same body as sc; the loop is an excursion after the crown (yarnPath).
  picot: {
    id: 'picot', heightFactor: 1.0, gaugeYr: 2.7, topLoops: 2,
    rowYr: 2.4, postHalfYr: 1.05, crownHalfYr: 0.55, headLoopYr: 2.0, reliefScale: 1.3,
  },
  // KNIT (new craft, same engine — own path builder in knitPath.ts). Stockinette
  // stitches are a touch wider than tall: ~5 sts + ~7 rows per inch in worsted.
  k: { id: 'k', heightFactor: 1.1, gaugeYr: 2.6, topLoops: 2 },
}

/** Row pitch per unit heightFactor (sc short, dc tall), in yarn radii. */
export const BASE_ROW_YR = 1.55

/**
 * This stitch's ROW PITCH in yarn radii — its own measured cell height (§8f) if
 * it declares one, otherwise the legacy shared lattice `BASE_ROW_YR · heightFactor`.
 * One helper so the grid, shaped, round, sphere and knit builders can never
 * disagree. It lives here, beside `STITCHES`, because it reads nothing else:
 * `sphereProfile.ts` needs it without dragging the whole path builder in.
 */
export const rowPitchYr = (id: StitchId): number =>
  STITCHES[id].rowYr ?? BASE_ROW_YR * STITCHES[id].heightFactor

/**
 * Everything needed to build, verify, and render one standard swatch. Keys are
 * the pipeline's swatch names: every StitchId plus the pattern aliases
 * ('postrib' = alternating fp/bp ribbing, 'basketweave' = fp/bp blocks,
 * 'bobbles' = bobbles dotted on an sc ground).
 */
export type SwatchArg =
  | StitchId | 'postrib' | 'basketweave' | 'bobbles'
  | 'scinc' | 'scdec' | 'hdcinc' | 'hdcdec' | 'dcinc' | 'dcdec'
  | 'shell' | 'vstitch' | 'crossed'
  | 'mrdisc' | 'stockinette' | 'garter' | 'knitrib' | 'ball'
  | 'yo' | 'k2tog' | 'ssk' | 'seed' | 'cable'

export interface SwatchRecipe {
  /** The dictionary stitch driving gauge + row height for this swatch. */
  stitch: StitchId
  /** Worked rows in the standard swatch (0 = the foundation chain alone). */
  rows: number
  /** Stitches per row for the standard audit/render swatch. */
  auditW: number
  /** Per-cell override for mixed-stitch swatches (ribbing, basketweave, dotted bobbles). */
  pattern?: (j: number, c: number) => StitchId
  /**
   * Which path builder makes this swatch. Default = the flat grid builder
   * (buildContinuous). 'shaped' = variable-width rows (increases/decreases,
   * needs shapeRows). 'round' = worked in the round off a magic ring (needs
   * roundCounts). 'knit' = the knit path builder (loops through loops).
   */
  builder?: 'shaped' | 'round' | 'knit' | 'sphere'
  /** builder 'shaped': the per-row shaping ops, work order, off auditW foundation stitches. */
  shapeRows?: ShapeOp[][]
  /** builder 'round': stitches per round of the spiral (each round +6 = flat disc). */
  roundCounts?: number[]
  /** builder 'knit': true = garter (worked face alternates per course); false/absent = stockinette. */
  knitFlip?: boolean
  /**
   * builder 'knit': the pull-side pattern. 'stockinette' (every loop one face),
   * 'garter' (face flips per course), 'rib' (per-column face → 1×1 rib), 'seed'
   * (checkerboard face → moss texture). Takes precedence over knitFlip; absent
   * falls back to knitFlip ? garter : stockinette.
   */
  knitFace?: 'stockinette' | 'garter' | 'rib' | 'seed'
  /**
   * builder 'knit': per-swatch density scales (default 1). knitCourseScale < 1
   * packs courses vertically, knitGaugeScale < 1 packs columns horizontally.
   * Garter uses them to close its see-through gaps (its ridge rows pack tight in
   * real fabric); stockinette + rib leave them 1, so their geometry is untouched.
   */
  knitGaugeScale?: number
  knitCourseScale?: number
  /**
   * builder 'knit': per-(course,column) stitch op (yo / k2tog / ssk / k). `W` is
   * passed so the pattern can place edge vs interior columns. Drives eyelet + knit
   * decrease swatches; absent → every stitch a plain 'k' (locked stockinette/rib/
   * garter geometry untouched). The pattern MUST be width-neutral per course
   * (buildKnit throws if any head below isn't consumed exactly once).
   */
  knitStitch?: (j: number, c: number, W: number) => KnitStitchOp
  /**
   * builder 'knit': 2×2 LEFT cable crosses (C4F) — on course j, columns c..c+3
   * swap in pairs (front pair travels left in front, back pair right behind).
   * Real crossing yarn held by collision. Stockinette ground only.
   */
  knitCables?: { j: number; c: number }[]
  /**
   * builder 'knit': PURL columns on a stockinette ground (per-column face, like
   * rib — constant up the column, corrugation-free). Used to sink recessed purl
   * GUTTERS flanking a cable column so the raised cable reads as a braided rope
   * in reverse-stockinette valleys. Absent → plain stockinette (bit-identical).
   */
  knitPurlCols?: number[]
  /** builder 'sphere': stitches around the equator (sets the ball's size). */
  equatorCount?: number
  /** Chain relaxes with its own profile (soft squash + table floor); rounds hold
   *  their radius; curved surfaces hold their worked latitude (the stuffing). */
  relaxProfile: 'worked' | 'chain' | 'round' | 'surface'
  /** Hero camera tilt (0 = flat top-down; 16 = tall posts; 40 = side-on for relief). */
  tiltDeg: number
  /** Render ply twist (0.1 = rustic wool; 0.05 = calmer, for clean columns). */
  twist: number
  /**
   * The real swatch photo this stitch is CALIBRATED against (download to
   * .loom-scratch for comparison only — an internal fixture, never shipped).
   */
  referenceUrl: string
  /**
   * locked   = Rebecca signed off ours vs the reference.
   * reverify = locked once, but the Phase-1b reference re-comparison is unfinished.
   * wip      = construction not signed off — do not present as done.
   */
  status: 'locked' | 'reverify' | 'wip'
  lockedOn?: string
  /**
   * Work every row from the same face (no turn) so a loop-only stitch's unworked
   * loops all pile on the front and the ridge shows on EVERY row — how a stitch
   * dictionary showcases blo/flo. Real crochet (blo ribbing is worked this way in
   * the round). Only affects blo/flo; plain stitches ignore it.
   */
  noTurn?: boolean
  /**
   * Column-spacing (gauge) override in yarn radii for THIS swatch only, leaving the
   * driving stitch's shared dictionary gauge untouched. Used by postrib to pack its
   * alternating fp/bp columns tighter than a plain all-fpdc swatch without moving
   * the locked fpdc/bpdc gauge.
   */
  gaugeYr?: number
  /**
   * builder 'shaped': per-swatch row-pitch scale (default 1) — packs the rows
   * vertically so an open scalloped fabric (shell) reads dense, without touching
   * the driving stitch's dictionary height.
   */
  rowScale?: number
  /**
   * builder 'shaped': keep the PRE-CELL lattice (§8f-3). Only the two fan
   * swatches use it — a fan works several stitches into one below-crown, and the
   * corrected cell crowds that shared base past what the interlocks survive.
   * See the comment in buildShaped for the one-variable-at-a-time probe.
   */
  legacyCell?: boolean
  /**
   * Per-swatch multiplier on the fp/bp POST relief (default 1 = identity, which
   * is what every locked stitch uses). basketweave deepens it so its raised
   * blocks read against the recessed ones; consumed by buildContinuous.
   */
  postReliefScale?: number
  /**
   * Render framing margin (fraction of the content span) — the pipeline's default
   * is 0.12. A tall 3D object (the ball) projects above an xy-tight frame under
   * camera tilt and clips; a generous margin frames the FULL silhouette. Flat
   * swatches leave it undefined (default crop).
   */
  viewMargin?: number
  /**
   * OPEN lace fabric (dc/tr with real holes: shell, V-stitch, crossed, dc
   * increases). The renderer drops the yarn-coloured backing plane for these so
   * each hole shows the table surface instead of a solid dark rectangle behind
   * the lace. Dense fabrics leave it undefined (backing on — no gap flashes bg).
   * Presentation only.
   */
  openFabric?: boolean
}

export const SWATCH_RECIPES: Record<SwatchArg, SwatchRecipe> = {
  ch: {
    stitch: 'ch', rows: 0, auditW: 16, relaxProfile: 'chain', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2020/04/ET_HowToChain_05B.jpg',
    status: 'locked', lockedOn: '2026-07-02',
  },
  slst: {
    stitch: 'slst', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://www.lavisch.com/site/wp-content/uploads/2015/09/Slip-Stitch-Crochet_3-600x600.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  sc: {
    stitch: 'sc', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2020/07/EYE_SC.jpg',
    status: 'locked', lockedOn: '2026-07-02',
  },
  hdc: {
    stitch: 'hdc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2021/01/ET_HDC_24.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  dc: {
    stitch: 'dc', rows: 8, auditW: 11, relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2020/04/ET_DC_25.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  tr: {
    stitch: 'tr', rows: 8, auditW: 10, relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://sarahmaker.com/wp-content/uploads/2023/01/sarahmakertreble-crochet-stitch-15-819x1024.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  dtr: {
    stitch: 'dtr', rows: 8, auditW: 9, relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://theloopholefox.com/wp-content/uploads/2022/09/Double-Treble-Crochet-US-Stitch.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  scblo: {
    stitch: 'scblo', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.05, // calmer twist so the ridge line isn't lost in ply noise
    referenceUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0101200px-500x375.jpg',
    status: 'locked', lockedOn: '2026-07-07', // faithful flat-turned: ridge shows every OTHER row (odd rows' ridge is correctly on the hidden back face). Rebecca signed off consistent-with-locked-sc.
  },
  scflo: {
    stitch: 'scflo', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0091200px-500x375.jpg',
    status: 'locked', lockedOn: '2026-07-07',
  },
  fpdc: {
    stitch: 'fpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, _c) => (j === 0 ? 'dc' : 'fpdc'), // row 0 establishes posts to wrap
    // clean single-stitch reference (raised front posts standing proud), replacing
    // the old fringepost9 colourwork-cable photo (acrochetedsimplicity.com)
    referenceUrl: 'https://www.acrochetedsimplicity.com/wp-content/uploads/2017/01/fpdc-7-1024x683.jpg',
    status: 'locked', lockedOn: '2026-07-07', // raised front posts read correctly vs single-stitch ref
  },
  bpdc: {
    stitch: 'bpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, _c) => (j === 0 ? 'dc' : 'bpdc'),
    // back posts recede → front shows horizontal step-bars, not raised posts (theloopholefox.com)
    referenceUrl: 'https://theloopholefox.com/wp-content/uploads/2022/09/Back-Post-Double-Crochet-12.jpg',
    status: 'locked', lockedOn: '2026-07-07', // recessed posts / horizontal-bar front read correctly
  },
  postrib: {
    stitch: 'fpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : c % 2 === 0 ? 'fpdc' : 'bpdc'), // raised rib / recessed valley
    gaugeYr: 2.3, // pack the alternating fp/bp columns tighter than plain post dc (2.9); real rib columns touch. Re-derived §8f from the corrected post cell (was 1.5 against the old 1.9)
    // plain 1x1 fpdc/bpdc rib, flat lay, columns packed tight — a much cleaner
    // match than the old fringepost9 colourwork-cable photo (moralefiber.blog)
    referenceUrl: 'https://doradoes.co.uk/wp-content/uploads/2021/04/double-front-post-back-post-dc-rib-1024x1024.jpg',
    status: 'locked', lockedOn: '2026-07-07', // gauge 1.9->1.5 closed the rib gaps; now reads as distinct packed vertical ribs matching the reference
  },
  basketweave: {
    stitch: 'dc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => {
      if (j === 0) return 'dc' // establish posts to wrap
      const block = Math.floor(c / 3)
      const rb = Math.floor((j - 1) / 2)
      return (block + rb) % 2 === 0 ? 'fpdc' : 'bpdc' // 3-wide blocks, swap every 2 rows
    },
    gaugeYr: 2.9, postReliefScale: 1.0, // §8f-7: the post branch now takes fpdc's own cell, whose 1.3 relief scale already carries this contrast — 1.35 on top of it settled the fabric 2.70 d thick against a real 1.8–2.2. CONTRAST (2026-07-11): the block alternation barely read (uniform vertical posts). Deepen the fp/bp relief 1.35× (per-swatch — locked fpdc/bpdc/postrib untouched) so raised blocks pop over recessed ones, and pack the columns (2.3->1.9) so the 3-wide blocks tile tight — the over-under basket weave becomes legible
    referenceUrl: 'https://daisyfarmcrafts.com/wp-content/uploads/2017/04/IMG_0708.jpg', // daisyfarmcrafts — cream basketweave swatch
    status: 'wip',
  },
  bobble: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.1,
    // Bumps on a staggered polka-dot grid over plain sc. Edge columns stay PLAIN
    // (real bobble/popcorn patterns keep the selvedge plain — a big cluster hard
    // against the pinned edge, with no turning-chain slack for j>0 in the grid
    // builder, strangles its base hook; the audit caught exactly that at c0).
    pattern: (j, c) => bobbleDot(j, c),
    referenceUrl: 'https://daisyfarmcrafts.com/wp-content/uploads/2017/06/fullsizeoutput_1c5f-600x736.jpeg', // daisyfarmcrafts — raised bobbles on flat ground
    status: 'wip',
  },
  bobbles: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.1,
    pattern: (j, c) => bobbleDot(j, c),
    referenceUrl: 'https://daisyfarmcrafts.com/wp-content/uploads/2017/06/fullsizeoutput_1c5f-600x736.jpeg',
    status: 'wip',
  },
  // ---- SHAPING (sc family) ----
  // Growing trapezoid: inc at both ends of every row (8 → 20 over 6 rows).
  scinc: {
    stitch: 'sc', rows: 6, auditW: 8, builder: 'shaped',
    shapeRows: growPlan(8, 6),
    // §8f-3: pin removed — the shaped builder now takes sc's own cell.
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://sarahmaker.com/wp-content/uploads/2022/03/single-crochet-increase-2-819x1024.jpg',
    status: 'wip',
  },
  // Shrinking trapezoid: sc2tog at both ends of every row (16 → 6 over 5 rows).
  scdec: {
    stitch: 'sc', rows: 5, auditW: 16, builder: 'shaped',
    shapeRows: shrinkPlan(16, 5),
    // §8f-3: pin removed — the shaped builder now takes sc's own cell.
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://christacodesign.com/wp-content/uploads/2021/03/Single-crochet-two-together-edges-2-1024x768.jpg',
    status: 'wip',
  },
  // hdc/dc shaping — the SAME shaped builder (emitDecrease + the inc path are
  // stitch-generic; only the driving stitch's height/gauge change). Taller posts,
  // so fewer rows keep the swatch a sensible size. References are single-stitch
  // increase/decrease swatches for that stitch.
  hdcinc: {
    stitch: 'hdc', rows: 5, auditW: 8, builder: 'shaped',
    shapeRows: growPlan(8, 5),
    // §8f-3: pin removed — the shaped builder now takes hdc's own cell.
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://cdn.shopify.com/s/files/1/0620/7180/0037/files/image-81-1024x576_2021-01.png', // crochetmelovely — finished hdc increase
    status: 'wip',
  },
  hdcdec: {
    stitch: 'hdc', rows: 5, auditW: 16, builder: 'shaped',
    shapeRows: shrinkPlan(16, 5),
    // §8f-3: pin removed — the shaped builder now takes hdc's own cell.
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://christacodesign.com/wp-content/uploads/2021/04/half-double-crochet-together-tutorial-2-720x720.jpg', // christacodesign — hdc2tog swatch
    status: 'wip',
  },
  dcinc: {
    stitch: 'dc', rows: 4, auditW: 8, builder: 'shaped',
    shapeRows: growPlan(8, 4),
    // §8f-3: pin removed — the shaped builder now takes dc's own cell (collars included).
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.1, openFabric: true,
    referenceUrl: 'https://knotions.com/wp-content/uploads/2018/10/2dc.jpg', // knotions — completed 2dc increase with the V pair marked (found 2026-07-11; fuller-swatch candidates stayed lazy-loaded)
    status: 'wip',
  },
  dcdec: {
    stitch: 'dc', rows: 4, auditW: 14, builder: 'shaped',
    shapeRows: shrinkPlan(14, 4),
    // §8f-3: pin removed — the shaped builder now takes dc's own cell (collars included).
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://christacodesign.com/wp-content/uploads/2017/09/2017-09-19_13-22-04_606-1024x768.jpg', // christacodesign — dc2tog swatch
    status: 'wip',
  },
  // Shell stitch: 5 dc fanned into one base, balanced by skipped stitches either
  // side (sc between shells) so the fabric stays constant-width — a scalloped
  // texture. Shells stack (each row's shell into the centre of the shell below).
  shell: {
    stitch: 'dc', rows: 5, auditW: 13, builder: 'shaped',
    shapeRows: shellPlan(2, 5),
    gaugeYr: 1.5, rowScale: 0.72, legacyCell: true, // §8f-3: the fan swatches keep the pre-cell lattice — the corrected cell crowds a 5-dc fan's shared base past what its interlocks survive, at every gauge/row-pack in a 5×4 sweep. PACK (2026-07-11): dc's open 2.3 gauge + tall posts left the scallops skeletal with big holes; pack the columns (1.5) and shorten the row pitch (0.72) so adjacent fans nest and touch like the reference's dense scalloped fabric (1.7/0.82 helped but stayed open)
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.1, openFabric: true,
    referenceUrl: 'https://daisyfarmcrafts.com/wp-content/uploads/2016/06/Stitch-Book-PART-2-70-e1628964882533-1021x1024.png', // daisyfarmcrafts — classic shell swatch
    status: 'wip',
  },
  // V-stitch: 2 dc worked into ONE base stitch (the inc machinery — the pair's
  // legs genuinely fan from the shared base into a V), each V balanced by a
  // skipped stitch: [V in next, skip 1] across the row, Vs stacking row on row.
  // DEPICTION NOTE: the airier dictionary V-stitch is (dc, ch 1, dc) with the
  // next row's V worked into the ch-SPACE — chain-spaces are new-topology tier
  // (§8b), so this is the solid 2-dc V variant, an accepted simple form.
  vstitch: {
    stitch: 'dc', rows: 5, auditW: 12, builder: 'shaped',
    shapeRows: vstitchPlan(5, 5),
    rowScale: 0.8, gaugeYr: 2.3, legacyCell: true, // §8f-3: a V pair is a fan into one base — same crowding as shell, so it keeps the pre-cell lattice. calm the row sag (2026-07-11): the tall dc posts sagged + tangled into an untidy lattice; a shorter row pitch firms the Vs vertically. Gauge left OPEN (no override) so the lace mesh stays airy like the reference.
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.05, openFabric: true, // calmer ply so the lattice columns read clean, not ropey
    referenceUrl: 'https://i0.wp.com/mycrochetory.com/wp-content/uploads/2023/08/How-to-crochet-V-stitch-1.jpg', // mycrochetory — V-stitch swatch (the ch-1 open variant; ours is the solid 2-dc V)
    status: 'wip',
  },
  // Crossed dc: [skip 1, dc in next, dc in the skipped st] — the pair's legs
  // genuinely cross in an X, the second-worked stitch passing in FRONT.
  crossed: {
    stitch: 'dc', rows: 5, auditW: 12, builder: 'shaped',
    shapeRows: crossedPlan(5, 5),
    gaugeYr: 2.81, rowScale: 0.85, // §8f-3: pack ratio 0.83 of the driving stitch's gauge, re-derived from dc's corrected 3.4 (was 1.9 against the old 2.3). moderate pack (2026-07-11): the fabric was too open/skeletal; pack the columns + rows so the crossings sit in a firm fabric with just the small eyelets the reference keeps, not big holes
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.1, openFabric: true,
    referenceUrl: 'https://richtexturescrochet.com/wp-content/uploads/2020/09/IMG_2051-1024x683.jpg', // richtexturescrochet — crossed dc swatch (rows of X pairs)
    status: 'wip',
  },
  // Picot: sc ground, with (ch 3, sl st into the sc's own head) nubs along the
  // TOP row — the classic picot edging. The sl st genuinely dives under the
  // sc's crown (a recorded, audited hook).
  picot: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.05,
    pattern: (j, c) => (j === 7 && c >= 2 && c <= 11 && (c - 2) % 3 === 0 ? 'picot' : 'sc'),
    referenceUrl: 'https://nanascraftyhome.com/wp-content/uploads/2021/02/Picot-Stitch-1-1024x1024.jpg', // nanascraftyhome — picot swatch (edging + dotted rows)
    status: 'wip',
  },
  // Flat amigurumi circle: magic ring, 6 sc, +6 per round in a continuous spiral.
  mrdisc: {
    stitch: 'sc', rows: 6, auditW: 16, builder: 'round',
    roundCounts: [6, 12, 18, 24, 30, 36],
    // §8f-4: no gauge override — the disc takes sc's own cell, gauge and row
    // pitch alike, exactly like the flat grid builder.
    relaxProfile: 'round', tiltDeg: 0, twist: 0.08, // CRISPNESS 2026-07-11: 0.05 was "calm" for the old merged-ply model (twist = surface noise); the distinct-ply model's twist IS the visible ply line — 0.08 shows real yarn without burying the Vs
    referenceUrl: 'https://sarahmaker.com/wp-content/uploads/2022/03/crochet-circle-7-819x1024.jpg',
    status: 'wip',
  },
  // The first 3D SURFACE: an amigurumi ball, sc in a continuous spiral over a
  // sphere (MR at the top pole, evenly-distributed incs to the equator,
  // mirrored decs, fasten-off into the bottom pole).
  ball: {
    stitch: 'sc', rows: 15, auditW: 16, builder: 'sphere', equatorCount: 36,
    // §8f-4: no gauge override — the sphere takes sc's own cell, the same one
    // the compositions build their parts at, so the ball a proof renders and the
    // ball a bear is made of are the same fabric.
    viewMargin: 0.35, // frame the FULL sphere silhouette — the tilted camera clipped the top pole against the old 0.12 crop
    relaxProfile: 'surface', tiltDeg: 24, twist: 0.05,
    referenceUrl: 'https://raffamusadesigns.com/wp-content/uploads/How_to_Crochet_erfect_Amigurumi_Ball_9_RaffamusaDesigns.jpg',
    status: 'wip',
  },
  // ---- KNIT (new craft, knit path builder) ----
  k: {
    stitch: 'k', rows: 9, auditW: 12, builder: 'knit', relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/03/stockinette-stitch-right-side-1024x684.jpg',
    status: 'wip',
  },
  stockinette: {
    stitch: 'k', rows: 9, auditW: 12, builder: 'knit', relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/03/stockinette-stitch-right-side-1024x684.jpg',
    status: 'locked', lockedOn: '2026-07-11', // Rebecca signed off vs the fine-cotton stockinette reference; reads as chunky hand-knit stockinette (plumper Vs = weight character, not a defect)
  },
  garter: {
    stitch: 'k', rows: 10, auditW: 12, builder: 'knit', knitFlip: true, relaxProfile: 'worked', tiltDeg: 24, twist: 0.05,
    // Density calibration 2026-07-11: courses pack to 0.65 (the see-through was
    // VERTICAL — dark gaps between courses), gauge relaxes to 0.95 so the edge
    // legs keep their turn slack (0.6/0.8 and every tight-both-ways combo
    // slipped the c0/c11 legs sideways out of the mouth — audit fail). Settled
    // z-thickness (~5.7yr) is the corrugation model's own and does not shrink
    // with bz; the truly-packed reference look needs the accordion redesign
    // (parked, §9). This is the densest audit-clean calibration of the shipping
    // corrugation model.
    knitCourseScale: 0.65,
    knitGaugeScale: 0.95,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2021/04/close-up-of-a-swatch-in-garter-stitch-1024x684.jpg',
    status: 'wip',
  },
  // 1×1 rib: alternating knit/purl columns → vertical ribs. Per-column pull side
  // (even cols +z, odd −z), constant up each column. tiltDeg for the raised ribs.
  knitrib: {
    stitch: 'k', rows: 10, auditW: 12, builder: 'knit', knitFace: 'rib', relaxProfile: 'worked', tiltDeg: 24, twist: 0.05,
    knitGaugeScale: 0.85, // pack the columns so the purl valleys aren't see-through — real rib pulls in laterally (the accordion)
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/04/rib-stitch-swatch-close-up-1024x684.jpg',
    status: 'locked', lockedOn: '2026-07-11', // Rebecca signed off vs the 1×1 rib reference; raised knit columns + purl-filled valleys read (chunkier than the fine reference = weight character)
  },
  // Yarn-over eyelets: stockinette with [yo, k2tog] eyelet rows. Each yo is a bare
  // loop over the needle (no head below → the hole); each k2tog draws through two
  // heads below (balances the yo so the fabric stays W wide). Eyelet rows aligned
  // in columns → vertical columns of holes. openFabric so the eyelets show the
  // table through them (backing would fill the holes).
  yo: {
    stitch: 'k', rows: 10, auditW: 12, builder: 'knit', knitFace: 'stockinette',
    knitStitch: (j, c, W) => eyeletOp(j, c, W),
    // tilt to read the eyelets as openings (top-down, the fat yarn hides them);
    // openFabric so each hole shows the table through it (backing would fill it).
    relaxProfile: 'worked', tiltDeg: 28, twist: 0.05, openFabric: true,
    referenceUrl: 'https://sowoolly.net/wp-content/uploads/2025/09/Easy-Eyelet-Stitch-Pattern.png', // sowoolly — staggered round eyelets on a knit ground
    status: 'wip',
  },
  // k2tog — right-leaning single decrease. Two vertical decrease lines (a k2tog +
  // its eyelet) stacked over courses 2..6 so the RIGHT lean reads as a clean line.
  k2tog: {
    stitch: 'k', rows: 9, auditW: 12, builder: 'knit', knitFace: 'stockinette',
    knitStitch: (j, c, W) => decLineOp(j, c, W, 'k2tog'),
    relaxProfile: 'worked', tiltDeg: 28, twist: 0.05, openFabric: true,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2021/09/a-knitted-swatch-decreased-with-k2tog-on-both-sides-1024x684.jpg', // nimble-needles — swatch decreased with k2tog (right-leaning line)
    status: 'wip',
  },
  // ssk — left-leaning single decrease, the mirror of k2tog. Same two-line showcase
  // so the two renders sit side by side and the opposite lean is unmistakable.
  ssk: {
    stitch: 'k', rows: 9, auditW: 12, builder: 'knit', knitFace: 'stockinette',
    knitStitch: (j, c, W) => decLineOp(j, c, W, 'ssk'),
    relaxProfile: 'worked', tiltDeg: 28, twist: 0.05, openFabric: true,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/04/closeup-of-the-ssk-knitting-decrease-1024x684.jpg', // nimble-needles — closeup of the ssk decrease (left-leaning line)
    status: 'wip',
  },
  // Seed (moss) stitch: k1 p1 alternating every stitch AND every course — the
  // checkerboard faceSign. Pure pull-side work on the existing machinery
  // (stockinette/rib bit-identical; garter shares the per-stitch corrugation
  // value, uniform per its courses, so it is bit-identical too). tiltDeg for the
  // pebbled relief; slightly packed courses like garter's bumps.
  seed: {
    stitch: 'k', rows: 10, auditW: 12, builder: 'knit', knitFace: 'seed',
    knitCourseScale: 0.75, knitGaugeScale: 0.95, // seed packs like garter (bumpy rows sit into each other); same edge-slack caution as garter (0.65/0.95) but a touch looser since neighbours alternate within the course too
    relaxProfile: 'worked', tiltDeg: 24, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2021/01/a-seed-stitch-swatch-1024x684.jpg', // nimble-needles — seed stitch swatch from above (checkerboard bumps)
    status: 'wip',
  },
  // 2×2 left-cross ROPE cable (C4F) as a real cable PANEL: a centre 4-column cable
  // group (cols 6..9) crossing every 4 courses up the FULL height (j=3,7,11,15 →
  // a braided rope COLUMN, not one isolated cross), flanked by 2-column recessed
  // PURL gutters (cols 4,5 and 10,11 — reverse-stockinette valleys that frame the
  // raised rope, per the reference), all sitting in a plain stockinette field
  // (cols 0..3 and 12..15). The held pair travels LEFT in front of the working
  // pair — real crossing yarn held by collision (§8d). The gutters use the rib
  // per-column face (constant up the column, corrugation-free), leaving locked
  // stockinette/rib/garter geometry bit-identical (verified by settled-geo hash).
  // The crosses sit on ODD courses so the work direction through the group matches
  // the proven crossing (even-course crosses at this width left the inner back leg
  // settling behind its head — the crossing construction itself is untouched).
  cable: {
    stitch: 'k', rows: 18, auditW: 16, builder: 'knit', knitFace: 'stockinette',
    knitCables: [{ j: 3, c: 6 }, { j: 7, c: 6 }, { j: 11, c: 6 }, { j: 15, c: 6 }],
    knitPurlCols: [4, 5, 10, 11],
    relaxProfile: 'worked', tiltDeg: 28, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/05/2x2-cable-stitch-swatch-1024x684.jpg', // nimble-needles — 2×2 rope cable swatch (left cross on the left)
    status: 'wip',
  },
}

/**
 * Bobble placement: staggered dots on the odd worked rows, confined to the
 * INTERIOR columns (2..W-2) so no cluster lands on the pinned selvedge — a real
 * bobble pattern keeps its edges plain. Rows stagger by 2 columns for the
 * classic offset polka-dot field.
 */
function bobbleDot(j: number, c: number): StitchId {
  // Plain sc on even rows; a DEDICATED BOBBLE ROW on every odd row, with a berry
  // every OTHER interior stitch (one sc between berries). This is the classic
  // bobble fabric — tidy ROWS of round balls sitting on flat sc rows (the
  // daisyfarmcrafts reference), NOT scattered staggered polka-dots (which read as
  // lumps in porridge — the round-2 verdict). Edges stay plain: a cluster hard on
  // the pinned selvedge strangles its base hook (§9).
  if (j % 2 === 0) return 'sc'
  return c >= 2 && c <= 12 && c % 2 === 0 ? 'bobble' : 'sc'
}

/**
 * Yarn-over eyelet pattern: the classic staggered dotted eyelet field. On each
 * eyelet course, a period-4 repeat of [yo, k2tog, k, k] across the interior — the
 * yo makes the hole, the k2tog immediately to its RIGHT (gathering the yo's column
 * + its own) pulls that column away and opens it, and two plain knits space the
 * next eyelet out. Each repeat makes 4 and consumes 4 → width-neutral. Edges plain
 * (no selvedge hole). Eyelet courses 3 and 6, their phase offset by 2 columns so
 * the holes stagger row-to-row like the reference (holes at 1,5,9 then 3,7).
 */
function eyeletOp(j: number, c: number, W: number): KnitStitchOp {
  const start = j === 3 ? 1 : j === 6 ? 3 : -1 // eyelet courses + their column phase
  if (start < 0) return 'k'
  if (c <= 0 || c >= W - 1) return 'k' // plain selvedge
  const r = c - start
  if (r < 0) return 'k'
  const m = r % 4
  if (m === 0) return c + 1 <= W - 2 ? 'yo' : 'k' // the hole (only if its k2tog partner fits)
  if (m === 1) return 'k2tog' // gathers the yo's column (c−1) + this one → opens the hole
  return 'k' // two plain knits space the eyelets out
}

/**
 * Decrease-LINE showcase: two vertical [yo, dec] lines (columns 3 and 7) stacked
 * over consecutive courses 2..6, the rest plain stockinette — so the decrease's
 * LEAN reads as a clean vertical line (the k2tog line leans right, the ssk line
 * leans left; that opposite lean is the pair's identity). Each line pairs a
 * decrease with an adjacent yo so the course stays W wide.
 *  - k2tog line: k2tog at c (gathers c−1 + c, leans RIGHT), yo at c−1.
 *  - ssk line:   ssk at c (gathers c + c+1, leans LEFT), yo at c+1.
 */
function decLineOp(j: number, c: number, W: number, kind: 'k2tog' | 'ssk'): KnitStitchOp {
  if (j < 2 || j > 6) return 'k' // plain stockinette above + below the decrease band
  if (c <= 0 || c >= W - 1) return 'k' // plain selvedge
  const lines = [3, 7] // the two decrease columns
  if (kind === 'k2tog') {
    if (lines.includes(c)) return 'k2tog' // gathers c−1 + c
    if (lines.includes(c + 1)) return 'yo' // the eyelet just LEFT of each k2tog
    return 'k'
  }
  if (lines.includes(c)) return 'ssk' // gathers c + c+1
  if (lines.includes(c - 1)) return 'yo' // the eyelet just RIGHT of each ssk
  return 'k'
}

/** inc at both ends of every row: w0 → w0 + 2·rows. */
function growPlan(w0: number, rows: number): ShapeOp[][] {
  return Array.from({ length: rows }, (_, j) => {
    const below = w0 + 2 * j
    return ['inc', ...(Array(below - 2).fill('st') as ShapeOp[]), 'inc'] as ShapeOp[]
  })
}

/**
 * Shell stitch: a leading plain stitch, then k repeats of
 * (skip, skip, shell→5, skip, skip, st). Each repeat consumes 6 and produces 6,
 * so the fabric is constant-width at W0 = 1 + 6k. Every row identical → shells
 * stack, each worked into the centre of the shell below.
 */
function shellPlan(k: number, rows: number): ShapeOp[][] {
  const row: ShapeOp[] = ['st']
  for (let g = 0; g < k; g++) row.push('skip', 'skip', 'shell', 'skip', 'skip', 'st')
  return Array.from({ length: rows }, () => row.slice())
}

/**
 * V-stitch rows: a leading + trailing plain stitch framing k repeats of
 * (V into next, skip 1). 'inc' IS the V machinery (2 full stitches fanning
 * from one shared base); the skip balances it, so each repeat consumes 2 and
 * produces 2 — constant width W0 = 2k + 2. Every row identical → the Vs stack
 * (serpentine work order alternates which dc of the pair below is consumed,
 * so the stack centres on average).
 */
function vstitchPlan(k: number, rows: number): ShapeOp[][] {
  const row: ShapeOp[] = ['st']
  for (let g = 0; g < k; g++) row.push('inc', 'skip')
  row.push('st')
  return Array.from({ length: rows }, () => row.slice())
}

/** Crossed-dc rows: plain edges framing k crossed pairs (each consumes 2, makes 2). W0 = 2k + 2. */
function crossedPlan(k: number, rows: number): ShapeOp[][] {
  const row: ShapeOp[] = ['st']
  for (let g = 0; g < k; g++) row.push('cross')
  row.push('st')
  return Array.from({ length: rows }, () => row.slice())
}

/** sc2tog at both ends of every row: w0 → w0 − 2·rows. */
function shrinkPlan(w0: number, rows: number): ShapeOp[][] {
  return Array.from({ length: rows }, (_, j) => {
    const below = w0 - 2 * j
    return ['dec', ...(Array(below - 4).fill('st') as ShapeOp[]), 'dec'] as ShapeOp[]
  })
}
