import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}
import { prisma } from '../src/index.js'

async function main() {
  const slug = process.argv[2]!
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  const content = body.content ?? []
  const n21 = content[21]
  if (!n21) { console.log('no node at 21'); return }
  console.log('type:', n21.type)
  console.log('attrs.body type:', typeof n21.attrs?.body)
  console.log('attrs.body is string?', typeof n21.attrs?.body === 'string')
  if (typeof n21.attrs?.body === 'object') {
    console.log('attrs.body keys:', Object.keys(n21.attrs.body))
    console.log('attrs.body.type:', n21.attrs.body.type)
  }
  console.log('first 300 chars:', typeof n21.attrs?.body === 'string'
    ? (n21.attrs.body as string).slice(0, 300)
    : JSON.stringify(n21.attrs?.body).slice(0, 300))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
