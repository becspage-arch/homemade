# Knitting lace — technique discipline guide

**Guide version:** 2 (K-4.1 author-prompt update — 2026-06-10). v1
shipped with K-1 pipeline-setup (2026-06-09). v2 adds the K-4.1
prose surfaces (first-time chart-reading walk-through, stitch-marker
placement between repeats, reading-on-phone-vs-paper practical
note) + `knitting.lifelinePoints` schema field that the lace
prompt now populates.

Reference guide for any project-shape author prompt that carries
`KnittingTechniqueDiscipline.LACE`. Not a standalone author
prompt — read this alongside the appropriate shape prompt
(`docs/knitting-shawl-wrap-author.md`,
`docs/knitting-scarf-cowl-author.md`, etc.).

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md`. Voice rules apply
unchanged.

## Scope

Lace knitting covers all decorative open-stitch techniques where
yarn-overs paired with decreases form deliberate eyelets. Sub-
disciplines included:

- **Shetland lace.** Traditional ring-shawl and stole tradition
  from Shetland, often worked in cobweb or lace-weight Shetland
  wool. Cobweb-thin "wedding ring" shawls pass through a
  wedding ring after blocking.
- **Estonian lace (Haapsalu).** Worked in fingering wool, nupp
  bumps a defining feature. Triangular and rectangular formats.
- **Russian Orenburg.** Goathair-blended lace shawls from the
  Urals. Square or rectangular. Diamond and zig-zag motifs.
- **Faroese lace.** Less open than Shetland; central-back
  shaping; shoulder-friendly.
- **Spanish lace.** Asturian and Galician open-work, often
  worked in linen.
- **Modern lace.** Hand-dyed yarn-led modern designs.

## Yarn-over conventions

A yarn-over (yo) creates an eyelet on the next row by adding a
strand between two stitches. Paired with a decrease, the stitch
count stays constant.

Symbol notation in charts:

- `yo` — yarn over.
- `k2tog` — knit 2 together (right-leaning decrease).
- `ssk` — slip slip knit (left-leaning decrease).
- `k3tog` — knit 3 together (double right-leaning decrease).
- `sk2p` — slip 1, k2tog, pass slipped over (centred double
  decrease).
- `cdd` — centred double decrease (slip 2 together knit-wise,
  k1, pass 2 slipped stitches over).

State which decreases the pattern uses in the body. The chart
key lists the symbols.

## Lifelines

A lifeline is a length of contrasting thread or yarn threaded
through a row of live stitches. If you make an error in a later
row, you can rip back to the lifeline without losing your place.

- Thread through every stitch on a designated row, behind any
  yarn-overs, never through stitch markers.
- Place every 8 to 16 rows of lace, or at every chart-repeat
  boundary.
- Use smooth dental-floss-style thread or cotton crochet thread.
  Not the working yarn — the lifeline must stand out.

State a lifeline recommendation in the body for any lace
pattern more than 20 rows long AND populate
`knitting.lifelinePoints` with the row numbers per the K-4.1
schema. The Studio surfaces a "thread a lifeline?" prompt at each
listed row.

## First-time chart reading walk-through

The K-4.1 prompt requires lace patterns to include a one-paragraph
first-time chart-reading walk-through at the start of the Pattern
section the first time the pattern uses a chart. The walk-through
covers, in plain prose:

- The chart reads bottom to top — row 1 is the first row worked,
  at the bottom of the chart.
- Flat work, right-side rows: read right to left. Match the way
  the stitches face on the needle.
- Flat work, wrong-side rows: read left to right.
- In-the-round: every row reads right to left.
- Each cell is one stitch. The symbol in the cell is the
  instruction.
- A `no-stitch` cell (diagonal stripes in the K-2 renderer) means
  "skip; this column doesn't carry a stitch on this row" — common
  in shaped lace where the row count varies across the row.

Land this walk-through once at the start of the Pattern section
on every lace pattern. Subsequent chart references can lean on
it.

## Stitch markers between repeats

Stitch markers between every pattern repeat keep the count steady
when the eyelets blur visually. State this in the body for any
lace pattern with a repeat unit:

- Place a stitch marker before the first stitch of each pattern
  repeat across the row.
- After each repeat, the count between markers should equal the
  unit count. If it doesn't, the error sits inside that one
  repeat — rip back to the marker, not to the lifeline.
- Use locking markers on lace; ring markers slip too freely
  through yarn-overs and can pop off.

State the marker placement plainly in the Pattern section at the
first chart appearance.

## Reading on a phone versus paper

A practical note the K-4.1 prompt surfaces in body prose:

Lace chart layouts read very differently between a printed A4
page and a phone screen. State plainly:

- A printed A4 chart lets the knitter trace the full row with a
  finger and see surrounding rows in peripheral vision.
- A phone screen zooms in on one or two rows. The maker loses
  the visual context around the active row.

Recommendation in the body: print the chart at A4 (or larger if
the chart is dense), use a row-by-row magnetic chart-keeper or a
sticky-note as a row marker. The Studio's chart highlight surfaces
the active row when the maker is reading off-screen.

## Blocking

Lace lives or dies by blocking. The pattern doesn't open until
the finished piece is wet and pinned.

Standard wet-block:
1. Soak the finished piece for 20 minutes in cool water with a
   wool wash.
2. Press out water between towels. Do not wring.
3. Pin the piece to its `finishedSizeText` dimensions on a
   blocking mat. Wires through the edge stitches; pins at the
   points.
4. Leave 24 hours to dry flat.

Re-block whenever the shape softens after several wears.

## Reading lace charts

Per K-2's `KnittingChartData` shape:

- Each grid cell carries a symbol slug.
- `no-stitch` cells (for charts that change stitch count across
  the row, like shaped shawl points) use the registered
  `no-stitch` symbol. The renderer fills the cell with a
  diagonal-stripe pattern. State this in the chart key.
- Reading direction (per K-2):
  - Flat work, RS rows: right to left.
  - Flat work, WS rows: left to right.
  - In-the-round: every row right to left.

Most lace charts only chart RS rows. WS rows are then plain
(purl across) and the chart key states this. Some traditions
(Estonian) chart both sides.

State the WS-row convention in the chart key.

## Nupps (Estonian)

A nupp is a small bobble made by working multiple stitches
into a single stitch on the RS row and purling them together
on the WS row.

Standard nupp:
- RS: k1, yo, k1, yo, k1, yo, k1 into the same stitch (7
  stitches made).
- WS: purl all 7 together.

The trick is to keep the seven stitches loose enough on the RS
row to purl them together on the WS row without breaking the
yarn. Practise on a swatch.

State the nupp construction step-by-step in the body for any
pattern using them.

## Common lace faults

- Twisted yarn-overs: the yo on the previous row was wrapped
  the wrong way, so the eyelet closes on the next row instead
  of staying open. Fix by ripping and re-knitting the row.
- Lost stitch counts: a yarn-over was missed or a decrease was
  doubled. Use lifelines and stitch counts at row ends to
  catch this early.
- Tight floats on Estonian inlay: the yarn carried for an
  inlaid motif puckers the front. Loosen the float carry.
- Hairy yarn that doesn't show eyelets: choose smoother yarn or
  block harder.

## Body voice for lace sections

- Lead with the chart, not the row count. "Work rows 1 to 24
  of chart A, then rows 1 to 16 of chart B" — the chart is the
  pattern.
- Pattern repeats stated as "work the 12-stitch repeat X times
  across, plus the edge stitches at each end".
- Mention lifelines plainly in the orientation paragraph.
- Mention wet-blocking plainly in the orientation paragraph;
  state finished dimensions are blocked.

## Cultural attribution

Acknowledge the tradition by name in the parent prompt's
orientation paragraph. Do not claim cultural authority. One
sentence is enough.

| Tradition | Region | Notes |
|---|---|---|
| Shetland | Shetland Isles | Cobweb-light shawl tradition. Hap shawls + wedding ring shawls. |
| Estonian (Haapsalu) | Estonia | Nupp-defining technique. |
| Russian Orenburg | Urals, Russia | Goat-down blended yarn. Square shawls. |
| Faroese | Faroe Islands | Shoulder-shaped shawls. Less open than Shetland. |
| Spanish / Galician | NW Spain | Linen lace traditions. |
| Sanquhar lace | Scotland | Less common than Sanquhar two-colour. |

## Sources

Acceptable historical sources:

- **Mrs. Jane Gaugain, *The Lady's Assistant for Executing Useful
  and Fancy Designs in Knitting, Netting, and Crochet Work*
  (1842)** — Internet Archive.
- **Mlle Riego de la Branchardiere, *The Knitting Book*** —
  Internet Archive.
- **Therese de Dillmont, *Encyclopedia of Needlework*** —
  Project Gutenberg #20776.
- **Weldon's Practical Knitter** — Internet Archive.

Modern reference sources (cite, do not reproduce):

- **Sharon Miller, *Heirloom Knitting*** — Shetland.
- **Nancy Bush, *Knitted Lace of Estonia*** — Estonian.
- **Galina Khmeleva and Carol Noble, *Gossamer Webs***
  — Orenburg.

## Self-critique additions

Add to the parent shape prompt's self-critique pass:

1. Yarn-over notation matches the chart.
2. Lifeline recommendation in the body AND
   `knitting.lifelinePoints` populated with row numbers.
3. First-time chart-reading walk-through present at the start of
   the Pattern section.
4. Stitch marker placement between repeats stated in body.
5. Reading-on-phone-vs-paper practical note present.
6. Blocking stated as essential, not optional.
7. Finished dimensions are blocked dimensions.
8. `no-stitch` cells in the chart key when stitch count varies.
9. WS row convention stated in the chart key.
10. Nupps walked through step-by-step where used.
11. Cultural attribution respectful and bounded.
