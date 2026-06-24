/**
 * Line-art → 1px skeleton, for tracing a printed pattern chart into stitch paths.
 *
 * A pattern's "technical chart" is the line template the stitcher transfers onto
 * cloth and works over. To render the REAL pattern (not an approximation) the
 * loom traces that drawing: threshold the ink to a mask, thin it to single-pixel
 * centrelines, then walk those into polylines (see vectorize.ts). Our own
 * patterns skip all this — the Studio holds exact coordinates already — but an
 * external licensed PDF gives us only the printed drawing, so we recover it.
 */

export interface Mask {
  w: number
  h: number
  data: Uint8Array // 1 = ink, 0 = ground
}

/**
 * Threshold an RGBA buffer to an ink mask. The DMC charts are dark blue ink on
 * white, so ink = dark AND not strongly red (kills any warm page tint).
 */
export function inkMask(rgba: Buffer | Uint8Array, w: number, h: number, opts: { lumaMax?: number } = {}): Mask {
  const lumaMax = opts.lumaMax ?? 0.55
  const data = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4]! / 255
    const g = rgba[i * 4 + 1]! / 255
    const b = rgba[i * 4 + 2]! / 255
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    // Dark ink, and bluish/neutral (the chart ink is blue; the border too).
    if (luma < lumaMax && b >= r - 0.05) data[i] = 1
  }
  return { w, h, data }
}

/** Zero out a border inset (drops the chart's rectangular frame line). */
export function clearBorder(mask: Mask, inset: number): void {
  const { w, h, data } = mask
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < inset || y < inset || x >= w - inset || y >= h - inset) data[y * w + x] = 0
    }
  }
}

/**
 * Zhang-Suen thinning to a 1px skeleton. Iterates two sub-passes until stable.
 */
export function thin(mask: Mask): Mask {
  const { w, h } = mask
  const data = Uint8Array.from(mask.data)
  const idx = (x: number, y: number) => y * w + x
  const nbrs = (x: number, y: number): number[] => [
    data[idx(x, y - 1)]!, // p2 N
    data[idx(x + 1, y - 1)]!, // p3 NE
    data[idx(x + 1, y)]!, // p4 E
    data[idx(x + 1, y + 1)]!, // p5 SE
    data[idx(x, y + 1)]!, // p6 S
    data[idx(x - 1, y + 1)]!, // p7 SW
    data[idx(x - 1, y)]!, // p8 W
    data[idx(x - 1, y - 1)]!, // p9 NW
  ]
  let changed = true
  while (changed) {
    changed = false
    for (let sub = 0; sub < 2; sub++) {
      const remove: number[] = []
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          if (data[idx(x, y)] !== 1) continue
          const p = nbrs(x, y)
          let B = 0
          for (const v of p) B += v
          if (B < 2 || B > 6) continue
          let A = 0
          for (let k = 0; k < 8; k++) if (p[k] === 0 && p[(k + 1) % 8] === 1) A++
          if (A !== 1) continue
          const [p2, p3, p4, p5, p6, p7, p8] = p as [number, number, number, number, number, number, number, number]
          void p3
          void p5
          void p7
          if (sub === 0) {
            if (p2 * p4 * p6 !== 0) continue
            if (p4 * p6 * p8 !== 0) continue
          } else {
            if (p2 * p4 * p8 !== 0) continue
            if (p2 * p6 * p8 !== 0) continue
          }
          remove.push(idx(x, y))
        }
      }
      if (remove.length) {
        changed = true
        for (const i of remove) data[i] = 0
      }
    }
  }
  return { w, h, data }
}
