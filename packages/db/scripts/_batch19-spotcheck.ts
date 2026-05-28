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

const SLUG = process.argv[2] ?? 'welsh-oven-bottom-muffins'

async function main() {
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: SLUG },
    include: { category: true },
  })
  if (!t) {
    console.log('NOT FOUND')
    return
  }
  console.log(`slug:                ${t.slug}`)
  console.log(`category:            ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt:  ${t.voiceRetrofittedAt}`)
  console.log(`revisedFrom set:     ${t.revisedFrom != null}`)
  console.log(`URL:                 https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log('')
  console.log('Opening paragraph:')
  const body = t.body as any
  if (body?.content) {
    for (const node of body.content) {
      if (node.type === 'paragraph') {
        const text = (node.content ?? []).map((c: any) => c.text ?? '').join('')
        if (text.trim()) {
          console.log(text)
          break
        }
      }
    }
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
