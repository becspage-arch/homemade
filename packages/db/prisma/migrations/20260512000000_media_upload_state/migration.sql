-- New columns on Media for the Phase 2e upload flow
ALTER TABLE "Media" ADD COLUMN "filename" TEXT;
ALTER TABLE "Media" ADD COLUMN "bytes" INTEGER;

-- Replace MediaStatus enum (moderation oriented) with upload-lifecycle states.
-- Moderation state will reappear as its own column in Phase 5 when NSFW scanning ships.
ALTER TABLE "Media" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Media" ALTER COLUMN "status" TYPE TEXT;
DROP TYPE "MediaStatus";
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADING', 'READY', 'FAILED');

UPDATE "Media" SET "status" = CASE
  WHEN "status" IN ('UPLOADING', 'READY', 'FAILED') THEN "status"
  WHEN "status" = 'PENDING' THEN 'UPLOADING'
  ELSE 'READY'
END;

ALTER TABLE "Media" ALTER COLUMN "status" TYPE "MediaStatus" USING "status"::"MediaStatus";
ALTER TABLE "Media" ALTER COLUMN "status" SET DEFAULT 'UPLOADING';
