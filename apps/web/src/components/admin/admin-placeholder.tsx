interface AdminPlaceholderProps {
  title: string
  description: string
  phase: string
}

/**
 * A small "coming in Phase X" placeholder so the sidebar never points at a 404.
 * Used by Billing / Marketing / Analytics / System sub-pages that haven't been
 * built yet. Each phase ticks the placeholder pages off as it ships.
 */
export function AdminPlaceholder({ title, description, phase }: AdminPlaceholderProps) {
  return (
    <div className="admin-placeholder">
      <h1>{title}</h1>
      <p>{description}</p>
      <p style={{ marginTop: 24, fontStyle: 'italic' }}>
        Lands in <strong>{phase}</strong>.
      </p>
    </div>
  )
}
