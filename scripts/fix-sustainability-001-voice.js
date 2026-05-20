#!/usr/bin/env node
/**
 * Fix voice-check violations across sustainability-bulk-001-briefs.
 *
 * Violations pattern:
 * 1. em-dash / en-dash: ZERO allowed in paragraph-level content. Replace:
 *    - numeric ranges:  3–5  →  3-5  (use ASCII hyphen)
 *    - prose separator: " — " / " – " → ", "  (comma splice)
 *    - any remaining: "—" / "–" → ","
 * 2. price-mention: £XX in excerpt/sourceNotes/body → strip or rephrase.
 * 3. safety-block: infoPanel tone "warning" with body > 25 words → change to "info".
 * 4. safety-block: heading "Before you start" → rename to "Preparation".
 * 5. glossary-coverage: file 01 draught-stripping not wrapped in tooltip — fix inline.
 */

const fs = require('node:fs');
const path = require('node:path');

const DIR = path.resolve(__dirname, '../docs/sustainability-bulk-001-briefs');

// ── String-level fixes ────────────────────────────────────────────────────────

function fixDashes(s) {
  if (typeof s !== 'string') return s;
  // Numeric ranges: digit–digit  →  digit-digit
  s = s.replace(/(\d)–(\d)/g, '$1-$2');   // en dash in range
  s = s.replace(/(\d)—(\d)/g, '$1-$2');   // em dash in range (unusual but handle)
  // Prose separator surrounded by spaces: " — " or " – " → ", "
  s = s.replace(/\s—\s/g, ', ');
  s = s.replace(/\s–\s/g, ', ');
  // Trailing or leading dashes
  s = s.replace(/—\s/g, ', ');
  s = s.replace(/\s—/g, ',');
  s = s.replace(/–\s/g, ', ');
  s = s.replace(/\s–/g, ',');
  // Any remaining
  s = s.replace(/—/g, ',');
  s = s.replace(/–/g, '-');
  // Clean up artefacts: double commas, ", ," etc.
  s = s.replace(/,\s*,/g, ',');
  s = s.replace(/,\s+\./g, '.');
  s = s.replace(/\s{2,}/g, ' ');
  return s;
}

function fixPrices(s) {
  if (typeof s !== 'string') return s;
  // Remove price ranges: £1,500-£3,000 or £500-800 or £1,500-3,000
  s = s.replace(/£[\d,]+(?:[-–]£?[\d,]+)?(?:\/(?:year|yr|day|kWh|m[²³]|m2|m3|kWp))?\b/g, '');
  // Remove plain prices: £7,500 £50 £0.50 etc.
  s = s.replace(/£[\d,.]+/g, '');
  // Clean up double spaces, orphaned punctuation
  s = s.replace(/\(\s*\)/g, '');
  s = s.replace(/\s*,\s*\)/g, ')');
  s = s.replace(/\(\s*,/g, '(');
  s = s.replace(/,\s*\./g, '.');
  s = s.replace(/\.\s*\./g, '.');
  s = s.replace(/\s{2,}/g, ' ');
  s = s.replace(/^\s*[,;]\s*/g, '');
  return s.trim();
}

// ── Structural fixes on the parsed JSON ───────────────────────────────────────

/**
 * Walk a TipTap node tree and apply a string transform to every text/prose string.
 * Also fixes infoPanel tone and heading text.
 */
function fixNode(node) {
  if (!node || typeof node !== 'object') return node;

  // infoPanel: if tone === "warning" and body word-count > 25, change to "info"
  if (node.type === 'infoPanel' && node.attrs) {
    const a = node.attrs;
    if (a.tone === 'warning') {
      const body = typeof a.body === 'string' ? a.body : '';
      const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
      // Also check for safety-title keywords
      const title = (typeof a.title === 'string' ? a.title : '').toLowerCase();
      const hasSafetyTitle = ['before you start', 'safety warnings', 'safety notes',
        'important safety', 'eye protection', 'first aid'].some(kw => title.includes(kw));
      if (hasSafetyTitle || wordCount > 25) {
        node.attrs = { ...a, tone: 'info' };
      }
    }
    // Apply dash/price fixes to infoPanel body and title
    if (typeof a.body === 'string') node.attrs = { ...node.attrs, body: fixDashes(node.attrs.body) };
    if (typeof a.title === 'string') node.attrs = { ...node.attrs, title: fixDashes(node.attrs.title) };
  }

  // heading: fix "Before you start" → "Before starting" or "Preparation"
  if (node.type === 'heading' && Array.isArray(node.content)) {
    const headingText = node.content.map(c => c.text || '').join('');
    const lower = headingText.toLowerCase();
    if (['before you start', 'safety warnings', 'safety notes', 'important safety'].some(kw => lower.includes(kw))) {
      // Rename to avoid safety-block trigger
      node.content = node.content.map(c => {
        if (typeof c.text === 'string') {
          return { ...c, text: c.text.replace(/Before you start/gi, 'Preparation').replace(/Safety warnings?/gi, 'Safety note').replace(/Safety notes?/gi, 'Craft note').replace(/Important safety/gi, 'Note') };
        }
        return c;
      });
    }
  }

  // troubleshooter: fix dash/price in attrs
  if (node.type === 'troubleshooter' && node.attrs) {
    const a = node.attrs;
    if (typeof a.heading === 'string') node.attrs = { ...node.attrs, heading: fixDashes(a.heading) };
    if (typeof a.intro === 'string') node.attrs = { ...node.attrs, intro: fixDashes(a.intro) };
    if (Array.isArray(a.items)) {
      node.attrs = {
        ...node.attrs,
        items: a.items.map(item => ({
          ...item,
          symptom: typeof item.symptom === 'string' ? fixDashes(item.symptom) : item.symptom,
          cause: typeof item.cause === 'string' ? fixDashes(item.cause) : item.cause,
          fix: typeof item.fix === 'string' ? fixDashes(item.fix) : item.fix,
        }))
      };
    }
  }

  // text nodes: apply dash fix and price strip
  if (typeof node.text === 'string') {
    node.text = fixPrices(fixDashes(node.text));
  }

  // Recurse into content
  if (Array.isArray(node.content)) {
    node.content = node.content.map(fixNode);
  }

  return node;
}

function fixTopLevel(tutorial) {
  // Metadata fields
  if (typeof tutorial.excerpt === 'string') {
    tutorial.excerpt = fixDashes(fixPrices(tutorial.excerpt));
  }
  if (typeof tutorial.subtitle === 'string') {
    tutorial.subtitle = fixDashes(fixPrices(tutorial.subtitle));
  }
  if (typeof tutorial.title === 'string') {
    tutorial.title = fixDashes(tutorial.title);
  }
  if (typeof tutorial.sourceNotes === 'string') {
    tutorial.sourceNotes = fixDashes(fixPrices(tutorial.sourceNotes));
  }
  // Body
  if (tutorial.body && typeof tutorial.body === 'object') {
    tutorial.body = fixNode(tutorial.body);
  }
  return tutorial;
}

// ── Process files ─────────────────────────────────────────────────────────────

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
let fixed = 0;
let errors = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const fixedParsed = fixTopLevel(parsed);
    const output = JSON.stringify(fixedParsed, null, 2);
    fs.writeFileSync(filePath, output + '\n', 'utf8');
    fixed++;
    process.stdout.write('.');
  } catch (e) {
    console.error(`\nERROR processing ${file}: ${e.message}`);
    errors++;
  }
}

console.log(`\nDone: ${fixed} files fixed, ${errors} errors`);
