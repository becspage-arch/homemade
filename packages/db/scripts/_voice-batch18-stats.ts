import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let d = __dirname
  for (let i = 0; i < 8; i++) {
    const c = resolve(d, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(d); if (p === d) break; d = p
  }
}

const root = resolve(__dirname, '../../..')
const dir = resolve(root, 'docs/voice-retrofit-2026-05-28-batch18')

async function main() {
  const { prisma } = await import('../src/index.js')
  const slugs: { slug: string; categorySlug: string | null }[] = JSON.parse(
    readFileSync(resolve(dir, '_slugs.json'), 'utf8'),
  )
  const byCat: Record<string, number> = {}
  for (const s of slugs) {
    const c = s.categorySlug ?? 'unknown'
    byCat[c] = (byCat[c] ?? 0) + 1
  }
  console.log('Category counts:')
  for (const k of Object.keys(byCat).sort()) console.log(`  ${k}: ${byCat[k]}`)

  // Random pick
  const r = slugs[Math.floor(Math.random() * slugs.length)]
  const t = await prisma.tutorial.findUnique({
    where: { slug: r.slug },
    select: { slug: true, voiceRetrofittedAt: true, revisedFrom: true, body: true, category: { select: { slug: true } } },
  })
  console.log(`\nRandom spot-check: ${r.slug}`)
  console.log(`  voiceRetrofittedAt: ${t?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  revisedFrom set: ${t?.revisedFrom != null}`)
  console.log(`  category: ${t?.category?.slug}`)
  console.log(`  URL: https://homemade.education/${t?.category?.slug}/${r.slug}`)

  // First paragraph after apply
  const body = t?.body as any
  if (body?.content) {
    for (const node of body.content) {
      if (node.type === 'paragraph') {
        const txt = (node.content ?? []).map((c: any) => c.text ?? '').join('')
        if (txt.trim()) {
          console.log(`  first paragraph: ${txt}`)
          break
        }
      }
    }
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
