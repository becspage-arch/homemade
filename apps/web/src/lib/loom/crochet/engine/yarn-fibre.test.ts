/**
 * The yarn-fibre pass, tested at the plumbing layer: a program's `yarnFibre`
 * has to reach the Blender scene JSON (so `loom_render_crochet.py` can read
 * it), and it must never move a `geometryHash` — the loom's contract is that
 * fibre is a RENDER choice, not a construction one, so a re-render of the
 * same stitches in a different fibre is still the same audited geometry.
 *
 *   cd apps/web && npx tsx src/lib/loom/crochet/engine/yarn-fibre.test.ts
 */

import assert from 'node:assert/strict'
import { PROOF_PROGRAMS, programYarnFibre, type CrochetProgram } from './program'
import { compileRelaxAudit, geometryHash, programScene } from './programScene'
import { compileComposition, compositionScene, type CompositionProgram } from './composition'
import { buildAmigurumiProgram } from './amigurumiPresets'

const results: { name: string; passed: boolean; detail?: string }[] = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

const disc: CrochetProgram = PROOF_PROGRAMS['proof-disc']!

check('programYarnFibre defaults to cotton when unset', () => {
  assert.equal(programYarnFibre(disc), 'cotton')
})

check('programYarnFibre honours an explicit choice', () => {
  assert.equal(programYarnFibre({ ...disc, yarnFibre: 'chenille' }), 'chenille')
})

check('a flat program\'s scene always carries a fibre, defaulting to cotton', () => {
  const { built, yr } = compileRelaxAudit(disc)
  const scene = programScene(disc, built, yr)
  assert.equal(scene.fibre, 'cotton')
})

check('a flat program\'s scene carries the program\'s chosen fibre', () => {
  const chenille: CrochetProgram = { ...disc, yarnFibre: 'chenille' }
  const { built, yr } = compileRelaxAudit(chenille)
  const scene = programScene(chenille, built, yr)
  assert.equal(scene.fibre, 'chenille')
})

check('yarnFibre never moves a flat program\'s geometry hash', () => {
  const cotton: CrochetProgram = { ...disc, yarnFibre: 'cotton' }
  const wool: CrochetProgram = { ...disc, yarnFibre: 'wool' }
  const chenille: CrochetProgram = { ...disc, yarnFibre: 'chenille' }
  const velvet: CrochetProgram = { ...disc, yarnFibre: 'velvet' }
  const unset: CrochetProgram = { ...disc }
  delete (unset as { yarnFibre?: unknown }).yarnFibre

  const hashes = [unset, cotton, wool, chenille, velvet].map((p) => {
    const { built } = compileRelaxAudit(p)
    return geometryHash(built)
  })
  assert.ok(hashes.every((h) => h === hashes[0]), `hashes differ: ${hashes.join(', ')}`)
})

// ── Compositions (amigurumi) ─────────────────────────────────────────────────

const ballChoices = { base: 'ball' as const, size: 'M' as const, mainHex: '#c25a3c', contrastHex: '#e6d3ae', eyeMm: 0, nose: false, paws: false }

check('a composition\'s scene always carries a fibre, defaulting to cotton', () => {
  const program: CompositionProgram = buildAmigurumiProgram(ballChoices)
  const compiled = compileComposition(program)
  const scene = compositionScene(program, compiled)
  assert.equal(scene.fibre, 'cotton')
})

check('a composition\'s scene carries its chosen fibre', () => {
  const program: CompositionProgram = { ...buildAmigurumiProgram(ballChoices), yarnFibre: 'velvet' }
  const compiled = compileComposition(program)
  const scene = compositionScene(program, compiled)
  assert.equal(scene.fibre, 'velvet')
})

check('yarnFibre never moves a composition\'s geometry hash', () => {
  const base = buildAmigurumiProgram(ballChoices)
  const hashes = (['cotton', 'wool', 'chenille', 'velvet'] as const).map((yarnFibre) => {
    const program: CompositionProgram = { ...base, yarnFibre }
    return compileComposition(program).geometryHash
  })
  assert.ok(hashes.every((h) => h === hashes[0]), `hashes differ: ${hashes.join(', ')}`)
})

for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}${r.detail ? `\n  ${r.detail}` : ''}`)
const failed = results.filter((r) => !r.passed).length
console.log(`\n${results.length - failed}/${results.length} passed`)
if (failed) process.exit(1)
