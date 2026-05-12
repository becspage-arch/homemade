-- User.hardDeletedAt — bookkeeping stamp set by the daily hard-delete
-- cron when it scrubs an account whose 30-day grace period has elapsed.
-- Distinct from `deletedAt` so we can differentiate "scrubbed by user
-- request via the cron" from any future admin-initiated soft-delete.

ALTER TABLE "User" ADD COLUMN "hardDeletedAt" TIMESTAMP(3);
