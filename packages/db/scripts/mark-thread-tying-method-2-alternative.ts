/**
 * Mark the second method on the "Start and end a thread cleanly"
 * tutorial as `numberingScope: 'alternative'`.
 *
 * Phase location_climate_paper_001 — Part 7 calibration. Confirms the
 * renderer's "Method N (alternative)" header fires correctly.
 *
 * Walks the tutorial body once, counts orderedList nodes, sets
 * `numberingScope: 'alternative'` on the second one. Idempotent — if
 * the second orderedList already carries that value the script reports
 * "unchanged" and exits clean.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/mark-thread-tying-method-2-alternative.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/mark-thread-tying-method-2-alternative.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

const TUTORIAL_SLUG = 'start-and-end-a-thread-cleanly'
const DRY_RUN = process.argv.includes('--dry-run')

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const tutorial = await prisma.tutorial.findUnique({
    where: { slug: TUTORIAL_SLUG },
    select: { id: true, slug: true, body: true },
  })
  if (!tutorial) {
    console.error(`[mark-method-2] tutorial '${TUTORIAL_SLUG}' not found`)
    process.exit(1)
  }

  const body = tutorial.body as { content?: TipTapNode[] } | null
  if (!body || !Array.isArray(body.content)) {
    console.error(`[mark-method-2] tutorial '${TUTORIAL_SLUG}' has no body content`)
    process.exit(1)
  }

  const orderedListIndices: number[] = []
  body.content.forEach((node, i) => {
    if (node.type === 'orderedList') orderedListIndices.push(i)
  })

  if (orderedListIndices.length < 2) {
    console.error(
      `[mark-method-2] tutorial '${TUTORIAL_SLUG}' has only ${orderedListIndices.length} orderedList(s); expected at least 2`,
    )
    process.exit(1)
  }

  const secondIdx = orderedListIndices[1]!
  const secondNode = body.content[secondIdx] as TipTapNode
  const currentScope = (secondNode.attrs as { numberingScope?: string } | undefined)?.numberingScope

  if (currentScope === 'alternative') {
    console.log(`[mark-method-2] already 'alternative' — no change`)
    await prisma.$disconnect()
    return
  }

  secondNode.attrs = { ...(secondNode.attrs ?? {}), numberingScope: 'alternative' }

  if (DRY_RUN) {
    console.log(
      `[mark-method-2] would set second orderedList (index ${secondIdx}) to 'alternative' (dry-run)`,
    )
    await prisma.$disconnect()
    return
  }

  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data: { body: body as unknown as object },
  })

  console.log(
    `[mark-method-2] ~ ${TUTORIAL_SLUG} :: second orderedList (index ${secondIdx}) set to 'alternative'`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[mark-method-2] failed:', err)
  process.exit(1)
})
