// One-shot inspection script. Prints per-design rendered part dimensions
// for the verification hand-off table. Not part of the test suite.
//
// Run:
//   pnpm --filter @homemade/web exec tsx src/lib/sewing/grading/_inspect-dimensions.ts

import { draftPattern } from './grader'
import type { MeasurementsPayload } from '../measurements'

const CYC_WOMENS_M: MeasurementsPayload = {
  bustChestCm: 92,
  waistCm: 74,
  hipCm: 100,
  bodyHeightCm: 168,
  inseamCm: 78,
  bustPointCm: 18,
  backWaistLengthCm: 41,
  frontWaistLengthCm: 42,
  shoulderWidthCm: 41,
  armLengthCm: 60,
  wristCircumferenceCm: 16,
  neckCircumferenceCm: 36,
}
const CYC_MENS_M: MeasurementsPayload = {
  bustChestCm: 100,
  waistCm: 87,
  hipCm: 99,
  bodyHeightCm: 178,
  inseamCm: 80,
  shoulderWidthCm: 45,
  armLengthCm: 66,
  wristCircumferenceCm: 17,
  neckCircumferenceCm: 38,
}

async function main() {
  for (const [slug, measurements, expected] of [
    ['bella', CYC_WOMENS_M, 920],
    ['brian', CYC_MENS_M, 1000],
    ['aaron', CYC_WOMENS_M, 920],
  ] as const) {
    const out = await draftPattern({
      designSlug: slug,
      measurements,
      calibrationMode: 'BROWSE',
    })
    process.stdout.write(`\n=== ${slug} ===\n`)
    process.stdout.write(`chest expected: ${expected}mm (CYC body)\n`)
    process.stdout.write(`cacheKey: ${out.cacheKey.slice(0, 16)}…\n`)
    process.stdout.write(`SVG bytes: ${out.svg.length}\n`)
    process.stdout.write(`parts (${out.partList.length}):\n`)
    for (const p of out.partList) {
      process.stdout.write(
        `  ${p.name.padEnd(28)} width=${p.widthMm.toFixed(1)}mm  height=${p.heightMm.toFixed(1)}mm\n`,
      )
    }
  }
}

main().catch((err) => {
  process.stderr.write(`${err.stack ?? err.message}\n`)
  process.exit(1)
})
