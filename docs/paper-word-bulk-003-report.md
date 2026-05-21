# paper-word bulk-003 — batch report

**Date:** 2026-05-21
**Model:** claude-sonnet-4-6
**Status:** 40 PUBLISHED

## Counts after upload

| Category | Published |
|---|---:|
| paper-word total | 122 |

## Slugs published this batch

### Bookbinding (10)
1. `quarter-bound-book` — PATTERN INTERMEDIATE
2. `adding-headbands-by-hand` — TECHNIQUE INTERMEDIATE
3. `case-making-for-hardcover` — TECHNIQUE BEGINNER
4. `japanese-tissue-paper-mending` — TECHNIQUE BEGINNER
5. `hollow-back-binding` — PATTERN INTERMEDIATE
6. `bradel-binding` — PATTERN ADVANCED
7. `soft-cover-sewn-journal` — PATTERN BEGINNER
8. `understanding-endpapers` — READING BEGINNER
9. `concertina-with-pockets` — PATTERN BEGINNER
10. `simple-slipcase` — PATTERN INTERMEDIATE

### Calligraphy (8)
11. `gothic-textura-lowercase` — TECHNIQUE INTERMEDIATE
12. `italic-joined-letterforms` — TECHNIQUE INTERMEDIATE
13. `pen-care-and-maintenance` — TECHNIQUE BEGINNER
14. `letter-spacing-and-rhythm` — TECHNIQUE INTERMEDIATE
15. `foundational-numerals` — TECHNIQUE BEGINNER
16. `rustica-roman-capitals` — TECHNIQUE INTERMEDIATE
17. `copperplate-connected-script` — TECHNIQUE ADVANCED
18. `uncial-capital-forms` — TECHNIQUE INTERMEDIATE

### Papermaking (6)
19. `water-leaf-and-sized-paper` — READING BEGINNER
20. `lokta-paper-sheet-forming` — TECHNIQUE BEGINNER
21. `embossed-patterns-in-wet-sheets` — TECHNIQUE INTERMEDIATE
22. `gampi-mitsumata-sheet-forming` — TECHNIQUE INTERMEDIATE
23. `gelatin-surface-sizing` — TECHNIQUE INTERMEDIATE
24. `coloured-pulp-with-natural-pigments` — TECHNIQUE INTERMEDIATE

### Marbling (4)
25. `peacock-pattern-marbling` — TECHNIQUE INTERMEDIATE
26. `italian-vein-marbling` — TECHNIQUE INTERMEDIATE
27. `paste-paper-comb-patterns` — TECHNIQUE INTERMEDIATE
28. `moire-double-combed-marbling` — TECHNIQUE ADVANCED

### Journalling craft (4)
29. `pockets-and-flaps-in-journals` — TECHNIQUE BEGINNER
30. `hand-stamped-journal-borders` — TECHNIQUE BEGINNER
31. `watercolour-journal-backgrounds` — TECHNIQUE BEGINNER
32. `monthly-planner-spread` — TECHNIQUE BEGINNER

### Papercutting (2)
33. `polish-wycinanki-layered-cut` — TECHNIQUE INTERMEDIATE
34. `geometric-window-star` — TECHNIQUE BEGINNER

### Zines (2)
35. `typewriter-aesthetic-zine` — PATTERN BEGINNER
36. `hand-lettered-zine-spreads` — TECHNIQUE BEGINNER

### Scrapbooking (2)
37. `heritage-scrapbook-archival-page` — TECHNIQUE INTERMEDIATE
38. `mini-accordion-photo-album` — PATTERN BEGINNER

### Origami (2)
39. `origami-masu-box` — TECHNIQUE BEGINNER
40. `origami-paper-boat` — TECHNIQUE BEGINNER

## Voice-check results

- 0 errors after fixes
- 0 blocked uploads

Fixes applied:
- Files 06-15 and others: em/en-dash bulk replacement via Node.js script (38 files modified) — sourceNotes date ranges "(1766–1838)" → "1766 to 1838", prose em-dashes " — " → ", ", en-dash numeric ranges → hyphen
- File 15 (`foundational-numerals`): medical-claim fix — "treats numerals exactly as it treats letters" → "handles numerals in exactly the same way as letters"

## New tools seeded this batch

4 new slugs added to `packages/db/scripts/data/tools.ts` before authoring:
- `gelatin-leaf` — leaf gelatin for surface sizing bath (papermaking)
- `watercolour-pan-set` — pan watercolours for journal backgrounds
- `rubber-stamp-craft` — unmounted rubber stamp for embossing / journal borders
- `dye-ink-pad` — water-based dye ink pad for stamping

## Recurring patterns

- Em/en-dash violations remain the most common voice-check failure; the bulk-replacement Node.js script (introduced bulk-003) handles all cases cleanly in one pass.
- Pre-verifying all tool slugs against the master table before writing files (introduced this batch) prevented any recipeTools slug errors at upload time — zero slug corrections needed post-authoring.
