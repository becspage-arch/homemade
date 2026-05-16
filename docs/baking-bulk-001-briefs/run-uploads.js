const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const briefs = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.json') && !f.includes('fix-emdash') && !f.includes('run-uploads'))
  .sort();

console.log(`Uploading ${briefs.length} briefs...\n`);

let pass = 0;
let fail = 0;
const failed = [];

for (const brief of briefs) {
  const absPath = path.join(__dirname, brief);
  const cmd = `pnpm --filter "@homemade/db" run tutorial:upload "${absPath}" --status PUBLISHED`;
  try {
    const out = execSync(cmd, { cwd: 'C:\\Users\\Rebecca\\Projects\\code\\homemade', encoding: 'utf8', stdio: 'pipe' });
    const combined = out;
    if (/^\[upload-tutorial\] (CREATED|UPDATED)/m.test(combined)) {
      console.log('OK  ' + brief);
      pass++;
    } else {
      console.log('FAIL ' + brief);
      const errLines = combined.split('\n').filter(l => /ERROR|failed|Error/.test(l)).slice(0, 3);
      errLines.forEach(l => console.log('  ' + l));
      fail++;
      failed.push(brief);
    }
  } catch (e) {
    const combined = (e.stdout || '') + (e.stderr || '');
    if (/^\[upload-tutorial\] (CREATED|UPDATED)/m.test(combined)) {
      console.log('OK  ' + brief);
      pass++;
    } else {
      console.log('FAIL ' + brief);
      const errLines = combined.split('\n').filter(l => /ERROR|failed|Error/.test(l)).slice(0, 3);
      errLines.forEach(l => console.log('  ' + l));
      fail++;
      failed.push(brief);
    }
  }
}

console.log(`\n=== RESULT: ${pass} OK, ${fail} FAIL ===`);
if (failed.length) {
  console.log('Failed: ' + failed.join(', '));
}
