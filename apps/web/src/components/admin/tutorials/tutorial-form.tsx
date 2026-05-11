'use client'

import { useState } from 'react'
import type { JSONContent } from '@tiptap/core'

import { TiptapEditor } from '@/components/admin/editor/tiptap-editor'
import type { GlossaryRef, TutorialRef } from '@/components/admin/editor/types'
import { CategorySubCategoryFields, type CategoryOption, type SubCategoryOption } from './category-sub-category-fields'
import { SlugField } from './slug-field'
import { TagPicker, type TagOption } from './tag-picker'
import { HeroMediaPicker, type MediaOption } from './hero-media-picker'

export interface TutorialFormDefaults {
  title: string
  slug: string
  subtitle: string
  excerpt: string
  categoryId: string
  subCategoryId: string | null
  tagIds: string[]
  difficulty: string
  season: string
  sourceType: string
  sourceNotes: string
  timeMinutes: string
  heroMediaId: string | null
  body: JSONContent
}

interface TutorialFormProps {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  defaults: TutorialFormDefaults
  categories: CategoryOption[]
  subCategories: SubCategoryOption[]
  tags: TagOption[]
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
  media: MediaOption[]
}

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'beginner' },
  { value: 'INTERMEDIATE', label: 'intermediate' },
  { value: 'ADVANCED', label: 'advanced' },
]
const SEASONS = [
  { value: '', label: '— any —' },
  { value: 'SPRING', label: 'spring' },
  { value: 'SUMMER', label: 'summer' },
  { value: 'AUTUMN', label: 'autumn' },
  { value: 'WINTER', label: 'winter' },
  { value: 'YEAR_ROUND', label: 'year-round' },
]
const SOURCE_TYPES = [
  { value: 'TESTED', label: 'tested in homemade' },
  { value: 'CLASSIC', label: 'classic precedent' },
  { value: 'SYNTHESISED', label: 'synthesised' },
  { value: 'PUBLIC_DOMAIN', label: 'public domain' },
  { value: 'CREATOR', label: 'external creator' },
]

export function TutorialForm({
  action,
  submitLabel,
  defaults,
  categories,
  subCategories,
  tags,
  glossary,
  tutorials,
  media,
}: TutorialFormProps) {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      await action(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-10">
      <SlugField defaultTitle={defaults.title} defaultSlug={defaults.slug} />

      <Field
        label="Subtitle"
        hint="Optional. A short line under the title."
        name="subtitle"
        defaultValue={defaults.subtitle}
      />

      <Field
        label="Excerpt"
        hint="Short summary for cards, meta description, search snippets."
        name="excerpt"
        defaultValue={defaults.excerpt}
        multiline
      />

      <CategorySubCategoryFields
        categories={categories}
        subCategories={subCategories}
        defaultCategoryId={defaults.categoryId}
        defaultSubCategoryId={defaults.subCategoryId}
      />

      <div>
        <Label>Tags</Label>
        <TagPicker tags={tags} defaultSelected={defaults.tagIds} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <label className="block">
          <Label>Difficulty</Label>
          <Select
            name="difficulty"
            defaultValue={defaults.difficulty}
            options={DIFFICULTIES}
          />
        </label>
        <label className="block">
          <Label>Season</Label>
          <Select name="season" defaultValue={defaults.season} options={SEASONS} />
        </label>
        <label className="block">
          <Label>Time (minutes)</Label>
          <input
            type="number"
            name="timeMinutes"
            min="0"
            defaultValue={defaults.timeMinutes}
            className={inputClass}
            style={inputStyle}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <Label>Source type</Label>
          <Select
            name="sourceType"
            defaultValue={defaults.sourceType}
            options={SOURCE_TYPES}
          />
        </label>
        <Field
          label="Source notes"
          hint="Reference list, attribution, links."
          name="sourceNotes"
          defaultValue={defaults.sourceNotes}
          multiline
        />
      </div>

      <div>
        <Label>Hero media</Label>
        <HeroMediaPicker
          options={media}
          defaultSelectedId={defaults.heroMediaId}
          name="heroMediaId"
        />
      </div>

      <div>
        <Label>Body</Label>
        <p
          className="mb-3 text-xs italic text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Insert custom blocks from the toolbar. Hit save when you're done — there's no autosave.
        </p>
        <TiptapEditor
          initialContent={defaults.body}
          glossary={glossary}
          tutorials={tutorials}
          hiddenInputName="body"
        />
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[var(--color-sage)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {submitting ? 'saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]'
const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora)',
  fontSize: '1rem',
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

interface FieldProps {
  label: string
  hint?: string
  name: string
  defaultValue?: string
  multiline?: boolean
}

function Field({ label, hint, name, defaultValue, multiline }: FieldProps) {
  return (
    <label className="block">
      <Label>{label}</Label>
      {hint && (
        <span
          className="mb-2 -mt-1 block text-xs italic text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {hint}
        </span>
      )}
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          className={inputClass}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </label>
  )
}

function Select({
  name,
  defaultValue,
  options,
}: {
  name: string
  defaultValue: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={inputClass}
      style={inputStyle}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
