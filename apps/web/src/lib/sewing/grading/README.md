# Sewing grading wrapper (freesewing)

This directory is the **only** place in the codebase that imports
`@freesewing/*` packages. Studio components, API routes, and content
authoring scripts go through `draftPattern()` and `homemadeToFreesewing()`
instead. The boundary is intentional: swapping out the freesewing engine
(if it's ever needed) is a one-file change inside this directory.

## Files

| File | Role |
| --- | --- |
| `types.ts` | Homemade-facing types (`DrafterOutput`, `DrafterOptions`, `SewingDesignConfig`, etc). Freesewing's internal types are never re-exported across this boundary. |
| `measurement-translation.ts` | Translates Homemade `UserSewingMeasurements` keys (cm canonical) to freesewing's measurement vocabulary (mm canonical). Single source of truth for the key map. |
| `design-registry.ts` | Registry of available freesewing designs (Bella, Brian, Aaron at launch). Adding a design is a single entry here; no change to grader.ts is needed. |
| `grader.ts` | Central `draftPattern()` entry point. Loads a design, applies measurements + options, calls freesewing, returns rendered SVG + cache key + attribution. |
| `verifier.ts` | Sanity checks on drafter output (non-empty SVG, sensible part dimensions, per-design tolerance). |
| `attribution.ts` | MIT licence headers + voice-checked footer credit. Hidden on PROJECTOR mode per the locked sewing decisions. |
| `grader.test.ts` | Runnable test suite. Drafts Bella + Brian + Aaron against CYC reference measurements, asserts dimensions within 5% tolerance, plus cache-key determinism + measurement round-trip. |

## Usage from a Studio / API route

```ts
import { draftPattern } from '@/lib/sewing/grading/grader'

const result = await draftPattern({
  designSlug: 'bella',
  measurements: userMeasurements,    // UserSewingMeasurements payload
  options: { designOptions: { chestEase: 8 } },
  calibrationMode: 'PRINT',           // 'PRINT' | 'PROJECTOR' | 'BROWSE'
})

// result.svg          — rendered SVG string
// result.partList     — per-part bounding boxes (mm)
// result.cacheKey     — SHA-256 of canonical inputs
// result.attribution  — footer credit text (empty on PROJECTOR)
// result.freesewingVersion — '4.9.0' etc, recorded for cache invalidation
```

Premium gating is enforced at the Studio UI / API route boundary in S-5d
and S-5e. `draftPattern()` itself is callable for any user; the wrapper
treats translation + drafting as free infrastructure (per the locked
"translation is free, personalisation is premium" rule).

## Adding a new freesewing design

1. Make sure the freesewing package is in `apps/web/package.json` with an
   exact pinned version (no `^` or `~`).
2. Add an entry to `SEWING_DESIGN_REGISTRY` in `design-registry.ts`:
   - `slug` — the stable identifier used everywhere outside this directory.
   - `freesewingPackage` — the npm name.
   - `importer` — lazy dynamic import.
   - `designExportName` — the exported design constructor name.
   - `genderFamily` — drives CYC default fallback column.
   - `requiredMeasurements` / `optionalMeasurements` — freesewing keys.
3. Add a reference draft test to `grader.test.ts` (CYC size-M body in
   freesewing's `@freesewing/models` if available, or hand-curated).
4. Run the test suite.

## Running the tests

```
pnpm --filter @homemade/web exec tsx src/lib/sewing/grading/grader.test.ts
```

The suite asserts:
- Bella drafts on CYC Women's M without errors and produces a back +
  front bodice piece with dimensions within 5% of the input chest.
- Brian drafts on CYC Men's M with the same guarantees.
- Aaron drafts on CYC Women's M across several option configurations
  (default + cropped + sleeveless).
- The cache key is deterministic across calls with the same inputs.
- `homemadeToFreesewing` round-trips the full measurement vocabulary.

## Tolerances

The library targets:
- Rendered piece dimensions within 5% of CYC chart measurements plus
  the design's documented ease.
- Drafter output stable across runs (same input → same SVG, same cache
  key).

## Attribution

Per the freesewing MIT licence, the footer credit lives on PRINT and
BROWSE output. It is hidden on PROJECTOR per the locked sewing decisions
so the grid stays clean for fabric calibration. See
`THIRD_PARTY_LICENSES.md` at the repo root for the full freesewing
licence notice.
