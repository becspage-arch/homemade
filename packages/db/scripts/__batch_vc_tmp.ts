/**
 * Batch voice-check runner for herbal-bulk-003-briefs
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runVoiceCheck, exitCodeFor, formatReport } from './voice-check-lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = resolve(__dirname, '../../../docs/herbal-bulk-003-briefs');

const files = readdirSync(BRIEFS_DIR)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .sort();

const pass: string[] = [];
const fail: Array<{slug: string; report: string}> = [];
const warn: string[] = [];

for (const f of files) {
  const slug = f.replace('.json', '');
  const content = readFileSync(resolve(BRIEFS_DIR, f), 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    fail.push({ slug, report: 'JSON parse error: ' + String(e) });
    continue;
  }

  const input = parsed as { body?: unknown; [k: string]: unknown };
  const body = input.body ?? input;

  const report = runVoiceCheck(body as Parameters<typeof runVoiceCheck>[0]);
  const code = exitCodeFor(report);
  const formatted = formatReport(report, slug);

  if (code === 0) {
    pass.push(slug);
  } else if (code === 1) {
    warn.push(slug);
    pass.push(slug); // warnings don't block
  } else {
    fail.push({ slug, report: formatted });
  }
}

console.log(`\nBATCH VOICE-CHECK: ${files.length} files`);
console.log(`PASS (clean): ${pass.length - warn.length}`);
console.log(`PASS (warnings only): ${warn.length}`);
console.log(`FAIL: ${fail.length}\n`);

if (fail.length > 0) {
  console.log('=== FAILED FILES ===\n');
  for (const { slug, report } of fail) {
    console.log(`--- ${slug} ---`);
    console.log(report);
    console.log();
  }
}
