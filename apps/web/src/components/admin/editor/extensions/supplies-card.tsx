'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'

export interface SuppliesItem {
  name: string
  qty?: string
  link?: string
  /** Optional substitution hints — surfaced to readers in beginner mode. */
  substitutions?: string
}

export interface SuppliesCardAttrs {
  heading: string
  items: SuppliesItem[]
}

export const SuppliesCard = Node.create({
  name: 'suppliesCard',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      heading: { default: 'You will need' },
      items: { default: [] as SuppliesItem[] },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="supplies-card"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'supplies-card' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SuppliesCardView)
  },
})

function SuppliesCardView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as SuppliesCardAttrs
  const items: SuppliesItem[] = Array.isArray(attrs.items) ? attrs.items : []

  function updateItem(i: number, patch: Partial<SuppliesItem>) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    updateAttributes({ items: next })
  }

  function removeItem(i: number) {
    updateAttributes({ items: items.filter((_, idx) => idx !== i) })
  }

  function addItem() {
    updateAttributes({ items: [...items, { name: '' }] })
  }

  return (
    <NodeViewWrapper
      className={`my-6 rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] px-5 py-4 ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <div contentEditable={false}>
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            supplies card
          </span>
        </div>
        <input
          type="text"
          value={attrs.heading}
          onChange={(e) => updateAttributes({ heading: e.target.value })}
          placeholder="Heading"
          className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent pb-2 text-lg text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 500 }}
        />

        <ul className="mt-3 space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={it.qty ?? ''}
                  onChange={(e) => updateItem(i, { qty: e.target.value })}
                  placeholder="qty"
                  className="w-20 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-sm text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="Item name"
                  className="flex-1 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <input
                  type="url"
                  value={it.link ?? ''}
                  onChange={(e) => updateItem(i, { link: e.target.value })}
                  placeholder="link (optional)"
                  className="w-48 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-sm text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-xs uppercase tracking-[0.2em] text-[var(--color-burnt-sienna)] opacity-60 hover:opacity-100"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  remove
                </button>
              </div>
              <input
                type="text"
                value={it.substitutions ?? ''}
                onChange={(e) =>
                  updateItem(i, { substitutions: e.target.value })
                }
                placeholder="substitutions (optional — shown to beginners)"
                className="ml-22 border-b border-dashed border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-sm italic text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
                style={{ fontFamily: 'var(--font-lora)', marginLeft: '88px' }}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          + add item
        </button>
      </div>
    </NodeViewWrapper>
  )
}
