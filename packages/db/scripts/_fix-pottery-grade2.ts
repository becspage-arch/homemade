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
    if (!changed) console.log(slug + ': text not found: ' + oldText.slice(0, 60) + '...')
    if (changed) anyChanged = true
  }
  if (!anyChanged) { console.log(slug + ': no changes'); return }
  await prisma.tutorial.update({ where: { id: t.id }, data: { body, voiceRetrofittedAt: new Date() } })
  console.log(slug + ': UPDATED')
}

async function main() {
  // throwing-a-cylindrical-candle-holder — bulletList[18] listItem[1] grade 11.8
  // "exterior" (4 syllables) → "outside"; "surface interest" → "a pattern"
  await fixSlug('throwing-a-cylindrical-candle-holder', [
    [
      'Textured exterior: press a wooden stamp or fabric into the leather-hard wall before trimming to add surface interest.',
      'Textured outside: press a wooden stamp or fabric into the leather-hard wall before trimming to add a pattern.'
    ],
  ])

  // throwing-a-set-of-matching-soup-bowls — paragraph[14] grade 11.8
  // Long compound hyphenated words "microwave-safe", "dishwasher-safe", "non-crazing"
  await fixSlug('throwing-a-set-of-matching-soup-bowls', [
    [
      'Cone 6 stoneware with a food-safe glaze is microwave-safe and dishwasher-safe once the glaze is verified as non-crazing.',
      'Cone 6 stoneware with a food-safe glaze is safe in a microwave and dishwasher once the glaze is checked for crazing.'
    ],
  ])

  // throwing-matched-nested-bowl-set — bulletList[18] listItem[2] grade 12.0
  // "versatility" (5 syllables) → "more uses"
  await fixSlug('throwing-matched-nested-bowl-set', [
    [
      'with a pouring lip added at leather-hard for versatility',
      'with a pouring lip added at leather-hard for more uses'
    ],
  ])

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
