/**
 * Generator: D-Amigurumi Batch 4 -- A31-A40 Jungle and Tropical Animals
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch4.ts
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

// ── A31 ── Elephant ───────────────────────────────────────────────────────────
const elephantHead = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
const elephantBody = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
const elephantTrunk = capsule({ diameterCm: 2.5, lengthCm: 8, gauge: GAUGE, label: 'Trunk' })
const elephantLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const elephantEar = oval({ longAxisCm: 6, shortAxisCm: 4, gauge: GAUGE, label: 'Ear' })
const elephantTailGrams = 2
const elephantTotal = elephantHead.yarnRequiredGrams + elephantBody.yarnRequiredGrams + elephantTrunk.yarnRequiredGrams + elephantLeg.yarnRequiredGrams * 4 + elephantEar.yarnRequiredGrams * 2 + elephantTailGrams

// ── A32 ── Giraffe ────────────────────────────────────────────────────────────
const giraffeHead = oval({ longAxisCm: 7, shortAxisCm: 5, gauge: GAUGE, label: 'Head' })
const giraffeNeck = cylinder({ diameterCm: 4, heightCm: 10, gauge: GAUGE, label: 'Neck' })
const giraffeBody = cylinder({ diameterCm: 8, heightCm: 11, gauge: GAUGE, label: 'Body' })
const giraffeLeg = capsule({ diameterCm: 2.5, lengthCm: 8, gauge: GAUGE, label: 'Leg' })
const giraffeTailGrams = 2
const giraffeTotal = giraffeHead.yarnRequiredGrams + giraffeNeck.yarnRequiredGrams + giraffeBody.yarnRequiredGrams + giraffeLeg.yarnRequiredGrams * 4 + giraffeTailGrams

// ── A33 ── Monkey ─────────────────────────────────────────────────────────────
const monkeyHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const monkeyBody = pear({ maxDiameterCm: 8, topDiameterCm: 5, heightCm: 9, gauge: GAUGE, label: 'Body' })
const monkeyArm = capsule({ diameterCm: 2, lengthCm: 7, gauge: GAUGE, label: 'Arm' })
const monkeyLeg = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg' })
const monkeyTail = capsule({ diameterCm: 1.5, lengthCm: 10, gauge: GAUGE, label: 'Tail' })
const monkeyEar = sphere({ diameterCm: 2, gauge: GAUGE, label: 'Ear' })
const monkeyTotal = monkeyHead.yarnRequiredGrams + monkeyBody.yarnRequiredGrams + monkeyArm.yarnRequiredGrams * 2 + monkeyLeg.yarnRequiredGrams * 2 + monkeyTail.yarnRequiredGrams + monkeyEar.yarnRequiredGrams * 2

// ── A34 ── Lion ───────────────────────────────────────────────────────────────
const lionHead = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
const lionBody = oval({ longAxisCm: 11, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
const lionLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const lionTail = cone({ baseDiameterCm: 2, heightCm: 8, gauge: GAUGE, label: 'Tail' })
const lionManePad = 18 // grams for the mane loop ring
const lionTotal = lionHead.yarnRequiredGrams + lionBody.yarnRequiredGrams + lionLeg.yarnRequiredGrams * 4 + lionTail.yarnRequiredGrams + lionManePad

// ── A35 ── Zebra ──────────────────────────────────────────────────────────────
const zebraHead = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Head' })
const zebraBody = cylinder({ diameterCm: 8, heightCm: 10, gauge: GAUGE, label: 'Body' })
const zebraLeg = capsule({ diameterCm: 2.5, lengthCm: 7, gauge: GAUGE, label: 'Leg' })
const zebraEar = oval({ longAxisCm: 3, shortAxisCm: 2, gauge: GAUGE, label: 'Ear' })
const zebraManePad = 4
const zebraTotal = zebraHead.yarnRequiredGrams + zebraBody.yarnRequiredGrams + zebraLeg.yarnRequiredGrams * 4 + zebraEar.yarnRequiredGrams * 2 + zebraManePad

// ── A36 ── Parrot ─────────────────────────────────────────────────────────────
const parrotHead = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
const parrotBody = oval({ longAxisCm: 9, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
const parrotBeak = cone({ baseDiameterCm: 2, heightCm: 2.5, gauge: GAUGE, label: 'Beak' })
const parrotWing = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Wing' })
const parrotTailFeather = capsule({ diameterCm: 1.5, lengthCm: 5, gauge: GAUGE, label: 'Tail feather' })
const parrotTotal = parrotHead.yarnRequiredGrams + parrotBody.yarnRequiredGrams + parrotBeak.yarnRequiredGrams + parrotWing.yarnRequiredGrams * 2 + parrotTailFeather.yarnRequiredGrams * 3

// ── A37 ── Frog ───────────────────────────────────────────────────────────────
const frogHead = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
const frogBody = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Body' })
const frogLeg = capsule({ diameterCm: 2, lengthCm: 7, gauge: GAUGE, label: 'Leg' })
const frogArm = capsule({ diameterCm: 1.5, lengthCm: 5, gauge: GAUGE, label: 'Arm' })
const frogEyeBulge = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Eye bulge' })
const frogTotal = frogHead.yarnRequiredGrams + frogBody.yarnRequiredGrams + frogLeg.yarnRequiredGrams * 2 + frogArm.yarnRequiredGrams * 2 + frogEyeBulge.yarnRequiredGrams * 2

// ── A38 ── Chameleon ──────────────────────────────────────────────────────────
const chameleonHead = oval({ longAxisCm: 7, shortAxisCm: 5, gauge: GAUGE, label: 'Head' })
const chameleonBody = capsule({ diameterCm: 5, lengthCm: 10, gauge: GAUGE, label: 'Body' })
const chameleonLeg = capsule({ diameterCm: 1.5, lengthCm: 4, gauge: GAUGE, label: 'Leg' })
const chameleonTail = capsule({ diameterCm: 2, lengthCm: 9, gauge: GAUGE, label: 'Tail' })
const chameleonTotal = chameleonHead.yarnRequiredGrams + chameleonBody.yarnRequiredGrams + chameleonLeg.yarnRequiredGrams * 4 + chameleonTail.yarnRequiredGrams

// ── A39 ── Toucan ─────────────────────────────────────────────────────────────
const toucanHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const toucanBody = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
const toucanBeak = cone({ baseDiameterCm: 3.5, heightCm: 7, gauge: GAUGE, label: 'Beak' })
const toucanWing = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Wing' })
const toucanTotal = toucanHead.yarnRequiredGrams + toucanBody.yarnRequiredGrams + toucanBeak.yarnRequiredGrams + toucanWing.yarnRequiredGrams * 2

// ── A40 ── Sloth ──────────────────────────────────────────────────────────────
const slothHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const slothBody = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
const slothArm = capsule({ diameterCm: 2, lengthCm: 12, gauge: GAUGE, label: 'Arm' })
const slothLeg = capsule({ diameterCm: 2, lengthCm: 8, gauge: GAUGE, label: 'Leg' })
const slothTotal = slothHead.yarnRequiredGrams + slothBody.yarnRequiredGrams + slothArm.yarnRequiredGrams * 2 + slothLeg.yarnRequiredGrams * 2

const PATTERNS = [
// ── A31 ── Elephant ──────────────────────────────────────────────────────────
{
  slug: 'amigurumi-elephant',
  title: 'Amigurumi elephant',
  subtitle: 'A sitting grey elephant in DK yarn with a long curved trunk.',
  excerpt: 'A sitting grey amigurumi elephant crocheted in DK yarn. Sphere head, oval body, capsule trunk and legs, with large flat ears. Approx. 18 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet elephant amigurumi', 'elephant stuffed toy crochet', 'grey elephant crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-el', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-el', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for the decrease rounds that close each piece.' },
    { slug: 'stuffing-el', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-el', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-el', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 18 cm tall seated (excluding trunk). Trunk hangs 8 cm below the head.',
  sourceNotes: 'Amigurumi elephant is a classic plush toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This elephant is built from five piece types: a sphere head, an oval body, a capsule trunk, four capsule legs, and two flat oval ears. All pieces start with a '), gt('magic-ring-el', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${elephantTotal} g of grey DK and a small amount of white and black for the eyes. Stuff each piece with `, ), gt('stuffing-el', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${elephantHead.finishedDimensionsCm.width} cm sphere (${elephantHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-el', 'safety eyes'), t(` at round ${Math.round(elephantHead.totalRounds * 0.45)} before closing.`)),
      h2('Body'),
      p(t(`Work a ${elephantBody.finishedDimensionsCm.width} cm by ${elephantBody.finishedDimensionsCm.height ?? 8} cm oval body (${elephantBody.totalRounds} rounds).`)),
      h2('Trunk'),
      p(t(`Work a ${elephantTrunk.finishedDimensionsCm.width} cm diameter by ${elephantTrunk.finishedDimensionsCm.height ?? 8} cm capsule (${elephantTrunk.totalRounds} rounds). Leave open at the top end; sew the closed end down under the head.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${elephantLeg.finishedDimensionsCm.width} cm diameter by ${elephantLeg.finishedDimensionsCm.height ?? 5} cm capsule (${elephantLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${elephantEar.finishedDimensionsCm.width} cm by ${elephantEar.finishedDimensionsCm.height ?? 4} cm oval flat (no stuffing). Fold the straight edge slightly and sew to the side of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-el', 'ladder stitch'), t('. Attach trunk centred below the eyes. Pin front legs to the lower body front and hind legs to the rear before sewing to check symmetry. Use '), gt('dc2tog-el', 'dc2tog'), t(' closures on any gap that needs tightening.')),
      h2('What to try next'),
      p(t('The amigurumi giraffe uses the same capsule legs on a longer cylinder body.')),
    ],
  },
},
// ── A32 ── Giraffe ───────────────────────────────────────────────────────────
{
  slug: 'amigurumi-giraffe',
  title: 'Amigurumi giraffe',
  subtitle: 'A standing yellow and brown giraffe with a long cylinder neck.',
  excerpt: 'A standing amigurumi giraffe in yellow DK yarn with brown patch markings. The long cylinder neck and cylinder body are the centrepiece; four capsule legs hold it upright. Approx. 28 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet giraffe amigurumi', 'giraffe stuffed toy crochet', 'tall giraffe crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-gi', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'colour-change-gi', term: 'Colour change', definition: 'Switching yarn colour mid-round by pulling the new colour through the last step of the final stitch before the colour change.' },
    { slug: 'safety-eyes-gi', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'dc2tog-gi', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for the decrease rounds that close each piece.' },
    { slug: 'ladder-stitch-gi', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 28 cm tall standing. Neck alone measures 10 cm.',
  sourceNotes: 'Amigurumi giraffe is a popular zoo animal toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The giraffe stands on four capsule legs attached to a cylinder body. A long cylinder neck connects the body to an oval head. All pieces start with a '), gt('magic-ring-gi', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${giraffeTotal} g total: yellow for the main body, brown for the patch markings. Use `, ), gt('colour-change-gi', 'colour change'), t(' when working patch spots directly into rounds, or embroider them on afterwards.')),
      h2('Head'),
      p(t(`Work a ${giraffeHead.finishedDimensionsCm.width} cm by ${giraffeHead.finishedDimensionsCm.height ?? 5} cm oval head (${giraffeHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-gi', 'safety eyes'), t(` at round ${Math.round(giraffeHead.totalRounds * 0.45)}.`)),
      h2('Neck'),
      p(t(`Work a ${giraffeNeck.finishedDimensionsCm.width} cm diameter by ${giraffeNeck.finishedDimensionsCm.height ?? 10} cm cylinder (${giraffeNeck.totalRounds} rounds). Leave both ends open. Stuff firmly so the neck stands upright.`)),
      h2('Body'),
      p(t(`Work a ${giraffeBody.finishedDimensionsCm.width} cm diameter by ${giraffeBody.finishedDimensionsCm.height ?? 11} cm cylinder (${giraffeBody.totalRounds} rounds). Stuff firmly.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${giraffeLeg.finishedDimensionsCm.width} cm diameter by ${giraffeLeg.finishedDimensionsCm.height ?? 8} cm capsule (${giraffeLeg.totalRounds} rounds). Use brown for the hoof section at the bottom 2 cm.`)),
      h2('Assembly'),
      p(t('Pin all legs to the body base before sewing to check the giraffe stands flat. Use '), gt('ladder-stitch-gi', 'ladder stitch'), t(' to sew each leg. Attach neck to the top-front of the body, then head to the top of the neck. Use '), gt('dc2tog-gi', 'dc2tog'), t(' to close any loose join gaps.')),
      h2('What to try next'),
      p(t('The amigurumi zebra uses the same cylinder body shape with a shorter neck and black and white stripe markings.')),
    ],
  },
},
// ── A33 ── Monkey ────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-monkey',
  title: 'Amigurumi monkey',
  subtitle: 'A sitting brown monkey with long capsule arms and a curled tail.',
  excerpt: 'A sitting brown amigurumi monkey in DK yarn. Sphere head, pear body, long capsule arms, shorter capsule legs, and a curled capsule tail. Approx. 20 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet monkey amigurumi', 'monkey stuffed toy crochet', 'sitting monkey crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-mo', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'pear-shape-mo', term: 'Pear shape', definition: 'A piece that is wider at one end than the other. For a monkey body the wider base gives a stable sitting pose.' },
    { slug: 'dc2tog-mo', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the top of the pear body and close each limb.' },
    { slug: 'safety-eyes-mo', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-mo', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 20 cm tall seated. Tail measures 10 cm and can be curled around a branch prop.',
  sourceNotes: 'Amigurumi monkeys are a popular jungle toy. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The monkey sits on a '), gt('pear-shape-mo', 'pear-shaped'), t(' body. Start with the sphere head and attach it to the body top. Long arms hang to below the waist; legs are shorter and bent forward for the sitting pose. All pieces start with a '), gt('magic-ring-mo', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${monkeyTotal} g total: brown for the main body and limbs, a lighter tan or cream for the face muzzle and inner ears.`)),
      h2('Head'),
      p(t(`Work a ${monkeyHead.finishedDimensionsCm.width} cm sphere (${monkeyHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-mo', 'safety eyes'), t(` at round ${Math.round(monkeyHead.totalRounds * 0.45)}. Sew a tan muzzle oval in place below the eyes.`)),
      h2('Body'),
      p(t(`Work a ${monkeyBody.finishedDimensionsCm.maxDiameterCm ?? 8} cm pear body (${monkeyBody.totalRounds} rounds). Use `, ), gt('dc2tog-mo', 'dc2tog'), t(' rounds to taper the top to match the head diameter.')),
      h2('Arms (make 2)'),
      p(t(`Work a ${monkeyArm.finishedDimensionsCm.width} cm diameter by ${monkeyArm.finishedDimensionsCm.height ?? 7} cm capsule (${monkeyArm.totalRounds} rounds). Stuff lightly so the arms remain poseable.`)),
      h2('Legs (make 2)'),
      p(t(`Work a ${monkeyLeg.finishedDimensionsCm.width} cm diameter by ${monkeyLeg.finishedDimensionsCm.height ?? 6} cm capsule (${monkeyLeg.totalRounds} rounds). Bend the leg forward 90 degrees when attaching.`)),
      h2('Tail'),
      p(t(`Work a ${monkeyTail.finishedDimensionsCm.width} cm diameter by ${monkeyTail.finishedDimensionsCm.height ?? 10} cm capsule (${monkeyTail.totalRounds} rounds). Stuff minimally so it curls naturally.`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${monkeyEar.finishedDimensionsCm.width} cm sphere for each ear. Flatten slightly and sew to the sides of the head.`)),
      h2('Assembly'),
      p(t('Sew head to body top using '), gt('ladder-stitch-mo', 'ladder stitch'), t('. Attach arms to the upper body sides. Pin legs to the body base at a forward angle. Sew the tail to the lower back.')),
      h2('What to try next'),
      p(t('The amigurumi sloth uses longer arms on a similar oval body for a hanging pose.')),
    ],
  },
},
// ── A34 ── Lion ───────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-lion',
  title: 'Amigurumi lion',
  subtitle: 'A sitting golden lion with a full looped mane in DK yarn.',
  excerpt: 'A sitting golden amigurumi lion with a looped-yarn mane. Sphere head, oval body, four capsule legs, and a cone tail with a tuft. Approx. 22 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-loop-stitch'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-loop-stitch'],
  aliases: ['crochet lion amigurumi', 'lion stuffed toy crochet', 'lion with mane crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-li', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'loop-stitch-li', term: 'Loop stitch', definition: 'A decorative stitch where a yarn loop is held at the back of the work as the stitch is completed. Used here for the lion mane.' },
    { slug: 'dc2tog-li', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'safety-eyes-li', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-li', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 22 cm tall seated. Mane adds 2 cm radius around the head.',
  sourceNotes: 'Amigurumi lion with looped mane is a popular toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The mane is the defining feature. Work the sphere head first, then add a ring of '), gt('loop-stitch-li', 'loop stitch'), t(' rounds around the equator of the head before closing. All pieces start with a '), gt('magic-ring-li', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${lionTotal} g total: golden yellow for the main body, brown or tawny orange for the mane loops, and a small amount of black for the nose and pupils.`)),
      h2('Head'),
      p(t(`Work a ${lionHead.finishedDimensionsCm.width} cm sphere (${lionHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-li', 'safety eyes'), t(` at round ${Math.round(lionHead.totalRounds * 0.45)}.`)),
      h2('Mane'),
      p(t('After the head is closed, join brown yarn at the equator and work 3 rounds of '), gt('loop-stitch-li', 'loop stitches'), t(' around the full circumference. Cut loops to create a fluffy mane or leave them as curls.')),
      h2('Body'),
      p(t(`Work a ${lionBody.finishedDimensionsCm.width} cm by ${lionBody.finishedDimensionsCm.height ?? 8} cm oval body (${lionBody.totalRounds} rounds).`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${lionLeg.finishedDimensionsCm.width} cm diameter by ${lionLeg.finishedDimensionsCm.height ?? 5} cm capsule per leg (${lionLeg.totalRounds} rounds). Stuff firmly.`)),
      h2('Tail'),
      p(t(`Work a ${lionTail.baseDiameterCm ?? 2} cm base cone tapering over ${lionTail.finishedDimensionsCm.height ?? 8} cm (${lionTail.totalRounds} rounds). Use `, ), gt('dc2tog-li', 'dc2tog'), t(' rounds to taper. Add a small brown tuft at the tip.')),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-li', 'ladder stitch'), t('. Attach front legs to the lower body front and back legs to the rear. Sew tail to the lower back.')),
      h2('What to try next'),
      p(t('The amigurumi elephant uses a similar oval body with added large flat ears.')),
    ],
  },
},
// ── A35 ── Zebra ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-zebra',
  title: 'Amigurumi zebra',
  subtitle: 'A standing black and white striped zebra in DK yarn.',
  excerpt: 'A standing amigurumi zebra in black and white DK yarn. Oval head, cylinder body, four capsule legs, and a short upright mane. Approx. 24 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-colour-change'],
  aliases: ['crochet zebra amigurumi', 'zebra stuffed toy crochet', 'black white zebra crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-ze', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'colour-change-ze', term: 'Colour change', definition: 'Switching yarn mid-round by pulling the new colour through the final step of the last stitch before the colour change.' },
    { slug: 'dc2tog-ze', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'safety-eyes-ze', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-ze', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 24 cm tall standing. Body length 10 cm.',
  sourceNotes: 'Amigurumi zebra is a classic safari toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The stripes are worked by switching yarn colours every 2 rounds. Use a '), gt('colour-change-ze', 'colour change'), t(' at the start of each stripe round. Carry the unused colour loosely inside rather than cutting each time to save ends. All pieces start with a '), gt('magic-ring-ze', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${zebraTotal} g total: roughly half white and half black DK.`)),
      h2('Head'),
      p(t(`Work a ${zebraHead.finishedDimensionsCm.width} cm by ${zebraHead.finishedDimensionsCm.height ?? 6} cm oval head in alternating 2-round stripes (${zebraHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-ze', 'safety eyes'), t(` at round ${Math.round(zebraHead.totalRounds * 0.45)}.`)),
      h2('Body'),
      p(t(`Work a ${zebraBody.finishedDimensionsCm.width} cm diameter by ${zebraBody.finishedDimensionsCm.height ?? 10} cm cylinder in 2-round stripes (${zebraBody.totalRounds} rounds). Stuff firmly so the body is rigid enough for the legs to support it.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${zebraLeg.finishedDimensionsCm.width} cm diameter by ${zebraLeg.finishedDimensionsCm.height ?? 7} cm capsule per leg in 2-round stripes. Use `, ), gt('dc2tog-ze', 'dc2tog'), t(` for the decrease rounds (${zebraLeg.totalRounds} rounds).`)),
      h2('Ears (make 2)'),
      p(t(`Work a ${zebraEar.finishedDimensionsCm.width} cm by ${zebraEar.finishedDimensionsCm.height ?? 2} cm oval flat in white with a black inner oval sewn on.`)),
      h2('Mane'),
      p(t('Cut 4 cm lengths of black yarn. Fold each in half and loop through rounds along the top of the head and neck using a crochet hook.')),
      h2('Assembly'),
      p(t('Pin all four legs to the body base before sewing to confirm the zebra stands flat. Use '), gt('ladder-stitch-ze', 'ladder stitch'), t(' to attach legs. Sew head to the body front.')),
      h2('What to try next'),
      p(t('The amigurumi giraffe uses the same cylinder body with a long neck piece added.')),
    ],
  },
},
// ── A36 ── Parrot ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-parrot',
  title: 'Amigurumi parrot',
  subtitle: 'A colourful tropical parrot in DK yarn with cone beak and capsule wings.',
  excerpt: 'A colourful amigurumi parrot in bright DK yarn with an oversized cone beak and capsule wings. Three tail feathers fan out at the base. Approx. 16 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet parrot amigurumi', 'parrot stuffed toy crochet', 'tropical bird crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-pa', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'colour-change-pa', term: 'Colour change', definition: 'Switching yarn mid-round by pulling the new colour through the final step of the last stitch before the change.' },
    { slug: 'dc2tog-pa', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the beak cone and close capsule wing tips.' },
    { slug: 'safety-eyes-pa', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-pa', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 16 cm tall. Wings span approx. 12 cm tip to tip.',
  sourceNotes: 'Amigurumi parrots are a popular tropical bird toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The parrot is worked in multiple bright colours using '), gt('colour-change-pa', 'colour changes'), t(' for the wing and tail feather sections. All pieces start with a '), gt('magic-ring-pa', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${parrotTotal} g total. Use bright colours: red and green for the main body, blue or yellow for wing tips, and a small amount of black for the beak tip.`)),
      h2('Head'),
      p(t(`Work a ${parrotHead.finishedDimensionsCm.width} cm sphere in the main body colour (${parrotHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-pa', 'safety eyes'), t(` at round ${Math.round(parrotHead.totalRounds * 0.45)}.`)),
      h2('Body'),
      p(t(`Work a ${parrotBody.finishedDimensionsCm.width} cm by ${parrotBody.finishedDimensionsCm.height ?? 6} cm oval body (${parrotBody.totalRounds} rounds).`)),
      h2('Beak'),
      p(t(`Work a ${parrotBeak.finishedDimensionsCm.width ?? 2} cm base cone over ${parrotBeak.finishedDimensionsCm.height ?? 2.5} cm (${parrotBeak.totalRounds} rounds). Use `, ), gt('dc2tog-pa', 'dc2tog'), t(' to taper to a point. Work in yellow with a black tip.')),
      h2('Wings (make 2)'),
      p(t(`Work a ${parrotWing.finishedDimensionsCm.width} cm diameter by ${parrotWing.finishedDimensionsCm.height ?? 6} cm capsule per wing (${parrotWing.totalRounds} rounds). Work in green with a blue or yellow stripe tip.`)),
      h2('Tail feathers (make 3)'),
      p(t(`Work a ${parrotTailFeather.finishedDimensionsCm.width} cm diameter by ${parrotTailFeather.finishedDimensionsCm.height ?? 5} cm capsule per feather in three contrasting colours.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-pa', 'ladder stitch'), t('. Attach beak at the head front below the eyes. Sew wings to the body sides angled slightly back. Sew tail feathers in a fan at the body base.')),
      h2('What to try next'),
      p(t('The amigurumi toucan uses the same sphere head with an oversized cone beak.')),
    ],
  },
},
// ── A37 ── Frog ───────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-frog',
  title: 'Amigurumi frog',
  subtitle: 'A sitting green frog with bulging eyes in DK yarn.',
  excerpt: 'A sitting green amigurumi frog in DK yarn. Sphere head, sphere body, two capsule back legs, two shorter capsule front arms, and raised sphere eye bulges. Approx. 14 cm tall.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet frog amigurumi', 'frog stuffed toy crochet', 'green frog crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-fr', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-fr', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-fr', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape without lumps.' },
    { slug: 'safety-eyes-fr', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit inside the eye bulge sphere before closing.' },
    { slug: 'ladder-stitch-fr', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 14 cm tall seated. Body width 9 cm.',
  sourceNotes: 'Amigurumi frogs are a beginner-friendly toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This frog is rated beginner because all the main pieces are spheres or simple capsules. Work the larger body sphere first, then the smaller head sphere. The raised eye bulges sit on top of the head and each contains a '), gt('safety-eyes-fr', 'safety eye'), t('. All pieces start with a '), gt('magic-ring-fr', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${frogTotal} g of bright green DK and a small amount of white for the eye surround.`)),
      h2('Body'),
      p(t(`Work a ${frogBody.finishedDimensionsCm.width} cm sphere (${frogBody.totalRounds} rounds). Stuff with `, ), gt('stuffing-fr', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${frogHead.finishedDimensionsCm.width} cm sphere (${frogHead.totalRounds} rounds). Leave a larger opening before closing; the mouth is implied by the indented head-body join.`)),
      h2('Eye bulges (make 2)'),
      p(t(`Work a ${frogEyeBulge.finishedDimensionsCm.width} cm sphere (${frogEyeBulge.totalRounds} rounds). Fit a safety eye before closing. Stuff lightly. Use `, ), gt('dc2tog-fr', 'dc2tog'), t(' rounds to close tightly.')),
      h2('Back legs (make 2)'),
      p(t(`Work a ${frogLeg.finishedDimensionsCm.width} cm diameter by ${frogLeg.finishedDimensionsCm.height ?? 7} cm capsule (${frogLeg.totalRounds} rounds). Bend the leg upward at the knee when attaching.`)),
      h2('Front arms (make 2)'),
      p(t(`Work a ${frogArm.finishedDimensionsCm.width} cm diameter by ${frogArm.finishedDimensionsCm.height ?? 5} cm capsule (${frogArm.totalRounds} rounds).`)),
      h2('Assembly'),
      p(t('Sew head to body front using '), gt('ladder-stitch-fr', 'ladder stitch'), t('. Place eye bulges on the head crown with a small gap between them. Attach back legs to the body sides bent at 90 degrees. Attach front arms below the head.')),
      h2('What to try next'),
      p(t('The amigurumi chameleon uses a similar oval head with a much longer body shape.')),
    ],
  },
},
// ── A38 ── Chameleon ──────────────────────────────────────────────────────────
{
  slug: 'amigurumi-chameleon',
  title: 'Amigurumi chameleon',
  subtitle: 'A green chameleon with a coiled tail in DK yarn.',
  excerpt: 'An amigurumi chameleon in green DK yarn. Oval head with crest ridge, capsule body, four short capsule legs, and a long coiling capsule tail. Approx. 22 cm nose to tail tip.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-surface-slip-stitch'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet chameleon amigurumi', 'chameleon stuffed toy crochet', 'lizard amigurumi pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-ch', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'surface-slip-ch', term: 'Surface slip stitch', definition: 'A chain of slip stitches worked over the surface of a finished piece. Used to add the crest ridge along the chameleon back.' },
    { slug: 'dc2tog-ch', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the tail and close each piece.' },
    { slug: 'safety-eyes-ch', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-ch', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 22 cm nose to tail tip when the tail is stretched. Coiled pose measures approx. 14 cm.',
  sourceNotes: 'Amigurumi chameleons are a popular reptile toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The chameleon uses a '), gt('surface-slip-ch', 'surface slip stitch'), t(' ridge along the top of the body and tail to create the back crest. All pieces start with a '), gt('magic-ring-ch', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${chameleonTotal} g of green DK. Use a darker green for the crest ridge surface stitches.`)),
      h2('Head'),
      p(t(`Work a ${chameleonHead.finishedDimensionsCm.width} cm by ${chameleonHead.finishedDimensionsCm.height ?? 5} cm oval head (${chameleonHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-ch', 'safety eyes'), t(` at round ${Math.round(chameleonHead.totalRounds * 0.45)}.`)),
      h2('Body'),
      p(t(`Work a ${chameleonBody.finishedDimensionsCm.width} cm diameter by ${chameleonBody.finishedDimensionsCm.height ?? 10} cm capsule body (${chameleonBody.totalRounds} rounds). Work the crest ridge with dark green `, ), gt('surface-slip-ch', 'surface slip stitches'), t(' along the top midline after stuffing.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${chameleonLeg.finishedDimensionsCm.width} cm diameter by ${chameleonLeg.finishedDimensionsCm.height ?? 4} cm capsule per leg (${chameleonLeg.totalRounds} rounds). Attach all four legs at a right angle to the body sides.`)),
      h2('Tail'),
      p(t(`Work a ${chameleonTail.finishedDimensionsCm.width} cm diameter by ${chameleonTail.finishedDimensionsCm.height ?? 9} cm capsule tail (${chameleonTail.totalRounds} rounds). Use `, ), gt('dc2tog-ch', 'dc2tog'), t(' to taper to a point at the tip. Stuff minimally so the tail holds a curl when bent.')),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-ch', 'ladder stitch'), t('. Attach legs at roughly equal spacing along the body. Sew the tail to the body rear. Curl the tail loosely and tack with one hidden stitch to hold the coil.')),
      h2('What to try next'),
      p(t('The amigurumi frog uses the same capsule leg shape on a rounder sphere body.')),
    ],
  },
},
// ── A39 ── Toucan ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-toucan',
  title: 'Amigurumi toucan',
  subtitle: 'A black toucan with an oversized colourful cone beak in DK yarn.',
  excerpt: 'An amigurumi toucan in black DK yarn with a large orange and yellow cone beak. Sphere head, oval body, two capsule wings. Approx. 18 cm tall.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet toucan amigurumi', 'toucan stuffed toy crochet', 'tropical bird beak crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-to', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'colour-change-to', term: 'Colour change', definition: 'Switching yarn mid-round by pulling the new colour through the final step of the last stitch before the change.' },
    { slug: 'dc2tog-to', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the beak tip and close each piece.' },
    { slug: 'safety-eyes-to', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-to', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 18 cm tall. Beak extends 7 cm from the head.',
  sourceNotes: 'Amigurumi toucans are a popular tropical bird toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The beak is the centrepiece of this pattern. It is a wide cone that attaches below the eye line and hangs slightly downward. Work the beak in orange with a '), gt('colour-change-to', 'colour change'), t(' to yellow at the tip. All pieces start with a '), gt('magic-ring-to', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${toucanTotal} g total: black for the head, body, and wings; orange and yellow for the beak; white for the throat patch.`)),
      h2('Head'),
      p(t(`Work a ${toucanHead.finishedDimensionsCm.width} cm sphere in black (${toucanHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-to', 'safety eyes'), t(` at round ${Math.round(toucanHead.totalRounds * 0.45)}. Sew a white oval to the lower front for the throat patch.`)),
      h2('Body'),
      p(t(`Work a ${toucanBody.finishedDimensionsCm.width} cm by ${toucanBody.finishedDimensionsCm.height ?? 7} cm oval body in black (${toucanBody.totalRounds} rounds).`)),
      h2('Beak'),
      p(t(`Work a ${toucanBeak.finishedDimensionsCm.width ?? 3.5} cm base cone over ${toucanBeak.finishedDimensionsCm.height ?? 7} cm (${toucanBeak.totalRounds} rounds). Work base rounds in orange, switching to yellow for the final quarter. Use `, ), gt('dc2tog-to', 'dc2tog'), t(' to taper. Stuff very lightly so the beak holds its shape without drooping.')),
      h2('Wings (make 2)'),
      p(t(`Work a ${toucanWing.finishedDimensionsCm.width} cm diameter by ${toucanWing.finishedDimensionsCm.height ?? 6} cm capsule per wing in black (${toucanWing.totalRounds} rounds). Flatten before sewing.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-to', 'ladder stitch'), t('. Attach beak to the head front, centred just below the eyes, angled slightly downward. Sew wings flat to the body sides.')),
      h2('What to try next'),
      p(t('The amigurumi parrot uses a smaller cone beak with colourful wings for a different tropical bird.')),
    ],
  },
},
// ── A40 ── Sloth ──────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-sloth',
  title: 'Amigurumi sloth',
  subtitle: 'A hanging grey sloth with extra-long capsule arms in DK yarn.',
  excerpt: 'An amigurumi sloth in grey DK yarn posed for hanging. Extra-long capsule arms drape over a branch; the oval body and short legs hang below. Approx. 20 cm arm span.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet sloth amigurumi', 'sloth stuffed toy crochet', 'hanging sloth crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-sl', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-sl', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for decrease rounds that close each piece.' },
    { slug: 'stuffing-sl', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape without lumps.' },
    { slug: 'safety-eyes-sl', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-sl', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls nearly invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 20 cm arm span when hanging. Body height 10 cm.',
  sourceNotes: 'Amigurumi sloths are a popular hanging toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The sloth is designed to hang from a twig or dowel. The arms are deliberately long and lightly stuffed so they drape naturally. Work the body first, then the head. All pieces start with a '), gt('magic-ring-sl', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${slothTotal} g of grey DK and a small amount of dark brown or black for the face markings.`)),
      h2('Head'),
      p(t(`Work a ${slothHead.finishedDimensionsCm.width} cm sphere (${slothHead.totalRounds} rounds). Fit `, ), gt('safety-eyes-sl', 'safety eyes'), t(` at round ${Math.round(slothHead.totalRounds * 0.45)}. Embroider a dark oval around each eye for the face mask.`)),
      h2('Body'),
      p(t(`Work a ${slothBody.finishedDimensionsCm.width} cm by ${slothBody.finishedDimensionsCm.height ?? 7} cm oval body (${slothBody.totalRounds} rounds). Stuff firmly with `, ), gt('stuffing-sl', 'firm stuffing'), t('.')),
      h2('Arms (make 2)'),
      p(t(`Work a ${slothArm.finishedDimensionsCm.width} cm diameter by ${slothArm.finishedDimensionsCm.height ?? 12} cm capsule per arm (${slothArm.totalRounds} rounds). Stuff very lightly so they hang loosely. Use `, ), gt('dc2tog-sl', 'dc2tog'), t(' to close the claw end.')),
      h2('Legs (make 2)'),
      p(t(`Work a ${slothLeg.finishedDimensionsCm.width} cm diameter by ${slothLeg.finishedDimensionsCm.height ?? 8} cm capsule per leg (${slothLeg.totalRounds} rounds). Stuff lightly.`)),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-sl', 'ladder stitch'), t('. Attach arms to the upper body sides pointing upward. Attach legs to the lower body. To hang, place the arms over a dowel or branch.')),
      h2('What to try next'),
      p(t('The amigurumi monkey uses similar long arms on a pear-shaped body in a sitting pose.')),
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
