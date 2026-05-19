interface MakerOfTheMonthBadgeProps {
  /** First day of the featured month; used to label the badge. */
  monthStart: Date
}

/**
 * Small editorial badge rendered on the public Maker profile during the
 * featured month. Auto-renders nothing — the caller decides whether to
 * include it via `currentMonthBadgeFor`.
 */
export function MakerOfTheMonthBadge({ monthStart }: MakerOfTheMonthBadgeProps) {
  const label = monthStart.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
  return (
    <span
      className="maker-motm-badge"
      title={`Featured Maker of the Month — ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        marginTop: 8,
        borderRadius: 999,
        fontFamily: 'var(--font-lora)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        background: 'var(--color-sage, #6b8a64)',
        color: 'var(--color-cream, #fffcf5)',
      }}
    >
      <span aria-hidden="true">★</span> Maker of the Month — {label}
    </span>
  )
}
