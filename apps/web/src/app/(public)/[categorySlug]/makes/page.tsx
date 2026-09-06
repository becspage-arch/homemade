import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { buildPublicMetadata, notFoundMetadata } from '@/lib/seo/metadata-helpers'
import { loadMakerPhotoTiles } from '@/lib/maker-photos'
import { loadRecentlyMade } from '@/lib/recently-made'
import { PinterestCard } from '@/components/public/home-cards/pinterest-card'

import '@/components/public/home-cards/home-cards.css'
import '@/app/(public)/home-page.css'
import '@/components/public/maker-photos/maker-photos.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ categorySlug: string }>
}

async function loadCategory(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isPublicVisible: true },
    select: { name: true, slug: true },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await loadCategory(categorySlug)
  if (!category) return notFoundMetadata()
  return buildPublicMetadata({
    title: `${category.name} makes · homemade`,
    description: `Photos of finished ${category.name.toLowerCase()} pieces, made and photographed by Homemade makers.`,
    path: `/${category.slug}/makes`,
  })
}

/**
 * The category gallery wall. Maker photos and public Made it logs from one
 * category, in the same masonry the home page uses. Look, credit, and a link
 * back to the thing that was made. Nothing to react to.
 */
export default async function CategoryMakesPage({ params }: PageProps) {
  const { categorySlug } = await params
  const category = await loadCategory(categorySlug)
  if (!category) notFound()

  const [photos, made] = await Promise.all([
    loadMakerPhotoTiles({ categorySlug, limit: 48 }),
    loadRecentlyMade({ categorySlug, limit: 24 }),
  ])

  type Tile = {
    key: string
    href: string
    title: string
    byline: string
    imageMedia: { cloudflareId: string | null; r2Key: string | null } | null
    at: number
  }

  const tiles: Tile[] = [
    ...photos.map((p) => ({
      key: `photo-${p.photoId}`,
      href: p.href,
      title: p.title,
      byline: `Photo by ${p.makerHandle}`,
      imageMedia: p.imageSource,
      at: p.createdAt.getTime(),
    })),
    ...made.map((m) => ({
      key: `made-${m.projectId}`,
      href: `/m/${m.makerHandle}/made/${m.projectId}`,
      title: m.tutorialTitle,
      byline: `Made by ${m.makerName}`,
      imageMedia: m.heroSource,
      at: m.publishedAt.getTime(),
    })),
  ].sort((a, b) => b.at - a.at)

  return (
    <div className="home-page">
      <header className="makes-wall-header">
        <span className="makes-wall-eyebrow">{category.name}</span>
        <h1 className="makes-wall-title">Made by makers</h1>
        <p className="makes-wall-sub">
          Photos of finished pieces, taken by the people who made them. Open any
          one to see what it was made from.{' '}
          <Link href={`/${category.slug}`}>Back to {category.name.toLowerCase()}</Link>
        </p>
      </header>

      {tiles.length === 0 ? (
        <p className="makes-wall-empty">
          Nothing here yet. Make something and use Upload photo on its page.
        </p>
      ) : (
        <section className="home-discovery">
          <div className="home-discovery-masonry">
            {tiles.map((t) => (
              <div className="home-discovery-item" key={t.key}>
                <PinterestCard
                  href={t.href}
                  imageMedia={t.imageMedia}
                  title={t.title}
                  byline={t.byline}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
