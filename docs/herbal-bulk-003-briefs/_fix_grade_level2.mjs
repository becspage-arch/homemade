/**
 * _fix_grade_level2.mjs — corrected grade-level fixer
 * Paths use raw array indices: body > paragraph[5] = body.content[5] (should be type=paragraph)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = __dirname;

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

const WORD_SUBS = [
  [/\butilise[sd]?\b/gi, 'use'],
  [/\butilize[sd]?\b/gi, 'use'],
  [/\bdemonstrat(e|ed|ing)\b/gi, 'show'],
  [/\bfacilitat(e|ed|ing)\b/gi, 'help'],
  [/\bsubsequently\b/gi, 'then'],
  [/\binitially\b/gi, 'at first'],
  [/\bindicates?\b/gi, 'shows'],
  [/\bsignificantly\b/gi, 'greatly'],
  [/\bapproximately\b/gi, 'about'],
  [/\baccordingly\b/gi, 'so'],
  [/\bconsequently\b/gi, 'as a result'],
  [/\bhowever,?\s/gi, 'but '],
  [/\bnevertheless\b/gi, 'even so'],
  [/\bthereafter\b/gi, 'after that'],
  [/\bprimarily\b/gi, 'mainly'],
  [/\bspecifically\b/gi, 'in particular'],
  [/\bparticularly\b/gi, 'especially'],
  [/\bsufficiently\b/gi, 'enough'],
  [/\bcharacteristically\b/gi, 'typically'],
  [/\bincorporate[sd]?\b/gi, 'include'],
  [/\bsuggests?\b/gi, 'points to'],
  [/\bpotential(?:ly)?\b/gi, 'possible'],
  [/\bassociated with\b/gi, 'linked to'],
  [/\badditionally\b/gi, 'also'],
  [/\bformulation\b/gi, 'preparation'],
  [/\btraditionally used\b/gi, 'long used'],
  [/\bconventionally\b/gi, 'usually'],
  [/\bpreparing\b/gi, 'making'],
];

function simplify(text) {
  let t = text;
  for (const [p, r] of WORD_SUBS) t = t.replace(p, r);
  // Split at semicolons
  t = t.replace(/;\s*/g, '. ').replace(/\.\s*\./g, '.');
  // Split at ", but "
  t = t.replace(/,\s+but\s+/gi, '. But ');
  // Split at ". However "
  t = t.replace(/\.\s+However,?\s+/gi, '. But ');
  // Split at ", because "
  t = t.replace(/,\s+because\s+/gi, '. This is because ');
  // Clean up
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function aggressiveSplit(text) {
  let t = simplify(text);
  // Split at long sentences at natural comma boundaries
  const parts = [];
  for (const sent of t.split(/(?<=[.!?])\s+/)) {
    const words = sent.split(/\s+/);
    if (words.length > 22) {
      // Find a comma after word 12-18
      let splitAt = -1;
      let pos = 0;
      for (let i = 0; i < words.length; i++) {
        if (words[i].endsWith(',') && i >= 10 && i <= 18) {
          splitAt = i;
          break;
        }
      }
      if (splitAt > 0) {
        const first = words.slice(0, splitAt + 1).join(' ').replace(/,$/, '.');
        const second = words.slice(splitAt + 1).join(' ');
        parts.push(first);
        if (second) parts.push(second.charAt(0).toUpperCase() + second.slice(1));
      } else {
        parts.push(sent);
      }
    } else {
      parts.push(sent);
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function fixGradeLevel(text) {
  if (!text) return text;
  const grade = fkGrade(text);
  if (grade === null || grade < 12.0) return text;

  let attempt = simplify(text);
  if ((fkGrade(attempt) ?? 99) < 12.0) return attempt;

  attempt = aggressiveSplit(attempt);
  if ((fkGrade(attempt) ?? 99) < 12.0) return attempt;

  return attempt; // Best effort
}

// Navigate body using RAW array index
function getBodyContentAt(body, pathStr) {
  // pathStr like "body > paragraph[5]" or "body > infoPanel[1]" or
  // "body > bulletList[4] > listItem[1] > paragraph[0]"
  const steps = pathStr.replace(/^body\s*>\s*/, '').split(/\s*>\s*/);
  let current = body;

  for (const step of steps) {
    if (!current) return null;
    const m = step.match(/^(\w+)\[(\d+)\]$/);
    if (!m) continue;
    const [, expectedType, idxStr] = m;
    const idx = parseInt(idxStr);
    const content = current.content || current;
    if (!Array.isArray(content)) return null;
    const node = content[idx];
    if (!node) return null;
    current = node;
  }

  return current;
}

function flattenNodeText(node) {
  if (!node) return '';
  if (typeof node.text === 'string' && node.type === 'text') return node.text;
  if (node.type === 'infoPanel' && node.attrs?.body) return node.attrs.body;
  if (Array.isArray(node.content)) return node.content.map(flattenNodeText).join('');
  return '';
}

function rewriteNodeText(node, newText) {
  if (!node) return false;
  if (node.type === 'infoPanel' && node.attrs && typeof node.attrs.body === 'string') {
    node.attrs.body = newText;
    return true;
  }
  if (Array.isArray(node.content)) {
    // Check if it's simple enough to rewrite (all text nodes, no complex marks)
    const allSimple = node.content.every(c => c.type === 'text');
    if (allSimple) {
      node.content = [{ type: 'text', text: newText }];
      return true;
    }
    // Complex: try to find and update the main text node
    let found = false;
    for (const child of node.content) {
      if (child.type === 'text' && !child.marks) {
        // Replace this text with the full new text (may lose marks context)
        // Only do this if it's the only text node
        if (node.content.filter(c => c.type === 'text' && !c.marks).length === 1) {
          child.text = newText;
          found = true;
        }
      }
    }
    if (!found) {
      // Last resort: replace entire content with simplified text
      node.content = [{ type: 'text', text: newText }];
      return true;
    }
    return found;
  }
  return false;
}

// Failing file+path pairs from second batch voice-check
const FAILING = [
  ['ashwagandha-tincture-for-burnout', 'body > infoPanel[1]'],
  ['calendula-profile', 'body > paragraph[5]'],
  ['calendula-profile', 'body > paragraph[7]'],
  ['calendula-profile', 'body > paragraph[12]'],
  ['calendula-profile', 'body > paragraph[15]'],
  ['calendula-profile', 'body > paragraph[16]'],
  ['chamomile-tincture-for-nervous-digestion', 'body > paragraph[0]'],
  ['chamomile-tincture-for-nervous-digestion', 'body > infoPanel[1]'],
  ['chamomile-tincture-for-nervous-digestion', 'body > paragraph[19]'],
  ['comfrey-salve-for-sprains', 'body > paragraph[0]'],
  ['echinacea-infusion-for-cold-onset', 'body > paragraph[0]'],
  ['echinacea-infusion-for-cold-onset', 'body > infoPanel[1]'],
  ['echinacea-infusion-for-cold-onset', 'body > paragraph[12]'],
  ['echinacea-profile', 'body > paragraph[3]'],
  ['echinacea-profile', 'body > paragraph[5]'],
  ['echinacea-profile', 'body > paragraph[7]'],
  ['echinacea-profile', 'body > paragraph[8]'],
  ['echinacea-profile', 'body > paragraph[10]'],
  ['echinacea-profile', 'body > paragraph[11]'],
  ['echinacea-profile', 'body > paragraph[13]'],
  ['echinacea-profile', 'body > paragraph[15]'],
  ['echinacea-profile', 'body > paragraph[16]'],
  ['elderberry-syrup', 'body > paragraph[12]'],
  ['ginger-profile', 'body > paragraph[5]'],
  ['ginger-profile', 'body > paragraph[7]'],
  ['ginger-profile', 'body > paragraph[8]'],
  ['ginger-profile', 'body > paragraph[9]'],
  ['ginger-profile', 'body > paragraph[15]'],
  ['ginseng-profile', 'body > paragraph[0]'],
  ['ginseng-profile', 'body > paragraph[4]'],
  ['ginseng-profile', 'body > paragraph[6]'],
  ['ginseng-profile', 'body > paragraph[8]'],
  ['ginseng-profile', 'body > paragraph[9]'],
  ['ginseng-profile', 'body > paragraph[12]'],
  ['ginseng-profile', 'body > paragraph[16]'],
  ['ginseng-profile', 'body > paragraph[17]'],
  ['hawthorn-berry-decoction', 'body > paragraph[11]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[8]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[11]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[12]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[14]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[16]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[21]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[23]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[24]'],
  ['herbal-medicine-and-drug-interactions', 'body > paragraph[26]'],
  ['holy-basil-tincture-for-chronic-stress', 'body > infoPanel[1]'],
  ['holy-basil-tincture-for-chronic-stress', 'body > paragraph[16]'],
  ['how-infused-oils-work', 'body > paragraph[1]'],
  ['lemon-balm-profile', 'body > paragraph[5]'],
  ['lemon-balm-profile', 'body > paragraph[6]'],
  ['lemon-balm-profile', 'body > paragraph[8]'],
  ['lemon-balm-profile', 'body > paragraph[9]'],
  ['lemon-balm-profile', 'body > paragraph[11]'],
  ['lemon-balm-profile', 'body > paragraph[12]'],
  ['lemon-balm-profile', 'body > paragraph[14]'],
  ['lemon-balm-profile', 'body > paragraph[15]'],
  ['nettle-seed-tincture-for-adrenal-fatigue', 'body > infoPanel[2]'],
  ['nettle-seed-tincture-for-adrenal-fatigue', 'body > paragraph[17]'],
  ['passionflower-infusion-for-sleeplessness', 'body > paragraph[0]'],
  ['passionflower-infusion-for-sleeplessness', 'body > infoPanel[1]'],
  ['passionflower-infusion-for-sleeplessness', 'body > paragraph[11]'],
  ['peppermint-profile', 'body > paragraph[5]'],
  ['peppermint-profile', 'body > paragraph[8]'],
  ['peppermint-profile', 'body > paragraph[9]'],
  ['peppermint-profile', 'body > paragraph[16]'],
  ['plantain-salve-for-minor-wounds', 'body > paragraph[14]'],
  ['rosemary-infusion-for-circulation', 'body > paragraph[11]'],
  ['rosemary-infusion-for-circulation', 'body > paragraph[12]'],
  ['sage-gargle-for-throat-infection', 'body > paragraph[11]'],
  ['sage-gargle-for-throat-infection', 'body > paragraph[12]'],
  ['sage-leaf-digestive-infusion', 'body > paragraph[11]'],
  ['sage-leaf-digestive-infusion', 'body > paragraph[12]'],
  ['st-johns-wort-infusion-for-low-mood', 'body > infoPanel[1]'],
  ['thyme-carminative-infusion', 'body > paragraph[11]'],
  ['thyme-gargle-for-sore-throat', 'body > paragraph[11]'],
  ['valerian-bath-for-bedtime-tension', 'body > paragraph[12]'],
  ['valerian-profile', 'body > paragraph[0]'],
  ['valerian-profile', 'body > paragraph[5]'],
  ['valerian-profile', 'body > paragraph[7]'],
  ['valerian-profile', 'body > paragraph[8]'],
  ['valerian-profile', 'body > paragraph[12]'],
  ['valerian-profile', 'body > paragraph[14]'],
  ['valerian-profile', 'body > paragraph[16]'],
  ['valerian-profile', 'body > paragraph[17]'],
  ['valerian-profile', 'body > paragraph[18]'],
  ['yarrow-infusion-for-fever-support', 'body > paragraph[11]'],
  ['yarrow-infusion-for-fever-support', 'body > paragraph[12]'],
  // Handle st-johns-wort troubleshooter separately
  ['st-johns-wort-infused-oil-for-nerve-pain', 'body > troubleshooter[21]'],
];

const docs = {};

for (const [slug, pathStr] of FAILING) {
  if (!docs[slug]) {
    try {
      docs[slug] = JSON.parse(readFileSync(join(BRIEFS_DIR, slug + '.json'), 'utf8'));
    } catch (e) {
      console.error('SKIP:', slug, e.message);
      continue;
    }
  }

  const doc = docs[slug];
  const steps = pathStr.replace(/^body\s*>\s*/, '').split(/\s*>\s*/);

  // Special handling for troubleshooter
  if (pathStr.includes('troubleshooter')) {
    const m = steps[0].match(/^troubleshooter\[(\d+)\]$/);
    if (m) {
      const node = doc.body.content[parseInt(m[1])];
      if (node && node.type === 'troubleshooter') {
        const items = node.attrs?.items;
        if (Array.isArray(items) && items[0]) {
          const cause = items[0].cause || '';
          if (cause) {
            const fixed = fixGradeLevel(cause);
            if (fixed !== cause) {
              items[0].cause = fixed;
              console.log(`  ${slug}: troubleshooter cause fixed`);
            }
          }
        }
      }
    }
    continue;
  }

  // Navigate using raw indices
  let current = doc.body;
  let success = true;
  for (const step of steps) {
    if (!current) { success = false; break; }
    const m = step.match(/^(\w+)\[(\d+)\]$/);
    if (!m) { success = false; break; }
    const [, type, idxStr] = m;
    const idx = parseInt(idxStr);
    const content = current.content || (current.type ? null : current);
    if (!Array.isArray(content)) { success = false; break; }
    const node = content[idx];
    if (!node) {
      console.warn(`  ${slug}: no node at ${step} (content length=${content.length})`);
      success = false; break;
    }
    current = node;
  }

  if (!success) continue;

  // Get the text of this node
  const text = flattenNodeText(current);
  const grade = fkGrade(text);
  if (grade === null || grade < 12.0) continue;

  const fixed = fixGradeLevel(text);
  const newGrade = fkGrade(fixed);
  if (fixed !== text) {
    rewriteNodeText(current, fixed);
    if ((newGrade ?? 99) >= 12.0) {
      console.log(`  ${slug} @ ${pathStr}: ${grade?.toFixed(1)} → ${newGrade?.toFixed(1)} (still high)`);
      console.log(`    "${text.slice(0, 80)}"`);
    }
  } else {
    console.log(`  ${slug} @ ${pathStr}: no change possible (grade=${grade?.toFixed(1)})`);
    console.log(`    "${text.slice(0, 80)}"`);
  }
}

// Write back all modified docs
for (const [slug, doc] of Object.entries(docs)) {
  writeFileSync(join(BRIEFS_DIR, slug + '.json'), JSON.stringify(doc, null, 2), 'utf8');
}

console.log(`\nDone. Wrote ${Object.keys(docs).length} files.`);
