/**
 * The photo-to-tapestry program layer, checked end to end without a photo:
 * a known colour grid in, a stitch program out, and back again.
 *
 *   cd apps/web && npx tsx src/lib/studio/crochet/tapestry-program.test.ts
 */

import assert from 'node:assert/strict'
import {
  buildTapestryProgram,
  declareSettledSize,
  finishedSizeText,
  tapestryCellsFromProgram,
  tapestrySizeProblem,
  TAPESTRY_MAX_CELLS,
  type TapestryGrid,
} from './tapestry-program'
import { compileRelaxAudit, settledSizeMm } from '@/lib/loom/crochet/engine/programScene'
import { crochetProgramProblems } from './program-validation'
import { nameYarnColours } from './yarn-shades'

const results: Array<{ name: string; error?: string }> = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name })
    console.log(`  ok  ${name}`)
  } catch (err) {
    results.push({ name, error: err instanceof Error ? err.message : String(err) })
    console.log(`FAIL  ${name}`)
  }
}

/** A 4 x 3 picture: a diagonal of "b" over a field of "a". */
function sampleGrid(): TapestryGrid {
  return {
    width: 4,
    height: 3,
    // Read from the TOP of the picture down.
    cells: [
      'b', 'a', 'a', 'a',
      'a', 'b', 'a', 'a',
      'a', 'a', 'b', 'a',
    ],
    palette: [
      { key: 'a', name: 'Cream', hex: '#efe6d2', stitches: 9 },
      { key: 'b', name: 'Rust', hex: '#9c4a1e', stitches: 3 },
    ],
  }
}

check('the picture is flipped so row 1 is the row worked first', () => {
  const program = buildTapestryProgram(sampleGrid(), { name: 'diagonal' })
  assert.equal(program.form, 'grid')
  assert.equal(program.gridWidth, 4)
  assert.equal(program.grid?.length, 3)
  // Program row 0 is the bottom of the picture, which is the picture's LAST row.
  assert.deepEqual(program.grid?.[0]?.cellColours, ['a', 'a', 'b', 'a'])
  assert.deepEqual(program.grid?.[2]?.cellColours, ['b', 'a', 'a', 'a'])
})

check('every stitch of every row is a single crochet', () => {
  const program = buildTapestryProgram(sampleGrid(), { name: 'diagonal' })
  for (const row of program.grid ?? []) {
    assert.equal(row.stitches.length, 4)
    assert.ok(row.stitches.every((s) => s === 'sc'))
  }
})

check('the colours round-trip back to the picture they came from', () => {
  const grid = sampleGrid()
  const program = buildTapestryProgram(grid, { name: 'diagonal' })
  assert.deepEqual(tapestryCellsFromProgram(program), grid.cells)
})

check('the palette carries every colour the grid uses', () => {
  const program = buildTapestryProgram(sampleGrid(), { name: 'diagonal' })
  assert.deepEqual(Object.keys(program.palette ?? {}).sort(), ['a', 'b'])
  assert.equal(program.palette?.b, '#9c4a1e')
})

check('a program built from a grid passes the shape checks', () => {
  const program = buildTapestryProgram(sampleGrid(), { name: 'diagonal' })
  assert.deepEqual(crochetProgramProblems(program), [])
})

check('a colour that is not in the yarn list is caught', () => {
  const program = buildTapestryProgram(sampleGrid(), { name: 'diagonal' })
  const broken = {
    ...program,
    grid: (program.grid ?? []).map((r, i) => (i === 0 ? { ...r, cellColours: ['a', 'a', 'z', 'a'] } : r)),
  }
  const problems = crochetProgramProblems(broken)
  assert.equal(problems.length, 1)
  assert.match(problems[0]!, /"z"/)
})

check('the size cap refuses a grid the compile budget cannot hold', () => {
  assert.equal(tapestrySizeProblem(24, 24), null)
  assert.match(String(tapestrySizeProblem(40, 40)), new RegExp(String(TAPESTRY_MAX_CELLS)))
  assert.match(String(tapestrySizeProblem(4, 20)), /at least/)
  assert.match(String(tapestrySizeProblem(24, 4)), /at least/)
})

check('the declared size is the size the fabric settles to', () => {
  // A 14 x 12 tapestry: small enough to compile quickly, big enough to settle.
  const width = 14
  const height = 12
  const cells = Array.from({ length: width * height }, (_, i) => (i % 5 === 0 ? 'b' : 'a'))
  const grid: TapestryGrid = {
    width,
    height,
    cells,
    palette: [
      { key: 'a', name: 'Cream', hex: '#efe6d2', stitches: 0 },
      { key: 'b', name: 'Rust', hex: '#9c4a1e', stitches: 0 },
    ],
  }
  const program = buildTapestryProgram(grid, { name: 'size-proof' })
  const first = compileRelaxAudit(program)
  assert.deepEqual(first.problems, [], first.problems.join(' | '))

  const settled = settledSizeMm(first.built)
  const declared = declareSettledSize(program, settled)
  assert.ok(declared.finishedSizeMm)
  assert.equal(declared.finishedSizeMm!.width, Math.round(settled.width))
  assert.equal(declared.finishedSizeMm!.height, Math.round(settled.height))
  assert.match(declared.gaugeText ?? '', /dc x \d+ rows = 10 cm/)

  // The whole point: compiling again WITH the declaration must pass the size
  // consistency gate rather than trip it.
  const audited = compileRelaxAudit(declared)
  assert.deepEqual(audited.problems, [], audited.problems.join(' | '))
  console.log(
    `      ${width} x ${height} settles to ${finishedSizeText(settled)} (${declared.gaugeText})`,
  )
})

check('yarn shades are named once each', () => {
  const names = nameYarnColours(['#efe6d2', '#eee5d1', '#9c4a1e'])
  assert.equal(new Set(names).size, 3)
  assert.equal(names[2], 'Rust')
})

const failed = results.filter((r) => r.error)
if (failed.length) {
  console.error(`\n${failed.length} failed:\n${failed.map((f) => `  - ${f.name}: ${f.error}`).join('\n')}`)
  process.exit(1)
}
console.log(`\nAll ${results.length} tapestry checks passed.`)
