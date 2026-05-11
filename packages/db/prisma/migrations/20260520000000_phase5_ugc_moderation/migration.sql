-- Phase 5 — UGC pipeline: reviews, photos, Q&A, errata, reports, suspensions, notifications

-- ────────────────────────────────────────────────────────────────────────────
-- Enums
-- ────────────────────────────────────────────────────────────────────────────

CREATE TYPE "ReviewStatus" AS ENUM ('PENDING_MODERATION', 'PUBLISHED', 'HIDDEN', 'REMOVED');
CREATE TYPE "UGCPhotoStatus" AS ENUM ('PENDING_MODERATION', 'APPROVED', 'REJECTED');
CREATE TYPE "UGCStatus" AS ENUM ('PENDING_MODERATION', 'PUBLISHED', 'HIDDEN', 'REMOVED');
CREATE TYPE "ErrataStatus" AS ENUM ('OPEN', 'ADDRESSED', 'DISMISSED');
CREATE TYPE "ReportTargetType" AS ENUM ('REVIEW', 'PHOTO', 'QUESTION', 'ANSWER', 'USER');
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'ABUSE', 'MISINFORMATION', 'COPYRIGHT', 'NSFW', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED_ACTION_TAKEN', 'RESOLVED_NO_ACTION', 'DISMISSED');
CREATE TYPE "SuspensionStatus" AS ENUM ('ACTIVE', 'LIFTED', 'EXPIRED');
CREATE TYPE "NotificationType" AS ENUM (
  'REVIEW_PUBLISHED', 'REVIEW_HIDDEN', 'REVIEW_REMOVED',
  'PHOTO_APPROVED', 'PHOTO_REJECTED',
  'QUESTION_PUBLISHED', 'QUESTION_HIDDEN',
  'ANSWER_PUBLISHED', 'ANSWER_HIDDEN',
  'ERRATA_ADDRESSED', 'ERRATA_DISMISSED',
  'ACCOUNT_SUSPENDED', 'ACCOUNT_UNSUSPENDED',
  'SYSTEM'
);

-- ────────────────────────────────────────────────────────────────────────────
-- User: suspension flags
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE "User" ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "suspendedUntil" TIMESTAMP(3);
CREATE INDEX "User_isSuspended_idx" ON "User"("isSuspended");

-- ────────────────────────────────────────────────────────────────────────────
-- Review
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_userId_tutorialId_key" ON "Review"("userId", "tutorialId");
CREATE INDEX "Review_tutorialId_status_createdAt_idx" ON "Review"("tutorialId", "status", "createdAt");
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- ReviewHelpful
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "ReviewHelpful" (
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewHelpful_pkey" PRIMARY KEY ("userId", "reviewId")
);

CREATE INDEX "ReviewHelpful_reviewId_idx" ON "ReviewHelpful"("reviewId");

ALTER TABLE "ReviewHelpful"
  ADD CONSTRAINT "ReviewHelpful_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewHelpful"
  ADD CONSTRAINT "ReviewHelpful_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- UGCPhoto
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "UGCPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "caption" TEXT,
    "status" "UGCPhotoStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "nsfwScore" DOUBLE PRECISION,
    "nsfwClassification" TEXT,
    "rejectionReason" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UGCPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UGCPhoto_tutorialId_status_idx" ON "UGCPhoto"("tutorialId", "status");
CREATE INDEX "UGCPhoto_status_createdAt_idx" ON "UGCPhoto"("status", "createdAt");
CREATE INDEX "UGCPhoto_userId_idx" ON "UGCPhoto"("userId");

ALTER TABLE "UGCPhoto"
  ADD CONSTRAINT "UGCPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UGCPhoto"
  ADD CONSTRAINT "UGCPhoto_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UGCPhoto"
  ADD CONSTRAINT "UGCPhoto_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UGCPhoto"
  ADD CONSTRAINT "UGCPhoto_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- Question
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "UGCStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Question_tutorialId_status_upvoteCount_idx" ON "Question"("tutorialId", "status", "upvoteCount");
CREATE INDEX "Question_userId_idx" ON "Question"("userId");

ALTER TABLE "Question"
  ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question"
  ADD CONSTRAINT "Question_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- Answer
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isAuthorAnswer" BOOLEAN NOT NULL DEFAULT false,
    "status" "UGCStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Answer_questionId_status_idx" ON "Answer"("questionId", "status");

ALTER TABLE "Answer"
  ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Answer"
  ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- QuestionUpvote
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "QuestionUpvote" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionUpvote_pkey" PRIMARY KEY ("userId", "questionId")
);

CREATE INDEX "QuestionUpvote_questionId_idx" ON "QuestionUpvote"("questionId");

ALTER TABLE "QuestionUpvote"
  ADD CONSTRAINT "QuestionUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionUpvote"
  ADD CONSTRAINT "QuestionUpvote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- Errata
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Errata" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tutorialId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ErrataStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Errata_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Errata_status_createdAt_idx" ON "Errata"("status", "createdAt");
CREATE INDEX "Errata_tutorialId_idx" ON "Errata"("tutorialId");

ALTER TABLE "Errata"
  ADD CONSTRAINT "Errata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Errata"
  ADD CONSTRAINT "Errata_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Errata"
  ADD CONSTRAINT "Errata_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- Report
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionAction" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

ALTER TABLE "Report"
  ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report"
  ADD CONSTRAINT "Report_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- UserSuspension
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "UserSuspension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suspendedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "liftedAt" TIMESTAMP(3),
    "liftedById" TEXT,
    "status" "SuspensionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSuspension_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserSuspension_userId_status_idx" ON "UserSuspension"("userId", "status");
CREATE INDEX "UserSuspension_status_endsAt_idx" ON "UserSuspension"("status", "endsAt");

ALTER TABLE "UserSuspension"
  ADD CONSTRAINT "UserSuspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSuspension"
  ADD CONSTRAINT "UserSuspension_suspendedById_fkey" FOREIGN KEY ("suspendedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSuspension"
  ADD CONSTRAINT "UserSuspension_liftedById_fkey" FOREIGN KEY ("liftedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- Notification
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
