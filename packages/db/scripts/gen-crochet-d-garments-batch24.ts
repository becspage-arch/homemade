/**
 * Generator: D-Garments Batch 24 -- Vintage and retro revival G231-G240
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch24.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gradeAllSizes } from '../../../apps/web/src/lib/crochet/grading/grader'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-garments')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }
function supplies(heading: string, items: { name: string; qty: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const W = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

// G231: 1970s-vest-crochet -- DROP_SHOULDER VEST, dk, 4mm
const g231 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g231m = g231.find(g => g.size === 'M')!

// G232: 1970s-poncho-revival-crochet -- DROP_SHOULDER TUNIC, aran, 5mm
const g232 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g232m = g232.find(g => g.size === 'M')!

// G233: retro-crop-cardigan-crochet -- DROP_SHOULDER CARDIGAN, dk, 4mm
const g233 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'CARDIGAN' })
const g233m = g233.find(g => g.size === 'M')!

// G234: 1960s-mod-dress-crochet -- DROP_SHOULDER DRESS, dk, 4mm
const g234 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g234m = g234.find(g => g.size === 'M')!

// G235: retro-swimsuit-coverup-crochet -- DROP_SHOULDER TUNIC, dk, 4mm
const g235 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g235m = g235.find(g => g.size === 'M')!

// G236: 1980s-power-shoulder-cardigan -- DROP_SHOULDER CARDIGAN, chunky, 6mm
const g236 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 11, rowsPer10cm: 13 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g236m = g236.find(g => g.size === 'M')!

// G237: vintage-lace-collar-top-crochet -- DROP_SHOULDER PULLOVER, dk, 4mm
const g237 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'PULLOVER' })
const g237m = g237.find(g => g.size === 'M')!

// G238: retro-stripe-pullover-crochet -- DROP_SHOULDER PULLOVER, aran, 5mm
const g238 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g238m = g238.find(g => g.size === 'M')!

// G239: 1970s-wrap-cardigan-crochet -- DROP_SHOULDER CARDIGAN, aran, 5mm
const g239 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g239m = g239.find(g => g.size === 'M')!

// G240: vintage-sailor-top-crochet -- DROP_SHOULDER PULLOVER, dk, 4mm
const g240 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'PULLOVER' })
const g240m = g240.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: '1970s-vest-crochet',
  title: '1970s open-stitch crochet vest',
  excerpt: 'A 1970s-inspired sleeveless vest in DK yarn worked in an open treble mesh body with dc borders at the armholes and hem. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g231m.finishedMeasurements.bust} cm bust. Length 55 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['1970s crochet vest', 'retro mesh vest crochet', 'open stitch vest crochet'],
  glossaryTerms: [
    { slug: 'treble-mesh-g231', term: 'Treble mesh', definition: 'A repeating sequence of one treble stitch, two chains, and another treble, creating an open lace-like fabric. Popular in 1970s garment patterns for its vintage texture.' },
    { slug: 'dc-border-g231', term: 'dc border', definition: 'A row or round of double crochet worked around an edge to stabilise and neaten it. Used at the armhole and hem to prevent stretching.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'Open-stitch vests were iconic 1970s crochet garments, widely revived in contemporary handmade fashion.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in '), gt('treble-mesh-g231', 'treble mesh'), t(' from the lower hem up to the shoulders. Shape the armhole by casting off stitches on each side at the underarm. Seam the shoulder and side seams. Finish armhole and lower edges with one round of '), gt('dc-border-g231', 'dc border'), t('.')),
      p(t(`Size M: ${g231m.bodyStitches} sts across the back. Length 55 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '350 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g231m.bodyStitches + 2}. Work in `), gt('treble-mesh-g231', 'treble mesh'), t(' for 45 cm. Shape armholes: cast off 6 sts each side. Continue 10 cm to shoulder. Fasten off.')),
      h2('Front panel'),
      p(t('Work as back to armhole. Shape neck: at 50 cm total height, leave centre 12 sts on hold and work each shoulder separately for 5 cm. Fasten off.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Work one round of '), gt('dc-border-g231', 'dc border'), t(' around each armhole and along the lower hem.')),
      h2('What to try next'),
      p(t('The 1970s poncho uses the same open-stitch approach in a one-piece rectangular shape.')),
    ],
  },
},
{
  slug: '1970s-poncho-revival-crochet',
  title: '1970s revival crochet poncho',
  excerpt: 'A 1970s-inspired poncho in aran yarn. Two rectangular panels seamed at the shoulders with a neck opening. Fringe trim along the lower edges. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g232m.finishedMeasurements.bust} cm across. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['1970s poncho crochet', 'retro poncho crochet', 'aran poncho crochet'],
  glossaryTerms: [
    { slug: 'poncho-panel-g232', term: 'Poncho panel', definition: 'One of the two identical rectangular pieces that make up a poncho. Each panel is worked flat. The panels are joined at the shoulders with a seam, leaving a neck opening at the centre.' },
    { slug: 'fringe-trim-g232', term: 'Fringe trim', definition: 'Cut lengths of yarn folded in half and knotted through the lower hem edge at regular intervals. A defining detail of 1970s crochet fashion.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'The rectangular poncho is one of the most recognisable 1970s crochet silhouettes and remains popular in revival collections.',
  body: {
    type: 'doc', content: [
      p(t('Make two identical '), gt('poncho-panel-g232', 'poncho panels'), t('. Each panel is a dc rectangle. Seam across the top of each panel, leaving the centre third open for the neck. Add '), gt('fringe-trim-g232', 'fringe trim'), t(' along the lower edges.')),
      p(t(`Size M: each panel ${g232m.bodyStitches} sts wide x 65 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '600 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Panels (make 2)'),
      p(t(`Chain ${g232m.bodyStitches + 2}. Work dc for 65 cm. Fasten off.`)),
      h2('Assembly'),
      p(t('Place panels with right sides together. Seam 20 cm from each side edge along the top, leaving the centre open as the neck. Turn right side out.')),
      h2('Fringe'),
      p(t('Cut yarn into 30 cm lengths. Attach '), gt('fringe-trim-g232', 'fringe'), t(' along each lower edge: fold two strands in half, loop through a stitch, pull ends through the loop and tighten.')),
      h2('What to try next'),
      p(t('The 1970s vest uses the same era aesthetic in a fitted two-panel construction.')),
    ],
  },
},
{
  slug: 'retro-crop-cardigan-crochet',
  title: 'Retro cropped ribbed cardigan',
  excerpt: 'A 1990s-style cropped cardigan in DK yarn with an all-over ribbed texture worked in fpdc and bpdc. Hip length with button bands. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 sts x 20 rows = 10 x 10 cm in rib on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g233m.finishedMeasurements.bust} cm bust. Length 42 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['retro crop cardigan crochet', '90s cardigan crochet', 'cropped ribbed cardigan crochet'],
  glossaryTerms: [
    { slug: 'rib-texture-g233', term: 'Rib texture', definition: 'An alternating column pattern of front post and back post double crochet. The posts grip the post of the stitch below, pulling the fabric into raised vertical ridges that mimic knitted ribbing.' },
    { slug: 'button-band-g233', term: 'Button band', definition: 'A strip of dc worked lengthways down the front opening edges. One band has evenly spaced buttonholes and the other is plain. Worked after the body panels are seamed.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'Cropped cardigans with full-body ribbing were a defining 1990s knitwear silhouette, translated here into crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels in '), gt('rib-texture-g233', 'rib texture'), t(' using alternating fpdc and bpdc columns. Keep the body short at 42 cm for the cropped silhouette. Seam shoulders and sides. Add '), gt('button-band-g233', 'button bands'), t(' down each front edge and set-in sleeves.')),
      p(t(`Size M: ${g233m.bodyStitches} sts across the back. Sleeve length 58 cm from underarm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 18 mm', qty: '6' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g233m.bodyStitches + 2}. Work in `), gt('rib-texture-g233', 'rib texture'), t(' for 42 cm. Fasten off.')),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g233m.bodyStitches / 2) + 2}. Work rib for 42 cm. Fasten off.`)),
      h2('Sleeves (make 2)'),
      p(t('Chain 36. Work rib, increasing 1 st each side every 5 cm, until sleeve measures 58 cm. Fasten off.')),
      h2('Button bands'),
      p(t('Pick up sts along each front edge. Work 6 rows of dc. On the right front, add '), gt('button-band-g233', 'buttonholes'), t(' by working ch-2 and skipping 2 sts at even intervals.')),
      h2('What to try next'),
      p(t('The 1970s wrap cardigan uses the same oversized drop-shoulder shape in aran weight.')),
    ],
  },
},
{
  slug: '1960s-mod-dress-crochet',
  title: '1960s mod A-line shift dress',
  excerpt: 'A boxy 1960s mod-style A-line shift dress in DK yarn. Square shoulders, straight silhouette and a simple dc body. Knee length. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g234m.finishedMeasurements.bust} cm bust. Length 88 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['1960s mod dress crochet', 'shift dress crochet', 'A-line mod dress crochet'],
  glossaryTerms: [
    { slug: 'shift-silhouette-g234', term: 'Shift silhouette', definition: 'A dress shape with little or no waist shaping, falling straight from the bust to the hem. The 1960s mod version has a boxy square shoulder and a hem sitting at the knee.' },
    { slug: 'a-line-shaping-g234', term: 'A-line shaping', definition: 'A gentle flare from bust to hem worked by adding one or two extra stitches every six or eight rows on each side of the front and back panels.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'The mod shift dress is one of the most recognisable 1960s silhouettes, translated here into a straightforward dc crochet project.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back in dc. Use a '), gt('shift-silhouette-g234', 'shift silhouette'), t(' with minimal waist shaping. Add '), gt('a-line-shaping-g234', 'A-line shaping'), t(' by increasing 1 st each side every 8 rows from bust to hem. The hem sits at the knee. Seam the shoulders and side seams.')),
      p(t(`Size M: ${g234m.bodyStitches} sts at the bust. Hem approx. ${g234m.bodyStitches + 8} sts. Length 88 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '700 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g234m.bodyStitches + 2}. Work dc for 88 cm, adding `), gt('a-line-shaping-g234', 'A-line shaping'), t(' every 8 rows. Fasten off.')),
      h2('Front panel'),
      p(t('Work as back. Shape neck opening: at 82 cm, leave centre 14 sts unworked. Work each shoulder for 6 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work one round of dc around neck and armhole openings.')),
      h2('What to try next'),
      p(t('The vintage lace collar top adds a crochet collar detail to a similar short-bodied top.')),
    ],
  },
},
{
  slug: 'retro-swimsuit-coverup-crochet',
  title: '1950s style beach cover-up',
  excerpt: 'A 1950s-inspired cotton beach cover-up in DK cotton yarn. Knee-length tunic shape with a wide round neck and short sleeves. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g235m.finishedMeasurements.bust} cm bust. Length 75 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['beach cover up crochet', '1950s crochet top', 'cotton tunic crochet'],
  glossaryTerms: [
    { slug: 'cotton-drape-g235', term: 'Cotton drape', definition: 'The way a cotton yarn fabric hangs. Cotton crochet has a firmer drape than wool and dries quickly, making it ideal for beach wear. Blocking after washing restores the open structure.' },
    { slug: 'short-sleeve-pickup-g235', term: 'Short sleeve pick-up', definition: 'Working sleeve stitches by picking up along the armhole edge rather than seaming a separate sleeve piece. Produces a neat join and avoids a shoulder seam bulk at the beach.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: '1950s beach fashion featured lightweight cotton cover-ups, revived here as a simple drop-shoulder crochet tunic.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back in dc using a cotton yarn for '), gt('cotton-drape-g235', 'cotton drape'), t('. Keep the silhouette relaxed with positive ease at the bust. Seam shoulders and sides. Pick up armhole stitches for '), gt('short-sleeve-pickup-g235', 'short sleeves'), t(' by the pick-up method and work 15 cm.')),
      p(t(`Size M: ${g235m.bodyStitches} sts across the back. Length 75 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '650 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g235m.bodyStitches + 2}. Work dc for 75 cm. Fasten off.`)),
      h2('Front panel'),
      p(t('Work as back. Shape a wide round neck: at 68 cm, leave centre 20 sts unworked and work each shoulder for 7 cm.')),
      h2('Sleeves'),
      p(t('Pick up sts along armhole edge using the '), gt('short-sleeve-pickup-g235', 'pick-up method'), t('. Work dc for 15 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The 1960s mod shift dress uses the same simple dc fabric in a longer A-line shape.')),
    ],
  },
},
{
  slug: '1980s-power-shoulder-cardigan',
  title: '1980s power shoulder cardigan',
  excerpt: 'An oversized 1980s-style cardigan in chunky yarn with exaggerated drop shoulders and wide button bands. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '11 dc x 13 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g236m.finishedMeasurements.bust} cm bust. Length 68 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['1980s cardigan crochet', 'power shoulder cardigan crochet', 'oversized chunky cardigan crochet'],
  glossaryTerms: [
    { slug: 'power-shoulder-g236', term: 'Power shoulder', definition: 'An exaggerated wide drop shoulder where the sleeve seam falls several centimetres below the natural shoulder point. Creates the broad-shouldered silhouette associated with 1980s power dressing.' },
    { slug: 'wide-band-g236', term: 'Wide button band', definition: 'A button band several stitches wide, usually 5 to 6 dc, worked along each front edge. The extra width echoes the bold proportions of the 1980s aesthetic.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'Oversized drop-shoulder cardigans with broad shoulder seams are a defining 1980s silhouette, popular in retro crochet revival projects.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels in dc, sizing the shoulder width generously to achieve the '), gt('power-shoulder-g236', 'power shoulder'), t(' effect. Sleeves are wide at the top and taper slightly to the cuff. Seam using the drop-shoulder method. Add '), gt('wide-band-g236', 'wide button bands'), t(' down each front edge.')),
      p(t(`Size M: ${g236m.bodyStitches} sts across the back. Sleeve seam sits 6 cm beyond the natural shoulder point.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Chunky yarn', qty: '750 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 25 mm', qty: '5' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g236m.bodyStitches + 2}. Work dc for 68 cm. Fasten off.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g236m.bodyStitches / 2) + 2}. Work dc for 68 cm. Fasten off.`)),
      h2('Sleeves (make 2)'),
      p(t('Chain 48. Work dc for 52 cm, decreasing 1 st each side every 10 cm. Fasten off.')),
      h2('Button bands'),
      p(t('Pick up sts along each front edge. Work 6 rows of dc for '), gt('wide-band-g236', 'wide button bands'), t('. Add buttonholes on the right front on row 3.')),
      h2('What to try next'),
      p(t('The retro cropped cardigan uses the same button band technique in a shorter silhouette.')),
    ],
  },
},
{
  slug: 'vintage-lace-collar-top-crochet',
  title: 'Vintage lace collar top',
  excerpt: 'A simple DK pullover with a detachable vintage-style lace crochet collar attached at the neckline. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g237m.finishedMeasurements.bust} cm bust. Length 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['lace collar top crochet', 'vintage collar pullover crochet', 'crochet collar top'],
  glossaryTerms: [
    { slug: 'lace-collar-g237', term: 'Lace collar', definition: 'A flat crochet collar worked in treble mesh or shell stitches. Shaped with increases along the outer edge so it lies flat around the neckline. Attached or pinned at the neck of any top.' },
    { slug: 'collar-pickup-g237', term: 'Collar pick-up row', definition: 'A foundation row worked by picking up stitches around the neck edge of the finished top. The lace collar is then worked outward from this row, increasing to widen the collar as it grows.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'Detachable and attached lace collars were a key vintage accessory applied to plain garments throughout the early twentieth century.',
  body: {
    type: 'doc', content: [
      p(t('Work the pullover body in dc. Seam shoulders and sides. Work a '), gt('collar-pickup-g237', 'collar pick-up row'), t(' around the neckline, then build the '), gt('lace-collar-g237', 'lace collar'), t(' outward in treble mesh, increasing on each round so the collar lies flat against the shoulders.')),
      p(t(`Size M: ${g237m.bodyStitches} sts across the back. Collar outer edge 70 cm after blocking.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn (main)', qty: '500 yards' },
        { name: 'DK yarn (collar contrast, optional)', qty: '80 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain ${g237m.bodyStitches + 2}. Work dc front and back panels for 58 cm. Seam shoulders and sides.`)),
      h2('Collar'),
      p(t('Work a '), gt('collar-pickup-g237', 'pick-up row'), t(' of dc around the neck opening. Work 5 rounds of treble mesh for the '), gt('lace-collar-g237', 'lace collar'), t(', adding 2 trebles at each side point per round. Fasten off. Block flat.')),
      h2('What to try next'),
      p(t('The vintage sailor top uses a different flat collar cut wide across the back.')),
    ],
  },
},
{
  slug: 'retro-stripe-pullover-crochet',
  title: 'Retro block stripe pullover',
  excerpt: 'A retro-inspired pullover in aran yarn with wide 10 cm colour blocks in two contrasting shades. Drop shoulder shape. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g238m.finishedMeasurements.bust} cm bust. Length 62 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['stripe pullover crochet', 'block colour sweater crochet', 'retro stripe sweater crochet'],
  glossaryTerms: [
    { slug: 'colour-block-g238', term: 'Colour block', definition: 'A band of solid colour occupying a set number of rows across the full width of the panel. Each colour block is 10 cm deep, giving six to seven blocks from hem to shoulder at aran gauge.' },
    { slug: 'yarn-join-g238', term: 'Yarn join at stripe', definition: 'Joining a new colour at the beginning of a row by pulling the new yarn through the last two loops of the final dc in the old colour. The old tail is woven in along the back of the work.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'Bold horizontal stripe pullovers are a classic retro knitwear motif translated here into an accessible dc crochet project.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in dc, changing colour every 10 cm to create '), gt('colour-block-g238', 'colour blocks'), t('. Use a clean '), gt('yarn-join-g238', 'yarn join at each stripe'), t(' change. Seam shoulders and sides. Work sleeves flat and seam into armholes.')),
      p(t(`Size M: ${g238m.bodyStitches} sts across the back. 6 colour blocks from hem to shoulder.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn colour A', qty: '400 yards' },
        { name: 'Aran yarn colour B', qty: '400 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g238m.bodyStitches + 2}. Work dc, alternating colours every 10 cm using `), gt('yarn-join-g238', 'yarn joins'), t(', for 62 cm. Fasten off.')),
      h2('Front panel'),
      p(t('Work as back, matching '), gt('colour-block-g238', 'colour block'), t(' placement. Shape neck at 55 cm: leave centre 12 sts and work each shoulder for 7 cm.')),
      h2('Sleeves (make 2)'),
      p(t('Chain 34. Work dc in stripe sequence, increasing 1 st each side every 6 cm, for 52 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The 1980s power shoulder cardigan uses chunky yarn for an even bolder retro statement.')),
    ],
  },
},
{
  slug: '1970s-wrap-cardigan-crochet',
  title: '1970s wrap cardigan',
  excerpt: 'A 1970s-style wrap cardigan in aran yarn with an oversized flat collar and long wrap ties. Drop shoulder construction. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g239m.finishedMeasurements.bust} cm bust. Length 70 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['1970s wrap cardigan crochet', 'wrap front cardigan crochet', 'oversized collar cardigan crochet'],
  glossaryTerms: [
    { slug: 'wrap-front-g239', term: 'Wrap front', definition: 'An open cardigan construction where the two front panels overlap at the centre front and are held closed by ties. No buttons are used. The ties attach at the side seams and wrap around the waist.' },
    { slug: 'oversized-collar-g239', term: 'Oversized collar', definition: 'A wide flat collar extending 15 cm or more from the neckline down onto the chest. Worked in rows of dc or treble from a pick-up row at the neck. The wide collar is a signature 1970s detail.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'Wrap cardigans with deep shawl or flat collars were widely popular in 1970s hand-knit and crochet fashion.',
  body: {
    type: 'doc', content: [
      p(t('Work back panel and two front panels in dc. The '), gt('wrap-front-g239', 'wrap front'), t(' construction means each front is wider than a standard cardigan half, overlapping at the centre. Seam shoulders and sides. Work the '), gt('oversized-collar-g239', 'oversized collar'), t(' by picking up stitches from each front edge and the back neck, then working dc rows outward to 15 cm depth. Attach wrap ties at each side seam.')),
      p(t(`Size M: back ${g239m.bodyStitches} sts. Each front panel ${Math.round(g239m.bodyStitches * 0.6)} sts. Length 70 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '900 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g239m.bodyStitches + 2}. Work dc for 70 cm. Fasten off.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g239m.bodyStitches * 0.6) + 2}. Work dc for 70 cm. Fasten off.`)),
      h2('Collar'),
      p(t('Pick up sts along both front edges and the back neck. Work dc rows outward for 15 cm to build the '), gt('oversized-collar-g239', 'oversized collar'), t('. Fasten off.')),
      h2('Ties'),
      p(t('Work a 60 cm dc strip from each side seam at waist height. These form the '), gt('wrap-front-g239', 'wrap ties'), t('.')),
      h2('What to try next'),
      p(t('The retro stripe pullover uses the same aran weight in a colourwork interpretation of the 1970s aesthetic.')),
    ],
  },
},
{
  slug: 'vintage-sailor-top-crochet',
  title: 'Vintage sailor collar top',
  excerpt: 'A DK pullover with a wide flat sailor collar worked in dc. The collar lies flat against the upper back and chest. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g240m.finishedMeasurements.bust} cm bust. Length 56 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['sailor collar top crochet', 'nautical collar pullover crochet', 'vintage sailor crochet'],
  glossaryTerms: [
    { slug: 'sailor-collar-g240', term: 'Sailor collar', definition: 'A wide flat collar that covers the upper back and folds across the chest as a wide V at the front. Worked separately and seamed to the neckline, or built from a pick-up row. The classic navy and white nautical version has a contrasting border.' },
    { slug: 'contrast-border-g240', term: 'Contrast border', definition: 'A single round of dc in a second colour worked around the outer edge of the collar. On a sailor collar this creates the characteristic narrow band that outlines the collar shape.' },
  ],
  sourceType: 'SYNTHESISED' as const,
  sourceNotes: 'The sailor collar is a classic vintage garment detail that translates well into crochet dc fabric.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in dc. Seam shoulders and sides. Work the '), gt('sailor-collar-g240', 'sailor collar'), t(' as a separate flat piece starting from a wide back neck foundation chain, shaping outward with increases at the front corners. Attach at the neckline. Add a '), gt('contrast-border-g240', 'contrast border'), t(' around the outer collar edge.')),
      p(t(`Size M: ${g240m.bodyStitches} sts across the back. Collar width across the back 40 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn (main)', qty: '500 yards' },
        { name: 'DK yarn (contrast)', qty: '30 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain ${g240m.bodyStitches + 2}. Work dc front and back panels for 56 cm. Seam shoulders and sides.`)),
      h2('Sailor collar'),
      p(t('Chain 72 for the back collar width. Work dc, increasing 1 st at each front corner every row, for 12 rows to build the '), gt('sailor-collar-g240', 'collar'), t(' shape. Work one round of '), gt('contrast-border-g240', 'contrast border'), t(' around the outer edge. Seam collar to neckline.')),
      h2('What to try next'),
      p(t('The vintage lace collar top uses a treble mesh collar for a more open, delicate look.')),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: '',
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    difficulty: pat.difficulty,
    sourceType: pat.sourceType,
    sourceNotes: pat.sourceNotes,
    techniqueSlugs: pat.techniqueSlugs,
    criticalTechniques: pat.criticalTechniques,
    aliases: pat.aliases,
    glossaryTerms: pat.glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: pat.yarnWeight,
      primaryHookSlug: pat.hook,
      gaugeText: pat.gauge,
      finishedSizeText: pat.finishedSize,
      terminologyConvention: 'uk',
      craftStitchSlugs: pat.stitchSlugs,
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nDone: ${PATTERNS.length} patterns`)
