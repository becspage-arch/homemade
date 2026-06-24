/**
 * Deterministic value noise — coherent, smooth, repeatable.
 *
 * Used to break mechanical perfection: low-frequency noise wobbles thread
 * paths and varies fibre shading so nothing is machine-uniform. Deterministic
 * so a pattern always renders identically.
 */

function hash3(xi: number, yi: number, zi: number): number {
  let h = (xi * 374761393 + yi * 668265263 + zi * 2147483647) | 0
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return (h >>> 0) / 4294967295
}

function fade(t: number): number {
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Value noise in [0,1) at a 3D point. */
export function valueNoise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = fade(x - xi)
  const yf = fade(y - yi)
  const zf = fade(z - zi)
  const c000 = hash3(xi, yi, zi)
  const c100 = hash3(xi + 1, yi, zi)
  const c010 = hash3(xi, yi + 1, zi)
  const c110 = hash3(xi + 1, yi + 1, zi)
  const c001 = hash3(xi, yi, zi + 1)
  const c101 = hash3(xi + 1, yi, zi + 1)
  const c011 = hash3(xi, yi + 1, zi + 1)
  const c111 = hash3(xi + 1, yi + 1, zi + 1)
  const x00 = lerp(c000, c100, xf)
  const x10 = lerp(c010, c110, xf)
  const x01 = lerp(c001, c101, xf)
  const x11 = lerp(c011, c111, xf)
  const y0 = lerp(x00, x10, yf)
  const y1 = lerp(x01, x11, yf)
  return lerp(y0, y1, zf)
}

/** Cheap deterministic hash -> [0,1). */
export function hash2(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}
