# Sewing / Bottoms authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for bottoms. Covers women's bottoms (`WOMENS_BOTTOMS`), men's
bottoms (`MENS_BOTTOMS`), unisex bottoms (under `UNISEX` with bottoms
`garmentType`), kids bottoms (under `KIDS` with bottoms `garmentType`).
Construction is similar across demographics; sizing + ease + fly
treatment differ.

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
"topstitching". Trousers + shorts + skirts are "made" or "sewn".

## Bottoms types covered

**Trousers + jeans + chinos:**
- Wide leg
- Straight leg
- Tapered leg
- Skinny / slim leg
- Cropped
- Cuffed
- Cargo (multiple patch pockets)
- Jeans (twin-needle topstitching + rivets + button + zip fly)
- Chinos (clean front, slash pockets, back welt pockets)
- Drawstring (casual elasticated waist + drawstring)
- Pyjama / loungewear (elastic waist, no fly, simple)
- Sweatpants (knit fabric, rib cuff or hem, elastic waist + drawstring)

**Shorts:**
- Tailored (with fly + slash pockets, like men's chino shorts)
- Casual (elastic waist + drawstring)
- Cycling / athletic (knit + flat-locked seams)
- Boxers (woven, elastic waist + fly opening)
- Bermuda (long, tailored)

**Skirts:**
- Pencil (straight, fitted at hip, often with back vent)
- A-line (gentle flare from waist)
- Gathered (rectangle gathered onto a waistband)
- Pleated (knife / box / inverted)
- Circle (full / half / three-quarter)
- Wrap (overlapping, tied at side)
- Maxi (floor-length, often gathered or a-line)
- Mini (above-knee)

**Waistband types covered:**
- Flat / tailored waistband (interfaced, with button + zip closure)
- Elasticated waistband (casing with elastic; pull-on)
- Drawstring waistband (casing with cord, often with elastic too)
- Faced waistband (no separate waistband piece; the waist edge is
  finished with a curved facing)
- Yoke waistband (a shaped front + back yoke between the waist edge
  and the body of the trouser; common on jeans)

**Fly types covered:**
- No fly (elastic / drawstring waist)
- Button fly (front overlap with buttons; chinos and traditional men's
  trousers)
- Zip fly (the most common; left-overlap on women's, right-overlap on
  men's)

**Pocket types covered:**
- In-seam (the side-seam slash pocket, common on casual trousers)
- Slash (the angled chino-style pocket, with shaped pocket bag)
- Patch (the back pocket on jeans + chinos, the front-side pocket on
  cargos)
- Welt (the back pocket on tailored trousers; single or double welt)
- Coin / watch pocket (the small pocket inside the right front pocket
  on jeans)

## Critical techniques

- `transferring-pattern-markings`
- `cutting-on-grain` (especially important for trousers; off-grain
  cuts twist)
- `fly-front-zip` or `fly-front-button` (zip-fly or button-fly
  trousers)
- `waistband-flat` / `waistband-elasticated` / `casing-elastic` /
  `casing-drawstring`
- `welt-pocket` / `in-seam-pocket` / `patch-pocket` / `slash-pocket`
  (whichever applies)
- `hem-machine` (the standard) or `blind-hem-machine` (tailored
  trousers)
- `topstitching` (jeans + chinos)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `cutting-on-grain`
- `transferring-pattern-markings`
- `finishing-seam-allowance`
- `pressing-seams-open`

## Materials master list

Fabrics:

- **Light wovens (loose summer trousers, skirts):** `cotton-poplin`,
  `cotton-lawn`, `linen-medium`, `viscose-challis`,
  `tencel-twill-light`.
- **Medium wovens (chinos, trousers):** `cotton-twill`,
  `cotton-chino`, `cotton-sateen`, `linen-heavy`, `cotton-shirting-medium`.
- **Heavy wovens (jeans, tailored trousers):** `denim-medium`,
  `denim-heavy`, `wool-suiting`, `wool-flannel`, `corduroy-medium`,
  `corduroy-needlecord`.
- **Knits (sweatpants, leggings, cycling shorts):** `french-terry`,
  `loopback-jersey`, `ponte-knit`, `merino-jersey`, `swim-lycra`.

Notions:

- **Thread:** `thread-polyester-allpurpose`, `thread-topstitch-jeans`
  (the heavy gold-coloured thread for visible jeans topstitching).
- **Interfacing:** `interfacing-fusible-medium-woven` (waistbands +
  fly facings).
- **Closures:** `zip-trouser-15cm`, `zip-trouser-20cm`,
  `zip-jeans-15cm-bronze`, `button-jeans-shank-17mm`,
  `button-trouser-15mm`, `hook-and-bar`, `snap-fastener-9mm`.
- **Pocket fabric:** `pocketing-cotton-fine`, `pocketing-silesia`
  (the slick cotton-blend traditional pocket fabric).
- **Elastic:** `woven-elastic-25mm`, `woven-elastic-40mm`,
  `braided-elastic-15mm` (casing).
- **Drawstring:** `drawstring-cotton-cord`,
  `drawstring-flat-cotton-tape`.

## Input contract

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `womens-bottoms` / `mens-bottoms` / `kids` /
  `unisex`.
- `garmentCategory`: matching enum.
- `garmentType`: "wide-leg trousers", "skinny jeans", "chinos",
  "pleated skirt", "elasticated shorts", "kids drawstring trousers",
  etc.
- `skillLevel`.
- `waistbandType`: `flat` / `elasticated` / `drawstring` / `faced` /
  `yoke`.
- `flyType`: `none` / `button` / `zip`.
- `pocketTypes[]`: any subset of `in-seam` / `slash` / `patch` /
  `welt` / `coin`.
- `legShape` (trousers only): `wide` / `straight` / `tapered` /
  `skinny` / `cropped` / `cuffed`.
- `skirtFullness` (skirts only): `straight` / `a-line` / `gathered` /
  `pleated` / `circle` / `wrap`.
- `requiredMeasurements[]`, `optionalMeasurements[]`.
- `freesewingDesign` (e.g. `paco`, `penelope`).

## Output contract

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "WOMENS_BOTTOMS",
    "garmentType": "wide-leg trousers with zip fly + flat waistband",
    "skillLevel": "INTERMEDIATE",
    "waistbandType": "flat",
    "flyType": "zip",
    "pocketTypes": ["slash", "welt"],
    "legShape": "wide",
    "fabricCategory": "woven",
    "requiredMeasurements": ["waist", "hip", "body-height", "inseam"],
    "optionalMeasurements": ["thigh-circumference", "calf-circumference"],
    "sewingMethod": "machine",
    "freesewingDesign": "paco"
  }
}
```

## Body shape

### PATTERN

1. **Opening paragraph.** Name the garment. Name the construction
   (zip-fly tailored trouser, drawstring lounge trouser, gathered
   midi skirt). Name the fabric weight.

2. **Sizing and fit** (H2). Sizes graded. Waist + hip + body height
   + inseam ranges. Ease at hip in cm. For trousers, the crotch
   length (back rise + front rise) is the fit-critical dimension; for
   skirts, the hip is.

3. **Downloading the pattern** (H2). All four calibration paths.

4. **What you need** (`suppliesCard`). Fabric (yardage at common
   size). Notions (thread, interfacing, closure, pocket fabric,
   elastic / drawstring). Machine + feet (zipper foot, walking foot
   for heavy denim, jeans needle for denim).

5. **Cutting + preparation** (H2). Pre-washing, especially important
   for denim, linen, and any natural fibre that shrinks. Cutting on
   grain; trousers cut off-grain twist on the leg. Stay-stitching the
   waist edge of the waistband + the curved crotch seam. Transferring
   all pocket markings, fly markings, dart positions.

6. **Construction** (H2). Numbered `orderedList`. Seam allowance
   stated up front.

   Typical order for a zip-fly trouser with slash pockets:
   - Stay-stitch waist + crotch curve
   - Sew darts (back + occasionally front); press to centre
   - Construct slash pockets: sew pocket facing to front; understitch;
     sew pocket bag to facing; baste pocket bag to side seam
   - Sew front + back crotch seam from inseam mark up to fly notch
     (leaving the fly opening unsewn)
   - Insert zip fly (centre-front in women's, or right-overlap men's
     fly): topstitch the fly shield + fly facing in sequence per
     the pattern's fly diagram
   - Sew side seams; press open; finish edges
   - Sew inseam; press open
   - Sew the back crotch seam from inseam to centre-back waist;
     reinforce with a second row of stitching
   - Construct + attach waistband: interface; sew to body; turn under;
     topstitch; sew button + buttonhole at waistband closure
   - Hem trouser

   Typical order for a drawstring elasticated lounge trouser:
   - Sew side seams + inseam
   - Sew crotch seam
   - Construct waistband casing: fold over + topstitch leaving a 5 cm
     gap; thread elastic through; thread drawstring through eyelets;
     close gap
   - Hem trouser

   Typical order for a gathered midi skirt with elastic waistband:
   - Sew side seams of the skirt rectangle into a tube
   - Fold over top edge for casing; topstitch leaving 5 cm gap;
     thread elastic; close gap
   - Hem

7. **Finishing** (H2). Hem (machine straight for casual, blind hem for
   tailored). Button + buttonhole at waistband. For jeans, set rivets
   at front pocket corners + back pocket corners with a rivet setter.

8. **Adjusting between sizes** (H2). Grade between sizes at the side
   seam and the inseam. State the crotch length (which sets fit for
   trousers); explain that adjusting between two waist sizes does not
   adjust the crotch length and may need a separate adjustment
   (lengthen the rise by 1 to 2 cm, shorten if the pattern is for a
   shorter wearer). Premium custom grading skips this step; mention
   one line.

9. **Variations** (H2). Two or three. Hem length variation (full
   length / cropped / cuffed), pocket variation (add patch back
   pockets to a chino), fabric weight variation.

10. **Care** (H2). Wash, dry. Denim recommendations: turn inside out;
    wash on cool; line dry to prevent shrinkage.

11. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Crotch points down (rise too short, back length needs adding),
    waist sits too low (waistband cut at one size for waist but
    another for hip), pocket sags (pocket fabric too heavy for the
    main fabric; switch to fine pocketing), fly bulges (interfacing
    skipped on fly facing).

### TECHNIQUE

For technique-only tutorials (inserting a zip fly, sewing welt
pockets, attaching a waistband). Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 800 to 1,500 (fly + welt pocket tutorials skew longer) |
| PATTERN simple (elastic-waist trouser, gathered skirt, casual shorts) | 1,800 to 2,800 |
| PATTERN intermediate (zip-fly trouser with slash pockets, a-line skirt with invisible zip) | 3,000 to 4,500 |
| PATTERN advanced (jeans with topstitching + rivets + back patch pockets, tailored wool trouser) | 4,500 to 6,500 |

## Self-critique pass

Same checklist as the tops prompt. Add:

17. Crotch length is named for trousers patterns. Beginners assume
    waist size sets crotch length; it does not.
18. Fly direction (women's-left-overlap, men's-right-overlap) is
    stated explicitly. Mistaking direction is a re-cut.
19. For jeans, the topstitching thread is named separately (gold or
    contrast colour) and the maker is told to use a longer stitch
    length (3 to 3.5 mm) for that thread weight.

## Sources

freesewing-derived patterns ship with MIT attribution. In-house
patterns ship `PROPRIETARY_HOMEMADE`.

## Image policy

NEVER generate images.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-tops-author.md](sewing-tops-author.md) for matched tops.
- [sewing-outerwear-author.md](sewing-outerwear-author.md) for
  matching trouser-suit jackets.
