import { redirect } from 'next/navigation'

/**
 * The old "Content library" / autopilot cockpit was merged into the bulk
 * generation page (2026-07-06) — the content autopilot is retired and its
 * library-progress table now lives alongside the live generation controls.
 * Kept as a redirect so old links + bookmarks still land somewhere useful.
 */
export default function AdminAutopilotRedirect() {
  redirect('/admin/system/bulk-generation')
}
