import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { MarkReadButton } from './mark-read-button'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const unread = notifications.filter((n) => n.readAt === null).length

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="me-section-label">Updates for you</span>
          <h2 className="me-section-title">Notifications</h2>
        </div>
        {unread > 0 && <MarkReadButton />}
      </div>

      {notifications.length === 0 ? (
        <p className="me-empty">
          Nothing yet. When a review or photo of yours is approved, or
          something else needs your attention, it lands here.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n) => {
            const unread = n.readAt === null
            const body = (
              <div
                style={{
                  background: unread
                    ? 'rgba(160, 176, 132, 0.08)'
                    : 'var(--color-cream)',
                  border: '0.5px solid var(--color-linen-grey)',
                  borderRadius: 4,
                  padding: 14,
                  fontFamily: 'var(--font-lora)',
                  color: 'var(--color-espresso)',
                }}
              >
                <p style={{ margin: 0 }}>{n.body}</p>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--color-warm-taupe)',
                    marginTop: 6,
                    display: 'block',
                  }}
                >
                  {n.createdAt.toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )
            return n.href ? (
              <Link
                key={n.id}
                href={n.href}
                style={{ textDecoration: 'none' }}
              >
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            )
          })}
        </div>
      )}
    </section>
  )
}
