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
  if (node.type === 'infoPanel' && node.attrs?.body && typeof node.attrs.body === 'object') {
    if (walkAndReplaceText(node.attrs.body, oldText, newText)) changed = true
  }
  return changed
}

async function fixSlug(slug: string, oldText: string, newText: string) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  const changed = walkAndReplaceText(body, oldText, newText)
  if (!changed) { console.log(slug + ': text not found'); return }
  await prisma.tutorial.update({ where: { id: t.id }, data: { body, voiceRetrofittedAt: new Date() } })
  console.log(slug + ': UPDATED')
}

async function main() {
  // throwing-a-small-teapot-stoneware — grade 11.7 (high syllable density from "decoration", "distinguish", "visually")
  await fixSlug(
    'throwing-a-small-teapot-stoneware',
    'Two-glaze decoration: glaze the body in one colour and the lid in a contrasting colour to distinguish them visually.',
    'Two-glaze finish: glaze the body in one colour and the lid in a different colour to tell them apart.'
  )

  // throwing-a-stoneware-casserole-dish — grade 12.0 (long sentence with "separately", "gallery")
  await fixSlug(
    'throwing-a-stoneware-casserole-dish',
    'Fire the lid propped slightly open or separately on its own shelf to avoid any risk of glaze binding the flange to the gallery during the firing.',
    'Fire the lid on its own shelf, propped open a little, to stop glaze from sticking the flange to the gallery.'
  )

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
