# Bulk batch 003 — Phase 8 Step 12 report

Authored 2026-05-15 by the Step 12 worker session (Sonnet 4.6). Third main
bulk auto-publish batch on the cooking pipeline, following batch 001 (23
British/French, Opus) and batch 002 (27 continuation, Sonnet). Covers 50
recipes across American, British, French, and Italian cuisines.

## Shipped

**Target:** 50 recipes drafted, voice-checked, uploaded as `--status PUBLISHED`.

**Shipped:** 50 / 50. All uploaded clean.

## Recipe list (50 shipped)

### American (16)
| Slug | Title | Difficulty |
|---|---|---|
| american-beef-stew | American Beef Stew | BEGINNER |
| bbq-baby-back-ribs | BBQ Baby Back Ribs | BEGINNER |
| biscuits-and-gravy | Biscuits and Gravy | BEGINNER |
| buffalo-chicken-wings | Buffalo Chicken Wings | BEGINNER |
| cheeseburger | Smash Cheeseburger | BEGINNER |
| chicken-and-dumplings | Chicken and Dumplings | BEGINNER |
| eggs-benedict | Eggs Benedict | INTERMEDIATE |
| gumbo-with-chicken-and-andouille | Chicken and Andouille Gumbo | INTERMEDIATE |
| jambalaya | Jambalaya | BEGINNER |
| pot-roast | American Pot Roast | BEGINNER |
| pulled-pork | Pulled Pork | BEGINNER |
| red-beans-and-rice | Red Beans and Rice | BEGINNER |
| reuben-sandwich | Reuben Sandwich | BEGINNER |
| shrimp-and-grits | Shrimp and Grits | INTERMEDIATE |

### British (10)
| Slug | Title | Difficulty |
|---|---|---|
| beef-stew-with-herb-dumplings | Beef Stew with Herb Dumplings | BEGINNER |
| cauliflower-cheese | Cauliflower Cheese | BEGINNER |
| chicken-and-mushroom-pie | Chicken and Mushroom Pie | BEGINNER |
| chicken-chasseur | Chicken Chasseur | BEGINNER |
| cornish-pasty | Cornish Pasty | INTERMEDIATE |
| roast-leg-of-lamb | Roast Leg of Lamb | BEGINNER |
| roast-pork-loin-with-crackling | Roast Pork Loin with Crackling | INTERMEDIATE |
| roast-potatoes | Roast Potatoes | BEGINNER |
| sausage-casserole | Sausage Casserole | BEGINNER |
| sausage-roll | Sausage Roll | BEGINNER |
| steak-and-kidney-pie | Steak and Kidney Pie | INTERMEDIATE |
| welsh-rarebit | Welsh Rarebit | BEGINNER |

### French (13)
| Slug | Title | Difficulty |
|---|---|---|
| boeuf-bourguignon | Boeuf Bourguignon | INTERMEDIATE |
| confit-de-canard | Confit de Canard | ADVANCED |
| croque-madame | Croque Madame | BEGINNER |
| gigot-dagneau | Gigot d'Agneau | INTERMEDIATE |
| navarin-dagneau | Navarin d'Agneau | INTERMEDIATE |
| oeufs-en-cocotte | Oeufs en Cocotte | BEGINNER |
| pommes-dauphinoise | Pommes Dauphinoise | BEGINNER |
| poulet-a-la-moutarde | Poulet à la Moutarde | BEGINNER |
| poulet-roti | Poulet Rôti | BEGINNER |
| soupe-a-loignon | Soupe à l'Oignon | BEGINNER |
| steak-au-poivre | Steak au Poivre | INTERMEDIATE |
| vichyssoise | Vichyssoise | BEGINNER |

### Italian (12)
| Slug | Title | Difficulty |
|---|---|---|
| fettuccine-alfredo | Fettuccine Alfredo | BEGINNER |
| penne-allarrabbiata | Penne all'Arrabbiata | BEGINNER |
| polenta-morbida | Polenta Morbida | BEGINNER |
| pollo-alla-cacciatora | Pollo alla Cacciatora | INTERMEDIATE |
| polpette-al-sugo | Polpette al Sugo | BEGINNER |
| risotto-ai-funghi-porcini | Risotto ai Funghi Porcini | INTERMEDIATE |
| saltimbocca-alla-romana | Saltimbocca alla Romana | INTERMEDIATE |
| spaghetti-aglio-olio-e-peperoncino | Spaghetti Aglio, Olio e Peperoncino | BEGINNER |
| spaghetti-al-pomodoro | Spaghetti al Pomodoro | BEGINNER |
| spaghetti-alla-puttanesca | Spaghetti alla Puttanesca | BEGINNER |
| spaghetti-alle-vongole | Spaghetti alle Vongole | INTERMEDIATE |
| tagliatelle-ai-funghi | Tagliatelle ai Funghi | BEGINNER |

## Voice-check fixes (21 files needed repair)

All 21 had blocking errors on first voice-check. All were fixed before upload.
Primary patterns:

- **Appositive em-dash pairs** in body paragraphs and `sourceNotes` — the
  dominant issue, appearing in 19 of 21 files. Fixed by converting `— X —`
  to `(X)` or rewriting as a colon.
- **Standalone second em-dash** in `sourceNotes` — 5 files. Fixed by
  converting to comma or parentheses.
- **Banned phrase "honest"** — 1 instance (cauliflower-cheese paragraph 17).
  Fixed to "glad".
- **Negation pattern "not just X but Y"** — 1 instance (cornish-pasty).
  Fixed to direct construction.

No new voice patterns beyond what was already in `docs/common-issues.md`.

## Schema fixes required (new-format files)

Batch 003 briefs used a new schema format that had three mismatches with the
upload script's `TutorialUploadInput`:

1. **Missing `categorySlug`** — 40 new-format files omitted this required
   field. Added via script (`"cooking"` for all).

2. **`toolSlug` instead of `slug` in `recipeTools[]`** — the new brief
   format used `toolSlug` but the upload script expects `slug`. Renamed in
   all 40 files.

3. **Invalid tool slugs** — 20+ tool slugs referenced in briefs were not in
   the master `Tool` table (e.g. `large-heavy-casserole`, `meat-thermometer`,
   `wide-heavy-pan`). Remapped 62 tool references across 38 files to valid
   master slugs. Two genuinely new tools (`ramekins`, `spatula`) were added to
   `packages/db/scripts/data/tools.ts` and re-seeded.

**For future batches:** use `slug` (not `toolSlug`) in `recipeTools[]`,
always include `categorySlug`, and verify tool slugs against the master list
before upload.

## Carry-forward notes

- The 10 old-format files in this batch (British recipes from an earlier session)
  are now uploaded. No old-format files remain in the batch-003 set.
- Common recipe metadata fields (`cuisine`, `mood`, `servings`, `prep/cookMinutes`)
  in the new-format briefs are stored at top level but some map to `recipe.*`
  in `RecipeMetadata`. The upload script ignores unknown fields — these values
  are not stored in the DB from this batch. A future pass can backfill them
  if the admin UI surfaces them.
- All 50 recipes are live at `PUBLISHED` status under the `cooking` category.
