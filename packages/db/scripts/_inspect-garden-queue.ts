import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const cats = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: {
      slug: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      targetTutorialCount: true,
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
  })

  console.log(`AUTOPILOT QUEUE (READY only, NULLS LAST on lastAutopilotRunAt)`)
  console.log(`pos | slug                  | last fire        | target`)
  let pos = 1
  for (const c of cats) {
    const fire = c.lastAutopilotRunAt
      ? c.lastAutopilotRunAt.toISOString().slice(0, 16).replace('T', ' ')
      : '— (NULL)'
    const mark = c.slug === 'garden' ? '  <-- garden' : ''
    console.log(
      `${String(pos).padStart(3)} | ${c.slug.padEnd(21)} | ${fire.padEnd(16)} | ${String(c.targetTutorialCount ?? 'null').padStart(5)}${mark}`,
    )
    pos += 1
  }

  // Garden sub-cats specifically
  const garden = await prisma.category.findUnique({
    where: { slug: 'garden' },
    select: { id: true },
  })
  if (garden) {
    const subs = await prisma.subCategory.findMany({
      where: { categoryId: garden.id, autopilotEnabled: true },
      orderBy: { order: 'asc' },
      select: { slug: true, order: true, autopilotEnabled: true },
    })
    console.log(`\nGARDEN sub-cats with autopilotEnabled=true (autopilot pool, ${subs.length} entries):`)
    for (const s of subs) {
      console.log(`  ${s.slug.padEnd(28)} order=${s.order}`)
    }
    const stubs = await prisma.subCategory.findMany({
      where: { categoryId: garden.id, autopilotEnabled: false },
      orderBy: { order: 'asc' },
      select: { slug: true, order: true },
    })
    console.log(`\nGARDEN sub-cats with autopilotEnabled=false (specialist stubs, ${stubs.length} entries):`)
    for (const s of stubs) {
      console.log(`  ${s.slug.padEnd(28)} order=${s.order}`)
    }
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
