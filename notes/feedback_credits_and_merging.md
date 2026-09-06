---
name: Credits and merging discipline
description: Two merge lanes (incidents merge alone, everything else rides the day's train); workers never merge to main; batch renders and stop after two attempts; read summaries not transcripts; Sonnet for volume, Opus for hard work; cap four parallel workers; no suggested-task cards.
type: feedback
originSessionId: b7d7c3b1-d04a-433f-96e0-403d73f05890
---
Credits and merging (Rebecca, 5 September 2026)

- Two lanes for merging: only a live-site incident, a broken deploy, a customer-facing Sentry error or a security fix merges to main on its own. Everything else rides the day's train, merged once by the orchestrating session, with one deploy verification. Docs never merge alone. The full rules are in CLAUDE.md.
- Workers never merge to main. Own git worktree, own branch, verify locally (typecheck, lint, the tests for the files touched; a full sweep at most once, only if shared code changed), push the branch, report branch and commit in a short plain-English summary.
- Renders are the loom's expensive turns. Never render before the numbers say the geometry is settled. Batch every render. Two construction attempts per problem, then write it up and change approach. Crops and side-by-sides are built once per round and judged once.
- Read summaries, not transcripts. Never open a worker's transcript or a raw CI log unless a failure needs it.
- Commit per reviewed change; push a worker branch at the end of each part; pushes to main are the train.
- Sonnet for volume; Opus for stitch topology, the render pipeline and tricky merges. Every worker brief names its task, the files it owns, the files it must not touch, and the facts it needs, so it never explores the repository.
- Cap parallel workers at four. Never spawn a worker for something the handbook or a memory note already records.
- Two orchestrators, one to-do: each keeps an "In flight" block in BUILD_PROGRESS.md and reads the other's before starting anything.
- No "suggested task" cards. Anything worth doing gets a worker inside the session so it is managed there.

**Why:** merge traffic and render turns are the two places this build burns effort fastest, and uncoordinated merges to main also break the parallel-session conflict analysis the orchestrator does. See [[feedback_scope_discipline]], [[feedback_worker_handoff_style]], [[feedback_model_choice]], [[feedback_session_sizing]], [[master_orchestrator]], [[feedback_deploy_verification]], [[feedback_render_before_volume]], [[feedback_compare_reference_before_win]].

**How to apply:** put the "workers never merge to main / own worktree / push the branch and report" block in every worker prompt alongside the scope and hand-off blocks; name the model per the Sonnet/Opus split; hold branches for the day's train and merge them yourself with one deploy verification.
