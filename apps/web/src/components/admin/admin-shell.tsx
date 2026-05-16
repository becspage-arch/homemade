'use client'

import { useState, type ReactNode } from 'react'
import { AdminSidebar, type SidebarGroup, type UserRole } from './admin-sidebar'
import { CommandPalette } from './command-palette'

interface AdminShellProps {
  groups: SidebarGroup[]
  userRole: UserRole
  userEmail: string
  userName: string | null
  children: ReactNode
}

export function AdminShell({
  groups,
  userRole,
  userEmail,
  userName,
  children,
}: AdminShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-shell" data-sidebar-open={open ? 'true' : 'false'}>
      <AdminSidebar
        groups={groups}
        userRole={userRole}
        userEmail={userEmail}
        userName={userName}
      />
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
      <CommandPalette userRole={userRole} />
    </div>
  )
}
