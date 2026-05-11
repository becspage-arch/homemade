import { LEGAL_ENTITY } from '@/lib/legal-entity'

interface LegalHeaderProps {
  eyebrow: string
  title: string
}

function formatDate(iso: string) {
  // Display the effective date as a UK long form, e.g. "11 May 2026". Always
  // build from the ISO string parts so we don't depend on locale-dependent
  // server rendering (which would mismatch the client on hydrate).
  const parts = iso.split('-').map((n) => Number(n))
  const year = parts[0] ?? 0
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  const monthName = new Date(Date.UTC(year, month - 1, day)).toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  })
  return `${day} ${monthName} ${year}`
}

export function LegalHeader({ eyebrow, title }: LegalHeaderProps) {
  const formatted = formatDate(LEGAL_ENTITY.effectiveDate)
  return (
    <header>
      <span className="legal-eyebrow">{eyebrow}</span>
      <h1 className="legal-title">{title}</h1>
      <div className="legal-dates">
        <span>Effective: {formatted}</span>
        <span>Last updated: {formatted}</span>
      </div>
    </header>
  )
}
