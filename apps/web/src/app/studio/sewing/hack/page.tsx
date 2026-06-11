import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { listDesigns } from '@/lib/sewing/grading/design-registry'
import { getFreesewingShowcase } from '@/lib/sewing/grading/showcase'
import { captureEvent } from '@/lib/server-analytics'
import { getOrCreateSessionId } from '@/lib/analytics-session'
import {
  STUDIO_PREMIUM_GATING_ENABLED,
  checkStudioGate,
} from '@/lib/studio/premium-gates'
import { HackLandingCards } from '@/components/studio/sewing/hack/HackLandingCards'
import '@/app/studio/sewing/personalise/personalise.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hack a sewing pattern · homemade',
  robots: { index: false, follow: false },
}

interface HackPickerCard {
  slug: string
  name: string
  description: string
  skillLabel: string
  genderLabel: string
  showcaseSvg: string | null
  handleCount: number
}

const SKILL_LABEL: Record<string, string> = {
  ABSOLUTE_BEGINNER: 'Absolute beginner',
  BEGINNER: 'Beginner',
  CONFIDENT_BEGINNER: 'Confident beginner',
  IMPROVER: 'Improver',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

const GENDER_LABEL: Record<string, string> = {
  WOMENS: "Women's",
  MENS: "Men's",
  UNISEX: 'Unisex',
  KIDS: "Kids'",
  BABIES: 'Babies',
}

export default async function SewingHackLandingPage() {
  const user = await getCurrentDbUser()
  const designs = listDesigns()

  const gate = checkStudioGate('SEWING_HACK_COMPOSER', {
    signedIn: Boolean(user),
    isPremium: false,
  })
  const gateActive = STUDIO_PREMIUM_GATING_ENABLED && !gate.allowed

  const sessionId = await getOrCreateSessionId().catch(() => 'server')
  void captureEvent({
    event: 'sewing_hack_composer_opened',
    distinctId: user?.clerkId ?? `anon:${sessionId}`,
    properties: {
      designSlug: null,
      signed_in: Boolean(user),
      surface: 'landing',
    },
  }).catch(() => {})

  if (gateActive) {
    void captureEvent({
      event: 'sewing_hack_premium_gate_encountered',
      distinctId: user?.clerkId ?? `anon:${sessionId}`,
      properties: {
        designSlug: null,
        signed_in: Boolean(user),
        surface: 'landing',
      },
    }).catch(() => {})
  }

  const cards: HackPickerCard[] = await Promise.all(
    designs.map(async (d): Promise<HackPickerCard> => {
      const showcase = await getFreesewingShowcase(d.slug).catch(() => null)
      return {
        slug: d.slug,
        name: d.name,
        description: d.description ?? '',
        skillLabel: SKILL_LABEL[d.skillLevel] ?? d.skillLevel,
        genderLabel: GENDER_LABEL[d.genderFamily] ?? d.genderFamily,
        showcaseSvg: showcase?.svg ?? null,
        handleCount: d.hackHandles?.length ?? 0,
      }
    }),
  )

  return (
    <div className="sew-pers-surface">
      <header className="sew-pers-header">
        <nav className="sew-pers-crumbs" aria-label="Breadcrumb">
          <Link href="/studio/sewing">Sewing Studio</Link>
          <span aria-hidden>›</span>
          <span>Hack a pattern</span>
        </nav>
        <h1 className="sew-pers-heading">Hack a sewing pattern</h1>
        <p className="sew-pers-lede">
          Change the length, swap the neckline, add pockets, adjust the fit.
          The pattern updates as you go. Save the hack and come back to it
          later, or download it for print or projector.
        </p>
      </header>

      {gateActive ? (
        <div className="sew-pers-upgrade-block">
          <p className="sew-pers-upgrade-message">{gate.message}</p>
          <p className="sew-pers-upgrade-rationale">{gate.rationale}</p>
        </div>
      ) : null}

      {cards.length === 0 ? (
        <div className="sew-pers-empty">
          No designs to hack yet. New designs land here as the catalogue
          grows.
        </div>
      ) : (
        <HackLandingCards
          cards={cards}
          signedIn={Boolean(user)}
          gateActive={gateActive}
        />
      )}

      {!user && !gateActive && (
        <div className="sew-pers-signin-note">
          You can open the hack composer and tinker without signing in.{' '}
          <Link href="/sign-in?redirect_url=/studio/sewing/hack">Sign in</Link>{' '}
          to save your hacks so you can come back to them.
        </div>
      )}
    </div>
  )
}
