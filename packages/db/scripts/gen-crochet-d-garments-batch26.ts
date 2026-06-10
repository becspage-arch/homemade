/**
 * Generator: D-Garments Batch 26 -- Colourwork and intarsia-style garments G251-G260
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch26.ts
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

// G251: stripe colourwork pullover, dk 4mm DROP_SHOULDER PULLOVER
const g251 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g251m = g251.find(g => g.size === 'M')!

// G252: two-colour cardigan, aran 5mm DROP_SHOULDER CARDIGAN
const g252 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g252m = g252.find(g => g.size === 'M')!

// G253: chevron stripe jumper, dk 4mm DROP_SHOULDER PULLOVER
const g253 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g253m = g253.find(g => g.size === 'M')!

// G254: intarsia heart pullover, aran 5mm DROP_SHOULDER PULLOVER
const g254 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g254m = g254.find(g => g.size === 'M')!

// G255: fair-isle-style yoke, dk 4mm TOP_DOWN_YOKE PULLOVER
const g255 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g255m = g255.find(g => g.size === 'M')!

// G256: colourwork vest, dk 4mm DROP_SHOULDER VEST
const g256 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g256m = g256.find(g => g.size === 'M')!

// G257: striped hoodie, aran 5mm DROP_SHOULDER PULLOVER
const g257 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g257m = g257.find(g => g.size === 'M')!

// G258: two-tone drop shoulder, aran 5mm DROP_SHOULDER PULLOVER
const g258 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g258m = g258.find(g => g.size === 'M')!

// G259: ombre fade pullover, dk 4mm DROP_SHOULDER PULLOVER
const g259 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g259m = g259.find(g => g.size === 'M')!

// G260: colour field cardigan, aran 5mm DROP_SHOULDER CARDIGAN
const g260 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g260m = g260.find(g => g.size === 'M')!

const PATTERNS = [
  {
    slug: 'stripe-colourwork-pullover-crochet',
    title: 'Stripe colourwork pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in dk yarn worked in bold horizontal stripes. Two colours alternate in even rows across the front, back, and sleeves for a clean colourwork effect with minimal yarn management. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-4-0mm',
    gaugeText: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g251m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['stripe crochet pullover', 'two colour crochet sweater', 'horizontal stripe crochet jumper'],
    glossaryTerms: [
      { slug: 'colour-join-g251', term: 'Colour join', definition: 'The point at which you switch from one yarn to the next. In stripe crochet, you complete the last stitch of a row up to the final yarn-over, then draw through the new colour to finish the stitch. This places the new colour neatly at the row edge.' },
      { slug: 'yarn-carry-g251', term: 'Yarn carry', definition: 'Running the unused yarn loosely up the side edge of the work while the other colour is active, rather than cutting it each time. Carrying avoids multiple yarn tails at every stripe join and keeps the side seam tidy.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Horizontal stripe pullovers in dk weight are a popular beginner colourwork project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work back and front in horizontal stripes: 4 rows colour A, then 4 rows colour B, repeating throughout. Switch colours using a '), gt('colour-join-g251', 'colour join'), t(' at the end of each fourth row. '), gt('yarn-carry-g251', 'Carry'), t(' the resting yarn up the side edge to avoid cutting at every stripe. Seam shoulders. Set in sleeves. Seam sides and sleeve undersides.')),
        p(t(`Size M: ${g251m.hemStitches} sts wide, ${g251m.finishedMeasurements.body} cm body. Sleeve ${g251m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Dk yarn, colour A', qty: `${Math.round(g251m.yarnRequiredYards * 0.55)} yards` },
          { name: 'Dk yarn, colour B', qty: `${Math.round(g251m.yarnRequiredYards * 0.55)} yards` },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front (make 2)'),
        p(t(`Chain ${g251m.hemStitches + 2}. Work dc in 4-row stripes alternating A and B for ${g251m.finishedMeasurements.body} cm. Shape neck on front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g251m.sleeveCuffStitches + 2}. Work stripe sequence, increasing each end every 4 rows for ${g251m.finishedMeasurements.sleeve} cm.`)),
        h2('Finishing'),
        p(t('Seam sides. Work 2 rounds dc around neck in colour A.')),
        h2('What to try next'),
        p(t('The chevron stripe jumper adds increases and decreases to bend the stripes into a zigzag across the body.')),
      ],
    },
    grading: g251,
  },
  {
    slug: 'two-colour-cardigan-crochet',
    title: 'Two-colour open cardigan',
    subtitle: '',
    excerpt: 'A drop-shoulder open cardigan in aran yarn worked in two contrasting colours. The body is worked in the main colour with contrast colour edging, cuffs, and shoulder yoke band. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g252m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['two colour crochet cardigan', 'contrast trim crochet jacket', 'colour block crochet cardigan'],
    glossaryTerms: [
      { slug: 'contrast-band-g252', term: 'Contrast band', definition: 'A section of rows or a border worked in a second colour. In this cardigan, contrast bands appear at the hem, cuffs, and as a horizontal yoke band across the shoulders. The bands frame the main-colour body and give the garment a deliberate two-tone structure.' },
      { slug: 'dc-border-g252', term: 'Dc border', definition: 'A single row of dc worked along the front edges and neckline in the contrast colour. The border prevents the edges from rolling and provides a neat visual finish that ties the colourwork together.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Two-colour cardigans with contrast trim are a popular beginner colourwork garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work the main body panels in the main colour, then switch to the contrast colour for the final 5 cm of body to form the '), gt('contrast-band-g252', 'contrast band'), t(' at the shoulder. Work cuffs and hem trim in contrast colour. Finish with a '), gt('dc-border-g252', 'dc border'), t(' along each front edge and around the neck in contrast colour.')),
        p(t(`Size M: ${g252m.hemStitches} sts wide, ${g252m.finishedMeasurements.body} cm body. Sleeve ${g252m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn, main colour', qty: `${Math.round(g252m.yarnRequiredYards * 0.75)} yards` },
          { name: 'Aran yarn, contrast colour', qty: `${Math.round(g252m.yarnRequiredYards * 0.35)} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front halves'),
        p(t(`Chain ${g252m.hemStitches + 2} for back. Work dc in main colour for ${g252m.finishedMeasurements.body - 5} cm. Switch to contrast for 5 cm yoke band. Front halves: same construction, each half.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g252m.sleeveCuffStitches + 2}. Work 5 cm cuff in contrast, then main colour increasing each end every 4 rows for ${g252m.finishedMeasurements.sleeve} cm total.`)),
        h2('Finishing'),
        p(t('Seam shoulders. Set in sleeves. Seam sides. Work dc border down each front edge and around neck in contrast colour.')),
        h2('What to try next'),
        p(t('The two-tone drop-shoulder pullover splits body and sleeves into two colour halves for a strong graphic look.')),
      ],
    },
    grading: g252,
  },
  {
    slug: 'chevron-stripe-jumper-crochet',
    title: 'Chevron stripe jumper',
    subtitle: '',
    excerpt: 'A drop-shoulder jumper in dk yarn worked in a chevron stripe pattern. Regular increases and decreases bend horizontal stripes into a zigzag across the front and back. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-4-0mm',
    gaugeText: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g253m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
    criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
    aliases: ['chevron crochet sweater', 'zigzag stripe crochet jumper', 'ripple stitch crochet pullover'],
    glossaryTerms: [
      { slug: 'chevron-row-g253', term: 'Chevron row', definition: 'A row in which groups of dc are increased at peaks and decreased at troughs at regular intervals. The same stitch count is maintained across every row; the increases and decreases simply redistribute stitches to create the zigzag shape.' },
      { slug: 'dc2tog-g253', term: 'Dc2tog', definition: 'Double crochet two together: insert the hook, pull up a loop, then insert the hook in the next stitch, pull up a loop, and draw through all three loops. Used at the trough points in the chevron to pull the fabric inward.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Chevron stripe jumpers in dk weight are a popular beginner ripple-stitch garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Set up the '), gt('chevron-row-g253', 'chevron row'), t(' on row 1: work 2 dc into the peak stitch, dc across the valley, '), gt('dc2tog-g253', 'dc2tog'), t(' at the trough, then continue. The repeat is 12 stitches wide. Keep the stitch count the same every row. Switch colour every 4 rows to build the stripe sequence. The chevron peaks and troughs align automatically when each row follows the same increase-decrease sequence.')),
        p(t(`Size M: ${g253m.hemStitches} sts wide, ${g253m.finishedMeasurements.body} cm body. Sleeve ${g253m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Dk yarn, colour A', qty: `${Math.round(g253m.yarnRequiredYards * 0.55)} yards` },
          { name: 'Dk yarn, colour B', qty: `${Math.round(g253m.yarnRequiredYards * 0.55)} yards` },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front (make 2)'),
        p(t(`Chain ${g253m.hemStitches + 2}. Establish chevron repeat. Work in 4-row stripes for ${g253m.finishedMeasurements.body} cm. Shape neck on front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g253m.sleeveCuffStitches + 2}. Work plain dc stripes, increasing each end every 4 rows for ${g253m.finishedMeasurements.sleeve} cm.`)),
        h2('Finishing'),
        p(t('Seam sides. Work 2 rounds dc around neck in colour A.')),
        h2('What to try next'),
        p(t('The fair-isle-style yoke pullover uses surface colourwork in rounds to place a patterned band across the shoulders.')),
      ],
    },
    grading: g253,
  },
  {
    slug: 'intarsia-heart-pullover-crochet',
    title: 'Intarsia heart pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in aran yarn with a large intarsia-style heart motif on the front. The heart is worked in a contrast colour by carrying separate yarn sections across the designated chart area. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g254m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['intarsia crochet pullover', 'crochet heart motif sweater', 'colour motif crochet jumper'],
    glossaryTerms: [
      { slug: 'intarsia-block-g254', term: 'Intarsia colour block', definition: 'A method of working isolated colour areas on flat pieces by winding separate yarn bobbins for each colour zone. Unlike stripes, the yarns do not travel across the row; instead, each bobbin supplies only its own section. The yarns are twisted at each colour boundary to link the sections and prevent gaps.' },
      { slug: 'colour-twist-g254', term: 'Colour twist', definition: 'The action of wrapping the outgoing yarn around the incoming yarn at each colour boundary. The twist locks the two sections together so that the motif edge does not leave a gap or hole in the fabric.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Intarsia-style heart motif pullovers in aran weight are a popular intermediate colourwork garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work the front using the '), gt('intarsia-block-g254', 'intarsia colour block'), t(' method. Wind separate bobbins for the main colour on each side and the contrast colour heart zone. At each colour change, apply a '), gt('colour-twist-g254', 'colour twist'), t(' to lock the sections. The heart chart is 20 sts wide and 24 rows tall, centred on the front piece. Back is worked in plain main colour dc throughout. Seam all pieces.')),
        p(t(`Size M: ${g254m.hemStitches} sts wide, ${g254m.finishedMeasurements.body} cm body. Sleeve ${g254m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn, main colour', qty: `${Math.round(g254m.yarnRequiredYards * 0.9)} yards` },
          { name: 'Aran yarn, contrast colour (heart)', qty: '80 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back'),
        p(t(`Chain ${g254m.hemStitches + 2}. Work plain dc for ${g254m.finishedMeasurements.body} cm. Shape neck.`)),
        h2('Front'),
        p(t(`Chain ${g254m.hemStitches + 2}. Work plain dc until heart start row (approx ${Math.round(g254m.finishedMeasurements.body * 0.3)} cm from hem). Set up three bobbins. Follow heart chart for 24 rows. Complete body in plain dc. Shape neck.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g254m.sleeveCuffStitches + 2}. Work plain dc, increasing each end every 4 rows for ${g254m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('The fair-isle-style yoke pullover builds on colour changing skills to work a repeating geometric pattern in rounds.')),
      ],
    },
    grading: g254,
  },
  {
    slug: 'fair-isle-style-yoke-crochet',
    title: 'Fair-isle-style yoke pullover',
    subtitle: '',
    excerpt: 'A top-down yoke pullover in dk yarn with a fair-isle-inspired colourwork band across the yoke. The two-colour repeating motif is worked in rounds with yarn carried across the back of the work. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-4-0mm',
    gaugeText: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g255m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['fair isle crochet sweater', 'colourwork yoke crochet pullover', 'stranded crochet yoke jumper'],
    glossaryTerms: [
      { slug: 'stranded-carry-g255', term: 'Stranded carry', definition: 'Holding both yarn colours at the same time and working over the unused colour as you stitch, so it travels along the back of the work. The carried yarn forms floats on the wrong side. Floats should not span more than 5 stitches without being caught to avoid puckering.' },
      { slug: 'colourwork-chart-g255', term: 'Colourwork chart', definition: 'A grid where each square represents one stitch and the filled or shaded squares indicate the contrast colour. Reading the chart right to left on right-side rounds and following the repeat boundary markers keeps the motif aligned across the yoke.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Fair-isle-style top-down yoke pullovers are a popular intermediate colourwork construction.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Cast on at the neck and work the plain-colour yoke in rounds with regular increase rounds. When the yoke reaches the colourwork zone (approx 8 cm below neck), introduce the second colour and follow the '), gt('colourwork-chart-g255', 'colourwork chart'), t('. Use the '), gt('stranded-carry-g255', 'stranded carry'), t(' method, catching floats every 4 stitches. Work the colourwork band for 10 rounds, then return to single-colour dc for the remainder of the yoke, body, and sleeves.')),
        p(t(`Size M: yoke depth approx 24 cm. Body circumference ${g255m.finishedMeasurements.bust} cm. Body length ${g255m.finishedMeasurements.body} cm from underarm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Dk yarn, main colour', qty: `${Math.round(g255m.yarnRequiredYards * 0.8)} yards` },
          { name: 'Dk yarn, contrast colour', qty: `${Math.round(g255m.yarnRequiredYards * 0.3)} yards` },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Yoke'),
        p(t('Chain 68 and join to work in round. Increase every other round at 4 points. At 8 cm, begin colourwork band. Work 10-round chart repeat. Continue plain dc to underarm depth.')),
        h2('Body'),
        p(t('Place sleeve stitches on holders. Work body in round in plain dc for body length. Work 3 cm dc hem.')),
        h2('Sleeves (make 2)'),
        p(t('Pick up sleeve stitches. Work in round in plain dc, decreasing toward cuff. Work 4 cm dc cuff.')),
        h2('What to try next'),
        p(t('The colourwork vest uses two-colour dc sections on flat pieces for a wearable colourwork project without working in rounds.')),
      ],
    },
    grading: g255,
  },
  {
    slug: 'colourwork-vest-crochet',
    title: 'Colourwork vest',
    subtitle: '',
    excerpt: 'A drop-shoulder vest in dk yarn with a horizontal two-colour pattern across the body. The geometric repeat is worked flat in rows by joining the second colour at the start of each pattern section. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-4-0mm',
    gaugeText: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g256m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['colourwork crochet vest', 'two colour crochet waistcoat', 'geometric pattern crochet vest'],
    glossaryTerms: [
      { slug: 'colourwork-row-g256', term: 'Colourwork row', definition: 'A row worked with two yarn colours in a set pattern. Each stitch is worked in whichever colour the chart specifies for that stitch position. The unused colour travels along the top of the previous row and is worked over, keeping the back of the fabric tidy without long floats.' },
      { slug: 'surface-pattern-g256', term: 'Surface pattern', definition: 'A repeating motif applied across the flat body fabric of a garment. In this vest, the motif is a 6-stitch geometric repeat that tiles across the full width of both front and back for a consistent all-over look.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Two-colour geometric vests are a popular flat-worked colourwork garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work back and front flat. Start the '), gt('colourwork-row-g256', 'colourwork rows'), t(' after 5 cm plain hem. The '), gt('surface-pattern-g256', 'surface pattern'), t(' is a 6-stitch repeat: 3 sts colour A, 3 sts colour B. Carry the unused colour loosely along the top of the row and work over it to avoid cutting. Work the colourwork pattern for 15 cm, then finish with 5 cm plain dc to shoulder. Seam shoulders and sides. Work armhole borders in 2 rounds dc.')),
        p(t(`Size M: ${g256m.hemStitches} sts wide, ${g256m.finishedMeasurements.body} cm body.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Dk yarn, colour A', qty: `${Math.round(g256m.yarnRequiredYards * 0.6)} yards` },
          { name: 'Dk yarn, colour B', qty: `${Math.round(g256m.yarnRequiredYards * 0.5)} yards` },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front (make 2)'),
        p(t(`Chain ${g256m.hemStitches + 2}. Work 5 cm plain dc hem in colour A. Work 15 cm colourwork pattern. Work 5 cm plain dc shoulder in colour A. Shape neck. Seam shoulders.`)),
        h2('Finishing'),
        p(t('Seam sides. Work 2-round dc armhole border in colour A. Work 2-round dc neckline border in colour A.')),
        h2('What to try next'),
        p(t('The fair-isle-style yoke pullover builds on colourwork skills and adds the challenge of working the pattern in rounds.')),
      ],
    },
    grading: g256,
  },
  {
    slug: 'striped-hoodie-crochet',
    title: 'Striped hoodie',
    subtitle: '',
    excerpt: 'A drop-shoulder hooded pullover in aran yarn worked in bold horizontal stripes. The attached hood is worked by seaming stitches at the neckline and building upward in stripe sequence. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g257m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet stripe hoodie', 'striped crochet hooded sweater', 'two colour crochet hoodie'],
    glossaryTerms: [
      { slug: 'hood-pickup-g257', term: 'Hood pick-up row', definition: 'A row of dc worked into the live neck stitches after the body is assembled. The pick-up row spans the full neckline and forms the base from which the hood is built upward in rows, then seamed at the top.' },
      { slug: 'hood-seam-g257', term: 'Hood top seam', definition: 'The seam that closes the top of the hood after the full hood height is reached. The two top edges are aligned and joined with a row of slip stitch through both layers, or a mattress seam depending on the fabric type.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Striped hooded pullovers in aran weight are a popular beginner garment project that introduces hood construction.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work body and sleeves in 6-row stripes, alternating two colours throughout. Assemble the body and seam shoulders. Work a '), gt('hood-pickup-g257', 'hood pick-up row'), t(' across the full neckline. Continue in stripe sequence for 30 cm of hood height, then close the top with a '), gt('hood-seam-g257', 'hood top seam'), t('.')),
        p(t(`Size M: ${g257m.hemStitches} sts wide, ${g257m.finishedMeasurements.body} cm body. Sleeve ${g257m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn, colour A', qty: `${Math.round(g257m.yarnRequiredYards * 0.6)} yards` },
          { name: 'Aran yarn, colour B', qty: `${Math.round(g257m.yarnRequiredYards * 0.6)} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front (make 2)'),
        p(t(`Chain ${g257m.hemStitches + 2}. Work 6-row stripes A and B for ${g257m.finishedMeasurements.body} cm. Shape neck on front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g257m.sleeveCuffStitches + 2}. Work stripe sequence, increasing each end every 4 rows for ${g257m.finishedMeasurements.sleeve} cm.`)),
        h2('Hood'),
        p(t('Work pick-up row across neckline. Continue in stripe sequence for 30 cm. Fold and seam top.')),
        h2('What to try next'),
        p(t('The two-tone drop-shoulder pullover uses a single bold colour change to create a graphic split across the body.')),
      ],
    },
    grading: g257,
  },
  {
    slug: 'two-tone-drop-shoulder-crochet',
    title: 'Two-tone drop-shoulder pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in aran yarn divided into two bold colour blocks. The lower body and sleeves are worked in the main colour; the upper body from the waist up is worked in the contrast colour. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g258m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['colour block crochet pullover', 'two tone crochet sweater', 'split colour crochet jumper'],
    glossaryTerms: [
      { slug: 'colour-block-join-g258', term: 'Colour block join', definition: 'A clean single-row boundary between two colour sections. To keep the join line level, complete the final stitch of the lower colour up to the last yarn-over, then draw through the new colour. The join row sits flat and straight across the body.' },
      { slug: 'weave-in-ends-g258', term: 'Weave-in ends', definition: 'Securing yarn tails by threading them onto a tapestry needle and running them diagonally through several stitches on the wrong side. At a colour join, weave each tail in a different direction for a neat, invisible finish.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Two-tone colour-block pullovers are a popular beginner colourwork garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work the lower half of each body panel and the lower sleeve in main colour dc. At the midpoint, make a '), gt('colour-block-join-g258', 'colour block join'), t(' and continue in contrast colour to the shoulder. Work each sleeve lower half in main colour then switch to contrast at the same proportional point. '), gt('weave-in-ends-g258', 'Weave in ends'), t(' at every join neatly on the wrong side.')),
        p(t(`Size M: ${g258m.hemStitches} sts wide, ${g258m.finishedMeasurements.body} cm body. Lower/upper split at approx ${Math.round(g258m.finishedMeasurements.body / 2)} cm. Sleeve ${g258m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn, main colour', qty: `${Math.round(g258m.yarnRequiredYards * 0.55)} yards` },
          { name: 'Aran yarn, contrast colour', qty: `${Math.round(g258m.yarnRequiredYards * 0.55)} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front (make 2)'),
        p(t(`Chain ${g258m.hemStitches + 2}. Work main colour for ${Math.round(g258m.finishedMeasurements.body / 2)} cm. Join contrast and work to shoulder. Shape neck on front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g258m.sleeveCuffStitches + 2}. Work main colour, increasing each end every 4 rows. Switch to contrast at mid-sleeve length. Total sleeve ${g258m.finishedMeasurements.sleeve} cm.`)),
        h2('Finishing'),
        p(t('Seam sides. Set in sleeves. Work 2 rounds dc around neck in contrast colour.')),
        h2('What to try next'),
        p(t('The ombre fade pullover blends through several shades to create a gradual colour transition across the body.')),
      ],
    },
    grading: g258,
  },
  {
    slug: 'ombre-fade-pullover-crochet',
    title: 'Ombre fade pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in dk yarn that fades from a deep base colour at the hem through several intermediate shades to a pale tone at the shoulder. Each shade band is worked in plain dc rows. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-4-0mm',
    gaugeText: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g259m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['ombre crochet sweater', 'gradient crochet pullover', 'fade crochet jumper'],
    glossaryTerms: [
      { slug: 'ombre-band-g259', term: 'Ombre band', definition: 'A section of rows worked in a single shade before transitioning to the next shade. In this pullover, each band is 8 rows tall. Using five shades of the same hue from dark to light produces a smooth step-by-step gradient across the body.' },
      { slug: 'shade-transition-g259', term: 'Shade transition', definition: 'The point at which one shade band ends and the next begins. Completing the last stitch of the outgoing shade by drawing through the new shade colour keeps the transition line clean and horizontal.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Ombre gradient pullovers in dk weight are a popular beginner colour-sequence garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work all pieces in five equal '), gt('ombre-band-g259', 'ombre bands'), t(', starting with the darkest shade at the hem and ending with the palest at the shoulder. Use a '), gt('shade-transition-g259', 'shade transition'), t(' join at each band boundary. The sleeve follows the same shade sequence from cuff to shoulder, so the gradient reads consistently across the assembled garment. Seam each piece after completing it.')),
        p(t(`Size M: ${g259m.hemStitches} sts wide, ${g259m.finishedMeasurements.body} cm body. Each band approx ${Math.round(g259m.finishedMeasurements.body / 5)} cm tall. Sleeve ${g259m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Dk yarn, shade 1 (darkest)', qty: `${Math.round(g259m.yarnRequiredYards * 0.25)} yards` },
          { name: 'Dk yarn, shade 2', qty: `${Math.round(g259m.yarnRequiredYards * 0.25)} yards` },
          { name: 'Dk yarn, shade 3 (mid)', qty: `${Math.round(g259m.yarnRequiredYards * 0.25)} yards` },
          { name: 'Dk yarn, shade 4', qty: `${Math.round(g259m.yarnRequiredYards * 0.25)} yards` },
          { name: 'Dk yarn, shade 5 (palest)', qty: `${Math.round(g259m.yarnRequiredYards * 0.25)} yards` },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front (make 2)'),
        p(t(`Chain ${g259m.hemStitches + 2}. Work 5 shade bands in sequence, each approx ${Math.round(g259m.finishedMeasurements.body / 5)} cm tall. Shape neck on front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g259m.sleeveCuffStitches + 2}. Work same 5-shade sequence from cuff upward, increasing each end every 4 rows for ${g259m.finishedMeasurements.sleeve} cm total.`)),
        h2('Finishing'),
        p(t('Seam sides. Work 2 rounds dc around neck in shade 5.')),
        h2('What to try next'),
        p(t('The colour field cardigan uses large rectangular colour zones across the body for a bold, graphic colourwork effect.')),
      ],
    },
    grading: g259,
  },
  {
    slug: 'colour-field-cardigan-crochet',
    title: 'Colour field cardigan',
    subtitle: '',
    excerpt: 'An open drop-shoulder cardigan in aran yarn with a geometric colour field design. Three rectangular colour zones are arranged across the back and front halves for a graphic, contemporary look. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g260m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['colour field crochet cardigan', 'geometric colour block cardigan crochet', 'graphic colour crochet jacket'],
    glossaryTerms: [
      { slug: 'colour-field-g260', term: 'Colour field', definition: 'A large, unbroken area of a single colour within a garment design. In this cardigan, three colour fields divide each body piece into rectangular zones. Each field is worked with its own yarn supply to avoid carrying yarn across the full width of the piece.' },
      { slug: 'vertical-colour-split-g260', term: 'Vertical colour split', definition: 'A boundary running the full height of a piece where one colour ends and another begins. At a vertical split, each colour section uses a separate bobbin, and a twist at the boundary on every row links the sections without leaving a gap.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Geometric colour field cardigans are a popular intermediate colourwork garment project that applies intarsia principles on a large scale.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Plan three '), gt('colour-field-g260', 'colour fields'), t(' across the back: left third in colour A, centre third in colour B, right third in colour A. Front halves each use colour A for the outer two-thirds and colour B for the inner third. At each '), gt('vertical-colour-split-g260', 'vertical colour split'), t(', twist the yarns at the boundary on every row. Work all sections simultaneously using separate bobbins for each colour zone.')),
        p(t(`Size M: ${g260m.hemStitches} sts wide back. Each colour field approx ${Math.round(g260m.hemStitches / 3)} sts. Body ${g260m.finishedMeasurements.body} cm. Sleeve ${g260m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn, colour A', qty: `${Math.round(g260m.yarnRequiredYards * 0.7)} yards` },
          { name: 'Aran yarn, colour B', qty: `${Math.round(g260m.yarnRequiredYards * 0.4)} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back'),
        p(t(`Chain ${g260m.hemStitches + 2}. Set up three colour zones on row 1. Work colour fields simultaneously for ${g260m.finishedMeasurements.body} cm. Shape neck.`)),
        h2('Front halves'),
        p(t('Each front half uses two bobbins: outer zone in colour A, inner zone in colour B. Work for body height. Shape neck. Add dc border down each front edge.')),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g260m.sleeveCuffStitches + 2}. Work plain dc in colour A, increasing each end every 4 rows for ${g260m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('The intarsia heart pullover applies the same bobbin-and-twist approach to a shaped motif rather than a geometric field.')),
      ],
    },
    grading: g260,
  },
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: pat.subtitle,
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
      primaryYarnWeightSlug: pat.primaryYarnWeightSlug,
      primaryHookSlug: pat.primaryHookSlug,
      gaugeText: pat.gaugeText,
      finishedSizeText: pat.finishedSizeText,
      terminologyConvention: 'uk',
      craftStitchSlugs: pat.stitchSlugs,
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
    grading: pat.grading,
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`wrote ${pat.slug}.json`)
}
console.log('Done.')
