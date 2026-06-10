/**
 * Generator: D-Garments Batch 23 -- Sport and outdoor garments G221-G230
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch23.ts
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

// G221: sports vest (DROP_SHOULDER VEST, dk, 4mm)
const g221 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g221m = g221.find(g => g.size === 'M')!

// G222: running top (DROP_SHOULDER TANK, dk, 4mm)
const g222 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'TANK' })
const g222m = g222.find(g => g.size === 'M')!

// G223: hiking vest (DROP_SHOULDER VEST, aran, 5mm)
const g223 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_6', garmentType: 'VEST' })
const g223m = g223.find(g => g.size === 'M')!

// G224: track jacket (DROP_SHOULDER CARDIGAN, dk, 4mm)
const g224 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g224m = g224.find(g => g.size === 'M')!

// G225: windbreaker-style (DROP_SHOULDER CARDIGAN, sport, 3.5mm)
const g225 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g225m = g225.find(g => g.size === 'M')!

// G226: thermal base layer (DROP_SHOULDER PULLOVER, fingering, 3.5mm)
const g226 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 22, rowsPer10cm: 26 }, easePreset: 'ZERO', garmentType: 'PULLOVER' })
const g226m = g226.find(g => g.size === 'M')!

// G227: gym shorts (DROP_SHOULDER TANK for grading, dk, 4mm)
const g227 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'TANK' })
const g227m = g227.find(g => g.size === 'M')!

// G228: yoga crop top (DROP_SHOULDER TANK, dk, 4mm)
const g228 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'TANK' })
const g228m = g228.find(g => g.size === 'M')!

// G229: swimwear cover-up top (DROP_SHOULDER PULLOVER, fingering, 3.5mm)
const g229 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 22, rowsPer10cm: 26 }, easePreset: 'POSITIVE_6', garmentType: 'PULLOVER' })
const g229m = g229.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'crochet-sports-vest',
  title: 'Crochet sports vest',
  excerpt: 'An athletic-style vest in cotton DK worked flat front and back and seamed at the shoulders and sides. Dropped armholes and a ribbed trim at the hem. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g221m.finishedMeasurements.bust} cm bust. Length approx. 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet sports vest', 'athletic vest crochet', 'crochet gym vest'],
  glossaryTerms: [
    { slug: 'drop-armhole-g221', term: 'Drop armhole', definition: 'An armhole that extends lower than a set-in armhole, giving a relaxed fit across the shoulders. The front and back panels are simply seamed at the shoulder with no armhole shaping.' },
    { slug: 'rib-trim-g221', term: 'Rib trim', definition: 'A narrow strip of fpdc and bpdc alternating worked along the hem and armhole edges. The rib pulls in slightly to neaten the edge without a full ribbed welt.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Athletic vests are a popular warm-weather crochet garment.',
  grades: g221,
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels as flat dc rectangles. The '), gt('drop-armhole-g221', 'drop armhole'), t(' requires no shaping. Seam at shoulders and sides. Finish all edges with a narrow '), gt('rib-trim-g221', 'rib trim'), t(' of fpdc and bpdc.')),
      p(t(`Size M: ${g221m.bodyStitches} sts wide x 60 cm long for each panel.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '280 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front and back panels'),
      p(t(`Chain ${g221m.bodyStitches + 2}. Work dc for 60 cm. Repeat for second panel.`)),
      h2('Assembly'),
      p(t('Seam at both shoulders and down both sides. Pick up stitches around each '), gt('drop-armhole-g221', 'armhole'), t(' and the hem and work one round of '), gt('rib-trim-g221', 'rib trim'), t('.')),
      h2('What to try next'),
      p(t('The crochet hiking vest uses the same drop-armhole construction in a heavier aran weight.')),
    ],
  },
},
{
  slug: 'crochet-running-top',
  title: 'Crochet running top',
  excerpt: 'A lightweight running-style tank top in cotton DK with a closer fit through the body. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g222m.finishedMeasurements.bust} cm bust. Length approx. 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet running top', 'crochet tank top sport', 'lightweight crochet vest top'],
  glossaryTerms: [
    { slug: 'shoulder-strap-g222', term: 'Shoulder strap', definition: 'A narrow dc strip worked from the upper front edge to the upper back edge over each shoulder. The strap width is typically 4 to 6 cm for a running top.' },
    { slug: 'dc2tog-g222', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the underarm to shape the curve where the front and back panels meet.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Lightweight tank tops are a staple warm-weather crochet garment.',
  grades: g222,
  body: {
    type: 'doc', content: [
      p(t('Work front and back as flat dc panels. Shape the underarm with '), gt('dc2tog-g222', 'dc2tog'), t(' on the final few rows before seaming. Join with a '), gt('shoulder-strap-g222', 'shoulder strap'), t(' on each side instead of a full seam. Side seams run from hem to underarm.')),
      p(t(`Size M: ${g222m.bodyStitches} sts wide x 58 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '250 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front and back panels'),
      p(t(`Chain ${g222m.bodyStitches + 2}. Work dc for 54 cm. Shape underarm with `), gt('dc2tog-g222', 'dc2tog'), t(' at each side for 4 cm.')),
      h2('Straps and seams'),
      p(t('Seam sides. Work two '), gt('shoulder-strap-g222', 'shoulder straps'), t(' of dc from front to back, each 5 cm wide.')),
      h2('What to try next'),
      p(t('The crochet yoga crop top uses the same strap finish at a shorter crop length.')),
    ],
  },
},
{
  slug: 'crochet-hiking-vest',
  title: 'Crochet hiking vest',
  excerpt: 'A heavy-duty outdoor hiking vest in aran yarn with deep pockets and a full front opening. Worked flat and assembled. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g223m.finishedMeasurements.bust} cm bust. Length approx. 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet hiking vest', 'outdoor vest crochet', 'heavy duty crochet gilet'],
  glossaryTerms: [
    { slug: 'patch-pocket-g223', term: 'Patch pocket', definition: 'A flat dc rectangle sewn onto the right side of the fabric. Patch pockets are worked separately and stitched on at three sides, leaving the top open.' },
    { slug: 'front-band-g223', term: 'Front band', definition: 'A strip of dc worked along the open front edges of the vest from hem to shoulder. The band provides structure and a neat finished edge where a zip or buttons can be attached.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Outdoor gilets and vests are popular layering garments suited to aran crochet.',
  grades: g223,
  body: {
    type: 'doc', content: [
      p(t('Work two front panels and one back panel in dc. Seam at shoulders and sides. Add a dc '), gt('front-band-g223', 'front band'), t(' along both open front edges. Sew on two '), gt('patch-pocket-g223', 'patch pockets'), t(' at hip height on each front panel.')),
      p(t(`Size M: back panel ${g223m.bodyStitches} sts wide x 65 cm. Each front panel half that width plus 3 cm for the front band.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '500 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g223m.bodyStitches + 2}. Work dc for 65 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g223m.bodyStitches / 2) + 5}. Work dc for 65 cm.`)),
      h2('Pockets (make 2)'),
      p(t('Chain 22. Work dc for 18 cm. Sew as '), gt('patch-pocket-g223', 'patch pocket'), t(' onto each front.')),
      h2('Front bands'),
      p(t('Pick up stitches along both front edges and work 3 rows of dc as the '), gt('front-band-g223', 'front band'), t('.')),
      h2('What to try next'),
      p(t('The crochet track jacket adds sleeves to the same open-front construction.')),
    ],
  },
},
{
  slug: 'crochet-track-jacket',
  title: 'Crochet track jacket',
  excerpt: 'A track jacket-style open cardigan with contrast ribbed trim at the collar, cuffs and hem. Drop shoulder construction in DK yarn. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g224m.finishedMeasurements.bust} cm bust. Length approx. 60 cm. Sleeve length approx. 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['crochet track jacket', 'crochet sports cardigan', 'striped trim crochet jacket'],
  glossaryTerms: [
    { slug: 'contrast-trim-g224', term: 'Contrast trim', definition: 'Ribbed bands worked in a second colour along the hem, cuffs and collar. The trim uses fpdc and bpdc alternating and is typically 4 to 5 cm wide.' },
    { slug: 'set-in-sleeve-g224', term: 'Drop sleeve', definition: 'A sleeve joined at a drop shoulder seam rather than a shaped armhole. The sleeve top is a straight edge that aligns with the straight body edge, making assembly straightforward.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Track jackets are a classic sportswear style adapted well to crochet.',
  grades: g224,
  body: {
    type: 'doc', content: [
      p(t('Work the body and sleeves in the main colour, then add '), gt('contrast-trim-g224', 'contrast trim'), t(' in a second colour at hem, cuffs and collar. Sleeves are '), gt('set-in-sleeve-g224', 'drop sleeves'), t(', joined straight-edge to straight-edge at the shoulder line.')),
      p(t(`Size M: body ${g224m.bodyStitches} sts wide x 55 cm long. Each sleeve approx. ${Math.round(g224m.bodyStitches * 0.5)} sts wide at underarm, 58 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn (main colour)', qty: '500 yards' },
        { name: 'DK yarn (contrast)', qty: '80 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain ${g224m.bodyStitches + 2}. Work dc for 55 cm in main colour. Work 5 cm of fpdc/bpdc `), gt('contrast-trim-g224', 'contrast trim'), t(' at hem.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${Math.round(g224m.bodyStitches * 0.35) + 2}. Increase to full width over 20 rows. Work dc for 53 cm. Add 5 cm `), gt('contrast-trim-g224', 'contrast trim'), t(' at cuff.')),
      h2('Assembly'),
      p(t('Seam '), gt('set-in-sleeve-g224', 'drop sleeves'), t(' to body. Add collar trim and front bands.')),
      h2('What to try next'),
      p(t('The crochet windbreaker-style top uses open-weave mesh in the body for a lighter fabric.')),
    ],
  },
},
{
  slug: 'crochet-windbreaker-style',
  title: 'Crochet windbreaker-style top',
  excerpt: 'A lightweight open-weave cardigan in sport weight yarn with a mesh body for airflow. Drop shoulder construction. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'sport',
  hook: 'crochet-hook-3-5mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport weight on a 3.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g225m.finishedMeasurements.bust} cm bust. Length approx. 60 cm. Sleeve length approx. 55 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet windbreaker', 'open weave crochet cardigan', 'crochet mesh jacket'],
  glossaryTerms: [
    { slug: 'mesh-body-g225', term: 'Mesh body', definition: 'A pattern of treble stitches and chain spaces that creates an open net-like fabric. Air moves freely through the mesh, making it suited to outerwear designed for active use.' },
    { slug: 'solid-border-g225', term: 'Solid border', definition: 'A band of dc worked around the hem, front edges and cuffs in contrast to the mesh body. The border adds structure and weight to the garment edges without bulk.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open-weave lightweight cardigans are a popular warm-season crochet project.',
  grades: g225,
  body: {
    type: 'doc', content: [
      p(t('Work the body and sleeves in '), gt('mesh-body-g225', 'mesh body'), t(' (tr and ch-2 repeat). Finish all outer edges with a dc '), gt('solid-border-g225', 'solid border'), t(' for structure. The open front and hem are left unbuttered for a windbreaker silhouette.')),
      p(t(`Size M: ${g225m.bodyStitches} sts equivalent in mesh across the back x 55 cm long. Sleeves 55 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport weight yarn', qty: '500 yards' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and fronts'),
      p(t('Work in '), gt('mesh-body-g225', 'mesh body'), t(': ch-2, tr repeat. Work to 55 cm.')),
      h2('Sleeves (make 2)'),
      p(t('Work sleeves in '), gt('mesh-body-g225', 'mesh body'), t(' for 55 cm. Increase from cuff to underarm.')),
      h2('Borders'),
      p(t('Work '), gt('solid-border-g225', 'solid border'), t(' of 2 dc rows around all outer edges.')),
      h2('What to try next'),
      p(t('The crochet swimwear cover-up top uses the same mesh construction as a pullover.')),
    ],
  },
},
{
  slug: 'crochet-thermal-base-layer',
  title: 'Crochet thermal base layer',
  excerpt: 'A close-fitting ribbed undershirt in fingering yarn worked in fpdc and bpdc rib throughout. Drop shoulder construction. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '22 sts x 26 rows = 10 x 10 cm in rib on a 3.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g226m.finishedMeasurements.bust} cm bust with zero ease. Length approx. 60 cm. Sleeve length approx. 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['crochet thermal top', 'crochet base layer', 'ribbed undershirt crochet'],
  glossaryTerms: [
    { slug: 'thermal-rib-g226', term: 'Thermal rib', definition: 'An all-over 1x1 rib pattern (fpdc and bpdc alternating) worked in the round on the body and flat on the sleeves. The rib traps air next to the skin, providing insulation.' },
    { slug: 'zero-ease-g226', term: 'Zero ease', definition: 'A finished garment that measures the same as the body measurement with no additional width added. In a stretchy rib, zero ease gives a snug fit that moves with the body.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Thermal base layers in crochet rib are a functional cold-weather garment.',
  grades: g226,
  body: {
    type: 'doc', content: [
      p(t('Work entirely in '), gt('thermal-rib-g226', 'thermal rib'), t(' (fpdc/bpdc alternating). The body is worked in the round to avoid seams. The '), gt('zero-ease-g226', 'zero ease'), t(' fit means finished measurements match body measurements exactly; the rib stretch conforms without cling.')),
      p(t(`Size M: ${g226m.bodyStitches} sts in round for body, 60 cm long. Sleeves: ${Math.round(g226m.bodyStitches * 0.45)} sts at underarm, 58 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Fingering yarn', qty: '750 yards' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain ${g226m.bodyStitches + 2}. Join into round. Work `), gt('thermal-rib-g226', 'thermal rib'), t(' for 60 cm.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${Math.round(g226m.bodyStitches * 0.35) + 2}. Work rib flat, increasing to underarm width over 20 cm. Work for 58 cm total.`)),
      h2('What to try next'),
      p(t('The crochet sports vest uses the same yarn weight at a looser gauge for a relaxed layering piece.')),
    ],
  },
},
{
  slug: 'crochet-gym-shorts',
  title: 'Crochet gym shorts',
  excerpt: 'Fitted gym-style shorts in cotton DK with an elasticated waist and 15 cm inseam. Worked as two flat panels and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g227m.finishedMeasurements.bust} cm hip. Inseam 15 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet gym shorts', 'crochet sport shorts', 'cotton crochet shorts'],
  glossaryTerms: [
    { slug: 'inseam-g227', term: 'Inseam', definition: 'The measurement from the crotch seam to the hem of the shorts along the inner leg. A 15 cm inseam gives a short, fitted silhouette typical of gym-wear.' },
    { slug: 'elastic-waist-g227', term: 'Elastic waist', definition: 'A waistband formed by folding the top edge over elastic and sewing a casing. The elastic is cut to waist measurement plus 3 cm and joined in a loop before threading.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Gym shorts in cotton crochet are a practical warm-weather project.',
  grades: g227,
  body: {
    type: 'doc', content: [
      p(t('Work two leg panels as flat dc rectangles. The total length is 25 cm rise plus 15 cm '), gt('inseam-g227', 'inseam'), t(', giving a 40 cm panel height. Seam each inner leg, join at the crotch, and add an '), gt('elastic-waist-g227', 'elastic waist'), t('.')),
      p(t(`Size M: each panel ${Math.round(g227m.bodyStitches / 2)} sts wide x 40 cm tall. Hip: ${g227m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '220 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Leg panels (make 2)'),
      p(t(`Chain ${Math.round(g227m.bodyStitches / 2) + 2}. Work dc for 40 cm. Seam `), gt('inseam-g227', 'inner leg'), t('.')),
      h2('Assembly and waist'),
      p(t('Join legs at crotch. Add dc waistband with '), gt('elastic-waist-g227', 'elastic casing'), t('.')),
      h2('What to try next'),
      p(t('The crochet yoga crop top pairs with these shorts for a matching active set.')),
    ],
  },
},
{
  slug: 'crochet-yoga-set-top',
  title: 'Crochet yoga crop top',
  excerpt: 'A cotton DK crop top with a racerback-style back opening and close fit. Worked flat and assembled. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g228m.finishedMeasurements.bust} cm bust. Length approx. 35 cm (crop).`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet yoga top', 'crochet crop top racerback', 'crochet sports bra top'],
  glossaryTerms: [
    { slug: 'racerback-g228', term: 'Racerback', definition: 'A back panel cut in a V or Y shape between the shoulder blades. The narrow back strap allows full shoulder movement and is a hallmark of active tops.' },
    { slug: 'dc2tog-g228', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used on the back panel to decrease from full width down to the narrow racerback strap.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Yoga crop tops are a popular active-wear crochet project.',
  grades: g228,
  body: {
    type: 'doc', content: [
      p(t('Work the front panel as a flat dc crop rectangle. Shape the back into a '), gt('racerback-g228', 'racerback'), t(' by working '), gt('dc2tog-g228', 'dc2tog'), t(' at each side of the back panel on every other row from underarm level upward until only the centre strap remains. Seam front to back at sides and join the strap at the shoulder.')),
      p(t(`Size M: front panel ${g228m.bodyStitches} sts x 35 cm. Back panel tapers from ${g228m.bodyStitches} sts to 8 sts at the strap.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '200 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front panel'),
      p(t(`Chain ${g228m.bodyStitches + 2}. Work dc for 35 cm.`)),
      h2('Back panel'),
      p(t(`Chain ${g228m.bodyStitches + 2}. Work dc for 15 cm. Begin `), gt('dc2tog-g228', 'dc2tog'), t(' shaping at each side every other row for 20 cm to form '), gt('racerback-g228', 'racerback'), t(' strap.')),
      h2('What to try next'),
      p(t('The crochet gym shorts complete the matching yoga set.')),
    ],
  },
},
{
  slug: 'crochet-swimwear-cover-top',
  title: 'Crochet swimwear cover-up top',
  excerpt: 'A mesh pullover cover-up in fingering cotton for wearing over a swimsuit. Open-weave fabric dries quickly. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '22 sts x 26 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g229m.finishedMeasurements.bust} cm bust with 6 cm positive ease. Length approx. 55 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet swim cover top', 'crochet beach cover up top', 'mesh crochet cover up'],
  glossaryTerms: [
    { slug: 'quick-dry-mesh-g229', term: 'Quick-dry mesh', definition: 'An open stitch pattern of trebles and chain spaces. The large openings mean the fabric holds very little water and dries rapidly when worn poolside or at the beach.' },
    { slug: 'drop-hem-g229', term: 'Drop hem', definition: 'A hem that is longer at the back than at the front, or hangs at different lengths around the body. Used here to give more coverage at the back while keeping the front shorter.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet beach cover-ups are a popular summer project.',
  grades: g229,
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in '), gt('quick-dry-mesh-g229', 'quick-dry mesh'), t(' (tr and ch-2 repeat). The back panel is 5 cm longer than the front to create a '), gt('drop-hem-g229', 'drop hem'), t('. Seam at shoulders and sides. No armhole shaping needed with the loose silhouette.')),
      p(t(`Size M: each panel ${g229m.bodyStitches} sts equivalent x 55 cm (front) and 60 cm (back).`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Fingering cotton yarn', qty: '350 yards' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front panel'),
      p(t(`Chain ${g229m.bodyStitches + 2}. Work `), gt('quick-dry-mesh-g229', 'mesh'), t(' for 55 cm.')),
      h2('Back panel'),
      p(t(`Chain ${g229m.bodyStitches + 2}. Work mesh for 60 cm to create the `), gt('drop-hem-g229', 'drop hem'), t('.')),
      h2('Assembly'),
      p(t('Seam shoulders for 12 cm each side. Seam sides from hem to underarm, leaving armholes open.')),
      h2('What to try next'),
      p(t('The crochet outdoor beanie in super-chunky yarn makes a bold accessory for active days.')),
    ],
  },
},
{
  slug: 'crochet-outdoor-beanie',
  title: 'Crochet outdoor beanie',
  excerpt: 'A heavy-duty outdoor beanie in super-chunky yarn worked top-down in the round. One size fits most adults. Sturdy enough for cold outdoor activities.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-chunky',
  hook: 'crochet-hook-10-0mm',
  gauge: '8 dc x 9 rows = 10 x 10 cm in super-chunky on a 10 mm hook.',
  finishedSize: 'One size. Circumference approx. 56 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet outdoor beanie', 'super chunky beanie crochet', 'cold weather beanie crochet'],
  glossaryTerms: [
    { slug: 'top-down-crown-g230', term: 'Top-down crown', definition: 'Starting at the top of the hat with a magic ring and a small number of stitches, then increasing on every round until the hat is wide enough to sit on the head. The crown shaping is built in from the start.' },
    { slug: 'dc2tog-g230', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used in the top-down method to add only as many increases per round as are needed to keep the crown flat before the sides begin.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Super-chunky beanies are a fast, practical cold-weather project.',
  grades: [],
  body: {
    type: 'doc', content: [
      p(t('Start with a magic ring. Work 6 dc into the ring. Increase every round using the '), gt('top-down-crown-g230', 'top-down crown'), t(' method until the circle measures 16 cm across. Work straight in round for 18 cm to form the sides. The final rows can use '), gt('dc2tog-g230', 'dc2tog'), t(' to add a slight gathered brim if preferred. Fasten off and close the start.')),
      p(t('Circumference: approx. 56 cm. Depth from crown to brim: approx. 24 cm.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Super-chunky yarn', qty: '80 yards' },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Crown'),
      p(t('Magic ring, 6 dc. Round 2: 2 dc in each st (12 sts). Round 3: (dc, 2 dc in next st) x 6 (18 sts). Continue increasing by 6 sts per round until 48 sts.')),
      h2('Sides'),
      p(t('Work 18 cm straight in round on 48 sts. Sl st to join each round. Fasten off.')),
      h2('What to try next'),
      p(t('The crochet thermal base layer pairs well with the beanie for a complete cold-weather active set.')),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out: Record<string, unknown> = {
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
  if (pat.grades && pat.grades.length > 0) {
    out.grades = pat.grades
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nDone: ${PATTERNS.length} patterns`)
