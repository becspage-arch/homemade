# Sewing / Costume + cosplay authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for costume + cosplay. Covers `COSTUME`: fancy dress, theatrical
costume, cosplay, historical reproduction, dance costume, mascot suit.
Construction is often theatrical (built for one wear or one show)
rather than for long-term garment use; creative finishing and unusual
materials are part of the territory.

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

Costume work invites enthusiastic excess; resist. The tone is the
same as the rest of the sewing prompts: calm, factual, hands on the
table. Costume making is craft, not theatre.

## Costume types covered

**Fancy dress:**
- Tunics and capes (the all-purpose costume base)
- Robes (wizard, witch, monk, druid, judge)
- Animal costumes (basic ear / tail / paw constructions)
- Era costumes (loose 17th / 18th / 19th century shapes built
  without historical accuracy, the dressing-up box version)

**Theatrical:**
- Stage robes and gowns (built for a run, may compromise long-term
  durability for fit + drape)
- Quick-change costumes (with extra closures so the actor changes
  fast)
- Character costumes (built from a designer's brief)

**Cosplay:**
- Anime / manga character costumes
- Video game character costumes
- Film + TV character costumes
- Comic book character costumes

**Historical reproduction (entry-level):**
- Loose 18th-century shifts + petticoats + simple bodices
- Edwardian tea gowns
- 1940s utility skirts and blouses (with Make Do and Mend authority)
- Renaissance simple shifts and overdresses

**Dance:**
- Simple leotards
- Ballet skirts (gathered chiffon)
- Character dance costumes (skirt + bodice + sash)
- Mascot suits (basic head + body shape, fitted over a base layer)

**Foam + worbla pieces (specialist costume armour):**
- EVA foam armour pieces (shaped + glued + painted)
- Worbla thermoplastic armour pieces (heated, shaped, sealed)
- LED-illuminated panel construction
- Headpieces (crowns, helmets, animal heads)

## Construction principles

Costume work uses the same techniques as regular sewing plus a
distinct toolkit:

- **Speed over precision.** A theatrical seam is often a straight
  serge then a folded hem; the audience does not see the inside.
- **Surface decoration leads.** Trim, sequins, gold lace, ric-rac,
  paint, dye. The finished impression matters more than seam
  perfection.
- **Closures are quick-release.** Velcro under decorative buttons
  for fast costume changes. Magnetic clasps for accessories that
  attach mid-scene.
- **Layered construction.** A costume is often a base + an overlay
  + a decorative piece, each made separately and attached together
  at fitting time.
- **Heat-formed materials.** EVA foam, worbla, craft foam,
  thermoplastics; not part of regular sewing technique but standard
  in cosplay.

## Critical techniques

For sewn costume:

- `transferring-pattern-markings`
- `casing-elastic` (most costume waists)
- `attaching-binding` (decorative binding at necklines + hems)
- `hem-machine` (the costume default)
- `topstitching` (visible decorative finishing)

For foam + thermoplastic (cosplay-specific, fall outside regular
sewing but mentioned in costume prompts):

- `eva-foam-cutting` (sharp craft knife, straight + angled cuts)
- `eva-foam-shaping` (heat gun, cooling shape on form)
- `worbla-shaping` (heat gun, layered over foam base)
- `priming-foam-for-paint` (PVA + flexible sealer)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `straight-stitch-basic`
- `cutting-on-grain`
- `casing-elastic`

## Materials master list

Fabrics:

- **Theatrical drape:** `cotton-canvas-medium`, `cotton-velvet`,
  `cotton-velveteen`, `polyester-satin`, `silk-satin`,
  `polyester-organza`, `cotton-broadcloth-medium`, `linen-medium`.
- **Specialty:** `metallic-lurex`, `sequin-fabric`,
  `holographic-vinyl`, `cotton-faux-fur`, `pleather`,
  `stretch-velvet`, `polyester-charmeuse-light`,
  `polyester-chiffon`.
- **Knits:** `cotton-jersey-medium`, `dance-spandex`,
  `four-way-stretch-lycra`.
- **Foam + thermoplastics:** `eva-foam-5mm`, `eva-foam-10mm`,
  `eva-foam-craft-2mm`, `worbla-finest-art`,
  `worbla-finest-art-fine`, `thibra-thermoplastic`.
- **Specialty paint + finish:** `flexible-fabric-paint-acrylic`,
  `metallic-foam-paint`, `airbrush-paint`,
  `clear-sealer-flexible`.

Notions:

- **Thread:** `thread-polyester-allpurpose`,
  `thread-polyester-extra-strong`, `thread-invisible-monofilament`
  (for sequin work).
- **Closures:** `velcro-hook-loop-25mm`, `velcro-hook-loop-50mm`,
  `magnetic-clasp-14mm`, `magnetic-clasp-18mm`, `snap-fastener-9mm`,
  `snap-fastener-heavy-15mm`, `zip-separating-50cm`,
  `zip-separating-65cm`.
- **Trim + decoration:** `gold-braid-trim-15mm`, `sequin-trim`,
  `ric-rac-medium`, `fringe-trim`, `tassels`, `beads-decorative`,
  `lace-trim-cotton`, `metallic-rope-cord-5mm`.
- **Structure:** `boning-spiral-steel`, `boning-plastic-rigilene`,
  `crinoline-net-stiff`, `hoop-steel-flat`, `petticoat-net-medium`.
- **Foam-work tools (referenced, not master notion items):**
  craft knife, heat gun, contact cement, PVA glue, fabric glue.

## Input contract

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `costume`.
- `garmentCategory`: `COSTUME`.
- `garmentType`: "wizard robe", "cosplay tunic", "dance leotard",
  "ballet skirt", "wedding tea gown", "anime character schoolgirl
  outfit", "EVA foam pauldron", etc.
- `skillLevel`.
- `costumeUse`: `fancy-dress` / `theatrical-run` / `cosplay` /
  `dance` / `historical-reproduction`.
- `closureType`: `velcro` / `zip` / `tie` / `magnetic` / `snap` /
  `pullover`.
- `requiresFoamWork`: boolean (cosplay armour patterns).
- `requiresTheatricalAlteration`: boolean (boning, structure work).

## Output contract

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "COSTUME",
    "garmentType": "long hooded robe with decorative gold trim",
    "skillLevel": "BEGINNER",
    "costumeUse": "fancy-dress",
    "closureType": "velcro",
    "fabricCategory": "woven",
    "sewingMethod": "machine",
    "freesewingDesign": null
  }
}
```

## Body shape

### PATTERN

1. **Opening paragraph.** Name the costume. Name the use case
   (fancy dress, school play, cosplay convention, dance recital).
   Name the construction principle (rectangle robe with hood, fitted
   bodice + gathered skirt, EVA foam armour with fabric backing).

2. **Sizing** (H2). For most costumes, generous ease so the wearer
   moves. For dance + cosplay, fitted to the body. State the
   measurement range the pattern fits. Costume sizing often runs
   one size up from regular sewing so the wearer can wear layers
   underneath.

3. **Downloading the pattern** (H2). All four calibration paths.
   Often a costume pattern is mostly rectangles cut from absolute
   dimensions plus a hood or sleeve cap; the printable pattern is
   small.

4. **What you need** (`suppliesCard`). Fabric (rough yardage at
   adult size). Notions. Trim + decoration (named generously;
   costume thrives on it). Machine + foot.

5. **Cutting + preparation** (H2). Pre-washing where the fabric
   tolerates it (synthetic satins + velvets do not; cotton and
   linen do). Cutting on grain. Identifying right side / wrong
   side.

6. **Construction** (H2). Numbered `orderedList`. Seam allowance
   stated up front.

   Typical order for a long hooded robe with gold trim:
   - Cut body front + back panels from a rectangle
   - Cut sleeves as rectangles
   - Cut hood pieces (centre back seam + facing)
   - Sew shoulder seams; press open
   - Sew sleeves into armhole
   - Sew side seams + sleeve underseam in one pass; press
   - Construct hood: sew centre seam; press; sew hood facing
   - Attach hood to neckline; topstitch
   - Trim: hand-stitch or machine-stitch gold braid around hood
     edge + hem + sleeve cuff
   - Hem (rolled or double-fold)
   - Closure: sew Velcro tabs at centre front under the trim

   Typical order for a fitted bodice + gathered skirt costume:
   - Make bodice per the tops/dresses prompt (with simpler
     finishing; costume doesn't need a lining unless the
     fabric is itchy)
   - Make gathered skirt: rectangle gathered onto a waistband
   - Attach skirt to bodice; press
   - Closure: zip at back or laced back panel
   - Surface decoration: sequin trim, ribbon, lace appliqué as
     the costume calls for

   For EVA foam pauldron:
   - Pattern in paper first; fit to shoulder
   - Cut from 5 mm or 10 mm EVA foam with craft knife
   - Heat-form on a rounded form (a small bowl, a watermelon)
   - Glue with contact cement
   - Prime with flexible sealer; paint; seal
   - Attach to fabric backing piece with hot glue or sewn
     attachment points

7. **Finishing** (H2). For sewn costumes, hem and trim. For
   foam + thermoplastic, finish + paint + seal. State the test-
   wear note: have the wearer try the costume on with intended
   undergarments + shoes + accessories before the show, in case
   alterations are needed.

8. **Variations** (H2). Two or three. Size variation (child +
   adult), use variation (fancy dress versus historical
   reproduction), decoration variation (minimal versus elaborate).

9. **Care** (H2). Costumes often spot-clean only between wears;
   wash after the run ends. State whether the fabric tolerates a
   wash + dry cycle.

10. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Costume rips at the seam during the dance (seam too narrow;
    re-stitch and back-stitch the stress points), foam piece does
    not hold its shape (heat-form on a form of the correct
    curvature; leave on the form to cool fully), Velcro snags the
    fabric (cover Velcro with a fabric flap), sequins shed during
    the show (re-secure with clear thread; pre-glue large
    sequinned panels).

### TECHNIQUE

For technique tutorials (sewing a hidden Velcro placket for quick
change, working with sequin trim, heat-shaping EVA foam, attaching
a tassel). Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 700 to 1,400 |
| PATTERN simple (hooded robe, cape, simple tunic) | 1,500 to 2,500 |
| PATTERN intermediate (fitted bodice + skirt costume, dance costume) | 2,500 to 4,000 |
| PATTERN advanced (full historical reproduction, multi-piece cosplay outfit, armour set) | 4,000 to 6,500 |

## Self-critique pass

Same checklist as the tops prompt. Add:

17. Use case named in the opening (fancy dress / theatrical /
    cosplay / dance / historical). Different use cases call for
    different construction shortcuts.
18. Heritage costume credited honestly. A Renaissance-inspired robe
    is "Renaissance-inspired", not "historically accurate
    Renaissance reproduction". A samurai-inspired cosplay piece
    credits the cultural origin and does not claim authority.
19. For foam + thermoplastic, the basic safety note appears as one
    short line ("work in a ventilated space when using contact
    cement and heat guns"). No multi-paragraph safety section.

## Sources

In-house patterns ship `PROPRIETARY_HOMEMADE`. Cosplay character
costumes that reference copyrighted properties stay in fan-work
territory (the tutorial teaches construction; the character
identification is the maker's choice).

Public-domain references for historical costume:

- *The Costumer's Manifesto* (open educational resource,
  Wisconsin-Madison).
- Janet Arnold *Patterns of Fashion*: copyright; do not copy
  patterns from these; reference for shape understanding only.
- Cunnington *Handbook of English Costume*: copyright likewise.
- Public-domain pattern books pre-1928: Butterick + McCall's +
  Vogue early issues. Internet Archive.

## Image policy

NEVER generate images.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-dresses-author.md](sewing-dresses-author.md) for fitted
  bodice + skirt costume bases.
- [sewing-specialty-author.md](sewing-specialty-author.md) for
  advanced theatrical work + harness construction.
