import Link from 'next/link'
import { prisma, UGCStatus } from '@homemade/db'
import { QuestionModerationCard } from './question-card'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: UGCStatus | 'all' }[] = [
  { label: 'Pending', value: UGCStatus.PENDING_MODERATION },
  { label: 'Published', value: UGCStatus.PUBLISHED },
  { label: 'Hidden', value: UGCStatus.HIDDEN },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminQuestionsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? UGCStatus.PENDING_MODERATION
  const where = active === 'all' ? {} : { status: active as UGCStatus }

  const questions = await prisma.question.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
    include: {
      user: { select: { name: true, email: true, displayHandle: true } },
      tutorial: {
        select: {
          title: true,
          slug: true,
          category: { select: { slug: true, name: true } },
        },
      },
      answers: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { name: true, email: true, displayHandle: true } },
        },
      },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Q&amp;A</h1>
          <p>Approve questions and answers, or post a direct answer as an editor.</p>
        </div>
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/questions?status=all'
                : `/admin/questions?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {questions.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing here.
        </p>
      ) : (
        questions.map((q) => <QuestionModerationCard key={q.id} question={q} />)
      )}
    </div>
  )
}
