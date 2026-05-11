-- Phase 6 — Creator program: split enum-additions out of the main migration so
-- the main migration can run in a single transaction. Postgres < 14 forbids
-- using a newly-added enum value in the same transaction it was added in;
-- this migration adds the values, the next one uses them.

-- AlterEnum: TutorialStatus picks up PENDING_MODERATION for creator-authored drafts
ALTER TYPE "TutorialStatus" ADD VALUE 'PENDING_MODERATION';

-- AlterEnum: NotificationType picks up the new Phase 6 events
ALTER TYPE "NotificationType" ADD VALUE 'CREATOR_APPLICATION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'CREATOR_APPLICATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'CREATOR_TUTORIAL_PUBLISHED';
ALTER TYPE "NotificationType" ADD VALUE 'CREATOR_TUTORIAL_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'CREATOR_TUTORIAL_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'PATTERN_TEST_APPLICATION_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'PATTERN_TEST_APPLICATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'PATTERN_TEST_FEEDBACK_RECEIVED';
