'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'

export interface SidebarItem {
  href: string
  label: string
  placeholder?: boolean
  /** Hide from non-ADMINs (e.g. signup allowlist that EDITORs don't manage). */
  adminOnly?: boolean
}

export interface SidebarGroup {
  id: string
  label: string
  /** Optional landing href for the group itself (e.g. /admin = Dashboard). */
  href?: string
  items: SidebarItem[]
  /** Hide from non-ADMINs (e.g. Audit log, System, Users role tools). */
  adminOnly?: boolean
}

interface AdminSidebarProps {
  groups: SidebarGroup[]
  isAdmin: boolean
}

const STORAGE_KEY = 'homemade.admin.sidebar.collapsed'

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

export function AdminSidebar({ groups, isAdmin }: AdminSidebarProps) {
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

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <Link href="/admin" className="admin-sidebar-brand">
        homemade admin
      </Link>
      <nav>
        {groups.map((group) => {
          if (group.adminOnly && !isAdmin) return null
          const isOpen = !collapsed[group.id]
          const anyActive = group.items.some((i) =>
            pathname === i.href || pathname.startsWith(i.href + '/'),
          ) || (group.href && pathname === group.href)
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
                  {group.href && (
                    <li>
                      <Link
                        href={group.href}
                        className={pathname === group.href ? 'active' : ''}
                      >
                        Overview
                      </Link>
                    </li>
                  )}
                  {group.items.map((item) => {
                    if (item.adminOnly && !isAdmin) return null
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
              {/* Keep the highlight even when collapsed */}
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
        <UserButton />
      </div>
    </aside>
  )
}
