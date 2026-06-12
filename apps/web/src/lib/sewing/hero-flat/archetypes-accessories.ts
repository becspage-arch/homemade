// SPDX-License-Identifier: MIT
// Accessory archetypes. Many accessories have a "natural" view that is
// not really front/back distinct (a scrunchie is a ring, a belt is a
// flat strip). For these the back view shows the same silhouette so
// the flat reads as a tech-pack flat rather than an empty panel.

import { n, seamLine } from './geometry'
import type { RenderResult } from './types'

// ── headband (knit twist-front) ──────────────────────────────────────

export function renderHeadband(): RenderResult {
  const viewH = 220
  // Loop with knot at the front.
  const body = `<path d="M ${n(-160)} ${n(0)} Q ${n(-160)} ${n(-90)}, 0 ${n(-90)} Q ${n(160)} ${n(-90)}, ${n(160)} ${n(0)} Q ${n(160)} ${n(90)}, 0 ${n(90)} Q ${n(-160)} ${n(90)}, ${n(-160)} ${n(0)} Z" />`
  const inner = `<path d="M ${n(-130)} ${n(0)} Q ${n(-130)} ${n(-60)}, 0 ${n(-60)} Q ${n(130)} ${n(-60)}, ${n(130)} ${n(0)} Q ${n(130)} ${n(60)}, 0 ${n(60)} Q ${n(-130)} ${n(60)}, ${n(-130)} ${n(0)} Z" stroke-width="0.8" />`
  // Twist knot at front centre.
  const twistA = `<path d="M ${n(-30)} ${n(-50)} Q 0 ${n(-30)}, ${n(30)} ${n(-50)}" stroke-width="1" />`
  const twistB = `<path d="M ${n(-30)} ${n(-30)} Q 0 ${n(-50)}, ${n(30)} ${n(-30)}" stroke-width="1" />`
  const front = `${body}\n  ${inner}\n  ${twistA}\n  ${twistB}`
  const back = `${body}\n  ${inner}`
  return { front, back, viewHeightPx: viewH }
}

// ── scrunchie (hair scrunchie) ──────────────────────────────────────

export function renderScrunchie(): RenderResult {
  const viewH = 280
  // Doughnut shape with gathered fabric ruffles around the outer edge.
  const outer = `<circle cx="0" cy="0" r="120" />`
  const innerHole = `<circle cx="0" cy="0" r="36" />`
  // Ruffle gather hints.
  const ruffles: string[] = []
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2
    const x1 = Math.cos(ang) * 60
    const y1 = Math.sin(ang) * 60
    const x2 = Math.cos(ang) * 110
    const y2 = Math.sin(ang) * 110
    ruffles.push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke-width="0.7" />`)
  }
  const front = `${outer}\n  ${innerHole}\n  ${ruffles.join('\n  ')}`
  const back = front
  return { front, back, viewHeightPx: viewH }
}

// ── belt (D-ring closure) ───────────────────────────────────────────

export function renderBelt(): RenderResult {
  const viewH = 140
  const body = `<rect x="${n(-260)}" y="${n(-20)}" width="${n(520)}" height="${n(40)}" rx="4" ry="4" />`
  // Topstitch.
  const stitch = `<rect x="${n(-254)}" y="${n(-14)}" width="${n(508)}" height="${n(28)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  // D-rings on the right end.
  const dring1 = `<path d="M ${n(230)} ${n(-26)} L ${n(254)} ${n(-26)} Q ${n(280)} 0, ${n(254)} ${n(26)} L ${n(230)} ${n(26)}" stroke-width="1" />`
  const dring2 = `<path d="M ${n(238)} ${n(-22)} L ${n(258)} ${n(-22)} Q ${n(278)} 0, ${n(258)} ${n(22)} L ${n(238)} ${n(22)}" stroke-width="1" />`
  const front = `${body}\n  ${stitch}\n  ${dring1}\n  ${dring2}`
  const back = `${body}\n  ${stitch}`
  return { front, back, viewHeightPx: viewH }
}

// ── tie (men's standard) ────────────────────────────────────────────

export function renderTie(): RenderResult {
  const viewH = 700
  // Tied tie: knot at top, blade widening to a point at bottom.
  const knot = `<path d="M ${n(-26)} ${n(-340)} L ${n(26)} ${n(-340)} L ${n(38)} ${n(-300)} L ${n(40)} ${n(-260)} L ${n(-40)} ${n(-260)} L ${n(-38)} ${n(-300)} Z" />`
  const blade = `<path d="M ${n(-40)} ${n(-260)} L ${n(40)} ${n(-260)} L ${n(70)} ${n(-100)} L ${n(70)} ${n(240)} L 0 ${n(330)} L ${n(-70)} ${n(240)} L ${n(-70)} ${n(-100)} Z" />`
  const seam = `<line x1="0" y1="${n(-260)}" x2="0" y2="${n(310)}" stroke-dasharray="2 3" stroke-width="0.7" />`
  const front = `${knot}\n  ${blade}\n  ${seam}`

  // Back: untied long flat strip.
  const flat = `<path d="M ${n(-30)} ${n(-340)} L ${n(30)} ${n(-340)} L ${n(70)} ${n(240)} L 0 ${n(330)} L ${n(-70)} ${n(240)} Z" />`
  const back = flat
  return { front, back, viewHeightPx: viewH }
}

// ── bow-tie (self-tie) ──────────────────────────────────────────────

export function renderBowTie(): RenderResult {
  const viewH = 280
  const wing = `<path d="M ${n(-180)} ${n(-50)} L ${n(-40)} ${n(-30)} L ${n(-40)} ${n(30)} L ${n(-180)} ${n(50)} Z" />`
  const wingR = `<path d="M ${n(180)} ${n(-50)} L ${n(40)} ${n(-30)} L ${n(40)} ${n(30)} L ${n(180)} ${n(50)} Z" />`
  const knot = `<rect x="${n(-40)}" y="${n(-32)}" width="${n(80)}" height="${n(64)}" rx="4" ry="4" />`
  const front = `${wing}\n  ${wingR}\n  ${knot}`

  // Back: untied flat strip.
  const flat = `<rect x="${n(-260)}" y="${n(-22)}" width="${n(520)}" height="${n(44)}" rx="4" ry="4" />`
  const back = flat
  return { front, back, viewHeightPx: viewH }
}

// ── scarf-infinity (knit) ───────────────────────────────────────────

export function renderScarfInfinity(): RenderResult {
  const viewH = 460
  // Figure-eight loop suggesting a twisted infinity scarf.
  const loop = `<path d="M 0 ${n(-160)} C ${n(-180)} ${n(-160)}, ${n(-180)} ${n(-40)}, 0 ${n(-40)} C ${n(180)} ${n(-40)}, ${n(180)} ${n(-160)}, 0 ${n(-160)} Z" />`
  const lower = `<path d="M 0 ${n(40)} C ${n(-180)} ${n(40)}, ${n(-180)} ${n(160)}, 0 ${n(160)} C ${n(180)} ${n(160)}, ${n(180)} ${n(40)}, 0 ${n(40)} Z" />`
  const twist = `<path d="M ${n(-50)} ${n(-30)} Q 0 0, ${n(50)} ${n(30)} M ${n(50)} ${n(-30)} Q 0 0, ${n(-50)} ${n(30)}" stroke-width="1" />`
  // Ribbed knit hints (small parallel lines on the loops).
  const ribs: string[] = []
  for (let i = 0; i < 6; i++) {
    const x = -120 + i * 48
    ribs.push(`<line x1="${n(x)}" y1="${n(-130)}" x2="${n(x)}" y2="${n(-70)}" stroke-width="0.7" />`)
    ribs.push(`<line x1="${n(x)}" y1="${n(70)}" x2="${n(x)}" y2="${n(130)}" stroke-width="0.7" />`)
  }
  const front = `${loop}\n  ${lower}\n  ${twist}\n  ${ribs.join('\n  ')}`
  const back = `${loop}\n  ${lower}\n  ${ribs.join('\n  ')}`
  return { front, back, viewHeightPx: viewH }
}

// ── snood (neck warmer with ribbed cuffs) ───────────────────────────

export function renderSnood(): RenderResult {
  const viewH = 360
  const body = `<rect x="${n(-150)}" y="${n(-160)}" width="${n(300)}" height="${n(320)}" rx="10" ry="10" />`
  // Ribbed top.
  const ribsTop: string[] = []
  const ribsBot: string[] = []
  for (let i = 0; i < 14; i++) {
    const x = -140 + i * 20
    ribsTop.push(`<line x1="${n(x)}" y1="${n(-155)}" x2="${n(x)}" y2="${n(-120)}" stroke-width="0.7" />`)
    ribsBot.push(`<line x1="${n(x)}" y1="${n(120)}" x2="${n(x)}" y2="${n(155)}" stroke-width="0.7" />`)
  }
  // Top + bottom hem seams.
  const topSeam = seamLine(-150, -120, 150, -120)
  const botSeam = seamLine(-150, 120, 150, 120)
  const front = `${body}\n  ${ribsTop.join('\n  ')}\n  ${ribsBot.join('\n  ')}\n  ${topSeam}\n  ${botSeam}`
  const back = front
  return { front, back, viewHeightPx: viewH }
}

// ── sun-hat (wide brim) ─────────────────────────────────────────────

export function renderSunHat(): RenderResult {
  const viewH = 320
  // Crown.
  const crown = `<path d="M ${n(-90)} ${n(0)} Q ${n(-90)} ${n(-140)}, 0 ${n(-140)} Q ${n(90)} ${n(-140)}, ${n(90)} ${n(0)}" />`
  // Brim.
  const brim = `<ellipse cx="0" cy="${n(8)}" rx="${n(220)}" ry="${n(38)}" />`
  // Hat band.
  const band = `<path d="M ${n(-90)} ${n(-30)} Q ${n(-90)} ${n(-46)}, ${n(-60)} ${n(-50)} L ${n(60)} ${n(-50)} Q ${n(90)} ${n(-46)}, ${n(90)} ${n(-30)} Z" stroke-width="0.9" />`
  const front = `${crown}\n  ${brim}\n  ${band}`
  // Back: crown only (no front visible band ribbon).
  const back = `${crown}\n  ${brim}`
  return { front, back, viewHeightPx: viewH }
}

// ── baby-bib (snap closure) ─────────────────────────────────────────

export function renderBabyBib(): RenderResult {
  const viewH = 380
  // Symmetrical bib with neck cutout at top.
  const body = `<path d="M ${n(-60)} ${n(-180)}
             L ${n(-150)} ${n(-150)}
             L ${n(-170)} ${n(-50)}
             L ${n(-140)} ${n(150)}
             Q 0 ${n(190)}, ${n(140)} ${n(150)}
             L ${n(170)} ${n(-50)}
             L ${n(150)} ${n(-150)}
             L ${n(60)} ${n(-180)}
             Q 0 ${n(-140)}, ${n(-60)} ${n(-180)} Z" />`
  // Snap fastenings at the neck.
  const snap = `<circle cx="${n(110)}" cy="${n(-156)}" r="6" stroke-width="0.9" />`
  // Topstitch inset.
  const stitch = `<path d="M ${n(-50)} ${n(-170)}
             L ${n(-140)} ${n(-140)}
             L ${n(-160)} ${n(-50)}
             L ${n(-132)} ${n(140)}
             Q 0 ${n(180)}, ${n(132)} ${n(140)}
             L ${n(160)} ${n(-50)}
             L ${n(140)} ${n(-140)}
             L ${n(50)} ${n(-170)}
             Q 0 ${n(-132)}, ${n(-50)} ${n(-170)} Z" stroke-dasharray="2 3" stroke-width="0.7" />`
  const front = `${body}\n  ${snap}\n  ${stitch}`
  // Back: mirror snap on the other side.
  const snapBack = `<circle cx="${n(-110)}" cy="${n(-156)}" r="6" stroke-width="0.9" />`
  const back = `${body}\n  ${snapBack}\n  ${stitch}`
  return { front, back, viewHeightPx: viewH }
}
