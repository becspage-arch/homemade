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
} from './amigurumiPresets'

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

console.log('Every profile the designer can produce passes the audit')
for (const rounds of AUDITED_PROFILES) {
  check(`profile ${rounds.join(',')}`, () => {
    const compiled = compileComposition({
      name: `profile-${rounds.join('-')}`,
      yarnWeight: 'worsted',
      parts: [{ name: 'piece', stitch: 'sc', rounds, colourHex: '#b5814e', place: { on: 'ground' } }],
    })
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))
  })
}

console.log('\nEvery preset builds clean, and reports its settled size')
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
    const stitches = program.parts.reduce((a, p) => a + p.rounds.reduce((x, y) => x + y, 0), 0)
    console.log(
      `      ${amigurumiPresetName(choices)}: ${program.parts.length} pieces, ${stitches} sts, ` +
      `${Math.round(maxx - minx)} x ${Math.round(maxz - minz)} mm`,
    )
  })
}

if (failures.length) {
  console.error(`\n${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nAll amigurumi presets audit clean.')
