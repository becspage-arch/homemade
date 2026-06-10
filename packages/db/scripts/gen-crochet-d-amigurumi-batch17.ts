/**
 * Generator: D-Amigurumi Batch 17 -- A161-A170 Vehicles and Everyday Objects
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch17.ts
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

function savePattern(slug: string, out: object) {
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written: ' + slug + '.json')
}

// ── A161 ── Red Toy Car ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-car'
  const body = oval({ longAxisCm: 12, shortAxisCm: 6, gauge: GAUGE, label: 'Car body' })
  const wheel = cylinder({ diameterCm: 3, heightCm: 2, gauge: GAUGE, closeBothEnds: true, label: 'Wheel (make 4)' })
  const headlight = cylinder({ diameterCm: 1.5, heightCm: 1, gauge: GAUGE, closeBothEnds: true, label: 'Headlight (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A red toy car built from an oval body, four flat cylinder wheels, and two small cylinder headlights. Windows are embroidered or worked as surface details in a contrast colour. The rounded oval body gives the car a friendly, chunky look.')),
    h2('Car body'),
    p(t('Rounds: ' + body.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point then work straight before decreasing. Stuff firmly before closing. Use a '), gt('colour-change', 'colour change'), t(' to add window panels in grey or blue yarn.')),
    ...body.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Wheels (make 4)'),
    p(t('Rounds: ' + wheel.totalRounds + ' per wheel. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward, then close both ends flat. Do not stuff. Work in black yarn with a grey centre circle on the outer face.')),
    ...wheel.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Headlights (make 2)'),
    p(t('Rounds: ' + headlight.totalRounds + ' per headlight. Work in white or yellow yarn. Close both ends flat and do not stuff.')),
    ...headlight.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Position two wheels on each side of the body, level with the lower edge. Sew through the body to secure both wheels on the same axle line. Attach headlights to the narrow front end, one on each side. Embroider a radiator grille in straight stitches.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before attaching any pieces keeps the shape stable.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both body and wheels seam-free.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g, each wheel ' + wheel.yarnRequiredGrams + ' g, each headlight ' + headlight.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Car', subtitle: '', excerpt: 'A chunky red toy car with an oval body, four flat cylinder wheels, and small cylinder headlights. Windows are embroidered after assembly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['car amigurumi', 'crochet toy car', 'amigurumi vehicle'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm long × 6 cm wide.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A162 ── Blue Train Engine ─────────────────────────────────────────────────
{
  const slug = 'amigurumi-train-engine'
  const body = oval({ longAxisCm: 14, shortAxisCm: 7, gauge: GAUGE, label: 'Engine body' })
  const wheel = cylinder({ diameterCm: 3.5, heightCm: 2, gauge: GAUGE, closeBothEnds: true, label: 'Wheel (make 4)' })
  const chimney = cone({ baseDiameterCm: 3, heightCm: 4, gauge: GAUGE, label: 'Chimney' })
  const cab = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Cab (flattened sphere)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A blue train engine assembled from an oval body, four cylinder wheels, a cone chimney, and a small flattened sphere cab at the rear. Red stripes along the body are added using a '), gt('colour-change', 'colour change'), t('.')),
    h2('Engine body'),
    p(t('Rounds: ' + body.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work straight through the boiler section then '), gt('amigurumi-decrease', 'decrease'), t(' toward the front.')),
    ...body.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Wheels (make 4)'),
    p(t('Rounds: ' + wheel.totalRounds + ' per wheel. Work in black yarn with a red spoke detail embroidered afterward. Close both ends flat and do not stuff.')),
    ...wheel.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Chimney'),
    p(t('Rounds: ' + chimney.totalRounds + '. Start at the narrow top with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. The wide base sits flush against the top of the body. Stuff lightly.')),
    ...chimney.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Cab'),
    p(t('Rounds: ' + cab.totalRounds + '. Work the sphere but stop the '), gt('amigurumi-decrease', 'decrease'), t(' halfway to leave the base open. This creates a domed cab shape. Stuff firmly.')),
    ...cab.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Position two wheels on each side of the body. Sew the chimney to the top front. Attach the cab dome to the rear of the body. Add a small face using safety eyes and embroidered features on the front.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body and cab before attaching other pieces.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g, each wheel ' + wheel.yarnRequiredGrams + ' g, chimney ' + chimney.yarnRequiredGrams + ' g, cab ' + cab.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Train Engine', subtitle: '', excerpt: 'A blue train engine with an oval boiler body, cylinder wheels, cone chimney, and a rounded cab dome. Red stripe details are added with a colour change.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['train amigurumi', 'crochet train engine', 'toy train crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long × 9 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A163 ── White Aeroplane ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-aeroplane'
  const fuselage = capsule({ diameterCm: 6, lengthCm: 16, gauge: GAUGE, label: 'Fuselage' })
  const wing = oval({ longAxisCm: 10, shortAxisCm: 4, gauge: GAUGE, label: 'Wing (make 2)' })
  const nose = cone({ baseDiameterCm: 6, heightCm: 4, gauge: GAUGE, label: 'Nose cone' })
  const tail = oval({ longAxisCm: 5, shortAxisCm: 3, gauge: GAUGE, label: 'Tail fin (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A white aeroplane with a long capsule fuselage, two flat oval wings, a cone nose, and two oval tail fins. Window portholes are embroidered in blue yarn along the fuselage after assembly. A stripe along the body uses a '), gt('colour-change', 'colour change'), t('.')),
    h2('Fuselage'),
    p(t('Rounds: ' + fuselage.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' at the tail end and '), gt('amigurumi-increase', 'increase'), t(' to the full diameter. Work straight along the main body then leave the nose end open for attaching the cone.')),
    ...fuselage.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Nose cone'),
    p(t('Rounds: ' + nose.totalRounds + '. Start at the pointed tip with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. The wide base joins to the open fuselage end.')),
    ...nose.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Wings (make 2)'),
    p(t('Rounds: ' + wing.totalRounds + ' per wing. Work each oval flat with no stuffing. Sew closed around the edges before attaching to the body.')),
    ...wing.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Tail fins (make 2)'),
    p(t('Rounds: ' + tail.totalRounds + ' per fin. Work flat and unsewn. One fin sits horizontal at the tail, one stands vertical to form the rudder.')),
    ...tail.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach the nose cone to the open front of the fuselage. Position both wings at the widest point of the fuselage, one on each side, angled slightly back. Sew the horizontal tail fin to the rear and the vertical fin upright on top. Embroider oval portholes in blue yarn along each side.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the fuselage fully before attaching wings keeps the body rigid.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: fuselage ' + fuselage.yarnRequiredGrams + ' g, nose ' + nose.yarnRequiredGrams + ' g, each wing ' + wing.yarnRequiredGrams + ' g, each tail fin ' + tail.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Aeroplane', subtitle: '', excerpt: 'A white aeroplane with a capsule fuselage, cone nose, flat oval wings, and two oval tail fins. Embroidered portholes add the finishing touch.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['aeroplane amigurumi', 'crochet plane toy', 'airplane amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm long, wingspan 20 cm.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A164 ── Hot Air Balloon ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-hot-air-balloon'
  const balloon = sphere({ diameterCm: 12, gauge: GAUGE, label: 'Balloon' })
  const basket = cylinder({ diameterCm: 5, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'Basket' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A hot air balloon made from a large sphere balloon and a small open cylinder basket. Four yarn ropes connect the basket to the base of the balloon. Bold vertical stripes on the balloon are worked using a '), gt('colour-change', 'colour change'), t(' between rounds.')),
    h2('Balloon'),
    p(t('Rounds: ' + balloon.totalRounds + '. Begin at the top with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Swap colours every two rounds to build vertical stripes before working '), gt('amigurumi-decrease', 'decreases'), t(' to the base. Stuff firmly before closing.')),
    ...balloon.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Basket'),
    p(t('Rounds: ' + basket.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to form the base, then work straight walls upward. Leave the top open. Work in brown or tan yarn. Add a textured stitch pattern on the walls to suggest woven wicker.')),
    ...basket.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Rope connections'),
    p(t('Cut four lengths of yarn, each 12 cm. Thread each length through the top edge of the basket, one at each quarter point. Gather the four rope ends at the base of the balloon and sew securely through a few rounds to hold the basket in position below the balloon.')),
    h2('Assembly'),
    p(t('Hang the basket from the base of the balloon using the four yarn ropes. The balloon stands with its flat closing point at the base so the balloon appears to float above. Add a hanging loop of chain at the very top if using as a decoration.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the balloon firmly ensures the sphere holds its shape when the basket is attached.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: balloon ' + balloon.yarnRequiredGrams + ' g, basket ' + basket.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Hot Air Balloon', subtitle: '', excerpt: 'A large striped sphere balloon connected by four yarn ropes to a small open cylinder basket. Bold colour-change stripes make this a striking display piece.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['hot air balloon amigurumi', 'crochet balloon toy', 'balloon amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm balloon diameter, basket 5 cm wide.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A165 ── Red Boat ──────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-boat'
  const hull = oval({ longAxisCm: 14, shortAxisCm: 6, gauge: GAUGE, label: 'Hull' })
  const mast = cylinder({ diameterCm: 1.5, heightCm: 10, gauge: GAUGE, closeBothEnds: true, label: 'Mast' })
  const sail = oval({ longAxisCm: 8, shortAxisCm: 5, gauge: GAUGE, label: 'Sail' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A red boat made from an oval hull, a slim cylinder mast, and a flat oval sail. The hull uses a '), gt('colour-change', 'colour change'), t(' to add a white waterline stripe. The sail is worked flat and attached to the mast before the mast is sewn into the hull.')),
    h2('Hull'),
    p(t('Rounds: ' + hull.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' at one end and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work the waterline stripe in white using a '), gt('colour-change', 'colour change'), t(', then '), gt('amigurumi-decrease', 'decrease'), t(' to close the far end. Stuff firmly.')),
    ...hull.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Mast'),
    p(t('Rounds: ' + mast.totalRounds + '. Work in brown or natural yarn. Close both ends and do not stuff. Leave a length of yarn at the base to sew through the hull.')),
    ...mast.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Sail'),
    p(t('Rounds: ' + sail.totalRounds + '. Work the oval flat in white or cream. Sew closed around the edges. Thread the mast through the sail before attaching the mast to the hull.')),
    ...sail.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Thread the sail onto the mast and secure with a few stitches at top and bottom. Insert the base of the mast into the centre top of the hull and sew down firmly. Add a small flag made from a folded scrap of yarn at the top of the mast.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the hull fully before inserting the mast gives a stable base.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: hull ' + hull.yarnRequiredGrams + ' g, mast ' + mast.yarnRequiredGrams + ' g, sail ' + sail.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Boat', subtitle: '', excerpt: 'A red oval-hulled boat with a tall cylinder mast and flat oval sail. A colour-change waterline stripe and a tiny yarn flag complete the look.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['boat amigurumi', 'crochet boat toy', 'sailboat amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long hull, 12 cm tall with mast.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A166 ── Simple House ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-house'
  const walls = cylinder({ diameterCm: 10, heightCm: 8, gauge: GAUGE, closeBothEnds: false, label: 'Walls' })
  const roof = cone({ baseDiameterCm: 12, heightCm: 6, gauge: GAUGE, label: 'Roof' })
  const door = oval({ longAxisCm: 4, shortAxisCm: 2.5, gauge: GAUGE, label: 'Door' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A toy house built from a cylinder wall section, a cone roof, and a flat oval door panel. Windows are embroidered in contrast yarn. A '), gt('colour-change', 'colour change'), t(' separates the brickwork colour of the walls from the roof. The walls are left open at the top so the cone roof sits over them like a lid.')),
    h2('Walls'),
    p(t('Rounds: ' + walls.totalRounds + '. Begin at the base with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the full diameter. Work straight upward for the wall height. Leave the top open. Stuff firmly.')),
    ...walls.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Roof'),
    p(t('Rounds: ' + roof.totalRounds + '. Start at the peak with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward to the base. The base sits around the open top of the walls. Do not stuff. Work in red or terracotta yarn.')),
    ...roof.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Door'),
    p(t('Rounds: ' + door.totalRounds + '. Work the oval flat in a contrast colour. Sew closed around the edges, leaving one long edge open for a 3D hinge effect if preferred.')),
    ...door.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Sew the door panel to the lower front of the walls, centred. Embroider square windows on each side using a running stitch outline. Embroider a window cross in the centre of each square. Place the roof cone over the open wall top and sew around the base edge to hold it in position.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the walls before placing the roof gives a firm, stable structure.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: walls ' + walls.yarnRequiredGrams + ' g, roof ' + roof.yarnRequiredGrams + ' g, door ' + door.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi House', subtitle: '', excerpt: 'A toy house with a cylinder wall section, cone roof, and flat oval door. Windows are embroidered after assembly. A satisfying intermediate multi-piece build.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['house amigurumi', 'crochet house toy', 'amigurumi building'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm wide × 14 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A167 ── Camera ────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-camera'
  const body = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Camera body' })
  const lens = cylinder({ diameterCm: 4, heightCm: 3, gauge: GAUGE, closeBothEnds: true, label: 'Lens' })
  const viewfinder = oval({ longAxisCm: 2.5, shortAxisCm: 1.5, gauge: GAUGE, label: 'Viewfinder' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A toy camera built from an oval body, a cylinder lens, and a small oval viewfinder. The strap is a long crocheted chain in a contrast colour. A '), gt('colour-change', 'colour change'), t(' on the body face creates the illusion of a flash panel.')),
    h2('Camera body'),
    p(t('Rounds: ' + body.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work the body straight through the main section, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly. Add a flash panel using a '), gt('colour-change', 'colour change'), t(' in the top corner rounds.')),
    ...body.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Lens'),
    p(t('Rounds: ' + lens.totalRounds + '. Work in black yarn with a silver or grey inner circle. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward, then work straight walls. Close both ends flat. Do not stuff.')),
    ...lens.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Viewfinder'),
    p(t('Rounds: ' + viewfinder.totalRounds + '. Work the small oval flat in black yarn. Sew closed around the edges.')),
    ...viewfinder.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Centre the lens on the front face of the body and sew around the edge. Attach the viewfinder to the top rear corner. Add a shutter button using a small circle of yarn. Work a long chain strap and sew both ends to opposite sides of the body.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before attaching the lens.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g, lens ' + lens.yarnRequiredGrams + ' g, viewfinder ' + viewfinder.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Camera', subtitle: '', excerpt: 'A toy camera with an oval body, cylinder lens, and small oval viewfinder. A crocheted chain strap and flash panel detail finish the look.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['camera amigurumi', 'crochet camera toy', 'toy camera crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm wide × 7 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A168 ── Old-Style Telephone ───────────────────────────────────────────────
{
  const slug = 'amigurumi-telephone'
  const base = oval({ longAxisCm: 11, shortAxisCm: 6, gauge: GAUGE, label: 'Telephone base' })
  const handset = capsule({ diameterCm: 3, lengthCm: 10, gauge: GAUGE, label: 'Handset' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A classic old-style telephone made from an oval base body and a capsule handset. A dial is embroidered on the front face of the base, and a curly yarn cord connects the handset to the body. Use a '), gt('colour-change', 'colour change'), t(' to add a contrast dial ring.')),
    h2('Telephone base'),
    p(t('Rounds: ' + base.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work the body straight, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly. A cradle for the handset can be shaped by gently flattening the top of the oval before closing.')),
    ...base.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Handset'),
    p(t('Rounds: ' + handset.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' at one end and '), gt('amigurumi-increase', 'increase'), t(' to the full diameter. Work the capsule body straight, then '), gt('amigurumi-decrease', 'decrease'), t(' at the far end. Stuff firmly. The two enlarged ear and mouthpiece ends form naturally from the capsule shape.')),
    ...handset.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Cord and assembly'),
    p(t('Crochet a chain of about 40 stitches in a matching yarn, then twist it on itself to form a coiled cord. Sew one end to the side of the telephone base and the other to the side of the handset. Embroider a circular dial on the face of the base with a '), gt('colour-change', 'colour change'), t(' centre. Rest the handset across the top of the base.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' both pieces firmly before connecting.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: base ' + base.yarnRequiredGrams + ' g, handset ' + handset.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Telephone', subtitle: '', excerpt: 'An old-style telephone with an oval base body and capsule handset connected by a curly yarn cord. The rotary dial is embroidered on the front face.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['telephone amigurumi', 'crochet phone toy', 'retro telephone crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 11 cm long base, handset 10 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A169 ── Book ──────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-book'
  const cover = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Book cover (spine body)' })
  const pages = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Page block' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
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
    p(t('A toy book made from a thick oval cover body and a slightly smaller flat oval page block. The spine is emphasised by working the cover in a bold colour and the page block in cream or white. A '), gt('colour-change', 'colour change'), t(' at the spine edge creates a contrast binding strip. A title can be embroidered on the front cover.')),
    h2('Book cover'),
    p(t('Rounds: ' + cover.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the full size. Work the body at full depth, stuffing before closing. Choose a bold colour for the cover. The oval shape gives the book a pleasingly chubby look.')),
    ...cover.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Page block'),
    p(t('Rounds: ' + pages.totalRounds + '. Work the oval in cream or off-white yarn. Keep this piece flat by stopping the '), gt('amigurumi-increase', 'increase'), t(' rounds early and not stuffing. A few horizontal lines of running stitch across the face suggest page edges.')),
    ...pages.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Sew the page block to the front of the cover, aligning the right-hand edges. The left edge of the cover sits proud as the spine. Embroider a title on the front cover in contrast yarn. Add a bookmark ribbon by threading a length of yarn through the spine end.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the cover firmly keeps the book square and upright.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: cover ' + cover.yarnRequiredGrams + ' g, page block ' + pages.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Book', subtitle: '', excerpt: 'A toy book with a bold oval cover body and flat cream page block. A contrast spine strip, embroidered title, and ribbon bookmark make this a charming gift.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['book amigurumi', 'crochet book toy', 'amigurumi storybook'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 9 cm wide × 7 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A170 ── Heart ─────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-heart'
  const lobe = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Lobe (make 2)' })
  const point = cone({ baseDiameterCm: 5, heightCm: 3, gauge: GAUGE, label: 'Point base' })

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
    p(t('A classic heart shape made from two sphere lobes joined side by side at the top, with a cone point base that tapers to the bottom tip. The two lobes are worked separately then joined mid-round. The V dip between the lobes is shaped by pinching the join and tacking with a few stitches.')),
    h2('Lobes (make 2)'),
    p(t('Rounds: ' + lobe.totalRounds + ' per lobe. Begin each with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stop before the '), gt('amigurumi-decrease', 'decrease'), t(' rounds. Leave the base open on each lobe. Stuff each lobe firmly before joining.')),
    ...lobe.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Point base'),
    p(t('Rounds: ' + point.totalRounds + '. Start at the tip with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. The wide base joins to the combined open bases of the two lobes.')),
    ...point.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Joining and assembly'),
    p(t('Hold the two stuffed lobes side by side with their open bases touching. Work a joining round through both base edges to connect them. Sew the cone point to the combined base, adding stuffing to the point before closing. Pinch the top centre of the joined lobes downward and tack with a few invisible stitches to form the V dip.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' each lobe before joining keeps the round top shape intact.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: each lobe ' + lobe.yarnRequiredGrams + ' g (× 2), point ' + point.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Heart', subtitle: '', excerpt: 'A classic red heart made from two sphere lobes joined at the top and a cone point at the base. The V dip is shaped by pinching the join after stuffing. A perfect beginner gift make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['heart amigurumi', 'crochet heart toy', 'amigurumi heart gift'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm wide × 9 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

console.log('Batch 17 complete.')
