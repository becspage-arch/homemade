import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { captureEvent } from '@/lib/server-analytics'
import { getOrCreateSessionId } from '@/lib/analytics-session'
import { getStudioGateCopy } from '@/lib/studio/premium-gates'
import '@/app/studio/sewing/personalise/personalise.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Visual hack composer · homemade',
  robots: { index: false, follow: false },
}

export default async function SewingHackPage() {
  const user = await getCurrentDbUser()
  const copy = getStudioGateCopy('SEWING_HACK_COMPOSER')
  const sessionId = await getOrCreateSessionId().catch(() => 'server')
  void captureEvent({
    event: 'sewing_premium_gate_encountered',
    distinctId: user?.clerkId ?? `anon:${sessionId}`,
    properties: {
      gate_key: 'SEWING_HACK_COMPOSER',
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
          <span>Visual hack composer</span>
        </nav>
        <h1 className="sew-pers-heading">Visual hack composer</h1>
      </header>
      <div className="sew-pers-upgrade-block">
        <p className="sew-pers-upgrade-message">Coming soon.</p>
        <p className="sew-pers-upgrade-rationale">{copy.rationale}</p>
      </div>
    </div>
  )
}
