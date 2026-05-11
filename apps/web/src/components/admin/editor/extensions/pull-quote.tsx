'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'

export interface PullQuoteAttrs {
  quote: string
  attribution: string
}

export const PullQuote = Node.create({
  name: 'pullQuote',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      quote: { default: '' },
      attribution: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pull-quote"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'pull-quote' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PullQuoteView)
  },
})

function PullQuoteView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as PullQuoteAttrs

  return (
    <NodeViewWrapper
      className={`relative my-6 border-l-4 border-[var(--color-sage)] bg-[var(--color-soft-parchment)] px-6 py-5 ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <span
        className="absolute -top-2 left-3 bg-[var(--color-soft-parchment)] px-2 text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)' }}
        contentEditable={false}
      >
        pull quote
      </span>
      <textarea
        value={attrs.quote}
        onChange={(e) => updateAttributes({ quote: e.target.value })}
        rows={2}
        placeholder="Quote text…"
        className="block w-full resize-none bg-transparent text-2xl text-[var(--color-espresso)] outline-none"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400, lineHeight: 1.4 }}
      />
      <input
        type="text"
        value={attrs.attribution}
        onChange={(e) => updateAttributes({ attribution: e.target.value })}
        placeholder="Attribution (optional)"
        className="mt-3 block w-full bg-transparent text-sm italic text-[var(--color-warm-taupe)] outline-none"
        style={{ fontFamily: 'var(--font-lora)' }}
      />
    </NodeViewWrapper>
  )
}
