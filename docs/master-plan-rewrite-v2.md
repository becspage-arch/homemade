# Master Plan v2 — rewrite drafts for §1 (Vision) and §5 (Categories & Roadmap)

This file is a **drop-in replacement** for §1 and §5 of `Homemade_Master_Plan.docx`
in Google Drive. The rest of the Master Plan stays as-is. Once Rebecca has
reviewed and accepted these sections, paste them into the Drive .docx and
bump the doc version (v1.3 → v1.4).

The Drive doc remains the canonical strategic reference. This file in the
repo is the working draft.

---

## §1 — Vision (rewrite)

### What Homemade is

A beautiful, comprehensive home for the holistic homemade life: cooking
from scratch, baking, growing food and herbs, herbal medicine, mindset and
inner work, and traditional handmaking crafts. Everything you can make,
grow, heal, and steady yourself with — gathered into one trusted place with
true depth.

Homemade replaces the chaos of scattered YouTube videos, half-baked blogs,
Etsy pattern hunts, Amazon supply runs, and woo-thin manifesting accounts
with one beautiful, free-to-use platform.

### The problem it solves

To learn crochet today, a person searches YouTube for technique, hunts for
a pattern from an independent designer on Facebook or Etsy, buys hooks on
Amazon, and finds yarn somewhere else entirely. To make a herbal tincture
she trusts the recipe on, she's reading anonymous Instagram captions and
hoping the dose is right. To work on the mindset side of an abundant home
life, she's bouncing between five YouTube teachers with no through-line.
The same fragmentation exists in every craft, every kitchen skill, every
gardening niche, every wellness corner. No wonder these skills are being
lost.

Homemade brings depth and beauty back to the whole homemade life, in one
place.

### The promise

Depth and trust, made beautiful. The real thing, made findable.

### Brand framing

Homemade draws on several reference points without being doctrinal about
any of them. Barbara O'Neill-style holistic wellbeing — food as medicine,
herbs, body, lifestyle as the foundation of health — is one. English country
heritage (Vita Sackville-West, Gertrude Jekyll, Mrs Beeton) is another.
Modern Scandi calm shapes the visual register. Slow-living and intentional
homemaking sit at the core. None of these are *the* answer; together they
inform where Homemade starts and what it cares about.

### Long-term ambition

The single most beautiful and trusted place to learn anything homemade.

- Free to use as the core experience. Premium gating is decided after the
  product is built and we can see how features fit, not designed in
  upfront.
- Eventually self-sustaining through external teachers and creators
  contributing content (incentive model TBD — likely a mix of marketplace
  revenue share, paid placement, and a direct creator program).
- Web-first build, with iPhone and Android apps from day one of public
  launch.
- Industry-gold-standard accessibility and mobile responsiveness (Netflix,
  Spotify, Uber level).

---

## §5 — Categories and Roadmap (rewrite)

### The 17 top-level categories

Each top-level category has its own pipeline shape — different content
types, different metadata, different authoring prompt, different schema
extensions. They're not interchangeable surfaces over a generic CMS.

| # | Category | Sub-categories |
|---|---|---|
| 1 | **Cooking** | Savoury meals, soups, salads, breakfasts, sauces & condiments, preserving & fermenting, charcuterie, cheese & dairy, brewing & drinks |
| 2 | **Baking** | Bread, cakes, pastries, biscuits, pies, scones, sweets & confectionery, cake decorating |
| 3 | **Garden** | Vegetables, fruit, herbs, flowers, permaculture, microgreens, hydroponics, mushroom growing, foraging |
| 4 | **Herbal medicine** | Remedies, tinctures, infusions, decoctions, oils, balms, salves, syrups, home apothecary |
| 5 | **Mindset** | Manifesting, tapping, energy work, daily practice, journal prompts, 30-day plans |
| 6 | **Crochet** | Stitches, techniques, patterns (public-domain only at launch) |
| 7 | **Knitting** | Stitches, techniques, patterns (public-domain only at launch) |
| 8 | **Needlework** | Cross-stitch, tatting, lacemaking, needlepoint |
| 9 | **Sewing** | Dressmaking, quilting, mending & visible mending |
| 10 | **Fibre arts** | Spinning, weaving, dyeing, felting, rug making, macramé |
| 11 | **Wood & natural craft** | Woodworking, whittling, spoon carving, basketry, willow weaving |
| 12 | **Paper & word** | Paper crafts, bookbinding, calligraphy, scrapbooking, journalling-as-craft (bullet, art, junk, travel/nature journals — making the book itself; journal *practice* sits in Mindset) |
| 13 | **Pottery & ceramics** | Hand-building, throwing, glazing, firing |
| 14 | **Animals & smallholding** | Beekeeping, chickens, backyard livestock |
| 15 | **Home & repair** | Building, upholstery, furniture restoration, bushcraft |
| 16 | **Natural home** | Soap, candles, DIY beauty, DIY cleaning, home fragrance |
| 17 | **Sustainability** | Solar (DIY projects, solar oven, solar water heater), water (rainwater catchers, greywater, water-saving), composting (kitchen, garden, hot/cold, vermicompost), waste reduction (zero-waste, plastic-free, repair-don't-replace), energy efficiency (insulation, draft-proofing), renewable heating (wood stove, masonry heater), off-grid basics |

### Why this shape

- **Cooking + Baking as two top-level categories** rather than one merged
  Kitchen umbrella — preserves the original-five identity, gives bakers a
  dedicated front door, and acknowledges that baking is a genuinely
  distinct skill domain with its own metadata (baker's percentages,
  hydration ratios, proofing, lamination).
- **Herbal medicine** is a core category, not an edge "wellness and
  herbalism" risk. It anchors the Barbara O'Neill-style holistic framing
  alongside Cooking, Baking, and Garden.
- **Mindset** is in. Inner work, manifesting, tapping, energy alignment,
  daily practice, 30-day plans. Without it the holistic-life vision is
  amputated — burnout, perfectionism, money stress and comparison are the
  failure modes of every other category.
- **Needlework** stands alongside Crochet and Knitting rather than
  parenting them — cross-stitch, tatting, lacemaking and needlepoint are
  their own world, distinct enough from crochet/knitting to warrant
  separate framing.
- **Natural home** is where soap, candles, DIY beauty, cleaning, and home
  fragrance sit. They're not herbal medicine (you don't make soap because
  you have a sore back) but they belong with the holistic-natural-life
  framing.
- **Sustainability** is the eco-action category. People want to try
  sustainable living but have no idea where to start except expensive
  whole-house retrofits. Small entry points — rainwater catcher,
  greywater reuse, water-saving fixtures, kitchen composting, plastic-
  free swaps — make sustainability accessible. Natural cross-references
  into Garden, Natural home, and Home & repair are expected; primary +
  secondary category tags handle the overlap.

### Per-category pipelines

The cooking pipeline (`BUILD_PROGRESS.md` § "Phase 8 — Content pipeline
build queue") is the most worked-through example: master ingredient and
tools tables, recipe metadata (servings, prep / cook time, scaling,
freezable, batchable, dietary flags, cuisine, mealType, mood),
structured-ingredients TipTap block, scaling tokens in method prose,
recipe-first authoring prompt, voice-check CLI.

Each subsequent category extends or replaces parts of that template:

- **Garden** — master `PlantVariety` table, hardiness zones, planting
  calendars, pest / disease cross-refs, companion planting.
- **Herbal medicine** — master `Herb` table, `Condition` table by body
  system, preparation typing (tincture / decoction / infusion / oil /
  salve / balm / syrup), drug-interaction notes. Strongest "no medical
  advice" voice rules of any category.
- **Mindset** — `Practice` library typed by practice form (tapping
  script, energy alignment statement, ritual, journal prompt,
  breathwork), `Plan` template entity for 30-day skeletons.
- **Crochet / Knitting** — master `Stitch` table, US / UK terminology
  variants, gauge / yarn metadata, symbol-chart rendering.
- **Needlework** — separate `Stitch` namespace from crochet / knitting
  (cross-stitch grid squares, tatting shuttle motions, lacemaking bobbin
  diagrams).
- **Sewing** — `Pattern` table for garment patterns (public-domain at
  launch — Edwardian, 1940s, vintage), fabric metadata, body-measurement
  reference, quilt-block library.
- Others follow the same shape — master entity table + category-specific
  Tutorial subtype + metadata fields — finalised at each category's
  pipeline-setup session.

### Launch sequencing

Live tracking grid in `BUILD_PROGRESS.md` § "Multi-category fill plan"
holds target depth, current count, pipeline status, and fill weeks for
every category.

Launch shape is **C-ish, feel-based**: the **holistic-life spine** (Cooking
+ Baking + Garden + Herbal medicine + Mindset) goes to depth; the smaller
categories fill out during beta at whatever depth feels useful per
category. Some categories chunk out small and get checked off quickly;
others need more depth to feel even remotely helpful. The decision happens
session-by-session, not as a pre-locked plan.

### Public-domain content + creator program

Same as v1: public-domain synthesis at launch (Mrs Beeton, Project
Gutenberg, USDA, Weldon's needlework manuals, vintage gardening manuals,
Edwardian / 1940s sewing patterns). No trawling and rewriting from
copyrighted blogs. The eventual creator program brings external teachers
in once the platform is mature and the incentive model is locked.

---

## How to apply this rewrite to the canonical Drive doc

1. Open `H:\My Drive\Homemade_Master_Plan.docx`.
2. Replace §1 ("Vision") with the §1 block above.
3. Replace §5 ("Categories and Roadmap") with the §5 block above.
4. Update the version number at the top of the doc (v1.3 → v1.4).
5. Add an entry to §10 ("Decision Log"):
   - "v1.4: vision broadened to holistic-life framing; categories
     re-locked at 17 top-level with per-category pipelines; herbal
     medicine, mindset, and sustainability added as core categories;
     launch shape locked as feel-based C (spine deep, smaller categories
     chunked during beta); premium gating decided post-build, not
     designed in upfront."
6. Save. The repo file (`docs/master-plan-rewrite-v2.md`) can be deleted
   once applied, or kept as the change-log of what landed when.
