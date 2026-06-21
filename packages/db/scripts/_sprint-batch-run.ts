/**
 * Reusable sprint batch runner: voice-check then upload a batch directory.
 *
 *   pnpm --filter @homemade/db exec tsx scripts/_sprint-batch-run.ts <batchDirName> [--vc-only]
 *
 * batchDirName is relative to scripts/batches/ (e.g. sprint-worker-1-batch-33).
 * Voice-checks every *.json; only uploads (PUBLISHED) the files that pass.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
const batchName = process.argv[2];
const vcOnly = process.argv.includes('--vc-only');
if (!batchName) { console.error('usage: _sprint-batch-run.ts <batchDirName> [--vc-only]'); process.exit(1); }
const BATCH_DIR = resolve(__dirname, 'batches', batchName);

const env = { ...process.env, PATH: process.env.PATH + ';' + (process.env.APPDATA || '') + '/npm' };
const fwd = (p: string) => p.replace(/\\/g, '/');
function run(script: string, args: string[]) {
  return spawnSync('pnpm', ['--filter', '@homemade/db', 'exec', 'tsx', script, ...args],
    { cwd: repoRoot, encoding: 'utf8', timeout: 90000, env, shell: true });
}

const files = readdirSync(BATCH_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort();
console.log(`Batch ${batchName}: ${files.length} files\n`);

const vcPass: string[] = [], vcFail: string[] = [];
const vcDetail: Record<string, string> = {};
for (const f of files) {
  const slug = f.replace('.json', '');
  const r = run('scripts/voice-check.ts', [fwd(resolve(BATCH_DIR, f))]);
  if (r.status === 0) { vcPass.push(slug); process.stdout.write('.'); }
  else { vcFail.push(slug); vcDetail[slug] = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => l.trim()).slice(-18).join('\n'); process.stdout.write('F'); }
}
console.log(`\n\nVOICE-CHECK: ${vcPass.length} pass, ${vcFail.length} fail`);
for (const slug of vcFail) { console.log(`\n=== VC FAIL ${slug} ===\n${vcDetail[slug]}`); }

if (vcOnly) process.exit(vcFail.length ? 1 : 0);

const upPass: string[] = [], upFail: string[] = [];
const upDetail: Record<string, string> = {};
console.log('\nUploading voice-check passers as PUBLISHED...\n');
for (const slug of vcPass) {
  const r = run('scripts/upload-tutorial.ts', [fwd(resolve(BATCH_DIR, slug + '.json')), '--status', 'PUBLISHED']);
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0 || out.includes('PUBLISHED')) { upPass.push(slug); process.stdout.write('.'); }
  else { upFail.push(slug); upDetail[slug] = out.split('\n').filter(l => l.trim()).slice(-8).join('\n'); process.stdout.write('F'); }
}
console.log(`\n\nUPLOAD: ${upPass.length} pass, ${upFail.length} fail`);
for (const slug of upFail) { console.log(`\n=== UPLOAD FAIL ${slug} ===\n${upDetail[slug]}`); }
console.log(`\nDONE ${batchName}: ${upPass.length}/${files.length} published`);
