# Knitting vest authoring — STUB

**Status:** Stub. Authoring deferred to K-5.

**K-4.1 inheritance note (2026-06-10):** when K-5 lands, the K-5
vest prompt inherits the K-4.1 cross-cutting prompt requirements
and schema fields. See `docs/knitting-author.md` § "K-4.1
cross-cutting prompt requirements" and
`docs/knitting-sweater-cardigan-author.md` for the same
inheritance note in fuller form.

Vests are sleeveless garments and share most of the sweater +
cardigan grading rules:

- Bust, waist, hip, length, shoulder width, neck opening per
  size across the full size range.
- Armhole depth + decrease patterns per body width.
- V-neck or crew-neck shaping per body width.
- Front and back yoke shaping if the vest is yoked.

Until the K-5 grading library lands at
`apps/web/src/lib/knitting/grading/`, the autopilot routine will
not pick the `vest` sub-cat. `SubCategory.autopilotEnabled = false`
gates this.

## Why no interim version

Vests bind closer to the body than a pullover. Negative ease at
the bust matters more — even a 2 cm grading error shows. K-5's
grading library is the safe path; hand-authored garment grading
without it is not.

## Scope when K-5 lands

The K-5 follow-on will cover:

- Top-down V-neck vest (single piece, in-the-round; steeked or
  flat).
- Bottom-up seamed vest with set-in armholes.
- Tabard / sleeveless tunic (no armhole shaping).
- Aran vest (cable-led, lighter armhole shaping).
- Fair Isle vest (yoked colourwork, no sleeves).

Each construction will reference this prompt + the appropriate
discipline guide.

## Until K-5

Vest curation falls to the same specialist workstream as sweaters
+ cardigans. Pattern submissions for the public catalogue can be
catalogued by hand into `KnittingPattern` with grading data from
the original designer. Do not generate new vest patterns until
K-5.
