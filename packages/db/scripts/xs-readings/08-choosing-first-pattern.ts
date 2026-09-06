import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { bold, doc, h2, li, link, p, subTutorialCard, t, techLink, ul } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'choosing-your-first-cross-stitch-pattern',
  title: 'Choosing your first cross-stitch pattern',
  subtitle: 'What difficulty and stitching band mean, and where the beginner-friendly patterns are',
  excerpt:
    'How difficulty and stitching band describe a chart, what size and colour count change about the experience, and where to find the easiest patterns in the library.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-choosing-your-first-cross-stitch-pattern.jpg',
    alt: 'A small finished flower cross-stitch in a hoop beside a few skeins of floss',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  techniqueSlugs: ['how-to-plan-a-cross-stitch-project'],
  aliases: ['easiest cross-stitch patterns', 'what does stitching band mean', 'beginner cross-stitch patterns', 'how to pick a first pattern'],
  body: doc(
    p(
      t(
        'Every pattern in the library carries two ratings that answer two different questions. Difficulty asks how much skill a chart needs. Stitching band asks how it feels to sit down and actually work it. A pattern can be easy in one sense and demanding in the other, so it helps to read both before choosing a first project.',
      ),
    ),
    h2('Difficulty: the skill a chart asks for'),
    p(
      t(
        'Difficulty covers whether a pattern uses only full crosses, or adds back-stitch, French knots and fractional stitches on top. A beginner pattern sticks to full crosses and perhaps a little back-stitch outlining. Intermediate and advanced patterns layer in more of those extra techniques, and expect the stitcher to already be comfortable with the basics covered in ',
      ),
      link('fabric and count', '/cross-stitch/understanding-fabric-and-count-in-cross-stitch'),
      t(' and '),
      link('back-stitch, French knots and fractional stitches', '/cross-stitch/back-stitch-french-knots-and-fractional-stitches-on-our-charts'),
      t('.'),
    ),
    h2('Stitching band: how it feels under the needle'),
    p(
      t(
        'Stitching band measures something difficulty does not. It looks at how often the colour changes, and how long the runs of a single colour are. A pattern can use nothing but full crosses and still be a long, demanding project, if it changes colour every few stitches. The library labels this scale from Easy going down to Marathon. Easy going means big blocks of colour and very few single stitches. Steady, Involved and Demanding sit in the middle. Marathon means constant colour changes and lots of single stitches: a long, absorbing project rather than a quick one. A first pattern is usually easiest at Easy going or Steady, whatever its difficulty rating says.',
      ),
    ),
    h2('Size and colour count'),
    p(
      t(
        'Two more numbers on every pattern page matter for a first project. The stitch count sets how long the piece will take: a small design finishes in a handful of sittings, where a large one is a project measured in weeks or months. Colour count sets how much floss to buy and how often the needle changes thread; a design in six colours is a simpler shopping list and a calmer stitch than one in sixty.',
      ),
    ),
    h2('Where to start browsing'),
    p(t('Put the three together, and the easiest starting point in the library is a pattern that is:')),
    ul(
      li(bold('Beginner difficulty. '), t('Full crosses, with little or no back-stitch and no fractional detail.')),
      li(bold('Easy going or Steady stitching band. '), t('Large blocks of colour, not scattered single stitches.')),
      li(bold('Small in stitch count. '), t('Finishes in a realistic number of sittings for a first attempt.')),
    ),
    p(
      t('The small-makes shelf of the library is filled with exactly this kind of pattern. The library filters let you combine a beginner difficulty setting with a small size directly. Fabric, floss and needles are covered in '),
      link('fabric and count', '/cross-stitch/understanding-fabric-and-count-in-cross-stitch'),
      t(', '),
      link('floss and strands', '/cross-stitch/choosing-and-using-cross-stitch-floss'),
      t(' and '),
      link('needles, hoops and frames', '/cross-stitch/needles-hoops-and-frames-for-cross-stitch'),
      t('. Once those are sorted, '),
      techLink('planning a cross-stitch project', 'how-to-plan-a-cross-stitch-project'),
      t(
        ' from start to finish is the last thing worth reading before the first stitch goes in.',
      ),
    ),
    p(
      t('Browse the '),
      link('small makes shelf', '/cross-stitch?sub=small-makes&difficulty=BEGINNER'),
      t(', or every '),
      link('beginner pattern in the library', '/cross-stitch?difficulty=BEGINNER'),
      t('.'),
    ),
    subTutorialCard('understanding-fabric-and-count-in-cross-stitch'),
  ),
}

export default piece
