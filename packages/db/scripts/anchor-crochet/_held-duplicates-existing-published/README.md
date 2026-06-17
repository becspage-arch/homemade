# Held crochet anchor entries (teaching duplicates)

These 16 STITCH / TECHNIQUE / READING entries were authored for the crochet
anchor batch (2026-06-16) and all pass the voice + completeness + makeability
gates (validated with `scripts/qc-preflight.ts`). They are held here, NOT
uploaded, because every one duplicates an existing PUBLISHED tutorial. (A 17th,
the "What crochet is, and where it came from" reading, was the one genuinely
unique entry with no existing equivalent — it was SHIPPED PUBLISHED on
2026-06-17 and lives in the parent directory.) They are held here, NOT
uploaded, because the crochet Foundations / Stitches library is already
comprehensively built and PUBLISHED (184 teaching tutorials live at the time of
this batch). Shipping these would either:

- overwrite another worker's published tutorial (8 share an exact slug), or
- create a second tutorial on a topic that already has one (the rest).

Both violate the locked "real library of makeable content, no duplicates" rule,
so they were held rather than shipped. The 5 PATTERN anchors in the parent
directory WERE shipped, because crochet PATTERN content was the genuine gap (the
completeness gate had culled ~636 PATTERN rows to DRAFT and only one crochet
chart row existed).

## Exact-slug collisions with existing PUBLISHED tutorials (8)

These would overwrite Worker A's published Foundations content:

- crochet-slip-knot, crochet-chain-stitch, crochet-slip-stitch-tutorial,
  crochet-double-crochet-uk-stitch, crochet-half-treble-stitch,
  crochet-double-treble-stitch, crochet-triple-treble-stitch,
  crochet-foundation-chain-technique

Note: `crochet-foundation-chain-technique` is currently typed STITCH (not
TECHNIQUE) and carries no sourceNotes on the live row; the held version here is
typed TECHNIQUE and is Dillmont-anchored, if a future pass wants to correct it.

## Topic duplicates (different slug, same subject)

treble, crossed treble, picot, joining a round, rows vs rounds, weaving in ends,
gauge swatch, how to read a crochet chart all already exist published under other
slugs. "What crochet is, and where it came from" appears to be the one genuinely
unique topic (no existing crochet history reading).

## If Rebecca wants any of these live

Decide per entry whether to (a) replace the existing published version
(idempotent re-upload by the same slug snapshots the prior into TutorialVersion),
or (b) discard the duplicate. Then upload the chosen files with
`scripts/upload-tutorial.ts ... --status PUBLISHED`.
