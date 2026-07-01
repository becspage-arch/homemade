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

/** A clean traceable boundary of a MAJOR shape, in finished-mm coordinates
 *  (the SAME space as `stitchedElements`, so the two register and overlay). */
export interface OutlinePath {
  /** silhouette = the subject's outer edge; internal = a petal/leaf/region boundary. */
  kind: 'silhouette' | 'internal'
  points: Pt[]
}

export interface IllustrationPattern {
  stitchedElements: StitchedElement[]
  /** HOOP (round) | SLATE_FRAME (square/rect) | NONE (frameless). */
  frameType: string
  finishedSizeMm: { width: number; height: number }
  /** Clean, simplified line-art of the major shapes (silhouette + key internal
   *  boundaries) — the transfer template, registered to the stitch field. */
  outline: OutlinePath[]
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

/** Moore-neighbour boundary trace of a binary mask, starting at (sx,sy) — the
 *  same machinery the clean-line-art tracer uses, but predicate-driven so it
 *  works on a foreground mask OR a single connected colour region. */
function mooreTrace(inMask: (x: number, y: number) => boolean, sx: number, sy: number): Pt[] {
  const nb: Pt[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
  const ring: Pt[] = []
  let cx = sx, cy = sy, dir = 6, guard = 0
  do {
    ring.push([cx, cy])
    let found = false
    for (let k = 0; k < 8; k++) {
      const d = (dir + k) % 8
      const nx = cx + nb[d]![0], ny = cy + nb[d]![1]
      if (inMask(nx, ny)) { cx = nx; cy = ny; dir = (d + 5) % 8; found = true; break }
    }
    if (!found) break
    if (++guard > 4_000_000) break
  } while (!(cx === sx && cy === sy) || ring.length < 2)
  return ring
}

/** Laplacian smoothing of a CLOSED ring — rounds the pixel staircase and the
 *  brushwork wiggle of a region boundary into a flowing, traceable line. */
function smoothClosed(points: Pt[], iterations: number, strength: number): Pt[] {
  if (points.length < 4) return points
  let pts = points
  const n = pts.length
  for (let it = 0; it < iterations; it++) {
    const out: Pt[] = new Array(n)
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n]!, b = pts[i]!, c = pts[(i + 1) % n]!
      out[i] = [
        b[0] + strength * ((a[0] + c[0]) / 2 - b[0]),
        b[1] + strength * ((a[1] + c[1]) / 2 - b[1]),
      ]
    }
    pts = out
  }
  return pts
}

/** Chaikin corner-cutting on a CLOSED polygon — turns a coarse simplified outline
 *  into smooth, flowing curves (the look of a hand-drawn transfer template). */
function chaikinClosed(points: Pt[], iterations: number): Pt[] {
  let pts = points
  for (let it = 0; it < iterations; it++) {
    if (pts.length < 3) break
    const out: Pt[] = []
    const n = pts.length
    for (let i = 0; i < n; i++) {
      const a = pts[i]!, b = pts[(i + 1) % n]!
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25])
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75])
    }
    pts = out
  }
  return pts
}

/** Ramer–Douglas–Peucker simplification of a closed ring → a clean polygon. */
function rdpRing(points: Pt[], eps: number): Pt[] {
  if (points.length < 3) return points
  const keep = new Uint8Array(points.length)
  keep[0] = 1; keep[points.length - 1] = 1
  const stack: Array<[number, number]> = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()!
    let dmax = 0, idx = -1
    const [ax, ay] = points[a]!, [bx, by] = points[b]!
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i]!
      const dist = Math.abs((px - ax) * dy - (py - ay) * dx) / len
      if (dist > dmax) { dmax = dist; idx = i }
    }
    if (dmax > eps && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]) }
  }
  const out: Pt[] = []
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]!)
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

  // 1. background mask. The plain ground is every ground-coloured region that is
  // EITHER connected to the image edge (the outer ground) OR a large enclosed
  // pocket walled off by the subject — a wreath's centre, or a field the subject
  // seals off by touching the frame. Small enclosed ground-coloured blobs (an eye
  // glint, a tiny white flower) stay as subject. This replaces an edge-only
  // flood-fill, which left interior/sealed ground stitched as a solid block.
  const bg = new Uint8Array(W * H)
  // Robust ground colour = MEDIAN of the border pixels. The median resists the
  // subject touching an edge or corner (which broke fixed 4-corner sampling — a
  // leaf in the corner made the "ground" green and the real white field opaque).
  const brR: number[] = [], brG: number[] = [], brB: number[] = []
  const pushBorder = (x: number, y: number): void => { const [r, g, b] = at(x, y); brR.push(r); brG.push(g); brB.push(b) }
  for (let x = 0; x < W; x++) { pushBorder(x, 0); pushBorder(x, H - 1) }
  for (let y = 0; y < H; y++) { pushBorder(0, y); pushBorder(W - 1, y) }
  const median = (a: number[]): number => { a.sort((p, q) => p - q); return a[a.length >> 1]! }
  const bgR = median(brR), bgG = median(brG), bgB = median(brB)
  const isBg = (x: number, y: number): boolean => { const [r, g, b] = at(x, y); const dr = r - bgR, dg = g - bgG, db = b - bgB; return dr * dr + dg * dg + db * db < 46 * 46 }
  // Label 4-connected ground-coloured components; a component is background if it
  // touches the edge or is large (>= ~2% of the image = a real hole, not a glint).
  const seen = new Uint8Array(W * H)
  const MIN_ENCLOSED = Math.round(0.01 * W * H)
  const comp: number[] = []
  for (let sy = 0; sy < H; sy++) for (let sx = 0; sx < W; sx++) {
    if (seen[sy * W + sx] || !isBg(sx, sy)) continue
    comp.length = 0
    let touchesEdge = false
    const q: number[] = [sx, sy]; seen[sy * W + sx] = 1
    while (q.length) {
      const y = q.pop()!, x = q.pop()!, i = y * W + x
      comp.push(i)
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touchesEdge = true
      if (x > 0 && !seen[i - 1] && isBg(x - 1, y)) { seen[i - 1] = 1; q.push(x - 1, y) }
      if (x < W - 1 && !seen[i + 1] && isBg(x + 1, y)) { seen[i + 1] = 1; q.push(x + 1, y) }
      if (y > 0 && !seen[i - W] && isBg(x, y - 1)) { seen[i - W] = 1; q.push(x, y - 1) }
      if (y < H - 1 && !seen[i + W] && isBg(x, y + 1)) { seen[i + W] = 1; q.push(x, y + 1) }
    }
    if (touchesEdge || comp.length >= MIN_ENCLOSED) for (const i of comp) bg[i] = 1
  }
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

  // 5. CLEAN OUTLINE — a traceable line-art of the MAJOR shapes, in the SAME
  // finished-mm space as the stitches (so the transfer template registers exactly
  // over the dense colour/stitch map). Derived from the illustration's regions,
  // NOT from the thousands of stitches: smooth the picture, posterise it into
  // coarse colour regions, keep only the large ones (real petals/leaves/masses),
  // and trace each one's boundary + the subject silhouette into simplified polygons.
  const outline = deriveOutline(data, W, H, fg, tx, { bleed: opts.bleed === true, mnx, mny, mxx, mxy })

  return { stitchedElements: els, frameType, finishedSizeMm: { width: Wmm, height: finishedH }, outline }
}

/** Derive the clean major-shape outline (silhouette + internal region boundaries). */
function deriveOutline(
  data: Uint8Array | Buffer,
  W: number,
  H: number,
  fg: (x: number, y: number) => boolean,
  tx: (x: number, y: number) => Pt,
  o: { bleed: boolean; mnx: number; mny: number; mxx: number; mxy: number },
): OutlinePath[] {
  const paths: OutlinePath[] = []
  const bw = o.mxx - o.mnx, bh = o.mxy - o.mny
  const span = Math.max(1, Math.max(bw, bh))
  // RDP tolerance scales with the subject so the cleanup is resolution-independent.
  // Chaikin (below) re-rounds the corners, so a moderate eps keeps the petal masses
  // while shedding brushwork noise.
  const epsPx = Math.max(1.8, span / 60)
  // ring → de-noise → simplify to major structure → round into flowing curves.
  const cleanRing = (ring: Pt[]): Pt[] => chaikinClosed(rdpRing(smoothClosed(ring, 3, 0.5), epsPx), 2)

  // Silhouette: the subject's outer edge (skip for full-bleed scenes — there the
  // edge is just the crop, not a shape). Trace the foreground mask.
  if (!o.bleed) {
    // topmost-leftmost foreground pixel = a guaranteed boundary start.
    let start: Pt | null = null
    for (let y = Math.max(0, o.mny); y <= Math.min(H - 1, o.mxy) && !start; y++)
      for (let x = Math.max(0, o.mnx); x <= Math.min(W - 1, o.mxx); x++)
        if (fg(x, y)) { start = [x, y]; break }
    if (start) {
      const ring = mooreTrace((x, y) => x >= 0 && y >= 0 && x < W && y < H && fg(x, y), start[0], start[1])
      const poly = cleanRing(ring)
      if (poly.length >= 3) paths.push({ kind: 'silhouette', points: poly.map((p) => tx(p[0], p[1])) })
    }
  }

  // Internal boundaries: posterise the smoothed picture, segment the foreground
  // into coarse colour regions, keep the large ones, trace each.
  const rCh = (i: number): number => data[i * 3]!
  const gCh = (i: number): number => data[i * 3 + 1]!
  const bCh = (i: number): number => data[i * 3 + 2]!
  const rB = new Float64Array(W * H), gB = new Float64Array(W * H), bB = new Float64Array(W * H)
  for (let i = 0; i < W * H; i++) { rB[i] = rCh(i); gB[i] = gCh(i); bB[i] = bCh(i) }
  const blurRad = Math.max(3, Math.round(Math.min(W, H) / 54))
  const rS = boxBlur(rB, W, H, blurRad), gS = boxBlur(gB, W, H, blurRad), bS = boxBlur(bB, W, H, blurRad)
  const STEP = 46 // coarse bins per channel → major colour masses, not brushwork
  const key = new Int32Array(W * H).fill(-1)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x
    if (!fg(x, y)) continue
    const qr = Math.round(rS[i]! / STEP), qg = Math.round(gS[i]! / STEP), qb = Math.round(bS[i]! / STEP)
    key[i] = (qr << 8) | (qg << 4) | qb
  }
  // connected components of equal posterised key (4-connected) over the foreground.
  const label = new Int32Array(W * H).fill(-1)
  const compStart: number[] = []
  const compArea: number[] = []
  const stack: number[] = []
  let next = 0
  for (let s = 0; s < W * H; s++) {
    if (key[s] === -1 || label[s] !== -1) continue
    const id = next++
    const k = key[s]!
    label[s] = id; compStart.push(s); let area = 0
    stack.length = 0; stack.push(s)
    while (stack.length) {
      const p = stack.pop()!; area++
      const x = p % W, y = (p - x) / W
      if (x > 0) { const q = p - 1; if (key[q] === k && label[q] === -1) { label[q] = id; stack.push(q) } }
      if (x < W - 1) { const q = p + 1; if (key[q] === k && label[q] === -1) { label[q] = id; stack.push(q) } }
      if (y > 0) { const q = p - W; if (key[q] === k && label[q] === -1) { label[q] = id; stack.push(q) } }
      if (y < H - 1) { const q = p + W; if (key[q] === k && label[q] === -1) { label[q] = id; stack.push(q) } }
    }
    compArea.push(area)
  }
  const minArea = Math.max(90, Math.round(span * span * 0.006)) // ≥~0.6% of the subject box
  for (let id = 0; id < next; id++) {
    if (compArea[id]! < minArea) continue
    const s = compStart[id]!
    const sx = s % W, sy = (s - sx) / W
    const ring = mooreTrace((x, y) => x >= 0 && y >= 0 && x < W && y < H && label[y * W + x] === id, sx, sy)
    const poly = cleanRing(ring)
    if (poly.length >= 3) paths.push({ kind: 'internal', points: poly.map((p) => tx(p[0], p[1])) })
  }
  return paths
}
