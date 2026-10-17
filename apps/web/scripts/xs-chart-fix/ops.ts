/**
 * xs-chart-fix ops: small, local repairs to a stored cross-stitch chart.
 *
 * Built for the nearly-there pass (17 October 2026): rejected candidates whose
 * only fault was a few stitches (a signature in a corner, a frame band, floating
 * strays, a stray block). Every op edits the chart that ships; none redraws or
 * regenerates the design, and none adds a colour the palette did not have.
 * Pure: no Prisma, no network. The CLI is `scripts/xs-chart-fix.ts`.
 */
import { clearBackground } from '@/lib/studio/generation/bulk/bare-fabric'
import sharp from 'sharp'
import { parsePatternData, type PatternData } from '@homemade/db'

export type Rect = [number, number, number, number] // x0,y0,x1,y1 inclusive

export function occMap(d: PatternData): Map<string, string> {
  const m = new Map<string, string>()
  for (const c of d.grid.cells) m.set(`${c.x},${c.y}`, c.s)
  return m
}
function occupiedSet(d: PatternData): Set<string> {
  const s = new Set<string>()
  for (const c of d.grid.cells) s.add(`${c.x},${c.y}`)
  for (const f of d.grid.fractional) s.add(`${f.x},${f.y}`)
  return s
}

/** 8-connected components of stitched cells. */
export function components(d: PatternData, conn: 4 | 8 = 8): { cells: [number, number][]; bbox: Rect }[] {
  const occ = occupiedSet(d)
  const seen = new Set<string>()
  const out: { cells: [number, number][]; bbox: Rect }[] = []
  for (const k of occ) {
    if (seen.has(k)) continue
    const [sx, sy] = k.split(',').map(Number) as [number, number]
    const stack: [number, number][] = [[sx, sy]]
    seen.add(k)
    const cells: [number, number][] = []
    let x0 = sx, y0 = sy, x1 = sx, y1 = sy
    while (stack.length) {
      const [x, y] = stack.pop()!
      cells.push([x, y])
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y)
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (conn === 4 && dx && dy) continue
        const nk = `${x + dx},${y + dy}`
        if (!seen.has(nk) && occ.has(nk)) { seen.add(nk); stack.push([x + dx, y + dy]) }
      }
    }
    out.push({ cells, bbox: [x0, y0, x1, y1] })
  }
  return out.sort((a, b) => b.cells.length - a.cells.length)
}

/** 4-connected empty regions not touching the grid border (holes). */
export function holes(d: PatternData): { cells: [number, number][]; bbox: Rect }[] {
  const occ = occupiedSet(d)
  const W = d.grid.width, H = d.grid.height
  const seen = new Set<string>()
  const out: { cells: [number, number][]; bbox: Rect }[] = []
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = `${x},${y}`
    if (occ.has(k) || seen.has(k)) continue
    const stack: [number, number][] = [[x, y]]; seen.add(k)
    const cells: [number, number][] = []; let border = false
    let x0 = x, y0 = y, x1 = x, y1 = y
    while (stack.length) {
      const [cx, cy] = stack.pop()!
      cells.push([cx, cy])
      if (cx === 0 || cy === 0 || cx === W - 1 || cy === H - 1) border = true
      x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = cx + dx, ny = cy + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const nk = `${nx},${ny}`
        if (!seen.has(nk) && !occ.has(nk)) { seen.add(nk); stack.push([nx, ny]) }
      }
    }
    if (!border) out.push({ cells, bbox: [x0, y0, x1, y1] })
  }
  return out
}

const inRect = (x: number, y: number, r: Rect) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]

/** Drop everything sitting on the given cells, then prune lines and palette. */
export function removeCells(d: PatternData, kill: Set<string>): PatternData {
  const g = d.grid
  const cells = g.cells.filter((c) => !kill.has(`${c.x},${c.y}`))
  const fractional = g.fractional.filter((f) => !kill.has(`${f.x},${f.y}`))
  const frenchKnots = g.frenchKnots.filter((k) => !kill.has(`${k.x},${k.y}`))
  const beads = g.beads.filter((k) => !kill.has(`${k.x},${k.y}`))
  const next: PatternData = { ...d, grid: { ...g, cells, fractional, frenchKnots, beads, backstitch: g.backstitch } }
  return pruneLines(next)
}

/**
 * Keep back-stitch only where a stitched cell still sits beside it. Outline
 * chains run up to 48 cells, so a segment is cut into unit steps, each step
 * tested on its own (an edge: either cell beside it stitched; a diagonal: the
 * cell it crosses stitched), and the surviving runs are joined back up.
 */
export function pruneLines(d: PatternData): PatternData {
  const occ = occupiedSet(d)
  const has = (x: number, y: number) => occ.has(`${x},${y}`)
  const unitOk = (ax: number, ay: number, bx: number, by: number): boolean => {
    if (ay === by) { const x = Math.min(ax, bx); return has(x, ay - 1) || has(x, ay) }
    if (ax === bx) { const y = Math.min(ay, by); return has(ax - 1, y) || has(ax, y) }
    return has(Math.min(ax, bx), Math.min(ay, by))
  }
  const out: PatternData['grid']['backstitch'] = []
  for (const b of d.grid.backstitch) {
    const dx = b.x2 - b.x1, dy = b.y2 - b.y1
    const n = Math.max(Math.abs(dx), Math.abs(dy))
    const integral = [b.x1, b.y1, b.x2, b.y2].every(Number.isInteger)
    const unitable = integral && n >= 1 && (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))
    if (!unitable) {
      // odd slope or half-cell: keep while any cell under its footprint is stitched
      const x0 = Math.floor(Math.min(b.x1, b.x2)), x1 = Math.ceil(Math.max(b.x1, b.x2))
      const y0 = Math.floor(Math.min(b.y1, b.y2)), y1 = Math.ceil(Math.max(b.y1, b.y2))
      let ok = false
      for (let x = x0 - 1; x <= x1 && !ok; x++) for (let y = y0 - 1; y <= y1 && !ok; y++) if (has(x, y)) ok = true
      if (ok) out.push(b)
      continue
    }
    const sx = Math.sign(dx), sy = Math.sign(dy)
    let runStart: number | null = null
    for (let i = 0; i <= n; i++) {
      const ok = i < n && unitOk(b.x1 + sx * i, b.y1 + sy * i, b.x1 + sx * (i + 1), b.y1 + sy * (i + 1))
      if (ok && runStart === null) runStart = i
      if (!ok && runStart !== null) {
        out.push({ ...b, x1: b.x1 + sx * runStart, y1: b.y1 + sy * runStart, x2: b.x1 + sx * i, y2: b.y1 + sy * i })
        runStart = null
      }
    }
  }
  return prunePalette({ ...d, grid: { ...d.grid, backstitch: out } })
}

export function prunePalette(d: PatternData): PatternData {
  const used = new Set<string>()
  const g = d.grid
  for (const a of [g.cells, g.fractional, g.frenchKnots, g.beads, g.backstitch]) for (const c of a as { s: string }[]) used.add(c.s)
  return { ...d, palette: d.palette.filter((p) => used.has(p.symbol)) }
}

export function cellsInRects(d: PatternData, rects: Rect[]): Set<string> {
  const kill = new Set<string>()
  for (const c of d.grid.cells) if (rects.some((r) => inRect(c.x, c.y, r))) kill.add(`${c.x},${c.y}`)
  for (const f of d.grid.fractional) if (rects.some((r) => inRect(f.x, f.y, r))) kill.add(`${f.x},${f.y}`)
  for (const k of d.grid.frenchKnots) if (rects.some((r) => inRect(k.x, k.y, r))) kill.add(`${k.x},${k.y}`)
  return kill
}

/** Small floating components (size <= maxSize), optionally only inside rects, never the main body. */
export function strayCells(d: PatternData, maxSize: number, rects?: Rect[], keepLargest = 1, conn: 4 | 8 = 8): Set<string> {
  const comps = components(d, conn)
  const kill = new Set<string>()
  comps.forEach((c, i) => {
    if (i < keepLargest) return
    if (c.cells.length > maxSize) return
    if (rects && !c.cells.every(([x, y]) => rects.some((r) => inRect(x, y, r)))) return
    for (const [x, y] of c.cells) kill.add(`${x},${y}`)
  })
  return kill
}

/** Fill small enclosed holes with the most common colour on their 8-neighbour ring. */
export function fillHoles(d: PatternData, maxSize: number, rects?: Rect[]): { data: PatternData; filled: number } {
  const hs = holes(d)
  const occ = occMap(d)
  const add: { x: number; y: number; s: string }[] = []
  for (const h of hs) {
    if (h.cells.length > maxSize) continue
    if (rects && !h.cells.every(([x, y]) => rects.some((r) => inRect(x, y, r)))) continue
    const hk = new Set(h.cells.map(([x, y]) => `${x},${y}`))
    // fill each cell from its own nearest neighbours, iteratively from the edge inward
    const pending = new Set(hk)
    let guard = 0
    while (pending.size && guard++ < 100) {
      const round: { x: number; y: number; s: string }[] = []
      for (const k of pending) {
        const [x, y] = k.split(',').map(Number) as [number, number]
        const votes = new Map<string, number>()
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue
          const s = occ.get(`${x + dx},${y + dy}`)
          if (s) votes.set(s, (votes.get(s) ?? 0) + (dx && dy ? 1 : 2))
        }
        if (!votes.size) continue
        const s = [...votes].sort((a, b) => b[1] - a[1])[0]![0]
        round.push({ x, y, s })
      }
      for (const r of round) { occ.set(`${r.x},${r.y}`, r.s); pending.delete(`${r.x},${r.y}`); add.push(r) }
      if (!round.length) break
    }
  }
  // a hole cell may hold a fractional; drop those fractionals in favour of full cross
  const addK = new Set(add.map((a) => `${a.x},${a.y}`))
  const fractional = d.grid.fractional.filter((f) => !addK.has(`${f.x},${f.y}`))
  return { data: { ...d, grid: { ...d.grid, cells: [...d.grid.cells, ...add], fractional } }, filled: add.length }
}

/** Recolour a rect's stitched cells to the dominant colour of the ring just outside it (signature over stitched ground). */
export function patchRect(d: PatternData, r: Rect): PatternData {
  const occ = occMap(d)
  const votes = new Map<string, number>()
  let ringTotal = 0, ringEmpty = 0
  for (let x = r[0] - 1; x <= r[2] + 1; x++) for (let y = r[1] - 1; y <= r[3] + 1; y++) {
    if (inRect(x, y, r)) continue
    if (x < 0 || y < 0 || x >= d.grid.width || y >= d.grid.height) continue
    ringTotal++
    const s = occ.get(`${x},${y}`)
    if (!s) { ringEmpty++; continue }
    votes.set(s, (votes.get(s) ?? 0) + 1)
  }
  const kill = cellsInRects(d, [r])
  let next = removeCells(d, kill)
  if (ringEmpty / Math.max(1, ringTotal) > 0.5 || !votes.size) return next
  const s = [...votes].sort((a, b) => b[1] - a[1])[0]![0]
  const add = []
  for (let x = r[0]; x <= r[2]; x++) for (let y = r[1]; y <= r[3]; y++) add.push({ x, y, s })
  next = { ...next, grid: { ...next.grid, cells: [...next.grid.cells, ...add] } }
  // the palette entry might have been pruned if only used inside; re-add
  if (!next.palette.find((p) => p.symbol === s)) next = { ...next, palette: [...next.palette, d.palette.find((p) => p.symbol === s)!] }
  return next
}

/** A plain flat chart view with a coordinate grid, for locating faults. */
export async function gridView(d: PatternData, highlight?: Set<string>, px = 10): Promise<Buffer> {
  const W = d.grid.width, H = d.grid.height
  const pad = 30
  const col = new Map(d.palette.map((p) => [p.symbol, p.rgb]))
  const parts: string[] = []
  parts.push(`<rect x="${pad}" y="${pad}" width="${W * px}" height="${H * px}" fill="#f5ebd8"/>`)
  for (const c of d.grid.cells) parts.push(`<rect x="${pad + c.x * px}" y="${pad + c.y * px}" width="${px}" height="${px}" fill="${col.get(c.s)}"/>`)
  for (const f of d.grid.fractional) {
    if (d.grid.cells.some(() => false)) continue
    parts.push(`<rect x="${pad + f.x * px + px / 4}" y="${pad + f.y * px + px / 4}" width="${px / 2}" height="${px / 2}" fill="${col.get(f.s)}"/>`)
  }
  for (const b of d.grid.backstitch) parts.push(`<line x1="${pad + b.x1 * px}" y1="${pad + b.y1 * px}" x2="${pad + b.x2 * px}" y2="${pad + b.y2 * px}" stroke="${col.get(b.s)}" stroke-width="1.5"/>`)
  if (highlight) for (const k of highlight) { const [x, y] = k.split(',').map(Number) as [number, number]; parts.push(`<rect x="${pad + x * px}" y="${pad + y * px}" width="${px}" height="${px}" fill="none" stroke="#ff00ff" stroke-width="2"/>`) }
  for (let x = 0; x <= W; x += 10) parts.push(`<line x1="${pad + x * px}" y1="${pad}" x2="${pad + x * px}" y2="${pad + H * px}" stroke="#00a0ff" stroke-width="0.6"/><text x="${pad + x * px}" y="20" font-size="11" fill="#0050a0" font-family="DejaVu Sans">${x}</text>`)
  for (let y = 0; y <= H; y += 10) parts.push(`<line x1="${pad}" y1="${pad + y * px}" x2="${pad + W * px}" y2="${pad + y * px}" stroke="#00a0ff" stroke-width="0.6"/><text x="2" y="${pad + y * px + 4}" font-size="11" fill="#0050a0" font-family="DejaVu Sans">${y}</text>`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * px + pad * 2}" height="${H * px + pad * 2}"><rect width="100%" height="100%" fill="#fff"/>${parts.join('')}</svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

/** Crop the grid to its stitched bounding box, shifting every layer with it. */
export function trimToStitching(d: PatternData): PatternData {
  const g = d.grid
  const pts: [number, number][] = [...g.cells.map((c) => [c.x, c.y] as [number, number]), ...g.fractional.map((c) => [c.x, c.y] as [number, number]), ...g.frenchKnots.map((c) => [c.x, c.y] as [number, number])]
  if (!pts.length) return d
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  for (const b of g.backstitch) { x0 = Math.min(x0, Math.floor(Math.min(b.x1, b.x2))); y0 = Math.min(y0, Math.floor(Math.min(b.y1, b.y2))); x1 = Math.max(x1, Math.ceil(Math.max(b.x1, b.x2)) - 1); y1 = Math.max(y1, Math.ceil(Math.max(b.y1, b.y2)) - 1) }
  // keep the renderer's own 2-cell fabric margin so the hero crop looks the same
  x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(g.width - 1, x1 + 2); y1 = Math.min(g.height - 1, y1 + 2)
  if (x0 === 0 && y0 === 0 && x1 === g.width - 1 && y1 === g.height - 1) return d
  const sh = <T extends { x: number; y: number }>(a: T[]) => a.map((c) => ({ ...c, x: c.x - x0, y: c.y - y0 }))
  return { ...d, grid: { ...g, width: x1 - x0 + 1, height: y1 - y0 + 1, cells: sh(g.cells), fractional: sh(g.fractional), frenchKnots: sh(g.frenchKnots), beads: sh(g.beads),
    backstitch: g.backstitch.map((b) => ({ ...b, x1: b.x1 - x0, x2: b.x2 - x0, y1: b.y1 - y0, y2: b.y2 - y0 })) } }
}

export type Op =
  | { op: 'stray'; max: number; rects?: Rect[]; keep?: number; conn?: 4 | 8 }
  | { op: 'erase'; rects: Rect[] }
  | { op: 'patch'; rect: Rect }
  | { op: 'holes'; max: number; rects?: Rect[] }
  | { op: 'speckle'; max: number; rects?: Rect[]; light?: boolean; grey?: boolean }
  | { op: 'bare' }
  | { op: 'longlines'; max: number }
  | { op: 'unline'; rects: Rect[] }
  | { op: 'frame'; top: number; bottom: number; left: number; right: number }

/** Recolour small same-colour islands fully enclosed by other stitching to the neighbour majority. */
function speckle(d: PatternData, max: number, rects?: Rect[], light?: boolean, grey?: boolean): PatternData {
  const occ = occMap(d)
  const rgb = new Map(d.palette.map((p) => [p.symbol, p.rgb]))
  const isLight = (s: string) => { const h = rgb.get(s)!; const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); return (r + g + b) / 3 > 215 && Math.max(r, g, b) - Math.min(r, g, b) < 40 }
  const isGrey = (s: string) => { const h = rgb.get(s)!; const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); return Math.max(r, g, b) - Math.min(r, g, b) < 28 && (r + g + b) / 3 < 236 }
  const inR = (x: number, y: number) => !rects || rects.some((r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3])
  const seen = new Set<string>()
  const changes = new Map<string, string>()
  for (const [k, s] of occ) {
    if (seen.has(k)) continue
    if (light && !isLight(s)) continue
    if (grey && !isGrey(s)) continue
    const [sx, sy] = k.split(',').map(Number) as [number, number]
    const stack: [number, number][] = [[sx, sy]]; seen.add(k)
    const cells: [number, number][] = []
    let enclosed = true
    const ring = new Map<string, number>()
    while (stack.length) {
      const [x, y] = stack.pop()!
      cells.push([x, y])
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nk = `${x + dx},${y + dy}`
        const ns = occ.get(nk)
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= d.grid.width || ny >= d.grid.height) continue
        if (ns === undefined) { enclosed = false; continue }
        if (ns === s || (light && isLight(ns))) { if (!seen.has(nk)) { seen.add(nk); stack.push([x + dx, y + dy]) } }
        else ring.set(ns, (ring.get(ns) ?? 0) + 1)
      }
    }
    if (!enclosed || cells.length > max || !ring.size) continue
    if (!cells.every(([x, y]) => inR(x, y))) continue
    const to = [...ring].sort((a, b) => b[1] - a[1])[0]![0]
    for (const [x, y] of cells) changes.set(`${x},${y}`, to)
  }
  const cells = d.grid.cells.map((c) => changes.has(`${c.x},${c.y}`) ? { ...c, s: changes.get(`${c.x},${c.y}`)! } : c)
  return prunePalette({ ...d, grid: { ...d.grid, cells } })
}

export function applyOps(d0: PatternData, ops: Op[]): PatternData {
  let d = d0
  for (const o of ops) {
    if (o.op === 'stray') {
      const k = strayCells(d, o.max, o.rects, o.keep ?? 1, o.conn ?? 8)
      if (process.env.XSN_VERBOSE) { const comps = components(d, o.conn ?? 8).filter((c) => c.cells.some(([x, y]) => k.has(`${x},${y}`))); console.log(`   stray(${o.max}) removes ${comps.length}: ${comps.map((c) => `${c.cells.length}@[${c.bbox.join(',')}]`).join(' ')}`) }
      d = removeCells(d, k)
    }
    else if (o.op === 'erase') d = removeCells(d, cellsInRects(d, o.rects))
    else if (o.op === 'patch') d = patchRect(d, o.rect)
    else if (o.op === 'holes') d = fillHoles(d, o.max, o.rects).data
    else if (o.op === 'speckle') d = speckle(d, o.max, o.rects, o.light, o.grey)
    else if (o.op === 'unline') { const inside = (x: number, y: number) => o.rects.some((r) => x >= r[0] && x <= r[2] + 1 && y >= r[1] && y <= r[3] + 1); d = { ...d, grid: { ...d.grid, backstitch: d.grid.backstitch.filter((b) => !(inside(b.x1, b.y1) && inside(b.x2, b.y2))) } } }
    else if (o.op === 'longlines') d = { ...d, grid: { ...d.grid, backstitch: d.grid.backstitch.filter((b) => Math.hypot(b.x2 - b.x1, b.y2 - b.y1) <= o.max) } }
    else if (o.op === 'bare') { const c = clearBackground(d); d = pruneLines({ ...d, grid: { ...d.grid, cells: c.data.grid.cells } }) }
    else if (o.op === 'frame') { const W = d.grid.width, H = d.grid.height; const rs: Rect[] = []; if (o.top) rs.push([0, 0, W - 1, o.top - 1]); if (o.bottom) rs.push([0, H - o.bottom, W - 1, H - 1]); if (o.left) rs.push([0, 0, o.left - 1, H - 1]); if (o.right) rs.push([W - o.right, 0, W - 1, H - 1]); d = removeCells(d, cellsInRects(d, rs)) }
  }
  return parsePatternData(trimToStitching(prunePalette(d)))
}

