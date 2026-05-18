# Bulk batch 016 — cooking — report

**Date:** 2026-05-18
**Category:** cooking
**Status:** 40/40 PUBLISHED

## Composition

| Group | Recipes | Count |
|---|---|---|
| American mains | pulled-pork, mississippi-pot-roast, beef-chili, american-pot-roast, chicken-and-dumplings, chicken-pot-pie, chicken-rice-casserole, king-ranch-chicken, southern-fried-chicken, salisbury-steak, sloppy-joe, stuffed-bell-peppers | 12 |
| American sandwiches & rolls | cheeseburger, blt-sandwich, club-sandwich, french-dip, lobster-roll, patty-melt, reuben-sandwich, monte-cristo-sandwich | 8 |
| American BBQ | bbq-pork-ribs | 1 |
| American breakfasts | buttermilk-pancakes, hash-browns, eggs-benedict, eggs-royale, french-toast, waffles, breakfast-burrito, biscuits-and-gravy, huevos-rancheros | 9 |
| American sides & salads | american-cornbread, coleslaw, macaroni-and-cheese | 3 |
| American stews & shrimp | beef-stroganoff, chicken-gumbo, jambalaya, shrimp-and-grits, chicken-and-waffles | 5 |
| American meatloaf | american-meatloaf | 1 |
| French-inspired US | grilled-cheese | 1 |

**Difficulty split:** 35 BEGINNER, 5 INTERMEDIATE (lobster-roll, french-dip, chicken-and-waffles, southern-fried-chicken, eggs-benedict)

## Upload run summary

Four upload runs required. 40/40 PUBLISHED on final run.

| Run | Created | Updated | Failed |
|---|---|---|---|
| 1 | — | — | ~36 |
| 2 | — | — | ~20 |
| 3 | 5 | 22 | 13 |
| 4 | 8 | 31 | 1 |
| Manual (stuffed-bell-peppers) | 1 | 0 | 0 |

## Voice-check issues

**Em-dash violations (14 files affected):**
All occurrences were double em-dash pairs used as parenthetical asides. Fixed by replacing with parentheses or restructuring. Max 1 em-dash per paragraph.

Em-dashes appeared in:
- `sourceNotes` (3 files): biscuits-and-gravy, breakfast-burrito, cheeseburger
- Body intro paragraphs (5 files): sloppy-joe, lobster-roll, french-dip, chicken-and-waffles, pulled-pork
- "Where this dish lives" (7 files): various

**Banned phrases (2 files):**
- `genuinely` → removed (mississippi-pot-roast, chicken-and-waffles)
- McDonald's / Taco Bell brand references → replaced with "fast-food chains" (breakfast-burrito, chicken-and-waffles)

**Servings-yield conflicts (3 files):**
- hash-browns (servings: 2, yieldDescription: "4 patties") → set servings to null
- waffles (servings: 4, yieldDescription: "8 waffles") → set servings to null
- stuffed-bell-peppers (servings: 4, yieldDescription: "4 stuffed peppers") → set servings to null

## Ingredient slug corrections

| Used in JSON | Correct DB slug | Files affected |
|---|---|---|
| `apple-cider-vinegar` | `cider-vinegar` | pulled-pork |
| `stock-pork` | `stock-chicken` | pulled-pork |
| `paprika` | `paprika-smoked` or `paprika-sweet` | pulled-pork, bbq-pork-ribs, chicken-gumbo, jambalaya, beef-chili, chicken-and-waffles, chicken-rice-casserole, stuffed-bell-peppers, southern-fried-chicken |
| `hot-sauce` | `louisiana-hot-sauce` | chicken-and-waffles, shrimp-and-grits |
| `flour-tortilla` | `tortilla-wrap` | breakfast-burrito |
| `red-pepper` | `pepper-red` | king-ranch-chicken, stuffed-bell-peppers, beef-chili |
| `green-pepper` | `pepper-green` | chicken-gumbo, jambalaya |
| `breadcrumbs` | `breadcrumbs-dried` | american-meatloaf, macaroni-and-cheese |
| `fine-cornmeal` | `polenta` | american-cornbread, shrimp-and-grits |
| `dried-yeast` | `yeast-fast-action` | waffles |
| `dried-oregano` | `oregano-dried` | chicken-gumbo, jambalaya, beef-chili |
| `dried-dill` | `dill` | mississippi-pot-roast |
| `dried-parsley` | `parsley-flat` | mississippi-pot-roast |
| `neutral-oil` | `vegetable-oil` | chicken-gumbo |

**New ingredients added to master table and seeded (3):**
- `bbq-sauce` — needed by bbq-pork-ribs
- `salsa` — needed by huevos-rancheros
- `pepperoncini` — needed by mississippi-pot-roast

## Tool slug corrections

| Used in JSON | Correct DB slug | Files affected |
|---|---|---|
| `cast-iron-casserole` | `dutch-oven` | american-pot-roast, mississippi-pot-roast, pulled-pork |
| `kitchen-thermometer` | `instant-read-thermometer` | chicken-and-waffles, pulled-pork, southern-fried-chicken |
| `pie-dish-23cm` | `pie-dish` | chicken-pot-pie |
| `baking-dish` | `rectangular-baking-tin` | chicken-rice-casserole, king-ranch-chicken, macaroni-and-cheese, stuffed-bell-peppers |

## Schema corrections

**Season enum (5 files):**
Used lowercase strings ("winter", "summer") — must be UPPERCASE Prisma enum values.
- `"winter"` → `"WINTER"`: american-pot-roast, chicken-and-dumplings
- `"summer"` → `"SUMMER"`: bbq-pork-ribs, coleslaw, stuffed-bell-peppers

## Patterns to log in common-issues.md

1. **Season enum must be UPPERCASE** — SPRING, SUMMER, AUTUMN, WINTER, YEAR_ROUND
2. **`baking-dish` not a valid tool slug** — use `rectangular-baking-tin`
3. **`kitchen-thermometer` not a valid tool slug** — use `instant-read-thermometer`
4. **`cast-iron-casserole` not a valid tool slug** — use `dutch-oven`
