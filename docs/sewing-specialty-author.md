# Sewing / Specialty + technical authoring (specialist curation stub)

## Status

**Autopilot does NOT author specialty + technical sewing content.**

`SubCategory.autopilotEnabled = false` for `sewing/specialty`. The
autopilot routine skips this sub-category when picking a sewing
target. The stub stays in place until a dedicated specialist-curation
worker session replaces it with a full author prompt.

## Why

Specialty + technical sewing covers disciplines that need hands-on
expertise a general-purpose sewing author prompt cannot replicate
accurately:

- **Waterproof outdoor gear** (tents, rain jackets, kayak skirts,
  sail covers) requires taped-seam construction with specialist
  glues, breathable + waterproof membrane handling, ripstop nylon
  technique, and field-tested durability assumptions. Wrong seam
  treatment leaves the gear leaking; an inaccurate tutorial puts
  users at risk in actual outdoor conditions.

- **Leatherwork** (belts, wallets, satchels, knife sheaths, saddle
  work) uses dedicated tools (pricking iron, awl, edge bevel,
  burnisher, leather needle + thread), thread tension and knot
  technique distinct from machine-sewn fabric, edge-finishing
  conventions (skiving, edge-paint, burnish), and dyeing + sealing
  technique. A fabric sewer's instincts mislead in leatherwork.

- **Upholstery** (chair re-covering, sofa rebuilding, headboard
  construction, ottoman work) involves frame inspection, webbing
  attachment, spring placement + tying, hessian + scrim work,
  horsehair + cotton-felt + foam stuffing layered for fit, and
  hand-stitched edge work. A tutorial that conflates upholstery
  with regular sewing produces results that collapse under use.

- **Sailmaking** (working sails, sun sails, awnings) uses
  reinforced corner construction, polyester + dacron sail cloth
  handling, hand-sewn bolt rope attachment, and grommet placement
  that demands sailmaking-grade machine + thread + technique.

- **Industrial sewing** (heavy webbing harnesses, climbing slings,
  tactical gear) carries safety implications that no general-purpose
  prompt can guarantee. Mis-sewn safety equipment kills people.
  This work belongs in industrial-certified contexts only.

The risk of publishing inaccurate specialty sewing content is high
enough (to gear, to safety, to user trust) that the discipline
waits for a specialist curation pass.

## What happens next

A future worker session will commission specialty + technical content
under specialist curation. Brief authors will have hands-on expertise
in the relevant sub-discipline (outdoor gear, leather, upholstery,
sailmaking). Until then:

- Specialty patterns may exist in the Sewing Studio if catalogued via
  the S-7 designer onboarding flow where contributing designers carry
  the relevant expertise.
- The public `/sewing/specialty` sub-cat page surfaces whatever
  designer-onboarded content lands there.
- Autopilot does not author tutorials, patterns, or technique guides
  for this sub-category.

## Industrial / safety-critical sewing: never in autopilot scope

Even after the specialist-curation worker lands, certain specialty
content stays out of autopilot scope entirely:

- Climbing harnesses, rappelling slings, fall-arrest equipment.
- Boat life jackets + safety harnesses.
- Motorbike protective gear.
- Aviation upholstery + safety equipment.
- Heavy lifting webbing + cargo straps.
- Medical compression garments + post-surgical wear.

These categories require certifying authorities, tested materials,
and signed-off construction; not the territory of a homemaking
publication, full stop. The pre-launch checklist's no-medical-advice
+ no-safety-thresholds rules apply.

## When the specialist-curation worker fires

It will replace this stub with a full author prompt at
`docs/sewing-specialty-author.md` following the shape of the other
sewing prompts. The prompt will be scoped to the safe specialty
disciplines (waterproof outdoor gear at the hobbyist level,
leatherwork, upholstery for home-use furniture) and exclude the
industrial / safety-critical categories listed above. At that point
flip `SubCategory.autopilotEnabled = true` for `sewing/specialty` so
the autopilot rotation picks the sub-category alongside the others.

## Marker for the autopilot routine

The string "Autopilot does NOT author" near the top of this stub
matches the convention used by the needlework specialist stubs
(`goldwork`, `ribbon-embroidery`, `stumpwork`). The autopilot
routine reads this string and halts with
`reason=SUB_CATEGORY_PROMPT_MISSING` if it ever routes here.

## See also

- [sewing-author.md](sewing-author.md) for the category-level index.
- [sewing-bags-author.md](sewing-bags-author.md) for casual leather-
  trim bags that fall inside the bags scope.
- [sewing-home-author.md](sewing-home-author.md) for soft-goods
  upholstery (cushion covers, simple chair seat re-covers).
