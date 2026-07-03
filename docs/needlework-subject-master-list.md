# Needlework SUBJECT master list (the "big list")

The canonical list of **what** the needlework (surface embroidery / thread-painting)
collection should contain — the full repo of subjects, so we can build the biggest,
best needlework catalogue in the world and work through it methodically.

- **This file = WHAT.** The breadth of subjects and complexity range.
- **The engine = HOW.** `apps/web/src/lib/needlework/NEEDLEWORK_ENGINE.md` governs the
  exact pipeline (Flux illustration → directional long-and-short stitch field → loom
  renderHero → ruthless vision gate). A worker reads THAT first.
- **The look bar** lives in owner memory `project_needlework_signoff` — dimensional
  thread-painting, 8–12 stitch types per piece, dense botanical/scene compositions.

Built 2026-06-30. Living document — add subjects as gaps are found; never delete a
theme customers expect. Complexity range is MANDATORY: every theme group must span
simple small motifs ↔ mid ↔ rich ↔ huge showpiece (100+ DMC). See memory
`feedback_pattern_complexity_range`.

---

## THE SYSTEM — the exact steps every worker follows (DO NOT SKIP)

The HOW lives in `apps/web/src/lib/needlework/NEEDLEWORK_ENGINE.md` (the three engine
modes, levers, framing rules, ruthless gate, hard rules, how to run). This is the
operating procedure. Read it. Following it exactly is what stops the regressions.

**The loop, per theme:**

1. **Brief.** Pick subjects from this list. Vary SIZE × COMPLEXITY × ENGINE MODE per
   the complexity tags below. Match engine mode to subject type (see Mode legend).
   Subjects tagged `[D]` = dense mode (cut-out animal/floral/portrait on linen).
   Subjects tagged `[L]` = line mode (delicate motifs, bare-linen negative space).
   Subjects tagged `[B]` = bleed mode (full-scene edge-to-edge, no background cut).
2. **Generate.** Run `needlework-paint.ts <slug> [--none]` from the MAIN checkout
   (needs Blender + FAL_KEY). Flux output cached per slug. `--none` = frameless.
3. **GATE — ruthlessly, as a customer.** Look at every FINISHED render. Apply
   `GATE_CHECKLIST.md` (complete / crisp / best-seller-bar / colour / original). Repair
   fixable fails (re-roll Flux, bump `detail`, flip `tameWarm`). Cull the rest.
   Expect a LOW pass rate. Publish only all-YES gems. Vary the SET across complexity.
4. **Approve + publish.** Only gems through `--publish`. Update Status in this table.
5. **Do not start volume** in a new theme until the gated batch is done and reviewed.

**Needlework-specific lever rules (from proven renders):**
- `detail: true` — REQUIRED for faces + detailed dense scenes (mushy without it).
- `tameWarm: true` — REQUIRED for reds/pinks/orange skin (prevents orange blow-out).
  For orange/warm subjects (fox, autumn leaves) keep `tameWarm: false`.
- Frameless (`--none`) for non-circular subjects (wide landscapes, scenes, portraits
  with a rectangular feel). Round hoop for circular/contained single subjects.

**IP guardrail:** Homemade-original only. For faces and art icons: PUBLIC-DOMAIN
figures / artworks only (pre-~1930, per the vetted licence list in
`project_needlework_signoff`). No living celebrities, no named estates, no
brand/franchise/character IP. Generic "1960s glamour" or "Art Nouveau beauty" = safe.
Named "Audrey Hepburn" = NOT safe. Never copy a competitor's specific design.

**Reserved SPECIALIST themes** — do NOT run these as generic generation (need their
own dedicated sessions; listed in Specialist Appendix): word art / affirmations,
maps with landmarks, typography/samplers.

---

## Complexity & size tags

Each subject carries `[mode·complexity]` inline:

**Engine mode:** `D` dense · `L` line · `B` bleed

**Complexity / DMC range:**
- `s` — simple: small single motif, ~10–25 DMC, a few shapes, beginner-friendly.
- `m` — mid: a fuller composition, ~25–60 DMC, medium hoop (5–8″).
- `r` — rich: detailed, ~60–100 DMC, large hoop (8–10″), experienced maker.
- `XL` — showpiece: dense, layered, 100+ DMC, large or very large, advanced.

A theme must contain subjects across **all four tiers**. Never all one level.

---

## PROGRESS TABLE

| #   | Theme                                  | Mode(s)     | Frame       | Status  |
|-----|----------------------------------------|-------------|-------------|---------|
| 1   | Cute animals & pets                    | D           | hoop/none   | started |
| 2   | Dog breed portraits (realistic)        | D           | hoop/none   | started |
| 3   | Cat breed portraits (realistic)        | D           | hoop/none   | started |
| 4   | Woodland & wildlife                    | D / B       | hoop/none   | started |
| 5   | Farm animals & smallholding            | D / B       | hoop        | started |
| 6   | Garden & exotic birds                  | D           | hoop/none   | started |
| 7   | Bees, butterflies & moths              | D / L       | hoop        | started |
| 8   | Sea life & coastal                     | D / B       | hoop/none   | started |
| 9   | Cute fantasy creatures                 | D           | hoop        | started |
| 10  | Florals & bouquets                     | D / L       | hoop/none   | started |
| 11  | Single botanical stems                 | L           | hoop/none   | started |
| 12  | Delicate line motifs (jars/sprigs)     | L           | hoop/none   | started |
| 13  | Wreaths & circular compositions        | D / L       | hoop        | started |
| 14  | Houseplants & terrariums               | D / L       | hoop/none   | started |
| 15  | Mushrooms & cottagecore                | D / B       | hoop        | started |
| 16  | Food, drink & baking                   | D / L       | hoop        | started |
| 17  | Seasonal — Halloween                   | D / B       | hoop        | started |
| 18  | Seasonal — Christmas & winter          | D / B       | hoop/none   | started |
| 19  | Seasonal — Easter & spring             | D / L       | hoop        | started |
| 20  | Seasonal — Autumn / harvest            | D / B       | hoop/none   | started |
| 21  | Seasonal — Valentine's                 | D / L       | hoop        | started |
| 22  | Celestial & constellations             | D / L       | hoop        | started |
| 23  | Witchy & gothic                        | D / L       | hoop/none   | started |
| 24  | Fairies & fantasy                      | D / B       | hoop        | started |
| 25  | Cottages, shops & cosy scenes          | B           | none        | started |
| 26  | Landscapes & seascapes                 | B           | none        | started |
| 27  | Animals doing human things             | B           | none        | started |
| 28  | Fabulous / artistic faces              | D           | hoop/none   | started |
| 29  | Pop-art & fashion portraits (PD/orig)  | D           | none        | started |
| 30  | Nursery & baby                         | D / L       | hoop        | started |
| 31  | Heritage PD reinterpretations          | D / L       | hoop        | started |
| S1  | Word art / affirmations                | SPEC:word   | none        | deferred |
| S2  | Maps with landmarks                    | SPEC:map    | none        | deferred |
| S3  | Alphabet & stitch samplers             | SPEC:sampler| hoop/none   | deferred |

"started" = at least one gem published into the gated catalogue (category still
hidden; not yet exhausted). See the Batch log for the exact subjects.

---

## Batch log

**Batch 1 — 2026-06-30** (first gated catalogue batch; category stays hidden).
15 gems published PUBLIC (gated shop-window / free-login pattern + Studio), spanning
the full range simple → XL and all three engine modes. Driver: `needlework-paint.ts`.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| peony | Peony Bloom | 10 Florals | D·XL (103 col) | hoop |
| peacock | Peacock in Full Display | 6 Birds | D·XL | hoop |
| facecrown | Flower Crown | 28 Fabulous faces | D·r | frameless |
| cottage | Thatched Cottage Garden | 25 Cosy scenes | B·r | frameless |
| dogwine | Rosé Dachshund | 27 Animals doing human things | B·r | frameless |
| fox | Red Fox | 4 Woodland | D·r | frameless |
| kingfisher | Kingfisher | 4 Woodland / 6 Birds | D·r | frameless |
| cat | Sleeping Cat | 1 Cute animals | D·m | frameless |
| hare | Brown Hare | 4 Woodland | D·m | hoop |
| robin | Robin & Berries | 4 Woodland / 6 Birds | D·m | hoop |
| bee | Bumblebee & Lavender | 7 Bees & butterflies | D·m | hoop |
| mushroomscene | Toadstool Glade | 15 Mushrooms & cottagecore | D·r | frameless |
| bluetit | Blue Tit | 6 Birds | D·s | hoop |
| jar | Wildflower Jar | 12 Line motifs / 10 Florals | L·m | frameless |
| sprig | Lavender Sprig | 11 Botanical stems / 12 Line motifs | L·s | hoop |

Line-mode note (owner steer 2026-06-30): the delicate line look is wanted — a loose,
artistic, "not-finished-but-pretty" jar/sprig is a keeper, NOT a cull. The earlier mistake
was (a) gating line pieces against the dense naturalistic bar, and (b) leaving the cheap
rectangular frame on `jar` — non-circular subjects must render FRAMELESS (`--none`), which
fixed it. Nothing culled this batch.

**Batch 2 — 2026-07-01** (new themes across the range; rendered ONE render at a time to
avoid overloading the machine). 10 gems published PUBLIC (incl. hollywreath, recovered by the engine fix below); 12 generated, 2 culled.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| highlandcow | Highland Cow | 5 Farm animals | D·XL | hoop |
| goldenretriever | Golden Retriever | 2 Dog breeds | D·r | hoop |
| whale | Humpback Whale | 8 Sea life | B·r | frameless |
| lighthouse | Cliffside Lighthouse | 26 Landscapes | B·r | frameless |
| dragon | Baby Dragon | 9 Cute fantasy | D·r | hoop |
| pumpkins | Autumn Pumpkins | 20 Autumn/harvest | D·m | hoop |
| seaturtle | Sea Turtle | 8 Sea life | D·m | hoop |
| cupcake | Frosted Cupcake | 16 Food & baking | D·s | hoop |
| fernstem | Fern Frond | 11 Botanical stems | L·s | hoop |
| hollywreath | Holly Wreath | 18 Christmas / 13 Wreaths | D·r | hoop |

Repaired before passing: `goldenretriever` re-rendered with `tameWarm:true` (fur had blown
red/orange — golden fur needs tameWarm on, unlike the fox).

**ENGINE FIX LANDED (2026-07-01, commit `137d7df0`): enclosed / walled-off background removal.**
The engine flood-filled the plain ground inward from the edges only, so an ENCLOSED background
(a wreath's centre) or a field the subject seals off by touching the frame stitched as a solid
block. Fixed in `bitmapToStitches`: (a) ground colour = MEDIAN of the border pixels (resists the
subject touching a corner/edge — a corner leaf used to make the "ground" green); (b) background =
ground-coloured connected components that touch the edge OR form a large enclosed pocket
(>= 1% of the image), keeping small enclosed blobs (eye glints) as subject. **This UNLOCKS
wreaths/rings — `hollywreath` was recovered as a gem** (clean open linen centre), now published.

BOTH held culls LATER RESCUED (2026-07-01, repair-first): `fairymushroom` re-rolled with a COLOURED
twilight sky + rendered as `bleed` + frameless → a lush magical scene, no white ground (a fairy/
woodland SCENE must be bleed, never dense cut-out). `monstera` re-rolled as a single COMPACT potted
plant with a clear margin → outer ground removes clean; minor white remains in the split-leaf gaps
(inherent to a fenestrated plant) but it reads as a proper potted monstera and is kept. Both PUBLIC.
Standing rule: wreaths/rings + subjects on a removable ground render clean via dense; full SCENES go
through bleed + frameless; fine-internal-gap plants are the one soft spot (solid-leaf houseplants are
cleaner than fenestrated ones if a spotless result is needed).

**Batch 3 — 2026-07-01** (new themes; rendered ONE at a time). **11 gems published PUBLIC, 0 culled**
(11 generated). **37 PUBLIC needlework patterns total.**

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| ragdoll | Ragdoll Cat | 3 Cat breeds | D·r | hoop |
| owl | Barn Owl | 4 Woodland | D·r | hoop |
| springbunny | Spring Bunny | 19 Easter/spring | D·r | hoop |
| butterfly | Monarch Butterfly | 7 Butterflies | D·m | hoop |
| hedgehog | Autumn Hedgehog | 1 Cute animals | D·m | hoop |
| halloweencat | Halloween Cat | 17 Halloween | D·m | hoop |
| mountainlake | Mountain Lake | 26 Landscapes | B·r | frameless |
| moon | Crescent Moon & Stars | 22 Celestial | B·m | frameless |
| ladybird | Ladybird | 7 Butterflies (simple) | D·s | hoop |
| strawberries | Strawberries | 16 Food & baking | D·r | hoop |
| singletulip | Single Tulip | 11 Botanical stems | D·s | hoop |

REPAIRS that passed (repair-first, don't cull hastily): `moon` re-rendered FRAMELESS (a bleed scene
must not sit in a round hoop). `strawberries` FIRST failed (fruit scattered edge-to-edge on white →
ground not removable → white block); re-rolled as a COMPACT centred cluster with a clear margin →
clean cut-out on linen. `singletulip` FIRST failed in line mode (wispy flower head); switched to
DENSE mode + a fuller tulip → solid filled bloom. LESSON: a "white-ground" or "wispy-line" fail is
usually a COMPOSITION/MODE problem — re-roll tighter + on a removable ground, or switch line→dense,
before ever culling.
LEARNING: celestial/night-sky works via `bleed` + frameless; route all full SCENES that way.

**Batch 4 — 2026-07-01** (new themes + earlier rescues; rendered ONE at a time). **11 gems published
PUBLIC, 0 culled** (11 generated). Plus the 2 held culls (`monstera`, `fairymushroom`) rescued in the
same task. **50 PUBLIC needlework patterns total.**

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| cockapoo | Cockapoo | 3 Dog breeds | D·r | hoop |
| redsquirrel | Red Squirrel | 4 Woodland | D·m | hoop |
| peoniesbouquet | Peony Bouquet | 10 Floral showpiece | D·r | hoop |
| seahorse | Seahorse | 8 Sea life | D·m | hoop |
| valentineheart | Rose Heart | 21 Valentine's | D·m | hoop |
| hummingbird | Hummingbird | 5 Birds | D·m | hoop |
| cherryblossom | Cherry Blossom | 10 Floral | D·m | hoop |
| witchymoon | Cat & Moon | 23 Witchy/gothic | B·m | frameless |
| lavenderfield | Lavender Field | 26 Landscapes | B·m | frameless |
| babyelephant | Baby Elephant | 1 Cute animals (nursery) | D·m | hoop |
| snowdrop | Snowdrop | 11 Botanical stems | D·m | hoop |

REPAIRS that passed (repair-first): `babyelephant` FIRST published 0 colours — the cached Flux image
had come back **fully black** (a transient generation failure); the black cache silently re-used on
re-run. Deleted the `.flux.png` cache to force regen + re-rolled the body to saturated periwinkle-blue
with bold dark outlines (so it can't be flood-filled as ground) → 96-colour charming nursery gem.
`snowdrop` FIRST failed in line mode (wispy nodding head lost on white); switched to DENSE + explicit
green-tipped markings and shadowed side so the white reads → clean 39-colour bell. LESSON: when a
render is EMPTY (0 stitches/0 colours), check the cached `.flux.png` first — a black/blank Flux result
caches and silently repeats until deleted.

**Batch 5 — 2026-07-01** (closes the last 3 `todo` themes 29/30/31 + range spread; rendered ONE at a
time). **11 gems published PUBLIC, 0 culled** (11 generated — every fail repaired to a pass). **61
PUBLIC needlework patterns total.** Contact sheet: media.homemade.education/scratch-review/de5489f5-a7cf-4f79-853a-98e4563ca379.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| toadstoolsingle | Red Toadstool | 15 Mushrooms | D·s | hoop |
| eucalyptussprig | Eucalyptus Sprig | 11 Botanical stems | D·m | hoop |
| dandelionclock | Dandelion Clock | 11 Botanical stems | D·m | hoop |
| teddybear | Teddy Bear | 30 Nursery & baby | D·m | hoop |
| dragonfly | Dragonfly | 7 Bees/butterflies | D·m | hoop |
| artnouveauiris | Art Nouveau Iris | 31 Heritage reinterp | D·m | hoop |
| puffin | Puffin on the Cliffs | 8 Sea life & coastal | B·r | frameless |
| popartlady | Pop-Art Lady | 29 Pop-art & fashion | B·r | frameless |
| macaw | Scarlet Macaw | 6 Exotic birds (showpiece) | D·r | hoop |
| stag | Red Deer Stag | 4 Woodland (showpiece) | D·r | hoop |
| hydrangea | Hydrangea Bloom | 10 Floral (showpiece) | D·r | hoop |

REPAIRS that passed (repair-first — 0 culls despite several first-attempt fails):
- **Line-mode botanicals scrawl** (again): `eucalyptussprig` + `dandelionclock` first rendered in `line`
  mode came out as confetti-coloured stems / muddy ghost leaves. Switched BOTH to `dense` + clearer
  prompts → clean sprig / fluffy seed-head. Confirms the standing rule: wispy single botanicals want
  DENSE, not line (line is only safe for a bold single filled shape like `fernstem`).
- **Stubborn warm centre:** `dandelionclock` kept painting a red/orange gerbera-like ring in the middle
  even after "no red, no orange" prompts (Flux conflates dandelion-clock with the yellow flower). Fixed
  at RENDER time with `tameWarm: true` (no flux regen needed) — it muted the warm ring to a natural
  brown receptacle. NEW LEVER USE: `tameWarm` also rescues an unwanted warm colour cast, not just
  reds-blowing-orange.
- **White subject eaten by pale ground:** `puffin` (large pure-white belly ≈#f5f5f5) fell within the
  background-removal threshold of the cream linen → a hollow gap through its torso. Re-routed to a
  coastal `bleed` SCENE (grassy clifftop + sea thrift + sea) → coloured ground, nothing removed, solid
  belly, and a richer piece (289 colours). Rule: a large white/pale subject on cream → make it a bleed
  scene (or shade the white), never a dense cut-out.
- **White-square block** (fairymushroom class): `hydrangea` first filled the frame with white ground +
  corner florets ringing the border → the white read as enclosed, un-removable, and stitched as a solid
  white SQUARE inside the hoop. Re-rolled as ONE compact centred mophead with a generous clear margin
  (nothing touching edges) → ground removes clean, tidy cut-out. Same "compact centred cluster + clear
  margin" fix as `strawberries`. LESSON: for a clean hoop cut-out the subject must NOT touch the frame
  edges — override the shared PLAIN "filling the frame" suffix with an explicit margin instruction.
- `popartlady` (bold flat pop-art) + `macaw`/`stag` (dense showpieces) passed first time. `tameWarm: true`
  kept the scarlet macaw TRUE red (not orange); `stag` left `tameWarm` OFF to keep the autumn-bracken warmth.

**Batch 6 — 2026-07-01** (full range across new themes; rendered ONE at a time). **11 gems published
PUBLIC, 0 culled** (every fail repaired to a pass). **72 PUBLIC needlework patterns total.** Contact
sheet: media.homemade.education/scratch-review/bafb7e15-2c34-40c3-b648-f6853b662374.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| guineapig | Guinea Pig | 1 Cute animals | D·s (98c) | hoop |
| labrador | Golden Labrador | 2 Dog breeds | D·m (110c) | hoop |
| mainecoon | Maine Coon | 3 Cat breeds | D·r (141c) | hoop |
| rooster | Rooster | 5 Farm animals | D·r (229c) | hoop |
| goldfinch | Goldfinch on a Thistle | 6 Garden birds | D·r (186c) | hoop |
| lunamoth | Emperor Moth | 7 Bees/butterflies/moths | D·r (139c) | hoop |
| narwhal | Narwhal | 8 Sea life | D·m (69c) | hoop |
| phoenix | Phoenix | 9 Cute fantasy | D·m (126c) | hoop |
| sunflower | Sunflower | 10 Florals | D·s (48c) | hoop |
| cottagegardenmix | Cottage Garden Bouquet | 10 Floral showpiece | D·XL (362c) | hoop |
| englishroseswreath | English Roses Wreath | 13 Wreaths showpiece | D·XL (172c) | hoop |

REPAIRS that passed (repair-first — 0 culls despite several first-attempt fails):
- **Source-baked red markings (not a render blow-out):** `mainecoon` first rendered with bright scarlet
  war-paint streaks on the face. `tameWarm: true` did NOT fix it — the red was IN the Flux illustration,
  not a render-time warm blow-out, so the render lever can't remove it. Deleting the flux + re-rolling
  with an explicit "natural brown/black tabby, absolutely no red markings, no face paint" prompt gave a
  clean natural Maine Coon. LESSON: if a warm/odd colour survives `tameWarm`, it's in the source image →
  delete the flux + re-roll the prompt; `tameWarm` only tames a render-grade warm shift.
- **Bad Flux composite:** `narwhal` first rendered as a lumpy amorphous body with TWO horns + a stray red
  rose on the cheek. Deleted flux + re-rolled with a "single spiralled tusk, clean side profile, torpedo
  body, no extra horns, no flowers" prompt → a cute coherent narwhal.
- **Warm-streaked sunflower:** `sunflower` first came out coral-flushed with a green centre; a re-roll gave
  a well-SHAPED sunflower but with red-streaked petals (`tameWarm` didn't mute them — the streaks read as a
  real "Ring of Fire" ornamental variety). Kept as an ornamental sunflower (clean, complete, recognisable).
- **Naming accuracy:** the "Luna Moth" render came out with four eyespots + short tails = an EMPEROR moth,
  not a luna (luna = pale green, long twisted tails). Renamed the row to "Emperor Moth" (slug stays
  `lunamoth`). LESSON: gate for subject ACCURACY, not just cleanliness — rename to what actually rendered.

**Batch 7 — 2026-07-02** (full range across new themes; rendered ONE at a time, hooped groups separate from
the frameless scene). **9 gems published PUBLIC, 1 culled** (10 subjects). **81 PUBLIC needlework patterns
total.** Contact sheet: media.homemade.education/scratch-review/2193a375-0207-4642-ac6b-4062dce54e77.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| hamster | Hamster | 1 Cute animals | D·s (143c) | hoop |
| chick | Baby Chick | 5 Farm animals | D·s (69c) | hoop |
| frenchbulldog | French Bulldog | 2 Dog breeds | D·m (93c) | hoop |
| swallowtail | Swallowtail Butterfly | 7 Bees/butterflies/moths | D·m (194c) | hoop |
| sweetpeas | Sweet Peas | 10 Florals | D·m (227c) | hoop |
| pheasant | Pheasant | 6 Garden birds | D·r (202c) | hoop |
| dahliabouquet | Dahlia Bouquet | 10 Floral showpiece | D·XL (223c) | hoop |
| autumnforest | Autumn Forest | 20 Autumn/harvest | B·XL (220c) | frameless |
| otter | River Otter | 4 Woodland | D·m (88c) | hoop |

REPAIRS + CULL:
- **chick** first blew coral/orange on the body (soft-yellow intended); `tameWarm:true` re-run (no flux delete)
  pulled it back to true butter-yellow → gem. Confirms the standing rule: an unwanted warm CAST is a render-grade
  fix (tameWarm), not a re-roll.
- **otter** first had stray magenta/purple streaks down the chest + tail (spurious dark-shadow colour, NOT a warm
  cast so tameWarm couldn't touch it). Deleted flux + re-rolled with "natural brown and cream only, no purple/
  magenta/pink shadows" → clean chestnut-and-cream otter, gem.
- **siamese CULLED** (only cull). Two attempts: the seal-point face + blue eyes came good, but the inner ears kept
  painting vivid source-baked ORANGE that survived BOTH a "no orange" flux re-roll AND `tameWarm:true` (Flux
  insists on warm ears for this subject), plus loose white threads dangled below the chin. Held to the bar rather
  than publish a flawed cat — cat breeds already covered by ragdoll + mainecoon. LESSON reaffirmed: if a warm
  colour is baked into the flux AND resists a targeted re-roll, it's a hard subject; cull rather than drift.

**Batch 8 — 2026-07-02** (full range across new themes; rendered ONE at a time, hooped groups separate from the
frameless scenes). **10 gems published PUBLIC, 0 culled** (10 subjects — both first-attempt fails repaired to a
pass). **91 PUBLIC needlework patterns total.** Contact sheet:
media.homemade.education/scratch-review/21825b59-8cbb-4448-85be-609b6544b442.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| wren | Wren | 6 Garden birds | D·s (97c) | hoop |
| penguin | Penguin in a Scarf | 18 Christmas & winter | D·s (106c) | hoop |
| beagle | Beagle | 2 Dog breeds | D·m (98c) | hoop |
| octopus | Octopus | 8 Sea life | D·m (68c) | hoop |
| alpaca | Alpaca | 5 Farm animals | D·m (58c) | hoop |
| foxglove | Foxglove | 11 Botanical stems | D·m (140c) | hoop |
| wisteria | Wisteria | 10 Florals | D·r (170c) | hoop |
| autumnwreath | Autumn Harvest Wreath | 13 Wreaths showpiece | D·XL (182c) | hoop |
| bluebellwood | Bluebell Wood | 26 Landscapes | B·r (258c) | frameless |
| oceanreef | Coral Reef | 8 Sea life showpiece | B·XL (362c) | frameless |

REPAIRS that passed (repair-first — 0 culls):
- **beagle** first rendered with a stray red/pink SMEAR under the nose/muzzle. `tameWarm:true` was already on and did
  NOT remove it → the red was baked into the flux, not a render-grade warm shift. Deleted the flux + re-rolled with
  "plain black nose, clean white/tan muzzle, absolutely no red or pink around the mouth or lips, closed mouth" →
  clean tricolour portrait. Confirms the standing rule: a warm colour that survives `tameWarm` is source-baked →
  delete flux + re-roll, don't rely on the render lever.
- **foxglove** first blew the pink bells to a garish CORAL-RED (I left `tameWarm` off; the AgX+1.5× grade pushed the
  magenta-pink warm). Cheap render-grade fix: added `tameWarm:true` and re-rendered off the SAME cached flux (no
  delete) → true pink bells with natural speckled throats. Confirms `tameWarm` rescues a pink-blowing-red cast, not
  just reds. Pink/magenta botanicals should carry `tameWarm:true` from the start.
- Note: `wren` rendered with a warmer rufous-orange crown than a classic brown wren but reads as a coherent, clean,
  complete little garden bird — kept as a gem (a warm-toned wren is plausible; not worth a re-roll).

**Batch 9 — 2026-07-02** (full range across new themes; rendered ONE at a time, hooped groups separate from the
frameless scene). **9 gems published PUBLIC, 1 culled** (10 subjects). **100 PUBLIC needlework patterns total.**
Contact sheet: media.homemade.education/scratch-review/0b68da73-709e-41d9-85b3-7bdb042f50ce.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| corgi | Corgi | 2 Dog breeds | D·m (145c) | hoop |
| bengal | Bengal Cat | 3 Cat breeds | D·r (155c) | hoop |
| badger | Badger | 4 Woodland | D·s (86c) | hoop |
| piglet | Piglet | 5 Farm animals | D·s (69c) | hoop |
| koifish | Koi Fish | 8 Sea life | D·m (142c) | hoop |
| nutcracker | Nutcracker | 18 Christmas & winter | D·m (207c) | hoop |
| macarons | Macaron Stack | 16 Food & baking | D·m (88c) | hoop |
| botanicalheart | Botanical Heart | 21 Valentine's showpiece | D·XL (243c) | hoop |
| highlandglen | Highland Glen | 26 Landscapes | B·XL (105c) | frameless |

REPAIRS + CULL:
- **koifish** first rendered a lovely koi but its "green lily pad" rendered as a garish flat neon-green ring/blob beside
  the fish. Deleted flux + re-rolled with "side profile, no lily pad, no water plants" → a clean flowing koi, gem.
- **macarons** first came out stringy/loose (shells read as tangled thread, not crisp discs). Re-rolled with a bolder,
  cleaner, simpler prompt ("three smooth round crisp shells, well-defined edges") → a clean recognisable stack, gem.
- **highlandglen** first TWO attempts blew the heather to neon magenta + bracken to acid orange. `tameWarm:true` did NOT
  fix it (the render came back identical) → the garish colour was BAKED INTO THE FLUX, not a render-grade warm shift.
  Deleted flux + re-rolled with a strongly MUTED/desaturated palette prompt ("gently muted dusky-purple heather, soft
  golden-brown bracken, not neon, no bright magenta/orange") → a calm naturalistic misty autumn glen with a lone stag,
  gem. Confirms the standing rule: a garish colour that survives `tameWarm` is source-baked → delete flux + re-roll.
- **magnolia CULLED** (only cull). Two attempts (original, then "compact solid petals, no wispy/frayed threads"): both
  frayed the magnolia's long floppy petals into stringy loose threads with an unstitched white mass between the blooms.
  Magnolia petals are inherently wisp-prone in this engine; florals already richly covered (peony/hydrangea/wisteria/
  sweetpeas/cottagegardenmix/dahliabouquet/botanicalheart…), so held to the bar rather than publish frayed petals.

**Batch 10 — 2026-07-02** (full range across new themes; rendered ONE at a time, hooped groups separate from the
frameless scene). **8 gems published PUBLIC, 2 culled** (10 subjects). **108 PUBLIC needlework patterns total.**
Contact sheet: media.homemade.education/scratch-review/d6b1914a-2ce6-462c-8b22-cc00b69dfe8a.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| duckling | Duckling | 5 Farm animals | D·s (82c) | hoop |
| fieldmouse | Field Mouse | 4 Woodland | D·s (127c) | hoop |
| redpoppy | Red Poppy | 10 Florals | D·m (76c) | hoop |
| sealpup | Seal Pup | 8 Sea life | D·m (47c) | hoop |
| springerspaniel | Springer Spaniel | 2 Dog breeds | D·m (85c) | hoop |
| gingerbreadhouse | Gingerbread House | 18 Christmas & winter | D·m (237c) | hoop |
| treeoflife | Tree of Life | 31 Heritage reinterp | D·XL (270c) | hoop |
| halloweenscene | Cosy Halloween Night | 17 Halloween showpiece | B·XL (120c) | frameless |

REPAIRS + CULLS:
- **springerspaniel** first rendered with a hollow unstitched forehead (linen gap between the ears) + a garish red smear on
  the nose bridge. Two repairs: (1) delete flux + re-roll with "full domed forehead connecting the ears, plain dark nose, no
  red on the muzzle" fixed the head but a small red nose-smear remained; (2) a second flux re-roll with a hyper-explicit
  "completely plain brown-black nose leather, no red/orange/pink on or above the nose" cleared it → clean coherent spaniel, gem.
  Confirms: a hollow-head fail is a flux composition problem (re-roll), and a source-baked red nose needs an explicit nose
  constraint, not `tameWarm` (which was on throughout and never touched it).
- **bullfinch CULLED**. Two attempts (original, then "rosy salmon-pink breast, no orange, no teal, no blue"): Flux insists on
  giving a black-hooded bird with an ORANGE breast patch + BLUE wings — a robin/chaffinch chimera, NOT a true bullfinch (rosy-pink
  breast, grey back). Lovely stitching but mislabelled and not cleanly any other nameable British garden bird; birds already richly
  covered (robin/bluetit/kingfisher/goldfinch/wren/pheasant/hummingbird). Held to the accuracy bar rather than publish a mis-named bird.
- **britishshorthair CULLED**. Two attempts: both baked heavy TEAL-GREEN shading into the grey fur + NEON-ORANGE inner ears + a
  red nose that survived the explicit "no teal, no orange, pink ears, grey nose" prompt AND `tameWarm:true` (the 2nd attempt was
  worse on teal). Same source-baked-warm-resists-re-roll pattern as the culled siamese; cat breeds already covered (ragdoll/mainecoon/
  bengal). Hard subject → cull rather than drift.

**Batch 11 (2026-07-02)** — 9 gems PUBLIC, 1 culled (10 subjects; 4 first-attempt fails, 3 repaired to a pass). **117 PUBLIC total.**
Full range: 2 simple (pug D·s 71c, cactus D·s 108c), 5 mid, 1 rich (irisbloom D·r 221c), 2 XL (springwreath D·XL 370c hooped
wreath; coastalcove B·XL 253c frameless coastal scene). Themes 2/5/6/7/8/9/10/13/14/26. Sheet:
media.homemade.education/scratch-review/fd2fda30-9c2b-49da-9b37-17f243e8bbc1.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| pug | Pug | 2 Dog breeds | D·s (71c) | hoop |
| cactus | Potted Cactus | 14 Houseplants | D·s (108c) | hoop |
| dolphin | Bottlenose Dolphin | 8 Sea life | D·m (44c) | hoop |
| redadmiral | Painted Lady Butterfly | 7 Bees/butterflies/moths | D·m (141c) | hoop |
| sheep | Sheep | 5 Farm animals | D·m (47c) | hoop |
| unicorn | Unicorn | 9 Cute fantasy | D·m (130c) | hoop |
| irisbloom | Bearded Iris | 10 Florals | D·r (221c) | hoop |
| springwreath | Spring Wreath | 13 Wreaths showpiece | D·XL (370c) | hoop |
| coastalcove | Coastal Cove | 26 Landscapes showpiece | B·XL (253c) | frameless |

REPAIRS + CULL:
- **dolphin** — cream belly/throat blew ORANGE under the AgX grade (dolphins aren't orange). Added `tameWarm:true` + reworded the
  belly to "cool silvery-grey and white (no orange/cream/tan)" + deleted flux → clean silvery belly. Warm-cast fix (the chick/foxglove class).
- **sheep** — first render was a lumpy mis-formed body with spiky straw-like fleece + unwanted yellow neck/leg bands (flux composition
  fail). Delete flux + re-roll "plump, cloud-like soft curly wool (not spiky, no yellow), four legs clearly visible, cute" → charming sheep.
- **unicorn** — first render had a HOLLOW face: the pale lilac/cream coat was eaten by the cream ground (white-eaten class), leaving bare
  linen with only the mane + horn stitched. Delete flux + re-roll a SATURATED lavender-purple coat with bold dark outline/shading so it
  can't be flood-filled → full 130c whimsical unicorn. Same fix as puffin/babyelephant (pale subject → saturate or bleed).
- **redadmiral → renamed "Painted Lady Butterfly"**: a clean, lovely butterfly but the pattern rendered is a PAINTED LADY (mottled
  orange-brown, white-spotted dark tips), NOT a red admiral (near-black with one clean scarlet band). Renamed to what actually rendered
  (slug stays `redadmiral`), same accuracy discipline as lunamoth→Emperor Moth. Gem.
- **jay CULLED** (only cull). Two attempts: the feet scribble/red-tangle was fixed on re-roll (clean bare twig), but Flux STILL refused a
  true Eurasian jay — both times an orange-breasted blue-and-grey bird (bluebird/robin chimera, not the pinkish-brown jay), and not cleanly
  any other nameable species to rename to. Birds already very richly covered (robin/bluetit/kingfisher/goldfinch/hummingbird/macaw/pheasant/
  wren/peacock). Held to the accuracy bar per the bullfinch precedent → cull rather than publish a mislabelled chimera. NEW rule: "Eurasian
  jay" is a hard Flux subject (it insists on an orange-breasted blue jay); skip or expect a cull.
- Theme 14 (houseplants) newly `started` via cactus. MACHINE: one Blender throughout (checked before every render command; killed one
  orphaned Blender left by a transient `fetch failed` mid-run before restarting). The `upscale@0.5 errored: fetch failed` warning recurred on
  most renders but is NON-FATAL — the engine falls back to upscale@0.35 and the gate still runs/passes.

**Batch 12 (2026-07-03)** — 10 gems PUBLIC, 0 culled (10 subjects; teapot repaired to a pass). **127 PUBLIC total.**
Full range: 3 simple (budgie D·s 149c, starfish D·s 44c, succulent D·s 71c), 3 mid (germanshepherd D·m 84c, teapot D·m 155c,
easterbasket D·m 217c), 2 rich bleed scenes (flowerfairy B·r 313c, catreading B·r 193c), 2 XL (autumnbounty D·XL 191c hooped harvest
still-life; wildflowermeadow B·XL 265c frameless meadow). Themes 2/6/8/10/14/16/19/20/24/26/27. Sheet:
media.homemade.education/scratch-review/c0a7d3aa-c6f2-4566-ab29-4751047b933b.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| budgie | Budgerigar | 6 Garden/exotic birds | D·s (149c) | hoop |
| starfish | Starfish | 8 Sea life | D·s (44c) | hoop |
| succulent | Potted Succulent | 14 Houseplants | D·s (71c) | hoop |
| germanshepherd | German Shepherd | 2 Dog breeds | D·m (84c) | hoop |
| teapot | Floral Teapot | 16 Food/cottagecore | D·m (155c) | hoop |
| easterbasket | Easter Basket | 19 Easter/spring | D·m (217c) | hoop |
| autumnbounty | Autumn Harvest | 20 Autumn/harvest showpiece | D·XL (191c) | hoop |
| flowerfairy | Flower Fairy | 24 Fairies & fantasy | B·r (313c) | frameless |
| catreading | Cat Reading by the Window | 27 Animals doing human things | B·r (193c) | frameless |
| wildflowermeadow | Wildflower Meadow | 10/26 Florals/Landscapes showpiece | B·XL (265c) | frameless |

REPAIR (1): **teapot** first rendered a lovely rose+forget-me-not spray but the WHITE china body was eaten by the cream ground (wispy
hollow outline, no solid vessel — the puffin/unicorn white-on-cream class). Delete flux + re-roll with a SOLID duck-egg-blue glazed body
with a clear dark outline (so it reads darker than the ground) → clean solid floral teapot, gem. LESSON reaffirmed: a white/pale VESSEL on
cream is eaten like a white animal — give it a coloured glaze (don't leave it white). All 10 themes already `started`; no status flips.
MACHINE: one Blender throughout (checked before every render command). Note: the shell cwd drifted to `.loom-scratch/heroes` after a `cd`
for gating and a re-render failed ERR_MODULE_NOT_FOUND — always `cd apps/web` in the render command itself.

**Batch 13 (2026-07-03)** — 10 gems PUBLIC, 0 culled (10 subjects; russianblue + rose both repaired to a pass). **137 PUBLIC total.**
Full range: 2 simple (tortoise D·s, thistle D·s 82c), 4 mid (dachshund D·m 97c, russianblue D·m 80c, flamingo D·m 130c, jellyfish D·m 56c),
2 rich (peacockbutterfly D·r 262c, rose D·r 67c), 2 XL (springbouquet D·XL 317c hooped floral showpiece; wintervillage B·XL 210c frameless
winter scene). Themes 1/2/3/6/7/8/10/11/18/26. Sheet: media.homemade.education/scratch-review/067289e9-36dd-4f28-b4d9-c5daf73a8c8f.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| tortoise | Tortoise | 1 Cute animals | D·s | hoop |
| thistle | Scottish Thistle | 11 Botanical stems | D·s (82c) | hoop |
| dachshund | Dachshund | 2 Dog breeds | D·m (97c) | hoop |
| russianblue | Russian Blue Cat | 3 Cat breeds | D·m (80c) | hoop |
| flamingo | Flamingo | 6 Garden/exotic birds | D·m (130c) | hoop |
| jellyfish | Jellyfish | 8 Sea life | D·m (56c) | hoop |
| peacockbutterfly | Peacock Butterfly | 7 Bees/butterflies/moths | D·r (262c) | hoop |
| rose | Red Rose | 10 Florals | D·r (67c) | hoop |
| springbouquet | Spring Bouquet | 10 Floral showpiece | D·XL (317c) | hoop |
| wintervillage | Snowy Village at Dusk | 18/26 Christmas/Landscapes | B·XL (210c) | frameless |

REPAIRS (2, both repaired to a pass — 0 culls):
- **russianblue** first rendered with a garish SCARLET nose, bright red inner ears and red eye-rims (the source-baked-warm cat failure that
  culled siamese + britishshorthair). Deleted flux + re-rolled with explicit "soft dusky grey inner ears, plain grey eyelids no red rims,
  small solid slate-grey nose, no red/pink/orange anywhere" + added `tameWarm:true` → natural soft-pink nose, pink inner ears, green eyes,
  clean plush blue-grey coat. Confirms the standing rule: source-baked warm on a cat needs an explicit no-red re-roll, not just `tameWarm`.
  (Reads slightly tabby rather than a pure solid Russian Blue, but coherent + natural; kept.)
- **rose** first blew ORANGE-vermilion with clashy purple/teal thread streaks (the AgX+1.5× grade pushing crimson→orange; tameWarm on but the
  colour was baked). Deleted flux + re-rolled with a "muted burgundy / dark-crimson, definitely not orange/scarlet, no purple/blue/teal
  streaks" palette prompt → a true deep-red rose, full and lush. Confirms: a crimson-blowing-orange rose needs a muted deep-red source re-roll.
MACHINE: one Blender throughout (checked before every render command; ONE render command per Blender, hooped batch separate from the frameless
scene). GOTCHA repeated: after a `cd` for gating, a render command WITHOUT `cd apps/web` failed ERR_MODULE_NOT_FOUND (looked in repo root) —
always put `cd apps/web` inside the render command.

**Batch 14 (2026-07-03)** — 10 gems PUBLIC, 0 culled (10 subjects; mole + axolotl both repaired to a pass). **147 PUBLIC total.**
Full range: 2 simple (mole D·s 131c, chinchilla D·s 81c), 5 mid (husky D·m 95c, toucan D·m 185c, axolotl D·m 61c, mermaid D·m 177c,
donkey D·m 121c), 1 rich (morphobutterfly D·r 151c), 2 XL (birdofparadise→"Tropical Flowers" D·XL 337c hooped tropical floral showpiece;
harbourscene B·XL 290c frameless coastal scene). Themes 1/2/4/5/6/7/8/9. Sheet:
media.homemade.education/scratch-review/133a598a-b0df-4f15-9256-3fdb162d7ee3.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| mole | Mole | 4 Woodland | D·s (131c) | hoop |
| chinchilla | Chinchilla | 1 Cute animals | D·s (81c) | hoop |
| husky | Siberian Husky | 2 Dog breeds | D·m (95c) | hoop |
| toucan | Toucan | 6 Garden/exotic birds | D·m (185c) | hoop |
| axolotl | Axolotl | 8 Sea life | D·m (61c) | hoop |
| mermaid | Mermaid | 9 Cute fantasy | D·m (177c) | hoop |
| donkey | Donkey | 5 Farm animals | D·m (121c) | hoop |
| morphobutterfly | Blue Morpho Butterfly | 7 Bees/butterflies/moths | D·r (151c) | hoop |
| birdofparadise | Tropical Flowers | 6 Garden/exotic birds showpiece | D·XL (337c) | hoop |
| harbourscene | Fishing Harbour | 8 Sea life & coastal | B·XL (290c) | frameless |

REPAIRS (2, both to a pass — 0 culls):
- **mole** first rendered with stray red scribble-streaks baked across the crown + an over-red snout. Deleted flux + re-rolled with
  "smooth dark grey-brown velvety fur all over, pale pink snout, absolutely no red markings/streaks" → a clean curled velvety mole, gem.
  Confirms: source-baked red streaks need an explicit no-red re-roll, not `tameWarm`.
- **axolotl** first came back as a FLAT CARTOON with heavy black line-art outlines (no dimensional shading — below the thread-painting bar).
  Deleted flux + re-rolled with "soft dimensional painterly shading, gentle highlights, no bold outlines, no flat cartoon lines" → a proper
  dimensional thread-painted axolotl with feathery red gills, gem. LESSON: if Flux returns flat outlined cartoon line-art, re-roll for
  "painterly dimensional shading, no outlines".
- **birdofparadise → renamed "Tropical Flowers"**: rendered as a lush tropical floral showpiece (hibiscus/lilies/leaves with a central
  strelitzia "bird-of-paradise flower" plume), not the BIRD. Coherent, dense, vibrant → renamed the row to what actually rendered, same
  accuracy discipline as lunamoth→Emperor Moth / redadmiral→Painted Lady. Gem.
MACHINE: one Blender throughout (checked before every render command; hooped batch separate from the frameless scene).
CONCURRENCY GOTCHA (new): mid-session the hourly cross-stitch cron ran a `git stash -u`/rebase in the shared MAIN checkout and SWEPT AWAY
my uncommitted `needlework-paint.ts` batch-14 edits (HEAD advanced fed8244c→fb1d46cf under me). The DB gems were already persisted so nothing
was lost — re-applied the JOB edits from context before committing. FUTURE: consider working the needlework batch in a throwaway worktree to
avoid the cross-stitch cron stashing the shared checkout, or commit the script edits early.

**Batch 15 (2026-07-03)** — 10 gems PUBLIC, 0 culled (10 subjects; bordercollie + mallard + gnome each
repaired to a pass). **157 PUBLIC total.** Full range: 2 simple (snail D·s 95c, acorn D·s 80c), 5 mid
(sloth D·m 120c, bordercollie D·m 53c, mallard D·m 153c, frog D·m 144c, gnome D·m 180c), 1 rich
(waterlily D·r 130c), 2 XL (flowerbasket D·XL 335c hooped floral basket; northernlights B·XL 78c frameless
aurora scene). Themes 1/2/4/6/10/15/20/22/24/26. Sheet: media.homemade.education/scratch-review/56f0eb14-e3ce-45be-88b6-11ca48e79626.png.

| Slug | Name | Theme | Mode·Cx | Frame |
|------|------|-------|---------|-------|
| snail | Garden Snail | 15 Mushrooms/cottagecore / 1 | D·s (95c) | hoop |
| acorn | Acorns & Oak Leaves | 20 Autumn/harvest | D·s (80c) | hoop |
| sloth | Sloth | 1 Cute animals | D·m (120c) | hoop |
| bordercollie | Border Collie | 2 Dog breeds | D·m (53c) | hoop |
| mallard | Mallard Duck | 6 Garden/exotic birds | D·m (153c) | hoop |
| frog | Tree Frog | 4 Woodland | D·m (144c) | hoop |
| gnome | Cottagecore Gnome | 24 Fairies & fantasy | D·m (180c) | hoop |
| waterlily | Water Lily | 10 Florals | D·r (130c) | hoop |
| flowerbasket | Flower Basket | 10 Floral showpiece | D·XL (335c) | hoop |
| northernlights | Northern Lights | 22 Celestial / 26 Landscapes | B·XL (78c) | frameless |

REPAIRS (3, all to a pass — 0 culls):
- **bordercollie** first rendered with vivid NEON-RED inner ears + red-orange eyes. The eyes fixed with an
  explicit "no red/orange eyes" re-roll + `tameWarm:true`, but the red inner ears survived BOTH that AND
  `tameWarm` (source-baked warm, the siamese/britishshorthair class). A 3rd re-roll with "both ears folded
  down and fully covered in black fur, inner ear not visible" removed the red → clean B&W dog (slight olive
  shadow on the face but coherent). LESSON reaffirmed: source-baked warm ears → hide/black-out the ear, don't
  rely on `tameWarm`.
- **mallard** first painted two vivid RED rose-swirls on the flank (Flux hallucinated flowers, narwhal class);
  a "no red/no flowers" re-roll reduced them to one solid SCARLET breast patch that then survived `tameWarm`
  too (source-baked). The FIX was a strongly MUTED-palette re-roll ("soft muted greyish-brown breast, dull
  earthy brown, absolutely no red/scarlet/crimson") → natural chestnut breast, blue speculum, clean drake.
  Same muted-palette rescue as rose/russianblue/highlandglen.
- **gnome** first rendered with a HOLLOW bare-linen hole where the white beard met the cream ground (white-on-
  cream eaten, puffin/teapot/unicorn class); "grey-and-white beard + grey shadows" still went wispy/holed. The
  FIX (proven saturate-the-pale-element): a solid SILVER/DOVE-GREY beard "clearly darker than the cream, NOT
  white" → the beard fills solid, no gap. LESSON: a white beard on cream must be given a real mid-grey colour,
  not white, or the ground-removal eats it.
- CONCURRENCY (recurred): mid-batch the hourly cross-stitch cron ran `git stash -u`/rebase on the shared MAIN
  checkout and swept my uncommitted `needlework-paint.ts` Batch-15 edits into a stash (HEAD 0e63b0d6→f3270248),
  so a repair re-render printed "no job". Recovered with `git stash pop stash@{0}` (edits intact) + re-ran. DB
  gems already persisted so nothing lost. FUTURE: work the batch in a throwaway worktree, or commit the script
  edits before the first render.

---

## 1. Cute animals & pets — D — hoop

Simple motifs (single small pet on plain linen ground):
- Tabby kitten sitting [D·s], sleeping black cat curled [D·s], ginger cat loaf [D·s],
  tuxedo cat peeking [D·s], white rabbit sitting [D·s], small guinea pig [D·s],
  hamster with full cheeks [D·s], hedgehog on side view [D·s], sleeping puppy [D·s],
  tiny tortoise [D·s], budgerigar on perch [D·s], goldfish in bowl [D·s],
  chinchilla sitting [D·s], small frog on lily pad [D·s], baby chick [D·s].

Mid compositions (pet with a prop or environment element):
- Cat in a teacup [D·m], cat on a windowsill with curtains [D·m], rabbit in a flower crown
  [D·m], kitten with a ball of yarn [D·m], dachshund in a tiny jumper [D·m], corgi with
  autumn leaves [D·m], pug in a bow tie [D·m], guinea pig with a flower posy [D·m],
  hamster in a teacup [D·m], parrot on a perch with tropical leaf [D·m], cat with butterfly
  on nose [D·m], sleeping dog by a fireplace (close crop) [D·m], golden retriever with a
  flower [D·m], kitten playing with a feather [D·m], poodle with a bow [D·m],
  fluffy Persian cat with jewel collar [D·m], cat reading a tiny book [D·m],
  french bulldog in a striped top [D·m], rabbit beside a carrot [D·m],
  dalmatian puppy with spots [D·m].

Rich / large pets in detail:
- Siamese cat in a wicker chair, full detail [D·r], Maine Coon on a velvet cushion [D·r],
  tabby cat portrait — fur texture detail, whiskers [D·r], golden retriever head portrait
  with autumn leaves [D·r], cocker spaniel with silky ears [D·r], British Shorthair with
  jewel tones [D·r], shiba inu in snow [D·r], fluffy white rabbit in a meadow [D·r],
  tortoiseshell cat in afternoon light [D·r], ginger kitten with a pansy [D·r],
  border collie herding — cropped portrait [D·r], Persian kitten with daisy [D·r].

Showpieces (dense, multi-pet, botanical or scene):
- Three kittens in a flower-filled basket — 100+ DMC, lush botanical surround [D·XL],
  two rabbits in a clover meadow — full botanical frame [D·XL],
  cats-and-florals triptych portrait (three cats, three bloom types) [D·XL],
  a litter of puppies in a flower garden — layered depth [D·XL],
  golden retriever puppy in an autumn flower meadow — dense wildflower surround [D·XL],
  corgi in a bluebell wood — forested depth [D·XL].

---

## 2. Dog breed portraits (realistic) — D — hoop or none

One clean portrait per breed on a soft plain ground (cropped head/shoulders or bust).
Use `detail: true` for fine coat texture. Group popular breeds first (UK-weighted).

**Wave 1 — most-wanted:**
Labrador (yellow) [D·m], Labrador (black) [D·m], Labrador (chocolate) [D·m],
Golden Retriever [D·m], Cockapoo [D·m], Cavapoo [D·m],
Cavalier King Charles Spaniel [D·m], French Bulldog [D·m], Cocker Spaniel [D·m],
Springer Spaniel [D·m], Dachshund (smooth) [D·m], Dachshund (long-haired) [D·m],
Border Collie [D·m], German Shepherd [D·m], Pug [D·m], Shih Tzu [D·m],
Yorkshire Terrier [D·m], Jack Russell [D·m], Staffordshire Bull Terrier [D·m],
Husky [D·m], Corgi [D·m].

**Wave 2 — extended breeds:**
Chihuahua [D·s], Pomeranian [D·m], Border Terrier [D·m], Westie [D·m],
Scottish Terrier [D·m], Bichon Frise [D·m], Maltese [D·m], Miniature Schnauzer [D·m],
Whippet [D·m], Greyhound [D·m], Italian Greyhound [D·m], Lurcher [D·m],
Beagle [D·m], Basset Hound [D·m], Dalmatian [D·m], Great Dane [D·m],
Bernese Mountain Dog [D·m], Newfoundland [D·m], Saint Bernard [D·m], Doberman [D·m],
Vizsla [D·m], Weimaraner [D·m], Pointer [D·m], Irish Setter [D·m], English Setter [D·m],
Akita [D·m], Shiba Inu [D·m], Samoyed [D·m], Chow Chow [D·m],
Australian Shepherd [D·m], Bullmastiff [D·m], Rhodesian Ridgeback [D·m],
Poodle (standard) [D·m], Miniature Poodle [D·m], Boxer [D·m], Bulldog [D·m],
Rottweiler [D·m], Labradoodle [D·m], Dachshund (wire-haired) [D·m].

**Rich portrait versions** (same breed, more detail, richer DMC palette):
Labrador portrait in autumn light — 60+ DMC, full coat texture [D·r],
Golden Retriever — sun-lit fur, detailed eyes [D·r],
Border Collie — black-and-white coat detail [D·r],
Husky — ice-blue eyes, two-tone fur [D·r],
Bernese Mountain Dog — tri-colour coat, mountain backdrop wash [D·r],
Irish Setter — rich mahogany coat flowing [D·r],
Samoyed — cloud-white coat in snow light [D·r].

**Showpiece breed portraits** (full body, botanical / scene surround):
Cocker Spaniel in a bluebell wood — full body + scene [D·XL],
Golden Retriever in an autumn meadow — full body + wildflower field [D·XL],
Springer Spaniel bounding through heathland — full botanical surround [D·XL].

---

## 3. Cat breed portraits (realistic) — D — hoop or none

Same clean-portrait treatment as dogs. One per breed.

British Shorthair (blue) [D·m], British Shorthair (tabby) [D·m], Maine Coon [D·m],
Ragdoll [D·m], Siamese (classic points) [D·m], Bengal [D·m], Persian (white) [D·m],
Persian (ginger) [D·m], Sphynx [D·m], Norwegian Forest [D·m], Russian Blue [D·m],
Tabby (brown classic) [D·m], Tuxedo [D·m], Tortoiseshell [D·m],
Ginger (marmalade) [D·m], Scottish Fold [D·m], Birman [D·m], Burmese [D·m],
Abyssinian [D·m], Devon Rex [D·m], Turkish Angora [D·m], Chartreaux [D·m].

Rich versions: Maine Coon — flowing tufted ears + ruff, 70+ DMC [D·r],
Bengal — leopard rosettes in detail [D·r], Sphynx — skin fold texture [D·r],
Ragdoll — blue eyes, colour-point detail [D·r].

Showpiece: three cat breeds in a floral frame — Maine Coon, Siamese, Bengal [D·XL].

---

## 4. Woodland & wildlife — D and B — hoop or none

Simple single woodland animals:
Fox head portrait [D·s], robin on a twig [D·s], hedgehog side view [D·s],
red squirrel sitting [D·s], wren on a branch [D·s], field mouse [D·s],
barn owl face [D·s], badger portrait [D·s], fawn face [D·s], mole [D·s].

Mid woodland portraits (with a prop):
Fox sitting in autumn leaves [D·m], hedgehog with apple [D·m], badger with bluebells
[D·m], deer fawn among ferns [D·m], squirrel with acorn [D·m], tawny owl on a branch
with moon behind [D·m], hare in a meadow [D·m], otter holding a fish [D·m],
dormouse in a hazelnut [D·m], stoat in winter white [D·m], pine marten on a log [D·m],
woodpecker on a silver birch [D·m], kingfisher on a reed [D·m], wolf portrait [D·m],
brown bear with salmon [D·m], raccoon with berries [D·m].

Rich detail portraits:
Fox in autumn bracken — layered texture + moss [D·r], hare in a bluebell wood [D·r],
stag in morning mist — antler detail [D·r], barn owl in flight crop — wing detail [D·r],
otter portrait in a river — water refraction [D·r], kingfisher in full detail — jewel
plumage [D·r], badger family — sow + cubs [D·r], red squirrel — chestnut fur texture
[D·r], snowy owl face — feather fan [D·r], muntjac deer in a field [D·r].

Bleed woodland scenes (full background):
Fox family at dusk — tawny sky, tree silhouette [B·m],
hedgehog & mushroom in a forest clearing [B·m],
owl in a hollow oak — moonlit forest [B·r],
deer drinking at a moonlit pond — full forest depth [B·r],
fox cubs playing in bluebells — dense spring woodland [B·r],
badger sett cross-section — underground + above ground [B·r],
stag at dawn in misty moorland — full atmospheric scene [B·XL],
woodland floor teeming with life — fox + hedgehog + mushrooms + moss + ferns [B·XL],
midnight forest — moon, owl, fox, deer, moths — layered depth [B·XL].

---

## 5. Farm animals & smallholding — D and B — hoop

Simple farm singles:
Highland cow face [D·s], sheep portrait [D·s], piglet [D·s], baby chick [D·s],
goat kid [D·s], duckling [D·s], bunny [D·s], horse head [D·s].

Mid farm portraits:
Highland cow with bell and flower crown [D·m], fluffy sheep in a meadow [D·m],
pig with a daisy [D·m], hen with chicks [D·m], rooster in full plumage [D·m],
goat on a stone wall [D·m], donkey in a stable door [D·m], horse/pony portrait [D·m],
shire horse with feathered feet [D·m], alpaca portrait [D·m], llama with a scarf [D·m],
goose with goslings [D·m], turkey in full fan [D·m], rabbit in a vegetable patch [D·m],
bee on a clover [D·m], beehive with bees [D·m], sheepdog portrait [D·m],
barn cat with hay [D·m].

Rich farm portraits:
Highland cow — long coat texture + bonnet of wildflowers [D·r],
shire horse — full head + shoulders, draped mane [D·r],
alpaca — rich fleece texture [D·r], rooster — iridescent plumage [D·r],
cow in a flower meadow [D·r], sheep + lamb at dusk [D·r].

Bleed farm scenes:
Hen house at morning — chickens in a flower garden [B·m],
farmyard at dusk — hay bales, barn, animals [B·r],
allotment in summer — raised beds, tools, sunflowers, cat on fence [B·r],
cottage smallholding scene — herbs, bees, vegetable garden, cat, chickens [B·XL].

---

## 6. Garden & exotic birds — D — hoop or none

Simple single birds:
Robin facing right [D·s], blue tit on a twig [D·s], wren [D·s], goldfinch [D·s],
house sparrow [D·s], swallow [D·s], blackbird [D·s], bullfinch [D·s].

Mid bird portraits (with botanical prop):
Robin on a holly sprig [D·m], blue tit on a hawthorn branch [D·m],
goldfinch on a thistle [D·m], chaffinch on a rosehip stem [D·m],
bullfinch on a blossom branch [D·m], kingfisher on a bullrush [D·m],
puffin on a clifftop [D·m], hummingbird beside a hibiscus [D·m],
flamingo portrait [D·m], peacock head portrait [D·m], barn owl perched [D·m],
little owl on a fence post [D·m], great tit on a branch [D·m],
long-tailed tit on a catkin [D·m], jay with an acorn [D·m],
swallow on a telephone wire [D·m], swift in flight [D·m],
waxwing on a berry branch [D·m], house martin [D·m],
starling in iridescent plumage [D·m], chough on a clifftop [D·m],
red kite soaring [D·m], kestrel portrait [D·m], puffin holding sand eels [D·m],
lorikeet portrait — jewel colours [D·m], macaw portrait [D·m],
toucan portrait [D·m], bird of paradise [D·m].

Rich detail birds:
Kingfisher — iridescent turquoise/copper plumage in full [D·r],
peacock — fan tail with eye-feather detail [D·r],
goldfinch on a teasel — full botanical + feather [D·r],
puffin — orange beak, summer plumage [D·r],
hummingbird at a flower — wing motion + iridescence [D·r],
barn owl in flight — wing span [D·r], pheasant in bracken [D·r],
jay — blue wing panel, crest [D·r], waxwing in winter — berry wreath context [D·r].

Showpiece bird compositions:
British garden birds in a single hawthorn tree — robin, blue tit, goldfinch, wren,
bullfinch, chaffinch — 12 species, 100+ DMC [D·XL],
bird of paradise in a tropical flower frame [D·XL],
peacock in a bower of roses [D·XL].

---

## 7. Bees, butterflies & moths — D and L — hoop

Simple single specimens (line mode, minimal):
Bumblebee on clover [L·s], small tortoiseshell butterfly [D·s],
common blue butterfly [D·s], white moth [L·s], ladybird on a leaf [L·s],
small dragonfly [L·s].

Mid specimens (dense or line with botanical):
Bumblebee on lavender [D·m], red admiral butterfly on a blackberry [D·m],
peacock butterfly on buddleia [D·m], monarch butterfly in profile [D·m],
luna moth face-on [D·m], atlas moth — wing detail [D·m],
death's head hawk moth [D·m], garden tiger moth [D·m],
swallowtail butterfly [D·m], large white on verbena [D·m],
emperor dragonfly on a reed [D·m], stag beetle on an oak [D·m],
golden beetle on a leaf [D·m], rose chafer beetle [D·m],
honeybee with full pollen baskets [D·m], bumblebee on a sunflower [D·m],
cabbage white on a daisy [D·m].

Rich specimens:
Luna moth — full wing span, pale green + pink eye-spots [D·r],
atlas moth — wingspan detail, brown-auburn tones [D·r],
peacock butterfly — four eye-spots, full wing texture [D·r],
morpho butterfly — iridescent blue wing sheen [D·r],
death's head hawk moth — skull thorax, rich brown tones [D·r].

Showpiece compositions:
Butterfly and moth collection — eight species on botanical sprigs, specimen-style [D·XL],
night-garden moths — luna + hawk + emperor + lesser stag, moon + ox-eye daisies [D·XL],
"the pollinators" — three bees + three butterflies + two moths in a wildflower meadow
panel [D·XL].

---

## 8. Sea life & coastal — D and B — hoop or none

Simple sea singles:
Starfish [D·s], hermit crab [D·s], seahorse [L·s], small jellyfish [D·s],
puffin portrait [D·s], clownfish [D·s].

Mid sea portraits and scenes:
Whale tail above ocean surface [D·m], narwhal with unicorn horn [D·m],
dolphin portrait [D·m], seal pup [D·m], otter holding hands (pair) [D·m],
octopus portrait — tentacles arranged [D·m], crab on a rock [D·m],
lobster [D·m], seahorse on seagrass [L·m], jellyfish with trailing tentacles [D·m],
koi fish in a pond [D·m], turtle swimming [D·m], axolotl [D·m],
sea turtle — full shell detail [D·m], puffin with sand eels [D·m],
oystercatcher on a rock [D·m], lighthouse portrait [D·m],
rowing boat on still water [D·m], beach huts row [B·m],
rock pool with anemones, crab, periwinkles [D·m],
harbour scene — boats + quayside [B·m].

Rich detail:
Whale — full body + ocean depth gradient [D·r],
octopus — suckers, colour-change skin [D·r],
jellyfish — trailing filaments, bioluminescence [D·r],
sea turtle in clear water — shell mosaic [D·r],
koi pond — two koi + water lily + refraction [D·r],
puffin colony on clifftop [B·r],
lighthouse at dusk — sky + sea [B·r].

Showpiece coastal/sea:
"The Ocean" — whale, turtle, dolphin, coral, kelp, jellyfish — deep-ocean
scene, full bleed, 100+ DMC [B·XL],
rock pool microcosm — anemones, starfish, crab, blenny, periwinkles,
weed, water light — ultra-detailed [D·XL],
harbour scene in summer — boats, gulls, lobster pots, cobbled quay [B·XL].

---

## 9. Cute fantasy creatures — D — hoop

Simple singles:
Baby dragon [D·s], unicorn head [D·s], narwhal [D·s], tiny phoenix [D·s],
jackalope [D·s], small gnome [D·s], baby kraken [D·s].

Mid fantasy portraits:
Cute dragon with a flower [D·m], unicorn in a flower crown [D·m],
mermaid portrait (tail cropped) [D·m], phoenix in flames [D·m],
griffin portrait — feather + fur [D·m], fairy sitting on a mushroom [D·m],
gnome under a toadstool [D·m], sea serpent curled [D·m],
loch ness monster peeking [D·m], cute dinosaur — triceratops [D·m],
cute T-rex with tiny arms [D·m], axolotl in a party hat [D·m],
pegasus portrait [D·m], centaur (bust crop) [D·m], kirin (Chinese unicorn) [D·m].

Rich:
Dragon with elaborate scales + flower garland [D·r],
mermaid in an underwater floral bower [D·r],
phoenix in full tail + flame [D·r], fairy with botanical wings [D·r].

Showpiece:
Dragon coiled around a tree in blossom — dense botanical frame [D·XL],
underwater grotto — mermaid + coral + fish + seahorse + anemones [B·XL].

---

## 10. Florals & bouquets — D and L — hoop or none

Simple single blooms (line mode, minimal):
Single poppy [L·s], one daisy [L·s], one pansy [L·s], one anemone [L·s],
one ranunculus [L·s], one peony bud [L·s], one sweet pea [L·s].

Mid bouquets and arrangements:
Mixed wildflower posy [D·m], peonies in a vase [D·m], roses in a jam jar [D·m],
sunflowers in a jug [D·m], tulips in a vase [D·m], daffodils in a jug [D·m],
ranunculus + anemone arrangement [D·m], dahlias in a vase [D·m],
sweet peas in a glass vase [D·m], cottage-garden jug overflowing [D·m],
dried-flower bunch (pampas + strawflower + honesty) [D·m],
autumn arrangement (chrysanthemum + rosehip + oak leaves) [D·m],
spring arrangement (narcissus + fritillary + grape hyacinth) [D·m],
wildflower meadow bunch [D·m], hydrangea head [D·m],
lilac spray [D·m], magnolia branch [D·m], bluebell bunch [D·m],
lavender bundle tied with twine [D·m], heather sprig [D·m].

Rich florals:
Peony bloom — layers of petals, dew drops, 70+ DMC [D·r],
rose — full open bloom, thorn stem, 65+ DMC [D·r],
dahlia — geometric petal layers [D·r],
sunflower — seed-head detail + petals [D·r],
magnolia branch — two blooms + buds [D·r],
iris — three blooms + buds + foliage [D·r],
poppy — ruffled petals + seed head [D·r],
anemone — velvet petals + dark centre [D·r],
hibiscus — tropical, stamens + pistil [D·r],
wisteria cascade — full branch + drape [D·r],
cherry blossom branch — five blooms + buds [D·r].

Showpiece florals:
Grand peony bouquet — five blooms + buds + leaves + small filler flowers [D·XL],
English cottage garden mix — rose + delphinium + foxglove + sweet pea + nigella,
100+ DMC, lush overlapping [D·XL],
"The Cutting Garden" — overflowing vase with 12 varieties [D·XL],
wildflower meadow — horizontal panorama, bleed edge-to-edge [B·XL].

---

## 11. Single botanical stems — L (line mode) — hoop or none

Line-mode delicate stems on bare linen. Fill only saturated petals/leaves;
back-stitch strong edges; leave negative space as linen.

Simple single stems [L·s]:
Single lavender stem, single foxglove, single lupin spike, single allium globe,
single delphinium, single hollyhock, single gladiolus, single snapdragon,
single fritillary, single agapanthus, single sweet pea tendril, single teasel,
single cow parsley, single honesty, single nigella pod (seed stage),
single poppy pod, single wheat stem, single sprig of thyme,
single sprig of rosemary, single sage sprig, single mint stem.

Mid botanical stems [L·m]:
Foxglove — tall stem with multiple bells + leaves,
lupin — full stem, leaves, colour wash,
hollyhock — tall multi-bloom tower,
delphinium — blue spike in detail,
gladiolus — open blooms + buds,
iris — single stem + two blooms,
fritillary — pendant bell-checks,
sweet pea vine climbing a stem,
allium — globe in full + stem + grass blades,
agapanthus — full globe + stem + strap leaves,
snapdragon — full stem + buds,
verbascum — tall yellow candle.

Rich botanical studies [L·r]:
Foxglove in full — speckled bells, bee on lower bell, multiple stems overlapping,
wisteria branch — cascade of purple racemes + leaves,
lupin — double stem with varied hues, 50+ DMC.

---

## 12. Delicate line motifs — jars, sprigs, sprays — L (line mode) — hoop

Line mode on bare linen. The "quiet corner of the market" — minimalist, Etsy-favourite.

Simple single motifs [L·s]:
Wildflower jar (thin glass outline + three flowers) [L·s],
small herb sprig (basil) [L·s], small herb sprig (rosemary) [L·s],
single stem in a bud vase [L·s], small mushroom sprig [L·s],
tiny bee + flower [L·s], small butterfly on a twig [L·s],
seed pod spray [L·s], pressed-fern frond [L·s], small cherry branch [L·s],
eucalyptus sprig [L·s], cotton-boll stem [L·s], small cactus [L·s].

Mid line motifs [L·m]:
Wildflowers in a jam jar — three varieties, outlined jar [L·m],
herb bunch tied with twine (lavender + rosemary + thyme) [L·m],
olive branch [L·m], jasmine climbing spray [L·m],
hawthorn branch with berries [L·m], rowan spray [L·m],
strawberry plant — runners + flower + fruit [L·m],
pussy willow branch [L·m], bluebell cluster [L·m],
ox-eye daisy bunch in a bottle [L·m], gypsophila spray [L·m],
wildflower posy outlined, minimal fill [L·m],
elderflower spray [L·m], blackberry branch [L·m],
forget-me-not cluster [L·m], lily of the valley [L·m],
sweet pea climbing a stick [L·m], cornflower + wheat bunch [L·m].

Rich detailed line compositions [L·r]:
Large glass vase of wildflowers — 15+ variety stems, complex glass outline [L·r],
herb garden flat-lay — nine herbs, labels in stitch script (image-style) [L·r],
botanical specimen plate — four pressed specimens mounted [L·r].

---

## 13. Wreaths & circular compositions — D and L — hoop

Circular compositions designed for a round hoop.

Simple circular motifs [D·s / L·s]:
Simple daisy ring, simple holly-berry circle, simple lavender ring,
simple star-flower wreath, simple citrus slice ring.

Mid wreaths [D·m / L·m]:
Spring wreath (tulip + daffodil + blossom + catkin) [D·m],
summer wildflower wreath (daisy + cornflower + poppy + clover) [D·m],
autumn wreath (acorns + rosehips + mini pumpkins + berries + leaves) [D·m],
winter wreath (pine + holly + berries + pinecones + white berries) [D·m],
lavender wreath [D·m], eucalyptus wreath [D·m], herb wreath (rosemary + thyme +
bay + sage) [L·m], wildflower wreath [D·m], birth-month flower ring [D·m],
heart-shaped floral (roses + rosebuds) [D·m], citrus ring (lemon + orange + lime)
[D·m], butterfly ring — five species [D·m], woodland-animal ring (fox + hedgehog
+ rabbit + owl) [D·m], botanical berries ring [D·m],
seashell ring [D·m], Christmas botanical (holly + pine + berry + pine cone) [D·m].

Rich / large wreaths [D·r]:
English roses wreath — eight blooms, rosebuds, leaves, 65+ DMC [D·r],
wildflower wreath — 12 species in full bloom [D·r],
autumn harvest wreath — pumpkin + apple + berries + nuts + leaves, dense [D·r],
winter botanical — pine + hellebore + berry + lichen + pinecone [D·r],
tropical botanical ring (hibiscus + monstera + bird-of-paradise + frangipani) [D·r].

Showpiece wreaths [D·XL]:
"The Four Seasons" wreath — each quarter a different season, 100+ DMC [D·XL],
English cottage garden wreath — 15+ varieties, dense layered depth [D·XL],
birds + botanicals wreath — eight British birds in a full floral ring [D·XL].

---

## 14. Houseplants & terrariums — D and L — hoop or none

Simple single plants [L·s / D·s]:
Single monstera leaf [L·s], single cactus [L·s], single succulent [D·s],
single trailing pothos [L·s], single snake plant [D·s], single aloe [L·s].

Mid plant portraits [D·m / L·m]:
Monstera in a terracotta pot [D·m], fiddle-leaf fig [D·m],
snake plant [D·m], pothos in a hanging planter [L·m],
string of pearls trailing [L·m], cheese plant [D·m],
cactus trio in tiny pots [D·m], succulent shelf (five varieties) [D·m],
terrarium dome with ferns + pebbles [D·m], hanging macramé planter [D·m],
herb pots on a windowsill [L·m], prayer plant (calathea) [D·m],
aloe vera with flowers [D·m], rubber plant [D·m],
ceropegia (string of hearts) [L·m], hoya with wax flowers [D·m],
ZZ plant [D·m], bird of paradise (strelitzia) plant [D·m],
watering can with plants [L·m], trailing ivy [L·m].

Rich plant studies [D·r]:
Monstera — full leaf detail, fenestrations, 50+ DMC [D·r],
fiddle-leaf fig — multi-leaf branch with light through leaves [D·r],
tropical plant shelf — four species [D·r].

Showpiece plant compositions [D·XL]:
"The Urban Jungle" — six houseplants, trailing + architectural + flowering [D·XL],
terrarium cross-section — layered glass dome with moss, ferns, pebbles, air plant [D·XL].

---

## 15. Mushrooms & cottagecore — D — hoop

Simple singles [D·s]:
Fly agaric toadstool [D·s], small porcini [D·s], oyster mushroom [D·s],
hedgehog mushroom [D·s], single chanterelle [D·s].

Mid mushroom portraits and vignettes [D·m]:
Fly agaric with white spots [D·m], mushroom cluster (three varieties) [D·m],
snail on a toadstool [D·m], frog under a mushroom [D·m],
hedgehog under a toadstool [D·m], bee on a mushroom cap [D·m],
fairy-tale mushroom house [D·m], mushroom ring in a forest clearing [D·m],
foraging basket with mushrooms + berries [D·m],
cottagecore still-life (jam jar + bread + eggs + gingham cloth) [D·m],
woodland foraging scene — basket + mushrooms + leaves [B·m],
mouse under a mushroom [D·m], snail family in mushroom village [D·m],
acorn + mushroom autumn vignette [D·m].

Rich cottagecore [D·r]:
Mushroom cluster — six varieties, dew drops, moss [D·r],
cottagecore kitchen shelf — jam jars + mushrooms + herbs + candle [B·r],
enchanted toadstool garden — gnome, snail, flowers, moss, dew [B·r].

Showpiece [D·XL / B·XL]:
"The Fairy Ring" — circle of toadstools with fairy lights + insects + flowers [D·XL],
forest floor abundance — mushrooms + ferns + moss + fallen leaves + insects [B·XL].

---

## 16. Food, drink & baking — D and L — hoop

Simple single items [D·s / L·s]:
Cupcake [D·s], single macaron [D·s], small lemon [L·s], strawberry [D·s],
cherry pair [D·s], single croissant [D·s], jam jar [L·s], honey jar [L·s].

Mid food portraits and still-life [D·m]:
Cupcake with buttercream swirl [D·m], layer cake slice [D·m],
Victoria sponge with strawberries [D·m], gingerbread person [D·m],
doughnut with sprinkles [D·m], macaron tower [D·m],
biscuit tin + teacup [D·m], scone with jam + cream [D·m],
Bundt cake + icing [D·m], Battenberg slice [D·m],
cherry bakewell [D·m], loaf of bread [D·m], croissant + café au lait [D·m],
teapot + teacup [D·m], cafetiere + beans [D·m], latte with latte art [D·m],
hot cocoa with marshmallows [D·m], cocktail glass (non-branded) [D·m],
milkshake [D·m], bubble tea [D·m], lemonade with a slice [D·m],
strawberries + cream bowl [D·m], fig cut in half [D·m],
watermelon slice [D·m], pear with a bite [D·m],
lemon + rosemary on linen [L·m], tomatoes on the vine [D·m],
pea pod + scattered peas [L·m], mushroom bunch [L·m],
chilli peppers on a stem [D·m], jar of jam + spoon [L·m],
honey pot + drizzle [L·m], pickle jar with herbs inside [L·m],
cookbook + mug of tea still-life [D·m].

Rich food illustrations [D·r]:
"The Afternoon Tea" — tiered cake stand, teapot, cups, cakes [D·r],
bakery window display — five pastries + loaves [D·r],
kitchen shelf still-life — spices, jars, herbs [D·r],
fruit bowl — oranges, figs, grapes, pears, 60+ DMC [D·r].

Showpiece [D·XL]:
Grand patisserie display — 15 varieties of pastry + cake + macarons [D·XL],
kitchen-counter scene — baking in progress, flour, rolling pin, fruits, butter [B·XL].

---

## 17. Seasonal — Halloween — D — hoop

Simple [D·s]: black cat silhouette, pumpkin, friendly ghost, small bat, spider.

Mid [D·m]:
Black cat + pumpkin vignette [D·m], jack-o-lantern trio [D·m],
witch's hat with flowers [D·m], cauldron with bubbling potion [D·m],
spider on a web [D·m], bats over a crescent moon [D·m],
cute skeleton (sugar-skull flavour) [D·m], candy corn pile [D·m],
owl on a broomstick [D·m], black cat under a full moon [D·m],
potion bottles shelf [L·m], toffee apples + autumn leaves [D·m],
black cat with autumn berries [D·m], haunted tree (bare + bats) [D·m],
witch's cat in a hat with stars [D·m], pumpkin + spider web + leaves [D·m].

Rich [D·r]:
Haunted cottage at dusk — black cat, pumpkins, spider web, bats [B·r],
"All Hallows" botanical — deadly nightshade + belladonna + black roses [D·r].

Showpiece [B·XL]:
Haunted-but-cosy Halloween scene — cottage, pumpkin path, moon, bats, black cat,
spider, autumn trees, full bleed, 100+ DMC [B·XL].

---

## 18. Seasonal — Christmas & winter — D and B — hoop or none

Simple [D·s]: single robin, single snowflake, single ornament bauble, sprig of holly.

Mid [D·m]:
Robin on holly [D·m], snowman with scarf [D·m], gingerbread house [D·m],
nutcracker portrait [D·m], decorated Christmas tree (small) [D·m],
Christmas stocking [D·m], winter wreath [D·m], reindeer portrait [D·m],
penguin in a scarf [D·m], pair of ice skates [D·m], mince pies on a plate [D·m],
candlelit window with snow [D·m], bauble collection [D·m],
fox in snow [D·m], hare in snow [D·m], candy canes tied in ribbon [D·m],
poinsettia [D·m], Nordic folk reindeer motif [D·m], hot cocoa + fairy lights [D·m],
winter blue-tit on a snowy branch [D·m], Christmas pudding [D·m].

Rich [D·r]:
Gingerbread house in full winter night — lights, icing, snowy garden [B·r],
stag in a snowy forest — antlers, breath mist, pine trees [B·r],
Christmas botanical wreath — pine + hellebore + berry + silver [D·r].

Showpiece [B·XL]:
Christmas Eve cottage scene — candles, wreath, snow, robin, full bleed [B·XL],
"Twelve Days" panorama — 12 British winter birds in snow + botanicals [D·XL],
snowy village at night — lights, snow, carol singers, full bleed [B·XL].

---

## 19. Seasonal — Easter & spring — D and L — hoop

Simple [D·s / L·s]: chick, daffodil, sprig of blossom, decorated egg.

Mid [D·m / L·m]:
Easter bunny + willow basket [D·m], chick hatching from egg [D·m],
painted eggs in a nest [D·m], spring lamb in a meadow [D·m],
blossom branch (pink cherry) [D·m], daffodil bunch [L·m],
duckling with a flower [D·m], nest with blue eggs [D·m],
hot cross buns [D·m], spring wreath (tulip + daffodil + blossom) [D·m],
bluebell wood (close crop) [D·m], primrose cluster [L·m],
baby rabbit in clover [D·m], mother hen + chicks [D·m],
spring cottage garden [B·m], wren + blossom [D·m].

Rich [D·r]:
"Spring Abundance" — four spring flowers in a bouquet + nesting bird [D·r],
spring landscape — meadow, lambs, blossom trees, rolling hills [B·r].

Showpiece [B·XL]:
Spring meadow in full bloom — lambs, butterflies, wildflowers, blossom [B·XL].

---

## 20. Seasonal — Autumn / harvest — D and B — hoop or none

Simple [D·s / L·s]: single acorn, single conker, single leaf, small pumpkin.

Mid [D·m]:
Squirrel + acorns [D·m], conker + leaf [D·m], pumpkin trio [D·m],
hedgehog + fallen apple [D·m], harvest basket (wheat + pumpkin + apple) [D·m],
autumn leaves swirl [D·m], scarecrow in a field [B·m],
cosy woolly jumper still-life [B·m], hot apple cider mug [D·m],
pumpkin on a farm cart [B·m], wheat sheaf [D·m],
apple harvest — tree + bucket [B·m], foggy-morning oak tree [B·m],
autumn mushrooms + leaves [D·m], acorn wreath [D·m],
red squirrel in an oak [D·m].

Rich [D·r]:
Red squirrel in an autumn oak — acorns + bark texture + leaves [D·r],
harvest still-life — pumpkin + corn + apples + gourds [B·r].

Showpiece [B·XL]:
Autumn forest panorama — oak + beech + birch, golden canopy, fox, leaf fall [B·XL].

---

## 21. Seasonal — Valentine's — D and L — hoop

Simple [L·s / D·s]: small heart, single red rose, pair of lovebirds (silhouette).

Mid [D·m / L·m]:
Heart floral wreath (roses + rosebuds) [D·m], lovebirds on a branch [D·m],
two hares touching noses [D·m], red rose bunch in a vase [D·m],
cupid bee + flowers [D·m], pair of swans forming a heart [D·m],
heart-shaped jam jar [L·m], love in flowers (blooms form a heart shape) [D·m],
hot-air balloon of hearts [D·m], posy of wildflowers [L·m],
strawberries + champagne [D·m], small bouquet + ribbon [L·m],
red tulips in a vase [D·m], pressed-flowers heart [L·m].

Rich [D·r]:
"Garden of Love" — roses + dove + botanical frame [D·r].

Showpiece [D·XL]:
Botanical heart — 20+ flower varieties forming a heart shape [D·XL].

---

## 22. Celestial & constellations — D and L — hoop

Simple [L·s / D·s]:
Crescent moon [L·s], single star cluster [L·s], simple sun face [D·s],
small planet [D·s], comet [L·s].

Mid celestial [D·m / L·m]:
Moon phases strip [L·m], sun + moon face pair [D·m],
crescent moon with stars + botanicals [D·m], starry night sky wash [D·m],
comet with tail [L·m], planet row (solar system) [D·m],
constellation dot-maps (Orion, Ursa Major, Cassiopeia) [L·m],
zodiac symbol glyphs — each sign as a motif (GEN — image only, no text) [D·m],
zodiac animal illustrations — ram, bull, crab, lion, scorpion, fish [D·m],
tarot-card-style sun [D·m], tarot-card-style moon [D·m],
star map (celestial-sphere partial) [L·m],
crescent moon + moth [L·m], sun face with rays + botanicals [D·m],
planets in alignment [D·m], aurora borealis wash [B·m].

Rich celestial [D·r]:
"The Night Sky" — full-bleed deep sky, constellation lines, nebula wash [B·r],
moon + botanicals — crescent moon with floral and moth surround [D·r],
sun face — intricate ray detail + botanical elements [D·r].

Showpiece celestial [B·XL]:
"The Universe" — cosmos panorama, planets, moon, comet, meteor shower,
botanical frame, full bleed, 100+ DMC [B·XL].

---

## 23. Witchy & gothic — D and L — hoop or none

Simple [L·s / D·s]:
Crystal cluster [L·s], small raven [D·s], crescent + single star [L·s],
small moth [L·s].

Mid witchy [D·m / L·m]:
Crescent moon + botanicals (dried herbs + crystals) [L·m],
black cat + crystal ball [D·m], potion shelf [L·m],
moth + moon [D·m], mystic hand (palmistry lines) [D·m],
tarot sun card (image only) [D·m], mushroom + moon vignette [D·m],
raven on a skull [D·m], apothecary bottles shelf [L·m],
pressed nightshade + belladonna botanical [L·m], gothic rose [D·m],
spellbook (closed, no text) [D·m], ouija-board-flavour crescent moon planchette [D·m],
spider web with spider + moon [D·m], crystal geode cross-section [D·m],
black rose with thorns [D·m], astrology wheel (symbols, no text) [D·m].

Rich witchy [D·r]:
Witch's cottage interior — shelves of books + jars + herbs + cat [B·r],
gothic botanical — black flowers + skeleton leaves + insects [D·r].

Showpiece witchy [B·XL]:
"The Apothecary" — a full shelf scene: crystals, bottles, herbs, books, candles,
skulls, moths, raven, 100+ DMC [B·XL].

---

## 24. Fairies & fantasy — D and B — hoop

Simple [D·s]:
Tiny fairy in silhouette [D·s], fairy mushroom house [D·s],
small fairy door [D·s], fairy footprints [L·s].

Mid fairy [D·m / B·m]:
Fairy sitting on a toadstool [D·m], fairy with botanical wings [D·m],
pixie on a flower [D·m], fairy door in a tree trunk [D·m],
fairy with a lantern [D·m], fairy with a flower crown [D·m],
gnome in a flower garden [D·m], woodland fairy ring [B·m],
fairy hiding under a leaf [D·m], sprite on a mushroom [D·m],
fairy with a dragonfly [D·m], enchanted fairy tree [B·m],
fairy and a snail [D·m], fairy and a hedgehog [D·m],
fairy in a jar (trapped-light style) [D·m].

Rich fairy [D·r]:
Fairy with flowing botanical wings — full wing detail [D·r],
enchanted tree with fairy lights + mushrooms + flowers [B·r].

Showpiece fairy [B·XL]:
"The Fairy Garden" — fairies, toadstools, botanical flowers, insects, lanterns,
dense lush scene, full bleed, 100+ DMC [B·XL].

---

## 25. Cottages, shops & cosy scenes — B (bleed) — none (frameless)

Full-scene bleed compositions; no background to cut.

Mid cosy scenes [B·m]:
Thatched cottage with garden [B·m], stone cottage at dusk [B·m],
bookshop frontage [B·m], bakery window [B·m], flower shop [B·m],
tea shop exterior [B·m], sweet shop [B·m], greenhouse + plants [B·m],
potting shed [B·m], cosy library reading nook [B·m],
cabin in snowy woods [B·m], row of beach huts [B·m],
high street at dusk [B·m], candlelit window at night [B·m],
pub at dusk — warm light, cobblestones [B·m],
post office + market stall [B·m], train station platform [B·m],
village green with pond + ducks [B·m], market flower stall [B·m],
canal boat on a waterway [B·m].

Rich cosy scenes [B·r]:
Thatched cottage in a rose garden — lush floral detail [B·r],
lighthouse keeper's cottage — cliff, sea, wildflowers [B·r],
Christmas cottage at night — fairy lights, snow, robin [B·r],
flower shop interior — buckets of blooms, watering cans [B·r],
kitchen garden in summer — brick walls, espaliered trees, lavender [B·r],
library nook — books, armchair, lamp, tea, cat [B·r].

Showpiece cosy scenes [B·XL]:
English village high street — bookshop, bakery, flower shop, post office,
cat in window, flowers on walls, 100+ DMC [B·XL],
cottage garden in full summer — rose arch, bee, cat, herbs, gate, sky [B·XL],
Christmas market scene — stalls, lights, snow, figures (faceless), pine trees [B·XL],
seaside town panorama — harbour, boats, fish and chip shop, beach huts, sky [B·XL].

---

## 26. Landscapes & seascapes — B (bleed) — none (frameless)

Mid landscapes [B·m]:
Rolling hills with wildflowers [B·m], lavender field [B·m],
cherry orchard in blossom [B·m], wheat field under sky [B·m],
coastal headland [B·m], moorland at dusk [B·m], lake with reflections [B·m],
waterfall in a wood [B·m], Scottish highland vista [B·m],
chalk downs with poppies [B·m], estuary at low tide [B·m],
river meadow in summer [B·m], autumn forest path [B·m],
spring orchard in blossom [B·m].

Rich landscapes [B·r]:
Bluebell wood — path through beech trees, blue floor [B·r],
cliffside sea view — wildflowers + ocean + lighthouse [B·r],
harvest field at golden hour [B·r], snowy highland glen — loch + peaks [B·r],
lake district tarn — fells + reflection + ferns [B·r].

Showpiece landscapes [B·XL]:
"The English Countryside" — patchwork fields + hedgerows + oak + farm [B·XL],
wildflower meadow panorama — from poppy to horizon [B·XL],
highland glen in autumn — red deer + loch + mountain + heather [B·XL].

---

## 27. Animals doing human things — B (bleed) — none (frameless)

Proven by engine (with `detail: true`). Full-scene bleed; the animal IS the scene.
Style: bold, characterful, single accent-colour interior palette per piece.

Simple single-animal single-prop scenes [B·m]:
Otter with a cup of tea [B·m], cat reading a book on an armchair [B·m],
rabbit in a floral dress holding a parasol [B·m], fox sipping wine [B·m],
bear with a jar of honey at a picnic [B·m], hedgehog riding a bicycle [B·m],
dog at a desk writing letters [B·m], cat painting at an easel [B·m],
duck in a raincoat with an umbrella [B·m], badger baking bread [B·m],
panda eating sushi [B·m], corgi doing yoga [B·m], goat playing chess [B·m],
snail at a coffee shop [B·m], frog fishing on a riverbank [B·m],
raccoon as a chef [B·m], bunny at a sewing machine [B·m],
parrot painting its nails [B·m], otter playing guitar [B·m],
cat watering houseplants [B·m].

Rich human-animal scenes (with interior or outdoor setting detail) [B·r]:
Dachshund in heart sunglasses with a glass of rosé + stack of books
(pink-striped backdrop) [B·r], otter in a pink-tiled bathroom holding toilet paper
[B·r], pink octopus draped over a bath in a mint-green plant-filled bathroom [B·r],
dachshund behind a pink cocktail coupe, striped backdrop [B·r],
cat at a Parisian café — espresso + croissant [B·r],
fox in a library reading in an armchair — warm lamplight [B·r],
bear in a cosy kitchen baking a cake [B·r],
rabbit tea party in a garden — table set, wildflowers, three rabbits [B·r],
dog at a pub — pint on the bar, fireplace [B·r],
hedgehog in a potting shed with tools + flowers [B·r],
cat at a craft fair with yarn [B·r],
penguin in a cocktail bar mixing drinks [B·r],
panda at a laptop in a coffee shop [B·r],
goat on a yoga mat in a meadow [B·r].

Showpiece animal-human scenes [B·XL]:
"The Animal Dinner Party" — fox + badger + hare + rabbit + owl around a
candlelit table, full interior, flowers, candelabra, 100+ DMC [B·XL],
"The Cat Café" — five cats + human-scale café interior, plants, cups, shelves [B·XL],
"Animals at the Farmers Market" — hedgehog, rabbit, squirrel, fox at stalls,
lush botanical setting [B·XL].

---

## 28. Fabulous / artistic faces — D — hoop or none

Dramatic fine-art portraits with botanical or insect adornment. Homemade-ORIGINAL
designs only (NOT copies of the reference images). Use `detail: true` + `tameWarm: true`.
Public-domain era subjects or generic stylised figures only — no named modern celebrities,
no protected likenesses.

Simple face vignettes [D·m] (a face is never truly simple — m is the floor):
Watercolour-style profile with a single butterfly [D·m],
face with a single large poppy bloom [D·m], face half-veiled by a fern [D·m],
eyes-only with a butterfly over them [D·m].

Mid portraits [D·r]:
Face with a large red poppy over forehead + eyes (deep skin, blue ground) [D·r],
moody portrait lit blue + red (dramatic, dark) [D·r],
watercolour profile — dragonfly perched on nose [D·r],
face with a full flower crown (roses + blue + orange blooms) [D·r],
B&W fashion face — watercolour butterfly over eyes [D·r],
face emerging from floral foliage [D·r], face with moth wings at temples [D·r],
portrait with cascading wisteria over one side [D·r],
face in profile — cherry blossom falling [D·r],
portrait with botanical veil — fern + floral lacework [D·r],
face with a hummingbird at the ear [D·r], celestial face + star map [D·r].

Rich / showpiece portraits [D·XL]:
Portrait with an entire botanical garden growing from the hair — full floral
explosion, 100+ DMC [D·XL],
Art Nouveau beauty — oval face framed by swirling botanical borders [D·XL],
face half-concealed by an enormous moonflower bloom [D·XL].

---

## 29. Pop-art & fashion portraits (PD / original) — D — none (frameless)

Two streams: (A) PD fine-art masterpieces reinterpreted in needle-painting; (B) generic
fashion / glamour figures in a bold graphic style. NEVER a named modern celebrity or their
protected likeness. "1950s glamour in pearls" = safe. "Audrey Hepburn" = not safe.
Use `tameWarm: true` for warm skin tones.

Stream A — PD fine-art masterpieces (pre-1930, licence-verified, reference + redraw only):
Starry Night (Van Gogh) reinterpreted [D·r],
The Kiss (Klimt) — gold-leaf textile abstraction [D·r],
Girl with a Pearl Earring (Vermeer) [D·r],
The Great Wave (Hokusai) [D·r],
Water Lilies (Monet) — loose impressionist [D·r],
Sunflowers (Van Gogh) [D·r],
Birth of Venus (Botticelli — detail crop) [D·r],
The Scream (Munch) — bold colour, graphic [D·r],
Almond Blossom (Van Gogh) [D·r],
Klimt botanical panel — gold + jewel tones [D·r],
Mucha decorative panel — Art Nouveau botanical border [D·r],
Hokusai flower studies [D·r],
American Gothic (Wood) [D·m],
Whistler's Mother (Whistler) — grey tones [D·m].

[All of the above: verify PD licence before each batch; reference + redraw per our
style; never reproduce a scan; minimum 130 DMC colours for dense ones.]

Stream B — original fashion / glamour figures (bold, graphic, pop-art flavour):
1950s glamour in pearls — blowing a bubblegum bubble [D·m],
1960s mod fashion — geometric print dress, graphic [D·m],
Art Nouveau beauty in a floral bower [D·r],
Edwardian hat and veil portrait [D·r],
1920s flapper portrait — bob + pearls [D·m],
Hollywood golden-age glam — fur stole + diamonds [D·r],
fashion figure with bold botanical print [D·r],
graphic pop-art woman — Warhol-flavour colour blocks [D·m],
suffragette portrait — purple + white + green palette [D·r],
Victorian dress with botanical print fabric [D·r].

Showpiece art icons [D·XL]:
Starry Night reinterpretation — full sky, swirling stitch field, 100+ DMC [D·XL],
The Great Wave — breaking wave + sea + sky, dense long-and-short [D·XL],
Klimt embrace — intricate textile pattern on clothing, gold tones [D·XL].

---

## 30. Nursery & baby — D and L — hoop

Audience: baby/nursery. Personalisation (name hoops) is premium.

Simple [D·s / L·s]:
Sleepy moon + stars [L·s], simple cloud [L·s], small elephant [D·s],
baby bunny [D·s], tiny bear [D·s], little duck [D·s], small star [L·s].

Mid nursery [D·m / L·m]:
Sleepy moon face + stars + clouds [D·m], elephant with star [D·m],
baby bunny with flowers [D·m], teddy bear with a balloon [D·m],
fawn in a meadow [D·m], baby owl in a hole [D·m], lamb + daisy [D·m],
hot-air balloon with animals [D·m], rainbow + cloud [D·m],
mobile-style hanging animals (elephant + bunny + bear + duck) [D·m],
woodland animals ring (nursery edition) [D·m], tiny boat on a pond [D·m],
counting motifs — one apple, two bees (image only) [D·m],
alphabet-animal motifs — A is for bear (image only) [D·m],
little giraffe + balloon [D·m].

Rich nursery [D·r]:
Enchanted nursery — moon, stars, sleeping animals, botanical frame [D·r],
"Under the Rainbow" — full arch + clouds + animals + flowers [D·r].

Showpiece nursery [D·XL]:
"The Dream" — sleeping baby animals in a botanical garden, moon + stars + flowers
+ butterflies, soft palette, 100+ DMC [D·XL].

---

## 31. Heritage PD reinterpretations — D and L — hoop

Reinterpret pre-1930 embroidery and botanical design sources in the modern look bar.
Reference + redraw per our licence policy; never scan-reproduce. Sources: Dillmont/DMC
encyclopaedias, Vere Foster flower studies, Mucha panels, Art Nouveau textile prints,
Victorian botanical plates, Broderie Anglaise traditions.

Simple heritage singles [L·s / D·s]:
Art Nouveau single leaf [L·s], Dillmont border motif [L·s],
Victorian rose (single) [D·s], Broderie Anglaise eyelet daisy [L·s].

Mid heritage [D·m / L·m]:
Art Nouveau rose — broad petal, Dillmont planche style [D·m],
Naturalistic wild-rose (Vere Foster style) [D·m],
Columbine in Vere Foster style [D·m],
Campanula bell in Vere Foster style [D·m],
Victorian pansy [D·m], Art Nouveau iris panel [D·m],
Dillmont carnation [D·m], Jacobean tree of life (branch crop) [D·m],
Crewelwork floral vine (branch + acorn + flower) [D·m],
Hardanger whitework panel recoloured [L·m],
Art Nouveau poppy with stylised swirl stem [D·m],
Hungarian folk-art floral (tulip + rose) [D·m],
Scandinavian floral folk motif [D·m], Japanese mon crest (botanical) [D·m].

Rich heritage [D·r]:
Wild-rose spray — two blooms + bud + serrated leaves, naturalistic, 60+ DMC [D·r],
Mucha decorative panel — full Art Nouveau border composition [D·r],
Jacobean tree of life — branch + multiple flowers + birds + leaves [D·r],
Victorian botanical specimen plate — four flowers in scientific-illustration style [D·r].

Showpiece heritage [D·XL]:
William Morris–inspired floral tile — dense repeating botanical in jewel tones [D·XL],
Grand crewelwork tree of life — full branch + insects + birds + blossoms + leaves [D·XL].

---

## SPECIALIST APPENDIX (deferred — dedicated sessions only)

- **S1 Word art / affirmations** (`SPEC:word`) — kind phrases, home/family, seasonal
  greetings, feminist, wellness mantras, "made with love" sentiments. Needs a
  specialist lettering approach (the engine renders stitches, not type).
- **S2 Maps with landmarks** (`SPEC:map`) — Britain, world, county/city maps —
  landmarks at real locations.
- **S3 Alphabet & stitch samplers** (`SPEC:sampler`) — traditional + modern samplers,
  birth/wedding record templates.

---

*Total subjects across all themes: ~1,530. Living document — extend theme sections as
gaps are found or new categories are requested. Never delete a theme.*
