import 'server-only'
import { createSign } from 'node:crypto'
import { connect, type ClientHttp2Session } from 'node:http2'

/**
 * Real APNs HTTP/2 dispatcher. Gated by the presence of three env vars:
 *
 *   APNS_AUTH_KEY    — the .p8 file contents (full text including BEGIN/END)
 *   APNS_KEY_ID      — 10-char key identifier from Apple Developer
 *   APNS_TEAM_ID     — 10-char team identifier from Apple Developer
 *
 * Also optional:
 *
 *   APNS_BUNDLE_ID   — bundle id used in apns-topic. Defaults to
 *                      `education.homemade.app`.
 *   APNS_ENV         — `production` (api.push.apple.com, default) or
 *                      `sandbox` (api.sandbox.push.apple.com).
 *
 * When any of the three required vars is absent, `dispatchApnsPush()` returns
 * `{ enabled: false }` so the caller falls back to the logging stub. This lets
 * the wire ship now and start dispatching the moment Rebecca drops the key
 * into Secrets Manager — no code change needed to flip the switch.
 *
 * The HTTP/2 session is kept open across calls and lazily reconnected on
 * GOAWAY. JWT tokens are cached for 45 minutes (Apple rotates at 60).
 */

const DEFAULT_BUNDLE_ID = 'education.homemade.app'
const TOKEN_TTL_MS = 45 * 60 * 1000

interface ApnsConfig {
  authKey: string
  keyId: string
  teamId: string
  bundleId: string
  host: string
}

interface CachedToken {
  jwt: string
  expiresAt: number
}

let cachedConfig: ApnsConfig | null | undefined
let cachedToken: CachedToken | null = null
let cachedSession: ClientHttp2Session | null = null
let cachedSessionHost: string | null = null

function readConfig(): ApnsConfig | null {
  if (cachedConfig !== undefined) return cachedConfig
  const authKey = process.env.APNS_AUTH_KEY
  const keyId = process.env.APNS_KEY_ID
  const teamId = process.env.APNS_TEAM_ID
  if (!authKey || !keyId || !teamId) {
    cachedConfig = null
    return null
  }
  const env = process.env.APNS_ENV === 'sandbox' ? 'sandbox' : 'production'
  cachedConfig = {
    authKey: authKey.replace(/\\n/g, '\n'),
    keyId,
    teamId,
    bundleId: process.env.APNS_BUNDLE_ID || DEFAULT_BUNDLE_ID,
    host:
      env === 'sandbox'
        ? 'https://api.sandbox.push.apple.com'
        : 'https://api.push.apple.com',
  }
  return cachedConfig
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function getJwt(config: ApnsConfig): string {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.jwt

  const header = base64url(JSON.stringify({ alg: 'ES256', kid: config.keyId }))
  const claims = base64url(
    JSON.stringify({
      iss: config.teamId,
      iat: Math.floor(now / 1000),
    }),
  )
  const signingInput = `${header}.${claims}`

  // The .p8 is PEM-encoded; createSign needs raw PEM, not the base64-stripped
  // body. ES256 with DER-encoded ECDSA signature, then converted to the
  // JWS-style fixed 64-byte (r||s) form.
  const sign = createSign('SHA256')
  sign.update(signingInput)
  sign.end()
  const derSignature = sign.sign({
    key: config.authKey,
    dsaEncoding: 'ieee-p1363', // Node returns the 64-byte raw r||s form
  })
  const signature = base64url(derSignature)

  const jwt = `${signingInput}.${signature}`
  cachedToken = { jwt, expiresAt: now + TOKEN_TTL_MS }
  return jwt
}

function getSession(host: string): ClientHttp2Session {
  if (cachedSession && cachedSessionHost === host && !cachedSession.closed) {
    return cachedSession
  }
  if (cachedSession && !cachedSession.closed) cachedSession.close()
  const session = connect(host)
  session.on('error', () => {
    // The next dispatch will reconnect.
    if (cachedSession === session) cachedSession = null
  })
  session.on('close', () => {
    if (cachedSession === session) cachedSession = null
  })
  session.on('goaway', () => {
    if (cachedSession === session) cachedSession = null
  })
  cachedSession = session
  cachedSessionHost = host
  return session
}

export interface DispatchResult {
  enabled: boolean
  /** APNs HTTP status code (e.g. 200 ok, 410 bad token, 400 bad payload). */
  status?: number
  /** APNs error reason string when status is non-2xx. */
  reason?: string
}

export async function dispatchApnsPush(
  deviceToken: string,
  payload: { title: string; body: string; href?: string | null },
): Promise<DispatchResult> {
  const config = readConfig()
  if (!config) return { enabled: false }

  const jwt = getJwt(config)
  const session = getSession(config.host)

  return new Promise<DispatchResult>((resolve) => {
    let settled = false
    const settle = (result: DispatchResult) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    const req = session.request({
      ':method': 'POST',
      ':path': `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      'apns-topic': config.bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    })

    const apsPayload = {
      aps: {
        alert: { title: payload.title, body: payload.body },
        sound: 'default',
      },
      ...(payload.href ? { href: payload.href } : {}),
    }
    req.setEncoding('utf-8')
    req.end(JSON.stringify(apsPayload))

    let status = 0
    let body = ''
    req.on('response', (headers) => {
      status = Number(headers[':status']) || 0
    })
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (status >= 200 && status < 300) {
        settle({ enabled: true, status })
      } else {
        let reason: string | undefined
        try {
          const parsed = JSON.parse(body)
          if (parsed && typeof parsed.reason === 'string') reason = parsed.reason
        } catch {
          /* non-JSON error body */
        }
        settle({ enabled: true, status, reason })
      }
    })
    req.on('error', () => {
      settle({ enabled: true, status: 0, reason: 'network-error' })
    })
    // Hard 8s ceiling so a stuck connection can't pin a request.
    setTimeout(() => settle({ enabled: true, status: 0, reason: 'timeout' }), 8000)
  })
}

export function isApnsConfigured(): boolean {
  return readConfig() !== null
}
