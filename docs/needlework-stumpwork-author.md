# Needlework / Stumpwork authoring (specialist curation stub)

## Status

**Autopilot does NOT author stumpwork content.**

`SubCategory.autopilotEnabled = false` for `needlework/stumpwork`. The
autopilot routine skips this sub-category when picking a target inside
needlework.

## Why

Stumpwork is raised, three-dimensional embroidery. Elements are padded,
worked over wire frames, or built off the surface with detached
buttonhole and needle-lace techniques, then attached to a ground.

Authoring accurately requires:

- Solid surface embroidery foundations (a stumpwork piece often combines
  long-and-short, satin, French knots, padded satin, and couching under
  the raised work).
- Understanding of wire shaping (gauges, frame construction, attachment
  through fabric and into a slate frame).
- Knowledge of detached buttonhole and needle-lace fillings worked over a
  cordonette, including the order in which rows build the shape.
- Sensitivity to how raised elements sit when the finished piece is
  mounted, framed, or stored.

These are advanced craft skills that combine multiple disciplines into
one 3D construction. A general-purpose authoring pass would describe
the steps in flat terms and miss the construction logic, producing
instructions that read as a list and do not result in a piece that
stands off the fabric correctly. The risk of publishing flat instructions
for inherently dimensional work is high enough that we hold the
discipline back until a dedicated specialist-curation worker can
commission this content.

## What happens next

A future worker session will commission stumpwork content under
specialist curation. Until then:

- Stumpwork patterns may exist in the Needlework Studio (users can save
  stumpwork-format patterns to their own library).
- The public `/needlework/stumpwork` sub-cat page surfaces whatever
  user-created content lands there.
- Autopilot does not author tutorials, patterns, or stitch guides for
  this sub-category.

## When the specialist-curation worker fires

It will create its own master author prompt at this path, replacing this
stub. At that point flip `SubCategory.autopilotEnabled = true` for
`needlework/stumpwork` so the autopilot rotation starts picking the
sub-cat alongside the others.

## Foundations prerequisite

A reader learning stumpwork needs surface embroidery foundations first.
The future specialist worker will cross-reference the
[needlework-surface-embroidery-author.md](needlework-surface-embroidery-author.md)
prompt for the underlying stitches and the
[needlework-foundations-author.md](needlework-foundations-author.md)
prompt for hoop / frame setup, needle threading, and thread management.

## See also

- [needlework-author.md](needlework-author.md) for the category-level
  index of all 10 discipline prompts and their authoring status.
