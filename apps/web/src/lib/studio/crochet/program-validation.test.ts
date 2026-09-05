/**
 * The gate that stands between a model-written program and a stored pattern.
 *
 * `validateAndAudit` is the whole of it: the shape has to parse, the shape
 * checks have to pass, and the stitches have to compile and clear the loom's
 * audit. Anything that fails comes back as plain sentences a maker can read.
 *
 *   cd apps/web && npx tsx src/lib/studio/crochet/program-validation.test.ts
 */

import assert from 'node:assert/strict'
import { validateAndAudit, crochetProgramProblems, compositionProgramProblems } from './program-validation'

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

const goodPiece = {
  kind: 'piece',
  program: {
    name: 'stripe panel',
    form: 'grid',
    gridWidth: 12,
    grid: Array.from({ length: 10 }, (_, j) => ({
      stitches: Array.from({ length: 12 }, () => 'sc'),
      cellColours: Array.from({ length: 12 }, (_, i) => ((i + j) % 4 === 0 ? 'b' : 'a')),
    })),
    yarnWeight: 'worsted',
    colourHex: '#9caf94',
    palette: { a: '#9caf94', b: '#efe6d2' },
    hookMm: 4,
  },
}

const goodBall = {
  kind: 'amigurumi',
  program: {
    name: 'a small ball',
    yarnWeight: 'worsted',
    parts: [
      {
        name: 'body',
        stitch: 'sc',
        rounds: [6, 12, 12, 12, 12, 12, 6],
        colourHex: '#b5814e',
        place: { on: 'ground' },
      },
    ],
  },
}

check('a well-formed grid piece is accepted', () => {
  const out = validateAndAudit(goodPiece)
  assert.deepEqual(out.problems, [], out.problems.join(' | '))
  assert.equal(out.built?.kind, 'piece')
})

check('a well-formed amigurumi is accepted', () => {
  const out = validateAndAudit(goodBall)
  assert.deepEqual(out.problems, [], out.problems.join(' | '))
  assert.equal(out.built?.kind, 'amigurumi')
})

check('something that is not a program at all is refused', () => {
  const out = validateAndAudit({ hello: 'there' })
  assert.equal(out.built, null)
  assert.match(out.problems[0]!, /not a stitch program/)
})

check('a stitch we do not build with is refused', () => {
  const out = validateAndAudit({
    kind: 'piece',
    program: { ...goodPiece.program, grid: [{ stitches: ['knit', 'knit'], cellColours: ['a', 'a'] }] },
  })
  assert.equal(out.built, null)
  assert.ok(out.problems.length > 0)
})

check('a ragged grid is refused before anything is compiled', () => {
  const out = validateAndAudit({
    kind: 'piece',
    program: {
      ...goodPiece.program,
      grid: [
        { stitches: Array.from({ length: 12 }, () => 'sc') },
        { stitches: Array.from({ length: 9 }, () => 'sc') },
      ],
    },
  })
  assert.equal(out.built, null)
  assert.match(out.problems.join(' '), /same number of stitches/)
})

check('a grid past the size cap is refused', () => {
  const problems = crochetProgramProblems({
    name: 'far too big',
    form: 'grid',
    gridWidth: 40,
    grid: Array.from({ length: 40 }, () => ({ stitches: Array.from({ length: 40 }, () => 'sc' as const) })),
  })
  assert.match(problems.join(' '), /1600 stitches/)
})

check('a piece joined to something that is not made yet is refused', () => {
  const problems = compositionProgramProblems({
    name: 'out of order',
    parts: [
      { name: 'head', stitch: 'sc', rounds: [6, 12, 6], colourHex: '#b5814e', place: { on: 'body', overlap: 4 } },
      { name: 'body', stitch: 'sc', rounds: [6, 12, 6], colourHex: '#b5814e', place: { on: 'ground' } },
    ],
  })
  assert.match(problems.join(' '), /not made yet/)
})

check('rounds that do not follow the ball shape fail the compile', () => {
  const out = validateAndAudit({
    kind: 'amigurumi',
    program: {
      name: 'nonsense',
      parts: [
        { name: 'body', stitch: 'sc', rounds: [7, 19, 5], colourHex: '#b5814e', place: { on: 'ground' } },
      ],
    },
  })
  assert.equal(out.built, null)
  assert.ok(out.problems.length > 0)
})

check('problems come back as sentences, not stack traces', () => {
  const out = validateAndAudit({
    kind: 'piece',
    program: { ...goodPiece.program, palette: { a: '#9caf94' } },
  })
  assert.equal(out.built, null)
  assert.match(out.problems.join(' '), /not in the yarn list/)
})

const failed = results.filter((r) => r.error)
if (failed.length) {
  console.error(`\n${failed.length} failed:\n${failed.map((f) => `  - ${f.name}: ${f.error}`).join('\n')}`)
  process.exit(1)
}
console.log(`\nAll ${results.length} validation checks passed.`)
