# Sewing / Accessories authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for accessories. Covers `ACCESSORIES`: scarves, belts, ties,
headbands, hats, gloves, mittens, hair accessories. Small projects with
broad appeal. Accessories are the natural entry point for new sewers
and a good gift project for confident sewers.

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

## Accessory types covered

- **Scarves:** rectangle scarves, gathered infinity scarves, fringed
  silk squares, bias-cut neckerchiefs.
- **Belts:** flat fabric belts with d-ring closure, obi-style sash
  belts, plaited fabric belts.
- **Ties + cravats:** standard men's tie (lined, bias-cut), bow tie,
  cravat, neckerchief.
- **Headbands + hair accessories:** elastic-back headbands, knot-front
  headbands, scrunchies, fabric-covered hair clips, hair bows.
- **Hats:** beanies (knit fabric, sewn or jersey), sun hats with brim,
  bucket hats, baseball-cap-style sewn-panel hats, soft caps, baby
  bonnets.
- **Gloves + mittens:** simple fleece mittens, knit-fabric fingerless
  gloves, child mittens with elastic at the wrist.
- **Eye masks + bandanas:** sleep masks (filled or unfilled), bandanas
  (square hemmed scarf), face masks.

## Critical techniques

- `hem-rolled` (silk scarves)
- `bias-cutting` (bias-cut neckerchiefs, fabric ties)
- `casing-elastic` (scrunchies, elastic headbands, mitten wrist)
- `turning-edges-cleanly` (small accessories where every edge shows)
- `topstitching` (visible decorative finishing)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `straight-stitch-basic`
- `pressing-seams-open`
- `turning-edges-cleanly`
- `finishing-seam-allowance`

## Materials master list

Fabrics:

- **Silk + light wovens (scarves, ties):** `silk-twill`,
  `silk-chiffon`, `silk-charmeuse`, `cotton-lawn`,
  `cotton-voile`.
- **Medium wovens (belts, headbands):** `cotton-poplin`,
  `cotton-shirting-medium`, `cotton-canvas-light`.
- **Heavy wovens (hats, structured accessories):** `wool-melton`,
  `wool-felt`, `cotton-canvas-heavy`, `denim-medium`, `corduroy`.
- **Knits (scrunchies, beanies, scarves):** `cotton-jersey-medium`,
  `merino-jersey`, `velvet-stretch`, `ponte-knit`.
- **Specialty:** `interfacing-fusible-medium-woven` (often substitutes
  for fabric weight in structured belt + hat constructions),
  `fleece-polyester` (mittens).

Notions:

- **Thread:** `thread-polyester-allpurpose`, `thread-silk-fine` (silk
  ties + scarves).
- **Closures:** `belt-buckle-25mm`, `belt-buckle-40mm`, `d-ring-25mm`,
  `d-ring-40mm`, `snap-fastener-9mm`, `velcro-hook-loop`.
- **Elastic:** `braided-elastic-6mm` (mittens), `braided-elastic-10mm`
  (headbands), `braided-elastic-15mm`, `fold-over-elastic-15mm`.
- **Interfacing:** `interfacing-fusible-light-woven`,
  `interfacing-fusible-medium-woven`.
- **Filling:** `wadding-cotton-lightweight` (eye masks),
  `lavender-buds-dried` (sleep accessories, optional add-in).

## Input contract

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `accessories`.
- `garmentCategory`: `ACCESSORIES`.
- `garmentType`: "scarf", "tie", "scrunchie", "headband", "beanie",
  "bucket hat", "mittens", "eye mask", "belt", etc.
- `skillLevel`: usually `ABSOLUTE_BEGINNER` / `BEGINNER` /
  `CONFIDENT_BEGINNER` for most accessories; `INTERMEDIATE` for
  multi-panel hats and lined ties.
- `closureType`: `none` / `elastic` / `tie` / `buckle` / `snap` /
  `velcro`.
- `fabricCategory`: `woven` / `knit` / `mixed`.
- `requiredMeasurements[]`: usually empty (head circumference for
  hats; wrist for mittens).

## Output contract

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "ACCESSORIES",
    "garmentType": "bucket hat",
    "skillLevel": "CONFIDENT_BEGINNER",
    "closureType": "none",
    "fabricCategory": "woven",
    "requiredMeasurements": ["head-circumference"],
    "optionalMeasurements": [],
    "sewingMethod": "machine",
    "hasInterfacing": true,
    "freesewingDesign": null
  }
}
```

## Body shape

### PATTERN

1. **Opening paragraph.** Name the accessory. Name the construction.
   Name the fabric weight. One short paragraph; accessories are
   small enough that orientation is fast.

2. **Sizing** (H2). For hats, the head-circumference range the
   pattern fits. For mittens, hand-circumference. For headbands,
   one-size-fits-most (the elastic absorbs variation). For ties,
   adult length (130 to 145 cm finished) versus shorter / child
   length.

3. **Downloading the pattern** (H2). All four calibration paths.
   Many accessories are buildable from absolute dimensions (a 200 by
   30 cm rectangle for a scarf, an 8 cm wide strip for a scrunchie)
   so the printed pattern is small.

4. **What you need** (`suppliesCard`). Fabric (small yardage; often a
   fat quarter or half a metre is enough). Interfacing where used.
   Notions. Machine + foot.

5. **Cutting + preparation** (H2). Pre-washing (especially important
   for silk; pre-wash silk by hand in silk wash before cutting).
   Cutting on grain. Cutting interfacing.

6. **Construction** (H2). Numbered `orderedList`. Seam allowance up
   front (often smaller for accessories: 5 mm for ties, 1 cm for
   small bags and headbands).

   Typical order for a knot-front headband:
   - Cut two pieces (each a knot half + tail)
   - Fold each in half lengthwise; sew long seam; turn through
   - Press
   - Cross the two knots; pin
   - Sew the elastic-back band
   - Attach the knot-front to the elastic band; topstitch

   Typical order for a bucket hat:
   - Apply interfacing to crown + side + brim pieces
   - Sew crown + side panel seams; press
   - Sew side seam closed; press
   - Sew brim pieces together at outer + inner seams; turn; topstitch
     around the brim in concentric rings
   - Attach brim to side panel; bind raw edge with bias tape

   Typical order for a tie:
   - Cut tie pieces on the bias (45 degrees to selvedge)
   - Cut interlining strip on the bias; pin inside tie shell
   - Slip stitch the tie's long seam closed by hand (this is the
     traditional method that gives a tie its hang; machine seam is
     possible but stiffer)
   - Press

7. **Finishing** (H2). For visible-stitch hats, topstitch around
   crown joins for a polished finish. For silk scarves, hand-rolled
   hem if the maker is up for it; machine narrow-hem otherwise. For
   ties, press the back seam by hand-folding rather than ironing
   flat (a flattened tie does not roll).

8. **Variations** (H2). Two or three. Fabric variation (linen versus
   cotton for a scarf), size variation (child versus adult), with /
   without trim.

9. **Care** (H2). Wash and dry. For silk ties + scarves, dry-clean.
   For cotton + linen accessories, machine wash cool.

10. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Hat too tight (head measurement taken too high; measure at the
    fullest part of the skull), tie too short (lengthen the
    pattern; adult ties run 145 to 152 cm), scrunchie too loose
    (elastic too long; cut shorter), scarf hem distorts (bias
    grain not respected; cut on bias for drape and stability).

### TECHNIQUE

For technique tutorials (rolled hem on silk, bias-cutting a tie,
attaching a buckle). Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 500 to 1,000 |
| PATTERN very simple (scrunchie, eye mask, simple scarf) | 1,000 to 1,500 |
| PATTERN simple (headband, beanie, mittens, bandana) | 1,200 to 2,000 |
| PATTERN intermediate (bucket hat, lined tie, sun hat with brim) | 2,000 to 3,000 |

## Self-critique pass

Same checklist as the tops prompt. Add:

17. For silk and bias-cut accessories, the grain direction is named
    explicitly. New sewers cut on grain by default and ties hang
    badly.
18. Yardage is given honestly. Most accessories use less than half a
    metre; the prompt names how much.

## Sources

freesewing-derived patterns ship with MIT attribution (where they
exist; freesewing covers some accessories like Carlton + Bruce).
In-house patterns ship `PROPRIETARY_HOMEMADE`.

## Image policy

NEVER generate images.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-bags-author.md](sewing-bags-author.md) for accessory bags
  (clutches, makeup pouches).
