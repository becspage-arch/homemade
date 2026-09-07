# Index of `notes/` — one line per file

Rebuilt 6 September 2026 by a notes audit: every file below exists, and every line says what its file now says. Read `README.md` for how the folder works, then the files that bear on your task.

## Start here

- [How this folder works](README.md) — memory lives in the repo, public with it; rules for editing a note; no credentials, ever
- [Shared to-do](todo.md) — only things still to do, in order, per lane. Finished work goes in `BUILD_PROGRESS.md`
- [Master orchestrator pattern](master_orchestrator.md) — two orchestrators plus worker sessions, what each does, what goes in a worker prompt. Corrected 2026-09-06: workers push a branch and never merge
- [Category sign-off PLAYBOOK](playbook_category_signoff.md) — the canonical reusable checklist (Steps 0–7, the generation engine, three QC gates, close-out, go-live) plus the per-category learnings log
- [Rebecca's domain expertise](user_rebecca_background.md) — former digital sewing-pattern company owner and summit organiser; don't explain basics; she stays behind the scenes

## Working rules — chat, hand-offs, sessions

- [Chat tone: no tech-bro](feedback_chat_tone_no_techbro.md) — keep dev chat plain; no "vibe", no startup slang
- [Don't use "honest"](feedback_no_word_honest.md) — strip "honest"/"honestly" from chat; it reads as AI filler
- [Steps, not explanations](feedback_steps_not_explanations.md) — give action steps; cut unrequested technical asides
- [No time estimates](feedback_no_time_estimates.md) — never estimate how long human work takes; machine durations only
- [No popup questions](feedback_no_popup_questions.md) — never AskUserQuestion popups; ask inline with the context visible
- [No .md hand-offs](feedback_no_md_handoffs.md) — strategy and synthesis go in chat as plain English, not `docs/*.md`
- [Worker hand-off style](feedback_worker_handoff_style.md) — short plain-English summaries, not memos; banned filler words listed
- [Session naming](feedback_session_naming.md) — worker session titles start `Homemade - ` (Aura is her other project)
- [Session sizing](feedback_session_sizing.md) — size worker prompts large; bundle related work; split only on real conflict
- [Scope discipline](feedback_scope_discipline.md) — "Scope — out" is a hard line; a worker stops and asks rather than expanding
- [Model choice](feedback_model_choice.md) — Sonnet for bulk authoring, Opus for orchestrator, tech, pipeline and anchor work; every prompt names a Model
- [Credits and merging](feedback_credits_and_merging.md) — two lanes plus the daily train; workers never merge; batch renders; cap four workers; no suggested-task cards
- [Deploy verification](feedback_deploy_verification.md) — `gh run watch` then `/healthz` 200 after any push to `main`. Corrected 2026-09-06: the train's merger runs it once, not every worker
- [Verify by code, not browser](feedback_verify_by_code_not_browser.md) — driving her browser crashes her machine; verify via DB, git and code, or ask her to look
- [Software-only build](feedback_software_only_build.md) — nothing gates on Rebecca physically making something; code-side assertions pre-launch, user feedback after
- [No hiring yet](feedback_no_hiring_yet.md) — hard no on paying illustrators, photographers, writers or contractors. Rebecca and Claude only
- [AI-only moderation](feedback_ai_only_moderation.md) — HARD RULE: every moderation flow runs through Claude sessions; never propose manual editorial review
- [No warning tiers](feedback_no_warning_tiers.md) — automated QC is binary, block or stay silent; nobody triages warnings
- [No softening options](feedback_no_softening_options.md) — never offer options that keep broken content or relax a locked rule
- [Get it immaculate](feedback_get_it_immaculate.md) — pre-launch, no customers: build the foundation properly rather than squashing a new need into an ill-fitting model
- [All schema fields up-front](feedback_schema_all_fields_upfront.md) — add every plausibly-useful column now; avoid backfill migrations
- [Match sibling UI](feedback_match_sibling_ui.md) — a feature another category already has is matched exactly by default; ask before diverging
- [Review your own visual output](feedback_review_own_visual_output.md) — look at your own mockups and diagrams against the bar before sending them

## Spend and how the work runs

- [No API spend](feedback_no_api_spend.md) — corrected 2026-09-06: ALL model work runs on the Max plan in cloud sessions and routines, never per-token API calls; the maker-photo check on upload is the one exception. Fal image spend needs per-category approval
- [Continuous bulk mode](feedback_continuous_bulk_mode.md) — superseded 2026-09-06 by playbook Step 6c; the fresh-agent-per-firing shape survives, the "runs on her laptop" body does not
- [Autopilot null sort](feedback_autopilot_null_sort_order.md) — a newly-READY category (`lastAutopilotRunAt` null) sorts LAST in the tutorial-led picker; backdate to bump it. The pattern-craft autopilots don't use that picker

## Voice and content standards

- [Anti-AI voice rules](feedback_homemade_voice.md) — the big one: zero em and en dashes, no medical, financial or safety advice, grade 6–8, references in the Sources block, numbered steps. Site copy, not dev chat
- [Mindset voice](feedback_mindset_voice.md) — mindset bodies read factual and recipe-clean, not AI-poetry; no platitudes, disclaimers or vague lists
- [Verbatim energy statements](feedback_verbatim_energy_statements.md) — affirmations and tapping scripts from Rebecca's books stay word for word; voice rewrites don't touch them
- [Voice rewrite: don't over-prune](feedback_voice_rewrite_dont_over_prune.md) — a voice retrofit fixes register; it never deletes a section for tripping a rule
- [Category description voice](feedback_category_description_voice.md) — a category description is a list of what's inside and nothing else
- [Content completeness gates](feedback_content_completeness_gates.md) — the makeability plus completeness layer wired into every publish path, the scripts that run it, and the audit numbers
- [Content completeness checklist](feedback_content_completeness_checklist.md) — the hard per-type checklist a row satisfies to be PUBLISHED. No OR clauses; failing any item un-publishes
- [Inline glossary coverage](feedback_inline_glossary_coverage.md) — every `Tutorial.glossaryTerms[]` entry appears inline once in a `glossaryTooltip` mark; both-way mismatches are wrong
- [glossaryTooltip termSlug](feedback_glossary_tooltip_termslug.md) — the mark's attr key is `termSlug`, not `slug`; the wrong key fails voice-check and blocks upload
- [TipTap text-node type](feedback_tiptap_text_node_type.md) — every text leaf needs `"type":"text"` or the public renderer silently drops it
- [Temperature and unit system](feedback_temperature_and_units.md) — conventional °C is canonical; fan, °F, gas mark, grams, oz, ml and cups derive at render from the reader's preference
- [Measurement units](feedback_measurement_units.md) — cm and mm canonical for gauge, dimensions and body measurements; the reader's preference picks the display
- [Pipeline-setup includes techniques](feedback_pipeline_setup_must_include_techniques.md) — a new category's author prompt must populate `techniqueSlugs`, `criticalTechniques` and `aliases`. Those prompts live in `docs/*-author.md`
- [CC republishing policy](feedback_cc_republishing_policy.md) — CC-BY, CC0 and PD may be included with verified attribution; everything authored is Homemade-original; never republish a pattern as-is

## Patterns, renders and the loom

- [Pattern complexity = a RANGE](feedback_pattern_complexity_range.md) — every bulk run spans simple to huge-detailed; the 100+ colour end is wanted, never forced to one level
- [Cross-stitch world-class bar](feedback_cross_stitch_world_class_bar.md) — best collection in the world; the NORTH_STAR references; the June cull; repair before cull; targets now 1,818 across 27 shelves
- [Render before volume](feedback_render_before_volume.md) — pattern quality is judged only from a finished render; never build volume before the loom can show it
- [Customer-eye renders](feedback_customer_eye_renders.md) — HARD RULE: look at every render as a customer before presenting; only bring ones a customer would be happy with
- [Compare reference before win](feedback_compare_reference_before_win.md) — HARD RULE: pull a real swatch photo and compare side by side before calling any loom stitch good
- [No faking stitch formation](feedback_no_faking_stitch_formation.md) — HARD RULE: loom yarn is genuinely stitched, interlock held by self-collision; no pinned drawn shapes, no spring joins
- [Hero must be the exact pattern](feedback_hero_must_be_exact_pattern.md) — a pattern hero promises exactly what the customer makes; AI may only finish a locked deterministic render behind a fidelity gate
- [Image strategy](feedback_image_strategy.md) — background now: procedural cards are last resort only and designer assets are sacred; heroes follow the loom-render and generate-first rules above
- [Floss tables](feedback_floss_table_curated_working_set.md) — palette size is a per-pattern choice; never hand-type or invent RGB values. `dmc-table.ts` has 140 entries, `dmc-full.ts` 457
- [Studio + renderer shared patterns](feedback_studio_renderer_patterns.md) — proven across the cross-stitch, crochet and knitting Studios: barrel split for sharp, autosave, setup-card reprompt, accent colour, colourwork `forceSymbolSlug`

## Premium and the business model

- [Premium philosophy](feedback_premium_philosophy.md) — build every feature to free standard; decide gating later
- [Premium vs free spec](project/project_premium_free_spec.md) — the canonical three-tier access spec and the per-category premium table. The framework and `/premium` are built; Stripe is not
- [Premium gate cleanup](feedback_premium_gate_cleanup.md) — which in-product gates came down, which stayed, and the entitlement framework's implementation facts
- [Free-tier sign-in carrots](feedback_free_signin_carrots.md) — sync, multi-device progress and saved preferences are free signed-in, not premium. Its "Studio works anonymously" line is overridden by the spec above
- [Translation free, personalization premium](feedback_premium_translation_is_free.md) — region derivation, translation and calculation are free; per-user saved-state personalization can be premium
- [Designer onboarding timing](feedback_designer_onboarding_timing.md) — independent-designer onboarding waits until every category is live and running; bottom of the queue

## How the system actually behaves (facts, not rules)

- [CDK deploy gotchas](deploy_cdk_gotchas.md) — the GitHub deploy does NOT run `cdk deploy`; ECS env and secrets come from a manual deploy with the right MOUNT flags or production breaks. `cdk diff` first
- [Category visibility enforcer](reference_category_visibility_enforcer.md) — taking a category public is a code change to `LAUNCH_VISIBLE_CATEGORY_SLUGS`; a direct DB flip is reverted every deploy. Visible today: cooking, baking, cross-stitch, needlework
- [Canonical house designer](reference_house_designer_canonical.md) — one `homemade` house-designer row reached through `ensureHouseDesigner()`; `isHouseDesigner` gates premium and the spotlight. Stitching Mama is the one independent designer
- [Script env / dotenv path](reference_script_env_dotenv_path.md) — how each family of ops script finds `.env.credentials`, and the bare `dotenv/config` trap with its fix
- [Cloud sessions](project/project_cloud_sessions.md) — how the cloud environment is configured, the network allowlist, the SessionStart hook, and what cloud sessions still can't do

## Per-project state

- [Cross-stitch state](project/project_cross_stitch_state.md) — where cross-stitch stands: numbers, the duplication root cause, the candidates-mode pipeline and its two routines, and what is left before sign-off
- [Knitting state](project_knitting_state.md) — where knitting stands: the branches held off main and the paused knit-program work with its resume point (loom orchestrator's file)
- [Loom: platform decision](project/project_loom_render_engine.md) — the 2026-06-22 ratification of one deterministic stitch-accurate render engine for every pattern craft, plus the canonical process
- [Loom: engine build state](project/project_loom_engine_build_state.md) — the embroidery-first reset and the 2.5D thread-stroke approach. Its worktree and branch names date from June; check against the tree
- [Loom: stitch engine](project/project_loom_stitch_engine.md) — the yarn-level continuous-strand crochet and knit engine. The handbook `apps/web/src/lib/loom/crochet/STITCH_ENGINE.md` is canonical; this is the summary
- [Loom: Fargate render](project/project_loom_fargate_render.md) — the Blender base render containerised and running on Fargate, how `renderHero` selects it, and the infra behind it
- [Loom: orchestrator log](project/project_loom_orchestrator.md) — the standing loom, crochet and knitting orchestrator's live progress log and resume point
- [Crochet: sign-off pass](project/project_crochet_signoff.md) — the crochet category sign-off, its locked decisions and the three-layer generation/render boundary. Dated June; several of its numbers have moved
- [Crochet: pattern engine](project/project_crochet_pattern_engine.md) — build 1 of the program and pattern layer (flat, twelve locked stitches) and what build 2 covers
- [Crochet: anchor batch](project/project_crochet_anchor.md) — the locked PATTERN template and chartData shape a crochet bulk worker matches, and why the teaching library must not be re-authored
- [Crochet: process diagrams](project/project_crochet_diagrams.md) — the locked hybrid diagram pipeline (public-domain Dillmont engravings plus in-house SVG for the modern gaps), hard exclusions and research dead ends
- [Cross-stitch generation toolkit](project/project_pattern_generation_toolkit.md) — largely superseded: the worker scripts it maps are deleted and generation moved into `studio/generation/`. Kept for its locked principles
