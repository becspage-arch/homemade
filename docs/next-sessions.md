# Next sessions — the content pipeline build queue

Twelve worker sessions queued up to unblock bulk recipe authoring. Each one corresponds to a step in the dependency chain in `memory/project_build_state.md`. They run in order; later ones depend on earlier ones.

For each session: scope, deliverable, scope-out, and the rough prompt I'd hand the worker. Rebecca reviews this file and edits any scope she wants tightened or expanded. I spawn the workers once she signs off.

---

## Session 1 — Page-design review and lock

**Scope.** Rebecca walks through the two existing tutorials in admin preview, lists what's missing or wrong. Worker session captures it as a locked page-design spec.

**Deliverable.** `docs/page-design.md` — the recipe page and the technique page, component by component. Header (title, hero, info bar with time / servings / difficulty / dietary tags / freezable badge / batchable badge). Body sections. Sidebar (saved recipes, sticky TOC, project companion). Footer (sources, related, made-by-others). Mobile rules. Print rules.

**Scope — out.** No code. No schema. Spec only.

**Worker prompt seed:** "You are designing the recipe + technique page for Homemade. Read `memory/project_content_pipeline.md`, `feedback_homemade_voice.md`, the two anchor tutorial bodies. Rebecca's notes from the preview review are in `docs/page-design-review-notes.md` [she pastes them here before spawn]. Produce `docs/page-design.md` covering every component, every field, every interaction, desktop + mobile. The page must support: ingredient scaling, freezable / batchable / make-ahead notes, dietary tags, prep / cook / total time, servings, cuisine and meal-type filters, save-for-later, the eight existing custom blocks, structured ingredients (not in admin yet — design for the shape spec'd in `docs/schema-changes.md`). Out: no code, no schema migration."

---

## Session 2 — Schema migration

**Scope.** Apply `docs/schema-changes.md` to the Prisma schema. Single migration. Idempotent on re-run.

**Deliverable.** `packages/db/prisma/migrations/<timestamp>_recipe_architecture/`. New tables (Ingredient, Tool, RecipeIngredient, RecipeTool). New fields on Tutorial. The `type` discriminator (TECHNIQUE | RECIPE) with existing rows defaulted appropriately. Migration runs cleanly on dev + prod (Neon).

**Scope — out.** No UI changes. No data seeding (that's session 4 + 5). No bulk re-categorisation of existing tutorials.

**Worker prompt seed:** "Apply the schema design in `docs/schema-changes.md` as a single Prisma migration. Use `pnpm --filter db run migrate:dev` against the local dev DB to author. Verify on Neon dev. Push, watch the deploy run, check `migrate:deploy` succeeds in CI. Out: UI changes, data seeding, ingredient/tool master content."

---

## Session 3 — Structured ingredients TipTap block

**Scope.** New `ingredientsList` TipTap block. Stores `{ ingredientId, amount, unit, prepNote }` rows plus a block-level `scalable` flag. Admin editor UI with type-ahead lookup against the Ingredient table. Public renderer + a scale selector (1× / 2× / 4× / custom).

**Deliverable.** Block extension in the admin editor, public renderer in `apps/web/src/components/public/tutorial-content/blocks/`, scale-selector client island.

**Scope — out.** Method-narrative scaling (the `{{flour}}` token substitution) — that lands in session 8.

**Worker prompt seed:** "Build the `ingredientsList` TipTap block per `docs/schema-changes.md`. Admin editor extension with type-ahead. Public renderer keeps the public bundle TipTap-free (walks JSON with plain React). Scale selector is a client island. Out: method-narrative scaling, marketplace links."

---

## Session 4 — Master ingredient list

**Scope.** Draft `docs/ingredient-master.md` (300–500 entries with slugs / units / dietary flags / common substitutes / UK-US notes). Seeder script `packages/db/scripts/seed-ingredients.ts` (idempotent upsert).

**Deliverable.** Doc + script. Database populated.

**Scope — out.** Tools (session 5). UI for browsing ingredients (later).

**Worker prompt seed:** "Draft `docs/ingredient-master.md` per `memory/project_content_pipeline.md` (master ingredient list section). 300–500 entries. Each one: slug, name, plural, defaultUnit, dietaryFlags, commonSubstitutes (other slugs), notes (UK-US naming). Then write `packages/db/scripts/seed-ingredients.ts` to upsert them. Run against dev DB. Out: tools, browsing UI."

---

## Session 5 — Master tools list

**Scope.** Same shape as session 4 but for tools / kit. `docs/tools-master.md` + `packages/db/scripts/seed-tools.ts`.

**Deliverable.** 150–250 entries. Seeded into the Tool table.

**Scope — out.** Marketplace links / prices (Phase 7).

**Worker prompt seed:** "Draft `docs/tools-master.md` and `packages/db/scripts/seed-tools.ts`. Same shape and idempotency as session 4. Out: prices, retailer links, anything marketplace."

---

## Session 6 — Recipe backlog

**Scope.** Draft `docs/recipe-backlog.md`. ~2,000 recipes organised by category (British, Italian, French, American, Mediterranean, Middle Eastern, North African, Caribbean, Eastern European, Indian-as-Anglo-Indian-only, baking, preserves, desserts, soups, salads, breakfasts, drinks). Heavy air-fryer + slow-cooker sections. Cross-cutting use-cases (Sunday roasts, weeknight, batch-cook, lunchbox, kids, Christmas, Friday pizza, curry night, comfort food). Deferred-until-v2 cuisines flagged at the end. Vegetarian / vegan as variants within parent dishes, not a standalone category.

**Deliverable.** The backlog doc.

**Scope — out.** Tutorial body writing. That's session 10+.

**Worker prompt seed:** [See full v2 brief in this session's history — keep that brief verbatim. ~2,000 launch target, fill by category, defer Korean/Vietnamese/Thai/modern Japanese/modern Indian beyond Beeton/modern Mexican-Latin-American.]

---

## Session 7 — Technique backlog prune

**Scope.** Cut `docs/content-backlog.md` from ~2,500 entries down to ~500–700 truly foundational techniques. Anything that's a recipe in disguise (Boeuf bourguignon, Lasagna, Sourdough loaves) gets moved to the recipe backlog (drafted in session 6).

**Deliverable.** Pruned `docs/content-backlog.md`. The cut entries listed in the commit body so we have an audit trail of what moved where.

**Scope — out.** Writing the technique bodies. Building the technique → recipe link UI.

**Worker prompt seed:** "Cut `docs/content-backlog.md` to ~500–700 foundational techniques. Foundational = standalone reference content a reader consults to learn HOW (knife skills, kit, basic methods, mother sauces, foundation breads, ingredient deep-dives, food safety). Anything that's a complete dish goes in the recipe backlog. Move don't delete: cross-reference each moved entry to `docs/recipe-backlog.md` in the commit message body."

---

## Session 8 — Body-authoring prompt rewrite

**Scope.** Rewrite the body-authoring prompt template in `docs/tutorial-author.md` for the recipe-first shape: structured ingredients referencing master rows, recipe metadata fields (servings, times, freezable, batchable, dietary, cuisine, mealType, mood), scaling-aware method narrative with `{{token}}` syntax for amounts.

**Deliverable.** Updated `docs/tutorial-author.md`.

**Scope — out.** Running the prompt (sessions 10+).

**Worker prompt seed:** "Rewrite the body-authoring section of `docs/tutorial-author.md`. Output shape is JSON matching the updated `TutorialUploadInput`. Bodies include `ingredientsList` blocks (structured rows), recipe metadata fields, freezer / batch / make-ahead notes, scaling tokens in the method narrative. Voice rules from `feedback_homemade_voice.md` are strict (incl. no medical advice, worldwide-friendly references, no prices). Out: running the prompt."

---

## Session 9 — Bot-as-editor + voice-check CLI

**Scope.** Two pieces. (a) A second-pass Claude that reads a draft, scores against Section 6b voice rules, rewrites flagged sentences. (b) `packages/db/scripts/voice-check.ts` — CLI grep tool that flags banned phrases / openers / em-dash count / negation patterns / medical advice / price mentions / UK-only references. Both run as part of the upload pipeline.

**Deliverable.** Two scripts. Upload pipeline calls voice-check before insert.

**Scope — out.** Style-rule tuning beyond the locked Section 6b rules.

**Worker prompt seed:** "Build the editorial second pass + the voice-check CLI. Both gate the upload pipeline. Voice-check fails the upload on a hit. Bot-editor is a Claude call against the draft; output is the cleaned draft + a diff. Out: anything not in Section 6b."

---

## Session 10 — Pilot batch of 10 recipes

**Scope.** Draft 10 recipes from `docs/recipe-backlog.md`, mix of cuisines and difficulty. Upload as DRAFT.

**Deliverable.** 10 Tutorial rows of type RECIPE.

**Scope — out.** Image generation (deferred).

**Worker prompt seed:** "Pick 10 recipes from `docs/recipe-backlog.md` spanning different cuisines (Italian × 2, British × 2, French × 1, American × 1, Indian-Anglo × 1, Mediterranean × 1, air fryer × 1, slow cooker × 1). Author each body using the prompt in `docs/tutorial-author.md`. Run each draft through the bot-editor + voice-check. Upload as DRAFT. Out: image generation (heroes attach later)."

---

## Session 11 — Refine prompt, pilot batch of 50

**Scope.** Rebecca reviews the 10. Findings feed prompt edits. Worker drafts 50 more.

**Deliverable.** 50 more Tutorial rows. Updated prompt template.

**Scope — out.** Bulk scaling.

---

## Session 12 — Bulk authoring at 100–200 per batch

**Scope.** Standing worker pattern. Each batch picks N from the backlog, drafts, voice-checks, uploads. Rebecca spot-checks ~5 per 100.

**Deliverable.** Recipes landing daily until the backlog is exhausted.

**Scope — out.** Image generation (deferred until pre-launch budget).
