-- phase_analytics_self_hosted_001
--
-- Adopts the Aura pattern: every fired event lands in AnalyticsEvent in
-- our own database, plus daily + cohort summary tables that the nightly
-- Inngest rollup writes to so the admin dashboards never have to
-- aggregate over the raw table at read time.
--
-- Additive only — no existing tables touched.

-- ─── AnalyticsEvent ─────────────────────────────────────────────────────

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clerkUserId" TEXT,
    "sessionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "category" TEXT,
    "properties" JSONB,
    "url" TEXT,
    "pathname" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "deviceClass" TEXT,
    "cohortWeek" TEXT,
    "acquisitionChannel" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_clerkUserId_createdAt_idx"
  ON "AnalyticsEvent"("clerkUserId", "createdAt");
CREATE INDEX "AnalyticsEvent_event_createdAt_idx"
  ON "AnalyticsEvent"("event", "createdAt");
CREATE INDEX "AnalyticsEvent_sessionId_createdAt_idx"
  ON "AnalyticsEvent"("sessionId", "createdAt");
CREATE INDEX "AnalyticsEvent_category_createdAt_idx"
  ON "AnalyticsEvent"("category", "createdAt");
CREATE INDEX "AnalyticsEvent_cohortWeek_event_createdAt_idx"
  ON "AnalyticsEvent"("cohortWeek", "event", "createdAt");
CREATE INDEX "AnalyticsEvent_pathname_createdAt_idx"
  ON "AnalyticsEvent"("pathname", "createdAt");
CREATE INDEX "AnalyticsEvent_country_createdAt_idx"
  ON "AnalyticsEvent"("country", "createdAt");
CREATE INDEX "AnalyticsEvent_acquisitionChannel_createdAt_idx"
  ON "AnalyticsEvent"("acquisitionChannel", "createdAt");

-- ─── AnalyticsDailyRollup ───────────────────────────────────────────────

CREATE TABLE "AnalyticsDailyRollup" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "metric" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsDailyRollup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsDailyRollup_date_metric_dimension_key"
  ON "AnalyticsDailyRollup"("date", "metric", "dimension");
CREATE INDEX "AnalyticsDailyRollup_metric_date_idx"
  ON "AnalyticsDailyRollup"("metric", "date");

-- ─── AnalyticsCohortRollup ──────────────────────────────────────────────

CREATE TABLE "AnalyticsCohortRollup" (
    "id" TEXT NOT NULL,
    "cohortWeek" TEXT NOT NULL,
    "weeksAfterSignup" INTEGER NOT NULL,
    "cohortSize" INTEGER NOT NULL,
    "retainedCount" INTEGER NOT NULL,
    "retentionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsCohortRollup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsCohortRollup_cohortWeek_weeksAfterSignup_key"
  ON "AnalyticsCohortRollup"("cohortWeek", "weeksAfterSignup");
CREATE INDEX "AnalyticsCohortRollup_cohortWeek_idx"
  ON "AnalyticsCohortRollup"("cohortWeek");

-- ─── AnalyticsRollupRun ─────────────────────────────────────────────────

CREATE TABLE "AnalyticsRollupRun" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "eventsProcessed" INTEGER NOT NULL DEFAULT 0,
    "metricsWritten" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "AnalyticsRollupRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsRollupRun_date_key"
  ON "AnalyticsRollupRun"("date");
