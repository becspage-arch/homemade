import sharp from 'sharp'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-sample'
const DISHES = [
  { slug: 'trofie-al-pesto', name: 'Trofie al Pesto' },
  { slug: 'caneles-de-bordeaux', name: 'Caneles de Bordeaux' },
  { slug: 'peking-duck', name: 'Peking Duck' },
]
const COLS = [
  { tier: 'schnell', label: 'Schnell  (~£0.0024)' },
  { tier: 'pro', label: 'Pro v1.1  (~£0.032)' },
  { tier: 'ultra', label: 'Ultra  (~£0.05)' },
]

const cellW = 350, cellH = 233, gap = 12, M = 20, headH = 44, dishH = 30
const colX = [M, M + cellW + gap, M + 2 * (cellW + gap)]
const canvasW = colX[2] + cellW + M
const block = dishH + cellH
const canvasH = headH + DISHES.length * block + (DISHES.length - 1) * gap + M

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

async function main() {
  const comps: sharp.OverlayOptions[] = []
  let svg = `<svg width="${canvasW}" height="${canvasH}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<style>.c{font-family:Arial,sans-serif;font-weight:700;font-size:17px;fill:#1565c0}.d{font-family:Arial,sans-serif;font-weight:700;font-size:18px;fill:#1a1a1a}</style>`
  COLS.forEach((c, i) => { svg += `<text x="${colX[i] + cellW / 2}" y="30" class="c" text-anchor="middle">${esc(c.label)}</text>` })

  for (let r = 0; r < DISHES.length; r++) {
    const y0 = headH + r * (block + gap)
    svg += `<text x="${M}" y="${y0 + 22}" class="d">${esc(DISHES[r].name)}</text>`
    const imgY = y0 + dishH
    for (let i = 0; i < COLS.length; i++) {
      const buf = await sharp(resolve(DIR, `TIER_${COLS[i].tier}_${DISHES[r].slug}.jpg`)).resize(cellW, cellH, { fit: 'cover' }).toBuffer()
      comps.push({ input: buf, left: colX[i], top: imgY })
    }
  }
  svg += `</svg>`

  const out = await sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: '#ffffff' } })
    .composite([...comps, { input: Buffer.from(svg), left: 0, top: 0 }])
    .png().toBuffer()
  const path = resolve(DIR, 'TIER_comparison.png')
  writeFileSync(path, out)
  console.log(`Wrote ${path} (${canvasW}x${canvasH})`)
}
main().catch((e) => { console.error(e); process.exit(1) })
