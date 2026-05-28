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

const SLUG = process.argv[2] ?? 'pikelets'

function extract(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (Array.isArray(node?.content)) return node.content.map(extract).join('')
  return ''
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: SLUG },
    include: { category: true },
  })
  if (!t) { console.error('not found:', SLUG); process.exit(1) }
  console.log('slug:', t.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString())
  console.log('publicUrl:', `https://homemade.education/${t.category?.slug}/${t.slug}`)
  const body = t.body
  if (body?.content?.[0]) {
    console.log('\nFirst paragraph (extracted from DB body):')
    console.log(extract(body.content[0]))
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
