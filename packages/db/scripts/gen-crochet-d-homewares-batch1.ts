/**
 * Generator: D-Homewares Batch 1 — Blankets 1-40
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-homewares-batch1.ts
 * Writes JSON files to briefs-crochet-d-homewares/
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-homewares')
mkdirSync(OUT, { recursive: true })

// ── TipTap helpers ────────────────────────────────────────────────────────────
function p(...nodes: object[]) {
  if (nodes.length === 1 && typeof (nodes[0] as any).text === 'string') {
    return { type: 'paragraph', content: [nodes[0]] }
  }
  return { type: 'paragraph', content: nodes }
}
function pt(text: string) { return { type: 'text', text } }
function h2(text: string) {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] }
}
function gt(termSlug: string, text: string) {
  return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text }
}
function li(...content: object[]) {
  return { type: 'listItem', content: [{ type: 'paragraph', content: content }] }
}
function ol(...items: object[]) { return { type: 'orderedList', content: items } }
function ul(...items: object[]) { return { type: 'bulletList', content: items } }
function supplies(heading: string, items: { name: string; qty: string; substitutions?: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}
function trouble(heading: string, intro: string, items: { symptom: string; cause: string; fix: string }[]) {
  return { type: 'troubleshooter', attrs: { heading, intro, items } }
}
// Plain text shorthand
function t(text: string) { return { type: 'text', text } }

// ── Pattern definitions ───────────────────────────────────────────────────────
interface Pattern {
  slug: string
  title: string
  subtitle: string
  excerpt: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  yarnWeight: string
  hook: string
  gauge: string
  finishedSize: string
  stitchSlugs: string[]
  techniqueTags: string[]
  techniqueSlugs: string[]
  criticalTechniques: string[]
  aliases: string[]
  glossaryTerms: { slug: string; term: string; definition: string }[]
  sourceType: string
  sourceNotes: string
  body: object
}

const PATTERNS: Pattern[] = [

// ── 1 ── granny stripe baby blanket ──────────────────────────────────────────
{
  slug: 'granny-stripe-baby-blanket',
  title: 'Granny stripe baby blanket',
  subtitle: 'A simple stripe worked row by row in treble clusters.',
  excerpt: 'Rows of treble clusters in alternating colours make a fast, stretchy baby blanket in DK cotton. No joining, no motifs, just one long stripe after another.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '16 tr × 8 rows = 10 × 10 cm in DK cotton with a 4 mm hook, unblocked.',
  finishedSize: 'Baby blanket, 75 × 90 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-treble', 'crochet-slip-stitch', 'crochet-granny-cluster'],
  techniqueTags: ['colour-change', 'weaving-in-ends', 'working-back-and-forth'],
  techniqueSlugs: ['crochet-colour-change', 'crochet-chain-foundation', 'crochet-treble'],
  criticalTechniques: ['crochet-treble', 'crochet-colour-change'],
  aliases: ['granny stripe blanket', 'stripe crochet blanket', 'baby crochet blanket'],
  glossaryTerms: [
    { slug: 'turning-chain', term: 'Turning chain', definition: 'The chains worked at the start of a row to bring the hook up to the height of the new row\'s stitches. For trebles, the turning chain is three chains.' },
    { slug: 'colour-change-crochet', term: 'Colour change', definition: 'Swapping to a new yarn colour by pulling the new colour through the final loop of the last stitch in the old colour.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle so the fabric holds without knots showing.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Stripe construction draws on the Victorian striped afghan tradition documented in Weldon\'s Practical Crochet (2nd series, 1880s, Internet Archive). Treble-cluster stripe is a modern simplification of the Victorian long-stitch strip.',
  body: {
    type: 'doc',
    content: [
      p(t('A granny stripe baby blanket is 75 x 90 cm. Each row is a strip of treble clusters. The colours swap every row to build up the stripe.')),
      p(t('The clusters are three trebles into the same chain space, the same move as a granny square corner. Each '), gt('colour-change-crochet', 'colour change'), t(' happens at the end of a row, keeping the join on the wrong side. The finished fabric is stretchy and machine-washable. At the stated gauge it drapes a standard cot mattress lengthways with a little overhang.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton yarn, Colour A', qty: '100 g', substitutions: 'Any smooth DK cotton or cotton-acrylic blend.' },
        { name: 'DK cotton yarn, Colour B', qty: '100 g' },
        { name: 'DK cotton yarn, Colour C', qty: '100 g' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('16 tr x 8 rows = 10 x 10 cm in DK cotton with a 4 mm hook, unblocked. Work a 20-stitch swatch across 10 rows to check. If your swatch comes out wider than 10 cm, go down a hook size; if narrower, go up. At this gauge the blanket reaches 75 x 90 cm. A gauge drift of one stitch per 10 cm adds or removes about 6 cm on the width.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('sl st: slip stitch')),
        li(t('tr (UK) / dc (US): treble, one yarn-over before inserting hook, three loops worked off two at a time')),
        li(t('gr-cl: granny cluster, three trebles into the same chain space')),
      ),
      h2('Pattern'),
      p(t('Foundation chain: using Colour A, chain 121. This makes 40 clusters across plus a turning chain at each end.')),
      h2('Row 1 (right side, Colour A)'),
      p(t('Work a '), gt('turning-chain', 'turning chain'), t(' of 3 ch (counts as first tr). Skip the first 3 ch. *Work 3 tr into the next ch space (one gr-cl made), ch 1, skip 1 ch*. Repeat from * to * to last 3 ch. Work 3 tr into last ch space. Turn. (40 gr-cl, 39 ch-1 spaces.)')),
      h2('Row 2 (wrong side, Colour B)'),
      p(t('Join Colour B to the ch-3 turning chain of Row 1. Ch 3. *Work 3 tr into the next ch-1 space, ch 1*. Repeat across. Work 1 tr into the top of the turning chain. Turn. Cut Colour A leaving a 15 cm tail. (40 gr-cl.)')),
      h2('Row 3 (Colour C)'),
      p(t('Join Colour C. Work as Row 2. Cut Colour B. (40 gr-cl.)')),
      h2('Continuing the stripe'),
      p(t('Continue working one row per colour in the order A, B, C, A, B, C. Work 72 rows total (24 repeats of the three-colour stripe). Fasten off.')),
      h2('Sizing up or down'),
      p(t('For a wider blanket: add stitches in multiples of 4 to the foundation chain. For a longer blanket: work more rows. Each 3-row stripe adds about 3.5 cm in height at this gauge. A single-bed size (90 x 120 cm) needs a foundation chain of 157 and 102 rows.')),
      h2('Finishing'),
      p(t('Thread all tails with the tapestry needle, running each one along the row edges. '), gt('weaving-in-ends', 'Weaving in ends'), t(' along the stripe edges hides the tails in the fold. Block lightly with a steam iron on the wool setting held 2 cm above the fabric if the edges curl.')),
      h2('Care'),
      p(t('Machine wash on a gentle 30-degree cycle. Reshape while damp. Dry flat. Do not tumble dry cotton; it shrinks and distorts the stripe alignment.')),
      h2('What to try next'),
      p(t('Work the same stripe in DK acrylic for a warmer throw with easier care. Or try the ripple blanket pattern, which adds a gentle zigzag to the same treble-cluster base.')),
      trouble('Common problems', 'What goes wrong on a first stripe blanket.', [
        { symptom: 'Edges curling inward', cause: 'Turning chain too tight', fix: 'Work the turning chain on a hook size larger, or add an extra chain at the turn.' },
        { symptom: 'Row count drifting', cause: 'Skipping the turn chain at row ends', fix: 'Count the turning chain as the first treble and work the final cluster of each row into the top of the previous row\'s turning chain.' },
        { symptom: 'Colour joins visible on right side', cause: 'Joining new colour on right-side row', fix: 'Always join new colours at the end of the wrong-side row so the knot lands on the back.' },
      ]),
    ],
  },
},

// ── 2 ── granny square join blanket ──────────────────────────────────────────
{
  slug: 'granny-square-join-blanket',
  title: 'Granny square join blanket',
  subtitle: 'Classic four-round granny squares joined edge to edge.',
  excerpt: 'Forty-two classic four-round granny squares, joined as you go on the final round. Each square is 15 cm and the finished blanket is 90 x 105 cm in DK cotton.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '1 four-round granny square = 15 x 15 cm with a 4 mm hook in DK cotton.',
  finishedSize: 'Blanket, 90 x 105 cm (6 x 7 squares).',
  stitchSlugs: ['crochet-chain', 'crochet-treble', 'crochet-slip-stitch', 'crochet-granny-cluster', 'crochet-magic-ring'],
  techniqueTags: ['magic-ring', 'join-as-you-go', 'working-in-the-round'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-join-as-you-go', 'crochet-treble'],
  criticalTechniques: ['crochet-magic-ring', 'crochet-join-as-you-go', 'crochet-treble'],
  aliases: ['granny square blanket', 'joined granny squares', 'crochet square blanket'],
  glossaryTerms: [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop for in-the-round work. Pulls closed to leave no centre hole. Also called a magic circle.' },
    { slug: 'jayg', term: 'Join-as-you-go', definition: 'Joining motifs on the final round of each one by replacing a corner or side chain with a slip stitch into the adjacent motif, instead of sewing motifs together afterwards.' },
    { slug: 'chain-space', term: 'Chain space', definition: 'The gap formed by one or more chains, into which the next round works its clusters.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle so the fabric holds without knots showing.' },
  ],
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: 'Granny square construction from Weldon\'s Practical Crochet (1st series, 1880s). The four-round square is the standard Victorian pattern square. Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A granny square join blanket is made from 42 classic four-round squares, each 15 cm across, joined edge to edge as you crochet the final round of each new square. The finished piece is 90 x 105 cm, which drapes a standard single bed to the pillow line.')),
      p(t('The '), gt('jayg', 'join-as-you-go'), t(' method means no sewing at the end: when you reach a corner or side chain on the final round, you slip stitch into the matching point on the neighbouring square instead of chaining. Work all squares in the same colour for a clean grid look, or change colour square by square for a patchwork effect. Yardage for the solid version is 400 g DK cotton on a 4 mm hook.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton yarn', qty: '400 g total (one or more colours)' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '4' },
      ]),
      h2('Gauge'),
      p(t('One four-round granny square = 15 x 15 cm with a 4 mm hook in DK cotton, unblocked. Make one test square and measure across the centre from edge to edge. If it measures more than 15 cm, go down one hook size; if less, go up. At 15 cm per square, 6 across x 7 down gives 90 x 105 cm.')),
      h2('Stitches used'),
      ul(
        li(gt('magic-ring', 'MR'), t(': magic ring')),
        li(t('ch: chain')),
        li(t('sl st: slip stitch (closing rounds and JAYG joins)')),
        li(t('tr (UK) / dc (US): treble')),
        li(t('gr-cl: granny cluster, 3 tr into the same '), gt('chain-space', 'chain space')),
      ),
      h2('Single square, four rounds'),
      p(t('Make a '), gt('magic-ring', 'magic ring'), t('.')),
      p(t('Round 1: Ch 3 (counts as 1 tr). Work 2 tr into the ring. Ch 2. *3 tr into the ring, ch 2*. Repeat 3 more times. Sl st to top of ch-3 to close. Pull ring closed. (4 gr-cl, 4 ch-2 corner spaces.)')),
      p(t('Round 2: Sl st across to first ch-2 corner space. Ch 3. Work (2 tr, ch 2, 3 tr) into same corner space. *Ch 1. Work (3 tr, ch 2, 3 tr) into next corner space*. Repeat from * to * twice more. Ch 1. Sl st to close. (8 gr-cl, 4 ch-2 corners, 4 ch-1 sides.)')),
      p(t('Round 3: Sl st to corner. Ch 3. Work (2 tr, ch 2, 3 tr) into corner. *Ch 1. Work 3 tr into ch-1 side space. Ch 1. Work (3 tr, ch 2, 3 tr) into next corner*. Repeat 3 more times ending with ch 1. Sl st to close. (12 gr-cl, 4 corners, 8 sides.)')),
      p(t('Round 4: Work as Round 3, adding one more ch-1 and 3-tr cluster on each side. (16 gr-cl, 4 corners, 12 sides.) Fasten off leaving a tail for weaving.')),
      h2('Join-as-you-go on Round 4'),
      p(t('On the final square in a row or when placing a square adjacent to a completed square, replace each joining ch-2 corner with "ch 1, sl st into matching corner space of adjacent square, ch 1", and replace each joining ch-1 side with "sl st into matching side space of adjacent square". This creates a flat, invisible join.')),
      h2('Working order'),
      p(t('Make the first 6 squares (one full row) individually, then join each subsequent square on Round 4 to its left-hand neighbour. When starting a new row, join each new square to the square above as well as to the left. Work 7 rows of 6 squares each.')),
      h2('Edging'),
      p(t('After joining, work one round of dc (UK) around the entire blanket border: 1 dc into each stitch, 1 dc into each ch-1 side space, 2 dc into each ch-2 corner, and 1 dc into each join point. This smooths the outer edge and ties the squares into one fabric.')),
      h2('Finishing'),
      p(t('Use '), gt('weaving-in-ends', 'weaving in ends'), t(' with the tapestry needle to secure all tails. Block: wet-block the cotton by submerging in cool water, squeezing out excess, and pinning flat to the stated dimensions. Allow to dry completely before unpinning.')),
      h2('Care'),
      p(t('Machine wash 30 degrees, gentle cycle. Reshape while damp and dry flat. DK cotton does not tumble dry well.')),
      h2('What to try next'),
      p(t('Try the granny hexagon blanket next, or the c2c blanket for a diagonal take on the same stitch.')),
    ],
  },
},

// ── 3 ── ripple baby blanket ──────────────────────────────────────────────────
{
  slug: 'ripple-baby-blanket',
  title: 'Ripple baby blanket',
  subtitle: 'A gentle zigzag in DK cotton, worked back and forth in one piece.',
  excerpt: 'Shell increases and double-crochet decreases produce a shallow ripple across a 75 x 90 cm baby blanket. One piece, no seams, machine-washable DK cotton.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '16 dc × 9 rows = 10 × 10 cm in DK cotton with a 4 mm hook.',
  finishedSize: 'Baby blanket, 75 x 90 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-shell', 'crochet-dc2tog'],
  techniqueTags: ['ripple-pattern', 'working-back-and-forth', 'colour-change'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog', 'crochet-shell', 'crochet-ripple-foundation'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['ripple blanket', 'chevron crochet blanket', 'zigzag baby blanket'],
  glossaryTerms: [
    { slug: 'turning-chain', term: 'Turning chain', definition: 'The chains worked at the start of a row to bring the hook up to the height of the new row\'s stitches.' },
    { slug: 'dc2tog', term: 'Dc2tog', definition: 'Double crochet two stitches together: insert hook into first stitch, pull up loop; insert into next, pull up loop; yarn over and pull through all three. One stitch decreased. The ripple valley move.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Ripple (wave stitch) documented in Weldon\'s Practical Crochet (5th series, 1890s). Modern simplified form. Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A ripple baby blanket is a 75 x 90 cm flat rectangle with a shallow zigzag running across its width, worked back and forth in one piece on a foundation chain. The wave is made by working a five-treble shell at each peak and '), gt('dc2tog', 'dc2tog'), t(' twice at each valley, so the stitch count stays constant across every row.')),
      p(t('DK cotton in two or three colours is the classic choice: each colour runs for two rows to make clean stripe edges. At this gauge the blanket fits a standard cot lengthways with 10 cm overhang. Total yardage is around 350 g.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton, Colour A (main)', qty: '150 g' },
        { name: 'DK cotton, Colour B', qty: '100 g' },
        { name: 'DK cotton, Colour C', qty: '100 g' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Gauge'),
      p(t('16 dc x 9 rows = 10 x 10 cm in DK cotton with a 4 mm hook. Gauge matters here because the ripple pattern is balanced on a multiple of 12 stitches plus 3. A one-stitch difference per 10 cm shifts the finished width by about 5 cm.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK) / sc (US): double crochet, the valley stitch')),
        li(t('tr (UK) / dc (US): treble, five into the same stitch make the peak shell')),
        li(t('dc2tog (UK) / sc2tog (US): double crochet two together, the valley decrease')),
      ),
      h2('Foundation chain'),
      p(t('Using Colour A, chain 123. This sets up 10 ripple repeats (12 stitches each) plus 3 edge stitches.')),
      h2('Row 1 (right side)'),
      p(t('Work a '), gt('turning-chain', 'turning chain'), t(' of ch 1 (does not count as stitch). Dc into 2nd ch from hook. Dc into next ch. *Skip 2 ch. Work 5 tr into next ch (peak shell made). Skip 2 ch. Dc into each of the next 3 ch. Then dc2tog over next 2 ch, dc2tog over next 2 ch (valley made). Dc into each of next 3 ch*. Repeat to last 6 ch. Skip 2 ch. Work 5 tr into next ch. Skip 2 ch. Dc into last 3 ch. Turn. (10 peaks, 9 valleys, flat ends.)')),
      h2('Row 2 (wrong side)'),
      p(t('Ch 1. Dc into first stitch. *Dc into each of next 2 stitches. Work 5 tr into the 3rd tr of peak. Dc into each of next 2 stitches. Dc2tog twice (valley). Dc into each of next 2 stitches*. Repeat. End with 5 tr into last peak, dc into last 3 stitches. Turn.')),
      h2('Stripe sequence'),
      p(t('Work 2 rows each in Colour A, Colour B, Colour C, back to A. Continue until piece measures 90 cm. Fasten off.')),
      h2('Edging'),
      p(t('Join Colour A at any corner. Work one round of dc around the entire border, working 1 dc into each stitch along top and bottom, 1 dc into each row end on sides, and 3 dc into each corner. Fasten off.')),
      h2('Finishing'),
      p(t('Use '), gt('weaving-in-ends', 'weaving in ends'), t(' to secure each tail along 3-4 stitches in matching colour rows. Block lightly with a steam iron held 2 cm above the surface to relax the ripple.')),
      h2('Care'),
      p(t('Machine wash 30 degrees gentle. Dry flat. The ripple stretches in width when wet, so pin to the stated width while drying if the blanket is for a cot.')),
      h2('What to try next'),
      p(t('The chevron blanket uses the same ripple base but with a sharper peak. Or try the corner-to-corner baby blanket for a diagonal take on the same stitch count.')),
    ],
  },
},

// ── 4 ── chevron blanket ──────────────────────────────────────────────────────
{
  slug: 'chevron-blanket',
  title: 'Chevron blanket',
  subtitle: 'Sharp V-shaped stripes in aran-weight yarn.',
  excerpt: 'A bold chevron blanket with crisp peaks and valleys, worked in aran-weight acrylic on a 5 mm hook. Quicker than a DK version and warmer for a lap throw.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc × 8 rows = 10 × 10 cm in aran acrylic with a 5 mm hook.',
  finishedSize: 'Lap throw, 90 x 100 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-dc2tog'],
  techniqueTags: ['chevron-pattern', 'working-back-and-forth', 'colour-change'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog', 'crochet-chevron-increase', 'crochet-colour-change'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['chevron crochet', 'v-stripe blanket', 'crochet zigzag throw'],
  glossaryTerms: [
    { slug: 'turning-chain', term: 'Turning chain', definition: 'The chains at the start of a row that match the height of the row\'s main stitch.' },
    { slug: 'dc2tog', term: 'Dc2tog', definition: 'UK abbreviation. Double crochet two stitches together: insert hook into first stitch, pull up loop; insert into next, pull up loop; yarn over and pull through all three loops.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Chevron pattern from Victorian wave-stitch family in Weldon\'s Practical Crochet (3rd series, 1890s). Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A chevron blanket is a 90 x 100 cm lap throw with sharp V-shaped stripes running across the width, worked back and forth in aran-weight yarn on a 5 mm hook. The peaks are made by working three stitches into one, and the valleys by working three stitches together, so the increases and decreases cancel out and the row stays flat.')),
      p(t('Aran-weight acrylic is a practical choice: it washes and dries quickly and the thicker yarn means the blanket works up faster than a DK version. Two colours, three rows each, give a classic chevron stripe. Total yardage is around 600 g of aran acrylic.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran acrylic or wool blend, Colour A', qty: '300 g' },
        { name: 'Aran acrylic or wool blend, Colour B', qty: '300 g' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Gauge'),
      p(t('14 dc x 8 rows = 10 x 10 cm in aran acrylic with a 5 mm hook. Make a 20-stitch swatch. The chevron repeat is 12 stitches wide, so a one-stitch gauge error shifts the width of each chevron by about 2 cm over 90 cm.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK) / sc (US): double crochet')),
        li(t('tr (UK) / dc (US): treble (peak increase, 3 tr into 1 stitch)')),
        li(t('dc2tog (UK) / sc2tog (US): valley decrease')),
      ),
      h2('Foundation chain'),
      p(t('Using Colour A, chain 121 (10 chevron repeats x 12 stitches + 1 edge stitch).')),
      h2('Row 1'),
      p(gt('turning-chain', 'Turning chain'), t(' of ch 1. Dc into 2nd ch from hook and each ch across. Turn. (120 dc.)')),
      h2('Row 2 (chevron row)'),
      p(t('Ch 1. Dc into first stitch. *Work 3 tr into next stitch (peak). Dc into next 4 stitches. '), gt('dc2tog', 'Dc2tog'), t(' twice (valley, removes 2 stitches). Dc into next 4 stitches*. Repeat ending with 3 tr into second-to-last stitch. Dc into last stitch. Turn. (Same count: 120.)')),
      h2('Continuing'),
      p(t('Repeat Row 2 for every row, changing colour every 3 rows. Work 80 rows total for 100 cm. Fasten off.')),
      h2('Edging'),
      p(t('Work 2 rounds of dc (UK) around the entire border: 1 dc into each stitch along top and bottom, 1 dc into each row end on sides, 3 dc into corners. Change colour for the second edging round if desired.')),
      h2('Finishing'),
      p(t('Secure all tails using '), gt('weaving-in-ends', 'weaving in ends'), t('. Acrylic does not benefit from wet blocking. Lay flat and use a steam iron held 3 cm above if the edges ruffle.')),
      h2('Care'),
      p(t('Machine wash 40 degrees, normal cycle. Tumble dry low. Avoid high heat which sets permanent creases in acrylic.')),
      h2('What to try next'),
      p(t('For a more intricate texture, try the basketweave blanket. For a continuous-colour version of the V-shape, the c2c blanket uses corner-to-corner construction to produce diagonal chevron panels.')),
    ],
  },
},

// ── 5 ── c2c baby blanket ─────────────────────────────────────────────────────
{
  slug: 'c2c-baby-blanket',
  title: 'Corner-to-corner baby blanket',
  subtitle: 'Diagonal squares built from one corner to the other.',
  excerpt: 'The corner-to-corner (c2c) method works a diagonal grid of small treble-cluster squares from one corner of a baby blanket to the opposite. No seams.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '1 c2c square = 2.5 x 2.5 cm with a 4 mm hook in DK cotton. 30 x 36 squares = 75 x 90 cm.',
  finishedSize: 'Baby blanket, 75 x 90 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-treble', 'crochet-slip-stitch', 'crochet-granny-cluster'],
  techniqueTags: ['corner-to-corner', 'diagonal-construction', 'working-in-small-squares'],
  techniqueSlugs: ['crochet-c2c-method', 'crochet-treble', 'crochet-diagonal-increase'],
  criticalTechniques: ['crochet-treble', 'crochet-c2c-method'],
  aliases: ['c2c blanket', 'corner to corner crochet', 'diagonal crochet blanket'],
  glossaryTerms: [
    { slug: 'c2c-square', term: 'C2c square', definition: 'The smallest unit of corner-to-corner crochet: one chain-6 arch and three trebles worked into the arch.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
    { slug: 'increase-row', term: 'Increase row', definition: 'In c2c construction, a row where a new square is added at both the start and end, growing the diagonal width by one square on each side.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'C2c construction is a modern derivation of the Victorian diagonal square method. No direct public-domain source; synthetic from contemporary technique documentation.',
  body: {
    type: 'doc',
    content: [
      p(t('A corner-to-corner baby blanket is 75 x 90 cm. The fabric is made from a diagonal grid of small treble-cluster '), gt('c2c-square', 'squares'), t('. Work starts at one corner and grows with '), gt('increase-row', 'increase rows'), t(' until the piece is at its widest. Then the rows shrink back down to the opposite corner.')),
      p(t('Each square takes about 30 seconds on a 4 mm hook in DK cotton. The grid runs at 45 degrees to the finished edge, giving the fabric a subtle diagonal texture. DK cotton at this gauge makes 30 squares across the widest row and 36 rows down the length, for a total of 1,080 squares. Total yardage is around 400 g.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton yarn', qty: '400 g (one or more colours)' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch counter or tally', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('One c2c square = 2.5 x 2.5 cm with a 4 mm hook in DK cotton. Make 4 squares in a row and measure: the strip should be 10 cm. This is more accurate than a traditional swatch for c2c because the square size is the gauge unit.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('sl st: slip stitch (to connect squares in a row)')),
        li(t('tr (UK) / dc (US): treble')),
        li(t('c2c square: ch 6, work 3 tr into the 4th ch from hook (a miniature cluster)')),
      ),
      h2('One c2c square'),
      p(t('Ch 6. Work 3 tr into the 4th chain from hook. This is one c2c square: one arch and three trebles.')),
      h2('Increase phase, Rows 1 to 30'),
      p(t('Row 1: Make 1 c2c square. (1 square wide.)')),
      p(t('Row 2: Sl st up the side of the square just made to reach the top. Ch 6, work 3 tr into 4th ch from hook (new square made). Sl st down into the ch-6 arch of Row 1. Ch 6, work 3 tr into 4th ch from hook (second new square). (2 squares wide.)')),
      p(t('Each increase row: add one square at the start and one at the end. Continue until Row 30 (30 squares across the diagonal). This is the widest row.')),
      h2('Decrease phase, Rows 31 to 60'),
      p(t('From Row 31 onward, do not add a new square at the start of each row. Sl st across the top of the edge square instead of chaining a new one. Continue adding one at the end of alternate rows until Row 60 (one square, the opposite corner).')),
      h2('Colour changes'),
      p(t('Join a new colour at the start of any row. Cut the old colour, leaving a 15 cm tail. Colour changes show on the diagonal, producing diagonal stripe effects.')),
      h2('Finishing'),
      p(t('Work one round of dc (UK) around the outer edge: 2 dc into each tr on open edges, 1 dc into each sl st point. This smooths the stepped diagonal edge. Fasten off. Secure all tails with '), gt('weaving-in-ends', 'weaving in ends'), t('.')),
      h2('Care'),
      p(t('Machine wash 30 degrees, gentle. Dry flat. Pin to the stated dimensions while damp if the edges shift.')),
      h2('What to try next'),
      p(t('For a pixel design, use two colours per row and swap mid-row to make a picture in the diagonal grid. Or try the corner-to-corner adult throw in aran-weight yarn for a much faster version.')),
    ],
  },
},

// ── 6 ── simple treble adult throw ───────────────────────────────────────────
{
  slug: 'simple-treble-adult-throw',
  title: 'Simple treble adult throw',
  subtitle: 'Plain treble rows in aran-weight yarn for a quick weekend project.',
  excerpt: 'A 120 x 150 cm aran-weight throw in plain treble rows. Nothing to count except the stitch total and the length. Finishes in a weekend on a 5 mm hook.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 tr × 7 rows = 10 × 10 cm in aran yarn with a 5 mm hook.',
  finishedSize: 'Adult throw, 120 x 150 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-treble'],
  techniqueTags: ['working-back-and-forth', 'plain-treble', 'beginner'],
  techniqueSlugs: ['crochet-treble', 'crochet-chain-foundation'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['adult crochet throw', 'plain treble throw', 'easy crochet blanket'],
  glossaryTerms: [
    { slug: 'turning-chain', term: 'Turning chain', definition: 'Three chains at the start of each treble row to bring the hook to the correct height. The turning chain counts as the first treble of the row.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle so they cannot pull loose.' },
  ],
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: 'Plain treble row blanket from Weldon\'s Practical Crochet (1st series, 1880s). Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A simple treble throw is a 120 x 150 cm rectangle of plain treble rows worked back and forth in aran-weight yarn on a 5 mm hook. It is a one-stitch project: no stitch pattern to follow, no colour changes required. The only task is counting the row total and checking the length occasionally.')),
      p(t('Aran-weight yarn covers ground quickly; at the stated gauge the throw reaches full length in around 105 rows. Wool or wool-blend aran produces a warmer, drapier fabric; acrylic is machine washable and cheaper. Total yardage is about 700 g.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran wool or acrylic blend', qty: '700 g' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('14 tr x 7 rows = 10 x 10 cm in aran yarn with a 5 mm hook. Make a 20-stitch swatch. At this gauge, a foundation chain of 169 gives a 120 cm finished width. If your gauge is tighter or looser, adjust the chain count accordingly.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK) / dc (US): treble, the single stitch used throughout')),
      ),
      h2('Pattern'),
      p(t('Foundation chain: chain 169.')),
      p(t('Row 1: Work 1 tr into the 4th ch from hook (the first 3 ch count as 1 tr). Work 1 tr into every remaining ch. Turn. (167 tr.)')),
      p(t('Row 2 onward: Work a '), gt('turning-chain', 'turning chain'), t(' of ch 3 (counts as 1 tr). Skip the first stitch. Work 1 tr into every stitch across. Work 1 tr into the top of the turning chain at the end. Turn. (167 tr.)')),
      p(t('Repeat Row 2 until the piece measures 150 cm, approximately 105 rows. Fasten off.')),
      h2('Edging (optional)'),
      p(t('For a neater edge, work one round of dc (UK) around the perimeter. Work 1 dc into each stitch along the top and bottom. Work 1 dc into each row-end on the sides. Work 3 dc into each corner.')),
      h2('Finishing'),
      p(t('Secure both tails with '), gt('weaving-in-ends', 'weaving in ends'), t(', threading each tail along 3-4 stitches in the fabric. Block wool with steam. Acrylic needs no blocking.')),
      h2('Care'),
      p(t('Wool: handwash cool, squeeze in a towel, dry flat. Acrylic: machine wash 40 degrees, tumble dry low.')),
      h2('What to try next'),
      p(t('Try the basketweave throw for the same yarn weight with a woven post-stitch texture. Or the granny stripe blanket for a colourwork version of the same basic rectangle.')),
    ],
  },
},

// ── 7 ── v-stitch blanket ─────────────────────────────────────────────────────
{
  slug: 'v-stitch-blanket',
  title: 'V-stitch blanket',
  subtitle: 'Open lacy panels built from two-treble V fans.',
  excerpt: 'Two trebles separated by one chain make a V-stitch that builds an open, semi-lacy blanket in DK cotton. The repeated V creates a honeycomb-like grid across the fabric.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '8 V-sts × 8 rows = 10 × 10 cm in DK cotton with a 4 mm hook.',
  finishedSize: 'Baby blanket, 75 x 90 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-treble', 'crochet-v-stitch', 'crochet-double-uk'],
  techniqueTags: ['v-stitch', 'lace-adjacent', 'working-back-and-forth'],
  techniqueSlugs: ['crochet-v-stitch', 'crochet-treble'],
  criticalTechniques: ['crochet-v-stitch', 'crochet-treble'],
  aliases: ['v stitch crochet', 'v-stitch baby blanket', 'open stitch blanket'],
  glossaryTerms: [
    { slug: 'v-stitch', term: 'V-stitch', definition: 'Two trebles separated by one chain, both worked into the same base stitch or space. The two legs of the V spread into a fan.' },
    { slug: 'turning-chain', term: 'Turning chain', definition: 'Three chains at the start of each treble-height row.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'V-stitch documented in Weldon\'s Practical Crochet (series 2, 1880s). Lacy shell and fan stitch family. Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A '), gt('v-stitch', 'V-stitch'), t(' blanket is a 75 x 90 cm piece made by working two trebles with one chain between them into the chain space of each V from the previous row. The result is an open, semi-lacy fabric that is lighter than a solid treble blanket and shows the stitch repeat cleanly in smooth DK cotton.')),
      p(t('DK cotton in a pale colour works best here because the open structure is the visual interest. In a variegated yarn the V pattern disappears into the colour changes. Total yardage is around 280 g, less than a solid blanket of the same size because of the open gaps.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton yarn', qty: '280 g' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Gauge'),
      p(t('8 V-sts x 8 rows = 10 x 10 cm in DK cotton with a 4 mm hook. Work a sample of 16 V-sts across 8 rows to check. Each V is about 1.2 cm wide; at this gauge 60 V-sts across gives 75 cm.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK) / sc (US): double crochet (edge stitches)')),
        li(t('V-st: (tr, ch 1, tr) all into the same space')),
      ),
      h2('Foundation chain'),
      p(t('Chain 151 (75 V-sts x 2 chain + 1 edge).')),
      h2('Row 1 (right side)'),
      p(gt('turning-chain', 'Turning chain'), t(' of ch 3. Skip 2 ch. Work (tr, ch 1, tr) into next ch (one V-st made). *Skip 2 ch. Work V-st into next ch*. Repeat to last 3 ch. Skip 2 ch. Tr into last ch. Turn. (75 V-sts.)')),
      h2('Row 2 and onward'),
      p(t('Ch 3. *Work V-st into the ch-1 space of each V-st from previous row*. Tr into top of turning chain. Turn. (75 V-sts.)')),
      p(t('Repeat Row 2 until piece measures 90 cm (about 72 rows). Fasten off.')),
      h2('Edging'),
      p(t('Work one round of dc (UK) around the perimeter: 1 dc into each tr, 1 dc into each ch-1 space, 2 dc into each corner. This fills the open edges and stabilises the border.')),
      h2('Finishing'),
      p(t('Complete '), gt('weaving-in-ends', 'weaving in ends'), t(' with the tapestry needle. Block lightly with steam to open the V spaces.')),
      h2('Care'),
      p(t('Machine wash 30 degrees gentle. Dry flat.')),
      h2('What to try next'),
      p(t('For a more structured lacy texture, try the shell stitch blanket. For a denser fabric, the granny stripe blanket uses treble clusters with no open gaps.')),
    ],
  },
},

// ── 8 ── bobble blanket ───────────────────────────────────────────────────────
{
  slug: 'bobble-blanket',
  title: 'Bobble blanket',
  subtitle: 'Three-treble bobbles in a staggered grid on a treble background.',
  excerpt: 'Raised bobbles pushed out on the right side create a thick, textured surface on a DK baby blanket. The bobbles sit in a staggered grid against a plain treble background.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '16 tr × 9 rows = 10 × 10 cm in DK cotton with a 4 mm hook.',
  finishedSize: 'Baby blanket, 75 x 90 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-treble', 'crochet-bobble'],
  techniqueTags: ['bobble-stitch', 'textured', 'working-back-and-forth'],
  techniqueSlugs: ['crochet-bobble', 'crochet-treble'],
  criticalTechniques: ['crochet-bobble', 'crochet-treble'],
  aliases: ['bobble stitch blanket', 'textured baby blanket', 'popcorn baby blanket'],
  glossaryTerms: [
    { slug: 'bobble', term: 'Bobble', definition: 'A cluster of three trebles worked into the same stitch, all joined at the top, that pushes forward on the right side of the fabric.' },
    { slug: 'turning-chain', term: 'Turning chain', definition: 'Three chains at the start of each treble row.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Bobble stitch (cluster stitch) documented in Weldon\'s Practical Crochet (series 3, 1880s). Staggered-grid bobble placement is a modern layout. Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A '), gt('bobble', 'bobble'), t(' blanket is a 75 x 90 cm flat piece with raised cluster stitches sitting in a staggered grid against a plain treble background. The bobbles push out on the right side, creating a tactile surface that is satisfying to touch. In DK cotton the fabric stays soft and machine washable.')),
      p(t('The bobble rows alternate with plain treble rows so the bobbles stand proud without the fabric becoming too stiff. Total yardage is around 380 g, slightly more than a plain treble blanket of the same size because the bobbles use extra yarn.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton yarn', qty: '380 g' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Gauge'),
      p(t('16 tr x 9 rows = 10 x 10 cm in DK cotton with a 4 mm hook. Bobble rows tend to pull in slightly; if your bobble rows are narrower than your plain rows, loosen the tension on the bobble stitches by completing each one with a slightly looser final pull-through.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK) / dc (US): treble (background stitch)')),
        li(t('bo: bobble, 3 tr worked into one stitch and joined at the top')),
      ),
      h2('How to make a bobble'),
      p(t('*Yarn over, insert hook into stitch, pull up loop, yarn over, draw through 2 loops* 3 times (4 loops on hook). Yarn over and pull through all 4 loops at once. One bobble made.')),
      h2('Foundation chain'),
      p(t('Chain 121.')),
      h2('Row 1 (right side, plain treble)'),
      p(gt('turning-chain', 'Turning chain'), t(' of ch 3. Work 1 tr into every chain across. Turn. (119 tr.)')),
      h2('Row 2 (wrong side, plain)'),
      p(t('Ch 3. Work 1 tr into every stitch across. Work 1 tr into top of turning chain. Turn. (119 tr.)')),
      h2('Row 3 (bobble row)'),
      p(t('Ch 3. Tr into next 2 stitches. *Work 1 bobble into next stitch. Tr into next 3 stitches*. Repeat across. Tr into top of turning chain. Turn. (About 30 bobbles.)')),
      h2('Row 4 (plain)'),
      p(t('Ch 3. Work 1 tr into every stitch (including the top of each bobble) across. Tr into turning chain. Turn.')),
      h2('Row 5 (bobble row, offset)'),
      p(t('Ch 3. Tr into next 4 stitches. *Work 1 bobble into next stitch. Tr into next 3 stitches*. Repeat to last 2. Tr into last stitch and turning chain. Turn. (Bobbles offset by 2 from Row 3.)')),
      h2('Continuing'),
      p(t('Alternate rows 2, 3, 4, 5 pattern throughout, offsetting bobbles every other bobble row. Work until piece measures 90 cm. Fasten off.')),
      h2('Edging'),
      p(t('Work one round of dc (UK) around the perimeter. Fasten off.')),
      h2('Finishing'),
      p(t('Secure all tails using '), gt('weaving-in-ends', 'weaving in ends'), t('. On the right side, use your finger to push any bobbles that landed on the wrong side forward through the fabric.')),
      h2('Care'),
      p(t('Machine wash 30 degrees gentle. Dry flat. Bobbles may flatten slightly in washing; push them forward while the fabric is still damp.')),
      h2('What to try next'),
      p(t('The popcorn blanket uses a similar textured cluster but with a different working method that gives a rounder, more defined bump. Or try the puff stitch blanket for a softer, squashier raised texture.')),
    ],
  },
},

// ── 9 ── half treble blanket ──────────────────────────────────────────────────
{
  slug: 'half-treble-blanket',
  title: 'Half treble baby blanket',
  subtitle: 'A dense, drapey fabric halfway between double crochet and treble.',
  excerpt: 'Half trebles worked back and forth make a thick, compact fabric that sits between a double crochet and a treble in height. Good for baby blankets where warmth matters more than drape.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '16 htr × 12 rows = 10 × 10 cm in DK cotton with a 4 mm hook.',
  finishedSize: 'Baby blanket, 75 x 90 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-half-treble'],
  techniqueTags: ['half-treble', 'working-back-and-forth', 'dense-fabric'],
  techniqueSlugs: ['crochet-half-treble', 'crochet-chain-foundation'],
  criticalTechniques: ['crochet-half-treble'],
  aliases: ['half treble blanket', 'htr blanket', 'half double crochet baby blanket'],
  glossaryTerms: [
    { slug: 'half-treble', term: 'Half treble', definition: 'A crochet stitch one step taller than a double crochet and one step shorter than a treble. UK: htr; US: hdc (half double crochet). One yarn-over before inserting the hook, then all three loops pulled through at once.' },
    { slug: 'turning-chain', term: 'Turning chain', definition: 'Two chains at the start of each half treble row to match the stitch height.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
  ],
  sourceType: 'PUBLIC_DOMAIN',
  sourceNotes: 'Half treble stitch documented in Weldon\'s Practical Crochet (1st series, 1880s). Baby blanket application is modern. Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A '), gt('half-treble', 'half treble'), t(' baby blanket is a 75 x 90 cm rectangle of htr worked back and forth on a 4 mm hook in DK cotton. The stitch produces a denser, more compact fabric than plain treble, which makes it slightly warmer and less prone to holes. The wrong side of a htr fabric shows a distinctive horizontal bar that some makers use intentionally as the right side.')),
      p(t('DK cotton gives the best balance of softness and washability for a baby blanket in this stitch. Total yardage is about 380 g, slightly more than a treble blanket of the same size because the rows are shorter.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton yarn', qty: '380 g' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Gauge'),
      p(t('16 htr x 12 rows = 10 x 10 cm in DK cotton with a 4 mm hook. At this gauge a foundation chain of 121 gives a 75 cm finished width. Check a swatch: htr gauge is noticeably tighter than treble gauge in the same yarn.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('htr (UK) / hdc (US): half treble, one yarn-over before inserting the hook, then all three loops pulled through together')),
      ),
      h2('Pattern'),
      p(t('Foundation chain: chain 121.')),
      p(t('Row 1: Work 1 htr into the 3rd ch from hook (the first 2 ch count as 1 htr). Work 1 htr into every remaining ch. Turn. (120 htr.)')),
      p(t('Row 2 onward: Work a '), gt('turning-chain', 'turning chain'), t(' of ch 2 (counts as 1 htr). Skip the first stitch. Work 1 htr into every stitch across. Work 1 htr into the top of the turning chain at the end. Turn. (120 htr.)')),
      p(t('Repeat Row 2 until piece measures 90 cm (approximately 108 rows). Fasten off.')),
      h2('Edging (optional)'),
      p(t('Work one round of dc (UK) around the perimeter: 1 dc into each stitch and row end, 3 dc into each corner.')),
      h2('Finishing'),
      p(t('Secure both tails with '), gt('weaving-in-ends', 'weaving in ends'), t('. Block lightly with steam if needed.')),
      h2('Care'),
      p(t('Machine wash 30 degrees gentle. Dry flat. The htr fabric holds its shape well without blocking.')),
      h2('What to try next'),
      p(t('The third-loop half treble blanket uses the same stitch inserted differently to produce a flat, fabric-like texture with no visible ridges. Or try the full treble blanket for a faster, more open fabric.')),
    ],
  },
},

// ── 10 ── chunky single stitch throw ─────────────────────────────────────────
{
  slug: 'chunky-throw',
  title: 'Chunky single-stitch throw',
  subtitle: 'Double crochet in chunky yarn on a large hook, fast and warm.',
  excerpt: 'Double crochet in chunky-weight yarn on an 8 mm hook builds a thick, warm throw in an afternoon. Tight dc fabric in chunky yarn is heavier and warmer than the same size in DK.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-8-0mm',
  gauge: '9 dc × 10 rows = 10 × 10 cm in chunky yarn with an 8 mm hook.',
  finishedSize: 'Lap throw, 90 x 110 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk'],
  techniqueTags: ['working-back-and-forth', 'plain-double-crochet', 'chunky-weight'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-chain-foundation'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['chunky crochet throw', 'big hook blanket', 'fast crochet blanket'],
  glossaryTerms: [
    { slug: 'turning-chain', term: 'Turning chain', definition: 'One chain at the start of each double crochet row. Does not count as a stitch.' },
    { slug: 'weaving-in-ends', term: 'Weaving in ends', definition: 'Threading yarn tails through nearby stitches with the tapestry needle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Plain double crochet blanket. Chunky yarn application is modern; the stitch is documented in Weldon\'s Practical Crochet (1st series, 1880s). Internet Archive.',
  body: {
    type: 'doc',
    content: [
      p(t('A chunky throw is a 90 x 110 cm piece of plain double crochet worked back and forth in chunky-weight yarn on an 8 mm hook. The thick yarn builds height quickly: the full throw takes around 110 rows, which is a few hours of steady work rather than a multi-day project. The dense dc fabric in chunky yarn is noticeably heavier and warmer than a treble blanket in DK.')),
      p(t('Chunky wool or wool-blend gives the best drape and warmth; chunky acrylic is lighter and machine washable. Total yardage is about 500 g chunky. The dc stitch in chunky produces a very tight fabric with few gaps, so it keeps draughts out.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky wool or acrylic yarn', qty: '500 g' },
        { name: '8 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Gauge'),
      p(t('9 dc x 10 rows = 10 x 10 cm in chunky yarn with an 8 mm hook. At this gauge a foundation chain of 81 gives a 90 cm finished width. In chunky yarn gauge varies significantly between brands, so swatch carefully before starting the full chain.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK) / sc (US): double crochet, the single stitch used throughout')),
      ),
      h2('Pattern'),
      p(t('Foundation chain: chain 81.')),
      p(t('Row 1: Dc into the 2nd ch from hook and every remaining ch. Turn. (80 dc.)')),
      p(t('Row 2 onward: Work a '), gt('turning-chain', 'turning chain'), t(' of ch 1 (does not count as a stitch). Dc into every stitch across. Turn. (80 dc.)')),
      p(t('Repeat Row 2 until piece measures 110 cm (approximately 110 rows). Fasten off.')),
      h2('Edging (optional)'),
      p(t('Work one round of dc (UK) around the perimeter: 1 dc into each stitch along top and bottom, 1 dc into each row end on sides, 3 dc into each corner. This squares the edges.')),
      h2('Finishing'),
      p(t('Use '), gt('weaving-in-ends', 'weaving in ends'), t(' to secure both tails. Wool: steam block lightly. Acrylic: lay flat, no heat needed.')),
      h2('Care'),
      p(t('Wool: handwash cool, squeeze dry in a towel, dry flat. Acrylic: machine wash 40 degrees, tumble dry low.')),
      h2('What to try next'),
      p(t('Try the same yarn weight with a shell stitch to add texture, or the basketweave throw in aran weight for a lighter version with a woven surface.')),
    ],
  },
},

]

// ── write files ───────────────────────────────────────────────────────────────
let count = 0
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
      craftTechniqueTags: pat.techniqueTags,
    },
    recipeTools: [
      { slug: 'crochet-hook', isOptional: false },
      { slug: 'tapestry-needle', isOptional: false },
      { slug: 'craft-scissors', isOptional: false },
      { slug: 'measuring-tape-soft', isOptional: false },
    ],
    body: pat.body,
  }
  const filePath = join(OUT, `${pat.slug}.json`)
  writeFileSync(filePath, JSON.stringify(out, null, 2))
  count++
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nTotal: ${count} patterns written to ${OUT}`)
