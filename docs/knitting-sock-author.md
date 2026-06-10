# Knitting sock authoring — STUB

**Status:** Stub. Authoring deferred to K-5.

**K-4.1 inheritance note (2026-06-10):** when K-5 lands the sock
grading library, the K-5 sock prompt inherits the K-4.1
cross-cutting prompt requirements (circle your size, concrete
gauge consequence — for socks, in cm of foot circumference per
stitch-per-10cm of drift; cast-on tail formula; stitch count
check-ins at the heel turn and at the toe; no external video or
photo dependencies; `### Common faults` H3; Persona stuck-check)
AND populates the K-4.1 schema fields (`stitchCountCheckpoints`
at the heel turn and toe, `needleBySection` for ribbed cuffs).
See `docs/knitting-author.md` § "K-4.1 cross-cutting prompt
requirements".

Sock authoring needs its own grading rule set distinct from the
sweater + cardigan rules. K-5 will ship sock-specific grading at
`apps/web/src/lib/knitting/grading/socks.ts`.

## Why sock-specific grading

- Foot circumference + foot length grade together (a UK 8 foot
  is wider than a UK 5 foot, not just longer).
- Cuff length is constant or grades with calf circumference,
  not foot length.
- Heel turn shaping (gusset depth, heel-flap rows) scales with
  foot circumference.
- Toe shaping (decrease frequency, final stitch count before
  grafting) scales with foot length.
- Cuff-down and toe-up constructions take their measurements
  from opposite ends — the grading library has to support both
  directions.

## Why no interim version

Sock fit is sensitive. A 2 mm error at the heel turn produces a
sock that bites at the ankle; a 4 mm error at the foot
circumference produces a sock that won't stay up. K-5 is the safe
path.

## Scope when K-5 lands

The K-5 follow-on will cover:

- Cuff-down sock with flap-and-gusset heel (standard).
- Cuff-down sock with short-row heel.
- Toe-up sock with afterthought heel.
- Toe-up sock with German-short-row heel.
- Knee-high sock with calf shaping.
- Tabi sock (split-toe) and other regional variants.

Each construction will reference this prompt + the appropriate
discipline guide
(`docs/knitting-colourwork-guide.md` for Fair Isle socks,
`docs/knitting-lace-guide.md` for lace socks,
`docs/knitting-cable-aran-guide.md` for cabled socks,
`docs/knitting-specialty-guide.md` for the magic loop, dpn,
two-circulars, and short-row method choice).

## Until K-5

Sock pattern submissions for the public catalogue can be
catalogued by hand into `KnittingPattern` with grading data
from the original designer. Do not generate new sock patterns
until K-5.
