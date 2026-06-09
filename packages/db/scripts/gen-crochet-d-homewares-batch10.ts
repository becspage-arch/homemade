/**
 * Generator: D-Homewares Batch 10 -- Cushions 16-25 + Decorative/seasonal 1-5
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-homewares-batch10.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-homewares')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }
function li(...c: object[]) { return { type: 'listItem', content: [{ type: 'paragraph', content: c }] } }
function ul(...items: object[]) { return { type: 'bulletList', content: items } }
function supplies(heading: string, items: { name: string; qty: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const PATTERNS = [

// ── C16 ── star stitch cushion ────────────────────────────────────────────────
{
  slug: 'star-stitch-cushion-cover',
  title: 'Star stitch cushion cover',
  subtitle: 'A 40 cm cushion cover worked in a repeating star stitch pattern.',
  excerpt: 'Star stitches interlock across both panels of this 40 cm cushion cover. The distinctive spoke pattern looks complex but follows a consistent two-row repeat.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '6 star stitches x 10 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-star-stitch'],
  techniqueSlugs: ['crochet-star-stitch', 'crochet-double-uk'],
  criticalTechniques: ['crochet-star-stitch'],
  aliases: ['star stitch cushion', 'star pattern pillow', 'crochet star cushion'],
  glossaryTerms: [
    { slug: 'star-st-cushion', term: 'Star stitch', definition: 'Five loops drawn up through five points and closed together, forming a star shape. Each stitch shares two legs with the adjacent stars.' },
    { slug: 'eye-of-star', term: 'Eye of star', definition: 'The central closing chain of a star stitch. The next row of star stitches anchors into these chain eyes.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Star stitch patterns appear in Victorian needlework manuals. Modern cushion application is synthesised.',
  body: {
    type: 'doc', content: [
      p(t('Each '), gt('star-st-cushion', 'star stitch'), t(' draws up five loops and closes through an '), gt('eye-of-star', 'eye'), t('. The next row of stars anchors into those eyes, creating an interlocked grid of spoke patterns.')),
      p(t('Work both front and back panels to the same stitch count. The star pattern needs a specific multiple, so cast on as directed. Total yarn around 500 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '500 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Panel (make 2)'),
      p(t('Foundation: chain 57 (multiple of 2 plus 1). Row 1 (WS): ch 3, draw up loop in 2nd and 3rd ch from hook and in next 3 ch (5 loops on hook), yo pull through all, ch 1 to close '), gt('eye-of-star', 'eye'), t('. * Insert in eye, next 4 ch; draw up 5 loops, close, ch 1. Repeat to end. Row 2 (RS): turn, ch 3, '), gt('star-st-cushion', 'star stitch'), t(' anchoring first two legs into last eye and right-side loops of previous row. Repeat rows 1 and 2 to 40 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Whipstitch three sides. Insert pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The spider stitch cushion uses a similarly interlocked pattern with a different visual effect.')),
    ],
  },
},

// ── C17 ── spider stitch cushion ──────────────────────────────────────────────
{
  slug: 'spider-stitch-cushion-cover',
  title: 'Spider stitch cushion cover',
  subtitle: 'A 40 cm cushion cover in spider stitch with a web-like open texture.',
  excerpt: 'Spider stitch creates a lace-like web texture across this 40 cm cushion cover. The pattern is worked in one colour with a slightly loose tension to show off the stitch.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-5mm',
  gauge: '5 spider clusters x 8 rows = 10 x 10 cm in spider stitch on a 4.5 mm hook.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-spider-stitch'],
  techniqueSlugs: ['crochet-spider-stitch', 'crochet-double-uk'],
  criticalTechniques: ['crochet-spider-stitch'],
  aliases: ['spider stitch cushion', 'web stitch cushion', 'open texture cushion'],
  glossaryTerms: [
    { slug: 'spider-st-cushion', term: 'Spider stitch', definition: 'A cluster made by drawing up four loops through four consecutive stitches, crossing and closing them. Forms a raised X or spider shape.' },
    { slug: 'dc-divider', term: 'Divider double crochet', definition: 'A single dc worked between spider clusters to keep the spacing even.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Spider stitch is documented in Victorian crochet manuals. Cushion application is synthesised.',
  body: {
    type: 'doc', content: [
      p(t('The '), gt('spider-st-cushion', 'spider stitch'), t(' draws up loops from four points and crosses them at the centre. A '), gt('dc-divider', 'divider dc'), t(' between each spider keeps the row even.')),
      p(t('Work both panels to 40 cm. The open texture is best seen in a smooth, light-coloured DK yarn. Total yarn around 420 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn, smooth and light-coloured', qty: '420 m' },
        { name: '4.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Panel (make 2)'),
      p(t('Foundation: chain 53 (multiple of 4 plus 1). Set up '), gt('spider-st-cushion', 'spider stitch'), t(' on row 2. Repeat the 2-row repeat until panel is 40 cm.')),
      h2('Assembly'),
      p(t('Whipstitch three sides with a matching yarn. Insert pad. Close remaining side. The cushion pad will show through the open stitch slightly; choose pad fabric to complement.')),
      h2('What to try next'),
      p(t('The star stitch cushion uses a different interlocked cluster stitch at a denser texture.')),
    ],
  },
},

// ── C18 ── herringbone half treble cushion ────────────────────────────────────
{
  slug: 'herringbone-htr-cushion-cover',
  title: 'Herringbone half treble cushion cover',
  subtitle: 'A 40 cm cushion cover worked in herringbone half treble for a dense diagonal texture.',
  excerpt: 'Herringbone half treble stitches create a flat, diagonal grain across this 40 cm cushion. The fabric is denser and more flexible than standard half treble.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '15 st x 17 rows = 10 x 10 cm in herringbone htr on a 5 mm hook.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-herringbone-htr'],
  techniqueSlugs: ['crochet-herringbone-htr'],
  criticalTechniques: ['crochet-herringbone-htr'],
  aliases: ['herringbone crochet cushion', 'hhtr cushion', 'diagonal texture cushion'],
  glossaryTerms: [
    { slug: 'hhtr-cushion', term: 'Herringbone half treble', definition: 'A half treble variation where the hook draws through the first loop on the hook before pulling through the remaining loops. Produces a tighter fabric with a diagonal lean.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Herringbone stitch cushion covers are a modern crochet project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each '), gt('hhtr-cushion', 'herringbone half treble'), t(' draws through the first loop before completing the stitch. This small difference from standard htr creates a noticeably tighter, flatter fabric with a diagonal herringbone grain.')),
      p(t('Both panels are worked all in hhtr. Aran weight gives a firm, well-structured cover. Total yarn around 480 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '480 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Panel (make 2)'),
      p(t('Chain 63. Row 1: '), gt('hhtr-cushion', 'herringbone htr'), t(' in 3rd ch from hook and each ch across. Continue in hhtr every row until panel is 40 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Orient both panels so the diagonal grain runs in the same direction. Whipstitch three sides. Insert pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The linen stitch square cushion also produces a flat, structured fabric using a different technique.')),
    ],
  },
},

// ── C19 ── linked treble cushion ──────────────────────────────────────────────
{
  slug: 'linked-treble-cushion-cover',
  title: 'Linked treble cushion cover',
  subtitle: 'A 40 cm cushion cover with a smooth, tight surface from linked treble stitches.',
  excerpt: 'Linked treble stitches join each stitch to its neighbour mid-height, filling the gaps common in standard treble fabric. The result is smooth and dense.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '16 st x 9 rows = 10 x 10 cm in linked treble on a 4 mm hook.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-linked-dc'],
  techniqueSlugs: ['crochet-linked-dc'],
  criticalTechniques: ['crochet-linked-dc'],
  aliases: ['linked treble cushion', 'smooth treble cushion', 'linked stitch pillow'],
  glossaryTerms: [
    { slug: 'linked-tr-cushion', term: 'Linked treble', definition: 'A treble that inserts the hook into the side of the previous stitch at the halfway point before completing the stitch. Closes the gaps between trebles for a solid fabric.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Linked stitch cushion covers are a modern crochet application. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The '), gt('linked-tr-cushion', 'linked treble'), t(' inserts the hook into the side bar of the previous stitch before wrapping. This closes the gap between stitches that standard treble leaves, producing a fabric closer in density to double crochet but with more height.')),
      p(t('Both panels use linked trebles throughout. DK yarn on a 4 mm hook gives a smooth surface well-suited to this stitch. Total yarn around 450 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '450 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Panel (make 2)'),
      p(t('Chain 65. Row 1: '), gt('linked-tr-cushion', 'linked treble'), t(' in 4th ch from hook, inserting into the side bar of each previous stitch before completing. Continue every row until 40 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Whipstitch three sides. Insert pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The herringbone half treble cushion uses a similar technique modification for a different surface character.')),
    ],
  },
},

// ── C20 ── crocodile stitch cushion ───────────────────────────────────────────
{
  slug: 'crocodile-stitch-cushion-cover',
  title: 'Crocodile stitch cushion cover',
  subtitle: 'A 40 cm cushion cover worked in scale-like crocodile stitch panels.',
  excerpt: 'Crocodile stitch wraps trebles in overlapping scale shapes across this 40 cm cushion cover. The three-dimensional scales give the front panel a sculptural surface.',
  difficulty: 'ADVANCED',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '3 crocodile scales x 5 rows = 10 x 10 cm on a 4 mm hook with DK.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-crocodile-stitch'],
  techniqueSlugs: ['crochet-crocodile-stitch', 'crochet-treble', 'crochet-double-uk'],
  criticalTechniques: ['crochet-crocodile-stitch'],
  aliases: ['crocodile stitch cushion', 'scale stitch cushion', 'dragon scale pillow'],
  glossaryTerms: [
    { slug: 'croc-scale', term: 'Crocodile scale', definition: 'Five trebles worked down one post, five up the adjacent post, forming a folded oval scale. The completed scales overlap like tiles or armour.' },
    { slug: 'v-frame', term: 'V-frame', definition: 'A pair of trebles separated by one or two chains that forms the anchor for each crocodile scale.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crocodile stitch is a modern crochet technique. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each '), gt('croc-scale', 'crocodile scale'), t(' is built on a '), gt('v-frame', 'V-frame'), t(' of two trebles. Five trebles work down the left post, five up the right, creating a raised oval scale. Rows of scales offset like roof tiles.')),
      p(t('The front panel uses crocodile stitch; the back uses plain double crochet to keep bulk manageable. Total yarn around 500 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '500 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Front panel'),
      p(t('Foundation row: chain 61. Work a row of '), gt('v-frame', 'V-frames'), t(' spaced evenly. Scale row: work '), gt('croc-scale', 'crocodile scales'), t(' on each V-frame. Chain row: work a new set of V-frames offset by half a scale width. Repeat scale and chain rows until 40 cm. Fasten off.')),
      h2('Back panel'),
      p(t('Chain 61. Work plain double crochet rows until 40 cm.')),
      h2('Assembly'),
      p(t('Place front and back wrong sides together, scales facing out. Whipstitch three sides. Insert pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The popcorn stitch cushion adds a different three-dimensional texture with simpler construction.')),
    ],
  },
},

// ── C21 ── fan stitch rectangular cushion ─────────────────────────────────────
{
  slug: 'fan-stitch-rectangular-cushion',
  title: 'Fan stitch rectangular cushion',
  subtitle: 'A 50 x 30 cm lumbar cushion cover worked in a classic fan stitch.',
  excerpt: 'Fan stitch fans of seven trebles alternate with chain spaces across this 50 x 30 cm lumbar cushion. Worked in one colour for a clean, airy texture.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '3 fans x 10 rows = 10 x 10 cm in fan stitch on a 4 mm hook.',
  finishedSize: '50 x 30 cm lumbar cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fan-stitch'],
  techniqueSlugs: ['crochet-fan-stitch', 'crochet-double-uk'],
  criticalTechniques: ['crochet-fan-stitch'],
  aliases: ['fan stitch lumbar cushion', 'fan pattern pillow', 'crochet fan cushion'],
  glossaryTerms: [
    { slug: 'fan-st-cushion', term: 'Fan stitch', definition: 'Seven trebles worked into the same stitch or space, spreading out into a fan shape. Each fan sits in a chain space from the row below.' },
    { slug: 'anchor-dc-fan', term: 'Anchor double crochet', definition: 'A single dc worked at the midpoint of each fan. Keeps the fan centred and creates the space for the next fan row.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Fan stitch appears in Victorian crochet manuals. Lumbar cushion application is synthesised.',
  body: {
    type: 'doc', content: [
      p(t('Seven trebles fan into each chain space, with an '), gt('anchor-dc-fan', 'anchor dc'), t(' at the centre of each '), gt('fan-st-cushion', 'fan'), t(' in the next row. The offset placement builds up a staggered fan pattern.')),
      p(t('A lumbar cushion at 50 x 30 cm works well as a sofa or bed bolster. Both panels use the fan stitch. Total yarn around 380 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '380 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '50 x 30 cm lumbar cushion pad', qty: '1' },
      ]),
      h2('Panel (make 2)'),
      p(t('Chain 91 (multiple of 10 plus 1). Row 1 (foundation dc row). Row 2: ch 3, '), gt('fan-st-cushion', '7 tr in 5th st'), t(', * skip 4, '), gt('anchor-dc-fan', 'dc'), t(', skip 4, 7 tr in next st; rep. Row 3: ch 1, dc, * 7 tr in anchor dc of prev row, dc in centre tr of fan; rep. Alternate rows 2 and 3 until 30 cm.')),
      h2('Assembly'),
      p(t('Whipstitch three sides. Insert lumbar pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The shell stitch cushion cover uses a similar fan structure at a smaller 5-treble scale.')),
    ],
  },
},

// ── C22 ── c-shaped neck cushion ──────────────────────────────────────────────
{
  slug: 'neck-rest-cushion-cover',
  title: 'Neck rest cushion cover',
  subtitle: 'A small 30 cm round travel neck cushion cover in double crochet in the round.',
  excerpt: 'A simple round cushion cover in double crochet in the round produces a 30 cm flat disc ideal for a travel or neck-support cushion pad.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '30 cm diameter round cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['round cushion cover', 'travel pillow crochet', 'neck cushion crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-neck', term: 'Magic ring', definition: 'An adjustable loop start for in-the-round work. Pull the tail to close the centre hole once the first round is worked.' },
    { slug: 'dc-in-round-neck', term: 'Dc in the round', definition: 'Working double crochet in a continuous spiral without joining each round. A stitch marker keeps track of the round start.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Round cushion covers in dc are a simple modern crochet project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Two flat circles grow from a '), gt('magic-ring-neck', 'magic ring'), t(' to 30 cm using '), gt('dc-in-round-neck', 'dc in the round'), t(' with 6 increases per round. Join them with a whipstitch seam around the edge, leaving a gap for the pad.')),
      p(t('A smooth aran yarn makes a neat, washable cover. Total yarn around 220 m. Works for any standard 30 cm round cushion insert.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '220 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '30 cm round cushion pad', qty: '1' },
      ]),
      h2('Circle (make 2)'),
      p(t('Round 1: magic ring, 6 dc. Round 2: 2 dc in each st. Round 3: * 2 dc, 1 dc; rep. Continue adding 6 dc per round until circle reaches 30 cm. Sl st to close last round. Fasten off.')),
      h2('Assembly'),
      p(t('Place circles wrong sides together. Whipstitch around leaving a 15 cm gap. Insert pad. Close gap.')),
      h2('What to try next'),
      p(t('The striped floor cushion uses the same circular method at a larger 60 cm size.')),
    ],
  },
},

// ── C23 ── button-fastening cushion ───────────────────────────────────────────
{
  slug: 'button-fastening-cushion-cover',
  title: 'Button-fastening cushion cover',
  subtitle: 'A 45 cm square cushion cover with a button-and-loop fastening across the back opening.',
  excerpt: 'A plain double crochet 45 cm cushion cover with a button-band back opening. Three buttons and crochet chain loops allow the pad to be removed for washing.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 st x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '45 x 45 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['button cushion cover crochet', 'envelope back cushion', 'washable cushion cover'],
  glossaryTerms: [
    { slug: 'button-loop', term: 'Button loop', definition: 'A small chain loop worked at the edge of one back panel. When the cover is closed, the loop passes over the button on the opposite panel to fasten it.' },
    { slug: 'dc-cover-plain', term: 'Double crochet', definition: 'The base stitch used throughout. Insert hook, draw up a loop, yarn over and pull through both loops.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Button-back crochet cushion covers are a modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The back is made from two overlapping panels rather than one. The upper panel has '), gt('button-loop', 'button loops'), t(' along its bottom edge. The lower panel has buttons sewn on to match.')),
      p(t('Both back panels are plain '), gt('dc-cover-plain', 'double crochet'), t('. The front panel is also plain dc or can use any textured stitch of your choice. Total yarn around 500 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '500 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '45 cm cushion pad', qty: '1' },
        { name: 'Buttons, 3 cm diameter', qty: '3' },
      ]),
      h2('Front panel'),
      p(t('Chain 65. Work dc rows until 45 cm.')),
      h2('Back upper panel'),
      p(t('Chain 65. Work dc rows until 28 cm. On final row: work to position for first loop, ch 6, sl st back into same st to form '), gt('button-loop', 'button loop'), t('. Continue, placing 2 more loops evenly spaced. Fasten off.')),
      h2('Back lower panel'),
      p(t('Chain 65. Work dc rows until 22 cm. Fasten off. Sew 3 buttons to match loop positions.')),
      h2('Assembly'),
      p(t('Place front and back together (back panels overlap at the centre). Whipstitch all four sides. Fasten buttons through loops to close back.')),
      h2('What to try next'),
      p(t('The boho tassel cushion cover uses the same plain dc panel in a simpler single-piece back.')),
    ],
  },
},

// ── C24 ── two-tone intarsia cushion ──────────────────────────────────────────
{
  slug: 'two-tone-intarsia-cushion',
  title: 'Two-tone intarsia cushion',
  subtitle: 'A 40 cm cushion cover with a bold two-colour geometric intarsia panel.',
  excerpt: 'A large geometric shape in a contrasting colour is worked into the front panel using basic intarsia technique. Separate yarn bobbins supply each colour section.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 st x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['intarsia cushion crochet', 'two colour cushion', 'geometric cushion cover'],
  glossaryTerms: [
    { slug: 'intarsia-cushion', term: 'Intarsia', definition: 'A colourwork method where separate yarn bobbins supply each distinct colour section. Yarns are not carried across; they cross at the colour change point.' },
    { slug: 'yarn-cross', term: 'Yarn cross', definition: 'Twisting the old and new colour yarns at the changeover point so the colours lock together without leaving a gap in the fabric.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Intarsia crochet cushion covers are a modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The front panel uses '), gt('intarsia-cushion', 'intarsia'), t(' to place a large diamond or triangle in a contrasting colour on a plain background. At each boundary, '), gt('yarn-cross', 'cross the yarns'), t(' to close the gap.')),
      p(t('Wind yarn bobbins for each colour section. The back panel is plain dc in the main colour. Total yarn around 480 m across both colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn, colour A (background)', qty: '320 m' },
        { name: 'Aran yarn, colour B (motif)', qty: '160 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Front panel'),
      p(t('Chain 57. Follow a simple chart: rows 1 to 10 plain colour A, rows 11 to 30 introduce the '), gt('intarsia-cushion', 'intarsia'), t(' motif expanding then contracting across the centre stitches, rows 31 to 40 plain colour A. Cross yarns at each boundary.')),
      h2('Back panel'),
      p(t('Chain 57. Work dc rows in colour A until 40 cm.')),
      h2('Assembly'),
      p(t('Whipstitch three sides. Insert pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The corner-to-corner cushion cover creates diagonal colouring using a different method.')),
    ],
  },
},

// ── C25 ── woven-look tapestry cushion ────────────────────────────────────────
{
  slug: 'woven-look-tapestry-cushion',
  title: 'Woven-look tapestry cushion',
  subtitle: 'A 40 cm cushion cover using tapestry crochet to form a woven geometric pattern.',
  excerpt: 'Tapestry crochet carries two colours simultaneously to form a repeating geometric tile pattern across a 40 cm cushion cover. Dense fabric, flat surface.',
  difficulty: 'ADVANCED',
  yarnWeight: 'dk',
  hook: 'crochet-hook-3-5mm',
  gauge: '22 st x 24 rows = 10 x 10 cm in tapestry dc on a 3.5 mm hook.',
  finishedSize: '40 x 40 cm cushion cover.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['tapestry crochet cushion', 'tapestry pillow cover', 'geometric crochet cushion'],
  glossaryTerms: [
    { slug: 'tapestry-dc', term: 'Tapestry double crochet', definition: 'A dc that carries the unused colour along inside the stitch tops, keeping the fabric flat and hiding floats. Both colours are always present.' },
    { slug: 'float-management', term: 'Float management', definition: 'Enclosing the non-working yarn inside stitches so it does not loop loosely on the back of the fabric.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Tapestry crochet cushion covers are a modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Tapestry crochet carries both colours at once. The unused colour is enclosed inside each stitch by '), gt('float-management', 'float management'), t('. '), gt('tapestry-dc', 'Tapestry double crochet'), t(' switches between the two colours by drawing through with the new colour at the final step.')),
      p(t('The geometric tile repeat works over 8 stitches and 8 rows. Plan the pattern on graph paper first. Total yarn around 500 m split across two colours. A smaller hook than usual for DK gives the dense, fabric-like result.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn, colour A', qty: '260 m' },
        { name: 'DK yarn, colour B', qty: '240 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '40 cm cushion pad', qty: '1' },
      ]),
      h2('Front panel'),
      p(t('Chain 89 (multiple of 8 plus 1). Work '), gt('tapestry-dc', 'tapestry dc'), t(' from a chart, carrying the unused colour inside every stitch. Repeat the 8-stitch tile across and the 8-row repeat up until panel is 40 cm.')),
      h2('Back panel'),
      p(t('Chain 89. Work plain dc in colour A until 40 cm.')),
      h2('Assembly'),
      p(t('Whipstitch three sides. Insert pad. Close remaining side.')),
      h2('What to try next'),
      p(t('The two-tone intarsia cushion uses a different colourwork approach for bolder, simpler motifs.')),
    ],
  },
},

// ── D1 ── hanging wall star ───────────────────────────────────────────────────
{
  slug: 'hanging-wall-star',
  title: 'Hanging wall star',
  subtitle: 'A large 30 cm five-pointed crochet star for wall display or as a tree topper.',
  excerpt: 'A flat five-pointed star crocheted in two panels and joined at the edges. At 30 cm point to point it works as a wall decoration or a tree topper.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: 'Not critical; adjust hook size for firmness.',
  finishedSize: '30 cm point to point.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet star wall art', 'crochet star decoration', 'christmas star crochet'],
  glossaryTerms: [
    { slug: 'point-turn', term: 'Point turn', definition: 'Working a chain at the tip of each star point, then turning and working back down the other side of the point. This shaping creates the five sharp tips.' },
    { slug: 'dc-star-seam', term: 'Join round', definition: 'A round of dc worked through both panels simultaneously, closing the star and forming a neat edge.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet star decorations are a well-established modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each panel starts at the centre back of the star and works outward through five points, turning with a '), gt('point-turn', 'point turn'), t(' at each tip. Make two identical panels. A '), gt('dc-star-seam', 'join round'), t(' worked through both panels at once closes the edges and stuffs lightly.')),
      p(t('Use a firm aran weight for a star that holds its shape. Leave a loop at the top point for hanging. Total yarn around 120 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '120 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Small amount of toy stuffing', qty: 'handful' },
      ]),
      h2('Star panel (make 2)'),
      p(t('Chain 3. Work 5 points by increasing on outer edges and working a '), gt('point-turn', 'point turn'), t(' at each tip. Adjust st counts to reach 30 cm point to point.')),
      h2('Joining'),
      p(t('Place panels wrong sides together. Work '), gt('dc-star-seam', 'join round'), t(' through both panels. Stuff each point lightly as you go. Sl st to close. Fasten off.')),
      h2('What to try next'),
      p(t('The decorative snowflake bunting uses a smaller flat motif in a similar display format.')),
    ],
  },
},

// ── D2 ── snowflake bunting ───────────────────────────────────────────────────
{
  slug: 'snowflake-bunting',
  title: 'Snowflake bunting',
  subtitle: 'A 2 m string of nine crocheted snowflake motifs for seasonal display.',
  excerpt: 'Nine six-pointed snowflake motifs worked in white fingering yarn hang from a twisted cotton cord to make 2 m of seasonal bunting.',
  difficulty: 'BEGINNER',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-2-5mm',
  gauge: '1 snowflake motif = 9 cm point to point on a 2.5 mm hook with fingering yarn.',
  finishedSize: '9 snowflakes on a 2 m hanging cord.',
  stitchSlugs: ['crochet-chain', 'crochet-slip-stitch', 'crochet-double-uk', 'crochet-treble', 'crochet-picot'],
  techniqueSlugs: ['crochet-treble', 'crochet-picot', 'crochet-double-uk'],
  criticalTechniques: ['crochet-picot'],
  aliases: ['crochet snowflake garland', 'snowflake bunting', 'christmas bunting crochet'],
  glossaryTerms: [
    { slug: 'picot-snow', term: 'Picot', definition: 'A small decorative loop made by chaining 3 or 4 and slip stitching back to the base. Used at each snowflake point to create a sharp tip.' },
    { slug: 'spoke-arm', term: 'Snowflake arm', definition: 'One of the six branches radiating from the ring centre. Each arm ends in a picot tip and has side branches for detail.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet snowflake motifs are a long-established project with Victorian roots. Bunting application is synthesised.',
  body: {
    type: 'doc', content: [
      p(t('Each snowflake works from a central ring outward through six '), gt('spoke-arm', 'arms'), t('. Each arm ends with a '), gt('picot-snow', 'picot'), t(' tip and has two side branches. Starch lightly to hold the shape.')),
      p(t('Nine snowflakes thread onto a 2 m cord with regular spacing. Fingering yarn gives delicate, airy motifs. Total yarn around 80 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'White fingering yarn', qty: '80 m' },
        { name: '2.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 m twisted cotton cord', qty: '1' },
        { name: 'Starch spray', qty: 'optional' },
      ]),
      h2('Snowflake motif (make 9)'),
      p(t('Round 1: ch 6, sl st to join ring. Round 2: * ch 5, 2 tr in ring, ch 5, sl st into ring; rep 5 more times (6 arms). Round 3: work back along each arm adding side spurs and a '), gt('picot-snow', 'picot'), t(' at the tip. Fasten off.')),
      h2('Assembly'),
      p(t('Thread cord through the top picot of each snowflake. Space them 20 cm apart along the cord. Knot cord ends to loop for hanging.')),
      h2('What to try next'),
      p(t('The hanging wall star uses a similar flat motif format at a much larger scale.')),
    ],
  },
},

// ── D3 ── advent wreath ───────────────────────────────────────────────────────
{
  slug: 'advent-wreath-cover',
  title: 'Advent wreath cover',
  subtitle: 'A crocheted cover for a 25 cm round foam advent wreath base.',
  excerpt: 'A round double crochet tube worked flat then joined into a ring covers a 25 cm foam wreath base. Sprigs of crocheted leaves and bobbles decorate the front.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 st x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: 'Fits a 25 cm diameter wreath base ring.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-bobble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-bobble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet wreath cover', 'christmas wreath crochet', 'advent wreath crochet'],
  glossaryTerms: [
    { slug: 'wreath-tube', term: 'Wreath tube', definition: 'A flat dc rectangle seamed into a tube, then threaded over the wreath base and the ends joined. Covers the foam ring neatly.' },
    { slug: 'bobble-berry', term: 'Berry bobble', definition: 'A small 3-treble bobble worked as a separate small round circle and attached to the wreath surface to represent berries.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crocheted wreath covers are a modern seasonal project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The '), gt('wreath-tube', 'wreath tube'), t(' is a rectangle of dc: wide enough to slip over the foam ring cross-section, long enough to cover the full circumference. Seam into a tube, slide over the base, and join the ends.')),
      p(t('Attach small crochet leaf shapes and '), gt('bobble-berry', 'berry bobbles'), t(' around the front surface after covering the base. Total yarn around 180 m in green plus 30 m in red.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn, green', qty: '180 m' },
        { name: 'Aran yarn, red', qty: '30 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '25 cm foam wreath base', qty: '1' },
      ]),
      h2('Wreath tube'),
      p(t('Measure the cross-section of your wreath base. Chain to that width. Work dc rows until the strip equals the wreath circumference (about 78 cm). Seam short ends. Slide over wreath base. Mattress stitch the long edges closed.')),
      h2('Decorations'),
      p(t('Make small leaf shapes in green: ch 8, dc along both sides of chain, sl st to close. Make '), gt('bobble-berry', 'berry bobbles'), t(': small round circles in red. Attach leaves and berries with the tapestry needle around the covered ring.')),
      h2('What to try next'),
      p(t('The hanging wall star uses a similar assembly-and-display approach for seasonal decor.')),
    ],
  },
},

]

// ── write files ───────────────────────────────────────────────────────────────
for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: pat.subtitle,
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'homewares',
    difficulty: pat.difficulty,
    sourceType: pat.sourceType,
    sourceNotes: pat.sourceNotes,
    techniqueSlugs: pat.techniqueSlugs,
    criticalTechniques: pat.criticalTechniques,
    aliases: pat.aliases,
    glossaryTerms: pat.glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: pat.yarnWeight,
      primaryHookSlug: pat.hook,
      gaugeText: pat.gauge,
      finishedSizeText: pat.finishedSize,
      terminologyConvention: 'uk',
      craftStitchSlugs: pat.stitchSlugs,
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nDone: ${PATTERNS.length} patterns`)
