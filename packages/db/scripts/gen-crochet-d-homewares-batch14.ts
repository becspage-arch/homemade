/**
 * Generator: D-Homewares Batch 14 -- Small accents S4-S15 (12 patterns)
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-homewares-batch14.ts
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

// ── S4 ── glasses case ────────────────────────────────────────────────────────
{
  slug: 'glasses-case',
  title: 'Glasses case',
  subtitle: 'A 16 x 7 cm crochet glasses case with a button flap closure.',
  excerpt: 'A firm dc glasses case holds reading glasses or sunglasses. Worked flat in two panels seamed together, with a button flap at the top.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '16 x 7 cm, fits standard reading glasses.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet glasses case', 'spectacles case crochet', 'sunglasses pouch'],
  glossaryTerms: [
    { slug: 'dc-firm-glasses', term: 'Dense double crochet', definition: 'Dc worked at a firm tension to give the case enough body to hold its shape and protect the glasses.' },
    { slug: 'flap-closure-glasses', term: 'Button flap', definition: 'A short extra dc panel worked at the top of the front piece. Folds over the open end and buttons closed.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet glasses cases are a popular practical modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work two '), gt('dc-firm-glasses', 'dense dc'), t(' panels each 16 x 7 cm. The front panel has an extra 4 cm flap at the top that forms the '), gt('flap-closure-glasses', 'button flap'), t('. Seam three sides and add the button.')),
      p(t('Use a firm aran or cotton yarn so the case holds its shape. Total yarn around 60 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '60 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm button', qty: '1' },
      ]),
      h2('Back panel'),
      p(t('Chain 24. Work '), gt('dc-firm-glasses', 'dc rows'), t(' for 16 cm.')),
      h2('Front panel with flap'),
      p(t('Chain 24. Work dc rows for 16 cm. Continue 4 cm more for '), gt('flap-closure-glasses', 'flap'), t('. On last flap row, ch 3 for button loop.')),
      h2('Assembly'),
      p(t('Seam three sides. Fold flap over. Sew button on back panel to match loop.')),
      h2('What to try next'),
      p(t('The cutlery travel wrap uses the same flat-panel-with-tie approach for kitchen use.')),
    ],
  },
},

// ── S5 ── key fob ─────────────────────────────────────────────────────────────
{
  slug: 'crochet-key-fob',
  title: 'Crochet key fob',
  subtitle: 'A small double-layer crochet tag for a keyring, 5 x 4 cm.',
  excerpt: 'A double-layer oval dc tag attached to a split ring makes a simple key fob. Worked flat in two dc ovals seamed together.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: 'Not critical; aim for a firm flat oval.',
  finishedSize: '5 x 4 cm tag on a 3 cm split ring.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet key fob', 'keyring crochet', 'key tag crochet'],
  glossaryTerms: [
    { slug: 'oval-foundation', term: 'Oval foundation', definition: 'A chain worked from both ends to form an oval base. Stitches go around the top and bottom of the chain for a smooth oval shape.' },
    { slug: 'fob-seam', term: 'Double-layer seam', definition: 'A sl st or whipstitch seam that joins the two oval panels to form a padded tag.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet key fobs are a popular small project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Make two ovals using the '), gt('oval-foundation', 'oval foundation'), t(' method: chain 7, work dc around both sides of the chain to form an oval, working 3 dc at each end for the curve. Make two and join with a '), gt('fob-seam', 'double-layer seam'), t('.')),
      p(t('Attach to a split ring through the small loop at one end of the oval. Total yarn around 10 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '10 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '3 cm split ring', qty: '1' },
      ]),
      h2('Oval (make 2)'),
      p(t('Chain 7. Work around both sides: 3 dc in first ch, dc to last, 3 dc in last, dc back. Join, sl st. Fasten off.')),
      h2('Assembly'),
      p(t('Place ovals together, wrong sides facing. '), gt('fob-seam', 'Seam'), t(' around leaving a loop at one end for the ring. Attach split ring.')),
      h2('What to try next'),
      p(t('The cable tidy wrap uses the same small practical form for a desk organiser.')),
    ],
  },
},

// ── S6 ── luggage tag ─────────────────────────────────────────────────────────
{
  slug: 'crochet-luggage-tag',
  title: 'Crochet luggage tag',
  subtitle: 'A 10 x 7 cm double-layer crochet luggage tag with a clear window insert.',
  excerpt: 'A 10 x 7 cm double-layer dc luggage tag holds a paper name card behind a small clear window. Attaches to luggage with a leather cord.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '10 x 7 cm with a 5 x 3 cm window.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet luggage tag', 'suitcase tag crochet', 'travel tag crochet'],
  glossaryTerms: [
    { slug: 'dc-panel-tag', term: 'Dc panel', definition: 'A flat rectangle of double crochet forming the front or back of the tag.' },
    { slug: 'window-gap', term: 'Chain gap', definition: 'A row of chains spanning a gap in the front panel. The gap creates an opening for the name card, covered with a clear plastic insert.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet luggage tags are a popular small travel accessory. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('dc-panel-tag', 'dc panel'), t(' for the back (10 x 7 cm). For the front, work up to the window row then span the gap with '), gt('window-gap', 'chain'), t(', resume dc. Seam panels. Insert clear plastic cut to size over the name card slot.')),
      p(t('Attach a 15 cm leather or fabric cord loop at the top for fixing to luggage. Total yarn around 30 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '30 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Clear plastic (cut from packaging)', qty: 'small piece' },
        { name: '15 cm leather cord', qty: '1' },
      ]),
      h2('Back panel'),
      p(t('Chain 19. Work '), gt('dc-panel-tag', 'dc rows'), t(' for 7 cm.')),
      h2('Front panel with window'),
      p(t('Chain 19. Work dc rows for 2 cm. Window row: dc 3, '), gt('window-gap', 'ch 10'), t(', skip 10, dc 3. Continue dc rows for 2 cm. Seam panels.')),
      h2('What to try next'),
      p(t('The glasses case uses the same double-panel approach with a button flap.')),
    ],
  },
},

// ── S7 ── phone stand cosy ────────────────────────────────────────────────────
{
  slug: 'phone-stand-cosy',
  title: 'Phone stand cosy',
  subtitle: 'A crochet cover for a small wooden or plastic phone stand.',
  excerpt: 'A fitted dc cover for a standard small phone stand frame. Adds colour and texture and protects the phone surface from the hard stand.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: 'Fits a standard 10 x 8 cm phone stand frame.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['phone stand cover', 'mobile stand cosy', 'phone holder cosy'],
  glossaryTerms: [
    { slug: 'dc-stand-strip', term: 'Dc strip', definition: 'A narrow dc rectangle worked around the stand arm. The strip wraps the hard surface and is seamed at the back.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet phone stand covers are a modern small project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Measure each arm of the phone stand. Work a '), gt('dc-stand-strip', 'dc strip'), t(' to the arm circumference and length. Seam into a tube and slide over the arm. Repeat for each arm of the stand.')),
      p(t('Use a yarn that grips the stand surface to stop the cover from sliding. Total yarn around 30 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '30 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Phone stand', qty: '1' },
      ]),
      h2('Arm cover (make as many as needed)'),
      p(t('Measure arm circumference and length. Chain to circumference, work '), gt('dc-stand-strip', 'dc rows'), t(' to arm length. Seam long edge into tube.')),
      h2('What to try next'),
      p(t('The doorknob cover uses the same fitted tube approach for a round surface.')),
    ],
  },
},

// ── S8 ── tissue box cover ────────────────────────────────────────────────────
{
  slug: 'tissue-box-cover',
  title: 'Tissue box cover',
  subtitle: 'A 25 x 12 x 7 cm crochet cover for a standard rectangular tissue box.',
  excerpt: 'A rectangular dc cover for a standard rectangular tissue box. Worked as a tube with a top oval opening for the tissues, in chunky yarn.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '11 dc x 13 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: '25 x 12 x 7 cm, fits a standard rectangular tissue box.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['tissue box cover crochet', 'kleenex box cover', 'tissue box cosy'],
  glossaryTerms: [
    { slug: 'dc-box-tube', term: 'Rectangular tube', definition: 'A dc tube with a rectangular cross-section. The tissue cover is worked as a tube that slides over the box from the bottom, with a top opening for the tissues.' },
    { slug: 'top-opening', term: 'Top opening', definition: 'An oval or rectangular gap in the top panel of the cover. Allows the tissues to be pulled through.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet tissue box covers are a popular home accessory. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat base rectangle (25 x 12 cm), then rise up four sides in dc to form a '), gt('dc-box-tube', 'rectangular tube'), t(' 7 cm tall. Add a top panel with a '), gt('top-opening', 'top opening'), t(' centred for the tissues.')),
      p(t('Chunky yarn works up fast in a simple solid colour. Total yarn around 200 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky yarn', qty: '200 m' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Base and sides'),
      p(t('Chain 28. Work dc rows for 12 cm (base). Fold edges up and dc along all four sides for 7 cm. Join at corners.')),
      h2('Top'),
      p(t('Work top panel: dc around the top edge, leaving a 12 x 4 cm '), gt('top-opening', 'gap'), t(' in the centre for the tissues.')),
      h2('What to try next'),
      p(t('The storage pot cover uses the same tube-over-object approach for a cylindrical surface.')),
    ],
  },
},

// ── S9 ── seed packet holder ──────────────────────────────────────────────────
{
  slug: 'seed-packet-holder',
  title: 'Seed packet holder',
  subtitle: 'A 14 x 10 cm crochet envelope for storing seed packets in the garden shed.',
  excerpt: 'A firm dc envelope holds seed packets upright in a drawer or box. Worked in two flat panels seamed on three sides, with a fold-over top flap.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '14 x 10 cm envelope.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['seed packet holder', 'seed storage envelope crochet', 'garden packet pouch'],
  glossaryTerms: [
    { slug: 'dc-envelope', term: 'Dc envelope', definition: 'A flat dc rectangle seamed on three sides to form a pocket. The top edge is left open for inserting seed packets.' },
    { slug: 'envelope-flap', term: 'Flap', definition: 'An extra 5 cm dc panel at the top of the front piece, folded down to close the envelope.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet organisers for small items are a practical modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('dc-envelope', 'dc envelope'), t(' at 14 x 10 cm. Add an '), gt('envelope-flap', 'envelope flap'), t(' of 5 cm to the front piece that folds over the top. A small button or press stud keeps the flap closed.')),
      p(t('Cotton or linen DK wears well in a shed environment. Total yarn around 40 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '40 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '1.5 cm button', qty: '1' },
      ]),
      h2('Back panel'),
      p(t('Chain 26. Work '), gt('dc-envelope', 'dc rows'), t(' for 10 cm.')),
      h2('Front panel with flap'),
      p(t('Chain 26. Work dc rows for 10 cm. Continue 5 cm for '), gt('envelope-flap', 'flap'), t('. Taper last 2 rows to a point for the envelope shape. Add button loop.')),
      h2('Assembly'),
      p(t('Seam three sides. Sew button to back.')),
      h2('What to try next'),
      p(t('The glasses case uses the same flat-panel-with-flap shape for a personal item.')),
    ],
  },
},

// ── S10 ── remote control cosy ────────────────────────────────────────────────
{
  slug: 'remote-control-cosy',
  title: 'Remote control cosy',
  subtitle: 'A fitted dc cosy for a standard TV remote control.',
  excerpt: 'A fitted ribbed crochet cosy protects a standard TV remote control and makes it easier to spot on the sofa. Open at the top for button access.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 st x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: 'Fits a standard 23 x 5 cm remote control.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc', 'crochet-double-uk'],
  criticalTechniques: ['crochet-fpdc'],
  aliases: ['remote control cosy', 'TV remote cover crochet', 'remote control cover'],
  glossaryTerms: [
    { slug: 'fpdc-remote', term: 'Front post double crochet', definition: 'A dc around the post from the front. Creates raised vertical ribs that stretch to grip the remote firmly.' },
    { slug: 'bpdc-remote', term: 'Back post double crochet', definition: 'A dc around the post from the back. The recessed part of the 1x1 rib that runs along the remote cosy.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet remote cosies are a popular small modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('A 1x1 rib of '), gt('fpdc-remote', 'front post dc'), t(' and '), gt('bpdc-remote', 'back post dc'), t(' grips the remote firmly and stretches to fit different sizes. Seam the long edges after working the flat rectangle.')),
      p(t('Total yarn around 40 m. Work a base row across the bottom to close the end.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '40 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Cosy'),
      p(t('Chain 38 (remote circumference, approx. 36 cm). Work 1x1 rib ('), gt('fpdc-remote', 'fpdc'), t(', '), gt('bpdc-remote', 'bpdc'), t(') for 23 cm. Seam long edge. Work dc across one end to close. Leave top open.')),
      h2('What to try next'),
      p(t('The phone stand cosy uses the same fitted tube method for a phone accessory.')),
    ],
  },
},

// ── S11 ── wrist rest ─────────────────────────────────────────────────────────
{
  slug: 'desk-wrist-rest',
  title: 'Desk wrist rest',
  subtitle: 'A 30 x 8 cm padded crochet wrist rest for a desk or keyboard.',
  excerpt: 'A long padded dc cushion supports the wrist while typing. Worked as a flat tube stuffed firmly, 30 x 8 cm when finished.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '30 x 8 cm padded cushion.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['wrist rest crochet', 'keyboard wrist rest', 'crochet wrist pad'],
  glossaryTerms: [
    { slug: 'dc-tube-wrist', term: 'Stuffed dc tube', definition: 'A dc tube seamed on both ends and stuffed with toy filling. The tube forms the body of the wrist rest.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet wrist rests are a modern practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat dc panel 30 x 16 cm. Fold in half lengthways and seam the long edge and one short end to form a '), gt('dc-tube-wrist', 'stuffed tube'), t('. Stuff firmly with toy filling, then seam the remaining end.')),
      p(t('A non-slip yarn base or a piece of non-slip mat inside keeps the rest in place. Total yarn around 100 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '100 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Toy filling', qty: 'approx. 80 g' },
      ]),
      h2('Panel'),
      p(t('Chain 46. Work dc rows for 16 cm. Fold in half. Seam long edge and one short end.')),
      h2('Stuffing'),
      p(t('Pack firmly with filling. Seam remaining end. The '), gt('dc-tube-wrist', 'tube'), t(' should feel firm but give slightly under pressure.')),
      h2('What to try next'),
      p(t('The neck rest cushion cover uses the same stuffed tube for a sofa or travel pillow.')),
    ],
  },
},

// ── S12 ── laptop sleeve cosy ─────────────────────────────────────────────────
{
  slug: 'laptop-sleeve-cosy',
  title: 'Laptop sleeve cosy',
  subtitle: 'A padded crochet sleeve for a 13-inch laptop.',
  excerpt: 'A double-layer dc sleeve padded with wadding protects a 13-inch laptop when carried in a bag. Closes with a button flap.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '11 dc x 13 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: '34 x 24 cm, fits a 13-inch laptop.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['laptop sleeve crochet', 'laptop cosy crochet', '13 inch laptop cover'],
  glossaryTerms: [
    { slug: 'dc-sleeve-double', term: 'Double-layer sleeve', definition: 'Two dc panels with a layer of wadding between them. The wadding gives light impact protection for the laptop.' },
    { slug: 'flap-laptop', term: 'Laptop flap', definition: 'An extra dc panel at the top of the front piece. Folds over the open end of the sleeve and buttons closed.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet laptop sleeves are a popular protective accessory. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work two '), gt('dc-sleeve-double', 'double-layer'), t(' panels at 34 x 24 cm each. Place a layer of wadding between the panels on each side before seaming. The '), gt('flap-laptop', 'laptop flap'), t(' extends 8 cm beyond the top of the front panel.')),
      p(t('Chunky yarn gives a fast thick fabric. Total yarn around 400 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky yarn', qty: '400 m' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Thin wadding', qty: '35 x 25 cm x 2 pieces' },
        { name: '3 cm button', qty: '1' },
      ]),
      h2('Panels (make 2)'),
      p(t('Chain 38. Work '), gt('dc-sleeve-double', 'dc rows'), t(' for 24 cm.')),
      h2('Assembly'),
      p(t('Lay wadding on each panel. Seam panels with wadding sandwiched inside, on three sides. Work '), gt('flap-laptop', 'extra flap'), t(' on front panel: chain 38, work dc rows for 8 cm, add button loop. Sew button on back.')),
      h2('What to try next'),
      p(t('The glasses case uses the same panel-and-flap approach at a much smaller scale.')),
    ],
  },
},

// ── S13 ── crochet brooch ─────────────────────────────────────────────────────
{
  slug: 'crochet-flower-brooch',
  title: 'Crochet flower brooch',
  subtitle: 'A small five-petal crochet flower brooch in dk yarn.',
  excerpt: 'A small five-petal flower worked in the round from a central ring. A brooch pin is sewn to the back. Makes a simple, fast gift.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: 'Not critical; each flower is 5 cm diameter.',
  finishedSize: '5 cm diameter flower brooch.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-half-treble', 'crochet-treble', 'crochet-magic-ring', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['crochet brooch', 'crochet flower pin', 'flower brooch crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-brooch', term: 'Magic ring', definition: 'An adjustable loop start for the flower centre. Pulled tight to leave a neat centre with no hole.' },
    { slug: 'petal-arch', term: 'Petal arch', definition: 'A chain loop worked between the dc foundation round. Each loop holds a petal worked in dc, htr, and tr.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet flower brooches are a popular quick project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('magic-ring-brooch', 'magic ring'), t(', 10 dc. Next round: * ch 3, skip 1; rep 5 times (5 '), gt('petal-arch', 'petal arches'), t('). Each arch: dc, htr, tr, htr, dc, sl st. Fasten off. Sew a brooch pin to the back.')),
      p(t('Works well in any DK. Total yarn around 10 m per brooch.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '10 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Brooch pin', qty: '1' },
      ]),
      h2('Flower'),
      p(t('Round 1: '), gt('magic-ring-brooch', 'magic ring'), t(', 10 dc, sl st.')),
      p(t('Round 2: * ch 3, skip 1 dc, sl st; rep x5 (5 arches).')),
      p(t('Petals: for each arch, dc, htr, tr, htr, dc, sl st. Fasten off.')),
      h2('Finishing'),
      p(t('Sew brooch pin to back. Press flat if needed.')),
      h2('What to try next'),
      p(t('The crochet tassel set uses the same small yarn-craft approach for a different type of accessory.')),
    ],
  },
},

// ── S14 ── hair tie holder ────────────────────────────────────────────────────
{
  slug: 'hair-tie-holder',
  title: 'Hair tie holder',
  subtitle: 'A small crochet bag to store hair ties and grips on a dressing table.',
  excerpt: 'A small 10 cm crochet bag holds hair ties, clips, and grips in one place on a dressing table or in a bag.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '10 cm diameter x 8 cm tall.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['hair tie holder', 'hair accessory bag crochet', 'hair grip pouch'],
  glossaryTerms: [
    { slug: 'magic-ring-hair', term: 'Magic ring', definition: 'An adjustable loop start for the circular base of the hair tie bag. Pulls closed to leave a neat base.' },
    { slug: 'drawstring-hair', term: 'Drawstring channel', definition: 'A round of chain-space holes near the top of the bag. A yarn drawstring is threaded through to close the bag.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet pouches are a well-established small project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat circle base from a '), gt('magic-ring-hair', 'magic ring'), t(' to 10 cm, then rise straight in dc for 8 cm. Near the top, work a '), gt('drawstring-hair', 'drawstring channel'), t(' round of * dc 2, ch 1; rep. Thread a yarn drawstring through to close.')),
      p(t('Total yarn around 50 m. Make in a bright colour for easy spotting in a bag.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '50 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Base'),
      p(t('Round 1: '), gt('magic-ring-hair', 'magic ring'), t(', 6 dc. Increase 6 per round to 10 cm. BLO fold round.')),
      h2('Body'),
      p(t('Work dc spiral for 6 cm. Drawstring round: * dc 2, ch 1; rep. Final dc round. Fasten off. Thread drawstring.')),
      h2('What to try next'),
      p(t('The market shopper tote uses the same circular-base-and-rise approach at a much larger size.')),
    ],
  },
},

// ── S15 ── mouse pad ──────────────────────────────────────────────────────────
{
  slug: 'crochet-mouse-pad',
  title: 'Crochet mouse pad',
  subtitle: 'A firm 20 x 18 cm dc mouse pad for a desk.',
  excerpt: 'A flat 20 x 18 cm mouse pad in cotton dc. The dense flat fabric works with most mouse types and protects the desk surface.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-3-5mm',
  gauge: '20 dc x 22 rows = 10 x 10 cm in cotton DK on a 3.5 mm hook.',
  finishedSize: '20 x 18 cm flat.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-blo-dc'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-blo-dc'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet mouse pad', 'mouse mat crochet', 'desk mat crochet'],
  glossaryTerms: [
    { slug: 'blo-mousepad', term: 'BLO double crochet', definition: 'Dc worked into the back loop only. Leaves a smooth right-side surface that gives a consistent glide for the mouse.' },
    { slug: 'cotton-dense-mousepad', term: 'Dense cotton dc', definition: 'A tight-tension dc on a hook one size smaller than usual. Produces a firm flat fabric with little flex, similar in feel to a fabric mouse mat.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet mouse mats are a modern desk accessory project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('blo-mousepad', 'BLO double crochet'), t(' throughout for a flat, smooth surface. Use a 3.5 mm hook with DK cotton to produce '), gt('cotton-dense-mousepad', 'dense cotton dc'), t(' that lies flat and does not curl at the edges.')),
      p(t('Block flat after finishing. Total yarn around 60 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: '100% cotton DK yarn', qty: '60 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Mouse pad'),
      p(t('Chain 41. Work '), gt('blo-mousepad', 'BLO dc'), t(' every row for 18 cm. Fasten off. Block flat on a towel and leave to dry fully.')),
      h2('What to try next'),
      p(t('The desk wrist rest uses the same firm cotton dc approach for a padded desk accessory.')),
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
