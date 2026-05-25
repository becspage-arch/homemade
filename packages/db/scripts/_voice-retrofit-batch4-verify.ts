/**
 * Verification queries for the voice-retrofit batch4 hand-off file.
 * Reports the before/after retrofit counts, a spot-check timestamp,
 * and the remaining unretrofitted pool size. One-off helper.
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

  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const unretrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`Retrofitted (voiceRetrofittedAt IS NOT NULL): ${retrofitted}`)
  console.log(`Unretrofitted (voiceRetrofittedAt IS NULL): ${unretrofitted}`)

  // Pick a random tutorial from batch4 and show its timestamp + opening paragraph.
  const slug = 'fennel-seed-tea'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  if (t) {
    console.log(`\nSpot-check: ${slug}`)
    console.log(`  voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString() ?? 'null'}`)
    console.log(`  category slug: ${t.category?.slug}`)
    const firstPara = (t.body as any)?.content?.find((n: any) => n.type === 'paragraph')
    const firstText = firstPara?.content?.map((c: any) => c.text ?? '').join('') ?? ''
    console.log(`  first paragraph (live DB): ${firstText.slice(0, 400)}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
