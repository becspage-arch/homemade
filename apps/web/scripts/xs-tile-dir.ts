/** Tile all images in a directory into one labelled sheet. tsx scripts/xs-tile-dir.ts <dir> <out.png> [cols] */
import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

async function main(): Promise<void> {
  const [dir, out, colsArg] = process.argv.slice(2)
  const COLS = colsArg ? parseInt(colsArg) : 4
  const CW = 320, CH = 320
  const files = readdirSync(dir!).filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  const rows = Math.ceil(files.length / COLS)
  const comps: sharp.OverlayOptions[] = []
  const labels: string[] = []
  for (let i = 0; i < files.length; i++) {
    const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH
    const img = await sharp(join(dir!, files[i]!)).resize(CW - 8, CH - 32, { fit: 'contain', background: { r: 255, g: 255, b: 255 } }).png().toBuffer()
    const meta = await sharp(img).metadata()
    comps.push({ input: img, left: x + 4 + Math.round(((CW - 8) - (meta.width ?? CW - 8)) / 2), top: y + 4 })
    labels.push(`<rect x="${x}" y="${y + CH - 28}" width="${CW}" height="28" fill="#111"/><text x="${x + 6}" y="${y + CH - 9}" font-family="Arial" font-size="13" fill="#fff">${files[i]!.replace(/\.(jpg|jpeg|png)$/i, '')}</text>`)
  }
  const W = COLS * CW, H = rows * CH
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`
  const buf = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 255, g: 255, b: 255 } } }).composite([...comps, { input: Buffer.from(svg), left: 0, top: 0 }]).png().toBuffer()
  writeFileSync(out!, buf)
  console.log(`wrote ${out} (${files.length} tiles, ${W}x${H})`)
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
