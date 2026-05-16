-- Mobile rebuild — phase_mobile_rebuild_001.
-- Adds push subscriptions, master toggle on User, cooking-mode auto-enable
-- preference, and the pushed/pushedAt bookkeeping on Notification.

-- User: master push toggle + cooking mode auto-open preference.
ALTER TABLE "User"
  ADD COLUMN "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "cookingModeAutoEnable"    BOOLEAN NOT NULL DEFAULT false;

-- Notification: track which entries were also dispatched as a push.
ALTER TABLE "Notification"
  ADD COLUMN "pushed"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pushedAt" TIMESTAMP(3);

-- Push platform enum used by PushSubscription.
CREATE TYPE "PushPlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- PushSubscription: one row per registered device-token per platform per
-- install. Soft-revoked via revokedAt rather than deleted so we can audit
-- delivery failures and keep historical category preferences.
CREATE TABLE "PushSubscription" (
  "id"                TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "platform"          "PushPlatform" NOT NULL,
  "deviceToken"       TEXT NOT NULL,
  "deviceId"          TEXT,
  "userAgent"         TEXT,
  "enabledCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lastActiveAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt"         TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PushSubscription_userId_platform_idx"
  ON "PushSubscription"("userId", "platform");
CREATE INDEX "PushSubscription_deviceToken_idx"
  ON "PushSubscription"("deviceToken");
CREATE INDEX "PushSubscription_revokedAt_idx"
  ON "PushSubscription"("revokedAt");

ALTER TABLE "PushSubscription"
  ADD CONSTRAINT "PushSubscription_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
