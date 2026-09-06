---
name: Size worker sessions large — 2-3x what feels natural
description: Rebecca wants beefier worker session prompts. Default toward more scope in one session, not less. Sessions routinely run for multiple hours before context gets tight.
type: feedback
originSessionId: 51fcaac5-5db7-4df9-82b1-ee909db7152d
---
When generating worker session prompts, size the scope generously. Rebecca said the original Phase 2e prompt was too short — it could have been 2-3x the work very easily.

**Why:** Each fresh session has setup overhead (reading memory, scanning code, building the mental model). A bigger scope amortises that cost. And sessions can run for hours before context gets tight, so context budget isn't the binding constraint that earlier instincts suggested.

**How to apply:**
- Default to bundling related work into one prompt, not splitting cautiously.
- Look for natural extensions: if a feature has an admin half and a public half, do both unless they genuinely conflict.
- Look for cross-cutting debt that fits: pre-launch debt items, infra tightening, small refactors that the worker will touch anyway.
- The split test: would building piece A inform piece B? If yes, bundle. If they're truly independent, separate sessions can run in parallel.
- Only split when (a) the pieces touch overlapping files in a way that conflicts, or (b) the work is so different that one worker would lose focus across both.

**Counter-signal:** If a worker reports back "ran out of context" or "had to defer scope", THAT prompt was too big. Adjust the next one down. Until that happens, keep pushing scope up.
