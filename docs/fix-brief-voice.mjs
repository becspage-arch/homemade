// Fixes two voice-check issues in bulk-004 briefs:
// 1. em/en dashes in text nodes → commas or brackets
// 2. glossaryTerms not used inline → adds glossaryTooltip marks
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'paper-word-bulk-004-briefs');
const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();

function replaceEmDashInText(text) {
  // " — " and " – " → ", "
  return text.replace(/ [—–] /g, ', ').replace(/[—–]/g, ', ');
}

// Recursively walk all text nodes in the body and replace em-dashes
function fixEmDashesInNode(node) {
  if (!node) return node;
  if (node.type === 'text' && typeof node.text === 'string') {
    return { ...node, text: replaceEmDashInText(node.text) };
  }
  if (node.content && Array.isArray(node.content)) {
    return { ...node, content: node.content.map(fixEmDashesInNode) };
  }
  if (node.attrs) {
    const newAttrs = { ...node.attrs };
    if (typeof newAttrs.body === 'string') {
      newAttrs.body = replaceEmDashInText(newAttrs.body);
    }
    if (typeof newAttrs.title === 'string') {
      newAttrs.title = replaceEmDashInText(newAttrs.title);
    }
    if (Array.isArray(newAttrs.items)) {
      newAttrs.items = newAttrs.items.map(item => ({
        ...item,
        name: typeof item.name === 'string' ? replaceEmDashInText(item.name) : item.name,
        description: typeof item.description === 'string' ? replaceEmDashInText(item.description) : item.description,
      }));
    }
    return { ...node, attrs: newAttrs };
  }
  return node;
}

// Find all text in a node tree, returning { text, path } pairs
function collectTexts(node, path = []) {
  const results = [];
  if (!node) return results;
  if (node.type === 'text' && typeof node.text === 'string') {
    results.push({ text: node.text, path });
  }
  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child, i) => {
      results.push(...collectTexts(child, [...path, 'content', i]));
    });
  }
  return results;
}

// Add glossaryTooltip to the first occurrence of each term in a node
// Returns { node, found } - found is true if the term was wrapped
function wrapTermInNode(node, termSlug, termText, alreadyWrapped) {
  if (alreadyWrapped.has(termSlug)) return { node, found: true };

  if (!node) return { node, found: false };

  // Don't re-wrap text nodes that already have the mark
  if (node.type === 'text' && typeof node.text === 'string') {
    // Check if already has this glossaryTooltip mark
    if (node.marks && node.marks.some(m => m.type === 'glossaryTooltip' && m.attrs?.termSlug === termSlug)) {
      alreadyWrapped.add(termSlug);
      return { node, found: true };
    }

    // Try to find the term in this text node
    // Case-insensitive search
    const lowerText = node.text.toLowerCase();
    const lowerTerm = termText.toLowerCase();
    const idx = lowerText.indexOf(lowerTerm);

    if (idx !== -1) {
      // Found - split into before, marked, after
      const before = node.text.slice(0, idx);
      const matched = node.text.slice(idx, idx + termText.length);
      const after = node.text.slice(idx + termText.length);

      alreadyWrapped.add(termSlug);

      const markedNode = {
        type: 'text',
        text: matched,
        marks: [...(node.marks || []), { type: 'glossaryTooltip', attrs: { termSlug } }]
      };

      // Return an array of nodes to replace this one
      // We handle this by returning a special marker
      return {
        node: {
          __split: true,
          nodes: [
            ...(before ? [{ type: 'text', text: before, ...(node.marks?.length ? { marks: node.marks } : {}) }] : []),
            markedNode,
            ...(after ? [{ type: 'text', text: after, ...(node.marks?.length ? { marks: node.marks } : {}) }] : [])
          ]
        },
        found: true
      };
    }
    return { node, found: false };
  }

  if (node.content && Array.isArray(node.content)) {
    let found = false;
    const newContent = [];
    for (const child of node.content) {
      if (!alreadyWrapped.has(termSlug)) {
        const result = wrapTermInNode(child, termSlug, termText, alreadyWrapped);
        if (result.node.__split) {
          newContent.push(...result.node.nodes);
          found = true;
        } else {
          newContent.push(result.node);
          if (result.found) found = true;
        }
      } else {
        newContent.push(child);
      }
    }
    return { node: { ...node, content: newContent }, found };
  }

  return { node, found: false };
}

let totalFixed = 0;
let totalErrors = 0;

for (const file of files) {
  const filepath = join(dir, file);
  const raw = readFileSync(filepath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`PARSE ERROR: ${file}: ${e.message}`);
    totalErrors++;
    continue;
  }

  // Step 1: Fix em-dashes in body
  if (data.body) {
    data.body = fixEmDashesInNode(data.body);
  }

  // Step 2: Add glossaryTooltip marks for each glossary term
  const terms = data.glossaryTerms || [];
  const alreadyWrapped = new Set();

  for (const term of terms) {
    if (!term.slug || !term.term) continue;

    // Try the exact term text first, then any aliases
    const termTexts = [term.term];
    // Also try lowercase version

    let wrapped = false;
    for (const termText of termTexts) {
      if (data.body) {
        const result = wrapTermInNode(data.body, term.slug, termText, alreadyWrapped);
        if (result.found) {
          data.body = result.node;
          wrapped = true;
          break;
        }
      }
    }

    if (!wrapped) {
      // Term not found inline - this is a problem but we can't fix it without rewriting
      // Just log it
      console.log(`  WARN: ${file}: term "${term.term}" (${term.slug}) not found inline`);
    }
  }

  writeFileSync(filepath, JSON.stringify(data, null, 2));
  totalFixed++;
}

console.log(`\nProcessed ${totalFixed} files, ${totalErrors} errors`);
