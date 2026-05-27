/**
 * Extract before/after paragraph text for batch38 slugs.
 * Tries both paragraph-only indexing AND child-of-content indexing,
 * picks whichever returns a different before vs after.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

const PICKS: { slug: string; label: string }[] = [
  { slug: 'curried-goat', label: 'cooking (RECIPE) — Where this dish lives' },
  { slug: 'panic-attacks-whats-happening-what-helps', label: 'mindset (READING) — opening paragraph' },
  { slug: 'lebkuchen-christmas', label: 'baking (RECIPE) — opening paragraph' },
]

function getAllParagraphs(body: any): string[] {
  if (!body || !Array.isArray(body.content)) return []
  const out: string[] = []
  for (const n of body.content) {
    if (n.type === 'paragraph') {
      out.push((n.content || []).map((c: any) => c.text || '').join(''))
    }
  }
  return out
}

async function main() {
  const { prisma } = await import('../src/index.js')

  for (const { slug, label } of PICKS) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, body: true, revisedFrom: true },
    })
    if (!t) { console.log(`NOT FOUND: ${slug}\n`); continue }

    const beforeParas = getAllParagraphs(t.revisedFrom)
    const afterParas = getAllParagraphs(t.body)
    console.log(`\n=== ${slug} :: ${label} ===`)
    console.log(`Paragraph counts: before=${beforeParas.length}, after=${afterParas.length}`)

    // Find a paragraph that meaningfully differs between before and after
    const minLen = Math.min(beforeParas.length, afterParas.length)
    for (let i = 0; i < minLen; i++) {
      if (beforeParas[i] && afterParas[i] && beforeParas[i] !== afterParas[i]) {
        console.log(`\n--- changed paragraph at index ${i} ---`)
        console.log(`BEFORE:\n${beforeParas[i]}`)
        console.log(`\nAFTER:\n${afterParas[i]}`)
        break
      }
    }
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
