import { redirect } from 'next/navigation'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { identifyCurrentUser } from '@/lib/identify'
import { AdminShell } from '@/components/admin/admin-shell'
import type { SidebarGroup } from '@/components/admin/admin-sidebar'

import '@/components/admin/admin-shell.css'
import '@/components/admin/admin-moderation.css'
import '@/components/admin/command-palette.css'

/**
 * Sidebar groups for /admin. Six top-level groups per the admin overhaul.
 *
 * The `minRole` field on every group + item gates visibility. Filtering is
 * done in the sidebar component so a CREATOR sees only the Content group with
 * the sub-items they're allowed to touch (their own tutorials + their own
 * media). EDITOR / ADMIN see everything appropriate to their role.
 */
const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    minRole: UserRole.CREATOR,
    items: [],
  },
  {
    id: 'content',
    label: 'Content',
    minRole: UserRole.CREATOR,
    items: [
      { href: '/admin/tutorials', label: 'All content', minRole: UserRole.CREATOR },
      { href: '/admin/editorial-picks', label: 'Editorial picks', minRole: UserRole.EDITOR },
      { href: '/admin/categories', label: 'Categories', minRole: UserRole.ADMIN },
      { href: '/admin/glossary', label: 'Glossary', minRole: UserRole.EDITOR },
      { href: '/admin/media', label: 'Media', minRole: UserRole.CREATOR },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    minRole: UserRole.EDITOR,
    items: [
      { href: '/admin/users', label: 'All users', minRole: UserRole.EDITOR },
      { href: '/admin/users/suspended', label: 'Suspensions', minRole: UserRole.EDITOR },
      { href: '/admin/users/data-requests', label: 'Data requests', minRole: UserRole.EDITOR },
      { href: '/admin/users/deletion-queue', label: 'Deletion queue', minRole: UserRole.EDITOR },
      { href: '/admin/users/signup-allowlist', label: 'Signup allowlist', minRole: UserRole.ADMIN },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    minRole: UserRole.EDITOR,
    items: [
      { href: '/admin/reviews', label: 'Reviews', minRole: UserRole.EDITOR },
      { href: '/admin/ugc-photos', label: 'UGC photos', minRole: UserRole.EDITOR },
      { href: '/admin/questions', label: 'Q&A', minRole: UserRole.EDITOR },
      { href: '/admin/errata', label: 'Errata', minRole: UserRole.EDITOR },
      { href: '/admin/reports', label: 'Reports', minRole: UserRole.EDITOR },
      { href: '/admin/community/dmca', label: 'DMCA queue', minRole: UserRole.EDITOR },
      { href: '/admin/creators', label: 'Creator applications', minRole: UserRole.EDITOR },
      { href: '/admin/creators/moderation', label: 'Creator moderation', minRole: UserRole.EDITOR },
      { href: '/admin/patterns', label: 'Pattern tests', minRole: UserRole.EDITOR },
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    minRole: UserRole.ADMIN,
    items: [
      { href: '/admin/billing', label: 'Billing', minRole: UserRole.ADMIN, placeholder: true },
      { href: '/admin/marketing', label: 'Marketing', minRole: UserRole.ADMIN, placeholder: true },
      { href: '/admin/analytics', label: 'Analytics — overview', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/cohorts', label: 'Analytics — cohorts', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/activation', label: 'Analytics — activation', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/content', label: 'Analytics — content', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/search', label: 'Analytics — search', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/acquisition', label: 'Analytics — acquisition', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/creator', label: 'Analytics — creator', minRole: UserRole.ADMIN },
      { href: '/admin/analytics/system', label: 'Analytics — system', minRole: UserRole.ADMIN },
    ],
  },
  {
    id: 'system',
    label: 'System',
    minRole: UserRole.ADMIN,
    items: [
      { href: '/admin/system/health', label: 'Health', minRole: UserRole.ADMIN, placeholder: true },
      { href: '/admin/audit-log', label: 'Audit log', minRole: UserRole.ADMIN },
      { href: '/admin/system/settings', label: 'Settings', minRole: UserRole.ADMIN, placeholder: true },
      { href: '/admin/system/feature-flags', label: 'Feature flags', minRole: UserRole.ADMIN, placeholder: true },
      { href: '/admin/system/jobs', label: 'Jobs', minRole: UserRole.ADMIN },
      { href: '/admin/system/errors', label: 'Errors', minRole: UserRole.ADMIN },
    ],
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDbUser()

  if (!user) {
    redirect('/sign-in')
  }

  void identifyCurrentUser(user)

  // CREATOR / EDITOR / ADMIN may enter /admin. CREATOR only sees the Content
  // group; the sidebar filters items by `minRole`.
  if (!hasRoleAtLeast(user, UserRole.CREATOR)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <h1
          className="text-4xl text-[var(--color-sage)] lowercase"
          style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '0.18em', fontWeight: 300 }}
        >
          not for you
        </h1>
        <p
          className="mt-8 text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.3em' }}
        >
          this part of homemade is for creators, editors, and admins
        </p>
      </main>
    )
  }

  return (
    <AdminShell
      groups={SIDEBAR_GROUPS}
      userRole={user.role}
      userEmail={user.email}
      userName={user.name}
    >
      {children}
    </AdminShell>
  )
}
