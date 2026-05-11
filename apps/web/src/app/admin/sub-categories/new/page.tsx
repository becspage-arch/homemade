import Link from 'next/link'
import { prisma } from '@homemade/db'
import { SubCategoryForm } from '../sub-category-form'
import { createSubCategory } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewSubCategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-12">
        <Link
          href="/admin/sub-categories"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all sub-categories
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          New sub-category
        </h1>
      </div>

      {categories.length === 0 ? (
        <p
          className="text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Create at least one category first.
        </p>
      ) : (
        <SubCategoryForm
          action={createSubCategory}
          submitLabel="create sub-category"
          categories={categories}
        />
      )}
    </div>
  )
}
