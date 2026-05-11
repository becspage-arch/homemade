'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'

export type InfoPanelTone = 'info' | 'warning' | 'tip'

export interface InfoPanelAttrs {
  tone: InfoPanelTone
  title: string
  body: string
}

const TONES: { value: InfoPanelTone; label: string; classes: string }[] = [
  {
    value: 'info',
    label: 'info',
    classes: 'border-[var(--color-soft-teal)] bg-[var(--color-bone)]',
  },
  {
    value: 'tip',
    label: 'tip',
    classes: 'border-[var(--color-sage)] bg-[var(--color-soft-parchment)]',
  },
  {
    value: 'warning',
    label: 'warning',
    classes: 'border-[var(--color-burnt-sienna)] bg-[var(--color-coral-blush)]',
  },
]

export const InfoPanel = Node.create({
  name: 'infoPanel',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      tone: { default: 'info' as InfoPanelTone },
      title: { default: '' },
      body: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="info-panel"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'info-panel' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InfoPanelView)
  },
})

function InfoPanelView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as InfoPanelAttrs
  const toneDef = TONES.find((t) => t.value === attrs.tone) ?? TONES[0]!

  return (
    <NodeViewWrapper
      className={`my-6 border-l-4 px-5 py-4 ${toneDef.classes} ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <div className="mb-2 flex items-center gap-3" contentEditable={false}>
        <span
          className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          info panel
        </span>
        <select
          value={attrs.tone}
          onChange={(e) =>
            updateAttributes({ tone: e.target.value as InfoPanelTone })
          }
          className="border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-0.5 text-xs text-[var(--color-warm-taupe)] outline-none"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {TONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={attrs.title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
        placeholder="Panel title"
        className="block w-full bg-transparent text-lg text-[var(--color-espresso)] outline-none"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 500 }}
      />
      <textarea
        value={attrs.body}
        onChange={(e) => updateAttributes({ body: e.target.value })}
        rows={3}
        placeholder="Body text…"
        className="mt-2 block w-full resize-y bg-transparent text-[var(--color-warm-taupe)] outline-none"
        style={{ fontFamily: 'var(--font-lora)' }}
      />
    </NodeViewWrapper>
  )
}
