# Baking pilot-10 report — 2026-05-15

10 recipes drafted, voice-checked, and auto-published as PUBLISHED. All 10 are live on the site.

## Recipes published

| # | Slug | Sub-category | Difficulty | Tutorial ID | Voice result |
|---|------|---|---|---|---|
| 1 | soda-bread-irish | bread | BEGINNER | cmp71d2xo0001xsv4iyrllvu6 | 0 errors, 2 warn |
| 2 | focaccia-dimpled | bread | INTERMEDIATE | cmp71fvth0001z8v476q808fv | 0 errors, 0 warn (clean) |
| 3 | chocolate-layer-cake | cakes | INTERMEDIATE | cmp71ifdn00013wv4m2gcmi4o | 0 errors, 3 warn |
| 4 | lemon-drizzle-cake | cakes | BEGINNER | cmp5rlk1u0000bwv4aqr4f4po | 0 errors, 1 warn (UPDATED from DRAFT) |
| 5 | rough-puff-pastry | pastries | ADVANCED | cmp71m3dc0001agv40gyq7hmp | 0 errors, 4 warn |
| 6 | treacle-tart-classic | pies | INTERMEDIATE | cmp71oy3l0000owv4a18b3ggl | 0 errors, 2 warn |
| 7 | chocolate-chip-cookies | biscuits | INTERMEDIATE | cmp71ygxq0001lgv4iwth3ra2 | 0 errors, 0 warn (clean) |
| 8 | cream-tea-scones | scones | BEGINNER | cmp721d6u00009sv4984x62eh | 0 errors, 3 warn |
| 9 | dark-caramel | sweets-confectionery | ADVANCED | cmp723yb60001yov4tpf065bx | 0 errors, 1 warn |
| 10 | baked-vanilla-cheesecake | sweets-confectionery | INTERMEDIATE | cmp7272ek000028v4pywccosi | 0 errors, 2 warn |

Difficulty spread: 3 BEGINNER / 5 INTERMEDIATE / 2 ADVANCED ✓

Sub-category coverage: bread (2), cakes (2), pastries (1), pies (1), biscuits (1), scones (1), sweets-confectionery (2)

## Glossary terms

Terms created in this batch:
- `soda-bread-cross` (soda-bread-irish)
- `stretch-and-fold` (focaccia-dimpled)
- `ganache` (chocolate-layer-cake)
- `drizzle-syrup` (lemon-drizzle-cake)
- `lamination` (rough-puff-pastry)
- `dough-chilling` (chocolate-chip-cookies) — CREATED
- `caramelisation` (dark-caramel) — CREATED

Terms that already existed at upload time:
- `blind-baking` (treacle-tart-classic)
- `rubbing-in` (cream-tea-scones)
- `bain-marie` (baked-vanilla-cheesecake)

## Voice-check statistics

| Metric | Count |
|---|---|
| Total errors across all recipes before fixes | 11 |
| Recipes requiring at least one fix | 8 |
| Recipes clean on first pass | 2 (focaccia, cookies) |
| Total tricolon warnings | 18 |
| Tricolons that blocked upload | 0 |

All warnings were tricolons. All errors were fixed within one edit round.

## Error patterns

**Em-dash pairs (appositive pattern) — 7 occurrences** — the dominant failure mode, matching the anchor batch report. All were either in body prose or in `sourceNotes`. Fix pattern: rewrite as a parenthetical, use a colon, or restructure the sentence to remove the apposition entirely.

**Em-dash count in paragraph — 1 occurrence** — sourceNotes on soda-bread used em-dashes as citation separators (`Author — note — ...` repeated ×3). Fix: replace all em-dashes in sourceNotes with colons.

**Banned phrase "essentially" — 1 occurrence** (focaccia-dimpled, infoPanel). Replaced with direct prose.

**Banned phrase "genuinely" — 1 occurrence** (cream-tea-scones, troubleshooter fix). Replaced with "very".

**Missing `categorySlug` field — 1 upload error** — chocolate-chip-cookies was the first recipe written after the context was summarised, and `categorySlug: "baking"` was omitted. Fixed before upload. All subsequent recipes included it.

## Patterns for future batches

1. **Em-dash pairs in sourceNotes are the highest-risk location.** Citation attributions naturally fall into the `Author — note — context` shape. Write sourceNotes as full sentences with colons, not as clauses separated by em-dashes.

2. **Appositive em-dash pairs in body prose.** The `X — descriptor — verb` construction is a natural English rhythm but blocked by voice-check. Prefer commas, parentheses, or sentence restructuring.

3. **`categorySlug: "baking"` is required** on every recipe. The upload script validates it explicitly. Include it explicitly in every new brief.

4. **Tricolon warnings are pervasive but none blocked uploads.** 18 tricolons across 10 recipes. The checker fires on any three-item parallel structure. Most instances were earned (technique sequences, ingredient groups, doneness cues). The warning exists; it need not be eliminated in every case.

5. **Sugar-stage confectionery uses `bakeTemperatureCelsius` for the target temperature** (e.g. 175°C for dark amber caramel). Set `bakeTemperatureNote` to explain the repurposed field (e.g. "target sugar temperature for dark caramel").

6. **Safety line for confectionery is mandatory**: "If hot syrup touches skin, run cold water over it for at least ten minutes and seek medical care if needed." Place it immediately before the step where hot sugar contacts cream or is handled.

## Files

- Briefs: `docs/baking-pilot-10-briefs/` (10 JSON files)
- Baking author prompt: `docs/baking-author.md`
- Baking anti-tells: `docs/baking-anti-tells.md`
- Anchor batch report: `docs/baking-anchor-report.md`
