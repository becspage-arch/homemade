---
name: feedback_match_sibling_ui
description: "When a customer feature already exists for another category, MATCH it exactly by default; if diverging, the worker must ASK first — don't invent a new design"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1cc3ab43-43c7-4006-b396-ba7c9e0cb8ab
---

When building a customer-facing feature that already exists for another category (e.g. needlework
create-your-own when cross-stitch already has "Design your own"), the DEFAULT is to match the existing
one **exactly** — the button and its placement, the premium/upgrade popup, the page layout and rendering,
the flow. Point the worker at the reference page/component in the prompt and say "match this."

If there's a genuine reason to build it differently, the worker must **ASK Rebecca "match the existing
pattern, or different?"** rather than inventing a new design and shipping it.

**Why:** Step 3 (needlework create-your-own) built the pages differently from cross-stitch, and Rebecca
had to send it back to look at the cross-stitch "Design your own" page and match it — an avoidable
round-trip. Prompts that reuse an engine must also say the customer-facing PAGES match the sibling
category, not just the engine underneath. Relates to [[feedback_studio_renderer_patterns]] and the
reuse-engines-not-scripts steer.
