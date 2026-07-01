# Cross-stitch SUBJECT master list (the "big list")

The canonical list of **what** the cross-stitch collection should contain — the full
repo of subjects customers expect, so we can build the biggest, best collection in
the world and work through it methodically.

- **This file = WHAT.** The breadth of subjects.
- **The north star = HOW.** `apps/web/src/lib/studio/generation/NORTH_STAR.md` +
  memory `feedback_cross_stitch_world_class_bar` govern the quality bar, the look,
  size/shape variety, the colour treatment and the ruthless gate.

Rebuilt 2026-06-29 after the original (researched from online cross-stitch sources,
several thousand subjects) was lost. This is a **living document** — a strong v1
backbone to grow toward full coverage. Add subjects as we find gaps; never delete a
theme customers expect.

## How to use

1. Work a theme at a time, drawing subjects into generation batches (`scripts/xs-volume-gen.ts`).
2. Every batch must still obey the north star: vivid colour fix, size+shape variety,
   ruthless full-size gate, gems only.
3. Update the **Status** column as themes are generated / gated / published.

---

## THE SYSTEM — the exact steps every worker follows (DO NOT SKIP)

The HOW lives in `apps/web/src/lib/studio/generation/NORTH_STAR.md` (quality bar, the
proven colour fix, the gate checklist, the specialist carve-outs). This is the operating
procedure. Following it exactly is what stops the regressions we hit building it.

**The loop, per theme:**

1. **Brief.** Add briefs to `BRIEFS` in `apps/web/scripts/xs-volume-gen.ts`. Vary
   SIZE + ASPECT + SHAPE to the design (small character → big showpiece; square/wide/
   tall/circular). Pick the right `style` key; busy/detailed subjects must be BIG or
   detail turns to mush. New style? add it to `STYLE` + `SRC_SAT`.
2. **Generate**, max 2 batches at a time, from the WORKTREE:
   `cd apps/web && npx tsx scripts/xs-volume-gen.ts --batch X`. The colour fix is
   automatic (per-lane source pre-saturation + ivory aida `#FCFAF6` + post-saturation).
   **Do NOT touch the shared renderer** — the fix is self-contained in the scripts.
3. **GATE — ruthlessly, FULL-SIZE, every single render.** This is the step that gets
   skipped and must not be. Open each render at full resolution (not a thumbnail tile,
   not a skim). Reject anything that fails:
   - **Anatomy** — faces: forehead present, both eyes, correct proportions; animals:
     correct features/snout/eyes; no floating objects, no extra limbs.
   - **No gibberish text** — the converter can't render lettering; avoid readable
     signage/words (those are the SPECIAL word-art track).
   - **Crisp + vivid + best-seller bar** — would a customer buy and hang it? Compare to
     the north-star refs.
   - **Original** — NEVER a near-copy of a competitor's specific design (e.g. diy-artclub /
     Caterpillar pieces are STYLE references only; copying a specific one is an IP breach
     and must be pulled).
   Re-roll fixable fails (`--regen <slug>` re-rolls Flux); cull the rest.
4. **Approve.** Write `approved.json` = `[{slug,name,sub,subName}]` for the gems only,
   mapped to the right shelf.
5. **Enrich + publish** from the MAIN checkout (the worktree can't resolve `@homemade/db`):
   `npx tsx scripts/xs-enrich.ts approved.json approved-full.json` (from worktree), then
   `XS_VOL_DIR=<worktree>/.loom-scratch/needlework/volume npx tsx scripts/xs-volume-publish.ts approved-full.json`
   (from main checkout). Publishes PUBLIC + thumbnail + search-sync. Idempotent on slug.
6. **Fill the shelf to ~40+** before moving on — Rebecca wants the categories really full.
7. **Cull tool** for reversible takedowns: `scripts/xs-cull.ts` sets PRIVATE + drops
   from search, with a manifest. NEVER hard-delete. Review helpers:
   `xs-thumbs.ts` (download live thumbnails), `xs-sheet.ts` / `xs-tile-dir.ts` (build
   contact sheets — but still gate FULL-SIZE), `xs-upload-sheet.ts` (push a sheet to R2
   to view), `xs-inventory.ts` (catalogue counts), `xs-default-view.ts` (the default
   browse surface). Run all of these from the MAIN checkout.

**Tooling gotchas (each one cost a debugging cycle):**
- Run DB/publish scripts from the MAIN checkout; generate from the worktree.
- Every new build-time script MUST be in `apps/web/tsconfig.json` `exclude` **and** be
  ESLint-clean (no unused vars — `'X' is assigned but never used` FAILS the deploy lint).
- Deploy verify after any push to main: `gh run watch` to green, then `/healthz` = 200
  (see CLAUDE.md). Concurrent workers' pushes can cancel your run — watch the latest.

**Reserved SPECIALIST categories — do NOT generic-generate** (own dedicated sessions, see
memory `project_cross_stitch_specialist_types`): word-art/quotes (SPEC:word), maps
(SPEC:map), outline-filled-with-icons (SPEC:fill), famous-PAINTING replications
(SPEC:painting), alphabet/samplers (SPEC:sampler). Reference examples committed at
`apps/web/src/lib/studio/generation/north-star-refs/`.

### Route legend (from the north star)

- **GEN** — generic generation works (Flux → convert → gate). The default.
- **SPEC:type** — a SPECIALIST session, NOT generic generation (they failed the bar):
  - `SPEC:word` — lettering / quotes / affirmations (converter can't render clean text)
  - `SPEC:map` — maps with location-accurate landmarks
  - `SPEC:fill` — a silhouette filled with a curated themed icon set
  - `SPEC:painting` — famous-painting replications (dense painterly → converter mushes;
    same hard tier as a Paris-café oil)
  - `SPEC:sampler` — alphabet/stitch samplers
  See memory `project_cross_stitch_specialist_types`.

### Shape / size tags

Shapes: `sq` square · `wide` · `tall` · `circ` circular wreath/hoop · `big` large showpiece.
Sizes: `S` (~110) · `M` (~150) · `L` (~190) · `XL` (~220+). Match to detail needs.

### Status

`todo` · `gen` (generated, awaiting gate) · `live` (published) · `deferred` (specialist, later).

**2026-06-30 — Batch M shipped 24 gate-passed gems** (30 generated, 24 passed the full-size
gate): pop art (4) + fine-art faces (5, skin tones deep→fair), fairies/fantasy (5 — new
**Fantasy & Fairytale** shelf: dragon, unicorn, mermaid, fairy ring, big fairy garden),
animals-as-humans (4 whimsical scenes), cute small (2), beautiful florals (3), and 2 big
78-colour dense showpieces. Deliberate complexity RANGE: 14 → 78 colours, 110 → 260 cells.
NOTE: the converter caps the floss palette at ~78 (shared `photoToPatternData` `Math.min(colours, 96)`
→ ~78 after CIELAB floss-merge), so true 100+ colour pieces need a considered cap lift + re-gate
(follow-up, not done here — don't touch the shared converter mid-batch).

**2026-07-01 — Batch N shipped 28 gate-passed gems** (31 generated, 3 culled: bat-moon muddy, and
2 fabulous-faces — poppy-brown + bluebird-tan — whose `artface` skin came out harshly orange/patchy
and would NOT converge on a re-roll). Six needed a repair re-roll; 4 were saved (pop-art bobble-hat,
face orchid-deep, face rose-darkbrown, otter-painter). Deliberate complexity RANGE 11 → 126 colours:
small/simple cuties (chick, hedgehog+heart, axolotl, frog-prince, baby dragon; 11–14 col) → medium
(toadstool cottage, galaxy unicorn, phoenix, mermaid, 5 pop-art portraits, 3 fabulous faces deep→fair,
2 florals, blossom wreath) → large whimsical scenes (bookshop cat, fox's tea, hedgehog greenhouse, the
little postman, otter artist) → **HUGE dense 100+ tier on Flux 1.1 Pro** (flower-market 126, secret-garden
114, fairy-treehouse 96, cottage-kitchen 93). Shelves: portraits +8, fantasy +6, whimsical +5, animals
+4, floral +3, scenes +1, home-cosy +1 (first Home & cosy piece). **537 → 601 PUBLIC** (573 pre-batch;
grew via other work between M and N). PIPELINE NOTE: `xs-volume-publish.ts` is now DENSE-AWARE — for
`colours > 96` briefs it reads `<slug>.flux-pro.png` and converts with `maxColours` + `flossRange:'full'`
+ `confettiMin:'high'`, mirroring the gen script's dense branch, so a dense showpiece publishes at its
full 100+ floss count in ONE path (no separate pro-emit/upgrade step needed for NEW rows). Deploy green
+ /healthz 200.

---

## PROGRESS TABLE

| # | Theme | Route | Shapes | Status |
|---|-------|-------|--------|--------|
| 1 | Cute animals & pets | GEN | sq/circ | gen (A–E) |
| 1b | Dog breed portraits (realistic) | GEN | sq | todo — HIGH DEMAND |
| 1c | Cat breed portraits (realistic) | GEN | sq | todo |
| 2 | Woodland & wildlife | GEN | sq/tall | gen (A–E) |
| 3 | Farm & smallholding | GEN | sq | todo |
| 4 | Birds, bees, butterflies & moths | GEN | sq/circ | partial |
| 5 | Sea life & coastal | GEN | sq/wide | partial (B,D) |
| 6 | Cute fantasy creatures | GEN | sq/big | live (M, N — Fantasy & Fairytale shelf now 11: +dragon/unicorn/phoenix/mermaid/toadstool cottage/fairy treehouse) |
| 7 | Florals & bouquets | GEN | sq/circ | gen (A–C) |
| 8 | Single botanical stems | GEN | tall | gen (A,C,D) |
| 9 | Wreaths & circular | GEN | circ | gen (A,C,D) |
| 10 | Houseplants & terrariums | GEN | sq | partial (D) |
| 11 | Mushrooms & cottagecore | GEN | sq | todo |
| 12 | Food, drink & baking | GEN | sq | gen (C) |
| 13 | Seasonal — Halloween | GEN | sq | partial |
| 14 | Seasonal — Christmas & winter | GEN | sq/big | partial |
| 15 | Seasonal — Easter & spring | GEN | sq | partial |
| 16 | Seasonal — Autumn / harvest | GEN | sq/circ | partial |
| 17 | Seasonal — Valentine's | GEN | sq/circ | todo |
| 18 | Celestial & constellations | GEN (zodiac symbols) / SPEC:word (zodiac names) | sq/tall | todo |
| 19 | Witchy & gothic | GEN | sq/tall | todo |
| 20 | Cottages, shops & cosy scenes | GEN | big | gen (A,B,C,D) |
| 21 | Landmarks & landscapes | GEN | wide/sq | (kept from cull) |
| 22 | Transport & vehicles | GEN | sq/wide | partial (D) |
| 23 | Hobbies & makers | GEN | sq | todo |
| 24 | Fun / quirky / funny | GEN | sq | gen (E) |
| 25 | Nursery & baby | GEN | sq | todo (audience: baby) |
| 26 | Heritage Delft / blackwork / redwork | GEN | sq | (kept from cull) |
| S1 | Word art / quotes / affirmations | SPEC:word | tall/sq | deferred |
| S2 | Famous-painting replications | SPEC:painting | sq | deferred |
| S3 | Maps with landmarks | SPEC:map | wide/tall | deferred |
| S4 | Outline-filled-with-icons | SPEC:fill | sq/tall | deferred |
| S5 | Alphabet & stitch samplers | SPEC:sampler | sq | deferred |

---

## 1. Cute animals & pets — GEN
Cats: tabby, black cat, ginger cat, tuxedo, kitten with yarn, cat loaf, sleeping cat,
cat in a teacup, Siamese, Persian, calico, cat on a windowsill, cat in a plant pot.
Dogs: corgi, dachshund, pug, golden retriever, dalmatian, beagle, husky, French bulldog,
poodle, spaniel, shiba, sausage dog in a jumper, puppy in a basket.
Small pets: rabbit/bunny, guinea pig, hamster with full cheeks, gerbil, chinchilla,
ferret, budgie, parrot, goldfish, tortoise, hedgehog (pet).
Poses/props: with a flower, with a scarf, in a teacup, peeking, sleeping, with a ball
of yarn, with a tiny hat, in a basket, with a butterfly.

## 1b. Dog breed portraits (realistic) — GEN — HIGH DEMAND
People are devoted to their own breed and will buy the one that's *theirs* — make this
shelf deep. **Realistic but CLEAN-ILLUSTRATION portraits** (a crisp detailed head/shoulders
portrait per breed — NOT photographic/painterly, which the converter mushes; flat-but-detailed
like the pop-art/scene lanes that convert well). One portrait per breed, ideally on a soft
plain ground so the dog is the hero. Cover the popular breeds (UK-weighted), incl. coat
variants where they matter (e.g. Labrador black/yellow/chocolate; Dachshund smooth/long/wire):
Labrador, Golden Retriever, German Shepherd, French Bulldog, English Bulldog, Cockapoo,
Cavapoo, Cavalier King Charles Spaniel, Cocker Spaniel, Springer Spaniel, Dachshund, Border
Collie, Labradoodle, Pug, Shih Tzu, Yorkshire Terrier, Jack Russell, Staffordshire Bull
Terrier, Boxer, Rottweiler, Husky, Corgi, Chihuahua, Pomeranian, Border Terrier, West
Highland Terrier (Westie), Scottish Terrier, Bichon Frise, Maltese, Miniature Schnauzer,
Whippet, Greyhound, Italian Greyhound, Lurcher, Beagle, Basset Hound, Dalmatian, Great Dane,
Bernese Mountain Dog, Newfoundland, Saint Bernard, Doberman, Vizsla, Weimaraner, Pointer,
English/Irish Setter, Akita, Shiba Inu, Samoyed, Chow Chow, Australian Shepherd, Bullmastiff,
Rhodesian Ridgeback, Poodle (standard/toy), Sausage-dog-in-jumper crossover stays in Whimsical.
(Build first wave ~30 most-popular, then extend. Same hero-portrait treatment will suit cats — see 1c.)

## 1c. Cat breed portraits (realistic) — GEN
Same clean-portrait treatment for cats: British Shorthair, Maine Coon, Ragdoll, Siamese,
Bengal, Persian, Sphynx, Norwegian Forest, Russian Blue, Tabby, Tuxedo, Tortoiseshell,
Ginger, Scottish Fold, Birman, Burmese, Abyssinian, Devon Rex.

## 2. Woodland & wildlife — GEN
Fox (curled, standing, with cubs), red squirrel, hedgehog, badger, deer/fawn/stag,
rabbit/hare, owl (barn, tawny, snowy), mouse, dormouse, wolf, bear/cub, raccoon,
otter, beaver, mole, stoat, pine marten, woodpecker, robin, wren, kingfisher.
Scenes: woodland clearing, toadstool ring, burrow cross-section, misty forest at dawn.

## 3. Farm & smallholding — GEN
Highland cow, dairy cow, sheep, lamb, pig/piglet, goat/kid, chicken/hen, rooster,
chick, duck/duckling, goose, turkey, donkey, horse/pony, shire horse, alpaca, llama,
sheepdog, barn cat, beehive, tractor, hay bales, vegetable patch, allotment.

## 4. Birds, bees, butterflies & moths — GEN
Garden birds: robin, blue tit, goldfinch, wren, bullfinch, chaffinch, blackbird,
swallow, kingfisher, puffin, owl, hummingbird.
Pollinators: bumblebee, honeybee + hive, ladybird, butterfly (red admiral, peacock,
monarch, blue morpho), luna moth, atlas moth, dragonfly, beetle.
Forms: single specimen study, a ring/wreath of butterflies, a bird on a blossom branch.

## 5. Sea life & coastal — GEN
Whale, narwhal, dolphin, seal pup, otter, octopus, crab, lobster, seahorse, jellyfish,
starfish, clownfish, turtle, puffin, seagull, axolotl (cute), koi.
Coastal: lighthouse, sailboat, beach huts, shells, anchor, rockpool, harbour, pier,
deckchairs, ice-cream van, fishing boat.

## 6. Cute fantasy creatures — GEN
Dragon (cute), unicorn, mermaid, narwhal, axolotl, phoenix, griffin, fairy, gnome,
pixie, sea-serpent, baby kraken, jackalope, dinosaur (cute), loch-ness. Generic only,
never a named franchise character.

## 7. Florals & bouquets — GEN
Bouquets: mixed wildflower posy, peonies, roses, sunflowers, tulips, daffodils,
ranunculus, dahlias, anemones, sweet peas, cottage-garden jug, dried-flower bunch.
Single blooms: poppy, rose, hibiscus, hydrangea, magnolia, lotus, iris, pansy.
Arrangements: flowers in a vase/jug/jam-jar/watering-can/teapot/wellington boot.

## 8. Single botanical stems (tall) — GEN
Foxglove, delphinium, lupin, hollyhock, snapdragon, gladiolus, lavender stem,
wheat, fern frond, eucalyptus sprig, sweet pea climber, honesty, allium, teasel.
Pressed-flower style single studies with a handwritten-look label (no real text).

## 9. Wreaths & circular — GEN
Spring (tulip/daffodil/blossom), summer (daisy/cornflower/poppy), autumn (leaves/
rosehips/acorns/mini pumpkins), winter (pine/holly/berries/pinecones), lavender,
eucalyptus, herb, wildflower, birth-month-flower, heart-shaped floral, citrus,
butterfly ring, woodland-animal ring.

## 10. Houseplants & terrariums — GEN
Monstera, fiddle-leaf fig, snake plant, pothos, string of pearls, cheese plant,
cacti trio, succulent shelf, terrarium dome, hanging planter, herb pots on a sill,
prayer plant, calathea, aloe, watering can with plants.

## 11. Mushrooms & cottagecore — GEN
Fly agaric/toadstool, mushroom cluster, foraging basket, snail on a toadstool,
frog under a mushroom, cottagecore still-life (jam, bread, eggs, gingham), mushroom
ring, woodland foraging scene, hedgehog under a toadstool, fairy-tale mushroom house.

## 12. Food, drink & baking — GEN
Bakes: cupcake, layer cake slice, Victoria sponge, macarons, gingerbread person,
doughnut, croissant, cookies, Bundt cake, Battenberg, cherry bakewell, scone + jam.
Drinks: teapot + cup, cafetiere, latte art, hot cocoa with marshmallows, cocktail
(non-branded), milkshake, bubble tea, lemonade.
Fruit/veg: lemon, strawberry, cherries, watermelon slice, pear, fig, pumpkin,
tomato-on-the-vine, chilli, mushroom, peapod. Jars of jam/honey/pickles.

## 13. Seasonal — Halloween — GEN
Black cat + pumpkin, friendly ghost, jack-o-lantern trio, witch's cat in a hat,
haunted-but-cute cottage, bats over a moon, candy corn, cauldron, spider on a web,
owl on a broomstick, skeleton (cute), potion bottles, toffee apples.

## 14. Seasonal — Christmas & winter — GEN
Robin on holly, snowman, gingerbread house, nutcracker, decorated tree, stocking,
wreath, reindeer, penguin in a scarf, cocoa + fairy lights, snowy cottage, sleigh,
candy cane, baubles, fox/hare in snow, ice skates, mince pies, Nordic folk reindeer.

## 15. Seasonal — Easter & spring — GEN
Easter bunny + basket, chick hatching, painted eggs, spring lambs, blossom branch,
daffodil bunch, duckling, nest with eggs, hot-cross-bun, spring wreath, bluebell wood.

## 16. Seasonal — Autumn / harvest — GEN
Squirrel + acorns, conkers, autumn leaves, pumpkins on a cart, harvest basket,
hedgehog + apple, toadstools, woolly-jumper flat-lay, hot apple cider, scarecrow,
wheat sheaf, foggy-morning field.

## 17. Seasonal — Valentine's — GEN
Heart wreath, lovebirds on a branch, two hares, hot-air balloon of hearts, posy of
red roses, cupid mouse, "love" in flowers (image not text), pair of swans, heart jar.

## 18. Celestial & constellations — GEN (symbols) / SPEC:word (names)
Moon phases strip, sun + moon face, crescent moon + stars, starry night sky, comet,
planets row, constellation dot-maps (generic), star-sign SYMBOL glyphs (♈–♓ as motifs),
zodiac-animal illustrations (ram, bull, crab, lion, fish — GEN), tarot-flavour sun/moon.
NOTE: zodiac with the sign's NAME or descriptive text → SPEC:word.

## 19. Witchy & gothic — GEN
Crescent moon + botanicals, black cat + crystals, potion shelf, crystal cluster,
moth + moon, mystic hand, tarot-card-style sun, mushroom + moon, raven, apothecary
bottles, pressed nightshade, gothic rose, spellbook (no readable text), ouija-flavour.

## 20. Cottages, shops & cosy scenes (showpieces) — GEN
Cottage with thatched roof + garden, bookshop, bakery, flower shop, tea shop, sweet
shop, greenhouse, potting shed, cosy library/reading nook, cabin in the woods, beach-
hut row, high street, candlelit window, pub, post office, train station, lighthouse
keeper's cottage, snowy Christmas cottage, garden arch + bench, flower cart.

## 21. Landmarks & landscapes — GEN (kept from cull — already live)
Mid-century travel posters: mountains, lakes, coast, lavender fields, wheat fields,
cherry orchards, city landmarks (Eiffel, Big Ben, Colosseum, Santorini, Venice,
NY skyline), gardens, national parks. (167 already PUBLIC; extend sparingly, de-dupe.)

## 22. Transport & vehicles — GEN
Hot air balloon, sailboat, narrowboat/canal boat, vintage car, camper van, bicycle
with basket, red bus, steam train, tram, biplane, lighthouse + boat, tractor, scooter,
rowing boat, ice-cream van.

## 23. Hobbies & makers — GEN
Knitting basket + yarn, sewing machine, cross-stitch hoop (meta), gardening tools +
trug, books stack, tea + book, paint palette, camera, bicycle, baking flat-lay,
plant shelf, music (guitar, piano, vinyl), travel suitcase + map (no text), chess.

## 24. Fun / quirky / funny — GEN
Tiger in a bubble bath, sloth doing yoga, capybara in a hot spring, pug on a
sunlounger, dachshund in a hotdog bun, cat in a wizard hat, frog in a top hat sipping
tea, pigeon nicking a chip, cat shaped like a loaf, highland cow with fringe over eyes,
corgi superhero, hedgehog on a skateboard, panda slurping noodles, flamingo yoga,
guinea-pig king, axolotl with a cupcake, snail with a cottage shell, llama party,
goat on a trampoline, duck on a pool lilo, raccoon bandit, cat in a shark costume.

## 25. Nursery & baby — GEN (audience: baby; personalisation premium)
Sleepy moon + stars, baby animals (elephant, bunny, bear, fawn, lamb), hot-air-balloon
nursery, woodland-friends ring, alphabet-animal motifs (image not lettered), rainbow,
cloud + raindrops, little boat, counting motifs (image), mobile-style hanging animals.

## 26. Heritage Delft / blackwork / redwork — GEN (kept from cull — already live)
Delft-blue tiles (swan, windmill, peacock, cottage, ship, botanical), blackwork
(oak, rose, thistle, owl, deer, geometric), redwork (rooster, hen, botanical, sampler-
motif). Single-hue, crisp. (129 already PUBLIC; extend with fresh motifs, de-dupe.)

---

## SPECIALIST APPENDIX (deferred — own dedicated sessions, see memory)

- **S1 Word art / quotes / affirmations** (`SPEC:word`) — kind phrases, home/family,
  punny food/drink, seasonal greetings, milestone/wedding, feminist, mantras. Needs
  charted lettering (our converter can't render text). Reference: Caterpillar
  "Positivity Lifts" (north-star-refs/typographic).
- **S2 Famous-painting replications** (`SPEC:painting`) — Starry Night, The Kiss,
  Girl with a Pearl Earring, The Great Wave, Sunflowers, Mona Lisa, Water Lilies,
  American Gothic, The Scream, Birth of Venus, Hokusai, Klimt, Monet, Van Gogh.
  PD-eligible; dense painterly → needs a specialist conversion (current converter
  mushes them). Verify licence; redraw, never republish a scan.
- **S3 Maps with landmarks** (`SPEC:map`) — Great Britain, world, county/city maps,
  national parks, coastlines — landmarks pinned to REAL locations.
- **S4 Outline-filled-with-icons** (`SPEC:fill`) — animal/heart/tree/pumpkin/county
  silhouettes filled with a curated themed icon set (Caterpillar's signature device).
- **S5 Alphabet & stitch samplers** (`SPEC:sampler`) — traditional + modern samplers,
  birth-record/wedding-record templates, band samplers, stitch-library showcases.
