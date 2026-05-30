import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BRIEFS_DIR = resolve(__dirname, '../../../docs/sustainability-bulk-011-briefs')

const FILES = [
  '01-party-wall-heat-loss-assessment.json',
  '02-chimney-stack-insulation-redundant-flue.json',
  '03-lime-mortar-repointing-airtightness.json',
  '04-radiator-reflector-panel-install.json',
  '05-insulating-an-outhouse-extension.json',
  '06-draught-sealing-loft-conversion-hatch.json',
  '07-pipe-boxing-insulation-unheated-spaces.json',
  '08-roof-window-flashing-draught-sealing.json',
  '09-heat-pump-leaving-temperature-optimisation.json',
  '10-smart-meter-half-hourly-data.json',
  '11-domestic-wind-turbine-feasibility.json',
  '12-immersion-heater-timer-replacement.json',
  '13-energy-performance-certificate-reading.json',
  '14-activating-cold-compost-heap-in-winter.json',
  '15-using-compost-in-raised-beds.json',
  '16-fruit-fly-prevention-in-compost-bins.json',
  '17-autumn-leaf-mould.json',
  '18-compost-bin-siting.json',
  '19-seaweed-as-compost-activator.json',
  '20-water-butt-first-flush-diverter.json',
  '21-checking-running-toilet.json',
  '22-sizing-a-water-butt.json',
  '23-outdoor-tap-installation.json',
  '24-grey-water-laundry-to-garden.json',
  '25-library-of-things-membership.json',
  '26-clothing-repair-basics.json',
  '27-household-food-waste-audit.json',
  '28-packaging-audit-at-home.json',
  '29-refurbishing-secondhand-furniture.json',
  '30-pv-optimiser-vs-string-inverter.json',
  '31-solar-pv-battery-management-schedules.json',
  '32-heat-pump-refrigerant-signs.json',
  '33-municipal-compost-vs-home-composting.json',
  '34-compost-tea-making.json',
  '35-mains-pressure-reducing-valve-install.json',
  '36-solar-heated-outdoor-shower.json',
  '37-rainwater-only-irrigation-off-grid.json',
  '38-small-wind-battery-hybrid-sizing.json',
  '39-buying-refurbished-electronics.json',
  '40-extending-appliance-lifespan.json',
]

let ok = 0
let failed = 0
const failures: string[] = []

for (const file of FILES) {
  const absPath = resolve(BRIEFS_DIR, file)
  process.stdout.write(`Uploading ${file}... `)
  try {
    execSync(
      `pnpm exec tsx scripts/upload-tutorial.ts "${absPath}" --status PUBLISHED`,
      { cwd: resolve(__dirname, '..'), stdio: 'pipe' }
    )
    console.log('OK')
    ok++
  } catch (err: any) {
    console.log('FAILED')
    console.error(err.stderr?.toString() ?? err.message)
    failed++
    failures.push(file)
  }
}

console.log(`\n--- Upload Summary ---`)
console.log(`Uploaded: ${ok}/${FILES.length}`)
if (failures.length > 0) {
  console.log(`Failed:`)
  for (const f of failures) console.log(`  ${f}`)
  process.exit(1)
}
