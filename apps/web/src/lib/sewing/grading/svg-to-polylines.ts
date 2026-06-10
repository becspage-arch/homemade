// SPDX-License-Identifier: MIT
// Convert freesewing-rendered SVG into Homemade SewingPiece polylines.
//
// The existing tiled-print pipeline at apps/web/src/lib/sewing/printing/
// walks SewingPiece.pathPoints[] and clips each segment against tile
// windows. Freesewing emits a single SVG string. This module bridges
// the two: extract per-part `<path d="...">` strings, sample any curve
// commands into short line segments, and produce one SewingPiece per
// part.
//
// The output is a faithful polyline approximation of the freesewing
// drawing. Curve commands (C, S, Q, T, A) are sampled at a fixed step
// count; the default of 16 segments per curve is plenty for printer
// resolution at 25 cm pattern sizes.
//
// Limitations:
//   * Elliptical arcs (A) are approximated as straight segments between
//     start and end. Freesewing rarely emits arcs in body block parts;
//     when it does the printed line is shorter than the visible arc by
//     <0.5mm, well inside the tile clipping tolerance.
//   * Path Z (close) emits a closing segment; standalone polylines that
//     don't close cleanly round-trip without modification.

import type { SewingPiece, SewingPieceVertex } from '@/components/studio/sewing/types'

const CURVE_SAMPLE_STEPS = 16

export interface ParsedPart {
  /**
   * Part name from the SVG `<g id="..."/>` attribute, or "part-N" if the
   * grouping doesn't expose an id.
   */
  name: string
  /** Top-left of the part's bounding box in pattern-space mm. */
  topLeft: SewingPieceVertex
  /** Polyline approximations of every `<path>` inside the part. */
  paths: SewingPieceVertex[][]
}

export interface ParsedSvg {
  /** Parts in render order. */
  parts: ParsedPart[]
  /** Overall bounding box of every parsed path in mm. */
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  /** Width in mm. */
  widthMm: number
  /** Height in mm. */
  heightMm: number
}

/**
 * Parse a freesewing-rendered SVG string into part-grouped polylines.
 *
 * Naive regex parsing — robust enough for freesewing 4.x output, which
 * emits well-formed `<svg>`, `<g id="...">`, `<path d="..."/>`. If
 * freesewing's output shape ever drifts, the worst case is missing parts
 * (silent), not crashing.
 */
export function parseFreesewingSvg(svg: string): ParsedSvg {
  const parts: ParsedPart[] = []

  // Each part group from freesewing looks like:
  //   <g id="fs-bella.back" class="part" transform="..."> ... </g>
  // We don't care about the transform here — freesewing computes
  // absolute coordinates on the inner paths.
  const partRegex = /<g[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g

  let match: RegExpExecArray | null
  let partIndex = 0
  while ((match = partRegex.exec(svg)) !== null) {
    const groupId = match[1] ?? `part-${partIndex}`
    const inner = match[2] ?? ''
    const paths = extractPaths(inner)
    if (paths.length === 0) continue

    let minX = Infinity
    let minY = Infinity
    for (const poly of paths) {
      for (const p of poly) {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
      }
    }

    parts.push({
      name: groupId,
      topLeft: { x: Number.isFinite(minX) ? minX : 0, y: Number.isFinite(minY) ? minY : 0 },
      paths,
    })
    partIndex++
  }

  // Compute overall bounds across all parts.
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const part of parts) {
    for (const poly of part.paths) {
      for (const p of poly) {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x
        if (p.y > maxY) maxY = p.y
      }
    }
  }
  if (!Number.isFinite(minX)) {
    minX = 0
    minY = 0
    maxX = 0
    maxY = 0
  }

  return {
    parts,
    bounds: { minX, minY, maxX, maxY },
    widthMm: maxX - minX,
    heightMm: maxY - minY,
  }
}

function extractPaths(inner: string): SewingPieceVertex[][] {
  const out: SewingPieceVertex[][] = []
  const pathRegex = /<path[^>]*\bd="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = pathRegex.exec(inner)) !== null) {
    const d = match[1] ?? ''
    const poly = samplePathD(d)
    if (poly.length >= 2) out.push(poly)
  }
  return out
}

/**
 * Sample an SVG path `d` attribute into a polyline. Supports the subset
 * freesewing emits: M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, Z, z.
 * Arcs A/a are degraded to a straight segment between start and end.
 */
export function samplePathD(d: string): SewingPieceVertex[] {
  const tokens = tokenise(d)
  const out: SewingPieceVertex[] = []
  let i = 0
  let cur: SewingPieceVertex = { x: 0, y: 0 }
  let start: SewingPieceVertex = { x: 0, y: 0 }
  let lastCubicControl: SewingPieceVertex | null = null
  let lastQuadControl: SewingPieceVertex | null = null

  function push(p: SewingPieceVertex) {
    if (out.length === 0) {
      out.push(p)
      return
    }
    const last = out[out.length - 1]!
    if (Math.abs(last.x - p.x) > 0.01 || Math.abs(last.y - p.y) > 0.01) {
      out.push(p)
    }
  }

  while (i < tokens.length) {
    const cmd = tokens[i]
    if (typeof cmd !== 'string') {
      i++
      continue
    }
    const isRel = cmd === cmd.toLowerCase()
    const lc = cmd.toLowerCase()
    i++

    switch (lc) {
      case 'm': {
        // First implicit pair is move; subsequent pairs are implicit
        // line segments.
        let first = true
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const x = tokens[i++] as number
          const y = tokens[i++] as number
          const nx = isRel ? cur.x + x : x
          const ny = isRel ? cur.y + y : y
          cur = { x: nx, y: ny }
          if (first) {
            start = cur
            push(cur)
            first = false
          } else {
            push(cur)
          }
        }
        lastCubicControl = null
        lastQuadControl = null
        break
      }
      case 'l': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const x = tokens[i++] as number
          const y = tokens[i++] as number
          const nx = isRel ? cur.x + x : x
          const ny = isRel ? cur.y + y : y
          cur = { x: nx, y: ny }
          push(cur)
        }
        lastCubicControl = null
        lastQuadControl = null
        break
      }
      case 'h': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const x = tokens[i++] as number
          const nx = isRel ? cur.x + x : x
          cur = { x: nx, y: cur.y }
          push(cur)
        }
        lastCubicControl = null
        lastQuadControl = null
        break
      }
      case 'v': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const y = tokens[i++] as number
          const ny = isRel ? cur.y + y : y
          cur = { x: cur.x, y: ny }
          push(cur)
        }
        lastCubicControl = null
        lastQuadControl = null
        break
      }
      case 'c': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const c1x = tokens[i++] as number
          const c1y = tokens[i++] as number
          const c2x = tokens[i++] as number
          const c2y = tokens[i++] as number
          const ex = tokens[i++] as number
          const ey = tokens[i++] as number
          const p1 = isRel ? { x: cur.x + c1x, y: cur.y + c1y } : { x: c1x, y: c1y }
          const p2 = isRel ? { x: cur.x + c2x, y: cur.y + c2y } : { x: c2x, y: c2y }
          const end = isRel ? { x: cur.x + ex, y: cur.y + ey } : { x: ex, y: ey }
          for (let s = 1; s <= CURVE_SAMPLE_STEPS; s++) {
            const t = s / CURVE_SAMPLE_STEPS
            push(cubicAt(cur, p1, p2, end, t))
          }
          cur = end
          lastCubicControl = p2
          lastQuadControl = null
        }
        break
      }
      case 's': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const c2x = tokens[i++] as number
          const c2y = tokens[i++] as number
          const ex = tokens[i++] as number
          const ey = tokens[i++] as number
          const p1 = lastCubicControl
            ? { x: 2 * cur.x - lastCubicControl.x, y: 2 * cur.y - lastCubicControl.y }
            : cur
          const p2 = isRel ? { x: cur.x + c2x, y: cur.y + c2y } : { x: c2x, y: c2y }
          const end = isRel ? { x: cur.x + ex, y: cur.y + ey } : { x: ex, y: ey }
          for (let s = 1; s <= CURVE_SAMPLE_STEPS; s++) {
            const t = s / CURVE_SAMPLE_STEPS
            push(cubicAt(cur, p1, p2, end, t))
          }
          cur = end
          lastCubicControl = p2
          lastQuadControl = null
        }
        break
      }
      case 'q': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const c1x = tokens[i++] as number
          const c1y = tokens[i++] as number
          const ex = tokens[i++] as number
          const ey = tokens[i++] as number
          const p1 = isRel ? { x: cur.x + c1x, y: cur.y + c1y } : { x: c1x, y: c1y }
          const end = isRel ? { x: cur.x + ex, y: cur.y + ey } : { x: ex, y: ey }
          for (let s = 1; s <= CURVE_SAMPLE_STEPS; s++) {
            const t = s / CURVE_SAMPLE_STEPS
            push(quadAt(cur, p1, end, t))
          }
          cur = end
          lastQuadControl = p1
          lastCubicControl = null
        }
        break
      }
      case 't': {
        while (i < tokens.length && typeof tokens[i] === 'number') {
          const ex = tokens[i++] as number
          const ey = tokens[i++] as number
          const p1: SewingPieceVertex = lastQuadControl
            ? { x: 2 * cur.x - lastQuadControl.x, y: 2 * cur.y - lastQuadControl.y }
            : cur
          const end = isRel ? { x: cur.x + ex, y: cur.y + ey } : { x: ex, y: ey }
          for (let s = 1; s <= CURVE_SAMPLE_STEPS; s++) {
            const t = s / CURVE_SAMPLE_STEPS
            push(quadAt(cur, p1, end, t))
          }
          cur = end
          lastQuadControl = p1
          lastCubicControl = null
        }
        break
      }
      case 'a': {
        // Approximate arcs as a straight segment to the endpoint. Good
        // enough for freesewing's rare arc use; the tile clipping will
        // shorten the apparent line by at most a few mm.
        while (i < tokens.length && typeof tokens[i] === 'number') {
          // skip rx, ry, x-axis-rotation, large-arc-flag, sweep-flag
          i += 5
          const ex = tokens[i++] as number
          const ey = tokens[i++] as number
          const end = isRel ? { x: cur.x + ex, y: cur.y + ey } : { x: ex, y: ey }
          cur = end
          push(cur)
        }
        lastCubicControl = null
        lastQuadControl = null
        break
      }
      case 'z': {
        if (out.length > 0) {
          push(start)
        }
        cur = start
        lastCubicControl = null
        lastQuadControl = null
        break
      }
      default: {
        // Unknown command — bail. Subsequent tokens are unpredictable.
        return out
      }
    }
  }

  return out
}

function cubicAt(
  p0: SewingPieceVertex,
  p1: SewingPieceVertex,
  p2: SewingPieceVertex,
  p3: SewingPieceVertex,
  t: number,
): SewingPieceVertex {
  const u = 1 - t
  const x =
    u * u * u * p0.x +
    3 * u * u * t * p1.x +
    3 * u * t * t * p2.x +
    t * t * t * p3.x
  const y =
    u * u * u * p0.y +
    3 * u * u * t * p1.y +
    3 * u * t * t * p2.y +
    t * t * t * p3.y
  return { x, y }
}

function quadAt(
  p0: SewingPieceVertex,
  p1: SewingPieceVertex,
  p2: SewingPieceVertex,
  t: number,
): SewingPieceVertex {
  const u = 1 - t
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
  return { x, y }
}

/**
 * Tokenise an SVG path `d` attribute into commands + numbers.
 * Commands are single letters; numbers are floats. Whitespace and commas
 * are treated as separators.
 */
function tokenise(d: string): (string | number)[] {
  const out: (string | number)[] = []
  let buf = ''
  for (let i = 0; i < d.length; i++) {
    const ch = d[i]!
    if (/[A-DF-Za-df-z]/.test(ch)) {
      // 'e' / 'E' is part of exponent notation, allow in numbers
      if ((ch === 'e' || ch === 'E') && buf.length > 0) {
        buf += ch
        continue
      }
      if (buf.length > 0) {
        const n = Number(buf)
        if (Number.isFinite(n)) out.push(n)
        buf = ''
      }
      out.push(ch)
    } else if (ch === '-' || ch === '+') {
      // A sign starts a new number unless it's part of an exponent.
      const prev = buf[buf.length - 1]
      if (buf.length > 0 && prev !== 'e' && prev !== 'E') {
        const n = Number(buf)
        if (Number.isFinite(n)) out.push(n)
        buf = ch
      } else {
        buf += ch
      }
    } else if (ch === ' ' || ch === ',' || ch === '\n' || ch === '\t' || ch === '\r') {
      if (buf.length > 0) {
        const n = Number(buf)
        if (Number.isFinite(n)) out.push(n)
        buf = ''
      }
    } else if (ch === '.') {
      // A second '.' inside a number starts a new number.
      if (buf.includes('.')) {
        const n = Number(buf)
        if (Number.isFinite(n)) out.push(n)
        buf = '.'
      } else {
        buf += ch
      }
    } else {
      buf += ch
    }
  }
  if (buf.length > 0) {
    const n = Number(buf)
    if (Number.isFinite(n)) out.push(n)
  }
  return out
}

/**
 * Convert ParsedSvg into the existing `SewingPiece` shape so the tiled
 * print pipeline can consume freesewing output without forking. Each
 * ParsedPart becomes one SewingPiece; multiple `<path>`s inside a part
 * are concatenated into a single polyline (sufficient for clipping).
 */
export function parsedSvgToPieces(parsed: ParsedSvg): SewingPiece[] {
  const out: SewingPiece[] = []
  for (const part of parsed.parts) {
    // Concatenate every path into a single polyline. The pipeline only
    // uses pathPoints for line-by-line clipping; the closing segments
    // already arrived as Z-emitted points so no need to re-close here.
    const pathPoints: SewingPieceVertex[] = []
    for (const poly of part.paths) {
      pathPoints.push(...poly)
    }
    if (pathPoints.length < 2) continue
    // Synthetic grainline running vertically through the part centroid.
    const cx = pathPoints.reduce((acc, p) => acc + p.x, 0) / pathPoints.length
    const minY = pathPoints.reduce(
      (acc, p) => (p.y < acc ? p.y : acc),
      pathPoints[0]!.y,
    )
    const maxY = pathPoints.reduce(
      (acc, p) => (p.y > acc ? p.y : acc),
      pathPoints[0]!.y,
    )
    out.push({
      name: part.name,
      cut: 1,
      fold: null,
      grainDirection: 'lengthwise',
      pathPoints,
      grainline: {
        from: { x: cx, y: minY + 10 },
        to: { x: cx, y: maxY - 10 },
      },
      notchPoints: [],
      onFoldEdge: null,
      label: part.name,
    })
  }
  return out
}
