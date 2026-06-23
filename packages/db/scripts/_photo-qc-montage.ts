import sharp from 'sharp'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-sample'

const ROWS = [
  { t: 'Trofie al Pesto', was: 'three raw basil leaves', before: '001_recipe_pexels.jpg', after: 'AFTER_trofie-al-pesto.jpg' },
  { t: 'Mulligatawny Soup', was: 'a block of butter', before: '034_recipe_unsplash.jpg', after: 'AFTER_mulligatawny-soup.jpg' },
  { t: 'Gruyere gougeres', was: 'a hydroelectric dam', before: '083_recipe_unsplash.jpg', after: 'AFTER_gougeres-gruyere.jpg' },
  { t: 'Pane di Altamura', was: 'a stone church', before: '072_recipe_pexels.jpg', after: 'AFTER_pane-di-altamura.jpg' },
  { t: 'Salmon Fishcakes', was: 'raw salmon fillets', before: '006_recipe_pexels.jpg', after: 'AFTER_salmon-fishcakes.jpg' },
  { t: 'Caneles de Bordeaux', was: 'plain round buns', before: '100_recipe_flux-schnell.jpg', after: 'AFTER_caneles-de-bordeaux.jpg' },
  { t: 'New York cheesecake', was: 'slice with a Lotus logo', before: '073_recipe_pexels.jpg', after: 'AFTER_new-york-cheesecake.jpg' },
  { t: 'Kuku sibzamini', was: 'roasted potato halves', before: '005_recipe_pexels.jpg', after: 'AFTER_kuku-sibzamini.jpg' },
  { t: 'Peking Duck', was: 'a raw whole chicken', before: '023_recipe_unsplash.jpg', after: 'AFTER_peking-duck.jpg' },
  { t: 'Barley sugar', was: 'shortbread squares', before: '105_recipe_flux-schnell.jpg', after: 'AFTER_barley-sugar.jpg' },
]

const W = 520, H = 350, GAP = 18, LABEL = 38, HEADER = 56, MARGIN = 24
const colL = MARGIN, colR = MARGIN + W + GAP
const canvasW = colR + W + MARGIN
const rowBlock = LABEL + H
const canvasH = HEADER + ROWS.length * rowBlock + (ROWS.length - 1) * GAP + MARGIN

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

async function main() {
  const composites: sharp.OverlayOptions[] = []
  let svg = `<svg width="${canvasW}" height="${canvasH}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<style>.t{font-family:Arial,sans-serif;font-weight:700;font-size:20px;fill:#1a1a1a}.w{font-family:Arial,sans-serif;font-size:15px;fill:#8a8a8a}.h{font-family:Arial,sans-serif;font-weight:700;font-size:17px}</style>`
  svg += `<text x="${colL}" y="34" class="h" fill="#555">NOW — live on site</text>`
  svg += `<text x="${colR}" y="34" class="h" fill="#1565c0">GENERATED + verified</text>`

  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i]
    const y0 = HEADER + i * (rowBlock + GAP)
    svg += `<text x="${colL}" y="${y0 + 26}" class="t">${esc(r.t)}</text>`
    svg += `<text x="${canvasW - MARGIN}" y="${y0 + 26}" class="w" text-anchor="end">was: ${esc(r.was)}</text>`
    const imgY = y0 + LABEL
    const beforeBuf = await sharp(resolve(DIR, r.before)).resize(W, H, { fit: 'cover' }).toBuffer()
    const afterBuf = await sharp(resolve(DIR, r.after)).resize(W, H, { fit: 'cover' }).toBuffer()
    composites.push({ input: beforeBuf, left: colL, top: imgY })
    composites.push({ input: afterBuf, left: colR, top: imgY })
  }
  svg += `</svg>`

  const base = sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: '#ffffff' } })
  const out = await base
    .composite([...composites, { input: Buffer.from(svg), left: 0, top: 0 }])
    .png()
    .toBuffer()
  const path = resolve(DIR, 'BEFORE_AFTER_comparison.png')
  writeFileSync(path, out)
  console.log(`Wrote ${path}  (${canvasW}x${canvasH})`)
}
main().catch((e) => { console.error(e); process.exit(1) })
