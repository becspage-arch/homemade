-- Phase 8a — Legal compliance: GDPR data rights + DMCA takedowns
--
-- Adds:
-- * User columns: cookieConsent (Json?), deletionScheduledFor, deletedAt
-- * DataExportRequest + DataExportStatus enum
-- * AccountDeletionRequest + DeletionStatus enum (one active row per user)
-- * DmcaTakedownRequest + DmcaStatus enum

-- CreateEnum
CREATE TYPE "DataExportStatus" AS ENUM ('REQUESTED', 'PROCESSING', 'READY', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "DeletionStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DmcaStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'REJECTED', 'COUNTER_NOTICED');

-- AlterTable: User picks up cookie-consent + deletion lifecycle columns
ALTER TABLE "User"
  ADD COLUMN "cookieConsent" JSONB,
  ADD COLUMN "deletionScheduledFor" TIMESTAMP(3),
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable: DataExportRequest
CREATE TABLE "DataExportRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "DataExportStatus" NOT NULL DEFAULT 'REQUESTED',
    "fileUrl" TEXT,
    "fileKey" TEXT,
    "bytes" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "DataExportRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataExportRequest_userId_createdAt_idx" ON "DataExportRequest"("userId", "createdAt");
CREATE INDEX "DataExportRequest_status_expiresAt_idx" ON "DataExportRequest"("status", "expiresAt");

ALTER TABLE "DataExportRequest"
  ADD CONSTRAINT "DataExportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: AccountDeletionRequest
CREATE TABLE "AccountDeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "DeletionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccountDeletionRequest_userId_key" ON "AccountDeletionRequest"("userId");
CREATE INDEX "AccountDeletionRequest_status_scheduledFor_idx" ON "AccountDeletionRequest"("status", "scheduledFor");

ALTER TABLE "AccountDeletionRequest"
  ADD CONSTRAINT "AccountDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: DmcaTakedownRequest
CREATE TABLE "DmcaTakedownRequest" (
    "id" TEXT NOT NULL,
    "claimantName" TEXT NOT NULL,
    "claimantEmail" TEXT NOT NULL,
    "claimantAddress" TEXT,
    "contentUrl" TEXT NOT NULL,
    "contentDescription" TEXT NOT NULL,
    "swornStatementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" "DmcaStatus" NOT NULL DEFAULT 'RECEIVED',
    "actionTakenNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "DmcaTakedownRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DmcaTakedownRequest_status_createdAt_idx" ON "DmcaTakedownRequest"("status", "createdAt");

ALTER TABLE "DmcaTakedownRequest"
  ADD CONSTRAINT "DmcaTakedownRequest_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
