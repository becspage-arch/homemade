import { prisma } from '@homemade/db'
import { ChartCard } from '@/components/admin/analytics/chart-card'
import { CohortHeatmap } from '@/components/admin/analytics/cohort-heatmap'

export const dynamic = 'force-dynamic'

export default async function CohortsPage() {
  const rows = await prisma.analyticsCohortRollup.findMany({
    orderBy: [{ cohortWeek: 'desc' }, { weeksAfterSignup: 'asc' }],
  })

  const maxWeek = rows.reduce((m, r) => Math.max(m, r.weeksAfterSignup), 0)

  return (
    <ChartCard
      title="Cohort retention"
      description="One row per signup week. Each cell shows the share of that cohort who fired any analytics event during the named week after signup. Darker sage = higher retention. Updated nightly by the rollup cron."
      fullBleed
    >
      <CohortHeatmap cells={rows} maxWeek={maxWeek} />
    </ChartCard>
  )
}
