import Link from 'next/link'
import { prisma, UserRecipeStatus, UserRecipeVisibility } from '@homemade/db'
import { mediaUrl } from '@/lib/media'
import { checkRecipeGate } from '@/lib/recipes/premium-gates'

import './community-recipes-rail.css'

/**
 * "From the community" rail for a recipe category landing page.
 *
 * Shows the most recent approved + public recipes Makers have shared in this
 * category. The COMMUNITY_RECIPES gate is off by default, so for now everyone
 * sees the cards. When a later worker flips the gate on, non-premium readers
 * see the rail with the cards blurred and a calm upgrade line over the top;
 * the rail itself stays, so the value is visible.
 *
 * Renders nothing when no community recipes exist yet, so a fresh category
 * never shows an empty rail.
 */
export async function CommunityRecipesRail({
  categorySlug,
  isPremium = false,
  signedIn = false,
}: {
  categorySlug: string
  isPremium?: boolean
  signedIn?: boolean
}) {
  const recipes = await prisma.userRecipe.findMany({
    where: {
      categorySlug,
      status: UserRecipeStatus.APPROVED,
      visibility: UserRecipeVisibility.PUBLIC,
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      heroPhotoMediaId: true,
    },
  })

  if (recipes.length === 0) return null

  const heroIds = recipes
    .map((r) => r.heroPhotoMediaId)
    .filter((id): id is string => Boolean(id))
  const media = heroIds.length
    ? await prisma.media.findMany({
        where: { id: { in: heroIds } },
        select: { id: true, r2Key: true },
      })
    : []
  const keyById = new Map(media.map((m) => [m.id, m.r2Key]))

  const gate = checkRecipeGate('COMMUNITY_RECIPES', { signedIn, isPremium })
  const blurred = !gate.allowed

  return (
    <section className="community-rail" aria-label="From the community">
      <div className="community-rail-head">
        <h2 className="community-rail-title">From the community</h2>
        <p className="community-rail-lede">Recipes Makers have shared with Homemade.</p>
      </div>

      <div className={`community-rail-track${blurred ? ' is-locked' : ''}`}>
        {recipes.map((r) => {
          const heroKey = r.heroPhotoMediaId ? keyById.get(r.heroPhotoMediaId) : null
          const src = heroKey ? mediaUrl({ r2Key: heroKey }, 'card') : null
          return (
            <Link key={r.id} href={`/recipes/${r.slug}`} className="community-card">
              <span className="community-card-media">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={r.title} loading="lazy" />
                ) : (
                  <span className="community-card-placeholder" aria-hidden="true" />
                )}
              </span>
              <span className="community-card-title">{r.title}</span>
              {r.summary && <span className="community-card-summary">{r.summary}</span>}
            </Link>
          )
        })}
      </div>

      {blurred && (
        <div className="community-rail-lock">
          <p>{gate.message}</p>
          <Link href="/unlock" className="community-rail-lock-cta">
            Upgrade to see community recipes
          </Link>
        </div>
      )}
    </section>
  )
}
