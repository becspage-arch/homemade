/**
 * Generator: D-Amigurumi Batch 8 -- Fantasy and Mythical Creatures A71-A80
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch8.ts
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

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

// ── A71: Unicorn ──────────────────────────────────────────────────────────────
const unicornHead = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
const unicornBody = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
const unicornLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const unicornHorn = cone({ baseDiameterCm: 2, heightCm: 5, gauge: GAUGE, label: 'Horn' })
const unicornEar = cone({ baseDiameterCm: 2, heightCm: 3, gauge: GAUGE, label: 'Ear' })

const unicornTotalGrams =
  unicornHead.yarnRequiredGrams +
  unicornBody.yarnRequiredGrams +
  unicornLeg.yarnRequiredGrams * 4 +
  unicornHorn.yarnRequiredGrams +
  unicornEar.yarnRequiredGrams * 2

const a71 = {
  slug: 'amigurumi-unicorn',
  title: 'Amigurumi unicorn',
  subtitle: '',
  excerpt: 'A white unicorn in dk yarn with a spiral horn, pointed ears, and a looped-yarn mane and tail. Four capsule legs keep it upright. Finished height is around 20 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Unicorn amigurumi are a staple fantasy creature in the amigurumi genre.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'yarn-mane'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet unicorn toy', 'amigurumi unicorn pattern', 'stuffed unicorn crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a71', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round. You work the first round of stitches into the loop, then pull the tail to close the centre hole. It avoids the gap left by a starting chain.' },
    { slug: 'invisible-decrease-a71', term: 'Invisible decrease', definition: 'A dc2tog worked by inserting the hook under the front loop only of two consecutive stitches. The result sits flatter than a standard decrease and leaves no visible bump on the right side of the fabric.' },
    { slug: 'yarn-mane-a71', term: 'Yarn mane', definition: 'Lengths of yarn cut and looped through stitches along the top of the head and neck with a lark\'s head knot. The loops are left as-is for a loopy mane or cut and brushed out for a fluffy effect.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 20 cm tall when standing.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'yarn-mane'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work each piece in dk yarn using a 3.5 mm hook and a '), gt('magic-ring-a71', 'magic ring'), t(' start. Stuff each piece firmly before closing.')),
      h2('Head'),
      p(t(`${unicornHead.totalRounds}-round sphere, ${unicornHead.finishedDimensionsCm.width} cm diameter. Fit safety eyes between rounds 8 and 9, about 3 sts apart. Stuff firmly and close.`)),
      h2('Body'),
      p(t(`Oval body, ${unicornBody.finishedDimensionsCm.width} cm long and ${unicornBody.finishedDimensionsCm.height ?? unicornBody.finishedDimensionsCm.width} cm wide. Stuff firmly and leave a tail for sewing.`)),
      h2('Legs (make 4)'),
      p(t(`Capsule leg, ${unicornLeg.finishedDimensionsCm.width} cm wide and ${unicornLeg.finishedDimensionsCm.height ?? 5} cm long. Use a contrasting colour for the bottom 3 rounds to suggest hooves.`)),
      h2('Horn'),
      p(t(`Cone horn, ${unicornHorn.finishedDimensionsCm.width} cm base and ${unicornHorn.finishedDimensionsCm.height ?? 5} cm tall. Work in a pale gold or yellow yarn. Do not stuff.`)),
      h2('Ears (make 2)'),
      p(t(`Small cone, ${unicornEar.finishedDimensionsCm.width} cm base and ${unicornEar.finishedDimensionsCm.height ?? 3} cm tall. Work in white. Do not stuff.`)),
      h2('Assembly'),
      p(t('Pin and sew the head to the top front of the body. Attach the four legs to the underside so the unicorn stands level. Sew the horn to the centre front of the head above the eyes. Pin the ears on either side of the horn base and sew in place.')),
      h2('Mane and tail'),
      p(t('Cut lengths of pink, lilac, or mint yarn, each about 15 cm long. Fold each length in half and pull the loop through a stitch using a crochet hook, then pass the tails through the loop to form a '), gt('yarn-mane-a71', 'yarn mane'), t('. Work mane stitches from the base of the horn back along the neck to the body join. Repeat for the tail at the back of the body. Trim to an even length.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a71', 'invisible decrease'), t(' throughout for a smooth surface. Weave in all ends. Embroider nostrils in pink satin stitch just above the muzzle if desired.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(unicornTotalGrams * 1.1)} g white dk yarn, small amounts of gold and pink yarn for horn and mane. Pair of 10 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
      h2('What to make next'),
      p(t('The amigurumi dragon uses a similar body construction with added wings and cone spines along the back.')),
    ],
  },
}

// ── A72: Dragon ───────────────────────────────────────────────────────────────
const dragonHead = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
const dragonBody = oval({ longAxisCm: 14, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const dragonLeg = capsule({ diameterCm: 3.5, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const dragonWing = oval({ longAxisCm: 10, shortAxisCm: 6, gauge: GAUGE, label: 'Wing' })
const dragonSpine = cone({ baseDiameterCm: 2, heightCm: 3, gauge: GAUGE, label: 'Spine' })

const dragonTotalGrams =
  dragonHead.yarnRequiredGrams +
  dragonBody.yarnRequiredGrams +
  dragonLeg.yarnRequiredGrams * 4 +
  dragonWing.yarnRequiredGrams * 2 +
  dragonSpine.yarnRequiredGrams * 5

const a72 = {
  slug: 'amigurumi-dragon',
  title: 'Amigurumi dragon',
  subtitle: '',
  excerpt: 'A green dragon in dk yarn with an oval body, four capsule legs, a pair of flat oval wings, and a row of cone spines along the back. Finished length is around 24 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Dragon amigurumi are a popular intermediate fantasy toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'surface-attach'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet dragon toy', 'amigurumi dragon pattern', 'stuffed dragon crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a72', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round. You work the first round of stitches into the loop, then pull the tail to close the centre hole.' },
    { slug: 'invisible-decrease-a72', term: 'Invisible decrease', definition: 'A dc2tog worked by inserting the hook under the front loop only of two consecutive stitches. Sits flatter than a standard decrease.' },
    { slug: 'surface-attach-a72', term: 'Surface attach', definition: 'Joining a piece by pinning it to the surface of the main body and sewing through both layers with a tapestry needle. Used for flat pieces such as wings and spines that lie against the body rather than protruding from a socket.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 24 cm from nose to tail tip.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'surface-attach'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work each piece using a '), gt('magic-ring-a72', 'magic ring'), t(' start in green dk yarn on a 3.5 mm hook.')),
      h2('Head'),
      p(t(`${dragonHead.totalRounds}-round sphere, ${dragonHead.finishedDimensionsCm.width} cm diameter. Fit 12 mm safety eyes between rounds 9 and 10. Embroider two small nostrils in black. Stuff firmly.`)),
      h2('Body'),
      p(t(`Oval body, ${dragonBody.finishedDimensionsCm.width} cm long. Stuff firmly.`)),
      h2('Legs (make 4)'),
      p(t(`Capsule, ${dragonLeg.finishedDimensionsCm.width} cm wide and ${dragonLeg.finishedDimensionsCm.height ?? 5} cm long. Stuff lightly.`)),
      h2('Wings (make 2)'),
      p(t(`Flat oval, ${dragonWing.finishedDimensionsCm.width} cm long and ${dragonWing.finishedDimensionsCm.height ?? 6} cm wide. Work in a slightly darker green or yellow-green. Do not stuff. Leave a long sewing tail.`)),
      h2('Spines (make 5)'),
      p(t(`Small cone, ${dragonSpine.finishedDimensionsCm.width} cm base and ${dragonSpine.finishedDimensionsCm.height ?? 3} cm tall. Work in yellow-green. Do not stuff.`)),
      h2('Assembly'),
      p(t('Sew the head to the front of the body. Attach all four legs to the underside. '), gt('surface-attach-a72', 'Surface-attach'), t(' the wings to each side of the body, angled slightly upward. Sew the five spines in a line along the top of the body from the neck join to the tail end.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a72', 'invisible decrease'), t(' throughout. Weave in all ends. The dragon can stand on all four legs or be posed with wings spread.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(dragonTotalGrams * 1.1)} g green dk yarn, small amounts of yellow-green for wings and spines. 12 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A73: Mermaid ──────────────────────────────────────────────────────────────
const mermaidHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const mermaidBody = capsule({ diameterCm: 6, lengthCm: 10, gauge: GAUGE, label: 'Body' })
const mermaidTail = cone({ baseDiameterCm: 6, heightCm: 10, gauge: GAUGE, label: 'Tail' })
const mermaidFluke = oval({ longAxisCm: 8, shortAxisCm: 4, gauge: GAUGE, label: 'Fluke' })

const mermaidTotalGrams =
  mermaidHead.yarnRequiredGrams +
  mermaidBody.yarnRequiredGrams +
  mermaidTail.yarnRequiredGrams +
  mermaidFluke.yarnRequiredGrams

const a73 = {
  slug: 'amigurumi-mermaid',
  title: 'Amigurumi mermaid',
  subtitle: '',
  excerpt: 'A mermaid amigurumi with a skin-tone capsule body, a teal cone tail, and a flat oval fluke. A looped-yarn fringe becomes the flowing hair. Finished height is around 22 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Mermaid amigurumi are a popular intermediate fantasy toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'colour-change'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet mermaid toy', 'amigurumi mermaid pattern', 'stuffed mermaid crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a73', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round. Working the first round into this loop keeps the centre hole closed.' },
    { slug: 'invisible-decrease-a73', term: 'Invisible decrease', definition: 'A dc2tog worked through the front loops only of two stitches. Gives a smoother surface than a standard decrease.' },
    { slug: 'colour-change-a73', term: 'Colour change', definition: 'Switching from one yarn to another mid-round or at the start of a round. For amigurumi, the cleanest join is to complete the last stitch of the final round in the old colour, then draw through the new colour to finish.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 22 cm from top of head to tip of tail.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'colour-change'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work the head and body in a skin-tone dk yarn and the tail pieces in teal or turquoise. Use a '), gt('magic-ring-a73', 'magic ring'), t(' to start each piece.')),
      h2('Head'),
      p(t(`${mermaidHead.totalRounds}-round sphere, ${mermaidHead.finishedDimensionsCm.width} cm diameter. Fit 10 mm safety eyes between rounds 7 and 8. Stuff firmly.`)),
      h2('Body'),
      p(t(`Capsule, ${mermaidBody.finishedDimensionsCm.width} cm wide and ${mermaidBody.finishedDimensionsCm.height ?? 10} cm long. Use a `, ), gt('colour-change-a73', 'colour change'), t(' to switch to teal after the first 5 cm to suggest a shell top. Stuff firmly.')),
      h2('Tail'),
      p(t(`Cone, ${mermaidTail.finishedDimensionsCm.width} cm base and ${mermaidTail.finishedDimensionsCm.height ?? 10} cm tall in teal. Stuff lightly to hold shape.`)),
      h2('Fluke'),
      p(t(`Flat oval, ${mermaidFluke.finishedDimensionsCm.width} cm long and ${mermaidFluke.finishedDimensionsCm.height ?? 4} cm wide in teal. Work two flukes and sew them together wrong sides facing. Do not stuff.`)),
      h2('Assembly'),
      p(t('Sew the head to the top of the body. Join the wide end of the tail cone to the base of the body. Sew the fluke to the narrow tip of the tail, angled horizontally like a real fish tail.')),
      h2('Hair'),
      p(t('Cut lengths of yarn in a contrasting colour, each about 18 cm. Loop each length through the top and back of the head using a lark\'s head knot to build up the hair. Trim to an even length or leave uneven for a flowing look.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a73', 'invisible decrease'), t(' throughout for smooth shaping. Embroider a small smiling mouth in a dark thread. Weave in all ends.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(mermaidTotalGrams * 1.1)} g in skin-tone dk yarn, ${Math.round(mermaidTotalGrams * 0.7)} g teal dk yarn. Small amount of contrast yarn for hair. 10 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A74: Fairy ────────────────────────────────────────────────────────────────
const fairyHead = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
const fairyBody = capsule({ diameterCm: 5, lengthCm: 8, gauge: GAUGE, label: 'Body' })
const fairyWing = oval({ longAxisCm: 7, shortAxisCm: 4, gauge: GAUGE, label: 'Wing' })
const fairyArm = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Arm' })
const fairyLeg = capsule({ diameterCm: 2, lengthCm: 6, gauge: GAUGE, label: 'Leg' })
const fairyHat = cone({ baseDiameterCm: 5, heightCm: 6, gauge: GAUGE, label: 'Hat' })

const fairyTotalGrams =
  fairyHead.yarnRequiredGrams +
  fairyBody.yarnRequiredGrams +
  fairyWing.yarnRequiredGrams * 2 +
  fairyArm.yarnRequiredGrams * 2 +
  fairyLeg.yarnRequiredGrams * 2 +
  fairyHat.yarnRequiredGrams

const a74 = {
  slug: 'amigurumi-fairy',
  title: 'Amigurumi fairy',
  subtitle: '',
  excerpt: 'A fairy figure in dk yarn with a pointed cone hat, two flat oval wings, capsule arms and legs, and a flowing yarn fringe skirt. Finished height around 20 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Fairy amigurumi figures are a popular intermediate fantasy toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'fringe-trim'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet fairy toy', 'amigurumi fairy pattern', 'stuffed fairy crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a74', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round. Pull the tail to close the centre hole after working the first round.' },
    { slug: 'invisible-decrease-a74', term: 'Invisible decrease', definition: 'A dc2tog through the front loops only of two consecutive stitches. Produces a neater surface than a standard decrease.' },
    { slug: 'fringe-trim-a74', term: 'Fringe trim', definition: 'Short lengths of yarn knotted through a row of stitches to create a decorative fringe. For the fairy\'s skirt, loop short pieces of sparkle or contrast yarn through the stitches at the lower body to suggest a layered skirt.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 20 cm tall.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'fringe-trim'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work the head and body in a skin-tone or main colour dk yarn. Use a '), gt('magic-ring-a74', 'magic ring'), t(' to start each piece.')),
      h2('Head'),
      p(t(`${fairyHead.totalRounds}-round sphere, ${fairyHead.finishedDimensionsCm.width} cm diameter. Fit 9 mm safety eyes between rounds 6 and 7. Stuff firmly.`)),
      h2('Body'),
      p(t(`Capsule, ${fairyBody.finishedDimensionsCm.width} cm wide and ${fairyBody.finishedDimensionsCm.height ?? 8} cm long. Stuff firmly.`)),
      h2('Arms (make 2)'),
      p(t(`Capsule, ${fairyArm.finishedDimensionsCm.width} cm wide and ${fairyArm.finishedDimensionsCm.height ?? 5} cm long. Stuff lightly.`)),
      h2('Legs (make 2)'),
      p(t(`Capsule, ${fairyLeg.finishedDimensionsCm.width} cm wide and ${fairyLeg.finishedDimensionsCm.height ?? 6} cm long. Work the foot end in a contrasting colour for shoes. Stuff lightly.`)),
      h2('Wings (make 2)'),
      p(t(`Flat oval, ${fairyWing.finishedDimensionsCm.width} cm long and ${fairyWing.finishedDimensionsCm.height ?? 4} cm wide. Work in a pale iridescent or white yarn. Do not stuff.`)),
      h2('Hat'),
      p(t(`Cone hat, ${fairyHat.finishedDimensionsCm.width} cm base and ${fairyHat.finishedDimensionsCm.height ?? 6} cm tall. Work in the same colour as the body dress section. Do not stuff.`)),
      h2('Assembly'),
      p(t('Sew the head to the body. Attach the arms to the upper sides of the body. Sew the legs to the base of the body. Pin the wings to the back of the body and sew flat using a '), gt('invisible-decrease-a74', 'invisible decrease'), t(' technique for joins. Position the hat on the head and sew around the brim.')),
      h2('Skirt fringe'),
      p(t('Cut short lengths of sparkle or contrast yarn, each about 6 cm. Using a crochet hook, pull each piece through a stitch at the lower third of the body to create a '), gt('fringe-trim-a74', 'fringe trim'), t(' skirt. Trim the fringe to an even length.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(fairyTotalGrams * 1.1)} g skin-tone dk yarn, small amounts of white or iridescent yarn for wings. 9 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A75: Gnome ────────────────────────────────────────────────────────────────
const gnomeHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const gnomeBody = cylinder({ diameterCm: 7, heightCm: 9, gauge: GAUGE, closeBothEnds: true, label: 'Body' })
const gnomeHat = cone({ baseDiameterCm: 7, heightCm: 12, gauge: GAUGE, label: 'Hat' })
const gnomeArm = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Arm' })

const gnomeTotalGrams =
  gnomeHead.yarnRequiredGrams +
  gnomeBody.yarnRequiredGrams +
  gnomeHat.yarnRequiredGrams +
  gnomeArm.yarnRequiredGrams * 2

const a75 = {
  slug: 'amigurumi-gnome',
  title: 'Amigurumi garden gnome',
  subtitle: '',
  excerpt: 'A garden gnome in dk yarn with a large red pointed hat, a round sphere head with a yarn beard, and a cylinder body in blue or green. Finished height around 22 cm.',
  type: 'PATTERN',
  difficulty: 'BEGINNER',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Garden gnome amigurumi are a popular beginner novelty toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet gnome toy', 'amigurumi gnome pattern', 'stuffed gnome crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a75', term: 'Magic ring', definition: 'An adjustable loop used to start rounds. Pull the tail tight after the first round to close the centre hole.' },
    { slug: 'invisible-decrease-a75', term: 'Invisible decrease', definition: 'A dc2tog through the front loops only. Produces a tighter, neater shaping row than a standard decrease.' },
    { slug: 'yarn-beard-a75', term: 'Yarn beard', definition: 'Loops of white or cream yarn attached to the lower face of the head using lark\'s head knots. The loops can be left looped for a curly beard or trimmed flat for a neat one.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 22 cm tall including hat.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work the body and hat first as they are the largest pieces. Use a '), gt('magic-ring-a75', 'magic ring'), t(' to start every piece.')),
      h2('Body'),
      p(t(`Cylinder, ${gnomeBody.finishedDimensionsCm.width} cm diameter and ${gnomeBody.finishedDimensionsCm.height ?? 9} cm tall in blue or green dk yarn. Work both ends closed. Stuff firmly.`)),
      h2('Head'),
      p(t(`${gnomeHead.totalRounds}-round sphere, ${gnomeHead.finishedDimensionsCm.width} cm diameter. The gnome has no visible eyes under the hat brim; skip safety eyes if preferred. Stuff firmly.`)),
      h2('Hat'),
      p(t(`Tall cone, ${gnomeHat.finishedDimensionsCm.width} cm base and ${gnomeHat.finishedDimensionsCm.height ?? 12} cm in red dk yarn. Do not stuff. The hat sits over the top of the head and is sewn around its base.`)),
      h2('Arms (make 2)'),
      p(t(`Capsule, ${gnomeArm.finishedDimensionsCm.width} cm wide and ${gnomeArm.finishedDimensionsCm.height ?? 5} cm long. Stuff lightly.`)),
      h2('Assembly'),
      p(t('Sew the head to the top of the body. Place the hat over the top two-thirds of the head and sew it in place around the brim. Sew the arms to either side of the upper body.')),
      h2('Beard'),
      p(t('Cut lengths of white or cream yarn, each about 8 cm. Attach them using lark\'s head knots to the lower face of the head below the hat brim to form a '), gt('yarn-beard-a75', 'yarn beard'), t('. Trim to shape.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a75', 'invisible decrease'), t(' for all shaping. Weave in all ends. Add a small buckle or button to the hat brim if desired.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(gnomeTotalGrams * 1.1)} g in body colour dk yarn, ${Math.round(gnomeHat.yarnRequiredGrams * 1.1)} g red for the hat, small amount of white for the beard. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A76: Phoenix ──────────────────────────────────────────────────────────────
const phoenixHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const phoenixBody = oval({ longAxisCm: 12, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
const phoenixWing = capsule({ diameterCm: 4, lengthCm: 10, gauge: GAUGE, label: 'Wing' })
const phoenixTailFeather = cone({ baseDiameterCm: 2, heightCm: 8, gauge: GAUGE, label: 'Tail feather' })
const phoenixCrest = cone({ baseDiameterCm: 2, heightCm: 5, gauge: GAUGE, label: 'Crest' })

const phoenixTotalGrams =
  phoenixHead.yarnRequiredGrams +
  phoenixBody.yarnRequiredGrams +
  phoenixWing.yarnRequiredGrams * 2 +
  phoenixTailFeather.yarnRequiredGrams * 5 +
  phoenixCrest.yarnRequiredGrams * 3

const a76 = {
  slug: 'amigurumi-phoenix',
  title: 'Amigurumi phoenix',
  subtitle: '',
  excerpt: 'A red and orange phoenix bird in dk yarn with an oval body, two capsule wings, five cone tail feathers, and a head crest. Finished wingspan around 28 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Phoenix amigurumi birds are a popular intermediate fantasy toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'colour-stripe'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet phoenix toy', 'amigurumi phoenix bird', 'stuffed phoenix crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a76', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round. Pull the tail tight to close the centre gap after the first round.' },
    { slug: 'invisible-decrease-a76', term: 'Invisible decrease', definition: 'A dc2tog through front loops only. Gives a smooth shaping row with no visible bump.' },
    { slug: 'colour-stripe-a76', term: 'Colour stripe', definition: 'Alternating rounds in two or more colours worked in a gradient sequence, here from deep red at the body core out to bright orange and yellow at the wing and tail tips. The stripe sequence gives the phoenix its flame-like colouring.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 28 cm wingspan; body 12 cm long.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'colour-stripe'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work the body and wings using a '), gt('magic-ring-a76', 'magic ring'), t(' start. The '), gt('colour-stripe-a76', 'colour stripe'), t(' sequence runs from red at the base of each piece to orange at the tips.')),
      h2('Head'),
      p(t(`${phoenixHead.totalRounds}-round sphere, ${phoenixHead.finishedDimensionsCm.width} cm diameter in red. Fit 10 mm safety eyes between rounds 7 and 8. Stuff firmly.`)),
      h2('Body'),
      p(t(`Oval body, ${phoenixBody.finishedDimensionsCm.width} cm long in red. Stuff firmly.`)),
      h2('Wings (make 2)'),
      p(t(`Capsule, ${phoenixWing.finishedDimensionsCm.width} cm wide and ${phoenixWing.finishedDimensionsCm.height ?? 10} cm long. Work 6 rounds red, then switch to orange for the remaining rounds. Stuff lightly.`)),
      h2('Tail feathers (make 5)'),
      p(t(`Cone, ${phoenixTailFeather.finishedDimensionsCm.width} cm base and ${phoenixTailFeather.finishedDimensionsCm.height ?? 8} cm tall. Work 4 rounds red, then switch to orange, then yellow for the final 3 rounds. Do not stuff.`)),
      h2('Head crest (make 3)'),
      p(t(`Small cone, ${phoenixCrest.finishedDimensionsCm.width} cm base and ${phoenixCrest.finishedDimensionsCm.height ?? 5} cm tall in orange or yellow. Do not stuff.`)),
      h2('Assembly'),
      p(t('Sew the head to the body. Attach both wings to the sides of the body, angled upward. Fan the five tail feathers at the back of the body and sew them in a semicircle. Attach the three crest feathers to the top of the head.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a76', 'invisible decrease'), t(' throughout. Weave in all ends. Embroider a small beak in yellow satin stitch below the eyes.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(phoenixTotalGrams * 1.1)} g split across red, orange, and yellow dk yarn. 10 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A77: Griffin ──────────────────────────────────────────────────────────────
const griffinHead = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
const griffinBody = oval({ longAxisCm: 14, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const griffinFrontLeg = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Front leg' })
const griffinBackLeg = capsule({ diameterCm: 3.5, lengthCm: 6, gauge: GAUGE, label: 'Back leg' })
const griffinWing = oval({ longAxisCm: 12, shortAxisCm: 7, gauge: GAUGE, label: 'Wing' })
const griffinTail = capsule({ diameterCm: 2.5, lengthCm: 8, gauge: GAUGE, label: 'Tail' })

const griffinTotalGrams =
  griffinHead.yarnRequiredGrams +
  griffinBody.yarnRequiredGrams +
  griffinFrontLeg.yarnRequiredGrams * 2 +
  griffinBackLeg.yarnRequiredGrams * 2 +
  griffinWing.yarnRequiredGrams * 2 +
  griffinTail.yarnRequiredGrams

const a77 = {
  slug: 'amigurumi-griffin',
  title: 'Amigurumi griffin',
  subtitle: '',
  excerpt: 'A lion-eagle hybrid in dk yarn with a feathered sphere head, an oval body, eagle-style oval wings, two capsule front legs with eagle talons, and two capsule back lion legs. Finished length around 26 cm.',
  type: 'PATTERN',
  difficulty: 'ADVANCED',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Griffin amigurumi are a popular advanced fantasy creature project combining bird and lion elements.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'embroidery-detail', 'two-colour-body'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet griffin toy', 'amigurumi griffin pattern', 'stuffed griffin crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a77', term: 'Magic ring', definition: 'An adjustable loop that starts a round. Close the centre gap by pulling the tail after the first round is complete.' },
    { slug: 'invisible-decrease-a77', term: 'Invisible decrease', definition: 'A dc2tog through the front loops only. Produces a smooth decrease row without a visible bump.' },
    { slug: 'two-colour-body-a77', term: 'Two-colour body', definition: 'Working the front half of the body in one colour and the back half in another to suggest the eagle-front and lion-back anatomy of the griffin. The colour join runs around the body at roughly mid-point.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 26 cm from beak to tail tip.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'embroidery-detail', 'two-colour-body'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('The griffin combines eagle and lion elements. Work the front half in golden-brown (eagle) and the back half in tawny-brown (lion) using a '), gt('two-colour-body-a77', 'two-colour body'), t(' join at the midpoint. Start each piece with a '), gt('magic-ring-a77', 'magic ring'), t('.')),
      h2('Head'),
      p(t(`${griffinHead.totalRounds}-round sphere, ${griffinHead.finishedDimensionsCm.width} cm in golden-brown. Fit 12 mm safety eyes between rounds 9 and 10. Stuff firmly. Embroider a hooked beak in yellow satin stitch below the eyes.`)),
      h2('Body'),
      p(t(`Oval body, ${griffinBody.finishedDimensionsCm.width} cm long. Work the first 7 cm in golden-brown (eagle chest), then switch to tawny-brown for the lion haunches. Stuff firmly.`)),
      h2('Front legs with talons (make 2)'),
      p(t(`Capsule, ${griffinFrontLeg.finishedDimensionsCm.width} cm wide and ${griffinFrontLeg.finishedDimensionsCm.height ?? 6} cm long in golden-brown. At the foot end, work 3 short chain loops and slip-stitch them back to suggest talons. Stuff lightly.`)),
      h2('Back legs (make 2)'),
      p(t(`Capsule, ${griffinBackLeg.finishedDimensionsCm.width} cm wide and ${griffinBackLeg.finishedDimensionsCm.height ?? 6} cm long in tawny-brown. Stuff lightly.`)),
      h2('Wings (make 2)'),
      p(t(`Flat oval, ${griffinWing.finishedDimensionsCm.width} cm long and ${griffinWing.finishedDimensionsCm.height ?? 7} cm wide in golden-brown. Do not stuff. Embroider V-shaped lines to suggest flight feathers.`)),
      h2('Tail'),
      p(t(`Capsule, ${griffinTail.finishedDimensionsCm.width} cm wide and ${griffinTail.finishedDimensionsCm.height ?? 8} cm long in tawny-brown. Stuff lightly. Add a yarn pompom at the tip.`)),
      h2('Assembly'),
      p(t('Sew the head to the eagle front of the body. Attach the front legs under the eagle chest section and the back legs under the lion haunches. Pin and sew the wings to the upper back. Sew the tail to the rear of the body.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a77', 'invisible decrease'), t(' throughout. Weave in all ends.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(griffinTotalGrams * 1.1)} g across golden-brown and tawny-brown dk yarn. 12 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A78: Werewolf ─────────────────────────────────────────────────────────────
const werewolfHead = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
const werewolfBody = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const werewolfArm = capsule({ diameterCm: 3.5, lengthCm: 8, gauge: GAUGE, label: 'Arm' })
const werewolfLeg = capsule({ diameterCm: 4, lengthCm: 7, gauge: GAUGE, label: 'Leg' })
const werewolfEar = cone({ baseDiameterCm: 3, heightCm: 4, gauge: GAUGE, label: 'Ear' })
const werewolfTail = capsule({ diameterCm: 3, lengthCm: 9, gauge: GAUGE, label: 'Tail' })

const werewolfTotalGrams =
  werewolfHead.yarnRequiredGrams +
  werewolfBody.yarnRequiredGrams +
  werewolfArm.yarnRequiredGrams * 2 +
  werewolfLeg.yarnRequiredGrams * 2 +
  werewolfEar.yarnRequiredGrams * 2 +
  werewolfTail.yarnRequiredGrams

const a78 = {
  slug: 'amigurumi-werewolf',
  title: 'Amigurumi werewolf',
  subtitle: '',
  excerpt: 'A brown werewolf amigurumi in dk yarn with pointed cone ears, long capsule arms with claw detail, and a fluffy tail. Finished height around 24 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Werewolf amigurumi are a popular Halloween and fantasy toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'chain-claws'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet werewolf toy', 'amigurumi werewolf pattern', 'halloween crochet toy'],
  glossaryTerms: [
    { slug: 'magic-ring-a78', term: 'Magic ring', definition: 'An adjustable loop used to start working in the round. Pull the yarn tail to close the gap after the first round.' },
    { slug: 'invisible-decrease-a78', term: 'Invisible decrease', definition: 'A dc2tog through the front loops only, giving a smoother surface than a standard decrease.' },
    { slug: 'chain-claws-a78', term: 'Chain claws', definition: 'Short chains of 4 to 6 stitches worked at the end of a limb and slip-stitched back to the last round to form individual claw shapes. Each claw is a tiny loop pointing outward from the paw end.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 24 cm tall.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'chain-claws'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work all pieces in brown dk yarn. Use a '), gt('magic-ring-a78', 'magic ring'), t(' to start each piece.')),
      h2('Head'),
      p(t(`${werewolfHead.totalRounds}-round sphere, ${werewolfHead.finishedDimensionsCm.width} cm diameter. Fit 12 mm amber or yellow safety eyes between rounds 9 and 10. Embroider a snarling muzzle in black thread. Stuff firmly.`)),
      h2('Body'),
      p(t(`Oval body, ${werewolfBody.finishedDimensionsCm.width} cm long. Stuff firmly.`)),
      h2('Arms (make 2)'),
      p(t(`Capsule, ${werewolfArm.finishedDimensionsCm.width} cm wide and ${werewolfArm.finishedDimensionsCm.height ?? 8} cm long. At the paw end, work 4 `), gt('chain-claws-a78', 'chain claws'), t(' by chaining 5 and slip-stitching back to the last round, spacing evenly. Stuff lightly.')),
      h2('Legs (make 2)'),
      p(t(`Capsule, ${werewolfLeg.finishedDimensionsCm.width} cm wide and ${werewolfLeg.finishedDimensionsCm.height ?? 7} cm long. Work 3 chain claws at the foot end. Stuff lightly.`)),
      h2('Ears (make 2)'),
      p(t(`Cone, ${werewolfEar.finishedDimensionsCm.width} cm base and ${werewolfEar.finishedDimensionsCm.height ?? 4} cm tall. Do not stuff. Sew flat to the top of the head.`)),
      h2('Tail'),
      p(t(`Capsule, ${werewolfTail.finishedDimensionsCm.width} cm wide and ${werewolfTail.finishedDimensionsCm.height ?? 9} cm long. Stuff lightly. Brush the surface with a stiff-bristled brush for a fluffy texture.`)),
      h2('Assembly'),
      p(t('Sew the head to the top of the body. Attach the arms to the upper sides of the body. Sew the legs to the base so the werewolf stands or sits. Pin the ears to the top of the head and sew flat. Attach the tail to the back of the body.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a78', 'invisible decrease'), t(' throughout. Weave in all ends. Embroider fur-line marks in a darker brown thread along the chest if desired.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(werewolfTotalGrams * 1.1)} g brown dk yarn. 12 mm amber safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A79: Witch ────────────────────────────────────────────────────────────────
const witchHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const witchBody = cylinder({ diameterCm: 7, heightCm: 10, gauge: GAUGE, closeBothEnds: true, label: 'Body' })
const witchHat = cone({ baseDiameterCm: 7, heightCm: 10, gauge: GAUGE, label: 'Hat' })
const witchArm = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Arm' })
const witchBrim = cylinder({ diameterCm: 10, heightCm: 1, gauge: GAUGE, closeBothEnds: false, label: 'Hat brim' })

const witchTotalGrams =
  witchHead.yarnRequiredGrams +
  witchBody.yarnRequiredGrams +
  witchHat.yarnRequiredGrams +
  witchBrim.yarnRequiredGrams +
  witchArm.yarnRequiredGrams * 2

const a79 = {
  slug: 'amigurumi-witch',
  title: 'Amigurumi witch',
  subtitle: '',
  excerpt: 'A witch figure in dk yarn with a tall cone hat on a flat cylinder brim, a cylinder body in purple or black, and two capsule arms. A yarn hair fringe completes the look. Finished height around 24 cm.',
  type: 'PATTERN',
  difficulty: 'INTERMEDIATE',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Witch amigurumi figures are a popular Halloween and fantasy toy project.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'brim-join'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet witch toy', 'amigurumi witch pattern', 'halloween crochet witch'],
  glossaryTerms: [
    { slug: 'magic-ring-a79', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round. Pull the tail to close the centre hole after the first round.' },
    { slug: 'invisible-decrease-a79', term: 'Invisible decrease', definition: 'A dc2tog through the front loops only. Produces a clean shaping row with no visible bump on the right side.' },
    { slug: 'brim-join-a79', term: 'Brim join', definition: 'The technique of sewing or crocheting the flat brim of the hat to the base of the cone. The brim is worked as a flat circle wider than the cone base; the two pieces are then lined up and joined with whip stitches.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 24 cm tall including hat.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'brim-join'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work all pieces using a '), gt('magic-ring-a79', 'magic ring'), t(' start. The hat is a cone joined to a flat brim using a '), gt('brim-join-a79', 'brim join'), t('.')),
      h2('Head'),
      p(t(`${witchHead.totalRounds}-round sphere, ${witchHead.finishedDimensionsCm.width} cm diameter in skin-tone dk yarn. Fit 9 mm safety eyes between rounds 7 and 8. Stuff firmly.`)),
      h2('Body'),
      p(t(`Cylinder, ${witchBody.finishedDimensionsCm.width} cm diameter and ${witchBody.finishedDimensionsCm.height ?? 10} cm tall in purple or black dk yarn. Work both ends closed. Stuff firmly.`)),
      h2('Arms (make 2)'),
      p(t(`Capsule, ${witchArm.finishedDimensionsCm.width} cm wide and ${witchArm.finishedDimensionsCm.height ?? 6} cm long in skin-tone, with the lower 2 cm in purple or black for the sleeve. Stuff lightly.`)),
      h2('Hat cone'),
      p(t(`Tall cone, ${witchHat.finishedDimensionsCm.width} cm base and ${witchHat.finishedDimensionsCm.height ?? 10} cm tall in black dk yarn. Do not stuff.`)),
      h2('Hat brim'),
      p(t(`Flat circle, ${witchBrim.finishedDimensionsCm.width} cm diameter in black. Work as a flat granny circle: magic ring, 6 dc, increase to 12, 18, 24 until the circle is wide enough. Do not stuff. Sew the hat cone to the brim using whip stitch.`)),
      h2('Assembly'),
      p(t('Sew the head to the top of the body. Attach the arms to either side of the upper body. Place the finished hat on top of the head and sew the brim edge to the sides of the head to hold it in place.')),
      h2('Hair'),
      p(t('Cut lengths of black or grey yarn, each about 10 cm. Attach them using lark\'s head knots around the lower edge of the hat brim to frame the face. Trim to a ragged length.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a79', 'invisible decrease'), t(' throughout. Embroider a small wart or crooked nose in dark thread if desired. Weave in all ends.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(witchTotalGrams * 1.1)} g in purple and black dk yarn, small amount of skin-tone yarn for the head and arms. 9 mm safety eyes. Polyester stuffing. Tapestry needle.`)),
    ],
  },
}

// ── A80: Ghost ────────────────────────────────────────────────────────────────
const ghostTop = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head/top' })
const ghostBody = cylinder({ diameterCm: 8, heightCm: 10, gauge: GAUGE, closeBothEnds: false, label: 'Body' })

const ghostTotalGrams = ghostTop.yarnRequiredGrams + ghostBody.yarnRequiredGrams

const a80 = {
  slug: 'amigurumi-ghost',
  title: 'Amigurumi ghost',
  subtitle: '',
  excerpt: 'A simple white ghost in dk yarn with a sphere top, a tapered cylinder body with a wavy hem, and embroidered dot eyes. A beginner-friendly project. Finished height around 12 cm.',
  type: 'PATTERN',
  difficulty: 'BEGINNER',
  categorySlug: 'crochet',
  subCategorySlug: 'amigurumi',
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Ghost amigurumi are a classic beginner Halloween toy with minimal shaping.',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  aliases: ['crochet ghost toy', 'amigurumi ghost pattern', 'beginner halloween crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-a80', term: 'Magic ring', definition: 'An adjustable loop that starts a round. Pulling the tail closes the centre hole after the first round.' },
    { slug: 'invisible-decrease-a80', term: 'Invisible decrease', definition: 'A dc2tog through the front loops only. Gives a smooth decrease without a visible bump on the surface.' },
    { slug: 'wavy-hem-a80', term: 'Wavy hem', definition: 'A decorative lower edge created by working groups of tall stitches separated by short stitches in the final round. For the ghost, a simple sequence of one treble and one dc repeated around the last round creates the rippling hem that suggests a floating sheet.' },
  ],
  crochet: {
    primaryYarnWeightSlug: 'dk',
    primaryHookSlug: 'crochet-hook-3-5mm',
    gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
    finishedSizeText: 'Approximately 12 cm tall.',
    terminologyConvention: 'uk',
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch', 'crochet-dc2tog'],
    craftTechniqueTags: ['magic-ring', 'working-in-the-round', 'invisible-decrease'],
  },
  recipeTools: TOOLS,
  body: {
    type: 'doc', content: [
      p(t('Work the entire ghost in white dk yarn. Use a '), gt('magic-ring-a80', 'magic ring'), t(' to begin.')),
      h2('Top section'),
      p(t(`${ghostTop.totalRounds}-round sphere, ${ghostTop.finishedDimensionsCm.width} cm diameter. This forms the rounded head of the ghost. Do not stuff yet.`)),
      h2('Body'),
      p(t(`Continue below the sphere without fastening off. Work ${ghostBody.totalRounds} rounds straight at the equator stitch count to form the body tube, ${ghostBody.finishedDimensionsCm.height ?? 10} cm tall. Stuff the head section firmly and the body lightly as you go.`)),
      h2('Wavy hem'),
      p(t('Work the final round as a '), gt('wavy-hem-a80', 'wavy hem'), t(': [tr in next st, dc in next st] repeat around. Fasten off and weave in the end.')),
      h2('Finishing'),
      p(t('Use the '), gt('invisible-decrease-a80', 'invisible decrease'), t(' for any shaping at the top sphere. Embroider two round dot eyes in black satin stitch. Add a small open-mouth oval below if desired. Weave in all ends.')),
      h2('Materials needed'),
      p(t(`Approximately ${Math.round(ghostTotalGrams * 1.1)} g white dk yarn. Black embroidery thread or black safety eyes. Polyester stuffing. Tapestry needle.`)),
      h2('What to make next'),
      p(t('The amigurumi witch adds a tall hat, cylinder body, and capsule arms for a more complex Halloween figure.')),
    ],
  },
}

// ── Write outputs ─────────────────────────────────────────────────────────────
const PATTERNS = [a71, a72, a73, a74, a75, a76, a77, a78, a79, a80]

for (const pat of PATTERNS) {
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(pat, null, 2))
  console.log(`Written: ${pat.slug}.json`)
}

console.log(`\nDone. ${PATTERNS.length} patterns written to ${OUT}`)
