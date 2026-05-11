import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'

import './me.css'

export const dynamic = 'force-dynamic'

const NAV_ITEMS: { href: '/me' | '/me/bookmarks' | '/me/projects' | '/me/settings'; label: string }[] = [
  { href: '/me', label: 'Overview' },
  { href: '/me/projects', label: 'Projects' },
  { href: '/me/bookmarks', label: 'Bookmarks' },
  { href: '/me/settings', label: 'Settings' },
]

export default async function MeLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const greetingName = user.name?.split(' ')[0] ?? null

  return (
    <div className="me-page">
      <header className="me-header">
        <span className="me-eyebrow">Your space</span>
        <h1 className="me-title">
          {greetingName ? `Hello, ${greetingName}` : 'Hello'}
        </h1>
        <nav className="me-nav" aria-label="Account sections">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="me-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="me-body">{children}</div>
    </div>
  )
}
