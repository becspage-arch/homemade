/**
 * Side-by-side compare harness for the loom: designer hero (left) vs our render
 * (right), scaled to a common height on a neutral card. The honest check before
 * anything is shown — render, look, compare, audit.
 *
 *   npx tsx scripts/loom-compare.ts <leftImg> <rightImg> <outImg> [heightPx]
 */

import sharp from 'sharp'

async function main() {
  const [left, right, out, hArg] = process.argv.slice(2)
  if (!left || !right || !out) {
    throw new Error('usage: loom-compare.ts <left> <right> <out> [height]')
  }
  const Hh = Number(hArg ?? 760)
  const gap = 28
  const pad = 28

  const fit = async (p: string) => {
    const b = await sharp(p).resize({ height: Hh, fit: 'contain', background: { r: 245, g: 243, b: 239, alpha: 1 } }).toBuffer()
    const m = await sharp(b).metadata()
    return { buf: b, w: m.width!, h: m.height! }
  }
  const L = await fit(left)
  const R = await fit(right)
  const W = pad * 2 + L.w + gap + R.w
  const Htot = pad * 2 + Hh

  await sharp({ create: { width: W, height: Htot, channels: 4, background: { r: 245, g: 243, b: 239, alpha: 1 } } })
    .composite([
      { input: L.buf, left: pad, top: pad },
      { input: R.buf, left: pad + L.w + gap, top: pad },
    ])
    .png()
    .toFile(out)
  console.log(`compare -> ${out} (${W}x${Htot})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
