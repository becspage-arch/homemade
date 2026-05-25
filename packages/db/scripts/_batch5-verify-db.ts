/**
 * Verify DB state for batch5: count of voiceRetrofittedAt populated rows
 * and a spot-check on a random batch slug.
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const totalPublished: any = await prisma.tutorial.count({
    where: { status: 'PUBLISHED' },
  })

  const allPublished: any[] = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  const retrofitted = allPublished.filter((t: any) => t.voiceRetrofittedAt !== null)
  const remaining = allPublished.filter((t: any) => t.voiceRetrofittedAt === null)

  console.log(`PUBLISHED total: ${totalPublished}`)
  console.log(`voiceRetrofittedAt populated: ${retrofitted.length}`)
  console.log(`voiceRetrofittedAt IS NULL (remaining): ${remaining.length}`)

  // Spot-check
  const spot: any = await prisma.tutorial.findUnique({
    where: { slug: 'ginger-profile' },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
      body: true,
    },
  })
  if (spot) {
    console.log(`\nSPOT CHECK`)
    console.log(`slug: ${spot.slug}`)
    console.log(`voiceRetrofittedAt: ${spot.voiceRetrofittedAt?.toISOString?.()}`)
    console.log(`categorySlug: ${spot.category?.slug}`)
    const firstPara = (spot.body as any)?.content?.find((n: any) => n.type === 'paragraph')
    const firstText = firstPara?.content?.map((c: any) => c.text).join('') ?? ''
    console.log(`first paragraph text:`)
    console.log(firstText)
  } else {
    console.log(`SPOT CHECK: ginger-profile not found`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
