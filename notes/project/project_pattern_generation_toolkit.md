---
name: pattern-generation-toolkit
description: "The cross-stitch generation toolkit + persisted-thumbnail system built 2026-06-20 — where the generators live, the three quote tiers, the JSON-driven autopilot interface, and the thumbnail persistence shipped to prod. Read before productionizing the autopilot or extending generation."
metadata: 
  node_type: memory
  type: project
  originSessionId: 9d8c98e7-6483-4e4b-99be-0a4fd5eedc6b
---

Built 2026-06-20. The cross-stitch generation engines currently live as worker
tooling in `apps/web/scripts/` (NOT yet productionized into the autopilot
library). To make the real cron autopilot produce the rich new styles, this
logic should move into `apps/web/src/lib/studio/generation/` and be wired into
`autopilot.ts`.

**Engines — `apps/web/scripts/quote-engine.ts`:**
- `buildIllustration` — AI subject + a cheeky caption. Pipeline: `fluxIllustration` → `reserveBand` (composite the subject into a fixed region of a white square so a clean caption band is guaranteed) → `imageToChart` with `preprocess:{ trim:false }` (CRITICAL — auto-trim would crop the reserved band back off and the caption would slice through the subject) → `whiteToFabric` (near-white stitched cells → bare fabric, partial-coverage look) → `subjectCaption` (centres the caption on the subject's horizontal middle + a fixed small gap from its edge, clears a clean band, overlays crisp text).
- `buildBotanical` — AI lush floral FRAME / WREATH / CORNER sprays with an empty centre → chart → whiteToFabric → crisp quote stitched in the middle.
- `buildRetro` / `buildCelestial` / `buildSampler` / `buildTypo` / `buildMixed` / `buildMinimal` — flat procedural graphic styles via `crispChart`.
- `stripCaption` recovers the subject-only chart (caption is always the last palette entry) so text can be re-placed without re-running the AI.
- LOCKED PRINCIPLE: the AI never draws the words (Flux can't spell). Text is always a crisp overlay snapped to the palette. See [[project_cross_stitch_pipeline]].

**JSON autopilot interface (the shape a real cron would call):**
- `xs-gen-from-json.ts <specs.json> [slugFilter...]` — generate a batch from JSON. Tiers: `scene` (Tier E full-coverage illustration — animals/cocktails/seasonal/cosy/landscapes/monochrome), `illustration`, `botanical`, `retro`, `celestial`, `sampler`, `typo`, `mixed`, `minimal`. Saves each UNLISTED + renders a proof to `C:/tmp/<slug>.png` for the vision gate.
- `xs-publish-approved.ts <subCategorySlug> <slug...>` — publish vetted slugs PUBLIC into a cross-stitch sub-category, attribute to the Homemade house designer (`cmqkjybwo0000ncv4bcjgwgtm`), sanitise the description, persist a thumbnail. Never touches heroMediaId or category flags.
- `xs-contact-sheet.ts <label> <slug...>` — build a review sheet, upload to R2, print the URL.
- `quote-specs.ts` holds `buildSpec` (dispatcher) + the locked 40-quote batch as a worked example.

**Fonts:** Windows/Office fonts render fine through librsvg/sharp (Georgia, Cambria, Cooper Black, Bauhaus 93, Old English Text MT blackletter, Magneto, Goudy Stout, Rockwell, Brush Script, Lucida Calligraphy, etc.) — decorative typography with no font installs.

**Persisted thumbnails — SHIPPED to prod (`apps/web/src/lib/studio/pattern-thumbnail.ts`):**
- Problem: the library card image came from an on-demand render route (`/api/studio/patterns/[id]/thumbnail`) that Cloudflare returns as DYNAMIC (uncached), so a grid of ~100 cards = ~100 origin sharp renders → very slow.
- Fix: render the 960×720 PNG once, store in R2, record on `Pattern.thumbnailMediaId` (NEVER `heroMediaId` — that's the finished-piece photo slot, e.g. Stitching Mama listings, and must not be overwritten). `patternHeroUrl` resolves hero photo → saved thumbnail → on-demand route. The route now redirects to the saved asset when present and write-through persists on first miss (self-healing for all pattern categories).
- R2 upload from a local script uses the Cloudflare REST path (`CLOUDFLARE_API_TOKEN`); the R2 S3 keys (`R2_ACCESS_KEY_ID/SECRET`) are blank locally and only set in prod ECS.

**Sub-category gotcha:** the public grid (`PatternLayout`) filters `subCategory.categoryId`, so a pattern with a NULL subCategory NEVER appears. Always assign a sub-category on publish. Cross-stitch sub-cats (2026-06-20): animals, florals, quotes-and-sayings, pride-and-inclusive, seasonal, cocktails, landscapes, art-reproductions, monochrome, home-cosy.

**Dense 100+ colour showpiece tier (2026-06-30):** the shared converter
(`apps/web/src/lib/studio/photo-to-pattern.ts`) used to hard-cap at
`Math.min(colours, 96)` AND wrap a 78-glyph symbol set AND map into the curated
140-entry DMC table — three independent ceilings that pinned dense showpieces at
~78 (often less). Fix shipped (opt-in / size-gated, Studio live-preview default
UNCHANGED): (1) `maxColours` setting lifts the 96 ceiling, clamped to the symbol
count; (2) `flossRange: 'full'` resolves cells against the full ~458-colour
`dmc-full.ts` range (imported only into the server-only converter, NOT
nearest-floss — that's client-bundled via BrandSwapDialog); (3) `PATTERN_SYMBOLS`
expanded to 154 unique DejaVu-covered glyphs (schema rejects dup symbols);
(4) palette now keyed by FLOSS CODE not quantised colour, so palette size = true
distinct-floss count and identical-floss cells merge (also fewer confetti
islands). `convert.ts imageToChart` + `xs-volume-gen.ts` auto-gate the dense
tier at colours>96. KEY FINDING: with the cap lifted, the real limiter is the
SOURCE — the 4-step Flux **schnell** art only holds ~85–90 perceptually-DMC-
distinct colours, so dense briefs land ~84–88 crisp flosses on schnell.
RESOLVED 2026-06-30 — dense tier moved to **Flux 1.1 Pro**: the cap was never the
real bottleneck once full-range landed; the SOURCE was. The dense branch of
`xs-volume-gen.ts` now sources from Pro (`fluxIllustrationPro` in `sources.ts`,
reusing `generateWithFluxPro`; cached as `<slug>.flux-pro.png`, ~£0.032/call,
hero carve-out), the 5 big showpiece briefs bumped to **150 colours** (a 150
request lands ~105 distinct on Pro), and **NO median denoise** on the Pro path —
Pro's clean inference doesn't grain, so the schnell denoise would only throw
colours away. confettiMin stays 'high'. Gated full-size vs NORTH_STAR on
m-big-fairy-garden (106) / m-big-botanical-garden (105) / m-big-cottage-market
(106) — genuine 100+, masterpiece-tier, crisp, no confetti, dramatically better
than schnell. Published OVER the 3 live rows (were 78 colours) via
`xs-publish-pro-showpieces.ts` (data-driven: worktree emits PatternData JSON +
thumbnail, main-side script updates data+metrics+thumbnail only, leaves taxonomy/
hero). Process split that worked around the Edit-writes-to-main bug: run
GENERATION from the worktree (has the new converter), run DB/PUBLISH from the
main checkout (where @homemade/db resolves), verify with Bash grep on explicit
paths, double-check both `git status` clean at the end. Tooling note: that worktree session's Edit/Write tools
intermittently wrote to the MAIN checkout instead of the worktree — verify edits
landed with a Bash grep on the explicit worktree path, or apply via Bash.

Related: [[project_cross_stitch]], [[project_cross_stitch_pipeline]], [[feedback_homemade_voice]], [[feedback_pattern_complexity_range]], [[project_photo_accuracy_solution]].
