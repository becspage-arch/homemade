# Homemade — Pipeline setup: Pottery & ceramics

**Model:** Opus (pipeline-setup batch, per `feedback_model_choice.md`)
**Session title:** `Homemade - Pipeline setup: Pottery & ceramics`

## Goal

Land everything Pottery & ceramics needs before its first autopilot batch fires. After this session, `Category.pipelineStatus` for `pottery-ceramics` flips `NOT_READY → READY`, the round-robin queue picks it up automatically.

## Scope — in

### 1. Authoring prompt — `docs/pottery-ceramics-author.md`

Mirror `docs/tutorial-author.md` v5 and `docs/baking-author.md`. Required sections:

- **Voice rules** — factual, anti-AI per `feedback_homemade_voice.md`. Cooking-recipe-clean.
- **Equipment-barrier honesty is non-negotiable.** The category splits into two sub-tracks weighted ~70 / 30:
  - **No equipment needed (~70%)** — pinch, coil, slab, drape moulds, sprig moulds, hump moulds, surface decoration techniques on air-dry / polymer clay, paper-clay alternatives.
  - **Wheel + kiln required (~30%)** — throwing, glaze formulation, firing schedules, raku, sgraffito on greenware, mishima inlay.
- **Frontmatter flags (added to Tutorial schema if not already present — check schema first; only add if missing):**
  - `requiresKiln: boolean`
  - `requiresWheel: boolean`
  - Both default `false`. Set `true` per tutorial as appropriate. The list page filters and clearly badges tutorials that need equipment.
  - If you have to add these fields, it's an additive migration — same shape as `Tutorial.excludedImageSources`. Don't forget the Prisma client regen.
- **Sub-categories** (registered in step 3):
  - `hand-building-no-equipment` (pinch, coil, slab, draped, drop, hump, polymer, air-dry)
  - `surface-decoration` (sgraffito, mishima, slip-trailing, terra sigillata, burnishing, carving, stamping, impressing)
  - `throwing` (centring, opening, pulling, trimming, foot rings)
  - `glazing` (dipping, brushing, pouring, spraying, layering)
  - `firing` (bisque schedules, glaze schedules, raku, pit fire, electric kiln, gas reduction)
  - `clay-fundamentals` (clay body selection — earthenware / stoneware / porcelain, wedging, reclaim, drying, leather-hard, bone-dry, greenware, bisque, glazeware)
- **Glaze chemistry safety preamble (drop into every glazing / firing tutorial)** —
  - **Silica dust** is the primary chronic hazard. Silicosis is irreversible. Wet-clean only — no sweeping, no compressed air, no dry sanding. N95 mask + wet-mop for studio cleanup. Greenware sanding done outdoors with a mask.
  - **Lead-free only.** Do not reproduce any historical lead-glaze recipe even with a "don't use" caveat — readers may try anyway. List acceptable substitutes (Gerstley borate, frit-based, lithium carbonate where appropriate).
  - **Heavy metals** — barium carbonate, manganese dioxide, copper carbonate, chromium oxide — handle with gloves + mask, never near food prep, never on food-contact surfaces unless food-safe-tested.
  - **Kiln firing safety** — ventilation (downdraft vent or open window + extractor), peephole-watching with welder's glasses (lithium / cobalt flash), never opening a hot kiln under ~80°C, fire extinguisher (Class A) within reach.
- **Materials registry must distinguish trained-environment-only materials.** Add a flag `trainedEnvironmentOnly: boolean` to the master materials table (additive migration). Set `true` for raw silica powder, heavy-metal oxides used at studio quantity, and any glaze raw material that requires respirator + dedicated mixing space. Set `false` for pre-mixed commercial glazes sold for home use.
- **Cross-category links** — Natural home (handmade tableware, candle holders, soap dishes), Sustainability (clay reclaim, kiln efficiency).
- **PD canon thin and dated.** Most modern pottery texts are copyrighted. Use:
  - Late 19th / early 20th-century industrial pottery manuals (Cassell's, Mortimer Wheeler)
  - Japanese / Chinese historical glaze treatises (translation-pending sourcing — handle carefully)
  - Technique fundamentals are uncontroversial and don't need a PD source citation. State "traditional technique" rather than fabricating an attribution.
  - **Forbidden:** Bernard Leach's "A Potter's Book" (1940, copyright held), Daniel Rhodes's "Clay and Glazes for the Potter" (copyright), Robin Hopper, Mastering Cone 6 Glazes — no reproduction of recipes or text.
- **Image rubric (stricter for finished items)** — pottery is era + technique + glaze + form specific. A modern slip-cast mug doesn't illustrate a hand-built coil pot. Wikimedia museum open-access (V&A, Met, Smithsonian) abundant and excellent. Procedural card preferred over off-technique photo.

### 2. No chart renderer needed

Pottery uses step-photos + form diagrams (cross-sections of pot profiles, foot-ring geometry). No symbolic chart renderer required. SVG cross-sections inserted as static `Media` rows with `type: ILLUSTRATION` (same as cooking process diagrams).

### 3. Taxonomy seed — `packages/db/scripts/seed-pottery-ceramics-taxonomy.ts`

- Upsert the 6 sub-categories above with parent `pottery-ceramics`.
- Idempotent, `--dry-run`.

### 4. Master tools + materials registry contribution

**Extend existing tables — do not fork.**

- **Materials — clay bodies:** earthenware (red, white), stoneware (B-mix, speckled, smooth), porcelain (Standard 365, P-grogged), paper clay, polymer clay (Sculpey, Fimo), air-dry clay (Crayola, DAS).
- **Materials — glaze raw (TRAINED-ENVIRONMENT-ONLY flag where appropriate):** silica (flint), kaolin (EPK, Tile 6), feldspar (Custer, G-200, soda spar), Gerstley borate (or substitute), whiting (calcium carbonate), wollastonite, talc, dolomite, lithium carbonate, frit 3124 / 3134 / 3195, bentonite. Colourants: cobalt carbonate, copper carbonate, iron oxide red, iron oxide yellow, manganese dioxide, chromium oxide, rutile, nickel oxide.
- **Materials — slip + engobe:** porcelain slip, coloured slips (red, black, white, blue, green — recipe-based, not brand-based), terra sigillata (red, white), wax resist, latex resist.
- **Materials — pre-mixed glazes (no trained-environment flag):** Amaco Velvet underglazes, Mayco Stroke & Coat, Spectrum, Botz — for the no-equipment / classroom-style tutorials.
- **Tools — hand-building:** wooden ribs (assorted shapes), metal ribs (kidney, square), kemper tools (loop tool, needle tool, fettling knife, sponge, chamois, calipers), wire cutter, rolling pin, slab roller (optional), wooden boards, plaster bats, drape moulds (bowls, plates), sprig moulds, stamps.
- **Tools — throwing:** potter's wheel (kick / electric — Brent, Shimpo, Pacifica), bats (plaster, plywood, wedge), throwing sticks, calipers, pin tool, sponge on stick, splash pan, throwing chuck.
- **Tools — trimming:** trimming tools (assorted loops), banding wheel, calipers, foot-ring chuck.
- **Tools — surface:** carving tools (linoleum cutter, dentist's pick, custom needle tools), brushes (mop, liner, hake, fan, glaze mop), slip-trailers (rubber bulb, plastic bottle, traditional bird-shaped).
- **Tools — glazing:** glaze tongs, dipping buckets, sieves (60 / 80 / 100 mesh), hydrometer, glaze whisk, ball mill (optional).
- **Tools — firing:** electric kiln (small home: skutt 818 size, mid: skutt 1027), gas kiln (advanced, not for v1 setup), pyrometric cones (cone 06 / 04 / 6 / 10), pyrometer with thermocouple, kiln shelves, kiln posts, kiln wash, stilts (for low-fire only — not stoneware).
- **Tools — safety:** N95 mask, P100 respirator (for raw materials), studio apron, mixing bucket (dedicated, not food-shared), wet-cleanup kit (sponge, bucket, mop), fire extinguisher (Class A).

### 5. Schema additions (if needed)

Check `packages/db/prisma/schema.prisma` before adding. Add only if missing:

- `Tutorial.requiresKiln Boolean @default(false)`
- `Tutorial.requiresWheel Boolean @default(false)`
- `CraftMaterial.trainedEnvironmentOnly Boolean @default(false)` (or whatever the master materials table is named — check what the sewing pipeline laid down).

Additive migrations only. Regenerate Prisma client + commit.

Update the public tutorial list-page + tutorial detail-page to badge tutorials with `requiresKiln` / `requiresWheel` ("Requires a kiln · Requires a wheel"). Filter on the list page so users can hide them.

### 6. Flip pipeline status

`packages/db/scripts/flip-pottery-ceramics-ready.ts`:

```sql
UPDATE "Category" SET "pipelineStatus" = 'READY' WHERE slug = 'pottery-ceramics';
```

### 7. BUILD_PROGRESS.md entry

Append "Pottery & ceramics pipeline ready" entry with commit refs + 6 sub-categories + the two new Tutorial schema flags + the equipment-barrier split policy.

## Scope — out

- **Don't author tutorials.**
- **Don't include any lead-glaze recipe, even with a "do not use" caveat.**
- **Don't write industrial slip-casting or jigger-jolly production tutorials.** Out of home scope.
- **Don't include gas-kiln-building tutorials.** Too specialised + safety-heavy. Add later if Rebecca decides.
- **Don't include glass / lampwork.** Different category entirely (could be added later if needed).
- **Don't pad the 500 target with throwing tutorials a kiln-less reader can't do.** The 70/30 weighting is the contract.

## Deploy verification (mandatory)

After every push:
1. `gh run watch` and confirm CI passes (build, typecheck, prisma migrate deploy).
2. Fix failures with a new commit.
3. `curl -fsS https://homemade.education/healthz` returns 200.
4. Smoke-test the tutorial list page filters work for the new `requiresKiln` / `requiresWheel` flags.
5. Only then report the session done.

## Hand-off style

Short plain-English summary: what landed, schema flags added, what's deferred (lead glazes, glass, gas kiln building), what the autopilot will start producing.
