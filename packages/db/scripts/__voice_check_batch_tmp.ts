import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const BRIEFS_DIR = resolve(import.meta.dirname, '../../../docs/herbal-bulk-003-briefs');
const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json')).sort();

const pass: string[] = [];
const fail: string[] = [];
const failDetails: Record<string, string> = {};

for (const f of files) {
  const filePath = resolve(BRIEFS_DIR, f);
  const slug = f.replace('.json', '');

  // Run voice-check via pnpm exec (using this same process's cwd)
  const result = spawnSync(
    'pnpm',
    ['--filter', '@homemade/db', 'exec', 'tsx', 'scripts/voice-check.ts', filePath, '--json'],
    {
      cwd: resolve(import.meta.dirname, '../../..'),
      encoding: 'utf8',
      env: { ...process.env, PATH: process.env.PATH + ';' + (process.env.APPDATA || '') + '/npm' },
    }
  );

  const output = result.stdout + result.stderr;
  if (result.status === 0) {
    pass.push(slug);
    process.stdout.write('.');
  } else {
    fail.push(slug);
    // Extract the JSON output or summary
    const lines = output.split('\n').filter(l => l.trim());
    failDetails[slug] = lines.slice(-20).join('\n');
    process.stdout.write('F');
  }
}

console.log('\n\nSUMMARY: PASS=' + pass.length + ' FAIL=' + fail.length);
if (fail.length > 0) {
  console.log('\nFAILED FILES:');
  for (const slug of fail) {
    console.log('\n=== ' + slug + ' ===');
    console.log(failDetails[slug]);
  }
}
