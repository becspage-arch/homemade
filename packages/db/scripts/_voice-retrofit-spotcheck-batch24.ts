/**
 * Random spot-check of a single slug from batch24. Print slug, category,
 * voiceRetrofittedAt, and the rewritten first paragraph from the live DB.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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

  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(
    worktreeRoot,
    'docs/voice-retrofit-2026-05-27-batch24/_slugs.json',
  )
  const slugsRaw = JSON.parse(readFileSync(slugsPath, 'utf8'))
  const slugs: string[] = slugsRaw.slugs
  const slug = slugs[Math.floor(Math.random() * slugs.length)]

  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    include: { category: true },
  })
  if (!t) {
    console.log('not found:', slug)
    return
  }

  function flatten(node: any): string {
    if (typeof node?.text === 'string') return node.text
    if (Array.isArray(node?.content)) return node.content.map(flatten).join('')
    return ''
  }

  const body = t.body as any
  const firstPara = body?.content?.find((n: any) => n.type === 'paragraph')

  console.log('slug:', slug)
  console.log('category:', t.category?.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt)
  console.log('publicURL: https://homemade.education/' + t.category?.slug + '/' + slug)
  console.log()
  console.log('First paragraph:')
  console.log(flatten(firstPara))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
