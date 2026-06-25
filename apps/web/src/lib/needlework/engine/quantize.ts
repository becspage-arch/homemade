/**
 * Deterministic colour quantisation for a flat-colour design bitmap.
 *
 * Median-cut into K boxes, then each box's average is the cluster colour. Every
 * pixel is labelled with its nearest cluster. We also detect the BACKGROUND
 * cluster (the cloth) by majority vote on the border, so the stitched-region
 * pass can ignore it — embroidery is worked ON the ground, not over it.
 *
 * Median-cut (not k-means) is the right tool here: the Flux design is already
 * flat colour blocks, so a few cuts separate them cleanly, and the result is
 * fully deterministic (no random seeds) which the pipeline requires.
 */

export interface QuantResult {
  /** Per-pixel cluster index, length === width*height. */
  labels: Int16Array
  /** Cluster average colours as [r,g,b]. */
  clusters: Array<[number, number, number]>
  /** Per-pixel cloth/background mask (1 = cloth, never stitched). */
  background: Uint8Array
  width: number
  height: number
}

interface Box {
  /** Pixel indices into the colour list. */ idx: number[]
}

function channelRange(
  pixels: Array<[number, number, number]>,
  box: Box,
): { ch: 0 | 1 | 2; span: number } {
  let minR = 255,
    minG = 255,
    minB = 255,
    maxR = 0,
    maxG = 0,
    maxB = 0
  for (const i of box.idx) {
    const p = pixels[i]!
    if (p[0] < minR) minR = p[0]
    if (p[1] < minG) minG = p[1]
    if (p[2] < minB) minB = p[2]
    if (p[0] > maxR) maxR = p[0]
    if (p[1] > maxG) maxG = p[1]
    if (p[2] > maxB) maxB = p[2]
  }
  const rR = maxR - minR
  const rG = maxG - minG
  const rB = maxB - minB
  if (rR >= rG && rR >= rB) return { ch: 0, span: rR }
  if (rG >= rB) return { ch: 1, span: rG }
  return { ch: 2, span: rB }
}

/**
 * Median-cut a list of (sampled) pixels into up to `k` clusters. We sample on a
 * stride so a 1024px image quantises in milliseconds; the labelling pass then
 * snaps EVERY pixel to the nearest resulting cluster.
 */
export function quantise(
  rgba: Uint8Array,
  width: number,
  height: number,
  k: number,
  groundHint?: string,
): QuantResult {
  const n = width * height
  // Sample for the cut (cap the working set); skip fully transparent pixels.
  const sample: Array<[number, number, number]> = []
  const stride = Math.max(1, Math.floor(Math.sqrt(n / 20000)))
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const o = (y * width + x) * 4
      if (rgba[o + 3]! < 128) continue
      sample.push([rgba[o]!, rgba[o + 1]!, rgba[o + 2]!])
    }
  }
  if (sample.length === 0) {
    return { labels: new Int16Array(n), clusters: [[255, 255, 255]], background: new Uint8Array(n).fill(1), width, height }
  }

  let boxes: Box[] = [{ idx: sample.map((_, i) => i) }]
  while (boxes.length < k) {
    // Split the box with the widest channel span.
    let target = -1
    let best = -1
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i]!.idx.length < 2) continue
      const { span } = channelRange(sample, boxes[i]!)
      if (span > best) {
        best = span
        target = i
      }
    }
    if (target < 0 || best <= 0) break
    const box = boxes[target]!
    const { ch } = channelRange(sample, box)
    const sorted = [...box.idx].sort((a, b) => sample[a]![ch] - sample[b]![ch])
    const mid = sorted.length >> 1
    boxes.splice(target, 1, { idx: sorted.slice(0, mid) }, { idx: sorted.slice(mid) })
  }

  const rawClusters: Array<[number, number, number]> = boxes.map((box) => {
    let r = 0,
      g = 0,
      b = 0
    for (const i of box.idx) {
      r += sample[i]![0]
      g += sample[i]![1]
      b += sample[i]![2]
    }
    const m = Math.max(1, box.idx.length)
    return [Math.round(r / m), Math.round(g / m), Math.round(b / m)]
  })

  // Merge near-duplicate clusters so one colour split across two median-cut
  // boxes (e.g. a red cap's highlight + shadow) becomes ONE region — otherwise
  // the area fragments into small pieces no single fill can carry.
  const clusters = mergeClusters(rawClusters, 34)

  // Label every pixel by nearest cluster (squared RGB — fine after median-cut).
  const labels = new Int16Array(n)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    if (rgba[o + 3]! < 128) {
      labels[i] = -1
      continue
    }
    const r = rgba[o]!
    const g = rgba[o + 1]!
    const b = rgba[o + 2]!
    let bi = 0
    let bd = Infinity
    for (let c = 0; c < clusters.length; c++) {
      const cl = clusters[c]!
      const d = (cl[0] - r) ** 2 + (cl[1] - g) ** 2 + (cl[2] - b) ** 2
      if (d < bd) {
        bd = d
        bi = c
      }
    }
    labels[i] = bi
  }

  const background = detectBackground(labels, clusters, width, height, groundHint)
  return { labels, clusters, background, width, height }
}

/**
 * Greedily fold clusters within `dist` (RGB Euclidean) into the first kept one.
 * Visually-identical colours that median-cut happened to split end up as a single
 * cluster, so a region painted in one colour stays ONE connected component.
 */
function mergeClusters(
  clusters: Array<[number, number, number]>,
  dist: number,
): Array<[number, number, number]> {
  const kept: Array<[number, number, number]> = []
  const d2 = dist * dist
  for (const c of clusters) {
    let merged = false
    for (const k of kept) {
      const dd = (c[0] - k[0]) ** 2 + (c[1] - k[1]) ** 2 + (c[2] - k[2]) ** 2
      if (dd < d2) {
        merged = true
        break
      }
    }
    if (!merged) kept.push(c)
  }
  return kept
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [255, 255, 255]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

/**
 * The cloth is the light, low-saturation field reachable from the image edge.
 * We flood-fill inward from the border, crossing only cloth-like pixels; the
 * fill stops at the subject's outline (any non-light pixel), so a PALE SUBJECT
 * that touches the edge (a cream moon, a white daisy at the border) is kept,
 * while the surrounding ground is removed. An enclosed light shape inside the
 * subject (a white flower centre) is never reached, so it is kept too. A motif
 * that fills the frame has no edge cloth, so nothing is excluded — correct.
 */
function detectBackground(
  labels: Int16Array,
  clusters: Array<[number, number, number]>,
  width: number,
  height: number,
  groundHint?: string,
): Uint8Array {
  const n = width * height
  const clothLike = new Uint8Array(clusters.length)
  if (groundHint) {
    // Explicit coloured ground (e.g. a navy night sky on dark fabric): cloth is
    // any cluster close to the hinted colour, of any lightness. The subject is
    // whatever differs from the ground, so a pale moon on navy is kept.
    const [gr, gg, gb] = hexToRgb(groundHint)
    for (let c = 0; c < clusters.length; c++) {
      const [r, g, b] = clusters[c]!
      const d = (r - gr) ** 2 + (g - gg) ** 2 + (b - gb) ** 2
      if (d < 70 * 70) clothLike[c] = 1
    }
  } else {
    // Auto: a plain paper ground is light + near-neutral. Dark/colourful edge
    // fields (a night sky, a forest) are kept as design and stitched.
    for (let c = 0; c < clusters.length; c++) {
      const [r, g, b] = clusters[c]!
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const sat = Math.max(r, g, b) - Math.min(r, g, b)
      if (luma > 165 && sat < 55) clothLike[c] = 1
    }
  }
  const isCloth = (i: number) => {
    const l = labels[i]!
    return l < 0 || clothLike[l] === 1
  }
  const bg = new Uint8Array(n)
  const queue: number[] = []
  const seed = (i: number) => {
    if (!bg[i] && isCloth(i)) {
      bg[i] = 1
      queue.push(i)
    }
  }
  for (let x = 0; x < width; x++) {
    seed(x)
    seed((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    seed(y * width)
    seed(y * width + width - 1)
  }
  while (queue.length) {
    const i = queue.pop()!
    const x = i % width
    const y = (i / width) | 0
    if (x > 0) seed(i - 1)
    if (x < width - 1) seed(i + 1)
    if (y > 0) seed(i - width)
    if (y < height - 1) seed(i + width)
  }
  return bg
}
