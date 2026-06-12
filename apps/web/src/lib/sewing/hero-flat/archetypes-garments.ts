// SPDX-License-Identifier: MIT
// Garment archetypes. Each renderer takes optional overrides and returns
// inner SVG markup for front + back views, plus the natural view height
// the twoViewSvg composer should scale to fit.
//
// Visual style (locked 2026-06-12 against Rebecca's reference flat):
//   * Pure black 1.5px stroke on transparent background.
//   * V or scoop neckline front, jewel / rounded neckline back.
//   * Smooth cubic-bezier silhouettes (no straight-line zigzag joints).
//   * Centre back seam shown dashed on the back view for fitted shapes.
//   * A-line skirts taper with a slight sweep at the hem.
//   * Minimal construction detail. Reads first as a silhouette.

import {
  curveLine, dashedLine, n, seamLine, silhouette, type SilPoint,
} from './geometry'
import type { RenderResult } from './types'

// ── bodice-fitted ──────────────────────────────────────────────────────
// Bella body block, Noble princess seam bodice. Sleeveless, waist length,
// fitted through the bust and waist. Front: V-neck. Back: jewel neckline
// with centre back seam.

export interface BodiceFittedProps {
  /** Total visual height of one view in px. */
  viewH: number
  /** Half-width at the shoulder seam end (HPS to shoulder point). */
  shoulderHalf: number
  /** Half-width at the bust line. */
  bustHalf: number
  /** Half-width at the waist line. */
  waistHalf: number
  /** Width across the front neckline opening (HPS to HPS). */
  neckHalf: number
  /** Depth of the V-neck below the shoulder line. */
  vDepthFront: number
  /** Depth of the rounded back neckline below the shoulder line. */
  scoopDepthBack: number
  /** Depth of the armhole curve below the shoulder line. */
  armholeDrop: number
}

export const BODICE_FITTED_DEFAULTS: BodiceFittedProps = {
  viewH: 540,
  shoulderHalf: 145,
  bustHalf: 165,
  waistHalf: 125,
  neckHalf: 48,
  vDepthFront: 110,
  scoopDepthBack: 26,
  armholeDrop: 175,
}

export function renderBodiceFitted(
  overrides: Partial<BodiceFittedProps> = {},
): RenderResult {
  const p = { ...BODICE_FITTED_DEFAULTS, ...overrides }
  const shoulderY = -p.viewH / 2
  const waistY = p.viewH / 2
  const armholeY = shoulderY + p.armholeDrop
  // Shoulder seam tilts down slightly from neck to shoulder point.
  const shoulderTipY = shoulderY + 8

  function buildSilhouette(neckDepth: number): SilPoint[] {
    // Walk clockwise starting from right side of front neckline.
    return [
      // Right HPS — neckline meets shoulder. The shoulder seam goes from
      // here out and slightly down to the shoulder point. inHandle is the
      // closing half of the V or scoop neckline curve.
      {
        x: p.neckHalf, y: shoulderY,
        inHandle: { x: p.neckHalf * 0.55, y: shoulderY + neckDepth * 0.4 },
        outHandle: null,
      },
      // Right shoulder point — top of armhole.
      {
        x: p.shoulderHalf, y: shoulderTipY,
        inHandle: null,
        outHandle: { x: p.shoulderHalf + 14, y: shoulderTipY + p.armholeDrop * 0.45 },
      },
      // Right side seam at the bust line — bottom of the armhole curve.
      {
        x: p.bustHalf, y: armholeY,
        inHandle: { x: p.bustHalf - 6, y: armholeY - 24 },
        outHandle: { x: p.bustHalf, y: armholeY + p.viewH * 0.18 },
      },
      // Right side seam at the waist line — fitted, nips inward.
      {
        x: p.waistHalf, y: waistY,
        inHandle: { x: p.waistHalf + 6, y: waistY - p.viewH * 0.12 },
        outHandle: null,
      },
      // Left side seam at the waist line — straight hem across.
      {
        x: -p.waistHalf, y: waistY,
        inHandle: null,
        outHandle: { x: -(p.waistHalf + 6), y: waistY - p.viewH * 0.12 },
      },
      // Left side seam at the bust line.
      {
        x: -p.bustHalf, y: armholeY,
        inHandle: { x: -p.bustHalf, y: armholeY + p.viewH * 0.18 },
        outHandle: { x: -(p.bustHalf - 6), y: armholeY - 24 },
      },
      // Left shoulder point.
      {
        x: -p.shoulderHalf, y: shoulderTipY,
        inHandle: { x: -(p.shoulderHalf + 14), y: shoulderTipY + p.armholeDrop * 0.45 },
        outHandle: null,
      },
      // Left HPS.
      {
        x: -p.neckHalf, y: shoulderY,
        inHandle: null,
        outHandle: { x: -p.neckHalf * 0.55, y: shoulderY + neckDepth * 0.4 },
      },
      // Centre of the neckline — bottom of the V (front) or scoop (back).
      // We need this as a smooth curve. Place a midpoint vertex at x=0.
      {
        x: 0, y: shoulderY + neckDepth,
        inHandle: { x: -p.neckHalf * 0.25, y: shoulderY + neckDepth },
        outHandle: { x: p.neckHalf * 0.25, y: shoulderY + neckDepth },
      },
      // Implicit close back to the right HPS — silhouette() adds it.
    ]
  }

  const frontPath = silhouette(buildSilhouette(p.vDepthFront))
  const backPath = silhouette(buildSilhouette(p.scoopDepthBack))

  // Construction lines.
  const frontExtras: string[] = []
  // Subtle bust dart hint from side seam to apex (right + left mirror).
  const apexX = p.bustHalf * 0.35
  const apexY = shoulderY + p.armholeDrop * 1.05
  frontExtras.push(
    curveLine(`M ${n(p.bustHalf - 4)} ${n(apexY - 14)} Q ${n(p.bustHalf - 30)} ${n(apexY)}, ${n(apexX)} ${n(apexY)}`),
  )
  frontExtras.push(
    curveLine(`M ${n(p.bustHalf - 4)} ${n(apexY + 14)} Q ${n(p.bustHalf - 30)} ${n(apexY)}, ${n(apexX)} ${n(apexY)}`),
  )
  frontExtras.push(
    curveLine(`M ${n(-(p.bustHalf - 4))} ${n(apexY - 14)} Q ${n(-(p.bustHalf - 30))} ${n(apexY)}, ${n(-apexX)} ${n(apexY)}`),
  )
  frontExtras.push(
    curveLine(`M ${n(-(p.bustHalf - 4))} ${n(apexY + 14)} Q ${n(-(p.bustHalf - 30))} ${n(apexY)}, ${n(-apexX)} ${n(apexY)}`),
  )

  const backExtras: string[] = []
  backExtras.push(
    dashedLine(0, shoulderY + p.scoopDepthBack + 6, 0, waistY - 4),
  )

  return {
    front: `<path d="${frontPath}" />\n  ${frontExtras.join('\n  ')}`,
    back: `<path d="${backPath}" />\n  ${backExtras.join('\n  ')}`,
    viewHeightPx: p.viewH,
  }
}

// ── top-set-in-sleeve ────────────────────────────────────────────────
// Brian + Bent body blocks, Diana draped top, Simon shirt (overridden),
// Huey hoodie (overridden). Set-in sleeve hung at the natural shoulder,
// hip-length straight body.

export interface TopSetInSleeveProps {
  viewH: number
  shoulderHalf: number
  chestHalf: number
  hipHalf: number
  /** Distance from shoulder seam to wrist along the sleeve. */
  sleeveLen: number
  /** Half-width at the biceps. */
  bicepsHalf: number
  /** Half-width at the cuff. */
  cuffHalf: number
  /** How much the sleeve drops outward from the shoulder before falling. */
  shoulderToSleeveOuter: number
  neckHalf: number
  neckDepthFront: number
  neckDepthBack: number
  armholeDrop: number
  /** Drop from the chest line at the armhole to the side seam waistline. */
  bodyLen: number
  /** Style variant for neckline + back yoke detail. */
  variant: 'mens-fitted' | 'womens-fitted' | 'tee' | 'knit-drape'
}

export const TOP_SET_IN_SLEEVE_DEFAULTS: TopSetInSleeveProps = {
  viewH: 700,
  shoulderHalf: 160,
  chestHalf: 190,
  hipHalf: 195,
  sleeveLen: 280,
  bicepsHalf: 95,
  cuffHalf: 60,
  shoulderToSleeveOuter: 14,
  neckHalf: 54,
  neckDepthFront: 50,
  neckDepthBack: 22,
  armholeDrop: 175,
  bodyLen: 360,
  variant: 'mens-fitted',
}

export function renderTopSetInSleeve(
  overrides: Partial<TopSetInSleeveProps> = {},
): RenderResult {
  const p = { ...TOP_SET_IN_SLEEVE_DEFAULTS, ...overrides }
  const shoulderY = -p.viewH / 2
  const hemY = shoulderY + p.armholeDrop + p.bodyLen
  const armholeY = shoulderY + p.armholeDrop
  const cuffY = shoulderY + p.sleeveLen
  // Outer sleeve point at the shoulder (where the sleeve cap meets the
  // sleeve outer edge — sits just outside the shoulder seam end).
  const sleeveTopX = p.shoulderHalf + p.shoulderToSleeveOuter
  const sleeveTopY = shoulderY + 12
  // Outer + inner cuff corners. Cuff tapers INWARD from the sleeve cap
  // by 0.4 of (biceps - cuff) — gives a natural tapered sleeve flat.
  const cuffOuterX = sleeveTopX - (p.bicepsHalf - p.cuffHalf) * 0.4
  const cuffInnerX = cuffOuterX - p.cuffHalf * 2

  function buildSilhouette(neckDepth: number): SilPoint[] {
    return [
      // Right HPS — inHandle closes the neckline curve from centre.
      { x: p.neckHalf, y: shoulderY,
        inHandle: { x: p.neckHalf * 0.55, y: shoulderY + neckDepth * 0.45 },
        outHandle: null },
      // Right shoulder point.
      {
        x: p.shoulderHalf, y: shoulderY + 8,
        inHandle: null,
        outHandle: { x: p.shoulderHalf + 6, y: shoulderY + 10 },
      },
      // Right sleeve top outer (cap end).
      {
        x: sleeveTopX, y: sleeveTopY,
        inHandle: { x: p.shoulderHalf + 8, y: shoulderY + 10 },
        outHandle: { x: sleeveTopX + 4, y: sleeveTopY + p.sleeveLen * 0.18 },
      },
      // Right cuff outer corner.
      {
        x: cuffOuterX, y: cuffY,
        inHandle: { x: cuffOuterX, y: cuffY - p.sleeveLen * 0.22 },
        outHandle: null,
      },
      // Right cuff inner corner — slight downward step (cuff opening).
      {
        x: cuffInnerX, y: cuffY + 4,
        inHandle: null,
        outHandle: { x: cuffInnerX + 6, y: cuffY - p.sleeveLen * 0.15 },
      },
      // Right armpit = where the sleeve seam meets the side seam at the
      // chest line. Sits at chestHalf, armholeY. The inHandle stays at
      // armpit y so the under-sleeve seam reads as a clean diagonal
      // from cuff inner up to armpit, no overshoot.
      {
        x: p.chestHalf, y: armholeY + 4,
        inHandle: { x: p.chestHalf - 6, y: armholeY - 2 },
        outHandle: { x: p.chestHalf + 2, y: armholeY + p.bodyLen * 0.45 },
      },
      // Right hem corner.
      {
        x: p.hipHalf, y: hemY,
        inHandle: { x: p.hipHalf - 2, y: armholeY + p.bodyLen * 0.6 },
        outHandle: null,
      },
      // Hem left corner.
      { x: -p.hipHalf, y: hemY, inHandle: null, outHandle: null },
      // Left armpit.
      {
        x: -p.chestHalf, y: armholeY + 4,
        inHandle: { x: -(p.hipHalf - 2), y: armholeY + p.bodyLen * 0.6 },
        outHandle: { x: -(p.chestHalf - 6), y: armholeY - 2 },
      },
      // Left cuff inner.
      {
        x: -cuffInnerX, y: cuffY + 4,
        inHandle: { x: -(cuffInnerX + 6), y: cuffY - p.sleeveLen * 0.15 },
        outHandle: null,
      },
      // Left cuff outer.
      {
        x: -cuffOuterX, y: cuffY,
        inHandle: null,
        outHandle: { x: -cuffOuterX, y: cuffY - p.sleeveLen * 0.22 },
      },
      // Left sleeve top outer.
      {
        x: -sleeveTopX, y: sleeveTopY,
        inHandle: { x: -(sleeveTopX + 4), y: sleeveTopY + p.sleeveLen * 0.18 },
        outHandle: { x: -(p.shoulderHalf + 8), y: shoulderY + 10 },
      },
      // Left shoulder point.
      {
        x: -p.shoulderHalf, y: shoulderY + 8,
        inHandle: { x: -(p.shoulderHalf + 6), y: shoulderY + 10 },
        outHandle: null,
      },
      // Left HPS.
      {
        x: -p.neckHalf, y: shoulderY,
        inHandle: null,
        outHandle: { x: -p.neckHalf * 0.55, y: shoulderY + neckDepth * 0.45 },
      },
      // Neckline centre.
      {
        x: 0, y: shoulderY + neckDepth,
        inHandle: { x: -p.neckHalf * 0.25, y: shoulderY + neckDepth },
        outHandle: { x: p.neckHalf * 0.25, y: shoulderY + neckDepth },
      },
    ]
  }

  const frontPath = silhouette(buildSilhouette(p.neckDepthFront))
  const backPath = silhouette(buildSilhouette(p.neckDepthBack))

  // Construction lines.
  const frontExtras: string[] = []
  // Armhole curve hint (subtle).
  frontExtras.push(
    curveLine(`M ${n(p.shoulderHalf)} ${n(shoulderY + 8)} Q ${n(p.shoulderHalf - 6)} ${n(armholeY)}, ${n(p.chestHalf)} ${n(armholeY + 4)}`),
  )
  frontExtras.push(
    curveLine(`M ${n(-p.shoulderHalf)} ${n(shoulderY + 8)} Q ${n(-(p.shoulderHalf - 6))} ${n(armholeY)}, ${n(-p.chestHalf)} ${n(armholeY + 4)}`),
  )
  // Cuff line (right + left).
  frontExtras.push(seamLine(cuffInnerX, cuffY + 4, cuffOuterX, cuffY))
  frontExtras.push(seamLine(-cuffInnerX, cuffY + 4, -cuffOuterX, cuffY))

  const backExtras: string[] = [...frontExtras]
  // Centre back seam for fitted variants.
  if (p.variant === 'mens-fitted' || p.variant === 'womens-fitted') {
    backExtras.push(dashedLine(0, shoulderY + p.neckDepthBack + 6, 0, hemY - 6))
  }
  // Back yoke seam (small curve across the upper back).
  if (p.variant === 'mens-fitted' || p.variant === 'tee') {
    const yokeY = shoulderY + p.armholeDrop * 0.45
    backExtras.push(
      curveLine(`M ${n(-(p.shoulderHalf - 6))} ${n(yokeY)} Q 0 ${n(yokeY - 8)}, ${n(p.shoulderHalf - 6)} ${n(yokeY)}`),
    )
  }

  return {
    front: `<path d="${frontPath}" />\n  ${frontExtras.join('\n  ')}`,
    back: `<path d="${backPath}" />\n  ${backExtras.join('\n  ')}`,
    viewHeightPx: p.viewH,
  }
}

// ── tank ──────────────────────────────────────────────────────────────
// Aaron knit A-shirt. Shoulder straps, deep scoop front, lower scoop
// back, dropped armhole, knit-drape hem.

export interface TankProps {
  viewH: number
  /** Distance from centre to the inner edge of the shoulder strap. */
  strapInnerX: number
  /** Strap width. */
  strapW: number
  chestHalf: number
  hipHalf: number
  neckDepthFront: number
  neckDepthBack: number
  armholeDrop: number
}

export const TANK_DEFAULTS: TankProps = {
  viewH: 580,
  strapInnerX: 38,
  strapW: 22,
  chestHalf: 160,
  hipHalf: 170,
  neckDepthFront: 130,
  neckDepthBack: 64,
  armholeDrop: 220,
}

export function renderTank(overrides: Partial<TankProps> = {}): RenderResult {
  const p = { ...TANK_DEFAULTS, ...overrides }
  const shoulderY = -p.viewH / 2
  const hemY = p.viewH / 2
  const armholeY = shoulderY + p.armholeDrop
  const strapOuterX = p.strapInnerX + p.strapW

  function buildSilhouette(neckDepth: number): SilPoint[] {
    return [
      // Right strap inner edge top — inHandle closes the neckline curve.
      { x: p.strapInnerX, y: shoulderY,
        inHandle: { x: p.strapInnerX * 0.55, y: shoulderY + neckDepth * 0.45 },
        outHandle: null },
      // Right strap outer corner.
      { x: strapOuterX, y: shoulderY + 4, inHandle: null,
        outHandle: { x: strapOuterX + 18, y: shoulderY + p.armholeDrop * 0.18 } },
      // Right armhole bottom = right side seam at chest. Control2 pulls
      // INWARD (toward centre) so the armhole curves as a clean scoop
      // rather than bulging outward.
      { x: p.chestHalf, y: armholeY,
        inHandle: { x: p.chestHalf - 14, y: armholeY - p.armholeDrop * 0.35 },
        outHandle: { x: p.chestHalf + 4, y: armholeY + (hemY - armholeY) * 0.4 } },
      // Right hem corner.
      { x: p.hipHalf, y: hemY,
        inHandle: { x: p.hipHalf - 2, y: hemY - (hemY - armholeY) * 0.35 },
        outHandle: null },
      // Hem left corner.
      { x: -p.hipHalf, y: hemY, inHandle: null },
      // Left armhole bottom.
      { x: -p.chestHalf, y: armholeY,
        inHandle: { x: -(p.hipHalf - 2), y: hemY - (hemY - armholeY) * 0.35 },
        outHandle: { x: -(p.chestHalf - 14), y: armholeY - p.armholeDrop * 0.35 } },
      // Left strap outer.
      { x: -strapOuterX, y: shoulderY + 4,
        inHandle: { x: -(strapOuterX + 18), y: shoulderY + p.armholeDrop * 0.18 },
        outHandle: null },
      // Left strap inner.
      { x: -p.strapInnerX, y: shoulderY, inHandle: null,
        outHandle: { x: -p.strapInnerX * 0.55, y: shoulderY + neckDepth * 0.45 } },
      // Neckline centre.
      { x: 0, y: shoulderY + neckDepth,
        inHandle: { x: -p.strapInnerX * 0.25, y: shoulderY + neckDepth },
        outHandle: { x: p.strapInnerX * 0.25, y: shoulderY + neckDepth } },
    ]
  }

  const frontPath = silhouette(buildSilhouette(p.neckDepthFront))
  const backPath = silhouette(buildSilhouette(p.neckDepthBack))

  // Hem topstitch on knit.
  const stitch = dashedLine(-p.hipHalf + 12, hemY - 6, p.hipHalf - 12, hemY - 6, '2 3', 0.6)
  return {
    front: `<path d="${frontPath}" />\n  ${stitch}`,
    back: `<path d="${backPath}" />\n  ${stitch}`,
    viewHeightPx: p.viewH,
  }
}

// ── shirt-button-down (Simon) ────────────────────────────────────────
// Inherits top-set-in-sleeve geometry. Adds collar, button placket, cuffs.

export function renderShirtButtonDown(): RenderResult {
  const base = renderTopSetInSleeve({
    variant: 'mens-fitted',
    shoulderHalf: 170,
    chestHalf: 200,
    hipHalf: 205,
    neckHalf: 56,
    neckDepthFront: 28,
    neckDepthBack: 16,
    sleeveLen: 320,
  })
  // Synthesise neck collar + placket + cuffs on top of the base silhouette.
  const collar = [
    // Collar stand (front view)
    `<path d="M ${n(-58)} ${n(-345)} Q 0 ${n(-360)}, ${n(58)} ${n(-345)} L ${n(58)} ${n(-330)} Q 0 ${n(-340)}, ${n(-58)} ${n(-330)} Z" stroke-width="1.2" />`,
    // Collar points
    `<path d="M ${n(-58)} ${n(-330)} L ${n(-90)} ${n(-300)} L ${n(-12)} ${n(-310)}" stroke-width="1.1" />`,
    `<path d="M ${n(58)} ${n(-330)} L ${n(90)} ${n(-300)} L ${n(12)} ${n(-310)}" stroke-width="1.1" />`,
  ].join('\n  ')
  const placket = `<line x1="0" y1="${n(-300)}" x2="0" y2="${n(180)}" stroke-dasharray="2 3" stroke-width="0.8" />`
  const buttons: string[] = []
  for (let i = 0; i < 6; i++) {
    const y = -260 + (i * 84)
    buttons.push(`<circle cx="0" cy="${n(y)}" r="2.2" fill="black" stroke="none" />`)
  }
  const front = `${base.front}\n  ${collar}\n  ${placket}\n  ${buttons.join('\n  ')}`

  // Back: collar visible plus back yoke seam already from the variant.
  const backCollar = `<path d="M ${n(-58)} ${n(-340)} Q 0 ${n(-352)}, ${n(58)} ${n(-340)} L ${n(58)} ${n(-326)} Q 0 ${n(-336)}, ${n(-58)} ${n(-326)} Z" stroke-width="1.2" />`
  const back = `${base.back}\n  ${backCollar}`
  return { front, back, viewHeightPx: base.viewHeightPx }
}

// ── hoodie (Huey) ────────────────────────────────────────────────────

export function renderHoodie(): RenderResult {
  const base = renderTopSetInSleeve({
    variant: 'mens-fitted',
    viewH: 740,
    shoulderHalf: 175,
    chestHalf: 215,
    hipHalf: 215,
    sleeveLen: 320,
    bicepsHalf: 110,
    cuffHalf: 68,
    neckHalf: 60,
    neckDepthFront: 18,
    neckDepthBack: 12,
  })
  // Hood drape behind the neckline.
  const hood = `<path d="M ${n(-90)} ${n(-360)} C ${n(-120)} ${n(-430)}, ${n(120)} ${n(-430)}, ${n(90)} ${n(-360)}" />`
  // Zip placket centre front + zipper teeth dashed.
  const zip = `<line x1="0" y1="${n(-352)}" x2="0" y2="${n(280)}" stroke-dasharray="3 2" stroke-width="0.8" />`
  // Kangaroo pocket (front-only).
  const pocket = `<path d="M ${n(-130)} ${n(70)} L ${n(-90)} ${n(50)} L ${n(90)} ${n(50)} L ${n(130)} ${n(70)} L ${n(120)} ${n(170)} L ${n(-120)} ${n(170)} Z" stroke-width="1" />`
  // Ribbed cuffs (zigzag line at the cuff).
  const ribbedCuff = (sx: number) =>
    `<path d="M ${n(sx + 4)} ${n(-58)} L ${n(sx + 32)} ${n(-50)} L ${n(sx + 4)} ${n(-42)} L ${n(sx + 32)} ${n(-34)}" stroke-width="0.8" />`
  // Drawstring at the hood opening.
  const drawstring = `<line x1="${n(-20)}" y1="${n(-352)}" x2="${n(-20)}" y2="${n(-280)}" stroke-width="0.8" /><line x1="${n(20)}" y1="${n(-352)}" x2="${n(20)}" y2="${n(-280)}" stroke-width="0.8" /><circle cx="${n(-20)}" cy="${n(-274)}" r="2" fill="black" stroke="none" /><circle cx="${n(20)}" cy="${n(-274)}" r="2" fill="black" stroke="none" />`
  const front = `${base.front}\n  ${hood}\n  ${zip}\n  ${pocket}\n  ${ribbedCuff(80)}\n  ${ribbedCuff(-110)}\n  ${drawstring}`
  const back = `${base.back}\n  ${hood}`
  return { front, back, viewHeightPx: base.viewHeightPx }
}

// ── coat (Carlita, Carlton) ─────────────────────────────────────────
// Long collared coat, double-breasted with welt pockets and back belt.

export function renderCoat(opts: { variant: 'womens' | 'mens' } = { variant: 'womens' }): RenderResult {
  const womens = opts.variant === 'womens'
  const base = renderTopSetInSleeve({
    variant: womens ? 'womens-fitted' : 'mens-fitted',
    viewH: 880,
    shoulderHalf: 175,
    chestHalf: 200,
    hipHalf: womens ? 240 : 215,
    sleeveLen: 360,
    bicepsHalf: 110,
    cuffHalf: 78,
    neckHalf: 58,
    neckDepthFront: 22,
    neckDepthBack: 16,
    armholeDrop: 175,
    bodyLen: 520,
  })
  // Notched lapel collar — two triangles meeting at the V-notch.
  const lapelL = `<path d="M ${n(-58)} ${n(-430)} L ${n(-100)} ${n(-300)} L ${n(-20)} ${n(-200)} L ${n(-14)} ${n(-260)} L ${n(-44)} ${n(-340)} Z" stroke-width="1.1" />`
  const lapelR = `<path d="M ${n(58)} ${n(-430)} L ${n(100)} ${n(-300)} L ${n(20)} ${n(-200)} L ${n(14)} ${n(-260)} L ${n(44)} ${n(-340)} Z" stroke-width="1.1" />`
  // Centre front line (double-breasted offset).
  const cf = `<line x1="-12" y1="${n(-200)}" x2="-12" y2="${n(360)}" stroke-width="0.9" />`
  // Welt chest pockets (small horizontal rectangles).
  const chestPocketL = `<rect x="${n(-150)}" y="${n(-160)}" width="${n(48)}" height="${n(8)}" stroke-width="0.9" />`
  const chestPocketR = `<rect x="${n(102)}" y="${n(-160)}" width="${n(48)}" height="${n(8)}" stroke-width="0.9" />`
  // Hip welt pockets.
  const hipPocketL = `<rect x="${n(-150)}" y="${n(80)}" width="${n(82)}" height="${n(12)}" stroke-width="0.9" />`
  const hipPocketR = `<rect x="${n(68)}" y="${n(80)}" width="${n(82)}" height="${n(12)}" stroke-width="0.9" />`
  // Button row (double-breasted = 2 columns).
  const buttons: string[] = []
  for (let i = 0; i < 4; i++) {
    const y = -120 + i * 110
    buttons.push(`<circle cx="${n(-44)}" cy="${n(y)}" r="2.5" fill="black" stroke="none" />`)
    buttons.push(`<circle cx="${n(44)}" cy="${n(y)}" r="2.5" fill="black" stroke="none" />`)
  }
  const front = `${base.front}\n  ${lapelL}\n  ${lapelR}\n  ${cf}\n  ${chestPocketL}\n  ${chestPocketR}\n  ${hipPocketL}\n  ${hipPocketR}\n  ${buttons.join('\n  ')}`

  // Back: collar curve + back belt across the waist.
  const backCollar = `<path d="M ${n(-70)} ${n(-435)} Q 0 ${n(-455)}, ${n(70)} ${n(-435)}" stroke-width="1.1" />`
  const backBelt = `<rect x="${n(-110)}" y="${n(-20)}" width="${n(220)}" height="${n(20)}" stroke-width="0.9" />`
  const backBeltBtn = `<circle cx="0" cy="${n(-10)}" r="2.5" fill="black" stroke="none" />`
  const back = `${base.back}\n  ${backCollar}\n  ${backBelt}\n  ${backBeltBtn}`
  return { front, back, viewHeightPx: base.viewHeightPx }
}

// ── corset (Cathrin underbust) ───────────────────────────────────────

export function renderCorset(): RenderResult {
  const viewH = 320
  const top = -viewH / 2
  const bot = viewH / 2
  const topHalf = 130
  const waistHalf = 100
  const hipHalf = 145

  function buildSil(): SilPoint[] {
    return [
      { x: topHalf, y: top, outHandle: null,
        inHandle: null },
      { x: waistHalf, y: 0,
        inHandle: { x: topHalf - 2, y: top + viewH * 0.35 },
        outHandle: { x: waistHalf + 6, y: viewH * 0.18 } },
      { x: hipHalf, y: bot,
        inHandle: { x: hipHalf - 6, y: viewH * 0.32 },
        outHandle: null },
      { x: -hipHalf, y: bot, inHandle: null,
        outHandle: { x: -(hipHalf - 6), y: viewH * 0.32 } },
      { x: -waistHalf, y: 0,
        inHandle: { x: -(waistHalf + 6), y: viewH * 0.18 },
        outHandle: { x: -(topHalf - 2), y: top + viewH * 0.35 } },
      { x: -topHalf, y: top, inHandle: null,
        outHandle: { x: -(topHalf - 4), y: top - 4 } },
      // Top edge curve dips slightly at centre.
      { x: 0, y: top + 12,
        inHandle: { x: -40, y: top + 4 },
        outHandle: { x: 40, y: top + 4 } },
    ]
  }
  const silPath = silhouette(buildSil())
  // Panel seams: 11 panels = 5 per side + centre front (front view) or
  // centre back lacing (back view).
  const panels: string[] = []
  for (let i = 1; i <= 5; i++) {
    const x = (topHalf * i) / 6
    panels.push(`<path d="M ${n(x)} ${n(top + 14)} Q ${n(x * 0.92)} 0, ${n(x)} ${n(bot - 6)}" stroke-width="0.9" />`)
    panels.push(`<path d="M ${n(-x)} ${n(top + 14)} Q ${n(-x * 0.92)} 0, ${n(-x)} ${n(bot - 6)}" stroke-width="0.9" />`)
  }
  const front = `<path d="${silPath}" />\n  ${panels.join('\n  ')}`

  // Back: lacing — vertical line of eyelet circles down centre.
  const lacing: string[] = []
  for (let i = 0; i < 8; i++) {
    const y = top + 18 + i * (viewH - 36) / 7
    lacing.push(`<circle cx="${n(-8)}" cy="${n(y)}" r="2.2" stroke-width="0.8" />`)
    lacing.push(`<circle cx="${n(8)}" cy="${n(y)}" r="2.2" stroke-width="0.8" />`)
  }
  // Crossing lace lines.
  const laces = `<path d="M ${n(-8)} ${n(top + 18)} L ${n(8)} ${n(top + 40)} L ${n(-8)} ${n(top + 62)} L ${n(8)} ${n(top + 84)} L ${n(-8)} ${n(top + 106)} L ${n(8)} ${n(top + 128)} L ${n(-8)} ${n(top + 150)} L ${n(8)} ${n(top + 172)} L ${n(-8)} ${n(top + 194)} L ${n(8)} ${n(top + 216)} L ${n(-8)} ${n(top + 238)} L ${n(8)} ${n(top + 260)} L ${n(-8)} ${n(top + 282)}" stroke-width="0.8" />`
  const back = `<path d="${silPath}" />\n  ${panels.join('\n  ')}\n  ${lacing.join('\n  ')}\n  ${laces}`
  return { front, back, viewHeightPx: viewH }
}

// ── bikini-top (Bee) ─────────────────────────────────────────────────

export function renderBikiniTop(): RenderResult {
  const viewH = 260
  const top = -viewH / 2
  // Two triangle cups joined by a band, with neck ties.
  const cupL = `<path d="M ${n(-150)} ${n(20)} Q ${n(-80)} ${n(-40)}, ${n(-10)} ${n(20)} L ${n(-30)} ${n(80)} L ${n(-130)} ${n(80)} Z" />`
  const cupR = `<path d="M ${n(150)} ${n(20)} Q ${n(80)} ${n(-40)}, ${n(10)} ${n(20)} L ${n(30)} ${n(80)} L ${n(130)} ${n(80)} Z" />`
  // Band.
  const band = `<rect x="${n(-150)}" y="${n(80)}" width="${n(300)}" height="${n(28)}" />`
  // Neck ties — curved bezier going up from cup top.
  const neckTieL = `<path d="M ${n(-100)} ${n(-30)} Q ${n(-150)} ${n(-100)}, ${n(-110)} ${n(top)}" stroke-width="1" />`
  const neckTieR = `<path d="M ${n(100)} ${n(-30)} Q ${n(150)} ${n(-100)}, ${n(110)} ${n(top)}" stroke-width="1" />`
  // Cup centre seam (front).
  const cupCentre = `<line x1="0" y1="${n(20)}" x2="0" y2="${n(80)}" stroke-width="0.9" />`
  const front = `${cupL}\n  ${cupR}\n  ${band}\n  ${neckTieL}\n  ${neckTieR}\n  ${cupCentre}`

  // Back: band only with back ties.
  const backBand = `<rect x="${n(-150)}" y="${n(80)}" width="${n(300)}" height="${n(28)}" />`
  const backTieL = `<path d="M ${n(-150)} ${n(94)} Q ${n(-220)} ${n(94)}, ${n(-200)} ${n(140)}" stroke-width="1" />`
  const backTieR = `<path d="M ${n(150)} ${n(94)} Q ${n(220)} ${n(94)}, ${n(200)} ${n(140)}" stroke-width="1" />`
  // Decorative back neck ties going up the back.
  const upTieL = `<path d="M ${n(-100)} ${n(80)} Q ${n(-150)} ${n(0)}, ${n(-110)} ${n(top)}" stroke-width="1" />`
  const upTieR = `<path d="M ${n(100)} ${n(80)} Q ${n(150)} ${n(0)}, ${n(110)} ${n(top)}" stroke-width="1" />`
  const back = `${backBand}\n  ${backTieL}\n  ${backTieR}\n  ${upTieL}\n  ${upTieR}`
  return { front, back, viewHeightPx: viewH }
}

// ── jumpsuit / one-piece (Onyx) ──────────────────────────────────────

export function renderJumpsuit(): RenderResult {
  const viewH = 860
  const top = -viewH / 2
  const bot = viewH / 2
  const shoulderHalf = 160
  const chestHalf = 195
  const waistHalf = 165
  const hipHalf = 195
  const legHalf = 90
  const neckHalf = 55
  const armholeY = top + 175
  const waistY = top + 380
  const crotchY = waistY + 60
  const hemY = bot

  function buildSil(neckDepth: number): SilPoint[] {
    return [
      { x: neckHalf, y: top, outHandle: null },
      { x: shoulderHalf, y: top + 8, inHandle: null,
        outHandle: { x: shoulderHalf + 14, y: top + 60 } },
      // Right armhole bottom.
      { x: chestHalf, y: armholeY,
        inHandle: { x: chestHalf + 10, y: armholeY - 50 },
        outHandle: { x: chestHalf, y: armholeY + (waistY - armholeY) * 0.45 } },
      // Right waist (slight nip).
      { x: waistHalf, y: waistY,
        inHandle: { x: waistHalf + 8, y: waistY - 40 },
        outHandle: { x: waistHalf + 6, y: waistY + 30 } },
      // Right hip.
      { x: hipHalf, y: crotchY + 30,
        inHandle: { x: hipHalf, y: crotchY },
        outHandle: { x: hipHalf - 4, y: hemY - 200 } },
      // Right hem.
      { x: legHalf + 22, y: hemY,
        inHandle: { x: hipHalf - 30, y: hemY - 100 },
        outHandle: null },
      // Right inseam top.
      { x: legHalf - 4, y: hemY, inHandle: null,
        outHandle: { x: legHalf - 20, y: hemY - 150 } },
      // Crotch.
      { x: 0, y: crotchY,
        inHandle: { x: legHalf - 30, y: crotchY + 30 },
        outHandle: { x: -(legHalf - 30), y: crotchY + 30 } },
      // Left inseam top.
      { x: -(legHalf - 4), y: hemY,
        inHandle: { x: -(legHalf - 20), y: hemY - 150 },
        outHandle: null },
      // Left hem.
      { x: -(legHalf + 22), y: hemY, inHandle: null,
        outHandle: { x: -(hipHalf - 30), y: hemY - 100 } },
      // Left hip.
      { x: -hipHalf, y: crotchY + 30,
        inHandle: { x: -(hipHalf - 4), y: hemY - 200 },
        outHandle: { x: -hipHalf, y: crotchY } },
      // Left waist.
      { x: -waistHalf, y: waistY,
        inHandle: { x: -(waistHalf + 6), y: waistY + 30 },
        outHandle: { x: -(waistHalf + 8), y: waistY - 40 } },
      // Left armhole bottom.
      { x: -chestHalf, y: armholeY,
        inHandle: { x: -chestHalf, y: armholeY + (waistY - armholeY) * 0.45 },
        outHandle: { x: -(chestHalf + 10), y: armholeY - 50 } },
      // Left shoulder.
      { x: -shoulderHalf, y: top + 8,
        inHandle: { x: -(shoulderHalf + 14), y: top + 60 },
        outHandle: null },
      // Left HPS.
      { x: -neckHalf, y: top, inHandle: null,
        outHandle: { x: -neckHalf * 0.55, y: top + neckDepth * 0.45 } },
      // Neckline centre.
      { x: 0, y: top + neckDepth,
        inHandle: { x: -neckHalf * 0.25, y: top + neckDepth },
        outHandle: { x: neckHalf * 0.25, y: top + neckDepth } },
    ]
  }
  const frontPath = silhouette(buildSil(60))
  const backPath = silhouette(buildSil(28))
  // Centre front zipper line.
  const zip = `<line x1="0" y1="${n(top + 60)}" x2="0" y2="${n(waistY - 4)}" stroke-dasharray="3 2" stroke-width="0.8" />`
  // Waistband seam (across the waist).
  const waistSeam = `<line x1="${n(-waistHalf + 4)}" y1="${n(waistY)}" x2="${n(waistHalf - 4)}" y2="${n(waistY)}" stroke-width="0.9" />`
  const front = `<path d="${frontPath}" />\n  ${zip}\n  ${waistSeam}`
  const backCentre = dashedLine(0, top + 28 + 8, 0, waistY)
  const back = `<path d="${backPath}" />\n  ${backCentre}\n  ${waistSeam}`
  return { front, back, viewHeightPx: viewH }
}

// ── kids-tshirt ──────────────────────────────────────────────────────

export function renderKidsTshirt(): RenderResult {
  return renderTopSetInSleeve({
    variant: 'tee',
    viewH: 520,
    shoulderHalf: 130,
    chestHalf: 150,
    hipHalf: 155,
    sleeveLen: 180,
    bicepsHalf: 78,
    cuffHalf: 60,
    shoulderToSleeveOuter: 8,
    neckHalf: 46,
    neckDepthFront: 36,
    neckDepthBack: 18,
    armholeDrop: 130,
    bodyLen: 260,
  })
}
