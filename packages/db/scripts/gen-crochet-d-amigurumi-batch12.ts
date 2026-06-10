/**
 * Generator: D-Amigurumi Batch 12 -- A111-A120 Australian and Exotic Animals
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch12.ts
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
  console.log(`Written: ${slug}.json`)
}

// ── A111 ── Grey Koala ────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-koala'
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const ear = oval({ longAxisCm: 4, shortAxisCm: 3.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const arm = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Arm (make 2)' })

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

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A grey koala made from a large sphere head, an oval body, two wide oval ears, and two capsule arms. The nose is a small flat oval sewn to the face. The ears have a pale inner section worked in cream or light pink yarn using a '), gt('colour-change', 'colour change'), t('.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' each round to the equator, then decrease to close. Stuff firmly before the final round.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval from one end, increasing to the widest point then decreasing. `), gt('stuffing-and-closing', 'Stuff and close'), t(' before attaching to the head.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    p(t(`Rounds: ${ear.totalRounds} per ear. Work the outer grey oval first. Switch to pale yarn mid-piece using a `), gt('colour-change', 'colour change'), t(' for the inner ear panel. Do not stuff; sew the edges flat before attaching.')),
    ...ear.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Work each capsule with light stuffing. Leave the base open to sew onto the body sides.`)),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head to the body. Pin the ears to the top-sides of the head and sew securely. Position arms at the upper body sides and stitch in place. Add safety eyes and a small oval nose in dark grey or brown.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps all pieces seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each ear ' + ear.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Koala', subtitle: '', excerpt: 'A grey koala with a large sphere head, oval body, wide oval ears, and capsule arms. The two-tone ears are the highlight of this satisfying intermediate make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['koala amigurumi', 'crochet koala', 'koala bear toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A112 ── Brown Kangaroo ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-kangaroo'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 7, gauge: GAUGE, label: 'Leg (make 2)' })
  const joey = cylinder({ diameterCm: 4, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'Joey pocket' })

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

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A brown kangaroo with a sphere head, oval body, long capsule legs, and an open-top cylinder joey pocket on the belly. A miniature joey (a tiny sphere with ears) peeks out from the pouch. The ears are long narrow ovals.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Decrease to close and stuff before the final rounds.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval body, stuffing firmly with `), gt('stuffing-and-closing', 'stuffing and closing'), t('. The joey pocket sews to the front of the body before the head is attached.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Joey pocket'),
    p(t(`Rounds: ${joey.totalRounds}. Work an open-top cylinder and leave the top edge unfinished. Sew the base and sides to the lower body front. Use `), gt('surface-crochet', 'surface crochet'), t(' to reinforce the pocket edge.')),
    ...joey.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 2)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each capsule and sew to the lower body with the feet pointing forward.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head at a slight forward angle. Sew ears to the top of the head. Position legs so the kangaroo stands or sits. Tuck a tiny joey piece into the pocket and tack in place with a single stitch.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps all main pieces seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, joey pocket ' + joey.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Kangaroo', subtitle: '', excerpt: 'A brown kangaroo with a sphere head, oval body, long capsule legs, and a cylinder joey pocket on the belly. The peeking joey makes this one a favourite.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['kangaroo amigurumi', 'crochet kangaroo', 'kangaroo with joey'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A113 ── Brown Platypus ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-platypus'
  const body = oval({ longAxisCm: 13, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
  const bill = oval({ longAxisCm: 6, shortAxisCm: 3, gauge: GAUGE, label: 'Bill' })
  const tail = capsule({ diameterCm: 4, lengthCm: 6, gauge: GAUGE, label: 'Flat tail' })

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

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A brown platypus built from an oval body, a flat oval bill, and a broad flat capsule tail. The bill and tail are worked in a slightly different shade using a '), gt('colour-change', 'colour change'), t('. Four short capsule legs attach to the underside.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the widest point. Work straight for several rounds then decrease toward the bill end. Stuff with '), gt('stuffing-and-closing', 'stuffing and closing'), t(' before the final round.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Bill'),
    p(t(`Rounds: ${bill.totalRounds}. Work a flat oval in a warm brown or khaki shade using a `), gt('colour-change', 'colour change'), t('. Do not stuff; leave the back edge open to sew onto the body front.')),
    ...bill.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Flat tail'),
    p(t(`Rounds: ${tail.totalRounds}. Work the capsule without stuffing and press flat before sewing. The tail should look wide and paddle-shaped.`)),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the bill to the narrow front of the body. Attach the flat tail to the back. Sew four short legs to the underside at the mid-point. Add safety eyes just above the bill join.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the body seam-free and smooth.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g, bill ' + bill.yarnRequiredGrams + ' g, tail ' + tail.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Platypus', subtitle: '', excerpt: 'A brown platypus with an oval body, flat oval bill, and broad paddle tail. One of the quirkiest and most distinctive amigurumi builds in the collection.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['platypus amigurumi', 'crochet platypus', 'duck billed platypus toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A114 ── Brown Wombat ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-wombat'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Leg (make 4)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A chunky brown wombat made from a wide sphere head, a generously stuffed oval body, and four short capsule legs. The nose is a small oval in dark brown sewn to the face. Small round ears sit on top of the head.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Decrease toward the neck opening. Stuff firmly using '), gt('stuffing-and-closing', 'stuffing and closing'), t(' just before closing.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval from the rear, increasing to the widest point then decreasing toward the front. Stuff the body well so the wombat sits solidly. Close using `), gt('stuffing-and-closing', 'stuffing and closing'), t('.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each capsule lightly and leave the base open for sewing.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head to the front of the body. Sew front legs to the lower front sides and back legs to the lower rear sides. Add two small oval ears to the head top. Position safety eyes on the face above the nose oval.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the body seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Wombat', subtitle: '', excerpt: 'A chunky brown wombat with a wide sphere head, generously stuffed oval body, and four short capsule legs. Solid and satisfying to make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['wombat amigurumi', 'crochet wombat', 'wombat soft toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A115 ── Black and White Giant Panda ───────────────────────────────────────
{
  const slug = 'amigurumi-panda'
  const head = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const arm = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Arm (make 2)' })
  const eyePatch = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Eye patch (make 2)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'colour-change']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'colour-change']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { termSlug: 'colour-change', definition: 'Swapping yarn mid-round to add a second colour.' },
  ]

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A giant panda worked in black and white dk yarn. The head and body are white with black ears, arms, and legs. The eye patches are small flat ovals in black sewn onto the face before safety eyes are inserted.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' in white yarn and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Decrease toward the neck. Stuff firmly before closing with '), gt('stuffing-and-closing', 'stuffing and closing'), t('.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the body in white yarn. Switch to black for the lower body section using a `), gt('colour-change', 'colour change'), t('. Stuff and close before attaching to the head.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Arms (make 2)'),
    p(t(`Rounds: ${arm.totalRounds} per arm. Work each arm in black yarn. Stuff lightly and leave the base open to sew onto the body sides.`)),
    ...arm.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Eye patches (make 2)'),
    p(t(`Rounds: ${eyePatch.totalRounds} per patch. Work flat ovals in black and do not stuff. Sew the patches symmetrically to the face before inserting safety eyes through the centre of each patch.`)),
    ...eyePatch.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach head to body. Sew black ears to the head top. Position arms on the upper body sides. Add the eye patches and then insert safety eyes. Embroider a small nose and mouth in black yarn.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' keeps the head and body seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each arm ' + arm.yarnRequiredGrams + ' g, each eye patch ' + eyePatch.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Panda', subtitle: '', excerpt: 'A black and white giant panda with a large sphere head, oval body, capsule arms, and flat oval eye patches. The classic contrast colouring makes this an eye-catching make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['panda amigurumi', 'crochet panda', 'giant panda toy', 'panda bear crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A116 ── Red Panda ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-red-panda'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Leg (make 4)' })
  const tail = capsule({ diameterCm: 3.5, lengthCm: 10, gauge: GAUGE, label: 'Bushy tail' })

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

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A red panda worked in rust and cream dk yarn. The body and tail are rust, the face mask and ear tips are cream, and the legs are dark brown. The striped tail uses a '), gt('colour-change', 'colour change'), t(' every few rounds to create ring bands.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' in rust yarn and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Switch to cream for the face region using a '), gt('colour-change', 'colour change'), t('. Stuff firmly before closing.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval in rust yarn. Stuff using `), gt('stuffing-and-closing', 'stuffing and closing'), t(' before attaching to the head.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Work in dark brown yarn. Stuff each capsule and sew closed at the base.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Bushy tail'),
    p(t(`Rounds: ${tail.totalRounds}. Alternate rust and cream every two rounds using a `), gt('colour-change', 'colour change'), t(' to create ring bands. Stuff firmly for a full rounded shape before closing with '), gt('stuffing-and-closing', 'stuffing and closing'), t('.')),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head to the body. Sew the two front legs to the upper body sides and back legs to the lower rear. Attach the tail to the back of the body. Add pointed ears to the head top with cream inner ear patches.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps all pieces seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g, tail ' + tail.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Red Panda', subtitle: '', excerpt: 'A rust and cream red panda with a sphere head, oval body, dark legs, and a striped bushy tail. The ringed tail is the standout feature of this intermediate make.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['red panda amigurumi', 'crochet red panda', 'firefox amigurumi', 'red panda toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm long body, tail 10 cm.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A117 ── Brown Capybara ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-capybara'
  const head = oval({ longAxisCm: 9, shortAxisCm: 6, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 14, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Leg (make 4)' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A brown capybara made from a rectangular oval head, a long oval body, and four short sturdy capsule legs. The capybara sits low and level with its distinctive blunt nose. The ears are small flat ovals sewn to the head sides.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the oval width. Work several straight rounds to build the boxy head shape. Stuff before closing with '), gt('stuffing-and-closing', 'stuffing and closing'), t('.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the long oval body, keeping the top line flat by working the decrease rounds only on the sides and base. Stuff the body well using `), gt('stuffing-and-closing', 'stuffing and closing'), t('. Attach legs before closing.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Stuff each capsule to hold its shape. Sew to the underside of the body at four corners, angled slightly outward.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head at the front of the body with the flat face forward. Add small ears to the head sides. Insert safety eyes on the upper face. Embroider nostrils in dark brown yarn at the flat nose end.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both main pieces seam-free.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Capybara', subtitle: '', excerpt: 'A brown capybara with a boxy oval head, long oval body, and four short sturdy legs. The low-slung silhouette captures the capybara perfectly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['capybara amigurumi', 'crochet capybara', 'capybara toy'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A118 ── Pink Axolotl ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-axolotl'
  const body = capsule({ diameterCm: 6, lengthCm: 12, gauge: GAUGE, label: 'Body' })
  const gill = cylinder({ diameterCm: 1, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'External gill (make 6)' })
  const leg = capsule({ diameterCm: 1.5, lengthCm: 4, gauge: GAUGE, label: 'Leg (make 4)' })

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

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A pink axolotl made from a capsule body, six feathery cylinder gills on the head, and four short capsule legs. The gills are worked in a slightly darker pink or magenta using a '), gt('colour-change', 'colour change'), t(' and left open at the top to give a ruffled look.')),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Begin with a `), gt('magic-ring', 'magic ring'), t(' at the tail end and '), gt('amigurumi-increase', 'increase'), t(' to the full body width. Work straight for the mid-section then decrease to the head end. Stuff using '), gt('stuffing-and-closing', 'stuffing and closing'), t('.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('External gills (make 6)'),
    p(t(`Rounds: ${gill.totalRounds} per gill. Start each with a `), gt('magic-ring', 'magic ring'), t(' and work straight. Switch to a darker pink using a '), gt('colour-change', 'colour change'), t(' at the top few rounds. Leave the top edge open and unravelled slightly for a frilly effect. Do not stuff.')),
    ...gill.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Legs (make 4)'),
    p(t(`Rounds: ${leg.totalRounds} per leg. Work each leg in pale pink. Stuff lightly and leave the base open to sew to the body underside.`)),
    ...leg.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach three gills to each side of the head end of the body, fanning them outward. Sew the four legs to the underside. Add safety eyes to the head end. The flat face can be embroidered with a wide smile in contrast yarn.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps the body seam-free.')),
    p(t('Estimated yarn: body ' + body.yarnRequiredGrams + ' g, each gill ' + gill.yarnRequiredGrams + ' g, each leg ' + leg.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Axolotl', subtitle: '', excerpt: 'A pink axolotl with a capsule body, six feathery cylinder gills, and four short legs. One of the most distinctive and popular amigurumi subjects right now.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['axolotl amigurumi', 'crochet axolotl', 'axolotl plush', 'salamander amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A119 ── Small Round Quokka ────────────────────────────────────────────────
{
  const slug = 'amigurumi-quokka'
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
  ]

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A small round quokka worked in warm brown dk yarn. Just two main pieces, a sphere head and an oval body, make this a perfect beginner project. The quokka\'s famous smile is embroidered in a curved line, and the small round ears sit on top of the head.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' each round to the equator. Decrease to the neck and stuff firmly with '), gt('stuffing-and-closing', 'stuffing and closing'), t(' before the final round.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval body and stuff well before closing. The body is compact so the quokka sits in a neat upright pose.`)),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the body. Add two small round ears to the head top. Insert safety eyes level with the equator. Embroider the characteristic quokka smile in a gentle upward curve. Sew four small capsule legs to the body base if desired.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' throughout keeps both pieces seam-free and quick to work.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Quokka', subtitle: '', excerpt: 'A small round quokka with a sphere head and oval body in warm brown dk yarn. Two pieces, one very happy face. A great beginner project.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['quokka amigurumi', 'crochet quokka', 'happy quokka toy', 'smiling quokka'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 11 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

// ── A120 ── Brown Echidna ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-echidna'
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 5, gauge: GAUGE, label: 'Beak' })

  const techniqueSlugs = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'working-in-the-round', 'stuffing-and-closing', 'surface-crochet']
  const criticalTechniques = ['magic-ring', 'amigurumi-increase', 'amigurumi-decrease', 'surface-crochet']
  const glossaryTerms = [
    { termSlug: 'magic-ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight centre.' },
    { termSlug: 'amigurumi-increase', definition: 'Two double crochet worked into the same stitch to widen a round.' },
    { termSlug: 'amigurumi-decrease', definition: 'Two stitches crocheted together to narrow a round.' },
    { termSlug: 'working-in-the-round', definition: 'Crocheting in a continuous spiral without turning.' },
    { termSlug: 'stuffing-and-closing', definition: 'Filling a piece with toy stuffing then drawing the final stitches tight.' },
    { termSlug: 'surface-crochet', definition: 'Working slip stitches through the surface of a finished piece to add texture or detail.' },
  ]

  const bodyContent: object[] = [
    h2('About this pattern'),
    p(t('A brown echidna with a sphere head, an oval body covered in spike texture, and a narrow cone beak. The spines on the body are worked using '), gt('surface-crochet', 'surface crochet'), t(' in cream or pale yarn after the main body is stuffed and closed.')),
    h2('Head'),
    p(t(`Rounds: ${head.totalRounds}. Start with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' to the equator. Decrease toward the beak end. Stuff firmly with '), gt('stuffing-and-closing', 'stuffing and closing'), t(' before closing.')),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    p(t(`Rounds: ${body.totalRounds}. Work the oval in brown yarn. Stuff well before closing. After stuffing and closing, work the spike texture using `), gt('surface-crochet', 'surface crochet'), t(' in rows across the top half of the body.')),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Beak'),
    p(t(`Rounds: ${beak.totalRounds}. Start at the tip of the beak with a `), gt('magic-ring', 'magic ring'), t(' and '), gt('amigurumi-increase', 'increase'), t(' outward to the base. Do not stuff; leave the base open to sew onto the head.')),
    ...beak.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Spike texture'),
    p(t('Using cream or pale yarn and a smaller hook, insert the hook through a stitch on the body surface and pull up a loop. Work a chain of four stitches, then slip-stitch back to the surface. Repeat at each stitch across the upper body using '), gt('surface-crochet', 'surface crochet'), t(' technique. Space the rows 0.5 cm apart.')),
    h2('Assembly'),
    p(t('Attach the beak to the head front at a slight downward angle. Join the head to the body. Add four short capsule legs to the underside. Insert safety eyes on the head above the beak.')),
    p(gt('working-in-the-round', 'Working in the round'), t(' keeps the head and body seam-free before the spike details are added.')),
    p(t('Estimated yarn: head ' + head.yarnRequiredGrams + ' g, body ' + body.yarnRequiredGrams + ' g, beak ' + beak.yarnRequiredGrams + ' g, plus approx. 15 g for spike texture.')),
  ]

  savePattern(slug, {
    slug, title: 'Amigurumi Echidna', subtitle: '', excerpt: 'A brown echidna with a sphere head, spike-textured oval body, and a narrow cone beak. The surface-crochet spine technique gives this one real character.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED', sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['echidna amigurumi', 'crochet echidna', 'spiny anteater toy', 'echidna plush'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 15 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS, body: bodyContent,
  })
}

console.log('Batch 12 complete.')
