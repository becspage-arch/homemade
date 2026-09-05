-- Signup spam signal (admin Members activity). Flag-only fields — nothing here
-- blocks or deletes an account. All additive + idempotent (ADD COLUMN IF NOT
-- EXISTS), so a re-run is a no-op.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupRiskScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupRiskReasons" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupIp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupUserAgent" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailDomain" TEXT;

CREATE INDEX IF NOT EXISTS "User_signupRiskScore_idx" ON "User"("signupRiskScore");
CREATE INDEX IF NOT EXISTS "User_emailDomain_idx" ON "User"("emailDomain");
