import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'C:/Users/Rebecca/Projects/code/homemade/packages/db/scripts/briefs-crochet-bulk-005';

function fixText(s) {
  if (typeof s !== 'string') return s;

  // Fix specific UK/US stitch patterns first (most specific patterns)
  s = s.replace(/ — UK; single crochet \(sc\) in US/g, '. UK term; US equivalent is single crochet (sc)');
  s = s.replace(/ — UK; half double crochet \(hdc\) in US/g, '. UK term; US equivalent is half double crochet (hdc)');
  s = s.replace(/ — UK; double crochet \(dc\) in US/g, '. UK term; US equivalent is double crochet (dc)');
  s = s.replace(/ — UK; treble \(tr\) in US/g, '. UK term; US equivalent is treble (tr)');
  s = s.replace(/ — UK\. The US equivalent is single crochet \(sc\)\./g, '. UK term; US equivalent is single crochet (sc).');
  s = s.replace(/\. Called [\w ]+ in US\./g, '');

  // Fix "— try" in tips/infopanels
  s = s.replace(/ — try /g, '. Try ');
  s = s.replace(/ — try\b/gi, '. Try');

  // Fix "— approx"
  s = s.replace(/ — approx\./g, ', approx.');

  // Fix "— used to" (in stitch list items)
  s = s.replace(/ — used /g, '. Used ');
  s = s.replace(/ — Used /g, '. Used ');

  // Fix "— called"
  s = s.replace(/ — called /g, ', called ');

  // Fix sentence-starting cases "— This creates", "— The X", "— Each", "— If"
  s = s.replace(/ — (This|The|Each|If|In|At|By|Do|No|Never|Note|Use|Work|A |An ) /g, (_, w) => `. ${w} `);
  s = s.replace(/ — (this|the|each|if|in|at|by|do|no|never|note|use|work) /g, (_, w) => `. ${w[0].toUpperCase() + w.slice(1)} `);

  // Fix "— " before conjunction/preposition (comma substitution)
  s = s.replace(/ — (for|from|to|with|by|and|or|but|as|at|on|in|of|so|plus) /g, (_, w) => `, ${w} `);

  // Fix "— " introducing explanation (colon substitution)
  s = s.replace(/ — ([a-z])/g, ': $1');
  s = s.replace(/ — ([A-Z])/g, '. $1');

  // Fix any remaining em/en dashes
  s = s.replace(/ — /g, ', ');
  s = s.replace(/ – /g, ', ');
  s = s.replace(/—/g, ', ');
  s = s.replace(/–/g, ', ');

  // Fix "a tapestry" banned phrase
  s = s.replace(/\ba tapestry needle\b/g, 'the tapestry needle');
  s = s.replace(/\bA tapestry needle\b/g, 'The tapestry needle');

  // Clean up double commas, double spaces, ". ." etc.
  s = s.replace(/,\s*,/g, ',');
  s = s.replace(/\.\s*\./g, '.');
  s = s.replace(/  +/g, ' ');
  s = s.replace(/\. ([a-z])/g, (m, c) => `. ${c.toUpperCase()}`);

  return s;
}

function fixNode(obj) {
  if (typeof obj === 'string') return fixText(obj);
  if (Array.isArray(obj)) return obj.map(fixNode);
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = fixNode(v);
    }
    return result;
  }
  return obj;
}

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();
for (const fname of files) {
  const path = join(dir, fname);
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw);
  const fixed = fixNode(data);
  writeFileSync(path, JSON.stringify(fixed, null, 2) + '\n', 'utf-8');
  console.log(`Fixed: ${fname}`);
}

console.log('Done.');
