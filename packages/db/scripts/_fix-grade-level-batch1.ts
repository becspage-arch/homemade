/**
 * Manual grade-level fixes for entries the auto-fixer can't simplify.
 * Each fix rewrites specific high-grade paragraphs to grade 6-8.
 */

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

function walkAndReplaceText(node: any, oldText: string, newText: string): boolean {
  let changed = false
  if (node.type === 'text' && typeof node.text === 'string') {
    if (node.text.includes(oldText)) {
      node.text = node.text.replace(oldText, newText)
      changed = true
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      if (walkAndReplaceText(child, oldText, newText)) changed = true
    }
  }
  // Also walk infoPanel attrs
  if (node.type === 'infoPanel' && node.attrs?.body) {
    if (walkAndReplaceText(node.attrs.body, oldText, newText)) changed = true
  }
  return changed
}

async function fixSlug(slug: string, oldText: string, newText: string) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  const changed = walkAndReplaceText(body, oldText, newText)
  if (!changed) { console.log(slug + ': text not found — no change'); return }
  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body, voiceRetrofittedAt: new Date() }
  })
  console.log(slug + ': UPDATED')
}

async function main() {
  // soy-candle-rose-geranium — paragraph[0] grade 11.3
  // Text is split around a glossaryTooltip; fix each text node separately
  await fixSlug(
    'soy-candle-rose-geranium',
    'True rose essential oil is very expensive and performs poorly in candle wax — most of its scent evaporates during the pour. ',
    'True rose essential oil is very expensive. It performs poorly in candle wax, as most of its scent evaporates during the pour. '
  )
  await fixSlug(
    'soy-candle-rose-geranium',
    ' is the practical choice for candle making: it has a rosy, green-floral scent, holds up better through the wax pour than true rose, and costs far less.',
    ' is the better choice for candles: it has a rosy, green-floral scent, holds up through the pour, and costs far less.'
  )

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
