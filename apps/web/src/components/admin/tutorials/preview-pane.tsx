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
  TechniqueRef as PublicTechniqueRef,
  TipTapNode,
} from '@/components/public/tutorial-content/types'
import type {
  GlossaryRef,
  TechniqueRef,
  TutorialRef,
} from '@/components/admin/editor/types'
import type { MediaOption } from './hero-media-picker'

interface PreviewPaneProps {
  body: JSONContent
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
  techniques: TechniqueRef[]
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
  /** RECIPE / TECHNIQUE / PRACTICE / READING / GROWING_GUIDE / REMEDY / HERB_PROFILE / STITCH / PATTERN — controls which info-bar variant + body renderer fires. */
  type:
    | 'RECIPE'
    | 'TECHNIQUE'
    | 'PRACTICE'
    | 'READING'
    | 'GROWING_GUIDE'
    | 'REMEDY'
    | 'HERB_PROFILE'
    | 'STITCH'
    | 'PATTERN'
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
  techniques,
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

  // Forward the same shape the public renderer expects. The admin form's
  // TechniqueRef is already structurally compatible — just narrow the type.
  const publicTechniques: PublicTechniqueRef[] = techniques.map((t) => ({
    slug: t.slug,
    title: t.title,
    categorySlug: t.categorySlug,
  }))

  const heroUrl =
    heroMedia?.cloudflareId && cloudflareDeliveryHash
      ? `https://imagedelivery.net/${cloudflareDeliveryHash}/${heroMedia.cloudflareId}/hero`
      : null

  const chrome = (
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
        <TutorialContent
          content={body as TipTapNode}
          glossary={publicGlossary}
          subTutorials={subTutorials}
          techniques={publicTechniques}
          recipeContext={
            isRecipe
              ? {
                  // Synthetic id + slug used only for the scaler's analytics
                  // event distinct id. The preview never persists.
                  tutorialId: 'preview',
                  tutorialSlug: 'preview',
                  scalable: recipeMeta?.scalable ?? true,
                }
              : null
          }
          // Admin preview — the viewer is always signed in (route is admin-
          // gated), and we deliberately don't pass a tutorialId so the chart
          // viewer falls back to the static SVG render (no progress
          // persistence on previews).
          isSignedIn={true}
          tutorialId={null}
        />
      }
    />
  )

  return (
    <div className="rounded-sm border border-dashed border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] py-8">
      {isRecipe ? (
        <ScaleProvider
          defaultServings={recipeMeta?.servings ?? null}
          ingredients={extractScaleIngredients(body)}
        >
          {chrome}
        </ScaleProvider>
      ) : (
        chrome
      )}
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
