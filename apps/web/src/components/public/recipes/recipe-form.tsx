'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/core'
import {
  saveUserRecipeDraft,
  submitUserRecipeForReview,
  type UserRecipeFormInput,
} from '@/lib/recipes/user-recipe-actions'
import {
  CUISINE_TAGS,
  cuisineLabel,
  DIETARY_FLAGS,
  DIETARY_LABEL,
  MEAL_TYPES,
  ORIGINALITY_TYPES,
  ORIGINALITY_NEEDS_ATTRIBUTION,
  RECIPE_CATEGORIES,
  VISIBILITY_OPTIONS,
} from '@/lib/recipes/recipe-vocab'
import { RecipeBodyEditor } from './recipe-body-editor'
import {
  RecipeIngredientPicker,
  emptyIngredientRow,
  type RecipeIngredientRow,
} from './recipe-ingredient-picker'
import {
  RecipeHeroField,
  RecipeGalleryField,
  type RecipePhoto,
} from './recipe-photo-fields'

import './recipe-form.css'

export interface RecipeFormInitial {
  id: string
  title: string
  summary: string | null
  body: unknown
  hero: RecipePhoto | null
  gallery: RecipePhoto[]
  ingredients: RecipeIngredientRow[]
  servings: number
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  temperatureCelsius: number | null
  cuisineTags: string[]
  dietaryTags: string[]
  mealType: string | null
  categorySlug: string
  originalityType: string | null
  attribution: string | null
  visibility: string
}

function numberOrNull(v: string): number | null {
  const t = v.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function RecipeForm({ initial }: { initial?: RecipeFormInitial }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [body, setBody] = useState<JSONContent | unknown>(
    initial?.body ?? { type: 'doc', content: [{ type: 'paragraph' }] },
  )
  const [hero, setHero] = useState<RecipePhoto | null>(initial?.hero ?? null)
  const [gallery, setGallery] = useState<RecipePhoto[]>(initial?.gallery ?? [])
  const [ingredients, setIngredients] = useState<RecipeIngredientRow[]>(
    initial?.ingredients?.length ? initial.ingredients : [emptyIngredientRow('row-0')],
  )
  const [servings, setServings] = useState(String(initial?.servings ?? 4))
  const [prep, setPrep] = useState(initial?.prepTimeMinutes?.toString() ?? '')
  const [cook, setCook] = useState(initial?.cookTimeMinutes?.toString() ?? '')
  const [temperature, setTemperature] = useState(initial?.temperatureCelsius?.toString() ?? '')
  const [cuisineTags, setCuisineTags] = useState<string[]>(initial?.cuisineTags ?? [])
  const [dietaryTags, setDietaryTags] = useState<string[]>(initial?.dietaryTags ?? [])
  const [mealType, setMealType] = useState(initial?.mealType ?? '')
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? 'cooking')
  const [originalityType, setOriginalityType] = useState(initial?.originalityType ?? 'own')
  const [attribution, setAttribution] = useState(initial?.attribution ?? '')
  const [visibility, setVisibility] = useState(initial?.visibility ?? 'PRIVATE')

  const totalTime = useMemo(() => {
    const p = numberOrNull(prep)
    const c = numberOrNull(cook)
    if (p === null && c === null) return null
    return (p ?? 0) + (c ?? 0)
  }, [prep, cook])

  function toggle(list: string[], value: string, set: (next: string[]) => void): void {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function collect(): UserRecipeFormInput {
    return {
      id: initial?.id ?? null,
      title,
      summary: summary || null,
      body,
      heroPhotoMediaId: hero?.mediaId ?? null,
      galleryMediaIds: gallery.map((g) => g.mediaId),
      ingredients: ingredients.map((r) => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity,
        unit: r.unit,
        notes: r.notes,
        isOptional: r.isOptional,
      })),
      servings: numberOrNull(servings) ?? 0,
      prepTimeMinutes: numberOrNull(prep),
      cookTimeMinutes: numberOrNull(cook),
      temperatureCelsius: numberOrNull(temperature),
      cuisineTags,
      dietaryTags,
      mealType: mealType || null,
      categorySlug,
      originalityType: originalityType || null,
      attribution: attribution || null,
      visibility,
    }
  }

  function run(submit: boolean): void {
    setError(null)
    const input = collect()
    startTransition(async () => {
      const action = submit ? submitUserRecipeForReview : saveUserRecipeDraft
      const result = await action(input)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong saving your recipe.')
        return
      }
      router.push('/me/recipes')
      router.refresh()
    })
  }

  const needsAttribution = ORIGINALITY_NEEDS_ATTRIBUTION.has(originalityType)

  return (
    <div className="recipe-form">
      {error && <p className="me-feedback error recipe-form-error">{error}</p>}

      <section className="recipe-form-section">
        <label className="me-field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            maxLength={160}
            placeholder="What is it called?"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="me-field">
          <span>Summary</span>
          <textarea
            value={summary}
            rows={2}
            placeholder="A line or two about the recipe."
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>
      </section>

      <section className="recipe-form-section">
        <h2 className="recipe-form-heading">Photos</h2>
        <p className="me-field-hint">A cover photo, and up to six more if you like.</p>
        <RecipeHeroField hero={hero} onChange={setHero} />
        <RecipeGalleryField photos={gallery} onChange={setGallery} />
      </section>

      <section className="recipe-form-section">
        <h2 className="recipe-form-heading">Ingredients</h2>
        <p className="me-field-hint">
          Search for each one. If it is not listed, add it and it joins the shared list.
        </p>
        <RecipeIngredientPicker rows={ingredients} onChange={setIngredients} />
      </section>

      <section className="recipe-form-section">
        <h2 className="recipe-form-heading">Method</h2>
        <p className="me-field-hint">Write the steps as a numbered list so they are easy to follow.</p>
        <RecipeBodyEditor initialContent={body} onChange={setBody} />
      </section>

      <section className="recipe-form-section recipe-form-times">
        <label className="me-field">
          <span>Servings</span>
          <input type="text" inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
        </label>
        <label className="me-field">
          <span>Prep (mins)</span>
          <input type="text" inputMode="numeric" value={prep} onChange={(e) => setPrep(e.target.value)} />
        </label>
        <label className="me-field">
          <span>Cook (mins)</span>
          <input type="text" inputMode="numeric" value={cook} onChange={(e) => setCook(e.target.value)} />
        </label>
        <div className="me-field">
          <span>Total</span>
          <p className="recipe-form-total">{totalTime === null ? '—' : `${totalTime} mins`}</p>
        </div>
        <label className="me-field">
          <span>Oven °C</span>
          <input
            type="text"
            inputMode="numeric"
            value={temperature}
            placeholder="optional"
            onChange={(e) => setTemperature(e.target.value)}
          />
        </label>
      </section>

      <section className="recipe-form-section">
        <h2 className="recipe-form-heading">Cuisine</h2>
        <div className="recipe-chips">
          {CUISINE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`recipe-chip${cuisineTags.includes(tag) ? ' is-on' : ''}`}
              onClick={() => toggle(cuisineTags, tag, setCuisineTags)}
            >
              {cuisineLabel(tag)}
            </button>
          ))}
        </div>
      </section>

      <section className="recipe-form-section">
        <h2 className="recipe-form-heading">Dietary</h2>
        <p className="me-field-hint">Leave these for the review pass to fill in if you are not sure.</p>
        <div className="recipe-chips">
          {DIETARY_FLAGS.map((flag) => (
            <button
              key={flag}
              type="button"
              className={`recipe-chip${dietaryTags.includes(flag) ? ' is-on' : ''}`}
              onClick={() => toggle(dietaryTags, flag, setDietaryTags)}
            >
              {DIETARY_LABEL[flag]}
            </button>
          ))}
        </div>
      </section>

      <section className="recipe-form-section recipe-form-selects">
        <label className="me-field">
          <span>Meal type</span>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="">Not set</option>
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="me-field">
          <span>Category</span>
          <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
            {RECIPE_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="me-field">
          <span>Where it came from</span>
          <select value={originalityType} onChange={(e) => setOriginalityType(e.target.value)}>
            {ORIGINALITY_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {needsAttribution && (
        <section className="recipe-form-section">
          <label className="me-field">
            <span>Name the source</span>
            <input
              type="text"
              value={attribution}
              placeholder="Whose recipe inspired this?"
              onChange={(e) => setAttribution(e.target.value)}
            />
          </label>
        </section>
      )}

      <section className="recipe-form-section">
        <h2 className="recipe-form-heading">Who can see it</h2>
        <div className="recipe-visibility">
          {VISIBILITY_OPTIONS.map((v) => (
            <label key={v.value} className={`recipe-visibility-option${visibility === v.value ? ' is-on' : ''}`}>
              <input
                type="radio"
                name="visibility"
                value={v.value}
                checked={visibility === v.value}
                onChange={() => setVisibility(v.value)}
              />
              <span className="recipe-visibility-label">{v.label}</span>
              <span className="recipe-visibility-hint">{v.hint}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="recipe-form-actions">
        <button type="button" className="me-button secondary" disabled={pending} onClick={() => run(false)}>
          {pending ? 'Saving…' : 'Save as draft'}
        </button>
        <button type="button" className="me-button" disabled={pending} onClick={() => run(true)}>
          {pending ? 'Sending…' : 'Submit for review'}
        </button>
      </div>
      <p className="me-field-hint recipe-form-foot">
        Every recipe goes through a review pass before it can be seen. We check the writing reads
        clearly and pull out the allergens for you.
      </p>
    </div>
  )
}
