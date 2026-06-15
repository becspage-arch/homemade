import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, UserRecipeStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/auth'
import { mediaSrcSet } from '@/lib/media'
import { TutorialCard } from '@/components/public/tutorial-card'
import { RecipeRowActions } from '@/components/public/recipes/recipe-row-actions'
import { RECIPE_CATEGORY_SLUGS } from '@/lib/recipes/recipe-vocab'

import './recipes.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Your recipes' }

type Tab = 'mine' | 'saved' | 'stats'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_AI_MODERATION: 'In review',
  APPROVED: 'Published',
  REJECTED: 'Needs a change',
  ARCHIVED: 'Archived',
}

const STATUS_CLASS: Record<string, string> = {
  DRAFT: '',
  PENDING_AI_MODERATION: 'in-progress',
  APPROVED: 'completed',
  REJECTED: 'abandoned',
  ARCHIVED: '',
}

function firstRejectionNote(notes: unknown): string | null {
  if (!Array.isArray(notes)) return null
  for (const f of notes) {
    if (f && typeof f === 'object') {
      const row = f as Record<string, unknown>
      if (row.passed === false && typeof row.detail === 'string') return row.detail
    }
  }
  return null
}

export default async function MyRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const { tab: tabRaw } = await searchParams
  const tab: Tab = tabRaw === 'saved' ? 'saved' : tabRaw === 'stats' ? 'stats' : 'mine'

  const recipes = await prisma.userRecipe.findMany({
    where: { ownerUserId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      visibility: true,
      categorySlug: true,
      saveCount: true,
      viewCount: true,
      aiModerationNotes: true,
      updatedAt: true,
    },
  })

  const approvedCount = recipes.filter((r) => r.status === UserRecipeStatus.APPROVED).length
  const totalSaves = recipes.reduce((sum, r) => sum + r.saveCount, 0)
  const totalViews = recipes.reduce((sum, r) => sum + r.viewCount, 0)

  return (
    <section>
      <div className="recipes-head">
        <div>
          <span className="me-section-label">Your space</span>
          <h2 className="me-section-title">Your recipes</h2>
        </div>
        <Link href="/me/recipes/new" className="me-button">
          Write a recipe
        </Link>
      </div>

      <nav className="recipes-tabs" aria-label="Recipe sections">
        <TabLink current={tab} value="mine" label="My recipes" />
        <TabLink current={tab} value="saved" label="Saved" />
        <TabLink current={tab} value="stats" label="Stats" />
      </nav>

      {tab === 'mine' && (
        <MyRecipes recipes={recipes} />
      )}
      {tab === 'saved' && <SavedRecipes userId={user.id} />}
      {tab === 'stats' && (
        <div className="me-stats-strip">
          <Stat label="Recipes" value={recipes.length} detail={`${approvedCount} published`} />
          <Stat label="Saves received" value={totalSaves} detail="across your recipes" />
          <Stat label="Views" value={totalViews} detail="across your recipes" />
        </div>
      )}
    </section>
  )
}

function TabLink({ current, value, label }: { current: Tab; value: Tab; label: string }) {
  const href = value === 'mine' ? '/me/recipes' : `/me/recipes?tab=${value}`
  return (
    <Link href={href} className={`recipes-tab${current === value ? ' is-on' : ''}`}>
      {label}
    </Link>
  )
}

function MyRecipes({
  recipes,
}: {
  recipes: Array<{
    id: string
    title: string
    status: string
    visibility: string
    categorySlug: string
    aiModerationNotes: unknown
  }>
}) {
  if (recipes.length === 0) {
    return (
      <p className="me-empty">
        You have not written a recipe yet. Start one and it will live here, drafts and all.
      </p>
    )
  }
  return (
    <ul className="recipes-list">
      {recipes.map((r) => {
        const note = r.status === 'REJECTED' ? firstRejectionNote(r.aiModerationNotes) : null
        return (
          <li key={r.id} className="recipes-list-row">
            <div className="recipes-list-main">
              <span className="recipes-list-title">{r.title}</span>
              <span className="recipes-list-meta">
                <span className={`me-status-pill ${STATUS_CLASS[r.status] ?? ''}`}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                <span className="recipes-list-cat">{r.categorySlug.replace(/-/g, ' ')}</span>
              </span>
              {note && <span className="recipes-list-note">{note}</span>}
            </div>
            <RecipeRowActions id={r.id} status={r.status} visibility={r.visibility} />
          </li>
        )
      })}
    </ul>
  )
}

async function SavedRecipes({ userId }: { userId: string }) {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      tutorial: { category: { slug: { in: [...RECIPE_CATEGORY_SLUGS] } } },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      tutorial: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          difficulty: true,
          season: true,
          category: { select: { slug: true, name: true } },
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      },
    },
  })

  if (bookmarks.length === 0) {
    return (
      <p className="me-empty">
        Recipes you save will gather here. Tap &ldquo;Add to Make it&rdquo; on any cooking, baking,
        herbal, or natural-home recipe.
      </p>
    )
  }

  return (
    <div className="me-grid">
      {bookmarks.map((b) => {
        const card = mediaSrcSet(b.tutorial.hero, 'card', ['public'])
        return (
          <TutorialCard
            key={b.id}
            href={`/${b.tutorial.category.slug}/${b.tutorial.slug}`}
            title={b.tutorial.title}
            excerpt={b.tutorial.excerpt}
            heroUrl={card?.src ?? null}
            heroSrcSet={card?.srcSet}
            difficulty={b.tutorial.difficulty}
            season={b.tutorial.season}
            categoryName={b.tutorial.category.name}
            state={{
              bookmarked: true,
              projectStatus: null,
              projectId: null,
              projectProgressPercent: null,
            }}
          />
        )
      })}
    </div>
  )
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="me-stat">
      <span className="me-stat-label">{label}</span>
      <span className="me-stat-value">{value}</span>
      <span className="me-stat-detail">{detail}</span>
    </div>
  )
}
