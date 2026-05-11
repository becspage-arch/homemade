'use client'

import { useMemo, useState } from 'react'
import type { JSONContent } from '@tiptap/core'

import { TiptapEditor } from '@/components/admin/editor/tiptap-editor'
import type { GlossaryRef, TutorialRef } from '@/components/admin/editor/types'
import { CategorySubCategoryFields, type CategoryOption, type SubCategoryOption } from './category-sub-category-fields'
import { SlugField } from './slug-field'
import { TagPicker, type TagOption } from './tag-picker'
import { HeroMediaPicker, type MediaOption } from './hero-media-picker'
import { PreviewPane } from './preview-pane'

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
  cloudflareDeliveryHash: string | null
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
  cloudflareDeliveryHash,
}: TutorialFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [previewBody, setPreviewBody] = useState<JSONContent>(defaults.body)
  const [showPreview, setShowPreview] = useState(false)

  // Live state for everything the preview reflects. The form's controlled
  // inputs still drive submission so the server sees current values without
  // us re-wiring server actions.
  const [title, setTitle] = useState(defaults.title)
  const [subtitle, setSubtitle] = useState(defaults.subtitle)
  const [excerpt, setExcerpt] = useState(defaults.excerpt)
  const [categoryId, setCategoryId] = useState(defaults.categoryId)
  const [subCategoryId, setSubCategoryId] = useState(defaults.subCategoryId ?? '')
  const [difficulty, setDifficulty] = useState(defaults.difficulty)
  const [season, setSeason] = useState(defaults.season)
  const [sourceType, setSourceType] = useState(defaults.sourceType)
  const [sourceNotes, setSourceNotes] = useState(defaults.sourceNotes)
  const [timeMinutes, setTimeMinutes] = useState(defaults.timeMinutes)
  const [heroMedia, setHeroMedia] = useState<MediaOption | null>(
    media.find((m) => m.id === defaults.heroMediaId) ?? null,
  )

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  )
  const selectedSubCategory = useMemo(
    () => subCategories.find((s) => s.id === subCategoryId) ?? null,
    [subCategories, subCategoryId],
  )

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
      <SlugField
        defaultTitle={defaults.title}
        defaultSlug={defaults.slug}
        onTitleChange={setTitle}
      />

      <Field
        label="Subtitle"
        hint="Optional. A short line under the title."
        name="subtitle"
        value={subtitle}
        onChange={setSubtitle}
      />

      <Field
        label="Excerpt"
        hint="Short summary for cards, meta description, search snippets."
        name="excerpt"
        value={excerpt}
        onChange={setExcerpt}
        multiline
      />

      <CategorySubCategoryFields
        categories={categories}
        subCategories={subCategories}
        defaultCategoryId={defaults.categoryId}
        defaultSubCategoryId={defaults.subCategoryId}
        onChange={(next) => {
          setCategoryId(next.categoryId)
          setSubCategoryId(next.subCategoryId)
        }}
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
            value={difficulty}
            onChange={setDifficulty}
            options={DIFFICULTIES}
          />
        </label>
        <label className="block">
          <Label>Season</Label>
          <Select
            name="season"
            value={season}
            onChange={setSeason}
            options={SEASONS}
          />
        </label>
        <label className="block">
          <Label>Time (minutes)</Label>
          <input
            type="number"
            name="timeMinutes"
            min="0"
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(e.target.value)}
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
            value={sourceType}
            onChange={setSourceType}
            options={SOURCE_TYPES}
          />
        </label>
        <Field
          label="Source notes"
          hint="Reference list, attribution, links."
          name="sourceNotes"
          value={sourceNotes}
          onChange={setSourceNotes}
          multiline
        />
      </div>

      <div>
        <Label>Hero media</Label>
        <HeroMediaPicker
          options={media}
          defaultSelectedId={defaults.heroMediaId}
          name="heroMediaId"
          onChange={setHeroMedia}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>Body</Label>
          <div
            className="inline-flex overflow-hidden rounded-full border border-[var(--color-linen-grey)] text-[10px] uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-lora)' }}
            role="tablist"
            aria-label="Editor view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!showPreview}
              onClick={() => setShowPreview(false)}
              className={`px-4 py-1.5 transition ${
                !showPreview
                  ? 'bg-[var(--color-sage)] text-[var(--color-linen-cream)]'
                  : 'text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]'
              }`}
            >
              edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showPreview}
              onClick={() => setShowPreview(true)}
              className={`px-4 py-1.5 transition ${
                showPreview
                  ? 'bg-[var(--color-sage)] text-[var(--color-linen-cream)]'
                  : 'text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]'
              }`}
            >
              preview
            </button>
          </div>
        </div>
        <p
          className="mb-3 text-xs italic text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Insert custom blocks from the toolbar. Hit save when you're done — there's no autosave.
        </p>
        <div style={{ display: showPreview ? 'none' : 'block' }}>
          <TiptapEditor
            initialContent={defaults.body}
            glossary={glossary}
            tutorials={tutorials}
            hiddenInputName="body"
            onChange={setPreviewBody}
          />
        </div>
        {showPreview && (
          <PreviewPane
            body={previewBody}
            glossary={glossary}
            tutorials={tutorials}
            title={title}
            subtitle={subtitle}
            excerpt={excerpt}
            category={
              selectedCategory
                ? { slug: '#preview', name: selectedCategory.name }
                : null
            }
            subCategoryName={selectedSubCategory?.name ?? null}
            difficulty={difficulty}
            timeMinutes={parseTime(timeMinutes)}
            season={season || null}
            heroMedia={heroMedia}
            sourceType={sourceType}
            sourceNotes={sourceNotes}
            cloudflareDeliveryHash={cloudflareDeliveryHash}
          />
        )}
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

function parseTime(raw: string): number | null {
  if (!raw) return null
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 0) return null
  return n
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
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}

function Field({ label, hint, name, value, onChange, multiline }: FieldProps) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </label>
  )
}

function Select({
  name,
  value,
  onChange,
  options,
}: {
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
