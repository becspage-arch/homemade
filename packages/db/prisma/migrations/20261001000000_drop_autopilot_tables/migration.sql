-- Drop the retired content-autopilot tables. The content autopilot is retired
-- (categories grow on demand via the on-demand fill worker), and its hourly
-- halt-notify Inngest cron was still emailing stale June halt signals. Both
-- tables were only touched by the retired autopilot's scripts — no live code
-- reads them. Indexes drop with the tables.
DROP TABLE IF EXISTS "AutopilotHaltSignal";
DROP TABLE IF EXISTS "AutopilotPauseState";
