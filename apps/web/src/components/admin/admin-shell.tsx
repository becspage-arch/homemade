'use client'

import { useState, type ReactNode } from 'react'
import { AdminSidebar, type SidebarGroup } from './admin-sidebar'

interface AdminShellProps {
  groups: SidebarGroup[]
  isAdmin: boolean
  children: ReactNode
}

export function AdminShell({ groups, isAdmin, children }: AdminShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-shell" data-sidebar-open={open ? 'true' : 'false'}>
      <AdminSidebar groups={groups} isAdmin={isAdmin} />
      <div className="admin-main">
        <div className="admin-main-bar">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            {open ? 'close' : 'menu'}
          </button>
        </div>
        <main className="admin-main-inner" onClick={() => open && setOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  )
}
