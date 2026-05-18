/**
 * TipTap JSON shape, copied locally so the public bundle doesn't pull in
 * @tiptap/core. Matches the subset of TipTap's JSONContent we actually
 * produce in the admin editor (StarterKit + the five custom extensions).
 */

export interface TipTapMark {
  type: string
  attrs?: Record<string, unknown> | null
}

export interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown> | null
  content?: TipTapNode[]
  text?: string
  marks?: TipTapMark[]
}

export interface GlossaryRef {
  id: string
  term: string
  slug: string
  definition: string
}

export interface SubTutorialRef {
  id: string
  slug: string
  title: string
  excerpt: string | null
  categorySlug: string
  categoryName: string
  heroThumbnailUrl: string | null
}

/**
 * Reference to a technique tutorial pointed at by a `techniqueLink` mark.
 * Resolved at page-render time from the slugs collected out of the body
 * by `loadContentRefs`. Slug is the stable id; title shows in the hover
 * popover; categorySlug builds the href.
 */
export interface TechniqueRef {
  slug: string
  title: string
  categorySlug: string
}

export interface TutorialContentRefs {
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  techniques: TechniqueRef[]
}
