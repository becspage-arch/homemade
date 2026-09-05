/**
 * Neon-over-WebSocket Prisma adapter, for sessions that can only reach the
 * internet through an HTTP CONNECT proxy.
 *
 * Cloud sessions run on a VM whose only way out is the egress proxy named in
 * HTTPS_PROXY. The normal adapter (`@prisma/adapter-pg`) hands `pg` a raw TCP
 * socket to Neon on 5432; `pg` knows nothing about the proxy, so it hangs.
 * Postgres' own SSLRequest handshake can't be tunnelled either — the proxy
 * re-terminates TLS and expects a ClientHello the moment CONNECT returns.
 *
 * Neon's serverless driver sidesteps all of that: it talks to the same database
 * over a normal `wss://` connection on 443, which the proxy handles like any
 * other HTTPS traffic. `ws` accepts an `agent`, so routing it through
 * `https-proxy-agent` is all the wiring that's needed.
 *
 * This module is only ever loaded when PG_VIA_HTTPS_PROXY=1 and HTTPS_PROXY are
 * both set (see `getPrismaClient()` in ./index.ts). Local development, the ECS
 * task and GitHub Actions never take this path, and never load these packages.
 */
import type { ClientRequestArgs } from 'node:http'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig, type WebSocketConstructor } from '@neondatabase/serverless'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { WebSocket, type ClientOptions } from 'ws'

/**
 * `ws` only exposes proxy support through its per-connection `agent` option,
 * and Neon's driver constructs the socket itself. Subclassing to inject the
 * agent is the documented way to get one in.
 */
function proxiedWebSocketConstructor(proxyUrl: string): WebSocketConstructor {
  return class ProxiedWebSocket extends WebSocket {
    constructor(
      address: string | URL,
      protocols?: string | string[],
      options?: ClientOptions | ClientRequestArgs,
    ) {
      super(address, protocols, {
        ...options,
        agent: new HttpsProxyAgent(proxyUrl),
      })
    }
  }
}

let configured = false

/**
 * Build a Prisma driver adapter that reaches Neon over WebSocket through the
 * given HTTP proxy. The connection string is the ordinary pooled DATABASE_URL —
 * the serverless driver takes the same URL the `pg` adapter does.
 */
export function createNeonProxyAdapter(connectionString: string, proxyUrl: string): PrismaNeon {
  if (!configured) {
    neonConfig.webSocketConstructor = proxiedWebSocketConstructor(proxyUrl)
    configured = true
  }
  return new PrismaNeon({ connectionString })
}
