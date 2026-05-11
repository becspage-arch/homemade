'use client'

import { Mark, mergeAttributes } from '@tiptap/core'
import type { GlossaryRef } from '../types'

export interface GlossaryTooltipAttrs {
  termId: string
}

interface ExtensionStorage {
  glossary: GlossaryRef[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    glossaryTooltip: {
      setGlossaryTooltip: (attrs: GlossaryTooltipAttrs) => ReturnType
      unsetGlossaryTooltip: () => ReturnType
    }
  }
}

/**
 * Inline mark wrapping a span of text with a reference to a glossary term.
 * The visual cue (dotted underline) is applied via the `data-glossary-term`
 * attribute and the editor CSS in editor.css.
 */
export const GlossaryTooltip = Mark.create<object, ExtensionStorage>({
  name: 'glossaryTooltip',
  inclusive: false,

  addStorage() {
    return { glossary: [] }
  },

  addAttributes() {
    return {
      termId: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-glossary-term]' }]
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-glossary-term': mark.attrs.termId,
        class: 'glossary-tooltip',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setGlossaryTooltip:
        (attrs: GlossaryTooltipAttrs) =>
        ({ commands }) =>
          commands.setMark(this.name, attrs),
      unsetGlossaryTooltip:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
