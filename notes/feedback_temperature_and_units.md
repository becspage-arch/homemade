---
name: Temperature + unit system — conventional °C is canonical
description: Locked rule for how temperature and weight / volume units are stored, written, and rendered across every recipe. Conventional (non-fan) °C is the canonical value; the renderer derives fan / °F / gas mark from it. Same shape for grams / oz, ml / fl oz / cup. Authors write the canonical number; the user's preference picks the display.
type: feedback
originSessionId: optimistic-cori-2069ce
---

Locked 2026-05-15 from the Baking anchor batch review. Surfaced
because Rebecca asked whether the platform handles gas mark / fan
/ °F conversions, and whether the metric / imperial preference
shape covers it. It doesn't yet; this is the locked shape.

## The rule

**Conventional (non-fan) °C is the canonical temperature on every
recipe.** Authors write the conventional number into the schema
column. The renderer derives every other display at read time
from the user's preference.

Same rule for weight + volume: **grams + millilitres are
canonical**. Ounces, fluid ounces, US cups, UK cups all derive at
render time.

**Why:** the audience is global. UK domestic kitchens default to
fan °C; older UK + EU mainland default to conventional °C; US
defaults to °F; gas ovens (still common in the UK) need gas
marks; readers in the US want cups, readers in the UK want
grams. Storing only one canonical value per number per recipe
lets the platform serve every reader from the same row, and lets
the user flip preferences without re-authoring content.

## How to apply when authoring

- **Schema columns:** `Tutorial.temperatureCelsius` (cooking) and
  `Tutorial.bakeTemperatureCelsius` (baking) carry the
  **conventional** value. Not the fan value.
- **Authoring prompt:** the brief or the worker writes the
  conventional number into the column. If the source recipe is
  written in fan terms (most modern UK recipes are), add 20°C
  before writing into the column.
- **`temperatureNote` stays free-text** for the unusual cases —
  "low and slow", "grill setting", "preheat then turn off",
  "drop to 210°C after 10 minutes". When set, it renders
  alongside the derived value, not instead of it.
- **Method prose** can describe the bake however the recipe
  reads best. If the recipe genuinely needs the fan number in
  prose to make sense, write the fan number; the renderer's
  hover tooltip shows the canonical conventional value to
  reconcile.
- **Confectionery + sugar-stage temperatures** in
  `bakeTemperatureCelsius` carry the °C target. Sugar stages
  don't have a gas-mark equivalent; the renderer skips that
  display for confectionery recipes.

## How the renderer applies it

- User preference enums (added by the cross-category audit
  session): `OvenPreference` (`FAN_C` / `CONVENTIONAL_C` /
  `FAHRENHEIT` / `GAS_MARK`), `WeightPreference` (`METRIC` /
  `IMPERIAL`), `VolumePreference` (`METRIC` / `IMPERIAL_UK` /
  `IMPERIAL_US`).
- Conversion table:
  - **Fan**: conventional °C − 20.
  - **°F**: `C × 9/5 + 32`, rounded to nearest 5.
  - **Gas mark**: lookup band — 120 = gas ½, 140 = gas 1, 150 =
    gas 2, 160 = gas 3, 180 = gas 4, 190 = gas 5, 200 = gas 6,
    220 = gas 7, 230 = gas 8, 240 = gas 9. Round to nearest band.
  - **Ounces**: `g × 0.035274`, rounded to one decimal.
  - **Fluid ounces**: `ml × 0.033814`, rounded to one decimal.
  - **UK cup**: `ml ÷ 250`.
  - **US cup**: `ml ÷ 240`.
  - **Tbsp / tsp**: pass through (standardised 15 ml / 5 ml).
- Anonymous users get sensible defaults from `Accept-Language`:
  `en-US` → Fahrenheit + cups (US); `en-GB` → fan °C + grams;
  everywhere else → metric.
- The temperature pill in the info bar always carries a small
  hover showing the canonical conventional °C, regardless of
  what the user has selected, so the reader can sanity-check.

## When the rule binds

- **Every new recipe** authored from this point lands with the
  conventional number in the column.
- **Every existing recipe** gets audited in the cross-category
  content audit session — most current anchors and bulk-batch
  recipes were authored with fan values. Adding 20°C is the
  per-row fix.
- The drafting prompt templates (`docs/tutorial-author.md` v4+
  and `docs/baking-author.md` v1+) need a self-critique item
  checking that the column matches the conventional value.

## What this doesn't change

- The voice-check CLI doesn't enforce this — it can't tell fan
  from conventional from the number alone. It's an authoring
  discipline + the audit session, not a deterministic gate.
- Method prose still names a temperature in whichever way reads
  best for the recipe; the renderer reconciles in the info bar.
- The `temperatureNote` free-text field still carries the
  "preheat then turn off" / "grill setting" oddities.
