---
name: Pipeline-setup workers must include technique annotation
description: When writing a pipeline-setup worker prompt for a new category, scope-in must include author-prompt population of Tutorial.techniqueSlugs + criticalTechniques + aliases. Otherwise that category ships without technique linking.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---
When I write a pipeline-setup worker prompt for any of the four categories that don't yet have pipeline infrastructure — **animals-smallholding, home-repair, natural-home, sustainability** — the Scope-in section MUST include a line that says the new category's author prompt populates the technique-linking fields:

> Author prompt populates `Tutorial.techniqueSlugs` (every technique slug the tutorial references) and `Tutorial.criticalTechniques` (subset that are load-bearing). For technique-type tutorials in this category, the author prompt also populates `Tutorial.aliases` (search aliases for the reverse-sweep Inngest function). Follow the existing pattern in cooking and baking author prompts under apps/web/src/lib/author/.

**Why:** Worker C (2026-05-18) updated technique-annotation in the author prompts of 13 categories — every category that already had pipeline infrastructure at that point. The 4 categories without pipeline infrastructure will inherit the universal schema + renderer + editor mark + reverse-sweep automatically, but their author prompts don't exist yet, so they have to be written correctly from the start. If we forget, we'd need a retroactive pass to add technique annotation to whatever they author in the meantime.

**How to apply:** Every pipeline-setup worker prompt I write must contain this scope item. Same applies if a future new category gets added to the system beyond the 17 already in place.
