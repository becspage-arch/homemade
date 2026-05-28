import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  const slugFile = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch11/_slugs.json')
  const slugs = JSON.parse(readFileSync(slugFile, 'utf8')) as string[]
  // pick a random slug
  const slug = slugs[Math.floor(Math.random() * slugs.length)] as string
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, title: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  console.log('Spot-check slug:', t.slug)
  console.log('Title:', t.title)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString())
  console.log('Public URL:', `https://homemade.education/${t.category?.slug}/${t.slug}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
