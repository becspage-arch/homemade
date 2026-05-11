import Link from 'next/link'
import { prisma, ReportStatus, ReportTargetType } from '@homemade/db'
import { ReportCard, type ReportWithTarget } from './report-card'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'Open', value: ReportStatus.OPEN },
  { label: 'Action taken', value: ReportStatus.RESOLVED_ACTION_TAKEN },
  { label: 'No action', value: ReportStatus.RESOLVED_NO_ACTION },
  { label: 'Dismissed', value: ReportStatus.DISMISSED },
  { label: 'All', value: 'all' },
]

const TARGET_FILTERS: { label: string; value: ReportTargetType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reviews', value: ReportTargetType.REVIEW },
  { label: 'Photos', value: ReportTargetType.PHOTO },
  { label: 'Questions', value: ReportTargetType.QUESTION },
  { label: 'Answers', value: ReportTargetType.ANSWER },
  { label: 'Users', value: ReportTargetType.USER },
]

interface PageProps {
  searchParams: Promise<{ status?: string; target?: string }>
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { status: statusParam, target: targetParam } = await searchParams
  const activeStatus = statusParam ?? ReportStatus.OPEN
  const activeTarget = targetParam ?? 'all'

  const where: {
    status?: ReportStatus
    targetType?: ReportTargetType
  } = {}
  if (activeStatus !== 'all') where.status = activeStatus as ReportStatus
  if (activeTarget !== 'all') where.targetType = activeTarget as ReportTargetType

  const reports = await prisma.report.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
    include: {
      reporter: { select: { name: true, email: true, displayHandle: true } },
    },
  })

  // Hydrate target snippets in parallel by type
  const reviewIds = reports.filter((r) => r.targetType === 'REVIEW').map((r) => r.targetId)
  const photoIds = reports.filter((r) => r.targetType === 'PHOTO').map((r) => r.targetId)
  const questionIds = reports.filter((r) => r.targetType === 'QUESTION').map((r) => r.targetId)
  const answerIds = reports.filter((r) => r.targetType === 'ANSWER').map((r) => r.targetId)
  const userIds = reports.filter((r) => r.targetType === 'USER').map((r) => r.targetId)

  const [reviews, photos, questions, answers, users] = await Promise.all([
    prisma.review.findMany({
      where: { id: { in: reviewIds } },
      select: { id: true, body: true, rating: true, status: true },
    }),
    prisma.uGCPhoto.findMany({
      where: { id: { in: photoIds } },
      select: { id: true, caption: true, status: true, media: { select: { cloudflareId: true } } },
    }),
    prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, body: true, status: true },
    }),
    prisma.answer.findMany({
      where: { id: { in: answerIds } },
      select: { id: true, body: true, status: true },
    }),
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true, displayHandle: true, isSuspended: true },
    }),
  ])

  const enriched: ReportWithTarget[] = reports.map((r) => ({
    ...r,
    target:
      r.targetType === 'REVIEW'
        ? reviews.find((x) => x.id === r.targetId)
        : r.targetType === 'PHOTO'
          ? photos.find((x) => x.id === r.targetId)
          : r.targetType === 'QUESTION'
            ? questions.find((x) => x.id === r.targetId)
            : r.targetType === 'ANSWER'
              ? answers.find((x) => x.id === r.targetId)
              : r.targetType === 'USER'
                ? users.find((x) => x.id === r.targetId)
                : undefined,
  }))

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Reports</h1>
          <p>Abuse and spam reports across every UGC type. Acting on a target also closes the report.</p>
        </div>
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? `/admin/reports?status=all&target=${activeTarget}`
                : `/admin/reports?status=${f.value}&target=${activeTarget}`
            }
            className={`admin-filter-chip ${activeStatus === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <div className="admin-filter-row">
        {TARGET_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? `/admin/reports?status=${activeStatus}&target=all`
                : `/admin/reports?status=${activeStatus}&target=${f.value}`
            }
            className={`admin-filter-chip ${activeTarget === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {enriched.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing here.
        </p>
      ) : (
        enriched.map((r) => <ReportCard key={r.id} report={r} />)
      )}
    </div>
  )
}
