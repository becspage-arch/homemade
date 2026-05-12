import { redirect } from 'next/navigation'
import { getCurrentDbUser, isAdmin, isEditorOrAbove } from '@/lib/auth'
import { identifyCurrentUser } from '@/lib/identify'
import { AdminShell } from '@/components/admin/admin-shell'
import type { SidebarGroup } from '@/components/admin/admin-sidebar'

import '@/components/admin/admin-shell.css'
import '@/components/admin/admin-moderation.css'

/**
 * Sidebar groups for /admin. Eight top-level groups per the menu restructure
 * landed in Phase 5 (see `project_admin_roadmap.md`). Placeholders flag pages
 * that still need their own phase.
 */
const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    items: [],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      { href: '/admin/tutorials', label: 'Tutorials' },
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/sub-categories', label: 'Sub-categories' },
      { href: '/admin/tags', label: 'Tags' },
      { href: '/admin/glossary', label: 'Glossary' },
      { href: '/admin/media', label: 'Media' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    items: [
      { href: '/admin/users', label: 'List' },
      { href: '/admin/users/suspended', label: 'Suspensions' },
      { href: '/admin/users/data-requests', label: 'Data requests' },
      { href: '/admin/users/deletion-queue', label: 'Deletion queue' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      { href: '/admin/reviews', label: 'Reviews' },
      { href: '/admin/ugc-photos', label: 'UGC photos' },
      { href: '/admin/questions', label: 'Q&A' },
      { href: '/admin/errata', label: 'Errata' },
      { href: '/admin/reports', label: 'Reports' },
      { href: '/admin/community/dmca', label: 'DMCA / takedowns' },
    ],
  },
  {
    id: 'creators',
    label: 'Creators',
    items: [
      { href: '/admin/creators', label: 'Applications & active' },
      { href: '/admin/creators/moderation', label: 'Tutorial moderation' },
      { href: '/admin/patterns', label: 'Pattern tests' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      { href: '/admin/billing', label: 'Overview', placeholder: true },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    items: [
      { href: '/admin/marketing', label: 'Overview', placeholder: true },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { href: '/admin/analytics', label: 'Overview', placeholder: true },
    ],
  },
  {
    id: 'system',
    label: 'System',
    adminOnly: true,
    items: [
      { href: '/admin/audit-log', label: 'Audit log' },
      { href: '/admin/system/errors', label: 'Error log' },
      { href: '/admin/system/jobs', label: 'Jobs' },
      { href: '/admin/system/settings', label: 'Settings', placeholder: true },
      { href: '/admin/system/feature-flags', label: 'Feature flags', placeholder: true },
    ],
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDbUser()

  if (!user) {
    redirect('/sign-in')
  }

  void identifyCurrentUser(user)

  if (!isEditorOrAbove(user)) {
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
          this part of homemade is for editors
        </p>
      </main>
    )
  }

  return (
    <AdminShell groups={SIDEBAR_GROUPS} isAdmin={isAdmin(user)}>
      {children}
    </AdminShell>
  )
}
