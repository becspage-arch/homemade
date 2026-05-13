'use client'

export function ConfirmRemoveButton({ email }: { email: string }) {
  return (
    <button
      type="submit"
      className="admin-btn secondary"
      onClick={(e) => {
        if (!window.confirm(`Remove ${email} from the signup allowlist?`)) {
          e.preventDefault()
        }
      }}
    >
      Remove
    </button>
  )
}
