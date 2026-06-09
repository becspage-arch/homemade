/**
 * Batch upload for herbal-bulk-003-briefs
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = resolve(__dirname, '../../../docs/herbal-bulk-003-briefs');

const files = readdirSync(BRIEFS_DIR)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .sort();

console.log(`Uploading ${files.length} files...\n`);

const pass: string[] = [];
const fail: string[] = [];
const failDetails: Record<string, string> = {};

for (const f of files) {
  const slug = f.replace('.json', '');
  const filePath = resolve(BRIEFS_DIR, f);

  const result = spawnSync(
    'pnpm',
    ['--filter', '@homemade/db', 'exec', 'tsx', 'scripts/upload-tutorial.ts', filePath, '--status', 'PUBLISHED'],
    {
      cwd: resolve(__dirname, '../../..'),
      encoding: 'utf8',
      timeout: 60000,
      env: {
        ...process.env,
        PATH: process.env.PATH + ';' + (process.env.APPDATA || '') + '/npm',
      },
    }
  );

  const output = result.stdout + result.stderr;
  const lines = output.split('\n').filter(l => l.trim() && !l.includes('injected env') && !l.includes('SSL') && !l.includes('Warning:') && !l.includes('To prepare'));

  if (result.status === 0 || output.includes('PUBLISHED') || output.includes('status: PUBLISHED') || output.includes('"status":"PUBLISHED"')) {
    pass.push(slug);
    process.stdout.write('.');
  } else {
    fail.push(slug);
    failDetails[slug] = lines.slice(-5).join('\n');
    process.stdout.write('F');
    console.log('\nFAIL: ' + slug);
    console.log(failDetails[slug]);
  }
}

console.log(`\n\nUPLOAD SUMMARY: ${pass.length} PASS, ${fail.length} FAIL`);
if (fail.length > 0) {
  console.log('\nFailed:');
  for (const slug of fail) {
    console.log('  ' + slug + ':');
    console.log('  ' + (failDetails[slug] || 'no detail'));
  }
}
