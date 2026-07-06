-- Bulk generation autopilot switch — one row per pattern craft. The bulk cron
-- reads this to decide whether to auto-fill; the admin bulk page toggles it.
-- DB-backed so it survives deploys and an admin can flip it without a redeploy.
CREATE TABLE "BulkAutopilotState" (
    "craft" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkAutopilotState_pkey" PRIMARY KEY ("craft")
);
