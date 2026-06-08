-- Pattern hero photography (phase_pattern_hero_media).
--
-- Adds `Pattern.heroMediaId` so a real photograph of the finished
-- stitched piece can sit on the library card, detail page, tutorial
-- inset, and PDF cover. The rendered chart thumbnail stays as the
-- automatic fall-through when no photo has been uploaded — matches the
-- Tutorial.heroMediaId pattern exactly so the same Media model + R2 +
-- Cloudflare-Images pipeline carries patterns at no extra cost.

ALTER TABLE "Pattern" ADD COLUMN "heroMediaId" TEXT;
CREATE INDEX "Pattern_heroMediaId_idx" ON "Pattern"("heroMediaId");
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_heroMediaId_fkey"
    FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
