/**
 * _fix-grade-level.ts
 * Replaces specific body nodes (identified by flat body.content index) with
 * shorter, simpler prose that passes the grade-level threshold (≤12.0).
 *
 * Run: pnpm --filter @homemade/db exec tsx scripts/_fix-grade-level.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), '..', '..', 'docs', 'knitting-bulk-003-blanket-briefs')

/** Map of filename → node index → replacement text (all text nodes merged). */
const FIXES: Record<string, Record<number, string>> = {
  '2x2-rib-baby-blanket.json': {
    15: 'When you set this aside, note whether you are on a RS or WS row. Both rows begin k2. Noting the parity helps if you need to count rows later.',
  },
  'brioche-rib-baby-blanket.json': {
    30: 'From one-colour brioche, try two-colour brioche next. Each row uses a different yarn colour. The result is a reversible fabric where the RS and WS show opposite colour schemes. The stitches are the same; you add a colour-change step at each row.',
  },
  'brioche-two-colour-throw.json': {
    32: 'From two-colour brioche in a 1×1 arrangement, try a 2×2 structure next: brioche knit two, brioche purl two. The columns are bolder. The colour inversion between RS and WS is more dramatic.',
  },
  'cabled-aran-single-bed-throw.json': {
    0: 'A single-panel rectangle worked flat on 5 mm needles. The pattern uses four Aran panels: honeycomb cable, rope cable, double-moss filler, and seed-stitch borders. Finished size: 140 cm by 200 cm.',
    28: 'From a traditional Aran throw, try a gansey-inspired blanket next. Use the same aran weight and needle. The panel vocabulary changes: gansey stitch patterns replace the Aran ones. The construction stays flat.',
  },
  'cabled-panel-baby-blanket.json': {
    6: 'If your seed-stitch gauge is 16 stitches per 10 cm, the blanket will be about 84 cm wide. Adjust the seed-stitch panels by adding or removing stitches in multiples of 2.',
  },
  'cable-rib-lap-throw.json': {
    0: 'A single-panel rectangle worked flat on 5 mm needles. The pattern is a regular cable-rib repeat: six-stitch cables with two-purl separators. Finished size: 100 cm wide by 120 cm long.',
    29: 'From a regular cable-rib, try a mixed-cable throw next. The cable width varies across the width. A central twelve-stitch rope sits between eight-stitch honeycomb cables. Four-stitch rope cables run at the edges, separated by two-stitch purl ribs.',
  },
  'cable-stripe-baby-blanket.json': {
    0: 'A single-panel rectangle worked flat on 5 mm needles. Six-stitch cable columns alternate with garter-stitch panels. Finished size: 75 cm wide by 90 cm long.',
    29: 'From three cable columns, try a full Aran blanket next. Add more panel types: honeycomb, lattice, and rope, separated by seed-stitch columns. The cabling technique is the same; only the variety increases.',
  },
  'centre-out-heirloom-blanket.json': {
    0: 'A 90 cm square blanket knitted by centre-out construction on 4 mm needles. Four quadrants grow from an eight-stitch centre. Each RS row adds two stitches per quadrant. A simple vine lace repeat fills each quadrant.',
    30: 'From a centre-out DK blanket, try a centre-out Shetland lace shawl in 4-ply. The four-section construction is the same. The gauge is finer. The lace repeat grows to 32 rows. A knitted-on border is worked sideways and grafted on at the end.',
  },
  'chevron-stripe-lap-throw.json': {
    0: 'A single-panel rectangle worked flat on 4 mm needles. The pattern uses a two-colour chevron: yarn over increases and k2tog decreases. Finished size: 100 cm wide by 120 cm long.',
    28: 'From a two-colour chevron, try feather-and-fan next. The yarn-over and decrease technique is the same. The spacing changes: more decreases cluster together. The result is a scalloped edge instead of a pointed chevron.',
  },
  'chunky-garter-lap-throw.json': {
    14: 'When you set this aside, jot the current row or measure the length. Picking up a garter throw is simple because every row is a knit row.',
  },
  'eyelet-border-baby-blanket.json': {
    0: 'A single-panel rectangle worked flat on 4 mm needles. A five-stitch eyelet border runs on all four sides. The centre is stocking stitch. Finished size: 75 cm wide by 90 cm long.',
  },
  'fair-isle-baby-blanket.json': {
    0: 'A single-panel rectangle worked flat on 4 mm needles. A ten-row two-colour Fair Isle border sits at cast-on and cast-off. The centre is stocking stitch. Finished size: 75 cm wide by 90 cm long.',
  },
  'fair-isle-lap-throw.json': {
    29: 'From a two-colour Fair Isle throw, try a three-colour Shetland peerie-and-border throw. A wide border sits at top and bottom with a complex motif. A narrower peerie repeat fills the centre. Three colours combine in different ways across the rows.',
  },
  'feather-fan-lap-throw.json': {
    30: 'From feather-and-fan, try a multi-colour version. Work two or three colours in garter-stitch stripes of four rows each. Use feather-and-fan rows within each stripe. Each colour change falls on a WS garter row, keeping the join clean.',
  },
  'fishermans-rib-lap-throw.json': {
    29: "From fisherman's rib, try brioche rib next. The two techniques produce nearly the same fabric. Brioche uses slip stitches and yarn-overs instead of knit-below. Brioche also scales easily to two-colour work.",
  },
  'garter-stitch-baby-blanket.json': {
    15: 'When you set this aside, jot the row number or place a locking stitch marker on the current row. The pattern resumes cleanly from any point.',
  },
  'garter-stitch-lap-throw.json': {
    21: 'Centre-pull balls collapsing and tangling: large DK skeins often come as centre-pull balls. As the ball empties, the centre collapses into a tangle. Wind each skein into a firm ball before starting. Use a ball winder if you have one, or pull from the outside of the skein instead.',
  },
  'heirloom-christening-blanket.json': {
    0: 'A single-panel rectangle worked flat on 3 mm needles. The centre is diamond lace mesh. A sixteen-row leaf-vine border frames all four sides. Finished size: 75 cm wide by 90 cm long when blocked.',
    24: 'Diamond pattern turning into diagonal stripes: the row position in the 10-row repeat was lost. Use a row counter or write the row number before setting the work down. Check the yo placement direction matches the chart before you resume.',
    33: 'From a diamond mesh blanket, try a Shetland-style shawl next. Use the same 4-ply lace. Switch to centre-out construction. The border is knitted sideways and grafted on. The pattern repeat grows to 24 rows.',
  },
  'lace-panel-baby-blanket.json': {
    31: 'From a central eyelet panel, try an all-over eyelet blanket next. Use the same four-row repeat across the full width. You already know every technique required. The result is an open, lacy fabric throughout.',
  },
  'log-cabin-colourwork-throw.json': {
    24: 'From a four-colour log cabin, try a striped-within-strip version next. Each strip uses two colours alternating every two rows. This adds a secondary stripe pattern inside the concentric-ring structure.',
  },
  'nordic-stripe-lap-throw.json': {
    0: 'A single-panel rectangle worked flat on 5 mm needles. Five colours stripe in bold garter sections. All colours are carried up the side throughout. Finished size: 100 cm wide by 120 cm long.',
  },
  'north-sea-aran-blanket.json': {
    0: 'A single-panel rectangle worked flat on 4.5 mm needles. The layout combines horseshoe cables, marriage lines, purl-ground moss diamonds, and seed-stitch anchor columns. Finished size: 90 cm wide by 110 cm long.',
    28: 'From a gansey-inspired blanket, try an actual gansey sweater next. Use the same stitch vocabulary, the same 4.5 mm needles, and the same aran wool. Work in the round from the hem to the underarm. Shape the shoulders with a traditional saddle. The techniques are the same; the construction changes from flat to circular.',
  },
  'patchwork-garter-squares.json': {
    24: 'From plain garter squares, try mitered squares next. Use the same size, weight, and needles. Work each square from the outside corner inward with a centre decrease. This adds a diagonal visual element with no new yarn or tools.',
  },
  'seed-cable-panel-blanket.json': {
    29: 'From a three-panel seed-and-cable layout, try a full Aran blanket next. Replace the rope cables with honeycomb, bobble, and lattice panels. Keep the seed-stitch columns between them.',
  },
  'slip-stitch-mosaic-lap-throw.json': {
    30: 'From a simple mosaic, try a longer repeat next: 16 rows or 24 rows. Or try stranded colourwork: the same two-colour concept, but both yarns are carried across each row. The fabric is denser and less stretchy.',
  },
  'striped-garter-baby-blanket.json': {
    16: 'When you set this aside, jot the current row within the stripe and which yarn you are on. Picking up mid-stripe is easy once you know where you are in the repeat.',
  },
  'strip-seam-sampler-throw.json': {
    23: 'From a five-strip sampler, try a cable sampler throw next. Keep the same five-strip structure. Fill each strip with a different cable: rope, honeycomb, bramble, wave, and lattice. Separate them with narrow seed-stitch columns.',
  },
  'super-chunky-lap-throw.json': {
    27: 'From a super-chunky garter throw, try a striped version next. Keep the same cast-on and construction. Alternate two colours every four rows. Carry both colours up the edge as in any striped garter project. The stripe effect is bolder at this scale.',
  },
}

function makeTextNode(text: string): unknown {
  return { type: 'text', text }
}

function makeParagraph(text: string): unknown {
  return { type: 'paragraph', content: [makeTextNode(text)] }
}

for (const [file, nodeMap] of Object.entries(FIXES)) {
  const path = join(DIR, file)
  const raw = readFileSync(path, 'utf8')
  const doc = JSON.parse(raw) as Record<string, unknown>
  const body = doc['body'] as Record<string, unknown>
  const nodes = [...(body['content'] as unknown[])]

  for (const [idxStr, newText] of Object.entries(nodeMap)) {
    const idx = parseInt(idxStr, 10)
    const existing = nodes[idx] as Record<string, unknown>
    if (!existing) {
      console.error(`  SKIP ${file}[${idx}]: node not found`)
      continue
    }
    if (existing['type'] !== 'paragraph') {
      console.error(`  SKIP ${file}[${idx}]: type is ${existing['type']}, not paragraph`)
      continue
    }
    nodes[idx] = makeParagraph(newText)
  }

  const fixed = { ...doc, body: { ...body, content: nodes } }
  const out = JSON.stringify(fixed, null, 2) + '\n'
  writeFileSync(path, out, 'utf8')
  console.log(`fixed: ${file}`)
}

console.log('\nDone.')
