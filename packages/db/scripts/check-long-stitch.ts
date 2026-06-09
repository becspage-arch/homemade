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
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'long-stitch-on-wooden-boards' },
    select: {
      slug: true, title: true, status: true, type: true,
      publishedAt: true, createdAt: true, updatedAt: true,
      voiceRetrofittedAt: true,
      revisedFrom: true,
      body: true,
      subtitle: true, excerpt: true,
    },
  })
  if (!t) { console.log('not found'); return }
  console.log('slug:', t.slug)
  console.log('title:', t.title)
  console.log('type:', t.type, '| status:', t.status)
  console.log('createdAt:    ', t.createdAt)
  console.log('publishedAt:  ', t.publishedAt)
  console.log('updatedAt:    ', t.updatedAt)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt || '(null)')
  console.log('revisedFrom set:', t.revisedFrom != null)

  // Show first two paragraphs
  console.log('\nsubtitle:', t.subtitle)
  console.log('excerpt: ', t.excerpt)
  const body = t.body as any
  console.log('\nFirst 2 body paragraphs:')
  let pCount = 0
  for (const n of body?.content || []) {
    if (n.type === 'paragraph' && pCount < 2) {
      const text = (n.content || []).map((c: any) => c.text || '').join('')
      console.log(`  [${pCount + 1}] ${text}`)
      pCount++
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
