/**
 * THE DOLL BASE, tested (doll.ts): every size builds, relaxes and AUDITS clean
 * at its fine gauge, stands on its soles, keeps its recorded geometry hash and
 * settled size, the colour change lands on the round the words name, the
 * joining round's count is the legs' plus the bridging chains, the face is
 * mirror-symmetric and its words come off the same spots, and the keyring
 * charm carries its rings.
 *
 *   cd apps/web && pnpm exec tsx --test src/lib/loom/crochet/engine/doll.test.ts
 *
 * Set DOLL_PRINT=1 to print a fresh hash / size table (for doll.ts) instead of
 * failing on a moved hash.
 */

import assert from 'node:assert/strict'
import { compileComposition, colourRuns, compositionScene } from './composition'
import { compositionPieces, writeCompositionInstructions } from './compositionPattern'
import {
  DOLL_GEOMETRY_HASH,
  DOLL_SETTLED_SIZE_MM,
  DOLL_SIZES,
  dollFace,
  dollPresetChoices,
  dollProgram,
} from './doll'
import { buildAmigurumiProgram, isAuditedProfile, presetSettledSizeMm } from './amigurumiPresets'

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

const PRINT = process.env.DOLL_PRINT === '1'
const fresh: Record<string, { hash: string; width: number; height: number }> = {}

console.log('Every doll size builds clean, stands, and keeps its hash and size')
for (const choices of dollPresetChoices()) {
  const key = `doll-${choices.size}`
  check(key, () => {
    const program = buildAmigurumiProgram(choices)
    for (const part of program.parts) assert.ok(isAuditedProfile(part.rounds), `${part.name} off the audited list`)
    const compiled = compileComposition(program)
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
    for (const p of compiled.placed) {
      minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
      minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
    }
    assert.ok(Math.abs(minz) <= 0.5, `does not stand on the table: minz ${minz.toFixed(2)}`)
    // Both soles are on the table.
    for (const leg of compiled.placed.filter((p) => p.part.name.startsWith('leg-')))
      assert.ok(Math.abs(leg.bounds.minz) <= 0.5, `${leg.part.name} sole off the table: ${leg.bounds.minz.toFixed(2)}`)
    const width = +(maxx - minx).toFixed(1)
    const height = +(maxz - minz).toFixed(1)
    const hash = compiled.geometryHash.slice(0, 8)
    fresh[key] = { hash, width, height }
    if (PRINT) return
    assert.equal(hash, DOLL_GEOMETRY_HASH[key], `${key} geometry hash moved (DOLL_PRINT=1 to print a fresh table)`)
    const rec = DOLL_SETTLED_SIZE_MM[key]!
    assert.ok(rec, `${key} has no recorded size`)
    assert.ok(Math.abs(width - rec.width) / rec.width <= 0.1 && Math.abs(height - rec.height) / rec.height <= 0.1, `${key} size drifted: ${width} x ${height} vs ${rec.width} x ${rec.height}`)
    assert.deepEqual(presetSettledSizeMm('doll', choices.size), rec)

    // The colour change: the body's strand is dress colour, then skin, cut at
    // the first stitch of the round the words name.
    const body = compiled.placed.find((p) => p.part.name === 'body')!
    const runs = colourRuns(body)
    assert.equal(runs.length, 2, 'body is two colour runs')
    assert.equal(runs[0]!.hex, choices.contrastHex)
    assert.equal(runs[1]!.hex, choices.mainHex)
    const scene = compositionScene(program, compiled)
    assert.ok(scene.strokes.some((s) => s.hex === choices.contrastHex), 'dress colour rendered')

    // The keyring charm carries a jump ring and a split ring; the dolls none.
    const rings = compiled.props.filter((p) => p.torusMinor != null)
    assert.equal(rings.length, choices.size === 'S' ? 2 : 0)
    console.log(`      ${program.parts.length} pieces, ${width} x ${height} mm, hash ${hash}`)
  })
}

check('the joining round is both legs plus the bridging chains, and the words say so', () => {
  for (const size of ['S', 'M', 'L'] as const) {
    const s = DOLL_SIZES[size]
    const L = s.leg[s.leg.length - 1]!
    assert.equal(s.body[0], 2 * L + 2 * s.bridge, `${size}: body round 1`)
    const p = dollProgram({ size, mainHex: '#eeeeee', contrastHex: '#aaccaa', eyeMm: 0 }, 'd')
    const lines = writeCompositionInstructions(p)
    const join = lines.find((l) => /^Round 1 \(joining round\)/.test(l))!
    assert.ok(/\(\d+ sts\)$/.test(join), 'the joining round ends with its count')
    assert.ok(join, 'a joining round')
    assert.ok(join.includes(`(${2 * L + 2 * s.bridge} sts)`), join)
    assert.ok(join.includes(`ch ${s.bridge},`), join)
    assert.ok(lines.some((l) => l.startsWith(`Change to the skin colour: work the last stitch of round ${s.skinFrom - 1}`)), 'colour change line')
    // The legs are one piece made twice, and they are not "sewn" on.
    const pieces = compositionPieces(p)
    assert.equal(pieces.find((x) => x.label === 'Legs')?.makeQuantity, 2)
    assert.ok(!lines.some((l) => /Sew the legs/.test(l)))
    assert.ok(lines.some((l) => /^Stuff the second leg firmly but do not fasten off/.test(l)))
  }
})

check('the face is a mirror image and its words name the same round', () => {
  const head = DOLL_SIZES.M.head
  for (const style of ['stitched', 'sleepy'] as const) {
    const f = dollFace(style, head)
    const l = f.find((x) => x.name === 'eye-l')!
    const r = f.find((x) => x.name === 'eye-r')!
    assert.equal(l.stitches.length, r.stitches.length)
    l.stitches.forEach((s, i) => {
      const t = r.stitches[i]!
      assert.ok(Math.abs(s.from.st + t.from.st) < 1e-9 && Math.abs(s.from.round - t.from.round) < 1e-9)
    })
    const p = dollProgram({ size: 'M', mainHex: '#eeeeee', contrastHex: '#aaccaa', eyeMm: 0, face: style }, 'd')
    const words = writeCompositionInstructions(p).join('\n')
    const eyeRound = style === 'stitched'
      ? (Math.min(...l.stitches.map((s) => s.from.round)) + Math.max(...l.stitches.map((s) => s.to.round))) / 2
      : l.stitches[0]!.from.round
    assert.ok(words.includes(`round ${Math.round(eyeRound)}`) || words.includes(`rounds ${Math.floor(eyeRound)} and`), `eye round ${eyeRound} in the words`)
    assert.ok(!/muzzle/.test(words), 'a doll has no muzzle')
  }
})

if (PRINT) console.log(JSON.stringify(fresh, null, 2))
if (failures.length) {
  console.error(`\n${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nThe doll base audits clean.')
