import Link from 'next/link'
import { prisma, DmcaStatus } from '@homemade/db'
import { DmcaCard } from './dmca-card'
import { DmcaIntakeForm } from './intake-form'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: DmcaStatus | 'all' }[] = [
  { label: 'Received', value: DmcaStatus.RECEIVED },
  { label: 'Under review', value: DmcaStatus.UNDER_REVIEW },
  { label: 'Action taken', value: DmcaStatus.ACTION_TAKEN },
  { label: 'Rejected', value: DmcaStatus.REJECTED },
  { label: 'Counter-noticed', value: DmcaStatus.COUNTER_NOTICED },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminDmcaPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? DmcaStatus.RECEIVED
  const where = active === 'all' ? {} : { status: active as DmcaStatus }

  const requests = await prisma.dmcaTakedownRequest.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
    include: {
      resolvedBy: { select: { id: true, name: true, email: true, displayHandle: true } },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>DMCA / takedown queue</h1>
          <p>
            Copyright takedown notices we have received by email. Until the
            public submission form lands, an admin transcribes each notice
            into the form below.
          </p>
        </div>
      </div>

      <DmcaIntakeForm />

      <div className="admin-filter-row" style={{ marginTop: 32 }}>
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/community/dmca?status=all'
                : `/admin/community/dmca?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing in this state.
        </p>
      ) : (
        requests.map((r) => (
          <DmcaCard
            key={r.id}
            request={{
              id: r.id,
              claimantName: r.claimantName,
              claimantEmail: r.claimantEmail,
              claimantAddress: r.claimantAddress,
              contentUrl: r.contentUrl,
              contentDescription: r.contentDescription,
              status: r.status,
              actionTakenNote: r.actionTakenNote,
              createdAt: r.createdAt.toISOString(),
              resolvedAt: r.resolvedAt?.toISOString() ?? null,
              resolvedBy: r.resolvedBy
                ? r.resolvedBy.displayHandle ??
                  r.resolvedBy.name ??
                  r.resolvedBy.email
                : null,
            }}
          />
        ))
      )}
    </div>
  )
}
