import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { bold, doc, gloss, h2, li, link, p, subTutorialCard, t, techLink, ul } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'choosing-and-using-cross-stitch-floss',
  title: 'Floss and strands in cross-stitch',
  subtitle: 'DMC, Anchor and Madeira, how many strands to use, and keeping a stash sorted',
  excerpt:
    'The three floss brands, how many strands to use for a given fabric count, how far a skein goes, and how to keep leftover thread sorted.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-choosing-and-using-cross-stitch-floss.jpg',
    alt: 'Skeins of stranded cotton floss in many colours on a wooden table with small floss bobbins',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'floss', term: 'Floss', definition: 'The six-strand embroidery thread used for cross-stitch. Each skein is made of six strands twisted together loosely; the stitcher strips out the number of strands needed for the fabric count (two strands for 14-count Aida) and threads them together.' },
    { slug: 'stranded-cotton', term: 'Stranded cotton', definition: 'The standard cross-stitch floss. Six strands twisted together into one length; you separate out two strands for full cross on 14ct Aida and one strand for back-stitch.' },
    { slug: 'dmc', term: 'DMC', definition: 'The most widely-stocked floss brand worldwide, with around 500 colour codes. Anchor and Madeira publish DMC-conversion charts so a DMC pattern can be stitched in any of the three brands.' },
    { slug: 'anchor', term: 'Anchor', definition: 'A UK and European floss brand with around 460 codes. Published DMC equivalences make it the common alternative when DMC is out of stock.' },
    { slug: 'madeira', term: 'Madeira', definition: 'A German floss brand with around 470 codes in the Mouliné range. Published DMC equivalences make it the third major option for cross-stitch.' },
    { slug: 'skein', term: 'Skein', definition: 'The bundled length of stranded cotton sold under one DMC, Anchor, or Madeira code. Standard skein is around 8 metres of six-strand thread.' },
    { slug: 'strand', term: 'Strand', definition: 'One of the six fine threads twisted together in a length of stranded cotton. A pattern states how many strands to put back together in the needle: usually two for 14-count Aida and one for back-stitch.' },
    { slug: 'stripping-floss', term: 'Stripping floss', definition: 'The process of separating individual strands from a six-strand skein of embroidery floss. Each strand is pulled out one at a time, then the required number of strands are rethreaded together through the needle eye. Stripping removes the twist and produces a flatter, more even stitch.' },
    { slug: 'floss-bobbin', term: 'Floss bobbin', definition: 'A flat plastic or card spool used to organise stranded cotton by brand code. Wind the skein onto the bobbin, write the code on the tab, and the colour stays sorted between sittings.' },
  ],
  techniqueSlugs: [
    'how-to-strip-floss-for-cross-stitch',
    'how-to-organise-cross-stitch-floss',
  ],
  aliases: ['dmc vs anchor vs madeira', 'how many strands of floss to use', 'cross-stitch thread brands', 'floss stash'],
  body: doc(
    p(
      t(
        'Cross-stitch thread is called ',
      ),
      gloss('floss', 'floss'),
      t(
        ', though the correct name for it is ',
      ),
      gloss('stranded cotton', 'stranded-cotton'),
      t(
        ': a length made of six fine threads twisted loosely together. You never stitch with all six at once. Instead you separate out the number the pattern asks for, and thread those together through the needle.',
      ),
    ),
    h2('The three brands'),
    p(
      t('Almost every published chart gives its colours as codes from one of three brands.'),
    ),
    ul(
      li(bold('DMC. '), t('The most widely stocked brand worldwide, with around 500 numbered colours. '), gloss('DMC', 'dmc'), t(' is the default most charts are written against.')),
      li(bold('Anchor. '), t('A UK and European brand with around 460 numbered colours. '), gloss('Anchor', 'anchor'), t(' publishes a conversion table against DMC codes, so an Anchor stitcher can follow a DMC chart and vice versa.')),
      li(bold('Madeira. '), t('A German brand with around 470 colours in its Mouliné range. '), gloss('Madeira', 'madeira'), t(' also publishes DMC conversions.')),
    ),
    p(
      t(
        'The three brands are not identical colour for colour, even where a conversion table lists a match: two brands\' idea of the same shade of blue can sit slightly apart. For a single project, buy every skein in one brand rather than mixing, so the colours read as a matched set.',
      ),
    ),
    h2('How many strands to use'),
    p(
      t('The number of '),
      gloss('strands', 'strand'),
      t(
        ' changes how much coverage a stitch gives, and it needs to match the fabric count. Two strands is standard for a full cross-stitch on 14-count Aida. Move to 16 or 18-count fabric, and most stitchers drop to a single strand instead. That keeps the stitch from swamping the smaller square. Move down to 11-count, and three strands gives fuller coverage. Back-stitch almost always uses fewer strands than the crosses around it, usually just one, so the outline reads as a fine line. A chart\'s key states the strand count it was designed for. When in doubt, stitch a test cross on spare fabric and check it fills the square without gaps or bulk.',
      ),
    ),
    h2('Getting strands off the skein'),
    p(
      t(
        'A '),
      gloss('skein', 'skein'),
      t(' of floss comes as a loosely twisted six-strand length, around eight metres long. Cut a working length of about 45 to 50 centimetres. Anything longer tends to fray and knot before you reach the end of it. Then separate out the strands you need one at a time, letting each one drop and untwist, rather than pulling several strands together at once, which keeps the twist locked in and the finished stitch uneven. This separating is called '),
      gloss('stripping floss', 'stripping-floss'),
      t('. Once stripped, put the strands you need back together and thread the needle. '),
      techLink('How to strip floss for cross-stitch', 'how-to-strip-floss-for-cross-stitch'),
      t(' shows the full hand motion.'),
    ),
    h2('Keeping a stash sorted'),
    p(
      t(
        'Most projects use only part of a skein, and the leftover length is worth keeping: it is the start of a stash that saves buying a whole new skein for a small future project in the same colour. Wind the spare length onto a small card or plastic ',
      ),
      gloss('floss bobbin', 'floss-bobbin'),
      t(' and write the brand and code on it straight away. '),
      techLink('Keeping floss organised', 'how-to-organise-cross-stitch-floss'),
      t(
        ' this way is far faster to search through than a tangle of loose skeins, and it means a chart calling for a colour you already own is one less skein to buy.',
      ),
    ),
    p(
      t('With fabric and floss chosen, the next decision is '),
      link('which needle, hoop or frame to work with', '/cross-stitch/needles-hoops-and-frames-for-cross-stitch'),
      t('.'),
    ),
    subTutorialCard('needles-hoops-and-frames-for-cross-stitch'),
  ),
}

export default piece
