/**
 * Demo sewing pattern used by the Studio smoke-test path (`?demo=1`) and
 * the seed script. A simple A-line skirt with four pieces: front, back
 * left, back right, waistband. Single size; the demo is not graded
 * (that's S-5a). Coordinates are in millimetres.
 *
 * Pieces are hand-drawn polylines, not freesewing output. Per the image
 * policy this counts as house-authored SVG.
 */

import type {
  SewingFabricRequirement,
  SewingCuttingLayout,
  SewingPatternData,
  SewingPiece,
  SewingTipTapDoc,
} from '@/components/studio/sewing/types'

const front: SewingPiece = {
  name: 'Front skirt',
  cut: 1,
  fold: 'on-fold',
  grainDirection: 'lengthwise',
  // Half-front, place on fold along the left edge. Waist 240mm, hip
  // 300mm at 180mm down, hem 360mm at 600mm down. A-line flare.
  pathPoints: [
    { x: 0, y: 0 },
    { x: 240, y: 0 },
    { x: 300, y: 180 },
    { x: 360, y: 600 },
    { x: 0, y: 600 },
    { x: 0, y: 0 },
  ],
  grainline: { from: { x: 120, y: 50 }, to: { x: 120, y: 580 } },
  notchPoints: [
    { x: 240, y: 0 },
    { x: 300, y: 180 },
  ],
  onFoldEdge: { from: { x: 0, y: 0 }, to: { x: 0, y: 600 } },
  label: 'Front (cut 1 on fold)',
}

const backLeft: SewingPiece = {
  name: 'Back left',
  cut: 1,
  fold: null,
  grainDirection: 'lengthwise',
  // Centre-back seam is left edge (zipper goes here). Mirror of front
  // half but with seam allowance on the centre-back rather than fold.
  pathPoints: [
    { x: 0, y: 0 },
    { x: 240, y: 0 },
    { x: 300, y: 180 },
    { x: 360, y: 600 },
    { x: 0, y: 600 },
    { x: 0, y: 0 },
  ],
  grainline: { from: { x: 120, y: 50 }, to: { x: 120, y: 580 } },
  notchPoints: [
    { x: 240, y: 0 },
    { x: 300, y: 180 },
  ],
  onFoldEdge: null,
  label: 'Back left (cut 1)',
}

const backRight: SewingPiece = {
  ...backLeft,
  name: 'Back right',
  label: 'Back right (cut 1)',
}

const waistband: SewingPiece = {
  name: 'Waistband',
  cut: 1,
  fold: 'on-fold',
  grainDirection: 'lengthwise',
  // Half-waistband, place on fold. 240mm long (matches the front half
  // waist), 80mm tall (folded once it's 40mm finished width).
  pathPoints: [
    { x: 0, y: 0 },
    { x: 240, y: 0 },
    { x: 240, y: 80 },
    { x: 0, y: 80 },
    { x: 0, y: 0 },
  ],
  grainline: { from: { x: 30, y: 40 }, to: { x: 210, y: 40 } },
  notchPoints: [{ x: 240, y: 0 }],
  onFoldEdge: { from: { x: 0, y: 0 }, to: { x: 0, y: 80 } },
  label: 'Waistband (cut 1 on fold)',
}

const instructionsBody: SewingTipTapDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Pre-wash and press your fabric. Cotton, linen, and medium-weight wovens all suit this skirt. Cut the front on the fold, both back pieces, and the waistband on the fold.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 1. Stay-stitch the waists.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Run a line of straight stitch 10mm from each waist edge, on the back pieces and the front. Stay-stitching stops the bias edges from stretching as you work.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 2. Sew the centre-back seam below the zipper.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Place the two back pieces right sides together. Mark the zipper opening at the top, leaving 200mm for the zipper. Sew from the bottom of the opening to the hem with a 15mm seam allowance. Press the seam open.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 3. Insert the invisible zipper.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Open the zipper. Pin the right zipper tape face-down to the right zipper edge of the back. Using an invisible zipper foot, stitch from the top down, as close to the coil as the foot allows. Repeat for the other side. Close the zipper and check it lies flat.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 4. Sew the side seams.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Pin the back to the front, right sides together, matching the notches at the waist and at hip-level. Sew both side seams with a 15mm seam allowance. Press open.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 5. Prepare the waistband.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Fold the waistband in half along the fold line. Press. Open out. Apply interfacing to one half of the wrong side following the manufacturer instructions.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 6. Attach the waistband.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Pin the interfaced edge of the waistband to the skirt waist, right sides together, matching centres and ends. Sew with a 10mm seam allowance. Press the seam up into the waistband.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 7. Close the waistband.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Fold the waistband to the inside along the pressed fold. Tuck the raw edge under and pin to cover the previous stitching line. Stitch in the ditch from the right side, or slip-stitch by hand for an invisible finish.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Step 8. Hem the skirt.' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Try the skirt on and mark the hem length. Press up a 20mm double-fold hem. Topstitch from the right side, or blind-stitch by hand. Give the finished skirt a final press.',
        },
      ],
    },
  ],
}

const FABRIC_REQ_140_NONAP: SewingFabricRequirement = {
  widthCm: 140,
  lengthCmNoNap: 110,
  lengthCmWithNap: 140,
}
const FABRIC_REQ_115: SewingFabricRequirement = {
  widthCm: 115,
  lengthCmNoNap: 140,
  lengthCmWithNap: 170,
}

const cuttingLayout140NoNap: SewingCuttingLayout = {
  widthCm: 140,
  withNap: false,
  totalLengthCm: 110,
  placements: [
    { pieceIndex: 0, x: 5, y: 5, rotation: 0, onFold: true },
    { pieceIndex: 1, x: 50, y: 5, rotation: 0, onFold: false },
    { pieceIndex: 2, x: 90, y: 5, rotation: 0, onFold: false },
    { pieceIndex: 3, x: 5, y: 70, rotation: 0, onFold: true },
  ],
}

const cuttingLayout140Nap: SewingCuttingLayout = {
  widthCm: 140,
  withNap: true,
  totalLengthCm: 140,
  placements: [
    { pieceIndex: 0, x: 5, y: 5, rotation: 0, onFold: true },
    { pieceIndex: 1, x: 50, y: 5, rotation: 0, onFold: false },
    { pieceIndex: 2, x: 90, y: 5, rotation: 0, onFold: false },
    { pieceIndex: 3, x: 5, y: 75, rotation: 0, onFold: true },
  ],
}

export const DEMO_SEWING_PATTERN_SLUG = 'demo-a-line-skirt'

export function loadDemoSewingPattern(): SewingPatternData {
  return {
    id: 'demo-a-line-skirt',
    slug: DEMO_SEWING_PATTERN_SLUG,
    name: 'A-line skirt',
    description:
      'A simple knee-length A-line skirt with an invisible zipper at the centre back and a folded waistband. Sample pattern for trying the Studio.',
    designerName: 'Homemade',
    garmentCategory: 'WOMENS_BOTTOMS',
    garmentType: 'A-line skirt',
    skillLevel: 'IMPROVER',
    seamAllowanceIncluded: true,
    seamAllowanceCm: 1.5,
    supportedSizes: [
      {
        name: 'M',
        body: { bustCm: 92, waistCm: 74, hipCm: 100, heightCm: 168 },
      },
    ],
    defaultSize: 'M',
    pieces: [front, backLeft, backRight, waistband],
    instructionsBody,
    recommendedNotions: [
      {
        name: 'Invisible zipper',
        spec: '20 cm closed-end',
        quantity: 1,
        notes: 'Colour-matched to your fabric.',
      },
      {
        name: 'Fusible interfacing',
        spec: 'Medium weight, woven',
        quantity: 1,
        notes: 'About 30cm length of standard-width interfacing.',
      },
      {
        name: 'All-purpose thread',
        spec: 'Polyester or cotton-wrapped',
        quantity: 1,
        notes: 'Colour-matched to your fabric.',
      },
      {
        name: 'Hook and bar',
        spec: 'Sew-on, size 3',
        quantity: 1,
        notes: 'Fastens the waistband above the zipper.',
      },
    ],
    fabricRequirements: {
      M: [FABRIC_REQ_140_NONAP, FABRIC_REQ_115],
    },
    cuttingLayouts: {
      M: [cuttingLayout140NoNap, cuttingLayout140Nap],
    },
    attributionText: 'Drafted by Homemade. Free to share with attribution.',
    isFreesewingDesign: false,
    freesewingDesignSlug: null,
    freesewingShowcaseSvg: null,
    freesewingShowcaseCacheKey: null,
  }
}
