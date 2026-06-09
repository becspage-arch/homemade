# Needlework / Ribbon embroidery authoring (specialist curation stub)

## Status

**Autopilot does NOT author ribbon embroidery content.**

`SubCategory.autopilotEnabled = false` for `needlework/ribbon-embroidery`.
The autopilot routine skips this sub-category when picking a target
inside needlework.

## Why

Ribbon embroidery uses silk or synthetic ribbon (typically 1.5 mm, 4 mm,
7 mm, or 13 mm wide) drawn through fabric with a chenille needle.
Ribbon behaviour on the fabric is non-obvious: it gathers, twists,
loops, folds, and reflects light in ways that no flat-thread stitch
predicts.

Authoring accurately requires:

- Hands-on familiarity with each ribbon width, how it loads on the
  needle, and how it lies on the fabric when pulled through.
- Knowledge of the specific ribbon stitches (spider-web rose, ribbon
  stitch, plume stitch, woven rose, French knot in ribbon, twisted
  straight stitch) and how each one sits in three dimensions.
- Sensitivity to how silk ribbon ages, blocks, and frames compared with
  cotton or wool thread.

These are practice-based skills. A general-purpose authoring pass would
write instructions that follow the conventions of flat-thread surface
embroidery and produce flat, lifeless results on the page. The risk of
publishing instructions that produce a discouraging first piece for a
beginner is high enough that we hold the discipline back until a
dedicated specialist-curation worker can commission this content.

## What happens next

A future worker session will commission ribbon embroidery content under
specialist curation. Until then:

- Ribbon embroidery patterns may exist in the Needlework Studio (users
  can save ribbon-embroidery-format patterns to their own library).
- The public `/needlework/ribbon-embroidery` sub-cat page surfaces
  whatever user-created content lands there.
- Autopilot does not author tutorials, patterns, or stitch guides for
  this sub-category.

## When the specialist-curation worker fires

It will create its own master author prompt at this path, replacing this
stub. At that point flip `SubCategory.autopilotEnabled = true` for
`needlework/ribbon-embroidery` so the autopilot rotation starts picking
the sub-cat alongside the others.

## See also

- [needlework-surface-embroidery-author.md](needlework-surface-embroidery-author.md)
  for the fully-guided surface embroidery prompt; ribbon embroidery
  shares the surface-vector Studio archetype.
- [needlework-author.md](needlework-author.md) for the category-level
  index of all 10 discipline prompts and their authoring status.
