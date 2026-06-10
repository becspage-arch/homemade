/**
 * Generator: D-Garments Batch 21 -- Post-stitch texture and rib-focus garments G201-G210
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch21.ts
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

// G201: basket-weave pullover, aran 5mm DROP_SHOULDER PULLOVER
const g201 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g201m = g201.find(g => g.size === 'M')!

// G202: wide-rib cardigan, aran 5mm DROP_SHOULDER CARDIGAN
const g202 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g202m = g202.find(g => g.size === 'M')!

// G203: cable-effect pullover, aran 5mm DROP_SHOULDER PULLOVER
const g203 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g203m = g203.find(g => g.size === 'M')!

// G204: cable-effect cardigan, aran 5mm DROP_SHOULDER CARDIGAN
const g204 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g204m = g204.find(g => g.size === 'M')!

// G205: waffle-stitch pullover, aran 5mm DROP_SHOULDER PULLOVER
const g205 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g205m = g205.find(g => g.size === 'M')!

// G206: bobble-yoke pullover, aran 5mm TOP_DOWN_YOKE PULLOVER
const g206 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g206m = g206.find(g => g.size === 'M')!

// G207: diamond cable vest, aran 5mm DROP_SHOULDER VEST
const g207 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g207m = g207.find(g => g.size === 'M')!

// G208: herringbone dc pullover, aran 5mm DROP_SHOULDER PULLOVER
const g208 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g208m = g208.find(g => g.size === 'M')!

// G209: aran-style multi-cable cardigan, aran 5mm DROP_SHOULDER CARDIGAN
const g209 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g209m = g209.find(g => g.size === 'M')!

// G210: textured vest rib sides, aran 5mm DROP_SHOULDER VEST
const g210 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g210m = g210.find(g => g.size === 'M')!

const PATTERNS = [
  {
    slug: 'basket-weave-pullover-crochet',
    title: 'Basket-weave pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in aran yarn worked in basket-weave texture. Alternating panels of fpdc and bpdc create a woven look across the front and back. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g201m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['basket weave crochet sweater', 'crochet textured pullover', 'fpdc bpdc pullover'],
    glossaryTerms: [
      { slug: 'basket-weave-g201', term: 'Basket-weave stitch', definition: 'A post-stitch texture formed by working alternating blocks of fpdc and bpdc across each row, then reversing the order on subsequent rows. The result mimics the over-and-under pattern of woven fabric.' },
      { slug: 'fpdc-g201', term: 'Front post double crochet', definition: 'A dc worked around the post of the stitch below from the front. In basket-weave, fpdc columns sit proud of the fabric surface to form the raised ridges.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Basket-weave texture pullover in aran weight is a well-established post-stitch garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('The '), gt('basket-weave-g201', 'basket-weave stitch'), t(' is built from alternating 4-stitch panels of '), gt('fpdc-g201', 'fpdc'), t(' and bpdc. On the next row, work bpdc over the fpdc columns and fpdc over the bpdc columns to reverse the relief. Continue alternating for the full body height to build up the woven effect.')),
        p(t(`Size M: ${g201m.hemStitches} sts wide, ${g201m.finishedMeasurements.body} cm body. Sleeve ${g201m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g201m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front'),
        p(t(`Chain ${g201m.hemStitches + 2}. Establish basket-weave panels across the first dc row. Continue in pattern for ${g201m.finishedMeasurements.body} cm. Shape neck at top of front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g201m.sleeveCuffStitches + 2}. Work basket-weave in pattern, increasing each end every 4 rows to ${g201m.hemStitches} sts. Total sleeve ${g201m.finishedMeasurements.sleeve} cm.`)),
        h2('Finishing'),
        p(t('Seam sides. Set in sleeves. Work 3 rounds of dc around neck for a clean edge.')),
        h2('What to try next'),
        p(t('The wide-rib cardigan uses the same post-stitch principle with a simpler 2x2 repeat.')),
      ],
    },
    grading: g201,
  },
  {
    slug: 'wide-rib-cardigan-crochet',
    title: 'Wide-rib cardigan',
    subtitle: '',
    excerpt: 'A drop-shoulder open cardigan in aran yarn worked in 2x2 fpdc rib throughout. The wide rib gives a stretchy, structured fabric with clear vertical lines. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g202m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet rib cardigan', '2x2 rib crochet cardigan', 'wide rib crochet jacket'],
    glossaryTerms: [
      { slug: 'wide-rib-g202', term: '2x2 rib', definition: 'A stitch pattern of two front post double crochets followed by two back post double crochets, repeated across the row. The wider column creates a bolder vertical stripe than 1x1 rib.' },
      { slug: 'fpdc-g202', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. In 2x2 rib, pairs of fpdc sit proud of the surface to create the raised column.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Wide 2x2 rib cardigans in aran weight are a popular post-stitch garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work the back, both front halves, and sleeves entirely in '), gt('wide-rib-g202', '2x2 rib'), t(' using '), gt('fpdc-g202', 'fpdc'), t(' and bpdc. The rib runs vertically from hem to shoulder on each piece. Seam shoulders. Set in sleeves. Seam sides and sleeve undersides. Work a single column of dc down each front edge as a neat border.')),
        p(t(`Size M: ${g202m.hemStitches} sts wide, ${g202m.finishedMeasurements.body} cm body. Sleeve ${g202m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g202m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front halves'),
        p(t(`Chain ${g202m.hemStitches + 2} for back. Establish 2x2 rib on row 1. Work for ${g202m.finishedMeasurements.body} cm. Front halves: chain half the back stitch count plus 2, work in same rib.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g202m.sleeveCuffStitches + 2}. Work 2x2 rib, increasing each end every 4 rows for ${g202m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('The cable-effect pullover builds on post-stitch skills to create a more complex cable column pattern.')),
      ],
    },
    grading: g202,
  },
  {
    slug: 'crochet-cable-pullover',
    title: 'Cable-effect pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in aran yarn with an all-over cable-effect pattern made by crossing fpdc columns in pairs. The cables run vertically up the front and back. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g203m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet cable sweater', 'fpdc cable pullover', 'crochet crossover stitch sweater'],
    glossaryTerms: [
      { slug: 'fpdc-cross-g203', term: 'Fpdc cross-over cable', definition: 'A cable effect made by skipping the next fpdc post and working an fpdc around the post two stitches ahead, then going back to work an fpdc around the skipped post. The two posts cross on the fabric surface to mimic a knitted cable twist.' },
      { slug: 'bpdc-g203', term: 'Back post double crochet', definition: 'A dc worked around the post from behind. In the cable pattern, bpdc columns separate the fpdc cables and recede into the background to let the cables stand out.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Cable-effect crochet pullovers using fpdc crossover technique are a popular intermediate garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Set up the '), gt('fpdc-cross-g203', 'fpdc cross-over cable'), t(' pattern across the body: work pairs of fpdc cables every 6 stitches, separated by pairs of '), gt('bpdc-g203', 'bpdc'), t('. On the cable row (every 6 rows), skip the first fpdc and work fpdc around the second, then fpdc around the first to cross. Work bpdc over bpdc throughout.')),
        p(t(`Size M: ${g203m.hemStitches} sts wide, ${g203m.finishedMeasurements.body} cm body. Sleeve ${g203m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g203m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front'),
        p(t(`Chain ${g203m.hemStitches + 2}. Establish cable repeat on row 1. Cable-cross every 6th row. Work for ${g203m.finishedMeasurements.body} cm. Shape neck. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g203m.sleeveCuffStitches + 2}. Work cable repeat, increasing each end every 4 rows for ${g203m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('The cable-effect open cardigan uses the same cable repeat opened down the centre front.')),
      ],
    },
    grading: g203,
  },
  {
    slug: 'crochet-cable-cardigan',
    title: 'Cable-effect open cardigan',
    subtitle: '',
    excerpt: 'A drop-shoulder open cardigan in aran yarn with a cable-effect pattern of crossing fpdc columns across the back and front halves. Worn open without fastenings. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g204m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet cable cardigan', 'open front cable crochet jacket', 'crochet crossover cardigan'],
    glossaryTerms: [
      { slug: 'fpdc-cross-g204', term: 'Fpdc cross-over cable', definition: 'A cable made by skipping the next fpdc post, working fpdc around the post two stitches ahead, then going back to work fpdc around the skipped post. The posts cross on the surface to simulate a cable twist.' },
      { slug: 'open-front-g204', term: 'Open front', definition: 'A cardigan worn without buttons or fastenings. The two front halves hang free and overlap slightly at the hem when worn. A dc border along each front edge keeps the fabric from curling.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Cable-effect open-front cardigans in aran weight are a popular post-stitch garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work back and two front halves in '), gt('fpdc-cross-g204', 'fpdc cross-over cable'), t(' repeat throughout. The '), gt('open-front-g204', 'open front'), t(' needs no fastenings. Work a single dc border down each front edge. Seam shoulders. Set in sleeves. Seam sides and undersleeves.')),
        p(t(`Size M: ${g204m.hemStitches} sts wide back, ${g204m.finishedMeasurements.body} cm body. Sleeve ${g204m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g204m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front halves'),
        p(t(`Chain ${g204m.hemStitches + 2} for back. Front halves: chain ${Math.round(g204m.hemStitches / 2) + 2} each. Establish cable repeat. Cable-cross every 6th row. Work for ${g204m.finishedMeasurements.body} cm.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g204m.sleeveCuffStitches + 2}. Work cable repeat, increasing each end every 4 rows for ${g204m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('Try the aran-style multi-cable cardigan next. It stacks more cable panels across the front.')),
      ],
    },
    grading: g204,
  },
  {
    slug: 'crochet-waffle-stitch-pullover',
    title: 'Waffle-stitch pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in aran yarn worked in waffle stitch. Alternating dc and fpdc in a grid pattern create a deep, square-pitted texture across the front and back. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g205m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet waffle stitch sweater', 'waffle texture pullover crochet', 'textured crochet jumper'],
    glossaryTerms: [
      { slug: 'waffle-stitch-g205', term: 'Waffle stitch', definition: 'A post-stitch texture worked by alternating dc and fpdc across a row, then working bpdc over the fpdc and dc over the dc on the next row. The offset creates recessed squares that resemble a waffle grid.' },
      { slug: 'fpdc-g205', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. In waffle stitch, fpdc creates the raised ribs that border each recessed square in the grid.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Waffle-stitch pullovers in aran weight are a popular textured garment project using simple post-stitch technique.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Establish the '), gt('waffle-stitch-g205', 'waffle stitch'), t(' repeat across the first row: dc, '), gt('fpdc-g205', 'fpdc'), t(', alternate to end. On the following row, work bpdc over each fpdc and dc over each dc. On the third row, swap fpdc and dc positions to offset the grid by one stitch. Repeat these three rows to build up the waffle texture.')),
        p(t(`Size M: ${g205m.hemStitches} sts wide, ${g205m.finishedMeasurements.body} cm body. Sleeve ${g205m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g205m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front'),
        p(t(`Chain ${g205m.hemStitches + 2}. Row 1: dc, fpdc alternate. Rows 2 and 3: as described above. Repeat 3-row set for ${g205m.finishedMeasurements.body} cm. Shape neck at front. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g205m.sleeveCuffStitches + 2}. Work waffle stitch, increasing each end every 4 rows for ${g205m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('The basket-weave pullover uses the same post-stitch idea but works larger blocks to build a woven look.')),
      ],
    },
    grading: g205,
  },
  {
    slug: 'crochet-bobble-yoke-pullover',
    title: 'Bobble-yoke pullover',
    subtitle: '',
    excerpt: 'A top-down yoke pullover in aran yarn with a bobble-textured yoke section. The yoke is worked in rounds from the neck down, with bobble clusters formed from grouped fpdc to create a raised dot pattern. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g206m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet bobble yoke sweater', 'top down crochet pullover bobble', 'crochet textured yoke pullover'],
    glossaryTerms: [
      { slug: 'bobble-yoke-g206', term: 'Bobble cluster', definition: 'A cluster of five fpdc all worked into the same post, then closed together at the top. The grouped posts push outward to form a rounded bobble on the fabric surface. Used here across the yoke section only.' },
      { slug: 'yoke-increases-g206', term: 'Yoke increases', definition: 'Regular increase rounds worked throughout the yoke section to add stitches evenly as the circumference expands from neck to underarm. Increases are placed at four fixed points to keep the yoke balanced.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Top-down yoke pullovers with bobble or textured yoke sections are a popular seamless garment construction.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Cast on at the neck and work the yoke in rounds. Begin '), gt('yoke-increases-g206', 'yoke increases'), t(' every other round at four points while simultaneously placing '), gt('bobble-yoke-g206', 'bobble clusters'), t(' at regular intervals across each non-increase round. Once the yoke reaches the underarm, split for sleeves and continue body in plain dc. Work sleeves separately in rounds with a dc cuff.')),
        p(t(`Size M: yoke depth approx 22 cm. Body circumference ${g206m.finishedMeasurements.bust} cm. Body length ${g206m.finishedMeasurements.body} cm from underarm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g206m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Yoke'),
        p(t('Chain 64 and join in round for neck. Work increase rounds every other round. Place bobble clusters on alternate rounds evenly spaced. Continue for approx 22 cm yoke depth.')),
        h2('Body'),
        p(t('Separate sleeves onto stitch holders. Work body in dc in round for the remaining body length. Work 3 cm dc hem.')),
        h2('Sleeves (make 2)'),
        p(t('Pick up sleeve stitches. Work in dc in round, decreasing slightly toward the cuff. Work 4 cm dc cuff.')),
        h2('What to try next'),
        p(t('The diamond cable vest uses fpdc panel work to build a single centred cable motif as the focal point.')),
      ],
    },
    grading: g206,
  },
  {
    slug: 'crochet-diamond-cable-vest',
    title: 'Diamond cable vest',
    subtitle: '',
    excerpt: 'A drop-shoulder vest in aran yarn with a diamond cable panel down the centre front. The panel is formed from fpdc worked at angles to trace a diamond outline. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g207m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet diamond cable vest', 'crochet panel vest', 'fpdc diamond vest crochet'],
    glossaryTerms: [
      { slug: 'diamond-panel-g207', term: 'Diamond cable panel', definition: 'A vertical panel on the centre front in which fpdc posts are arranged to trace a repeating diamond shape. The outline is formed by crossing pairs of fpdc toward and away from the centre of the panel on alternate rows.' },
      { slug: 'bpdc-ground-g207', term: 'Bpdc background', definition: 'The bpdc stitches surrounding the fpdc diamond panel recede into the fabric surface, providing a textured background that lets the raised diamond stand out clearly.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Vests with a centred cable panel are a popular post-stitch garment project that introduces panel placement.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work the back in plain dc. Work the front with a centred '), gt('diamond-panel-g207', 'diamond cable panel'), t(' flanked by a '), gt('bpdc-ground-g207', 'bpdc background'), t(' on both sides. The diamond panel is 12 stitches wide. Mark the centre of the chain and count 6 stitches to each side to position the panel. Follow the diamond chart: cross fpdc pairs outward for 6 rows, then cross inward for 6 rows to close the diamond. Seam shoulders. Work armhole borders in 2 rounds dc.')),
        p(t(`Size M: ${g207m.hemStitches} sts wide, ${g207m.finishedMeasurements.body} cm body.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g207m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back'),
        p(t(`Chain ${g207m.hemStitches + 2}. Work dc for ${g207m.finishedMeasurements.body} cm. Shape neck and armholes.`)),
        h2('Front'),
        p(t(`Chain ${g207m.hemStitches + 2}. Establish bpdc background with 12-st diamond panel at centre. Work diamond repeat for body height. Shape neck and armholes.`)),
        h2('What to try next'),
        p(t('The aran-style multi-cable cardigan adds more cable panels across the full front for a richer, layered look.')),
      ],
    },
    grading: g207,
  },
  {
    slug: 'crochet-herringbone-pullover',
    title: 'Herringbone dc pullover',
    subtitle: '',
    excerpt: 'A drop-shoulder pullover in aran yarn worked in herringbone double crochet stitch. The angled yarn catches give the fabric a dense, slightly directional texture across the front and back. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g208m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
    aliases: ['herringbone crochet sweater', 'crochet herringbone stitch pullover', 'angled dc texture crochet jumper'],
    glossaryTerms: [
      { slug: 'herringbone-dc-g208', term: 'Herringbone double crochet', definition: 'A modified dc worked by inserting the hook, pulling up a loop, then pulling that loop through the first loop on the hook before completing the stitch as normal. The diagonal movement creates a tight, angled texture that resembles the V-shaped herringbone weave pattern.' },
      { slug: 'fpdc-rib-g208', term: 'Post-stitch rib border', definition: 'A band of alternating fpdc and bpdc at the hem and cuffs. The rib draws in gently and provides a contrast in texture against the herringbone body fabric.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Herringbone dc pullovers are a popular intermediate texture project using a modified dc technique.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Work back and front in '), gt('herringbone-dc-g208', 'herringbone double crochet'), t(' throughout the main body, with a 5 cm '), gt('fpdc-rib-g208', 'post-stitch rib border'), t(' at the hem and sleeve cuffs. Seam at shoulders and sides. Set in sleeves. The herringbone stitch pulls in more than standard dc: add one extra stitch per 5 when casting on to compensate for the tighter horizontal gauge.')),
        p(t(`Size M: ${g208m.hemStitches} sts wide, ${g208m.finishedMeasurements.body} cm body. Sleeve ${g208m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g208m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front'),
        p(t(`Chain ${g208m.hemStitches + 2}. Work 5 cm rib in fpdc/bpdc. Switch to herringbone dc for ${g208m.finishedMeasurements.body - 5} cm. Shape neck. Seam shoulders.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g208m.sleeveCuffStitches + 2}. Work 5 cm rib, then herringbone dc increasing each end every 4 rows for ${g208m.finishedMeasurements.sleeve} cm total.`)),
        h2('What to try next'),
        p(t('The waffle-stitch pullover uses post stitches to build a square-grid texture across the body.')),
      ],
    },
    grading: g208,
  },
  {
    slug: 'crochet-aran-style-cardigan',
    title: 'Aran-style multi-cable cardigan',
    subtitle: '',
    excerpt: 'An advanced drop-shoulder cardigan in aran yarn with multiple cable panels across the back and front halves. Combines fpdc crossover cables, diamond panels, and seed-stitch grounds. Graded XS to 3XL.',
    difficulty: 'ADVANCED',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g209m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['aran crochet cardigan', 'multi-cable crochet cardigan', 'crochet traditional aran jacket'],
    glossaryTerms: [
      { slug: 'aran-panel-layout-g209', term: 'Panel layout', definition: 'The arrangement of different cable types across the width of the back and front pieces. Each panel has a fixed stitch count, and the panels are placed in a fixed order and repeated symmetrically. A stitch diagram or layout chart marks the boundaries between panels before casting on.' },
      { slug: 'seed-stitch-ground-g209', term: 'Seed-stitch ground', definition: 'A background of alternating dc and ch-1 spaces between cable panels. The broken texture of seed stitch recedes visually and provides a clear contrast that helps each cable panel read distinctly.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Aran-style multi-cable cardigans are an advanced crochet garment project that requires careful panel planning.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Plan the '), gt('aran-panel-layout-g209', 'panel layout'), t(' before casting on. This cardigan uses three panel types across the back: an outer fpdc crossover rope cable (8 sts), a central diamond cable (12 sts), and a '), gt('seed-stitch-ground-g209', 'seed-stitch ground'), t(' fill (variable). The front halves each carry one rope cable at the outer edge and a diamond at centre. Work all pieces flat, then seam and add a 2-button band down each front edge.')),
        p(t(`Size M: back ${g209m.hemStitches} sts wide, ${g209m.finishedMeasurements.body} cm body. Sleeve ${g209m.finishedMeasurements.sleeve} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g209m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Buttons, 2 cm', qty: '4' },
        ]),
        h2('Back'),
        p(t(`Chain ${g209m.hemStitches + 2}. Establish panel layout. Work all panels simultaneously for ${g209m.finishedMeasurements.body} cm. Shape neck.`)),
        h2('Front halves'),
        p(t(`Chain ${Math.round(g209m.hemStitches / 2) + 2} each. Establish cable panels. Work for body height. Shape neck. Add button band.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g209m.sleeveCuffStitches + 2}. Work a single rope cable panel at centre sleeve with seed stitch each side, increasing each end every 4 rows for ${g209m.finishedMeasurements.sleeve} cm.`)),
        h2('What to try next'),
        p(t('The diamond cable vest is a good place to start with panel work before moving on to multi-panel designs.')),
      ],
    },
    grading: g209,
  },
  {
    slug: 'crochet-textured-vest-rib-sides',
    title: 'Textured vest with ribbed sides',
    subtitle: '',
    excerpt: 'A drop-shoulder vest in aran yarn with a ribbed vertical panel down the centre front and back, flanked by plain dc panels at the sides. The contrast of rib and dc gives the vest a structured, tidy look. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    terminologyConvention: 'uk',
    primaryYarnWeightSlug: 'aran',
    primaryHookSlug: 'crochet-hook-5-0mm',
    gaugeText: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSizeText: `Graded XS to 3XL. Size M: ${g210m.finishedMeasurements.bust} cm bust.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet vest rib panel', 'crochet panel vest ribbed', 'fpdc rib vest crochet'],
    glossaryTerms: [
      { slug: 'centre-rib-panel-g210', term: 'Centre rib panel', definition: 'A vertical band of 1x1 fpdc/bpdc rib running down the centre third of the front and back. The rib draws in slightly at the centre and provides a visual anchor for the vest silhouette.' },
      { slug: 'dc-side-panel-g210', term: 'Dc side panels', definition: 'Plain double crochet panels on each side of the centre rib. The dc fabric drapes more softly and sits flatter than the rib, creating a contrast in texture and a slight shaping effect at the sides.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Vests combining rib centre panels with plain dc sides are a practical post-stitch garment project.',
    recipeTools: TOOLS,
    body: {
      type: 'doc', content: [
        p(t('Divide each piece into three vertical zones: a plain dc side panel, a '), gt('centre-rib-panel-g210', 'centre rib panel'), t(' in 1x1 fpdc/bpdc, and a second '), gt('dc-side-panel-g210', 'dc side panel'), t('. The rib panel covers the centre third of the stitch count on both front and back. Work all three zones simultaneously on each row. Seam shoulders. Work a 2-round dc armhole border each side.')),
        p(t(`Size M: ${g210m.hemStitches} sts wide, ${g210m.finishedMeasurements.body} cm body. Centre rib: approx ${Math.round(g210m.hemStitches / 3)} sts.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: `${g210m.yarnRequiredYards} yards` },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back and front'),
        p(t(`Chain ${g210m.hemStitches + 2}. Establish three zones: dc, rib (centre ${Math.round(g210m.hemStitches / 3)} sts), dc. Work for ${g210m.finishedMeasurements.body} cm. Shape neck. Seam shoulders.`)),
        h2('Finishing'),
        p(t('Seam sides. Work 2-round dc armhole border. Work 2-round dc neckline border.')),
        h2('What to try next'),
        p(t('The wide-rib cardigan works a 2x2 rib across the full width of the garment for a single all-over texture.')),
      ],
    },
    grading: g210,
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
