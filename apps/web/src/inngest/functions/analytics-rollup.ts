import 'server-only'
import { inngest } from '../client'
import { rollupRange } from '@/lib/analytics-rollup'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Daily 02:00 UTC — rolls up yesterday's events into AnalyticsDailyRollup +
 * refreshes the cohort retention rollup. Idempotent — re-running for a
 * date that's already processed is a no-op unless `force: true`.
 */
export const analyticsRollupNightly = inngest.createFunction(
  {
    id: 'analytics-rollup-nightly',
    name: 'Analytics: nightly daily + cohort rollup',
    triggers: [{ cron: '0 2 * * *' }],
  },
  async ({ step }) => {
    const result = await step.run('rollup-yesterday', async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - MS_PER_DAY)
      const r = await rollupRange({ from: yesterday, to: yesterday })
      return { datesProcessed: r.datesProcessed }
    })
    return result
  },
)

/**
 * Manual / admin-triggered backfill. Fired from the "re-run analytics
 * rollup" button in /admin/system/jobs. Payload: { from, to } as ISO date
 * strings, both inclusive. `force: true` re-processes dates already marked
 * complete.
 */
export const analyticsRollupBackfill = inngest.createFunction(
  {
    id: 'analytics-rollup-backfill',
    name: 'Analytics: manual backfill',
    triggers: [{ event: 'analytics/rollup.backfill' }],
  },
  async ({ event, step }) => {
    const from = new Date(event.data.from)
    const to = new Date(event.data.to)
    const force = Boolean(event.data.force)
    const result = await step.run('backfill', async () => {
      const r = await rollupRange({ from, to, force })
      return { datesProcessed: r.datesProcessed }
    })
    return result
  },
)
