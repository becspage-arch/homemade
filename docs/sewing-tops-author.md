# Sewing / Tops authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for tops. Covers women's tops (`WOMENS_TOPS`), men's tops
(`MENS_TOPS`), unisex tops (`UNISEX`), kids tops (`KIDS`), and babies
tops (`BABIES`) including one-piece babies constructions (sleepsuits,
rompers, bodysuits). The construction patterns repeat across the four
demographics; gendered fit and grading notes appear inline where the
tutorial covers them.

## Status

`SubCategory.autopilotEnabled = false` for every sewing sub-cat until
S-5 ships. The autopilot routine resolves this prompt for any of
`womens-tops`, `mens-tops`, and (for tops-shaped garments)
`kids` / `babies` / `unisex` sub-cats once enabled.

## Pre-read (MANDATORY)

- `docs/sewing-author.md` for the category-level cross-cutting rules
  (terminology lock, calibration paths, body measurements, image
  policy, premium gating, freesewing attribution).
- `docs/voice-spec-2026-05-21.md` §3.4 (craft technique) and §3.5
  (craft project).
- `docs/voice-spec-quick-reference.md` 10-point self-critique in §5.
- `feedback_homemade_voice.md` for the eight hard rules.
- `docs/common-issues.md` for cross-category recurring patterns.
- `docs/sewing-anti-tells.md` for sewing-specific anti-tells.
- `project_sewing_locked_decisions.md` for terminology, calibration
  paths, body measurement model, premium gating, freesewing locks.

## Voice register

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Plain spoken,
UK English, grade 6 to 8 reading level. Sentences mostly 8 to 15 words.
Calm, factual, hands on the table. The fabric does what the fabric
does; the seam holds because the seam holds.

**Banned phrasing** (rewrite on sight):

- "Perfect for", "ideal for", "easy", "simple", "anyone can".
- "Game-changer", "must-have", "you've got this", "trust the process".
- "Mash" or "mashing" anywhere (use "grade between sizes").
- Em dashes and en dashes anywhere in body, JSON, comments, or
  metadata. Use commas, colons, brackets, full stops, or rewrite.
- Marketing language. The tutorial does the work that makes the reader
  confident; the prose does not flatter.

**Word precision.** The verbs are "sewing", "stitching", "cutting",
"pinning", "pressing", "tacking", "making", "easing", "gathering",
"hemming". Not "crocheting", not "knitting". "Pressing" (with an iron)
is different from "ironing"; use "pressing" for seams and shaping
heat. Tops are "made" or "sewn", never "knitted".

## Garment types covered

The single prompt covers every top-shaped construction. The brief's
`garmentType` field disambiguates:

**Woven tops:**
- Blouse with set-in sleeves and front placket
- Shirt with collar + stand, button placket, cuffs
- Sleeveless blouse with bound or faced armhole
- Tunic with side splits + yoke
- Camisole with bias strap + facing
- Peasant top with gathered raglan or gathered round neck

**Knit tops:**
- T-shirt (basic crew, V-neck, scoop)
- Long-sleeve tee with rib cuff
- Henley with placket
- Polo with collar + placket
- Jumper with set-in sleeve in heavier knit
- Sweatshirt with rib cuff + waistband + hood (drop-shoulder)
- Cardigan with button band or zip (front-opening knit)

**Babies (one-piece tops shapes):**
- Sleepsuit with footed legs and snap fastener crotch
- Romper with poppered crotch
- Bodysuit / vest with envelope neckline + crotch poppers

**Sleeve types covered:**
- Set-in sleeve (the workhorse fitted sleeve)
- Raglan sleeve (diagonal seam from neckline to underarm; forgiving fit)
- Dolman sleeve (sleeve cut as part of bodice; no armhole seam)
- Drop-shoulder sleeve (relaxed shoulder seam set below the natural
  shoulder; common on sweatshirts + oversized tops)
- Cap sleeve (very short, set-in)
- Sleeveless (with armhole bound or faced)

**Neckline types covered:**
- Crew neck (round, finished with rib band on knits or facing on wovens)
- Scoop neck (deeper round)
- V-neck (mitered point or overlapped)
- Boat neck (wide, shallow)
- Square neck (with corner reinforcement)
- Henley / placket (button placket on a round neck)
- Collar + stand (shirt-style)

## Critical techniques

Every tops tutorial registers these in `techniqueSlugs[]` where used:

- `staystitching` (every curved neckline edge on wovens)
- `transferring-pattern-markings`
- `set-in-sleeve` or `raglan-sleeve` or `dolman-sleeve` or
  `drop-shoulder` (whichever applies)
- `ease-distribution` (sleeve-cap easing for set-in sleeves)
- `pressing-seams-open` and `pressing-seams-to-side` (state which
  per seam)
- `attaching-cuff` (long-sleeve tutorials)
- `attaching-binding` or `understitching` (neckline finishing on wovens)

`criticalTechniques[]` for a tops tutorial typically includes:

- `sewing-machine-basics`
- `straight-stitch-basic`
- `cutting-on-grain`
- `transferring-pattern-markings`
- `finishing-seam-allowance`

## Materials master list (canonical slugs)

Fabrics the prompt references by slug:

- **Light wovens:** `cotton-poplin`, `cotton-lawn`, `cotton-voile`,
  `cotton-shirting`, `linen-medium`, `viscose-challis`, `silk-crepe`.
- **Medium wovens:** `cotton-poplin-medium`, `linen-heavy`,
  `cotton-flannel`, `chambray`, `cotton-canvas-light`.
- **Knits:** `cotton-jersey-light`, `cotton-jersey-medium`,
  `cotton-jersey-heavy`, `ponte-knit`, `french-terry`, `loopback-jersey`,
  `interlock`, `rib-knit-1x1`, `rib-knit-2x2`, `merino-jersey`.
- **Specialty:** `swim-lycra`, `bamboo-jersey`, `modal-jersey`.

Notions:

- **Thread:** `thread-polyester-allpurpose`, `thread-cotton-allpurpose`,
  `thread-polyester-bobbin`.
- **Interfacing:** `interfacing-fusible-light-woven`,
  `interfacing-fusible-medium-woven`, `interfacing-sew-in-medium`.
- **Closures:** `button-shirt-15mm`, `button-shirt-12mm`,
  `snap-fastener-9mm`, `snap-fastener-baby-7mm`, `zip-invisible-30cm`,
  `zip-invisible-40cm`.
- **Finishing:** `bias-binding-cotton-12mm`, `bias-binding-cotton-25mm`,
  `fold-over-elastic-15mm`.
- **Knit-specific:** `clear-elastic-6mm` (shoulder seam stabilisation),
  `ballpoint-needle-75-11`, `ballpoint-needle-90-14`,
  `stretch-needle-75-11`.

If a needed item is not in the master tables, add it via the proper
seed script before authoring. Do not invent a slug.

## Input contract (the brief)

A brief is a JSON or markdown chunk describing one tops tutorial.
Expect:

- `title`: short plain-English title.
- `slug`: URL slug, kebab-case.
- `type`: `PATTERN` (a buildable pattern) or `TECHNIQUE` (a method
  taught in isolation).
- `subCategorySlug`: one of `womens-tops` / `mens-tops` / `kids` /
  `babies` / `unisex`.
- `garmentCategory`: `WOMENS_TOPS` / `MENS_TOPS` / `KIDS` / `BABIES` /
  `UNISEX`.
- `garmentType`: free text disambiguating the shape (e.g. "set-in
  sleeve blouse", "raglan sweatshirt", "babies sleepsuit").
- `skillLevel`: one of `SewingSkillLevel` enum values (typically
  `ABSOLUTE_BEGINNER` / `BEGINNER` / `IMPROVER` / `CONFIDENT_BEGINNER`
  / `INTERMEDIATE` / `ADVANCED` / `EXPERT`).
- `fabricCategory`: `woven` / `knit` / `stretch-woven`.
- `sleeveType`: `set-in` / `raglan` / `dolman` / `drop-shoulder` /
  `sleeveless` / `cap`.
- `necklineType`: `crew` / `scoop` / `v` / `boat` / `square` /
  `henley` / `collar-and-stand`.
- `closureType`: `pullover` / `front-button` / `back-zip` / `crotch-snap`
  (babies) / `henley-button`.
- `requiredMeasurements[]`: subset of the saved-measurements vocabulary.
- `optionalMeasurements[]`: for advanced disclosure.
- `freesewingDesign`: if derived from a `@freesewing/<design>` package,
  the package slug (e.g. `aaron`, `simon`, `huey`, `noble`); otherwise
  null.
- `difficulty`: `BEGINNER` / `INTERMEDIATE` / `ADVANCED`.
- `sources`: public-domain references or freesewing attribution.

## Output contract (TutorialUploadInput-shaped JSON)

The sewing block on `TutorialUploadInput` carries the sewing-specific
fields. For freesewing-derived patterns, the `SewingPattern` row
populated alongside the tutorial carries the freesewing provenance
(`isFreesewingDesign`, `freesewingPackageName`, `freesewingVersion`,
`freesewingDesignSlug`, `sourceLicence: MIT`, `attributionText`).

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "sewing",
  "subCategorySlug": "womens-tops",
  "difficulty": "INTERMEDIATE",
  "sourceType": "MIT",
  "sourceNotes": "<plain-text references + freesewing attribution where applicable>",
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "WOMENS_TOPS",
    "garmentType": "set-in sleeve blouse",
    "skillLevel": "INTERMEDIATE",
    "sleeveType": "set-in",
    "necklineType": "collar-and-stand",
    "closureType": "front-button",
    "fabricCategory": "woven",
    "requiredMeasurements": ["bust", "waist", "shoulder-width", "arm-length"],
    "optionalMeasurements": ["back-waist-length", "wrist-circumference"],
    "sewingMethod": "machine",
    "freesewingDesign": null
  },
  "glossaryTerms": [
    { "slug": "ease-distribution", "term": "Ease distribution", "definition": "Spreading the slight extra length built into a sleeve cap so the sleeve sits smoothly into the armhole without puckers or visible gathers." }
  ],
  "techniqueSlugs": ["set-in-sleeve", "ease-distribution", "attaching-cuff", "staystitching"],
  "criticalTechniques": ["set-in-sleeve", "staystitching"],
  "body": { "type": "doc", "content": [] }
}
```

Rules:

- Every text leaf in the TipTap body has `"type": "text"`. The public
  renderer silently drops nodes that hit its default case.
- Every `glossaryTerms[]` entry appears inline at least once wrapped in
  a `glossaryTooltip` mark whose `attrs.termSlug` matches the glossary
  slug. Not `slug`. The voice-check CLI exits non-zero on the wrong
  key.
- Every `techniqueSlugs[]` entry appears inline wrapped in a
  `techniqueLink` mark.
- Every `criticalTechniques[]` entry also lives in `techniqueSlugs[]`.
- No image generation. `hero` stays unset.

## Body shape

### PATTERN

1. **Opening paragraph (secret in first sentence).** Name the garment
   in plain English. Name the construction (set-in sleeve, raglan,
   dolman, drop-shoulder, sleeveless). Name the fabric weight the
   pattern suits. Two to four sentences.

2. **Sizing and fit** (H2). State the sizes the pattern grades between
   and the body measurements the maker takes to choose her size. For
   women's patterns, name the bust + waist + hip + height range. For
   men's, chest + waist + height. For kids and babies, age range plus
   one or two key measurements (chest + height for tops). If the
   pattern uses ease (most do), state the wearing ease so the maker
   knows whether to size up or down for her preferred fit.

3. **Downloading the pattern** (H2). Mention all four calibration
   paths in plain English. For tiled print, name the paper sizes
   supported and the test-square check. For credit-card calibration,
   the on-screen square check. For projector, the calibrated SVG file
   without page boundaries. For browse-only, the inline render with
   measurements labelled. State which path you used to make the
   sample (so the maker has a working example to follow).

4. **What you need** (`suppliesCard` block). Fabric (named by master
   slug + plain-English description + weight in gsm where it matters +
   yardage at the most common size + how the yardage scales). Notions
   (thread, interfacing where used, closure, finishing tape).
   Machine + foot (zipper foot, walking foot for knits, buttonhole
   foot). Hand-tool minimum if the tutorial is hand-sewn (uncommon for
   tops but possible for a basic camisole or peasant top).

5. **Cutting and preparation** (H2). Pre-washing the fabric in the
   same way the finished garment will be washed (so it cannot shrink
   afterwards). Pressing flat. Identifying warp + weft + selvedge for
   wovens, or course + wale for knits. Cutting layout (refer the maker
   to the projector / printed layout the pattern ships with). Stay-
   stitching every curved edge on wovens before any other construction
   begins.

6. **Construction** (H2). Numbered `orderedList`. Each step one short
   paragraph or one list item. State the seam allowance up front
   ("All seams 1.5 cm unless noted") and use it consistently. Call out
   right side / wrong side at every joining step (beginners genuinely
   need this). Call out pressing as its own step every time; new
   sewers skip it and the result looks slack.

   The typical order for a set-in sleeve woven blouse:
   - Stay-stitch neckline + armholes
   - Sew bust + waist darts; press towards centre
   - Sew shoulder seams; press open
   - Apply interfacing to collar pieces; sew collar + stand;
     attach to neckline; understitch
   - Sew side seams from underarm to hem; press open
   - Set sleeves (ease-stitch cap, distribute fullness, pin, sew);
     press towards sleeve
   - Sew sleeve cuff (interface, attach, fold, topstitch)
   - Sew button placket; mark + sew buttonholes; sew buttons
   - Hem

   The typical order for a raglan knit sweatshirt:
   - Stabilise shoulders with clear elastic
   - Sew front + back raglan seams
   - Sew neckline rib band; attach in the round
   - Sew side + sleeve seams in one pass (raglan construction lets you
     do this)
   - Sew waistband rib; attach
   - Sew cuff ribs; attach
   - Sew hood if present (drop-shoulder hoodies)

7. **Finishing** (H2). Hem (machine straight stitch on knits with a
   walking foot or zigzag for stretch, blind hem on wovens, twin needle
   for visible decorative finish on knits). Buttons + buttonholes
   (mark from the pattern + double-check spacing before cutting). For
   babies, set the crotch poppers per the pattern's marked positions.

8. **Adjusting between sizes** (H2). If the maker's measurements fall
   between two sizes, the convention is to grade between them at the
   side seam and the sleeve seam. Explain the grading line (curving
   the cutting line from one size at the bust to another at the waist
   and back, with a soft transition over 5 to 8 cm). State the
   pattern's grading rule (between sizes for the same body, between
   cup sizes if the pattern offers cup variants). Premium custom
   grading skips this manual step entirely; mention the premium gate
   one line, no more.

9. **Variations** (H2). Two or three. Different fabric weight,
   different sleeve length, different neckline finish, different
   closure (snap instead of button for babies).

10. **Care** (H2). How to wash and dry. For wool jumpers, hand wash or
    cool machine wash on a wool cycle, lay flat to dry. For cotton
    shirts, machine wash on warm, tumble dry or line dry. State the
    pre-wash check the maker did at cutting so the finished garment is
    not surprising.

11. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Common failures: sleeve cap pulls (ease not distributed evenly),
    neckline gapes (stay-stitching skipped + fabric stretched out),
    buttonholes uneven (placket interfacing missed or buttonhole foot
    not calibrated), knit hem tunnels (walking foot needed + stitch
    length increased).

### TECHNIQUE

For a tutorial that teaches one technique in isolation (setting a
sleeve, sewing a French seam on the side seams of a blouse, attaching
a cuff). 600 to 1,200 words. Shape:

1. **What this is and what it does** (opening paragraph). Name the
   technique plainly. State when a tops tutorial reaches for it.
2. **When to use it** (H2). Which fabric weights it suits. Which it
   does not. Which garment types it lands in.
3. **What you need** (`suppliesCard`). Fabric pre-cut to the practice
   size. Thread. Machine + foot. Iron + pressing cloth where heat
   matters.
4. **Step by step** (H2). Numbered `orderedList`. State the seam
   allowance. Press where pressing is part of the technique.
5. **What it looks like when it is right** (H2). One or two short
   paragraphs on the finished appearance.
6. **Common mistakes** (`troubleshooter` block). Three to five
   failure / cause / fix triples.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 600 to 1,200 |
| PATTERN simple (sleeveless top, simple tee) | 1,800 to 2,800 |
| PATTERN intermediate (collared shirt, raglan sweatshirt, henley) | 2,800 to 4,000 |
| PATTERN advanced (tailored blouse with placket + collar + cuffs, set-in sleeve men's shirt) | 4,000 to 5,500 |
| PATTERN babies one-piece (sleepsuit, romper) | 2,500 to 3,500 |

## Self-critique pass

After drafting, run two passes before writing the JSON:

1. **Voice + common-issues sweep.** Read every paragraph against
   `docs/voice-editor-prompt.md`, `docs/common-issues.md`,
   `feedback_homemade_voice.md`. Rewrite in place.
2. **Sewing-specific anti-tell sweep.** Read every paragraph against
   `docs/sewing-anti-tells.md`. Rewrite in place.

Checklist:

1. Opening sentence states the garment in plain English. No academic
   opening. No "throughout history". No "perfect for".
2. No em dashes or en dashes anywhere in the JSON.
3. Sentences mostly 8 to 15 words. Paragraphs short.
4. Sequential instructions are `orderedList`, never prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` mark whose `attrs.termSlug` matches.
6. Every `techniqueSlugs[]` entry appears inline wrapped in a
   `techniqueLink` mark.
7. Every `criticalTechniques[]` entry is also in `techniqueSlugs[]`.
8. Every text leaf has `"type": "text"`.
9. Seam allowance stated up front. Right side / wrong side called out
   at every joining step. Pressing called out as a step every time.
10. Hand-sewn alternative named where the body uses a machine and the
    work is plausibly hand-sewable.
11. Heritage-craft attribution honest where named (boro-inspired
    visible mending says "boro-inspired", not "boro").
12. Sources cite public-domain references or freesewing MIT
    attribution; no modern designer or branded pattern citations.
13. Image policy respected (no AI image generation, `hero` unset).
14. Premium gate mentioned in one line where relevant (custom grading,
    visual hack composer), nothing more.
15. UK English consistent. "Pre-wash" not "pre-shrink". "Press" for
    iron-on-seam, "iron" only for general fabric flattening.
16. "Grade between sizes" used; "mash" never used.

## Sources

freesewing-derived patterns ship with MIT attribution in `sourceNotes`:

```
Pattern draft derived from @freesewing/aaron v3.2.1 (MIT, Joost De
Cock + contributors). The freesewing engine outputs the base draft;
the construction notes + finishing + voice are Homemade-original.
See THIRD_PARTY_LICENSES.md for the full licence.
```

In-house patterns ship with `sourceType = "PROPRIETARY_HOMEMADE"`.

Public-domain construction references that may inform a tops tutorial:

- *Encyclopedia Britannica* eleventh edition (1911), needlework
  + dressmaking entries. Project Gutenberg.
- WI *Make Do and Mend* pamphlets (1943, UK Board of Trade).
- The Singer Sewing Library (1950s), variable copyright; check
  individual volume.
- Threads magazine first decade (early 1980s), technique-led writing.
  Out of copyright varies by issue.

## Image policy

NEVER generate images in this prompt. Drafts ship with `hero` unset.
The permitted visual surfaces are freesewing-rendered SVG (S-5a),
parametric schematic (future), designer-provided heroes (S-7), and
public-domain construction illustrations sourced by the dedicated
image worker. No Fal img2img. No AI image generation.

## See also

- [sewing-author.md](sewing-author.md) for the category-level index.
- [sewing-bottoms-author.md](sewing-bottoms-author.md) for matched
  trousers / shorts / skirts.
- [sewing-outerwear-author.md](sewing-outerwear-author.md) for jackets
  + coats + vests over the same body.
