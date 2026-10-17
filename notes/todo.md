# Homemade to-do (kept by the orchestrating sessions; update it as work lands)

Rules for this file: only items still to do; remove a line the moment it is done (finished work goes in BUILD_PROGRESS.md, not here); one line each; newest decisions at the top of a section.

## Crochet: to live, in order (refreshed 17 October 2026)
The live job list is `/mnt/project-files/homemade/crochet-bar/TRACKER.md`; rules and engine map in `project/project_crochet_state.md`. End-of-week credits only.
1. Finish the open jobs on the train branch `claude/crochet-train-1009` (per the tracker): merge the finished Opus branches, then Fable fine-tunes by eye in order cow, garland, spiral trees, doll, bunny (`crochet-bar/PLAN-next-fable.md`).
2. Re-render the ball and bear sign-off rows and the Studio presets on the new geometry; Bec judges them.
3. Engine rounds still to do: soft squash (Fable), motif joining, play-food staging, colourwork, lace, then garments.
4. Bec: merge the train to main (one deploy verification).
5. Bec: switch on the crochet autopilot (every 8 hours plus its marker, 3 batches of 8 a day, $100 a month cap). Only after the toys pass. Then judge its first report on `claude/crochet-routine-reports`.
6. Go-live gates (completeness, vision sweep, tagging, reindex, category page and descriptions), then add `crochet` to `LAUNCH_VISIBLE_CATEGORY_SLUGS` on a train, with Bec's sign-off. Tooling ready on claude/crochet-golive-prep (17 Oct): `scripts/crochet-golive-check.ts` says which gates fail; the order is in `crochet-bar/GO-LIVE-READINESS.md`.

## Cross-stitch: to sign-off, in order (6 September 2026)
1. Needlework: its own audit first (Rebecca is writing the prompt; do not start before it), then the candidates-mode conversion in the same shape as cross-stitch. Its cron has no autopilot row and skips today, so it spends nothing.
2. Loom photoreal heroes for cross-stitch, GET READY (not now; Rebecca decides when). Not physically possible today: the loom has no cross-stitch stitch. Work to reach ready, in order: (a) crochet session, in the loom: a true-scale X stitch on aida (two strands with twist, the fabric grid with holes), back-stitch and French knots as thread, proven beside a real photo of a stitched piece per the loom rules and Rebecca's eye; (b) cross-stitch session: chart cells and floss codes mapped to a loom program, the Fargate render, the Fal finish with the fidelity gate against the flat render, R2, Media row, hero attached, idempotent, never overwriting a designer photo; (c) staging at real size (hoop, frame, flat lay) so a 50-cell piece looks small and a 600-cell showpiece looks like a wall piece; showpieces are 245,000 stitches, so the renderer needs instancing; (d) three proofs judged beside real photos before anything is switched on.
3. Loom photoreal heroes for cross-stitch, THE RUN (not now; needs Rebecca's budget first). Render on publish for new gems, then backfill the catalogue in batches, then the pattern page and card go photo first with the chart beside it. Estimated cost at crochet's measured rate of about $0.16 a pattern (Fargate task-minutes plus the Fal finish): about $300 for 1,818 patterns, more if showpieces need longer renders; measure on the three proofs before setting the budget.
4. Inngest free tier (50,000 runs a month; 41,600 used by 7 September): the two five-minute crons now poll every 30 minutes (train 17). If the count is still climbing fast after a week, collapse the cross-stitch idea worker's guards into one step per attempt (up to 33 step.run calls today).
5. Small leftovers: store the pattern page's floss summary on the row at publish (today it is computed by a Postgres count per server task and cached; a showpiece's first hit on a fresh task takes about five seconds); seed-stitches.ts drift; xs-candidates.ts treats the value after --as as a slug too (harmless); a faint grey halo on the weakest quick-win charts at the bare-fabric edge.
6. Fill to 1,818 under the $50–60 image budget (cron on in candidates mode since 6 September 12:32 UTC; the six-hourly judging routine keeps or rejects; the orchestrator merges the routine's pool branches); close-out gates; learnings line in the playbook; Rebecca's sign-off.

## Parked to save credits
- Yarn-fibre halo render option (chenille look matched to the pattern yarn).
- fpdc/bpdc collars (branch claude/loom-look-pass-6; look regressed).
- Shorter bear arms and ball coil.
- Tapestry lane: the wall-hanging shelf stays paused until its fix passes (job log `crochet-bar/jobs/tapestry.md`).
- Knitting: see project_knitting_state.md.
- Cross-craft from the world-best audit: yarn/floss database, follow-along offline mode, accessibility, one-way contributions (maker photos, reviews, errata pages, feature suggestions, AI-screened), animated stitch diagrams, public errata.
