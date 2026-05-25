/**
 * Fetch the revisedFrom for a given slug and print the first paragraph text.
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

const slug = process.argv[2]
if (!slug) { console.error('Usage: tsx scripts/_batch3-fetch-revised-from.ts <slug>'); process.exit(1) }

function firstPara(content: any[]): string {
  for (const n of content) {
    if (n.type === 'paragraph' && Array.isArray(n.content)) {
      return n.content.map((c: any) => c.text || '').join('')
    }
  }
  return ''
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, revisedFrom: true },
  })
  if (!t) { console.log('not found'); process.exit(1) }
  if (!t.revisedFrom) { console.log('no revisedFrom'); process.exit(0) }
  console.log(`OLD first paragraph:`)
  console.log(firstPara((t.revisedFrom as any).content))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
