'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// Mirror of @homemade/db UserRole as a string literal — importing the enum
// at runtime would pull Prisma into the client bundle.
export type UserRole = 'ANONYMOUS' | 'MEMBER' | 'TESTER' | 'CREATOR' | 'EDITOR' | 'ADMIN'

export interface SidebarItem {
  href: string
  label: string
  placeholder?: boolean
  /** Minimum role to see this item. */
  minRole: UserRole
}

export interface SidebarGroup {
  id: string
  label: string
  /** Landing href when the group itself is a single page (Dashboard). */
  href?: string
  items: SidebarItem[]
  /** Minimum role to see this group. */
  minRole: UserRole
}

interface AdminSidebarProps {
  groups: SidebarGroup[]
  userRole: UserRole
  userEmail: string
  userName: string | null
}

const STORAGE_KEY = 'homemade.admin.sidebar.collapsed'

const RANK: Record<UserRole, number> = {
  ANONYMOUS: 0,
  MEMBER: 1,
  TESTER: 2,
  CREATOR: 3,
  EDITOR: 4,
  ADMIN: 5,
}

function meets(role: UserRole, min: UserRole): boolean {
  return RANK[role] >= RANK[min]
}

function loadCollapsed(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

function roleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'admin'
    case 'EDITOR':
      return 'editor'
    case 'CREATOR':
      return 'creator'
    case 'TESTER':
      return 'tester'
    case 'MEMBER':
      return 'member'
    default:
      return 'anonymous'
  }
}

export function AdminSidebar({ groups, userRole, userEmail, userName }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => loadCollapsed())

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore quota / private-mode errors
      }
      return next
    })
  }

  const visibleGroups = groups.filter((g) => meets(userRole, g.minRole))
  const initial = (userName?.trim()?.[0] ?? userEmail.trim()[0] ?? 'h').toUpperCase()

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar-top">
        <Link href="/admin" className="admin-sidebar-brand">
          homemade admin
        </Link>
        <Link
          href="/"
          className="admin-sidebar-public-link"
          target="_blank"
          rel="noreferrer"
        >
          Open public site →
        </Link>
        <div className="admin-sidebar-user">
          <span className="admin-sidebar-user-avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="admin-sidebar-user-meta">
            <span className="admin-sidebar-user-name">{userName ?? userEmail}</span>
            <span className="admin-sidebar-user-role">{roleLabel(userRole)}</span>
          </span>
        </div>
      </div>
      <nav className="admin-sidebar-nav">
        {visibleGroups.map((group) => {
          const items = group.items.filter((i) => meets(userRole, i.minRole))
          const hasChildren = items.length > 0
          const isOpen = !collapsed[group.id]
          const anyActive =
            (group.href && pathname === group.href) ||
            items.some((i) => pathname === i.href || pathname.startsWith(i.href + '/'))

          // Dashboard-style group: single landing href, no children. Render as a
          // flat link rather than a collapsible header.
          if (group.href && !hasChildren) {
            const active = pathname === group.href
            return (
              <div key={group.id} className="admin-sidebar-group">
                <Link
                  href={group.href}
                  className={`admin-sidebar-flat-link${active ? ' active' : ''}`}
                >
                  {group.label}
                </Link>
              </div>
            )
          }

          return (
            <div key={group.id} className="admin-sidebar-group">
              <button
                type="button"
                className="admin-sidebar-group-header"
                aria-expanded={isOpen}
                onClick={() => toggle(group.id)}
              >
                <span>{group.label}</span>
                <span className="chev" aria-hidden="true" />
              </button>
              {isOpen && (
                <ul className="admin-sidebar-children">
                  {items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={[
                            active ? 'active' : '',
                            item.placeholder ? 'placeholder' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
              {!isOpen && anyActive && (
                <div
                  style={{
                    height: 2,
                    width: 24,
                    margin: '0 24px',
                    background: 'var(--color-sage)',
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          )
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <kbd className="admin-sidebar-kbd">⌘K</kbd>
        <span className="admin-sidebar-kbd-hint">command palette</span>
      </div>
    </aside>
  )
}
