'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'

/**
 * Inline product / affiliate card.
 *
 * Note: this is a *content block*, not a relation to a Product model. A
 * proper Product / SKU schema lands in Phase 7 (Marketplace). For now the
 * data lives inline in the TipTap JSON and a future migration can hoist
 * it.
 */

export interface ProductCardAttrs {
  imageUrl: string
  title: string
  description: string
  label: string
  price: string
  currency: string
  retailerName: string
  productUrl: string
}

export const ProductCard = Node.create({
  name: 'productCard',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      imageUrl: { default: '' },
      title: { default: '' },
      description: { default: '' },
      label: { default: 'Editorial pick' },
      price: { default: '' },
      currency: { default: '£' },
      retailerName: { default: '' },
      productUrl: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="product-card"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'product-card' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductCardView)
  },
})

function ProductCardView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as ProductCardAttrs

  function patch<K extends keyof ProductCardAttrs>(key: K, value: ProductCardAttrs[K]) {
    updateAttributes({ [key]: value })
  }

  return (
    <NodeViewWrapper
      className={`my-6 rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] px-5 py-4 ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <div contentEditable={false}>
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            product card
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-start">
          <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] sm:w-28">
            {attrs.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attrs.imageUrl}
                alt={attrs.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="px-2 text-center text-[10px] italic text-[var(--color-warm-taupe)] opacity-60"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                no image
              </span>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={attrs.label}
              onChange={(e) => patch('label', e.target.value)}
              placeholder="Editorial pick · best for learners"
              className="block w-full bg-transparent text-[10px] uppercase tracking-[0.18em] text-[var(--color-sage)] outline-none"
              style={{ fontFamily: 'var(--font-lora)' }}
            />
            <input
              type="text"
              value={attrs.title}
              onChange={(e) => patch('title', e.target.value)}
              placeholder="Product title (e.g. British wool DK, 50g)"
              className="block w-full bg-transparent text-lg text-[var(--color-espresso)] outline-none"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 500 }}
            />
            <textarea
              value={attrs.description}
              onChange={(e) => patch('description', e.target.value)}
              rows={2}
              placeholder="Short description"
              className="block w-full resize-y bg-transparent text-sm text-[var(--color-warm-taupe)] outline-none"
              style={{ fontFamily: 'var(--font-lora)' }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-dashed border-[var(--color-linen-grey)] pt-3 sm:grid-cols-[1fr_120px_120px_1fr]">
          <input
            type="url"
            value={attrs.imageUrl}
            onChange={(e) => patch('imageUrl', e.target.value)}
            placeholder="Image URL (or Cloudflare delivery URL)"
            className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-xs text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
          <input
            type="text"
            value={attrs.currency}
            onChange={(e) => patch('currency', e.target.value)}
            placeholder="£"
            maxLength={3}
            className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-xs text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
          <input
            type="text"
            value={attrs.price}
            onChange={(e) => patch('price', e.target.value)}
            placeholder="6.50"
            className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-xs text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
          <input
            type="text"
            value={attrs.retailerName}
            onChange={(e) => patch('retailerName', e.target.value)}
            placeholder="Retailer (Daughter of a Shepherd)"
            className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-xs text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
        </div>
        <input
          type="url"
          value={attrs.productUrl}
          onChange={(e) => patch('productUrl', e.target.value)}
          placeholder="Product URL (affiliate or direct)"
          className="mt-3 block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-xs text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        />
      </div>
    </NodeViewWrapper>
  )
}
