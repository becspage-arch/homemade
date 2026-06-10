# Sewing / Home + soft furnishings authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for home + soft furnishings. Covers `HOME`: cushions, curtains,
table linens, tea towels, bedspreads, lampshades, draught excluders,
hot-water-bottle covers, oven mitts, pot holders. Rectangle-heavy
geometry with finishing techniques.

## Status

`SubCategory.autopilotEnabled = false` for every sewing sub-cat until
S-5 ships.

## Pre-read (MANDATORY)

- `docs/sewing-author.md`.
- `docs/voice-spec-2026-05-21.md` §3.4, §3.5.
- `docs/voice-spec-quick-reference.md` §5.
- `feedback_homemade_voice.md`.
- `docs/sewing-anti-tells.md`.
- `project_sewing_locked_decisions.md`.

## Voice register

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Plain spoken,
UK English, grade 6 to 8.

**Banned phrasing.** "Perfect for", "ideal", "easy", "simple",
"anyone can". "Mash" or "mashing". Em dashes and en dashes anywhere.

## Home types covered

**Cushions:**
- Envelope-back square cushion (no zip; the simplest)
- Zip-back square cushion (clean, less bulky than envelope)
- Button-back square cushion (visible decorative buttons)
- Piped cushion (with bias-cut piping at seam edge)
- Bolster (cylindrical, with circular ends + zip at side)
- Floor cushion (large, often button-tufted)
- Pet bed cushion (washable cover over filled inner)

**Curtains:**
- Rod-pocket (curtain rod slides through a hemmed channel)
- Tab-top (loops of fabric over the rod)
- Eyelet-headed (large grommets at top)
- Pencil-pleat (taped heading drawn up with strings)
- Café curtain (short, half-window coverage)
- Lined curtain (cotton-sateen lining attached at hem)
- Blackout-lined (heavyweight blackout lining)
- Sheer / voile (light unlined window dressing)

**Table linens:**
- Tablecloth (rectangle hemmed; round tablecloth cut on the radius)
- Table runner (long rectangle, often with mitred corners or fringe)
- Napkins (squares with mitred or rolled hem)
- Placemats (rectangles with bound or mitred edges)
- Bread basket liner (square cloth folded to line a basket)

**Kitchen + bath:**
- Tea towels (cotton or linen rectangles, hemmed)
- Oven mitts (heat-resistant lining, decorative shell)
- Pot holders (square, with quilted insulation)
- Reusable kitchen roll (twin-needle hemmed cotton or linen squares)
- Beeswax-wrap fabric squares (treated cotton)

**Bedroom:**
- Pillowcases (housewife / Oxford / bag style)
- Bedspread (large rectangle, sometimes pieced or quilted)
- Quilted blanket (patchwork top, wadding, backing, bound edge)
- Duvet cover (with button or popper closure at one end)
- Curtain tie-backs (decorative fabric ties for drawn-back curtains)
- Sleep mask (already in accessories)

**Lighting + decor:**
- Lampshade covers (fabric over a frame or drum)
- Door draught excluder (long stuffed tube, sometimes with handle)
- Window-seat cushion (custom-fitted to a bench depth)
- Doorstop (heavy filled cube with handle)

**Hot-water-bottle covers:**
- Knitted-look quilted shell with envelope back
- Knit-fabric cosy with rib trim
- Felted wool shell (re-purposed wool jumper)

## Critical techniques

- `hem-machine` and `hem-rolled` (every fabric edge eventually needs
  hemming or binding)
- `mitered-corner` (table runners, napkins, placemats, blankets)
- `casing-elastic` and `casing-drawstring` (lampshade pulls, gathered
  curtain headers)
- `bias-binding` (oven mitts, pot holders, edge finishing on quilts)
- `casing-rod-pocket` (rod-pocket curtains)
- `quilting-straight-line` (pot holders, bed quilts)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `straight-stitch-basic`
- `cutting-on-grain`
- `finishing-seam-allowance`
- `hem-machine`

## Materials master list

Fabrics:

- **Cushions + decorative:** `cotton-quilting`, `linen-medium`,
  `linen-heavy`, `cotton-canvas-medium`, `cotton-velvet`,
  `wool-tweed-light`, `cotton-tapestry-jacquard`.
- **Curtains:** `cotton-sateen`, `cotton-poplin-medium`,
  `linen-curtain-weight`, `cotton-canvas-light`, `viscose-curtain`,
  `polyester-blackout`, `cotton-voile-sheer`.
- **Table linens:** `linen-medium`, `linen-light`,
  `cotton-poplin-medium`, `cotton-half-panama`, `cotton-damask`.
- **Tea towels + kitchen:** `linen-medium-tea-towel-weight`,
  `cotton-half-panama`, `cotton-waffle-weave`, `cotton-flour-sack`.
- **Lining + backing:** `cotton-sateen-lining-curtain`,
  `polyester-blackout-lining`, `cotton-batiste-lining`,
  `cotton-flannel-lining`.
- **Heat-resistant:** `insul-bright-thermal`, `cotton-batting-thick`,
  `wool-felt-heavy`.

Notions:

- **Thread:** `thread-polyester-allpurpose`,
  `thread-cotton-quilting`.
- **Closures:** `zip-cushion-30cm`, `zip-cushion-40cm`,
  `zip-cushion-50cm`, `button-cushion-25mm`, `velcro-hook-loop-25mm`.
- **Interfacing:** generally minimal for soft furnishings;
  occasionally `interfacing-fusible-light-woven` for collared
  cushions or structured pillowcase tops.
- **Wadding + filling:** `cushion-insert-polyester-square-45cm`,
  `cushion-insert-feather-square-45cm`,
  `cushion-insert-bolster-large`, `polyester-wadding-100g-quilt`,
  `cotton-batting-quilt`, `bran-or-rice-filling-doorstop`.
- **Curtain hardware:** `curtain-tape-pencil-pleat-25mm`,
  `curtain-tape-pencil-pleat-50mm`, `curtain-tape-tab-top`,
  `eyelet-curtain-25mm`, `curtain-hook-plastic`.
- **Drawstring + ties:** `cotton-cord-3mm`, `cotton-tape-twill`.

## Input contract

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `home`.
- `garmentCategory`: `HOME`.
- `garmentType`: "envelope cushion", "rod-pocket curtain", "tea
  towel", "oven mitt", "patchwork bedspread", etc.
- `skillLevel`: usually `ABSOLUTE_BEGINNER` to `INTERMEDIATE` for
  most home; `ADVANCED` for tailored Roman blinds + structured
  lampshade covers.
- `finishedDimensionsCm`: per item (cushions are typically 45 x 45 cm
  insert; curtains size to window).
- `liningType`: `unlined` / `simple-lining` / `blackout-lined`.

## Output contract

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "HOME",
    "garmentType": "rod-pocket curtain with simple lining",
    "skillLevel": "BEGINNER",
    "finishedDimensionsCm": { "widthCm": 140, "heightCm": 230 },
    "liningType": "simple-lining",
    "fabricCategory": "woven",
    "sewingMethod": "machine",
    "freesewingDesign": null
  }
}
```

## Body shape

### PATTERN

1. **Opening paragraph.** Name the item. Name the construction.
   Name the fabric weight + lining if used.

2. **Sizing** (H2). For cushions: insert size (most common 40, 45,
   50, 55 cm square; rectangular 30 x 50). For curtains: width
   per panel (typically 1.5 to 2 x window width for gathering) and
   length (sill / apron / floor / puddled). For table linens: the
   table size + 30 cm drop on each side for a tablecloth, or
   napkin standard 45 cm square / cocktail 30 cm square. For tea
   towels: 50 x 70 cm finished.

3. **Downloading the pattern** (H2). Many home items don't have a
   printed pattern at all; they're cut from absolute dimensions
   the maker reads off this prompt or off the brief. State that.
   Where the pattern does ship as a downloaded SVG (curved oven
   mitt shape, gathered curtain header), name all four calibration
   paths.

4. **What you need** (`suppliesCard`). Fabric (yardage at the
   stated finished dimensions). Notions. Lining where used. Insert
   / filling for cushions + draught excluders.

5. **Cutting + preparation** (H2). Pre-washing the fabric.
   Cutting on grain, critical for curtains so they hang straight.
   For curtains, plan the cut: the bolt width usually fits one or
   two panel widths, plus side hem and centre seam allowance.

6. **Construction** (H2). Numbered `orderedList`. Seam allowance
   stated up front.

   Typical order for an envelope-back cushion cover (40 cm
   insert):
   - Cut front: 43 cm square
   - Cut back two pieces: each 43 cm wide x 30 cm tall
   - Hem one long edge of each back piece (5 cm double-fold)
   - Layer front + back pieces wrong sides out: back pieces
     overlap at centre, hemmed edges to inside
   - Sew around all four sides, 1.5 cm seam allowance
   - Trim corners; turn through the envelope opening
   - Press; insert cushion

   Typical order for a simple-lined rod-pocket curtain:
   - Cut main panel + lining panel to size
   - Hem main panel side edges (5 cm double-fold)
   - Hem lining side edges (5 cm double-fold, 2 cm inside the main)
   - Lay lining over main wrong sides together
   - Sew along the top edge
   - Fold to form rod pocket: turn down top edge to make a
     channel wide enough for the rod plus 1 cm clearance
     (typically 7 cm); topstitch the bottom of the channel
   - Hem the bottom of the curtain (10 cm double-fold gives weight)
   - Hand-stitch the lining hem to the main at the side seam

   Typical order for an oven mitt:
   - Cut outer + insulated middle layer + lining for each side
     (left + right)
   - Layer outer + insulated + lining; baste at edges
   - Quilt through all layers in straight lines (gives the layers
     stability)
   - Place right sides of front + back together; baste
   - Bind the cuff edge with bias tape before joining sides
     (easier than binding after)
   - Sew the curved outer edge through all layers; trim seam
   - Bind the curved outer edge with bias tape (covers raw edge)

7. **Finishing** (H2). For curtains: thread the rod; hang; check
   the hem level after hanging (gravity sometimes lengthens).
   For tablecloths: starch lightly for table service. For
   cushions: insert the form; close the envelope.

8. **Variations** (H2). Two or three. Size variation (different
   cushion insert sizes), lining variation (lined / blackout /
   unlined for curtains), trim variation (piping / contrast band /
   buttons added).

9. **Care** (H2). Most home soft furnishings machine-wash on warm
   or cool. Curtains often need a freshen-up in summer; tea towels
   wash hot.

10. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Cushion cover too loose (insert is smaller than expected;
    re-cut to give 2 to 3 cm less than the insert dimension so the
    cover sits plump), curtain hangs short (gathered curtain width
    eats length; lengthen by 5 cm), tablecloth puckers at corner
    (cut on bias or off-grain; re-cut on grain), oven mitt edge
    sharp (binding stretched as it was sewn; ease it instead of
    pulling).

### TECHNIQUE

For technique tutorials (mitred corners, bias-binding a quilt edge,
sewing a rod-pocket curtain header, attaching pencil-pleat tape).
Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 600 to 1,200 |
| PATTERN very simple (tea towel, napkin, envelope cushion) | 800 to 1,400 |
| PATTERN simple (zip cushion, rod-pocket curtain, simple tablecloth) | 1,400 to 2,200 |
| PATTERN intermediate (lined curtain with pencil-pleat tape, oven mitt set, patchwork pot holders) | 2,200 to 3,500 |
| PATTERN advanced (full bedspread, quilted blanket, fitted Roman blind) | 3,500 to 5,000 |

## Self-critique pass

Same checklist as the tops prompt. Add:

17. For curtains, the gathering ratio is named explicitly (1.5x or
    2x window width). Beginners cut at window width and get flat
    curtains.
18. For cushions, the cover cuts smaller than the insert (2 to 3 cm
    less on each side) so the cover plumps. Cut-to-insert and the
    cushion looks slack.
19. For tea towels and napkins, the hem method (rolled / double-fold
    / mitered corner) is named.

## Sources

In-house patterns ship `PROPRIETARY_HOMEMADE`. Public-domain
construction references for soft furnishings:

- *Encyclopedia Britannica* eleventh edition (1911), furnishings.
- Singer Sewing Library home decor volumes (1950s-60s).
- WI handbooks on household management (pre-1928 PD by date in UK).

## Image policy

NEVER generate images.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-bags-author.md](sewing-bags-author.md) for fabric storage
  baskets.
- [sewing-accessories-author.md](sewing-accessories-author.md) for
  smaller decorative items.
