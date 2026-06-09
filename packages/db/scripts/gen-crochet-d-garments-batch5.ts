/**
 * Generator: D-Garments Batch 5 -- Texture/stitch-pattern garments (G41-G50)
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch5.ts
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

const WOMENS_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

// Pre-compute grading
const g41 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g41m = g41.find(g => g.size === 'M')!

const g42 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 13, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g42m = g42.find(g => g.size === 'M')!

const g43 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g43m = g43.find(g => g.size === 'M')!

const g44 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 13, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g44m = g44.find(g => g.size === 'M')!

const g45 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 13, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g45m = g45.find(g => g.size === 'M')!

const g46 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g46m = g46.find(g => g.size === 'M')!

const g47 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g47m = g47.find(g => g.size === 'M')!

const g48 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g48m = g48.find(g => g.size === 'M')!

const g49 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'TANK', options: { yarnWeightCategory: 3 } })
const g49m = g49.find(g => g.size === 'M')!

const g50 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g50m = g50.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'waffle-stitch-pullover',
  title: 'Waffle stitch pullover',
  subtitle: 'A drop-shoulder pullover in a textured waffle stitch in aran yarn.',
  excerpt: 'A drop-shoulder pullover worked in a waffle stitch. The grid of raised squares gives a cosy, chunky texture. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g41m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['waffle stitch sweater crochet', 'textured crochet pullover', 'waffle crochet jumper'],
  glossaryTerms: [
    { slug: 'waffle-stitch-g41', term: 'Waffle stitch', definition: 'A stitch pattern that works dc and treble in alternating positions to create a raised grid texture. Each square of the grid stands out from the background.' },
    { slug: 'stitch-repeat-g41', term: 'Stitch repeat', definition: 'The smallest section of a pattern that is repeated across the row. Waffle stitch has a 3-stitch repeat, so the foundation chain must be a multiple of 3 plus any turning chain.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Waffle stitch is a widely used crochet texture pattern.',
  body: {
    type: 'doc', content: [
      p(t('Work the '), gt('waffle-stitch-g41', 'waffle stitch'), t(` across every row. The `), gt('stitch-repeat-g41', 'stitch repeat'), t(` is 3 sts, so cast on a multiple of 3. The same drop-shoulder construction applies as the classic pullover.`)),
      p(t(`Size M: ${g41m.hemStitches} sts wide (adjust to nearest multiple of 3), body ${g41m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g41m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain to nearest multiple of 3 above ${g41m.hemStitches + 2}. Work `), gt('waffle-stitch-g41', 'waffle stitch'), t(` for ${g41m.finishedMeasurements.body} cm. Shape neck.`)),
      h2('Sleeves (make 2)'),
      p(t('Work waffle stitch for sleeves at the same repeat. Shape as standard drop-shoulder.')),
      h2('Assembly'),
      p(t('Seam shoulders. Set sleeves. Seam sides.')),
      h2('What to try next'),
      p(t('The moss stitch pullover uses a different two-row repeat texture on the same drop-shoulder shape.')),
    ],
  },
},
{
  slug: 'bobble-stitch-cardigan',
  title: 'Bobble stitch cardigan',
  subtitle: 'A top-down yoke cardigan with an all-over bobble texture in aran yarn.',
  excerpt: 'A top-down yoke cardigan with bobble stitches worked across every other row. The bobbles sit on the right side of the fabric. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-5mm',
  gauge: '13 dc x 14 rows = 10 x 10 cm in aran on a 5.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g42m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bobble stitch cardigan crochet', 'textured cardigan crochet', 'crochet bobble sweater women'],
  glossaryTerms: [
    { slug: 'bobble-g42', term: 'Bobble', definition: 'A cluster of 5 treble stitches worked into the same stitch, all joined at the top. The cluster puffs out from the fabric surface to create a raised round blob.' },
    { slug: 'dc2tog-g42', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for V-neck shaping at the front edges of the cardigan yoke.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Bobble stitch is a standard crochet texture technique.',
  body: {
    type: 'doc', content: [
      p(t('Work the top-down yoke flat, placing a '), gt('bobble-g42', 'bobble'), t(' every 4 sts on bobble rows. Use '), gt('dc2tog-g42', 'dc2tog'), t(` for V-neck shaping. Bobbles always face the right side regardless of which direction you are working.`)),
      p(t(`Size M: neck ${g42m.neckStitches} sts, yoke ${g42m.yokeDepthRows} rows, body ${g42m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g42m.yarnRequiredYards} yards` },
        { name: '5.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Yoke (flat)'),
      p(t(`Cast on ${g42m.neckStitches} sts. Work in rows: plain dc rows alternate with `), gt('bobble-g42', 'bobble'), t(` rows. Increase at yoke points every other row for ${g42m.yokeDepthRows} rows.`)),
      h2('Body and sleeves'),
      p(t('Separate sleeves at underarm. Work body and sleeves continuing the bobble pattern. Add button bands.')),
      h2('What to try next'),
      p(t('The puff stitch cardigan uses a similar raised stitch on a different yoke construction.')),
    ],
  },
},
{
  slug: 'spike-stitch-pullover',
  title: 'Spike stitch pullover',
  subtitle: 'A drop-shoulder pullover with a spike stitch colour-work stripe in aran yarn.',
  excerpt: 'A drop-shoulder pullover with spike stitch stripes in two colours. The spike stitches dip down into lower rows to create a diagonal zigzag effect. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g43m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['spike stitch crochet sweater', 'two colour crochet pullover', 'zigzag stripe crochet sweater'],
  glossaryTerms: [
    { slug: 'spike-stitch-g43', term: 'Spike stitch', definition: 'A dc stitch worked by inserting the hook one or more rows below the current row, then drawing up a long loop to the working row height before completing the stitch. Creates a diagonal spike of colour.' },
    { slug: 'colour-carry-g43', term: 'Colour carry', definition: 'Keeping the unused yarn at the back of the work, carried along the row, so it is ready to pick up when needed. Avoids too many loose ends.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Spike stitch is a standard crochet colourwork technique.',
  body: {
    type: 'doc', content: [
      p(t('Work dc rows in the main colour, then work '), gt('spike-stitch-g43', 'spike stitch'), t(' rows in the contrast colour, inserting the hook 2 rows below. '), gt('colour-carry-g43', 'Carry the unused colour'), t(' along the back.')),
      p(t(`Size M: ${g43m.hemStitches} sts wide, body ${g43m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn (main colour)', qty: `${Math.round(g43m.yarnRequiredYards * 0.7)} yards` },
        { name: 'Aran yarn (contrast colour)', qty: `${Math.round(g43m.yarnRequiredYards * 0.35)} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g43m.hemStitches + 2}. Work stripe sequence: 2 rows main, then 1 row `), gt('spike-stitch-g43', 'spike stitch'), t(` in contrast. Repeat for ${g43m.finishedMeasurements.body} cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders, set sleeves, seam sides.')),
      h2('What to try next'),
      p(t('The colour block pullover uses the same two-yarn approach in a different layout.')),
    ],
  },
},
{
  slug: 'cluster-stitch-vest',
  title: 'Cluster stitch vest',
  subtitle: 'A drop-shoulder vest in a cluster stitch pattern in aran yarn.',
  excerpt: 'A sleeveless vest in a cluster stitch pattern. Each cluster creates a small raised fan of stitches. Drop-shoulder shape. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-5mm',
  gauge: '13 dc x 14 rows = 10 x 10 cm in aran on a 5.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g44m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cluster stitch vest crochet', 'fan stitch crochet vest', 'textured crochet waistcoat'],
  glossaryTerms: [
    { slug: 'cluster-g44', term: 'Cluster', definition: 'A group of treble stitches worked into the same stitch, held separately until all are joined with one final pull-through. Creates a fan or petal shape that stands out from the fabric.' },
    { slug: 'shell-row-g44', term: 'Shell row', definition: 'A row where clusters and chain spaces alternate to form an open, lacy fabric of repeated shell shapes.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cluster stitch is a standard crochet lace and texture technique.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front in a '), gt('shell-row-g44', 'shell row'), t(' pattern of '), gt('cluster-g44', 'clusters'), t(` separated by chain spaces. Adjust the cast-on to the nearest multiple of the stitch repeat. No sleeves.`)),
      p(t(`Size M: ${g44m.hemStitches} sts wide (adjust to stitch repeat), body ${g44m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g44m.yarnRequiredYards} yards` },
        { name: '5.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Foundation chain to nearest repeat. Work `), gt('shell-row-g44', 'shell rows'), t(` for ${g44m.finishedMeasurements.body} cm. Shape neck and armhole.`)),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work dc border at armhole and neck.')),
      h2('What to try next'),
      p(t('The cluster stitch cardigan adds sleeves and a front opening to the same stitch pattern.')),
    ],
  },
},
{
  slug: 'puff-stitch-cardigan',
  title: 'Puff stitch cardigan',
  subtitle: 'A top-down yoke cardigan with puff stitches throughout in aran yarn.',
  excerpt: 'A top-down yoke cardigan worked with puff stitches on every other row. The puffs give a soft, rounded texture. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-5mm',
  gauge: '13 dc x 14 rows = 10 x 10 cm in aran on a 5.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g45m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['puff stitch cardigan crochet', 'soft texture cardigan crochet', 'crochet puff stitch sweater'],
  glossaryTerms: [
    { slug: 'puff-stitch-g45', term: 'Puff stitch', definition: 'Made by drawing up several loops into the same stitch then pulling one loop through all of them. This creates a rounded, puffy shape that sits on the fabric surface.' },
    { slug: 'dc2tog-g45', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the yoke at the front edges for a V-neck line.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Puff stitch is a standard crochet texture technique.',
  body: {
    type: 'doc', content: [
      p(t('Work the flat yoke and body with '), gt('puff-stitch-g45', 'puff stitches'), t(' placed every 3 sts on texture rows. Use '), gt('dc2tog-g45', 'dc2tog'), t(' for V-neck shaping at the front edges.')),
      p(t(`Size M: neck ${g45m.neckStitches} sts, yoke ${g45m.yokeDepthRows} rows, body ${g45m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g45m.yarnRequiredYards} yards` },
        { name: '5.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Yoke'),
      p(t(`Chain ${g45m.neckStitches + 2}. Work in rows: plain dc alternating with `), gt('puff-stitch-g45', 'puff rows'), t(`. Increase at yoke points every other row. Shape V-neck with `), gt('dc2tog-g45', 'dc2tog'), t('.')),
      h2('Body and sleeves'),
      p(t('Separate sleeves. Work body and sleeves with the same puff pattern. Add button bands.')),
      h2('What to try next'),
      p(t('The bobble stitch cardigan uses a similar raised-stitch idea with five-treble bobbles.')),
    ],
  },
},
{
  slug: 'moss-stitch-pullover',
  title: 'Moss stitch pullover',
  subtitle: 'A drop-shoulder pullover in moss stitch in aran yarn.',
  excerpt: 'A drop-shoulder pullover worked in moss stitch, also called linen stitch. The tight alternating pattern gives a firm, slightly dense fabric. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g46m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['moss stitch crochet pullover', 'linen stitch sweater crochet', 'crochet textured jumper'],
  glossaryTerms: [
    { slug: 'moss-stitch-g46', term: 'Moss stitch', definition: 'A two-row pattern: row 1 works dc and chain 1 alternately; row 2 works dc into each chain space and chain 1 into each dc. The offset columns create a tight, woven-looking texture.' },
    { slug: 'turning-ch-g46', term: 'Turning chain', definition: 'The chain worked at the end of a row before turning. On a moss stitch row, the turning chain is usually chain 1 and does not count as a stitch.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Moss stitch is a widely used beginner-friendly crochet texture.',
  body: {
    type: 'doc', content: [
      p(t('Work all pieces in '), gt('moss-stitch-g46', 'moss stitch'), t('. Add a '), gt('turning-ch-g46', 'turning chain'), t(` of 1 at each row end. The same drop-shoulder construction applies as the classic pullover.`)),
      p(t(`Size M: ${g46m.hemStitches} sts wide (adjust to even number), body ${g46m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g46m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain to nearest even number above ${g46m.hemStitches + 1}. Work `), gt('moss-stitch-g46', 'moss stitch'), t(` for ${g46m.finishedMeasurements.body} cm. Shape neck.`)),
      h2('Sleeves and assembly'),
      p(t('Work sleeves in moss stitch. Seam all pieces.')),
      h2('What to try next'),
      p(t('The waffle stitch pullover uses a different repeat on the same drop-shoulder base.')),
    ],
  },
},
{
  slug: 'herringbone-htr-pullover',
  title: 'Herringbone htr pullover',
  subtitle: 'A drop-shoulder pullover in herringbone half treble stitch in aran yarn.',
  excerpt: 'A drop-shoulder pullover worked in herringbone half treble. The diagonal yarn wraps create a dense woven texture. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g47m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-half-treble-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-half-treble-uk'],
  criticalTechniques: ['crochet-half-treble-uk'],
  aliases: ['herringbone crochet sweater', 'htr pullover crochet', 'woven stitch crochet jumper'],
  glossaryTerms: [
    { slug: 'herringbone-htr-g47', term: 'Herringbone htr', definition: 'A half treble variation where the hook passes through the back loop and the horizontal bar below the back loop. This creates diagonal yarn wraps that give a fabric resembling woven herringbone cloth.' },
    { slug: 'htr-height-g47', term: 'Htr height', definition: 'Half treble crochet (htr) sits between a dc and a treble in height. In UK terms, htr uses one yarn over before inserting the hook, giving a slightly taller stitch than dc.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Herringbone htr is a popular modern crochet stitch.',
  body: {
    type: 'doc', content: [
      p(t('Work all pieces in '), gt('herringbone-htr-g47', 'herringbone htr'), t('. The '), gt('htr-height-g47', 'htr height'), t(` is slightly taller than dc, so re-swatch and adjust row count if needed.`)),
      p(t(`Size M: ${g47m.hemStitches} sts, body ${g47m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g47m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g47m.hemStitches + 2}. Work `), gt('herringbone-htr-g47', 'herringbone htr'), t(` for ${g47m.finishedMeasurements.body} cm. Shape neck.`)),
      h2('Sleeves and assembly'),
      p(t('Work sleeves. Seam shoulders, set sleeves, seam sides.')),
      h2('What to try next'),
      p(t('The moss stitch pullover uses a two-row repeat on the same drop-shoulder base for a different texture.')),
    ],
  },
},
{
  slug: 'front-post-ribbed-cardigan',
  title: 'Front post ribbed cardigan',
  subtitle: 'A drop-shoulder cardigan with front post rib columns in aran yarn.',
  excerpt: 'A drop-shoulder cardigan with front-post double crochet rib columns running the full length of the body and sleeves. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g48m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-front-post-dc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['front post rib cardigan crochet', 'FPdc rib sweater crochet', 'ribbed crochet cardigan women'],
  glossaryTerms: [
    { slug: 'fpdc-g48', term: 'FPdc', definition: 'Front post double crochet. Worked by inserting the hook around the post (stem) of the stitch below from front to back to front. The stitch pops forward and creates a raised vertical rib column.' },
    { slug: 'rib-column-g48', term: 'Rib column', definition: 'A vertical stripe of front post stitches alternating with plain dc stitches. Placing rib columns at regular intervals across the fabric gives the same look as a knit 2x2 rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Front post rib is a standard crochet texture technique.',
  body: {
    type: 'doc', content: [
      p(t('Work all rows as alternating plain dc and '), gt('fpdc-g48', 'FPdc'), t(' to create '), gt('rib-column-g48', 'rib columns'), t(`. Use a 4-stitch repeat: 2 plain dc, then 2 FPdc. Same drop-shoulder construction as the classic pullover.`)),
      p(t(`Size M: ${g48m.hemStitches} sts wide (adjust to 4-stitch repeat), body ${g48m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g48m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Back'),
      p(t(`Chain to nearest 4-stitch repeat above ${g48m.hemStitches}. Work rib column pattern for ${g48m.finishedMeasurements.body} cm.`)),
      h2('Front halves and sleeves'),
      p(t('Work front halves and sleeves in the same rib column pattern. Add button bands.')),
      h2('What to try next'),
      p(t("The men's ribbed pullover uses a similar BLO rib technique on a men's shape.")),
    ],
  },
},
{
  slug: 'linen-stitch-tank',
  title: 'Linen stitch tank',
  subtitle: 'A sleeveless tank top in linen stitch in DK cotton yarn.',
  excerpt: 'A sleeveless tank top worked in linen stitch. The tight alternating pattern gives a fabric with a woven look and good drape in cotton DK. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-3-5mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in cotton DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g49m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['linen stitch crochet top', 'woven stitch tank crochet', 'cotton crochet sleeveless top women'],
  glossaryTerms: [
    { slug: 'linen-stitch-g49', term: 'Linen stitch', definition: 'A two-row repeat of alternating sc and chain-1, offset on the second row so the chains fill the spaces. The result looks very similar to woven linen cloth.' },
    { slug: 'strappy-edging-g49', term: 'Strappy edging', definition: 'A narrow dc edge worked around the armhole opening to form a neat sleeveless strap effect without adding a full sleeve.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linen stitch is a popular summer garment texture.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front in '), gt('linen-stitch-g49', 'linen stitch'), t('. Seam shoulders and sides. Finish armholes with a '), gt('strappy-edging-g49', 'strappy edging'), t('.')),
      p(t(`Size M: ${g49m.hemStitches} sts wide, body ${g49m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: `${g49m.yarnRequiredYards} yards` },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain to nearest even number above ${g49m.hemStitches}. Work `), gt('linen-stitch-g49', 'linen stitch'), t(` for ${g49m.finishedMeasurements.body} cm. Shape neck and armhole.`)),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work '), gt('strappy-edging-g49', 'strappy edging'), t(' around armholes.')),
      h2('What to try next'),
      p(t('The moss stitch pullover uses the same woven-look texture on a longer sleeved shape.')),
    ],
  },
},
{
  slug: 'c2c-cardigan',
  title: 'Corner-to-corner cardigan',
  subtitle: 'A drop-shoulder cardigan worked in corner-to-corner (C2C) construction in aran yarn.',
  excerpt: 'A cardigan worked diagonally in corner-to-corner (C2C) construction. Blocks of colour or textured squares grow from corner to corner. Drop-shoulder shape. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g50m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['C2C cardigan crochet', 'corner to corner crochet garment', 'diagonal crochet sweater'],
  glossaryTerms: [
    { slug: 'c2c-g50', term: 'C2C', definition: 'Corner-to-corner. A construction method that works small blocks of 3 dc diagonally from one corner to the opposite corner. The piece grows by adding one block each row on the way up, then removes one block each row on the way down.' },
    { slug: 'c2c-block-g50', term: 'C2C block', definition: 'The basic unit of corner-to-corner work: 3 dc worked into a chain-3 space, with a chain 3 to bridge to the next block. Colour changes happen at the block level.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Corner-to-corner construction is a well-established crochet graphgan technique adapted for garments.',
  body: {
    type: 'doc', content: [
      p(t('Work each panel in '), gt('c2c-g50', 'C2C'), t(' construction. Each '), gt('c2c-block-g50', 'C2C block'), t(` is 3 dc. The panel grows diagonally to the widest point (bust), then decreases back to the shoulder. Back, front halves, and sleeves are each separate C2C panels.`)),
      p(t(`Size M: bust panel widest point approx ${Math.round(g50m.hemStitches / 3)} C2C blocks wide.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g50m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Panels'),
      p(t('Work each panel as a C2C rectangle. Calculate the number of blocks from your gauge swatch. Increase one block per row to the widest point, then decrease.')),
      h2('Assembly'),
      p(t('Seam panels at shoulders, set sleeves, seam sides. Add button bands along front edges.')),
      h2('What to try next'),
      p(t('The colour block pullover achieves a similar graphic look using standard row construction.')),
    ],
  },
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
