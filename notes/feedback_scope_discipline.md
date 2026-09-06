---
name: Worker sessions stay inside their prompt scope
description: A worker prompt's "Scope — out" section is a hard boundary. Workers don't silently expand scope. If they think the scope is wrong, they stop and ask. When I write prompts I make scope-out emphatic so this doesn't happen.
type: feedback
originSessionId: 51fcaac5-5db7-4df9-82b1-ee909db7152d
---
Worker prompts have a "Scope — in" and "Scope — out" section. Out is a hard boundary, not a suggestion.

**Why this matters:**
- Out-of-scope work breaks the parallel-session conflict analysis I do as orchestrator. If the content pipeline session is told "docs only" and runs in parallel with another session touching app code, scope creep into app code creates merge conflicts the orchestrator didn't plan for.
- Out-of-scope work bypasses the verification I would have set up. A worker that wasn't briefed on the deploy-verify rule because its work was "docs only" then pushes app code without verifying. That's how broken deploys land.
- Scope creep makes it harder to know what each session actually shipped, which makes BUILD_PROGRESS.md and memory updates unreliable.

**Observed failure (2026-05-11):** The content pipeline session was scoped to `docs/` only. The worker shipped `feat(content): programmatic tutorial upload + two anchor tutorials` (commit `bbde6be`) which added `packages/db/scripts/` tooling + actual DB rows. That push failed deploy and contributed to the multi-hour CI failure chain. The work itself is useful — but it should have been a separate scoped session with the right verification rules attached.

**How I (orchestrator) apply this when writing prompts:**

- Make "Scope — out" emphatic. Don't bury it. Lead it with bullet points the worker can't miss.
- For docs-only sessions, include an explicit line: "This session writes ONLY to {paths}. No application code, no schema migrations, no infra changes. If you think the scope should be wider, stop and ask Rebecca before adding anything outside it."
- When proposing parallel sessions, the scope-out section explicitly names the files the OTHER sessions own, with a "don't touch these" instruction.
- If a worker reports back "I went beyond scope because X" without warning, treat that as a discipline issue worth flagging in the next orchestrator-to-worker prompt.

**How worker sessions should behave:**

- Read both scope sections carefully before starting.
- If new in-scope work reveals a dependency on out-of-scope work, stop and report rather than silently expand.
- If the worker spots a small fix outside scope (e.g. a typo in a neighbouring file), make a judgement call but bias toward leaving it for a dedicated session.
- Don't expand scope just because there's context budget left. Bigger isn't always better — the orchestrator sized this session deliberately.

The session sizing rule (`feedback_session_sizing.md`) says to bundle generously when scoping. This rule says: once scoped, stay there. The two rules work together at different times.
