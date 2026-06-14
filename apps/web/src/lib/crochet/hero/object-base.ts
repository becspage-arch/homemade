/**
 * Shape-aware object base for the anchored-hero pipeline.
 *
 * Takes a rasterised tile of the faithful finished-piece render (the chart
 * engine's stitch render, as a PNG data URI) and composes it into a
 * recognisable finished-OBJECT silhouette — a folded lace stole, a garment
 * flat-lay, a centred motif. This base is what Flux img2img is anchored on,
 * so the resulting photo reads as the right object (a shawl, a cardigan)
 * rather than a flat stitch swatch.
 *
 * Pure SVG; the caller rasterises with the crochet renderer's `rasterise`.
 * No AI here — this is deterministic composition.
 */

export type HeroShape = 'folded-textile' | 'garment-flatlay' | 'motif-flat'

export interface ObjectBaseOptions {
  shape: HeroShape
  /** `data:image/png;base64,...` tile of the finished-piece render. */
  tileDataUri: string
  /** Yarn accent (hex) for borders / ribbing / scallops. */
  accent: string
  /** Canvas size. Defaults 1080x1080 (square hero). */
  W?: number
  H?: number
  /** Background fabric colour. */
  bg?: string
  /** Tile cell size in px. Garments read best ~120; folded textiles ~210. */
  cellPx?: number
}

function shade(hex: string, amt: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m?.[1]) return hex
  const n = parseInt(m[1], 16)
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const r = cl(((n >> 16) & 255) * (1 + amt))
  const g = cl(((n >> 8) & 255) * (1 + amt))
  const b = cl((n & 255) * (1 + amt))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const SOFT_SHADOW =
  '<filter id="ob-soft" x="-20%" y="-20%" width="140%" height="140%">' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="9"/>' +
  '<feOffset dx="0" dy="12" result="o"/>' +
  '<feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer>' +
  '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>'

function open(W: number, H: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`
}

function tilePattern(id: string, tileDataUri: string, cell: number): string {
  return `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">` +
    `<image href="${tileDataUri}" x="0" y="0" width="${cell}" height="${cell}"/></pattern>`
}

/** A run of downward scallops (a shell / lace border) along a horizontal edge. */
function scallopEdge(x: number, y: number, width: number, count: number, fill: string): string {
  const r = width / count / 2
  const rim = shade(fill, -0.16)
  const parts: string[] = []
  for (let i = 0; i < count; i++) {
    const cx = x + r + i * 2 * r
    parts.push(
      `<path d="M ${(cx - r).toFixed(1)} ${y} A ${r.toFixed(1)} ${(r * 1.25).toFixed(1)} 0 0 0 ${(cx + r).toFixed(1)} ${y} Z" fill="${fill}" stroke="${rim}" stroke-width="1.2"/>`,
    )
  }
  return parts.join('')
}

function foldedTextile(o: Required<Pick<ObjectBaseOptions, 'tileDataUri' | 'accent'>> & { W: number; H: number; bg: string; cell: number }): string {
  const { W, H, bg, accent, cell } = o
  const bandW = 760, bandH = 300
  const x0 = (W - bandW) / 2
  const backY = 300, frontY = 500
  const p: string[] = [open(W, H), '<defs>', tilePattern('ob-fab', o.tileDataUri, cell), SOFT_SHADOW,
    `<linearGradient id="ob-fold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.22"/><stop offset="0.18" stop-color="#000" stop-opacity="0"/></linearGradient>`,
    '</defs>']
  p.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`)
  p.push(`<g transform="rotate(-7 ${W / 2} ${H / 2})" filter="url(#ob-soft)">`)
  // back layer
  p.push(`<g clip-path="url(#ob-clipBack)"><rect x="${x0}" y="${backY}" width="${bandW}" height="${bandH}" rx="14" fill="url(#ob-fab)"/></g>`)
  p.push(`<rect x="${x0}" y="${backY}" width="${bandW}" height="${bandH}" rx="14" fill="url(#ob-fab)"/>`)
  // fold shadow
  p.push(`<rect x="${x0}" y="${frontY - 28}" width="${bandW}" height="40" fill="#000" opacity="0.12"/>`)
  // front (folded) layer
  p.push(`<rect x="${x0}" y="${frontY}" width="${bandW}" height="${bandH}" rx="14" fill="url(#ob-fab)"/>`)
  p.push(`<rect x="${x0}" y="${frontY}" width="${bandW}" height="${bandH}" rx="14" fill="url(#ob-fold)"/>`)
  p.push(scallopEdge(x0 + 8, frontY + bandH, bandW - 16, 13, accent))
  p.push('</g></svg>')
  return p.join('')
}

function garmentFlatlay(o: Required<Pick<ObjectBaseOptions, 'tileDataUri' | 'accent'>> & { W: number; H: number; bg: string; cell: number }): string {
  const { W, H, bg, accent, cell } = o
  const bodyX = 360, bodyW = 360, bodyY = 360, bodyH = 470
  const sleeveW = 150, sleeveLen = 300
  const rib = shade(accent, 0.05)
  const p: string[] = [open(W, H), '<defs>', tilePattern('ob-fab', o.tileDataUri, cell), SOFT_SHADOW, '<clipPath id="ob-garment">',
    `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="26"/>`,
    `<rect x="${bodyX - sleeveLen + 30}" y="${bodyY + 18}" width="${sleeveLen}" height="${sleeveW}" rx="22" transform="rotate(18 ${bodyX} ${bodyY + 18})"/>`,
    `<rect x="${bodyX + bodyW - 30}" y="${bodyY + 18}" width="${sleeveLen}" height="${sleeveW}" rx="22" transform="rotate(-18 ${bodyX + bodyW} ${bodyY + 18})"/>`,
    '</clipPath>', '</defs>']
  p.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`)
  p.push('<g filter="url(#ob-soft)">')
  p.push(`<g clip-path="url(#ob-garment)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#ob-fab)"/></g>`)
  // open-front placket + neckline + hem ribbing
  p.push(`<rect x="${bodyX + bodyW / 2 - 12}" y="${bodyY + 60}" width="24" height="${bodyH - 60}" fill="${bg}" opacity="0.92"/>`)
  p.push(`<path d="M ${bodyX + bodyW / 2 - 70} ${bodyY + 6} Q ${bodyX + bodyW / 2} ${bodyY + 70} ${bodyX + bodyW / 2 + 70} ${bodyY + 6}" fill="none" stroke="${rib}" stroke-width="20" stroke-linecap="round"/>`)
  p.push(`<rect x="${bodyX}" y="${bodyY + bodyH - 26}" width="${bodyW}" height="26" fill="${rib}" opacity="0.85"/>`)
  p.push('</g></svg>')
  return p.join('')
}

function motifFlat(o: Required<Pick<ObjectBaseOptions, 'tileDataUri'>> & { W: number; H: number; bg: string }): string {
  const { W, H, bg } = o
  const size = Math.round(Math.min(W, H) * 0.62)
  const x = (W - size) / 2, y = (H - size) / 2
  return [open(W, H), '<defs>', SOFT_SHADOW, '</defs>',
    `<rect width="${W}" height="${H}" fill="${bg}"/>`,
    `<g filter="url(#ob-soft)"><image href="${o.tileDataUri}" x="${x}" y="${y}" width="${size}" height="${size}"/></g>`,
    '</svg>'].join('')
}

export function buildObjectBaseSvg(o: ObjectBaseOptions): string {
  const W = o.W ?? 1080
  const H = o.H ?? 1080
  const bg = o.bg ?? '#efe7dc'
  const cell = o.cellPx ?? (o.shape === 'garment-flatlay' ? 120 : 210)
  const common = { tileDataUri: o.tileDataUri, accent: o.accent, W, H, bg, cell }
  switch (o.shape) {
    case 'garment-flatlay':
      return garmentFlatlay(common)
    case 'motif-flat':
      return motifFlat({ tileDataUri: o.tileDataUri, W, H, bg })
    case 'folded-textile':
    default:
      return foldedTextile(common)
  }
}

/** Map a free-text projectShape / craftShape / sub-category to a hero shape. */
export function shapeFor(projectShape: string | null | undefined, subCategory: string | null | undefined): HeroShape {
  const s = `${projectShape ?? ''} ${subCategory ?? ''}`.toLowerCase()
  if (/cardigan|sweater|jumper|pullover|vest|tank|top|tee|garment|wearable|poncho|cape/.test(s)) return 'garment-flatlay'
  if (/motif|granny|square|hexagon|medallion|doily|coaster|applique|appliqu/.test(s)) return 'motif-flat'
  // shawls, wraps, scarves, cowls, blankets, throws, homewares -> folded textile
  return 'folded-textile'
}
