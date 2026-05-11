import Link from 'next/link'
import { prisma, TutorialStatus, type Prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

type StatusFilter = 'ALL' | TutorialStatus

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'all' },
  { value: TutorialStatus.DRAFT, label: 'draft' },
  { value: TutorialStatus.PENDING_MODERATION, label: 'pending moderation' },
  { value: TutorialStatus.SCHEDULED, label: 'scheduled' },
  { value: TutorialStatus.PUBLISHED, label: 'published' },
  { value: TutorialStatus.ARCHIVED, label: 'archived' },
]

function parseStatus(raw: string | undefined): StatusFilter {
  if (!raw) return 'ALL'
  const upper = raw.toUpperCase()
  if (upper === 'ALL') return 'ALL'
  if ((Object.values(TutorialStatus) as string[]).includes(upper)) {
    return upper as TutorialStatus
  }
  return 'ALL'
}

export default async function TutorialsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const filter = parseStatus(params.status)

  const where: Prisma.TutorialWhereInput =
    filter === 'ALL' ? {} : { status: filter }

  const tutorials = await prisma.tutorial.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      category: { select: { name: true } },
      author: { select: { email: true, name: true } },
    },
  })

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <h1
          className="text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Tutorials
        </h1>
        <Link
          href="/admin/tutorials/new"
          className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          new tutorial
        </Link>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value
          const href =
            f.value === 'ALL'
              ? '/admin/tutorials'
              : `/admin/tutorials?status=${f.value}`
          return (
            <Link
              key={f.value}
              href={href}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.25em] transition ${
                active
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)] text-[var(--color-linen-cream)]'
                  : 'border-[var(--color-linen-grey)] text-[var(--color-warm-taupe)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage)]'
              }`}
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              {f.label}
            </Link>
          )
        })}
      </nav>

      {tutorials.length === 0 ? (
        <p
          className="mt-12 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {filter === 'ALL'
            ? 'No tutorials yet. Create one to get started.'
            : `No ${filter.toLowerCase()} tutorials.`}
        </p>
      ) : (
        <table className="mt-10 w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-linen-grey)] text-left">
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Last edited</Th>
              <Th>Published</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {tutorials.map((t) => (
              <tr key={t.id} className="border-b border-[var(--color-linen-grey)]">
                <Td>
                  <div
                    className="text-[var(--color-espresso)]"
                    style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.15rem' }}
                  >
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-warm-taupe)] opacity-70">
                    <code>{t.slug}</code>
                  </div>
                </Td>
                <Td>{t.category.name}</Td>
                <Td>
                  <StatusBadge status={t.status} />
                  {t.status === TutorialStatus.SCHEDULED && t.scheduledFor && (
                    <div className="mt-1 text-xs italic text-[var(--color-warm-taupe)] opacity-70">
                      for {t.scheduledFor.toLocaleDateString('en-GB')}
                    </div>
                  )}
                </Td>
                <Td>{t.updatedAt.toLocaleDateString('en-GB')}</Td>
                <Td>
                  {t.publishedAt
                    ? t.publishedAt.toLocaleDateString('en-GB')
                    : '—'}
                </Td>
                <Td>
                  <Link
                    href={`/admin/tutorials/${t.id}`}
                    className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
                    style={{ fontFamily: 'var(--font-lora)' }}
                  >
                    edit
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: TutorialStatus }) {
  const tone =
    status === TutorialStatus.PUBLISHED
      ? 'bg-[var(--color-forest)] text-[var(--color-linen-cream)]'
      : status === TutorialStatus.SCHEDULED
        ? 'bg-[var(--color-honey)] text-[var(--color-espresso)]'
        : status === TutorialStatus.ARCHIVED
          ? 'bg-[var(--color-stone)] text-[var(--color-espresso)]'
          : status === TutorialStatus.PENDING_MODERATION
            ? 'bg-[var(--color-burnt-sienna)] text-[var(--color-linen-cream)]'
            : status === TutorialStatus.IN_REVIEW
              ? 'bg-[var(--color-dusty-blush)] text-[var(--color-espresso)]'
              : 'border border-[var(--color-linen-grey)] text-[var(--color-warm-taupe)]'
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-[10px] uppercase tracking-[0.25em] ${tone}`}
      style={{ fontFamily: 'var(--font-lora)' }}
    >
      {status.toLowerCase().replace('_', ' ')}
    </span>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      className="py-3 text-xs uppercase text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.18em', fontWeight: 500 }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children?: React.ReactNode }) {
  return (
    <td
      className="py-4 align-top text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)' }}
    >
      {children}
    </td>
  )
}
