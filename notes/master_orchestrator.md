---
name: Master orchestrator pattern — how multi-session work is coordinated
description: The Homemade build uses a Master Orchestrator session plus focused worker sessions. This file explains the pattern so any Claude session in this project understands its role.
type: project
originSessionId: 5bc8ac16-5989-4c22-83d0-2e81109cbf3f
---
Rebecca runs **two kinds of Claude Code sessions** in this project:

## 1. Master Orchestrator session

One long-running session whose job is:

- Track the overall build state (reads `BUILD_PROGRESS.md` + this memory)
- Tell Rebecca where everything is at when she asks "where are we?"
- Generate self-contained prompts for worker sessions to do focused work
- Update `BUILD_PROGRESS.md` when work lands
- Track content pipeline (tutorials drafted, reviewed, published) once authoring begins

The orchestrator **never writes production code or content itself**. It plans and delegates.

How to recognise you're the orchestrator: Rebecca's first message will say something like "you're the orchestrator" or paste the orchestrator launcher prompt.

## 2. Worker sessions

Short, focused sessions that do one specific thing — build a feature, fix a bug, write a tutorial, debug a deploy. They:

- Get a self-contained prompt from the orchestrator (or directly from Rebecca)
- Have full access to write code, run commands, push commits
- End when the focused task is complete
- Report back so the orchestrator can update tracking

## Why this pattern

- The build is now big enough that one continuous session burns context too fast.
- Focused worker sessions give clean, complete, reviewable changes.
- The orchestrator keeps a stable bird's-eye view across many work cycles.
- Content authoring (Phase 8) will be repetitive: each tutorial is one focused session, orchestrator tracks the pipeline.

## What the orchestrator emits as worker prompts

Each prompt should be self-contained — pasted into a new Claude Code session and that session can do the work without further questions. A good worker prompt has:

- **Goal:** one or two sentences on what the worker should achieve
- **Scope:** what's in, what's out. The orchestrator's job is to size the work appropriately.
- **Context:** specific files to read, anything not obvious from memory
- **Success criteria:** how the worker knows it's done
- **Hand-off:** what to report back to the orchestrator

Worker sessions auto-load this project's memory, so the orchestrator doesn't need to re-state stack details or voice rules — just the specific task.

## Content pipeline (future, Phase 8 onward)

When we start authoring tutorials, the orchestrator tracks:

- Which categories need their first tutorials seeded (the launch five: cooking, baking, gardening, crochet, knitting)
- For each tutorial: draft → editorial pass (Rebecca) → publish
- Two upload paths must work:
  - **Manual via `/admin/tutorials/new`** — Rebecca types/edits in TipTap
  - **Direct programmatic upload** — a worker session writes the tutorial via Prisma (server action or script in `packages/db/scripts/`) so AI-generated content can be staged and reviewed in `/admin/tutorials` before publishing

Both paths produce the same Prisma rows. The admin UI is the canonical review surface either way.

## Worker hand-off verification — workers must prove operational steps ran

Recurring failure mode (observed twice on pipeline-setup work, 2026-05-17 and 2026-05-18): workers commit the scripts they're meant to run, then report "done" without actually executing them against prod. The committed code looks complete but the DB state is empty. Rebecca only notices when she tries to review the output and finds nothing there.

**Rule for every worker prompt I write that includes operational steps** (running a seed, running an upload, running a migration apply, running a backfill):

- Add to "Hand-off style": "Your summary MUST include the relevant `audit-recent-state.ts` (or equivalent verification) output showing the operational step actually changed DB state. If the output doesn't show the expected change, the work is NOT done — fix it before reporting."
- Add to "Scope — in" a final numbered step: "Verify the operational step landed: run `pnpm --filter @homemade/db exec tsx scripts/audit-recent-state.ts` (or the script appropriate to the work) and confirm the change is visible. Paste the relevant rows into the hand-off."
- For pipeline-setup workers specifically: the verification must show `subs > 0` AND `DRAFTs > 0` for the target category, OR explicitly explain why the seed couldn't run.

This rule converts a self-reported "done" into an objective check. Apply to:
- Pipeline-setup workers (seed taxonomy + seed test tutorials)
- Backfill workers (script writes rows)
- Migration workers (after `prisma migrate deploy`)
- Anything where DB writes are the deliverable

**The standard "Deploy verification" block already enforces this for code changes** (gh run watch + /healthz=200). The new rule extends the same discipline to DB-write deliverables: code-shipped is not done; DB-state-verified is done.

## What this memory does NOT replace

- `project_overview.md` — what Homemade is and the locked tech stack
- `project_build_state.md` — current snapshot of what's done (updated each session)
- `feedback_homemade_voice.md` — anti-AI voice rules
- `feedback_no_time_estimates.md` — no duration estimates ever

All memory files load automatically. Read them before doing anything.
