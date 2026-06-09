import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const row = await prisma.autopilotHaltSignal.create({
    data: {
      stream: 'queue',
      reason: 'MODEL_MISMATCH_OPUS',
      detail: 'autopilot-queue-extra fired on Claude Opus 4.7 (1M context) at 2026-05-28T20:25Z — secondary routine picked pottery-ceramics (82/500, lastRun 2026-05-21) and claimed slot at 2026-05-28T20:25:15Z, then halted before drafting. feedback_model_choice.md mandates Sonnet for bulk authoring (40-50 entries x 700-3200 words each); Opus reserved for orchestrator/tech/anchor batches. Same pattern as prior queue halt (_halt-queue-extra-opus.ts on natural-home). Slot claim stands so the next fire round-robins to a different category. Action for Rebecca: either reconfigure autopilot-queue-extra to fire on Sonnet, or accept Opus runs and remove the model gate from feedback_model_choice.md / SKILL.md.',
    },
  })
  console.log(`HALT: ${row.id} stream=${row.stream} reason=${row.reason}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
