# Content rebuild scope — 2026-06-15

Input for the rebuild worker(s). This worker (`phase_qc_block_reason_001`) did
NOT rebuild anything — it audited every PUBLISHED tutorial, wired the
completeness gate into the publish path, and un-published the confirmed-broken
rows (status -> DRAFT, `qcBlockReason` set, `publishedAt` + slug preserved).
The rows still exist; they need their real instructions authored.

## Root cause

1,765 of the 1,884 broken rows carry the literal placeholder
`Step-by-step instructions for <Title> go here.` — the scaffold that
`qc-fix.ts`'s `ensureMinimalMethod()` injects when a body has no detectable
Method section. That scaffold then shipped live. The remaining failures are
pattern skeletons with no row/round instructions (380), leaked `NaN` (74),
broken foundation chains (71), and leaked `undefined` (35). Many rows carry
more than one of these.

The fix going forward: the completeness gate now blocks any of these from
publishing (held at DRAFT with `qcBlockReason`). The rebuild is authoring the
real method / rows the scaffold stood in for.

## Per-category scope

Bulk size assumption: ~40 tutorials per autopilot batch (the established
animals / pottery / knitting bulk size). "Sessions" = ceil(broken / 40); it is
a batch count, not a time estimate.

| Priority | Category | Published | Broken | % broken | ~Batches |
|---:|---|---:|---:|---:|---:|
| 1 | crochet | 1187 | 709 | 59.7% | 18 |
| 2 | home-repair | 585 | 366 | 62.6% | 10 |
| 3 | knitting | 282 | 172 | 61.0% | 5 |
| 4 | animals-smallholding | 563 | 167 | 29.7% | 5 |
| 5 | garden | 124 | 99 | 79.8% | 3 |
| 6 | paper-word | 546 | 106 | 19.4% | 3 |
| 7 | sustainability | 608 | 88 | 14.5% | 3 |
| 8 | wood-natural-craft | 352 | 66 | 18.8% | 2 |
| 9 | fibre-arts | 556 | 47 | 8.5% | 2 |
| 10 | cross-stitch | 54 | 25 | 46.3% | 1 |
| 11 | pottery-ceramics | 440 | 21 | 4.8% | 1 |
| 12 | baking | 1009 | 17 | 1.7% | 1 |
| 13 | needlework | 190 | 1 | 0.5% | 1 |
| — | **Total** | **9410** | **1884** | **20.0%** | **~47** |

cooking, mindset, natural-home, herbal-medicine: 0 broken — clean, no rebuild.

## Recommended rebuild order (user impact x scope)

1. **crochet + knitting (patterns first).** Pattern-led categories where a
   broken pattern is the most visible failure (a user cannot make it). Largest
   absolute count and the original diagnosis. The chartless-pattern worklist
   (`pattern-chart-backfill-queue.json`) overlaps here.
2. **garden.** Highest %-broken (80%); small absolute (99). Quick to clear and
   restores category integrity for relaunch. Almost all are GROWING_GUIDE
   bodies whose Method section is the scaffold.
3. **home-repair + animals-smallholding.** Large absolute counts (366 / 167) of
   high-utility how-to content; the scaffold replaced real step lists.
4. **paper-word, sustainability, wood-natural-craft, fibre-arts.** Mid-volume
   craft how-tos.
5. **cross-stitch, pottery-ceramics, baking, needlework.** Small tails; fold
   into the relevant category's next bulk.

## How a rebuild worker picks up the list

- Per-slug failures: `packages/db/docs/content-completeness-report-2026-06-15.json`
  (`items[]` has slug + category + type + reasons + rules).
- Live blocked backlog (refreshed every autopilot preflight):
  `packages/db/docs/completeness-blocked-queue.json`.
- All rows are DRAFT with `Tutorial.qcBlockReason` set; slugs unchanged so the
  re-published URL is stable.
- Re-publishing a rebuilt row goes through the normal `uploadTutorial`
  `--status PUBLISHED` path; the completeness gate now re-checks it, so a row
  only goes live once it is actually complete.

## Out of scope (deferred, do NOT act on here)

- **Image / hero work.** 109 garbage anchored-img2img heroes + the broader hero
  strategy are a separate fresh-eyes session. No `heroMediaId` was touched.
- **Bad chart data underneath patterns.** A pattern may have a chart whose data
  is wrong; this gate only checks the written instructions, not chart
  correctness. Separate fix.
