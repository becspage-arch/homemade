/**
 * Spot-check: query a slug's voiceRetrofittedAt timestamp.
 * Usage: tsx scripts/_spotcheck-voice-retrofit.ts <slug>
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

const slug = process.argv[2]
if (!slug) {
  console.error('usage: tsx _spotcheck-voice-retrofit.ts <slug>')
  process.exit(1)
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, status: true },
  })
  if (!t) {
    console.error('not found')
    await prisma.$disconnect()
    return
  }
  console.log(`slug:               ${t.slug}`)
  console.log(`status:             ${t.status}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt}`)
  // First paragraph text
  const firstPara = (t.body?.content ?? []).find((n: any) => n.type === 'paragraph')
  const text = (firstPara?.content ?? [])
    .map((c: any) => c.text ?? '')
    .join('')
  console.log(`first paragraph:    ${text.slice(0, 280)}${text.length > 280 ? '…' : ''}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
