import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { bold, doc, gloss, h2, li, link, ol, p, subTutorialCard, t, techLink } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'starting-and-finishing-a-thread-without-knots',
  title: 'Starting and finishing a thread without knots',
  subtitle: 'The loop method, the waste-knot method, and why cross-stitch avoids knots altogether',
  excerpt:
    'Two ways to start a thread and one way to end it, none of which involve a knot, plus parking and railroading for working several colours at once.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-starting-and-finishing-a-thread-without-knots.jpg',
    alt: 'Close-up of the back of a piece of cross-stitch fabric with thread ends and a threaded needle',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'starting-thread', term: 'Starting a thread', definition: 'Two common methods: the loop method (fold a single strand in half, thread the needle through the loop, catch the loop on the first stitch) and the waste-knot method (knot the end, push the needle in from the front a few squares away, work over the trailing tail at the back).' },
    { slug: 'ending-thread', term: 'Ending a thread', definition: 'Run the needle under four or five stitches on the back of the work, snug but not tight, then snip close. No knots on the back: knots catch on framing and show through thin fabric.' },
    { slug: 'parking', term: 'Parking', definition: 'A technique for stitching one row across the width of a pattern in many colours at once: you leave each colour threaded in the fabric a few squares ahead, ready for its next stitch, instead of starting and ending each thread.' },
    { slug: 'railroading', term: 'Railroading', definition: 'Pulling each stitch through with the two strands kept side by side rather than twisted, so the cross sits flat with parallel rails on the surface. Slower than working with twisted strands but the finish reads cleaner on photographs.' },
  ],
  techniqueSlugs: [
    'how-to-start-your-thread-cross-stitch',
    'how-to-end-your-thread-cross-stitch',
    'how-to-park-threads-in-cross-stitch',
  ],
  criticalTechniques: ['how-to-start-your-thread-cross-stitch', 'how-to-end-your-thread-cross-stitch'],
  aliases: ['cross-stitch loop method', 'waste knot method', 'why no knots in cross-stitch', 'starting a new thread'],
  body: doc(
    p(
      t(
        'A knot on the back of a cross-stitch piece causes two problems: it leaves a hard lump that shows through thin fabric, and it can work loose and pull through as the piece is handled over the years. Cross-stitch solves both by never using one. Every thread is anchored by being woven under existing stitches instead.',
      ),
    ),
    h2('Starting a thread'),
    p(
      t('There are two standard ways of '),
      gloss('starting a thread', 'starting-thread'),
      t('. Which one to use depends on how many strands the stitch calls for.'),
    ),
    ol(
      li(
        bold('The loop method, for an even number of strands. '),
        t('Fold one long strand in half instead of cutting two shorter ones. Thread the needle with both cut ends, leaving the folded loop hanging free. Bring the needle up through the fabric from the back, then, on the very first stitch, pass the needle back down through the loop instead of pulling it all the way through. The loop catches itself and holds the thread with no knot at all.'),
      ),
      li(
        bold('The waste-knot method, for an odd number of strands. '),
        t('Knot the end of the thread and push the needle in from the front of the fabric, a few squares away from where stitching will start, so the knot sits on the front. Bring the needle up at the starting point and begin stitching, working back over the trailing tail on the reverse as you go. Once several stitches have caught the tail securely, snip the knot off the front.'),
      ),
    ),
    p(
      t('Both methods are covered stitch by stitch in '),
      techLink('How to start your thread in cross-stitch', 'how-to-start-your-thread-cross-stitch'),
      t('.'),
    ),
    h2('Ending a thread'),
    p(
      t('When a length of thread runs out, or a colour block is finished, turn the fabric over and run the needle under four or five stitches already worked on the back, keeping the pull snug but not tight enough to distort them. Snip the thread close to the fabric. That is the whole of '),
      gloss('ending a thread', 'ending-thread'),
      t(': no knot, and nothing left hanging that could catch on framing or another colour. '),
      techLink('How to end your thread in cross-stitch', 'how-to-end-your-thread-cross-stitch'),
      t(' walks through it on a sample piece.'),
    ),
    h2('Working several colours in one row'),
    p(
      t('A row that changes colour every few stitches would normally mean starting and ending a fresh thread constantly. '),
      gloss('Parking', 'parking'),
      t(
        ' avoids that: instead of finishing each colour off, you leave it threaded in the fabric a little way ahead of where it will be needed again, and pick it back up when the row reaches that point. It keeps a whole row moving in one pass rather than in short, separately-finished bursts, and it is the standard approach for confetti-style areas with lots of single stitches in different colours. ',
      ),
      techLink('How to park threads in cross-stitch', 'how-to-park-threads-in-cross-stitch'),
      t(' shows how to keep parked threads from tangling with each other.'),
    ),
    p(
      t(
        'A related habit worth knowing about is ',
      ),
      gloss('railroading', 'railroading'),
      t(
        ': pulling each stitch through with its strands lying flat side by side, instead of twisted. The finished cross sits flatter and reads more evenly this way, which suits a piece meant to be photographed or displayed close up. It takes a little longer than letting the strands twist naturally. Most stitchers save it for the parts of a piece that matter most, rather than using it throughout.',
      ),
    ),
    p(
      t('With thread habits sorted, the next piece covers '),
      link('the chart key and the symbols that tell you where to put each stitch', '/cross-stitch/the-cross-stitch-chart-key-explained'),
      t('.'),
    ),
    subTutorialCard('the-cross-stitch-chart-key-explained'),
  ),
}

export default piece
