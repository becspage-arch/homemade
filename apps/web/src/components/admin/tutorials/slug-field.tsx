'use client'

import { useState } from 'react'
import { slugify } from '@/lib/slug'

interface SlugFieldProps {
  defaultTitle?: string
  defaultSlug?: string
}

export function SlugField({ defaultTitle, defaultSlug }: SlugFieldProps) {
  const [title, setTitle] = useState(defaultTitle ?? '')
  const [slug, setSlug] = useState(defaultSlug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultSlug))

  function handleTitle(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[3fr_2fr]">
      <label className="block">
        <Label required>Title</Label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
          required
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: '1.5rem',
            fontWeight: 400,
          }}
        />
      </label>

      <label className="block">
        <Label required>Slug</Label>
        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugTouched(true)
          }}
          required
          pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 font-mono text-sm text-[var(--color-warm-taupe)] outline-none focus:border-[var(--color-sage)]"
        />
        <p
          className="mt-1 text-xs italic text-[var(--color-warm-taupe)] opacity-60"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Auto-fills from title. Once edited, it stops auto-updating.
        </p>
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
