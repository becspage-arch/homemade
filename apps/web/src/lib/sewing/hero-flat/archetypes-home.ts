// SPDX-License-Identifier: MIT
// Home + soft furnishings archetypes.
// Most home items are rectangles with small detail differences (mitred
// corners, binding, flap on the back). The shared base shape is a
// rounded rectangle; per-archetype detail rides on top.

import { dashedLine, n, seamLine } from './geometry'
import type { RenderResult } from './types'

function rect(x: number, y: number, w: number, h: number, r = 3): string {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" ry="${r}" />`
}

// ── pillowcase (housewife french seam) ───────────────────────────────

export function renderPillowcase(): RenderResult {
  const viewH = 380
  const w = 460
  const h = 280
  const left = -w / 2
  const top = -h / 2
  const body = rect(left, top, w, h, 4)
  const seamInset = `<rect x="${n(left + 8)}" y="${n(top + 8)}" width="${n(w - 16)}" height="${n(h - 16)}" stroke-dasharray="2 4" stroke-width="0.7" />`
  const front = `${body}\n  ${seamInset}`

  // Back: housewife flap. Vertical seam at one third in from the right.
  const flapX = left + w * 0.65
  const flapHem = `<line x1="${n(flapX)}" y1="${n(top + 6)}" x2="${n(flapX)}" y2="${n(top + h - 6)}" stroke-width="1.1" />`
  const flapTopstitch = `<line x1="${n(flapX + 6)}" y1="${n(top + 10)}" x2="${n(flapX + 6)}" y2="${n(top + h - 10)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  const back = `${body}\n  ${seamInset}\n  ${flapHem}\n  ${flapTopstitch}`
  return { front, back, viewHeightPx: viewH }
}

// ── cushion (envelope back) ──────────────────────────────────────────

export function renderCushion(): RenderResult {
  const viewH = 360
  const size = 330
  const body = rect(-size / 2, -size / 2, size, size, 4)
  const seamInset = `<rect x="${n(-size / 2 + 8)}" y="${n(-size / 2 + 8)}" width="${n(size - 16)}" height="${n(size - 16)}" stroke-dasharray="2 4" stroke-width="0.7" />`
  const front = `${body}\n  ${seamInset}`
  // Back: envelope flap overlap shown as a horizontal seam.
  const flapY = 24
  const flapLine = `<line x1="${n(-size / 2 + 6)}" y1="${n(flapY)}" x2="${n(size / 2 - 6)}" y2="${n(flapY)}" stroke-width="1.1" />`
  const flapTopstitch = `<line x1="${n(-size / 2 + 6)}" y1="${n(flapY + 6)}" x2="${n(size / 2 - 6)}" y2="${n(flapY + 6)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  const back = `${body}\n  ${seamInset}\n  ${flapLine}\n  ${flapTopstitch}`
  return { front, back, viewHeightPx: viewH }
}

// ── tea-towel (mitred corners) ──────────────────────────────────────

export function renderTeaTowel(): RenderResult {
  const viewH = 480
  const w = 280
  const h = 460
  const left = -w / 2
  const top = -h / 2
  const body = rect(left, top, w, h, 4)
  // Mitred corner diagonals.
  const miter = 18
  const mitres = [
    `<line x1="${n(left)}" y1="${n(top + miter)}" x2="${n(left + miter)}" y2="${n(top)}" stroke-width="0.9" />`,
    `<line x1="${n(left + w)}" y1="${n(top + miter)}" x2="${n(left + w - miter)}" y2="${n(top)}" stroke-width="0.9" />`,
    `<line x1="${n(left)}" y1="${n(top + h - miter)}" x2="${n(left + miter)}" y2="${n(top + h)}" stroke-width="0.9" />`,
    `<line x1="${n(left + w)}" y1="${n(top + h - miter)}" x2="${n(left + w - miter)}" y2="${n(top + h)}" stroke-width="0.9" />`,
  ].join('\n  ')
  // Hem inset border.
  const hem = `<rect x="${n(left + 10)}" y="${n(top + 10)}" width="${n(w - 20)}" height="${n(h - 20)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  // Hanging loop.
  const loop = `<path d="M ${n(left + 18)} ${n(top + 4)} Q ${n(left + 22)} ${n(top - 20)}, ${n(left + 40)} ${n(top - 20)} Q ${n(left + 58)} ${n(top - 20)}, ${n(left + 50)} ${n(top + 4)}" stroke-width="0.9" />`
  const front = `${body}\n  ${mitres}\n  ${hem}\n  ${loop}`
  const back = `${body}\n  ${mitres}\n  ${hem}`
  return { front, back, viewHeightPx: viewH }
}

// ── table-runner (mitred border) ────────────────────────────────────

export function renderTableRunner(): RenderResult {
  const viewH = 520
  const w = 200
  const h = 500
  const left = -w / 2
  const top = -h / 2
  const body = rect(left, top, w, h, 4)
  const border = `<rect x="${n(left + 14)}" y="${n(top + 14)}" width="${n(w - 28)}" height="${n(h - 28)}" stroke-width="0.9" />`
  const front = `${body}\n  ${border}`
  const back = body
  return { front, back, viewHeightPx: viewH }
}

// ── throw-blanket (binding) ─────────────────────────────────────────

export function renderThrowBlanket(): RenderResult {
  const viewH = 460
  const w = 420
  const h = 420
  const left = -w / 2
  const top = -h / 2
  const body = rect(left, top, w, h, 6)
  const binding = `<rect x="${n(left + 10)}" y="${n(top + 10)}" width="${n(w - 20)}" height="${n(h - 20)}" stroke-width="1" />`
  // Topstitch inside the binding.
  const stitch = `<rect x="${n(left + 18)}" y="${n(top + 18)}" width="${n(w - 36)}" height="${n(h - 36)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  const front = `${body}\n  ${binding}\n  ${stitch}`
  const back = front
  return { front, back, viewHeightPx: viewH }
}

// ── baby-blanket (mitred binding) ───────────────────────────────────

export function renderBabyBlanket(): RenderResult {
  // Same as throw blanket but smaller and squarer.
  const viewH = 380
  const size = 340
  const body = rect(-size / 2, -size / 2, size, size, 6)
  const binding = `<rect x="${n(-size / 2 + 12)}" y="${n(-size / 2 + 12)}" width="${n(size - 24)}" height="${n(size - 24)}" stroke-width="1" />`
  const stitch = `<rect x="${n(-size / 2 + 20)}" y="${n(-size / 2 + 20)}" width="${n(size - 40)}" height="${n(size - 40)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  // Mitred corner diagonals.
  const miter = 14
  const mitres = [
    `<line x1="${n(-size / 2 + 12)}" y1="${n(-size / 2 + 12 + miter)}" x2="${n(-size / 2 + 12 + miter)}" y2="${n(-size / 2 + 12)}" stroke-width="0.9" />`,
    `<line x1="${n(size / 2 - 12)}" y1="${n(-size / 2 + 12 + miter)}" x2="${n(size / 2 - 12 - miter)}" y2="${n(-size / 2 + 12)}" stroke-width="0.9" />`,
    `<line x1="${n(-size / 2 + 12)}" y1="${n(size / 2 - 12 - miter)}" x2="${n(-size / 2 + 12 + miter)}" y2="${n(size / 2 - 12)}" stroke-width="0.9" />`,
    `<line x1="${n(size / 2 - 12)}" y1="${n(size / 2 - 12 - miter)}" x2="${n(size / 2 - 12 - miter)}" y2="${n(size / 2 - 12)}" stroke-width="0.9" />`,
  ].join('\n  ')
  const front = `${body}\n  ${binding}\n  ${stitch}\n  ${mitres}`
  const back = front
  return { front, back, viewHeightPx: viewH }
}

// ── curtain-rod-pocket ──────────────────────────────────────────────

export function renderCurtainRodPocket(): RenderResult {
  const viewH = 720
  const w = 240
  const h = 680
  const left = -w / 2
  const top = -h / 2
  const body = rect(left, top, w, h, 4)
  // Rod pocket header — top hem with a parallel line.
  const headerSeam = seamLine(left + 6, top + 30, left + w - 6, top + 30)
  const headerTop = seamLine(left + 6, top + 8, left + w - 6, top + 8)
  // Bottom hem.
  const bottomHem = dashedLine(left + 6, top + h - 24, left + w - 6, top + h - 24, '2 3', 0.7)
  // Side hem.
  const sideHemL = dashedLine(left + 10, top + 36, left + 10, top + h - 30, '2 3', 0.7)
  const sideHemR = dashedLine(left + w - 10, top + 36, left + w - 10, top + h - 30, '2 3', 0.7)
  // Gentle fold lines (curtain gathers) — three vertical wavy lines.
  const folds: string[] = []
  for (const x of [-50, 0, 50]) {
    folds.push(`<path d="M ${n(x)} ${n(top + 40)} Q ${n(x + 6)} ${n(top + 200)}, ${n(x)} ${n(top + 360)} T ${n(x)} ${n(top + h - 30)}" stroke-width="0.7" />`)
  }
  const front = `${body}\n  ${headerSeam}\n  ${headerTop}\n  ${bottomHem}\n  ${sideHemL}\n  ${sideHemR}\n  ${folds.join('\n  ')}`
  const back = `${body}\n  ${headerSeam}\n  ${bottomHem}`
  return { front, back, viewHeightPx: viewH }
}

// ── curtain-eyelet ──────────────────────────────────────────────────

export function renderCurtainEyelet(): RenderResult {
  const viewH = 720
  const w = 240
  const h = 680
  const left = -w / 2
  const top = -h / 2
  const body = rect(left, top, w, h, 4)
  // Header band.
  const header = seamLine(left + 6, top + 36, left + w - 6, top + 36)
  // Eyelet rings.
  const eyelets: string[] = []
  const yE = top + 20
  for (let i = 0; i < 5; i++) {
    const x = left + 30 + (i * (w - 60)) / 4
    eyelets.push(`<circle cx="${n(x)}" cy="${n(yE)}" r="9" stroke-width="1" />`)
    eyelets.push(`<circle cx="${n(x)}" cy="${n(yE)}" r="5" stroke-width="0.8" />`)
  }
  const bottomHem = dashedLine(left + 6, top + h - 24, left + w - 6, top + h - 24, '2 3', 0.7)
  const folds: string[] = []
  for (const x of [-60, -20, 20, 60]) {
    folds.push(`<path d="M ${n(x)} ${n(top + 40)} Q ${n(x + 4)} ${n(top + 220)}, ${n(x)} ${n(top + 400)} T ${n(x)} ${n(top + h - 30)}" stroke-width="0.7" />`)
  }
  const front = `${body}\n  ${header}\n  ${eyelets.join('\n  ')}\n  ${bottomHem}\n  ${folds.join('\n  ')}`
  const back = `${body}\n  ${header}\n  ${bottomHem}`
  return { front, back, viewHeightPx: viewH }
}

// ── apron (kitchen cross-back + kids one-size) ──────────────────────

export function renderApron(): RenderResult {
  const viewH = 720
  // Bib + waistband + skirt. Symmetric front.
  const bibTop = -360
  const bibBottom = -120
  const bibHalf = 90
  const waistHalfTop = 130
  const skirtHalf = 220
  const skirtBottom = 300

  const front = `
    <path d="M ${n(-bibHalf)} ${n(bibTop)}
             L ${n(bibHalf)} ${n(bibTop)}
             L ${n(bibHalf)} ${n(bibBottom)}
             L ${n(waistHalfTop)} ${n(bibBottom)}
             L ${n(skirtHalf)} ${n(skirtBottom)}
             L ${n(-skirtHalf)} ${n(skirtBottom)}
             L ${n(-waistHalfTop)} ${n(bibBottom)}
             L ${n(-bibHalf)} ${n(bibBottom)} Z" />
    <line x1="${n(-waistHalfTop)}" y1="${n(bibBottom)}" x2="${n(waistHalfTop)}" y2="${n(bibBottom)}" stroke-width="1" />
    <path d="M ${n(-bibHalf)} ${n(bibTop)} Q ${n(-160)} ${n(bibTop - 80)}, ${n(-220)} ${n(bibTop - 60)}" stroke-width="1" />
    <path d="M ${n(bibHalf)} ${n(bibTop)} Q ${n(160)} ${n(bibTop - 80)}, ${n(220)} ${n(bibTop - 60)}" stroke-width="1" />
    <path d="M ${n(-waistHalfTop)} ${n(bibBottom + 4)} Q ${n(-220)} ${n(bibBottom + 20)}, ${n(-260)} ${n(bibBottom + 40)}" stroke-width="1" />
    <path d="M ${n(waistHalfTop)} ${n(bibBottom + 4)} Q ${n(220)} ${n(bibBottom + 20)}, ${n(260)} ${n(bibBottom + 40)}" stroke-width="1" />
    <rect x="${n(-skirtHalf + 8)}" y="${n(skirtBottom - 14)}" width="${n(skirtHalf * 2 - 16)}" height="${n(6)}" stroke-dasharray="2 3" stroke-width="0.7" />
  `

  // Back: cross-back straps from waistband going up to opposite shoulder.
  const back = `
    <path d="M ${n(-waistHalfTop)} ${n(bibBottom)}
             L ${n(waistHalfTop)} ${n(bibBottom)}
             L ${n(skirtHalf)} ${n(skirtBottom)}
             L ${n(-skirtHalf)} ${n(skirtBottom)} Z" />
    <path d="M ${n(-waistHalfTop + 20)} ${n(bibBottom)} Q ${n(-30)} ${n(bibTop + 40)}, ${n(bibHalf + 30)} ${n(bibTop - 10)}" stroke-width="1.1" />
    <path d="M ${n(waistHalfTop - 20)} ${n(bibBottom)} Q ${n(30)} ${n(bibTop + 40)}, ${n(-bibHalf - 30)} ${n(bibTop - 10)}" stroke-width="1.1" />
    <path d="M ${n(-waistHalfTop)} ${n(bibBottom + 4)} Q ${n(-220)} ${n(bibBottom + 20)}, ${n(-260)} ${n(bibBottom + 40)}" stroke-width="1" />
    <path d="M ${n(waistHalfTop)} ${n(bibBottom + 4)} Q ${n(220)} ${n(bibBottom + 20)}, ${n(260)} ${n(bibBottom + 40)}" stroke-width="1" />
  `
  return { front, back, viewHeightPx: viewH }
}

// ── pot-holder-set (one pot holder + one mitt) ──────────────────────

export function renderPotHolderSet(): RenderResult {
  const viewH = 380
  // Two side-by-side items.
  const front = `
    <rect x="${n(-180)}" y="${n(-110)}" width="${n(140)}" height="${n(220)}" rx="10" ry="10" />
    <rect x="${n(-172)}" y="${n(-100)}" width="${n(124)}" height="${n(200)}" stroke-dasharray="2 3" stroke-width="0.7" />
    <circle cx="${n(-110)}" cy="${n(-130)}" r="14" stroke-width="0.9" />
    <path d="M ${n(40)} ${n(-110)}
             L ${n(160)} ${n(-110)}
             L ${n(180)} ${n(40)}
             Q ${n(180)} ${n(110)}, ${n(100)} ${n(110)}
             Q ${n(40)} ${n(110)}, ${n(40)} ${n(40)}
             Z" />
    <path d="M ${n(110)} ${n(-110)}
             Q ${n(180)} ${n(-40)}, ${n(180)} ${n(40)}" stroke-width="0.9" />
    <path d="M ${n(100)} ${n(-130)} Q ${n(120)} ${n(-150)}, ${n(140)} ${n(-130)}" stroke-width="0.9" />
  `
  const back = front
  return { front, back, viewHeightPx: viewH }
}

// ── lampshade-drum ───────────────────────────────────────────────────

export function renderLampshadeDrum(): RenderResult {
  const viewH = 360
  const topR = 140
  const botR = 140
  const halfH = 130
  // Trapezoidal silhouette (slightly tapered for drum shape).
  const body = `<path d="M ${n(-topR)} ${n(-halfH)}
             L ${n(topR)} ${n(-halfH)}
             L ${n(botR)} ${n(halfH)}
             L ${n(-botR)} ${n(halfH)} Z" />`
  // Top + bottom ellipses (depth hint).
  const topEll = `<ellipse cx="0" cy="${n(-halfH)}" rx="${n(topR)}" ry="${n(18)}" />`
  const botEll = `<ellipse cx="0" cy="${n(halfH)}" rx="${n(botR)}" ry="${n(18)}" />`
  const front = `${body}\n  ${topEll}\n  ${botEll}`
  const back = front
  return { front, back, viewHeightPx: viewH }
}
