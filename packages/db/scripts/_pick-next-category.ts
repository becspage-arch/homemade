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

  const result: any = await prisma.$queryRawUnsafe(`
SELECT c.id, c.slug, c."pipelineStatus", c."targetTutorialCount",
       c."lastAutopilotRunAt", c."launchOrder",
       (SELECT COUNT(*)::int FROM "Tutorial" t WHERE t."categoryId" = c.id AND t."status" = 'PUBLISHED') AS published_count
FROM "Category" c
WHERE c."pipelineStatus" = 'READY'
ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
LIMIT 1;
`)

  const counts: any = await prisma.$queryRawUnsafe(`
SELECT "pipelineStatus", COUNT(*)::int AS n
FROM "Category"
GROUP BY "pipelineStatus";
`)

  console.log('PICK:', JSON.stringify(result, null, 2))
  console.log('STATUS_COUNTS:', JSON.stringify(counts, null, 2))
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
