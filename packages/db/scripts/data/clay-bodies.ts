/**
 * Master clay-body list — single source of truth for `ClayBody`.
 *
 * Seeded via `packages/db/scripts/seed-clay-bodies.ts` (idempotent upsert).
 * Starter set covering the canonical bodies a UK home or studio reader
 * will reach for, split deliberately into the two sub-tracks the pottery
 * authoring prompt enforces:
 *
 *   No-equipment track (~70% of the 500-tutorial target) — paper-clay,
 *   polymer, air-dry. `requiresKiln = false`. Tutorials reference these
 *   bodies for pinch / coil / slab / drape-moulded / sprig-moulded work
 *   that sets in a domestic oven or at room temperature.
 *
 *   Wheel + kiln track (~30%) — earthenware, stoneware, porcelain, raku.
 *   `requiresKiln = true`. Tutorials reference these for thrown +
 *   greenware-decorated + glazed + fired work. The public list page
 *   badges any tutorial whose ClayBody set includes a requiresKiln row.
 *
 * Brand names deliberately omitted (Standard 365, B-mix, Sculpey, Fimo,
 * Crayola, DAS) — homemade.education names bodies by composition and
 * firing range, the same way the food categories don't name brands.
 * The notes column captures the body's hand at the wheel and at hand-
 * building so a reader can pick by feel.
 */

import type { ClayBodySeed } from './types.js'

export const CLAY_BODIES: ClayBodySeed[] = [
  // ───────────────────────────────────────────────────────────────────────
  // No-equipment track — no kiln required. Hand-building only at home.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'air-dry-clay',
    name: 'Air-dry clay',
    bodyType: 'air-dry',
    requiresKiln: false,
    notes:
      'Cellulose-bound water-clay that sets at room temperature in 24-72 hours. Behaves like real clay while wet — slips, pinches, coils, joins with slurry — but cannot be fired. Final piece is decorative; not waterproof, not food-safe. Best for sculptural work, ornaments, and learning hand-building moves without a kiln. Seal with acrylic or PVA if the piece will be handled.',
  },
  {
    slug: 'paper-clay-air-dry',
    name: 'Paper clay (air-dry)',
    bodyType: 'paper-clay',
    requiresKiln: false,
    notes:
      'Cellulose fibres mixed into an air-dry base. Stronger than plain air-dry clay at the green stage because the paper fibres knit the body together; takes deeper joints without cracking. Same no-kiln limitations as plain air-dry. Useful for slabs and panels that would crack as plain air-dry.',
  },
  {
    slug: 'polymer-clay',
    name: 'Polymer clay',
    bodyType: 'polymer',
    requiresKiln: false,
    notes:
      'PVC-based modelling material that sets in a domestic oven at 110-130°C for 15-30 minutes. Not a true ceramic — the cured piece is a hard plastic. Strong at small scale (beads, miniatures, jewellery, buttons, small sculptural pieces). Fine detail holds. Use a dedicated oven liner / pan; do not share with food-prep cookware.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Wheel + kiln track — fires to a vitrified ceramic. Studio or class
  // access typically needed. The kiln-firing safety preamble in the
  // authoring prompt is mandatory on every tutorial referencing one of
  // these bodies.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'earthenware-red',
    name: 'Red earthenware',
    bodyType: 'earthenware',
    firingRangeCones: '06-04',
    requiresKiln: true,
    shrinkagePercent: '8-10%',
    notes:
      'Iron-rich terracotta body firing to a warm orange-red at low temperatures (1000-1060°C). Plastic, forgiving, works equally well for hand-building and the wheel. Porous after firing — needs a glaze for water-tightness. The classical body for traditional Mediterranean terracotta, garden pots, and slip-decorated medieval reproduction work.',
  },
  {
    slug: 'earthenware-white',
    name: 'White earthenware',
    bodyType: 'earthenware',
    firingRangeCones: '06-04',
    requiresKiln: true,
    shrinkagePercent: '7-9%',
    notes:
      'Refined low-fire body firing to a pale cream or white. Takes bright commercial under-glazes and majolica decoration cleanly because the body colour does not muddy the glaze. Plastic and easy for beginners on the wheel. Porous after firing; glaze inside-and-out for food use.',
  },
  {
    slug: 'stoneware-smooth',
    name: 'Smooth stoneware',
    bodyType: 'stoneware',
    firingRangeCones: '6',
    requiresKiln: true,
    shrinkagePercent: '12-13%',
    notes:
      'Mid-fire body (1220-1240°C) firing to a buff or pale grey. Vitrifies, so finished pieces are water-tight without a glaze (though glaze is still standard). The mid-range default for tableware: mugs, bowls, plates, jars. Throws cleanly and holds detail; trims well at leather-hard. Cone 6 is the most common UK electric-kiln firing schedule.',
  },
  {
    slug: 'stoneware-grogged',
    name: 'Grogged stoneware',
    bodyType: 'stoneware',
    firingRangeCones: '6-10',
    requiresKiln: true,
    shrinkagePercent: '10-12%',
    notes:
      'Stoneware with crushed pre-fired ceramic (grog) added at 10-30% by weight. Grog opens the body, reduces shrinkage, and resists cracking on large slabs and sculptural builds. The standard choice for big-piece hand-building (planters, garden sculptures, sinks). Wheel-throws less smoothly than smooth stoneware — the grog scratches palms — but is far more forgiving of thickness variation.',
  },
  {
    slug: 'stoneware-speckled',
    name: 'Speckled stoneware',
    bodyType: 'stoneware',
    firingRangeCones: '6',
    requiresKiln: true,
    shrinkagePercent: '12-13%',
    notes:
      'Mid-fire stoneware with manganese or iron speckling that bursts through transparent glazes as small dark flecks. Visually distinctive without any extra decoration step. Otherwise behaves like smooth stoneware on the wheel and at hand-building.',
  },
  {
    slug: 'porcelain',
    name: 'Porcelain',
    bodyType: 'porcelain',
    firingRangeCones: '9-10',
    requiresKiln: true,
    shrinkagePercent: '13-15%',
    notes:
      'High-fire white body (1260-1300°C) firing to a translucent dense ceramic. Less plastic than stoneware — collapses sooner on the wheel, splits faster on slabs — so technique discipline matters. Best in skilled hands for fine tableware, vases, and translucent test tiles. Beginners typically start on stoneware and graduate to porcelain.',
  },
  {
    slug: 'porcelain-grogged',
    name: 'Grogged porcelain',
    bodyType: 'porcelain',
    firingRangeCones: '9-10',
    requiresKiln: true,
    shrinkagePercent: '11-13%',
    notes:
      'Porcelain with fine grog added for stability at scale. Still fires translucent at thin walls but throws and slabs with less drama than plain porcelain. The bridge body for makers stepping up from stoneware to porcelain.',
  },
  {
    slug: 'paper-clay-stoneware',
    name: 'Paper clay (stoneware)',
    bodyType: 'paper-clay',
    firingRangeCones: '6',
    requiresKiln: true,
    shrinkagePercent: '10-12%',
    notes:
      'Stoneware enriched with 5-10% cellulose fibre. The paper burns out in the bisque firing, leaving a normal stoneware fired body. Joins between bone-dry and freshly-thrown pieces (which would otherwise crack apart) hold cleanly because the paper bridges the moisture gradient. The maker\'s body for assembled sculptural work that would be impossible in straight stoneware.',
  },
  {
    slug: 'raku-stoneware',
    name: 'Raku stoneware',
    bodyType: 'raku',
    firingRangeCones: '06-04',
    requiresKiln: true,
    shrinkagePercent: '6-8%',
    notes:
      'Low-shrinkage open body designed to survive the thermal shock of raku (pulled red-hot from the kiln into a reduction container). Heavily grogged so it does not crack on rapid cooling. Not for food use — the fired body remains porous and raku glaze surfaces are not food-safe. Atmospheric / decorative work only.',
  },
]
