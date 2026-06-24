/**
 * Colour helpers for the Loom. Floss colours come in as plain hex (the same
 * shape the cross-stitch palette uses); the renderer works in 0..255 RGB.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export function parseHex(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m || !m[1]) return { r: 128, g: 128, b: 128 }
  const v = m[1]
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  }
}

/** Multiply an RGB toward black/white by a scalar (clamped). */
export function shade(c: Rgb, k: number): Rgb {
  return {
    r: Math.max(0, Math.min(255, c.r * k)),
    g: Math.max(0, Math.min(255, c.g * k)),
    b: Math.max(0, Math.min(255, c.b * k)),
  }
}
