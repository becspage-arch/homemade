// SPDX-License-Identifier: MIT
// Bottoms archetypes: pencil skirt, flared skirt, trousers, wrap pants.

import { curveLine, dashedLine, n, seamLine, silhouette, type SilPoint } from './geometry'
import type { RenderResult } from './types'

// ── skirt-pencil (Slim pencil skirt) ────────────────────────────────
// Fitted skirt with curved dart hints + back vent.

export function renderSkirtPencil(): RenderResult {
  const viewH = 560
  const top = -viewH / 2
  const bot = viewH / 2
  const waistHalf = 110
  const hipHalf = 145
  const hemHalf = 130
  const hipY = top + 100

  function buildSil(): SilPoint[] {
    return [
      { x: waistHalf, y: top, outHandle: null },
      { x: hipHalf, y: hipY,
        inHandle: null,
        outHandle: { x: hipHalf - 4, y: hipY + (bot - hipY) * 0.35 } },
      { x: hemHalf, y: bot,
        inHandle: { x: hemHalf + 4, y: hipY + (bot - hipY) * 0.6 },
        outHandle: null },
      { x: -hemHalf, y: bot, inHandle: null,
        outHandle: { x: -(hemHalf + 4), y: hipY + (bot - hipY) * 0.6 } },
      { x: -hipHalf, y: hipY,
        inHandle: { x: -(hipHalf - 4), y: hipY + (bot - hipY) * 0.35 },
        outHandle: null },
      { x: -waistHalf, y: top, inHandle: null, outHandle: null },
    ]
  }
  const path = silhouette(buildSil())
  // Waistband seam.
  const waistband = seamLine(-waistHalf, top + 14, waistHalf, top + 14)
  // Front dart hints (left + right).
  const dartFL = curveLine(`M ${n(-46)} ${n(top + 14)} L ${n(-40)} ${n(top + 90)} L ${n(-34)} ${n(top + 14)}`, 0.8)
  const dartFR = curveLine(`M ${n(46)} ${n(top + 14)} L ${n(40)} ${n(top + 90)} L ${n(34)} ${n(top + 14)}`, 0.8)
  const front = `<path d="${path}" />\n  ${waistband}\n  ${dartFL}\n  ${dartFR}`

  // Back: centre back seam + zip hint at top + vent at bottom.
  const cb = dashedLine(0, top + 14, 0, bot - 80)
  // Back vent: solid line splitting the bottom of the centre back seam.
  const vent = `<line x1="0" y1="${n(bot - 80)}" x2="0" y2="${n(bot - 4)}" stroke-width="1.1" />`
  const dartBL = curveLine(`M ${n(-50)} ${n(top + 14)} L ${n(-44)} ${n(top + 100)} L ${n(-38)} ${n(top + 14)}`, 0.8)
  const dartBR = curveLine(`M ${n(50)} ${n(top + 14)} L ${n(44)} ${n(top + 100)} L ${n(38)} ${n(top + 14)}`, 0.8)
  const back = `<path d="${path}" />\n  ${waistband}\n  ${cb}\n  ${vent}\n  ${dartBL}\n  ${dartBR}`
  return { front, back, viewHeightPx: viewH }
}

// ── skirt-flared (Sandy circle skirt) ───────────────────────────────
// Full flared skirt with a sweep curve at the hem.

export function renderSkirtFlared(): RenderResult {
  const viewH = 620
  const top = -viewH / 2
  const bot = viewH / 2
  const waistHalf = 90
  const hemHalf = 240

  // The hem is a gentle sweep — curves up at the side seams, dips at
  // centre. Use a subtle smile / sweep curve.
  const hemSweep = 16

  function buildSil(): SilPoint[] {
    return [
      { x: waistHalf, y: top, outHandle: null },
      { x: hemHalf, y: bot - hemSweep,
        inHandle: { x: waistHalf + 14, y: top + viewH * 0.4 },
        outHandle: { x: hemHalf - 20, y: bot - 2 } },
      { x: 0, y: bot + 4,
        inHandle: { x: hemHalf - 60, y: bot + 8 },
        outHandle: { x: -(hemHalf - 60), y: bot + 8 } },
      { x: -hemHalf, y: bot - hemSweep,
        inHandle: { x: -(hemHalf - 20), y: bot - 2 },
        outHandle: { x: -(waistHalf + 14), y: top + viewH * 0.4 } },
      { x: -waistHalf, y: top, inHandle: null,
        outHandle: null },
    ]
  }
  const path = silhouette(buildSil())
  // Waistband seam.
  const waistband = seamLine(-waistHalf, top + 14, waistHalf, top + 14)
  const front = `<path d="${path}" />\n  ${waistband}`

  // Back: centre back seam (often zippered).
  const cb = dashedLine(0, top + 14, 0, bot - 10)
  const back = `<path d="${path}" />\n  ${waistband}\n  ${cb}`
  return { front, back, viewHeightPx: viewH }
}

// ── trousers (Charlie chinos, Titan block) ──────────────────────────

export interface TrousersProps {
  viewH: number
  waistHalf: number
  hipHalf: number
  thighHalf: number
  kneeHalf: number
  cuffHalf: number
  /** Show fly front + belt loops + back pockets. */
  variant: 'chinos' | 'block' | 'wrap'
}

export const TROUSERS_DEFAULTS: TrousersProps = {
  viewH: 880,
  waistHalf: 105,
  hipHalf: 140,
  thighHalf: 110,
  kneeHalf: 75,
  cuffHalf: 68,
  variant: 'chinos',
}

export function renderTrousers(overrides: Partial<TrousersProps> = {}): RenderResult {
  const p = { ...TROUSERS_DEFAULTS, ...overrides }
  const top = -p.viewH / 2
  const bot = p.viewH / 2
  const hipY = top + 130
  const crotchY = top + 240
  const kneeY = top + 540

  function buildSil(): SilPoint[] {
    return [
      { x: p.waistHalf, y: top, outHandle: null },
      // Right side seam at hip.
      { x: p.hipHalf, y: hipY,
        inHandle: null,
        outHandle: { x: p.hipHalf - 2, y: hipY + 140 } },
      // Right side seam at knee.
      { x: p.kneeHalf, y: kneeY,
        inHandle: { x: p.thighHalf + 2, y: crotchY + 200 },
        outHandle: { x: p.kneeHalf, y: kneeY + 80 } },
      // Right hem outer.
      { x: p.cuffHalf, y: bot,
        inHandle: { x: p.cuffHalf, y: bot - 60 },
        outHandle: null },
      // Right hem inner.
      { x: 4, y: bot, inHandle: null,
        outHandle: { x: 8, y: bot - 80 } },
      // Right inseam at knee.
      { x: 10, y: kneeY,
        inHandle: { x: 14, y: bot - 200 },
        outHandle: { x: 12, y: kneeY - 100 } },
      // Crotch.
      { x: 0, y: crotchY,
        inHandle: { x: 14, y: crotchY + 50 },
        outHandle: { x: -14, y: crotchY + 50 } },
      // Left inseam at knee.
      { x: -10, y: kneeY,
        inHandle: { x: -12, y: kneeY - 100 },
        outHandle: { x: -14, y: bot - 200 } },
      // Left hem inner.
      { x: -4, y: bot, inHandle: null,
        outHandle: null },
      // Left hem outer.
      { x: -p.cuffHalf, y: bot, inHandle: null,
        outHandle: { x: -p.cuffHalf, y: bot - 60 } },
      // Left side seam knee.
      { x: -p.kneeHalf, y: kneeY,
        inHandle: { x: -p.kneeHalf, y: kneeY + 80 },
        outHandle: { x: -(p.thighHalf + 2), y: crotchY + 200 } },
      // Left side seam hip.
      { x: -p.hipHalf, y: hipY,
        inHandle: { x: -(p.hipHalf - 2), y: hipY + 140 },
        outHandle: null },
      // Left waist.
      { x: -p.waistHalf, y: top, inHandle: null, outHandle: null },
    ]
  }
  const path = silhouette(buildSil())
  // Waistband.
  const waistband = seamLine(-p.waistHalf, top + 16, p.waistHalf, top + 16)
  // Fly front zip.
  const fly = p.variant === 'wrap'
    ? `<path d="M ${n(-p.waistHalf + 6)} ${n(top + 16)} L ${n(p.waistHalf - 6)} ${n(top + 16)}" stroke-width="0.9" />`
    : `<path d="M ${n(8)} ${n(top + 16)} Q ${n(14)} ${n(top + 60)}, ${n(8)} ${n(top + 110)}" stroke-width="0.9" />`
  // Belt loops (chinos only).
  const beltLoops: string[] = []
  if (p.variant === 'chinos') {
    for (const x of [-80, -30, 30, 80]) {
      beltLoops.push(`<line x1="${n(x)}" y1="${n(top)}" x2="${n(x)}" y2="${n(top + 22)}" stroke-width="0.8" />`)
    }
  }
  // Front in-seam pockets (slits).
  const pocketL = `<path d="M ${n(-p.waistHalf + 14)} ${n(top + 26)} Q ${n(-p.hipHalf + 30)} ${n(hipY)}, ${n(-p.hipHalf + 6)} ${n(hipY + 30)}" stroke-width="0.9" />`
  const pocketR = `<path d="M ${n(p.waistHalf - 14)} ${n(top + 26)} Q ${n(p.hipHalf - 30)} ${n(hipY)}, ${n(p.hipHalf - 6)} ${n(hipY + 30)}" stroke-width="0.9" />`
  const front = `<path d="${path}" />\n  ${waistband}\n  ${fly}\n  ${beltLoops.join('\n  ')}\n  ${p.variant !== 'wrap' ? pocketL : ''}\n  ${p.variant !== 'wrap' ? pocketR : ''}`

  // Back: centre back seam + welt pockets.
  const cb = dashedLine(0, top + 16, 0, crotchY)
  const weltL = `<rect x="${n(-100)}" y="${n(top + 80)}" width="${n(60)}" height="${n(10)}" stroke-width="0.8" />`
  const weltR = `<rect x="${n(40)}" y="${n(top + 80)}" width="${n(60)}" height="${n(10)}" stroke-width="0.8" />`
  const back = `<path d="${path}" />\n  ${waistband}\n  ${cb}\n  ${p.variant === 'chinos' ? weltL : ''}\n  ${p.variant === 'chinos' ? weltR : ''}`
  return { front, back, viewHeightPx: p.viewH }
}

// ── trousers-wrap (Waralee) ────────────────────────────────────────

export function renderTrousersWrap(): RenderResult {
  const base = renderTrousers({
    variant: 'wrap',
    viewH: 880,
    waistHalf: 130,
    hipHalf: 165,
    thighHalf: 150,
    kneeHalf: 140,
    cuffHalf: 130,
  })
  // Add the wrap overlap line + tie hint on the front view.
  const wrapLine = `<path d="M ${n(0)} ${n(-440)} L ${n(60)} ${n(-410)} L ${n(60)} ${n(-330)}" stroke-width="0.9" />`
  const tie = `<path d="M ${n(80)} ${n(-420)} Q ${n(150)} ${n(-450)}, ${n(190)} ${n(-380)}" stroke-width="0.9" />`
  return {
    front: `${base.front}\n  ${wrapLine}\n  ${tie}`,
    back: base.back,
    viewHeightPx: base.viewHeightPx,
  }
}
