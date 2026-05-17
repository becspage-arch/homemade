-- Phase 8 Crochet pipeline scaffold — schema migration.
--
-- Adds Crochet-specific reference tables (Stitch, YarnWeight, CrochetHook)
-- and Tutorial crochet metadata columns, plus two new TutorialType enum
-- values (STITCH, PATTERN). Everything additive: no column drops, no
-- breaking renames; Cooking / Baking / Mindset / Garden / Herbal rows
-- untouched.
--
-- Stitch is intentionally craft-keyed (`craft = 'crochet' | 'knitting' |
-- ...`) so the knitting + needlework pipelines that follow can extend
-- the same master without a parallel `KnitStitch` table. CrochetHook
-- stays crochet-specific; the knitting pipeline will add KnittingNeedle
-- on the same shape with stitch-craft conversion happening in the body.
--
-- The chart system uses a single generic TipTap node + a JSON
-- `chartDefinition` column on Tutorial. The SVG chart renderer in
-- `apps/web/src/lib/craft-charts/svg-chart.tsx` (added in this phase)
-- reads the JSON and walks the symbol set in
-- `apps/web/src/lib/craft-charts/chart-symbols.ts`. Crochet uses UK
-- terminology + symbols by default; the renderer surfaces a
-- terminology toggle on the reader side.
--
-- Per `feedback_schema_all_fields_upfront.md`: every plausibly-useful
-- field lands now (UK + US abbreviations together, four hook-size
-- naming conventions together, gauge / finished-size / terminology
-- together, charts as a first-class JSON column rather than a TipTap
-- attribute), even where the anchor batch only exercises a subset.
--
-- See `docs/crochet-author.md` for the authoring prompt that decides
-- which fields are set for which sub-topic.

-- ─────────────────────────────────────────────────────────────────────
-- TutorialType — add STITCH and PATTERN.
--
-- STITCH   — one named stitch tutorial (chain, treble, magic ring,
--            slip stitch). Carries `craftStitchSlugs` (single-element
--            array referencing the stitch's master slug), optional
--            `chartDefinition`. No yarn / hook required (a STITCH
--            tutorial demonstrates the move, not a finished item).
-- PATTERN  — one finished-item pattern (granny square, dishcloth,
--            blanket, hat). Carries `primaryYarnWeightId`,
--            `primaryHookId`, `gaugeText`, `finishedSizeText`,
--            `terminologyConvention`, optional `chartDefinition`,
--            `craftStitchSlugs` (every stitch the pattern uses),
--            `craftTechniqueTags` (joining-as-you-go, blocking, etc.).
-- ─────────────────────────────────────────────────────────────────────
ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'STITCH';
ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'PATTERN';

-- ─────────────────────────────────────────────────────────────────────
-- Stitch — master table, craft-keyed.
--
-- Every named stitch in crochet + knitting + future needlework crafts
-- lives here. `craft` discriminates so the slug namespace doesn't
-- collide (knitting's "knit-stitch" and crochet's no-such-thing are
-- separate rows). UK + US naming + abbreviations live side by side
-- because crochet patterns hinge on the convention; the renderer
-- picks the reader's preferred terminology at view time.
--
-- Slug format: `crochet-treble-uk`, `crochet-double-uk`, `knitting-knit`
-- — the craft-prefix is part of the slug to keep cross-craft tutorials
-- unambiguous when both are referenced from the same body.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE "Stitch" (
  "id"               TEXT         NOT NULL,
  "slug"             TEXT         NOT NULL,
  -- craft: 'crochet' | 'knitting' | 'cross-stitch' | 'tatting' (the
  -- last two land with the needlework pipeline). Free-form string so
  -- additions don't need a migration.
  "craft"            TEXT         NOT NULL,
  -- canonicalName: the display name the publication uses by default.
  -- For crochet rows authored UK-first, this is the UK name ("treble").
  "canonicalName"    TEXT         NOT NULL,
  "ukName"           TEXT,
  "usName"           TEXT,
  "ukAbbreviation"   TEXT,
  "usAbbreviation"   TEXT,
  -- category: 'basic' | 'foundation' | 'textured' | 'lace' | 'colourwork'
  --           | 'edging' | 'joining' | 'special'. Free-form string —
  -- adding a new category later doesn't break the renderer.
  "category"         TEXT         NOT NULL,
  -- chartSymbol: the symbol key the SVG chart renderer reads. Matches
  -- one of the keys in `apps/web/src/lib/craft-charts/chart-symbols.ts`.
  -- Nullable because not every stitch has a charted symbol (textured
  -- stitches like "bobble" use a composite glyph defined per-pattern).
  "chartSymbol"      TEXT,
  -- difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' — surfaces in
  -- the stitch-library browse. Free-form string mirrors the Tutorial
  -- difficulty axis without introducing an enum coupling.
  "difficulty"       TEXT,
  "parentStitchId"   TEXT,
  "notes"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Stitch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Stitch_slug_key"     ON "Stitch"("slug");
CREATE        INDEX "Stitch_craft_idx"    ON "Stitch"("craft");
CREATE        INDEX "Stitch_category_idx" ON "Stitch"("category");
CREATE        INDEX "Stitch_parentStitchId_idx" ON "Stitch"("parentStitchId");

ALTER TABLE "Stitch"
  ADD CONSTRAINT "Stitch_parentStitchId_fkey"
  FOREIGN KEY ("parentStitchId") REFERENCES "Stitch"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────
-- YarnWeight — master table.
--
-- The Craft Yarn Council standard weight categories (0..7) plus the
-- traditional UK ply nomenclature. One row per weight category, not
-- per yarn brand — patterns specify weight + fibre content + colour in
-- the body, not the brand (the publication doesn't endorse brands).
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE "YarnWeight" (
  "id"                       TEXT         NOT NULL,
  "slug"                     TEXT         NOT NULL,
  -- canonicalName: the British convention name ("DK", "Aran", "Chunky").
  "canonicalName"            TEXT         NOT NULL,
  -- standardCategory: Craft Yarn Council number 0..7. Stored as INT so
  -- the renderer can sort weights without parsing strings.
  "standardCategory"         INT          NOT NULL,
  -- ukNames + usNames: the alternative names readers will see on yarn
  -- labels and in older pattern books. e.g. UK "DK" = US "light worsted".
  "ukNames"                  TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "usNames"                  TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- Wraps per inch — the traditional fibre-artist measurement for
  -- substituting yarn at the same weight without a label. Stored as
  -- text "14-18" so a range fits.
  "wrapsPerInch"             TEXT,
  -- Recommended hook + needle ranges in millimetres. Text strings
  -- ("3.0-3.5mm") let a range fit. Both columns populated on every
  -- row so the renderer can show "needle equivalent" beside a hook
  -- size and vice versa.
  "recommendedHookRangeMm"   TEXT,
  "recommendedNeedleRangeMm" TEXT,
  -- typicalDrape: 'drapey' | 'stable' | 'firm' | 'stiff'. Surfaces in
  -- the yarn-substitution helper.
  "typicalDrape"             TEXT,
  -- typicalProjects: plain-prose hint ("Garments, blankets at scale.").
  "typicalProjects"          TEXT,
  "notes"                    TEXT,
  "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                TIMESTAMP(3) NOT NULL,

  CONSTRAINT "YarnWeight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "YarnWeight_slug_key"             ON "YarnWeight"("slug");
CREATE UNIQUE INDEX "YarnWeight_standardCategory_key" ON "YarnWeight"("standardCategory");

-- ─────────────────────────────────────────────────────────────────────
-- CrochetHook — master table.
--
-- One row per millimetre size. Each row carries the UK, US, and JP
-- conversions because hook sizing is the area most likely to confuse
-- readers crossing patterns from a different region. mmSize is the
-- canonical sort key.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE "CrochetHook" (
  "id"                       TEXT             NOT NULL,
  "slug"                     TEXT             NOT NULL,
  "mmSize"                   DOUBLE PRECISION NOT NULL,
  -- Display name the publication uses by default — "4 mm hook (G/6)".
  "canonicalName"            TEXT             NOT NULL,
  -- ukSize: the old steel-and-imperial number ("8" for 4 mm). Most UK
  -- patterns from the 1970s back use this; modern UK patterns use mm.
  -- May be empty when the size has no UK number equivalent.
  "ukSize"                   TEXT,
  -- usSize: the letter+number convention ("G/6", "H/8", "I/9"). Some
  -- mm sizes have no exact US equivalent; the field is then empty.
  "usSize"                   TEXT,
  -- jpSize: Japanese hook sizes (2/0, 3/0, ...). Surfaces because
  -- many translated patterns from Japanese yarn-craft books use these.
  "jpSize"                   TEXT,
  -- suitableYarnWeightSlugs: slugs in the YarnWeight master table. The
  -- renderer surfaces this on the hook detail page as "works with".
  -- String array (no FK) to mirror PlantPest.affectedPlants — small
  -- list, frequent renderer access, no benefit to a join.
  "suitableYarnWeightSlugs"  TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes"                    TEXT,
  "createdAt"                TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                TIMESTAMP(3)     NOT NULL,

  CONSTRAINT "CrochetHook_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CrochetHook_slug_key"   ON "CrochetHook"("slug");
CREATE UNIQUE INDEX "CrochetHook_mmSize_key" ON "CrochetHook"("mmSize");

-- ─────────────────────────────────────────────────────────────────────
-- Tutorial — crochet-specific columns. All nullable; existing rows
-- untouched. Set on rows where `type IN (STITCH, PATTERN)` and the
-- tutorial sits under the `crochet` Category. The knitting pipeline
-- will reuse most of these columns (gauge, finished-size, terminology,
-- chartDefinition, craftStitchSlugs, craftTechniqueTags) without
-- adding parallel fields — only `primaryNeedleId` ships with that
-- migration.
--
-- primaryYarnWeightId / primaryHookId are SetNull FKs so deleting a
-- master row never cascades away an authored pattern. craftStitchSlugs
-- is a String[] (not a join table) to mirror the
-- `Tutorial.relatedConditionIds` pattern — patterns cross-reference a
-- handful of stitches and the renderer fetches them in one query.
--
-- chartDefinition is a JSON column the SVG chart renderer reads. Empty
-- on patterns that don't have a chart (simple-dishcloth); populated on
-- in-the-round motifs (granny-square, hexagon) and stitch tutorials
-- that benefit from a chart (treble — one-symbol chart showing the
-- stitch glyph).
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE "Tutorial"
  ADD COLUMN "primaryYarnWeightId"     TEXT,
  ADD COLUMN "primaryHookId"           TEXT,
  ADD COLUMN "gaugeText"               TEXT,
  ADD COLUMN "finishedSizeText"        TEXT,
  -- terminologyConvention: 'uk' | 'us'. Default null because most
  -- tutorial types ignore it; STITCH + PATTERN rows always set 'uk'
  -- unless the source pattern is American.
  ADD COLUMN "terminologyConvention"   TEXT,
  ADD COLUMN "chartDefinition"         JSONB,
  ADD COLUMN "craftStitchSlugs"        TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "craftTechniqueTags"      TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Tutorial"
  ADD CONSTRAINT "Tutorial_primaryYarnWeightId_fkey"
    FOREIGN KEY ("primaryYarnWeightId") REFERENCES "YarnWeight"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Tutorial_primaryHookId_fkey"
    FOREIGN KEY ("primaryHookId") REFERENCES "CrochetHook"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Public browse surfaces:
--   - "all granny-square patterns"           → (type, craftStitchSlugs)
--   - "all DK-weight patterns"               → primaryYarnWeightId
--   - "all 4 mm hook patterns"               → primaryHookId
--   - "patterns that use magic ring"         → craftTechniqueTags GIN
CREATE INDEX "Tutorial_primaryYarnWeightId_idx" ON "Tutorial"("primaryYarnWeightId");
CREATE INDEX "Tutorial_primaryHookId_idx"       ON "Tutorial"("primaryHookId");
CREATE INDEX "Tutorial_craftStitchSlugs_idx"    ON "Tutorial" USING GIN ("craftStitchSlugs");
CREATE INDEX "Tutorial_craftTechniqueTags_idx"  ON "Tutorial" USING GIN ("craftTechniqueTags");
CREATE INDEX "Tutorial_type_terminologyConvention_idx"
  ON "Tutorial"("type", "terminologyConvention");
