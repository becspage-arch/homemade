/**
 * Signup spam signal — flag-only, never a block. Computed once at account
 * creation (Clerk webhook `user.created` and the JIT provisioning fallback in
 * `get-current-user.ts`) and stored on `User.signupRiskScore` /
 * `signupRiskReasons` / `emailDomain` so the admin Members list can surface a
 * "Likely spam" signal without re-deriving it on every render.
 *
 * Nothing in this module rejects a signup or deletes an account — it only
 * produces a score + a list of plain-English reasons for a human to look at.
 */

import { isDisposableEmailDomain } from './disposable-email-domains'

export interface SignupRiskReason {
  key: string
  weight: number
  label: string
}

export interface SignupRiskResult {
  emailDomain: string | null
  riskScore: number
  riskReasons: string[]
}

const VOWELS = /[aeiou]/i

/** Everything before the "@". Lower-cased, trimmed of any +tag suffix. */
function localPartOf(email: string): string {
  const at = email.indexOf('@')
  const local = at === -1 ? email : email.slice(0, at)
  const plusTag = local.indexOf('+')
  return (plusTag === -1 ? local : local.slice(0, plusTag)).toLowerCase()
}

export function emailDomainOf(email: string): string | null {
  const at = email.indexOf('@')
  if (at === -1 || at === email.length - 1) return null
  return email.slice(at + 1).toLowerCase()
}

/** A local part that reads as machine-generated rather than a person's name. */
function looksRandom(localPart: string): boolean {
  const letters = localPart.replace(/[^a-z]/gi, '')
  const digits = localPart.replace(/[^0-9]/g, '')
  const longWithNoVowels = localPart.length >= 12 && letters.length >= 6 && !VOWELS.test(letters)
  const heavyDigitMix = digits.length >= 4 && letters.length >= 3
  return longWithNoVowels || heavyDigitMix
}

/**
 * Compute the signup risk signal for a new account. `name` is whatever Clerk
 * gave us (first + last, already combined) at the moment of signup — pass
 * `null` when Clerk has no name on file yet.
 */
export function computeSignupRisk(input: {
  email: string
  name: string | null
}): SignupRiskResult {
  const email = input.email.toLowerCase()
  const domain = emailDomainOf(email)
  const localPart = localPartOf(email)

  const reasons: SignupRiskReason[] = []

  if (isDisposableEmailDomain(domain)) {
    reasons.push({ key: 'disposable-email-domain', weight: 2, label: 'Disposable email domain' })
  }
  if (looksRandom(localPart)) {
    reasons.push({
      key: 'random-looking-local-part',
      weight: 1,
      label: 'Random-looking email address',
    })
  }
  if (!input.name) {
    reasons.push({ key: 'no-name-provided', weight: 1, label: 'No name provided' })
  }

  return {
    emailDomain: domain,
    riskScore: reasons.reduce((sum, r) => sum + r.weight, 0),
    riskReasons: reasons.map((r) => r.key),
  }
}

/** Human-readable label for a stored reason key, for the admin detail page. */
export const SIGNUP_RISK_REASON_LABELS: Record<string, string> = {
  'disposable-email-domain': 'Disposable email domain',
  'random-looking-local-part': 'Random-looking email address',
  'no-name-provided': 'No name provided',
  'signup-rate-burst': 'Many signups from this IP recently',
}
