/**
 * Generator: D-Amigurumi Batch 13 -- A121-A130 Dinosaurs
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch13.ts
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

function doc(nodes: object[]) { return { type: 'doc', content: nodes } }

function savePattern(slug: string, out: object) {
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}.json`)
}

// ── A121 ── Green T-Rex ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-t-rex'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const arm = capsule({ diameterCm: 1.5, lengthCm: 3, gauge: GAUGE, label: 'Arm (make 2)' })
  const leg = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 2)' })
  const tail = cylinder({ diameterCm: 3, heightCm: 8, gauge: GAUGE, closeBothEnds: true, label: 'Tail' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'Colour change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green T-Rex built from five pieces: a sphere head, oval body, two tiny capsule arms, two larger capsule legs, and a tapered cylinder tail. The comically small arms are the defining feature, so keep them short. A pale underbelly is added with a '), gt('colour-change', 'colour change'), t(' on the body rounds.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(', then '), gt('amigurumi-increase', 'increase'), t(' to the equator, work two straight rounds, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly before the final round.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and work the oval shape. Switch to a lighter yarn for the belly section using a '), gt('colour-change', 'colour change'), t('.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Work each small capsule without stuffing. Leave a 15 cm tail to sew on. These are intentionally tiny.`)),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 2)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each leg firmly so it holds its upright position. Leave the top open for sewing.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tail'),
    p(t(`Rounds: ${tail.totalRounds}. Work the cylinder, tapering it at the tip end with a few '), gt('amigurumi-decrease', 'decrease'), t(' rounds. Stuff and close.`)),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the top of the body. Attach the tiny arms just below and forward of the shoulder join. Sew the legs to the underside of the body, angled downward. Attach the tail to the back end, angled slightly upward for balance.')),
    p(t('Add safety eyes to the sides of the head. Embroider a row of small teeth in white yarn across the lower jaw.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly helps it balance on the legs without toppling.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps all pieces seam-free.')),
    p(t(`Estimated yarn: head ${head.yarnRequiredGrams} g, body ${body.yarnRequiredGrams} g, each arm ${arm.yarnRequiredGrams} g, each leg ${leg.yarnRequiredGrams} g, tail ${tail.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi T-Rex', subtitle: '', excerpt: 'A green T-Rex with a sphere head, oval body, comically small capsule arms, sturdy capsule legs, and a tapered tail. The tiny arms are the star of the show.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['t-rex amigurumi', 'tyrannosaurus crochet', 'dinosaur amigurumi', 'crochet t-rex'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A122 ── Green Brachiosaurus ───────────────────────────────────────────────
{
  const slug = 'amigurumi-brachiosaurus'
  const body = oval({ longAxisCm: 14, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const neck = cylinder({ diameterCm: 3.5, heightCm: 12, gauge: GAUGE, closeBothEnds: false, label: 'Neck' })
  const head = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
  const leg = capsule({ diameterCm: 3.5, lengthCm: 7, gauge: GAUGE, label: 'Leg (make 4)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green brachiosaurus with a wide oval body, a long cylinder neck stuffed firmly to stand upright, a small sphere head, and four sturdy capsule legs. The long neck is the main structural challenge: pack it with stuffing as you go rather than waiting until the end.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and work the oval. '), gt('amigurumi-increase', 'Increase'), t(' to the widest point, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the tail end. Stuff before closing.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Neck'),
    p(t(`Rounds: ${neck.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and work straight throughout. Add stuffing every 4 rounds as you progress rather than at the end. Leave the top open to attach the head and the bottom open to sew onto the body.')),
    ...neck.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Work a sphere with a `), gt('magic-ring', 'magic ring'), t(', '), gt('amigurumi-increase', 'increasing'), t(' then '), gt('amigurumi-decrease', 'decreasing'), t('. Stuff before closing.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Work each capsule, stuff firmly, and leave the top open for sewing.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew all four legs to the underside of the body, with the front pair slightly forward of the body centre and the rear pair near the tail end. Attach the neck to the front-top of the body at a slight forward angle. Join the head to the top of the neck.')),
    p(t('Add safety eyes to the sides of the head. A short curved tail can be added using a small cylinder tapered at the tip.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' all pieces firmly is key to keeping the brachiosaurus upright.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: body ${body.yarnRequiredGrams} g, neck ${neck.yarnRequiredGrams} g, head ${head.yarnRequiredGrams} g, each leg ${leg.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Brachiosaurus', subtitle: '', excerpt: 'A green brachiosaurus with a wide oval body and long cylinder neck. Stuff the neck as you go to keep it upright.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['brachiosaurus amigurumi', 'long neck dinosaur crochet', 'sauropod amigurumi', 'crochet brachiosaurus'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long body, 20 cm tall with neck.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A123 ── Green Triceratops ─────────────────────────────────────────────────
{
  const slug = 'amigurumi-triceratops'
  const head = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const horn = cone({ baseDiameterCm: 2, heightCm: 4, gauge: GAUGE, label: 'Horn (make 3)' })
  const leg = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 4)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green triceratops built from an oval head, oval body, three cone horns, and four capsule legs. The iconic neck frill is a flat circle worked separately in a contrasting colour and sewn to the back of the head.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(', '), gt('amigurumi-increase', 'increase'), t(' to the widest point then work straight for two rounds. Do not '), gt('amigurumi-decrease', 'decrease'), t(' to close; leave the back open for the frill attachment. Stuff before joining the frill.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and work the oval. '), gt('amigurumi-increase', 'Increase'), t(' to the widest point, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the tail. Stuff before closing.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Horns (make 3)'),
    p(t(`Rounds: ${horn.totalRounds} per horn. Start each at the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Do not stuff; sew the open base directly onto the face. Position two larger horns above the eyes and the shorter nose horn at the snout centre.')),
    ...horn.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each leg and leave the top open.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew all four legs to the underside of the body. Attach the head to the front of the body. Pin the three horns to the face before sewing to get placement right: two brow horns level with the eyes and one at the nose tip.')),
    p(t('Work a flat circle in a contrast colour for the neck frill and sew it around the back of the head opening. Add safety eyes between the brow horns and the frill.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the head and body firmly gives the triceratops its characteristic stocky shape.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: head ${head.yarnRequiredGrams} g, body ${body.yarnRequiredGrams} g, each horn ${horn.yarnRequiredGrams} g, each leg ${leg.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Triceratops', subtitle: '', excerpt: 'A green triceratops with an oval head, three cone horns, a flat neck frill, oval body, and four capsule legs. The frill is worked in a contrast colour for maximum effect.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['triceratops amigurumi', 'three horn dinosaur crochet', 'crochet triceratops', 'horned dino amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A124 ── Green Stegosaurus ─────────────────────────────────────────────────
{
  const slug = 'amigurumi-stegosaurus'
  const body = oval({ longAxisCm: 14, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const head = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
  const leg = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 4)' })
  const plate = cone({ baseDiameterCm: 3, heightCm: 4, gauge: GAUGE, label: 'Spine plate (make 6)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green stegosaurus with a wide oval body, small sphere head, four capsule legs, and six flat cone spine plates running along the back. The plates are worked flat and unsewn, then attached in two alternating rows along the spine.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point, work a few straight rounds, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the tail. Stuff before closing.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Work a sphere from a `), gt('magic-ring', 'magic ring'), t(', '), gt('amigurumi-increase', 'increasing'), t(' to the equator then '), gt('amigurumi-decrease', 'decreasing'), t('. Stuff and close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each capsule firmly and leave the top open.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Spine plates (make 6)'),
    p(t(`Rounds: ${plate.totalRounds} per plate. Start each at the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Do not stuff; sew each flat at the base. Work in a contrast colour for visual impact.')),
    ...plate.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew all four legs to the underside of the body. Attach the head to the narrow front end. Position the six spine plates in two alternating rows along the back, starting from behind the head and ending above the hind legs.')),
    p(t('Add safety eyes to the sides of the head. A short spike tail can be added using two small cone pieces at the tail end, pointing outward at an angle.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before attaching the spine plates makes the placement easier to control.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: body ${body.yarnRequiredGrams} g, head ${head.yarnRequiredGrams} g, each leg ${leg.yarnRequiredGrams} g, each plate ${plate.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Stegosaurus', subtitle: '', excerpt: 'A green stegosaurus with an oval body and six flat cone spine plates running along the back. A satisfying multi-piece intermediate make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['stegosaurus amigurumi', 'spiky dinosaur crochet', 'crochet stegosaurus', 'plated dinosaur amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A125 ── Brown Pterodactyl ─────────────────────────────────────────────────
{
  const slug = 'amigurumi-pterodactyl'
  const body = oval({ longAxisCm: 10, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
  const wing = capsule({ diameterCm: 2.5, lengthCm: 10, gauge: GAUGE, label: 'Wing (make 2)' })
  const head = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
  const beak = cone({ baseDiameterCm: 2.5, heightCm: 5, gauge: GAUGE, label: 'Beak' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A brown pterodactyl with an oval body, two long capsule wings, a sphere head, and a cone beak. The head crest is a small flattened cone worked in the same yarn and sewn to the top of the head. The wings are lightly stuffed so they hold their shape when spread.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point, work straight for a few rounds, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the tail. Stuff and close.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Wings (make 2)'),
    p(t(`Rounds: ${wing.totalRounds} per wing. Work each capsule with very light stuffing so they hold a slight curve. Leave the inner edge open along one side for sewing onto the body.`)),
    ...wing.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Work a sphere from a `), gt('magic-ring', 'magic ring'), t('. '), gt('amigurumi-increase', 'Increase'), t(' to the equator then '), gt('amigurumi-decrease', 'decrease'), t('. Stuff and close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Beak'),
    p(t(`Rounds: ${beak.totalRounds}. Start at the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Do not stuff; leave the base open to join to the head.')),
    ...beak.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the beak to the front of the head. Sew the head to the front of the body. Attach the wings to the sides of the body, angling them slightly upward and backward. Add a small flattened cone to the top of the head for the crest.')),
    p(t('Add safety eyes to each side of the head, positioned between the beak base and the crest. Two small cylinder feet can be added under the body for display.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly lets it balance upright.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: body ${body.yarnRequiredGrams} g, each wing ${wing.yarnRequiredGrams} g, head ${head.yarnRequiredGrams} g, beak ${beak.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Pterodactyl', subtitle: '', excerpt: 'A brown pterodactyl with an oval body, two long capsule wings, a sphere head, and a cone beak. Light wing stuffing keeps them spread and shapely.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['pterodactyl amigurumi', 'flying dinosaur crochet', 'pterosaur amigurumi', 'crochet pterodactyl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 22 cm wingspan, 10 cm body length.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A126 ── Grey Diplodocus ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-diplodocus'
  const body = oval({ longAxisCm: 16, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const neck = cylinder({ diameterCm: 3, heightCm: 14, gauge: GAUGE, closeBothEnds: false, label: 'Neck' })
  const tail = cylinder({ diameterCm: 2.5, heightCm: 14, gauge: GAUGE, closeBothEnds: true, label: 'Tail' })
  const head = sphere({ diameterCm: 4, gauge: GAUGE, label: 'Head' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A grey diplodocus with a wide oval body, a very long cylinder neck, a very long tapered cylinder tail, and a small sphere head. The diplodocus is longer than a brachiosaurus but lower to the ground, so the neck extends forward rather than straight up. Fill the neck with stuffing as you work each section.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point, work straight, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the tail end. Stuff firmly and close.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Neck'),
    p(t(`Rounds: ${neck.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and work straight throughout. Add stuffing every 3 rounds as you go. Leave the top open for the head and the base open for sewing onto the body front.')),
    ...neck.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tail'),
    p(t(`Rounds: ${tail.totalRounds}. Work the cylinder, then '), gt('amigurumi-decrease', 'decrease'), t(' steadily over the final 6 rounds to taper the tip. Stuff firmly before closing.`)),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Work a small sphere with a `), gt('magic-ring', 'magic ring'), t(', '), gt('amigurumi-increase', 'increasing'), t(' then '), gt('amigurumi-decrease', 'decreasing'), t('. Stuff and close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew four legs (worked as capsules) to the underside of the body. Attach the neck to the front of the body angled forward and slightly downward. Join the head to the top of the neck. Sew the tail to the rear of the body.')),
    p(t('Add safety eyes to the sides of the head. The tail can be tacked lightly to the body near the base to prevent it drooping.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the neck and tail as you work keeps them firm and even.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: body ${body.yarnRequiredGrams} g, neck ${neck.yarnRequiredGrams} g, tail ${tail.yarnRequiredGrams} g, head ${head.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Diplodocus', subtitle: '', excerpt: 'A grey diplodocus with a wide oval body, very long neck and tail, and a small sphere head. The longest make in the dinosaur set.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['diplodocus amigurumi', 'long tail dinosaur crochet', 'crochet diplodocus', 'sauropod soft toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 40 cm end to end with neck and tail extended.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A127 ── Orange Velociraptor ───────────────────────────────────────────────
{
  const slug = 'amigurumi-velociraptor'
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = capsule({ diameterCm: 7, lengthCm: 11, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 7, gauge: GAUGE, label: 'Leg (make 2)' })
  const claw = cone({ baseDiameterCm: 1.5, heightCm: 2.5, gauge: GAUGE, label: 'Claw (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', term: 'Colour change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('An orange velociraptor with a sphere head, capsule body, two long capsule legs, and two cone sickle claws. The raptor is posed upright with the long balancing tail extending behind. A stripe of darker orange along the back is added using a '), gt('colour-change', 'colour change'), t(' on the body rounds.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator, work one straight round, then '), gt('amigurumi-decrease', 'decrease'), t('. Stuff and close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' at the tail end and work the capsule. Add a darker stripe on the upper rounds using a '), gt('colour-change', 'colour change'), t('. Stuff firmly before closing.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 2)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Work each capsule, stuffing firmly. Leave the top open for sewing. The legs attach at the front-underside of the body.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Claws (make 2)'),
    p(t(`Rounds: ${claw.totalRounds} per claw. Work each cone starting at the pointed tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Do not stuff; sew closed and attach to the end of each leg.')),
    ...claw.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the front of the body. Attach legs to the front underside of the body, angled downward and slightly forward. Stitch one claw to the front of each leg, angled upward to give the sickle-claw pose.')),
    p(t('Work two small capsule arms and attach them to the sides of the body just below the neck. A long tapered cylinder tail sewn to the rear helps with balance.')),
    p(t('Add safety eyes and embroider a curved jaw line in a darker yarn.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the legs firmly is key to keeping the raptor standing.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: head ${head.yarnRequiredGrams} g, body ${body.yarnRequiredGrams} g, each leg ${leg.yarnRequiredGrams} g, each claw ${claw.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Velociraptor', subtitle: '', excerpt: 'An orange velociraptor with long capsule legs and sickle cone claws. The back stripe is added with a colour change on the body rounds.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['velociraptor amigurumi', 'raptor crochet toy', 'crochet velociraptor', 'sickle claw dino amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A128 ── Green Ankylosaurus ────────────────────────────────────────────────
{
  const slug = 'amigurumi-ankylosaurus'
  const body = oval({ longAxisCm: 14, shortAxisCm: 9, gauge: GAUGE, label: 'Body (armoured)' })
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const tail = cylinder({ diameterCm: 2.5, heightCm: 8, gauge: GAUGE, closeBothEnds: true, label: 'Tail with club' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'surface-crochet']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'surface-crochet', term: 'Surface crochet', definition: 'Working slip stitches through the surface of a finished piece to add texture or detail.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green ankylosaurus with a wide oval armoured body, a sphere head, four short legs, and a club-tipped tail. The armour texture across the back is created with '), gt('surface-crochet', 'surface crochet'), t(' in a darker green after the body is complete. The tail club is a small sphere worked at the tail tip.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point, work straight for several rounds, then '), gt('amigurumi-decrease', 'decrease'), t('. Stuff firmly before closing. After stuffing, add armour texture across the top using '), gt('surface-crochet', 'surface crochet'), t(' in a darker shade.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Work a sphere with a `), gt('magic-ring', 'magic ring'), t(', '), gt('amigurumi-increase', 'increasing'), t(' to the equator then '), gt('amigurumi-decrease', 'decreasing'), t('. Stuff and close. The head is low and wide to suit the ankylosaurus silhouette.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tail with club'),
    p(t(`Rounds: ${tail.totalRounds}. Work the cylinder, then '), gt('amigurumi-decrease', 'decrease'), t(' to a narrow point at one end. At the closed tip, add a small sphere piece (worked separately) as the club head and sew it on firmly.`)),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew four short capsule legs to the underside of the body. Attach the head to the low front of the body. Sew the tail to the rear, angling it slightly upward so the club clears the ground.')),
    p(t('Add safety eyes to the sides of the head. Run rows of '), gt('surface-crochet', 'surface crochet'), t(' in ridge lines across the body back to simulate armour plating.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body very firmly gives it the low, wide shape the ankylosaurus is known for.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: body ${body.yarnRequiredGrams} g, head ${head.yarnRequiredGrams} g, tail ${tail.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Ankylosaurus', subtitle: '', excerpt: 'A green ankylosaurus with a wide armoured oval body, sphere head, four short legs, and a club-tipped tail. Surface crochet adds the ridge armour texture.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['ankylosaurus amigurumi', 'armoured dinosaur crochet', 'crochet ankylosaurus', 'club tail dino amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A129 ── Green Pachycephalosaurus ──────────────────────────────────────────
{
  const slug = 'amigurumi-pachycephalosaurus'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Domed head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green pachycephalosaurus with its signature oversized domed head, an oval body, two stocky back legs, and two small front arms. The dome is a full sphere worked larger than the body to create the characteristic head-heavy silhouette. Small bumpy textures around the dome edge are added using tiny sphere bobbles.')),
    h2('Domed head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' at the crown and '), gt('amigurumi-increase', 'increase'), t(' steadily to the widest point. Work straight for two rounds then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff very firmly so the dome holds its convex shape.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the tail. Stuff and close.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 2)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each leg firmly and leave the top open for sewing. The legs attach at the front underside of the body.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the front of the body, angling it slightly downward so the dome is prominent. Attach both legs to the front underside, angled to support the upright pose. Add two small arms as short capsules on each side of the body.')),
    p(t('Stitch a ring of small bobbles around the lower edge of the dome in a contrasting colour for the characteristic skull ornamentation. Add safety eyes below the dome, close to the snout.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the dome head extra firmly is the key to this pattern working.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t(`Estimated yarn: head ${head.yarnRequiredGrams} g, body ${body.yarnRequiredGrams} g, each leg ${leg.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Pachycephalosaurus', subtitle: '', excerpt: 'A green pachycephalosaurus with an oversized domed sphere head and two stocky legs. The dome is the star piece of this head-heavy dino.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['pachycephalosaurus amigurumi', 'dome head dinosaur crochet', 'crochet pachycephalosaurus', 'bonehead dino amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

// ── A130 ── Baby Dino Hatching Egg ────────────────────────────────────────────
{
  const slug = 'amigurumi-baby-dino'
  const egg = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Egg' })
  const babyHead = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Baby head' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', term: 'Amigurumi increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', term: 'Amigurumi decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', term: 'Working in the round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', term: 'Stuffing and closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A hatching baby dinosaur worked as two pieces: a cracked egg shell and a small sphere head poking out of the top. This is a beginner-level make with just two straightforward pieces and very little assembly. The egg can be any pastel colour; the baby head is green. A short line of embroidered zigzag around the top of the egg represents the crack.')),
    h2('Egg'),
    p(t(`Rounds: ${egg.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' at the base and '), gt('amigurumi-increase', 'increase'), t(' to the widest point, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the top. Stop decreasing when about 10 stitches remain to leave an opening for the baby head. Stuff before the final rounds.')),
    ...egg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Baby head'),
    p(t(`Rounds: ${babyHead.totalRounds}. Work a sphere with a `), gt('magic-ring', 'magic ring'), t(', '), gt('amigurumi-increase', 'increasing'), t(' to the equator then '), gt('amigurumi-decrease', 'decreasing'), t('. Stuff and close. The head should sit comfortably in the egg opening.')),
    ...babyHead.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the baby head into the egg opening, stitching around the neck join so the head is secure but appears to be emerging from the crack. The head should protrude about half-way above the egg rim.')),
    p(t('Embroider a zigzag crack line around the upper portion of the egg in a slightly darker shade. Add tiny safety eyes to the baby face and embroider a small dot for the egg-tooth at the snout centre.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the egg fully before the head is attached gives it a solid rounded base.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' for both pieces throughout.')),
    p(t(`Estimated yarn: egg ${egg.yarnRequiredGrams} g, baby head ${babyHead.yarnRequiredGrams} g.`)),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Baby Dinosaur Hatching Egg', subtitle: '', excerpt: 'A tiny baby dinosaur emerging from a cracked egg. Two simple sphere pieces and a zigzag crack make this a great beginner dinosaur project.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques,
    aliases: ['baby dinosaur amigurumi', 'hatching egg crochet', 'crochet baby dino', 'dinosaur egg amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 9 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: doc(bodyNodes),
  })
}

console.log('Batch 13 complete.')
