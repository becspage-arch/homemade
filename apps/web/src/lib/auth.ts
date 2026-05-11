/**
 * Pre-launch admin allowlist. Hardcoded by email rather than via a role column
 * because the User table isn't populated yet (no Clerk webhook wired). Replace
 * with proper role lookup against the User table once that's in.
 */
const ADMIN_EMAILS = new Set(['rebecca@homemade.education'])

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.toLowerCase())
}
