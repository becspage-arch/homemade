'use client'

import { useMemo, useState } from 'react'

export interface CategoryOption {
  id: string
  name: string
}

export interface SubCategoryOption {
  id: string
  name: string
  categoryId: string
}

interface Props {
  categories: CategoryOption[]
  subCategories: SubCategoryOption[]
  defaultCategoryId?: string
  defaultSubCategoryId?: string | null
}

export function CategorySubCategoryFields({
  categories,
  subCategories,
  defaultCategoryId,
  defaultSubCategoryId,
}: Props) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? '')
  const [subCategoryId, setSubCategoryId] = useState(
    defaultSubCategoryId ?? '',
  )

  const filteredSubs = useMemo(
    () => subCategories.filter((s) => s.categoryId === categoryId),
    [subCategories, categoryId],
  )

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <label className="block">
        <Label required>Category</Label>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setSubCategoryId('')
          }}
          required
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem' }}
        >
          <option value="" disabled>
            — choose —
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <Label>Sub-category</Label>
        <select
          name="subCategoryId"
          value={subCategoryId}
          onChange={(e) => setSubCategoryId(e.target.value)}
          disabled={!categoryId || filteredSubs.length === 0}
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem' }}
        >
          <option value="">
            {categoryId
              ? filteredSubs.length === 0
                ? '— none in this category —'
                : '— optional —'
              : '— choose a category first —'}
          </option>
          {filteredSubs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <span
      className="mb-2 block text-xs uppercase text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
    >
      {children}
      {required && <span className="ml-2 text-[var(--color-burnt-sienna)]">*</span>}
    </span>
  )
}
