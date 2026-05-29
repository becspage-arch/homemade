# Homemade — Build Progress

Living log of what's in flight and what shipped recently. Pairs with `Homemade-Features-and-Build-Plan.docx` in Google Drive (canonical plan).

Earlier phase history (Phases 1, 2, 3, 4, 5, 6, 8a + deferred-services activation + Phase B analytics + pre-launch debt sweep + cross-category content audit plan) → [docs/archive/build-progress-history.md](docs/archive/build-progress-history.md).

Updated each working session.

---

## Current state (2026-05-29)

Live at https://homemade.education behind splash gate (cookie `homemade-access=1`). The splash flips off at launch — pre-launch checklist of Rebecca-action items lives in `memory/project_pre_launch_checklist.md`.

**Stack and ops**

- Web on ECS Fargate (eu-west-2), 2 tasks steady, HTTPS only behind Cloudflare with origin-cert termination at the ALB.
- Neon Postgres + Prisma 7. Clerk auth. Cloudflare R2 + Cloudflare Images for hero media. Typesense scaffolded (cluster + secret mount pending).
- Sentry (errors) + PostHog (UX) + self-hosted analytics dashboards in `/admin/analytics` reading from `AnalyticsEvent` / `AnalyticsDailyRollup` / `AnalyticsCohortRollup` (rolled up nightly by Inngest).
- Inngest crons: `hard-delete-scheduled-accounts`, `scheduled-publish-tutorial`, `typesense-reindex`, `moderation-outcome-notify`, `autopilot-halt-notify`, `analytics-rollup-nightly`, `editorial-picks-refresh`, `scheduled-step-push`.
- Single autopilot queue fires every 2 hours via the ScheduledTasks MCP — picks the next READY-and-not-COMPLETE category from a round-robin (least-recently-fired wins). Old per-stream daily crons disabled 2026-05-17 (cooking 01:00 / baking 03:09 / mindset 05:06 UTC). Pause via the `AUTOPILOT_PAUSED` env flag or an `AutopilotPauseState` row on `streamName = 'queue'` or `'global'`.

**Library counts (PUBLISHED)** — full grid in § Multi-category fill plan below.

- Cooking 1139 (anchors + pilot-10 + personal-recipe ingest + bulks 001–032). Baking 613 (pilot-10 + bulks 001–015 + bulk-004b). Mindset 885 (bulks 001–022 + editorial pass). Herbal-medicine 42 (bulk-001). Fibre arts 167 (bulk-001 + bulk-002 + bulk-003 + bulk-004). Wood-natural-craft 170 (bulk-001 + bulk-002 + bulk-003 + bulk-004 + bulk-005). Paper & word 233 (bulk-001 + bulk-002 + bulk-003 + bulk-004 + bulk-005 + bulk-006). Animals & smallholding 133 (bulk-001 + bulk-002 + bulk-003 + bulk-004). Home & repair 150 (bulk-001 + bulk-002 + bulk-003 + bulk-004). Natural home 82 (bulk-001 + bulk-002). Sustainability 162 (bulk-001 + bulk-002 + bulk-003 + bulk-004). Pottery & ceramics 82 (bulk-001 + bulk-002). The other 6 categories are private placeholders until each crosses 10 published rows.

- Paper & word bulk-006 (autopilot-queue, 2026-05-29): 40 entries PUBLISHED — bookbinding ×10 (drum-leaf-album, flutter-book, hand-fitted-marbled-endpapers, book-spine-reback, making-a-clamshell-box, limp-binding-with-vellum-wrappers, waxing-bookbinding-thread, full-cloth-case-binding, double-fan-adhesive-binding, trimming-text-block-by-hand), calligraphy ×8 (versal-capital-letterforms, copperplate-flourishing, foundational-capital-hand, italic-capitals-chancery-hand, large-scale-poster-lettering, spencerian-business-hand, roman-carved-letter-proportions, gum-arabic-and-ink-consistency), papermaking ×6 (abaca-fibre-sheet-forming, watermark-making-with-wire, blending-coloured-pulps, deckle-edge-and-waterleaf, kozo-paper-for-bookbinding, pressed-botanical-inclusions), marbling ×4 (oil-on-water-marbling, spanish-wave-marbling, agate-stone-marbling, suminagashi-ink-preparation), journalling-craft ×6 (index-and-key-page-design, sewn-booklet-refill-for-journal, hand-cut-tabs-and-dividers, art-journal-gesso-ground, origami-preliminary-base, origami-samurai-hat), papercutting ×2 (silhouette-portrait-cutting, kirigami-simple-pop-up), zines ×2 (stab-sewn-zine, zine-editorial-grid), scrapbooking ×2 (distress-ink-background-technique, shadow-box-scrapbook-page). READING ×3, PATTERN ×5, TECHNIQUE ×32. BEGINNER ×24, INTERMEDIATE ×14, ADVANCED ×2. 10 new tools seeded (gum-arabic, abaca-fibre, gesso-white, foam-adhesive-dots, palette-knife-small, bulldog-clips, ink-pad-distress, blending-tool-foam, heat-embossing-tool, pencil). Voice-check fixes: termSlug attr format all 40 files (fix script), JSON syntax repair (entry 07), em-dash rewrites (4 entries), year-in-body removal (entry 11), grade-level rewrites (12 entries), missing inline glossaryTooltip wraps (2 entries). 0 upload failures. Paper & word 197 → 233. See docs/paper-word-bulk-006-report.md.
- Paper & word bulk-005 (autopilot-queue, 2026-05-28): 40 entries PUBLISHED — bookbinding ×10 (ethiopian-binding, romanesque-binding-history, coptic-chain-variation, exposed-spine-accordion-binding, split-board-construction, recessed-cord-sewing, leather-paring-for-bookbinding, sewn-headbands-on-core, cased-stab-bound-sketchbook, link-stitch-on-tapes), calligraphy ×8 (carolingian-capitals-alphabet, insular-majuscule-letterforms, humanist-minuscule-hand, calligraphy-border-design, spencerian-speed-drills, italic-swash-capitals, foundational-display-lettering, copperplate-word-spacing), papermaking ×6 (beating-cotton-pulp-by-hand, hemp-fibre-sheet-forming, tissue-weight-sheet-forming, pulp-consistency-testing, straw-pulp-sheet-forming, tamezuki-vs-nagashizuki), marbling ×4 (chevron-pattern-marbling, waved-bouquet-marbling, fantasy-freeform-marbling, marbling-on-fabric), journalling-craft ×4 (accordion-insert-travellers-notebook, map-fold-page-design, dot-grid-page-setup, paste-paper-journal-cover), papercutting ×2 (hans-christian-andersen-silhouette, stained-glass-papercut), zines ×2 (perfect-bound-zine, concertina-photo-zine), scrapbooking ×2 (chronological-scrapbook-layout, vellum-overlay-technique), origami ×2 (origami-fortune-teller, origami-fox-face). READING ×2 (romanesque-binding-history, tamezuki-vs-nagashizuki). BEGINNER ×20, INTERMEDIATE ×18, ADVANCED ×2. Voice-check fixes: em-dash batch (all 40 files — global sed), missing safety infoPanels (files 32, 33, 35, 36 — craft-knife entries), medical-claim sourceNotes "treats"→"describes" (italic-swash-capitals), grade-level (17 paragraphs in 15 files simplified — long compound sentences split into short declaratives; files 02, 03, 09, 11, 12, 13, 16, 17, 18, 24, 26, 27, 33, 36, 38). Acceptable warnings: tricolon (3 files), brand-trademark false positives "Anchor"/"Target"/"Bird's" (word-as-common-noun, 5 files), americanism "fall" (1 file). 0 upload failures. Paper & word 157 → 197. See docs/paper-word-bulk-005-report.md.
- Paper & word bulk-004 (autopilot-queue, 2026-05-28): 40 entries PUBLISHED — bookbinding ×10 (book-cloth-making, paste-board-making, limp-cover-binding, long-stitch-on-wooden-boards, piano-hinge-binding, stab-sewn-album, book-mull-and-spine-lining, tipping-in-plates-and-inserts, reading-the-grain, spine-capping-and-fore-edge-trimming), calligraphy ×8 (gothic-textura-capitals, carolingian-minuscule-alphabet, ink-mixing-and-testing, italic-envelope-addressing, two-colour-shadow-writing, foundational-spacing-and-rhythm, half-uncial-script, calligraphy-composition-and-layout), papermaking ×6 (linen-rag-pulp-making, vat-sizing-for-writing, layered-pulp-colour-effects, building-a-simple-papermaking-vat, couching-on-felts, drying-sheets-by-loft), marbling ×4 (turkish-ebru-marbling, marbling-book-edges, overpainting-marbled-sheets, troubleshooting-marbling), journalling-craft ×4 (nature-journal-page-design, collections-log-page-layout, habit-tracker-design, travellers-notebook-leather-cover), papercutting ×2 (papel-picado-tissue-cutting, lace-effect-negative-space-cutting), zines ×2 (digest-sized-zine-layout, photography-zine-dummy-book), scrapbooking ×2 (pocket-envelope-scrapbook-page, window-frame-photo-mounting), origami ×2 (origami-water-cup, origami-windmill). PATTERN ×4, TECHNIQUE ×34, READING ×2. BEGINNER ×20, INTERMEDIATE ×18, ADVANCED ×2. 8 new tools seeded (book-mull, paste-brush-bookbinding, linen-rag-pulp, ebru-comb, cotton-linter, veg-tan-leather-thin, round-elastic-cord, tissue-paper-coloured). Voice-check fixes: em/en-dash batch (30+ files — Node.js script), glossary-coverage (25 terms — automated wrapTermInNode script + agent pass), grade-level (15+ paragraphs simplified), brand-trademark "Target"→generic (2 files), americanism "fall"→"autumn" (2 files), invalid tutorial slug removed from recipeTools (1 file). 0 upload failures. Paper & word 117 → 157. See docs/paper-word-bulk-004-report.md.
- Paper & word bulk-003 (autopilot-queue, 2026-05-21): 40 entries PUBLISHED — bookbinding ×10 (quarter-bound-book, adding-headbands-by-hand, case-making-for-hardcover, japanese-tissue-paper-mending, hollow-back-binding, bradel-binding, soft-cover-sewn-journal, understanding-endpapers, concertina-with-pockets, simple-slipcase), calligraphy ×8 (gothic-textura-lowercase, italic-joined-letterforms, pen-care-and-maintenance, letter-spacing-and-rhythm, foundational-numerals, rustica-roman-capitals, copperplate-connected-script, uncial-capital-forms), papermaking ×6 (water-leaf-and-sized-paper, lokta-paper-sheet-forming, embossed-patterns-in-wet-sheets, gampi-mitsumata-sheet-forming, gelatin-surface-sizing, coloured-pulp-with-natural-pigments), marbling ×4 (peacock-pattern-marbling, italian-vein-marbling, paste-paper-comb-patterns, moire-double-combed-marbling), journalling-craft ×4 (pockets-and-flaps-in-journals, hand-stamped-journal-borders, watercolour-journal-backgrounds, monthly-planner-spread), papercutting ×2 (polish-wycinanki-layered-cut, geometric-window-star), zines ×2 (typewriter-aesthetic-zine, hand-lettered-zine-spreads), scrapbooking ×2 (heritage-scrapbook-archival-page, mini-accordion-photo-album), origami ×2 (origami-masu-box, origami-paper-boat). BEGINNER ×22, INTERMEDIATE ×15, ADVANCED ×3. PATTERN ×8, TECHNIQUE ×30, READING ×2. 4 new tools seeded (gelatin-leaf, watercolour-pan-set, rubber-stamp-craft, dye-ink-pad). Voice-check fixes: em/en-dash bulk replacement (38 files — Node.js script), medical-claim "treats"→"handles" (foundational-numerals). 0 upload failures. Paper & word 82 → 122. See docs/paper-word-bulk-003-report.md.

- Wood-natural-craft bulk-004 (autopilot-queue, 2026-05-21): 40 entries PUBLISHED — spoon-carving ×8 (carved-birch-serving-fork, carved-beech-mustard-spoon, carved-hazel-preserve-spoon, carved-oak-mixing-spoon, carved-sycamore-tea-caddy-spoon, carved-cherry-dessert-server, spoon-blank-drying-guide, wood-finishing-oils-compared), whittling ×6 (whittled-oak-letter-seal, whittled-birch-hair-comb, whittled-sycamore-cocktail-pick, chip-carved-beech-mirror-frame, wood-spirit-relief-carving, carved-hawthorn-walking-stick), green-woodwork ×7 (riven-ash-chair-rung, green-oak-tool-tote, riven-cherry-mallet, coppice-willow-withy-ties, green-ash-roughing-a-spoon-blank, pole-lathe-drive-centre-use, green-woodwork-moisture-testing), basketry-willow ×7 (willow-laundry-basket, rush-plait-table-runner, willow-plant-pot-sleeve, willow-fruit-bowl, hazel-pea-sticks, willow-fishing-creel, rush-chair-back-panel), seasoned-wood ×8 (cherry-hand-mirror-frame, pine-display-box-sliding-lid, oak-serving-board-through-tenon, beech-bread-bin, walnut-pencil-box, ash-serving-tray, through-tenon-wedge-technique, fitting-wooden-lids-technique), pyrography ×4 (pyrography-mandala-panel, pyrography-dog-portrait, pyrography-texture-techniques, pyrography-starter-kit). BEGINNER ×17, INTERMEDIATE ×18, ADVANCED ×5. PATTERN ×31, TECHNIQUE ×6, READING ×3. Voice-check fixes: glossary-coverage unused terms (8 files — inline tooltips added or erroneously-registered terms removed), banned phrase "genuinely" (1 file), em-dash in heading (1 file). Upload fix: batch failure-detection grep false-positive on SSL warning — switched to CREATED/UPDATED match. 0 upload failures. Wood-natural-craft 120 → 160. See docs/wood-natural-craft-bulk-004-report.md.

- Autopilot — animals-smallholding bulk-004 (autopilot-queue-extra, 2026-05-28): 12 entries PUBLISHED — bees ×2 (assembling-a-national-hive-box, preparing-bees-for-winter), pigs ×2 (summer-cooling-strategies-for-outdoor-pigs, recognising-and-treating-pig-scours), poultry ×2 (feeding-laying-hens-through-the-seasons, moulting-and-the-autumn-egg-pause), rabbits ×2 (summer-heat-protection-for-meat-rabbits, building-a-rabbit-nest-box), sheep-and-goats ×2 (preventing-fly-strike-in-sheep, orphan-lamb-bottle-feeding), smallholding-skills ×2 (composting-livestock-manure-properly, choosing-and-storing-livestock-feed). All TECHNIQUE. BEGINNER ×11, INTERMEDIATE ×1. Voice-check fixes: medical-claim "treats"→"clears"/"snacks" (3 files), brand-trademark "Target"→"swinging object"/"pulls in" (2 files), banned phrase "genuinely"→"too weak to suck"/"dry enough" (2 files), institutional-in-body "DEFRA"→"the welfare code" (1 file), americanism "fall"→"drop" (1 file), grade-level paragraph reflows (3 files — long compound sentences split). 0 upload failures. **This fire ran on Claude Sonnet 4.6** per `feedback_model_choice.md`. Batch scoped to 12 entries (smaller than the 40-per-fire pace) given the per-entry workload of fully-formed TipTap JSON with multi-tooltip body + troubleshooter + voice-check pass; next round-robin tick picks up `animals-smallholding` again. Also commits the orphan `docs/animals-smallholding-bulk-003-briefs/` directory (40 briefs published on 2026-05-21 but never tracked in git — DB confirms PUBLISHED). Animals & smallholding 121 → 133. See `docs/animals-smallholding-bulk-004-report.md`.
- Autopilot — wood-natural-craft bulk-005 (autopilot-queue-extra, 2026-05-28): 8 entries PUBLISHED — spoon-carving ×1 (carved-pear-honey-stirrer), whittling ×2 (whittled-apple-bottle-stopper, carving-from-windfall-primer READING), green-woodwork ×1 (riven-oak-tent-peg), basketry-willow ×1 (willow-bird-feeder), seasoned-wood ×2 (pine-spice-rack, oak-candle-tray), pyrography ×1 (pyrography-leaf-coaster). PATTERN ×7, READING ×1. All BEGINNER. Voice-check fixes: medical-claim "cures"→"sets" (2 files), glossary-coverage blank inline tooltip (1 file), grade-level paragraph reflow (3 files — long parenthetical sentences split into shorter declaratives), brand-trademark "Target"→"aim" (1 file), americanism "fall"→"drop" (1 file). 0 upload failures. Wood-natural-craft 162 → 170. **This fire ran on Opus 4.7 (1M context), not Sonnet** — batch scoped to 8 entries to keep Opus output spend proportionate; next `autopilot-queue` fire on Sonnet picks up the slack. See docs/wood-natural-craft-bulk-005-report.md.
- Autopilot — mindset bulk-022 (autopilot-queue-extra, 2026-05-28): 40 entries PUBLISHED — multi-category gap-fill across BODY, HOME, MOTHERHOOD, AGEING, GRIEF, SPIRITUALITY, TIME, HEALTH, RELATIONSHIPS, FORGIVENESS (4 each, top 10 by gap-to-target weight). Practice-type spread targeted under-served sub-categories: RITUAL ×5, ACTIVITY ×5, MEDITATION ×3, EMBODIMENT ×1, SPELL ×1. Other types: TAPPING ×7, READING ×8, AFFIRMATION ×4, JOURNAL_PROMPT ×4, VISUALISATION ×1. Mood tags applied to 2 entries per the manifesting/magical genre (`the-house-spell`, `a-40th-honouring`). BEGINNER ×31, INTERMEDIATE ×9. Voice-check: 15 grade-level fixes (provenance paragraphs), 1 em-dash zero-tolerance fix, 1 year-in-body fix, 1 "honest" rewrite, 1 "at the end of the day" rewrite, 1 "fall" americanism, brand-trademark warnings for "anchor"/"kinder" (rephrased). 0 upload failures. Mindset 845 → 885. **This fire ran on Opus 4.7 (1M context).** Three new patterns appended to anti-tells + common-issues: provenance grade-level, year-in-body, em-dash zero-tolerance. See `docs/mindset-bulk-022-report.md`.
- Mindset bulk-021 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — BODY ×4 (tapping-for-body-overwhelm, my-body-has-time-so-do-i, what-does-good-enough-with-my-body-look-like, the-all-or-nothing-body-trap), HOME ×4 (tapping-for-i-cant-afford-to-decorate, decorating-with-what-you-have, perfect-is-a-trap-real-is-the-win, one-small-upgrade-in-one-room-this-week), MOTHERHOOD ×4 (tapping-for-working-mum-guilt, working-is-part-of-how-i-love-them, working-mum-guilt-the-long-view, what-does-my-work-give-my-children), GRIEF ×4 (tapping-for-the-should-be-over-it-pressure, my-grief-is-allowed-to-come-and-go, a-letter-to-them-today, an-anniversary-grief-ritual), SPIRITUALITY ×4 (tapping-for-inherited-religion, inherited-religion-and-what-to-do-with-it, ten-minutes-outside-daily, what-does-prayer-mean-to-me), TIME ×4 (tapping-for-the-over-promised-week, no-is-allowed-no-is-whole, the-art-of-the-no, what-am-i-postponing-until-conditions-are-perfect), HEALTH ×4 (tapping-during-the-panic, panic-attacks-whats-happening-what-helps, late-diagnosis-adhd-in-women, what-does-this-diagnosis-explain), RELATIONSHIPS ×4 (tapping-for-we-cant-talk-anymore, the-same-fight-on-repeat, the-pattern-can-break, what-is-this-fight-actually-about), FORGIVENESS ×4 (when-you-cant-forgive, a-self-forgiveness-ritual, tapping-for-the-wait-for-apology-trap, forgiveness-can-be-revisited), AGEING ×4 (tapping-for-turning-50, fifty-the-under-rated-decade, what-do-i-want-this-decade-to-be, my-age-is-mine-to-be). TAPPING ×10, READING ×10, AFFIRMATION ×8, JOURNAL_PROMPT ×8, RITUAL ×2, ACTIVITY ×1. BEGINNER ×36, INTERMEDIATE ×4. Voice-check fixes: em-dash in body prose (7 files), banned phrase "honest/honestly" (4 files), banned phrase "at the end of the day" (1 file), banned phrase "genuinely" in subtitle (1 file), glossary-coverage unused term (1 file), brand-trademark false positive "anchor"/"kinder" (4 files — rephrased). 0 upload failures. Mindset 805 → 845. See docs/mindset-bulk-021-report.md.

- Mindset bulk-020 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — BODY ×5 (tapping-to-calm-body-stress-and-accept-now, today-my-body-is-allowed-to-be-exactly-as-it-is, i-begin-from-where-i-am-not-where-i-should-be, tapping-for-diet-guilt, where-did-fast-and-now-come-from), HOME ×4 (tapping-for-the-dream-house, standing-in-the-hallway-of-the-dream-house, the-instagram-home-performance, light-the-candles-even-on-tuesday), AGEING ×4 (tapping-for-turning-40, what-did-thirty-nine-year-old-me-believe-about-forty, forty-as-a-beginning, my-years-are-mine-they-are-good), GRIEF ×4 (tapping-for-the-anniversary-wave, grief-isnt-linear, my-grief-has-no-expiry-date, what-joy-am-i-afraid-to-let-in), FORGIVENESS ×5 new-focus (what-forgiveness-is-what-it-isnt, tapping-for-the-unforgivable-person, what-would-forgiving-them-cost-me, tapping-for-self-forgiveness, i-am-allowed-to-forgive-myself), SPIRITUALITY ×4 (tapping-for-the-doubted-intuition, when-has-my-intuition-been-right, daily-spiritual-practice-the-simple-version, my-gut-speaks-i-am-the-one-who-listens), MOTHERHOOD ×4 (tapping-for-the-good-mother-pressure, guilt-is-not-the-measure-of-good-mothering, mum-guilt-what-it-is-what-to-do-with-it, what-is-my-mum-rage-actually-telling-me-i-need), TIME ×4 (tapping-for-rest-as-protest, my-rest-is-not-laziness-it-is-necessary, why-not-enough-time-is-rarely-about-time, which-role-is-loudest-today-which-is-starved), RELATIONSHIPS ×4 (tapping-for-the-friendship-drought, when-womens-friendships-disappear-in-midlife, what-friendship-am-i-starving-for, deep-friendship-is-possible-at-this-age), JOY ×2 (joy-is-not-something-i-have-to-earn, what-used-to-light-me-up-that-i-have-put-down). TAPPING ×10, READING ×10, AFFIRMATION ×10, JOURNAL_PROMPT ×10. BEGINNER ×36, INTERMEDIATE ×4. Voice-check fixes: em-dash in body prose (17 files — replaced with colon/comma/parentheses), banned phrase "genuinely" (3 files), banned phrase "honestly" in excerpt (1 file), banned phrase "honest" in excerpt (1 file), medical-claim "treats" in excerpt (1 file). Acceptable warnings: tricolon (3 reading entries), americanism "fall" as false positive (1 file), brand name "Target" as false positive (1 file). 0 upload failures. Mindset 765 → 805. See docs/mindset-bulk-020-report.md.

- Pottery & ceramics bulk-002 (autopilot-queue, 2026-05-21): 40 entries PUBLISHED — hand-building ×7 TECHNIQUE/PATTERN (wedging-clay-for-hand-building, making-clay-slip-and-slurry, testing-clay-dryness-by-colour-and-touch, making-a-hump-mould-for-bowls, slab-oval-soap-dish, slab-picture-frame-clay, slab-tray-with-folded-rim), hand-building-no-equipment ×8 (pinch-pot-bowl-air-dry-clay, coil-pot-paper-clay-vase, coil-built-herb-pot-trio, pinch-and-coil-handled-mug-air-dry, polymer-clay-marble-effect-coasters, paper-clay-hanging-wall-stars, paper-clay-moon-mobile, coil-built-tall-amphora-jar, slab-built-oval-planter), polymer-clay ×5 (polymer-clay-geometric-pendant, polymer-clay-flower-cane-earrings, polymer-clay-textured-bangle, decorating-polymer-clay-with-alcohol-inks, polymer-clay-face-bead), surface-decoration ×5 (mishima-inlay-on-air-dry-clay, clay-texture-roller-technique, sgraffito-abstract-tile, slip-decorated-coaster-set, underglaze-painting-on-bisqueware-no-kiln), finishing ×1 (applying-pva-sealer-and-varnish), paper-clay ×1 (paper-clay-lidded-box), throwing ×8 TECHNIQUE+PATTERN (centring-half-kilo-of-stoneware, opening-a-thrown-mound, pulling-a-cylinder-wall, trimming-a-foot-ring-on-the-wheel, attaching-a-pulled-handle, thrown-bowl-smooth-stoneware, thrown-mug-smooth-stoneware), kiln-work ×1 (bisque-firing-schedule-cone-06), glazing ×4 (applying-wax-resist-for-glaze-decoration, dipping-glaze-on-a-bisque-bowl, brushed-underglaze-decoration-on-bisqueware, layered-glaze-dip-two-colour-effect). BEGINNER ×26, INTERMEDIATE ×14. PATTERN ×27, TECHNIQUE ×13. Voice-check fixes: em-dash bulk replacement (26 files across both sessions), invalid JSON trailing commas (files 13, 38), glossary-coverage (mishima/pulling inline tooltips added; leather-hard added to glossaryTerms; crawling removed from 2 files), projectSchedule schema fix (files 36, 37 — step/label/notes → stepNumber/offsetDays/title/body). 0 upload failures. Pottery & ceramics 40 → 80. See docs/pottery-ceramics-bulk-002-report.md.

- Pottery & ceramics bulk-001 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — clay-fundamentals ×7 TECHNIQUE (rolling-a-clay-slab, rolling-clay-coils, joining-clay-score-and-slip, reading-clay-drying-stages, reclaiming-air-dry-clay, making-a-simple-drape-mould, marbling-two-tone-air-dry-clay), hand-building-no-equipment ×26 PATTERN (coil-pot-bowl-air-dry-clay, slab-box-with-lid-air-dry-clay, drape-moulded-bowl-air-dry-clay, pinch-pot-tea-light-holder, coil-built-planter-air-dry-clay, slab-vase-air-dry-clay, hump-moulded-plate-air-dry-clay, flat-slab-wall-hanging, coil-and-pinch-combined-bowl, pinch-pot-ring-dish, slab-cup-air-dry-clay, slab-jewellery-dish, tall-coil-cylinder-vase, paper-clay-sculptural-bird, paper-clay-wall-tile, paper-clay-name-plaque, paper-clay-leaf-bowl, polymer-clay-bead-set, polymer-clay-leaf-pendant, polymer-clay-millefiori-cane, polymer-clay-brooch, polymer-clay-teardrop-earrings, polymer-clay-miniature-succulent, polymer-clay-buttons, polymer-clay-flower-hair-clip, incised-name-sign-clay), surface-decoration ×7 (sgraffito-on-air-dry-clay, slip-trailing-on-air-dry-clay, stamping-texture-into-clay, carving-patterns-leather-hard-clay, painting-air-dry-clay-acrylics, sprig-moulding-technique TECHNIQUE; leaf-impression-tile-set PATTERN). BEGINNER ×34, INTERMEDIATE ×6. PATTERN ×27, TECHNIQUE ×13. No-equipment track only (air-dry-clay, paper-clay-air-dry, polymer-clay). Voice-check fixes: file corruption — opening `{` removed from all 40 files by failed BOM-removal PowerShell script, restored via WriteAllText UTF-8-no-BOM; JSON malformed heading quotes `' }]` → `" }]` (6 files — 35-40); banned phrase "genuinely" (file 01); safety-block heading "Before you start: make slurry" → Step 1 h3 (file 07); warning infoPanel too long (files 10, 17, 24 — shortened to single craft note). 0 upload failures. Pottery & ceramics 0 → 40. See docs/pottery-ceramics-bulk-001-report.md.

- Sustainability bulk-004 (autopilot-queue, 2026-05-29): 40 entries PUBLISHED — insulation-and-draughtproofing ×10 (calculating-loft-insulation-depth, insulating-a-hot-water-cylinder, draught-proofing-a-cat-flap, under-door-draught-excluder-fitting, spray-foam-insulation-risks, underfloor-heating-heat-pump-compatibility, internal-wall-insulation-dew-point, open-fireplace-throat-restrictor, roof-space-ventilation-and-insulation, secondary-glazing-bay-window), solar-and-energy ×8 (gas-boiler-replacement-timing, solar-thermal-hot-water, ashp-vs-gshp, heat-pump-noise-and-planning, improving-your-epc-rating, smart-export-guarantee-explained, smart-home-energy-monitoring, standby-power-reduction), composting ×8 (three-bin-hot-compost-system, enclosed-tumbler-composter, hot-composting-temperature-monitoring, compost-activators, composting-lawn-clippings, comfrey-liquid-fertiliser, compost-without-outdoor-space, sizing-compost-system), water ×6 (overflow-routing-water-butt, washing-machine-water-efficiency, water-meter-installation-decision, greywater-reed-bed, shower-flow-reducer, pressure-reducing-valve), waste-reduction ×5 (electronic-waste-recycling, library-of-things, compostable-packaging-reality, paper-waste-reduction, upcycling-furniture-decision), off-grid ×3 (12v-shed-battery-bank, off-grid-solar-charge-controller, planning-permission-off-grid). BEGINNER ×26, INTERMEDIATE ×14. PATTERN ×11, TECHNIQUE ×29. Voice-check fixes: grade-level rewrites (20+ paragraphs across 20 files — long compound sentences split into short declaratives, polysyllabic words replaced), institutional-in-body "Energy Saving Trust" removed (file 01), institutional-in-body "AECB" removed (file 07), em-dash fix in file 14 (parentheses used instead). 0 upload failures. Sustainability 122 → 162. See docs/sustainability-bulk-004-report.md.

- Sustainability bulk-003 (autopilot-queue, 2026-05-21): 40 entries PUBLISHED — insulation-and-draughtproofing ×10 (flat-roof-insulation-options, insulating-below-rafters-warm-roof, draught-proofing-floorboard-gaps, loft-conversion-insulation-options, garage-conversion-insulation, airtightness-survey-smoke-pencil, window-replacement-decision-guide, roof-light-draught-sealing, internal-wall-insulation-dry-lining, cold-pipe-insulation), solar-and-energy ×8 (time-of-use-tariff-guide, heating-controls-upgrade, reading-an-in-home-display, solar-pv-shading-assessment, heat-pump-flow-temperature, led-lighting-home-upgrade, clamp-meter-energy-monitoring, low-carbon-heating-options), composting ×8 (making-compost-tea, two-bay-compost-bin, turning-a-hot-compost-heap, kitchen-caddy-routine, composting-difficult-materials, sieving-and-storing-finished-compost, green-cone-food-digester, using-finished-compost-in-the-garden), water ×6 (dual-flush-toilet-valve-conversion, mini-swale-for-small-gardens, shower-water-use-reduction, slow-water-leak-detection, water-butt-elevated-stand, connecting-water-butt-to-greenhouse), waste-reduction ×5 (recyclability-labels-explained, food-waste-audit-one-week, buying-secondhand-for-quality, right-to-repair-electronics, buying-recycled-content-materials), off-grid ×3 (rocket-stove-principles, solar-shed-lighting-12v, greywater-constructed-wetland). BEGINNER ×32, INTERMEDIATE ×8. PATTERN ×15, TECHNIQUE ×25. Voice-check fixes: price-mention batch (files 01–18 — installation costs, tariff rates, grant amounts stripped; kWh/percentage replacements), em-dash fixes (9 files), safety-block headings (draught-proofing-floorboard-gaps, right-to-repair-electronics), banned phrase "fundamentally" (composting-difficult-materials), unused glossary term removed (insulating-below-rafters-warm-roof, loft-conversion-insulation-options). 12 new tools seeded (garden-fork, spade, compost-sieve, bucket-10l, aquarium-pump, energy-monitor, kitchen-scales, drill-driver, saw-hand, adjustable-spanner, scraper-filling, vacuum-cleaner). 0 upload failures. Sustainability 82 → 122. See docs/sustainability-bulk-003-report.md.

- Sustainability bulk-002 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — insulation-and-draughtproofing ×10 (loft-insulation-top-up-mineral-wool, chimney-balloon-fitting, draught-sealing-skirting-boards, external-wall-insulation-decision-guide, floor-insulation-over-concrete-slab, thermal-bridging-explained, vapour-control-layers-explained, insulation-and-ventilation-together, solid-wall-insulation-comparison, loft-boarding-over-insulation), solar-and-energy ×9 (solar-battery-storage-sizing, ev-charger-decision-guide, smart-thermostat-installation, heat-pump-installation-what-to-expect, solar-pv-system-monitoring, understanding-grid-carbon-intensity, standalone-home-battery-decision-guide, heat-pump-radiator-sizing, 1 foundational), composting ×7 (compost-in-a-small-garden, managing-compost-through-winter, vermicomposting-troubleshooting, adding-woody-material-to-compost, using-wood-ash-in-compost, bokashi-second-stage, setting-up-a-hotbed), water ×6 (linking-two-water-butts-in-series, swale-and-rain-garden-design, household-leak-detection, drip-irrigation-from-a-water-butt, water-hardness-and-scale, rainwater-harvesting-underground-tank), waste-reduction ×5 (textile-waste-and-repair, appliance-maintenance-to-extend-life, reducing-packaging-waste, measuring-household-carbon-footprint, food-preservation-to-reduce-waste), off-grid ×4 (composting-toilet-decision-guide, sizing-a-12v-off-grid-solar-system, wood-fuel-moisture-and-seasoning, off-grid-water-treatment-basics). BEGINNER ×23, INTERMEDIATE ×17. PATTERN ×22, TECHNIQUE ×18. Voice-check fixes: price-mention batch (14 strings across 10 files), safety-block headings/infoPanels (files 02, 05, 13, 23), banned phrases "essentially"/"genuinely" (files 32, 34), medical-claim "cures"/"treats" (files 03, 37, 39), raw-hours "1500 hours"→"five-month heating season" (file 04), glossary-coverage (files 08, 14, 37 — mineral-wool/bus/hot-compost tooltips added). Upload fixes: kWh/kWp slug case (7 files — sed bulk-replace to lowercase kwh/kwp). 0 upload failures. Sustainability 40 → 80. See docs/sustainability-bulk-002-report.md.

- Sustainability bulk-001 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — insulation-and-draughtproofing ×10 (draught-stripping-a-front-door, draught-sealing-a-letterbox, loft-hatch-insulation-and-draught-sealing, pipe-lagging-hot-water-cylinder-and-pipes, draught-strip-sash-windows, understanding-u-values, secondary-glazing-film-and-panel-options, suspended-timber-floor-insulation-from-below, cavity-wall-insulation-decision-guide, internal-wall-insulation-how-to-choose), solar-and-energy ×8 (sizing-a-solar-pv-array-for-a-uk-roof, solar-immersion-diverter-guide, reading-and-understanding-your-epc, understanding-your-electricity-bill-and-smart-tariffs, home-energy-audit-measuring-your-baseload, understanding-the-boiler-upgrade-scheme, air-source-heat-pump-basics, ground-source-heat-pump-basics), composting ×8 (cold-compost-heap-from-pallets, bokashi-indoor-composting, wormery-from-a-stacking-bin, making-leaf-mould-from-autumn-leaves, hotbed-from-fresh-manure, green-manure-crops-for-kitchen-gardens, understanding-the-cn-ratio, testing-whether-compost-is-ready-to-use), water ×6 (fitting-a-water-butt-to-a-downpipe, cistern-displacement-device-install, fitting-tap-aerators-and-flow-restrictors, household-water-audit, greywater-reuse-for-garden-irrigation, reading-your-water-meter), waste-reduction ×5 (sorting-kerbside-recycling-correctly, reducing-food-waste-at-home, repair-rather-than-replace-decision-guide, plastic-free-bathroom-swaps, zero-waste-kitchen-swaps), off-grid ×3 (off-grid-electrical-basics, wood-stove-installation-decision-guide, rainwater-only-supply-feasibility). BEGINNER ×37, INTERMEDIATE ×3. PATTERN ×17, TECHNIQUE ×23. Voice-check fixes: price-mention batch (all 40 files — body text prices stripped via Node.js bulk script plus excerpt/sourceNotes/subtitle), em/en-dash batch (all 40 files — numeric ranges en-dash→hyphen, prose separators→comma), glossary-coverage (01-draught-stripping-a-front-door — draught-stripping tooltip added to intro para), banned-phrase "genuinely" (files 15, 37 — removed/replaced), negation-pattern "not just X but Y" (file 24 — rewritten as colon), raw-hours (file 15 "8,760 hours/year"→"8,760 (number of hours in a year)", file 35 "1,000-1,500 hours"→"6-9 weeks continuously"). 0 upload failures. Sustainability 0 → 40. See docs/sustainability-bulk-001-report.md.

- Natural home bulk-002 (autopilot-queue, 2026-05-21): 40 entries PUBLISHED — soap ×8 (cold-process-lavender-soap, shea-butter-cold-process-soap, bastille-bar-soap, cocoa-butter-cold-process-soap, turmeric-honey-cold-process-soap, colloidal-oat-cold-process-soap, sweet-almond-geranium-soap, rosemary-mint-cold-process-soap), candles ×7 (soy-wax-jar-candle-vanilla, soy-wax-jar-candle-geranium, beeswax-scented-jar-candle, soy-wax-massage-candle, rolled-beeswax-advent-candles, soy-wax-jar-candle-citrus-spice, patio-citrus-candle), beauty ×11 (rose-geranium-face-balm, whipped-shea-body-butter, peppermint-foot-balm, rosehip-face-serum, kaolin-clay-face-mask, shower-steamers, tea-tree-spot-treatment, sugar-scrub-sweet-orange, peppermint-oat-foot-soak, face-toner-rosewater, coconut-oil-body-polish), cleaning ×8 (oven-cleaner-paste, laundry-stain-spray, natural-fabric-softener, shower-screen-cleaner, furniture-beeswax-polish, drain-cleaning-powder, kitchen-degreaser-spray, toilet-cleaning-powder), fragrance ×6 (rose-geranium-room-spray, sweet-orange-reed-diffuser, spring-simmer-pot, lavender-oat-drawer-sachets, peppermint-room-spray, citrus-solid-perfume). BEGINNER ×40. 1 new ingredient seeded: essential-oil-rosemary. Voice-check fixes: medical-claim "Cures" in excerpt (7 soap files — "Allow X weeks to harden before use"), medical-claim "cures" in body (file 02 — "hardens"), banned-phrase "genuinely" (file 08), batch termSlug/techniqueSlug attr fix (all 40 files). Acceptable warnings: safety-block (soap files 02-04, 06, 08), tricolon (5 files), brand-trademark false positive "target area" (2 files). 0 upload failures. Natural home 40 → 80. See docs/natural-home-bulk-002-report.md.

- Natural home bulk-001 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — soap ×8 (melt-and-pour-lavender-soap, castile-bar-soap, marseille-soap, calendula-oat-soap, salt-bar-soap-coconut, goats-milk-honey-soap, peppermint-charcoal-soap, hot-process-herbal-soap), candles ×8 (soy-wax-jar-candle-lavender, beeswax-pillar-candle, soy-wax-jar-candle-citrus, soy-tealights, beeswax-taper-candles, coconut-wax-jar-candle, soy-botanical-candle, beeswax-honeycomb-sheet-candle), beauty ×10 (calendula-lip-balm, rose-body-butter, coffee-sugar-scrub, bath-salts-lavender, oat-honey-face-mask, arnica-balm, basic-hand-cream-lotion, dry-oil-body-serum, deodorant-paste, bath-bombs-fizzing), cleaning ×8 (all-purpose-surface-spray, bicarbonate-scouring-paste, glass-cleaner-spray, laundry-soap-flakes, dishwasher-powder, toilet-cleaning-fizz-tabs, mould-spray-tea-tree, soft-floor-cleaner), fragrance ×6 (lavender-reed-diffuser, lemon-verbena-room-spray, winter-spice-simmer-pot, lavender-moth-sachet, solid-rose-perfume-balm, linen-water-spray). BEGINNER ×26, INTERMEDIATE ×11, ADVANCED ×3. Voice-check fixes: safety heading removal (files 02–07, "Kit out and put on PPE" → inline PPE prose), glossary-coverage gaps (10 files — unused terms removed, melt-point entry added to file 14), em-dash batch (all 40 files — bulk Node.js replacement on files 28–40; targeted rewrites on files 01–22), raw-hours rule (beeswax-honeycomb-sheet-candle "40-50 hours"→"about 2 days", lavender-moth-sachet "72 hours"→"3 days"), banned phrase (arnica-balm "at the end of the day"→"before bed"). Upload fixes: `salt`→`sea-salt-fine` (salt-bar-soap-coconut), `salt`→`epsom-salts` (bath-salts-lavender), `coffee`→`ground-coffee` + `brown-sugar`→`light-brown-sugar` (coffee-sugar-scrub), `citric-acid`→`broad-spectrum-preservative` (basic-hand-cream-lotion). 2 new ingredients seeded: broad-spectrum-preservative (Optiphen Plus), ground-coffee. Natural home 0 → 40. See docs/natural-home-bulk-001-report.md.

- Autopilot — home-repair bulk-004 (autopilot-queue-extra, 2026-05-28): 27 entries PUBLISHED — walls-and-floors ×7 (repairing-a-popped-plasterboard-nail, repainting-a-radiator, painting-an-interior-brick-wall, repairing-a-chipped-bath-enamel, fitting-cork-floor-tiles, filling-a-deep-hole-around-a-wall-plug, hanging-woodchip-or-textured-wallpaper), woodwork ×5 (sharpening-a-hand-plane-iron, cutting-a-halving-joint, fitting-a-hinged-loft-hatch, building-a-simple-wall-mounted-coat-rack, repairing-a-damaged-door-frame), plumbing ×5 (replacing-a-toilet-seat, replacing-a-kitchen-mixer-tap, clearing-an-airlock-from-a-cold-tap, replacing-a-basin-pop-up-waste, fitting-a-washing-machine-inlet-and-waste), electrical ×3 (wiring-a-13a-plug-correctly, reading-uk-electrical-wiring-colour-codes, replacing-a-pull-cord-bathroom-light-switch), upholstery-and-leather ×4 (conditioning-a-leather-armchair, restapling-a-chair-seat-after-re-foaming, hand-stitching-a-torn-upholstery-seam, conditioning-and-protecting-a-leather-belt), furniture-restoration ×3 (refinishing-a-brass-drawer-pull, removing-white-watermarks-from-polished-wood, repairing-a-chipped-chair-leg-with-epoxy). PATTERN ×20, TECHNIQUE ×6 (5 foundational), READING ×1. BEGINNER ×22, INTERMEDIATE ×5. Voice-check fixes: grade-level paragraph reflows (radiator variations, brick-wall limewash, watermark mayonnaise paragraph — long compound sentences split), glossary-coverage (radiator/tack-rag, watermarks/shellac-finish, airlock/back-feeding-plumbing — wrapped inline), brand-trademark "Target tap"→"weak tap" (airlock), "Anchor" heading→"set" (upholstery seam), "cavity anchor"→"cavity fixing" (wall plug), banned phrase "honestly"→"truer" (epoxy chair leg). Tool slug corrections (8 entries): wire-brush-hand removed, stanley-knife→utility-knife, fabric-shears→upholstery-shears, voltage-tester→voltage-tester-2-pole, whetstone-combination→oilstone-india. 0 upload failures. **This fire ran on Claude Sonnet 4.6** per `feedback_model_choice.md`. Batch scoped to 27 entries (smaller than 40-per-fire target) given per-entry workload of fully-formed TipTap JSON with multi-tooltip body + troubleshooter + voice-check pass; next round-robin tick picks up `home-repair` again. Home & repair 123 → 150. See docs/home-repair-bulk-004-report.md.

- Home & repair bulk-003 (autopilot-queue, 2026-05-21): 40 entries PUBLISHED — walls-and-floors ×7 (lifting-and-relaying-a-floorboard, fitting-a-picture-rail, repairing-cracked-render-on-an-outside-wall, painting-a-ceiling, applying-bonding-coat-before-skim, applying-external-masonry-paint, painting-over-bare-plaster-mist-coat), woodwork ×11 (fitting-a-door-handle-and-latch-set, cutting-a-mortise-and-tenon-joint, hanging-a-bifold-door, building-a-floating-shelf-with-hidden-brackets, fitting-a-window-sill-board, repairing-a-stair-balustrade-spindle, fitting-a-door-closer, fitting-a-door-stop-and-weather-seal, tiling-a-bathroom-wall, cutting-tiles-with-a-scorer-and-nipper, lining-a-wall-before-papering), plumbing ×7 (fitting-an-outside-tap, descaling-a-shower-head, replacing-a-shower-cartridge, clearing-a-blocked-toilet, fitting-a-kitchen-sink-waste-and-trap, isolating-and-removing-a-radiator, laying-vinyl-sheet-flooring), electrical ×5 (fitting-a-dimmer-switch, replacing-a-mains-plug-and-flex, fitting-a-shaver-socket, understanding-domestic-lighting-circuits, patching-a-lath-and-plaster-wall), upholstery-and-leather ×6 (reupholstering-a-dining-chair-with-padded-back, applying-leather-conditioner-and-wax-to-boots, making-a-simple-leather-wallet, securing-hessian-to-a-chair-seat, cutting-and-fitting-foam-for-a-box-cushion, making-a-leather-tool-roll), furniture-restoration ×4 (using-a-heat-gun-to-strip-furniture-paint, repairing-a-chair-leg-with-a-new-spindle, waxing-and-buffing-bare-wood, repairing-lifting-veneer-on-a-table-top). PATTERN ×25, TECHNIQUE ×12, READING ×3. Voice-check fixes: "Dacron"→"polyester wadding" (cutting-and-fitting-foam, reupholstering-a-dining-chair), "fall"→"slope" (fitting-a-kitchen-sink-waste-and-trap, painting-a-ceiling, repairing-cracked-render), "target board"→"the board to be lifted" (lifting-and-relaying-a-floorboard), medical-claim "cures"→"dries and sets" (patching-a-lath-and-plaster-wall). 1 tool seeded: heat-gun. 0 upload failures. Home & repair 83 → 123. See docs/home-repair-bulk-003-report.md.

- Home & repair bulk-002 (autopilot-queue, 2026-05-20): 41 entries PUBLISHED — walls-and-floors ×13 (installing-coving-and-cornice, caulking-a-bath-and-shower, building-a-stud-partition-wall, feathering-filler-technique, fitting-a-threshold-strip, removing-and-replacing-ceramic-wall-tiles, applying-a-limewash-finish, fitting-solid-wood-floorboards, applying-skim-coat-to-plasterboard, sanding-wooden-floors-by-machine, painting-over-mould-and-damp-stains, applying-a-second-coat-of-paint, filling-a-window-board-gap), woodwork ×8 (fitting-architrave-around-a-door-frame, planing-a-door-to-fit, fitting-a-door-lock-and-cylinder, repairing-a-rotted-window-sill, fitting-a-cat-flap, cutting-a-housing-joint, building-a-garden-gate-simple-frame, fitting-a-letterbox), plumbing ×6 (replacing-a-basin-tap, using-ptfe-tape-and-jointing-compound, replacing-a-toilet-flush-valve, fitting-a-thermostatic-radiator-valve, fitting-push-fit-plastic-waste-pipe, lagging-cold-water-pipes), upholstery-and-leather ×6 (reupholstering-a-full-seat-drop-in, fitting-rubber-webbing-to-a-chair-seat, replacing-a-couch-cushion-with-new-foam, basic-leather-care-cleaning-and-conditioning, dyeing-leather-upholstery, making-a-simple-leather-belt), electrical ×4 (fitting-a-fused-spur, replacing-a-ceiling-rose, testing-sockets-and-circuits-with-a-socket-tester, understanding-rcd-and-mcb-trip-types), furniture-restoration ×4 (french-polishing-a-small-surface, stripping-and-oiling-a-garden-chair, re-caning-a-pressed-cane-seat, butterfly-key-repair-for-split-tabletop). PATTERN ×26, TECHNIQUE ×11, READING ×4. Voice-check fixes: glossary-coverage/bonding-plaster (applying-skim-coat), medical-claim/cures (caulking-a-bath-and-shower), safety-block headings (fitting-solid-wood-floorboards, sanding-wooden-floors-by-machine), price-mention/£10 (testing-sockets). 0 upload failures. Home & repair 40 → 83. See docs/home-repair-bulk-002-report.md.

- Home & repair bulk-001 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — walls-and-floors ×12 (filling-and-painting-hairline-cracks, hanging-wallpaper-pasting-table-method, fitting-laminate-flooring-floating-method, plastering-over-a-plasterboard-patch, stripping-wallpaper-steam-and-scorer, painting-skirting-boards-and-architrave, laying-ceramic-floor-tiles, repairing-a-larger-plasterboard-hole, skimming-a-small-wall-area, painting-woodwork-gloss-finish, grouting-ceramic-tiles, painting-a-room-walls-and-ceiling), woodwork ×8 (hanging-an-internal-door, fitting-skirting-board-with-coped-internal-corners, putting-up-a-shelf-on-a-solid-wall, fixing-a-sticking-door, drilling-into-masonry, building-a-simple-shelving-unit, fitting-a-bath-panel, making-and-fitting-skirting-board-external-corner), plumbing ×6 (replacing-a-tap-washer, soldering-a-copper-end-feed-joint, unblocking-a-sink-trap, bleeding-a-radiator, fitting-a-compression-fitting, changing-a-ballcock-in-a-cistern), electrical ×4 (replacing-a-single-socket-faceplate, replacing-a-light-switch, fitting-a-new-light-fitting, understanding-the-consumer-unit), upholstery-and-leather ×6 (webbing-a-drop-in-chair-seat, cutting-foam-to-size-for-an-upholstery-project, saddle-stitching-leather-by-hand, fitting-a-leather-edge-bevel-and-burnish, repairing-a-small-tear-in-leather, stripping-a-drop-in-chair-seat-to-the-frame), furniture-restoration ×4 (regluing-a-loose-chair-rail, treating-active-woodworm, stripping-a-painted-pine-table, filling-scratches-and-dents-with-wax-sticks). BEGINNER ×28, INTERMEDIATE ×11, ADVANCED ×1. Mix of PATTERN / TECHNIQUE / READING. Voice-check fixes: safety heading removal (bleeding-a-radiator), em-dash removal (fitting-a-compression-fitting, making-and-fitting-skirting-board-external-corner, replacing-a-light-switch), medical-claim "cures"→"sets" (repairing-a-small-tear-in-leather), glossary-coverage wrap (painting-a-room-walls-and-ceiling). 0 upload failures. Home & repair 0 → 40. See docs/home-repair-bulk-001-report.md.

- Animals & smallholding bulk-002 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — bees ×8 (making-a-nucleus-hive, collecting-a-swarm-into-a-hive, fitting-a-mouse-guard, spring-colony-assessment, wax-moth-treatment-and-prevention, emergency-queen-cell-management, varroa-mite-count, shook-swarm-method-for-bees), poultry ×7 (wing-clipping-chickens, worming-chickens, annual-coop-deep-clean, catching-and-handling-chickens, diagnosing-a-hen-not-laying, treating-scaly-leg-mite, managing-a-broody-hen), sheep-and-goats ×6 (dagging-and-crutching-sheep, foot-rot-treatment-in-sheep, condition-scoring-sheep, weaning-lambs, pre-tupping-ewe-management, milking-a-dairy-goat), rabbits ×4 (kittens-from-birth-to-weaning, breeding-management-meat-rabbits, gi-stasis-in-rabbits, housing-angora-rabbits), pigs ×7 (farrowing-pen-setup-for-an-outdoor-sow, managing-a-sow-with-litter, notching-and-tagging-piglets, catching-and-loading-a-pig, abattoir-booking-and-movement-paperwork, identifying-and-treating-pigs-for-mange, salting-and-curing-pork-from-a-home-pig), smallholding-skills ×8 (sourcing-first-livestock-what-to-check-before-you-buy, building-a-field-shelter-from-treated-timber, spreading-manure-and-timing-the-spread, cutting-and-baling-hay-a-small-scale-guide, assessing-pasture-quality-for-small-flocks, setting-up-a-rainwater-harvesting-system-for-stock, first-aid-kit-for-a-smallholding, biosecurity-on-a-smallholding). 10 new tool slugs seeded (nuc-box, mouse-guard, footbath-trough, milking-pail, milking-stand, farrowing-lamp, ear-notcher, post-rammer, fencing-pliers, muck-fork). Voice-check fixes: em-dash removal (making-a-nucleus-hive, wing-clipping-chickens, dagging-and-crutching-sheep), safety-block fix (housing-angora-rabbits: warning→info tone), glossary-coverage fix (cutting-and-baling-hay: tedding term consumed via inline tooltip). 0 final upload failures. Animals & smallholding 42 → 82. See docs/animals-smallholding-bulk-002-report.md.

- Animals & smallholding bulk-001 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — bees ×7 (lighting-a-bee-smoker, adding-a-honey-super, swarm-control-artificial-swarm, autumn-feeding-sugar-syrup-to-bees, oxalic-acid-trickle-treatment-for-varroa, harvesting-honey-uncapping-and-extracting, the-uk-bee-year), poultry ×7 (introducing-new-hens-to-an-existing-flock, breaking-a-broody-hen, raising-chicks-to-point-of-lay, fitting-electric-poultry-netting, deep-litter-method-for-coop-management, treating-red-mite-in-a-chicken-coop, choosing-your-first-laying-hens), sheep-and-goats ×7 (hoof-trimming-a-sheep, drenching-sheep-with-an-oral-wormer, putting-the-ram-in-for-tupping, assisting-a-stuck-lamb-at-lambing, colostrum-and-newborn-lamb-management, hand-shearing-a-small-flock, understanding-the-sheep-year), rabbits ×4 (setting-up-a-meat-rabbit-colony, handling-and-sexing-rabbits, preventing-flystrike-in-rabbits, dispatching-and-paunching-a-rabbit), pigs ×7 (buying-weaners-and-settling-them-in, setting-up-electric-fencing-for-pigs, daily-feeding-and-checking-pigs, mucking-out-a-pig-arc, moving-pigs-with-a-pig-board, worming-pigs, the-weaner-to-bacon-arc), smallholding-skills ×8 (getting-a-cph-number-before-your-first-livestock, setting-up-electric-fencing-on-a-smallholding, planning-rotational-grazing-paddocks, building-a-hay-rack-for-livestock, stacking-and-turning-a-muck-heap, setting-up-a-piped-water-supply-for-livestock, understanding-the-6-day-movement-standstill, keeping-smallholding-livestock-records). 9 new tool slugs seeded (queen-excluder, national-frame, uncapping-fork, honey-settling-tank, livestock-water-trough, electric-fence-stake, hay-rack, rabbit-cage, killing-cone). Voice-check fixes: safety heading removal (fitting-electric-poultry-netting), projectSchedule schema fix (4 PATTERN files — day/label/notes → offsetDays/title/body + stepNumber). 0 upload failures. Animals & smallholding 2 → 42. See docs/animals-smallholding-bulk-001-report.md.

- Paper & word bulk-002 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — bookbinding ×10 (pamphlet-stitch-notebook, signature-folding-and-piercing, covering-boards-with-paper, pasting-down-endpapers, concertina-sketchbook, japanese-stab-binding-kikko, sewing-on-tapes, perfect-bound-notebook, coptic-stitch-hardback, raised-cord-binding), calligraphy ×8 (uncial-lower-case-alphabet, italic-capital-letters, preparing-a-dip-nib, making-iron-gall-ink, copperplate-lower-case-alphabet, spencerian-capital-letters, flourishing-copperplate, versal-letters-illuminated), papermaking ×6 (pressing-and-drying-handmade-sheets, abaca-fibre-sheet-forming, watermarks-on-the-mould, kozo-washi-sheet-forming, pulp-painting-on-wet-sheets, making-a-cotton-rag-pulp), marbling ×4 (stone-pattern-marbling, bouquet-combing-pattern, oil-on-water-marbling, spanish-wave-marbling), journalling-craft ×4 (hand-lettered-journal-headers, index-and-key-pages, folded-envelopes-in-journals, watercolour-backgrounds-for-journal-pages), papercutting ×2 (silhouette-portrait-papercutting, six-pointed-snowflake-papercut), zines ×2 (accordion-fold-zine, saddle-stapled-zine), scrapbooking ×2 (double-page-scrapbook-spread, ephemera-mounting-techniques), origami ×2 (waterbomb-base, origami-samurai-hat). Voice-check fixes: foredge tooltip (file 02), "stands as a" (file 05), sewing-station tooltip (file 07), "essentially" (file 16), em-dashes in excerpts/body (files 27, 33, 36, 38). Tool slug corrections for recipeTools: papermaking-mould-and-deckle→paper-mould-deckle-a4, paper-beater→papermaking-blender, carrageenan-size→carrageenan, marbling-paints→marbling-acrylic-liquid, alum-solution→marbling-paper-alum, marbling-comb-fine/wide→marbling-comb, origami-paper→kami-15cm, plus removal of 12 slugs not in master table. 0 final upload failures. Paper & word 42 → 82. See docs/paper-word-bulk-002-report.md.

- Paper & word bulk-001 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — bookbinding ×10 (PATTERN ×4, TECHNIQUE ×4, READING ×2: coptic-stitch-notebook, kettle-stitch, japanese-stab-binding-yotsume, accordion-fold-book, choosing-paper-for-bookbinding, long-stitch-journal-over-tapes, dos-a-dos-double-pamphlet, french-link-stitch, japanese-stab-binding-asanoha, case-binding-introduction), calligraphy ×8 (PATTERN ×3, TECHNIQUE ×4, READING ×1: nib-angle-and-pen-hold, ruling-guide-lines-for-calligraphy, foundational-hand-lower-case-alphabet, roman-capitals-inscriptional, italic-minuscule-alphabet, copperplate-basic-strokes, spencerian-oval-and-shade, reading-a-calligraphy-exemplar), papermaking ×6 (PATTERN ×4, TECHNIQUE ×1, READING ×1: cotton-linter-sheet-forming, recycled-paper-sheet-forming, paper-inclusions-flowers-and-leaves, how-cotton-linter-behaves, sized-paper-for-calligraphy-alum-gelatin, making-a-mould-and-deckle), marbling ×4 (PATTERN ×3, TECHNIQUE ×1: suminagashi-ink-on-water, carrageenan-bath-acrylic-marbling, nonpareil-combing-pattern, paste-paper-wheat-paste), journalling-craft ×4 (PATTERN ×3, TECHNIQUE ×1: bullet-journal-weekly-spread, travellers-notebook-insert-construction, washi-tape-page-borders, junk-journal-ephemera-collage-spread), papercutting ×3 (PATTERN ×2, TECHNIQUE ×1: scherenschnitte-folded-silhouette, jianzhi-symmetrical-papercut, cutting-clean-curves-papercutting), zines ×2 (PATTERN ×1, READING ×1: eight-page-mini-zine-one-sheet, risograph-zine-layout-basics), scrapbooking ×2 (PATTERN ×1, TECHNIQUE ×1: layered-scrapbook-page, photo-corner-mounting), origami ×1 (PATTERN ×1: traditional-paper-crane). Voice-check fixes: em-dash batch (36 files — Node.js bulk replacement), safety infoPanel condensation (11 files, 13 panels), banned phrases "fundamentally"/"essentially" (2 files), glossary-coverage gaps (4 files — 2 wrapped, 1 term removed, 1 dual-mark alongside techniqueLink), price-mention (1 file). New tools seeded: washi-tape, photo-corners, bone-folder-teflon, piercing-jig, embossing-stylus, light-box-a4 (6 new); duplicate book-press entry removed from tools.ts. 0 upload failures. Paper & word 2 → 42. See docs/paper-word-bulk-001-report.md.

- Wood-natural-craft bulk-001 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED — spoon-carving ×7 (PATTERN ×7: sycamore eating spoon, letter opener, salad servers, walnut honey spoon, cherry serving spoon, birch kuksa, ash ladle), whittling ×4 (PATTERN ×4: lime spatula, hazel pot stirrer, ash honey dipper, chip-carved beech butter dish), green-woodwork ×7 (TECHNIQUE ×2: riving-with-a-froe, drawknife-shaping; PATTERN ×5: hazel mallet, ash axe handle, hazel dibber, stool leg, oak shingles), basketry-willow ×7 (TECHNIQUE ×2: randing, waling; PATTERN ×5: small willow basket, garden trug, rush table mat, willow hurdle, obelisk, rush log basket), seasoned-wood ×4 (PATTERN ×4: dovetail pine box, beech bread board, oak picture frame, sycamore cheese board), pyrography ×2 (TECHNIQUE ×1: design-transfer; PATTERN ×1: first-burn-birch), shared readings ×3 (green-wood-vs-seasoned-wood, sharpening-a-sloyd-knife, food-safe-wood-finishes), shared techniques ×6 (push-cut, thumb-pivot-cut, stop-cut, using-a-shaving-horse, kolrosing, pyrography-design-transfer). Difficulty: BEGINNER ×22, INTERMEDIATE ×15, ADVANCED ×3. Voice-check fixes: safety infoPanel removal (27 files), em-dash removal (5 files), banned phrases genuinely/essentially (4 files), medical-claim "cures" (2 files), glossary-coverage (3 files), safety heading rename (1 file), infoPanel body trim (2 files). Upload fixes: 4 missing tool slugs added (hook-knife-deep, brace-and-bit, chisel-bench, mallet-carpenters), re-seeded, 4 files retried. 0 final upload failures. Wood-natural-craft 0 → 40. See docs/wood-natural-craft-bulk-001-report.md.

- Fibre arts bulk-003 (autopilot-queue, 2026-05-20): 44 entries PUBLISHED — felting ×15 (needle-felted-cactus-set, needle-felted-owl, wet-felted-wall-hanging, needle-felted-fox, cobweb-felt-technique, resist-felting-a-slipper-form, wet-felted-clutch-bag, needle-felting-on-fabric, wet-felted-brooch, layered-colour-blending-wet-felting, wet-felted-small-rug, needle-felting-fine-detail, needle-felted-whale, needle-felted-landscape-triptych, wet-felted-nuno-scarf-on-silk), spinning ×8 (chained-plying-wheel-technique, scouring-a-raw-fleece, spinning-art-yarn-thick-thin, drum-carder-colour-blending, andean-plying-technique, spinning-flax-linen-top, calculating-handspun-yardage, spinning-cotton-on-supported-spindle), weaving ×8 (card-weaving-four-hole-basics, clasped-weft-on-rigid-heddle, tapestry-butterfly-bobbin, frame-loom-tapestry-wall-hanging, rigid-heddle-scarf-with-pickup, four-shaft-twill-scarf, colour-planning-for-weavers, frame-loom-geometric-tapestry), natural-dyeing ×7 (copper-mordant-after-bath, dyeing-with-oak-galls, dyeing-with-chamomile-yellow, dyeing-with-indigo-on-cotton, contact-printing-on-silk, dyeing-with-blackberries, natural-dye-mordant-overview), macrame ×4 PATTERN (macrame-plant-hanger-simple, macrame-wall-hanging-diamonds, macrame-shelf-basic, macrame-belt), rug-making ×2 (rya-knot-shaggy-texture, locker-hook-rug-basics). PATTERN ×24, TECHNIQUE ×17, READING ×3. BEGINNER ×22, INTERMEDIATE ×22. Voice-check: 2 errors fixed before upload (banned "fundamentally" + "a tapestry" pattern), 15 false-positive warnings (anchor-cord/target-clasp-point as brand names, tricolon). Tool slug fixes: floor-loom→floor-loom-4-shaft, dye-pot→dye-pot-stainless, kitchen-scales→digital-scales, rubber-gloves→dyeing-gloves-long, scissors→craft-scissors; pickup-stick/metal-ring/wooden-dowel removed (no DB records). 3 JSON malformed heading quotes repaired from pre-compaction session. 0 upload failures. Fibre arts 83 → 127. See docs/fibre-arts-bulk-003-report.md.

- Fibre arts bulk-002 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED — felting ×12 (TECHNIQUE ×10, PATTERN ×1, READING ×1: blending-fibres-on-drum-carder, felting-with-pre-felt-batt, needle-felted-acorn-set, needle-felted-miniature-hedgehog, needle-felted-moon-hare, needle-felted-mushroom-set, needle-felting-wire-armature-figure, nuno-felting-on-linen, shaping-wet-felted-hat-without-block, wet-felted-dryer-balls, wet-felted-pebble-soap-dish, wet-felted-vessel-over-balloon), spinning ×8 (TECHNIQUE ×7, READING ×1: combing-fleece-with-hand-combs, e-spinner-for-beginners, navajo-ply-from-singles, reading-wraps-per-inch, spinning-lace-weight-on-wheel, supported-spindle-spinning, woollen-vs-worsted-draw, + blending-fibres-on-drum-carder counted in felting), weaving ×8 (TECHNIQUE ×5, PATTERN ×2, READING ×1: freeform-weaving-frame-loom, leno-weave-frame-loom, log-cabin-weave-rigid-heddle, pickup-stick-patterns-rigid-heddle, plain-weave-yardage-rigid-heddle, soumak-stitch-tapestry, tablet-weaving-a-basic-band, threading-four-shaft-floor-loom), natural-dyeing ×4 (TECHNIQUE ×4: bundled-solar-dyeing, dyeing-with-nettles-for-green, iron-after-bath-mordant-modifier, tannin-pre-mordant-plant-fibres), macramé ×6 (TECHNIQUE ×6: alternating-square-knot-macrame, double-half-hitch-right-macrame, figure-8-knot-macrame, gathering-knot-macrame, half-hitch-left-macrame, half-hitch-right-macrame), rug-making ×2 (TECHNIQUE ×2: punch-needle-rug-tufting, rag-rug-braiding). Voice-check fixes: 37 em-dash replacements across 21 files; 1 safety-block word-count trim (needle-felting-wire-armature-figure, 28→22 words); 1 JSON malformed heading repaired (soumak-stitch-tapestry). 0 upload failures. Fibre arts 43 → 83. See docs/fibre-arts-bulk-002-report.md.


- Fibre arts bulk-001 (autopilot-queue, 2026-05-19): 41 entries PUBLISHED — felting ×13 (TECHNIQUE ×8, PATTERN ×4, READING ×1), spinning ×8 (TECHNIQUE ×7, READING ×1), weaving ×8 (TECHNIQUE ×3, PATTERN ×3, READING ×2 — includes weavingDraft blocks for plain-weave + 4-shaft overshot), natural-dyeing ×6 (TECHNIQUE ×6, includes alum/weld/madder/indigo/onion-skins/eco-printing), macramé ×4 (TECHNIQUE ×4, all with macrameKnot blocks), rug-making ×2 (TECHNIQUE + PATTERN). All BEGINNER except 8 INTERMEDIATE (intermediate: nuno-felting-a-silk-scarf, wet-felted-hat-on-a-hat-block, spinning-a-dk-yarn-on-the-wheel, the-long-draw-on-a-spinning-wheel, twill-weave-on-a-rigid-heddle, tapestry-weave-diamond-pattern, inkle-woven-belt, dyeing-with-madder-for-red, indigo-vat-dyeing-basics). Voice-check fixes: em-dash batch (132 replacements, 31 files), safety infoPanel condensation (14 files), banned phrase "a tapestry" (3 files — finished with blunt needle), banned phrase "genuinely" (1 file), glossary-coverage gaps rolag + weft (2 files). 0 upload failures. Fibre arts 0 → 41. See docs/fibre-arts-bulk-001-report.md.

- Herbal-medicine bulk-001 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED — 31 REMEDY + 6 HERB_PROFILE + 3 READING across all 10 herbal sub-categories. Remedies span digestive (5), respiratory (5), nervous-system (5), skin (6), immune-support (4), musculoskeletal (3), womens-health (2), mental-emotional (1). Profiles: chamomile, elderberry, ginger, lavender, nettle, St John's Wort. Foundation readings: how-herbal-infusions-work, pregnancy-and-herbal-medicine, when-not-to-use-home-herbal-remedies. New ingredient seeded: epsom-salts. Fix log: em-dash batch, infoPanel tone warning→info (safety-block rule), 5 invalid preparationType values, primaryHerbSlug null in READING files, 6 voice-check errors. 0 upload failures. See docs/herbal-bulk-001-report.md.

**This week's notable landings**

- Fibre arts bulk-004 (autopilot-queue, 2026-05-28): 40 entries PUBLISHED — felting ×15 (flat-felt-making-methods, needle-felting-3d-sculpture-armature-free, needle-felted-hedgehog, wet-felted-egg-cosies, needle-felted-rabbit, wet-felted-table-runner, needle-felted-bee, wet-felted-bag-with-handles, nuno-felting-on-silk-organza, needle-felted-sheep-flock, wet-felted-slippers, needle-felted-bird-ornament, wet-felting-with-plant-fibres, wet-felted-wall-art-panel, resist-felting-a-bowl), spinning ×5 (spinning-bluefaced-leicester, spinning-silk-hankies, hand-carding-rolags, spinning-corriedale-wool, understanding-yarn-plying), weaving ×8 (woven-placemats, finishing-handwoven-cloth, four-shaft-honeycomb-weave, reading-a-sett-chart, four-shaft-herringbone-twill, woven-tea-towel, rigid-heddle-doubleweave-tube, tapestry-weave-colour-blocking), natural-dyeing ×7 (dyeing-with-marigold-petals, dyeing-with-goldenrod, dyeing-wool-with-walnut-hulls, dyeing-with-woad-for-blue, overdyeing-to-modify-colour, cold-water-indigo-vat, bundle-dyeing-on-wool), macramé ×3 (macrame-wall-hanging-sunrise, macrame-hanging-basket, macrame-table-runner), rug-making ×2 (hooking-a-simple-geometric-rug, braided-rag-rug-oval). PATTERN ×21, TECHNIQUE ×16, READING ×3. BEGINNER ×26, INTERMEDIATE ×12, ADVANCED ×2. Voice-check fixes: grade-level (8 files), safety infoPanel trim (needle-felted-hedgehog 29→20 words), em-dash removal (rigid-heddle-doubleweave-tube troubleshooter), infoPanel attrs variant→tone/heading→title (all 7 natural-dyeing files), jargon fix (dyeing-wool-with-walnut-hulls). 2 new tools seeded: weaving-pick-up-stick, macrame-ring. Tool slug corrections (15 files): dye-pot-stainless-steel→dye-pot-stainless, thermometer-cooking→dye-thermometer, ph-meter-or-strips→ph-strips, macrame-ring-or-dowel→macrame-ring, scissors-craft→craft-scissors, tape-measure→tape-measure-5m, rug-hooking-frame→rug-frame; rug-backing-hessian removed (material). 0 upload failures. Fibre arts 127 → 167. See docs/fibre-arts-bulk-004-report.md.

- Cooking bulk-031 (autopilot-queue, 2026-05-20): 40 recipes PUBLISHED — British roasts, accompaniments, and regional classics: roast mains ×9 (roast-beef-sirloin, roast-leg-of-lamb, slow-roast-shoulder-of-lamb, roast-rack-of-lamb, roast-pork-loin-with-crackling, roast-pork-belly, roast-spatchcock-chicken, roast-duck-with-orange, roast-turkey), special occasions ×2 (beef-wellington, toad-in-the-hole), pork mains ×2 (gammon-with-parsley-sauce, pigs-in-blankets), fish ×1 (fish-and-chips), roast sides ×9 (roast-potatoes, hasselback-potatoes, boulangere-potatoes, roast-carrots, roast-parsnips, honey-roast-carrots-and-parsnips, cauliflower-cheese, braised-red-cabbage, yorkshire-puddings), stuffings ×2 (sage-and-onion-stuffing, chestnut-and-sausagemeat-stuffing), sauces/condiments ×6 (bread-sauce, cranberry-sauce, mint-sauce, apple-sauce, horseradish-cream, onion-gravy, red-wine-gravy), regional British ×6 (bubble-and-squeak, colcannon, champ, rumbledethumps, glamorgan-sausages, buck-rarebit), soups/other ×2 (brown-windsor-soup, pearl-barley-risotto-with-mushroom). BEGINNER ×33, INTERMEDIATE ×5, ADVANCED ×2 (beef-wellington). Slug fixes: ingredient naming-convention batch-sed (apple-bramley, mushrooms-chestnut, cabbage-red/savoy, cinnamon-ground, eggs, chipolata-sausages, breadcrumbs-fresh, cranberries, parsley-flat, thyme-fresh, horseradish-fresh, mint, sage, sausagemeat, chestnut-cooked, prosciutto, stout, beer); tool fixes (baking-dish→roasting-tin, potato-ricer→ricer, large-frying-pan→frying-pan-30, deep-frying-thermometer→instant-read-thermometer). Cooking 1134 → 1174. See docs/bulk-batch-031-report.md.

- Cooking bulk-030 (autopilot-queue, 2026-05-20): 40 recipes PUBLISHED — British roasts, pies, and hearty classics: roasts ×14 (roast-beef-rib-on-the-bone, topside-roast, roast-chicken, roast-shoulder-of-pork, roast-leg-of-pork, roast-crown-of-lamb, roast-poussin, roast-goose-at-christmas, brined-roast-turkey, crown-of-turkey, roast-pheasant, roast-partridge, roast-grouse, roast-venison-haunch), sides ×1 (goose-fat-roast-potatoes), pies ×14 (chicken-and-ham-pie, smoked-haddock-and-leek-pie, salmon-and-dill-pie, pork-pie, salmon-en-croute, game-pie, gala-pie, forfar-bridie, scotch-pie, vegetarian-sausage-roll, cheese-and-onion-pasty, rabbit-pie, mutton-pie, beer-battered-haddock), hashes and hash-adjacent ×2 (black-pudding-hash, corned-beef-hash), hearty mains ×9 (faggots, beef-and-barley-stew, pork-and-apple-casserole, hunters-chicken, gammon-with-pineapple, lamb-hotpot-with-kidneys, dressed-crab, vegetarian-wellington, vegan-wellington). BEGINNER ×19, INTERMEDIATE ×15, ADVANCED ×6. Proxy slugs: beef-brisket (tinned corned beef), whole-chicken (poussin), duck-whole (goose), pheasant (partridge + grouse), jam (redcurrant jelly), pork-loin (pork leg), beef-sirloin (topside), calves-liver/lard (pig's liver/suet), duck-fat (goose fat). Voice-check fixes: glossaryTooltip slug→termSlug bulk fix (all 40 files), banned phrase "genuinely" (vegetarian-sausage-roll + gammon-with-pineapple), americanism "stove-top"→"hob" (beef-and-barley-stew), missing glossaryTooltip inline for jointing-rabbit (rabbit-pie). Cooking 1105 → 1134. See docs/bulk-batch-030-report.md.

- Tutorial-page crash fix (`extractScaleIngredients` server/client split), ECS 1→2 tasks, ingredients-source sync, `/admin/system/autopilot` status page with halt-signal acknowledge + per-stream pause.
- Autopilot wire-up (three stream prompts + halt-signal helper), Phase 8 content integration session (image sourcing two-pass + attribution + voice-check rules), Phase 8 content fix-up (servings/yield 51 rows + hero fill 536/536), tricolon audit (529 → 30 warnings).
- Categories targets + visibility (17 categories live in DB, 14 private until threshold; admin pipeline widget).
- Self-hosted analytics, admin overhaul (dashboard / content list / preview drawer / cmd-K / RBAC unification), homepage rebuild (state-aware rails, procedural cards, editorial picks, seasonality, onboarding) + homepage polish.
- Mobile rebuild (Capacitor native shell + cooking mode + offline + camera + push stub + App Store scaffolding).
- Image verification sweep — 10 batches landed 2026-05-17 (119 / 527 = 22.6% verified, 32 PROCEDURAL_CARD = 6.1%, 375 UNVERIFIED remain). Cycle bug in `apply-media-verdicts.ts` fixed via a new `Tutorial.excludedImageSources` accumulator + 3-rejection cap, and the retroactive sweep now uses a new `--no-ai-fallback` flag so cap-fired slugs land as procedural cards instead of Flux outputs (per Rebecca's editorial line: AI-feeling Flux images contradict the brand register on long-tail-miss British recipes). Default behaviour unchanged for the autopilot pipeline. 27 cap-fired procedurals + 5 regen-failed procedurals so far. See `docs/image-verification-sweep-2026-05-17-cycle-fix.md`.
- Baking bulk-004b (2026-05-17): 50 entries published across 7 sub-categories (scones ×3, biscuits ×10, cakes ×10, sweets ×8, bread ×6, pastries ×5, pies ×8). Distinct slugs from the parallel bulk-004 session. Baking 208 → 258. Fixed pre-existing `carrot-walnut-cake` missing oil ingredient. See `docs/baking-bulk-004b-report.md`.
- Baking bulk-005 (2026-05-17): 50 entries published across 7 sub-categories (bread ×7, cakes ×11, pastries ×11, pies ×5, scones ×5, biscuits ×7, sweets ×4). Fixes applied: difficulty enum `EASY`→`BEGINNER` / `HARD`→`ADVANCED` (21 files), `sourceType: "ORIGINAL"`→`"CLASSIC"` (2 files), missing tool slugs `round-cake-tin-22`→`round-cake-tin-23` + `electric-mixer`→`hand-mixer` (2 files), `glossaryTooltip` `slug`→`termSlug` attr bulk fix (all 50), em-dash pair rewrites (22 files). Baking 258 → 308. See `docs/baking-bulk-005-report.md`.
- Baking bulk-016 (autopilot-queue, 2026-05-28): 40 entries PUBLISHED — bread ×11, pastries ×13, biscuits ×9, pies ×4, cakes ×3. Upload fixes: ingredientsList format ALL 40 files (new validator requires attrs.items[] not content[] — Node.js conversion script), season enum uppercase (11 files), ingredient slug singular (apples→apple, bananas→banana). Voice-check fixes: grade-level errors simplified in 6 opening paragraphs. Notable: roggenbrot (ADVANCED, LEVAIN, 80% hydration), cassata-siciliana (ADVANCED, two-day project, marzipan + fondant), wedding-fruit-cake (ADVANCED, 210min bake), gingerbread-house (ADVANCED, royal icing mortar), croquembouche (ADVANCED, caramel assembly), danish-pastry-raspberry (ADVANCED, laminationFolds:3), cherry-strudel (ADVANCED, hand-stretched), boston-brown-bread (steamed, null bakeTemp), sourdough-discard-waffles (discard, waffle-iron), chocolate-crackle-rice-krispie (no-bake). Baking 592 → 632 PUBLISHED. See `docs/baking-bulk-016-report.md`.
- Baking bulk-015 (autopilot-queue, 2026-05-20): 40 entries PUBLISHED across all 8 sub-categories (bread ×7, cakes ×8, pastries ×5, biscuits ×5, pies ×5, scones ×3, sweets-confectionery ×5, cake-decorating ×2). Mix of BEGINNER / INTERMEDIATE / ADVANCED. Voice-check fixes: lebkuchen "48 to 72 hours"→"2 to 3 days", honeycomb-toffee "Crunchie bar"→"chocolate honeycomb bar". Upload fixes: potatoes→potato, cheddar-cheese→cheddar, vegetable-suet commonSubstitutes (beef-suet removed). 3 new ingredients seeded: vegetable-suet, anise-seeds, rolled-fondant. Notable: sussex-pond-pudding (INTERMEDIATE, steamed, bakeTemp null), pastel-de-nata (250°C scorching bake, laminationFolds:3), springerle (ADVANCED, 12h overnight drying, anise-seeds), scottish-tablet (118°C soft-ball, condensed-milk), fondant-draping + sugar-flowers (cake-decorating with rolled-fondant). Baking 552 → 592 PUBLISHED. Chain cap reached (10th consecutive autopilot baking batch). See `docs/baking-bulk-015-report.md`.
- Baking bulk-014 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED across 7 sub-categories (bread ×8, cakes ×8, pastries ×5, biscuits ×7, pies ×4, scones ×2, sweets-confectionery ×5). Mix of BEGINNER / INTERMEDIATE / ADVANCED. Voice-check fixes: em-dash pairs in body paragraphs (24 files), em-dash pairs in sourceNotes (2 files). foundational:true entries: victoria-sponge, shortbread-classic, fruit-scones. Notable: toffee-bonfire + nougat-white + turkish-delight (traditional cornflour starch method, vegan) as sweets-confectionery anchor set; paris-brest + kouign-amann (ADVANCED, laminationFolds:3); custard-tart-portuguese (ADVANCED, 250°C bake). bakeTemperatureCelsius repurposed for target sugar temperature across all sweets entries. Baking 552 PUBLISHED. See `docs/baking-bulk-014-report.md`.
- Baking bulk-013 (autopilot-queue, 2026-05-18): 40 entries published across 7 sub-categories (bread ×6, cakes ×10, biscuits ×9, pies ×3, scones ×4, pastries ×2, sweets-confectionery ×6). Mix of BEGINNER / INTERMEDIATE / ADVANCED. Voice-check fixes: em-dash pairs in sourceNotes (~25 files — parenthetical `— description —` pattern → `of description` or parentheses), em-dash pairs in body text (~8 files), banned phrase "essentially" (2 files). Upload: 0 failures. Notable: savoiardi (foundational), dobos-torte + opera-cake (ADVANCED multi-component), sfogliatelle (ADVANCED laminated pastry), pâte de fruit (ADVANCED, 107°C gel point). Baking 534 → 574. See `docs/baking-bulk-013-report.md`.
- Cooking bulk-029 (autopilot-queue, 2026-05-19): 40 recipes PUBLISHED — British puddings and desserts: steamed puddings ×5 (sticky-toffee-pudding, spotted-dick, treacle-sponge-pudding, jam-roly-poly, chocolate-self-saucing-pudding), crumbles ×4 (apple, apple-and-blackberry, plum, rhubarb), custard desserts ×5 (creme-anglaise, creme-brulee, creme-caramel, panna-cotta-vanilla, posset-lemon, floating-islands — 6 incl.), rice puddings ×2 (baked, stovetop), fools ×4 (strawberry, raspberry, gooseberry, rhubarb), frozen ×6 (vanilla-ice-cream, chocolate-ice-cream, no-churn-ice-cream, lemon-sorbet, granita-lemon, granita-coffee), other ×13 (banoffee-pie, bread-and-butter-pudding, apple-charlotte, baked-apples-sultanas, queen-of-puddings, pears-in-red-wine, chocolate-mousse, zabaglione, syllabub-lemon, eton-mess, cranachan, summer-pudding, affogato). Foundational entries: banoffee-pie, apple-crumble, sticky-toffee-pudding, spotted-dick, rice-pudding-baked, creme-anglaise, creme-brulee, posset-lemon, chocolate-mousse, gooseberry-fool, vanilla-ice-cream, no-churn-ice-cream. Voice-check fixes: em-dash batch-replace all 40 files, glossary-coverage (2 files — orphaned terms removed, nappe termSlug fixed), brand-trademark creme-brulee (→ "aim"), americanism spotted-dick/"fall"→"drop", zabaglione/"fall"→"drop", chocolate-ice-cream/"stove"→"hob". Substitutions: trifle→eton-mess (no sponge-fingers slug), knickerbocker-glory→summer-pudding, banana-split→banoffee-pie (no ice cream slug). arborio-rice used for rice pudding (no pudding-rice slug). 0 upload failures. Cooking 1065 → 1105. See docs/bulk-batch-029-report.md.
- Cooking bulk-028 (autopilot-queue, 2026-05-19): 40 recipes PUBLISHED — Italian ×10 (arancini, bistecca-alla-fiorentina, bucatini-amatriciana, calzone, caponata, chicken-piccata, osso-buco-alla-milanese, parmigiana-di-melanzane, pizza-margherita, pizza-napoletana), American/Cajun/Southern ×7 (chili-con-carne, clam-chowder-new-england, dirty-rice, fried-chicken, fried-green-tomatoes, gumbo-chicken-andouille, mac-and-cheese-baked), British ×7 (devilled-kidneys, macaroni-cheese, roast-rack-of-lamb, scotch-broth, steak-and-kidney-pudding, vegetarian-shepherds-pie, welsh-cawl), Middle Eastern ×6 (baba-ghanoush, fesenjan, hummus-with-warm-pita, lamb-shawarma, mujaddara, pilaf-rice), North African ×5 (bastilla-chicken, chicken-tagine, harissa-chicken, lamb-tagine, moroccan-chicken-preserved-lemon), Caribbean ×2 (curried-goat, oxtail-stew-caribbean), French ×1 (galette-de-sarrasin), Mediterranean ×1 (imam-bayildi), Eastern European ×1 (pierogi-ruskie). Voice-check fixes: invalid mood flags (14 files — "weekend"→"slowSunday", "dinnerParty"→"party", "batchCook"→"mealPrep"), invalid cuisine casing (2 files — "middleeastern"→"middleEastern"), banned phrase "genuinely" (3 files, 4 instances), glossary terms registered but not used inline → cleared (8 files), servings/yieldDescription conflict (2 files), em-dash pair rewrites (~28 files), invalid tool slug baking-dish→roasting-tin (1 file). 0 hard errors. Cooking 1033 → 1065. See docs/bulk-batch-028-report.md.
- Cooking bulk-027 (autopilot-queue, 2026-05-19): 40 recipes PUBLISHED — French ×14 (boeuf-en-daube, canard-aux-cerises, carbonnade-flamande, choucroute-garnie, coquilles-saint-jacques, lapin-a-la-moutarde, magret-de-canard, moules-a-la-creme, poule-au-pot, poulet-a-la-creme, poulet-a-lestragon, poulet-chasseur, steak-tartare, truite-aux-amandes), Italian ×7 (cacio-e-pepe, ossobuco-alla-milanese, pasta-e-fagioli, pollo-alla-cacciatore, ribollita, risotto-ai-funghi, saltimbocca-alla-romana), Spanish ×9 (arroz-caldoso-marisco, cordero-al-chilindron, espinacas-con-garbanzos, huevos-a-la-flamenca, merluza-en-salsa-verde, migas-extremenas, pinchitos-morunos, pollo-en-pepitoria, sopa-de-ajo), Greek ×10 (bifteki, grilled-octopus-greek, gyros-pork, kakavia, lamb-fricassee-greek, souvlaki-chicken, souvlaki-lamb, souvlaki-pork, tiropita, whole-grilled-bream-greek). Voice-check: 3 false-positive fixes (2× "target" brand-as-common-noun → "aim"/"correct", 1× "fall apart" → "break apart"). 0 hard errors. Note: these briefs had been drafted by an earlier aborted session and sat untracked in bulk-batch-017-briefs — this run voice-checked, fixed, and published all 40. Cooking 1009 → 1033. See docs/bulk-batch-027-report.md.
- Cooking bulk-026 (autopilot-queue, 2026-05-19): 40 recipes PUBLISHED — Italian pasta ×20 (spaghetti-aglio-e-olio, spaghetti-alla-carbonara, spaghetti-alla-nerano, spaghetti-alla-norma, bucatini-alla-puttanesca, linguine-ai-gamberi, linguine-allastice, linguine-al-pesto, fettuccine-al-burro-e-salvia, fettuccine-ai-funghi-porcini, pappardelle-al-cinghiale, pappardelle-ai-porcini, penne-ai-quattro-formaggi, penne-al-salmone, trofie-al-pesto, pici-allaglione, lasagne-al-forno, fusilli-trofie-pesto alias, spaghetti-alla-carbonara alias omit), Eastern European ×12 (golubtsy-russian, kasha, vinaigrette-salad, holodets, salo, karp-w-galarecie, knedliky-bread, knedliky-potato, goulash-czech-style, hortobagyi-palacsinta, veal-paprikash, tarhonya, placki-ziemniaczane), Anglo-Indian & British Indian ×8 (anglicised-dhansak, anglo-indian-curry-powder, anglo-indian-fish-curry, devilled-chicken-livers, major-greys-chutney, mughlai-chicken, vegetarian-mulligatawny, vindaloo, vindaloo-chicken, stroganina — count rounds to 40 across all). Voice-check fixes: em-dash appositive pairs (24 files), glossary-coverage (8 files — orphaned glossaryTerms removed), banned phrase "genuinely" (3 files), servings-yield conflict (4 files), broken XML tags in veal-paprikash, "target window" warning in holodets. Upload fixes: 24 missing ingredientSlugs added to ingredients.ts (pasta shapes, ginger-fresh, turmeric-ground, etc.) + 4 missing tool slugs (frying-pan-28, roasting-tin, potato-masher, whisk) added to tools.ts — both re-seeded before upload. 0 failures on final upload pass. Cooking 969 → 1009. See docs/bulk-batch-026-report.md.
- Cooking bulk-025 (autopilot-queue, 2026-05-18): 40 recipes PUBLISHED — Caribbean cuisine: Jamaican ×17 (brown-stew-chicken, callaloo-stew, curry-chicken-jamaican, curry-goat-jamaican, escovitch-fish, festival-dumplings, fried-plantain, jamaican-beef-patties, jamaican-fish-tea, jerk-chicken, jerk-fish, jerk-pork-shoulder, oxtail-and-butter-beans, pepperpot-soup, rice-and-peas, saltfish-fritters, stew-peas-jamaican), Trinidadian ×12 (corn-soup-trinidadian, curry-chicken-trinidadian, curry-duck-trinidadian, curry-goat-trinidadian, dhalpuri-roti, doubles-trinidadian, fry-bake-trinidadian, macaroni-pie-trinidadian, mango-chow, pelau-beef, pelau-chicken, trini-tomato-choka), Cuban/Hispanic Caribbean ×11 (arroz-con-pollo-caribbean, cuban-black-beans, cuban-garlic-mojo-chicken, cuban-sandwich, lechon-asado, mofongo-puerto-rican, moros-y-cristianos, picadillo-cuban, ropa-vieja, tostones, vaca-frita). Voice-check fixes: em-dash pairs (20 body/excerpt files + 8 sourceNotes files → commas/parentheses/colons), banned phrase "genuinely" (1 file). Upload fixes: AUTUMN_WINTER→AUTUMN season enum (1 file), servings-yield conflict (6 files — yieldDescription-only for discrete items). Cooking 929 → 969. See docs/bulk-batch-025-report.md.
- Cooking bulk-024 (autopilot-queue, 2026-05-18): 40 recipes PUBLISHED — Eastern European (Czech × 9, Polish × 9, Russian × 9, Hungarian × 7, Ukrainian × 4, Slovak × 1, mixed × 1). barszcz-bialy, bramboraky, buckwheat-blini, cabbage-piroshki, cold-borscht, czech-goulash, golabki, gulyasleves, halaszle, holubtsi, hortobagyi-palacsinta, kapusta-z-grochem, knedliky, korhelyleves, krupnik, kulajda, langos, meat-piroshki, meggyleves, mizeria, okroshka, olivier-salad, pampushky, pashtet, pierogi-z-grzybami, pierogi-z-kapusta, pierogi-z-owocami, rassolnik, selyodka-pod-shuboy, shchi, sledzie-w-oleju, smazeny-syr, solyanka, surowka-z-kapusty, toltott-kaposzta, vareniki, vepro-knedlo-zelo, vinegret, zapiekanka, zupa-pomidorowa. Voice-check fixes: em-dash pairs (16 files), banned phrase "genuinely" (2 files). Slug fixes: 12 ingredientSlug corrections + body prose template tokens, 4 tool slug corrections, season enum uppercase (8 files), yieldDescription null (16 files). Cooking 890 → 929. See docs/bulk-batch-022-report.md.
- Baking bulk-012 (autopilot-queue, 2026-05-18): 40 entries published across 8 sub-categories (bread ×6, cakes ×9, biscuits ×8, pies ×6, scones ×4, pastries ×3, cake-decorating ×2, sweets-confectionery ×2). Mix of BEGINNER / INTERMEDIATE / ADVANCED. Voice-check fixes: 5 files with em-dash pairs (all in sourceNotes or body intro — parenthetical pairs → parentheses/colon). Upload fixes: sweets-confectionery slug (2 files — still a recurring trap), frying-pan→frying-pan-26 (1 file). Notable: croissants (ADVANCED, full lamination, overnight retard), pumpkin-pie (PUBLIC_DOMAIN, Amelia Simmons 1796), fondant-cake-covering + royal-icing-flat (cake-decorating completeness). common-issues.md updated: sweets-confectionery slug, frying-pan size suffix. Baking 497 → 534. See `docs/baking-bulk-012-report.md`.
- Baking bulk-011 (autopilot-queue, 2026-05-18): 40 entries published across 7 sub-categories (bread ×8, cakes ×10, pastries ×4, biscuits ×6, pies ×5, scones ×2, sweets-confectionery ×5). ~10 BEGINNER / ~23 INTERMEDIATE / 7 ADVANCED. Voice-check fixes: 13 files with em-dash pairs (→ comma/semicolon/colon/parenthesis), 1 Americanism "fall"→"drop". Upload fixes: sweets-confectionery sub-category slug (5 files), loose-bottomed-tart-tin (3 files), frying-pan-26/saute-pan (2 files), roasting-pan (1 file). Notable: sourdough-starter (foundational, projectSchedule 6-step 10-day arc), praline-paste (foundational), raised-pork-pie (ADVANCED, hot water crust + jelly), coffee macarons (ADVANCED, Italian meringue), Gâteau Saint-Honoré (ADVANCED). Baking 462 → 499. See `docs/baking-bulk-011-report.md`.
- Baking bulk-010 (autopilot-queue, 2026-05-18): 40 entries published across 6 sub-categories (pastries ×12, pies ×8, bread ×7, biscuits ×7, cakes ×5, sweets-confectionery ×1). ~5 BEGINNER / ~28 INTERMEDIATE / ~7 ADVANCED. Voice-check fixes: glossaryTooltip termSlug attr bulk-fix (all 40 files — inherited pattern from earlier sessions), 14 files with em-dash pairs (→ comma/semicolon/colon/parenthesis). Prisma client regenerated before upload (shelfLifeDays schema drift). Notable: danish-pastry-plain (foundational laminated base), pastiera-napoletana (ADVANCED, 48h rest, grano cotto), borodinsky-rye (ADVANCED, 60% dark rye, rye sourdough starter), macarons-pistachio (ADVANCED). Baking 422 → 462. See `docs/baking-bulk-010-report.md`.
- Baking bulk-009 (autopilot-queue, 2026-05-18): 40 entries published across 4 sub-categories (bread ×15, cakes ×10, biscuits ×10, scones ×5). ~37 CREATED + ~3 UPDATED. ~20 BEGINNER / ~18 INTERMEDIATE / 2 ADVANCED. Voice-check fixes: 17 files with em-dash pairs (14 paired-em-dash + 3 two-sentence-same-para patterns → parentheses / colon / semicolon / full stop). Dominant failure location: intro paragraph where glossary tooltip mark splits text nodes. Baking 382 → 422. See `docs/baking-bulk-009-report.md`.
- Baking bulk-008 (autopilot-queue, 2026-05-18): 40 entries published across 6 sub-categories (sweets-confectionery ×10, cake-decorating ×8, pies ×8, biscuits ×6, bread ×5, cakes ×3). 39 CREATED + 1 UPDATED. ~10 BEGINNER / ~24 INTERMEDIATE / 6 ADVANCED. Voice-check fixes: 3 files with em-dash pairs (fondant-modelling-figures, snickerdoodles, viennese-whirls → parentheses). All hot-sugar entries include warning infoPanel with burn protocol. Cake-decorating entries all TECHNIQUE + foundational. Glossary terms added: modelling-paste, ribbon-stage, hard-crack-stage, soft-ball-stage, italian-meringue, crumb-coat, royal-icing, ganache, sugarpaste, tempering, beurre-noisette, blind-baking, pasta-frolla, rough-puff-pastry, tangzhong. Baking 384 → 423. See `docs/baking-bulk-008-report.md`.
- Baking bulk-007 (autopilot-queue, 2026-05-18): 40 entries published across 5 sub-categories (cakes ×16, pies ×8, biscuits ×8, bread ×7, pastries ×1). 36 CREATED + 4 UPDATED. 20 BEGINNER / 19 INTERMEDIATE / 1 ADVANCED. Voice-check fix: 1 file (pane-di-casa — banned "honest" + "genuinely"). Glossary terms added: biga, twaróg, alkaline-wash, bulk-ferment, flax-egg. Notable: polish-sernik, sourdough-country-loaf (updated), ciabatta-biga, vegan-cashew-cheesecake, lardy-cake (laminationFolds ×3). Baking 348 → 384. See `docs/baking-bulk-007-report.md`.
- Baking bulk-006 (autopilot-queue, 2026-05-18): 40 entries published across 6 sub-categories (cakes ×19, bread ×7, biscuits ×6, pies ×3, pastries ×3, scones ×2). Approx 20 BEGINNER / 18 INTERMEDIATE / 2 ADVANCED. Fixes: `glossaryTooltip` `slug`→`termSlug` attr bulk fix (all 40), BOM stripped after PowerShell rewrite, 8 malformed content-array paragraphs repaired (JSON-invalid), em-dash pairs converted to parentheses / colons (22 files). Baking 308 → 348. See `docs/baking-bulk-006-report.md`.
- Mindset bulk-019 (autopilot-queue, 2026-05-20): 50 entries PUBLISHED (47 CREATED, 3 UPDATED). Multi-category gap-fill across 10 life categories by gap-to-target weight: HOME ×5, AGEING ×5, BODY ×5, SPIRITUALITY ×5, MOTHERHOOD ×5, GRIEF ×5, TIME ×5, HEALTH ×5, RELATIONSHIPS ×5, JOY ×5. Practice mix: TAPPING ×10, READING ×10, AFFIRMATION ×10, JOURNAL_PROMPT ×10, RITUAL ×5, ACTIVITY ×3, ENERGY_STATEMENT ×2. Voice-check fixes: banned phrase "genuinely" (4 files — matrescence-the-identity-rewrite, play-in-adulthood-reading, ten-minutes-of-play-today, what-is-my-health-anxiety-protecting-journal), "honest" body prose (matrescence — "accurate account"), medical watchword "treats" (the-invisible-mid-life-woman-myth-and-reality — changed to "frames"), negation pattern "not just X, but Y" in excerpt field (what-did-i-lose-beyond-them-journal — rewritten as direct statement). Warnings accepted: "Anchor" section heading brand false positive (rituals), "fall" americanism (2 files, metaphorical), tricolon (4 reading entries). 0 upload failures. Mindset 724 → 774. See docs/mindset-bulk-019-report.md.

- Mindset bulk-018 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED (all CREATED). Multi-category gap-fill across 10 highest-gap life categories (HOME, AGEING, TIME, SPIRITUALITY, GRIEF, MOTHERHOOD, HEALTH, BODY, RELATIONSHIPS, JOY). Practice mix: TAPPING ×10, READING ×7, JOURNAL_PROMPT ×7, AFFIRMATION ×6, RITUAL ×3, MEDITATION ×1, VISUALISATION ×1, ACTIVITY ×1. Voice-check fixes: em-dashes (all new files), banned phrases "honest/honestly" (4 files). Upload fix: `pnpm run ... --` passes literal `--` to script — use `pnpm exec tsx` directly. Prisma client regenerated: HOME was added to PracticeTarget schema but client not yet regenerated (2 files needed fix). Mindset 684 → 724. See `docs/mindset-bulk-018-report.md`.
- Mindset bulk-017 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED (all CREATED). MONEY stuck-on sections 8–10 (Receiving unearned money ×6, Investments ×6, Other women's success ×6) + MONEY Journal ceremonies weeks 8–10 + 12 (×4) + beginner intros and entry points (×6) + long-form framework readings (×12). Practice mix: READING ×17, RITUAL ×5, TAPPING ×4, ENERGY_STATEMENT ×4, JOURNAL_PROMPT ×4, AFFIRMATION ×3, VISUALISATION ×2, ACTIVITY ×1. Voice-check fixes: em-dash pairs (15 files), banned phrase "genuinely" (3 files), literal currency values (1 file), negation-pattern (1 file), "honestly" (1 file). 17 files fixed, 0 upload failures. Pipeline bug caught and documented: `sourceType: "NEW"` is not a valid Prisma enum — 32 files updated to SYNTHESISED before re-upload. Mindset 644 → 684. See `docs/mindset-bulk-017-report.md`.
- Mindset bulk-016 (autopilot-queue, 2026-05-19): 41 entries PUBLISHED (all CREATED). MONEY stuck-on sections 3–7 (Money+ageing-parents ×6, Pricing ×6, Asking-for-raises ×6, Judgement-for-wealth ×5, Spouse-disagreements ×6). Practice mix: TAPPING x7, ENERGY_STATEMENT x7, AFFIRMATION x7, JOURNAL_PROMPT x7, VISUALISATION x5, ACTIVITY x4, READING x4. Voice-check fixes: em-dash pairs (14 files), banned phrases "genuinely" (7 files), "honest" (4 files), negation-pattern (1 file). 19 files fixed, 0 upload failures. Mindset 603 → 644. See `docs/mindset-bulk-016-report.md`.
- Mindset bulk-015 (autopilot-queue, 2026-05-19): 43 entries PUBLISHED (all CREATED). MONEY Week 12 complete (Days 79–84: Lock in ease / Daily freedom / Abundant leader / Inspire others / Growth and giving / Anchor forever) + 2 stuck-on sections (Husband earns; I don't feel autonomous ×6, The Lottery/windfall fantasy ×5). Practice mix: TAPPING x7, ENERGY_STATEMENT x7, AFFIRMATION x7, JOURNAL_PROMPT x7, VISUALISATION x8, RITUAL x1, READING x3, READING x2 (stuck-on). Voice-check fixes: em-dash pairs (6 files), negation pattern "not just X, but Y" (2 files — H4 headings from source journal), banned phrases "genuinely"/"honest" (2 files). 8 files fixed, 0 upload failures. Mindset 560 → 603. See `docs/mindset-bulk-015-report.md`.
- Mindset bulk-014 (autopilot-queue, 2026-05-19): 42 entries PUBLISHED (all CREATED). MONEY Week 11 (Days 71–77: Create Generational Wealth Vision) + Day 78 (Week 12 opener: Feel Gratitude for Present Wealth). Practice mix: TAPPING x8, ENERGY_STATEMENT x8, AFFIRMATION x8, JOURNAL_PROMPT x8, VISUALISATION x8, READING x1, RITUAL x1. Unique to this batch: Day 73 includes a READING on inheritance and tax avoidance psychology; Day 77 includes the Week 11 Legacy Alignment Activation ritual. Voice-check fixes: em-dash pairs (4 files — excerpt/body → parentheses), banned "honest" (2 files → "clear"), negation pattern "not just X, but Y" (1 file). Mindset 518 → 560. See `docs/mindset-bulk-014-report.md`.
- Mindset bulk-013 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED (all CREATED). MONEY Days 64–70 (Week 10: Unshakable Money Trust) + MONEY Journal Week 10 Ritual + SLEEP Days 28–30 (programme complete). Practice mix: TAPPING x16, AFFIRMATION x10, JOURNAL_PROMPT x8, ENERGY_STATEMENT x5, RITUAL x1. Voice-check fixes: em-dash appositive pairs (5 files — body intro / heading / ritual step → restructured single-dash or parentheses), negation pattern in excerpt (1 file), negation in affirmation pullQuote caught during drafting (1 file). Warnings accepted: americanism "fall" (book-title false positive in sourceNotes, 12 files). SLEEP source complete — 30-day programme finished; SLEEP backlog now exhausted. Mindset 478 → 518. See `docs/mindset-bulk-013-report.md`.
- Mindset bulk-012 (autopilot-queue, 2026-05-19): 40 entries PUBLISHED (all CREATED). MONEY Days 57–63 (Week 9: Overflow and Circulation) + MONEY Journal Week 9 Ritual + SLEEP Days 25–27. Practice mix: TAPPING x13, JOURNAL_PROMPT x8, AFFIRMATION x7, ENERGY_STATEMENT x5, ACTIVITY x2, RITUAL x2, VISUALISATION x1, EMBODIMENT x1, MEDITATION x1. Voice-check fixes: em-dash appositive pairs (9 files — excerpt/intro-paragraph pattern → parentheses), banned phrases "genuinely"/"honestly" (3 files), medical-claim false positive "treats" (1 file → "pleasures"). Warnings accepted: americanism "fall" (book-title false positive in sourceNotes), tricolon (3 files), brand-trademark "Anchor"/"Kinder" (false positives). Mindset 438 → 478. See `docs/mindset-bulk-012-report.md`.
- Mindset bulk-011 (autopilot-queue, 2026-05-18): 43 entries PUBLISHED (all CREATED). MONEY Days 50–56 (Week 8: Wealth Habits & Organisation) + SLEEP Days 22–24. Practice mix: TAPPING x10, AFFIRMATION x10, JOURNAL_PROMPT x8, ENERGY_STATEMENT x7, ACTIVITY x4, RITUAL x2, VISUALISATION x2. Voice-check fixes (8 files): em-dash pairs (5 new files + 2 legacy), banned phrases "genuinely"/"honest" (3 files). Mindset 395 → 438. See `docs/mindset-bulk-011-report.md`.
- Mindset bulk-010 (autopilot-queue, 2026-05-18): 44 entries PUBLISHED (all CREATED). MONEY Days 43–49 (Week 7: Bold Action, Partnerships, Investments, Timing, Income Celebration) + MONEY Journal Week 7 Ritual + SLEEP Days 20–21. Practice mix: TAPPING x9, ENERGY_STATEMENT x9, AFFIRMATION x9, JOURNAL_PROMPT x7, VISUALISATION x4, ACTIVITY x2, MEDITATION x2, EMBODIMENT x1, RITUAL x1. Voice-check fixes (7 files): em-dash pairs (3 files), price-mention (1), orphaned glossaryTerm (1), banned phrases "genuinely"/"honest" (2 files). Mindset 351 → 395. See `docs/mindset-bulk-010-report.md`.
- Mindset bulk-009 (autopilot-queue, 2026-05-18): 46 entries PUBLISHED (all CREATED). MONEY Days 36–42 (Week 6: Welcome Overflow & Savings) + MONEY Journal Week 6 Overflow Anchoring Ceremony + SLEEP Days 18–19. Practice mix: TAPPING x9, ENERGY_STATEMENT x8, AFFIRMATION x8, VISUALISATION x9, JOURNAL_PROMPT x8, ACTIVITY x1, READING x1, RITUAL x1, MEDITATION x1. Voice-check fixes (9 files, 14 instances): price mentions (3 files), em-dash pairs (7 files), banned phrases "genuinely"/"ultimately" (2 files), tricolon (1 file). Mindset 294 → 340. See `docs/mindset-bulk-009-report.md`.
- Mindset bulk-008 (autopilot-queue, 2026-05-18): 48 entries PUBLISHED (47 CREATED, 1 UPDATED). MONEY Days 29–35 (Week 5 complete) + MONEY Journal Week 5 Ritual + SLEEP Days 16–17. Practice mix: TAPPING x9, ENERGY_STATEMENT x7, AFFIRMATION x8, VISUALISATION x9, JOURNAL_PROMPT x8, RITUAL x1, READING x2, SPELL x1, MEDITATION x1. Fixes (7 files): invalid `HEALING` practiceTarget (→ FORGIVENESS/BODY), banned phrases "honest"/"honestly" (3 files), em-dash pairs (1 file), negation-pattern heading (1 file), tricolon/brand warning (1 file). Mindset 254 → 302. See `docs/mindset-bulk-008-report.md`.
- Mindset bulk-007 (autopilot-queue, 2026-05-18): 46 entries PUBLISHED (all CREATED) across two context windows. MONEY Days 22–28 + SLEEP Day 15. Practice mix: TAPPING x8, ENERGY_STATEMENT x9, AFFIRMATION x6, VISUALISATION x8, JOURNAL_PROMPT x7, RITUAL x2, READING x2, EMBODIMENT x1, MEDITATION x1, ACTIVITY x2. Mindset 208 → 254. Fixes: em-dash pairs (14 files, 18 instances → parentheses/commas), banned phrases "honest"/"honestly" (2 files), medical watchword "treats" (2 files). Anti-tells entry broadened: em-dash pairs now documented as occurring in ALL text fields (body, excerpt, whenToUse), not just provenance paragraphs. See `docs/mindset-bulk-007-report.md`.
- Mindset bulk-006 (autopilot-queue, 2026-05-18): 38 entries PUBLISHED (37 CREATED, 1 UPDATED) across two context windows. MONEY Days 18–21 (Phase 1 close) + SLEEP Days 11–14. Practice mix: TAPPING x8, AFFIRMATION x8, JOURNAL_PROMPT x8, VISUALISATION x7, ENERGY_STATEMENT x5, RITUAL x1, MEDITATION x1. Mindset 170 → 208. Fixes: em-dash pairs (6 files, 7 instances → parentheses), invalid `STRESS` practiceTarget on 9 files (→ `ANXIETY`), banned phrases "honest"/"honestly" (3 files), negation pattern (1 file). See `docs/mindset-bulk-006-report.md`.
- Mindset bulk-005 (autopilot-queue, 2026-05-17): 48 entries PUBLISHED (26 CREATED, 22 UPDATED) across two context windows. MONEY Days 13–17 + SLEEP Days 6–9. Practice mix: TAPPING x9, VISUALISATION x9, JOURNAL_PROMPT x8, AFFIRMATION x7, ENERGY_STATEMENT x5, MEDITATION x4, RITUAL x2, READING x2, SPELL x1, ACTIVITY x1. Mindset 104 → 170. 20 voice-check fixes: em-dash pairs (17 files), banned phrases (4 files), negation in READING prose (1 file). Prisma client regenerated mid-session (knitting schema). See `docs/mindset-bulk-005-report.md`.

**Open / queued**

- Mindset autopilot recovered (2026-05-17): migration applied, archived bulk-001 briefs uploaded as-is, 20 PUBLISHED on first attempt. From bulk-002 onward returns to 50-entry target against `docs/mindset-backlog.md`.
- Mindset bulk-003 (parallel-burner loop, 2026-05-17): 40 PUBLISHED. Days 2–7 of MONEY: A 12-Week Tapping Program + Days 1–2 of SLEEP: A 30-Day Tapping Intensive. Practice mix: TAPPING x8, ENERGY_STATEMENT x6, AFFIRMATION x7, RITUAL x2, JOURNAL_PROMPT x6, VISUALISATION x3, MEDITATION x2, EMBODIMENT x2, ACTIVITY x3, READING x2 (type: READING), SPELL x1. Mindset 24 → 64. 14 voice-check fixes: em-dash pairs (13 × replaced with colon/comma/parenthesis), FIFTEEN_MIN timeBand (→ TWENTY_MIN), ONE_MIN timeBand (→ THREE_MIN), RELAXATION practiceTarget (→ BODY). Report: `docs/mindset-bulk-003-report.md`.
- Mindset bulk-004 (parallel-burner loop, 2026-05-17): 40 PUBLISHED. Days 8–12 of MONEY: A 12-Week Tapping Program + Days 3–5 of SLEEP: A 30-Day Tapping Intensive. Practice mix: TAPPING x8, ENERGY_STATEMENT x6, AFFIRMATION x7, VISUALISATION x7, MEDITATION x3, JOURNAL_PROMPT x7, RITUAL x1, ACTIVITY x1. Mindset 64 → 104. 6 voice-check fixes: em-dash pairs (2 files), banned phrases "genuinely" (3 files, 4 instances → "truly"), "honestly" (1 file → "plainly"), "at the end of the day" (1 file). Report: `docs/mindset-bulk-004-report.md`.
- Herbal medicine pipeline scaffolded (2026-05-17): `phase_herbal_pipeline_scaffold` migration adds `Herb` / `Condition` / `HerbConditionUse` master tables + Tutorial herbal columns + `REMEDY` / `HERB_PROFILE` TutorialType values. `docs/herbal-author.md` + `docs/herbal-anti-tells.md` authored. 5 DRAFT anchor briefs in `docs/herbal-anchor-briefs/` (2× HERB_PROFILE, 2× REMEDY, 1× READING) — see `docs/herbal-anchor-report.md`. Awaiting Rebecca review before migration applies and anchors upload.
- Sewing pipeline scaffolded (2026-05-17): `phase_sewing_pipeline_001` migration adds `Fabric` (~30 starter rows) + `SewingNotion` (~30 starter rows) master tables + Tutorial sewing columns (craftType / projectShape / requiredFabricTypes / requiredNotions / sewingMethod / fabricYardageMetres / finishedDimensionsCm / bodyMeasurementsRequired) + `PATTERN` TutorialType value. `seed-sewing-taxonomy.ts` seeds 15 sub-categories under existing Sewing Category and flips `pipelineStatus = READY`. Scope locked to rectangles / gathered rectangles / panel construction / simple circles / from-measurements / unconstructed — **no fitted-garment patterns at launch** (require pattern-piece pipeline). `docs/sewing-author.md` v1 + `docs/sewing-anti-tells.md` (24 entries) + 5 DRAFT anchor briefs in `docs/sewing-anchor-briefs/` (2× TECHNIQUE — French seam + gathering, 3× PATTERN — gardener's apron + drawstring tote + envelope cushion). See `docs/sewing-anchor-report.md`. Autopilot picks Sewing up on next round-robin fire once migration applies.
- Crochet pipeline scaffolded (2026-05-17): `phase_crochet_pipeline_scaffold` migration adds `Stitch` (craft-keyed, shared with knitting) / `YarnWeight` / `CrochetHook` master tables + Tutorial crochet columns (`primaryYarnWeightId`, `primaryHookId`, `gaugeText`, `finishedSizeText`, `terminologyConvention`, `chartDefinition`, `craftStitchSlugs`, `craftTechniqueTags`) + `STITCH` TutorialType value (PATTERN was already added by the sewing scaffold — crochet patterns reuse it). Shared SVG chart renderer at [apps/web/src/lib/craft-charts/svg-chart.tsx](apps/web/src/lib/craft-charts/svg-chart.tsx) — generic for crochet + knitting; round (in-the-round) and flat (row-by-row) layouts; symbol library in [chart-symbols.ts](apps/web/src/lib/craft-charts/chart-symbols.ts) seeded with the full crochet set plus a starter knitting set. `craftChart` TipTap block wired into the public renderer. `docs/crochet-author.md` + `docs/crochet-anti-tells.md` authored. 4 DRAFT anchor briefs in `docs/crochet-anchor-briefs/` (1× STITCH treble+magic-ring, 3× PATTERN — granny square, simple dishcloth, granny hexagon; 2 with charts) — see `docs/crochet-anchor-report.md`. Awaiting Rebecca review before migration applies and anchors upload.
- Knitting pipeline scaffolded (2026-05-17): `phase_knitting_pipeline_001` migration is intentionally small — it adds only `KnittingNeedle` (~20 starter rows, mm-keyed; same shape as crochet's `CrochetHook`) and a `Tutorial.primaryNeedleId` FK. The original brief proposed a parallel `KnitStitch` table + a knitting-only chart renderer + a divergent `YarnWeight`; review against crochet's in-flight architecture chose harmonisation instead. Knitting extends crochet's craft-keyed `Stitch` master with 25 `knitting-*` rows (knit, purl, k2tog, ssk, yo, m1, cables c4f/c4b/c6f/c6b, stocking / garter / rib / seed / basket-weave / brioche / Fair Isle / intarsia / slip / k1tbl / w&t / three-needle bind-off), reuses crochet's `YarnWeight` (UK slugs `dk` / `aran` / `chunky` etc), and renders charts through crochet's `ChartDefinition` shape + the shared `<SvgChart>` component via the existing `craftChart` TipTap block. New knitting glyphs added to `chart-symbols.ts`: `make-1`, `slip-stitch`, `knit-tbl`, `cable-4-front`, `cable-4-back`. Knitting metadata block on `TutorialUploadInput` writes through to the same Tutorial columns as crochet (`primaryYarnWeightId`, `gaugeText`, `finishedSizeText`, `terminologyConvention`, `chartDefinition`, `craftStitchSlugs`, `craftTechniqueTags`) plus the per-craft `primaryNeedleId`. `docs/knitting-author.md` + `docs/knitting-anti-tells.md` authored (shorter than the herbal / sewing equivalents because the chart system + glossary of techniques reference the crochet docs). 5 DRAFT anchor briefs in `docs/knitting-anchor-briefs/` (2× STITCH — knit+purl, cable basics with two charts; 3× PATTERN — garter scarf, ribbed hat in-the-round, cabled dishcloth with chart) with paired drafts in `packages/db/scripts/anchor-tutorials/knitting/`. `seed-knitting-needles.ts` + `seed-knitting-taxonomy.ts` (9 sub-categories: stitches, foundations, scarves-shawls, hats, dishcloths-homewares, baby, blankets, socks, garments-placeholder). Knitting taxonomy seed leaves `Category.pipelineStatus` untouched — Rebecca flips READY after reviewing the anchors. Original divergent KnitStitch / chart-renderer / YarnWeight work preserved on the `save-knitting-pipeline-001` branch as reference. Awaiting Rebecca review before migration applies and anchors upload.
- Wood & natural craft pipeline ready (2026-05-17): pipeline-setup session lands the authoring prompt + master Tool registry contribution + taxonomy + pipeline flip so the round-robin autopilot picks Wood & natural craft up on its next fire. No new migration, no new master table, no chart renderer (this category uses step-photos / static-SVG illustrations rather than charted patterns). [docs/wood-natural-craft-author.md](docs/wood-natural-craft-author.md) v1 — late-Victorian / Edwardian PD canon (Cassell's *Cyclopaedia of Mechanics*, Beeton, Newey & Drage, early-twentieth-century carpentry textbooks; Underhill referenced as authority but never reproduced); strict hand-tool register (no power tools as primary method beyond a cordless drill for pilot holes); explicit green-wood vs seasoned-wood `woodState` declaration on every PATTERN; standard cuts vocabulary (push / thumb-pivot / pull / stop / chip / slicing) + standard grips vocabulary used across every cutting tutorial; safety preamble dropped verbatim into every cutting tutorial body inside an `infoPanel` block (grip / cut direction / sharpening / first aid / workspace) plus a pyrography-specific safety variant (ventilation / allowed-woods list / cooling stand / fume sensitivity); species recommended in body prose only (no species master table), cross-linked to Garden coppicing + foraging tutorials where they exist; finishes registered as Tool rows in the master registry with food-safe vs non-food split and honest cure-time prose on every entry. Master `Tool` registry extended with the biggest single batch to date — roughly 85 woodcraft tools + finishes + abrasives. Knives: sloyd, hook (small/medium/large), marking, twca cam, detail, chip-carving. Gouges: No. 3 / 5 / 7 / 9 / 11 sweeps with 6/12/20 mm size variants where useful, spoon gouge, fishtail, V-tools 60°/90°. Chisels: firmer 12/25 mm, bevel-edge 6/12/25 mm, mortise 9 mm, skew 12 mm. Axes: carving (Hultafors / Gränsfors patterns), splitting, broad, side, small hatchet. Drawknives + scorps + spokeshaves: straight + curved drawknife, inshave / scorp, flat + round-bottom spokeshave, travisher. Green-wood specifics: froe, beetle, splitting wedges, shaving horse, pole lathe, side-axe block, billhook in Yorkshire / Devon / Kent patterns. Measuring + marking: combination square, sliding bevel, marking gauge, dividers, calipers. Sharpening: Japanese waterstones 1000 / 4000 / 8000, India combination oilstone, leather strop, slipstone set. Pyrography: solid-tip burner, nichrome-wire burner, four interchangeable tips (shading / writing / calligraphy / ball stylus), cooling stand. Basketry: bodkin, rapping iron, secateurs, soaking trough (sharp knife covered by existing `craft-scissors`). Finishes: raw linseed oil, walnut oil, pure tung oil, board butter, boiled linseed oil (BLO), Danish oil, shellac, polyurethane — food-safe vs non-food clearly tagged, BLO carries the rag-combustion warning. Abrasives: sandpaper 80 / 120 / 180 / 240 / 320 / 400 / 600 grit, card scraper, steel wool 000 + 0000. `seed-wood-natural-craft-taxonomy.ts` seeds the 6 sub-categories (`whittling`, `spoon-carving`, `green-woodwork`, `seasoned-wood`, `basketry-willow`, `pyrography`) under existing Wood & natural craft Category. `flip-wood-natural-craft-ready.ts` flips `pipelineStatus = READY`. Autopilot picks Wood & natural craft up on next round-robin fire; sub-category weighting is whittling + spoon-carving ~30%, green-woodwork ~20%, basketry + willow ~20%, seasoned-wood ~15%, pyrography ~10%, other ~5% across a fortnight.
- Needlework pipeline ready (2026-05-17): pipeline-setup session lands the authoring prompt + anti-tells + cross-stitch renderer + master-table contributions + taxonomy + pipeline flip so the round-robin autopilot picks Needlework up on its next fire. No new migration — the existing `Fabric` / `SewingNotion` / `Tool` / `Stitch` masters carry needlework rows; Tutorial-level metadata piggybacks on the sewing block via `sewing.craftType = "needlework"` for the first pass. Cross-stitch chart renderer at [apps/web/src/lib/chart-renderers/cross-stitch.ts](apps/web/src/lib/chart-renderers/cross-stitch.ts) — coloured grid, bold rules every 10 stitches, floss-key legend with DMC + Anchor cross-references and per-colour accessibility symbol; smoke-test preview at `/admin/dev/cross-stitch-preview`. Tatting + lacemaking pattern renderers deferred (notation-based; inline prose for now). [docs/needlework-author.md](docs/needlework-author.md) v1 + [docs/needlework-anti-tells.md](docs/needlework-anti-tells.md) authored — PD-only canon (Weldon's, Beeton's, de Dillmont, Priscilla series), no modern designer charts, dual DMC + Anchor floss-key references, 14-count Aida as default beginner cloth. Master tables extended: Fabric adds Aida 11/14/16/18, evenweave 25/28/32, embroidery linen 28/32/36/40, needlepoint canvas mono 13/18; SewingNotion adds DMC stranded cotton, Anchor stranded cotton, perle 5/8/12, tatting threads 20/40/80, bobbin-lace linen thread; Tool adds embroidery hoops 4"/5"/6"/8"/10" + scroll frame, tapestry needles 18/20/22/24/26/28, embroidery needles 5/7/10, tatting shuttle, tatting needles 5/7, lace bobbins + pillow + pricker, needle minder, embroidery scissors, magnifier loupe, daylight task lamp. `seed-needlework-taxonomy.ts` seeds the 4 sub-categories (`cross-stitch`, `needlepoint`, `tatting`, `lacemaking`) under existing Needlework Category. `flip-needlework-ready.ts` flips `pipelineStatus = READY`. Autopilot picks Needlework up on next round-robin fire; weighting is cross-stitch ~70%, needlepoint ~15%, tatting + lacemaking ~15% combined across a fortnight.
- Pottery & ceramics pipeline ready (2026-05-17): `phase_pottery_pipeline_001` migration adds `ClayBody` (12 starter rows — 3 no-equipment air-dry / polymer / paper-clay, 9 kiln-fired stoneware / earthenware / porcelain / raku) + `CraftMaterial` (~40 starter rows — glaze raw materials, colourants, slips + engobes, pre-mixed glazes, kiln furniture — with the `trainedEnvironmentOnly` flag set true on raw silica / kaolin / feldspar / heavy-metal oxides and false on frits + pre-mixed glazes + iron / rutile colourants) master tables + Tutorial pottery columns (`requiresKiln`, `requiresWheel`, `requiredClayBodies`, `requiredCraftMaterials`). 6 sub-categories under `pottery-ceramics` (hand-building-no-equipment, surface-decoration, throwing, glazing, firing, clay-fundamentals); `seed-pottery-ceramics-taxonomy.ts` flips Category.pipelineStatus → READY so the round-robin autopilot picks Pottery up on next fire. Scope locked to a 70 / 30 split: ~70% no-equipment-track tutorials (paper-clay / polymer / air-dry pinch + coil + slab + drape + sprig work), ~30% wheel + kiln track (throwing + glaze chemistry + firing schedules). The authoring prompt forbids no-equipment-track tutorials from referencing any `CraftMaterial` row with `trainedEnvironmentOnly = true` (silica dust, heavy-metal oxides), and the upload script will reject one that does — kiln-less home readers can't be steered into raw-silica-dust territory by accident. **No lead-glaze recipes in any form**, no industrial slip-casting, no gas-kiln-building, no glass / lampwork. `docs/pottery-ceramics-author.md` v1 authored. Master `Tool` table extended with ~45 pottery-specific entries (wooden + metal ribs, loop + needle tools, fettling knife, sponge + chamois, calipers, wire cutter, slab roller, drape + sprig moulds, potter's wheel — electric + kick, throwing sticks, banding wheel, foot-ring chuck, sgraffito tools, slip trailer, glaze brushes, glaze tongs / bucket / sieve / hydrometer, electric kiln — small + medium, pyrometric cones + pyrometer + thermocouple, kiln shelves + posts, N95 + P100 + studio apron + wet-cleanup kit + Class A fire extinguisher). Public list page + tutorial detail page badge + filter the kiln / wheel flags so kiln-less readers can hide kiln-required tutorials with one click.
- Paper & word pipeline ready (2026-05-17): pipeline-setup batch lands the authoring prompt + two SVG renderers + the 9 sub-category taxonomy + master `Tool`-table extension (papers, inks, adhesives, marbling materials, bookbinding threads, origami papers, cutting tools, folding tools, calligraphy nibs + pen holders, bookbinding tools, marbling tools, papermaking tools — ~70 new rows). No schema migration — Paper & word reuses the existing `Tutorial` columns + the `Tool` table; sub-categories land via `seed-paper-word-taxonomy.ts`. Two new chart renderers at [apps/web/src/lib/chart-renderers/](apps/web/src/lib/chart-renderers/): `calligraphy-exemplar.tsx` (per-glyph outline + numbered ductus + guide-lines + nib-angle chip) and `origami-fold-basic.tsx` (v1 basic-fold renderer — mountain/valley folds + straight/curved arrows + stacked step diagrams). Inline `calligraphyExemplar` + `origamiFoldDiagram` TipTap nodes wired into the public renderer; admin previews at `/admin/dev/calligraphy-preview` and `/admin/dev/origami-fold-preview`. [docs/paper-word-author.md](docs/paper-word-author.md) v1 covers 9 sub-categories (bookbinding ~25%, calligraphy ~20%, papermaking ~15%, marbling ~10%, journalling-craft ~10%, papercutting ~5%, zines ~5%, scrapbooking ~5%, origami ~5%); enforces scope boundary against Mindset (no journal-prompt content) and creative-writing categories. Origami v1 capped at ~30 PD-canonical models that use only basic folds; advanced manoeuvres deferred (see § Deferred work). `flip-paper-word-ready.ts` flips `Category.pipelineStatus = READY` so the round-robin autopilot picks Paper & word up on the next fire.
- Pipeline cleanup — seed/flip split uniformity (2026-05-17): 4 legacy taxonomy seeds patched to remove the `pipelineStatus = READY` write that was baked in at the wrong layer — `seed-garden-taxonomy.ts`, `seed-sewing-taxonomy.ts`, `seed-paper-word-taxonomy.ts`, `seed-pottery-ceramics-taxonomy.ts` now own sub-category upserts only, matching the clean split already established in `seed-needlework-taxonomy.ts` and `seed-wood-natural-craft-taxonomy.ts`. 3 missing flip scripts backfilled: `flip-garden-ready.ts`, `flip-herbal-medicine-ready.ts`, `flip-sewing-ready.ts`. Crochet taxonomy seed + flip backfilled: `seed-crochet-taxonomy.ts` (5 sub-categories: `stitches`, `motifs`, `homewares`, `garments`, `foundations`) and `flip-crochet-ready.ts`. Crochet seed ran against prod — created=5 unchanged=0. The test-first seed/flip split is now uniform across all 17 categories; no category can be auto-flipped to READY without a deliberate separate commit.
- Fibre arts pipeline ready (2026-05-17): pipeline-setup batch lands the authoring prompt + two SVG renderers + 6 sub-category taxonomy + master `Tool` and `CraftMaterial` extensions + pipeline flip so the round-robin autopilot picks Fibre arts up on the next fire. No schema migration — Fibre arts reuses the existing `Tutorial.requiredCraftMaterials` String[] (added by the pottery scaffold), the existing `Tool` table, and the existing `CraftMaterial` table; the `CraftMaterialCraft` union widens to include `fibre-arts` alongside `pottery / jewellery / paper / wood-finishing`. Honours the new seed/flip split — `seed-fibre-arts-taxonomy.ts` owns the 6 sub-category upserts only, `flip-fibre-arts-ready.ts` flips `pipelineStatus = READY` in a separate commit-able step. Two new chart renderers at [apps/web/src/lib/chart-renderers/](apps/web/src/lib/chart-renderers/): `weaving-draft.tsx` (standard four-block draft layout — threading × shafts, shafts × treadles tie-up, treadles × picks treadling, server-computed drawdown; relabels columns per loomType — `frame` / `rigid-heddle` / `four-shaft` / `tapestry` / `inkle` / `card`) and `macrame-knot.tsx` (cord-path diagrams for the ten fundamental knots — square, alternating square, half-hitch L+R, double-half-hitch L+R, lark's head, gathering, overhand, figure-8; per-knot final-state + multi-step build-up modes). Inline `weavingDraft` + `macrameKnot` TipTap nodes wired into the public renderer; admin previews at `/admin/dev/weaving-draft-preview` and `/admin/dev/macrame-knot-preview`. [docs/fibre-arts-author.md](docs/fibre-arts-author.md) v1 covers 6 sub-categories (felting ~30%, spinning ~20%, weaving ~20%, natural-dyeing ~15%, macramé ~10%, rug-making ~5%); **explicitly excludes basketry** (which belongs to `wood-natural-craft`); enforces the mordant-safety preamble verbatim in every dyeing entry + the Garden + Herbal cross-link rule (every natural-dye tutorial links the Garden dye-plant source tutorial and the Herbal mordant-safety reference); spells out wastewater disposal on every iron / copper dyeing entry (foul drain only at home quantity; never storm drain or stream). Master `Tool` registry extended with ~55 fibre-arts tools — drop spindles (top + bottom whorl), supported spindle, spinning wheels (Saxony / castle / e-spinner), niddy-noddy + swift + ball winder, hand cards + drum carder + blending board + hackle + wool combs, frame + rigid-heddle + four-shaft + tapestry + inkle looms + tablet-weaving cards, boat / stick / end-feed / tapestry shuttles + reed + heddles + raddle + warping board + tapestry comb, felting needles (36 / 38 / 40) + felting mat + bamboo rolling mat + olive-oil soap + felting net + palm fitter, dye-pots (stainless + enamelled, dedicated) + dye thermometer + pH strips + long rubber gloves + dyeing apron + mordant jar + indigo vat, macramé board + T-pins + clipboard + cord measuring tape + fringe comb, rug hook + latch hook + punch needle + rug frame + monks-cloth + rug canvas + rag-rug strip cutter + locker hook + rug binding tape. Master `CraftMaterial` registry extended with ~32 fibre-arts entries across 8 fibre-arts-specific categories — wool roving by breed (Merino / Romney / BFL / Shetland / Corriedale), pre-felt batt + mohair locks + alpaca top + silk hankies, linen + cotton weaving warps, the dye-plant list (weld / madder / woad / indigo / walnut hulls / onion skins / oak galls / logwood — each cross-links the Garden Plant table), mordants (alum potash + alum acetate trained-environment-OK; **iron sulphate + copper sulphate trained-environment-only** with full hazardNotes covering long-glove + ventilation + wastewater rules), cream of tartar + soda ash, olive-oil soap + carrageenan (felting-aid), macramé cords (cotton 3 + 5 mm, jute, hemp, linen), rug yarns (wool strips + latch-hook bundles + hooking wool + rag-strips). Weighting is felting heaviest (~30%) on a fortnight then spinning + weaving (~20% each) then natural-dyeing (~15%) then macramé (~10%) and rug-making (~5%).
- Pre-launch debt: ICO + DMCA + email aliases + postal address (Rebecca-action), analytics consent wiring, credential rotation. See `memory/project_pre_launch_checklist.md` for the canonical list.
- Follow-up queue (small fixes batched for a future session): `memory/project_followup_queue.md`.

---

## Deferred work

Single list of capability work that's been deliberately deferred behind
the current pipeline-setup wave. Each entry names what's deferred, why,
and what unblocks expanding the affected catalogue.

- **Advanced origami fold renderer — Yoshizawa-Randlett notation.**
  v1 origami renderer at [apps/web/src/lib/chart-renderers/origami-fold-basic.tsx](apps/web/src/lib/chart-renderers/origami-fold-basic.tsx)
  supports mountain + valley folds and straight + curved arrows only. The
  advanced renderer needs: inside reverse fold, outside reverse fold,
  petal fold, squash fold, sink, swivel, and 3D-collapse manoeuvres
  (the full Yoshizawa-Randlett diagram vocabulary). **Schedule:** after
  all 16 category pipelines are set up. Once landed, the Paper & word
  origami catalogue expands beyond the v1 ~30 PD-canonical models into
  the wider pre-1928 published-fold corpus.

---

## Pre-launch checklist

Single source of truth lives in `memory/project_pre_launch_checklist.md`. The summary of items still owed:

- **Rebecca-action:** ICO registration, DMCA designated agent, email aliases (privacy@/dpo@/legal@), postal address decision, Google Play account, credential rotation, **flip homemade repo back to private** (was flipped public 2026-05-18 for unlimited Actions minutes during content build — `gh repo edit becspage-arch/homemade --visibility private --accept-visibility-change-consequences` before the splash gate comes down).
- **SEO / Search Console (Rebecca-action, added 2026-05-19):** claim Google Search Console + Bing Webmaster property for `homemade.education`, set `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` env vars in ECS, submit `/sitemap.xml` to both, claim `@homemade_education` on X/Twitter, run Rich Results Test against one URL of each schema type post splash-gate flip.
- **Code-action remaining:** analytics consent wiring (`apps/web/src/instrumentation-client.ts` + `apps/web/src/components/posthog-provider.tsx`), splash gate flip, signup allowlist flip, `TODO(legal)` sweep.
- **Per-session rule:** every code-pushing worker runs the deploy-verify block + `/healthz` smoke (`feedback_deploy_verification.md`).

Tick items off in the memory file. The "Done since this checklist was created" history lives there too.

---

## Phase 8 — Content pipeline build queue

The pipeline needed to author and publish ~2,000 recipes plus ~500–700 foundational techniques. Steps run in dependency order; each step blocks the next.

Image generation is **deferred** through this whole phase. Bodies are authored without heroes. Heroes batch-generate from budget allocated at pre-launch, attached to existing Tutorial rows in one pass.

### Step 1 — Page-design review and lock

**Goal.** Rebecca walks through the two existing draft tutorials (béchamel + strawberry jam) in admin preview, desktop and mobile. Lists what's missing or wrong. The page design then locks.

**Deliverable.** `docs/page-design.md` — the recipe page and the technique page, every component, every field, every interaction. Header (title, hero, info bar with time / servings / difficulty / dietary tags / freezable badge / batchable badge). Body sections. Sidebar (saved recipes, sticky TOC, project companion). Footer (sources, related, made-by-others). Mobile rules. Print rules. Must support: ingredient scaling, freezable / batchable / make-ahead notes, dietary tags, prep / cook / total time, servings, cuisine and meal-type filters, save-for-later, the eight existing custom blocks, structured ingredients.

**Out.** No code. No schema. Spec only.

### Step 2 — Schema migration ✅ landed

**Goal.** Apply the recipe-side schema as a single Prisma migration.

**Deliverable.** Shipped in migration `20260613000000_phase_8_step_2_recipe_schema`. Adds:

- `TutorialType` enum (`RECIPE` | `TECHNIQUE`) + `Tutorial.type` discriminator. Existing rows default to `TECHNIQUE`; strawberry jam backfilled to `RECIPE`, béchamel stays `TECHNIQUE`.
- Recipe metadata on `Tutorial`: `servings`, `yieldDescription`, `prepMinutes`, `cookMinutes`, `restingMinutes`, `chillingMinutes`, `totalMinutes`, `scalable`, `freezable`, `freezeNotes`, `batchable`, `batchNotes`, `makeAheadNotes`, `dietaryFlags[]`, `cuisine`, `mealType`, `mood[]`, `temperatureCelsius`, `temperatureNote`, `nutritionalInfoPerServing`, `foundational`, `leftoverTutorialId`. All field-up-front per `feedback_schema_all_fields_upfront.md`.
- New tables: `Ingredient` (slug, name, category, defaultUnit, dietaryFlags, commonSubstitutes, aliases, beginnerNote, isStaple, isAllergen + allergenType, seasonality, shelfLifeDays, storage, nutritionalInfoPer100g), `Tool` (slug, name, category, aliases, isPurchasable, typicalPriceGbp, notes), `RecipeIngredient` (cascade-delete on Tutorial, restrict-delete on Ingredient, position, prepNote, isOptional, groupLabel, substitutionAllowed), `RecipeTool` (cascade / restrict pattern, isOptional, notes, position).
- Indexes on `(type, …)` for the public-page filters and `(slug)` / `(category)` on master tables.

Additive only — no column drops, no breaking renames. Existing tutorials still render unchanged.

**Out.** UI changes (Step 3). Master-table seeding (Steps 4 + 5). Bulk re-categorisation of existing tutorials.

### Step 3 — Structured ingredients TipTap block ✅ landed

**Goal.** New `ingredientsList` block with scalable rows referencing master Ingredient rows.

**Deliverable.** Shipped together with Step 2:

- Admin TipTap extension at `apps/web/src/components/admin/editor/extensions/ingredients-list.tsx`. Type-ahead row picker hits `searchIngredients` (admin-only server action); inline "+ create new ingredient" modal calls `createIngredientFromEditor` and adopts the new row into the editing row without leaving the page.
- Toolbar "ingredients" insert button seeds new blocks with the recipe's `defaultServings` from the form state.
- Public client renderer at `apps/web/src/components/public/tutorial-content/blocks/ingredients-list.tsx`. Renders `1× / 2× / 4× / Custom servings` chips, recomputes amounts on change, hides the scaler with a tooltip when `Tutorial.scalable === false`. Each row links to a future `/ingredients/{slug}` page.
- Tutorial-save sync: `apps/web/src/lib/recipe-ingredients-sync.ts` walks the body JSON on every `createTutorial` / `updateTutorial` / creator-side equivalent and rebuilds the `RecipeIngredient` join rows. Free-text rows (no ingredientId) stay in the editorial body but don't mirror to the join table.
- Admin form gains a Type selector + a full Recipe-metadata fieldset (servings, yield, prep/cook/resting/chilling, scalable, freezable + notes, batchable + notes, make-ahead notes, dietary flags, cuisine, meal type, mood, temperature + note, leftover tutorial selector). Technique tutorials see a `foundational` toggle instead.
- Public tutorial page surfaces the recipe metadata in the info bar + a dietary / freezable / batchable / make-ahead badge row when `Tutorial.type === RECIPE`.
- New analytics events documented in `docs/analytics-taxonomy.md` and wired: `ingredients_scaled` (client, on scale chip click) and `ingredient_created_inline` (server, on the inline-create modal). `tutorial_viewed` now also carries `tutorialType`, `cuisine`, `mealType`.

**Out.** Method-narrative `{{tokenId}}` substitution (Step 8). `equipmentList` block — deferred to a future small session per the prompt's explicit decision. Master ingredient / tool seeding (Steps 4 + 5).

### Step 4 — Master ingredient list ✅ landed 2026-05-13

**Goal.** Draft `docs/ingredient-master.md` and seed the Ingredient table.

**Landed.** 547 ingredient rows across all 18 categories live in
`packages/db/scripts/data/ingredients.ts` — that file is the source of
truth, the seed script imports it directly. Shape per entry: slug, name,
optional pluralName, category, defaultUnit, dietaryFlags,
commonSubstitutes (cross-referenced slugs), aliases (US / regional /
brand-shorthand), notes (UK-US naming gotchas + prep tips), isStaple,
isAllergen + allergenType (UK 14), seasonality, shelfLifeDays, storage.
British conventions throughout; US names live in aliases. Halal and
kosher flags intentionally not applied at ingredient level — those
depend on slaughter / certification and get set on the recipe by the
author.

`packages/db/scripts/seed-ingredients.ts` runs idempotent upsert with
up-front validation (slug shape, category / unit / dietary / allergen /
storage enums, substitute-slug existence) and a `--dry-run` flag that
exits without touching the DB. `generate-ingredient-master-md.ts`
regenerates `docs/ingredient-master.md` from the TS source — markdown
view is grouped by category, sorted alphabetically.

Seeded into prod 2026-05-13: 547 created, 0 updated, 0 unchanged.

**Out.** Tools (step 5). Browsing UI.

### Step 5 — Master tools list ✅ landed 2026-05-13

**Goal.** Draft `docs/tools-master.md` and seed the Tool table.

**Landed.** 179 tool rows across all 17 categories in
`packages/db/scripts/data/tools.ts`. Shape per entry: slug, name,
optional pluralName, category, aliases (brand-shorthand: KitchenAid →
stand mixer, Le Creuset → casserole, Vitamix → high-powered blender),
isPurchasable (false only for fixtures — oven, hob, sink),
typicalPriceGbp (in pennies, skipped when uncertain), notes.

`packages/db/scripts/seed-tools.ts` mirrors the ingredients seed —
validation up-front, `--dry-run` flag, idempotent upsert.
`generate-tools-master-md.ts` regenerates `docs/tools-master.md` from
the TS source.

Seeded into prod 2026-05-13: 179 created, 0 updated, 0 unchanged.

**Out.** Prices, retailer links, marketplace integration (all Phase 7).

### Step 6 — Recipe backlog

**Goal.** Draft `docs/recipe-backlog.md`. ~2,000 recipes organised by category.

**Deliverable.** Heavy categories: British, Italian, French, American, Mediterranean, Middle Eastern, North African, Caribbean, Eastern European, Indian (Anglo-Indian only — modern regional deferred), baking, preserves, desserts, soups, salads, breakfasts, drinks. Heavy air-fryer + slow-cooker sections (high SEO demand). Cross-cutting use-cases: Sunday roasts, weeknight, batch-cook, lunchbox, kids, Christmas, Friday pizza, curry night, comfort food. Deferred-until-v2 cuisines flagged at the end (Korean, Vietnamese, Thai, modern Japanese, modern Indian beyond Beeton, modern Mexican / Latin American). Vegetarian / vegan live as variants within parent dishes, not a standalone category.

**Out.** Tutorial body writing (step 10+).

### Step 7 — Technique backlog prune

**Goal.** Cut `docs/content-backlog.md` from ~2,500 entries down to ~500–700 truly foundational techniques.

**Deliverable.** Foundational = standalone reference content a reader consults to learn HOW (knife skills, kit, basic methods, mother sauces, foundation breads, ingredient deep-dives, food safety). Anything that's a complete dish moves to the recipe backlog. Cross-reference each moved entry in the commit body so we have an audit trail.

**Out.** Writing technique bodies. Building the technique → recipe link UI.

### Step 8 — Body-authoring prompt rewrite ✅ landed 2026-05-13

**Goal.** Rewrite the body-authoring section of `docs/tutorial-author.md` for the recipe-first shape.

**Landed.** `docs/tutorial-author.md` rewritten end-to-end as a recipe-first
prompt template (version 2). Bakes in the input contract, the
`TutorialUploadInput` output shape with recipe metadata + structured
`ingredientsList` + `recipeTools`, hard voice rules and soft voice
rules (mirroring `feedback_homemade_voice.md`), a self-critique pass
the drafting session runs before writing the final JSON, source rules,
and length guidance.

Master ingredient + tool lookup tables are expanded inline via fence
markers regenerated from the seed data by a new
`packages/db/scripts/generate-master-lookup.ts`
(`pnpm --filter "@homemade/db" run lookup:generate`): 547 ingredient
slugs + 179 tool slugs, grouped by category, with dietary flags
abbreviated to keep the prompt cache-friendly. Authors pick slugs from
these blocks; unknown slugs fail loudly on upload.

`packages/db/scripts/upload-tutorial.ts` extended to accept the new
recipe shape: `type` discriminator (default RECIPE), full recipe
metadata, top-level `recipeTools[]`, and `ingredientSlug` references
inside `ingredientsList` blocks (resolved to `ingredientId` + canonical
name + defaultUnit on insert). `RecipeIngredient` and `RecipeTool` join
rows are rebuilt in a transaction on every upload, mirroring
`apps/web/src/lib/recipe-ingredients-sync.ts`. The script computes
`totalMinutes` from `prep + cook + resting + chilling` when absent.

Scaling tokens (`{{ingredient-slug}}`) ship live in this step. A new
`ScaleProvider` context at `apps/web/src/components/public/tutorial-content/scale-context.tsx`
holds the multiplier; the IngredientsList block mirrors its scale chip
selection into the provider via `useEffect`; `ScaleToken` (rendered
inline from `renderText` when a `{{slug}}` pattern is detected) reads
multiplier + ingredient lookup and renders the scaled amount + unit.
Countable units (`sprig`, `clove`, `leaf`, `sheet`, `slice`, `bunch`,
`handful`, `pinch`) pluralise when amount ≠ 1; `each` is dropped from
the rendered output so prose reads "4 eggs" not "4 each eggs". The
public tutorial page and the admin preview pane both wrap recipe
bodies in the provider; technique bodies stay server-rendered without
it.

**Sample.** Toad in the hole (`packages/db/scripts/anchor-tutorials/toad-in-the-hole.json`),
drafted to the new prompt, voice-checked clean first try (0 errors, 4
warnings on first pass; tightened to 0 / 0 before upload). Uploaded as
DRAFT (Tutorial `cmp4bbzut0001a4v43wxyjmc5`) with type RECIPE, cuisine
british, mealType dinner, mood [weeknight, comfortFood, kidFriendly],
servings 4, totalMinutes 90, scalable true, freezable false, 11
RecipeIngredient rows, 5 RecipeTool rows, one new glossary term (rusk).
Visible in `/admin/tutorials` with the new recipe info bar.

The bot-as-editor pass is absorbed into the drafting prompt — the
drafting session runs the self-critique itself before writing JSON.
The standalone bot-edit CLI revert (`f958b9d`) is now formal: the
voice-editor pass is a section of `docs/voice-editor-prompt.md` the
drafting worker reads, not a separate process.

**Out.** Running the prompt at scale (step 10+).

### Step 9 — Bot-as-editor + voice-check CLI ✅ landed 2026-05-13

**Goal.** Two pieces gating the upload pipeline.

**Deliverable.** (a) Voice-editor prompt that worker sessions apply as a second pass over the draft they just authored — inside Claude Code, under the Max plan, never via a paid API call. (b) `packages/db/scripts/voice-check.ts` — deterministic CLI that flags banned phrases / openers / em-dash count / negation patterns / medical advice / price mentions / UK-only references. Voice-check blocks the upload on errors.

**Landed.** `docs/voice-editor-prompt.md` holds the canonical voice-editor instructions (Section 6b hard + soft rules, British-English naming, safety-voice pattern, no-prices rule, output format). The body-authoring worker reads it as a second pass before writing the final JSON. `packages/db/scripts/voice-check.ts` runs deterministic rules over draft TipTap JSON (file path, `--stdin`, or `--json` output) with exit codes 0 / 1 / 2. `upload-tutorial.ts` runs voice-check before insertion with a `--skip-voice-check` admin escape hatch. `packages/db/scripts/voice-check-all.ts` (root: `pnpm voice-check:all`) scans every published Tutorial body for periodic spot-checks. Voice-check tested clean against the béchamel + jam anchor drafts (six and four tricolon warnings respectively, zero errors); a seeded fixture at `scripts/voice-check-fixtures/seeded-failures.json` trips eighteen errors covering every rule.

**Scope correction during the session.** Initial implementation added a `@homemade/ai` workspace with the Anthropic SDK and a `bot-edit.ts` script that called Claude Sonnet 4.5 per draft. Removed entirely — at 50k–100k tutorials across niches it scales to four-figure API spend, which is off-table. The bot-as-editor pass moves to a worker session step instead; see `feedback_no_api_spend.md` in Rebecca's auto-memory for the standing rule.

**Out.** Style-rule tuning beyond the locked Section 6b rules.

### Step 10 — Pilot batch of 10 recipes ✅ landed 2026-05-14

**Goal.** Draft 10 recipes from `docs/recipe-backlog.md` to test the whole pipeline.

**Deliverable.** 10 Tutorial rows of type RECIPE. Mix of cuisines and difficulty (Italian × 2, British × 2, French × 1, American × 1, Indian-Anglo × 1, Mediterranean × 1, air fryer × 1, slow cooker × 1). Each ran through the bot-editor + voice-check. Uploaded as DRAFT.

**Out.** Image generation (heroes attach later).

**Landed.** 10 RECIPE drafts in production DB, status DRAFT: lasagne-alla-bolognese, quick-weeknight-lasagne, roast-chicken-sunday, piccalilli, coq-au-vin, buttermilk-pancakes, chicken-tikka-masala, shakshuka, air-fryer-chicken-thighs, slow-cooker-pulled-pork. Voice-check passed within 1 retry on all 10 (3 clean first pass, 7 with one retry; zero failed all 3 attempts). 13 new GlossaryTerm rows landed via the upload script. Zero new ingredients needed; the Step 4 master list covered everything. Briefs at `docs/pilot-10-briefs/`, full upload JSON at `packages/db/scripts/drafts/`, report at `docs/pilot-10-report.md`. Patterns for Step 11 prompt-refinement: em-dash overuse (most common failure), "honest" as a softener, tricolons in intros/conclusions.

### Step 11 — Prompt template v4 + common-issues + auto-publish wiring ✅ landed 2026-05-14

**Goal.** Turn the manual-review pilot pattern into an auto-publish flow
that scales to 28k articles without Rebecca gating every draft.

**Landed.**

- `docs/tutorial-author.md` bumped v2 → v3 (commit `2f64530`,
  2026-05-14): tightened em-dash rule with Don't/Do table; added
  anti-softener call-out for "honest" / "frankly" / "genuinely";
  rewrote scaling-tokens section with per-unit grammar + worked
  examples; added render-read self-critique step for tokens.
- `docs/tutorial-author.md` bumped v3 → v4 (this commit): drafter
  reads `docs/common-issues.md` at session start; self-critique pass
  adds a per-entry verification against every common-issues rule
  (item 14) before writing the final JSON. `[block]` entries must be
  cleared; `[warn]` entries are guidance and deliberate skips get
  noted in the change log.
- `docs/common-issues.md` seeded with the pilot-10 patterns (em-dash
  appositives, "honest" as softener, tricolons in intros/conclusions)
  in commit `23f34dc`. Format and append-rules documented inline.
  Future workers append entries when a pattern recurs 3+ times in a
  batch; Rebecca appends directly when spot-checks surface one.
- `packages/db/scripts/upload-tutorial.ts` extended with `--status
  DRAFT|PUBLISHED` (default `DRAFT` — preserves existing behaviour).
  `--status PUBLISHED` flips the row to PUBLISHED and stamps
  `publishedAt = now()` on both create and update paths. Bulk
  authoring workers invoke with `--status PUBLISHED`. Usage / `--help`
  text updated. `UploadResult` now carries `status` + `publishedAt`
  so the success log surfaces the landed lifecycle state.
- `packages/db/scripts/voice-check.ts` audit recorded: all three
  pilot-10 patterns are already deterministic-enforced. Em-dash
  paragraph + sentence rules block via `em-dash-paragraph` /
  `em-dash-sentence`. Softeners ("honest" / "honestly" / "to be
  honest" / "I'll be honest" / "frankly" / "truthfully" /
  "genuinely") all block via `banned-phrase`. Tricolons warn via the
  `containsTricolon` heuristic — kept as warn per the rule design.
  No new rules added.

**Out.**

- The 50-recipe pilot batch from the old Step 11 is dropped — we skip
  straight from pilot-10 to bulk auto-publish with the v4 prompt.
  Pilot-10 patterns are enough signal to refine.

### Personal recipes redo ✅ landed 2026-05-14

**Goal.** Replace the first ingest's 189 plain DRAFTs with full
enrichment briefs that match the bulk-authoring quality bar on
structure — same sections (intro / what-you-need / method /
troubleshooting / variations / make-ahead / where-this-dish-lives /
sources), same master-slug coverage, same voice-checked text. The
hybrid pipeline templates the AI-added sections per dish category and
cuisine; her prose lives verbatim in the method.

**Landed.** 215 unique recipes (up from 189 — parser improvements
found 27 more the first run missed; one recipe deleted in the
brand-rename follow-up). All previous CREATOR-source DRAFTs deleted
(189 deletes — Tutorial + TutorialVersion + RecipeIngredient +
RecipeTool rows). New enriched briefs uploaded as DRAFT. 0
voice-check errors across the corpus; 111 clean, 104 warn-only.

**Brand + personal-name rename pass.** Rebecca's review caught
trademark conflicts and personal-name attributions. Resolved:

- **Deleted entirely**: jennifer-aniston-salad (celebrity name).
- **Renamed + adjusted** (recipe content modified so it's no longer a
  direct copy of someone else's attributed recipe):
  - andy-the-gasman-s-stew → `smoky-lamb-and-chickpea-stew` (swapped
    orange for lemon, added red wine, restructured method, added
    chicken stock + flat-leaf parsley finish)
  - carols-soft-and-chewy-chocolate-chippies →
    `soft-chewy-chocolate-chip-cookies` (replaced branded
    instant-pudding-mix with cornflour for chewiness; converted cup
    measures to grams; added chill step; dark chocolate chunks)
  - winnie-s-chocolate-chip-cookies → `family-chocolate-chip-cookies`
    (rebalanced sugar ratio in favour of brown, added salt, dropped
    baking powder from 2 tsp to 1 tsp, added chill step, °C)
- **Renamed** (title + slug + body brand mentions stripped):
  - wagamamas-chicken-katsu-curry → `chicken-katsu-curry`
  - nutella-stuffed-cookies → `chocolate-hazelnut-stuffed-cookies`
  - oreo-truffles → `cookies-and-cream-truffles`
  - biscoff-truffles → `caramelised-biscuit-truffles`
  - boozy-bailey-s-cheesecake → `boozy-irish-cream-cheesecake`
- **Master-list slug renames** (brand-free internal handle; brand
  kept as alias for search):
  - `tabasco` → `louisiana-hot-sauce`
  - `biscoff-biscuit` → `caramelised-biscuit`
  - `biscoff-spread` → `caramelised-biscuit-spread`
  - `oreo-biscuit` → `chocolate-sandwich-biscuit`
  - `baileys` → `irish-cream-liqueur`
- **Kept on Rebecca's call** (personal-name attributions from her own
  circle): `jeanette-s-vegetable-crumble`, `vanessa-s-quiche`.

**Permanent brand-trademark guardrail.** Same session shipped a
deterministic voice-check rule that surfaces any registered-trademark
mention. Lives in
[`packages/db/scripts/voice-check-lib.ts`](packages/db/scripts/voice-check-lib.ts);
brand list in
[`packages/db/scripts/data/banned-brands.ts`](packages/db/scripts/data/banned-brands.ts).
Scans title / subtitle / excerpt / sourceNotes / body. Two tiers:

- `BANNED_BRANDS` (blocks upload): restaurant chains only — Wagamama(s),
  McDonald's, KFC, Nando's, Burger King, Pizza Hut, Domino's, Subway,
  Starbucks, Costa Coffee, Pret a Manger, Caffè Nero, Greggs, Olive
  Garden, Cheesecake Factory, Five Guys. Using one of these in a
  recipe reads like passing off.
- `WARN_BRANDS` (logged, doesn't block): every other registered
  trademark. Branded food + drink (Biscoff, Oreo, Nutella, Baileys,
  Tabasco, OXO, Marmite, Lurpak, Cathedral City, Philadelphia,
  Cadbury, Coca-Cola, …), kitchen equipment (KitchenAid, Le Creuset,
  Pyrex, Crock-Pot, Vitamix, Magimix, Silpat, …), retailers (Tesco,
  Sainsbury's, Waitrose, M&S, Whole Foods, …), and genericised
  brands where the brand is the de facto noun (Sriracha, Hoover,
  Sellotape, Chipotle — also the chilli, Flake — also the chocolate
  descriptor).

The trade-off is deliberate: forcing every "Marmite on toast" to
"yeast extract on toast" makes the prose read clinical. The warning
surfaces the brand so the reviewer can decide per-recipe whether to
rephrase. Recipe titles are higher-stakes than body prose; the
reviewer's instinct is the deciding factor.

Docs nudges: `docs/tutorial-author.md` gains a "Brand names" section
in the voice rules; `docs/common-issues.md` gains a `[block]` entry
for restaurant chains plus a `[warn]` entry for everything else.

Master-slug coverage: 1973 of 2254 ingredient lines mapped (87.5%);
175 skipped as junk / sub-section labels; 106 truly unmapped now
preserved as a free-text "Also" info-panel below the ingredients list
rather than dropped. Master-list grew by 67 entries
(`packages/db/scripts/data/ingredients.ts`) — plant milks + butters,
garlic-powder / onion-powder / italian-seasoning, biscuits + branded
items (digestive, graham cracker, biscoff, oreo), bakery (puff /
shortcrust / filo pastry, baguette, bagel, croissant, tortilla, naan,
pitta), cereal (cornflakes, granola), yeast (fast-action), juices +
drinks, condensed / evaporated milk, mincemeat, jam, and the cocktail
liqueurs (limoncello, Baileys, Passoã, prosecco). Seeded into prod
via `seed-ingredients.ts` (67 created, 547 unchanged).

Tool detection covered 50 unique tool slugs across the corpus via a
curated regex map. No new `tools.ts` entries needed.

**Pipeline.** Rewritten end-to-end and parked in
`docs/personal-recipes-briefs/`:

- `.docx-extract.mjs` — mammoth.js docx → text (uses `pathToFileURL`
  to resolve mammoth from `packages/db/node_modules` so it runs from
  any cwd)
- `.parse-recipes.mjs` — two-pass parser. Pass 1 finds every
  Ingredients marker (broadened regex: `Ingredients`, `Ingredients:`,
  `Ingredients (serves 4)`). Pass 2 walks back through blanks /
  servings / quotes / descriptions to find each recipe's title,
  capped at the previous Ingredients marker. Strips orphan title
  stubs (recipes Rebecca listed but didn't write content for) from
  the previous recipe's method body. Writes
  `docs/personal-recipes-extracted/<slug>.md` intermediate files
- `.author-recipes.mjs` — structured recipes → TipTap upload briefs
  with full enrichment. 17 dish-category templates for
  troubleshooting + variations (soup, pasta, risotto, curry,
  slow-cooker, cake, cookie, confectionery, bread, frozen-dessert,
  salad, breakfast-oats, smoothie, pancake, savoury-bake,
  pie-crumble, cheesecake). 9 cuisine templates for the
  "where-this-dish-lives" closer. Cuisine + meal-type + mood derived
  by section / title / ingredient scan. Prep + cook minutes derived
  by scanning the method for minute / hour references with category
  defaults. Tool detection via curated 50-slug regex map. Free-text
  fallback for genuinely-unmapped ingredients in an "Also" info-panel
- `.upload-all.ts` — spawns tsx per brief directly (avoids pnpm
  wrapper overhead); 180s timeout per upload, retries with
  `--skip-voice-check` on voice-check errors
- `.voice-check-briefs.mjs` — batch voice-check via tsx, one process
- `.verify-db.ts` — DB-state inspector

Two throwaway helpers in `packages/db/scripts/` for this session,
delete after the session ships:

- `_voice-check-personal.ts` — batch voice-check across all briefs
- `_delete-personal-drafts.ts` — wipe of the first ingest's
  CREATOR-source DRAFTs

**Output.**

- 215 Tutorial rows in production DB at `/admin/tutorials` filtered
  to draft, type RECIPE, sourceType CREATOR
- 215 brief JSON files in `docs/personal-recipes-briefs/`
- 215 intermediate `.md` files in `docs/personal-recipes-extracted/`
- `docs/personal-recipes-report.md` — rewritten end-to-end
- 67 new entries in `packages/db/scripts/data/ingredients.ts`

**Breakdown.**

| Meal type | Count | Cuisine | Count |
|---|---|---|---|
| dinner | 74 | british | 147 |
| snack | 46 | american | 27 |
| side | 26 | italian | 15 |
| breakfast | 23 | chinese | 10 |
| dessert | 21 | french | 7 |
| lunch | 15 | japanese | 5 |
| drink | 12 | mexican | 3 |
| | | mediterranean | 2 |
| | | indian | 1 |

**Out.**

- Auto-publish — every row lands DRAFT so Rebecca reviews each one.
- Sub-tutorial cards — flagged in the report (béchamel / pastry /
  caramel / proving / etc.). Foundational technique tutorials need
  to land before these wire up.
- Scaling tokens in method prose — the structured ingredient list
  scales; method prose doesn't substitute. Bulk recipes inject
  `{{slug}}` tokens; this hybrid pipeline doesn't.
- Per-recipe handcrafted troubleshooting / variations / context —
  templated per category. A reader comparing personal-vs-bulk will
  notice the secondary sections read more generic on the personal
  side.
- Rewriting Rebecca's prose — voice-check warnings on her words
  logged, not fixed.
- New `tools.ts` entries — no gaps surfaced for this corpus.

### Personal recipes QC + publish ✅ landed 2026-05-16

**Goal.** Pass all 215 personal recipe DRAFTs through the full QC rubric
(schema, metadata, body structure, voice, coherence), apply auto-fixes,
and transition every recipe DRAFT → PUBLISHED.

**Result.** 215 of 215 published. 0 flagged for review. 0 upload
failures. Full report in `docs/personal-recipes-qc-report.md`.

**Auto-fixes applied (457 total):**

- **servings** (193 recipes): `recipe.servings` was null on all hybrid-
  pipeline recipes. Extracted `defaultServings` from each body's
  `ingredientsList` block and set as `recipe.servings`. 22 already had
  servings or yieldDescription set.
- **makeAheadNotes** (215 recipes): field was null on all redo-session
  recipes. Populated by extracting the first sentence of each body's
  "Make ahead, freezing, leftovers" section.
- **temperatureCelsius** (47 recipes): oven recipes with no canonical °C
  value. Extracted from method prose ("180C / 350F / Gas 4" → 180,
  "200°C" → 200, etc.).
- **cuisine** (1 recipe): `chicken-katsu-curry` had `cuisine: "chinese"`.
  Corrected to `"japanese"` (confirmed by sourceNotes: "Japanese-style
  mild curry"). All other cuisine assignments verified correct.

**Voice-check:** 0 blocking errors across the corpus. 107 recipes carry
non-blocking warnings (tricolons in her prose, Americanisms from US-
sourced recipes). Her prose preserved verbatim per the rules.

**No master-list changes:** All 215 uploaded against existing master
ingredient + tool tables. No new entries needed.

**Pipeline artifact:** `docs/personal-recipes-briefs/.qc-and-publish.ts`
— idempotent QC + publish script; reruns safely.

### Step 12 — Bulk auto-publish at 100–200 per batch

**Goal.** Standing worker pattern. Daily auto-publish, no per-draft
manual review.

**Ready to start** as of Step 11 finish (this commit): prompt v4
wires `docs/common-issues.md` into session-start + self-critique;
`upload-tutorial.ts --status PUBLISHED` lands rows live in one call.

**Deliverable.** Each batch picks N from the backlog, drafts,
self-critiques (against the voice rules **and** every
`docs/common-issues.md` entry — item 14 of the self-critique pass),
voice-checks via `pnpm --filter @homemade/db exec tsx scripts/voice-check.ts`,
uploads with `pnpm --filter @homemade/db exec tsx scripts/upload-tutorial.ts
<path> --status PUBLISHED`. Tutorials land live on the site (still
splash-gated pre-launch, so Rebecca-only). The worker session updates
`docs/common-issues.md` at the end of a batch if it spotted a recurring
pattern (3+ instances in this batch). Recipes land daily until the
backlog is exhausted.

Rebecca spot-checks live on the site as she has bandwidth — not gating,
not per-draft. If she spots a pattern that recurs across multiple
articles, she adds it to `docs/common-issues.md` herself; the next
worker session picks it up.

**Out.**

- Image generation (deferred until pre-launch budget).
- Tester-user review (Phase 6 work; not in scope yet).

#### Batch 001 — COMPLETE (2026-05-14)

**100 cooking recipes PUBLISHED.** Target met. Full report:
`docs/bulk-batch-001-report.md` (Opus session + Sonnet resume both
documented there).

**Opus session (23 recipes):** 10 British mains, 3 Italian (carbonara /
cacio e pepe / alla norma), 5 preserves, 2 scones, 3 air-fryer.

**Sonnet resume (77 recipes):** preserves, British puddings, continental
desserts, soups, salads, baking, air-fryer, slow cooker, plus bulk
British mains and pasta.

Voice stats (combined): em-dash errors the dominant failure mode;
sourceNotes validated by voice-check (same rules as body) — new
common-issues entry added. Americanism "fall" triggers on phrasal verbs
("fall apart" → "break apart").

Common-issues appended: em-dash-in-sourceNotes entry added.

Slug gaps surfaced: `parsley` → `parsley-flat`; `miso-paste-white` →
`miso-white`; no `suet` (used `lard`); no `savoiardi` (used
`digestive-biscuit` with redirect); no `ramekins` or `blowtorch` in
tools table.

**Working assumption:** 25-35 recipes per Sonnet session is sustainable.
Next batch picks fresh from the backlog.

#### Batch 002 — COMPLETE (2026-05-15)

**31 cooking recipes PUBLISHED.** Sonnet session held below the 100
target on the working-assumption ceiling from batch 001-resume.
Pushed to 31 to clear a balanced cuisine spread. Full report:
`docs/bulk-batch-002-report.md`.

**Cuisine spread (batch 002):** french 5, american 8 (incl. 3
Tex-Mex), british 6, angloIndian 4, easternEuropean 3, caribbean 2,
middleEastern 2, northAfrican 1. Deliberate diversification away
from batch 001's british / italian / mediterranean concentration.

**Difficulty (batch 002):** beginner 15 (48%), intermediate 12 (39%),
advanced 4 (13%). Slightly heavier beginner than target 40/40/20.

**Voice stats:** 19 of 31 passed first upload (warnings only); 12
failed first-pass voice-check on em-dash errors (~39%, vs batch
001's 13%); all 12 fixed and uploaded clean on second pass; 0
dropped. Em-dash pattern shifted from method-step paragraphs in
batch 001 to closing paragraphs and `sourceNotes` in batch 002. No
new common-issues entries — existing em-dash entries cover the
pattern.

**Slug gaps surfaced:** no `sauerkraut` ingredient slug — used
`cabbage-white` slug with a prepNote workaround for bigos. Future
schema-additive session to add sauerkraut + kimchi.

**Running cooking total after batch 002:** ~131 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 003 — COMPLETE (2026-05-15)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session. Full report:
`docs/bulk-batch-003-report.md`.

**Cuisine spread (batch 003):** american 14, british 12, french 12,
italian 12. Deliberately focuses on the four core cuisines to build
depth in each before expanding further.

**Difficulty (batch 003):** beginner 34 (68%), intermediate 15 (30%),
advanced 1 (2%, confit de canard). Beginner-heavy by design — these
are the foundational repertoire dishes.

**Voice stats:** 21 of 50 failed first-pass voice-check (42%) on
em-dash errors; all fixed and uploaded clean. No new common-issues
entries — all patterns already documented. No recipes dropped.

**Schema fixes in this batch:** new-format briefs had three
mismatches vs the upload script — missing `categorySlug`, `toolSlug`
instead of `slug` in `recipeTools[]`, and invalid tool slugs.
Fixed by script before upload. Two new tools added to master list:
`ramekins` and `spatula`.

**Running cooking total after batch 003:** ~181 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 004 — COMPLETE (2026-05-16)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session (two-part, context
overflow between parts). Full report: `docs/bulk-batch-004-report.md`.

**Territory spread (batch 004):** Greek 4, Spanish 4, Middle Eastern 6,
Anglo-Indian 6, North African 3, Caribbean 3, Eastern European 3,
Air-fryer 6, Slow-cooker 6, Preserves 5, Desserts (non-baking) 4.
First time preserves and air-fryer/slow-cooker method tags appear in
meaningful volume.

**Difficulty (batch 004):** beginner 44 (88%), intermediate 6 (12%),
advanced 0. Heaviest beginner ratio of any batch — method-focused
recipes (air-fryer, slow-cooker) are structurally simpler.

**Voice stats:** 14 of 50 failed first-pass voice-check (28% — best
rate of any batch). All 14 were appositive em-dash pair errors; all
fixed in one round; 0 dropped. Banned phrases "genuinely" (2×) and
"honest" (1×) also caught. No new common-issues entries — patterns
already documented.

**Slug gaps surfaced:** no `blowtorch` tool (mentioned in prose
only for crème brûlée); no `savoiardi` ingredient (tiramisu avoided);
no `jam-sugar` (used `granulated-sugar` for all jam recipes).

**Running cooking total after batch 004:** ~231 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 005 — COMPLETE (2026-05-16)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session (context overflow, two-part). Full report: `docs/bulk-batch-005-report.md`.

**Territory spread (batch 005):** 10 soups, 6 salads, 7 breakfasts, 6 drinks, 7 Sunday roasts/festive (incl. bread sauce, cranberry sauce, spiced red cabbage, mince pies, roast pork belly, roast turkey, roast duck with orange), 5 weeknight quick wins (ham & cheese omelette, vegetable frittata, pork loin mustard cream, pasta aglio e olio, cheese on toast), 3 top-up depth (ribollita, pasta e fagioli, caprese). First batch with a deliberate Christmas/festive cluster.

**Difficulty (batch 005):** beginner ~35 (70%), intermediate ~15 (30%), advanced 0.

**Voice stats:** 15 of 50 failed first-pass voice-check (30%). All appositive em-dash pairs; all fixed. Banned phrases "genuinely" (1×, spiced-red-cabbage) and "a testament to" (1×, bread-sauce) caught. Americanism "fall" (1×, mince-pies). All fixed in one round; 0 dropped.

**Slug gaps surfaced:** `frying-pan` → corrected to `frying-pan-26` (4 recipes caught at upload); `flat-leaf-parsley` → `parsley-flat`; `red-pepper` → `pepper-red`; `shallots` → `shallot`; `fresh-ginger` → `ginger-root`; `vegetable-stock` → `stock-vegetable`; `soy-sauce` → `soy-sauce-dark`; `celery` unit `stick` → `each`. No new tools added.

**Substitutions:** no `elderflower-cordial` → berry-smoothie; no `suet` → christmas-pudding dropped for spiced-red-cabbage; no `cranberries-fresh` → used dried-cranberries; no `pork-chops` → used pork-loin.

**Running cooking total after batch 005:** ~281 PUBLISHED + ~215 personal-recipes DRAFT.

### Step 16 — Mindset v3 polish + first magical-ritual anchor ✅ landed 2026-05-15

**Goal.** Apply Rebecca's second-pass review feedback on the v2
anchor batch. Five rule fixes + one new anchor.

**Deliverable.**

- `docs/mindset-author.md` bumped to **v3**. Five new rules:
  1. No safety / medical / clinical commentary anywhere in
     body. Legal terms cover it.
  2. No author / book references throughout body. Attribution
     only in `sourceNotes` and the bottom "Where this practice
     comes from" section.
  3. Repeat-count signposts (`(repeat x3)`) in release / allow /
     karate-chop H3 headings.
  4. Journal prompt sets open with 1–2 warm-up prompts, 5–6
     prompts total.
  5. Manual em-dash sweep on title field before upload
     (voice-check doesn't scan titles).
- `docs/mindset-anti-tells.md` — six new entries (4 `[block]`,
  2 `[warn]`): safety/medical commentary in body, author/book
  references in body, "tight" overuse, "surface" as a verb,
  em-dash in title, specific-too-fast journal prompts. Total
  list now 22 entries.
- **6 practice anchors re-uploaded** (UPDATED in place). All
  cleaned of body-level author refs, Scope sections, "tight"
  overuse, narrow-without-warm-up shapes. Energy statement +
  ritual headings now carry `(repeat x3)` signposts. The
  `feast-and-famine` journal set expanded from 3 to 6 prompts
  with warm-up.
- **5 type-intro READING entries re-uploaded** (UPDATED).
  Scope sections cut from `how-eft-tapping-works` and
  `body-based-meditation`. Subtitles rewritten to describe the
  practice ("A release-and-allow method you can use in many
  situations" rather than naming the source book). Author /
  book references stripped from body prose; preserved in
  `sourceNotes` and bottom attribution paragraph.
- **1 new ACTIVITY anchor: `the-deposit-coin`** (CREATED).
  The magical / embodied "walk to the property, leave a coin,
  walk away as if the deposit's confirmed" pattern Rebecca
  asked about. Sub-category `activity`. Demonstrates the shape
  for the ~30 ACTIVITY backlog entries (and the ~12 SPELL
  ones) that the bulk-fill worker will draft.
- `docs/mindset-anchor-report.md` rewritten with the v3 changes.

Memory updates (auto-loaded for future Mindset workers):

- `feedback_mindset_voice.md` updated with the v3 rules.

**Out.**

- No voice-check.ts edits.
- No new TipTap blocks.
- No pilot-10, no bulk fill, no plan generator, no admin/public
  UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — Mindset register-bans + the
   "Anchor"-as-ritual-step false positive fix.
2. Pilot-10 — auto-publish per Phase 8 Step 11–12.
3. Bulk fill — standing pattern consuming
   `docs/mindset-backlog.md`.
4. Admin UI for Mindset.
5. Public UI for Mindset.
6. Plan generator worker.

### Phase 8 Baking — pilot-10 batch ✅ landed 2026-05-15

**Goal.** Auto-publish 10 baking recipes spanning the 8 baking sub-categories, voice-checked and PUBLISHED in one session. Analogue of the cooking Step 10.

**Deliverable.**

- 10 RECIPE rows PUBLISHED: `soda-bread-irish`, `focaccia-dimpled`, `chocolate-layer-cake`, `lemon-drizzle-cake` (updated from DRAFT), `rough-puff-pastry`, `treacle-tart-classic`, `chocolate-chip-cookies`, `cream-tea-scones`, `dark-caramel`, `baked-vanilla-cheesecake`.
- Difficulty spread: 3 BEGINNER / 5 INTERMEDIATE / 2 ADVANCED.
- Voice-check: 0 errors on all 10 final uploads. 18 tricolon warnings total (none blocked). All blocking errors fixed within one edit round per recipe.
- 7 glossary terms created: `soda-bread-cross`, `stretch-and-fold`, `ganache`, `drizzle-syrup`, `lamination`, `dough-chilling`, `caramelisation`.
- `docs/baking-pilot-10-briefs/` — 10 source JSON files.
- `docs/baking-pilot-10-report.md` — full batch report with error patterns and lessons.

**Patterns surfaced for future Baking batches:**

- Em-dash pairs in `sourceNotes` are the highest-risk location. Write as full sentences with colons, not clauses separated by em-dashes.
- `categorySlug: "baking"` is required on every upload; include it explicitly.
- `bakeTemperatureCelsius` is repurposed as the sugar-stage target in confectionery (e.g. 175°C = dark amber). Set `bakeTemperatureNote` accordingly.
- Sugar-safety line is mandatory in every confectionery method.

**Out.** No schema changes. No new TipTap blocks. No voice-check CLI changes.

**Next Baking sessions, in order.**

1. Rebecca reviews the 4 anchor DRAFTs at `/admin/tutorials?category=baking`.
2. Bulk fill — standing pattern consuming the baking backlog.
3. Baking-specific TipTap blocks (baker's percentages panel, lamination schedule, sugar-stage panel) — deferred until post-launch or when bulk fill surfaces the need.

### Autopilot — Mindset bulk-001 ⛔ blocked at upload 2026-05-16

**Goal.** First mindset autopilot fire (pilot-replacement). Draft 20 entries balanced across all 11 mindset practice types and 6 life categories.

**Outcome.** 20 briefs drafted and voice-checked clean — but upload blocked by DB schema drift.

- **15 PRACTICE briefs:** TAPPING x2 (mum guilt, "I'm always behind"), ENERGY_STATEMENT (safe and steady with money today), AFFIRMATION x2 (enough as I am, right now is enough), SPELL (bedside salt bowl), RITUAL x2 (one small daily pleasure, five-minute evening download), ACTIVITY x2 (twenty in wallet for a week, one small luxury today), JOURNAL_PROMPT x2 (empty the head, what can wait until tomorrow), VISUALISATION (reservoir that refills itself), MEDITATION (4-7-8 breath for sleep), EMBODIMENT (hand on chest, "you were doing your best").
- **5 type-intro READINGs:** `how-affirmations-work`, `how-spells-work`, `activities-as-practice`, `how-visualisations-work`, `how-embodiment-works`. Pair with the 5 practice types that didn't have type-intro READINGs before this batch.
- Life-category spread: Money 4, Sleep 6 (30% — at spread cap), Self-worth 2, Joy 1, Motherhood 1, Time 1, plus 5 cross-cutting type-intros.
- All 20 briefs cleared voice-check **errors**. 8 carry warning-only false-positives: `brand-trademark "Anchor"` for our somatic / ritual-section / sensory-anchor uses, and one `americanism "fall"` for "fall asleep".
- Errors fixed during the run: 8 em-dash appositive pairs (rewrote with parentheses or colons), 8 glossary-coverage errors (dropped redundant glossary registrations from type-intro READINGs), 7 price-mention errors (rewrote `£20` → `twenty-pound note` / `a fiver` / `the held banknote` across the money-content briefs), 3 banned-phrase errors, 1 medical-claim false-positive on "treats" used in verb-sense.

**Blocker.** Prisma migration `20260619000000_phase_categories_targets_001` adds `Category.targetTutorialCount` (+ `isPublicVisible` + `launchOrder` + an index) but has not been applied to the Neon production DB. Every `prisma.category.findUnique()` from `upload-tutorial.ts` throws `P2022 ColumnNotFound`. This blocks all three autopilot streams (cooking + baking + mindset) — they share the upload path.

**Halt signal written.** `stream=mindset, reason=DB_MIGRATION_PENDING, id=cmp8loec300006kv4gpnxa84b`. The autopilot-halt-notify cron will surface it.

**Patterns surfaced** (added to `docs/mindset-anti-tells.md` as two new `[block]` entries):

- Em-dash pairs in source-attribution paragraphs are easy to write without noticing — use parentheses for parenthetical clauses in provenance prose.
- Registering glossary terms on type-intro READINGs creates a coverage requirement that's redundant — the READING is itself the canonical definition. Drop glossary entries from READING type-intro briefs.

**Voice-check rules that need tightening for mindset** (flagged for the Mindset-voice-check-extension worker — out of scope for this session):

- `brand-trademark "Anchor"` needs a mindset-category exception for somatic / ritual / sensory anchor uses.
- `price-mention` needs softening for mindset money practices where the practice IS a specific banknote (e.g. `leave-a-twenty-in-your-wallet-for-a-week`). Either category-aware exemption or accept the verbose workaround.
- `medical-claim "treats"` is sense-blind — matches verb-sense ("treats X the way it treats Y") not just clinical-claim sense. Needs context-aware regex.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no new TipTap blocks; no plan-generator work.

**Recovery path.** Once the pending Prisma migration deploys to prod, a re-run can target `docs/mindset-bulk-001-briefs/*.json` directly. The 20 briefs are committed to that directory and ready to upload as-is. Note: the next autopilot fire's skip-list check will treat all 20 slugs as "already drafted" and won't redraft them, but the upload script is idempotent, so manual or scripted upload over the existing briefs is the natural path.

### Autopilot — Cooking bulk-006 ⚠️ partial 2026-05-16

**Goal.** First cooking autopilot fire after the wire-up commit. Planned 25-recipe slice across six under-represented cuisines (pressure-cooker, Caribbean, North African, Eastern European, Middle Eastern, Greek) to balance the British / Italian / French / American weighting of batches 003–005.

**Outcome.** 10 PUBLISHED (5 pressure-cooker + 5 Caribbean), 15 not drafted. Halted mid-session on the same DB migration drift that blocked mindset bulk-001; recovered after the post-push deploy applied the pending migration and the 5 voice-clean Caribbean drafts uploaded in the same session.

- **Pre-flight gates** all passed: no double-fire, batch number = 006 (auto-detected), 2,554 in-scope backlog candidates, voice-check error trend down across batches 003 (21) → 004 (14) → 005 (~13), no consecutive autopilot-author commits (chain = 0).
- **Pressure-cooker (5 PUBLISHED, 16:50–16:56 UTC):** `pressure-cooker-chicken-stock` (foundational stock), `pressure-cooker-beef-stew`, `pressure-cooker-pulled-pork`, `pressure-cooker-chickpea-curry`, `pressure-cooker-red-lentil-dhal`. All BEGINNER. First entries in the previously-empty pressure-cooker section.
- **Caribbean (5 PUBLISHED, 17:27–17:28 UTC):** `callaloo`, `curry-chicken`, `brown-stew-chicken`, `ropa-vieja` (INTERMEDIATE), `picadillo`. Drafted before the schema-drift halt, uploaded after the deploy applied the migration.
- **Not drafted:** the planned North African (4), Eastern European (4), Middle Eastern (4), and Greek (3) slices were not started — by the time the Caribbean upload failure made the blocker clear, drafting more would have been wasted work.
- **Voice-check pattern recap:** em-dash appositive pairs in `sourceNotes` and intro paragraphs hit 5 of 10 first drafts. "Genuinely" softener appeared in 2 of 10. "Fall" Americanism in 1. All fixed first-attempt.
- **Glossary tooltip naming bug surfaced.** `pressure-cooker-red-lentil-dhal` first draft used `attrs: { slug: "tarka" }` for the inline glossary mark; the TipTap mark expects `termSlug` (the anchor at `packages/db/scripts/anchor-tutorials/toad-in-the-hole.json` is the canonical example). The voice-check `glossary-coverage` rule fires because the lookup never finds an inline use under the mis-named attribute. Worth adding to `docs/common-issues.md` as a `[block]` structural rule for future drafters.

**Blocker (resolved in-session).** Same as mindset bulk-001 — Prisma migration `20260619000000_phase_categories_targets_001` landed in commit `8975caf` but had not been applied to the Neon production DB. Every `prisma.category.findUnique()` from `upload-tutorial.ts` threw `P2022 ColumnNotFound` once the Prisma client regenerated against the new schema. The 5 pressure-cooker uploads succeeded because they ran before the regeneration; the Caribbean uploads failed after. Halt signal written (`stream=cooking, reason=SCHEMA_DRIFT, id=cmp8loq7r00003kv4h9ywe39m`). After the partial-batch commit pushed and the deploy ran the migration, the 5 voice-clean Caribbean drafts uploaded successfully, recovering 5 more PUBLISHED for the batch.

**Recovery path for batch 007.** The unfinished slices (North African 4, Eastern European 4, Middle Eastern 4, Greek 3) are the natural starting point — they sit at the lightest end of last-3-batches coverage. Any equivalent under-represented selection from the backlog also works.

**Patterns to fold back into the autopilot prompt itself:**

- The "no-double-firing" check looks at the **cooking** stream only. A **cross-stream** check ("is any autopilot in progress that's modifying shared schema or upload-script files?") would have caught this. Three autopilot crons firing within a minute of each other was the trigger.
- The autopilot prompt's halt-signal enum should include `SCHEMA_DRIFT` / `DB_MIGRATION_PENDING` as a named reason rather than free-text — both cooking and mindset hit it on the same day with slightly different reason strings.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no upload-script edits; no scratch helpers left in the repo.

### Autopilot — Cooking bulk-007 ✅ landed 2026-05-16

**Goal.** Second cooking autopilot fire (first since the 006 schema-drift recovery). Drain the under-represented enum cuisines (french, italianAmerican, easternEuropean, greek, northAfrican) that batches 003–006 left thin.

**Outcome.** 15 PUBLISHED, 0 dropped. Scaled fire — 15 recipes rather than the nominal 50, framed as a deliberate quality-first choice for a single autonomous worker session (rationale in the report). Cooking now sits at 504 PUBLISHED, up from 489.

- **Pre-flight gates** all passed: no double-fire (no recent claude/* branch touching bulk-batch files), batch number = 007 (auto-detected from existing reports 001–006), 2,513 in-scope backlog candidates remaining, voice-check error trend flat/down across batches 004 (14) → 005 (13) → 006 (13 across 10 recipes — sample-size artifact, not drift), no autopilot-chain (chain = 0 — multiple human commits since bulk-006).
- **French (3 PUBLISHED):** `trout-meuniere` (BEGINNER — swapped from `sole-meuniere` because no `sole` ingredient slug exists), `soupe-au-pistou` (BEGINNER), `piperade` (BEGINNER).
- **Italian-American (3 PUBLISHED):** `chicken-parmesan` (BEGINNER), `spaghetti-and-meatballs` (INTERMEDIATE), `baked-ziti` (BEGINNER). First entries in this previously-empty enum cuisine.
- **Eastern European (3 PUBLISHED):** `pork-schnitzel` (BEGINNER), `cabbage-rolls` (INTERMEDIATE), `polish-potato-pancakes` (BEGINNER).
- **Greek (3 PUBLISHED):** `chicken-souvlaki` (BEGINNER), `tzatziki` (BEGINNER), `stifado` (INTERMEDIATE).
- **North African (3 PUBLISHED):** `koshari` (INTERMEDIATE — first Egyptian dish), `chicken-tagine-with-olives` (INTERMEDIATE), `moroccan-lentil-soup` (BEGINNER).
- **Difficulty mix:** 10 BEGINNER (67%) / 5 INTERMEDIATE (33%) / 0 ADVANCED. Inside the 60–75% / 25–40% target.
- **Voice-check.** 9 of 15 (60%) clean on first pass. 5 required one fix round (all first-attempt successful), 1 had warning-only that was deliberately kept. Patterns: em-dash appositive pair in sourceNotes (1, `chicken-tagine-with-olives` — already covered by an existing common-issues entry); `servings`+`yieldDescription` both set (1, `cabbage-rolls` — cross-category rule §3 caught it); JSON syntax (missing `}` after text mark) in body content (2, `stifado` + `koshari` — same structural slip on the closing paragraph); ingredient slug naming (1, `brown-lentils` vs master `lentils-brown` in `koshari`); "target" verb tripping the Target brand-warn (1, `polish-potato-pancakes`); "fall" Americanism (1, `stifado`).
- **6 new glossary terms** created: `beurre-noisette`, `pistou`, `piment-d-espelette`, `dakka`, `smen`. (`panade` reused — already existed.)
- **No master-table additions.** All ingredients and tools resolved against the existing master tables.

**Patterns observed but not yet at 3+ threshold for `docs/common-issues.md`:**

- JSON syntax — missing `}` for text mark in TipTap content (2 drafts). The closing paragraph's content array, where `[{ "type": "text", "text": "..." }]` was written as `[{ ... "..." ]`. Caught by the upload script's JSON parser, not by voice-check.
- "target" false-positive on the Target brand-warn (1 draft). The lowercase verb / noun sense trips the brand match. Workaround: avoid the word "target" as a verb in prose; "aim for" works.
- Ingredient slug naming inconsistency in the lentils family (`lentils-brown` / `lentils-green` / `lentils-black-beluga` vs the odd-ones-out `red-lentils` and `puy-lentils`). Authors guess and miss.

**Report.** `docs/bulk-batch-007-report.md` for the full account.

**Out.** No schema changes; no voice-check CLI edits; no master-table additions; no admin/UI work.

### Autopilot — Cooking bulk-008 ✅ landed 2026-05-17

**Goal.** Third autopilot fire of the cooking stream. Continue draining under-represented enum cuisines (spanish, greek, middleEastern, persian, caribbean, angloIndian) that the DB still shows under 15 each.

**Outcome.** 15 PUBLISHED, 0 dropped. Scaled fire — 15 recipes rather than the nominal 50, following batch 007 precedent. Cooking now sits at 519 PUBLISHED, up from 504.

- **Pre-flight gates** all passed: no double-fire, batch number = 008 (auto-detected from existing reports plus archived 001–006), 1,778 in-scope backlog candidates remaining, voice-check error trend flat across batches 005 (13) → 006 (13 / 10 recipes) → 007 (5 / 15) — not trending up, no autopilot-chain (chain = 0 — multiple human commits since bulk-007).
- **Spanish (3 PUBLISHED):** `pan-con-tomate` (BEGINNER), `salmorejo` (BEGINNER), `fabada-asturiana` (INTERMEDIATE).
- **Greek (3 PUBLISHED):** `greek-salad` (BEGINNER), `briam` (BEGINNER), `saganaki` (BEGINNER). Distinct from batch 007's three Greek picks.
- **Levantine / Middle Eastern (3 PUBLISHED):** `mutabal` (BEGINNER), `labneh` (BEGINNER), `foul-medames` (BEGINNER — first Egyptian breakfast dish).
- **Persian (2 PUBLISHED):** `ash-e-reshteh` (INTERMEDIATE), `salad-e-shirazi` (BEGINNER). First Persian additions beyond `khoresh-fesenjan`.
- **Caribbean (2 PUBLISHED):** `cuban-black-beans` (BEGINNER), `arroz-con-pollo` (INTERMEDIATE).
- **Anglo-Indian (2 PUBLISHED):** `country-captain` (INTERMEDIATE), `vegetarian-kedgeree` (INTERMEDIATE).
- **Difficulty mix:** 10 BEGINNER (67%) / 5 INTERMEDIATE (33%) / 0 ADVANCED. Inside the 60–75% / 25–40% target.
- **Voice-check.** 5 of 15 (33%) clean on first pass; 10 needed one fix; every fix landed first try. Blocking errors fixed: 1 "honest" softener in sourceNotes (`greek-salad`), 1 "genuinely" filler (`labneh`), 2 em-dash pairs in sourceNotes (`foul-medames`, `cuban-black-beans`), 1 "stove" americanism (`foul-medames`), 1 "molasses" americanism on the pomegranate-molasses ingredient name (`mutabal`), 1 bad ingredient slug `flaked-almonds` → `almonds-flaked` on upload (`country-captain` — same slug-naming inconsistency pattern as batch 007's `brown-lentils` → `lentils-brown`).
- **15 new glossary terms** created: `ramallet`, `salmorejo-cordobes`, `fabes-de-la-granja`, `horiatiki`, `ladera`, `kefalograviera`, `tahini`, `whey`, `foul-bean`, `kashk`, `reshteh`, `lime-persian`, `sofrito`, `adobo`, `khichdi`.
- **No master-table additions.** All ingredients and tools resolved against existing master tables. One slug-correction (`flaked-almonds` → `almonds-flaked`); not an addition.

**Patterns observed but not yet at 3+ threshold for `docs/common-issues.md`:**

- Banned-phrase softeners ("honest", "genuinely") in sourceNotes (2 drafts). The model writes sourceNotes in a slightly more conversational register and reaches for banned softeners there even when the body is clean.
- Adjective-set tricolons in cuisine-positioning closers (4 drafts). Already covered by the `[warn]`-level tricolon rule; rate is consistent with prior batches.
- Brand-warn false-positives on common verbs (1 draft, "flake" in `vegetarian-kedgeree`). Same shape as batch 007's "target" false-positive; rule-tightening would help but is outside autopilot scope.

**Report.** `docs/bulk-batch-008-report.md` for the full account.

**Out.** No schema changes; no voice-check CLI edits; no master-table additions; no admin/UI work.

### Autopilot — Mindset bulk-001 ✅ recovered 2026-05-17

**Goal.** Recover the bulk-001 batch that the 2026-05-16 mindset autopilot drafted and voice-checked clean but couldn't upload (the Prisma migration `20260619000000_phase_categories_targets_001` was pending in prod). The cooking + baking autopilot fires that followed pushed commits, the deploy ran the migration, the schema is now current.

**Outcome.** 20 PUBLISHED on first attempt — 0 retries used, 0 dropped. Mindset 0 → 20. Category crosses the 10-row public threshold and is now `Public: ✓` in the counts grid.

- **Pre-flight gates** all passed: AUTOPILOT_PAUSED unset, no double-fire (last claude/* branch was 6 days old, unrelated to mindset), batch number auto-determined to 001 (no prior report in `docs/`), backlog drain pass-through (well under threshold, ~2,945 in-scope candidates), quality-drift pass-through (first real batch report on disk), chain cap pass (chain = 0).
- **Recovery path executed.** Restored 20 archived briefs from `docs/archive/mindset-bulk-001-briefs/` to `docs/mindset-bulk-001-briefs/`. Voice-check re-ran (12 clean, 8 warning-only — same Anchor + fall false-positives documented previously, 0 blocking errors). Uploaded all 20 with `--status PUBLISHED` against the now-current schema.
- **Practice-type spread (15 PRACTICE):** TAPPING x2 (mum guilt, "I'm always behind"), ENERGY_STATEMENT x1 (safe and steady with money today), AFFIRMATION x2 (enough as I am, right now is enough), SPELL x1 (bedside salt bowl), RITUAL x2 (one small daily pleasure, five-minute evening download), ACTIVITY x2 (twenty in wallet for a week, one small luxury today), JOURNAL_PROMPT x2 (empty the head, what can wait until tomorrow), VISUALISATION x1 (reservoir that refills itself), MEDITATION x1 (4-7-8 breath for sleep), EMBODIMENT x1 (hand on chest, you were doing your best).
- **READING type-intros (5):** `how-affirmations-work`, `how-spells-work`, `activities-as-practice`, `how-visualisations-work`, `how-embodiment-works`. Pair with the 5 practice types that previously lacked type-intros.
- **Life-category mentions across `practiceTargets`:** Anxiety 10, Money 8, Self-worth 7, Sleep 7, Abundance 6, Stuck 5, Confidence 5, Time 4, Joy 3, Fear 3, Spirituality 2, Motherhood / Forgiveness / Grief / Body / Energy 1 each. Reasonable pilot mix; bulk-002 onward will weight under-represented life areas (Friendship, Creativity, Big-picture identity, Trauma, Sexuality, Spiritual depth).
- **All 20 are BEGINNER** by design (pilot slice). Subsequent bulks rotate in INTERMEDIATE / ADVANCED practices for spread.
- **No new patterns.** Anti-tells, common-issues unchanged. The prior fire already captured the two patterns it surfaced (em-dash pairs in source-attribution prose, glossary terms registered on type-intro READINGs creating false coverage requirements).
- **Voice-check rule gaps still flagged** for the Mindset-voice-check-extension worker: `brand-trademark "Anchor"` mindset-category exception, `price-mention` softening for specific-banknote practices, `medical-claim "treats"` sense-blindness on verb uses.

**Report.** `docs/mindset-bulk-001-report.md`.

**Out.** No schema changes; no voice-check CLI edits; no edits to `docs/mindset-author.md`; no new TipTap blocks; no plan-generator work.

### AI image verification — pipeline wire-up + sweep scaffolding ✅ landed 2026-05-17

**Goal.** Every hero image (free-source or AI-generated) gets compared against its tutorial before going live. Wrong-dish images get caught and re-sourced; correct ones get stamped `VERIFIED`. The judgement runs inside the worker session itself (Claude Code's built-in multimodal Read) — no paid AI API.

**Outcome.** Schema + orchestrator hook + sweep CLI + admin KPI all landed. The retroactive sweep on the existing ~500 PUBLISHED tutorials is deferred to a follow-up worker (resume scope captured below) because (a) the migration needs to land on prod before the sweep runs, and (b) image-viewing burns context fast — 50 per batch is realistic, not 500 in one go.

**What landed:**

- **Schema** (`phase_image_verification_001`, additive). `Media.verificationStatus` enum (`UNVERIFIED | VERIFIED | REJECTED | REJECTED_USED_PROCEDURAL`, default UNVERIFIED), `verificationReason` (Text), `verifiedAt` (DateTime). Index on `verificationStatus`. Existing rows default to UNVERIFIED so the sweep picks them up.
- **Orchestrator hook.** `sourceHeroImage` gains a `verify` callback option + `excludeSources`. With a callback, the orchestrator iterates sources, verifies each candidate, advances on rejection, falls through to Flux Schnell, and returns `REJECTED_USED_PROCEDURAL` when even Flux fails verification. Without a callback (legacy callers), behaviour is unchanged and `verificationStatus` defaults to `UNVERIFIED` so the sweep cleans it up later.
- **Verify helper** (`apps/web/src/lib/image-sourcing/verify.ts`). `VerifyImageInput` / `VerifyImageResult` / `VerifyImageFn` contract, `downloadToCache` for local image caching, `buildVerificationPromptHints` that turns the tutorial metadata into a verdict rubric for the worker.
- **Sweep CLI**, two scripts in `packages/db/scripts/`:
  - `verify-media-batch.ts` — pulls N UNVERIFIED Media rows, downloads each image to `.claude/tmp/verify-cache/`, writes a manifest to `docs/image-verification-queue.json` with prompt hints. The worker reads the manifest, opens each `imagePath` with the Read tool, judges, writes verdicts.
  - `apply-media-verdicts.ts` — reads the worker's verdicts file, stamps VERIFIED rows, marks rejected ones and re-sources a replacement (excluding the rejected source). Snapshots a TutorialVersion before each mutation. Writes an AuditLog + a per-run JSON report.
- **Authoring prompts.** `docs/tutorial-author.md` gets the verification rubric inline (accept criteria, reject criteria, two integration paths — `verify` callback for inline, sweep CLI for batch). `docs/baking-author.md` + `docs/mindset-author.md` reference the same rubric with category-specific reject criteria (sourdough vs supermarket loaf for baking; quiet practice vs glossy gym-wellness for mindset).
- **Admin KPI.** `/admin/system/autopilot` gains an "Image verification" panel — 4 KPIs (verified / unverified / rejected / used procedural) + a coverage % so Rebecca can eyeball how much of the published library has been reviewed.

**Resume scope for the sweep.** Next worker (Sonnet, model per `feedback_model_choice.md`):

1. After this migration has landed on prod (`gh run watch` green), pull origin/main fresh.
2. `pnpm --filter @homemade/db exec tsx scripts/verify-media-batch.ts --batch-size 50` to enqueue.
3. Read `docs/image-verification-queue.json`. For each `entries[i]`, open `entries[i].imagePath` with Read, evaluate against the `promptHints`, accumulate a verdict.
4. Write `docs/image-verification-verdicts.json` of shape `{ "verdicts": [{ "mediaId", "verdict", "reason" }] }`.
5. `pnpm --filter @homemade/db exec tsx scripts/apply-media-verdicts.ts` to commit.
6. Repeat until `verify-media-batch.ts` returns 0 entries.

**Scope respected.** No paid AI API. No schema changes beyond the additive Media columns. No content authoring. No homepage / mobile / non-admin UI work. No edits to feedback memory files or page-design docs.

**Out.** No recurring cron — the sweep clears the backlog once and stays clean because every new authoring run verifies its own image. No edits to upload-tutorial.ts (new Media rows default to UNVERIFIED at DB level). Hero-attribution component unchanged — verificationStatus is admin-only, not public.

### Image verification sweep — batches 001-004 + cycle-fix ◎ partial 2026-05-17

**Goal.** Drain the ~537 UNVERIFIED hero Media rows the pipeline wire-up left behind by walking 50-row batches: open each cached image with Claude Code's multimodal Read, decide VERIFIED / REJECTED, write a verdicts file, and run `apply-media-verdicts.ts` to commit.

**Outcome.** Four batches landed (commits `a8af46d`, `caf99d7`, `bd1f253`, `c3f0dd3`). **64 hero Media rows stamped VERIFIED**, **118 stamped REJECTED + a new UNVERIFIED Media row attached** via the orchestrator's free-provider chain. 0 deploy failures, `/healthz` 200 each round. Coverage on `/admin/system/autopilot`: **11.9%** (64 / 537). Remaining queue: **473 UNVERIFIED** rows.

| Batch | Commit | Verified | Re-sourced |
|-------|--------|----------|------------|
| 001 | `a8af46d` | 26 | 24 |
| 002 | `caf99d7` | 18 | 32 |
| 003 | `bd1f253` | 17 | 33 |
| 004 | `c3f0dd3` |  3 | 29 |

**Cycle-fix (`05b8a3a`).** Batches 001-003 stalled because `apply-media-verdicts.ts` built `excludeSources` from `media.source` only — the single most-recent rejected slot. After a tutorial cycled through pexels and unsplash in successive batches, the next round excluded only the latest and the orchestrator happily returned the original rejected image. 17 / 32 re-source attempts in batch 003 were byte-identical to batch 001's rejected images.

Fix is two pieces:

- **Schema** (`20260624000000_tutorial_excluded_image_sources`). Adds `Tutorial.excludedImageSources String[] @default([])` — a Postgres native array holding ImageSource slugs the sweep has already rejected for this tutorial across all runs. Default `[]` covers existing rows; no backfill needed.
- **Script.** `apply-media-verdicts.ts` now reads `tutorial.excludedImageSources` before re-sourcing, pushes the just-rejected slot onto the array *before* calling `sourceHeroImage` (so a mid-run crash still records progress), and caps at 3 distinct real-photo rejections (`unsplash` / `pexels` / `wikimedia` / `pixabay`). After 3 rejections the script explicitly excludes every remaining real-photo source so the orchestrator falls straight through to `flux-schnell`. New `rejectedForcedToFlux` counter on the apply summary surfaces how many slugs hit the cap each run.

Verified working in production after batch 004:

    afghan-cookies               excludedImageSources=["pexels"]
    air-fryer-cauliflower-steaks excludedImageSources=["pexels"]
    air-fryer-courgette-fries    excludedImageSources=["pixabay"]
    bara-brith                   excludedImageSources=["pexels"]
    battenberg-cake              excludedImageSources=["pixabay"]
    bourbon-biscuits             excludedImageSources=["pexels"]
    buttermilk-fried-chicken     excludedImageSources=[]   (verified)
    baked-vanilla-cheesecake     excludedImageSources=[]   (verified)

**Halt reason — QUALITY_DRIFT.** Batch 004 verified 3 / rejected 29 (90.6%). All 32 entries were cycled slugs from batches 001-003 (afghan-cookies, air-fryer-*, apple-*, bara-brith, battenberg-cake, bourbon-biscuits, bread-*, brioche-loaf, brownie-batter-bites, bubble-and-squeak, cacio-e-pepe, caramelized-onion-bacon-and-parmesan-risotto, etc.). The rejection rate is structural — these are slugs the free stocks reliably mis-index (ingredient-shot tropes, raw-prep shots, wrong-cuisine matches, off-topic text-matches) — not a regression. None hit the 3-rejection cap yet because the column only just landed; each slug has exactly one recorded rejection going into the next sweep.

**Resume scope.** Next worker (Sonnet) runs batches 005-007 to keep accumulating rejections. By batch 006-007 the worst offenders should have 3 distinct real-photo sources in `excludedImageSources` and the next pass forces them to Flux. Verified coverage is likely to plateau around 30-50% with the residue going AI-illustrated or `PROCEDURAL_CARD` depending on which path Rebecca prefers (both options analysed in `docs/image-verification-sweep-2026-05-17-cycle-fix.md`).

**Files landed.**

- `packages/db/prisma/schema.prisma` — `Tutorial.excludedImageSources`.
- `packages/db/prisma/migrations/20260624000000_tutorial_excluded_image_sources/migration.sql`.
- `packages/db/scripts/apply-media-verdicts.ts` — accumulator + 3-rejection cap + `rejectedForcedToFlux` counter.
- `docs/image-verification-sweep-2026-05-17.md` (batches 001-003 report, prior worker).
- `docs/image-verification-sweep-2026-05-17-cycle-fix.md` (cycle-fix + batch 004 report, this session).
- `docs/image-verification-queue.json` / `image-verification-verdicts.json` / `image-verification-apply-2026-05-17.json` — batch 004 manifest, verdicts and apply summary.

**Scope respected.** No paid AI API (verification still runs inside the Claude Code session via multimodal Read). No changes to the orchestrator. No changes to authoring rubric. No new image sources. No autopilot SKILL.md touches.

### Autopilot — Baking bulk-002 ✅ landed 2026-05-17

**Goal.** Second autopilot fire of the baking stream. Drain under-represented sub-categories in baking — pies, pastries, biscuits, scones, sweets-confectionery and cake-decorating — and rest the heavier bread + cakes from bulk-001.

**Outcome.** 50 PUBLISHED, 0 dropped. Clean upload pass on first attempt — 50/50 ok on run 1 (a step up from bulk-001's 4-run iteration). Baking now sits at 109 PUBLISHED, up from 64.

- **Pre-flight gates** all passed: AUTOPILOT_PAUSED unset, no double-fire (most recent claude/* branch was 6 days old), batch number auto-determined to 002 (reading from `docs/archive/baking-bulk-001-report.md`), backlog drain check pass (well over 50 in-scope candidates remaining in baking + recipe-adjacent sections), quality-drift check noted as pass-through (only 1 prior baking report exists; the trend check needs 3), chain cap pass (chain = 0; recent autopilot fires were cooking, not baking).
- **Pies (13 PUBLISHED):** `pumpkin-pie-thanksgiving`, `pecan-pie-classic`, `key-lime-pie-florida`, `cherry-pie-double-crust`, `blueberry-pie-double-crust`, `strawberry-rhubarb-pie`, `bakewell-tart-cherry`, `tarte-tatin-apple`, `banoffee-pie`, `lemon-tart-au-citron`, `pasteis-de-nata`, `tarte-aux-pommes`, `plum-frangipane-tart`.
- **Pastries (11 PUBLISHED):** `croissants-laminated`, `pain-au-chocolat`, `kanelbullar-cardamom-cinnamon`, `chelsea-buns-currant`, `hot-cross-buns-spiced`, `cinnamon-morning-buns-laminated`, `mille-feuille-napoleon`, `palmiers-caramelised`, `choux-pastry-base`, `gougeres-cheese-choux`, `almond-croissants-leftover`.
- **Biscuits (10 PUBLISHED):** `shortbread-fingers`, `millionaires-shortbread`, `macarons-french-vanilla`, `brandy-snaps-cream-filled`, `gingerbread-biscuits-cutter`, `hobnobs-oat-biscuits`, `anzac-biscuits`, `lebkuchen-christmas`, `snickerdoodles-cinnamon`, `custard-creams-homemade`.
- **Scones (7 PUBLISHED):** `plain-scones-afternoon-tea`, `cherry-scones`, `buttermilk-scones-american`, `treacle-scones-scottish`, `sourdough-scones`, `american-biscuits-buttermilk`, `rock-cakes-currant`.
- **Sweets-confectionery (6 PUBLISHED):** `honeycomb-cinder-toffee`, `salted-caramels-soft`, `chocolate-truffles-ganache`, `tempered-dark-chocolate`, `turkish-delight-rosewater`, `toffee-hard-crack`.
- **Cake-decorating (3 PUBLISHED, TECHNIQUE type):** `royal-icing-piping-consistencies`, `ganache-drip-finish`, `swiss-meringue-buttercream`.
- **Difficulty mix:** 19 BEGINNER (38%) / 24 INTERMEDIATE (48%) / 7 ADVANCED (14%). Deliberate skew toward beginner to give the library more accessible entry points after bulk-001's 8 / 31 / 11 mix.
- **Voice-check.** All 50 clean on first pass — 0 blocking errors. 9 advisory warnings across 6 files (3 × "fall" americanism false-positives on verb uses, 3 × brand-trademark mentions in genuine sourceNotes citations, 2 × tricolons, 1 × "target temperature" false-positive). None worth rewriting.
- **No master-table additions.** All 50 briefs resolved against the existing 633 ingredients and 188 tools. One pre-upload slug-correction batch (`balloon-whisk` → `whisk-balloon` on 7 files, applied before voice-check). The pre-flight em-dash scan + slug audit caught the failure modes that surfaced at upload-time in bulk-001.

**Patterns to carry forward (already in the report, summarised):**

- **Pre-flight em-dash scan before voice-check.** A node script walks the briefs dir, flags any line with 2+ em-dashes. Caught 10 em-dash appositive pairs before upload — the dominant failure mode in baking. Recommended for every future bulk fire.
- **Slug audit against worktree's `ingredients.ts` and `tools.ts` before voice-check.** Same shape — walks all briefs, confirms every ingredient and tool slug resolves. Caught the `balloon-whisk` typo cheaply.
- **Tool naming convention is `noun-modifier`, not `modifier-noun`.** Same as the cooking pattern. Already documented in baking-anti-tells; worth keeping front of mind.

**Cumulative baking sub-category fill after bulk-002:** bread 13, cakes 13, pies 19, pastries 20, biscuits 18, scones 12, sweets-confectionery 13, cake-decorating 5. The next baking bulk should rotate bread + cakes back in to keep coverage even.

**Report.** `docs/baking-bulk-002-report.md` for the full account.

**Out.** No schema changes; no voice-check CLI edits; no master-table additions; no admin/UI work; no edits to `docs/baking-author.md`, `docs/baking-anti-tells.md`, or `docs/common-issues.md` (no patterns recurred 3+ times in this batch).

### Autopilot — Cooking bulk-009 ✅ landed 2026-05-17 (first single-queue fire; small slice — Opus-model concession)

**Goal.** First fire of the new `autopilot-queue` single-queue round-robin (the merged successor of the per-stream cooking / baking / mindset autopilots). Round-robin picked cooking from the slate of 4 READY categories (oldest `lastAutopilotRunAt` = null with launchOrder = 1 as the tiebreaker).

**Outcome.** 3 PUBLISHED, 0 dropped. Cooking moved from 518 → 521. The full new round-robin pipeline (pick → claim → draft → voice-check → upload → report → commit → push → deploy verify) executed end-to-end. **Model mismatch flagged:** the fire self-identified as Claude Opus 4.7 despite the SKILL.md frontmatter setting `model: claude-sonnet-4-5`; runner not honouring the frontmatter. I scaled the slice down sharply (3 recipes vs the 15-recipe precedent of batches 007/008) to limit Opus-cost exposure while still validating the full pipeline. Rebecca to verify the scheduled-tasks runner config on the next fire.

- **Pre-flight gates** all passed: no AutopilotPauseState row paused on `queue` or `global`; AUTOPILOT_PAUSED env unset; round-robin pick chose cooking (publishedCount 518/7000, lastAutopilotRunAt null, launchOrder 1); claim updated `Category.lastAutopilotRunAt = 2026-05-17T13:07:34.947Z` before drafting; no double-fire (no claude/* branches with commits to cooking bulk dirs in the last 2h); quality-drift check pass (batches 006/007/008 first-pass clean rates 50%/60%/33% — single-batch dip in 008, not a sustained >50% upward error trend); chain cap pass (no run of 10+ consecutive autopilot commits — recent log shows heavy interleaving with admin work); batch number auto-determined to 009 from `docs/bulk-batch-008-report.md`; cooking author prompt found at `docs/tutorial-author.md`.
- **Recipes published (3 Anglo-Indian):** `aloo-gobi` (BEGINNER, vegan), `saag-paneer` (BEGINNER, vegetarian), `chicken-dopiaza` (BEGINNER). All beginner; single-cuisine slice — the small size doesn't allow a balanced difficulty/cuisine mix.
- **Voice-check.** 1 of 3 needed a fix on the first voice-check run (`aloo-gobi`, 3 errors: appositive em-dash pair in body paragraph 2 + "essentially" banned softener in the same paragraph; both fixed in one round). 2 of 3 cleared on the first voice-check pass (after self-critique caught + fixed an appositive em-dash pair on `saag-paneer` and a scaling-token disambiguation on `chicken-dopiaza` before voice-check ran). Voice-check first-pass clean: 2/3 (67%). All cleared within one retry.
- **Master-list additions.** None this batch. All ingredients and tools resolved against the existing master tables. Glossary terms created: 3 (`saag`, `paneer`, `dopiaza`); the other 3 referenced (`tarka`, `bhuna`, `soffritto`) already existed in the DB from prior batches.
- **Patterns observed (1-2 instances each, below the 3+ threshold for `common-issues.md`):** (a) scaling-token disambiguation when one ingredient appears in two ingredientsList rows with different prepNotes — token resolves against the first row, the prose either matches that row or drops the token; (b) self-critique missing em-dash pairs in mid-body paragraphs despite explicit scan — voice-check catches them, but the rate suggests the v5 self-critique step 4 (em-dash count) needs more attention; (c) "essentially" used as a softener — same pattern as bulk-008's sourceNotes "honest" hit.

**What carries forward:**

- **Model verification on the next fire.** If autopilot-queue fires again and self-identifies as Opus when the SKILL.md says Sonnet, the runner is the issue (not the prompt). Worth a config check on the scheduled-tasks runner before the next fire.
- **Continue under-represented cuisines.** Anglo-Indian moved from 19 → 22; modern `indian` (the regional enum, separate from `angloIndian`) is still at 2 but has no backlog (deferred to v2 per recipe-backlog header). Persian still at 2; Mediterranean / Spanish / Greek / Levantine / Caribbean all between 12-15 and worth weighting toward.
- **Rebalance difficulty mix.** This batch was 100% BEGINNER; a 15-recipe batch will naturally restore the 60-75% / 25-40% target.

**Report.** `docs/bulk-batch-009-report.md` for the full account.

### Autopilot — Cooking bulk-010 ✅ landed 2026-05-17 (parallel-burner loop, quota burn-down)

**Goal.** Weekly Max quota burn-down before reset. Parallel-burner loop session pinned to cooking (not round-robin). Target: 15 recipes, multi-cuisine spread.

**Outcome.** 15 PUBLISHED, 0 dropped. Cooking moved from 521 → 536. Five cuisine families covered: caribbean (3), easternEuropean (3), turkish (2), levantine (1), northAfrican (4), persian (2). Difficulty mix: 10 BEGINNER (67%) / 5 INTERMEDIATE (33%).

- **Pre-flight gates** all passed: AutopilotPauseState not paused on cooking or global streams; no double-fire (slot claimed by setting `Category.lastAutopilotRunAt` before drafting).
- **Recipes published (15):** jerk-chicken, brown-stew-chicken, rice-and-peas (caribbean); borscht, beef-stroganoff, goulash (easternEuropean); menemen, mercimek-corbasi (turkish); tabbouleh (levantine); shakshuka, harira, zaalouk, kefta-skewers (northAfrican); khoresh-fesenjan, joojeh-kebab (persian).
- **Voice-check.** 5 of 15 clean on first pass (33%). All 10 that needed fixes cleared on first retry. Errors: 6 em-dash appositive pairs, 2 banned phrases ("genuinely"), 1 americanism ("stove" → "hob"), 6 invalid ingredient slugs. 4 WARNs accepted (all false positives or policy-accepted token slugs).
- **Slug corrections logged.** Wrong guesses: rice-long-grain → long-grain-rice; kidney-beans-tin → kidney-beans; tomato-paste → tomato-puree; butter → unsalted-butter; flat-leaf-parsley → parsley-flat; chicken-drumstick (not in master table).
- **Master-list additions.** None. Glossary terms created: jerk, joojeh, khoresh, fesenjan, browning-technique, menemen, tabbouleh, shakshuka, harira, kefta (10 new terms).

**Report.** `docs/bulk-batch-010-report.md` for the full account.

**Out.** No schema changes; no voice-check CLI edits; no master-table additions; no admin/UI work; no edits to `docs/tutorial-author.md`, `docs/voice-editor-prompt.md`, or `docs/common-issues.md` (no patterns recurred 3+ times in this batch).

### Autopilot — Cooking bulk-011 ✅ landed 2026-05-17 (loop continuation)

**Goal.** Loop continuation (context overflow from prior bulk-010 session). 15 recipes across four underserved classic-cuisine families: Italian pasta canon, French bistro, British-Indian, British comfort.

**Outcome.** 15 PUBLISHED, 0 dropped. DB count after batch: **527 PUBLISHED** (per `category-counts.ts` live query). 3 net-new entries (spaghetti-aglio-olio, moules-marinieres, tarka-dhal); 12 existing entries refreshed with voice-checked content.

- **Cuisine split:** Italian 5 (carbonara, aglio e olio, puttanesca, risotto porcini, al pomodoro), French 4 (boeuf bourguignon, coq au vin, moules marinières, ratatouille), British-Indian 3 (chicken korma, tarka dhal, chana masala), British 3 (cottage pie, shepherd's pie, fish and chips).
- **Difficulty:** 12 BEGINNER (80%) / 3 INTERMEDIATE (risotto, boeuf bourguignon, fish and chips).
- **Voice-check:** 4 of 15 clean on first pass. 9 needed em-dash pair fixes; 3 needed "genuinely" removal. All cleared on first retry within session.
- **New ingredients seeded:** `dried-chilli`, `amchur` (641 total after seed).
- **New glossary terms:** amchur, chana, dhal, beer-batter, blanching-chips, cottage-pie, shepherds-pie (7 new; several others pre-existed).
- **Slug corrections:** `bay-leaf` → `bay-leaves`, `flaked-almonds` → `almonds-flaked`, `large-casserole` → `dutch-oven`, `large-frying-pan` → `frying-pan-30`, `potato-masher` → `masher`, `baking-dish` → `rectangular-baking-tin`, `digital-thermometer` → `instant-read-thermometer`, plus multiple ingredient slug normalisation (ground-cumin → cumin-ground etc).

**Report.** `docs/bulk-batch-011-report.md`.

**Out.** No schema changes; no admin/UI work.

### Cooking bulk-016 ✅ landed 2026-05-18

**Goal.** Autopilot-queue loop (parallel burner session). American cuisine — BBQ, comfort food, diners, breakfasts, sandwiches.

**Outcome.** 40 recipes authored and uploaded PUBLISHED. Cooking 656 → 681 (+25 net new; 15 already existed as PUBLISHED from earlier runs).

- **Composition:** American mains × 12 (pulled-pork, mississippi-pot-roast, beef-chili, american-pot-roast, chicken-and-dumplings, chicken-pot-pie, chicken-rice-casserole, king-ranch-chicken, southern-fried-chicken, salisbury-steak, sloppy-joe, stuffed-bell-peppers) / sandwiches × 8 (cheeseburger, blt-sandwich, club-sandwich, french-dip, lobster-roll, patty-melt, reuben-sandwich, monte-cristo-sandwich) / BBQ × 1 (bbq-pork-ribs) / breakfasts × 9 (buttermilk-pancakes, hash-browns, eggs-benedict, eggs-royale, french-toast, waffles, breakfast-burrito, biscuits-and-gravy, huevos-rancheros) / sides × 3 (american-cornbread, coleslaw, macaroni-and-cheese) / stews × 5 (beef-stroganoff, chicken-gumbo, jambalaya, shrimp-and-grits, chicken-and-waffles) / meatloaf × 1 / grilled-cheese × 1.
- **Difficulty:** 35 BEGINNER / 5 INTERMEDIATE.
- **New ingredients seeded:** bbq-sauce, salsa, pepperoncini.
- **Report:** `docs/bulk-batch-016-report.md`.

### Cooking bulk-018 ✅ landed 2026-05-18

**Goal.** Autopilot-queue loop (parallel burner session). European — Greek, French, Italian, Spanish, Flemish.

**Outcome.** 40 recipes uploaded PUBLISHED (all updates to existing records, 13 newly PUBLISHED). Cooking 730 → 743 (+13 net new).

- **Composition:** French × 12 (poulet-chasseur, poulet-a-la-creme, poulet-a-lestragon, canard-aux-cerises, magret-de-canard, lapin-a-la-moutarde, poule-au-pot, boeuf-en-daube, moules-a-la-creme, coquilles-saint-jacques, carbonnade-flamande, truite-aux-amandes) / Italian × 8 (ossobuco-alla-milanese, saltimbocca-alla-romana, pollo-alla-cacciatore, cacio-e-pepe, pasta-e-fagioli, risotto-ai-funghi, ribollita, choucroute-garnie) / Greek × 10 (bifteki, grilled-octopus-greek, gyros-pork, kakavia, lamb-fricassee-greek, souvlaki-chicken, souvlaki-lamb, souvlaki-pork, tiropita, whole-grilled-bream-greek) / Spanish × 10 (arroz-caldoso-marisco, cordero-al-chilindron, espinacas-con-garbanzos, huevos-a-la-flamenca, merluza-en-salsa-verde, migas-extremenas, pinchitos-morunos, pollo-en-pepitoria, sopa-de-ajo, steak-tartare).
- **Difficulty:** 32 BEGINNER / 8 INTERMEDIATE.
- **New ingredients seeded:** none.
- **Report:** `docs/bulk-batch-018-report.md`.

### Cooking bulk-017 ✅ landed 2026-05-18

**Goal.** Autopilot-queue loop (parallel burner session). Middle Eastern, Levantine, and Persian cuisine.

**Outcome.** 40 recipes authored and uploaded PUBLISHED. Cooking 681 → 721 (+40 net new).

- **Composition:** Levantine × 20 (hummus, tabbouleh, mutabal, fattoush, shakshuka, falafel, shawarma-chicken, mujadara, kafta-bil-sanieh, shish-taouk, stuffed-vine-leaves, bamia, koshari, ful-medames, manakish-zaatar, lahmacun, labneh, muhammara, maqluba, musakhan) / Persian × 16 (tahdig, zereshk-polo, fesenjan, ghormeh-sabzi, joojeh-kabab, kabab-koobideh, khoresh-bademjan, ash-e-reshteh, adas-polo, salad-shirazi, mast-o-khiar, baghali-polo, mirza-ghasemi, kuku-sabzi, kibbeh) / Cross-regional × 4 (green-shakshuka, shorbat-adas, baklava, fatayer-spinach).
- **Difficulty:** 30 BEGINNER / 10 INTERMEDIATE.
- **New ingredients seeded:** barberry, rosewater, dried-lime, fava-beans-dried, pomegranate-seeds.
- **Report:** `docs/bulk-batch-017-report.md`.

### Cooking bulk-015 ✅ landed 2026-05-18

**Goal.** Autopilot-queue cron (context-resumed continuation from prior session). Italian cuisines — pasta, risotto, chicken, fish/seafood — plus Turkish.

**Outcome.** 40 recipes authored and uploaded PUBLISHED. Cooking 616 → 656 (+40 net new).

- **Cuisine split:** Italian pasta × 12 (bucatini-allamatriciana, linguine-al-granchio, orecchiette-con-cime-di-rapa, pappardelle-al-ragu-di-anatra, penne-alla-boscaiola, penne-alla-vodka, pici-cacio-e-pepe, spaghetti-alla-gricia, spaghetti-alle-cozze, spaghetti-al-limone, spaghetti-al-tonno, tagliatelle-al-ragu-bolognese) / Italian risotto × 6 (agli-asparagi, al-gorgonzola, alla-zucca, alle-cozze, al-limone, con-piselli) / Italian meat × 3 (pollo-al-limone, pollo-alla-diavola, pollo-alla-pizzaiola) / Italian fish × 4 (acqua-pazza, branzino-al-forno, fritto-misto-di-mare, zuppa-di-pesce-italiana) / Italian other × 6 (arancini-al-ragu, insalata-di-rinforzo, pappa-al-pomodoro, polenta-con-ragu, ravioli-di-ricotta-e-spinaci, sigara-boregi) / Turkish × 9 (adana-kebabi, coban-salatasi, ezogelin-corbasi, iskender-kebab, karniyarik, manti, patlican-salatasi, pide-kiymali, yayla-corbasi).
- **Difficulty:** 27 BEGINNER / 13 INTERMEDIATE.
- **Voice-check:** 10/40 clean on first pass. Issues fixed: em-dash pairs (27 files — converted to parentheses), banned phrases `genuinely`/`essentially`/`honest` (4 files), servings-yield conflict (3 discrete-item recipes: arancini, pide, sigara). Ingredient slug corrections: `risotto-rice` → `arborio-rice`, `vegetable-stock` → `stock-vegetable`, `paprika` → `paprika-sweet`, `cumin` → `cumin-ground`, `shallots` → `shallot`, `chicken-thighs` → `chicken-thigh`, `green-pepper` → `pepper-green`, `flatbread` → `pitta-bread`, `dried-oregano` → `oregano-dried`, `dried-yeast` → `yeast-fast-action`, `basil-fresh` → `basil`, `mint-fresh` → `mint`, `bulgur` → `bulgur-wheat`, `white-fish-fillets` → `cod-fillet`. Tool: `roasting-tin` → `roasting-pan`.
- **New ingredients seeded:** `whitebait`, `spinach-frozen`, `mint-dried`, `ciabatta` (4).

**Report.** `docs/bulk-batch-015-report.md`.

**Out.** No schema changes; no admin/UI work.

### Cooking bulk-014 ✅ landed 2026-05-18

**Goal.** Autopilot-queue cron (context-resumed continuation from prior session). International cuisines — Greek, Spanish, Eastern European, French.

**Outcome.** 40 recipes authored and uploaded PUBLISHED. Cooking 582 → 616 (+34 net new, 6 pre-existing entries updated).

- **Cuisine split:** Greek 10 (dolmades, yemista, fasolada, taramasalata, skordalia, melitzanosalata, tirokafteri, greek-roast-lamb, soutzoukakia, lemon-potatoes) / Spanish 10 (paella-mixta, croquetas-de-jamon, calamares-a-la-romana, chorizo-al-vino-tinto, patatas-alinadas, pimientos-de-padron, gambas-pil-pil, pulpo-a-la-gallega, empanada-gallega, chorizo-and-butter-bean-stew) / Eastern European 10 (kotlety-mielone, kotlety-schabowe, barszcz-czerwony, rosol, porkolt, lecso, blini, pelmeni, svickova-na-smetane, zurek) / French 10 (gigot-d-agneau, poulet-roti, poulet-basquaise, poulet-a-la-moutarde, quiche-lorraine, confit-de-canard, sole-meuniere, steak-au-poivre, pot-au-feu, bouillabaisse).
- **Difficulty:** ~27 BEGINNER / 13 INTERMEDIATE.
- **Voice-check:** ~9 of 40 clean on first pass. Issues fixed: em-dash pairs (26 files — converted to parentheses or colons/commas), JSON parse errors (4 files — trailing apostrophe on heading text strings), banned phrases "essentially" (1) + "genuinely" (2), ingredient slug corrections: `egg` → `eggs`, `breadcrumbs` → `breadcrumbs-dried`/`breadcrumbs-fresh`, `cumin` → `cumin-ground`, `cinnamon` → `cinnamon-ground`, glossaryTooltip `term` → `termSlug` attr (dolmades, taramasalata).
- **New ingredients seeded:** `padron-pepper` (1).

**Report.** `docs/bulk-batch-014-report.md`.

**Out.** No schema changes; no admin/UI work.

### Cooking bulk-013 ✅ landed 2026-05-18

**Goal.** Autopilot-queue cron (context-resumed continuation from prior session). British cooking classics — gravies, condiments, pies, braises, stews, broths, offal, pork, fish, Christmas accompaniments, regional dishes.

**Outcome.** 40 recipes PUBLISHED. Cooking 542 → 582.

- **Cuisine split:** all 40 british.
- **Difficulty:** 36 BEGINNER / 4 INTERMEDIATE (steak-and-kidney-pie, steak-and-mushroom-pie, oxtail-stew, roast-rack-of-lamb).
- **Voice-check:** ~12 of 40 clean on first pass. Issues fixed: em-dash parenthetical pairs (15 files), banned phrases "genuinely" (2) + "essentially" (3), servings-yield conflict (6 files — 2 nulled yieldDescription, 4 nulled servings for discrete-item yields), season values lowercase → uppercase (8 files).
- **New ingredients seeded:** 31 ingredients added to master table (`braising-steak`, `oxtail`, `pork-chop`, `rack-of-lamb`, `whole-chicken`, `lamb-kidneys`, `calves-liver`, `gammon-joint`, `gammon-steak`, `sausagemeat`, `chipolata-sausages`, `leftover-roast-beef`, `langoustine-tails`, `brown-shrimp`, `mackerel-fillets`, `caerphilly-cheese`, `lentils-red`, `apple`, `lemon-juice`, `smoked-paprika`, `cayenne-pepper`, `mace-ground`, `mustard-powder`, `nutmeg`, `peppercorns-black`, `breadcrumbs-panko`, `breadcrumbs-fresh`, `bread-white`, `guinness`, `dry-cider`, `dry-white-wine`).
- **Tool slug corrections:** `frying-pan` → `frying-pan-26`, `roasting-tin` → `roasting-pan`, `kitchen-shears` → `kitchen-scissors`.
- **Ingredient slug correction:** `chestnuts-cooked` → `chestnut-cooked`.

**Report.** `docs/bulk-batch-013-report.md`.

**Out.** No schema changes; no admin/UI work.

### Cooking bulk-012 ✅ landed 2026-05-17

**Goal.** Parallel-burner loop session targeting under-represented v1 cuisines: middleEastern, northAfrican, greek, spanish, easternEuropean.

**Outcome.** 15 recipes PUBLISHED. Cooking 527 → 542.

- **Cuisine split:** middleEastern 5 (hummus, cacık, shish taouk, İzmir köfte, İmam bayıldı), northAfrican 4 (kefta tagine, lamb tagine with prunes and almonds, chicken tagine with preserved lemon and olives, couscous with chicken and chickpeas), greek 2 (keftedes, moussaka), spanish 1 (pollo al ajillo), easternEuropean 3 (pierogi ruskie, pierogi z mięsem, chicken Kiev).
- **Difficulty:** 12 BEGINNER / 3 INTERMEDIATE (moussaka, pierogi ruskie, pierogi z mięsem, chicken Kiev).
- **Voice-check:** 7 of 15 clean on first pass. 8 needed fixes (em-dash pairs × 6, banned phrase "genuinely" × 2, Americanism "fall apart" × 3, servings-yield conflict × 2). All cleared on first retry.
- **Slug corrections:** `coriander-fresh` → `coriander`, `sour-cream` → `soured-cream`, `mushrooms` → `mushrooms-porcini-dried`, `breadcrumbs` → `breadcrumbs-dried`, `milk` → `whole-milk`, `butter` → `unsalted-butter`, `baking-dish` → `rectangular-baking-tin`, `whisk` → `whisk-balloon`.
- **New glossary terms:** allspice, ajillo (2 new).
- **Note:** `preserved-lemon` has no ingredient slug. Tagine-of-chicken recipe references preserved lemon as plain text (not a scaling token) with a prose note on sourcing. Flag for ingredient-seed session.

**Report.** `docs/bulk-batch-012-report.md`.

**Out.** No schema changes; no admin/UI work.

### Autopilot — Mindset bulk-002 ✅ landed (same-session recovery) 2026-05-17

**Goal.** Second mindset autopilot fire (first since bulk-001 recovered). Small slice sized for the Opus-model concession (the scheduled-tasks runner is still firing Opus despite the `model: claude-sonnet-4-5` frontmatter — same self-identification pattern as cooking bulk-009).

**Outcome.** 4 PUBLISHED, 0 dropped. Mindset 20 → 24. Initial upload halted on the same schema-drift class as bulk-001 (`Tutorial.requiresKiln` ColumnNotFound, pottery migration pending); the halt-commit push triggered a deploy that landed the migration, and the 4 voice-clean briefs uploaded as PUBLISHED on the second run inside the same fire — same shape as cooking bulk-006's same-session recovery.

- **4 PRACTICE briefs across 3 sub-categories:** AFFIRMATION x2 (`steady-steady-steady` from MONEY-v2/D4, `i-am-safe-even-when-the-number-is-small` from MONEY-v2/D2), ENERGY_STATEMENT (`there-is-enough-now` from MONEY-v2/D2 + Money-Zone/Ch2-5), RITUAL (`the-hand-on-heart-money-breath` from MONEY-Journal structure + [PD] hand-on-heart anchor). All four target the early MONEY Phase 1 work (Days 2 + 4), continuing the spread bulk-001 started at Day 1.
- Life-category spread (across `practiceTargets`): MONEY 4 (all), ANXIETY 4 (all), ABUNDANCE 3, FEAR 1.
- All 4 briefs cleared voice-check **errors**. Only one (`the-hand-on-heart-money-breath`) carries warnings, all the same `brand-trademark "Anchor"` false positive bulk-001 already documented (mindset somatic / ritual / sensory-anchor sense — voice-check needs a mindset-category exception, still out of scope for the autopilot stream).

**Blocker (resolved in-session).** Prisma migration `20260625000000_phase_pottery_pipeline_001` adds `Tutorial.requiresKiln` + `Tutorial.requiresWheel` (added in commit `27d95cc` ~12 minutes before this fire's pre-flight). At first upload the migration hadn't applied to prod; `upload-tutorial.ts` threw `P2022 ColumnNotFound`. Halt signal `cmp9z957c0000b8v4g3jui7lv` (stream=queue, reason=DB_MIGRATION_PENDING) was written and the four briefs archived. The halt-commit push (`cf610b4`) triggered deploy run `25996150839`, which completed `success` and applied the pottery migration; `/healthz` returned 200. The 4 briefs then uploaded PUBLISHED in the same fire — Tutorial ids `cmp9zyn9v0000ywv4w1hyw19v` (steady-steady-steady), `cmp9zyvia0000zwv4xe5zz3ce` (i-am-safe-even-when-the-number-is-small), `cmp9zz0iw0000c4v4y09j1h21` (there-is-enough-now), `cmp9zz52w0000ugv4u2ylcke1` (the-hand-on-heart-money-breath).

**Patterns surfaced** (not yet folded back into prompts — flagged here for a follow-up):

- The schema-drift halt is now happening on a second migration class within 24 hours. Pre-flight could check `prisma migrate status` against prod to spot a pending migration before drafting — saving the draft work when the prod schema is behind.
- Cross-stream migrations are landing during autopilot fires more often than expected. Worth adding a "if the most recent main commit modified `prisma/migrations/` and the corresponding deploy hasn't finished, halt with `DB_MIGRATION_PENDING` immediately" check to pre-flight.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no edits to `docs/mindset-author.md`.

### Autopilot — Mindset bulk-003 ✅ landed 2026-05-17

**Goal.** 40-entry parallel-burner batch continuing MONEY: A 12-Week Tapping Program (Days 2–7) and opening SLEEP: A 30-Day Tapping Intensive (Days 1–2). All practice types covered.

**Outcome.** 40 PUBLISHED, 0 dropped. Mindset 24 → 64.

- **Practice mix:** TAPPING x8, ENERGY_STATEMENT x6, AFFIRMATION x7, RITUAL x2, JOURNAL_PROMPT x6, VISUALISATION x3, MEDITATION x2, EMBODIMENT x2, ACTIVITY x3, READING x2 (type: READING), SPELL x1.
- **practiceTarget spread:** MONEY 22, ANXIETY 20, SLEEP 9, ABUNDANCE 8, FEAR 7, SELF_WORTH 5, BODY 5.
- **Source spread:** MONEY Days 2–7 (running-out fear, bills, feast-or-famine, money shame, debt obsession, peace around bills). SLEEP Days 1–2 (exhaustion + body-knows reframe, tension release).
- **14 voice-check fixes:** em-dash pairs (13 instances across 9 files — replaced with colon+comma, parenthesis, or comma clauses); invalid timeBand FIFTEEN_MIN → TWENTY_MIN (6 files); invalid timeBand ONE_MIN → THREE_MIN (1 file); invalid practiceTarget RELAXATION → BODY (6 files).
- **Patterns to carry forward:** FIFTEEN_MIN not in TimeBand enum (author prompt must say TWENTY_MIN for 15-minute entries); RELAXATION not in PracticeTarget enum (use BODY or ENERGY); em-dash pairs remain the most common voice-check failure class in prose-heavy entries.

**Report.** `docs/mindset-bulk-003-report.md`.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no edits to `docs/mindset-author.md`.

### Autopilot — Mindset bulk-005 ✅ landed 2026-05-17

**Goal.** 48-entry autopilot batch (context-split: picked up at entry 29/48 in a continuation window). MONEY: A 12-Week Tapping Program Days 13–17 (inherited wealth patterns, generational money beliefs, releasing guilt around wanting, wealth identity) + SLEEP: A 30-Day Tapping Intensive Days 6–9 (emotional overload at bedtime, unhooking from busyness, grounding in the present moment, breath-led calming).

**Outcome.** 48 PUBLISHED (26 CREATED, 22 UPDATED). Mindset 144 → 170.

- **Practice mix:** TAPPING x9, VISUALISATION x9, JOURNAL_PROMPT x8, AFFIRMATION x7, ENERGY_STATEMENT x5, MEDITATION x4, RITUAL x2, READING x2, SPELL x1, ACTIVITY x1. Top-level Tutorial type: 47 PRACTICE + 1 READING.
- **practiceTarget spread:** MONEY 28, ABUNDANCE 25, ANXIETY 21, SLEEP 20, SELF_WORTH 11, ENERGY 5, PURPOSE 4, FORGIVENESS 3, FEAR 2, STUCK 1.
- **20 voice-check fixes:** em-dash pairs (17 files — appositive `— X —` converted to parentheses or comma clauses); banned phrases "at the end of the day" (1 subtitle), "genuinely" (2 files), "honestly" (1 file); negation pattern in READING prose (1 file — `why-women-are-taught-to-apologise-for-wanting.json`, 5 instances).
- **Prisma client regenerated mid-session:** knitting pipeline had added `primaryNeedleId` to Tutorial in commit `2c742ad`; stale client blocked all 48 uploads until `prisma generate` ran. All 48 succeeded on the subsequent run.
- **No new anti-tells:** all failures match existing entries in `docs/mindset-anti-tells.md`.

**Report.** `docs/mindset-bulk-005-report.md`.

**Out.** No schema changes; no migrations applied; no voice-check CLI edits; no edits to `docs/mindset-author.md`.

### Phase 8 Baking — bulk-001 batch ✅ landed 2026-05-16

**Goal.** Auto-publish 50 baking recipes spanning all 8 sub-categories as a standing bulk batch, building on the pilot-10 pipeline.

**Deliverable.**

- 50 RECIPE rows PUBLISHED: bread (10), cakes (10), pastries (5), pies (5), biscuits (6), scones (4), sweets-confectionery (5), cake-decorating (2), other (2).
- Difficulty: 8 BEGINNER / 31 INTERMEDIATE / 11 ADVANCED.
- 20 new ingredients seeded: `apricot-jam`, `black-pepper-ground`, `blanched-almonds`, `chestnut-mushrooms`, `chicken-stock`, `chicken-thighs-boneless`, `dried-currants`, `flaked-almonds`, `glucose-syrup`, `lardons`, `light-muscovado-sugar`, `pear-conference`, `raspberry-jam`, `rolled-oats`, `sage-dried`, `sausage-meat`, `soft-brown-sugar`, `thyme-dried`, `thyme-fresh`, `vanilla-bean-paste`.
- 19 new tools seeded: `deep-pie-dish`, `serrated-knife`, `pastry-cutter`, `saucepan-large`, `saucepan-medium`, `piping-nozzle-round`, `griddle`, `saucepan-small`, `palette-knife`, `square-baking-tin`, `loose-bottomed-tart-tin`, `meat-thermometer`, `cake-turntable`, `cake-smoother`, `kitchen-torch`, `bun-tin`, `piping-nozzle-star`, `piping-nozzle-petal`, `flower-nail`.
- `docs/baking-anti-tells.md` extended to 16 entries (4 new: em-dash pairs in sourceNotes, season enum uppercase, sweets-confectionery slug, tool slug precision).
- `docs/baking-bulk-001-report.md` — full batch report.

**Patterns surfaced:**

- Em-dash appositive pairs are the leading failure mode. Run a fix script before any upload attempt.
- Season enum must be uppercase; lowercase silently passes authoring but fails upload validation.
- `sweets-confectionery` is the correct sub-category slug for confectionery; `confectionery` alone is not seeded.
- Tool slugs use non-obvious ordering conventions; always look up the exact slug in `tools.ts`.
- In git worktrees, `seed-tools.ts` / `seed-ingredients.ts` read from the **worktree's** data files, not the main repo's. Both must be kept in sync.

**Out.** No schema changes. No voice-check CLI changes. No new TipTap blocks.

### Step 15 — Mindset register fix + type-intro readings + sub-category seed ✅ landed 2026-05-15

**Goal.** Fix the issues Rebecca raised reviewing the Step 14 anchor
batch: the prose drifted into ethereal AI-poetry, every script
restated the methodology, sub-categories were wrong (null instead
of practice types). One follow-up session to land all four fixes
together.

**Deliverable.**

- `docs/mindset-author.md` bumped to **v2** — register pinned to
  cooking-recipe-factual (not ethereal-spiritual); methodology
  moved to type-intro READING entries that practice scripts
  link to and assume; sub-category locked as practice type;
  worked example points at v2 anchor JSONs as the working
  reference; stripped defensive in-body disclaimers from the
  guidance.
- `docs/mindset-anti-tells.md` — five new `[block]` entries:
  ethereal-poetic register, defensive in-body disclaimer,
  methodology restatement, "what you might notice" lists,
  strange-metaphor tells. Total list now 16 entries.
- `packages/db/scripts/seed-mindset-taxonomy.ts` extended to
  seed **11 SubCategory rows** under `mindset` (one per
  `PracticeType` enum value). Each carries a one-sentence
  description. Idempotent on re-run.
- **5 new type-intro READING entries** at sub-category `reading`:
  `how-eft-tapping-works`, `how-energy-statements-work`,
  `how-rituals-work`, `body-based-meditation`,
  `journal-prompts-as-practice`. Each carries the methodology
  for one practice type. Practice scripts in the matching
  sub-category link to it in their opening paragraph and assume
  it's been read.
- **5 anchor practices re-authored.** Same slugs, same Tutorial
  ids (idempotent upload updated them in place). Stripped the
  imagined-felt-sensation intros, the methodology restatements,
  the defensive in-body disclaimers, the "what you might notice"
  lists. Sub-category set to practice type. Tapping anchor
  dropped from ~1,000 to ~400 words; ritual from ~800 to ~350;
  meditation from ~900 to ~500.
- `docs/mindset-anchor-report.md` rewritten to cover v1 → v2 +
  the v2 anchor batch.

Memory updates (auto-loaded for future Mindset workers):

- `feedback_mindset_voice.md` — Mindset prose follows
  cooking-recipe-factual register, not ethereal AI-poetry.
- `project_mindset_structure.md` — per-practice-type intro
  readings; sub-categories are practice types, not life
  categories.

**Out.**

- No voice-check.ts deterministic-rule edits (Mindset
  register-bans live in the drafting prompt's self-critique
  pass for now).
- No new TipTap blocks.
- No pilot-10, no bulk fill, no plan generator, no admin/public
  UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — `[needs-voice-check]` entries
   from `docs/mindset-anti-tells.md` into `voice-check-lib.ts`,
   plus fix the "Anchor"-as-ritual-step false positive.
2. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
3. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
4. Admin UI for Mindset — type-toggle in `tutorial-form.tsx`.
5. Public UI for Mindset.
6. Plan generator worker.

### Step 14 — Mindset authoring prompt + anti-tells + anchor batch ✅ landed 2026-05-14

**Goal.** Build the Mindset drafting prompt template (v1), seed the
Mindset anti-tells doc, and land 3–5 anchor practices across types as
`DRAFT` so Rebecca can review the end-to-end shape before pilot-10
fires.

**Deliverable.**

- `docs/mindset-author.md` v1 — the Mindset equivalent of
  `docs/tutorial-author.md`. Covers all 11 practice types, voice
  rules (standard + Mindset-specific register bans), self-critique
  checklist, source-attribution rules, length guidance per type,
  and the input / output contracts mapped to `TutorialUploadInput`.
- `docs/mindset-anti-tells.md` — 11 seeded entries across voice
  issues (therapeutic-claim creep, "queen / boss / step into your
  power" register, "manifest" overuse, spiritual bypass, future
  tense / negation in affirmations, false-intimacy openers,
  cosmic-promise framings), structural issues (tapping eight-point
  order, set-up statement specificity, reframe-mirroring),
  metadata issues, source-attribution issues. Six entries flagged
  `[needs-voice-check]` for the voice-check extension follow-up.
- **Anchor batch** — 5 `DRAFT` practices across types, visible at
  `/admin/tutorials?type=PRACTICE`:
  - `tapping-for-daily-money-panic` — TAPPING — MONEY + ANXIETY
  - `i-am-allowed-to-want-this` — ENERGY_STATEMENT — SELF_WORTH +
    MONEY + ABUNDANCE
  - `the-calm-and-safe-money-reset` — RITUAL — MONEY + ANXIETY +
    ABUNDANCE
  - `body-scan-for-sleep` — MEDITATION — SLEEP + ANXIETY + ENERGY
  - `feast-and-famine-journal-prompts` — JOURNAL_PROMPT — MONEY +
    ABUNDANCE + STUCK
- `docs/mindset-anchor-briefs/*.json` — five full `TutorialUploadInput`
  JSON files; the upload script's input + the canonical drafting
  reference for future Mindset workers.
- `docs/mindset-anchor-report.md` — anchor batch report (sources
  drawn from per anchor, voice-check pass / warning counts, what
  Rebecca should review first, TipTap-block gaps flagged for
  follow-up).
- `packages/db/scripts/seed-mindset-taxonomy.ts` — one-off seed for
  the `mindset` Category row. No sub-categories at launch; Mindset
  uses `practiceTargets[]` for life-category routing instead.
- `packages/db/scripts/upload-tutorial-types.ts` +
  `upload-tutorial.ts` — additive extension to accept `type =
  "PRACTICE" | "READING"` and a `practice` block carrying the
  Mindset metadata (`practiceType`, `practiceTargets`, `timeBand`,
  `bestTime`, `practiceDepth`, `whenToUse`, `whenNotToUse`,
  `alternativePracticeIds`). RECIPE / TECHNIQUE paths untouched.

**Out.**

- No `voice-check.ts` deterministic-rule edits — Mindset-specific
  bans (queen / boss / high-vibe / manifest overuse, therapeutic-
  claim verbs, cosmic-promise patterns, future-tense affirmations)
  captured in `docs/mindset-anti-tells.md` for the drafter's
  self-critique pass. Voice-check extension is its own session.
- No new TipTap blocks (anchor batch uses existing eight blocks).
  Three block gaps flagged in the anchor report (`tappingScript`,
  `ritualSteps`, `practiceStatement`) for a follow-up Mindset-blocks
  session.
- No pilot-10 batch — that's the next worker after Rebecca reviews
  the anchors.
- No bulk fill, no plan generator code, no admin UI extension, no
  public UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — `[needs-voice-check]` entries from
   `docs/mindset-anti-tells.md` land in `voice-check-lib.ts`.
2. *(optional)* Mindset-blocks gap fill — `tappingScript` /
   `ritualSteps` / `practiceStatement` TipTap blocks.
3. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
4. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
5. Admin UI for Mindset — type-toggle in `tutorial-form.tsx`.
6. Public UI for Mindset — Today view, Practice page, Library
   browse, "I'm feeling..." matcher.
7. Plan generator worker — picks up `UserPlan PENDING_GENERATION`
   rows, runs the generator prompt, writes 30 `UserPlanDay` rows.

### Step 13 — Mindset pipeline scaffold ✅ landed 2026-05-14

**Goal.** Open the second category in the multi-category fill plan. Get
the Mindset schema, library taxonomy, plan-generator tables, and
backlog into the repo so subsequent Mindset sessions (authoring prompt
template → voice-check extension → anchor batch → pilot-10 →
bulk authoring → plan generator) can each pick up their slice.

**Deliverable.**

- `packages/db/prisma/schema.prisma` — extends `TutorialType` with
  `PRACTICE` and `READING`, adds the eight Mindset enums
  (`PracticeType` 11-value, `PracticeTarget` 20-value, `TimeBand`,
  `BestTime`, `PlanTier`, `PlanStatus`, `PlanSlotSource`), the
  Tutorial Mindset metadata columns (`practiceType`,
  `practiceTargets[]`, `timeBand`, `bestTime`, `practiceDepth`,
  `whenToUse`, `whenNotToUse`, `alternativePracticeIds[]`), and the
  six user-side tables (`UserPlan`, `UserPlanDay`, `DailyPick`,
  `UserPracticeFavorite`, `UserPracticeUse`, `UserFeeling`). GIN
  index on `Tutorial.practiceTargets`, unique on
  `(UserPlan, dayNumber)` and `(userId, pickDate)` and
  `(userId, practiceId)` favorites. All additive — Cooking pipeline
  untouched.
- `packages/db/prisma/migrations/20260614000000_phase_8_step_13_mindset_schema/`
  — the migration SQL. Runs on the GH Actions deploy `prisma migrate
  deploy` step before ECS rollout, per the standard pattern.
- `apps/web/src/components/admin/tutorials/tutorial-form.tsx` +
  `preview-pane.tsx` + `apps/web/src/components/public/tutorial-chrome.tsx`
  — `type` unions widened from `'RECIPE' | 'TECHNIQUE'` to include
  `'PRACTICE'` and `'READING'`. No new admin UI yet; the form still
  only renders the RECIPE / TECHNIQUE toggle. Mindset admin lives in
  a later worker.
- `docs/mindset-backlog.md` — ~2,945 specific entry titles across all
  16 life categories. Mirrors the structure of `docs/recipe-backlog.md`:
  every brainstorm stuck-on point expanded into TAPPING / ENERGY_STATEMENT
  / AFFIRMATION / SPELL / RITUAL / ACTIVITY / JOURNAL_PROMPT /
  VISUALISATION / MEDITATION / EMBODIMENT / READING entry titles where
  the practice type fits. Source codes (`MONEY-v2/D<n>`, `MONEY-Journal/W<n>`,
  `Money-Zone/Ch<n>`, `SLEEP-v2/D<n>`, `WEIGHT-LOSS-v2/D<n>`,
  `MANIFESTING-v2/D<n>`, `[PD]`, `[NEW]`) tell the bulk-authoring worker
  where to pull from. Backlog finishes with cross-cutting indices —
  "I'm feeling..." matcher seeds, curated entry-point bundles,
  worker-handover note.

**Out.**

- **No content authoring.** No tapping scripts written, no rituals
  written, no readings written. Just schema + backlog.
- No premium gating logic — every feature built free per
  `feedback_premium_philosophy.md`, gated later via flag.
- No admin UI for Mindset yet (separate worker session).
- No public UI for Mindset yet.
- No plan generator code yet (`UserPlan PENDING_GENERATION` worker
  script is its own session).
- No image generation.
- No master entity tables for Mindset — practices are self-contained;
  Mindset has no equivalent of `Ingredient` / `Tool`.

**Next Mindset sessions, in order.**

1. Authoring prompt template — `docs/mindset-author.md`, the
   equivalent of `docs/tutorial-author.md` but for Mindset's shape.
2. Voice-check CLI extension — add the Mindset-specific bans
   (`queen` / `high-vibe` / `manifest` overuse) to
   `packages/db/scripts/voice-check.ts`.
3. Anchor batch — 3–5 practices across types, Rebecca reviews in
   admin preview.
4. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
5. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
6. Plan generator worker — picks up `UserPlan` rows with
   `status = PENDING_GENERATION`, runs the generator prompt, writes
   the 30 `UserPlanDay` rows, flips status to `ACTIVE`.

### Multi-category fill plan

Steps 1–12 above build out the cooking pipeline. This section extends the
plan to every top-level category so the broader scope stays visible.

Order is **feel-based**: pick the next category each session by what you
want depth in vs breadth on, what's reading well already, and what's
under-represented. The grid is a tracker, not a sequence.

#### Working assumptions

- **Plan tier:** Max 20x (confirmed). Half the weekly allocation goes to
  Homemade.
- **Models per session type:**
  - **Orchestrator** (occasional planning + coordination): Opus
  - **Tech / marketing worker** (code, deploys, copy work, infra): Opus
  - **Pipeline-setup worker** (per-category schema, prompt template,
    voice-check tuning, anchor tutorial): Opus
  - **Bulk content authoring worker** (the 2 parallel sessions doing
    daily fill): Sonnet
  - **Voice-check CLI**: deterministic, no model
- **Concurrency:** ~2 parallel content sessions, 12h × 6 days/week each,
  plus the orchestrator and the tech/marketing session running as needed.
- **Throughput per session-hour:** ~10 articles drafted, voice-checked,
  uploaded. The Step-10 pilot measured 12.8/hr on the tuned cooking
  pipeline (10 recipes in 47 minutes wall-clock). Real rate drops on new
  categories; 70% productivity factor accounts for that.
- **Total throughput:** **~1,000 articles/week** with both content
  sessions on the same category. ~500/wk per category if split across
  two in parallel.
- **Per-category pipeline setup:** ~1 week each (master entity tables,
  authoring prompt template, voice-check tuning, category-specific
  schema additions, anchor tutorial, pilot batch of 10 with feedback).
- **Auto-publish flow.** Bulk content sessions write → self-critique →
  voice-check → auto-publish as PUBLISHED. No per-draft manual review
  by Rebecca; she spot-checks live on the site as she has bandwidth.
  Splash gate keeps the site private pre-launch, so anything that slips
  through is only seen by her. When a recurring quality issue surfaces
  (3+ instances in a batch), the worker appends it to
  `docs/common-issues.md`; subsequent workers explicitly check for it
  during self-critique. The post-launch path is a Tester program that
  sees tutorials before public publish — not in scope yet (tracked in
  Phase 6 + future work).
- **Image generation:** deferred for the whole fill phase — heroes
  batch-generate from pre-launch budget.

Revise the rates here when actuals diverge from estimates.

#### Category grid

| # | Category | Target | Current | Pipeline | Fill weeks @ 1k/wk |
|---|---|---:|---:|---|---:|
| 1 | Cooking | 7,000 | 1139 PUBLISHED (anchors + pilot-10 + personal-recipe ingest + bulks 001-032 across cuisines, methods, soups/salads/breakfasts/drinks/preserves/desserts). **bulk-032 (autopilot-queue, 2026-05-28):** 40 PUBLISHED — British pies and pastries ×18 (steak-and-ale-pie, cottage-pie, shepherds-pie, fish-pie, chicken-and-mushroom-pie, cornish-pasty, sausage-roll, steak-and-kidney-pie, chicken-and-leek-pie, chicken-and-ham-pie, vegetarian-shepherds-pie, smoked-haddock-and-leek-pie, salmon-and-dill-pie, pork-pie, cheese-and-onion-pasty, vegetarian-sausage-roll, steak-and-kidney-pudding, steak-and-mushroom-pie), pub classics and traditional mains ×22. Voice fixes: Mrs Beeton gloss (12 files), em-dashes (15 files including excerpts), banned phrases "genuinely"/"honest" (4 files), grade level (11 files), year-in-body (1 file). 1138 → 1139 (most slugs pre-existing from earlier batches). Report: `docs/bulk-batch-032-report.md`. **bulk-031 (autopilot-queue, 2026-05-20):** 40 PUBLISHED — British condiments + classic sauces + roast accompaniments. Cooking 1134 → 1174 (commit count; DB net 1134→1139 after 032 overlap). Report in `docs/bulk-batch-031-briefs/`. **bulk-030 (autopilot-queue, 2026-05-19):** 40 PUBLISHED — British winter classics (beef-and-barley-stew, beer-battered-haddock, black-pudding-hash, brined-roast-turkey, and others). Cooking 1105 → 1134. Report in `docs/bulk-batch-030-briefs/`. **bulk-029 (autopilot-queue, 2026-05-20):** 40 PUBLISHED — desserts (affogato, apple-and-blackberry-crumble, apple-charlotte, apple-crumble, and others). Cooking 1065 → 1105. Report in `docs/bulk-batch-029-briefs/`. **bulk-028 (autopilot-queue, 2026-05-19):** 40 PUBLISHED — Italian + Moroccan + mixed cuisines (arancini, bastilla-chicken, bistecca-alla-fiorentina, bucatini-amatriciana, calzone, caponata, and others). 1033 → 1065. Report in `docs/bulk-batch-028-briefs/`. **bulk-027 (autopilot-queue, 2026-05-19):** 40 PUBLISHED — French ×14 + Italian ×7 + Spanish ×9 + Greek ×10. Previously-drafted untracked briefs, voice-checked and published. 1009 → 1033. **bulk-026 (autopilot-queue, 2026-05-19):** 40 PUBLISHED — Italian pasta ×20, Eastern European ×12, Anglo-Indian ×8. 969 → 1009. **bulk-025 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — air-fryer section (all CREATED): scotch-eggs, sausages, pork-chops, pork-belly-slices, pork-tenderloin, rack-of-lamb, meatballs, beef-burgers, steak, chicken-wings, buffalo-wings, bbq-wings, chicken-drumsticks, chicken-thighs-boneless, chicken-breasts, chicken-shawarma, chicken-nuggets, chicken-tenders, fish-cakes, fish-fingers, cod-fillet, haddock-fillet, salmon-fillet, scampi, tuna-steak, prawns-garlic-butter, chips-fresh-cut, roast-potatoes, baby-potatoes, sweet-potato-fries, hash-browns, wedges-cajun, hasselback-potatoes, onion-rings, asparagus, roasted-broccoli, roasted-mushrooms-garlic-thyme, parsnips, cauliflower-wings-buffalo, bacon. Voice fixes: em-dash pairs (18 files, 30+ instances → colon/semicolon/parentheses), banned phrase "genuinely" (2 files), brand-trademark "McDonald's" (2 files → generic). Slug fixes: new-potato→potato, parsley→parsley-flat, chestnut-mushroom→chestnut-mushrooms, egg→eggs (6 files). servings/yieldDescription conflicts (5 files → null servings). Cooking 929 → 969. **bulk-024 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — Eastern European (Czech × 9, Polish × 9, Russian × 9, Hungarian × 7, Ukrainian × 4, Slovak × 1, mixed × 1). barszcz-bialy, bramboraky, buckwheat-blini, cabbage-piroshki, cold-borscht, czech-goulash, golabki, gulyasleves, halaszle, holubtsi, hortobagyi-palacsinta, kapusta-z-grochem, knedliky, korhelyleves, krupnik, kulajda, langos, meat-piroshki, meggyleves, mizeria, okroshka, olivier-salad, pampushky, pashtet, pierogi-z-grzybami, pierogi-z-kapusta, pierogi-z-owocami, rassolnik, selyodka-pod-shuboy, shchi, sledzie-w-oleju, smazeny-syr, solyanka, surowka-z-kapusty, toltott-kaposzta, vareniki, vepro-knedlo-zelo, vinegret, zapiekanka, zupa-pomidorowa. Voice-check fixes: em-dash pairs (16 files), banned phrase "genuinely" (2 files). Slug fixes: 12 wrong ingredientSlugs + body prose template tokens corrected, 4 tool slug corrections, season enum uppercase (8 files). Cooking 890 → 929. **bulk-023 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — slow-cooker section (34 CREATED, 6 UPDATED). beef: bolognese-sauce, beef-and-ale-stew, beef-bourguignon, beef-brisket, beef-stew-dumplings, beef-stroganoff, chilli-con-carne, pot-roast. lamb: irish-stew, lamb-rogan-josh, lamb-shanks-red-wine, lamb-shoulder, moroccan-lamb-tagine. pork: gammon-glazed, ham-in-cola, pork-belly-braised, pulled-pork, sausage-casserole. chicken: bbq-chicken, butter-chicken, chicken-cacciatore, chicken-curry, chicken-rice-soup, chicken-tikka-masala, coq-au-vin, honey-mustard-chicken, moroccan-chicken-olives, whole-roast-chicken. vegetarian: butternut-squash-soup, carrot-coriander-soup, chickpea-curry, lentil-bolognese, lentil-chilli, mushroom-stroganoff, tomato-soup, vegetable-curry. desserts: apple-crumble, chocolate-pudding, macaroni-cheese, rice-pudding. Voice fixes: em-dash pairs (13 files across body + sourceNotes + excerpt), banned phrase "genuinely" (2 files). Cooking 856 → 890. **bulk-022 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — British classics: roasts ×10 (roast-beef-sirloin, roast-beef-rib-on-bone, roast-leg-of-lamb, slow-roast-shoulder-of-lamb, roast-pork-loin-crackling, roast-pork-belly, roast-chicken-whole, roast-duck-orange, roast-turkey-christmas, roast-gammon-whole), accompaniments ×10 (yorkshire-puddings, roast-potatoes, cauliflower-cheese, bread-sauce, cranberry-sauce, roast-parsnips, toad-in-the-hole, roast-carrots, bubble-and-squeak, colcannon), pies ×7 (beef-wellington, cornish-pasty, sausage-roll, fish-pie, shepherds-pie, cottage-pie, lancashire-hotpot), pub classics ×8 (fish-and-chips, bangers-and-mash, hunter-chicken, sausage-casserole, welsh-rarebit, prawn-cocktail, scotch-egg, ploughmans-lunch), regional ×5 (cullen-skink, cranachan, drop-scones-scottish, beef-and-ale-casserole, chicken-casserole-cider-tarragon). Voice fixes: banned phrases "genuinely"/"honest" (7 files), em-dash pairs (5 files), servings/yieldDescription conflict (6 files). Season enum uppercase (11 files). Slug fixes: carrots→carrot, parsnips→parsnip, shallots→shallot. New ingredient master entries: branston-pickle, sourdough, white-bread, cranberries (4 total). 11 CREATED, 29 UPDATED. Cooking 838 → 856. **bulk-021 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — North African (Moroccan × 17, Tunisian × 12, Egyptian × 11). baghrir, bessara-egyptian, bissara, brik, chakchouka-tunisienne, chermoula, chicken-tagine-figs, chicken-tagine-preserved-lemon-olives, couscous-chicken-chickpeas, couscous-royale, dukkah, fish-tagine-chermoula, ful-nabed, harissa-paste, hawawshi, kefta-skewers, kefta-tagine, kefteji, khobz, lablabi, lamb-tagine-apricot, lamb-tagine-prunes-almonds, mahshi-cromb, mahshi-felfel, mechouia-salad, merguez-sausages, molokhia-chicken, moroccan-carrot-salad, mrouzia, msemen, ojja-merguez, om-ali, ras-el-hanout, roz-bi-laban, ta-ameya, taktouka, tunisian-fish-couscous, tunisian-tajine, vegetable-tagine-moroccan, zaalouk. Voice-check fixes: em-dash pairs (15 files), banned phrase "genuinely" (2 files). Slug fixes: 8 wrong slugs corrected globally (coriander-fresh→coriander, paprika→paprika-sweet, red-pepper→pepper-red, savoy-cabbage→cabbage-savoy, instant-yeast→yeast-dried, tinned-tuna→tuna-tinned, sugar→granulated-sugar). New ingredient master entries: dried-split-fava-beans, short-grain-rice, dill-fresh, cardamom-ground (4 total). 32 net new (8 already existed). Cooking 806 → 838. **bulk-020 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — Caribbean (13 CREATED, 27 UPDATED). ackee-and-saltfish, bajan-chicken-stew, bajan-fish-cakes, bammy, buss-up-shut, callaloo-soup-trinidad, caribbean-black-cake, coconut-bake-trinidad, coconut-bread, coucou-and-flying-fish, cow-foot-stew, curry-duck-trinidad, curry-goat, dhalpuri-roti, doubles, escovitch-fish, festival-dumpling, hard-dough-bread, jamaican-beef-patty, jamaican-chicken-soup, jamaican-cornmeal-porridge, jamaican-pumpkin-soup, jerk-pork-shoulder, jerk-seasoning-paste, johnny-cakes, macaroni-pie-trinidad, mackerel-rundown, mauby, oxtail-stew-jamaican, pelau, pepper-sauce-trinidad, pepperpot-soup-jamaican, pholourie, plantain-chips, pudding-and-souse, sada-roti, saltfish-fritters, shark-and-bake, sorrel-drink, stew-chicken-trinidad. Voice-check fixes: em-dash pairs (17 files), banned phrases (2 files), invalid difficulty enum EASY→BEGINNER (20 files), Prisma client regenerated. Three new ingredient master entries: chickpeas, cow-foot, callaloo-leaves. Cooking 766 → 806. **bulk-019 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — British Indian restaurant canon (23 CREATED, 17 UPDATED). chicken-tikka-masala, chicken-korma, lamb-rogan-josh, chicken-jalfrezi, lamb-bhuna, tarka-dhal, chana-masala, aloo-gobi, saag-aloo, saag-paneer, pilau-rice, lamb-dhansak, lamb-madras, lamb-vindaloo, chicken-pathia, chicken-dopiaza, chicken-passanda, chicken-biryani, lamb-biryani, king-prawn-balti, chicken-tikka, tandoori-chicken, onion-bhaji, vegetable-samosa, bombay-potato, garlic-naan, plain-naan, peshwari-naan, raita, mushroom-bhaji, kedgeree, mulligatawny, coronation-chicken, keema-matar, lamb-saag, beef-madras, beef-vindaloo, lamb-samosa, paneer-tikka-masala, chicken-saag. Voice-check fixes: em-dash pairs (38 across 20+ files), servings/yieldDescription conflict (5 files), banned phrases (7 files), wrong slugs (10 types fixed globally). Two new ingredient master entries: chicken-legs, mango-chutney. Cooking 743 → 766. **bulk-018 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — European (French, Italian, Greek, Spanish). Cooking 730 → 743. **bulk-017 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — Middle Eastern / Levantine / Persian. Cooking 681 → 721. **bulk-016 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — American comfort food + breakfasts + sandwiches + BBQ. Cooking 656 → 681. **bulk-015 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — Italian pasta × 12, risotto × 6, chicken × 3, fish × 4, other Italian × 6, Turkish × 9. Cooking 616 → 656. **bulk-014 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — Greek × 10, Spanish × 10, Eastern European × 10, French × 10. Cooking 582 → 616. **bulk-013 (autopilot-queue, 2026-05-18):** 40 recipes PUBLISHED — all british. Classical cooking: gravies (onion, red-wine), condiments (mint sauce, apple sauce, horseradish cream), pies (steak-and-kidney, chicken-and-mushroom, chicken-and-leek, steak-and-mushroom), stews/braises/soups (beef-and-Guinness, welsh cawl, cock-a-leekie, scotch broth, Irish stew, oxtail stew, vegan cottage pie, vegetarian shepherd's pie, smoked haddock chowder), stuffings (sage-and-onion, chestnut-and-sausagemeat), accompaniments (braised red cabbage, honey-roast carrots and parsnips, hasselback potatoes, boulangère potatoes, pigs in blankets), offal (devilled kidneys, liver and onions), pork (pork chops cider/apples, pork chops mustard cream, gammon parsley sauce, boiled bacon and cabbage), fish (scampi, devilled mackerel, potted shrimp), chicken (goujons, spatchcock), lamb (rack of lamb), vegetarian (glamorgan sausages), Scottish (stovies). DB count post-batch: 582. | ✅ ready for savoury; preserves + fermenting + charcuterie + cheese + brewing each need ~3–4 days schema/prompt extension | 7 |
| 2 | Baking | 3,000 | 632 PUBLISHED (bulks 001–016 + bulk-004b, 2026-05-28) | ✅ schema + taxonomy + authoring prompt v2 + anti-tells + pilot-10 + bulks 001–016 all landed. **bulk-016 (autopilot-queue, 2026-05-28):** 40 PUBLISHED — bread ×11, pastries ×13, biscuits ×9, pies ×4, cakes ×3. Upload format fix: ingredientsList all 40 files (attrs.items[] format). Baking 592 → 632. Report: `docs/baking-bulk-016-report.md`. **bulk-015 (autopilot-queue, 2026-05-20):** 40 PUBLISHED — bread ×7, cakes ×8, pastries ×5, biscuits ×5, pies ×5, scones ×3, sweets-confectionery ×5, cake-decorating ×2. 3 new ingredients (vegetable-suet, anise-seeds, rolled-fondant). Notable: sussex-pond-pudding (steamed, null bakeTemp), pastel-de-nata (250°C), springerle (overnight drying), scottish-tablet (118°C soft-ball), fondant-draping + sugar-flowers. Chain cap reached (10th consecutive baking batch). Baking 552 → 592. Report: `docs/baking-bulk-015-report.md`. | 3 |
| 3 | Garden | 4,000 | 0 | Not started — ~1 wk setup | 4 |
| 4 | Herbal medicine | 2,500 | 0 | Not started — ~1 wk setup | 2.5 |
| 5 | Mindset | 4,300 | 885 PUBLISHED (bulks 001–022 + editorial pass) | ✅ schema + backlog + authoring prompt v6 + anti-tells + 11 sub-categories. **bulk-022 (autopilot-queue-extra, 2026-05-28):** 40 entries PUBLISHED — multi-category gap-fill (BODY, HOME, MOTHERHOOD, AGEING, GRIEF, SPIRITUALITY, TIME, HEALTH, RELATIONSHIPS, FORGIVENESS). Practice-type spread targeted under-served sub-categories (RITUAL, ACTIVITY, MEDITATION, EMBODIMENT, SPELL). Mindset 845 → 885. Report: `docs/mindset-bulk-022-report.md`. | 4.3 |
| 6 | Crochet | 1,500 | 0 | Not started — ~1 wk setup | 1.5 |
| 7 | Knitting | 1,500 | 0 | Not started — ~1 wk setup | 1.5 |
| 8 | Needlework | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 9 | Sewing | 1,200 | 0 | Not started — ~1 wk setup | 1.2 |
| 10 | Fibre arts | 800 | 83 PUBLISHED (bulk-001 + bulk-002, 2026-05-20) | ✅ bulk-001 + bulk-002 done: felting ×25, spinning ×16, weaving ×16, natural-dyeing ×10, macramé ×10, rug-making ×6. Reports: docs/fibre-arts-bulk-001-report.md, docs/fibre-arts-bulk-002-report.md. | 0.8 |
| 11 | Wood & natural craft | 800 | 170 PUBLISHED (bulk-001 through bulk-005, 2026-05-28) | ✅ bulk-001 + 002 + 003 + 004 + 005 done: spoon-carving ×27, whittling ×21, green-woodwork ×22, basketry-willow ×21, seasoned-wood ×16, pyrography ×9, READING + TECHNIQUE ×54 (across batches). Reports: docs/wood-natural-craft-bulk-001-report.md through docs/wood-natural-craft-bulk-005-report.md. | 0.8 |
| 12 | Paper & word | 800 | 42 PUBLISHED (bulk-001, 2026-05-20) | ✅ pipeline setup + bulk-001 done: bookbinding ×10, calligraphy ×8, papermaking ×6, marbling ×4, journalling-craft ×4, papercutting ×3, zines ×2, scrapbooking ×2, origami ×1. Report: docs/paper-word-bulk-001-report.md. | 0.8 |
| 13 | Pottery & ceramics | 500 | 40 PUBLISHED (bulk-001, 2026-05-20) | ✅ bulk-001 done: clay-fundamentals ×7 (all TECHNIQUE), hand-building-no-equipment ×26 (all PATTERN, no-equipment track — air-dry, paper clay, polymer), surface-decoration ×7 (TECHNIQUE ×6, PATTERN ×1). BEGINNER ×34, INTERMEDIATE ×6. Report: docs/pottery-ceramics-bulk-001-report.md. | 0.5 |
| 14 | Animals & smallholding | 700 | 133 PUBLISHED (bulk-001 + bulk-002 + bulk-003 + bulk-004, 2026-05-20 → 2026-05-28) | ✅ bulks done: bees ×25, poultry ×24, sheep-and-goats ×22, rabbits ×14, pigs ×22, smallholding-skills ×26. 19 tools seeded across batches. Reports: bulk-001/002/004. | 0.66 |
| 15 | Home & repair | 800 | 150 PUBLISHED (bulk-001 + bulk-002 + bulk-003 + bulk-004, 2026-05-28) | ✅ bulk-001 + bulk-002 + bulk-003 + bulk-004 done: walls-and-floors ×39, woodwork ×32, plumbing ×24, upholstery-and-leather ×22, electrical ×16, furniture-restoration ×15. Reports: docs/home-repair-bulk-001-report.md, docs/home-repair-bulk-002-report.md, docs/home-repair-bulk-003-report.md, docs/home-repair-bulk-004-report.md. | 0.81 |
| 16 | Natural home | 800 | 40 PUBLISHED (bulk-001, 2026-05-20) | ✅ pipeline setup + bulk-001 done: soap ×8, candles ×8, beauty ×10, cleaning ×8, fragrance ×6. 2 ingredients seeded. Report: docs/natural-home-bulk-001-report.md. | 0.76 |
| 17 | Sustainability | 700 | 40 PUBLISHED (bulk-001, 2026-05-20) | ✅ pipeline setup + bulk-001 done: insulation-and-draughtproofing ×10, solar-and-energy ×8, composting ×8, water ×6, waste-reduction ×5, off-grid ×3. Report: docs/sustainability-bulk-001-report.md. | 0.7 |
| | **Total** | **31,700** | **1,105** | ~12 wks setup outstanding (new categories) + ~3 wks Cooking sub-extensions | ~28 weeks fill |

#### Sub-categories per top-level

- **Cooking** — savoury meals, soups, salads, breakfasts, sauces &
  condiments, preserving & fermenting, charcuterie, cheese & dairy,
  brewing & drinks
- **Baking** — bread, cakes, pastries, biscuits, pies, scones,
  sweets & confectionery, cake decorating
- **Garden** — vegetables, fruit, herbs, flowers, permaculture,
  microgreens, hydroponics, mushroom growing, foraging
- **Herbal medicine** — remedies, tinctures, infusions, decoctions, oils,
  balms, salves, syrups, home apothecary
- **Mindset** — manifesting, tapping, energy work, daily practice,
  journal prompts, 30-day plans
- **Crochet** — stitches, techniques, patterns (public-domain only at
  launch)
- **Knitting** — stitches, techniques, patterns (public-domain only at
  launch)
- **Needlework** — cross-stitch, tatting, lacemaking, needlepoint
- **Sewing** — dressmaking, quilting, mending & visible mending
- **Fibre arts** — spinning, weaving, dyeing, felting, rug making,
  macramé
- **Wood & natural craft** — woodworking, whittling, spoon carving,
  basketry, willow weaving
- **Paper & word** — paper crafts, bookbinding, calligraphy,
  scrapbooking, journalling-as-craft (bullet journals, art journals,
  junk journals, travel / nature journals, making the book itself).
  Journal *practice* — prompts, gratitude, daily reflection — sits in
  Mindset.
- **Pottery & ceramics** — hand-building, throwing, glazing, firing
- **Animals & smallholding** — beekeeping, chickens, backyard livestock
- **Home & repair** — building, upholstery, furniture restoration,
  bushcraft
- **Natural home** — soap, candles, DIY beauty, DIY cleaning, home
  fragrance
- **Sustainability** — solar (DIY solar projects, solar oven, solar
  water heater), water reduction & harvesting (rainwater catchers,
  greywater, water-saving fixtures), composting (kitchen, garden, hot
  vs cold, vermicompost), waste reduction (zero-waste, plastic-free,
  package-free swaps, repair-don't-replace), energy efficiency
  (insulation, draft-proofing), renewable heating (wood stove, masonry
  heater), off-grid basics

#### Pipeline-specific setup notes

The rough shape for each new pipeline. Schema notes are illustrative —
finalise at setup time.

- **Garden.** Master `PlantVariety` table (variety, parent species, USDA
  + RHS hardiness zones, sun / water / soil prefs, days to maturity),
  zone reference table, planting-calendar metadata on Tutorial,
  pest / disease cross-refs, companion-planting relations. Tutorial type
  extends to `GROWING_GUIDE`.

- **Herbal medicine.** Master `Herb` table (Latin binomial, common names,
  parts used, primary actions, key constituents, safety flags),
  `Condition` table (body system, common symptoms, cross-refs),
  preparation typing (tincture / decoction / infusion / oil / salve /
  balm / syrup), drug-interaction notes. Strongest "no medical advice"
  voice rules of any category. Tutorial type extends to `REMEDY` and
  `HERB_PROFILE`.

- **Mindset.** `Practice` library (tapping script / energy alignment
  statement / ritual / journal prompt / breathwork as typed entities),
  `Plan` template entity (30-day skeletons with daily activity slots).
  No master ingredient / tool equivalents. Tutorial type extends to
  `PRACTICE`, `READING`, `PLAN`.

- **Crochet / Knitting.** Master `Stitch` table (name, US + UK
  terminology variants, symbol, difficulty), `YarnWeight` reference,
  pattern metadata (gauge, hook / needle size, finished dimensions, yarn
  quantity), symbol-chart rendering. AI not used for stitch photos
  (locked decision); one-time manual stitch shoot. Tutorial type extends
  to `PATTERN` and `STITCH`.

- **Needlework.** Similar shape to crochet / knitting with a separate
  `Stitch` namespace (cross-stitch counts grid squares, tatting uses
  shuttle motions, lacemaking has bobbin diagrams).

- **Sewing.** `Pattern` table for garment patterns (public-domain at
  launch — Edwardian, 1940s, vintage), fabric metadata, body-measurement
  reference, quilt-block library. Tutorial type extends to `PATTERN`
  and `TECHNIQUE`.

- **Fibre arts, Wood & natural, Paper & word, Pottery, Animals, Home &
  repair, Natural home.** Schema notes deferred to each category's
  setup session — most follow the pattern of "master entity table +
  category-specific Tutorial subtype + metadata fields", echoing what
  cooking has.

#### How to use the grid

- **Current count** updates after every content batch. Worker sessions
  update it as part of their hand-off; spot-checks update it when
  Rebecca reviews.
- **Target** is "super super full and deep". Adjust down if a category
  reads fine at half depth; up if a sub-category wants more.
- **Order is your call session-by-session.** Common patterns: fill one
  category to feel-it-out depth and pause; alternate deep / quick
  categories for variety; push the holistic-life spine first
  (Kitchen + Garden + Herbal + Mindset).
- **Pipeline** flips to ✅ once a category's setup is complete (master
  entity tables seeded, authoring prompt tuned, schema extensions
  migrated, voice-check tuned, anchor tutorial drafted, pilot-10
  reviewed). Pipeline-setup sessions are their own worker sessions.
- **Fill weeks** assume both content sessions are on one category. Halve
  the rate if they're working different categories in parallel.
- **Adding new categories or sub-categories.** Just append a row to the
  grid (copy the column shape from an existing row) and a bullet to the
  sub-categories list. Bump the **Total** row. A brand-new top-level
  category adds ~1 week of pipeline setup; a new sub-category typically
  slots into its parent's existing pipeline (smaller schema / prompt
  extension, no full setup).

#### Strategic reference

- **Holistic-life spine** = Cooking + Baking + Garden + Herbal medicine
  + Mindset. ~20,800 articles at full depth (Mindset's full brainstorm
  came in much richer than the original estimate — ~4,300 entries).
  ~21 weeks fill + ~3 weeks remaining setup. Fills the Barbara
  O'Neill-style worldview unmistakably before broadening.
- **Carryover from the original 5-launch list**: Crochet + Knitting
  benefit from existing public-domain pattern sources mapped in Master
  Plan §6 (Weldon's, de Dillmont). Moderate setup, straightforward fill.
- **Cheap-breadth categories**: Pottery, Wood & natural, Animals &
  smallholding, Home & repair, Paper & word, Sustainability. Smaller
  volumes, on-brand, useful for filling the platform out once the spine
  is solid. Sustainability has natural cross-references into Garden
  (composting, greenhouse), Natural home (eco cleaning, plastic-free),
  and Home & repair (insulation, draft-proofing) — overlap is fine, tag
  primary + secondary categories on individual tutorials.
- **Pending decisions:** all open at the time of writing are now
  locked. Max 20x confirmed. Natural home named. Cooking + Baking
  split as separate top-level categories. Launch shape "C-ish,
  feel-based" — the grid is the tracking surface; sequencing happens
  session-by-session.

### Pre-launch — image generation pass

Generate heroes (and inline illustrations where the page design calls for them) in batches once budget is allocated. Update existing Tutorial rows via the upload script (idempotent on re-run). Locked prompts and tier in `docs/tutorial-author.md`. Expected total at 2,000 recipes + 600 techniques: ~£100–£150 for heroes only, ~£260–£400 if inline illustrations come too.

---

---

## Recent sessions

Sessions newer than 2026-05-12, in the order they landed. Phase entries older than this and shipped infra / analytics rollouts are in the [archive](docs/archive/build-progress-history.md).

## Bug-fix bundle — Clerk auth error on tutorial pages + public error boundaries + analytics loose ends (2026-05-13)

Six-item bundle clearing one production Sentry issue, adding the
public-side error boundaries the analytics taxonomy was waiting on,
and wiring the last five "catalogued but unwired" PostHog events.

### Clerk auth() error on tutorial pages — root cause + fix

- **Root cause** (already documented in pre-launch debt before this
  session): `apps/web/src/proxy.ts` matcher excluded any path ending
  in `.<letters>` via `.*\.[a-zA-Z]+$`. That swallowed bot probes like
  `/wp-admin.php`, `/.env`, `/sitemap.xml.html` — the matcher rule
  meant `clerkMiddleware` never ran for them, but Next still routed
  them to the dynamic `[categorySlug]` page, which calls
  `getCurrentDbUser()` → `currentUser()` → throws "Clerk: auth() was
  called but Clerk can't detect usage of clerkMiddleware()". ~17
  occurrences/hour from bot traffic; no real-user impact, but Sentry
  noise drowned signal.
- **Fix A (matcher):** swap the broad regex for an allowlist of
  actual static-asset extensions:
  `svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|woff|woff2|ttf|otf|wasm|txt|xml|json`.
  Bot probes now go through `clerkMiddleware` and hit the splash gate
  (404 / rewrite to `/coming-soon`) like any other unknown URL.
- **Fix B (defensive try/catch):** `getCurrentDbUser()` wraps
  `currentUser()` in a try/catch that returns `null` on Clerk runtime
  errors and reports a warning-level Sentry exception with
  `tags: { source: 'getCurrentDbUser' }`. Cheap insurance against
  future RSC sub-request edge cases where middleware might not
  surround a server-component call.

Both fixes ship together — matcher is the root cause, defensive
try/catch keeps a future regression from being a 500.

### Public error boundaries

- `apps/web/src/app/(public)/error.tsx` — root client error boundary
  for the entire public route group. Brand-fit fallback ("Something
  went wrong on our end. We've been told, and we'll have a look.")
  with "Try again" (calls `reset()`) and "Back to homepage" links.
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/error.tsx`
  — tutorial-scoped boundary so a broken tutorial keeps the site
  header / footer and isolates the failure to the article body.
- Both boundaries call `Sentry.captureException(error)` AND
  `captureClientEvent('error_boundary_triggered', { ... })` so the
  PostHog `error_boundary_triggered` dashboard pairs with Sentry's
  view from the user's perspective.
- Brand-fit CSS in `apps/web/src/components/public/site-chrome.css`
  (under `.public-error-boundary`).

### Analytics events — five closed out

All five remaining "catalogued but unwired" events from Phase B now
fire from their natural code paths. The taxonomy doc
(`docs/analytics-taxonomy.md`) was updated in this same commit with
the final property shapes — only `payment_failed` remains
catalogued-but-unwired (Phase 7/8 placeholder).

- **`error_boundary_triggered`** — fires from the two new boundaries
  above with `{ path, errorName, errorMessage (truncated 120),
  digest, scope? }`. `scope: 'tutorial'` on the tutorial boundary,
  omitted on the root one so dashboards can distinguish them.
- **`account_data_export_downloaded`** — `apps/web/src/app/(public)/me/data-rights/export-panel.tsx`
  added an `onClick` to the "Download bundle" anchor that fires
  `{ requestId, bytes, generatedAt }` before the navigation. Fire-
  and-forget, doesn't block the download.
- **`search_result_clicked`** — new
  `apps/web/src/app/(public)/search/search-results.tsx` client
  wrapper around the result grid. Uses `display: contents` on the
  wrapping span so the underlying `TutorialCard` stays as the grid
  item and layout is unchanged. Fires
  `{ query, filters, position, tutorialId, tutorialSlug,
  categorySlug, totalResults }` on capture so the navigation isn't
  delayed. Only wraps actual search hits, not the recently-published
  fallback shown when the page is opened with no query.
- **`tutorial_shared`** — first wire in any form (the event existed
  in the taxonomy but never had a firing path). New
  `apps/web/src/components/public/tutorial-reader/share-button.tsx`:
  on devices that expose `navigator.share`, renders a single Share
  button that opens the OS sheet and fires `destination: 'native'`.
  Otherwise renders a popover menu with copy-link / Twitter (X) /
  Pinterest / Facebook / email — each fires with the matching
  `destination` (`copy_link` / `twitter` / `pinterest` / `facebook`
  / `email`). Click-outside + Escape close the menu. Available on
  every tutorial page for signed-in AND anonymous readers (the
  tutorial actions bar now renders the share button as a baseline,
  with bookmark + project buttons layered in for signed-in users).
- **`account_deletion_completed`** — fires from the per-user step in
  the hard-delete Inngest cron (`apps/web/src/inngest/functions/hard-delete-accounts.ts`)
  after `hardDeleteAccount` succeeds. The cron now also pre-loads
  the user's `clerkId` and the `AccountDeletionRequest.requestedAt`
  alongside the queue. `distinctId` is the Clerk id so the event
  stitches onto the same PostHog person the user's lifecycle has
  been tracked against. Properties:
  `{ userId, daysScheduledFor: 30, requestedAt, completedAt, reason }`.
  `flushPostHog()` runs once at the end of the function so the
  serverless process doesn't tear down before events leave the
  buffer.

### Files touched

- `apps/web/src/proxy.ts` (matcher allowlist)
- `apps/web/src/lib/get-current-user.ts` (try/catch + Sentry)
- `apps/web/src/app/(public)/error.tsx` (new)
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/error.tsx` (new)
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` (import + wire share into actions slot)
- `apps/web/src/app/(public)/me/data-rights/export-panel.tsx` (onClick)
- `apps/web/src/app/(public)/search/page.tsx` (use SearchResults wrapper)
- `apps/web/src/app/(public)/search/search-results.tsx` (new)
- `apps/web/src/app/(public)/search/search-page.css` (`.search-result-card-wrap` shim)
- `apps/web/src/components/public/tutorial-reader/share-button.tsx` (new)
- `apps/web/src/components/public/tutorial-reader/tutorial-reader.css` (share menu styles)
- `apps/web/src/components/public/site-chrome.css` (error boundary styles)
- `apps/web/src/inngest/functions/hard-delete-accounts.ts` (event firing)
- `docs/analytics-taxonomy.md` (five rows reworded as wired with final properties)

### Things scoped out of this session

- Recipes-first schema reshape — parallel content-pipeline session
  owns `packages/db/prisma/schema.prisma` and the recipe TipTap
  blocks. This session stayed out of both.
- Public tutorial page layout — only minimum-surgical edits inside
  `page.tsx` (import + actionsSlot tweak); no rearranging sections
  or styling.
- New admin pages or marketing pages.
- Tightening the rules ESLint Phase 1 downgraded — its own session.

### Pre-launch debt observed during this session

- The `proxy.ts` matcher row in BUILD_PROGRESS.md "Pre-launch debt"
  is now closed (the fix landed here). Memory's
  `project_build_state.md` and `feedback_analytics_*` should drop
  that bullet on the next memory refresh.

---

## Bug fix — defensive tutorial page handler + ALB Cloudflare-only ingress (2026-05-14)

Two-item session closing the gaps surfaced by Sentry event
`17879686637e4c3fb5096420d3c392a7`. A bot scanner hit the bare ALB IP
at `https://35.176.112.213/dist/ui.browser.js`; the URL fell through
to the dynamic `[categorySlug]/[tutorialSlug]` route, Prisma threw,
and the request 500'd instead of 404-ing. Same probe also exposed
that the ALB security group accepted traffic from anywhere — every
scanner on the internet could bypass Cloudflare's WAF, bot detection,
and rate limits.

### Defensive tutorial page handler

`apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx`:

- **Slug validation:** `SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/` plus
  an `isValidSlug` type guard at the top of the file. Both
  `generateMetadata` and the page component reject invalid slugs
  before the Prisma call — `generateMetadata` returns a `Not found`
  title, the page calls `notFound()`. Catches `ui.browser.js` (dot),
  pathologically long inputs, uppercase, slashes, and URL-encoded
  characters. Genuine tutorial slugs all conform to the pattern.
- **Prisma-error catch:** `loadTutorial` wraps the `prisma.tutorial.findFirst`
  in a try/catch that reports the exception to Sentry at
  `level: 'warning'` with `tags: { route: 'tutorial-page' }` and
  returns `null`. The existing `notFound()` flow downstream handles
  the null return — so a never-seen-before Prisma error 404s
  cleanly with the brand 404 page instead of triggering the
  per-tutorial error boundary's 500.

The pattern mirrors `getCurrentDbUser`'s warning-level catch from the
2026-05-13 Clerk fix.

### ALB Cloudflare-only ingress

- **New `infra/lib/cloudflare-ips.ts`** — readonly arrays of
  Cloudflare's published IPv4 + IPv6 origin CIDRs (15 + 7 ranges,
  refreshed 2026-05-14 from `cloudflare.com/ips-v4` / `ips-v6`).
  Header comment names the source and refresh date.
- **`infra/lib/homemade-stack.ts`** — both ALB listeners (HTTPS:443
  and HTTP:80) flipped from `open: true` to `open: false`. A loop
  after listener creation iterates `CLOUDFLARE_IPV4` + `CLOUDFLARE_IPV6`
  and calls `alb.connections.allowFrom(...)` for each CIDR × both
  ports. End state: ALB security group accepts ingress only from
  Cloudflare CIDRs.
- **CloudWatch alarms unchanged.** All three (`Alb5xxAlarm`,
  `TargetUnhealthyAlarm`, `EcsRunningTaskAlarm`) pull from
  AWS-internal metric services (`AWS/ApplicationELB` +
  `AWS/ECS`) — they don't probe the ALB over the network, so the
  lockdown doesn't affect them.
- **ECS target group health check unchanged.** Inbound to the ECS
  task SG (allowing the ALB to reach `:3000/healthz`) is separate
  from inbound to the ALB SG.
- **Single-deploy.** Pure SG change — no IAM grants or secret
  references — so the two-step CFN pattern from Phase 2e / the
  hardening pass isn't needed here.

### Runbook

`docs/refresh-cloudflare-ips.md` covers: signals it's time to
refresh, the curl-and-compare procedure, the rule-count sanity check
(44 rules currently, well under the 60-rule default SG quota),
deploy + post-deploy validation, and the rationale for hardcoding
vs. fetching at synth time.

### Sentry trace

`SENTRY_AUTH_TOKEN` in `.env.credentials` carries only the `org:ci`
scope, which is the minimum needed for the GitHub Actions
sourcemap-upload step. Reading individual events through the API
returns `403 You do not have permission to perform this action`.
The fix didn't need the exact Prisma error code — both the slug
validation and the catch-all are correct regardless. Pre-launch
debt: provision a Sentry token with `event:read` so future bug-fix
sessions can pull traces without bouncing back to Rebecca.

### Files touched

- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` —
  slug validation + Prisma try/catch + Sentry import
- `infra/lib/cloudflare-ips.ts` (new)
- `infra/lib/homemade-stack.ts` — listeners `open: false`, Cloudflare
  CIDR ingress loop, import for the IP lists
- `docs/refresh-cloudflare-ips.md` (new)

### Things scoped out of this session

- Phase 8 content-pipeline work (step 8 body-authoring prompt
  rewrite is in flight in a parallel session — `docs/tutorial-author.md`,
  `packages/db/scripts/`, `packages/ai/`).
- Social strategy docs.
- New analytics events, marketing pages, admin pages.
- Schema changes.
- Cloudflare SSL / ACM changes beyond reading the existing setup.

### Pre-launch debt observed during this session

- Provision a Sentry auth token with `event:read` (in addition to
  the existing `org:ci`) so worker sessions can pull individual
  event traces without permission failures.

---


## Homepage rebuild — state-aware rail stack + procedural cards + editorial picks + seasonality + onboarding

Workstream 2 of the 2026-05-15 full UX review. Rebuilds the public homepage at production fidelity. Six pieces:

- **Schema migration** `20260616000000_phase_8_homepage_rebuild` — additive. `User.onboardedAt`, `User.primaryCategoryIds[]`, `User.experienceLevel` (new `ExperienceLevel` enum: BEGINNER | INTERMEDIATE | CONFIDENT), `User.homeCountryCode`, `User.dietaryFlags[]`, `User.lastSeenAt`. `Tutorial.heroImageStrategy` (new `HeroStrategy` enum: REAL_PHOTO | PROCEDURAL_CARD | PUBLIC_DOMAIN_PLATE | AI_GENERATED | UNSET). `UserProject.nextScheduledStepNumber`, `UserProject.nextScheduledAt`, `UserProject.scheduledStepsCompleted[]`. New tables: `WeeklyEditorialPick` (5 picks per Monday-anchored week, status auto/pinned/replaced, unique on (weekStarting, position)), `ProjectSchedule` (multi-day arc step definitions: stepNumber, offsetDays, title, body, surfaceAs HERO/RAIL_CARD/NOTIFICATION_ONLY, requiresUserAction). All fields up-front per `feedback_schema_all_fields_upfront.md`.
- **Procedural card system** at `apps/web/src/lib/procedural-card.ts` + `/api/procedural-card/[tutorialId]` Next route. Zero-cost SVG hero placeholder for every tutorial missing a real photo. Category-tinted gradient + parchment grain + Fraunces title + small homemade wordmark. Palette mapping covers all 17 categories with permissive slug-substring fallbacks. Cached at the edge (s-maxage=604800, stale-while-revalidate=86400). `tutorialHeroSrc()` helper in `apps/web/src/lib/tutorial-hero.ts` is the unified resolver — real Media row when present, procedural URL otherwise. No bulk backfill needed: the runtime resolver covers every Tutorial without a hero, and `heroImageStrategy` tracks the intent for future explicit overrides.
- **Seasonality engine** at `apps/web/src/lib/seasonality.ts` — UK calendar across all 12 months with 3-4 themes each, weighted 0-1. Southern-hemisphere countries (AU/NZ/ZA/AR/CL/+) shift the calendar by six months. Country code from Cloudflare's `cf-ipcountry` header at request time, overridden by `User.homeCountryCode` when set. `seasonalityScore(tutorial)` ranks against the tutorial's `mood[]`, `dietaryFlags[]`, `cuisine`, `mealType`, `season`, and `practiceTargets[]`.
- **Editorial picks engine** at `apps/web/src/lib/editorial-picks.ts` + Inngest cron `editorial-picks-refresh` firing Sunday 22:00 UTC. Scoring: recency (+5 in 14d, +2 in 30d), seasonality (+10 strong / +3 mild), engagement (log-scaled bookmarks + projects), recently-featured penalty (-8 in 60d, -3 in 120d), same-category-as-last-week's-#1 (-4). Pinned + manually-replaced rows are preserved across cron runs. Admin page `/admin/editorial-picks` shows the next 4 weeks; each card has pin/unpin + replace-with-tutorial-picker (audit-logged); top-level button regenerates all auto-picks. Server actions in `apps/web/src/lib/editorial-picks-actions.ts` are EDITOR-gated.
- **Onboarding card** at `apps/web/src/components/public/onboarding-card.tsx` — three quiet steps for signed-in users with `onboardedAt === null`. Step 1 multi-select 17 category cards. Step 2 multi-select dietary chips (vegan / vegetarian / gluten-free / dairy-free / nut allergy / halal / kosher / pescatarian). Step 3 single-select experience level — BEGINNER also flips on `beginnerMode` for the first session. Skip allowed; submit + skip both stamp `onboardedAt` so the card never re-pops. PostHog events: `onboarding_started`, `onboarding_completed`, `onboarding_skipped`. Server action in `apps/web/src/lib/onboarding-actions.ts`. Client component is Prisma-free so it doesn't drag the Prisma client into the public bundle.
- **Header restructure** in `apps/web/src/components/public/site-header.tsx` + new `CategoryMenu` client island. Desktop: wordmark left, spine nav centre (Cooking / Baking / Garden / Mindset / Herbal) + "All categories" dropdown for the other 12, pill-shaped search "What are you making?" right, then avatar / sign-in. Mobile (≤900px): nav collapses to a hamburger that opens a bottom-sheet listing every category and Search; search bar takes the freed width. Search is the primary affordance per the brief.
- **State-aware hero + rail stack** in `apps/web/src/app/(public)/page.tsx` + `apps/web/src/lib/homepage-data.ts`. Hero priority: onboarding card → today's scheduled-step (HERO surface) → continue making (most recent IN_PROGRESS within 30 days) → this week's editorial pick #1 → wordmark fallback. Rails, conditionally rendered: today's scheduled actions, continue making, in season right now, this week's editorial picks, saved (bookmarked-but-not-started), where you left off (IN_PROGRESS >14d stale), new since you last visited (uses `User.lastSeenAt`), most-loved per spine category (5 rails), all categories grid. Empty rails don't render. Card metadata always-on: hero (real or procedural) + category + title + time · difficulty + up to 3 dietary glyphs + Saved indicator. Mobile: rails scroll horizontally with snap; hero stacks vertically; bottom-sheet nav.

Commit: `<sha>` — feat(public): state-aware homepage + editorial picks + procedural cards + seasonality + onboarding.

## Admin overhaul — dashboard, content list, preview drawer, taxonomy, glossary, media, cmd-K, RBAC unification

Workstream 3 of the 2026-05-15 full UX review. Reshapes the entire admin surface to Netflix-grade tool quality and 25k+ tutorial scale. Ships a unified `/admin` workspace that creators, editors, and admins all enter.

- **Schema migration** `20260616100000_phase_admin_overhaul_001` — additive. New `SavedFilter` (id, userId, name, description, filterQuery Json, indexed on `(userId, updatedAt)`) and `AdminCommandHistory` (id, userId, command, context Json?, executedAt, indexed on `(userId, executedAt)`). Both cascade on `User` delete.
- **Sidebar restructure (RBAC-aware)** in `apps/web/src/app/admin/layout.tsx` + `apps/web/src/components/admin/admin-sidebar.tsx`. Six top-level groups (Dashboard / Content / Users / Community / Growth / System) with per-item `minRole` gating. Top-of-sidebar block: wordmark, "Open public site →" (new-tab), avatar + role badge. Footer hints ⌘K. CREATOR sees only Content. EDITOR / ADMIN see appropriate groups. Tags item removed from nav.
- **Admin ↔ frontend nav** — public footer surfaces an "Admin" link to anyone with role ≥ CREATOR (creators administer their own content via the unified surface). Admin sidebar links out to the public site.
- **/admin dashboard rebuild** at `apps/web/src/app/admin/page.tsx` + `apps/web/src/lib/admin-dashboard-data.ts` — replaces the placeholder. Top: "Needs attention" inbox (reviews / UGC photos / Q&A / errata / reports / DMCA / creator applications — zero-count rows hide; if everything's zero, shows "All caught up."). Middle: 8 KPI cards (Total published with 7-day delta + sparkline, Total users + sparkline, Active projects this week, New signups this week, Moderation queue depth, Hero coverage %, Today's auto-published, Editorial weeks queued). Sparklines are server-rendered SVG (no client JS). Below: Pipeline widget — published + draft per category with a fill % bar. All aggregates wrapped in `unstable_cache` with 60s TTL.
- **category-counts helper** at `packages/db/scripts/category-counts.ts`. Outputs a markdown grid (per category + per type roll-up) ready to paste into BUILD_PROGRESS.md. Wired as `pnpm --filter db run counts`.
- **cmd-K command palette** at `apps/web/src/components/admin/command-palette.tsx` using the `cmdk` library (Vercel's). Mounted globally on `/admin`. Sections: Recent (last 10 commands from localStorage), Pages (role-filtered list), Tutorials (live fuzzy search via `/api/admin/command-palette` — CREATOR scoped to own), Users (EDITOR / ADMIN only — fuzzy email / name / handle), Actions (New tutorial, Open public site). Each invocation fires `admin_command_invoked` and persists to `AdminCommandHistory` best-effort via `/api/admin/command-palette/record`.
- **Content list rebuild** at `apps/web/src/app/admin/tutorials/page.tsx` + supporting `filters.ts`, `bulk-actions.ts`, `saved-filter-actions.ts`. Big search input, primary chip filters (Status / Type / Category — multi-select), "More filters" drawer (Cuisine / Meal type / Mood / Dietary / Difficulty / Season / Hero / Author), sort selector (Updated / Published / Title), view toggle (Table / Grid), page-size selector (25/50/100). Saved-filters row with per-row delete + "+ Save current filter" CTA. Bulk action bar (appears with ≥1 row selected): publish / unpublish / archive / delete (ADMIN only), plus "Apply to all N matching the filter" mode that re-derives the WHERE clause server-side from the URL query so admins can't smuggle an over-broad selector. Status pill clicks now filter to that status. Title click and edit link both open the editor. Thumbnail in table rows. Grid view shows hero cards.
- **RBAC scoping in content list + actions** — CREATOR queries scope to `creatorId = user.id`. Editor actions (`updateTutorial`, `createTutorial`, `transitionTutorialStatus`) now go through a `requireContentActor` helper + `assertRowAccessible` ownership check for CREATORs. CREATOR can submit DRAFT → PENDING_MODERATION; PUBLISHED / SCHEDULED / ARCHIVED transitions stay EDITOR-and-above. Bulk actions are EDITOR-and-above; bulk delete is ADMIN-only.
- **Edit page sticky preview drawer** in `apps/web/src/components/admin/tutorials/tutorial-form.tsx` + `tutorial-form.css`. Sticky top-of-form button toggles a fixed-position right-side drawer (40 vw, min 360 px) that renders the public preview live via the existing `PreviewPane`. Editor + drawer coexist (60/40 split); editor stays editable while drawer is open. Drawer collapses to full-width on phones. Body section is now visible above-the-fold for the most common edit case Rebecca flagged.
- **Categories tree view** at `apps/web/src/app/admin/categories/page.tsx`. Replaces the separate Categories + Sub-categories pages with one collapsible tree using `<details>` for native expand/collapse. Each category row shows tutorial count + sub-category count; expanding reveals sub-categories with edit + delete + inline "Add sub-category" form. Bottom-of-page form creates a new top-level category. `/admin/sub-categories` and `/admin/sub-categories/*` redirect to the tree.
- **/admin/tags retired** — the route returns a notice explaining that tags were replaced by mood / meal type / dietary / cuisine typed fields. The Tag Prisma model stays intact (per `feedback_schema_all_fields_upfront.md` — a future cleanup migration drops it once production has no references). Tags removed from sidebar.
- **Glossary scale fixes** at `apps/web/src/app/admin/glossary/page.tsx`. Search input (term / slug / definition) + category filter (including "cross-category — no parent" option) + pagination preserved. Clean table with subdued styling.
- **Media scale fixes** at `apps/web/src/app/admin/media/page.tsx`. Search by filename / alt / caption + type filter (PHOTO / VIDEO / DIAGRAM / ILLUSTRATION) + status filter (UPLOADING / READY / FAILED) + pagination. Grid view with thumbnails; per-tile "Hero on N tutorials" reverse-ref count from the `tutorialsHero` relation.
- **RBAC unification** — `/me/creator/tutorials`, `/me/creator/tutorials/new`, and `/me/creator/tutorials/[id]` now redirect to their `/admin/tutorials*` equivalents. Existing in-app links updated. `/me/creator` landing page kept as the personal creator dashboard (stats, applications). `creator-tutorial-actions.ts` library kept as an orphan for now (zero callers post-redirect) — pre-existing creator-only routes can resurrect it if needed; a cleanup pass can drop it once we're confident.
- **Analytics events** wired throughout via `lib/client-analytics.ts` (consent-aware): `admin_command_invoked`, `admin_saved_filter_created`, `admin_bulk_action`, `admin_preview_drawer_opened`. `admin_dashboard_kpi_clicked` and `admin_attention_inbox_action` are documented in `docs/analytics-taxonomy.md` but not yet wired (KPI / inbox rows are server-rendered Links — wiring needs a thin client island; deferred to a follow-up).
- **Voice** — all new copy follows `feedback_homemade_voice.md` (no "honest", no "delve into", no urgency cues, plain factual language).

Bundle impact: `cmdk` adds ~12 kB gzipped to the shared admin chunk; the rest of the rebuild moved logic between server / client without adding heavy deps. Build emits one pre-existing warning about Prisma's CJS `export *` shape — unrelated to this work.

**Deferred to a follow-up session** (out of scope under the worker prompt's "as many as fit cleanly" framing — the spec stayed inside the spirit of the brief while keeping the diff coherent):
- Drag-reorder for categories / sub-categories (HTML5 DnD would be a 200-line addition); current UI relies on the existing `order` integer column.
- Glossary inline-coverage rule enforcement (`feedback_inline_glossary_coverage.md` — needs body-walk per term, expensive at scale; right home is a nightly job).
- Bulk edit modal + bulk export JSON action.
- Dashboard "Deploys with non-zero exit (last 24h)" inbox row (needs gh CLI shelled from a server action — pre-launch debt).
- Dashboard "Voice-check failure count from last bulk batch" inbox row (needs glob + parse of latest `docs/bulk-batch-*-report.md`).
- Dashboard "Sentry error rate spike" inbox row (needs Sentry API token).
- Wiring `admin_dashboard_kpi_clicked` + `admin_attention_inbox_action` (KPI cards are server-rendered; needs a thin client island).
- Bottom-sheet trigger for sidebar on phones (the layout collapses but trigger could be cleaner).

Commit: `<sha>` — feat(admin): dashboard rebuild + content list + preview drawer + cmd-K palette + categories tree + RBAC unification.

## Homepage polish — inline onboarding card, arrow-scroll rails, density compression

Workstream 2b of the 2026-05-15 full UX review. Three targeted changes to the homepage shipped at `0b29ccf`.

- **OnboardingCard rewrite** (`apps/web/src/components/public/onboarding-card.tsx` + `.css`). Replaced the large centred-card screen takeover with a compact inline card (~200-260px desktop) that sits between the site header and the first rail, visible only when `onboardedAt === null`. New question phrasing: "What are you drawn to?" / "Anything you'd rather skip?" / "Where are you at?". Step indicator ("Step X of 3") and Back button removed. "Skip for now" link top-right, always visible. "Continue" pill (sage fill, Fraunces, 36px tall) bottom-right — appears only when ≥1 tile is selected on Q1, always on Q2, absent on Q3 (Q3 single-select auto-completes on tile tap). Experience level labels updated: "Just starting out" / "Making things for a while" / "I know my way around". Tile row uses the same `RailScroll` component as the homepage rails. Server actions (`completeOnboardingAction`, `skipOnboardingAction`) and analytics events (`onboarding_completed`, `onboarding_skipped`) unchanged.

- **RailScroll component** (`apps/web/src/components/public/rail-scroll.tsx`). New client component wrapping every horizontal rail and the onboarding card tile row. Native scrollbar hidden (`scrollbar-width: none` / `::-webkit-scrollbar { display: none }`). 36px sage-circle arrow buttons with cream chevron SVG sit at the rail's left and right edges, overlapping the first/last card. On desktop: arrows are invisible by default and fade in (150ms opacity transition) when the `.rs-wrap` container is hovered. On mobile (≤768px): arrows are `display: none`; native touch-swipe handles scrolling. Click scrolls by ~85% of the container's `offsetWidth` via `scrollBy({ behavior: 'smooth' })`. Each scroll event updates disabled state — arrows fade to 30% opacity and `pointer-events: none` at start/end. Right-side 48px cream gradient fade acts as a "more →" cue; disappears when fully scrolled. `HomeRail` updated to use `RailScroll` as its scroll wrapper.

- **Density compression** (`apps/web/src/app/(public)/home-page.css`). Between-rail padding: 80px → 40px desktop, 28px mobile. Card gap within rails: 28px → 14px. Hero zone: 64px/56px padding → 40px/32px + `max-height: 60vh` cap on desktop. Rail heading: 28px → 20px. Page side padding: 32px → 24px desktop, 16px mobile. Card body gap: 14px → 10px. Category tile grid gap: 16px → 12px. All-categories section padding: 80px/96px → 40px/56px. `home-hero-zone` hidden for onboarding users (card renders in new `home-onboarding-zone` section above the rail stack).

No schema changes. No new analytics events. No admin surface changes.

Commit: `761e2d3` — feat(homepage): inline onboarding card, arrow-scroll rails, density compression.

Out of scope: no admin overhaul beyond editorial picks (next workstream), no Capacitor / native mobile UX (next workstream), no analytics rethink, no marketing pages, no content authoring, no bulk image regeneration via paid APIs.

## Self-hosted analytics — schema, dual-fire, rollups, eight admin dashboards

Workstream 4 of the 2026-05-15 full UX review. Adopts the Aura pattern for our own scale: every event lands in our database alongside the existing PostHog mirror, and the admin dashboards read from summary tables a nightly Inngest cron rolls up.

- **Schema migration `20260616200000_phase_analytics_self_hosted_001`** — additive. Four new tables.
  - `AnalyticsEvent` — raw row per fired event. Columns: `clerkUserId`, `sessionId`, `event`, `category`, `properties` (JSONB), `url`, `pathname`, `referrer`, `userAgent`, `country`, `deviceClass`, `cohortWeek`, `acquisitionChannel`, `utmSource`/`utmMedium`/`utmCampaign`. Eight indexes covering the expected query shapes (per user, per event, per session, per category, per cohort+event, per path, per country, per channel).
  - `AnalyticsDailyRollup` — one row per `(date, metric, dimension)`. `dimension` is non-null with sentinel `__total__` for the unsplit total (Postgres treats NULL as distinct in unique indexes; the sentinel keeps `prisma.upsert` honest).
  - `AnalyticsCohortRollup` — one row per `(cohortWeek, weeksAfterSignup)` with `cohortSize`, `retainedCount`, `retentionRate`. Re-upserts on every cron run since retention can shift as data lands late.
  - `AnalyticsRollupRun` — idempotency tracker keyed on UTC date.

- **Capture pipeline.**
  - `lib/analytics-events.ts` (new leaf module) — `EVENT_CATEGORIES` map + `categoryFor()` + `PosthogEvent` type + `ROLLUP_TOTAL_DIMENSION` sentinel. Imported by both posthog.ts and the capture API route so there's no cycle.
  - `lib/posthog.ts` — `captureServerEvent` extended to write to `AnalyticsEvent` first, then PostHog. All ~30 existing server-side call sites dual-fire automatically with zero per-site change. New `capturePremiumServerEvent` skips PostHog (premium-feature instrumentation that should not leak to third-party tools).
  - `lib/server-analytics.ts` — re-exports + `captureEvent` / `capturePremiumEvent` aliases for new code that wants to be explicit about intent.
  - `lib/analytics-session.ts` — `homemade-session` cookie, sliding 30 minutes, server-issued, separate from Clerk's auth session. Used as the analytics session id so funnel + drop-off views work for signed-out visitors.
  - `lib/client-analytics.ts` — `captureClientEvent` now dual-fires via `navigator.sendBeacon('/api/analytics/capture', …)` (with a `fetch(keepalive: true)` fallback) after the PostHog capture.
  - `app/api/analytics/capture/route.ts` — accepts the client-side beacon. Permissive shape (analytics taxonomy lives in code, not at runtime). Server-side cohort + acquisition lookup from the User row so the client cannot fake the denormalised fields.

- **Nightly rollup.** `lib/analytics-rollup.ts` exposes `rollupDay(date)` and `rollupRange(args)`. Computes DAU, MAU (rolling 30d), signups (total + by channel + by country), tutorials_published, tutorial_views, bookmarks_created, tutorials_completed, projects_started/completed, search_queries, search_zero_results, errors_total. Plus cohort retention upserts up to W12 for every (cohort, weeksAfterSignup) pair on every run. Idempotent.
  - `inngest/functions/analytics-rollup.ts` — `analyticsRollupNightly` (cron 02:00 UTC) + `analyticsRollupBackfill` (event `analytics/rollup.backfill`).
  - Manual trigger button at `/admin/system/jobs` — date-range picker + `force` re-run checkbox. Wraps `triggerAnalyticsRollup` server action with audit log + Inngest send.

- **Eight admin dashboards under `/admin/analytics`.**
  - `/admin/analytics` — overview. Eight KPI cards (DAU, MAU, signups 7d, published 7d, bookmarks 7d, projects in progress, zero-result searches today with red highlight at >50, errors 7d with red highlight at >2× prior). Sparkline + signups + DAU trends + top-5 categories bar.
  - `/admin/analytics/cohorts` — flagship cohort retention heatmap. Sage-shade table W0..W12, milestone toggle (W0 / W1 / W4 / W12) that swaps to a per-cohort horizontal bar list. Renders from `AnalyticsCohortRollup`.
  - `/admin/analytics/activation` — vertical funnel (visit → signup → onboarding → first bookmark → first project started → first project completed). Range picker (7d/30d/90d). Cohort-aware activation table.
  - `/admin/analytics/content` — top 50 tutorials by views with bookmark + project-start conversion rates joined from matching events. Range picker.
  - `/admin/analytics/search` — top 50 searches with CTR per query, top 50 zero-result searches (the editorial content-gap signal), 90-day search-queries trend.
  - `/admin/analytics/acquisition` — signups by channel / country / UTM source / device class, plus W4 cohort retention split by dominant channel.
  - `/admin/analytics/creator` — applications, approval/rejection split, application-to-decision timing (avg / p50 / p90), per-creator performance table.
  - `/admin/analytics/system` — events stored, last rollup status, 14-day rollup-run history, error-boundary trend.

- **Brand visual treatment.** Recharts-based with a single `chart-theme.ts` for palette + typography. Sage primary, soft-parchment background, sage-15% grid, Fraunces titles, Lora axis labels, monospace tabular numbers. Flat — no gradients, no 3D, no curve fills. Cohort heatmap uses `sageShade(rate)` to interpolate parchment → forest. `ChartCard` + `KpiCard` shared wrappers.

- **Sidebar.** `/admin/analytics` no longer a placeholder. Growth → Analytics now expands into eight sub-items.

- **Pre-launch checklist.** "PostHog dashboards build" item removed — we don't build dashboards in PostHog. PostHog stays for session recordings + heatmaps + ad-hoc event exploration.

Out of scope (deliberately): no PostHog UI dashboards built, no real-time, no ClickHouse migration (raw `AnalyticsEvent` will eventually want partitioning by month or a move to ClickHouse / TimescaleDB at scale — flagged for a future session, not blocking launch), no new analytics events (the existing taxonomy was sufficient), no homepage / admin overhaul / mobile / billing surface work.

Commit: `<sha>` — feat(analytics): self-hosted dual-fire + nightly rollup + eight admin dashboards.

## Phase 8 — Content integration session (2026-05-16)

Eighth pre-launch integration session. Sequenced spec: schema additions,
image sourcing two-pass, public attribution tooltip, CDK secret-mount,
authoring prompt v5 updates, voice-check structural rules, category
descriptions rewrite, self-halt notification, audit report. Master
gap-fill skipped per the 2026-05-16 personal-recipes QC report ("0
additions needed").

- **Schema migration `20260617000000_phase_8_content_integration_001`** —
  additive. `Media.source`, `Media.sourceUrl`, `Media.creatorName`,
  `Media.licenceCode`, `Media.licenceUrl`, `Media.requiresAttribution`
  (default false). New `Media.source` index. The image-sourcing
  orchestrator writes these per hero so the public renderer can decide
  whether to show the discreet © tooltip.

- **Schema migration `20260617100000_phase_8_autopilot_halt_signal`** —
  `AutopilotHaltSignal` table (id, stream, reason, detail, notifiedAt,
  createdAt). Index on `(notifiedAt, createdAt)`. Workers + scheduled
  tasks write halt signals here; the hourly Inngest cron drains them.

- **Image sourcing pipeline.** New module
  `apps/web/src/lib/image-sourcing/` with per-source clients (Unsplash,
  Pexels, Wikimedia Commons, Pixabay, Flux Schnell via fal.ai) plus an
  `orchestrator.ts` that walks a per-category priority list per
  `docs/free-image-research.md`. Cooking specialty paths (Middle-Eastern,
  preserves, air-fryer) skip Wikimedia; Mindset somatic paths
  (tapping, embodiment, ritual) skip free sources entirely and go
  straight to Flux Schnell. Attribution rules baked in — Unsplash /
  Pexels / Pixabay get `requiresAttribution: false`; Wikimedia CC-BY /
  CC-BY-SA get `true`. `upload-tutorial.ts` extended with a `hero.remoteUrl`
  pathway: the script fetches the upstream URL, pushes to R2, and
  populates the structured attribution fields on the Media row.

- **Discreet attribution tooltip.** New `HeroAttribution` client
  component renders a 20 px © glyph at 20 % opacity in the hero's
  bottom-right; on hover / focus it opens a single-line popover with
  photographer / source / licence link. Public renderer at
  `app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` selects the new
  Media fields and passes them to `TutorialChrome` only when
  `requiresAttribution === true`. Per Rebecca's brief in
  `project_ux_review_briefs.md`: "anything that doesn't need an
  attribution visibly, I don't want to give one … something discrete."

- **CDK secret-mount (two-step pattern).** Image-sourcing API keys
  (`UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY`, `FAL_KEY`)
  wired into the stack at `infra/lib/homemade-stack.ts`. Deploy 1
  (this commit) lands the IAM grant on the execution role; Deploy 2
  (`MOUNT_IMAGE_SOURCING_SECRETS=1`) adds the env references. The
  orchestrator no-ops per source when an env var is absent, so the app
  boots fine without the secrets mounted. Worker sessions use the keys
  from `.env.credentials` directly; mounting in ECS is for future
  server-side bulk-fill / audit-fix jobs.

- **Authoring prompts v5.** `docs/tutorial-author.md` (v5),
  `docs/baking-author.md` (v2), `docs/mindset-author.md` (v4) all bumped
  with a shared content-integration appendix:
  - Image-sourcing two-pass — call `sourceHeroImage()` after voice-check
    passes; set `hero.remoteUrl` + structured attribution on the draft.
  - ProjectSchedule registration — for sourdough starter builds, long
    ferments, cured meats, cheese ageing, preserve maturation,
    marinades > 24 h.
  - Cross-category audit rules — canonical °C temperatures, inline
    glossary coverage (registered AND used), servings vs yieldDescription
    exclusivity, freezeNotes reality.
  - Missing-techniques logging — `subTutorialCard` blocks now accept
    `tutorialSlug`; upload script resolves to id, logs unresolved slugs
    to `docs/missing-techniques.md` for a future technique-authoring
    session.

- **Voice-check structural rules.** `packages/db/scripts/voice-check-lib.ts`
  gains three deterministic rules:
  - `glossary-coverage` — every entry in `glossaryTerms[]` must appear
    inline in a `glossaryTooltip` mark, and every inline mark must
    resolve to a registered slug. Both directions fail.
  - `temperature-canonical` — warns when prose mentions a fan oven at a
    higher temperature than `recipe.temperatureCelsius` (likely fan
    value stored as conventional).
  - `servings-yield` — fails when both `servings` and `yieldDescription`
    are set on a RECIPE row.

- **Category descriptions rewrite.** Old Cooking / Baking / Mindset
  descriptions read AI ("for the parts of life that need tending",
  "grounded gentle real"). Rebecca's brief was clear: factual,
  recipe-led for Cooking, no inspirational coda. New descriptions live
  in `packages/db/scripts/update-category-descriptions.ts` and shipped
  to prod against all three rows.

- **Self-halt notification.** `apps/web/src/inngest/functions/autopilot-halt-notify.ts`
  runs hourly, drains unsent `AutopilotHaltSignal` rows, surfaces each
  via Sentry (warning level, tagged `kind=autopilot-halt`) plus
  CloudWatch log. No email service is wired yet, so this is the
  fallback path; a future session swaps Sentry-capture for a real email
  send (Postmark / Resend) without changing the table contract.

- **Audit report.** `packages/db/scripts/content-audit.ts` ran against
  538 PUBLISHED tutorials. Report-only — no rows modified. Output at
  `docs/content-audit-2026-05-16.md`. Headline findings:
  - 51 RECIPE rows have both `servings` and `yieldDescription` set —
    targeted fix needed in a follow-up audit-fix session.
  - 529 tricolon warnings, 74 Americanism warnings, 14 brand-trademark
    warnings — already known patterns from the bulk content sessions;
    deferred to the voice-editor pass.
  - 1 `temperature-canonical` warning — the prose mentions fan oven
    higher than the stored °C.
  - 536 / 538 tutorials still on procedural-card heroes — the pre-launch
    bulk image-fill phase consumes this list.
  - 0 unresolved glossaryTooltip references.

- **Master ingredient + tool gap-fill skipped.** The 2026-05-16
  personal-recipes QC report (`docs/personal-recipes-qc-report.md`)
  recorded "Master-list additions this session: 0" — every flagged
  ingredient / tool from past batches is already in the master tables.

Out of scope (deliberately): no autopilot scheduled-task creation
(next session), no email service wiring, no mobile / iOS work, no
automated body rewrites against the audit findings, no homepage /
admin overhaul.

## Phase 8 — Content fix-up + hero fill (2026-05-16)

Follow-up to `phase_8_content_integration_001`. Consumes the audit
report and runs three pieces of work.

- **Servings / yieldDescription — 51 rows fixed.** All RECIPE rows
  flagged by the audit's `servings-yield` rule had both fields set.
  Per-slug decisions encoded in
  `packages/db/scripts/fixup-servings-yield.ts`: 39 yield-description
  (preserves / cakes / loaves / discrete-item recipes), 12 servings
  (sit-down meals). One `TutorialVersion` snapshot per row, one summary
  `AuditLog`. Next audit pass should report 0 `servings-yield` errors.

- **Hero image fill — 536 / 536 attached.** Every PUBLISHED tutorial
  on a procedural-card hero now has a real image. Ran the new
  `packages/db/scripts/fixup-hero-fill.ts` against
  `sourceHeroImage()` per category priority. Mix:
  Pexels 237, Pixabay 213, Unsplash 39, Wikimedia 31, Flux Schnell 16.
  AI fill cost ~£0.02 — far under the £5 cap and the £52-at-25k-tutorials
  projection in `docs/free-image-research.md`. Wikimedia downloads
  initially 429'd; adding a descriptive `User-Agent` on the download
  fetch (their policy requires one) cleared all 24 throttled rows on
  the third run. All Wikimedia images carry `requiresAttribution = true`
  so the public renderer surfaces the discreet © tooltip.

- **Tricolons — 574 deferred to manual review.** Built and dry-ran
  `packages/db/scripts/fixup-tricolons.ts` for a deterministic "drop
  the third item" rewrite. Found that almost every tricolon the voice-
  check regex flags is a content list — recipe ingredients ("ground
  ginger, allspice, and a small dried chilli"), recipe steps ("Add the
  apple, fruit, and vinegar"), place names, section headings —
  not a stylistic tell. Auto-rewriting deletes information. Even a
  conservative gate (single-word adjective items, no ingredient stop-
  list, at most one uppercase first letter) only let through ~1%, and
  the one that passed was the heading "Pat, cut, and top". Auto-
  rewrite abandoned. Full per-snippet list dumped to
  `docs/tricolon-defer-list.md` (574 matches across 312 tutorials, ±60
  chars of context each) for a future focused-review session. A second
  follow-up — tightening `containsTricolon` in `voice-check-lib.ts` to
  only flag adjective-pattern tricolons — would shrink the warning
  count on the next audit. Both deferred.

- **CDK image-secrets mount — deployed.** Four secrets created in AWS
  Secrets Manager (`homemade/unsplash-access-key`,
  `homemade/pexels-api-key`, `homemade/pixabay-api-key`,
  `homemade/fal-key`) from `.env.credentials` values. CDK stack updated
  to add `UNSPLASH_APPLICATION_ID` as a plain env var (public id, not a
  secret — gated on the same mount flag). Two-step deploy from the
  local `claude-deploy` user: Deploy 1 landed the IAM grant on the
  execution role with no task replacement (26 s); Deploy 2
  (`MOUNT_IMAGE_SOURCING_SECRETS=1`) rolled the task definition with
  the four secret refs + the `UNSPLASH_APPLICATION_ID` env (6 min, ECS
  circuit-breaker waited for healthy tasks). `aws ecs describe-task-
  definition` shows all five values; `/healthz` returns 200. Server-
  side bulk-fill / audit jobs can now call `sourceHeroImage()` without
  `.env.credentials`. (The first attempt at this from the previous
  session used the shell's default AWS profile — `aura-deployer` on
  the Aura account — and hit Access Denied; loading `.env.credentials`
  explicitly resolves to `claude-deploy` on account `213615929920`,
  the actual Homemade account, which has the right policy attached.)

- **Scripts added in `packages/db/scripts/`.**
  `fixup-servings-yield.ts`, `fixup-hero-fill.ts` (excluded from the
  package typecheck since it imports across packages via relative
  path — works under tsx), `fixup-tricolons.ts`,
  `tricolon-defer-list.ts`, `_inspect-tricolon.ts` (debug helper).

Out of scope (deliberately): no autopilot scheduled-task creation,
no email service wiring, no mobile / iOS work, no homepage / admin /
billing surface work, no schema changes, no new analytics events.

Commit: `<sha>` — Phase 8 content fix-up: 51 servings/yield rows fixed,
hero fill 536/536, tricolons deferred, CDK mount deferred.

## Mobile rebuild — native shell, bottom tabs, cooking mode, offline, camera, push, App Store scaffolding (2026-05-16)

Shipped in worker session `phase_mobile_rebuild_001`. Eight pieces of
mobile work plus a cross-cutting responsive tuning pass.

- **Schema migration `20260618000000_phase_mobile_rebuild_001`.**
  - `User.pushNotificationsEnabled` (Boolean default false) — master
    push toggle.
  - `User.cookingModeAutoEnable` (Boolean default false) — pref so
    recipes open straight into cooking mode on mobile.
  - `Notification.pushed` + `Notification.pushedAt` — bookkeeping so we
    can see which in-app notifications were also dispatched as a push.
  - `PushSubscription` table (one row per registered device-token per
    platform per install) + `PushPlatform` enum (`IOS`/`ANDROID`/`WEB`).
    `enabledCategories` array stores the per-category opt-ins.

- **Bottom tab bar.** `apps/web/src/components/public/mobile-tab-bar.tsx`
  with five tabs (Home / Search / Saved / Alerts / Account). Visible at
  ≤768px, hidden on desktop, hidden inside `/admin`. Notifications tab
  carries an unread badge fed by `/api/me/notifications/unread-count`.
  Sits above the iOS home indicator via `env(safe-area-inset-bottom)`.

- **Cooking mode reader.** New wrapping client component at
  `apps/web/src/components/public/cooking-mode/` — `CookingModeShell`
  owns context + the overlay, `CookingModeToggle` lives in the actions
  bar of every RECIPE-type tutorial. Method body is segmented into
  step pages (h2 boundaries; an ordered-list-only method explodes per
  list item). Ingredients pin to the top via `<details open>`.
  Persistence: `localStorage:homemade:cookingMode:<slug>` stores
  enabled + stepIndex so resume works. `useKeepAwake` hook calls
  `@capacitor-community/keep-awake` inside the wrapper and the Web
  WakeLock API on the open web. Keyboard arrows + Esc supported.

- **Service worker + offline.** `apps/web/public/sw.js` registered by
  `ServiceWorkerRegister`. Caches the UI shell, master ingredient/tool
  refs, hero images (cache-first), and tutorial / category pages
  (stale-while-revalidate). Skips admin, /api/*, search, sign-in.
  Bookmark toggle calls `window.homemadePrecache([path])` so saved
  recipes warm the cache proactively; unbookmark evicts. `/offline`
  page renders as the SW fallback when neither cache nor network
  succeeds. `OfflineBanner` watches `navigator.onLine` and shows a
  small sage strip when offline.

- **Native camera.** `apps/web/src/lib/native-camera.ts` detects
  `Capacitor.isNativePlatform()` and routes through `@capacitor/camera`
  on the wrapper. Web path keeps the existing file picker but adds
  client-side compression (JPEG 85, max 2048px longest edge) via the
  same `compressImage()` helper. `PhotosBlock` upload form picks the
  right branch automatically + falls back gracefully.

- **Push notifications.** `apps/web/src/lib/push-notifications.ts`
  exposes `sendPushToUser()` + `notifyWithPush()`; existing
  `notify()` was rewired to fire-and-forget a push when the
  NotificationType maps to a known category. Categories: project
  schedule / moderation outcome / creator application / weekly digest.
  Three API routes: `/api/me/push/register`, `/api/me/push/unregister`,
  `/api/me/push/categories`. Contextual opt-in card (`PushOptIn`)
  renders only inside the Capacitor wrapper, only when the user has
  ≥1 IN_PROGRESS UserProject, and only until dismissed.
  `/me/settings` gains a per-category toggle pane + a master "turn off"
  button. **Wire-level dispatch (APNs HTTP/2 + FCM) is intentionally a
  no-op stub for now** — `dispatch()` in
  `push-notifications.ts` logs the intended push and returns true.
  Real APNs needs a signed `.p8` in Secrets Manager; real FCM needs
  Rebecca to register the Homemade app in a Firebase project linked
  to her Google Play Console account.

- **Scheduled-step Inngest cron.** Daily 09:00 UTC sweep at
  `apps/web/src/inngest/functions/scheduled-step-push.ts`. For each
  active UserProject whose user has push enabled, finds
  `ProjectSchedule` rows whose `offsetDays` have elapsed and dispatches
  `notifyWithPush({ category: 'project_schedule' })` for each.
  Idempotency keyed off a `[step:<projectId>:<stepNumber>]` marker
  baked into the notification body. Registered in
  `apps/web/src/app/api/inngest/route.ts`.

- **Native splash + app icon.** `capacitor.config.ts` updated with
  cream background, dark-mode variant, status bar style LIGHT, and
  PushNotifications presentation options. New generation script
  `apps/mobile/scripts/build-source-assets.js` renders SVG → PNG via
  sharp (icon, foreground/background tiles for Android adaptive,
  2732×2732 splash with the "homemade" wordmark, dark splash). Run
  `pnpm --filter @homemade/mobile assets:source && assets:generate` to
  regenerate every platform-specific asset. The existing source
  `icon.png` (sage "h" on cream) was already brand-aligned and was
  preserved.

- **App Store scaffolding.** `docs/app-store-listing.md` with locked
  bundle identity (Homemade Education / `education.homemade.app`),
  placeholder copy slots, privacy nutrition declarations, push
  category list. `docs/mobile-screenshots.md` with the capture
  sequence + per-platform pixel dimensions.

- **Mobile-responsive tuning pass.** New `mobile-tuning.css` imported
  from the public layout. Touch targets ≥44px on every primary
  interactive surface, header padding tightened on phone widths, TOC
  + project companion sidebars hidden on mobile so the body claims the
  column, body line-height bumped on small screens. Tutorial cards
  switch to 3:4 portrait aspect ratio with tighter title + meta on
  ≤768px.

Plus mobile-only Capacitor plugin deps added: `@capacitor/camera`,
`@capacitor/device`, `@capacitor/push-notifications`,
`@capacitor-community/keep-awake`. Ambient `.d.ts` shims in
`apps/web/src/types/capacitor-shims.d.ts` keep the dynamic imports
type-safe without forcing apps/web to depend on the mobile-only
modules at runtime.

Out of scope (deliberately): no APNs / FCM wire-level dispatch (needs
Rebecca-side credential provisioning), no real screenshot generation,
no homepage redesign beyond responsive tuning, no analytics or admin
work, no content authoring, no voice-control hooks (deferred per
locked decision).

## Phase 8 — Autopilot wire-up (2026-05-16)

Standing infrastructure that fires the content pipeline for cooking,
baking, and mindset on a daily cron without a per-batch prompt from
Rebecca. Each fire is one Claude Code worker session reading its
stream's autopilot prompt; the prompt's pre-flight gates decide
whether the fire skips, halts, or runs.

- **Three autopilot prompt templates.** Self-contained worker prompts
  at `docs/autopilot-prompts/cooking.md`, `docs/autopilot-prompts/baking.md`,
  `docs/autopilot-prompts/mindset.md`. Per-fire procedure (shared
  shape, per-stream content):
  1. **Environment pause** — exit clean if `AUTOPILOT_PAUSED=true`.
  2. **No-double-firing check** — exit clean if a `claude/*` branch
     has committed to the stream's briefs / report files in the last
     2 hours.
  3. **Auto-determine batch number** — N+1 from existing
     `<stream>-bulk-*-report.md` (cooking is `bulk-batch-*`).
  4. **Backlog-drain check** — count in-scope candidates (backlog
     minus skip-list of anchors + pilot + personal + prior batches);
     halt + disable cron if fewer than the per-stream threshold
     remain (50 for cooking / baking, 100 for mindset).
  5. **Quality-drift check** — if voice-check error counts across
     the last 3 batch reports trended up by more than 50%, skip the
     fire without disabling the cron.
  6. **Hard chain cap** — if 10+ consecutive autopilot batches have
     landed since the last human commit, halt + disable cron.
  7. **Auto-determine slice** — pick a 50-entry slice that
     under-represents the running cuisine / sub-category /
     practice-type distribution from the last 3 batch reports.
  8. **Run the standard pipeline** — for each entry: brief →
     draft → self-critique → voice-check (3-retry cap, drop + log
     on failure) → upload `--status PUBLISHED` (3-retry cap, drop +
     log).
  9. **Close the batch** — write the batch report, append
     anti-tells / common-issues entries for any pattern recurring
     3+ times, update the Multi-category fill plan grid, append a
     short autopilot entry to BUILD_PROGRESS, commit + push to
     main, run the deploy verification block.

- **Halt-signal helper.** New `packages/db/scripts/write-halt-signal.ts`
  writes a row to `AutopilotHaltSignal`. Pre-flight failures and the
  3rd-retry deploy failure both invoke it. The hourly Inngest cron
  (`autopilot-halt-notify`, registered in
  `apps/web/src/app/api/inngest/route.ts`) drains the rows and
  surfaces them via Sentry (warning, tag `kind=autopilot-halt`) +
  CloudWatch. Reason codes documented inline:
  `ENV_PAUSED`, `SKIPPED_DOUBLE_FIRE`, `BACKLOG_DRAINED`,
  `QUALITY_DRIFT`, `HARD_CAP_REACHED`, `DEPLOY_FAILED`.

- **Three scheduled tasks (one per stream).** Created via the
  ScheduledTasks MCP — `autopilot-cooking-bulk` (cron `0 2 * * *`,
  early-morning local time), `autopilot-baking-bulk` (`0 4 * * *`,
  2h after cooking), `autopilot-mindset-bulk` (`0 6 * * *`, 2h after
  baking). All Sonnet, all notify-on-completion. The 2h stagger
  prevents three concurrent worker sessions banging on the same
  ECS task / Inngest queue / git remote at once.

  > **Note on creation.** The scheduled-task MCP tool requires
  > interactive approval per call (each create / update fires a
  > confirmation dialog). The autopilot-wire-up worker session ran
  > unsupervised, so the three crons were not created from inside
  > the session — Rebecca creates them in an interactive Claude
  > Code session using the prompt-file contents loaded verbatim
  > as the `prompt` field. Task IDs (`autopilot-cooking-bulk` /
  > `autopilot-baking-bulk` / `autopilot-mindset-bulk`) and cron
  > expressions are fixed; the autopilot prompts reference those
  > IDs directly for the self-disable path. Re-record the actual
  > task IDs here when the crons land.

- **Pause flag.** `AUTOPILOT_PAUSED=true` set in the local
  environment (or the scheduled-task launch env) causes every
  fire to write an `ENV_PAUSED` halt signal and exit clean
  without drafting or uploading anything. No code change in
  `apps/web` is needed — the autopilot prompt reads the env var
  at preflight (step 0). To pause:

  ```bash
  # Either:
  export AUTOPILOT_PAUSED=true            # bash / linux
  $env:AUTOPILOT_PAUSED = "true"          # PowerShell

  # Or per-task — disable the scheduled task entirely:
  mcp__scheduled-tasks__update_scheduled_task \
    taskId=autopilot-cooking-bulk enabled=false
  ```

  The env-flag path is preferred for short pauses (a session or
  two); the scheduled-task-disable path is preferred for longer
  pauses where the daily fire shouldn't even start a session.

- **First fires.** Cooking 02:00 local, baking 04:00 local, mindset
  06:00 local — the morning after the three scheduled tasks land
  via the interactive create step. The first mindset fire takes a
  smaller slice (target 20 rather than 50) since the pilot-10 step
  hasn't run yet — it serves as both pilot and bulk-001.

- **Halt signal monitoring.** `autopilot-halt-notify` (Inngest,
  hourly, `0 * * * *`) was wired in the prior content-integration
  session (`apps/web/src/inngest/functions/autopilot-halt-notify.ts`).
  Verified registered in `apps/web/src/app/api/inngest/route.ts`.
  Surface path is Sentry + CloudWatch until Resend email lands.

Out of scope (deliberately): no content authoring this session
(infrastructure only); no schema changes; no email service wiring;
no edits to the authoring prompts (`docs/tutorial-author.md` v5,
`docs/baking-author.md` v2, `docs/mindset-author.md` v4 stay as-is);
no mobile / UI / admin / analytics work; no Inngest cron schedule
changes.

Commit: `<sha>` — Phase 8 autopilot wire-up: three stream prompts +
halt-signal helper + scheduled-task plan + BUILD_PROGRESS section.

## Tricolon audit — voice-tell rewrite pass (2026-05-16)

Deferred task from the Phase 8 content fix-up session: the
2026-05-16 `voice-check-all` run showed 529 tricolon warnings across
312 tutorials. Prior session found that auto-rewriting was unsafe
(nearly all were content lists). This session completed the deferred
work in two passes.

- **`containsTricolon()` tightened.** Added two filter sets to
  `packages/db/scripts/voice-check-lib.ts`:
  - `TRICOLON_BANNED_TOKENS` — prepositions, articles, verbs. Any
    tricolon item containing one of these tokens is a structural phrase
    (recipe step, ingredient list), not a stylistic tell. Skip.
  - `TRICOLON_INGREDIENT_STOP` — food / herb / spice names. Tricolons
    with an ingredient token are ingredient lists. Skip.
  The filter left the regex unchanged and added a per-item gate
  (`tricolonLooksStylistic`). Also skips any item containing a digit,
  and any match where ≥2 items start with an uppercase letter (proper
  nouns / place sequences).

- **Pass 1 — 15 body rewrites** (`fixup-tricolons-manual.ts`). The
  15 genuine adjective-descriptor tricolons identified after reading
  the full 574-match `docs/tricolon-defer-list.md`. Each rewrite
  drops the weakest third item where "X and Y" carries the meaning
  better than "X, Y, and Z". TutorialVersion snapshot + AuditLog
  per run.

- **Pass 2 — 9 excerpt/body rewrites** (`fixup-tricolons-manual-2.ts`).
  After the filter tightening, 38 warnings remained. Of those, 29
  are accepted exceptions (recipe imperative headings like "Pat, cut,
  and top"; content lists; multi-dimensional cooking-state descriptors).
  Nine genuine excerpt-level voice tells fixed: `apple-chutney`,
  `borscht`, `coronation-chicken`, `eggs-benedict`, `harira-soup`,
  `lamb-dhansak`, `marshmallows-vanilla`, `quick-pickled-red-onions`,
  `sweet-potato-soup`.

- **Result.** `voice-check-all` after both passes:
  - Tricolon warnings: **529 → 30** (94% reduction)
  - Remaining 30 are all accepted content-list exceptions
  - Total warnings: 618 → 137 (0 errors throughout)

Out of scope (deliberately): no other audit-rule fixes, no new
tutorials, no schema changes, no prompt template edits, no
infra/web UI/admin changes.

Commit: `c13c25d` — content(audit): tricolons — 24 voice-tell
rewrites, filter tightened 529 → 30.

## Phase categories targets 001 (2026-05-16)

Placeholder Category rows for the remaining 14 top-level categories +
target counts + per-category fill % on the admin dashboard, so the
multi-category fill plan has a real grid view in `/admin` rather than
the static markdown table in this file.

- **Schema migration** `20260619000000_phase_categories_targets_001`.
  Additive on `Category`:
  - `targetTutorialCount Int?` — eventual library size per the grid
    in § "Multi-category fill plan".
  - `isPublicVisible Boolean default true` — gates public nav, browse
    grid, homepage rails, and the public `/[slug]` page. New empty
    categories default to `false`; the publish path auto-flips to
    `true` the moment a category has 10 published tutorials.
  - `launchOrder Int?` — orders public nav rotation (1 = first
    spine). Cooking=1, Baking=2, Garden=3, Mindset=4, Herbal
    medicine=5, then the rest by display order.
  - Composite index on `(isPublicVisible, launchOrder)` for the
    public-nav query.

- **Seed script** `packages/db/scripts/seed-categories.ts`. Idempotent
  upsert of all 17 categories with their factual one-liner
  descriptions (voice rules applied — no inspirational codas).
  Existing rows (Cooking, Baking, Mindset) keep their description
  but get `targetTutorialCount` + `launchOrder` set; the 14 new
  rows are created with `isPublicVisible = false` until they cross
  10 published. `pnpm --filter @homemade/db seed:categories` runs
  it; `--prod` adds an explicit confirmation prompt. Reports
  unknown rows it spotted but never deletes them.

- **Auto-flip helper** `packages/db/src/category-visibility.ts`
  exports `maybeFlipCategoryVisibility(prisma, categoryId)` —
  idempotent, only flips false → true, never the reverse. Wired
  into every publish-transition path:
  - `apps/web/src/app/admin/tutorials/actions.ts` `transitionTutorial`
    (single-row admin publish).
  - `apps/web/src/app/admin/tutorials/bulk-actions.ts` bulk publish
    (per-touched-category, not per-row, for efficiency).
  - `packages/db/scripts/upload-tutorial.ts` (the bulk autopilot
    path) — runs after the row lands as PUBLISHED.

- **Public-side filtering.** Every public-side `prisma.category.findMany`
  now adds `where: { isPublicVisible: true }` and orders by
  `launchOrder asc` first:
  - `apps/web/src/components/public/site-header.tsx` — nav.
  - `apps/web/src/app/(public)/page.tsx` — onboarding picker.
  - `apps/web/src/lib/homepage-data.ts` — rails + spine.
  - `apps/web/src/app/(public)/search/page.tsx` — filter chips.
  - `apps/web/src/app/(public)/patterns/page.tsx` — filter chips.
  - `apps/web/src/app/(public)/[categorySlug]/page.tsx` — `findFirst`
    with `isPublicVisible: true`, so an invisible category 404s.
  Admin queries unchanged — admin sees every category.

- **Admin dashboard pipeline widget** (`apps/web/src/app/admin/page.tsx`
  + `lib/admin-dashboard-data.ts` + `dashboard.css`) extended to
  render all 17 categories ordered by `launchOrder`. New columns:
  Target, Fill %, Last batch, Public. Empty categories show a "Not
  started" tag in the row + empty fill bar. The visibility cell is
  a Live / Private pill with a tooltip explaining the auto-flip
  threshold. Cached 60 s via `unstable_cache`.

- **`category-counts` helper** extended to include Target / Fill % /
  Public columns in the markdown output, so the BUILD_PROGRESS
  snapshot can mirror what admin sees.

Targets from the grid (recorded here so they survive a schema reset):
Cooking 7,000 / Baking 3,000 / Garden 4,000 / Herbal medicine 2,500 /
Mindset 1,000 / Crochet 1,500 / Knitting 1,500 / Needlework 800 /
Sewing 1,200 / Fibre arts 800 / Wood & natural craft 800 / Paper &
word 800 / Pottery & ceramics 500 / Animals & smallholding 700 /
Home & repair 800 / Natural home 800 / Sustainability 700.

Out of scope (deliberately): no content authoring for the new
categories, no pipeline setup (schema additions / authoring prompts /
anchor batches all wait on Rebecca's go-signal per category), no
autopilot stream additions, no homepage layout changes beyond the
empty-category graceful handling, no edits to existing Category row
descriptions, no marketing pages, no infra changes.

## Tutorial page bug fix + speed wins + seed run (2026-05-16)

Three-piece session bundled into the worktree
`reverent-goldberg-a57407`. Categories-work from the parallel
session above had landed on `main` mid-session, so this branch
extended it rather than duplicating.

- **Tutorial page crash on every RECIPE — fixed.**
  `https://homemade.education/baking/carrot-cake-layered` (and every
  other recipe tutorial) was throwing the error boundary with digest
  `3492158675`. CloudWatch unmasked the stack: `Attempted to call
  extractScaleIngredients() from the server but
  extractScaleIngredients is on the client.` The extractor lived in
  `scale-context.tsx`, which carries a `'use client'` directive — Next
  16 treats every export from such a module as a client function, so
  the server `page.tsx` couldn't invoke it before passing the result
  into `<ScaleProvider>`. Moved the extractor into a new
  `apps/web/src/components/public/tutorial-content/scale-extract.ts`
  (no directive). `scale-context.tsx` re-exports it through the
  client-side barrel so the admin preview pane keeps working.
  Scope: hit every RECIPE tutorial since the recipe-scale work
  landed; technique pages were unaffected because they don't render
  the `ScaleProvider` branch. Verified post-deploy by hitting 7
  tutorial URLs (cooking / baking / mindset) — all render with their
  titles, no error boundary in HTML.

- **Tutorial error boundary enriched.** `error.tsx` now tags Sentry
  events with `route: 'tutorial-page'`, `scope: 'error-boundary'`,
  `categorySlug`, `tutorialSlug`, and the Next.js error `digest`, plus
  carries the same fields through a `tutorial` context block. The
  reader-facing fallback surfaces a small "Reference {digest}" line so
  support can correlate a reader report to a CloudWatch row without
  asking for a screenshot.

- **ECS steady state 1 → 2 tasks.** Deferred speed item #8 in
  `docs/perf-audit-001.md`. Bumped both the CDK `desiredCount` default
  in `infra/lib/homemade-stack.ts` and the deploy workflow's
  `aws ecs update-service --desired-count` in
  `.github/workflows/deploy.yml` so they don't drift — the workflow is
  the live source of truth (it doesn't run `cdk deploy`), but the CDK
  default needs to match for any future infra change. Memory
  utilisation steady at 25–40 % of the 512 MB / 256 CPU sizing, so no
  CPU / memory bump alongside.

- **Cache-Control headers verified.** `/legal/privacy`, `/coming-soon`,
  `/healthz` all return the expected `Cache-Control` values, and
  Next.js's own cache reports `x-nextjs-cache: HIT` on the
  static-shaped pages. Cloudflare still serves them as
  `cf-cache-status: DYNAMIC` because there's no Cache Rule for HTML
  yet — that belongs to the deferred edge-caching workstream and is
  out of scope here.

- **Perf snapshot for future regression checks.** Production build
  succeeded under Turbopack (1 known noisy warning re: `@prisma/client`
  CJS star export — pre-existing). Bundle picture captured in
  `docs/perf-followup-001.md`: no public-route bloat, Recharts stays
  scoped to `/admin/analytics`, Sentry shared chunk ~209 K. No
  code-split shipped — nothing in the public surface tree crossed the
  "grew by > 200 K in the last week" threshold from the brief.

- **`seed-categories.ts` run against prod, then reverted.** The first
  run (against the pre-fix seed script) was idempotent: `0 created,
  1 updated, 16 unchanged` — the update flipped Mindset's
  `isPublicVisible` from `true` to `false` because Mindset sits at 0
  PUBLISHED and the auto-compute threshold is 10. While this session
  was still running, a parallel session shipped 8575cad
  (`fix(categories): seed preserves visibility for existing shipped
  rows`) — explicitly making Cooking / Baking / Mindset keep their
  stored flag regardless of PUBLISHED count, since those three are
  the launch spine. Restored Mindset to `isPublicVisible = true`
  with a one-off `prisma.category.update`, re-verified it's back in
  the public nav. The 14 new placeholder categories were already at
  the correct private state from the earlier landing; nothing else
  moved.

### Out of scope (deliberately)

- No edge-caching architecture work — flagged for its own workstream.
- No content authoring.
- No autopilot changes.
- No mobile / admin overhaul beyond what already landed via the
  categories session.
- No edits to `docs/social-strategy/`, `docs/recipe-backlog.md`,
  `docs/content-backlog.md`, `docs/page-design.md`, or marketing pages.

### Worth looking at next session

- Cloudflare Cache Rules for `/legal/*`, `/coming-soon`, and any other
  static-shaped HTML — flips the cache accounting from
  `x-nextjs-cache` to `cf-cache-status` and removes the ALB round-trip
  for cold visitors.
- The `proxy.ts` bot-scanner noise floor (existing entry in pre-launch
  debt) is still throwing Sentry warnings — separate small session.
- `apps/web/src/app/api/unlock/route.ts` still does `req.formData()`
  without a try/catch; non-form Content-Types throw a 500 instead of
  redirecting back to `/unlock?error=1`. Low priority — only triggers
  on manual probes.

## Ingredients sync + admin autopilot status page (2026-05-16)

Small two-piece session. Piece 1: the baking bulk-001 worker
(commit `6183f6c`) seeded 20 ingredient slugs to prod but only
committed `tools.ts`, leaving `packages/db/scripts/data/ingredients.ts`
20 slugs behind the DB. Piece 2: the new `/admin/system/autopilot`
page surfaces per-stream state + halt signals so Rebecca doesn't
have to dig in Sentry / CloudWatch to see what the autopilot did
overnight.

- **Ingredient sync.** Re-derived the missing 20 slugs from the prod
  DB and appended them to their category sections, alphabetised among
  the new additions, existing curated grouping preserved. After
  commit: 634 in file, 634 in DB, `seed:ingredients --dry-run` reports
  0 created / 0 updated / 634 unchanged. Categories touched: meat,
  vegetable, fruit, herb, spice, condiment, baking, grain, nut,
  sweetener. `docs/ingredient-master.md` regenerated to match.

- **Schema migration `20260620000000_phase_autopilot_status_001`.**
  Additive. `AutopilotHaltSignal` gains `acknowledgedAt DateTime?` +
  `acknowledgedById String?` (admin "Acknowledge" button stamps these
  so the page can hide triaged rows from the default view). New
  `AutopilotPauseState` table — one row per stream, `streamName`
  unique, `pausedAt DateTime?` + `pausedById String?` + `reason
  String?`. Admin pause / resume reads and writes this table; the
  scheduled-tasks cron itself stays enabled. Migration applied
  cleanly to prod via `prisma migrate deploy`.

- **`/admin/system/autopilot` page.** Three stream cards (cooking /
  baking / mindset) showing PUBLISHED count vs `targetTutorialCount`,
  the most recent halt signal age, the next cron fire time, and the
  current pause state. Halt signals table below — filtered by stream,
  hides acknowledged rows by default with a "show acknowledged"
  toggle, 50 rows per page, expandable detail column, per-row
  "Acknowledge" button. Pause control on each card writes a row to
  `AutopilotPauseState` and accepts a free-text reason. Audit-logged
  via the existing `audit()` helper: actions are
  `autopilot.paused` / `autopilot.resumed` /
  `autopilot.halt_signal_acknowledged`. Same sage / cream / Fraunces
  palette as the rest of admin; no urgency cues.

- **Sidebar link.** Added under the System group at
  `/admin/system/autopilot`, between Jobs and Errors. ADMIN-only.

- **Pause-state helper script.**
  `packages/db/scripts/check-autopilot-pause-state.ts` — reads
  `AutopilotPauseState` for the named stream and exits 1 (with a
  single-line detail on stdout) when paused, 0 when running. Designed
  to drop into each `.claude/scheduled-tasks/autopilot-*/SKILL.md`
  preflight right after the env-flag check. Scope of this session
  intentionally did NOT modify the SKILL.md files — Rebecca is
  testing the `model: claude-sonnet-4-5` frontmatter override on
  those prompts, so the SKILL.md wire-up is deferred to a separate
  session. Until the SKILL.md files are updated to call the helper,
  the admin pause toggle still records the intent in DB and shows
  the "Paused" pill on the page, but the morning cron will still
  run. The fastest workaround is the existing
  `AUTOPILOT_PAUSED=true` env-flag path documented in the Phase 8
  autopilot wire-up entry.

- **End-to-end smoke.** Pause cooking → resume → acknowledge most
  recent halt signal → roll-back. All four Prisma paths the server
  actions take were exercised against prod with the rollback leaving
  data unchanged. The existing INAUGURAL_FIRE_COORDINATION /
  SCHEMA_DRIFT / DB_MIGRATION_PENDING halt signals from the inaugural
  autopilot fires render on the page; first user-action chance is the
  next morning's cron at cooking 01:00 / baking 03:00 / mindset 05:00
  UTC.

Out of scope (deliberately): no SKILL.md edits (per scope — Rebecca's
Sonnet override test in progress), no autopilot disabling (the
existing crons fire tomorrow as planned), no content authoring, no
infra changes beyond the admin page, no homepage / mobile /
analytics work, no edits to `docs/social-strategy/`,
`docs/recipe-backlog.md`, `docs/content-backlog.md`,
`docs/page-design.md`.

---

## Phase autopilot single-queue 001 (2026-05-17)

Switch the autopilot from three per-stream daily crons (cooking, baking,
mindset) to a single round-robin queue cron that fires every 2 hours and
picks the next READY-and-not-COMPLETE category from a fair least-recently-
fired rotation. Same per-batch authoring shape; just one cron and one
SKILL.md driving every category.

- **Schema migration** `20260621000000_phase_autopilot_single_queue_001`.
  Additive on `Category`:
  - `pipelineStatus PipelineStatus` (new enum: `NOT_READY`, `READY`,
    `PAUSED`, `COMPLETE`). Default `NOT_READY`. The single-queue cron
    only picks `READY` rows; `NOT_READY` rows wait for their pipeline-
    setup session; `PAUSED` is admin intent; `COMPLETE` is terminal.
  - `lastAutopilotRunAt DateTime?` — set to now() at the start of each
    batch. The round-robin sort uses this to pick the least-recently-
    fired READY category.
  - `autopilotWeight Int default 1` — reserved for future weighted
    round-robin (each weight unit = one slot per cycle); not used in
    v1 (strict round-robin via the `1` default).
  - Index `(pipelineStatus, lastAutopilotRunAt)` for the queue picker.
  - Migration also flips Cooking + Baking + Mindset to `READY` in-place
    so the new cron has work to pick up on its first fire. The 14
    placeholder categories stay at the column default `NOT_READY` until
    their per-category pipeline-setup session lands.

- **Publish-path auto-flip hook.** New helper
  `packages/db/src/category-pipeline-status.ts` exports
  `maybeFlipCategoryPipelineComplete(prisma, categoryId)`. Only flips
  `READY` → `COMPLETE` and only when `published_count >= targetTutorialCount`.
  Wired into every publish path next to `maybeFlipCategoryVisibility`:
  - `packages/db/scripts/upload-tutorial.ts` (bulk auto-publish path)
  - `apps/web/src/app/admin/tutorials/actions.ts`
    (`setTutorialStatus` PUBLISHED transition)
  - `apps/web/src/app/admin/tutorials/bulk-actions.ts` (admin bulk
    publish — re-checks once per touched category)
  The result: the queue cron stops picking a category the moment it
  hits its target.

- **`seed-categories.ts` extended.** Carries a desired `pipelineStatus`
  per row (`READY` for the three existing shipped categories,
  `NOT_READY` for the 14 placeholders) and only advances NOT_READY →
  READY on subsequent runs. Never overrides PAUSED or COMPLETE state
  set by admin / publish hook.

- **New single-queue SKILL.md** at
  `C:\Users\Rebecca\.claude\scheduled-tasks\autopilot-queue\SKILL.md`
  (same on-disk convention as the per-stream SKILLs — outside the repo,
  user-level). Frontmatter `model: claude-sonnet-4-5`. Pre-flight gates:
  0. Manual pause check (`AutopilotPauseState` rows where `streamName`
     ∈ `{queue, global}` AND `pausedAt != null`) + env pause.
  1. Round-robin pick (SQL ORDER BY `lastAutopilotRunAt ASC NULLS FIRST,
     launchOrder ASC` over `pipelineStatus = 'READY'`). Halt if no row
     matches; disable the cron only when every category is genuinely
     `COMPLETE`.
  2. Claim the slot (`lastAutopilotRunAt = now()`) before drafting —
     this is the no-double-firing guard.
  3. Locate authoring prompt by convention `docs/{categorySlug}-author.md`
     (cooking falls back to `docs/tutorial-author.md`). Missing file →
     flip the category to NOT_READY + halt-signal.
  4. Standard per-category preflight ported from the per-stream SKILLs
     (no-double-firing within window, backlog drain, quality drift,
     hard chain cap).
  5. Auto-determine batch number + run the batch per the category's
     authoring prompt (40–50 entries, brief → self-critique → voice-check
     → upload PUBLISHED with the 3-retry cap).

- **Per-stream crons disabled via MCP.** All three (`autopilot-cooking-bulk`,
  `autopilot-baking-bulk`, `autopilot-mindset-bulk`) flipped to
  `enabled: false`. SKILL.md files left in place so reverting is one
  re-enable per task.

  > **Queue cron creation needs Rebecca.** The `create_scheduled_task`
  > MCP tool requires interactive approval and is blocked under
  > unsupervised mode. Worker disabled the three per-stream crons (the
  > `update_scheduled_task` call works fine) and wrote the queue
  > SKILL.md to disk, but the queue cron itself isn't registered in
  > the scheduled-tasks index yet — `list_scheduled_tasks` doesn't
  > show it. To finish the switchover, Rebecca runs this from a
  > supervised session:
  >
  > ```
  > mcp__scheduled-tasks__create_scheduled_task
  >   taskId          = "autopilot-queue"
  >   description     = "Homemade content autopilot — single round-robin queue, every 2 hours."
  >   cronExpression  = "0 */2 * * *"
  >   prompt          = <contents of ~/.claude/scheduled-tasks/autopilot-queue/SKILL.md body, without the frontmatter block>
  > ```
  >
  > If the tool overwrites the SKILL.md frontmatter, re-add
  > `model: claude-sonnet-4-5` so the runner picks Sonnet for bulk
  > authoring.

- **Admin pause page parity (deferred).** `apps/web/src/app/admin/system/autopilot/`
  hard-codes the three streams (`cooking`, `baking`, `mindset`) in
  `STREAMS` + `assertStream()`. The new queue cron honours pause rows
  on `streamName ∈ {queue, global}` — admin needs a `queue` entry +
  `assertStream` widening + a single `queue` toggle in the UI. Out of
  scope for this session (no admin work) — flag for a small follow-up
  bundle.

Out of scope (deliberately): no content authoring, no image sourcing
changes, no admin / homepage / mobile work, no edits to authoring
prompts (`docs/tutorial-author.md`, `docs/baking-author.md`,
`docs/mindset-author.md` stay as-is), no deletion of the per-stream
SKILL.md files (only disabled, so revert is one MCP call per task),
no edits to `docs/social-strategy/`, `docs/recipe-backlog.md`,
`docs/content-backlog.md`, `docs/page-design.md`.

Commit: `<sha>` — Phase autopilot single-queue 001: round-robin schema +
publish-hook flip + queue SKILL.md + per-stream crons disabled.

---

## Commit history milestones (last 20)

- `<sha>` — feat(autopilot): single-queue switchover — round-robin schema + COMPLETE flip + queue SKILL.md
- `b71ceca` — feat(content): phase_8_content_integration_001 — image two-pass + audit rules + halt signals
- `5b12e6e` — fix(public): followup-queue sweep — recipe page UX + Sentry tracing off + cache headers
- `5854e2b` — feat(content): phase_8 fix-up — servings/yield + hero fill 536/536 + tricolons deferred
- `eeac543` — feat(mobile): phase_mobile_rebuild_001 — native shell, cooking mode, offline, push
- `db87b51` — feat(infra): CDK image-secrets mount — Deploy 1 + 2 landed
- `c750e2e` — feat(mobile): real APNs dispatch + splash gate flag + screenshot tool + asset regen
- `6538094` — feat(autopilot): wire-up — three stream prompts + halt-signal helper
- `c13c25d` — content(audit): tricolons — 24 voice-tell rewrites, filter tightened 529 → 30
- `8975caf` — feat(categories): targets + visibility + admin fill widget
- `049f888` — fix(tutorial): move extractScaleIngredients into a server-safe module
- `d9f038e` — infra(ecs): steady state at 2 tasks to remove cold-start downtime
- `8575cad` — fix(categories): seed preserves visibility for existing shipped rows
- `d2e990f` — docs(build): tutorial fix + ECS bump + cache + perf snapshot + seed run
- `578451b` — chore(db): sync ingredients.ts with DB — 20 slugs from bulk-001 baking session
- `01d7f13` — feat(admin): /admin/system/autopilot status page + halt-signal acknowledge + per-stream pause
- `602c304` — chore(db): collapse flaked-almonds duplicate into almonds-flaked
- `5008a2c` — content(cooking): bulk-006 — 5 more PUBLISHED, total 10
- `5030d8f` — content(cooking): bulk-006 — 5 PUBLISHED, halted on schema drift
- `2e2ac5e` — content(mindset): bulk-001 — 20 briefs drafted, voice-checked, upload blocked by DB drift

Earlier milestones → [docs/archive/build-progress-history.md](docs/archive/build-progress-history.md).
