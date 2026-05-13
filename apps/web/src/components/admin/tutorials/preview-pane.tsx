'use client'

import type { JSONContent } from '@tiptap/core'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import {
  ScaleProvider,
  extractScaleIngredients,
} from '@/components/public/tutorial-content/scale-context'
import { TutorialChrome } from '@/components/public/tutorial-chrome'
import type {
  GlossaryRef as PublicGlossaryRef,
  SubTutorialRef,
  TipTapNode,
} from '@/components/public/tutorial-content/types'
import type {
  GlossaryRef,
  TutorialRef,
} from '@/components/admin/editor/types'
import type { MediaOption } from './hero-media-picker'

interface PreviewPaneProps {
  body: JSONContent
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
  title: string
  subtitle: string
  excerpt: string
  category: { slug: string; name: string } | null
  subCategoryName: string | null
  difficulty: string
  timeMinutes: number | null
  season: string | null
  heroMedia: MediaOption | null
  sourceType: string
  sourceNotes: string
  /** Cloudflare Images delivery hash, passed down from the server page. */
  cloudflareDeliveryHash: string | null
  /** RECIPE / TECHNIQUE — controls which info-bar variant + body renderer fires. */
  type: 'RECIPE' | 'TECHNIQUE'
  /** Recipe metadata mirrored from form state. Read only when type === 'RECIPE'. */
  recipeMeta?: {
    servings: number | null
    yieldDescription: string | null
    prepMinutes: number | null
    cookMinutes: number | null
    totalMinutes: number | null
    scalable: boolean
    freezable: boolean
    batchable: boolean
    makeAheadSummary: string | null
    cuisine: string | null
    mealType: string | null
    dietaryFlags: string[]
    foundational: boolean
  }
}

/**
 * Live preview of the in-progress tutorial — body, hero, and all metadata
 * read straight from the form state in `TutorialForm`. Edits show up
 * without saving. Mirrors the public tutorial route's chrome via the shared
 * `TutorialChrome` presentation component.
 */
export function PreviewPane({
  body,
  glossary,
  tutorials,
  title,
  subtitle,
  excerpt,
  category,
  subCategoryName,
  difficulty,
  timeMinutes,
  season,
  heroMedia,
  sourceType,
  sourceNotes,
  cloudflareDeliveryHash,
  type,
  recipeMeta,
}: PreviewPaneProps) {
  const isRecipe = type === 'RECIPE'
  const publicGlossary: PublicGlossaryRef[] = glossary.map((g) => ({
    id: g.id,
    term: g.term,
    slug: g.slug,
    definition: g.definition,
  }))

  const subTutorials: SubTutorialRef[] = tutorials.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    categorySlug: t.categorySlug,
    categoryName: t.categoryName,
    heroThumbnailUrl: null,
  }))

  const heroUrl =
    heroMedia?.cloudflareId && cloudflareDeliveryHash
      ? `https://imagedelivery.net/${cloudflareDeliveryHash}/${heroMedia.cloudflareId}/hero`
      : null

  return (
    <div className="rounded-sm border border-dashed border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] py-8">
      <TutorialChrome
        title={title}
        subtitle={subtitle || null}
        excerpt={excerpt || null}
        category={category}
        subCategoryName={subCategoryName}
        difficulty={difficulty}
        timeMinutes={timeMinutes}
        season={season}
        heroUrl={heroUrl}
        heroAlt={heroMedia?.alt ?? null}
        publishedAt={null}
        readingTime={estimateReadingTime(body as unknown as TipTapNode)}
        sourceType={sourceType}
        sourceNotes={sourceNotes || null}
        linkBreadcrumb={false}
        recipeMeta={
          recipeMeta
            ? {
                type,
                servings: recipeMeta.servings,
                yieldDescription: recipeMeta.yieldDescription,
                prepMinutes: recipeMeta.prepMinutes,
                cookMinutes: recipeMeta.cookMinutes,
                totalMinutes: recipeMeta.totalMinutes,
                cuisine: recipeMeta.cuisine,
                mealType: recipeMeta.mealType,
                dietaryFlags: recipeMeta.dietaryFlags,
                freezable: recipeMeta.freezable,
                batchable: recipeMeta.batchable,
                makeAheadSummary: recipeMeta.makeAheadSummary,
                foundational: recipeMeta.foundational,
              }
            : null
        }
        body={
          isRecipe ? (
            <ScaleProvider
              defaultServings={recipeMeta?.servings ?? null}
              ingredients={extractScaleIngredients(body)}
            >
              <TutorialContent
                content={body as TipTapNode}
                glossary={publicGlossary}
                subTutorials={subTutorials}
                recipeContext={{
                  // Synthetic id + slug used only for the scaler's analytics
                  // event distinct id. The preview never persists.
                  tutorialId: 'preview',
                  tutorialSlug: 'preview',
                  scalable: recipeMeta?.scalable ?? true,
                }}
              />
            </ScaleProvider>
          ) : (
            <TutorialContent
              content={body as TipTapNode}
              glossary={publicGlossary}
              subTutorials={subTutorials}
              recipeContext={null}
            />
          )
        }
      />
    </div>
  )
}

function estimateReadingTime(body: TipTapNode | null): string | null {
  if (!body) return null
  let words = 0
  function walk(n: TipTapNode): void {
    if (n.text) {
      words += n.text.split(/\s+/).filter(Boolean).length
    }
    if (n.content) n.content.forEach(walk)
  }
  walk(body)
  if (words < 60) return null
  const minutes = Math.max(1, Math.round(words / 220))
  return `${minutes} min`
}
