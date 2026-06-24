/**
 * Skeleton → polylines. Walks the 1px skeleton into ordered point chains, split
 * at endpoints and junctions, plus closed loops. Then simplifies each chain.
 * The result is the printed pattern's geometry as vector paths the loom can lay
 * thread along.
 */

import type { Mask } from './skeleton'

export interface Poly {
  pts: [number, number][]
  loop: boolean
}

const N8: [number, number][] = [
  [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1],
]

export function trace(skel: Mask): Poly[] {
  const { w, h, data } = skel
  const idx = (x: number, y: number) => y * w + x
  const inb = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h
  const deg = new Int16Array(w * h)
  const fg: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[idx(x, y)] !== 1) continue
      let d = 0
      for (const [dx, dy] of N8) if (inb(x + dx, y + dy) && data[idx(x + dx, y + dy)] === 1) d++
      deg[idx(x, y)] = d
      fg.push(idx(x, y))
    }
  }
  const neighbours = (i: number): number[] => {
    const x = i % w
    const y = (i / w) | 0
    const res: number[] = []
    for (const [dx, dy] of N8) if (inb(x + dx, y + dy) && data[idx(x + dx, y + dy)] === 1) res.push(idx(x + dx, y + dy))
    return res
  }
  const isNode = (i: number) => deg[i] !== 2
  const used = new Uint8Array(w * h) // non-node pixels consumed
  const polys: Poly[] = []
  const seenEdge = new Set<string>()
  const toXY = (i: number): [number, number] => [i % w, (i / w) | 0]

  // 1. Walk every edge out of a node (endpoint deg1 or junction deg>=3).
  for (const node of fg) {
    if (!isNode(node)) continue
    for (const nb of neighbours(node)) {
      if (isNode(nb)) {
        const key = node < nb ? `${node}-${nb}` : `${nb}-${node}`
        if (seenEdge.has(key)) continue
        seenEdge.add(key)
        polys.push({ pts: [toXY(node), toXY(nb)], loop: false })
        continue
      }
      if (used[nb]) continue
      const pts: number[] = [node]
      let prev = node
      let cur = nb
      while (true) {
        pts.push(cur)
        used[cur] = 1
        if (isNode(cur)) break
        let next = -1
        for (const n2 of neighbours(cur)) {
          if (n2 === prev) continue
          if (used[n2] && !isNode(n2)) continue
          next = n2
          break
        }
        if (next === -1) break
        prev = cur
        cur = next
      }
      polys.push({ pts: pts.map(toXY), loop: false })
    }
  }

  // 2. Pure loops: components of all-degree-2 with no node.
  for (const start of fg) {
    if (deg[start] !== 2 || used[start]) continue
    const pts: number[] = [start]
    used[start] = 1
    let prev = -1
    let cur = start
    while (true) {
      let next = -1
      for (const n2 of neighbours(cur)) {
        if (n2 === prev) continue
        if (used[n2]) continue
        next = n2
        break
      }
      if (next === -1) break
      pts.push(next)
      used[next] = 1
      prev = cur
      cur = next
    }
    polys.push({ pts: pts.map(toXY), loop: true })
  }

  return polys.filter((p) => p.pts.length >= 2)
}

/** Ramer–Douglas–Peucker simplification. */
export function simplify(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts
  let maxD = 0
  let idx = 0
  const a = pts[0]!
  const b = pts[pts.length - 1]!
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i]!, a, b)
    if (d > maxD) {
      maxD = d
      idx = i
    }
  }
  if (maxD > eps) {
    const left = simplify(pts.slice(0, idx + 1), eps)
    const right = simplify(pts.slice(idx), eps)
    return left.slice(0, -1).concat(right)
  }
  return [a, b]
}

function perpDist(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1e-9
  return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len
}

export interface TracedShape {
  pts: [number, number][]
  loop: boolean
  /** Centroid (px). */
  cx: number
  cy: number
  /** Bounding-box diagonal (px). */
  diag: number
  /** Bounding-box width + height (px). */
  bw: number
  bh: number
  /** Path length (px). */
  len: number
}

export function describe(p: Poly): TracedShape {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let sx = 0
  let sy = 0
  let len = 0
  for (let i = 0; i < p.pts.length; i++) {
    const [x, y] = p.pts[i]!
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    sx += x
    sy += y
    if (i > 0) len += Math.hypot(x - p.pts[i - 1]![0], y - p.pts[i - 1]![1])
  }
  const n = p.pts.length
  const a = p.pts[0]!
  const b = p.pts[n - 1]!
  const closed = p.loop || Math.hypot(a[0] - b[0], a[1] - b[1]) < 3
  return {
    pts: p.pts,
    loop: closed,
    cx: sx / n,
    cy: sy / n,
    diag: Math.hypot(maxX - minX, maxY - minY),
    bw: maxX - minX,
    bh: maxY - minY,
    len,
  }
}
