---
name: project_cross_stitch_state
description: "Cross-stitch — where it stands, what the cross-stitch orchestrator owns, the numbers, the branches, and what is left before sign-off. Kept by the cross-stitch orchestrator session; update it in the same session that changes a fact."
type: project
---
# Cross-stitch — where it stands (6 September 2026, cross-stitch orchestrator session)

Plan of record (Rebecca, 5–6 September): find why the category was paused (duplicates), fix duplication at the root in the publish path, cull duplicates and embarrassments reversibly, set real shelf targets from a world-best audit, make the fill genuinely self-running in the cloud (never her laptop), fill to target, close out. No community section, ever: one-way contributions only (maker photos, error reports), AI-screened. Free-account sign-in stays on stitching. Budget to finish the category: solidly under $50–60 of image spend.

## Numbers
- Public patterns 1,079; private 108 (all reversible culls with the reason on `qcBlockReason`). Target 1,784 = the sum of the per-shelf targets in `apps/web/src/lib/studio/generation/categories.ts` (`CROSS_STITCH_SHELVES`; hold shelves are never planned).
- Cull this run: 87 duplicates (85 clusters over 192 of 1,153), 14 vision-sweep fails from a full-catalogue look at every thumbnail, 3 proof-batch gems below the bar.
- Shelves added 6 September: small-makes 60, christmas 80, coastal 60, folk-geometric 60; seasonal 90→40; six Christmas rows refiled to `christmas`. Thin shelves under 12 patterns are hidden from the theme filter.
- Yield on Flux schnell: about one gem per 14 attempts; Flux 1.1 Pro about one per 10 at ten times the image cost, so Pro stays the dense-lane source only (`sourceMode` 'schnell' default, 'pro-all' held in reserve). Six attempts per idea. Daily caps 480 schnell / 24 Pro.

## Why it duplicated (root cause, fixed)
The retired local generator re-composed the same brief stems across batches; the server planner avoided only the last 40 names and copied pool examples verbatim; nothing compared images. Now: `bulk/dedupe-guard.ts` compares every candidate against the whole public catalogue by dHash64/256, a 24×24 chart fingerprint, palette Jaccard and a normalised subject key (`Pattern.imageHash64/256`, `chartFingerprint`, `subjectKey`; thresholds in `bulk/similarity.ts`), and the planner runs constrained (head-noun must match a pool subject, 120 recent keys avoided, within-batch collisions rejected, lane tags per subject, text-risk nouns dense-lane only).

## The pipeline as it stands
ECS Inngest: `bulk-cross-stitch-batch` dispatcher (2-hourly cron) → `bulk-cross-stitch-idea` workers: plan → generate → pale/vividness guard (`bulk/vividness.ts`) → bare-fabric rule (`bulk/bare-fabric.ts`) → vision gate (`vision-gate.ts`, rubric recalibrated 6 September against kept rejects) → dedupe guard → publish → thumbnail → shelf → search sync → stop at target. Run finaliser, stalled sweep, Sentry warning and admin banner on a zero-yield run; rejected renders kept per run (`BulkRun.rejectSamples`). Judging pack: `apps/web/scripts/xs-run-review.ts <sinceISO>`; culls: `xs-cull.ts`; rejects: `xs-rejects-sheet.ts`.

**The cron is OFF** (switched off 11:22 UTC 6 September) until the zero-API conversion lands: the vision gate and planner on ECS call the Anthropic API, which breaks Rebecca's rule (all model work on her Max plan in cloud sessions and routines; API only where unavoidable; the one agreed exception is the maker-photo check on upload). Conversion in flight on `claude/xs-candidates`: `gateMode` 'candidates' default, UNLISTED candidate rows judged by a 6-hourly cloud routine from `docs/autopilot-prompts/cross-stitch.md` via `apps/web/scripts/xs-candidates.ts list|sheets|keep|reject|reroll|pool-check`; proof batch after deploy; then the cron goes back on in candidates mode. Weekly judging routine "Homemade - Cross-stitch weekly judging" (Mondays 07:00 UTC) already exists.

## Shipped this run (on main unless marked)
Dedupe guard and fingerprints; planner rewrite; run finaliser and alerts; Fal caps; SEO images; 23 shelf descriptions; print quality (tiled PDF with rulers, index sheet, large print, vector symbols); stitchability metrics and filter; legible symbol assignment; fabric calculator; bare-fabric conversion of 446 patterns; provenance page `/cross-stitch/about-the-library`; `/stitches/cross-stitch`; "How to read a cross-stitch chart" tutorial; Typesense client through the proxy; admin counts fix (branch). On the train for 6 September: admin-counts, stash-on-card, parking (needs `seed-stitches.ts --craft=cross-stitch` at merge), new shelves, first-stitch journey (slim cookie bar, sign-in return, tap tooltip, combined difficulty row, beginner link, mobile nav).

## In flight (branches)
- `claude/xs-outlines`: back-stitch outlines and French knots in the generator plus catalogue backfill, then fractional stitches (may land as `claude/xs-fractionals`).
- `claude/xs-candidates`: the zero-API conversion above.
- `claude/maker-photos` (42272825): one site-wide maker-photo system, AI-approved on upload with an "ask us to look again" appeal queue, handles as credit, button text "Upload photo", terms and tester agreement as Rebecca approved. Held for the crochet session's word that it does not collide with their work.

## Next, in order
1. Train 12 (the branches above) with one deploy verification; run the parking seed at merge.
2. Candidates-mode proof batch; create the 6-hourly routine; cron back on; convert needlework the same way.
3. Personalised sampler job (birth, wedding, new home, name-and-date; word-art track; several catalogue samples per type; customise or build from scratch).
4. Then, agreed with Rebecca: loom photoreal heroes (crochet session owns the builder), the 200+ colour / 400+ cell tier and the under-60-cell tier (proof first), readings wired to the glossary, the `upload-tutorial.ts` hero-clearing defect, `seed-stitches.ts` drift.
5. Close-out at target: completeness gates, vision sweep of the new work, reindex, sitemap; learnings line in the playbook; Rebecca's sign-off.

## Cloud session facts this category relies on
`aws` and `gh` live in `$HOME/.local/bin`; DB only through the Neon WebSocket path; packages/db scripts load dotenv from `../../.env.credentials`; apps/web scripts run as `HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/<name>.ts`; Inngest REST works with the signing key; after each deploy `curl -X PUT https://homemade.education/api/inngest` re-registers the functions. The Anthropic key is not in the session environment (only on ECS via Secrets Manager); reading it into a session is Rebecca's call. Cross-session messages reach the crochet session only through `create_trigger` on its session id plus `fire_trigger`.
