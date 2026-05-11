/**
 * Legal entity config for Homemade.
 *
 * One place that holds the controller / contact / registration details every
 * legal page references. Until a Ltd company exists, Rebecca operates as a
 * sole trader; once she incorporates, this file is the only place that
 * changes (the privacy / terms / etc. pages re-render from these values).
 *
 * British English throughout. Voice rules in feedback_homemade_voice.md still
 * apply — legal precision wins where they conflict, but plain English wins
 * over jargon everywhere else.
 */
export const LEGAL_ENTITY = {
  name: 'Rebecca Page (trading as Homemade)',
  contactEmail: 'privacy@homemade.education',
  dpoEmail: 'dpo@homemade.education',
  legalEmail: 'legal@homemade.education',
  postalAddress: null as string | null, // null = "available on request"
  icoRegistrationNumber: null as string | null, // null = "pending"
  companiesHouseNumber: null as string | null,
  vatNumber: null as string | null,
  jurisdiction: 'England and Wales' as const,
  effectiveDate: '2026-05-11',
} as const

export type LegalEntity = typeof LEGAL_ENTITY

/**
 * Convenience helper for rendering "Available on request" placeholders.
 */
export function legalField(value: string | null, fallback = 'Available on request'): string {
  return value ?? fallback
}
