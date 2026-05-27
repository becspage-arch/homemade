import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

function flatten(n: any): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(flatten).join('')
  return ''
}

async function main() {
  const slug = process.argv[2] ?? 'rocket-stove-principles'
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } }, body: true },
  })
  if (!t) {
    console.error('not found')
    process.exit(1)
  }
  console.log('slug:', t.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString())
  console.log('categorySlug:', t.category?.slug)
  const firstPara = t.body.content[0]
  console.log('first paragraph:')
  console.log(flatten(firstPara))
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
