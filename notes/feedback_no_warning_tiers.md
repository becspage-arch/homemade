---
name: no-warning-tiers
description: "Voice-check and other QC scripts must use binary rules (block or skip); no warning tier that needs human review, because there is no one to review it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 469fdc14-ecef-4ade-8083-66a7ac6fb146
---

When proposing a new voice-check rule or any other automated QC check, the rule is either a hard error (blocks upload) or it doesn't fire at all. No warning tier that surfaces things for Rebecca to review.

**Why:** Rebecca said directly (2026-05-25): "Who is watching the warnings? I won't be. We don't have any other staff. This needs to be hands off." Warnings tiers assume someone triages them. Homemade has Rebecca + Claude only; warnings get lost.

**How to apply:**
- New voice-check rules land as errors, never warnings. Calibrate the threshold by running against current passing tutorials so the rule doesn't fire on legitimate content.
- Don't propose "warn-only initially, promote to error after N weeks". She won't watch the warning period. Pick the right threshold up front.
- The existing voice-check warnings tier is legacy noise; over time we should review whether to promote individual warnings to errors or drop them.
- Same principle applies to other automated checks (lint, image audit, schema audit): the script either blocks or stays out of the way. Don't invent a category that requires Rebecca to triage findings she didn't ask for.
