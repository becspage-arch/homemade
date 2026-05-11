import { prisma } from '@homemade/db'
import { createTag, updateTag, deleteTag } from './actions'

export const dynamic = 'force-dynamic'

export default async function TagsIndexPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { tutorials: true } } },
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1
        className="text-4xl text-[var(--color-espresso)]"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
      >
        Tags
      </h1>
      <p
        className="mt-2 text-sm text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        Short labels attached to tutorials. Cross-category. Many-to-many.
      </p>

      <form action={createTag} className="mt-12 flex gap-3 border-b border-[var(--color-linen-grey)] pb-6">
        <input
          type="text"
          name="name"
          placeholder="Name (e.g. 'Sourdough')"
          required
          className="flex-1 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        />
        <input
          type="text"
          name="slug"
          placeholder="slug (lowercase-hyphens)"
          required
          pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
          className="flex-1 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 font-mono text-sm text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
        />
        <button
          type="submit"
          className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          add tag
        </button>
      </form>

      {tags.length === 0 ? (
        <p
          className="mt-12 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          No tags yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--color-linen-grey)]">
          {tags.map((tag) => (
            <li key={tag.id} className="py-4">
              <form action={updateTag.bind(null, tag.id)} className="flex items-center gap-3">
                <input
                  type="text"
                  name="name"
                  defaultValue={tag.name}
                  required
                  className="flex-1 border-b border-transparent bg-transparent px-1 py-1 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <input
                  type="text"
                  name="slug"
                  defaultValue={tag.slug}
                  required
                  pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                  className="flex-1 border-b border-transparent bg-transparent px-1 py-1 font-mono text-sm text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
                />
                <span
                  className="w-20 text-right text-xs text-[var(--color-warm-taupe)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  {tag._count.tutorials} tutorial{tag._count.tutorials === 1 ? '' : 's'}
                </span>
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  save
                </button>
              </form>
              <form
                action={deleteTag.bind(null, tag.id)}
                className="mt-1 flex justify-end"
              >
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.25em] text-[var(--color-burnt-sienna)] opacity-60 hover:opacity-100"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
