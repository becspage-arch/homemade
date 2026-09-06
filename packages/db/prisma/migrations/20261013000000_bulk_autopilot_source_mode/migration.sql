-- The image model the cross-stitch bulk pipeline draws with.
--
-- 'schnell' is today's behaviour (fast, cheap, roughly one gem per fourteen
-- attempts). 'pro-all' runs Flux 1.1 Pro in every size lane, not just the dense
-- showpiece one — about two gems in five, at a similar cost per gem. In the DB
-- rather than in env so it can be flipped from the admin page without a deploy.
--
-- Additive, with a default that preserves the current behaviour.
ALTER TABLE "BulkAutopilotState" ADD COLUMN IF NOT EXISTS "sourceMode" TEXT NOT NULL DEFAULT 'schnell';
