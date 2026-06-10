# Sewing / Outerwear authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for outerwear. Covers women's outerwear (`WOMENS_OUTERWEAR`),
men's outerwear (`MENS_OUTERWEAR`), and kids outerwear (under `KIDS`
with outerwear `garmentType`). Construction is the most involved across
the sewing prompts because lined + interfaced + tailored construction
combines almost every technique in the library.

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

**Word precision.** "Sewing", "stitching", "pressing", "easing",
"setting" (sleeves), "lining", "interfacing". Jackets + coats are
"made" or "sewn".

## Outerwear types covered

**Jackets:**
- Bomber jacket (rib waistband + rib cuffs + zip front, set-in
  sleeves or raglan)
- Denim jacket (yokes + chest patch pockets + button front)
- Blazer (single-breasted, notched collar, lined, welt pockets)
- Field jacket (utility cargo pockets + button or zip + storm flap)
- Anorak (waterproof, drawcord waist, hood)
- Hoodie (knit, drawcord hood, kangaroo pocket)
- Cardigan (knit, button or zip)

**Coats:**
- Trench (lined, double-breasted, belt + epaulettes + storm flap)
- Pea coat (heavy wool, double-breasted, notched collar)
- Duffel (toggle closures, hood, patch pockets)
- Wrap coat (wrap-front, tied at waist)
- Overcoat (long, lined, single-breasted, hidden buttons or button-
  through)
- Parka (waterproof, hood with fur trim option, drawcord waist + hem)

**Vests / gilets:**
- Tailored vest (lined, single-breasted, V-neck, welt pockets, back
  belt + buckle)
- Quilted gilet (puffer-style without sleeves)
- Field vest (utility pockets)

**Closure types covered:**
- Single-breasted button-through (one row of buttons + buttonholes)
- Double-breasted (two rows of buttons + one row of buttonholes; or
  two rows of each for fully reversible)
- Zip (separating zip; metal teeth for heavy coats, nylon coil for
  jackets)
- Toggle (duffel coats)
- Snap (utility jackets, kids outerwear)
- Hook + bar (storm flaps + waistbands)

**Pocket types covered:**
- Welt (single or double; the tailored coat pocket)
- Patch (the casual jacket pocket)
- Flap (patch with a fold-down flap)
- Cargo (3D patch with bellows + flap)
- Hand-warmer (slanted slash, set into the side seam)
- Kangaroo (the front-of-hoodie pouch)

**Collar types covered:**
- Notched (the blazer + jacket standard)
- Shawl (one-piece collar without a notch)
- Stand collar (no fold; the mandarin)
- Hood (drawcord or fixed)
- No collar (band-finished neckline)

## Critical techniques

- `interfacing-fusible` and `interfacing-sew-in` (every outerwear
  garment uses interfacing)
- `underlining` (heavy wool coats benefit from underlining for
  structure)
- `lining-attached` or `lining-floating` (every lined garment)
- `bagged-lining` (the efficient lining method where the lining is
  attached at the hem)
- `welt-pocket` or `patch-pocket` or `flap-pocket` (per pocket type)
- `set-in-sleeve` (the workhorse outerwear sleeve)
- `notched-collar` or `shawl-collar` (per collar)
- `topstitching` (visible decorative stitching common on jackets +
  coats)
- `pressing-seams-open` and `pressing-darts` (critical for clean
  tailoring)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `cutting-on-grain`
- `transferring-pattern-markings`
- `interfacing-fusible`
- `pressing-seams-open`

## Materials master list

Fabrics:

- **Light wovens (light jackets, anoraks):** `cotton-twill-light`,
  `cotton-canvas-light`, `nylon-ripstop`, `cotton-chino-light`.
- **Medium wovens (denim jackets, field jackets):**
  `cotton-twill-medium`, `denim-medium`, `cotton-canvas-medium`,
  `corduroy-medium`.
- **Heavy wovens (coats, blazers):** `wool-melton`, `wool-coating`,
  `wool-tweed-harris`, `wool-tweed-donegal`, `cashmere-blend-coating`,
  `boiled-wool`, `wool-flannel-heavy`.
- **Specialty:** `oilskin`, `waxed-cotton`, `quilted-cotton`,
  `pertex-shell-fabric`, `polartec-fleece`.
- **Knits (hoodies, cardigans):** `french-terry-medium`,
  `loopback-jersey-heavy`, `merino-jersey`, `boiled-merino`.

Linings + underlinings:

- **Lining:** `bemberg-rayon-lining`, `silk-twill-lining`,
  `polyester-satin-lining`, `cotton-cupro-lining`,
  `viscose-twill-lining`.
- **Underlining:** `cotton-batiste`, `silk-organza`,
  `hair-canvas` (the traditional tailor's interfacing for wool
  blazers).
- **Quilting wadding (gilets):** `polyester-wadding-100g`,
  `down-fill-loose` (specialist).

Notions:

- **Thread:** `thread-polyester-allpurpose`, `thread-topstitch-jeans`,
  `thread-buttonhole-twist` (visible decorative buttonholes on
  tailored coats).
- **Interfacing:** `interfacing-fusible-medium-woven`,
  `interfacing-fusible-heavy-woven`,
  `interfacing-sew-in-heavy-canvas`, `hair-canvas-tailoring`.
- **Closures:** `zip-separating-metal-65cm`,
  `zip-separating-nylon-coil-55cm`, `zip-separating-2-way-70cm`,
  `button-coat-25mm-horn`, `button-coat-23mm-wood`,
  `toggle-duffel-set`, `hook-and-bar`, `snap-fastener-heavy-15mm`.
- **Pocket fabric:** `pocketing-cotton-fine`, `pocketing-silesia`.
- **Drawstring + cord:** `drawcord-elastic-5mm`,
  `cord-lock-toggle-stopper`.
- **Reinforcement:** `bias-tape-stay-cotton`,
  `shoulder-pad-jacket-set`, `sleeve-head-roll` (the bias-cut
  cotton-felt strip that supports the sleeve cap in tailored
  blazers).

## Input contract

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `womens-outerwear` / `mens-outerwear` / `kids`.
- `garmentCategory`: matching enum.
- `garmentType`: "tailored blazer", "denim jacket", "duffel coat",
  "quilted gilet", "kids parka", etc.
- `skillLevel`.
- `closureType`: `single-breasted-button` / `double-breasted-button`
  / `zip` / `toggle` / `snap`.
- `pocketTypes[]`: subset of `welt` / `patch` / `flap` / `cargo` /
  `hand-warmer` / `kangaroo`.
- `collarType`: `notched` / `shawl` / `stand` / `hood` / `none`.
- `liningType`: `none` / `partial` / `bagged` / `floating`.
- `interfacingWeight`: `light-fusible` / `medium-fusible` /
  `heavy-fusible` / `sew-in-canvas` / `hair-canvas`.
- `requiredMeasurements[]`, `optionalMeasurements[]`.
- `freesewingDesign` (e.g. `simon`, `holmes`, `aaron`).

## Output contract

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "WOMENS_OUTERWEAR",
    "garmentType": "single-breasted tailored blazer with notched collar + welt pockets",
    "skillLevel": "ADVANCED",
    "closureType": "single-breasted-button",
    "pocketTypes": ["welt"],
    "collarType": "notched",
    "liningType": "bagged",
    "interfacingWeight": "medium-fusible",
    "fabricCategory": "woven",
    "requiredMeasurements": ["bust", "waist", "hip", "body-height", "shoulder-width", "arm-length", "back-waist-length"],
    "optionalMeasurements": ["chest-cross-back", "wrist-circumference"],
    "sewingMethod": "machine",
    "hasLining": true,
    "hasInterfacing": true,
    "freesewingDesign": null
  }
}
```

## Body shape

### PATTERN

1. **Opening paragraph.** Name the garment. Name the construction
   (tailored single-breasted blazer with notched collar + welt
   pockets + bagged lining, casual denim jacket with patch chest
   pockets + button front). Name the fabric weight + interfacing
   weight.

2. **Sizing and fit** (H2). Sizes graded. Body measurements. Ease at
   bust / chest / hip / arm in cm. For tailored coats, the wearing
   ease + design ease combined often runs 12 to 18 cm at the chest
   so the coat closes over jumpers underneath.

3. **Downloading the pattern** (H2). All four calibration paths.

4. **What you need** (`suppliesCard`). Fabric (main + lining +
   underlining + interfacing yardages). Notions (thread, buttons /
   zip / toggle, pocket fabric, shoulder pads + sleeve head where
   tailored). Machine + feet (zipper foot, buttonhole foot, walking
   foot for heavy wool).

5. **Cutting + preparation** (H2). Pre-washing where the fabric will
   tolerate it (wool coatings typically dry-clean only; pre-shrink
   by steaming heavily with an iron, hovering above the fabric so
   the wool relaxes before cutting). Cutting on grain with extra
   care for matched stripes or plaid in the main fabric. Cutting
   interfacing pieces to match the corresponding fabric pieces.
   Transferring all pocket placements, button positions, dart marks,
   and ease notches.

6. **Construction** (H2). Numbered `orderedList`. Seam allowance up
   front (typically 1.5 cm for jackets, 1 cm for lining).

   Typical order for a single-breasted tailored blazer with notched
   collar + welt pockets + bagged lining:
   - Apply fusible interfacing to front pieces, front facings, upper
     collar, under collar (or canvas the front + roll-line for
     hand-tailored)
   - Sew bust + waist + back darts; press
   - Construct welt pockets in front pieces (sew welt fabric to
     front; cut pocket opening; turn welts in; sew pocket bag;
     topstitch)
   - Sew shoulder seams (main fabric)
   - Construct collar: sew under collar to top collar; clip; turn;
     press; topstitch around outer edge
   - Attach collar to neckline: pin under collar to main neckline;
     pin top collar to facing neckline; sew in one pass through both
     layers; clip; turn through; press
   - Sew side seams; press open
   - Construct lining: sew darts; shoulder seams; side seams; press
     open
   - Attach lining to facing (right sides together); turn through;
     press
   - Bag lining at hem: lay lining over main fabric inside out; sew
     hem; turn through; press; tack lining at side seams to keep
     it from twisting
   - Construct + set sleeves: sew sleeve seam; sew sleeve cap with
     ease distributed; attach sleeve head + shoulder pad inside
     sleeve cap; set sleeve into armhole; sew lining sleeves; bag
     lining at cuff
   - Mark + sew buttonholes; sew buttons
   - Final press (the steam-and-shape pass that gives the jacket
     its set)

7. **Finishing** (H2). Hand-stitch the lining hem inside (a small
   pleat in the lining at the hem edge gives the lining room to
   move without pulling on the main fabric). Sleeve hem turned and
   blind-stitched (or bagged through the sleeve, depending on the
   construction). Button + buttonhole.

8. **Adjusting between sizes** (H2). Grade at the side seam, front
   princess seam (if present), and sleeve seam. For tailored
   garments, make a toile in calico first; for casual jackets, grade
   from measurements directly. Premium custom grading skips this
   step; mention one line.

9. **Variations** (H2). Two or three. Single versus double-breasted,
   notched versus shawl collar, lined versus unlined, with or
   without pockets.

10. **Care** (H2). For wool coats, dry-clean. For cotton + denim
    jackets, machine wash cool, line dry. State storage notes
    (hanger weight, garment-bag protection for off-season storage).

11. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Lapel rolls badly (interfacing too soft for the fabric, or roll
    line not pressed in), sleeve cap dimples (ease not distributed
    evenly + no sleeve head support), back gapes between shoulder
    blades (need a back-shoulder dart or fish-eye dart in the back),
    front does not close cleanly (under-buttoned coat is too tight;
    re-grade up a size for the chest).

### TECHNIQUE

For technique tutorials (constructing a welt pocket, bagging a
lining, setting a notched collar). Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 1,000 to 1,800 (outerwear techniques skew long) |
| PATTERN simple (casual unlined jacket, gilet) | 2,500 to 3,800 |
| PATTERN intermediate (denim jacket with lined hood, anorak) | 3,800 to 5,500 |
| PATTERN advanced (tailored blazer, trench coat, men's overcoat) | 5,500 to 8,500 |

## Self-critique pass

Same checklist as the tops prompt. Add:

17. Interfacing weight is named explicitly (light / medium / heavy
    fusible, or sew-in canvas). Beginners use the wrong weight and
    the jacket either collapses or holds itself like cardboard.
18. Lining method is named (bagged, floating, partial). Bagged is
    the efficient default; floating gives an air of luxury and a bit
    more wear comfort.
19. Final press is named as its own step. A jacket is not finished
    until the press is done.
20. Shoulder pad + sleeve head are named for tailored construction
    where they apply. Beginners can skip them and lose the line.

## Sources

freesewing-derived patterns ship with MIT attribution. In-house
patterns ship `PROPRIETARY_HOMEMADE`.

## Image policy

NEVER generate images.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-tops-author.md](sewing-tops-author.md) for the bodice
  techniques shared with outerwear.
- [sewing-bottoms-author.md](sewing-bottoms-author.md) for matched
  trousers in a suit.
