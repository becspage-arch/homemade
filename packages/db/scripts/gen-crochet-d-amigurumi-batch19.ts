/**
 * Generator: D-Amigurumi Batch 19 -- A181-A190 Reptiles and Amphibians
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch19.ts
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

// ── A181 ── Crocodile ─────────────────────────────────────────────────────────
const crocBody = capsule({ diameterCm: 7, lengthCm: 16, gauge: GAUGE, label: 'Body' })
const crocHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const crocLeg = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Leg' })
const crocTail = capsule({ diameterCm: 3, lengthCm: 10, gauge: GAUGE, label: 'Tail' })
const crocTotal = crocBody.yarnRequiredGrams + crocHead.yarnRequiredGrams + crocLeg.yarnRequiredGrams * 4 + crocTail.yarnRequiredGrams

// ── A182 ── Gecko ─────────────────────────────────────────────────────────────
const geckoBody = oval({ longAxisCm: 10, shortAxisCm: 5, gauge: GAUGE, label: 'Body' })
const geckoHead = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
const geckoLeg = capsule({ diameterCm: 1.5, lengthCm: 4, gauge: GAUGE, label: 'Leg' })
const geckoTail = cylinder({ diameterCm: 2, heightCm: 7, gauge: GAUGE, label: 'Tail' })
const geckoTotal = geckoBody.yarnRequiredGrams + geckoHead.yarnRequiredGrams + geckoLeg.yarnRequiredGrams * 4 + geckoTail.yarnRequiredGrams

// ── A183 ── Iguana ────────────────────────────────────────────────────────────
const iguanaBody = oval({ longAxisCm: 12, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
const iguanaHead = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
const iguanaLeg = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const iguanaTail = cone({ baseDiameterCm: 3, heightCm: 14, gauge: GAUGE, label: 'Tail' })
const iguanaSpine = cone({ baseDiameterCm: 1, heightCm: 3, gauge: GAUGE, label: 'Spine' })
const iguanaSpineCount = 8
const iguanaTotal = iguanaBody.yarnRequiredGrams + iguanaHead.yarnRequiredGrams + iguanaLeg.yarnRequiredGrams * 4 + iguanaTail.yarnRequiredGrams + iguanaSpine.yarnRequiredGrams * iguanaSpineCount

// ── A184 ── Giant Tortoise ────────────────────────────────────────────────────
const tortoiseShell = sphere({ diameterCm: 14, gauge: GAUGE, label: 'Shell' })
const tortoiseHead = oval({ longAxisCm: 7, shortAxisCm: 5, gauge: GAUGE, label: 'Head' })
const tortoiseLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const tortoiseTotal = tortoiseShell.yarnRequiredGrams + tortoiseHead.yarnRequiredGrams + tortoiseLeg.yarnRequiredGrams * 4

// ── A185 ── Python Snake ──────────────────────────────────────────────────────
const pythonSection = oval({ longAxisCm: 8, shortAxisCm: 5, gauge: GAUGE, label: 'Body section' })
const pythonHead = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
const pythonTongue = cone({ baseDiameterCm: 1, heightCm: 3, gauge: GAUGE, label: 'Tongue' })
const pythonSectionCount = 6
const pythonTotal = pythonSection.yarnRequiredGrams * pythonSectionCount + pythonHead.yarnRequiredGrams + pythonTongue.yarnRequiredGrams

// ── A186 ── Salamander ────────────────────────────────────────────────────────
const salamanderBody = capsule({ diameterCm: 5, lengthCm: 10, gauge: GAUGE, label: 'Body' })
const salamanderHead = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
const salamanderLeg = capsule({ diameterCm: 1.5, lengthCm: 3, gauge: GAUGE, label: 'Leg' })
const salamanderTotal = salamanderBody.yarnRequiredGrams + salamanderHead.yarnRequiredGrams + salamanderLeg.yarnRequiredGrams * 4

// ── A187 ── Tree Frog ─────────────────────────────────────────────────────────
const treeFrogHead = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
const treeFrogBody = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Body' })
const treeFrogLeg = capsule({ diameterCm: 2, lengthCm: 8, gauge: GAUGE, label: 'Leg' })
const treeFrogToe = sphere({ diameterCm: 1, gauge: GAUGE, label: 'Toe pad' })
const treeFrogToeCount = 16
const treeFrogEyeBulge = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Eye bulge' })
const treeFrogTotal = treeFrogHead.yarnRequiredGrams + treeFrogBody.yarnRequiredGrams + treeFrogLeg.yarnRequiredGrams * 4 + treeFrogToe.yarnRequiredGrams * treeFrogToeCount + treeFrogEyeBulge.yarnRequiredGrams * 2

// ── A188 ── Toad ──────────────────────────────────────────────────────────────
const toadHead = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
const toadBody = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Body' })
const toadLeg = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Leg' })
const toadEyeBulge = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Eye bulge' })
const toadTotal = toadHead.yarnRequiredGrams + toadBody.yarnRequiredGrams + toadLeg.yarnRequiredGrams * 4 + toadEyeBulge.yarnRequiredGrams * 2

// ── A189 ── Newt ──────────────────────────────────────────────────────────────
const newtBody = capsule({ diameterCm: 5, lengthCm: 10, gauge: GAUGE, label: 'Body' })
const newtHead = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
const newtLeg = capsule({ diameterCm: 1.5, lengthCm: 3.5, gauge: GAUGE, label: 'Leg' })
const newtTail = cylinder({ diameterCm: 2, heightCm: 7, gauge: GAUGE, label: 'Tail' })
const newtTotal = newtBody.yarnRequiredGrams + newtHead.yarnRequiredGrams + newtLeg.yarnRequiredGrams * 4 + newtTail.yarnRequiredGrams

// ── A190 ── Komodo Dragon ─────────────────────────────────────────────────────
const komodoHead = oval({ longAxisCm: 9, shortAxisCm: 6, gauge: GAUGE, label: 'Head' })
const komodoBody = capsule({ diameterCm: 8, lengthCm: 14, gauge: GAUGE, label: 'Body' })
const komodoLeg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg' })
const komodoTail = cylinder({ diameterCm: 3.5, heightCm: 12, gauge: GAUGE, label: 'Tail' })
const komodoTotal = komodoHead.yarnRequiredGrams + komodoBody.yarnRequiredGrams + komodoLeg.yarnRequiredGrams * 4 + komodoTail.yarnRequiredGrams

const PATTERNS = [
// ── A181 ── Crocodile ────────────────────────────────────────────────────────
{
  slug: 'amigurumi-crocodile',
  title: 'Amigurumi crocodile',
  subtitle: 'A green crocodile with a wide capsule body and snapping head.',
  excerpt: 'A green amigurumi crocodile in DK yarn. Capsule body, sphere head, four short capsule legs, and a tapered capsule tail. Approx. 28 cm nose to tail.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-surface-embroidery'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet crocodile amigurumi', 'crocodile stuffed toy crochet', 'green crocodile crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-cr', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-cr', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for the decrease rounds that close each piece.' },
    { slug: 'stuffing-cr', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-cr', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-cr', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
    { slug: 'surface-embroidery-cr', term: 'Surface embroidery', definition: 'Stitching worked directly onto the finished crochet fabric to add scale texture or tooth detail.' },
  ],
  finishedSizeText: 'Approx. 28 cm from nose to tail tip. Body width approx. 7 cm.',
  sourceNotes: 'Amigurumi crocodile is a popular toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This crocodile is built from five piece types: a sphere head, a capsule body, four short capsule legs, and a capsule tail. All pieces start with a '), gt('magic-ring-cr', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${crocTotal} g of green DK and a small amount of white for the teeth. Stuff each piece with `), gt('stuffing-cr', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${crocHead.finishedDimensionsCm.width} cm sphere (${crocHead.totalRounds} rounds). Fit `), gt('safety-eyes-cr', 'safety eyes'), t(` at round ${Math.round(crocHead.totalRounds * 0.4)}. Add teeth using `), gt('surface-embroidery-cr', 'surface embroidery'), t(' with white yarn along the lower jaw line.')),
      h2('Body'),
      p(t(`Work a ${crocBody.finishedDimensionsCm.width} cm diameter by ${crocBody.finishedDimensionsCm.height ?? 16} cm capsule (${crocBody.totalRounds} rounds). Stuff firmly so the body lies flat.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${crocLeg.finishedDimensionsCm.width} cm diameter by ${crocLeg.finishedDimensionsCm.height ?? 4} cm capsule (${crocLeg.totalRounds} rounds). Use `), gt('dc2tog-cr', 'dc2tog'), t(' to close the foot end before stuffing.')),
      h2('Tail'),
      p(t(`Work a ${crocTail.finishedDimensionsCm.width} cm diameter by ${crocTail.finishedDimensionsCm.height ?? 10} cm capsule (${crocTail.totalRounds} rounds). Taper the last six rounds by working one decrease per round.`)),
      h2('Assembly'),
      p(t('Sew head to the front of the body using '), gt('ladder-stitch-cr', 'ladder stitch'), t('. Attach the tail to the rear. Pin all four legs to the underside before sewing to check the crocodile lies flat.')),
      h2('What to try next'),
      p(t('The amigurumi gecko uses a similar flat-lying oval body with a slimmer tail.')),
    ],
  },
},
// ── A182 ── Gecko ────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-gecko',
  title: 'Amigurumi gecko',
  subtitle: 'A spotted gecko with an oval body and slender limbs.',
  excerpt: 'A spotted amigurumi gecko in DK yarn. Oval body, sphere head, four slim capsule legs, and a cylinder tail. Approx. 20 cm nose to tail.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet gecko amigurumi', 'spotted gecko stuffed toy', 'gecko crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-ge', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-ge', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the tail and close each piece.' },
    { slug: 'colour-change-ge', term: 'Colour change', definition: 'Switching yarn colour mid-round by pulling the new colour through the last step of the final stitch before the change.' },
    { slug: 'safety-eyes-ge', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-ge', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 20 cm from nose to tail tip. Body width approx. 5 cm.',
  sourceNotes: 'Amigurumi gecko is a beginner-friendly toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This gecko has an oval body, sphere head, four slim legs, and a cylinder tail. All pieces start with a '), gt('magic-ring-ge', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${geckoTotal} g of green DK and a contrasting colour for spots. Use `), gt('colour-change-ge', 'colour change'), t(' to work spots directly into body rounds, or embroider them afterwards.')),
      h2('Head'),
      p(t(`Work a ${geckoHead.finishedDimensionsCm.width} cm sphere (${geckoHead.totalRounds} rounds). Fit `), gt('safety-eyes-ge', 'safety eyes'), t(` at round ${Math.round(geckoHead.totalRounds * 0.45)} before closing.`)),
      h2('Body'),
      p(t(`Work a ${geckoBody.finishedDimensionsCm.width} cm by ${geckoBody.finishedDimensionsCm.height ?? 10} cm oval (${geckoBody.totalRounds} rounds). Keep stuffing light so the body lies flat.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${geckoLeg.finishedDimensionsCm.width} cm diameter by ${geckoLeg.finishedDimensionsCm.height ?? 4} cm capsule (${geckoLeg.totalRounds} rounds). Use `), gt('dc2tog-ge', 'dc2tog'), t(' to close the foot end.')),
      h2('Tail'),
      p(t(`Work a ${geckoTail.finishedDimensionsCm.width} cm diameter by ${geckoTail.finishedDimensionsCm.height ?? 7} cm cylinder (${geckoTail.totalRounds} rounds). Taper the last four rounds with one decrease per round.`)),
      h2('Assembly'),
      p(t('Sew head to the front of the body using '), gt('ladder-stitch-ge', 'ladder stitch'), t('. Attach the tail to the rear. Sew legs splayed out to each side so the gecko lies flat.')),
      h2('What to try next'),
      p(t('The amigurumi iguana uses the same flat layout with a longer spined tail.')),
    ],
  },
},
// ── A183 ── Iguana ────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-iguana',
  title: 'Amigurumi iguana',
  subtitle: 'A green iguana with a long tapered tail and a row of dorsal spines.',
  excerpt: 'A green amigurumi iguana in DK yarn. Oval body, sphere head, four capsule legs, a long cone tail, and eight small cone spines along the back. Approx. 34 cm nose to tail.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-surface-embroidery'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet iguana amigurumi', 'iguana stuffed toy crochet', 'green iguana crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-ig', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-ig', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the tail cone and close each piece.' },
    { slug: 'stuffing-ig', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the piece holds its shape and shows no lumps through the fabric.' },
    { slug: 'safety-eyes-ig', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-ig', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
    { slug: 'surface-embroidery-ig', term: 'Surface embroidery', definition: 'Stitching worked directly onto the finished crochet fabric to add scale texture or colour detail.' },
  ],
  finishedSizeText: 'Approx. 34 cm from nose to tail tip. Body length approx. 12 cm.',
  sourceNotes: 'Amigurumi iguana is a popular reptile toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This iguana has an oval body, sphere head, four short legs, a long cone tail, and eight small spine cones along the back. All pieces start with a '), gt('magic-ring-ig', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${iguanaTotal} g of green DK. Use `), gt('surface-embroidery-ig', 'surface embroidery'), t(' in a darker green to add scale texture along the sides.')),
      h2('Head'),
      p(t(`Work a ${iguanaHead.finishedDimensionsCm.width} cm sphere (${iguanaHead.totalRounds} rounds). Fit `), gt('safety-eyes-ig', 'safety eyes'), t(` at round ${Math.round(iguanaHead.totalRounds * 0.45)} before closing.`)),
      h2('Body'),
      p(t(`Work a ${iguanaBody.finishedDimensionsCm.width} cm by ${iguanaBody.finishedDimensionsCm.height ?? 12} cm oval (${iguanaBody.totalRounds} rounds). Stuff with `), gt('stuffing-ig', 'firm stuffing'), t('.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${iguanaLeg.finishedDimensionsCm.width} cm diameter by ${iguanaLeg.finishedDimensionsCm.height ?? 5} cm capsule (${iguanaLeg.totalRounds} rounds). Use `), gt('dc2tog-ig', 'dc2tog'), t(' to close the foot end.')),
      h2('Tail'),
      p(t(`Work a ${iguanaTail.finishedDimensionsCm.width} cm base diameter by ${iguanaTail.finishedDimensionsCm.height ?? 14} cm cone (${iguanaTail.totalRounds} rounds). Decrease by one stitch every other round to taper naturally.`)),
      h2('Dorsal spines (make 8)'),
      p(t(`Work each spine as a ${iguanaSpine.finishedDimensionsCm.width} cm base by ${iguanaSpine.finishedDimensionsCm.height ?? 3} cm cone (${iguanaSpine.totalRounds} rounds). Do not stuff. Sew in a line along the centre back from the neck to the base of the tail.`)),
      h2('Assembly'),
      p(t('Sew head to the front of the body using '), gt('ladder-stitch-ig', 'ladder stitch'), t('. Attach tail to the rear. Pin legs to the sides so the iguana lies flat before sewing.')),
      h2('What to try next'),
      p(t('The amigurumi komodo dragon uses a heavier capsule body on the same flat-lying frame.')),
    ],
  },
},
// ── A184 ── Giant Tortoise ────────────────────────────────────────────────────
{
  slug: 'amigurumi-tortoise-giant',
  title: 'Amigurumi giant tortoise',
  subtitle: 'A domed brown giant tortoise with a wide stuffed shell.',
  excerpt: 'A domed amigurumi giant tortoise in DK yarn. Large sphere shell worked flat on top, oval head, and four short capsule legs. Approx. 18 cm across the shell.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet tortoise amigurumi', 'giant tortoise stuffed toy', 'brown tortoise crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-to', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-to', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to close each piece at the decrease end.' },
    { slug: 'colour-change-to', term: 'Colour change', definition: 'Switching yarn colour to add the carapace plate pattern across the shell.' },
    { slug: 'stuffing-to', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the domed shell holds its shape.' },
    { slug: 'ladder-stitch-to', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
    { slug: 'safety-eyes-to', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
  ],
  finishedSizeText: 'Approx. 18 cm across the shell. Shell dome height approx. 9 cm.',
  sourceNotes: 'Amigurumi giant tortoise is a popular wildlife toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This tortoise centres on a large domed sphere shell. The oval head and four short legs tuck out from under the shell edge. All pieces start with a '), gt('magic-ring-to', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${tortoiseTotal} g of brown DK and a lighter tan for the carapace plate lines. Use `), gt('colour-change-to', 'colour change'), t(' to mark the plate boundaries across the shell dome.')),
      h2('Shell'),
      p(t(`Work a ${tortoiseShell.finishedDimensionsCm.width} cm sphere (${tortoiseShell.totalRounds} rounds), but stop at the halfway round to create a flat base rather than a full sphere. Stuff firmly with `), gt('stuffing-to', 'firm stuffing'), t(' so the dome holds.')),
      h2('Head'),
      p(t(`Work a ${tortoiseHead.finishedDimensionsCm.width} cm by ${tortoiseHead.finishedDimensionsCm.height ?? 5} cm oval (${tortoiseHead.totalRounds} rounds). Fit `), gt('safety-eyes-to', 'safety eyes'), t(` at round ${Math.round(tortoiseHead.totalRounds * 0.4)} before closing.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${tortoiseLeg.finishedDimensionsCm.width} cm diameter by ${tortoiseLeg.finishedDimensionsCm.height ?? 5} cm capsule (${tortoiseLeg.totalRounds} rounds). Use `), gt('dc2tog-to', 'dc2tog'), t(' to close the foot end.')),
      h2('Assembly'),
      p(t('Sew head and legs to the flat underside edge using '), gt('ladder-stitch-to', 'ladder stitch'), t(', spacing the legs so the tortoise stands level. The head protrudes from the front gap.')),
      h2('What to try next'),
      p(t('The amigurumi toad uses a similar wide sphere body as the main piece.')),
    ],
  },
},
// ── A185 ── Python Snake ──────────────────────────────────────────────────────
{
  slug: 'amigurumi-snake-python',
  title: 'Amigurumi python snake',
  subtitle: 'A patterned python built from linked oval body sections.',
  excerpt: 'A patterned amigurumi python in DK yarn. Six linked oval body sections, a sphere head, and a slim cone tongue. Approx. 50 cm stretched end to end.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet python amigurumi', 'snake stuffed toy crochet', 'python crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-py', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-py', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to taper the final tail section and close each piece.' },
    { slug: 'colour-change-py', term: 'Colour change', definition: 'Switching yarn colour to add saddle-shaped blotch marks across each body section.' },
    { slug: 'ladder-stitch-py', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Used to link body sections in a flexible chain.' },
    { slug: 'safety-eyes-py', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'stuffing-py', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that each section holds its oval form.' },
  ],
  finishedSizeText: 'Approx. 50 cm stretched out. Each body section approx. 8 cm long.',
  sourceNotes: 'Amigurumi segmented snake is a popular jointed toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This python is made from six oval body sections joined in a chain, plus a sphere head and a cone tongue. All pieces start with a '), gt('magic-ring-py', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${pythonTotal} g of cream DK and a contrasting brown or green for the blotch marks. Use `), gt('colour-change-py', 'colour change'), t(' to work saddle blotches across each section.')),
      h2('Body sections (make 6)'),
      p(t(`Work each section as a ${pythonSection.finishedDimensionsCm.width} cm by ${pythonSection.finishedDimensionsCm.height ?? 8} cm oval (${pythonSection.totalRounds} rounds). Stuff each with `), gt('stuffing-py', 'firm stuffing'), t(' before closing.')),
      h2('Head'),
      p(t(`Work a ${pythonHead.finishedDimensionsCm.width} cm sphere (${pythonHead.totalRounds} rounds). Fit `), gt('safety-eyes-py', 'safety eyes'), t(` at round ${Math.round(pythonHead.totalRounds * 0.4)} before closing.`)),
      h2('Tongue'),
      p(t(`Work a slim ${pythonTongue.finishedDimensionsCm.width} cm base by ${pythonTongue.finishedDimensionsCm.height ?? 3} cm cone. Use `), gt('dc2tog-py', 'dc2tog'), t(' to taper. Split the tip into two prongs by cutting and knotting the yarn end.')),
      h2('Assembly'),
      p(t('Line up the six body sections and join them end to end using '), gt('ladder-stitch-py', 'ladder stitch'), t('. Keep joins loose enough for the snake to coil. Attach the head to the first section and the tongue below the eyes.')),
      h2('What to try next'),
      p(t('The amigurumi salamander uses a single capsule body rather than linked sections.')),
    ],
  },
},
// ── A186 ── Salamander ────────────────────────────────────────────────────────
{
  slug: 'amigurumi-salamander',
  title: 'Amigurumi salamander',
  subtitle: 'A bright orange salamander with a smooth capsule body.',
  excerpt: 'A bright orange amigurumi salamander in DK yarn. Capsule body, sphere head, and four short capsule legs. Approx. 18 cm nose to tail.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet salamander amigurumi', 'salamander stuffed toy crochet', 'orange salamander crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-sa', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-sa', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to close each piece at the decrease end.' },
    { slug: 'stuffing-sa', term: 'Light stuffing', definition: 'Using a smaller amount of polyester fibrefill so the piece stays flexible and flat.' },
    { slug: 'safety-eyes-sa', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-sa', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 18 cm from nose to tail tip. Body width approx. 5 cm.',
  sourceNotes: 'Amigurumi salamander is a simple amphibian toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This salamander has a capsule body, sphere head, and four short legs. The whole animal lies flat. All pieces start with a '), gt('magic-ring-sa', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${salamanderTotal} g of orange DK. No colour changes are needed; the vivid orange reads well as a solid colour.`)),
      h2('Head'),
      p(t(`Work a ${salamanderHead.finishedDimensionsCm.width} cm sphere (${salamanderHead.totalRounds} rounds). Fit `), gt('safety-eyes-sa', 'safety eyes'), t(` at round ${Math.round(salamanderHead.totalRounds * 0.4)} before closing.`)),
      h2('Body'),
      p(t(`Work a ${salamanderBody.finishedDimensionsCm.width} cm diameter by ${salamanderBody.finishedDimensionsCm.height ?? 10} cm capsule (${salamanderBody.totalRounds} rounds). Use `), gt('stuffing-sa', 'light stuffing'), t(' so the body stays flat and flexible.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${salamanderLeg.finishedDimensionsCm.width} cm diameter by ${salamanderLeg.finishedDimensionsCm.height ?? 3} cm capsule (${salamanderLeg.totalRounds} rounds). Use `), gt('dc2tog-sa', 'dc2tog'), t(' to close the foot end. No stuffing needed.')),
      h2('Assembly'),
      p(t('Sew head to the front of the body using '), gt('ladder-stitch-sa', 'ladder stitch'), t('. Attach the front pair of legs close behind the head and the rear pair halfway along the body.')),
      h2('What to try next'),
      p(t('The amigurumi newt adds a cylinder tail and orange spot detail to the same flat body shape.')),
    ],
  },
},
// ── A187 ── Tree Frog ─────────────────────────────────────────────────────────
{
  slug: 'amigurumi-tree-frog',
  title: 'Amigurumi tree frog',
  subtitle: 'A bright green tree frog with bulging eyes and suction pad toes.',
  excerpt: 'A bright green amigurumi tree frog in DK yarn. Sphere head with bulging eye spheres, sphere body, four long capsule legs, and sixteen tiny sphere toe pads. Approx. 14 cm seated.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-surface-embroidery'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet tree frog amigurumi', 'tree frog stuffed toy', 'green frog crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-tf', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-tf', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to close each piece at the decrease end.' },
    { slug: 'stuffing-tf', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that each sphere holds its round shape.' },
    { slug: 'safety-eyes-tf', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit inside the eye-bulge sphere before closing.' },
    { slug: 'ladder-stitch-tf', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
    { slug: 'surface-embroidery-tf', term: 'Surface embroidery', definition: 'Stitching worked directly onto the finished crochet fabric to add toe pad ring detail.' },
  ],
  finishedSizeText: 'Approx. 14 cm tall seated. Leg span approx. 18 cm tip to tip.',
  sourceNotes: 'Amigurumi tree frog is a popular tropical toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This tree frog uses two spheres for the head and body, with bulging eye spheres fitted on top of the head. Four long legs end in four tiny toe pads each. All pieces start with a '), gt('magic-ring-tf', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${treeFrogTotal} g of bright green DK and a small amount of orange or red for the eye and toe detail.`)),
      h2('Head and eye bulges'),
      p(t(`Work a ${treeFrogHead.finishedDimensionsCm.width} cm sphere for the head (${treeFrogHead.totalRounds} rounds). Work two ${treeFrogEyeBulge.finishedDimensionsCm.width} cm spheres for the eye bulges (${treeFrogEyeBulge.totalRounds} rounds each). Fit `), gt('safety-eyes-tf', 'safety eyes'), t(' inside each bulge before closing, then sew the bulges to the top of the head.')),
      h2('Body'),
      p(t(`Work a ${treeFrogBody.finishedDimensionsCm.width} cm sphere (${treeFrogBody.totalRounds} rounds). Stuff with `), gt('stuffing-tf', 'firm stuffing'), t('.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${treeFrogLeg.finishedDimensionsCm.width} cm diameter by ${treeFrogLeg.finishedDimensionsCm.height ?? 8} cm capsule (${treeFrogLeg.totalRounds} rounds). Use `), gt('dc2tog-tf', 'dc2tog'), t(' to close the foot end.')),
      h2('Toe pads (make 16)'),
      p(t(`Work each pad as a ${treeFrogToe.finishedDimensionsCm.width} cm sphere (${treeFrogToe.totalRounds} rounds). Sew four pads to the end of each leg. Use `), gt('surface-embroidery-tf', 'surface embroidery'), t(' to add a small circle outline to each pad.')),
      h2('Assembly'),
      p(t('Sew head to body using '), gt('ladder-stitch-tf', 'ladder stitch'), t('. Attach the front legs to each side of the body just below the head. Attach the rear legs lower on the body, angled outward.')),
      h2('What to try next'),
      p(t('The amigurumi toad uses the same sphere head and body construction without the long legs or toe pads.')),
    ],
  },
},
// ── A188 ── Toad ──────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-toad',
  title: 'Amigurumi toad',
  subtitle: 'A squat brown toad with a chunky sphere body.',
  excerpt: 'A squat amigurumi toad in DK yarn. Sphere head, large sphere body, and four short capsule legs. Approx. 13 cm seated.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet toad amigurumi', 'toad stuffed toy crochet', 'brown toad crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-td', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-td', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to close each sphere and capsule piece.' },
    { slug: 'stuffing-td', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the sphere body holds its round shape.' },
    { slug: 'safety-eyes-td', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-td', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
  ],
  finishedSizeText: 'Approx. 13 cm tall seated. Body diameter approx. 10 cm.',
  sourceNotes: 'Amigurumi toad is a classic beginner amphibian design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This toad uses only three piece types: a sphere head, a large sphere body, and four short legs. All pieces start with a '), gt('magic-ring-td', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${toadTotal} g of brown DK. A small amount of lighter tan adds warty spots if embroidered on afterwards.`)),
      h2('Head'),
      p(t(`Work a ${toadHead.finishedDimensionsCm.width} cm sphere (${toadHead.totalRounds} rounds). Use `), gt('dc2tog-td', 'dc2tog'), t(` at the decrease end. Fit `), gt('safety-eyes-td', 'safety eyes'), t(` at round ${Math.round(toadHead.totalRounds * 0.4)} before closing.`)),
      h2('Body'),
      p(t(`Work a ${toadBody.finishedDimensionsCm.width} cm sphere (${toadBody.totalRounds} rounds). Stuff firmly with `), gt('stuffing-td', 'firm stuffing'), t('.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${toadLeg.finishedDimensionsCm.width} cm diameter by ${toadLeg.finishedDimensionsCm.height ?? 4} cm capsule (${toadLeg.totalRounds} rounds). The rear legs splay wider than the front legs for a natural seated pose.`)),
      h2('Assembly'),
      p(t('Sew head to the top of the body using '), gt('ladder-stitch-td', 'ladder stitch'), t('. Attach the rear legs to the bottom sides of the body angled outward so the toad sits flat.')),
      h2('What to try next'),
      p(t('The amigurumi tree frog adds long legs and suction pad toes to the same sphere construction.')),
    ],
  },
},
// ── A189 ── Newt ──────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-newt',
  title: 'Amigurumi newt',
  subtitle: 'An orange-spotted newt with a slender capsule body and cylinder tail.',
  excerpt: 'An orange-spotted amigurumi newt in DK yarn. Capsule body, sphere head, four short capsule legs, and a cylinder tail. Approx. 20 cm nose to tail.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-surface-embroidery'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet newt amigurumi', 'newt stuffed toy crochet', 'spotted newt crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-nw', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-nw', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to close each piece at the decrease end.' },
    { slug: 'stuffing-nw', term: 'Light stuffing', definition: 'Using a smaller amount of polyester fibrefill so the piece stays flat and flexible.' },
    { slug: 'safety-eyes-nw', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-nw', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
    { slug: 'surface-embroidery-nw', term: 'Surface embroidery', definition: 'Stitching worked directly onto the finished crochet fabric to add the orange spot markings.' },
  ],
  finishedSizeText: 'Approx. 20 cm from nose to tail tip. Body width approx. 5 cm.',
  sourceNotes: 'Amigurumi newt is a small amphibian toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This newt has a capsule body, sphere head, four short legs, and a cylinder tail. The orange spots are added after assembly. All pieces start with a '), gt('magic-ring-nw', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${newtTotal} g of dark brown DK and a small amount of orange for the spots. The spots are added with `), gt('surface-embroidery-nw', 'surface embroidery'), t(' once all pieces are joined.')),
      h2('Head'),
      p(t(`Work a ${newtHead.finishedDimensionsCm.width} cm sphere (${newtHead.totalRounds} rounds). Fit `), gt('safety-eyes-nw', 'safety eyes'), t(` at round ${Math.round(newtHead.totalRounds * 0.4)} before closing.`)),
      h2('Body'),
      p(t(`Work a ${newtBody.finishedDimensionsCm.width} cm diameter by ${newtBody.finishedDimensionsCm.height ?? 10} cm capsule (${newtBody.totalRounds} rounds). Use `), gt('stuffing-nw', 'light stuffing'), t(' so the body lies flat.')),
      h2('Legs (make 4)'),
      p(t(`Work a ${newtLeg.finishedDimensionsCm.width} cm diameter by ${newtLeg.finishedDimensionsCm.height ?? 3.5} cm capsule (${newtLeg.totalRounds} rounds). Use `), gt('dc2tog-nw', 'dc2tog'), t(' to close the foot end. No stuffing needed.')),
      h2('Tail'),
      p(t(`Work a ${newtTail.finishedDimensionsCm.width} cm diameter by ${newtTail.finishedDimensionsCm.height ?? 7} cm cylinder (${newtTail.totalRounds} rounds). Taper the last four rounds with one decrease per round.`)),
      h2('Assembly'),
      p(t('Sew head to the front of the body using '), gt('ladder-stitch-nw', 'ladder stitch'), t('. Attach the tail to the rear. Pin legs to each side. Once all pieces are joined, embroider the orange spots across the body and tail.')),
      h2('What to try next'),
      p(t('The amigurumi salamander uses the same flat layout in a solid bright orange without the spot step.')),
    ],
  },
},
// ── A190 ── Komodo Dragon ─────────────────────────────────────────────────────
{
  slug: 'amigurumi-komodo-dragon',
  title: 'Amigurumi komodo dragon',
  subtitle: 'A grey komodo dragon with a heavy capsule body and powerful legs.',
  excerpt: 'A grey amigurumi komodo dragon in DK yarn. Oval head, large capsule body, four sturdy capsule legs, and a thick cylinder tail. Approx. 32 cm nose to tail.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-joining', 'amigurumi-surface-embroidery'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining'],
  aliases: ['crochet komodo dragon amigurumi', 'komodo dragon stuffed toy', 'grey lizard crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-kd', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pulling the tail closes the centre hole so no gap shows.' },
    { slug: 'dc2tog-kd', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to close each piece at the decrease end.' },
    { slug: 'stuffing-kd', term: 'Firm stuffing', definition: 'Packing polyester fibrefill tightly enough that the body and tail hold their shape.' },
    { slug: 'safety-eyes-kd', term: 'Safety eyes', definition: 'Plastic eyes with a washer-lock back. Fit before the opening is too small to reach inside.' },
    { slug: 'ladder-stitch-kd', term: 'Ladder stitch', definition: 'A mattress-style join worked from the outside. Pulls almost invisible once the yarn is tensioned.' },
    { slug: 'surface-embroidery-kd', term: 'Surface embroidery', definition: 'Stitching worked directly onto the finished crochet fabric to add scale texture across the body.' },
  ],
  finishedSizeText: 'Approx. 32 cm from nose to tail tip. Body width approx. 8 cm.',
  sourceNotes: 'Amigurumi komodo dragon is a large reptile toy design. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This komodo dragon has an oval head, a large capsule body, four sturdy legs, and a thick tail. All pieces start with a '), gt('magic-ring-kd', 'magic ring'), t('.')),
      h2('Yarn and yarn amounts'),
      p(t(`You need approx. ${komodoTotal} g of grey DK. Add scale texture using `), gt('surface-embroidery-kd', 'surface embroidery'), t(' in a slightly darker grey across the back and sides.')),
      h2('Head'),
      p(t(`Work a ${komodoHead.finishedDimensionsCm.width} cm by ${komodoHead.finishedDimensionsCm.height ?? 6} cm oval (${komodoHead.totalRounds} rounds). Fit `), gt('safety-eyes-kd', 'safety eyes'), t(` at round ${Math.round(komodoHead.totalRounds * 0.4)} before closing. Stuff with `), gt('stuffing-kd', 'firm stuffing'), t('.')),
      h2('Body'),
      p(t(`Work a ${komodoBody.finishedDimensionsCm.width} cm diameter by ${komodoBody.finishedDimensionsCm.height ?? 14} cm capsule (${komodoBody.totalRounds} rounds). Stuff firmly.`)),
      h2('Legs (make 4)'),
      p(t(`Work a ${komodoLeg.finishedDimensionsCm.width} cm diameter by ${komodoLeg.finishedDimensionsCm.height ?? 5} cm capsule (${komodoLeg.totalRounds} rounds). Use `), gt('dc2tog-kd', 'dc2tog'), t(' to close the foot end.')),
      h2('Tail'),
      p(t(`Work a ${komodoTail.finishedDimensionsCm.width} cm diameter by ${komodoTail.finishedDimensionsCm.height ?? 12} cm cylinder (${komodoTail.totalRounds} rounds). Taper the final six rounds with one decrease per round.`)),
      h2('Assembly'),
      p(t('Sew head to the front of the body using '), gt('ladder-stitch-kd', 'ladder stitch'), t('. Attach tail to the rear. Pin all four legs to the underside so the dragon lies flat before sewing. Add scale embroidery last.')),
      h2('What to try next'),
      p(t('The amigurumi crocodile uses the same flat-lying frame with a narrower body and a longer pointed head.')),
    ],
  },
},
]

for (const pattern of PATTERNS) {
  const {
    slug, title, subtitle, excerpt, difficulty, techniqueSlugs, criticalTechniques,
    aliases, glossaryTerms, finishedSizeText, sourceNotes, body,
  } = pattern

  const out = {
    slug,
    title,
    subtitle,
    excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'amigurumi',
    difficulty,
    sourceType: 'SYNTHESISED',
    sourceNotes,
    techniqueSlugs,
    criticalTechniques,
    aliases,
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText,
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  }

  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}.json`)
}

console.log(`\nDone. ${PATTERNS.length} patterns written to ${OUT}`)
