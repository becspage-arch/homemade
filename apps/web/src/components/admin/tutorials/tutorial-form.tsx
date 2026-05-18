'use client'

import { useEffect, useMemo, useState } from 'react'
import type { JSONContent } from '@tiptap/core'

import './tutorial-form.css'

import { captureClientEvent } from '@/lib/client-analytics'
import { TiptapEditor } from '@/components/admin/editor/tiptap-editor'
import type {
  GlossaryRef,
  TechniqueRef,
  TutorialRef,
} from '@/components/admin/editor/types'
import { CategorySubCategoryFields, type CategoryOption, type SubCategoryOption } from './category-sub-category-fields'
import { SlugField } from './slug-field'
import { TagPicker, type TagOption } from './tag-picker'
import { HeroMediaPicker, type MediaOption } from './hero-media-picker'
import { PreviewPane } from './preview-pane'
import {
  CUISINES,
  CUISINE_LABEL,
  DIETARY_FLAGS,
  DIETARY_LABEL,
  MEAL_TYPES,
  MEAL_TYPE_LABEL,
  MOOD_FLAGS,
  MOOD_LABEL,
} from '@/app/admin/tutorials/ingredient-constants'

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

  // Phase 8 Step 2 — recipe metadata. The Mindset migration (Phase 8 Step
  // 13) widens this to include PRACTICE and READING; the admin form still
  // only renders the RECIPE / TECHNIQUE toggle, but typed-through values
  // for the other variants are tolerated so existing rows round-trip.
  type: 'RECIPE' | 'TECHNIQUE' | 'PRACTICE' | 'READING' | 'GROWING_GUIDE' | 'REMEDY' | 'HERB_PROFILE' | 'STITCH' | 'PATTERN'
  servings: string
  yieldDescription: string
  prepMinutes: string
  cookMinutes: string
  restingMinutes: string
  chillingMinutes: string
  scalable: boolean
  freezable: boolean
  freezeNotes: string
  batchable: boolean
  batchNotes: string
  makeAheadNotes: string
  dietaryFlags: string[]
  cuisine: string
  mealType: string
  mood: string[]
  temperatureCelsius: string
  temperatureNote: string
  foundational: boolean
  leftoverTutorialId: string | null
  /**
   * Comma-separated alias phrases for the reverse-sweep
   * (phase_technique_linking_002). Only meaningful on TECHNIQUE rows;
   * the form submits the raw string and the server-side parser splits +
   * trims into a String[]. Empty / "" round-trips as no aliases.
   */
  aliases: string
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
  techniques: TechniqueRef[]
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
const TUTORIAL_TYPES = [
  { value: 'RECIPE', label: 'recipe' },
  { value: 'TECHNIQUE', label: 'technique' },
]

const MEAL_TYPE_OPTIONS = [
  { value: '', label: '— none —' },
  ...MEAL_TYPES.map((m) => ({ value: m, label: MEAL_TYPE_LABEL[m].toLowerCase() })),
]

const CUISINE_OPTIONS = [
  { value: '', label: '— none —' },
  ...CUISINES.map((c) => ({ value: c, label: CUISINE_LABEL[c] })),
]

const DIETARY_OPTIONS = DIETARY_FLAGS
const MOOD_OPTIONS = MOOD_FLAGS

export function TutorialForm({
  action,
  submitLabel,
  defaults,
  categories,
  subCategories,
  tags,
  glossary,
  tutorials,
  techniques,
  media,
  cloudflareDeliveryHash,
}: TutorialFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [previewBody, setPreviewBody] = useState<JSONContent>(defaults.body)
  const [showPreview, setShowPreview] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)

  useEffect(() => {
    if (!showFullPreview) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowFullPreview(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showFullPreview])

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

  // Phase 8 Step 2 — recipe metadata state
  const [type, setType] = useState<'RECIPE' | 'TECHNIQUE' | 'PRACTICE' | 'READING' | 'GROWING_GUIDE' | 'REMEDY' | 'HERB_PROFILE' | 'STITCH' | 'PATTERN'>(defaults.type)
  const [servings, setServings] = useState(defaults.servings)
  const [yieldDescription, setYieldDescription] = useState(defaults.yieldDescription)
  const [prepMinutes, setPrepMinutes] = useState(defaults.prepMinutes)
  const [cookMinutes, setCookMinutes] = useState(defaults.cookMinutes)
  const [restingMinutes, setRestingMinutes] = useState(defaults.restingMinutes)
  const [chillingMinutes, setChillingMinutes] = useState(defaults.chillingMinutes)
  const [scalable, setScalable] = useState(defaults.scalable)
  const [freezable, setFreezable] = useState(defaults.freezable)
  const [freezeNotes, setFreezeNotes] = useState(defaults.freezeNotes)
  const [batchable, setBatchable] = useState(defaults.batchable)
  const [batchNotes, setBatchNotes] = useState(defaults.batchNotes)
  const [makeAheadNotes, setMakeAheadNotes] = useState(defaults.makeAheadNotes)
  const [dietaryFlags, setDietaryFlags] = useState<string[]>(defaults.dietaryFlags)
  const [cuisine, setCuisine] = useState(defaults.cuisine)
  const [mealType, setMealType] = useState(defaults.mealType)
  const [mood, setMood] = useState<string[]>(defaults.mood)
  const [temperatureCelsius, setTemperatureCelsius] = useState(
    defaults.temperatureCelsius,
  )
  const [temperatureNote, setTemperatureNote] = useState(defaults.temperatureNote)
  const [foundational, setFoundational] = useState(defaults.foundational)
  const [leftoverTutorialId, setLeftoverTutorialId] = useState<string>(
    defaults.leftoverTutorialId ?? '',
  )
  const [aliases, setAliases] = useState(defaults.aliases)

  function toggleFlag(value: string, list: string[], set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const isRecipe = type === 'RECIPE'
  const isTechnique = type === 'TECHNIQUE'

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

  const previewProps = {
    body: previewBody,
    glossary,
    tutorials,
    techniques,
    title,
    subtitle,
    excerpt,
    category: selectedCategory
      ? { slug: '#preview', name: selectedCategory.name }
      : null,
    subCategoryName: selectedSubCategory?.name ?? null,
    difficulty,
    timeMinutes: parseTime(timeMinutes),
    season: season || null,
    heroMedia,
    sourceType,
    sourceNotes,
    cloudflareDeliveryHash,
    type,
    recipeMeta: {
      servings: parseTime(servings),
      yieldDescription: yieldDescription || null,
      prepMinutes: parseTime(prepMinutes),
      cookMinutes: parseTime(cookMinutes),
      totalMinutes: sumOrNull([
        parseTime(prepMinutes),
        parseTime(cookMinutes),
        parseTime(restingMinutes),
        parseTime(chillingMinutes),
      ]),
      scalable,
      freezable,
      batchable,
      makeAheadSummary: makeAheadNotes || null,
      cuisine: cuisine || null,
      mealType: mealType || null,
      dietaryFlags,
      foundational,
    },
  }

  return (
    <form
      action={handleSubmit}
      className={`space-y-10 tutorial-form${showPreview ? ' tutorial-form-preview-open' : ''}`}
    >
      <div className="tutorial-form-top-bar">
        <button
          type="button"
          className="tutorial-form-fullpreview-btn"
          onClick={() => setShowFullPreview(true)}
        >
          Full preview
        </button>
        <button
          type="button"
          className="tutorial-form-preview-toggle"
          onClick={() => {
            setShowPreview((v) => {
              const next = !v
              if (next) {
                captureClientEvent('admin_preview_drawer_opened', {
                  tutorialSlug: defaults.slug,
                })
              }
              return next
            })
          }}
          aria-pressed={showPreview}
        >
          {showPreview ? 'Close preview' : 'Open preview'}
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <Label>Type</Label>
          <Select
            name="type"
            value={type}
            onChange={(v) => setType(v as 'RECIPE' | 'TECHNIQUE' | 'PRACTICE' | 'READING' | 'GROWING_GUIDE' | 'REMEDY' | 'HERB_PROFILE' | 'STITCH' | 'PATTERN')}
            options={TUTORIAL_TYPES}
          />
        </label>
        <p
          className="self-end text-xs italic text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {isRecipe
            ? 'Recipe — surfaces servings, times, dietary tags, cuisine, mood. Editor offers the structured ingredients block.'
            : 'Technique — reference content. Foundational flag surfaces a badge on the page.'}
        </p>
      </div>

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

      {isRecipe && (
        <fieldset className="space-y-6 border-t border-[var(--color-linen-grey)] pt-6">
          <legend
            className="text-xs uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            Recipe metadata
          </legend>

          <div className="grid gap-6 sm:grid-cols-4">
            <label className="block">
              <Label>Servings</Label>
              <input
                type="number"
                name="servings"
                min="0"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </label>
            <label className="block sm:col-span-3">
              <Label>Yield description</Label>
              <input
                type="text"
                name="yieldDescription"
                placeholder="e.g. 1 loaf · 12 muffins"
                value={yieldDescription}
                onChange={(e) => setYieldDescription(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-4">
            {(
              [
                ['Prep (min)', prepMinutes, setPrepMinutes, 'prepMinutes'],
                ['Cook (min)', cookMinutes, setCookMinutes, 'cookMinutes'],
                ['Resting (min)', restingMinutes, setRestingMinutes, 'restingMinutes'],
                ['Chilling (min)', chillingMinutes, setChillingMinutes, 'chillingMinutes'],
              ] as const
            ).map(([label, value, setter, name]) => (
              <label key={name} className="block">
                <Label>{label}</Label>
                <input
                  type="number"
                  name={name}
                  min="0"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Toggle
              label="Scalable"
              name="scalable"
              checked={scalable}
              onChange={setScalable}
              hint="Off for bakery / sourdough recipes that rely on fixed ratios."
            />
            <Toggle
              label="Freezable"
              name="freezable"
              checked={freezable}
              onChange={setFreezable}
            />
            <Toggle
              label="Batchable"
              name="batchable"
              checked={batchable}
              onChange={setBatchable}
            />
          </div>

          <Field
            label="Freezer notes"
            name="freezeNotes"
            value={freezeNotes}
            onChange={setFreezeNotes}
            multiline
            hint="Shown on the page in a 'From the freezer' aside when freezable is on."
          />
          <Field
            label="Batch notes"
            name="batchNotes"
            value={batchNotes}
            onChange={setBatchNotes}
            multiline
            hint="Shown in a 'Cooking for the week' aside when batchable is on."
          />
          <Field
            label="Make-ahead notes"
            name="makeAheadNotes"
            value={makeAheadNotes}
            onChange={setMakeAheadNotes}
            multiline
          />

          <div>
            <Label>Dietary flags</Label>
            <FlagGrid
              options={DIETARY_OPTIONS as readonly string[]}
              value={dietaryFlags}
              name="dietaryFlags"
              onToggle={(v) => toggleFlag(v, dietaryFlags, setDietaryFlags)}
              labels={DIETARY_LABEL as Record<string, string>}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <Label>Cuisine</Label>
              <Select
                name="cuisine"
                value={cuisine}
                onChange={setCuisine}
                options={CUISINE_OPTIONS}
              />
            </label>
            <label className="block">
              <Label>Meal type</Label>
              <Select
                name="mealType"
                value={mealType}
                onChange={setMealType}
                options={MEAL_TYPE_OPTIONS}
              />
            </label>
          </div>

          <div>
            <Label>Mood</Label>
            <FlagGrid
              options={MOOD_OPTIONS as readonly string[]}
              value={mood}
              name="mood"
              onToggle={(v) => toggleFlag(v, mood, setMood)}
              labels={MOOD_LABEL as Record<string, string>}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <Label>Temperature (°C)</Label>
              <input
                type="number"
                name="temperatureCelsius"
                min="0"
                value={temperatureCelsius}
                onChange={(e) => setTemperatureCelsius(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </label>
            <label className="block">
              <Label>Temperature note</Label>
              <input
                type="text"
                name="temperatureNote"
                placeholder='e.g. "fan oven", "low and slow"'
                value={temperatureNote}
                onChange={(e) => setTemperatureNote(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </label>
          </div>

          <label className="block">
            <Label>Leftover tutorial</Label>
            <select
              name="leftoverTutorialId"
              value={leftoverTutorialId}
              onChange={(e) => setLeftoverTutorialId(e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">— no leftover bridge —</option>
              {tutorials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      )}

      {isTechnique && (
        <fieldset className="space-y-4 border-t border-[var(--color-linen-grey)] pt-6">
          <legend
            className="text-xs uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            Technique metadata
          </legend>
          <Toggle
            label="Foundational"
            name="foundational"
            checked={foundational}
            onChange={setFoundational}
            hint="Surfaces a 'Foundational technique' badge on the page. For the ~500–700 core entries."
          />
          <Field
            label="Aliases"
            hint="Comma-separated phrases the reverse-sweep should match alongside the title (e.g. 'blind baking, pre-bake the pastry'). Leave empty if the title alone covers how authors write it."
            name="aliases"
            value={aliases}
            onChange={setAliases}
            multiline
          />
        </fieldset>
      )}

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
        </div>
        <p
          className="mb-3 text-xs italic text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Insert custom blocks from the toolbar. Hit save when you&apos;re done — there&apos;s no autosave.
        </p>
        <div>
          <TiptapEditor
            initialContent={defaults.body}
            glossary={glossary}
            tutorials={tutorials}
            techniques={techniques}
            hiddenInputName="body"
            onChange={setPreviewBody}
            defaultServings={parseTime(servings)}
          />
        </div>
        {showPreview && (
          <aside className="tutorial-preview-drawer" aria-label="Live preview">
            <header className="tutorial-preview-drawer-header">
              <span>Live preview</span>
              <button
                type="button"
                className="tutorial-preview-drawer-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview drawer"
              >
                ×
              </button>
            </header>
            <div className="tutorial-preview-drawer-body">
              <PreviewPane {...previewProps} />
            </div>
          </aside>
        )}
        {showFullPreview && (
          <div
            className="tutorial-full-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Full preview"
          >
            <header className="tutorial-full-preview-modal-header">
              <button
                type="button"
                className="tutorial-full-preview-modal-close"
                onClick={() => setShowFullPreview(false)}
              >
                × Back to edit
              </button>
            </header>
            <div className="tutorial-full-preview-modal-body">
              <PreviewPane {...previewProps} />
            </div>
          </div>
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

function sumOrNull(values: (number | null)[]): number | null {
  const filtered = values.filter((v): v is number => v !== null)
  if (filtered.length === 0) return null
  return filtered.reduce((sum, n) => sum + n, 0)
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

function Toggle({
  label,
  name,
  checked,
  onChange,
  hint,
}: {
  label: string
  name: string
  checked: boolean
  onChange: (next: boolean) => void
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <span>
        <span
          className="block text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
        >
          {label}
        </span>
        {hint && (
          <span
            className="block text-xs italic text-[var(--color-warm-taupe)] opacity-70"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            {hint}
          </span>
        )}
      </span>
    </label>
  )
}

function FlagGrid({
  name,
  options,
  value,
  onToggle,
  labels,
}: {
  name: string
  options: readonly string[]
  value: string[]
  onToggle: (v: string) => void
  /** Optional slug → display-label map. Falls back to the slug. */
  labels?: Record<string, string>
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((flag) => {
        const checked = value.includes(flag)
        return (
          <label
            key={flag}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
              checked
                ? 'border-[var(--color-sage)] bg-[var(--color-sage)] text-[var(--color-linen-cream)]'
                : 'border-[var(--color-linen-grey)] text-[var(--color-warm-taupe)]'
            }`}
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            <input
              type="checkbox"
              name={name}
              value={flag}
              checked={checked}
              onChange={() => onToggle(flag)}
              className="sr-only"
            />
            {labels?.[flag] ?? flag}
          </label>
        )
      })}
    </div>
  )
}
