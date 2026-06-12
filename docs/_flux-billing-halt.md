# fal.ai billing halt

**Stopped at:** 2026-06-12T20:40:12.581Z
**Script:** `fixup-hero-fill`
**Progress:** 34 / 39 processed; **5 remaining this run**
**Backlog (PUBLISHED with no hero):** 17
**Estimated top-up to finish:** £0.10 (£0.0024 per image, assumes 30 % Flux gap)

## What happened

fal.ai returned HTTP 403 with a billing-related response:

```
{"detail": "User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing."}
```

## What to do

1. Top up at https://fal.ai/dashboard/billing (£0.10 suggested)
2. Tutorials that still need a hero stay with `heroMediaId = null`. The next autopilot batch picks them up automatically when Flux is healthy.
3. (Optional) Re-run `fixup-hero-fill` immediately — the script is idempotent
4. Delete this file once recovered

## Context

- **unsplash:** 0
- **pexels:** 33
- **wikimedia:** 1
- **pixabay:** 0
- **flux-schnell:** 0
- **failed:** 0
- **error:** 0

