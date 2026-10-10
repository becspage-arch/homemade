/**
 * A motif → the Blender scene JSON loom_render_crochet.py renders (the same
 * schema programScene/compositionScene write): each piece's relaxed, posed
 * strand smoothed and plied ONCE, then cut into per-colour strokes, on a
 * styled stage (linen by default) as a flat-lay from above.
 *
 * Render-only: nothing here touches the geometry or the audit.
 */

import { colourStrokes } from '../programScene'
import { pliedFilaments, smooth, type V3 } from '../../yarnLoop'
import type { HeroStage } from '../../../render/blenderScene'
import { posedPoints } from './common'
import type { BuiltMotif } from './types'

const PER_SEG = 4

export interface MotifView {
  stage?: HeroStage
  /** Camera off straight down (deg); a flat-lay wants ~24-34. */
  tiltDeg?: number
  /** Stage zoom (< 1 = closer); the set's own framing is for a toy. */
  stageZoom?: number
  yawDeg?: number
  resY?: number
  twist?: number
  /** Turn the motif in its plane (deg) before staging. */
  spinDeg?: number
}

export function motifScene(m: BuiltMotif, o: MotifView = {}) {
  const twist = o.twist ?? 0.06
  const spin = ((o.spinDeg ?? 0) * Math.PI) / 180
  const cs = Math.cos(spin), sn = Math.sin(spin)
  const strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[] = []
  for (const piece of m.pieces) {
    const ctrl: V3[] = posedPoints(piece).map((p) => ({ x: p.x * cs - p.y * sn, y: p.x * sn + p.y * cs, z: p.z }))
    const center = smooth(ctrl, PER_SEG)
    const { radiusMm, filaments } = pliedFilaments(center, m.yr * 0.85, 3, twist)
    const path = piece.built.strandPath
    const colourAt = (k: number): string => piece.colourOf(path[Math.min(Math.floor(k / PER_SEG), path.length - 1)]!)
    for (const s of colourStrokes(center, filaments, radiusMm, colourAt)) {
      const same = strokes.find((t) => t.hex === s.hex)
      if (same) same.filaments.push(...s.filaments)
      else strokes.push(s)
    }
  }
  const tilt = o.tiltDeg ?? 28
  return {
    fabric: { widthMm: m.sizeMm.width + 20, heightMm: m.sizeMm.height + 20, hex: strokes[0]?.hex ?? '#ffffff' },
    strokes,
    fibre: m.yarnFibre,
    view: {
      bgHex: '#efece6',
      marginFactor: 0.1,
      tiltDeg: tilt,
      resY: o.resY ?? 1200,
      openFabric: true,
      yawDeg: o.yawDeg ?? 14,
      aimHeightFrac: 0.08,
      lightRig: 'product' as const,
      groundScale: 16,
      stage: o.stage ?? ('linen' as HeroStage),
      stageTiltDeg: tilt,
      stageZoom: o.stageZoom ?? 1.4,
    },
  }
}
