/**
 * Spot-check one slug's voiceRetrofittedAt + first body paragraph text.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage: _voice-retrofit-spot.ts <slug>')
    process.exit(1)
  }
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
    console.log(`not found: ${slug}`)
    process.exit(1)
  }
  console.log(`slug:                ${t.slug}`)
  console.log(`category:            ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt:  ${t.voiceRetrofittedAt?.toISOString() ?? 'null'}`)
  console.log(`URL:                 https://homemade.education/${t.category?.slug}/${t.slug}`)
  const body = t.body
  if (body?.content) {
    const firstPara = body.content.find((n: any) => n.type === 'paragraph')
    if (firstPara?.content) {
      const text = firstPara.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('')
      console.log(`\nfirst paragraph:`)
      console.log(text)
    }
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
