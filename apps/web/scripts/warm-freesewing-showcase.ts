/**
 * Pre-warm showcase renders for every registered freesewing design so
 * the personalisation picker hits the cache on first page load.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/warm-freesewing-showcase.ts
 *
 * Idempotent: identical (designSlug, CYC measurements, options,
 * calibrationMode, freesewingVersion) → identical cacheKey → no DB write.
 */

import { listDesigns } from '../src/lib/sewing/grading/design-registry'
import { draftPattern } from '../src/lib/sewing/grading/grader'
import { prisma } from '@homemade/db'
import type { MeasurementsPayload } from '../src/lib/sewing/measurements'

// Same CYC defaults the showcase helper uses. Inlined here because the
// showcase module is `server-only` and tsx can't load it from a CLI script.
const CYC_WOMENS_M_CM: MeasurementsPayload = {
  bustChestCm: 92, waistCm: 74, hipCm: 100, bodyHeightCm: 168, inseamCm: 78,
  bustPointCm: 18, backWaistLengthCm: 41, frontWaistLengthCm: 42,
  shoulderWidthCm: 41, armLengthCm: 60, wristCircumferenceCm: 16,
  neckCircumferenceCm: 36,
}
const CYC_MENS_M_CM: MeasurementsPayload = {
  bustChestCm: 100, waistCm: 87, hipCm: 99, bodyHeightCm: 178, inseamCm: 80,
  shoulderWidthCm: 45, armLengthCm: 66, wristCircumferenceCm: 17,
  neckCircumferenceCm: 38,
}

async function main(): Promise<void> {
  const designs = listDesigns()
  console.log(`[warm] ${designs.length} designs to warm`)
  const cacheBefore = await prisma.sewingPatternDraftCache.count()
  console.log(`[warm] SewingPatternDraftCache rows before: ${cacheBefore}`)
  let warmed = 0
  let failed = 0
  for (const d of designs) {
    try {
      const measurements =
        d.genderFamily === 'MENS' ? CYC_MENS_M_CM : CYC_WOMENS_M_CM
      // BROWSE mode matches getFreesewingShowcase so the picker page hits
      // the same cacheKey on first load. We skip the design-options
      // override (showcase uses freesewing's CYC defaults) for the same
      // reason.
      const out = await draftPattern({
        designSlug: d.slug,
        measurements,
        calibrationMode: 'BROWSE',
      })
      const existing = await prisma.sewingPatternDraftCache.findUnique({
        where: { cacheKey: out.cacheKey },
      })
      if (existing) {
        console.log(
          `  ${d.slug.padEnd(12)} cache HIT cacheKey=${out.cacheKey.slice(0, 12)}`,
        )
      } else {
        await prisma.sewingPatternDraftCache.create({
          data: {
            cacheKey: out.cacheKey,
            designSlug: d.slug,
            measurementsHash: out.cacheKey,
            optionsHash: out.cacheKey,
            calibrationMode: 'BROWSE',
            svgOutput: out.svg,
            freesewingVersion: out.freesewingVersion,
            accessCount: 0,
          },
        })
        console.log(
          `  ${d.slug.padEnd(12)} cached  svg=${out.svg.length}b cacheKey=${out.cacheKey.slice(0, 12)}`,
        )
      }
      warmed += 1
    } catch (err) {
      console.log(`  ${d.slug.padEnd(12)} FAIL ${err instanceof Error ? err.message : err}`)
      failed += 1
    }
  }
  console.log(`\n[warm] warmed=${warmed} failed=${failed}`)
  const cacheAfter = await prisma.sewingPatternDraftCache.count()
  console.log(`[warm] SewingPatternDraftCache rows after: ${cacheAfter}`)
  console.log(`[warm] cache delta: +${cacheAfter - cacheBefore}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
