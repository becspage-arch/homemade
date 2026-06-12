import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const cats = await p.category.findMany({
  select: {
    id: true,
    slug: true,
    pipelineStatus: true,
    targetTutorialCount: true,
    lastAutopilotRunAt: true,
    launchOrder: true,
    _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
  },
  orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
})
for (const c of cats) {
  const pub = (c._count as any).tutorials ?? 0
  console.log(
    `${c.pipelineStatus.padEnd(15)} | ${c.slug.padEnd(28)} | pub=${String(pub).padStart(5)} | target=${String(c.targetTutorialCount ?? '').padStart(5)} | lastRun=${c.lastAutopilotRunAt?.toISOString() ?? 'null'}`
  )
}
await p.$disconnect()
