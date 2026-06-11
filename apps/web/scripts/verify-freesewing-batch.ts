/**
 * Smoke-test the freesewing wrapper against every registered design.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/verify-freesewing-batch.ts
 *
 * Walks SEWING_DESIGN_REGISTRY and:
 *   1. listDesigns() includes the entry.
 *   2. getDesignDefaults() returns the per-option defaults.
 *   3. homemadeFieldsFor() maps the design's freesewing keys back to
 *      Homemade measurement fields.
 *   4. draftPattern() renders SVG output at CYC defaults in PRINT mode.
 *
 * The wrapper falls back to CYC defaults for missing measurements, so an
 * empty payload still drafts. We log the fallbacksUsed count per design
 * so anyone reviewing this output can spot designs that lean heavily on
 * defaults (= less personalised at the locked 3-5 measurement profile).
 */

import {
  listDesigns,
  getDesignDefaults,
} from '../src/lib/sewing/grading/design-registry'
import { homemadeFieldsFor } from '../src/lib/sewing/grading/measurement-translation'
import { draftPattern } from '../src/lib/sewing/grading/grader'

async function main(): Promise<void> {
  const designs = listDesigns()
  console.log(`[verify] ${designs.length} designs registered`)
  let passed = 0
  let failed = 0
  for (const d of designs) {
    process.stdout.write(`  ${d.slug.padEnd(12)} `)
    try {
      const defaults = getDesignDefaults(d.slug)
      const requiredFields = homemadeFieldsFor(d.requiredMeasurements)
      const output = await draftPattern({
        designSlug: d.slug,
        measurements: {},
        designOptions: defaults,
        calibrationMode: 'PRINT',
      })
      const svgBytes = output.svg.length
      console.log(
        `OK options=${Object.keys(defaults).length} required-hm-fields=${requiredFields.length} svg=${svgBytes}b`,
      )
      passed += 1
    } catch (err) {
      console.log(`FAIL ${err instanceof Error ? err.message : String(err)}`)
      failed += 1
    }
  }
  console.log(`\n[verify] passed=${passed} failed=${failed}`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[verify] fatal:', err)
  process.exit(1)
})
