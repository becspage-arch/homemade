---
name: Zero external API spend — all AI runs inside Claude Code Max
description: Hard no on any paid AI / API spend for Homemade. The Claude Max plan covers Claude Code sessions; @anthropic-ai/sdk and any other pay-per-use AI provider is OFF-table. Every AI step lives inside a worker session.
type: feedback
originSessionId: aba396b0-445b-4bb9-bfc2-1d9880021dc1
---
Hard rule: zero external API budget for Homemade. Full stop.

**Why:** Rebecca pays for Claude Max, which covers her Claude Code sessions. That is the *entire* AI budget for the project. The target scale is 10k tutorials per niche × 5–10 niches = 50k–100k pieces of content. At Anthropic API rates a per-draft AI call costs around £0.02 on a warm cache, which scales to £1k–£2k at full content scope. That is not affordable. The constraint applies to every paid AI provider, not just Anthropic.

**How to apply:**

- Never install `@anthropic-ai/sdk`, `openai`, or any other paid AI provider SDK in this repo.
- Never write scripts that call a paid AI API at runtime, in CI, or during content authoring.
- Never assume a cost is "small enough not to matter." Every per-draft cost gets multiplied by ~100k at full scope. Even fractions of a penny add up to meaningful money.
- When the build plan calls for "a Claude pass" (e.g. bot-as-editor, recipe drafting, illustration prompt rewriting), the pattern is always: **worker session inside Claude Code does the pass in its own context, writes the output to disk, hands off to deterministic / free tooling**. Never an SDK call from a script.
- Voice editing, content drafting, and any other AI-shaped work belongs in a prompt template (e.g. `docs/voice-editor-prompt.md`, `docs/tutorial-author.md`) that a worker session reads and applies. The worker is Claude (in here, under Max). The output is a JSON file on disk.
- Deterministic tooling that can replace an AI step (e.g. `voice-check.ts` for rule enforcement) is preferred. AI is only used for tasks that genuinely need judgement — and only inside a worker session.
- Image generation via fal.ai (Flux 1.1 Pro Ultra) is a budgeted, separate decision Rebecca will make pre-launch — not the same as API spend on text. Don't generalise this rule to images without checking.

**Exception (added 2026-05-14): premium-feature API use is OK.** Features that will eventually be paid (e.g. user-personalised 30-day plans, custom meal planners, AI-generated tinctures from a symptom profile, dynamic ritual generators) can use the Anthropic API at runtime. The rationale: at scale these features generate revenue that covers their API cost, and they need per-user freshness so worker-session-driven content doesn't work. Tutorials and images stay zero-cost (bulk content, no per-user component); premium personalisation features can pay for themselves.

The rule for premium-feature API use:
- The feature must be one that's planned to be premium-tier (not free). If it's free-forever, the API cost has no payback path.
- Cost projection at expected user scale is documented before wiring goes live.
- Rebecca tests it herself (often as a personal use-case like the mindset 30-day plan) before any user sees it.
- The feature degrades gracefully if the API key is unset (returns a "premium feature, sign in / upgrade" prompt rather than crashing).

If a future plan or brief calls for an SDK-based AI script for tutorials, images, or any free-tier feature: stop, flag it, propose the worker-session-based equivalent. For paid-tier features the SDK is on-table.
