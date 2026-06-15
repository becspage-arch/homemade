-- Recipe creator economy notification types. (2026-06-15.)
--
-- Dedicated NotificationType values for the AI moderation outcome, replacing
-- the generic SYSTEM type the first cut used. Enum-additions live in their own
-- migration (Postgres forbids using a freshly-added enum value in the same
-- transaction it was added in); the runtime moderation pass uses them in a
-- later deploy step, after this migration has committed.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'USER_RECIPE_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'USER_RECIPE_REJECTED';
