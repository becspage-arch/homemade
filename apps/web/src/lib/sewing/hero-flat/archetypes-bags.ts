// SPDX-License-Identifier: MIT
// Bag archetypes. Front = bag silhouette with closure / handle.
// Back = same silhouette with no closure detail (or a secondary handle).

import { dashedLine, n } from './geometry'
import type { RenderResult } from './types'

// ── bag-tote ──────────────────────────────────────────────────────────

export function renderBagTote(): RenderResult {
  const viewH = 500
  const top = -viewH / 2 + 80
  const bottom = viewH / 2
  const sideX = 170
  const handleHalf = 80
  const handlePeakY = top - 110
  const handleW = 18

  const body = `<rect x="${n(-sideX)}" y="${n(top)}" width="${n(sideX * 2)}" height="${n(bottom - top)}" rx="3" ry="3" />`
  // Two arched handles, outer + inner curves to give thickness.
  const handleOuter = `<path d="M ${n(-handleHalf)} ${n(top)} C ${n(-handleHalf - 4)} ${n(handlePeakY + 30)}, ${n(-handleHalf + handleW - 4)} ${n(handlePeakY - 4)}, ${n(-handleHalf + handleW)} ${n(handlePeakY + 4)} L ${n(handleHalf - handleW)} ${n(handlePeakY + 4)} C ${n(handleHalf - handleW + 4)} ${n(handlePeakY - 4)}, ${n(handleHalf + 4)} ${n(handlePeakY + 30)}, ${n(handleHalf)} ${n(top)}" />`
  // Top hem topstitch.
  const topStitch = dashedLine(-sideX + 8, top + 12, sideX - 8, top + 12, '2 3', 0.7)
  // Handle attachment X-box (right + left).
  function xBox(xLeft: number): string {
    return [
      `<rect x="${n(xLeft)}" y="${n(top + 4)}" width="${n(handleW)}" height="${n(18)}" stroke-width="0.8" />`,
      `<line x1="${n(xLeft)}" y1="${n(top + 4)}" x2="${n(xLeft + handleW)}" y2="${n(top + 22)}" stroke-width="0.8" />`,
      `<line x1="${n(xLeft + handleW)}" y1="${n(top + 4)}" x2="${n(xLeft)}" y2="${n(top + 22)}" stroke-width="0.8" />`,
    ].join('\n  ')
  }
  const xL = xBox(-handleHalf)
  const xR = xBox(handleHalf - handleW)
  const front = `${body}\n  ${handleOuter}\n  ${topStitch}\n  ${xL}\n  ${xR}`
  const back = `${body}\n  ${handleOuter}\n  ${topStitch}\n  ${xL}\n  ${xR}`
  return { front, back, viewHeightPx: viewH }
}

// ── bag-drawstring (Drawstring storage, project bag, simple backpack) ─

export function renderBagDrawstring(): RenderResult {
  const viewH = 540
  const top = -viewH / 2 + 50
  const bottom = viewH / 2
  const sideX = 150

  // Body. Slight curve at top hint of gathered drawstring opening.
  const body = `<path d="M ${n(-sideX)} ${n(top + 14)} L ${n(-sideX)} ${n(bottom)} L ${n(sideX)} ${n(bottom)} L ${n(sideX)} ${n(top + 14)} Q 0 ${n(top - 4)}, ${n(-sideX)} ${n(top + 14)} Z" />`
  // Drawstring channel.
  const channel = dashedLine(-sideX + 6, top + 22, sideX - 6, top + 22, '2 3', 0.7)
  // Drawstring cords emerging from top.
  const cordL = `<path d="M ${n(-40)} ${n(top + 12)} Q ${n(-80)} ${n(top - 30)}, ${n(-60)} ${n(top - 70)}" stroke-width="0.9" />`
  const cordR = `<path d="M ${n(40)} ${n(top + 12)} Q ${n(80)} ${n(top - 30)}, ${n(60)} ${n(top - 70)}" stroke-width="0.9" />`
  // Cord ends.
  const knotL = `<circle cx="${n(-60)}" cy="${n(top - 70)}" r="3" fill="black" stroke="none" />`
  const knotR = `<circle cx="${n(60)}" cy="${n(top - 70)}" r="3" fill="black" stroke="none" />`
  const front = `${body}\n  ${channel}\n  ${cordL}\n  ${cordR}\n  ${knotL}\n  ${knotR}`
  const back = `${body}\n  ${channel}`
  return { front, back, viewHeightPx: viewH }
}

// ── bag-pouch-zip (Pencil case, makeup pouch) ────────────────────────

export function renderBagPouchZip(): RenderResult {
  const viewH = 300
  const top = -viewH / 2 + 20
  const bot = viewH / 2 - 20
  const sideX = 200

  const body = `<rect x="${n(-sideX)}" y="${n(top)}" width="${n(sideX * 2)}" height="${n(bot - top)}" rx="14" ry="14" />`
  // Zip across the top.
  const zipLine = `<line x1="${n(-sideX + 16)}" y1="${n(top + 16)}" x2="${n(sideX - 16)}" y2="${n(top + 16)}" stroke-width="0.9" />`
  const zipTeeth = `<line x1="${n(-sideX + 16)}" y1="${n(top + 16)}" x2="${n(sideX - 16)}" y2="${n(top + 16)}" stroke-dasharray="2 2" stroke-width="0.7" />`
  // Zip pull on the right.
  const zipPull = `<rect x="${n(sideX - 28)}" y="${n(top + 8)}" width="${n(20)}" height="${n(16)}" rx="3" ry="3" stroke-width="0.8" />`
  const front = `${body}\n  ${zipLine}\n  ${zipTeeth}\n  ${zipPull}`
  const back = body
  return { front, back, viewHeightPx: viewH }
}

// ── bag-backpack (Simple drawstring backpack) ───────────────────────

export function renderBagBackpack(): RenderResult {
  const viewH = 580
  const top = -viewH / 2 + 60
  const bot = viewH / 2
  const sideX = 145

  const body = `<path d="M ${n(-sideX)} ${n(top + 8)} L ${n(-sideX)} ${n(bot)} L ${n(sideX)} ${n(bot)} L ${n(sideX)} ${n(top + 8)} Q 0 ${n(top - 12)}, ${n(-sideX)} ${n(top + 8)} Z" />`
  // Drawstring channel.
  const channel = dashedLine(-sideX + 6, top + 18, sideX - 6, top + 18, '2 3', 0.7)
  // Straps emerging from top of body + crossing down to bottom corners.
  const strapL = `<path d="M ${n(-30)} ${n(top + 6)} Q ${n(-130)} ${n(top + 60)}, ${n(-sideX + 4)} ${n(bot - 6)}" stroke-width="0.9" />`
  const strapR = `<path d="M ${n(30)} ${n(top + 6)} Q ${n(130)} ${n(top + 60)}, ${n(sideX - 4)} ${n(bot - 6)}" stroke-width="0.9" />`
  const cordL = `<path d="M ${n(-30)} ${n(top + 12)} Q ${n(-60)} ${n(top - 50)}, ${n(-50)} ${n(top - 80)}" stroke-width="0.9" />`
  const cordR = `<path d="M ${n(30)} ${n(top + 12)} Q ${n(60)} ${n(top - 50)}, ${n(50)} ${n(top - 80)}" stroke-width="0.9" />`
  const front = `${body}\n  ${channel}\n  ${strapL}\n  ${strapR}\n  ${cordL}\n  ${cordR}`
  // Back: same straps visible (they go around the body), no drawstring.
  const back = `${body}\n  ${channel}\n  ${strapL}\n  ${strapR}`
  return { front, back, viewHeightPx: viewH }
}

// ── bag-bucket (Bucket bag, magnetic closure) ───────────────────────

export function renderBagBucket(): RenderResult {
  const viewH = 540
  const top = -viewH / 2 + 50
  const bot = viewH / 2
  const topHalf = 110
  const botHalf = 145

  const body = `<path d="M ${n(-topHalf)} ${n(top + 10)} L ${n(-botHalf)} ${n(bot)} L ${n(botHalf)} ${n(bot)} L ${n(topHalf)} ${n(top + 10)} Q 0 ${n(top - 4)}, ${n(-topHalf)} ${n(top + 10)} Z" />`
  // Top opening with magnetic closure dot.
  const topStitch = dashedLine(-topHalf + 4, top + 18, topHalf - 4, top + 18, '2 3', 0.7)
  const closure = `<circle cx="0" cy="${n(top + 14)}" r="4" stroke-width="0.9" />`
  // Carry handle arch.
  const handle = `<path d="M ${n(-70)} ${n(top + 6)} Q 0 ${n(top - 90)}, ${n(70)} ${n(top + 6)}" stroke-width="1.1" />`
  const front = `${body}\n  ${topStitch}\n  ${closure}\n  ${handle}`
  const back = `${body}\n  ${topStitch}\n  ${handle}`
  return { front, back, viewHeightPx: viewH }
}

// ── bag-sling (Sling bag) ────────────────────────────────────────────

export function renderBagSling(): RenderResult {
  const viewH = 460
  const top = -viewH / 2 + 40
  const bot = viewH / 2
  const sideX = 175

  // Slightly trapezoidal body.
  const body = `<path d="M ${n(-sideX + 16)} ${n(top + 6)} L ${n(-sideX)} ${n(bot)} L ${n(sideX)} ${n(bot)} L ${n(sideX - 16)} ${n(top + 6)} Q 0 ${n(top - 18)}, ${n(-sideX + 16)} ${n(top + 6)} Z" />`
  // Zipper top.
  const zipper = `<line x1="${n(-sideX + 22)}" y1="${n(top + 12)}" x2="${n(sideX - 22)}" y2="${n(top + 12)}" stroke-dasharray="2 2" stroke-width="0.8" />`
  // Adjustable sling strap looped from top-right down across to bottom-left.
  const strap = `<path d="M ${n(sideX - 30)} ${n(top + 4)} Q ${n(sideX + 60)} ${n(top - 80)}, ${n(sideX + 80)} ${n(top - 180)}" stroke-width="1.1" />`
  // Strap continues to body bottom-left in real life — we just hint at it.
  const strapEnd = `<path d="M ${n(-sideX + 24)} ${n(top + 4)} Q ${n(-sideX - 30)} ${n(top - 60)}, ${n(-sideX - 16)} ${n(top - 140)}" stroke-width="1.1" />`
  // Adjustable buckle hint.
  const buckle = `<rect x="${n(sideX + 30)}" y="${n(top - 100)}" width="${n(20)}" height="${n(14)}" stroke-width="0.8" />`
  const front = `${body}\n  ${zipper}\n  ${strap}\n  ${strapEnd}\n  ${buckle}`
  const back = `${body}\n  ${zipper}\n  ${strap}\n  ${strapEnd}`
  return { front, back, viewHeightPx: viewH }
}
