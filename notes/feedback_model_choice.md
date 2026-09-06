---
name: Model choice per session type — Sonnet for bulk content, Opus for everything else
description: Bulk content authoring (recipe drafts, practice writes, herbal protocol writes — anything that's a high-volume per-item write pass) runs on Sonnet. Orchestrator, tech work, pipeline setup, anchor batches, planning — all Opus. Documented in BUILD_PROGRESS.md § "Multi-category fill plan" working assumptions; this memory captures it as a feedback rule so every worker prompt I write specifies the model.
type: feedback
originSessionId: 51fcaac5-5db7-4df9-82b1-ee909db7152d
---
Per the locked working assumptions in `BUILD_PROGRESS.md` §
"Multi-category fill plan":

| Session type | Model |
|---|---|
| Orchestrator (planning, coordination, prompt-writing) | **Opus** |
| Tech / marketing worker (code, deploys, copy work, infra, schema, scripts, debugging) | **Opus** |
| Pipeline-setup worker (per-category schema, authoring prompt template, voice-check tuning, anchor tutorial / practice batch) | **Opus** |
| Bulk content authoring worker (daily fill — 100+ items per batch, recipe / practice / protocol drafting) | **Sonnet** |
| Voice-check CLI | None — deterministic |

**Why bulk content is Sonnet:**

- Opus over-thinks individual items in a high-volume batch and burns context fast. A 100-recipe session on Opus typically runs out of context partway through.
- Sonnet is faster, cheaper on the Max plan's session budget, and the per-item judgement isn't where the value comes from — it's the cumulative throughput against the prompt template's constraints.
- The drafting prompt (`docs/tutorial-author.md` v4 and equivalents for other categories) does the heavy lifting; the model just needs to follow it.
- Real-world evidence: `affectionate-swirles-12ae54` (Step 12 first bulk batch on Opus) didn't complete the full 100. Sonnet was the right call from the working assumptions.

**Why everything else is Opus:**

- Schema design, prompt template authoring, voice rule tuning all need the judgement Opus brings.
- Anchor batches (the first 1-3 of a category) need careful per-item quality more than throughput.
- The orchestrator (me) plans against the whole project; Opus.
- Tech / deploy / debugging work benefits from Opus's depth on edge cases.

## How I apply this when writing prompts

Every worker prompt I write includes a **Model** line at the top under the H1, explicitly stating which model to use. Examples:

- `**Model:** Sonnet — bulk content authoring per `feedback_model_choice.md`.`
- `**Model:** Opus — pipeline setup, schema + backlog draft.`
- `**Model:** Opus — tech / infra session.`

If a worker hits a wall (runs out of context, drifts on quality) and the model was wrong for the job, the line in the next prompt is fixed.

## What this DOESN'T change

- Hand-off style still applies (`feedback_worker_handoff_style.md`).
- Deploy verification still applies (`feedback_deploy_verification.md`).
- Scope discipline still applies (`feedback_scope_discipline.md`).
- Voice rules still apply (`feedback_homemade_voice.md`).
- The Sonnet sessions are still real Claude Code sessions — same standards, just a different underlying model.
