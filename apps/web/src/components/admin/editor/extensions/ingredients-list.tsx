'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from '@tiptap/react'
import { useEffect, useId, useRef, useState } from 'react'

import {
  searchIngredients,
  createIngredientFromEditor,
} from '@/app/admin/tutorials/ingredient-actions'
import {
  DIETARY_FLAGS,
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  type IngredientSearchResult,
} from '@/app/admin/tutorials/ingredient-constants'

/**
 * Structured-ingredients TipTap block.
 *
 * Each row references a row in the master `Ingredient` table by id + slug. The
 * authoring UI is type-ahead-driven; an inline "create new" modal lets authors
 * add unknown ingredients without leaving the editor.
 *
 * On tutorial save (`updateTutorial` / `createTutorial`) the server walks the
 * body JSON and rewrites `RecipeIngredient` rows from these block contents —
 * the block in the body remains the editorial source of truth, with the join
 * rows mirrored for filter / search.
 */
export interface IngredientsListItem {
  ingredientId: string
  ingredientSlug: string
  name: string
  amount: number | null
  unit: string | null
  prepNote: string | null
  isOptional: boolean
  groupLabel: string | null
}

export interface IngredientsListAttrs {
  /** Servings the amounts are written for. Surfaced on the public scaler. */
  defaultServings: number | null
  items: IngredientsListItem[]
}

export const IngredientsList = Node.create({
  name: 'ingredientsList',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      defaultServings: { default: null as number | null },
      items: { default: [] as IngredientsListItem[] },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="ingredients-list"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'ingredients-list' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(IngredientsListView)
  },
})

function IngredientsListView({
  node,
  updateAttributes,
  selected,
}: ReactNodeViewProps) {
  const attrs = node.attrs as IngredientsListAttrs
  const items: IngredientsListItem[] = Array.isArray(attrs.items) ? attrs.items : []
  const [createOpen, setCreateOpen] = useState(false)
  const [createSeedName, setCreateSeedName] = useState('')
  const [createTargetIndex, setCreateTargetIndex] = useState<number | null>(null)

  function patchItem(i: number, patch: Partial<IngredientsListItem>): void {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    updateAttributes({ items: next })
  }

  function removeItem(i: number): void {
    updateAttributes({ items: items.filter((_, idx) => idx !== i) })
  }

  function addItem(): void {
    updateAttributes({
      items: [
        ...items,
        {
          ingredientId: '',
          ingredientSlug: '',
          name: '',
          amount: null,
          unit: null,
          prepNote: null,
          isOptional: false,
          groupLabel: null,
        },
      ],
    })
  }

  function setIngredientForRow(i: number, ing: IngredientSearchResult): void {
    const current = items[i]
    patchItem(i, {
      ingredientId: ing.id,
      ingredientSlug: ing.slug,
      name: ing.name,
      // Adopt the master row's default unit when the row has none set yet.
      unit: current?.unit && current.unit.length > 0 ? current.unit : ing.defaultUnit,
    })
  }

  function openCreate(seedName: string, targetIndex: number): void {
    setCreateSeedName(seedName)
    setCreateTargetIndex(targetIndex)
    setCreateOpen(true)
  }

  function handleCreated(ing: IngredientSearchResult): void {
    if (createTargetIndex !== null) {
      setIngredientForRow(createTargetIndex, ing)
    }
    setCreateOpen(false)
    setCreateSeedName('')
    setCreateTargetIndex(null)
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
            ingredients (structured)
          </span>
          <label
            className="flex items-center gap-2 text-xs text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            <span>default servings</span>
            <input
              type="number"
              min={1}
              value={attrs.defaultServings ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                const n = raw === '' ? null : Number.parseInt(raw, 10)
                updateAttributes({
                  defaultServings: Number.isFinite(n) && n !== null && n > 0 ? n : null,
                })
              }}
              className="w-16 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-center outline-none focus:border-[var(--color-sage)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            />
          </label>
        </div>

        <ul className="space-y-2">
          {items.map((item, i) => (
            <IngredientRow
              key={i}
              item={item}
              onPatch={(patch) => patchItem(i, patch)}
              onRemove={() => removeItem(i)}
              onPickIngredient={(ing) => setIngredientForRow(i, ing)}
              onRequestCreate={(seed) => openCreate(seed, i)}
            />
          ))}
        </ul>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          + add ingredient
        </button>
      </div>

      {createOpen && (
        <CreateIngredientModal
          seedName={createSeedName}
          onClose={() => {
            setCreateOpen(false)
            setCreateTargetIndex(null)
            setCreateSeedName('')
          }}
          onCreated={handleCreated}
        />
      )}
    </NodeViewWrapper>
  )
}

interface IngredientRowProps {
  item: IngredientsListItem
  onPatch: (patch: Partial<IngredientsListItem>) => void
  onRemove: () => void
  onPickIngredient: (ing: IngredientSearchResult) => void
  onRequestCreate: (seedName: string) => void
}

function IngredientRow({
  item,
  onPatch,
  onRemove,
  onPickIngredient,
  onRequestCreate,
}: IngredientRowProps) {
  const [query, setQuery] = useState(item.name)
  const [results, setResults] = useState<IngredientSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const rowId = useId()

  // Keep the search input in sync if the row's name changes externally.
  useEffect(() => {
    setQuery(item.name)
  }, [item.name])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    const handle = setTimeout(() => {
      void searchIngredients(query, 12)
        .then((rows) => {
          if (!cancelled) setResults(rows)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query, open])

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-start gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={item.amount === null ? '' : String(item.amount)}
          onChange={(e) => {
            const raw = e.target.value.trim()
            if (raw === '') {
              onPatch({ amount: null })
              return
            }
            const n = Number(raw)
            onPatch({ amount: Number.isFinite(n) ? n : null })
          }}
          placeholder="amt"
          className="w-20 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-sm text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        />
        <select
          value={item.unit ?? ''}
          onChange={(e) => onPatch({ unit: e.target.value || null })}
          className="w-20 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-sm text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          <option value="">unit</option>
          {INGREDIENT_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <div className="relative min-w-[14rem] flex-1">
          <input
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Delay so click handlers on options fire first.
              setTimeout(() => setOpen(false), 120)
            }}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              // If the user is editing the name, drop the master link until
              // they re-pick from the list.
              if (item.ingredientId) {
                onPatch({ ingredientId: '', ingredientSlug: '', name: e.target.value })
              } else {
                onPatch({ name: e.target.value })
              }
            }}
            placeholder="ingredient (start typing)"
            className="block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
            aria-controls={`${rowId}-list`}
            aria-expanded={open}
          />
          {item.ingredientId && (
            <span
              className="absolute right-1 top-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-sage)]"
              style={{ fontFamily: 'var(--font-lora)' }}
              aria-label="Linked to master ingredient"
            >
              ✓ linked
            </span>
          )}
          {open && (
            <ul
              id={`${rowId}-list`}
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] shadow-lg"
            >
              {loading && (
                <li
                  className="px-3 py-2 text-xs italic text-[var(--color-warm-taupe)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  searching…
                </li>
              )}
              {!loading && results.length === 0 && (
                <li
                  className="px-3 py-2 text-xs italic text-[var(--color-warm-taupe)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  no matches
                </li>
              )}
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPickIngredient(r)
                      setQuery(r.name)
                      setOpen(false)
                    }}
                    className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left hover:bg-[var(--color-soft-parchment)]"
                  >
                    <span
                      className="text-[var(--color-espresso)]"
                      style={{ fontFamily: 'var(--font-fraunces)' }}
                    >
                      {r.name}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-warm-taupe)]"
                      style={{ fontFamily: 'var(--font-lora)' }}
                    >
                      {r.category} · {r.defaultUnit}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false)
                    onRequestCreate(query)
                  }}
                  className="block w-full px-3 py-2 text-left text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:bg-[var(--color-soft-parchment)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  + create new ingredient
                </button>
              </li>
            </ul>
          )}
        </div>

        <input
          type="text"
          value={item.prepNote ?? ''}
          onChange={(e) => onPatch({ prepNote: e.target.value || null })}
          placeholder="prep note (optional)"
          className="w-48 border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-sm italic text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        />

        <label
          className="flex items-center gap-1 text-xs text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          <input
            type="checkbox"
            checked={item.isOptional}
            onChange={(e) => onPatch({ isOptional: e.target.checked })}
          />
          optional
        </label>

        <button
          type="button"
          onClick={onRemove}
          className="text-xs uppercase tracking-[0.2em] text-[var(--color-burnt-sienna)] opacity-60 hover:opacity-100"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          remove
        </button>
      </div>

      <input
        type="text"
        value={item.groupLabel ?? ''}
        onChange={(e) => onPatch({ groupLabel: e.target.value || null })}
        placeholder="group label (e.g. for the dough — optional)"
        className="ml-22 w-72 border-b border-dashed border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-xs italic text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
        style={{ fontFamily: 'var(--font-lora)', marginLeft: '88px' }}
      />
    </li>
  )
}

interface CreateIngredientModalProps {
  seedName: string
  onClose: () => void
  onCreated: (ing: IngredientSearchResult) => void
}

function CreateIngredientModal({
  seedName,
  onClose,
  onCreated,
}: CreateIngredientModalProps) {
  const [name, setName] = useState(seedName)
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('other')
  const [defaultUnit, setDefaultUnit] = useState('g')
  const [dietary, setDietary] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  function toggleFlag(flag: string): void {
    setDietary((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    )
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const created = await createIngredientFromEditor({
        name,
        slug: slug || null,
        category,
        defaultUnit,
        dietaryFlags: dietary,
      })
      onCreated(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create ingredient.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-24"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] p-5 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-lg text-[var(--color-espresso)]"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            New ingredient
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            close
          </button>
        </div>
        <label className="block text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)]" style={{ fontFamily: 'var(--font-lora)' }}>
          name
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 normal-case tracking-normal text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)]" style={{ fontFamily: 'var(--font-lora)' }}>
          slug (optional — auto-generated from name)
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. plain-flour"
            className="mt-1 block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 normal-case tracking-normal text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)]" style={{ fontFamily: 'var(--font-lora)' }}>
            category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 normal-case tracking-normal text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              {INGREDIENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)]" style={{ fontFamily: 'var(--font-lora)' }}>
            default unit
            <select
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value)}
              className="mt-1 block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 normal-case tracking-normal text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              {INGREDIENT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="space-y-1 text-xs text-[var(--color-warm-taupe)]" style={{ fontFamily: 'var(--font-lora)' }}>
          <legend className="text-xs uppercase tracking-[0.25em]">dietary flags</legend>
          <div className="flex flex-wrap gap-2">
            {DIETARY_FLAGS.map((flag) => (
              <label key={flag} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={dietary.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                />
                {flag}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p
            className="text-sm text-[var(--color-burnt-sienna)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="bg-[var(--color-sage)] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)] disabled:opacity-50"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            {submitting ? 'creating…' : 'create'}
          </button>
        </div>
      </form>
    </div>
  )
}
