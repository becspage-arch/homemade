# Sewing / Dresses authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for dresses. Covers women's dresses (`WOMENS_DRESSES`), kids
dresses (under `KIDS` with `garmentType: dress`), and costume dresses
(under `COSTUME`). The construction approach is the same across
demographics; sizing + ease + fabric choices differ.

## Status

`SubCategory.autopilotEnabled = false` for every sewing sub-cat until
S-5 ships. Once enabled the autopilot routine resolves this prompt for
`womens-dresses` and for `kids` / `costume` patterns whose
`garmentType` is a dress shape.

## Pre-read (MANDATORY)

- `docs/sewing-author.md` for cross-cutting rules.
- `docs/voice-spec-2026-05-21.md` §3.4 + §3.5.
- `docs/voice-spec-quick-reference.md` §5.
- `feedback_homemade_voice.md`.
- `docs/sewing-anti-tells.md`.
- `project_sewing_locked_decisions.md`.

## Voice register

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Plain spoken,
UK English, grade 6 to 8.

**Banned phrasing.** "Perfect for", "ideal", "easy", "simple", "anyone
can". "Mash" or "mashing" anywhere. Em dashes and en dashes anywhere.
Marketing language.

**Word precision.** "Sewing", "stitching", "easing", "gathering",
"pleating", "pressing", "tacking". Dresses are "made" or "sewn".

## Dress shapes covered

The prompt covers all dress constructions. The brief's `garmentType`
disambiguates:

**Bodice + skirt constructions:**
- Fit-and-flare with set-in waist seam
- Princess-line bodice + gathered skirt
- Princess-line bodice + a-line skirt
- Princess-line bodice + circle skirt
- Princess-line bodice + pleated skirt
- Empire-waist (high under-bust seam)
- Drop-waist (low at the hip)

**One-piece constructions (no waist seam):**
- Shift dress (straight, fitted at shoulder, loose through body)
- Tent dress (a-line from shoulder)
- Wrap dress (front-wrapping, tied at side)
- T-shirt dress (knit, fitted shoulder + body)

**Specialty shapes:**
- Pinafore / sundress with shoulder straps + bib
- Apron-front dress
- Slip dress (bias-cut, narrow shoulder straps)
- Maxi (floor-length)
- Mini (above-knee)

**Sleeve types:** all of the tops sleeve types apply (set-in, raglan,
dolman, cap, sleeveless).

**Skirt fullness:**
- Straight / pencil (no flare)
- A-line (gentle flare from waist)
- Gathered (rectangle gathered onto a waistband or bodice)
- Pleated (knife / box / inverted)
- Circle (full circle, half-circle, three-quarter circle)
- Trumpet / mermaid (fitted to knee, flares from knee down)

**Closure types:**
- Pullover (no closure; knit fabric or generous neckline)
- Back invisible zip (most common for fitted woven dresses)
- Side invisible zip (slim shifts)
- Button front (shirt-dress style)
- Wrap tie (no fastenings)

## Critical techniques

Every dresses tutorial registers these in `techniqueSlugs[]` where
used:

- `staystitching`
- `transferring-pattern-markings`
- `dart-construction` or `princess-seam`
- `invisible-zipper-insertion` (back zip dresses)
- `understitching` (every facing or lining)
- `lining-attached` or `lining-floating` (lined bodices)
- `gathering-machine` (gathered skirts)
- `pleating-knife-pleats` or `pleating-box-pleats` (pleated skirts)
- `hem-machine` or `hem-rolled` (long skirts on light fabrics)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `cutting-on-grain`
- `transferring-pattern-markings`
- `finishing-seam-allowance`
- `staystitching`

## Materials master list

Fabrics:

- **Light wovens:** `cotton-poplin`, `cotton-lawn`, `viscose-challis`,
  `silk-crepe`, `silk-georgette`, `silk-charmeuse`, `cotton-voile`,
  `rayon-challis`, `tencel-twill`.
- **Medium wovens:** `cotton-shirting-medium`, `linen-medium`,
  `cotton-sateen`, `cotton-broadcloth`.
- **Heavy wovens (for structured dresses):** `cotton-twill`, `denim-light`,
  `wool-suiting`, `linen-heavy`.
- **Knits:** `cotton-jersey-medium`, `ponte-knit`, `interlock`,
  `rib-knit-1x1` (band-trim only), `bamboo-jersey`.
- **Specialty:** `silk-chiffon` (slip dresses), `silk-organza`
  (interfacing for fine wovens), `cotton-batiste` (underlining).

Notions:

- **Thread:** `thread-polyester-allpurpose`, `thread-silk-fine` (silk
  fabrics).
- **Interfacing:** `interfacing-fusible-light-woven`,
  `interfacing-sew-in-light-silk-organza`,
  `interfacing-fusible-medium-woven`.
- **Lining:** `bemberg-rayon-lining`, `cotton-batiste-lining`,
  `china-silk-lining`.
- **Closures:** `zip-invisible-40cm`, `zip-invisible-55cm`,
  `zip-invisible-60cm`, `hook-and-eye-set`, `button-shirt-15mm`,
  `snap-fastener-9mm`.
- **Finishing:** `bias-binding-cotton-12mm`, `hem-tape-cotton`.

## Input contract (the brief)

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `womens-dresses` / `kids` / `costume`.
- `garmentCategory`: matching enum value.
- `garmentType`: "fit-and-flare", "shift dress", "wrap dress",
  "pinafore", "slip dress", "kids gathered sundress", etc.
- `bodiceConstruction`: `darts` / `princess-seam` / `gathered-yoke` /
  `none-one-piece`.
- `skirtFullness`: `straight` / `a-line` / `gathered` / `pleated` /
  `circle` / `trumpet`.
- `sleeveType`, `necklineType` (from the tops list), `closureType`.
- `skillLevel`: `SewingSkillLevel` enum value.
- `requiredMeasurements[]`, `optionalMeasurements[]`.
- `freesewingDesign` (e.g. `cathrin`, `theo`).
- `difficulty`.

## Output contract

Sewing block follows the same shape as tops; specific fields:

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "WOMENS_DRESSES",
    "garmentType": "fit-and-flare with gathered skirt",
    "skillLevel": "INTERMEDIATE",
    "bodiceConstruction": "darts",
    "skirtFullness": "gathered",
    "sleeveType": "cap",
    "necklineType": "scoop",
    "closureType": "back-invisible-zip",
    "fabricCategory": "woven",
    "requiredMeasurements": ["bust", "waist", "hip", "body-height", "back-waist-length"],
    "optionalMeasurements": ["bust-point", "shoulder-width"],
    "sewingMethod": "machine",
    "hasLining": true,
    "freesewingDesign": null
  }
}
```

Rules: every text leaf `"type": "text"`, `glossaryTooltip` uses
`attrs.termSlug`, every `techniqueSlugs[]` entry wrapped inline.

## Body shape

### PATTERN

1. **Opening paragraph.** Name the dress in plain English. Name the
   construction (fit-and-flare, shift, wrap, pinafore). Name the
   fabric weight it suits. Sleeve length, sleeve type, neckline, skirt
   length, closure.

2. **Sizing and fit** (H2). Sizes graded. Body measurements taken.
   Ease at bust / waist / hip in cm. For princess-line bodices, mention
   that bust shaping comes from the seam line; for darted bodices, the
   bust + waist darts.

3. **Downloading the pattern** (H2). All four calibration paths.
   Layered PDF for the sized layer selection where the pattern ships
   in that format.

4. **What you need** (`suppliesCard`). Fabric (main + lining where
   used + underlining where used). Notions. Machine + feet (invisible
   zipper foot for back-zip dresses). Cutting tools (rotary cutter +
   long ruler for circle skirts).

5. **Cutting + preparation** (H2). Pre-washing. Cutting on the grain;
   for bias-cut slip dresses, the bias instructions are critical and
   get their own paragraph. Stay-stitching every curved neckline and
   armhole edge. Transferring all pattern markings (darts, notches,
   pocket positions, gathering marks, zipper stop).

6. **Construction** (H2). Numbered `orderedList`. Seam allowance
   stated up front. Pressing called out as a step every time.

   Typical order for a darted-bodice fit-and-flare with invisible
   back zip + gathered skirt + lining:
   - Stay-stitch all curved bodice edges
   - Sew bust + waist darts (front + back); press towards centre +
     down
   - Sew bodice shoulder seams; press open
   - Repeat for lining bodice (no understitching yet)
   - Attach lining to bodice neckline + armholes (right sides
     together); trim + clip; turn; press; understitch around neckline
     + armholes
   - Sew bodice side seams (catching lining at side seam, leaving
     a hand-stitch finish at the armhole if the lining is bagged)
   - Sew skirt panels into a tube (one side seam open for the zip)
   - Gather the skirt waist edge
   - Attach skirt to bodice; press seam towards bodice
   - Insert invisible zip down the open side seam (or back seam,
     depending on the pattern's closure location)
   - Hem skirt (try on first, level the hem from the floor up,
     pin, hem)

7. **Finishing** (H2). Hand-finish the lining hem (a thread shank
   gives the lining + outer enough independence to hang well). Hook
   + eye above the zip. Press the finished dress.

8. **Adjusting between sizes** (H2). Same convention as tops: grade
   between sizes at the side seam + bodice darts, with a soft
   transition over 5 to 8 cm. For princess-line bodices, grade at
   the princess seam, not the side seam. For very fitted dresses,
   make a toile first; for casual styles, skip the toile and grade
   from the measurements. Premium custom grading skips this manual
   step; mention in one line.

9. **Variations** (H2). Two or three. Sleeve swap, skirt length,
   neckline swap, lining versus unlined, contrasting waistband.

10. **Care** (H2). Wash and dry. For silk slip dresses, hand wash
    cool with silk wash, lay flat. For cotton sundresses, machine
    wash warm.

11. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Waistline rides up (bodice too short for the wearer's back
    waist; lengthen the bodice 1 to 2 cm), back gapes at neckline
    (stay-stitching skipped, fabric stretched; staystitch + ease
    in with a hand-tack), skirt hem uneven (cut not on grain; level
    on a dress form or hang for 24 hours then re-level).

### TECHNIQUE

For technique-only tutorials (inserting an invisible zip, sewing a
princess seam, lining a bodice). Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 700 to 1,400 |
| PATTERN simple (shift, t-shirt dress, kids sundress) | 2,000 to 3,000 |
| PATTERN intermediate (fit-and-flare, wrap dress, pinafore) | 3,000 to 4,500 |
| PATTERN advanced (princess-line with lining, bias slip dress, costume gown) | 4,500 to 6,500 |

## Self-critique pass

Same checklist as the tops prompt §"Self-critique pass". Add:

17. For lined bodices, lining attachment order is explicit (right sides
    together, trim, clip, turn, understitch). New sewers misjudge this
    step.
18. For invisible zips, the invisible zipper foot is named. The maker
    cannot get an invisible result with a regular zipper foot.

## Sources

freesewing-derived patterns ship with MIT attribution. In-house
patterns ship `PROPRIETARY_HOMEMADE`.

## Image policy

NEVER generate images. `hero` unset.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-tops-author.md](sewing-tops-author.md) for the bodice-half of
  princess-line dresses + dress-shaped tops.
- [sewing-bottoms-author.md](sewing-bottoms-author.md) for the skirt-
  half (skirts as standalone patterns).
