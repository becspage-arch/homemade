/**
 * Format-driven render: turn a pattern's bound stitch elements into thread
 * strokes. This is the loom's real entrypoint — it consumes the structured data
 * (geometry + stitch slug + colour + thread per element) that the Studio
 * produces for our own patterns, and dispatches each element by its CONTROLLED
 * stitch slug to the matching primitive. No hand-placement: the geometry and the
 * stitch come straight from the pattern.
 *
 * The stitch id drives the render mode:
 *   path  + embroidery-stem/back/straight/fern  -> a worked line
 *   point + embroidery-french-knot              -> a knot
 *   path  + embroidery-detached-chain           -> a lazy-daisy loop
 *   disc  + embroidery-ribbed-spider-web/woven-wheel -> a filled wheel
 */

import type { Vec2 } from '../core/vec'
import type { ThreadStroke, ThreadKind } from './thread'
import type { StitchContext } from '../stitches/types'
import { backStitch, stemStitch, straightStitch } from '../stitches/line'
import { satinBand, satinFillPolygon } from '../stitches/satin'
import { frenchKnot, lazyDaisy, wovenWheel } from '../stitches/detached'
import { fernStitch } from '../stitches/chain'

export interface StitchedGeom {
  kind: 'path' | 'point' | 'disc'
  points?: [number, number][]
  at?: [number, number]
  radiusMm?: number
}

export interface StitchedElement {
  stitchType: string // controlled slug, e.g. 'embroidery-stem'
  colourHex: string
  thread?: { type: string; weight: string } | null
  directionDeg?: number | null
  geometry: StitchedGeom
}

function threadKind(type: string | undefined): ThreadKind {
  if (type === 'perle') return 'perle-cotton'
  if (type === 'wool' || type === 'crewel') return 'crewel-wool'
  if (type === 'silk') return 'silk'
  if (type === 'metallic') return 'metallic'
  return 'stranded-cotton'
}

/** Base stitch name without the craft prefix. */
function baseSlug(slug: string): string {
  return slug.replace(/^embroidery-/, '')
}

export function patternToStrokes(
  elements: StitchedElement[],
  opts: { strands?: number; defaultThread?: { type: string; weight: string } | null } = {},
): ThreadStroke[] {
  const strands = opts.strands ?? 3
  let seed = 1
  const out: ThreadStroke[] = []
  for (const el of elements) {
    const thr = el.thread ?? opts.defaultThread ?? null
    const ctx: StitchContext = { kind: threadKind(thr?.type), hex: el.colourHex, strands, seed: seed++ }
    const g = el.geometry
    const pts: Vec2[] = (g.points ?? []).map(([x, y]) => ({ x, y }))
    const at: Vec2 | null = g.at ? { x: g.at[0], y: g.at[1] } : pts.length ? pts[0]! : null

    switch (baseSlug(el.stitchType)) {
      case 'stem':
      case 'outline':
        if (pts.length >= 2) out.push(...stemStitch(pts, ctx))
        break
      case 'back':
      case 'split':
      case 'running':
        if (pts.length >= 2) out.push(...backStitch(pts, ctx))
        break
      case 'straight':
        if (pts.length >= 2) out.push(...straightStitch(pts[0]!, pts[pts.length - 1]!, ctx))
        break
      case 'fern':
        if (pts.length >= 2) out.push(...fernStitch(pts, ctx))
        break
      case 'french-knot':
      case 'colonial-knot':
      case 'seed':
        if (at) out.push(...frenchKnot(at, ctx, { wraps: 1 }))
        break
      case 'detached-chain': {
        // A traced loop -> base = first point, tip = farthest point from base.
        if (pts.length >= 2 && at) {
          let tip = pts[0]!
          let best = -1
          for (const p of pts) {
            const d = (p.x - at.x) ** 2 + (p.y - at.y) ** 2
            if (d > best) {
              best = d
              tip = p
            }
          }
          out.push(...lazyDaisy(at, tip, ctx))
        }
        break
      }
      case 'ribbed-spider-web':
      case 'woven-wheel':
      case 'buttonhole-wheel': {
        const c = at ?? centroid(pts)
        const r = g.radiusMm ?? bboxRadius(pts)
        if (c && r > 0) out.push(...wovenWheel(c, r, ctx, { spokes: 9 }))
        break
      }
      case 'satin':
      case 'padded-satin':
      case 'long-and-short': {
        // A solid worked shape: pack parallel stitches across the whole closed
        // outline (real fill, clipped to the polygon), in the element's stitch
        // direction. This is what makes a filled petal/leaf read as stitched
        // colour, not a flat blob.
        if (pts.length >= 3) {
          const angle = el.directionDeg ?? satinAngle(pts)
          out.push(...satinFillPolygon(pts, ctx, { angleDeg: angle }))
        }
        break
      }
      case 'satin-band': {
        // Tapering band given two paired edges (leaf vein style).
        if (pts.length >= 4) {
          const half = Math.floor(pts.length / 2)
          const edgeA = pts.slice(0, half)
          const edgeB = pts.slice(half).reverse()
          out.push(...satinBand(edgeA, edgeB, ctx))
        }
        break
      }
      default:
        if (pts.length >= 2) out.push(...stemStitch(pts, ctx))
        else if (at) out.push(...frenchKnot(at, ctx))
    }
  }
  return out
}

/** Default satin direction: across the shape's short axis (perpendicular to its
 * longest extent), which is how a petal/leaf is normally filled. */
function satinAngle(pts: Vec2[]): number {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return maxX - minX >= maxY - minY ? 90 : 0
}

function centroid(pts: Vec2[]): Vec2 | null {
  if (!pts.length) return null
  let sx = 0
  let sy = 0
  for (const p of pts) {
    sx += p.x
    sy += p.y
  }
  return { x: sx / pts.length, y: sy / pts.length }
}

function bboxRadius(pts: Vec2[]): number {
  if (!pts.length) return 0
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return Math.max(maxX - minX, maxY - minY) / 2
}
