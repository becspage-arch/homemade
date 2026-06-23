export const meta = {
  name: 'xstitch-tutorial-hero-regen',
  description: 'Regenerate unique cross-stitch tutorial heroes (Flux Pro), verify, commit — a few workers at a time',
  phases: [{ title: 'Regenerate', detail: 'one agent per chunk: generate, verify, commit' }],
}
const CHUNKS = args && args.chunks ? args.chunks : 1
const BATCH = args && args.batch ? args.batch : 1
const DB = 'cd C:/Users/Rebecca/Projects/code/homemade/packages/db && PATH="$PATH:$HOME/AppData/Roaming/npm"'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-xstitch/chunks'
const SCHEMA = { type: 'object', additionalProperties: false, properties: { chunk: { type: 'number' }, generated: { type: 'number' }, passed: { type: 'number' }, failed: { type: 'number' }, committed: { type: 'number' }, billingLocked: { type: 'boolean' }, note: { type: 'string' } }, required: ['chunk', 'committed', 'billingLocked'] }
function pad(n) { return String(n).padStart(3, '0') }
function promptFor(i) {
  const P = pad(i)
  return [
    `You are processing chunk ${i} of a CROSS-STITCH TUTORIAL hero regeneration. Folder: ${RUN}/${P}`,
    ``,
    `STEP 1 — generate (idempotent). Run and wait:`,
    `${DB} npx tsx scripts/_xstitch-tut-gen.ts --chunk ${i}`,
    `If output contains "BILLING_LOCKED", STOP and return {chunk:${i}, committed:0, billingLocked:true, note:"billing"}.`,
    ``,
    `STEP 2 — verify. Read ${RUN}/${P}/manifest.json (array of {idx, genFile, title}; skip entries with an "error" field). For EACH genFile, Read ${RUN}/${P}/gen/<genFile> and judge:`,
    `  PASS = an attractive, on-brand cross-stitch / embroidery photo (hoop, aida, floss, a piece in progress or finished) that plausibly relates to the tutorial title. It does NOT need to be an instructional diagram — it is a decorative hero. Variety is good.`,
    `  FAIL = not a cross-stitch/embroidery image at all, contains text/logos/printed charts/watermarks, or has obvious AI artefacts (deformed hands, garbled fabric).`,
    ``,
    `STEP 3 — Write ${RUN}/${P}/verify.json as a JSON array: [{"genFile":"g_0.jpg","verdict":"PASS"}, ...] for every genFile.`,
    ``,
    `STEP 4 — commit. Run and wait:`,
    `${DB} npx tsx scripts/_xstitch-tut-commit.ts --chunk ${i}`,
    `Last line: "chunk ${P}: committed=X skipped=Y notPass=Z missing=W error=E".`,
    ``,
    `Return chunk=${i}, generated=#verified, passed=#PASS, failed=#FAIL, committed=X, billingLocked=false.`,
  ].join('\n')
}
let committed = 0, passed = 0, failed = 0, billing = 0, reported = 0
for (let start = 0; start < CHUNKS; start += BATCH) {
  const batch = []
  for (let i = start; i < Math.min(start + BATCH, CHUNKS); i++) batch.push(i)
  const res = await parallel(batch.map((i) => () => agent(promptFor(i), { label: `xs_tut_${pad(i)}`, phase: 'Regenerate', schema: SCHEMA })))
  for (const r of res.filter(Boolean)) { reported++; committed += r.committed || 0; passed += r.passed || 0; failed += r.failed || 0; if (r.billingLocked) billing++ }
  log(`batch ${start}: cumulative committed=${committed} passed=${passed} failed=${failed} billing=${billing}`)
  if (billing > 0) { log('BILLING LOCKED — stopping.'); break }
}
return { reported, committed, passed, failed, billingLockedChunks: billing }
