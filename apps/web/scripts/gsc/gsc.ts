/**
 * Google Search Console API helper — build-time / ops tooling, NOT in the web bundle.
 *
 * Auth: the `homemade-seo` service account (read-only webmasters scope). The key is a
 * gitignored file in .secrets/ (never committed). Override its path with GSC_KEY_PATH.
 * Property is a DOMAIN property, so siteUrl = 'sc-domain:homemade.education'.
 *
 * CLI (run from apps/web):
 *   npx tsx scripts/gsc/gsc.ts queries [days]   — top search queries
 *   npx tsx scripts/gsc/gsc.ts pages   [days]   — top pages
 *   npx tsx scripts/gsc/gsc.ts inspect <url>    — a URL's index status (indexed? 404? blocked?)
 *   npx tsx scripts/gsc/gsc.ts sitemaps         — submitted sitemaps
 */
import { readFileSync, existsSync } from 'fs'
import { createSign } from 'crypto'
import { dirname, join } from 'path'

export const GSC_SITE = 'sc-domain:homemade.education'

/** Walk up from this file's directory until we find the repo root (pnpm-workspace.yaml). */
function findRepoRoot(startDir: string): string {
  let dir = startDir
  for (;;) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = dirname(dir)
    if (parent === dir) return startDir // fell off the filesystem root; give up gracefully
    dir = parent
  }
}

const REPO_ROOT = findRepoRoot(__dirname)
const KEY_PATH = process.env.GSC_KEY_PATH ?? join(REPO_ROOT, '.secrets', 'gsc-homemade.json')

let cached: { token: string; exp: number } | null = null

export async function gscToken(
  scope = 'https://www.googleapis.com/auth/webmasters.readonly',
): Promise<string> {
  if (cached && cached.exp > Date.now() / 1000 + 60) return cached.token
  const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'))
  const now = Math.floor(Date.now() / 1000)
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope,
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  })}`
  const sig = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url')
  const res = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  })
  const tok = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!tok.access_token) throw new Error('GSC auth failed: ' + JSON.stringify(tok))
  cached = { token: tok.access_token, exp: now + (tok.expires_in ?? 3600) }
  return tok.access_token
}

export async function searchAnalytics(opts: {
  startDate: string
  endDate: string
  dimensions?: string[]
  rowLimit?: number
  dimensionFilterGroups?: unknown[]
}): Promise<unknown> {
  const token = await gscToken()
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowLimit: 25, ...opts }),
    },
  )
  return res.json()
}

export async function inspectUrl(url: string): Promise<unknown> {
  const token = await gscToken()
  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: GSC_SITE }),
  })
  return res.json()
}

export async function listSitemaps(): Promise<unknown> {
  const token = await gscToken()
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return res.json()
}

// CLI dispatch — only when this file is the entrypoint (not when imported).
if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/gsc/gsc.ts')) {
  const cmd = process.argv[2]
  const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  ;(async () => {
    if (cmd === 'queries' || cmd === 'pages') {
      const days = Number(process.argv[3] ?? 28)
      console.log(
        JSON.stringify(
          await searchAnalytics({
            startDate: daysAgo(days),
            endDate: today,
            dimensions: [cmd === 'pages' ? 'page' : 'query'],
            rowLimit: 25,
          }),
          null,
          1,
        ),
      )
    } else if (cmd === 'inspect') {
      console.log(JSON.stringify(await inspectUrl(process.argv[3] ?? ''), null, 1))
    } else if (cmd === 'sitemaps') {
      console.log(JSON.stringify(await listSitemaps(), null, 1))
    } else {
      console.log('usage: gsc.ts queries|pages [days] | inspect <url> | sitemaps')
    }
  })().catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
}
