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

function stripEmDashes(node: any): any {
  if (Array.isArray(node)) return node.map(stripEmDashes)
  if (node && typeof node === 'object') {
    const copy: any = { ...node }
    if (typeof copy.text === 'string') {
      copy.text = copy.text
        // Sentence-joining em dash → full stop + space (most common case)
        .replace(/\s+—\s+/g, '. ')
        // Em dash at sentence start → drop
        .replace(/^—\s+/g, '')
        // Stray em dashes inside text → comma
        .replace(/—/g, ',')
        // En dash same treatment
        .replace(/\s+–\s+/g, '. ')
        .replace(/–/g, ',')
        // Fix any double spaces / period+period that result
        .replace(/\.\s+\./g, '.')
        .replace(/\s{2,}/g, ' ')
    }
    if (copy.content) copy.content = stripEmDashes(copy.content)
    if (copy.attrs) copy.attrs = stripEmDashes(copy.attrs)
    return copy
  }
  return node
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const slugs = [
    'cross-stitch-alphabet-sampler-border',
    'crochet-magic-ring',
    'granny-square-basic-three-round',
  ]
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, body: true },
    })
    if (!t) {
      console.log(`SKIP ${slug} — not found`)
      continue
    }
    // strip em dashes from body (not chart definitions; those are JSON inside attrs that may have legitimate em dashes in finished-size-text and similar — but the simplest thing is to strip everywhere; the chart caption already uses an em dash, fix it)
    const newBody = stripEmDashes(t.body)
    // Also strip from title
    const newTitle = (t.title || '').replace(/\s+—\s+/g, ': ').replace(/—/g, ',').replace(/\s{2,}/g, ' ').trim()
    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body: newBody, ...(newTitle !== t.title ? { title: newTitle } : {}) },
    })
    console.log(`Fixed ${slug}`)
    if (newTitle !== t.title) console.log(`  title: "${t.title}" → "${newTitle}"`)
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
