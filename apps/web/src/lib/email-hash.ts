import 'server-only'

/**
 * Non-cryptographic FNV-1a 32-bit hash of an email, encoded as 8 lowercase hex
 * digits. Used as a PostHog person property + analytics event property so we
 * can join logs to users without exposing raw email.
 */
export function hashEmailForAnalytics(email: string): string {
  let hash = 2166136261
  for (let i = 0; i < email.length; i++) {
    hash ^= email.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Domain part of an email, lowercased. Returns null if the email is malformed.
 * We push the raw domain (not hash) to analytics so we can monitor signup
 * attempts by source — useful for spotting bots clustering on one domain.
 */
export function extractEmailDomain(email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at < 0 || at === email.length - 1) return null
  return email.slice(at + 1).toLowerCase()
}
