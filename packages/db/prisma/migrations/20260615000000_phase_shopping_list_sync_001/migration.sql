-- Shopping list sync. phase_shopping_list_sync_001 (2026-06-15).
--
-- Server-side persistence for the Maker's working shopping list, so it follows
-- them across devices. Free sign-in carrot, not premium: anonymous Makers keep
-- the same list in localStorage. One row per user. Strictly additive; guarded
-- for re-apply.

CREATE TABLE IF NOT EXISTS "ShoppingListState" (
  "id"                  TEXT NOT NULL,
  "userId"              TEXT NOT NULL,
  "recipeSlugs"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tickedIngredientIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShoppingListState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ShoppingListState_userId_key"
  ON "ShoppingListState" ("userId");

DO $$ BEGIN
  ALTER TABLE "ShoppingListState"
    ADD CONSTRAINT "ShoppingListState_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
