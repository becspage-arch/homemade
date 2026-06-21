-- Premium entitlement (gating framework — Session E).
-- Additive only: three new nullable/defaulted columns on User plus a filter
-- index. `premiumActive` is the single source of truth read by hasPremium();
-- `premiumSince` / `premiumUntil` are populated later by Stripe (Session F).
-- No changes to existing data — every current row defaults to non-premium.

ALTER TABLE "User" ADD COLUMN "premiumActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "premiumSince" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "premiumUntil" TIMESTAMP(3);

CREATE INDEX "User_premiumActive_idx" ON "User"("premiumActive");
