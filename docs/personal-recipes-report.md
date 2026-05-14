# Personal recipes ingest — report

Generated 2026-05-14.

Ingested Rebecca's two personal recipe collections from `Downloads\Recipes to Print.docx` and
`Downloads\RECIPES (MASTER).docx` as DRAFT `Tutorial` rows of type `RECIPE`. Every recipe
lands as DRAFT — Rebecca verifies each one before publishing. Her prose is preserved
verbatim; structured metadata (ingredients mapped to master slugs, recipe metadata fields,
tool detection) is layered on top.

## Summary

- **Total recipes ingested:** 189
- **Created:** 188
- **Updated:** 1 (the test upload of `beef-bourguignon` that ran before the batch)
- **Failed:** 0
- **Voice-check clean:** 125
- **Voice-check warnings (not blocking):** 63
- **`--skip-voice-check` used:** 1 — see [Voice-check skips](#voice-check-skips)
- **Total voice-check warnings across all uploads:** 137
- **Master-ingredient additions needed:** 124 unique names, 130 total occurrences (see [Master-list additions needed](#master-list-additions-needed))
- **Slug collisions with existing DB rows:** 0
- **Source files:**
  - `RECIPES (MASTER).docx` — 190 recipes parsed
  - `Recipes to Print.docx` — 30 recipes parsed
  - After dedupe by title: **189 unique recipes**

## Breakdown by meal type

- dinner: 69
- snack: 41
- side: 25
- lunch: 21
- breakfast: 19
- dessert: 11
- drink: 3

## Breakdown by cuisine

- british: 94
- italian: 39
- chinese: 19
- mediterranean: 11
- american: 9
- french: 6
- mexican: 5
- indian: 4
- thai: 1
- japanese: 1

## How to verify in admin

Every row landed as `status = DRAFT`, `type = RECIPE`, `category = cooking`. They appear
at `/admin/tutorials` filtered to draft. Each carries:

- A structured `ingredientsList` block with master-slug references for every mapped ingredient
- An `orderedList` of method steps preserving Rebecca's original prose verbatim
- Derived recipe metadata (servings, prep/cook minutes, cuisine, mealType, mood, freezable,
  batchable, temperature) — conservative defaults where not explicit
- Detected tools mapped to the master `Tool` table (`recipeTools` array)
- Voice-check pass (clean, warnings only, or — for one entry — skipped with logged reason)

Open each in admin, review the ingredients-list mappings, refine metadata where useful,
then flip status to PUBLISHED when happy.

## Voice-check skips

One recipe required the `--skip-voice-check` admin escape hatch:

### `white-chocolate-cardamom-mousse`

**Why skipped:** manually retried with --skip-voice-check after batch failure; word "treats" tripped the medical-claim rule in Rebecca's prose; flagged for her review, not rewritten

**Voice-check errors logged (NOT rewritten — Rebecca's prose):**

- medical-claim: medical claim watchword: "treats" at body > orderedList[3] > listItem[7] > paragraph[0] > text

The word "treats" is a medical-claim watchword in the voice-check rules.
In this recipe it appears in a non-medical sense ("a treat for…" or similar). Rebecca
should decide whether to keep, soften, or edit before publishing.

## Slug collisions

No collisions. All 189 slugs are unique against the existing DB.

## Master-list additions needed

These ingredient names appeared in Rebecca's recipes but had no match in the master
`Ingredient` table. The lines are preserved as free-text in the recipe body (under a
secondary "Also" heading); the rows aren't dropped, they're just not joined to the
`RecipeIngredient` table yet. A separate small session should add the most-common ones
to `packages/db/scripts/data/ingredients.ts` and re-run the briefs to upgrade them.

Top 30 by frequency:

| Count | Ingredient name | Example |
|---|---|---|
| 3 | `italian seasoning` | 1/4 teaspoon Italian seasoning |
| 2 | `large` | ½ large |
| 2 | `baguette` | 1 baguette |
| 2 | `basic risotto` | Basic risotto |
| 2 | `frosting` | Frosting |
| 1 | `ground flax` | 1 tbsp ground flax (optional) |
| 1 | `package active dry yeast` | 1 (.25 ounce) package active dry yeast |
| 1 | `chai spice, see notes` | 3 tsp chai spice, see notes |
| 1 | `graham cracker` | 1 graham cracker, crumbled, gluten-free if needed |
| 1 | `ground flax seeds` | 1/2 tablespoon ground flax seeds |
| 1 | `caesar dressing` | ¼ cup caesar dressing (vegan) |
| 1 | `croissants` | Croissants |
| 1 | `optional croutons` | Optional croutons |
| 1 | `chicory` | 2 heads of chicory |
| 1 | `salad` | Salad |
| 1 | `quesadillas` | Quesadillas |
| 1 | `sunflower` | 1 tbsp sunflower, vegetable oil or melted butter |
| 1 | `/6oz cornish gouda` | 175g/6oz Cornish gouda, grated |
| 1 | `green jalapeno chilli` | 1 green jalapeno chilli, seeds removed, finely chopped |
| 1 | `balsamic glaze for drizzling.` | 1/4 cup Balsamic glaze For drizzling. |
| 1 | `salad leaves` | Salad leaves |
| 1 | `bagels toasted & buttered` | 4 bagels toasted & buttered |
| 1 | `ears corn husked` | 5 ears corn husked (about 3 cups of kernels) |
| 1 | `lamb or higher-welfare pork stewing steak` | 800 g lamb or higher-welfare pork stewing steak , (cubed) |
| 1 | `sirloin steak` | 250g sirloin steak |
| 1 | `online` | 1 medium online, peeled and thinly sliced |
| 1 | `ground cardamon` | Ground cardamon |
| 1 | `dip to serve` | Dip to serve |
| 1 | `boneless` | 2 boneless, skinless chicken breasts, cubed |
| 1 | `massel vegetable liquid stock` | 3 cups (750ml) Massel vegetable liquid stock, heated |

_(124 unique names in total, 130 total occurrences.)_

## Per-recipe entries

Each row links to its brief JSON (in `docs/personal-recipes-briefs/`) for reproducibility.

### BREAKFASTS

- **Apple and Cinnamon Porridge** — [`apple-and-cinnamon-porridge`](personal-recipes-briefs/apple-and-cinnamon-porridge.json) — ✓ voice-check clean; 6 mapped ingredients; tools: small-saucepan
- **Apple Cinnamon Overnight Oats** — [`apple-cinnamon-overnight-oats`](personal-recipes-briefs/apple-cinnamon-overnight-oats.json) — ✓ voice-check clean; 13 mapped ingredients; tools: small-saucepan, whisk-balloon
- **Banana Bread Overnight Oats** — [`banana-bread-overnight-oats`](personal-recipes-briefs/banana-bread-overnight-oats.json) — ✓ voice-check clean; 8 mapped ingredients, 1 unmapped
- **Belgium Waffles** — [`belgium-waffles`](personal-recipes-briefs/belgium-waffles.json) — 1 voice warning; 8 mapped ingredients, 1 unmapped; tools: whisk-balloon
- **Chai Spiced Overnight Oats** — [`chai-spiced-overnight-oats`](personal-recipes-briefs/chai-spiced-overnight-oats.json) — 3 voice warnings; 6 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium, whisk-balloon
- **Chocolate Overnight Oats** — [`chocolate-overnight-oats`](personal-recipes-briefs/chocolate-overnight-oats.json) — 2 voice warnings; 9 mapped ingredients
- **Cinnamon Bun Overnight Oats** — [`cinnamon-bun-overnight-oats`](personal-recipes-briefs/cinnamon-bun-overnight-oats.json) — ✓ voice-check clean; 9 mapped ingredients
- **Peanut Butter Overnight Oats** — [`peanut-butter-overnight-oats`](personal-recipes-briefs/peanut-butter-overnight-oats.json) — ✓ voice-check clean; 4 mapped ingredients
- **Stewed Fruit Compote** — [`stewed-fruit-compote`](personal-recipes-briefs/stewed-fruit-compote.json) — ✓ voice-check clean; 9 mapped ingredients
- **Strawberry Cheesecake Overnight Oats** — [`strawberry-cheesecake-overnight-oats`](personal-recipes-briefs/strawberry-cheesecake-overnight-oats.json) — ✓ voice-check clean; 7 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium, whisk-balloon

### SMOOTHIES

- **Aloha Pineapple Smoothie** — [`aloha-pineapple-smoothie`](personal-recipes-briefs/aloha-pineapple-smoothie.json) — ✓ voice-check clean; 6 mapped ingredients
- **Apple Smoothie with Raspberries** — [`apple-smoothie-with-raspberries`](personal-recipes-briefs/apple-smoothie-with-raspberries.json) — ✓ voice-check clean; 5 mapped ingredients
- **Banana Oatmeal Smoothie** — [`banana-oatmeal-smoothie`](personal-recipes-briefs/banana-oatmeal-smoothie.json) — 2 voice warnings; 4 mapped ingredients
- **Cinnamon Roll Smoothie** — [`cinnamon-roll-smoothie`](personal-recipes-briefs/cinnamon-roll-smoothie.json) — 2 voice warnings; 8 mapped ingredients
- **Mango Strawberry Smoothie** — [`mango-strawberry-smoothie`](personal-recipes-briefs/mango-strawberry-smoothie.json) — ✓ voice-check clean; 13 mapped ingredients
- **Peach Raspberry Smoothie** — [`peach-raspberry-smoothie`](personal-recipes-briefs/peach-raspberry-smoothie.json) — ✓ voice-check clean; 5 mapped ingredients
- **Peanut Butter Banana Smoothie** — [`peanut-butter-banana-smoothie`](personal-recipes-briefs/peanut-butter-banana-smoothie.json) — ✓ voice-check clean; 5 mapped ingredients, 1 unmapped
- **Peanut Butter Oatmeal Smoothie** — [`peanut-butter-oatmeal-smoothie`](personal-recipes-briefs/peanut-butter-oatmeal-smoothie.json) — ✓ voice-check clean; 9 mapped ingredients
- **Strawberry Banana Smoothie** — [`strawberry-banana-smoothie`](personal-recipes-briefs/strawberry-banana-smoothie.json) — ✓ voice-check clean; 5 mapped ingredients

### LUNCHES

- **Avocado Bacon Chicken Salad** — [`avocado-bacon-chicken-salad`](personal-recipes-briefs/avocado-bacon-chicken-salad.json) — ✓ voice-check clean; 7 mapped ingredients, 1 unmapped
- **Baked Croissants** — [`baked-croissants`](personal-recipes-briefs/baked-croissants.json) — ✓ voice-check clean; 7 mapped ingredients, 1 unmapped; tools: oven
- **Best French Toast** — [`best-french-toast`](personal-recipes-briefs/best-french-toast.json) — ✓ voice-check clean; 10 mapped ingredients; tools: whisk-balloon
- **Celeriac and Apple Soup** — [`celeriac-and-apple-soup`](personal-recipes-briefs/celeriac-and-apple-soup.json) — ✓ voice-check clean; 12 mapped ingredients; tools: food-processor, stick-blender, small-saucepan
- **Chicken Caesar Salad** — [`chicken-caesar-salad`](personal-recipes-briefs/chicken-caesar-salad.json) — ✓ voice-check clean; 4 mapped ingredients, 1 unmapped
- **Chicory, Pear & Goats Cheese Salad** — [`chicory-pear-goats-cheese-salad`](personal-recipes-briefs/chicory-pear-goats-cheese-salad.json) — ✓ voice-check clean; 6 mapped ingredients, 1 unmapped
- **Cold Salad Explosion With Quesadillas** — [`cold-salad-explosion-with-quesadillas`](personal-recipes-briefs/cold-salad-explosion-with-quesadillas.json) — ✓ voice-check clean; 9 mapped ingredients, 2 unmapped; tools: oven
- **Crepes** — [`crepes`](personal-recipes-briefs/crepes.json) — ✓ voice-check clean; 6 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium, whisk-balloon
- **Fluffy Pancakes** — [`fluffy-pancakes`](personal-recipes-briefs/fluffy-pancakes.json) — ✓ voice-check clean; 8 mapped ingredients; tools: small-saucepan, whisk-balloon, wooden-spoon
- **French Toast Casserole** — [`french-toast-casserole`](personal-recipes-briefs/french-toast-casserole.json) — 2 voice warnings; 10 mapped ingredients; tools: whisk-balloon, oven
- **French Toast Roll Ups** — [`french-toast-roll-ups`](personal-recipes-briefs/french-toast-roll-ups.json) — ✓ voice-check clean; 11 mapped ingredients; tools: saute-pan, whisk-balloon, rolling-pin
- **Goats Cheese & Honey Rice Cakes** — [`goats-cheese-honey-rice-cakes`](personal-recipes-briefs/goats-cheese-honey-rice-cakes.json) — ✓ voice-check clean; 3 mapped ingredients
- **Gouda Quesadillas with Caramelised Apple** — [`gouda-quesadillas-with-caramelised-apple`](personal-recipes-briefs/gouda-quesadillas-with-caramelised-apple.json) — ✓ voice-check clean; 12 mapped ingredients, 2 unmapped
- **Gourmet Grilled Cheese Sandwich (not dairy free)** — [`gourmet-grilled-cheese-sandwich`](personal-recipes-briefs/gourmet-grilled-cheese-sandwich.json) — 1 voice warning; 7 mapped ingredients; tools: chopping-board
- **Jennifer Aniston Salad** — [`jennifer-aniston-salad`](personal-recipes-briefs/jennifer-aniston-salad.json) — 4 voice warnings; 13 mapped ingredients; tools: small-saucepan, mixing-bowl-medium
- **Lentil & Feta Salad** — [`lentil-feta-salad`](personal-recipes-briefs/lentil-feta-salad.json) — ✓ voice-check clean; 7 mapped ingredients; tools: whisk-balloon
- **Millionaire Peach Salad** — [`millionaire-peach-salad`](personal-recipes-briefs/millionaire-peach-salad.json) — 3 voice warnings; 8 mapped ingredients, 1 unmapped
- **Parma Ham Salad** — [`parma-ham-salad`](personal-recipes-briefs/parma-ham-salad.json) — ✓ voice-check clean; 5 mapped ingredients, 1 unmapped
- **Quick Poached Egg & Garlic Spinach Bagel** — [`quick-poached-egg-garlic-spinach-bagel`](personal-recipes-briefs/quick-poached-egg-garlic-spinach-bagel.json) — 1 voice warning; 7 mapped ingredients, 1 unmapped; tools: kettle
- **Street Corn Salad** — [`street-corn-salad`](personal-recipes-briefs/street-corn-salad.json) — 5 voice warnings; 11 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium, whisk-balloon

### DINNERS

- **Andy The Gasman’s Stew** — [`andy-the-gasman-s-stew`](personal-recipes-briefs/andy-the-gasman-s-stew.json) — ✓ voice-check clean; 13 mapped ingredients, 1 unmapped; tools: oven
- **Bacon & Spaghetti Squash Fritters** — [`bacon-spaghetti-squash-fritters`](personal-recipes-briefs/bacon-spaghetti-squash-fritters.json) — ✓ voice-check clean; 10 mapped ingredients; tools: oven
- **Baked Brown Sugar Chicken Wings** — [`baked-brown-sugar-chicken-wings`](personal-recipes-briefs/baked-brown-sugar-chicken-wings.json) — ✓ voice-check clean; 13 mapped ingredients; tools: food-processor, tongs, oven
- **Baked Meatballs** — [`baked-meatballs`](personal-recipes-briefs/baked-meatballs.json) — ✓ voice-check clean; 8 mapped ingredients; tools: saute-pan, oven
- **Beef Bourguignon** — [`beef-bourguignon`](personal-recipes-briefs/beef-bourguignon.json) — ✓ voice-check clean; 14 mapped ingredients; tools: oven
- **Beef Stir Fry** — [`beef-stir-fry`](personal-recipes-briefs/beef-stir-fry.json) — ✓ voice-check clean; 9 mapped ingredients
- **Beef Stroganoff** — [`beef-stroganoff`](personal-recipes-briefs/beef-stroganoff.json) — ✓ voice-check clean; 6 mapped ingredients, 2 unmapped; tools: rolling-pin
- **Butternut Squash Soup** — [`butternut-squash-soup`](personal-recipes-briefs/butternut-squash-soup.json) — ✓ voice-check clean; 12 mapped ingredients; tools: stick-blender, stockpot, oven
- **Caramelized Onion, Bacon, and Parmesan Risotto** — [`caramelized-onion-bacon-and-parmesan-risotto`](personal-recipes-briefs/caramelized-onion-bacon-and-parmesan-risotto.json) — 1 voice warning; 10 mapped ingredients
- **Cauliflower & Cheese Soup** — [`cauliflower-cheese-soup`](personal-recipes-briefs/cauliflower-cheese-soup.json) — 5 voice warnings; 12 mapped ingredients; tools: stick-blender, stockpot, oven
- **Chicken Korma** — [`chicken-korma`](personal-recipes-briefs/chicken-korma.json) — 1 voice warning; 18 mapped ingredients, 39 unmapped; tools: oven
- **Chicken Pesto Pasta Salad** — [`chicken-pesto-pasta-salad`](personal-recipes-briefs/chicken-pesto-pasta-salad.json) — ✓ voice-check clean; 6 mapped ingredients
- **Chicken Wrapped in Parma Ham** — [`chicken-wrapped-in-parma-ham`](personal-recipes-briefs/chicken-wrapped-in-parma-ham.json) — ✓ voice-check clean; 5 mapped ingredients; tools: oven
- **Christmas Salmon** — [`christmas-salmon`](personal-recipes-briefs/christmas-salmon.json) — 2 voice warnings; 8 mapped ingredients; tools: oven
- **Courgette Fritters** — [`courgette-fritters`](personal-recipes-briefs/courgette-fritters.json) — 2 voice warnings; 12 mapped ingredients, 1 unmapped; tools: food-processor, box-grater
- **Cowboy Butter Chicken Linguine** — [`cowboy-butter-chicken-linguine`](personal-recipes-briefs/cowboy-butter-chicken-linguine.json) — 3 voice warnings; 16 mapped ingredients, 1 unmapped
- **Creamy Bacon and Mushroom Pasta** — [`creamy-bacon-and-mushroom-pasta`](personal-recipes-briefs/creamy-bacon-and-mushroom-pasta.json) — 1 voice warning; 11 mapped ingredients, 1 unmapped
- **Creamy Brie and Mushroom Risotto** — [`creamy-brie-and-mushroom-risotto`](personal-recipes-briefs/creamy-brie-and-mushroom-risotto.json) — ✓ voice-check clean; 10 mapped ingredients, 1 unmapped
- **Creamy Cheesy Broccoli Soup** — [`creamy-cheesy-broccoli-soup`](personal-recipes-briefs/creamy-cheesy-broccoli-soup.json) — 2 voice warnings; 13 mapped ingredients, 1 unmapped; tools: stockpot, whisk-balloon, hob
- **Double Crunch Honey Garlic Chicken** — [`double-crunch-honey-garlic-chicken`](personal-recipes-briefs/double-crunch-honey-garlic-chicken.json) — 1 voice warning; 18 mapped ingredients; tools: slow-cooker, small-saucepan, chopping-board, oven…
- **Extra Crispy Chicken Wraps** — [`extra-crispy-chicken-wraps`](personal-recipes-briefs/extra-crispy-chicken-wraps.json) — ✓ voice-check clean; 16 mapped ingredients, 1 unmapped; tools: tongs
- **Fantastic Fish Pie** — [`fantastic-fish-pie`](personal-recipes-briefs/fantastic-fish-pie.json) — ✓ voice-check clean; 13 mapped ingredients; tools: colander, oven
- **French Onion Soup** — [`french-onion-soup`](personal-recipes-briefs/french-onion-soup.json) — 4 voice warnings; 13 mapped ingredients, 2 unmapped; tools: slow-cooker, stockpot, tongs, oven…
- **Garlic Beef Bites & Potatoes** — [`garlic-beef-bites-potatoes`](personal-recipes-briefs/garlic-beef-bites-potatoes.json) — 5 voice warnings; 18 mapped ingredients; tools: slow-cooker, mixing-bowl-medium, whisk-balloon
- **Garlic Butter Chicken Bites** — [`garlic-butter-chicken-bites`](personal-recipes-briefs/garlic-butter-chicken-bites.json) — 3 voice warnings; 11 mapped ingredients
- **Garlic Butter Salmon Pasta** — [`garlic-butter-salmon-pasta`](personal-recipes-briefs/garlic-butter-salmon-pasta.json) — 2 voice warnings; 12 mapped ingredients; tools: stockpot, whisk-balloon
- **Garlic Parmesan Pasta** — [`garlic-parmesan-pasta`](personal-recipes-briefs/garlic-parmesan-pasta.json) — ✓ voice-check clean; 7 mapped ingredients; tools: tongs
- **Grilled Caesar Salad** — [`grilled-caesar-salad`](personal-recipes-briefs/grilled-caesar-salad.json) — 3 voice warnings; 19 mapped ingredients, 1 unmapped; tools: food-processor, mixing-bowl-medium, chopping-board, oven…
- **Homemade Cottage Pie** — [`homemade-cottage-pie`](personal-recipes-briefs/homemade-cottage-pie.json) — ✓ voice-check clean; 19 mapped ingredients; tools: oven
- **Honey Garlic Glazed Salmon** — [`honey-garlic-glazed-salmon`](personal-recipes-briefs/honey-garlic-glazed-salmon.json) — 2 voice warnings; 13 mapped ingredients, 1 unmapped; tools: oven
- **Honey Soy Baked Drumsticks** — [`honey-soy-baked-drumsticks`](personal-recipes-briefs/honey-soy-baked-drumsticks.json) — 2 voice warnings; 10 mapped ingredients; tools: oven
- **Honey-Soy Chicken With Sauce** — [`honey-soy-chicken-with-sauce`](personal-recipes-briefs/honey-soy-chicken-with-sauce.json) — 2 voice warnings; 8 mapped ingredients; tools: whisk-balloon, oven
- **Jeanette’s Vegetable Crumble** — [`jeanette-s-vegetable-crumble`](personal-recipes-briefs/jeanette-s-vegetable-crumble.json) — ✓ voice-check clean; 4 mapped ingredients, 1 unmapped; tools: oven
- **Leftover Lamb Tortillas** — [`leftover-lamb-tortillas`](personal-recipes-briefs/leftover-lamb-tortillas.json) — ✓ voice-check clean; 3 mapped ingredients, 2 unmapped
- **Marry Me Chicken** — [`marry-me-chicken`](personal-recipes-briefs/marry-me-chicken.json) — ✓ voice-check clean; 13 mapped ingredients, 1 unmapped; tools: slow-cooker
- **Mashed-Potato Gratin** — [`mashed-potato-gratin`](personal-recipes-briefs/mashed-potato-gratin.json) — ✓ voice-check clean; 6 mapped ingredients; tools: stockpot, oven
- **Mushroom Puffs** — [`mushroom-puffs`](personal-recipes-briefs/mushroom-puffs.json) — ✓ voice-check clean; 6 mapped ingredients, 2 unmapped; tools: small-saucepan, oven
- **Parsnip And Pancetta Tagliatelle With Parmesan And Butter** — [`parsnip-and-pancetta-tagliatelle-with-parmesan-and-butter`](personal-recipes-briefs/parsnip-and-pancetta-tagliatelle-with-parmesan-and-butter.json) — ✓ voice-check clean; 8 mapped ingredients
- **Pepper and Chorizo Picnic Frittata** — [`pepper-and-chorizo-picnic-frittata`](personal-recipes-briefs/pepper-and-chorizo-picnic-frittata.json) — 1 voice warning; 11 mapped ingredients
- **Roasted Chicken Drumsticks With Parsley & Garlic** — [`roasted-chicken-drumsticks-with-parsley-garlic`](personal-recipes-briefs/roasted-chicken-drumsticks-with-parsley-garlic.json) — 1 voice warning; 6 mapped ingredients
- **Roasted Chicken with Rosemary Roast Potatoes** — [`roasted-chicken-with-rosemary-roast-potatoes`](personal-recipes-briefs/roasted-chicken-with-rosemary-roast-potatoes.json) — ✓ voice-check clean; 9 mapped ingredients; tools: oven
- **Roasted Garlic And Potato Soup** — [`roasted-garlic-and-potato-soup`](personal-recipes-briefs/roasted-garlic-and-potato-soup.json) — 1 voice warning; 12 mapped ingredients; tools: food-processor, small-saucepan
- **Roasted Red Pepper Risotto Recipe** — [`roasted-red-pepper-risotto-recipe`](personal-recipes-briefs/roasted-red-pepper-risotto-recipe.json) — ✓ voice-check clean; 11 mapped ingredients
- **Roasted Squash & Pancetta Risotto** — [`roasted-squash-pancetta-risotto`](personal-recipes-briefs/roasted-squash-pancetta-risotto.json) — ✓ voice-check clean; 18 mapped ingredients, 1 unmapped; tools: small-saucepan, oven
- **Roasted Sweet Garlic, Thyme and Mascarpone Risotto** — [`roasted-sweet-garlic-thyme-and-mascarpone-risotto`](personal-recipes-briefs/roasted-sweet-garlic-thyme-and-mascarpone-risotto.json) — ✓ voice-check clean; 13 mapped ingredients, 2 unmapped; tools: small-saucepan, oven
- **Salmon Teriyaki** — [`salmon-teriyaki`](personal-recipes-briefs/salmon-teriyaki.json) — ✓ voice-check clean; 6 mapped ingredients; tools: oven
- **Salmon Wrapped In Prosciutto** — [`salmon-wrapped-in-prosciutto`](personal-recipes-briefs/salmon-wrapped-in-prosciutto.json) — ✓ voice-check clean; 7 mapped ingredients; tools: oven
- **Sea Bass with Crispy Potatoes** — [`sea-bass-with-crispy-potatoes`](personal-recipes-briefs/sea-bass-with-crispy-potatoes.json) — ✓ voice-check clean; 4 mapped ingredients, 1 unmapped; tools: oven
- **Shoulder Of Lamb** — [`shoulder-of-lamb`](personal-recipes-briefs/shoulder-of-lamb.json) — ✓ voice-check clean; 3 mapped ingredients, 1 unmapped; tools: oven
- **Sloppy Joe’s Pasta Bake** — [`sloppy-joe-s-pasta-bake`](personal-recipes-briefs/sloppy-joe-s-pasta-bake.json) — ✓ voice-check clean; 18 mapped ingredients, 2 unmapped; tools: small-saucepan, stockpot, oven
- **Slow Cooker BBQ Chicken Wings** — [`slow-cooker-bbq-chicken-wings`](personal-recipes-briefs/slow-cooker-bbq-chicken-wings.json) — 4 voice warnings; 10 mapped ingredients, 2 unmapped; tools: slow-cooker, oven
- **Slow Cooker Beef Stroganoff** — [`slow-cooker-beef-stroganoff`](personal-recipes-briefs/slow-cooker-beef-stroganoff.json) — ✓ voice-check clean; 9 mapped ingredients, 1 unmapped; tools: slow-cooker, whisk-balloon
- **Slow Cooker Braised Steak and Onions** — [`slow-cooker-braised-steak-and-onions`](personal-recipes-briefs/slow-cooker-braised-steak-and-onions.json) — ✓ voice-check clean; 12 mapped ingredients, 1 unmapped; tools: slow-cooker
- **Slow Cooker Butter Chicken** — [`slow-cooker-butter-chicken`](personal-recipes-briefs/slow-cooker-butter-chicken.json) — 1 voice warning; 15 mapped ingredients; tools: slow-cooker, saute-pan
- **Slow Cooker Cherry Cola Pulled Pork** — [`slow-cooker-cherry-cola-pulled-pork`](personal-recipes-briefs/slow-cooker-cherry-cola-pulled-pork.json) — 3 voice warnings; 6 mapped ingredients, 2 unmapped; tools: slow-cooker
- **Slow Cooker Chinese Beef and Broccoli** — [`slow-cooker-chinese-beef-and-broccoli`](personal-recipes-briefs/slow-cooker-chinese-beef-and-broccoli.json) — 2 voice warnings; 8 mapped ingredients; tools: mixing-bowl-medium, whisk-balloon
- **Slow Cooker Italian Beef Ragu** — [`slow-cooker-italian-beef-ragu`](personal-recipes-briefs/slow-cooker-italian-beef-ragu.json) — ✓ voice-check clean; 13 mapped ingredients, 1 unmapped; tools: slow-cooker, stockpot, wooden-spoon
- **Slow Cooker Italian Chicken Pasta** — [`slow-cooker-italian-chicken-pasta`](personal-recipes-briefs/slow-cooker-italian-chicken-pasta.json) — 3 voice warnings; 7 mapped ingredients, 2 unmapped; tools: hob
- **Slow Cooker Korean Beef** — [`slow-cooker-korean-beef`](personal-recipes-briefs/slow-cooker-korean-beef.json) — 1 voice warning; 7 mapped ingredients, 1 unmapped; tools: slow-cooker
- **Slow Cooker Pulled BBQ Chicken** — [`slow-cooker-pulled-bbq-chicken`](personal-recipes-briefs/slow-cooker-pulled-bbq-chicken.json) — 1 voice warning; 10 mapped ingredients, 1 unmapped; tools: slow-cooker, whisk-balloon
- **Slow Cooker Teriyaki Chicken** — [`slow-cooker-teriyaki-chicken`](personal-recipes-briefs/slow-cooker-teriyaki-chicken.json) — 2 voice warnings; 11 mapped ingredients; tools: slow-cooker, small-saucepan, whisk-balloon, oven
- **Slow Cooker Welsh Lamb Hotpot** — [`slow-cooker-welsh-lamb-hotpot`](personal-recipes-briefs/slow-cooker-welsh-lamb-hotpot.json) — ✓ voice-check clean; 19 mapped ingredients; tools: slow-cooker, oven
- **Spaghetti Bolognaise** — [`spaghetti-bolognaise`](personal-recipes-briefs/spaghetti-bolognaise.json) — ✓ voice-check clean; 16 mapped ingredients; tools: small-saucepan, stockpot, colander, microplane…
- **Tagliatelle with Spinach, Mascarpone and Parmesan (Not Dairy-Free)** — [`tagliatelle-with-spinach-mascarpone-and-parmesan`](personal-recipes-briefs/tagliatelle-with-spinach-mascarpone-and-parmesan.json) — 1 voice warning; 10 mapped ingredients
- **Teriyaki Mushroom Rice Bowls** — [`teriyaki-mushroom-rice-bowls`](personal-recipes-briefs/teriyaki-mushroom-rice-bowls.json) — 1 voice warning; 13 mapped ingredients, 1 unmapped; tools: food-processor, small-saucepan, mixing-bowl-medium, sieve…
- **Vegan Mac & Cheese** — [`vegan-mac-cheese`](personal-recipes-briefs/vegan-mac-cheese.json) — ✓ voice-check clean; 13 mapped ingredients, 1 unmapped; tools: small-saucepan, mixing-bowl-medium, whisk-balloon, sieve…
- **Warm Pear Salad** — [`warm-pear-salad`](personal-recipes-briefs/warm-pear-salad.json) — ✓ voice-check clean; 11 mapped ingredients
- **Yakitori Chicken** — [`yakitori-chicken`](personal-recipes-briefs/yakitori-chicken.json) — ✓ voice-check clean; 10 mapped ingredients, 4 unmapped
- **Zucchini Pine Nut & Cranberry Paleo Pasta** — [`zucchini-pine-nut-cranberry-paleo-pasta`](personal-recipes-briefs/zucchini-pine-nut-cranberry-paleo-pasta.json) — 5 voice warnings; 4 mapped ingredients, 1 unmapped

### SIDES

- **Best Salty Crunchy Kale Crisps** — [`best-salty-crunchy-kale-crisps`](personal-recipes-briefs/best-salty-crunchy-kale-crisps.json) — ✓ voice-check clean; 4 mapped ingredients; tools: mixing-bowl-medium, oven
- **Cauliflower Bites** — [`cauliflower-bites`](personal-recipes-briefs/cauliflower-bites.json) — ✓ voice-check clean; 6 mapped ingredients, 1 unmapped
- **Cheddar Broccoli Rice Cups** — [`cheddar-broccoli-rice-cups`](personal-recipes-briefs/cheddar-broccoli-rice-cups.json) — ✓ voice-check clean; 8 mapped ingredients; tools: stockpot, oven
- **Cheddar-Rosemary Spiralized Potato Pancakes** — [`cheddar-rosemary-spiralized-potato-pancakes`](personal-recipes-briefs/cheddar-rosemary-spiralized-potato-pancakes.json) — 1 voice warning; 7 mapped ingredients
- **Chicken Gyoza** — [`chicken-gyoza`](personal-recipes-briefs/chicken-gyoza.json) — ✓ voice-check clean; 17 mapped ingredients, 3 unmapped; tools: food-processor
- **Courgette Parmesan Crisps** — [`courgette-parmesan-crisps`](personal-recipes-briefs/courgette-parmesan-crisps.json) — 5 voice warnings; 6 mapped ingredients; tools: small-saucepan, sieve, tongs, oven
- **Crispy Baked Shoestring Sweet Potato Fries** — [`crispy-baked-shoestring-sweet-potato-fries`](personal-recipes-briefs/crispy-baked-shoestring-sweet-potato-fries.json) — ✓ voice-check clean; 3 mapped ingredients; tools: oven
- **Ham & Chive Filo Tartlets** — [`ham-chive-filo-tartlets`](personal-recipes-briefs/ham-chive-filo-tartlets.json) — ✓ voice-check clean; 4 mapped ingredients, 2 unmapped; tools: muffin-tin, whisk-balloon, oven
- **Lemon Herb Roasted Potatoes** — [`lemon-herb-roasted-potatoes`](personal-recipes-briefs/lemon-herb-roasted-potatoes.json) — ✓ voice-check clean; 9 mapped ingredients; tools: oven
- **Loaded Mashed Potato Casserole** — [`loaded-mashed-potato-casserole`](personal-recipes-briefs/loaded-mashed-potato-casserole.json) — ✓ voice-check clean; 7 mapped ingredients; tools: mixing-bowl-medium, oven
- **Oven-Roasted Carrots with Garlic and Coriander** — [`oven-roasted-carrots-with-garlic-and-coriander`](personal-recipes-briefs/oven-roasted-carrots-with-garlic-and-coriander.json) — ✓ voice-check clean; 7 mapped ingredients; tools: small-saucepan, whisk-balloon, oven
- **Parmesan Cheese Crisps Laced with Zucchini & Carrots** — [`parmesan-cheese-crisps-laced-with-zucchini-carrots`](personal-recipes-briefs/parmesan-cheese-crisps-laced-with-zucchini-carrots.json) — 4 voice warnings; 2 mapped ingredients, 1 unmapped; tools: oven
- **Roast Parsnips** — [`roast-parsnips`](personal-recipes-briefs/roast-parsnips.json) — ✓ voice-check clean; 5 mapped ingredients; tools: oven
- **Rosemary Straw Potatoes** — [`rosemary-straw-potatoes`](personal-recipes-briefs/rosemary-straw-potatoes.json) — ✓ voice-check clean; 5 mapped ingredients; tools: colander
- **Salt-Crusted Mini Baked Potatoes with Cold Chive Hollandaise** — [`salt-crusted-mini-baked-potatoes-with-cold-chive-hollandaise`](personal-recipes-briefs/salt-crusted-mini-baked-potatoes-with-cold-chive-hollandaise.json) — ✓ voice-check clean; 9 mapped ingredients; tools: food-processor, small-saucepan, oven
- **Salted Edamame** — [`salted-edamame`](personal-recipes-briefs/salted-edamame.json) — ✓ voice-check clean; 1 mapped ingredient, 1 unmapped
- **Smoked Salmon Rolls** — [`smoked-salmon-rolls`](personal-recipes-briefs/smoked-salmon-rolls.json) — ✓ voice-check clean; 5 mapped ingredients
- **Spinach and Feta Pinwheels** — [`spinach-and-feta-pinwheels`](personal-recipes-briefs/spinach-and-feta-pinwheels.json) — 1 voice warning; 6 mapped ingredients, 1 unmapped; tools: air-fryer, stockpot, oven
- **Spinach & Bacon Salad** — [`spinach-bacon-salad`](personal-recipes-briefs/spinach-bacon-salad.json) — ✓ voice-check clean; 5 mapped ingredients
- **World’s Best Cheesy Garlic Bread** — [`world-s-best-cheesy-garlic-bread`](personal-recipes-briefs/world-s-best-cheesy-garlic-bread.json) — 4 voice warnings; 8 mapped ingredients; tools: oven

### DESSERTS

- **Ambrosia Salad (Not Dairy-Free)** — [`ambrosia-salad`](personal-recipes-briefs/ambrosia-salad.json) — ✓ voice-check clean; 6 mapped ingredients, 2 unmapped
- **Apple Crumble** — [`apple-crumble`](personal-recipes-briefs/apple-crumble.json) — ✓ voice-check clean; 8 mapped ingredients; tools: oven
- **Baked Raspberry Cheesecake** — [`baked-raspberry-cheesecake`](personal-recipes-briefs/baked-raspberry-cheesecake.json) — ✓ voice-check clean; 9 mapped ingredients, 1 unmapped; tools: food-processor, sieve, rolling-pin, oven
- **Banoffee Pie (Not Dairy-Free)** — [`banoffee-pie`](personal-recipes-briefs/banoffee-pie.json) — 1 voice warning; 9 mapped ingredients, 2 unmapped; tools: food-processor, stand-mixer, small-saucepan, whisk-balloon…
- **Best Ever Banana Cake** — [`best-ever-banana-cake`](personal-recipes-briefs/best-ever-banana-cake.json) — ✓ voice-check clean; 15 mapped ingredients, 1 unmapped; tools: oven
- **Boozy Bailey’s Cheesecake** — [`boozy-bailey-s-cheesecake`](personal-recipes-briefs/boozy-bailey-s-cheesecake.json) — ✓ voice-check clean; 5 mapped ingredients, 2 unmapped; tools: food-processor, small-saucepan
- **Cinder Toffee Ice Cream (Not Dairy-Free)** — [`cinder-toffee-ice-cream`](personal-recipes-briefs/cinder-toffee-ice-cream.json) — ✓ voice-check clean; 7 mapped ingredients; tools: hand-mixer, small-saucepan, whisk-balloon
- **Cinnamon Ice Cream (Not Dairy Free)** — [`cinnamon-ice-cream`](personal-recipes-briefs/cinnamon-ice-cream.json) — ✓ voice-check clean; 7 mapped ingredients, 1 unmapped; tools: small-saucepan, whisk-balloon, oven
- **Stewed Pears & Ice Cream** — [`stewed-pears-ice-cream`](personal-recipes-briefs/stewed-pears-ice-cream.json) — ✓ voice-check clean; 5 mapped ingredients, 1 unmapped
- **Sticky Toffee Pudding** — [`sticky-toffee-pudding`](personal-recipes-briefs/sticky-toffee-pudding.json) — 1 voice warning; 13 mapped ingredients, 2 unmapped; tools: small-saucepan, wooden-spoon, oven
- **White Chocolate Cardamom Mousse (Not Dairy-Free)** — [`white-chocolate-cardamom-mousse`](personal-recipes-briefs/white-chocolate-cardamom-mousse.json) — `--skip-voice-check` used; 5 mapped ingredients; tools: hand-mixer, small-saucepan, whisk-balloon

### BAKING + TREATS

- **Afghan Cookies** — [`afghan-cookies`](personal-recipes-briefs/afghan-cookies.json) — ✓ voice-check clean; 5 mapped ingredients, 2 unmapped; tools: oven
- **Almond Butter Fudge** — [`almond-butter-fudge`](personal-recipes-briefs/almond-butter-fudge.json) — ✓ voice-check clean; 5 mapped ingredients; tools: small-saucepan
- **Banana Crisps** — [`banana-crisps`](personal-recipes-briefs/banana-crisps.json) — ✓ voice-check clean; 4 mapped ingredients, 1 unmapped; tools: oven
- **Best Vegan Cinnamon Rolls** — [`best-vegan-cinnamon-rolls`](personal-recipes-briefs/best-vegan-cinnamon-rolls.json) — 1 voice warning; 13 mapped ingredients, 1 unmapped; tools: small-saucepan, whisk-balloon, sieve, rolling-pin…
- **Biscoff Truffles** — [`biscoff-truffles`](personal-recipes-briefs/biscoff-truffles.json) — ✓ voice-check clean; 2 mapped ingredients, 1 unmapped; tools: food-processor
- **Bourbon Biscuits** — [`bourbon-biscuits`](personal-recipes-briefs/bourbon-biscuits.json) — ✓ voice-check clean; 11 mapped ingredients, 1 unmapped; tools: oven
- **Brownie Batter Bites** — [`brownie-batter-bites`](personal-recipes-briefs/brownie-batter-bites.json) — ✓ voice-check clean; 4 mapped ingredients, 2 unmapped
- **Carol's Soft and Chewy Chocolate Chippies** — [`carols-soft-and-chewy-chocolate-chippies`](personal-recipes-briefs/carols-soft-and-chewy-chocolate-chippies.json) — ✓ voice-check clean; 9 mapped ingredients, 1 unmapped; tools: oven
- **Chocolate And Chestnut Yule Log** — [`chocolate-and-chestnut-yule-log`](personal-recipes-briefs/chocolate-and-chestnut-yule-log.json) — ✓ voice-check clean; 11 mapped ingredients, 1 unmapped; tools: food-processor, whisk-balloon, oven
- **Chocolate, Cherry and Almond Fudge** — [`chocolate-cherry-and-almond-fudge`](personal-recipes-briefs/chocolate-cherry-and-almond-fudge.json) — ✓ voice-check clean; 5 mapped ingredients, 1 unmapped; tools: food-processor, small-saucepan, sieve
- **Chocolate Mousse** — [`chocolate-mousse`](personal-recipes-briefs/chocolate-mousse.json) — ✓ voice-check clean; 8 mapped ingredients
- **Cinnamon Roasted Almonds** — [`cinnamon-roasted-almonds`](personal-recipes-briefs/cinnamon-roasted-almonds.json) — 2 voice warnings; 3 mapped ingredients, 2 unmapped; tools: oven
- **Cinnamon Rolls** — [`cinnamon-rolls`](personal-recipes-briefs/cinnamon-rolls.json) — ✓ voice-check clean; 13 mapped ingredients, 2 unmapped; tools: food-processor, whisk-balloon, oven
- **Clean Eating Almond Butter Fudge** — [`clean-eating-almond-butter-fudge`](personal-recipes-briefs/clean-eating-almond-butter-fudge.json) — 2 voice warnings; 2 mapped ingredients, 2 unmapped
- **Clean Eating No Bake Oatmeal Granola Bars** — [`clean-eating-no-bake-oatmeal-granola-bars`](personal-recipes-briefs/clean-eating-no-bake-oatmeal-granola-bars.json) — ✓ voice-check clean; 8 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium
- **Double Chocolate Peppermint Cookies** — [`double-chocolate-peppermint-cookies`](personal-recipes-briefs/double-chocolate-peppermint-cookies.json) — 3 voice warnings; 11 mapped ingredients, 3 unmapped; tools: oven
- **Easy Decadent Truffles** — [`easy-decadent-truffles`](personal-recipes-briefs/easy-decadent-truffles.json) — 1 voice warning; 4 mapped ingredients
- **Fruit Rollups** — [`fruit-rollups`](personal-recipes-briefs/fruit-rollups.json) — 4 voice warnings; 2 mapped ingredients, 1 unmapped; tools: food-processor, oven
- **Fudgy Vegan Cookies** — [`fudgy-vegan-cookies`](personal-recipes-briefs/fudgy-vegan-cookies.json) — ✓ voice-check clean; 9 mapped ingredients, 1 unmapped; tools: stand-mixer, small-saucepan, mixing-bowl-medium, whisk-balloon…
- **Gingerbread Cheesecake Cookies** — [`gingerbread-cheesecake-cookies`](personal-recipes-briefs/gingerbread-cheesecake-cookies.json) — 1 voice warning; 22 mapped ingredients; tools: stand-mixer, hand-mixer, mixing-bowl-medium, whisk-balloon…
- **Hob Nobs** — [`hob-nobs`](personal-recipes-briefs/hob-nobs.json) — 1 voice warning; 11 mapped ingredients; tools: food-processor, whisk-balloon, oven
- **Honey & Oat Granola Bars** — [`honey-oat-granola-bars`](personal-recipes-briefs/honey-oat-granola-bars.json) — 2 voice warnings; 6 mapped ingredients; tools: loaf-tin, oven, hob
- **Honeycomb** — [`honeycomb`](personal-recipes-briefs/honeycomb.json) — 2 voice warnings; 7 mapped ingredients; tools: small-saucepan, stockpot, whisk-balloon, chopping-board…
- **Icing** — [`icing`](personal-recipes-briefs/icing.json) — ✓ voice-check clean; 3 mapped ingredients; tools: piping-bag
- **Irish Whiskey Truffles** — [`irish-whiskey-truffles`](personal-recipes-briefs/irish-whiskey-truffles.json) — ✓ voice-check clean; 7 mapped ingredients; tools: food-processor, small-saucepan
- **Limoncello Curd** — [`limoncello-curd`](personal-recipes-briefs/limoncello-curd.json) — ✓ voice-check clean; 5 mapped ingredients, 1 unmapped; tools: whisk-balloon, wooden-spoon, sieve, oven
- **Mince Pie Cookies** — [`mince-pie-cookies`](personal-recipes-briefs/mince-pie-cookies.json) — ✓ voice-check clean; 5 mapped ingredients, 1 unmapped; tools: oven
- **Peanut Butter Brownies** — [`peanut-butter-brownies`](personal-recipes-briefs/peanut-butter-brownies.json) — ✓ voice-check clean; 5 mapped ingredients; tools: wooden-spoon, oven
- **Peanut Butter Cookies** — [`peanut-butter-cookies`](personal-recipes-briefs/peanut-butter-cookies.json) — ✓ voice-check clean; 9 mapped ingredients; tools: oven
- **Peanut Butter Protein Balls** — [`peanut-butter-protein-balls`](personal-recipes-briefs/peanut-butter-protein-balls.json) — 2 voice warnings; 6 mapped ingredients; tools: mixing-bowl-medium
- **Raw Raspberry Brownie Truffle** — [`raw-raspberry-brownie-truffle`](personal-recipes-briefs/raw-raspberry-brownie-truffle.json) — ✓ voice-check clean; 7 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium
- **Seed Bar** — [`seed-bar`](personal-recipes-briefs/seed-bar.json) — ✓ voice-check clean; 10 mapped ingredients, 1 unmapped; tools: small-saucepan
- **Shortbread** — [`shortbread`](personal-recipes-briefs/shortbread.json) — ✓ voice-check clean; 3 mapped ingredients; tools: oven
- **Soft and Chewy Oatmeal Raisin Cookies** — [`soft-and-chewy-oatmeal-raisin-cookies`](personal-recipes-briefs/soft-and-chewy-oatmeal-raisin-cookies.json) — 3 voice warnings; 11 mapped ingredients; tools: stand-mixer, mixing-bowl-medium, whisk-balloon, oven
- **Sour Gummies** — [`sour-gummies`](personal-recipes-briefs/sour-gummies.json) — ✓ voice-check clean; 4 mapped ingredients, 3 unmapped; tools: food-processor, small-saucepan, whisk-balloon, sieve
- **Ultimate Gingerbread** — [`ultimate-gingerbread`](personal-recipes-briefs/ultimate-gingerbread.json) — ✓ voice-check clean; 9 mapped ingredients, 1 unmapped; tools: food-processor, oven
- **Vegan Chocolate Cake** — [`vegan-chocolate-cake`](personal-recipes-briefs/vegan-chocolate-cake.json) — 1 voice warning; 13 mapped ingredients, 3 unmapped; tools: mixing-bowl-medium, whisk-balloon, oven
- **Vegan Cinnamon Doughnuts** — [`vegan-cinnamon-doughnuts`](personal-recipes-briefs/vegan-cinnamon-doughnuts.json) — ✓ voice-check clean; 6 mapped ingredients, 1 unmapped
- **Vegan Peanut Butter Cookies** — [`vegan-peanut-butter-cookies`](personal-recipes-briefs/vegan-peanut-butter-cookies.json) — ✓ voice-check clean; 6 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium, oven
- **"Whatever Floats Your Boat" Brownies!** — [`whatever-floats-your-boat-brownies`](personal-recipes-briefs/whatever-floats-your-boat-brownies.json) — 1 voice warning; 10 mapped ingredients, 5 unmapped; tools: oven
- **Winnie’s Chocolate Chip Cookies** — [`winnie-s-chocolate-chip-cookies`](personal-recipes-briefs/winnie-s-chocolate-chip-cookies.json) — ✓ voice-check clean; 7 mapped ingredients

### DRINKS

- **Epic Hot Chocolate (Not Dairy-Free)** — [`epic-hot-chocolate`](personal-recipes-briefs/epic-hot-chocolate.json) — ✓ voice-check clean; 7 mapped ingredients, 1 unmapped; tools: whisk-balloon
- **Limoncello** — [`limoncello`](personal-recipes-briefs/limoncello.json) — ✓ voice-check clean; 4 mapped ingredients; tools: small-saucepan
- **Passionfruit Martini** — [`passionfruit-martini`](personal-recipes-briefs/passionfruit-martini.json) — ✓ voice-check clean; 4 mapped ingredients; tools: small-saucepan

### BREAD

- **French Baguettes** — [`french-baguettes`](personal-recipes-briefs/french-baguettes.json) — ✓ voice-check clean; 5 mapped ingredients; tools: oven
- **Homemade Cheese Bread** — [`homemade-cheese-bread`](personal-recipes-briefs/homemade-cheese-bread.json) — ✓ voice-check clean; 15 mapped ingredients; tools: stand-mixer, loaf-tin, mixing-bowl-medium, whisk-balloon…
- **Hot Cross Buns** — [`hot-cross-buns`](personal-recipes-briefs/hot-cross-buns.json) — ✓ voice-check clean; 13 mapped ingredients, 2 unmapped; tools: piping-bag
- **Overnight Farmhouse Bread** — [`overnight-farmhouse-bread`](personal-recipes-briefs/overnight-farmhouse-bread.json) — ✓ voice-check clean; 5 mapped ingredients; tools: oven
- **Rustic Italian Crusty Bread** — [`rustic-italian-crusty-bread`](personal-recipes-briefs/rustic-italian-crusty-bread.json) — ✓ voice-check clean; 3 mapped ingredients, 1 unmapped; tools: mixing-bowl-medium, oven

## What was scoped out

Per the worker prompt, this session did NOT:

- Auto-publish anything (all rows land DRAFT for Rebecca's review).
- Create new `Ingredient` or `Tool` master rows — flagged for a follow-up session
  ([Master-list additions needed](#master-list-additions-needed)).
- Rewrite Rebecca's prose. Voice-check failures on her authored text were logged, not
  fixed. Voice-check failures in any AI-added prose would have been rewritten, but in
  practice this session adds no AI prose — the body is a direct conversion of her words
  plus structural headings ("What you need" / "Method").
- Invent sources / provenance. Every brief uses `sourceType: CREATOR` with the note
  "Rebecca's kitchen — a personal favourite from her collection."
- Pad blocks she didn't have — no AI-written troubleshooting, variations, make-ahead notes.

## Pipeline files (in this session, kept for re-runs)

- `docs/personal-recipes-briefs/.docx-extract.mjs` — mammoth docx → text
- `docs/personal-recipes-briefs/.parse-recipes.mjs` — text → structured recipes JSON
- `docs/personal-recipes-briefs/.generate-briefs.mjs` — structured recipes → TipTap briefs
- `docs/personal-recipes-briefs/.precheck-slugs.ts` — DB slug collision check + rename
- `docs/personal-recipes-briefs/.upload-all.ts` — batch uploader (calls `upload-tutorial.ts`)

These dotfiles are kept in the briefs directory so the ingest can be re-run if Rebecca's
docx collection grows. They are not part of the build.
