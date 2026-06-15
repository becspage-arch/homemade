'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  searchIngredientsForCreator,
  createIngredientForCreator,
} from '@/lib/recipes/user-recipe-actions'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  type IngredientSearchResult,
} from '@/app/admin/tutorials/ingredient-constants'

export interface RecipeIngredientRow {
  key: string
  ingredientId: string
  ingredientSlug: string
  name: string
  quantity: number | null
  unit: string | null
  notes: string | null
  isOptional: boolean
}

export function emptyIngredientRow(key: string): RecipeIngredientRow {
  return {
    key,
    ingredientId: '',
    ingredientSlug: '',
    name: '',
    quantity: null,
    unit: null,
    notes: null,
    isOptional: false,
  }
}

interface PickerProps {
  rows: RecipeIngredientRow[]
  onChange: (rows: RecipeIngredientRow[]) => void
}

export function RecipeIngredientPicker({ rows, onChange }: PickerProps) {
  const [createSeed, setCreateSeed] = useState<{ index: number; name: string } | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const keyCounter = useRef(0)

  function patch(i: number, patch: Partial<RecipeIngredientRow>): void {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function remove(i: number): void {
    onChange(rows.filter((_, idx) => idx !== i))
  }
  function add(): void {
    keyCounter.current += 1
    onChange([...rows, emptyIngredientRow(`new-${keyCounter.current}`)])
  }
  function move(from: number, to: number): void {
    if (to < 0 || to >= rows.length || from === to) return
    const next = [...rows]
    const [item] = next.splice(from, 1)
    if (!item) return
    next.splice(to, 0, item)
    onChange(next)
  }
  function pick(i: number, ing: IngredientSearchResult): void {
    const current = rows[i]
    patch(i, {
      ingredientId: ing.id,
      ingredientSlug: ing.slug,
      name: ing.name,
      unit: current?.unit && current.unit.length > 0 ? current.unit : ing.defaultUnit,
    })
  }

  return (
    <div className="recipe-ing">
      <ol className="recipe-ing-list">
        {rows.map((row, i) => (
          <li
            key={row.key}
            className={`recipe-ing-row${dragIndex === i ? ' is-dragging' : ''}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragIndex !== null) move(dragIndex, i)
              setDragIndex(null)
            }}
          >
            <span className="recipe-ing-handle" aria-hidden="true" title="Drag to reorder">
              ⠿
            </span>

            <input
              className="recipe-ing-qty"
              type="text"
              inputMode="decimal"
              value={row.quantity === null ? '' : String(row.quantity)}
              placeholder="amt"
              aria-label="Amount"
              onChange={(e) => {
                const raw = e.target.value.trim()
                if (raw === '') return patch(i, { quantity: null })
                const n = Number(raw)
                patch(i, { quantity: Number.isFinite(n) ? n : null })
              }}
            />

            <select
              className="recipe-ing-unit"
              value={row.unit ?? ''}
              aria-label="Unit"
              onChange={(e) => patch(i, { unit: e.target.value || null })}
            >
              <option value="">unit</option>
              {INGREDIENT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <IngredientSearchField
              value={row.name}
              linked={Boolean(row.ingredientId)}
              onText={(text) => {
                if (row.ingredientId) {
                  patch(i, { ingredientId: '', ingredientSlug: '', name: text })
                } else {
                  patch(i, { name: text })
                }
              }}
              onPick={(ing) => pick(i, ing)}
              onCreate={(seed) => setCreateSeed({ index: i, name: seed })}
            />

            <input
              className="recipe-ing-notes"
              type="text"
              value={row.notes ?? ''}
              placeholder="note (optional)"
              aria-label="Note"
              onChange={(e) => patch(i, { notes: e.target.value || null })}
            />

            <label className="recipe-ing-optional">
              <input
                type="checkbox"
                checked={row.isOptional}
                onChange={(e) => patch(i, { isOptional: e.target.checked })}
              />
              optional
            </label>

            <span className="recipe-ing-move">
              <button type="button" aria-label="Move up" onClick={() => move(i, i - 1)} disabled={i === 0}>
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                onClick={() => move(i, i + 1)}
                disabled={i === rows.length - 1}
              >
                ↓
              </button>
            </span>

            <button type="button" className="recipe-ing-remove" onClick={() => remove(i)}>
              remove
            </button>
          </li>
        ))}
      </ol>

      <button type="button" className="recipe-ing-add" onClick={add}>
        + add ingredient
      </button>

      {createSeed && (
        <CreateIngredientModal
          seedName={createSeed.name}
          onClose={() => setCreateSeed(null)}
          onCreated={(ing) => {
            pick(createSeed.index, ing)
            setCreateSeed(null)
          }}
        />
      )}
    </div>
  )
}

function IngredientSearchField({
  value,
  linked,
  onText,
  onPick,
  onCreate,
}: {
  value: string
  linked: boolean
  onText: (text: string) => void
  onPick: (ing: IngredientSearchResult) => void
  onCreate: (seed: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [results, setResults] = useState<IngredientSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const listId = useId()

  if (value !== prevValue) {
    setPrevValue(value)
    setQuery(value)
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const handle = setTimeout(() => {
      void searchIngredientsForCreator(query, 12)
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
    <div className="recipe-ing-search">
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        value={query}
        placeholder="ingredient (start typing)"
        aria-label="Ingredient"
        aria-expanded={open}
        aria-controls={listId}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          onText(e.target.value)
        }}
      />
      {linked && (
        <span className="recipe-ing-linked" aria-label="Matched to the ingredient list">
          ✓
        </span>
      )}
      {open && (
        <ul id={listId} className="recipe-ing-results">
          {loading && <li className="recipe-ing-result-note">searching…</li>}
          {!loading && results.length === 0 && (
            <li className="recipe-ing-result-note">no matches yet</li>
          )}
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(r)
                  setQuery(r.name)
                  setOpen(false)
                }}
              >
                <span>{r.name}</span>
                <span className="recipe-ing-result-meta">
                  {r.category} · {r.defaultUnit}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="recipe-ing-create"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false)
                onCreate(query)
              }}
            >
              + add &ldquo;{query.trim() || 'new'}&rdquo; as a new ingredient
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

function CreateIngredientModal({
  seedName,
  onClose,
  onCreated,
}: {
  seedName: string
  onClose: () => void
  onCreated: (ing: IngredientSearchResult) => void
}) {
  const [name, setName] = useState(seedName)
  const [category, setCategory] = useState('other')
  const [defaultUnit, setDefaultUnit] = useState('g')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const created = await createIngredientForCreator({ name, category, defaultUnit })
      onCreated(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that ingredient.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="recipe-modal-backdrop" onClick={onClose}>
      <form className="recipe-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h3 className="recipe-modal-title">New ingredient</h3>
        <p className="recipe-modal-hint">
          This adds it to the shared ingredient list so the shopping list and meal planner can use it.
        </p>
        <label className="me-field">
          <span>Name</span>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="recipe-modal-grid">
          <label className="me-field">
            <span>Type</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {INGREDIENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="me-field">
            <span>Usual unit</span>
            <select value={defaultUnit} onChange={(e) => setDefaultUnit(e.target.value)}>
              {INGREDIENT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="me-feedback error">{error}</p>}
        <div className="recipe-modal-actions">
          <button type="button" className="me-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="me-button" disabled={submitting || !name.trim()}>
            {submitting ? 'Adding…' : 'Add ingredient'}
          </button>
        </div>
      </form>
    </div>
  )
}
