/**
 * Hero stage VARIANTS (job stages): a pattern always gets the same set, a hand
 * pick wins, every variant id is reachable, and the ids match the Python
 * renderer's STAGE_VARIANTS table in the same order.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { HERO_STAGE_VARIANTS, pickHeroStageVariant } from './blenderScene'

test('a slug always picks the same variant', () => {
  const a = pickHeroStageVariant('nursery', 'sleepy-bunny-nightcap')
  for (let i = 0; i < 5; i++) assert.equal(pickHeroStageVariant('nursery', 'sleepy-bunny-nightcap'), a)
  assert.ok((HERO_STAGE_VARIANTS.nursery as readonly string[]).includes(a!))
})

test('studio has no variant; an explicit valid id wins; an invalid one is ignored', () => {
  assert.equal(pickHeroStageVariant('studio', 'x'), undefined)
  assert.equal(pickHeroStageVariant('christmas', 'x', 'snow'), 'snow')
  assert.equal(pickHeroStageVariant('christmas', 'x', 'nope'), pickHeroStageVariant('christmas', 'x'))
})

test('slugs spread over every variant of every stage', () => {
  for (const [stage, ids] of Object.entries(HERO_STAGE_VARIANTS)) {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) seen.add(pickHeroStageVariant(stage as 'linen', `pattern-${i}`)!)
    assert.deepEqual([...seen].sort(), [...ids].sort(), stage)
  }
})

test('the TS variant table matches the Python renderer', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const py = readFileSync(join(here, '../../../../scripts/loom_render_crochet.py'), 'utf8')
  for (const [stage, ids] of Object.entries(HERO_STAGE_VARIANTS)) {
    const m = py.match(new RegExp(`"${stage}": \\(([^)]*)\\)`))
    assert.ok(m, `STAGE_VARIANTS["${stage}"] missing in the Python`)
    const pyIds = [...m![1]!.matchAll(/"([^"]+)"/g)].map((x) => x[1])
    assert.deepEqual(pyIds, [...ids], stage)
  }
})
