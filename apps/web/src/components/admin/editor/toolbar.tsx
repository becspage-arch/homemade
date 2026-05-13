'use client'

import { useState, useMemo } from 'react'
import type { Editor } from '@tiptap/core'
import type { GlossaryRef } from './types'

interface ToolbarProps {
  editor: Editor
  glossary: GlossaryRef[]
  /** Default servings to seed onto a freshly inserted ingredients-list block. */
  defaultServings?: number | null
}

export function Toolbar({ editor, glossary, defaultServings }: ToolbarProps) {
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [glossarySearch, setGlossarySearch] = useState('')

  const filtered = useMemo(() => {
    if (!glossarySearch.trim()) return glossary.slice(0, 30)
    const q = glossarySearch.trim().toLowerCase()
    return glossary
      .filter(
        (g) =>
          g.term.toLowerCase().includes(q) ||
          g.slug.toLowerCase().includes(q),
      )
      .slice(0, 30)
  }, [glossary, glossarySearch])

  const isGlossaryActive = editor.isActive('glossaryTooltip')

  return (
    <div className="sticky top-0 z-20 -mx-1 mb-3 flex flex-wrap items-center gap-1 border-b border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] px-1 py-2">
      <Group>
        <Btn
          label="H1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive('heading', { level: 1 })}
        />
        <Btn
          label="H2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
        />
        <Btn
          label="H3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
        />
        <Btn
          label="P"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
        />
      </Group>

      <Group>
        <Btn
          label="B"
          bold
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        />
        <Btn
          label="I"
          italic
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        />
        <Btn
          label="link"
          onClick={() => {
            const prev = editor.getAttributes('link').href ?? ''
            const url = window.prompt('Link URL', prev)
            if (url === null) return
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
              return
            }
            editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href: url })
              .run()
          }}
          active={editor.isActive('link')}
        />
      </Group>

      <Group>
        <Btn
          label="• list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        />
        <Btn
          label="1. list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        />
        <Btn
          label="quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        />
      </Group>

      <Group>
        <Btn
          label="info panel"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'infoPanel',
                attrs: { tone: 'info', title: '', body: '' },
              })
              .run()
          }
        />
        <Btn
          label="supplies"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'suppliesCard',
                attrs: { heading: 'You will need', items: [] },
              })
              .run()
          }
        />
        <Btn
          label="ingredients"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'ingredientsList',
                attrs: {
                  defaultServings: defaultServings ?? null,
                  items: [],
                },
              })
              .run()
          }
        />
        <Btn
          label="sub-tutorial"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'subTutorialCard',
                attrs: { tutorialId: '' },
              })
              .run()
          }
        />
        <Btn
          label="pull quote"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'pullQuote',
                attrs: { quote: '', attribution: '' },
              })
              .run()
          }
        />
        <Btn
          label={isGlossaryActive ? 'tooltip ✓' : 'tooltip'}
          onClick={() => {
            if (isGlossaryActive) {
              editor.chain().focus().unsetGlossaryTooltip().run()
              return
            }
            const { from, to } = editor.state.selection
            if (from === to) {
              alert('Select the text you want to wrap, then click tooltip.')
              return
            }
            setGlossaryOpen(true)
          }}
          active={isGlossaryActive}
        />
      </Group>

      <Group>
        <Btn
          label="product"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'productCard',
                attrs: {
                  imageUrl: '',
                  title: '',
                  description: '',
                  label: 'Editorial pick',
                  price: '',
                  currency: '£',
                  retailerName: '',
                  productUrl: '',
                },
              })
              .run()
          }
        />
        <Btn
          label="varieties"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'varietiesPanel',
                attrs: {
                  label: 'A starting selection',
                  heading: '',
                  intro: '',
                  items: [],
                },
              })
              .run()
          }
        />
        <Btn
          label="troubles"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'troubleshooter',
                attrs: {
                  heading: 'Common troubles',
                  intro: '',
                  items: [],
                },
              })
              .run()
          }
        />
      </Group>

      {glossaryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-24"
          onClick={() => setGlossaryOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="text-lg text-[var(--color-espresso)]"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Pick a glossary term
              </h3>
              <button
                type="button"
                onClick={() => setGlossaryOpen(false)}
                className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                close
              </button>
            </div>
            <input
              type="search"
              autoFocus
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              placeholder="Search by term or slug…"
              className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 outline-none focus:border-[var(--color-sage)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            />
            <ul className="mt-3 max-h-72 overflow-y-auto divide-y divide-[var(--color-linen-grey)]">
              {filtered.length === 0 && (
                <li
                  className="py-3 text-sm italic text-[var(--color-warm-taupe)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  {glossary.length === 0
                    ? 'No glossary terms yet. Add some at /admin/glossary.'
                    : 'No matches.'}
                </li>
              )}
              {filtered.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .setGlossaryTooltip({ termId: g.id })
                        .run()
                      setGlossaryOpen(false)
                      setGlossarySearch('')
                    }}
                    className="block w-full py-2 text-left hover:bg-[var(--color-soft-parchment)]"
                  >
                    <span
                      className="block text-[var(--color-espresso)]"
                      style={{ fontFamily: 'var(--font-fraunces)' }}
                    >
                      {g.term}
                    </span>
                    <span
                      className="block text-xs italic text-[var(--color-warm-taupe)]"
                      style={{ fontFamily: 'var(--font-lora)' }}
                    >
                      {g.definition}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="mr-2 flex gap-1 border-r border-[var(--color-linen-grey)] pr-2 last:border-r-0">
      {children}
    </div>
  )
}

function Btn({
  label,
  onClick,
  active,
  bold,
  italic,
}: {
  label: string
  onClick: () => void
  active?: boolean
  bold?: boolean
  italic?: boolean
}) {
  const style: React.CSSProperties = {
    fontFamily: 'var(--font-lora)',
    fontWeight: bold ? 600 : 400,
    fontStyle: italic ? 'italic' : 'normal',
  }
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-sm px-2 py-1 text-xs uppercase tracking-[0.18em] ${
        active
          ? 'bg-[var(--color-sage)] text-[var(--color-linen-cream)]'
          : 'text-[var(--color-warm-taupe)] hover:bg-[var(--color-soft-parchment)]'
      }`}
      style={style}
    >
      {label}
    </button>
  )
}
