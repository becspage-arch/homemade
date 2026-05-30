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

async function fixSlug(slug: string, fixes: Array<[string, string]>) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  let anyChanged = false
  for (const [oldText, newText] of fixes) {
    const changed = walkAndReplaceText(body, oldText, newText)
    if (!changed) console.log(slug + ': text not found: "' + oldText.slice(0, 60) + '..."')
    if (changed) anyChanged = true
  }
  if (!anyChanged) { console.log(slug + ': no changes'); return }
  await prisma.tutorial.update({ where: { id: t.id }, data: { body, voiceRetrofittedAt: new Date() } })
  console.log(slug + ': UPDATED')
}

async function main() {
  // throwing-a-teapot-lid-stoneware — grade 11.1
  // Text split around glossaryTooltip; only fix the third text node " together on a level surface..."
  await fixSlug('throwing-a-teapot-lid-stoneware', [
    [
      ' together on a level surface before bisque firing.',
      ' on a flat surface before bisque firing.'
    ],
  ])

  // saggar-firing-basics — grade 11.7
  // "Combustible" (4 syl) → "Burnable" (3); "materials" (4 syl) → "items" (2)
  await fixSlug('saggar-firing-basics', [
    [
      'Combustible packing materials:',
      'Burnable packing items:'
    ],
  ])

  // wood-ash-glaze-surface-decoration — grade 11.3
  // Sentences 1 and 3 are too complex
  await fixSlug('wood-ash-glaze-surface-decoration', [
    [
      'Wood ash application suits functional stoneware where a natural, irregular surface is desirable.',
      'Wood ash works well on functional stoneware where a natural, uneven surface is the goal.'
    ],
    [
      'Each piece fires differently, depending on the ash type, clay body, temperature, and kiln placement.',
      'Each piece fires in its own way, based on the ash type, clay body, heat, and kiln position.'
    ],
  ])

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
