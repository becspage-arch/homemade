---
name: feedback_glossary_tooltip_termslug
description: glossaryTooltip mark attrs must use termSlug not slug — voice-check will report all terms as unused otherwise
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 603af476-896d-4d6c-8ca5-10adf6cf3bec
---

Use `"attrs": { "termSlug": "slug-here" }` inside every `glossaryTooltip` mark, never `"attrs": { "slug": "slug-here" }`.

**Why:** `voice-check-lib.ts` reads `mark.attrs.termSlug` to build the set of used slugs. If the key is `slug` instead of `termSlug`, the checker cannot see any inline usage and reports every registered term as unused (exit code 2, blocks upload). Surfaced in wood-natural-craft bulk-007 where all 40 files were authored with the wrong key and needed a bulk sed fix before upload could proceed.

**How to apply:** When authoring TipTap JSON for any entry, every glossaryTooltip mark must use the `termSlug` key. Correct format confirmed from bulk-003 passing files:
```json
{ "type": "glossaryTooltip", "attrs": { "termSlug": "kuksa" } }
```
If a batch is authored with the wrong key, fix with:
```bash
for f in docs/<batch-dir>/*.json; do
  sed -i 's/"attrs": { "slug": "/"attrs": { "termSlug": "/g' "$f"
done
```
This is also the exact pattern the termSlug check in `voice-check-lib.ts` expects — see `[[feedback_inline_glossary_coverage]]` for the broader coverage rule.
