/**
 * Inline pre-flight for the `autopilot-queue` scheduled task (steps 0-2):
 *   0. Manual pause (AutopilotPauseState for stream 'queue' or 'global')
 *      + env-flag pause (AUTOPILOT_PAUSED=true)
 *   1. Pick the next category via round-robin (READY, oldest
 *      lastAutopilotRunAt first, then launchOrder)
 *      - Auto-flip to COMPLETE if publishedCount >= targetTutorialCount
 *        (publish-hook race)
 *   2. Claim the slot (set lastAutopilotRunAt = now)
 *
 * On halt, prints a JSON line `{"action":"halt","reason":"...","detail":"..."}`
 * and exits 0 (clean exit — caller writes the halt signal).
 * On success, prints `{"action":"pick","category":{slug,id,...}}` and exits 0.
 * On hard error, prints to stderr and exits 1.
 *
 * Existing pause helper (`check-autopilot-pause-state.ts`) only accepts
 * cooking/baking/mindset streams, so this script handles the queue/global
 * pause check inline.
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

function emit(payload: Record<string, unknown>): void {
  process.stdout.write(JSON.stringify(payload) + '\n')
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (process.env.AUTOPILOT_PAUSED === 'true') {
    emit({
      action: 'halt',
      reason: 'ENV_PAUSED',
      detail: 'AUTOPILOT_PAUSED=true read at preflight',
    })
    await prisma.$disconnect()
    return
  }

  const pauseRows = await prisma.autopilotPauseState.findMany({
    where: {
      streamName: { in: ['queue', 'global'] },
      pausedAt: { not: null },
    },
  })
  if (pauseRows.length > 0) {
    const summary = pauseRows
      .map(
        (r) =>
          `${r.streamName} paused at ${r.pausedAt?.toISOString() ?? '?'} by ${
            r.pausedById ?? '?'
          }: ${r.reason ?? 'no reason provided'}`,
      )
      .join(' | ')
    emit({ action: 'halt', reason: 'MANUAL_PAUSE', detail: summary })
    await prisma.$disconnect()
    return
  }

  const stateCounts = {
    READY: 0,
    NOT_READY: 0,
    COMPLETE: 0,
    PAUSED: 0,
  } as Record<string, number>
  const allCats = await prisma.category.findMany({
    select: { pipelineStatus: true },
  })
  for (const c of allCats) {
    const k = c.pipelineStatus as string
    if (stateCounts[k] !== undefined) stateCounts[k]++
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = await prisma.category.findFirst({
      where: { pipelineStatus: 'READY' },
      orderBy: [
        { lastAutopilotRunAt: { sort: 'asc', nulls: 'first' } },
        { launchOrder: 'asc' },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        pipelineStatus: true,
        targetTutorialCount: true,
        lastAutopilotRunAt: true,
        launchOrder: true,
      },
    })

    if (!candidate) {
      const noneReady = stateCounts.READY === 0
      const allDone =
        stateCounts.NOT_READY === 0 &&
        stateCounts.READY === 0 &&
        stateCounts.PAUSED === 0
      emit({
        action: 'halt',
        reason: 'ALL_CATEGORIES_COMPLETE_OR_NOT_READY',
        detail: `READY=${stateCounts.READY} NOT_READY=${stateCounts.NOT_READY} COMPLETE=${stateCounts.COMPLETE} PAUSED=${stateCounts.PAUSED}`,
        noneReady,
        allDone,
      })
      await prisma.$disconnect()
      return
    }

    const published = await prisma.tutorial.count({
      where: { categoryId: candidate.id, status: 'PUBLISHED' },
    })

    if (
      candidate.targetTutorialCount !== null &&
      candidate.targetTutorialCount !== undefined &&
      published >= candidate.targetTutorialCount
    ) {
      await prisma.category.update({
        where: { id: candidate.id },
        data: { pipelineStatus: 'COMPLETE' },
      })
      stateCounts.READY = Math.max(0, stateCounts.READY - 1)
      stateCounts.COMPLETE++
      continue
    }

    await prisma.category.update({
      where: { id: candidate.id },
      data: { lastAutopilotRunAt: new Date() },
    })

    emit({
      action: 'pick',
      category: {
        id: candidate.id,
        slug: candidate.slug,
        name: candidate.name,
        targetTutorialCount: candidate.targetTutorialCount,
        publishedCount: published,
        previousLastAutopilotRunAt:
          candidate.lastAutopilotRunAt?.toISOString() ?? null,
        launchOrder: candidate.launchOrder,
      },
      stateCounts,
    })
    await prisma.$disconnect()
    return
  }

  emit({
    action: 'halt',
    reason: 'PICK_LOOP_EXHAUSTED',
    detail: 'Round-robin retries exceeded',
  })
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[_autopilot-queue-preflight] failed:', err)
  process.exit(1)
})
