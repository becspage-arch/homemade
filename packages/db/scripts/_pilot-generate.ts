import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

import { generateWithFluxPro, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-pro'

const ROOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-pilot'
const GEN = `${ROOT}/gen`
const STYLE =
  'Editorial slow-living food photography, natural soft window light, shallow depth of field, ' +
  'styled on rustic ceramic and linen, warm appetising tones, photorealistic, high detail. ' +
  'No text, no words, no watermark, no logo, no brand packaging.'

async function main() {
  mkdirSync(GEN, { recursive: true })
  const pilot: any[] = JSON.parse(readFileSync(resolve(ROOT, 'pilot.json'), 'utf8'))
  const verdicts: any[] = JSON.parse(readFileSync(resolve(ROOT, 'pilot-verdicts.json'), 'utf8'))
  const byIdx = new Map(pilot.map((p) => [p.idx, p]))
  // Allow a retry pass: --only=2,5,9 regenerates just those idxs
  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const only = onlyArg ? new Set(onlyArg.slice('--only='.length).split(',').map(Number)) : null

  const out: any[] = []
  let gens = 0
  for (const v of verdicts) {
    if (only && !only.has(v.idx)) continue
    const p = byIdx.get(v.idx)
    if (!p) { console.log(`skip ${v.idx} (not in pilot)`); continue }
    const prompt = `${v.prompt}. ${STYLE}`
    try {
      const img = await generateWithFluxPro(prompt, { width: 1216, height: 832 })
      gens++
      const bytes = Buffer.from(await (await fetch(img.url)).arrayBuffer())
      const file = `gen_${String(v.idx).padStart(3, '0')}.jpg`
      writeFileSync(resolve(GEN, file), bytes)
      out.push({ idx: v.idx, tutorialId: p.tutorialId, slug: p.slug, title: p.title, genFile: file, falUrl: img.url, width: img.width, height: img.height })
      console.log(`OK  ${v.idx} ${p.slug}`)
    } catch (e: any) {
      if (e instanceof FluxBillingError) {
        console.error(`BILLING_LOCKED after ${gens} generations. Top up at fal.ai/dashboard/billing.`)
        writeFileSync(resolve(ROOT, 'gen-results.json'), JSON.stringify(out, null, 2))
        process.exit(2)
      }
      out.push({ idx: v.idx, tutorialId: p.tutorialId, slug: p.slug, title: p.title, error: String(e?.message || e) })
      console.log(`ERR ${v.idx} ${p.slug}: ${e?.message || e}`)
    }
  }
  // merge with any prior results on retry
  if (only && existsSync(resolve(ROOT, 'gen-results.json'))) {
    const prior: any[] = JSON.parse(readFileSync(resolve(ROOT, 'gen-results.json'), 'utf8'))
    const merged = new Map(prior.map((r) => [r.idx, r]))
    for (const r of out) merged.set(r.idx, r)
    writeFileSync(resolve(ROOT, 'gen-results.json'), JSON.stringify([...merged.values()].sort((a, b) => a.idx - b.idx), null, 2))
  } else {
    writeFileSync(resolve(ROOT, 'gen-results.json'), JSON.stringify(out, null, 2))
  }
  console.log(`\nGenerated ${gens} images (Flux Pro v1.1). Results -> gen-results.json`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
