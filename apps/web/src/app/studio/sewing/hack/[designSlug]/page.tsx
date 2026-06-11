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
import { HackComposer } from '@/components/studio/sewing/hack/HackComposer'
import type { HackComposerDesign } from '@/components/studio/sewing/hack/types'
import '@/app/studio/sewing/personalise/personalise.css'
import '@/components/studio/sewing/hack/hack.css'

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
      ? `Hack ${cfg.name} · homemade`
      : 'Hack a sewing pattern · homemade',
    robots: { index: false, follow: false },
  }
}

export default async function SewingHackDesignPage({ params }: PageProps) {
  const { designSlug } = await params
  const cfg = getDesignConfig(designSlug)
  if (!cfg) notFound()

  const user = await getCurrentDbUser()
  const showcase = await getFreesewingShowcase(designSlug).catch(() => null)

  const sessionId = await getOrCreateSessionId().catch(() => 'server')
  void captureEvent({
    event: 'sewing_hack_composer_opened',
    distinctId: user?.clerkId ?? `anon:${sessionId}`,
    properties: {
      designSlug,
      signed_in: Boolean(user),
      surface: 'composer',
    },
  }).catch(() => {})

  let savedFields: Partial<Record<MeasurementField, number | null>> = {}
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
    savedFields = fields
    preference = user.measurementPreference === 'inches' ? 'inches' : 'cm'
  }

  const gate = checkStudioGate('SEWING_HACK_COMPOSER', {
    signedIn: Boolean(user),
    isPremium: false,
  })

  if (STUDIO_PREMIUM_GATING_ENABLED && !gate.allowed) {
    void captureEvent({
      event: 'sewing_hack_premium_gate_encountered',
      distinctId: user?.clerkId ?? `anon:${sessionId}`,
      properties: {
        designSlug,
        signed_in: Boolean(user),
        surface: 'composer',
      },
    }).catch(() => {})

    return (
      <div className="sew-pers-surface">
        <header className="sew-pers-header">
          <nav className="sew-pers-crumbs" aria-label="Breadcrumb">
            <Link href="/studio/sewing">Sewing Studio</Link>
            <span aria-hidden>›</span>
            <Link href="/studio/sewing/hack">Hack a pattern</Link>
            <span aria-hidden>›</span>
            <span>{cfg.name}</span>
          </nav>
          <h1 className="sew-pers-heading">Hack {cfg.name}</h1>
        </header>
        <div className="sew-pers-upgrade-block">
          <p className="sew-pers-upgrade-message">{gate.message}</p>
          <p className="sew-pers-upgrade-rationale">{gate.rationale}</p>
        </div>
        {showcase?.svg ? (
          <div
            className="sew-hack-gate-preview"
            dangerouslySetInnerHTML={{ __html: showcase.svg }}
            aria-label={`${cfg.name} preview`}
          />
        ) : null}
      </div>
    )
  }

  const design: HackComposerDesign = {
    slug: cfg.slug,
    name: cfg.name,
    description: cfg.description ?? '',
    genderFamily: cfg.genderFamily,
    skillLevel: cfg.skillLevel,
    requiredMeasurements: cfg.requiredMeasurements,
    optionalMeasurements: cfg.optionalMeasurements,
    options: cfg.options ?? {},
    hackHandles: cfg.hackHandles ?? [],
  }

  return (
    <HackComposer
      design={design}
      savedFields={savedFields}
      preference={preference}
      signedIn={Boolean(user)}
      showcaseSvg={showcase?.svg ?? null}
      showcaseAttribution={showcase?.attribution ?? null}
    />
  )
}
