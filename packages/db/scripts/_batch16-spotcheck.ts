import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: 'mishima-inlay-on-air-dry-clay' },
    select: { slug: true, voiceRetrofittedAt: true, body: true },
  })
  if (!t) { console.log('not found'); return }
  console.log('slug:', t.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString?.() ?? t.voiceRetrofittedAt)
  const p0 = (t.body as any).content[0]
  const text = (p0.content ?? []).map((c: any) => c.text ?? '').join('')
  console.log('first paragraph:')
  console.log(text)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
