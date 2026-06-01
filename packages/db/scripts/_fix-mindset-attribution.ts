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

const OLD_TEXT = 'Gary Craig developed EFT in the 1990s. Script original to homemade.education.'
const NEW_TEXT = 'Gary Craig made EFT in the 1990s. This script is from homemade.education.'

async function main() {
  const slugs = ['tapping-for-hosting-anxiety', 'tapping-for-the-wait-for-apology-trap']
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
    if (!t) { console.log(`NOT FOUND: ${slug}`); continue }
    const body = t.body as any
    const nodes = body?.content ?? []
    const node = nodes[11]
    if (!node || node.type !== 'paragraph') {
      console.log(`${slug}: node[11] is not a paragraph (${node?.type})`)
      continue
    }
    const textNode = node.content?.[0]
    if (!textNode || textNode.text !== OLD_TEXT) {
      console.log(`${slug}: node[11] text does not match: "${textNode?.text?.substring(0, 60)}..."`)
      continue
    }
    // Apply fix
    textNode.text = NEW_TEXT
    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body, voiceRetrofittedAt: new Date() }
    })
    console.log(`FIXED: ${slug} — attribution simplified`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
