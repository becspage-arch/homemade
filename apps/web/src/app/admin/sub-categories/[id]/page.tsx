import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { SubCategoryForm } from '../sub-category-form'
import { updateSubCategory, deleteSubCategory } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditSubCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [subCategory, categories] = await Promise.all([
    prisma.subCategory.findUnique({
      where: { id },
      include: { _count: { select: { tutorials: true } } },
    }),
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
  ])
  if (!subCategory) notFound()

  const updateAction = updateSubCategory.bind(null, id)
  const deleteAction = deleteSubCategory.bind(null, id)

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
          Edit sub-category
        </h1>
        <p
          className="mt-2 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {subCategory._count.tutorials} tutorial
          {subCategory._count.tutorials === 1 ? '' : 's'}
        </p>
      </div>

      <SubCategoryForm
        action={updateAction}
        submitLabel="save changes"
        categories={categories}
        defaultValues={{
          slug: subCategory.slug,
          name: subCategory.name,
          description: subCategory.description,
          categoryId: subCategory.categoryId,
          order: subCategory.order,
        }}
      />

      <form action={deleteAction} className="mt-16 border-t border-[var(--color-linen-grey)] pt-8">
        <p
          className="mb-4 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Deleting a sub-category is permanent. Will fail if tutorials still reference it.
        </p>
        <button
          type="submit"
          className="border border-[var(--color-burnt-sienna)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-burnt-sienna)] hover:bg-[var(--color-burnt-sienna)] hover:text-[var(--color-linen-cream)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          delete sub-category
        </button>
      </form>
    </div>
  )
}
