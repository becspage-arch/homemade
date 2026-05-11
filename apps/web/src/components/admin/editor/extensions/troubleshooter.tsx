'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'

export interface TroubleItem {
  symptom: string
  cause: string
  fix: string
}

export interface TroubleshooterAttrs {
  heading: string
  intro: string
  items: TroubleItem[]
}

/**
 * Common troubles / troubleshooter block. Pairs a symptom (italic, terracotta
 * in the public renderer) with a cause/fix paragraph. Matches the
 * `.trouble` styling in the tomato reference.
 */
export const Troubleshooter = Node.create({
  name: 'troubleshooter',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      heading: { default: 'Common troubles' },
      intro: { default: '' },
      items: { default: [] as TroubleItem[] },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="troubleshooter"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'troubleshooter' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TroubleshooterView)
  },
})

function TroubleshooterView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as TroubleshooterAttrs
  const items: TroubleItem[] = Array.isArray(attrs.items) ? attrs.items : []

  function updateItem(i: number, patch: Partial<TroubleItem>) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    updateAttributes({ items: next })
  }

  function addItem() {
    updateAttributes({
      items: [...items, { symptom: '', cause: '', fix: '' }],
    })
  }

  function removeItem(i: number) {
    updateAttributes({ items: items.filter((_, idx) => idx !== i) })
  }

  return (
    <NodeViewWrapper
      className={`my-6 rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-bone)] px-5 py-4 ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <div contentEditable={false}>
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            troubleshooter
          </span>
        </div>

        <input
          type="text"
          value={attrs.heading}
          onChange={(e) => updateAttributes({ heading: e.target.value })}
          placeholder="Heading (e.g. Common troubles)"
          className="block w-full bg-transparent text-xl text-[var(--color-espresso)] outline-none"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 500 }}
        />
        <textarea
          value={attrs.intro}
          onChange={(e) => updateAttributes({ intro: e.target.value })}
          rows={2}
          placeholder="Intro (optional)"
          className="mt-2 block w-full resize-y bg-transparent text-sm italic text-[var(--color-warm-taupe)] outline-none"
          style={{ fontFamily: 'var(--font-lora)' }}
        />

        <ul className="mt-4 divide-y divide-[var(--color-linen-grey)]">
          {items.map((it, i) => (
            <li
              key={i}
              className="grid gap-2 py-3 sm:grid-cols-[1fr_2fr] sm:gap-4"
            >
              <textarea
                value={it.symptom}
                onChange={(e) => updateItem(i, { symptom: e.target.value })}
                rows={2}
                placeholder="Symptom (e.g. Dark sunken patches on the bottom of fruit)"
                className="block w-full resize-y bg-transparent text-base italic text-[var(--color-burnt-sienna)] outline-none"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              />
              <div className="space-y-2">
                <input
                  type="text"
                  value={it.cause}
                  onChange={(e) => updateItem(i, { cause: e.target.value })}
                  placeholder="Cause (one phrase, e.g. Blossom end rot.)"
                  className="block w-full bg-transparent text-sm font-medium text-[var(--color-espresso)] outline-none"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <textarea
                  value={it.fix}
                  onChange={(e) => updateItem(i, { fix: e.target.value })}
                  rows={2}
                  placeholder="What to do about it"
                  className="block w-full resize-y bg-transparent text-sm text-[var(--color-warm-taupe)] outline-none"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-burnt-sienna)] opacity-60 hover:opacity-100"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          + add trouble
        </button>
      </div>
    </NodeViewWrapper>
  )
}
