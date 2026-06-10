/**
 * Generator: D-Garments Batch 9 -- Accessories worn as garments G81-G90
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch9.ts
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

const g81 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g81m = g81.find(g => g.size === 'M')!

const g82 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g82m = g82.find(g => g.size === 'M')!

const g83 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g83m = g83.find(g => g.size === 'M')!

const g84 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g84m = g84.find(g => g.size === 'M')!

const g85 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g85m = g85.find(g => g.size === 'M')!

const g86 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g86m = g86.find(g => g.size === 'M')!

const g87 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g87m = g87.find(g => g.size === 'M')!

const g88 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_2', garmentType: 'TANK' })
const g88m = g88.find(g => g.size === 'M')!

const g89 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g89m = g89.find(g => g.size === 'M')!

const g90 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'ZERO', garmentType: 'PULLOVER' })
const g90m = g90.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'linen-stitch-vest-crochet',
  title: 'Linen stitch vest',
  excerpt: 'A sleeveless vest in linen stitch. The tight woven texture holds its shape well for a structured look. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g81m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen stitch vest crochet', 'woven look vest crochet', 'structured vest crochet'],
  glossaryTerms: [
    { slug: 'linen-st-g81', term: 'Linen stitch', definition: 'An alternating pattern of sc and ch-1 spaces. The ch-1 is worked over the previous ch and creates a tight woven look similar to woven linen fabric.' },
    { slug: 'armhole-shape-g81', term: 'Armhole shaping', definition: 'Reducing stitches at the side edges after the body reaches underarm height to create the armhole opening in a shaped vest.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linen stitch is a well-known crochet stitch pattern.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and front panels in '), gt('linen-st-g81', 'linen stitch'), t('. After the body reaches the underarm, use '), gt('armhole-shape-g81', 'armhole shaping'), t(' on each side. Seam at shoulders and sides.')),
      p(t(`Size M: ${g81m.hemStitches} sts wide, ${g81m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g81m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g81m.hemStitches * 2 + 2}. Work linen stitch (alternating sc and ch-1) for ${g81m.finishedMeasurements.body} cm. Shape armhole at each side. Finish neck edge.`)),
      h2('What to try next'),
      p(t('The sleeveless open cardigan uses the same vest shape with an open front.')),
    ],
  },
},
{
  slug: 'pocket-cardigan-crochet',
  title: 'Pocket cardigan',
  excerpt: 'A drop-shoulder cardigan with two patch pockets at hip level. The pockets are worked separately and sewn on. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g82m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cardigan with pockets crochet', 'patch pocket cardigan', 'crochet jacket pockets'],
  glossaryTerms: [
    { slug: 'patch-pocket-g82', term: 'Patch pocket', definition: 'A pocket made as a separate rectangle and sewn flat onto the garment surface. Worked in dc and whip-stitched in place after seaming.' },
    { slug: 'dc2tog-g82', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the neckline on each front panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cardigans with patch pockets are a classic garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the cardigan body and sleeves as for the classic drop-shoulder cardigan. Work two '), gt('patch-pocket-g82', 'patch pockets'), t(' as separate dc rectangles and sew them at hip level. Use '), gt('dc2tog-g82', 'dc2tog'), t(' at the front neck edges.')),
      p(t(`Size M: ${g82m.hemStitches} sts wide. Pockets: 15 x 17 cm each.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g82m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons', qty: '5' },
      ]),
      h2('Body'),
      p(t('Work back and front halves. Seam shoulders and sides. Work sleeves. Set sleeves flat.')),
      h2('Pockets (make 2)'),
      p(t('Chain 22. Work dc for 17 cm. Whip-stitch each '), gt('patch-pocket-g82', 'pocket'), t(' to the front panel.')),
      h2('What to try next'),
      p(t('The tunic with patch pockets adds the same pockets to a longer body.')),
    ],
  },
},
{
  slug: 'crochet-duster-cardigan',
  title: 'Duster cardigan',
  excerpt: 'A knee-length open-front duster cardigan in aran yarn. Very long body with no buttons and an open drape. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g83m.finishedMeasurements.bust} cm bust. Body approx. 95 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['duster cardigan crochet', 'longline open cardigan', 'maxi length crochet cardigan'],
  glossaryTerms: [
    { slug: 'duster-length-g83', term: 'Duster length', definition: 'A body reaching to roughly the knee, around 90 to 100 cm from shoulder to hem. Creates a long dramatic drape.' },
    { slug: 'dc2tog-g83', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the front neck edges.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Duster-length cardigans are a popular modern fashion garment.',
  body: {
    type: 'doc', content: [
      p(t('Work the same as the long oversized cardigan but extend the body to '), gt('duster-length-g83', 'duster length'), t(': approximately 95 cm. Use '), gt('dc2tog-g83', 'dc2tog'), t(' at the front neck edges. No buttons.')),
      p(t(`Size M: back ${g83m.hemStitches} sts wide. Body 95 cm. Each front half ${Math.round(g83m.hemStitches / 2)} sts wide.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '1100 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g83m.hemStitches + 2}. Work dc for 95 cm. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g83m.hemStitches / 2) + 2}. Work dc for 85 cm. `), gt('dc2tog-g83', 'Dc2tog'), t(' at neck edge for 10 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The long oversized cardigan is the same open front in a shorter body length.')),
    ],
  },
},
{
  slug: 'colourwork-yoke-pullover-crochet',
  title: 'Colourwork yoke pullover',
  excerpt: 'A seamless top-down yoke pullover with a colourwork band at the yoke in aran yarn. Two contrasting colours for the yoke pattern. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g84m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['colourwork yoke crochet', 'fair isle yoke crochet', 'two colour yoke pullover'],
  glossaryTerms: [
    { slug: 'tapestry-crochet-g84', term: 'Tapestry crochet', definition: 'A colourwork method where the unused yarn is carried inside the stitches of the working row. Creates a two-colour pattern without visible floats on the fabric face.' },
    { slug: 'yoke-band-g84', term: 'Yoke colourwork band', definition: 'The section of the circular yoke where the two colours alternate in a charted repeat. Typically placed in the lower third of the yoke depth, after increases are complete.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Colourwork yoke garments are a popular modern crochet design.',
  body: {
    type: 'doc', content: [
      p(t('Work the top-down circular yoke in rounds of plain dc. In the lower portion of the yoke, work the '), gt('yoke-band-g84', 'yoke colourwork band'), t(' in '), gt('tapestry-crochet-g84', 'tapestry crochet'), t(' using a charted two-colour repeat. The body and sleeves continue in the main colour only.')),
      p(t(`Size M: neck ${g84m.neckStitches} sts. Yoke ${g84m.yokeDepthRows} rows. Body ${g84m.finishedMeasurements.bust} cm bust.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn, main colour', qty: `${Math.round(g84m.yarnRequiredYards * 0.8)} yards` },
        { name: 'Aran yarn, contrast colour', qty: `${Math.round(g84m.yarnRequiredYards * 0.2)} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g84m.neckStitches} sts. Work plain dc yoke increasing evenly for ${g84m.yokeIncreaseRows} rows. Work `), gt('yoke-band-g84', 'colourwork band'), t(` in `), gt('tapestry-crochet-g84', 'tapestry crochet'), t(` for 6 rows. Continue plain to underarm.`)),
      h2('Body and sleeves'),
      p(t(`Separate sleeves. Work body in round for ${g84m.finishedMeasurements.body} cm. Work each sleeve for ${g84m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t('The cable-texture yoke pullover uses post-stitch texture instead of colourwork.')),
    ],
  },
},
{
  slug: 'moss-stitch-pullover-crochet',
  title: 'Moss stitch pullover',
  excerpt: 'A drop-shoulder pullover in moss stitch throughout. The alternating sc and ch-1 texture gives a tweedy, dense fabric. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g85m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['moss stitch pullover crochet', 'seed stitch sweater crochet', 'linen stitch jumper'],
  glossaryTerms: [
    { slug: 'moss-st-g85', term: 'Moss stitch', definition: 'Also called granite stitch or linen stitch. A repeat of sc, ch-1, skip 1. Works into ch-1 spaces on return rows to create a tight tweedy texture.' },
    { slug: 'stitch-repeat-g85', term: 'Stitch repeat', definition: 'The number of stitches that form one complete pattern unit. In moss stitch the repeat is 2: one sc and one ch-1 space. The starting chain must be a multiple of the repeat.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Moss stitch is a classic crochet stitch pattern.',
  body: {
    type: 'doc', content: [
      p(t('Work the body and sleeves of a drop-shoulder pullover entirely in '), gt('moss-st-g85', 'moss stitch'), t('. The '), gt('stitch-repeat-g85', 'stitch repeat'), t(' is 2: start with a multiple-of-2 chain.')),
      p(t(`Size M: ${g85m.hemStitches} sts wide (adjust to nearest even number). Body ${g85m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g85m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain to nearest even number at or above ${g85m.hemStitches + 2}. Work `), gt('moss-st-g85', 'moss stitch'), t(` for ${g85m.finishedMeasurements.body} cm. Shape neck.`)),
      h2('What to try next'),
      p(t('The linen stitch vest uses the same tight woven texture in a sleeveless shape.')),
    ],
  },
},
{
  slug: 'puff-stitch-pullover-crochet',
  title: 'Puff stitch pullover',
  excerpt: 'A drop-shoulder pullover with an all-over puff stitch pattern in DK yarn. The dimensional texture is worked in the body and sleeves. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 sts x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g86m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-puff-stitch', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-puff-stitch'],
  criticalTechniques: ['crochet-puff-stitch'],
  aliases: ['puff stitch pullover crochet', 'bubble stitch sweater crochet', 'dimensional texture jumper'],
  glossaryTerms: [
    { slug: 'puff-st-g86', term: 'Puff stitch', definition: 'A cluster made by drawing up 4 or 5 loops from the same stitch and closing them together. Creates a rounded bobble-like bump on the fabric face.' },
    { slug: 'puff-repeat-g86', term: 'Puff repeat', definition: 'The pattern unit spacing the puffs evenly across the row. In this pullover one puff is worked every 3 sts with dc separating them.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Puff stitch garments are a popular modern crochet texture.',
  body: {
    type: 'doc', content: [
      p(t('Work the body and sleeves in an all-over '), gt('puff-st-g86', 'puff stitch'), t(' pattern. The '), gt('puff-repeat-g86', 'puff repeat'), t(' spaces one puff per 3 sts across the row. Use dc as spacer stitches between puffs.')),
      p(t(`Size M: ${g86m.hemStitches} sts wide (adjust to nearest multiple of 3). Body ${g86m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g86m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t(`Chain to nearest multiple of 3 at or above ${g86m.hemStitches + 2}. Row 1: dc. Row 2: dc 1, `), gt('puff-st-g86', 'puff'), t(', dc 2, repeat. Continue alternating for ${g86m.finishedMeasurements.body} cm.')),
      h2('What to try next'),
      p(t('The moss stitch pullover uses a similar all-over texture but without the raised puffs.')),
    ],
  },
},
{
  slug: 'beach-dress-crochet',
  title: 'Crochet beach dress',
  excerpt: 'A loose knee-length beach dress in cotton DK. Open stitch body with solid dc bodice. Worn over a swimsuit. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g87m.finishedMeasurements.bust} cm bust. Length approx. 85 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['beach dress crochet', 'crochet cover up dress', 'summer dress crochet'],
  glossaryTerms: [
    { slug: 'open-skirt-g87', term: 'Open skirt section', definition: 'The lower part of the dress worked in an open stitch with treble groups and chain spaces. Creates a lightweight airy fabric suited to beach wear.' },
    { slug: 'bodice-g87', term: 'Bodice', definition: 'The upper body section of the dress, worked in solid dc for modest coverage. Extends from the hem of the skirt section to the shoulder.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet beach cover-up dresses are a popular warm-weather garment.',
  body: {
    type: 'doc', content: [
      p(t('Work the '), gt('open-skirt-g87', 'open skirt section'), t(' from the hem up for 50 cm using treble groups and chain spaces. Then work the '), gt('bodice-g87', 'bodice'), t(' in solid dc for the remaining 35 cm up to the shoulder.')),
      p(t(`Size M: ${g87m.hemStitches} sts wide at hem, body ${g87m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: `${g87m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Skirt section'),
      p(t(`Chain ${g87m.hemStitches * 2 + 2}. Work open stitch (tr groups and ch-2 spaces) for 50 cm.`)),
      h2('Bodice'),
      p(t('Reduce to bodice width. Work solid dc for 35 cm. Shape shoulders.')),
      h2('What to try next'),
      p(t('The summer cover-up uses an all-over open stitch for a lighter fabric.')),
    ],
  },
},
{
  slug: 'bandeau-crop-top-crochet',
  title: 'Bandeau crop top',
  excerpt: 'A strapless bandeau crop top in cotton DK. Worked as a flat rectangle with an elasticated top edge. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g88m.finishedMeasurements.bust} cm bust. Height 22 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bandeau top crochet', 'strapless crop top crochet', 'tube top crochet'],
  glossaryTerms: [
    { slug: 'elastic-channel-g88', term: 'Elastic channel', definition: 'A casing for elastic worked by folding the top edge over and sewing it down to form a tube. The elastic is threaded through to keep the strapless top in place.' },
    { slug: 'seam-g88', term: 'Side seam', definition: 'A mattress stitch or whip stitch join along the short edges to turn the flat rectangle into a tube.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Bandeau crop tops are a popular summer crochet project.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat dc rectangle wide enough to wrap the bust plus ease. Leave the last 3 rows unworked to fold down for the '), gt('elastic-channel-g88', 'elastic channel'), t('. Join the short edges with a '), gt('seam-g88', 'side seam'), t('.')),
      p(t(`Size M: ${g88m.hemStitches} sts wide, 22 cm height. Add 2 cm for the elastic channel fold.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: '120 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 2 cm wide', qty: `${g88m.finishedMeasurements.bust} cm` },
      ]),
      h2('Body'),
      p(t(`Chain ${g88m.hemStitches + 2}. Work dc for 22 cm. Fold top edge and sew elastic channel. Thread elastic. Join `), gt('seam-g88', 'side seam'), t('.')),
      h2('What to try next'),
      p(t('The cotton tank top adds straps for a more structured top.')),
    ],
  },
},
{
  slug: 'crochet-midi-skirt',
  title: 'Crochet midi skirt',
  excerpt: 'A hip-to-knee midi skirt worked in rounds of dc from the waistband down. Elasticated waist. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g89m.finishedMeasurements.bust} cm hip, 65 cm length.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet midi skirt', 'crochet skirt pattern', 'knee length skirt crochet'],
  glossaryTerms: [
    { slug: 'waistband-crochet-g89', term: 'Crochet waistband', definition: 'A 5 cm wide dc band at the top of the skirt. The top edge is folded and sewn down to form an elastic casing.' },
    { slug: 'a-line-skirt-g89', term: 'A-line skirt', definition: 'A skirt that gently widens from waist to hem. Achieved by adding 2 increase rounds spread evenly across the first 20 cm of the skirt.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet skirts are a popular garment in the modern crochet revival.',
  body: {
    type: 'doc', content: [
      p(t('Work the '), gt('waistband-crochet-g89', 'waistband'), t(' first, then join to work in rounds. Work a gentle '), gt('a-line-skirt-g89', 'A-line'), t(' flare in the first 20 cm by adding 2 increase rounds. Continue even dc rounds to 65 cm.')),
      p(t(`Size M: ${g89m.hemStitches} sts at waist, worked in the round.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '650 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Elastic, 3 cm wide', qty: 'waist circumference + 5 cm' },
      ]),
      h2('Waistband'),
      p(t(`Chain ${g89m.hemStitches + 2}. Work 5 cm dc in rows. Join short edges. Fold top edge and sew elastic channel.`)),
      h2('Skirt body'),
      p(t('Attach yarn to waistband lower edge. Work dc in round. Increase 2 rounds evenly over first 20 cm. Continue even to 65 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The midi crochet dress uses the same rounded skirt joined to a bodice.')),
    ],
  },
},
{
  slug: 'fitted-rib-pullover-crochet',
  title: 'Fitted ribbed pullover',
  excerpt: 'A close-fitting pullover worked entirely in 1x1 fpdc/bpdc rib. The rib gives stretch for a body-skimming fit. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in rib on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g90m.finishedMeasurements.bust} cm bust with zero ease (rib stretches to fit).`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['ribbed pullover crochet', 'rib knit crochet sweater', 'fitted crochet jumper'],
  glossaryTerms: [
    { slug: 'rib-stretch-g90', term: 'Rib stretch', definition: 'The elastic quality of 1x1 rib (alternating fpdc and bpdc) that allows it to stretch 20 to 30% wider than its relaxed width. Patterns worked entirely in rib size down for a close fit.' },
    { slug: 'fpdc-g90', term: 'Front post double crochet', definition: 'A dc worked around the post from the front. Alternating fpdc and bpdc across a row creates 1x1 rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'All-over rib pullovers are a popular fitted crochet garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the entire body and sleeves in 1x1 rib: alternating '), gt('fpdc-g90', 'fpdc'), t(' and bpdc. The '), gt('rib-stretch-g90', 'rib stretch'), t(' means sizing down by one size is needed for a body-skimming fit.')),
      p(t(`Size M: ${g90m.hemStitches} sts wide with zero ease. The rib will stretch to the full bust measurement.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g90m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g90m.hemStitches + 2}. Work 1x1 rib (`), gt('fpdc-g90', 'fpdc'), t('/bpdc alternating) for ${g90m.finishedMeasurements.body} cm. Shape neck.')),
      h2('What to try next'),
      p(t('The ribbed hem pullover adds 1x1 rib only at the hem and cuffs, with the body in plain dc.')),
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
