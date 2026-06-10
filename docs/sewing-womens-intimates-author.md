# Sewing / Women's intimates authoring (specialist curation stub)

## Status

**Autopilot does NOT author women's intimates content.**

`SubCategory.autopilotEnabled = false` for `sewing/womens-intimates`.
The autopilot routine skips this sub-category when picking a sewing
target. The stub stays in place until a dedicated specialist-curation
worker session replaces it with a full author prompt.

## Why

Bra-making, knicker-drafting, and lingerie construction require
specialist knowledge that a general-purpose sewing author prompt
cannot replicate accurately:

- **Bra construction** involves underwire channelling, foam padding
  with cup grading, hook-and-eye placement at the band, ring +
  slider strap construction, and frame + cup + band + strap fit
  interactions that vary across body shape. Bra fit is a discipline
  in itself; an inaccurate tutorial produces unwearable garments
  and the kind of fit frustration that reflects badly on the
  publication.

- **Knicker + brief drafting** uses stretch fabric grading (negative
  ease applied to four-way stretch lycra), gusset construction with
  cotton-lined crotch panels, fold-over elastic + picot edging
  technique, and waistband + leg-opening elastic application that
  varies by knicker style (high-waist, hipster, thong, boyshort,
  french).

- **Lingerie construction** (slips, camisoles, robes) overlaps with
  the dresses + tops prompts but uses bias-cut silk + lace + ribbon
  + decorative elastic in ways that a general-purpose dresses prompt
  does not cover.

- **Fit feedback loop.** Bra + brief construction has no easy
  substitute for the maker trying it on, sometimes several times,
  with adjustments between attempts. A tutorial that doesn't account
  for this leaves the maker with a wearable-but-uncomfortable result.

These are not techniques that can be inferred from a freesewing-engine
draft or a public-domain construction reference. The risk of
publishing inaccurate lingerie content (a wrong wire channel,
ill-judged elastic tension, a gusset placed off-grain) is high enough
that the discipline waits for a specialist curation pass.

## What happens next

A future worker session will commission women's intimates content
under specialist curation. The brief will be authored by Rebecca or by
a guest contributor with bra-making + drafting expertise. Until then:

- Lingerie patterns may exist in the Sewing Studio (catalogued via
  the S-7 designer onboarding flow, where contributing designers
  carry the construction expertise themselves).
- The public `/sewing/womens-intimates` sub-cat page surfaces
  whatever designer-onboarded content lands there.
- Autopilot does not author tutorials, patterns, or stitch guides
  for this sub-category.

## When the specialist-curation worker fires

It will replace this stub with a full author prompt at
`docs/sewing-womens-intimates-author.md` following the shape of the
other sewing prompts. At that point flip
`SubCategory.autopilotEnabled = true` for `sewing/womens-intimates`
so the autopilot rotation picks the sub-category alongside the
others.

## Marker for the autopilot routine

The string "Autopilot does NOT author" near the top of this stub
matches the convention used by the needlework specialist stubs
(`goldwork`, `ribbon-embroidery`, `stumpwork`). The autopilot
routine reads this string and halts with
`reason=SUB_CATEGORY_PROMPT_MISSING` if it ever routes here.

## See also

- [sewing-author.md](sewing-author.md) for the category-level index.
- [sewing-tops-author.md](sewing-tops-author.md) for the camisole
  shape that overlaps with simple lingerie.
- [sewing-dresses-author.md](sewing-dresses-author.md) for slip
  dresses and bias-cut lingerie-adjacent shapes.
