export const meta = {
  name: 'cooking-baking-hero-regen-batched',
  description: 'Regenerate+verify+commit cooking/baking heroes, a few chunk-workers at a time (gentle on the machine)',
  phases: [{ title: 'Regenerate', detail: 'small batches of chunk-workers, sequential' }],
}

const CHUNKS = args && args.chunks ? args.chunks : 2
const BATCH = args && args.batch ? args.batch : 2
const DB = 'cd C:/Users/Rebecca/Projects/code/homemade/packages/db && PATH="$PATH:$HOME/AppData/Roaming/npm"'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run/chunks'

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    chunk: { type: 'number' }, generated: { type: 'number' }, passed: { type: 'number' },
    failed: { type: 'number' }, committed: { type: 'number' }, billingLocked: { type: 'boolean' }, note: { type: 'string' },
  },
  required: ['chunk', 'committed', 'billingLocked'],
}

function pad(n) { return String(n).padStart(3, '0') }

function promptFor(i) {
  const P = pad(i)
  return [
    `You are processing chunk ${i} of a recipe-hero regeneration job. Chunk folder: ${RUN}/${P}`,
    ``,
    `STEP 1 — generate (idempotent; skips images already made). Run and wait:`,
    `${DB} npx tsx scripts/_chunk-gen.ts --chunk ${i}`,
    `If output contains "BILLING_LOCKED", STOP and return {chunk:${i}, committed:0, billingLocked:true, note:"billing"}.`,
    ``,
    `STEP 2 — verify. Read ${RUN}/${P}/manifest.json (array of {idx, genFile, title}; entries with an "error" field have no image — skip). For EACH entry with a genFile, use Read to LOOK at ${RUN}/${P}/gen/<genFile> and judge strictly whether it accurately and appetisingly depicts the dish named by "title".`,
    `  PASS = clearly that dish, good food photo, no text/logo/watermark, no bad AI artefacts.`,
    `  FAIL = wrong dish, missing key components, text/logo, or distracting artefacts.`,
    ``,
    `STEP 3 — Write ${RUN}/${P}/verify.json as a JSON array: [{"genFile":"g_0.jpg","verdict":"PASS"}, ...] covering every genFile.`,
    ``,
    `STEP 4 — commit. Run and wait:`,
    `${DB} npx tsx scripts/_chunk-commit.ts --chunk ${i}`,
    `Last line: "chunk ${P}: committed=X skipped=Y notPass=Z missing=W error=E".`,
    ``,
    `Return: chunk=${i}, generated=#verified, passed=#PASS, failed=#FAIL, committed=X, billingLocked=false. Short note.`,
  ].join('\n')
}

let committed = 0, passed = 0, failed = 0, billing = 0, reported = 0
for (let start = 0; start < CHUNKS; start += BATCH) {
  const batch = []
  for (let i = start; i < Math.min(start + BATCH, CHUNKS); i++) batch.push(i)
  const res = await parallel(batch.map((i) => () => agent(promptFor(i), { label: `chunk_${pad(i)}`, phase: 'Regenerate', schema: SCHEMA })))
  for (const r of res.filter(Boolean)) {
    reported++; committed += r.committed || 0; passed += r.passed || 0; failed += r.failed || 0; if (r.billingLocked) billing++
  }
  log(`batch ${start}-${start + batch.length - 1}: cumulative committed=${committed} passed=${passed} failed=${failed} billingLockedChunks=${billing}`)
  if (billing > 0) { log('BILLING LOCKED — stopping. Top up fal then re-run to resume.'); break }
}
return { reported, totalChunks: CHUNKS, committed, passed, failed, billingLockedChunks: billing }
