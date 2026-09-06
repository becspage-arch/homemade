---
name: floss-table-curated-working-set
description: "Floss-table size is per-pattern, not a fixed cap: use the full DMC table where it helps (e.g. needle-painting shading) and a smaller set elsewhere. The one hard rule is never hand-type/hallucinate RGB values — only use verified published data."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c06727de-bc2e-4a18-bba4-539447d65bce
---

CLARIFIED by Rebecca (2026-06-25): there is **no requirement to keep floss tables
to a small sample**. Some patterns can use the FULL DMC table, others a smaller
curated set — use whatever is appropriate for the pattern. Floss-palette size is a
per-pattern choice, not a platform cap.

**The enduring rule (this is what the original concern was really about):** never
hand-type or invent floss codes / RGB values from memory. Only use VERIFIED
published data. A smaller correct table beats an over-eager seed of hallucinated
RGBs. Extending a table with real values only ever improves quality.

**Current state of the tables:**
- `apps/web/src/lib/floss/dmc-table.ts` — the curated ~139-stand subset, fine for
  counted crafts / brand-equivalence mapping where a tight palette is wanted.
- `apps/web/src/lib/floss/dmc-full.ts` — the full ~456-colour DMC set (verified
  public data) + a CIELAB matcher. Use it where fine gradations matter — surface-
  embroidery needle-painting shading needs it for smooth ramps. Shipped 2026-06-25
  (commit 874ab76e). See [[project_needlework_signoff]].
- Unifying everything onto the full table later is fine if it simplifies things;
  no need to keep them split on principle. Pick per use.

**Brand tables (Anchor / Madeira):** still build by inheriting DMC's RGB via the
published equivalence code (the equivalence is colour-matched by definition); leave
a row null when a brand has no published equivalent and let the perceptual
nearest-by-RGB fallback (`closestMatch: true`, surfaced as a swap-time fidelity
warning) handle it. Don't invent equivalence codes.
