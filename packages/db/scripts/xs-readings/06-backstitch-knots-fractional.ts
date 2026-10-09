import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { doc, gloss, h2, link, p, subTutorialCard, t, techLink } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'back-stitch-french-knots-and-fractional-stitches-on-our-charts',
  title: 'Back-stitch, French knots and fractional stitches on our charts',
  subtitle: 'What these three extra layers look like on the chart and in the Studio',
  excerpt:
    'How to spot back-stitch outlines, French knot dots, and split-square fractional stitches on a chart, and how each one shows up in the Studio.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-back-stitch-french-knots-and-fractional-stitches-on-our-charts.jpg',
    alt: 'Macro close-up of a stitched outline and two French knots on cross-stitch fabric',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'back-stitch', term: 'Back-stitch', definition: 'A solid outline stitch worked in a single strand along the back-stitch layer of the chart. You stitch backwards along the line one stitch at a time, each stitch finishing where the previous one started.' },
    { slug: 'french-knot', term: 'French knot', definition: 'A small raised dot on the fabric surface. Bring the needle up, wrap the thread around the needle two or three times, then take the needle back down through the same hole while holding the wraps taut.' },
    { slug: 'fractional-stitch', term: 'Fractional stitch', definition: 'A stitch that fills part of a fabric square instead of all of it. A quarter stitch runs from one corner into the centre of the square; a three-quarter stitch is a half stitch plus a quarter. Charts use them on curves and points.' },
    { slug: 'confetti', term: 'Confetti stitching', definition: 'Single stitches of a colour scattered through a design rather than grouped into a block, the way a handful of confetti lands. Slower to work than a solid block, because the needle changes colour for one stitch at a time instead of filling an area before moving on.' },
  ],
  techniqueSlugs: [
    'how-to-work-a-back-stitch-in-cross-stitch',
    'how-to-work-a-french-knot-in-cross-stitch',
    'how-to-work-fractional-cross-stitches-together',
  ],
  criticalTechniques: ['how-to-work-a-back-stitch-in-cross-stitch'],
  aliases: ['what is back-stitch on a cross-stitch chart', 'french knots on a chart', 'fractional stitches on charts', 'quarter and three-quarter stitch symbols'],
  body: doc(
    p(
      t(
        'Most of a cross-stitch chart is full crosses, one per square. Three other things can appear on top of that grid: a back-stitch outline, a French knot, and a fractional stitch that fills only part of a square. All three are common on our charts, and each one shows up differently in both the printed key and the Studio.',
      ),
    ),
    h2('Back-stitch: a line, not a square'),
    p(
      t('A '),
      gloss('back-stitch', 'back-stitch'),
      t(
        ' line runs along the edge of the squares rather than filling one. On the chart it is drawn as a thin solid line, coloured to match its own entry in the key, separate from the fill colours. On the fabric it is worked in a single strand once the crosses underneath are finished, so it lies on top of them rather than under them. Look for it wherever a design needs a crisp edge that a blocky cross cannot give: whiskers, lettering, and the outline around a shape. ',
      ),
      techLink('How to work a back-stitch in cross-stitch', 'how-to-work-a-back-stitch-in-cross-stitch'),
      t(' covers the stitch itself.'),
    ),
    h2('French knots: a dot on the chart'),
    p(
      t('A '),
      gloss('French knot', 'french-knot'),
      t(
        ' shows on the chart as a small filled dot, sitting at a single point rather than filling a whole square. It stands off the fabric surface as a raised knot instead of lying flat. That is why the chart marks it differently from the crosses around it. Eyes, berries, and the centre of a flower are the classic uses. Not every chart needs that raised, dotted look, so not every chart will carry one. ',
      ),
      techLink('How to work a French knot in cross-stitch', 'how-to-work-a-french-knot-in-cross-stitch'),
      t(' shows the wrap.'),
    ),
    h2('Fractional stitches: a split square'),
    p(
      t('A '),
      gloss('fractional stitch', 'fractional-stitch'),
      t(
        ' fills only part of a square. The chart shows this with a diagonal line splitting the square, sometimes with only one half shaded. A square split evenly in half is a half stitch. One with a small triangle shaded is a quarter stitch. A square that looks almost full, with a small triangle missing, is a three-quarter stitch. These sit on curves and points, where a full square would look too blocky and stepped. ',
      ),
      techLink('Working fractional cross-stitches together', 'how-to-work-fractional-cross-stitches-together'),
      t(
        ' explains how a quarter and a three-quarter often share one square, one stitcher in each colour.',
      ),
    ),
    h2('Seeing all three in the Studio'),
    p(
      t(
        'Open any of our charts in the Studio, and the same three layers are there on screen. Back-stitch shows as a line drawn over the grid. French knots show as a small marked dot. Fractional stitches show as a split cell. All three appear in every one of the Studio\'s views: colour blocks, stitched crosses, or symbols only. ',
      ),
      t('A design with lots of scattered single stitches in different colours is sometimes called '),
      gloss('confetti', 'confetti'),
      t(
        '. That kind of design tends to carry more French knots and fractional detail than a chart made of large solid blocks. Both are tools for fine detail, not broad colour.',
      ),
    ),
    p(
      t('The '),
      link('cross-stitch stitch guide', '/stitches/cross-stitch'),
      t(
        ' lists all three of these alongside every other stitch a chart can ask for, with the symbol and a plain reminder of how each one is worked.',
      ),
    ),
    p(
      t('Once a piece is fully stitched, the last stage is '),
      link('washing, pressing and framing it', '/cross-stitch/caring-for-and-framing-a-finished-cross-stitch-piece'),
      t('.'),
    ),
    subTutorialCard('caring-for-and-framing-a-finished-cross-stitch-piece'),
  ),
}

export default piece
