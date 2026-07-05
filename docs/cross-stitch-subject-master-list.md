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

**2026-07-01 — Batch O shipped 28 gate-passed gems** (31 generated, 3 culled). Complexity RANGE 13 → 113
colours: small/simple cuties (owlet-moon, narwhal-star, piglet-daisy, baby-dragon+cupcake; 13–18 col) →
medium (fairy+lantern, toadstool village, dragon+castle, mermaid treasure, pegasus, 5 pop-art portraits,
2 fabulous faces — tulip-darkbrown + cherry-fair, peony vase, autumn wreath) → large whimsical scenes
(noodle-chef cat, hare violinist, teashop mouse, professor owl, pig gardener) → **HUGE dense 100+ tier on
Flux 1.1 Pro** (cat café 106, enchanted library 98, seaside town 110, butterfly garden 113 — all published
at full floss via the dense-aware path). Shelves: portraits +6, fantasy +7, whimsical +6, animals +3,
floral +3, scenes +1. **3 culls, all the known `artface` deep/tan-skin failure or grey-fur confetti:**
kitten-teacup (red confetti round both eyes, didn't converge), sunflower-deep (skin went garish
orange/magenta patchwork), lavender-tan (skin went flat orange despite explicit "not orange"). 5 of the 8
repair re-rolls SAVED (piglet-daisy, baby-dragon→switched to `cute` style for a clean white ground,
fairy-lantern brightened, toadstool village brightened, holly-pale with robin moved off the face).
CONFIRMED PATTERN: `artface` renders **fair/pale skin clean** (holly-pale, cherry-fair, tulip-darkbrown all
passed) but **deep/tan skin will not converge** (orange/magenta patchwork) — for deep-skin faces prefer the
`popart` lane, which is reliable across skin tones. **601 → 629 PUBLIC.** Deploy green + /healthz 200.

**2026-07-01 — Batch P shipped 28 gate-passed gems** (31 generated, 3 culled). Complexity RANGE 12 → 106
colours: small/simple cuties (penguin-scarf, panda-bamboo, bunny-carrot, fox-cub-leaf, lamb-bow; 13–15 col)
→ medium (wizard-cat, genie-lamp, unicorn-rainbow, snow-queen, 4 pop-art portraits, 3 fabulous faces
rose/poppy/daisy, hummingbird, 2 florals + lavender wreath) → large whimsical scenes (rabbit baker, bear
fisherman, frog banjo, badger gardener) → **HUGE dense 100+ tier on Flux 1.1 Pro** (christmas-village 101,
japanese-garden 101, coral-reef 106, cosy-bookshop 100 — all at full floss via the dense-aware path).
Shelves: portraits +7, animals +6, fantasy +4, whimsical +4, floral +3, scenes +4. 3 culls: hijab-emerald
(residual orange face patches + muddy eyes after one repair), fairy-toadstool (blank green-orb eyes + odd
mouth wouldn't converge), squirrel-artist (red-brown fur cooked to a flat magenta blob by the `scene` lane's
1.3 saturation). **KEY FIX THIS BATCH — per-brief `sat` override:** the deep/tan-skin over-cook diagnosed in
Batch O turned out to be the *compound saturation boost* (per-lane `SRC_SAT` pre-saturation × the `×1.3`
post-render modulate ≈ 1.6× total), not a Flux limit. Added an optional `sat` field to `Brief`/`B()` in
`xs-volume-gen.ts` (line ~33) that, when set, is used for BOTH the pre-saturation AND forces the post-render
modulate to 1.0 (line ~545/556) — a clean, contained bypass of the double boost that does NOT touch the shared
`photoToPatternData` converter. `xs-enrich.ts` now emits `srcSat = b.sat ?? SRC_SAT[style]` and
`postSat = b.sat != null ? 1 : 1.3`; `xs-volume-publish.ts` reads `a.postSat ?? POST_SAT`. **VALIDATED:**
afro-gold re-rolled at `sat:1.1` now renders correct warm dark-brown skin — **deep-skin portraits are now
shippable.** rose-fair + poppy-fair at `sat:1.0` render clean fair skin with no orange streaking. Residual
lesson: `sat` fixes the *base* skin tone; it does NOT remove orange patches baked into the Flux render itself
(hijab-emerald still had them), and it doesn't help red-furred animals in the `scene` lane (squirrel-artist).
**629 → 657 PUBLIC.** Deploy green + /healthz 200.

**2026-07-01 — Batch Q shipped 30 gate-passed gems** (31 generated, 1 culled). RANGE 11 → 120 colours:
simple cuties (otter-shell, duckling-umbrella, kitten-yarn, hedgehog-mushroom, seal-pup, kingfisher; 11–21 col)
→ fantasy (mermaid-pearl, baby-dragon, witch-cauldron, phoenix) → 5 pop-art portraits + 3 fabulous faces
(sunflower/wisteria/holly, fair) → whimsical animal scenes (hedgehog-tea, otter-boat, owl-librarian,
mole-tailor, tortoise-postman) → florals → **4 dense 100+ Flux-1.1-Pro showpieces** (autumn-market 96,
fairy-village 97, venice-canal 120, tropical-jungle 109). Shelves: portraits +8, animals +6, fantasy +5,
whimsical +5, floral +3, scenes +3. **DEEP-SKIN FIX HELD ON FRESH SUBJECTS:** popart locs-teal + headwrap-orange
at `sat:1.1` both rendered correct rich dark-brown skin first try — the per-brief `sat` override is now the
standard tool for deep-skin portraits. 2 re-rolls needed: fairy-lantern (came back FLAT/1-colour — a dead Flux
render — re-rolled brighter but the wood stayed muddy grey + the lantern never appeared, so CULLED) and
sunflower-fair (`artface` face first came out gaunt/grey-shadowed; a "bright even frontal daylight, minimal
shadow, whole forehead visible" re-roll fixed it → kept). LANE NOTE reconfirmed: keep red/orange-furred animals
OUT of the high-sat `scene` lane; chose brown/grey/green animals (hedgehog, otter, owl, mole, tortoise) and all
5 scenes passed clean. **657 → 687 PUBLIC.** Deploy green + /healthz 200.

**2026-07-01 — Batch R shipped 30 gate-passed gems** (31 generated, 1 culled). RANGE 10 → 104 colours:
simple cuties (red-panda, baby-elephant, pug-puppy, chick-egg, baby-turtle, robin; 10–19 col) → fantasy
(unicorn-foal, dragon-treasure, fairy-ring, wizard-owl, snow-fox) → 4 pop-art portraits + 3 fabulous faces
(cherry/autumn/lily, fair) → whimsical animal scenes (cat-baker, sheep-knitter, penguin-skater, panda-chef,
duck-sailor) → florals → **4 dense 100+ Flux-1.1-Pro showpieces** (fairytale-castle 104, cherry-festival 94,
christmas-parlour 100, mermaid-kingdom 104). Shelves: portraits +7, animals +6, fantasy +6, whimsical +5,
floral +3, scenes +3. Deep-skin `sat:1.1` popart held again (turban-man, braids-blue — correct rich brown
first try). Same two recurring re-roll modes as Batch Q: one popart came back FLAT/dead-Flux (updo-elegant —
re-rolled but the eyes came out odd/wall-eyed + crop tight, so CULLED; 2 clean deep-skin portraits already in
the batch) and one `artface` face came out gaunt/grey-shadowed (autumn-pale — the darker autumn palette pulls
the lane toward heavy contouring; a "bright FLAT even studio lighting, NO grey contouring shadows, full
forehead visible" re-roll fixed it → kept). All 5 non-red-fur scenes passed clean. **687 → 717 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-01 — Batch S shipped 31 gate-passed gems** (31 generated, 0 culls — best yield yet). RANGE
10 → 109 colours: cuties (sloth, llama, hamster, baby-owl, dolphin, goldfinch) → fantasy (pegasus-foal,
gnome-mushroom, unicorn-night, dragon-egg-nest, fairy-teacup) → 5 popart + 3 fabulous faces (peony/
forget-me-not/marigold, fair) → whimsical animal scenes (rabbit-painter, bear-baker, hedgehog-postman,
owl-teacher, beaver-carpenter) → florals → **4 dense 100+ Flux-1.1-Pro showpieces** (enchanted-forest 78 —
dusk palette collapsed the count but reads richly, paris-street 109, cottage-garden 102, safari-savanna 107).
Shelves: portraits +8, animals +6, fantasy +5, whimsical +5, scenes +4, floral +3. Deep-skin `sat:1.1` popart
held a FOURTH batch (cornrows-man, afro-puffs, curly-bob — all correct rich brown). 3 re-rolls, ALL saved (0
culls): owl-teacher had faint gibberish chalk-writing → re-briefed the board as a wordless chalk sun/stars
drawing (NO letters) since Flux can't write clean text; dragon-egg-nest was a muddy jumble → "two clearly
defined dragons + simple uncluttered background" fixed it; fairy-teacup was hazy/washed-out → "bold crisp
high-contrast outlines + simple clean background" fixed it. NEW GATE NOTE: watch chalkboards/signs for faint
gibberish text (hard fail) — brief scene props as wordless drawings. **717 → 748 PUBLIC.** Deploy green +
/healthz 200.

**2026-07-01 — Batch T shipped 10 gate-passed gems** (11 generated, 1 culled — mermaid-moon stayed FLAT/
1-colour through 3 re-rolls incl. a brightened brief, so culled; LESSON: a persistent flat render = cull after
ONE re-roll, don't get stuck). Timed reference batch for the cron cadence: gen 11 (incl. 2 Flux-1.1-Pro dense)
= 2m51s, enrich+publish 10 = 3m36s, deploy+verify ≈ 13–15m. Deep-skin `sat:1.1` held (headtie-man). RANGE
13 → 116 col: cuties (baby-deer, chinchilla) → 3 portraits → whimsical (mouse-baker, cat-gardener) → florals
→ 2 dense showpieces (alpine-village 105, butterfly-meadow 116). **748 → 758 PUBLIC.** Deploy green + /healthz
200.

**2026-07-02 — Batch 07012204 (auto cron) shipped 13 gate-passed gems** (13 generated, 0 culls — all 4
flagged renders saved on a single re-roll). RANGE 12 → 101 col: cuties (koala-eucalyptus, raccoon-acorn,
polar-bear-cub) → 3 portraits (goldturban-woman deep-skin `sat:1.1` held again — correct rich brown first
try; flatcap-man fair; dahlia-fair artface) → fantasy (fairy-swing, seahorse-magic) → whimsical
(owl-astronomer, rabbit-florist) → blue-tit → 2 dense Flux-1.1-Pro showpieces (lavender-farm 98,
hot-air-balloons 101). Shelves: animals +4 (incl. blue-tit), portraits +3, fantasy +2, whimsical +2,
scenes +2. FOUR re-rolls, ALL saved: polar-bear-cub + koala were washed-out/muddy-faced on pale fabric →
"bold clear dark outline + two clearly separated eyes and a distinct nose (not one blob)" fixed both;
dahlia-fair artface had grey/green under-eye contouring → the standard "bright FLAT even frontal lighting,
NO grey/green contouring shadows, warm healthy skin, no dark hollows" re-roll fixed it; fairy-swing came
back with huge black chibi eyes + hazy → "both eyes NORMAL-SIZED (not huge black eyes), crisp BOLD
high-contrast, NOT hazy" fixed it. Recurring lesson reconfirmed: white/pale animals (polar bear, koala)
need an explicit bold dark outline + a coloured base/prop or they ghost out on pale aida. **758 → 771
PUBLIC.** Deploy green + /healthz 200.

**2026-07-02 — Batch 07020854 (auto cron) shipped 13 gate-passed gems** (14 generated, 1 cull:
capybara-orange came back a flat orange blob with a muddled bath concept — the 3rd orange animal, culled
rather than re-rolled). RANGE 12 → 101 col: cuties (quokka-leaf, wombat-flower) → floral (wren-foxglove
bird, eucalyptus-berry wreath) → 3 portraits (beads-woman deep-skin `sat:1.1` held rich brown first try;
bob-blonde fair; camellia-fair artface) → fantasy (griffin-cub, fairy-bee) → whimsical (mouse-cheesemonger,
bear-beekeeper — both grey/brown fur per no-ginger rule, no gibberish text) → 2 dense Flux-1.1-Pro
showpieces (moroccan-souk 101, tuscan-vineyard 83). Shelves: animals +2, floral +2, portraits +3,
fantasy +2, whimsical +2, scenes +2. TWO re-rolls, both saved: wren-foxglove first came back a malformed
yellow/blue blob merged into the flowers → "a single plump bird perched clearly to one side, bold clean
outline, NOT overlapping the flowers" fixed it; griffin-cub was a hazy all-yellow wash melting into the
background → "distinct white eagle head, feathered wings, on a clear SKY-BLUE background, strong dark
outline, HIGH-CONTRAST, NOT all one colour" fixed it. Recurring lesson reconfirmed: the cute lane's high
saturation cooks brown fur to orange (quokka/wombat/capybara all trended orange) — accept one or two as
cheerful characters but don't stack 3+ brown animals in a batch. **771 → 784 PUBLIC.** Deploy green +
/healthz 200.

**2026-07-02 — Batch 07020918 (auto cron) shipped 12 gate-passed gems** (14 generated, 2 culls). RANGE
14 → 95 col: cuties (penguin-chick, kitten-basket — both grey/non-brown to dodge the orange cook) →
portraits (beanie-man fair; anemone-fair artface clean full-forehead face) → fantasy (unicorn-meadow,
mermaid-shell) → whimsical (frog-fishing green frog, mole-gardener grey mole — non-red fur, no lettering) →
floral (hydrangea-ring wreath, nuthatch bird) → 2 dense Flux-1.1-Pro showpieces (desert-oasis 87,
mountain-lake-cabin 95 — a gorgeous painterly autumn-lake scene). Shelves: animals +3 (incl. nuthatch),
portraits +2, fantasy +2, whimsical +2, floral +1, scenes +2. FOUR re-rolls: unicorn-meadow (first came
back hazy with a weak white outline ghosting into the pale sky → "STRONG bold dark outline on the whole
body, set against a bright blue sky, HIGH-CONTRAST NOT hazy" fixed it → kept) and nuthatch (first had
floating disconnected leaves + a ghost-smudge branch → "ONE simple branch, leaves attached to that same
branch, NO floating leaves or stray smudges" fixed it → kept) were SAVED; but popart-hoops-woman (deep-skin
`sat:1.1`) and cute-badger-cub were CULLED after their one re-roll — the afro portrait's eyes stayed blank
whites with weak irises even after the face was re-centred, and the badger's eyes kept merging into its
black face-stripes (asymmetric, one a blob). LESSONS RECONFIRMED: a big afro crushes the face composition
(brief a NEUTRAL rounded afro + "face large and clearly centred"); badger black-stripe faces are a recurring
eye-merge trap; deep-skin popart eyes remain the hardest failure mode — cull rather than ship blank whites.
INFRA NOTE this run: a concurrent process ran `git reset --hard` mid-run and wiped the working-tree brief
edits AFTER generation — the renders/flux PNGs on disk survived, so I published by writing approved-full.json
directly (publish re-derives from the flux PNGs + metadata, no dependency on the tracked BRIEFS file), then
re-applied the source edits and committed. If enrich reports MISSING for a whole fresh batch, suspect the
revert and hand-write approved-full.json. **784 → 796 PUBLIC.** Deploy green + /healthz 200.

**2026-07-02 — Batch 07021337 (auto cron) shipped 13 gate-passed gems** (13 generated, 0 culls — both
flagged renders saved on a single re-roll). RANGE 13 → 114 col: cuties (spring-lamb white, lop-bunny grey,
corgi-puppy) → bird (bullfinch) → 3 portraits (gele-woman deep-skin `sat:1.1`; redscarf-woman fair;
lavender-fair artface clean full-forehead face) → fantasy (fairy-toadstool, baby-dragon) → whimsical
(mouse-clockmaker grey mouse, owl-baker brown owl — non-red fur, blank signs no lettering) → 2 dense
Flux-1.1-Pro showpieces (japanese-garden 114 — a gorgeous red moon-bridge/cherry-blossom/koi scene,
cozy-bookshop 93 — warm painterly interior, grey cat, blank book spines). Shelves: animals +4 (incl.
bullfinch), portraits +3, fantasy +2, whimsical +2, scenes +2. TWO re-rolls, BOTH saved: gele-woman first
came back with the classic deep-skin failure — blank white eye-patches, no nose/features on the dark skin →
"both eyes clearly drawn with visible dark-brown irises and pupils looking forward (NOT blank white eyes),
clearly drawn eyebrows, defined nose with bridge and nostrils, all features boldly outlined on the dark
skin" fixed it → correct dignified rich-brown portrait; spring-lamb first was washed-out with a weak outline
ghosting into pale fabric → "a BOLD solid dark charcoal outline all around the body + a solid green grass
base to ground it" fixed it → reads crisply. LESSON RECONFIRMED: deep-skin popart eyes are the #1 failure
mode — brief the irises/pupils EXPLICITLY (not just "clear dark irises"), demand pupils looking forward and
all features boldly outlined, and it converges; white animals still need an explicit bold dark outline +
coloured base or they ghost on pale aida. **796 → 809 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07021422 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE
12 → 107 col: cuties (gosling yellow, squirrel-acorn grey) → bird (great-tit) → 2 portraits (cornflower-fair
artface clean full-forehead face; ponytail-woman fair popart) → fantasy (mermaid-seahorse, fairy-lily) →
whimsical (panda-painter B&W, frog-gardener green — non-red fur, blank signs/canvas no lettering) → 2 dense
Flux-1.1-Pro showpieces (tulip-windmill 107 — vivid Dutch tulip fields + windmill + cherry blossom,
harbour-town 98 — golden-hour coastal fishing harbour). Shelves: animals +3 (incl. great-tit), portraits +2,
fantasy +2, whimsical +2, scenes +2. THREE re-rolled, ONE saved: ponytail-woman first came back blotchy
orange with grey/green contour patches → flat-even-lighting + `sat:1.0` + "NO grey/green blotches, NOT
orange" fixed it → clean symmetric portrait (one attempt came back FLAT/dead-Flux and was simply re-rolled
again). TWO CULLED after their one re-roll: **fro-man** (deep-skin popart) stayed cross-eyed with pupils
shoved into the inner corners even after an explicit "pupils centred in the MIDDLE looking straight ahead,
NOT cross-eyed" re-roll — deep-skin popart eyes remain the #1 failure mode, cull rather than ship; and
**cute-kid-goat** (white/cream) stayed washed-out and ghosting into the pale fabric even after a "VERY BOLD
thick dark charcoal outline" re-roll — a pure white/cream animal on pale aida is a recurring ghost-out trap,
so prefer a coloured or clearly-marked animal (the yellow gosling + grey squirrel read fine because they
carry their own contrast). INFRA NOTE reconfirmed: a concurrent `git reset --hard` wiped the working-tree
brief edits mid-run (right after the first gen) — re-applied the 13 briefs to the file and re-generated the
deleted re-roll slugs (the 9 kept renders stayed cached on disk); publish worked off the on-disk flux PNGs +
approved-full.json regardless. **809 → 820 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07031721 (auto cron) shipped 12 gate-passed gems** (13 generated, 1 cull). RANGE 13 →
94 col: cuties (tabby-kitten grey, piglet-puddle pink+rubber-duck, duckling-boots yellow — all self-contrasting,
no pure-white ghost-out) → 2 portraits (fulani-woman deep chocolate-brown popart clean symmetric forward-looking
irises at `sat:1.1` first try; pageboy-woman fair popart clean even skin at `sat:1.0`) → fantasy (baby-dragon-
stars bright teal dragon on a NOT-dark blue starry sky, fairy-pond clean normal-sized symmetric eyes) → whimsical
(tortoise-gardener green tortoise in a greenhouse, cat-clockmaker grey cat — both non-red fur, blank clock faces/
seed packets no lettering) → floral (cottage-bouquet bright mixed jug) → 2 dense Flux-1.1-Pro showpieces
(swiss-alps-winter 74 — bright daytime alpine village, red train, glowing chalets, NOT gloomy; tropical-waterfall
94 — turquoise falls, toucan+macaws, hibiscus). Shelves: animals +3, portraits +2, fantasy +2, whimsical +2,
floral +1, scenes +2. TWO re-rolled, ONE saved: **cat-clockmaker** first came back muddy/dark/gloomy with a
jumbled orange bench → brighter "clear warm daylight, HIGH-CONTRAST, tidy uncluttered bench, NOT dark NOT flooded
in one brown/orange tone" + `sat:1.15` gave a clean bright workshop → kept. ONE CULLED after its one re-roll:
**face-primrose-fair** (artface) stayed grey/brown-contoured with heavy under-eye hollows and muddy non-flat
skin BOTH attempts even with an explicit "SIMPLE FLAT poster style, ONE single solid even skin tone, NO
contouring, NO tear-streaks, full not gaunt features" re-roll — reconfirms the recurring artface deep-shadow trap
(cosmos, ranunculus, primrose all culled): prefer `popart` for skin, keep `artface` fair-only and even so it can
gaunt-out. Deep-skin `sat:1.1` popart held (fulani-woman correct rich brown first try). **838 → 850 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-03 — Batch 07031525 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE
15 → 114 col: cuties (fennec-kit cream, snowy-owlet white) → bird (waxwing) → fantasy (baby-dragon-garden,
big amber symmetric eyes) → 2 portraits (coils-woman deep chocolate-brown popart clean symmetric eyes at
`sat:1.1`; earmuffs-woman fair popart at `sat:1.0`) → whimsical (rabbit-potter grey rabbit at the wheel,
bear-cellist brown bear + cello — both non-red, blank pots/sheet music no lettering) → 2 dense Flux-1.1-Pro
showpieces (amalfi-coast 114 — pastel cliffside village + turquoise sea + bougainvillea, orchard-harvest 62
— autumn apple orchard + red barn + horse). Shelves: animals +2, portraits +2, fantasy +1, whimsical +2,
floral +1, scenes +2. FOUR re-rolled, ONE saved: **bear-cellist** first came back flooded in one garish
orange tone (warm subject × scene srcSat 1.3 × post 1.3 ≈ 1.7×) → adding cool blue elements + `sat:1.15`
("clearly SEPARATED colours, NOT flooded in one orange tone") gave a clean balanced blue/brown/green scene —
the warm-scene orange-flood fix is a per-brief `sat` override, mirroring the skin fix. THREE CULLED after
their one re-roll: **face-ranunculus-fair** (artface) stayed grey/green-contoured with dark eye-hollows and
sickly skin BOTH attempts even with an explicit "ONE flat matte tone, NO grey/green/brown contouring" re-roll
— the artface lane keeps trending painterly-shadowed, cull it fast; **cute-cygnet** (white) stayed muddy
with a distorted central face-blob both attempts (white-on-ivory ghost-out + bad face) — reconfirms the pure-
white-cutie trap from Batch 07021422; **fantasy-fairy-moth** stayed hazy/washed-out with no bold outline (one
fantasy from the dragon was plenty). Note: swapped the failed warm-fur **chipmunk** cutie for a cool-toned
**snowy-owlet** rather than re-roll the same subject — brown/ginger fur cooks to orange in the cute lane. **820
→ 830 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07031620 (auto cron) shipped 8 gate-passed gems** (12 generated, 4 culls). RANGE
14 → 101 col: cuties (baby-giraffe, baby-hippo) → chaffinch bird → 1 portrait (highbun-glasses fair popart,
sat 1.0) → whimsical animal scenes (mouse-florist, badger-bookseller) → 2 dense Flux-1.1-Pro showpieces
(santorini-sunset 101, pumpkin-patch 90). Shelves: animals +3 (incl. chaffinch), whimsical +2, portraits +1,
scenes +2. **RAN IN AN ISOLATED WORKTREE** — a concurrent needlework session was doing `git reset --hard` in
the shared main checkout and wiped this batch's uncommitted brief edit mid-run (untracked renders in
.loom-scratch survived); moved all tracked-file + commit work into a dedicated worktree (one
`pnpm install --frozen-lockfile`, ~4m) so the concurrent resets couldn't clobber it. **4 culls, all failed
after ONE repair re-roll:** baby-skunk (jumbled twin-face first roll → single but faded ghost-blob with no
white stripe on re-roll — the pure-black/white cutie ghosts on ivory), popart-bantuknots-woman (garish clown-
cheek blush first roll → a big dusty-pink mask patch flooding the whole face on re-roll; `sat:1.1` fixes base
tone but can NOT remove pink/orange patches baked into the Flux render — the recurring deep-skin lesson),
face-cosmos-fair (heavy grey/brown contouring shadow + gaunt hollows both rolls — the artface lane's known
shadow trap that won't converge; the reliable fix stays: prefer `popart` for skin, keep artface fair-only and
even so it can gaunt-out), fantasy-mermaid-lagoon (huge black chibi eyes + hazy first roll → came back
FLAT/1-colour dead-Flux on re-roll → culled per the "flat after one re-roll = cull" rule). badger-bookseller
SAVED by re-roll: first roll put the badger's back to us as a dark blob → "FACING the viewer holding an open
book" gave a clear charming front-facing badger. **830 → 838 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07031820 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE 13 →
110 col: cuties (baby-donkey grey+charcoal-mane in buttercups, dormouse-berry golden) → bird (garden-jay,
vivid blue/black/red) → 1 portrait (wavybob-woman fair popart, sat 1.0, clean even skin) → fantasy (fairy-
sunflower golden fairy, dragon-rainbow cheerful cloud-dragon) → whimsical (penguin-postman snowy village,
hedgehog-baker cosy bakery — both non-red, blank labels no lettering) → 2 dense Flux-1.1-Pro showpieces
(cotswolds-village 110 — honey-stone cottages, bridge, ducks, red phone box; lighthouse-cove 93 — red/white
lighthouse, turquoise cove, poppies, gulls). Shelves: animals +3 (incl. jay), portraits +1, fantasy +2,
whimsical +2, scenes +2. TWO re-rolled + SAVED: **dragon-rainbow** first came back with one giant black-orb
eye vs a small one (wildly asymmetric) → "TWO eyes EXACTLY the same size, each a clean round eye with iris +
small pupil + highlight, NOT one big black orb" gave two clean symmetric eyes; **hedgehog-baker** first came
back flooded in one yellow/orange tone (warm scene × srcSat 1.3) → cool teal cupboards + separated jar
colours + `sat:1.15` ("balanced warm-and-cool, NOT flooded in one yellow tone") gave a bright balanced
bakery. THREE CULLED after their one re-roll: **popart-twistout-woman** (deep-skin) kept garish pink blush
circles baked into the cheeks BOTH rolls even with an explicit "cheeks the EXACT SAME even brown, NO blusher,
NO pink circles" re-roll — reconfirms `sat:1.1` fixes base tone but can NOT remove pink patches baked into
the Flux render (the recurring deep-skin blush trap); **face-jasmine-fair** (artface) stayed heavily
grey/brown/orange contoured + gaunt hollows BOTH rolls even zoomed-out with a strict "SIMPLE FLAT poster, ONE
even tone, NO contouring" re-roll — the known artface deep-shadow trap that won't converge (prefer popart for
skin, artface keeps failing); **cute-meerkat-pup** stayed muddy BOTH rolls (the dark eye-mask merges with the
eyes into a smudgy dark blob + the pale tan body ghosts on ivory) even with a "rich deep tan, bold thick dark
outline, CLEAN separated round eyes not merged into the mask" re-roll — a pale animal with a dark facial mask
on pale aida is a mud trap, prefer a clearly-coloured animal without a face-mask. Ran the tracked-file commit
in an isolated worktree again (concurrent session `git reset --hard`-ed the shared main checkout and wiped the
brief edit mid-run TWICE; renders in .loom-scratch survived, generation + publish ran fine from main). **850
→ 860 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07031921 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 12 →
125 col: cuties (mouse-strawberry grey+red-berry, piglet-clover pink, frog-lilypad green — all self-
contrasting, no pure-white ghost-out) → bird (sunlit-songbird, vivid yellow/red — brief said yellowhammer but
markings rendered stylised, so named generically) → 1 portrait (sleekbun-woman fair popart, sat 1.0, clean
even skin, symmetric) → fantasy (fairy-bluebell clear symmetric normal eyes, dragon-flowers cheerful green
dragon in a bright flower meadow with two symmetric highlighted eyes) → whimsical (otter-baker brown otter in
a balanced warm-and-cool bakery at sat 1.15 — the warm-scene cool-elements fix held; koala-librarian grey
koala + colourful BLANK book spines no lettering) → 2 dense Flux-1.1-Pro showpieces (provence-market 125 —
bright Provençal flower-market street + wisteria + lavender fields; scottish-highlands 93 — bright loch +
grey castle + highland cow + heather). Shelves: animals +4 (incl. songbird), portraits +1, fantasy +2,
whimsical +2, scenes +2. ONE re-rolled + saved: **cute-mouse-strawberry** came back FLAT/1-colour dead-Flux
first roll → simple re-roll gave a live 12-col cutie. TWO CULLED after their one re-roll: **face-freesia-fair**
(artface) came back with the lane's known heavy grey/green contouring + under-eye hollows + cropped forehead
— culled fast without wasting a re-roll (artface never converges; prefer popart for skin); **popart-goldhoops-
woman** (deep-skin) had garish rosy blush circles first roll → the strengthened "cheeks IDENTICAL to forehead,
NO pink circles" re-roll removed the blush BUT introduced a downward whites-showing gaze (pupils shoved to the
bottom of the eye) — reconfirms deep-skin popart EYES are the #1 failure mode, cull rather than ship. Note:
pink/grey cuties (mouse, piglet) render soft/pale on ivory but self-contrasting accents (red berry, green
clover, pink ears) keep them reading. **860 → 871 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07032021 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 9 →
91 col: cuties (mole-flower grey+pink-flower, baby-walrus blue-grey+rosy-cheeks+fish, baby-tortoise orange-
gold shell — all self-contrasting) → 1 portrait (windswept-woman fair popart, sat 1.0, symmetric forward gaze,
clean even skin) → fantasy (dragon-teacup bright green front-facing dragon in a floral teacup with two
symmetric eyes, fairy-firefly lilac fairy with defined symmetric eyes among fireflies) → whimsical (mouse-
cheesemonger grey mouse, duck-greengrocer white duck — both non-red, blank signage) → floral (cosmos-jug
pink/white/magenta cosmos in a blue jug) → 2 dense Flux-1.1-Pro showpieces (nordic-fjord 91 — bright
Norwegian fjord village, red cabins, waterfall, boats; rice-terraces 90 — emerald Balinese rice terraces,
temple, palms, water buffalo). Shelves: animals +3, portraits +1, fantasy +2, whimsical +2, floral +1,
scenes +2. FOUR re-rolled + ALL FOUR saved: **cute-mole-flower** first came back a muddy washed-out grey blob
with random pink patches all over it → "clear friendly face, bold clean dark outline, ONE flower, NO extra
patches on its body, NOT washed-out" gave a clean sweet cutie; **cute-baby-tortoise** first blended green-on-
green into its leaf with a murky face → swapping the big green leaf for a brown log + "colours that DO NOT
blend into the background" gave a clear orange-shelled tortoise; **fantasy-dragon-teacup** first came back hazy
with only one visible eye in profile → "FACING the viewer with TWO symmetrical round eyes, bold dark outline,
NOT hazy" gave a crisp charming front-facing dragon; **fantasy-fairy-firefly** first had vacant blank pale
empty eyes → "TWO symmetrical eyes each with a clear coloured iris and defined dark pupil, NOT big blank empty
pale eyes" gave a clear defined face. TWO CULLED after one re-roll: **popart-hibiscus-woman** (deep-skin) — the
re-roll FIXED the sideways gaze (eyes centred + symmetric) BUT the garish mauve blush circles stayed baked into
both cheeks even with "NO pink rosy or mauve blush patches anywhere" — reconfirms sat:1.1 fixes base tone but
can NOT remove blush patches baked into the Flux render (the recurring deep-skin blush trap), cull rather than
ship; **face-buttercup-fair** (artface) came back half in heavy grey-green contour shadow with gaunt cheek
hollows — the known artface deep-shadow trap that never converges, culled fast without wasting a re-roll (prefer
popart for skin, artface keeps failing). **871 → 882 PUBLIC.** Deploy green + /healthz 200.

**2026-07-03 — Batch 07032120 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 14 →
102 col: cuties (baby-panda black/white hugging bamboo — strong self-contrast reads on ivory; fox-kit in
bluebells) → bird (hummingbird-fuchsia, jewel emerald/blue/ruby) → 1 fair portrait (braidcrown-woman fair
popart, sat 1.0, clean even skin, symmetric centred eyes) → 1 fair artface (poppy-fair — one of the CLEANER
artface results: even flat lighting, full forehead, symmetric eyes, bold red-poppy crown, no gaunt shadow
trap) → fantasy (unicorn-blossom, mermaid-coral) → whimsical (cat-bookseller grey tabby + BLANK book spines
no lettering; bear-greengrocer brown bear + blank labels — both non-red, balanced colours) → 2 dense
Flux-1.1-Pro showpieces (lake-como 102 — pastel villas, cypresses, blue lake; new-england-autumn 102 —
white-steeple church, blazing maples, covered bridge, blue stream). Shelves: animals +3 (incl. hummingbird),
portraits +2, fantasy +2, whimsical +2, scenes +2. TWO fantasy re-rolled + SAVED: **unicorn-blossom** first
ghosted (white body dissolved into a hazy pale-blossom background + big vacant dark orbs) → a THICK BOLD dark
outline + a bright green meadow & clear blue sky (coloured background, not pale haze) + "NORMAL eyes with
iris+pupil, NOT big blank orbs" gave a crisp readable unicorn; **mermaid-coral** first was murky grey-teal +
hazy with big blank eyes → "BRIGHT CLEAR turquoise water, defined iris+pupil, NOT grey NOT hazy" gave a
bright crisp charming mermaid. **fox-kit** re-rolled once (first roll had hot-pink/magenta speckles scattered
over the warm orange fur — the cute lane's srcSat 1.45 cooking warm fur) → "clean even fur, NO stray pink/
magenta speckles" + sat 1.15 removed the speckles for a clean sleepy fox in bluebells. TWO CULLED: **popart-
boxbraids-woman** (deep-skin) came back dead-Flux FLAT/1-colour on BOTH the first roll and its re-roll —
culled per the "flat after one re-roll = cull" rule (the deep-skin popart lane is the single hardest);
**cute-guinea-pig** first roll was muddy with magenta ear patches → the anti-magenta re-roll (sat 1.15) went
too pale and ghosted into the ivory (pale golden fur on pale fabric washes out) — culled. NOTE: the concurrent
needlework session `git reset --hard`-ed the shared main checkout mid-run and wiped this batch's uncommitted
brief edit (renders in .loom-scratch survived; re-applied the briefs then committed in a tight edit→add→commit
sequence — no husky/pre-commit hook is active so no worktree/install was needed). **882 → 893 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-03 — Batch 07032220 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE 11 →
105 col: cuties (baby-raccoon grey+bold-black-mask, strong self-contrast on ivory; baby-quokka golden-brown
with symmetric green eyes) → bird (bluetit-blossom, vivid blue/yellow blue tit on pink cherry blossom) → 1
fair portrait (wavylob-woman fair popart, clean even skin, symmetric centred eyes, full forehead) → fantasy
(gnome-garden cheerful red-hatted gnome with symmetric blue eyes in a bright flower garden; mermaid-seahorse
bright purple-tailed mermaid hugging a golden seahorse in clear turquoise water, symmetric eyes with iris+pupil)
→ whimsical (frog-fisherman green frog in a yellow raincoat on a lily-pad jetty, blank signage; hedgehog-
florist brown hedgehog in a green apron at a flower stall, all tags left blank) → 2 dense Flux-1.1-Pro
showpieces (japanese-garden 105 — red arched bridge over a koi pond, cherry blossom, pagoda; santorini-blue
99 — whitewashed houses, blue domes, pink bougainvillea, Aegean sea). Shelves: animals +3 (incl. bluetit),
portraits +1, fantasy +2, whimsical +2, scenes +2. ONE re-rolled + kept: **cute-quokka** first roll had
magenta/purple ear + nose speckles (warm-fur srcSat trap) → the anti-magenta re-roll (sat 1.1) gave a sweeter
symmetric-eyed cutie (faint inner-ear tint remains but reads as natural). THREE CULLED: **face-daisy-fair**
(artface) came back with the lane's known heavy grey/brown contour shadows + blotchy muddy skin — culled fast
without a wasted re-roll (artface never converges; prefer popart for skin); **popart-bantuknots-woman** (deep-
skin) had garish pink/coral blush flooding forehead + both cheeks, muddy tan (not deep-brown) tone, missing
bantu knots + downward gaze — the recurring deep-skin blush trap, cull rather than ship; **cute-baby-goat**
(pale cutie) ghosted into the ivory first roll then came back washed-out/muddy with an asymmetric muddy face
on its one re-roll — the white/pale-cutie-on-ivory trap again, culled after one re-roll. **893 → 903 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-04 — Batch 07041113 (auto cron) shipped 12 gate-passed gems** (13 generated, 1 cull). RANGE 12 →
119 col: cuties (baby-lynx grey-brown spotted cub with black-tufted ears; baby-chipmunk russet with bold
cream-and-dark stripes; dachshund-puppy warm chestnut sausage-dog among daisies — all self-contrasting) →
bird (bee-eater, vivid green/gold/turquoise jewel tones) → 1 fair popart (fingerwaves-woman art-deco, sat 1.0,
symmetric eyes, full forehead, red lips) → 1 fair artface (rose-fair — a CLEAN one: full forehead, symmetric
eyes, lovely pink-rose crown, only mild shadow, well clear of the gaunt-hollow trap) → fantasy (dragon-castle
cheerful front-facing green dragon at a pastel fairytale castle with two symmetric blue eyes; fairy-butterfly
chibi fairy with big pink-and-yellow butterfly wings, symmetric matching eyes) → whimsical (rabbit-teacher grey
rabbit + glasses at a chalkboard drawing only a chalk sun+stars no lettering; panda-gardener black-and-white
panda in dungarees with a watering can, blank plant labels) → 2 dense Flux-1.1-Pro showpieces (cinque-terre 119
— pastel Italian Riviera cliff village over turquoise sea; kyoto-street 107 — Kyoto machiya street, cherry
blossom, pagoda, kimono figures, blank lanterns/noren). Shelves: animals +4 (incl. bee-eater), portraits +2,
fantasy +2, whimsical +2, scenes +2. THREE re-rolled + ALL THREE saved: **cute-baby-chipmunk** first came back
muddy/washed-out with soft outline + asymmetric dark-blob eyes → "TWO round symmetric eyes each with a bright
white highlight, THICK BOLD dark outline, crisp NOT hazy" gave a crisp smiley cutie; **fantasy-fairy-butterfly**
first had one dark hollow shadow-eye + one defined eye (mismatched) → "TWO SYMMETRICAL MATCHING eyes the SAME
size, NO dark shadow patch over either eye" gave a cute symmetric-eyed fairy; **scene-panda-gardener** first had
a faint hallucinated cursive scribble/watermark in the top-left corner → "NO text signature or watermark in any
corner" gave a clean brighter panda. ONE CULLED: **popart-passiontwists-woman** (deep-skin) — BOTH the first
roll AND its re-roll came back with garish coral blush circles flooding both cheeks + a downward gaze with the
whites showing above the iris, even with explicit "NO blush, cheeks EXACTLY the same flat brown, iris centred, NO
white showing" language — reconfirms the deep-skin popart blush + downward-gaze trap does NOT respond to
prompting (the single hardest lane), cull rather than ship. **903 → 915 PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07041149 (auto cron) shipped 8 gate-passed gems** (13 generated, 5 culls — a
harsher-than-usual gate). RANGE 14 → 106 col: cuties (mouse-acorn warm-orange harvest mouse with crisp
symmetric highlighted eyes holding an acorn; baby-lemur grey ring-tailed cub — RE-ROLLED once: the first roll
had uncanny red/green-speckled eyes and a washed grey body, the re-roll with "warm amber eyes each ONE dark
pupil, NO red/green/magenta, THICK BOLD outline all round the body" gave a sweet clean cutie on green leaves)
→ 1 fair artface (hydrangea-fair — a CLEAN one: full forehead, symmetric blue eyes, blue-and-white hydrangea
crown, only a mild forehead highlight, well clear of the gaunt-hollow trap) → fantasy (unicorn-waterfall white
unicorn with purple-gold mane, rainbow + waterfall, symmetric defined eyes; mermaid-dolphin teal-haired
mermaid hugging a grey dolphin in bright turquoise water, symmetric matching eyes) → whimsical (badger-baker —
RE-ROLLED once: first roll was hazy with faint chalk-scribble gibberish on a chalkboard; re-brief removing the
chalkboard entirely + "crisp NOT hazy, plain warm wall, NO text" gave a crisp striped-faced badger with a tray
of cupcakes among colourful jars) → 2 dense Flux-1.1-Pro showpieces (porto-riverside 106 — colourful Ribeira
houses stacked over the Douro, rabelo boats, iron bridge; english-pier 100 — bright Victorian seaside pier,
carousel, golden beach, blue sea). Shelves: animals +2, portraits +1, fantasy +2, whimsical +1, scenes +2.
FIVE CULLS (the gate held hard rather than shipping weak pieces): **popart-beehive-woman** (fair) came back
dead-Flux FLAT/1-colour on BOTH the first roll and its re-roll → culled per the flat-after-one-re-roll rule;
**popart-goddessbraids-woman** (deep-skin) had the recurring garish coral blush circles flooding both cheeks +
whites showing above the iris — the deep-skin popart trap that batch notes show does NOT respond to prompting,
culled without a wasted re-roll; **scene-duck-postman** RE-ROLLED once (first roll had a doubled second duck
head on the chest; the re-roll fixed the anatomy to a single clean head BUT the red postbox came back with a
gibberish-text collection-times notice — a hard signage fail), culled; **bright-puffin** RE-ROLLED once (first
roll's white breast washed into the ivory + blue-not-black back; the re-roll still washed the white breast into
a pale-grey sky and kept the wrong blue back — the white-subject-on-ivory trap), culled; **cute-baby-otter**
RE-ROLLED once (first roll soft/hazy with closed eyes; the re-roll opened the eyes but the eyes+nose merged into
a muddy dark blob in the centre of the face — muddy = hard fail), culled after one re-roll. **915 → 923 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-04 — Batch 07041225 (auto cron) shipped 9 gate-passed gems** (13 generated, 4 culls). RANGE 14 →
115 col: cutie (baby-toucan glossy black body + banded orange/yellow/green beak + white bib, one clear
highlighted eye) → bird (songbird-on-blossom, blue back + red throat + cream breast that reads on a blue
sky, named generically as it rendered plumper than a true forked-tail swallow) → 1 fair artface (sweetpea-
fair — full forehead, symmetric iris+pupil eyes, soft pink/lilac sweet-pea crown, only mild grey under-eye,
clear of the gaunt-hollow trap) → fantasy (fairy-rose chibi fairy on a bold red rose with symmetric green
eyes and a coloured blue sky; dragon-sunflowers cheerful green kawaii dragon in a sunflower field, symmetric
dark eyes WITH white highlights so not blank orbs) → whimsical (cat-tailor grey tabby in a waistcoat with a
tape measure + colourful fabric bolts, all bolts/patterns blank no lettering; hedgehog-knitter cosy bespectacled
granny with symmetric eyes + colourful yarn baskets + blue shawl — RE-ROLLED: first roll flooded in a warm
orange monotone with slightly asymmetric eyes, the "separated balanced colours + cool blue/green accents + no
frame" re-brief gave balanced yarn colours + symmetric eyes, kept) → 2 dense Flux-1.1-Pro showpieces (prague-
old-town 115 — gothic Tyn spires, colourful baroque houses, market stalls, blank signage; underwater-reef 107
— vibrant coral reef, green sea turtle, tropical fish, sunbeams). Shelves: animals +2, portraits +1, fantasy
+2, whimsical +2, scenes +2. FOUR CULLS (portraits + white/pale cuties, the two hardest lanes): **popart-
twists-man** (deep-skin) — clean even deep-brown skin BUT the eyes rolled UP with whites showing below the
iris on BOTH the first roll and the "level gaze, iris centred, no white showing" re-roll — reconfirms the
deep-skin popart gaze trap does NOT respond to prompting; **popart-pompadour-man** (fair) came back flat
ORANGE/tangerine on the first roll AND, even at sat 0.95 with explicit "not orange" language, the re-roll went
orange-flooded across skin AND shirt — the fair-skin-orange trap; **cute-baby-beaver** first had mismatched
eyes (one clean dark, one green/muddy), the "matching symmetric eyes, no green tint" re-roll went hazy with the
eyes/nose merging into a muddy blob — muddy = fail; **cute-baby-zebra** first washed into the ivory (white-on-
ivory ghost), the "bold BLACK stripes + thick outline" re-roll fixed the body contrast BUT the face collapsed
into a muddy dark mass with no clear eyes — a cutie lives on its face, culled. **923 → 932 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-04 — Batch 07041321 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE 11 →
116 col: cuties (baby-panda black-and-white cub with bamboo + symmetric eyes; baby-badger bold black-and-white
striped face with two clear symmetric highlighted eyes — both self-contrasting non-white) → bird (budgie, crisp
grass-green-and-yellow budgerigar with black wing-barring + blue cheek patch on a pink blossom branch) → 1 fair
popart (sidepart-woman — RE-ROLLED: first roll had garish orange blush blotches flooding both cheeks + neck; the
sat-0.88 "one single flat even pale-beige tone, NO orange NO blush patches NO contour shading" re-roll gave a clean
even fair face with only mild stylistic blush, symmetric level eyes, full forehead, kept) → fantasy (fairy-toadstool
red-and-white toadstool fairy with green-yellow wings + symmetric matching green eyes; pegasus-clouds — RE-ROLLED:
first roll's white body washed into the pale white-cloud background with a weak outline; the "strong MEDIUM-BLUE sky
NOT white, NO big white sun/halo, THICK BOLD outline" re-roll popped the white pegasus against a blue sky with a
rainbow, kept though the mane came paler than briefed) → whimsical (frog-painter green frog artist in a blue beret
with a colourful palette at an easel showing a wordless hills+sun canvas; mouse-gardener grey mouse in a straw hat
with a watering can + terracotta flowerpots, all seed packets blank) → 2 dense Flux-1.1-Pro showpieces (amsterdam-
canal 116 — bright sunlit Dutch canal houses, arched bridge, boats, blossom trees; tuscan-village 67 — golden
hilltop village, cypress-lined lane, vineyards + sunflowers). Shelves: animals +3 (incl. budgie), portraits +1,
fantasy +2, whimsical +2, scenes +2. THREE CULLS (both hardest lanes): **face-cornflower-fair** (artface) had a
lovely cornflower crown BUT heavy grey/pink contour shadows + blotchy muddy skin — culled fast, artface never
converges (prefer popart for skin); **cute-baby-meerkat** RE-ROLLED once (first roll's eyes merged into big dark
blobs + washed body; the re-roll STILL had merged dark-blob eyes with uncanny green tints + a washed-out body) —
meerkat's inherent big dark eye-patches swallow the eyes, culled; **popart-tinyafro-woman** (deep-skin) — clean
deep-brown skin on BOTH rolls BUT the eyes rolled UP with whites showing below the iris + grey mottled skin patches
on the first roll AND the tightened "eyes level and forward, NO white sclera, NO grey patches" re-roll — reconfirms
the deep-skin popart gaze trap does NOT respond to prompting. **932 → 942 PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07041421 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 13 →
106 col: cuties (baby-hippo blue-grey with pink muzzle + symmetric eyes/nostrils; baby-giraffe golden with brown
patches + matching highlighted eyes; baby-tiger — RE-ROLLED: first roll's eyes were dim grey vacant patches, the
"big bright eyes each with a dark pupil + white highlight, NOT grey smudges" re-roll gave crisp symmetric eyes,
kept) → bird (garden jay, warm pinkish-brown body + brilliant blue-and-black barred wing patch on an oak branch)
→ 1 fair popart (quiff-man, even flat pale-beige skin at sat 0.88, symmetric forward eyes, neat quiff + beard) →
1 artface (ranunculus-fair — RE-ROLLED: first roll had the classic grey/green contour shadows down one side +
gaunt patchy skin; the "bright FLAT even frontal daylight, NO grey/green contour, warm even skin, full forehead"
re-roll gave a clean symmetric evenly-lit rose-crowned face, kept — a rare artface SAVE) → fantasy (mermaids'-
castle — two mermaids with clear symmetric eyes before a pastel coral castle + reef) → whimsical (rabbit-cobbler
grey bespectacled rabbit in a shoe workshop, colourful boots on shelves, blank labels; panda-cellist — RE-ROLLED:
first roll's lower half was a cluttered jumble with doubled music stands, the "ONE stand, clean uncluttered, one
panda one cello, no extra limbs" re-roll gave a clean readable seated cellist, kept) → 2 dense Flux-1.1-Pro
showpieces (cotswolds-village 106 — honey-stone cottages, rose gardens, arched bridge over a stream, bright
summer; water-lily-garden 102 — impressionist Giverny-style pond, arched footbridge, pink water-lilies + willows).
Shelves: animals +4 (incl. jay), portraits +2, fantasy +1, whimsical +2, scenes +2. TWO CULLS (both hardest
lanes): **popart-twistout-woman** (deep-skin) — first roll had even brown skin BUT the pupils shoved into the inner
corners (cross-eyed) with wide outer sclera; the tightened "pupils level + parallel looking straight ahead, NOT
inward" re-roll came back WORSE with blotchy red skin patches AND the eyes rolled UP showing white below — the
deep-skin popart gaze trap reconfirmed unfixable by prompting, cull; **fantasy-fairy-dragonfly** — first roll had
big blank dark orb eyes + a hazy dissolved meadow; the "small normal-sized eyes with iris+pupil, crisp daisies,
BOLD high-contrast NOT hazy" re-roll fixed the eyes and daisies BUT the fairy's body + the dragonfly stayed washed-
out/low-contrast dissolving into the pale background, cull for haziness. **942 → 953 PUBLIC.** Deploy green +
/healthz 200.

**2026-07-04 — Batch 07041520 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE 11 →
126 col: cuties (baby-fox reddish-orange kit with clean white chest + white-tipped tail + symmetric highlighted
eyes; baby-penguin dove-grey chick with white face + orange beak/feet + symmetric eyes on snow — both self-
contrasting) → bird (blue-tit, sky-blue cap + lemon breast + white cheeks on a cherry-blossom branch, with a
neat framed border) → 1 fair popart (chignon-woman — clean single even pale-beige tone at sat 0.88, symmetric
forward eyes, full forehead, red lips, elegant high-neck top) → fantasy (unicorn-blossom white foal with pastel-
pink mane + golden horn popping against a bright blue sky in a cherry-blossom orchard; gnome-toadstool — RE-
ROLLED: the first roll came back dead-Flux 1-colour FLAT, the "standing beside the toadstool, bright BLUE sky +
green grass, NOT flat NOT grey NOT monochrome" re-brief gave a jolly bright classic tomte gnome with a red hat +
white beard among red toadstools, kept) → whimsical (otter-baker warm-brown otter in a chef hat piping cream on
colourful cupcakes among blank jars; frog-fisherman green frog in a yellow rain hat rowing a boat on a lily pond,
symmetric friendly eyes) → 2 dense Flux-1.1-Pro showpieces (santorini-village 113 — whitewashed Cycladic houses,
blue domes, pink bougainvillea over the turquoise Aegean; flower-market 126 — bustling cobbled flower-market
street, striped awnings, buckets of blooms, blank signs). Shelves: animals +3 (incl. blue-tit), portraits +1,
fantasy +2, whimsical +2, scenes +2. THREE CULLS (the two hardest lanes + the mask-eye trap): **popart-
bantuknots-woman** (deep-skin) had even deep-brown skin BUT asymmetric eyes with white sclera showing + stray
red speckles on both cheeks — the deep-skin popart gaze/blush trap the notes show does NOT respond to prompting,
culled without a wasted re-roll; **face-dahlia-fair** (artface) had a lovely dahlia crown BUT a grey/green contour
shadow down the right cheek/temple — the artface grey-shadow trap that rarely converges, culled; **cute-baby-
raccoon** — the bold black eye-mask swallowed the eyes into faint uncanny slits AND the pale grey body washed into
the ivory (the same mask-swallow + white-on-ivory trap that culled the meerkat), culled. NOTE: mid-run the working
tree was reverted to HEAD once by an external editor/watcher (git clean, reflog untouched) — re-added the briefs
and enrich/publish read them fine; an unrelated `needlework-paint.ts` edit appeared in the tree and was left
unstaged (only the two intended files committed). **953 → 963 PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07041621 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 13 →
117 col: cuties — BREED PORTRAITS (theme 1b/1c HIGH DEMAND, all self-contrasting so no white-on-ivory wash):
siamese-kitten (cream body + dark seal points + symmetric blue eyes), husky-puppy (bold grey/white markings +
symmetric ice-blue eyes), dalmatian-puppy (white coat but bold black spots + black nose + red collar anchor the
contrast, symmetric dark eyes) → 1 fair popart (halfup-woman — clean single even pale-beige tone, symmetric
forward eyes, full forehead, no orange, elegant updo) → fantasy (unicorn-strawberry white foal + pink mane +
gold horn popping against a bright blue sky in a strawberry patch; fairy-tulip — RE-ROLLED: first roll had the
classic big blank dark ORB eyes, the "TWO SMALL eyes each showing a coloured iris ring + small pupil + highlight,
NOT big blank dark orbs" re-brief gave clear detailed blue eyes + a sweet smile, kept though the framing sits a
touch off-centre) → whimsical (penguin-baker cheerful black-and-white penguin in a chef hat with colourful jars +
cupcakes, all labels blank; badger-tailor — RE-ROLLED: first roll came back muddy/dull with a brown-cast cluttered
workshop, the "bright airy UNCLUTTERED workshop, clean separated colours NOT muddy NOT brown-cast, blue waistcoat +
red jacket" re-brief gave a crisp bright readable badger tailor, kept) → floral (anemone-jug bold jewel-toned
purple/magenta/white anemones with dark navy centres in a cream jug) → 2 dense Flux-1.1-Pro showpieces (christmas-
market 117 — a bright snowy-DAY European Christmas market, decorated tree with a star, timbered town hall,
colourful stalls, blank signage; sunflower-farm 84 — a vast golden sunflower field, red barn + white farmhouse,
winding path, blue sky). Shelves: animals +3 (breed portraits), portraits +1, fantasy +2, whimsical +2, floral +1,
scenes +2. TWO CULLS (both hardest lanes): **popart-afrofade-man** (deep-skin) — grey mottled patches across the
skin (not one even brown) + prominent white sclera with an off/vacant gaze — the documented deep-skin popart
gaze/patch trap that does NOT respond to prompting, culled without a wasted re-roll; **face-carnation-fair**
(artface) — a lovely carnation crown BUT heavy grey/green contour shadows down one side, dark under-eye hollows +
gaunt patchy skin — the artface grey-shadow trap that rarely converges, culled. **963 → 974 PUBLIC.** Deploy green
+ /healthz 200.

**2026-07-04 — Batch 07041720 (auto cron) shipped 9 gate-passed gems** (13 generated, 4 culls). RANGE 15 →
120 col: cuties (baby-koala blue-grey with cream ears + big dark nose + symmetric highlighted eyes clutching a
eucalyptus branch; corgi-puppy — RE-ROLLED: first roll was soft/hazy with a weak outline + flat dark-blob eyes,
the "VERY THICK BOLD outline all the way around, eyes with a pupil AND a white highlight NOT flat dark blobs, on a
soft pale-blue cushion" re-roll gave a crisp golden corgi grounded on a blue cushion, kept) → bird (kingfisher,
electric-blue back + orange breast on a reed with a water reflection, elegant clean composition) → 1 fair popart
(glasses-man — even flat pale-beige skin at sat 0.88, symmetric forward eyes, full forehead, slicked hair + beard +
round glasses) → fantasy (baby-dragon chubby emerald dragon with a cream belly + gold horns on a small treasure
hoard, big shiny highlighted cartoon eyes, bright fiery-cave ring against blue sky) → whimsical (hedgehog-florist —
RE-ROLLED: first roll rendered as a fluffy ginger lion/cat NOT a hedgehog, the "clearly a HEDGEHOG with SPIKY
brown-and-cream QUILLS, pointed snout, small low ears, NOT fluffy fur NOT a mane NOT big cat ears" re-roll gave a
proper spiky hedgehog at a flower stall, blank labels, kept; cat-tailor grey tabby in a blue waistcoat with a
yellow tape measure at a workbench, symmetric green eyes, colourful fabric bolts, no lettering) → 2 dense Flux-1.1-
Pro showpieces (japanese-garden 104 — red arched bridge over a koi pond, red maple + pink cherry blossom, pagoda,
stone lantern, purple irises; coral-reef 120 — vibrant full-coverage reef, green turtle, tropical fish, sunbeams).
Shelves: animals +3 (koala/corgi/kingfisher), portraits +1, fantasy +1, whimsical +2, scenes +2. FOUR CULLS (the two
hardest lanes + two washed cuties): **popart-lowbun-woman** (deep-skin) — muddy tan-not-brown skin with heavy grey
contour shadows down the sides + nose and visible sclera, the documented deep-skin gaze/patch trap, culled without a
wasted re-roll; **face-daisy-fair** (artface) — RE-ROLLED once (first roll had a grey/green contour shadow down one
side, the re-roll came back with heavy blotchy warm-brown mottling across the neck/chest, not one flat tone) —
artface never converges, prefer popart for faces, culled; **fantasy-mermaid-seahorse** — RE-ROLLED once (first roll
had big blank dark orb eyes + yellow under-eye streaks, the "SMALL eyes with iris+pupil+highlight NOT big blank dark
orbs" re-roll STILL had big dark orbs + a hazy dominant purple hair mass + white background patches), culled;
**cute-cavalier-puppy** — RE-ROLLED once (first roll was soft with a white-on-white wash + magenta contamination in
the chestnut; the bold-outline + blue-cushion + "NO purple NO magenta" re-roll fixed the outline but the two eyes
came back asymmetric — one dark one bluish mis-shaped — plus lingering purple patches), culled. NOTE the warm
low-colour puppies (corgi/cavalier) with lots of white wash out on a white ground; a soft pale-blue cushion + a very
bold outline rescues them (corgi saved, cavalier not). **974 → 983 PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07041820 (auto cron) shipped 12 gate-passed gems** (14 generated, 2 culls). RANGE 13 →
86 col: cuties (baby-otter warm chocolate-brown with a cream face + symmetric highlighted eyes floating with a
shell; baby-panda bold black-and-white munching bamboo + symmetric highlighted eyes; lion-cub warm golden-tan with
symmetric amber highlighted eyes in grass — all self-contrasting) → bird (bullfinch, rosy-red breast + black cap +
blue-grey back on a cherry-blossom branch, neat framed border) → 1 fair popart (sideswept-woman — even flat pale-
beige skin at sat 0.88, symmetric forward eyes, full forehead, rose lips, natural symmetric blush) → fantasy
(phoenix-flame a bold fiery orange-scarlet-gold firebird with wings spread against a soft pastel-blue sky, the bird
pops high-contrast; unicorn-waterfall white foal + pastel-rainbow mane + gold horn by a blue waterfall + rainbow,
bright) → whimsical (badger-beekeeper black-and-white badger in a straw hat + teal apron holding a honeycomb in a
sunny meadow, honey jars blank; tortoise-gardener green tortoise in dungarees watering flowers in a cottage garden,
symmetric friendly eyes, wordless seed packets) → floral (ranunculus-vase lush coral/peach/pink layered ranunculus
in a glass vase) → 2 dense Flux-1.1-Pro showpieces (tuscan-village 86 — honey-stone terracotta village, cypresses,
golden vineyards, red poppies, radiant sun; lavender-farm 82 — Provence purple lavender rows to a stone farmhouse,
sunflowers, cypresses, blue sky). Shelves: animals +4 (incl. bullfinch), portraits +1, fantasy +2, whimsical +2,
floral +1, scenes +2. TWO CULLS (both hardest lanes): **face-camellia-fair** (artface) — heavy grey contour shadows
+ blotchy patchy skin + dark under-eye hollows, the documented artface grey-shadow trap that rarely converges,
culled without a wasted re-roll (prefer popart for faces); **popart-locs-man** (deep-skin) — first roll had correct
symmetric forward eyes BUT a grey ashy cast across the mid-face/cheeks; the "one even WARM-brown tone, NO grey/ashy
patch" re-roll fixed the skin AND gave a bold coral background but the eyes came back glancing UP with white sclera
below (the documented deep-skin gaze trap) — worse trade, culled. NOTE: the working tree was reverted to HEAD by an
external watcher TWICE mid-run (once before enrich); renders survive in .loom-scratch, so re-adding the briefs and
re-running enrich/publish read them fine. **983 → 995 PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07041922 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 12 →
106 col: cuties (baby-raccoon blue-grey with a bold black bandit mask + cream chest + ringed tail, symmetric
highlighted eyes — self-contrasting; penguin-chick fluffy dove-grey with a dark cap white tummy orange beak+feet,
symmetric highlighted eyes, soft-on-pale but the cap/beak/feet anchor it; baby-fox warm russet-orange coat with a
cream muzzle/chest, symmetric amber highlighted eyes — warm fur stayed clean orange NOT magenta at cutie sat 1.15)
→ 1 fair popart (quiff-man — even flat pale-beige skin at sat 0.88, symmetric forward eyes, full forehead, swept
quiff + stubble) → fantasy (gnome-toadstool cheerful red-hatted gnome with a big white beard by red-and-white
toadstools in a bright green glade, face rightly hidden by beard/hat; pegasus-rainbow — RE-ROLLED: first roll had a
big blank dark blob eye + a soft white-on-pale outline, the "clear side-on pose with ONE small defined eye iris+
pupil+highlight NOT a blob, THICK bold outline" re-roll gave a crisp winged unicorn on clouds under a rainbow, kept)
→ whimsical (penguin-baker black-and-white penguin in a chef's hat holding a tray of iced cupcakes in a sunny
bakery, symmetric highlighted eyes, no lettering; frog-fisherman green frog in yellow dungarees + straw hat on a
mossy rock by a blue pond with a rod, cattails, floats, symmetric eyes, no lettering) → bird (blue-tit cobalt cap+
wings + yellow breast + white cheek on a pink apple-blossom branch, crisp high-contrast, neat border) → 2 dense
Flux-1.1-Pro showpieces (santorini-village 102 — whitewashed Greek village + blue domes + bougainvillea over a
sparkling Aegean sea, windmills, bright daytime; dutch-tulip-fields 106 — vivid striped tulip fields to a windmill +
canal + farmhouse, bright spring daytime). Shelves: animals +3, portraits +1, fantasy +2, whimsical +2, floral +1,
scenes +2. TWO CULLS (both hardest lanes): **face-rose-fair** (artface) — a heavy dark shadow patch down the right
cheek/jaw + pink blotching, the documented artface grey-shadow trap that rarely converges, culled without a wasted
re-roll (prefer popart for faces, already had a clean fair popart); **popart-boxbraids-woman** (deep-skin) — first
roll had good deep warm-brown skin BUT the eyes glanced sideways with white sclera below (the deep-skin gaze trap);
the tightened forward-gaze re-roll FIXED the eyes but flooded the forehead/cheeks/nose with big pink blush blotches
(the deep-skin blush-contamination trap) — worse trade, culled. NOTE: baby-fox confirms warm-orange fur is SAFE in
the cutie lane (sat 1.15) — the magenta cook is a SCENE-lane (sat 1.3) problem, not a cutie one. **995 → 1006
PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07042021 (auto cron) shipped 12 gate-passed gems** (13 generated, 1 cull). RANGE 11 →
111 col: cuties (baby-rhino lavender-grey with pink belly + bold charcoal outline + green grass base + two clear
symmetric eyes — RE-ROLLED: first roll ghosted on pale fabric with NO eyes, just a nose blob → "solid green base,
VERY THICK bold charcoal outline, TWO large eyes side-by-side" fixed it; grey-kitten-bell grey tabby with clear
green symmetric eyes + red collar + pink yarn; duckling-daisy yellow chick — RE-ROLLED: first roll's feet cooked to
red/magenta blobs → clean bright ORANGE feet + beak at cutie sat 1.25) → bird (long-tailed-tit soft garden bird +
long tail on pink blossom, neat border) → fantasy (unicorn-castle white unicorn + pastel rainbow mane + pink
fairytale castle + rainbow, one defined eye; mermaid-grotto chibi mermaid + auburn hair + teal tail in a sparkling
coral grotto, two clear symmetric eyes) → 1 fair popart (messybun-woman — clean even pale-beige skin at sat 0.88,
symmetric forward eyes, full forehead, loose bun) → 1 fair artface (magnolia-fair — RE-ROLLED: first roll had the
documented artface grey-gaunt shadow trap → "SIMPLE FLAT POSTER style, ONE solid tone, NO contouring, full un-gaunt
cheeks" re-roll gave an even warm pretty flower-crown face, only soft tan modelling left, marginal keep) → whimsical
(penguin-gardener B&W penguin in a green apron in a sunny greenhouse, symmetric eyes, no lettering; mouse-bookseller
grey mouse in a teal waistcoat + round glasses in a bookshop — RE-ROLLED: first roll flooded the whole scene in one
orange/amber tone → teal waistcoat + "clearly SEPARATED blue/green/red/cream book spines, cool daylight" at scene
sat 1.15 gave a balanced bright bookshop, blank spines no lettering) → 2 dense Flux-1.1-Pro showpieces (bruges-canal
107 — vivid step-gabled canal houses reflected in a green canal + bell-tower + swans, bright daytime; fairground-
carousel 111 — festive vintage fair with a striped carousel + Ferris wheel + tents + flower beds, sunny daytime).
Shelves: animals +4 (incl. long-tailed-tit), fantasy +2, portraits +2, whimsical +2, scenes +2. ONE CULL:
**popart-highfade-man** (deep-skin) — both the first roll AND the re-roll had pink/salmon patches baked across the
forehead/nose/cheeks that sat 1.1 can NOT remove (the documented deep-skin blush-contamination trap), culled after
its one re-roll (already had a clean fair popart + artface). Lessons RECONFIRMED: (1) deep-skin popart blush-patch
contamination stays the #1 failure mode — cull fast, sat fixes base tone not baked patches; (2) artface grey-gaunt
shadow trap sometimes converges with an aggressive FLAT-POSTER re-roll (magnolia-fair saved) but keep artface
fair-only; (3) pure-pale cuties (baby-rhino) need a green base + very bold charcoal outline + explicitly TWO eyes or
they ghost eyeless on ivory; (4) cutie-lane orange over-cook on webbed feet fixed by lowering to sat 1.25. **1006 →
1018 PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07042120 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE 13 →
118 col: cuties (baby-meerkat sandy-tan upright with symmetric highlighted eyes + a tiny cactus at sat 1.2 — warm
tan stayed clean; baby-hedgehog — RE-ROLLED: first roll had three confused dark spots on the face (nose read as a
third eye), the "EXACTLY TWO eyes side by side at the same height, nose set BELOW and between them, not three dark
spots" re-roll gave a clear spiky brown-cream hedgehog with two proper eyes + a toadstool, kept) → 1 fair popart
(sleekpony-woman — even pale-beige skin at sat 0.88, symmetric forward eyes, full forehead, sleek pulled-back
updo) → fantasy (fairy-bluebell — RE-ROLLED: first roll had flat blank dark-orb eyes, the "small defined eyes with
a visible coloured iris ring + pupil + white highlight, NOT big blank orbs" re-roll gave symmetric big-eyed-style
eyes WITH highlights, a pretty flower-crown fairy in a bluebell meadow, kept; dragon-hatchling chubby emerald baby
dragon breaking out of a cracked egg in a straw nest, big shiny symmetric highlighted eyes, bright sky-blue) →
whimsical (panda-bookseller — RE-ROLLED: first roll had a garbled gibberish shop SIGN above the door (hard-fail
text), the "shelves fill the ENTIRE background, absolutely NO sign NO nameboard NO window NO door, no lettering
anywhere" re-roll removed the sign entirely — bespectacled panda + burgundy waistcoat + blank separated spines,
kept; duck-florist yellow-and-white duck in a green apron at a flower stall, symmetric eyes, blank price tags, no
lettering) → bird (chaffinch rosy-pink breast + blue-grey crown + chestnut back on white hawthorn blossom, neat
border) → 2 dense Flux-1.1-Pro showpieces (moroccan-souk 118 — vibrant spice-market lane with keyhole arches
lanterns rugs + robed shoppers; tropical-waterfall 95 — turquoise jungle waterfall lagoon with hibiscus orchids +
parrots). Shelves: animals +3, portraits +1, fantasy +2, whimsical +2, scenes +2. THREE CULLS: **popart-twa-woman**
(deep-skin) — heavy pink blush blotches on cheeks + forehead + sideways gaze with sclera, the documented deep-skin
blush+gaze traps, culled without a wasted re-roll (already had a clean fair popart); **face-wildrose-fair**
(artface) — blotchy mottled pink-and-tan patches + grey side contour, the artface non-converging trap, culled fast;
**cute-baby-skunk** — RE-ROLLED once (black-on-white ghosting + hot-pink cheek/ear blobs + malformed eyes; the
"NO pink NO magenta anywhere, two clear symmetric eyes, bold outline" re-roll STILL had pink ear/cheek blobs +
muddy undefined eyes), culled. NOTE: black-and-white cuties on ivory fabric are a wash/muddy trap like the pale
ones — the skunk never resolved clean eyes; prefer self-contrasting COLOURED cuties (grey/tan). **1018 → 1028
PUBLIC.** Deploy green + /healthz 200.

**2026-07-04 — Batch 07042221 (auto cron) shipped 11 gate-passed gems** (13 generated, 2 culls). RANGE 12 →
109 col: cuties (baby-koala blue-grey with a pale chest + big dark oval nose + two symmetric highlighted eyes on a
eucalyptus branch — self-contrasting on ivory; baby-red-squirrel warm russet with a bushy tail + acorn, symmetric
highlighted eyes, warm fur stayed clean russet NOT magenta at cutie sat 1.2; tiger-cub orange with BOLD black
stripes + white muzzle, two clear symmetric eyes — the bold stripes make it strongly self-contrasting) → bird
(wren — RE-ROLLED: first bright-lane roll cooked hot-magenta patches across the throat/breast + a muddy smudged
eye; the "natural chestnut-brown/buff/cream ONLY, NO pink NO magenta, ONE clear dark eye with a white highlight" +
sat 1.15 re-roll gave a clean warm chestnut-and-orange wren, kept) → 1 fair popart (wavylob-woman — even pale-
beige skin at sat 0.88, symmetric forward eyes, full forehead, soft symmetric blush, chic wavy bob) → fantasy
(mermaid-seahorse chibi mermaid + turquoise hair riding a golden seahorse, two big symmetric highlighted chibi
eyes, bright underwater; baby-griffin fluffy golden eagle head + tawny lion body, big symmetric highlighted eyes,
bright sky) → whimsical (mouse-clockmaker grey mouse + round glasses + brown waistcoat in a workshop of clocks
with BLANK tick-only faces, symmetric forward eyes, no signage no lettering; owl-painter brown owl + beret + blue
smock at an easel with a WORDLESS sun-and-hills canvas, symmetric forward eyes, no lettering) → 2 dense Flux-1.1-
Pro showpieces (japanese-garden 109 — red arched bridge over a koi pond, cherry blossom, pagoda, stone lanterns,
bright springtime; coral-reef 107 — vivid reef with clownfish/tangs/angelfish + a green sea turtle + corals +
sunbeams, bright sunlit water). Shelves: animals +4 (incl. wren), fantasy +2, portraits +1, whimsical +2, scenes
+2. TWO CULLS (both hardest lanes): **face-cosmos-fair** (artface) — heavy grey contour down the right side +
dark under-eye hollows + patchy gaunt modelling, the documented artface grey-shadow trap that rarely converges,
culled without a wasted re-roll (prefer popart for faces, already had a clean fair popart); **popart-bantuknots-
woman** (deep-skin) — eyes glancing sideways with white sclera below (gaze trap) AND pink blush patches on the
cheeks (blush-contamination trap) simultaneously, the two documented deep-skin traps a single re-roll only trades,
culled fast. Lessons RECONFIRMED: (1) bright-lane birds cook warm tones to hot-magenta at SRC_SAT 1.5 — a sat~1.15
override + explicit "natural browns ONLY, NO pink/magenta" fixes it in one re-roll; (2) tiger-cub confirms bold
black markings make an orange cutie strongly self-contrasting on ivory; (3) deep-skin popart double-trap (gaze +
blush) is still the #1 cull — cull fast when a clean fair popart is already in hand. **1028 → 1039 PUBLIC.**
Deploy green + /healthz 200.

**2026-07-05 — Batch 07051139 (auto cron) shipped 9 gate-passed gems** (13 generated, 4 culls — the gate held
hard on the four hardest lanes). RANGE 12 → 111 col: cuties (baby-owl warm tawny-and-cream owlet with TWO big
symmetric amber highlighted eyes + orange beak on a branch; baby-elephant soft blue-grey with big symmetric
highlighted eyes + pink inner ears holding a pink flower — both self-contrasting on ivory) → bird (goldfinch —
RE-ROLLED: the first roll bled the crimson face onto the breast as magenta patches with a muddy head, the "crimson
confined to the small face mask ONLY, clean creamy-white breast with NO red, crisp black-and-white head" re-roll
gave a proper clean goldfinch on purple thistles, kept) → 1 fair popart (topknot-woman — even flat pale-beige skin
at sat 0.88, symmetric forward eyes, full forehead, neat high top-knot, red lips) → fantasy (fairy-poppy — RE-
ROLLED: first roll had big blank green orb eyes + no clear mouth, the "TWO small neat eyes with a defined green
iris ring + pupil + highlight NOT big blank orbs, clear smiling mouth" re-roll gave a sweet symmetric-eyed chibi
fairy beside a red poppy, kept; unicorn-rainbow white unicorn + pastel-rainbow mane + gold horn leaping over clouds
under a rainbow, one defined eye, bright sky-blue) → whimsical (cat-gardener grey tabby in a straw hat + green
apron with big symmetric green eyes among delphiniums/tulips/terracotta pots, blank sign, bright separated colours)
→ 2 dense Flux-1.1-Pro showpieces (venice-canal 111 — colourful Venetian palazzos + gondolier on a green canal +
bell-tower, bright daytime; alpine-village 104 — wooden chalets + white church + grazing cows + wildflower meadow +
stream + snow-capped mountains). Shelves: animals +3 (incl. goldfinch), portraits +1, fantasy +2, whimsical +1,
scenes +2. Master-list subjects covered: theme 4 bird (goldfinch), theme scenes (Venice, alpine village). FOUR
CULLS: **face-peony-fair** (artface) — heavy grey/pink contour shadows + blotchy mottled skin down one side, the
documented artface grey-shadow trap that rarely converges, culled fast (prefer popart for faces, already had a
clean fair popart); **popart-fulani-woman** (deep-skin) — pink blush blotches on both cheeks + heavy grey/ashy
mottled skin cast (not one even warm brown), the documented deep-skin popart trap that does NOT respond to
prompting, culled without a wasted re-roll; **cute-baby-red-panda** — RE-ROLLED once (both rolls had dark-blob eyes
+ an oversized dark nose + magenta patches flooding the cheeks and body), the mask-eye + magenta trap (like
raccoon/meerkat/skunk) that rarely converges, culled after one re-roll; **scene-rabbit-baker** — RE-ROLLED once
(first roll was muted/beige-flooded and hazy; the re-roll brightened the background jars BUT gave the rabbit an
uncanny elongated stern muzzle + a washed pale top third), neither roll a clean keep, culled (cat-gardener already
covers the whimsical lane). **1039 → 1048 PUBLIC.** Deploy green + /healthz 200.

**2026-07-05 — Batch 07051220 (auto cron) shipped 10 gate-passed gems** (12 generated, 2 culls). RANGE 15 → 111
colours: 1 simple cutie (baby alpaca), 3 portraits (goddess-braids deep-skin popart — clean deep brown, kept first
roll; sleek-ponytail fair popart; hydrangea-crown artface — RE-ROLLED once, first roll had the documented artface
brown/grey contour-shadow + blotchy skin, a heavier "ONE flat even tone, blush only as two flat spots" brief fixed
it → kept), 1 fantasy fairy (RE-ROLLED once — first roll rendered a DOUBLED/conjoined face, "ONE single fairy, one
face, blonde hair contrasting the rose" re-roll fixed it → kept), 2 non-red-fur whimsical scenes (badger-bookseller,
panda-florist — both clean, wordless props), 1 bird (bullfinch → Animals), 2 dense showpieces (Edinburgh Royal Mile
111, cherry-blossom-park 100). Shelves: animals +2, portraits +3, fantasy +1, whimsical +2, scenes +2. Master-list
subjects covered: theme 4 bird (bullfinch), theme 20/21 scenes (Edinburgh, cherry-blossom park). TWO CULLS:
**cute-baby-polarbear** — RE-ROLLED once, both rolls rendered a white cub on pale fabric that barely reads (white-on-
white ghosting the outline prompt could not overcome), culled — avoid all-white animals in the cute lane;
**cute-quokka** — RE-ROLLED once (first roll over-orange + magenta artefacts; the re-roll fixed the warmth but left
asymmetric eyes — one squinting), culled after one re-roll. **1048 → 1058 PUBLIC.** Deploy green + /healthz 200.

**2026-07-05 — Batch 07051321 (auto cron) shipped 10 gate-passed gems** (13 generated, 3 culls). RANGE 13 → 109
colours: 3 simple cuties (baby-panda — RE-ROLLED once, first roll had a smudgy muddy face with unclear/asymmetric
eyes swallowed by the patches, a "TWO clear black eye-patches SAME size and level, each a small CRISP separate eye
inside its patch, neat black nose, clean white muzzle NOT smudgy" re-roll fixed it → a crisp bold black-and-white
cub, kept; penguin-chick blue-grey fluffy chick with two symmetric highlighted eyes + orange beak, self-contrasting
on ivory; baby-giraffe cream-and-golden with clear brown patches + two symmetric highlighted eyes) → bird (blue tit
on apple blossom — cobalt cap + black eye-stripe + yellow breast, clean first roll) → 1 fair popart (fringebob-woman
— even pale-beige skin at sat 0.88, symmetric forward eyes, full forehead below a blunt fringe) → fantasy (mermaid-
dolphin chibi mermaid riding a smiling grey dolphin, symmetric defined chibi eyes, bright underwater; fairy-toadstool
— RE-ROLLED once, first roll was hazy/bloomed pale-yellow all over, a "clear CRISP bright sky-blue + green
background, NO glare NO bloom NO overexposed haze, wings with crisp edges" re-roll gave a bold red toadstool + clear
symmetric-eyed fairy, kept) → 1 whimsical (hedgehog-greengrocer at a bright market stall of vivid separated produce,
wordless tags) → 2 dense Flux-1.1-Pro showpieces (amsterdam-canal 109 — Dutch gabled canal houses + bridge + tulips
+ bikes, bright daytime; tuscan-village 107 — honey-stone houses + terracotta roofs + cypress + sunflowers + hilltop
castle, golden daytime). Shelves: animals +4 (incl. blue tit), portraits +1, fantasy +2, whimsical +1, scenes +2.
Master-list subjects covered: theme 4 bird (blue tit), theme 20/21 scenes (Amsterdam, Tuscan village). THREE CULLS:
**popart-roundafro-woman** (deep-skin) — heavy pink/coral blush patches across forehead cheeks and nose + orange
highlight blotches, skin not one even brown, the documented deep-skin double-trap that does NOT respond to prompting,
culled without a wasted re-roll; **face-daisy-fair** (artface) — grey/green contour shading down one side of the
face + neck + grey under-eye hollows + blotchy painterly modelling, the documented artface grey-shadow trap that
rarely converges, culled fast (prefer popart for faces, already had a clean fair popart); **scene-owl-clockmaker**
(whimsical) — RE-ROLLED once (first roll beige/brown-flooded one-tone with faint clock-face marks; the re-roll added
bright separated clock cases BUT stayed muddy/hazy with a murky beige background and slightly mismatched eyes),
still under the crisp-bright bar after one re-roll → culled, accepting 1 clean whimsical over forcing a murky second.
NOTE: worked in an ISOLATED WORKTREE this run — a concurrent session doing its own fetch+rebase in the shared main
checkout clobbered the in-progress brief edits once; the worktree avoided any further collision. **1058 → 1068
PUBLIC.** Deploy green + /healthz 200.

**2026-07-05 — Batch 07051604 (auto cron) shipped 8 gate-passed gems** (13 generated, 5 culls — the gate held
hard on the batch's four hardest lanes). RANGE 13 → 104 col: cuties (baby-hippo soft blue-grey with a big rounded
snout + two symmetric highlighted eyes + a pink cheek among lily pads, self-contrasting on ivory; baby-badger bold
black-and-white striped face + silvery-grey body among grass and toadstools, two small symmetric eyes within the
stripes, strong self-contrast) → bird (great-tit blue-black head + white cheek + lemon-yellow breast with a black
stripe, perched on a berried twig, one clear eye, clean first roll NO magenta) → 1 fair popart (curtainbangs-woman
— even flat pale-beige skin at sat 0.88, symmetric forward eyes, full forehead below centre-parted curtain bangs,
soft blush) → fantasy (unicorn-meadow white unicorn foal + pastel-rainbow mane + gold horn in a wildflower meadow
under a rainbow, one clear defined eye, bright sky-blue) → whimsical (bear-bookseller brown bear + round glasses +
blue waistcoat holding a BLANK book in front of shelves of colourful blank-spined books, two symmetric eyes facing
forward, no lettering, bright separated colours) → 2 dense Flux-1.1-Pro showpieces (santorini-village 94 —
whitewashed cliffside houses + blue domes + pink bougainvillea over a deep-blue Aegean sea, bright daytime;
provence-lavender 104 — purple lavender rows sweeping to a honey-stone farmhouse with a red roof + cypress +
rolling fields, golden daytime). Shelves: animals +3 (incl. great-tit), portraits +1, fantasy +1, whimsical +1,
scenes +2. Master-list subjects covered: theme 4 bird (great tit), theme 20/21 scenes (Santorini, Provence). FIVE
CULLS: **popart-shorttwists-woman** (deep-skin) — first roll dark/muddy with mottled grey shadows + pale blotches;
the brighter flat-even re-roll only TRADED it for orange contour flooding the centre of the face + a pale glowing
forehead orb, the documented deep-skin trap a single re-roll only trades, culled (no deep-skin popart this batch —
correct per playbook, don't force it); **face-lavender-fair** (artface) — patchy pale blotches across the forehead
and cheeks with uneven modelling, the documented artface grey/blotch trap that rarely converges, culled fast
WITHOUT a wasted re-roll (a clean fair popart already in hand); **fantasy-fairy-daisy** — RE-ROLLED once (first roll
had hot-magenta smears round the wings + a muddy haze; the re-roll cleared the magenta and gave a sweet symmetric-
eyed face BUT the upper background stayed hazy pale-yellow bloom under the crisp-bright bar), culled (unicorn covers
fantasy); **cute-baby-fox** — RE-ROLLED once (first roll had stray pink/magenta stitches + merged black legs; the
lower-sat re-roll cleared the magenta and separated the legs BUT washed the fox pale with faint/absent eyes and a
weak outline), neither roll a clean keep, culled (hippo + badger meet the cutie minimum); **scene-beaver-baker**
(whimsical) — RE-ROLLED once (first roll was warm/beige-flooded with a ginger beaver, the documented warm-fur trap;
the grey-brown + cool-colour re-roll fixed the flood BUT over-corrected to a muted/hazy scene with a soft unclear
beaver face), culled (bear-bookseller covers whimsical). Lessons RECONFIRMED: deep-skin popart double-trap is still
the #1 cull and a single re-roll only trades faults; artface grey/blotch trap culls fast when a clean fair popart
is in hand; the cute/whimsical warm-fur (fox, ginger beaver) magenta/flood trap is a two-sided knife — raising sat
cooks magenta, dropping it washes the piece pale. **1068 → 1076 PUBLIC.** Deploy green + /healthz 200.

**2026-07-05 — Batch 07051643 (auto cron) shipped 9 gate-passed gems** (13 generated, 4 culls — the gate held
hard on ALL THREE face lanes plus one warm-fur cutie). RANGE 14 → 111 col: cuties (baby-hedgehog warm-brown spiny
coat + cream face + TWO symmetric highlighted eyes + dark nose among green leaves and a red berry, strong self-
contrast on ivory; grey-kitten — RE-ROLLED once, first roll had messy amber eyes full of red/yellow colour noise +
a magenta nose-smear + pink flooding the grey fur, a "clean even blue-grey fur NO pink NO magenta anywhere, each eye
a clean amber iris + single dark pupil + one white highlight and NOTHING else inside it, ONE small clean pink nose"
re-roll gave a sweet clean symmetric-eyed British-shorthair kitten with a purple flower, kept) → bird (robin —
warm orange-red breast cleanly confined to the breast/face with NO magenta bleed, brown-grey back, on a mossy twig
framed by green holly and red berries, one clear eye, clean first roll) → fantasy (dragon-treasure chubby emerald
baby dragon with ONE well-defined eye curled round a bright pile of red/blue/purple gems + gold, cheerful crisp;
mermaid-pearl chibi mermaid with auburn hair + TWO symmetric defined blue eyes holding a pearl in an open clam +
orange starfish, bright underwater) → whimsical (penguin-greengrocer black-and-white penguin in a green apron at a
bright produce stall with steel scales + blank tags, two symmetric forward eyes, striped awning, clean and bright;
hedgehog-tailor brown hedgehog in round glasses + waistcoat sewing colourful patchwork with vivid separated thread
spools, wordless props — focal area charming though the upper-third background runs a touch beige) → 2 dense Flux-
1.1-Pro showpieces (hallstatt-lake 100 — pastel red-roofed alpine village + church spire + boats on a blue lake
reflecting snow-capped peaks; english-cottage-garden 111 — thatched rose-clad cottage + deep hollyhock/foxglove/
delphinium borders + lily pond + terracotta pots, bright summer). Shelves: animals +3 (incl. robin), fantasy +2,
whimsical +2, scenes +2; portraits +0 this batch. Master-list subjects covered: theme 4 bird (robin), theme 20/21
scenes (Hallstatt alpine village, English cottage garden). FOUR CULLS — ALL THREE FACES fell plus one warm-fur
cutie: **popart-flattwists-woman** (deep-skin) — mottled grey contour shadows down one side + pale glowing highlight
blotches on forehead/cheek/chin, not one even brown, the documented deep-skin double-trap that does NOT respond to
prompting, culled WITHOUT a wasted re-roll (no deep-skin popart this batch — correct per playbook, don't force it);
**face-tulip-fair** (artface) — heavy grey contour shadows down BOTH sides + a hazy washed lower face dissolving
into the background bloom, the documented artface grey-shadow/haze trap that rarely converges, culled fast (the
tulip crown was lovely but the face is the point); **popart-messybun-woman** — first roll had grey/olive contour
shadows + grey under-eye hollows (the grey-shadow trap creeping into the popart lane); the heavier "ONE flat even
tone edge to edge, NO grey contour NO under-eye hollows, blush only two flat spots" RE-ROLL came back ⚠️FLAT (a dead
1-colour generation), culled — no fair popart landed so portraits shipped 0 (acceptable, don't force faces);
**cute-beagle-puppy** — RE-ROLLED once (first roll cooked the tan ears bright orange + a seam line down the face +
weak washed outlines on the white legs; the re-roll traded it for stray magenta outline stitches + asymmetric eyes,
still orange), the warm-fur-dog cook (orange + magenta two-sided knife), culled after one re-roll (hedgehog + grey-
kitten meet the cutie minimum). Lesson RECONFIRMED: all three FACE lanes are the batch's hardest — deep-skin popart
+ artface both cull on the grey-shadow/blotch trap, and a fair popart can still catch grey contouring; a batch
shipping 0 portraits is fine, never force a shadowed face. **1076 → 1085 PUBLIC.** Deploy green + /healthz 200.

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
