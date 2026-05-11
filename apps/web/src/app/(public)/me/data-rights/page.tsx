import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma, DataExportStatus, DeletionStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { expireStaleExports } from '@/lib/data-rights-actions'
import { ExportPanel } from './export-panel'
import { DeletionPanel } from './deletion-panel'
import { CookiePreferencesPanel } from './cookie-preferences-panel'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Data rights — Homemade',
  description: 'Export your data, manage cookie preferences, delete your account.',
}

export default async function DataRightsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  await expireStaleExports(user.id)

  const [exports, deletion] = await Promise.all([
    prisma.dataExportRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.accountDeletionRequest.findUnique({
      where: { userId: user.id },
    }),
  ])

  const latestReady = exports.find((e) => e.status === DataExportStatus.READY)
  const isScheduled = deletion?.status === DeletionStatus.SCHEDULED

  return (
    <>
      <section>
        <span className="me-section-label">Data rights</span>
        <h2 className="me-section-title">Your data</h2>
        <p className="me-section-description">
          Under UK GDPR you can ask for a copy of the data Homemade holds
          about you, ask us to delete it, and change your mind about how
          we use cookies. This page is the quick path. For anything else,
          email{' '}
          <a href="mailto:dpo@homemade.education">dpo@homemade.education</a>.
        </p>
      </section>

      <ExportPanel
        latestReady={
          latestReady
            ? {
                id: latestReady.id,
                fileUrl: latestReady.fileUrl,
                bytes: latestReady.bytes,
                completedAt: latestReady.completedAt?.toISOString() ?? null,
                expiresAt: latestReady.expiresAt?.toISOString() ?? null,
              }
            : null
        }
        history={exports.map((e) => ({
          id: e.id,
          status: e.status,
          createdAt: e.createdAt.toISOString(),
          completedAt: e.completedAt?.toISOString() ?? null,
          expiresAt: e.expiresAt?.toISOString() ?? null,
          error: e.error,
        }))}
      />

      <DeletionPanel
        scheduled={
          isScheduled && deletion
            ? {
                id: deletion.id,
                scheduledFor: deletion.scheduledFor.toISOString(),
                requestedAt: deletion.requestedAt.toISOString(),
              }
            : null
        }
      />

      <CookiePreferencesPanel />
    </>
  )
}
