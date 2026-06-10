/**
 * Seed script: 10 house-original sewing patterns for the "home" sub-category.
 *
 * Patterns:
 *   1. sewing-pillowcase-housewife-french-seam
 *   2. sewing-cushion-cover-envelope-back
 *   3. sewing-tea-towel-mitred-corners
 *   4. sewing-kitchen-apron-cross-back
 *   5. sewing-pot-holder-oven-mitt-set
 *   6. sewing-table-runner-mitred-border
 *   7. sewing-rod-pocket-curtain-panel
 *   8. sewing-eyelet-curtain-heading
 *   9. sewing-throw-blanket-binding
 *  10. sewing-drum-lampshade-cover
 *
 * Idempotent — upserts on slug. Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-home-patterns.ts
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

// ─── shared helpers ──────────────────────────────────────────────────────────

function rect(wMm: number, hMm: number) {
  return [
    { x: 0, y: 0 },
    { x: wMm, y: 0 },
    { x: wMm, y: hMm },
    { x: 0, y: hMm },
    { x: 0, y: 0 },
  ]
}

function grainlineV(wMm: number, hMm: number) {
  return { from: { x: Math.round(wMm / 2), y: Math.round(hMm * 0.1) }, to: { x: Math.round(wMm / 2), y: Math.round(hMm * 0.9) } }
}

function grainlineH(wMm: number, hMm: number) {
  return { from: { x: Math.round(wMm * 0.1), y: Math.round(hMm / 2) }, to: { x: Math.round(wMm * 0.9), y: Math.round(hMm / 2) } }
}

// ─── pattern definitions ─────────────────────────────────────────────────────

// ── 1. Pillowcase — housewife style with French seam ─────────────────────────

const pillowcaseInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'The secret of a housewife pillowcase is a tucked flap that wraps over the pillow end so the pillow stays put without any closure.',
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
          text: 'One piece of washed cotton or linen at 108 x 53 cm for the main body, and one piece at 28 x 53 cm for the turn-back flap. A 15 cm hem allowance is included on the open end; all other edges carry 6 mm for the French seam.',
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
                  text: 'Pre-wash and press both pieces. Cotton pillowcases will shrink in the first wash, so this step is not optional.',
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
                  text: 'Check the grain on both pieces. The lengthwise threads should run along the 108 cm length. ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'cutting-on-grain' } }],
                  text: 'Cutting on grain',
                },
                {
                  type: 'text',
                  text: ' keeps the cover from pulling sideways after washing.',
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
                  text: 'Hem the short open end of the main body with a double-fold 15 mm hem. Press in 15 mm, then press again to fold in. Stitch close to the inner fold. This is the open end of the finished pillowcase.',
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
                  text: 'Hem one long edge of the flap piece with the same 15 mm double-fold hem. This will be the visible folded-back edge inside the pillowcase.',
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
                  text: 'Lay the main body right-side up. Lay the flap on top, raw edges aligned at the closed end, wrong side of flap facing up. The flap extends across only part of the body length. Pin the raw short edges together.',
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
                  text: 'Fold the main body back over the flap so wrong sides are together and the three raw edges at the closed end are aligned. Pin along both long sides and the closed short end.',
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
                { type: 'text', text: 'Sew the first pass of the ' },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'french-seam' } }],
                  text: 'French seam',
                },
                {
                  type: 'text',
                  text: ': stitch 6 mm from the edge on both long sides and the closed short end with wrong sides together. Trim to 3 mm.',
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
                  text: 'Turn the pillowcase right sides together, rolling the seam allowance to the inside. Press the three seams firmly so the stitching lies exactly on the edge.',
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
                  text: 'Sew the second pass of the French seam 10 mm from the edge, enclosing the raw trimmed allowance. Press open as best you can from the outside.',
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
                  text: 'Turn right side out. Push the corners out with a blunt tool. Press the whole pillowcase, paying attention to the French seam corners so they lie flat rather than bunching.',
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
                  text: 'Insert the pillow. Tuck the body flap back over the open end to keep it in place. No buttons, zips, or press studs needed.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Notes' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'For a 65 x 65 cm square pillow, cut the main body 138 x 68 cm and the flap 28 x 68 cm, keeping all other steps the same.',
        },
      ],
    },
  ],
}

// ── 2. Cushion cover with envelope back ──────────────────────────────────────

const cushionInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'An envelope back creates an overlap opening on the reverse of the cushion cover so the pad can be removed without any zip or button.',
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
          text: 'One front panel 43 x 43 cm, and two back panels each 43 x 30 cm. The seam allowance is 1 cm throughout. Finished cover fits a 45 x 45 cm pad.',
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
                  text: 'Pre-wash and press your fabric. Check the ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'cutting-on-grain' } }],
                  text: 'grain',
                },
                {
                  type: 'text',
                  text: ' on all three pieces before cutting.',
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
                  text: 'Finish the raw seam allowances on all edges of all three pieces using a zigzag stitch or overlocker. This prevents fraying inside the finished cover.',
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
                  text: 'On each back panel, fold and press a double-fold 15 mm hem along one of the 43 cm edges. This will be the overlap edge. Stitch close to the inner fold.',
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
                  text: 'Lay the front panel face up. Place one back panel face down, aligning raw edges along one side. Place the second back panel face down on the opposite side. The two hemmed edges will overlap in the centre by roughly 8 cm.',
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
                  text: 'Pin all four sides. Make sure the hemmed overlap lies flat and neither back panel has folded over on itself.',
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
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'straight-stitch-basic' } }],
                  text: 'Stitch',
                },
                {
                  type: 'text',
                  text: ' all four sides with a 1 cm seam allowance, back-stitching at the start and end of each run. Stitch through all layers at the overlap.',
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
                  text: 'Clip the four corners diagonally, cutting to within 3 mm of the stitching. This reduces bulk at the corners when turned.',
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
                  text: 'Turn right side out through the envelope opening. Push the four corners out with a blunt pencil or knitting needle. Press all four sides from the front.',
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
                  text: 'Insert the cushion pad through the envelope back. Smooth the front. The finished size should be a snug 45 x 45 cm.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── 3. Tea towel with mitred corners ─────────────────────────────────────────

const teaTowelInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Mitred corners produce a flat, tailored hem on a tea towel where the corner fabric folds back on itself at 45 degrees rather than piling up in a bulky lump.',
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
          text: 'One piece of washed linen or cotton at 56 x 81 cm. The 3 cm hems are included in that measurement. Finished towel: 50 x 75 cm.',
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
                  text: 'Pre-wash and press your linen. Check the lengthwise grain runs along the 81 cm length. Trim the cut edges straight if they have drifted off grain.',
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
                  text: 'Press all four edges in by 15 mm, then press again to bring each hem in a further 15 mm. You will have a crisp 15 mm double-fold on all four sides. Open the hems back out and lay the towel wrong side up.',
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
                  text: 'At each corner you will see four crease lines forming a small square. Fold the corner point in so it touches the point where the innermost creases cross. Press this diagonal fold firmly.',
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
                  text: 'Trim the corner triangle 6 mm outside the diagonal pressed crease. This reduces bulk inside the ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'mitered-corner' } }],
                  text: 'mitred corner',
                },
                { type: 'text', text: '.' },
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
                  text: 'Re-fold the hem along both creases on each side of the corner so the diagonal edges come together. Pin the mitred point closed.',
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
                  text: 'Slip-stitch or machine-stitch the diagonal seam at each corner, closing the mitre from the wrong side. Press each corner flat.',
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
                  text: 'Re-fold all four hems along both crease lines and pin in place all the way around the towel.',
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
                  text: 'Topstitch 2 mm from the inner folded edge all the way around, pivoting at each corner. Overlap the start and end of stitching by 15 mm and backstitch to secure.',
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
                  text: 'Press the finished towel from the wrong side, paying extra attention to the corners so they lie perfectly flat.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── 4. Kitchen apron with cross-back straps ───────────────────────────────────

const apronInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Cross-back straps distribute the weight of the apron across both shoulders rather than pressing on the neck, and they stay up without constant adjustment.',
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
          text: 'Apron body 70 x 80 cm. Neck strap 8 x 80 cm. Two cross-back straps each 8 x 130 cm. Two waistband ties each 8 x 70 cm. All in the same fabric. Medium-weight cotton canvas or denim works well.',
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
                  text: 'Pre-wash all fabric. Press. Check the ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'cutting-on-grain' } }],
                  text: 'grain',
                },
                {
                  type: 'text',
                  text: ' on the apron body: lengthwise grain should run top to bottom.',
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
                  text: 'Make all straps and ties before attaching them to the body. Fold each strap in half lengthwise, wrong sides out. Stitch the long edge and one short end with a 10 mm seam allowance. Trim the stitched corner diagonally. Turn right side out and press with the seam at the centre back of the strap.',
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
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'topstitching' } }],
                  text: 'Topstitch',
                },
                {
                  type: 'text',
                  text: ' all four straps and ties 3 mm from each long edge and the finished short end. Topstitching stiffens the straps so they hold their shape in use.',
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
                  text: 'Hem the bottom and both side edges of the apron body with a double-fold 15 mm hem. Press in 15 mm, then 15 mm again. Stitch close to the inner fold.',
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
                  text: 'At the top edge of the apron body, press in 10 mm, then 20 mm to form the top hem. Do not stitch yet.',
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
                  text: 'Fold the neck strap in half and pin the raw end into the centre of the top hem from inside, pointing inwards. Pin the two waistband ties into the side edges at the top hem, one on each side, pointing inwards.',
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
                  text: "Pin the raw end of each cross-back strap to the top corners of the apron from inside, pointing inwards. They will cross at the wearer's back and tie at the front.",
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
                  text: 'Fold the top hem closed, trapping all strap ends inside. Pin and stitch close to the inner folded edge from end to end. Back-stitch over each strap point several times to reinforce.',
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
                  text: 'Topstitch a second line 3 mm from the outer folded edge of the top hem to match the strap topstitching.',
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
                  text: 'Press the finished apron. Try it on, crossing the back straps and tying them at the front. Adjust tie length as needed by folding the raw end further in before topstitching.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── 5. Pot holder and oven mitt set ──────────────────────────────────────────

const potHolderInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Heat protection in this set comes from a layer of insulated batting sewn between the outer fabric and the cotton lining, held in place by straight-line quilting.',
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
          text: 'For the pot holder: two 22 x 22 cm squares of outer cotton, two of insul-bright or cotton batting, two of cotton lining. For the oven mitt: use the provided piece template for the mitt shape. Also: bias binding tape 2.5 cm wide, approximately 2 metres total.',
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
                  text: 'Pre-wash all cotton pieces. Do not wash the insul-bright batting unless the manufacturer states it is washable.',
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
                  text: 'Make each sandwich: lining face down, batting, outer fabric face up. Tack (baste) around the perimeter 6 mm from the edge to hold the layers together before quilting.',
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
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'quilting-straight-line' } }],
                  text: 'Quilt',
                },
                {
                  type: 'text',
                  text: ' each sandwich with parallel lines spaced 25 mm apart, running diagonally from corner to corner. Use a walking foot if you have one. The quilting stitches hold the layers together and prevent the batting from shifting in the wash.',
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
                  text: 'Make two quilted pot holder sandwiches and two quilted oven mitt sandwiches (front and back for each item).',
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
                  text: 'Pin the two pot holder squares wrong sides together. Stitch all the way around 6 mm from the edge to hold them as one unit.',
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
                  text: 'Pin the two oven mitt pieces wrong sides together, matching the mitt shape. Stitch around the curved edge and base, 6 mm from the edge. Leave the wrist opening unstitched.',
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
                  text: 'Apply ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'bias-binding' } }],
                  text: 'bias binding',
                },
                {
                  type: 'text',
                  text: ' to the pot holder: open one fold of the binding, align the raw edge to the front face, stitch along the crease. Fold the binding to the back and hand-stitch or machine-stitch close to the fold.',
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
                  text: 'Mitre the corners of the pot holder binding as you go: fold a diagonal at each corner before turning the binding to the back. Press each corner firmly.',
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
                  text: 'Apply bias binding to the wrist edge of the oven mitt in the same way, leaving a 12 cm loop of binding at one side to form a hanging loop. Fold the loop back on itself and stitch in place before closing the binding at the wrist.',
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
                  text: 'Apply binding around the curved edge of the oven mitt, easing it smoothly around the thumb curve. Overlap the start and end by 15 mm and fold the raw end under.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Safety note' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Insul-bright reflects radiant heat rather than absorbing it. Do not use with wet fabric; steam drives heat through fibres quickly. Replace any pot holder or mitt where the batting has compressed or worn through.',
        },
      ],
    },
  ],
}

// ── 6. Table runner with mitred-corner border ────────────────────────────────

const tableRunnerInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'A mitred-corner border is sewn as four separate strips joined at 45-degree angles at each corner, giving the runner a neat picture-frame look.',
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
          text: 'Main panel 29 x 174 cm. Two long border strips each 8 x 186 cm. Two short border strips each 8 x 47 cm. Finished runner: 35 x 180 cm.',
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
                  text: 'Pre-wash and press all pieces. Verify grain alignment: the lengthwise grain should run along the 174 cm length of the main panel and along the long edge of the border strips.',
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
                  text: 'Mark the centre of each edge of the main panel and the centre of each border strip.',
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
                  text: 'Pin a long border strip to one long edge of the main panel, right sides together, matching centres. The border extends equally beyond the panel at both ends. Stitch with a 1 cm seam allowance, starting and stopping exactly 1 cm from each panel corner. Back-stitch at both ends. Repeat for the second long border.',
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
                  text: 'Pin the short border strips to the short ends of the main panel in the same way, leaving 1 cm unstitched at each corner.',
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
                  text: 'Press all four seams open. The border strips now project beyond the corners of the panel and cross each other at each corner.',
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
                  text: 'Fold the runner diagonally at one corner so the two adjacent border strips lie one on top of the other, right sides together. Use a set square to mark a 45-degree line from the inner corner point out to the outer edge of the border. Pin along this line.',
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
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'mitered-corner' } }],
                  text: 'Mitre',
                },
                {
                  type: 'text',
                  text: ' each corner: stitch along the marked 45-degree line. Check the seam lies flat before trimming. Trim to 1 cm seam allowance and press open. Repeat for all four corners.',
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
                  text: 'Press the whole runner from the wrong side, pressing the border seams towards the border fabric.',
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
                  text: 'Fold the outer edge of the border to the wrong side to create a hem. Press under 10 mm, then 10 mm again. Mitre each corner hem in the same way as for the tea towel pattern. Topstitch close to the inner fold.',
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
                  text: 'Give the runner a final press from the front.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── 7. Rod-pocket curtain panel ───────────────────────────────────────────────

const rodPocketInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'A rod-pocket curtain is a single panel with a stitched channel at the top through which the curtain rod passes, so the curtain gathers directly onto the rod without clips or rings.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Calculating your dimensions' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Measure your window width and finished drop length first.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Cut width: 1.5 times your window width, plus 10 cm for side hems (5 cm each side, double-fold at 2.5 cm each fold). For a 120 cm wide window: cut width = (120 x 1.5) + 10 = 190 cm.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Cut length: your finished drop, plus 20 cm for the rod pocket (10 cm for the pocket depth plus 10 cm for the heading above the pocket), plus 15 cm for the bottom hem.',
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
                  text: 'Pre-wash and press your fabric. Check the grain: the lengthwise grain should run from top to bottom on the finished curtain.',
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
                  text: 'Hem both side edges with a double-fold 25 mm hem (fold in 25 mm, then 25 mm again). Press and stitch close to the inner fold.',
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
                  text: 'Hem the bottom edge with a deep double-fold 75 mm hem. Press in 75 mm, then 75 mm again. Pin and stitch close to the inner fold. A deep hem at the base gives the curtain weight and helps it hang straight.',
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
                  text: 'At the top edge, press down 50 mm to the wrong side. This forms the heading above the rod pocket.',
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
                  text: 'Press down a further 100 mm to form the rod pocket channel. The fabric is now folded twice at the top: 50 mm heading, then 100 mm pocket.',
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
                  text: 'Stitch 3 mm from the very top folded edge all the way across. This closes the top of the ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'casing-rod-pocket' } }],
                  text: 'rod pocket',
                },
                {
                  type: 'text',
                  text: ' and forms the visible heading ruffle above the rod.',
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
                  text: 'Measure down 50 mm from the top fold and stitch a second line of topstitching all the way across. This is the bottom seam of the heading and the top of the rod channel.',
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
                  text: 'Measure down a further 100 mm (the rod pocket depth) and stitch a third line. This is the bottom seam of the rod pocket. The channel between the second and third lines is where the rod sits.',
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
                  text: 'Give the curtain a final press. Thread the rod through the pocket from one side. The heading ruffle should pop up above the rod.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Note on width' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'For a pair of curtains, make two identical panels and thread both onto the same rod. Wide windows benefit from heavier fabric so the curtains hang with good vertical folds.',
        },
      ],
    },
  ],
}

// ── 8. Eyelet curtain heading ─────────────────────────────────────────────────

const eyeletCurtainInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Eyelet heading tape is a strip of stiff fusible interfacing punched with large metal rings through which the curtain pole threads, and the crisp even folds it creates depend entirely on getting the interfacing application right.',
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
          text: 'Main curtain panel to your cut dimensions. A facing strip 10 cm wide by your panel width. Eyelet heading tape the same width as your panel. Large curtain eyelets, one set per eyelet position (usually spaced 15 cm apart). A hammer and cutting mat.',
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
                  text: 'Pre-wash and press all fabric. Calculate the cut dimensions as for the rod-pocket panel but allow 15 cm extra at the top (10 cm facing + 5 cm overlap) instead of the rod-pocket allowance.',
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
                  text: 'Apply ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'interfacing-fusible' } }],
                  text: 'fusible interfacing',
                },
                {
                  type: 'text',
                  text: ' to the wrong side of the facing strip following the manufacturer instructions. Use a damp pressing cloth and hold the iron in place for the full count. Allow to cool completely before moving the piece.',
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
                  text: 'Hem both side edges of the curtain panel with a double-fold 25 mm hem. Press and stitch.',
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
                  text: 'Hem the bottom edge with a deep double-fold 75 mm hem as with the rod-pocket panel.',
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
                  text: 'At the top edge, fold the facing strip right sides together with the curtain panel, raw edges at the top aligned. Stitch across the top with a 1 cm seam allowance.',
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
                  text: 'Fold the facing to the wrong side of the curtain. Press the top seam so it sits exactly on the top edge. Topstitch 3 mm from the top edge to keep the facing from rolling.',
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
                  text: 'Mark the eyelet positions along the top heading. First eyelet goes 4 cm from each side edge. Space remaining eyelets evenly across the top, approximately 15 cm apart. An even number of eyelets makes the curtain hang with the outer folds going the same direction.',
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
                  text: 'Following the eyelet kit instructions, use the hole cutter and cutting mat to cut through both layers at each marked point. The interfaced facing should give the fabric enough body to hold the eyelet without tearing.',
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
                  text: 'Snap the two halves of each eyelet together through the hole. Use the supplied setting tool and a firm hammer strike to lock the eyelet without cracking the ring. Check each eyelet is fully seated before moving on.',
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
                  text: 'Thread the pole through the eyelets. The curtain will form natural pleats between each eyelet. Press the pleats down the length of the curtain with a steam iron to set them.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── 9. Throw blanket with binding-finished edges ──────────────────────────────

const throwBlanketInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Bias binding applied to the raw edges of a cut throw gives it a neat finish that lies flat at the corners and holds up through repeated washing better than a turned hem on thick fabric.',
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
          text: 'Main throw panel 120 x 180 cm in fleece, wool, or heavy cotton. Two long binding strips 7 x 186 cm, cut on the bias. Two short binding strips 7 x 126 cm, cut on the bias. All binding cut from a contrasting or matching woven cotton.',
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
                  text: 'Pre-wash the binding fabric. Pre-wash the throw panel only if the fabric permits it. Press the binding strips.',
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
                  text: 'Fold each binding strip in half lengthwise and press. Open out. Fold each long raw edge in to the centre crease and press again. You now have a four-layer binding strip with no raw edges exposed on the outside. This is ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'bias-binding' } }],
                  text: 'bias binding',
                },
                {
                  type: 'text',
                  text: ' folded to enclose the edge.',
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
                  text: 'Attach the short binding strips to the two short ends of the throw first. Open one fold of the binding. Align the raw edge of the binding with the raw edge of the throw, right sides together. Pin the binding starting 3 cm from the corner (leave tail).',
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
                  text: 'Stitch along the first pressed crease (half the binding width from the raw edge). Stop at the corner.',
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
                  text: 'Repeat for the second short end.',
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
                  text: 'Attach the long binding strips to the two long edges in the same way, leaving a 3 cm tail at each end so they will wrap around the corners.',
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
                  text: 'At each corner, fold the short strip tail around to the back. Fold the long strip in a neat ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'mitered-corner' } }],
                  text: 'mitred corner',
                },
                {
                  type: 'text',
                  text: '. Press the mitre firmly.',
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
                  text: 'Fold the binding to the back of the throw, enclosing the raw edge. Pin in place from the back. The binding should just cover the line of machine stitching on the front.',
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
                  text: 'Hand-stitch the binding to the back of the throw using a slip stitch. Or stitch in the ditch from the front, which is quicker but leaves a visible line on the back.',
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
                  text: 'Press the finished throw, paying attention to the corners so the binding lies flat with a crisp mitre.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── 10. Drum lampshade cover ──────────────────────────────────────────────────

const lampshadeInstructions = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'A drum lampshade cover is a rectangle of interfaced fabric with its short ends joined to form a cylinder, finished at top and bottom with bias binding that holds the cover to the shade frame.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Measuring your shade' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Measure the circumference of your drum shade with a tape measure and note the height. The main panel cuts to: circumference + 3 cm (seam allowance) wide, by height + 4 cm (2 cm top and bottom for binding) tall. Each bias binding strip cuts to: 4 cm wide by circumference + 5 cm long.',
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
                  text: 'Pre-wash and press your outer fabric.',
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
                  text: 'Apply light ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'interfacing-fusible' } }],
                  text: 'fusible interfacing',
                },
                {
                  type: 'text',
                  text: ' to the full wrong side of the main panel. Use a non-woven sew-in interfacing or a very light fusible to prevent the interfacing shadow showing through the fabric when the light is on. Press from the wrong side with a damp cloth.',
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
                  text: 'Fold the main panel in half, right sides together, short ends aligned. Stitch the short ends together with a 1.5 cm seam to form a cylinder. Press the seam open.',
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
                  text: 'Slide the fabric cylinder over the lampshade frame, wrong side out. The seam should sit at the back.',
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
                  text: 'Adjust the cylinder so the top and bottom raw edges extend 2 cm beyond the shade ring on each side. Mark any tension adjustments needed, then remove the cover and re-press if required.',
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
                  text: 'Prepare the ',
                },
                {
                  type: 'text',
                  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'bias-binding' } }],
                  text: 'bias binding',
                },
                {
                  type: 'text',
                  text: ': fold and press both strips as for the throw blanket, four-layer folded binding.',
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
                  text: 'With the cover right side out and off the shade, open one fold of the top binding strip and align its raw edge with the top raw edge of the cylinder. Pin all the way around, overlapping the start and end by 15 mm. Stitch along the crease.',
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
                  text: 'Fold the binding to the inside of the cylinder, enclosing the raw edge. Pin. Topstitch 2 mm from the inner fold all the way around.',
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
                  text: 'Repeat the binding application at the bottom edge of the cylinder.',
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
                  text: 'Slide the finished cover back onto the shade frame. The bound edges grip the wire rings lightly. If the cover is loose, remove it, take in the seam by a few millimetres, and re-press before replacing.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Note on light and heat' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This cover is designed for LED bulbs only. Incandescent and halogen bulbs generate enough heat to discolour or char fabric. Always check that your bulb is rated for enclosed or semi-enclosed use before fitting.',
        },
      ],
    },
  ],
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const homeCat = await prisma.subCategory.findFirstOrThrow({
    where: { slug: 'home', category: { slug: 'sewing' } },
    select: { id: true },
  })
  console.log(`Sub-category 'home' id: ${homeCat.id}`)

  const patterns = [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-pillowcase-housewife-french-seam',
      name: 'Housewife pillowcase with French seam',
      description:
        'A classic housewife-style pillowcase with a tucked flap to hold the pillow in place. The three seams are finished with a French seam so no raw edges are visible inside the case.',
      garmentCategory: 'HOME' as const,
      garmentType: 'housewife pillowcase',
      skillLevel: 'BEGINNER' as const,
      difficulty: 'BEGINNER' as const,
      seamAllowanceCm: 0.6,
      instructionsBody: pillowcaseInstructions,
      pieceList: [
        {
          name: 'Main body',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(1080, 530),
          grainline: grainlineV(1080, 530),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Main body (cut 1) — 108 x 53 cm',
        },
        {
          name: 'Turn-back flap',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(280, 530),
          grainline: grainlineV(280, 530),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Turn-back flap (cut 1) — 28 x 53 cm',
        },
      ],
      supportedSizes: [{ name: 'Standard', body: {} }],
      sizingNotes: 'Standard size fits a 50 x 75 cm pillow. For a 65 x 65 cm square pillow, cut the main body 138 x 68 cm and the flap 28 x 68 cm.',
      fabricRequirementsCm: {
        Standard: {
          '140': { lengthCm: 115, notes: 'Cut main body and flap from a single width.' },
          '115': { lengthCm: 145, notes: 'Pieces may need repositioning to fit the narrower width.' },
        },
      },
      cuttingLayouts: {
        Standard: {
          '140': { totalLengthCm: 115, layoutNotes: 'Lay both pieces along the selvedge, grain parallel. Main body at the bottom, flap above.' },
          '115': { totalLengthCm: 145, layoutNotes: 'Lay main body along the selvedge. Place flap alongside if width permits, otherwise above.' },
        },
      },
      recommendedFabrics: [
        { type: 'cotton percale', weight: 'light to medium', widthCm: 140, notes: 'Smooth finish, washes well. Pre-wash at 60 deg C for bedlinen use.' },
        { type: 'linen', weight: 'medium', widthCm: 140, notes: 'Softens with washing. Pre-wash twice before cutting.' },
        { type: 'cotton sateen', weight: 'medium', widthCm: 140, notes: 'Slightly shiny side faces out. Handle cut edges carefully as sateen frays.' },
      ],
      recommendedNotions: [
        { name: 'All-purpose thread', spec: 'Polyester or cotton-wrapped', quantity: 1, notes: 'Colour-matched to fabric.' },
        { name: 'Sewing machine needle', spec: '80/12 universal', quantity: 1, notes: 'Replace at the start of the project if the current needle has been used for other sewing.' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-cushion-cover-envelope-back',
      name: 'Cushion cover with envelope back',
      description:
        'A 45 x 45 cm cushion cover with a clean front panel and an overlapping envelope back so the pad inserts without any zip or fastening.',
      garmentCategory: 'HOME' as const,
      garmentType: 'envelope-back cushion cover',
      skillLevel: 'BEGINNER' as const,
      difficulty: 'BEGINNER' as const,
      seamAllowanceCm: 1.0,
      instructionsBody: cushionInstructions,
      pieceList: [
        {
          name: 'Front panel',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(430, 430),
          grainline: grainlineV(430, 430),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Front panel (cut 1) — 43 x 43 cm',
        },
        {
          name: 'Back panel A',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(430, 300),
          grainline: grainlineV(430, 300),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Back panel A (cut 1) — 43 x 30 cm',
        },
        {
          name: 'Back panel B',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(430, 300),
          grainline: grainlineV(430, 300),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Back panel B (cut 1) — 43 x 30 cm',
        },
      ],
      supportedSizes: [{ name: 'Standard 45x45', body: {} }],
      sizingNotes: 'Fits a 45 x 45 cm cushion pad. For a 50 x 50 cm pad, add 2 cm to each dimension of all three pieces.',
      fabricRequirementsCm: {
        'Standard 45x45': {
          '140': { lengthCm: 55, notes: 'All three pieces fit across a 140 cm width in one cut.' },
          '115': { lengthCm: 90, notes: 'Front panel and one back panel in one cut, second back panel in a second cut.' },
        },
      },
      cuttingLayouts: {
        'Standard 45x45': {
          '140': { totalLengthCm: 55, layoutNotes: 'Lay front panel across the width. Place both back panels alongside.' },
          '115': { totalLengthCm: 90, layoutNotes: 'Lay front panel in the first 45 cm. Place both back panels in the next 45 cm.' },
        },
      },
      recommendedFabrics: [
        { type: 'medium-weight cotton', weight: 'medium', widthCm: 140, notes: 'Quilting cotton or furnishing cotton both work well.' },
        { type: 'linen blend', weight: 'medium', widthCm: 140, notes: 'Gives a slightly textured finish. Pre-wash before cutting.' },
        { type: 'velvet', weight: 'medium to heavy', widthCm: 140, notes: 'Cut all pieces in the same nap direction. Use a walking foot to prevent shifting.' },
      ],
      recommendedNotions: [
        { name: 'All-purpose thread', spec: 'Polyester', quantity: 1, notes: 'Colour-matched.' },
        { name: 'Sewing machine needle', spec: '80/12 universal or 90/14 for heavier fabrics', quantity: 1, notes: '' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-tea-towel-mitred-corners',
      name: 'Tea towel with mitred corners',
      description:
        'A 50 x 75 cm tea towel with a double-fold hem and crisp mitred corners. The mitre folds the corner fabric back on itself at 45 degrees so the hem lies completely flat.',
      garmentCategory: 'HOME' as const,
      garmentType: 'tea towel',
      skillLevel: 'BEGINNER' as const,
      difficulty: 'BEGINNER' as const,
      seamAllowanceCm: 1.5,
      instructionsBody: teaTowelInstructions,
      pieceList: [
        {
          name: 'Main rectangle',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(560, 810),
          grainline: grainlineV(560, 810),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Main rectangle (cut 1) — 56 x 81 cm',
        },
      ],
      supportedSizes: [{ name: 'Standard', body: {} }],
      sizingNotes: 'Finished size 50 x 75 cm. Cut piece is 56 x 81 cm to include 3 cm hems (two 15 mm folds) on all four sides.',
      fabricRequirementsCm: {
        Standard: {
          '140': { lengthCm: 90, notes: 'Cut two towels side by side from a 90 cm length.' },
          '115': { lengthCm: 90, notes: 'One towel per 90 cm length.' },
        },
      },
      cuttingLayouts: {
        Standard: {
          '140': { totalLengthCm: 90, layoutNotes: 'Place the single piece along the selvedge with grain running lengthwise.' },
          '115': { totalLengthCm: 90, layoutNotes: 'Place along the selvedge.' },
        },
      },
      recommendedFabrics: [
        { type: 'linen', weight: 'medium', widthCm: 140, notes: 'Most absorbent option. Pre-wash at 60 deg C twice before cutting.' },
        { type: 'cotton waffle', weight: 'medium', widthCm: 140, notes: 'Textured surface aids drying. Check grain carefully before cutting.' },
        { type: 'cotton', weight: 'medium', widthCm: 140, notes: 'Tightly woven cotton gives crisp corners.' },
      ],
      recommendedNotions: [
        { name: 'All-purpose thread', spec: 'Cotton or polyester', quantity: 1, notes: 'Colour-matched.' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-kitchen-apron-cross-back',
      name: 'Kitchen apron with cross-back straps',
      description:
        'A full-length kitchen apron where the back straps cross between the shoulder blades, removing pressure from the neck and keeping the apron in place without constant readjustment.',
      garmentCategory: 'HOME' as const,
      garmentType: 'cross-back apron',
      skillLevel: 'IMPROVER' as const,
      difficulty: 'INTERMEDIATE' as const,
      seamAllowanceCm: 1.0,
      instructionsBody: apronInstructions,
      pieceList: [
        {
          name: 'Apron body',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(700, 800),
          grainline: grainlineV(700, 800),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Apron body (cut 1) — 70 x 80 cm',
        },
        {
          name: 'Neck strap',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(80, 800),
          grainline: grainlineH(80, 800),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Neck strap (cut 1) — 8 x 80 cm',
        },
        {
          name: 'Cross-back strap',
          cut: 2,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(80, 1300),
          grainline: grainlineH(80, 1300),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Cross-back strap (cut 2) — 8 x 130 cm',
        },
        {
          name: 'Waistband tie',
          cut: 2,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(80, 700),
          grainline: grainlineH(80, 700),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Waistband tie (cut 2) — 8 x 70 cm',
        },
      ],
      supportedSizes: [{ name: 'Standard', body: {} }],
      sizingNotes: 'The apron body fits most adult sizes. Lengthen the cross-back straps by 10 cm per size for larger frames. The waistband ties are generous and can be trimmed after trying on.',
      fabricRequirementsCm: {
        Standard: {
          '140': { lengthCm: 290, notes: 'Apron body, neck strap, cross-back straps, and ties cut from a single length.' },
          '115': { lengthCm: 320, notes: 'Same pieces; straps may need repositioning to fit the narrower width.' },
        },
      },
      cuttingLayouts: {
        Standard: {
          '140': { totalLengthCm: 290, layoutNotes: 'Apron body at the base. Straps and ties above, running lengthwise.' },
          '115': { totalLengthCm: 320, layoutNotes: 'Apron body first, then straps in subsequent cuts.' },
        },
      },
      recommendedFabrics: [
        { type: 'cotton canvas', weight: 'medium-heavy', widthCm: 140, notes: 'Durable and holds its shape. Pre-wash to preshrink.' },
        { type: 'denim', weight: 'medium', widthCm: 140, notes: '8 oz or 10 oz denim. Avoid heavier weights as straps become stiff.' },
        { type: 'linen', weight: 'medium', widthCm: 140, notes: 'Softens with use. Pre-wash twice.' },
      ],
      recommendedNotions: [
        { name: 'All-purpose thread', spec: 'Heavy-duty polyester', quantity: 2, notes: 'Extra thread needed for topstitching all straps.' },
        { name: 'Sewing machine needle', spec: '90/14 jeans or universal', quantity: 1, notes: 'For medium-heavy fabrics.' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-pot-holder-oven-mitt-set',
      name: 'Pot holder and oven mitt set',
      description:
        'A matching pot holder and oven mitt where the heat protection comes from a layer of insulated batting held in place by diagonal straight-line quilting, finished with bias binding.',
      garmentCategory: 'HOME' as const,
      garmentType: 'pot holder and oven mitt set',
      skillLevel: 'IMPROVER' as const,
      difficulty: 'INTERMEDIATE' as const,
      seamAllowanceCm: 0.6,
      instructionsBody: potHolderInstructions,
      pieceList: [
        {
          name: 'Pot holder front (outer + batting + lining)',
          cut: 3,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(220, 220),
          grainline: grainlineV(220, 220),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Pot holder front (cut 1 outer, 1 batting, 1 lining) — 22 x 22 cm',
        },
        {
          name: 'Pot holder back (outer + batting + lining)',
          cut: 3,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(220, 220),
          grainline: grainlineV(220, 220),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Pot holder back (cut 1 outer, 1 batting, 1 lining) — 22 x 22 cm',
        },
        {
          name: 'Oven mitt front (outer + insul-bright + lining)',
          cut: 3,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: [
            { x: 0, y: 0 },
            { x: 140, y: 0 },
            { x: 180, y: 80 },
            { x: 200, y: 200 },
            { x: 190, y: 320 },
            { x: 150, y: 420 },
            { x: 80, y: 480 },
            { x: 0, y: 480 },
            { x: 0, y: 0 },
          ],
          grainline: grainlineV(200, 480),
          notchPoints: [{ x: 140, y: 0 }],
          onFoldEdge: null,
          label: 'Oven mitt front (cut 1 outer, 1 insul-bright, 1 lining)',
        },
        {
          name: 'Oven mitt back (outer + insul-bright + lining)',
          cut: 3,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: [
            { x: 0, y: 0 },
            { x: 140, y: 0 },
            { x: 180, y: 80 },
            { x: 200, y: 200 },
            { x: 190, y: 320 },
            { x: 150, y: 420 },
            { x: 80, y: 480 },
            { x: 0, y: 480 },
            { x: 0, y: 0 },
          ],
          grainline: grainlineV(200, 480),
          notchPoints: [{ x: 140, y: 0 }],
          onFoldEdge: null,
          label: 'Oven mitt back (cut 1 outer, 1 insul-bright, 1 lining)',
        },
      ],
      supportedSizes: [{ name: 'Standard', body: {} }],
      sizingNotes: 'Pot holder finished size: approximately 20 x 20 cm. Oven mitt fits an average adult hand. Extend the mitt body by 3 cm at the wrist for larger hands.',
      fabricRequirementsCm: {
        Standard: {
          '140': { lengthCm: 60, notes: 'Outer fabric only. Cut batting and lining to the same dimensions from their respective materials.' },
        },
      },
      cuttingLayouts: {
        Standard: {
          '140': { totalLengthCm: 60, layoutNotes: 'Lay all outer pieces together. Trace oven mitt template from a paper pattern before cutting.' },
        },
      },
      recommendedFabrics: [
        { type: 'cotton quilting fabric', weight: 'light to medium', widthCm: 140, notes: 'Outer fabric. Choose 100% cotton, not poly blends, near heat.' },
        { type: 'insul-bright', weight: 'n/a', widthCm: 90, notes: 'Reflective batting for oven mitt. Follow manufacturer handling instructions.' },
        { type: 'cotton batting', weight: 'light', widthCm: 90, notes: 'For the pot holder layers. 100% cotton only.' },
        { type: 'cotton muslin', weight: 'light', widthCm: 140, notes: 'For lining. Must be 100% cotton.' },
      ],
      recommendedNotions: [
        { name: 'Bias binding tape', spec: '2.5 cm wide, cotton', quantity: 1, notes: 'Approximately 2 metres for the full set.' },
        { name: 'Walking foot', spec: 'For your machine model', quantity: 1, notes: 'Recommended for quilting through multiple layers.' },
        { name: 'All-purpose thread', spec: '100% cotton', quantity: 1, notes: 'Use cotton thread for any project near heat.' },
      ],
      hasLining: true,
      hasInterfacing: true,
      hasClosure: false,
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-table-runner-mitred-border',
      name: 'Table runner with mitred-corner border',
      description:
        'A 35 x 180 cm table runner with a contrasting border sewn as four strips and mitred at each corner to produce a neat picture-frame effect.',
      garmentCategory: 'HOME' as const,
      garmentType: 'table runner',
      skillLevel: 'IMPROVER' as const,
      difficulty: 'INTERMEDIATE' as const,
      seamAllowanceCm: 1.0,
      instructionsBody: tableRunnerInstructions,
      pieceList: [
        {
          name: 'Main panel',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(290, 1740),
          grainline: grainlineV(290, 1740),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Main panel (cut 1) — 29 x 174 cm',
        },
        {
          name: 'Long border strip',
          cut: 2,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(80, 1860),
          grainline: grainlineH(80, 1860),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Long border strip (cut 2) — 8 x 186 cm',
        },
        {
          name: 'Short border strip',
          cut: 2,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(80, 470),
          grainline: grainlineH(80, 470),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Short border strip (cut 2) — 8 x 47 cm',
        },
      ],
      supportedSizes: [{ name: 'Standard', body: {} }],
      sizingNotes: 'Finished size 35 x 180 cm. Scale the main panel and border strips proportionally for a different length.',
      fabricRequirementsCm: {
        Standard: {
          '140': { lengthCm: 220, notes: 'Main panel and border strips from one fabric. If using a contrasting border, cut separately.' },
          '115': { lengthCm: 250, notes: 'Longer run required to fit border strips beside the main panel.' },
        },
      },
      cuttingLayouts: {
        Standard: {
          '140': { totalLengthCm: 220, layoutNotes: 'Cut main panel first. Long border strips run the full length alongside. Short strips from remaining fabric.' },
          '115': { totalLengthCm: 250, layoutNotes: 'Main panel and one long border side by side. Second long border and short strips below.' },
        },
      },
      recommendedFabrics: [
        { type: 'cotton', weight: 'medium', widthCm: 140, notes: 'Lightly starched cotton presses cleanly for sharp mitres.' },
        { type: 'linen', weight: 'medium', widthCm: 140, notes: 'Natural texture. Press with steam for crisp seams.' },
        { type: 'cotton-linen blend', weight: 'medium', widthCm: 140, notes: 'Good drape and easy to press.' },
      ],
      recommendedNotions: [
        { name: 'All-purpose thread', spec: 'Cotton or polyester', quantity: 1, notes: 'Colour-matched to main or border fabric.' },
        { name: 'Set square or quilting ruler', spec: '30 cm minimum', quantity: 1, notes: 'For marking accurate 45-degree mitre lines.' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-rod-pocket-curtain-panel',
      name: 'Rod-pocket curtain panel',
      description:
        'A single curtain panel with a stitched rod-pocket channel at the top and a heading ruffle above it. The panel threads directly onto the rod without rings or clips.',
      garmentCategory: 'HOME' as const,
      garmentType: 'rod-pocket curtain',
      skillLevel: 'BEGINNER' as const,
      difficulty: 'BEGINNER' as const,
      seamAllowanceCm: 1.0,
      instructionsBody: rodPocketInstructions,
      pieceList: [
        {
          name: 'Curtain panel',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(1900, 2600),
          grainline: grainlineV(1900, 2600),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Curtain panel (cut to your dimensions) — see sizing notes',
        },
      ],
      supportedSizes: [{ name: 'Custom', body: {} }],
      sizingNotes: 'Cut width: 1.5 x window width + 10 cm for side hems. Cut length: finished drop + 20 cm (rod pocket + heading) + 15 cm (bottom hem). Example for a 120 cm wide x 240 cm drop window: cut 190 cm wide x 275 cm long. The piece template shows a representative size; your actual cut will differ.',
      fabricRequirementsCm: {
        Custom: {
          '140': { lengthCm: 275, notes: 'Example for a 120 x 240 cm window. Recalculate for your window.' },
          '115': { lengthCm: 310, notes: 'Wider fabric needed to achieve 1.5x fullness for wider windows.' },
        },
      },
      cuttingLayouts: {
        Custom: {
          '140': { totalLengthCm: 275, layoutNotes: 'Lay selvedges parallel to the cut length. Check grain is straight before cutting.' },
          '115': { totalLengthCm: 310, layoutNotes: 'Join widths with a flat-felled seam if a wider panel is needed.' },
        },
      },
      recommendedFabrics: [
        { type: 'cotton voile', weight: 'light', widthCm: 140, notes: 'Sheer, filters light. Good for bedrooms.' },
        { type: 'linen', weight: 'medium', widthCm: 140, notes: 'Hangs with good weight. Pre-wash twice.' },
        { type: 'cotton', weight: 'medium', widthCm: 140, notes: 'Wide range of weights available. Heavier weight hangs in better folds.' },
        { type: 'cotton-linen blend', weight: 'medium', widthCm: 140, notes: 'Good drape with a textured look.' },
      ],
      recommendedNotions: [
        { name: 'All-purpose thread', spec: 'Polyester', quantity: 2, notes: 'Extra thread for a long panel.' },
        { name: 'Curtain rod', spec: 'Diameter to match your rod pocket depth', quantity: 1, notes: 'Check the rod fits through the pocket before stitching.' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 8 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-eyelet-curtain-heading',
      name: 'Eyelet curtain heading',
      description:
        'A curtain panel with a ring-eyelet heading where the pole threads through large metal rings, giving evenly-spaced cylindrical pleats and a contemporary look.',
      garmentCategory: 'HOME' as const,
      garmentType: 'eyelet curtain',
      skillLevel: 'IMPROVER' as const,
      difficulty: 'INTERMEDIATE' as const,
      seamAllowanceCm: 1.0,
      instructionsBody: eyeletCurtainInstructions,
      pieceList: [
        {
          name: 'Curtain panel',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(1900, 2650),
          grainline: grainlineV(1900, 2650),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Curtain panel (cut to your dimensions)',
        },
        {
          name: 'Facing strip',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(1900, 100),
          grainline: grainlineH(1900, 100),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Facing strip (cut 1) — 10 cm x panel width',
        },
      ],
      supportedSizes: [{ name: 'Custom', body: {} }],
      sizingNotes: 'Cut width: 2 x window width for eyelet heading (eyelets take up more width than rod pocket). Cut length: finished drop + 15 cm top (facing + seam) + 15 cm bottom hem. Facing strip: 10 cm x panel cut width.',
      fabricRequirementsCm: {
        Custom: {
          '140': { lengthCm: 300, notes: 'Includes curtain panel and facing strip for a typical 240 cm drop window.' },
        },
      },
      cuttingLayouts: {
        Custom: {
          '140': { totalLengthCm: 300, layoutNotes: 'Main panel first. Facing strip from remaining fabric at same grain.' },
        },
      },
      recommendedFabrics: [
        { type: 'linen', weight: 'medium', widthCm: 140, notes: 'The most common choice for eyelet curtains. Hangs in good folds.' },
        { type: 'cotton', weight: 'medium-heavy', widthCm: 140, notes: 'Heavier weight holds the eyelet pleats better.' },
        { type: 'velvet', weight: 'heavy', widthCm: 140, notes: 'Eyelet heading suits velvet; avoid rod-pocket styles with velvet as threading is difficult.' },
      ],
      recommendedNotions: [
        { name: 'Eyelet kit', spec: '40 mm diameter rings, brass or nickel', quantity: 1, notes: 'Count: number of eyelets = (panel width / 150 mm) rounded to nearest even number.' },
        { name: 'Fusible interfacing', spec: 'Medium weight, woven, same width as facing strip', quantity: 1, notes: 'Must be firm enough to support the eyelet.' },
        { name: 'Hammer and cutting mat', spec: 'For setting eyelets', quantity: 1, notes: 'A rubber mallet is kinder to the eyelet surface than a metal hammer.' },
        { name: 'All-purpose thread', spec: 'Polyester', quantity: 2, notes: '' },
      ],
      hasLining: false,
      hasInterfacing: true,
      hasClosure: false,
    },

    // ── 9 ─────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-throw-blanket-binding',
      name: 'Throw blanket with binding-finished edges',
      description:
        'A 120 x 180 cm throw where bias-cut binding strips wrap all four edges and mitre at the corners, giving a flat, laundry-resistant finish that suits fleece, wool, and heavy cotton.',
      garmentCategory: 'HOME' as const,
      garmentType: 'throw blanket',
      skillLevel: 'BEGINNER' as const,
      difficulty: 'BEGINNER' as const,
      seamAllowanceCm: 1.0,
      instructionsBody: throwBlanketInstructions,
      pieceList: [
        {
          name: 'Main throw panel',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(1200, 1800),
          grainline: grainlineV(1200, 1800),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Main throw panel (cut 1) — 120 x 180 cm',
        },
        {
          name: 'Long binding strip',
          cut: 2,
          fold: null,
          grainDirection: 'bias',
          pathPoints: rect(70, 1860),
          grainline: { from: { x: 35, y: 50 }, to: { x: 35, y: 1810 } },
          notchPoints: [],
          onFoldEdge: null,
          label: 'Long binding strip (cut 2 on bias) — 7 x 186 cm',
        },
        {
          name: 'Short binding strip',
          cut: 2,
          fold: null,
          grainDirection: 'bias',
          pathPoints: rect(70, 1260),
          grainline: { from: { x: 35, y: 50 }, to: { x: 35, y: 1210 } },
          notchPoints: [],
          onFoldEdge: null,
          label: 'Short binding strip (cut 2 on bias) — 7 x 126 cm',
        },
      ],
      supportedSizes: [{ name: 'Standard', body: {} }],
      sizingNotes: 'Finished size 120 x 180 cm. Scale all pieces proportionally for a smaller or larger throw. Baby size 90 x 110 cm also works well with the same binding method.',
      fabricRequirementsCm: {
        Standard: {
          '140': { lengthCm: 190, notes: 'Throw panel plus binding strips from same or contrasting fabric.' },
          '115': { lengthCm: 220, notes: 'Throw panel first, binding strips cut on the bias from remaining fabric.' },
        },
      },
      cuttingLayouts: {
        Standard: {
          '140': { totalLengthCm: 190, layoutNotes: 'Main panel takes the bulk of the fabric. Cut binding on the true bias from corners of remaining fabric.' },
          '115': { totalLengthCm: 220, layoutNotes: 'Main panel first. Join short bias strips on the diagonal to reach the required length.' },
        },
      },
      recommendedFabrics: [
        { type: 'anti-pill fleece', weight: 'medium', widthCm: 150, notes: 'Does not fray, so binding is a purely decorative finish.' },
        { type: 'wool blend', weight: 'medium-heavy', widthCm: 140, notes: 'Warm and durable. Pre-wash on a gentle cycle and flat-dry.' },
        { type: 'heavy cotton', weight: 'heavy', widthCm: 140, notes: 'Good for summer use. Pre-wash at 60 deg C.' },
      ],
      recommendedNotions: [
        { name: 'Bias binding tape', spec: '7 cm wide unfolded, cotton', quantity: 1, notes: 'Or make your own from coordinating cotton as described in the steps.' },
        { name: 'All-purpose thread', spec: 'Cotton or polyester', quantity: 2, notes: 'Match the binding fabric for the machine stitching and hand stitching.' },
        { name: 'Walking foot', spec: 'For your machine model', quantity: 1, notes: 'Helpful for sewing through thick fleece or wool layers.' },
      ],
      hasLining: false,
      hasInterfacing: false,
      hasClosure: false,
    },

    // ── 10 ────────────────────────────────────────────────────────────────
    {
      slug: 'sewing-drum-lampshade-cover',
      name: 'Drum lampshade cover',
      description:
        'A cover for a drum lampshade made from a single rectangle of interfaced fabric joined at its short ends into a cylinder, with bias binding applied at the top and bottom edges to grip the wire frame rings.',
      garmentCategory: 'HOME' as const,
      garmentType: 'drum lampshade cover',
      skillLevel: 'INTERMEDIATE' as const,
      difficulty: 'INTERMEDIATE' as const,
      seamAllowanceCm: 1.5,
      instructionsBody: lampshadeInstructions,
      pieceList: [
        {
          name: 'Main panel',
          cut: 1,
          fold: null,
          grainDirection: 'lengthwise',
          pathPoints: rect(1060, 340),
          grainline: grainlineV(1060, 340),
          notchPoints: [],
          onFoldEdge: null,
          label: 'Main panel (cut to your shade dimensions) — circumference + 3 cm x height + 4 cm',
        },
        {
          name: 'Bias binding strip top',
          cut: 1,
          fold: null,
          grainDirection: 'bias',
          pathPoints: rect(40, 1090),
          grainline: { from: { x: 20, y: 40 }, to: { x: 20, y: 1050 } },
          notchPoints: [],
          onFoldEdge: null,
          label: 'Bias binding strip top (cut 1) — 4 cm x circumference + 5 cm',
        },
        {
          name: 'Bias binding strip bottom',
          cut: 1,
          fold: null,
          grainDirection: 'bias',
          pathPoints: rect(40, 1090),
          grainline: { from: { x: 20, y: 40 }, to: { x: 20, y: 1050 } },
          notchPoints: [],
          onFoldEdge: null,
          label: 'Bias binding strip bottom (cut 1) — 4 cm x circumference + 5 cm',
        },
      ],
      supportedSizes: [{ name: 'Custom', body: {} }],
      sizingNotes: 'Measure your shade circumference and height before cutting. Main panel: circumference + 3 cm wide, height + 4 cm tall. Each binding strip: 4 cm wide, circumference + 5 cm long. The template shows a representative 33 cm diameter x 30 cm tall drum (circumference approximately 104 cm).',
      fabricRequirementsCm: {
        Custom: {
          '140': { lengthCm: 60, notes: 'For a standard 30 cm diameter x 25 cm tall drum. Binding cut on bias from remaining fabric.' },
          '115': { lengthCm: 70, notes: 'Same shade size; slightly more fabric needed to cut binding on the true bias.' },
        },
      },
      cuttingLayouts: {
        Custom: {
          '140': { totalLengthCm: 60, layoutNotes: 'Main panel along the grain. Binding strips cut on the true 45-degree bias from corner offcuts.' },
          '115': { totalLengthCm: 70, layoutNotes: 'Main panel first, then bias strips from remaining fabric.' },
        },
      },
      recommendedFabrics: [
        { type: 'cotton', weight: 'light to medium', widthCm: 140, notes: 'Avoid dark or patterned fabric with a strong light source as shadows may show through. Test a swatch with your bulb first.' },
        { type: 'linen', weight: 'light to medium', widthCm: 140, notes: 'Natural texture diffuses light attractively.' },
        { type: 'silk dupion', weight: 'light', widthCm: 114, notes: 'Gives a rich finish but frays considerably. Handle cut edges with care and fuse interfacing promptly.' },
      ],
      recommendedNotions: [
        { name: 'Light fusible interfacing', spec: 'Non-woven or very light woven, full width of panel', quantity: 1, notes: 'Must not be stiff enough to shadow through the fabric. Test on a scrap first.' },
        { name: 'Bias binding tape', spec: '4 cm wide unfolded, cotton', quantity: 1, notes: 'Approximately 2 x circumference + 10 cm. Match to outer fabric or use a contrast.' },
        { name: 'All-purpose thread', spec: 'Cotton or polyester', quantity: 1, notes: 'Colour-matched to outer fabric.' },
      ],
      hasLining: false,
      hasInterfacing: true,
      hasClosure: false,
    },
  ]

  for (const p of patterns) {
    const result = await prisma.sewingPattern.upsert({
      where: { slug: p.slug },
      create: {
        ...p,
        subCategoryId: homeCat.id,
        seamAllowanceIncluded: true,
        isFreesewingDesign: false,
        sourceLicence: 'PROPRIETARY_HOMEMADE',
        attributionText: 'Homemade-original house pattern',
        heroMediaId: null,
        premium: false,
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
        availableFormats: ['A4_TILED', 'LETTER_TILED', 'A0', 'BROWSE_ONLY'],
      },
      update: {
        ...p,
        subCategoryId: homeCat.id,
        seamAllowanceIncluded: true,
        isFreesewingDesign: false,
        sourceLicence: 'PROPRIETARY_HOMEMADE',
        attributionText: 'Homemade-original house pattern',
        heroMediaId: null,
        premium: false,
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
        availableFormats: ['A4_TILED', 'LETTER_TILED', 'A0', 'BROWSE_ONLY'],
      },
      select: { id: true, slug: true, name: true },
    })
    console.log(`Upserted: ${result.name} (${result.id})`)
  }

  console.log('\nAll 10 patterns upserted.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
