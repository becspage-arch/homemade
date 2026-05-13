import Anthropic from '@anthropic-ai/sdk'

let cached: Anthropic | null | undefined

/**
 * Singleton Anthropic client. Reads `ANTHROPIC_API_KEY` from the environment
 * (the upload script loads `.env.credentials` before requiring this module).
 *
 * Returns null when the key isn't set so callers can fail with a clear
 * "set the key" message rather than an SDK stack trace.
 */
export function getAnthropicClient(): Anthropic | null {
  if (cached !== undefined) return cached
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim()
  if (!apiKey) {
    cached = null
    return null
  }
  cached = new Anthropic({ apiKey })
  return cached
}

export function _resetAnthropicClientCache(): void {
  cached = undefined
}
