import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  
  // Get all category counts for summary
  const allCats = await prisma.category.groupBy({
    by: ['pipelineStatus'],
    _count: { id: true },
  })
  const summary: Record<string, number> = {}
  for (const r of allCats) summary[r.pipelineStatus] = r._count.id
  console.log('PIPELINE_SUMMARY:', JSON.stringify(summary))

  let picked = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidates = await prisma.category.findMany({
      where: { pipelineStatus: 'READY' },
      orderBy: [
        { lastAutopilotRunAt: 'asc' },
        { launchOrder: 'asc' },
      ],
      take: 5,
    })
    
    if (candidates.length === 0) {
      console.log('NO_READY_CANDIDATES')
      process.exit(3)
    }

    // For each candidate, count published tutorials
    for (const cat of candidates) {
      const publishedCount = await prisma.tutorial.count({
        where: { categoryId: cat.id, status: 'PUBLISHED' },
      })
      
      if (cat.targetTutorialCount !== null && publishedCount >= cat.targetTutorialCount) {
        // Flip to COMPLETE
        await prisma.category.update({
          where: { id: cat.id },
          data: { pipelineStatus: 'COMPLETE' },
        })
        console.log(`FLIPPED_COMPLETE: ${cat.slug} (${publishedCount}/${cat.targetTutorialCount})`)
        continue
      }
      
      // This one is good
      picked = { ...cat, publishedCount }
      break
    }
    
    if (picked) break
  }
  
  if (!picked) {
    console.log('NO_VALID_CANDIDATE')
    process.exit(3)
  }
  
  console.log('PICKED:', JSON.stringify({
    id: picked.id,
    slug: picked.slug,
    pipelineStatus: picked.pipelineStatus,
    targetTutorialCount: picked.targetTutorialCount,
    publishedCount: picked.publishedCount,
    lastAutopilotRunAt: picked.lastAutopilotRunAt,
    launchOrder: picked.launchOrder,
  }))
}
main().catch(e => { console.error(e); process.exit(1) })
