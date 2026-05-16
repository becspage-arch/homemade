import { redirect } from 'next/navigation'

/**
 * Phase admin-overhaul — creator authoring is unified at /admin/tutorials/new.
 */
export default function NewCreatorTutorialRedirectPage() {
  redirect('/admin/tutorials/new')
}
