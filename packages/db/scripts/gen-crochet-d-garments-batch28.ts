/**
 * Generator: D-Garments Batch 28 -- G271-G280 linen and natural fibre garments
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch28.ts
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

// G271 -- linen summer top (TANK, sport 4mm, POSITIVE_4)
const g271 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'POSITIVE_4', garmentType: 'TANK' })
const g271m = g271.find(g => g.size === 'M')!

// G272 -- linen midi dress (DRESS, sport 4mm, POSITIVE_4)
const g272 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g272m = g272.find(g => g.size === 'M')!

// G273 -- linen cardigan (CARDIGAN, sport 4mm, POSITIVE_4)
const g273 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g273m = g273.find(g => g.size === 'M')!

// G274 -- linen wide leg trousers (TROUSERS, sport 4mm, POSITIVE_4)
const g274 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g274m = g274.find(g => g.size === 'M')!

// G275 -- linen beach tunic (PULLOVER, sport 4mm, GENEROUS_15)
const g275 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'GENEROUS_15', garmentType: 'PULLOVER' })
const g275m = g275.find(g => g.size === 'M')!

// G276 -- bamboo yarn pullover (PULLOVER, dk 4mm, POSITIVE_4)
const g276 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g276m = g276.find(g => g.size === 'M')!

// G277 -- hemp yarn vest (TANK, dk 5mm, POSITIVE_4)
const g277 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'POSITIVE_4', garmentType: 'TANK' })
const g277m = g277.find(g => g.size === 'M')!

// G278 -- cotton linen blend cardigan (CARDIGAN, dk 4mm, POSITIVE_4)
const g278 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g278m = g278.find(g => g.size === 'M')!

// G279 -- natural fibre tank (TANK, sport 4mm, ZERO)
const g279 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 20, rowsPer10cm: 22 }, easePreset: 'ZERO', garmentType: 'TANK' })
const g279m = g279.find(g => g.size === 'M')!

// G280 -- organic cotton pullover (PULLOVER, dk 4mm, POSITIVE_4)
const g280 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g280m = g280.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'linen-summer-top-crochet',
  title: 'Linen summer top',
  excerpt: 'A sleeveless tank top worked in 100% linen yarn. The open weave of the dc fabric lets the fibre breathe in warm weather. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport-weight linen on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g271m.finishedMeasurements.bust} cm bust. Length 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen tank top crochet', 'summer linen top crochet', 'natural fibre sleeveless crochet'],
  glossaryTerms: [
    { slug: 'linen-yarn-g271', term: 'Linen yarn', definition: 'Yarn spun from flax fibres. It is strong and gets softer with washing. Linen has low elasticity, so gauge swatching on the exact hook size matters more than with wool.' },
    { slug: 'armhole-shaping-g271', term: 'Armhole shaping', definition: 'A series of dc2tog decreases worked at the side edges of both front and back panels to form the armhole curve. Worked over the top 15 cm of each panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linen yarn tanks are a popular summer crochet project, chosen for their breathability and relaxed drape.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels flat in dc using '), gt('linen-yarn-g271', 'linen yarn'), t('. Shape each panel with '), gt('armhole-shaping-g271', 'armhole shaping'), t(' at the top side edges. Seam at shoulders and sides. Finish the armhole and neckline edges with one round of dc.')),
      p(t(`Size M: ${g271m.finishedMeasurements.bust} cm bust, length 58 cm. Swatch first to check gauge: linen does not give like wool.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport-weight linen yarn', qty: '400 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g271m.castOnStitches + 2}. Work dc for 43 cm. Begin `), gt('armhole-shaping-g271', 'armhole shaping'), t(': dc2tog at each side edge every row 4 times. Continue straight for 15 cm.')),
      h2('Front panel'),
      p(t('Work to match back. Shape neckline at centre with dc2tog over the top 8 cm.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Work one round of dc around armholes and neckline. Block flat and allow to dry completely: '), gt('linen-yarn-g271', 'linen yarn'), t(' relaxes with its first wet block.')),
      h2('What to try next'),
      p(t('The linen midi dress uses the same yarn and gauge for a full-length version.')),
    ],
  },
},
{
  slug: 'linen-midi-dress-crochet',
  title: 'Linen midi dress',
  excerpt: 'A sleeveless midi-length dress in 100% linen yarn. Straight body with gentle side shaping and a scoop neckline. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport-weight linen on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g272m.finishedMeasurements.bust} cm bust. Length 105 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen midi dress crochet', 'crochet linen maxi dress', 'natural fibre dress crochet'],
  glossaryTerms: [
    { slug: 'linen-drape-g272', term: 'Linen drape', definition: 'The way linen fabric falls due to its weight and low elasticity. A linen dress in dc hangs close and fluid against the body. The drape improves after the first wash and block.' },
    { slug: 'waist-shaping-g272', term: 'Waist shaping', definition: 'A pair of dc2tog decreases at each side edge at the natural waist point, then matching increases below the bust to create a subtle A-line silhouette. Optional: the pattern also works as a straight column.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linen midi dresses are a well-established summer crochet garment design, popular for festivals and warm-weather events.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as long dc panels. Add optional '), gt('waist-shaping-g272', 'waist shaping'), t(' at the midpoint for a gentle fit-and-flare line. The '), gt('linen-drape-g272', 'linen drape'), t(' gives the hem a fluid movement that improves after blocking.')),
      p(t(`Size M: ${g272m.finishedMeasurements.bust} cm bust, length 105 cm. Waist shaping is optional: work straight for a relaxed column shape.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport-weight linen yarn', qty: '900 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g272m.castOnStitches + 2}. Work dc for 105 cm. Add `, )), p(gt('waist-shaping-g272', 'waist shaping'), t(' at 60 cm from hem if desired.')),
      h2('Front panel'),
      p(t('Work to match back. Shape scoop neck at centre front over the top 10 cm with dc2tog.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Work dc edging around armholes and neckline. Wet block: the '), gt('linen-drape-g272', 'linen drape'), t(' fully develops once the fabric has been washed and dried flat.')),
      h2('What to try next'),
      p(t('The linen cardigan layers over this dress for a complete summer outfit.')),
    ],
  },
},
{
  slug: 'linen-cardigan-crochet',
  title: 'Linen open cardigan',
  excerpt: 'A lightweight open cardigan in 100% linen yarn. No buttons, no fastening: the fronts hang open for an airy layering piece. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport-weight linen on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g273m.finishedMeasurements.bust} cm bust. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen open cardigan crochet', 'linen layer cardigan crochet', 'summer cardigan linen crochet'],
  glossaryTerms: [
    { slug: 'open-front-g273', term: 'Open front', definition: 'A cardigan style with no button band, no zipper, and no fastening. Both front panels hang loose. The silhouette relies on the side seams and shoulder placement to stay flat on the body.' },
    { slug: 'linen-front-band-g273', term: 'Linen front band', definition: 'A single row of dc worked along each front edge to neaten the turning chain edge. Linen edge-stitches can look uneven; the band creates a clean straight line down each front.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open linen cardigans are a simple and practical warm-weather layering garment.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels as straight dc rectangles. The '), gt('open-front-g273', 'open front'), t(' needs no button placement: just seam at the shoulders and sides and finish each front edge with a '), gt('linen-front-band-g273', 'linen front band'), t(' to neaten the edge.')),
      p(t(`Size M: ${g273m.finishedMeasurements.bust} cm bust, length 65 cm. Sleeve length 55 cm. No waist shaping needed.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport-weight linen yarn', qty: '700 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g273m.castOnStitches + 2}. Work dc for 65 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g273m.castOnStitches / 2) + 2}. Work dc for 65 cm. Work `, )), p(gt('linen-front-band-g273', 'linen front band'), t(' along the centre front edge.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g273m.sleeveCapStitches + 2}. Work dc for 55 cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Set in sleeves. The '), gt('open-front-g273', 'open front'), t(' hangs loose. Block to even the fabric.')),
      h2('What to try next'),
      p(t('The linen beach tunic uses the same fibre in a longer and looser tunic shape.')),
    ],
  },
},
{
  slug: 'linen-wide-leg-trousers-crochet',
  title: 'Linen wide-leg trousers',
  excerpt: 'Wide-leg trousers worked in 100% linen yarn. Flat-fronted waistband with a simple casing for an elastic waist. Each leg is worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport-weight linen on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g274m.finishedMeasurements.bust} cm hip. Leg length 95 cm. Leg opening 55 cm around.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen trousers crochet', 'wide leg linen pants crochet', 'crochet linen palazzo trousers'],
  glossaryTerms: [
    { slug: 'elastic-waist-casing-g274', term: 'Elastic waist casing', definition: 'A folded dc channel at the top of the trousers. The upper section is worked to twice the casing height, then folded over and slip stitched to the inside so elastic can be threaded through.' },
    { slug: 'crotch-seam-g274', term: 'Crotch seam', definition: 'The curved seam joining the two leg panels at the crotch point. The shaping is worked with dc2tog at the inner leg top edge over 5 rows to create the curved join.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linen wide-leg trousers are a practical warm-weather garment, well established in both hand knit and hand crochet design.',
  body: {
    type: 'doc', content: [
      p(t('Work each leg as two flat dc panels, front and back. Shape the '), gt('crotch-seam-g274', 'crotch seam'), t(' with dc2tog at the inner top edge. Seam legs and join at the crotch. Add the '), gt('elastic-waist-casing-g274', 'elastic waist casing'), t(' at the top edge.')),
      p(t(`Size M: ${g274m.finishedMeasurements.bust} cm hip, leg length 95 cm. Waistband casing 4 cm deep.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport-weight linen yarn', qty: '1100 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2.5 cm wide elastic', qty: '80 cm' },
      ]),
      h2('Leg panels (make 4)'),
      p(t(`Chain ${Math.round(g274m.castOnStitches / 2) + 2}. Work dc for 95 cm. Shape `, )), p(gt('crotch-seam-g274', 'crotch seam'), t(' at top inner edge: dc2tog 5 times over 5 rows.')),
      h2('Waist casing'),
      p(t('Continue dc for 8 cm above the hip edge. Fold down and slip stitch to inside to form the '), gt('elastic-waist-casing-g274', 'elastic waist casing'), t('. Thread elastic and secure.')),
      h2('What to try next'),
      p(t('The linen beach tunic pairs with these trousers as a complete warm-weather set.')),
    ],
  },
},
{
  slug: 'linen-beach-tunic-crochet',
  title: 'Linen beach tunic',
  excerpt: 'A long oversized tunic in 100% linen yarn, falling to mid-thigh. Worn loose over swimwear or with wide-leg trousers. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport-weight linen on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g275m.finishedMeasurements.bust} cm bust with generous ease. Length 80 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen beach tunic crochet', 'crochet linen cover up tunic', 'summer tunic linen crochet'],
  glossaryTerms: [
    { slug: 'treble-mesh-hem-g275', term: 'Treble mesh hem', definition: 'The lower 8 cm of the tunic worked in a simple treble chain-1 mesh. The open mesh lightens the hem visually and gives the tunic an airy feel against the legs.' },
    { slug: 'drop-armhole-g275', term: 'Drop armhole', definition: 'An armhole cut lower than a standard drop shoulder by leaving the side seams open for the top 25 cm. No sleeves are attached: the opening is simply edged with one dc round. The wide opening allows air flow.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linen beach tunics and cover-ups are a popular warm-weather crochet garment, frequently made in natural fibre yarns.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as wide dc panels. Finish the lower 8 cm in '), gt('treble-mesh-hem-g275', 'treble mesh hem'), t(' for a light open border. Leave '), gt('drop-armhole-g275', 'drop armhole'), t(' openings at the upper sides unseamed and edge each in dc. The tunic is sleeveless.')),
      p(t(`Size M: ${g275m.finishedMeasurements.bust} cm bust. Length 80 cm. Drop armhole opening 25 cm deep.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport-weight linen yarn', qty: '750 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g275m.castOnStitches + 2}. Work `), gt('treble-mesh-hem-g275', 'treble mesh hem'), t(' for 8 cm. Continue in dc for 72 cm.')),
      h2('Front panel'),
      p(t('Work to match back. Shape round neck at centre front over the top 10 cm.')),
      h2('Assembly'),
      p(t('Seam at shoulders. Seam sides from hem up to 55 cm, leaving the top 25 cm open for '), gt('drop-armhole-g275', 'drop armholes'), t('. Edge each armhole in dc.')),
      h2('What to try next'),
      p(t('The linen wide-leg trousers use the same fibre and can be matched to this tunic as a set.')),
    ],
  },
},
{
  slug: 'bamboo-yarn-pullover-crochet',
  title: 'Bamboo yarn pullover',
  excerpt: 'A lightweight DK pullover in 100% bamboo yarn. The smooth silky fibre creates a fluid fabric with a gentle sheen. Worked flat and seamed with a round neck. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK bamboo on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g276m.finishedMeasurements.bust} cm bust. Length 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bamboo yarn pullover crochet', 'bamboo fibre sweater crochet', 'silk feel crochet pullover'],
  glossaryTerms: [
    { slug: 'bamboo-yarn-g276', term: 'Bamboo yarn', definition: 'Yarn made from processed bamboo cellulose fibres. It is soft, slightly silky, and very smooth. Bamboo has no elasticity, so the fabric has a fluid drape. Use a tighter gauge swatch than you would with wool at the same weight.' },
    { slug: 'fluid-seam-g276', term: 'Fluid seam', definition: 'A seam worked in dc slip stitch rather than mattress stitch. The less grippy seam suits bamboo fabric, which does not ease into a seam as readily as wool. Place the seam on the right side for a flat visible ridge.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Bamboo yarn is a widely available plant-based fibre with a silky handle, popular for warm-weather crochet garments.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in dc using '), gt('bamboo-yarn-g276', 'bamboo yarn'), t('. The fabric drapes fluidly: tension will feel different from wool. Seam using the '), gt('fluid-seam-g276', 'fluid seam'), t(' method to suit the slippery fibre.')),
      p(t(`Size M: ${g276m.finishedMeasurements.bust} cm bust. Length 60 cm. Neck band 3 cm wide in dc rounds.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK bamboo yarn', qty: '550 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g276m.castOnStitches + 2}. Work dc for 60 cm.`)),
      h2('Front panel'),
      p(t(`Chain ${g276m.castOnStitches + 2}. Work dc for 52 cm. Shape round neck: dc2tog at each side of centre over 8 cm.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g276m.sleeveCapStitches + 2}. Work dc for 55 cm.`)),
      h2('Assembly'),
      p(t('Join shoulder seams using '), gt('fluid-seam-g276', 'fluid seam'), t(' method. Set in sleeves. Seam sides and sleeve underarms. Work 3 cm of dc rounds around neckline.')),
      h2('What to try next'),
      p(t('The organic cotton pullover uses a similar shape in a plant-based fibre with more structure.')),
    ],
  },
},
{
  slug: 'hemp-yarn-vest-crochet',
  title: 'Hemp yarn vest',
  excerpt: 'A sleeveless vest worked in 100% hemp yarn. Hemp creates a sturdy open-weave fabric that softens with each wash. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK hemp on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g277m.finishedMeasurements.bust} cm bust. Length 55 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['hemp vest crochet', 'hemp yarn sleeveless crochet', 'natural hemp crochet garment'],
  glossaryTerms: [
    { slug: 'hemp-yarn-g277', term: 'Hemp yarn', definition: 'Yarn spun from hemp plant fibres. It is strong, mildly coarse when new, and becomes noticeably softer after several washes. Hemp fabric holds its shape well and does not stretch out of form. Use a slightly larger hook than the ball band suggests to help the fabric breathe.' },
    { slug: 'v-neck-decrease-g277', term: 'V-neck decrease', definition: 'A pair of dc2tog worked either side of the centre front stitch, repeated every other row, to form a clean V opening. The decreases start at the base of the V and continue up to the shoulder line.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Hemp yarn garments are a durable and sustainable natural-fibre crochet option.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as flat dc panels in '), gt('hemp-yarn-g277', 'hemp yarn'), t('. The front has a V-neck shaped with '), gt('v-neck-decrease-g277', 'V-neck decreases'), t('. The back has a simple round neck. Seam at shoulders and sides. Finish armhole and neckline edges with dc.')),
      p(t(`Size M: ${g277m.finishedMeasurements.bust} cm bust, length 55 cm. V-neck starts 20 cm below the shoulder line.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK hemp yarn', qty: '480 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g277m.castOnStitches + 2}. Work dc for 55 cm.`)),
      h2('Front panel'),
      p(t(`Chain ${g277m.castOnStitches + 2}. Work dc for 35 cm. Begin `), gt('v-neck-decrease-g277', 'V-neck decrease'), t(': dc2tog at centre every other row for 20 cm. Work each side separately.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Edge armholes in dc. The '), gt('hemp-yarn-g277', 'hemp yarn'), t(' softens with washing: machine wash on a cool cycle to start the softening process.')),
      h2('What to try next'),
      p(t('The natural fibre tank uses a plant-based blend with a softer handle for a similar silhouette.')),
    ],
  },
},
{
  slug: 'cotton-linen-blend-cardigan-crochet',
  title: 'Cotton-linen blend cardigan',
  excerpt: 'A button-front cardigan in a 50/50 cotton-linen blend yarn. The blend gives slightly more body than pure linen and a cooler touch than pure cotton. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton-linen blend on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g278m.finishedMeasurements.bust} cm bust. Length 62 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cotton linen cardigan crochet', 'blend yarn cardigan crochet', 'summer button cardigan crochet'],
  glossaryTerms: [
    { slug: 'cotton-linen-blend-g278', term: 'Cotton-linen blend', definition: 'A yarn combining cotton and linen fibres, usually in equal parts. Cotton softens the linen and adds a slight sheen; linen adds structure and keeps the fabric from going limp. The blend is washable and improves with wear.' },
    { slug: 'button-band-g278', term: 'Button band', definition: 'A dc strip worked along the right and left front edges after assembly. The right band carries the buttonholes; the left band carries the buttons. Work 5 rows of dc, placing buttonholes on row 3 by working ch 1, skip 1 at each button position.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cotton-linen blend cardigans are a practical warm-weather layering piece, combining the best qualities of both fibres.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels in '), gt('cotton-linen-blend-g278', 'cotton-linen blend'), t(' dc. Seam at shoulders and sides. Work '), gt('button-band-g278', 'button bands'), t(' along both front edges, placing buttonholes on the right band.')),
      p(t(`Size M: ${g278m.finishedMeasurements.bust} cm bust. Length 62 cm. Sleeve length 55 cm. 6 buttons.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton-linen blend yarn', qty: '750 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '6' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g278m.castOnStitches + 2}. Work dc for 62 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g278m.castOnStitches / 2) + 2}. Work dc for 62 cm.`)),
      h2('Button bands'),
      p(t('Join shoulders and sides. Work '), gt('button-band-g278', 'button bands'), t(' along each front edge. Mark 6 button positions evenly spaced on the right band. Sew buttons to left band.')),
      h2('What to try next'),
      p(t('The linen cardigan is a simpler open-front version for when no fastening is needed.')),
    ],
  },
},
{
  slug: 'natural-fibre-tank-crochet',
  title: 'Natural fibre tank',
  excerpt: 'A body-skimming tank top in a natural plant-fibre yarn such as cotton, linen, or a blend. Zero ease for a close fit. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in sport-weight natural fibre on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g279m.finishedMeasurements.bust} cm bust with zero ease. Length 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['natural fibre tank crochet', 'plant based yarn tank crochet', 'zero ease crochet top'],
  glossaryTerms: [
    { slug: 'natural-fibre-g279', term: 'Natural plant fibre', definition: 'Yarn made from plant-based cellulose: cotton, linen, bamboo, hemp, or blends. All are non-elastic with a draping handle. Gauge swatching after washing the swatch is important because many plant fibres relax when wet.' },
    { slug: 'side-shaping-g279', term: 'Side shaping', definition: 'A line of dc2tog decreases at each side edge between the hem and the underarm, then matching increases to form a slight hourglass fit. Used here to keep the zero-ease bust from also feeling tight at the hip.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Natural fibre tanks are a versatile warm-weather wardrobe piece, worked in any plant-based yarn of the right weight.',
  body: {
    type: 'doc', content: [
      p(t('Choose a '), gt('natural-fibre-g279', 'natural plant fibre'), t(' sport-weight yarn in cotton, linen, or a blend. Work front and back flat in dc with '), gt('side-shaping-g279', 'side shaping'), t(' to follow the body at zero ease. Seam at shoulders and sides. Edge armholes and neckline with dc.')),
      p(t(`Size M: ${g279m.finishedMeasurements.bust} cm bust, length 58 cm. Swatch after washing: the gauge often relaxes by one stitch per 10 cm after the first wet block.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Sport-weight natural fibre yarn', qty: '420 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g279m.castOnStitches + 2}. Work dc for 42 cm. Add `), gt('side-shaping-g279', 'side shaping'), t(': dc2tog at each side every 6 rows twice, then reverse. Continue straight to armhole.')),
      h2('Front panel'),
      p(t('Work to match back. Shape neckline at centre front: dc2tog working inward over the top 12 cm.')),
      h2('Finishing'),
      p(t('Seam at shoulders and sides. Edge all openings in dc. Wet block the finished tank: '), gt('natural-fibre-g279', 'natural plant fibre'), t(' fabrics even out significantly after washing.')),
      h2('What to try next'),
      p(t('The linen summer top uses a similar shape; the hemp vest adds a V-neck and more structure.')),
    ],
  },
},
{
  slug: 'organic-cotton-pullover-crochet',
  title: 'Organic cotton pullover',
  excerpt: 'A relaxed pullover in 100% organic cotton DK yarn. Cotton provides a breathable warm-weather fabric with more body than linen or bamboo. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK organic cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g280m.finishedMeasurements.bust} cm bust. Length 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['organic cotton pullover crochet', 'cotton sweater crochet', 'eco yarn crochet pullover'],
  glossaryTerms: [
    { slug: 'organic-cotton-g280', term: 'Organic cotton yarn', definition: 'Cotton yarn produced without synthetic pesticides or fertilisers. It works the same way as conventional cotton but is softer due to gentler processing. The finished fabric has a slight matte surface and washes well at 30 degrees.' },
    { slug: 'cotton-neck-band-g280', term: 'Cotton neck band', definition: 'A narrow band of dc rounds worked around the neckline after shoulder seaming. Cotton does not stretch or recover like wool rib, so the band is kept narrow at 2 cm to avoid floppy edges.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Organic cotton pullovers are a popular everyday crochet garment for warm seasons, valued for washability and comfort.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in dc using '), gt('organic-cotton-g280', 'organic cotton yarn'), t('. The fabric is heavier than linen or bamboo: keep the gauge accurate to avoid an overly dense fabric. Add a narrow '), gt('cotton-neck-band-g280', 'cotton neck band'), t(' after seaming.')),
      p(t(`Size M: ${g280m.finishedMeasurements.bust} cm bust. Length 60 cm. Sleeve length 58 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK organic cotton yarn', qty: '650 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g280m.castOnStitches + 2}. Work dc for 60 cm.`)),
      h2('Front panel'),
      p(t(`Chain ${g280m.castOnStitches + 2}. Work dc for 52 cm. Shape round neck: dc2tog either side of centre over 8 cm.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g280m.sleeveCapStitches + 2}. Work dc for 58 cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Set in sleeves. Seam sides and sleeve underarms. Work 2 cm of dc rounds for the '), gt('cotton-neck-band-g280', 'cotton neck band'), t('. Wash the finished pullover to allow the '), gt('organic-cotton-g280', 'organic cotton'), t(' fibres to bloom and soften.')),
      h2('What to try next'),
      p(t('The bamboo yarn pullover uses the same shape in a silkier plant fibre for a different handle and drape.')),
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
