import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { bold, doc, gloss, h2, li, link, p, subTutorialCard, t, techLink, ul } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'needles-hoops-and-frames-for-cross-stitch',
  title: 'Needles, hoops and frames for cross-stitch',
  subtitle: 'Matching a needle to your fabric, and choosing how to hold it taut',
  excerpt:
    'How tapestry needle sizes work, when a hoop is enough, and when a Q-Snap or scroll frame does a better job.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-needles-hoops-and-frames-for-cross-stitch.jpg',
    alt: 'A wooden embroidery hoop with fabric stretched inside it and two tapestry needles resting on top',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'tapestry-needle', term: 'Tapestry needle', definition: 'A blunt-tipped needle that slips between fabric threads instead of piercing them. Size 24 is the default for 14ct Aida; finer fabrics need a higher-number, finer needle.' },
    { slug: 'needle-size', term: 'Needle size', definition: 'The number stamped on a pack of tapestry needles. A higher number is a finer, shorter needle. Cross-stitch matches the needle to the fabric count: a size 24 suits 14-count Aida, a size 26 suits 16 and 18-count, and a size 28 suits fine evenweave and linen.' },
    { slug: 'embroidery-hoop', term: 'Embroidery hoop', definition: 'Two wooden or plastic rings that grip the fabric flat for stitching. Pick a hoop about two inches wider than the longest edge of the pattern.' },
    { slug: 'q-snap', term: 'Q-Snap frame', definition: 'A rectangular plastic frame made from PVC pipes and clip sections. Used as an alternative to a hoop for holding cross-stitch fabric taut. Leaves no hoop marks and suits large or stiff pieces.' },
    { slug: 'scroll-frame', term: 'Scroll frame', definition: "A rectangular wooden frame with a roller bar at the top and bottom. The fabric is sewn to webbing on each roller and the rollers turned to take up slack, so the whole piece stays taut without the curve or the marks a hoop leaves." },
    { slug: 'stitch-tension', term: 'Stitch tension', definition: 'The amount of pull applied to the thread when completing each stitch. Correct tension pulls the stitch snug enough to sit flat against the fabric without distorting the Aida holes. Too tight distorts the grid; too loose leaves floppy stitches that catch and look uneven.' },
  ],
  techniqueSlugs: [
    'how-to-thread-a-needle-for-cross-stitch',
    'preparing-your-hoop-for-cross-stitch',
    'how-to-use-a-q-snap-frame-for-cross-stitch',
  ],
  aliases: ['cross-stitch needle size chart', 'hoop vs q-snap', 'do you need a frame for cross-stitch', 'best needle for aida'],
  body: doc(
    p(
      t(
        'Two tools decide how comfortable a project feels in the hand: the needle that carries the thread, and whatever holds the fabric flat while you work. Neither is expensive, and both are worth choosing on purpose rather than grabbing whatever is in the box.',
      ),
    ),
    h2('Choosing a needle'),
    p(
      t('Cross-stitch uses a '),
      gloss('tapestry needle', 'tapestry-needle'),
      t(
        ', which has a blunt tip rather than a sharp point. A blunt tip slips between the woven threads of the fabric instead of piercing them, which is exactly what a counted stitch needs: the needle finds the existing hole rather than making a new one next to it.',
      ),
    ),
    p(
      t('Needles are sold by a '),
      gloss('needle size', 'needle-size'),
      t(
        ' number, and the rule runs backwards from most sewing needles: the higher the number, the finer and shorter the needle. A size 24 is the standard match for 14-count Aida. Move up to 16 or 18-count fabric and a size 26 threads more easily through the smaller holes. Fine evenweave or linen calls for a size 28. Using a needle that is too thick for the fabric stretches the holes out of shape as you work; too fine, and the thread drags and frays every time it passes through. ',
      ),
      techLink('Threading the needle', 'how-to-thread-a-needle-for-cross-stitch'),
      t(' is easiest done in good light, away from the stitching itself.'),
    ),
    h2('Hoop, Q-Snap, or frame'),
    p(
      t('An '),
      gloss('embroidery hoop', 'embroidery-hoop'),
      t(
        ' is two rings, one inside the other, that grip the fabric between them. It is cheap, portable, and the right choice for most small and medium projects. Pick a hoop about two inches wider than the longest edge of the design, so the whole piece fits inside the rings without the hoop overlapping stitches you have already worked. ',
      ),
      techLink('Preparing a hoop', 'preparing-your-hoop-for-cross-stitch'),
      t(
        ' and getting the tension even across it takes a minute, before the first stitch goes in. A hoop does leave a faint crease where the rings press the fabric, which washes and presses out at the end.',
      ),
    ),
    ul(
      li(bold('Hoop. '), t('Cheapest, most portable, best for projects that fit comfortably inside an 8 to 10 inch ring.')),
      li(
        bold('Q-Snap frame. '),
        t('A rectangular plastic frame that clips the fabric along all four edges at once. '),
        gloss('Q-Snap', 'q-snap'),
        t(' frames come in sections that join together for larger pieces, leave no ring mark, and suit stiffer fabric that a round hoop struggles to grip evenly. '),
        techLink('Setting up a Q-Snap frame', 'how-to-use-a-q-snap-frame-for-cross-stitch'),
        t(' takes the same couple of minutes as a hoop.'),
      ),
      li(
        bold('Scroll frame. '),
        t('A wooden frame with a roller bar at the top and bottom. The '),
        gloss('scroll frame', 'scroll-frame'),
        t(
          ' rolls the finished and unworked parts of a large piece out of the way, so a project too big for any hoop or Q-Snap stays manageable, at the cost of being the least portable option.',
        ),
      ),
      li(
        bold('In hand, no frame at all. '),
        t('Some stitchers prefer working without anything holding the fabric taut, relying on their own grip. It suits small, quick pieces and travels well, though it takes more practice to keep an even '),
        gloss('stitch tension', 'stitch-tension'),
        t(' without the fabric held flat for you.'),
      ),
    ),
    h2('Getting the tension right'),
    p(
      t(
        'However you hold the fabric, the goal is the same: taut enough that a stitch lies flat without dragging the weave out of shape, loose enough that the holes are not stretched wide. A hoop or frame does most of that work for you; stitching in hand puts it entirely on your own hand. Whichever method you use, check the back of a finished section now and then. Even, snug stitches on the back mean even tension on the front.',
      ),
    ),
    p(
      t('Needle and frame settled, the next question most stitchers hit is '),
      link('how to start a thread without a knot showing through the fabric', '/cross-stitch/starting-and-finishing-a-thread-without-knots'),
      t('.'),
    ),
    subTutorialCard('starting-and-finishing-a-thread-without-knots'),
  ),
}

export default piece
