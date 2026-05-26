/**
 * Spot-check a voice-retrofit slug: print voiceRetrofittedAt and the first
 * paragraph from the live DB body.
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
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

function flattenInline(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (!Array.isArray(node?.content)) return ''
  return node.content.map(flattenInline).join('')
}

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('usage: tsx _voice-retrofit-spotcheck.ts <slug>')
    process.exit(1)
  }
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  if (!t) {
    console.error(`not found: ${slug}`)
    process.exit(1)
  }
  console.log(`slug:                ${t.slug}`)
  console.log(`voiceRetrofittedAt:  ${t.voiceRetrofittedAt}`)
  console.log(`publicUrl:           https://homemade.education/${t.category?.slug}/${t.slug}`)
  const firstPara = t.body?.content?.find?.((n: any) => n.type === 'paragraph')
  if (firstPara) console.log(`first paragraph:     "${flattenInline(firstPara)}"`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
