/**
 * Pick one random slug from batch38, show its voiceRetrofittedAt and first
 * paragraph for handoff spot-check.
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch38/_slugs.json')
  const slugs: string[] = JSON.parse(readFileSync(slugsPath, 'utf8'))
  const slug = slugs[Math.floor(Math.random() * slugs.length)]

  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })

  console.log(`slug: ${t.slug}`)
  console.log(`category: ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`url: https://homemade.education/${t.category?.slug}/${t.slug}`)

  const body: any = t.body
  const firstPara = body?.content?.find((n: any) => n.type === 'paragraph')
  const firstText = firstPara?.content?.map((c: any) => c.text || '').join('')
  console.log(`\nFirst paragraph:\n${firstText}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
