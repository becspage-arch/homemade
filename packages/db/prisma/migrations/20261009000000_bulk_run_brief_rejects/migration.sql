-- Additive: the brief post-filter's two counters. Both default to 0, so every
-- existing run reads as "the post-filter did nothing", which is true — it did
-- not exist when those runs were planned.
ALTER TABLE "BulkRun" ADD COLUMN     "propRejects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "collisionRejects" INTEGER NOT NULL DEFAULT 0;
