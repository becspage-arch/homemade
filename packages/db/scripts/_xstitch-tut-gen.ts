/** Generate unique cross-stitch tutorial heroes (Flux Pro) per chunk. NO DB. Billing-retry. */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { generateWithFluxPro, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-pro'
const ROOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-xstitch'
const STYLE = 'Warm editorial craft photography, natural soft window light, shallow depth of field, a cosy maker’s table with cross-stitch in progress: aida or evenweave fabric in a wooden embroidery hoop, embroidery floss skeins, a needle and small scissors. Photorealistic, high detail. No text, no words, no watermark, no logo, no charts, no printed paper.'
function arg(n: string) { const a = process.argv.find(x => x.startsWith(`--${n}=`)); if (a) return a.slice(n.length + 3); const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined }
function buildPrompt(title: string, subtitle: string | null, excerpt: string | null) {
  let s = ''; if (excerpt) s = excerpt.split(/(?<=[.!?])\s/).slice(0, 1).join(' ').slice(0, 180)
  const topic = `${title}${subtitle ? ', ' + subtitle : ''}`
  return `A cross-stitch scene illustrating "${topic}". ${s} ${STYLE}`.replace(/\s+/g, ' ').trim()
}
async function main() {
  const cn = arg('chunk'); if (cn === undefined) throw new Error('--chunk required')
  const pad = String(Number(cn)).padStart(3, '0')
  const rows = JSON.parse(readFileSync(resolve(ROOT, 'chunks', `chunk_${pad}.json`), 'utf8'))
  const dir = resolve(ROOT, 'chunks', pad, 'gen'); mkdirSync(dir, { recursive: true })
  const manPath = resolve(ROOT, 'chunks', pad, 'manifest.json')
  const man: any[] = existsSync(manPath) ? JSON.parse(readFileSync(manPath, 'utf8')) : []
  const done = new Set(man.map((m: any) => m.idx))
  let gens = 0
  for (let i = 0; i < rows.length; i++) {
    if (done.has(i) && existsSync(resolve(dir, `g_${i}.jpg`))) continue
    const r = rows[i]
    let img: any = null
    for (let a = 1; a <= 6 && !img; a++) {
      try { img = await generateWithFluxPro(buildPrompt(r.title, r.subtitle, r.excerpt), { width: 1216, height: 832 }) }
      catch (e: any) {
        const billing = e instanceof FluxBillingError
        if (a < 6) { await new Promise((res) => setTimeout(res, (billing ? 15000 : 4000) * a)); continue }
        if (billing) { writeFileSync(manPath, JSON.stringify(man)); console.error('BILLING_LOCKED'); process.exit(2) }
        man.push({ idx: i, tutorialId: r.id, slug: r.slug, title: r.title, error: String(e?.message || e) }); writeFileSync(manPath, JSON.stringify(man))
      }
    }
    if (!img) continue
    gens++
    const bytes = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    const file = `g_${i}.jpg`; writeFileSync(resolve(dir, file), bytes)
    man.push({ idx: i, tutorialId: r.id, slug: r.slug, title: r.title, genFile: file, width: img.width, height: img.height, falUrl: img.url })
    writeFileSync(manPath, JSON.stringify(man))
  }
  console.log(`chunk ${pad}: generated ${gens}, entries ${man.length}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
