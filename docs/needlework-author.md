# Needlework authoring (category index)

Updated 2026-06-09 by phase_needlework_pipeline_setup_001. The single
multi-discipline prompt that existed before this date covered an older
taxonomy (cross-stitch, needlepoint, tatting, lacemaking) and is
superseded.

The needlework category now has 10 disciplines, each with its own master
author prompt. The autopilot routine picks a sub-category from the
enabled set and loads the matching `docs/needlework-<sub-cat-slug>-author.md`
file as the master prompt for the batch.

## Disciplines and prompts

| Sub-cat slug | Discipline | Studio archetype | Author prompt | Autopilot |
|---|---|---|---|---|
| `foundations` | Cross-cutting techniques | Tutorials only | [needlework-foundations-author.md](needlework-foundations-author.md) | ENABLED |
| `surface-embroidery` | Surface embroidery, crewel, redwork, whitework | Surface vector | [needlework-surface-embroidery-author.md](needlework-surface-embroidery-author.md) | ENABLED |
| `blackwork` | Blackwork | Counted grid | [needlework-blackwork-author.md](needlework-blackwork-author.md) | ENABLED |
| `sashiko` | Sashiko | Counted / route | [needlework-sashiko-author.md](needlework-sashiko-author.md) | ENABLED |
| `candlewicking` | Candlewicking | Surface vector | [needlework-candlewicking-author.md](needlework-candlewicking-author.md) | ENABLED |
| `hardanger` | Hardanger | Counted grid | [needlework-hardanger-author.md](needlework-hardanger-author.md) | ENABLED |
| `needlepoint` | Needlepoint | Counted grid | [needlework-needlepoint-author.md](needlework-needlepoint-author.md) | ENABLED |
| `goldwork` | Goldwork | Surface vector | [needlework-goldwork-author.md](needlework-goldwork-author.md) | SPECIALIST STUB |
| `ribbon-embroidery` | Ribbon embroidery | Surface vector | [needlework-ribbon-embroidery-author.md](needlework-ribbon-embroidery-author.md) | SPECIALIST STUB |
| `stumpwork` | Stumpwork | Surface vector | [needlework-stumpwork-author.md](needlework-stumpwork-author.md) | SPECIALIST STUB |

Seven disciplines are enabled for autopilot authoring. Three (goldwork,
ribbon-embroidery, stumpwork) are stubs that explain why a dedicated
specialist-curation worker is needed before autopilot fires against
them. Their `SubCategory.autopilotEnabled` rows are set to false; the
autopilot routine skips them when picking a sub-cat target.

## How the autopilot routine uses this

When the round-robin queue picks needlework as the target category, the
routine:

1. Reads `SubCategory.autopilotEnabled = true AND categoryId =
   <needlework>`.
2. Picks one enabled sub-cat. The pick strategy is round-robin within
   the category (least-recently-authored sub-cat first), broken by
   ordering on `SubCategory.order`.
3. Loads `docs/needlework-<sub-cat-slug>-author.md` as the master
   prompt for the batch.
4. Runs the batch as it does for any other category.

Each per-discipline prompt is self-contained. The brief author and
worker session do not need to read this index; the autopilot routine
resolves the right file.

## Voice spec

All 10 prompts reference `docs/voice-spec-2026-05-21.md` §3.4 (craft
technique) and §3.5 (craft project), plus
`docs/voice-spec-quick-reference.md` 10-point self-critique in §5.

## Image policy

NEVER generate images in the authoring path. The dedicated image worker
sources hero imagery from public-domain archives per
`feedback_image_strategy.md`. Each per-discipline prompt restates this.

## Category-level pipeline-setup standards

Populated by phase_needlework_pipeline_setup_001:

- `Category.needlework.targetTutorialCount = 4000`. The honest upper
  bound across all 10 disciplines at maturity.
- `Category.needlework.techniqueSlugs[]`: every technique referenced
  across the 10 author prompts, consolidated.
- `Category.needlework.criticalTechniques[]`: the must-know
  prerequisites.
- `Category.needlework.aliases[]`: search synonyms used by the
  cross-category sweep.

See `packages/db/scripts/flip-needlework-ready.ts` for the exact values
seeded at READY flip.

## Status

`Category.needlework.pipelineStatus = READY`. The category is in the
autopilot rotation. Per the null-sort rule (NULLS FIRST on
`lastAutopilotRunAt`), it joins the back of the rotation at the next
fire and waits its turn.

## See also

- `docs/voice-spec-2026-05-21.md` §3.4, §3.5.
- `docs/voice-spec-quick-reference.md`.
- `feedback_homemade_voice.md`.
- `feedback_image_strategy.md`.
- `docs/needlework-anti-tells.md` for needlework-specific anti-tells.
- `docs/common-issues.md` for cross-category recurring patterns.
