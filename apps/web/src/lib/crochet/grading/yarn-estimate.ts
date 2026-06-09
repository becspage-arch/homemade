// Yarn requirement estimation for crocheted garments.
//
// Pre-1980s crochet manuals (e.g. Weldon's Practical Needlework, public
// domain) established the rule-of-thumb that yarn usage scales with the
// surface area of fabric produced, not the stitch count alone. Modern
// yarn-weight standards (CYC standard yarn-weight system, public reference)
// give consumption per square unit at "average" tension for each weight
// category. Both inputs are observable and verifiable.

export interface YarnConsumption {
  /** Approximate grams used per 100 cm^2 of double-crochet fabric. */
  gramsPer100SqCm: number
  /** Approximate yards used per 100 cm^2 of double-crochet fabric. */
  yardsPer100SqCm: number
}

// Indexed by CYC standard yarn-weight category number.
// 1 = super fine (fingering)
// 2 = fine (sport)
// 3 = light (DK)
// 4 = medium (worsted / aran)
// 5 = bulky (chunky)
// 6 = super bulky
// 7 = jumbo
// Values calibrated against published Drops Design patterns + a sample
// of public indie garments. Crochet is meaningfully yarn-hungrier than
// knitting at the same gauge - denser stitches, thicker fabric. Values
// chosen so a typical women's-M aran pullover lands around 500-600g and
// a kids size-8 DK pullover lands around 200-250g, matching the
// midpoint of published patterns.
const CONSUMPTION_BY_WEIGHT: Record<number, YarnConsumption> = {
  1: { gramsPer100SqCm: 2.0, yardsPer100SqCm: 5.2 },
  2: { gramsPer100SqCm: 2.8, yardsPer100SqCm: 4.4 },
  3: { gramsPer100SqCm: 3.8, yardsPer100SqCm: 3.5 },
  4: { gramsPer100SqCm: 5.0, yardsPer100SqCm: 2.7 },
  5: { gramsPer100SqCm: 6.5, yardsPer100SqCm: 1.9 },
  6: { gramsPer100SqCm: 9.0, yardsPer100SqCm: 1.2 },
  7: { gramsPer100SqCm: 14.0, yardsPer100SqCm: 0.8 },
}

export function consumptionForWeight(category: number): YarnConsumption {
  const c = CONSUMPTION_BY_WEIGHT[category]
  if (!c) throw new Error(`Unsupported yarn weight category: ${category}`)
  return c
}

export interface GarmentSurfaceArea {
  bodyBust: number
  bodyLength: number
  sleeveUpper: number
  sleeveLength: number
  hasSleeves: boolean
}

export function estimateYarn(area: GarmentSurfaceArea, weightCategory: number): {
  grams: number
  yards: number
} {
  // Body: cylinder approximated as a flat rectangle, bust × bodyLength.
  const bodyArea = area.bodyBust * area.bodyLength
  // Sleeve: tapered cylinder approximated as a trapezoid; average circumference
  // sits halfway between upper arm and cuff (~ 0.83 of upper arm).
  const sleeveArea = area.hasSleeves
  ? 2 * area.sleeveUpper * 0.83 * area.sleeveLength
  : 0
  const totalSqCm = bodyArea + sleeveArea

  const c = consumptionForWeight(weightCategory)
  const sqUnits = totalSqCm / 100

  return {
    grams: Math.round(sqUnits * c.gramsPer100SqCm),
    yards: Math.round(sqUnits * c.yardsPer100SqCm),
  }
}
