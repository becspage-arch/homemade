import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

// Datasource + migrations config is only needed for `prisma migrate` / `db push`.
// `prisma generate` can run without it (in the Docker build, for example).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(connectionString && {
    datasource: { url: connectionString },
    migrations: {
      adapter: async () => new PrismaPg({ connectionString }),
    },
  }),
})
