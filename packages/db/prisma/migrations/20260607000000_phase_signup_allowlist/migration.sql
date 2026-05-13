-- Phase: signup allowlist
--
-- Pre-launch gate. While `SIGNUP_ALLOWLIST_ENABLED` is true in the Clerk
-- webhook handler, any signup whose primary email isn't on this table is
-- deleted via the Clerk Backend API and the Prisma mirror row rolled back.
-- Seeded idempotently with the current admin email allowlist.

CREATE TABLE "SignupAllowlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "addedById" TEXT,
    "note" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupAllowlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SignupAllowlist_email_key" ON "SignupAllowlist"("email");
CREATE INDEX "SignupAllowlist_addedById_idx" ON "SignupAllowlist"("addedById");

ALTER TABLE "SignupAllowlist"
    ADD CONSTRAINT "SignupAllowlist_addedById_fkey"
    FOREIGN KEY ("addedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: the current `ADMIN_EMAILS` allowlist from
-- apps/web/src/lib/get-current-user.ts. Idempotent — running this migration
-- on a database that already has the row is a no-op.
INSERT INTO "SignupAllowlist" ("id", "email", "note", "createdAt", "updatedAt")
VALUES
    ('seed_rebecca_homemade', 'rebecca@homemade.education', 'Seeded by phase_signup_allowlist migration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;
