import type { TutorialUploadInput } from '../upload-tutorial-types.js'
import { bold, doc, gloss, h2, li, link, p, subTutorialCard, t, techLink, ul } from './builders.js'

const piece: TutorialUploadInput = {
  slug: 'caring-for-and-framing-a-finished-cross-stitch-piece',
  title: 'Washing, pressing and framing a finished cross-stitch piece',
  subtitle: 'Turning a stitched piece of fabric into something ready for the wall',
  excerpt:
    'How to wash and press a finished piece before framing, and the three common ways to mount it: a hoop, lacing onto card, or a professional frame.',
  type: 'READING',
  categorySlug: 'cross-stitch',
  difficulty: 'BEGINNER',
  sourceType: 'SYNTHESISED',
  hero: {
    localPath: '/home/user/homemade-xs-readings/scratchpad/xs-readings-heroes/SELECTED-caring-for-and-framing-a-finished-cross-stitch-piece.jpg',
    alt: 'A finished floral cross-stitch piece beside an iron and folded linen',
    source: 'flux-schnell',
    creatorName: null,
    licenceCode: 'PROPRIETARY',
    requiresAttribution: false,
  },
  glossaryTerms: [
    { slug: 'blocking-cross-stitch', term: 'Blocking cross-stitch', definition: 'The process of pinning or pressing washed cross-stitch to shape while the fabric is still damp. For Aida, pressing face-down on a towel is the standard method. It sets the grid square, removes distortion caused by the hoop, and prepares the piece for framing.' },
    { slug: 'lacing-method', term: 'Lacing method', definition: 'A framing technique in which the edges of the fabric are folded over a stiff card mount and laced together on the back with strong thread, like tightening a corset. The lacing holds the fabric taut without adhesive and can be undone if the mount needs to be changed.' },
    { slug: 'finishing-cross-stitch', term: 'Finishing', definition: 'Everything that happens after the last stitch: washing the piece, pressing it flat, and mounting or framing it for display. A chart is only half the project; finishing is what turns stitched fabric into a piece on the wall.' },
  ],
  techniqueSlugs: [
    'how-to-wash-a-finished-cross-stitch-piece',
    'how-to-lace-cross-stitch-on-card',
    'how-to-mount-cross-stitch-in-a-hoop-for-display',
    'how-to-frame-a-cross-stitch-piece',
  ],
  criticalTechniques: ['how-to-wash-a-finished-cross-stitch-piece'],
  aliases: ['how to finish a cross-stitch piece', 'blocking cross-stitch', 'framing cross-stitch', 'lacing cross-stitch onto card'],
  body: doc(
    p(
      t(
        'The last stitch is not the end of a project. A piece straight off the hoop usually carries a faint ring mark, a little puckering around dense areas, and hoop tension pulling the grid slightly out of square. ',
      ),
      gloss('Finishing', 'finishing-cross-stitch'),
      t(
        ' is the stage that turns a stitched piece of fabric into something ready to hang, and it is worth doing properly. This is the last chance to fix anything before the work is under glass.',
      ),
    ),
    h2('Washing'),
    p(
      t(
        'Hand wash the finished piece in cool water with a small amount of mild soap, gently working the water through the fabric rather than rubbing or wringing it. Rinse until the water runs clear, then roll the piece in a clean towel and press to squeeze out the water without twisting the fabric. Washing lifts any hoop marks, marked pencil lines, and the natural oils a project picks up from being handled over weeks or months. ',
      ),
      techLink('How to wash a finished cross-stitch piece', 'how-to-wash-a-finished-cross-stitch-piece'),
      t(' has the full method, including what to do if a dark colour bleeds.'),
    ),
    h2('Pressing and blocking'),
    p(
      t(
        'While the piece is still slightly damp, lay it face down on a folded towel and press it from the back with a warm iron, never pressing directly on the stitched side, which flattens the texture of the crosses. This step, called ',
      ),
      gloss('blocking cross-stitch', 'blocking-cross-stitch'),
      t(
        ', squares the grid back up and removes any remaining distortion from the hoop. Let the piece dry fully and lie flat before moving on to mounting, or the fabric can relax out of shape again.',
      ),
    ),
    h2('Mounting and framing'),
    p(t('There are three common ways to display a finished piece, and which one suits a project depends mostly on its size and how permanent the display is meant to be.')),
    ul(
      li(
        bold('In its hoop. '),
        t('The simplest option: trim the excess fabric, and the same hoop the piece was stitched in becomes the frame. '),
        techLink('Mounting cross-stitch in a hoop for display', 'how-to-mount-cross-stitch-in-a-hoop-for-display'),
        t(' covers trimming and finishing the back neatly.'),
      ),
      li(
        bold('Laced onto card. '),
        t('The fabric is folded over a stiff card mount cut to size and pulled taut with thread laced back and forth across the reverse, the '),
        gloss('lacing method', 'lacing-method'),
        t(
          '. This is the standard preparation before a piece goes into a proper picture frame, since it holds the fabric flat and square without any glue or tape touching the stitching. ',
        ),
        techLink('Lacing cross-stitch onto mount card', 'how-to-lace-cross-stitch-on-card'),
        t(' shows the stitch pattern for the lacing itself.'),
      ),
      li(
        bold('A proper frame. '),
        t('Once laced onto card, a piece is ready for a picture frame, ideally with the glass held slightly clear of the stitching by a mount or spacer, so the raised texture of the crosses is not crushed flat against the glass. '),
        techLink('How to frame a cross-stitch piece', 'how-to-frame-a-cross-stitch-piece'),
        t(' walks through choosing a frame and fitting the laced piece into it.'),
      ),
    ),
    p(
      t(
        'That is the full arc of a project, from bare fabric to something on the wall. If choosing what to stitch next feels harder than any of the finishing, ',
      ),
      link('choosing your first (or next) pattern', '/cross-stitch/choosing-your-first-cross-stitch-pattern'),
      t(' covers how difficulty and detail are described across the library.'),
    ),
    subTutorialCard('choosing-your-first-cross-stitch-pattern'),
  ),
}

export default piece
