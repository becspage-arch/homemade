/**
 * Generator: D-Garments Batch 6 -- Variety garments G51-G60
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch6.ts
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

const g51 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g51m = g51.find(g => g.size === 'M')!

const g52 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'ZERO', garmentType: 'PULLOVER' })
const g52m = g52.find(g => g.size === 'M')!

const g53 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g53m = g53.find(g => g.size === 'M')!

const g54 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_6', garmentType: 'CARDIGAN' })
const g54m = g54.find(g => g.size === 'M')!

const g55 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g55m = g55.find(g => g.size === 'M')!

const g56 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_2', garmentType: 'VEST' })
const g56m = g56.find(g => g.size === 'M')!

const g57 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g57m = g57.find(g => g.size === 'M')!

const g58 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g58m = g58.find(g => g.size === 'M')!

const g59 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g59m = g59.find(g => g.size === 'M')!

const g60 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g60m = g60.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'lacy-open-stitch-pullover',
  title: 'Lacy open-stitch pullover',
  suffix: 'G51',
  excerpt: 'A lightweight drop-shoulder pullover in DK with an open lacy stitch pattern. Drop-shoulder construction. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK. Lacy stitch gauge: 18 sts = 10 cm.',
  finishedSize: `Graded XS to 3XL. Size M: ${g51m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['lacy pullover crochet', 'open stitch sweater', 'dk lace top crochet'],
  glossaryTerms: [
    { slug: 'open-stitch-g51', term: 'Open stitch pattern', definition: 'A repeat that includes chains and spaces between solid stitch groups. Creates a fabric with a light, airy look that shows through.' },
    { slug: 'treble-g51', term: 'Treble crochet', definition: 'A tall stitch with two yarn-overs. Trebles in an open stitch pattern create the taller elements between chain spaces.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open-stitch lacy pullovers are a popular DK garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work an '), gt('open-stitch-g51', 'open stitch pattern'), t(' throughout the body. The repeat alternates '), gt('treble-g51', 'treble'), t(' groups with chain spaces. Both back and front panels use the same lacy stitch. Sleeves are worked in plain dc for structure at the arm.')),
      p(t(`Size M: ${g51m.hemStitches} sts wide (adjust to match stitch repeat), ${g51m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g51m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t('Chain to multiple of stitch repeat. Work open stitch pattern rows for '), t(`${g51m.finishedMeasurements.body} cm`), t('. Shape neck opening.')),
      h2('Sleeves'),
      p(t('Work plain dc sleeves. Increase to bicep stitches and work to sleeve length.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same build in plain dc.')),
    ],
  },
},
{
  slug: 'cropped-crochet-pullover',
  title: 'Cropped crochet pullover',
  suffix: 'G52',
  excerpt: 'A short cropped pullover ending at the waist in aran yarn. Drop-shoulder construction. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g52m.finishedMeasurements.bust} cm bust, body cropped to approx. 38 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cropped pullover crochet', 'waist length sweater crochet', 'crop top crochet'],
  glossaryTerms: [
    { slug: 'cropped-length-g52', term: 'Cropped length', definition: 'A body length ending at or above the natural waist. Typically 35 to 40 cm from shoulder to hem.' },
    { slug: 'dc2tog-g52', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the neckline at the top of each piece.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cropped pullovers are a modern fashion garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the same as a classic drop-shoulder pullover but stop the body at '), gt('cropped-length-g52', 'cropped length'), t(': approximately 38 cm from the hem. Use '), gt('dc2tog-g52', 'dc2tog'), t(' at the neck opening.')),
      p(t(`Size M: ${g52m.hemStitches} sts wide, body 38 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '300 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g52m.hemStitches + 2}. Work dc rows for 38 cm. Shape neck with `), gt('dc2tog-g52', 'dc2tog'), t('. Fasten off.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same build at standard hip length.')),
    ],
  },
},
{
  slug: 'long-oversized-cardigan',
  title: 'Long oversized cardigan',
  subtitle: 'A below-hip open cardigan in aran yarn.',
  suffix: 'G53',
  excerpt: 'A long, below-hip open cardigan in aran yarn. Very oversized for a cosy wrap effect. No buttons. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g53m.finishedMeasurements.bust} cm bust, ${g53m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['long cardigan crochet', 'below hip cardigan', 'oversized open cardigan'],
  glossaryTerms: [
    { slug: 'wrap-cardigan-g53', term: 'Wrap cardigan', definition: 'A very oversized open cardigan with no buttons. The front edges drape open or can be belted. Length falls at or below the hip.' },
    { slug: 'dc2tog-g53', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the V-neck at the top of the front pieces.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Long open cardigans are a popular modern fashion garment.',
  body: {
    type: 'doc', content: [
      p(t('Work a back and two front panels to '), gt('wrap-cardigan-g53', 'wrap cardigan'), t(' length. Use '), gt('dc2tog-g53', 'dc2tog'), t(' for the front neck shaping. No button bands are needed. Seam at shoulders and sides.')),
      p(t(`Size M: body ${g53m.finishedMeasurements.body} cm. Each front panel is half the back width.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g53m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g53m.hemStitches + 2}. Work dc for ${g53m.finishedMeasurements.body} cm.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g53m.hemStitches / 2) + 2}. Work dc for ${Math.round(g53m.finishedMeasurements.body * 0.85)} cm. `), gt('dc2tog-g53', 'Dc2tog'), t(' at neck edge for 5 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan is the same shape at standard hip length with buttons.')),
    ],
  },
},
{
  slug: 'belted-cardigan',
  title: 'Belted cardigan',
  subtitle: 'A drop-shoulder cardigan worn with a matching crochet belt.',
  suffix: 'G54',
  excerpt: 'A drop-shoulder cardigan in aran yarn worn with a 5 cm wide crochet belt. The belt is worked separately. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g54m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['belted cardigan crochet', 'crochet cardigan with belt', 'wrap belt cardigan'],
  glossaryTerms: [
    { slug: 'crochet-belt-g54', term: 'Crochet belt', definition: 'A narrow ribbed strip worked in 1x1 rib and long enough to wrap the waist. Fastens with a D-ring or large button.' },
    { slug: 'fpdc-g54', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. Used in the 1x1 rib belt strip.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Belted cardigans are a popular modern garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the cardigan as a plain drop-shoulder open cardigan. Work the '), gt('crochet-belt-g54', 'crochet belt'), t(' separately as a 5 cm wide 1x1 rib strip using '), gt('fpdc-g54', 'fpdc'), t(' and bpdc, long enough to wrap the waist.')),
      p(t(`Size M: belt is ${g54m.finishedMeasurements.bust + 20} cm long. Fasten with a 4 cm D-ring or large button.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g54m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '4 cm D-ring', qty: '1' },
      ]),
      h2('Cardigan'),
      p(t('Work back, two front halves, and sleeves the same as the classic drop-shoulder cardigan. Seam.')),
      h2('Belt'),
      p(t('Chain 9. Work 1x1 rib ('), gt('fpdc-g54', 'fpdc'), t('/bpdc) for waist length. Thread through D-ring. Fasten off.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan is the same base without the belt.')),
    ],
  },
},
{
  slug: 'short-sleeve-cardigan',
  title: 'Short-sleeve cardigan',
  subtitle: 'A drop-shoulder cardigan with short 20 cm sleeves in DK yarn.',
  suffix: 'G55',
  excerpt: 'A short-sleeve open cardigan in DK yarn. The same drop-shoulder cardigan construction but with sleeves cut at 20 cm. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g55m.finishedMeasurements.bust} cm bust, 20 cm sleeves.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['short sleeve cardigan crochet', 'summer cardigan crochet', 'short sleeve crochet jacket'],
  glossaryTerms: [
    { slug: 'short-sleeve-g55', term: 'Short sleeve', definition: 'A sleeve ending above the elbow, typically 18 to 25 cm from the underarm. Suited to warmer months in DK cotton.' },
    { slug: 'dc2tog-g55', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the neck at the front edges.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Short-sleeve cardigans are a warm-weather garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work a standard drop-shoulder cardigan in DK yarn. Work the sleeves as '), gt('short-sleeve-g55', 'short sleeves'), t(', stopping at 20 cm. Use '), gt('dc2tog-g55', 'dc2tog'), t(' at the front neck edges. Add a dc button band along both front edges.')),
      p(t(`Size M: ${g55m.hemStitches} sts wide, ${g55m.finishedMeasurements.body} cm body, 20 cm short sleeves.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g55m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '5' },
      ]),
      h2('Body'),
      p(t(`Chain ${g55m.hemStitches + 2}. Work dc for ${g55m.finishedMeasurements.body} cm. Front halves each ${Math.round(g55m.hemStitches / 2)} sts wide with `), gt('dc2tog-g55', 'dc2tog'), t(' at neck.')),
      h2('Short sleeves (make 2)'),
      p(t('Chain to cuff sts. Work dc for 20 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan uses the same build with full-length sleeves.')),
    ],
  },
},
{
  slug: 'sleeveless-open-cardigan',
  title: 'Sleeveless open cardigan',
  subtitle: 'A sleeveless open-front cardigan vest in DK yarn.',
  suffix: 'G56',
  excerpt: 'A sleeveless open-front cardigan in DK yarn. Front panels open, no buttons. Armholes finished with dc edging. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g56m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['sleeveless cardigan crochet', 'crochet vest cardigan', 'open vest crochet'],
  glossaryTerms: [
    { slug: 'armhole-edging-g56', term: 'Armhole edging', definition: 'A round of dc worked around the armhole opening after seaming. Gives a neat finished edge where the sleeve would otherwise attach.' },
    { slug: 'dc2tog-g56', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the front neck edges for shaping.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Sleeveless open cardigans are a popular layering garment.',
  body: {
    type: 'doc', content: [
      p(t('Work the same as a drop-shoulder cardigan without the sleeves. After seaming, work '), gt('armhole-edging-g56', 'armhole edging'), t(' around each armhole opening. Use '), gt('dc2tog-g56', 'dc2tog'), t(' at the front neck edges.')),
      p(t(`Size M: back ${g56m.hemStitches} sts, body ${g56m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g56m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g56m.hemStitches + 2}. Work dc for ${g56m.finishedMeasurements.body} cm.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g56m.hemStitches / 2) + 2}. Work dc. Apply `), gt('dc2tog-g56', 'dc2tog'), t(' at neck edge. Seam shoulders and sides.')),
      h2('Armhole edging'),
      p(t('Work 1 round of '), gt('armhole-edging-g56', 'dc edging'), t(' around each armhole.')),
      h2('What to try next'),
      p(t('The short-sleeve cardigan adds sleeves to the same open-front body.')),
    ],
  },
},
{
  slug: 'asymmetric-hem-pullover',
  title: 'Asymmetric hem pullover',
  suffix: 'G57',
  excerpt: 'A drop-shoulder pullover with a high-low hem in aran yarn. The front hem is 8 cm shorter than the back hem. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g57m.finishedMeasurements.bust} cm bust. Front hem 8 cm shorter than back.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['high low hem pullover crochet', 'asymmetric hem sweater', 'crochet dip hem pullover'],
  glossaryTerms: [
    { slug: 'high-low-hem-g57', term: 'High-low hem', definition: 'A hem where the front panel is cut shorter than the back panel. The difference creates a dipped effect at the sides.' },
    { slug: 'dc2tog-g57', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck shaping on the front panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'High-low hem garments are a modern fashion style.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and sleeves as for a classic drop-shoulder pullover. For the front, work 8 cm fewer rows to create a '), gt('high-low-hem-g57', 'high-low hem'), t('. Use '), gt('dc2tog-g57', 'dc2tog'), t(' at the neck opening.')),
      p(t(`Size M: back ${g57m.finishedMeasurements.body} cm body, front ${g57m.finishedMeasurements.body - 8} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g57m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g57m.hemStitches + 2}. Work dc for ${g57m.finishedMeasurements.body} cm. Shape neck. Fasten off.`)),
      h2('Front'),
      p(t(`Chain ${g57m.hemStitches + 2}. Work dc for ${g57m.finishedMeasurements.body - 8} cm. Shape neck with `), gt('dc2tog-g57', 'dc2tog'), t('. Fasten off.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses matching front and back lengths.')),
    ],
  },
},
{
  slug: 'colour-block-pullover',
  title: 'Colour block pullover',
  suffix: 'G58',
  excerpt: 'A drop-shoulder pullover in two contrasting colours split at the waist. The body lower half is one colour and the upper half another. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g58m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['colour block sweater crochet', 'two colour pullover crochet', 'blocked jumper crochet'],
  glossaryTerms: [
    { slug: 'colour-join-g58', term: 'Colour join', definition: 'Switching from one yarn colour to another at the start of a new row. On the right side, always join at the end of the last old-colour stitch.' },
    { slug: 'dc2tog-g58', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Colour block garments are a classic fashion style applied to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work the lower half of the body in colour A for '), t(`${Math.round(g58m.finishedMeasurements.body / 2)} cm`), t('. Switch colours with a '), gt('colour-join-g58', 'colour join'), t(' and continue the upper half in colour B. Sleeves can be a single colour or also split. Use '), gt('dc2tog-g58', 'dc2tog'), t(' at the neckline.')),
      p(t(`Size M: ${g58m.hemStitches} sts wide. Lower half ${Math.round(g58m.finishedMeasurements.body / 2)} cm in A, upper half in B.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn, colour A', qty: `${Math.round(g58m.yarnRequiredYards / 2)} yards` },
        { name: 'Aran yarn, colour B', qty: `${Math.round(g58m.yarnRequiredYards / 2)} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Work lower ${Math.round(g58m.finishedMeasurements.body / 2)} cm in colour A. `), gt('colour-join-g58', 'Join colour B'), t(`. Work upper ${Math.round(g58m.finishedMeasurements.body / 2)} cm. Shape neck.`)),
      h2('What to try next'),
      p(t('The striped pullover uses the same two-colour approach with alternating stripes.')),
    ],
  },
},
{
  slug: 'horizontal-stripe-pullover',
  title: 'Horizontal stripe pullover',
  suffix: 'G59',
  excerpt: 'A drop-shoulder pullover with 5 cm horizontal stripes in two colours. Each stripe is 8 rows. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g59m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['striped pullover crochet', 'stripe sweater crochet', 'horizontal stripe jumper crochet'],
  glossaryTerms: [
    { slug: 'stripe-join-g59', term: 'Stripe colour change', definition: 'Switching yarn colour at the start of a new row. Carry the unused colour up the side edge to avoid too many ends to weave in.' },
    { slug: 'dc2tog-g59', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the neck opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Striped pullovers are a classic garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the body in 8-row stripes, alternating colour A and colour B. At each '), gt('stripe-join-g59', 'stripe colour change'), t(', carry the unused yarn up the side edge. Use '), gt('dc2tog-g59', 'dc2tog'), t(' to shape the neck.')),
      p(t(`Size M: ${g59m.hemStitches} sts wide, ${g59m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn, colour A', qty: `${Math.round(g59m.yarnRequiredYards / 2)} yards` },
        { name: 'Aran yarn, colour B', qty: `${Math.round(g59m.yarnRequiredYards / 2)} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain ${g59m.hemStitches + 2}. Work 8 rows colour A, `), gt('stripe-join-g59', '8 rows colour B'), t('. Repeat to full body length. Shape neck.')),
      h2('What to try next'),
      p(t('The colour block pullover uses the same two-colour approach in a single large split.')),
    ],
  },
},
{
  slug: 'cable-texture-yoke-pullover',
  title: 'Cable-texture yoke pullover',
  suffix: 'G60',
  excerpt: 'A seamless top-down yoke pullover with a post-stitch cable texture band at the yoke in aran yarn. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g60m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['cable yoke pullover crochet', 'post stitch yoke sweater', 'crochet texture yoke jumper'],
  glossaryTerms: [
    { slug: 'fpdc-cable-g60', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. Creates raised ribs. Working fpdc out of sequence creates the look of a twisted cable.' },
    { slug: 'bpdc-cable-g60', term: 'Back post double crochet', definition: 'A dc around the post from the back. The recessed counterpart to fpdc in the cable texture band.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Post-stitch cable texture in yoke garments is a popular modern crochet design.',
  body: {
    type: 'doc', content: [
      p(t('Work the top-down circular yoke the same as the standard yoke pullover. In the lower half of the yoke section, insert a 6-round band of '), gt('fpdc-cable-g60', 'fpdc'), t(' and '), gt('bpdc-cable-g60', 'bpdc'), t(' cable texture. The body and sleeves are worked in plain dc.')),
      p(t(`Size M: yoke ${g60m.yokeDepthRows} rows total, cable band in rows 5 to 10.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g60m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g60m.neckStitches} sts. Work plain dc for 4 rounds. Cable band: 6 rounds of `), gt('fpdc-cable-g60', 'fpdc'), t('/'), gt('bpdc-cable-g60', 'bpdc'), t(' alternating. Continue plain dc to underarm.')),
      h2('Body and sleeves'),
      p(t(`Separate ${g60m.sleeveBicepStitches} sleeve sts each side. Work body in round to ${g60m.finishedMeasurements.body} cm. Work sleeves to ${g60m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t('The top-down yoke pullover uses the same yoke structure in plain dc.')),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: (pat as any).subtitle ?? '',
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
