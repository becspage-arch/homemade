/**
 * THE FLOSS-TARGET PATH — the converter's capacity-aware snap to DMC.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx --conditions=react-server \
 *     src/lib/studio/photo-to-pattern.test.ts
 *
 * The heirloom tier's whole claim is a stand count, and the two bugs that stood
 * between the converter and that count were both invisible from the outside:
 * the quantiser's swatches were collapsing onto shared stands, and the ladder
 * that was meant to climb past it was re-quantising its own output because
 * `applyPaletteSync` writes back into the container it is handed. Both are
 * asserted here on a synthetic image, so neither can come back quietly.
 */
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { photoToPatternData } from './photo-to-pattern'
import { rankedDmcFull } from '@/lib/floss/dmc-full'

const results: { name: string; passed: boolean; detail?: string }[] = []
async function record(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

/** A wide-gamut synthetic photograph: hue across, lightness down, with a little
 *  noise so the quantiser has real clusters to find rather than flat bands. */
async function testImage(size = 160): Promise<Buffer> {
  const raw = Buffer.alloc(size * size * 3)
  let seed = 12345
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5) * 12
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const h = (x / size) * 6
      const l = 0.15 + (y / size) * 0.7
      const c = (1 - Math.abs(2 * l - 1)) * 0.85
      const xx = c * (1 - Math.abs((h % 2) - 1))
      const [r1, g1, b1] =
        h < 1 ? [c, xx, 0] : h < 2 ? [xx, c, 0] : h < 3 ? [0, c, xx] : h < 4 ? [0, xx, c] : h < 5 ? [xx, 0, c] : [c, 0, xx]
      const m = l - c / 2
      const i = (y * size + x) * 3
      raw[i] = Math.max(0, Math.min(255, Math.round((r1 + m) * 255 + rnd())))
      raw[i + 1] = Math.max(0, Math.min(255, Math.round((g1 + m) * 255 + rnd())))
      raw[i + 2] = Math.max(0, Math.min(255, Math.round((b1 + m) * 255 + rnd())))
    }
  }
  return sharp(raw, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

const BASE = {
  width: 140,
  height: 140,
  fabricCount: 14,
  brand: 'DMC' as const,
  confettiMin: 'high' as const,
  backgroundRemoval: false,
  flossRange: 'full' as const,
}

async function main(): Promise<void> {
  const img = await testImage()

  await record('rankedDmcFull returns distinct stands, nearest first', () => {
    const ranked = rankedDmcFull('#3a609d', 12)
    assert.equal(ranked.length, 12)
    assert.equal(new Set(ranked.map((r) => r.entry.code)).size, 12, 'a stand was listed twice')
    for (let i = 1; i < ranked.length; i++) {
      assert.ok(ranked[i]!.deltaE >= ranked[i - 1]!.deltaE, 'not sorted by distance')
    }
  })

  // The baseline. No `flossTarget` means the converter behaves exactly as it
  // always has — one quantise pass, plain nearest-stand snap.
  const plain = await photoToPatternData(img, { ...BASE, colours: 300, maxColours: 840 })

  await record('without a floss target the converter is unchanged', () => {
    assert.ok(plain.data.palette.length > 0)
    assert.ok(
      plain.data.palette.length < 300,
      `the collapse is real: 300 swatches asked, ${plain.data.palette.length} stands returned`,
    )
  })

  const aimed = await photoToPatternData(img, { ...BASE, colours: 300, maxColours: 840, flossTarget: 250 })

  await record('a floss target lifts the distinct-stand count well past the plain snap', () => {
    assert.ok(
      aimed.data.palette.length > plain.data.palette.length,
      `target 250 returned ${aimed.data.palette.length}, plain returned ${plain.data.palette.length}`,
    )
  })

  await record('the ladder is not re-quantising its own output', () => {
    // The symptom of the container-reuse bug was that every rung returned the
    // SAME count, which pinned the result to whatever the first rung gave. A
    // result at or past the target could not have happened with it in place.
    assert.ok(
      aimed.data.palette.length >= 200,
      `only ${aimed.data.palette.length} stands — the rungs above the first are not landing`,
    )
  })

  await record('the target is a target, not a floor to sail past', () => {
    assert.ok(aimed.data.palette.length <= 300, `${aimed.data.palette.length} stands overshot the band`)
  })

  await record('every stand still gets its own symbol and a real DMC code', () => {
    const symbols = new Set(aimed.data.palette.map((p) => p.symbol))
    assert.equal(symbols.size, aimed.data.palette.length, 'two stands share a symbol')
    const codes = new Set(aimed.data.palette.map((p) => p.code))
    assert.equal(codes.size, aimed.data.palette.length, 'a stand is in the key twice')
    for (const p of aimed.data.palette) assert.match(p.rgb, /^#[0-9a-f]{6}$/i)
  })

  await record('a target the picture cannot reach stops short rather than inventing stands', async () => {
    // Four flat blocks. There are four colours in it and no amount of quantiser
    // resolution can make a fifth, so the honest answer is a short chart.
    const flat = await sharp({
      create: { width: 120, height: 120, channels: 3, background: '#204080' },
    })
      .composite([
        { input: { create: { width: 60, height: 60, channels: 3, background: '#c03040' } }, left: 60, top: 0 },
        { input: { create: { width: 60, height: 60, channels: 3, background: '#30a060' } }, left: 0, top: 60 },
        { input: { create: { width: 60, height: 60, channels: 3, background: '#f0e0c0' } }, left: 60, top: 60 },
      ])
      .png()
      .toBuffer()
    const short = await photoToPatternData(flat, { ...BASE, colours: 300, maxColours: 840, flossTarget: 250 })
    // A handful over four: the downscale blends the block edges, so there are a
    // few genuine in-between colours along the seams. Nowhere near 250 is the
    // assertion — the converter stops where the picture stops.
    assert.ok(short.data.palette.length <= 40, `${short.data.palette.length} stands out of a four-colour picture`)
  })

  for (const r of results) {
    console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
    if (!r.passed && r.detail) console.log(`     ${r.detail}`)
  }
  const failed = results.filter((r) => !r.passed)
  console.log(`\n${results.length - failed.length}/${results.length} passed`)
  if (failed.length > 0) process.exit(1)
}

void main()
