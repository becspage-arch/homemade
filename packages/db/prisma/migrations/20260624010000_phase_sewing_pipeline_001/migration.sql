-- Phase Sewing pipeline scaffold — schema migration.
--
-- Adds Sewing-specific reference tables (Fabric, SewingNotion), the
-- `PATTERN` TutorialType enum value, and the sewing-specific metadata
-- columns on Tutorial.
--
-- Everything is additive: no column drops, no breaking renames, existing
-- Cooking / Baking / Mindset / Garden / Herbal rows untouched. Sewing
-- pulls authoring shape from two TutorialType values:
--
--   TECHNIQUE — already exists. Hand-stitch types, machine-stitch
--               fundamentals, seam + hem types, edge finishes, closures
--               (zip / button / drawstring), gathering / ruffling /
--               pleating, mending and visible-mending styles, quilting
--               basics, fabric prep + pattern marking.
--   PATTERN   — new. Rectangle and gathered-rectangle project
--               tutorials (aprons, pinafores, simple peasant tops,
--               trousers from rectangles, A-line skirts, cushion covers,
--               curtains, soft toys, bags, baby items, reusable
--               household goods, Christmas decorations, dog beds, etc.).
--               Out of scope at launch: fitted-garment patterns
--               requiring pattern pieces (those need a tester pipeline +
--               pattern digitisation workstream).
--
-- Per `feedback_schema_all_fields_upfront.md` every plausibly-useful
-- field is added now, not staged for a follow-up migration. The
-- difficulty axis reuses the existing `Tutorial.difficulty` column —
-- BEGINNER / INTERMEDIATE / ADVANCED is shared across categories.
--
-- See `docs/sewing-author.md` for the authoring prompt + per-type body
-- shape guidance.

-- ─────────────────────────────────────────────────────────────────────────
-- TutorialType — add PATTERN.
--
-- PATTERN — rectangle / gathered-rectangle / panel-construction project
--           tutorial. Carries `projectShape`, `requiredFabricTypes`,
--           `requiredNotions`, `sewingMethod`, `fabricYardageMetres`,
--           `finishedDimensionsCm`, and optional `bodyMeasurementsRequired`
--           (for the gathered-rectangle clothing items where the cut is
--           sized to the body — bust girth on a peasant top, waist
--           measurement on a drawstring trouser, etc.).
--
-- ALTER TYPE ADD VALUE is safe in a migration transaction on Postgres
-- 12+ as long as the new value is not referenced in the same migration.
-- We never reference 'PATTERN' in the SQL below, so this is fine.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'PATTERN';

-- ─────────────────────────────────────────────────────────────────────────
-- Fabric — master reference table for fabric types. Analogous to
-- `Ingredient` for the food categories. Tutorials reference it by slug
-- (no Prisma relation; tutorials cross-link fabrics in body prose and
-- in the `Tutorial.requiredFabricTypes` String[]).
--
-- `weightCategory`, `drape`, and `category` are stored as free-form
-- strings rather than Postgres enums so authors can add new values
-- without a follow-up migration — same pattern as `Ingredient.category`
-- and `Ingredient.defaultUnit`.
--
-- `fibreContent` is String[] because most fabrics are blends (40%
-- cotton / 60% linen). `suitableFor` is String[] of project-shape
-- tags ('apron', 'bag', 'cushion', 'quilt', 'clothing-light',
-- 'clothing-medium', 'soft-toy', 'curtain-light', 'curtain-blackout',
-- etc.) — drives the "what could I make from this fabric?" surface and
-- the "what fabric should I buy for this project?" sidebar on PATTERN
-- pages.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE "Fabric" (
  "id"   TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  -- 'light' | 'medium' | 'heavy' | 'upholstery'.
  "weightCategory" TEXT NOT NULL,

  -- Free-form fibre tags. Multi-valued for blends.
  -- 'cotton' | 'linen' | 'wool' | 'silk' | 'polyester' | 'nylon'
  -- | 'viscose' | 'acrylic' | 'hemp' | 'bamboo' | 'rayon' | 'jute'.
  "fibreContent" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- 'crisp' | 'flowing' | 'structured'.
  "drape" TEXT,

  -- Grams per square metre. Optional — only set when the manufacturer
  -- standard is well-known (calico ~150-170, denim ~340-400). Null for
  -- categories where weight varies hugely.
  "gsm" INTEGER,

  -- Project shapes the fabric suits. Free-form tags so authors can add
  -- without a migration.
  "suitableFor" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- High-level category for browse + filtering.
  -- 'woven-natural' | 'woven-synthetic' | 'knit' | 'non-woven'
  -- | 'interfacing' | 'lining' | 'batting' | 'specialty'.
  "category" TEXT,

  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Fabric_slug_key"            ON "Fabric"("slug");
CREATE        INDEX "Fabric_weightCategory_idx"  ON "Fabric"("weightCategory");
CREATE        INDEX "Fabric_category_idx"        ON "Fabric"("category");

-- ─────────────────────────────────────────────────────────────────────────
-- SewingNotion — master reference table for haberdashery items.
-- Threads, elastics, bindings, fasteners, stuffing, wadding. Slug-keyed
-- the same way Fabric is.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE "SewingNotion" (
  "id"   TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  -- 'closure' | 'interfacing' | 'thread' | 'binding' | 'elastic'
  -- | 'stuffing' | 'trim' | 'fastener' | 'cord' | 'lining'.
  "category" TEXT NOT NULL,

  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SewingNotion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SewingNotion_slug_key"     ON "SewingNotion"("slug");
CREATE        INDEX "SewingNotion_category_idx" ON "SewingNotion"("category");

-- ─────────────────────────────────────────────────────────────────────────
-- Tutorial — Sewing-specific metadata. All nullable; existing rows
-- untouched. Only meaningful when `type IN (PATTERN, TECHNIQUE)` and
-- the tutorial sits under the sewing Category. The discriminator across
-- craft categories is `craftType` ('sewing' here; 'knitting' / 'crochet'
-- / 'fibre-arts' / 'wood-natural-craft' / 'pottery-ceramics' /
-- 'paper-word' will reuse the column when their pipelines land).
--
-- `requiredFabricTypes` carries Fabric slugs. `requiredNotions` carries
-- SewingNotion slugs. Both are String[] (not Prisma relations) — same
-- pattern as `Tutorial.relatedConditionIds` on Herbal. The upload
-- script validates each slug against the master tables at upload time.
--
-- `projectShape` documents what the construction actually looks like.
-- Drives the filter strip on the public Sewing browse view ("show me
-- only rectangle projects") and gates the validation that no PATTERN
-- tutorial slips through claiming a fitted-pattern shape that the
-- launch scope explicitly excludes.
--
-- `finishedDimensionsCm` is JSON — typically {width, height} or
-- {width, height, depth}. Free-form so a curtain pattern can carry
-- {drop, width-per-curtain, pair-count} and a soft-toy pattern can
-- carry {seated-height, ear-tip-to-tail}.
--
-- `bodyMeasurementsRequired` is only meaningful on PATTERN rows where
-- the cut sizes to the body (peasant top → ['bust', 'desired-length'];
-- drawstring trouser → ['waist', 'inseam']). Empty on bag / cushion /
-- curtain / soft-toy patterns where the cut is from absolute dimensions.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  -- Discriminator. 'sewing' on every sewing-category tutorial.
  -- Shared column — future craft pipelines (knitting / crochet / fibre
  -- arts / wood / pottery / paper) will reuse it.
  ADD COLUMN "craftType" TEXT,

  -- Construction shape. PATTERN values:
  --   'rectangle'          — cut from one or more plain rectangles
  --                          (tea towels, napkins, simple curtains,
  --                          drawstring bags, cushion covers).
  --   'gathered-rectangle' — rectangles gathered onto bands / waistbands
  --                          (peasant tops, gathered skirts, simple
  --                          sundresses, dust ruffles).
  --   'panel-construction' — multiple rectangular panels joined into
  --                          shape (aprons with bib + skirt panels,
  --                          totes with body + base panels, simple
  --                          tablecloths with border panels).
  --   'circle'             — single-piece circle cut (round tablecloth,
  --                          circle skirt, beret).
  --   'from-measurements'  — rectangles sized from body measurements
  --                          (drawstring trousers, gathered nightdresses).
  --   'unconstructed'      — minimal seams (bunting triangles, fabric
  --                          flags, simple eye masks).
  -- Null on TECHNIQUE rows + every non-sewing row.
  ADD COLUMN "projectShape" TEXT,

  -- Master-table slug references. Free-form String[] — the upload
  -- script validates each slug against the master Fabric / SewingNotion
  -- tables at upload time.
  ADD COLUMN "requiredFabricTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "requiredNotions"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- 'hand-sewn' | 'machine' | 'mixed'. Drives the "machine required?"
  -- filter — important because a chunk of the audience has no machine.
  ADD COLUMN "sewingMethod" TEXT,

  -- Rough yardage needed at the base size. Decimal metres. Authors
  -- write the conservative number assuming standard 112 cm fabric
  -- width unless they note otherwise in the body.
  ADD COLUMN "fabricYardageMetres" DOUBLE PRECISION,

  -- Finished dimensions JSON. Free-form — typically {widthCm, heightCm}
  -- or {widthCm, heightCm, depthCm}. Some patterns carry domain-specific
  -- keys (curtain dropCm + widthPerCurtainCm + pairCount).
  ADD COLUMN "finishedDimensionsCm" JSONB,

  -- Body measurements required by PATTERN rows where the cut sizes to
  -- the body. Free-form String[] from a documented vocabulary in
  -- `docs/sewing-author.md`: 'bust' / 'waist' / 'hip' / 'inseam' /
  -- 'desired-length' / 'desired-width' / 'shoulder-to-waist' /
  -- 'head-circumference' / 'wrist-circumference' / etc.
  -- Empty on bag / cushion / curtain / soft-toy / homewares patterns.
  ADD COLUMN "bodyMeasurementsRequired" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Sewing-specific indexes on Tutorial. The public browse surfaces
-- filter by craft type, project shape, sewing method, and by the
-- multi-valued slug arrays (GIN on TEXT[]).
CREATE INDEX "Tutorial_craftType_idx"            ON "Tutorial"("craftType");
CREATE INDEX "Tutorial_type_craftType_idx"       ON "Tutorial"("type", "craftType");
CREATE INDEX "Tutorial_type_projectShape_idx"    ON "Tutorial"("type", "projectShape");
CREATE INDEX "Tutorial_type_sewingMethod_idx"    ON "Tutorial"("type", "sewingMethod");
CREATE INDEX "Tutorial_requiredFabricTypes_idx"  ON "Tutorial" USING GIN ("requiredFabricTypes");
CREATE INDEX "Tutorial_requiredNotions_idx"      ON "Tutorial" USING GIN ("requiredNotions");
