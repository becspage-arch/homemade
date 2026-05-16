import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Phase admin-overhaul — creator tutorial editing is unified at
 * /admin/tutorials/[id]. RBAC there scopes to the creator's own rows.
 */
export default async function CreatorTutorialEditRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/admin/tutorials/${id}`)
}
