-- Phase Pottery & ceramics pipeline scaffold — schema migration.
--
-- Adds Pottery-specific reference tables (ClayBody, CraftMaterial) and
-- Tutorial pottery metadata columns. Reuses the existing TutorialType
-- values: TECHNIQUE for stitch-equivalent foundational tutorials
-- (wedging, centring, opening a thrown pot, glaze-dipping technique,
-- bisque-firing schedule) and PATTERN for finished-item tutorials
-- (pinch pot, coil pot, slab tray, drape-moulded bowl, thrown mug,
-- glazed cone-6 stoneware mug).
--
-- Everything additive: no column drops, no breaking renames. Cooking /
-- Baking / Mindset / Garden / Herbal / Sewing / Crochet rows untouched.
--
-- Per `feedback_schema_all_fields_upfront.md`: every plausibly-useful
-- field lands now (`requiresKiln` + `requiresWheel` for equipment-
-- barrier badging on the public list page, `requiredClayBodies` and
-- `requiredCraftMaterials` as String[] slug references for cross-
-- validation at upload time, `trainedEnvironmentOnly` on CraftMaterial
-- so the no-equipment 70%-track tutorials cannot accidentally pull in
-- raw-silica-dust materials).
--
-- See `docs/pottery-ceramics-author.md` for the authoring prompt that
-- decides which fields are set for which sub-topic.

-- ─────────────────────────────────────────────────────────────────────
-- ClayBody — master reference table for clay bodies. One row per
-- canonical clay body (red earthenware, white stoneware smooth,
-- porcelain, paper clay, polymer clay, air-dry clay, etc.). Tutorials
-- reference rows by slug via `Tutorial.requiredClayBodies`.
--
-- `requiresKiln` mirrors the same flag on Tutorial — a stoneware body
-- can only be vitrified in a kiln, but a polymer or air-dry body sets
-- in a domestic oven or at room temperature. Set true on every clay
-- body that needs a kiln, false on the no-equipment-track bodies. The
-- public list page badges any tutorial whose ClayBody set includes a
-- requiresKiln=true row, on top of the tutorial-level flag.
--
-- `firingRangeCones` is text so a range fits ("06-04" for low-fire
-- earthenware, "6" for mid-fire stoneware, "10" for high-fire
-- stoneware/porcelain). Null on no-fire bodies. `bodyType` is the
-- broad category — earthenware / stoneware / porcelain / paper-clay /
-- polymer / air-dry. Free-form string for forwards-compat (raku,
-- terracotta, ball-clay-heavy bodies as future categories).
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE "ClayBody" (
  "id"   TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  -- 'earthenware' | 'stoneware' | 'porcelain' | 'paper-clay' | 'polymer'
  -- | 'air-dry' | 'raku' | 'terracotta'. Free-form string.
  "bodyType" TEXT NOT NULL,

  -- Cone range as plain text ("06-04", "6", "9-10"). Null on bodies
  -- that don't need a kiln.
  "firingRangeCones" TEXT,

  -- True when a kiln is required to vitrify the body.
  "requiresKiln" BOOLEAN NOT NULL DEFAULT false,

  -- Shrinkage from wet → bisque → fired. Stored as percent ("12-14%")
  -- because the figure is a range, not a point. Null when the body
  -- doesn't fire.
  "shrinkagePercent" TEXT,

  -- Plasticity / wedging notes — how the body behaves at the wheel
  -- and during hand-building. Plain text.
  "notes" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClayBody_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClayBody_slug_key"        ON "ClayBody"("slug");
CREATE        INDEX "ClayBody_bodyType_idx"    ON "ClayBody"("bodyType");
CREATE        INDEX "ClayBody_requiresKiln_idx" ON "ClayBody"("requiresKiln");

-- ─────────────────────────────────────────────────────────────────────
-- CraftMaterial — master reference table for craft-specific raw
-- materials beyond the simple Ingredient / Fabric registries. Pottery
-- is the first pipeline to land here; future craft pipelines (jewellery,
-- paper craft, woodworking finishing oils) reuse the same shape by
-- setting `craft` to the appropriate slug.
--
-- The single most important field is `trainedEnvironmentOnly`. Silica
-- dust is a chronic-irreversible hazard (silicosis). Heavy-metal raw
-- oxides used at studio quantity require respirator-grade PPE and a
-- dedicated mixing space that doesn't share air with food prep. The
-- flag is true on raw silica, kaolin, feldspar, talc, dolomite,
-- wollastonite, lithium carbonate; true on cobalt / copper / manganese
-- / chromium / nickel oxides; false on pre-mixed commercial glazes
-- sold for home use, frits, and the iron / rutile colourants whose
-- toxicity is low at handling quantities.
--
-- The authoring prompt forbids a no-equipment-track tutorial from
-- referencing any CraftMaterial with `trainedEnvironmentOnly = true`,
-- and the upload script will reject one that does. The list-page filter
-- "show me no-kiln-no-wheel-no-trained-environment tutorials" then
-- works as a hard guarantee for kiln-less home readers.
--
-- `category` discriminates within a craft. Pottery values:
--   'clay-tool-attached'   — bound-to-clay materials (slip, engobe,
--                            wax / latex resist) applied during the
--                            handbuilding-or-throwing stage.
--   'glaze-raw'            — raw glaze ingredients (silica, feldspar,
--                            kaolin, frits, fluxes, modifiers).
--   'glaze-colourant'      — oxides and stains that colour glazes
--                            and slips.
--   'glaze-premixed'       — commercial pre-mixed glazes safe for
--                            home use. No raw-material handling
--                            required.
--   'underglaze'           — under-glaze decoration; mostly food-safe
--                            commercial commercial products.
--   'kiln-furniture'       — non-clay materials that go in the kiln
--                            (kiln wash, stilts for low-fire glazes).
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE "CraftMaterial" (
  "id"   TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  -- 'pottery' | 'jewellery' | 'paper' | 'wood-finishing'. Free-form
  -- string; future crafts widen the vocabulary.
  "craft" TEXT NOT NULL,

  -- Sub-category within the craft. See header comment for the pottery
  -- value list. Free-form string.
  "category" TEXT NOT NULL,

  -- Trained-environment-only flag. True for raw silica, heavy-metal
  -- oxides at studio quantity, and any raw material requiring
  -- respirator + dedicated mixing space. False for pre-mixed glazes
  -- + the low-toxicity rutile / iron-oxide colourants.
  "trainedEnvironmentOnly" BOOLEAN NOT NULL DEFAULT false,

  -- Hazard summary surfaced verbatim by the renderer in the materials
  -- list when present. Stays null when the material has no special
  -- handling. Plain text.
  "hazardNotes" TEXT,

  -- General sourcing / handling / typical-use notes.
  "notes" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CraftMaterial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CraftMaterial_slug_key"                  ON "CraftMaterial"("slug");
CREATE        INDEX "CraftMaterial_craft_idx"                 ON "CraftMaterial"("craft");
CREATE        INDEX "CraftMaterial_category_idx"              ON "CraftMaterial"("category");
CREATE        INDEX "CraftMaterial_craft_category_idx"        ON "CraftMaterial"("craft", "category");
CREATE        INDEX "CraftMaterial_trainedEnvironmentOnly_idx" ON "CraftMaterial"("trainedEnvironmentOnly");

-- ─────────────────────────────────────────────────────────────────────
-- Tutorial — pottery-specific metadata columns. All additive, all
-- defaulted, all nullable where the column is optional. Existing rows
-- untouched.
--
-- `requiresKiln` and `requiresWheel` drive the equipment-barrier badge
-- on the public list page and the equipment-barrier filter. Both
-- default false so every existing row (Cooking, Baking, Mindset,
-- Garden, Herbal, Sewing, Crochet) lands kiln-free + wheel-free by
-- definition. Pottery tutorials set true per body of work — the no-
-- equipment track (~70% of the 500-tutorial target) leaves both false;
-- the wheel + kiln track (~30%) flips them on.
--
-- `requiredClayBodies` carries ClayBody slugs. `requiredCraftMaterials`
-- carries CraftMaterial slugs. Both are String[] (no Prisma relation)
-- mirroring `requiredFabricTypes` + `requiredNotions` on the sewing
-- pipeline. The upload script validates each slug against the master
-- tables at upload time.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  ADD COLUMN "requiresKiln"            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "requiresWheel"           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "requiredClayBodies"      TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "requiredCraftMaterials"  TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Public browse + filter indexes:
--   - "hide kiln-requiring tutorials"       → (type, requiresKiln)
--   - "hide wheel-requiring tutorials"      → (type, requiresWheel)
--   - "all stoneware tutorials"             → requiredClayBodies GIN
--   - "tutorials using cobalt-carbonate"    → requiredCraftMaterials GIN
CREATE INDEX "Tutorial_type_requiresKiln_idx"        ON "Tutorial"("type", "requiresKiln");
CREATE INDEX "Tutorial_type_requiresWheel_idx"       ON "Tutorial"("type", "requiresWheel");
CREATE INDEX "Tutorial_requiredClayBodies_idx"       ON "Tutorial" USING GIN ("requiredClayBodies");
CREATE INDEX "Tutorial_requiredCraftMaterials_idx"   ON "Tutorial" USING GIN ("requiredCraftMaterials");
