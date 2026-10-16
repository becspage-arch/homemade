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

const PER_SEG_DEFAULT = 4

export interface MotifView {
  /** A hero stage, or 'wall' (renderer-only, motifs r9): an upright wall hanging shot straight on. */
  stage?: HeroStage | 'wall'
  /** HANG the motif (r9, the garland): engine +y up becomes the scene's up and
   *  the relief faces the camera, so the piece hangs upright on the wall stage
   *  with its cords straight down. Default false = the flat-lay from above. */
  hang?: boolean
  /** Lift of the hung piece's lowest point above the sideboard (mm). */
  liftMm?: number
  /** Fine-cotton render tune (renderer `fibreTune`, additive): r9 tints the
   *  white sheen toward the dye so dusty rose renders dusty rose. */
  fibreTune?: Record<string, number | string>
  /** Camera off straight down (deg); a flat-lay wants ~24-34. */
  tiltDeg?: number
  /** Stage zoom (< 1 = closer); the set's own framing is for a toy. */
  stageZoom?: number
  yawDeg?: number
  resY?: number
  twist?: number
  /** Turn the motif in its plane (deg) before staging. */
  spinDeg?: number
  /** Camera yaw (deg); the default set is 14. */
  yaw?: number
  /** Smoothing subdivisions per strand segment (default 4). A big assembly
   *  (the garland: ~170 strokes) takes 2 so the render fits the probe task's 8 GB (r9: 180 strokes at 4 = 105 MB of scene, OOM; r8's 49 MB rendered). */
  perSeg?: number
}

/** A smooth non-yarn notion in the scene (the renderer's ellipsoid props): a
 *  driftwood stick a garland hangs from. Centre and three semi-axis vectors in
 *  engine mm (engine +y up, as the pieces are posed). */
export interface MotifProp {
  centre?: V3
  axes?: [V3, V3, V3]
  /** A bark-covered branch (the renderer's `branch` prop, spiral trees r11):
   *  a polyline of points with a radius each, engine mm. */
  branch?: { p: V3; r: number }[]
  hex: string
  gloss?: number
}

/** The fine-cotton tune the motifs render with (r9): the sheen tinted to the
 *  dye and eased, so #7a4a5a reads as a deep dusty rose and not the same
 *  clean pink as #946070. Passed as the renderer's `fibreTune`; other heroes
 *  do not carry it, so they are unchanged. */
export const MOTIF_FIBRE_TUNE: Record<string, number> = { sheen: 0.35, sheen_tint_mix: 0.6 } // r9's 0.85 overshot: burgundy roses, orange berries

export function motifScene(m: BuiltMotif, o: MotifView = {}, props: MotifProp[] = []) {
  const twist = o.twist ?? 0.06
  const PER_SEG = o.perSeg ?? PER_SEG_DEFAULT
  const spin = ((o.spinDeg ?? 0) * Math.PI) / 180
  const cs = Math.cos(spin), sn = Math.sin(spin)
  const strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[] = []
  // Engine → scene: spin in the plane, then either the flat-lay (engine +y to
  // the bottom of the frame, relief up) or HUNG (engine +y up = scene z, the
  // relief toward the camera = scene +y, which the renderer puts on the
  // camera's side of the piece).
  const hang = o.hang ?? false
  const sp3 = (p: V3): V3 => {
    const x = p.x * cs - p.y * sn, y = p.x * sn + p.y * cs
    return hang ? { x, y: p.z, z: y } : { x, y: -y, z: p.z }
  }
  for (const piece of m.pieces) {
    // The renderer shows the engine's +y toward the bottom of the frame (a
    // motif posed upright — a heart's dip, a butterfly's head — came out upside
    // down and mirrored in round 1), so the scene is written with y flipped.
    const ctrl: V3[] = posedPoints(piece).map((p) => sp3(p))
    const center = smooth(ctrl, PER_SEG)
    const { radiusMm, filaments } = pliedFilaments(center, m.yr * 0.85, 3, twist)
    const path = piece.built.strandPath
    const colourAt = (k: number): string => piece.colourOf(path[Math.min(Math.floor(k / PER_SEG), path.length - 1)]!)
    // One stroke per piece and colour run, each holding exactly its own plies.
    // (Round 5 merged every same-colour piece into one stroke: the renderer's
    // fine-cotton path takes a stroke's equal-length filaments as the plies of
    // ONE strand and averages them into a centreline, so a daisy's eight
    // identical petals rendered as one white dome, the vine's leaves as a
    // green one. Strokes with more than one strand's plies are split here.)
    for (const s of colourStrokes(center, filaments, radiusMm, colourAt)) {
      const nPly = filaments.length
      for (let a = 0; a < s.filaments.length; a += nPly) strokes.push({ ...s, filaments: s.filaments.slice(a, a + nPly) })
    }
  }
  const tilt = o.tiltDeg ?? (hang ? 86 : 28)
  // Props are written with the same spin and flip as the strokes.
  const sp = (p: V3): [number, number, number] => { const q = sp3(p); return [q.x, q.y, q.z] }
  const spAxis = (a: V3): [number, number, number] => {
    const x = a.x * cs - a.y * sn, y = a.x * sn + a.y * cs
    return hang ? [x, a.z, y] : [x, -y, a.z]
  }
  const propsOut = props.map((pr) => pr.branch
    ? { branch: pr.branch.map((b) => [...sp(b.p), b.r]), hex: pr.hex }
    : { centre: sp(pr.centre!), axes: pr.axes!.map(spAxis), hex: pr.hex, gloss: pr.gloss ?? 0.35 })
  return {
    fabric: { widthMm: m.sizeMm.width + 20, heightMm: m.sizeMm.height + 20, hex: strokes[0]?.hex ?? '#ffffff' },
    strokes,
    ...(propsOut.length ? { props: propsOut } : {}),
    fibre: m.yarnFibre,
    ...(o.fibreTune ? { fibreTune: o.fibreTune } : {}),
    view: {
      bgHex: '#efece6',
      marginFactor: 0.1,
      tiltDeg: tilt,
      resY: o.resY ?? 1200,
      openFabric: true,
      yawDeg: o.yawDeg ?? o.yaw ?? (hang ? 0 : 14),
      // A hung piece is aimed at its middle height, a flat-lay just above the table.
      aimHeightFrac: hang ? 0.62 : 0.08, // r11: at 0.5 the hanging sat high in the square frame over a quarter of empty sideboard
      lightRig: 'product' as const,
      groundScale: hang ? 40 : 16,
      stage: o.stage ?? (hang ? 'wall' : ('linen' as HeroStage)),
      stageTiltDeg: tilt,
      stageZoom: o.stageZoom ?? (hang ? 1.1 : 1.4),
      ...(hang ? { liftMm: o.liftMm ?? 90, stageHeightMm: m.sizeMm.height, stageFstop: 0.4 } : {}),
    },
  }
}
