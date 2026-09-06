---
name: Content completeness checklist — per category, per type, MANDATORY items
description: Hard checklist that every Tutorial / Pattern row must satisfy to be PUBLISHED. No OR clauses. No "good enough." Binary block. Locked by Rebecca 2026-06-16 after three previous sessions softened the rules.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---

This checklist is the canonical bar for PUBLISHED content. Every item marked MANDATORY must be present. Missing any single item = un-publish. No OR clauses. No "the rest is good enough." Binary.

Workers that audit, publish, or rebuild content enforce this exactly. Workers that propose softening any rule (e.g. "chart OR written instructions is fine for crochet") are wrong and should be rejected.

## Cross-cutting rules (apply to EVERY type, every category)

- Title clearly states what the content is
- Body has no literal "NaN" / "undefined" / "[]" / placeholder strings ("goes here", "TODO", "lorem")
- Body length > 200 characters of actual content
- No em dashes (—) or en dashes (–)
- No banned phrases: "perfect for", "ideal for", "fine for almost everyone", "honest", "honestly", "frankly", "genuinely"
- Voice register: Mary Berry / Erin Boyle / Barbara O'Neill (no academic, no marketing)
- UK English canonical
- TipTap text nodes have `"type": "text"` set
- Every term in glossaryTerms[] appears inline wrapped in `glossaryTooltip` with `termSlug`

Hero image is a separate concern handled by the image strategy fresh-eyes session. NOT covered by this checklist.

## PATTERN — cross-stitch

- chartData populated with stitch symbols — MANDATORY
- Stitch key (symbol → brand + code + colour swatch) — MANDATORY
- Materials: fabric (type + count + dimensions) — MANDATORY
- Materials: thread brand + colour numbers — MANDATORY
- Materials: needle size + hoop size suggestion — MANDATORY
- Finished dimensions (cm) — MANDATORY
- Designer attribution (Homemade-original or designer name) — MANDATORY
- Backstitch instructions when backstitch is used — MANDATORY when applicable
- French knot placement when French knots are used — MANDATORY when applicable
- Centre marks visible on chart — MANDATORY

## PATTERN — crochet

- chartData populated on linked CrochetPattern row — MANDATORY
- Materials: yarn weight + suggested brand + colour count + yardage — MANDATORY
- Materials: hook size in mm — MANDATORY
- Gauge stated (stitches × rows per 10cm) — MANDATORY
- Finished dimensions — MANDATORY
- Written row/round-by-round instructions — MANDATORY
- Every row has explicit stitch count at end — MANDATORY
- Every repeat group fully enumerated (no abbreviation like "to end") — MANDATORY
- Foundation chain count is a real positive integer — MANDATORY
- Stitch counts add up round-to-round — MANDATORY
- Stitch glossary / abbreviations key — MANDATORY
- Finishing instructions (weaving ends, blocking) — MANDATORY
- No cross-references to other patterns ("as given for X") — pattern must be standalone — MANDATORY

## PATTERN — knitting

- chartData populated on linked KnittingPattern row — MANDATORY
- Materials: yarn weight + suggested brand + colour count + yardage — MANDATORY
- Materials: needle size (mm) — MANDATORY
- Materials: needle type (straights / circular / DPN) — MANDATORY
- Gauge stated (stitches × rows per 10cm) — MANDATORY
- Finished dimensions — MANDATORY
- Written row/round-by-round instructions — MANDATORY
- Every row has explicit stitch count at end — MANDATORY
- Every repeat fully enumerated — MANDATORY
- Cast-on count is a real positive integer — MANDATORY
- Cast-on method specified — MANDATORY
- Bind-off method specified — MANDATORY
- Stitch glossary / abbreviations key — MANDATORY
- Schematic with measurements per size (for garments) — MANDATORY for garments
- Pattern pieces (where the garment is constructed in pieces) — MANDATORY when applicable
- Finishing instructions — MANDATORY

## PATTERN — needlework (counted: blackwork + hardanger + needlepoint + sashiko)

- chartData populated on linked NeedleworkPattern row — MANDATORY
- Stitch key (symbol → thread + colour) — MANDATORY
- Materials: fabric (type + count + dimensions) — MANDATORY
- Materials: thread brand + colour numbers + amounts — MANDATORY
- Materials: needle size — MANDATORY
- Finished dimensions — MANDATORY
- Designer attribution — MANDATORY
- Stitch direction notes (especially sashiko) — MANDATORY
- Cut-work technique notes (for hardanger) — MANDATORY when applicable

## PATTERN — needlework (surface: embroidery + ribbon + stumpwork + candlewicking + goldwork + foundations)

- Pattern outline (transferable image or detailed positioning text) — MANDATORY
- Stitch placement guide (which stitch goes where on the outline) — MANDATORY
- Stitch reference list (what each stitch is) — MANDATORY
- Materials: fabric (type + dimensions) — MANDATORY
- Materials: thread / ribbon / cord brand + colour list — MANDATORY
- Materials: needle sizes — MANDATORY
- Finished dimensions — MANDATORY
- Designer attribution — MANDATORY

## PATTERN — sewing

- Pattern pieces resolvable via dispatcher (see "Sewing storage-path" below) — MANDATORY
- Pattern piece count, names, cut counts, grain markings — MANDATORY
- Step-by-step instructions resolvable via dispatcher — MANDATORY
- Materials: fabric type recommendations — MANDATORY
- Materials: fabric width assumption (140cm / 112cm) — MANDATORY
- Materials: fabric requirements per size — MANDATORY
- Materials: interfacing, notions, thread — MANDATORY
- Sizing chart (body measurements per size) — MANDATORY
- Finished garment measurements per size — MANDATORY
- Seam allowance specified (included or to be added) — MANDATORY
- Skill level indication — MANDATORY
- Construction direction (top-down, bottom-up, seamed, etc) — MANDATORY
- Cutting layout per size + fabric width — MANDATORY
- Number of sizes graded — MANDATORY

### Sewing storage-path resolution

Two storage paths exist by design — house patterns store pieces + instructions in DB columns; freesewing patterns generate live from the engine. The completeness check abstracts this via a dispatcher.

- `getResolvedPattern(pattern)` returns `{pieces, instructions, materials, sizing, ...}` regardless of source
- For house patterns: dispatcher reads DB columns
- For freesewing patterns: dispatcher calls the engine, returns live-drafted output
- Completeness check ALWAYS runs against dispatcher output, never raw DB columns
- If the freesewing engine fails to resolve a pattern, that pattern fails
- Same single set of mandatory items applies regardless of storage path

## PATTERN — project-shape (home-repair + pottery + wood-natural-craft + sustainability + paper-word + animals-smallholding + fibre-arts non-chart subtypes)

- Materials list with quantities — MANDATORY
- Tools list — MANDATORY
- Cut list / measurement list (for build projects) — MANDATORY for build projects
- Numbered step-by-step instructions — MANDATORY
- Action verb at the start of each step — MANDATORY
- Completion criterion stated — MANDATORY
- Safety notes (for tool-based / chemical / fired projects) — MANDATORY when applicable
- Maintenance / care notes — MANDATORY when applicable
- Diagram / template (for projects that need one — origami folds, joinery, knot tying) — MANDATORY when applicable

## RECIPE (cooking + baking + natural-home + herbal-medicine where REMEDY isn't applicable)

- Ingredients list with quantities (every ingredient has a number + unit) — MANDATORY
- No ingredient with null/missing amount — MANDATORY
- Numbered method steps — MANDATORY
- Each method step has an action verb — MANDATORY
- Method steps reference the ingredients — MANDATORY
- Yield stated (servings or quantity) — MANDATORY
- At least one of: prep time, cook time, total time — MANDATORY
- Equipment / materials list (tools needed) — MANDATORY
- Allergen tags (auto-detected from ingredients) — MANDATORY
- Dietary tags (vegan / vegetarian / GF / DF, auto-detected) — MANDATORY

## TECHNIQUE (all categories that have this type)

- Materials list — MANDATORY
- Tools list — MANDATORY
- Numbered step-by-step instructions — MANDATORY
- Action verb at the start of each step — MANDATORY
- Completion criterion ("when X happens, you've done it right") — MANDATORY
- Common mistakes / troubleshooting section — MANDATORY
- Uses section (when to use this technique) — MANDATORY

## STITCH (chart-based crafts: cross-stitch + crochet + knitting + needlework)

- Visual representation (chart symbol + PD diagram + or rendered illustration) — MANDATORY
- Step-by-step formation instructions (how the hands + tool form the stitch) — MANDATORY
- Uses section (where this stitch is typically used) — MANDATORY
- Common variations section — MANDATORY
- Difficulty level — MANDATORY

## PRACTICE (mindset)

- Duration stated — MANDATORY
- Clear practice instructions (numbered or guided prose) — MANDATORY
- What to expect / sensory cues section — MANDATORY
- No medical claims — MANDATORY
- No "fine for everyone" language — MANDATORY
- Required tools / props (if any) — MANDATORY when applicable

NO in-body medical disclaimer. The site-wide disclaimer covers it. Mindset voice lock bans body disclaimers. Do not propose adding this back. Locked 2026-06-16.

## GROWING_GUIDE (garden)

- Plant common name — MANDATORY
- Plant Latin binomial — MANDATORY
- Sowing window (months, canonical UK with hemisphere translation) — MANDATORY
- Sowing depth — MANDATORY
- Spacing (between plants + rows) — MANDATORY
- Hardiness / climate zones — MANDATORY
- Sun requirements (full / partial / shade) — MANDATORY
- Water requirements — MANDATORY
- Soil preferences — MANDATORY
- Care instructions (feeding, pruning, support) — MANDATORY
- Harvest timing — MANDATORY
- Signs of harvest readiness — MANDATORY
- Common problems + remedies section — MANDATORY
- Companion planting notes — MANDATORY when applicable

## REMEDY (herbal-medicine)

- Ingredients list with quantities — MANDATORY
- Numbered preparation steps — MANDATORY
- Application / dosage stated — MANDATORY
- Frequency stated — MANDATORY
- Contraindications + safety section — MANDATORY
- Source attribution where citing traditional or modern use — MANDATORY when citing
- Duration / storage of prepared remedy — MANDATORY

NO in-body medical disclaimer. Site-wide disclaimer covers it. Locked 2026-06-16.

## HERB_PROFILE (herbal-medicine)

- Common name — MANDATORY
- Latin binomial — MANDATORY
- Identification description (leaf, flower, stem, root) — MANDATORY
- Habitat + range — MANDATORY
- Parts used — MANDATORY
- Traditional uses section — MANDATORY
- Modern evidence section — MANDATORY when applicable
- Cautions / contraindications — MANDATORY
- Sourcing / wildcrafting notes — MANDATORY when applicable

NO in-body medical disclaimer. Site-wide disclaimer covers it. Locked 2026-06-16.

## READING (informational / decision / comparison guides — all categories)

- Topic clearly addressed in body — MANDATORY
- At least 3 section headings or clear structural breaks — MANDATORY
- Substantive content (not summary, not filler) — MANDATORY
- Sources / references for factual claims — MANDATORY when citing
- Conclusion or "what to do next" pointer — MANDATORY

## Enforcement notes for workers

- This checklist is the source of truth. No OR clauses are permitted.
- Any worker that proposes softening a rule is wrong.
- Any row failing any single MANDATORY item gets un-published to DRAFT with structured qcBlockReason.
- No warning tier. Binary block per the no-warning-tiers memory.
- AI-only moderation per the AI-only moderation memory. Never propose manual editorial review.
- Workers that audit, publish, or rebuild content all enforce this exactly. The dispatcher for sewing pieces/instructions is required so the check is uniform regardless of storage path.
