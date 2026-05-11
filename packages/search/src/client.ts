import { Client } from 'typesense'

/**
 * Typesense client wrappers.
 *
 * TWO clients deliberately. The admin client uses the admin key (writes) and
 * must never leak into a browser bundle — callers stay on the server. The
 * search-only client uses the search-only key (reads) and is safe in any
 * runtime, but we still construct it server-side because the public /search
 * page is a server component.
 *
 * Returns null when the relevant env vars aren't set. Callers should treat a
 * null client as "search not configured yet" and short-circuit (the public
 * search page renders an empty state, the sync hooks log a debug line and
 * carry on so admin writes never fail because Typesense isn't ready).
 */

function getHost(): string | null {
  // Accept either a full URL or a bare host. Typesense Cloud gives a full URL
  // like https://abc-1.a1.typesense.net — we parse the host out.
  const raw = (process.env.TYPESENSE_HOST ?? '').trim()
  if (!raw) return null
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return new URL(raw).host
    }
    return raw
  } catch {
    return raw
  }
}

function buildClient(apiKey: string): Client {
  const host = getHost()
  if (!host) {
    throw new Error('TYPESENSE_HOST is not set.')
  }
  return new Client({
    nodes: [{ host, port: 443, protocol: 'https' }],
    apiKey,
    connectionTimeoutSeconds: 5,
    retryIntervalSeconds: 0.5,
    numRetries: 2,
  })
}

let cachedAdmin: Client | null | undefined
let cachedSearch: Client | null | undefined

export function getAdminClient(): Client | null {
  if (cachedAdmin !== undefined) return cachedAdmin
  const apiKey = (process.env.TYPESENSE_ADMIN_API_KEY ?? '').trim()
  if (!apiKey || !getHost()) {
    cachedAdmin = null
    return null
  }
  try {
    cachedAdmin = buildClient(apiKey)
    return cachedAdmin
  } catch {
    cachedAdmin = null
    return null
  }
}

export function getSearchClient(): Client | null {
  if (cachedSearch !== undefined) return cachedSearch
  // Prefer search-only key; fall back to admin in dev so a quick start works.
  const apiKey =
    (process.env.TYPESENSE_SEARCH_ONLY_API_KEY ?? '').trim() ||
    (process.env.TYPESENSE_ADMIN_API_KEY ?? '').trim()
  if (!apiKey || !getHost()) {
    cachedSearch = null
    return null
  }
  try {
    cachedSearch = buildClient(apiKey)
    return cachedSearch
  } catch {
    cachedSearch = null
    return null
  }
}

/** True if Typesense is configured. Use in UI/branching to show empty states. */
export function isSearchConfigured(): boolean {
  return getSearchClient() !== null
}

/**
 * For tests / scripts that need to reset the module-level cache after mutating
 * process.env. Not used by app code.
 */
export function _resetSearchClientCache(): void {
  cachedAdmin = undefined
  cachedSearch = undefined
}
