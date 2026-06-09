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
      detail: 'autopilot-queue-extra fired on Claude Opus 4.7 (1M context) at 2026-05-29T05:25Z — secondary routine picked home-repair (150/800, lastRun 2026-05-28T22:18Z, oldest READY) and claimed slot at 2026-05-29T05:25:34Z, then halted before drafting. Fourth MODEL_MISMATCH_OPUS halt from autopilot-queue-extra (prior: natural-home 19:28Z, pottery-ceramics 20:25Z, sustainability 23:25Z — all 2026-05-28). feedback_model_choice.md mandates Sonnet for bulk authoring; Opus reserved for orchestrator/tech/anchor batches. Pre-flight pass (manual pause, env-pause, no-double-firing, backlog drain, quality drift across bulk-002..004, hard chain cap at 4/10) all clear — only block is the model gate. Slot claim stands so the next fire round-robins to a different category. Action for Rebecca: either reconfigure autopilot-queue-extra to fire on Sonnet, disable this secondary routine until dispatch is fixed, or remove the model gate from feedback_model_choice.md / SKILL.md if Opus runs are now acceptable.',
    },
  })
  console.log(`HALT: ${row.id} stream=${row.stream} reason=${row.reason}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
