import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { doc, gloss, h2, link, p, subTutorialCard, t, techLink } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'the-cross-stitch-chart-key-explained',
  title: 'The cross-stitch chart key, explained',
  subtitle: 'What the key, the symbols and the centre marks are for, before you sit down with a full chart',
  excerpt:
    'A short introduction to the chart key, chart symbols, grid lines and centre marks, before the full walkthrough on reading a whole chart.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-the-cross-stitch-chart-key-explained.jpg',
    alt: 'A printed cross-stitch chart on paper with a pen resting across it',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'cross-stitch-chart-key', term: 'Chart key', definition: 'The list printed beside a cross-stitch chart that pairs every symbol or colour in the grid with a thread code and colour name. Nothing appears in the grid that is missing from the key.' },
    { slug: 'symbol', term: 'Symbol', definition: 'The small printed mark inside a chart square, such as a cross, a dot, a triangle or a letter, standing in for one thread colour. The key beside the chart says which colour each symbol means.' },
    { slug: 'grid-line', term: 'Grid line', definition: 'A line printed across a chart. Heavier grid lines run every ten squares to make counting large numbers of stitches faster; the lighter lines in between mark each individual square.' },
    { slug: 'centre-mark', term: 'Centre mark', definition: 'A small arrow or short line printed on the margin of a chart, at the middle of each edge. Where the mark on the top or bottom edge lines up with the mark on a side edge is the exact centre of the design, and counting starts there.' },
  ],
  techniqueSlugs: [
    'how-to-read-cross-stitch-chart-symbols',
    'how-to-find-the-centre-of-your-fabric',
  ],
  aliases: ['cross-stitch chart key', 'what do chart symbols mean', 'centre marks on a chart'],
  body: doc(
    p(
      t(
        'A cross-stitch chart is a grid standing in for a piece of fabric, one square for one stitch. Three things on that grid make it readable: the key, the symbols, and the centre marks. This is a quick introduction to all three; the full walkthrough on working an entire chart from the first stitch to the last lives in ',
      ),
      techLink('How to read a cross-stitch chart', 'how-to-read-a-cross-stitch-chart'),
      t('.'),
    ),
    h2('The key'),
    p(
      t('The '),
      gloss('chart key', 'cross-stitch-chart-key'),
      t(
        ' runs down the side or along the bottom of a printed chart. Every symbol or colour that appears anywhere in the grid is listed there, paired with a thread brand and code number. Nothing appears in the grid that the key does not explain, which makes it the first thing to check on any new chart, before counting a single square.',
      ),
    ),
    h2('Symbols and grid lines'),
    p(
      t('Each square in the grid carries a '),
      gloss('symbol', 'symbol'),
      t(
        ': a cross, a dot, a triangle, a letter, or a block of solid colour. Two squares with the same symbol always take the same thread. Running through the grid are ',
      ),
      gloss('grid lines', 'grid-line'),
      t(
        ', with a heavier line every ten squares. Those heavier lines are there so you can count a large chart in blocks of ten rather than one square at a time, which is far faster and far less likely to go wrong.',
      ),
    ),
    h2('Centre marks'),
    p(
      t('Small arrows or a short line on the outer margin of a chart show the middle row and the middle column. These are the '),
      gloss('centre marks', 'centre-mark'),
      t(
        ', and where they meet is the exact centre of the design. Every count on a chart starts from that point rather than from a corner, because starting at the centre gives the finished piece equal margins on all four sides. ',
      ),
      techLink('Finding the centre of your fabric', 'how-to-find-the-centre-of-your-fabric'),
      t(' shows the matching fold on the fabric side.'),
    ),
    p(
      t(
        'That is enough to make sense of any chart at a glance. For the full method, in order, including back-stitch lines and part-filled squares, read ',
      ),
      link('how to read a cross-stitch chart', '/cross-stitch/how-to-read-a-cross-stitch-chart'),
      t('. To see what '),
      link('back-stitch, French knots and fractional stitches', '/cross-stitch/back-stitch-french-knots-and-fractional-stitches-on-our-charts'),
      t(' look like once they appear on a chart, that piece comes next.'),
    ),
    subTutorialCard('how-to-read-a-cross-stitch-chart'),
  ),
}

export default piece
