# Schema changes — recipes-first content architecture

This is a design document. Nothing here has been applied to `packages/db/prisma/schema.prisma` or run as a Prisma migration. Land the changes as one migration when a separate session picks the work up.

The changes implement what `project_content_pipeline.md` calls for: recipes as the primary content layer, with master `Ingredient` and `Tool` tables, structured ingredient rows on every recipe, the metadata fields the filter UI will read, and a single `type` discriminator on `Tutorial` so a recipe and a technique can share one row shape, one editor, one renderer, and one URL space.

---

## Design call — one model with a `type` enum, not a separate `Recipe` model

Both options were considered. The decision is **one `Tutorial` row with a `TutorialType` enum** discriminating `TECHNIQUE` from `RECIPE`.

Reasons:

1. **The editor, version history, renderer, and URL space already exist on Tutorial.** All eight custom TipTap blocks, lifecycle (`DRAFT` / `IN_REVIEW` / `PENDING_MODERATION` / `SCHEDULED` / `PUBLISHED` / `ARCHIVED`), `TutorialVersion`, the public `/[categorySlug]/[tutorialSlug]` route, the admin CRUD at `/admin/tutorials`, the search index, bookmarks, `UserProject`, reviews, photos, Q&A, errata, reading-progress — every one of these is wired to `Tutorial.id`. Splitting recipes into a sibling `Recipe` model would force every one of those to fork or grow a polymorphic union. That is a large refactor for no observable user benefit.
2. **Recipes link to techniques and vice versa.** The `SubTutorialCard` block already accepts any `Tutorial.id`. If recipes lived on a separate table the block would need a discriminator at the field level, or two blocks.
3. **The vast majority of new fields are optional on a technique anyway.** `servings`, `prepMinutes`, `cookMinutes`, `freezable`, `batchable`, `cuisine`, `mealType`, `mood` are all naturally null on a roux tutorial. Nullable columns on one table cost less than two parallel tables.
4. **The `type` enum costs one column and one index.** Filtering "show me recipes only" is `WHERE type = 'RECIPE'`. Filtering "show me techniques only" is the inverse. Cheap.
5. **Recipe-shaped behaviour lives on the ingredients join table, not on the parent row.** `RecipeIngredient` is the truly new structure. A technique tutorial simply does not have any `RecipeIngredient` rows. No schema cost.

The trade-off is that `Tutorial` accrues fields a technique never uses. Acceptable. The shape stays one editor, one renderer, one route, one search collection.

---

## New enum — `TutorialType`

```
enum TutorialType {
  TECHNIQUE  // Reference content. Roux, knife skills, glossary-like depth.
  RECIPE     // What users come for. Lasagna, chicken pie, sourdough loaf.
}
```

Default: `TECHNIQUE` on the migration backfill, so the two anchor tutorials (béchamel, jam) stay as techniques without manual intervention. New rows authored from `/admin/tutorials/new` default to `RECIPE` once the editor exposes the field.

---

## New fields on `Tutorial`

All optional (nullable or with a sensible default) so the migration backfills cleanly across the existing rows.

| Field | Type | Notes |
|---|---|---|
| `type` | `TutorialType` | Default `TECHNIQUE` on backfill, `RECIPE` for new admin rows. |
| `servings` | `Int?` | Default yield. Used as the divisor for the scale selector. |
| `prepMinutes` | `Int?` | Hands-on time before cooking starts. |
| `cookMinutes` | `Int?` | Active cooking / baking / proving time. |
| `totalMinutes` | `Int?` | Computed-on-save convenience field. Allows DB-side time-band filtering without a sum. |
| `scalable` | `Boolean` | Default `true`. Some bakes (sourdough, choux, anything where ratios drift non-linearly) flip this to `false`. |
| `freezable` | `Boolean` | Default `false`. |
| `freezeNotes` | `String?` | Plain text, displayed under a Freezing heading. |
| `batchable` | `Boolean` | Default `false`. |
| `batchNotes` | `String?` | Plain text. |
| `makeAheadNotes` | `String?` | Plain text. |
| `dietaryFlags` | `DietaryFlag[]` | Multi-valued. Derived on save from the ingredient rows where possible; admin can override. |
| `cuisine` | `Cuisine?` | Single enum. Null for a non-cuisine recipe (a generic shortbread, a cordial). |
| `mealType` | `MealType?` | Single enum. |
| `mood` | `RecipeMood[]` | Multi-valued. Curates the cross-cutting collections (comfort food, weeknight, party). |

### New enums supporting those fields

```
enum DietaryFlag {
  VEGETARIAN
  VEGAN
  GLUTEN_FREE
  DAIRY_FREE
  NUT_FREE
  EGG_FREE
  PORK_FREE       // covers halal-friendly without claiming halal certification
  KOSHER_FRIENDLY
  HALAL_FRIENDLY
  PESCATARIAN
  LOW_FODMAP
}

enum Cuisine {
  BRITISH
  ITALIAN
  FRENCH
  AMERICAN
  AMERICAN_SOUTHERN
  TEX_MEX
  GREEK
  SPANISH
  PORTUGUESE
  MEDITERRANEAN
  MIDDLE_EASTERN
  NORTH_AFRICAN
  CARIBBEAN
  EASTERN_EUROPEAN
  GERMAN_AUSTRIAN
  SCANDINAVIAN
  INDIAN_ANGLO   // Beeton-era + Anglo-Indian. Modern regional Indian deferred to v2.
  IRISH
  WELSH
  SCOTTISH
  CHINESE_CLASSICAL // pre-1928 Anglophone treatments; modern regional Chinese deferred.
  JAPANESE_CLASSICAL // ditto
  GENERIC          // no specific cuisine — a generic custard, a cordial
}

enum MealType {
  BREAKFAST
  BRUNCH
  LUNCH
  DINNER
  SIDE
  STARTER
  DESSERT
  SNACK
  DRINK
  CONDIMENT
  PRESERVE
  BAKE             // covers bread, biscuits, cake when meal-type is the wrong frame
}

enum RecipeMood {
  COMFORT_FOOD
  WEEKNIGHT
  WEEKEND_PROJECT
  PARTY
  FREEZER_FRIENDLY
  BATCH_COOK
  KID_FRIENDLY
  HEALTHY
  CHEAP
  IMPRESSIVE
  USE_UP_LEFTOVERS
  ONE_POT
  SHEET_PAN
  CHRISTMAS
  EASTER
  SUMMER_PICNIC
  AUTUMN_HARVEST
  SUNDAY_ROAST
  LUNCHBOX
  PICKY_EATERS
  STORE_CUPBOARD
  AIR_FRYER
  SLOW_COOKER
}

enum TimeBand {
  UNDER_30_MIN
  UNDER_60_MIN
  UNDER_2_HR
  WEEKEND
  OVERNIGHT
}
```

`timeBand` is derived from `totalMinutes` at query time — no column needed. Adding it as a derived column would be a premature optimisation.

---

## New table — `Ingredient`

The master row that every `RecipeIngredient` references. Seeded from `docs/ingredient-master.md`.

```
model Ingredient {
  id         String @id @default(cuid())
  slug       String @unique
  name       String
  pluralName String

  category IngredientCategory

  // Default unit used when the recipe author doesn't specify one. The structured
  // ingredients block can override per row.
  defaultUnit Unit

  // Dietary flags the ingredient carries. Used at recipe-save time to derive the
  // parent Tutorial.dietaryFlags by intersection.
  dietaryFlags DietaryFlag[]

  // Free text, surfaced on the ingredient detail page in future.
  notes String?

  // Substitutes are other ingredient IDs. Used by the future "what do I have"
  // cupboard query and by the supplies-card substitution hint.
  substitutes Ingredient[] @relation("IngredientSubstitutes")
  substituteOf Ingredient[] @relation("IngredientSubstitutes")

  recipeUses RecipeIngredient[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
}

enum IngredientCategory {
  FLOUR
  SUGAR
  FAT_OIL
  DAIRY
  EGG
  MEAT
  FISH_SHELLFISH
  VEGETABLE_ROOT
  VEGETABLE_BRASSICA
  VEGETABLE_ALLIUM
  VEGETABLE_LEAFY
  VEGETABLE_FRUITING    // tomatoes, peppers, aubergines
  VEGETABLE_SQUASH
  VEGETABLE_LEGUME      // fresh peas, beans, mangetout
  VEGETABLE_MUSHROOM
  VEGETABLE_OTHER
  FRUIT_STONE
  FRUIT_BERRY
  FRUIT_CITRUS
  FRUIT_POME            // apples, pears, quince
  FRUIT_TROPICAL
  FRUIT_OTHER
  NUT_SEED
  SPICE
  HERB_DRIED
  HERB_FRESH
  VINEGAR
  STOCK_PASTE
  CONDIMENT_SAUCE
  PULSE_GRAIN
  PASTA_NOODLE
  YEAST_LEAVENER
  CHOCOLATE_COCOA
  SALT_PEPPER
  ALCOHOL
  SWEETENER_OTHER
  OTHER
}

enum Unit {
  G
  KG
  ML
  L
  TSP
  TBSP
  CUP
  EACH
  PINCH
  HANDFUL
  CLOVE
  BUNCH
  SPRIG
  STICK
  SLICE
  CAN
  PACKET
  TO_TASTE
}
```

The `Unit` enum is deliberately small and printable. Conversion (g ↔ oz, ml ↔ fl oz) is a render-side concern, not a storage one.

---

## New table — `Tool`

Master row for every piece of kit a recipe lists. Seeded from `docs/tools-master.md`.

```
model Tool {
  id   String @id @default(cuid())
  slug String @unique
  name String

  category ToolCategory

  // Whether Homemade plans to sell or affiliate-link this tool. Drives the
  // future Buy panel.
  purchasable Boolean @default(false)

  // Free text — the editorial paragraph on the tool detail page (future).
  notes String?

  recipeUses RecipeTool[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
}

enum ToolCategory {
  KNIFE
  CHOPPING_BOARD
  POT_PAN
  ROASTING_TIN
  BAKING_TIN
  OVENWARE
  BOWL_CONTAINER
  MEASURING
  MIXER_BLENDER
  HAND_TOOL          // whisks, peelers, microplanes, spatulas, tongs
  THERMOMETER_TIMER
  STRAINER_SIEVE
  PASTRY_TOOL        // rolling pins, pastry brushes, lattice cutters
  PRESERVING
  AIR_FRYER
  SLOW_COOKER
  PRESSURE_COOKER
  STOVETOP_SPECIAL   // tagine, paella pan, wok, mortar
  GRILL_BBQ
  ELECTRIC_OTHER
  STORAGE
  CLEANING
  OTHER
}
```

---

## New join table — `RecipeIngredient`

The structured ingredient row that replaces the free-text supplies card for recipes.

```
model RecipeIngredient {
  id String @id @default(cuid())

  tutorialId String
  tutorial   Tutorial @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  ingredientId String
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Restrict)

  // Quantity in the unit. Decimal to allow 0.5, 1.5, 2.25.
  amount Decimal? @db.Decimal(8, 3)
  unit   Unit?

  // Free text — "finely chopped", "at room temperature", "plus extra to dust".
  prepNote String?

  // Order within the recipe's ingredients list. Lower = earlier.
  order Int @default(0)

  // Whether this row scales linearly with the scale selector. Default true; an
  // author can flip it off for an ingredient like "1 egg for the wash" that
  // should not multiply by 4 when the recipe scales 4x.
  scalable Boolean @default(true)

  // Whether this ingredient is part of a sub-component group (e.g. "for the
  // pastry", "for the filling"). Null = main list. Free text so authors can
  // name groups freely.
  groupLabel String?

  // Optional — a row can mark itself optional so the front-end can render it
  // in a separate "to finish" / "optional" cluster.
  optional Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tutorialId, order])
  @@index([ingredientId])
}
```

`onDelete: Restrict` on the `ingredientId` link is deliberate — deleting a master ingredient should require a confirm sweep across recipes, not a silent cascade.

---

## New join table — `RecipeTool`

```
model RecipeTool {
  id String @id @default(cuid())

  tutorialId String
  tutorial   Tutorial @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  toolId String
  tool   Tool @relation(fields: [toolId], references: [id], onDelete: Restrict)

  // Whether this tool is essential or nice-to-have for this specific recipe.
  // Tool.optional is the catalogue-default; this overrides per recipe.
  optional Boolean @default(false)

  notes String?
  order Int    @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tutorialId, toolId])
  @@index([tutorialId, order])
}
```

The unique constraint on `(tutorialId, toolId)` prevents a recipe from listing the same whisk twice. Ingredients deliberately do not carry that constraint — a recipe legitimately uses flour in two groups (pastry and dusting).

---

## New TipTap block — `ingredientsList`

This block replaces the existing free-text `suppliesCard` on recipe-type tutorials. Techniques keep `suppliesCard` for soft-supplies use (a list of materials that doesn't warrant a structured row each).

### Block-level attributes

| Attribute | Type | Notes |
|---|---|---|
| `scalable` | `boolean` | Mirrors `Tutorial.scalable`. The block reads this to decide whether to render the scale selector at all. |
| `defaultServings` | `number` | Mirrors `Tutorial.servings`. Authors keep them in sync via the editor. |
| `unitsSystem` | `'metric' \| 'imperial'` | Author-locked default. The reader can override at the page level via a future toggle. |

### Row-level attributes

| Attribute | Type | Notes |
|---|---|---|
| `ingredientId` | `string` | FK into `Ingredient`. Required. |
| `amount` | `number \| null` | Null for "to taste" and similar. |
| `unit` | `Unit` | Defaults to the ingredient's `defaultUnit`. |
| `prepNote` | `string \| null` | "Finely chopped", "at room temperature". |
| `scalable` | `boolean` | Row-level override of the block-level default. |
| `optional` | `boolean` | Renders in the "to finish / optional" cluster. |
| `groupLabel` | `string \| null` | Free text. Same value across consecutive rows groups them. |

### Editor UX

- A typeahead inside the row picks an ingredient by slug or name. Adding an unknown ingredient creates a draft row in `Ingredient` (admin-only) that the seeder won't overwrite, with a "needs review" flag the master-list session can sweep periodically.
- The block renders a live preview of the scaled output below it.
- Saving a tutorial syncs the block's row list into `RecipeIngredient` rows in one transaction. Removing a row deletes the join. Reordering updates `order`.

### Public renderer

- Lays out groups in declared order. Within a group, rows display as `{amount} {unit} {ingredient.name}{, prepNote}`.
- The scale selector reads `block.scalable && tutorial.scalable`. When both are true, the scaler shows 1×, 2×, 4×, and a custom-servings input. Otherwise the selector is hidden with a small "this recipe doesn't scale linearly" tooltip on hover.
- Token substitution in method paragraphs (future) — `{{flour}}` resolves to the scaled `amount unit` for the row whose `ingredient.slug === 'flour'`. Out of scope for this migration; the schema is ready for it.

---

## Migration strategy — one Prisma migration

Land the changes as a single migration. Order inside the migration:

1. Create new enums: `TutorialType`, `DietaryFlag`, `Cuisine`, `MealType`, `RecipeMood`, `IngredientCategory`, `Unit`, `ToolCategory`.
2. Create `Ingredient` table and its self-relation join.
3. Create `Tool` table.
4. Add new columns to `Tutorial`: `type` (default `TECHNIQUE`), `servings`, `prepMinutes`, `cookMinutes`, `totalMinutes`, `scalable` (default `true`), `freezable` (default `false`), `freezeNotes`, `batchable` (default `false`), `batchNotes`, `makeAheadNotes`, `dietaryFlags`, `cuisine`, `mealType`, `mood`.
5. Create `RecipeIngredient` table.
6. Create `RecipeTool` table.
7. Add indexes: `Tutorial(type, status, publishedAt)`, `Tutorial(cuisine, status)`, `Tutorial(mealType, status)`.

The migration is additive only. No data backfill needed for the two existing anchor tutorials — they stay `TECHNIQUE`, with all the new optional fields null.

The seeder (separate session) runs after the migration:

1. Seeds `Ingredient` rows from `docs/ingredient-master.md`.
2. Seeds `Tool` rows from `docs/tools-master.md`.

Recipe rows themselves are authored through the editor in pilot batches, not seeded — that's the author loop.

---

## Search index — out of scope here

The Typesense collection schema needs three new facet fields: `type`, `cuisine`, `mealType`, plus a multi-valued `mood` and `dietaryFlags`. Wire that as a separate task once the migration lands — `packages/search` already has the sync hook surface for it, and the backfill script can populate the new facets in one pass.

---

## Filter / scaling UI — out of scope here

The category and search pages need filter chips for cuisine, meal type, mood, dietary flag, and total-time band. The recipe page needs the scale selector wired to the structured-ingredients block. Both are separate front-end sessions.

---

## Cupboard query — out of scope here

The "what can I make with what I have" surface needs a new query path joining `RecipeIngredient` to a per-user pantry list. Defer until the recipe library is large enough for it to feel useful — likely after the pilot batch of 50 lands.

---

## Out-of-scope items, summarised

- Typesense schema and backfill changes for the new facets.
- Front-end filter UI (cuisine / meal type / mood / dietary / time band).
- Front-end scaling UI and token substitution in method paragraphs.
- Cupboard mode query.
- Admin master-list CRUD pages (`/admin/ingredients`, `/admin/tools`) — useful but not blocking; seed-only is enough to start.
- Migration data backfill from the two anchor tutorials into structured ingredient rows. They can stay as their current `suppliesCard` blocks; new recipes use `ingredientsList`.
- Tutorial body content migration from `suppliesCard` to `ingredientsList` for any future technique that is really a recipe — handle on a case-by-case basis when those rows are edited.
