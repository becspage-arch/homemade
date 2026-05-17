-- phase_image_verification_001
--
-- Additive. Adds verification metadata to Media so the image-sourcing
-- orchestrator (Unsplash / Pexels / Wikimedia / Pixabay / Flux Schnell)
-- can record whether each hero image has been judged a plausible match
-- for its tutorial by a worker session. Existing rows default to
-- UNVERIFIED so a retroactive sweep can pick them up.

CREATE TYPE "MediaVerificationStatus" AS ENUM (
  'UNVERIFIED',
  'VERIFIED',
  'REJECTED',
  'REJECTED_USED_PROCEDURAL'
);

ALTER TABLE "Media"
  ADD COLUMN "verificationStatus" "MediaVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN "verificationReason" TEXT,
  ADD COLUMN "verifiedAt"         TIMESTAMP(3);

CREATE INDEX "Media_verificationStatus_idx" ON "Media"("verificationStatus");
