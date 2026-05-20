#!/usr/bin/env node
// Fix all remaining voice-check errors in wood-natural-craft bulk-001 briefs.
// Run after fix-batch-014.js (which removed safety infoPanels).

const fs = require('fs');
const path = require('path');

const BRIEFS_DIR = path.join(__dirname, '..', 'docs', 'wood-natural-craft-bulk-001-briefs');

// --- Text-replacement fixes (operates on raw JSON string) ---
const TEXT_FIXES = {
  'carved-beech-bread-board.json': [
    [' beech — a ', ' beech, a '],
    [' available from any timber supplier — ', ' available from any timber supplier, '],
  ],
  'green-wood-vs-seasoned-wood.json': [
    ['contain water — sometimes', 'contain water, sometimes'],
    ['the other — will develop a twist', 'the other, will develop a twist'],
    ['The walls were uneven — one side', 'The walls were uneven: one side'],
  ],
  'thumb-pivot-cut-technique.json': [
    ['inside of a joint — all of these', 'inside of a joint: all of these'],
  ],
  'whittled-lime-spatula.json': [
    ['short, wide type — good for flipping and lifting — rather than', 'short, wide type (good for flipping and lifting) rather than'],
  ],
  'food-safe-wood-finishes.json': [
    ['genuinely food-safe once cured', 'food-safe once set'],
    ['The finish cures through oxidative', 'The finish hardens through oxidative'],
    ['the cure time is genuinely two weeks', 'the drying time is two weeks'],
    ['it cures harder and faster than raw linseed', 'it hardens more fully and faster than raw linseed'],
    ['the way a drying oil cures;', 'the way a drying oil hardens;'],
    ['there is no cure time', 'there is no drying time'],
  ],
  'mortise-tenon-oak-picture-frame.json': [
    ['the glue cures (four hours minimum)', 'the glue sets (four hours minimum)'],
    ['"Cure for two weeks.', '"Allow two weeks for the oil to set.'],
    ['after curing.', 'after setting.'],
  ],
  'push-cut-technique.json': [
    ['that is genuinely sharp:', 'that is sharp enough:'],
  ],
  'whittled-sycamore-letter-opener.json': [
    ['is genuinely used.', 'is actually used.'],
    ['"The form is essentially an elongated', '"The form is an elongated'],
  ],
};

let totalFixed = 0;

for (const [file, replacements] of Object.entries(TEXT_FIXES)) {
  const filePath = path.join(BRIEFS_DIR, file);
  let raw = fs.readFileSync(filePath, 'utf8');
  const before = raw;
  for (const [from, to] of replacements) {
    if (raw.includes(from)) {
      raw = raw.split(from).join(to);
      console.log('  ' + file + ': replaced "' + from.slice(0, 60) + '"');
      totalFixed++;
    } else {
      console.warn('  WARN: "' + from.slice(0, 60) + '" not found in ' + file);
    }
  }
  if (raw !== before) {
    fs.writeFileSync(filePath, raw);
    console.log('Saved: ' + file);
  }
}

console.log('\nTotal replacements: ' + totalFixed);
