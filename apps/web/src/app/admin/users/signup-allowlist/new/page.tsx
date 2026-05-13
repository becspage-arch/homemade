import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { addAllowlistEntry } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewAllowlistEntryPage() {
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-12">
        <Link
          href="/admin/users/signup-allowlist"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← signup allowlist
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Add email to signup allowlist
        </h1>
        <p
          className="mt-4 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Anyone who tries to sign up at homemade.education with an email not
          on this list is rejected before an account is created. Add a note so
          we remember why a given email was added once the launch comes around.
        </p>
      </div>

      <form action={addAllowlistEntry} className="space-y-8">
        <Field
          label="Email"
          name="email"
          required
          type="email"
          hint="Lowercased on save. Must look like a real email — no validation against a remote service."
        />
        <Field
          label="Note"
          name="note"
          hint="Optional. Context for future-you: who this is and why they're on the list."
          multiline
        />
        <div className="pt-4">
          <button
            type="submit"
            className="bg-[var(--color-sage)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            add to allowlist
          </button>
        </div>
      </form>
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  hint?: string
  required?: boolean
  multiline?: boolean
  type?: string
}

function Field({ label, name, hint, required, multiline, type = 'text' }: FieldProps) {
  const inputClass =
    'w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]'
  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-lora)',
    fontSize: '1rem',
  }
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
        <textarea name={name} rows={3} className={inputClass} style={inputStyle} />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </label>
  )
}
