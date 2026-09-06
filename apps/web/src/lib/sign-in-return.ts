import { headers } from 'next/headers'

/**
 * Sign-in URL that sends the visitor back to the page they were on.
 *
 * A server action has no idea which route invoked it, but the browser sends
 * the page as the Referer header on the action POST. That is the same round
 * trip `StudioAuthGate` does explicitly with `returnTo`, done for callers
 * that only find out about the missing session once the action is running.
 *
 * Falls back to a plain `/sign-in` when there is no usable referer.
 */
export async function signInHrefForCurrentPage(): Promise<string> {
  const referer = (await headers()).get('referer')
  const returnTo = internalPathFromReferer(referer)
  return returnTo ? `/sign-in?redirect_url=${encodeURIComponent(returnTo)}` : '/sign-in'
}

/**
 * Reduce a referer to a same-site path. Only ever returns a single-slash
 * relative path, so the value can't be turned into an open redirect, and
 * never returns the auth pages themselves (which would loop).
 */
export function internalPathFromReferer(referer: string | null | undefined): string | null {
  if (!referer) return null
  let path: string
  try {
    const url = new URL(referer)
    path = `${url.pathname}${url.search}`
  } catch {
    return null
  }
  if (!path.startsWith('/') || path.startsWith('//')) return null
  if (path.startsWith('/sign-in') || path.startsWith('/sign-up')) return null
  return path
}
