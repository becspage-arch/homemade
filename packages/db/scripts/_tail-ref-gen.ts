/** Generate ingredient/subject heroes for the 7 reference/technique entries.
 *  Per-slug subject prompts (the object the entry is about, not a plated dish).
 *  Writes .photo-qc-run/ref/gen/<slug>.jpg + ref/manifest.json. Billing-retry. */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { generateWithFluxPro, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-pro'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
const STYLE = 'Editorial slow-living food photography, natural soft window light, shallow depth of field, styled on rustic ceramic and linen, warm tones, photorealistic, high detail. No text, no words, no watermark, no logo.'
const SUBJECT: Record<string, string> = {
  'feeding-sourdough-starter-daily': 'an active bubbly sourdough starter in a large glass jar on a kitchen counter, flour and a wooden spoon beside it',
  'sourdough-starter-readiness-test': 'a glass jar of active sourdough starter with a domed risen bubbly surface, lid off, on a wooden counter',
  'sourdough-starter': 'an active living sourdough starter in a clear glass jar, full of bubbles, on a rustic wooden counter',
  'sourdough-starter-troubleshooting': 'a glass jar of sourdough starter with a thin layer of grey liquid hooch on top, on a kitchen counter',
  'starting-sourdough-starter': 'a clear glass jar with flour and water freshly mixed into a young sourdough starter, a bag of flour beside it',
  'sugar-syrup-stages-guide': 'clear sugar syrup gently bubbling in a stainless steel saucepan on a stove, a sugar thermometer clipped to the side',
  'wet-vs-dry-caramel-method': 'golden amber caramel cooking in a stainless steel saucepan, sugar melting and caramelising',
}
async function main() {
  const ref: any[] = JSON.parse(readFileSync(resolve(RUN, 'tail-reference.json'), 'utf8'))
  const dir = resolve(RUN, 'ref', 'gen'); mkdirSync(dir, { recursive: true })
  const man: any[] = []
  for (const r of ref) {
    const subject = SUBJECT[r.slug]
    if (!subject) { man.push({ slug: r.slug, tutorialId: r.id, title: r.title, error: 'no subject prompt' }); continue }
    const prompt = `${subject}. ${STYLE}`
    let img: any = null
    for (let a = 1; a <= 6 && !img; a++) {
      try { img = await generateWithFluxPro(prompt, { width: 1216, height: 832 }) }
      catch (e: any) {
        const billing = e instanceof FluxBillingError
        if (a < 6) { await new Promise((res) => setTimeout(res, (billing ? 15000 : 4000) * a)); continue }
        if (billing) { writeFileSync(resolve(RUN, 'ref', 'manifest.json'), JSON.stringify(man)); console.error('BILLING_LOCKED'); process.exit(2) }
        man.push({ slug: r.slug, tutorialId: r.id, title: r.title, error: String(e?.message || e) })
      }
    }
    if (!img) continue
    const bytes = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    const file = `${r.slug}.jpg`; writeFileSync(resolve(dir, file), bytes)
    man.push({ slug: r.slug, tutorialId: r.id, title: r.title, genFile: file, width: img.width, height: img.height, falUrl: img.url })
    writeFileSync(resolve(RUN, 'ref', 'manifest.json'), JSON.stringify(man))
  }
  writeFileSync(resolve(RUN, 'ref', 'manifest.json'), JSON.stringify(man))
  console.log(`ref-gen: ${man.filter((m) => m.genFile).length}/${ref.length} generated`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
