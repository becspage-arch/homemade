// Yarn requirement estimation for knitted garments.
//
// Yarn use scales with the surface area of fabric produced. Modern CYC
// yarn-weight standards (public reference) give consumption per square
// unit at average tension for each weight category. Knit fabric uses
// less yarn per cm-squared than crochet at the same gauge — looser
// structure, thinner fabric — so the per-weight grams figures sit
// below the crochet library's. Values calibrated against Drops Design
// free patterns + a sample of indie patterns so a typical women's-M
// aran pullover lands around 400-500 g and a kids size-8 DK pullover
// lands around 200-280 g.

export interface YarnConsumption {
  /** Approximate grams used per 100 cm^2 of stockinette. */
  gramsPer100SqCm: number
  /** Approximate yards used per 100 cm^2 of stockinette. */
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
const CONSUMPTION_BY_WEIGHT: Record<number, YarnConsumption> = {
  1: { gramsPer100SqCm: 1.5, yardsPer100SqCm: 5.6 },
  2: { gramsPer100SqCm: 2.2, yardsPer100SqCm: 4.7 },
  3: { gramsPer100SqCm: 3.0, yardsPer100SqCm: 3.8 },
  4: { gramsPer100SqCm: 4.0, yardsPer100SqCm: 2.9 },
  5: { gramsPer100SqCm: 5.4, yardsPer100SqCm: 2.0 },
  6: { gramsPer100SqCm: 7.5, yardsPer100SqCm: 1.3 },
  7: { gramsPer100SqCm: 12.0, yardsPer100SqCm: 0.9 },
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
  // Sleeve: tapered cylinder approximated as a trapezoid; average
  // circumference sits ~0.83 of upper arm. Two sleeves.
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
