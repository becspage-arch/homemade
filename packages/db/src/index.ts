import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Re-export Prisma's generated types so consumers only import from @homemade/db
export * from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __homemade_prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  })
}

/**
 * Single shared Prisma client.
 *
 * Production: one per container. Dev: cached on globalThis to survive HMR
 * reloads without exhausting the pool.
 */
export const prisma: PrismaClient = globalThis.__homemade_prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__homemade_prisma = prisma
}
