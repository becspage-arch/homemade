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
  const t = await prisma.tutorial.findFirst({
    where: {
      category: { slug: 'needlework' },
      OR: [
        { slug: { contains: 'alphabet' } },
        { title: { contains: 'alphabet', mode: 'insensitive' } },
      ],
    },
    select: { slug: true, title: true, body: true, subtitle: true, excerpt: true },
  })
  if (!t) { console.log('not found'); return }
  console.log(`SLUG: ${t.slug}`)
  console.log(`TITLE: ${t.title}`)
  console.log(`STATUS: ${t.status}`)
  console.log(`SUMMARY: ${t.summary}`)
  console.log(`\nBODY:`)
  console.log(JSON.stringify(t.body, null, 2))
}
main().catch((e) => { console.error(e); process.exit(1) })
