import 'server-only'
import { prisma } from '@homemade/db'

/**
 * Handle rules (Session A addendum).
 *
 * One function in: `validateHandle({ candidate, currentUserId })`.
 * One result out: `{ ok: true } | { ok: false; reason: HandleRejectReason }`.
 *
 * The reject reason is internal — callers map every reject to the SAME
 * neutral copy ("this handle isn't available") so bad actors can't probe
 * the filter by trying variations. The internal code lets us tell
 * legitimate users with similar handles apart from out-and-out profanity
 * in the admin audit log.
 *
 * Rules, in order:
 *   1. Shape — already enforced by `HANDLE_RE` in user-state-actions; we
 *      duplicate the check here so callers can use this in isolation.
 *   2. Reserved — top-level routes + category slugs + brand-protected.
 *   3. Profanity — small static word-list. Substring match,
 *      case-insensitive. NOT a comprehensive filter; obvious slurs only.
 *   4. Brand-name protection — same shape as profanity, separate list so
 *      Rebecca can extend without thinking about word-list politics.
 *   5. Uniqueness — query Prisma for an existing User with this handle.
 *   6. Impersonation — if a confirmed Creator has a near-identical handle
 *      (Levenshtein ≤ 2), prompt the claimant. Hard-block exact-match-
 *      with-character-swap.
 */

export type HandleRejectReason =
  | 'invalid-shape'
  | 'reserved'
  | 'profanity'
  | 'brand'
  | 'taken'
  | 'impersonation-hard-block'
  | 'impersonation-soft-prompt'

export interface HandleValidationOk {
  ok: true
  candidate: string
}

export interface HandleValidationFail {
  ok: false
  reason: HandleRejectReason
  /** Only set when reason === 'impersonation-soft-prompt' so the form can
      show the "Are you {creator name}?" prompt. */
  similarTo?: { handle: string; name: string | null }
}

export type HandleValidationResult = HandleValidationOk | HandleValidationFail

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9_-]{1,30}[a-z0-9])?$/

// Top-level routes + reserved brand terms. Order doesn't matter; Set lookup
// is O(1). Built from `apps/web/src/app/` top-level dirs + brand-protected
// terms.
const RESERVED_HANDLES = new Set<string>([
  // Top-level routes
  'me',
  'm',
  'admin',
  'api',
  'legal',
  'search',
  'sign-in',
  'sign-up',
  'signin',
  'signup',
  'unlock',
  'healthz',
  'coming-soon',
  'patterns',
  'makers',
  'offline',
  // Brand-protected internal terms
  'admin',
  'support',
  'help',
  'homemade',
  'rebecca',
  'team',
  'staff',
  'moderator',
  'mod',
  'creator',
  'maker',
  'official',
  'verified',
  // Live category slugs — keep in sync with packages/db/scripts/seed-categories.
  // Reserving them prevents a Maker from claiming /m/cooking and
  // confusing/intercepting navigation.
  'cooking',
  'baking',
  'garden',
  'mindset',
  'herbal-medicine',
  'crochet',
  'knitting',
  'needlework',
  'sewing',
  'fibre-arts',
  'wood-natural-craft',
  'paper-word',
  'pottery-ceramics',
  'animals-smallholding',
  'home-repair',
  'natural-home',
  'sustainability',
])

// Obvious slurs + hate-speech terms. Substring match. Intentionally not a
// long list — we don't want to dignify edge cases that the impersonation
// + manual-moderation path covers. Add to as needed.
const PROFANITY_SUBSTRINGS = [
  'nigger',
  'nigga',
  'faggot',
  'tranny',
  'retard',
  'kike',
  'spic',
  'chink',
  'paki',
  'wetback',
  'cunt',
  'fuck',
  'shit',
  'kill-yourself',
  'killyourself',
]

// Brand-protected homemaking-adjacent platforms / well-known names. Block
// at the brand level rather than per-variant.
const BRAND_SUBSTRINGS = [
  'etsy',
  'pinterest',
  'ravelry',
  'youtube',
  'instagram',
  'tiktok',
  'facebook',
  'twitter',
  'amazon',
  'bbc',
  'nigella',
  'jamie-oliver',
  'mary-berry',
  'gordon-ramsay',
  'martha-stewart',
  'kingarthur',
  'kingarthurflour',
  'allrecipes',
  'seriouseats',
  'nyt-cooking',
  'nytcooking',
  'bonappetit',
  'foodnetwork',
]

function hasReservedConflict(handle: string): boolean {
  return RESERVED_HANDLES.has(handle)
}

function containsAny(handle: string, list: readonly string[]): boolean {
  for (const word of list) {
    if (handle.includes(word)) return true
  }
  return false
}

/** Standard Levenshtein distance. Used for the impersonation soft prompt. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const prev = new Array<number>(b.length + 1)
  const curr = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j]! + 1, // deletion
        curr[j - 1]! + 1, // insertion
        prev[j - 1]! + cost, // substitution
      )
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!
  }
  return prev[b.length]!
}

export async function validateHandle(input: {
  candidate: string
  currentUserId: string | null
}): Promise<HandleValidationResult> {
  const candidate = input.candidate.trim().toLowerCase()

  // 1. Shape
  if (!HANDLE_RE.test(candidate)) {
    return { ok: false, reason: 'invalid-shape' }
  }

  // 2. Reserved (exact match)
  if (hasReservedConflict(candidate)) {
    return { ok: false, reason: 'reserved' }
  }

  // 3. Profanity (substring)
  if (containsAny(candidate, PROFANITY_SUBSTRINGS)) {
    return { ok: false, reason: 'profanity' }
  }

  // 4. Brand-protected (substring)
  if (containsAny(candidate, BRAND_SUBSTRINGS)) {
    return { ok: false, reason: 'brand' }
  }

  // 5. Uniqueness
  const taken = await prisma.user.findFirst({
    where: {
      displayHandle: candidate,
      ...(input.currentUserId ? { NOT: { id: input.currentUserId } } : {}),
    },
    select: { id: true },
  })
  if (taken) {
    return { ok: false, reason: 'taken' }
  }

  // 6. Impersonation — compare against confirmed Creators only. Lev ≤ 2
  // soft-prompts; one-character substitution at the same length is treated
  // as a hard block (e.g. "rebecca-paqe" vs "rebecca-page" — same length,
  // distance 1). Soft prompt: anything else within distance 2.
  const creators = await prisma.user.findMany({
    where: {
      isCreator: true,
      displayHandle: { not: null },
      ...(input.currentUserId ? { NOT: { id: input.currentUserId } } : {}),
    },
    select: { displayHandle: true, name: true },
  })
  for (const c of creators) {
    if (!c.displayHandle) continue
    if (c.displayHandle === candidate) continue // uniqueness already caught
    const d = levenshtein(candidate, c.displayHandle)
    if (d === 0) continue
    if (d === 1 && candidate.length === c.displayHandle.length) {
      // single-character swap at the same length — hard block (typosquat).
      return { ok: false, reason: 'impersonation-hard-block' }
    }
    if (d <= 2) {
      return {
        ok: false,
        reason: 'impersonation-soft-prompt',
        similarTo: { handle: c.displayHandle, name: c.name },
      }
    }
  }

  return { ok: true, candidate }
}

/**
 * 90-day rate limit on handle changes. Returns the date the next change is
 * allowed, or null if a change is allowed right now. A null
 * `lastHandleChangeAt` means the Maker has never changed (or hasn't set
 * the field since it was added) — allowed.
 */
export function nextHandleChangeAllowedAt(
  lastHandleChangeAt: Date | null,
): Date | null {
  if (!lastHandleChangeAt) return null
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
  const next = new Date(lastHandleChangeAt.getTime() + NINETY_DAYS_MS)
  if (next.getTime() <= Date.now()) return null
  return next
}

/** Internal-only — exposed for the admin reserved-list audit test. */
export const INTERNAL_RESERVED_HANDLES_FOR_TEST = RESERVED_HANDLES
