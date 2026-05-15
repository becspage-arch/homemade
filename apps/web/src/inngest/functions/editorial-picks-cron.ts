import 'server-only'
import { inngest } from '../client'
import { regenerateUpcomingEditorialPicks } from '@/lib/editorial-picks'

/**
 * Sunday 22:00 UTC — recompute the next four weeks of editorial picks.
 *
 * Pinned and manually-replaced rows are preserved; everything else gets
 * regenerated against the latest engagement signals + the seasonal calendar
 * walked forward for each future week.
 */
export const editorialPicksRefresh = inngest.createFunction(
  {
    id: 'editorial-picks-refresh',
    name: 'Editorial picks: weekly refresh',
    triggers: [{ cron: '0 22 * * 0' }],
  },
  async ({ step }) => {
    // Pre-serialise the date inside the step so the inngest wrapper doesn't
    // try to revive it. Step return values flow through JSON.
    const result = await step.run('regenerate', async () => {
      const r = await regenerateUpcomingEditorialPicks()
      return {
        weeksProcessed: r.weeksProcessed.map((w) => ({
          weekStarting: w.weekStarting.toISOString(),
          auto: w.auto,
          preserved: w.preserved,
        })),
      }
    })
    return {
      weeksProcessed: result.weeksProcessed.length,
      detail: result.weeksProcessed,
    }
  },
)
