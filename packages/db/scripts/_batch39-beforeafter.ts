/**
 * Dump before/after snippets for the batch39 hand-off.
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

function paragraphText(body: any, idx: number): string {
  const nodes = body?.content
  if (!Array.isArray(nodes)) return ''
  const p = nodes[idx]
  if (!p?.content || p.type !== 'paragraph') {
    // fall back: find idx-th paragraph by index in content array
    return ''
  }
  return p.content
    .filter((n: any) => typeof n.text === 'string')
    .map((n: any) => n.text)
    .join('')
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const slugs = [
    { slug: 'devilled-mackerel', paragraphIdx: 0, label: 'cooking, RECIPE, paragraph[0]' },
    { slug: 'dhalpuri-roti', paragraphIdx: 0, label: 'cooking, RECIPE, paragraph[0]' },
    { slug: 'sitting-with-the-exhausted-past-version-kindly', paragraphIdx: 8, label: 'mindset, PRACTICE, paragraph[8]' },
  ]

  for (const { slug, paragraphIdx, label } of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, body: true, revisedFrom: true },
    })
    if (!t) { console.log(`MISS ${slug}`); continue }
    const before = paragraphText(t.revisedFrom, paragraphIdx)
    const after = paragraphText(t.body, paragraphIdx)
    console.log(`\n=== ${slug} (${label}) ===`)
    console.log(`BEFORE:\n${before}`)
    console.log(`\nAFTER:\n${after}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
