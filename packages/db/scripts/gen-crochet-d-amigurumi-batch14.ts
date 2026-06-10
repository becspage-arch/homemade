/**
 * Generator: D-Amigurumi Batch 14 -- A131-A140 Space Themed
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch14.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sphere, cylinder, cone, capsule, oval } from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

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

function savePattern(slug: string, out: Record<string, unknown>) {
  if (Array.isArray(out.body)) {
    out.body = { type: 'doc', content: out.body }
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}.json`)
}

// ── A131 ── Planet Earth ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-planet-earth'
  const body = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Body' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A beginner sphere planet Earth worked in blue and green. The continents are added as freeform patches of green yarn sewn onto the finished blue sphere. No precise geography required; approximate shapes give the right impression.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' in blue yarn. '), gt('amigurumi-increase', 'Increase'), t(' each round until the equator, then '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Continent patches'),
    p(t('Cut freeform oval and irregular shapes from green yarn lengths or work small flat ovals in green. Use '), gt('colour-change', 'colour change'), t(' technique to surface-sew each patch to the blue sphere. Position a large landmass on one side for the Americas and a joined patch on the other for Eurasia and Africa.')),
    h2('Assembly'),
    p(t('Stuff the sphere firmly before closing. Pull the final stitches tight using the '), gt('stuffing-and-closing', 'stuffing and closing'), t(' method. Sew continent patches to the surface. Add a hanging loop at the top pole if desired.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the sphere seamless.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g blue, approx 8 g green for patches.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Planet Earth', subtitle: '', excerpt: 'A beginner blue and green sphere planet Earth. Freeform green patches sewn onto the finished sphere create the continents.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['planet earth amigurumi', 'crochet earth', 'globe amigurumi', 'space crochet toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A132 ── Moon ─────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-moon'
  const body = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Body' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'surface-crochet']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'surface-crochet', term: 'surface crochet', definition: 'Working slip stitches through the surface of a finished piece to add texture or detail.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A beginner white sphere moon with crater texture added after assembly. The craters are small sunken circles made using '), gt('surface-crochet', 'surface crochet'), t(' or embroidered ring stitches on the finished sphere. No additional pieces required.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' until the equator, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Use off-white or cream yarn throughout.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Crater detail'),
    p(t('After stuffing and closing the sphere, choose five to eight positions across the surface. At each crater spot, use '), gt('surface-crochet', 'surface crochet'), t(' to work a small ring of slip stitches, pulling slightly inward to create the sunken effect. Grey yarn gives the best contrast on a white or cream body.')),
    h2('Assembly'),
    p(t('Stuff the sphere firmly before closing. Use the '), gt('stuffing-and-closing', 'stuffing and closing'), t(' method to draw the final stitches tight. Add a hanging loop at the top if the moon is to be used as a mobile piece.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g off-white, approx 4 g grey for craters.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Moon', subtitle: '', excerpt: 'A beginner white sphere moon with surface-crocheted crater detail. Simple to make and satisfying to finish.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['moon amigurumi', 'crochet moon', 'space amigurumi', 'crescent moon toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 9 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A133 ── Saturn ───────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-saturn'
  const planet = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Planet body' })
  const ring = oval({ longAxisCm: 16, shortAxisCm: 14, gauge: GAUGE, label: 'Ring disc (flat)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A golden sphere planet with a flat oval ring sewn around its equator. The ring is worked flat in stripes of tan and cream using '), gt('colour-change', 'colour change'), t(' to mimic Saturn\'s banded appearance. A cut-out in the ring centre slots around the planet body.')),
    h2('Planet body'),
    p(t(`Rounds: ${planet.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' in golden yellow and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff firmly, then '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...planet.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ring disc'),
    p(t(`Rounds: ${ring.totalRounds}. Work the oval flat without stuffing. Begin from the inner edge and work outward in tan and cream stripes. Leave the inner oval opening so the planet body passes through it. Sew closed at the outer edge once the planet is inserted.`)),
    ...ring.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Thread the planet sphere through the ring opening. Centre the ring at the equator of the planet and sew the inner edge to the planet surface all the way around. Add a display stand or hanging loop at the top pole.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the planet before fitting the ring makes assembly much easier.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout the planet body.')),
    p(t('Estimated yarn: planet ' + planet.yarnRequiredGrams + ' g gold, ring ' + ring.yarnRequiredGrams + ' g in tan and cream.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Saturn', subtitle: '', excerpt: 'A golden sphere planet Saturn with a flat striped oval ring sewn around the equator. The ring slides over the planet body and stitches in place.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['saturn amigurumi', 'crochet saturn', 'planet amigurumi', 'ringed planet crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 9 cm diameter planet, 16 cm across with ring.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A134 ── Rocket Ship ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-rocket-ship'
  const bodyPiece = cylinder({ diameterCm: 5, heightCm: 12, gauge: GAUGE, closeBothEnds: false, label: 'Body' })
  const nose = cone({ baseDiameterCm: 5, heightCm: 6, gauge: GAUGE, label: 'Nose cone' })
  const fin = cone({ baseDiameterCm: 3, heightCm: 5, gauge: GAUGE, label: 'Fin (make 4)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'stuffing-and-closing']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('An intermediate rocket ship made from a cylinder body, a cone nose, and four small cone fins. Colour bands across the body cylinder use '), gt('colour-change', 'colour change'), t(' to add red and white stripes. A porthole is embroidered on after assembly.')),
    h2('Body'),
    p(t(`Rounds: ${bodyPiece.totalRounds}. Start the cylinder with a `), gt('magic-ring', 'magic ring'), t(' at the base. Work straight, changing colours every four rounds to create stripes. Leave both ends open for attaching the nose and base.')),
    ...bodyPiece.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Nose cone'),
    p(t(`Rounds: ${nose.totalRounds}. Begin at the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward to the base diameter. Stuff lightly and leave the base open to join the body.')),
    ...nose.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Fins (make 4)'),
    p(t(`Rounds: ${fin.totalRounds} per fin. Work each cone from the tip. Do not stuff and sew flat before sewing to the lower body.`)),
    p(gt('amigurumi-decrease', 'Decrease'), t(' rounds at the tip of each fin cone taper it naturally to a point.')),
    ...fin.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the nose cone to the top of the body. '), gt('stuffing-and-closing', 'Stuff and close'), t(' the body before adding the fins. Position four fins evenly around the base, pointing outward and slightly downward. Embroider a circular porthole window in a contrasting colour.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout all cylindrical and cone pieces.')),
    p(t('Estimated yarn: body ' + bodyPiece.yarnRequiredGrams + ' g, nose ' + nose.yarnRequiredGrams + ' g, each fin ' + fin.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Rocket Ship', subtitle: '', excerpt: 'An intermediate crochet rocket with a striped cylinder body, cone nose, and four outward-pointing fins. A satisfying multi-piece space project.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['rocket amigurumi', 'crochet rocket', 'rocket ship toy', 'space rocket crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall including nose.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A135 ── Alien ─────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-alien'
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const bodyPiece = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
  const arm = capsule({ diameterCm: 1.5, lengthCm: 7, gauge: GAUGE, label: 'Arm (make 2)' })
  const antenna = cone({ baseDiameterCm: 1.5, heightCm: 4, gauge: GAUGE, label: 'Antenna (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green alien figure with a large sphere head, an oval body, two long capsule arms, and two cone antennae. Large safety eyes in a contrasting colour complete the look. A small ball is added to each antenna tip using a '), gt('magic-ring', 'magic ring'), t(' start.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff firmly then '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${bodyPiece.totalRounds}. Work an oval body starting with a `), gt('magic-ring', 'magic ring'), t('. Use '), gt('colour-change', 'colour change'), t(' to add a lighter belly band across the centre rounds if desired.')),
    ...bodyPiece.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Work each capsule starting with a `), gt('magic-ring', 'magic ring'), t('. Stuff lightly and leave the top open to sew to the body.')),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Antennae (make 2)'),
    p(t(`Rounds: ${antenna.totalRounds} per antenna. Work each cone from tip to base. Do not stuff. Sew a small yarn ball to the tip before attaching to the head.`)),
    ...antenna.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head to the body. Sew arms to each side of the body at the shoulder level. Position antennae on top of the head, evenly spaced. Add large safety eyes to the front of the head.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the head and body before assembly makes positioning easier.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout all pieces.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + bodyPiece.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g, each antenna ' + antenna.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Alien', subtitle: '', excerpt: 'A green alien figure built from a large sphere head and oval body with long capsule arms and cone antennae. Big safety eyes finish the extraterrestrial look.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['alien amigurumi', 'crochet alien', 'space alien toy', 'green alien crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A136 ── Astronaut ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-astronaut'
  const helmet = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Helmet' })
  const bodyPiece = cylinder({ diameterCm: 7, heightCm: 9, gauge: GAUGE, closeBothEnds: false, label: 'Body suit' })
  const arm = capsule({ diameterCm: 2, lengthCm: 7, gauge: GAUGE, label: 'Arm (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'stuffing-and-closing']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('An intermediate astronaut with a white sphere helmet, a cylinder body suit, and two capsule arms. A visor panel is worked in gold yarn using '), gt('colour-change', 'colour change'), t(' on the front of the helmet. Small cylinder legs attach to the base of the body.')),
    h2('Helmet'),
    p(t(`Rounds: ${helmet.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' in white and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Change to gold yarn for three rounds across the front to form the visor, then continue in white. '), gt('amigurumi-decrease', 'Decrease'), t(' to close; stuff firmly before the final round.')),
    ...helmet.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body suit'),
    p(t(`Rounds: ${bodyPiece.totalRounds}. Work the cylinder in white using a `), gt('magic-ring', 'magic ring'), t(' at the base. Add flag patches and detail bands using '), gt('colour-change', 'colour change'), t(' in grey or red. Leave the top open to join the helmet.')),
    ...bodyPiece.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Work each capsule in white with a glove round in grey at the wrist end. Stuff lightly and leave the top open.`)),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(gt('stuffing-and-closing', 'Stuff and close'), t(' the body, then attach the helmet to the top. Sew arms to the upper body sides. Add two short cylinder legs to the base. Embroider a flag patch in contrasting yarn on one arm.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout all pieces.')),
    p(t('Estimated yarn: helmet ' + helmet.yarnRequiredGrams + ' g, body ' + bodyPiece.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g, plus small amounts in gold and grey.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Astronaut', subtitle: '', excerpt: 'An intermediate white-suited astronaut with a sphere helmet, cylinder body, and capsule arms. A gold visor band on the helmet is the defining detail.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['astronaut amigurumi', 'crochet astronaut', 'space person crochet', 'cosmonaut toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 22 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A137 ── UFO ───────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-ufo'
  const saucerTop = oval({ longAxisCm: 14, shortAxisCm: 5, gauge: GAUGE, label: 'Saucer top' })
  const dome = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Dome' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('An intermediate silver UFO saucer with a teal dome on top. The saucer body is a flat oval disc stuffed lightly to hold its shape, and the dome is a half-sphere worked in a contrasting colour. Small light spots are embroidered around the rim using yellow yarn.')),
    h2('Saucer disc'),
    p(t(`Rounds: ${saucerTop.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' in silver yarn and '), gt('amigurumi-increase', 'increase'), t(' outward to the full disc width. Work two straight rounds, then '), gt('amigurumi-decrease', 'decrease'), t(' the underside back down. Stuff lightly before closing.')),
    ...saucerTop.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Dome'),
    p(t(`Rounds: ${dome.totalRounds}. Work a half-sphere in teal, beginning with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' rounds only, stopping at the equator. Leave the flat base open. Do not stuff.')),
    ...dome.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Centre the dome on the top of the saucer and sew around the base edge. Use '), gt('colour-change', 'colour change'), t(' or embroidery to add a ring of alternating light dots around the saucer rim. Add safety eyes inside the dome for a small alien passenger if desired.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the saucer disc lightly keeps it flat rather than round.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout both pieces.')),
    p(t('Estimated yarn: saucer ' + saucerTop.yarnRequiredGrams + ' g silver, dome ' + dome.yarnRequiredGrams + ' g teal.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi UFO', subtitle: '', excerpt: 'An intermediate silver UFO saucer with a teal dome. Light dots around the rim and a domed cockpit give it a classic flying saucer look.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['ufo amigurumi', 'crochet ufo', 'flying saucer crochet', 'spaceship toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm across, 9 cm tall with dome.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A138 ── Shooting Star ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-shooting-star'
  const point = cone({ baseDiameterCm: 3, heightCm: 5, gauge: GAUGE, label: 'Star point (make 5)' })
  const centre = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Centre' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A beginner yellow shooting star made from a small sphere centre and five cone points. A looped yarn tail of three or four strands trails from one point to suggest motion. The points sew onto the centre at evenly spaced angles.')),
    h2('Centre'),
    p(t(`Rounds: ${centre.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff lightly then '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...centre.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Star points (make 5)'),
    p(t(`Rounds: ${point.totalRounds} per point. Work each cone from the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the base. Do not stuff. Leave the base open for sewing.')),
    ...point.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Divide the centre into five evenly spaced attachment points. Sew one point at each position. Cut four lengths of yellow yarn, fold in half, and loop through one back point to create the shooting tail. Knot and trim to 8 cm.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the centre lightly keeps it from over-bulking at the point joins.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: centre ' + centre.yarnRequiredGrams + ' g, each point ' + point.yarnRequiredGrams + ' g (x 5), plus 10 g for yarn tail.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Shooting Star', subtitle: '', excerpt: 'A beginner yellow star with five cone points and a trailing yarn tail. Simple shapes and a quick finish make this a great first space project.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['shooting star amigurumi', 'crochet star', 'star toy', 'space star crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm tip to tip.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A139 ── Comet ─────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-comet'
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Comet head' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A beginner white comet with a sphere head and a streamer tail of looped yarn lengths. The tail attaches at the back of the head and fans out in white and pale blue strands. Small buttons or safety eyes add sparkle to the head surface.')),
    h2('Comet head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' in white and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff firmly then '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Yarn tail'),
    p(t('Cut twelve lengths of white and pale blue yarn, each 25 cm long. Hold them in a bundle and fold in half. Push the folded loop through a stitch at the back of the head, then pull the ends through the loop and tighten. Fan the strands outward and trim to graduated lengths to suggest movement.')),
    h2('Assembly'),
    p(gt('stuffing-and-closing', 'Stuff and close'), t(' the head before adding the tail. Add a small sparkle bead or safety eye at the front of the head for the comet nucleus. Trim the tail strands to a gradual point.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout the head.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g white, approx 15 g white and pale blue for tail strands.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Comet', subtitle: '', excerpt: 'A beginner white sphere comet with a trailing yarn streamer tail in white and pale blue. Fast to make and striking to display.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['comet amigurumi', 'crochet comet', 'space comet toy', 'comet with tail crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 9 cm head, 20 cm total with tail.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A140 ── Telescope ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-telescope'
  const mainTube = cylinder({ diameterCm: 6, heightCm: 14, gauge: GAUGE, closeBothEnds: false, label: 'Main tube' })
  const eyepiece = cylinder({ diameterCm: 3, heightCm: 5, gauge: GAUGE, closeBothEnds: false, label: 'Eyepiece tube' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'stuffing-and-closing']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-decrease', term: 'amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn mid-round to introduce a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A dark blue cylinder telescope toy with a smaller cylinder eyepiece attached at one end. Gold bands at each end of the main tube use '), gt('colour-change', 'colour change'), t(' to suggest a classic brass telescope finish. The eyepiece is a shorter, narrower cylinder sewn to the main tube.')),
    h2('Main tube'),
    p(t(`Rounds: ${mainTube.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' at the lens end in navy blue. Work straight, adding two rounds of gold at each end using '), gt('colour-change', 'colour change'), t('. Stuff firmly and close both ends with flat rounds.')),
    ...mainTube.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Eyepiece tube'),
    p(t(`Rounds: ${eyepiece.totalRounds}. Work the smaller cylinder in the same navy blue starting with a `), gt('magic-ring', 'magic ring'), t('. Add a gold band at the open end. '), gt('amigurumi-decrease', 'Decrease'), t(' slightly on the last round to taper it toward the main tube join.')),
    ...eyepiece.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(gt('stuffing-and-closing', 'Stuff and close'), t(' the main tube. Sew the eyepiece tube to one end of the main tube at a slight angle to suggest the telescope at rest. Embroider a lens circle in silver yarn at the open end of the main tube.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout both cylinders.')),
    p(t('Estimated yarn: main tube ' + mainTube.yarnRequiredGrams + ' g navy, eyepiece ' + eyepiece.yarnRequiredGrams + ' g navy, plus small amounts in gold and silver.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Telescope', subtitle: '', excerpt: 'A dark blue cylinder telescope toy with gold accent bands and a narrower eyepiece tube. A satisfying make for space fans of all ages.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['telescope amigurumi', 'crochet telescope', 'space telescope toy', 'astronomy crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long main tube.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

console.log('Batch 14 complete.')
