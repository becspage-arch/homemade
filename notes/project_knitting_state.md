# Knitting: where it stands (refreshed 17 October 2026)

**Parked until Bec says start** (to save credits). Nothing below runs without her word.

## On main, hidden on the site
- `KNITTING_SHELVES` (ten shelves, 800 target) in `apps/web/src/lib/studio/generation/categories.ts`, and the library grid on the category page.
- The grader product: migration `20261014000000_knitting_pattern_parity_with_crochet`, `POST /api/studio/knitting/grade` (standard sizes free, custom fit premium), the Studio size table and "Fit it to me" panel, the print page gate. All hidden until a pattern has a loom hero.
- The merge script for the four duplicate legacy shelves exists but had only been dry-run on 6 September. Check before running it.

## Plan of record
- Ship knitting with the grader as the product. No knitting pattern goes public until the loom has rendered it and the photo has been judged.
- Engine order: flat knit from a stored program, then colour, then in the round, then shaping.
- The crochet working rules apply: Opus builds on pass/fail rails, Fable fine-tunes by eye, end-of-week credits only ([Crochet state](project/project_crochet_state.md)).

## Resume point
- Add a `knit-flat` form to `apps/web/src/lib/loom/crochet/engine/program.ts` (JSON-storable knit fields), compile it through `buildKnit` in `knitPath.ts`, and confirm crochet hashes are unchanged.
- Then the knit written instructions and chart, the render and publish path, and three proofs (garter dishcloth, rib headband, cabled square) beside real photos.
- Engine gaps: garter, yo and cable are parked (handbook §8d); no colour, in-the-round or shaping builders yet.
