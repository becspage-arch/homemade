import sharp from 'sharp'
import { imageToChart, crispChart } from './convert'
import { fluxIllustration } from './sources'
import { PATTERN_SYMBOLS } from '@/lib/studio/photo-to-pattern'
import { parsePatternData, type PatternData } from '@homemade/db'

/**
 * Quote / sayings generation engine. Three tiers:
 *   - illustration  : a detailed AI subject + a crisp caption (funny/character).
 *   - botanical     : a detailed AI floral frame/wreath + crisp centred text.
 *   - procedural    : flat graphic styles (retro, celestial, sampler, typo, etc).
 *
 * AI art never carries the words (Flux can't spell); text is always stitched in
 * crisply over a cleared band, so spelling is correct and the type stays sharp.
 */

export const W = 600, H = 600
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function rng(seed: number) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff } }
const wrap = (body: string, bg: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${body}</svg>`
const uniq = (a: string[]) => a.filter((v, i) => a.indexOf(v) === i)

export type Cap = { t: string; font: string; size: number }

/** Near-white stitched cells become bare fabric (partial coverage look). */
function whiteToFabric(data: PatternData, thresh = 232): PatternData {
  const white = new Set(data.palette.filter((p) => { const m = /#(..)(..)(..)/.exec(p.rgb); return m ? parseInt(m[1]!, 16) > thresh && parseInt(m[2]!, 16) > thresh && parseInt(m[3]!, 16) > thresh : false }).map((p) => p.symbol))
  return parsePatternData({ schemaVersion: 1, type: 'CROSS_STITCH', grid: { width: data.grid.width, height: data.grid.height, cells: data.grid.cells.filter((c) => !white.has(c.s)), backstitch: [], frenchKnots: [], beads: [] }, palette: data.palette.filter((p) => !white.has(p.symbol)), fabric: { count: data.fabric.count, colourRgb: '#ffffff', type: 'Aida' }, metadata: {} })
}

function capSvg(lines: Cap[], yc: number, ink: string): string {
  const total = lines.reduce((a, l) => a + l.size * 1.16, 0)
  let y = yc - total / 2 + (lines[0]?.size ?? 0) * 0.58
  const parts = lines.map((l) => { const t = `<text x="${W / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="${l.font}" font-weight="700" font-size="${l.size}" fill="${ink}">${esc(l.t)}</text>`; y += l.size * 1.16; return t })
  return wrap(parts.join(''), '#ffffff')
}

/** Stitch a crisp caption over a charted base, clearing a clean band first so
 *  art never crowds the type (the references always sit text on bare fabric). */
async function overlayText(base: PatternData, lines: Cap[], yc: number, ink: string, N: number): Promise<PatternData> {
  const td = await crispChart(capSvg(lines, yc, ink), { width: N, height: N, palette: [ink], background: '#ffffff' })
  if (td.grid.cells.length === 0) return base
  const ys = td.grid.cells.map((c) => c.y)
  const yMin = Math.min(...ys) - 3, yMax = Math.max(...ys) + 3
  const used = new Set(base.palette.map((p) => p.symbol))
  const sym = PATTERN_SYMBOLS.find((s) => !used.has(s)) ?? '#'
  const inkEntry = { ...(td.palette[0] ?? { brand: 'DMC' as const, code: '000', name: 'Ink', rgb: ink, strandsFullCross: 2, strandsBackstitch: 1 }), symbol: sym }
  const cells = base.grid.cells.filter((c) => c.y < yMin || c.y > yMax).concat(td.grid.cells.map((c) => ({ x: c.x, y: c.y, s: sym })))
  return parsePatternData({ schemaVersion: 1, type: 'CROSS_STITCH', grid: { width: N, height: N, cells, backstitch: [], frenchKnots: [], beads: [] }, palette: [...base.palette, inkEntry], fabric: base.fabric, metadata: {} })
}

/**
 * Place a caption relative to the charted subject: centred on the subject's
 * horizontal middle, and a fixed small gap above (top) or below (bottom) its
 * edge. Fixes captions drifting off-centre or floating far from the art.
 */
export async function subjectCaption(subject: PatternData, capLines: Cap[], capPos: 'top' | 'bottom', ink: string, N: number, gap = 5): Promise<PatternData> {
  const td = await crispChart(capSvg(capLines, H / 2, ink), { width: N, height: N, palette: [ink], background: '#ffffff' })
  if (td.grid.cells.length === 0 || subject.grid.cells.length === 0) return subject
  const tx = td.grid.cells.map((c) => c.x), ty = td.grid.cells.map((c) => c.y)
  const tMinX = Math.min(...tx), tMaxX = Math.max(...tx), tMinY = Math.min(...ty), tMaxY = Math.max(...ty)
  const sx = subject.grid.cells.map((c) => c.x), sy = subject.grid.cells.map((c) => c.y)
  const sMinX = Math.min(...sx), sMaxX = Math.max(...sx), sMinY = Math.min(...sy), sMaxY = Math.max(...sy)
  const margin = 3
  let dx = Math.round((sMinX + sMaxX) / 2 - (tMinX + tMaxX) / 2)
  if (tMinX + dx < margin) dx = margin - tMinX
  if (tMaxX + dx > N - 1 - margin) dx = N - 1 - margin - tMaxX
  let dy = capPos === 'top' ? sMinY - gap - tMaxY : sMaxY + gap - tMinY
  if (tMinY + dy < margin) dy = margin - tMinY
  if (tMaxY + dy > N - 1 - margin) dy = N - 1 - margin - tMaxY
  const shifted = td.grid.cells.map((c) => ({ x: c.x + dx, y: c.y + dy })).filter((c) => c.x >= 0 && c.x < N && c.y >= 0 && c.y < N)
  if (shifted.length === 0) return subject
  const nMinY = Math.min(...shifted.map((c) => c.y)) - 2, nMaxY = Math.max(...shifted.map((c) => c.y)) + 2
  const used = new Set(subject.palette.map((p) => p.symbol))
  const sym = PATTERN_SYMBOLS.find((s) => !used.has(s)) ?? '#'
  const inkEntry = { ...(td.palette[0] ?? { brand: 'DMC' as const, code: '000', name: 'Ink', rgb: ink, strandsFullCross: 2, strandsBackstitch: 1 }), symbol: sym }
  const cells = subject.grid.cells.filter((c) => c.y < nMinY || c.y > nMaxY).concat(shifted.map((c) => ({ x: c.x, y: c.y, s: sym })))
  return parsePatternData({ schemaVersion: 1, type: 'CROSS_STITCH', grid: { width: N, height: N, cells, backstitch: [], frenchKnots: [], beads: [] }, palette: [...subject.palette, inkEntry], fabric: subject.fabric, metadata: {} })
}

/** Composite the AI subject into a fixed region of a white square, reserving a
 *  clear band (~28% of height) for the caption so it never has to crowd the
 *  art — regardless of how the model framed the subject. */
async function reserveBand(buf: Buffer, capPos: 'top' | 'bottom'): Promise<Buffer> {
  const SUBJ_W = 560, SUBJ_H = 432, PAD = 24
  const fitted = await sharp(buf).resize(SUBJ_W, SUBJ_H, { fit: 'inside', background: '#ffffff' }).png().toBuffer()
  const fm = await sharp(fitted).metadata()
  const fw = fm.width ?? SUBJ_W, fh = fm.height ?? SUBJ_H
  const left = Math.round((W - fw) / 2)
  const top = capPos === 'bottom' ? PAD : H - PAD - fh
  return sharp({ create: { width: W, height: H, channels: 3, background: { r: 255, g: 255, b: 255 } } }).composite([{ input: fitted, top, left }]).png().toBuffer()
}

// ---------- AI tiers ----------
export async function buildIllustration(o: { prompt: string; colours: number; cells: number; cap: Cap[]; capPos: 'top' | 'bottom'; ink: string }): Promise<PatternData> {
  const src = await fluxIllustration(o.prompt, { imageSize: 'square_hd' })
  const framed = await reserveBand(src.buffer, o.capPos)
  // trim:false is essential — the auto-trim would crop the reserved caption
  // band back off, putting the subject edge-to-edge again and letting the
  // caption clear-band slice through it.
  const base = whiteToFabric(await imageToChart(framed, { longestCells: o.cells, colours: o.colours, preprocess: { saturation: 1.12, trim: false } }))
  const N = Math.max(base.grid.width, base.grid.height)
  return subjectCaption(base, o.cap, o.capPos, o.ink, N)
}

/** Strip the caption layer (always the last appended palette entry) to recover
 *  the subject-only chart, so text can be re-placed without re-running the AI. */
export function stripCaption(data: PatternData): PatternData {
  if (data.palette.length <= 1) return data
  const inkSym = data.palette[data.palette.length - 1]!.symbol
  return parsePatternData({ schemaVersion: 1, type: 'CROSS_STITCH', grid: { width: data.grid.width, height: data.grid.height, cells: data.grid.cells.filter((c) => c.s !== inkSym), backstitch: [], frenchKnots: [], beads: [] }, palette: data.palette.slice(0, -1), fabric: data.fabric, metadata: {} })
}

export async function buildBotanical(o: { prompt: string; colours: number; cells: number; lines: string[]; font: string; size: number; ink: string }): Promise<PatternData> {
  const src = await fluxIllustration(o.prompt, { imageSize: 'square_hd' })
  const base = whiteToFabric(await imageToChart(src.buffer, { longestCells: o.cells, colours: o.colours, preprocess: { saturation: 1.14 } }))
  const N = Math.max(base.grid.width, base.grid.height)
  const cap: Cap[] = o.lines.map((t) => ({ t, font: o.font, size: o.size }))
  return overlayText(base, cap, H / 2, o.ink, N)
}

// ---------- procedural tiers ----------
function lineSvg(ls: { t: string; y: number; size: number; font: string; fill: string; style?: string; weight?: number }[]) {
  return ls.map((l) => `<text x="${W / 2}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-family="${l.font}" font-weight="${l.weight ?? 700}" font-style="${l.style ?? 'normal'}" font-size="${l.size}" fill="${l.fill}">${esc(l.t)}</text>`).join('')
}

export async function buildRetro(o: { lines: string[]; font: string }): Promise<PatternData> {
  const bg = '#f3e7cf', sun = '#e0a32e', orange = '#d8642e', teal = '#2f8f86', pink = '#e07aa0'
  const cx = W / 2, cy = 330; let s = ''
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, r1 = 92, r2 = 92 + (i % 2 ? 56 : 36); s += `<line x1="${cx + Math.cos(a) * r1}" y1="${cy + Math.sin(a) * r1}" x2="${cx + Math.cos(a) * r2}" y2="${cy + Math.sin(a) * r2}" stroke="${i % 3 === 0 ? pink : i % 3 === 1 ? orange : sun}" stroke-width="8" stroke-linecap="round"/>` }
  s += `<circle cx="${cx}" cy="${cy}" r="84" fill="${sun}"/><circle cx="${cx - 30}" cy="${cy - 12}" r="9" fill="#3a2a14"/><circle cx="${cx + 30}" cy="${cy - 12}" r="9" fill="#3a2a14"/><path d="M${cx - 34} ${cy + 18} Q ${cx} ${cy + 52}, ${cx + 34} ${cy + 18}" stroke="#3a2a14" stroke-width="8" fill="none" stroke-linecap="round"/>`
  s += lineSvg([{ t: o.lines[0]!, y: 120, size: 72, font: o.font, fill: orange }, ...(o.lines[1] ? [{ t: o.lines[1]!, y: 188, size: 56, font: o.font, fill: teal }] : [])])
  if (o.lines[2]) s += lineSvg([{ t: o.lines[2]!, y: 500, size: 72, font: o.font, fill: pink }])
  return crispChart(wrap(s, bg), { width: 160, height: 160, palette: uniq([sun, orange, teal, pink, '#3a2a14']), background: bg })
}

export async function buildCelestial(o: { lines: string[]; font: string; seed: number }): Promise<PatternData> {
  const bg = '#1f2747', gold = '#e8c469', cream = '#f1ead6', lilac = '#b9a7d6'
  const r = rng(o.seed); let s = ''
  const star = (cx: number, cy: number, z: number, f: string) => `<path d="M${cx} ${cy - z} L${cx + z * 0.25} ${cy - z * 0.25} L${cx + z} ${cy} L${cx + z * 0.25} ${cy + z * 0.25} L${cx} ${cy + z} L${cx - z * 0.25} ${cy + z * 0.25} L${cx - z} ${cy} L${cx - z * 0.25} ${cy - z * 0.25} Z" fill="${f}"/>`
  for (let i = 0; i < 38; i++) s += star(40 + r() * (W - 80), 40 + r() * (H - 80), 4 + r() * 6, r() > 0.6 ? gold : cream)
  s += `<path d="M ${W / 2 + 70} 120 A 60 60 0 1 1 ${W / 2 + 70} 121 A 44 44 0 1 0 ${W / 2 + 70} 120 Z" fill="${gold}"/>`
  const fs = o.lines.length > 2 ? 52 : 60, y0 = H / 2 + 30 - ((o.lines.length - 1) * fs * 1.2) / 2
  s += lineSvg(o.lines.map((t, i) => ({ t, y: y0 + i * fs * 1.2, size: fs, font: o.font, fill: cream, style: 'italic' })))
  return crispChart(wrap(s, bg), { width: 160, height: 160, palette: uniq([gold, cream, lilac]), background: bg })
}

export async function buildSampler(o: { lines: string[] }): Promise<PatternData> {
  const bg = '#f3ecdb', red = '#a83a3a', blue = '#3a5a8a', green = '#4e7a44', gold = '#c79a3a', ink = '#5a4a36'
  let s = ''
  const band = (y: number) => { let b = ''; for (let x = 40; x < W - 40; x += 30) b += `<path d="M${x} ${y} l15 -12 l15 12 l-15 12 z" fill="none" stroke="${x % 60 < 30 ? red : blue}" stroke-width="4"/>`; return b }
  s += band(70) + band(H - 92)
  s += `<text x="${W / 2}" y="150" text-anchor="middle" font-family="Georgia" font-size="34" letter-spacing="6" fill="${green}">A B C D E F G H I J</text>`
  const fs = 56, y0 = 270
  s += lineSvg(o.lines.map((t, i) => ({ t, y: y0 + i * fs * 1.2, size: fs, font: 'Georgia', fill: ink })))
  const hy = H - 170
  s += `<rect x="${W / 2 - 26}" y="${hy}" width="52" height="44" fill="${gold}"/><path d="M${W / 2 - 34} ${hy} L${W / 2} ${hy - 30} L${W / 2 + 34} ${hy} Z" fill="${red}"/><rect x="${W / 2 - 8}" y="${hy + 16}" width="16" height="28" fill="${blue}"/>`
  const heart = (cx: number, cy: number, z: number, f: string) => `<path transform="translate(${cx - z / 2} ${cy - z / 2}) scale(${z / 24})" d="M12 21s-9-7.5-9-12.5A4.5 4.5 0 0 1 12 5.5 4.5 4.5 0 0 1 21 8.5C21 13.5 12 21 12 21Z" fill="${f}"/>`
  s += heart(W / 2 - 120, hy + 20, 26, red) + heart(W / 2 + 120, hy + 20, 26, red)
  return crispChart(wrap(s, bg), { width: 160, height: 160, palette: uniq([red, blue, green, gold, ink]), background: bg })
}

export async function buildTypo(o: { scriptWord: string; scriptFont: string; blockWords: string; blockFont: string; ink: string }): Promise<PatternData> {
  const bg = '#ffffff'
  const s = `<text x="${W / 2}" y="250" text-anchor="middle" font-family="${o.scriptFont}" font-size="120" fill="${o.ink}">${esc(o.scriptWord)}</text><text x="${W / 2}" y="385" text-anchor="middle" font-family="${o.blockFont}" font-weight="700" font-size="92" fill="${o.ink}">${esc(o.blockWords)}</text>`
  return crispChart(wrap(s, bg), { width: 165, height: 130, palette: [o.ink], background: bg })
}

export async function buildMixed(o: { words: { t: string; font: string; size: number; fill: string; y: number; style?: string }[] }): Promise<PatternData> {
  const bg = '#fbf7ef'
  const star = (cx: number, cy: number, z: number, f: string) => `<path d="M${cx} ${cy - z} L${cx + z * 0.3} ${cy - z * 0.3} L${cx + z} ${cy} L${cx + z * 0.3} ${cy + z * 0.3} L${cx} ${cy + z} L${cx - z * 0.3} ${cy + z * 0.3} L${cx - z} ${cy} L${cx - z * 0.3} ${cy - z * 0.3} Z" fill="${f}"/>`
  let s = o.words.map((w) => `<text x="${W / 2}" y="${w.y}" text-anchor="middle" dominant-baseline="middle" font-family="${w.font}" font-weight="700" font-style="${w.style ?? 'normal'}" font-size="${w.size}" fill="${w.fill}">${esc(w.t)}</text>`).join('')
  const cols = uniq(o.words.map((w) => w.fill))
  s += star(70, 90, 16, cols[0]!) + star(W - 70, 110, 14, cols[1] ?? cols[0]!) + star(80, H - 90, 16, cols[2] ?? cols[0]!) + star(W - 80, H - 90, 16, cols[0]!)
  return crispChart(wrap(s, bg), { width: 165, height: 165, palette: uniq(cols), background: bg })
}

export async function buildMinimal(o: { lines: string[]; font: string }): Promise<PatternData> {
  const bg = '#f4f1e9', sage = '#8a9a7b', ink = '#403d36'
  const fs = 64, y0 = H / 2 - 30 - ((o.lines.length - 1) * fs * 1.22) / 2
  let s = lineSvg(o.lines.map((t, i) => ({ t, y: y0 + i * fs * 1.22, size: fs, font: o.font, fill: ink, weight: 600 })))
  // a single small sprig well below the text (kept clear of letters)
  const sy = y0 + o.lines.length * fs * 1.22 + 20, cx = W / 2
  s += `<path d="M${cx} ${sy} Q ${cx} ${sy - 40}, ${cx} ${sy - 70}" stroke="${sage}" stroke-width="5" fill="none"/>`
  for (let i = 0; i < 3; i++) { const yy = sy - 12 - i * 22; s += `<path d="M${cx} ${yy} q -18 -8 -26 -22" stroke="${sage}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${cx} ${yy} q 18 -8 26 -22" stroke="${sage}" stroke-width="5" fill="none" stroke-linecap="round"/>` }
  return crispChart(wrap(s, bg), { width: 150, height: 150, palette: [sage, ink], background: bg })
}
