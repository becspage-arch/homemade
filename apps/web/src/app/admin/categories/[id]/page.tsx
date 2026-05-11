import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { CategoryForm } from '../category-form'
import { updateCategory, deleteCategory } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { tutorials: true, subCategories: true } } },
  })
  if (!category) notFound()

  const updateAction = updateCategory.bind(null, id)
  const deleteAction = deleteCategory.bind(null, id)

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
          Edit category
        </h1>
        <p
          className="mt-2 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {category._count.tutorials} tutorial{category._count.tutorials === 1 ? '' : 's'},{' '}
          {category._count.subCategories} sub-categor
          {category._count.subCategories === 1 ? 'y' : 'ies'}
        </p>
      </div>

      <CategoryForm
        action={updateAction}
        submitLabel="save changes"
        defaultValues={{
          slug: category.slug,
          name: category.name,
          description: category.description,
          order: category.order,
        }}
      />

      <form action={deleteAction} className="mt-16 border-t border-[var(--color-linen-grey)] pt-8">
        <p
          className="mb-4 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Deleting a category is permanent. It will fail if any tutorials or sub-categories still
          reference it.
        </p>
        <button
          type="submit"
          className="border border-[var(--color-burnt-sienna)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-burnt-sienna)] hover:bg-[var(--color-burnt-sienna)] hover:text-[var(--color-linen-cream)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          delete category
        </button>
      </form>
    </div>
  )
}
