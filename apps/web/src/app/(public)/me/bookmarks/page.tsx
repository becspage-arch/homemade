import { prisma } from '@homemade/db'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaSrcSet } from '@/lib/media'
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

  const publicCount = bookmarks.filter((b) => b.isPublic).length
  const privateCount = bookmarks.length - publicCount

  return (
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
  )
}
