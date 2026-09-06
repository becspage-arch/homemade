import Link from 'next/link'
import { prisma } from '@homemade/db'
import { createCategory, deleteCategory } from './actions'
import { createSubCategory, deleteSubCategory } from '../sub-categories/actions'
import { isPatternLedSlug, patternLedCraftStats } from '@/lib/pattern-led-category-counts'

import './categories.css'

export const dynamic = 'force-dynamic'

export default async function CategoriesTreePage() {
  const [categories, craftStats] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        subCategories: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          include: { _count: { select: { tutorials: true } } },
        },
        _count: { select: { tutorials: true } },
      },
    }),
    // For pattern-led categories (cross-stitch, crochet, needlework, knitting,
    // sewing) the tutorial count below is not the library — the published
    // PATTERNS are, each in their own table. Shown alongside, not instead of,
    // the tutorial count since a pattern-led category can still carry
    // technique tutorials.
    patternLedCraftStats(),
  ])

  return (
    <div className="categories-tree">
      <header className="categories-header">
        <div>
          <h1>Categories</h1>
          <p className="categories-subtitle">
            Top-level categories and their sub-categories in one tree. Each
            category groups tutorials; sub-categories add the next level of
            taxonomy.
          </p>
        </div>
      </header>

      <ul className="categories-list">
        {categories.map((cat) => {
          const craftStat = isPatternLedSlug(cat.slug) ? craftStats[cat.slug] : undefined
          return (
          <li key={cat.id} className="categories-row">
            <details>
              <summary>
                <span className="categories-name">{cat.name}</span>
                <code className="categories-slug">{cat.slug}</code>
                <span className="categories-count">
                  {craftStat && (
                    <>
                      {craftStat.published.toLocaleString('en-GB')} pattern
                      {craftStat.published === 1 ? '' : 's'} ·{' '}
                    </>
                  )}
                  {cat._count.tutorials.toLocaleString('en-GB')} tutorial
                  {cat._count.tutorials === 1 ? '' : 's'} ·{' '}
                  {cat.subCategories.length} sub-categor
                  {cat.subCategories.length === 1 ? 'y' : 'ies'}
                </span>
                <Link
                  href={`/admin/categories/${cat.id}`}
                  className="categories-edit"
                >
                  edit
                </Link>
              </summary>

              <div className="categories-children">
                {cat.subCategories.length === 0 ? (
                  <p className="categories-empty">No sub-categories yet.</p>
                ) : (
                  <ul>
                    {cat.subCategories.map((sub) => {
                      const subPatternCount = craftStat?.publishedBySubCategoryId.get(sub.id) ?? 0
                      return (
                      <li key={sub.id} className="categories-sub-row">
                        <span className="categories-name">{sub.name}</span>
                        <code className="categories-slug">{sub.slug}</code>
                        <span className="categories-count">
                          {craftStat && (
                            <>
                              {subPatternCount.toLocaleString('en-GB')} pattern
                              {subPatternCount === 1 ? '' : 's'} ·{' '}
                            </>
                          )}
                          {sub._count.tutorials.toLocaleString('en-GB')} tutorial
                          {sub._count.tutorials === 1 ? '' : 's'}
                        </span>
                        <Link
                          href={`/admin/sub-categories/${sub.id}`}
                          className="categories-edit"
                        >
                          edit
                        </Link>
                        <form action={deleteSubCategory.bind(null, sub.id)}>
                          <button
                            type="submit"
                            className="categories-delete"
                            aria-label={`Delete sub-category ${sub.name}`}
                          >
                            ×
                          </button>
                        </form>
                      </li>
                      )
                    })}
                  </ul>
                )}

                <form action={createSubCategory} className="categories-inline-add">
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <input
                    name="name"
                    placeholder="New sub-category name"
                    required
                  />
                  <input
                    name="slug"
                    placeholder="slug"
                    pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                    required
                  />
                  <button type="submit">Add sub-category</button>
                </form>

                <form
                  action={deleteCategory.bind(null, cat.id)}
                  className="categories-row-danger"
                >
                  <button
                    type="submit"
                    className="categories-delete-row"
                    aria-label={`Delete category ${cat.name}`}
                  >
                    Delete category
                  </button>
                </form>
              </div>
            </details>
          </li>
          )
        })}
      </ul>

      <section className="categories-add-new">
        <h2>Add a top-level category</h2>
        <form action={createCategory}>
          <input name="name" placeholder="Category name" required />
          <input
            name="slug"
            placeholder="slug"
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            required
          />
          <input
            name="description"
            placeholder="Short description (optional)"
          />
          <input
            name="order"
            type="number"
            min="0"
            defaultValue="0"
            placeholder="order"
          />
          <button type="submit">Create category</button>
        </form>
      </section>
    </div>
  )
}
