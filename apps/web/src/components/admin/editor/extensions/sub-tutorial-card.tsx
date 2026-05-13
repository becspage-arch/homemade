'use client'

import { useMemo, useState } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'
import type { TutorialRef } from '../types'

export interface SubTutorialCardAttrs {
  tutorialId: string
}

interface ExtensionStorage {
  tutorials: TutorialRef[]
}

export const SubTutorialCard = Node.create<object, ExtensionStorage>({
  name: 'subTutorialCard',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addStorage() {
    return { tutorials: [] }
  },

  addAttributes() {
    return {
      tutorialId: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="sub-tutorial-card"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'sub-tutorial-card' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SubTutorialCardView)
  },
})

function SubTutorialCardView({
  node,
  updateAttributes,
  selected,
  extension,
}: ReactNodeViewProps) {
  const attrs = node.attrs as SubTutorialCardAttrs
  const storage = extension.storage as ExtensionStorage
  const tutorials = useMemo(
    () => (Array.isArray(storage.tutorials) ? storage.tutorials : []),
    [storage.tutorials],
  )

  const [open, setOpen] = useState(!attrs.tutorialId)
  const [search, setSearch] = useState('')

  const selectedTutorial = useMemo(
    () => tutorials.find((t) => t.id === attrs.tutorialId) ?? null,
    [tutorials, attrs.tutorialId],
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return tutorials.slice(0, 25)
    const q = search.trim().toLowerCase()
    return tutorials
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q),
      )
      .slice(0, 25)
  }, [tutorials, search])

  return (
    <NodeViewWrapper
      className={`my-6 rounded-sm border-2 border-dashed border-[var(--color-soft-sage)] bg-[var(--color-bone)] px-5 py-4 ${
        selected ? 'ring-2 ring-[var(--color-sage)]' : ''
      }`}
    >
      <div contentEditable={false}>
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            sub-tutorial card
          </span>
          {selectedTutorial && !open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              change
            </button>
          )}
        </div>

        {selectedTutorial && !open ? (
          <div>
            <div
              className="text-xl text-[var(--color-espresso)]"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 500 }}
            >
              {selectedTutorial.title}
            </div>
            <div
              className="mt-1 text-sm italic text-[var(--color-warm-taupe)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              {selectedTutorial.categoryName}
            </div>
          </div>
        ) : (
          <div>
            {tutorials.length === 0 ? (
              <p
                className="text-sm italic text-[var(--color-warm-taupe)]"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                No published tutorials to link to yet. Publish a tutorial first,
                then come back and pick it.
              </p>
            ) : (
              <>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tutorials by title or slug…"
                  className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <ul className="mt-3 max-h-56 overflow-y-auto divide-y divide-[var(--color-linen-grey)]">
                  {filtered.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          updateAttributes({ tutorialId: t.id })
                          setOpen(false)
                        }}
                        className="block w-full py-2 text-left hover:bg-[var(--color-linen-cream)]"
                      >
                        <span
                          className="block text-[var(--color-espresso)]"
                          style={{ fontFamily: 'var(--font-fraunces)' }}
                        >
                          {t.title}
                        </span>
                        <span className="text-xs italic text-[var(--color-warm-taupe)]">
                          {t.categoryName} · {t.slug}
                        </span>
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li
                      className="py-3 text-sm italic text-[var(--color-warm-taupe)]"
                      style={{ fontFamily: 'var(--font-lora)' }}
                    >
                      No matches.
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
