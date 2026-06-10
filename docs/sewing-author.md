# Sewing authoring (category index)

Updated 2026-06-10 by S-3 pipeline-setup. The 2026-05-17 rectangles-only
sewing prompt is superseded. The taxonomy is now aligned with the
`SewingGarmentCategory` enum from `phase_sewing_schema_001`
(commit 4b3e689e) and the freesewing engine path locked in
`project_sewing_locked_decisions.md`.

## Status

`Category.sewing.pipelineStatus = NOT_READY` and
`Category.sewing.isPublicVisible = false` per the no-phased-rollout
lock. The category sits in this prepared-but-locked state until S-1
Studio + S-4 first content batch + S-5 grading library all land
together. At that point the orchestrator flips status, visibility, and
the per-sub-cat `autopilotEnabled` flags in a single step.

Every sub-category below carries `autopilotEnabled = false`. The
autopilot routine skips sewing entirely until the flip lands; the
routing table below documents where it would route once enabled.

## Sub-categories and prompt routing

The sewing taxonomy uses garment-category sub-cats (one per
`SewingGarmentCategory` enum value). Author prompts are organised by
garment shape rather than demographic, because construction is similar
across women's / men's / kids / babies variants of the same shape. The
shape prompt handles size grading and gendered fit notes within one
file.

| Sub-cat slug | Display name | Maps to enum | Author prompt | Autopilot |
|---|---|---|---|---|
| `womens-tops` | Women's tops | `WOMENS_TOPS` | [sewing-tops-author.md](sewing-tops-author.md) | DISABLED |
| `mens-tops` | Men's tops | `MENS_TOPS` | [sewing-tops-author.md](sewing-tops-author.md) | DISABLED |
| `womens-dresses` | Women's dresses | `WOMENS_DRESSES` | [sewing-dresses-author.md](sewing-dresses-author.md) | DISABLED |
| `womens-bottoms` | Women's bottoms | `WOMENS_BOTTOMS` | [sewing-bottoms-author.md](sewing-bottoms-author.md) | DISABLED |
| `mens-bottoms` | Men's bottoms | `MENS_BOTTOMS` | [sewing-bottoms-author.md](sewing-bottoms-author.md) | DISABLED |
| `womens-outerwear` | Women's outerwear | `WOMENS_OUTERWEAR` | [sewing-outerwear-author.md](sewing-outerwear-author.md) | DISABLED |
| `mens-outerwear` | Men's outerwear | `MENS_OUTERWEAR` | [sewing-outerwear-author.md](sewing-outerwear-author.md) | DISABLED |
| `kids` | Kids | `KIDS` | Routed by pattern.garmentCategory (tops / dresses / bottoms / outerwear) | DISABLED |
| `babies` | Babies | `BABIES` | Routed by pattern.garmentCategory (tops / dresses / bottoms / outerwear) | DISABLED |
| `unisex` | Unisex | `UNISEX` | Routed by pattern.garmentCategory (tops / dresses / bottoms / outerwear) | DISABLED |
| `accessories` | Accessories | `ACCESSORIES` | [sewing-accessories-author.md](sewing-accessories-author.md) | DISABLED |
| `bags` | Bags | `BAGS` | [sewing-bags-author.md](sewing-bags-author.md) | DISABLED |
| `home` | Home + soft furnishings | `HOME` | [sewing-home-author.md](sewing-home-author.md) | DISABLED |
| `costume` | Costume + cosplay | `COSTUME` | [sewing-costume-author.md](sewing-costume-author.md) | DISABLED |
| `womens-intimates` | Women's intimates | `WOMENS_INTIMATES` | [sewing-womens-intimates-author.md](sewing-womens-intimates-author.md) | SPECIALIST STUB |
| `specialty` | Specialty + technical | `SPECIALTY` | [sewing-specialty-author.md](sewing-specialty-author.md) | SPECIALIST STUB |

### Routing for kids / babies / unisex

These three sub-cats map to multiple garment shapes (kids tops, kids
dresses, kids bottoms, kids outerwear; same for babies and unisex).
Routing for these reads the pattern's `garmentType` field on
`SewingPattern` (or the brief's `garmentType` field at authoring time)
and resolves to the matching shape prompt:

- `tops` / `tee` / `shirt` / `jumper` / `sweatshirt` → [sewing-tops-author.md](sewing-tops-author.md)
- `dress` / `gown` / `pinafore` → [sewing-dresses-author.md](sewing-dresses-author.md)
- `trousers` / `shorts` / `skirt` / `leggings` → [sewing-bottoms-author.md](sewing-bottoms-author.md)
- `jacket` / `coat` / `vest` / `gilet` → [sewing-outerwear-author.md](sewing-outerwear-author.md)

For babies, the romper / sleepsuit / bodysuit garment types route to
[sewing-tops-author.md](sewing-tops-author.md) (one-piece construction
notes appear in that prompt).

## How the autopilot routine uses this

The autopilot routine config lives at
`C:\Users\Rebecca\.claude\scheduled-tasks\autopilot-queue\SKILL.md`. The
sewing routing section follows the same shape as needlework
(`phase_needlework_pipeline_setup_001`):

1. The round-robin queue picks `sewing` if and only if
   `pipelineStatus = READY` and at least one `SubCategory.autopilotEnabled
   = true` exists. Until S-5 ships, neither is true and sewing is
   invisible to the queue.
2. Once enabled, the routine reads `SubCategory.autopilotEnabled = true
   AND categoryId = <sewing>`, picks the sub-cat with the smallest
   published count (largest coverage gap), and resolves the matching
   prompt from the table above.
3. If the resolved prompt contains the marker string `Autopilot does
   NOT author` near the top (the specialist-curation stub convention),
   the routine halts with `reason=SUB_CATEGORY_PROMPT_MISSING` and
   exits clean.

## Voice spec

All sewing prompts reference:

- `docs/voice-spec-2026-05-21.md` §3.4 (craft technique) and §3.5 (craft
  project).
- `docs/voice-spec-quick-reference.md` 10-point self-critique in §5.
- `feedback_homemade_voice.md` for the eight hard rules.
- `docs/common-issues.md` for cross-category recurring patterns.
- `docs/sewing-anti-tells.md` for sewing-specific anti-tells.

## Cross-cutting rules (apply to every sewing author prompt)

### Terminology lock

Use "grade between sizes" or "adjusts between sizes". Never use "mash"
or "mashing" anywhere in body, marketing, Studio UI, or pattern
instructions. Reason: "mash" is indie pattern slang that reads as
in-crowd jargon to anyone outside the indie pattern community. The
Homemade voice register (Mary Berry / Erin Boyle / Barbara O'Neill /
Martha Stewart) does not speak slang.

### Calibration paths (every pattern)

Every sewing pattern surfaces four download paths:

1. **Printer path.** A4, Letter, Legal, A3, A0 tiled or single-sheet,
   with on-screen "print at 100% scale, do not fit to page" reminder
   and a 1-inch test square for the user to measure after printing.
2. **Credit-card on-screen calibration.** For users without printers.
   The Studio shows a 1-inch / 25.4mm square calibrated against an
   actual credit card (53.98mm by 85.60mm) and the user iterates until
   matched.
3. **Projector grid.** For users with ceiling projectors, a separate
   SVG file without page boundaries calibrated against a known-size
   grid.
4. **Browse-only mode.** For users who only want to read patterns and
   instructions, the Studio renders pattern pieces inline at relative
   scale with measurements labelled.

The Studio never blocks a user because they lack a printer. Every
author prompt mentions all four paths in the "What you need" or
"Downloading the pattern" section.

### Body measurements

The default measurement profile asks for five fields: bust / chest,
waist, hip, body height, inseam. The advanced disclosure adds bust
point, back waist length, front waist length, shoulder width, arm
length, wrist circumference, thigh / calf / ankle circumference, neck
circumference. Author prompts that need an advanced measurement surface
it inline at the point it is needed, not up-front.

### Image policy

NEVER generate images during tutorial or pattern authoring. The
permitted visual surfaces are:

1. freesewing-rendered SVG (S-5a's wrapper draws this from the
   `@freesewing/<design>` package output; cached server-side by hash
   of measurements + options + calibration mode).
2. Parametric schematic (an in-house renderer that draws the garment
   silhouette with measurement chips; out of scope for S-3, future
   work).
3. Designer-provided heroes (the S-7 / Worker J designer onboarding
   flow attaches a photo or render).
4. Public-domain illustrations (Project Gutenberg, Internet Archive,
   Wikimedia Commons) where they fit the construction the tutorial
   teaches.

No AI image generation, ever. No Fal img2img against any sewing
visual. Drafts ship with `hero` unset; the dedicated image worker
sources hero imagery per `feedback_image_strategy.md`.

### Premium gating

Free for any signed-in user (per the locked free-tier-is-the-full-
product model):

- Pattern downloads in all four calibration paths
- Sewing planner (printable / saveable plan with materials + steps)
- Saved body measurements
- Step-by-step instructions
- Materials calculator (fabric requirements per size and fabric width)
- Cutting layout planner

Premium (gated by config flag, no user-facing UI in S-3):

- Custom grading to body measurements (the killer feature: user inputs
  their exact measurements, gets a personalised pattern draft)
- Visual hack composer (combine patterns, lengthen, shorten, swap
  sleeves, change neckline, add pockets)
- Pattern combination (sleeve from one pattern, body from another)

Author prompts mention which features sit behind the premium gate; the
gate itself is Worker F's territory.

### freesewing attribution

Patterns derived from a `@freesewing/<name>` package carry an MIT
licence and a one-line attribution credit in the tiled-print footer
and the browse-only footer. Attribution is suppressed on projector
mode to keep the projector grid clean. The S-5a wrapper handles the
attribution layer; author prompts note the convention.

## Category-level pipeline-setup standards

Populated by `seed-sewing-pipeline-standards.ts`:

- `Category.sewing.targetTutorialCount = 3000`. Honest upper bound
  across all 16 sub-cats at maturity. freesewing 60+ base designs,
  plus in-house designs for the children / lingerie / quilting /
  costume gaps, plus a 50-designer onboarding pipeline at 50
  patterns each.
- `Category.sewing.techniqueSlugs[]`. Every sewing technique
  referenced across the master author prompts (130+ entries).
- `Category.sewing.criticalTechniques[]`. The must-know prerequisites
  (10 entries).
- `Category.sewing.aliases[]`. Search synonyms covering UK / US
  terminology pairs and indie sewing-blog vocabulary.

See `packages/db/scripts/seed-sewing-pipeline-standards.ts` for the
exact values seeded.

## See also

- `project_sewing_locked_decisions.md` (auto-memory). Every locked
  decision that shapes these prompts.
- `docs/sewing-anti-tells.md`. Sewing-specific anti-tells.
- `docs/voice-spec-2026-05-21.md` §3.4, §3.5.
- `docs/voice-spec-quick-reference.md` §5.
- `feedback_homemade_voice.md`. The eight hard voice rules.
- `feedback_image_strategy.md`. Image policy.
- `feedback_measurement_units.md`. cm canonical.
- `feedback_studio_renderer_patterns.md`. Studio + renderer shared
  patterns sewing's Studio inherits.
