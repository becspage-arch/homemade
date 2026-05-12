import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { identifyCurrentUser } from '@/lib/identify'

import './me.css'

export const dynamic = 'force-dynamic'

interface NavItem {
  href: string
  label: string
}

const BASE_NAV: NavItem[] = [
  { href: '/me', label: 'Overview' },
  { href: '/me/projects', label: 'Projects' },
  { href: '/me/bookmarks', label: 'Bookmarks' },
  { href: '/me/reviews', label: 'Reviews' },
  { href: '/me/photos', label: 'Photos' },
  { href: '/me/questions', label: 'Questions' },
  { href: '/me/notifications', label: 'Notifications' },
  { href: '/me/data-rights', label: 'Data rights' },
  { href: '/me/settings', label: 'Settings' },
]

export default async function MeLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  void identifyCurrentUser(user)

  const greetingName = user.name?.split(' ')[0] ?? null

  const unread = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  })

  const navItems: NavItem[] = [...BASE_NAV]
  if (user.isCreator) {
    // Slot creator nav before Settings
    navItems.splice(navItems.length - 1, 0, { href: '/me/creator', label: 'Creator' })
  }
  if (user.isPatternTester) {
    navItems.splice(navItems.length - 1, 0, { href: '/me/tester', label: 'Tester' })
  }

  return (
    <div className="me-page">
      <header className="me-header">
        <span className="me-eyebrow">Your space</span>
        <h1 className="me-title">
          {greetingName ? `Hello, ${greetingName}` : 'Hello'}
        </h1>
        <nav className="me-nav" aria-label="Account sections">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="me-nav-link">
              {item.label}
              {item.href === '/me/notifications' && unread > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    background: 'var(--color-sage)',
                    color: 'var(--color-cream)',
                    padding: '1px 6px',
                    borderRadius: 999,
                  }}
                >
                  {unread}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </header>
      <div className="me-body">{children}</div>
    </div>
  )
}
