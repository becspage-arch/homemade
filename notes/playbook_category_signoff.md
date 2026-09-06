---
name: category-sign-off-playbook-the-canonical-reusable-checklist
description: "The full operational playbook every category sign-off pass follows, step by step, plus the standing block, gotchas, and a per-category learnings log that grows as we do more categories. Built from cross-stitch + needlework. Use this to write each category's sign-off worker prompt and to spin up variations for new categories added later."
metadata: 
  node_type: memory
  type: project
  originSessionId: 3269da7d-3461-4b19-8fd5-c9b792997918
---

The reusable, growing checklist for taking a category through sign-off. The strategy/lock rationale lives in [[category-sign-off-flow-before-autopilot-resumes]]; THIS file is the operational how-to. When a new category appears (or a new one is invented), copy this, adapt Step 0, and write its worker prompt from it. Add every learning to the log at the bottom so each category gets easier.

## Session shape
One long-running Opus worker per category, drives all steps end to end, CHECKPOINTS with Rebecca after each step (concise plain-English hand-off, wait for her, then proceed). The worker does the technical work between checkpoints; Rebecca is the reviewer, not the orchestrator. One category at a time, never parallel-bulk before sign-off.

## Step 0 — Classify + frame
- **Pattern-led** (the library is the draw: cross-stitch, knitting, crochet, needlework, sewing) → built via the automated generation pipeline + a `categories.ts` registry entry. No manual upload tool; everything generated + vision-gated in-session.
- **Tutorial-led** (cooking, baking, garden, herbal, home-repair, etc.) → authored via the on-demand worker, held to the completeness checklist.
- **Hybrid** (needlework): counted/grid disciplines reuse the cross-stitch chart engine; free-form surface disciplines need a new line-art + stitch-guide engine. Decide the discipline scope first.
Confirm the classification + scope with Rebecca before anything else.

## Step 1 — Sample review + live product shakedown
- Rebecca reads 5-10 live rows of each content type (PATTERN, TECHNIQUE, STITCH, READING, etc.) and rates them.
- This doubles as a use-the-real-product pass (it's where cross-stitch surfaced bugs). Check, per the category's artifact: export (PDF/chart/template), the Studio view (symbol/template, pan/zoom/drag-to-pan/refit-on-resize), the "Start making" tracker not showing on non-project types, broken/placeholder rows, hero provenance.
- Propose any new themed sub-category taxonomy + re-confirm the target.

## Step 2 — Lock the look + hero approach (the big one)
- Lock the look against a CONCRETE reference before any bulk. Iterate samples to "spectacularly beautiful" BEFORE showing Rebecca (her standing instruction). Ask Rebecca for her reference photos here and wait.
- Get specific about the look (cross-stitch model: character pieces = a specific character in costume, props, funny human scenario, bold/saturated, detailed background, paint-by-numbers illustration; sayings = typographic poster with crisp modern type + small flat motifs + warm palette + witty line, NOT an old-fashioned sampler; coordinated 6-pack SETS are a top bestseller; cover the full theme spread including seasonal/holidays).
- Hero approach — the fork by category type:
  - **PATTERN crafts (cross-stitch pattern / crochet / knitting / needlework / sewing):** the loom renders the finished-piece hero truthfully from the exact stitch data. NO Fal, no generation, no img2img. Designer photo wins if present; never overwrite heroMediaId. (Pattern heroes that are truthful chart-engine renders are already accurate — leave them.)
  - **PHOTOGRAPHIC-SUBJECT heroes (cooking/baking and tutorial-led categories generally — food, gardens, remedies, repairs, plus pattern crafts' TUTORIAL heroes):** GENERATE-first with Flux 1.1 Pro v1.1 + a Claude vision gate, per [[project_photo_accuracy_solution]] (the SOLVED method 2026-06-23). Stock keyword-sourcing is REJECTED (it was ~76% wrong — a dam for gougères). Build the prompt from the row's title+subtitle+excerpt + editorial-food-photography suffix (no text/logo/watermark); vision-verify EVERY image (eyes are the gate); retry tighter on fail; nothing ships unverified. Edge cases (Rebecca's calls): un-renderable/obscure dishes → remove hero, text-only (never a wrong photo); reference/technique entries → generate the ingredient/subject not a plated dish. Needs Rebecca's per-category fal spend approval (~£0.031/hero + ~10% retries). Operational gotchas in that memory: cap concurrency at ~2 (14 crashed the machine), retry through fal billing-flap 403s, retry Neon connection drops. This supersedes the old "sourcing is good / never text2img" lines for photographic-subject heroes; the no-API-spend rule's Fal carve-out now covers generation (not just img2img).
- Persisted thumbnails: render the card image once (960x720) into the pattern's thumbnailMediaId in R2; never on-demand per request (Cloudflare returns DYNAMIC/uncached → slow grids).
- Persisted thumbnails: render the card image once (960x720) into the pattern's thumbnailMediaId in R2; never on-demand per request (Cloudflare returns DYNAMIC/uncached → slow grids).

## Step 3 — Source list confirmation
Written list of where new content comes from, Rebecca approves. Verified free sources: Met Open Access (CC0), Smithsonian, Art Institute Chicago, Cleveland, Wikimedia Commons, Biodiversity Heritage Library, Library of Congress WPA posters, Openclipart (CC0), Antique Pattern Library (huge for embroidery transfers + vintage DMC/Sajou/Weldon's). AI tier (Flux Schnell ~$0.003/img) only with Rebecca's per-category spend approval; prompts hyper-specific + "no text/letters/watermark", vision-gated, proof-first. Homemade-original (procedural) for the rest. Licence rule: verify PD/CC0/CC-BY first, attribute correctly, never republish a source as-is. Shopify-JSON trick (/products/{handle}.json) to see a reference site's images.

## Step 4 — Teaching coverage confirmation
Confirm teaching tutorials are substantial enough to support the patterns. Note the type mix deliberately (cross-stitch ended 80 published but all TECHNIQUE-type, no STITCH/READING foundation — decide on purpose, not by accident). For stitch-heavy crafts (embroidery), a STITCH library WITH diagrams is a prerequisite, not optional — wire it to the crochet SVG-diagram approach.

## Step 5 — Homemade-original direction
Author every Homemade-original from the shared cross-craft design-direction system (`packages/db/prisma/design-direction.ts`, see [[project_cross_craft_design_direction]]) — do NOT invent a per-category aesthetic. Read CRAFT_PROFILES[craft]; use `looksFor(craft)` + `territoriesFor(craft, 'core')`. Build each brief as Territory × Look × Item-type × Palette × size/difficulty + a specific hook (evergreen-core territories first; variety enforced across difficulty + size). Originals-only per IP_GUARDRAIL (no franchise/celebrity IP; heritage = reference-and-redraw, attributed). Every design passes all four QUALITY_BAR checks. The axes map to the controlled vocab, so designs are born-tagged. New looks/territories/palettes = a controlled change to that one file, routed through the orchestrator (any style/subject/occasion slug must already exist in collection-vocabulary.ts).

## Step 6 — Bulk sample + the vision gate
Generate ~10 in the locked shape; iterate to spectacular before showing Rebecca. **The Claude vision gate is mandatory + non-negotiable: LOOK at every render; never assert quality from source type or an unseen file** (the cardinal rule — Rebecca caught assert-without-looking twice). Failure modes to catch: off-centre captions, malformed letters (holes in A/P/6/8/9), subject ambiguity, bad vertical centring, all-identical posters (palette/border/layout/font must vary), muddy oil-painting conversions, wrong crops; for embroidery add unclosed outlines, regions too small to stitch, missing/mismatched stitch legend, illegible-at-scale, heroes that aren't achievable embroidery.

## The generation engine (pattern-led)
**Three-layer boundary (every pattern/project category, see [[project_loom_render_engine]]):** the brief is shared (design-direction.ts); GENERATION (brief → structured stitch/plan data) is THIS category's to build; the loom is RENDER-ONLY (it draws the finished piece/template/legend from the structured data, never invents designs). Your category owns its generators and feeds the loom via the structured-data contract — don't expect the loom to generate designs, and don't build your own render stack. Holds for non-fibre too (woodwork plans, etc.).
- Cross-stitch / counted: photos/art → photoToPatternData (Wu quantise + nearest-floss + confetti-min). Preprocess: flatten white → trim → normalise → modulate saturation 1.25-1.5; crop text bands; tune size + colour count per subject (rich AI scenes ~160 cells/28-34 colours, simple subjects ~80-120/10-20). Text + flat art never go through the quantiser (averages → malformed letters) — use the crisp path: render SVG high-density → sharp resize kernel:'nearest' → snap each cell to the palette → background left as bare fabric. Tiers (spec.ts): scene, illustration (subject + reserved caption band), botanical (frame/wreath + centred crisp quote), procedural retro/celestial/sampler/typo/mixed/minimal. AI never draws the words.
- Free-form embroidery (new engine): line/contour extraction → clean closed-path outline (the transferable design); region segmentation → stitch type + thread colour + strand count per region; stitch legend generator + optional stitch-direction overlay; to-scale 1:1 template PDF, tiled for large designs (DejaVu via fontkit + font-dejavu in the container for non-WinAnsi glyphs).
- Sourcing reality: flat/bold/clean-background sources convert well; muted oils + busy/low-contrast photos turn to grey mush. Market data: simpler palettes, small/quick projects (~40% of sellers), partial-coverage on clean background (~77%).

## The three QC gates (+ voice)
1. Structural — pattern body/chart/template, stitch key, materials, finished cm, designer attribution.
2. Vision gate — the heart (above).
3. Licence/attribution — verified source + correct credit (Homemade-original for AI/procedural).
Plus voice on descriptions: no em/en dashes, no banned phrases; category/sub-category descriptions are a list of what's inside, nothing else.

**Hero VARIETY + register check (tutorial-led categories — added 2026-06-22).** Beyond accuracy: heroes across a category must not be near-identical to each other, and must not be over-LITERAL in a way that reads off-brand. Real example (mindset): a literal "tapping" photo on every tapping practice, or a sign reading "stress" on every stress entry — too on-the-nose, repetitive, not the Homemade register. At sign-off, REVIEW the category's heroes as a set (vision): flag near-duplicates and over-literal/sign-y heroes, and resolve them (vary the imagery, choose something evocative rather than a literal label). Applies to mindset and every other tutorial-led category that uses sourced/generated heroes.

**Hero/photo ACCURACY gate (hard — we've missed this many times).** Especially for sourced-photo categories (cooking, baking, and any future tutorial-led category that uses sourced rather than rendered heroes): the hero must depict THIS specific recipe/pattern, not a generic or guessed photo (e.g. a generic "soup" stock photo on a specific named soup, or the wrong bake entirely). LOOK at every hero with Claude vision; a wrong/mismatched/low-quality photo is a HARD fail. Re-source an accurate image; if none can be sourced, pull the hero and hold the row at DRAFT with a qcBlockReason — never ship a wrong photo. Missing hero = hold. Binary, no warning tier, AI-only. Pattern-led categories whose hero is a truthful chart/template render pass this automatically; sourced-photo categories do not get a pass.

## Category-page check (every category sign-off)
Don't only check the content rows — check the category itself: (a) the category landing page renders correctly (grid, sub-category shelves, no broken/empty states); (b) the category hero/image is accurate to the craft and on-brand (LOOK at it, vision gate applies here too); (c) the category description follows the description-voice rule (a list of what's inside, nothing else — no identity, provenance, disclaimers, or editorial scoping; no em-dash; no banned phrases). Same for each sub-category description. Fix anything off before COMPLETE.

## Close-out (autopilot is retired — no "flip on")
- A. Productionize — pattern-led: add a `categories.ts` registry entry (pattern type, target, sub-categories, tier guide); shared engines do the rest. Tutorial-led: the authoring prompt.
- B. (Optional) Spawn fill-workers to target — reusable fill template; vision-gate + publish in one go.
- **Premium gate step (every category)** — (a) build the agreed-missing premium features for this category per [[project_premium_free_spec]]; (b) wire the gating on the GLOBAL framework (do not reinvent). Framework in `apps/web/src/lib/entitlements.ts`: `hasPremium(user)` (user entitlement) + the REUSABLE CONTENT GATE `isPremiumContent(content)` / `isIndependentDesignerContent(content)` / `canAccessPremiumContent(user, content)`. The one cross-craft rule: content is premium if its premium flag is set OR it's independent-designer/creator content (a designer where `isHouseDesigner === false` — the library that funds the designer revenue share). Pattern crafts pass `{ premium, designer }`; tutorial categories pass `{ premium }`. Printing/downloading is a UNIVERSAL premium action gated on `hasPremium` directly, NOT via the content gate. Components in `apps/web/src/components/premium/` (PremiumGate, PreviewGate, PremiumBadge, StudioAuthGate, UpgradeBlock, PremiumDownloadButton). Do NOT flip the shared `STUDIO_PREMIUM_GATING_ENABLED` flag (sewing-only). Studio behind a free login; premium items show preview + PremiumBadge via `isPremiumContent`; create-your-own + designer patterns premium. Stripe wiring is Session F, not here.
- C. Drain the category's QC BLOCK backlog — `qc-fix --category <slug>`, only AFTER criteria are locked (pre-sign-off fixes are throwaway).
- **Step E — final vision QC sweep over the WHOLE finished category** (after fill, before COMPLETE). The old qc-fix only judges text; this LOOKS at every published item's thumbnail/hero/template/legend, catches the visual failure modes, fix-or-pulls each (regenerate or DRAFT/UNLISTED, never leave broken live, AI-only), writes a reviewed/flagged/fixed/pulled report, then checkpoints with Rebecca on the summary + a sample. Only after her review → COMPLETE.
- D. Mark COMPLETE at target. No cron. Growth = on-demand fill template; progress shows on the Content library admin page.
- **F. GO PUBLIC (the launch gate for this category) — flip `isPublicVisible=true` so it's seen + indexed.** Do this once the category has its initial Homemade seed tutorials + patterns AND everything below is true (it does NOT need to be at full target — it can keep filling on-demand after going public). Required before flipping visible:
  1. Initial Homemade seed content published to the makeable bar (complete structured data, no shells).
  2. Truthful heroes done (loom render for pattern crafts / generate-first Flux + vision gate for photographic-subject categories) and Step E vision QC passed.
  3. Premium-gate step done; UN-HIDE this category's now-live rows in the /premium feature-availability config (and confirm nothing un-built is promised).
  4. Cross-craft tagging complete (theme/style search lights up for the category); item-type shelves laid; audience tags where they apply.
  5. Category page + category image + descriptions checked (on-brand, voice rule, no near-dup/over-literal heroes).
  6. Sources/licence clean; search wired (tutorials + the Pattern library both queryable/indexed).
  Then: set `isPublicVisible=true`, refresh the sitemap (auto from the visible set) + the search index, and verify the category shows in nav/browse/search and renders. Deploy green + /healthz 200. The category is now live and crawlable; keep filling to target on-demand.

## Per-publish invariants + gotchas
- Assign a sub-category on EVERY publish — NULL never appears in the grid (PatternLayout filters subCategory.categoryId).
- Persist the thumbnail; NEVER touch heroMediaId (the finished-piece photo slot).
- Attribute to the Homemade house designer (cmqkjybwo0000ncv4bcjgwgtm).
- Targets live in `categories.ts`, not a DB field (pattern-led).
- Search: the /search index is tutorial-only, so the page must ALSO query the Pattern library directly. (Same reason the /admin dashboard undercounts patterns — count Pattern by visibility=PUBLIC via subCategory, not just Tutorial.)
- Descriptions sanitised (no em-dash, no banned phrases).
- Final cleanup: 0 UNLISTED / 0 PRIVATE / 0 null-subcategory / 0 chartless-DRAFT skeleton; every public pattern carries a thumbnail or hero.

## STANDING BLOCK — paste verbatim into every category sign-off prompt AND every fill-worker prompt
> Original designs (mandatory). Author every Homemade-original from the shared design-direction system (`packages/db/prisma/design-direction.ts`): read CRAFT_PROFILES[craft]; build each brief as Territory × Look × Item-type × Palette × size/difficulty + a specific hook; evergreen-core territories first; originals-only per IP_GUARDRAIL (no franchise/celebrity IP; heritage = reference-and-redraw); pass all four QUALITY_BAR checks. This born-tags the piece (slugs map to collection-vocabulary.ts). New looks/territories/palettes = a controlled change to that one file, routed through the orchestrator.
> Cross-craft tagging (mandatory). Tag every piece of content you publish (tutorial or pattern) against the shared collection vocabulary on all four axes where they apply: Occasion, Season, Style, Subject. Born-tag at generation time. Pick only from the existing vocabulary in `packages/db/prisma/collection-vocabulary.ts`; never invent a term inline. A genuinely missing term is proposed as an edit to that file. Tagging is part of the publish path, alongside the completeness gate.
> Sub-category model. Every published pattern gets exactly one SubCategory (its home shelf — NULL never shows in the grid). Cross-craft tags are the discovery dimension (many per item). Where a home shelf is itself a theme, its matching cross-craft tag auto-derives so they can't drift.
> Variety (enforced). Each authoring batch spreads across difficulty (beginner→advanced, plus the showpiece tier) and size (small/medium/large), not clustered at one end.
> Premium gating. Build on the global framework in `apps/web/src/lib/entitlements.ts` — `hasPremium(user)` for the user, and the reusable content gate `isPremiumContent`/`canAccessPremiumContent` for content (premium = its flag is set OR it's independent-designer/creator content, i.e. designer `isHouseDesigner === false`). Studio behind a free login; printing/downloading any template/PDF is a universal premium action gated on `hasPremium` directly; premium items show preview + PremiumBadge via `isPremiumContent`; create-your-own + designer patterns premium. No reinventing the framework, no Stripe wiring here.
> Hero/photo accuracy (hard gate). Every hero you publish must depict THIS specific item, not a generic/guessed photo. LOOK at it; a wrong or mismatched photo is a hard fail — re-source an accurate image or hold the row at DRAFT, never ship a wrong photo. Truthful chart/template renders pass automatically; sourced photos do not.
> Vision QC at close-out (Step E). Before COMPLETE, vision-sweep every published item's thumbnail/hero/template; fix-or-pull each flag; structured report; checkpoint with Rebecca.

## Stale-local-main gotcha (every code worker) — added 2026-06-21
The local `main` is often stale/divergent from `origin/main` (it has bitten the admin-dashboard and planner workers). FIRST STEP for any code worker: `git fetch origin` and branch from / rebase onto `origin/main`, not local main, so you build against the live framework (e.g. the premium entitlement framework, the retired-autopilot Content-library page, the PATTERN_CATEGORIES registry) and not an old version. Put this near the top of every code-worker prompt.

## Cross-craft tagging — FULL operational block (canonical; paste verbatim into every category sign-off AND every content generation/fill worker; supersedes the one-line version in the standing block above). From the needlework session that built the system, 2026-06-21.

> WHY: every piece of content (recipe, tutorial, any-craft pattern) must be tagged on the shared cross-craft axes so theme/style search + the /themes pages work site-wide. A category isn't "done" until its content is tagged.
> THE CONTROLLED VOCABULARY (never invent terms): single source of truth `packages/db/prisma/collection-vocabulary.ts` — 61 terms across four axes: OCCASION (christmas, halloween, easter, valentines, diwali, weddings, new-baby...), SEASON (spring/summer/autumn/winter/year-round), STYLE (whimsical, cute, bright-bold, pastel, vintage, cottagecore, modern, boho, scandi, gothic, elegant, geometric), SUBJECT (florals, animals, birds, fantasy-creatures, celestial, landscapes, coastal, food-drink, lettering, people, home-cosy, samplers). Each term has a `taggerGuidance` field — that is the rubric, read it. Pick ONLY existing slugs/aliases. A genuinely missing term is added by editing collection-vocabulary.ts + re-seeding (`pnpm --filter @homemade/db exec tsx scripts/seed-collection-vocabulary.ts`), a deliberate deduped change routed through the orchestrator, NEVER minted inline.
> THE SERVICE (from @homemade/db — use it, never write the join table by hand): `setContentTags(ref, slugs, source)` (replaces all tags), `addContentTags(ref, slugs, source)` (adds without removing), `resolveTags(slugs) -> {matched, unknown}`, `deriveShelfTagSlug(subCategorySlug)` (themed sub-cat -> its matching tag). `ref = { type, id }`, type is a TaggableType: TUTORIAL · CROSS_STITCH_PATTERN · CROCHET_PATTERN · NEEDLEWORK_PATTERN · KNITTING_PATTERN · SEWING_PATTERN. source: AUTHORED (born-tagged at generation, most reliable) · DERIVED (from the home-shelf sub-category) · BACKFILL/VISION (retro-tagging) · MANUAL. CONTROLLED-VOCAB CHECK: setContentTags returns `unknown` for anything not in the vocabulary; that array must ALWAYS be empty — if not, you invented a term, fix the inputs, don't create the term.
> WHEN TO TAG: (1) AT GENERATION (born-tag) for every new item — the generator knows the subject, occasion/season and style it aimed for, so call setContentTags(ref, [slugs], 'AUTHORED') right after creating the row, as part of the publish path (alongside the completeness gate); also deriveShelfTagSlug(subCategorySlug) + addContentTags(..., 'DERIVED') so shelf + tag can't drift. (2) IN A SIGN-OFF PASS (coverage check) before COMPLETE: confirm every published item in the category has tags (SELECT items where NOT EXISTS a CollectionTagAssignment for that contentType+id); tag any missing.
> HOW TO JUDGE (precision over recall — empty beats wrong): OCCASION/SEASON/SUBJECT from TEXT (title, description, sub-category, body) — christmas pudding = christmas+winter+food-drink; plain roast chicken = none; use parents (santa implies christmas). STYLE is VISUAL — you MUST LOOK at the hero image to judge whimsical/pastel/bright-bold/vintage/cottagecore/gothic etc., never infer style from text (build the image URL from heroCloudflareId/heroR2Key via the repo image-URL helper and Read it). Cardinality: SUBJECT + STYLE can be multiple; OCCASION + SEASON usually 0-1 each.
> AFTER TAGGING: refresh search so tags reach Typesense — `pnpm --filter @homemade/db run search:backfill` (full reindex ~30s) or the per-id sync; then verify cross-craft search returns the items (searchCrossCraft with the axis filter).
> HARD LINES: TAGS-ONLY in a coverage/backfill pass (never edit content, status, or heroMediaId); never mint vocabulary terms inline (route additions through collection-vocabulary.ts); don't rebuild the tagging service, vocabulary, or search layer — they exist.

## DB-infra gotcha (any worker doing DB/migration work)
The per-session git worktree has NO node_modules — run Prisma/DB tooling from the MAIN checkout. Shadow-DB migration authoring is blocked by an old migration's replay error, so HAND-AUTHOR the migration SQL and run `prisma migrate deploy` (not `migrate dev`). Load `DATABASE_URL` from `.env.credentials` directly (don't shell-source — the `&` breaks it); use a NON-pooled Neon URL (strip `-pooler`) for migrate commands.

## Bulk orchestration (filling to target)
Max 4 Sonnet workers concurrent (Rebecca's machine cap); orchestrator tops the pool back to 4 on each completion; unique slug prefixes per worker. Sonnet for bulk generation/authoring; Opus for orchestrator + vision-gate judgement + anchor batches. Weight thin sub-categories over heavy ones; keep subjects fresh (duplication risk rises near target).

## Steps added from the crochet + knitting run (September 2026). These sit BEFORE Step 1 and AFTER Step 6 as marked; a category is not at sign-off until every one is done.

### Step 0a — Audit what exists (before touching anything)
- Inventory the category as it stands: rows by type and status, shelves and their counts, heroes and their provenance, the engines and scripts that already serve it, open branches touching it, Sentry errors and Search Console issues for its pages.
- Prove access first (DB, AWS, site, GitHub, R2, Typesense, Sentry, GSC, Fargate) and record what each session can and cannot reach. Never re-derive a recorded fact.
- Read the other orchestrator's "In flight" block in BUILD_PROGRESS.md before starting; add your own on your first train.

### Step 0b — Fix, then cull
- Fix what is fixable at the standard (voice, completeness, hero accuracy, duplicates).
- Anything that cannot reach the standard is culled: set PRIVATE with the reason on qcBlockReason, reversible, never deleted. Duplicates: cluster by fingerprint, keep the best, cull the rest.
- Binary, AI-only, no warning tier. Report counts (fixed / culled / left) to Rebecca.

### Step 0c — World-class audit, then targets
- Before setting or trusting a target, compare the category to the best in the world: library sizes, shelf mix, what sells and ranks, what people search for, pricing models, and what each does that we do not. Name sources.
- From that, set the total and the per-shelf targets in categories.ts, justified in one line each. Flag shelves whose demand needs engine work we do not have, so the engine roadmap follows demand.
- Bring the comparison and the proposed targets to Rebecca in chat before any fill starts. Community features are out: one-way contributions only (maker photos, error reports, feature suggestions, all AI-screened), no forums, groups or comment threads.

### Step 0d — Reuse the systems that exist (a checklist, not a preference)
Map the category onto the shared systems before building anything. Every row must say "reuses" or "needs building", and building needs a reason:
- Design brief system (design-direction.ts) and cross-craft tagging.
- Generation: the bulk run framework (studio/generation/bulk/run.ts), planner, dedupe guard, spend guard, BulkRun rows, the admin craft card.
- Render: the loom engine, the Fargate render task, the Fal finish with the fidelity gate, R2 upload, Media rows, render-on-publish (idempotent by geometry hash).
- Gates: the craft's completeness gate in packages/db, the vision rubric, size consistency.
- Product: the Studio "design your own" (photo, designer, describe-an-idea), the premium framework, the follow-along mode, the maker-photo path, errata.
- Ops: the go-live switch (LAUNCH_VISIBLE_CATEGORY_SLUGS in enforce-launch-visibility.ts), search reindex, sitemap, admin Members activity.

### Step 2a — Lock the bar by render beside reference (pattern crafts)
- The bar has four parts and all four must hold on the same image: the stitches are genuinely stitched (the geometry is real, not painted); real yarn or thread colour on a clean white ground; the whole piece at its real size (a coaster looks 10 cm, a headband looks 45 cm); staged as the finished object (folded, in a hoop, standing).
- References are Etsy-quality hero photos of the same kind of item, downloaded and kept. Pairs are labelled OURS and REAL PHOTO. Judge the final served image, never the intermediate render. Measure what can be measured (corner luminance for the ground, size gate ±12%, the numeric stitch audit) and look at the rest yourself.
- Work in numbered look-pass rounds; each round logs what did not work in the engine handbook's failure log (§9) so no round repeats a dead end. Two failed attempts at one approach means change approach.
- Only heroes the orchestrator has personally looked at are shown to Rebecca, and only the passing ones. Her critiques (pose, softness, scale) reopen the round.

### Step 2b — Prove the real path end to end before any bulk
Stored row → the exact program → Fargate render → Fal finish and fidelity gate → R2 → Media row → hero attached → a second run is a no-op (idempotent). Prove it on private sign-off rows with real slugs, not on scratch files. The category's bulk path must be this path, not a parallel one.

### Step 6a — The idea backlog (before fill)
- Fill is systematic, not invented per batch. Build a curated, deduplicated backlog as data in the repo: one entry per idea with shelf, title, subject or motif, colourway, treatment, size, difficulty, the search phrase it answers and a dedupe key, checked against everything already in the database. Sequence it so working in order gives a balanced catalogue early.
- Only shelves the engine can render today get named ideas; the rest get themes, so the backlog grows with the engine.

### Step 6b — Cost to fill, then a budget, then the switch
- Before any autopilot is switched on: estimate the deterministic cost per pattern (Fargate task-minutes at the region rate, Fal per hero, retries from the audit and fidelity limits) and the total to fill the category to target. Rates live as named constants in the code with their source, so Rebecca can correct them.
- Rebecca sets the budget. Spend caps are enforced in code (daily and per run) and the run refuses to start a render that would cross them.

### Step 6c — How every autopilot runs (Rebecca, 6 September 2026)
- All model work (planning briefs, authoring, judging images) runs on her Claude Max plan in cloud sessions and routines. Deterministic stages (expand, audit, render, gates, publish) run on the server or as scripts. Never on her laptop. Never through per-token Anthropic API calls; the one agreed exception is the maker-photo check when a customer uploads a photo.
- The shape is the routine prompt in docs/autopilot-prompts/<category>.md: pre-flight gates, batch size, the session plans and authors from the backlog, scripts expand and render, the session views the contact sheets and writes verdicts, scripts gate and publish, a plain-English hand-off. Sonnet for authoring.
- The cron switch stays off until the bar is locked, the first server run has been judged, and the budget is set.

### Step 7 — Product parity before go-live (pattern crafts)
- Studio "design your own" matching the other crafts' Studios exactly (photo-to-pattern, designer, describe-an-idea), premium gated on the global framework.
- Free-user activity visible in admin Members (signal, last seen, risk) so launch traffic can be read.
- The go-live switch is adding the category to LAUNCH_VISIBLE_CATEGORY_SLUGS, made once by the orchestrator on a train with deploy verification; Rebecca signs off the moment.

### Corrections to older lines in this playbook
- "Close-out (autopilot is retired — no flip on)" and "Max 4 Sonnet workers concurrent (Rebecca's machine cap)": superseded. Autopilots run as cloud routines under Step 6c; the four-worker cap is a credit rule, not a machine rule.
- "DB-infra gotcha: the per-session worktree has NO node_modules — run from the MAIN checkout": superseded for cloud sessions. A worktree resolves @homemade/db after one pnpm install --frozen-lockfile --prefer-offline, and the DB is reached through the Neon WebSocket adapter (PG_VIA_HTTPS_PROXY=1). Never build tunnels or listeners; never psql.
- Merging: workers never merge to main; everything except a live incident rides the daily train, merged once by the orchestrator with one deploy verification (read the migration step if the train carries one). Nobody opens PRs.
- Hero staging for pattern crafts: the Fal finish is a creative upscale of the loom's own render, gated by a fidelity check against it; it is not generation. Rebecca's per-category Fal approval still applies.


## Learnings log (add to this as each category is done)
- **Cross-stitch (done 2026-06):** render-only heroes work (truthful + pretty). PDF 500'd on non-WinAnsi chart symbols → DejaVu via fontkit. Symbol view fell back to colour when zoomed out. Patterns loaded cropped to a corner → needed drag-to-pan + refit-on-resize. "Start making" tracker showed on non-project types → hidden site-wide. Ended all-TECHNIQUE teaching, no STITCH foundation (note for next time). Stitching Mama listing photos are digital mockups, not real stitched pieces.
- **Needlework / embroidery (in progress 2026-06-21):** hybrid (counted reuses cross-stitch engine; free-form needs new line-art + stitch-guide engine). Render-only dies for free-form (template isn't a sellable hero) → img2img/designer. STITCH diagram library is a prerequisite. This session also owns the whole cross-craft taxonomy build (CollectionTag/CollectionTagAssignment, vocabulary in collection-vocabulary.ts, /themes pages) + the back-catalogue backfill — single source of truth, no other session builds it. See [[project_cross_craft_taxonomy]].
- (next category: add learnings here)
- **Crochet (in progress 2026-09):** stitch look needed six look-pass rounds at real gauge before the flat family locked (white ground by camera-ray boost, size gate, staging by object); round parts needed a stuffing model AND a sphere-shaped increase recipe, because stuffing cannot round a "plus six then hold" ball. Bear judged pass by the orchestrator was still caught by Rebecca (arms read as feet; too rigid), so her critique reopens rounds. The bulk autopilot was first built on API-billed Inngest and had to be rebuilt as a cloud routine on Max. The 1,200 target had never been tested against the market; the world-class audit and the idea backlog now come before fill.
