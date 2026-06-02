/**
 * _fix_voice.mjs — batch voice-fix for herbal-bulk-003 briefs
 *
 * Handles:
 * 1. Clinical vocab replacement ("constituents"→"active compounds", etc.)
 * 2. Tooltip marks for "tincture" terms in tincture-specific REMEDY files
 * 3. Safety-block heading rename ("Important safety notes" → "Precautions")
 * 4. Historical-figure gloss (Culpeper, Grieve)
 * 5. Americanism fix ("fall" → "autumn")
 * 6. Plain-English replacement for clinical vocab not in glossaryTerms
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = __dirname;

// ── Text-level replacements (applied to all text nodes) ──────────────────────
// Order matters: longer phrases first to avoid partial replacements
const TEXT_REPLACEMENTS = [
  // Constituents
  [/\bactive constituents\b/gi, 'active compounds'],
  [/\bconstituents\b/gi, 'active compounds'],
  // Volatile oils
  [/\bvolatile-oils\b/gi, 'aromatic oils'],
  [/\bvolatile oils\b/gi, 'aromatic oils'],
  // Pharmacological
  [/\bpharmacological\b/gi, 'chemical'],
  [/\bpharmacology\b/gi, 'how herbs work'],
  // Anti-inflammatory (when NOT in glossaryTerms tooltip context)
  [/\banti-inflammatory\b/gi, 'calms swelling'],
  // Antispasmodic
  [/\bantispasmodic\b/gi, 'eases muscle spasm'],
  // Emmenagogue — blocked entirely
  [/\bemmenagogue\b/gi, 'traditionally used to ease menstrual cramping'],
  // Vulnerary
  [/\bvulnerary\b/gi, 'wound-healing'],
  // Diaphoretic — replace OR this is in glossaryTerms
  [/\bdiaphoretic\b/gi, 'sweat-supporting'],
  // Anodyne
  [/\banodyne\b/gi, 'pain-easing'],
  // Mucilage — replace with plain English
  [/\bmucilaginous\b/gi, 'coating and soothing'],
  [/\bmucilage\b/gi, 'soothing coating'],
  // Efficacy
  [/\befficacy\b/gi, 'how well it works'],
  // Materia medica (in body prose) — replace with "herb reference"
  [/\bmateria medica\b/gi, 'herb reference'],
  [/\bmateria-medica\b/gi, 'herb reference'],
  // Contraindication
  [/\bcontraindication[s]?\b/gi, 'cautions'],
  // Phytochemical
  [/\bphytochemical[s]?\b/gi, 'plant compounds'],
  // Western herbal canon
  [/\bwestern herbal canon\b/gi, 'western herbal tradition'],
  [/\bherbal canon\b/gi, 'herbal tradition'],
  // Monograph
  [/\bmonograph\b/gi, 'reference entry'],
  // Americanism
  [/\bfall\b(?=[^a-z])/g, 'autumn'],
  // Historical figures — add gloss if not already glossed
  [/\bCulpeper\b(?! ,| —|, the)/g, 'the 17th-century herbalist Nicholas Culpeper'],
  [/\bGrieve\b(?! ,|, the)/g, 'Maud Grieve, the early 20th-century botanical writer,'],
];

// These words need tooltips if in glossaryTerms; otherwise replace with plain English
const TOOLTIP_OR_REPLACE = {
  'tincture': { plain: 'alcohol extract', termSlug: 'tincture' },
  'maceration': { plain: 'soaking period', termSlug: 'maceration' },
  'decoction': { plain: 'simmered preparation', termSlug: 'decoction' },
  'nervine': { plain: 'nerve-calming', termSlug: 'nervine' },
  'adaptogen': { plain: 'stress-supporting', termSlug: 'adaptogen' },
  'carminative': { plain: 'wind-easing', termSlug: 'carminative' },
  'demulcent': { plain: 'coating and soothing', termSlug: 'demulcent' },
  'alterative': { plain: 'slow-acting system-supporter', termSlug: 'alterative' },
  'diuretic': { plain: 'helps the body pass water', termSlug: null }, // not in clinical vocab but let's be safe
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyTextReplacements(text) {
  let result = text;
  for (const [pattern, replacement] of TEXT_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Split a text string by a word boundary match, returning TipTap text nodes.
 * Optionally wraps matches in a glossaryTooltip mark.
 */
function splitTextByWord(text, word, termSlug, existingMarks = []) {
  const re = new RegExp(`(\\b${word}\\b)`, 'gi');
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const node = { type: 'text', text: text.slice(lastIndex, match.index) };
      if (existingMarks.length > 0) node.marks = [...existingMarks];
      parts.push(node);
    }
    const markedNode = {
      type: 'text',
      text: match[1],
      marks: [
        ...existingMarks,
        { type: 'glossaryTooltip', attrs: { termSlug } },
      ],
    };
    parts.push(markedNode);
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < text.length) {
    const node = { type: 'text', text: text.slice(lastIndex) };
    if (existingMarks.length > 0) node.marks = [...existingMarks];
    parts.push(node);
  }
  return parts;
}

/**
 * Walk a TipTap body, applying text replacements and tooltip injections.
 * Returns the modified body (mutated in place — copy first if needed).
 */
function fixBody(body, glossaryTermSlugs) {
  if (!body || typeof body !== 'object') return body;

  function walkNodes(nodes) {
    if (!Array.isArray(nodes)) return nodes;
    const result = [];
    for (const node of nodes) {
      if (node.type === 'text') {
        const hasTooltip = Array.isArray(node.marks) && node.marks.some(m => m?.type === 'glossaryTooltip');
        if (!hasTooltip) {
          let text = node.text || '';
          const existingMarks = Array.isArray(node.marks) ? node.marks.filter(m => m?.type !== 'glossaryTooltip') : [];

          // Check if this text contains any tooltip-or-replace terms
          let handledByTooltip = false;
          for (const [word, config] of Object.entries(TOOLTIP_OR_REPLACE)) {
            const re = new RegExp(`\\b${word}\\b`, 'i');
            if (re.test(text)) {
              if (config.termSlug && glossaryTermSlugs.has(config.termSlug)) {
                // Add tooltip marks
                const parts = splitTextByWord(text, word, config.termSlug, existingMarks);
                // Now process each part for other replacements
                for (const part of parts) {
                  if (part.type === 'text' && !(part.marks || []).some(m => m?.type === 'glossaryTooltip')) {
                    part.text = applyTextReplacements(part.text);
                    // Handle other tooltip terms in this part
                    result.push(...walkNodes([part]));
                  } else {
                    result.push(part);
                  }
                }
                handledByTooltip = true;
                break; // Handle one term at a time (recursive calls handle the rest)
              } else {
                // Replace with plain English
                text = text.replace(new RegExp(`\\b${word}s?\\b`, 'gi'), (match) => {
                  // Preserve pluralization if needed
                  if (match.endsWith('s') && !word.endsWith('s')) {
                    return config.plain + 's';
                  }
                  return config.plain;
                });
                // Don't break - there might be other terms to handle
              }
            }
          }

          if (!handledByTooltip) {
            // Apply all text replacements
            text = applyTextReplacements(text);
            const newNode = { type: 'text', text };
            if (existingMarks.length > 0) newNode.marks = existingMarks;
            result.push(newNode);
          }
        } else {
          result.push(node);
        }
      } else if (node.type === 'heading') {
        // Fix safety-block headings
        const fixedNode = { ...node };
        if (Array.isArray(node.content)) {
          fixedNode.content = node.content.map(child => {
            if (child.type === 'text') {
              const text = child.text || '';
              if (/important safety/i.test(text) || /safety notes/i.test(text)) {
                return { ...child, text: text.replace(/important safety notes/gi, 'Precautions').replace(/safety notes/gi, 'Precautions') };
              }
            }
            return child;
          });
        }
        result.push(fixedNode);
      } else if (node.content) {
        result.push({ ...node, content: walkNodes(node.content) });
      } else {
        result.push(node);
      }
    }
    return result;
  }

  // Also handle infoPanel attrs.body (string field)
  function walkDoc(node) {
    if (!node || typeof node !== 'object') return node;
    if (node.type === 'infoPanel' && node.attrs) {
      const newAttrs = { ...node.attrs };
      if (typeof newAttrs.body === 'string') {
        let bodyText = newAttrs.body;
        for (const [word, config] of Object.entries(TOOLTIP_OR_REPLACE)) {
          if (!config.termSlug || !glossaryTermSlugs.has(config.termSlug)) {
            bodyText = bodyText.replace(new RegExp(`\\b${word}s?\\b`, 'gi'), config.plain);
          }
        }
        newAttrs.body = applyTextReplacements(bodyText);
      }
      if (typeof newAttrs.title === 'string') {
        // Fix safety-block headings in infoPanel title
        if (/important safety/i.test(newAttrs.title) || /^safety notes/i.test(newAttrs.title)) {
          newAttrs.title = newAttrs.title.replace(/important safety notes/gi, 'Precautions').replace(/^safety notes/gi, 'Precautions');
        }
      }
      const fixedNode = { ...node, attrs: newAttrs };
      if (Array.isArray(node.content)) {
        fixedNode.content = walkNodes(node.content).map(walkDoc);
      }
      return fixedNode;
    }
    if (Array.isArray(node.content)) {
      return { ...node, content: walkNodes(node.content).map(walkDoc) };
    }
    return node;
  }

  if (body.type === 'doc' && Array.isArray(body.content)) {
    return walkDoc(body);
  }
  return body;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
let fixed = 0;
let skipped = 0;

for (const f of files) {
  const filePath = join(BRIEFS_DIR, f);
  let doc;
  try {
    doc = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('SKIP (parse error):', f, e.message);
    skipped++;
    continue;
  }

  const glossaryTermSlugs = new Set((doc.glossaryTerms || []).map(t => t.slug));

  // Fix the body
  if (doc.body) {
    doc.body = fixBody(doc.body, glossaryTermSlugs);
  }

  // Also fix sourceNotes (fix "Culpeper" in body only — already in sourceNotes is fine)
  // But don't touch sourceNotes

  writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
  fixed++;
  process.stdout.write('.');
}

console.log(`\n\nFixed ${fixed} files, skipped ${skipped}.`);
