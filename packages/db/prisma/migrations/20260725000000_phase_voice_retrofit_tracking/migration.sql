-- Voice-retrofit tracking field — separate from `revisedFrom` which is shared
-- across multiple pipelines and is contaminated by image-relevance worker
-- output. The voice-retrofit routine filters on `voiceRetrofittedAt IS NULL`.

ALTER TABLE "Tutorial" ADD COLUMN "voiceRetrofittedAt" TIMESTAMP(3);

CREATE INDEX "Tutorial_voiceRetrofittedAt_idx" ON "Tutorial"("voiceRetrofittedAt");
