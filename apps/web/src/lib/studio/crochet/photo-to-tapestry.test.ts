/**
 * The photo/illustration → tapestry converter, checked against synthetic
 * images so the frame-filling rule and the yarn-shade cap are pinned without
 * spending on Fal.
 *
 *   cd apps/web && npx tsx --conditions=react-server \
 *     src/lib/studio/crochet/photo-to-tapestry.test.ts
 */

import assert from 'node:assert/strict'
import sharp from 'sharp'
import {
  cropToSubject,
  photoToTapestryGrid,
  TapestrySubjectTooSmallError,
} from './photo-to-tapestry'
import { YARN_SHADES } from './yarn-shades'

const results: Array<{ name: string; error?: string }> = []
function check(name: string, fn: () => Promise<void> | void): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      results.push({ name })
      console.log(`  ok  ${name}`)
    })
    .catch((err: unknown) => {
      results.push({ name, error: err instanceof Error ? err.message : String(err) })
      console.log(`FAIL  ${name}`)
    })
}

/** A `size` x `size` white PNG with a solid `subjectFraction`-wide square of
 *  `rgb` centred in it — a small subject on a wide plain border, exactly the
 *  shape the first cottage showpiece was killed for. */
async function smallSubjectOnPlainGround(
  size: number,
  subjectFraction: number,
  rgb: [number, number, number],
): Promise<Buffer> {
  const buf = Buffer.alloc(size * size * 3, 255)
  const sub = Math.round(size * subjectFraction)
  const off = Math.round((size - sub) / 2)
  for (let y = off; y < off + sub; y++) {
    for (let x = off; x < off + sub; x++) {
      const i = (y * size + x) * 3
      buf[i] = rgb[0]
      buf[i + 1] = rgb[1]
      buf[i + 2] = rgb[2]
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

/** A `size` x `size` PNG filled edge to edge with `rgb` — no border at all. */
async function edgeToEdge(size: number, rgb: [number, number, number]): Promise<Buffer> {
  const buf = Buffer.alloc(size * size * 3)
  for (let i = 0; i < buf.length; i += 3) {
    buf[i] = rgb[0]
    buf[i + 1] = rgb[1]
    buf[i + 2] = rgb[2]
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

async function main(): Promise<void> {
  await check('cropToSubject reports low coverage for a small centred subject', async () => {
    const img = await smallSubjectOnPlainGround(200, 0.3, [200, 40, 40])
    const { coverage } = await cropToSubject(img)
    // A 0.3 x 0.3 square of a 200 x 200 frame is 9% of the area.
    assert.ok(coverage < 0.15, `coverage was ${coverage}`)
  })

  await check('cropToSubject reports full coverage for an edge-to-edge picture', async () => {
    const img = await edgeToEdge(200, [80, 140, 90])
    const { coverage } = await cropToSubject(img)
    assert.ok(coverage > 0.95, `coverage was ${coverage}`)
  })

  await check('photoToTapestryGrid rejects a small subject when a minimum is set', async () => {
    const img = await smallSubjectOnPlainGround(200, 0.3, [200, 40, 40])
    await assert.rejects(
      () =>
        photoToTapestryGrid(img, {
          width: 20,
          height: 20,
          colours: 4,
          backgroundRemoval: false,
          smoothing: 'low',
          cropToSubject: true,
          minSubjectCoverage: 0.7,
        }),
      (err: unknown) => {
        assert.ok(err instanceof TapestrySubjectTooSmallError)
        assert.ok(err.coverage < 0.7)
        return true
      },
    )
  })

  await check('photoToTapestryGrid passes an edge-to-edge picture at the same threshold', async () => {
    const img = await edgeToEdge(200, [80, 140, 90])
    const grid = await photoToTapestryGrid(img, {
      width: 20,
      height: 20,
      colours: 4,
      backgroundRemoval: false,
      smoothing: 'low',
      cropToSubject: true,
      minSubjectCoverage: 0.7,
    })
    assert.equal(grid.width, 20)
    assert.equal(grid.height, 20)
    assert.equal(grid.cells.length, 400)
  })

  await check('cropToSubject is a no-op unless a caller asks for it', async () => {
    // A customer's own Studio photo keeps its old behaviour: no crop setting
    // means no trim and no rejection, whatever the frame looks like.
    const img = await smallSubjectOnPlainGround(200, 0.1, [200, 40, 40])
    const grid = await photoToTapestryGrid(img, {
      width: 10,
      height: 10,
      colours: 3,
      backgroundRemoval: false,
      smoothing: 'low',
    })
    assert.equal(grid.cells.length, 100)
  })

  await check('every stitch in the finished grid is an actual yarn shade hex', async () => {
    const img = await smallSubjectOnPlainGround(200, 0.8, [155, 74, 46]) // near "Rust"
    const grid = await photoToTapestryGrid(img, {
      width: 16,
      height: 16,
      colours: 3,
      backgroundRemoval: false,
      smoothing: 'low',
    })
    const yarnHexes = new Set(YARN_SHADES.map((s) => s.hex.toLowerCase()))
    for (const c of grid.palette) {
      assert.ok(yarnHexes.has(c.hex.toLowerCase()), `${c.name} carries ${c.hex}, not a yarn-shade hex`)
    }
  })

  const failed = results.filter((r) => r.error)
  if (failed.length) {
    console.error(`\n${failed.length} failed:\n${failed.map((f) => `  - ${f.name}: ${f.error}`).join('\n')}`)
    process.exit(1)
  }
  console.log(`\nAll ${results.length} photo-to-tapestry checks passed.`)
}

void main()
