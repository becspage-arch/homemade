-- Phase 4 — accounts: bookmarks, user projects, reading-side User additions

-- CreateEnum
CREATE TYPE "UserProjectStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- AlterTable: User gains reading-side preferences and profile
ALTER TABLE "User" ADD COLUMN "beginnerMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "displayHandle" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;

CREATE UNIQUE INDEX "User_displayHandle_key" ON "User"("displayHandle");

-- CreateTable: Bookmark
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Bookmark_userId_tutorialId_key" ON "Bookmark"("userId", "tutorialId");
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

ALTER TABLE "Bookmark"
  ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark"
  ADD CONSTRAINT "Bookmark_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: UserProject
CREATE TABLE "UserProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "status" "UserProjectStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "abandonedAt" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "suppliesChecked" JSONB NOT NULL DEFAULT '[]',
    "readingProgressPercent" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserProject_userId_tutorialId_key" ON "UserProject"("userId", "tutorialId");
CREATE INDEX "UserProject_userId_idx" ON "UserProject"("userId");
CREATE INDEX "UserProject_status_idx" ON "UserProject"("status");

ALTER TABLE "UserProject"
  ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserProject"
  ADD CONSTRAINT "UserProject_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
