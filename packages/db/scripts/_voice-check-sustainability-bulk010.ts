/**
 * Batch voice-check for sustainability-bulk-010 briefs.
 * Runs voice-check-lib on all 40 JSON files and reports failures.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVoiceCheck, exitCodeFor } from './voice-check-lib.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BRIEFS_DIR = resolve(__dirname, '../../../docs/sustainability-bulk-010-briefs')

const FILES = [
  '01-installing-an-airtight-loft-hatch-cover.json',
  '02-warm-loft-vs-cold-loft-decision.json',
  '03-diy-magnetic-secondary-glazing.json',
  '04-air-sealing-electrical-back-boxes.json',
  '05-integral-garage-ceiling-insulation.json',
  '06-wet-room-insulation-moisture-management.json',
  '07-spray-foam-removal-and-remediation.json',
  '08-window-frame-perimeter-draught-sealing.json',
  '09-over-rafter-insulation-board.json',
  '10-draught-lobby-porch-glazing.json',
  '11-heat-pump-buffer-vessel-sizing.json',
  '12-solar-thermal-drainback-system.json',
  '13-ground-source-heat-pump-slinky-loop.json',
  '14-mvhr-commissioning-and-filter-schedule.json',
  '15-legionella-cycle-heat-pump-hot-water.json',
  '16-solar-pv-flat-roof-tilt-angle.json',
  '17-underfloor-heating-manifold-commissioning.json',
  '18-community-energy-co-op-joining.json',
  '19-johnson-su-bioreactor-build.json',
  '20-peat-free-seed-raising-compost-blend.json',
  '21-compost-maturity-tests.json',
  '22-black-soldier-fly-larvae-in-compost.json',
  '23-turning-a-cold-compost-heap.json',
  '24-urine-as-nitrogen-activator-in-compost.json',
  '25-compost-leachate-collection-and-use.json',
  '26-compost-lawn-topdressing.json',
  '27-borehole-water-supply-feasibility.json',
  '28-pond-for-surface-water-management.json',
  '29-home-water-filtration-options.json',
  '30-dishwasher-vs-handwashing-water-efficiency.json',
  '31-drip-emitter-maintenance.json',
  '32-rainwater-for-laundry.json',
  '33-home-composting-vs-food-waste-collection.json',
  '34-safe-battery-removal-before-disposal.json',
  '35-routing-unwanted-homewares-to-charities.json',
  '36-peat-free-garden-supply-swaps.json',
  '37-waste-free-gift-wrapping-alternatives.json',
  '38-rocket-mass-heater-construction.json',
  '39-off-grid-internet-connectivity-options.json',
  '40-off-grid-property-insurance-guide.json',
]

let totalErrors = 0
let totalWarnings = 0
const failures: string[] = []

for (const file of FILES) {
  const fullPath = resolve(BRIEFS_DIR, file)
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(fullPath, 'utf-8'))
  } catch (e) {
    console.error(`PARSE ERROR: ${file}`)
    failures.push(file)
    continue
  }

  const report = runVoiceCheck(raw)
  const code = exitCodeFor(report)
  totalErrors += report.errors.length
  totalWarnings += report.warnings.length

  if (code === 2) {
    console.error(`ERROR  [${file}]`)
    for (const f of report.errors) {
      console.error(`  ✗ ${f.kind}: ${f.message} at ${f.path}`)
    }
    failures.push(file)
  } else if (code === 1) {
    console.warn(`WARN   [${file}]`)
    for (const f of report.warnings) {
      console.warn(`  ⚠ ${f.kind}: ${f.message} at ${f.path}`)
    }
  } else {
    console.log(`OK     [${file}]`)
  }
}

console.log(`\n--- Summary ---`)
console.log(`Files: ${FILES.length}`)
console.log(`Total errors: ${totalErrors}`)
console.log(`Total warnings: ${totalWarnings}`)
console.log(`Files with errors: ${failures.length}`)
if (failures.length > 0) {
  console.log(`Failed files:`)
  for (const f of failures) console.log(`  ${f}`)
  process.exit(2)
}
