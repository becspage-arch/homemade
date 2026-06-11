import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { captureEvent } from '@/lib/server-analytics'
import { getOrCreateSessionId } from '@/lib/analytics-session'
import { getStudioGateCopy } from '@/lib/studio/premium-gates'
import { getDesignConfig } from '@/lib/sewing/grading/design-registry'
import '@/app/studio/sewing/personalise/personalise.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ designSlug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { designSlug } = await params
  const cfg = getDesignConfig(designSlug)
  return {
    title: cfg ? `Combine ${cfg.name} · homemade` : 'Combine patterns · homemade',
    robots: { index: false, follow: false },
  }
}

export default async function SewingCombinePage({ params }: PageProps) {
  const { designSlug } = await params
  const cfg = getDesignConfig(designSlug)
  if (!cfg) notFound()

  const user = await getCurrentDbUser()
  const copy = getStudioGateCopy('SEWING_PATTERN_COMBINATION')
  const sessionId = await getOrCreateSessionId().catch(() => 'server')
  void captureEvent({
    event: 'sewing_premium_gate_encountered',
    distinctId: user?.clerkId ?? `anon:${sessionId}`,
    properties: {
      gate_key: 'SEWING_PATTERN_COMBINATION',
      signed_in: Boolean(user),
      would_upgrade: false,
    },
  }).catch(() => {})

  return (
    <div className="sew-pers-surface">
      <header className="sew-pers-header">
        <nav className="sew-pers-crumbs" aria-label="Breadcrumb">
          <Link href="/studio/sewing">Sewing Studio</Link>
          <span aria-hidden>›</span>
          <Link href="/studio/sewing/personalise">Personalise</Link>
          <span aria-hidden>›</span>
          <span>Combine</span>
        </nav>
        <h1 className="sew-pers-heading">Combine {cfg.name} with another design</h1>
      </header>
      <div className="sew-pers-upgrade-block">
        <p className="sew-pers-upgrade-message">Coming soon.</p>
        <p className="sew-pers-upgrade-rationale">{copy.rationale}</p>
      </div>
    </div>
  )
}
