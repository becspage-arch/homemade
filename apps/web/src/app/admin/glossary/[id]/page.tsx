import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { GlossaryForm } from '../glossary-form'
import { updateGlossaryTerm, deleteGlossaryTerm } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditGlossaryTermPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [term, categories] = await Promise.all([
    prisma.glossaryTerm.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
  ])
  if (!term) notFound()

  const updateAction = updateGlossaryTerm.bind(null, id)
  const deleteAction = deleteGlossaryTerm.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-12">
        <Link
          href="/admin/glossary"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all glossary
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Edit term
        </h1>
      </div>

      <GlossaryForm
        action={updateAction}
        submitLabel="save changes"
        categories={categories}
        defaultValues={{
          slug: term.slug,
          term: term.term,
          definition: term.definition,
          categoryId: term.categoryId,
        }}
      />

      <form action={deleteAction} className="mt-16 border-t border-[var(--color-linen-grey)] pt-8">
        <p
          className="mb-4 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Deleting a glossary term is permanent.
        </p>
        <button
          type="submit"
          className="border border-[var(--color-burnt-sienna)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-burnt-sienna)] hover:bg-[var(--color-burnt-sienna)] hover:text-[var(--color-linen-cream)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          delete term
        </button>
      </form>
    </div>
  )
}
