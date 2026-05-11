import Link from 'next/link'
import { prisma } from '@homemade/db'
import { GlossaryForm } from '../glossary-form'
import { createGlossaryTerm } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewGlossaryTermPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true },
  })

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
          New glossary term
        </h1>
      </div>

      <GlossaryForm
        action={createGlossaryTerm}
        submitLabel="create term"
        categories={categories}
      />
    </div>
  )
}
