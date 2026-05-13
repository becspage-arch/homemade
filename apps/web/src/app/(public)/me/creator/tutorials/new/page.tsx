import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TutorialForm } from '@/components/admin/tutorials/tutorial-form'
import { EMPTY_RECIPE_DEFAULTS } from '@/components/admin/tutorials/tutorial-form-defaults'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadTutorialFormData } from '@/app/admin/tutorials/form-data'
import { createCreatorTutorial } from '@/lib/creator-tutorial-actions'

export const dynamic = 'force-dynamic'

export default async function NewCreatorTutorialPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const data = await loadTutorialFormData()

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">New tutorial</h2>
        <p className="me-section-description">
          Save as a draft, work on it until you’re happy, then submit for review.
        </p>
        <p style={{ marginBottom: 16 }}>
          <Link href="/me/creator/tutorials" className="me-nav-link">
            ← all your tutorials
          </Link>
        </p>
      </section>

      <section>
        <TutorialForm
          action={createCreatorTutorial}
          submitLabel="create draft"
          defaults={{
            title: '',
            slug: '',
            subtitle: '',
            excerpt: '',
            categoryId: data.categories[0]?.id ?? '',
            subCategoryId: null,
            tagIds: [],
            difficulty: 'BEGINNER',
            season: '',
            sourceType: 'CREATOR',
            sourceNotes: '',
            timeMinutes: '',
            heroMediaId: null,
            body: { type: 'doc', content: [{ type: 'paragraph' }] },
            ...EMPTY_RECIPE_DEFAULTS,
          }}
          cloudflareDeliveryHash={process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH ?? null}
          {...data}
        />
      </section>
    </>
  )
}
