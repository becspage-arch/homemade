/** Generate Flux Pro heroes for one chunk. NO DB (chunk file carries data).
 *  Reads chunks/chunk_NNN.json, generates to chunks/NNN/gen/, writes chunks/NNN/manifest.json.
 *  Idempotent: skips images already present. Flag: --chunk N. Exit 2 on billing halt. */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { generateWithFluxPro, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-pro'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
const STYLE = 'Editorial slow-living food photography, natural soft window light, shallow depth of field, styled on rustic ceramic and linen, warm appetising tones, photorealistic, high detail. No text, no words, no watermark, no logo, no brand packaging.'
function arg(n: string) { const a = process.argv.find(x => x.startsWith(`--${n}=`)); if (a) return a.slice(n.length + 3); const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined }
function buildPrompt(title: string, subtitle: string | null, excerpt: string | null) {
  let s = ''; if (excerpt) s = excerpt.split(/(?<=[.!?])\s/).slice(0, 2).join(' ').slice(0, 240)
  return `${title}${subtitle ? ', ' + subtitle : ''}. ${s} Finished, plated, appetising. ${STYLE}`.replace(/\s+/g, ' ').trim()
}
async function main() {
  const cn = arg('chunk'); if (cn === undefined) throw new Error('--chunk required')
  const pad = String(Number(cn)).padStart(3, '0')
  const rows = JSON.parse(readFileSync(resolve(RUN, 'chunks', `chunk_${pad}.json`), 'utf8'))
  const dir = resolve(RUN, 'chunks', pad, 'gen'); mkdirSync(dir, { recursive: true })
  const manPath = resolve(RUN, 'chunks', pad, 'manifest.json')
  const man: any[] = existsSync(manPath) ? JSON.parse(readFileSync(manPath, 'utf8')) : []
  const doneIdx = new Set(man.map((m: any) => m.idx))
  let gens = 0
  for (let i = 0; i < rows.length; i++) {
    if (doneIdx.has(i) && existsSync(resolve(dir, `g_${i}.jpg`))) continue
    const r = rows[i]
    let img: any = null, lastErr: any = null
    for (let attempt = 1; attempt <= 6 && !img; attempt++) {
      try {
        img = await generateWithFluxPro(buildPrompt(r.title, r.subtitle, r.excerpt), { width: 1216, height: 832 })
      } catch (e: any) {
        lastErr = e
        const billing = e instanceof FluxBillingError
        if (attempt < 6) { await new Promise((res) => setTimeout(res, (billing ? 15000 : 4000) * attempt)); continue }
        if (billing) { writeFileSync(manPath, JSON.stringify(man)); console.error('BILLING_LOCKED'); process.exit(2) }
      }
    }
    if (!img) { man.push({ idx: i, tutorialId: r.id, slug: r.slug, title: r.title, error: String(lastErr?.message || lastErr) }); writeFileSync(manPath, JSON.stringify(man)); continue }
    gens++
    const bytes = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    const file = `g_${i}.jpg`; writeFileSync(resolve(dir, file), bytes)
    man.push({ idx: i, tutorialId: r.id, slug: r.slug, title: r.title, genFile: file, width: img.width, height: img.height, falUrl: img.url })
    writeFileSync(manPath, JSON.stringify(man))
  }
  console.log(`chunk ${pad}: generated ${gens}, manifest entries ${man.length}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
