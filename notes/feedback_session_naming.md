---
name: Prefix worker session names with "Homemade - "
description: When generating worker prompts or anything that becomes a Claude Code session title, prefix with "Homemade - " so Rebecca can tell them apart from her Aura (trading bot) sessions running in parallel.
type: feedback
originSessionId: 51fcaac5-5db7-4df9-82b1-ee909db7152d
---
Any session-title-shaped string I produce (worker prompt headings, task descriptions that surface as session names, scheduled task titles, spawned task titles) MUST start with `Homemade - `.

Examples:
- `Homemade - Build admin media CRUD with Cloudflare Images`
- `Homemade - Phase 2f tutorials with TipTap`
- NOT `Build admin media CRUD with Cloudflare Images`

**Why:** Rebecca runs multiple Claude Code projects on the same account. The other active one is a trading bot in a separate repo. Without the prefix she can't tell at a glance which session belongs to which project. (Her routines list today names that project **Wildflower** (`becspage-arch/wildflower`), while `deploy_cdk_gotchas.md` still calls the AWS account **Aura**; whether it was renamed or these are two things is unverified 2026-09-06. The prefix rule is unaffected.)

**How to apply:**
- Worker prompts: the **very first line** of the pasteable prompt must be a markdown H1 starting with the prefix, e.g. `# Homemade - <task name>`. Claude Code's session auto-namer reads the first content of the pasted prompt; a "Suggested session title:" line buried in the middle gets ignored.
- Don't rely on labels like "Suggested session title:" or "Session name:" — the H1 is what works.
- The H1 should be inside whatever code-block wrapper Rebecca uses to copy the prompt, not outside it (she pastes the contents of the block).
- `mcp__ccd_session__spawn_task` titles: prefix them.
- Agent tool descriptions: prefix them when the description will surface as a visible session identifier.
- Scheduled task names: prefix them.
- Anywhere a title is internal-only (e.g. a TodoWrite item) the prefix isn't needed.

**Observed failure mode (2026-05-11):** A worker prompt with `Suggested session title: Homemade - Phase 2f...` inside the code block came through without the prefix in Claude Code's session list. The auto-namer used its own summary of the prompt content instead.
