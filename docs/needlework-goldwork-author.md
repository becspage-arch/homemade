# Needlework / Goldwork authoring (specialist curation stub)

## Status

**Autopilot does NOT author goldwork content.**

`SubCategory.autopilotEnabled = false` for `needlework/goldwork`. The
autopilot routine skips this sub-category when picking a target inside
needlework.

## Why

Goldwork is a highly specialised counted-and-couched embroidery
discipline. The technique uses real or imitation gold thread (purl, pearl
purl, bright check, smooth passing, jap gold, twist) couched onto a
fabric surface, often over felt or string padding, worked on a slate
frame.

Authoring accurately requires:

- Hands-on familiarity with how each thread type bends, sits, and reflects
  light.
- Knowledge of the specific tools (mellor, laying tool, slate-frame
  dressing) and how they shape the stitch.
- Understanding of the layering order in padded work (felt padding,
  string padding, basket-weave couching) that traditional pieces use.
- Sensitivity to ecclesiastical, ceremonial, and historical conventions
  that goldwork has carried for centuries.

These are years-of-practice skills. A general-purpose authoring pass would
produce content that reads plausible to a beginner and wrong to a
practitioner. The risk of publishing inaccurate goldwork content (a
miscalled thread type, a misordered padding sequence, a wrong frame
choice) is high enough that we hold the discipline back until a
dedicated specialist-curation worker can commission this content.

## What happens next

A future worker session will commission goldwork content under
specialist curation. Until then:

- Goldwork patterns may exist in the Needlework Studio (users can save
  goldwork-format patterns to their own library).
- The public `/needlework/goldwork` sub-cat page surfaces whatever
  user-created content lands there.
- Autopilot does not author tutorials, patterns, or stitch guides for
  this sub-category.

## When the specialist-curation worker fires

It will create its own master author prompt at this path, replacing this
stub. At that point flip `SubCategory.autopilotEnabled = true` for
`needlework/goldwork` so the autopilot rotation starts picking the
sub-cat alongside the others.

## See also

- [needlework-surface-embroidery-author.md](needlework-surface-embroidery-author.md)
  for the fully-guided surface embroidery prompt; goldwork shares the
  surface-vector Studio archetype.
- [needlework-author.md](needlework-author.md) for the category-level
  index of all 10 discipline prompts and their authoring status.
