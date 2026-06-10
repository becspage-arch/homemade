/**
 * Generator: D-Amigurumi Batch 10 -- A91-A100 insects and bugs
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch10.ts
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

// ── A91 Ladybird ────────────────────────────────────────────────────────────
const a91Body = sphere({ diameterCm: 7, gauge: GAUGE, label: 'body' })
const a91Head = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'head' })

// ── A92 Bumble Bee ───────────────────────────────────────────────────────────
const a92Body = oval({ longAxisCm: 7, shortAxisCm: 4.5, gauge: GAUGE, label: 'body' })
const a92Wing = oval({ longAxisCm: 4, shortAxisCm: 2, gauge: GAUGE, label: 'wing' })
const a92Stinger = cone({ baseDiameterCm: 1.5, heightCm: 2, gauge: GAUGE, label: 'stinger' })

// ── A93 Butterfly ────────────────────────────────────────────────────────────
const a93Body = oval({ longAxisCm: 7, shortAxisCm: 2.5, gauge: GAUGE, label: 'body' })
const a93UpperWing = oval({ longAxisCm: 5, shortAxisCm: 3.5, gauge: GAUGE, label: 'upper wing' })
const a93LowerWing = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'lower wing' })

// ── A94 Caterpillar ─────────────────────────────────────────────────────────
const a94Seg = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'body segment' })
const a94Head = sphere({ diameterCm: 4, gauge: GAUGE, label: 'head' })
const a94Antenna = cone({ baseDiameterCm: 0.8, heightCm: 2, gauge: GAUGE, label: 'antenna' })

// ── A95 Dragonfly ────────────────────────────────────────────────────────────
const a95Body = capsule({ diameterCm: 2.5, lengthCm: 9, gauge: GAUGE, label: 'body' })
const a95Wing = oval({ longAxisCm: 6, shortAxisCm: 2, gauge: GAUGE, label: 'wing' })
const a95Head = sphere({ diameterCm: 3, gauge: GAUGE, label: 'head' })

// ── A96 Snail ────────────────────────────────────────────────────────────────
const a96Shell = sphere({ diameterCm: 5, gauge: GAUGE, label: 'shell' })
const a96Body = oval({ longAxisCm: 6, shortAxisCm: 2.5, gauge: GAUGE, label: 'body' })
const a96Antenna = cone({ baseDiameterCm: 0.6, heightCm: 2.5, gauge: GAUGE, label: 'antenna' })

// ── A97 Grasshopper ─────────────────────────────────────────────────────────
const a97Body = capsule({ diameterCm: 3, lengthCm: 8, gauge: GAUGE, label: 'body' })
const a97Leg = cylinder({ diameterCm: 0.8, heightCm: 5, gauge: GAUGE, label: 'leg' })
const a97Head = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'head' })

// ── A98 Ant ──────────────────────────────────────────────────────────────────
const a98Head = sphere({ diameterCm: 3, gauge: GAUGE, label: 'head' })
const a98Thorax = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'thorax' })
const a98Abdomen = sphere({ diameterCm: 4, gauge: GAUGE, label: 'abdomen' })
const a98Leg = cylinder({ diameterCm: 0.6, heightCm: 3.5, gauge: GAUGE, label: 'leg' })

// ── A99 Spider ───────────────────────────────────────────────────────────────
const a99Body = sphere({ diameterCm: 5, gauge: GAUGE, label: 'body' })
const a99Head = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'head' })
const a99Leg = cylinder({ diameterCm: 0.7, heightCm: 6, gauge: GAUGE, label: 'leg' })

// ── A100 Firefly ─────────────────────────────────────────────────────────────
const a100Body = oval({ longAxisCm: 6, shortAxisCm: 3, gauge: GAUGE, label: 'body' })
const a100Wing = oval({ longAxisCm: 4.5, shortAxisCm: 2, gauge: GAUGE, label: 'wing' })
const a100Tail = capsule({ diameterCm: 1.2, lengthCm: 2.5, gauge: GAUGE, label: 'tail' })

const PATTERNS = [
// ── A91 Ladybird ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-ladybird',
  title: 'Amigurumi ladybird',
  subtitle: '',
  excerpt: 'A round red ladybird in dk yarn. The domed body works up in a single sphere with a flat base; black spots are added with duplicate stitch after stuffing. Approx 8 cm tall.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-colour-change', 'amigurumi-surface-detail'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds'],
  aliases: ['crochet ladybird', 'crochet ladybug amigurumi', 'beginner bug amigurumi'],
  glossaryTerms: [
    { slug: 'magic-ring-a91', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces. You wrap the yarn around your fingers, work your first round of stitches into the loop, then pull the tail to close the opening completely. This avoids the small hole left by a conventional starting chain.' },
    { slug: 'flat-base-a91', term: 'Flat base', definition: 'A technique for giving a sphere a stable sitting surface. Instead of decreasing evenly all the way to 6 stitches at the base, the final rows are worked through the back loop only. This creates a natural ridge that causes the base to sit flat rather than curving under.' },
    { slug: 'duplicate-stitch-a91', term: 'Duplicate stitch', definition: 'A surface embroidery technique worked with a tapestry needle after the piece is stuffed and closed. The needle traces the path of an existing stitch using a contrasting yarn colour, creating a new stitch on top. Used here to add black spots to the finished body without changing colours mid-round.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Sphere-body ladybirds are among the most widely made beginner amigurumi; construction details are synthesised from common open-source amigurumi practice.',
  finishedSizeText: 'Approx 8 cm tall x 7 cm wide.',
  body: {
    type: 'doc', content: [
      p(t('Start the body with a '), gt('magic-ring-a91', 'magic ring'), t('. Work 6 dc into the ring and pull closed. Increase by 6 stitches each round until you reach '), t(`${a91Body.rowByRow.find(r => r.stitchCount === Math.max(...a91Body.rowByRow.map(r => r.stitchCount)))?.stitchCount ?? 42} stitches`), t('. Work straight for 2 rounds, then begin decreasing. Before the final closure, apply the '), gt('flat-base-a91', 'flat base'), t(' technique to the last 3 rows.')),
      p(t(`Body (${a91Body.totalRounds} rounds): work a ${a91Body.finishedDimensionsCm.width} cm sphere, stuffing firmly before the last 4 rounds.`)),
      p(t(`Head (${a91Head.totalRounds} rounds): work a ${a91Head.finishedDimensionsCm.width} cm sphere.`)),
      h2('Rounds at a glance'),
      p(t('Round 1: 6 dc in magic ring. Rounds 2 onward: follow increase pattern adding 6 dc per round until equator, then decrease to match. See round-by-round table below.')),
      h2('Spots'),
      p(t('Cut 1 m of black yarn. Thread onto a tapestry needle. Use '), gt('duplicate-stitch-a91', 'duplicate stitch'), t(' to work 7 round spots across the upper body: 2 near the head, 4 across the middle, 1 near the base. Each spot covers 2 x 2 stitches in a rough circle.')),
      h2('Head and features'),
      p(t('Attach the head sphere at the front of the body. Embroider two eyes in black. Work a short chain stitch smile in black.')),
      h2('Assembly'),
      p(t('Pin the head to the body and stitch in place with the tapestry needle. Weave in all ends.')),
      h2('What to try next'),
      p(t('The bumble bee uses a striped oval body and adds cone stinger and oval wings as separate pieces.')),
    ],
  },
},
// ── A92 Bumble Bee ────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-bumble-bee',
  title: 'Amigurumi bumble bee',
  subtitle: '',
  excerpt: 'A chubby bumble bee in yellow and black dk yarn. The oval body is worked in alternating stripes; oval wings and a cone stinger are added as separate pieces. Approx 9 cm long.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-colour-change', 'amigurumi-joining-pieces'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-colour-change'],
  aliases: ['crochet bumble bee amigurumi', 'crochet bee toy', 'amigurumi bee pattern'],
  glossaryTerms: [
    { slug: 'stripe-carry-a92', term: 'Stripe carry', definition: 'A method of managing two yarn colours in the same piece without cutting between stripes. The unused colour is carried loosely on the inside of the work. At the colour change, you drop the old colour and pick up the carried strand to begin the new stripe. The carried yarn stays hidden inside the stuffed body.' },
    { slug: 'safety-eye-a92', term: 'Safety eye', definition: 'A plastic eye with a post and washer back. The post is pushed through the crochet fabric before stuffing and the washer clicks onto the post from the inside, locking the eye in place. Insert safety eyes before closing any opening through which your hand cannot later reach.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Striped oval-body bee amigurumi are a standard beginner pattern; construction is synthesised from common open-source practice.',
  finishedSizeText: 'Approx 9 cm long x 5 cm wide.',
  body: {
    type: 'doc', content: [
      p(t('Work the body as an oval in alternating yellow and black stripes using '), gt('stripe-carry-a92', 'stripe carry'), t('. Each stripe is 2 rounds. Insert '), gt('safety-eye-a92', 'safety eyes'), t(' between rounds 5 and 6 before stuffing.')),
      p(t(`Body (${a92Body.totalRounds} rounds): ${a92Body.finishedDimensionsCm.width} cm oval.`)),
      p(t(`Wings (make 2, ${a92Wing.totalRounds} rounds each): small ${a92Wing.finishedDimensionsCm.width} cm oval in off-white or cream. Leave a long tail for attachment.`)),
      p(t(`Stinger (${a92Stinger.totalRounds} rounds): small cone in black. Sew to the pointed end of the body.`)),
      h2('Stripes'),
      p(t('Rounds 1 to 2: yellow. Rounds 3 to 4: black. Rounds 5 to 6: yellow. Rounds 7 to 8: black. Continue pattern until body is complete. Use '), gt('stripe-carry-a92', 'stripe carry'), t(' throughout.')),
      h2('Wings'),
      p(t('Work two small oval wings in cream. Do not stuff. Flatten slightly and sew to the top of the body, angling outward at 45 degrees.')),
      h2('Assembly'),
      p(t('Sew stinger to back. Sew wings to the centre top. Embroider antennae with a length of black yarn, knotting each tip.')),
      h2('What to try next'),
      p(t('The butterfly uses the same oval body with four wings and no stripe work.')),
    ],
  },
},
// ── A93 Butterfly ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-butterfly',
  title: 'Amigurumi butterfly',
  subtitle: '',
  excerpt: 'A colourful butterfly with a slim oval body and four oval wings. The wings are worked flat with no wire support; shaping comes from blocking and a central pinch seam. INTERMEDIATE due to multi-piece assembly. Approx 12 cm wingspan.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-flat-piece', 'amigurumi-joining-pieces', 'amigurumi-blocking'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-flat-piece'],
  aliases: ['crochet butterfly amigurumi', 'amigurumi butterfly pattern', 'wire free butterfly crochet'],
  glossaryTerms: [
    { slug: 'flat-oval-wing-a93', term: 'Flat oval wing', definition: 'An oval piece worked flat by turning the work at the end of each row rather than working in continuous rounds. Working flat produces a piece with two smooth faces and a neat edge, which sits naturally as a wing when attached to the body. The oval is not stuffed.' },
    { slug: 'pinch-seam-a93', term: 'Pinch seam', definition: 'A small gather sewn across the inner edge of each wing before attachment. Pinching about 1 cm of the straight edge and stitching it flat creates a slight cup that gives the wing a natural angled lift without wire or stiffener.' },
    { slug: 'wet-blocking-a93', term: 'Wet blocking', definition: 'Dampening the finished flat pieces and pinning them to shape while damp. For these wings, blocking spreads the oval into a broader, thinner shape and dries with a slight stiffness that holds the wing outline. No starch or stiffener is needed with most dk yarns.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wire-free amigurumi butterfly wings are achieved through flat oval construction and blocking; techniques synthesised from common amigurumi practice.',
  finishedSizeText: 'Approx 12 cm wingspan x 8 cm tall.',
  body: {
    type: 'doc', content: [
      p(t('Work the body as a slim oval. Work all four wings as '), gt('flat-oval-wing-a93', 'flat oval wings'), t(', turning each row. Block wings after completion using '), gt('wet-blocking-a93', 'wet blocking'), t(', pinning to the finished shape.')),
      p(t(`Body (${a93Body.totalRounds} rounds): ${a93Body.finishedDimensionsCm.width} cm slim oval.`)),
      p(t(`Upper wings (make 2, ${a93UpperWing.totalRounds} rounds each): ${a93UpperWing.finishedDimensionsCm.width} cm oval, worked flat.`)),
      p(t(`Lower wings (make 2, ${a93LowerWing.totalRounds} rounds each): ${a93LowerWing.finishedDimensionsCm.width} cm oval, worked flat.`)),
      h2('Wings'),
      p(t('Work each upper and lower wing flat. Apply '), gt('wet-blocking-a93', 'wet blocking'), t(' and pin to shape. Once dry, work a '), gt('pinch-seam-a93', 'pinch seam'), t(' across the inner 1 cm of each wing edge.')),
      h2('Colour work'),
      p(t('Work wings in your chosen butterfly colours. Surface embroider wing markings with a contrasting colour after blocking.')),
      h2('Assembly'),
      p(t('Attach upper wings to the top third of the body and lower wings to the middle third. Angle upper wings upward and lower wings outward. Embroider antennae in black, knotting each tip.')),
      h2('What to try next'),
      p(t('The dragonfly uses a long capsule body and four narrow wings in the same flat oval technique.')),
    ],
  },
},
// ── A94 Caterpillar ───────────────────────────────────────────────────────────
{
  slug: 'amigurumi-caterpillar',
  title: 'Amigurumi caterpillar',
  subtitle: '',
  excerpt: 'A green caterpillar made from five connected spheres and a slightly larger head sphere. Cone antennae and embroidered eyes finish the face. A good joining-pieces project for beginners. Approx 20 cm long.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-joining-pieces'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining-pieces'],
  aliases: ['crochet caterpillar amigurumi', 'amigurumi caterpillar pattern', 'beginner crochet bug toy'],
  glossaryTerms: [
    { slug: 'joining-spheres-a94', term: 'Joining spheres', definition: 'A method of connecting stuffed sphere segments into a linked body. Each sphere is stuffed and closed with a 30 cm yarn tail. The needle passes through the closing stitches of one sphere into the corresponding stitches of the next, repeating 4 to 5 times around the join circle. Pulling the stitches firm draws the spheres close together without a visible gap.' },
    { slug: 'cone-antenna-a94', term: 'Cone antenna', definition: 'A small cone piece worked from the tip down. Start with 6 dc in a magic ring and increase by 6 stitches per round for 3 rounds. The result is a shallow cone that sits naturally upright when sewn to the head. No stuffing is needed; the cone is small enough to hold its shape with the yarn alone.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Multi-sphere caterpillar amigurumi are a classic beginner joining exercise; construction is synthesised from common open-source amigurumi practice.',
  finishedSizeText: 'Approx 20 cm long x 4 cm wide per segment.',
  body: {
    type: 'doc', content: [
      p(t('Work five body spheres and one head sphere. Stuff each firmly before closing. Join all six pieces in a line using '), gt('joining-spheres-a94', 'joining spheres'), t(', starting from the tail end and working toward the head.')),
      p(t(`Body segments (make 5, ${a94Seg.totalRounds} rounds each): ${a94Seg.finishedDimensionsCm.width} cm sphere in green.`)),
      p(t(`Head (${a94Head.totalRounds} rounds): ${a94Head.finishedDimensionsCm.width} cm sphere in green. Slightly larger than the body segments.`)),
      p(t(`Antennae (make 2, ${a94Antenna.totalRounds} rounds each): small `, ), gt('cone-antenna-a94', 'cone'), t(' in green.')),
      h2('Joining'),
      p(t('Lay all segments in order. Use '), gt('joining-spheres-a94', 'joining spheres'), t(' to connect each pair. Work 4 passes through each join for security. The body curves naturally as the spheres settle.')),
      h2('Face'),
      p(t('Sew antennae to the top of the head, 1 cm apart. Embroider two eyes in black. Work a small chain stitch smile in a contrasting colour.')),
      h2('What to try next'),
      p(t('The snail uses an oval body and a sphere shell, with cone antennae in the same style.')),
    ],
  },
},
// ── A95 Dragonfly ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-dragonfly',
  title: 'Amigurumi dragonfly',
  subtitle: '',
  excerpt: 'A metallic-blue dragonfly with a long capsule body, a sphere head and four flat oval wings. The wings are worked in a lighter shade and blocked flat. Approx 14 cm long.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-flat-piece', 'amigurumi-joining-pieces', 'amigurumi-blocking'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-flat-piece'],
  aliases: ['crochet dragonfly amigurumi', 'amigurumi dragonfly pattern', 'crochet insect toy'],
  glossaryTerms: [
    { slug: 'capsule-body-a95', term: 'Capsule body', definition: 'A shape with two rounded ends and a straight central tube. Work a sphere increase section at the start, then work straight rows for the tube length, then mirror the decrease section at the end. The two hemispheres are worked as part of the same piece, with no seam at either end.' },
    { slug: 'wing-placement-a95', term: 'Wing placement', definition: 'The position at which wings are sewn relative to the body. For a dragonfly, all four wings attach at the shoulder: the point roughly one quarter of the body length behind the head. Upper wings angle slightly backward and outward; lower wings angle forward and outward. This mimics the resting pose of a real dragonfly.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Capsule-body dragonfly amigurumi with flat oval wings are a well-established pattern type; construction synthesised from common practice.',
  finishedSizeText: 'Approx 14 cm long x 10 cm wingspan.',
  body: {
    type: 'doc', content: [
      p(t('Work the body as a '), gt('capsule-body-a95', 'capsule body'), t('. Work four wings flat as narrow ovals and block them. Attach wings at the shoulder using '), gt('wing-placement-a95', 'wing placement'), t(' angle.')),
      p(t(`Body (${a95Body.totalRounds} rounds): ${a95Body.finishedDimensionsCm.width} cm capsule, ${a95Body.finishedDimensionsCm.length ?? 9} cm long.`)),
      p(t(`Head (${a95Head.totalRounds} rounds): ${a95Head.finishedDimensionsCm.width} cm sphere.`)),
      p(t(`Wings (make 4, ${a95Wing.totalRounds} rounds each): narrow ${a95Wing.finishedDimensionsCm.width} cm oval worked flat in pale blue or white.`)),
      h2('Wings'),
      p(t('Work all four wings flat. Wet block and pin to spread the oval. Once dry the wings hold their shape. Sew to the body using '), gt('wing-placement-a95', 'wing placement'), t(' position.')),
      h2('Assembly'),
      p(t('Sew the head to the rounded front of the body. Add safety eyes between rounds 3 and 4 of the head before closing. Sew wings in two pairs at the shoulder.')),
      h2('What to try next'),
      p(t('The grasshopper uses a capsule body and cylinder legs for a different insect shape.')),
    ],
  },
},
// ── A96 Snail ────────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-snail-bug',
  title: 'Amigurumi garden snail',
  subtitle: '',
  excerpt: 'A friendly garden snail with a round shell sphere, an oval body and two cone antennae. The shell is worked in a contrasting colour. A relaxed BEGINNER project. Approx 8 cm tall.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-joining-pieces'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining-pieces'],
  aliases: ['crochet snail amigurumi', 'amigurumi snail pattern', 'beginner snail crochet toy'],
  glossaryTerms: [
    { slug: 'shell-spiral-a96', term: 'Shell spiral', definition: 'A surface detail worked after the shell sphere is closed. Thread a length of contrasting yarn onto the tapestry needle. Starting at the top of the sphere, couch a spiral of yarn from the crown down to the base, stitching through the fabric every 1 cm to hold it. The couched spiral gives the impression of a snail shell without changing the worked construction.' },
    { slug: 'oval-body-a96', term: 'Oval body', definition: 'An oval piece worked in continuous rounds. The cast-on is a short chain rather than a magic ring; stitches are worked into both sides of the chain to create the oval footprint. The oval produces a flat-bottomed body shape that sits stably on a surface without a base piece.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Sphere-shell snail amigurumi are a beginner staple; construction is synthesised from common open-source practice.',
  finishedSizeText: 'Approx 8 cm tall x 6 cm wide.',
  body: {
    type: 'doc', content: [
      p(t('Work the body as an '), gt('oval-body-a96', 'oval body'), t(' in green. Work the shell as a sphere in a contrasting colour. Add a '), gt('shell-spiral-a96', 'shell spiral'), t(' to the outside of the shell sphere after closing.')),
      p(t(`Shell (${a96Shell.totalRounds} rounds): ${a96Shell.finishedDimensionsCm.width} cm sphere in brown or terracotta.`)),
      p(t(`Body (${a96Body.totalRounds} rounds): ${a96Body.finishedDimensionsCm.width} cm oval in green.`)),
      p(t(`Antennae (make 2, ${a96Antenna.totalRounds} rounds each): small cone in green. Sew to the front of the body.`)),
      h2('Shell spiral'),
      p(t('Once the shell sphere is closed, work the '), gt('shell-spiral-a96', 'shell spiral'), t(' with a length of darker brown yarn. Couch from the crown outward in 3 to 4 rings. Fasten off at the base.')),
      h2('Assembly'),
      p(t('Sew the shell to the top-back of the body. Sew antennae to the front, 1 cm apart. Embroider small eyes below the antennae.')),
      h2('What to try next'),
      p(t('The grasshopper uses a capsule body and cylinder legs for a longer-bodied insect.')),
    ],
  },
},
// ── A97 Grasshopper ──────────────────────────────────────────────────────────
{
  slug: 'amigurumi-grasshopper',
  title: 'Amigurumi grasshopper',
  subtitle: '',
  excerpt: 'A long-legged green grasshopper with a capsule body, a sphere head and six cylinder legs. The hind legs are worked longer to suggest the characteristic bent jump pose. Approx 15 cm long.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-joining-pieces'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining-pieces'],
  aliases: ['crochet grasshopper amigurumi', 'amigurumi grasshopper pattern', 'crochet insect legs amigurumi'],
  glossaryTerms: [
    { slug: 'hind-leg-bend-a97', term: 'Hind leg bend', definition: 'The characteristic angled shape of a grasshopper hind leg. Work each hind leg as two cylinder sections: a 5 cm upper section (femur) and a 4 cm lower section (tibia). Join the two at an angle of about 120 degrees using several overstitches at the knee point. The bend allows the grasshopper to sit with its body close to the surface while the legs angle outward.' },
    { slug: 'leg-count-a97', term: 'Six-legged insect layout', definition: 'Insects have three legs on each side of the thorax. For amigurumi, place the front legs near the head, the middle legs at the body centre, and the hind legs near the tail. The front and middle legs are shorter straight cylinders; the hind legs use the bent construction.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cylinder-legged insect amigurumi with bent hind legs are a well-documented intermediate technique; construction synthesised from common practice.',
  finishedSizeText: 'Approx 15 cm long x 8 cm wide (hind legs extended).',
  body: {
    type: 'doc', content: [
      p(t('Work the body as a capsule in green. Work four short straight legs and two bent hind legs following the '), gt('hind-leg-bend-a97', 'hind leg bend'), t(' method. Arrange all six legs using '), gt('leg-count-a97', 'six-legged insect layout'), t('.')),
      p(t(`Body (${a97Body.totalRounds} rounds): ${a97Body.finishedDimensionsCm.width} cm capsule, ${a97Body.finishedDimensionsCm.length ?? 8} cm long in green.`)),
      p(t(`Head (${a97Head.totalRounds} rounds): ${a97Head.finishedDimensionsCm.width} cm sphere in green.`)),
      p(t(`Front and middle legs (make 4, ${a97Leg.totalRounds} rounds each): straight ${a97Leg.finishedDimensionsCm.height ?? 5} cm cylinder in green.`)),
      p(t('Hind legs (make 2): two-section cylinder with a bend at the knee.')),
      h2('Hind legs'),
      p(t('Work each hind leg as two cylinder sections: 5 cm upper and 4 cm lower. Join at 120 degrees using '), gt('hind-leg-bend-a97', 'hind leg bend'), t('. Sew to the rear of the body.')),
      h2('Assembly'),
      p(t('Sew head to front of body. Attach legs using '), gt('leg-count-a97', 'six-legged insect layout'), t('. Embroider two large eyes on the head sides.')),
      h2('What to try next'),
      p(t('The ant uses three separate body spheres and six straight legs for a different insect structure.')),
    ],
  },
},
// ── A98 Ant ──────────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-ant',
  title: 'Amigurumi ant',
  subtitle: '',
  excerpt: 'A black ant with the characteristic three-part body: a small head sphere, a smaller thorax sphere and a larger abdomen sphere. Six cylinder legs and two yarn antennae complete the shape. Approx 12 cm long.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-joining-pieces'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining-pieces'],
  aliases: ['crochet ant amigurumi', 'amigurumi ant pattern', 'three part body insect amigurumi'],
  glossaryTerms: [
    { slug: 'three-part-body-a98', term: 'Three-part body', definition: 'The standard body plan of an ant or wasp, comprising head (largest), thorax (smallest) and abdomen (largest). In amigurumi, each section is a separate stuffed sphere joined in sequence. The thorax sphere is notably smaller than the other two, which creates the characteristic pinched waist appearance.' },
    { slug: 'elbow-leg-a98', term: 'Elbow joint leg', definition: 'A leg construction using a short kink midway along the cylinder. Fold the finished cylinder at the midpoint and work two overstitches at the fold to hold the angle. Bending the legs before attachment gives the ant a more natural crouched stance.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Three-sphere ant amigurumi are a well-documented intermediate pattern; construction synthesised from common open-source practice.',
  finishedSizeText: 'Approx 12 cm long x 3 cm wide.',
  body: {
    type: 'doc', content: [
      p(t('Work three separate spheres following the '), gt('three-part-body-a98', 'three-part body'), t(' proportion. Work six cylinder legs using the '), gt('elbow-leg-a98', 'elbow joint'), t(' method to add a slight bend.')),
      p(t(`Head (${a98Head.totalRounds} rounds): ${a98Head.finishedDimensionsCm.width} cm sphere in black.`)),
      p(t(`Thorax (${a98Thorax.totalRounds} rounds): ${a98Thorax.finishedDimensionsCm.width} cm sphere in black. Smaller than head and abdomen.`)),
      p(t(`Abdomen (${a98Abdomen.totalRounds} rounds): ${a98Abdomen.finishedDimensionsCm.width} cm sphere in black.`)),
      p(t(`Legs (make 6, ${a98Leg.totalRounds} rounds each): ${a98Leg.finishedDimensionsCm.height ?? 3.5} cm cylinder in black.`)),
      h2('Assembly'),
      p(t('Join the three body spheres in order: head to thorax, thorax to abdomen. Use the '), gt('three-part-body-a98', 'three-part body'), t(' join method, passing through each closing circle 4 times. Attach legs using '), gt('elbow-leg-a98', 'elbow joint'), t(': 2 on the head-side of the thorax, 2 at the thorax centre, 2 on the abdomen-side.')),
      h2('Antennae'),
      p(t('Cut 2 lengths of black yarn 20 cm long. Thread each through the top of the head. Knot the end of each to create a small ball tip. Stiffen with a dab of fabric glue if desired.')),
      h2('What to try next'),
      p(t('The spider uses a two-sphere body and eight legs for a Halloween-themed variation.')),
    ],
  },
},
// ── A99 Spider ───────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-spider',
  title: 'Amigurumi spider',
  subtitle: '',
  excerpt: 'A Halloween-ready black spider with a large body sphere, a smaller head sphere and eight cylinder legs. Safety eyes give the face a wide-eyed look. BEGINNER friendly. Approx 10 cm wide.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-joining-pieces'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-joining-pieces'],
  aliases: ['crochet spider amigurumi', 'halloween crochet spider', 'beginner spider amigurumi pattern'],
  glossaryTerms: [
    { slug: 'eight-leg-layout-a99', term: 'Eight-leg layout', definition: 'Spiders have four legs on each side. For amigurumi, space the legs evenly along the lower side of the body sphere. A useful guide: mark eight evenly spaced points around the equator of the body and attach one leg at each point. The legs are bent slightly downward at the mid-point so the spider appears to stand rather than float.' },
    { slug: 'pipe-cleaner-leg-a99', term: 'Pipe cleaner insert', definition: 'A short section of pipe cleaner or craft wire inserted inside the cylinder leg before closing. The insert allows the leg to be bent into a pose and hold the angle permanently. If making this toy for a child under 3, omit the wire and stuff the legs with yarn scraps instead.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Two-sphere spider amigurumi with eight legs are a classic beginner pattern often made for Halloween; construction synthesised from common practice.',
  finishedSizeText: 'Approx 10 cm wide (legs extended) x 6 cm tall.',
  body: {
    type: 'doc', content: [
      p(t('Work a large body sphere and a smaller head sphere. Work eight cylinder legs. Insert '), gt('pipe-cleaner-leg-a99', 'pipe cleaner inserts'), t(' into each leg to allow posing. Attach legs using '), gt('eight-leg-layout-a99', 'eight-leg layout'), t('.')),
      p(t(`Body (${a99Body.totalRounds} rounds): ${a99Body.finishedDimensionsCm.width} cm sphere in black.`)),
      p(t(`Head (${a99Head.totalRounds} rounds): ${a99Head.finishedDimensionsCm.width} cm sphere in black.`)),
      p(t(`Legs (make 8, ${a99Leg.totalRounds} rounds each): ${a99Leg.finishedDimensionsCm.height ?? 6} cm cylinder in black.`)),
      h2('Legs'),
      p(t('Work eight legs in black. Insert '), gt('pipe-cleaner-leg-a99', 'pipe cleaner insert'), t(' into each before closing. Bend each leg slightly downward at the midpoint.')),
      h2('Face'),
      p(t('Insert 8 mm safety eyes between rounds 3 and 4 of the head, spaced 1.5 cm apart. Embroider a simple smile in red for a Halloween effect.')),
      h2('Assembly'),
      p(t('Sew head to body. Attach legs using '), gt('eight-leg-layout-a99', 'eight-leg layout'), t('. Four legs on each side, evenly spaced.')),
      h2('What to try next'),
      p(t('The firefly uses an oval body with a glow-yarn tail for a magical nighttime companion.')),
    ],
  },
},
// ── A100 Firefly ─────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-firefly',
  title: 'Amigurumi firefly',
  subtitle: '',
  excerpt: 'A yellow and green firefly with an oval body, two flat oval wings and a small capsule tail worked in glow-in-the-dark yarn. Approx 10 cm long.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-flat-piece', 'amigurumi-joining-pieces', 'amigurumi-colour-change'],
  criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-flat-piece'],
  aliases: ['crochet firefly amigurumi', 'amigurumi lightning bug', 'glow yarn crochet bug'],
  glossaryTerms: [
    { slug: 'glow-yarn-a100', term: 'Glow yarn', definition: 'A yarn blended with a phosphorescent fibre that absorbs light and re-emits it as a soft glow in the dark. In standard room light the yarn appears pale yellow or cream. After 30 seconds in bright light it glows faintly for several minutes. Use it for the firefly tail capsule only; the rest of the body uses regular dk yarn.' },
    { slug: 'tail-capsule-a100', term: 'Tail capsule', definition: 'A small capsule piece worked as the light organ at the rear of the firefly body. Work 6 dc in a magic ring, increase to 12, work 4 straight rounds, then decrease back to 6 and close. The small size means no stuffing is needed; the yarn holds the shape without fill.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Glow-yarn firefly amigurumi with capsule light organs are a novelty variation on standard oval-body insect patterns; construction synthesised from common practice.',
  finishedSizeText: 'Approx 10 cm long x 8 cm wingspan.',
  body: {
    type: 'doc', content: [
      p(t('Work the body as an oval in yellow. Work two wings flat in cream or pale yellow. Work the tail as a '), gt('tail-capsule-a100', 'tail capsule'), t(' in '), gt('glow-yarn-a100', 'glow yarn'), t('.')),
      p(t(`Body (${a100Body.totalRounds} rounds): ${a100Body.finishedDimensionsCm.width} cm oval in yellow.`)),
      p(t(`Wings (make 2, ${a100Wing.totalRounds} rounds each): ${a100Wing.finishedDimensionsCm.width} cm flat oval in cream.`)),
      p(t(`Tail (${a100Tail.totalRounds} rounds): small `, ), gt('tail-capsule-a100', 'capsule'), t(' in glow yarn. No stuffing needed.')),
      h2('Glow tail'),
      p(t('Work the '), gt('tail-capsule-a100', 'tail capsule'), t(' in '), gt('glow-yarn-a100', 'glow yarn'), t('. Sew to the pointed rear of the body. Charge under a lamp for 30 seconds before use.')),
      h2('Wings'),
      p(t('Work two wings flat. Block and allow to dry. Sew to the top of the body, angling outward at 40 degrees.')),
      h2('Assembly'),
      p(t('Sew wings to the body. Attach tail capsule to the rear. Embroider two eyes in black. Add short antennae with knotted black yarn tips.')),
      h2('What to try next'),
      p(t('The ladybird uses a similar oval body with duplicate-stitch spots for a bold colour contrast.')),
    ],
  },
},
] as const

for (const pat of PATTERNS) {
  const {
    slug, title, subtitle, excerpt, difficulty,
    techniqueSlugs, criticalTechniques, aliases, glossaryTerms,
    sourceType, sourceNotes, finishedSizeText, body,
  } = pat as any

  const out = {
    slug,
    title,
    subtitle: subtitle ?? '',
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

console.log('Batch 10 complete.')
