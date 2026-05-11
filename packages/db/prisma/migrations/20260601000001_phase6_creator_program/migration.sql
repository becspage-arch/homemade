-- Phase 6 — Creator program + pattern testing
--
-- Adds:
-- * Creator-program flags on User (isCreator / creatorVerifiedAt / isPatternTester)
-- * Tutorial.creatorId for creator-authored tutorials
-- * CreatorProfile (one row per applicant / approved creator)
-- * PatternTest + TestAssignment for the pattern-testing flow
-- * Three new enums (CreatorApplicationStatus, PatternTestStatus, TestAssignmentStatus)
--
-- The TutorialStatus.PENDING_MODERATION value and the new NotificationType
-- values land in a preceding enum-only migration so this migration can run
-- inside one transaction.

-- CreateEnum
CREATE TYPE "CreatorApplicationStatus" AS ENUM ('NONE', 'APPLIED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PatternTestStatus" AS ENUM ('DRAFT', 'RECRUITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TestAssignmentStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'WITHDRAWN', 'REJECTED');

-- AlterTable: User picks up creator-program flags
ALTER TABLE "User"
  ADD COLUMN "creatorVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "isCreator" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isPatternTester" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_isCreator_idx" ON "User"("isCreator");

-- AlterTable: Tutorial picks up optional creator FK
ALTER TABLE "Tutorial" ADD COLUMN "creatorId" TEXT;

CREATE INDEX "Tutorial_creatorId_status_publishedAt_idx" ON "Tutorial"("creatorId", "status", "publishedAt");

ALTER TABLE "Tutorial"
  ADD CONSTRAINT "Tutorial_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CreatorProfile
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "instagramHandle" TEXT,
    "youtubeHandle" TEXT,
    "tiktokHandle" TEXT,
    "substackUrl" TEXT,
    "pinterestHandle" TEXT,
    "applicationStatus" "CreatorApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "applicationNote" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");
CREATE INDEX "CreatorProfile_applicationStatus_appliedAt_idx" ON "CreatorProfile"("applicationStatus", "appliedAt");

ALTER TABLE "CreatorProfile"
  ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorProfile"
  ADD CONSTRAINT "CreatorProfile_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: PatternTest
CREATE TABLE "PatternTest" (
    "id" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "PatternTestStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "briefForTesters" TEXT NOT NULL,
    "maxTesters" INTEGER NOT NULL DEFAULT 5,
    "recruitingClosesAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatternTest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatternTest_status_createdAt_idx" ON "PatternTest"("status", "createdAt");
CREATE INDEX "PatternTest_creatorId_status_idx" ON "PatternTest"("creatorId", "status");
CREATE INDEX "PatternTest_tutorialId_idx" ON "PatternTest"("tutorialId");

ALTER TABLE "PatternTest"
  ADD CONSTRAINT "PatternTest_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatternTest"
  ADD CONSTRAINT "PatternTest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: TestAssignment
CREATE TABLE "TestAssignment" (
    "id" TEXT NOT NULL,
    "patternTestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TestAssignmentStatus" NOT NULL DEFAULT 'APPLIED',
    "applicationNote" TEXT,
    "feedback" JSONB,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TestAssignment_patternTestId_userId_key" ON "TestAssignment"("patternTestId", "userId");
CREATE INDEX "TestAssignment_userId_status_idx" ON "TestAssignment"("userId", "status");
CREATE INDEX "TestAssignment_patternTestId_status_idx" ON "TestAssignment"("patternTestId", "status");

ALTER TABLE "TestAssignment"
  ADD CONSTRAINT "TestAssignment_patternTestId_fkey" FOREIGN KEY ("patternTestId") REFERENCES "PatternTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAssignment"
  ADD CONSTRAINT "TestAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
