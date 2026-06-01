/**
 * Dump every herbal-medicine PUBLISHED tutorial's title + type + excerpt
 * + current first paragraph, in slug order, so the hand-author pass for
 * Part 7b can read the context for each opening.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
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
}

import { prisma } from '../src'

function txt(node: unknown): string {
  const n = node as { text?: string; content?: unknown[] }
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(txt).join('')
  return ''
}

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', category: { slug: 'herbal-medicine' } },
    select: {
      slug: true,
      title: true,
      type: true,
      excerpt: true,
      subtitle: true,
      body: true,
      yieldDescription: true,
      timeMinutes: true,
    },
    orderBy: { slug: 'asc' },
  })
  const lines: string[] = []
  for (const t of tutorials) {
    const body = t.body as { content?: Array<{ type?: string; content?: unknown[] }> } | null
    const firstPara = body?.content?.find((n) => n.type === 'paragraph')
    lines.push(`=== ${t.slug} (${t.type}) ===`)
    lines.push(`TITLE: ${t.title}`)
    if (t.subtitle) lines.push(`SUBTITLE: ${t.subtitle}`)
    lines.push(`EXCERPT: ${(t.excerpt ?? '').slice(0, 350)}`)
    if (t.timeMinutes) lines.push(`TIME_MINUTES: ${t.timeMinutes}`)
    if (t.yieldDescription) lines.push(`YIELD: ${t.yieldDescription}`)
    lines.push(`FIRST_PARA: ${txt(firstPara).slice(0, 500)}`)
    lines.push('')
  }
  const outPath = resolve(__dirname, '../../../docs/_herbal-42-dump.txt')
  writeFileSync(outPath, lines.join('\n'), 'utf8')
  console.log(`wrote ${outPath}`)
  console.log(`tutorials dumped: ${tutorials.length}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
