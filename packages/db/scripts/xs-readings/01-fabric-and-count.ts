import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { doc, gloss, h2, li, link, p, subTutorialCard, t, techLink, ul } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'understanding-fabric-and-count-in-cross-stitch',
  title: 'Fabric and count in cross-stitch',
  subtitle: 'What a fabric count means, and why it changes the whole project',
  excerpt:
    'What a fabric count means, how it changes the finished size of a chart, and how Aida, evenweave and linen compare.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-understanding-fabric-and-count-in-cross-stitch.jpg',
    alt: 'Folded squares of Aida, evenweave and linen fabric on a wooden table beside an embroidery hoop',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'fabric-count', term: 'Fabric count', definition: 'The number of stitches per inch of fabric. A 14ct fabric gives 14 stitches per inch; 18ct gives 18. A higher count makes the finished piece smaller and the stitches finer.' },
    { slug: 'aida', term: 'Aida', definition: 'A stiff, evenly-woven cross-stitch fabric with clearly visible squares formed by groups of threads. The default for beginners. Counted in squares per inch: 11ct, 14ct, 16ct, and 18ct are the common counts.' },
    { slug: 'evenweave', term: 'Evenweave', definition: 'A fabric with the same number of warp and weft threads per inch, worked over two threads for cross-stitch. A 28ct evenweave gives the same finished size as 14ct Aida but with a softer drape and a finer thread count for detail.' },
    { slug: 'linen', term: 'Linen', definition: 'A natural-fibre evenweave with a slightly irregular grain. Worked over two threads for cross-stitch. The most refined fabric choice: 28ct, 32ct, and 36ct linens are common.' },
    { slug: 'over-two', term: 'Working over two', definition: "The technique of working each cross-stitch over two threads of the linen or evenweave weave rather than over the holes of a structured grid fabric such as Aida." },
  ],
  techniqueSlugs: [
    'choosing-aida-fabric-for-cross-stitch',
    'choosing-evenweave-and-linen-for-cross-stitch',
    'how-to-count-threads-for-evenweave-cross-stitch',
    'how-to-work-on-linen-for-cross-stitch',
    'how-to-cut-fabric-for-cross-stitch',
  ],
  aliases: ['cross-stitch fabric count', 'what does 14 count mean', 'aida vs evenweave vs linen', 'choosing cross-stitch fabric'],
  body: doc(
    p(
      t(
        'Every cross-stitch chart is designed against a grid, and the fabric you stitch it on has a grid too: a set number of holes packed into every inch. That number is the ',
      ),
      gloss('fabric count', 'fabric-count'),
      t(
        ', and it decides two things before you thread a single needle: how big the finished piece will be, and how fine the stitches will look.',
      ),
    ),
    h2('What the count actually changes'),
    p(
      t(
        'A chart is a fixed number of squares wide and tall. It never changes. What changes is how much space those squares take up on your fabric. A 100-stitch-wide design on 14-count fabric comes out just over 18 centimetres wide, because 100 divided by 14 stitches per inch is a little over 7 inches. The same 100-stitch design on 18-count fabric comes out around 14 centimetres wide, because the same number of stitches is packed into a smaller space. Nothing about the picture changes. Only its size on the wall does.',
      ),
    ),
    h2('The three fabric families'),
    p(
      t(
        'Almost every cross-stitch fabric on the market falls into one of three families, and each one is worked a different way.',
      ),
    ),
    ul(
      li(
        t(
          'Aida is a stiff fabric woven in visible blocks, with a hole at each corner of every block. Each block is one cross-stitch. Because the squares are easy to see, it is the standard choice for a first project, and it comes in 11, 14, 16 and 18-count. This piece calls it ',
        ),
        gloss('Aida', 'aida'),
        t(' throughout.'),
      ),
      li(
        t('Evenweave has the same number of threads running each way, but no visible blocks like Aida. Cross-stitch on '),
        gloss('evenweave', 'evenweave'),
        t(
          ' is worked over two threads at a time. A 28-count evenweave gives about the same finished size as 14-count Aida. It drapes better and shows finer detail.',
        ),
      ),
      li(
        t('Linen is a natural-fibre evenweave with a slightly uneven grain, also worked over two threads. Most stitchers try '),
        gloss('linen', 'linen'),
        t(
          ' once they are comfortable on evenweave. It drapes and frames beautifully. The uneven weave just makes each stitch a little harder to place at first.',
        ),
      ),
    ),
    p(
      t('Both evenweave and linen are stitched by '),
      gloss('working over two', 'over-two'),
      t(
        ' threads rather than one, and every count printed on the fabric bolt already accounts for that. A 28-count evenweave is not stitched at 28 stitches per inch; it gives 14 stitches per inch once you work over two threads, matching 14-count Aida stitch for stitch.',
      ),
    ),
    h2('Choosing a count for a project'),
    p(
      t(
        'A higher count gives a smaller, more detailed finished piece, at the cost of smaller stitches that ask more of your eyes and your light. A lower count gives a bigger piece with bolder stitches, faster to work but needing more fabric. For a first project, 14-count Aida is the easiest fabric to see, count and correct, and it is what most beginner charts assume unless the pattern says otherwise. Always check the pattern for its intended count and finished size before buying fabric, and buy a piece a few centimetres larger on every side than the design itself, so there is enough spare fabric to mount or frame later.',
      ),
    ),
    p(
      t('Once the fabric is chosen, '),
      techLink('choosing your needle', 'choosing-your-needle-for-cross-stitch'),
      t(' and '),
      link('working out how much floss to buy', '/cross-stitch/choosing-and-using-cross-stitch-floss'),
      t(' are the next two decisions.'),
    ),
    subTutorialCard('choosing-and-using-cross-stitch-floss'),
  ),
}

export default piece
