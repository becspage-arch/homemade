-- S-8a sewing hero-flat renderer. Adds two nullable / defaulted
-- columns to SewingPattern. Forward-compatible; no backfill required.
--
-- heroRendererVersion tracks the renderer version that produced the
-- current hero. The batch script re-renders any row whose stored
-- version is below the current RENDERER_VERSION constant in
-- apps/web/src/lib/sewing/hero-flat/render-flat.ts.
--
-- heroNeedsFlatHand flags rows whose archetype is not mapped, so an
-- illustrator picks up the hero instead of the parametric renderer.

ALTER TABLE "SewingPattern"
  ADD COLUMN "heroRendererVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "heroNeedsFlatHand" BOOLEAN NOT NULL DEFAULT false;
