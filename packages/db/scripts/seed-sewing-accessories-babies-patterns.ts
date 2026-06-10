/**
 * Sewing S-4 accessories + babies/kids patterns seed (2026-06-10).
 *
 * Writes 12 house-original SewingPattern rows to production:
 *   - 8 accessories (garmentCategory: ACCESSORIES)
 *   - 2 babies     (garmentCategory: BABIES)
 *   - 2 kids       (garmentCategory: KIDS)
 *
 * Idempotent on slug. Never touches Category.sewing visibility or
 * pipelineStatus.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-accessories-babies-patterns.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import { prisma, Visibility } from '../src/index.js'

// ---------------------------------------------------------------------------
// Piece helpers
// ---------------------------------------------------------------------------

function rect(
  name: string,
  widthMm: number,
  heightMm: number,
  cut: number,
  grainDirection: 'lengthwise' | 'crosswise' | 'bias',
  label: string,
  fold: 'on-fold' | null = null,
): object {
  const pts = [
    { x: 0, y: 0 },
    { x: widthMm, y: 0 },
    { x: widthMm, y: heightMm },
    { x: 0, y: heightMm },
    { x: 0, y: 0 },
  ]
  const midX = widthMm / 2
  return {
    name,
    cut,
    fold,
    grainDirection,
    pathPoints: pts,
    grainline: { from: { x: midX, y: 20 }, to: { x: midX, y: heightMm - 20 } },
    notchPoints: [],
    onFoldEdge: fold === 'on-fold' ? { from: { x: 0, y: 0 }, to: { x: 0, y: heightMm } } : null,
    label,
  }
}

// ---------------------------------------------------------------------------
// Instructions bodies
// ---------------------------------------------------------------------------

function tt(text: string): object {
  return { type: 'text', text }
}

function ttGloss(text: string, termSlug: string): object {
  return {
    type: 'text',
    marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }],
    text,
  }
}

function para(...nodes: object[]): object {
  return { type: 'paragraph', content: nodes }
}

function h2(text: string): object {
  return { type: 'heading', attrs: { level: 2 }, content: [tt(text)] }
}

function step(...nodes: object[]): object {
  return { type: 'listItem', content: [{ type: 'paragraph', content: nodes }] }
}

function ol(...steps: object[]): object {
  return { type: 'orderedList', content: steps }
}

// ---------------------------------------------------------------------------
// Pattern definitions
// ---------------------------------------------------------------------------

// 1. Knit-fabric headband with twist front
function headbandTwistFront(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('The twist front sits at the centre of the headband before the tube is sewn closed, so cutting and folding is where this pattern lives or dies.')),
      h2('What you need'),
      para(tt('Knit fabric (jersey or stretch velvet works well), matching thread, ballpoint or stretch needle.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut two headband panels 60 x 12 cm for size M (see sizing chart). Stretch runs along the length.')),
        step(tt('Fold each panel in half lengthwise, right sides together. Pin the long edges.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' the long edge with a 1 cm seam allowance. Trim to 6 mm.')),
        step(tt('Turn both tubes right side out. Press gently so the seam sits at the back edge.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': tuck in 1 cm at each short end of both tubes.')),
        step(tt('Lay both tubes flat. Bring the right end of tube A under the left end of tube B, then cross B back over A to form the twist. Pin.')),
        step(tt('Slip one open end inside the other so the folded edges align. Pin securely all the way around.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' close to the edge through all layers. Sew a second row 3 mm inside the first for strength.')),
        step(tt('Stretch the headband gently between your hands to relax the seams and check the twist is centred.')),
      ),
    ],
  }
  return {
    slug: 'sewing-knit-headband-twist-front',
    name: 'Knit-fabric headband, twist front',
    description: 'A stretch-knit headband with a central twist, no elastic needed. Three sizes cover most adult head circumferences.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'S', notes: 'head circumference 52-54 cm' },
      { name: 'M', notes: 'head circumference 55-57 cm' },
      { name: 'L', notes: 'head circumference 58-60 cm' },
    ],
    requiredMeasurements: ['head-circumference'],
    recommendedFabrics: [{ type: 'Jersey knit', weight: 'light-medium', notes: 'Needs at least 50 % stretch lengthwise.' }],
    recommendedNotions: [
      { name: 'Stretch thread', spec: 'Polyester', quantity: 1 },
      { name: 'Ballpoint needle', spec: '80/12', quantity: 1 },
    ],
    fabricRequirementsCm: {
      S: { '150': { lengthCm: 25, notes: 'Cut 2 panels 56 x 12 cm' } },
      M: { '150': { lengthCm: 25, notes: 'Cut 2 panels 60 x 12 cm' } },
      L: { '150': { lengthCm: 25, notes: 'Cut 2 panels 64 x 12 cm' } },
    },
    pieceList: [
      rect('Headband panel A', 600, 120, 1, 'lengthwise', 'Headband panel A (cut 1)'),
      rect('Headband panel B', 600, 120, 1, 'lengthwise', 'Headband panel B (cut 1)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 2. Hair scrunchie
function hairScrunchie(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('A scrunchie is a fabric tube threaded with elastic: the whole construction happens in one step, provided you leave a gap in the seam for the elastic.')),
      h2('What you need'),
      para(tt('Any light-to-medium fabric (cotton lawn, jersey, or satin), elastic (1.2 cm wide), thread, bodkin or safety pin.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one panel 80 x 10 cm for size M. For knit fabric cut with the stretch running along the length.')),
        step(tt('Fold the panel in half lengthwise, right sides together. Pin the long edge.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' the long edge with a 1 cm seam allowance, leaving a 4 cm gap near one short end for the elastic.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': turn the tube right side out. Press so the seam runs along the back.')),
        step(tt('Bring the short ends of the tube together, right sides facing. Sew them together with a 1 cm seam allowance, leaving the elastic gap clear.')),
        step(tt('Thread the elastic through the tube using a bodkin. Overlap the elastic ends 1 cm and stitch them together securely.')),
        step(ttGloss('Casing elastic', 'casing-elastic'), tt(': pull the joined elastic into the tube so it distributes evenly around the casing.')),
        step(tt('Slipstitch or machine-stitch the gap in the seam closed.')),
        step(tt('Distribute the gathers evenly around the scrunchie and give it a gentle press.')),
      ),
    ],
  }
  return {
    slug: 'sewing-hair-scrunchie',
    name: 'Hair scrunchie',
    description: 'A gathered fabric scrunchie made from a single tube of fabric with an elastic casing. Works in woven or knit.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: true,
    closureType: 'elastic',
    supportedSizes: [
      { name: 'S', notes: '12 cm elastic' },
      { name: 'M', notes: '15 cm elastic' },
      { name: 'L', notes: '18 cm elastic' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Cotton lawn', weight: 'light', notes: 'Gives a delicate gather.' },
      { type: 'Jersey knit', weight: 'light', notes: 'Stretch knit needs no pressing.' },
    ],
    recommendedNotions: [
      { name: 'Elastic', spec: '1.2 cm wide, cut to size', quantity: 1 },
      { name: 'Bodkin or safety pin', spec: '', quantity: 1 },
    ],
    fabricRequirementsCm: {
      S: { '140': { lengthCm: 15, notes: 'Cut 1 panel 70 x 10 cm' } },
      M: { '140': { lengthCm: 15, notes: 'Cut 1 panel 80 x 10 cm' } },
      L: { '140': { lengthCm: 15, notes: 'Cut 1 panel 90 x 10 cm' } },
    },
    pieceList: [
      rect('Scrunchie tube', 800, 100, 1, 'lengthwise', 'Scrunchie tube (cut 1)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 3. Belt with D-ring closure
function beltDRing(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('The secret to a clean belt is interfacing cut identically to the fabric: once pressed, the belt should feel firm but not stiff.')),
      h2('What you need'),
      para(tt('Medium-to-heavy woven fabric, fusible interfacing, two D-rings (3 cm wide), thread.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one belt body strip 8 cm wide, length equal to your waist measurement plus 30 cm ease. Cut one tip piece 8 x 12 cm.')),
        step(ttGloss('Interfacing, fusible', 'interfacing-fusible'), tt(': cut interfacing to the same dimensions. Fuse to the wrong side of each piece following the manufacturer instructions, pressing slowly.')),
        step(tt('Fold the belt body in half lengthwise, right sides together. Stitch along the long edge with a 1 cm seam allowance. Do the same for the tip piece, leaving the short end open.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': trim the seam allowance to 6 mm. Turn both pieces right side out with a point turner. Press flat.')),
        step(tt('Slip the tip piece over one end of the belt body. Tuck the raw ends inside and pin them together.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' around all four sides of the tip, 5 mm from the edge. Topstitch the full length of the belt 5 mm from each long edge.')),
        step(tt('Fold the opposite end of the belt 4 cm to the wrong side. Thread through both D-rings, then fold back a further 2 cm. Pin.')),
        step(tt('Topstitch a 3 cm box through all layers at the D-ring end to secure the rings firmly.')),
        step(tt('Cut a neat pointed or rounded shape at the tip end if desired. Seal the cut edges with a lighter flame if the fabric frays.')),
      ),
    ],
  }
  return {
    slug: 'sewing-belt-d-ring-closure',
    name: 'Belt with D-ring closure',
    description: 'A flat woven belt fastened with two D-rings: no sewing through metal, no buckle prong to align.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: true,
    hasClosure: true,
    closureType: 'buckle',
    supportedSizes: [
      { name: 'S', notes: 'waist 66-76 cm' },
      { name: 'M', notes: 'waist 76-86 cm' },
      { name: 'L', notes: 'waist 86-96 cm' },
      { name: 'XL', notes: 'waist 96-106 cm' },
    ],
    requiredMeasurements: ['waist-circumference'],
    recommendedFabrics: [
      { type: 'Canvas or twill', weight: 'medium-heavy', notes: 'Needs good body when interfaced.' },
    ],
    recommendedNotions: [
      { name: 'D-rings', spec: '3 cm wide, metal or resin', quantity: 2 },
      { name: 'Fusible interfacing', spec: 'Medium weight, non-woven', quantity: 1 },
    ],
    fabricRequirementsCm: {
      S: { '140': { lengthCm: 30, notes: 'Belt body + tip' } },
      M: { '140': { lengthCm: 35, notes: 'Belt body + tip' } },
      L: { '140': { lengthCm: 40, notes: 'Belt body + tip' } },
      XL: { '140': { lengthCm: 45, notes: 'Belt body + tip' } },
    },
    pieceList: [
      rect('Belt body', 1100, 80, 1, 'lengthwise', 'Belt body (cut 1, custom length)'),
      rect('Belt tip', 120, 80, 1, 'lengthwise', 'Belt tip (cut 1)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 4. Men's tie, standard length
function mensTie(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt("A tie is cut entirely on the bias, which is why the fabric drapes and knots cleanly: every seam must stay on that 45-degree angle or the tie will twist.")),
      h2('What you need'),
      para(tt('Woven fabric cut on the bias (silk, fine wool, or cotton shirting), tie interlining (wool or polyester felt), thread, slip-stitch needle for the back seam.')),
      h2('Steps'),
      ol(
        step(ttGloss('Bias cutting', 'bias-cutting'), tt(': mark the 45-degree grain on your fabric with chalk. Cut the front blade, rear blade, and neck seam pieces on the bias. Cut the interlining on the straight grain.')),
        step(tt('Press the interlining onto the wrong side of the front blade. Pin carefully: the bias fabric distorts if you stretch it against the straight-grain interlining.')),
        step(tt('Place the front and rear blades right sides together, lining up the narrow tip. Pin from the tip upwards.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' the long edges of the blade from the tip to the wide end, 1 cm seam allowance. Ease the fabric, do not pull.')),
        step(ttGloss('Pressing seams open', 'pressing-seams-open'), tt(': press both long seams open gently over a seam roll. Bias seams bruise easily.')),
        step(tt('Fold and press the long edges of the blade to the centre on the wrong side. The interlining sits inside.')),
        step(tt('Slip-stitch the back seam closed by hand, picking up only the fold of the fabric, not the interlining.')),
        step(tt('Attach the neck seam piece between the front and rear blades at the neckline join, right sides together. Stitch, press, and slip-stitch closed as before.')),
        step(tt('Press the finished tie over a damp cloth, steaming gently. Hang for 24 hours before knotting for the first time.')),
      ),
    ],
  }
  return {
    slug: 'sewing-mens-tie-standard',
    name: "Men's tie, standard length",
    description: "A classic woven tie with three pieces cut on the bias, an inserted interlining, and a hand-slip-stitched back seam.",
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'INTERMEDIATE',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'Standard', notes: '137 cm finished' },
      { name: 'Narrow', notes: '6 cm blade width' },
      { name: 'Wide', notes: '9 cm blade width' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Silk', weight: 'medium', notes: 'Bias-cuts cleanly, drapes well.' },
      { type: 'Fine wool', weight: 'light', notes: 'Gives a softer knot.' },
      { type: 'Cotton shirting', weight: 'light', notes: 'Good for practice or casual ties.' },
    ],
    recommendedNotions: [
      { name: 'Tie interlining', spec: 'Wool or polyester felt, 60 cm', quantity: 1 },
      { name: 'Thread', spec: 'Silk or polyester, colour-matched', quantity: 1 },
    ],
    fabricRequirementsCm: {
      Standard: { '140': { lengthCm: 90, notes: 'All pieces cut on bias; allow 50 % extra for layout' } },
      Narrow: { '140': { lengthCm: 85, notes: 'All pieces cut on bias' } },
      Wide: { '140': { lengthCm: 95, notes: 'All pieces cut on bias' } },
    },
    pieceList: [
      {
        name: 'Tie front blade',
        cut: 1,
        fold: null,
        grainDirection: 'bias',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 75, y: 0 },
          { x: 90, y: 150 },
          { x: 60, y: 1100 },
          { x: 15, y: 1100 },
          { x: 0, y: 150 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 45, y: 50 }, to: { x: 45, y: 1050 } },
        notchPoints: [{ x: 37, y: 550 }],
        onFoldEdge: null,
        label: 'Tie front blade (cut 1 on bias)',
      },
      {
        name: 'Tie rear blade',
        cut: 1,
        fold: null,
        grainDirection: 'bias',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 60, y: 0 },
          { x: 70, y: 100 },
          { x: 50, y: 900 },
          { x: 10, y: 900 },
          { x: 0, y: 100 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 35, y: 50 }, to: { x: 35, y: 850 } },
        notchPoints: [],
        onFoldEdge: null,
        label: 'Tie rear blade (cut 1 on bias)',
      },
      {
        name: 'Tie neck seam',
        cut: 1,
        fold: null,
        grainDirection: 'bias',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 40, y: 0 },
          { x: 40, y: 200 },
          { x: 0, y: 200 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 20, y: 20 }, to: { x: 20, y: 180 } },
        notchPoints: [],
        onFoldEdge: null,
        label: 'Tie neck seam (cut 1 on bias)',
      },
      rect('Tie interlining', 75, 1150, 1, 'lengthwise', 'Tie interlining (cut 1, straight grain)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 5. Bow tie, self-tie classic shape
function bowTieSelfTie(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('A self-tie bow tie has three pieces: two mirrored bow wings and a neck band. The bow shape comes from turning and pressing, not from darts or gathers.')),
      h2('What you need'),
      para(tt('Woven fabric (cotton shirting, silk, or brocade), light fusible interfacing, thread, adjustable hardware (collar hook and bar).')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut two bow main pieces as mirrors. Cut one centre knot piece and one neck band.')),
        step(ttGloss('Interfacing, fusible', 'interfacing-fusible'), tt(': fuse light interfacing to the wrong side of each bow piece and the neck band. Press firmly with steam.')),
        step(tt('Place the two bow main pieces right sides together. Stitch all the way around the curved edges, leaving the neck end open. Clip the curves.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': turn the bow right side out through the opening. Use a blunt point to ease out the curves. Press flat.')),
        step(tt('Fold the neck band in half lengthwise, right sides together. Stitch the long edge and one short end. Turn and press.')),
        step(tt('Slide the open end of the bow piece onto the neck band. Tuck the raw edges inside and pin.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' across the join, 5 mm from the edge, to hold the bow firmly onto the band.')),
        step(tt('Fold and stitch the centre knot piece into a small rectangle. Wrap it around the centre of the bow and slip-stitch the back closed.')),
        step(ttGloss('Pressing seams open', 'pressing-seams-open'), tt(' on the neck band seam: press from the inside to avoid shine on the right side.')),
        step(tt('Attach the collar hook to one end of the neck band and the adjustable bar to the other. Test the neck fit and adjust as needed.')),
      ),
    ],
  }
  return {
    slug: 'sewing-bow-tie-self-tie',
    name: 'Bow tie, self-tie classic shape',
    description: 'A three-piece self-tie bow tie with interfaced wings, a centre knot, and an adjustable neck band.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'IMPROVER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: true,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'Standard', notes: 'neck 38-42 cm adjustable' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Cotton shirting', weight: 'light', notes: 'Crisp result after pressing.' },
      { type: 'Silk', weight: 'medium', notes: 'Slippery to sew; use plenty of pins.' },
    ],
    recommendedNotions: [
      { name: 'Fusible interfacing', spec: 'Light weight, woven', quantity: 1 },
      { name: 'Collar hook and adjustable bar', spec: 'Nickel or brass', quantity: 1 },
    ],
    fabricRequirementsCm: {
      Standard: { '140': { lengthCm: 30, notes: 'All three pieces from one strip' } },
    },
    pieceList: [
      {
        name: 'Bow main',
        cut: 2,
        fold: null,
        grainDirection: 'lengthwise',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 120, y: 0 },
          { x: 140, y: 40 },
          { x: 140, y: 80 },
          { x: 120, y: 120 },
          { x: 0, y: 120 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 70, y: 20 }, to: { x: 70, y: 100 } },
        notchPoints: [],
        onFoldEdge: null,
        label: 'Bow main (cut 2 mirror)',
      },
      rect('Bow centre knot', 60, 40, 1, 'lengthwise', 'Bow centre knot (cut 1)'),
      rect('Neck band', 420, 40, 1, 'lengthwise', 'Neck band (cut 1)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 6. Knit-fabric infinity scarf
function knittedInfinityScarf(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('An infinity scarf is a wide tube of knit fabric with the two short ends joined into a loop: there are two seams in the whole project.')),
      h2('What you need'),
      para(tt('Stretch jersey or sweatshirt fleece (at least 40 % stretch lengthwise), matching thread, stretch or ballpoint needle.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one rectangle 122 x 52 cm. Stretch runs across the 52 cm width.')),
        step(tt('Fold the rectangle in half lengthwise, right sides together, matching the long edges.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' the long edge with a 1 cm seam allowance, using a slight zigzag or stretch stitch to keep the seam pliable.')),
        step(ttGloss('Finishing the seam allowance', 'finishing-seam-allowance'), tt(': overlock or zigzag both seam edges together. Press to one side.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': turn the tube right side out. Line up the two short ends, right sides facing, tucking one end inside the other.')),
        step(tt('Pin the short ends together, matching the long seam. Stitch around the circumference, 1 cm from the edge, leaving a 10 cm gap to turn through.')),
        step(tt('Turn right side out through the gap. Tuck the raw edges of the gap inward by 1 cm. Pin.')),
        step(tt('Machine-stitch or slip-stitch the gap closed. Press the join lightly.')),
      ),
    ],
  }
  return {
    slug: 'sewing-knit-infinity-scarf',
    name: 'Knit-fabric infinity scarf',
    description: 'A seamless-looking loop scarf made from a single rectangle of stretch knit fabric with just two seams.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'Standard', notes: '60 cm circumference, 25 cm tube width' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Jersey knit', weight: 'medium', notes: 'Minimum 40 % stretch lengthwise.' },
      { type: 'Sweatshirt fleece', weight: 'medium-heavy', notes: 'Cosy result; does not need hemming.' },
    ],
    recommendedNotions: [
      { name: 'Stretch or ballpoint needle', spec: '80/12', quantity: 1 },
    ],
    fabricRequirementsCm: {
      Standard: { '150': { lengthCm: 55, notes: 'Cut 1 panel 122 x 52 cm' } },
    },
    pieceList: [
      rect('Scarf tube', 1220, 520, 1, 'crosswise', 'Scarf tube (cut 1)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 7. Snood with ribbed-edge cuffs
function snoodRibbedCuffs(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('The ribbed cuffs on this snood are strips of rib-knit fabric: attach them last, stretching them slightly as you sew so they gather the body edge.')),
      h2('What you need'),
      para(tt('Main knit fabric (jersey or interlock), rib-knit trim fabric for the cuffs, stretch thread, ballpoint needle.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one snood body 59 x 62 cm. Stretch runs across the 59 cm width. Cut two cuff strips 59 x 8 cm from rib-knit, stretch along the length.')),
        step(tt('Fold the snood body in half, short edges together, right sides facing. Stitch the short edges with a 1 cm seam allowance to form a loop.')),
        step(ttGloss('Finishing the seam allowance', 'finishing-seam-allowance'), tt(': overlock or zigzag the seam edges. Press.')),
        step(tt('Fold each cuff strip in half lengthwise, wrong sides together. You now have two double-layer cuff rings.')),
        step(tt('Place one cuff ring inside the snood tube at one open end, matching the raw edges and the seam. Pin, stretching the cuff evenly around the snood edge.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' the cuff to the snood with a 1 cm seam allowance, using a stretch stitch. Repeat for the other cuff ring at the opposite end.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' the seam allowance down towards the snood body, 5 mm from the seam line, using a stretch stitch.')),
        step(tt('Turn the snood right side out and check that both cuffs are lying flat and evenly gathered. Press the body lightly.')),
      ),
    ],
  }
  return {
    slug: 'sewing-snood-ribbed-cuffs',
    name: 'Snood with ribbed-edge cuffs',
    description: 'A knit snood with rib-trim cuffs at both openings: the cuffs are attached stretched so they gather the body edge neatly.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'Standard', notes: 'neck circumference 56 cm, length 30 cm' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Jersey knit', weight: 'medium', notes: 'Body fabric.' },
      { type: 'Rib-knit trim', weight: 'light', notes: 'Cuff strips.' },
    ],
    recommendedNotions: [
      { name: 'Stretch or ballpoint needle', spec: '80/12', quantity: 1 },
    ],
    fabricRequirementsCm: {
      Standard: { '150': { lengthCm: 70, notes: 'Body 59 x 62 cm + 2 cuff strips 59 x 8 cm' } },
    },
    pieceList: [
      rect('Snood body', 590, 620, 1, 'crosswise', 'Snood body (cut 1)'),
      rect('Cuff strip', 590, 80, 2, 'lengthwise', 'Cuff strip (cut 2)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 8. Sun hat with wide brim
function sunHatWideBrim(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('The brim of this hat is two layers of woven fabric sandwiching a layer of fusible interfacing: that laminate is what gives the brim its structure and sun-blocking weight.')),
      h2('What you need'),
      para(tt('Medium woven fabric (cotton canvas, denim, or ticking), lining fabric, fusible interfacing (medium weight), thread.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one crown circle and one side band from main fabric and lining. Cut two brim pieces from main fabric and two from interfacing.')),
        step(ttGloss('Interfacing, fusible', 'interfacing-fusible'), tt(': fuse interfacing to the wrong side of each brim piece. Press firmly.')),
        step(tt('Place both brim pieces right sides together. Stitch the outer curved edge with a 1 cm seam allowance. Clip the curve at 1 cm intervals.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': turn the brim right side out through the inner opening. Press the outer edge flat with a seam roll.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' the outer curved edge of the brim in parallel rows 6 mm apart, starting 6 mm from the fold edge. This gives the brim its characteristic stiff-but-flexible feel.')),
        step(ttGloss('Pressing seams open', 'pressing-seams-open'), tt(': sew the side band into a loop by joining the short ends. Press the seam open.')),
        step(tt('Pin the crown circle to the top of the side band loop, right sides together. Stitch with a 1 cm seam allowance. Press the seam down into the band.')),
        step(tt('Repeat steps 6 and 7 for the lining pieces.')),
        step(tt('Pin the brim to the hat body at the inner opening, raw edges matching, right sides together. Stitch with a 1 cm seam allowance.')),
        step(tt('Place the lining inside the hat, wrong sides together. Tuck the lining seam allowance under and pin over the brim join. Slip-stitch or topstitch all the way around.')),
        step(tt('Press the finished hat carefully over a rolled-up towel or hat block.')),
      ),
    ],
  }
  return {
    slug: 'sewing-sun-hat-wide-brim',
    name: 'Sun hat with wide brim',
    description: 'A lined, interfaced sun hat with a wide topstitched brim and a curved crown, sized by head circumference.',
    garmentCategory: 'ACCESSORIES',
    skillLevel: 'CONFIDENT_BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: true,
    hasInterfacing: true,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'S', notes: 'head circumference 54 cm' },
      { name: 'M', notes: 'head circumference 56 cm' },
      { name: 'L', notes: 'head circumference 58 cm' },
      { name: 'XL', notes: 'head circumference 60 cm' },
    ],
    requiredMeasurements: ['head-circumference'],
    recommendedFabrics: [
      { type: 'Cotton canvas', weight: 'medium', notes: 'Main fabric. Holds shape well after interfacing.' },
      { type: 'Quilting cotton', weight: 'light', notes: 'Lining.' },
    ],
    recommendedNotions: [
      { name: 'Fusible interfacing', spec: 'Medium weight, 60 cm wide', quantity: 1 },
    ],
    fabricRequirementsCm: {
      S: { '140': { lengthCm: 60, notes: 'Main + lining each' } },
      M: { '140': { lengthCm: 65, notes: 'Main + lining each' } },
      L: { '140': { lengthCm: 70, notes: 'Main + lining each' } },
      XL: { '140': { lengthCm: 75, notes: 'Main + lining each' } },
    },
    pieceList: [
      {
        name: 'Crown circle',
        cut: 2,
        fold: null,
        grainDirection: 'lengthwise' as const,
        pathPoints: (() => {
          const r = 90; const cx = 90; const cy = 90; const pts: Array<{x:number,y:number}> = []
          for (let i = 0; i <= 36; i++) {
            const a = (i / 36) * 2 * Math.PI
            pts.push({ x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) })
          }
          return pts
        })(),
        grainline: { from: { x: 90, y: 20 }, to: { x: 90, y: 160 } },
        notchPoints: [{ x: 180, y: 90 }],
        onFoldEdge: null,
        label: 'Crown circle (cut 1 main + 1 lining)',
      },
      rect('Side band', 600, 80, 2, 'lengthwise', 'Side band (cut 1 main + 1 lining)'),
      rect('Brim outer', 600, 180, 2, 'lengthwise', 'Brim outer (cut 2 main)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 9. Baby bib with snap closure
function babyBibSnap(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('A bib is two layers of fabric cut as one shape, turned right side out through a gap, with a snap at the neck: the curved neck edge is where accuracy matters most.')),
      h2('What you need'),
      para(tt('Woven cotton (front), terry or flannel (lining), thread, one snap fastener, snap pliers or setter.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one bib front from main fabric and one from lining, including the curved neck cutout and the hanging tab allowance.')),
        step(tt('Place main fabric and lining right sides together, edges matching precisely. Pin all the way around.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' all the way around the outer edge with a 1 cm seam allowance, leaving a 5 cm gap at the lower edge for turning. Clip the curves.')),
        step(ttGloss('Turning edges cleanly', 'turning-edges-cleanly'), tt(': turn right side out through the gap. Ease the corners out gently. Press flat.')),
        step(tt('Tuck the raw edges of the gap inward by 1 cm. Pin closed.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' all the way around the bib, 5 mm from the edge. This closes the gap and gives a neat frame.')),
        step(ttGloss('Finishing the seam allowance', 'finishing-seam-allowance'), tt(': add a second row of topstitching 3 mm inside the first around the neck curve for extra strength.')),
        step(tt('Mark the snap positions at the neck tab: one ball half on the tab end, one socket half on the opposite neck edge.')),
        step(tt('Attach the snap using snap pliers or a setter tool according to the manufacturer instructions. Check it fastens and releases smoothly.')),
      ),
    ],
  }
  return {
    slug: 'sewing-baby-bib-snap-closure',
    name: 'Baby bib with snap closure',
    description: 'A double-layer fabric bib with a shaped neck cutout and a snap fastener, sized for newborn through 18 months.',
    garmentCategory: 'BABIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: true,
    hasInterfacing: false,
    hasClosure: true,
    closureType: 'snap',
    supportedSizes: [
      { name: 'Newborn-6m', notes: 'neck 24 cm' },
      { name: '6-18m', notes: 'neck 28 cm' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Woven cotton', weight: 'light', notes: 'Main fabric. Wipe-clean coating optional.' },
      { type: 'Terry cloth', weight: 'medium', notes: 'Lining: absorbent and quick-drying.' },
    ],
    recommendedNotions: [
      { name: 'Snap fastener', spec: 'KAM or metal, 1.2 cm', quantity: 1 },
      { name: 'Snap pliers', spec: 'KAM size', quantity: 1 },
    ],
    fabricRequirementsCm: {
      'Newborn-6m': { '110': { lengthCm: 30, notes: 'Main + lining each' } },
      '6-18m': { '110': { lengthCm: 35, notes: 'Main + lining each' } },
    },
    pieceList: [
      {
        name: 'Bib front',
        cut: 2,
        fold: null,
        grainDirection: 'lengthwise',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 30 },
          { x: 150, y: 60 },
          { x: 120, y: 50 },
          { x: 100, y: 50 },
          { x: 80, y: 50 },
          { x: 50, y: 60 },
          { x: 0, y: 30 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 100, y: 70 }, to: { x: 100, y: 250 } },
        notchPoints: [{ x: 200, y: 30 }, { x: 0, y: 30 }],
        onFoldEdge: null,
        label: 'Bib front (cut 1 main + 1 lining)',
      },
      rect('Hanging tab', 30, 40, 1, 'lengthwise', 'Hanging tab (cut 1)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 10. Baby blanket with mitred-corner binding
function babyBlanketMitredBinding(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('A mitred corner in binding meets at a perfect 45-degree angle: the fold is made before the binding turns the corner, not after, and that fold is what creates the mitre.')),
      h2('What you need'),
      para(tt('Main panel fabric (cotton muslin, flannel, or interlock), binding fabric cut into 6 cm wide strips, thread, pressing cloth.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one main panel 90 x 90 cm. Cut four binding strips 6 x 96 cm, with the grain running lengthwise.')),
        step(tt('Press each binding strip in half lengthwise, wrong sides together.')),
        step(ttGloss('Bias binding', 'bias-binding'), tt(': pin one binding strip to the right side of one panel edge, raw edges level. Leave 5 cm of binding overhanging at each end. Stitch with a 1.5 cm seam allowance.')),
        step(tt('Stop stitching exactly 1.5 cm from the corner. Backstitch. Remove from the machine.')),
        step(ttGloss('Mitred corner', 'mitered-corner'), tt(': fold the binding up at 45 degrees away from you, then fold it back down parallel to the next edge. Pin the fold in place.')),
        step(tt('Start stitching again at the folded edge, 1.5 cm from the raw edge. Continue along the next side. Repeat for all four corners.')),
        step(tt('Trim the overhanging binding ends to 1.5 cm and join them with a diagonal seam. Press.')),
        step(ttGloss('Pressing seams open', 'pressing-seams-open'), tt(': fold the binding over to the back. At each corner, fold and press the mitre on the back to mirror the front mitre.')),
        step(tt('Pin the binding to the back. Slip-stitch by hand all the way around, or machine-stitch in the ditch from the front.')),
        step(tt('Give the finished blanket a thorough press with a damp pressing cloth.')),
      ),
    ],
  }
  return {
    slug: 'sewing-baby-blanket-mitred-binding',
    name: 'Baby blanket with mitred-corner binding',
    description: 'A 90 x 90 cm baby blanket finished with a folded binding and a 45-degree mitred corner at each edge.',
    garmentCategory: 'BABIES',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.5,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'Standard', notes: '90 x 90 cm finished' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Cotton muslin', weight: 'light', notes: 'Softens beautifully with washing.' },
      { type: 'Flannel', weight: 'medium', notes: 'Warm and cosy; preshrink before cutting.' },
    ],
    recommendedNotions: [
      { name: 'Thread', spec: 'Polyester, colour-matched', quantity: 1 },
      { name: 'Pressing cloth', spec: 'Cotton, damp', quantity: 1 },
    ],
    fabricRequirementsCm: {
      Standard: { '140': { lengthCm: 110, notes: 'Main panel 90 x 90 cm + 4 binding strips 6 x 96 cm' } },
    },
    pieceList: [
      rect('Main panel', 900, 900, 1, 'lengthwise', 'Main panel (cut 1)'),
      rect('Binding strip long', 960, 60, 2, 'lengthwise', 'Binding strip long (cut 2)'),
      rect('Binding strip short', 960, 60, 2, 'lengthwise', 'Binding strip short (cut 2, mitre trimmed at corners)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 11. Kids' apron, one-size ages 4-10
function kidsApronOneSize(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt("A child's apron has three ties: one neck loop and two waist ties. The whole thing can be cut from a 50 cm length of fabric, with the pocket cut from scraps.")),
      h2('What you need'),
      para(tt('Woven cotton or poly-cotton (durable and washable), matching thread.')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut one apron body 45 x 55 cm, one pocket 22 x 20 cm, one neck strap 5 x 60 cm, and two waist ties 5 x 75 cm.')),
        step(ttGloss('Hem, machine', 'hem-machine'), tt(': press a double-fold 1 cm hem along the top edge of the apron body. Topstitch in place.')),
        step(tt('Press a 1 cm double-fold hem on the top edge of the pocket. Topstitch.')),
        step(ttGloss('Finishing the seam allowance', 'finishing-seam-allowance'), tt(': overlock or zigzag the remaining three edges of the pocket.')),
        step(tt('Position the pocket on the apron body, centred, 15 cm from the bottom. Pin and topstitch around the three unfinished edges, 5 mm from the edge.')),
        step(tt('Fold the neck strap in half lengthwise, right sides together. Stitch the long edge and one short end. Turn and press. Topstitch all the way around 5 mm from the edge.')),
        step(tt('Pin the raw end of the neck strap to the top left corner of the apron, on the wrong side. Repeat for the top right corner.')),
        step(ttGloss('Topstitch', 'topstitching'), tt(' a reinforcing box 1.5 cm square through the strap and apron at each top corner.')),
        step(tt('Make the waist ties in the same way as the neck strap. Pin each one to the side edges of the apron at the waist level and topstitch a reinforcing box.')),
        step(tt('Press the entire apron. Check the neck strap length by looping it and adjusting if needed before finishing the raw end.')),
      ),
    ],
  }
  return {
    slug: 'sewing-kids-apron-one-size',
    name: "Kids' apron, one-size ages 4-10",
    description: "A flat-front child's apron with a bib pocket, tied waist, and adjustable neck strap, cut from a single fabric length.",
    garmentCategory: 'KIDS',
    skillLevel: 'BEGINNER',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'One-size', notes: 'ages 4-10 adjustable with tied waist' },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Cotton poplin', weight: 'medium', notes: 'Washes well.' },
      { type: 'Poly-cotton drill', weight: 'medium', notes: 'Extra durability for heavy use.' },
    ],
    recommendedNotions: [
      { name: 'Thread', spec: 'Polyester, colour-matched', quantity: 1 },
    ],
    fabricRequirementsCm: {
      'One-size': { '140': { lengthCm: 65, notes: 'All pieces from one length' } },
    },
    pieceList: [
      rect('Apron body', 450, 550, 1, 'lengthwise', 'Apron body (cut 1)'),
      rect('Pocket', 220, 200, 1, 'lengthwise', 'Pocket (cut 1)'),
      rect('Neck strap', 600, 50, 1, 'lengthwise', 'Neck strap (cut 1)'),
      rect('Waist tie', 750, 50, 2, 'lengthwise', 'Waist tie (cut 2)'),
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// 12. Simple kids' T-shirt with nested sizes
function kidsTshirtNested(): object {
  const instructionsBody = {
    type: 'doc',
    content: [
      para(tt('A knit T-shirt is held together by the stretch in its seams: sew every seam with a stretch stitch or twin needle or the stitching will snap the first time it is put on.')),
      h2('What you need'),
      para(tt('Stretch jersey (180 gsm recommended), stretch or ballpoint needle, polyester thread, twin needle for hems (optional).')),
      h2('Steps'),
      ol(
        step(ttGloss('Cutting on the grain', 'cutting-on-grain'), tt(': cut front body on the fold, back body on the fold, and two sleeves. All pieces cut with stretch running across the width.')),
        step(tt('Choose your size cut line from the nested pattern. Mark the line with chalk or trace onto pattern paper before cutting.')),
        step(tt('Place front and back right sides together at the shoulder seam. Stitch with a 1 cm seam allowance using a narrow zigzag or stretch stitch. Press the seam towards the back.')),
        step(ttGloss('Finishing the seam allowance', 'finishing-seam-allowance'), tt(': overlock or zigzag the shoulder seam edges together. Press.')),
        step(tt('Fold the neckband in half, right sides together. Stitch the short ends to form a loop. Press the seam open. Fold the loop in half lengthwise.')),
        step(tt('Pin the neckband to the neck opening, raw edges matching, stretching the neckband to fit. Stitch with a stretch stitch. Press the seam down.')),
        step(tt('Open the body flat. Pin each sleeve into the armhole, right sides together, matching the notch at the shoulder seam. Stitch with a 1 cm seam allowance.')),
        step(ttGloss('Straight stitch', 'straight-stitch-basic'), tt(' the underarm and side seam as one continuous seam from the sleeve hem to the body hem.')),
        step(ttGloss('Hem, machine', 'hem-machine'), tt(': press up a 2 cm single-fold hem at the bottom edge. Topstitch with a twin needle or use a wide zigzag stitch to keep the hem stretchy.')),
        step(tt('Hem each sleeve in the same way.')),
        step(tt('Give the finished T-shirt a light press, pulling the hem flat as you press each section.')),
      ),
    ],
  }
  return {
    slug: 'sewing-kids-tshirt-nested-sizes',
    name: "Kids' T-shirt with nested sizes",
    description: "A stretch-knit T-shirt for children aged 2-8 with a separate neckband, set-in sleeves, and cut lines nested by age.",
    garmentCategory: 'KIDS',
    skillLevel: 'INTERMEDIATE',
    sourceLicence: 'PROPRIETARY_HOMEMADE',
    attributionText: 'Homemade-original house pattern',
    isFreesewingDesign: false,
    premium: false,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    heroMediaId: null,
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.0,
    hasLining: false,
    hasInterfacing: false,
    hasClosure: false,
    closureType: null,
    supportedSizes: [
      { name: 'Age 2', body: { heightCm: 92 } },
      { name: 'Age 4', body: { heightCm: 104 } },
      { name: 'Age 6', body: { heightCm: 116 } },
      { name: 'Age 8', body: { heightCm: 128 } },
    ],
    requiredMeasurements: [],
    recommendedFabrics: [
      { type: 'Cotton jersey', weight: 'medium', notes: '180 gsm; washes well and does not pill.' },
    ],
    recommendedNotions: [
      { name: 'Stretch or ballpoint needle', spec: '75/11', quantity: 1 },
      { name: 'Twin needle', spec: '2.5/75 stretch', quantity: 1, notes: 'Optional, for hems.' },
    ],
    fabricRequirementsCm: {
      'Age 2': { '150': { lengthCm: 50, notes: 'Body front + back + sleeves' } },
      'Age 4': { '150': { lengthCm: 55, notes: 'Body front + back + sleeves' } },
      'Age 6': { '150': { lengthCm: 65, notes: 'Body front + back + sleeves' } },
      'Age 8': { '150': { lengthCm: 75, notes: 'Body front + back + sleeves' } },
    },
    pieceList: [
      {
        name: 'Front body',
        cut: 1,
        fold: 'on-fold',
        grainDirection: 'crosswise',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 170, y: 0 },
          { x: 170, y: 40 },
          { x: 150, y: 50 },
          { x: 150, y: 380 },
          { x: 0, y: 380 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 85, y: 20 }, to: { x: 85, y: 360 } },
        notchPoints: [{ x: 150, y: 50 }],
        onFoldEdge: { from: { x: 0, y: 0 }, to: { x: 0, y: 380 } },
        label: 'Front body (cut 1 on fold, Age 6 shown)',
      },
      {
        name: 'Back body',
        cut: 1,
        fold: 'on-fold',
        grainDirection: 'crosswise',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 170, y: 0 },
          { x: 170, y: 40 },
          { x: 150, y: 50 },
          { x: 150, y: 380 },
          { x: 0, y: 380 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 85, y: 20 }, to: { x: 85, y: 360 } },
        notchPoints: [{ x: 150, y: 50 }],
        onFoldEdge: { from: { x: 0, y: 0 }, to: { x: 0, y: 380 } },
        label: 'Back body (cut 1 on fold, Age 6 shown)',
      },
      {
        name: 'Sleeve',
        cut: 2,
        fold: null,
        grainDirection: 'crosswise',
        pathPoints: [
          { x: 0, y: 0 },
          { x: 230, y: 0 },
          { x: 200, y: 180 },
          { x: 30, y: 180 },
          { x: 0, y: 0 },
        ],
        grainline: { from: { x: 115, y: 20 }, to: { x: 115, y: 160 } },
        notchPoints: [{ x: 115, y: 0 }],
        onFoldEdge: null,
        label: 'Sleeve (cut 2, Age 6 shown)',
      },
    ],
    instructionsBody,
    adjustmentGuides: [],
    patternHacks: [],
    availableFormats: ['A4_TILED', 'BROWSE_ONLY'],
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const accessoriesCat = await prisma.subCategory.findFirstOrThrow({
    where: { slug: 'accessories', category: { slug: 'sewing' } },
    select: { id: true },
  })
  const babiesCat = await prisma.subCategory.findFirstOrThrow({
    where: { slug: 'babies', category: { slug: 'sewing' } },
    select: { id: true },
  })
  const kidsCat = await prisma.subCategory.findFirstOrThrow({
    where: { slug: 'kids', category: { slug: 'sewing' } },
    select: { id: true },
  })

  console.log(`accessoriesCat: ${accessoriesCat.id}`)
  console.log(`babiesCat: ${babiesCat.id}`)
  console.log(`kidsCat: ${kidsCat.id}`)

  const patterns = [
    { def: headbandTwistFront(), subCategoryId: accessoriesCat.id },
    { def: hairScrunchie(), subCategoryId: accessoriesCat.id },
    { def: beltDRing(), subCategoryId: accessoriesCat.id },
    { def: mensTie(), subCategoryId: accessoriesCat.id },
    { def: bowTieSelfTie(), subCategoryId: accessoriesCat.id },
    { def: knittedInfinityScarf(), subCategoryId: accessoriesCat.id },
    { def: snoodRibbedCuffs(), subCategoryId: accessoriesCat.id },
    { def: sunHatWideBrim(), subCategoryId: accessoriesCat.id },
    { def: babyBibSnap(), subCategoryId: babiesCat.id },
    { def: babyBlanketMitredBinding(), subCategoryId: babiesCat.id },
    { def: kidsApronOneSize(), subCategoryId: kidsCat.id },
    { def: kidsTshirtNested(), subCategoryId: kidsCat.id },
  ]

  for (const { def, subCategoryId } of patterns) {
    const data = def as Record<string, unknown>

    const result = await prisma.sewingPattern.upsert({
      where: { slug: data.slug as string },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { ...(data as any), subCategoryId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { ...(data as any), subCategoryId },
      select: { id: true, slug: true, name: true, garmentCategory: true },
    })
    console.log(`Upserted [${result.garmentCategory}] ${result.name} (${result.slug}) — id: ${result.id}`)
  }

  console.log(`\nDone. ${patterns.length} patterns upserted.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
