import Link from 'next/link'
import { TutorialForm } from '@/components/admin/tutorials/tutorial-form'
import { createTutorial } from '../actions'
import { loadTutorialFormData } from '../form-data'

export const dynamic = 'force-dynamic'

export default async function NewTutorialPage() {
  const data = await loadTutorialFormData()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-12">
        <Link
          href="/admin/tutorials"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all tutorials
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          New tutorial
        </h1>
      </div>

      <TutorialForm
        action={createTutorial}
        submitLabel="create tutorial"
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
          sourceType: 'SYNTHESISED',
          sourceNotes: '',
          timeMinutes: '',
          heroMediaId: null,
          body: { type: 'doc', content: [{ type: 'paragraph' }] },

          type: 'TECHNIQUE',
          servings: '',
          yieldDescription: '',
          prepMinutes: '',
          cookMinutes: '',
          restingMinutes: '',
          chillingMinutes: '',
          scalable: true,
          freezable: false,
          freezeNotes: '',
          batchable: false,
          batchNotes: '',
          makeAheadNotes: '',
          dietaryFlags: [],
          cuisine: '',
          mealType: '',
          mood: [],
          temperatureCelsius: '',
          temperatureNote: '',
          foundational: false,
          leftoverTutorialId: null,
        }}
        cloudflareDeliveryHash={process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH ?? null}
        {...data}
      />
    </div>
  )
}
