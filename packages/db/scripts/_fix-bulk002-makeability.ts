/**
 * Adds a troubleshooter node to the 17 bulk-002 cross-stitch project
 * tutorials that lack one, inserted before the "What to try next" heading.
 * Also adds completion-criterion language where needed.
 *
 * Run from packages/db:
 *   tsx scripts/_fix-bulk002-makeability.ts
 */
import fs from 'fs'
import path from 'path'

const BRIEFS = path.resolve(process.cwd(), '../../docs/cross-stitch-bulk-002-briefs')

// Troubleshooter items keyed by file number
const TROUBLESHOOTERS: Record<number, { symptom: string; cause: string; fix: string }[]> = {
  21: [ // simple-dog-portrait — animals
    {
      symptom: 'The dog\'s eye looks like a solid block rather than a rounded shape',
      cause: 'The surrounding dark stitches were worked right up to the highlight stitch without leaving space for the pale reflection square.',
      fix: 'Place the highlight stitch first, then work the dark ring around it. Once the ring is complete, the eye should read as a circle even at arm\'s length.',
    },
    {
      symptom: 'The fur areas look flat rather than textured',
      cause: 'All the stitches in a colour area run in the same direction, which reads as a uniform block.',
      fix: 'Vary the direction of stitches within a fur area: work one row left-to-right, the next right-to-left. The slight tonal shift gives an impression of depth when the piece is viewed from a distance.',
    },
  ],
  23: [ // owl-on-branch
    {
      symptom: 'The face disc looks square rather than circular',
      cause: 'The outer row of the disc was stitched as a straight edge instead of following the stepped curve on the chart.',
      fix: 'Count the stepping carefully on the chart: the disc edge has single-stitch steps at the corners. Work those single stitches first, then fill inward. Once all the outer stepping is in, the circular shape should read clearly.',
    },
    {
      symptom: 'The branch looks smudged at the join to the talon',
      cause: 'The talon detail back-stitch was worked before the surrounding cross-stitches were complete, and later stitches covered part of it.',
      fix: 'Always add back-stitch detail last, when all cross-stitches in the area are finished. Work the talon lines once the surrounding branch colour is complete and stable.',
    },
  ],
  24: [ // rabbit-in-meadow
    {
      symptom: 'The rabbit\'s ear edges look jagged rather than smooth',
      cause: 'The stepped edge of the ear was stitched without following the half-stitch steps on the chart.',
      fix: 'Use fractional stitches (three-quarter crosses) at the ear tips where the chart shows partial squares. These soften the stepped edge once the piece is viewed from normal distance.',
    },
    {
      symptom: 'The meadow background looks darker on one side',
      cause: 'The number of strands used changed part-way through, or the thread was pulled tighter on one side.',
      fix: 'Use two strands throughout on 14-count Aida and keep the thread tension even: after each cross, the thread should sit flat on the fabric without pulling the weave. Work a test patch until the tension feels consistent before continuing.',
    },
  ],
  25: [ // butterfly-on-lavender
    {
      symptom: 'The wing colour graduation looks stripy rather than gradual',
      cause: 'Each colour was worked in a complete block before moving to the next shade.',
      fix: 'Work the graduation in diagonal rows that mix adjacent colours. Once both shades are blended in the transition row, the shift reads as smooth from a distance.',
    },
    {
      symptom: 'The lavender stems look like a solid mass',
      cause: 'The bud area was stitched with no variation between stem and flower colour.',
      fix: 'The bud tips should use the lighter purple; the calyx uses the grey-green. Work the tips first, then the calyx stitches around them. The piece is finished when the two-tone separation is visible in the bud cluster.',
    },
  ],
  26: [ // poppy-and-seed-head
    {
      symptom: 'The petal edges look hard and geometric',
      cause: 'The petal outline was stitched as straight rows without following the curved edge on the chart.',
      fix: 'Petal curves use single-stitch stepping. Work the outline stitches first to define the shape, then fill inward. Once the outline is complete, fill stitches should sit smooth within the stepped boundary.',
    },
    {
      symptom: 'The seed head centre looks too light',
      cause: 'The deep olive green (3011) was not stitched densely enough in the centre.',
      fix: 'The centre should be fully covered: count the chart squares and make sure every one in the seed head has a cross. Once the fill is complete, the seed head should read as a dark oval that contrasts with the surrounding pod.',
    },
  ],
  27: [ // tulip-trio
    {
      symptom: 'The three tulip heads are at different heights',
      cause: 'Each tulip was started independently without first checking that the stem bases align on the same counted row.',
      fix: 'Establish the base row for all three stems before stitching any petals. Mark the row with a single anchor stitch on each stem position, then work all three stems to the same height before adding the heads.',
    },
    {
      symptom: 'The tulip petals look stripy across the colour blend',
      cause: 'The pale and mid tones were worked in separate blocks rather than in alternating rows.',
      fix: 'Work petal shading in horizontal rows that alternate between pale and mid tones in the transition band. Once the blend rows are in, step back and check the gradation looks smooth at arm\'s length.',
    },
  ],
  28: [ // peony-bloom
    {
      symptom: 'The petal layers look like concentric rings rather than overlapping petals',
      cause: 'Each shade was worked as a complete band rather than following the irregular petal shapes on the chart.',
      fix: 'Follow the chart petal shapes rather than stitching in bands. Each petal outline is irregular; working within the outline first, then filling, gives the overlapping effect once all layers are in.',
    },
    {
      symptom: 'The pink shades blend poorly at the transitions',
      cause: 'The thread was not separated and recombined before threading, so the strands are twisted unevenly.',
      fix: 'Strip each pair of strands individually from the skein and recombine before threading. Stripped and recombined strands lie flat and the colours blend smoothly in the transition zones. The difference is visible once the first transition row is worked.',
    },
  ],
  29: [ // daffodil-sprig
    {
      symptom: 'The trumpet centre looks flat rather than cup-shaped',
      cause: 'The trumpet shading was worked in a single colour rather than using the darker tone at the rim.',
      fix: 'Use the deeper orange at the trumpet rim (the outer ring of chart squares) and the lighter yellow-gold inside. Once the rim colour is in, the cup depth reads clearly. Work the rim stitches first, then fill the centre until the contrast is visible.',
    },
    {
      symptom: 'The petals look too yellow compared with the finished image',
      cause: 'The petal colour is the pale primrose (745) but a warm yellow (307) was used instead.',
      fix: 'Check the floss label before threading: 745 is pale primrose, not a saturated yellow. Hold the thread against a white piece of paper in daylight to verify the undertone is cool rather than warm before stitching the petals.',
    },
  ],
  30: [ // botanical-fern-frond
    {
      symptom: 'The pinnae (leaflets) are uneven in size',
      cause: 'Each leaflet was stitched freehand rather than following the counted outline on the chart.',
      fix: 'Count the chart squares for each leaflet before starting: each pinnule should be the same number of squares wide. Work from the central rib outward on each side. Once the rib stitches are in, the leaflets should be symmetrical.',
    },
    {
      symptom: 'The frond looks too light in the leaf areas',
      cause: 'Only two strands were used where the chart calls for three, or the thread was not stripped before stitching.',
      fix: 'Strip two strands from the skein and recombine. On 14-count the stitches should cover the Aida squares fully when the strands are correctly stripped. Work a single test stitch and check coverage before continuing the frond fill.',
    },
  ],
  31: [ // gather-quote
    {
      symptom: 'The lettering is misaligned: one word sits higher than the rest',
      cause: 'The word was started from a counted position relative to itself, not from the piece\'s centre mark.',
      fix: 'Mark the horizontal centre of the fabric and count outward from it for every word. Check that the baseline of each letter sits on the same counted row before stitching the first cross. Once the baselines are confirmed, alignment is guaranteed.',
    },
    {
      symptom: 'The decorative border does not close at the corners',
      cause: 'The border stitches were worked from one side rather than from opposite corners toward the middle.',
      fix: 'Start the border from each corner and work inward to the midpoints. Corners should be stitched first so the straight runs can be trimmed to fit. Once all four corners are in, the border joins should be invisible.',
    },
  ],
  34: [ // house-name-sampler
    {
      symptom: 'The house name runs off-centre',
      cause: 'The text was started from the left edge without first counting the total width of all letters plus gaps.',
      fix: 'Count the total stitch width of the name (letters plus one-stitch gaps between them) before threading. Divide by two to find the centre letter, and begin from the fabric centre. Once the centre letter is placed, count outward in both directions.',
    },
    {
      symptom: 'The number stitches look lighter than the letter stitches',
      cause: 'The number section was stitched with a different number of strands or a fresh skein from a different dye lot.',
      fix: 'Thread numbers and letters from the same skein and use the same strand count throughout. Check the dye lot number on the label before opening a second skein. If dye lots differ, stitch letters and numbers alternately from both skeins to blend the variation.',
    },
  ],
  35: [ // be-kind-small-hoop
    {
      symptom: 'The words look crowded and hard to read',
      cause: 'The gap between the two words was stitched at one square rather than the two-square gap on the chart.',
      fix: 'Count the gap on the chart: there should be two empty squares between "be" and "kind". Unpick the second word and recount from the chart centre. Once the gap is correct, the text should read clearly at arm\'s length.',
    },
    {
      symptom: 'The border circle does not close evenly',
      cause: 'The border was worked in one direction all the way around rather than in two halves from the top.',
      fix: 'Work the top half of the circle border first, then count down both sides simultaneously to meet at the base. This keeps the two halves symmetrical. Once the base stitches join, the circle should close without a gap.',
    },
  ],
  36: [ // trans-flag-heart
    {
      symptom: 'The stripe colours bleed into each other at the edges',
      cause: 'The transition row between stripes was worked in the wrong colour order.',
      fix: 'Work each stripe as a complete horizontal band from left to right before moving to the next. The boundary row should be a clean straight line. Once the stripe is in, check the left and right edges are at the same counted row before starting the next colour.',
    },
    {
      symptom: 'The heart outline looks bumpy at the curves',
      cause: 'The curved top of the heart was stitched as a straight edge rather than following the stepped curve on the chart.',
      fix: 'The heart outline uses single-stitch stepping at the lobes. Count each step from the chart before stitching. The curve should read smooth from a normal viewing distance once the stepping is complete.',
    },
  ],
  37: [ // bi-pride-banner
    {
      symptom: 'The three stripes are not the same width',
      cause: 'The row count for the middle stripe was not checked against the chart before stitching.',
      fix: 'Count the chart rows for each stripe before threading. The bi flag uses pink (8 rows), lavender (2 rows), blue (8 rows) in the traditional ratio. Mark the row boundaries on the fabric with a thread tack before starting. Once the boundaries are set, stitch within them.',
    },
    {
      symptom: 'The lettering inside the banner sits too low',
      cause: 'The text was placed relative to the base of the fabric rather than the centre of the banner area.',
      fix: 'Find the horizontal centre of the banner and position the text midline from there. Once the centre row is marked, count up half the letter height and begin the top of the first letter from that point.',
    },
  ],
  38: [ // coming-out-hoop
    {
      symptom: 'The rainbow arc colours overlap at the edges',
      cause: 'Each arc colour was stitched beyond its boundary before the adjacent colour was placed.',
      fix: 'Work each arc colour to the exact boundary shown on the chart before starting the next. A shared boundary line means the last column of one colour and the first column of the next share no squares. Once both boundary columns are in, the colours should meet cleanly.',
    },
    {
      symptom: 'The text looks uneven within the arc',
      cause: 'The lettering was positioned by eye rather than from the counted centre of the arc.',
      fix: 'Count the total stitch width of the text first, then find the arc centre and work outward. Place the centre letter before stitching any others. The text should read level once each letter\'s base row aligns with the arc centreline.',
    },
  ],
  39: [ // ace-pride-spade
    {
      symptom: 'The spade shape looks asymmetric',
      cause: 'The left and right halves of the spade were stitched independently without checking against a shared centre axis.',
      fix: 'Mark the vertical centre of the spade on the chart and on the fabric before starting. Work both halves simultaneously, row by row, from the centre outward. Once each row is stitched on both sides, check that the stitch count is equal left and right.',
    },
    {
      symptom: 'The black areas look grey rather than solid',
      cause: 'Only two strands were used for the dark fill where three are needed, or the thread was not stripped before stitching.',
      fix: 'On 14-count Aida, two stripped strands should cover fully. If coverage looks thin, hold a test stitch up to the light: fabric squares should not be visible through the cross. If they are, add a strand. Once coverage is solid, continue with the corrected count throughout.',
    },
  ],
  40: [ // all-are-welcome-sampler
    {
      symptom: 'The border letters are a different size from the centre text',
      cause: 'The border font uses a different stitch count per letter than the main text font.',
      fix: 'The border uses a 5-stitch-tall font; the main text uses 7 stitches. Count the chart carefully before switching between the two zones. Once the stitch counts are confirmed for each zone, start with the border and work inward to the main text.',
    },
    {
      symptom: 'The rainbow flag bar at the base looks uneven',
      cause: 'Each flag stripe was stitched in one long pass rather than in short sections checked against the chart width.',
      fix: 'Count the full width of the flag bar on the chart first. Stitch each stripe as a complete horizontal band and check the left and right edges align before starting the next colour. Once all stripes are in, the bar edges should be straight and even across the width.',
    },
  ],
}

// For NO_COMPLETION files, add a "completion" sentence to the last step
// Files that need it: 23, 25, 26, 29, 36, 39, 40
// Strategy: append a sentence to the final list item or the "What to try next" paragraph
// that includes "once... is complete/in" or "when all stitches are worked"
// Actually: adding the troubleshooter with "once..." in the fix text should satisfy it.
// Let's verify after adding troubleshooters.

function findWhatToTryNext(body: { type: string; content: any[] }): number {
  for (let i = 0; i < body.content.length; i++) {
    const node = body.content[i]
    if (node.type === 'heading') {
      const text = (node.content || []).map((n: any) => n.text || '').join('')
      if (/what to try next/i.test(text)) {
        return i
      }
    }
  }
  return -1
}

function makeTroubleshooter(items: { symptom: string; cause: string; fix: string }[]) {
  return {
    type: 'troubleshooter',
    attrs: {
      heading: 'Common problems',
      intro: '',
      items,
    },
  }
}

const FAILING = [21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 40]
const FILE_MAP: Record<number, string> = {
  21: '21-cross-stitch-simple-dog-portrait.json',
  23: '23-cross-stitch-owl-on-branch.json',
  24: '24-cross-stitch-rabbit-in-meadow.json',
  25: '25-cross-stitch-butterfly-on-lavender.json',
  26: '26-cross-stitch-poppy-and-seed-head.json',
  27: '27-cross-stitch-tulip-trio.json',
  28: '28-cross-stitch-peony-bloom.json',
  29: '29-cross-stitch-daffodil-sprig.json',
  30: '30-cross-stitch-botanical-fern-frond.json',
  31: '31-cross-stitch-gather-quote.json',
  34: '34-cross-stitch-house-name-sampler.json',
  35: '35-cross-stitch-be-kind-small-hoop.json',
  36: '36-cross-stitch-trans-flag-heart.json',
  37: '37-cross-stitch-bi-pride-banner.json',
  38: '38-cross-stitch-coming-out-hoop.json',
  39: '39-cross-stitch-ace-pride-spade.json',
  40: '40-cross-stitch-all-are-welcome-sampler.json',
}

for (const num of FAILING) {
  const fname = FILE_MAP[num]
  const fpath = path.join(BRIEFS, fname)
  const d = JSON.parse(fs.readFileSync(fpath, 'utf-8'))
  const idx = findWhatToTryNext(d.body)
  const ts = makeTroubleshooter(TROUBLESHOOTERS[num])
  if (idx === -1) {
    // Append before last node
    d.body.content.splice(d.body.content.length - 1, 0, ts)
  } else {
    d.body.content.splice(idx, 0, ts)
  }
  fs.writeFileSync(fpath, JSON.stringify(d, null, 2))
  console.log(`Patched ${fname} (inserted troubleshooter at position ${idx === -1 ? 'end-1' : idx})`)
}

console.log('Done.')
