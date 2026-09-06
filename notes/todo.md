# Homemade to-do (kept by the orchestrating sessions; update it as work lands)

Rule: this file is the shared to-do. Any session that finishes or starts an item edits it and the edit rides the next train. Plain English, one line per item, newest decisions at the top of each section.

## Crochet: to live, in order (updated 6 September 2026, evening)
1. DONE: round 8 judged PASS (bear head and body read as a stuffed toy; crease 38°→10°). Round bar locked.
2. DONE: the train of 6 September (stuffing, sphere recipe, notes/, knitting A+B dark with migration 20261014000000, knit-program stub, idea backlog, the crochet routine conversion with the API lane removed).
3. Re-render the ball and bear sign-off rows and the Studio presets on the new geometry; judge the served images.
4. DONE (Rebecca, 6 Sept, evening): steady pace (3 batches of 8 a day), $100 a month ceiling on Fal plus Fargate (CROCHET_MONTHLY_USD_CAP in spend-guard.ts, enforced at render time), engine work queued behind the routine: amigurumi bases cat/dog/bird (claude/loom-amigurumi-bases, running), then tube shaping for hats and cowls, then motif joining for blankets, cushions and bags, then FINE AMIGURUMI AND DOLLS (Rebecca, 6 Sept: the delicate Etsy tier is in the plan; references saved as .loom-scratch/refs/etsy/pick/etsy-doll-*.png on the cloud VM, re-find by searching "Rose Blossom Fairy Doll amigurumi Sarah's Hooks & Loops", "Amigurumi Today Mia doll", "From Britain with Love bunny girl amigurumi"): (1) fine gauge, slim tube limbs, a standing doll body = the doll base; (2) hair: strands, fringe, curls; (3) clothing and accessories: skirt and ruffle, bodice, wings, small flowers; (4) embroidered faces. The doll shelf stays a theme list until step 1 passes beside those photos. Rule: the routine never invents and is never offered an idea the engine cannot make; a dry shelf waits. First judged batch of eight DONE (6 Sept, evening): 7 published PUBLIC (category still hidden), 1 killed for a concept/colour mismatch, $0.64 deterministic spend, pass rate 7/8 against the assumed 60%. The routine schedule exists (Routine 'Homemade - crochet autopilot', every 8 hours, fresh Sonnet cloud session) but is DISABLED and the BulkAutopilotState marker is OFF until the next train puts the routine fixes on main (sphere-profile balls in crochet-design.ts, the retry on database writes, the $100 monthly ceiling, the no-invention prompt, the 1,500 targets). Switch both on after that train's deploy is green.
4a. Was: Rebecca: set the crochet budget from the estimate (about $0.16 per published pattern, about $188 for 1,200; pass rate assumed 60% until measured). Then one judged batch of eight on her Max plan via docs/autopilot-prompts/crochet.md, then the routine schedule.
5. Rebecca: adopt 1,500 with the audit's shelf split or keep 1,200; the 959 DRAFT prose crochet pattern tutorials as a brief source through the loom path or leave; headband 30→24.
6. Go-live gates: completeness, vision sweep, tagging coverage, search reindex, category page and descriptions; then add 'crochet' to LAUNCH_VISIBLE_CATEGORY_SLUGS on a train. Rebecca's sign-off moment.

## Cross-stitch: to sign-off, in order (6 September 2026)
1. Train 12: admin-counts, stash-on-card, parking (run `seed-stitches.ts --craft=cross-stitch` at merge; migration runs in deploy), new shelves and targets (1,784), first-stitch journey, then outlines/French knots and the zero-API candidates conversion as they finish. One deploy verification.
2. Maker photos site-wide (claude/maker-photos 42272825) rides once the crochet session confirms no collision. Terms, tester agreement and "Upload photo" wording are Rebecca-approved.
3. Candidates-mode proof batch on the server; 6-hourly cloud routine from docs/autopilot-prompts/cross-stitch.md; cron back on in candidates mode (it is OFF until then); needlework converted the same way.
4. Personalised sampler job: birth, wedding, new home, name-and-date, word-art track; several catalogue samples per type; customise or build from scratch.
5. Then in order: loom photoreal heroes (crochet session owns the builder), 200+ colour / 400+ cell tier and under-60-cell tier (proof first), readings wired to the glossary, upload-tutorial.ts hero-clearing defect, seed-stitches.ts drift.
6. Fill to 1,784 under the $50–60 image budget; close-out gates; learnings line in the playbook; Rebecca's sign-off. Tell her only when everything is merged and it is down to the cron.

## Parked to save credits
- Yarn-fibre halo render option (chenille look matched to the pattern yarn).
- fpdc/bpdc collars (branch claude/loom-look-pass-6; look regressed).
- Shorter bear arms (round count), ball coil at macro.
- Tapestry lane: the illustration must fill the frame; the routine skips that shelf until fixed.
- Knitting: see project_knitting_state.md.
- Needlework audit and its candidates-mode conversion (cross-stitch session, after the cross-stitch cron is back on).
- Cross-craft from the world-best audit: yarn/floss database, follow-along offline mode, accessibility, one-way contributions (maker photos, reviews, errata pages, feature suggestions, AI-screened), animated stitch diagrams, public errata.

## Done this run (6 September 2026)
- Cross-stitch: duplication root-caused and guarded in the publish path; 104 reversible culls; shelves merged, targets set from the world-best audit; print quality, stitchability, bare fabric, provenance page, stitch library and chart tutorial live; Typesense reachable from cloud sessions; four cron firings proven before the cron was paused for the zero-API conversion.
- Access proven from the cloud (DB via Neon WebSocket adapter, AWS, GitHub, R2, Typesense, Sentry, GSC, Fargate).
- Search Console audit and gsc.ts path fix; Sentry triage and fixes; /admin/analytics/acquisition crash fixed; admin Members activity and spam signal.
- Loom look-pass rounds 1–6 on main; seven sign-off heroes and four autopilot keepers pass on the white ground on the served images.
- Crochet Studio "Design your own"; async Fargate render path; the real bulk path proven end to end.
- Merging rules (two lanes, daily train) in CLAUDE.md; the no-API-spend rule as Rebecca stated it.
