'use client'

import type { JSONContent } from '@tiptap/core'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import type {
  GlossaryRef as PublicGlossaryRef,
  SubTutorialRef,
  TipTapNode,
} from '@/components/public/tutorial-content/types'
import type {
  GlossaryRef,
  TutorialRef,
} from '@/components/admin/editor/types'

interface PreviewPaneProps {
  body: JSONContent
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
}

/**
 * Live preview of the in-progress tutorial body using the public renderer.
 * Sub-tutorial cards render with the metadata we have client-side (no hero
 * image until the tutorial is saved and the public page loads it).
 */
export function PreviewPane({ body, glossary, tutorials }: PreviewPaneProps) {
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

  return (
    <div className="rounded-sm border border-dashed border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] px-6 py-8">
      <div className="mx-auto max-w-[720px]">
        <TutorialContent
          content={body as TipTapNode}
          glossary={publicGlossary}
          subTutorials={subTutorials}
        />
      </div>
    </div>
  )
}
