/**
 * Generator: D-Amigurumi Batch 3 -- A21-A30 Ocean Animals
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch3.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sphere, cylinder, cone, capsule, oval, pear } from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

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

// ── A21 ── Blue Whale ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-whale'
  const bodyShape = oval({ longAxisCm: 14, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const flipperShape = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Flipper (make 2)' })
  const tailShape = oval({ longAxisCm: 6, shortAxisCm: 3, gauge: GAUGE, label: 'Tail flukes (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const body: object[] = [
    h2('About this pattern'),
    p(t('This blue whale builds from three pieces: an oval body, two capsule flippers, and two oval tail flukes. The belly is worked in pale blue or white yarn sewn on as a flat oval after assembly. Safety eyes sit just forward of the mid-point on the body.')),
    h2('Body'),
    p(t('Rounds: ' + bodyShape.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and work the oval following the row-by-row below.')),
    ...bodyShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Flippers (make 2)'),
    p(t('Rounds: ' + flipperShape.totalRounds + '. Use '), gt('amigurumi-increase', 'increase'), t(' rounds to build the capsule then close with a '), gt('stuffing-and-closing', 'flat closure'), t('. Do not stuff; sew flat.')),
    ...flipperShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Tail flukes (make 2)'),
    p(t('Rounds: ' + tailShape.totalRounds + '. Work each fluke flat and unsewn, then join the two pieces at the base before attaching to the body.')),
    ...tailShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach flippers level with round 6 of the body, one on each side. Pin the tail flukes to the narrow end and sew through both layers. Attach safety eyes.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the body seam-free for a smooth finish.')),
    p(t('Estimated yarn: body ' + bodyShape.yarnRequiredGrams + ' g, each flipper ' + flipperShape.yarnRequiredGrams + ' g, each fluke ' + tailShape.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Blue Whale', subtitle: '', excerpt: 'A plump oval blue whale with capsule flippers and two-piece tail flukes. A calm, satisfying make for intermediate crocheters.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['whale amigurumi', 'blue whale crochet', 'crochet whale toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long x 7 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: body },
  })
}

// ── A22 ── Purple Octopus ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-octopus'
  const headShape = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const tentacleShape = cylinder({ diameterCm: 1.5, heightCm: 7, gauge: GAUGE, closeBothEnds: false, label: 'Tentacle (make 8)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const body: object[] = [
    h2('About this pattern'),
    p(t('A beginner-friendly octopus: one sphere head and eight short cylinder tentacles. The tentacles hang from the underside of the head and can be lightly curved by blocking.')),
    h2('Head'),
    p(t('Rounds: ' + headShape.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(', then '), gt('amigurumi-increase', 'increase'), t(' each round until you reach the equator.')),
    ...headShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Tentacles (make 8)'),
    p(t('Rounds: ' + tentacleShape.totalRounds + ' per tentacle. Start each with a '), gt('magic-ring', 'magic ring'), t(' and work straight. Do not stuff; leave a 15 cm tail to sew on.')),
    ...tentacleShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Insert safety eyes above the equator of the head. Stuff the head firmly ('), gt('stuffing-and-closing', 'stuffing and closing'), t(') then stitch all eight tentacles to the underside, evenly spaced around the opening.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both pieces seam-free.')),
    p(t('Estimated yarn: head ' + headShape.yarnRequiredGrams + ' g, each tentacle ' + tentacleShape.yarnRequiredGrams + ' g (x 8).')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Octopus', subtitle: '', excerpt: 'A beginner-friendly purple octopus with a sphere head and eight dangling cylinder tentacles. Eight pieces, one happy result.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['octopus amigurumi', 'crochet octopus', 'beginner amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 8 cm wide head, tentacles 7 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: body },
  })
}

// ── A23 ── Red Crab ───────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-crab'
  const bodyShape = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Body' })
  const clawShape = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Claw (make 2)' })
  const legShape = cylinder({ diameterCm: 1.2, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 6)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A cheerful red crab built from a domed sphere body, two capsule claws, and six short cylinder legs. The claws taper slightly at the wrist using a few decrease rounds.')),
    h2('Body'),
    p(t('Rounds: ' + bodyShape.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' until the equator, then decrease to close.')),
    ...bodyShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Claws (make 2)'),
    p(t('Rounds: ' + clawShape.totalRounds + ' per claw. Work the capsule, stuff lightly, and leave open at the base for sewing.')),
    ...clawShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Legs (make 6)'),
    p(t('Rounds: ' + legShape.totalRounds + ' per leg. Work straight without stuffing. Leave a long tail.')),
    ...legShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach safety eyes to the front of the body. Sew three legs to each side. Position claws at the front, angled upward. Add a few rows of cream or white yarn across the belly for contrast using a '), gt('colour-change', 'colour change'), t('.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly keeps its rounded shape.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + bodyShape.yarnRequiredGrams + ' g, each claw ' + clawShape.yarnRequiredGrams + ' g, each leg ' + legShape.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Crab', subtitle: '', excerpt: 'A red crab with a rounded sphere body, capsule claws, and six stubby cylinder legs. Great intermediate practice for multi-piece assembly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crab amigurumi', 'crochet crab', 'red crab toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 8 cm wide body.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A24 ── Orange Starfish ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-starfish'
  const centreShape = sphere({ diameterCm: 4, gauge: GAUGE, label: 'Centre disc' })
  const armShape = cone({ baseDiameterCm: 3, heightCm: 6, gauge: GAUGE, label: 'Arm (make 5)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A five-pointed orange starfish made from a small sphere centre and five cone arms. The arms taper naturally using decrease rounds, then sew onto the centre at evenly spaced intervals.')),
    h2('Centre disc'),
    p(t('Rounds: ' + centreShape.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator, then decrease. Stuff lightly before closing.')),
    ...centreShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Arms (make 5)'),
    p(t('Rounds: ' + armShape.totalRounds + ' per arm. Begin with a '), gt('magic-ring', 'magic ring'), t(' at the tip and '), gt('amigurumi-increase', 'increase'), t(' outward. Stuff lightly and leave the base open to sew onto the disc.')),
    ...armShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Divide the centre disc into five equal segments. Pin one arm to each segment, ensuring the tips point outward evenly. Sew each arm through the open base.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' each arm just enough to hold its shape without over-bulking the seam.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both pieces seamless.')),
    p(t('Estimated yarn: centre ' + centreShape.yarnRequiredGrams + ' g, each arm ' + armShape.yarnRequiredGrams + ' g (x 5).')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Starfish', subtitle: '', excerpt: 'An orange five-pointed starfish with a small sphere centre and five tapering cone arms. A compact and satisfying intermediate make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['starfish amigurumi', 'crochet starfish', 'sea star crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm tip to tip.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A25 ── Grey Dolphin ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-dolphin'
  const bodyPiece = capsule({ diameterCm: 7, lengthCm: 13, gauge: GAUGE, label: 'Body' })
  const snoutPiece = cone({ baseDiameterCm: 3.5, heightCm: 5, gauge: GAUGE, label: 'Snout' })
  const flipperPiece = oval({ longAxisCm: 5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Flipper (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A streamlined dolphin made from a capsule body, cone snout, and two flat oval flippers. A white belly panel is surface-sewn after assembly. The dorsal fin is a small cone or folded piece of stiffened fabric.')),
    h2('Body'),
    p(t('Rounds: ' + bodyPiece.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' at the tail end. '), gt('amigurumi-increase', 'Increase'), t(' to the widest point then work straight before decreasing toward the snout end.')),
    ...bodyPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Snout'),
    p(t('Rounds: ' + snoutPiece.totalRounds + '. Start at the tip with a '), gt('magic-ring', 'magic ring'), t(' and increase outward. Leave the base open to join to the body.')),
    ...snoutPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Flippers (make 2)'),
    p(t('Rounds: ' + flipperPiece.totalRounds + ' per flipper. Work flat, do not stuff, and sew closed around the edges before attaching.')),
    ...flipperPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach the snout to the body front. Sew flippers to each side at round 5. Add safety eyes just above the snout join. Embroider a curved smile in contrast yarn.')),
    p(t('Use a '), gt('colour-change', 'colour change'), t(' to add the white belly panel directly or surface-sew it on afterwards.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before attaching the snout.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + bodyPiece.yarnRequiredGrams + ' g, snout ' + snoutPiece.yarnRequiredGrams + ' g, each flipper ' + flipperPiece.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Dolphin', subtitle: '', excerpt: 'A grey dolphin with a streamlined capsule body, cone snout, and flat oval flippers. The white belly is embroidered on after assembly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['dolphin amigurumi', 'crochet dolphin', 'dolphin soft toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 13 cm long x 7 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A26 ── Yellow Seahorse ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-seahorse'
  const bodyPiece = pear({ maxDiameterCm: 7, topDiameterCm: 3, heightCm: 10, gauge: GAUGE, label: 'Body' })
  const headPiece = sphere({ diameterCm: 4, gauge: GAUGE, label: 'Head' })
  const snoutPiece = cone({ baseDiameterCm: 2, heightCm: 4, gauge: GAUGE, label: 'Snout' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A yellow seahorse made from a pear-shaped body, a small sphere head, and a narrow cone snout. A textured dorsal ridge is added by surface-crocheting a chain along the back after assembly.')),
    h2('Body'),
    p(t('Rounds: ' + bodyPiece.totalRounds + '. Begin at the tail curl with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' through the widest point, then '), gt('amigurumi-decrease', 'decrease'), t(' toward the neck.')),
    ...bodyPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Head'),
    p(t('Rounds: ' + headPiece.totalRounds + '. Work a sphere, stuffing before closing.')),
    ...headPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Snout'),
    p(t('Rounds: ' + snoutPiece.totalRounds + '. Start at the tip with a '), gt('magic-ring', 'magic ring'), t(' and increase outward. Leave the base open.')),
    ...snoutPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Join the snout to the head at the front. Attach the head to the narrow neck end of the body. Curve the tail upward and tack it in place with a few stitches. Attach safety eyes.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body first makes assembly easier.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + bodyPiece.yarnRequiredGrams + ' g, head ' + headPiece.yarnRequiredGrams + ' g, snout ' + snoutPiece.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Seahorse', subtitle: '', excerpt: 'A yellow seahorse with a pear body, sphere head, and narrow cone snout. The tail curves naturally and can be tacked into position.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['seahorse amigurumi', 'crochet seahorse', 'seahorse soft toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A27 ── Pink Jellyfish ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-jellyfish'
  const bellShape = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Bell' })
  const tentacleShape = cylinder({ diameterCm: 1, heightCm: 8, gauge: GAUGE, closeBothEnds: false, label: 'Tentacle (make 6)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A beginner-friendly pink jellyfish with a sphere bell and six long cylinder tentacles. The bell is only half-stuffed so it sits with a flat base. A loop at the top lets it hang as a mobile piece.')),
    h2('Bell'),
    p(t('Rounds: ' + bellShape.totalRounds + '. Begin with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stop decreasing halfway to leave the base open; half-stuff before joining the tentacles.')),
    ...bellShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Tentacles (make 6)'),
    p(t('Rounds: ' + tentacleShape.totalRounds + ' per tentacle. Start each with a '), gt('magic-ring', 'magic ring'), t(' and work straight without stuffing. Leave a 20 cm tail.')),
    ...tentacleShape.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach six tentacles evenly around the base opening of the bell. Pull the final closure round tight over the tentacle bases to hold them in place. Add safety eyes and embroider a small mouth.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' only to the halfway point keeps the bell shaped rather than fully round.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: bell ' + bellShape.yarnRequiredGrams + ' g, each tentacle ' + tentacleShape.yarnRequiredGrams + ' g (x 6).')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Jellyfish', subtitle: '', excerpt: 'A beginner-friendly pink jellyfish with a sphere bell and six dangling cylinder tentacles. Half-stuff the bell so it sits flat at the base.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['jellyfish amigurumi', 'crochet jellyfish', 'beginner amigurumi ocean'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 8 cm wide bell, tentacles 8 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A28 ── Red Lobster ────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-lobster'
  const bodyPiece = oval({ longAxisCm: 12, shortAxisCm: 5, gauge: GAUGE, label: 'Body' })
  const clawPiece = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Claw (make 2)' })
  const legPiece = cylinder({ diameterCm: 1, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 6)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A bold red lobster built from an oval body, two large capsule claws, and six slim cylinder legs. The tail fan is a short flat oval worked separately and sewn to the narrow body end.')),
    h2('Body'),
    p(t('Rounds: ' + bodyPiece.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work straight, then decrease to the tail end.')),
    ...bodyPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Claws (make 2)'),
    p(t('Rounds: ' + clawPiece.totalRounds + ' per claw. Work a capsule, stuff firmly, and leave the base open. The claw tip can be pinched slightly and tacked to shape.')),
    ...clawPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Legs (make 6)'),
    p(t('Rounds: ' + legPiece.totalRounds + ' per leg. Work straight without stuffing.')),
    ...legPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach three legs to each side of the body. Sew claws to the front. Add a small tail-fan piece to the narrow end. Add safety eyes on stalks above the claws.')),
    p(t('Use a '), gt('colour-change', 'colour change'), t(' to add orange or coral highlights along the shell ridge.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before attaching legs.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + bodyPiece.yarnRequiredGrams + ' g, each claw ' + clawPiece.yarnRequiredGrams + ' g, each leg ' + legPiece.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Lobster', subtitle: '', excerpt: 'A red lobster with an oval body, large capsule claws, and six slim cylinder legs. The tail fan is worked separately and adds a satisfying finishing touch.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['lobster amigurumi', 'crochet lobster', 'red lobster toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm long body.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A29 ── Green Turtle ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-turtle'
  const bodyPiece = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Body (domed)' })
  const shellPiece = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Shell panel' })
  const flipperPiece = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Flipper (make 4)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'surface-crochet']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'surface-crochet', definition: 'Working slip stitches through the surface of a finished piece to add texture or detail.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A green sea turtle with a rounded sphere body, a textured oval shell panel, and four flat capsule flippers. The hex-pattern shell texture is added using '), gt('surface-crochet', 'surface crochet'), t(' after the oval piece is complete.')),
    h2('Body'),
    p(t('Rounds: ' + bodyPiece.totalRounds + '. Start with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stop decreasing early to leave the underside flat for the flippers.')),
    ...bodyPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Shell panel'),
    p(t('Rounds: ' + shellPiece.totalRounds + '. Work the oval flat, then add hex detail with '), gt('surface-crochet', 'surface crochet'), t(' before sewing onto the body.')),
    ...shellPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Flippers (make 4)'),
    p(t('Rounds: ' + flipperPiece.totalRounds + ' per flipper. Work each capsule without stuffing and sew flat to close.')),
    ...flipperPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Sew the shell panel to the top of the body. Position two front flippers angled forward and two rear flippers angled backward, then stitch in place. Attach safety eyes to the head end.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body before attaching the shell gives the best dome shape.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + bodyPiece.yarnRequiredGrams + ' g, shell ' + shellPiece.yarnRequiredGrams + ' g, each flipper ' + flipperPiece.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Turtle', subtitle: '', excerpt: 'A green sea turtle with a domed sphere body, textured oval shell panel, and four flat capsule flippers. Surface crochet adds the classic hex shell pattern.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['turtle amigurumi', 'crochet turtle', 'sea turtle toy', 'tortoise amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 9 cm long x 8 cm wide.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

// ── A30 ── Grey Shark ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-shark'
  const bodyPiece = capsule({ diameterCm: 8, lengthCm: 15, gauge: GAUGE, label: 'Body' })
  const dorsalFin = cone({ baseDiameterCm: 4, heightCm: 6, gauge: GAUGE, label: 'Dorsal fin' })
  const tailFin = cone({ baseDiameterCm: 3, heightCm: 5, gauge: GAUGE, label: 'Tail fin (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { slug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { slug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { slug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { slug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { slug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyNodes: object[] = [
    h2('About this pattern'),
    p(t('A grey shark with a long capsule body, a tall dorsal fin, and two cone tail fins. The white belly is worked in using a '), gt('colour-change', 'colour change'), t(' on the underside rounds. Pectoral fins are flat ovals sewn to the sides.')),
    h2('Body'),
    p(t('Rounds: ' + bodyPiece.totalRounds + '. Begin at the snout end with a '), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work straight, then decrease toward the tail.')),
    ...bodyPiece.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Dorsal fin'),
    p(t('Rounds: ' + dorsalFin.totalRounds + '. Start at the top point with a '), gt('magic-ring', 'magic ring'), t(' and increase outward. Do not stuff; sew flat at the base onto the spine.')),
    ...dorsalFin.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Tail fins (make 2)'),
    p(t('Rounds: ' + tailFin.totalRounds + ' per fin. Work each cone flat and attach at a slight angle to form the forked tail.')),
    ...tailFin.rowByRow.map(r => p(t('Round ' + r.round + ': ' + r.instructions))),
    h2('Assembly'),
    p(t('Attach the dorsal fin centred on the back. Join the two tail fins at the narrow body end, angled up and down. Sew two flat oval pectoral fins to the sides. Add safety eyes and embroider a toothy grin in white yarn.')),
    p(t('Switch to white yarn on the underside rounds using a '), gt('colour-change', 'colour change'), t(' for the belly panel.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before attaching fins.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: body ' + bodyPiece.yarnRequiredGrams + ' g, dorsal fin ' + dorsalFin.yarnRequiredGrams + ' g, each tail fin ' + tailFin.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Shark', subtitle: '', excerpt: 'A grey shark with a capsule body, tall dorsal fin, and forked cone tail fins. The colour-change white belly adds a bold contrast stripe.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['shark amigurumi', 'crochet shark', 'shark soft toy', 'great white amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm long x 8 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: { type: 'doc', content: bodyNodes },
  })
}

console.log('Batch 3 complete.')
