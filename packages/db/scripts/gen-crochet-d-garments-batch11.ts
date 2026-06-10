/**
 * Generator: D-Garments Batch 11 -- Summer/cotton garments G101-G110
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch11.ts
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

// G101 -- cotton T-shirt, DROP_SHOULDER PULLOVER, dk, 4mm, POSITIVE_4 ease
const g101 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g101m = g101.find(g => g.size === 'M')!

// G102 -- spaghetti strap top, DROP_SHOULDER TANK, dk, 4mm, ZERO ease
const g102 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'ZERO', garmentType: 'TANK', options: { yarnWeightCategory: 3 } })
const g102m = g102.find(g => g.size === 'M')!

// G103 -- off-shoulder top, DROP_SHOULDER PULLOVER, dk, 4mm, POSITIVE_4 ease
const g103 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g103m = g103.find(g => g.size === 'M')!

// G104 -- halter neck top, DROP_SHOULDER TANK, dk, 4mm, ZERO ease
const g104 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'ZERO', garmentType: 'TANK', options: { yarnWeightCategory: 3 } })
const g104m = g104.find(g => g.size === 'M')!

// G105 -- wrap-style top, DROP_SHOULDER PULLOVER, dk, 4mm, POSITIVE_4 ease
const g105 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g105m = g105.find(g => g.size === 'M')!

// G106 -- festival vest, DROP_SHOULDER VEST, dk, 4mm, POSITIVE_4 ease
const g106 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST', options: { yarnWeightCategory: 3 } })
const g106m = g106.find(g => g.size === 'M')!

// G107 -- maxi dress, DROP_SHOULDER DRESS, dk, 4mm, POSITIVE_4 ease
const g107 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS', options: { yarnWeightCategory: 3, bodyLengthAdjustCm: 60 } })
const g107m = g107.find(g => g.size === 'M')!

// G108 -- smock dress, DROP_SHOULDER DRESS, dk cotton, 4mm, POSITIVE_4 ease
const g108 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS', options: { yarnWeightCategory: 3 } })
const g108m = g108.find(g => g.size === 'M')!

// G109 -- shirt dress, DROP_SHOULDER DRESS, aran, 5mm, POSITIVE_4 ease
const g109 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS', options: { yarnWeightCategory: 4 } })
const g109m = g109.find(g => g.size === 'M')!

// G110 -- playsuit, DROP_SHOULDER TANK, dk cotton, 4mm, ZERO ease
const g110 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'ZERO', garmentType: 'TANK', options: { yarnWeightCategory: 3 } })
const g110m = g110.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'cotton-tee-crochet',
  title: 'Cotton crochet T-shirt',
  excerpt: 'A lightweight drop-shoulder T-shirt in dk cotton. Worked flat in two panels and seamed. Short sleeves finished with a dc edging. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g101m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cotton T-shirt crochet', 'summer crochet tee', 'basic crochet top'],
  glossaryTerms: [
    { slug: 'dk-cotton-g101', term: 'DK cotton', definition: 'A smooth, non-elastic yarn in weight category 3. Cotton produces a structured, breathable fabric that drapes well for summer garments.' },
    { slug: 'dc-edging-g101', term: 'DC edging', definition: 'A single row of double crochet worked around a finished edge. On sleeves and hems it creates a clean line and prevents the edge from curling.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cotton T-shirts are a foundational summer crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('dk-cotton-g101', 'dk cotton'), t(' for a breathable summer fabric. Work back and front as matching flat panels. Short sleeves are worked as shorter panels and seamed at the top and sides. Finish all edges with a '), gt('dc-edging-g101', 'dc edging'), t(' round.')),
      p(t(`Size M: ${g101m.hemStitches} sts wide, ${g101m.finishedMeasurements.body} cm body. Sleeve: 15 cm length.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g101m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g101m.hemStitches + 2}. Work dc for ${g101m.finishedMeasurements.body} cm. Shape crew neck with `), gt('dc-edging-g101', 'dc edging'), t(' around neckline. Fasten off.')),
      h2('Short sleeves (make 2)'),
      p(t(`Chain ${g101m.sleeveBicepStitches + 2}. Work dc for 15 cm. Add dc edging at lower sleeve. Seam to body.`)),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Add dc edging around neckline and hem.')),
      h2('What to try next'),
      p(t('The spaghetti strap top uses the same dk cotton in a sleeveless tank shape with narrow shoulder straps.')),
    ],
  },
},
{
  slug: 'spaghetti-strap-top-crochet',
  title: 'Spaghetti strap crochet top',
  excerpt: 'A close-fitting sleeveless top with narrow crocheted spaghetti straps in dk cotton. Worked in two flat panels with straps added after seaming. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g102m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['spaghetti strap crochet top', 'thin strap summer top crochet', 'crochet cami top'],
  glossaryTerms: [
    { slug: 'spaghetti-strap-g102', term: 'Spaghetti strap', definition: 'A narrow strap crocheted as a long chain-and-slip-stitch cord or a very narrow 2-stitch dc strip. Crossed at the back for a secure fit.' },
    { slug: 'zero-ease-g102', term: 'Zero ease', definition: 'A finished bust measurement that matches the body measurement exactly. The fabric sits against the body without extra room. Works best in cotton which has no stretch.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Spaghetti strap tops are a popular summer crochet project.',
  body: {
    type: 'doc', content: [
      p(t('This top uses '), gt('zero-ease-g102', 'zero ease'), t(' for a fitted silhouette. Work the body as two panels seamed at sides. Shape the top edge with a straight line across the bust. Crochet four '), gt('spaghetti-strap-g102', 'spaghetti straps'), t(' and attach at front and back top corners, crossing at the back.')),
      p(t(`Size M: ${g102m.hemStitches} sts wide, ${g102m.finishedMeasurements.body} cm body. Straps: 45 cm each.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g102m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body panels (make 2)'),
      p(t(`Chain ${g102m.hemStitches + 2}. Work dc for ${g102m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Straps (make 4)'),
      p(t('Chain 90. Sl st back along chain. Attach two straps at front top corners and two at back top corners. Cross straps at back.')),
      h2('Finishing'),
      p(t('Seam sides. Work one row dc around top edge and hem.')),
      h2('What to try next'),
      p(t('The halter neck top uses a similar body with ties that meet at the back of the neck instead of straps.')),
    ],
  },
},
{
  slug: 'off-shoulder-top-crochet',
  title: 'Off-shoulder crochet top',
  excerpt: 'A drop-shoulder top with a wide, low neckline that sits off the shoulders. Worked in dk cotton with an elastic-threaded neck edging. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g103m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['off shoulder crochet top', 'bardot neckline crochet', 'wide neck summer top crochet'],
  glossaryTerms: [
    { slug: 'off-shoulder-neck-g103', term: 'Off-shoulder neckline', definition: 'A very wide neck opening that extends past the shoulder points. The neckline sits across the upper arms, leaving shoulders bare. A channel at the neckline holds a narrow elastic to keep the top in place.' },
    { slug: 'neck-channel-g103', term: 'Neck channel', definition: 'A small folded casing at the top edge of the garment formed by working a row of dc away from the body and joining it back to the inside. Elastic fed through the channel keeps the neckline stable.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Off-shoulder tops are a classic summer wardrobe piece.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front in plain dc. The '), gt('off-shoulder-neck-g103', 'off-shoulder neckline'), t(' is achieved by starting with a wider-than-usual chain and not shaping a neck curve. After seaming, work a '), gt('neck-channel-g103', 'neck channel'), t(' across the full width of the top edge. Thread 1 cm elastic through the channel and secure.')),
      p(t(`Size M: ${g103m.hemStitches} sts wide, ${g103m.finishedMeasurements.body} cm body. Neck width: full panel width.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g103m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Narrow elastic, 1 cm wide', qty: `${g103m.finishedMeasurements.bust + 10} cm` },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g103m.hemStitches + 2}. Work dc for ${g103m.finishedMeasurements.body} cm. No neck shaping. Fasten off.`)),
      h2('Neck channel'),
      p(t('Join yarn at top corner. Work 3 rows dc across top edge. Fold inward and sl st to inside. Feed elastic through.')),
      h2('What to try next'),
      p(t('The cotton T-shirt uses a standard crew neck on the same dk cotton base.')),
    ],
  },
},
{
  slug: 'crochet-halter-top',
  title: 'Crochet halter neck top',
  excerpt: 'A fitted halter neck top in dk cotton. The front panel tapers to a point and ties behind the neck. A wide tie wraps around the back. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g104m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-dc2tog'],
  aliases: ['halter neck crochet top', 'crochet halter', 'summer halter top crochet'],
  glossaryTerms: [
    { slug: 'halter-taper-g104', term: 'Halter taper', definition: 'Decreasing both sides of the front panel every 2 rows until only a narrow strip remains. This strip becomes the neck tie that fastens behind the neck.' },
    { slug: 'back-tie-g104', term: 'Back tie', definition: 'A long chain or dc strip attached at each side of the top edge of the back panel. The ties cross and wrap around to fasten at the front waist, holding the back section in place.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Halter neck tops are a perennial summer crochet favourite.',
  body: {
    type: 'doc', content: [
      p(t('Work the front panel in dc, decreasing both sides with '), gt('halter-taper-g104', 'halter taper'), t(' shaping from the bust up. When the panel is 4 sts wide, work straight for 40 cm for the neck tie. For the back, work a plain rectangle and add '), gt('back-tie-g104', 'back ties'), t(' at each top corner.')),
      p(t(`Size M: ${g104m.hemStitches} sts at hem, tapering to 4 sts at neck. Body ${g104m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g104m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front panel'),
      p(t(`Chain ${g104m.hemStitches + 2}. Work dc for ${g104m.finishedMeasurements.body} cm. Apply `), gt('halter-taper-g104', 'halter taper'), t(' decreasing 1 st each side every 2 rows. When 4 sts remain, work 40 cm neck tie strip. Fasten off.')),
      h2('Back panel'),
      p(t(`Chain ${g104m.hemStitches + 2}. Work dc for ${g104m.finishedMeasurements.body} cm. Fasten off. Attach `), gt('back-tie-g104', 'back ties'), t(' at each top corner.')),
      h2('What to try next'),
      p(t('The spaghetti strap top uses a straight-cut front with narrow straps rather than a tapered halter.')),
    ],
  },
},
{
  slug: 'crochet-wrap-top',
  title: 'Crochet wrap top',
  excerpt: 'A front-wrap top in dk cotton with long ties that cross at the waist and fasten at the back. Drop-shoulder construction. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g105m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet wrap top', 'wrap style crochet blouse', 'summer wrap crochet'],
  glossaryTerms: [
    { slug: 'wrap-front-g105', term: 'Wrap front', definition: 'Two front panels that overlap each other at the centre front. The left panel crosses over the right and ties at the right side seam; the right panel has a tie that crosses the back and fastens at the left side seam.' },
    { slug: 'v-shaping-g105', term: 'V-neckline shaping', definition: 'Decreasing at the inner edge of each front panel to create an angled neckline. The angle of decrease determines how deep the V sits at the chest.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wrap tops are a versatile summer garment style popular in crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work the back as a standard drop-shoulder panel. Work two front halves, each with '), gt('v-shaping-g105', 'V-neckline shaping'), t(' at the inner edge. Each front half has a long dc tie at the lower inner corner. The '), gt('wrap-front-g105', 'wrap front'), t(' is formed by crossing the panels and tying at opposite side seams.')),
      p(t(`Size M: back ${g105m.hemStitches} sts wide. Each front half: ${Math.round(g105m.hemStitches * 0.6)} sts. Body ${g105m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g105m.yarnRequiredYards + 50} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g105m.hemStitches + 2}. Work dc for ${g105m.finishedMeasurements.body} cm. Shape crew neck. Fasten off.`)),
      h2('Front halves (make 2, mirrored)'),
      p(t(`Chain ${Math.round(g105m.hemStitches * 0.6) + 2}. Work dc for ${g105m.finishedMeasurements.body} cm. Apply `), gt('v-shaping-g105', 'V shaping'), t(' at inner edge. Work 60 cm tie at lower inner corner. Fasten off.')),
      h2('What to try next'),
      p(t('The off-shoulder top uses the same dk cotton base with a wide elastic neckline instead of a wrap front.')),
    ],
  },
},
{
  slug: 'festival-vest-crochet',
  title: 'Festival mesh vest',
  excerpt: 'An open-stitch treble mesh vest in dk yarn. The all-over mesh fabric is light and airy, layered over a vest or swimwear. Drop-shoulder shape. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 sts x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g106m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-treble', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-treble', 'crochet-double-uk'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['festival vest crochet', 'mesh crochet vest', 'open stitch summer vest crochet'],
  glossaryTerms: [
    { slug: 'treble-mesh-g106', term: 'Treble mesh', definition: 'A fabric made by alternating treble crochet stitches with chain spaces. Each row sits the trebles into the chain spaces of the previous row. The result is an open, regular grid.' },
    { slug: 'ch-sp-g106', term: 'Chain space', definition: 'The gap left by a chain in the previous row. Trebles are worked into these gaps rather than into individual stitches, keeping the mesh pattern consistent.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Mesh crochet vests are a popular festival and summer layering piece.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front in '), gt('treble-mesh-g106', 'treble mesh'), t(' throughout. Row 1: chain multiples of 2 plus 3. Work 1 tr, ch-1 across. Row 2: ch 4, tr into each '), gt('ch-sp-g106', 'chain space'), t(' across. Repeat Row 2 for length.')),
      p(t(`Size M: ${g106m.hemStitches} sts foundation, ${g106m.finishedMeasurements.body} cm body. Armholes shaped by leaving top corners unseamed.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g106m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain even number near ${g106m.hemStitches + 3}. Work `), gt('treble-mesh-g106', 'treble mesh'), t(` for ${g106m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Finishing'),
      p(t('Seam shoulders (10 cm each side). Seam sides leaving 20 cm armhole open at top. No armhole edging needed on mesh.')),
      h2('What to try next'),
      p(t('The cotton T-shirt uses the same hook size in solid dc for a more structured summer layer.')),
    ],
  },
},
{
  slug: 'crochet-maxi-dress',
  title: 'Crochet maxi dress',
  excerpt: 'A floor-length drop-shoulder maxi dress in dk yarn. Worked as extended back and front panels seamed at sides and shoulders. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g107m.finishedMeasurements.bust} cm bust, approx 135 cm length.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet maxi dress', 'floor length crochet dress', 'long crochet dress pattern'],
  glossaryTerms: [
    { slug: 'skirt-flare-g107', term: 'Skirt flare', definition: 'Increasing 1 stitch each side every 8 to 10 rows in the lower half of the dress body. The flare adds volume at the hem for ease of movement without a full gathered skirt construction.' },
    { slug: 'dc2tog-g107', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the neck opening on both back and front panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Maxi dresses are a summer staple and a satisfying long crochet project.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front as tall flat panels. The skirt section uses '), gt('skirt-flare-g107', 'skirt flare'), t(' increases to add volume below the hip. Shape the crew neck with '), gt('dc2tog-g107', 'dc2tog'), t(' on both panels. Seam at shoulders and sides.')),
      p(t(`Size M: ${g107m.hemStitches} sts wide at hem (before flare). Body ${g107m.finishedMeasurements.body} cm total. Short sleeve: 15 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g107m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g107m.hemStitches + 2}. Work dc for ${Math.round(g107m.finishedMeasurements.body * 0.5)} cm bodice. Add `), gt('skirt-flare-g107', 'skirt flare'), t(` for remaining ${Math.round(g107m.finishedMeasurements.body * 0.5)} cm. Shape neck. Fasten off.`)),
      h2('Short sleeves (make 2)'),
      p(t(`Chain ${g107m.sleeveBicepStitches + 2}. Work dc for 15 cm. Fasten off.`)),
      h2('What to try next'),
      p(t('The smock dress uses a similar length with a gathered bodice worked in smocking rows for texture.')),
    ],
  },
},
{
  slug: 'smock-dress-crochet',
  title: 'Smocked bodice crochet dress',
  excerpt: 'A knee-length dress with a textured smocked bodice in dk cotton. The bodice uses fpdc columns to mimic smocking. Skirt in plain dc. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g108m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-fpdc'],
  aliases: ['smocked bodice crochet dress', 'crochet smock dress', 'textured bodice dress crochet'],
  glossaryTerms: [
    { slug: 'smocking-cols-g108', term: 'Smocking columns', definition: 'Vertical fpdc worked into stitches 2 rows below on an otherwise dc row. The long post pulls the fabric in, creating a gathered, smocked texture across the bodice.' },
    { slug: 'fpdc-g108', term: 'Front post double crochet', definition: 'A dc worked around the vertical post of a stitch from the front. Used in the smocking columns to draw the fabric together and create the smocked effect.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Smocked garments translate well into crochet using front-post techniques.',
  body: {
    type: 'doc', content: [
      p(t('Work the bodice in dc with '), gt('smocking-cols-g108', 'smocking columns'), t(' using '), gt('fpdc-g108', 'fpdc'), t(' every 4 stitches. Work the skirt in plain dc. The fpdc columns draw the bodice in, so the bodice chain count starts slightly wider than the skirt.')),
      p(t(`Size M: bodice ${Math.round(g108m.hemStitches * 1.1)} sts, skirt ${g108m.hemStitches} sts. Total length approx 80 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g108m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Bodice (back and front, make 2)'),
      p(t(`Chain ${Math.round(g108m.hemStitches * 1.1) + 2}. Row 1: dc across. Row 2: dc to first smocking point, `), gt('fpdc-g108', 'fpdc'), t(` into stitch 2 rows below, repeat every 4 sts. Continue for 30 cm.`)),
      h2('Skirt (back and front, make 2)'),
      p(t(`Chain ${g108m.hemStitches + 2}. Work dc for 50 cm. Fasten off.`)),
      h2('Finishing'),
      p(t('Join bodice to skirt with a row of dc. Seam shoulders and sides.')),
      h2('What to try next'),
      p(t('The shirt-style dress uses a collar and front placket for a tailored alternative to the smocked bodice.')),
    ],
  },
},
{
  slug: 'shirt-dress-crochet',
  title: 'Crochet shirt dress',
  excerpt: 'A knee-length shirt-style dress with a flat collar and button placket in aran yarn. Drop-shoulder construction with a belted waist option. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g109m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['shirt dress crochet', 'crochet shirtwaist dress', 'collar dress crochet pattern'],
  glossaryTerms: [
    { slug: 'shirt-collar-g109', term: 'Flat shirt collar', definition: 'A collar worked as a flat dc rectangle, folded over the neckline and attached by sewing. The short ends of the collar meet at the centre front placket.' },
    { slug: 'button-placket-g109', term: 'Button placket', definition: 'A dc band worked along the centre front opening of the dress. One side has dc eyelet buttonholes; buttons are sewn to the other side.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Shirt dresses are a classic tailored garment adapted well to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels in dc. The front has a centre split from the hem up for 40 cm, forming the '), gt('button-placket-g109', 'button placket'), t(' opening. After seaming, attach the '), gt('shirt-collar-g109', 'flat shirt collar'), t(' around the neckline.')),
      p(t(`Size M: ${g109m.hemStitches} sts wide, total length approx 90 cm. Sleeve: ${g109m.finishedMeasurements.sleeve} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g109m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '6' },
      ]),
      h2('Back'),
      p(t(`Chain ${g109m.hemStitches + 2}. Work dc for 90 cm. Shape crew neck. Fasten off.`)),
      h2('Front halves (make 2, mirrored)'),
      p(t(`Chain ${Math.round(g109m.hemStitches / 2) + 2}. Work dc for 90 cm. Shape neck. Work `), gt('button-placket-g109', 'button placket'), t(' along centre edge. Fasten off.')),
      h2('Collar'),
      p(t('Chain 90. Work dc for 8 cm. Fold and attach around neck opening. Short ends meet at placket.')),
      h2('What to try next'),
      p(t('The smock dress uses a rounded neckline and textured bodice for a softer alternative to the shirt collar.')),
    ],
  },
},
{
  slug: 'crochet-playsuit',
  title: 'Crochet playsuit',
  excerpt: 'A one-piece playsuit in dk cotton with a tank bodice and shorts-length legs. The bodice and shorts are worked separately and joined at the waist. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk cotton on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g110m.finishedMeasurements.bust} cm bust, 30 cm leg length.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet playsuit', 'crochet romper pattern', 'one piece summer crochet'],
  glossaryTerms: [
    { slug: 'crotch-gusset-g110', term: 'Crotch gusset', definition: 'A small rectangular dc panel worked between the two leg tubes at the crotch point. The gusset adds length and ease at the join, preventing pulling when the wearer moves.' },
    { slug: 'waist-join-g110', term: 'Waist join', definition: 'The row where the bodice lower edge and shorts waistband meet. Both pieces are aligned and joined with a row of dc worked through both thicknesses to create a clean, flat seam.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Playsuits are a popular summer one-piece garment adapted well to crochet construction.',
  body: {
    type: 'doc', content: [
      p(t('Work the tank bodice and the shorts section separately, then join at the '), gt('waist-join-g110', 'waist'), t('. The shorts are worked as two flat leg pieces joined at the inner seam with a '), gt('crotch-gusset-g110', 'crotch gusset'), t(' added at the join point.')),
      p(t(`Size M: bodice ${g110m.hemStitches} sts wide, ${g110m.finishedMeasurements.body} cm long. Each leg: ${Math.round(g110m.hemStitches * 0.55)} sts wide, 30 cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK cotton yarn', qty: `${g110m.yarnRequiredYards + 100} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Tank bodice'),
      p(t(`Work back and front panels in dc, ${g110m.hemStitches} sts wide, ${g110m.finishedMeasurements.body} cm long. Add narrow straps or wide armhole edging. Seam shoulders and sides.`)),
      h2('Shorts legs (make 2)'),
      p(t(`Chain ${Math.round(g110m.hemStitches * 0.55) + 2}. Work dc for 30 cm. Join inner seam. Add `), gt('crotch-gusset-g110', 'crotch gusset'), t(' between the two leg tubes.')),
      h2('Joining'),
      p(t('Align bodice lower edge with shorts waistband. Work '), gt('waist-join-g110', 'waist join'), t(' row through both thicknesses. Work dc edging along all openings.')),
      h2('What to try next'),
      p(t('The spaghetti strap top is the bodice section worked as a standalone summer top.')),
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
    sourceType: 'SYNTHESISED',
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
