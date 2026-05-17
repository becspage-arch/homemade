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

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const stream = arg('--stream') ?? 'queue'
  const reason = arg('--reason')
  const detail = arg('--detail') ?? null
  const flipSlug = arg('--flip-category')
  const flipStatus = arg('--flip-status') ?? 'NOT_READY'

  if (!reason) {
    console.error('usage: --stream queue --reason REASON --detail "..." [--flip-category <slug> --flip-status NOT_READY|PAUSED|COMPLETE]')
    process.exit(2)
  }

  if (flipSlug) {
    const cat = await prisma.category.findUnique({ where: { slug: flipSlug } })
    if (!cat) {
      console.error(`Category not found: ${flipSlug}`)
      process.exit(2)
    }
    await prisma.category.update({
      where: { id: cat.id },
      data: { pipelineStatus: flipStatus as any },
    })
    console.log(`[flip] ${flipSlug}: pipelineStatus -> ${flipStatus}`)
  }

  const row = await prisma.autopilotHaltSignal.create({
    data: { stream, reason, detail },
  })
  console.log(`[halt] wrote ${row.id} stream=${row.stream} reason=${row.reason}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
