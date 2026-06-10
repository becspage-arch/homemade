/**
 * Generator: D-Amigurumi Batch 16 -- A151-A160 Safari and Savanna Animals
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch16.ts
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
  const body = out.body
  const wrapped = { ...out, body: { type: 'doc', content: body } }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(wrapped, null, 2))
  console.log(`Written: ${slug}.json`)
}

// ── A151 ── Grey Hippo ────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-hippo'
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 3, lengthCm: 4, gauge: GAUGE, label: 'Leg (make 4)' })
  const ear = cone({ baseDiameterCm: 2.5, heightCm: 2, gauge: GAUGE, label: 'Ear (make 2)' })

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
    p(t('A chunky grey hippo built from a large sphere head, an oval body, four short capsule legs, and two small cone ears. The wide muzzle is a flat oval sewn onto the front of the head. Safety eyes sit high on the head, close to the top, as they do on a real hippo.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(', then '), gt('amigurumi-increase', 'increase'), t(' each round to the equator, then decrease to close. Stuff firmly before the last few rounds.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and follow the oval shape, '), gt('amigurumi-increase', 'increasing'), t(' to the widest point then '), gt('amigurumi-decrease', 'decreasing'), t(' to close. Stuff firmly.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Work each capsule, stuff lightly, and leave the top open to sew onto the body underside.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    p(t(`Rounds: ${ear.totalRounds} per ear. Work each small cone without stuffing and sew flat to the top of the head.`)),
    ...ear.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the front of the body. Attach all four legs to the underside of the body at even corners. Pin ears to the crown of the head and stitch in place. Attach safety eyes above the muzzle line.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body before attaching legs gives it a firm base to stand on.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps all pieces seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, each ear ' + ear.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Hippo', subtitle: '', excerpt: 'A chunky grey hippo with a large sphere head, oval body, four short capsule legs, and tiny cone ears. The wide muzzle is sewn on as a flat oval.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['hippo amigurumi', 'hippopotamus crochet', 'crochet hippo toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm long × 10 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A152 ── Grey Rhino ────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-rhino'
  const head = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 14, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 3.5, lengthCm: 5, gauge: GAUGE, label: 'Leg (make 4)' })
  const horn = cone({ baseDiameterCm: 2, heightCm: 4, gauge: GAUGE, label: 'Horn' })

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
    p(t('A solid grey rhino made from an oval head, a large oval body, four sturdy capsule legs, and a cone horn. A second smaller horn can be added behind the first for a white rhino look. Ears are small folded oval pieces sewn to the sides of the head.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and follow the oval, '), gt('amigurumi-increase', 'increasing'), t(' to the widest point then '), gt('amigurumi-decrease', 'decreasing'), t('. Stuff firmly.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the large oval, stuffing firmly before closing.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff lightly and leave the top open to attach.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Horn'),
    p(t(`Rounds: ${horn.totalRounds}. Begin at the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Stuff lightly and sew to the front top of the head.')),
    ...horn.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the front of the body. Attach all four legs to the underside. Position the horn on the top of the snout and stitch firmly. Add small oval ears to each side of the head. Attach safety eyes.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' both the head and body firmly gives this animal a solid, satisfying weight.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, horn ' + horn.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Rhino', subtitle: '', excerpt: 'A sturdy grey rhino with an oval head, large oval body, four capsule legs, and a cone horn. Add a second horn for a white rhino variation.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['rhino amigurumi', 'rhinoceros crochet', 'crochet rhino toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm long × 11 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A153 ── Spotted Cheetah ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-cheetah'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 4)' })
  const tail = cylinder({ diameterCm: 2, heightCm: 10, gauge: GAUGE, closeBothEnds: true, label: 'Tail' })

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
    p(t('A sleek spotted cheetah made from a sphere head, an oval body, four slim capsule legs, and a long cylinder tail. Black spots are embroidered on after assembly using a tapestry needle and black yarn. Tear-drop face markings are worked in black yarn directly on the head.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval, stuffing firmly. Use a `), gt('colour-change', 'colour change'), t(' to add a cream belly panel on the underside rounds.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff lightly and leave the top open to attach.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tail'),
    p(t(`Rounds: ${tail.totalRounds}. Work the cylinder with a black tip for the final 4 rounds, stuffing lightly. Curve and tack to the rear of the body.`)),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the body. Attach front and rear legs, spacing the rear legs slightly wider. Join the tail at the back, curving it upward. Embroider black spots across the back and sides. Add safety eyes and a small embroidered nose.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body before attaching legs helps the animal stand evenly.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, tail ' + tail.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Cheetah', subtitle: '', excerpt: 'A sleek spotted cheetah with a sphere head, oval body, slim capsule legs, and a long cylinder tail. Black spots are embroidered on after assembly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['cheetah amigurumi', 'crochet cheetah', 'spotted cat amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 17 cm long × 8 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A154 ── Black Gorilla ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-gorilla'
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const arm = capsule({ diameterCm: 3, lengthCm: 9, gauge: GAUGE, label: 'Arm (make 2)' })
  const leg = capsule({ diameterCm: 3.5, lengthCm: 5, gauge: GAUGE, label: 'Leg (make 2)' })

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
    p(t('A stocky black gorilla with a large sphere head, oval body, two long capsule arms, and two short capsule legs. The face features a flat oval muzzle in grey or tan yarn sewn onto the front of the head. The gorilla sits upright, with arms resting forward.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly. Switch to grey for the muzzle area using a '), gt('colour-change', 'colour change'), t('.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval in black yarn, stuffing firmly before closing.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Work the long capsule, stuff lightly, and curve the tip slightly to suggest a resting hand.`)),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 2)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Work the short capsule, stuff lightly, and attach angled outward from the body base.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the top of the body. Attach both arms to the upper sides. Position legs at the base so the gorilla sits stably. Add a flat grey oval muzzle and stitch safety eyes above it. Embroider nostrils in black yarn.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' all pieces firmly keeps the gorilla seated upright.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Gorilla', subtitle: '', excerpt: 'A stocky black gorilla with a large sphere head, oval body, long capsule arms, and short legs. The flat grey muzzle and safety eyes complete the face.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['gorilla amigurumi', 'crochet gorilla', 'ape amigurumi', 'silverback crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A155 ── Upright Meerkat ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-meerkat'
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const bodyPiece = cylinder({ diameterCm: 5, heightCm: 9, gauge: GAUGE, closeBothEnds: true, label: 'Body' })
  const arm = capsule({ diameterCm: 1.8, lengthCm: 5, gauge: GAUGE, label: 'Arm (make 2)' })

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
    p(t('An alert meerkat standing upright. The cylinder body gives a tall, narrow torso, while the sphere head and capsule arms are stitched in position so the meerkat looks as though it is scanning the horizon. Striped back markings are embroidered in dark brown after assembly.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Apply a '), gt('colour-change', 'colour change'), t(' to a lighter tan at the muzzle area. Stuff firmly and '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${bodyPiece.totalRounds}. Work the cylinder straight, stuffing firmly as you go. The base sits flat so the meerkat stands without support.`)),
    ...bodyPiece.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Stuff lightly and position each arm at a slight forward angle when sewing to the upper sides of the body.`)),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head to the top of the cylinder body, angled slightly upward. Sew arms to the upper sides. Embroider dark brown stripes across the back. Add safety eyes with dark circles around them in brown yarn. Stitch a short cylinder tail to the lower back.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the cylinder body firmly is the key to keeping the meerkat standing.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + bodyPiece.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Meerkat', subtitle: '', excerpt: 'An alert meerkat standing upright on a cylinder body with a sphere head and slim capsule arms. Embroidered back stripes finish the look.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['meerkat amigurumi', 'crochet meerkat', 'suricata crochet toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm tall standing.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A156 ── Spotted Hyena ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-hyena'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 4)' })

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
    p(t('A tawny spotted hyena made from a sphere head, oval body, and four capsule legs. The front legs are slightly longer than the rear to capture the hyena\'s characteristic sloping back. Dark spots are embroidered in brown yarn after assembly.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly. Round ears are small circles sewn flat to the top of the head.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval in tawny yarn. Stuff firmly before closing.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Make the front pair slightly longer by adding two extra straight rounds. Stuff lightly and attach.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the front of the body, angled slightly downward to give the characteristic hunched look. Attach front legs near the head end and rear legs near the back. Add a short stubby cylinder tail. Embroider dark spots across the body. Attach safety eyes.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the body firmly before leg attachment gives a stable finished shape.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Hyena', subtitle: '', excerpt: 'A tawny spotted hyena with a sphere head, oval body, and four capsule legs. Front legs are made longer to capture the hyena\'s sloping back.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['hyena amigurumi', 'crochet hyena', 'spotted hyena toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm long × 9 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A157 ── Dark Brown Wildebeest ─────────────────────────────────────────────
{
  const slug = 'amigurumi-wildebeest'
  const head = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 14, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 7, gauge: GAUGE, label: 'Leg (make 4)' })
  const horn = cone({ baseDiameterCm: 1.5, heightCm: 4, gauge: GAUGE, label: 'Horn (make 2)' })

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
    p(t('A dark brown wildebeest (gnu) made from an oval head, a large oval body, four long capsule legs, and two curved cone horns. A short fluffy mane is added along the back of the head and neck using cut yarn loops. The beard is a few loops of yarn sewn under the muzzle.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and follow the oval. Stuff firmly. The muzzle end is the larger oval end.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the large oval in dark brown. Stuff firmly before closing.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Long straight capsules give the wildebeest its characteristic stilt-like stance. Stuff lightly.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Horns (make 2)'),
    p(t(`Rounds: ${horn.totalRounds} per horn. Begin at the tip with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward. Stuff lightly and curve the horn sideways before the base sets.')),
    ...horn.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the front of the body. Attach all four legs to the underside. Position both horns symmetrically on the crown of the head, curving outward. Add loops of yarn for the mane along the neck join. Attach safety eyes and embroider nostrils.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the legs lightly allows them to be positioned at a slight outward angle for stability.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, each horn ' + horn.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Wildebeest', subtitle: '', excerpt: 'A dark brown wildebeest with an oval head, large body, four long capsule legs, and curved cone horns. Cut yarn loops along the neck add a shaggy mane.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['wildebeest amigurumi', 'gnu crochet', 'crochet wildebeest toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm long × 12 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A158 ── Brown Warthog ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-warthog'
  const head = oval({ longAxisCm: 8, shortAxisCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Leg (make 4)' })
  const tusk = cone({ baseDiameterCm: 1.2, heightCm: 3, gauge: GAUGE, label: 'Tusk (make 2)' })

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
    p(t('A compact brown warthog with a wide oval head, oval body, four short capsule legs, and two small cone tusks. The flat wide snout is a separate small oval sewn onto the face. Small cone bumps above the eyes represent the characteristic facial warts.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and follow the oval shape. The wider end is the snout. Stuff firmly before closing.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval in brown yarn. Stuff firmly before closing.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Short and sturdy. Stuff lightly and attach to the underside of the body.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tusks (make 2)'),
    p(t(`Rounds: ${tusk.totalRounds} per tusk. Work small cones in cream yarn. Curve the tip slightly and sew to each side of the snout pointing upward and outward.`)),
    ...tusk.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the body front. Attach legs at the four corners of the body underside. Sew both tusks to the sides of the snout. Add very small cone bumps above each safety eye for the facial warts. Stitch a thin cylinder tail with a tuft of yarn to the rear.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the head firmly gives it the characteristic solid, flat-faced look.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, each tusk ' + tusk.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Warthog', subtitle: '', excerpt: 'A compact brown warthog with a wide oval head, oval body, four short legs, and cream cone tusks. Tiny cone bumps above the eyes add its distinctive warts.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['warthog amigurumi', 'crochet warthog', 'pumba crochet toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long × 8 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A159 ── Grey Ostrich ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-ostrich'
  const head = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
  const neck = cylinder({ diameterCm: 3, heightCm: 8, gauge: GAUGE, closeBothEnds: false, label: 'Neck' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const leg = cylinder({ diameterCm: 2, heightCm: 10, gauge: GAUGE, closeBothEnds: true, label: 'Leg (make 2)' })

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
    p(t('A tall grey ostrich with a small sphere head, a long cylinder neck, an oval body, and two long cylinder legs. The wing feathers are flat oval pieces sewn to each side of the body. A short flat beak is added to the front of the head. The legs sit wide apart so the ostrich stands unaided.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator, then '), gt('amigurumi-decrease', 'decrease'), t(' to close. Stuff firmly. Add a flat oval beak in orange yarn.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Neck'),
    p(t(`Rounds: ${neck.totalRounds}. Work the cylinder straight, stuffing as you go. Leave both ends open to join head and body.`)),
    ...neck.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the large oval in grey or dark brown yarn. Stuff firmly before closing.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 2)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Long straight cylinders stuffed firmly. Work two extra rounds at the base in orange yarn for the foot.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Join the neck between the head and body. Attach both legs to the underside, spaced wide. Sew flat oval wings to each side of the body. Add safety eyes to the head sides and stitch the beak in place.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the legs very firmly is essential for the ostrich to stand on its own.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, neck ' + neck.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Ostrich', subtitle: '', excerpt: 'A tall grey ostrich with a small sphere head, long cylinder neck, oval body, and two long straight legs. Wide leg placement lets it stand unaided.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['ostrich amigurumi', 'crochet ostrich', 'ostrich bird toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 25 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

// ── A160 ── Baby Elephant ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-baby-elephant'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const trunk = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Trunk' })

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
    p(t('A beginner-friendly baby elephant at approximately 12 cm finished height. The big sphere head, small oval body, and short capsule trunk make this an approachable first amigurumi project. Large flat oval ears sewn to the sides of the head complete the baby elephant look.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Stuff firmly then '), gt('amigurumi-decrease', 'decrease'), t(' to close.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval, stuffing firmly. The body is intentionally small relative to the head to keep the baby proportions.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Trunk'),
    p(t(`Rounds: ${trunk.totalRounds}. Work the short capsule. Leave the top open and `), gt('amigurumi-decrease', 'decrease'), t(' gently at the tip for a rounded end. Stuff lightly and curve the tip upward before sewing onto the head.')),
    ...trunk.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the body. Attach the trunk to the lower front of the head, curving the tip upward. Cut two large oval ear shapes from the remaining yarn and sew one to each side of the head. Attach four short capsule legs to the body underside. Add safety eyes above the trunk.')),
    p(gt('stuffing-and-closing', 'Stuffing and closing'), t(' the head generously gives the baby elephant its characteristic large-headed, endearing shape.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, trunk ' + trunk.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Baby Elephant', subtitle: '', excerpt: 'A beginner baby elephant at around 12 cm tall. The oversized sphere head, compact oval body, and short curved trunk make it a satisfying first amigurumi project.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['baby elephant amigurumi', 'crochet elephant', 'beginner elephant crochet', 'small elephant toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyNodes,
  })
}

console.log('Batch 16 complete.')
