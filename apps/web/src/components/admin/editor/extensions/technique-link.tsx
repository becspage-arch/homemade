'use client'

import { Mark, mergeAttributes } from '@tiptap/core'
import type { TechniqueRef } from '../types'

export interface TechniqueLinkAttrs {
  techniqueSlug: string
  /**
   * Display label captured at the moment the author wrapped the text.
   * Stored so the editor can show something sensible without a live DB
   * lookup. The public renderer prefers the queried Tutorial.title over
   * the cached label, falling back to it only if the technique tutorial
   * doesn't exist yet (the link gracefully degrades to plain text in
   * that case — see `tutorial-content.tsx`).
   */
  label: string
}

interface ExtensionStorage {
  techniques: TechniqueRef[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    techniqueLink: {
      setTechniqueLink: (attrs: TechniqueLinkAttrs) => ReturnType
      unsetTechniqueLink: () => ReturnType
    }
  }
}

/**
 * Inline mark wrapping a span of text with a reference to a technique
 * tutorial by slug. Patterned after `glossary-tooltip.tsx` — the only
 * differences are the attribute set (slug + cached label, no termId
 * cuid) and the data-attribute carrying the slug so the editor CSS can
 * style live links distinctly from glossary tooltips.
 *
 * The slug is the stable identifier across both the editor and the
 * public renderer. The renderer does a single batched query to resolve
 * slugs to titles at page-render time; a slug whose tutorial doesn't
 * exist yet falls back to plain text rather than rendering a broken
 * link. That fallback lets a recipe author wrap the technique words
 * NOW even before the matching technique tutorial is published — the
 * link goes live automatically when the technique row lands.
 */
export const TechniqueLink = Mark.create<object, ExtensionStorage>({
  name: 'techniqueLink',
  inclusive: false,

  addStorage() {
    return { techniques: [] }
  },

  addAttributes() {
    return {
      techniqueSlug: { default: '' },
      label: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-technique-slug]' }]
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-technique-slug': mark.attrs.techniqueSlug,
        'data-technique-label': mark.attrs.label,
        class: 'technique-link',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setTechniqueLink:
        (attrs: TechniqueLinkAttrs) =>
        ({ commands }) =>
          commands.setMark(this.name, attrs),
      unsetTechniqueLink:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
