/**
 * A charted colourwork piece (tapestry) never goes through an AI image step
 * after the deterministic render: the hero is the exact stitched chart.
 *
 *   cd apps/web && pnpm exec tsx --test scripts/loom-hero-policy.test.ts
 *
 * No Fal call is made: the tapestry case must return before the key is read,
 * and the plain case runs with FAL_KEY removed.
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isChartedColourwork, photorealFinishAllowed } from '../src/lib/loom/crochet/engine/heroPolicy'
import type { CrochetProgram } from '../src/lib/loom/crochet/engine/program'
import { photorealHero } from './loom-pattern'

const row = (cells?: string[]) => ({ stitches: ['sc', 'sc', 'sc'], ...(cells ? { cellColours: cells } : {}) })

const tapestry: CrochetProgram = {
  name: 'chart',
  form: 'grid',
  gridWidth: 3,
  palette: { a: '#5e9a3c', b: '#efe6d2' },
  grid: [row(['a', 'b', 'a']), row(['b', 'a', 'b'])],
} as unknown as CrochetProgram

const striped: CrochetProgram = {
  name: 'stripes',
  form: 'grid',
  gridWidth: 3,
  palette: { a: '#5e9a3c' },
  grid: [{ ...row(), colourKey: 'a' }, row()],
} as unknown as CrochetProgram

test('a per-stitch colour chart is charted colourwork; stripes and plain pieces are not', () => {
  assert.equal(isChartedColourwork(tapestry), true)
  assert.equal(isChartedColourwork(striped), false)
  assert.equal(isChartedColourwork(null), false)
  assert.equal(photorealFinishAllowed(tapestry), false)
  assert.equal(photorealFinishAllowed(striped), true)
})

test('photorealHero skips every AI step for a tapestry even with a Fal key present', async () => {
  const saved = process.env.FAL_KEY
  process.env.FAL_KEY = 'not-a-real-key'
  try {
    const out = await photorealHero('/nonexistent/base.png', true, 'sc', 'cotton', tapestry)
    assert.deepEqual(out, { heroPng: null, fidelityScore: null, skipped: 'charted-colourwork' })
  } finally {
    if (saved === undefined) delete process.env.FAL_KEY
    else process.env.FAL_KEY = saved
  }
})

test('a plain piece still reaches the normal finish path (no key here, so base only)', async () => {
  const saved = process.env.FAL_KEY
  delete process.env.FAL_KEY
  try {
    const out = await photorealHero('/nonexistent/base.png', true, 'sc', 'cotton', striped)
    assert.equal(out.skipped, undefined)
    assert.equal(out.heroPng, null)
  } finally {
    if (saved !== undefined) process.env.FAL_KEY = saved
  }
})
