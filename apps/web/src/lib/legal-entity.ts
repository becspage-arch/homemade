/**
 * Legal entity config for Homemade.
 *
 * One place that holds the controller / contact / registration details every
 * legal page references. The operating entity is Page Ventures Ltd, trading as
 * Homemade; this file is the only place those details live, so the privacy /
 * terms / etc. pages re-render from these values.
 *
 * British English throughout. Voice rules in feedback_homemade_voice.md still
 * apply — legal precision wins where they conflict, but plain English wins
 * over jargon everywhere else.
 */
export const LEGAL_ENTITY = {
  name: 'Page Ventures Ltd (trading as Homemade)',
  contactEmail: 'privacy@homemade.education',
  dpoEmail: 'dpo@homemade.education',
  legalEmail: 'legal@homemade.education',
  // Rented virtual office (decided 2026-06-21). Serves the legal-page footer,
  // the Stripe business address, and the marketing-email postal-address
  // requirement (UK PECR / US CAN-SPAM).
  postalAddress:
    'Homemade Education, Office 7283, 58 Peregrine Road, Hainault, Ilford, Essex IG6 3SZ' as string | null,
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
