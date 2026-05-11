import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { cloudflareDeliveryUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PENDING_MODERATION: 'In review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export default async function MyPhotosPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const photos = await prisma.uGCPhoto.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      tutorial: {
        select: {
          title: true,
          slug: true,
          category: { select: { slug: true } },
        },
      },
      media: { select: { cloudflareId: true } },
    },
  })

  return (
    <section>
      <span className="me-section-label">Your photos</span>
      <h2 className="me-section-title">Photos</h2>

      {photos.length === 0 ? (
        <p className="me-empty">
          You haven’t shared any photos yet. Once you’ve started a tutorial
          you can upload a photo of how it turned out.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {photos.map((p) => {
            const url = cloudflareDeliveryUrl(p.media.cloudflareId, 'card')
            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--color-cream)',
                  border: '0.5px solid var(--color-linen-grey)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  fontFamily: 'var(--font-lora)',
                }}
              >
                <div
                  style={{
                    aspectRatio: '4 / 3',
                    backgroundColor: 'var(--color-soft-parchment)',
                    backgroundImage: url ? `url(${url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div style={{ padding: 12 }}>
                  <Link
                    href={`/${p.tutorial.category.slug}/${p.tutorial.slug}`}
                    style={{
                      fontFamily: 'var(--font-fraunces)',
                      fontSize: 16,
                      color: 'var(--color-espresso)',
                      textDecoration: 'none',
                    }}
                  >
                    {p.tutorial.title}
                  </Link>
                  {p.caption && (
                    <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
                      {p.caption}
                    </p>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <span className="me-status-pill">{STATUS_LABEL[p.status] ?? p.status}</span>
                  </div>
                  {p.rejectionReason && (
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: 'var(--color-burnt-sienna)',
                        fontStyle: 'italic',
                      }}
                    >
                      {p.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
