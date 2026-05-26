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

async function main() {
  const { prisma } = await import('../src/index.js')
  const slug = process.argv[2] ?? 'apple-charlotte'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  if (!t) {
    console.error(`Tutorial not found: ${slug}`)
    process.exit(1)
  }
  console.log(`slug:                ${t.slug}`)
  console.log(`category:            ${t.category.slug}`)
  console.log(`voiceRetrofittedAt:  ${t.voiceRetrofittedAt?.toISOString?.() ?? t.voiceRetrofittedAt}`)
  const first = t.body?.content?.find?.((n: any) => n.type === 'paragraph')
  function walk(n: any): string {
    if (typeof n?.text === 'string') return n.text
    if (Array.isArray(n?.content)) return n.content.map(walk).join('')
    return ''
  }
  console.log(`first paragraph:     ${walk(first)}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
