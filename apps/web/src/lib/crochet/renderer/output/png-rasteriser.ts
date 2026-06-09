/**
 * PNG rasteriser — wraps `sharp` to turn an SVG string into a PNG buffer.
 *
 * Kept thin on purpose: the renderer's hard work is in the layout +
 * composer; this just hands the SVG to sharp for resampling. The renderer
 * does NOT depend on this module for the SVG output — server components
 * can call `composeSvg` directly and embed the SVG inline.
 */

import sharp from 'sharp'

export interface RasteriseOptions {
  /** Output PNG width in pixels. */
  width: number
  /** Output PNG height in pixels. */
  height: number
  /** PNG compression level (0..9). Defaults to 9 (smallest file). */
  compressionLevel?: number
}

export async function rasterise(svg: string, opts: RasteriseOptions): Promise<Buffer> {
  return sharp(Buffer.from(svg))
    .resize(opts.width, opts.height, { fit: 'cover' })
    .png({ compressionLevel: opts.compressionLevel ?? 9 })
    .toBuffer()
}
