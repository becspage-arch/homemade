'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'

export interface VarietyItem {
  name: string
  type: string
  description: string
}

export interface VarietiesPanelAttrs {
  label: string
  heading: string
  intro: string
  items: VarietyItem[]
}

export const VarietiesPanel = Node.create({
  name: 'varietiesPanel',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      label: { default: 'A starting selection' },
      heading: { default: '' },
      intro: { default: '' },
      items: { default: [] as VarietyItem[] },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="varieties-panel"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'varieties-panel' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VarietiesPanelView)
  },
})

function VarietiesPanelView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as VarietiesPanelAttrs
  const items: VarietyItem[] = Array.isArray(attrs.items) ? attrs.items : []

  function updateItem(i: number, patch: Partial<VarietyItem>) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    updateAttributes({ items: next })
  }

  function addItem() {
    updateAttributes({
      items: [...items, { name: '', type: '', description: '' }],
    })
  }

  function removeItem(i: number) {
    updateAttributes({ items: items.filter((_, idx) => idx !== i) })
  }

  return (
    <NodeViewWrapper
      className={`my-6 rounded-sm bg-[var(--color-soft-parchment)] px-6 py-5 ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <div contentEditable={false}>
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            varieties panel
          </span>
        </div>

        <input
          type="text"
          value={attrs.label}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          placeholder="Eyebrow (e.g. A starting selection)"
          className="block w-full bg-transparent text-[10px] uppercase tracking-[0.18em] text-[var(--color-sage)] outline-none"
          style={{ fontFamily: 'var(--font-lora)' }}
        />
        <input
          type="text"
          value={attrs.heading}
          onChange={(e) => updateAttributes({ heading: e.target.value })}
          placeholder="Heading (e.g. Six varieties worth knowing)"
          className="mt-2 block w-full bg-transparent text-2xl text-[var(--color-espresso)] outline-none"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        />
        <textarea
          value={attrs.intro}
          onChange={(e) => updateAttributes({ intro: e.target.value })}
          rows={2}
          placeholder="Intro paragraph (optional)"
          className="mt-2 block w-full resize-y bg-transparent text-sm italic text-[var(--color-warm-taupe)] outline-none"
          style={{ fontFamily: 'var(--font-lora)' }}
        />

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <li
              key={i}
              className="border-t border-[var(--color-linen-grey)] pt-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    placeholder="Variety name"
                    className="block w-full bg-transparent text-base text-[var(--color-espresso)] outline-none"
                    style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 500 }}
                  />
                  <input
                    type="text"
                    value={it.type}
                    onChange={(e) => updateItem(i, { type: e.target.value })}
                    placeholder="Type (e.g. Indeterminate · cherry)"
                    className="block w-full bg-transparent text-xs italic text-[var(--color-sage)] outline-none"
                    style={{ fontFamily: 'var(--font-fraunces)' }}
                  />
                  <textarea
                    value={it.description}
                    onChange={(e) =>
                      updateItem(i, { description: e.target.value })
                    }
                    rows={2}
                    placeholder="Short description"
                    className="block w-full resize-y bg-transparent text-sm text-[var(--color-warm-taupe)] outline-none"
                    style={{ fontFamily: 'var(--font-lora)' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-xs uppercase tracking-[0.2em] text-[var(--color-burnt-sienna)] opacity-60 hover:opacity-100"
                  style={{ fontFamily: 'var(--font-lora)' }}
                  aria-label={`Remove variety ${it.name || i + 1}`}
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
          className="mt-4 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          + add variety
        </button>
      </div>
    </NodeViewWrapper>
  )
}
