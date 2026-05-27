/**
 * Spot-check a slug actually rewritten this batch. Print the rewritten paragraph
 * pulled fresh from the DB so the hand-off can show "the live state matches the
 * intended rewrite".
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

async function main() {
  const { prisma } = await import('../src/index.js')

  const slug = 'beef-stroganoff'
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
  const para13 = body?.content?.[13]

  console.log('slug:', slug)
  console.log('category:', t.category?.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt)
  console.log('publicURL: https://homemade.education/' + t.category?.slug + '/' + slug)
  console.log()
  console.log('body.content[13]:')
  console.log(flatten(para13))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
