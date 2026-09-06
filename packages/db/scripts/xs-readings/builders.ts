/**
 * Small TipTap-node builder helpers for authoring the cross-stitch READING
 * pieces by hand without re-typing `{ type: 'text', ... }` boilerplate (and
 * risking the missing-`type` bug the tiptap-text-node-type memory warns
 * about) on every line.
 */

export interface TextRun {
  type: 'text'
  text: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

export const t = (text: string): TextRun => ({ type: 'text', text })
export const bold = (text: string): TextRun => ({ type: 'text', text, marks: [{ type: 'bold' }] })
export const gloss = (text: string, slug: string): TextRun => ({
  type: 'text',
  text,
  marks: [{ type: 'glossaryTooltip', attrs: { termSlug: slug } }],
})
export const techLink = (text: string, techniqueSlug: string): TextRun => ({
  type: 'text',
  text,
  marks: [{ type: 'techniqueLink', attrs: { techniqueSlug, label: text } }],
})
export const link = (text: string, href: string): TextRun => ({
  type: 'text',
  text,
  marks: [{ type: 'link', attrs: { href } }],
})

export const p = (...runs: TextRun[]) => ({ type: 'paragraph', content: runs })

export const h2 = (text: string) => ({
  type: 'heading',
  attrs: { level: 2 },
  content: [t(text)],
})

export const li = (...runs: TextRun[]) => ({
  type: 'listItem',
  content: [p(...runs)],
})

export const ul = (...items: ReturnType<typeof li>[]) => ({
  type: 'bulletList',
  content: items,
})

export const ol = (...items: ReturnType<typeof li>[]) => ({
  type: 'orderedList',
  content: items,
})

export const suppliesCard = (
  heading: string,
  items: Array<{ name: string; slug?: string; isOptional?: boolean }>,
) => ({
  type: 'suppliesCard',
  attrs: { heading, items: items.map((i) => ({ isOptional: false, ...i })) },
})

export const troubleshooter = (
  heading: string,
  intro: string,
  items: Array<{ symptom: string; cause: string; fix: string }>,
) => ({
  type: 'troubleshooter',
  attrs: { heading, intro, items },
})

export const subTutorialCard = (tutorialSlug: string) => ({
  type: 'subTutorialCard',
  attrs: { tutorialSlug },
})

import type { TutorialDoc, TutorialNode } from '../upload-tutorial-types.js'

export const doc = (...content: TutorialNode[]): TutorialDoc => ({ type: 'doc', content })
