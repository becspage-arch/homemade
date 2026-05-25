# Image relevance project — hand-off

**Session date:** 2026-05-25

## What's live on the site right now

| | Count | Share |
|---|---:|---:|
| **PUBLISHED tutorials** | **3,535** | 100% |
| REAL_PHOTO heroes | 1,399 | 40% |
| AI_GENERATED heroes | 2,133 | 60% |
| PROCEDURAL_CARD | **0** | **0%** |
| UNSET (no hero attached) | 3 | <1% |

Zero procedural cards on the site. Every PUBLISHED tutorial now shows
either a real stock photo or an AI-generated image.

## The remaining quality issue: mindset content

A pass-3 audit scored 2,307 of the heroes for subject match. Result:

| Tier | Count | Share |
|---|---:|---:|
| EXACT (confirmed correct) | 537 | 23% |
| PARTIAL (right class, not specific) | 1,024 | 44% |
| WRONG (different subject) | 746 | 32% |

The headline number masks the real picture: **mindset content drives
the bulk of the non-EXACT verdicts.** When Flux Schnell generates a
hero for a mindset title (affirmation, tapping exercise, journal
prompt, visualisation), it produces the same template — "open book
or journal + lit candle + soft linen". Same image for "I am an
investor", "Tapping for money panic", "Body scan for sleep", and
hundreds of others.

The auditing sub-agents disagreed on how to score this:
- Strict reading: WRONG, because the photo doesn't depict the named
  practice (e.g. tapping should show fingertips on collarbone, not
  a journal scene)
- Lenient reading: PARTIAL or EXACT, because the imagery is right-
  vibe for mindset content

The strict reading is closer to your "100% correct" rule.

## Why mindset Flux generates templates

The Flux prompt builder in
[apps/web/src/lib/image-sourcing/flux-schnell.ts](../apps/web/src/lib/image-sourcing/flux-schnell.ts)
uses a generic mindset template:

```
Quiet contemplative still life. {title} concept. Cream and sage palette.
Single candle, open notebook, or hands in soft light as appropriate.
No faces. Magazine-quality editorial photography. Natural soft light,
linen textures, slow-living atmosphere.
```

The `{title}` interpolation is the only subject-specific signal, and
Flux Schnell (the 4-step model) doesn't have enough capacity to
interpret abstract phrases like "I am an investor" into a literal
scene. It defaults to the props it knows (candle, book, linen).

## Recommended fix (next session)

Rewrite the mindset Flux prompt builder to inject practice-specific
visual cues per sub-category:

| Sub-category | Visual cue to add to the prompt |
|---|---|
| `tapping` | "fingertips resting on collarbone" or "fingertips on side of hand (karate-chop point)" |
| `embodiment` | "person seated cross-legged, palms on knees" |
| `ritual` | "candle and small altar with offerings (no faces)" |
| `spell` | "herbs, salt, written intention on parchment" |
| `energy-statement` / `affirmation` | "morning light through window, hand holding the spoken card" |
| `journal-prompt` | "open journal mid-write, pen visible, real handwriting" |
| `visualisation` | "person walking into a soft-light interior, viewed from behind" |
| `meditation` / `breath-work` | "still figure in window light, eyes closed" |
| `reading` (reference articles) | "stack of pertinent reference texts" |

After this change, re-run rescue-procedural-via-flux + the pass-3
audit. Mindset entries should land EXACT instead of PARTIAL/WRONG.

## What the autopilot does for new tutorials

The relevance gate documented in
[docs/relevance-gate-autopilot.md](relevance-gate-autopilot.md) is
wired into `fixup-hero-fill.ts` via the new `--emit-relevance-queue`
flag. Per-batch sequence:

1. New tutorials publish as DRAFT-then-PUBLISHED via the normal
   author flow. No hero yet.
2. `fixup-hero-fill --emit-relevance-queue PATH` attaches a hero
   for each new tutorial AND writes a queue manifest with the cached
   image bytes.
3. The autopilot worker scores each entry inline against its embedded
   `promptHints`, writes verdicts JSON.
4. `apply-relevance-verdicts.ts` re-sources every non-EXACT entry via
   the (Pixabay-free) orchestrator chain, looping until EXACT or
   capped to Flux.

## Flux billing — automatic notification

When fal.ai balance is exhausted, the scripts now:

1. Create a **SYSTEM `Notification` row** for `rebecca@homemade.education`.
   The existing notify() pipeline fires a **push notification to her
   phone** and surfaces a banner in `/admin`. No file-checking needed.
2. The notification body includes the current backlog count and an
   estimated top-up cost (£0.0024 × 30 % of backlog).
3. The script continues in **skip-Flux mode** for the rest of the
   batch. Tutorials that would have needed Flux stay UNSET (not
   stamped PROCEDURAL_CARD). They get **auto-backfilled** on the
   next batch when balance is healthy — `fixup-hero-fill.ts` already
   queries on `heroMediaId IS NULL`.
4. A halt-signal file at `docs/_flux-billing-halt.md` belt-and-braces
   surfaces the same details on the filesystem.

The `rescue-procedural-via-flux.ts` script is the exception: every
entry there needs Flux, so it still exits on billing failure (after
creating the notification).

## Cost guide

| Action | Estimated Flux calls | Estimated £ |
|---|---:|---:|
| Per new tutorial via autopilot | ~0.3 | ~£0.001 |
| Per 1,000 new tutorials | ~300 | ~£0.72 |
| £10 of credit | ~4,000 images | covers ~4k new tutorials |

The 30 % rate is what the 2026-05-25 audit observed after Pixabay was
dropped from the orchestrator.

## Manual checks

```bash
# Check fal.ai balance (one tiny Flux call)
pnpm --filter @homemade/db exec tsx scripts/check-fal-balance.ts

# Count hero strategy distribution
pnpm --filter @homemade/db exec tsx scripts/_audit-hero-strategy.ts

# Image verification status distribution
pnpm --filter @homemade/db exec tsx scripts/audit-recent-state.ts
```

## What's saved (not applied)

`docs/image-relevance-verdicts-pass3.json` holds the 2,307 verdicts
from the pass-3 audit. **I deliberately did not run
apply-relevance-verdicts.ts on this file** — re-sourcing the
mindset entries would just generate more template images from Flux
and waste credit. The next session should:

1. Fix the mindset Flux prompts (see table above)
2. Re-run rescue-procedural-via-flux for the affected entries
3. Re-audit those entries
4. Then optionally apply the pass-3 verdicts for the non-mindset
   tail (~186 WRONG outside mindset)

## Session counters

- Flux calls this session: ~1,000 (rescue + UNSET fill, used ~£2.50)
- Sub-agent audit batches: 4 pass-3 waves of 8-13 = 29 chunks × 80 entries
- Verdict files merged: 30
- Commits to main: 7
- Deploys verified: 7
