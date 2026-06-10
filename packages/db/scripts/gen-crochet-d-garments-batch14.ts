/**
 * Generator: D-Garments Batch 14 -- Skirts, trousers, and separates G131-G140
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch14.ts
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

const g131 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g131m = g131.find(g => g.size === 'M')!

const g132 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g132m = g132.find(g => g.size === 'M')!

const g133 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_2', garmentType: 'DRESS' })
const g133m = g133.find(g => g.size === 'M')!

const g134 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g134m = g134.find(g => g.size === 'M')!

const g135 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g135m = g135.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'mini-skirt-crochet',
  title: 'Crochet mini skirt',
  excerpt: 'A short above-knee mini skirt worked in rounds of dc from the waistband down. Elasticated waist. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g131m.finishedMeasurements.bust} cm hip. Length 38 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['mini skirt crochet', 'crochet short skirt', 'above knee skirt crochet'],
  glossaryTerms: [
    { slug: 'elastic-waist-g131', term: 'Elasticated waist', definition: 'A waistband with a casing sewn along the top edge for threading through elastic. The elastic is cut to waist measurement and joined in a loop.' },
    { slug: 'hip-ease-g131', term: 'Hip ease', definition: 'Extra width added to the hip measurement to allow comfortable movement. This skirt uses 8 cm of positive ease at the hip.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Mini skirts are a popular crochet project in the modern revival.',
  body: {
    type: 'doc', content: [
      p(t('Work a dc waistband flat, seam into a ring, then pick up stitches along the lower edge and work downward in rounds. Use '), gt('hip-ease-g131', 'hip ease'), t(' to add 8 cm at the hip. Sew the '), gt('elastic-waist-g131', 'elasticated waist'), t(' casing and thread elastic.')),
      p(t(`Size M: ${g131m.hemStitches} sts around hip. Length 38 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '250 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Waistband'),
      p(t('Chain 8. Work dc rows to waist circumference. Seam short edges. Fold top edge and sew elastic casing.')),
      h2('Skirt body'),
      p(t(`Pick up ${g131m.hemStitches} sts from lower waistband edge. Work dc in round for 38 cm. Fasten off.`)),
      h2('What to try next'),
      p(t('The crochet midi skirt uses the same waistband and round construction at knee length.')),
    ],
  },
},
{
  slug: 'wrap-skirt-crochet',
  title: 'Crochet wrap skirt',
  excerpt: 'A knee-length wrap skirt with ties. Worked flat and folded to wrap around the hips. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g132m.finishedMeasurements.bust} cm hip. Length 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['wrap skirt crochet', 'tie skirt crochet', 'flat panel skirt crochet'],
  glossaryTerms: [
    { slug: 'wrap-overlap-g132', term: 'Wrap overlap', definition: 'The section of the skirt that folds across the body to create the wraparound closure. An extra 20 cm of width on the right front panel creates the overlap.' },
    { slug: 'crochet-ties-g132', term: 'Crochet ties', definition: 'Long chains of dc worked from each corner of the waist edge. The ties wrap around the waist and tie at the side or front.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wrap skirts are a classic wardrobe staple applied to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work the skirt as a single flat panel wider than the hip measurement to allow a '), gt('wrap-overlap-g132', 'wrap overlap'), t('. Attach '), gt('crochet-ties-g132', 'crochet ties'), t(' at each waist corner.')),
      p(t(`Size M: panel ${g132m.hemStitches + 36} sts wide x 60 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '350 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Skirt panel'),
      p(t(`Chain ${g132m.hemStitches + 38}. Work dc for 60 cm. Fasten off.`)),
      h2('Ties'),
      p(t('Work a 60 cm dc strip from each top corner. These are the '), gt('crochet-ties-g132', 'ties'), t('.')),
      h2('What to try next'),
      p(t('The crochet midi skirt is a closed-waist version in dc rounds.')),
    ],
  },
},
{
  slug: 'tiered-skirt-crochet',
  title: 'Tiered crochet skirt',
  excerpt: 'A three-tier gathered skirt in DK yarn. Each tier is 50 percent wider than the one above, giving a full skirt silhouette. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g133m.finishedMeasurements.bust} cm hip. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['tiered skirt crochet', 'gathered skirt crochet', 'boho skirt crochet'],
  glossaryTerms: [
    { slug: 'tier-join-g133', term: 'Tier join', definition: 'Attaching the top of one tier to the lower edge of the tier above. Each lower tier has 50 percent more stitches, creating the gathered fullness.' },
    { slug: 'increase-row-g133', term: 'Increase row', definition: 'A joining row worked by picking up stitches from the lower edge of the tier above and working 3 dc into every 2 stitches to create the extra width of the next tier.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Tiered skirts are a popular boho garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work each tier as a flat dc rectangle, then '), gt('tier-join-g133', 'join tiers'), t(' by working an '), gt('increase-row-g133', 'increase row'), t(' from the lower edge. The three tiers are sewn to a waistband with elastic casing.')),
      p(t(`Size M: Tier 1 (top): ${g133m.hemStitches} sts, 20 cm. Tier 2: ${Math.round(g133m.hemStitches * 1.5)} sts, 22 cm. Tier 3: ${Math.round(g133m.hemStitches * 2.25)} sts, 23 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '550 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Tier 1'),
      p(t(`Chain ${g133m.hemStitches + 2}. Work dc for 20 cm. Join short edges.`)),
      h2('Tier 2'),
      p(t('Work an '), gt('increase-row-g133', 'increase row'), t(` from the Tier 1 lower edge: 3 dc into every 2 sts. Continue dc for 22 cm. Join short edges via `), gt('tier-join-g133', 'tier join'), t('.')),
      h2('What to try next'),
      p(t('The crochet midi skirt uses a single panel for a simpler silhouette.')),
    ],
  },
},
{
  slug: 'high-neck-bodycon-dress-crochet',
  title: 'High neck bodycon dress',
  excerpt: 'A close-fit bodycon dress worked in rib with a high neck. Worked in rounds from top to hem. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in rib on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g134m.finishedMeasurements.bust} cm bust with zero ease. Length 90 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['bodycon dress crochet', 'high neck dress crochet', 'fitted rib dress crochet'],
  glossaryTerms: [
    { slug: 'bodycon-rib-g134', term: 'Bodycon rib', definition: 'A 1x1 rib (fpdc and bpdc alternating) worked in the round from the neck down. The elastic rib clings to the body contours with zero or negative ease.' },
    { slug: 'fpdc-g134', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. Alternating fpdc and bpdc creates the raised columns of the rib pattern.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Fitted rib dresses are a popular modern crochet garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('bodycon-rib-g134', 'bodycon rib'), t(' throughout: '), gt('fpdc-g134', 'fpdc'), t('/bpdc alternating in the round. Work from the high neck downward to the hem. No increases or decreases needed; the rib stretch conforms to the body.')),
      p(t(`Size M: ${g134m.neckStitches} sts at neck, worked in round for 90 cm total.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '750 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain ${g134m.neckStitches + 2}. Join into a ring. Work `), gt('bodycon-rib-g134', 'fpdc/bpdc rib'), t(' in round for 90 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The fitted ribbed pullover uses the same rib in a shorter length.')),
    ],
  },
},
{
  slug: 'crochet-dungarees',
  title: 'Crochet dungarees',
  excerpt: 'Casual dungarees (overalls) with a bib front and adjustable straps. Worked flat and assembled. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g135m.finishedMeasurements.bust} cm hip. Inseam approx. 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet dungarees', 'crochet overalls', 'crochet bib trousers'],
  glossaryTerms: [
    { slug: 'bib-front-g135', term: 'Bib front', definition: 'A rectangular panel at the upper front of dungarees reaching from the waistband to the chest. The bib is worked separately and sewn to the top of the main body.' },
    { slug: 'dc2tog-g135', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the crotch shaping when joining front and back leg panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet dungarees are a popular modern fashion garment.',
  body: {
    type: 'doc', content: [
      p(t('Work two leg tubes from the ankle up to the crotch. Join at the crotch using '), gt('dc2tog-g135', 'dc2tog'), t(' for the shaping curve. Continue as a single body panel to the waist. Work the '), gt('bib-front-g135', 'bib front'), t(' separately and attach at the waist. Add long adjustable shoulder straps.')),
      p(t(`Size M: each leg ${g135m.hemStitches / 2} sts around. Body joined at ${g135m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '800 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'D-ring or dungaree clip', qty: '4' },
      ]),
      h2('Legs (make 2)'),
      p(t('Work each leg as a dc tube from the ankle upward. Shape inner thigh with increases near the top. Work 60 cm inseam.')),
      h2('Body'),
      p(t(`Join legs at crotch using `), gt('dc2tog-g135', 'dc2tog'), t('. Work combined body for 25 cm to waist.')),
      h2('Bib'),
      p(t('Work a 20 x 25 cm dc rectangle. Attach to front waist. Add straps.')),
      h2('What to try next'),
      p(t('The crochet joggers use a simpler single-tube trouser construction.')),
    ],
  },
},
{
  slug: 'pencil-skirt-crochet',
  title: 'Pencil skirt',
  excerpt: 'A straight, close-fitting pencil skirt ending at the knee in aran yarn. Worked flat with a back slit. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g131m.finishedMeasurements.bust} cm hip. Length 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['pencil skirt crochet', 'straight skirt crochet', 'fitted knee skirt crochet'],
  glossaryTerms: [
    { slug: 'back-slit-g136', term: 'Back slit', definition: 'An opening at the lower back seam of the pencil skirt, typically 15 cm long. The slit gives enough room to walk without straining the close-fit hem.' },
    { slug: 'dc2tog-g136', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the side edges to taper from hip width to a slightly narrower hem.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Pencil skirts are a classic fashion garment adapted to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and front panels as flat dc rectangles. Taper the sides by working '), gt('dc2tog-g136', 'dc2tog'), t(' at each side edge every 8 rows for a 5 cm reduction. Leave the lower 15 cm of the centre back seam open to form the '), gt('back-slit-g136', 'back slit'), t('.')),
      p(t(`Size M: ${g131m.hemStitches} sts wide at hip. Length 60 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '350 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Back and front panels'),
      p(t(`Chain ${g131m.hemStitches + 2}. Work dc for 60 cm. Taper sides with `), gt('dc2tog-g136', 'dc2tog'), t(' as needed. Seam leaving the '), gt('back-slit-g136', 'back slit'), t(' open.')),
      h2('What to try next'),
      p(t('The crochet midi skirt uses a rounded silhouette in dc rounds.')),
    ],
  },
},
{
  slug: 'wide-leg-trousers-crochet',
  title: 'Wide-leg trousers',
  excerpt: 'Wide-leg palazzo trousers in DK yarn with an elasticated waist. Worked as two flat panels seamed into tubes. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g132m.finishedMeasurements.bust} cm hip. Leg opening 66 cm. Inseam 70 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['wide leg trousers crochet', 'palazzo pants crochet', 'crochet wide leg pants'],
  glossaryTerms: [
    { slug: 'palazzo-leg-g137', term: 'Palazzo leg', definition: 'A very wide trouser leg with the same width from hip to hem. No tapering. The opening at the ankle is usually 60 to 70 cm around.' },
    { slug: 'crotch-curve-g137', term: 'Crotch curve', definition: 'A shaping at the top of each trouser panel where the inner leg meets the rise. Worked with a short row or decrease sequence to avoid excess fabric pulling.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wide-leg palazzo trousers are a popular modern fashion garment.',
  body: {
    type: 'doc', content: [
      p(t('Work each leg as a '), gt('palazzo-leg-g137', 'palazzo leg'), t(' panel: a flat dc rectangle seamed into a tube. Shape the '), gt('crotch-curve-g137', 'crotch curve'), t(' at the top inner edge of each leg before joining. Attach a dc waistband with elastic casing.')),
      p(t(`Size M: leg tube 66 cm around, 70 cm inseam. Rise approx. 30 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Legs (make 2)'),
      p(t('Chain 120. Work dc for 70 cm. Seam into tube. Shape crotch with '), gt('crotch-curve-g137', 'crotch curve'), t('.')),
      h2('Assembly'),
      p(t('Join legs at the crotch. Add waistband with elastic casing.')),
      h2('What to try next'),
      p(t('The crochet joggers use a narrower tapered leg with a ribbed ankle cuff.')),
    ],
  },
},
{
  slug: 'crochet-culottes',
  title: 'Crochet culottes',
  excerpt: 'Wide-leg culottes ending below the knee in DK yarn. Elasticated waist. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g133m.finishedMeasurements.bust} cm hip. Length 55 cm below waist.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet culottes', 'wide leg shorts crochet', 'below knee wide trouser crochet'],
  glossaryTerms: [
    { slug: 'culotte-length-g138', term: 'Culotte length', definition: 'A trouser cut ending just below the knee, around 50 to 60 cm from the waist. Wider than a standard trouser leg and shorter than full-length wide-leg trousers.' },
    { slug: 'inner-leg-seam-g138', term: 'Inner leg seam', definition: 'The seam running up the inside of each leg from the hem to the crotch. Used to turn the flat dc panel into a trouser tube.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Culottes are a popular modern fashion garment suited to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work each leg as a flat dc rectangle at '), gt('culotte-length-g138', 'culotte length'), t(': 55 cm. Seam with an '), gt('inner-leg-seam-g138', 'inner leg seam'), t(' and join at the crotch. Add an elasticated waistband.')),
      p(t(`Size M: leg tube 60 cm around, 55 cm length.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '400 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Legs (make 2)'),
      p(t('Chain 108. Work dc for 55 cm. Seam using '), gt('inner-leg-seam-g138', 'inner leg seam'), t('. Join legs at crotch.')),
      h2('What to try next'),
      p(t('The wide-leg trousers use the same construction at full ankle length.')),
    ],
  },
},
{
  slug: 'crochet-shorts',
  title: 'Crochet shorts',
  excerpt: 'Mid-thigh crochet shorts in aran yarn with an elasticated waist. Simple flat-panel construction. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g134m.finishedMeasurements.bust} cm hip. Inseam 20 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet shorts', 'summer shorts crochet', 'casual crochet shorts'],
  glossaryTerms: [
    { slug: 'shorts-rise-g139', term: 'Shorts rise', definition: 'The measurement from the waistband to the crotch seam. A mid-rise shorts has a rise of 25 to 30 cm. The rise width determines how much fabric sits above the thigh.' },
    { slug: 'flat-seam-g139', term: 'Flat seam', definition: 'A whip stitch or mattress stitch join worked flat against the panel edge. Used to seam the inner leg without creating a thick ridge that would be uncomfortable against the skin.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet shorts are a popular warm-weather project.',
  body: {
    type: 'doc', content: [
      p(t('Work two leg panels. Each panel is a dc rectangle. '), gt('shorts-rise-g139', 'Rise'), t(': 25 cm above the inseam. Inseam: 20 cm. Seam with a '), gt('flat-seam-g139', 'flat seam'), t(' on each inner leg. Join at the crotch. Add a dc waistband with elastic casing.')),
      p(t(`Size M: each leg ${g134m.hemStitches / 2} sts wide, 45 cm tall (rise + inseam).`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '250 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
      ]),
      h2('Legs (make 2)'),
      p(t(`Chain ${g134m.hemStitches / 2 + 2}. Work dc for 45 cm. `), gt('flat-seam-g139', 'Seam'), t(' inner leg. Join legs.')),
      h2('What to try next'),
      p(t('The crochet culottes use the same flat-panel build at a longer length.')),
    ],
  },
},
{
  slug: 'crochet-swimsuit-cover-pants',
  title: 'Swimsuit cover-up trousers',
  excerpt: 'Lightweight sheer cover-up trousers in DK cotton for beach wear. Worked in an open mesh stitch and worn over a swimsuit. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 sts x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g135m.finishedMeasurements.bust} cm hip. Length 80 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['swimsuit cover up trousers crochet', 'beach trousers crochet', 'mesh trousers crochet'],
  glossaryTerms: [
    { slug: 'mesh-stitch-g140', term: 'Mesh stitch', definition: 'A repeating pattern of treble groups and chain spaces. Creates a see-through open fabric that dries quickly and stays light against the skin.' },
    { slug: 'drawstring-waist-g140', term: 'Drawstring waist', definition: 'A casing at the waist with a long dc chain threaded through. Ties at the front with two loose ends.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Lightweight beach cover-up trousers are a popular warm-weather project.',
  body: {
    type: 'doc', content: [
      p(t('Work each leg in '), gt('mesh-stitch-g140', 'mesh stitch'), t(' (treble groups and ch-2 spaces) for a lightweight see-through fabric. Add a '), gt('drawstring-waist-g140', 'drawstring waist'), t(' at the top. The legs can be seamed or worked in round.')),
      p(t(`Size M: each leg 60 cm around in mesh stitch, 80 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '400 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Legs (make 2)'),
      p(t('Chain 108. Work '), gt('mesh-stitch-g140', 'mesh stitch'), t(' for 80 cm. Seam or work in round.')),
      h2('Waist'),
      p(t('Add dc waistband with '), gt('drawstring-waist-g140', 'drawstring'), t(' channel. Thread a dc chain through and tie at the front.')),
      h2('What to try next'),
      p(t('The beach cover-up dress uses the same mesh stitch in a one-piece shape.')),
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
