/**
 * Generator: D-Garments Batch 2 -- Top-down yoke pullovers + raglan + more
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch2.ts
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

// Pre-compute grading for each pattern
const g11 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g11m = g11.find(g => g.size === 'M')!

const g12 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_RAGLAN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g12m = g12.find(g => g.size === 'M')!

const g13 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g13m = g13.find(g => g.size === 'M')!

const g14 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'BOTTOM_UP_SET_IN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_2', garmentType: 'PULLOVER' })
const g14m = g14.find(g => g.size === 'M')!

const g15 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g15m = g15.find(g => g.size === 'M')!

const g16 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'SIDE_TO_SIDE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g16m = g16.find(g => g.size === 'M')!

const g17 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_RAGLAN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_6', garmentType: 'CARDIGAN' })
const g17m = g17.find(g => g.size === 'M')!

const g18 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'DRESS' })
const g18m = g18.find(g => g.size === 'M')!

const g19 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g19m = g19.find(g => g.size === 'M')!

const g20 = gradeAllSizes([...WOMENS_SIZES], { constructionShape: 'BOTTOM_UP_SET_IN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_2', garmentType: 'CARDIGAN' })
const g20m = g20.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'top-down-yoke-pullover',
  title: 'Top-down yoke pullover',
  subtitle: 'A seamless top-down pullover with a circular yoke in aran yarn.',
  excerpt: 'A seamless top-down pullover worked in the round from a circular yoke. No seams after finishing. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g11m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['top down yoke pullover crochet', 'seamless crochet pullover', 'circular yoke sweater crochet'],
  glossaryTerms: [
    { slug: 'circular-yoke-g11', term: 'Circular yoke', definition: 'A wide disc of fabric worked in the round that forms the neck, shoulders, and top of the sleeves in one piece. Increases radiate outward from the neck ring.' },
    { slug: 'underarm-cast-off-g11', term: 'Underarm separation', definition: 'Placing the sleeve stitches on hold while working the body, then returning to work each sleeve separately. Eliminates the need for seams.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down circular yoke construction became popular from the 1950s onward. Modern crochet adaptations are well-established.',
  body: {
    type: 'doc', content: [
      p(t('Work the '), gt('circular-yoke-g11', 'circular yoke'), t(` in the round from the neck, increasing evenly to ${g11m.neckStitches + g11m.yokeIncreaseRows * 6} sts at the underarm. Separate sleeve sts on hold. Continue the body in the round to ${g11m.finishedMeasurements.body} cm. Work each sleeve.`)),
      p(t(`Size M: neck cast-on ${g11m.neckStitches} sts, yoke depth ${g11m.yokeDepthRows} rows, body ${g11m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g11m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g11m.neckStitches} sts in a ring. Work increases every other round (6 sts per increase round) for ${g11m.yokeIncreaseRows} rounds.`)),
      h2('Body'),
      p(t(`Place ${g11m.sleeveBicepStitches} sleeve sts on holders each side. `), gt('underarm-cast-off-g11', 'Separate sleeves'), t(`. Join body in the round: ${g11m.bustStitches} sts. Work even to ${g11m.finishedMeasurements.body} cm.`)),
      h2('Sleeves (make 2)'),
      p(t(`Pick up sleeve sts. Work in the round, decreasing to ${g11m.sleeveCuffStitches} sts over ${g11m.sleeveLengthRows} rows.`)),
      h2('What to try next'),
      p(t('The top-down raglan pullover uses the same top-down seamless approach with a different yoke shape.')),
    ],
  },
},
{
  slug: 'top-down-raglan-pullover',
  title: 'Top-down raglan pullover',
  subtitle: 'A seamless top-down raglan pullover in aran yarn.',
  excerpt: 'A seamless top-down raglan pullover with four raglan lines worked in the round from the neck. No seams. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g12m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['raglan pullover crochet', 'seamless raglan sweater', 'top down raglan crochet'],
  glossaryTerms: [
    { slug: 'raglan-line-g12', term: 'Raglan line', definition: 'A diagonal seam-line running from neck to underarm. In a seamless raglan, each raglan line is a column of increases that add two stitches per round.' },
    { slug: 'raglan-increase-g12', term: 'Raglan increase', definition: 'Working 2 dc into the stitch on either side of each raglan marker. Added every other round, the four raglan lines grow the yoke outward.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Raglan construction has Scandinavian origins; modern top-down seamless adaptations are widely published.',
  body: {
    type: 'doc', content: [
      p(t('Work from the neck down with four '), gt('raglan-line-g12', 'raglan lines'), t(`. Place markers at the four raglan points. On every other round, work `, ), gt('raglan-increase-g12', 'raglan increases'), t(` at each marker. Continue for ${g12m.yokeDepthRows} rounds to the underarm.`)),
      p(t(`Size M: neck cast-on ${g12m.neckStitches} sts. Yoke depth ${g12m.yokeDepthRows} rows.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g12m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '4' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g12m.neckStitches} sts in ring. Place markers at 4 raglan points. Work `), gt('raglan-increase-g12', 'raglan increases'), t(` every other round for ${g12m.yokeDepthRows} rounds.`)),
      h2('Body and sleeves'),
      p(t(`Separate ${g12m.sleeveBicepStitches} sleeve sts on holders. Work body in the round: ${g12m.bustStitches} sts, ${g12m.finishedMeasurements.body} cm. Work sleeves to ${g12m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t('The top-down yoke pullover uses a circular yoke on the same top-down seamless base.')),
    ],
  },
},
{
  slug: 'top-down-yoke-cardigan',
  title: 'Top-down yoke cardigan',
  subtitle: 'A seamless top-down yoke cardigan worked open at the front.',
  excerpt: 'A seamless top-down yoke cardigan in aran yarn. Worked flat from the neck down so the front remains open. Button bands added after. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g13m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['top down cardigan crochet', 'seamless cardigan crochet', 'yoke cardigan crochet'],
  glossaryTerms: [
    { slug: 'flat-yoke-g13', term: 'Flat yoke', definition: 'A top-down yoke worked back-and-forth in rows rather than in the round. The front opening stays open throughout, making it easier to work a cardigan top-down without turning into a tube.' },
    { slug: 'dc2tog-g13', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the V-neck at the top of the cardigan.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down cardigans are a modern seamless garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('flat-yoke-g13', 'flat yoke'), t(` back-and-forth in rows from the neck cast-on. Increase outward at the raglan/yoke points. Separate sleeves at underarm. Continue the body back-and-forth for ${g13m.finishedMeasurements.body} cm. Add button bands at both front edges.`)),
      p(t(`Size M: neck cast-on ${g13m.neckStitches} sts, yoke ${g13m.yokeDepthRows} rows, body ${g13m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g13m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Yoke (flat)'),
      p(t(`Cast on ${g13m.neckStitches} sts. Work back-and-forth, applying `), gt('dc2tog-g13', 'dc2tog'), t(' for V-neck, plus yoke increases every other row for '), t(`${g13m.yokeDepthRows} rows.`)),
      h2('Body and sleeves'),
      p(t('Separate sleeves. Work body in rows. Add dc button bands along both front edges.')),
      h2('What to try next'),
      p(t('The top-down yoke pullover uses the same yoke but worked in the round for a closed front.')),
    ],
  },
},
{
  slug: 'set-in-sleeve-pullover',
  title: 'Set-in sleeve pullover',
  subtitle: 'A fitted pullover with shaped set-in sleeves in aran yarn.',
  excerpt: 'A more fitted pullover with shaped set-in sleeves in aran yarn. Front, back, and sleeves are all worked flat with armhole and sleeve-cap shaping. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g14m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['set in sleeve pullover crochet', 'fitted crochet sweater', 'armhole shaping crochet'],
  glossaryTerms: [
    { slug: 'armhole-set-in-g14', term: 'Armhole shaping', definition: 'Casting off stitches at the underarm and then decreasing along the armhole edge. Creates a curved opening that matches the sleeve cap curve.' },
    { slug: 'sleeve-cap-g14', term: 'Sleeve cap', definition: 'The curved top of the sleeve that is shaped to fit into the armhole. Shaped by increasing then decreasing stitches at the sleeve top edge.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Set-in sleeve construction is the classic tailored garment shape. Standard crochet garment technique.',
  body: {
    type: 'doc', content: [
      p(t('Set-in sleeves give the most fitted result. Both the body and the sleeves require shaped '), gt('armhole-set-in-g14', 'armhole'), t(' and '), gt('sleeve-cap-g14', 'sleeve cap'), t(' sections worked by decreasing along curved edges.')),
      p(t(`Size M: ${g14m.hemStitches} sts wide, ${g14m.finishedMeasurements.body} cm body, armhole depth ${g14m.yokeDepthRows} rows.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g14m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g14m.hemStitches + 2}. Work dc rows to underarm. `), gt('armhole-set-in-g14', 'Armhole shaping'), t(': cast off 4 sts each side, then decrease 1 st each end every row for 3 rows. Work even to shoulder.')),
      h2('Sleeves'),
      p(t(`Work sleeve body to ${g14m.finishedMeasurements.sleeve} cm. `), gt('sleeve-cap-g14', 'Sleeve cap'), t(': cast off 4 sts each end, decrease 1 st each end every row until cap matches armhole depth. Fasten off.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same pieces without the fitted shaping.')),
    ],
  },
},
{
  slug: 'lightweight-dk-yoke-pullover',
  title: 'Lightweight DK yoke pullover',
  subtitle: 'A seamless top-down yoke pullover in DK yarn for a lighter weight.',
  excerpt: 'A seamless top-down yoke pullover in DK yarn. Lighter than aran with a finer drape. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g15m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['DK yoke pullover crochet', 'lightweight crochet sweater', 'dk seamless jumper'],
  glossaryTerms: [
    { slug: 'dk-drape-g15', term: 'DK drape', definition: 'The softer, lighter handle of a double-knitting weight fabric compared to aran. DK gives a garment that moves more freely and is cooler to wear.' },
    { slug: 'dc2tog-g15', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the neckline at the top of the yoke.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'DK weight yoke pullovers are a popular modern garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the same structure as the top-down yoke pullover but in DK yarn for '), gt('dk-drape-g15', 'DK drape'), t('. Use '), gt('dc2tog-g15', 'dc2tog'), t(' to shape the neck.')),
      p(t(`Size M: neck ${g15m.neckStitches} sts, yoke ${g15m.yokeDepthRows} rows, bust ${g15m.bustStitches} sts.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g15m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g15m.neckStitches} sts in ring. Increase 6 sts every other round for ${g15m.yokeIncreaseRows} rounds.`)),
      h2('Body and sleeves'),
      p(t(`Separate ${g15m.sleeveBicepStitches} sleeve sts. Work body to ${g15m.finishedMeasurements.body} cm. Work each sleeve to ${g15m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t('The top-down yoke pullover uses the same structure in aran weight for a warmer result.')),
    ],
  },
},
{
  slug: 'side-to-side-pullover',
  title: 'Side-to-side pullover',
  subtitle: 'A drop-shoulder pullover worked sideways from cuff to cuff.',
  excerpt: 'A pullover worked horizontally from one cuff edge to the other. The fabric rows run vertically in the finished garment. Drop-shoulder shape. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g16m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['side to side pullover crochet', 'sideways sweater crochet', 'horizontal construction crochet'],
  glossaryTerms: [
    { slug: 'side-to-side-g16', term: 'Side-to-side construction', definition: 'Working the garment from one cuff across the body to the opposite cuff. The final piece is one continuous panel. The rows run vertically in the finished garment.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Side-to-side construction is a well-established alternative garment method.',
  body: {
    type: 'doc', content: [
      p(t('Work this pullover in '), gt('side-to-side-g16', 'side-to-side construction'), t(`. Start at the left cuff, work up the sleeve, across the body at full width, down the right sleeve, and finish at the right cuff. Work back and front as two separate panels.`)),
      p(t(`Size M: panel height ${g16m.finishedMeasurements.bust / 2} cm. Width from cuff to cuff: ${g16m.finishedMeasurements.sleeve * 2 + g16m.finishedMeasurements.body} cm approx.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g16m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front panel'),
      p(t(`Chain ${g16m.bustStitches / 2 + 2}. Work dc rows across from left cuff edge to right cuff edge. Total width: cuff + sleeve + body/2 + sleeve + cuff.`)),
      h2('Back panel'),
      p(t('Work same as front. Seam at shoulders and under-sleeve/side edge.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same shape worked in the more familiar bottom-up direction.')),
    ],
  },
},
{
  slug: 'top-down-raglan-cardigan',
  title: 'Top-down raglan cardigan',
  subtitle: 'A top-down raglan open cardigan worked flat.',
  excerpt: 'A top-down raglan cardigan worked flat from the neck down. Raglan increases run along four diagonal lines. Button bands added at the end. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g17m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['raglan cardigan crochet', 'top down open cardigan', 'crochet raglan jacket'],
  glossaryTerms: [
    { slug: 'raglan-flat-g17', term: 'Flat raglan', definition: 'A raglan yoke worked back-and-forth in rows rather than in the round. The front opening stays open throughout.' },
    { slug: 'dc2tog-g17', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck edge for V-neck shaping.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down raglan cardigans are a well-established modern garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('raglan-flat-g17', 'flat raglan'), t(` yoke back-and-forth in rows. Place markers at the four raglan points. Increase 2 sts at each marker every other row. Work `, ), gt('dc2tog-g17', 'dc2tog'), t(` at each front edge for V-neck. Continue for ${g17m.yokeDepthRows} rows.`)),
      p(t(`Size M: neck cast-on ${g17m.neckStitches} sts, yoke ${g17m.yokeDepthRows} rows.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g17m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g17m.neckStitches} sts. Work in rows; increase at 4 raglan points every other row. Apply V-neck `), gt('dc2tog-g17', 'decreases'), t(` at each front edge. Continue for ${g17m.yokeDepthRows} rows.`)),
      h2('Body and sleeves'),
      p(t('Separate sleeves. Work body flat. Work sleeves. Add button bands along front edges.')),
      h2('What to try next'),
      p(t('The top-down raglan pullover uses the same raglan yoke worked in the round.')),
    ],
  },
},
{
  slug: 'midi-crochet-dress',
  title: 'Midi crochet dress',
  subtitle: 'An oversized-fit drop-shoulder dress reaching the knee.',
  excerpt: 'An oversized drop-shoulder dress in aran yarn reaching below the knee. Works the same as the classic pullover but extends the body to dress length. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g18m.finishedMeasurements.bust} cm bust, ${g18m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet dress women', 'midi dress crochet', 'sweater dress crochet'],
  glossaryTerms: [
    { slug: 'midi-length-g18', term: 'Midi length', definition: `A dress hem falling at mid-calf or knee, typically 90 to 100 cm from the shoulder. Size M body is ${g18m.finishedMeasurements.body} cm in this pattern.` },
    { slug: 'dc2tog-g18', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck opening to shape the neckline.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet sweater dresses are a modern garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the same as a classic drop-shoulder pullover. Extend the body to '), gt('midi-length-g18', 'midi length'), t(`. Size M body is ${g18m.finishedMeasurements.body} cm. Use `, ), gt('dc2tog-g18', 'dc2tog'), t(' to shape the neckline.')),
      p(t(`Size M: ${g18m.hemStitches} sts wide, body ${g18m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g18m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g18m.hemStitches + 2}. Work dc rows for ${g18m.finishedMeasurements.body} cm. Shape neck with `), gt('dc2tog-g18', 'dc2tog'), t(' at each shoulder. Fasten off.')),
      h2('What to try next'),
      p(t('The oversized tunic is the same construction at a shorter body length.')),
    ],
  },
},
{
  slug: 'top-down-yoke-tunic',
  title: 'Top-down yoke tunic',
  subtitle: 'A seamless top-down yoke tunic in aran yarn reaching the high hip.',
  excerpt: 'A seamless top-down yoke tunic in aran yarn. Worked the same as the yoke pullover but with a longer body. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g19m.finishedMeasurements.bust} cm bust, ${g19m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['top down tunic crochet', 'yoke tunic crochet', 'long yoke sweater crochet'],
  glossaryTerms: [
    { slug: 'yoke-tunic-g19', term: 'Circular yoke', definition: 'A wide disc of dc fabric worked in the round from the neck, with increases radiating outward to form shoulders and sleeve tops.' },
    { slug: 'dc2tog-g19', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck edge to shape the neckline.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down seamless tunic lengths are a modern adaptation of the circular yoke method.',
  body: {
    type: 'doc', content: [
      p(t('Work the '), gt('yoke-tunic-g19', 'circular yoke'), t(` the same as the top-down yoke pullover. After separating the sleeves, continue the body for ${g19m.finishedMeasurements.body} cm instead of the standard pullover length. Use `), gt('dc2tog-g19', 'dc2tog'), t(' at neck edges.')),
      p(t(`Size M: yoke ${g19m.yokeDepthRows} rows, body ${g19m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g19m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g19m.neckStitches} sts. Work yoke increases for ${g19m.yokeDepthRows} rounds. Separate sleeves.`)),
      h2('Body'),
      p(t(`Work body in the round for ${g19m.finishedMeasurements.body} cm. Sleeve each separately to ${g19m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t('The top-down yoke pullover uses the same structure at standard pullover length.')),
    ],
  },
},
{
  slug: 'set-in-sleeve-cardigan',
  title: 'Set-in sleeve cardigan',
  subtitle: 'A fitted cardigan with shaped set-in sleeves in aran yarn.',
  excerpt: 'A fitted cardigan with set-in sleeve shaping. The most tailored crochet garment construction, with curved armholes and sleeve caps. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g20m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['set in sleeve cardigan crochet', 'fitted cardigan crochet', 'tailored crochet cardigan'],
  glossaryTerms: [
    { slug: 'sleeve-cap-g20', term: 'Sleeve cap', definition: 'The curved top of the sleeve worked by decreasing along both sleeve edges above the underarm. The cap height matches the armhole depth.' },
    { slug: 'dc2tog-g20', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for both armhole and sleeve-cap shaping.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Set-in sleeve construction is a standard tailored garment method.',
  body: {
    type: 'doc', content: [
      p(t('The most fitted crochet construction. Back, front, and sleeves all carry shaped '), gt('sleeve-cap-g20', 'sleeve caps'), t(' and armhole curves. Use '), gt('dc2tog-g20', 'dc2tog'), t(' to work the curved edges. The result sits more closely to the arm than a drop-shoulder or raglan.')),
      p(t(`Size M: ${g20m.hemStitches} sts wide, ${g20m.finishedMeasurements.body} cm body. Armhole depth ${g20m.yokeDepthRows} rows.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g20m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '6' },
      ]),
      h2('Back'),
      p(t(`Chain ${g20m.hemStitches + 2}. Work dc to underarm. Shape armhole: cast off 4 sts each end, then `), gt('dc2tog-g20', 'dc2tog'), t(' each end for 3 rows. Work to shoulder.')),
      h2('Front halves'),
      p(t('Work each front half separately. Apply armhole shaping as for back. Shape neck at top.')),
      h2('Sleeves'),
      p(t(`Chain ${g20m.sleeveCuffStitches + 2}. Work to ${g20m.finishedMeasurements.sleeve} cm. `), gt('sleeve-cap-g20', 'Sleeve cap'), t(': cast off 4 sts, then decrease each end every row until cap is ${g20m.yokeDepthRows} rows tall. Fasten off.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan uses the same shape without the armhole shaping curves.')),
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
