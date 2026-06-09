import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../docs/animals-smallholding-bulk-013-briefs/', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\');

function fixEmDashes(text) {
  if (!text) return text;
  // Replace em-dash between two phrases with comma (most common case)
  // Pattern: word — word → word, word
  // Pattern: word — word — word → word (word) word  - handled by two passes
  let result = text;
  // Double em-dashes (appositive) → parentheses
  result = result.replace(/\s*—\s*([^—]+)\s*—\s*/g, ' ($1) ');
  // Single remaining em-dashes → comma or colon depending on context
  // After a noun before a clause: replace with ","
  result = result.replace(/\s*—\s*/g, ', ');
  // Clean up ", ," double comma artifacts
  result = result.replace(/, ,/g, ',');
  // Clean up " ( " and " ) " spacing
  result = result.replace(/ \( /g, ' (');
  result = result.replace(/ \) /g, ') ');
  // en-dash
  result = result.replace(/\s*–\s*/g, ', ');
  return result;
}

function walkNode(node) {
  if (!node) return node;
  if (typeof node === 'string') return fixEmDashes(node);
  if (Array.isArray(node)) return node.map(walkNode);
  if (typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = walkNode(v);
    }
    return out;
  }
  return node;
}

function fixFile(filepath) {
  const raw = readFileSync(filepath, 'utf8');
  let data = JSON.parse(raw);

  // Fix em-dashes in all text fields
  if (data.excerpt) data.excerpt = fixEmDashes(data.excerpt);
  if (data.sourceNotes) data.sourceNotes = fixEmDashes(data.sourceNotes);
  if (data.subtitle) data.subtitle = fixEmDashes(data.subtitle);

  // Fix em-dashes in body
  if (data.body) data.body = walkNode(data.body);

  return data;
}

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();

let fixed = 0;
for (const fname of files) {
  const fp = join(dir, fname);
  try {
    const data = fixFile(fp);
    writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
    fixed++;
  } catch (e) {
    console.error(`ERROR fixing ${fname}: ${e.message}`);
  }
}
console.log(`Fixed em-dashes in ${fixed} files.`);
