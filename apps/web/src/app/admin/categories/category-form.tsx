interface CategoryFormProps {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  defaultValues?: {
    slug?: string
    name?: string
    description?: string | null
    order?: number
  }
}

export function CategoryForm({ action, submitLabel, defaultValues }: CategoryFormProps) {
  return (
    <form action={action} className="space-y-8">
      <Field
        label="Name"
        hint="The display name. Shown on the site as a heading."
        name="name"
        defaultValue={defaultValues?.name ?? ''}
        required
      />

      <Field
        label="Slug"
        hint="The URL path. Lowercase, hyphens for spaces. Example: 'crochet' or 'growing-vegetables'."
        name="slug"
        defaultValue={defaultValues?.slug ?? ''}
        pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
        required
        mono
      />

      <Field
        label="Description"
        hint="One or two sentences. Used in metadata and sometimes on category pages."
        name="description"
        defaultValue={defaultValues?.description ?? ''}
        multiline
      />

      <Field
        label="Order"
        hint="Lower numbers appear first. Use 0 for the most prominent categories."
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
