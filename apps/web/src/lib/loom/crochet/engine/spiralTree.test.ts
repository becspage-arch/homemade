import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSpiralTree, solveInnerRadius, TREE_BLOCKS, TREE_DROOP_DEG, TREE_EDGE_ROWS } from './spiralTree'
import { buildHanging } from './spiralHanging'
import { YARN_WEIGHT_RADIUS_MM } from './program'

test('no increase, no corkscrew: an edge ratio of 1 has no helicoid', () => {
  assert.throws(() => solveInnerRadius(5, 1, 0.5))
  // the taller the stitch, the wider the coil (the cone)
  assert.ok(solveInnerRadius(10, 4, 1) + 10 > solveInnerRadius(4, 4, 1) + 4)
})

test('corkscrew tree: genuinely stitched, the counts hold the coil without a hold', () => {
  const yr = YARN_WEIGHT_RADIUS_MM.dk
  const t = buildSpiralTree({ yr, blocks: TREE_BLOCKS, droopDeg: TREE_DROOP_DEG, colour: '#2c5634', edgeRows: TREE_EDGE_ROWS })
  assert.deepEqual(t.problems, [])
  assert.ok(t.built.links.some((l) => l.role === 'cross'), 'the chain is a genuine chain')
  assert.ok(t.built.links.every((l) => !!l.frame3), 'every link measured in its own frame')
  // the cone: each block's outer radius above the one before
  for (let i = 1; i < t.measures.length; i++) assert.ok(t.measures[i]!.rOut > t.measures[i - 1]!.rOut)
  // each stitch settles at its own gauge width (within 15%; the top block sits
  // in a 4 mm core where the edge rows crowd it: 20% there)
  t.measures.forEach((m, i) => assert.ok(Math.abs(m.crownGapYr - 1) < (i === 0 ? 0.2 : 0.15), `${m.id} crown gap ${m.crownGapYr}`))
  for (const w of t.words) assert.ok(!/\b(sc|hdc)\b/.test(w), `US term in: ${w}`)
  assert.ok(t.words.some((w) => w.startsWith('Row 2: ch 1, turn.')), 'the edging row is written')
  assert.ok(t.built.links.some((l) => l.j === 2 && l.role === 'hook'), 'the edging row hooks the row-1 crowns')
  assert.ok(t.built.links.some((l) => l.j === 3 && l.role === 'hook'), 'the second edge row hooks row 2')
  assert.ok(t.words.some((w) => w.startsWith('Row 3: ch 1, turn.')), 'both edge rows are written')
  // with NO layout hold the outer edge stays within 5% of the solved radius
  const free = buildSpiralTree({ yr, blocks: TREE_BLOCKS, droopDeg: TREE_DROOP_DEG, colour: '#2c5634' }, { relaxK: 0 })
  for (const m of free.measures) assert.ok(Math.abs(m.rOut / m.rOutBuilt - 1) < 0.05, `${m.id} rOut drift`)
})

test('hanging: trees, stars, cords audit clean; beads and a branch', () => {
  const h = buildHanging()
  assert.deepEqual(h.problems, [])
  assert.equal(h.pieces.filter((p) => p.name.startsWith('tree')).length, 3)
  assert.equal(h.props.filter((p) => p.metal).length, 6)
  assert.equal(h.props.filter((p) => p.branch).length, 1)
  for (const w of h.words) assert.ok(!/\b(sc|hdc)\b/.test(w), `US term in: ${w}`)
})
