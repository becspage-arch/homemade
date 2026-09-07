---
name: Pipeline-setup workers must include technique annotation
description: When writing a pipeline-setup worker prompt for a new category, scope-in must include author-prompt population of Tutorial.techniqueSlugs + criticalTechniques + aliases. Otherwise that category ships without technique linking.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---
**Corrected 2026-09-06 (notes audit).** Two facts in this note had moved. (1) Author prompts do not live in `apps/web/src/lib/author/` — that directory does not exist. They are markdown prompt templates in `docs/`: `docs/tutorial-author.md` (cooking), `docs/baking-author.md`, and 73 more per-category files; 55 of them already name `techniqueSlugs`. (2) All four categories named below now HAVE author prompts and published content (animals-smallholding 459 published, home-repair 518, natural-home 435, sustainability 397 — live database, 2026-09-06), so the backlog this note was written against is cleared. The RULE stands for any new category from here.

When I write a pipeline-setup worker prompt for a category that doesn't yet have pipeline infrastructure — historically **animals-smallholding, home-repair, natural-home, sustainability**, all four now done — the Scope-in section MUST include a line that says the new category's author prompt populates the technique-linking fields:

> Author prompt populates `Tutorial.techniqueSlugs` (every technique slug the tutorial references) and `Tutorial.criticalTechniques` (subset that are load-bearing). For technique-type tutorials in this category, the author prompt also populates `Tutorial.aliases` (search aliases for the reverse-sweep Inngest function). Follow the existing pattern in `docs/tutorial-author.md` (cooking) and `docs/baking-author.md`.

**Why:** Worker C (2026-05-18) updated technique-annotation in the author prompts of 13 categories — every category that already had pipeline infrastructure at that point. The 4 categories without pipeline infrastructure will inherit the universal schema + renderer + editor mark + reverse-sweep automatically, but their author prompts don't exist yet, so they have to be written correctly from the start. If we forget, we'd need a retroactive pass to add technique annotation to whatever they author in the meantime.

**How to apply:** Every pipeline-setup worker prompt I write must contain this scope item. Same applies if a future new category gets added to the system beyond the 17 already in place.
