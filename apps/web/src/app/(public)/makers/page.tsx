import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma, CreatorApplicationStatus, TutorialStatus } from '@homemade/db'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbSchema } from '@/lib/seo/schema-builders'

import './makers.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Makers on Homemade — independent creators',
  description:
    'Independent makers writing tutorials in their own voice. Verified by the Homemade editorial team.',
  path: '/makers',
  ogType: 'website',
})

interface PageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function MakersIndexPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sort = params.sort === 'alpha' ? 'alpha' : 'recent'

  const creators = await prisma.user.findMany({
    where: {
      isCreator: true,
      displayHandle: { not: null },
      creatorProfile: {
        applicationStatus: CreatorApplicationStatus.APPROVED,
      },
    },
    orderBy:
      sort === 'alpha'
        ? [{ displayHandle: 'asc' }]
        : [{ creatorVerifiedAt: 'desc' }],
    select: {
      id: true,
      name: true,
      displayHandle: true,
      creatorVerifiedAt: true,
      creatorProfile: {
        select: { bio: true, specialty: true },
      },
      _count: {
        select: {
          tutorialsCreated: {
            where: { status: TutorialStatus.PUBLISHED },
          },
        },
      },
    },
  })

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Makers', href: '/makers' },
  ]

  return (
    <div className="makers-page">
      <JsonLd data={buildBreadcrumbSchema(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} />
      <header className="makers-header">
        <span className="makers-eyebrow">The makers</span>
        <h1 className="makers-title">People who make things at Homemade</h1>
        <p className="makers-intro">
          Independent makers writing tutorials in their own voice. Approved
          and verified by the Homemade editorial team.
        </p>
        <div className="makers-filters">
          <Link
            href="/makers"
            className={`makers-filter ${sort === 'recent' ? 'active' : ''}`}
          >
            Recently active
          </Link>
          <Link
            href="/makers?sort=alpha"
            className={`makers-filter ${sort === 'alpha' ? 'active' : ''}`}
          >
            By handle
          </Link>
        </div>
      </header>

      {creators.length === 0 ? (
        <p className="makers-empty">
          No makers yet. The first ones come through soon.
        </p>
      ) : (
        <div className="makers-grid">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/makers/${c.displayHandle}`}
              className="maker-card"
            >
              <div className="maker-card-avatar" aria-hidden="true">
                {(c.name ?? c.displayHandle ?? 'h').slice(0, 1).toUpperCase()}
              </div>
              <div className="maker-card-body">
                <span className="maker-card-name">
                  {c.name ?? c.displayHandle}
                  {c.creatorVerifiedAt && (
                    <VerifiedDot />
                  )}
                </span>
                <span className="maker-card-handle">@{c.displayHandle}</span>
                {c.creatorProfile?.specialty && (
                  <span className="maker-card-specialty">
                    {c.creatorProfile.specialty}
                  </span>
                )}
                <span className="maker-card-meta">
                  {c._count.tutorialsCreated === 0
                    ? 'No published tutorials yet'
                    : c._count.tutorialsCreated === 1
                      ? '1 published tutorial'
                      : `${c._count.tutorialsCreated} published tutorials`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function VerifiedDot() {
  return (
    <span
      className="maker-verified-dot"
      aria-label="Verified maker"
      title="Verified maker"
    >
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <circle cx="6" cy="6" r="5.4" fill="currentColor" />
        <path
          d="M3.5 6.2l1.7 1.7 3.3-3.3"
          stroke="var(--color-cream)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
