interface Category {
  id: string
  name: string
}

interface SubCategoryFormProps {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  categories: Category[]
  defaultValues?: {
    slug?: string
    name?: string
    description?: string | null
    categoryId?: string
    order?: number
  }
}

export function SubCategoryForm({
  action,
  submitLabel,
  categories,
  defaultValues,
}: SubCategoryFormProps) {
  return (
    <form action={action} className="space-y-8">
      <label className="block">
        <span
          className="block text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
        >
          Parent category <span className="ml-2 text-[var(--color-burnt-sienna)]">*</span>
        </span>
        <span
          className="mb-2 mt-1 block text-xs text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
        >
          The top-level category this sits under. Slug must be unique within the parent.
        </span>
        <select
          name="categoryId"
          defaultValue={defaultValues?.categoryId ?? ''}
          required
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem' }}
        >
          <option value="" disabled>
            — choose a parent —
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="Name"
        hint="Display name, e.g. 'Tomatoes' or 'Sourdough'."
        name="name"
        defaultValue={defaultValues?.name ?? ''}
        required
      />

      <Field
        label="Slug"
        hint="URL path within the category. Lowercase, hyphens. Example: 'tomatoes'."
        name="slug"
        defaultValue={defaultValues?.slug ?? ''}
        pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
        required
        mono
      />

      <Field
        label="Description"
        hint="Optional. One or two sentences."
        name="description"
        defaultValue={defaultValues?.description ?? ''}
        multiline
      />

      <Field
        label="Order"
        hint="Lower numbers appear first within the parent category."
        name="order"
        type="number"
        defaultValue={String(defaultValues?.order ?? 0)}
      />

      <div className="pt-4">
        <button
          type="submit"
          className="bg-[var(--color-sage)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  hint?: string
  name: string
  defaultValue?: string
  required?: boolean
  multiline?: boolean
  mono?: boolean
  type?: string
  pattern?: string
}

function Field({
  label,
  hint,
  name,
  defaultValue,
  required,
  multiline,
  mono,
  type = 'text',
  pattern,
}: FieldProps) {
  const inputClass = `w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)] ${
    mono ? 'font-mono text-sm' : ''
  }`
  const inputStyle: React.CSSProperties = mono
    ? {}
    : { fontFamily: 'var(--font-lora)', fontSize: '1rem' }
  return (
    <label className="block">
      <span
        className="block text-xs uppercase text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
      >
        {label}
        {required && <span className="ml-2 text-[var(--color-burnt-sienna)]">*</span>}
      </span>
      {hint && (
        <span
          className="mb-2 mt-1 block text-xs text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
        >
          {hint}
        </span>
      )}
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={3}
          className={inputClass}
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          required={required}
          pattern={pattern}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </label>
  )
}
