import { prisma } from '@homemade/db'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaSrcSet } from '@/lib/media'
import { BookmarkRemove } from './bookmark-remove'

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

  return (
    <section>
      <span className="me-section-label">Saved</span>
      <h2 className="me-section-title">Your bookmarks</h2>
      {bookmarks.length === 0 ? (
        <p className="me-empty">
          Nothing saved yet. The bookmark icon on any tutorial keeps it here
          for later.
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
                <BookmarkRemove tutorialId={b.tutorial.id} />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
