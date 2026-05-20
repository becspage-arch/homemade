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

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    type Row = {
      id: string
      slug: string
      pipelineStatus: string
      targetTutorialCount: number | null
      lastAutopilotRunAt: Date | null
      launchOrder: number | null
      published_count: number
    }

    const rows = await prisma.$queryRaw<Row[]>`
      SELECT c.id,
             c.slug,
             c."pipelineStatus",
             c."targetTutorialCount",
             c."lastAutopilotRunAt",
             c."launchOrder",
             (
               SELECT COUNT(*)::int
               FROM "Tutorial" t
               WHERE t."categoryId" = c.id
                 AND t.status = 'PUBLISHED'
             ) AS published_count
      FROM "Category" c
      WHERE c."pipelineStatus" = 'READY'
      ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
      LIMIT 10
    `

    const statusCounts = await prisma.category.groupBy({
      by: ['pipelineStatus'],
      _count: { pipelineStatus: true },
    })

    console.log('STATUS_COUNTS:' + JSON.stringify(statusCounts))
    console.log('READY_ROWS:' + JSON.stringify(rows))

    if (rows.length === 0) {
      console.log('NO_CANDIDATES')
    } else {
      const pick = rows[0]
      console.log('PICKED:' + JSON.stringify(pick))
      if (
        pick.targetTutorialCount !== null &&
        pick.published_count >= pick.targetTutorialCount
      ) {
        console.log('ALREADY_COMPLETE_NEEDS_FLIP:' + pick.slug)
      }
    }
  } catch (e: any) {
    console.error('ERR:' + e.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}
main()
