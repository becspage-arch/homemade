'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactElement } from 'react'
import './mobile-tab-bar.css'

interface Tab {
  href: string
  label: string
  icon: (active: boolean) => ReactElement
  matchPrefix: string[]
}

const TABS: Tab[] = [
  {
    href: '/',
    label: 'Home',
    matchPrefix: ['/$'],
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.18 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    matchPrefix: ['/search'],
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <circle
          cx="11"
          cy="11"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.18 : 0}
        />
        <path
          d="m20 20-3.6-3.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/me/bookmarks',
    label: 'Saved',
    matchPrefix: ['/me/bookmarks', '/me/projects'],
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M6 4h12v17l-6-4-6 4V4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.18 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/me/notifications',
    label: 'Alerts',
    matchPrefix: ['/me/notifications'],
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M5 17h14l-1.4-2.1V11a5.6 5.6 0 0 0-11.2 0v3.9L5 17Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.18 : 0}
        />
        <path
          d="M10 19.5a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/me',
    label: 'Account',
    matchPrefix: ['/me$', '/me/settings', '/me/reviews', '/me/photos', '/me/questions', '/me/data-rights', '/me/creator', '/me/tester'],
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <circle
          cx="12"
          cy="8.5"
          r="3.4"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.18 : 0}
        />
        <path
          d="M5.5 20a6.5 6.5 0 0 1 13 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

function matches(pathname: string, prefixes: string[]): boolean {
  for (const p of prefixes) {
    if (p.endsWith('$')) {
      const literal = p.slice(0, -1)
      if (pathname === literal || pathname === literal + '/') return true
    } else if (pathname === p || pathname.startsWith(p + '/')) {
      return true
    }
  }
  return false
}

/**
 * Five-tab bottom nav. Visible only on small screens (≤768px) — the CSS
 * media query handles visibility so we don't need to read viewport size in
 * JS. Inside the Capacitor wrapper this is always on (the WebView is
 * narrower than 768px on every phone). On desktop it stays hidden and the
 * existing top header keeps the room.
 *
 * `unread` is hydrated client-side from `/api/me/notifications/unread-count`
 * after mount so the bar can render server-side without blocking on a DB
 * fetch — admin/me pages already pull this; doing it lazily means an extra
 * tiny request but keeps the layout stateless.
 */
export function MobileTabBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname() ?? '/'
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!signedIn) return
    let cancelled = false
    fetch('/api/me/notifications/unread-count', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.count === 'number') {
          setUnread(data.count)
        }
      })
      .catch(() => {
        /* silent — bar still works without the badge */
      })
    return () => {
      cancelled = true
    }
  }, [signedIn, pathname])

  // Hide on admin routes entirely — admin uses its own chrome.
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="mobile-tab-bar" aria-label="Primary">
      {TABS.map((tab) => {
        const active = matches(pathname, tab.matchPrefix)
        const showBadge = tab.href === '/me/notifications' && unread > 0
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`mobile-tab-bar-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="mobile-tab-bar-icon">
              {tab.icon(active)}
              {showBadge && (
                <span className="mobile-tab-bar-badge" aria-label={`${unread} unread`}>
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </span>
            <span className="mobile-tab-bar-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
