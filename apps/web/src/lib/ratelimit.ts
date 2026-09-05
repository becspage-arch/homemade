import 'server-only'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

let redis: Redis | null = null
let limiters: Limiters | null = null

type Limiters = {
  reviewSubmission: Ratelimit
  photoUpload: Ratelimit
  questionAsked: Ratelimit
  errataSubmitted: Ratelimit
  reportSubmitted: Ratelimit
  searchQuery: Ratelimit
  signup: Ratelimit
}

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

function getLimiters(): Limiters | null {
  if (limiters) return limiters
  const r = getRedis()
  if (!r) return null
  limiters = {
    reviewSubmission: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'rl:review',
    }),
    photoUpload: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'rl:photo',
    }),
    questionAsked: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'rl:question',
    }),
    errataSubmitted: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'rl:errata',
    }),
    reportSubmitted: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'rl:report',
    }),
    searchQuery: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'rl:search',
    }),
    // Signup spam signal only — never blocks an account being created. See
    // `signup-risk.ts`; tripping this bucket adds a `signup-rate-burst` risk
    // reason instead of a friendly rejection message.
    signup: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'rl:signup',
    }),
  }
  return limiters
}

export type RateLimitKey = keyof Limiters

/**
 * Check a rate limit for the given identifier. Returns `allowed: true` if
 * Upstash isn't configured (graceful no-op), `allowed: true` if under the
 * cap, or `allowed: false` with a friendly message if over.
 */
export async function checkRateLimit(
  bucket: RateLimitKey,
  identifier: string,
): Promise<{ allowed: true } | { allowed: false; message: string }> {
  const all = getLimiters()
  if (!all) return { allowed: true }
  const limiter = all[bucket]
  try {
    const result = await limiter.limit(identifier)
    if (result.success) return { allowed: true }
    return { allowed: false, message: friendlyMessage(bucket, result.reset) }
  } catch {
    // If Redis blips, fail open. Better to let the action through than to
    // silently lock the user out of their own site.
    return { allowed: true }
  }
}

function friendlyMessage(bucket: RateLimitKey, resetAt: number | undefined): string {
  const mins = resetAt ? Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000)) : 5
  const window = mins === 1 ? '1 minute' : `${mins} minutes`
  switch (bucket) {
    case 'reviewSubmission':
      return `You've reached the review limit for now. Try again in ${window}.`
    case 'photoUpload':
      return `You've reached the photo upload limit for now. Try again in ${window}.`
    case 'questionAsked':
      return `You've asked a lot of questions in a short time. Try again in ${window}.`
    case 'errataSubmitted':
      return `You've reached the errata report limit for now. Try again in ${window}.`
    case 'reportSubmitted':
      return `You've reached the report limit for now. Try again in ${window}.`
    case 'searchQuery':
      return `Search is busy. Try again in ${window}.`
    case 'signup':
      // Never shown to a signer-upper — signup is never blocked. checkRateLimit's
      // `allowed: false` result is only used as a risk signal.
      return `Signup rate checked. Try again in ${window}.`
  }
}
