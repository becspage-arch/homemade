import Link from 'next/link'
import { prisma } from '@homemade/db'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaSrcSet } from '@/lib/media'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { BookmarkControls } from './bookmark-controls'

export const dynamic = 'force-dynamic'

export default async function MeBookmarksPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      tutorial: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          difficulty: true,
          season: true,
          category: { select: { slug: true, name: true } },
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      },
    },
  })

  // Saved patterns join the same Make it list (additive SavedPattern table).
  // Only patterns with a slug are linkable to a public detail page.
  const savedPatterns = (
    await prisma.savedPattern.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        pattern: {
          select: {
            id: true,
            slug: true,
            name: true,
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        },
      },
    })
  ).filter((s) => s.pattern.slug)

  const publicCount = bookmarks.filter((b) => b.isPublic).length
  const privateCount = bookmarks.length - publicCount

  return (
    <>
    <section>
      <span className="me-section-label">Make it list</span>
      <h2 className="me-section-title">Tutorials you want to make</h2>
      {bookmarks.length > 0 && (
        <p className="me-section-description">
          {privateCount} private · {publicCount} public on your Maker profile.
          Tap a bookmark&apos;s label to flip its visibility.
        </p>
      )}
      {bookmarks.length === 0 ? (
        <p className="me-empty">
          Your Make it list is empty. Hit &ldquo;Add to Make it&rdquo; on any
          tutorial to keep it here.
        </p>
      ) : (
        <div className="me-grid">
          {bookmarks.map((b) => {
            const card = mediaSrcSet(b.tutorial.hero, 'card', ['public'])
            return (
              <div key={b.id} style={{ position: 'relative' }}>
                <TutorialCard
                  href={`/${b.tutorial.category.slug}/${b.tutorial.slug}`}
                  title={b.tutorial.title}
                  excerpt={b.tutorial.excerpt}
                  heroUrl={card?.src ?? null}
                  heroSrcSet={card?.srcSet}
                  difficulty={b.tutorial.difficulty}
                  season={b.tutorial.season}
                  categoryName={b.tutorial.category.name}
                  state={{
                    bookmarked: true,
                    projectStatus: null,
                    projectId: null,
                    projectProgressPercent: null,
                  }}
                />
                <BookmarkControls
                  bookmarkId={b.id}
                  tutorialId={b.tutorial.id}
                  initialIsPublic={b.isPublic}
                />
              </div>
            )
          })}
        </div>
      )}
    </section>

      {savedPatterns.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <span className="me-section-label">Make it list</span>
          <h2 className="me-section-title">Patterns you want to stitch</h2>
          <div className="me-grid">
            {savedPatterns.map((s) => (
              <Link
                key={s.id}
                href={`/cross-stitch/patterns/${s.pattern.slug}`}
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patternHeroUrl({ id: s.pattern.id, hero: s.pattern.hero }, 'card')}
                  alt={s.pattern.name}
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'contain',
                    background: 'var(--color-oat)',
                    borderRadius: 10,
                  }}
                  loading="lazy"
                  decoding="async"
                />
                <span
                  style={{
                    display: 'block',
                    marginTop: 8,
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    color: 'var(--color-espresso)',
                  }}
                >
                  {s.pattern.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
