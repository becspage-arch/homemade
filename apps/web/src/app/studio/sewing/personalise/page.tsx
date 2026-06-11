import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { listDesigns } from '@/lib/sewing/grading/design-registry'
import { getFreesewingShowcase } from '@/lib/sewing/grading/showcase'
import './personalise.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Personalise a sewing pattern · homemade',
  robots: { index: false, follow: false },
}

interface PickerCard {
  slug: string
  name: string
  description: string
  skillLabel: string
  genderLabel: string
  showcaseSvg: string | null
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

export default async function PersonaliseLandingPage() {
  const user = await getCurrentDbUser()
  const designs = listDesigns()

  const cards: PickerCard[] = await Promise.all(
    designs.map(async (d): Promise<PickerCard> => {
      const showcase = await getFreesewingShowcase(d.slug).catch(() => null)
      return {
        slug: d.slug,
        name: d.name,
        description: d.description ?? '',
        skillLabel: SKILL_LABEL[d.skillLevel] ?? d.skillLevel,
        genderLabel: GENDER_LABEL[d.genderFamily] ?? d.genderFamily,
        showcaseSvg: showcase?.svg ?? null,
      }
    }),
  )

  return (
    <div className="sew-pers-surface">
      <header className="sew-pers-header">
        <nav className="sew-pers-crumbs" aria-label="Breadcrumb">
          <Link href="/studio/sewing">Sewing Studio</Link>
          <span aria-hidden>›</span>
          <span>Personalise</span>
        </nav>
        <h1 className="sew-pers-heading">Personalise a sewing pattern</h1>
        <p className="sew-pers-lede">
          Pick a design and draft it to your own measurements. You can also
          browse each pattern at standard sizing without signing in.
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="sew-pers-empty">
          No designs to personalise yet. New designs land here as the
          catalogue grows.
        </div>
      ) : (
        <div className="sew-pers-grid">
          {cards.map((card) => (
            <article key={card.slug} className="sew-pers-card">
              <div
                className="sew-pers-card-illustration"
                role="img"
                aria-label={`${card.name} illustration`}
              >
                {card.showcaseSvg ? (
                  <div
                    className="sew-pers-card-illustration-svg"
                    dangerouslySetInnerHTML={{ __html: card.showcaseSvg }}
                  />
                ) : (
                  <div className="sew-pers-card-illustration-fallback">
                    Preview not available
                  </div>
                )}
              </div>
              <div className="sew-pers-card-body">
                <div className="sew-pers-card-tags">
                  <span className="sew-pers-card-tag">{card.genderLabel}</span>
                  <span className="sew-pers-card-tag">{card.skillLabel}</span>
                </div>
                <h2 className="sew-pers-card-title">{card.name}</h2>
                <p className="sew-pers-card-description">{card.description}</p>
                <div className="sew-pers-card-actions">
                  <Link
                    className="sew-pers-card-cta primary"
                    href={`/studio/sewing/personalise/${encodeURIComponent(card.slug)}`}
                  >
                    {user ? 'Personalise this design' : 'Start personalising'}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!user && (
        <div className="sew-pers-signin-note">
          You can browse every design at standard sizing for free.{' '}
          <Link href="/sign-in?redirect_url=/studio/sewing/personalise">
            Sign in
          </Link>{' '}
          to draft any of them to your own measurements.
        </div>
      )}
    </div>
  )
}
