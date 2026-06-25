/**
 * The stitch decision. Each segmented region is read as one of four worked
 * shapes and assigned a CONTROLLED stitch slug from the 94-stitch dictionary,
 * guided by the thread-painting look bar:
 *
 *   point  (small round blob)        -> French knot      — berries, centres, dots
 *   line   (thin, elongated)         -> stem / back      — stems, outlines, veins
 *   wheel  (round, mid, solid, lone) -> woven wheel      — rose / flower centres
 *   fill   (everything else)         -> long-and-short   — painterly shaded areas
 *                                       (satin for small solid shapes)
 *
 * Only slugs the loom renders well are emitted, so every assigned stitch draws
 * truthfully. The geometry stays in working px here; `assemble` scales to mm.
 */

import type { Region } from './segment'
import { regionContour, regionCenterlines } from './contour'

export type StitchRole = 'point' | 'line' | 'wheel' | 'fill'

export interface ClassifiedRegion {
  region: Region
  role: StitchRole
  /** Controlled stitch slug, e.g. 'long-and-short' (no craft prefix here). */
  stitchSlug: string
  stitchName: string
  /** Plain-English area label for the legend, e.g. 'stems and outlines'. */
  area: string
  /** Geometry in working px (assemble scales to mm). */
  geomPx:
    | { kind: 'point'; at: [number, number] }
    | { kind: 'line'; points: [number, number][] }
    | { kind: 'wheel'; at: [number, number]; radiusPx: number }
    | { kind: 'fill'; points: [number, number][] }
  /** Stitch direction for fills, degrees; null for the rest. */
  directionDeg: number | null
}

const STITCH_NAMES: Record<string, string> = {
  'french-knot': 'French knot',
  seed: 'Seed stitch',
  stem: 'Stem stitch',
  back: 'Back stitch',
  straight: 'Straight stitch',
  'woven-wheel': 'Woven wheel',
  satin: 'Satin stitch',
  'long-and-short': 'Long and short stitch',
}

export interface ClassifyOptions {
  workW: number
  workH: number
}

/**
 * Classify every region into a worked stitch with geometry. Needs the source
 * width to walk skeletons/contours. Order of tests: point -> line -> wheel ->
 * fill, most specific first.
 */
export function classifyAll(regions: Region[], srcWidth: number, opts: ClassifyOptions): ClassifiedRegion[] {
  const u = Math.max(opts.workW, opts.workH) / 100
  const out: ClassifiedRegion[] = []
  for (const region of regions) {
    const { area, elongation, fillRatio, meanWidth } = region

    // POINT — a small, roughly round blob (a knot-sized dot).
    if (area <= (u * 3.0) ** 2 && elongation < 2 && meanWidth < u * 3.0) {
      out.push({
        region,
        role: 'point',
        stitchSlug: 'french-knot',
        stitchName: STITCH_NAMES['french-knot']!,
        area: 'dotted details and centres',
        geomPx: { kind: 'point', at: [region.cx, region.cy] },
        directionDeg: null,
      })
      continue
    }

    // LINE — thin and elongated, OR wispy/hollow (a ring or outline network).
    // fillRatio is the key guard: a closed outline (low fill) must NOT be
    // scanline-filled into a solid blob — it is stitched as its centreline.
    // Emit EVERY skeleton branch so an outline keeps all its strokes. meanWidth
    // protects a solid petal (wide + high fill) from being read as a line.
    const wispy = fillRatio < 0.34 && area > (u * 2.0) ** 2
    if ((meanWidth < u * 3.0 && elongation >= 2.0) || wispy) {
      const branches = regionCenterlines(region, srcWidth, 1.4, u * 1.5)
      if (branches.length > 0) {
        for (const pts of branches) {
          const long = pathLen(pts) > u * 10
          out.push({
            region,
            role: 'line',
            stitchSlug: long ? 'stem' : 'back',
            stitchName: long ? STITCH_NAMES['stem']! : STITCH_NAMES['back']!,
            area: 'stems, veins and outlines',
            geomPx: { kind: 'line', points: pts },
            directionDeg: null,
          })
        }
        continue
      }
      // Fall through to fill if the skeleton came back empty.
    }

    // WHEEL.
    if (elongation < 1.5 && fillRatio > 0.62 && area >= (u * 3.2) ** 2 && area <= (u * 11) ** 2) {
      const r = Math.sqrt(area / Math.PI)
      out.push({
        region,
        role: 'wheel',
        stitchSlug: 'woven-wheel',
        stitchName: STITCH_NAMES['woven-wheel']!,
        area: 'woven flower centres and roses',
        geomPx: { kind: 'wheel', at: [region.cx, region.cy], radiusPx: r * 0.95 },
        directionDeg: null,
      })
      continue
    }

    // FILL. Dilate the outline a touch so neighbouring colour blocks meet
    // instead of leaving a thread-gap of bare cloth between them.
    const contour = regionContour(region, srcWidth, 1.4, 2)
    if (contour.length >= 3) {
      const big = area >= (u * 12) ** 2
      out.push({
        region,
        role: 'fill',
        stitchSlug: big ? 'long-and-short' : 'satin',
        stitchName: big ? STITCH_NAMES['long-and-short']! : STITCH_NAMES['satin']!,
        area: big ? 'shaded fills' : 'solid shapes',
        geomPx: { kind: 'fill', points: contour },
        // Stitches run ACROSS the short axis (perpendicular to the long axis),
        // the natural fill direction for a petal or leaf.
        directionDeg: region.orientationDeg + 90,
      })
    }
  }
  return out
}

function pathLen(pts: [number, number][]): number {
  let l = 0
  for (let i = 1; i < pts.length; i++) {
    l += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1])
  }
  return l
}
