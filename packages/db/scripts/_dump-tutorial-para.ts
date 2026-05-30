import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

const { prisma } = await import('../src/index.js')
const slug = process.argv.find(a => !a.startsWith('-') && !a.includes('/') && !a.includes('\') && a !== 'tsx') || ''
const t = await prisma.tutorial.findUnique({ where: { slug }, select: { slug: true, title: true, body: true } })
if (!t) { console.log('NOT FOUND'); process.exit(1) }
console.log('TITLE:', t.title)
const body = t.body as any
const paras = body?.content?.filter((n: any) => n.type === 'paragraph') || []
paras.slice(0, 8).forEach((p: any, i: number) => {
  const text = p.content?.map((n: any) => n.text || '').join('') || ''
  if (text.trim()) console.log(`\n[para ${i}]: ${text.slice(0,500)}`)
})
await prisma.$disconnect()
