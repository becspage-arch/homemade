
/**
 * Procedural designs for the heritage/free half — sayings posters,
 * alphabet samplers, geometric medallions. Each returns an SVG plus the
 * flat palette it uses, to be fed to `crispChart` (nearest-downsample +
 * palette snap) so the text comes out fully formed.
 *
 * Variety is mandatory: sayings posters must not all look identical, so
 * the palette, motifs and layout vary per call (driven by `variant`).
 */

export interface ProceduralDesign {
  svg: string
  /** Foreground palette hexes (background excluded). */
  palette: string[]
  background: string
}

/** Warm designer palettes (cream background + a small accent set). Indexed
 *  by variant so a batch of sayings posters spreads across distinct looks. */
const PALETTES: { bg: string; ink: string[] }[] = [
  { bg: '#f4ead7', ink: ['#c2683f', '#7c8a5f', '#d98c9a', '#d4a843'] }, // terracotta / sage / pink / mustard
  { bg: '#eef1ea', ink: ['#3b6b4a', '#9c3b3b', '#c98a3b', '#2f4a6b'] }, // green / red / gold / navy
  { bg: '#fbeee6', ink: ['#b5654a', '#6b8e9c', '#caa05a', '#8a6b9c'] }, // rust / dusty-blue / honey / mauve
  { bg: '#f3efe6', ink: ['#2f5d63', '#cf7a54', '#caa45a', '#7a8c5f'] }, // teal / coral / ochre / olive
]

export function pickPalette(variant: number) {
  return PALETTES[variant % PALETTES.length]!
}

function heart(cx: number, cy: number, s: number, fill: string): string {
  return `<path transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})" d="M12 21s-9-7.5-9-12.5A4.5 4.5 0 0 1 12 5.5 4.5 4.5 0 0 1 21 8.5C21 13.5 12 21 12 21Z" fill="${fill}"/>`
}
function star(cx: number, cy: number, s: number, fill: string): string {
  return `<path d="M${cx} ${cy - s} L${cx + s * 0.22} ${cy - s * 0.22} L${cx + s} ${cy} L${cx + s * 0.22} ${cy + s * 0.22} L${cx} ${cy + s} L${cx - s * 0.22} ${cy + s * 0.22} L${cx - s} ${cy} L${cx - s * 0.22} ${cy - s * 0.22} Z" fill="${fill}"/>`
}
function bookStack(cx: number, y: number, cols: string[]): string {
  return [
    `<rect x="${cx - 78}" y="${y}" width="150" height="26" rx="6" fill="${cols[0]}"/>`,
    `<rect x="${cx - 66}" y="${y + 28}" width="135" height="26" rx="6" fill="${cols[1]}"/>`,
    `<rect x="${cx - 82}" y="${y + 56}" width="158" height="26" rx="6" fill="${cols[2]}"/>`,
  ].join('')
}

/**
 * A modern sayings poster: the line(s) of text in varying weights/colours,
 * a small motif cluster, and scattered hearts/sparkles, on a warm ground.
 * `lines` is 2-4 short upper-case words/phrases (one per visual line).
 */
export function sayingPoster(lines: string[], variant = 0): ProceduralDesign {
  const W = 480, H = 600
  const p = pickPalette(variant)
  const ink = p.ink
  const n = Math.min(lines.length, 4)
  const top = 130, gap = (360 - top) / Math.max(1, n - 1 || 1)
  let text = ''
  lines.slice(0, 4).forEach((ln, i) => {
    const size = i === 0 || i === n - 1 ? 60 : 48
    const y = n === 1 ? 200 : top + i * gap
    text += `<text x="240" y="${y}" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="700" font-size="${size}" fill="${ink[i % ink.length]}">${ln}</text>`
  })
  const motif = bookStack(240, 452, [ink[2]!, ink[1]!, ink[3]!])
  const deco =
    heart(360, 150, 30, ink[2]!) + heart(120, 300, 26, ink[0]!) + heart(380, 372, 22, ink[3]!) +
    star(110, 150, 14, ink[3]!) + star(380, 250, 12, ink[1]!) + star(120, 400, 13, ink[1]!)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${p.bg}"/>${text}${motif}${deco}</svg>`
  return { svg, palette: ink, background: p.bg }
}

/** Bold, centred, fully-formed alphabet sampler (A-Z + digits). */
export function alphabetSampler(variant = 0): ProceduralDesign {
  const p = pickPalette(variant)
  const inL = 50, inR = 496, inT = 50, inB = 372, W = 546, H = 420
  const rows = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ', '1234567890']
  const rowH = (inB - inT) / rows.length
  let t = ''
  rows.forEach((row, r) => {
    const chars = row.split('')
    const cy = inT + (r + 0.5) * rowH
    chars.forEach((ch, i) => {
      const cx = inL + ((inR - inL) * (i + 0.5)) / chars.length
      const fill = r === 4 ? p.ink[1]! : p.ink[(i + r) % 2 === 0 ? 0 : 3]!
      const size = r === 4 ? 40 : 54
      t += `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Verdana, sans-serif" font-weight="700" font-size="${size}" fill="${fill}">${ch}</text>`
    })
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${p.bg}"/><rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${p.ink[2]}" stroke-width="7"/>${t}</svg>`
  return { svg, palette: p.ink, background: p.bg }
}

/** Concentric diamond medallion — bold geometric. */
export function geometricMedallion(variant = 0): ProceduralDesign {
  const p = pickPalette(variant)
  const c = 220
  let r = ''
  for (let i = 7; i >= 1; i--) {
    const sz = i * 28
    const fill = p.ink[i % p.ink.length]!
    r += `<rect x="${c - sz}" y="${c - sz}" width="${sz * 2}" height="${sz * 2}" transform="rotate(45 ${c} ${c})" fill="${fill}"/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="440" viewBox="0 0 440 440"><rect width="440" height="440" fill="${p.bg}"/>${r}</svg>`
  return { svg, palette: p.ink, background: p.bg }
}
