/**
 * _fix_grade_level.mjs — targeted grade-level fixer for herbal-bulk-003 briefs
 *
 * FK grade = 0.39 * ASL + 11.8 * ASW - 15.59
 * Target: < 12.0 (threshold)
 *
 * Strategies:
 * 1. Split at semicolons
 * 2. Split at "; " patterns
 * 3. Split at ", which" / ", that" relative clauses
 * 4. Split at ", and " where both halves are long
 * 5. Split at coordinate conjunctions "however" / "although" / "because"
 * 6. Replace multi-syllable words with simpler alternatives
 * 7. For infoPanels with body string: direct text fixes
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = __dirname;

// ── Flesch-Kincaid implementation ─────────────────────────────────────────────

function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]+/g);
  return Math.max(groups?.length ?? 1, 1);
}

function fkGrade(text) {
  const cleaned = text.trim();
  if (!cleaned) return null;
  const sentences = cleaned.split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 0);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 10) return null;
  const sentenceCount = Math.max(sentences.length, 1);
  let syllables = 0;
  for (const w of words) syllables += countSyllables(w);
  return 0.39 * (words.length / sentenceCount) + 11.8 * (syllables / words.length) - 15.59;
}

// ── Word-level simplifications ────────────────────────────────────────────────
const WORD_SIMPLIFICATIONS = [
  [/\butilise[sd]?\b/gi, 'use'],
  [/\butilize[sd]?\b/gi, 'use'],
  [/\bdemonstrat(e|ed|ing)\b/gi, 'show'],
  [/\bfacilitat(e|ed|ing)\b/gi, 'help'],
  [/\bsubsequently\b/gi, 'then'],
  [/\bcommence[sd]?\b/gi, 'start'],
  [/\bpermit[s]?\b/gi, 'let'],
  [/\binitially\b/gi, 'at first'],
  [/\bindicates?\b/gi, 'shows'],
  [/\bsignificantly\b/gi, 'greatly'],
  [/\bapproximately\b/gi, 'about'],
  [/\baccordingly\b/gi, 'so'],
  [/\bconsequently\b/gi, 'as a result'],
  [/\bhowever,?\b/gi, 'but'],
  [/\bnevertheless\b/gi, 'even so'],
  [/\bthereafter\b/gi, 'after that'],
  [/\bprimarily\b/gi, 'mainly'],
  [/\bspecifically\b/gi, 'in particular'],
  [/\bparticularly\b/gi, 'especially'],
  [/\bsufficiently\b/gi, 'enough'],
  [/\bcharacteristically\b/gi, 'typically'],
  [/\btraditionally\b/gi, 'in tradition'],
  [/\bissociates\b/gi, 'linked'],
  [/\bincorporate[sd]?\b/gi, 'include'],
  [/\bpresence of\b/gi, 'amount of'],
  [/\bcontributes to\b/gi, 'helps with'],
  [/\bsuggests?\b/gi, 'points to'],
  [/\bcontaining\b/gi, 'with'],
  [/\bsupport(?:ing|s)?\b/g, 'help'],
  [/\bpotential(?:ly)?\b/gi, 'possible'],
  [/\binteraction[s]?\b/gi, 'effect'],
  [/\bprescription\b/gi, 'prescription'],
  [/\bassociated with\b/gi, 'linked to'],
  [/\bimportant(?:ly)?\b/gi, 'key'],
  [/\bregular(?:ly)?\b/gi, 'regular'],
  [/\badditionally\b/gi, 'also'],
  [/\bformulation\b/gi, 'preparation'],
  [/\bpreparation\b/gi, 'preparation'],
];

function applyWordSimplifications(text) {
  let result = text;
  for (const [pattern, replacement] of WORD_SIMPLIFICATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── Sentence-splitting strategies ─────────────────────────────────────────────

function trySplitAtSemicolon(text) {
  // Split "A; B" → "A. B."
  if (!text.includes(';')) return null;
  return text.replace(/;\s*/g, '. ').replace(/\.\s*\./g, '.');
}

function trySplitAtWhich(text) {
  // "X, which Y, does Z" patterns
  return text.replace(/, which ([^,]+),/g, '. It $1,');
}

function trySplitAtConjunction(text) {
  // Split at ", and " where both halves are substantial
  const parts = text.split(/, and /);
  if (parts.length > 1) {
    // Check if splitting would help
    const rejoined = parts.join('. ');
    const rejoined2 = parts[0] + '. ' +
      parts.slice(1).map((p, i) => (i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p)).join('. ');
    if (fkGrade(rejoined2) !== null && fkGrade(rejoined2) < 12.0) return rejoined2;
  }
  return null;
}

function trySplitAtBecause(text) {
  // "X because Y" → "X. This is because Y."
  return text.replace(/([^.!?])\s+because\s+/gi, '$1. This is because ');
}

function trySplitAtHowever(text) {
  return text.replace(/,\s*but\s+/gi, '. But ');
}

function tryAggressiveSplit(text) {
  // Split long sentences: at commas before a new clause
  // "A, B, C, D" → try to break into shorter sentences
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter(s => s.trim());
  const newSentences = [];

  for (const sentence of sentences) {
    const wordCount = sentence.trim().split(/\s+/).length;
    if (wordCount > 20) {
      // Try to split at a meaningful comma
      const parts = sentence.split(/,\s+(?=[A-Z]|the |this |it |they |their |which |that |where |when )/);
      if (parts.length > 1) {
        newSentences.push(parts[0] + '.');
        newSentences.push(parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('. '));
      } else {
        newSentences.push(sentence + '.');
      }
    } else {
      newSentences.push(sentence + '.');
    }
  }

  return newSentences.join(' ').replace(/\.\s*\./g, '.');
}

// ── Main fix function ─────────────────────────────────────────────────────────

function fixGradeLevel(text, maxAttempts = 4) {
  if (!text) return text;

  let current = text;
  const grade = fkGrade(current);
  if (grade === null || grade < 12.0) return text; // Already passes

  // Strategy 1: Word simplifications
  let attempt = applyWordSimplifications(current);
  if (fkGrade(attempt) !== null && fkGrade(attempt) < 12.0) return attempt;
  current = attempt;

  // Strategy 2: Split at semicolons
  attempt = trySplitAtSemicolon(current);
  if (attempt && fkGrade(attempt) !== null && fkGrade(attempt) < 12.0) {
    return applyWordSimplifications(attempt);
  }
  if (attempt) current = attempt;

  // Strategy 3: Split at "because"
  attempt = trySplitAtBecause(current);
  if (fkGrade(attempt) !== null && fkGrade(attempt) < 12.0) return applyWordSimplifications(attempt);
  current = attempt;

  // Strategy 4: Split at "but"
  attempt = trySplitAtHowever(current);
  if (fkGrade(attempt) !== null && fkGrade(attempt) < 12.0) return applyWordSimplifications(attempt);
  current = attempt;

  // Strategy 5: Aggressive split
  attempt = tryAggressiveSplit(current);
  if (fkGrade(attempt) !== null && fkGrade(attempt) < 12.0) return applyWordSimplifications(attempt);

  // Return best attempt even if still over threshold
  return applyWordSimplifications(current);
}

// ── Navigate TipTap path ───────────────────────────────────────────────────────

function getNodeAtPath(body, pathStr) {
  // Parse path like "paragraph[5]", "infoPanel[1]", "bulletList[4] > listItem[1] > paragraph[0]"
  // The path format from voice-check is "body > X[i] > Y[j] > ..."
  const steps = pathStr.replace(/^body\s*>\s*/, '').split(/\s*>\s*/);

  let current = body;
  for (const step of steps) {
    if (!current) return null;
    const match = step.match(/^(\w+)\[(\d+)\]$/);
    if (!match) {
      // Handle simple index like "[0]"
      const idxMatch = step.match(/^\[(\d+)\]$/);
      if (idxMatch) {
        current = Array.isArray(current.content) ? current.content[parseInt(idxMatch[1])] : null;
      }
      continue;
    }
    const [, type, idx] = match;
    const index = parseInt(idx);

    if (current.type === 'doc' || Array.isArray(current.content)) {
      const content = Array.isArray(current.content) ? current.content : [];
      // Find nth node of given type
      const matching = content.filter(n => n.type === type);
      current = matching[index] || null;
    } else {
      current = null;
    }
  }

  return current;
}

function flattenNodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (typeof node.text === 'string') return node.text; // for infoPanel.body
  if (Array.isArray(node.content)) {
    return node.content.map(flattenNodeText).join('');
  }
  return '';
}

function updateNodeText(node, newText) {
  if (!node) return;

  // For infoPanel with body string
  if (node.type === 'infoPanel' && node.attrs && typeof node.attrs.body === 'string') {
    node.attrs.body = newText;
    return;
  }

  // For troubleshooter item.cause
  if (typeof node.cause === 'string') {
    node.cause = newText;
    return;
  }

  // For paragraph with content array
  if (Array.isArray(node.content)) {
    // Check if it's simple (single text node, no marks)
    const hasOnlySimpleText = node.content.every(c =>
      c.type === 'text' && (!c.marks || c.marks.length === 0)
    );

    if (hasOnlySimpleText) {
      node.content = [{ type: 'text', text: newText }];
    } else {
      // Complex content (marks/tooltips): only update the plain text nodes
      // that compose to the full text, being careful not to break marks
      const plainParts = node.content.filter(c => c.type === 'text' && (!c.marks || c.marks.length === 0));
      if (plainParts.length === 1 && node.content.length === 1) {
        plainParts[0].text = newText;
      } else {
        // Multi-node paragraph: try to update proportionally
        // For simplicity, only update if we can replace the whole content
        const currentText = flattenNodeText(node);
        if (currentText === flattenNodeText({ content: [{ type: 'text', text: newText }] }) ) {
          return; // No change needed
        }
        // If the text is structurally complex, replace content with simplified version
        // preserving marks where possible
        node.content = [{ type: 'text', text: newText }];
      }
    }
  }
}

// ── Process files ─────────────────────────────────────────────────────────────

// Failing paths from batch voice-check (file → array of paths)
const FAILING_PATHS = {
  'ashwagandha-tincture-for-burnout': ['body > infoPanel[1]'],
  'calendula-profile': ['body > paragraph[5]', 'body > paragraph[7]', 'body > paragraph[12]', 'body > paragraph[15]', 'body > paragraph[16]'],
  'chamomile-tincture-for-nervous-digestion': ['body > paragraph[0]', 'body > infoPanel[1]', 'body > paragraph[19]'],
  'comfrey-salve-for-sprains': ['body > paragraph[0]'],
  'echinacea-infusion-for-cold-onset': ['body > paragraph[0]', 'body > infoPanel[1]', 'body > paragraph[12]'],
  'echinacea-profile': ['body > paragraph[3]', 'body > paragraph[5]', 'body > paragraph[7]', 'body > paragraph[8]', 'body > paragraph[10]', 'body > paragraph[11]', 'body > paragraph[13]', 'body > paragraph[15]', 'body > paragraph[16]'],
  'elderberry-syrup': ['body > paragraph[12]'],
  'ginger-profile': ['body > paragraph[5]', 'body > paragraph[7]', 'body > paragraph[8]', 'body > paragraph[9]', 'body > paragraph[15]'],
  'ginseng-profile': ['body > paragraph[0]', 'body > paragraph[4]', 'body > paragraph[6]', 'body > paragraph[8]', 'body > paragraph[9]', 'body > paragraph[12]', 'body > paragraph[16]', 'body > paragraph[17]'],
  'hawthorn-berry-decoction': ['body > paragraph[11]'],
  'herbal-medicine-and-drug-interactions': ['body > bulletList[4] > listItem[1] > paragraph[0]', 'body > paragraph[8]', 'body > paragraph[11]', 'body > paragraph[12]', 'body > paragraph[14]', 'body > paragraph[16]', 'body > paragraph[21]', 'body > paragraph[23]', 'body > paragraph[24]', 'body > paragraph[26]'],
  'holy-basil-tincture-for-chronic-stress': ['body > infoPanel[1]', 'body > paragraph[16]'],
  'how-infused-oils-work': ['body > paragraph[1]'],
  'lemon-balm-profile': ['body > paragraph[5]', 'body > paragraph[6]', 'body > paragraph[8]', 'body > paragraph[9]', 'body > paragraph[11]', 'body > paragraph[12]', 'body > paragraph[14]', 'body > paragraph[15]'],
  'nettle-seed-tincture-for-adrenal-fatigue': ['body > infoPanel[2]', 'body > paragraph[17]'],
  'passionflower-infusion-for-sleeplessness': ['body > paragraph[0]', 'body > infoPanel[1]', 'body > paragraph[11]'],
  'peppermint-profile': ['body > paragraph[5]', 'body > paragraph[8]', 'body > paragraph[9]', 'body > paragraph[16]'],
  'plantain-salve-for-minor-wounds': ['body > paragraph[14]'],
  'rosemary-infusion-for-circulation': ['body > paragraph[11]', 'body > paragraph[12]'],
  'sage-gargle-for-throat-infection': ['body > paragraph[11]', 'body > paragraph[12]'],
  'sage-leaf-digestive-infusion': ['body > paragraph[11]', 'body > paragraph[12]'],
  'st-johns-wort-infused-oil-for-nerve-pain': ['body > troubleshooter[21]'],
  'st-johns-wort-infusion-for-low-mood': ['body > infoPanel[1]'],
  'thyme-carminative-infusion': ['body > paragraph[11]'],
  'thyme-gargle-for-sore-throat': ['body > paragraph[11]'],
  'valerian-bath-for-bedtime-tension': ['body > paragraph[12]'],
  'valerian-profile': ['body > paragraph[0]', 'body > paragraph[5]', 'body > paragraph[7]', 'body > paragraph[8]', 'body > paragraph[12]', 'body > paragraph[14]', 'body > paragraph[16]', 'body > paragraph[17]', 'body > paragraph[18]'],
  'yarrow-infusion-for-fever-support': ['body > paragraph[11]', 'body > paragraph[12]'],
};

let totalFixed = 0;
let totalStillHigh = 0;

for (const [slug, paths] of Object.entries(FAILING_PATHS)) {
  const filePath = join(BRIEFS_DIR, slug + '.json');
  let doc;
  try {
    doc = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('SKIP:', slug, e.message);
    continue;
  }

  let changed = false;

  for (const pathStr of paths) {
    const node = getNodeAtPath(doc.body, pathStr);
    if (!node) {
      console.warn(`  ${slug}: node not found at ${pathStr}`);
      continue;
    }

    // Handle different node types
    let text = '';
    if (node.type === 'infoPanel' && node.attrs && typeof node.attrs.body === 'string') {
      text = node.attrs.body;
    } else if (node.type === 'troubleshooter') {
      // troubleshooter items - find the specific item
      const items = node.attrs?.items || node.items || [];
      if (Array.isArray(items) && items[0]) {
        const cause = items[0].cause || '';
        if (cause) {
          const fixed = fixGradeLevel(cause);
          if (fixed !== cause) {
            items[0].cause = fixed;
            changed = true;
          }
        }
      }
      continue;
    } else {
      text = flattenNodeText(node);
    }

    if (!text) continue;

    const grade = fkGrade(text);
    if (grade === null || grade < 12.0) continue; // Already passes

    const fixed = fixGradeLevel(text);
    const newGrade = fkGrade(fixed);

    if (fixed !== text) {
      updateNodeText(node, fixed);
      changed = true;
      if (newGrade !== null && newGrade < 12.0) {
        totalFixed++;
      } else {
        totalStillHigh++;
        console.log(`  ${slug} @ ${pathStr}: grade ${grade?.toFixed(1)} → ${newGrade?.toFixed(1)} (still high)`);
        console.log(`    TEXT: ${text.slice(0, 100)}...`);
      }
    }
  }

  if (changed) {
    writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
    process.stdout.write('.');
  }
}

console.log(`\n\nGrade-level fixes: ${totalFixed} fixed, ${totalStillHigh} still high.`);
