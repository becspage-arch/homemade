import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Re-export Prisma's generated types so consumers only import from @homemade/db
export * from '@prisma/client'

// R2 uploader for scripts that work this package directly.
export { r2Upload } from './r2'

// Category visibility helper — used by every publish path so a category
// flips to publicly visible the moment it crosses the threshold.
export {
  maybeFlipCategoryVisibility,
  PUBLIC_VISIBILITY_THRESHOLD,
} from './category-visibility'

// Category pipeline-status helper — flips a category's pipelineStatus to
// COMPLETE once its PUBLISHED count reaches targetTutorialCount. Paired
// with maybeFlipCategoryVisibility on every publish path.
export { maybeFlipCategoryPipelineComplete } from './category-pipeline-status'

declare global {
  // eslint-disable-next-line no-var
  var __homemade_prisma: PrismaClient | undefined
}

let cached: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (cached) return cached
  if (globalThis.__homemade_prisma) {
    cached = globalThis.__homemade_prisma
    return cached
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Make sure the env var is configured before any Prisma operation.',
    )
  }

  const adapter = new PrismaPg({ connectionString })
  cached = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__homemade_prisma = cached
  }

  return cached
}

/**
 * Lazy-proxied Prisma client.
 *
 * The actual `PrismaClient` is only constructed on first property access. This
 * lets `apps/web` import `prisma` from `@homemade/db` during the build pass
 * (when Next.js collects page configs) without DATABASE_URL having to be set.
 * It also keeps the dev-mode singleton behaviour: in non-prod, the client is
 * cached on `globalThis` so HMR reloads don't exhaust the pool.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
