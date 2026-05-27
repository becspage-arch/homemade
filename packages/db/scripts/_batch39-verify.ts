/**
 * Verify batch39 voice-retrofit state for hand-off.
 *  - count PUBLISHED with voiceRetrofittedAt NOT NULL
 *  - count remaining PUBLISHED with voiceRetrofittedAt IS NULL
 *  - pick a random batch39 slug and dump its voiceRetrofittedAt + first paragraph
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
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch39/_slugs.json')
  const slugs: string[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`PUBLISHED with voiceRetrofittedAt NOT NULL: ${retrofitted}`)
  console.log(`PUBLISHED with voiceRetrofittedAt IS NULL: ${remaining}`)

  // Random spot-check
  const idx = Math.floor(Math.random() * slugs.length)
  const slug = slugs[idx]
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    include: { category: true },
  })
  if (!t) {
    console.log(`SPOT slug ${slug} not found`)
    await prisma.$disconnect()
    return
  }
  console.log(`\nSPOT CHECK`)
  console.log(`  slug: ${t.slug}`)
  console.log(`  voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString() ?? 'NULL'}`)
  console.log(`  url: https://homemade.education/${t.category?.slug}/${t.slug}`)

  // First paragraph from body
  const body = t.body as any
  if (body?.content?.length) {
    for (const node of body.content) {
      if (node.type === 'paragraph' && node.content?.length) {
        const text = node.content
          .filter((n: any) => n.type === 'text' || typeof n.text === 'string')
          .map((n: any) => n.text)
          .join('')
        if (text.trim()) {
          console.log(`  first paragraph: ${text}`)
          break
        }
      }
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
