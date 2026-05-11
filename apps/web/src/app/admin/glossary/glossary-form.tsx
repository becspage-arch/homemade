interface Category {
  id: string
  name: string
}

interface GlossaryFormProps {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  categories: Category[]
  defaultValues?: {
    slug?: string
    term?: string
    definition?: string
    categoryId?: string | null
  }
}

export function GlossaryForm({
  action,
  submitLabel,
  categories,
  defaultValues,
}: GlossaryFormProps) {
  return (
    <form action={action} className="space-y-8">
      <Field
        label="Term"
        hint="The display term, exactly as it should appear. Lowercase or sentence-case depending on the term."
        name="term"
        defaultValue={defaultValues?.term ?? ''}
        required
      />

      <Field
        label="Slug"
        hint="The URL path. Lowercase, hyphens for spaces. Example: 'magic-ring' or 'al-dente'."
        name="slug"
        defaultValue={defaultValues?.slug ?? ''}
        pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
        required
        mono
      />

      <Field
        label="Definition"
        hint="A short, plain-text definition used in tooltips. One or two sentences."
        name="definition"
        defaultValue={defaultValues?.definition ?? ''}
        multiline
        required
      />

      <label className="block">
        <span
          className="block text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
        >
          Category
        </span>
        <span
          className="mb-2 mt-1 block text-xs text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
        >
          Optional. Leave blank for cross-category terms.
        </span>
        <select
          name="categoryId"
          defaultValue={defaultValues?.categoryId ?? ''}
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem' }}
        >
          <option value="">— none (cross-category) —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

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
          type="text"
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
