import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const categories = await prisma.$queryRaw<Array<{
    id: string;
    slug: string;
    pipelineStatus: string;
    targetTutorialCount: number | null;
    lastAutopilotRunAt: Date | null;
    launchOrder: number | null;
    published_count: number;
  }>>`
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
               AND t."status" = 'PUBLISHED'
           ) AS published_count
    FROM "Category" c
    WHERE c."pipelineStatus" = 'READY'
    ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
    LIMIT 1
  `;

  if (categories.length === 0) {
    const counts = await prisma.$queryRaw<Array<{pipelineStatus: string; count: number}>>`
      SELECT "pipelineStatus", COUNT(*)::int as count FROM "Category" GROUP BY "pipelineStatus"
    `
    console.log('NO_CANDIDATE')
    console.log('COUNTS:' + JSON.stringify(counts))
    await prisma.$disconnect()
    return
  }

  const picked = categories[0]

  if (picked.targetTutorialCount !== null && picked.published_count >= picked.targetTutorialCount) {
    console.log(`AUTO_COMPLETE:${picked.slug} published=${picked.published_count} target=${picked.targetTutorialCount}`)
    await prisma.category.update({
      where: { id: picked.id },
      data: { pipelineStatus: 'COMPLETE' },
    })
    await prisma.$disconnect()
    return
  }

  console.log(`PICKED:${picked.slug}`)
  console.log(`ID:${picked.id}`)
  console.log(`PUBLISHED:${picked.published_count}`)
  console.log(`TARGET:${picked.targetTutorialCount ?? 'null'}`)
  console.log(`LAST_RUN:${picked.lastAutopilotRunAt ?? 'null'}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1); })
