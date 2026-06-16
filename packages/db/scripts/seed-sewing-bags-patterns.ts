/**
 * Sewing bags patterns seed (S-4 sub-session N-Bags, 2026-06-10).
 *
 * Inserts 8 house-original SewingPattern rows with garmentCategory BAGS.
 * All patterns are Homemade-authored (PROPRIETARY_HOMEMADE). No freesewing
 * dependency; no hero images. Category.sewing is NOT touched.
 *
 * Idempotent: upsert on slug.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-bags-patterns.ts
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
  cut: number,
  wMm: number,
  hMm: number,
  label: string,
): object {
  return {
    name,
    cut,
    fold: null,
    grainDirection: 'lengthwise',
    pathPoints: [
      { x: 0, y: 0 },
      { x: wMm, y: 0 },
      { x: wMm, y: hMm },
      { x: 0, y: hMm },
      { x: 0, y: 0 },
    ],
    grainline: { from: { x: Math.round(wMm / 2), y: 20 }, to: { x: Math.round(wMm / 2), y: hMm - 20 } },
    notchPoints: [],
    onFoldEdge: null,
    label,
  }
}

// Approximate circle as 12-point polygon centred at (r, r), radius r mm.
function circle12(name: string, cut: number, diamMm: number, label: string): object {
  const r = diamMm / 2
  const pts = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI
    return { x: Math.round(r + r * Math.cos(angle)), y: Math.round(r + r * Math.sin(angle)) }
  })
  pts.push(pts[0]!) // close polygon
  return {
    name,
    cut,
    fold: null,
    grainDirection: 'crosswise',
    pathPoints: pts,
    grainline: { from: { x: Math.round(r / 2), y: r }, to: { x: Math.round(r * 1.5), y: r } },
    notchPoints: [],
    onFoldEdge: null,
    label,
  }
}

// ---------------------------------------------------------------------------
// Pattern definitions
// ---------------------------------------------------------------------------

const patterns: Array<{
  slug: string
  name: string
  description: string
  skillLevel: string
  finishedDimensions: string
  supportedSizes: object
  pieces: object[]
  hasLining: boolean
  hasClosure: boolean
  closureType: string | null
  hasInterfacing: boolean
  interfacingWeight: string | null
  hasHardware: boolean
  techniqueSlugs: string[]
  criticalTechniques: string[]
  recommendedFabrics: object[]
  recommendedNotions: object[]
  fabricRequirementsCm: object
  instructionsBody: object
}> = [
  // -------------------------------------------------------------------------
  // 1. Tote bag with interfaced handles
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-tote-bag-interfaced-handles',
    name: 'Tote bag with interfaced handles',
    description:
      'The firmness of the handles comes entirely from the interfacing: one layer of medium-fusible bonded to each handle strip before folding gives a strap that holds its shape through daily use.',
    skillLevel: 'BEGINNER',
    finishedDimensions: 'width 35cm, height 40cm',
    supportedSizes: [{ name: 'Standard', notes: '35x40cm' }],
    pieces: [
      rect('Outer body', 2, 370, 420, 'Outer body (cut 2) — 37x42cm'),
      rect('Lining body', 2, 370, 420, 'Lining body (cut 2) — 37x42cm'),
      rect('Handle', 4, 80, 600, 'Handle (cut 4) — 8x60cm'),
    ],
    hasLining: true,
    hasClosure: false,
    closureType: null,
    hasInterfacing: true,
    interfacingWeight: 'medium-fusible',
    hasHardware: false,
    techniqueSlugs: [
      'interfacing-fusible',
      'topstitching',
      'straight-stitch-basic',
      'cutting-on-grain',
      'pressing-seams-open',
      'finishing-seam-allowance',
    ],
    criticalTechniques: ['interfacing-fusible', 'topstitching'],
    recommendedFabrics: [
      {
        type: 'canvas',
        weight: 'medium-heavy',
        widthCm: 140,
        notes: 'Cotton canvas or duck cloth holds the bag shape well.',
      },
      {
        type: 'linen',
        weight: 'medium',
        widthCm: 140,
        notes: 'Linen gives a softer drape; pair with a firm lining.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Medium fusible interfacing',
        spec: 'woven, medium weight',
        quantity: 1,
        notes: '4 strips at 8x60cm plus a little extra for trimming.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester or cotton-wrapped',
        quantity: 1,
        notes: 'Colour-matched to your outer fabric.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 100, notes: 'Outer and lining from the same 140cm fabric.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Pre-wash and press your fabric before cutting. Cut all pieces on the straight grain.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'What you need' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Outer body x2, lining body x2, handle strips x4. Medium fusible interfacing, thread.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Apply ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'interfacing-fusible' },
                        },
                      ],
                      text: 'medium fusible interfacing',
                    },
                    {
                      type: 'text',
                      text: ' to the wrong side of two handle strips following the manufacturer instructions. Press firmly for ten seconds per section.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Fold each interfaced handle strip in half lengthwise, wrong sides together. Press the fold. Open out, then fold each long raw edge in to the centre crease. Press. Fold in half again along the centre. Press. You now have a neat strap four layers thick.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Pin a plain handle strip (no interfacing) to the back of each interfaced strip, wrong sides together. They form a sandwich. ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'Topstitch',
                    },
                    {
                      type: 'text',
                      text: ' down both long edges, 3mm from each edge.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Pin a completed handle to the right side of each outer body piece, 10cm in from each side edge, raw ends flush with the top raw edge. Baste 8mm from the top edge.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place the two outer body pieces right sides together. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: ' the side seams and base with a 15mm seam allowance. Leave the top open.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'pressing-seams-open' },
                        },
                      ],
                      text: 'Press the seams open',
                    },
                    {
                      type: 'text',
                      text: '. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'finishing-seam-allowance' },
                        },
                      ],
                      text: 'Finish the seam allowances',
                    },
                    {
                      type: 'text',
                      text: ' with a zigzag or overlocker. Set the outer bag aside.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Sew the lining body pieces right sides together along the sides and base with a 15mm seam allowance, leaving a 15cm gap in the base for turning. Press seams open.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place the outer bag inside the lining, right sides together, matching side seams and top raw edges. Pin all around the top edge. Sew with a 15mm seam allowance.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Pull the outer bag through the gap in the lining base. Press the top seam flat, rolling the lining slightly to the inside so it does not show from the front.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Slip-stitch or machine-sew the gap in the lining base closed. Push the lining down inside the bag.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Topstitch around the top edge of the bag, 5mm from the edge, to hold the lining in place and give a neat finish. Press the finished bag.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 2. Drawstring bag for storage
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-drawstring-storage-bag',
    name: 'Drawstring bag for storage',
    description:
      'The bag closes by threading a drawstring through a casing stitched near the top of the bag body: a single rectangular piece folded and sewn, with no lining and no zip.',
    skillLevel: 'BEGINNER',
    finishedDimensions: 'width 25cm, height 35cm',
    supportedSizes: [{ name: 'Standard', notes: '25x35cm' }],
    pieces: [rect('Bag body', 2, 270, 500, 'Bag body (cut 2) — 27x50cm')],
    hasLining: false,
    hasClosure: true,
    closureType: 'drawstring',
    hasInterfacing: false,
    interfacingWeight: null,
    hasHardware: false,
    techniqueSlugs: [
      'casing-drawstring',
      'straight-stitch-basic',
      'cutting-on-grain',
      'finishing-seam-allowance',
    ],
    criticalTechniques: ['casing-drawstring', 'cutting-on-grain'],
    recommendedFabrics: [
      {
        type: 'cotton quilting',
        weight: 'light-medium',
        widthCm: 140,
        notes: 'Any light woven works. Avoid stretch fabric.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Cord or ribbon',
        spec: '1cm wide x 180cm long',
        quantity: 1,
        notes: 'Cut into two 90cm lengths to thread from each side.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester',
        quantity: 1,
        notes: 'Colour-matched.',
      },
      {
        name: 'Safety pin',
        spec: 'large',
        quantity: 1,
        notes: 'For threading cord through the casing.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 55, notes: 'Both body pieces cut from one length.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Press the fabric before cutting. The top of each body piece becomes the casing channel for the drawstring cord.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Cut both body pieces ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'cutting-on-grain' } }],
                      text: 'on the straight grain',
                    },
                    {
                      type: 'text',
                      text: '. Mark the wrong side with tailor\'s chalk.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'On each body piece, press under 1cm along the top raw edge, then press under a further 3cm. This forms the casing hem. Pin in place.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Stitch the casing close to the lower folded edge of each body piece, then stitch again close to the upper folded edge. You now have a channel on each piece about 2.5cm wide.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place the two body pieces right sides together, matching the casing seams. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: ' down each side and across the base with a 15mm seam allowance. Do not sew through the casing openings at the sides.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'finishing-seam-allowance' },
                        },
                      ],
                      text: 'Finish the seam allowances',
                    },
                    {
                      type: 'text',
                      text: ' on the side seams with a zigzag or overlocker. Press.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn the bag right side out and press.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Attach a safety pin to one end of a 90cm cord length. Thread it all the way around the ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'casing-drawstring' } }],
                      text: 'casing channel',
                    },
                    {
                      type: 'text',
                      text: ', entering from the left side opening and exiting from the same side. Knot the ends together.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Thread the second cord from the right side opening all the way round and back out the same side. Knot the ends. Both cords now run the full circuit of the casing from opposite sides, so pulling either cord closes the bag.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 3. Pencil case with zip
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-pencil-case-zip',
    name: 'Pencil case with zip',
    description:
      'The depth of this pencil case comes from stitching box corners at each end of the zip opening after the body is assembled: fold each corner so the side seam meets the base seam, then stitch across.',
    skillLevel: 'IMPROVER',
    finishedDimensions: 'width 22cm, height 10cm, depth 4cm',
    supportedSizes: [{ name: 'Standard', notes: '22x10x4cm' }],
    pieces: [
      rect('Outer body', 2, 240, 260, 'Outer body (cut 2) — 24x26cm'),
      rect('Lining body', 2, 240, 260, 'Lining body (cut 2) — 24x26cm'),
    ],
    hasLining: true,
    hasClosure: true,
    closureType: 'zip',
    hasInterfacing: true,
    interfacingWeight: 'medium-fusible',
    hasHardware: false,
    techniqueSlugs: [
      'zipper-foot',
      'box-corner',
      'interfacing-fusible',
      'straight-stitch-basic',
      'topstitching',
      'cutting-on-grain',
    ],
    criticalTechniques: ['zipper-foot', 'box-corner'],
    recommendedFabrics: [
      {
        type: 'cotton quilting',
        weight: 'light-medium',
        widthCm: 140,
        notes: 'Print or solid. Interfacing adds the body.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Zip',
        spec: '23cm all-purpose nylon',
        quantity: 1,
        notes: 'Zip length matches the finished opening width plus a little extra.',
      },
      {
        name: 'Medium fusible interfacing',
        spec: 'woven, medium weight',
        quantity: 1,
        notes: 'Two pieces at 24x26cm for the outer body.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester',
        quantity: 1,
        notes: 'Colour-matched.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 60, notes: 'All four body pieces from one length.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Interface both outer body pieces before sewing. The zip runs along the full top edge of the case.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Apply ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'interfacing-fusible' },
                        },
                      ],
                      text: 'medium fusible interfacing',
                    },
                    {
                      type: 'text',
                      text: ' to the wrong side of both outer body pieces. Press firmly.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place one outer body piece face up. Lay the zip face down along the top edge, teeth towards the fabric. Place one lining body piece face down on top. Pin through all layers. Fit the ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'zipper-foot' } }],
                      text: 'zipper foot',
                    },
                    {
                      type: 'text',
                      text: ' to your machine and stitch 8mm from the top edge.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Press the outer and lining away from the zip. ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'Topstitch',
                    },
                    {
                      type: 'text',
                      text: ' 3mm from the sewn edge, through outer and lining, to hold them flat.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Repeat steps 2 and 3 for the second outer body piece and remaining lining piece on the other side of the zip.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Open the zip halfway. Arrange the piece so the two outer body pieces are right sides together and the two lining pieces are right sides together. Pin around the edges, matching the zip seams at the sides.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: ' around the outer body and around the lining body with a 15mm seam allowance, leaving a 10cm gap in the lining base. Clip the corners.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'On the outer body, fold each bottom corner so the side seam aligns with the base seam. Mark a line 2cm from the corner point at right angles to the seams. Stitch across. This is a ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'box-corner' } }],
                      text: 'box corner',
                    },
                    {
                      type: 'text',
                      text: '. Trim the seam allowance to 8mm. Repeat on both lining corners.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn right side out through the lining gap. Press. Slip-stitch or machine-sew the lining gap closed.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Push the lining inside the case and press the top edge so the zip sits flat. Topstitch around the zip opening if wished.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 4. Project bag with drawstring and handle
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-project-bag-drawstring-handle',
    name: 'Project bag with drawstring and handle',
    description:
      'A roomy unlined project bag that closes with two drawstrings and carries by a short cotton-tube handle stitched across the top of the bag before the casing is folded.',
    skillLevel: 'BEGINNER',
    finishedDimensions: 'width 30cm, height 35cm',
    supportedSizes: [{ name: 'Standard', notes: '30x35cm' }],
    pieces: [
      rect('Bag body', 2, 320, 500, 'Bag body (cut 2) — 32x50cm'),
      rect('Handle', 2, 60, 350, 'Handle (cut 2) — 6x35cm'),
      rect('Casing strip', 2, 40, 350, 'Casing strip (cut 2) — 4x35cm'),
    ],
    hasLining: false,
    hasClosure: true,
    closureType: 'drawstring',
    hasInterfacing: false,
    interfacingWeight: null,
    hasHardware: false,
    techniqueSlugs: [
      'casing-drawstring',
      'topstitching',
      'straight-stitch-basic',
      'cutting-on-grain',
      'finishing-seam-allowance',
    ],
    criticalTechniques: ['casing-drawstring', 'topstitching'],
    recommendedFabrics: [
      {
        type: 'cotton quilting',
        weight: 'light-medium',
        widthCm: 140,
        notes: 'A fat quarter set works well for contrast handles.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Cord',
        spec: '8mm x 200cm',
        quantity: 1,
        notes: 'Cut into two 100cm lengths.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester',
        quantity: 1,
        notes: 'Colour-matched.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 60, notes: 'Bag body, handles, and casing strips from one length.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Press and cut all pieces on the straight grain before starting.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Make the handles: fold each handle strip in half lengthwise, press, then fold the raw edges in to the centre crease, press again, and fold in half a final time. ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'Topstitch',
                    },
                    {
                      type: 'text',
                      text: ' both long edges.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'On the right side of each body piece, pin a completed handle loop 8cm in from each side, raw ends 5cm below the top raw edge. Baste.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place the two body pieces right sides together. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: ' the side seams and base. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'finishing-seam-allowance' },
                        },
                      ],
                      text: 'Finish the seam allowances',
                    },
                    {
                      type: 'text',
                      text: '. Press seams to one side.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn the bag right side out. Fold the top edge 1cm to the wrong side, then fold over again 3cm. Press.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Stitch the casing close to the lower folded edge, then stitch again close to the upper folded edge, leaving the side openings clear. This forms the ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'casing-drawstring' } }],
                      text: 'drawstring casing',
                    },
                    {
                      type: 'text',
                      text: '.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Thread one cord from each side opening, all the way around and back out the same side. Knot the ends. The two cords together close the bag.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 5. Simple backpack with drawstring top and canvas straps
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-simple-backpack-drawstring',
    name: 'Simple backpack with drawstring top and canvas straps',
    description:
      'The bag body is sewn into a tube and closed at the base with a separate oval panel; the canvas straps pass through loops at the base seam and are anchored into the casing at the top.',
    skillLevel: 'CONFIDENT_BEGINNER',
    finishedDimensions: 'width 32cm, height 40cm',
    supportedSizes: [{ name: 'Standard', notes: '32x40cm' }],
    pieces: [
      rect('Bag body', 2, 340, 550, 'Bag body (cut 2) — 34x55cm'),
      {
        name: 'Base oval',
        cut: 1,
        fold: null,
        grainDirection: 'crosswise',
        pathPoints: [
          { x: 0, y: 100 },
          { x: 50, y: 30 },
          { x: 150, y: 0 },
          { x: 250, y: 30 },
          { x: 300, y: 100 },
          { x: 250, y: 170 },
          { x: 150, y: 200 },
          { x: 50, y: 170 },
          { x: 0, y: 100 },
        ],
        grainline: { from: { x: 50, y: 100 }, to: { x: 250, y: 100 } },
        notchPoints: [{ x: 0, y: 100 }, { x: 300, y: 100 }],
        onFoldEdge: null,
        label: 'Base oval (cut 1) — 34x20cm',
      },
      rect('Strap', 2, 80, 1000, 'Strap (cut 2) — 8x100cm'),
      rect('Casing strip', 2, 50, 370, 'Casing strip (cut 2) — 5x37cm'),
    ],
    hasLining: false,
    hasClosure: true,
    closureType: 'drawstring',
    hasInterfacing: false,
    interfacingWeight: null,
    hasHardware: false,
    techniqueSlugs: [
      'casing-drawstring',
      'box-corner',
      'topstitching',
      'straight-stitch-basic',
      'cutting-on-grain',
      'finishing-seam-allowance',
    ],
    criticalTechniques: ['casing-drawstring', 'topstitching'],
    recommendedFabrics: [
      {
        type: 'canvas',
        weight: 'medium-heavy',
        widthCm: 140,
        notes: 'Cotton canvas or ripstop nylon for the body and straps.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Cord',
        spec: '10mm x 250cm',
        quantity: 1,
        notes: 'Cut into two 125cm lengths.',
      },
      {
        name: 'All-purpose thread',
        spec: 'heavy-duty polyester',
        quantity: 1,
        notes: 'Use a heavier thread for the straps.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 130, notes: 'Body, base, straps, and casing from one length.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Press the canvas and cut all pieces ',
            },
            {
              type: 'text',
              marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'cutting-on-grain' } }],
              text: 'on the grain',
            },
            {
              type: 'text',
              text: ' before starting.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Make the straps: fold each strap strip lengthwise, right sides out, folding the raw edges to the centre. Press. ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'Topstitch',
                    },
                    {
                      type: 'text',
                      text: ' both long edges.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place the two body pieces right sides together. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: ' the side seams. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'finishing-seam-allowance' },
                        },
                      ],
                      text: 'Finish the seam allowances',
                    },
                    {
                      type: 'text',
                      text: ' and press open.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Pin the base oval to the lower opening of the tube, right sides together, notching the oval at the side seams to ease around the curve. Stitch with a 15mm seam allowance. Clip into the seam allowance all the way round. Press.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'At the base seam on the front of the bag, fold each strap end into a loop and baste 3cm from the base edge, one on each side seam. These form the lower strap anchors.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn the bag right side out. Press the top edge 1cm to the wrong side, then fold again 4cm. Pin the casing.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Feed each strap up the back of the bag and tuck the top end under the casing fold before stitching. Stitch the ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'casing-drawstring' } }],
                      text: 'casing',
                    },
                    {
                      type: 'text',
                      text: ' with two lines of stitching, trapping the strap ends.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Thread two cords through the casing from opposite sides so each cord enters and exits on the same side.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Press the finished bag. Check that both straps pull evenly from the base loops.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 6. Bucket bag with magnetic closure
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-bucket-bag-magnetic-closure',
    name: 'Bucket bag with magnetic closure',
    description:
      'The cylindrical shape depends on sewing a flat circle of interfaced fabric to the base of the tubular body: clipping the base seam allowance every 2cm before pressing lets the curve lie flat.',
    skillLevel: 'INTERMEDIATE',
    finishedDimensions: 'width 28cm (diameter), height 30cm',
    supportedSizes: [{ name: 'Standard', notes: '28cm diameter, 30cm tall' }],
    pieces: [
      rect('Outer body', 1, 900, 320, 'Outer body (cut 1) — 90x32cm'),
      circle12('Outer base circle', 1, 300, 'Outer base circle (cut 1) — diam 30cm'),
      rect('Lining body', 1, 900, 320, 'Lining body (cut 1) — 90x32cm'),
      circle12('Lining base circle', 1, 300, 'Lining base circle (cut 1) — diam 30cm'),
      rect('Facing strip top', 1, 900, 80, 'Facing strip top (cut 1) — 90x8cm'),
      rect('Handle', 2, 80, 500, 'Handle (cut 2) — 8x50cm'),
    ],
    hasLining: true,
    hasClosure: true,
    closureType: 'magnetic-clasp',
    hasInterfacing: true,
    interfacingWeight: 'medium-fusible',
    hasHardware: true,
    techniqueSlugs: [
      'interfacing-fusible',
      'topstitching',
      'straight-stitch-basic',
      'cutting-on-grain',
      'pressing-seams-open',
      'finishing-seam-allowance',
      'box-corner',
    ],
    criticalTechniques: ['interfacing-fusible', 'topstitching'],
    recommendedFabrics: [
      {
        type: 'canvas',
        weight: 'medium',
        widthCm: 140,
        notes: 'Outer in canvas or structured cotton. Lining in coordinating cotton.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Medium fusible interfacing',
        spec: 'woven, medium weight',
        quantity: 1,
        notes: 'For outer body, base circle, and facing strip.',
      },
      {
        name: 'Magnetic clasp',
        spec: '18mm diameter sew-in',
        quantity: 1,
        notes: 'Set into the facing strip at the centre front and back.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester',
        quantity: 1,
        notes: 'Colour-matched.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 130, notes: 'Outer, lining, and facing from one length of 140cm.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Interface the outer body, outer base circle, and facing strip before cutting any other pieces.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Fuse ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'interfacing-fusible' },
                        },
                      ],
                      text: 'medium fusible interfacing',
                    },
                    {
                      type: 'text',
                      text: ' to the outer body, outer base circle, and facing strip. Press from the centre outward.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Make the handles: fold, press, and ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'topstitch',
                    },
                    {
                      type: 'text',
                      text: ' in the same way as the tote handles. Set aside.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Attach the magnetic clasp halves to the facing strip, centring them 4cm from the top long edge, 45cm apart (front and back positions). Follow the clasp instructions for attaching the prongs through the fabric.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Fold the outer body into a tube, right sides together, and sew the short ends together with a 15mm seam allowance. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'pressing-seams-open' },
                        },
                      ],
                      text: 'Press the seam open',
                    },
                    {
                      type: 'text',
                      text: '.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Pin the outer base circle to the lower edge of the tube, right sides together. Clip into the seam allowance on the tube every 2cm around the curve. Stitch with a 15mm seam allowance. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'finishing-seam-allowance' },
                        },
                      ],
                      text: 'Finish the seam allowance',
                    },
                    {
                      type: 'text',
                      text: ' and press upward.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Attach the handles to the outer bag at the top edge, 15cm from the side seam on each side, raw ends flush with the top edge. Baste.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Sew the lining body into a tube and attach the lining base circle in the same way as the outer, but leave a 15cm gap in the side seam for turning.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Fold the facing strip into a tube, right sides together, short ends meeting. Stitch the ends. Press the tube in half along its length, wrong sides together, so it forms a 4cm-wide doubled band.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Slip the outer bag inside the lining, right sides together. Place the facing tube over the top, raw edges aligned. Pin all layers together at the top edge. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Stitch',
                    },
                    {
                      type: 'text',
                      text: ' all the way round.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn right side out through the gap in the lining side seam. Press the top edge. Close the gap in the lining. Topstitch around the top of the bag to hold the facing in place.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 7. Makeup pouch with boxed corners
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-makeup-pouch-boxed-corners',
    name: 'Makeup pouch with boxed corners',
    description:
      'The pouch gets its width from stitching across the base corners after sewing the main seam: each sewn triangle of fabric you cut away adds depth to the finished pouch.',
    skillLevel: 'IMPROVER',
    finishedDimensions: 'width 18cm, height 12cm, depth 8cm',
    supportedSizes: [{ name: 'Standard', notes: '18x12x8cm' }],
    pieces: [
      rect('Outer body', 2, 200, 340, 'Outer body (cut 2) — 20x34cm'),
      rect('Lining body', 2, 200, 340, 'Lining body (cut 2) — 20x34cm'),
    ],
    hasLining: true,
    hasClosure: true,
    closureType: 'zip',
    hasInterfacing: true,
    interfacingWeight: 'medium-fusible',
    hasHardware: false,
    techniqueSlugs: [
      'zipper-foot',
      'box-corner',
      'interfacing-fusible',
      'straight-stitch-basic',
      'topstitching',
      'cutting-on-grain',
    ],
    criticalTechniques: ['zipper-foot', 'box-corner'],
    recommendedFabrics: [
      {
        type: 'cotton quilting',
        weight: 'light-medium',
        widthCm: 140,
        notes: 'Laminated cotton or oilcloth also works for a wipe-clean lining.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Zip',
        spec: '20cm all-purpose nylon',
        quantity: 1,
        notes: 'Colour-matched or contrast accent.',
      },
      {
        name: 'Medium fusible interfacing',
        spec: 'woven, medium weight',
        quantity: 1,
        notes: 'Two outer body pieces.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester',
        quantity: 1,
        notes: 'Colour-matched.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 50, notes: 'All four body pieces from one 50cm length.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Interface both outer body pieces first. The zip sits along one long edge; the boxed corners create the depth.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Apply ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'interfacing-fusible' },
                        },
                      ],
                      text: 'medium fusible interfacing',
                    },
                    {
                      type: 'text',
                      text: ' to both outer body pieces. Press firmly.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Sandwich the zip between one outer and one lining body piece along the top long edge, right sides together, using the ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'zipper-foot' } }],
                      text: 'zipper foot',
                    },
                    {
                      type: 'text',
                      text: '. Stitch 8mm from the edge.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Press the fabric away from the zip on both sides. ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'Topstitch',
                    },
                    {
                      type: 'text',
                      text: ' 3mm from the seam line on each side of the zip.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Attach the remaining outer and lining pieces to the other side of the zip in the same way.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Open the zip halfway. Arrange the piece so the two outers face each other and the two linings face each other. Pin the side seams and base, matching the zip seams. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: ' with 15mm seam allowance, leaving a gap in the lining base.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'On the outer body, fold each base corner so the side seam meets the base seam. Measure 4cm from the tip and draw a line at right angles. Stitch across. This creates a ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'box-corner' } }],
                      text: 'box corner',
                    },
                    {
                      type: 'text',
                      text: ' giving 8cm of depth. Trim to 8mm. Repeat on both lining corners.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn the pouch right side out through the lining gap. Close the gap. Push the lining inside and press the top edge. Topstitch around the zip opening.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 8. Sling bag with adjustable strap
  // -------------------------------------------------------------------------
  {
    slug: 'sewing-sling-bag-adjustable-strap',
    name: 'Sling bag with adjustable strap',
    description:
      'The structure comes from stitching gusset panels between the front and back body pieces: this single seam gives the bag its 8cm depth and is what separates a sling bag from a flat cross-body pouch.',
    skillLevel: 'INTERMEDIATE',
    finishedDimensions: 'width 22cm, height 30cm, depth 8cm',
    supportedSizes: [{ name: 'Standard', notes: '22x30x8cm' }],
    pieces: [
      rect('Outer body', 2, 240, 320, 'Outer body (cut 2) — 24x32cm'),
      rect('Gusset', 2, 100, 320, 'Gusset (cut 2) — 10x32cm'),
      rect('Lining body', 2, 240, 320, 'Lining body (cut 2) — 24x32cm'),
      rect('Gusset lining', 2, 100, 320, 'Gusset lining (cut 2) — 10x32cm'),
      rect('Strap', 1, 80, 1500, 'Strap (cut 1) — 8x150cm'),
    ],
    hasLining: true,
    hasClosure: true,
    closureType: 'zip',
    hasInterfacing: true,
    interfacingWeight: 'medium-fusible',
    hasHardware: true,
    techniqueSlugs: [
      'zipper-foot',
      'interfacing-fusible',
      'topstitching',
      'straight-stitch-basic',
      'cutting-on-grain',
      'pressing-seams-open',
      'finishing-seam-allowance',
    ],
    criticalTechniques: ['zipper-foot', 'interfacing-fusible'],
    recommendedFabrics: [
      {
        type: 'canvas',
        weight: 'medium',
        widthCm: 140,
        notes: 'Firm woven fabric. Lining in a lighter coordinating cotton.',
      },
    ],
    recommendedNotions: [
      {
        name: 'Zip',
        spec: '23cm all-purpose nylon',
        quantity: 1,
        notes: 'Runs along the full top edge of the bag.',
      },
      {
        name: 'Adjustable slide',
        spec: '25mm plastic or metal triglide',
        quantity: 1,
        notes: 'Threads onto the strap to allow length adjustment.',
      },
      {
        name: 'Swivel clip',
        spec: '25mm',
        quantity: 2,
        notes: 'One at each end of the strap to attach to D-ring loops on the bag.',
      },
      {
        name: 'D-ring',
        spec: '25mm',
        quantity: 2,
        notes: 'Stitched into the gusset seam at the top corners.',
      },
      {
        name: 'Medium fusible interfacing',
        spec: 'woven, medium weight',
        quantity: 1,
        notes: 'Outer body and gussets.',
      },
      {
        name: 'All-purpose thread',
        spec: 'polyester',
        quantity: 1,
        notes: 'Colour-matched.',
      },
    ],
    fabricRequirementsCm: {
      Standard: {
        '140': { lengthCm: 100, notes: 'All outer and lining pieces plus the strap from 100cm.' },
      },
    },
    instructionsBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Interface the outer body pieces and outer gussets before cutting. Press and cut on the straight grain.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Apply ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'interfacing-fusible' },
                        },
                      ],
                      text: 'medium fusible interfacing',
                    },
                    {
                      type: 'text',
                      text: ' to both outer body pieces and both outer gussets.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Make the strap: fold the strap strip lengthwise, press the raw edges to centre, fold in half again, and ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                      text: 'topstitch',
                    },
                    {
                      type: 'text',
                      text: ' both long edges. Thread the strap through the triglide slide and both swivel clips.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Fold a short tab of scrap fabric through each D-ring and baste a tab to the top corner of each outer gusset, raw ends flush.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Sew the zip between the top edge of the front outer body and the top edge of the back outer body, using the ',
                    },
                    {
                      type: 'text',
                      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'zipper-foot' } }],
                      text: 'zipper foot',
                    },
                    {
                      type: 'text',
                      text: '. Topstitch 3mm from the zip seam.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'With the zip closed, open the body flat. Pin the two gussets along the side and base edges of the front body, right sides together. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'straight-stitch-basic' },
                        },
                      ],
                      text: 'Straight-stitch',
                    },
                    {
                      type: 'text',
                      text: '. Clip corners. Repeat for the back body.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'finishing-seam-allowance' },
                        },
                      ],
                      text: 'Finish the seam allowances',
                    },
                    {
                      type: 'text',
                      text: ' on all outer seams. ',
                    },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'glossaryTooltip',
                          attrs: { termSlug: 'pressing-seams-open' },
                        },
                      ],
                      text: 'Press seams open',
                    },
                    {
                      type: 'text',
                      text: ' where possible.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Sew the lining body and gusset lining panels in the same way, leaving a 12cm gap in the base seam for turning.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Place the outer bag inside the lining, right sides together, aligning the top edges. Pin and stitch all the way round.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Turn right side out through the lining gap. Close the gap. Push the lining inside the bag and press the top edge. Topstitch all the way round the zip opening. Clip the swivel clips to the D-rings.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const bagsCat = await prisma.subCategory.findFirstOrThrow({
    where: { slug: 'bags', category: { slug: 'sewing' } },
    select: { id: true },
  })
  console.log(`Bags sub-category id: ${bagsCat.id}`)

  for (const p of patterns) {
    const result = await prisma.sewingPattern.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        garmentCategory: 'BAGS',
        garmentType: 'bag',
        subCategory: { connect: { id: bagsCat.id } },
        skillLevel: p.skillLevel as any,
        isFreesewingDesign: false,
        sourceLicence: 'PROPRIETARY_HOMEMADE',
        attributionText: 'Homemade-original house pattern',
        premium: false,
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
        seamAllowanceIncluded: true,
        seamAllowanceCm: 1.5,
        hasLining: p.hasLining,
        hasClosure: p.hasClosure,
        closureType: p.closureType,
        hasInterfacing: p.hasInterfacing,
        supportedSizes: p.supportedSizes as any,
        pieceList: p.pieces as any,
        recommendedFabrics: p.recommendedFabrics as any,
        recommendedNotions: p.recommendedNotions as any,
        fabricRequirementsCm: p.fabricRequirementsCm as any,
        instructionsBody: p.instructionsBody as any,
        availableFormats: ['A4_TILED', 'LETTER_TILED', 'BROWSE_ONLY'],
      },
      update: {
        name: p.name,
        description: p.description,
        garmentCategory: 'BAGS',
        garmentType: 'bag',
        subCategory: { connect: { id: bagsCat.id } },
        skillLevel: p.skillLevel as any,
        isFreesewingDesign: false,
        sourceLicence: 'PROPRIETARY_HOMEMADE',
        attributionText: 'Homemade-original house pattern',
        premium: false,
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
        seamAllowanceIncluded: true,
        seamAllowanceCm: 1.5,
        hasLining: p.hasLining,
        hasClosure: p.hasClosure,
        closureType: p.closureType,
        hasInterfacing: p.hasInterfacing,
        supportedSizes: p.supportedSizes as any,
        pieceList: p.pieces as any,
        recommendedFabrics: p.recommendedFabrics as any,
        recommendedNotions: p.recommendedNotions as any,
        fabricRequirementsCm: p.fabricRequirementsCm as any,
        instructionsBody: p.instructionsBody as any,
        availableFormats: ['A4_TILED', 'LETTER_TILED', 'BROWSE_ONLY'],
      },
      select: { id: true, slug: true, name: true },
    })
    console.log(`  upserted: ${result.name} (${result.slug}) — ${result.id}`)
  }

  console.log('\nAll 8 bags patterns upserted.')

  const pendingProductShot = await prisma.sewingPattern.count({
    where: {
      garmentCategory: 'BAGS',
      heroProductShotMediaId: null,
      heroProductShotFallback: false,
    },
  })
  if (pendingProductShot > 0) {
    console.log(
      `\nS-8b: ${pendingProductShot} bag patterns still need a product-shot hero.\n` +
        `Run apps/web/scripts/generate-sewing-product-shots.ts in a Claude Code\n` +
        `worker session (Fal Flux 1.1 Pro generate + Claude vision self-judge).`,
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
