/**
 * Illustration-guided surface-embroidery engine — the reusable PURE core.
 *
 * Given a raster illustration (RGB bytes) it returns the stitch data: a directional
 * long-and-short field where every short straight stitch samples its colour from the
 * picture (snapped to a real DMC floss) and runs along the local FORM (a structure-
 * tensor flow field). The loom (`renderHero`) renders that data into a photoreal hoop;
 * `buildPatternDocument` turns the SAME data into the template/keys/steps.
 *
 * Pure + dependency-light (no fs / Flux / Blender / DB) so it powers BOTH our bulk
 * generation AND the customer "upload a photo/idea -> your own pattern" feature. The
 * caller supplies the bitmap (Flux for us; an uploaded photo for the customer).
 *
 * See `NEEDLEWORK_ENGINE.md` for the full process. Modes + framing are documented there.
 */

import { nearestDmcFull } from '../floss/dmc-full'
import type { StitchedElement } from '../loom/render/renderPattern'

export type Pt = [number, number]

export interface IllustrationEngineOpts {
  /** dense = fill a cut-out subject; line = delicate motifs + edge outline on bare
   *  linen; (bleed is a separate flag for full scenes). Default 'dense'. */
  mode?: 'dense' | 'line'
  /** round -> hoop; square/rect -> the design's aspect; none -> frameless. Default 'round'. */
  frame?: 'round' | 'square' | 'rect' | 'none'
  /** Stitch the WHOLE image (full scene, no background cut-out). */
  bleed?: boolean
  /** Denser stitching — REQUIRED for faces + detailed scenes. */
  detail?: boolean
  /** Finished width in mm (height follows the framed aspect). Default 180. */
  widthMm?: number
}

export interface IllustrationPattern {
  stitchedElements: StitchedElement[]
  /** HOOP (round) | SLATE_FRAME (square/rect) | NONE (frameless). */
  frameType: string
  finishedSizeMm: { width: number; height: number }
}

const dmcMemo = new Map<number, string>()
function snap(r: number, g: number, b: number): string {
  const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2)
  let v = dmcMemo.get(key)
  if (!v) {
    v = nearestDmcFull(`#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`).hex
    dmcMemo.set(key, v)
  }
  return v
}

function boxBlur(src: Float64Array, W: number, H: number, rad: number): Float64Array {
  const tmp = new Float64Array(W * H)
  const out = new Float64Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0
    for (let d = -rad; d <= rad; d++) { const xx = x + d; if (xx >= 0 && xx < W) { s += src[y * W + xx]!; n++ } }
    tmp[y * W + x] = s / n
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0
    for (let d = -rad; d <= rad; d++) { const yy = y + d; if (yy >= 0 && yy < H) { s += tmp[yy * W + x]!; n++ } }
    out[y * W + x] = s / n
  }
  return out
}

/**
 * Turn a WxH RGB bitmap (3 bytes/px, no alpha) into surface-embroidery stitch data.
 */
export function bitmapToStitches(
  data: Uint8Array | Buffer,
  W: number,
  H: number,
  opts: IllustrationEngineOpts = {},
): IllustrationPattern {
  const mode = opts.mode ?? 'dense'
  const frame = opts.frame ?? 'round'
  const at = (x: number, y: number): [number, number, number] => { const k = (y * W + x) * 3; return [data[k]!, data[k + 1]!, data[k + 2]!] }

  // 1. background mask: flood-fill the plain ground from the edges, matching the
  // actual corner colour within tolerance (interior whites are safe — not edge-connected).
  const bg = new Uint8Array(W * H)
  const corners = [at(2, 2), at(W - 3, 2), at(2, H - 3), at(W - 3, H - 3)]
  const bgR = corners.reduce((s, c) => s + c[0], 0) / 4
  const bgG = corners.reduce((s, c) => s + c[1], 0) / 4
  const bgB = corners.reduce((s, c) => s + c[2], 0) / 4
  const isBg = (x: number, y: number): boolean => { const [r, g, b] = at(x, y); const dr = r - bgR, dg = g - bgG, db = b - bgB; return dr * dr + dg * dg + db * db < 46 * 46 }
  const stack: number[] = []
  for (let x = 0; x < W; x++) stack.push(x, 0, x, H - 1)
  for (let y = 0; y < H; y++) stack.push(0, y, W - 1, y)
  while (stack.length) { const y = stack.pop()!, x = stack.pop()!; if (x < 0 || y < 0 || x >= W || y >= H || bg[y * W + x] || !isBg(x, y)) continue; bg[y * W + x] = 1; stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1) }
  const fg = (x: number, y: number): boolean => (opts.bleed ? true : !bg[y * W + x])

  // 2. structure-tensor flow: stitches run ALONG image structure (perpendicular to gradient).
  const gray = new Float64Array(W * H)
  for (let i = 0; i < W * H; i++) gray[i] = 0.299 * data[i * 3]! + 0.587 * data[i * 3 + 1]! + 0.114 * data[i * 3 + 2]!
  const gx = new Float64Array(W * H), gy = new Float64Array(W * H)
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    gx[y * W + x] = gray[y * W + x + 1]! - gray[y * W + x - 1]!
    gy[y * W + x] = gray[(y + 1) * W + x]! - gray[(y - 1) * W + x]!
  }
  const Jxx = new Float64Array(W * H), Jxy = new Float64Array(W * H), Jyy = new Float64Array(W * H)
  for (let i = 0; i < W * H; i++) { Jxx[i] = gx[i]! * gx[i]!; Jxy[i] = gx[i]! * gy[i]!; Jyy[i] = gy[i]! * gy[i]! }
  const Sxx = boxBlur(Jxx, W, H, 5), Sxy = boxBlur(Jxy, W, H, 5), Syy = boxBlur(Jyy, W, H, 5)
  const flowAngle = (x: number, y: number): number => { const i = y * W + x; return 0.5 * Math.atan2(2 * Sxy[i]!, Sxx[i]! - Syy[i]!) + Math.PI / 2 }
  const gmag = (jx: number, jy: number): number => Math.hypot(gx[jy * W + jx]!, gy[jy * W + jx]!)

  // 3. subject bbox -> framed canvas with a linen margin (round/square squared; rect hugs aspect).
  let mnx = W, mny = H, mxx = 0, mxy = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fg(x, y)) { if (x < mnx) mnx = x; if (y < mny) mny = y; if (x > mxx) mxx = x; if (y > mxy) mxy = y }
  const cxb = (mnx + mxx) / 2, cyb = (mny + mxy) / 2
  const bw = mxx - mnx, bh = mxy - mny
  let canvasW: number, canvasH: number, frameType: string
  if (frame === 'rect') { canvasW = bw * 1.55; canvasH = bh * 1.55; frameType = 'SLATE_FRAME' }
  else { const s = Math.max(bw, bh) * 1.62; canvasW = s; canvasH = s; frameType = frame === 'square' ? 'SLATE_FRAME' : 'HOOP' }
  if (frame === 'none') frameType = 'NONE'
  const x0 = cxb - canvasW / 2, y0 = cyb - canvasH / 2
  const Wmm = opts.widthMm ?? 180
  const scale = Wmm / canvasW
  const finishedH = canvasH * scale
  const tx = (x: number, y: number): Pt => [(x - x0) * scale, (y - y0) * scale]

  // 4. stitch field. dense = fill every area; line = saturated motifs + edge outline, bare linen.
  const els: StitchedElement[] = []
  const spacing = opts.detail ? 2.7 : mode === 'line' ? 3.0 : 3.4
  const lenLong = 12, lenShort = 7
  let hsh = 2166136261
  const rnd = (): number => { hsh = (hsh * 16777619) >>> 0; return hsh / 4294967296 }
  for (let y = Math.max(0, mny); y < Math.min(H, mxy); y += spacing) for (let x = Math.max(0, mnx); x < Math.min(W, mxx); x += spacing) {
    const jx = Math.round(x + (rnd() - 0.5) * spacing), jy = Math.round(y + (rnd() - 0.5) * spacing)
    if (jx < 1 || jy < 1 || jx >= W - 1 || jy >= H - 1 || !fg(jx, jy)) continue
    const [r, g, b] = at(jx, jy)
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
    const sat = mx ? (mx - mn) / mx : 0
    const a = flowAngle(jx, jy) + (rnd() - 0.5) * 0.25
    if (mode === 'line') {
      if (sat > 0.34) {
        const L = lenShort * (0.85 + 0.3 * rnd()); const hx = Math.cos(a) * L / 2, hy = Math.sin(a) * L / 2
        els.push({ stitchType: 'embroidery-straight', colourHex: snap(r, g, b), thread: { type: 'stranded-cotton', weight: '3-strand' }, directionDeg: null, geometry: { kind: 'path', points: [tx(jx - hx, jy - hy), tx(jx + hx, jy + hy)] } })
      } else if (gmag(jx, jy) > 15) {
        const L = 9 * (0.85 + 0.3 * rnd()); const hx = Math.cos(a) * L / 2, hy = Math.sin(a) * L / 2
        els.push({ stitchType: 'embroidery-back', colourHex: snap(r * 0.62 | 0, g * 0.62 | 0, b * 0.62 | 0), thread: { type: 'stranded-cotton', weight: '2-strand' }, directionDeg: null, geometry: { kind: 'path', points: [tx(jx - hx, jy - hy), tx(jx + hx, jy + hy)] } })
      }
    } else {
      const L = ((Math.floor(x / spacing) + Math.floor(y / spacing)) % 2 === 0 ? lenLong : lenShort) * (0.85 + 0.3 * rnd())
      const hx = Math.cos(a) * L / 2, hy = Math.sin(a) * L / 2
      els.push({ stitchType: 'embroidery-straight', colourHex: snap(r, g, b), thread: { type: 'stranded-cotton', weight: '3-strand' }, directionDeg: null, geometry: { kind: 'path', points: [tx(jx - hx, jy - hy), tx(jx + hx, jy + hy)] } })
    }
  }

  return { stitchedElements: els, frameType, finishedSizeMm: { width: Wmm, height: finishedH } }
}
