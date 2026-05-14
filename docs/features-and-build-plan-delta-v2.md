# Features-and-Build-Plan v2 — delta against current Drive doc

The Drive doc `Homemade-Features-and-Build-Plan.docx` is otherwise correct.
The changes below are isolated to the places where it references "five
launch categories" or the old category list, plus a few small follow-ons
from the Master Plan v2 rewrite.

Apply these one at a time in the Drive doc. The Drive doc stays canonical
for product / feature inventory; this delta file goes away once applied.

---

## Change 1 — Homepage category tiles

**Location:** §"Homepage" → "Category entry points" (currently reads
"five tiles for the launch categories").

**Old:**
> Category entry points — five tiles for the launch categories with a
> sample tutorial in each

**New:**
> Category entry points — a tile per top-level category (target 16 at
> full vision; sequencing per `BUILD_PROGRESS.md` § "Multi-category fill
> plan"). Each tile shows a sample tutorial and the category's signature
> visual register. Tile order and which categories appear at launch is
> feel-based (see Master Plan §5 — launch shape "C-ish").

## Change 2 — Initial content seeding step

**Location:** §"Build phases" → the content-seeding bullet (currently
"Seed initial library across the five launch categories (cooking,
baking, gardening, crochet, knitting)").

**Old:**
> Seed initial library across the five launch categories (cooking,
> baking, gardening, crochet, knitting)

**New:**
> Seed initial library across the holistic-life spine (Cooking, Baking,
> Garden, Herbal medicine, Mindset) to depth; chunk-fill the remaining
> top-level categories during beta per the live grid in
> `BUILD_PROGRESS.md`. Cooking pipeline ships first as the template;
> each subsequent category extends or replaces parts of that template
> with its own schema, prompt, voice-check tuning, and master entity
> tables.

## Change 3 — Pre-launch image generation budget

**Location:** §"Pre-launch — image generation pass" (currently scoped at
2,000 recipes + 600 techniques).

**Old:**
> Expected total at 2,000 recipes + 600 techniques: ~£100–£150 for
> heroes only, ~£260–£400 if inline illustrations come too.

**New:**
> Expected total depends on which categories are filled to depth at
> launch. Full vision = 27,700 articles across 16 categories. Holistic-
> life spine alone (Cooking + Baking + Garden + Herbal + Mindset, ~17,500
> articles) at Flux 1.1 Pro Ultra (~£0.05/hero) = ~£875 for heroes only.
> Add inline illustrations and that doubles. Budget allocated per launch
> category set, not against a single global total. Image generation
> remains deferred during all fill phases — the heroes batch lands in one
> pre-launch pass against existing Tutorial rows.

## Change 4 — Early access to new categories (premium / creator section)

**Location:** §"Premium tier" or §"Creator program" (the bullet currently
reads "Early access to new categories" as a premium hook).

**Old:**
> Early access to new categories

**New:**
> Keep this bullet — but flag that premium feature gating is decided
> post-build per `feedback_premium_philosophy.md`. "Early access to new
> categories" is a candidate, not a locked premium feature. Build the
> category-launch flow as a normal feature; decide gating once the
> product is built.

## Change 5 — Category-and-taxonomy management (admin)

**Location:** §"Admin" → "Category and taxonomy management" (currently
implies a single CMS pattern for all categories).

**Old:** (existing description of generic category management UI)

**New:** Same UI but with a note that each top-level category has its
own pipeline (schema, prompt, voice-check, master entity tables). The
admin shell is shared; the category-specific authoring tools are
category-specific. Bulk operations (re-tag, recategorise, force
reindex) work across the shared shell.

## Change 6 — Add a new section: "Per-category pipeline pattern"

**Location:** New top-level section, somewhere in Part 1 (Feature
inventory) or Part 4 (Operational systems).

**New:**
> ### Per-category pipeline pattern
>
> Every top-level category on Homemade has its own pipeline — its own
> master entity tables, its own Tutorial sub-types, its own metadata
> fields, its own authoring prompt, its own voice-check tuning, and its
> own image / visual treatment rules. The platform is a federation of
> these pipelines under one shell. Cooking is the template (see
> `BUILD_PROGRESS.md` § "Phase 8 — Content pipeline build queue").
> Each new category's pipeline gets ~1 week of setup work before bulk
> fill starts, building on the shared scaffold but adapting to the
> category's natural content shape (recipes ≠ crochet patterns ≠ garden
> plans ≠ herbal protocols ≠ mindset practices).
>
> Live tracking for each category's pipeline status and content fill
> count lives in `BUILD_PROGRESS.md` § "Multi-category fill plan".

## Change 7 — Add Sustainability as a category

**Location:** §"Categories and Roadmap" or wherever the category list
is enumerated in the Build Plan (mirror of Master Plan §5).

**New entry (17th category):**
> **Sustainability** — solar (DIY solar projects, solar oven, solar
> water heater), water reduction & harvesting (rainwater catchers,
> greywater, water-saving fixtures), composting (kitchen, garden, hot
> vs cold, vermicompost), waste reduction (zero-waste, plastic-free,
> package-free, repair-don't-replace), energy efficiency (insulation,
> draft-proofing), renewable heating (wood stove, masonry heater),
> off-grid basics.
>
> Natural cross-references into Garden (composting, greenhouse),
> Natural home (eco cleaning, plastic-free), and Home & repair
> (insulation, draft-proofing) — overlap is expected and handled via
> primary + secondary category tags.

## Change 8 — Auto-publish flow + common-issues mechanism

**Location:** §"Content workflows" or §"Build phases" → content seeding.

**New section:**
> ### Auto-publish flow
>
> Bulk content authoring uses an auto-publish loop, not a manual-review
> loop:
>
> 1. Worker drafts the tutorial body against
>    `docs/tutorial-author.md` (v3+).
> 2. Worker runs the in-prompt self-critique pass, which now includes
>    a check against every entry in `docs/common-issues.md`.
> 3. Worker invokes the deterministic `voice-check` CLI; it blocks the
>    upload on errors.
> 4. Worker uploads with `--status published`. The tutorial lands live
>    on the splash-gated site.
> 5. Rebecca spot-checks live tutorials as she has bandwidth — not
>    gating, not per-draft.
> 6. When a recurring pattern surfaces (3+ instances in a batch), the
>    worker appends it to `docs/common-issues.md`; subsequent workers
>    pick it up.
>
> Why auto-publish: 28k articles across 17 categories is not
> manually-reviewable by one person. The splash gate is the pre-launch
> safety net; the Tester program (Phase 6+) is the post-launch safety
> net. In between, the self-critique + voice-check + common-issues loop
> is the quality gate.

## Change 9 — Launch readiness section

**Location:** §"Launch readiness" or equivalent.

**Old:** (existing language about minimum content volume per launch
category).

**New:**
> Launch readiness is feel-based, not a hard number per category. The
> holistic-life spine (Cooking + Baking + Garden + Herbal + Mindset)
> goes to depth before splash gate flips. Smaller categories — Pottery,
> Wood & natural, Paper & word, Animals & smallholding, Home & repair,
> Natural home — can chunk out during the beta phase at whatever depth
> feels useful per category. The live tracker in `BUILD_PROGRESS.md`
> § "Multi-category fill plan" is the surface where Rebecca decides
> what's ready.

---

## How to apply

1. Open `H:\My Drive\Homemade-Features-and-Build-Plan.docx`.
2. For each change above, find the location in the doc and apply the
   replacement.
3. Bump the doc version (if it has one) and add a "Last updated" date.
4. Once applied, delete this draft file from the repo, or keep as a
   change-log of what shipped.

This delta will likely surface a few more cross-references as the doc is
walked through. Note any additional places where "five launch categories"
or the old category list appears, and decide on the fly whether they need
updating or have aged into general background text.
