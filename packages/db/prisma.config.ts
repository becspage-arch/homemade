import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
// Migrations use DIRECT_URL (non-pooled) to avoid pgbouncer holding session-level advisory locks.
// Runtime app continues to use DATABASE_URL (pooled).
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

// Datasource + migrations config is only needed for `prisma migrate` / `db push`.
// `prisma generate` can run without it (in the Docker build, for example).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(migrationUrl && {
    datasource: { url: migrationUrl },
    migrations: {
      adapter: async () => new PrismaPg({ connectionString: migrationUrl }),
    },
  }),
})
