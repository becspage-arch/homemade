import { redirect } from 'next/navigation'

/**
 * Phase admin-overhaul — the creator tutorial list now lives at /admin/tutorials.
 * The /admin route enforces RBAC and shows CREATORs only their own content.
 */
export default function CreatorTutorialsRedirectPage() {
  redirect('/admin/tutorials')
}
