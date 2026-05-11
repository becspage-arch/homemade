import Link from 'next/link'
import { CategoryForm } from '../category-form'
import { createCategory } from '../actions'

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-12">
        <Link
          href="/admin/categories"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all categories
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          New category
        </h1>
      </div>

      <CategoryForm action={createCategory} submitLabel="create category" />
    </div>
  )
}
