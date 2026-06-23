/**
 * Full cooking+baking hero regen — generation stage.
 * Selects the next N UNVERIFIED stock-sourced heroes (not already AI_GENERATED),
 * builds a rich prompt from title+subtitle+excerpt, generates Flux Pro v1.1,
 * downloads to .photo-qc-run/<wave>/gen, writes <wave>/manifest.json.
 *
 * Flags: --limit N (default 300)  --wave LABEL (required)  --exclude FILE(json array of tutorialIds)
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }

import { generateWithFluxPro, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-pro'

const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
const STYLE =
  'Editorial slow-living food photography, natural soft window light, shallow depth of field, ' +
  'styled on rustic ceramic and linen, warm appetising tones, photorealistic, high detail. ' +
  'No text, no words, no watermark, no logo, no brand packaging.'

function arg(name: string, def?: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`))
  if (a) return a.slice(name.length + 3)
  const i = process.argv.indexOf(`--${name}`)
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]
  return def
}

function buildPrompt(title: string, subtitle: string | null, excerpt: string | null): string {
  let sents = ''
  if (excerpt) sents = excerpt.split(/(?<=[.!?])\s/).slice(0, 2).join(' ').slice(0, 240)
  const sub = subtitle ? `, ${subtitle}` : ''
  return `${title}${sub}. ${sents} Finished, plated, appetising. ${STYLE}`.replace(/\s+/g, ' ').trim()
}

async function main() {
  const limit = Number(arg('limit', '300'))
  const wave = arg('wave')
  if (!wave) throw new Error('--wave LABEL required')
  const excludeFile = arg('exclude')
  let exclude: string[] = []
  if (excludeFile && existsSync(excludeFile)) exclude = JSON.parse(readFileSync(excludeFile, 'utf8'))

  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const dir = `${RUN}/${wave}/gen`
  mkdirSync(dir, { recursive: true })

  const rows = await db.$queryRawUnsafe(`
    SELECT t.id, t.slug, t.title, t.subtitle, t.excerpt, c.slug category
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking')
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay')
      AND m."verificationStatus"='UNVERIFIED'
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')
      ${exclude.length ? `AND t.id <> ALL($1)` : ''}
    ORDER BY t.id ASC
    LIMIT ${limit}
  `, ...(exclude.length ? [exclude] : []))

  console.log(`[${wave}] selected ${rows.length} (limit ${limit})`)
  const manifest: any[] = []
  let gens = 0
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const prompt = buildPrompt(r.title, r.subtitle, r.excerpt)
    try {
      const img = await generateWithFluxPro(prompt, { width: 1216, height: 832 })
      gens++
      const bytes = Buffer.from(await (await fetch(img.url)).arrayBuffer())
      const file = `gen_${String(i).padStart(4, '0')}.jpg`
      writeFileSync(resolve(dir, file), bytes)
      manifest.push({ idx: i, tutorialId: r.id, slug: r.slug, title: r.title, category: r.category, genFile: file, falUrl: img.url, width: img.width, height: img.height })
      if ((i + 1) % 25 === 0) console.log(`[${wave}] ${i + 1}/${rows.length}`)
    } catch (e: any) {
      if (e instanceof FluxBillingError) {
        console.error(`BILLING_LOCKED after ${gens} generations this wave. Top up at fal.ai/dashboard/billing.`)
        writeFileSync(resolve(RUN, wave, 'manifest.json'), JSON.stringify(manifest, null, 2))
        process.exit(2)
      }
      manifest.push({ idx: i, tutorialId: r.id, slug: r.slug, title: r.title, error: String(e?.message || e) })
      console.log(`[${wave}] ERR ${r.slug}: ${e?.message || e}`)
    }
  }
  writeFileSync(resolve(RUN, wave, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`[${wave}] generated ${gens}; manifest -> ${wave}/manifest.json`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
