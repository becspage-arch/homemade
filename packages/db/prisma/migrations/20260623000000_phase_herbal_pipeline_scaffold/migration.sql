-- Phase 8 Herbal Medicine pipeline scaffold — schema migration.
--
-- Adds Herbal-Medicine-specific reference tables (Herb, Condition,
-- HerbConditionUse) and the herbal recipe metadata columns on Tutorial,
-- plus two new TutorialType enum values (REMEDY, HERB_PROFILE).
--
-- Everything is additive: no column drops, no breaking renames; existing
-- Cooking, Baking and Mindset rows untouched. Cooking / Baking recipes
-- ignore the herbal columns. Herbal entries live under the existing
-- `herbal-medicine` Category seeded in `seed-categories.ts`; the
-- sub-categories (materia-medica, foundations, digestive, respiratory,
-- nervous-system, skin, womens-health, mental-emotional, musculoskeletal,
-- immune-support) seed separately via `seed-herbal-taxonomy.ts`.
--
-- Per `feedback_schema_all_fields_upfront.md` every plausibly-useful
-- field is added now, not staged for a follow-up migration. Per
-- `feedback_homemade_voice.md` the safety stakes for herbal medicine
-- are the strictest of any category — see `docs/herbal-author.md`.

-- ─────────────────────────────────────────────────────────────────────────
-- TutorialType — add REMEDY and HERB_PROFILE.
--
-- REMEDY        — a preparation tutorial (tincture, decoction, infusion,
--                 oil, salve, balm, syrup, compress, poultice, bath,
--                 steam). Carries `primaryHerbId`, optional
--                 `relatedConditionIds`, `preparationType`,
--                 `safetyFlags`, and `requiresMedicalDisclaimer` (default
--                 true).
-- HERB_PROFILE  — a single-herb materia-medica entry. Carries
--                 `primaryHerbId` and no recipe / preparation metadata.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'REMEDY';
ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'HERB_PROFILE';

-- ─────────────────────────────────────────────────────────────────────────
-- Herb — master table.
-- ~40 starter rows seeded via `seed-herbs.ts`. Slug-keyed so authoring
-- briefs can reference a herb by `primaryHerbSlug` and the upload
-- script resolves to the cuid.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE "Herb" (
  "id"                   TEXT         NOT NULL,
  "slug"                 TEXT         NOT NULL,
  "commonName"           TEXT         NOT NULL,
  "latinBinomial"        TEXT         NOT NULL,
  "family"               TEXT,
  -- partsUsed: 'leaf' | 'root' | 'flower' | 'bark' | 'seed' | 'berry'
  --            | 'rhizome' | 'bulb' | 'aerial-parts' | 'whole' | 'resin'.
  "partsUsed"            TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- primaryActions: nervine | adaptogen | carminative | demulcent
  --                 | expectorant | anti-inflammatory | digestive-bitter
  --                 | astringent | diuretic | antimicrobial
  --                 | circulatory-stimulant | hepatic | diaphoretic
  --                 | emmenagogue | analgesic | sedative | tonic | etc.
  "primaryActions"       TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "keyConstituents"      TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- traditionsCited: 'western-herbal' | 'chinese-medicine' | 'ayurveda'
  --                 | 'folk-european' | 'native-american' | etc.
  "traditionsCited"      TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- safetyFlags: 'pregnancy-caution' | 'breastfeeding-caution'
  --              | 'not-with-anticoagulants' | 'not-with-ssri'
  --              | 'not-with-contraceptives' | 'not-long-term'
  --              | 'liver-caution' | 'kidney-caution' | 'photosensitising'
  --              | 'external-use-only' | 'paediatric-caution'
  --              | 'allergen-asteraceae' | 'hypotensive' | 'hypertensive'.
  "safetyFlags"          TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "drugInteractionNotes" TEXT,
  "notes"                TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Herb_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Herb_slug_key"        ON "Herb"("slug");
CREATE        INDEX "Herb_commonName_idx"  ON "Herb"("commonName");
CREATE        INDEX "Herb_latinBinomial_idx" ON "Herb"("latinBinomial");

-- ─────────────────────────────────────────────────────────────────────────
-- Condition — reference table.
-- ~30 starter rows seeded via `seed-conditions.ts`. Slug-keyed; authoring
-- briefs reference conditions through `relatedConditionSlugs[]`.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE "Condition" (
  "id"                    TEXT         NOT NULL,
  "slug"                  TEXT         NOT NULL,
  "name"                  TEXT         NOT NULL,
  -- bodySystem: 'digestive' | 'respiratory' | 'nervous' | 'musculoskeletal'
  --             | 'skin' | 'womens-health' | 'mental-emotional'
  --             | 'immune' | 'circulatory' | 'urinary' | 'endocrine'.
  "bodySystem"            TEXT         NOT NULL,
  "commonSymptoms"        TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "redFlagsRequireDoctor" TEXT,
  "notes"                 TEXT,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Condition_slug_key"       ON "Condition"("slug");
CREATE        INDEX "Condition_bodySystem_idx" ON "Condition"("bodySystem");

-- ─────────────────────────────────────────────────────────────────────────
-- HerbConditionUse — relation table.
-- One row per (herb, condition, preparationType) triple. Powers the
-- "what helps for X" cross-reference and the herb-profile "traditional
-- uses" surface.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE "HerbConditionUse" (
  "id"                  TEXT         NOT NULL,
  "herbId"              TEXT         NOT NULL,
  "conditionId"         TEXT         NOT NULL,
  -- preparationType: 'tincture' | 'decoction' | 'infusion' | 'oil'
  --                  | 'salve' | 'balm' | 'syrup' | 'compress'
  --                  | 'poultice' | 'bath' | 'steam' | 'inhalation'
  --                  | 'gargle' | 'capsule'.
  "preparationType"     TEXT         NOT NULL,
  "traditionalUseNotes" TEXT,
  -- evidenceLevel: 'traditional' | 'case-based' | 'clinical-trial-supported'
  --                | 'well-established'. Conservative — see
  --                `docs/herbal-author.md` § "Evidence levels".
  "evidenceLevel"       TEXT         NOT NULL,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HerbConditionUse_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HerbConditionUse_herbId_fkey" FOREIGN KEY ("herbId")
    REFERENCES "Herb"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HerbConditionUse_conditionId_fkey" FOREIGN KEY ("conditionId")
    REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "HerbConditionUse_herbId_conditionId_preparationType_key"
  ON "HerbConditionUse"("herbId", "conditionId", "preparationType");
CREATE        INDEX "HerbConditionUse_herbId_idx"      ON "HerbConditionUse"("herbId");
CREATE        INDEX "HerbConditionUse_conditionId_idx" ON "HerbConditionUse"("conditionId");

-- ─────────────────────────────────────────────────────────────────────────
-- Tutorial — herbal-specific columns.
--
-- Null on every non-herbal row. `primaryHerbId` is a SetNull FK so
-- deleting a herb doesn't cascade away the tutorial (an authored remedy
-- shouldn't vanish because the master row gets cleaned up).
-- `relatedConditionIds` is a String[] (not a Prisma relation) to mirror
-- the `alternativePracticeIds` pattern on Mindset rows — no join table,
-- ids carried directly so the renderer can fetch with a single query.
-- `requiresMedicalDisclaimer` defaults true: herbal rows show the
-- disclaimer unless an editor explicitly unsets it (e.g. for a
-- pure-historical materia-medica reading where the disclaimer is
-- handled in the body itself).
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE "Tutorial"
  ADD COLUMN "primaryHerbId"             TEXT,
  ADD COLUMN "relatedConditionIds"       TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "preparationType"           TEXT,
  ADD COLUMN "safetyFlags"               TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "requiresMedicalDisclaimer" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Tutorial"
  ADD CONSTRAINT "Tutorial_primaryHerbId_fkey" FOREIGN KEY ("primaryHerbId")
    REFERENCES "Herb"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for the public browse surfaces:
--   - "all remedies that use chamomile" → primaryHerbId filter
--   - "all tincture remedies"           → (type, preparationType) filter
CREATE INDEX "Tutorial_primaryHerbId_idx"        ON "Tutorial"("primaryHerbId");
CREATE INDEX "Tutorial_type_preparationType_idx" ON "Tutorial"("type", "preparationType");
