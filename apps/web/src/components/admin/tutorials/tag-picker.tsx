'use client'

import { useState } from 'react'

export interface TagOption {
  id: string
  name: string
  slug: string
}

interface TagPickerProps {
  tags: TagOption[]
  defaultSelected: string[]
}

export function TagPicker({ tags, defaultSelected }: TagPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelected),
  )

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (tags.length === 0) {
    return (
      <p
        className="text-xs italic text-[var(--color-warm-taupe)] opacity-60"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        No tags yet. Add some at /admin/tags.
      </p>
    )
  }

  return (
    <div>
      {/* Hidden inputs keep server-action FormData semantics with getAll('tagIds') */}
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="tagIds" value={id} />
      ))}
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => {
          const isOn = selected.has(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] transition ${
                isOn
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)] text-[var(--color-linen-cream)]'
                  : 'border-[var(--color-linen-grey)] text-[var(--color-warm-taupe)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage)]'
              }`}
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              {t.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
