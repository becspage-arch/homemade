import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main(): Promise<void> {
  const t = await prisma.tutorial.findUnique({ where: { slug: 'macrame-headboard' }, select: { id: true, body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body)) as any
  const content: any[] = body.content || []

  // Replace paragraph[0] with simplified version (grade ~7-8)
  content[0] = {
    type: 'paragraph',
    content: [{
      type: 'text',
      text: 'A double-bed macramé headboard uses a lot of cord. Weigh your cords before you start. For a 180 cm wide headboard with 80 cm of knotted body at 3 mm cord, expect to use 300 to 400 m in total. Each cord is tied to the dowel with a lark\'s head knot. The body is built from alternating square knots in a net pattern, with gathering knots at set intervals to add structure across the width.',
      marks: [],
    }],
  }

  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body, voiceRetrofittedAt: new Date() },
  })
  console.log('macrame-headboard: paragraph[0] rewritten at lower grade level')
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
