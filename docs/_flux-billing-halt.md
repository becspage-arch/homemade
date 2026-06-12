# fal.ai billing halt

**Stopped at:** 2026-06-12T14:28:40.914Z
**Script:** `fixup-hero-fill`
**Progress:** 10 / 41 processed; **31 remaining this run**
**Backlog (PUBLISHED with no hero):** 381
**Estimated top-up to finish:** £0.28 (£0.0024 per image, assumes 30 % Flux gap)

## What happened

fal.ai returned HTTP 403 with a billing-related response:

```
{"detail": "User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing."}
```

## What to do

1. Top up at https://fal.ai/dashboard/billing (£0.28 suggested)
2. Tutorials that still need a hero stay with `heroMediaId = null`. The next autopilot batch picks them up automatically when Flux is healthy.
3. (Optional) Re-run `fixup-hero-fill` immediately — the script is idempotent
4. Delete this file once recovered

## Context

- **unsplash:** 0
- **pexels:** 10
- **wikimedia:** 0
- **pixabay:** 0
- **flux-schnell:** 0
- **failed:** 0
- **error:** 0

