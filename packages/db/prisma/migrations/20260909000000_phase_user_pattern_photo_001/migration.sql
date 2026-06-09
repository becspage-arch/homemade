-- Migration: phase_user_pattern_photo_001
-- Adds UserPatternPhoto model + UserPhotoStatus enum + preferUserPhotoForHero
-- columns on Pattern and CrochetPattern.

-- CreateEnum
CREATE TYPE "UserPhotoStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESCINDED');

-- AlterTable: Pattern
ALTER TABLE "Pattern" ADD COLUMN "preferUserPhotoForHero" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: CrochetPattern
ALTER TABLE "CrochetPattern" ADD COLUMN "preferUserPhotoForHero" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: UserPatternPhoto
CREATE TABLE "UserPatternPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "patternType" "PatternType" NOT NULL,
    "mediaId" TEXT NOT NULL,
    "caption" TEXT,
    "status" "UserPhotoStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "reviewNotes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPatternPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPatternPhoto_patternId_status_idx" ON "UserPatternPhoto"("patternId", "status");

-- CreateIndex
CREATE INDEX "UserPatternPhoto_userId_idx" ON "UserPatternPhoto"("userId");

-- AddForeignKey
ALTER TABLE "UserPatternPhoto" ADD CONSTRAINT "UserPatternPhoto_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPatternPhoto" ADD CONSTRAINT "UserPatternPhoto_mediaId_fkey"
    FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPatternPhoto" ADD CONSTRAINT "UserPatternPhoto_reviewedByUserId_fkey"
    FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
