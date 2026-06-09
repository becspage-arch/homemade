/**
 * PNG rasteriser — wraps `sharp` to turn the composed SVG into a PNG
 * buffer. Kept thin: the renderer's hard work is in the layout +
 * composer; this hands the SVG to sharp.
 *
 * Server-side only. Client callers can use the SVG directly.
 */

import sharp from 'sharp'

export interface RasteriseOptions {
  width: number
  height: number
  compressionLevel?: number
}

export async function rasteriseSvg(
  svg: string,
  opts: RasteriseOptions,
): Promise<Buffer> {
  return sharp(Buffer.from(svg))
    .resize(opts.width, opts.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png({ compressionLevel: opts.compressionLevel ?? 9 })
    .toBuffer()
}
