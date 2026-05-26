/**
 * One-off: update title (borodinsky-rye) and yieldDescription
 * (bourbon-biscuits) and re-apply subtitle (how-embodiment-works)
 * to remove pre-existing em / en dashes left over from earlier
 * authoring runs. The batch apply script does not write title or
 * yieldDescription, so this script patches them directly.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let i = 0; i < 8; i++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const dir = resolve(__dirname, '../../../docs/voice-retrofit-2026-05-26-batch17')

  const borodinsky = JSON.parse(readFileSync(resolve(dir, 'borodinsky-rye.json'), 'utf8'))
  const bourbon = JSON.parse(readFileSync(resolve(dir, 'bourbon-biscuits.json'), 'utf8'))
  const embodiment = JSON.parse(readFileSync(resolve(dir, 'how-embodiment-works.json'), 'utf8'))

  await prisma.tutorial.update({ where: { slug: 'borodinsky-rye' }, data: { title: borodinsky.title } })
  console.log('borodinsky-rye title ->', borodinsky.title)

  const bourbonYield = bourbon.yieldDescription ?? bourbon.recipe?.yieldDescription
  await prisma.tutorial.update({ where: { slug: 'bourbon-biscuits' }, data: { yieldDescription: bourbonYield } })
  console.log('bourbon-biscuits yieldDescription ->', bourbonYield)

  await prisma.tutorial.update({ where: { slug: 'how-embodiment-works' }, data: { subtitle: embodiment.subtitle } })
  console.log('how-embodiment-works subtitle ->', embodiment.subtitle)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
