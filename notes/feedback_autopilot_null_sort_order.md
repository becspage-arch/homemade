---
name: autopilot-null-sort-puts-new-categories-last
description: "Newly-READY categories with lastAutopilotRunAt = null sit at the BACK of the autopilot pick queue, not the front. Backdate to bump forward."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c06727de-bc2e-4a18-bba4-539447d65bce
---

When a category flips from NOT_READY to READY, it has
`lastAutopilotRunAt = null` and will be picked LAST by the
autopilot, not first. Prisma's `orderBy: { lastAutopilotRunAt:
'asc' }` follows Postgres semantics where NULLS sort LAST in
ascending order. So a never-fired category lands at the tail of the
queue, behind every category that's ever cycled.

**Why:** Cross-stitch shipped READY on 2026-06-08 and went to
position 12 of 12 in the queue. The next pick was
wood-natural-craft (last fired 2026-05-29); cross-stitch fires only
after all 11 other READY categories cycle through. Surfaced in the
cross-stitch pipeline-setup hand-off.

**How to apply:** If a freshly-flipped category should run first
(anchor batch, urgent pilot), backdate `lastAutopilotRunAt` to
something OLDER than the current oldest non-null value in the
queue. One-line update via `prisma.category.update` setting
`lastAutopilotRunAt` to e.g. `2026-01-01`. If it should cycle
naturally, leave it null and let it wait its turn (roughly
`n_ready * fire_interval` until first fire).

The picker scripts at `packages/db/scripts/autopilot-pick-category.ts`
and `_autopilot-pick.ts` both use the same ordering, so the
behaviour is consistent across the manual and cron paths.
