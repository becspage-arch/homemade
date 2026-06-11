import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { getDesignConfig } from '@/lib/sewing/grading/design-registry'
import { getFreesewingShowcase } from '@/lib/sewing/grading/showcase'
import { ALL_FIELDS, type MeasurementField } from '@/lib/sewing/measurements'
import {
  STUDIO_PREMIUM_GATING_ENABLED,
  checkStudioGate,
} from '@/lib/studio/premium-gates'
import { captureEvent } from '@/lib/server-analytics'
import { getOrCreateSessionId } from '@/lib/analytics-session'
import { PersonaliseFlow } from '@/components/studio/sewing/personalise/PersonaliseFlow'
import type {
  SewingDesignSummary,
  SavedMeasurements,
} from '@/components/studio/sewing/personalise/types'
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
    title: cfg
      ? `Personalise ${cfg.name} · homemade`
      : 'Personalise · homemade',
    robots: { index: false, follow: false },
  }
}

export default async function PersonaliseDesignPage({ params }: PageProps) {
  const { designSlug } = await params
  const cfg = getDesignConfig(designSlug)
  if (!cfg) notFound()

  const user = await getCurrentDbUser()
  const showcase = await getFreesewingShowcase(designSlug).catch(() => null)

  // Emit sewing_design_picked at page load. Fire-and-forget per the
  // server-analytics pattern — never blocks the render.
  const sessionId = await getOrCreateSessionId().catch(() => 'server')
  void captureEvent({
    event: 'sewing_design_picked',
    distinctId: user?.clerkId ?? `anon:${sessionId}`,
    properties: {
      designSlug,
      userType: user ? 'signed_in' : 'anon',
    },
  }).catch(() => {
    // analytics never blocks the render
  })

  let saved: SavedMeasurements = { fields: {}, notes: null }
  let preference: 'cm' | 'inches' = 'cm'

  if (user) {
    const row = await prisma.userSewingMeasurements.findUnique({
      where: { userId: user.id },
    })
    const fields: Partial<Record<MeasurementField, number | null>> = {}
    for (const f of ALL_FIELDS) {
      const v = row?.[f]
      fields[f] = v === null || v === undefined ? null : Number(v.toString())
    }
    saved = { fields, notes: row?.notes ?? null }
    preference = user.measurementPreference === 'inches' ? 'inches' : 'cm'
  }

  const gate = checkStudioGate('SEWING_PERSONALISATION', {
    signedIn: Boolean(user),
    isPremium: false, // tier wiring lands in a later phase
  })

  // When the flag is on and the user isn't premium, render the upgrade
  // moment instead of the flow. The flag defaults off during the build
  // phase per the locked premium philosophy.
  if (STUDIO_PREMIUM_GATING_ENABLED && !gate.allowed) {
    void captureEvent({
      event: 'sewing_premium_gate_encountered',
      distinctId: user?.clerkId ?? `anon:${sessionId}`,
      properties: {
        gate_key: 'SEWING_PERSONALISATION',
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
            <span>{cfg.name}</span>
          </nav>
          <h1 className="sew-pers-heading">Personalise {cfg.name}</h1>
        </header>
        <div className="sew-pers-upgrade-block">
          <p className="sew-pers-upgrade-message">{gate.message}</p>
          <p className="sew-pers-upgrade-rationale">{gate.rationale}</p>
        </div>
      </div>
    )
  }

  const designSummary: SewingDesignSummary = {
    slug: cfg.slug,
    name: cfg.name,
    description: cfg.description ?? '',
    genderFamily: cfg.genderFamily,
    skillLevel: cfg.skillLevel,
    requiredMeasurements: cfg.requiredMeasurements,
    optionalMeasurements: cfg.optionalMeasurements,
    options: cfg.options ?? {},
  }

  return (
    <PersonaliseFlow
      design={designSummary}
      saved={saved}
      preference={preference}
      signedIn={Boolean(user)}
      showcaseSvg={showcase?.svg ?? null}
      showcaseAttribution={showcase?.attribution ?? null}
    />
  )
}
