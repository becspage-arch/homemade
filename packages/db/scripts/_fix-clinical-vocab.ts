/**
 * One-shot manual fix: replace clinical/Latin vocab that qc-fix can't handle mechanically.
 * Run: pnpm --filter @homemade/db exec tsx scripts/_fix-clinical-vocab.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
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

import { prisma } from '../src/index.js'

function walkAndReplace(node: any, replacer: (text: string) => string): boolean {
  let changed = false
  if (node.type === 'text' && node.text) {
    const newText = replacer(node.text)
    if (newText !== node.text) {
      node.text = newText
      changed = true
    }
  }
  if (node.content) {
    for (const child of node.content) {
      if (walkAndReplace(child, replacer)) changed = true
    }
  }
  return changed
}

async function fixSlug(slug: string, replacer: (text: string) => string) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  let changed = false
  for (const node of (body?.content ?? [])) {
    if (walkAndReplace(node, replacer)) changed = true
  }
  if (!changed) { console.log(slug + ': no change needed'); return }
  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body, voiceRetrofittedAt: new Date() }
  })
  console.log(slug + ': UPDATED')
}

async function main() {
  // natural-perfume-oil-roller: maceration → soaking in oil
  await fixSlug('natural-perfume-oil-roller', (text) => {
    return text
      .replace(/\bmaceration\b/gi, 'soaking in oil')
      .replace(/\bmacerate\b/gi, 'soak in oil')
      .replace(/\bmacerated\b/gi, 'soaked in oil')
      .replace(/\bmacerating\b/gi, 'soaking in oil')
  })

  // clary-sage-bergamot-solid-perfume: anhydrous → water-free
  await fixSlug('clary-sage-bergamot-solid-perfume', (text) => {
    return text.replace(/\banhydrous\b/gi, 'water-free')
  })

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
