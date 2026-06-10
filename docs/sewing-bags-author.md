# Sewing / Bags authoring

Canonical input for any worker session that drafts a sewing tutorial or
pattern for bags. Covers `BAGS`: tote bags, backpacks, clutches, makeup
pouches, project bags, drawstring bags, market bags. Interfacing-critical
construction; bags live or die by the interfacing weight chosen.

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

## Bag types covered

- **Totes:** open-top tote, lined tote with magnetic clasp, market
  tote with side gussets, tote with internal pockets, box-pleated
  shopper.
- **Backpacks:** simple drawstring rucksack, panel backpack with
  zipped main + front pocket, child backpack.
- **Clutches:** flat clutch with envelope flap, wristlet, foldover
  clutch with magnetic clasp.
- **Pouches:** makeup pouch with zip top, pencil case, cosmetics roll,
  toiletry bag with waterproof lining.
- **Project bags:** knitting project bag with drawstring + clear
  panel, cross-stitch project bag with handle, scissor pouch.
- **Drawstring bags:** simple drawstring laundry bag, gym bag,
  shoe bag, gift bag.
- **Specialty:** sling bag, bumbag / fanny pack, bicycle pannier,
  insulated lunch bag.

## Construction patterns covered

- **Lined boxes-corner:** corners boxed to create a flat base
- **Lined cylinder:** body + circle base + drawstring top
- **Foldover envelope:** rectangle folded into thirds with closure
- **Panel construction:** body + base + sides + top, sewn in sequence
- **Drawstring tube:** rectangle into tube + casing + drawstring

## Critical techniques

- `interfacing-fusible` (every structured bag uses interfacing)
- `box-corner` (every bag with a flat base)
- `attaching-binding` (raw seams inside lined bags)
- `topstitching` (visible bag finishing)
- `casing-drawstring` (drawstring bags)
- `zipper-foot` (zip-top bags)

`criticalTechniques[]` typically includes:

- `sewing-machine-basics`
- `straight-stitch-basic`
- `topstitching`
- `box-corner` (where applicable)
- `interfacing-fusible`

## Materials master list

Fabrics:

- **Outer (medium-heavy wovens):** `cotton-canvas-medium`,
  `cotton-canvas-heavy`, `cotton-drill`, `cotton-duck`, `denim-medium`,
  `denim-heavy`, `waxed-cotton`, `cork-fabric`, `cotton-canvas-laminated`,
  `tweed-medium`.
- **Outer (light-medium decorative):** `cotton-quilting`,
  `cotton-poplin`, `linen-medium`.
- **Lining:** `cotton-quilting`, `cotton-poplin`, `polyester-lining`,
  `nylon-ripstop-light` (water-resistant inner pockets),
  `cotton-batiste`.
- **Specialty:** `mesh-net` (project bag windows), `vinyl-clear`
  (toiletry bag inner panels), `oilcloth` (water-resistant
  exteriors), `recycled-polyester-canvas`.

Notions:

- **Thread:** `thread-polyester-allpurpose`,
  `thread-topstitch-jeans` (visible decorative stitching on canvas
  totes), `thread-polyester-extra-strong` (heavy-use bags).
- **Interfacing:** `interfacing-fusible-light-woven`,
  `interfacing-fusible-medium-woven`,
  `interfacing-fusible-heavy-woven`, `peltex-stiff-interfacing`,
  `bag-stabiliser-foam`, `decovil-leather-look-stabiliser`,
  `volume-fleece-fusible`.
- **Closures:** `zip-handbag-30cm`, `zip-handbag-40cm`,
  `magnetic-clasp-18mm-snap-in`, `magnetic-clasp-14mm`,
  `bag-twist-lock-medium`, `bag-flip-clasp`,
  `velcro-hook-loop-25mm`.
- **Hardware:** `d-ring-25mm`, `d-ring-40mm`, `o-ring-25mm`,
  `swivel-hook-25mm`, `swivel-hook-40mm`, `strap-slider-25mm`,
  `strap-slider-40mm`, `bag-feet-base`, `rivets-double-cap`,
  `eyelet-grommet-10mm`, `eyelet-grommet-14mm`.
- **Strap material:** `cotton-webbing-25mm`, `cotton-webbing-40mm`,
  `polyester-webbing-25mm`, `leather-strap-1cm`, `chain-strap`.
- **Filling + structure:** `cardboard-base-insert`,
  `plastic-canvas-mesh`, `bag-base-leather`.
- **Drawstring:** `cotton-cord-3mm`, `cotton-cord-5mm`,
  `cord-stopper-toggle`.

## Input contract

- `title`, `slug`, `type` (`PATTERN` or `TECHNIQUE`).
- `subCategorySlug`: `bags`.
- `garmentCategory`: `BAGS`.
- `garmentType`: "tote", "backpack", "drawstring bag", "makeup
  pouch", "envelope clutch", "knitting project bag", etc.
- `skillLevel`.
- `closureType`: `none` (open tote) / `drawstring` / `zip` /
  `magnetic-clasp` / `flap-magnetic` / `flap-twist-lock`.
- `interfacingWeight`: `none` / `light-fusible` / `medium-fusible` /
  `heavy-fusible` / `foam-stabiliser` / `peltex`.
- `liningType`: `unlined` / `simple-lining` / `lined-with-pockets`.
- `finishedDimensionsCm`: { widthCm, heightCm, depthCm }
- `hasHardware`: boolean.

## Output contract

```json
{
  "sewing": {
    "craftType": "sewing",
    "garmentCategory": "BAGS",
    "garmentType": "lined zip-top tote with internal pockets",
    "skillLevel": "INTERMEDIATE",
    "closureType": "zip",
    "interfacingWeight": "medium-fusible",
    "liningType": "lined-with-pockets",
    "fabricCategory": "woven",
    "finishedDimensionsCm": { "widthCm": 38, "heightCm": 32, "depthCm": 12 },
    "sewingMethod": "machine",
    "hasHardware": true,
    "freesewingDesign": null
  }
}
```

## Body shape

### PATTERN

1. **Opening paragraph.** Name the bag. Name the construction
   (lined zip-top tote with internal pockets, drawstring rucksack
   with rolled top, foldover envelope clutch). Name the fabric
   weight + interfacing weight.

2. **Sizing** (H2). Finished dimensions: width × height × depth in
   cm. Strap drop length where applicable (handles at 25 cm drop
   for hand-carried, 45 cm for shoulder, 60 cm for crossbody on an
   average adult). For backpacks, adjustable strap range.

3. **Downloading the pattern** (H2). All four calibration paths.
   Many bags are buildable from absolute dimensions; the printed
   pattern is small.

4. **What you need** (`suppliesCard`). Fabric (outer + lining +
   interfacing; pocket fabric if separate). Notions. Hardware.
   Machine + feet (zipper foot, walking foot for thick layers,
   leather needle if leather straps).

5. **Cutting + preparation** (H2). Pre-washing the fabric where it
   tolerates it (canvas + cotton + denim yes; waxed cotton + cork
   + laminated cotton no). Cutting interfacing + outer pieces to
   match. Fuse interfacing before construction begins.

6. **Construction** (H2). Numbered `orderedList`. Seam allowance up
   front (1 cm common for bags; 1.5 cm for heavier construction).

   Typical order for a lined zip-top tote with internal pockets:
   - Fuse interfacing to outer body + base pieces
   - Sew outer body side seams; press
   - Box outer base corners (or attach separate base piece)
   - Construct internal pockets: hem top edge; topstitch to lining
     body
   - Sew lining body side seams (leave a 10 cm gap in one seam for
     turning later); box base corners
   - Construct + attach handles: cut webbing to length; topstitch
     between two layers of outer fabric for fabric handles; rivet
     in place for webbing-only handles
   - Attach zip: pin zip between outer top edge + lining top edge;
     sew through all layers; repeat for the other side
   - Sew outer to lining (right sides together) around the top edge,
     catching the zip in the seam
   - Turn the whole bag through the lining gap
   - Hand-stitch the lining gap closed (or topstitch closed by
     machine for a less precious finish)
   - Topstitch around the top edge of the bag to reinforce the zip
     attachment

   Typical order for a drawstring backpack:
   - Construct outer body: sew side seams + base seam
   - Construct casing for drawstring at the top: fold + press +
     topstitch leaving openings at the side seams for the cord
   - Construct straps: sew long edges of strap pieces; turn;
     topstitch
   - Attach straps: at the top edge near the side seam casing; at
     the base corner inside the bag (or with d-ring + clip for an
     adjustable strap)
   - Thread drawstring through casing; attach toggle stopper if
     used
   - Lining (optional): construct lining body; insert; topstitch
     around the top inside the casing

7. **Finishing** (H2). Topstitch around the top edge for
   reinforcement. Set bag feet (rivets at base corners for a tote
   that will be set down on a surface). For magnetic clasps, install
   following the clasp's instructions (the prongs press through
   reinforced patches of interfacing then bend flat behind a backing
   patch). Set rivets last (the bag must be assembled first because
   rivets are permanent).

8. **Variations** (H2). Two or three. Fabric weight (light cotton
   for an everyday tote, heavy canvas for a market shopper), strap
   variation (webbing versus fabric versus leather), pocket variation
   (with / without zip pocket, with / without phone slip).

9. **Care** (H2). For canvas + cotton bags, machine wash cool on a
   delicates cycle (remove hardware first if possible); line dry.
   For waxed cotton + cork + leather, spot-clean only and re-wax
   waxed cotton periodically.

10. **Troubleshooter** (`troubleshooter` block). Three to six rows.
    Bag base sags (interfacing too light; switch to heavy fusible or
    add a foam stabiliser layer), zip puckers (zip not basted before
    sewing; baste then sew), straps stretch out under weight
    (interfacing missed inside straps; or insufficient stitching
    where strap meets bag; reinforce with a stitched X-in-square
    pattern), corners look pointy not soft (boxed corner trimmed
    too close; leave a generous 1 cm at the corner point inside the
    box).

### TECHNIQUE

For technique tutorials (boxing a corner, installing a magnetic
clasp, sewing a zip into a lined bag). Same shape as tops TECHNIQUE.

## Length guidance

| Entry type | Word count |
|---|---|
| TECHNIQUE | 600 to 1,200 |
| PATTERN simple (drawstring bag, simple tote) | 1,500 to 2,200 |
| PATTERN intermediate (lined zip-top tote, pouch with zip, foldover clutch) | 2,200 to 3,500 |
| PATTERN advanced (panel backpack, complex multi-pocket bag) | 3,500 to 5,000 |

## Self-critique pass

Same checklist as the tops prompt. Add:

17. Interfacing weight is named explicitly. Bag construction lives
    on interfacing choice.
18. Hardware is named with the dimension that matters (a 25 mm
    d-ring takes a 25 mm webbing; a 14 mm magnetic clasp suits a
    small clutch, an 18 mm clasp suits a tote).
19. Strap drop length is given for the intended use (hand-carry,
    shoulder, crossbody).

## Sources

freesewing covers limited bag designs (Hortensia); most bag patterns
are in-house. In-house patterns ship `PROPRIETARY_HOMEMADE`. Public-
domain bag traditions (Mary Poppins-style carpetbag, French market
basket bag, granny squares-into-tote) inform house designs without
copying any modern published pattern.

## Image policy

NEVER generate images.

## See also

- [sewing-author.md](sewing-author.md).
- [sewing-accessories-author.md](sewing-accessories-author.md) for
  pouches under 15 cm.
- [sewing-home-author.md](sewing-home-author.md) for laundry hampers
  + storage baskets.
