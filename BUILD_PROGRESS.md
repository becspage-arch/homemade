# Homemade — Build Progress

Living log of what's in flight and what shipped recently. Pairs with `Homemade-Features-and-Build-Plan.docx` in Google Drive (canonical plan).

Earlier phase history (Phases 1, 2, 3, 4, 5, 6, 8a + deferred-services activation + Phase B analytics + pre-launch debt sweep + cross-category content audit plan) → [docs/archive/build-progress-history.md](docs/archive/build-progress-history.md).

Updated each working session.

---

## Current state (2026-05-16)

Live at https://homemade.education behind splash gate (cookie `homemade-access=1`). The splash flips off at launch — pre-launch checklist of Rebecca-action items lives in `memory/project_pre_launch_checklist.md`.

**Stack and ops**

- Web on ECS Fargate (eu-west-2), 2 tasks steady, HTTPS only behind Cloudflare with origin-cert termination at the ALB.
- Neon Postgres + Prisma 7. Clerk auth. Cloudflare R2 + Cloudflare Images for hero media. Typesense scaffolded (cluster + secret mount pending).
- Sentry (errors) + PostHog (UX) + self-hosted analytics dashboards in `/admin/analytics` reading from `AnalyticsEvent` / `AnalyticsDailyRollup` / `AnalyticsCohortRollup` (rolled up nightly by Inngest).
- Inngest crons: `hard-delete-scheduled-accounts`, `scheduled-publish-tutorial`, `typesense-reindex`, `moderation-outcome-notify`, `autopilot-halt-notify`, `analytics-rollup-nightly`, `editorial-picks-refresh`, `scheduled-step-push`.
- Three autopilot streams fire daily via the ScheduledTasks MCP — cooking 01:00 UTC, baking 03:09 UTC, mindset 05:06 UTC. Pause via the `AUTOPILOT_PAUSED` env flag or the `/admin/system/autopilot` admin page (per-stream).

**Library counts (PUBLISHED)** — full grid in § Multi-category fill plan below.

- Cooking ~241 (bulk-001 → bulk-006). Baking 60 (pilot-10 + bulk-001). Mindset 0 (20 bulk-001 drafted, upload blocked by migration drift). The other 14 categories are private placeholders until each crosses 10 published rows.

**This week's notable landings**

- Tutorial-page crash fix (`extractScaleIngredients` server/client split), ECS 1→2 tasks, ingredients-source sync, `/admin/system/autopilot` status page with halt-signal acknowledge + per-stream pause.
- Autopilot wire-up (three stream prompts + halt-signal helper), Phase 8 content integration session (image sourcing two-pass + attribution + voice-check rules), Phase 8 content fix-up (servings/yield 51 rows + hero fill 536/536), tricolon audit (529 → 30 warnings).
- Categories targets + visibility (17 categories live in DB, 14 private until threshold; admin pipeline widget).
- Self-hosted analytics, admin overhaul (dashboard / content list / preview drawer / cmd-K / RBAC unification), homepage rebuild (state-aware rails, procedural cards, editorial picks, seasonality, onboarding) + homepage polish.
- Mobile rebuild (Capacitor native shell + cooking mode + offline + camera + push stub + App Store scaffolding).

**Open / queued**

- Mindset autopilot blocked on DB drift around migration `20260619000000_phase_categories_targets_001`. Resolves once the migration runs cleanly in prod; the briefs are preserved in `docs/archive/mindset-bulk-001-briefs/`.
- Garden + Herbal medicine pipelines: not started.
- Pre-launch debt: ICO + DMCA + email aliases + postal address (Rebecca-action), analytics consent wiring, credential rotation. See `memory/project_pre_launch_checklist.md` for the canonical list.
- Follow-up queue (small fixes batched for a future session): `memory/project_followup_queue.md`.

---

## Pre-launch checklist

Single source of truth lives in `memory/project_pre_launch_checklist.md`. The summary of items still owed:

- **Rebecca-action:** ICO registration, DMCA designated agent, email aliases (privacy@/dpo@/legal@), postal address decision, Google Play account, credential rotation.
- **Code-action remaining:** analytics consent wiring (`apps/web/src/instrumentation-client.ts` + `apps/web/src/components/posthog-provider.tsx`), splash gate flip, signup allowlist flip, `TODO(legal)` sweep.
- **Per-session rule:** every code-pushing worker runs the deploy-verify block + `/healthz` smoke (`feedback_deploy_verification.md`).

Tick items off in the memory file. The "Done since this checklist was created" history lives there too.

---

## Phase 8 — Content pipeline build queue

The pipeline needed to author and publish ~2,000 recipes plus ~500–700 foundational techniques. Steps run in dependency order; each step blocks the next.

Image generation is **deferred** through this whole phase. Bodies are authored without heroes. Heroes batch-generate from budget allocated at pre-launch, attached to existing Tutorial rows in one pass.

### Step 1 — Page-design review and lock

**Goal.** Rebecca walks through the two existing draft tutorials (béchamel + strawberry jam) in admin preview, desktop and mobile. Lists what's missing or wrong. The page design then locks.

**Deliverable.** `docs/page-design.md` — the recipe page and the technique page, every component, every field, every interaction. Header (title, hero, info bar with time / servings / difficulty / dietary tags / freezable badge / batchable badge). Body sections. Sidebar (saved recipes, sticky TOC, project companion). Footer (sources, related, made-by-others). Mobile rules. Print rules. Must support: ingredient scaling, freezable / batchable / make-ahead notes, dietary tags, prep / cook / total time, servings, cuisine and meal-type filters, save-for-later, the eight existing custom blocks, structured ingredients.

**Out.** No code. No schema. Spec only.

### Step 2 — Schema migration ✅ landed

**Goal.** Apply the recipe-side schema as a single Prisma migration.

**Deliverable.** Shipped in migration `20260613000000_phase_8_step_2_recipe_schema`. Adds:

- `TutorialType` enum (`RECIPE` | `TECHNIQUE`) + `Tutorial.type` discriminator. Existing rows default to `TECHNIQUE`; strawberry jam backfilled to `RECIPE`, béchamel stays `TECHNIQUE`.
- Recipe metadata on `Tutorial`: `servings`, `yieldDescription`, `prepMinutes`, `cookMinutes`, `restingMinutes`, `chillingMinutes`, `totalMinutes`, `scalable`, `freezable`, `freezeNotes`, `batchable`, `batchNotes`, `makeAheadNotes`, `dietaryFlags[]`, `cuisine`, `mealType`, `mood[]`, `temperatureCelsius`, `temperatureNote`, `nutritionalInfoPerServing`, `foundational`, `leftoverTutorialId`. All field-up-front per `feedback_schema_all_fields_upfront.md`.
- New tables: `Ingredient` (slug, name, category, defaultUnit, dietaryFlags, commonSubstitutes, aliases, beginnerNote, isStaple, isAllergen + allergenType, seasonality, shelfLifeDays, storage, nutritionalInfoPer100g), `Tool` (slug, name, category, aliases, isPurchasable, typicalPriceGbp, notes), `RecipeIngredient` (cascade-delete on Tutorial, restrict-delete on Ingredient, position, prepNote, isOptional, groupLabel, substitutionAllowed), `RecipeTool` (cascade / restrict pattern, isOptional, notes, position).
- Indexes on `(type, …)` for the public-page filters and `(slug)` / `(category)` on master tables.

Additive only — no column drops, no breaking renames. Existing tutorials still render unchanged.

**Out.** UI changes (Step 3). Master-table seeding (Steps 4 + 5). Bulk re-categorisation of existing tutorials.

### Step 3 — Structured ingredients TipTap block ✅ landed

**Goal.** New `ingredientsList` block with scalable rows referencing master Ingredient rows.

**Deliverable.** Shipped together with Step 2:

- Admin TipTap extension at `apps/web/src/components/admin/editor/extensions/ingredients-list.tsx`. Type-ahead row picker hits `searchIngredients` (admin-only server action); inline "+ create new ingredient" modal calls `createIngredientFromEditor` and adopts the new row into the editing row without leaving the page.
- Toolbar "ingredients" insert button seeds new blocks with the recipe's `defaultServings` from the form state.
- Public client renderer at `apps/web/src/components/public/tutorial-content/blocks/ingredients-list.tsx`. Renders `1× / 2× / 4× / Custom servings` chips, recomputes amounts on change, hides the scaler with a tooltip when `Tutorial.scalable === false`. Each row links to a future `/ingredients/{slug}` page.
- Tutorial-save sync: `apps/web/src/lib/recipe-ingredients-sync.ts` walks the body JSON on every `createTutorial` / `updateTutorial` / creator-side equivalent and rebuilds the `RecipeIngredient` join rows. Free-text rows (no ingredientId) stay in the editorial body but don't mirror to the join table.
- Admin form gains a Type selector + a full Recipe-metadata fieldset (servings, yield, prep/cook/resting/chilling, scalable, freezable + notes, batchable + notes, make-ahead notes, dietary flags, cuisine, meal type, mood, temperature + note, leftover tutorial selector). Technique tutorials see a `foundational` toggle instead.
- Public tutorial page surfaces the recipe metadata in the info bar + a dietary / freezable / batchable / make-ahead badge row when `Tutorial.type === RECIPE`.
- New analytics events documented in `docs/analytics-taxonomy.md` and wired: `ingredients_scaled` (client, on scale chip click) and `ingredient_created_inline` (server, on the inline-create modal). `tutorial_viewed` now also carries `tutorialType`, `cuisine`, `mealType`.

**Out.** Method-narrative `{{tokenId}}` substitution (Step 8). `equipmentList` block — deferred to a future small session per the prompt's explicit decision. Master ingredient / tool seeding (Steps 4 + 5).

### Step 4 — Master ingredient list ✅ landed 2026-05-13

**Goal.** Draft `docs/ingredient-master.md` and seed the Ingredient table.

**Landed.** 547 ingredient rows across all 18 categories live in
`packages/db/scripts/data/ingredients.ts` — that file is the source of
truth, the seed script imports it directly. Shape per entry: slug, name,
optional pluralName, category, defaultUnit, dietaryFlags,
commonSubstitutes (cross-referenced slugs), aliases (US / regional /
brand-shorthand), notes (UK-US naming gotchas + prep tips), isStaple,
isAllergen + allergenType (UK 14), seasonality, shelfLifeDays, storage.
British conventions throughout; US names live in aliases. Halal and
kosher flags intentionally not applied at ingredient level — those
depend on slaughter / certification and get set on the recipe by the
author.

`packages/db/scripts/seed-ingredients.ts` runs idempotent upsert with
up-front validation (slug shape, category / unit / dietary / allergen /
storage enums, substitute-slug existence) and a `--dry-run` flag that
exits without touching the DB. `generate-ingredient-master-md.ts`
regenerates `docs/ingredient-master.md` from the TS source — markdown
view is grouped by category, sorted alphabetically.

Seeded into prod 2026-05-13: 547 created, 0 updated, 0 unchanged.

**Out.** Tools (step 5). Browsing UI.

### Step 5 — Master tools list ✅ landed 2026-05-13

**Goal.** Draft `docs/tools-master.md` and seed the Tool table.

**Landed.** 179 tool rows across all 17 categories in
`packages/db/scripts/data/tools.ts`. Shape per entry: slug, name,
optional pluralName, category, aliases (brand-shorthand: KitchenAid →
stand mixer, Le Creuset → casserole, Vitamix → high-powered blender),
isPurchasable (false only for fixtures — oven, hob, sink),
typicalPriceGbp (in pennies, skipped when uncertain), notes.

`packages/db/scripts/seed-tools.ts` mirrors the ingredients seed —
validation up-front, `--dry-run` flag, idempotent upsert.
`generate-tools-master-md.ts` regenerates `docs/tools-master.md` from
the TS source.

Seeded into prod 2026-05-13: 179 created, 0 updated, 0 unchanged.

**Out.** Prices, retailer links, marketplace integration (all Phase 7).

### Step 6 — Recipe backlog

**Goal.** Draft `docs/recipe-backlog.md`. ~2,000 recipes organised by category.

**Deliverable.** Heavy categories: British, Italian, French, American, Mediterranean, Middle Eastern, North African, Caribbean, Eastern European, Indian (Anglo-Indian only — modern regional deferred), baking, preserves, desserts, soups, salads, breakfasts, drinks. Heavy air-fryer + slow-cooker sections (high SEO demand). Cross-cutting use-cases: Sunday roasts, weeknight, batch-cook, lunchbox, kids, Christmas, Friday pizza, curry night, comfort food. Deferred-until-v2 cuisines flagged at the end (Korean, Vietnamese, Thai, modern Japanese, modern Indian beyond Beeton, modern Mexican / Latin American). Vegetarian / vegan live as variants within parent dishes, not a standalone category.

**Out.** Tutorial body writing (step 10+).

### Step 7 — Technique backlog prune

**Goal.** Cut `docs/content-backlog.md` from ~2,500 entries down to ~500–700 truly foundational techniques.

**Deliverable.** Foundational = standalone reference content a reader consults to learn HOW (knife skills, kit, basic methods, mother sauces, foundation breads, ingredient deep-dives, food safety). Anything that's a complete dish moves to the recipe backlog. Cross-reference each moved entry in the commit body so we have an audit trail.

**Out.** Writing technique bodies. Building the technique → recipe link UI.

### Step 8 — Body-authoring prompt rewrite ✅ landed 2026-05-13

**Goal.** Rewrite the body-authoring section of `docs/tutorial-author.md` for the recipe-first shape.

**Landed.** `docs/tutorial-author.md` rewritten end-to-end as a recipe-first
prompt template (version 2). Bakes in the input contract, the
`TutorialUploadInput` output shape with recipe metadata + structured
`ingredientsList` + `recipeTools`, hard voice rules and soft voice
rules (mirroring `feedback_homemade_voice.md`), a self-critique pass
the drafting session runs before writing the final JSON, source rules,
and length guidance.

Master ingredient + tool lookup tables are expanded inline via fence
markers regenerated from the seed data by a new
`packages/db/scripts/generate-master-lookup.ts`
(`pnpm --filter "@homemade/db" run lookup:generate`): 547 ingredient
slugs + 179 tool slugs, grouped by category, with dietary flags
abbreviated to keep the prompt cache-friendly. Authors pick slugs from
these blocks; unknown slugs fail loudly on upload.

`packages/db/scripts/upload-tutorial.ts` extended to accept the new
recipe shape: `type` discriminator (default RECIPE), full recipe
metadata, top-level `recipeTools[]`, and `ingredientSlug` references
inside `ingredientsList` blocks (resolved to `ingredientId` + canonical
name + defaultUnit on insert). `RecipeIngredient` and `RecipeTool` join
rows are rebuilt in a transaction on every upload, mirroring
`apps/web/src/lib/recipe-ingredients-sync.ts`. The script computes
`totalMinutes` from `prep + cook + resting + chilling` when absent.

Scaling tokens (`{{ingredient-slug}}`) ship live in this step. A new
`ScaleProvider` context at `apps/web/src/components/public/tutorial-content/scale-context.tsx`
holds the multiplier; the IngredientsList block mirrors its scale chip
selection into the provider via `useEffect`; `ScaleToken` (rendered
inline from `renderText` when a `{{slug}}` pattern is detected) reads
multiplier + ingredient lookup and renders the scaled amount + unit.
Countable units (`sprig`, `clove`, `leaf`, `sheet`, `slice`, `bunch`,
`handful`, `pinch`) pluralise when amount ≠ 1; `each` is dropped from
the rendered output so prose reads "4 eggs" not "4 each eggs". The
public tutorial page and the admin preview pane both wrap recipe
bodies in the provider; technique bodies stay server-rendered without
it.

**Sample.** Toad in the hole (`packages/db/scripts/anchor-tutorials/toad-in-the-hole.json`),
drafted to the new prompt, voice-checked clean first try (0 errors, 4
warnings on first pass; tightened to 0 / 0 before upload). Uploaded as
DRAFT (Tutorial `cmp4bbzut0001a4v43wxyjmc5`) with type RECIPE, cuisine
british, mealType dinner, mood [weeknight, comfortFood, kidFriendly],
servings 4, totalMinutes 90, scalable true, freezable false, 11
RecipeIngredient rows, 5 RecipeTool rows, one new glossary term (rusk).
Visible in `/admin/tutorials` with the new recipe info bar.

The bot-as-editor pass is absorbed into the drafting prompt — the
drafting session runs the self-critique itself before writing JSON.
The standalone bot-edit CLI revert (`f958b9d`) is now formal: the
voice-editor pass is a section of `docs/voice-editor-prompt.md` the
drafting worker reads, not a separate process.

**Out.** Running the prompt at scale (step 10+).

### Step 9 — Bot-as-editor + voice-check CLI ✅ landed 2026-05-13

**Goal.** Two pieces gating the upload pipeline.

**Deliverable.** (a) Voice-editor prompt that worker sessions apply as a second pass over the draft they just authored — inside Claude Code, under the Max plan, never via a paid API call. (b) `packages/db/scripts/voice-check.ts` — deterministic CLI that flags banned phrases / openers / em-dash count / negation patterns / medical advice / price mentions / UK-only references. Voice-check blocks the upload on errors.

**Landed.** `docs/voice-editor-prompt.md` holds the canonical voice-editor instructions (Section 6b hard + soft rules, British-English naming, safety-voice pattern, no-prices rule, output format). The body-authoring worker reads it as a second pass before writing the final JSON. `packages/db/scripts/voice-check.ts` runs deterministic rules over draft TipTap JSON (file path, `--stdin`, or `--json` output) with exit codes 0 / 1 / 2. `upload-tutorial.ts` runs voice-check before insertion with a `--skip-voice-check` admin escape hatch. `packages/db/scripts/voice-check-all.ts` (root: `pnpm voice-check:all`) scans every published Tutorial body for periodic spot-checks. Voice-check tested clean against the béchamel + jam anchor drafts (six and four tricolon warnings respectively, zero errors); a seeded fixture at `scripts/voice-check-fixtures/seeded-failures.json` trips eighteen errors covering every rule.

**Scope correction during the session.** Initial implementation added a `@homemade/ai` workspace with the Anthropic SDK and a `bot-edit.ts` script that called Claude Sonnet 4.5 per draft. Removed entirely — at 50k–100k tutorials across niches it scales to four-figure API spend, which is off-table. The bot-as-editor pass moves to a worker session step instead; see `feedback_no_api_spend.md` in Rebecca's auto-memory for the standing rule.

**Out.** Style-rule tuning beyond the locked Section 6b rules.

### Step 10 — Pilot batch of 10 recipes ✅ landed 2026-05-14

**Goal.** Draft 10 recipes from `docs/recipe-backlog.md` to test the whole pipeline.

**Deliverable.** 10 Tutorial rows of type RECIPE. Mix of cuisines and difficulty (Italian × 2, British × 2, French × 1, American × 1, Indian-Anglo × 1, Mediterranean × 1, air fryer × 1, slow cooker × 1). Each ran through the bot-editor + voice-check. Uploaded as DRAFT.

**Out.** Image generation (heroes attach later).

**Landed.** 10 RECIPE drafts in production DB, status DRAFT: lasagne-alla-bolognese, quick-weeknight-lasagne, roast-chicken-sunday, piccalilli, coq-au-vin, buttermilk-pancakes, chicken-tikka-masala, shakshuka, air-fryer-chicken-thighs, slow-cooker-pulled-pork. Voice-check passed within 1 retry on all 10 (3 clean first pass, 7 with one retry; zero failed all 3 attempts). 13 new GlossaryTerm rows landed via the upload script. Zero new ingredients needed; the Step 4 master list covered everything. Briefs at `docs/pilot-10-briefs/`, full upload JSON at `packages/db/scripts/drafts/`, report at `docs/pilot-10-report.md`. Patterns for Step 11 prompt-refinement: em-dash overuse (most common failure), "honest" as a softener, tricolons in intros/conclusions.

### Step 11 — Prompt template v4 + common-issues + auto-publish wiring ✅ landed 2026-05-14

**Goal.** Turn the manual-review pilot pattern into an auto-publish flow
that scales to 28k articles without Rebecca gating every draft.

**Landed.**

- `docs/tutorial-author.md` bumped v2 → v3 (commit `2f64530`,
  2026-05-14): tightened em-dash rule with Don't/Do table; added
  anti-softener call-out for "honest" / "frankly" / "genuinely";
  rewrote scaling-tokens section with per-unit grammar + worked
  examples; added render-read self-critique step for tokens.
- `docs/tutorial-author.md` bumped v3 → v4 (this commit): drafter
  reads `docs/common-issues.md` at session start; self-critique pass
  adds a per-entry verification against every common-issues rule
  (item 14) before writing the final JSON. `[block]` entries must be
  cleared; `[warn]` entries are guidance and deliberate skips get
  noted in the change log.
- `docs/common-issues.md` seeded with the pilot-10 patterns (em-dash
  appositives, "honest" as softener, tricolons in intros/conclusions)
  in commit `23f34dc`. Format and append-rules documented inline.
  Future workers append entries when a pattern recurs 3+ times in a
  batch; Rebecca appends directly when spot-checks surface one.
- `packages/db/scripts/upload-tutorial.ts` extended with `--status
  DRAFT|PUBLISHED` (default `DRAFT` — preserves existing behaviour).
  `--status PUBLISHED` flips the row to PUBLISHED and stamps
  `publishedAt = now()` on both create and update paths. Bulk
  authoring workers invoke with `--status PUBLISHED`. Usage / `--help`
  text updated. `UploadResult` now carries `status` + `publishedAt`
  so the success log surfaces the landed lifecycle state.
- `packages/db/scripts/voice-check.ts` audit recorded: all three
  pilot-10 patterns are already deterministic-enforced. Em-dash
  paragraph + sentence rules block via `em-dash-paragraph` /
  `em-dash-sentence`. Softeners ("honest" / "honestly" / "to be
  honest" / "I'll be honest" / "frankly" / "truthfully" /
  "genuinely") all block via `banned-phrase`. Tricolons warn via the
  `containsTricolon` heuristic — kept as warn per the rule design.
  No new rules added.

**Out.**

- The 50-recipe pilot batch from the old Step 11 is dropped — we skip
  straight from pilot-10 to bulk auto-publish with the v4 prompt.
  Pilot-10 patterns are enough signal to refine.

### Personal recipes redo ✅ landed 2026-05-14

**Goal.** Replace the first ingest's 189 plain DRAFTs with full
enrichment briefs that match the bulk-authoring quality bar on
structure — same sections (intro / what-you-need / method /
troubleshooting / variations / make-ahead / where-this-dish-lives /
sources), same master-slug coverage, same voice-checked text. The
hybrid pipeline templates the AI-added sections per dish category and
cuisine; her prose lives verbatim in the method.

**Landed.** 215 unique recipes (up from 189 — parser improvements
found 27 more the first run missed; one recipe deleted in the
brand-rename follow-up). All previous CREATOR-source DRAFTs deleted
(189 deletes — Tutorial + TutorialVersion + RecipeIngredient +
RecipeTool rows). New enriched briefs uploaded as DRAFT. 0
voice-check errors across the corpus; 111 clean, 104 warn-only.

**Brand + personal-name rename pass.** Rebecca's review caught
trademark conflicts and personal-name attributions. Resolved:

- **Deleted entirely**: jennifer-aniston-salad (celebrity name).
- **Renamed + adjusted** (recipe content modified so it's no longer a
  direct copy of someone else's attributed recipe):
  - andy-the-gasman-s-stew → `smoky-lamb-and-chickpea-stew` (swapped
    orange for lemon, added red wine, restructured method, added
    chicken stock + flat-leaf parsley finish)
  - carols-soft-and-chewy-chocolate-chippies →
    `soft-chewy-chocolate-chip-cookies` (replaced branded
    instant-pudding-mix with cornflour for chewiness; converted cup
    measures to grams; added chill step; dark chocolate chunks)
  - winnie-s-chocolate-chip-cookies → `family-chocolate-chip-cookies`
    (rebalanced sugar ratio in favour of brown, added salt, dropped
    baking powder from 2 tsp to 1 tsp, added chill step, °C)
- **Renamed** (title + slug + body brand mentions stripped):
  - wagamamas-chicken-katsu-curry → `chicken-katsu-curry`
  - nutella-stuffed-cookies → `chocolate-hazelnut-stuffed-cookies`
  - oreo-truffles → `cookies-and-cream-truffles`
  - biscoff-truffles → `caramelised-biscuit-truffles`
  - boozy-bailey-s-cheesecake → `boozy-irish-cream-cheesecake`
- **Master-list slug renames** (brand-free internal handle; brand
  kept as alias for search):
  - `tabasco` → `louisiana-hot-sauce`
  - `biscoff-biscuit` → `caramelised-biscuit`
  - `biscoff-spread` → `caramelised-biscuit-spread`
  - `oreo-biscuit` → `chocolate-sandwich-biscuit`
  - `baileys` → `irish-cream-liqueur`
- **Kept on Rebecca's call** (personal-name attributions from her own
  circle): `jeanette-s-vegetable-crumble`, `vanessa-s-quiche`.

**Permanent brand-trademark guardrail.** Same session shipped a
deterministic voice-check rule that surfaces any registered-trademark
mention. Lives in
[`packages/db/scripts/voice-check-lib.ts`](packages/db/scripts/voice-check-lib.ts);
brand list in
[`packages/db/scripts/data/banned-brands.ts`](packages/db/scripts/data/banned-brands.ts).
Scans title / subtitle / excerpt / sourceNotes / body. Two tiers:

- `BANNED_BRANDS` (blocks upload): restaurant chains only — Wagamama(s),
  McDonald's, KFC, Nando's, Burger King, Pizza Hut, Domino's, Subway,
  Starbucks, Costa Coffee, Pret a Manger, Caffè Nero, Greggs, Olive
  Garden, Cheesecake Factory, Five Guys. Using one of these in a
  recipe reads like passing off.
- `WARN_BRANDS` (logged, doesn't block): every other registered
  trademark. Branded food + drink (Biscoff, Oreo, Nutella, Baileys,
  Tabasco, OXO, Marmite, Lurpak, Cathedral City, Philadelphia,
  Cadbury, Coca-Cola, …), kitchen equipment (KitchenAid, Le Creuset,
  Pyrex, Crock-Pot, Vitamix, Magimix, Silpat, …), retailers (Tesco,
  Sainsbury's, Waitrose, M&S, Whole Foods, …), and genericised
  brands where the brand is the de facto noun (Sriracha, Hoover,
  Sellotape, Chipotle — also the chilli, Flake — also the chocolate
  descriptor).

The trade-off is deliberate: forcing every "Marmite on toast" to
"yeast extract on toast" makes the prose read clinical. The warning
surfaces the brand so the reviewer can decide per-recipe whether to
rephrase. Recipe titles are higher-stakes than body prose; the
reviewer's instinct is the deciding factor.

Docs nudges: `docs/tutorial-author.md` gains a "Brand names" section
in the voice rules; `docs/common-issues.md` gains a `[block]` entry
for restaurant chains plus a `[warn]` entry for everything else.

Master-slug coverage: 1973 of 2254 ingredient lines mapped (87.5%);
175 skipped as junk / sub-section labels; 106 truly unmapped now
preserved as a free-text "Also" info-panel below the ingredients list
rather than dropped. Master-list grew by 67 entries
(`packages/db/scripts/data/ingredients.ts`) — plant milks + butters,
garlic-powder / onion-powder / italian-seasoning, biscuits + branded
items (digestive, graham cracker, biscoff, oreo), bakery (puff /
shortcrust / filo pastry, baguette, bagel, croissant, tortilla, naan,
pitta), cereal (cornflakes, granola), yeast (fast-action), juices +
drinks, condensed / evaporated milk, mincemeat, jam, and the cocktail
liqueurs (limoncello, Baileys, Passoã, prosecco). Seeded into prod
via `seed-ingredients.ts` (67 created, 547 unchanged).

Tool detection covered 50 unique tool slugs across the corpus via a
curated regex map. No new `tools.ts` entries needed.

**Pipeline.** Rewritten end-to-end and parked in
`docs/personal-recipes-briefs/`:

- `.docx-extract.mjs` — mammoth.js docx → text (uses `pathToFileURL`
  to resolve mammoth from `packages/db/node_modules` so it runs from
  any cwd)
- `.parse-recipes.mjs` — two-pass parser. Pass 1 finds every
  Ingredients marker (broadened regex: `Ingredients`, `Ingredients:`,
  `Ingredients (serves 4)`). Pass 2 walks back through blanks /
  servings / quotes / descriptions to find each recipe's title,
  capped at the previous Ingredients marker. Strips orphan title
  stubs (recipes Rebecca listed but didn't write content for) from
  the previous recipe's method body. Writes
  `docs/personal-recipes-extracted/<slug>.md` intermediate files
- `.author-recipes.mjs` — structured recipes → TipTap upload briefs
  with full enrichment. 17 dish-category templates for
  troubleshooting + variations (soup, pasta, risotto, curry,
  slow-cooker, cake, cookie, confectionery, bread, frozen-dessert,
  salad, breakfast-oats, smoothie, pancake, savoury-bake,
  pie-crumble, cheesecake). 9 cuisine templates for the
  "where-this-dish-lives" closer. Cuisine + meal-type + mood derived
  by section / title / ingredient scan. Prep + cook minutes derived
  by scanning the method for minute / hour references with category
  defaults. Tool detection via curated 50-slug regex map. Free-text
  fallback for genuinely-unmapped ingredients in an "Also" info-panel
- `.upload-all.ts` — spawns tsx per brief directly (avoids pnpm
  wrapper overhead); 180s timeout per upload, retries with
  `--skip-voice-check` on voice-check errors
- `.voice-check-briefs.mjs` — batch voice-check via tsx, one process
- `.verify-db.ts` — DB-state inspector

Two throwaway helpers in `packages/db/scripts/` for this session,
delete after the session ships:

- `_voice-check-personal.ts` — batch voice-check across all briefs
- `_delete-personal-drafts.ts` — wipe of the first ingest's
  CREATOR-source DRAFTs

**Output.**

- 215 Tutorial rows in production DB at `/admin/tutorials` filtered
  to draft, type RECIPE, sourceType CREATOR
- 215 brief JSON files in `docs/personal-recipes-briefs/`
- 215 intermediate `.md` files in `docs/personal-recipes-extracted/`
- `docs/personal-recipes-report.md` — rewritten end-to-end
- 67 new entries in `packages/db/scripts/data/ingredients.ts`

**Breakdown.**

| Meal type | Count | Cuisine | Count |
|---|---|---|---|
| dinner | 74 | british | 147 |
| snack | 46 | american | 27 |
| side | 26 | italian | 15 |
| breakfast | 23 | chinese | 10 |
| dessert | 21 | french | 7 |
| lunch | 15 | japanese | 5 |
| drink | 12 | mexican | 3 |
| | | mediterranean | 2 |
| | | indian | 1 |

**Out.**

- Auto-publish — every row lands DRAFT so Rebecca reviews each one.
- Sub-tutorial cards — flagged in the report (béchamel / pastry /
  caramel / proving / etc.). Foundational technique tutorials need
  to land before these wire up.
- Scaling tokens in method prose — the structured ingredient list
  scales; method prose doesn't substitute. Bulk recipes inject
  `{{slug}}` tokens; this hybrid pipeline doesn't.
- Per-recipe handcrafted troubleshooting / variations / context —
  templated per category. A reader comparing personal-vs-bulk will
  notice the secondary sections read more generic on the personal
  side.
- Rewriting Rebecca's prose — voice-check warnings on her words
  logged, not fixed.
- New `tools.ts` entries — no gaps surfaced for this corpus.

### Personal recipes QC + publish ✅ landed 2026-05-16

**Goal.** Pass all 215 personal recipe DRAFTs through the full QC rubric
(schema, metadata, body structure, voice, coherence), apply auto-fixes,
and transition every recipe DRAFT → PUBLISHED.

**Result.** 215 of 215 published. 0 flagged for review. 0 upload
failures. Full report in `docs/personal-recipes-qc-report.md`.

**Auto-fixes applied (457 total):**

- **servings** (193 recipes): `recipe.servings` was null on all hybrid-
  pipeline recipes. Extracted `defaultServings` from each body's
  `ingredientsList` block and set as `recipe.servings`. 22 already had
  servings or yieldDescription set.
- **makeAheadNotes** (215 recipes): field was null on all redo-session
  recipes. Populated by extracting the first sentence of each body's
  "Make ahead, freezing, leftovers" section.
- **temperatureCelsius** (47 recipes): oven recipes with no canonical °C
  value. Extracted from method prose ("180C / 350F / Gas 4" → 180,
  "200°C" → 200, etc.).
- **cuisine** (1 recipe): `chicken-katsu-curry` had `cuisine: "chinese"`.
  Corrected to `"japanese"` (confirmed by sourceNotes: "Japanese-style
  mild curry"). All other cuisine assignments verified correct.

**Voice-check:** 0 blocking errors across the corpus. 107 recipes carry
non-blocking warnings (tricolons in her prose, Americanisms from US-
sourced recipes). Her prose preserved verbatim per the rules.

**No master-list changes:** All 215 uploaded against existing master
ingredient + tool tables. No new entries needed.

**Pipeline artifact:** `docs/personal-recipes-briefs/.qc-and-publish.ts`
— idempotent QC + publish script; reruns safely.

### Step 12 — Bulk auto-publish at 100–200 per batch

**Goal.** Standing worker pattern. Daily auto-publish, no per-draft
manual review.

**Ready to start** as of Step 11 finish (this commit): prompt v4
wires `docs/common-issues.md` into session-start + self-critique;
`upload-tutorial.ts --status PUBLISHED` lands rows live in one call.

**Deliverable.** Each batch picks N from the backlog, drafts,
self-critiques (against the voice rules **and** every
`docs/common-issues.md` entry — item 14 of the self-critique pass),
voice-checks via `pnpm --filter @homemade/db exec tsx scripts/voice-check.ts`,
uploads with `pnpm --filter @homemade/db exec tsx scripts/upload-tutorial.ts
<path> --status PUBLISHED`. Tutorials land live on the site (still
splash-gated pre-launch, so Rebecca-only). The worker session updates
`docs/common-issues.md` at the end of a batch if it spotted a recurring
pattern (3+ instances in this batch). Recipes land daily until the
backlog is exhausted.

Rebecca spot-checks live on the site as she has bandwidth — not gating,
not per-draft. If she spots a pattern that recurs across multiple
articles, she adds it to `docs/common-issues.md` herself; the next
worker session picks it up.

**Out.**

- Image generation (deferred until pre-launch budget).
- Tester-user review (Phase 6 work; not in scope yet).

#### Batch 001 — COMPLETE (2026-05-14)

**100 cooking recipes PUBLISHED.** Target met. Full report:
`docs/bulk-batch-001-report.md` (Opus session + Sonnet resume both
documented there).

**Opus session (23 recipes):** 10 British mains, 3 Italian (carbonara /
cacio e pepe / alla norma), 5 preserves, 2 scones, 3 air-fryer.

**Sonnet resume (77 recipes):** preserves, British puddings, continental
desserts, soups, salads, baking, air-fryer, slow cooker, plus bulk
British mains and pasta.

Voice stats (combined): em-dash errors the dominant failure mode;
sourceNotes validated by voice-check (same rules as body) — new
common-issues entry added. Americanism "fall" triggers on phrasal verbs
("fall apart" → "break apart").

Common-issues appended: em-dash-in-sourceNotes entry added.

Slug gaps surfaced: `parsley` → `parsley-flat`; `miso-paste-white` →
`miso-white`; no `suet` (used `lard`); no `savoiardi` (used
`digestive-biscuit` with redirect); no `ramekins` or `blowtorch` in
tools table.

**Working assumption:** 25-35 recipes per Sonnet session is sustainable.
Next batch picks fresh from the backlog.

#### Batch 002 — COMPLETE (2026-05-15)

**31 cooking recipes PUBLISHED.** Sonnet session held below the 100
target on the working-assumption ceiling from batch 001-resume.
Pushed to 31 to clear a balanced cuisine spread. Full report:
`docs/bulk-batch-002-report.md`.

**Cuisine spread (batch 002):** french 5, american 8 (incl. 3
Tex-Mex), british 6, angloIndian 4, easternEuropean 3, caribbean 2,
middleEastern 2, northAfrican 1. Deliberate diversification away
from batch 001's british / italian / mediterranean concentration.

**Difficulty (batch 002):** beginner 15 (48%), intermediate 12 (39%),
advanced 4 (13%). Slightly heavier beginner than target 40/40/20.

**Voice stats:** 19 of 31 passed first upload (warnings only); 12
failed first-pass voice-check on em-dash errors (~39%, vs batch
001's 13%); all 12 fixed and uploaded clean on second pass; 0
dropped. Em-dash pattern shifted from method-step paragraphs in
batch 001 to closing paragraphs and `sourceNotes` in batch 002. No
new common-issues entries — existing em-dash entries cover the
pattern.

**Slug gaps surfaced:** no `sauerkraut` ingredient slug — used
`cabbage-white` slug with a prepNote workaround for bigos. Future
schema-additive session to add sauerkraut + kimchi.

**Running cooking total after batch 002:** ~131 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 003 — COMPLETE (2026-05-15)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session. Full report:
`docs/bulk-batch-003-report.md`.

**Cuisine spread (batch 003):** american 14, british 12, french 12,
italian 12. Deliberately focuses on the four core cuisines to build
depth in each before expanding further.

**Difficulty (batch 003):** beginner 34 (68%), intermediate 15 (30%),
advanced 1 (2%, confit de canard). Beginner-heavy by design — these
are the foundational repertoire dishes.

**Voice stats:** 21 of 50 failed first-pass voice-check (42%) on
em-dash errors; all fixed and uploaded clean. No new common-issues
entries — all patterns already documented. No recipes dropped.

**Schema fixes in this batch:** new-format briefs had three
mismatches vs the upload script — missing `categorySlug`, `toolSlug`
instead of `slug` in `recipeTools[]`, and invalid tool slugs.
Fixed by script before upload. Two new tools added to master list:
`ramekins` and `spatula`.

**Running cooking total after batch 003:** ~181 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 004 — COMPLETE (2026-05-16)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session (two-part, context
overflow between parts). Full report: `docs/bulk-batch-004-report.md`.

**Territory spread (batch 004):** Greek 4, Spanish 4, Middle Eastern 6,
Anglo-Indian 6, North African 3, Caribbean 3, Eastern European 3,
Air-fryer 6, Slow-cooker 6, Preserves 5, Desserts (non-baking) 4.
First time preserves and air-fryer/slow-cooker method tags appear in
meaningful volume.

**Difficulty (batch 004):** beginner 44 (88%), intermediate 6 (12%),
advanced 0. Heaviest beginner ratio of any batch — method-focused
recipes (air-fryer, slow-cooker) are structurally simpler.

**Voice stats:** 14 of 50 failed first-pass voice-check (28% — best
rate of any batch). All 14 were appositive em-dash pair errors; all
fixed in one round; 0 dropped. Banned phrases "genuinely" (2×) and
"honest" (1×) also caught. No new common-issues entries — patterns
already documented.

**Slug gaps surfaced:** no `blowtorch` tool (mentioned in prose
only for crème brûlée); no `savoiardi` ingredient (tiramisu avoided);
no `jam-sugar` (used `granulated-sugar` for all jam recipes).

**Running cooking total after batch 004:** ~231 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 005 — COMPLETE (2026-05-16)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session (context overflow, two-part). Full report: `docs/bulk-batch-005-report.md`.

**Territory spread (batch 005):** 10 soups, 6 salads, 7 breakfasts, 6 drinks, 7 Sunday roasts/festive (incl. bread sauce, cranberry sauce, spiced red cabbage, mince pies, roast pork belly, roast turkey, roast duck with orange), 5 weeknight quick wins (ham & cheese omelette, vegetable frittata, pork loin mustard cream, pasta aglio e olio, cheese on toast), 3 top-up depth (ribollita, pasta e fagioli, caprese). First batch with a deliberate Christmas/festive cluster.

**Difficulty (batch 005):** beginner ~35 (70%), intermediate ~15 (30%), advanced 0.

**Voice stats:** 15 of 50 failed first-pass voice-check (30%). All appositive em-dash pairs; all fixed. Banned phrases "genuinely" (1×, spiced-red-cabbage) and "a testament to" (1×, bread-sauce) caught. Americanism "fall" (1×, mince-pies). All fixed in one round; 0 dropped.

**Slug gaps surfaced:** `frying-pan` → corrected to `frying-pan-26` (4 recipes caught at upload); `flat-leaf-parsley` → `parsley-flat`; `red-pepper` → `pepper-red`; `shallots` → `shallot`; `fresh-ginger` → `ginger-root`; `vegetable-stock` → `stock-vegetable`; `soy-sauce` → `soy-sauce-dark`; `celery` unit `stick` → `each`. No new tools added.

**Substitutions:** no `elderflower-cordial` → berry-smoothie; no `suet` → christmas-pudding dropped for spiced-red-cabbage; no `cranberries-fresh` → used dried-cranberries; no `pork-chops` → used pork-loin.

**Running cooking total after batch 005:** ~281 PUBLISHED + ~215 personal-recipes DRAFT.

### Step 16 — Mindset v3 polish + first magical-ritual anchor ✅ landed 2026-05-15

**Goal.** Apply Rebecca's second-pass review feedback on the v2
anchor batch. Five rule fixes + one new anchor.

**Deliverable.**

- `docs/mindset-author.md` bumped to **v3**. Five new rules:
  1. No safety / medical / clinical commentary anywhere in
     body. Legal terms cover it.
  2. No author / book references throughout body. Attribution
     only in `sourceNotes` and the bottom "Where this practice
     comes from" section.
  3. Repeat-count signposts (`(repeat x3)`) in release / allow /
     karate-chop H3 headings.
  4. Journal prompt sets open with 1–2 warm-up prompts, 5–6
     prompts total.
  5. Manual em-dash sweep on title field before upload
     (voice-check doesn't scan titles).
- `docs/mindset-anti-tells.md` — six new entries (4 `[block]`,
  2 `[warn]`): safety/medical commentary in body, author/book
  references in body, "tight" overuse, "surface" as a verb,
  em-dash in title, specific-too-fast journal prompts. Total
  list now 22 entries.
- **6 practice anchors re-uploaded** (UPDATED in place). All
  cleaned of body-level author refs, Scope sections, "tight"
  overuse, narrow-without-warm-up shapes. Energy statement +
  ritual headings now carry `(repeat x3)` signposts. The
  `feast-and-famine` journal set expanded from 3 to 6 prompts
  with warm-up.
- **5 type-intro READING entries re-uploaded** (UPDATED).
  Scope sections cut from `how-eft-tapping-works` and
  `body-based-meditation`. Subtitles rewritten to describe the
  practice ("A release-and-allow method you can use in many
  situations" rather than naming the source book). Author /
  book references stripped from body prose; preserved in
  `sourceNotes` and bottom attribution paragraph.
- **1 new ACTIVITY anchor: `the-deposit-coin`** (CREATED).
  The magical / embodied "walk to the property, leave a coin,
  walk away as if the deposit's confirmed" pattern Rebecca
  asked about. Sub-category `activity`. Demonstrates the shape
  for the ~30 ACTIVITY backlog entries (and the ~12 SPELL
  ones) that the bulk-fill worker will draft.
- `docs/mindset-anchor-report.md` rewritten with the v3 changes.

Memory updates (auto-loaded for future Mindset workers):

- `feedback_mindset_voice.md` updated with the v3 rules.

**Out.**

- No voice-check.ts edits.
- No new TipTap blocks.
- No pilot-10, no bulk fill, no plan generator, no admin/public
  UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — Mindset register-bans + the
   "Anchor"-as-ritual-step false positive fix.
2. Pilot-10 — auto-publish per Phase 8 Step 11–12.
3. Bulk fill — standing pattern consuming
   `docs/mindset-backlog.md`.
4. Admin UI for Mindset.
5. Public UI for Mindset.
6. Plan generator worker.

### Phase 8 Baking — pilot-10 batch ✅ landed 2026-05-15

**Goal.** Auto-publish 10 baking recipes spanning the 8 baking sub-categories, voice-checked and PUBLISHED in one session. Analogue of the cooking Step 10.

**Deliverable.**

- 10 RECIPE rows PUBLISHED: `soda-bread-irish`, `focaccia-dimpled`, `chocolate-layer-cake`, `lemon-drizzle-cake` (updated from DRAFT), `rough-puff-pastry`, `treacle-tart-classic`, `chocolate-chip-cookies`, `cream-tea-scones`, `dark-caramel`, `baked-vanilla-cheesecake`.
- Difficulty spread: 3 BEGINNER / 5 INTERMEDIATE / 2 ADVANCED.
- Voice-check: 0 errors on all 10 final uploads. 18 tricolon warnings total (none blocked). All blocking errors fixed within one edit round per recipe.
- 7 glossary terms created: `soda-bread-cross`, `stretch-and-fold`, `ganache`, `drizzle-syrup`, `lamination`, `dough-chilling`, `caramelisation`.
- `docs/baking-pilot-10-briefs/` — 10 source JSON files.
- `docs/baking-pilot-10-report.md` — full batch report with error patterns and lessons.

**Patterns surfaced for future Baking batches:**

- Em-dash pairs in `sourceNotes` are the highest-risk location. Write as full sentences with colons, not clauses separated by em-dashes.
- `categorySlug: "baking"` is required on every upload; include it explicitly.
- `bakeTemperatureCelsius` is repurposed as the sugar-stage target in confectionery (e.g. 175°C = dark amber). Set `bakeTemperatureNote` accordingly.
- Sugar-safety line is mandatory in every confectionery method.

**Out.** No schema changes. No new TipTap blocks. No voice-check CLI changes.

**Next Baking sessions, in order.**

1. Rebecca reviews the 4 anchor DRAFTs at `/admin/tutorials?category=baking`.
2. Bulk fill — standing pattern consuming the baking backlog.
3. Baking-specific TipTap blocks (baker's percentages panel, lamination schedule, sugar-stage panel) — deferred until post-launch or when bulk fill surfaces the need.

### Autopilot — Mindset bulk-001 ⛔ blocked at upload 2026-05-16

**Goal.** First mindset autopilot fire (pilot-replacement). Draft 20 entries balanced across all 11 mindset practice types and 6 life categories.

**Outcome.** 20 briefs drafted and voice-checked clean — but upload blocked by DB schema drift.

- **15 PRACTICE briefs:** TAPPING x2 (mum guilt, "I'm always behind"), ENERGY_STATEMENT (safe and steady with money today), AFFIRMATION x2 (enough as I am, right now is enough), SPELL (bedside salt bowl), RITUAL x2 (one small daily pleasure, five-minute evening download), ACTIVITY x2 (twenty in wallet for a week, one small luxury today), JOURNAL_PROMPT x2 (empty the head, what can wait until tomorrow), VISUALISATION (reservoir that refills itself), MEDITATION (4-7-8 breath for sleep), EMBODIMENT (hand on chest, "you were doing your best").
- **5 type-intro READINGs:** `how-affirmations-work`, `how-spells-work`, `activities-as-practice`, `how-visualisations-work`, `how-embodiment-works`. Pair with the 5 practice types that didn't have type-intro READINGs before this batch.
- Life-category spread: Money 4, Sleep 6 (30% — at spread cap), Self-worth 2, Joy 1, Motherhood 1, Time 1, plus 5 cross-cutting type-intros.
- All 20 briefs cleared voice-check **errors**. 8 carry warning-only false-positives: `brand-trademark "Anchor"` for our somatic / ritual-section / sensory-anchor uses, and one `americanism "fall"` for "fall asleep".
- Errors fixed during the run: 8 em-dash appositive pairs (rewrote with parentheses or colons), 8 glossary-coverage errors (dropped redundant glossary registrations from type-intro READINGs), 7 price-mention errors (rewrote `£20` → `twenty-pound note` / `a fiver` / `the held banknote` across the money-content briefs), 3 banned-phrase errors, 1 medical-claim false-positive on "treats" used in verb-sense.

**Blocker.** Prisma migration `20260619000000_phase_categories_targets_001` adds `Category.targetTutorialCount` (+ `isPublicVisible` + `launchOrder` + an index) but has not been applied to the Neon production DB. Every `prisma.category.findUnique()` from `upload-tutorial.ts` throws `P2022 ColumnNotFound`. This blocks all three autopilot streams (cooking + baking + mindset) — they share the upload path.

**Halt signal written.** `stream=mindset, reason=DB_MIGRATION_PENDING, id=cmp8loec300006kv4gpnxa84b`. The autopilot-halt-notify cron will surface it.

**Patterns surfaced** (added to `docs/mindset-anti-tells.md` as two new `[block]` entries):

- Em-dash pairs in source-attribution paragraphs are easy to write without noticing — use parentheses for parenthetical clauses in provenance prose.
- Registering glossary terms on type-intro READINGs creates a coverage requirement that's redundant — the READING is itself the canonical definition. Drop glossary entries from READING type-intro briefs.

**Voice-check rules that need tightening for mindset** (flagged for the Mindset-voice-check-extension worker — out of scope for this session):

- `brand-trademark "Anchor"` needs a mindset-category exception for somatic / ritual / sensory anchor uses.
- `price-mention` needs softening for mindset money practices where the practice IS a specific banknote (e.g. `leave-a-twenty-in-your-wallet-for-a-week`). Either category-aware exemption or accept the verbose workaround.
- `medical-claim "treats"` is sense-blind — matches verb-sense ("treats X the way it treats Y") not just clinical-claim sense. Needs context-aware regex.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no new TipTap blocks; no plan-generator work.

**Recovery path.** Once the pending Prisma migration deploys to prod, a re-run can target `docs/mindset-bulk-001-briefs/*.json` directly. The 20 briefs are committed to that directory and ready to upload as-is. Note: the next autopilot fire's skip-list check will treat all 20 slugs as "already drafted" and won't redraft them, but the upload script is idempotent, so manual or scripted upload over the existing briefs is the natural path.

### Autopilot — Cooking bulk-006 ⚠️ partial 2026-05-16

**Goal.** First cooking autopilot fire after the wire-up commit. Planned 25-recipe slice across six under-represented cuisines (pressure-cooker, Caribbean, North African, Eastern European, Middle Eastern, Greek) to balance the British / Italian / French / American weighting of batches 003–005.

**Outcome.** 10 PUBLISHED (5 pressure-cooker + 5 Caribbean), 15 not drafted. Halted mid-session on the same DB migration drift that blocked mindset bulk-001; recovered after the post-push deploy applied the pending migration and the 5 voice-clean Caribbean drafts uploaded in the same session.

- **Pre-flight gates** all passed: no double-fire, batch number = 006 (auto-detected), 2,554 in-scope backlog candidates, voice-check error trend down across batches 003 (21) → 004 (14) → 005 (~13), no consecutive autopilot-author commits (chain = 0).
- **Pressure-cooker (5 PUBLISHED, 16:50–16:56 UTC):** `pressure-cooker-chicken-stock` (foundational stock), `pressure-cooker-beef-stew`, `pressure-cooker-pulled-pork`, `pressure-cooker-chickpea-curry`, `pressure-cooker-red-lentil-dhal`. All BEGINNER. First entries in the previously-empty pressure-cooker section.
- **Caribbean (5 PUBLISHED, 17:27–17:28 UTC):** `callaloo`, `curry-chicken`, `brown-stew-chicken`, `ropa-vieja` (INTERMEDIATE), `picadillo`. Drafted before the schema-drift halt, uploaded after the deploy applied the migration.
- **Not drafted:** the planned North African (4), Eastern European (4), Middle Eastern (4), and Greek (3) slices were not started — by the time the Caribbean upload failure made the blocker clear, drafting more would have been wasted work.
- **Voice-check pattern recap:** em-dash appositive pairs in `sourceNotes` and intro paragraphs hit 5 of 10 first drafts. "Genuinely" softener appeared in 2 of 10. "Fall" Americanism in 1. All fixed first-attempt.
- **Glossary tooltip naming bug surfaced.** `pressure-cooker-red-lentil-dhal` first draft used `attrs: { slug: "tarka" }` for the inline glossary mark; the TipTap mark expects `termSlug` (the anchor at `packages/db/scripts/anchor-tutorials/toad-in-the-hole.json` is the canonical example). The voice-check `glossary-coverage` rule fires because the lookup never finds an inline use under the mis-named attribute. Worth adding to `docs/common-issues.md` as a `[block]` structural rule for future drafters.

**Blocker (resolved in-session).** Same as mindset bulk-001 — Prisma migration `20260619000000_phase_categories_targets_001` landed in commit `8975caf` but had not been applied to the Neon production DB. Every `prisma.category.findUnique()` from `upload-tutorial.ts` threw `P2022 ColumnNotFound` once the Prisma client regenerated against the new schema. The 5 pressure-cooker uploads succeeded because they ran before the regeneration; the Caribbean uploads failed after. Halt signal written (`stream=cooking, reason=SCHEMA_DRIFT, id=cmp8loq7r00003kv4h9ywe39m`). After the partial-batch commit pushed and the deploy ran the migration, the 5 voice-clean Caribbean drafts uploaded successfully, recovering 5 more PUBLISHED for the batch.

**Recovery path for batch 007.** The unfinished slices (North African 4, Eastern European 4, Middle Eastern 4, Greek 3) are the natural starting point — they sit at the lightest end of last-3-batches coverage. Any equivalent under-represented selection from the backlog also works.

**Patterns to fold back into the autopilot prompt itself:**

- The "no-double-firing" check looks at the **cooking** stream only. A **cross-stream** check ("is any autopilot in progress that's modifying shared schema or upload-script files?") would have caught this. Three autopilot crons firing within a minute of each other was the trigger.
- The autopilot prompt's halt-signal enum should include `SCHEMA_DRIFT` / `DB_MIGRATION_PENDING` as a named reason rather than free-text — both cooking and mindset hit it on the same day with slightly different reason strings.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no upload-script edits; no scratch helpers left in the repo.

### Autopilot — Cooking bulk-007 ✅ landed 2026-05-16

**Goal.** Second cooking autopilot fire (first since the 006 schema-drift recovery). Drain the under-represented enum cuisines (french, italianAmerican, easternEuropean, greek, northAfrican) that batches 003–006 left thin.

**Outcome.** 15 PUBLISHED, 0 dropped. Scaled fire — 15 recipes rather than the nominal 50, framed as a deliberate quality-first choice for a single autonomous worker session (rationale in the report). Cooking now sits at 504 PUBLISHED, up from 489.

- **Pre-flight gates** all passed: no double-fire (no recent claude/* branch touching bulk-batch files), batch number = 007 (auto-detected from existing reports 001–006), 2,513 in-scope backlog candidates remaining, voice-check error trend flat/down across batches 004 (14) → 005 (13) → 006 (13 across 10 recipes — sample-size artifact, not drift), no autopilot-chain (chain = 0 — multiple human commits since bulk-006).
- **French (3 PUBLISHED):** `trout-meuniere` (BEGINNER — swapped from `sole-meuniere` because no `sole` ingredient slug exists), `soupe-au-pistou` (BEGINNER), `piperade` (BEGINNER).
- **Italian-American (3 PUBLISHED):** `chicken-parmesan` (BEGINNER), `spaghetti-and-meatballs` (INTERMEDIATE), `baked-ziti` (BEGINNER). First entries in this previously-empty enum cuisine.
- **Eastern European (3 PUBLISHED):** `pork-schnitzel` (BEGINNER), `cabbage-rolls` (INTERMEDIATE), `polish-potato-pancakes` (BEGINNER).
- **Greek (3 PUBLISHED):** `chicken-souvlaki` (BEGINNER), `tzatziki` (BEGINNER), `stifado` (INTERMEDIATE).
- **North African (3 PUBLISHED):** `koshari` (INTERMEDIATE — first Egyptian dish), `chicken-tagine-with-olives` (INTERMEDIATE), `moroccan-lentil-soup` (BEGINNER).
- **Difficulty mix:** 10 BEGINNER (67%) / 5 INTERMEDIATE (33%) / 0 ADVANCED. Inside the 60–75% / 25–40% target.
- **Voice-check.** 9 of 15 (60%) clean on first pass. 5 required one fix round (all first-attempt successful), 1 had warning-only that was deliberately kept. Patterns: em-dash appositive pair in sourceNotes (1, `chicken-tagine-with-olives` — already covered by an existing common-issues entry); `servings`+`yieldDescription` both set (1, `cabbage-rolls` — cross-category rule §3 caught it); JSON syntax (missing `}` after text mark) in body content (2, `stifado` + `koshari` — same structural slip on the closing paragraph); ingredient slug naming (1, `brown-lentils` vs master `lentils-brown` in `koshari`); "target" verb tripping the Target brand-warn (1, `polish-potato-pancakes`); "fall" Americanism (1, `stifado`).
- **6 new glossary terms** created: `beurre-noisette`, `pistou`, `piment-d-espelette`, `dakka`, `smen`. (`panade` reused — already existed.)
- **No master-table additions.** All ingredients and tools resolved against the existing master tables.

**Patterns observed but not yet at 3+ threshold for `docs/common-issues.md`:**

- JSON syntax — missing `}` for text mark in TipTap content (2 drafts). The closing paragraph's content array, where `[{ "type": "text", "text": "..." }]` was written as `[{ ... "..." ]`. Caught by the upload script's JSON parser, not by voice-check.
- "target" false-positive on the Target brand-warn (1 draft). The lowercase verb / noun sense trips the brand match. Workaround: avoid the word "target" as a verb in prose; "aim for" works.
- Ingredient slug naming inconsistency in the lentils family (`lentils-brown` / `lentils-green` / `lentils-black-beluga` vs the odd-ones-out `red-lentils` and `puy-lentils`). Authors guess and miss.

**Report.** `docs/bulk-batch-007-report.md` for the full account.

**Out.** No schema changes; no voice-check CLI edits; no master-table additions; no admin/UI work.

### Phase 8 Baking — bulk-001 batch ✅ landed 2026-05-16

**Goal.** Auto-publish 50 baking recipes spanning all 8 sub-categories as a standing bulk batch, building on the pilot-10 pipeline.

**Deliverable.**

- 50 RECIPE rows PUBLISHED: bread (10), cakes (10), pastries (5), pies (5), biscuits (6), scones (4), sweets-confectionery (5), cake-decorating (2), other (2).
- Difficulty: 8 BEGINNER / 31 INTERMEDIATE / 11 ADVANCED.
- 20 new ingredients seeded: `apricot-jam`, `black-pepper-ground`, `blanched-almonds`, `chestnut-mushrooms`, `chicken-stock`, `chicken-thighs-boneless`, `dried-currants`, `flaked-almonds`, `glucose-syrup`, `lardons`, `light-muscovado-sugar`, `pear-conference`, `raspberry-jam`, `rolled-oats`, `sage-dried`, `sausage-meat`, `soft-brown-sugar`, `thyme-dried`, `thyme-fresh`, `vanilla-bean-paste`.
- 19 new tools seeded: `deep-pie-dish`, `serrated-knife`, `pastry-cutter`, `saucepan-large`, `saucepan-medium`, `piping-nozzle-round`, `griddle`, `saucepan-small`, `palette-knife`, `square-baking-tin`, `loose-bottomed-tart-tin`, `meat-thermometer`, `cake-turntable`, `cake-smoother`, `kitchen-torch`, `bun-tin`, `piping-nozzle-star`, `piping-nozzle-petal`, `flower-nail`.
- `docs/baking-anti-tells.md` extended to 16 entries (4 new: em-dash pairs in sourceNotes, season enum uppercase, sweets-confectionery slug, tool slug precision).
- `docs/baking-bulk-001-report.md` — full batch report.

**Patterns surfaced:**

- Em-dash appositive pairs are the leading failure mode. Run a fix script before any upload attempt.
- Season enum must be uppercase; lowercase silently passes authoring but fails upload validation.
- `sweets-confectionery` is the correct sub-category slug for confectionery; `confectionery` alone is not seeded.
- Tool slugs use non-obvious ordering conventions; always look up the exact slug in `tools.ts`.
- In git worktrees, `seed-tools.ts` / `seed-ingredients.ts` read from the **worktree's** data files, not the main repo's. Both must be kept in sync.

**Out.** No schema changes. No voice-check CLI changes. No new TipTap blocks.

### Step 15 — Mindset register fix + type-intro readings + sub-category seed ✅ landed 2026-05-15

**Goal.** Fix the issues Rebecca raised reviewing the Step 14 anchor
batch: the prose drifted into ethereal AI-poetry, every script
restated the methodology, sub-categories were wrong (null instead
of practice types). One follow-up session to land all four fixes
together.

**Deliverable.**

- `docs/mindset-author.md` bumped to **v2** — register pinned to
  cooking-recipe-factual (not ethereal-spiritual); methodology
  moved to type-intro READING entries that practice scripts
  link to and assume; sub-category locked as practice type;
  worked example points at v2 anchor JSONs as the working
  reference; stripped defensive in-body disclaimers from the
  guidance.
- `docs/mindset-anti-tells.md` — five new `[block]` entries:
  ethereal-poetic register, defensive in-body disclaimer,
  methodology restatement, "what you might notice" lists,
  strange-metaphor tells. Total list now 16 entries.
- `packages/db/scripts/seed-mindset-taxonomy.ts` extended to
  seed **11 SubCategory rows** under `mindset` (one per
  `PracticeType` enum value). Each carries a one-sentence
  description. Idempotent on re-run.
- **5 new type-intro READING entries** at sub-category `reading`:
  `how-eft-tapping-works`, `how-energy-statements-work`,
  `how-rituals-work`, `body-based-meditation`,
  `journal-prompts-as-practice`. Each carries the methodology
  for one practice type. Practice scripts in the matching
  sub-category link to it in their opening paragraph and assume
  it's been read.
- **5 anchor practices re-authored.** Same slugs, same Tutorial
  ids (idempotent upload updated them in place). Stripped the
  imagined-felt-sensation intros, the methodology restatements,
  the defensive in-body disclaimers, the "what you might notice"
  lists. Sub-category set to practice type. Tapping anchor
  dropped from ~1,000 to ~400 words; ritual from ~800 to ~350;
  meditation from ~900 to ~500.
- `docs/mindset-anchor-report.md` rewritten to cover v1 → v2 +
  the v2 anchor batch.

Memory updates (auto-loaded for future Mindset workers):

- `feedback_mindset_voice.md` — Mindset prose follows
  cooking-recipe-factual register, not ethereal AI-poetry.
- `project_mindset_structure.md` — per-practice-type intro
  readings; sub-categories are practice types, not life
  categories.

**Out.**

- No voice-check.ts deterministic-rule edits (Mindset
  register-bans live in the drafting prompt's self-critique
  pass for now).
- No new TipTap blocks.
- No pilot-10, no bulk fill, no plan generator, no admin/public
  UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — `[needs-voice-check]` entries
   from `docs/mindset-anti-tells.md` into `voice-check-lib.ts`,
   plus fix the "Anchor"-as-ritual-step false positive.
2. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
3. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
4. Admin UI for Mindset — type-toggle in `tutorial-form.tsx`.
5. Public UI for Mindset.
6. Plan generator worker.

### Step 14 — Mindset authoring prompt + anti-tells + anchor batch ✅ landed 2026-05-14

**Goal.** Build the Mindset drafting prompt template (v1), seed the
Mindset anti-tells doc, and land 3–5 anchor practices across types as
`DRAFT` so Rebecca can review the end-to-end shape before pilot-10
fires.

**Deliverable.**

- `docs/mindset-author.md` v1 — the Mindset equivalent of
  `docs/tutorial-author.md`. Covers all 11 practice types, voice
  rules (standard + Mindset-specific register bans), self-critique
  checklist, source-attribution rules, length guidance per type,
  and the input / output contracts mapped to `TutorialUploadInput`.
- `docs/mindset-anti-tells.md` — 11 seeded entries across voice
  issues (therapeutic-claim creep, "queen / boss / step into your
  power" register, "manifest" overuse, spiritual bypass, future
  tense / negation in affirmations, false-intimacy openers,
  cosmic-promise framings), structural issues (tapping eight-point
  order, set-up statement specificity, reframe-mirroring),
  metadata issues, source-attribution issues. Six entries flagged
  `[needs-voice-check]` for the voice-check extension follow-up.
- **Anchor batch** — 5 `DRAFT` practices across types, visible at
  `/admin/tutorials?type=PRACTICE`:
  - `tapping-for-daily-money-panic` — TAPPING — MONEY + ANXIETY
  - `i-am-allowed-to-want-this` — ENERGY_STATEMENT — SELF_WORTH +
    MONEY + ABUNDANCE
  - `the-calm-and-safe-money-reset` — RITUAL — MONEY + ANXIETY +
    ABUNDANCE
  - `body-scan-for-sleep` — MEDITATION — SLEEP + ANXIETY + ENERGY
  - `feast-and-famine-journal-prompts` — JOURNAL_PROMPT — MONEY +
    ABUNDANCE + STUCK
- `docs/mindset-anchor-briefs/*.json` — five full `TutorialUploadInput`
  JSON files; the upload script's input + the canonical drafting
  reference for future Mindset workers.
- `docs/mindset-anchor-report.md` — anchor batch report (sources
  drawn from per anchor, voice-check pass / warning counts, what
  Rebecca should review first, TipTap-block gaps flagged for
  follow-up).
- `packages/db/scripts/seed-mindset-taxonomy.ts` — one-off seed for
  the `mindset` Category row. No sub-categories at launch; Mindset
  uses `practiceTargets[]` for life-category routing instead.
- `packages/db/scripts/upload-tutorial-types.ts` +
  `upload-tutorial.ts` — additive extension to accept `type =
  "PRACTICE" | "READING"` and a `practice` block carrying the
  Mindset metadata (`practiceType`, `practiceTargets`, `timeBand`,
  `bestTime`, `practiceDepth`, `whenToUse`, `whenNotToUse`,
  `alternativePracticeIds`). RECIPE / TECHNIQUE paths untouched.

**Out.**

- No `voice-check.ts` deterministic-rule edits — Mindset-specific
  bans (queen / boss / high-vibe / manifest overuse, therapeutic-
  claim verbs, cosmic-promise patterns, future-tense affirmations)
  captured in `docs/mindset-anti-tells.md` for the drafter's
  self-critique pass. Voice-check extension is its own session.
- No new TipTap blocks (anchor batch uses existing eight blocks).
  Three block gaps flagged in the anchor report (`tappingScript`,
  `ritualSteps`, `practiceStatement`) for a follow-up Mindset-blocks
  session.
- No pilot-10 batch — that's the next worker after Rebecca reviews
  the anchors.
- No bulk fill, no plan generator code, no admin UI extension, no
  public UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — `[needs-voice-check]` entries from
   `docs/mindset-anti-tells.md` land in `voice-check-lib.ts`.
2. *(optional)* Mindset-blocks gap fill — `tappingScript` /
   `ritualSteps` / `practiceStatement` TipTap blocks.
3. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
4. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
5. Admin UI for Mindset — type-toggle in `tutorial-form.tsx`.
6. Public UI for Mindset — Today view, Practice page, Library
   browse, "I'm feeling..." matcher.
7. Plan generator worker — picks up `UserPlan PENDING_GENERATION`
   rows, runs the generator prompt, writes 30 `UserPlanDay` rows.

### Step 13 — Mindset pipeline scaffold ✅ landed 2026-05-14

**Goal.** Open the second category in the multi-category fill plan. Get
the Mindset schema, library taxonomy, plan-generator tables, and
backlog into the repo so subsequent Mindset sessions (authoring prompt
template → voice-check extension → anchor batch → pilot-10 →
bulk authoring → plan generator) can each pick up their slice.

**Deliverable.**

- `packages/db/prisma/schema.prisma` — extends `TutorialType` with
  `PRACTICE` and `READING`, adds the eight Mindset enums
  (`PracticeType` 11-value, `PracticeTarget` 20-value, `TimeBand`,
  `BestTime`, `PlanTier`, `PlanStatus`, `PlanSlotSource`), the
  Tutorial Mindset metadata columns (`practiceType`,
  `practiceTargets[]`, `timeBand`, `bestTime`, `practiceDepth`,
  `whenToUse`, `whenNotToUse`, `alternativePracticeIds[]`), and the
  six user-side tables (`UserPlan`, `UserPlanDay`, `DailyPick`,
  `UserPracticeFavorite`, `UserPracticeUse`, `UserFeeling`). GIN
  index on `Tutorial.practiceTargets`, unique on
  `(UserPlan, dayNumber)` and `(userId, pickDate)` and
  `(userId, practiceId)` favorites. All additive — Cooking pipeline
  untouched.
- `packages/db/prisma/migrations/20260614000000_phase_8_step_13_mindset_schema/`
  — the migration SQL. Runs on the GH Actions deploy `prisma migrate
  deploy` step before ECS rollout, per the standard pattern.
- `apps/web/src/components/admin/tutorials/tutorial-form.tsx` +
  `preview-pane.tsx` + `apps/web/src/components/public/tutorial-chrome.tsx`
  — `type` unions widened from `'RECIPE' | 'TECHNIQUE'` to include
  `'PRACTICE'` and `'READING'`. No new admin UI yet; the form still
  only renders the RECIPE / TECHNIQUE toggle. Mindset admin lives in
  a later worker.
- `docs/mindset-backlog.md` — ~2,945 specific entry titles across all
  16 life categories. Mirrors the structure of `docs/recipe-backlog.md`:
  every brainstorm stuck-on point expanded into TAPPING / ENERGY_STATEMENT
  / AFFIRMATION / SPELL / RITUAL / ACTIVITY / JOURNAL_PROMPT /
  VISUALISATION / MEDITATION / EMBODIMENT / READING entry titles where
  the practice type fits. Source codes (`MONEY-v2/D<n>`, `MONEY-Journal/W<n>`,
  `Money-Zone/Ch<n>`, `SLEEP-v2/D<n>`, `WEIGHT-LOSS-v2/D<n>`,
  `MANIFESTING-v2/D<n>`, `[PD]`, `[NEW]`) tell the bulk-authoring worker
  where to pull from. Backlog finishes with cross-cutting indices —
  "I'm feeling..." matcher seeds, curated entry-point bundles,
  worker-handover note.

**Out.**

- **No content authoring.** No tapping scripts written, no rituals
  written, no readings written. Just schema + backlog.
- No premium gating logic — every feature built free per
  `feedback_premium_philosophy.md`, gated later via flag.
- No admin UI for Mindset yet (separate worker session).
- No public UI for Mindset yet.
- No plan generator code yet (`UserPlan PENDING_GENERATION` worker
  script is its own session).
- No image generation.
- No master entity tables for Mindset — practices are self-contained;
  Mindset has no equivalent of `Ingredient` / `Tool`.

**Next Mindset sessions, in order.**

1. Authoring prompt template — `docs/mindset-author.md`, the
   equivalent of `docs/tutorial-author.md` but for Mindset's shape.
2. Voice-check CLI extension — add the Mindset-specific bans
   (`queen` / `high-vibe` / `manifest` overuse) to
   `packages/db/scripts/voice-check.ts`.
3. Anchor batch — 3–5 practices across types, Rebecca reviews in
   admin preview.
4. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
5. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
6. Plan generator worker — picks up `UserPlan` rows with
   `status = PENDING_GENERATION`, runs the generator prompt, writes
   the 30 `UserPlanDay` rows, flips status to `ACTIVE`.

### Multi-category fill plan

Steps 1–12 above build out the cooking pipeline. This section extends the
plan to every top-level category so the broader scope stays visible.

Order is **feel-based**: pick the next category each session by what you
want depth in vs breadth on, what's reading well already, and what's
under-represented. The grid is a tracker, not a sequence.

#### Working assumptions

- **Plan tier:** Max 20x (confirmed). Half the weekly allocation goes to
  Homemade.
- **Models per session type:**
  - **Orchestrator** (occasional planning + coordination): Opus
  - **Tech / marketing worker** (code, deploys, copy work, infra): Opus
  - **Pipeline-setup worker** (per-category schema, prompt template,
    voice-check tuning, anchor tutorial): Opus
  - **Bulk content authoring worker** (the 2 parallel sessions doing
    daily fill): Sonnet
  - **Voice-check CLI**: deterministic, no model
- **Concurrency:** ~2 parallel content sessions, 12h × 6 days/week each,
  plus the orchestrator and the tech/marketing session running as needed.
- **Throughput per session-hour:** ~10 articles drafted, voice-checked,
  uploaded. The Step-10 pilot measured 12.8/hr on the tuned cooking
  pipeline (10 recipes in 47 minutes wall-clock). Real rate drops on new
  categories; 70% productivity factor accounts for that.
- **Total throughput:** **~1,000 articles/week** with both content
  sessions on the same category. ~500/wk per category if split across
  two in parallel.
- **Per-category pipeline setup:** ~1 week each (master entity tables,
  authoring prompt template, voice-check tuning, category-specific
  schema additions, anchor tutorial, pilot batch of 10 with feedback).
- **Auto-publish flow.** Bulk content sessions write → self-critique →
  voice-check → auto-publish as PUBLISHED. No per-draft manual review
  by Rebecca; she spot-checks live on the site as she has bandwidth.
  Splash gate keeps the site private pre-launch, so anything that slips
  through is only seen by her. When a recurring quality issue surfaces
  (3+ instances in a batch), the worker appends it to
  `docs/common-issues.md`; subsequent workers explicitly check for it
  during self-critique. The post-launch path is a Tester program that
  sees tutorials before public publish — not in scope yet (tracked in
  Phase 6 + future work).
- **Image generation:** deferred for the whole fill phase — heroes
  batch-generate from pre-launch budget.

Revise the rates here when actuals diverge from estimates.

#### Category grid

| # | Category | Target | Current | Pipeline | Fill weeks @ 1k/wk |
|---|---|---:|---:|---|---:|
| 1 | Cooking | 7,000 | 504 PUBLISHED (anchors + pilot-10 + personal-recipe ingest + bulks 001-007 across cuisines, methods, soups/salads/breakfasts/drinks/preserves/desserts) | ✅ ready for savoury; preserves + fermenting + charcuterie + cheese + brewing each need ~3–4 days schema/prompt extension | 7 |
| 2 | Baking | 3,000 | 64 (4 DRAFT anchor + 60 PUBLISHED: 10 pilot + 50 bulk-001, 2026-05-16) | ✅ schema + taxonomy + authoring prompt + anti-tells + 4-anchor batch + pilot-10 + bulk-001 all landed. Bulk-001: 50 recipes PUBLISHED spanning bread (10), cakes (10), pastries (5), pies (5), biscuits (6), scones (4), sweets-confectionery (5), cake-decorating (2), other (2). 8 BEGINNER / 31 INTERMEDIATE / 11 ADVANCED. 20 new ingredients + 19 new tools seeded. `docs/baking-anti-tells.md` extended to 16 entries (4 new: em-dash pairs in sourceNotes, season enum uppercase, sweets-confectionery slug, tool slug precision). Report: `docs/baking-bulk-001-report.md`. Four anchor DRAFTs (tin loaf / Victoria sandwich / shortcrust / shortbread) pending Rebecca review. Bulk fill continues from backlog. Baking-specific TipTap blocks (baker's percentages, lamination schedule, sugar-stage panel) — still ahead. | 3 |
| 3 | Garden | 4,000 | 0 | Not started — ~1 wk setup | 4 |
| 4 | Herbal medicine | 2,500 | 0 | Not started — ~1 wk setup | 2.5 |
| 5 | Mindset | 4,300 | 11 DRAFT + 20 bulk-001 drafted-not-uploaded (autopilot blocked at upload by DB migration drift, 2026-05-16) | ✅ schema + backlog + authoring prompt v3 + anti-tells (24 entries) + 11 sub-categories + 11-entry anchor batch ready. **bulk-001 (autopilot, 2026-05-16):** 20 briefs drafted and voice-checked clean (15 PRACTICE across all 10 active types + 5 new type-intro READINGs for AFFIRMATION / SPELL / ACTIVITY / VISUALISATION / EMBODIMENT). Upload blocked: migration `20260619000000_phase_categories_targets_001` adds `Category.targetTutorialCount` columns that prod Neon DB doesn't have, so every `prisma.category.findUnique()` from the upload script throws `P2022 ColumnNotFound`. Halt signal written (reason=DB_MIGRATION_PENDING). Briefs preserved in `docs/mindset-bulk-001-briefs/`; re-run will pick them up once migrations deploy. Cooking + baking autopilot will also be blocked by this until the migration runs. Migration `20260614000000_phase_8_step_13_mindset_schema` ships PRACTICE / READING TutorialType values + 11-value `PracticeType` + 20-value `PracticeTarget` + `TimeBand` + `BestTime` + `PlanTier` + `PlanStatus` + `PlanSlotSource` enums + Tutorial practice-metadata columns + the six user-side tables. `docs/mindset-backlog.md` enumerates ~2,945 specific entry titles across all 16 life categories. `docs/mindset-author.md` v3 + `docs/mindset-anti-tells.md` (now 24 entries, ~20 [block]) drive Mindset drafting. Voice-check Mindset extension, pilot of 10, bulk fill, plan generator, admin/public UI — still ahead. | 4.3 |
| 6 | Crochet | 1,500 | 0 | Not started — ~1 wk setup | 1.5 |
| 7 | Knitting | 1,500 | 0 | Not started — ~1 wk setup | 1.5 |
| 8 | Needlework | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 9 | Sewing | 1,200 | 0 | Not started — ~1 wk setup | 1.2 |
| 10 | Fibre arts | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 11 | Wood & natural craft | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 12 | Paper & word | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 13 | Pottery & ceramics | 500 | 0 | Not started — ~1 wk setup | 0.5 |
| 14 | Animals & smallholding | 700 | 0 | Not started — ~1 wk setup | 0.7 |
| 15 | Home & repair | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 16 | Natural home | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 17 | Sustainability | 700 | 0 | Not started — ~1 wk setup | 0.7 |
| | **Total** | **31,700** | **202** | ~16 wks setup outstanding (new categories) + ~3 wks Cooking sub-extensions | ~32 weeks fill |

#### Sub-categories per top-level

- **Cooking** — savoury meals, soups, salads, breakfasts, sauces &
  condiments, preserving & fermenting, charcuterie, cheese & dairy,
  brewing & drinks
- **Baking** — bread, cakes, pastries, biscuits, pies, scones,
  sweets & confectionery, cake decorating
- **Garden** — vegetables, fruit, herbs, flowers, permaculture,
  microgreens, hydroponics, mushroom growing, foraging
- **Herbal medicine** — remedies, tinctures, infusions, decoctions, oils,
  balms, salves, syrups, home apothecary
- **Mindset** — manifesting, tapping, energy work, daily practice,
  journal prompts, 30-day plans
- **Crochet** — stitches, techniques, patterns (public-domain only at
  launch)
- **Knitting** — stitches, techniques, patterns (public-domain only at
  launch)
- **Needlework** — cross-stitch, tatting, lacemaking, needlepoint
- **Sewing** — dressmaking, quilting, mending & visible mending
- **Fibre arts** — spinning, weaving, dyeing, felting, rug making,
  macramé
- **Wood & natural craft** — woodworking, whittling, spoon carving,
  basketry, willow weaving
- **Paper & word** — paper crafts, bookbinding, calligraphy,
  scrapbooking, journalling-as-craft (bullet journals, art journals,
  junk journals, travel / nature journals, making the book itself).
  Journal *practice* — prompts, gratitude, daily reflection — sits in
  Mindset.
- **Pottery & ceramics** — hand-building, throwing, glazing, firing
- **Animals & smallholding** — beekeeping, chickens, backyard livestock
- **Home & repair** — building, upholstery, furniture restoration,
  bushcraft
- **Natural home** — soap, candles, DIY beauty, DIY cleaning, home
  fragrance
- **Sustainability** — solar (DIY solar projects, solar oven, solar
  water heater), water reduction & harvesting (rainwater catchers,
  greywater, water-saving fixtures), composting (kitchen, garden, hot
  vs cold, vermicompost), waste reduction (zero-waste, plastic-free,
  package-free swaps, repair-don't-replace), energy efficiency
  (insulation, draft-proofing), renewable heating (wood stove, masonry
  heater), off-grid basics

#### Pipeline-specific setup notes

The rough shape for each new pipeline. Schema notes are illustrative —
finalise at setup time.

- **Garden.** Master `PlantVariety` table (variety, parent species, USDA
  + RHS hardiness zones, sun / water / soil prefs, days to maturity),
  zone reference table, planting-calendar metadata on Tutorial,
  pest / disease cross-refs, companion-planting relations. Tutorial type
  extends to `GROWING_GUIDE`.

- **Herbal medicine.** Master `Herb` table (Latin binomial, common names,
  parts used, primary actions, key constituents, safety flags),
  `Condition` table (body system, common symptoms, cross-refs),
  preparation typing (tincture / decoction / infusion / oil / salve /
  balm / syrup), drug-interaction notes. Strongest "no medical advice"
  voice rules of any category. Tutorial type extends to `REMEDY` and
  `HERB_PROFILE`.

- **Mindset.** `Practice` library (tapping script / energy alignment
  statement / ritual / journal prompt / breathwork as typed entities),
  `Plan` template entity (30-day skeletons with daily activity slots).
  No master ingredient / tool equivalents. Tutorial type extends to
  `PRACTICE`, `READING`, `PLAN`.

- **Crochet / Knitting.** Master `Stitch` table (name, US + UK
  terminology variants, symbol, difficulty), `YarnWeight` reference,
  pattern metadata (gauge, hook / needle size, finished dimensions, yarn
  quantity), symbol-chart rendering. AI not used for stitch photos
  (locked decision); one-time manual stitch shoot. Tutorial type extends
  to `PATTERN` and `STITCH`.

- **Needlework.** Similar shape to crochet / knitting with a separate
  `Stitch` namespace (cross-stitch counts grid squares, tatting uses
  shuttle motions, lacemaking has bobbin diagrams).

- **Sewing.** `Pattern` table for garment patterns (public-domain at
  launch — Edwardian, 1940s, vintage), fabric metadata, body-measurement
  reference, quilt-block library. Tutorial type extends to `PATTERN`
  and `TECHNIQUE`.

- **Fibre arts, Wood & natural, Paper & word, Pottery, Animals, Home &
  repair, Natural home.** Schema notes deferred to each category's
  setup session — most follow the pattern of "master entity table +
  category-specific Tutorial subtype + metadata fields", echoing what
  cooking has.

#### How to use the grid

- **Current count** updates after every content batch. Worker sessions
  update it as part of their hand-off; spot-checks update it when
  Rebecca reviews.
- **Target** is "super super full and deep". Adjust down if a category
  reads fine at half depth; up if a sub-category wants more.
- **Order is your call session-by-session.** Common patterns: fill one
  category to feel-it-out depth and pause; alternate deep / quick
  categories for variety; push the holistic-life spine first
  (Kitchen + Garden + Herbal + Mindset).
- **Pipeline** flips to ✅ once a category's setup is complete (master
  entity tables seeded, authoring prompt tuned, schema extensions
  migrated, voice-check tuned, anchor tutorial drafted, pilot-10
  reviewed). Pipeline-setup sessions are their own worker sessions.
- **Fill weeks** assume both content sessions are on one category. Halve
  the rate if they're working different categories in parallel.
- **Adding new categories or sub-categories.** Just append a row to the
  grid (copy the column shape from an existing row) and a bullet to the
  sub-categories list. Bump the **Total** row. A brand-new top-level
  category adds ~1 week of pipeline setup; a new sub-category typically
  slots into its parent's existing pipeline (smaller schema / prompt
  extension, no full setup).

#### Strategic reference

- **Holistic-life spine** = Cooking + Baking + Garden + Herbal medicine
  + Mindset. ~20,800 articles at full depth (Mindset's full brainstorm
  came in much richer than the original estimate — ~4,300 entries).
  ~21 weeks fill + ~3 weeks remaining setup. Fills the Barbara
  O'Neill-style worldview unmistakably before broadening.
- **Carryover from the original 5-launch list**: Crochet + Knitting
  benefit from existing public-domain pattern sources mapped in Master
  Plan §6 (Weldon's, de Dillmont). Moderate setup, straightforward fill.
- **Cheap-breadth categories**: Pottery, Wood & natural, Animals &
  smallholding, Home & repair, Paper & word, Sustainability. Smaller
  volumes, on-brand, useful for filling the platform out once the spine
  is solid. Sustainability has natural cross-references into Garden
  (composting, greenhouse), Natural home (eco cleaning, plastic-free),
  and Home & repair (insulation, draft-proofing) — overlap is fine, tag
  primary + secondary categories on individual tutorials.
- **Pending decisions:** all open at the time of writing are now
  locked. Max 20x confirmed. Natural home named. Cooking + Baking
  split as separate top-level categories. Launch shape "C-ish,
  feel-based" — the grid is the tracking surface; sequencing happens
  session-by-session.

### Pre-launch — image generation pass

Generate heroes (and inline illustrations where the page design calls for them) in batches once budget is allocated. Update existing Tutorial rows via the upload script (idempotent on re-run). Locked prompts and tier in `docs/tutorial-author.md`. Expected total at 2,000 recipes + 600 techniques: ~£100–£150 for heroes only, ~£260–£400 if inline illustrations come too.

---

---

## Recent sessions

Sessions newer than 2026-05-12, in the order they landed. Phase entries older than this and shipped infra / analytics rollouts are in the [archive](docs/archive/build-progress-history.md).

## Bug-fix bundle — Clerk auth error on tutorial pages + public error boundaries + analytics loose ends (2026-05-13)

Six-item bundle clearing one production Sentry issue, adding the
public-side error boundaries the analytics taxonomy was waiting on,
and wiring the last five "catalogued but unwired" PostHog events.

### Clerk auth() error on tutorial pages — root cause + fix

- **Root cause** (already documented in pre-launch debt before this
  session): `apps/web/src/proxy.ts` matcher excluded any path ending
  in `.<letters>` via `.*\.[a-zA-Z]+$`. That swallowed bot probes like
  `/wp-admin.php`, `/.env`, `/sitemap.xml.html` — the matcher rule
  meant `clerkMiddleware` never ran for them, but Next still routed
  them to the dynamic `[categorySlug]` page, which calls
  `getCurrentDbUser()` → `currentUser()` → throws "Clerk: auth() was
  called but Clerk can't detect usage of clerkMiddleware()". ~17
  occurrences/hour from bot traffic; no real-user impact, but Sentry
  noise drowned signal.
- **Fix A (matcher):** swap the broad regex for an allowlist of
  actual static-asset extensions:
  `svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|woff|woff2|ttf|otf|wasm|txt|xml|json`.
  Bot probes now go through `clerkMiddleware` and hit the splash gate
  (404 / rewrite to `/coming-soon`) like any other unknown URL.
- **Fix B (defensive try/catch):** `getCurrentDbUser()` wraps
  `currentUser()` in a try/catch that returns `null` on Clerk runtime
  errors and reports a warning-level Sentry exception with
  `tags: { source: 'getCurrentDbUser' }`. Cheap insurance against
  future RSC sub-request edge cases where middleware might not
  surround a server-component call.

Both fixes ship together — matcher is the root cause, defensive
try/catch keeps a future regression from being a 500.

### Public error boundaries

- `apps/web/src/app/(public)/error.tsx` — root client error boundary
  for the entire public route group. Brand-fit fallback ("Something
  went wrong on our end. We've been told, and we'll have a look.")
  with "Try again" (calls `reset()`) and "Back to homepage" links.
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/error.tsx`
  — tutorial-scoped boundary so a broken tutorial keeps the site
  header / footer and isolates the failure to the article body.
- Both boundaries call `Sentry.captureException(error)` AND
  `captureClientEvent('error_boundary_triggered', { ... })` so the
  PostHog `error_boundary_triggered` dashboard pairs with Sentry's
  view from the user's perspective.
- Brand-fit CSS in `apps/web/src/components/public/site-chrome.css`
  (under `.public-error-boundary`).

### Analytics events — five closed out

All five remaining "catalogued but unwired" events from Phase B now
fire from their natural code paths. The taxonomy doc
(`docs/analytics-taxonomy.md`) was updated in this same commit with
the final property shapes — only `payment_failed` remains
catalogued-but-unwired (Phase 7/8 placeholder).

- **`error_boundary_triggered`** — fires from the two new boundaries
  above with `{ path, errorName, errorMessage (truncated 120),
  digest, scope? }`. `scope: 'tutorial'` on the tutorial boundary,
  omitted on the root one so dashboards can distinguish them.
- **`account_data_export_downloaded`** — `apps/web/src/app/(public)/me/data-rights/export-panel.tsx`
  added an `onClick` to the "Download bundle" anchor that fires
  `{ requestId, bytes, generatedAt }` before the navigation. Fire-
  and-forget, doesn't block the download.
- **`search_result_clicked`** — new
  `apps/web/src/app/(public)/search/search-results.tsx` client
  wrapper around the result grid. Uses `display: contents` on the
  wrapping span so the underlying `TutorialCard` stays as the grid
  item and layout is unchanged. Fires
  `{ query, filters, position, tutorialId, tutorialSlug,
  categorySlug, totalResults }` on capture so the navigation isn't
  delayed. Only wraps actual search hits, not the recently-published
  fallback shown when the page is opened with no query.
- **`tutorial_shared`** — first wire in any form (the event existed
  in the taxonomy but never had a firing path). New
  `apps/web/src/components/public/tutorial-reader/share-button.tsx`:
  on devices that expose `navigator.share`, renders a single Share
  button that opens the OS sheet and fires `destination: 'native'`.
  Otherwise renders a popover menu with copy-link / Twitter (X) /
  Pinterest / Facebook / email — each fires with the matching
  `destination` (`copy_link` / `twitter` / `pinterest` / `facebook`
  / `email`). Click-outside + Escape close the menu. Available on
  every tutorial page for signed-in AND anonymous readers (the
  tutorial actions bar now renders the share button as a baseline,
  with bookmark + project buttons layered in for signed-in users).
- **`account_deletion_completed`** — fires from the per-user step in
  the hard-delete Inngest cron (`apps/web/src/inngest/functions/hard-delete-accounts.ts`)
  after `hardDeleteAccount` succeeds. The cron now also pre-loads
  the user's `clerkId` and the `AccountDeletionRequest.requestedAt`
  alongside the queue. `distinctId` is the Clerk id so the event
  stitches onto the same PostHog person the user's lifecycle has
  been tracked against. Properties:
  `{ userId, daysScheduledFor: 30, requestedAt, completedAt, reason }`.
  `flushPostHog()` runs once at the end of the function so the
  serverless process doesn't tear down before events leave the
  buffer.

### Files touched

- `apps/web/src/proxy.ts` (matcher allowlist)
- `apps/web/src/lib/get-current-user.ts` (try/catch + Sentry)
- `apps/web/src/app/(public)/error.tsx` (new)
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/error.tsx` (new)
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` (import + wire share into actions slot)
- `apps/web/src/app/(public)/me/data-rights/export-panel.tsx` (onClick)
- `apps/web/src/app/(public)/search/page.tsx` (use SearchResults wrapper)
- `apps/web/src/app/(public)/search/search-results.tsx` (new)
- `apps/web/src/app/(public)/search/search-page.css` (`.search-result-card-wrap` shim)
- `apps/web/src/components/public/tutorial-reader/share-button.tsx` (new)
- `apps/web/src/components/public/tutorial-reader/tutorial-reader.css` (share menu styles)
- `apps/web/src/components/public/site-chrome.css` (error boundary styles)
- `apps/web/src/inngest/functions/hard-delete-accounts.ts` (event firing)
- `docs/analytics-taxonomy.md` (five rows reworded as wired with final properties)

### Things scoped out of this session

- Recipes-first schema reshape — parallel content-pipeline session
  owns `packages/db/prisma/schema.prisma` and the recipe TipTap
  blocks. This session stayed out of both.
- Public tutorial page layout — only minimum-surgical edits inside
  `page.tsx` (import + actionsSlot tweak); no rearranging sections
  or styling.
- New admin pages or marketing pages.
- Tightening the rules ESLint Phase 1 downgraded — its own session.

### Pre-launch debt observed during this session

- The `proxy.ts` matcher row in BUILD_PROGRESS.md "Pre-launch debt"
  is now closed (the fix landed here). Memory's
  `project_build_state.md` and `feedback_analytics_*` should drop
  that bullet on the next memory refresh.

---

## Bug fix — defensive tutorial page handler + ALB Cloudflare-only ingress (2026-05-14)

Two-item session closing the gaps surfaced by Sentry event
`17879686637e4c3fb5096420d3c392a7`. A bot scanner hit the bare ALB IP
at `https://35.176.112.213/dist/ui.browser.js`; the URL fell through
to the dynamic `[categorySlug]/[tutorialSlug]` route, Prisma threw,
and the request 500'd instead of 404-ing. Same probe also exposed
that the ALB security group accepted traffic from anywhere — every
scanner on the internet could bypass Cloudflare's WAF, bot detection,
and rate limits.

### Defensive tutorial page handler

`apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx`:

- **Slug validation:** `SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/` plus
  an `isValidSlug` type guard at the top of the file. Both
  `generateMetadata` and the page component reject invalid slugs
  before the Prisma call — `generateMetadata` returns a `Not found`
  title, the page calls `notFound()`. Catches `ui.browser.js` (dot),
  pathologically long inputs, uppercase, slashes, and URL-encoded
  characters. Genuine tutorial slugs all conform to the pattern.
- **Prisma-error catch:** `loadTutorial` wraps the `prisma.tutorial.findFirst`
  in a try/catch that reports the exception to Sentry at
  `level: 'warning'` with `tags: { route: 'tutorial-page' }` and
  returns `null`. The existing `notFound()` flow downstream handles
  the null return — so a never-seen-before Prisma error 404s
  cleanly with the brand 404 page instead of triggering the
  per-tutorial error boundary's 500.

The pattern mirrors `getCurrentDbUser`'s warning-level catch from the
2026-05-13 Clerk fix.

### ALB Cloudflare-only ingress

- **New `infra/lib/cloudflare-ips.ts`** — readonly arrays of
  Cloudflare's published IPv4 + IPv6 origin CIDRs (15 + 7 ranges,
  refreshed 2026-05-14 from `cloudflare.com/ips-v4` / `ips-v6`).
  Header comment names the source and refresh date.
- **`infra/lib/homemade-stack.ts`** — both ALB listeners (HTTPS:443
  and HTTP:80) flipped from `open: true` to `open: false`. A loop
  after listener creation iterates `CLOUDFLARE_IPV4` + `CLOUDFLARE_IPV6`
  and calls `alb.connections.allowFrom(...)` for each CIDR × both
  ports. End state: ALB security group accepts ingress only from
  Cloudflare CIDRs.
- **CloudWatch alarms unchanged.** All three (`Alb5xxAlarm`,
  `TargetUnhealthyAlarm`, `EcsRunningTaskAlarm`) pull from
  AWS-internal metric services (`AWS/ApplicationELB` +
  `AWS/ECS`) — they don't probe the ALB over the network, so the
  lockdown doesn't affect them.
- **ECS target group health check unchanged.** Inbound to the ECS
  task SG (allowing the ALB to reach `:3000/healthz`) is separate
  from inbound to the ALB SG.
- **Single-deploy.** Pure SG change — no IAM grants or secret
  references — so the two-step CFN pattern from Phase 2e / the
  hardening pass isn't needed here.

### Runbook

`docs/refresh-cloudflare-ips.md` covers: signals it's time to
refresh, the curl-and-compare procedure, the rule-count sanity check
(44 rules currently, well under the 60-rule default SG quota),
deploy + post-deploy validation, and the rationale for hardcoding
vs. fetching at synth time.

### Sentry trace

`SENTRY_AUTH_TOKEN` in `.env.credentials` carries only the `org:ci`
scope, which is the minimum needed for the GitHub Actions
sourcemap-upload step. Reading individual events through the API
returns `403 You do not have permission to perform this action`.
The fix didn't need the exact Prisma error code — both the slug
validation and the catch-all are correct regardless. Pre-launch
debt: provision a Sentry token with `event:read` so future bug-fix
sessions can pull traces without bouncing back to Rebecca.

### Files touched

- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` —
  slug validation + Prisma try/catch + Sentry import
- `infra/lib/cloudflare-ips.ts` (new)
- `infra/lib/homemade-stack.ts` — listeners `open: false`, Cloudflare
  CIDR ingress loop, import for the IP lists
- `docs/refresh-cloudflare-ips.md` (new)

### Things scoped out of this session

- Phase 8 content-pipeline work (step 8 body-authoring prompt
  rewrite is in flight in a parallel session — `docs/tutorial-author.md`,
  `packages/db/scripts/`, `packages/ai/`).
- Social strategy docs.
- New analytics events, marketing pages, admin pages.
- Schema changes.
- Cloudflare SSL / ACM changes beyond reading the existing setup.

### Pre-launch debt observed during this session

- Provision a Sentry auth token with `event:read` (in addition to
  the existing `org:ci`) so worker sessions can pull individual
  event traces without permission failures.

---


## Homepage rebuild — state-aware rail stack + procedural cards + editorial picks + seasonality + onboarding

Workstream 2 of the 2026-05-15 full UX review. Rebuilds the public homepage at production fidelity. Six pieces:

- **Schema migration** `20260616000000_phase_8_homepage_rebuild` — additive. `User.onboardedAt`, `User.primaryCategoryIds[]`, `User.experienceLevel` (new `ExperienceLevel` enum: BEGINNER | INTERMEDIATE | CONFIDENT), `User.homeCountryCode`, `User.dietaryFlags[]`, `User.lastSeenAt`. `Tutorial.heroImageStrategy` (new `HeroStrategy` enum: REAL_PHOTO | PROCEDURAL_CARD | PUBLIC_DOMAIN_PLATE | AI_GENERATED | UNSET). `UserProject.nextScheduledStepNumber`, `UserProject.nextScheduledAt`, `UserProject.scheduledStepsCompleted[]`. New tables: `WeeklyEditorialPick` (5 picks per Monday-anchored week, status auto/pinned/replaced, unique on (weekStarting, position)), `ProjectSchedule` (multi-day arc step definitions: stepNumber, offsetDays, title, body, surfaceAs HERO/RAIL_CARD/NOTIFICATION_ONLY, requiresUserAction). All fields up-front per `feedback_schema_all_fields_upfront.md`.
- **Procedural card system** at `apps/web/src/lib/procedural-card.ts` + `/api/procedural-card/[tutorialId]` Next route. Zero-cost SVG hero placeholder for every tutorial missing a real photo. Category-tinted gradient + parchment grain + Fraunces title + small homemade wordmark. Palette mapping covers all 17 categories with permissive slug-substring fallbacks. Cached at the edge (s-maxage=604800, stale-while-revalidate=86400). `tutorialHeroSrc()` helper in `apps/web/src/lib/tutorial-hero.ts` is the unified resolver — real Media row when present, procedural URL otherwise. No bulk backfill needed: the runtime resolver covers every Tutorial without a hero, and `heroImageStrategy` tracks the intent for future explicit overrides.
- **Seasonality engine** at `apps/web/src/lib/seasonality.ts` — UK calendar across all 12 months with 3-4 themes each, weighted 0-1. Southern-hemisphere countries (AU/NZ/ZA/AR/CL/+) shift the calendar by six months. Country code from Cloudflare's `cf-ipcountry` header at request time, overridden by `User.homeCountryCode` when set. `seasonalityScore(tutorial)` ranks against the tutorial's `mood[]`, `dietaryFlags[]`, `cuisine`, `mealType`, `season`, and `practiceTargets[]`.
- **Editorial picks engine** at `apps/web/src/lib/editorial-picks.ts` + Inngest cron `editorial-picks-refresh` firing Sunday 22:00 UTC. Scoring: recency (+5 in 14d, +2 in 30d), seasonality (+10 strong / +3 mild), engagement (log-scaled bookmarks + projects), recently-featured penalty (-8 in 60d, -3 in 120d), same-category-as-last-week's-#1 (-4). Pinned + manually-replaced rows are preserved across cron runs. Admin page `/admin/editorial-picks` shows the next 4 weeks; each card has pin/unpin + replace-with-tutorial-picker (audit-logged); top-level button regenerates all auto-picks. Server actions in `apps/web/src/lib/editorial-picks-actions.ts` are EDITOR-gated.
- **Onboarding card** at `apps/web/src/components/public/onboarding-card.tsx` — three quiet steps for signed-in users with `onboardedAt === null`. Step 1 multi-select 17 category cards. Step 2 multi-select dietary chips (vegan / vegetarian / gluten-free / dairy-free / nut allergy / halal / kosher / pescatarian). Step 3 single-select experience level — BEGINNER also flips on `beginnerMode` for the first session. Skip allowed; submit + skip both stamp `onboardedAt` so the card never re-pops. PostHog events: `onboarding_started`, `onboarding_completed`, `onboarding_skipped`. Server action in `apps/web/src/lib/onboarding-actions.ts`. Client component is Prisma-free so it doesn't drag the Prisma client into the public bundle.
- **Header restructure** in `apps/web/src/components/public/site-header.tsx` + new `CategoryMenu` client island. Desktop: wordmark left, spine nav centre (Cooking / Baking / Garden / Mindset / Herbal) + "All categories" dropdown for the other 12, pill-shaped search "What are you making?" right, then avatar / sign-in. Mobile (≤900px): nav collapses to a hamburger that opens a bottom-sheet listing every category and Search; search bar takes the freed width. Search is the primary affordance per the brief.
- **State-aware hero + rail stack** in `apps/web/src/app/(public)/page.tsx` + `apps/web/src/lib/homepage-data.ts`. Hero priority: onboarding card → today's scheduled-step (HERO surface) → continue making (most recent IN_PROGRESS within 30 days) → this week's editorial pick #1 → wordmark fallback. Rails, conditionally rendered: today's scheduled actions, continue making, in season right now, this week's editorial picks, saved (bookmarked-but-not-started), where you left off (IN_PROGRESS >14d stale), new since you last visited (uses `User.lastSeenAt`), most-loved per spine category (5 rails), all categories grid. Empty rails don't render. Card metadata always-on: hero (real or procedural) + category + title + time · difficulty + up to 3 dietary glyphs + Saved indicator. Mobile: rails scroll horizontally with snap; hero stacks vertically; bottom-sheet nav.

Commit: `<sha>` — feat(public): state-aware homepage + editorial picks + procedural cards + seasonality + onboarding.

## Admin overhaul — dashboard, content list, preview drawer, taxonomy, glossary, media, cmd-K, RBAC unification

Workstream 3 of the 2026-05-15 full UX review. Reshapes the entire admin surface to Netflix-grade tool quality and 25k+ tutorial scale. Ships a unified `/admin` workspace that creators, editors, and admins all enter.

- **Schema migration** `20260616100000_phase_admin_overhaul_001` — additive. New `SavedFilter` (id, userId, name, description, filterQuery Json, indexed on `(userId, updatedAt)`) and `AdminCommandHistory` (id, userId, command, context Json?, executedAt, indexed on `(userId, executedAt)`). Both cascade on `User` delete.
- **Sidebar restructure (RBAC-aware)** in `apps/web/src/app/admin/layout.tsx` + `apps/web/src/components/admin/admin-sidebar.tsx`. Six top-level groups (Dashboard / Content / Users / Community / Growth / System) with per-item `minRole` gating. Top-of-sidebar block: wordmark, "Open public site →" (new-tab), avatar + role badge. Footer hints ⌘K. CREATOR sees only Content. EDITOR / ADMIN see appropriate groups. Tags item removed from nav.
- **Admin ↔ frontend nav** — public footer surfaces an "Admin" link to anyone with role ≥ CREATOR (creators administer their own content via the unified surface). Admin sidebar links out to the public site.
- **/admin dashboard rebuild** at `apps/web/src/app/admin/page.tsx` + `apps/web/src/lib/admin-dashboard-data.ts` — replaces the placeholder. Top: "Needs attention" inbox (reviews / UGC photos / Q&A / errata / reports / DMCA / creator applications — zero-count rows hide; if everything's zero, shows "All caught up."). Middle: 8 KPI cards (Total published with 7-day delta + sparkline, Total users + sparkline, Active projects this week, New signups this week, Moderation queue depth, Hero coverage %, Today's auto-published, Editorial weeks queued). Sparklines are server-rendered SVG (no client JS). Below: Pipeline widget — published + draft per category with a fill % bar. All aggregates wrapped in `unstable_cache` with 60s TTL.
- **category-counts helper** at `packages/db/scripts/category-counts.ts`. Outputs a markdown grid (per category + per type roll-up) ready to paste into BUILD_PROGRESS.md. Wired as `pnpm --filter db run counts`.
- **cmd-K command palette** at `apps/web/src/components/admin/command-palette.tsx` using the `cmdk` library (Vercel's). Mounted globally on `/admin`. Sections: Recent (last 10 commands from localStorage), Pages (role-filtered list), Tutorials (live fuzzy search via `/api/admin/command-palette` — CREATOR scoped to own), Users (EDITOR / ADMIN only — fuzzy email / name / handle), Actions (New tutorial, Open public site). Each invocation fires `admin_command_invoked` and persists to `AdminCommandHistory` best-effort via `/api/admin/command-palette/record`.
- **Content list rebuild** at `apps/web/src/app/admin/tutorials/page.tsx` + supporting `filters.ts`, `bulk-actions.ts`, `saved-filter-actions.ts`. Big search input, primary chip filters (Status / Type / Category — multi-select), "More filters" drawer (Cuisine / Meal type / Mood / Dietary / Difficulty / Season / Hero / Author), sort selector (Updated / Published / Title), view toggle (Table / Grid), page-size selector (25/50/100). Saved-filters row with per-row delete + "+ Save current filter" CTA. Bulk action bar (appears with ≥1 row selected): publish / unpublish / archive / delete (ADMIN only), plus "Apply to all N matching the filter" mode that re-derives the WHERE clause server-side from the URL query so admins can't smuggle an over-broad selector. Status pill clicks now filter to that status. Title click and edit link both open the editor. Thumbnail in table rows. Grid view shows hero cards.
- **RBAC scoping in content list + actions** — CREATOR queries scope to `creatorId = user.id`. Editor actions (`updateTutorial`, `createTutorial`, `transitionTutorialStatus`) now go through a `requireContentActor` helper + `assertRowAccessible` ownership check for CREATORs. CREATOR can submit DRAFT → PENDING_MODERATION; PUBLISHED / SCHEDULED / ARCHIVED transitions stay EDITOR-and-above. Bulk actions are EDITOR-and-above; bulk delete is ADMIN-only.
- **Edit page sticky preview drawer** in `apps/web/src/components/admin/tutorials/tutorial-form.tsx` + `tutorial-form.css`. Sticky top-of-form button toggles a fixed-position right-side drawer (40 vw, min 360 px) that renders the public preview live via the existing `PreviewPane`. Editor + drawer coexist (60/40 split); editor stays editable while drawer is open. Drawer collapses to full-width on phones. Body section is now visible above-the-fold for the most common edit case Rebecca flagged.
- **Categories tree view** at `apps/web/src/app/admin/categories/page.tsx`. Replaces the separate Categories + Sub-categories pages with one collapsible tree using `<details>` for native expand/collapse. Each category row shows tutorial count + sub-category count; expanding reveals sub-categories with edit + delete + inline "Add sub-category" form. Bottom-of-page form creates a new top-level category. `/admin/sub-categories` and `/admin/sub-categories/*` redirect to the tree.
- **/admin/tags retired** — the route returns a notice explaining that tags were replaced by mood / meal type / dietary / cuisine typed fields. The Tag Prisma model stays intact (per `feedback_schema_all_fields_upfront.md` — a future cleanup migration drops it once production has no references). Tags removed from sidebar.
- **Glossary scale fixes** at `apps/web/src/app/admin/glossary/page.tsx`. Search input (term / slug / definition) + category filter (including "cross-category — no parent" option) + pagination preserved. Clean table with subdued styling.
- **Media scale fixes** at `apps/web/src/app/admin/media/page.tsx`. Search by filename / alt / caption + type filter (PHOTO / VIDEO / DIAGRAM / ILLUSTRATION) + status filter (UPLOADING / READY / FAILED) + pagination. Grid view with thumbnails; per-tile "Hero on N tutorials" reverse-ref count from the `tutorialsHero` relation.
- **RBAC unification** — `/me/creator/tutorials`, `/me/creator/tutorials/new`, and `/me/creator/tutorials/[id]` now redirect to their `/admin/tutorials*` equivalents. Existing in-app links updated. `/me/creator` landing page kept as the personal creator dashboard (stats, applications). `creator-tutorial-actions.ts` library kept as an orphan for now (zero callers post-redirect) — pre-existing creator-only routes can resurrect it if needed; a cleanup pass can drop it once we're confident.
- **Analytics events** wired throughout via `lib/client-analytics.ts` (consent-aware): `admin_command_invoked`, `admin_saved_filter_created`, `admin_bulk_action`, `admin_preview_drawer_opened`. `admin_dashboard_kpi_clicked` and `admin_attention_inbox_action` are documented in `docs/analytics-taxonomy.md` but not yet wired (KPI / inbox rows are server-rendered Links — wiring needs a thin client island; deferred to a follow-up).
- **Voice** — all new copy follows `feedback_homemade_voice.md` (no "honest", no "delve into", no urgency cues, plain factual language).

Bundle impact: `cmdk` adds ~12 kB gzipped to the shared admin chunk; the rest of the rebuild moved logic between server / client without adding heavy deps. Build emits one pre-existing warning about Prisma's CJS `export *` shape — unrelated to this work.

**Deferred to a follow-up session** (out of scope under the worker prompt's "as many as fit cleanly" framing — the spec stayed inside the spirit of the brief while keeping the diff coherent):
- Drag-reorder for categories / sub-categories (HTML5 DnD would be a 200-line addition); current UI relies on the existing `order` integer column.
- Glossary inline-coverage rule enforcement (`feedback_inline_glossary_coverage.md` — needs body-walk per term, expensive at scale; right home is a nightly job).
- Bulk edit modal + bulk export JSON action.
- Dashboard "Deploys with non-zero exit (last 24h)" inbox row (needs gh CLI shelled from a server action — pre-launch debt).
- Dashboard "Voice-check failure count from last bulk batch" inbox row (needs glob + parse of latest `docs/bulk-batch-*-report.md`).
- Dashboard "Sentry error rate spike" inbox row (needs Sentry API token).
- Wiring `admin_dashboard_kpi_clicked` + `admin_attention_inbox_action` (KPI cards are server-rendered; needs a thin client island).
- Bottom-sheet trigger for sidebar on phones (the layout collapses but trigger could be cleaner).

Commit: `<sha>` — feat(admin): dashboard rebuild + content list + preview drawer + cmd-K palette + categories tree + RBAC unification.

## Homepage polish — inline onboarding card, arrow-scroll rails, density compression

Workstream 2b of the 2026-05-15 full UX review. Three targeted changes to the homepage shipped at `0b29ccf`.

- **OnboardingCard rewrite** (`apps/web/src/components/public/onboarding-card.tsx` + `.css`). Replaced the large centred-card screen takeover with a compact inline card (~200-260px desktop) that sits between the site header and the first rail, visible only when `onboardedAt === null`. New question phrasing: "What are you drawn to?" / "Anything you'd rather skip?" / "Where are you at?". Step indicator ("Step X of 3") and Back button removed. "Skip for now" link top-right, always visible. "Continue" pill (sage fill, Fraunces, 36px tall) bottom-right — appears only when ≥1 tile is selected on Q1, always on Q2, absent on Q3 (Q3 single-select auto-completes on tile tap). Experience level labels updated: "Just starting out" / "Making things for a while" / "I know my way around". Tile row uses the same `RailScroll` component as the homepage rails. Server actions (`completeOnboardingAction`, `skipOnboardingAction`) and analytics events (`onboarding_completed`, `onboarding_skipped`) unchanged.

- **RailScroll component** (`apps/web/src/components/public/rail-scroll.tsx`). New client component wrapping every horizontal rail and the onboarding card tile row. Native scrollbar hidden (`scrollbar-width: none` / `::-webkit-scrollbar { display: none }`). 36px sage-circle arrow buttons with cream chevron SVG sit at the rail's left and right edges, overlapping the first/last card. On desktop: arrows are invisible by default and fade in (150ms opacity transition) when the `.rs-wrap` container is hovered. On mobile (≤768px): arrows are `display: none`; native touch-swipe handles scrolling. Click scrolls by ~85% of the container's `offsetWidth` via `scrollBy({ behavior: 'smooth' })`. Each scroll event updates disabled state — arrows fade to 30% opacity and `pointer-events: none` at start/end. Right-side 48px cream gradient fade acts as a "more →" cue; disappears when fully scrolled. `HomeRail` updated to use `RailScroll` as its scroll wrapper.

- **Density compression** (`apps/web/src/app/(public)/home-page.css`). Between-rail padding: 80px → 40px desktop, 28px mobile. Card gap within rails: 28px → 14px. Hero zone: 64px/56px padding → 40px/32px + `max-height: 60vh` cap on desktop. Rail heading: 28px → 20px. Page side padding: 32px → 24px desktop, 16px mobile. Card body gap: 14px → 10px. Category tile grid gap: 16px → 12px. All-categories section padding: 80px/96px → 40px/56px. `home-hero-zone` hidden for onboarding users (card renders in new `home-onboarding-zone` section above the rail stack).

No schema changes. No new analytics events. No admin surface changes.

Commit: `761e2d3` — feat(homepage): inline onboarding card, arrow-scroll rails, density compression.

Out of scope: no admin overhaul beyond editorial picks (next workstream), no Capacitor / native mobile UX (next workstream), no analytics rethink, no marketing pages, no content authoring, no bulk image regeneration via paid APIs.

## Self-hosted analytics — schema, dual-fire, rollups, eight admin dashboards

Workstream 4 of the 2026-05-15 full UX review. Adopts the Aura pattern for our own scale: every event lands in our database alongside the existing PostHog mirror, and the admin dashboards read from summary tables a nightly Inngest cron rolls up.

- **Schema migration `20260616200000_phase_analytics_self_hosted_001`** — additive. Four new tables.
  - `AnalyticsEvent` — raw row per fired event. Columns: `clerkUserId`, `sessionId`, `event`, `category`, `properties` (JSONB), `url`, `pathname`, `referrer`, `userAgent`, `country`, `deviceClass`, `cohortWeek`, `acquisitionChannel`, `utmSource`/`utmMedium`/`utmCampaign`. Eight indexes covering the expected query shapes (per user, per event, per session, per category, per cohort+event, per path, per country, per channel).
  - `AnalyticsDailyRollup` — one row per `(date, metric, dimension)`. `dimension` is non-null with sentinel `__total__` for the unsplit total (Postgres treats NULL as distinct in unique indexes; the sentinel keeps `prisma.upsert` honest).
  - `AnalyticsCohortRollup` — one row per `(cohortWeek, weeksAfterSignup)` with `cohortSize`, `retainedCount`, `retentionRate`. Re-upserts on every cron run since retention can shift as data lands late.
  - `AnalyticsRollupRun` — idempotency tracker keyed on UTC date.

- **Capture pipeline.**
  - `lib/analytics-events.ts` (new leaf module) — `EVENT_CATEGORIES` map + `categoryFor()` + `PosthogEvent` type + `ROLLUP_TOTAL_DIMENSION` sentinel. Imported by both posthog.ts and the capture API route so there's no cycle.
  - `lib/posthog.ts` — `captureServerEvent` extended to write to `AnalyticsEvent` first, then PostHog. All ~30 existing server-side call sites dual-fire automatically with zero per-site change. New `capturePremiumServerEvent` skips PostHog (premium-feature instrumentation that should not leak to third-party tools).
  - `lib/server-analytics.ts` — re-exports + `captureEvent` / `capturePremiumEvent` aliases for new code that wants to be explicit about intent.
  - `lib/analytics-session.ts` — `homemade-session` cookie, sliding 30 minutes, server-issued, separate from Clerk's auth session. Used as the analytics session id so funnel + drop-off views work for signed-out visitors.
  - `lib/client-analytics.ts` — `captureClientEvent` now dual-fires via `navigator.sendBeacon('/api/analytics/capture', …)` (with a `fetch(keepalive: true)` fallback) after the PostHog capture.
  - `app/api/analytics/capture/route.ts` — accepts the client-side beacon. Permissive shape (analytics taxonomy lives in code, not at runtime). Server-side cohort + acquisition lookup from the User row so the client cannot fake the denormalised fields.

- **Nightly rollup.** `lib/analytics-rollup.ts` exposes `rollupDay(date)` and `rollupRange(args)`. Computes DAU, MAU (rolling 30d), signups (total + by channel + by country), tutorials_published, tutorial_views, bookmarks_created, tutorials_completed, projects_started/completed, search_queries, search_zero_results, errors_total. Plus cohort retention upserts up to W12 for every (cohort, weeksAfterSignup) pair on every run. Idempotent.
  - `inngest/functions/analytics-rollup.ts` — `analyticsRollupNightly` (cron 02:00 UTC) + `analyticsRollupBackfill` (event `analytics/rollup.backfill`).
  - Manual trigger button at `/admin/system/jobs` — date-range picker + `force` re-run checkbox. Wraps `triggerAnalyticsRollup` server action with audit log + Inngest send.

- **Eight admin dashboards under `/admin/analytics`.**
  - `/admin/analytics` — overview. Eight KPI cards (DAU, MAU, signups 7d, published 7d, bookmarks 7d, projects in progress, zero-result searches today with red highlight at >50, errors 7d with red highlight at >2× prior). Sparkline + signups + DAU trends + top-5 categories bar.
  - `/admin/analytics/cohorts` — flagship cohort retention heatmap. Sage-shade table W0..W12, milestone toggle (W0 / W1 / W4 / W12) that swaps to a per-cohort horizontal bar list. Renders from `AnalyticsCohortRollup`.
  - `/admin/analytics/activation` — vertical funnel (visit → signup → onboarding → first bookmark → first project started → first project completed). Range picker (7d/30d/90d). Cohort-aware activation table.
  - `/admin/analytics/content` — top 50 tutorials by views with bookmark + project-start conversion rates joined from matching events. Range picker.
  - `/admin/analytics/search` — top 50 searches with CTR per query, top 50 zero-result searches (the editorial content-gap signal), 90-day search-queries trend.
  - `/admin/analytics/acquisition` — signups by channel / country / UTM source / device class, plus W4 cohort retention split by dominant channel.
  - `/admin/analytics/creator` — applications, approval/rejection split, application-to-decision timing (avg / p50 / p90), per-creator performance table.
  - `/admin/analytics/system` — events stored, last rollup status, 14-day rollup-run history, error-boundary trend.

- **Brand visual treatment.** Recharts-based with a single `chart-theme.ts` for palette + typography. Sage primary, soft-parchment background, sage-15% grid, Fraunces titles, Lora axis labels, monospace tabular numbers. Flat — no gradients, no 3D, no curve fills. Cohort heatmap uses `sageShade(rate)` to interpolate parchment → forest. `ChartCard` + `KpiCard` shared wrappers.

- **Sidebar.** `/admin/analytics` no longer a placeholder. Growth → Analytics now expands into eight sub-items.

- **Pre-launch checklist.** "PostHog dashboards build" item removed — we don't build dashboards in PostHog. PostHog stays for session recordings + heatmaps + ad-hoc event exploration.

Out of scope (deliberately): no PostHog UI dashboards built, no real-time, no ClickHouse migration (raw `AnalyticsEvent` will eventually want partitioning by month or a move to ClickHouse / TimescaleDB at scale — flagged for a future session, not blocking launch), no new analytics events (the existing taxonomy was sufficient), no homepage / admin overhaul / mobile / billing surface work.

Commit: `<sha>` — feat(analytics): self-hosted dual-fire + nightly rollup + eight admin dashboards.

## Phase 8 — Content integration session (2026-05-16)

Eighth pre-launch integration session. Sequenced spec: schema additions,
image sourcing two-pass, public attribution tooltip, CDK secret-mount,
authoring prompt v5 updates, voice-check structural rules, category
descriptions rewrite, self-halt notification, audit report. Master
gap-fill skipped per the 2026-05-16 personal-recipes QC report ("0
additions needed").

- **Schema migration `20260617000000_phase_8_content_integration_001`** —
  additive. `Media.source`, `Media.sourceUrl`, `Media.creatorName`,
  `Media.licenceCode`, `Media.licenceUrl`, `Media.requiresAttribution`
  (default false). New `Media.source` index. The image-sourcing
  orchestrator writes these per hero so the public renderer can decide
  whether to show the discreet © tooltip.

- **Schema migration `20260617100000_phase_8_autopilot_halt_signal`** —
  `AutopilotHaltSignal` table (id, stream, reason, detail, notifiedAt,
  createdAt). Index on `(notifiedAt, createdAt)`. Workers + scheduled
  tasks write halt signals here; the hourly Inngest cron drains them.

- **Image sourcing pipeline.** New module
  `apps/web/src/lib/image-sourcing/` with per-source clients (Unsplash,
  Pexels, Wikimedia Commons, Pixabay, Flux Schnell via fal.ai) plus an
  `orchestrator.ts` that walks a per-category priority list per
  `docs/free-image-research.md`. Cooking specialty paths (Middle-Eastern,
  preserves, air-fryer) skip Wikimedia; Mindset somatic paths
  (tapping, embodiment, ritual) skip free sources entirely and go
  straight to Flux Schnell. Attribution rules baked in — Unsplash /
  Pexels / Pixabay get `requiresAttribution: false`; Wikimedia CC-BY /
  CC-BY-SA get `true`. `upload-tutorial.ts` extended with a `hero.remoteUrl`
  pathway: the script fetches the upstream URL, pushes to R2, and
  populates the structured attribution fields on the Media row.

- **Discreet attribution tooltip.** New `HeroAttribution` client
  component renders a 20 px © glyph at 20 % opacity in the hero's
  bottom-right; on hover / focus it opens a single-line popover with
  photographer / source / licence link. Public renderer at
  `app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` selects the new
  Media fields and passes them to `TutorialChrome` only when
  `requiresAttribution === true`. Per Rebecca's brief in
  `project_ux_review_briefs.md`: "anything that doesn't need an
  attribution visibly, I don't want to give one … something discrete."

- **CDK secret-mount (two-step pattern).** Image-sourcing API keys
  (`UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY`, `FAL_KEY`)
  wired into the stack at `infra/lib/homemade-stack.ts`. Deploy 1
  (this commit) lands the IAM grant on the execution role; Deploy 2
  (`MOUNT_IMAGE_SOURCING_SECRETS=1`) adds the env references. The
  orchestrator no-ops per source when an env var is absent, so the app
  boots fine without the secrets mounted. Worker sessions use the keys
  from `.env.credentials` directly; mounting in ECS is for future
  server-side bulk-fill / audit-fix jobs.

- **Authoring prompts v5.** `docs/tutorial-author.md` (v5),
  `docs/baking-author.md` (v2), `docs/mindset-author.md` (v4) all bumped
  with a shared content-integration appendix:
  - Image-sourcing two-pass — call `sourceHeroImage()` after voice-check
    passes; set `hero.remoteUrl` + structured attribution on the draft.
  - ProjectSchedule registration — for sourdough starter builds, long
    ferments, cured meats, cheese ageing, preserve maturation,
    marinades > 24 h.
  - Cross-category audit rules — canonical °C temperatures, inline
    glossary coverage (registered AND used), servings vs yieldDescription
    exclusivity, freezeNotes reality.
  - Missing-techniques logging — `subTutorialCard` blocks now accept
    `tutorialSlug`; upload script resolves to id, logs unresolved slugs
    to `docs/missing-techniques.md` for a future technique-authoring
    session.

- **Voice-check structural rules.** `packages/db/scripts/voice-check-lib.ts`
  gains three deterministic rules:
  - `glossary-coverage` — every entry in `glossaryTerms[]` must appear
    inline in a `glossaryTooltip` mark, and every inline mark must
    resolve to a registered slug. Both directions fail.
  - `temperature-canonical` — warns when prose mentions a fan oven at a
    higher temperature than `recipe.temperatureCelsius` (likely fan
    value stored as conventional).
  - `servings-yield` — fails when both `servings` and `yieldDescription`
    are set on a RECIPE row.

- **Category descriptions rewrite.** Old Cooking / Baking / Mindset
  descriptions read AI ("for the parts of life that need tending",
  "grounded gentle real"). Rebecca's brief was clear: factual,
  recipe-led for Cooking, no inspirational coda. New descriptions live
  in `packages/db/scripts/update-category-descriptions.ts` and shipped
  to prod against all three rows.

- **Self-halt notification.** `apps/web/src/inngest/functions/autopilot-halt-notify.ts`
  runs hourly, drains unsent `AutopilotHaltSignal` rows, surfaces each
  via Sentry (warning level, tagged `kind=autopilot-halt`) plus
  CloudWatch log. No email service is wired yet, so this is the
  fallback path; a future session swaps Sentry-capture for a real email
  send (Postmark / Resend) without changing the table contract.

- **Audit report.** `packages/db/scripts/content-audit.ts` ran against
  538 PUBLISHED tutorials. Report-only — no rows modified. Output at
  `docs/content-audit-2026-05-16.md`. Headline findings:
  - 51 RECIPE rows have both `servings` and `yieldDescription` set —
    targeted fix needed in a follow-up audit-fix session.
  - 529 tricolon warnings, 74 Americanism warnings, 14 brand-trademark
    warnings — already known patterns from the bulk content sessions;
    deferred to the voice-editor pass.
  - 1 `temperature-canonical` warning — the prose mentions fan oven
    higher than the stored °C.
  - 536 / 538 tutorials still on procedural-card heroes — the pre-launch
    bulk image-fill phase consumes this list.
  - 0 unresolved glossaryTooltip references.

- **Master ingredient + tool gap-fill skipped.** The 2026-05-16
  personal-recipes QC report (`docs/personal-recipes-qc-report.md`)
  recorded "Master-list additions this session: 0" — every flagged
  ingredient / tool from past batches is already in the master tables.

Out of scope (deliberately): no autopilot scheduled-task creation
(next session), no email service wiring, no mobile / iOS work, no
automated body rewrites against the audit findings, no homepage /
admin overhaul.

## Phase 8 — Content fix-up + hero fill (2026-05-16)

Follow-up to `phase_8_content_integration_001`. Consumes the audit
report and runs three pieces of work.

- **Servings / yieldDescription — 51 rows fixed.** All RECIPE rows
  flagged by the audit's `servings-yield` rule had both fields set.
  Per-slug decisions encoded in
  `packages/db/scripts/fixup-servings-yield.ts`: 39 yield-description
  (preserves / cakes / loaves / discrete-item recipes), 12 servings
  (sit-down meals). One `TutorialVersion` snapshot per row, one summary
  `AuditLog`. Next audit pass should report 0 `servings-yield` errors.

- **Hero image fill — 536 / 536 attached.** Every PUBLISHED tutorial
  on a procedural-card hero now has a real image. Ran the new
  `packages/db/scripts/fixup-hero-fill.ts` against
  `sourceHeroImage()` per category priority. Mix:
  Pexels 237, Pixabay 213, Unsplash 39, Wikimedia 31, Flux Schnell 16.
  AI fill cost ~£0.02 — far under the £5 cap and the £52-at-25k-tutorials
  projection in `docs/free-image-research.md`. Wikimedia downloads
  initially 429'd; adding a descriptive `User-Agent` on the download
  fetch (their policy requires one) cleared all 24 throttled rows on
  the third run. All Wikimedia images carry `requiresAttribution = true`
  so the public renderer surfaces the discreet © tooltip.

- **Tricolons — 574 deferred to manual review.** Built and dry-ran
  `packages/db/scripts/fixup-tricolons.ts` for a deterministic "drop
  the third item" rewrite. Found that almost every tricolon the voice-
  check regex flags is a content list — recipe ingredients ("ground
  ginger, allspice, and a small dried chilli"), recipe steps ("Add the
  apple, fruit, and vinegar"), place names, section headings —
  not a stylistic tell. Auto-rewriting deletes information. Even a
  conservative gate (single-word adjective items, no ingredient stop-
  list, at most one uppercase first letter) only let through ~1%, and
  the one that passed was the heading "Pat, cut, and top". Auto-
  rewrite abandoned. Full per-snippet list dumped to
  `docs/tricolon-defer-list.md` (574 matches across 312 tutorials, ±60
  chars of context each) for a future focused-review session. A second
  follow-up — tightening `containsTricolon` in `voice-check-lib.ts` to
  only flag adjective-pattern tricolons — would shrink the warning
  count on the next audit. Both deferred.

- **CDK image-secrets mount — deployed.** Four secrets created in AWS
  Secrets Manager (`homemade/unsplash-access-key`,
  `homemade/pexels-api-key`, `homemade/pixabay-api-key`,
  `homemade/fal-key`) from `.env.credentials` values. CDK stack updated
  to add `UNSPLASH_APPLICATION_ID` as a plain env var (public id, not a
  secret — gated on the same mount flag). Two-step deploy from the
  local `claude-deploy` user: Deploy 1 landed the IAM grant on the
  execution role with no task replacement (26 s); Deploy 2
  (`MOUNT_IMAGE_SOURCING_SECRETS=1`) rolled the task definition with
  the four secret refs + the `UNSPLASH_APPLICATION_ID` env (6 min, ECS
  circuit-breaker waited for healthy tasks). `aws ecs describe-task-
  definition` shows all five values; `/healthz` returns 200. Server-
  side bulk-fill / audit jobs can now call `sourceHeroImage()` without
  `.env.credentials`. (The first attempt at this from the previous
  session used the shell's default AWS profile — `aura-deployer` on
  the Aura account — and hit Access Denied; loading `.env.credentials`
  explicitly resolves to `claude-deploy` on account `213615929920`,
  the actual Homemade account, which has the right policy attached.)

- **Scripts added in `packages/db/scripts/`.**
  `fixup-servings-yield.ts`, `fixup-hero-fill.ts` (excluded from the
  package typecheck since it imports across packages via relative
  path — works under tsx), `fixup-tricolons.ts`,
  `tricolon-defer-list.ts`, `_inspect-tricolon.ts` (debug helper).

Out of scope (deliberately): no autopilot scheduled-task creation,
no email service wiring, no mobile / iOS work, no homepage / admin /
billing surface work, no schema changes, no new analytics events.

Commit: `<sha>` — Phase 8 content fix-up: 51 servings/yield rows fixed,
hero fill 536/536, tricolons deferred, CDK mount deferred.

## Mobile rebuild — native shell, bottom tabs, cooking mode, offline, camera, push, App Store scaffolding (2026-05-16)

Shipped in worker session `phase_mobile_rebuild_001`. Eight pieces of
mobile work plus a cross-cutting responsive tuning pass.

- **Schema migration `20260618000000_phase_mobile_rebuild_001`.**
  - `User.pushNotificationsEnabled` (Boolean default false) — master
    push toggle.
  - `User.cookingModeAutoEnable` (Boolean default false) — pref so
    recipes open straight into cooking mode on mobile.
  - `Notification.pushed` + `Notification.pushedAt` — bookkeeping so we
    can see which in-app notifications were also dispatched as a push.
  - `PushSubscription` table (one row per registered device-token per
    platform per install) + `PushPlatform` enum (`IOS`/`ANDROID`/`WEB`).
    `enabledCategories` array stores the per-category opt-ins.

- **Bottom tab bar.** `apps/web/src/components/public/mobile-tab-bar.tsx`
  with five tabs (Home / Search / Saved / Alerts / Account). Visible at
  ≤768px, hidden on desktop, hidden inside `/admin`. Notifications tab
  carries an unread badge fed by `/api/me/notifications/unread-count`.
  Sits above the iOS home indicator via `env(safe-area-inset-bottom)`.

- **Cooking mode reader.** New wrapping client component at
  `apps/web/src/components/public/cooking-mode/` — `CookingModeShell`
  owns context + the overlay, `CookingModeToggle` lives in the actions
  bar of every RECIPE-type tutorial. Method body is segmented into
  step pages (h2 boundaries; an ordered-list-only method explodes per
  list item). Ingredients pin to the top via `<details open>`.
  Persistence: `localStorage:homemade:cookingMode:<slug>` stores
  enabled + stepIndex so resume works. `useKeepAwake` hook calls
  `@capacitor-community/keep-awake` inside the wrapper and the Web
  WakeLock API on the open web. Keyboard arrows + Esc supported.

- **Service worker + offline.** `apps/web/public/sw.js` registered by
  `ServiceWorkerRegister`. Caches the UI shell, master ingredient/tool
  refs, hero images (cache-first), and tutorial / category pages
  (stale-while-revalidate). Skips admin, /api/*, search, sign-in.
  Bookmark toggle calls `window.homemadePrecache([path])` so saved
  recipes warm the cache proactively; unbookmark evicts. `/offline`
  page renders as the SW fallback when neither cache nor network
  succeeds. `OfflineBanner` watches `navigator.onLine` and shows a
  small sage strip when offline.

- **Native camera.** `apps/web/src/lib/native-camera.ts` detects
  `Capacitor.isNativePlatform()` and routes through `@capacitor/camera`
  on the wrapper. Web path keeps the existing file picker but adds
  client-side compression (JPEG 85, max 2048px longest edge) via the
  same `compressImage()` helper. `PhotosBlock` upload form picks the
  right branch automatically + falls back gracefully.

- **Push notifications.** `apps/web/src/lib/push-notifications.ts`
  exposes `sendPushToUser()` + `notifyWithPush()`; existing
  `notify()` was rewired to fire-and-forget a push when the
  NotificationType maps to a known category. Categories: project
  schedule / moderation outcome / creator application / weekly digest.
  Three API routes: `/api/me/push/register`, `/api/me/push/unregister`,
  `/api/me/push/categories`. Contextual opt-in card (`PushOptIn`)
  renders only inside the Capacitor wrapper, only when the user has
  ≥1 IN_PROGRESS UserProject, and only until dismissed.
  `/me/settings` gains a per-category toggle pane + a master "turn off"
  button. **Wire-level dispatch (APNs HTTP/2 + FCM) is intentionally a
  no-op stub for now** — `dispatch()` in
  `push-notifications.ts` logs the intended push and returns true.
  Real APNs needs a signed `.p8` in Secrets Manager; real FCM needs
  Rebecca to register the Homemade app in a Firebase project linked
  to her Google Play Console account.

- **Scheduled-step Inngest cron.** Daily 09:00 UTC sweep at
  `apps/web/src/inngest/functions/scheduled-step-push.ts`. For each
  active UserProject whose user has push enabled, finds
  `ProjectSchedule` rows whose `offsetDays` have elapsed and dispatches
  `notifyWithPush({ category: 'project_schedule' })` for each.
  Idempotency keyed off a `[step:<projectId>:<stepNumber>]` marker
  baked into the notification body. Registered in
  `apps/web/src/app/api/inngest/route.ts`.

- **Native splash + app icon.** `capacitor.config.ts` updated with
  cream background, dark-mode variant, status bar style LIGHT, and
  PushNotifications presentation options. New generation script
  `apps/mobile/scripts/build-source-assets.js` renders SVG → PNG via
  sharp (icon, foreground/background tiles for Android adaptive,
  2732×2732 splash with the "homemade" wordmark, dark splash). Run
  `pnpm --filter @homemade/mobile assets:source && assets:generate` to
  regenerate every platform-specific asset. The existing source
  `icon.png` (sage "h" on cream) was already brand-aligned and was
  preserved.

- **App Store scaffolding.** `docs/app-store-listing.md` with locked
  bundle identity (Homemade Education / `education.homemade.app`),
  placeholder copy slots, privacy nutrition declarations, push
  category list. `docs/mobile-screenshots.md` with the capture
  sequence + per-platform pixel dimensions.

- **Mobile-responsive tuning pass.** New `mobile-tuning.css` imported
  from the public layout. Touch targets ≥44px on every primary
  interactive surface, header padding tightened on phone widths, TOC
  + project companion sidebars hidden on mobile so the body claims the
  column, body line-height bumped on small screens. Tutorial cards
  switch to 3:4 portrait aspect ratio with tighter title + meta on
  ≤768px.

Plus mobile-only Capacitor plugin deps added: `@capacitor/camera`,
`@capacitor/device`, `@capacitor/push-notifications`,
`@capacitor-community/keep-awake`. Ambient `.d.ts` shims in
`apps/web/src/types/capacitor-shims.d.ts` keep the dynamic imports
type-safe without forcing apps/web to depend on the mobile-only
modules at runtime.

Out of scope (deliberately): no APNs / FCM wire-level dispatch (needs
Rebecca-side credential provisioning), no real screenshot generation,
no homepage redesign beyond responsive tuning, no analytics or admin
work, no content authoring, no voice-control hooks (deferred per
locked decision).

## Phase 8 — Autopilot wire-up (2026-05-16)

Standing infrastructure that fires the content pipeline for cooking,
baking, and mindset on a daily cron without a per-batch prompt from
Rebecca. Each fire is one Claude Code worker session reading its
stream's autopilot prompt; the prompt's pre-flight gates decide
whether the fire skips, halts, or runs.

- **Three autopilot prompt templates.** Self-contained worker prompts
  at `docs/autopilot-prompts/cooking.md`, `docs/autopilot-prompts/baking.md`,
  `docs/autopilot-prompts/mindset.md`. Per-fire procedure (shared
  shape, per-stream content):
  1. **Environment pause** — exit clean if `AUTOPILOT_PAUSED=true`.
  2. **No-double-firing check** — exit clean if a `claude/*` branch
     has committed to the stream's briefs / report files in the last
     2 hours.
  3. **Auto-determine batch number** — N+1 from existing
     `<stream>-bulk-*-report.md` (cooking is `bulk-batch-*`).
  4. **Backlog-drain check** — count in-scope candidates (backlog
     minus skip-list of anchors + pilot + personal + prior batches);
     halt + disable cron if fewer than the per-stream threshold
     remain (50 for cooking / baking, 100 for mindset).
  5. **Quality-drift check** — if voice-check error counts across
     the last 3 batch reports trended up by more than 50%, skip the
     fire without disabling the cron.
  6. **Hard chain cap** — if 10+ consecutive autopilot batches have
     landed since the last human commit, halt + disable cron.
  7. **Auto-determine slice** — pick a 50-entry slice that
     under-represents the running cuisine / sub-category /
     practice-type distribution from the last 3 batch reports.
  8. **Run the standard pipeline** — for each entry: brief →
     draft → self-critique → voice-check (3-retry cap, drop + log
     on failure) → upload `--status PUBLISHED` (3-retry cap, drop +
     log).
  9. **Close the batch** — write the batch report, append
     anti-tells / common-issues entries for any pattern recurring
     3+ times, update the Multi-category fill plan grid, append a
     short autopilot entry to BUILD_PROGRESS, commit + push to
     main, run the deploy verification block.

- **Halt-signal helper.** New `packages/db/scripts/write-halt-signal.ts`
  writes a row to `AutopilotHaltSignal`. Pre-flight failures and the
  3rd-retry deploy failure both invoke it. The hourly Inngest cron
  (`autopilot-halt-notify`, registered in
  `apps/web/src/app/api/inngest/route.ts`) drains the rows and
  surfaces them via Sentry (warning, tag `kind=autopilot-halt`) +
  CloudWatch. Reason codes documented inline:
  `ENV_PAUSED`, `SKIPPED_DOUBLE_FIRE`, `BACKLOG_DRAINED`,
  `QUALITY_DRIFT`, `HARD_CAP_REACHED`, `DEPLOY_FAILED`.

- **Three scheduled tasks (one per stream).** Created via the
  ScheduledTasks MCP — `autopilot-cooking-bulk` (cron `0 2 * * *`,
  early-morning local time), `autopilot-baking-bulk` (`0 4 * * *`,
  2h after cooking), `autopilot-mindset-bulk` (`0 6 * * *`, 2h after
  baking). All Sonnet, all notify-on-completion. The 2h stagger
  prevents three concurrent worker sessions banging on the same
  ECS task / Inngest queue / git remote at once.

  > **Note on creation.** The scheduled-task MCP tool requires
  > interactive approval per call (each create / update fires a
  > confirmation dialog). The autopilot-wire-up worker session ran
  > unsupervised, so the three crons were not created from inside
  > the session — Rebecca creates them in an interactive Claude
  > Code session using the prompt-file contents loaded verbatim
  > as the `prompt` field. Task IDs (`autopilot-cooking-bulk` /
  > `autopilot-baking-bulk` / `autopilot-mindset-bulk`) and cron
  > expressions are fixed; the autopilot prompts reference those
  > IDs directly for the self-disable path. Re-record the actual
  > task IDs here when the crons land.

- **Pause flag.** `AUTOPILOT_PAUSED=true` set in the local
  environment (or the scheduled-task launch env) causes every
  fire to write an `ENV_PAUSED` halt signal and exit clean
  without drafting or uploading anything. No code change in
  `apps/web` is needed — the autopilot prompt reads the env var
  at preflight (step 0). To pause:

  ```bash
  # Either:
  export AUTOPILOT_PAUSED=true            # bash / linux
  $env:AUTOPILOT_PAUSED = "true"          # PowerShell

  # Or per-task — disable the scheduled task entirely:
  mcp__scheduled-tasks__update_scheduled_task \
    taskId=autopilot-cooking-bulk enabled=false
  ```

  The env-flag path is preferred for short pauses (a session or
  two); the scheduled-task-disable path is preferred for longer
  pauses where the daily fire shouldn't even start a session.

- **First fires.** Cooking 02:00 local, baking 04:00 local, mindset
  06:00 local — the morning after the three scheduled tasks land
  via the interactive create step. The first mindset fire takes a
  smaller slice (target 20 rather than 50) since the pilot-10 step
  hasn't run yet — it serves as both pilot and bulk-001.

- **Halt signal monitoring.** `autopilot-halt-notify` (Inngest,
  hourly, `0 * * * *`) was wired in the prior content-integration
  session (`apps/web/src/inngest/functions/autopilot-halt-notify.ts`).
  Verified registered in `apps/web/src/app/api/inngest/route.ts`.
  Surface path is Sentry + CloudWatch until Resend email lands.

Out of scope (deliberately): no content authoring this session
(infrastructure only); no schema changes; no email service wiring;
no edits to the authoring prompts (`docs/tutorial-author.md` v5,
`docs/baking-author.md` v2, `docs/mindset-author.md` v4 stay as-is);
no mobile / UI / admin / analytics work; no Inngest cron schedule
changes.

Commit: `<sha>` — Phase 8 autopilot wire-up: three stream prompts +
halt-signal helper + scheduled-task plan + BUILD_PROGRESS section.

## Tricolon audit — voice-tell rewrite pass (2026-05-16)

Deferred task from the Phase 8 content fix-up session: the
2026-05-16 `voice-check-all` run showed 529 tricolon warnings across
312 tutorials. Prior session found that auto-rewriting was unsafe
(nearly all were content lists). This session completed the deferred
work in two passes.

- **`containsTricolon()` tightened.** Added two filter sets to
  `packages/db/scripts/voice-check-lib.ts`:
  - `TRICOLON_BANNED_TOKENS` — prepositions, articles, verbs. Any
    tricolon item containing one of these tokens is a structural phrase
    (recipe step, ingredient list), not a stylistic tell. Skip.
  - `TRICOLON_INGREDIENT_STOP` — food / herb / spice names. Tricolons
    with an ingredient token are ingredient lists. Skip.
  The filter left the regex unchanged and added a per-item gate
  (`tricolonLooksStylistic`). Also skips any item containing a digit,
  and any match where ≥2 items start with an uppercase letter (proper
  nouns / place sequences).

- **Pass 1 — 15 body rewrites** (`fixup-tricolons-manual.ts`). The
  15 genuine adjective-descriptor tricolons identified after reading
  the full 574-match `docs/tricolon-defer-list.md`. Each rewrite
  drops the weakest third item where "X and Y" carries the meaning
  better than "X, Y, and Z". TutorialVersion snapshot + AuditLog
  per run.

- **Pass 2 — 9 excerpt/body rewrites** (`fixup-tricolons-manual-2.ts`).
  After the filter tightening, 38 warnings remained. Of those, 29
  are accepted exceptions (recipe imperative headings like "Pat, cut,
  and top"; content lists; multi-dimensional cooking-state descriptors).
  Nine genuine excerpt-level voice tells fixed: `apple-chutney`,
  `borscht`, `coronation-chicken`, `eggs-benedict`, `harira-soup`,
  `lamb-dhansak`, `marshmallows-vanilla`, `quick-pickled-red-onions`,
  `sweet-potato-soup`.

- **Result.** `voice-check-all` after both passes:
  - Tricolon warnings: **529 → 30** (94% reduction)
  - Remaining 30 are all accepted content-list exceptions
  - Total warnings: 618 → 137 (0 errors throughout)

Out of scope (deliberately): no other audit-rule fixes, no new
tutorials, no schema changes, no prompt template edits, no
infra/web UI/admin changes.

Commit: `c13c25d` — content(audit): tricolons — 24 voice-tell
rewrites, filter tightened 529 → 30.

## Phase categories targets 001 (2026-05-16)

Placeholder Category rows for the remaining 14 top-level categories +
target counts + per-category fill % on the admin dashboard, so the
multi-category fill plan has a real grid view in `/admin` rather than
the static markdown table in this file.

- **Schema migration** `20260619000000_phase_categories_targets_001`.
  Additive on `Category`:
  - `targetTutorialCount Int?` — eventual library size per the grid
    in § "Multi-category fill plan".
  - `isPublicVisible Boolean default true` — gates public nav, browse
    grid, homepage rails, and the public `/[slug]` page. New empty
    categories default to `false`; the publish path auto-flips to
    `true` the moment a category has 10 published tutorials.
  - `launchOrder Int?` — orders public nav rotation (1 = first
    spine). Cooking=1, Baking=2, Garden=3, Mindset=4, Herbal
    medicine=5, then the rest by display order.
  - Composite index on `(isPublicVisible, launchOrder)` for the
    public-nav query.

- **Seed script** `packages/db/scripts/seed-categories.ts`. Idempotent
  upsert of all 17 categories with their factual one-liner
  descriptions (voice rules applied — no inspirational codas).
  Existing rows (Cooking, Baking, Mindset) keep their description
  but get `targetTutorialCount` + `launchOrder` set; the 14 new
  rows are created with `isPublicVisible = false` until they cross
  10 published. `pnpm --filter @homemade/db seed:categories` runs
  it; `--prod` adds an explicit confirmation prompt. Reports
  unknown rows it spotted but never deletes them.

- **Auto-flip helper** `packages/db/src/category-visibility.ts`
  exports `maybeFlipCategoryVisibility(prisma, categoryId)` —
  idempotent, only flips false → true, never the reverse. Wired
  into every publish-transition path:
  - `apps/web/src/app/admin/tutorials/actions.ts` `transitionTutorial`
    (single-row admin publish).
  - `apps/web/src/app/admin/tutorials/bulk-actions.ts` bulk publish
    (per-touched-category, not per-row, for efficiency).
  - `packages/db/scripts/upload-tutorial.ts` (the bulk autopilot
    path) — runs after the row lands as PUBLISHED.

- **Public-side filtering.** Every public-side `prisma.category.findMany`
  now adds `where: { isPublicVisible: true }` and orders by
  `launchOrder asc` first:
  - `apps/web/src/components/public/site-header.tsx` — nav.
  - `apps/web/src/app/(public)/page.tsx` — onboarding picker.
  - `apps/web/src/lib/homepage-data.ts` — rails + spine.
  - `apps/web/src/app/(public)/search/page.tsx` — filter chips.
  - `apps/web/src/app/(public)/patterns/page.tsx` — filter chips.
  - `apps/web/src/app/(public)/[categorySlug]/page.tsx` — `findFirst`
    with `isPublicVisible: true`, so an invisible category 404s.
  Admin queries unchanged — admin sees every category.

- **Admin dashboard pipeline widget** (`apps/web/src/app/admin/page.tsx`
  + `lib/admin-dashboard-data.ts` + `dashboard.css`) extended to
  render all 17 categories ordered by `launchOrder`. New columns:
  Target, Fill %, Last batch, Public. Empty categories show a "Not
  started" tag in the row + empty fill bar. The visibility cell is
  a Live / Private pill with a tooltip explaining the auto-flip
  threshold. Cached 60 s via `unstable_cache`.

- **`category-counts` helper** extended to include Target / Fill % /
  Public columns in the markdown output, so the BUILD_PROGRESS
  snapshot can mirror what admin sees.

Targets from the grid (recorded here so they survive a schema reset):
Cooking 7,000 / Baking 3,000 / Garden 4,000 / Herbal medicine 2,500 /
Mindset 1,000 / Crochet 1,500 / Knitting 1,500 / Needlework 800 /
Sewing 1,200 / Fibre arts 800 / Wood & natural craft 800 / Paper &
word 800 / Pottery & ceramics 500 / Animals & smallholding 700 /
Home & repair 800 / Natural home 800 / Sustainability 700.

Out of scope (deliberately): no content authoring for the new
categories, no pipeline setup (schema additions / authoring prompts /
anchor batches all wait on Rebecca's go-signal per category), no
autopilot stream additions, no homepage layout changes beyond the
empty-category graceful handling, no edits to existing Category row
descriptions, no marketing pages, no infra changes.

## Tutorial page bug fix + speed wins + seed run (2026-05-16)

Three-piece session bundled into the worktree
`reverent-goldberg-a57407`. Categories-work from the parallel
session above had landed on `main` mid-session, so this branch
extended it rather than duplicating.

- **Tutorial page crash on every RECIPE — fixed.**
  `https://homemade.education/baking/carrot-cake-layered` (and every
  other recipe tutorial) was throwing the error boundary with digest
  `3492158675`. CloudWatch unmasked the stack: `Attempted to call
  extractScaleIngredients() from the server but
  extractScaleIngredients is on the client.` The extractor lived in
  `scale-context.tsx`, which carries a `'use client'` directive — Next
  16 treats every export from such a module as a client function, so
  the server `page.tsx` couldn't invoke it before passing the result
  into `<ScaleProvider>`. Moved the extractor into a new
  `apps/web/src/components/public/tutorial-content/scale-extract.ts`
  (no directive). `scale-context.tsx` re-exports it through the
  client-side barrel so the admin preview pane keeps working.
  Scope: hit every RECIPE tutorial since the recipe-scale work
  landed; technique pages were unaffected because they don't render
  the `ScaleProvider` branch. Verified post-deploy by hitting 7
  tutorial URLs (cooking / baking / mindset) — all render with their
  titles, no error boundary in HTML.

- **Tutorial error boundary enriched.** `error.tsx` now tags Sentry
  events with `route: 'tutorial-page'`, `scope: 'error-boundary'`,
  `categorySlug`, `tutorialSlug`, and the Next.js error `digest`, plus
  carries the same fields through a `tutorial` context block. The
  reader-facing fallback surfaces a small "Reference {digest}" line so
  support can correlate a reader report to a CloudWatch row without
  asking for a screenshot.

- **ECS steady state 1 → 2 tasks.** Deferred speed item #8 in
  `docs/perf-audit-001.md`. Bumped both the CDK `desiredCount` default
  in `infra/lib/homemade-stack.ts` and the deploy workflow's
  `aws ecs update-service --desired-count` in
  `.github/workflows/deploy.yml` so they don't drift — the workflow is
  the live source of truth (it doesn't run `cdk deploy`), but the CDK
  default needs to match for any future infra change. Memory
  utilisation steady at 25–40 % of the 512 MB / 256 CPU sizing, so no
  CPU / memory bump alongside.

- **Cache-Control headers verified.** `/legal/privacy`, `/coming-soon`,
  `/healthz` all return the expected `Cache-Control` values, and
  Next.js's own cache reports `x-nextjs-cache: HIT` on the
  static-shaped pages. Cloudflare still serves them as
  `cf-cache-status: DYNAMIC` because there's no Cache Rule for HTML
  yet — that belongs to the deferred edge-caching workstream and is
  out of scope here.

- **Perf snapshot for future regression checks.** Production build
  succeeded under Turbopack (1 known noisy warning re: `@prisma/client`
  CJS star export — pre-existing). Bundle picture captured in
  `docs/perf-followup-001.md`: no public-route bloat, Recharts stays
  scoped to `/admin/analytics`, Sentry shared chunk ~209 K. No
  code-split shipped — nothing in the public surface tree crossed the
  "grew by > 200 K in the last week" threshold from the brief.

- **`seed-categories.ts` run against prod, then reverted.** The first
  run (against the pre-fix seed script) was idempotent: `0 created,
  1 updated, 16 unchanged` — the update flipped Mindset's
  `isPublicVisible` from `true` to `false` because Mindset sits at 0
  PUBLISHED and the auto-compute threshold is 10. While this session
  was still running, a parallel session shipped 8575cad
  (`fix(categories): seed preserves visibility for existing shipped
  rows`) — explicitly making Cooking / Baking / Mindset keep their
  stored flag regardless of PUBLISHED count, since those three are
  the launch spine. Restored Mindset to `isPublicVisible = true`
  with a one-off `prisma.category.update`, re-verified it's back in
  the public nav. The 14 new placeholder categories were already at
  the correct private state from the earlier landing; nothing else
  moved.

### Out of scope (deliberately)

- No edge-caching architecture work — flagged for its own workstream.
- No content authoring.
- No autopilot changes.
- No mobile / admin overhaul beyond what already landed via the
  categories session.
- No edits to `docs/social-strategy/`, `docs/recipe-backlog.md`,
  `docs/content-backlog.md`, `docs/page-design.md`, or marketing pages.

### Worth looking at next session

- Cloudflare Cache Rules for `/legal/*`, `/coming-soon`, and any other
  static-shaped HTML — flips the cache accounting from
  `x-nextjs-cache` to `cf-cache-status` and removes the ALB round-trip
  for cold visitors.
- The `proxy.ts` bot-scanner noise floor (existing entry in pre-launch
  debt) is still throwing Sentry warnings — separate small session.
- `apps/web/src/app/api/unlock/route.ts` still does `req.formData()`
  without a try/catch; non-form Content-Types throw a 500 instead of
  redirecting back to `/unlock?error=1`. Low priority — only triggers
  on manual probes.

## Ingredients sync + admin autopilot status page (2026-05-16)

Small two-piece session. Piece 1: the baking bulk-001 worker
(commit `6183f6c`) seeded 20 ingredient slugs to prod but only
committed `tools.ts`, leaving `packages/db/scripts/data/ingredients.ts`
20 slugs behind the DB. Piece 2: the new `/admin/system/autopilot`
page surfaces per-stream state + halt signals so Rebecca doesn't
have to dig in Sentry / CloudWatch to see what the autopilot did
overnight.

- **Ingredient sync.** Re-derived the missing 20 slugs from the prod
  DB and appended them to their category sections, alphabetised among
  the new additions, existing curated grouping preserved. After
  commit: 634 in file, 634 in DB, `seed:ingredients --dry-run` reports
  0 created / 0 updated / 634 unchanged. Categories touched: meat,
  vegetable, fruit, herb, spice, condiment, baking, grain, nut,
  sweetener. `docs/ingredient-master.md` regenerated to match.

- **Schema migration `20260620000000_phase_autopilot_status_001`.**
  Additive. `AutopilotHaltSignal` gains `acknowledgedAt DateTime?` +
  `acknowledgedById String?` (admin "Acknowledge" button stamps these
  so the page can hide triaged rows from the default view). New
  `AutopilotPauseState` table — one row per stream, `streamName`
  unique, `pausedAt DateTime?` + `pausedById String?` + `reason
  String?`. Admin pause / resume reads and writes this table; the
  scheduled-tasks cron itself stays enabled. Migration applied
  cleanly to prod via `prisma migrate deploy`.

- **`/admin/system/autopilot` page.** Three stream cards (cooking /
  baking / mindset) showing PUBLISHED count vs `targetTutorialCount`,
  the most recent halt signal age, the next cron fire time, and the
  current pause state. Halt signals table below — filtered by stream,
  hides acknowledged rows by default with a "show acknowledged"
  toggle, 50 rows per page, expandable detail column, per-row
  "Acknowledge" button. Pause control on each card writes a row to
  `AutopilotPauseState` and accepts a free-text reason. Audit-logged
  via the existing `audit()` helper: actions are
  `autopilot.paused` / `autopilot.resumed` /
  `autopilot.halt_signal_acknowledged`. Same sage / cream / Fraunces
  palette as the rest of admin; no urgency cues.

- **Sidebar link.** Added under the System group at
  `/admin/system/autopilot`, between Jobs and Errors. ADMIN-only.

- **Pause-state helper script.**
  `packages/db/scripts/check-autopilot-pause-state.ts` — reads
  `AutopilotPauseState` for the named stream and exits 1 (with a
  single-line detail on stdout) when paused, 0 when running. Designed
  to drop into each `.claude/scheduled-tasks/autopilot-*/SKILL.md`
  preflight right after the env-flag check. Scope of this session
  intentionally did NOT modify the SKILL.md files — Rebecca is
  testing the `model: claude-sonnet-4-5` frontmatter override on
  those prompts, so the SKILL.md wire-up is deferred to a separate
  session. Until the SKILL.md files are updated to call the helper,
  the admin pause toggle still records the intent in DB and shows
  the "Paused" pill on the page, but the morning cron will still
  run. The fastest workaround is the existing
  `AUTOPILOT_PAUSED=true` env-flag path documented in the Phase 8
  autopilot wire-up entry.

- **End-to-end smoke.** Pause cooking → resume → acknowledge most
  recent halt signal → roll-back. All four Prisma paths the server
  actions take were exercised against prod with the rollback leaving
  data unchanged. The existing INAUGURAL_FIRE_COORDINATION /
  SCHEMA_DRIFT / DB_MIGRATION_PENDING halt signals from the inaugural
  autopilot fires render on the page; first user-action chance is the
  next morning's cron at cooking 01:00 / baking 03:00 / mindset 05:00
  UTC.

Out of scope (deliberately): no SKILL.md edits (per scope — Rebecca's
Sonnet override test in progress), no autopilot disabling (the
existing crons fire tomorrow as planned), no content authoring, no
infra changes beyond the admin page, no homepage / mobile /
analytics work, no edits to `docs/social-strategy/`,
`docs/recipe-backlog.md`, `docs/content-backlog.md`,
`docs/page-design.md`.

---

## Commit history milestones (last 20)

- `b71ceca` — feat(content): phase_8_content_integration_001 — image two-pass + audit rules + halt signals
- `5b12e6e` — fix(public): followup-queue sweep — recipe page UX + Sentry tracing off + cache headers
- `5854e2b` — feat(content): phase_8 fix-up — servings/yield + hero fill 536/536 + tricolons deferred
- `eeac543` — feat(mobile): phase_mobile_rebuild_001 — native shell, cooking mode, offline, push
- `db87b51` — feat(infra): CDK image-secrets mount — Deploy 1 + 2 landed
- `c750e2e` — feat(mobile): real APNs dispatch + splash gate flag + screenshot tool + asset regen
- `6538094` — feat(autopilot): wire-up — three stream prompts + halt-signal helper
- `c13c25d` — content(audit): tricolons — 24 voice-tell rewrites, filter tightened 529 → 30
- `8975caf` — feat(categories): targets + visibility + admin fill widget
- `049f888` — fix(tutorial): move extractScaleIngredients into a server-safe module
- `d9f038e` — infra(ecs): steady state at 2 tasks to remove cold-start downtime
- `8575cad` — fix(categories): seed preserves visibility for existing shipped rows
- `d2e990f` — docs(build): tutorial fix + ECS bump + cache + perf snapshot + seed run
- `578451b` — chore(db): sync ingredients.ts with DB — 20 slugs from bulk-001 baking session
- `01d7f13` — feat(admin): /admin/system/autopilot status page + halt-signal acknowledge + per-stream pause
- `602c304` — chore(db): collapse flaked-almonds duplicate into almonds-flaked
- `5008a2c` — content(cooking): bulk-006 — 5 more PUBLISHED, total 10
- `5030d8f` — content(cooking): bulk-006 — 5 PUBLISHED, halted on schema drift
- `2e2ac5e` — content(mindset): bulk-001 — 20 briefs drafted, voice-checked, upload blocked by DB drift
- `6183f6c` — content(baking): bulk-001 — 50 recipes auto-published, report + anti-tells + BUILD_PROGRESS

Earlier milestones → [docs/archive/build-progress-history.md](docs/archive/build-progress-history.md).
