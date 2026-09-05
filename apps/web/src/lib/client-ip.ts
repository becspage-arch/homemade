import 'server-only'
import { headers } from 'next/headers'

/**
 * Best-effort real client IP for a genuine end-user request (a page render,
 * not a server-to-server webhook). Cloudflare puts the original client IP in
 * `cf-connecting-ip`; the ALB rewrites `x-forwarded-for`. Mirrors the same
 * precedence `(public)/search/page.tsx` uses for its rate limiter.
 *
 * Returns null rather than a placeholder string so callers can tell "we
 * genuinely don't know" apart from a real value.
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers()
    return (
      h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    )
  } catch {
    return null
  }
}

export async function getClientUserAgent(): Promise<string | null> {
  try {
    const h = await headers()
    return h.get('user-agent')
  } catch {
    return null
  }
}
