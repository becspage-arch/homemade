import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

import { prisma } from '../src'

function flat(n: any): string {
  if (typeof n?.text === 'string') return n.text
  if (Array.isArray(n?.content)) return n.content.map(flat).join('')
  return ''
}

async function main() {
  const batchId = process.argv[2]
  if (!batchId) throw new Error('batch id required')
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugList = JSON.parse(
    readFileSync(resolve(worktreeRoot, `docs/voice-retrofit-${batchId}/_slugs.json`), 'utf8'),
  ) as Array<{ slug: string; categorySlug: string }>

  const count = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`PUBLISHED with voiceRetrofittedAt set : ${count}`)
  console.log(`PUBLISHED with voiceRetrofittedAt NULL: ${remaining}`)

  const pick = slugList[Math.floor(Math.random() * slugList.length)]
  const t = await prisma.tutorial.findUnique({
    where: { slug: pick.slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  console.log('\nSPOT CHECK:')
  console.log(`  slug: ${t?.slug}`)
  console.log(`  voiceRetrofittedAt: ${t?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  url: https://homemade.education/${t?.category?.slug}/${t?.slug}`)
  const body: any = t?.body
  const firstPara = body?.content?.find((n: any) => n.type === 'paragraph')
  console.log(`  first paragraph: ${flat(firstPara).slice(0, 600)}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
