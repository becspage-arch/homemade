/**
 * The amigurumi designer's shapes, put through the loom's own audit gate.
 *
 * Every preset at every size is built, relaxed and audited exactly as a render
 * would build it. A failure here means the designer can hand a maker a pattern
 * whose stitches do not interlock, which is the one thing the loom must never
 * do, so this is the gate that lets the save path trust `AUDITED_PROFILES`
 * instead of recompiling on the request.
 *
 * Slow on purpose (relaxation runs over every stitch of every piece). Run it
 * when the profiles or the composition layer change:
 *
 *   cd apps/web && npx tsx src/lib/loom/crochet/engine/amigurumi-presets.test.ts
 */

import assert from 'node:assert/strict'
import { compileComposition } from './composition'
import {
  AUDITED_PROFILES,
  allPresetChoices,
  amigurumiPresetName,
  buildAmigurumiProgram,
  isAuditedProfile,
  presetSettledSizeMm,
} from './amigurumiPresets'
import { PRESET_SETTLED_SIZE_MM_GENERATED, PROFILE_SIZE_MM_GENERATED } from './amigurumiSizes.generated'

/** How far a settled measurement may drift from the checked-in generated
 *  table before the build fails — the guard against a re-cut round builder
 *  quietly leaving the Studio's quoted size stale (§8f-6 in STITCH_ENGINE.md:
 *  `PROFILE_SIZE_MM` sat ~35% stale for a whole pass before anyone noticed). */
const DRIFT_TOLERANCE = 0.10
/** A preset must settle sitting ON the table: its lowest point within this of
 *  z = 0, or a maker's render shows a limb floating or sunk through the
 *  ground. */
const MINZ_TOLERANCE_MM = 0.5

function assertNoDrift(label: string, measured: number, recorded: number): void {
  const drift = Math.abs(measured - recorded) / Math.max(recorded, 1e-6)
  assert.ok(
    drift <= DRIFT_TOLERANCE,
    `${label}: settled ${measured.toFixed(1)} mm drifted ${(drift * 100).toFixed(0)}% from the generated ` +
    `${recorded} mm — run \`npx tsx scripts/loom-preset-sizes.ts\` to regenerate`,
  )
}

const failures: string[] = []

function check(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`  ok  ${name}`)
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`)
    console.log(`FAIL  ${name}`)
  }
}

console.log('Every profile the designer can produce passes the audit and reports its settled size')
for (const rounds of AUDITED_PROFILES) {
  const key = rounds.join(',')
  check(`profile ${key}`, () => {
    const compiled = compileComposition({
      name: `profile-${key}`,
      yarnWeight: 'worsted',
      parts: [{ name: 'piece', stitch: 'sc', rounds, colourHex: '#b5814e', place: { on: 'ground' } }],
    })
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
    for (const p of compiled.placed) {
      minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
      minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
    }
    // The designer's live schematic (CrochetAmigurumiDesignerPanel) reads
    // PROFILE_SIZE_MM per part instead of compiling in the browser — it must
    // stay honest about the piece's real proportions.
    const recorded = PROFILE_SIZE_MM_GENERATED[key]
    if (recorded) {
      assertNoDrift(`profile ${key} width`, maxx - minx, recorded.width)
      assertNoDrift(`profile ${key} height`, maxz - minz, recorded.height)
    }
  })
}

console.log('\nEvery preset builds clean, sits on the table, and reports its settled size')
for (const choices of allPresetChoices()) {
  const label = `${choices.base}/${choices.size}`
  check(label, () => {
    const program = buildAmigurumiProgram(choices)
    for (const part of program.parts) {
      assert.ok(
        isAuditedProfile(part.rounds),
        `${part.name} uses a profile that is not in AUDITED_PROFILES: ${part.rounds.join(',')}`,
      )
    }
    const compiled = compileComposition(program)
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
    for (const p of compiled.placed) {
      minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
      minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
    }
    // It must genuinely SIT: no limb floating above the table or sunk through
    // it. `GROUND_LIFT` in amigurumiPresets.ts is what this catches if a
    // future size or placement change moves it off the table again.
    assert.ok(
      Math.abs(minz) <= MINZ_TOLERANCE_MM,
      `${label} does not sit on the table: minz ${minz.toFixed(2)} mm (want within ${MINZ_TOLERANCE_MM} mm of 0)`,
    )
    const width = maxx - minx
    const height = maxz - minz
    // The quoted finished size the maker sees (buildFromDesigner reads this
    // same generated table rather than recompiling on every save) must still
    // be honest about what the geometry actually settles to.
    const key = `${choices.base}-${choices.size}`
    const recorded = PRESET_SETTLED_SIZE_MM_GENERATED[key] ?? presetSettledSizeMm(choices.base, choices.size)
    assertNoDrift(`${key} width`, width, recorded.width)
    assertNoDrift(`${key} height`, height, recorded.height)
    const stitches = program.parts.reduce((a, p) => a + p.rounds.reduce((x, y) => x + y, 0), 0)
    console.log(
      `      ${amigurumiPresetName(choices)}: ${program.parts.length} pieces, ${stitches} sts, ` +
      `${Math.round(width)} x ${Math.round(height)} mm, minz ${minz.toFixed(2)}`,
    )
  })
}

if (failures.length) {
  console.error(`\n${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nAll amigurumi presets audit clean.')
