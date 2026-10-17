/**
 * The yarn-shade matcher: close but distinct picture colours must come back as
 * yarns a maker can tell apart, in the right lightness order, and a green must
 * stay a green (the tapestry reopen proof sent hills to Slate, Petrol and Navy).
 *
 *   cd apps/web && pnpm exec tsx --test src/lib/studio/crochet/yarn-shades.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deltaE2000, hexToLab, matchYarnShades, nameYarnColours, YARN_SHADES } from './yarn-shades'

/** LCh hue angle in degrees, and chroma. */
function lch(hex: string): { L: number; C: number; h: number } {
  const [L, a, b] = hexToLab(hex)
  const h = (Math.atan2(b, a) * 180) / Math.PI
  return { L, C: Math.hypot(a, b), h: h < 0 ? h + 360 : h }
}

test('deltaE2000 matches the published Sharma test pair', () => {
  // Sharma, Wu & Dalal (2005), pair 1: 2.0425.
  assert.ok(Math.abs(deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485]) - 2.0425) < 1e-3)
  assert.equal(deltaE2000([50, 10, 10], [50, 10, 10]), 0)
})

test('every shade name and hex is unique', () => {
  assert.equal(new Set(YARN_SHADES.map((s) => s.name)).size, YARN_SHADES.length)
  assert.equal(new Set(YARN_SHADES.map((s) => s.hex.toLowerCase())).size, YARN_SHADES.length)
})

test('two close but distinct greens stay two distinct greens, lighter stays lighter', () => {
  // The reopen proof's two hills: a mid green in front of a lighter one.
  const pic = ['#a9d4ec', '#508c3c', '#6eaa50', '#f5c832']
  const out = matchYarnShades(pic, [22, 19, 9, 8])
  const [front, back] = [out[1]!, out[2]!]
  assert.notEqual(front.name, back.name)
  for (const s of [front, back]) {
    const { h, C } = lch(s.hex)
    assert.ok(h > 100 && h < 160 && C > 25, `${s.name} ${s.hex} is not a green (h ${h.toFixed(0)}, C ${C.toFixed(0)})`)
  }
  assert.ok(lch(back.hex).L > lch(front.hex).L + 4, `${back.name} should read lighter than ${front.name}`)
  assert.ok(
    deltaE2000(hexToLab(front.hex), hexToLab(back.hex)) >= 8,
    `${front.name} and ${back.name} read as one colour`,
  )
})

test('four green hills keep four greens in their lightness order (mid greens survive)', () => {
  const hills = ['#8cc068', '#5f9e45', '#3e7a3a', '#2a5530'] // light → dark
  const out = matchYarnShades(['#a9d4ec', ...hills, '#f5c832'])
  const greens = out.slice(1, 5)
  assert.equal(new Set(greens.map((s) => s.name)).size, 4)
  for (const s of greens) {
    const { h, C } = lch(s.hex)
    assert.ok(h > 100 && h < 165 && C > 22, `${s.name} ${s.hex} is not a green`)
  }
  for (let i = 1; i < greens.length; i++) {
    assert.ok(lch(greens[i - 1]!.hex).L > lch(greens[i]!.hex).L, `${greens[i - 1]!.name} vs ${greens[i]!.name}: order flipped`)
  }
})

test('blue-green hills never fall to a grey or a blue', () => {
  const out = nameYarnColours(['#faecd2', '#78aa78', '#508c64', '#326e5a', '#285046', '#e6783c'])
  for (const bad of ['Slate', 'Storm', 'Petrol', 'Navy', 'Ink', 'Charcoal', 'Silver', 'Denim', 'Cobalt']) {
    assert.ok(!out.includes(bad), `${out.join(', ')} uses ${bad}`)
  }
  assert.equal(new Set(out).size, out.length)
})

test('an exact shade still matches itself', () => {
  const out = nameYarnColours(['#9c4a1e', '#5e9a3c', '#efe6d2', '#c42b2b'])
  assert.deepEqual(out, ['Rust', 'Grass', 'Cream', 'Poppy'])
})
