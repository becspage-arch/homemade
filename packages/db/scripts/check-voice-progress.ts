import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const rows = await (prisma as any).$queryRaw<any[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE "voiceRetrofittedAt" IS NOT NULL) AS done,
      COUNT(*) FILTER (WHERE "voiceRetrofittedAt" IS NULL) AS todo,
      MAX("voiceRetrofittedAt") AS "lastDoneAt",
      MIN("voiceRetrofittedAt") AS "firstDoneAt"
    FROM "Tutorial"
    WHERE status = 'PUBLISHED'
  `
  const r = rows[0]
  const done = Number(r.done)
  const total = Number(r.total)
  const todo = Number(r.todo)
  console.log(`Done:      ${done} of ${total}  (${Math.round((done / total) * 100)}%)`)
  console.log(`Remaining: ${todo}`)
  console.log(`First retrofit: ${r.firstDoneAt}`)
  console.log(`Last retrofit:  ${r.lastDoneAt}`)
  const batchesLeft = Math.ceil(todo / 50)
  console.log(`Batches of 50 still to go: ${batchesLeft}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
