/**
 * THE CUTE RULES, as numbers (cute-engine plan step 1, 26 Oct 2026).
 *
 * Bec's goal: "an engine that can build this adorableness into ANY pattern
 * idea. Not just copy one that someone else made." So the bar is not a shape
 * to copy but a set of PROPORTIONS, PLACEMENTS and FINISHES the bar toys all
 * share. Each rule below is one measured quantity of a built toy, the range
 * it must fall in for each toy family, why it reads cute, the bar photos it
 * came from, and how strict it is.
 *
 * Every number was measured in pixels on Bec's bar photos (cow, bunny, doll)
 * and on our cow-fable-1025 r1 render, normalised to head width (W), head
 * height (H, crown incl. fringe to chin, no horns/ears/hat) or toy height
 * (T, head top to table). The measuring script, the annotated images and the
 * raw JSON live OUTSIDE the repo (the bar photos are other shops' images):
 *   crochet-bar/proofs/cute-rules/measure_cute.py, measure-*.png, measurements.json
 * The plain-English version of this table is crochet-bar/CUTE-RULES.md.
 *
 * NOT WIRED YET. Nothing in a build, an audit or a render reads this module
 * (that is step 3, "a cute check on every build"); it moves no geometry hash.
 * `measure` on each rule records what step 3 has to read off a built toy and
 * whether the engine can already read it.
 */

/** The toy families the rules are ranged for. */
export type ToyFamily =
  /** A four-legged animal sitting on its haunches, head over the front legs
   *  (the Highland cow; also lamb, fox, bear, lion, dog, cat). */
  | 'quadruped-seated'
  /** A two-legged animal toy, seated or standing, arms at the front (the
   *  sleepy bunny; also a sitting bear, a mouse in a dress). */
  | 'biped-animal'
  /** A doll: a human or fairy figure, slim limbs, no muzzle (the fairy). */
  | 'doll'

export const TOY_FAMILIES: readonly ToyFamily[] = ['quadruped-seated', 'biped-animal', 'doll']

/** The bar photos (crochet-bar/bar-*.png). Never committed: names only. */
export type BarPhoto = 'highland-cow' | 'sleepy-bunny' | 'fairy-doll' | 'flower-wall-hanging' | 'spiral-trees'

/**
 * How strict a rule is when step 3 checks it:
 *  - 'hard': outside the range = not customer-ready, never a pass;
 *  - 'firm': outside = fix it, unless the design note says why this toy differs;
 *  - 'soft': advisory, flag it for the eye (the measure is lighting- or
 *    pose-dependent, or the bar shows it on one toy only).
 */
export type Strictness = 'hard' | 'firm' | 'soft'

/** The step-2 shapes a rule cannot be met without (workers on their own branches). */
export type NeededShape =
  /** A flat piece folded or pinched at its base (claude/crochet-fold-ear-1026). */
  | 'fold-ear'
  /** A tube that bends along its length (claude/crochet-bent-tube-1026). */
  | 'bent-tube'
  /** A limb whose width changes along it (claude/crochet-bent-tube-1026). */
  | 'tapered-limb'
  /** A cup with a rolled rim, pinched at the base and SEWN BY THE PINCH so it
   *  stands out from the head (rule-calib 1027: the bar's ear). The folded
   *  flat disc has a one-yarn edge; the rolled-rim cup (earPiece.ts) has the
   *  rim but is sewn by its back, so it cannot stand out or hold its fold. */
  | 'rolled-rim-cup'

/** The quantities measured on a toy (photo or build). All dimensionless. */
export type CuteQuantity =
  | 'headHeightShare'
  | 'headToTorsoWidth'
  | 'earSpanToWidest'
  | 'haunchToHead'
  | 'eyeSpacing'
  | 'eyeHeightFromChin'
  | 'eyeSize'
  | 'eyeMuzzleGap'
  | 'eyeInsetFromMuzzleEdge'
  | 'eyeFaceDeltaL'
  | 'muzzleWidth'
  | 'muzzleHeight'
  | 'chinOverhang'
  | 'muzzleFaceDeltaL'
  | 'muzzleWarmthB'
  | 'blushDeltaA'
  | 'blushBelowEye'
  | 'earProtrusion'
  | 'earAboveEye'
  | 'earAspect'
  | 'earLength'
  | 'earWidth'
  | 'earRimRatio'
  | 'appendageSagitta'
  | 'appendageBendDeg'
  | 'appendageElevationDeg'
  | 'appendageTaper'
  | 'appendageLength'
  | 'appendageTipBelowCrown'
  | 'appendageThickness'
  | 'earRimMin'
  | 'muzzleLightness'
  | 'curlPacking'
  | 'fringeHeight'
  | 'limbThickness'
  | 'limbGap'
  | 'limbEndBulge'
  | 'footWidth'
  | 'sharpCorners'
  | 'straightRun'
  | 'headTiltDeg'
  | 'asymmetryCues'
  | 'curlSizeCV'
  | 'eyeProtrusion'
  | 'limbJoinRatio'
  | 'footForwardDeg'

/** What each quantity is, in one line, with its normaliser. */
export const CUTE_QUANTITIES: Readonly<Record<CuteQuantity, string>> = {
  headHeightShare: 'head height (crown incl. fringe/hair to chin; no horns, ears or hat) / toy height (head top to table)',
  headToTorsoWidth: 'head width (front view, no ears) / widest torso incl. front legs or arms (no haunches, feet, skirt)',
  earSpanToWidest: 'span across both ears (or hair) / widest span of the whole toy below the head',
  haunchToHead: 'span across the seated back legs / head width',
  eyeSpacing: 'eye centre to eye centre / head width at the eyes',
  eyeHeightFromChin: 'eye centre height above the chin / head height',
  eyeSize: 'eye diameter (safety eye) or closed-eye arc width / head width',
  eyeMuzzleGap: 'eye bottom to muzzle top / head width (negative = the eye sits ON the muzzle top)',
  eyeInsetFromMuzzleEdge: 'eye centre in from the muzzle side edge / head width (eyes over the muzzle corners)',
  eyeFaceDeltaL: 'face lightness minus eye lightness (CIE L*): eyes read as dark dots',
  muzzleWidth: 'muzzle width / head width',
  muzzleHeight: 'muzzle height / head height',
  chinOverhang: '(head outline width - muzzle width) at 85% down the muzzle / head width: 0 = the muzzle IS the chin',
  muzzleFaceDeltaL: 'muzzle L* minus face L*',
  muzzleWarmthB: 'muzzle b* (yellow-warmth); a warm cream, not white',
  blushDeltaA: 'cheek blush a* minus face a* (pinkness)',
  blushBelowEye: 'blush centre below eye centre / head height',
  earProtrusion: 'how far an ear stands out past the head side / head width',
  earAboveEye: 'ear centre above eye centre / head height',
  earAspect: 'ear front-view height / width (a cow ear is as wide as it is tall)',
  earLength: 'lop ear length / head height',
  earWidth: 'lop ear widest width / head width',
  earRimRatio: 'thickest / thinnest ear rim as seen (a folded, pinched ear is uneven; a plain cup is a uniform ring)',
  appendageSagitta: 'horn / tail / antenna centre-line: max offset from its chord / chord length (0 = straight)',
  appendageBendDeg: 'change of direction from the base half to the tip half of the appendage (deg)',
  appendageElevationDeg: 'base-to-tip chord above horizontal, front view (deg)',
  appendageTaper: 'appendage tip thickness / base thickness',
  appendageLength: 'appendage arc length / head width',
  appendageTipBelowCrown: 'crown (head top incl. fringe or hair) minus horn tip height / head height (negative = the tip stands above the crown)',
  appendageThickness: 'appendage base thickness as seen where it leaves the head / head width',
  earRimMin: 'thinnest ear rim as seen from the front / the ear\'s width beside the head (a plump rolled cup is thick all round)',
  muzzleLightness: 'muzzle L* on its own (a light cream, whatever the face)',
  curlPacking: 'curl count x mean curl size squared / the fringe\'s front-view box area (1 = the curls tile their patch; a sparse ring of big loops reads under 0.7)',
  fringeHeight: 'top of the fringe above the top of the head / head height (a cap hugs the head; a mound of loops stands up off it)',
  limbThickness: 'front leg or arm width / head width',
  limbGap: 'gap between the front legs / head width',
  limbEndBulge: 'paw / hoof width / limb width at mid-length (a chunky rounded end)',
  footWidth: 'seated foot (sole) width / head width',
  sharpCorners: 'count of convex outline corners (>70 deg turn over 0.04 W) on the head and its appendages',
  straightRun: 'longest straight stretch of outline on the head and its appendages / head width',
  headTiltDeg: 'tilt of the eye line from level (deg)',
  asymmetryCues: 'count of deliberate asymmetries: head tilt, crossed or offset limb, side-swept hair or flop, mixed curls, a single brow',
  curlSizeCV: 'spread of curl / loop sizes in a fringe or mane (std / mean)',
  eyeProtrusion: 'how far a safety eye\'s dome stands out of the fabric round it / the eye diameter (a sunk eye sits in the face)',
  limbJoinRatio: 'front leg or arm thickness where it joins the body / its thickness at the foot or paw',
  footForwardDeg: 'angle between a seated back leg\'s sole (its axis out through the rounded end) and the lens direction (deg)',
}

/** How step 3 reads a quantity off a built toy. */
export type MeasureSource =
  /** The engine already has it: part bounds, prop centres/radii, part specs. */
  | { kind: 'engine-now'; from: string }
  /** Needs new measuring code in step 3 (a front-view silhouette, a fitted
   *  centre line, a render colour read, ...). */
  | { kind: 'needs-code'; what: string }

export interface CuteRange { min: number; max: number }

export interface CuteRule {
  id: string
  /** What the rule asks for, in plain words. */
  what: string
  quantity: CuteQuantity
  /** Per-family target range. A family without one = the rule does not apply. */
  ranges: Readonly<Partial<Record<ToyFamily, CuteRange>>>
  /** Why it reads cute. */
  why: string
  /** The bar photos it was measured on (first = the main source). */
  from: readonly BarPhoto[]
  strictness: Strictness
  measure: MeasureSource
  /** The step-2 shape(s) the engine needs before a build can meet it. */
  needsShape?: readonly NeededShape[]
  /** Bar photos beyond the toys the idea carries to. */
  carriesTo?: readonly BarPhoto[]
  /** True where the bar value is a judged estimate from a zoom, not a pixel line. */
  estimated?: boolean
  /** For a colour rule read as a YARN-HEX PROXY (cuteMeasure.ts): the range
   *  the hex value must fall in so the RENDER lands inside `ranges` (which
   *  are photo values). Calibrated on two renders of the same cow (rule-calib
   *  1027): the near-white #ead9bf (hex L* 87, b* 15) rendered L* 85, b* 10
   *  on its lit top; the oatmeal #c8ad8b (72, 21) rendered 61, 28. The set's
   *  light leaves a near-white near white and darkens and yellows a mid
   *  cream, so a cream that renders like the bar's (L* 66-68, b* 19-20 at
   *  the muzzle's centre) is a hex between the two. Absent = `ranges`. */
  proxyRanges?: Readonly<Partial<Record<ToyFamily, CuteRange>>>
}

const r = (min: number, max: number): CuteRange => ({ min, max })

export const CUTE_RULES: readonly CuteRule[] = [
  // ── Proportion ───────────────────────────────────────────────────────────
  {
    id: 'big-head',
    what: 'The head is a big share of the toy\'s height.',
    quantity: 'headHeightShare',
    ranges: { 'quadruped-seated': r(0.5, 0.65), 'biped-animal': r(0.4, 0.55), doll: r(0.25, 0.4) },
    why: 'A baby\'s proportions: a big head on a small body is the first thing that reads as young and loveable at thumbnail size.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'head (+ fringe/hair) bounds z extent / toy bounds max z' },
  },
  {
    id: 'head-as-wide-as-body',
    what: 'The head is at least as wide as the torso with its front legs or arms.',
    quantity: 'headToTorsoWidth',
    ranges: { 'quadruped-seated': r(0.95, 1.25), 'biped-animal': r(1.0, 1.35), doll: r(1.3, 1.7) },
    why: 'A small, soft body tucked under a wide head; a body wider than the head reads as an adult animal.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'head bounds x extent / union of body + front-leg (or arm) bounds x extent' },
  },
  {
    id: 'head-is-the-widest',
    what: 'Across the ears, the head is as wide as the whole toy: nothing below it sticks out further.',
    quantity: 'earSpanToWidest',
    ranges: { 'quadruped-seated': r(0.95, 1.15), 'biped-animal': r(0.95, 1.3) },
    why: 'The eye goes to the face first; a silhouette that widens downwards reads as a heavy, sitting adult.',
    from: ['highland-cow', 'sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'union of ear bounds x extent / whole toy bounds x extent below the chin' },
  },
  {
    id: 'seated-haunches',
    what: 'Seated back legs spread a little wider than the head, low on the table.',
    quantity: 'haunchToHead',
    ranges: { 'quadruped-seated': r(1.3, 1.8) },
    why: 'A wide, low base makes the toy sit with weight; too narrow and it looks propped up.',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'union of back-leg bounds x extent / head bounds x extent' },
  },
  // ── Face ─────────────────────────────────────────────────────────────────
  {
    id: 'eyes-wide-apart',
    what: 'The eyes are set wide apart, well over half the head width.',
    quantity: 'eyeSpacing',
    ranges: { 'quadruped-seated': r(0.55, 0.7), 'biped-animal': r(0.55, 0.7), doll: r(0.55, 0.7) },
    why: 'Wide-set eyes are the strongest baby-face cue; close eyes read as a watchful, older face.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'hard',
    measure: { kind: 'engine-now', from: 'eye prop centres x distance (or embroidery eye centres) / head bounds x extent' },
  },
  {
    id: 'eyes-low',
    what: 'The eyes sit low on the head: on the muzzle line for a muzzled animal, in the lower third for a bunny or doll.',
    quantity: 'eyeHeightFromChin',
    ranges: { 'quadruped-seated': r(0.38, 0.5), 'biped-animal': r(0.25, 0.38), doll: r(0.18, 0.32) },
    why: 'A big forehead above low eyes is the baby-face proportion.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: '(eye centre z - head bounds min z) / head height' },
  },
  {
    id: 'eyes-small',
    what: 'Safety eyes are small dots, about a ninth of the head width; sleeping eyes are short arcs.',
    quantity: 'eyeSize',
    ranges: { 'quadruped-seated': r(0.09, 0.13), 'biped-animal': r(0.13, 0.2), doll: r(0.08, 0.13) },
    why: 'Small, wide-set dots read sweet; big glossy eyes read startled or buggy.',
    from: ['highland-cow', 'fairy-doll', 'sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'eye prop radius x 2 (or sleeping-eye embroidery x extent) / head bounds x extent' },
  },
  {
    id: 'eyes-on-the-muzzle',
    what: 'A muzzled animal\'s eyes touch or sit just onto the muzzle\'s top edge.',
    quantity: 'eyeMuzzleGap',
    ranges: { 'quadruped-seated': r(-0.07, 0) },
    why: 'Eyes resting on the muzzle pull the features together into one small, low face.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: '(muzzle bounds max z - (eye centre z - eye radius)) / head width, sign: positive gap = bad' },
  },
  {
    id: 'eyes-over-muzzle-corners',
    what: 'Each eye sits above a top corner of the muzzle.',
    quantity: 'eyeInsetFromMuzzleEdge',
    ranges: { 'quadruped-seated': r(0, 0.07) },
    why: 'Eyes and muzzle line up as one face shape.',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'mean of (eye x - muzzle bounds side x) / head width' },
  },
  {
    id: 'eyes-read-dark',
    what: 'The eyes are clearly darker than the face.',
    quantity: 'eyeFaceDeltaL',
    ranges: { 'quadruped-seated': r(25, 100), 'biped-animal': r(25, 100), doll: r(25, 100) },
    why: 'The face must read at thumbnail size; on a dark brown face that needs a gloss highlight or a light rim.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'L* of the eye vs the face on the render (hex is a proxy; lighting moves it)' },
  },
  {
    id: 'muzzle-wide',
    what: 'A cow-type muzzle is about two thirds of the head width; a bunny snout about a third.',
    quantity: 'muzzleWidth',
    ranges: { 'quadruped-seated': r(0.6, 0.75), 'biped-animal': r(0.3, 0.45) },
    why: 'A wide, soft muzzle is the toy\'s smile even without a mouth.',
    from: ['highland-cow', 'sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'muzzle bounds x extent / head bounds x extent' },
  },
  {
    id: 'muzzle-height',
    what: 'The muzzle fills the lower part of the face.',
    quantity: 'muzzleHeight',
    ranges: { 'quadruped-seated': r(0.36, 0.48), 'biped-animal': r(0.18, 0.3) },
    why: 'Keeps the features low so the forehead stays big.',
    from: ['highland-cow', 'sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'muzzle bounds z extent / head height' },
  },
  {
    id: 'muzzle-is-the-chin',
    what: 'A cow-type muzzle forms the bottom of the head: no face colour shows beside or below it at the chin.',
    quantity: 'chinOverhang',
    ranges: { 'quadruped-seated': r(-0.05, 0.08) },
    why: 'A muzzle that IS the chin makes a short, rounded baby snout; one sitting inside the face makes a long adult face.',
    from: ['highland-cow'],
    strictness: 'hard',
    measure: { kind: 'needs-code', what: 'front-view silhouette row widths of head vs muzzle (project the placed ctrl points onto x-z)' },
  },
  {
    id: 'muzzle-tone',
    what: 'A contrast muzzle is a warm cream a clear step lighter than the face, not white; a bunny snout is tone on tone.',
    quantity: 'muzzleFaceDeltaL',
    ranges: { 'quadruped-seated': r(25, 45), 'biped-animal': r(0, 12) },
    why: 'A designed palette: soft contrast reads gentle, stark white on brown reads like a mask.',
    from: ['highland-cow', 'sleepy-bunny'],
    strictness: 'soft',
    measure: { kind: 'needs-code', what: 'L* of muzzle vs face on the render (part colourHex is a proxy)' },
  },
  {
    id: 'muzzle-warm',
    what: 'A cream muzzle leans warm (yellowish), matching a warm face.',
    quantity: 'muzzleWarmthB',
    ranges: { 'quadruped-seated': r(14, 30) },
    proxyRanges: { 'quadruped-seated': r(10, 18) },
    why: 'Harmonious creams belong to one palette with the brown.',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'needs-code', what: 'b* of the muzzle on the render (part colourHex is a proxy)' },
  },
  {
    id: 'blush',
    what: 'Bunny and doll cheeks carry a soft pink blush just below and outside the eyes.',
    quantity: 'blushDeltaA',
    ranges: { 'biped-animal': r(6, 18), doll: r(6, 18) },
    why: 'A faint blush is the gentlest character cue; too strong reads as clown paint.',
    from: ['sleepy-bunny', 'fairy-doll'],
    strictness: 'soft',
    measure: { kind: 'needs-code', what: 'a* of the blush embroidery vs face on the render (embroidery hex is a proxy)' },
  },
  {
    id: 'blush-placement',
    what: 'The blush sits a little below the eye line.',
    quantity: 'blushBelowEye',
    ranges: { 'biped-animal': r(0.08, 0.22), doll: r(0.08, 0.22) },
    why: 'On the apple of the cheek, where a child blushes.',
    from: ['sleepy-bunny', 'fairy-doll'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'blush embroidery centre z vs eye centre z / head height' },
  },
  // ── Ears ─────────────────────────────────────────────────────────────────
  {
    id: 'ears-stand-out',
    what: 'A cow-type ear stands well out from the side of the head.',
    quantity: 'earProtrusion',
    ranges: { 'quadruped-seated': r(0.28, 0.45) },
    why: 'Ears out sideways widen the head (the head-is-the-widest rule) and frame the face.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'ear bounds x beyond head bounds x / head width' },
  },
  {
    id: 'ears-high',
    what: 'A cow-type ear sits at the brow, clearly above the eye line.',
    quantity: 'earAboveEye',
    ranges: { 'quadruped-seated': r(0.08, 0.25) },
    why: 'Ears at eye level look like handles; ears at the brow lift the face.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: '(ear bounds centre z - eye centre z) / head height' },
  },
  {
    id: 'ear-shape',
    what: 'A cow-type ear seen from the front is as wide as it is tall, not a tall ring.',
    quantity: 'earAspect',
    ranges: { 'quadruped-seated': r(0.8, 1.25) },
    why: 'A wide, open, folded ear reads soft; a tall upright ring reads like a cup handle.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'ear bounds z extent / ear bounds x extent (front view)' },
    needsShape: ['fold-ear'],
  },
  {
    id: 'ears-folded',
    what: 'Ears are folded or pinched at the base, so the rim rolls over unevenly and the opening sits off centre.',
    quantity: 'earRimRatio',
    ranges: { 'quadruped-seated': r(1.8, 4), 'biped-animal': r(1.8, 4) },
    why: 'Bec, 26 Oct: ours are "little cups vs all cutesy and folded". A fold gives the ear a soft, floppy life.',
    from: ['highland-cow', 'sleepy-bunny'],
    strictness: 'hard',
    measure: { kind: 'needs-code', what: 'rim thickness around the settled ear, front view (earMetrics already gives the pinch of a cup)' },
    needsShape: ['fold-ear'],
    estimated: true,
  },
  {
    id: 'lop-ears-long',
    what: 'Lop ears are long, hanging nearly to the table beside the body.',
    quantity: 'earLength',
    ranges: { 'biped-animal': r(1.4, 2.0) },
    why: 'Long soft lops are the bunny\'s signature and make a sleepy, cuddly outline.',
    from: ['sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'ear bounds z extent / head height' },
  },
  {
    id: 'lop-ears-wide',
    what: 'Lop ears are broad, about half the head width, so the lining shows.',
    quantity: 'earWidth',
    ranges: { 'biped-animal': r(0.4, 0.6) },
    why: 'A broad ear carries the contrast lining, a signature detail.',
    from: ['sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'ear bounds widest cross extent / head width' },
  },
  // ── Appendages (horns, tails, antennae) ─────────────────────────────────
  {
    id: 'appendage-curved',
    what: 'A horn, tail or antenna is curved along its length, never a straight cone.',
    quantity: 'appendageSagitta',
    ranges: { 'quadruped-seated': r(0.1, 0.3), 'biped-animal': r(0.1, 0.3), doll: r(0.1, 0.3) },
    why: 'Bec, 26 Oct: ours are "straight and like a unicorn horn vs having a cheeky curve upwards". A curve gives cheek.',
    from: ['highland-cow'],
    strictness: 'hard',
    measure: { kind: 'needs-code', what: 'fit a centre line to the settled appendage (ring centroids along its axis), max offset from the chord' },
    needsShape: ['bent-tube'],
    carriesTo: ['spiral-trees', 'flower-wall-hanging'],
  },
  {
    id: 'appendage-bend',
    what: 'The curve turns the tip clearly upward from where the base points.',
    quantity: 'appendageBendDeg',
    ranges: { 'quadruped-seated': r(25, 70), 'biped-animal': r(25, 70), doll: r(25, 70) },
    why: 'The "cheeky curve upwards": out first, then up.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'direction change between the base and tip halves of the fitted centre line' },
    needsShape: ['bent-tube'],
  },
  {
    id: 'appendage-rises',
    what: 'Horns point up and out, about 30-65 degrees above level.',
    quantity: 'appendageElevationDeg',
    ranges: { 'quadruped-seated': r(30, 65) },
    why: 'Up-and-out horns are perky; level horns read like handlebars.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'horn place.aim (or its placed ctrl base-to-tip) angle above the x-y plane, front view' },
  },
  {
    id: 'appendage-tapers',
    what: 'A horn or tail tapers clearly to a rounded tip.',
    quantity: 'appendageTaper',
    ranges: { 'quadruped-seated': r(0.35, 0.65), 'biped-animal': r(0.35, 0.65), doll: r(0.35, 0.65) },
    why: 'A taper reads organic and soft; a near-parallel tube reads like a peg.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'settled cross-section radius at 15% vs 85% along the centre line (round counts are only a proxy: a 4-st tip still renders yarn-thick)' },
    needsShape: ['bent-tube'],
  },
  {
    id: 'appendage-short',
    what: 'Horns stay short, under a third of the head width.',
    quantity: 'appendageLength',
    ranges: { 'quadruped-seated': r(0.22, 0.35) },
    why: 'Stubby horns are a calf\'s; long horns make it an adult bull.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'horn placed ctrl extent along its axis / head width' },
  },
  // ── Limbs ────────────────────────────────────────────────────────────────
  {
    id: 'limbs-chunky',
    what: 'Animal legs are chunky (about 0.4 of the head width), bunny arms about a quarter, doll limbs slim.',
    quantity: 'limbThickness',
    ranges: { 'quadruped-seated': r(0.33, 0.45), 'biped-animal': r(0.22, 0.32), doll: r(0.14, 0.22) },
    why: 'Chunky rounded limbs read as a squashy toy; thin ones as a model.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'front-leg / arm bounds x extent / head width' },
  },
  {
    id: 'legs-close',
    what: 'The front legs sit close together under the chin.',
    quantity: 'limbGap',
    ranges: { 'quadruped-seated': r(0.1, 0.25) },
    why: 'Legs together under the head keep the body small and the pose tidy.',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'x gap between the front-leg bounds / head width' },
  },
  {
    id: 'limb-ends-rounded',
    what: 'A leg ends in a slightly fatter rounded paw or hoof, not a straight column.',
    quantity: 'limbEndBulge',
    ranges: { 'quadruped-seated': r(1.05, 1.3) },
    why: 'A rounded foot gives the toy weight on the table and a baby-animal chunkiness.',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'needs-code', what: 'settled cross-section width near the end vs mid-length of the limb (round counts are a proxy)' },
    needsShape: ['tapered-limb'],
    estimated: true,
  },
  {
    id: 'big-feet',
    what: 'A seated biped shows big round soles, about 0.7 of the head width each.',
    quantity: 'footWidth',
    ranges: { 'biped-animal': r(0.55, 0.8) },
    why: 'Oversized feet facing the camera are pure toy; with toe beans they are a signature detail.',
    from: ['sleepy-bunny'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'foot (leg) bounds widest cross extent / head width' },
  },
  // ── Softness ─────────────────────────────────────────────────────────────
  {
    id: 'no-sharp-corners',
    what: 'The outline of the head and everything on it has no sharp corners (at most one rounded tip).',
    quantity: 'sharpCorners',
    ranges: { 'quadruped-seated': r(0, 1), 'biped-animal': r(0, 1), doll: r(0, 1) },
    why: 'Cute is round: every bar outline is made of curves; a squared-off horn end or a cut edge reads hard.',
    from: ['highland-cow', 'sleepy-bunny', 'fairy-doll'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'front-view silhouette contour of the head + appendages, turning angle over 0.04 W' },
    carriesTo: ['flower-wall-hanging', 'spiral-trees'],
  },
  {
    id: 'no-straight-edges',
    what: 'No stretch of the head\'s outline is straight for more than a quarter of the head width.',
    quantity: 'straightRun',
    ranges: { 'quadruped-seated': r(0, 0.25), 'biped-animal': r(0, 0.25), doll: r(0, 0.25) },
    why: 'Straight edges are the clearest sign of a stiff, made-by-machine shape.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'front-view silhouette contour, longest run within 0.012 W of its chord' },
    needsShape: ['bent-tube'],
    carriesTo: ['flower-wall-hanging', 'spiral-trees'],
  },
  // ── Character ────────────────────────────────────────────────────────────
  {
    id: 'gentle-tilt',
    what: 'The face is symmetrical; a small head tilt is welcome, never more than about 8 degrees.',
    quantity: 'headTiltDeg',
    ranges: { 'quadruped-seated': r(0, 8), 'biped-animal': r(0, 8), doll: r(0, 8) },
    why: 'A slight tilt is shy and sweet; a big one reads broken.',
    from: ['sleepy-bunny', 'highland-cow', 'fairy-doll'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'head placement xform (R) roll about the view axis' },
  },
  {
    id: 'one-asymmetry',
    what: 'At least one deliberate asymmetry: a tilt, a crossed leg, hair or a hat tail swept to one side, mixed curls, a single brow.',
    quantity: 'asymmetryCues',
    ranges: { 'quadruped-seated': r(1, 4), 'biped-animal': r(1, 4), doll: r(1, 4) },
    why: 'A perfectly mirrored toy looks generated; one human touch makes it look made and alive.',
    from: ['fairy-doll', 'sleepy-bunny', 'highland-cow'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'count from the program: head roll, a lean/bend on one side only, a one-sided accessory flop, curlSizeCV in range, an unmirrored embroidery' },
  },
  {
    id: 'curls-mixed',
    what: 'A curly fringe or mane mixes small tight curls and bigger loose ones.',
    quantity: 'curlSizeCV',
    ranges: { 'quadruped-seated': r(0.18, 0.4), 'biped-animal': r(0.18, 0.4), doll: r(0.18, 0.4) },
    why: 'Mixed curls look tousled and natural; uniform rings look like a pattern stamp.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'HairPatch loop/coil sizes over its loop stitches (loop, loopByRound, coil, coilByRound) std / mean' },
    carriesTo: ['flower-wall-hanging'],
    estimated: true,
  },
  // ── Added by eye against the bar (rule-calib-1027, 27 Oct 2026) ─────────
  {
    id: 'appendage-clears-crown',
    what: 'A horn tip stands up level with the crown of the curls, clear of the fringe, not a nub hidden in it.',
    quantity: 'appendageTipBelowCrown',
    ranges: { 'quadruped-seated': r(-0.15, 0.08) },
    why: 'Rule-calib 1027: the cow\'s horns passed every horn rule and still read as nubs because the whole horn sat 0.15 H below the crown, behind the fringe. The bar\'s tips reach the crown line.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: '(head + hair top z - horn tip z) / head height, tip = the visible centre line\'s end plus its tip allowance' },
  },
  {
    id: 'appendage-slender',
    what: 'A horn is slender where it leaves the head: about a seventh of the head width, never a fat wedge.',
    quantity: 'appendageThickness',
    ranges: { 'quadruped-seated': r(0.1, 0.2) },
    why: 'Rule-calib 1027: the taper rule only ratios tip to base, so a short fat wedge (base 0.27 W) passed; the bar\'s horn is a slim banana (0.147 W).',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'the visible centre line\'s settled thickness at 5% from the head / head width' },
    needsShape: ['bent-tube'],
  },
  {
    id: 'ear-rim-thick',
    what: 'A cow-type ear\'s rim is a plump roll all the way round the hollow, never a one-yarn edge.',
    quantity: 'earRimMin',
    ranges: { 'quadruped-seated': r(0.12, 0.35) },
    why: 'Rule-calib 1027: the fold rule (21) ratios thickest to thinnest rim, so a thin lower lip under a thick top roll passed while the ear read as a thin leaf; the bar\'s cups are thick all round.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'needs-code', what: 'the thinnest smoothed rim bearing of earRimRatio / the ear\'s width beside the head' },
    needsShape: ['rolled-rim-cup'],
    estimated: true,
  },
  {
    id: 'muzzle-light',
    what: 'A contrast muzzle is a light cream in its own right, not an oatmeal that only looks light beside a dark face.',
    quantity: 'muzzleLightness',
    ranges: { 'quadruped-seated': r(60, 78) },
    proxyRanges: { 'quadruped-seated': r(75, 84) },
    why: 'Rule-calib 1027: the tone rule (14) is a difference, so a dark face let a dull oatmeal (#c8ad8b) pass at +45; the bar\'s muzzle reads L* 66-68 at its centre, a light warm ivory.',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'needs-code', what: 'L* of the muzzle on the render (part colourHex is a proxy: see proxyRanges)' },
  },
  {
    id: 'curls-packed',
    what: 'A curly fringe is a dense cap of many small curls, not a sparse ring of big open loops.',
    quantity: 'curlPacking',
    ranges: { 'quadruped-seated': r(0.8, 1.8), 'biped-animal': r(0.8, 1.8), doll: r(0.8, 1.8) },
    why: 'Rule-calib 1027: the mixed-curls rule (37) passed on 26 big open rings with the brown showing between them; the bar\'s fringe is 40-odd small rosettes packed edge to edge.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'loopBodies sizes (2 x radius of gyration) and count over the hair ctrl front-view box' },
    carriesTo: ['flower-wall-hanging'],
    estimated: true,
  },
  {
    id: 'fringe-low',
    what: 'The fringe lies on the head like a cap, its top not far above the crown of the head.',
    quantity: 'fringeHeight',
    ranges: { 'quadruped-seated': r(0.03, 0.13) },
    why: 'Rule-calib 1027: our loops stood 0.18 H off the crown as a mound, which also buried the horns; the bar\'s cap is about 0.09 H deep.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: '(hair ctrl top z - head bounds top z) / head height' },
    estimated: true,
  },
  // ── Added from Bec's "standard for any cutesy toy" finishes (lamb-1027) ──
  {
    id: 'eyes-set-in',
    what: 'Safety eyes sit sunk into the face, pulled into the stuffing, not perched proud on it.',
    quantity: 'eyeProtrusion',
    ranges: { 'quadruped-seated': r(0.1, 0.42), 'biped-animal': r(0.1, 0.42), doll: r(0.1, 0.42) },
    why: 'Bec, 27 Oct: "eyes pushed into the face" is standard for any cutesy toy; a proud bead reads startled and stuck on. The bar cow\'s eyes are set into the pile (judged ~0.25 of the eye diameter showing).',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'eye prop dome front minus the mean fabric height in a 1.2-2.2 eye-radius ring round it, along the eye axis / eye diameter' },
    estimated: true,
  },
  {
    id: 'limbs-slim-at-join',
    what: 'A leg or arm is stuffed firmly at the foot and lightly toward the top, so it narrows where it joins the body.',
    quantity: 'limbJoinRatio',
    ranges: { 'quadruped-seated': r(0.45, 0.85), 'biped-animal': r(0.45, 0.9) },
    why: 'Bec, 27 Oct: the bar\'s front leg is slim where it meets the chest; ours was fat right up under the muzzle. Stuffing tapers to the joint so the limb sews on neatly and moves. Bar cow judged ~0.7.',
    from: ['highland-cow'],
    strictness: 'firm',
    measure: { kind: 'engine-now', from: 'fitted limb centre line: thickness 10% from the join / widest over the far 30%' },
    estimated: true,
  },
  {
    id: 'feet-forward',
    what: 'Seated back legs present their feet forward, the round soles showing to the lens, not lumps at the sides.',
    quantity: 'footForwardDeg',
    ranges: { 'quadruped-seated': r(0, 35) },
    why: 'Bec, 27 Oct: seated back legs show round soles to the front (a contrast sole where it suits). The bar cow\'s back feet face the camera (judged ~15 deg).',
    from: ['highland-cow'],
    strictness: 'soft',
    measure: { kind: 'engine-now', from: 'back-leg place.aim (rounded sole end) against the front frame' },
    estimated: true,
  },
]

/** The bar toy each set of measurements came from (crochet-bar/proofs/cute-rules/measurements.json). */
export interface ToyMeasurement {
  label: string
  family: ToyFamily
  values: Readonly<Partial<Record<CuteQuantity, number>>>
}

/** Bec's bar toys, measured (26 Oct 2026; rules 38-41 added 27 Oct: the
 *  cow's horn tip 7 px below its 978 crown over H 366, horn base 45 px over
 *  W 307, the ear rim judged ~20 px of its 103 px width, muzzle L* 65.9).
 *  Rounded from measurements.json. */
export const BAR_MEASUREMENTS: readonly ToyMeasurement[] = [
  {
    label: 'bar highland cow',
    family: 'quadruped-seated',
    values: {
      headHeightShare: 0.59, headToTorsoWidth: 0.984, earSpanToWidest: 1.0, haunchToHead: 1.678,
      eyeSpacing: 0.575, eyeHeightFromChin: 0.448, eyeSize: 0.116, eyeMuzzleGap: -0.039, eyeInsetFromMuzzleEdge: 0.046,
      eyeFaceDeltaL: 30.4, muzzleWidth: 0.668, muzzleHeight: 0.421, chinOverhang: -0.003, muzzleFaceDeltaL: 35.6, muzzleWarmthB: 20,
      earProtrusion: 0.34, earAboveEye: 0.137, earAspect: 1.0, earRimRatio: 2.8,
      appendageSagitta: 0.168, appendageBendDeg: 37.2, appendageElevationDeg: 41.8, appendageTaper: 0.56, appendageLength: 0.309,
      appendageTipBelowCrown: 0.019, appendageThickness: 0.147, earRimMin: 0.2, muzzleLightness: 65.9,
      curlPacking: 1.1, fringeHeight: 0.09,
      limbThickness: 0.401, limbGap: 0.176, limbEndBulge: 1.15,
      sharpCorners: 1, straightRun: 0.223, headTiltDeg: 0, asymmetryCues: 1, curlSizeCV: 0.28,
      eyeProtrusion: 0.25, limbJoinRatio: 0.7, footForwardDeg: 15,
    },
  },
  {
    label: 'bar sleepy bunny',
    family: 'biped-animal',
    values: {
      headHeightShare: 0.477, headToTorsoWidth: 1.136, earSpanToWidest: 1.0,
      eyeSpacing: 0.647, eyeHeightFromChin: 0.306, eyeSize: 0.166, eyeFaceDeltaL: 65.8,
      muzzleWidth: 0.378, muzzleHeight: 0.231, muzzleFaceDeltaL: 2.9, blushDeltaA: 13.5, blushBelowEye: 0.159,
      earLength: 1.799, earWidth: 0.529, earRimRatio: 2.5,
      limbThickness: 0.256, footWidth: 0.698, headTiltDeg: 5.6, asymmetryCues: 2,
    },
  },
  {
    label: 'bar fairy doll',
    family: 'doll',
    values: {
      headHeightShare: 0.287, headToTorsoWidth: 1.477,
      eyeSpacing: 0.588, eyeHeightFromChin: 0.25, eyeSize: 0.097, eyeFaceDeltaL: 77.5,
      blushDeltaA: 9, blushBelowEye: 0.124, limbThickness: 0.173, headTiltDeg: 0.4, asymmetryCues: 3,
    },
  },
]

/** Our cow as rendered in cow-fable-1025 r1 (the build Bec judged on 26 Oct). */
export const OURS_COW_1025R1: ToyMeasurement = {
  label: 'our cow, cow-fable-1025 r1',
  family: 'quadruped-seated',
  values: {
    headHeightShare: 0.601, headToTorsoWidth: 0.911, earSpanToWidest: 0.923, haunchToHead: 1.597,
    eyeSpacing: 0.472, eyeHeightFromChin: 0.477, eyeSize: 0.142, eyeMuzzleGap: 0.022, eyeInsetFromMuzzleEdge: 0.082,
    eyeFaceDeltaL: 27.8, muzzleWidth: 0.635, muzzleHeight: 0.397, chinOverhang: 0.267, muzzleFaceDeltaL: 56.8, muzzleWarmthB: 10,
    earProtrusion: 0.242, earAboveEye: 0.017, earAspect: 1.65, earRimRatio: 1.1,
    appendageSagitta: 0.019, appendageBendDeg: -4.3, appendageElevationDeg: 19.7, appendageTaper: 0.75, appendageLength: 0.374,
    appendageTipBelowCrown: 0.177, appendageThickness: 0.126, earRimMin: 0.08, muzzleLightness: 85.5,
    curlPacking: 0.55, fringeHeight: 0.16,
    limbThickness: 0.369, limbGap: 0.204, limbEndBulge: 1.0,
    sharpCorners: 4, straightRun: 0.308, headTiltDeg: 0, asymmetryCues: 0, curlSizeCV: 0.08,
  },
}

export interface CuteVerdict {
  rule: CuteRule
  value: number
  range: CuteRange
  pass: boolean
}

/**
 * Check measured values against the rules for a family. Pure; a rule with no
 * range for the family, or a quantity not measured, is skipped. Step 3 will
 * call this with values read off a built toy; nothing calls it yet.
 */
export function checkCuteRules(family: ToyFamily, values: Readonly<Partial<Record<CuteQuantity, number>>>): CuteVerdict[] {
  const out: CuteVerdict[] = []
  for (const rule of CUTE_RULES) {
    const range = rule.ranges[family]
    const value = values[rule.quantity]
    if (!range || value == null) continue
    out.push({ rule, value, range, pass: value >= range.min && value <= range.max })
  }
  return out
}
