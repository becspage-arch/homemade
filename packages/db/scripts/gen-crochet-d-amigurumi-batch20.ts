/**
 * Generator: D-Amigurumi Batch 20 -- A191-A200 Bears and Herd Animals
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch20.ts
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

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

// ── A191 ── Teddy Bear ────────────────────────────────────────────────────────
const teddyHead = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
const teddyBody = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
const teddyArm = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Arm' })
const teddyLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const teddyEar = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Ear' })
const teddyTotal = teddyHead.yarnRequiredGrams + teddyBody.yarnRequiredGrams + teddyArm.yarnRequiredGrams * 2 + teddyLeg.yarnRequiredGrams * 2 + teddyEar.yarnRequiredGrams * 2

// ── A192 ── Panda Bear ────────────────────────────────────────────────────────
const pandaHead = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
const pandaBody = oval({ longAxisCm: 11, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
const pandaArm = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Arm' })
const pandaEyePatch = oval({ longAxisCm: 4, shortAxisCm: 3, gauge: GAUGE, label: 'Eye patch' })
const pandaEar = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Ear' })
const pandaTotal = pandaHead.yarnRequiredGrams + pandaBody.yarnRequiredGrams + pandaArm.yarnRequiredGrams * 2 + pandaEyePatch.yarnRequiredGrams * 2 + pandaEar.yarnRequiredGrams * 2

// ── A193 ── Brown Bear ────────────────────────────────────────────────────────
const brownBearHead = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Head' })
const brownBearBody = oval({ longAxisCm: 14, shortAxisCm: 10, gauge: GAUGE, label: 'Body' })
const brownBearLeg = capsule({ diameterCm: 4, lengthCm: 6, gauge: GAUGE, label: 'Leg' })
const brownBearMuzzle = cone({ baseDiameterCm: 5, heightCm: 3, gauge: GAUGE, label: 'Muzzle' })
const brownBearEar = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'Ear' })
const brownBearTotal = brownBearHead.yarnRequiredGrams + brownBearBody.yarnRequiredGrams + brownBearLeg.yarnRequiredGrams * 4 + brownBearMuzzle.yarnRequiredGrams + brownBearEar.yarnRequiredGrams * 2

// ── A194 ── Sun Bear ──────────────────────────────────────────────────────────
const sunBearHead = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
const sunBearBody = oval({ longAxisCm: 11, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
const sunBearArm = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Arm' })
const sunBearEar = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Ear' })
const sunBearPatchGrams = 4 // chest patch embroidery
const sunBearTotal = sunBearHead.yarnRequiredGrams + sunBearBody.yarnRequiredGrams + sunBearArm.yarnRequiredGrams * 2 + sunBearEar.yarnRequiredGrams * 2 + sunBearPatchGrams

// ── A195 ── Grizzly Bear ──────────────────────────────────────────────────────
const grizzlyHead = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Head' })
const grizzlyBody = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const grizzlyArm = capsule({ diameterCm: 3.5, lengthCm: 8, gauge: GAUGE, label: 'Arm' })
const grizzlyLeg = capsule({ diameterCm: 4, lengthCm: 6, gauge: GAUGE, label: 'Leg' })
const grizzlyEar = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Ear' })
const grizzlyTotal = grizzlyHead.yarnRequiredGrams + grizzlyBody.yarnRequiredGrams + grizzlyArm.yarnRequiredGrams * 2 + grizzlyLeg.yarnRequiredGrams * 2 + grizzlyEar.yarnRequiredGrams * 2

// ── A196 ── Highland Cow ──────────────────────────────────────────────────────
const highlandHead = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
const highlandBody = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const highlandLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const highlandHorn = cone({ baseDiameterCm: 1.5, heightCm: 4, gauge: GAUGE, label: 'Horn' })
const highlandFringeGrams = 8 // yarn fringe for forehead
const highlandTotal = highlandHead.yarnRequiredGrams + highlandBody.yarnRequiredGrams + highlandLeg.yarnRequiredGrams * 4 + highlandHorn.yarnRequiredGrams * 2 + highlandFringeGrams

// ── A197 ── Alpaca ────────────────────────────────────────────────────────────
const alpacaHead = oval({ longAxisCm: 7, shortAxisCm: 5, gauge: GAUGE, label: 'Head' })
const alpacaNeck = cylinder({ diameterCm: 4, heightCm: 6, gauge: GAUGE, label: 'Neck' })
const alpacaBody = oval({ longAxisCm: 12, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const alpacaLeg = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const alpacaTopKnotGrams = 5 // fluffy top knot yarn
const alpacaTotal = alpacaHead.yarnRequiredGrams + alpacaNeck.yarnRequiredGrams + alpacaBody.yarnRequiredGrams + alpacaLeg.yarnRequiredGrams * 4 + alpacaTopKnotGrams

// ── A198 ── Llama ─────────────────────────────────────────────────────────────
const llamaHead = oval({ longAxisCm: 8, shortAxisCm: 5, gauge: GAUGE, label: 'Head' })
const llamaNeck = cylinder({ diameterCm: 4, heightCm: 8, gauge: GAUGE, label: 'Neck' })
const llamaBody = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
const llamaLeg = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg' })
const llamaBlanketGrams = 6 // saddle blanket embellishment
const llamaTotal = llamaHead.yarnRequiredGrams + llamaNeck.yarnRequiredGrams + llamaBody.yarnRequiredGrams + llamaLeg.yarnRequiredGrams * 4 + llamaBlanketGrams

// ── A199 ── Bison ─────────────────────────────────────────────────────────────
const bisonHead = oval({ longAxisCm: 11, shortAxisCm: 9, gauge: GAUGE, label: 'Head' })
const bisonBody = oval({ longAxisCm: 15, shortAxisCm: 11, gauge: GAUGE, label: 'Humped body' })
const bisonLeg = capsule({ diameterCm: 3.5, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const bisonManeGrams = 10 // yarn mane for forehead and neck
const bisonTotal = bisonHead.yarnRequiredGrams + bisonBody.yarnRequiredGrams + bisonLeg.yarnRequiredGrams * 4 + bisonManeGrams

// ── A200 ── Yak ───────────────────────────────────────────────────────────────
const yakHead = oval({ longAxisCm: 10, shortAxisCm: 8, gauge: GAUGE, label: 'Head' })
const yakBody = oval({ longAxisCm: 14, shortAxisCm: 11, gauge: GAUGE, label: 'Body' })
const yakLeg = capsule({ diameterCm: 3.5, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const yakHorn = cone({ baseDiameterCm: 1.5, heightCm: 5, gauge: GAUGE, label: 'Horn' })
const yakShaggyCostGrams = 15 // long loop yarn for shaggy coat
const yakTotal = yakHead.yarnRequiredGrams + yakBody.yarnRequiredGrams + yakLeg.yarnRequiredGrams * 4 + yakHorn.yarnRequiredGrams * 2 + yakShaggyCostGrams

const PATTERNS = [
// ── A191 ── Teddy Bear ────────────────────────────────────────────────────────
{
  slug: 'amigurumi-teddy-bear',
  title: 'Amigurumi teddy bear',
  subtitle: 'A classic brown teddy bear in sitting pose worked in DK yarn.',
  excerpt: 'A classic amigurumi teddy bear in brown DK yarn. Sphere head, oval body, capsule arms and legs, and small round ears. Approx. 15 cm tall seated.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet teddy bear amigurumi', 'classic teddy bear crochet pattern', 'brown bear toy crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-tb', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-tb', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for the decrease rounds that close each piece.' },
    { slug: 'stuffing-tb', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-tb', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-tb', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 15 cm tall seated.',
  sourceNotes: 'Classic amigurumi teddy bear. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This is a beginner-friendly bear built from simple shapes. The sphere head sits on an oval body. All pieces start with a '), gt('magic-ring-tb', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${teddyTotal} g of brown DK and a small amount of tan or cream for the inner ears and muzzle. Stuff each piece with `), gt('stuffing-tb', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${teddyHead.finishedDimensionsCm.width} cm sphere (${teddyHead.totalRounds} rounds). Fit `), gt('safety-eyes-tb', 'safety eyes'), t(` at round ${Math.round(teddyHead.totalRounds * 0.45)} before closing. Sew a small tan oval below the eyes for the muzzle.`)),
      h2('Body'),
      p(t(`Work a ${teddyBody.finishedDimensionsCm.width} cm by ${teddyBody.finishedDimensionsCm.height ?? 7} cm oval body (${teddyBody.totalRounds} rounds). Stuff firmly. Use `), gt('dc2tog-tb', 'dc2tog'), t(' rounds to close.')),
      h2('Arms (make 2)'),
      p(t(`Work a ${teddyArm.finishedDimensionsCm.width} cm diameter by ${teddyArm.finishedDimensionsCm.height ?? 6} cm capsule (${teddyArm.totalRounds} rounds). Stuff lightly so the arms can be positioned.`)),
      h2('Legs (make 2)'),
      p(t(`Work a ${teddyLeg.finishedDimensionsCm.width} cm diameter by ${teddyLeg.finishedDimensionsCm.height ?? 5} cm capsule (${teddyLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${teddyEar.finishedDimensionsCm.width} cm sphere for each ear. Flatten slightly and sew to the top sides of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-tb', 'ladder stitch'), t('. Attach arms to the upper body sides. Pin legs to the body base at a forward angle before sewing.')),
      h2('What to try next'),
      p(t('The amigurumi panda bear uses the same structure with black and white yarn and added oval eye patches.')),
    ],
  },
},
// ── A192 ── Panda Bear ────────────────────────────────────────────────────────
{
  slug: 'amigurumi-panda-bear',
  title: 'Amigurumi panda bear',
  subtitle: 'A black and white panda with oval eye patches in DK yarn.',
  excerpt: 'An amigurumi panda bear in black and white DK yarn. Sphere head with oval eye patches, oval body, capsule arms. Approx. 18 cm tall seated.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet panda amigurumi', 'panda bear crochet pattern', 'black white panda toy crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-pb', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'colour-change-pb', term: 'Colour change', definition: 'Switching yarn mid-round by pulling the new colour through the last step of the stitch before the colour change.' },
    { slug: 'dc2tog-pb', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'safety-eyes-pb', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit inside the eye patch before sewing the patch to the head.' },
    { slug: 'ladder-stitch-pb', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 18 cm tall seated.',
  sourceNotes: 'Amigurumi panda bear is a popular toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The panda is mostly white with black arms, ears, and eye patches. Work the head in white and attach black oval eye patches before the final assembly. All pieces start with a '), gt('magic-ring-pb', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${pandaTotal} g total: roughly 60 % white and 40 % black DK. Use a `), gt('colour-change-pb', 'colour change'), t(' where the body colour switches from white to black on the arm joins.')),
      h2('Head'),
      p(t(`Work a ${pandaHead.finishedDimensionsCm.width} cm white sphere (${pandaHead.totalRounds} rounds). Fit `), gt('safety-eyes-pb', 'safety eyes'), t(` at round ${Math.round(pandaHead.totalRounds * 0.45)}.`)),
      h2('Eye patches (make 2)'),
      p(t(`Work a ${pandaEyePatch.finishedDimensionsCm.width} cm by ${pandaEyePatch.finishedDimensionsCm.height ?? 3} cm black oval flat. Sew one patch around each eye, overlapping slightly. Use `), gt('dc2tog-pb', 'dc2tog'), t(' to close the oval ends.')),
      h2('Body'),
      p(t(`Work a ${pandaBody.finishedDimensionsCm.width} cm by ${pandaBody.finishedDimensionsCm.height ?? 8} cm white oval body (${pandaBody.totalRounds} rounds). Stuff firmly.`)),
      h2('Arms (make 2)'),
      p(t(`Work a ${pandaArm.finishedDimensionsCm.width} cm diameter by ${pandaArm.finishedDimensionsCm.height ?? 6} cm black capsule (${pandaArm.totalRounds} rounds). Stuff lightly.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${pandaEar.finishedDimensionsCm.width} cm black sphere for each ear. Flatten and sew to the top sides of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-pb', 'ladder stitch'), t('. Attach arms to the upper body sides. Sew ears to the head crown.')),
      h2('What to try next'),
      p(t('The amigurumi brown bear uses a muzzle cone for a more realistic face shape.')),
    ],
  },
},
// ── A193 ── Brown Bear ────────────────────────────────────────────────────────
{
  slug: 'amigurumi-brown-bear',
  title: 'Amigurumi brown bear',
  subtitle: 'A large sitting brown bear with a cone muzzle in DK yarn.',
  excerpt: 'A large amigurumi brown bear in brown DK yarn. Sphere head, oval body, four capsule legs, and a rounded cone muzzle. Approx. 22 cm tall seated.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet brown bear amigurumi', 'large bear toy crochet', 'sitting bear crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-bb', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-bb', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-bb', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-bb', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-bb', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 22 cm tall seated.',
  sourceNotes: 'Amigurumi brown bear is a classic toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This bear is larger than the classic teddy and uses four legs for a seated pose. The cone muzzle gives the face more definition. All pieces start with a '), gt('magic-ring-bb', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${brownBearTotal} g of medium brown DK and a small amount of tan for the muzzle. Stuff each piece with `), gt('stuffing-bb', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${brownBearHead.finishedDimensionsCm.width} cm sphere (${brownBearHead.totalRounds} rounds). Fit `), gt('safety-eyes-bb', 'safety eyes'), t(` at round ${Math.round(brownBearHead.totalRounds * 0.45)}.`)),
      h2('Muzzle'),
      p(t(`Work a ${brownBearMuzzle.finishedDimensionsCm.width ?? 5} cm base cone over ${brownBearMuzzle.finishedDimensionsCm.height ?? 3} cm (${brownBearMuzzle.totalRounds} rounds) in tan yarn. Use `), gt('dc2tog-bb', 'dc2tog'), t(' to flatten the tip slightly. Stuff lightly and sew below the eyes.')),
      h2('Body'),
      p(t(`Work a ${brownBearBody.finishedDimensionsCm.width} cm by ${brownBearBody.finishedDimensionsCm.height ?? 10} cm oval body (${brownBearBody.totalRounds} rounds). Stuff firmly.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${brownBearLeg.finishedDimensionsCm.width} cm diameter by ${brownBearLeg.finishedDimensionsCm.height ?? 6} cm capsule (${brownBearLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${brownBearEar.finishedDimensionsCm.width} cm sphere for each ear. Flatten and sew to the top sides of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-bb', 'ladder stitch'), t('. Attach front legs to the lower body front and back legs to the body base. Pin before sewing to check the bear sits level.')),
      h2('What to try next'),
      p(t('The amigurumi grizzly bear uses the same structure with raised arms for a standing pose.')),
    ],
  },
},
// ── A194 ── Sun Bear ──────────────────────────────────────────────────────────
{
  slug: 'amigurumi-sun-bear',
  title: 'Amigurumi sun bear',
  subtitle: 'A small black sun bear with a cream chest patch in DK yarn.',
  excerpt: 'An amigurumi sun bear in black DK yarn with a cream chest patch. Sphere head, oval body, capsule arms, and a small round muzzle. Approx. 16 cm tall seated.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet sun bear amigurumi', 'sun bear toy crochet', 'small black bear crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-sb', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-sb', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-sb', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-sb', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-sb', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 16 cm tall seated.',
  sourceNotes: 'Amigurumi sun bear. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The sun bear is one of the smaller bears. The cream chest patch is worked in flat crochet and sewn onto the finished body. All pieces start with a '), gt('magic-ring-sb', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${sunBearTotal} g total: black DK for the main body and a small amount of cream for the chest patch and muzzle. Stuff each piece with `), gt('stuffing-sb', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${sunBearHead.finishedDimensionsCm.width} cm black sphere (${sunBearHead.totalRounds} rounds). Fit `), gt('safety-eyes-sb', 'safety eyes'), t(` at round ${Math.round(sunBearHead.totalRounds * 0.45)}. Sew a small cream oval below the eyes for the muzzle.`)),
      h2('Body'),
      p(t(`Work a ${sunBearBody.finishedDimensionsCm.width} cm by ${sunBearBody.finishedDimensionsCm.height ?? 8} cm black oval body (${sunBearBody.totalRounds} rounds). Stuff firmly. Use `), gt('dc2tog-sb', 'dc2tog'), t(' rounds to close.')),
      h2('Chest patch'),
      p(t('Crochet a small cream oval flat (approx. 5 cm long). Sew to the body front centred on the upper chest.')),
      h2('Arms (make 2)'),
      p(t(`Work a ${sunBearArm.finishedDimensionsCm.width} cm diameter by ${sunBearArm.finishedDimensionsCm.height ?? 6} cm black capsule (${sunBearArm.totalRounds} rounds). Stuff lightly.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${sunBearEar.finishedDimensionsCm.width} cm black sphere for each ear. Flatten and sew to the top sides of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-sb', 'ladder stitch'), t('. Attach arms to the upper body sides.')),
      h2('What to try next'),
      p(t('The amigurumi panda bear uses the same basic structure with bold black and white contrast patches.')),
    ],
  },
},
// ── A195 ── Grizzly Bear ──────────────────────────────────────────────────────
{
  slug: 'amigurumi-grizzly-bear',
  title: 'Amigurumi grizzly bear',
  subtitle: 'A standing grizzly bear with raised arms in DK yarn.',
  excerpt: 'An amigurumi grizzly bear in brown DK yarn posed with arms raised. Sphere head and oval body with raised capsule arms. Approx. 24 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet grizzly bear amigurumi', 'standing bear crochet pattern', 'grizzly toy crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-gb', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-gb', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-gb', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-gb', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-gb', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 24 cm tall with arms raised.',
  sourceNotes: 'Amigurumi grizzly bear in standing pose. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The grizzly is posed standing upright with arms raised above the body. The legs need firm stuffing so the bear balances on a flat surface. All pieces start with a '), gt('magic-ring-gb', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${grizzlyTotal} g of dark brown DK and a small amount of tan for the muzzle. Stuff each piece with `), gt('stuffing-gb', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${grizzlyHead.finishedDimensionsCm.width} cm sphere (${grizzlyHead.totalRounds} rounds). Fit `), gt('safety-eyes-gb', 'safety eyes'), t(` at round ${Math.round(grizzlyHead.totalRounds * 0.45)}.`)),
      h2('Body'),
      p(t(`Work a ${grizzlyBody.finishedDimensionsCm.width} cm by ${grizzlyBody.finishedDimensionsCm.height ?? 9} cm oval body (${grizzlyBody.totalRounds} rounds). Stuff very firmly so the body supports the standing pose.`)),
      h2('Arms (make 2)'),
      p(t(`Work a ${grizzlyArm.finishedDimensionsCm.width} cm diameter by ${grizzlyArm.finishedDimensionsCm.height ?? 8} cm capsule (${grizzlyArm.totalRounds} rounds). Stuff moderately. Sew to the upper body sides angled upward at 45 degrees. Use `), gt('dc2tog-gb', 'dc2tog'), t(' to close the paw end.')),
      h2('Legs (make 2)'),
      p(t(`Work a ${grizzlyLeg.finishedDimensionsCm.width} cm diameter by ${grizzlyLeg.finishedDimensionsCm.height ?? 6} cm capsule (${grizzlyLeg.totalRounds} rounds). Stuff firmly. Sew to the body base pointing downward.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${grizzlyEar.finishedDimensionsCm.width} cm sphere for each ear. Flatten and sew to the top sides of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-gb', 'ladder stitch'), t('. Sew legs to the body base first and check the bear stands before attaching the head. Angle the raised arms upward when sewing.')),
      h2('What to try next'),
      p(t('The amigurumi bison uses a large oval head on a humped body for a different large animal shape.')),
    ],
  },
},
// ── A196 ── Highland Cow ──────────────────────────────────────────────────────
{
  slug: 'amigurumi-highland-cow',
  title: 'Amigurumi highland cow',
  subtitle: 'A fluffy orange highland cow with yarn fringe and cone horns in DK yarn.',
  excerpt: 'An amigurumi highland cow in orange DK yarn with yarn fringe on the forehead. Sphere head and oval body with four capsule legs and two cone horns. Approx. 18 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-loop-stitch'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-loop-stitch'],
  aliases: ['crochet highland cow amigurumi', 'fluffy cow toy crochet', 'highland cow crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-hc', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'loop-stitch-hc', term: 'Loop stitch', definition: 'A decorative stitch where a yarn loop is held at the back of the work as the stitch is completed. Used here to create the highland cow fringe.' },
    { slug: 'dc2tog-hc', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'safety-eyes-hc', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-hc', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 18 cm tall. Fringe hangs approx. 3 cm over the forehead.',
  sourceNotes: 'Amigurumi highland cow. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The signature feature of this highland cow is the shaggy forehead fringe. Work 2 rounds of '), gt('loop-stitch-hc', 'loop stitch'), t(' across the forehead section of the head before the final decrease rounds. All pieces start with a '), gt('magic-ring-hc', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${highlandTotal} g of orange DK and a small amount of cream for the muzzle. Use a second strand of longer-fibre orange or caramel yarn for the fringe loops.`)),
      h2('Head'),
      p(t(`Work a ${highlandHead.finishedDimensionsCm.width} cm sphere (${highlandHead.totalRounds} rounds). Work the `, ), gt('loop-stitch-hc', 'loop stitch'), t(` fringe across rounds ${Math.round(highlandHead.totalRounds * 0.3)} to ${Math.round(highlandHead.totalRounds * 0.5)} at the forehead position. Fit `), gt('safety-eyes-hc', 'safety eyes'), t(` just below the fringe area at round ${Math.round(highlandHead.totalRounds * 0.55)}. Use `), gt('dc2tog-hc', 'dc2tog'), t(' for the final closing rounds.')),
      h2('Body'),
      p(t(`Work a ${highlandBody.finishedDimensionsCm.width} cm by ${highlandBody.finishedDimensionsCm.height ?? 9} cm oval body (${highlandBody.totalRounds} rounds). Stuff firmly.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${highlandLeg.finishedDimensionsCm.width} cm diameter by ${highlandLeg.finishedDimensionsCm.height ?? 5} cm capsule (${highlandLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Horns (make 2)'),
      p(t(`Work a ${highlandHorn.finishedDimensionsCm.width ?? 1.5} cm base cone over ${highlandHorn.finishedDimensionsCm.height ?? 4} cm (${highlandHorn.totalRounds} rounds). Stuff lightly. Sew to the head above and behind the ears, angling outward.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-hc', 'ladder stitch'), t('. Pin legs to the body base and check the cow stands flat before sewing. Attach horns last.')),
      h2('What to try next'),
      p(t('The amigurumi yak uses a similar shaggy yarn technique across the whole body for a heavier fleece look.')),
    ],
  },
},
// ── A197 ── Alpaca ────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-alpaca',
  title: 'Amigurumi alpaca',
  subtitle: 'A fluffy white alpaca with a cylinder neck and top-knot in DK yarn.',
  excerpt: 'An amigurumi alpaca in white DK yarn. Oval head with a yarn top-knot on a cylinder neck and oval body. Approx. 20 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet alpaca amigurumi', 'alpaca toy crochet', 'fluffy alpaca crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-al', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-al', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-al', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-al', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-al', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 20 cm tall from foot to top of head.',
  sourceNotes: 'Amigurumi alpaca. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The alpaca has a long neck between the body and the small oval head. A bunch of yarn loops sewn to the head crown creates the top-knot. All pieces start with a '), gt('magic-ring-al', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${alpacaTotal} g of white or cream DK. Add a small amount of a contrasting colour for the top-knot and nose. Stuff each piece with `), gt('stuffing-al', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${alpacaHead.finishedDimensionsCm.width} cm by ${alpacaHead.finishedDimensionsCm.height ?? 5} cm oval head (${alpacaHead.totalRounds} rounds). Fit `), gt('safety-eyes-al', 'safety eyes'), t(` at round ${Math.round(alpacaHead.totalRounds * 0.45)}.`)),
      h2('Top-knot'),
      p(t('Cut 10 lengths of yarn approx. 8 cm each. Fold each in half and loop through the head crown. Trim to a pom-pom shape.')),
      h2('Neck'),
      p(t(`Work a ${alpacaNeck.finishedDimensionsCm.width} cm diameter by ${alpacaNeck.finishedDimensionsCm.height ?? 6} cm cylinder (${alpacaNeck.totalRounds} rounds). Stuff firmly so the neck holds the head upright.`)),
      h2('Body'),
      p(t(`Work a ${alpacaBody.finishedDimensionsCm.width} cm by ${alpacaBody.finishedDimensionsCm.height ?? 9} cm oval body (${alpacaBody.totalRounds} rounds). Stuff firmly. Use `), gt('dc2tog-al', 'dc2tog'), t(' rounds to close.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${alpacaLeg.finishedDimensionsCm.width} cm diameter by ${alpacaLeg.finishedDimensionsCm.height ?? 5} cm capsule per leg (${alpacaLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Assembly'),
      p(t('Sew body to neck base using '), gt('ladder-stitch-al', 'ladder stitch'), t('. Sew head to neck top. Pin legs to the body base and check the alpaca stands level before sewing.')),
      h2('What to try next'),
      p(t('The amigurumi llama uses the same structure with a longer neck and a saddle blanket sewn across the back.')),
    ],
  },
},
// ── A198 ── Llama ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-llama',
  title: 'Amigurumi llama',
  subtitle: 'A brown llama with a long neck and colourful saddle blanket in DK yarn.',
  excerpt: 'An amigurumi llama in brown DK yarn with a woven-look saddle blanket. Oval head on a long cylinder neck with oval body and capsule legs. Approx. 22 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet llama amigurumi', 'llama toy crochet', 'llama with blanket crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-ll', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'colour-change-ll', term: 'Colour change', definition: 'Switching yarn mid-round by pulling the new colour through the last step of the stitch before the colour change.' },
    { slug: 'dc2tog-ll', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'safety-eyes-ll', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-ll', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 22 cm tall from foot to top of head.',
  sourceNotes: 'Amigurumi llama. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The llama uses a longer neck than the alpaca. The saddle blanket is a small rectangle crocheted separately using '), gt('colour-change-ll', 'colour change'), t(' stripes and sewn across the body top. All pieces start with a '), gt('magic-ring-ll', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${llamaTotal} g total: brown DK for the main body and small amounts of red, blue, and orange for the saddle blanket stripes. Stuff each piece with firm stuffing before closing.`)),
      h2('Head'),
      p(t(`Work a ${llamaHead.finishedDimensionsCm.width} cm by ${llamaHead.finishedDimensionsCm.height ?? 5} cm oval head (${llamaHead.totalRounds} rounds). Fit `), gt('safety-eyes-ll', 'safety eyes'), t(` at round ${Math.round(llamaHead.totalRounds * 0.45)}. Use `), gt('dc2tog-ll', 'dc2tog'), t(' to close.')),
      h2('Neck'),
      p(t(`Work a ${llamaNeck.finishedDimensionsCm.width} cm diameter by ${llamaNeck.finishedDimensionsCm.height ?? 8} cm cylinder (${llamaNeck.totalRounds} rounds). Stuff firmly so the neck holds the head upright.`)),
      h2('Body'),
      p(t(`Work a ${llamaBody.finishedDimensionsCm.width} cm by ${llamaBody.finishedDimensionsCm.height ?? 9} cm oval body (${llamaBody.totalRounds} rounds). Stuff firmly.`)),
      h2('Saddle blanket'),
      p(t('Work a 7 cm by 5 cm rectangle in rows. Work 2-row stripes in alternating colours. Cast off and sew across the body top with the edges tucked slightly under.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${llamaLeg.finishedDimensionsCm.width} cm diameter by ${llamaLeg.finishedDimensionsCm.height ?? 6} cm capsule per leg (${llamaLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Assembly'),
      p(t('Sew body to neck base using '), gt('ladder-stitch-ll', 'ladder stitch'), t('. Sew head to neck top. Pin legs to the body base and check the llama stands level before sewing. Add the saddle blanket last.')),
      h2('What to try next'),
      p(t('The amigurumi alpaca uses a shorter neck and a yarn top-knot on the head crown.')),
    ],
  },
},
// ── A199 ── Bison ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-bison',
  title: 'Amigurumi bison',
  subtitle: 'A brown bison with a large oval head and yarn mane in DK yarn.',
  excerpt: 'An amigurumi bison in dark brown DK yarn. Large oval head with yarn mane, humped oval body, and four capsule legs. Approx. 20 cm long.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet bison amigurumi', 'bison toy crochet', 'american buffalo crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-bi', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-bi', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-bi', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-bi', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-bi', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 20 cm long from nose to tail.',
  sourceNotes: 'Amigurumi bison. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The bison has a proportionally large head and a humped back. The body oval is worked with the widest point toward the front shoulders to suggest the hump. The yarn mane is added after assembly. All pieces start with a '), gt('magic-ring-bi', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${bisonTotal} g of dark brown DK. Reserve 10 g for the yarn mane on the forehead and neck. Stuff each piece with `), gt('stuffing-bi', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${bisonHead.finishedDimensionsCm.width} cm by ${bisonHead.finishedDimensionsCm.height ?? 9} cm large oval head (${bisonHead.totalRounds} rounds). Fit `), gt('safety-eyes-bi', 'safety eyes'), t(` at round ${Math.round(bisonHead.totalRounds * 0.45)}.`)),
      h2('Mane'),
      p(t('Cut 50 lengths of dark brown yarn approx. 6 cm each. Fold each in half and loop through the head crown and the top of the neck join. Trim level to a dense mat.')),
      h2('Body'),
      p(t(`Work a ${bisonBody.finishedDimensionsCm.width} cm by ${bisonBody.finishedDimensionsCm.height ?? 11} cm oval body (${bisonBody.totalRounds} rounds). Stuff very firmly. Use `), gt('dc2tog-bi', 'dc2tog'), t(' rounds to close both ends.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${bisonLeg.finishedDimensionsCm.width} cm diameter by ${bisonLeg.finishedDimensionsCm.height ?? 5} cm capsule per leg (${bisonLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Assembly'),
      p(t('Sew head to the front end of the body using '), gt('ladder-stitch-bi', 'ladder stitch'), t('. The head should angle slightly downward to match a grazing pose. Pin legs to the body base and check all four touch a flat surface before sewing.')),
      h2('What to try next'),
      p(t('The amigurumi yak uses a similar large head with longer shaggy coat yarn across the whole body.')),
    ],
  },
},
// ── A200 ── Yak ───────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-yak',
  title: 'Amigurumi yak',
  subtitle: 'A shaggy dark yak with loop-stitch coat and cone horns in DK yarn.',
  excerpt: 'An amigurumi yak in dark brown DK yarn with a shaggy loop-stitch coat. Oval head and body with four capsule legs and two cone horns. Approx. 20 cm long.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-loop-stitch'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-loop-stitch'],
  aliases: ['crochet yak amigurumi', 'shaggy yak toy crochet', 'yak with horns crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-yk', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'loop-stitch-yk', term: 'Loop stitch', definition: 'A decorative stitch where a yarn loop is held at the back of the work as the stitch is completed. Used here for the shaggy yak coat.' },
    { slug: 'dc2tog-yk', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'safety-eyes-yk', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-yk', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 20 cm long from nose to tail. Shaggy coat adds 2 cm of texture all over.',
  sourceNotes: 'Amigurumi yak. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The yak coat is created by working '), gt('loop-stitch-yk', 'loop stitch'), t(' on every alternate round across both the body and the lower head. Cut the loops after completion to create a shaggy fleece texture. All pieces start with a '), gt('magic-ring-yk', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${yakTotal} g of dark brown DK. Use a second long-fibre yarn in a matching shade for the loop stitches if you want a shaggier texture. Stuff each piece with firm stuffing before closing.`)),
      h2('Head'),
      p(t(`Work a ${yakHead.finishedDimensionsCm.width} cm by ${yakHead.finishedDimensionsCm.height ?? 8} cm oval head (${yakHead.totalRounds} rounds). Work `, ), gt('loop-stitch-yk', 'loop stitches'), t(` on every other round from round 3 to round ${Math.round(yakHead.totalRounds * 0.6)}. Fit `), gt('safety-eyes-yk', 'safety eyes'), t(` at round ${Math.round(yakHead.totalRounds * 0.45)}.`)),
      h2('Horns (make 2)'),
      p(t(`Work a ${yakHorn.finishedDimensionsCm.width ?? 1.5} cm base cone over ${yakHorn.finishedDimensionsCm.height ?? 5} cm (${yakHorn.totalRounds} rounds). Use `), gt('dc2tog-yk', 'dc2tog'), t(' to taper to a point. Stuff lightly. Sew to the head above the ears, curving outward and slightly forward.')),
      h2('Body'),
      p(t(`Work a ${yakBody.finishedDimensionsCm.width} cm by ${yakBody.finishedDimensionsCm.height ?? 11} cm oval body (${yakBody.totalRounds} rounds). Work loop stitches on every other round across the full body. Stuff firmly.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${yakLeg.finishedDimensionsCm.width} cm diameter by ${yakLeg.finishedDimensionsCm.height ?? 5} cm capsule per leg (${yakLeg.totalRounds} rounds). Work loop stitches on the upper half of each leg. Stuff firmly.`)),
      h2('Assembly'),
      p(t('Sew head to the front end of the body using '), gt('ladder-stitch-yk', 'ladder stitch'), t('. Pin legs to the body base and check the yak stands level before sewing. Cut all loops after assembly for the finished shaggy look.')),
      h2('What to try next'),
      p(t('The amigurumi bison uses a similar large oval head without the shaggy coat technique.')),
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
    subCategorySlug: 'amigurumi',
    difficulty: pat.difficulty,
    sourceType: 'SYNTHESISED',
    sourceNotes: pat.sourceNotes,
    techniqueSlugs: pat.techniqueSlugs,
    criticalTechniques: pat.criticalTechniques,
    aliases: pat.aliases,
    glossaryTerms: pat.glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: pat.finishedSizeText,
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nDone: ${PATTERNS.length} patterns`)
