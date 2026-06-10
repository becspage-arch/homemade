/**
 * Generator: D-Garments Batch 10 -- Winter/seasonal garments G91-G100
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch10.ts
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

const g91 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g91m = g91.find(g => g.size === 'M')!

const g92 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g92m = g92.find(g => g.size === 'M')!

const g93 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g93m = g93.find(g => g.size === 'M')!

const g94 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'GENEROUS_15', garmentType: 'PULLOVER' })
const g94m = g94.find(g => g.size === 'M')!

const g95 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g95m = g95.find(g => g.size === 'M')!

const g96 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g96m = g96.find(g => g.size === 'M')!

const g97 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'POSITIVE_6', garmentType: 'PULLOVER' })
const g97m = g97.find(g => g.size === 'M')!

const g98 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g98m = g98.find(g => g.size === 'M')!

const g99 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g99m = g99.find(g => g.size === 'M')!

const g100 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g100m = g100.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'chunky-rib-pullover-crochet',
  title: 'Chunky ribbed pullover',
  excerpt: 'A warm drop-shoulder pullover in super bulky yarn worked in 1x1 rib throughout. Fast to work up in fpdc/bpdc rib. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-bulky',
  hook: 'crochet-hook-10-0mm',
  gauge: '10 sts x 12 rows = 10 x 10 cm in super bulky on a 10 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g91m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['chunky rib sweater crochet', 'bulky ribbed pullover crochet', 'super bulky sweater crochet'],
  glossaryTerms: [
    { slug: 'super-bulky-g91', term: 'Super bulky yarn', definition: 'A weight 6 yarn with a recommended gauge of around 8 to 12 stitches per 10 cm. Works up very quickly and creates a thick, warm fabric.' },
    { slug: 'fpdc-g91', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. Alternating fpdc and bpdc creates the raised and recessed columns of 1x1 rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Chunky ribbed pullovers are a popular quick crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Use '), gt('super-bulky-g91', 'super bulky yarn'), t(' and a 10 mm hook. Work the body and sleeves in 1x1 rib: alternating '), gt('fpdc-g91', 'fpdc'), t(' and bpdc across every row. The rib stretch means sizing down by one size gives a close fit.')),
      p(t(`Size M: ${g91m.hemStitches} sts wide, ${g91m.finishedMeasurements.body} cm body. Sleeve ${g91m.finishedMeasurements.sleeve} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Super bulky yarn', qty: `${g91m.yarnRequiredYards} yards` },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g91m.hemStitches + 2}. Work 1x1 rib (`), gt('fpdc-g91', 'fpdc'), t('/bpdc) for ${g91m.finishedMeasurements.body} cm. Shape neck.')),
      h2('What to try next'),
      p(t('The fitted ribbed pullover uses the same rib throughout in aran weight for a more everyday fabric weight.')),
    ],
  },
},
{
  slug: 'chunky-cardigan-crochet',
  title: 'Chunky open cardigan',
  excerpt: 'A drop-shoulder open-front cardigan in super bulky yarn. No buttons, deep chunky warmth. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-bulky',
  hook: 'crochet-hook-10-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in super bulky on a 10 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g92m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['chunky open cardigan crochet', 'bulky oversized cardigan', 'super bulky crochet jacket'],
  glossaryTerms: [
    { slug: 'bulky-ease-g92', term: 'Bulky ease', definition: 'Super bulky yarn adds physical thickness to the fabric. To avoid a stiff, box-like result the pattern uses negative ease at the shoulders so the bulked-up fabric still falls well.' },
    { slug: 'dc2tog-g92', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the front necklines to shape the V neck opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Chunky cardigans are a popular cosy winter crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Work a standard open-front drop-shoulder cardigan in super bulky yarn. Account for '), gt('bulky-ease-g92', 'bulky ease'), t(' by working the pattern with slightly fewer sts than a standard-weight version. Use '), gt('dc2tog-g92', 'dc2tog'), t(' at the neck edges.')),
      p(t(`Size M: ${g92m.hemStitches} sts wide, ${g92m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Super bulky yarn', qty: `${g92m.yarnRequiredYards} yards` },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g92m.hemStitches + 2}. Work dc for ${g92m.finishedMeasurements.body} cm.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g92m.hemStitches / 2) + 2}. Work dc. Shape neck with `), gt('dc2tog-g92', 'dc2tog'), t('. Fasten off.')),
      h2('What to try next'),
      p(t('The chunky ribbed pullover uses the same super bulky yarn weight with a ribbed texture.')),
    ],
  },
},
{
  slug: 'chunky-seamless-yoke-crochet',
  title: 'Chunky seamless yoke pullover',
  excerpt: 'A top-down seamless yoke pullover in super bulky yarn. Worked in one piece from the neck down. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'super-bulky',
  hook: 'crochet-hook-10-0mm',
  gauge: '10 dc x 12 rounds = 10 x 10 cm in super bulky on a 10 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g93m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['chunky seamless yoke crochet', 'super bulky one piece pullover', 'bulky top down sweater'],
  glossaryTerms: [
    { slug: 'yoke-increases-g93', term: 'Yoke increase rounds', definition: 'Evenly-spaced increases worked at 4 or 8 marked points around the circular yoke to expand it from neck width to chest width. In super bulky, each increase round adds significant width quickly.' },
    { slug: 'steek-g93', term: 'Sleeve separation', definition: 'The point in the top-down yoke where sleeve stitches are placed on holders and the body continues in round. The sleeve stitches are picked up later to work each sleeve tube.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down seamless yoke garments are a popular modern crochet construction.',
  body: {
    type: 'doc', content: [
      p(t('Work the neck in round. Use '), gt('yoke-increases-g93', 'yoke increases'), t(' at 4 marked points every other round until the yoke reaches underarm depth. At '), gt('steek-g93', 'sleeve separation'), t(', place sleeve sts on holders and join the body in round.')),
      p(t(`Size M: start ${g93m.neckStitches} sts. Separate ${g93m.sleeveBicepStitches} sleeve sts each side at underarm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Super bulky yarn', qty: `${g93m.yarnRequiredYards} yards` },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g93m.neckStitches} sts in round. Work `), gt('yoke-increases-g93', 'increase rounds'), t(` every other round for ${g93m.yokeIncreaseRows} rounds.`)),
      h2('Body'),
      p(t(`Place ${g93m.sleeveBicepStitches} sleeve sts on holder each side. Work body in round for ${g93m.finishedMeasurements.body} cm.`)),
      h2('What to try next'),
      p(t('The standard top-down yoke pullover uses the same construction in aran weight.')),
    ],
  },
},
{
  slug: 'ski-style-pullover-crochet',
  title: 'Ski-style pullover',
  excerpt: 'A warm oversized pullover in super bulky yarn with a deep ribbed yoke band for warmth at the chest. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'super-bulky',
  hook: 'crochet-hook-10-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in super bulky on a 10 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g94m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['ski pullover crochet', 'chunky apres ski jumper', 'warm ribbed yoke sweater'],
  glossaryTerms: [
    { slug: 'yoke-rib-g94', term: 'Ribbed yoke band', definition: 'A horizontal band of 1x1 fpdc/bpdc rib worked across the upper chest of the pullover. Adds extra warmth at the chest without a full-yoke construction.' },
    { slug: 'fpdc-g94', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. Paired with bpdc to form the rib columns in the yoke band.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Ski-style warm pullovers are a classic winter garment type.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and front as flat dc panels. In the upper 10 cm of the body (below the neck shaping), work a '), gt('yoke-rib-g94', 'ribbed yoke band'), t(' in '), gt('fpdc-g94', 'fpdc'), t('/bpdc 1x1 rib. This band adds chest warmth and visual interest.')),
      p(t(`Size M: ${g94m.hemStitches} sts wide, ${g94m.finishedMeasurements.body} cm body. Rib band: 10 cm at chest.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Super bulky yarn', qty: `${g94m.yarnRequiredYards} yards` },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g94m.hemStitches + 2}. Work dc for ${g94m.finishedMeasurements.body - 10} cm. Switch to `), gt('yoke-rib-g94', 'rib band'), t(` for 10 cm. Shape neck.`)),
      h2('What to try next'),
      p(t('The chunky seamless yoke pullover builds the yoke as a full top-down construction in the same yarn weight.')),
    ],
  },
},
{
  slug: 'chunky-vest-crochet',
  title: 'Chunky vest',
  excerpt: 'A sleeveless vest in super bulky yarn for layering over winter shirts. Drop-shoulder shape with armhole edging. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-bulky',
  hook: 'crochet-hook-10-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in super bulky on a 10 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g95m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['chunky vest crochet', 'super bulky sleeveless vest', 'thick vest crochet'],
  glossaryTerms: [
    { slug: 'armhole-edging-g95', term: 'Armhole edging', definition: 'A round of dc around the armhole after seaming. Creates a neat edge and keeps the bulky yarn from rolling outward at the opening.' },
    { slug: 'dc2tog-g95', term: 'Dc2tog', definition: 'Double crochet two together. Used to reduce the neck opening on both front and back panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Chunky layering vests are a popular winter crochet project.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels in plain dc. Seam shoulders and sides. Work '), gt('armhole-edging-g95', 'armhole edging'), t(' around each opening. Use '), gt('dc2tog-g95', 'dc2tog'), t(' to shape neck on both panels.')),
      p(t(`Size M: ${g95m.hemStitches} sts wide, ${g95m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Super bulky yarn', qty: `${g95m.yarnRequiredYards} yards` },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g95m.hemStitches + 2}. Work dc for ${g95m.finishedMeasurements.body} cm. `), gt('dc2tog-g95', 'Dc2tog'), t(' for neck shaping. Seam. Add armhole edging.')),
      h2('What to try next'),
      p(t('The chunky cardigan is the same body with an open front and full-length sleeves.')),
    ],
  },
},
{
  slug: 'hooded-cardigan-crochet',
  title: 'Hooded cardigan',
  excerpt: 'A drop-shoulder cardigan with an attached crochet hood in aran yarn. The hood is worked separately and seamed to the neck. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g96m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['hooded cardigan crochet', 'crochet hoodie pattern', 'cardigan with hood crochet'],
  glossaryTerms: [
    { slug: 'crochet-hood-g96', term: 'Crochet hood', definition: 'A deep panel worked in dc, folded in half and seamed at the top, then attached around the neck opening of the cardigan by whip stitch.' },
    { slug: 'dc2tog-g96', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the hood sides for a close fit around the face.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Hooded cardigans are a popular casual garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the cardigan body and sleeves as a standard drop-shoulder cardigan. Work the '), gt('crochet-hood-g96', 'hood'), t(' as a 40 x 35 cm dc rectangle. Fold in half lengthwise and seam the top. Attach to the neck opening by whip stitch. Use '), gt('dc2tog-g96', 'dc2tog'), t(' to shape the front neck edges of the cardigan.')),
      p(t(`Size M: ${g96m.hemStitches} sts wide, ${g96m.finishedMeasurements.body} cm body. Hood: 80 sts wide x 35 cm tall.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g96m.yarnRequiredYards + 100} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons', qty: '4' },
      ]),
      h2('Cardigan body'),
      p(t('Work back and two front halves. Seam. Work sleeves.')),
      h2('Hood'),
      p(t('Chain 82. Work dc for 35 cm. Fold. Seam top. Attach to neck.')),
      h2('What to try next'),
      p(t('The pocket cardigan uses the same drop-shoulder base with patch pockets instead of a hood.')),
    ],
  },
},
{
  slug: 'v-neck-chunky-pullover-crochet',
  title: 'V-neck chunky pullover',
  excerpt: 'A drop-shoulder pullover with a deep V-neck in super bulky yarn. Fast knit-lookalike in chunky dc. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-bulky',
  hook: 'crochet-hook-10-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in super bulky on a 10 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g97m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['v neck chunky pullover crochet', 'bulky v neck sweater crochet', 'super bulky v neck jumper'],
  glossaryTerms: [
    { slug: 'v-neck-shaping-g97', term: 'V-neck shaping', definition: 'Dividing the front at the centre and decreasing 1 stitch at the neck edge every 2 rows on each half. The longer the decrease run, the deeper the V.' },
    { slug: 'dc2tog-g97', term: 'Dc2tog', definition: 'Double crochet two stitches together. The decrease used at the neck edge to shape the V.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'V-neck pullovers are a classic garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work back in plain dc. For the front, work to the height of the V opening start, then divide and apply '), gt('v-neck-shaping-g97', 'V-neck shaping'), t(' using '), gt('dc2tog-g97', 'dc2tog'), t(' every 2 rows at the neck edge until the shoulder width is reached.')),
      p(t(`Size M: ${g97m.hemStitches} sts wide, ${g97m.finishedMeasurements.body} cm body. V starts 20 cm below shoulder.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Super bulky yarn', qty: `${g97m.yarnRequiredYards} yards` },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g97m.hemStitches + 2}. Work dc for ${g97m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front'),
      p(t(`Chain ${g97m.hemStitches + 2}. Work dc for ${g97m.finishedMeasurements.body - 20} cm. Divide. Apply `), gt('dc2tog-g97', 'dc2tog'), t(' at each neck edge for 20 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same build with a standard crew neck.')),
    ],
  },
},
{
  slug: 'lattice-stitch-pullover-crochet',
  title: 'Lattice stitch pullover',
  excerpt: 'A drop-shoulder pullover in a lattice cross-stitch pattern in aran yarn. The lattice is formed by crossed dc pairs. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g98m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['lattice stitch pullover crochet', 'crossed stitch sweater crochet', 'diamond mesh jumper'],
  glossaryTerms: [
    { slug: 'lattice-cross-g98', term: 'Lattice cross stitch', definition: 'A pattern made by skipping 1 stitch and working a dc in the next, then crossing back to work a dc in the skipped stitch. Crossing creates an X-shaped lattice effect.' },
    { slug: 'stitch-mult-g98', term: 'Stitch multiple', definition: 'Lattice stitch requires a multiple of 2 stitches. The foundation chain must be set to an even number plus turning chain.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Lattice and crossed stitch patterns are classic crochet texture techniques.',
  body: {
    type: 'doc', content: [
      p(t('Work the body and sleeves in '), gt('lattice-cross-g98', 'lattice cross stitch'), t(' throughout. The '), gt('stitch-mult-g98', 'stitch multiple'), t(' is 2, so start with an even number of chain stitches.')),
      p(t(`Size M: ${g98m.hemStitches} sts (adjust to even number). Body ${g98m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g98m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain to even number near ${g98m.hemStitches + 2}. Row 1: dc across. Row 2: `), gt('lattice-cross-g98', 'lattice cross stitch'), t(' repeat. Alternate for ${g98m.finishedMeasurements.body} cm.')),
      h2('What to try next'),
      p(t('The moss stitch pullover uses a similarly repetitive two-stitch pattern in a different texture.')),
    ],
  },
},
{
  slug: 'button-front-aran-cardigan',
  title: 'Aran-weight button-front cardigan',
  excerpt: 'A classic button-front drop-shoulder cardigan in aran yarn with 5 buttons. Crew neck with dc button bands. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g99m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['button front cardigan crochet', 'classic crochet cardigan', 'aran cardigan pattern'],
  glossaryTerms: [
    { slug: 'button-band-g99', term: 'Button band', definition: 'A dc band worked along each front edge of the cardigan. One band has dc eyelets for buttons; the other has no eyelets and buttons attach to it.' },
    { slug: 'dc2tog-g99', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the front neck edge at the top of each front panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Button-front cardigans are a classic garment in crochet publications from the 1970s onward.',
  body: {
    type: 'doc', content: [
      p(t('Work a standard drop-shoulder cardigan. After seaming, work '), gt('button-band-g99', 'button bands'), t(' along both front edges. The right-hand band has 5 dc eyelets spaced evenly. Use '), gt('dc2tog-g99', 'dc2tog'), t(' at the neck to shape the front edges before adding the band.')),
      p(t(`Size M: ${g99m.hemStitches} sts wide, ${g99m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g99m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 2.5 cm', qty: '5' },
      ]),
      h2('Body and sleeves'),
      p(t('Work back and two front halves. Seam. Work sleeves.')),
      h2('Button bands'),
      p(t('Work 4 rows dc along each front edge. On the right-hand band, substitute ch-1/skip for 5 evenly spaced '), gt('button-band-g99', 'button eyelets'), t('. Sew buttons on left-hand band.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan is the open-front version of the same base without buttons.')),
    ],
  },
},
{
  slug: 'seamless-yoke-cardigan-crochet',
  title: 'Seamless top-down yoke cardigan',
  excerpt: 'A top-down yoke cardigan worked seamlessly in one piece. Divided at the front to create two open fronts with a simple dc edge. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g100m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['seamless yoke cardigan crochet', 'top down cardigan crochet', 'one piece crochet cardigan'],
  glossaryTerms: [
    { slug: 'front-opening-g100', term: 'Front opening', definition: 'In a top-down cardigan, the yoke is worked back and forth in rows (not rounds) so that a gap runs up the centre front. The gap becomes the cardigan front edges.' },
    { slug: 'dc2tog-g100', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck edge of the front sections to shape the V neckline.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Seamless top-down cardigans are a popular modern crochet construction.',
  body: {
    type: 'doc', content: [
      p(t('Work the yoke back and forth in rows, leaving a '), gt('front-opening-g100', 'front opening'), t(' at the centre. Apply '), gt('dc2tog-g100', 'dc2tog'), t(' at each front edge for the V neckline. After sleeve separation, work the body in rounds. Join fronts or leave open for a buttonless drape.')),
      p(t(`Size M: neck ${g100m.neckStitches} sts total across row. Yoke ${g100m.yokeDepthRows} rows.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g100m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
        { name: 'Buttons, 2 cm', qty: '4 (optional)' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g100m.neckStitches} sts in rows. Work increases every other row for ${g100m.yokeIncreaseRows} rows. `), gt('dc2tog-g100', 'Dc2tog'), t(' at each front edge for neck shaping.')),
      h2('Body and sleeves'),
      p(t(`Separate sleeves. Work body in round for ${g100m.finishedMeasurements.body} cm.`)),
      h2('What to try next'),
      p(t('The top-down yoke pullover uses the same circular yoke worked fully in rounds with a closed neck.')),
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
