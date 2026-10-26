/**
 * THE FOLDED ROW PIECES, tested (fold-ear rows pass, 2026-10-26): every row
 * shape the folded piece offers (oval, pointed, petal; the lop is the bunny's
 * own, in foldedPiece.test.ts) at a small, middle and large size and at gauge
 * 1 and 1.3, built, folded, pinched at its base corners and AUDITED exactly as
 * the composition builds it: the flat piece and the folded piece both pass
 * the full interlock audit (the folded one in the fabric's own local frame),
 * no yarn stretched past the gate, no yarn through yarn, the two corners
 * sewn within a sewing stitch, and the shape inside its declared ranges. One
 * unpinched piece per shape, cupped only, the same way.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/foldedPieceRows.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FOLDED_RANGES, buildFolded, gFolded, type FoldedPieceOptions } from './foldedPiece'
import { gaugeYarnRadiusMm } from './gauge'

const SIZES = { S: 10, M: 14, L: 18 } as const

function assertClean(o: FoldedPieceOptions, yr: number, label: string): void {
  const f = buildFolded(o, yr)
  assert.deepEqual(f.problems, [], `${label}: ${f.problems.join(' | ')}`)
  const m = f.metrics
  const R = FOLDED_RANGES[o.shape]
  const wf = m.widthMm / m.flatWidthMm
  assert.ok(wf >= R.width[0] && wf <= R.width[1], `${label} width ${wf.toFixed(2)}`)
  if (o.pinch > 0) {
    assert.ok(m.sewGapMm <= 5 * yr, `${label}: sewn ${(m.sewGapMm / yr).toFixed(1)} yr apart`)
    assert.ok(m.foldDepthMm >= 0.3 * m.widthMm, `${label}: fold depth ${m.foldDepthMm.toFixed(1)} of ${m.widthMm.toFixed(1)}`)
  }
}

for (const shape of ['oval', 'pointed', 'petal'] as const) {
  for (const g of [1, 1.3]) {
    for (const [size, width] of Object.entries(SIZES)) {
      test(`${shape} ${size} at gauge ${g}: folds, pinches and audits clean`, () => {
        const o = gFolded({ shape, width, pinch: 1, cup: 0.3, curl: 0.3 }, g)
        assertClean(o, gaugeYarnRadiusMm('fine', g), `${shape} ${size} @${g}`)
      })
    }
  }
  test(`${shape} M unpinched: cups and audits clean`, () => {
    assertClean({ shape, width: SIZES.M, pinch: 0, cup: 0.3, curl: 0.3 }, gaugeYarnRadiusMm('fine', 1), `${shape} unpinched`)
  })
}
