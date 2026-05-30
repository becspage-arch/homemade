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

async function main() {
  const tutorial = await prisma.tutorial.findUnique({
    where: { slug: 'rose-sachet' },
    select: { id: true, body: true },
  })
  if (!tutorial?.body) { console.log('Not found'); return }

  const body = JSON.parse(JSON.stringify(tutorial.body)) as any
  // paragraph[0] is body.content[0]
  const para = body.content[0]
  if (!para || para.type !== 'paragraph') { console.log('Not a paragraph at [0]:', para?.type); return }

  // Remove the em-dash by using a period+sentence break instead
  para.content = [{
    type: 'text',
    text: 'Dried rose petals give the sachet its scent and look. Orris root powder acts as a fixative. It holds the aromatic oils in the petals and lets them out slowly. Together they keep the sachet fragrant for months rather than weeks. Rose geranium oil adds strength and staying power to the rose scent.',
  }]

  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data: { body, voiceRetrofittedAt: new Date() },
  })
  console.log('Fixed rose-sachet paragraph[0] — removed em-dash')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
