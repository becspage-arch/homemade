# Fibre arts bulk-007 — batch report

**Date:** 2026-05-29
**Session:** autopilot-queue (primary autopilot routine)
**Model:** Claude Sonnet 4.6 (orchestration + retries). 5 parallel authoring sub-agents (model=sonnet) wrote the briefs; main session handled upload, voice-check triage, and grade-level rewriting.
**Entries published:** 40
**Category count after:** Fibre arts 215 → 255 (target 800, now 32%)

---

## Sub-category spread

| Sub-category   | Count | Entries |
|----------------|-------|---------|
| Felting        | 10    | wet-felted-phone-case, needle-felted-portrait, multi-layer-nuno-felt-colour-blending, felted-wool-cord, wet-felted-basket-tray, pre-felt-collage-sampler, needle-felted-christmas-ornament, wet-felted-lampshade-cover, reverse-felting-cut-out-design, wet-felted-flower-pin |
| Spinning       | 10    | spinning-angora-fibre, corespinning-with-wire, wheel-tension-and-take-up-guide, spinning-gradient-from-batt, spinning-bamboo-fibre, spinning-mixed-raw-fleece, spinning-bulky-weight-on-wheel, drum-carder-striped-batt, respinning-commercial-yarn, making-a-test-skein |
| Weaving        | 8     | warp-painting-before-weaving, shadow-weave-rigid-heddle, double-weave-floor-loom-pocket, summer-and-winter-weave-four-shaft, weaving-with-handspun-yarn, clasped-warp-colour-gradients, four-shaft-networked-twill, backstrap-loom-plain-weave-band |
| Natural dyeing | 7     | dyeing-with-st-johns-wort, fermentation-vat-for-woad, exhaust-bath-layered-dyeing, dyeing-with-heather, dyeing-with-lichen, clay-ochre-mordanting, dyeing-cotton-with-alum-acetate |
| Macramé        | 3     | macrame-owl-wall-hanging, macrame-sunburst-wall-art, macrame-rainbow-wall-hanging |
| Rug-making     | 2     | hooked-rug-floral-pattern, scandinavian-rya-rug-sample |

**Types:** PATTERN ×11, TECHNIQUE ×27, READING ×2
**Difficulty:** BEGINNER ×10, INTERMEDIATE ×24, ADVANCED ×6

Sub-category spread vs target (target % | bulk-007 contribution % | running cumulative % at 255):
- Felting: 30% | 25% | 30.6%
- Spinning: 20% | 25% | 18.8%
- Weaving: 20% | 20% | 19.6%
- Natural dyeing: 15% | 17.5% | 15.3%
- Macramé: 10% | 7.5% | 10.2%
- Rug-making: 5% | 5% | 5.5%

Drift: cumulative is well-balanced against targets. Felting slightly over (30.6% vs 30%), spinning slightly under (18.8% vs 20%). Next batch: bias slightly toward spinning and weaving, hold felting back.

---

## Voice-check results

| Errors on first pass   | 23 files blocked |
| Final errors           | 0                |
| Warnings               | 0 (1 tricolon fixed) |

**First-pass failures:**
- 4 em-dashes in excerpt/body text (3 files) — fixed directly via Edit
- 19 grade-level errors (FK > 12.0) across 19 files — all from long multi-clause sentences (35–60 words). Fixed by 3 parallel rewrite agents splitting compound sentences into short declaratives
- After that round: 10 remaining grade-level errors — fixed by further direct sentence splitting
- 1 tricolon warning in dyeing-with-lichen — fixed by reducing three parallel species names to two

All 40 entries passed voice-check exit 0 before upload.

---

## Upload sweep

- First pass: 17/40 uploaded cleanly
- Path issue (first retry): relative path was resolving to `packages/db/docs/...` — switched to absolute paths
- Second pass: 13/23 uploaded; 10 remained blocked with new grade-level errors in paragraphs not caught by prior agents
- Final pass: 10/10 uploaded after targeted sentence-splitting edits
- **0 final drops**

---

## Anti-tells confirmed

No new anti-tells surfaced. Existing grade-level rule caught all issues correctly. The pattern of long multi-clause sentences (relative clauses stacked with semicolons) recurred — consistent with previous batches. Already captured in authoring guidance.

---

## Notes

- **weavingDraft node** present in summer-and-winter-weave-four-shaft — the public renderer handles this node type; confirmed present in the uploaded entry.
- **Chain counter:** 7 consecutive autopilot batches on fibre-arts since last human commit. Hard cap is 10.
- QC sweep (post-publish, --since 2 hours ago): 83 candidates, 83 passed, 0 still-blocked.
- Hero-fill: ran cleanly, 0 images generated (existing coverage sufficient).
