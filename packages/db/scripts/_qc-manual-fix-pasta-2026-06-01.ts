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
  const t = await prisma.tutorial.findUnique({ where: { slug: 'pasta-aglio-e-olio' }, select: { id: true, body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body)) as any
  const content: any[] = body.content || []

  // body.content[9] is now the orderedList we created. listItem[2] still reads at grade 12.3.
  // Original: "Return to a medium heat and toss vigorously, adding pasta water a few tablespoons at a time until the sauce is glossy and coats the pasta."
  // Simplified: "Set back over medium heat and toss well, adding a splash of pasta water at a time until the sauce clings to the pasta."
  const listNode = content[9]
  if (!listNode || listNode.type !== 'orderedList') {
    console.log('body.content[9] is not orderedList, type: ' + listNode?.type)
    return
  }
  const item = listNode.content[2]
  if (!item) { console.log('listItem[2] not found'); return }
  const para = item.content[0]
  if (!para) { console.log('paragraph not found'); return }

  console.log('Before:', para.content[0]?.text)
  para.content[0].text = 'Set back over medium heat and toss well, adding a splash of pasta water at a time until the sauce clings to the pasta.'
  console.log('After:', para.content[0]?.text)

  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body, voiceRetrofittedAt: new Date() },
  })
  console.log('pasta-aglio-e-olio: step simplified')
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
