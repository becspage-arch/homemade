/**
 * Generator: D-Amigurumi Batch 15 -- A141-A150 Plants and Nature Objects
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch15.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sphere, cylinder, cone, oval } from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-amigurumi')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

function savePattern(slug: string, out: object) {
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}.json`)
}

// ── A141 ── Green Cactus ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-cactus'
  const body = cylinder({ diameterCm: 6, heightCm: 10, gauge: GAUGE, closeBothEnds: true, label: 'Body' })
  const arm = cylinder({ diameterCm: 3, heightCm: 5, gauge: GAUGE, closeBothEnds: true, label: 'Arm (make 2)' })
  const spine = cone({ baseDiameterCm: 1, heightCm: 2, gauge: GAUGE, label: 'Spine accent (make several)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A chunky green cactus with a tall cylinder body and two shorter cylinder arms. Small cone accents suggest spines without needing to embroider each one. The finished piece stands on its own when firmly stuffed.')),
    h2('Body'),
    p(t('Rounds: ' + body.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and work the flat base. '), gt('amigurumi-increase', 'Increase'), t(' up the sides then work straight, closing the top at the end.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t('Rounds: ' + arm.totalRounds + ' per arm. Work a short cylinder and stuff before closing. Leave a long tail to sew to the body side.')),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Spine accents (make several)'),
    p(t('Rounds: ' + spine.totalRounds + ' per spine. Work each tiny cone and sew in groups of three across the body at regular intervals.')),
    ...spine.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Stuff the body firmly. Use the '), gt('stuffing-and-closing', 'stuffing and closing'), t(' method so it stands upright. Sew one arm to each side of the body, about one third of the way up. If an arm looks too wide at the join, work a few '), gt('amigurumi-decrease', 'decrease'), t(' stitches at the base before sewing. Position spine accents in vertical rows.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps every piece seamless.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g, each spine ' + spine.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Cactus', subtitle: '', excerpt: 'A chunky green cactus with a cylinder body and two shorter arms. Small cone accents add the suggestion of spines.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a plant-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['cactus amigurumi', 'crochet cactus', 'crochet plant toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm tall body, arms 5 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A142 ── Yellow Sunflower ──────────────────────────────────────────────────
{
  const slug = 'amigurumi-sunflower'
  const stem = cylinder({ diameterCm: 2, heightCm: 8, gauge: GAUGE, closeBothEnds: true, label: 'Stem' })
  const centre = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Centre' })
  const petal = oval({ longAxisCm: 5, shortAxisCm: 2, gauge: GAUGE, label: 'Petal (make 12)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A bright sunflower made from a sphere centre in dark brown or gold, twelve flat oval petals in yellow, and a slim green cylinder stem. The petals radiate out from behind the centre and are sewn on individually.')),
    h2('Stem'),
    p(t('Rounds: ' + stem.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and work the cylinder straight, stuffing before you close the top end.')),
    ...stem.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Centre'),
    p(t('Rounds: ' + centre.totalRounds + '. Work a sphere, stuffing before '), gt('stuffing-and-closing', 'closing'), t('. The finished centre should be about 5 cm across.')),
    ...centre.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Petals (make 12)'),
    p(t('Rounds: ' + petal.totalRounds + ' per petal. Work each oval flat without stuffing. Leave a 15 cm tail for sewing. '), gt('amigurumi-increase', 'Increase'), t(' at both narrow ends to shape the tip.')),
    ...petal.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the twelve petals evenly around the back face of the centre, pointing outward. Attach the base of the centre to the top of the stem. If any petal is too wide at the base, '), gt('amigurumi-decrease', 'decrease'), t(' one stitch before pinning it in place. The petals frame the centre on all sides.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps every piece seam-free.')),
    p(t('Estimated yarn: stem ' + stem.yarnRequiredGrams + ' g, centre ' + centre.yarnRequiredGrams + ' g, each petal ' + petal.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Sunflower', subtitle: '', excerpt: 'A bright sunflower with a sphere centre, twelve flat oval petals, and a slim green cylinder stem.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a plant-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['sunflower amigurumi', 'crochet sunflower', 'crochet flower toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm tall including stem. Centre 5 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A143 ── Red Rose ──────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-rose'
  const centre = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Centre bud' })
  const innerPetal = cone({ baseDiameterCm: 3, heightCm: 4, gauge: GAUGE, label: 'Inner petal (make 5)' })
  const outerPetal = cone({ baseDiameterCm: 4, heightCm: 5, gauge: GAUGE, label: 'Outer petal (make 7)' })
  const stem = cylinder({ diameterCm: 1.5, heightCm: 8, gauge: GAUGE, closeBothEnds: true, label: 'Stem' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-decrease', 'working-in-the-round']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { termSlug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A layered red rose built from a small sphere bud, five inner spiral cone petals, and seven wider outer cone petals. The petals curl naturally when worked in DK yarn and are sewn around the bud in two rings.')),
    h2('Centre bud'),
    p(t('Rounds: ' + centre.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and increase to a small sphere, stuffing before '), gt('stuffing-and-closing', 'closing'), t('.')),
    ...centre.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Inner petals (make 5)'),
    p(t('Rounds: ' + innerPetal.totalRounds + ' per petal. Work each cone starting at the tip with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Do not stuff; the petal curls on its own. Leave a long tail.')),
    ...innerPetal.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Outer petals (make 7)'),
    p(t('Rounds: ' + outerPetal.totalRounds + ' per petal. Work as for the inner petals but wider. The extra width gives a gentle outward flare.')),
    ...outerPetal.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Stem'),
    p(t('Rounds: ' + stem.totalRounds + '. Work a slim cylinder in green. Add a '), gt('colour-change', 'colour change'), t(' to a darker green for two leaf rows near the top if desired.')),
    ...stem.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the five inner petals around the bud, overlapping slightly. Use a '), gt('amigurumi-decrease', 'decrease'), t(' at the base of any petal that is too wide at the join before stitching. Sew the seven outer petals behind the inner ring, staggered so they show between the inner petals. Attach the bud-and-petal head to the top of the stem.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' keeps every piece seam-free and helps the petals curl evenly.')),
    p(t('Estimated yarn: bud ' + centre.yarnRequiredGrams + ' g, each inner petal ' + innerPetal.yarnRequiredGrams + ' g, each outer petal ' + outerPetal.yarnRequiredGrams + ' g, stem ' + stem.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Rose', subtitle: '', excerpt: 'A layered red rose with a sphere bud, five inner cone petals, seven outer cone petals, and a slim green stem.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a flower-themed intermediate piece.',
    techniqueSlugs, criticalTechniques, aliases: ['rose amigurumi', 'crochet rose', 'crochet flower bouquet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall including stem. Rose head 7 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A144 ── Green Oak Tree ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-tree-oak'
  const trunk = cylinder({ diameterCm: 4, heightCm: 8, gauge: GAUGE, closeBothEnds: true, label: 'Trunk' })
  const foliage = sphere({ diameterCm: 12, gauge: GAUGE, label: 'Foliage ball' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A classic oak tree with a brown cylinder trunk and a large round green foliage ball. The contrast between the straight trunk and the full rounded canopy captures the oak silhouette. Both pieces are stuffed firmly so the tree stands without support.')),
    h2('Trunk'),
    p(t('Rounds: ' + trunk.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and work the flat base. '), gt('amigurumi-increase', 'Increase'), t(' up the sides then work straight before closing the top.')),
    ...trunk.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Foliage ball'),
    p(t('Rounds: ' + foliage.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Begin '), gt('amigurumi-decrease', 'decreasing'), t(' on the way back, stuffing before the last few rounds close.')),
    ...foliage.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Flatten the top of the trunk slightly and sew the foliage ball centred on top. '), gt('stuffing-and-closing', 'Stuffing and closing'), t(' the trunk firmly before joining ensures it can hold the weight of the canopy.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' keeps both pieces seam-free.')),
    p(t('Estimated yarn: trunk ' + trunk.yarnRequiredGrams + ' g, foliage ' + foliage.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Oak Tree', subtitle: '', excerpt: 'A classic oak tree with a brown cylinder trunk and a large round green foliage ball. Both pieces are stuffed firmly so the tree stands on its own.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a nature-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['oak tree amigurumi', 'crochet tree', 'crochet oak toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm tall. Foliage ball 12 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A145 ── White Cloud ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-cloud'
  const mainBall = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Main sphere' })
  const sideBall = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Side sphere (make 2)' })
  const base = oval({ longAxisCm: 10, shortAxisCm: 5, gauge: GAUGE, label: 'Flat base' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A white cloud made from three spheres joined together with a flat oval base. The central sphere is the largest; two smaller spheres flank it. The flat base gives the cloud a stable sit-down shape.')),
    h2('Main sphere'),
    p(t('Rounds: ' + mainBall.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff then '), gt('amigurumi-decrease', 'decrease'), t(' back. Close firmly.')),
    ...mainBall.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Side spheres (make 2)'),
    p(t('Rounds: ' + sideBall.totalRounds + ' per sphere. Work two smaller spheres the same way. Stuff each before '), gt('stuffing-and-closing', 'closing'), t('.')),
    ...sideBall.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Flat base'),
    p(t('Rounds: ' + base.totalRounds + '. Work the oval flat and do not stuff. This piece is sewn across the underside of the three joined spheres.')),
    ...base.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew one side sphere to each side of the main sphere so they overlap slightly at the join. Stitch the flat oval base across the underside of all three. '), gt('working-in-the-round', 'Working in the round'), t(' keeps every sphere seamless.')),
    p(t('Estimated yarn: main sphere ' + mainBall.yarnRequiredGrams + ' g, each side sphere ' + sideBall.yarnRequiredGrams + ' g, base ' + base.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Cloud', subtitle: '', excerpt: 'A white cloud made from three spheres joined together with a flat oval base. Simple construction with a satisfying puffy result.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi sphere construction for a weather-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['cloud amigurumi', 'crochet cloud', 'crochet weather toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm wide x 10 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A146 ── Rainbow ───────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-rainbow'
  const arc = cylinder({ diameterCm: 3, heightCm: 18, gauge: GAUGE, closeBothEnds: true, label: 'Arc body (worked in stripes)' })
  const cloud = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Cloud end (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'colour-change', 'stuffing-and-closing']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { termSlug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A cheerful rainbow arc worked in six colour stripes along a stuffed cylinder, with a small white cloud ball at each end. The arc is shaped by bending and tacking the stuffed cylinder into a curve once complete.')),
    h2('Arc body'),
    p(t('Rounds: ' + arc.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and work straight, changing colour every 3 rounds using a '), gt('colour-change', 'colour change'), t('. Work six stripes: red, orange, yellow, green, blue, and violet. Stuff as you go to make shaping easier.')),
    ...arc.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Cloud ends (make 2)'),
    p(t('Rounds: ' + cloud.totalRounds + ' per cloud. Work a small white sphere, '), gt('stuffing-and-closing', 'stuffing and closing'), t(' before the last round. Leave a long tail for sewing.')),
    ...cloud.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Bend the stuffed arc gently into a curve and tack the shape by running a yarn thread through the underside at the midpoint. Each cloud ball is made by working '), gt('amigurumi-increase', 'increases'), t(' to the equator and then '), gt('amigurumi-decrease', 'decreases'), t(' back to close. Sew one cloud ball to each end of the arc, covering the closing stitches.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the stripe joins neat on both pieces.')),
    p(t('Estimated yarn: arc ' + arc.yarnRequiredGrams + ' g total across all stripes, each cloud ' + cloud.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Rainbow', subtitle: '', excerpt: 'A cheerful rainbow arc worked in six colour stripes along a stuffed cylinder, with a white cloud ball at each end.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a weather-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['rainbow amigurumi', 'crochet rainbow', 'rainbow cloud toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm wide arc. Cloud ends 5 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A147 ── Blue Raindrop ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-raindrop'
  const top = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Sphere top' })
  const bottom = cone({ baseDiameterCm: 5, heightCm: 4, gauge: GAUGE, label: 'Cone bottom' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-decrease', 'stuffing-and-closing']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A compact blue raindrop about 7 cm tall, made from a sphere top and a cone bottom. The sphere forms the rounded upper body and the cone tapers to the classic raindrop point. Both pieces are stuffed before joining.')),
    h2('Sphere top'),
    p(t('Rounds: ' + top.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff, then '), gt('amigurumi-decrease', 'decrease'), t(' back without fully closing, leaving an opening to join the cone.')),
    ...top.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Cone bottom'),
    p(t('Rounds: ' + bottom.totalRounds + '. Start at the point with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward to the base. Stuff lightly before '), gt('stuffing-and-closing', 'closing'), t('.')),
    ...bottom.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Match the open base of the sphere to the open top of the cone. Stitch the two pieces together around the join ring. The seam sits at the widest point and is hidden by the curves on either side.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both pieces seam-free.')),
    p(t('Estimated yarn: sphere ' + top.yarnRequiredGrams + ' g, cone ' + bottom.yarnRequiredGrams + ' g. Total approx. 7 cm tall.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Raindrop', subtitle: '', excerpt: 'A compact blue raindrop about 7 cm tall with a sphere top and a tapering cone bottom.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a weather-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['raindrop amigurumi', 'crochet raindrop', 'weather amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 7 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A148 ── White Snowflake ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-snowflake'
  const centre = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Centre disc' })
  const arm = cone({ baseDiameterCm: 2, heightCm: 5, gauge: GAUGE, label: 'Arm (make 6)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-decrease', 'working-in-the-round']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A flat white snowflake with a small sphere centre disc and six cone arms radiating outward at equal intervals. The piece lies flat when the arms are lightly stuffed and kept thin at the base join. Great for hanging decorations.')),
    h2('Centre disc'),
    p(t('Rounds: ' + centre.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to a small sphere, stuffing lightly before '), gt('stuffing-and-closing', 'closing'), t('.')),
    ...centre.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 6)'),
    p(t('Rounds: ' + arm.totalRounds + ' per arm. Start each at the tip with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward to the base. Stuff lightly. Leave the base open to sew onto the disc.')),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Divide the centre disc into six equal sections. Pin one arm to each section, all pointing directly outward. '), gt('amigurumi-decrease', 'Decrease'), t(' the base opening of each arm slightly before stitching down, so the join is neat. Sew a hanging loop through the top arm if desired.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' keeps every piece seam-free and helps the arms stay symmetrical.')),
    p(t('Estimated yarn: disc ' + centre.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g (x 6).')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Snowflake', subtitle: '', excerpt: 'A flat white snowflake with a small sphere centre and six cone arms. Lightly stuff the arms to keep the piece flat for hanging.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a winter-themed intermediate piece.',
    techniqueSlugs, criticalTechniques, aliases: ['snowflake amigurumi', 'crochet snowflake', 'crochet christmas ornament'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm tip to tip.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A149 ── Autumn Leaf ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-leaf'
  const leaf = oval({ longAxisCm: 10, shortAxisCm: 5, gauge: GAUGE, label: 'Leaf body' })
  const stem = cylinder({ diameterCm: 1, heightCm: 4, gauge: GAUGE, closeBothEnds: true, label: 'Stem' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'surface-crochet']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { termSlug: 'surface-crochet', definition: 'Working slip stitches through the surface of a finished piece to add texture or detail.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('An autumn leaf in russet or golden orange, built from a stuffed oval body with a slim cylinder stem. A central vein and branch veins are added using '), gt('surface-crochet', 'surface crochet'), t(' in a darker shade of the same colour.')),
    h2('Leaf body'),
    p(t('Rounds: ' + leaf.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' at the tip, then work the straight sides, then '), gt('amigurumi-decrease', 'decrease'), t(' back to the base. Stuff lightly before closing. The leaf should be gently curved rather than fully round.')),
    ...leaf.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Stem'),
    p(t('Rounds: ' + stem.totalRounds + '. Work a slim cylinder and stuff before '), gt('stuffing-and-closing', 'closing'), t('. Leave a long tail to sew onto the narrow base of the leaf.')),
    ...stem.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Veins and assembly'),
    p(t('Sew the stem to the base of the leaf. Add a central vein along the long axis using '), gt('surface-crochet', 'surface crochet'), t('. Branch off four shorter veins on each side at 45-degree angles.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the leaf body seamless.')),
    p(t('Estimated yarn: leaf ' + leaf.yarnRequiredGrams + ' g, stem ' + stem.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Autumn Leaf', subtitle: '', excerpt: 'An autumn leaf in russet or golden orange with a stuffed oval body, slim stem, and surface-crocheted veins.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a seasonal nature-themed piece.',
    techniqueSlugs, criticalTechniques, aliases: ['leaf amigurumi', 'crochet leaf', 'autumn leaf crochet', 'seasonal crochet toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm long leaf body, 4 cm stem.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A150 ── Dark Green Pine Tree ──────────────────────────────────────────────
{
  const slug = 'amigurumi-pine-tree'
  const canopy = cone({ baseDiameterCm: 10, heightCm: 12, gauge: GAUGE, label: 'Canopy cone' })
  const trunk = cylinder({ diameterCm: 3, heightCm: 4, gauge: GAUGE, closeBothEnds: true, label: 'Trunk' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-decrease', 'stuffing-and-closing']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A classic pine tree with a tall dark green cone canopy and a short brown cylinder trunk. The cone is worked from the tip downward, increasing gradually, which gives the piece its characteristic tapering silhouette. Stuff the canopy firmly so it keeps its point.')),
    h2('Canopy cone'),
    p(t('Rounds: ' + canopy.totalRounds + '. Begin at the treetop with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' steadily outward each round. Stuff as you work so the tip stays pointed. The base is left open to sit on the trunk.')),
    ...canopy.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Trunk'),
    p(t('Rounds: ' + trunk.totalRounds + '. Work a short brown cylinder, '), gt('stuffing-and-closing', 'stuffing and closing'), t(' before the final round. Leave the top open to accept the canopy.')),
    ...trunk.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Slip the open base of the canopy over the open top of the trunk and stitch around the join. The canopy should sit centred on the trunk with no gap at the join line.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both pieces seam-free. '), gt('amigurumi-decrease', 'Decreasing'), t(' gradually is the key to a smooth cone.')),
    p(t('Estimated yarn: canopy ' + canopy.yarnRequiredGrams + ' g, trunk ' + trunk.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Pine Tree', subtitle: '', excerpt: 'A classic pine tree with a tall dark green cone canopy and a short brown cylinder trunk. Stuff the canopy firmly to keep the tip pointed.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles for a nature-themed beginner piece.',
    techniqueSlugs, criticalTechniques, aliases: ['pine tree amigurumi', 'crochet pine tree', 'christmas tree amigurumi', 'crochet evergreen'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm tall. Canopy base 10 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

console.log('Batch 15 complete.')
