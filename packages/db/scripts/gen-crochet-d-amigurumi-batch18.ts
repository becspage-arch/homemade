/**
 * Generator: D-Amigurumi Batch 18 -- A171-A180 mini keychain amigurumi
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch18.ts
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

const GAUGE = { stitchesPer10cm: 32, rowsPer10cm: 36 }
const GAUGE_TEXT = '32 dc x 36 rows = 10 x 10 cm in fingering yarn on a 3.5 mm hook, giving 6-8 cm finished pieces.'

// Shape data
const bearHead = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Head' })
const bearBody = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Body' })
const catHead = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Head' })
const catBody = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Body' })
const catEar = cone({ baseDiameterCm: 1.2, heightCm: 1, gauge: GAUGE, label: 'Ear' })
const bunnyHead = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Head' })
const bunnyBody = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Body' })
const bunnyEar = capsule({ diameterCm: 0.8, lengthCm: 2.5, gauge: GAUGE, label: 'Ear' })
const starPoint = cone({ baseDiameterCm: 1.5, heightCm: 2, gauge: GAUGE, label: 'Star Point' })
const heartHalf = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Heart Half' })
const mushCap = sphere({ diameterCm: 4, gauge: GAUGE, label: 'Cap' })
const mushStem = cylinder({ diameterCm: 1.8, heightCm: 2.5, gauge: GAUGE, label: 'Stem' })
const avocBody = pear({ maxDiameterCm: 4, topDiameterCm: 2.5, heightCm: 5, gauge: GAUGE, label: 'Body' })
const avocSeed = oval({ longAxisCm: 2, shortAxisCm: 1.5, gauge: GAUGE, label: 'Seed' })
const ghostTop = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'Upper Body' })
const ghostBase = oval({ longAxisCm: 4, shortAxisCm: 3.5, gauge: GAUGE, label: 'Lower Body' })
const whaleBody = oval({ longAxisCm: 5, shortAxisCm: 3, gauge: GAUGE, label: 'Body' })
const beeBody = oval({ longAxisCm: 4, shortAxisCm: 2.5, gauge: GAUGE, label: 'Body' })
const beeWing = oval({ longAxisCm: 2.5, shortAxisCm: 1.5, gauge: GAUGE, label: 'Wing' })

const PATTERNS = [
  // A171: amigurumi-mini-bear
  {
    slug: 'amigurumi-mini-bear',
    title: 'Mini bear keychain',
    excerpt: 'A tiny crocheted bear that clips onto a bag or keys. Worked in fingering yarn on a 3.5 mm hook for a 6 cm finished bear. Beginner-friendly with just a sphere head and oval body.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet bear', 'keychain bear pattern', 'mini amigurumi bear'],
    glossaryTerms: [
      { slug: 'magic-ring-a171', term: 'Magic ring', definition: 'An adjustable loop start that closes to a tiny hole-free centre. Essential for amigurumi rounds.' },
      { slug: 'dc2tog-a171', term: 'Dc2tog', definition: 'Double crochet two stitches together. The decrease that closes the body pieces of this bear.' },
      { slug: 'invisible-finish-a171', term: 'Invisible finish', definition: 'A needle technique that hides the final slip stitch by mimicking a regular double crochet, leaving a seamless closing round.' },
    ],
    finishedSizeText: 'Approx. 6 cm tall including ears. Head: ' + bearHead.finishedDimensionsCm.width + ' cm wide. Body: ' + bearBody.finishedDimensionsCm.width + ' cm wide.',
    sourceNotes: 'Classic amigurumi bear construction synthesised from standard sphere-plus-oval keychain patterns.',
    body: {
      type: 'doc', content: [
        h2('Head'),
        p(t('Start with a '), gt('magic-ring-a171', 'magic ring'), t('. Round 1: 6 dc into the ring. Round 2: 2 dc in each st (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (dc, dc, 2 dc in next) x 6 (24 sts). Rounds 5-7: dc around. Round 8: (dc, dc, '), gt('dc2tog-a171', 'dc2tog'), t(') x 6 (18 sts). Stuff firmly. Round 9: (dc, dc2tog) x 6 (12 sts). Round 10: dc2tog x 6 (6 sts). Apply '), gt('invisible-finish-a171', 'invisible finish'), t(' and close.')),
        h2('Body'),
        p(t('Start with a magic ring. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Rounds 4-6: dc around. Round 7: (dc, dc2tog) x 6 (12 sts). Stuff. Round 8: dc2tog x 6 (6 sts). Close.')),
        h2('Ears (make 2)'),
        p(t('Magic ring, 6 dc. Round 2: 2 dc in each (12 sts). Slip stitch to close. Leave a tail for sewing.')),
        h2('Assembly'),
        p(t('Sew the head to the top of the body. Sew ears to the top of the head at 10 and 2 o\'clock. Embroider a small nose and two French-knot eyes. Attach a jump ring and keychain clip through the top of the head.')),
      ],
    },
  },

  // A172: amigurumi-mini-cat
  {
    slug: 'amigurumi-mini-cat',
    title: 'Mini cat keychain',
    excerpt: 'A tiny crocheted cat with pointed cone ears that clips to keys or a bag strap. Worked in fingering yarn for a 7 cm finished piece. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet cat', 'keychain cat pattern', 'mini amigurumi cat'],
    glossaryTerms: [
      { slug: 'magic-ring-a172', term: 'Magic ring', definition: 'An adjustable loop start that closes to a tiny hole-free centre. Essential for all amigurumi pieces.' },
      { slug: 'dc2tog-a172', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at every decrease round on this cat.' },
      { slug: 'invisible-finish-a172', term: 'Invisible finish', definition: 'A needle technique that hides the final slip stitch, leaving a seamless closed top on each piece.' },
    ],
    finishedSizeText: 'Approx. 7 cm tall. Head: ' + catHead.finishedDimensionsCm.width + ' cm wide. Body: ' + catBody.finishedDimensionsCm.width + ' cm wide.',
    sourceNotes: 'Classic amigurumi cat construction synthesised from standard mini keychain patterns.',
    body: {
      type: 'doc', content: [
        h2('Head'),
        p(t('Start with a '), gt('magic-ring-a172', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Rounds 5-7: dc around. Round 8: (2 dc, '), gt('dc2tog-a172', 'dc2tog'), t(') x 6 (18 sts). Stuff. Round 9: (dc, dc2tog) x 6 (12 sts). Round 10: dc2tog x 6. Apply '), gt('invisible-finish-a172', 'invisible finish'), t(' and close.')),
        h2('Body'),
        p(t('Magic ring, 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Rounds 4-7: dc around. Round 8: (dc, dc2tog) x 6 (12 sts). Stuff. Round 9: dc2tog x 6. Close.')),
        h2('Ears (make 2)'),
        p(t('Magic ring, 6 dc. Round 2: (dc, 2 dc in next) x 3 (9 sts). Round 3: dc around. Slip stitch and close leaving a sewing tail.')),
        h2('Assembly'),
        p(t('Sew head to body. Pin cone ears to the top corners of the head and sew in place. Embroider a small nose, a V-shaped mouth, and two safety-eye-style circles. Attach a keychain clip.')),
      ],
    },
  },

  // A173: amigurumi-mini-bunny
  {
    slug: 'amigurumi-mini-bunny',
    title: 'Mini bunny keychain',
    excerpt: 'A tiny crocheted bunny with long capsule ears. Worked in fingering yarn on a 3.5 mm hook for a 7 cm finished piece. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet bunny', 'keychain bunny pattern', 'mini amigurumi rabbit'],
    glossaryTerms: [
      { slug: 'magic-ring-a173', term: 'Magic ring', definition: 'An adjustable loop start. Gives amigurumi pieces a closed centre with no gap.' },
      { slug: 'dc2tog-a173', term: 'Dc2tog', definition: 'Double crochet two together. Reduces stitch count at the closing rounds of each piece.' },
      { slug: 'invisible-finish-a173', term: 'Invisible finish', definition: 'A needle technique that threads back through the final round, mimicking a regular stitch and hiding the join.' },
    ],
    finishedSizeText: 'Approx. 7 cm tall including ears. Head: ' + bunnyHead.finishedDimensionsCm.width + ' cm wide. Ear length: ' + bunnyEar.finishedDimensionsCm.height + ' cm.',
    sourceNotes: 'Standard amigurumi bunny construction synthesised from classic mini keychain patterns.',
    body: {
      type: 'doc', content: [
        h2('Head'),
        p(t('Start with a '), gt('magic-ring-a173', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Rounds 5-7: dc around. Round 8: (2 dc, '), gt('dc2tog-a173', 'dc2tog'), t(') x 6 (18 sts). Stuff. Round 9: (dc, dc2tog) x 6 (12 sts). Round 10: dc2tog x 6. Apply '), gt('invisible-finish-a173', 'invisible finish'), t('. Close.')),
        h2('Body'),
        p(t('Magic ring, 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Rounds 4-7: dc around. Round 8: (dc, dc2tog) x 6 (12 sts). Stuff. Round 9: dc2tog x 6. Close.')),
        h2('Ears (make 2)'),
        p(t('Magic ring, 4 dc. Work in rounds of 4 dc for 8 rounds (giving a long, slender tube). Flatten the opening and slip stitch through both layers to close. Leave a sewing tail.')),
        h2('Assembly'),
        p(t('Sew ears to the top of the head, side by side. Sew head to body. Embroider a small nose and two dot eyes. Attach a jump ring and keychain clip at the top of the head.')),
      ],
    },
  },

  // A174: amigurumi-mini-star
  {
    slug: 'amigurumi-mini-star',
    title: 'Mini star keychain',
    excerpt: 'A tiny five-point crocheted star that works as a keychain or bag charm. Five cone points joined to a small flat disc centre. Finished size about 6 cm across. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring'],
    aliases: ['tiny crochet star', 'crochet star keychain', 'mini amigurumi star'],
    glossaryTerms: [
      { slug: 'magic-ring-a174', term: 'Magic ring', definition: 'An adjustable loop start used to begin each cone point and the centre disc without a gap at the centre.' },
      { slug: 'slip-stitch-join-a174', term: 'Slip stitch join', definition: 'A slip stitch used to attach each finished point to the centre disc before the final round closes them in place.' },
      { slug: 'dc2tog-a174', term: 'Dc2tog', definition: 'Double crochet two together. Used on the last round of each point to taper the tip.' },
    ],
    finishedSizeText: 'Approx. 6 cm across point to point. Each point: ' + starPoint.finishedDimensionsCm.width + ' cm base.',
    sourceNotes: 'Classic crochet star construction synthesised from standard five-point amigurumi charm patterns.',
    body: {
      type: 'doc', content: [
        h2('Points (make 5)'),
        p(t('Start with a '), gt('magic-ring-a174', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: dc around. Round 5: (dc, '), gt('dc2tog-a174', 'dc2tog'), t(') x 6 (12 sts). Round 6: dc2tog x 6 (6 sts). Leave open. Lightly stuff. Do not close.')),
        h2('Centre disc'),
        p(t('Magic ring, 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Chain 1, do not join.')),
        h2('Assembly'),
        p(t('Space the five points evenly around the centre disc. Use a '), gt('slip-stitch-join-a174', 'slip stitch join'), t(' to attach the open base of each point to the edge of the disc, working one per section. Thread the sewing tail through the remaining 6 sts at each tip and pull tight. Weave in all ends. Attach a keychain clip to one point tip.')),
      ],
    },
  },

  // A175: amigurumi-mini-heart
  {
    slug: 'amigurumi-mini-heart',
    title: 'Mini heart keychain',
    excerpt: 'A tiny crocheted heart made from two small spheres joined and pinched at the bottom. About 5 cm wide. A sweet bag charm or gift tag. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet heart', 'crochet heart keychain', 'mini amigurumi heart'],
    glossaryTerms: [
      { slug: 'magic-ring-a175', term: 'Magic ring', definition: 'An adjustable loop start used to begin each sphere half of the heart.' },
      { slug: 'dc2tog-a175', term: 'Dc2tog', definition: 'Double crochet two together. Closes the sphere halves and forms the pointed bottom of the heart.' },
      { slug: 'invisible-finish-a175', term: 'Invisible finish', definition: 'Threads the tail through the final round stitches so the closed top of each half looks seamless.' },
    ],
    finishedSizeText: 'Approx. 5 cm wide x 4 cm tall. Each half: ' + heartHalf.finishedDimensionsCm.width + ' cm wide.',
    sourceNotes: 'Two-sphere heart construction is a standard amigurumi technique for small heart charms.',
    body: {
      type: 'doc', content: [
        h2('Halves (make 2)'),
        p(t('Start with a '), gt('magic-ring-a175', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Rounds 4-5: dc around. Round 6: (dc, '), gt('dc2tog-a175', 'dc2tog'), t(') x 6 (12 sts). Stuff lightly. Round 7: dc2tog x 6 (6 sts). Apply '), gt('invisible-finish-a175', 'invisible finish'), t(' and close. Leave a long sewing tail on the first half only.')),
        h2('Joining'),
        p(t('Hold the two halves side by side with closed tops uppermost. Whip stitch them together along about two thirds of the top edge, leaving the lower third open. Push both pieces gently together and pinch the bottom to form a point. Stitch through both layers at the pinch point to hold the heart shape. Attach a keychain clip at the centre top between the two humps.')),
      ],
    },
  },

  // A176: amigurumi-mini-mushroom
  {
    slug: 'amigurumi-mini-mushroom',
    title: 'Mini mushroom keychain',
    excerpt: 'A tiny crocheted toadstool with a round red cap and cream stem. About 7 cm tall. Classic keychain charm worked in two pieces. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet mushroom', 'crochet toadstool keychain', 'mini amigurumi toadstool'],
    glossaryTerms: [
      { slug: 'magic-ring-a176', term: 'Magic ring', definition: 'An adjustable loop start that closes the top of the mushroom cap with no visible gap.' },
      { slug: 'dc2tog-a176', term: 'Dc2tog', definition: 'Double crochet two together. Closes the lower edge of the cap so it cups down around the stem.' },
      { slug: 'invisible-finish-a176', term: 'Invisible finish', definition: 'A needle technique that hides the closing slip stitch on the stem and cap.' },
    ],
    finishedSizeText: 'Approx. 7 cm tall. Cap: ' + mushCap.finishedDimensionsCm.width + ' cm wide. Stem: ' + mushStem.finishedDimensionsCm.width + ' cm wide.',
    sourceNotes: 'Standard amigurumi mushroom construction synthesised from classic toadstool charm patterns.',
    body: {
      type: 'doc', content: [
        h2('Cap'),
        p(t('In red yarn, start with a '), gt('magic-ring-a176', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Round 5: (3 dc, 2 dc in next) x 6 (30 sts). Rounds 6-8: dc around. Round 9: (3 dc, '), gt('dc2tog-a176', 'dc2tog'), t(') x 6 (24 sts). Round 10: (2 dc, dc2tog) x 6 (18 sts). Do not stuff yet. Leave open.')),
        h2('Stem'),
        p(t('In cream yarn, magic ring 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Rounds 4-10: dc around. Round 11: (dc, dc2tog) x 6 (12 sts). Stuff. Apply '), gt('invisible-finish-a176', 'invisible finish'), t(' and close.')),
        h2('Assembly'),
        p(t('Insert the open top of the stem into the open base of the cap. Stuff the cap lightly. Whip stitch the remaining opening of the cap firmly around the stem. Embroider small white spots on the cap with a tapestry needle and contrast yarn. Attach a keychain clip to the top of the stem through the magic ring.')),
      ],
    },
  },

  // A177: amigurumi-mini-avocado
  {
    slug: 'amigurumi-mini-avocado',
    title: 'Mini avocado keychain',
    excerpt: 'A tiny crocheted avocado with a pear-shaped dark green body and a cream interior showing a round seed. About 7 cm tall. Beginner keychain charm.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet avocado', 'crochet avocado keychain', 'mini amigurumi avocado'],
    glossaryTerms: [
      { slug: 'magic-ring-a177', term: 'Magic ring', definition: 'An adjustable loop start used to begin the pear-shaped body and the oval seed.' },
      { slug: 'dc2tog-a177', term: 'Dc2tog', definition: 'Double crochet two together. Shapes the neck of the pear body and closes the seed.' },
      { slug: 'invisible-finish-a177', term: 'Invisible finish', definition: 'A needle technique that closes the final round of the body and seed without a visible knot.' },
    ],
    finishedSizeText: 'Approx. 7 cm tall. Body: ' + avocBody.finishedDimensionsCm.width + ' cm wide at widest. Seed: ' + avocSeed.finishedDimensionsCm.width + ' cm wide.',
    sourceNotes: 'Pear-body avocado construction synthesised from standard amigurumi fruit keychain patterns.',
    body: {
      type: 'doc', content: [
        h2('Outer body'),
        p(t('In dark green yarn, start with a '), gt('magic-ring-a177', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Rounds 5-9: dc around. Round 10: (2 dc, '), gt('dc2tog-a177', 'dc2tog'), t(') x 6 (18 sts). Round 11: (dc, dc2tog) x 6 (12 sts). Change to light green for the interior section. Rounds 12-14: dc around (12 sts). Stuff. Apply '), gt('invisible-finish-a177', 'invisible finish'), t(' and close.')),
        h2('Seed'),
        p(t('In brown yarn, magic ring 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Rounds 4-5: dc around. Round 6: (dc, dc2tog) x 6 (12 sts). Stuff. Round 7: dc2tog x 6. Close.')),
        h2('Assembly'),
        p(t('Sew the seed to the centre of the light green interior. Attach a keychain clip through the top of the body at the magic ring.')),
      ],
    },
  },

  // A178: amigurumi-mini-ghost
  {
    slug: 'amigurumi-mini-ghost',
    title: 'Mini ghost keychain',
    excerpt: 'A tiny crocheted white ghost with a rounded top and wavy hem. About 7 cm tall. Works as a keychain charm or Halloween decoration. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet ghost', 'crochet ghost keychain', 'mini amigurumi ghost'],
    glossaryTerms: [
      { slug: 'magic-ring-a178', term: 'Magic ring', definition: 'An adjustable loop start used at the top of the ghost body to give a seamless rounded head.' },
      { slug: 'dc2tog-a178', term: 'Dc2tog', definition: 'Double crochet two together. Shapes the body taper below the head.' },
      { slug: 'slip-stitch-a178', term: 'Slip stitch', definition: 'A zero-height stitch used to work the wavy hem points around the base of the ghost.' },
    ],
    finishedSizeText: 'Approx. 7 cm tall. Upper body: ' + ghostTop.finishedDimensionsCm.width + ' cm wide. Lower body: ' + ghostBase.finishedDimensionsCm.width + ' cm wide.',
    sourceNotes: 'One-piece ghost body construction synthesised from standard amigurumi ghost charm patterns.',
    body: {
      type: 'doc', content: [
        h2('Body'),
        p(t('In white yarn, start with a '), gt('magic-ring-a178', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Rounds 5-9: dc around. Round 10: 2 dc in each of first 6 sts, dc to end (30 sts). Rounds 11-13: dc around. Do not decrease. Leave open and stuff.')),
        h2('Hem'),
        p(t('Work the wavy hem around the open base. (Chain 3, '), gt('slip-stitch-a178', 'slip stitch'), t(' in next 2 sts) repeat around to form five small points. Slip stitch to join and fasten off.')),
        h2('Finishing'),
        p(t('Embroider two oval eyes and a small O mouth in black yarn using a '), gt('dc2tog-a178', 'dc2tog'), t(' tension to keep the stitches snug. Attach a keychain clip through the magic ring at the top.')),
      ],
    },
  },

  // A179: amigurumi-mini-whale
  {
    slug: 'amigurumi-mini-whale',
    title: 'Mini whale keychain',
    excerpt: 'A tiny crocheted blue whale with a flat tail fin and side flippers. About 6 cm long. Worked as a single oval body with attached fins. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet whale', 'crochet whale keychain', 'mini amigurumi whale'],
    glossaryTerms: [
      { slug: 'magic-ring-a179', term: 'Magic ring', definition: 'An adjustable loop start used to begin the whale body and each fin piece.' },
      { slug: 'dc2tog-a179', term: 'Dc2tog', definition: 'Double crochet two together. Tapers the nose and tail ends of the oval body.' },
      { slug: 'invisible-finish-a179', term: 'Invisible finish', definition: 'A needle technique that closes the whale body and fins without a visible join.' },
    ],
    finishedSizeText: 'Approx. 6 cm long x 3 cm tall. Body: ' + whaleBody.finishedDimensionsCm.width + ' cm long.',
    sourceNotes: 'Oval-body whale construction synthesised from standard amigurumi ocean creature keychain patterns.',
    body: {
      type: 'doc', content: [
        h2('Body'),
        p(t('In blue yarn, start with a '), gt('magic-ring-a179', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Rounds 5-10: dc around. Round 11: (2 dc, '), gt('dc2tog-a179', 'dc2tog'), t(') x 6 (18 sts). Round 12: (dc, dc2tog) x 6 (12 sts). Stuff. Apply '), gt('invisible-finish-a179', 'invisible finish'), t(' and close.')),
        h2('Tail fin'),
        p(t('Chain 8. Dc in 2nd chain from hook, dc to end (7 sts). Work 2 more rows dc. Fold in half and slip stitch the two short ends together to form a V-shape tail. Leave a sewing tail.')),
        h2('Flippers (make 2)'),
        p(t('Magic ring, 6 dc. Round 2: (dc, 2 dc in next) x 3 (9 sts). Slip stitch to close. Leave a sewing tail.')),
        h2('Assembly'),
        p(t('Sew the tail fin to the narrow end of the body. Sew one flipper to each side, roughly one third of the way from the nose end. Embroider a small eye on each side. Embroider a curved spout line on the top. Attach a keychain clip to the top of the body.')),
      ],
    },
  },

  // A180: amigurumi-mini-bee
  {
    slug: 'amigurumi-mini-bee',
    title: 'Mini bee keychain',
    excerpt: 'A tiny crocheted bee with yellow and black stripes and two oval wings. About 6 cm long. Classic striped oval body keychain charm. Beginner.',
    techniqueSlugs: ['magic-ring', 'crocheting-in-the-round', 'invisible-finish', 'amigurumi-assembly', 'tapestry-crochet'],
    criticalTechniques: ['magic-ring', 'crocheting-in-the-round'],
    aliases: ['tiny crochet bee', 'crochet bee keychain', 'mini amigurumi bee'],
    glossaryTerms: [
      { slug: 'magic-ring-a180', term: 'Magic ring', definition: 'An adjustable loop start used to begin the bee body and each wing.' },
      { slug: 'dc2tog-a180', term: 'Dc2tog', definition: 'Double crochet two together. Closes the oval body at both ends.' },
      { slug: 'invisible-finish-a180', term: 'Invisible finish', definition: 'A needle technique that hides the final closing stitch on the body and wings.' },
      { slug: 'colour-change-a180', term: 'Colour change', definition: 'Swapping yarn mid-round by drawing the new colour through the final pull-up of the last stitch before the change.' },
    ],
    finishedSizeText: 'Approx. 6 cm long. Body: ' + beeBody.finishedDimensionsCm.width + ' cm long. Wing: ' + beeWing.finishedDimensionsCm.width + ' cm long.',
    sourceNotes: 'Striped oval-body bee construction synthesised from standard amigurumi insect keychain patterns.',
    body: {
      type: 'doc', content: [
        h2('Body'),
        p(t('In yellow yarn, start with a '), gt('magic-ring-a180', 'magic ring'), t('. Round 1: 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: (2 dc, 2 dc in next) x 6 (24 sts). Apply '), gt('colour-change-a180', 'colour change'), t(' to black at the end of round 4. Rounds 5-6: dc in black. Colour change to yellow. Rounds 7-8: dc in yellow. Colour change to black. Rounds 9-10: dc in black. Colour change to yellow. Round 11: (2 dc, '), gt('dc2tog-a180', 'dc2tog'), t(') x 6 (18 sts). Round 12: (dc, dc2tog) x 6 (12 sts). Stuff. Apply '), gt('invisible-finish-a180', 'invisible finish'), t(' and close.')),
        h2('Wings (make 2)'),
        p(t('In white yarn, magic ring 6 dc. Round 2: 2 dc in each (12 sts). Round 3: (dc, 2 dc in next) x 6 (18 sts). Round 4: dc around. Slip stitch to close.')),
        h2('Assembly'),
        p(t('Sew wings side by side on the top of the body. Embroider two small black dot eyes near the yellow nose end. Add two short black antenna lines with a tapestry needle. Attach a keychain clip through the magic ring at the nose end.')),
      ],
    },
  },
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: '',
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: pat.sourceNotes,
    techniqueSlugs: pat.techniqueSlugs,
    criticalTechniques: pat.criticalTechniques,
    aliases: pat.aliases,
    glossaryTerms: pat.glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: GAUGE_TEXT,
      finishedSizeText: pat.finishedSizeText,
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
  }
  const filePath = join(OUT, `${pat.slug}.json`)
  writeFileSync(filePath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${pat.slug}.json`)
}

console.log('Done. 10 patterns written.')
