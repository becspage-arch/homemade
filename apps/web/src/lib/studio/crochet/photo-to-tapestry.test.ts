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
  motifGridSide,
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

/** A white `size` square with one solid rectangle drawn on it. */
async function rectOnWhite(
  size: number,
  rect: { x: number; y: number; w: number; h: number },
  rgb: [number, number, number],
): Promise<Buffer> {
  const buf = Buffer.alloc(size * size * 3, 255)
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const i = (y * size + x) * 3
      buf[i] = rgb[0]
      buf[i + 1] = rgb[1]
      buf[i + 2] = rgb[2]
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

/** One bold disc on a plain ground — the simplest possible motif. */
async function boldDisc(size: number): Promise<Buffer> {
  const buf = Buffer.alloc(size * size * 3, 240)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x - size / 2) ** 2 + (y - size / 2) ** 2 < (size * 0.4) ** 2) {
        const i = (y * size + x) * 3
        buf[i] = 200
        buf[i + 1] = 40
        buf[i + 2] = 40
      }
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

/** Fine many-colour detail edge to edge: small tiles in four colours. */
async function fineDetail(size: number, tile: number): Promise<Buffer> {
  const cols: [number, number, number][] = [
    [200, 40, 40],
    [40, 120, 200],
    [240, 200, 60],
    [30, 30, 30],
  ]
  const buf = Buffer.alloc(size * size * 3)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = cols[(Math.floor(x / tile) * 3 + Math.floor(y / tile) * 5) % 4]!
      const i = (y * size + x) * 3
      buf[i] = c[0]
      buf[i + 1] = c[1]
      buf[i + 2] = c[2]
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
}

async function main(): Promise<void> {
  await check('a framed crop grows an off-centre subject to the grid aspect with an even margin', async () => {
    // A 40 x 80 tall subject sitting in the top-right of a 200 square.
    const img = await rectOnWhite(200, { x: 140, y: 10, w: 40, h: 80 }, [200, 40, 40])
    const { buffer, coverage } = await cropToSubject(img, { aspect: 1, margin: 0.1 })
    const meta = await sharp(buffer).metadata()
    assert.ok(Math.abs(coverage - (40 * 80) / (200 * 200)) < 0.01, `coverage ${coverage}`)
    // 80 + 2 x 8 margin = 96 square, cut from the original.
    assert.equal(meta.width, meta.height)
    assert.ok(Math.abs((meta.width ?? 0) - 96) <= 1, `framed side ${meta.width}`)
    // The subject is inside the frame, not cropped by it: red fills its share.
    const { data } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    let red = 0
    for (let i = 0; i < data.length; i += 3) if (data[i]! > 150 && data[i + 1]! < 100) red++
    assert.ok(Math.abs(red - 40 * 80) < 200, `red pixels ${red}`)
  })

  await check('a framed crop of a tall motif keeps the whole motif in a square grid', async () => {
    // The old cover fit cut the top and bottom off a tall subject; the frame must not.
    const img = await rectOnWhite(200, { x: 80, y: 20, w: 40, h: 160 }, [200, 40, 40])
    const grid = await photoToTapestryGrid(img, {
      width: 20,
      height: 20,
      colours: 2,
      backgroundRemoval: false,
      smoothing: 'low',
      cropToSubject: true,
      frameMargin: 0.05,
    })
    const top = grid.cells.slice(0, 20)
    const bottom = grid.cells.slice(380)
    const motif = grid.palette.find((c) => c.stitches < 200)!.key
    assert.ok(!top.includes(motif) && !bottom.includes(motif), 'the motif was cropped at the top or bottom')
    assert.ok(grid.cells.slice(40, 60).includes(motif) && grid.cells.slice(340, 360).includes(motif))
  })

  await check('motifGridSide gives a bold single motif the smallest grid', async () => {
    const { side } = await motifGridSide(await boldDisc(512), { minSide: 24, maxSide: 60, colours: 8 })
    assert.equal(side, 24)
  })

  await check('motifGridSide gives a finely detailed picture more stitches than a simple one', async () => {
    const simple = await motifGridSide(await boldDisc(512), { minSide: 16, maxSide: 64, colours: 8 })
    const detailed = await motifGridSide(await fineDetail(512, 13), { minSide: 16, maxSide: 64, colours: 8 })
    assert.ok(detailed.side > simple.side, `simple ${simple.side}, detailed ${detailed.side}`)
  })

  await check('majority voting keeps flat art crisp: no in-between rim colour survives', async () => {
    // A red disc on green: a straight resize rings it with brown midtones.
    const size = 480
    const buf = Buffer.alloc(size * size * 3)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 3
        const inDisc = (x - 240) ** 2 + (y - 240) ** 2 < 170 ** 2
        buf[i] = inDisc ? 200 : 60
        buf[i + 1] = inDisc ? 40 : 150
        buf[i + 2] = inDisc ? 40 : 70
      }
    }
    const img = await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer()
    const grid = await photoToTapestryGrid(img, {
      width: 24,
      height: 24,
      colours: 8,
      maxColours: 8,
      backgroundRemoval: false,
      smoothing: 'high',
      majority: 6,
      quantiseColours: 16,
      minColourShare: 0.03,
      minColours: 2,
    })
    assert.equal(grid.palette.length, 2, grid.palette.map((c) => c.name).join(', '))
  })

  await check('minor colours fold into their neighbours, never below the floor', async () => {
    // A big red block, a sliver of near-red, a plain ground: three colours,
    // one of them on well under 1.5% of the stitches.
    const buf = Buffer.alloc(100 * 100 * 3, 255)
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const i = (y * 100 + x) * 3
        if (x < 50) { buf[i] = 200; buf[i + 1] = 40; buf[i + 2] = 40 }
        if (x >= 50 && x < 51 && y < 50) { buf[i] = 40; buf[i + 1] = 40; buf[i + 2] = 200 }
      }
    }
    const img = await sharp(buf, { raw: { width: 100, height: 100, channels: 3 } }).png().toBuffer()
    const base = { width: 50, height: 50, colours: 3, backgroundRemoval: false, smoothing: 'low' as const }
    const merged = await photoToTapestryGrid(img, { ...base, minColourShare: 0.015, minColours: 2 })
    assert.equal(merged.palette.length, 2)
    const floored = await photoToTapestryGrid(img, { ...base, minColourShare: 0.015, minColours: 3 })
    assert.ok(floored.palette.length >= 2)
  })

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
