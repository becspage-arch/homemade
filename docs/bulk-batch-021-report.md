# Bulk batch 021 — North African

**Date:** 2026-05-18  
**Stream:** cooking (autopilot-queue, parallel burner)  
**Status:** 40 PUBLISHED, 0 dropped  
**Cooking count:** 806 → 838 (+32 net new; 8 already existed from prior batches)

## Slice

North African cuisine — Moroccan × 17, Tunisian × 12, Egyptian × 11.

**Moroccan:** lamb-tagine-prunes-almonds, lamb-tagine-apricot, chicken-tagine-preserved-lemon-olives, chicken-tagine-figs, fish-tagine-chermoula, vegetable-tagine-moroccan, kefta-tagine, kefta-skewers, couscous-royale, couscous-chicken-chickpeas, moroccan-carrot-salad, zaalouk, taktouka, chermoula, ras-el-hanout, khobz, msemen, baghrir, mrouzia, bissara

**Tunisian:** brik, harissa-paste, lablabi, ojja-merguez, merguez-sausages, tunisian-fish-couscous, kefteji, tunisian-tajine, mechouia-salad, chakchouka-tunisienne

**Egyptian:** ta-ameya, molokhia-chicken, hawawshi, mahshi-cromb, bessara-egyptian, roz-bi-laban, ful-nabed, mahshi-felfel, om-ali, dukkah

## Voice-check fixes

- **Em-dash pairs (15 files):** parenthetical asides using `— X —` pattern, converted to `(X)` or rephrased with commas. Files: bessara-egyptian, brik, chicken-tagine-preserved-lemon-olives, couscous-chicken-chickpeas, ful-nabed, kefta-tagine, mahshi-cromb, mahshi-felfel, mechouia-salad, molokhia-chicken, moroccan-carrot-salad, ojja-merguez, om-ali, roz-bi-laban, tunisian-fish-couscous.
- **Banned phrase "genuinely" (2 files):** bessara-egyptian (last paragraph), chicken-tagine-preserved-lemon-olives (last paragraph).

## Ingredient fixes

8 wrong slug names fixed globally across all brief files:

| Used in briefs | Correct slug |
|---|---|
| `coriander-fresh` | `coriander` |
| `paprika` | `paprika-sweet` |
| `red-pepper` | `pepper-red` |
| `savoy-cabbage` | `cabbage-savoy` |
| `instant-yeast` | `yeast-dried` |
| `tinned-tuna` | `tuna-tinned` |
| `sugar` | `granulated-sugar` |
| `cardamom-ground` | (new — added to master) |

## New ingredient master entries (4)

- `dried-split-fava-beans` — pulse; for Egyptian ta'ameya, bessara, bissara, ful nabed
- `short-grain-rice` — grain; pudding rice / Egyptian rice; for mahshi and roz bi laban
- `dill-fresh` — herb; for Egyptian bessara
- `cardamom-ground` — spice; ground from green cardamom; for North African sweets and spice blends

## Notes

- The 8 already-existing entries (kefta-skewers, zaalouk, kefta-tagine, moroccan-carrot-salad, and 4 others) were UPDATED not CREATED — consistent with the idempotent upload pattern.
- Two upload passes needed: first pass (DRAFT) caught the slug errors; second pass (PUBLISHED) confirmed 40/40 clean.
- `ras-el-hanout` and `chermoula` marked `foundational: true` per convention for condiment/base recipes.
