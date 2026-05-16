-- AutopilotHaltSignal table + Inngest hourly cron drains it.

CREATE TABLE "AutopilotHaltSignal" (
  "id" TEXT NOT NULL,
  "stream" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "detail" TEXT,
  "notifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AutopilotHaltSignal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AutopilotHaltSignal_notifiedAt_createdAt_idx"
  ON "AutopilotHaltSignal"("notifiedAt", "createdAt");
